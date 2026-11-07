'use strict';
/* tests/art-runtime-clips.test.js — el arte que el JUEGO REAL dibuja, no el que hay en disco.
   Falla si:
     1. un campeón del roster carga un clip de 1 cuadro donde debería haber ciclo (walk/attack/cast/ultimate/death; idle solo
        puede estar en la deuda conocida docs/art/ATLAS_VIGENTE.json -> knownGaps, que únicamente puede ACHICARSE),
     2. el runtime elige un atlas que no está registrado como vigente en docs/art/ATLAS_VIGENTE.json,
     3. existe arte Códice nuevo (carpeta codex-vN, atlas.png) en assets/ de un campeón y el juego sigue cargando otro,
     4. un campeón no registra su pack con la clave canónica CHAMP_PACK[classKey] (el Mago se registraba como "mago_codex" y su
        muerte quedaba congelada en un cuadro y se dibujaba el sprite viejo mientras bajaba el atlas),
     5. las skins de Ascensión (alt1/alt2) tienen ataque/lanzar congelados en un cuadro (proxy de ascBodyTarget sin estado).
   Se mide en las dos rutas de carga (?lazy=0 todo junto y ?lazy=1 producción) con webp activo. Uso: NODE_PATH=... node tests/art-runtime-clips.test.js */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const S = require('../tools/art/lib/art-status');
const R = require('../tools/art/lib/runtime-probe');
const root = path.resolve(__dirname, '..');
const vig = JSON.parse(fs.readFileSync(path.join(root, 'docs/art/ATLAS_VIGENTE.json'), 'utf8'));

// ---- la regla misma (sin navegador): una caminata de 1 cuadro tiene que contar como brecha ----
{
  const mk = n => ({ down: { frames: n, srcs: [], rawSrcs: [] }, side: { frames: n, srcs: [], rawSrcs: [] }, up: { frames: n, srcs: [], rawSrcs: [] }, left: { frames: n, srcs: [], rawSrcs: [] } });
  const full = { idle: mk(3), walk: mk(4), attack: mk(4), cast: mk(4), ultimate: mk(4), hit: mk(1), death: mk(4) };
  assert.deepEqual(S.gapsOf(full), [], 'un campeón completo no tiene brechas (hit de 1 cuadro es una pose válida)');
  assert.deepEqual(S.gapsOf(Object.assign({}, full, { walk: mk(1), death: mk(1) })), ['walk', 'death']);
  assert.deepEqual(S.gapsOf(Object.assign({}, full, { attack: Object.assign(mk(4), { up: { frames: 1, srcs: [], rawSrcs: [] } }) })), ['attack'], 'una sola dirección con 1 cuadro alcanza');
}
// ---- el registro curado es coherente con el disco ----
for (const [id, v] of Object.entries(vig.champions)) {
  for (const a of v.atlas) assert.ok(fs.existsSync(path.join(root, a)), `${id}: atlas vigente inexistente ${a}`);
  assert.ok(['codex', 'audit-fiel', 'viejo'].includes(v.generation), `${id}: generación inválida`);
  const codex = ['v1', 'v2', 'v3'].map(n => `assets/sprites/champions/${id}/codex-${n}/atlas.png`).filter(f => fs.existsSync(path.join(root, f)));
  for (const f of codex) assert.ok(v.atlas.includes(f), `${id}: hay arte Códice nuevo (${f}) y no es el atlas vigente (${v.atlas.join(', ')})`);
  if (codex.length) assert.equal(v.generation, 'codex', `${id}: tiene codex-v* en assets/ pero se registra como ${v.generation}`);
}
for (const [id, gaps] of Object.entries(vig.knownGaps)) assert.deepEqual(gaps.filter(g => g !== 'idle'), [], `${id}: solo el idle puede estar en la deuda conocida; ${gaps} exige arte/clips ya`);

(async () => {
  const rows = [];
  for (const mode of [{ name: 'lazy=0', lazy: false }, { name: 'lazy=1', lazy: true }]) {
    const run = await R.measureAll({ lazy: mode.lazy, skinKinds: mode.lazy ? ['asc'] : undefined });
    assert.deepEqual(run.errors, [], `${mode.name}: errores de página`);
    const ids = Object.keys(run.champions);
    assert.deepEqual(ids.sort(), Object.keys(vig.champions).sort(), `${mode.name}: el roster del juego y ATLAS_VIGENTE.json tienen que ser los mismos campeones`);
    for (const id of ids) {
      const c = run.champions[id], base = c.looks.find(l => l.label === 'base'), v = vig.champions[id];
      // 4) clave canónica y pack listo
      const pack = c.packs.find(p => p.key === id || p.key === 'codex_' + id);
      assert.ok(pack && pack.ready && !pack.failed, `${mode.name} ${id}: CHAMP_PACK["${id}"] no está registrado/listo (los caminos por classKey no lo ven)`);
      // 2) atlas elegido = vigente
      const files = S.filesOf(base.states);
      assert.ok(files.length, `${mode.name} ${id}: el cuerpo no dibuja ningún atlas de assets/`);
      for (const f of files) assert.ok(v.atlas.includes(f), `${mode.name} ${id}: el runtime dibuja ${f}, que no es un atlas vigente (${v.atlas.join(', ')})`);
      // 3) lo vigente se usa de verdad (si existe un codex-v*, es el que se dibuja)
      for (const a of v.atlas.filter(x => /\/codex-v\d+\//.test(x))) assert.ok(files.includes(a), `${mode.name} ${id}: existe ${a} y el juego no lo dibuja`);
      // 1) cuerpos sin ciclo
      const gaps = S.gapsOf(base.states), known = vig.knownGaps[id] || [];
      const nuevas = gaps.filter(g => !known.includes(g)), resueltas = known.filter(g => !gaps.includes(g));
      assert.deepEqual(nuevas, [], `${mode.name} ${id}: clip(s) de 1 cuadro donde debería haber ciclo: ${nuevas} (mín. de cuadros ${JSON.stringify(S.minFrames(base.states))})`);
      assert.deepEqual(resueltas, [], `${mode.name} ${id}: ${resueltas} ya tiene ciclo; quitalo de knownGaps en docs/art/ATLAS_VIGENTE.json (la deuda solo se achica)`);
      for (const l of c.looks.filter(l => l.label.startsWith('asc:'))) { // 5)
        const m = S.minFrames(l.states);
        for (const st of ['walk', 'attack', 'cast', 'ultimate', 'death']) assert.ok(m[st] >= 2, `${mode.name} ${id}/${l.label}: ${st} con ${m[st]} cuadro (ataque congelado)`);
      }
    }
    rows.push(`${mode.name}: ${ids.length} campeones OK`);
  }
  console.log(JSON.stringify({ status: 'PASS', checks: rows }));
})().catch(e => { console.error(e); process.exitCode = 1; });
