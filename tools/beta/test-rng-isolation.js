'use strict';
// La capa BETA no puede consumir Math.random (daño, IA, botín). Mismas semilla/pasos con ?beta=0 y ?beta=1,
// reloj virtual, update()+render() en cada paso (los enganches de golpe/muerte/ulti/botín/peligro corren de verdad).
// Deben coincidir: bajas, vida, daño, habilidades y el ESTADO DEL RNG (la próxima tirada).
//   node tools/beta/test-rng-isolation.js [segundos=40]
const { chromium, ROOT, serve, check, failCount, ready } = require('./lib');
const SECS = +process.argv[2] || 40, SEED = 117;
async function run(base, flag) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
  await ctx.addInitScript((seed) => {
    window.__campaignMode = true;
    let vt = 1000; performance.now = () => vt; Date.now = () => 1.7e12 + vt; window.__adv = d => { vt += d; };
    let n = seed | 0 || 1; Math.random = () => { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; return (n >>> 0) / 4294967296; };
    window.__rngState = () => n; window.__reseed = v => { n = v | 0 || 1; };
  }, SEED);
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/index.html?beta=' + flag, { waitUntil: 'load', timeout: 180000 });
  await ready(page);
  await page.addScriptTag({ path: ROOT + '/tools/playtest/autopilot.js' });
  const out = await page.evaluate(([secs, seed]) => {
    __reseed(seed); // el título consume Math.random con tiempos reales antes de empezar: se re-siembra al arrancar
    for (const c of Object.values(save.champions)) c.unlocked = true;
    selectedClass = 'cazadora'; currentArena = 'bosque'; startRun(1);
    __AP.on = true; __AP.skill = 0.9; __AP.reaction = 250;
    const step = 1000 / 60; let drawn = 0;
    // enemigos, botín y peligro: se ejercitan los enganches de la capa
    spawnEnemy('dama_bosque', false, false); spawnEnemy('bestia_bosque', false, false);
    bossStrike(player.x + 60, player.y, 50, 1500, 0, 'root', { stun: 0 });
    for (let i = 0; i < secs * 60; i++) {
      if (state === 'buff') __AP.pickBuff();
      if (state !== 'playing') break;
      if (i === 600) groundLootDrop(player.x + 90, player.y - 60, 'S', 1, 'bosque', 'jefe', false, null, 'legendario');
      if (i === 900) { runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); player.ultCharge = player.ultMax; }
      __adv(step); update(step); render(); drawn++;
    }
    return { state, kills, level: runLevel, hp: Math.round(player.hp * 100) / 100, alive: player.alive, dmg: Math.round((player.stats.dmgDealt || 0) * 100) / 100,
      hits: player.stats.abilityHits, loot: groundLoot.length, rng: __rngState(), drawn, betaStats: typeof BETA !== 'undefined' ? BETA.stats : null, betaOn: typeof BETA !== 'undefined' ? BETA.on : null };
  }, [SECS, SEED]);
  await browser.close();
  return { ...out, errors };
}
(async () => {
  const srv = await serve(ROOT);
  try {
    const off = await run(srv.base, 0), on = await run(srv.base, 1);
    console.log('beta=0', JSON.stringify(off)); console.log('beta=1', JSON.stringify(on));
    check('beta=0 no carga la capa (BETA.on=false)', off.betaOn === false);
    check('beta=1 corre con la capa activa', on.betaOn === true && on.betaStats.drawN > 0, on.betaStats);
    check('sin errores de página', !off.errors.length && !on.errors.length, [off.errors, on.errors]);
    for (const k of ['kills', 'level', 'hp', 'alive', 'dmg', 'hits', 'loot', 'rng', 'drawn']) check('idéntico ' + k, off[k] === on[k], { off: off[k], on: on[k] });
    check('la capa sí produjo efectos (chispas/muertes)', on.betaStats.spark > 0 && on.betaStats.death >= 0);
  } finally { srv.stop(); }
  console.log(failCount() ? 'RESULT FAIL' : 'RESULT OK'); process.exit(failCount() ? 1 : 0);
})();
