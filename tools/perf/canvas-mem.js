// MEDICIÓN de memoria de canvases (no es parte del juego): cuenta los <canvas>/OffscreenCanvas creados por el juego,
// cuántos siguen vivos y cuántos MB de píxeles ocupan (ancho×alto×4), agrupados por el archivo que los creó.
//   node tools/perf/canvas-mem.js [arena=bosque] [segundos=8]      env: PERF_URL_BASE (default http://127.0.0.1:9317)
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path');
const BASE = process.env.PERF_URL_BASE || 'http://127.0.0.1:9317', ARENA = process.argv[2] || 'bosque', SECS = +(process.argv[3] || 8);
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--js-flags=--expose-gc'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    window.__campaignMode = true;
    const reg = window.__cv = [];
    const where = () => { const s = (new Error().stack || '').split('\n').slice(3).find(l => /\/js\//.test(l)) || ''; const m = /\/js\/([^:)]+:\d+)/.exec(s); return m ? m[1] : '?'; };
    const track = c => { reg.push({ r: new WeakRef(c), w: where() }); return c; };
    const ce = document.createElement.bind(document);
    document.createElement = function (t, o) { const e = ce(t, o); if (String(t).toLowerCase() === 'canvas') track(e); return e; };
    const OC = window.OffscreenCanvas;
    if (OC) window.OffscreenCanvas = class extends OC { constructor(w, h) { super(w, h); track(this); } };
  });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${BASE}/index.html?lazy=1`);
  for (let k = 0; k < 600; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; })) break; await sleep(100); }
  const snap = () => page.evaluate(() => { gc && gc(); return new Promise(res => setTimeout(() => {
    const by = {}; let n = 0, px = 0, total = 0;
    for (const e of window.__cv) { total++; const c = e.r.deref(); if (!c) continue; const p = c.width * c.height; n++; px += p; const o = by[e.w] || (by[e.w] = { n: 0, px: 0 }); o.n++; o.px += p; }
    const top = Object.entries(by).sort((a, b) => b[1].px - a[1].px).slice(0, 12).map(([k, v]) => `${(v.px * 4 / 1048576).toFixed(1)}MB x${v.n} ${k}`);
    res({ creados: total, vivos: n, MB: +(px * 4 / 1048576).toFixed(1), top, heapMB: +(performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0).toFixed(1) });
  }, 200)); });
  console.log('TITULO', JSON.stringify(await snap()));
  await page.addScriptTag({ path: path.join(__dirname, '../playtest/autopilot.js') });
  await page.evaluate((a) => { save.starterChosen = true; for (const k in save.champions) { save.champions[k].unlocked = true; save.champions[k].level = 30; } __AP.start('mago', a, 8); }, ARENA);
  await sleep(SECS * 1000);
  const r = await snap(); console.log('JUGANDO ' + ARENA, JSON.stringify({ ...r, top: undefined })); console.log(r.top.join('\n'));
  if (errors.length) console.log('errores', errors.slice(0, 3));
  await browser.close();
})();
