'use strict';
// RENDIMIENTO main vs rama: (a) costo de CPU de render() por cuadro en una escena densa (16 enemigos, ult, botín, peligros),
// medido en bucle cerrado (independiente del vsync), alternando A/B/A/B para repartir el ruido; (b) cuadros reales (rAF) en combate.
//   node tools/beta/perf.js --main <dir-de-main> [--runs 3] [--out docs/beta/perf.json]
const fs = require('fs'), path = require('path');
const { chromium, ROOT, serve, sleep, ready } = require('./lib');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const MAIN = arg('main'), RUNS = +arg('runs', 3), OUT = arg('out', path.join(ROOT, 'docs/beta/perf.json'));
if (!MAIN) { console.error('falta --main <dir>'); process.exit(2); }
const stat = a => { const s = [...a].sort((x, y) => x - y), q = p => s[Math.min(s.length - 1, Math.floor(s.length * p))]; return { n: s.length, mean: a.reduce((x, y) => x + y, 0) / a.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), max: s[s.length - 1] }; };
async function once(base) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
  await ctx.addInitScript(() => { window.__campaignMode = true; let n = 117; Math.random = () => { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; return (n >>> 0) / 4294967296; }; window.__fr = []; let l = 0; const f = t => { if (l) window.__fr.push(t - l); l = t; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/index.html?p=' + Date.now(), { waitUntil: 'load', timeout: 180000 }); await ready(page);
  await page.addScriptTag({ path: path.join(ROOT, 'tools/playtest/autopilot.js') });
  const r = await page.evaluate(async () => {
    for (const c of Object.values(save.champions)) c.unlocked = true;
    selectedClass = 'cazadora'; currentArena = 'bosque'; startRun(1); __AP.on = true; __AP.skill = 0.9;
    for (let i = 0; i < 16; i++) spawnEnemy(i % 5 === 0 ? 'bestia_bosque' : 'duende_bosque', false, false);
    // avanzar la partida (sin dibujar) hasta tener una escena de combate real
    for (let i = 0; i < 600; i++) { if (state === 'buff') __AP.pickBuff(); if (state !== 'playing') break; update(16.7); }
    const real = window.groundLootRollTier; let want = 'legendario'; window.groundLootRollTier = () => want;
    ['raro', 'muyraro', 'legendario', 'mitico'].forEach((t, i) => { want = t; groundLootDrop(player.x - 120 + i * 80, player.y - 90, 'S', 1, 'bosque', 'jefe', false, null, null); });
    window.groundLootRollTier = real;
    bossStrike(player.x + 80, player.y, 56, 60000, 0, 'root', { stun: 0 }); bossStrike(player.x - 90, player.y + 20, 56, 60000, 0, 'root', { stun: 0 });
    runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); player.ultCharge = player.ultMax; player.ultCd = 0;
    // (a) costo de render() en bucle cerrado, con la escena en movimiento (update entre cuadros, sin medir el update)
    const costs = []; for (let i = 0; i < 40; i++) { update(16.7); render(); } // calentar
    for (let i = 0; i < 360; i++) { if (state === 'buff') __AP.pickBuff(); if (state !== 'playing') break; update(16.7); const t0 = performance.now(); render(); costs.push(performance.now() - t0); }
    return { costs, enemies: enemies.length };
  });
  await page.evaluate(() => { window.__fr.length = 0; });
  await sleep(8000);
  const fr = await page.evaluate(() => window.__fr.slice(5));
  await browser.close();
  return { render: stat(r.costs), frames: stat(fr), over33: fr.filter(v => v > 33.4).length / fr.length, enemies: r.enemies, errors };
}
(async () => {
  const a = await serve(MAIN), b = await serve(ROOT); const res = { main: [], beta: [], runs: RUNS };
  try { for (let i = 0; i < RUNS; i++) { const m = await once(a.base); res.main.push(m); const x = await once(b.base); res.beta.push(x); console.log('run', i + 1, 'main render mean', m.render.mean.toFixed(2), 'p95', m.render.p95.toFixed(2), '| beta', x.render.mean.toFixed(2), 'p95', x.render.p95.toFixed(2), '| frames p95', m.frames.p95.toFixed(1), x.frames.p95.toFixed(1)); } }
  finally { a.stop(); b.stop(); }
  const med = (arr, f) => { const v = arr.map(f).sort((x, y) => x - y); return v[Math.floor(v.length / 2)]; };
  res.summary = { renderMeanMs: { main: med(res.main, r => r.render.mean), beta: med(res.beta, r => r.render.mean) }, renderP95Ms: { main: med(res.main, r => r.render.p95), beta: med(res.beta, r => r.render.p95) },
    frameP95Ms: { main: med(res.main, r => r.frames.p95), beta: med(res.beta, r => r.frames.p95) }, over33: { main: med(res.main, r => r.over33), beta: med(res.beta, r => r.over33) } };
  res.summary.renderDeltaMs = res.summary.renderMeanMs.beta - res.summary.renderMeanMs.main;
  res.summary.errors = [...res.main, ...res.beta].flatMap(r => r.errors);
  res.note = 'Chromium headless con render por software (SwiftShader): sirve para COMPARAR main vs rama, no como cifra absoluta de un teléfono.';
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res.summary, null, 1));
})().catch(e => { console.error(e); process.exit(2); });
