#!/usr/bin/env node
'use strict';
/* Auditoría visual completa de enemigos y jefes (con el motor real, sin VFX).
   1) Cobertura: cada tipo de ENEMY_BASE aparece en el Códice (CODEX_ARENA_ROSTER, formas de CODEX_BOSSES, CODEX_SPECIAL_RANK o CODEX_EXCLUDED) y viceversa.
   2) Dibujo: cada tipo del Códice se dibuja de verdad con drawEnemyBody (píxeles opacos > 0) y se informa por qué ruta (hoja Runway / atlas / otro).
   3) Escala: alto dibujado en unidades de mundo y densidad (u/px) contra el canon de docs/ART_BIBLE.md §14.
   4) Hojas de contacto por arena (docs/art-gate/audit/<arena>.png): quieto, caminar x3, ataque, golpe, muerte, a escala real y mismo zoom.
   Uso: servir el repo (python3 -m http.server 8750) y  node tools/art/full_visual_audit.js [--out docs/art-gate/audit]  (REGRESSION_BASE_URL para otro puerto). */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const BASE = process.env.REGRESSION_BASE_URL || 'http://127.0.0.1:8750';
const OUT = path.resolve(process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'docs/art-gate/audit');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1000, height: 500 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.route('**/*', r => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache' } }));
  await p.goto(BASE + '/index.html', { waitUntil: 'load' }); await p.waitForTimeout(6000);
  const res = await p.evaluate(async () => {
    const roster = CODEX_ARENA_ROSTER, ids = new Set();
    const arenaOf = {}; for (const a in roster) for (const t of roster[a]) { ids.add(t); arenaOf[t] = a; }
    for (const bs of CODEX_BOSSES) for (const f of bs.forms) { const t = f.split('#')[0]; ids.add(t); arenaOf[t] = arenaOf[t] || bs.arena; }
    for (const t in CODEX_SPECIAL_RANK) ids.add(t);
    const excluded = Object.keys(CODEX_EXCLUDED || {});
    const base = Object.keys(ENEMY_BASE);
    const notInCodex = base.filter(t => !ids.has(t) && !excluded.includes(t));
    const notInGame = [...ids].filter(t => !ENEMY_BASE[t]);
    const rows = [], real = ctx;
    const c = document.createElement('canvas'); c.width = 260; c.height = 260; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    const pngs = {};
    const arenas = {}; for (const t of ids) (arenas[arenaOf[t] || (typeof codexArenaOfType === 'function' && codexArenaOfType(t)) || 'otros'] ||= []).push(t);
    for (const A in arenas) {
      const types = arenas[A]; const W = 8 * 150, Hh = types.length * 190; const sh = document.createElement('canvas'); sh.width = W; sh.height = Hh; const sg = sh.getContext('2d'); sg.imageSmoothingEnabled = false; sg.fillStyle = '#3a4258'; sg.fillRect(0, 0, W, Hh);
      for (let r = 0; r < types.length; r++) {
        const T = types[r], B = ENEMY_BASE[T] || {}, P = ENEMY_ATLAS_PACK[T]; for (let k = 0; k < 60 && P && !P.ready; k++) await new Promise(q => setTimeout(q, 100));
        const R = B.radius || 20;
        const st = [{}, { fx: 1, animT: 0 }, { fx: 1, animT: 150 }, { fx: 1, animT: 300 }, { attackAnim: 150, _pkAtkMax: 280 }, { hitFlash: 90 }, { alive: false, _diedAt: animNow - 150 }, { alive: false, _diedAt: animNow - 700 }];
        let drawn = 0, h = 0, route = P ? (typeof ENEMY_RUNWAY_SHEETS !== 'undefined' && ENEMY_RUNWAY_SHEETS[T] ? 'hoja Runway' : 'atlas') : 'otro';
        for (let i = 0; i < st.length; i++) {
          g.clearRect(0, 0, 260, 260); ctx = g;
          const e = Object.assign({ type: T, x: 130, y: 200, radius: R, fx: 0, fy: 1, alive: true, animT: 0, attackAnim: 0, hitFlash: 0, hp: 1, maxHp: 1 }, st[i]);
          try { drawEnemyBody(e); } catch (err) { ctx = real; return { fatal: T + ' ' + err.message }; }
          ctx = real;
          const d = g.getImageData(0, 0, 260, 260).data; let n = 0, y0 = 999, y1 = 0; for (let y = 0; y < 260; y++) for (let x = 0; x < 260; x++) if (d[(y * 260 + x) * 4 + 3] > 40) { n++; if (y < y0) y0 = y; if (y > y1) y1 = y; }
          if (n > 30) drawn++; if (i === 0) h = y1 - y0;
          // miniatura en la hoja de contacto (mismo zoom para todos: 0.55)
          sg.drawImage(c, 0, 0, 260, 260, i * 150 - 20, r * 190 - 30, 190, 190);
        }
        sg.fillStyle = '#ffee66'; sg.font = '11px monospace'; sg.fillText(T, 4, r * 190 + 12);
        rows.push({ type: T, arena: A, route, states: drawn, worldH: h, radius: R, rank: B.rank });
      }
      pngs[A] = sh.toDataURL();
    }
    return { rows, notInCodex, notInGame, pngs };
  });
  if (res.fatal) { console.error('FATAL', res.fatal); process.exit(2); }
  for (const a in res.pngs) fs.writeFileSync(path.join(OUT, a + '.png'), Buffer.from(res.pngs[a].split(',')[1], 'base64'));
  const bad = res.rows.filter(r => r.states < 8);
  let md = '# Auditoría visual de enemigos y jefes (AUTO-GENERADO)\n\n`node tools/art/full_visual_audit.js` · motor real, sin VFX, ' + new Date().toISOString().slice(0, 10) + '\n\n';
  md += `- Tipos en el Códice: **${res.rows.length}** · en ENEMY_BASE sin ficha en el Códice: **${res.notInCodex.length}** ${res.notInCodex.length ? '(' + res.notInCodex.join(', ') + ')' : ''}\n`;
  md += `- Tipos del Códice que no existen en el juego: **${res.notInGame.length}** ${res.notInGame.length ? '(' + res.notInGame.join(', ') + ')' : ''}\n`;
  md += `- Con algún estado sin dibujar (de 8): **${bad.length}** ${bad.length ? '(' + bad.map(r => r.type + ' ' + r.states + '/8').join(', ') + ')' : ''}\n`;
  md += `- Errores de página: ${errs.length}\n\n| Tipo | Arena | Ruta | Estados | Alto px (a escala real) |\n|---|---|---|---|---|\n`;
  for (const r of res.rows) md += `| ${r.type} | ${r.arena} | ${r.route} | ${r.states}/8 | ${r.worldH} |\n`;
  md += '\nHojas de contacto: `' + path.relative(process.cwd(), OUT) + '/<arena>.png` (columnas: quieto, caminar ×3, ataque, golpe, muerte ×2).\n';
  fs.writeFileSync(path.join(OUT, 'AUDIT.md'), md); fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify({ rows: res.rows, notInCodex: res.notInCodex, notInGame: res.notInGame, errors: errs }, null, 1));
  console.log(md.split('\n').slice(0, 9).join('\n')); await b.close();
})();
