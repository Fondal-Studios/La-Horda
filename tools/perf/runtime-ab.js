// MEDICIÓN A/B de ejecución (no es parte del juego): mismo escenario (piloto automático del Mago, CPU ×4, 844x390)
// contra dos sitios servidos, N corridas intercaladas, y reporta MEDIANAS por cuadro. El host es ruidoso: no mires una corrida.
//   node tools/perf/runtime-ab.js <urlA> <urlB> [arena=infernal] [corridas=5] [segundos=12]
//   urlA/urlB: base de cada sitio (p. ej. http://127.0.0.1:9320 = origin/main y http://127.0.0.1:9317 = rama)
// Por cuadro: update()+render() de JS (ms), tiempo de "UpdateLayoutTree" y "Layout" del hilo principal (ms) y escrituras
// al DOM (MutationObserver). Con CPU ×4 y sin GPU el rasterizado por software mete ruido: por eso se mira también el JS solo.
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path');
const [A, B] = [process.argv[2], process.argv[3]], ARENA = process.argv[4] || 'infernal', RUNS = +(process.argv[5] || 5), SECS = +(process.argv[6] || 12);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const med = a => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : 0; };
async function one(base) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { window.__campaignMode = true; });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/index.html?lazy=1&res=0.5`);
  for (let k = 0; k < 900; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; })) break; await sleep(100); }
  await page.addScriptTag({ path: path.join(__dirname, '../playtest/autopilot.js') });
  await page.evaluate((a) => { save.starterChosen = true; for (const k in save.champions) { save.champions[k].unlocked = true; save.champions[k].level = 30; } __AP.start('mago', a, 8); }, ARENA);
  await sleep(4000);
  await page.evaluate(() => {
    const T = window.__T = { js: [], frames: 0, writes: 0 };
    const u0 = window.update, r0 = window.render; let acc = 0;
    window.update = function () { const t = performance.now(); try { return u0.apply(this, arguments); } finally { acc = performance.now() - t; } };
    window.render = function () { const t = performance.now(); try { return r0.apply(this, arguments); } finally { T.js.push(acc + performance.now() - t); acc = 0; T.frames++; } };
    new MutationObserver(l => { T.writes += l.length; }).observe(document.body, { attributes: true, childList: true, characterData: true, subtree: true });
  });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const events = []; cdp.on('Tracing.dataCollected', d => events.push(...d.value));
  const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
  await cdp.send('Tracing.start', { categories: 'devtools.timeline', transferMode: 'ReportEvents' });
  for (let k = 0; k < SECS; k++) { await sleep(1000); await page.evaluate(() => { if (state === 'buff' && window.__AP && __AP.pickBuff) __AP.pickBuff(); }); }
  await cdp.send('Tracing.end'); await done;
  const T = await page.evaluate(() => window.__T);
  const fc = events.find(e => e.name === 'FunctionCall'); const tid = fc && fc.tid; const sum = {};
  for (const e of events) if (e.ph === 'X' && e.dur && e.tid === tid) sum[e.name] = (sum[e.name] || 0) + e.dur / 1000;
  await browser.close();
  const n = Math.max(1, T.frames);
  return { frames: T.frames, jsMs: med(T.js), jsAvg: T.js.reduce((a, b) => a + b, 0) / n, layoutTreeMsPerFrame: (sum.UpdateLayoutTree || 0) / n, layoutMsPerFrame: (sum.Layout || 0) / n, writesPerFrame: T.writes / n, errors: errors.slice(0, 2) };
}
(async () => {
  const R = { A: [], B: [] };
  for (let i = 0; i < RUNS; i++) for (const [k, u] of [['A', A], ['B', B]]) { const r = await one(u); R[k].push(r); console.log(k, JSON.stringify(r, (_, v) => typeof v === 'number' ? +v.toFixed(3) : v)); }
  for (const k of ['A', 'B']) console.log('MEDIANA ' + k + ' ' + ARENA, JSON.stringify(Object.fromEntries(['frames', 'jsMs', 'jsAvg', 'layoutTreeMsPerFrame', 'layoutMsPerFrame', 'writesPerFrame'].map(f => [f, +med(R[k].map(r => r[f])).toFixed(3)]))));
})();
