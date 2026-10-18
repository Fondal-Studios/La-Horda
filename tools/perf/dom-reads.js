// MEDICIÓN de escrituras al DOM por cuadro (MutationObserver) y de lecturas de layout por cuadro (no es parte del juego): cuenta getBoundingClientRect / offsetWidth /
// clientWidth / getComputedStyle / measureText durante la partida y las agrupa por quien las llama.
//   node tools/perf/dom-reads.js [arena=bosque] [segundos=10]      env: PERF_URL_BASE (default http://127.0.0.1:9317)
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path');
const BASE = process.env.PERF_URL_BASE || 'http://127.0.0.1:9317', ARENA = process.argv[2] || 'bosque', SECS = +(process.argv[3] || 10);
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { window.__campaignMode = true; });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${BASE}/index.html?lazy=1&res=0.5`);
  for (let k = 0; k < 600; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; })) break; await sleep(100); }
  await page.addScriptTag({ path: path.join(__dirname, '../playtest/autopilot.js') });
  await page.evaluate((a) => { save.starterChosen = true; for (const k in save.champions) { save.champions[k].unlocked = true; save.champions[k].level = 30; } __AP.start('mago', a, 8); }, ARENA);
  await sleep(3000);
  await page.evaluate(() => {
    const C = window.__reads = { frames: 0, by: {} };
    const where = () => { const s = (new Error().stack || '').split('\n').slice(3).find(l => /\/js\//.test(l)) || ''; const m = /\/js\/([^:)]+:\d+)/.exec(s); return m ? m[1] : '?'; };
    const hit = n => { const k = n + ' @ ' + where(); C.by[k] = (C.by[k] || 0) + 1; };
    const wrapM = (proto, name) => { const f = proto[name]; proto[name] = function () { hit(name); return f.apply(this, arguments); }; };
    wrapM(Element.prototype, 'getBoundingClientRect'); wrapM(window, 'getComputedStyle'); wrapM(CanvasRenderingContext2D.prototype, 'measureText');
    for (const [P, n] of [[HTMLElement.prototype, 'offsetWidth'], [HTMLElement.prototype, 'offsetHeight'], [Element.prototype, 'clientWidth'], [Element.prototype, 'clientHeight']]) {
      const d = Object.getOwnPropertyDescriptor(P, n); if (!d || !d.get) continue; Object.defineProperty(P, n, { configurable: true, get() { hit(n); return d.get.call(this); } });
    }
    const W = window.__writes = {}; const label = n => (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).join('.') : '') || n.nodeName;
    new MutationObserver(list => { for (const m of list) { const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (!t) continue; const k = m.type + (m.attributeName ? ':' + m.attributeName : '') + ' ' + t.nodeName.toLowerCase() + label(t).slice(0, 60); W[k] = (W[k] || 0) + 1; } }).observe(document.body, { attributes: true, childList: true, characterData: true, subtree: true });
    const r0 = window.render; window.render = function () { C.frames++; return r0.apply(this, arguments); };
  });
  await sleep(SECS * 1000);
  const C = await page.evaluate(() => window.__reads);
  const rows = Object.entries(C.by).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${(v / C.frames).toFixed(2).padStart(7)}/cuadro  ${k}`);
  console.log(`cuadros ${C.frames}, total lecturas/cuadro ${(Object.values(C.by).reduce((a, b) => a + b, 0) / C.frames).toFixed(1)}`); console.log(rows.join('\n'));
  const Wr = await page.evaluate(() => window.__writes);
  console.log('escrituras al DOM por cuadro:'); console.log(Object.entries(Wr).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${(v / C.frames).toFixed(2).padStart(7)}/cuadro  ${k}`).join('\n'));
  if (errors.length) console.log('errores', errors.slice(0, 3));
  await browser.close();
})();
