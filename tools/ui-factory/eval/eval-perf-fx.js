'use strict';
// Evaluador (iteración 4): FPS con efectos por fotogramas activos (toques repetidos sobre Ataque/habilidades) vs base vs ?uf=0. OUT=...
const { sleep, launch, VPS, newPage, PROFILE, center, fs, path } = require('./lib');
const T = [['base', 'http://127.0.0.1:8882', ''], ['cand', 'http://127.0.0.1:8881', ''], ['cand-uf0', 'http://127.0.0.1:8881', '?uf=0']];
const REPS = +(process.env.REPS || 3);
(async () => { const b = await launch(); const out = []; 
 for (let r = 0; r < REPS; r++) for (const [L, base, q] of T) for (const mode of ['reposo', 'spam']) {
  const { ctx, page } = await newPage(b, base, VPS['844x390'], { query: q }); await page.evaluate(PROFILE); const cdp = await ctx.newCDPSession(page);
  await page.evaluate(() => { for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; } selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'guerrero']; netMatch = null; startRun(3); setState('playing'); updateHUD(); player.energy = 1e4; player.hp = 1e9; player.maxHp = 1e9; });
  await sleep(1500);
  const cb = await center(page, '#btn-basic'), c1 = await center(page, '#btn-s1');
  await page.evaluate(() => { window.__d = []; window.__go = true; let last = performance.now(); const f = t => { window.__d.push(t - last); last = t; if (window.__go) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const t0 = Date.now(); let n = 0;
  while (Date.now() - t0 < 8000) { if (mode === 'spam') { const c = n % 2 ? c1 : cb; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await sleep(60); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(90); n++; } else await sleep(150); }
  const d = await page.evaluate(() => { window.__go = false; return window.__d.slice(2); }); const s = d.slice().sort((a, b) => a - b); const sum = d.reduce((a, b) => a + b, 0);
  out.push({ rep: r, label: L, mode, taps: n, fps: +(1000 * d.length / sum).toFixed(1), p95: +s[Math.floor(s.length * .95)].toFixed(1), over50: s.filter(x => x > 50).length }); console.log(JSON.stringify(out[out.length - 1])); await ctx.close(); }
 fs.writeFileSync(process.env.OUT, JSON.stringify(out, null, 1)); await b.close(); })();
