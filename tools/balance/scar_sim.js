'use strict';
// Rangos de Cicatriz: simulación con el piloto automático (GOD = el equipo no muere) para ver que cada rango se juega
// sin errores y medir qué tan lejos llega y cuántos enemigos aparecen. Herramienta de desarrollo, no es parte del juego.
//   node tools/balance/scar_sim.js [rangos=0,3,5] [topeMin=6] [clase=guerrero]
const H = require('../lib/serve'), path = require('node:path');
const RANKS = (process.argv[2] || '0,3,5').split(',').map(Number), CAP = +(process.argv[3] || 6), CLS = process.argv[4] || 'guerrero';
(async () => {
  const site = await H.startSite(), browser = await H.launch(), rows = [], errs = [];
  try {
    for (const rank of RANKS) {
      const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } }), page = await ctx.newPage();
      page.on('pageerror', e => errs.push(`rango ${rank}: ${e.message}`));
      await page.goto(site.url + '/index.html?lazy=0', { waitUntil: 'load', timeout: 240000 });
      await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; }, null, { timeout: 240000 });
      await page.addScriptTag({ path: path.join(__dirname, 'autopilot.js') });
      const r = await page.evaluate(([rank, CAP, CLS]) => {
        loop = function () {}; gameDialogAutoConfirm = () => true;
        for (const k in save.champions) { const c = save.champions[k]; c.unlocked = true; c.level = 12; c.skillMastery.forEach(m => m.alloc = 3); c.ultMastery.alloc = 3; }
        save.stash = []; for (const k in save.champions) save.champions[k].equipment = mkEquipment();
        save.arenasCleared = Object.assign(save.arenasCleared || {}, { ciudad: true, fortaleza: true });
        lobbyAllies = null; selectedClass = CLS;
        endlessSave(); save.endless.scar = { max: 5, sel: rank, best: {}, cleared: {} };
        endlessActive = false; endlessBeginRun(); startRun(1); __AP.on = true;
        let guard = 0, maxEn = 0, kills0 = (typeof runKills !== 'undefined' ? runKills : 0), potions = 0;
        while (guard++ < 100000) {
          if (state === 'buff') __AP.pickBuff();
          if (state !== 'playing') break;
          for (const h of heroes) { h.alive = true; h.hp = Math.max(h.hp, h.maxHp * 0.6); }
          update(16.67);
          if (enemies.length > maxEn) maxEn = enemies.length;
          if (runElapsedMs >= CAP * 60000) break;
        }
        return { rank, scar: EN.scar, mut: EN.mutators.join(','), round: EN.round, score: EN.score, maxEnemies: maxEn, min: +(runElapsedMs / 60000).toFixed(1), mult: +endlessScoreMult().toFixed(2), st: state };
      }, [rank, CAP, CLS]);
      rows.push(r); console.log(JSON.stringify(r));
      await ctx.close();
    }
  } finally { await browser.close(); await site.close(); }
  console.log(errs.length ? 'ERRORES: ' + JSON.stringify(errs.slice(0, 5)) : 'sin errores de página');
  process.exit(errs.length ? 1 : 0);
})();
