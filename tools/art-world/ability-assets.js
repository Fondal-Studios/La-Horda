#!/usr/bin/env node
'use strict';
/* Qué IMÁGENES dibuja realmente cada habilidad (3 + definitiva) de cada guardián, en el motor real y en tiempo real.
     node tools/art-world/ability-assets.js <salida.json> [guardián,...]
   Luego: python3 tools/art-world/ability-assets-report.py <salida.json>  (cuenta colores/alfa parcial y marca el arte pintado). */
const fs = require('node:fs'), path = require('node:path'), H = require('../lib/serve');
const outFile = path.resolve(process.argv[2] || '/tmp/ability-assets.json'), only = process.argv[3] ? process.argv[3].split(',') : null;
(async () => { const site = await H.startSite(); let browser; const res = {};
 try{ browser = await H.launch(); const page = await browser.newPage({viewport: {width: 960, height: 540}}); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await H.goto(page, site.url + '/index.html?lazy=1'); await page.waitForFunction(() => typeof castAbility === 'function');
  const champs = await page.evaluate(() => Object.keys(CLASSES));
  await page.evaluate(() => { loop = function(){}; window.__drawn = new Set(); const dI = CanvasRenderingContext2D.prototype.drawImage; CanvasRenderingContext2D.prototype.drawImage = function(im){ try{ if(im && im.tagName === 'IMG' && im.src && !im.src.startsWith('data:')) window.__drawn.add(im.src.replace(/^https?:\/\/[^/]+\//, '')); }catch(e){} return dI.apply(this, arguments); };
    window.__run = ms => new Promise(r => { const t0 = performance.now(); (function tick(){ update(16); render(); if(performance.now() - t0 < ms) setTimeout(tick, 16); else r(); })(); }); });
  for(const k of champs){ if(only && !only.includes(k)) continue;
   await page.evaluate(k => { for(const ck in save.champions){ save.champions[ck].unlocked = true; save.champions[ck].level = 20; } assetsStartGroup('ch:' + k); }, k); await page.waitForTimeout(1800);
   res[k] = {};
   for(const slot of [0, 1, 2, 'ult']){
    await page.evaluate(([k, slot]) => { netMatch = null; selectedClass = k; currentArena = 'fortaleza'; lobbyAllies = []; startRun(3); allies.length = 0; if(Array.isArray(heroes)) heroes.splice(1);
      enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing'; runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
      for(const [dx, dy] of [[100, 0], [118, -16], [118, 16], [134, 0], [92, -20], [92, 20]]){ const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e7, maxHp: 1e7, speed: 0, baseSpeed: 0, dmg: 0}); }
      for(const h of heroes) h.invulnTimer = 1e9; player.energy = 1e4; player.ultCharge = player.ultMax; player.hp = player.maxHp; window.__drawn.clear();
      const sk = slot === 'ult' ? player.cls.ultimate : player.cls.skills[slot]; player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
      castAbility(player, sk, slot === 'ult', slot === 'ult' ? undefined : slot); }, [k, slot]);
    await page.evaluate(() => window.__run(750));
    res[k][slot] = await page.evaluate(() => [...window.__drawn]);
   }
   process.stdout.write(k + ' ');
  }
  fs.writeFileSync(outFile, JSON.stringify({errors, res}, null, 1)); console.log('\nlisto', outFile, 'errores', errors.length);
 } finally { if(browser) await browser.close(); await site.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
