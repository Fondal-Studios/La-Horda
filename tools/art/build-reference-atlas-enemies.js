#!/usr/bin/env node
'use strict';
/* Recorta del JUEGO REAL (drawEnemyBody, idle de frente) cada enemigo/élite/subjefe/jefe y lo guarda en art-source/reference-atlas/enemies/<tipo>.png (alfa, recortado al contenido).
   Después `python3 tools/art/build-reference-atlas-enemies.py` los lleva a una misma altura y arma las láminas docs/art/referencia/enemigos_*.png. */
const fs = require('fs'), path = require('path');
const P = require('./lib/runtime-probe');
const OUT = path.resolve(__dirname, '../../art-source/reference-atlas/enemies'); fs.mkdirSync(OUT, { recursive: true });
function inPageRef(arenaOf) {
  const S = 520, cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d', { willReadFrequently: true });
  const types = [];
  for (const t in ENEMY_BASE) {
    let a = (typeof codexArenaOfType === 'function' && codexArenaOfType(t)) || null;
    if (!a) for (const k in arenaOf) if (t.startsWith(k)) { a = arenaOf[k]; break; }
    if (a === 'divina' || !a) a = 'bosque';
    types.push({ t, arena: a, rank: ENEMY_BASE[t].rank || 'normal', name: ENEMY_BASE[t].name || t });
  }
  const byArena = {}; for (const x of types) (byArena[x.arena] = byArena[x.arena] || []).push(x);
  const out = [], saved = ctx;
  for (const arena of Object.keys(byArena)) {
    try { selectedClass = 'guerrero'; currentArena = arena; lobbyAllies = []; startRun(1); for (const h of heroes) h.invulnTimer = 1e9; } catch (e) {}
    for (const x of byArena[arena]) {
      let e; try { e = spawnEnemy(x.t, false, false); } catch (err) { out.push(Object.assign({}, x, { err: 'spawn ' + err.message })); continue; }
      enemies = enemies.filter(o => o !== e); if (typeof activeChampion !== 'undefined' && activeChampion === e) activeChampion = null;
      try {
        e.alive = true; e.fx = 1; e.fy = 0; e.animT = 0; e.attackAnim = 0; e.hitFlash = 0; e.stunTimer = 1; e.frozenTimer = 0; e.packSet = null; e.packTimer = 0;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, S); ctx = g; g.imageSmoothingEnabled = false; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        const k = Math.min(1, (S * 0.55) / ((e.radius || 20) * 4.5));
        g.save(); g.translate(S / 2, S * 0.78); g.scale(k, k); e.x = 0; e.y = 0; animNow = 100000; drawEnemyBody(e); g.restore(); ctx = saved;
        const d = g.getImageData(0, 0, S, S).data; let x0 = S, y0 = S, x1 = -1, y1 = -1;
        for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) if (d[(y * S + xx) * 4 + 3] > 40) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 < 0) { out.push(Object.assign({}, x, { err: 'vacío' })); continue; }
        const w = x1 - x0 + 1, h = y1 - y0 + 1, c2 = document.createElement('canvas'); c2.width = w; c2.height = h; c2.getContext('2d').drawImage(cv, x0, y0, w, h, 0, 0, w, h);
        out.push(Object.assign({}, x, { w, h, png: c2.toDataURL('image/png') }));
      } catch (ex) { ctx = saved; out.push(Object.assign({}, x, { err: ex.message })); }
    }
  }
  return out;
}
(async () => {
  const s = await P.launch('?dev=1&lazy=0'); try {
    await P.loadEverything(s.page, false);
    const ARENA = { cm_: 'ciudad', mn_: 'minas', ab_: 'abismo', lev_: 'acuatica', foco_hielo: 'hielo', foco_convergencia: 'infernal' };
    const r = await s.page.evaluate(inPageRef, ARENA); const meta = [];
    for (const x of r) { if (x.png) fs.writeFileSync(path.join(OUT, x.t + '.png'), Buffer.from(x.png.split(',')[1], 'base64')); meta.push({ t: x.t, name: x.name, arena: x.arena, rank: x.rank, w: x.w, h: x.h, err: x.err }); }
    fs.writeFileSync(path.join(OUT, '_index.json'), JSON.stringify(meta, null, 1));
    console.log('enemigos', meta.length, 'con error', meta.filter(m => m.err).map(m => m.t + ':' + m.err).join(', ') || 'ninguno', 'errores de página', s.errors.length);
  } finally { await s.close(); }
})();
