// RANKING PERSONAL de la Horda Infinita: la ronda enviada es la que ESTE jugador sobrevivió, no la del grupo.
//   (python3 -m http.server 8808 &) ; SE_BASE_URL=http://127.0.0.1:8808 node tools/items/t_endless_personal.js
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.SE_BASE_URL || 'http://127.0.0.1:8808';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 400) : '')); if (!ok) fails++; };
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 900, height: 506 } })).newPage();
  await page.route('**/api/rooms?*', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ rooms: [] }) }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 240000 });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  const E = (fn, a) => page.evaluate(fn, a);
  await E(() => { loop = function () {};
    for (const k of Object.keys(save.champions)) save.champions[k].unlocked = true;
    save.arenasCleared = { fortaleza: true };
    window.__finish = (alive) => { let guard = 0; const r0 = EN.round;
      while (EN.round === r0 && guard++ < 4000 && (state === 'playing' || state === 'buff')) {
        if (state === 'buff') { const c = document.querySelector('#buff-cards .buff-card'); if (c) c.click(); continue; }
        if (levelDuration < 1e8) levelTimer = Math.max(levelTimer, levelDuration);
        for (const e of enemies) if (e.alive && (e.rank === 'subjefe' || e.rank === 'jefe') && (guard % 20 === 0)) { e.hp = 1; damageEnemy(e, 1e9, { src: player }); }
        for (const h of heroes) { h.hp = h.maxHp; h.alive = h !== player ? true : alive; }
        update(16);
      }
      for (const h of heroes) { h.hp = h.maxHp; h.alive = h !== player ? true : alive; } update(16);   // un fotograma más: el juego real sigue corriendo después del cambio de ronda
      return EN.round; };
  });
  await E(() => { selectedClass = 'guerrero'; lobbyAllies = ['tanque', 'soporte', 'mago']; window.endlessOpen(); document.getElementById('start-btn').click(); document.getElementById('prep-start-btn').click(); });
  await sleep(500);
  check('PERS.arranca', await E(() => endlessActive && EN.round === 1 && EN.local.survived === 0));
  // dos rondas con el jugador en pie -> sobrevivió 2
  await E(() => { __finish(true); __finish(true); });
  const a = await E(() => ({ round: EN.round, surv: EN.local.survived, sc: EN.local.survivedScore, ms: EN.local.survivedMs }));
  check('PERS.suma_rondas_en_pie', a.round === 3 && a.surv === 2 && a.sc >= 0 && a.ms >= 0, a);
  // el jugador cae y el grupo sigue: las rondas siguientes NO se le atribuyen
  await E(() => { __finish(false); __finish(false); });
  const b = await E(() => ({ round: EN.round, surv: EN.local.survived }));
  check('PERS.no_hereda_rondas_tras_caer', b.round === 5 && b.surv === 2, b);
  // un salto de ronda (reconexión) no suma
  const c = await E(() => { player.alive = true; EN.round += 7; endlessTrackSurvival(); return { round: EN.round, surv: EN.local.survived }; });
  check('PERS.salto_de_ronda_no_suma', c.round === 12 && c.surv === 2, c);
  // lo que se manda al ranking es la ronda personal
  const d = await E(() => { const L = EN.local; L.done = false; const sent = []; window._lbSubmit = async (e) => { sent.push(e); return { status: 200, j: { ok: true } }; };
    window._lbLogged = () => true; window._lbCan = () => true; L.lb = null; lbAfterRun(L); return { sent: sent[0], groupRound: EN.round }; });
  check('PERS.ranking_recibe_ronda_personal', d.sent && d.sent.round === 2 && d.groupRound === 12, d);
  check('PERS.sin_errores', errors.length === 0, errors);
  await browser.close();
  console.log(fails ? 'FALLOS ' + fails : 'TODO OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
