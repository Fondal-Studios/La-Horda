#!/usr/bin/env node
'use strict';
/* tools/art/build-art-atlas.js — ATLAS DE ARTE CLARO (la verdad del juego real, no de los archivos).
   Recorre el RUNTIME (Chromium + index.html?dev=1, igual que roster-loading-test) y emite
     docs/art/ATLAS_ARTE.json   todo, legible por máquina
     docs/art/ATLAS_ARTE.md     lo mismo para personas
   por campeón / skin / enemigo / jefe / arena / prop: archivo REALMENTE cargado (png o webp), dimensiones, clips y cuadros distintos,
   quién lo usa y estado (CODEX_OK / ARTE_VIEJO / FALTA_ANIMACION / HUERFANO; reglas en tools/art/lib/art-status.js).
   La referencia única de calidad es el Códice; el registro curado de qué atlas es el VIGENTE de cada campeón vive en
   docs/art/ATLAS_VIGENTE.json (a mano: cambiar un atlas es una decisión, no un efecto del generador).

   Uso (desde la raíz; NODE_PATH debe encontrar playwright):
     node tools/art/build-art-atlas.js                 regenera el JSON y el MD (abre Chromium, ~3-5 min)
     node tools/art/build-art-atlas.js --check         SIN navegador, apto para CI: el atlas committeado coincide con el repo
     node tools/art/build-art-atlas.js --bootstrap-vigente   crea docs/art/ATLAS_VIGENTE.json si no existe (a partir del runtime) */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const S = require('./lib/art-status');
const root = path.resolve(__dirname, '../..');
const OUT_JSON = path.join(root, 'docs/art/ATLAS_ARTE.json'), OUT_MD = path.join(root, 'docs/art/ATLAS_ARTE.md'), VIGENTE = path.join(root, 'docs/art/ATLAS_VIGENTE.json');
const AUDIT = path.join(root, 'docs/beta-release/AUDITORIA_ARTE_CAMPEONES.md');
const rel = p => path.relative(root, p).split(path.sep).join('/');
const sha1 = b => crypto.createHash('sha1').update(b).digest('hex');
function walk(dir, out = []) { if (!fs.existsSync(dir)) return out; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; }
// dimensiones de un PNG sin dependencias (cabecera IHDR) y de un WebP (VP8/VP8L/VP8X)
function imageSize(file) {
  try {
    const fd = fs.openSync(file, 'r'), b = Buffer.alloc(32); fs.readSync(fd, b, 0, 32, 0); fs.closeSync(fd);
    if (b.toString('latin1', 1, 4) === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
    if (b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') {
      const k = b.toString('latin1', 12, 16);
      if (k === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
      if (k === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
      if (k === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    }
  } catch (e) {}
  return null;
}
// Fuentes cuyo contenido define qué arte registra/elige el juego: si cambian, el atlas committeado queda viejo.
function sourceFiles() {
  const list = [...walk(path.join(root, 'js/assets')), ...walk(path.join(root, 'js/champions/ascension')),
    'js/rendering/champion-sprites.js', 'js/rendering/codex-champions.js', 'js/rendering/champion-art-normalize.js', 'js/rendering/enemy-sprites.js', 'js/systems/set-effects.js', 'js/data/champion-art-normalize.js', 'js/data/codex-content.js', 'docs/art/ATLAS_VIGENTE.json']
    .map(p => path.isAbsolute(p) ? p : path.join(root, p)).filter(p => fs.existsSync(p) && /\.(js|json)$/.test(p));
  return list.map(rel).sort();
}
function sourcesDigest() { const files = {}; for (const f of sourceFiles()) files[f] = sha1(fs.readFileSync(path.join(root, f))); return { hash: sha1(JSON.stringify(files)), files: Object.keys(files).length }; }
const CATS = [['champions', 'assets/sprites/champions/'], ['enemies', 'assets/sprites/enemies/'], ['bosses', 'assets/sprites/bosses/'], ['arenas', 'assets/sprites/arenas/'], ['battlefield', 'assets/sprites/battlefield/']];
const catOf = f => { for (const [c, p] of CATS) if (f.startsWith(p)) return c; return null; };
// PNG "canónicos" del repo (el .webp es una copia del PNG: se pliega en el mismo registro)
function diskFiles() {
  const out = new Map();
  for (const [, p] of CATS) for (const f of walk(path.join(root, p)).map(rel)) {
    if (!/\.(png|webp|jpg|jpeg)$/i.test(f)) continue;
    const png = f.replace(/\.webp$/, '.png');
    const o = out.get(png) || { path: png, png: false, webp: false };
    if (/\.webp$/.test(f)) o.webp = true; else o.png = true;
    out.set(png, o);
  }
  return out;
}
function referenceIndex() {
  const refs = new Map(), frag = new Set(); // ruta completa -> archivos js; fragmentos "dir/archivo.png" usados por los meta
  const files = [...walk(path.join(root, 'js')), ...walk(path.join(root, 'css')), path.join(root, 'index.html')].filter(p => /\.(js|css|html)$/.test(p) && !/asset-manifest\.js$|asset-webp\.js$/.test(p));
  const re = /[A-Za-z0-9_\-./]+\.(?:png|webp|jpe?g)/g;
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8'); let m;
    while ((m = re.exec(t))) {
      const s = m[0].replace(/\.webp$/, '.png'), i = s.indexOf('assets/');
      if (i >= 0) { const k = s.slice(i); (refs.get(k) || refs.set(k, []).get(k)).push(rel(f)); }
      const parts = s.split('/'); if (parts.length >= 2) frag.add(parts.slice(-2).join('/')); else frag.add(s);
    }
  }
  return { refs, frag };
}
function manifestSet() { const t = fs.readFileSync(path.join(root, 'js/assets/asset-manifest.js'), 'utf8'); return new Set([...t.matchAll(/"(assets\/[^"]+\.png)"/g)].map(m => m[1])); }
const loadedAs = (f, loaded) => (loaded.has(f.replace(/\.png$/, '.webp')) ? f.replace(/\.png$/, '.webp') : f);

/* ---------- construcción (con navegador) ---------- */
async function build() {
  const R = require('./lib/runtime-probe');
  if (!fs.existsSync(VIGENTE)) throw new Error('falta docs/art/ATLAS_VIGENTE.json (node tools/art/build-art-atlas.js --bootstrap-vigente)');
  const vig = JSON.parse(fs.readFileSync(VIGENTE, 'utf8'));
  const run = await R.measureAll({ lazy: true, withSkins: true, enemies: true, loaded: true });
  if (run.errors.length) throw new Error('errores de página: ' + run.errors.slice(0, 3).join(' | '));
  const loaded = new Set(run.loaded), dims = run.dims;
  const disk = diskFiles(), manifest = manifestSet(), ref = referenceIndex();
  const sizeOf = f => { const k = [loadedAs(f, loaded), f].find(x => dims[x]); return k ? dims[k] : (imageSize(path.join(root, f)) || null); };
  const atlasRec = f => {
    const w = f.replace(/\.png$/, '.webp'), asWebp = loaded.has(w) && fs.existsSync(path.join(root, w)), file = asWebp ? w : f;
    const st = fs.existsSync(path.join(root, file)) ? fs.statSync(path.join(root, file)) : null;
    return { file: f, loadedAs: asWebp ? 'webp' : 'png', size: sizeOf(f), bytes: st ? st.size : null };
  };
  const clipsOf = states => { const o = {}; for (const st of S.STATES) { o[st] = {}; for (const d of S.DIRS) o[st][d] = states[st][d].frames; } return o; };
  const audit = (() => { const t = fs.readFileSync(AUDIT, 'utf8'), o = {}; for (const m of t.matchAll(/^\| \d+ \| (\w+) \| (\d+) \|/gm)) o[m[1]] = +m[2]; return o; })();

  const champions = {}, skinsOut = {};
  for (const [id, c] of Object.entries(run.champions)) {
    const base = c.looks.find(l => l.label === 'base'), files = S.filesOf(base.states), gaps = S.gapsOf(base.states);
    const v = vig.champions[id] || { generation: 'viejo' };
    const status = S.championStatus(gaps, v);
    const usedBy = c.packs.map(p => p.key);
    champions[id] = { name: c.name || id, status, generation: v.generation, auditScore: audit[id] == null ? null : audit[id],
      vigente: v.atlas || [], atlases: files.map(atlasRec), packs: c.packs.map(p => ({ key: p.key, file: S.norm(p.src), ready: p.ready })), usedBy: ['CHAMP_PACK.' + usedBy.join(' / CHAMP_PACK.'), 'drawHeroBody (js/rendering/entities.js)'],
      clips: clipsOf(base.states), minFrames: S.minFrames(base.states), gaps, skins: [] };
    for (const l of c.looks) {
      if (l.label === 'base') continue;
      const lf = S.filesOf(l.states).filter(x => /^assets\//.test(x)), lg = S.gapsOf(l.states);
      const skinId = l.label.split(':')[1], viejo = vig.skinsViejos && vig.skinsViejos[skinId];
      const stt = viejo ? 'ARTE_VIEJO' : (lg.length ? 'FALTA_ANIMACION' : 'CODEX_OK');
      champions[id].skins.push({ id: skinId, kind: l.label.split(':')[0], status: stt, why: viejo || undefined, atlases: lf.map(atlasRec), clips: clipsOf(l.states), minFrames: S.minFrames(l.states), gaps: lg });
    }
  }
  // enemigos / jefes
  const enemies = {};
  for (const [t, e] of Object.entries(run.enemies || {})) {
    const status = S.enemyStatus(e);
    enemies[t] = { name: e.name, rank: e.rank, arena: e.arena, category: /jefe|subjefe/.test(e.rank) ? 'boss' : 'enemy', status, kind: e.walk ? e.walk.kind : null,
      atlases: (e.files || []).map(atlasRec), frames: e.err ? null : { idle: e.idle.frames, walk: e.walk.frames, attack: e.attack.frames, death: e.death.frames }, err: e.err || undefined };
  }
  // archivos (arenas, props, battlefield, enemigos, jefes y campeones) -> usado / huérfano
  const usedByRuntime = new Set([].concat(...Object.values(champions).map(c => c.atlases.map(a => a.file)), ...Object.values(champions).flatMap(c => c.skins.map(s => s.atlases.map(a => a.file))), ...Object.values(enemies).map(e => e.atlases.map(a => a.file))));
  const files = [];
  const champOf = f => (/^assets\/sprites\/champions\/([^/]+)\//.exec(f) || [])[1];
  for (const f of [...disk.keys()].sort()) {
    const cat = catOf(f), d = disk.get(f), loadedHit = loaded.has(f) || loaded.has(f.replace(/\.png$/, '.webp'));
    const refs = ref.refs.get(f) || [], parts = f.split('/'), fragHit = ref.frag.has(parts.slice(-2).join('/')) && !/^(atlas|preview)\.png$/.test(parts.slice(-2).join('/'));
    const usedBy = []; if (usedByRuntime.has(f)) usedBy.push('runtime(dibujado)'); if (refs.length) usedBy.push(...[...new Set(refs)].slice(0, 4)); if (manifest.has(f)) usedBy.push('ASSET_MANIFEST'); if (loadedHit && !usedBy.length) usedBy.push('runtime(cargado)');
    let status = 'CODEX_OK';
    if (cat === 'champions') {
      // campeones: la verdad es lo DIBUJADO por el cuerpo real (todas las apariencias y estados) o referenciado con su ruta completa
      const drawn = usedByRuntime.has(f), ch = champOf(f), isMedia = /\/(preview|set-preview)\.png$/.test(f);
      if (!drawn && !refs.length && !(isMedia && loadedHit)) status = 'HUERFANO';
      else if (drawn && champions[ch] && champions[ch].status === 'ARTE_VIEJO') status = 'ARTE_VIEJO';
    } else if (!loadedHit && !refs.length && !manifest.has(f) && !fragHit) status = 'HUERFANO';
    const st = fs.statSync(path.join(root, d.png ? f : f.replace(/\.png$/, '.webp')));
    files.push({ file: f, category: cat, size: sizeOf(f), bytes: st.size, webp: d.webp, loaded: loadedHit, usedBy, status });
  }
  const count = (arr, k) => arr.reduce((o, x) => (o[x[k]] = (o[x[k]] || 0) + 1, o), {});
  const doc = {
    schema: 1, generator: 'tools/art/build-art-atlas.js', reference: 'Códice (docs/LA_HORDA_CODEX.md); decisión curada en docs/art/ATLAS_VIGENTE.json',
    sources: sourcesDigest(), runtime: { url: 'index.html?dev=1&lazy=1 (producción: carga por grupos, webp activo)', loadedImages: loaded.size, sampling: '24 muestras por estado y dirección (down/side/left/up)' },
    summary: { champions: count(Object.values(champions), 'status'), championSkins: count(Object.values(champions).flatMap(c => c.skins), 'status'), enemies: count(Object.values(enemies).filter(e => e.category === 'enemy'), 'status'), bosses: count(Object.values(enemies).filter(e => e.category === 'boss'), 'status'), files: count(files, 'status') },
    champions, enemies, files
  };
  return doc;
}

// JSON legible y con diffs útiles: todo con sangría salvo `files`, un registro por línea.
function serialize(doc) { const { files, ...rest } = doc; const head = JSON.stringify(rest, null, 1); return head.slice(0, -2) + ',\n "files": [\n' + files.map(f => '  ' + JSON.stringify(f)).join(',\n') + '\n ]\n}\n'; }
/* ---------- MD ---------- */
const fmt = n => (n == null ? '-' : n);
const dimS = a => (a.size ? a.size[0] + 'x' + a.size[1] : '?');
function renderMd(doc) {
  const L = [];
  const sm = doc.summary, cnt = o => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(' · ') || '-';
  L.push('# Atlas de arte — qué carga el juego real', '', 'Generado por `node tools/art/build-art-atlas.js` (no editar a mano). Fuente de verdad: el runtime (Chromium, `index.html?dev=1&lazy=1`, webp activo); el detalle completo está en `ATLAS_ARTE.json`. Referencia única de calidad: el **Códice**. El atlas vigente de cada campeón se registra a mano en `ATLAS_VIGENTE.json`.', '');
  L.push('## Estados', '', '| Estado | Significado |', '|---|---|', '| CODEX_OK | Arte vigente de la generación Códice (o validado contra el Códice en la auditoría) y todos sus ciclos animados. En archivos sueltos: cargado/referenciado por el juego. |', '| ARTE_VIEJO | El juego dibuja arte anterior al Códice (o procedural/prestado). |', '| FALTA_ANIMACION | Un clip que debería ser ciclo sale con 1 cuadro (o, en enemigos, caminata de 2 cuadros o menos). |', '| HUERFANO | Archivo del repo que el juego ni carga ni referencia. |', '');
  L.push('## Resumen', '', `- Campeones: ${cnt(sm.champions)}`, `- Skins/cromas/formas de Ascensión: ${cnt(sm.championSkins)}`, `- Enemigos: ${cnt(sm.enemies)}`, `- Jefes y subjefes: ${cnt(sm.bosses)}`, `- Archivos (arenas, props, battlefield, enemigos, jefes, campeones): ${cnt(sm.files)}`, `- Fuentes del registro: ${doc.sources.files} archivos, huella \`${doc.sources.hash.slice(0, 12)}\``, '');
  L.push('## Campeones (cuerpo base)', '', 'Cuadros DISTINTOS medidos al dibujar el cuerpo real, mínimo entre las 4 direcciones (down/side/left/up). `hit` es una pose: 1 cuadro es válido. Brechas = estados que deberían ser ciclo con 1 cuadro.', '');
  L.push('| Campeón | Estado | Gen. | Atlas cargado (dim.) | idle | walk | atk | cast | ult | hit | death | Brechas |', '|---|---|---|---|--:|--:|--:|--:|--:|--:|--:|---|');
  for (const [id, c] of Object.entries(doc.champions)) {
    const m = c.minFrames, at = c.atlases.map(a => `\`${a.file.replace('assets/sprites/champions/', '')}\`${a.loadedAs === 'webp' ? ' (webp)' : ''} ${dimS(a)}`).join('<br>');
    L.push(`| ${id} | ${c.status} | ${c.generation}${c.auditScore != null ? ' (' + c.auditScore + ')' : ''} | ${at} | ${m.idle} | ${m.walk} | ${m.attack} | ${m.cast} | ${m.ultimate} | ${m.hit} | ${m.death} | ${c.gaps.join(', ') || '-'} |`);
  }
  L.push('', '## Skins, cromas y formas de Ascensión', '', '| Campeón | Apariencia | Tipo | Estado | Atlas | walk | atk | death | Brechas |', '|---|---|---|---|---|--:|--:|--:|---|');
  for (const [id, c] of Object.entries(doc.champions)) for (const s of c.skins) L.push(`| ${id} | ${s.id} | ${s.kind} | ${s.status} | ${s.atlases.map(a => '`' + a.file.replace('assets/sprites/champions/', '') + '` ' + dimS(a)).join('<br>') || '(procedural/recolor en memoria)'} | ${s.minFrames.walk} | ${s.minFrames.attack} | ${s.minFrames.death} | ${s.gaps.join(', ') || '-'}${s.why ? ' — ' + s.why : ''} |`);
  L.push('', '## Enemigos, élites, subjefes y jefes', '', 'Cuadros distintos de idle / caminata (perfil) / ataque / muerte medidos con `drawEnemyBody`. Detalle de clones y espejos: `tools/art/enemy_coverage.js`.', '', '| Tipo | Rango | Arena | Estado | Fuente | idle | walk | atk | death | Archivo(s) |', '|---|---|---|---|---|--:|--:|--:|--:|---|');
  for (const [t, e] of Object.entries(doc.enemies)) L.push(`| ${t} | ${e.rank} | ${e.arena} | ${e.status} | ${fmt(e.kind)} | ${e.frames ? e.frames.idle : '-'} | ${e.frames ? e.frames.walk : '-'} | ${e.frames ? e.frames.attack : '-'} | ${e.frames ? e.frames.death : '-'} | ${e.atlases.map(a => '`' + a.file.replace('assets/sprites/', '') + '` ' + dimS(a)).join('<br>') || (e.err || '-')} |`);
  const byCat = {}; for (const f of doc.files) { const c = byCat[f.category] || (byCat[f.category] = { n: 0, bytes: 0, huerfano: [], viejo: 0 }); c.n++; c.bytes += f.bytes; if (f.status === 'HUERFANO') c.huerfano.push(f.file); if (f.status === 'ARTE_VIEJO') c.viejo++; }
  L.push('', '## Arenas, props y demás archivos', '', 'Un registro por imagen (PNG; el `.webp` es su copia sin pérdida) en `ATLAS_ARTE.json` → `files`: dimensiones, si se carga, quién la usa y estado. Resumen:', '', '| Carpeta | Imágenes | MB | ARTE_VIEJO | HUERFANO |', '|---|--:|--:|--:|--:|');
  for (const [c, v] of Object.entries(byCat)) L.push(`| ${c} | ${v.n} | ${(v.bytes / 1048576).toFixed(1)} | ${v.viejo} | ${v.huerfano.length} |`);
  L.push('', '### Huérfanos (no los carga ni los referencia el juego; candidatos a limpieza, NO se borran acá)', '');
  const orph = doc.files.filter(f => f.status === 'HUERFANO'); L.push(orph.length ? orph.map(f => `- \`${f.file}\` ${f.size ? f.size[0] + 'x' + f.size[1] : ''}`).join('\n') : '- (ninguno)');
  const falta = []; for (const [id, c] of Object.entries(doc.champions)) { if (c.status === 'ARTE_VIEJO') falta.push(`- **${id}**: arte de generación anterior al Códice (puntaje de auditoría ${c.auditScore}); falta cuerpo Códice (\`codex-v1\`).`); if (c.gaps.length) falta.push(`- **${id}**: sin ciclo propio en ${c.gaps.join(', ')} (1 cuadro); falta animación nueva.`); }
  for (const [id, c] of Object.entries(doc.champions)) for (const s of c.skins) if (s.status !== 'CODEX_OK' && s.gaps.some(g => g !== 'idle')) falta.push(`- **${id}** / ${s.id} (${s.kind}): ${s.gaps.filter(g => g !== 'idle').join(', ')} con 1 cuadro.`);
  L.push('', '## Arte nuevo que falta (listado para producción)', '', falta.join('\n') || '- (nada)', '');
  return L.join('\n');
}

/* ---------- --check (sin navegador) ---------- */
function check() {
  const errs = [];
  if (!fs.existsSync(OUT_JSON)) { console.error('falta docs/art/ATLAS_ARTE.json: node tools/art/build-art-atlas.js'); process.exit(1); }
  const doc = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'));
  if (!fs.existsSync(VIGENTE)) errs.push('falta docs/art/ATLAS_VIGENTE.json');
  const vig = fs.existsSync(VIGENTE) ? JSON.parse(fs.readFileSync(VIGENTE, 'utf8')) : { champions: {} };
  // 1) el atlas committeado describe las fuentes actuales
  const cur = sourcesDigest();
  if (cur.hash !== doc.sources.hash) errs.push(`ATLAS_ARTE.json desactualizado: cambiaron los registros de arte (huella ${doc.sources.hash.slice(0, 12)} -> ${cur.hash.slice(0, 12)}). Regeneralo con: node tools/art/build-art-atlas.js`);
  // 2) el MD sale del JSON
  if (!fs.existsSync(OUT_MD) || fs.readFileSync(OUT_MD, 'utf8') !== renderMd(doc)) errs.push('docs/art/ATLAS_ARTE.md no coincide con ATLAS_ARTE.json (regeneralo)');
  // 3) cada archivo del atlas existe y con las mismas dimensiones/bytes
  const disk = diskFiles(), inDoc = new Set(doc.files.map(f => f.file));
  for (const f of doc.files) {
    const d = disk.get(f.file); if (!d) { errs.push('archivo del atlas que ya no existe: ' + f.file); continue; }
    const real = path.join(root, d.png ? f.file : f.file.replace(/\.png$/, '.webp')), st = fs.statSync(real);
    if (st.size !== f.bytes) errs.push(`cambió el archivo ${f.file} (${f.bytes} -> ${st.size} bytes): regenerar el atlas`);
    const sz = imageSize(real); if (sz && f.size && (sz[0] !== f.size[0] || sz[1] !== f.size[1])) errs.push(`dimensiones distintas en ${f.file}: ${f.size} -> ${sz}`);
  }
  for (const f of disk.keys()) if (!inDoc.has(f)) errs.push('archivo nuevo sin inventariar en el atlas: ' + f);
  // 4) cada campeón: sus atlas existen; el vigente existe; si hay arte codex-v* en disco, el juego tiene que cargarlo
  const reg = fs.readFileSync(path.join(root, 'js/assets/champion-sprites.js'), 'utf8') + ['portadores-meta', 'ynara-meta', 'codex-champion-meta'].map(n => fs.readFileSync(path.join(root, 'js/assets/' + n + '.js'), 'utf8')).join('\n');
  for (const [id, c] of Object.entries(doc.champions)) {
    const v = vig.champions[id]; if (!v) { errs.push(`${id}: no está en ATLAS_VIGENTE.json`); continue; }
    for (const a of v.atlas) if (!fs.existsSync(path.join(root, a))) errs.push(`${id}: atlas vigente inexistente ${a}`);
    const loadedFiles = new Set(c.atlases.map(a => a.file));
    for (const f of loadedFiles) if (!v.atlas.includes(f)) errs.push(`${id}: el runtime carga ${f}, que no está registrado como vigente`);
    const codexOnDisk = [...disk.keys()].filter(f => new RegExp('^assets/sprites/champions/' + id + '/codex-v\\d+/atlas\\.png$').test(f));
    for (const f of codexOnDisk) if (!loadedFiles.has(f)) errs.push(`${id}: existe arte Códice nuevo (${f}) pero el juego carga arte viejo`);
    if (c.status === 'CODEX_OK' && c.gaps.length) errs.push(`${id}: CODEX_OK con brechas de animación (${c.gaps})`);
    for (const f of c.vigente || []) if (!fs.existsSync(path.join(root, f))) errs.push(`${id}: vigente inexistente ${f}`);
  }
  // 5) registro estático: cada atlas de cuerpo base que el juego carga está registrado por alguna ruta del código (sin navegador)
  const jsText = walk(path.join(root, 'js')).filter(p => /\.js$/.test(p) && !/asset-manifest\.js$|asset-webp\.js$/.test(p)).map(p => fs.readFileSync(p, 'utf8')).join('\n');
  for (const [id, c] of Object.entries(doc.champions)) for (const a of c.atlases) if (!jsText.includes(a.file) && !jsText.includes(a.file.replace(/^assets\//, ''))) errs.push(`${id}: ${a.file} se dibuja pero ningún JS lo registra`);
  if (errs.length) { console.error('ATLAS_ARTE --check FALLÓ:\n - ' + errs.join('\n - ')); process.exit(1); }
  const s = doc.summary;
  console.log('ATLAS_ARTE --check OK', JSON.stringify({ champions: s.champions, bosses: s.bosses, enemies: s.enemies, files: s.files }));
}
/* ---------- bootstrap del registro vigente ---------- */
async function bootstrapVigente() {
  if (fs.existsSync(VIGENTE)) { console.error('ya existe docs/art/ATLAS_VIGENTE.json (se cura a mano)'); process.exit(1); }
  const R = require('./lib/runtime-probe'); const run = { data: (await R.measureAll({ lazy: true })).champions };
  const audit = {}; for (const m of fs.readFileSync(AUDIT, 'utf8').matchAll(/^\| \d+ \| (\w+) \| (\d+) \|/gm)) audit[m[1]] = +m[2];
  const out = { schema: 1, nota: 'Registro CURADO del atlas VIGENTE de cada campeón (cuerpo base). Lo que el juego carga tiene que estar acá (tests/art-runtime-clips.test.js). Cambiar un atlas = editar esto a propósito. generation: codex = atlas codex-v*; audit-fiel = validado contra el Códice en docs/beta-release/AUDITORIA_ARTE_CAMPEONES.md (puntaje >= 80); viejo = generación anterior, pendiente de cuerpo Códice. knownGaps = estados de ciclo con 1 cuadro conocidos (deuda): solo puede achicarse.', champions: {}, skinsViejos: {}, knownGaps: {} };
  for (const [id, c] of Object.entries(run.data)) {
    const base = c.looks[0], files = S.filesOf(base.states), gaps = S.gapsOf(base.states);
    const gen = files.some(f => /\/codex-v\d+\//.test(f)) ? 'codex' : ((audit[id] || 0) >= 80 ? 'audit-fiel' : 'viejo');
    out.champions[id] = { generation: gen, auditScore: audit[id] == null ? null : audit[id], atlas: files };
    if (gaps.length) out.knownGaps[id] = gaps;
  }
  fs.mkdirSync(path.dirname(VIGENTE), { recursive: true }); fs.writeFileSync(VIGENTE, JSON.stringify(out, null, 1) + '\n'); console.log('escrito', rel(VIGENTE));
}
(async () => {
  const a = process.argv.slice(2);
  if (a.includes('--check')) return check();
  if (a.includes('--bootstrap-vigente')) return bootstrapVigente();
  const doc = await build();
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, serialize(doc)); fs.writeFileSync(OUT_MD, renderMd(doc));
  console.log('escrito', rel(OUT_JSON), rel(OUT_MD), JSON.stringify(doc.summary));
})().catch(e => { console.error(e); process.exit(1); });
