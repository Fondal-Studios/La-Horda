// MEDICIÓN del arranque de partida (no es parte del juego): desde que se pide empezar la run hasta 3 s después,
// con CPU ×4, cuántos "long tasks" (>50 ms) hubo, cuánto suman y cuál fue el mayor. Mediana de N corridas por sitio.
//   node tools/perf/run-start.js <urlBaseA> <urlBaseB> [arena=bosque] [corridas=5]
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path');
const [A, B] = [process.argv[2], process.argv[3]], ARENA = process.argv[4] || 'bosque', RUNS = +(process.argv[5] || 5);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const med = a => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
async function one(base) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { window.__campaignMode = true; });
  const page = await ctx.newPage();
  await page.goto(`${base}/index.html?lazy=1&res=0.5`);
  for (let k = 0; k < 900; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; })) break; await sleep(100); }
  await page.addScriptTag({ path: path.join(__dirname, '../playtest/autopilot.js') });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate(() => { const L = window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) L.push(e.duration); }).observe({ entryTypes: ['longtask'] }); });
  if (process.env.PROFILE) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp.send('Profiler.start'); }
  await page.evaluate((a) => { save.starterChosen = true; for (const k in save.champions) { save.champions[k].unlocked = true; save.champions[k].level = 30; } window.__t0 = performance.now(); __AP.start('mago', a, 8); }, ARENA);
  await sleep(3500);
  const r = await page.evaluate(() => ({ lt: window.__lt, state }));
  if (process.env.PROFILE) { const { profile } = await cdp.send('Profiler.stop'); const by = new Map(profile.nodes.map(n => [n.id, n])), self = new Map(); let tot = 0;
    profile.samples.forEach((id, i) => { const f = by.get(id).callFrame, k = (f.functionName || '(anónima)') + ' ' + (f.url ? f.url.replace(/^.*\/js\//, '') + ':' + (f.lineNumber + 1) : ''); const d = (profile.timeDeltas[i] || 0) / 1000; self.set(k, (self.get(k) || 0) + d); tot += d; });
    const par = new Map(); for (const n of profile.nodes) for (const c of (n.children || [])) par.set(c, n.id);
    const who = new Map(); profile.samples.forEach((id, i) => { const f = by.get(id).callFrame; if (!/^(getImageData|putImageData|drawImage)$/.test(f.functionName)) return; let p = par.get(id), k = ''; for (let d = 0; p && d < 2; d++, p = par.get(p)) { const g = by.get(p).callFrame; k += ' < ' + g.functionName + ' ' + g.url.replace(/^.*\/js\//, '') + ':' + (g.lineNumber + 1); } who.set(f.functionName + k, (who.get(f.functionName + k) || 0) + (profile.timeDeltas[i] || 0) / 1000); });
    console.log('--- llamadores de getImageData/drawImage ---'); for (const [k, v] of [...who.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(v.toFixed(0).padStart(7) + ' ms  ' + k);
    console.log('--- perfil del arranque (tiempo propio, ms con CPU x4) ---'); for (const [k, v] of [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(v.toFixed(0).padStart(7) + ' ms  ' + k); }
  await browser.close();
  return { n: r.lt.length, sum: r.lt.reduce((a, b) => a + b, 0), max: Math.max(0, ...r.lt) };
}
(async () => {
  const R = { A: [], B: [] };
  for (let i = 0; i < RUNS; i++) for (const [k, u] of [['A', A], ['B', B]]) R[k].push(await one(u));
  for (const k of ['A', 'B']) console.log('MEDIANA ' + k + ' ' + ARENA, JSON.stringify({ longTasks: med(R[k].map(r => r.n)), sumMs: Math.round(med(R[k].map(r => r.sum))), maxMs: Math.round(med(R[k].map(r => r.max))) }), JSON.stringify(R[k].map(r => Math.round(r.max))));
})();
