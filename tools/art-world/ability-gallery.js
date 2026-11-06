#!/usr/bin/env node
'use strict';
/* GALERÍA DE HABILIDADES en el motor real: por guardián, lanza sus 3 habilidades y la definitiva contra un grupo de enemigos fijos y captura el
   efecto en dos instantes (≈160 ms y ≈560 ms). Sirve para la revisión visual del evaluador (no mide; muestra).
     node tools/art-world/ability-gallery.js <salida> <guardián,guardián,...>     (usa SE_BASE_URL si ya hay un sitio servido) */
const fs = require('node:fs'), path = require('node:path'), H = require('../lib/serve');
const ARENA = process.env.ABILITY_ARENA || 'fortaleza', out = path.resolve(process.argv[2] || '/tmp/ability-gallery'), champs = (process.argv[3] || 'ilkan').split(',');
fs.mkdirSync(out, {recursive: true});
(async () => { const site = await H.startSite(); let browser;
 try{ browser = await H.launch();
  for(const k of champs){
   const page = await browser.newPage({viewport: {width: 960, height: 540}}); const errors = []; page.on('pageerror', e => errors.push(e.message));
   await H.goto(page, site.url + '/index.html?lazy=1');
   await page.waitForFunction(() => typeof castAbility === 'function' && typeof startRun === 'function');
   const info = await page.evaluate(k => { loop = function(){}; for(const ck in save.champions){ const s = save.champions[ck]; s.unlocked = true; s.level = 20; }
     assetsStartGroup('ch:' + k); return CLASSES[k] ? {name: CLASSES[k].name, skills: CLASSES[k].skills.map(s => s.name), ult: CLASSES[k].ultimate.name} : null; }, k);
   if(!info){ console.log(k, 'sin clase'); await page.close(); continue; }
   await page.waitForTimeout(2500);
   const cells = [];
   // El motor de efectos envejece con el reloj REAL (render() reasigna animNow), así que se deja correr el juego de verdad: cuadros de 16 ms con espera real.
   await page.evaluate(() => { window.__run = ms => new Promise(res => { const t0 = performance.now(); (function tick(){ update(16); render(); if(performance.now() - t0 < ms) setTimeout(tick, 16); else res(); })(); }); });
   for(const slot of [0, 1, 2, 'ult']){
    await page.evaluate(([k, slot, arena]) => {
      netMatch = null; selectedClass = k; currentArena = arena; lobbyAllies = []; startRun(3); allies.length = 0; if(Array.isArray(heroes)) heroes.splice(1);
      for(const fn of ['showBanner', 'arenaTitleCard', 'showNetToast']) if(typeof window[fn] === 'function') window[fn] = function(){};
      enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
      runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
      for(const [dx, dy] of [[100, 0], [118, -16], [118, 16], [134, 0], [92, -20], [92, 20], [140, -24], [140, 24]]){ const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e7, maxHp: 1e7, speed: 0, baseSpeed: 0, dmg: 0}); }
      for(const h of heroes) h.invulnTimer = 1e9; player.energy = 1e4; player.ultCharge = player.ultMax; player.hp = player.maxHp;
      const sk = slot === 'ult' ? player.cls.ultimate : player.cls.skills[slot]; player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
      castAbility(player, sk, slot === 'ult', slot === 'ult' ? undefined : slot);
    }, [k, slot, ARENA]);
    let elapsed = 0;
    for(const t of [160, 560]){
     await page.evaluate(ms => window.__run(ms), t - elapsed); elapsed = t;
     const file = path.join(out, `${k}_${slot}_${t === 160 ? 10 : 35}.png`);
     await page.screenshot({path: file, clip: {x: 190, y: 120, width: 580, height: 300}}); cells.push(file);
    }
   }
   console.log(k, JSON.stringify(info), 'errores:', JSON.stringify(errors.slice(0, 2)));
   await page.close();
  }
 } finally { if(browser) await browser.close(); await site.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
