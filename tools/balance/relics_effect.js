'use strict';
/* EFECTO DE LAS RELIQUIAS DE LA HORDA EN EL BALANCE (herramienta de desarrollo, no es parte del juego).
 * Juega partidas reales de la Horda Infinita con el piloto automático (tools/balance/autopilot.js), PAREADAS: la misma semilla de
 * azar y el mismo guardián con y sin reliquias (el grupo de control apaga solo la fase de reliquias, hrelNextPhase = () => false).
 * Mide rondas alcanzadas, puntaje, bajas, minutos y reliquias elegidas; y en modo GOD (el equipo no muere) bajas y daño por minuto.
 * Política de elección: "first" (la primera carta: azar puro) o "best" (la que más sube el daño: techo de lo que haría un jugador que optimiza).
 *   node tools/balance/relics_effect.js [partidas=6] [topeMin=10] [clases=guerrero,mago,cazadora] [politica=first|best]
 *   (servidor propio en un puerto libre; GOD=1 para el equipo que no muere; JSON=ruta guarda el resultado)
 */
const H = require('../lib/serve'), path = require('node:path'), fs = require('node:fs');
const N = +(process.argv[2] || 6), CAP = +(process.argv[3] || 10), CLASSES = (process.argv[4] || 'guerrero,mago,cazadora').split(','), POLICY = process.argv[5] || 'first';
const GOD = !!process.env.GOD;
(async () => {
  const site = await H.startSite(), browser = await H.launch(), rows = [];
  async function run(arm, cls, i) {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('__re')) { localStorage.setItem('laHordaSave_v1', JSON.stringify({ tut: { training: 1 }, starterChosen: true, starterGiftV1: true, starterSkin: 'vale', playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true })); sessionStorage.setItem('__re', '1'); } } catch (e) {} });
    const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/api/rooms?*', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"rooms":[]}' }));
    await page.goto(site.url + '/index.html?lazy=0', { waitUntil: 'load', timeout: 240000 });
    await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return typeof setState === 'function' && typeof assetsAllReady === 'function' && assetsAllReady() && b && !b.disabled; }, null, { timeout: 120000 });
    await page.addScriptTag({ path: path.join(__dirname, 'autopilot.js') });
    const r = await page.evaluate(([arm, cls, i, CAP, GOD, POLICY]) => {
      loop = function () {}; gameDialogAutoConfirm = () => true;
      let s = (i * 7919 + 13) >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      for (const k in save.champions) { const c = save.champions[k]; c.unlocked = true; c.level = 12; c.xp = 0; const al = 3; c.skillMastery.forEach(m => m.alloc = al); c.ultMastery.alloc = al; }
      save.stash = []; for (const k in save.champions) save.champions[k].equipment = mkEquipment();
      save.arenasCleared = Object.assign(save.arenasCleared || {}, { ciudad: true, fortaleza: true }); save.gold = 10000;
      lobbyAllies = null; selectedClass = cls;
      if (arm === 'off') window.hrelNextPhase = () => false;
      endlessActive = false; endlessBeginRun(); startRun(1); __AP.on = true;
      const score = id => { const r = HRELIC_BY_ID[id.slice(3)]; const L = r.L || {}; let v = 0; if (L.dmgMult) v += 5; if (L.critChance) v += 3; if (L.atkSpeedMult) v += 3; if (L.critMult) v += 2; if (r.fx) v += 2.5; if (r.r === 2) v += 1; return v + (Math.random() * 0.01); };
      const pick = () => {
        const cards = [...document.querySelectorAll('#buff-cards .buff-card')]; if (!cards.length) return;
        if (POLICY === 'best' && hrelPhaseVisible()) { cards.sort((a, b) => score('hr:' + b.dataset.hr) - score('hr:' + a.dataset.hr)); }
        cards[0].click();
      };
      const capMs = CAP * 60000; let guard = 0, dmg0 = 0;
      while (guard++ < 200000) {
        for (let n = 0; n < 4 && state === 'buff'; n++) pick();
        if (state !== 'playing') break;
        if (GOD) for (const h of heroes) { h.alive = true; h.hp = Math.max(h.hp, h.maxHp * 0.6); }
        update(16.67);
        if (runElapsedMs >= capMs) break;
      }
      const ms = runElapsedMs, st = player.stats || {};
      const out = { arm, cls, i, state, min: +(ms / 60000).toFixed(2), round: EN.round, score: EN.score, kills, relics: hrelTotal(player.hrel || {}), dmg: Math.round(st.dmgDealt || 0), power: hrelPower(player.hrel || {}),
        tags: Object.keys(hrelTagCounts(player.hrel || {})).join('+') };
      if (state === 'playing') endlessEndRun('quit');
      return out;
    }, [arm, cls, i, CAP, GOD, POLICY]);
    r.errors = errors.slice(0, 2); await ctx.close(); return r;
  }
  try {
    for (const cls of CLASSES) for (let i = 0; i < N; i++) for (const arm of ['off', 'on']) { const r = await run(arm, cls, i); rows.push(r); console.log(JSON.stringify(r)); }
  } finally { await browser.close(); await site.close(); }
  const agg = (arm, cls) => { const R = rows.filter(r => r.arm === arm && (!cls || r.cls === cls)); const n = R.length || 1, sum = k => R.reduce((s, r) => s + r[k], 0), min = Math.max(1e-9, sum('min'));
    return { n: R.length, rounds: +(sum('round') / n).toFixed(2), score: Math.round(sum('score') / n), minutes: +(sum('min') / n).toFixed(2), killsPerMin: +(sum('kills') / min).toFixed(1), dmgPerMin: Math.round(sum('dmg') / min), relics: +(sum('relics') / n).toFixed(2) }; };
  const out = { policy: POLICY, god: GOD, capMin: CAP, runsPerClass: N, byClass: {}, all: {} };
  console.log(`\nRESUMEN (${GOD ? 'GOD: el equipo no muere' : 'real'}, política ${POLICY}, tope ${CAP} min, ${N} partidas por guardián y brazo)`);
  for (const cls of CLASSES.concat([''])) {
    const off = agg('off', cls), on = agg('on', cls), tag = cls || 'TODOS';
    (cls ? out.byClass[cls] = { off, on } : out.all = { off, on });
    console.log(`  ${tag.padEnd(9)} sin reliquias: ${JSON.stringify(off)}\n  ${''.padEnd(9)} con reliquias: ${JSON.stringify(on)}\n  ${''.padEnd(9)} efecto: rondas ${(on.rounds - off.rounds >= 0 ? '+' : '')}${(on.rounds - off.rounds).toFixed(2)} · puntaje ${((on.score / Math.max(1, off.score) - 1) * 100).toFixed(1)}% · bajas/min ${((on.killsPerMin / Math.max(1e-9, off.killsPerMin) - 1) * 100).toFixed(1)}% · daño/min ${((on.dmgPerMin / Math.max(1, off.dmgPerMin) - 1) * 100).toFixed(1)}%`);
  }
  if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(out, null, 1));
})();
