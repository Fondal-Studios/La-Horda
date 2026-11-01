'use strict';
// Cobertura de skins premium por campeón: meta = 3 skins por campeón (indicación del dueño).
// Lee el motor real (CLASSES, CROMA_SKINS, SET_SKINS, ASCENSION_SKINS). Una "skin premium" es toda apariencia comprada con Brasas
// (croma de paleta, skin de set de diseño propio, skin de Ascensión). No inventa nada: informa el faltante.
//   node tools/factory/skins-coverage.js [--base http://127.0.0.1:8812] → docs/art-factory/PREMIUM_SKINS_COVERAGE.{json,md}
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs'), path = require('path'), { spawn } = require('child_process'), http = require('http');
const ROOT = path.resolve(__dirname, '../..'), TARGET = 3;
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
(async () => {
  let base = arg('base'), srv = null;
  if (!base) { const port = 8700 + Math.floor(Math.random() * 200); srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); base = 'http://127.0.0.1:' + port; await new Promise(r => setTimeout(r, 1200)); }
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage();
  await p.addInitScript(() => { window.__campaignMode = true; });
  await p.goto(base + '/index.html?cov=' + Date.now()); await p.waitForFunction(() => typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 180000 });
  const data = await p.evaluate(() => {
    const rows = {};
    const row = k => rows[k || '_universal'] || (rows[k] = { champion: k, name: (CLASSES[k] && (CLASSES[k].shortName || CLASSES[k].name)) || k, croma: [], set: [], ascension: [] });
    for (const k of Object.keys(CLASSES)) row(k);
    for (const [id, d] of Object.entries(CROMA_SKINS)) row(d.champ).croma.push({ id, name: d.name, preview: d.preview || null });
    for (const [id, d] of Object.entries(SET_SKINS)) row(d.champ).set.push({ id, name: d.name, preview: d.preview || null });
    for (const [id, d] of Object.entries(ASCENSION_SKINS)) if (d && d.champ) row(d.champ).ascension.push({ id, name: d.name || id });
    return Object.values(rows);
  });
  await b.close(); if (srv) srv.kill();
  const fs_ = (f) => fs.existsSync(path.join(ROOT, f));
  for (const r of data) { r.total = r.croma.length + r.set.length + r.ascension.length; r.faltan = Math.max(0, TARGET - r.total);
    r.previewsOk = [...r.croma, ...r.set].every(s => !s.preview || fs_(s.preview)); }
  data.sort((a, b) => b.faltan - a.faltan || String(a.champion).localeCompare(String(b.champion)));
  const universal = data.filter(r => r.champion === '_universal'); data.splice(0, data.length, ...data.filter(r => r.champion !== '_universal'));
  const falta = data.reduce((s, r) => s + r.faltan, 0);
  const out = { meta: TARGET, campeones: data.length, con_meta: data.filter(r => r.faltan === 0).length, skins_faltantes_total: falta, filas: data };
  const dir = path.join(ROOT, 'docs/art-factory'); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'PREMIUM_SKINS_COVERAGE.json'), JSON.stringify(out, null, 1));
  const L = ['# Cobertura de skins premium (meta: 3 por campeón)', '', `Generado por \`tools/factory/skins-coverage.js\` sobre el motor real. ${out.campeones} campeones · ${out.con_meta} cumplen la meta · **faltan ${falta} skins** para llegar a ${TARGET} cada uno. Skins universales (sin campeón fijo): ${universal.reduce((n, r) => n + r.croma.length + r.set.length, 0)}.`, '',
    'Cuenta: croma (paleta) + skin de set (diseño propio) + skin de Ascensión. Un croma es el mismo cuerpo con otra paleta: **no equivale a un diseño nuevo** (ver `docs/ART_BIBLE.md`); la columna «diseño propio» separa lo que hace falta producir como arte nuevo.', '',
    '| Campeón | Croma | Set (diseño) | Ascensión | Total | Faltan | Previews |', '|---|---|---|---|---|---|---|'];
  for (const r of data) L.push(`| ${r.name} (\`${r.champion}\`) | ${r.croma.length} | ${r.set.length} | ${r.ascension.length} | ${r.total} | ${r.faltan} | ${r.previewsOk ? 'ok' : 'FALTA ARCHIVO'} |`);
  fs.writeFileSync(path.join(dir, 'PREMIUM_SKINS_COVERAGE.md'), L.join('\n') + '\n');
  console.log(JSON.stringify({ campeones: out.campeones, con_meta: out.con_meta, faltan: falta }));
})().catch(e => { console.error(e); process.exit(2); });
