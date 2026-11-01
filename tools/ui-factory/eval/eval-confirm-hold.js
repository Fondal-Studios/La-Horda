'use strict';
// Evaluador (Módulo D): ¿aparece "confirm" cuando el lanzamiento ocurre al soltar tras mantener N ms? BASE=... node eval-confirm-hold.js
const { sleep, launch, VPS, newPage, PROFILE, center, fs } = require('./lib');
const INIT = () => { window.__ev = []; for (const n of ['uf:confirm','uf:reject']) window.addEventListener(n, e => window.__ev.push(n)); };
(async () => {
  const b = await launch(); const { ctx, page } = await newPage(b, process.env.BASE, VPS['844x390'], { init: INIT }); await page.evaluate(PROFILE); const cdp = await ctx.newCDPSession(page); const out = [];
  for (const hold of [100, 250, 400, 550, 700]) for (let k = 0; k < 2; k++) {
    await page.evaluate(() => { for (const ck in save.champions) { save.champions[ck].unlocked = true; save.champions[ck].level = 20; } selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; levelDuration = 1e9; player.energy = 1e4; player.cds = [0,0,0]; updateHUD(); window.__ev = []; }); await sleep(700);
    const c = await center(page, '#btn-s1');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await sleep(hold);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(900);
    out.push({ hold, executed: await page.evaluate(() => player.cds[0] > 0), events: await page.evaluate(() => window.__ev) });
  }
  console.log(JSON.stringify(out)); fs.writeFileSync(process.env.OUT, JSON.stringify(out, null, 1)); await b.close();
})();
