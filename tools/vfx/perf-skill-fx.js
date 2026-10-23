'use strict';
/* Costo por cuadro de los sprites de efecto de habilidad (mitad A): mismo escenario con SFA_OFF=true (sin sprites, con los
   efectos genéricos de antes) y SFA_OFF=false (sprites propios), alternados dos veces por campeón para absorber la deriva.
   Horda de 150 enemigos, las 3 habilidades y la definitiva lanzadas en bucle durante 5 s de render real; mide el tiempo de
   render() (CPU, no vsync) y el de update(). Chromium sin cabeza no es un teléfono: son números relativos, no una certificación.
   Uso: BASE_URL=http://127.0.0.1:PORT/ [ONLY=a,b] [SECS=5] node tools/vfx/perf-skill-fx.js   -> docs/vfx/perf-skill-fx.json */
const fs = require('node:fs'), path = require('node:path'), {spawn} = require('node:child_process');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), PORT = +(process.env.PORT || 8975);
const server = process.env.BASE_URL ? null : spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {cwd: ROOT, stdio: 'ignore'});
const BASE = process.env.BASE_URL || `http://127.0.0.1:${PORT}/`;
process.on('exit', () => server && server.kill());
(async () => {
  await new Promise(r => setTimeout(r, server ? 700 : 0));
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport: {width: 844, height: 390}}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
    await page.waitForFunction(() => typeof startRun === 'function' && typeof sfaPush === 'function' && assetsAllReady(), null, {timeout: 120000});
    await page.waitForTimeout(1500);
    let keys = await page.evaluate(() => Object.keys(SFA_BIND).sort());
    if (process.env.ONLY) keys = keys.filter(k => process.env.ONLY.split(',').includes(k));
    const secs = +(process.env.SECS || 5), rows = [];
    for (const k of keys) {
      const res = {key: k, off: [], on: []};
      for (const mode of (rows.length ? ['off', 'on', 'off', 'on'] : ['warm', 'off', 'on', 'off', 'on'])) {
        const m = await page.evaluate(async ([k, off, secs]) => {
          window.SFA_OFF = off;
          for (const c in save.champions) Object.assign(save.champions[c], {unlocked: true, level: 20});
          selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago'].filter(x => x !== k); startRun(3); enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9;
          for (let i = 0; i < 150; i++) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + Math.cos(i) * (80 + i * 2), y: player.y + Math.sin(i * 1.3) * (60 + i), hp: 1e9, maxHp: 1e9, dmg: 0}); }
          document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')); state = 'playing';
          await new Promise(r => setTimeout(r, 1600)); // deja hornear en tiempo ocioso
          const rs = [], us = [], oR = window.render, oU = window.update; let poolMax = 0, frames = 0;
          window.render = function () { const t = performance.now(); const r = oR.apply(this, arguments); rs.push(performance.now() - t); return r; };
          window.update = function () { const t = performance.now(); const r = oU.apply(this, arguments); us.push(performance.now() - t); return r; };
          const t0 = performance.now();
          await new Promise(res => { const tick = () => { frames++; if (frames % 18 === 1) { player.cds = [0, 0, 0]; player.energy = 999; player.ultCharge = player.ultMax; player.ultCd = 0; for (let i = 0; i < 3; i++) castAbility(player, player.cls.skills[i], false, i); if (frames % 90 === 1) castAbility(player, player.cls.ultimate, true); }
            poolMax = Math.max(poolMax, sfaPool.length); if (performance.now() - t0 < secs * 1000) requestAnimationFrame(tick); else res(); }; requestAnimationFrame(tick); });
          window.render = oR; window.update = oU; window.SFA_OFF = false;
          const q = (a, f) => { const s = a.slice(5).sort((x, y) => x - y); return +s[Math.floor(s.length * f)].toFixed(3); }, mean = a => +(a.slice(5).reduce((x, y) => x + y, 0) / Math.max(1, a.length - 5)).toFixed(3);
          state = 'menu';
          return {renderMean: mean(rs), renderP95: q(rs, .95), updateMean: mean(us), frames: rs.length, poolMax, baked: sfaStats.baked, bakeMs: +sfaStats.bakeMs.toFixed(1)};
        }, [k, mode !== 'on', secs]);
        if (mode !== 'warm') res[mode].push(m);
      }
      const avg = (a, f) => +(a.reduce((s, x) => s + x[f], 0) / a.length).toFixed(3);
      res.summary = {renderMeanOff: avg(res.off, 'renderMean'), renderMeanOn: avg(res.on, 'renderMean'), renderP95Off: avg(res.off, 'renderP95'), renderP95On: avg(res.on, 'renderP95'), updateMeanOff: avg(res.off, 'updateMean'), updateMeanOn: avg(res.on, 'updateMean'), poolMax: Math.max(...res.on.map(x => x.poolMax))};
      rows.push(res); console.log(k.padEnd(11), JSON.stringify(res.summary));
    }
    fs.writeFileSync(path.join(ROOT, 'docs/vfx/perf-skill-fx.json'), JSON.stringify({note: 'Chromium sin cabeza, 150 enemigos, relativo (SFA_OFF=true vs false, alternado x2). No es certificación de dispositivo.', errors, rows}, null, 1) + '\n');
    console.log('page errors:', errors.length, errors.slice(0, 3));
  } finally { await browser.close(); if (server) server.kill(); }
})().catch(e => { console.error(e); process.exitCode = 1; if (server) server.kill(); });
