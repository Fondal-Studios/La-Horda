// Economía del punto de control del nivel 5: XP y oro de combate por nivel (1-9) con el piloto automático y el código real,
// para fijar CP_PAY (js/systems/checkpoint.js) de modo que reanudar en el 5 no rinda más por minuto que jugar completo.
// El jugador es INVULNERABLE (se mide el ritmo de ganancia, no la habilidad del piloto).
// usage: GAME_URL=http://127.0.0.1:8931/index.html node tools/balance/checkpoint_econ.js [arenas=ciudad,bosque,hielo] [clase=guerrero] > econ.jsonl
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright');
const path = require('path'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const URL = process.env.GAME_URL || 'http://127.0.0.1:8931/index.html';
  const arenas = (process.argv[2] || 'ciudad,bosque,hielo').split(','); const cls = process.argv[3] || 'guerrero';
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  for (const arena of arenas) {
    const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage();
    await page.addInitScript(() => { window.__campaignMode = true; });
    await page.goto(URL, { waitUntil: 'load' });
    for (let i = 0; i < 300; i++) { const ok = await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; }); if (ok) break; await sleep(100); }
    await page.addScriptTag({ path: path.join(__dirname, '..', 'playtest', 'autopilot.js') });
    const r = await page.evaluate(([a, cls]) => {
      loop = function () {};
      const LV = { ciudad: 1, fortaleza: 7, bosque: 11, micelial: 15, hielo: 19 };
      const lvl = LV[a] || DIFF.arenaLevel[a] || 1;
      for (const k in save.champions) { const c = save.champions[k]; c.level = lvl; c.xp = 0; c.unlocked = true; const al = Math.min(10, Math.floor(lvl / 4)); c.skillMastery.forEach(m => m.alloc = al); c.ultMastery.alloc = al; }
      save.stash = []; save.gold = 0; save.defeatCount = 99; save.defeatLegacy = 99;
      const dh = window.damageHero; damageHero = function (h, amount, src) { return dh.call(this, h, h === player ? 0 : amount, src); };
      __AP.start(cls, a, 1);
      const per = {}; let last = 1, x0 = totalXpForChamp(cls), g0 = save.gold, t0 = 0;
      for (let i = 0; i < 600; i++) {
        const o = __AP.sim(1000); if (o.state !== 'playing' && o.state !== 'buff') break;
        if (runLevel !== last) { per[last] = { xp: totalXpForChamp(cls) - x0, gold: save.gold - g0, ms: runElapsedMs - t0 }; x0 = totalXpForChamp(cls); g0 = save.gold; t0 = runElapsedMs; last = runLevel; }
        if (runLevel >= 10) break;
      }
      return { arena: a, lvl, per, endLevel: runLevel };
    }, [arena, cls]);
    console.log(JSON.stringify(r)); await page.context().close().catch(() => {});
  }
  await browser.close();
})();
