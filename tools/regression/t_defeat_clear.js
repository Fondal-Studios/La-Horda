// DERROTA CLARA: perdón por arena, aviso previo único, bloque de pérdida arriba y sin oferta de skins en la derrota.
//   node tools/regression/t_defeat_clear.js   (servidor propio en puerto libre; SE_BASE_URL para usar otro)
const H = require('../lib/serve');
const path = require('path'), http = require('http'), { spawn } = require('child_process');
let BASE;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!ok) fails++; };
(async () => {
  const site = await H.startSite({ envUrl: ['SE_BASE_URL'] }); BASE = site.url;   // puerto libre propio; SE_BASE_URL para uno externo
  const browser = await H.launch();
  const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await H.goto(page, `${BASE}/index.html?dev=1`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => typeof startRun === 'function' && typeof save !== 'undefined', null, { timeout: 120000 }); await sleep(1500);
  const R = await page.evaluate(() => {
    const out = {}; save.tut = Object.assign(save.tut || {}, { training: 1, basics: 1 }); selectedClass = 'mago'; lobbyAllies = ['tanque', 'soporte', 'guerrero'];
    const fresh = () => { save.defeatCount = 0; save.defeatLegacy = 0; save.arenaDefeats = {}; save.penaltyWarned = {}; };
    const lose = a => { currentArena = a; startRun(1); setState('playing'); return applyArenaFailurePenalty('mago').forgiven; };
    // por arena: 3 perdones en bosque, y la 4.ª paga; en otra arena vuelven a ser 3
    fresh(); out.bosque = [1, 2, 3, 4].map(() => lose('bosque'));
    out.otra = lose('minas'); out.ciudad = lose('ciudad');
    // aviso previo: solo cuando ya no hay perdones, una vez por arena
    state = 'playing'; currentArena = 'bosque'; out.warnBosque = penaltyHeadsUpText(); penaltyHeadsUp(); out.warnAgain = penaltyHeadsUpText();
    currentArena = 'minas'; out.warnMinas = penaltyHeadsUpText(); // 1 derrota allí: perdona
    // guardado viejo con 5 derrotas: todo se castiga y no hay aviso
    fresh(); save.defeatCount = 5; save.defeatLegacy = 5; currentArena = 'bosque'; out.legacyReason = arenaFailureForgiveReason(); out.legacyWarn = penaltyHeadsUpText();
    // pantalla: bloque de pérdida arriba, sin skins
    fresh(); currentArena = 'bosque'; save.arenaDefeats.bosque = 3; startRun(1); setState('playing'); for (const h of heroes) { h.hp = 0; h.alive = false; }
    showGameOverScreen();
    const loss = document.getElementById('go-loss'), rb = document.getElementById('retry-btn').getBoundingClientRect(), st = document.getElementById('go-stats').getBoundingClientRect();
    out.lossFs = parseFloat(getComputedStyle(loss).fontSize); out.lossTxt = loss.innerText; out.retryAboveStats = rb.bottom <= st.top;
    out.skins = !!document.querySelector('#gameover-screen .end-skins');
    return out;
  });
  check('perdón por arena (bosque 3 perdones, 4.ª castiga)', JSON.stringify(R.bosque) === JSON.stringify(['primeras', 'primeras', 'primeras', null]), R.bosque);
  check('otra arena arranca con sus 3 perdones', R.otra === 'primeras', R.otra);
  check('primera arena sigue sin castigo', R.ciudad === 'arena', R.ciudad);
  check('aviso previo cuando ya no hay perdones', /mitad/.test(R.warnBosque || ''), R.warnBosque);
  check('aviso una sola vez por arena', R.warnAgain === null && R.warnMinas === null, [R.warnAgain, R.warnMinas]);
  check('guardado viejo: castiga y no avisa', R.legacyReason === null && R.legacyWarn === null, [R.legacyReason, R.legacyWarn]);
  check('bloque de pérdida legible (>=12px) y con texto', R.lossFs >= 12 && /perdiste|perdona/i.test(R.lossTxt), [R.lossFs, R.lossTxt]);
  check('Reintentar queda sobre el resumen', R.retryAboveStats === true);
  check('sin oferta de apariencias en la derrota', R.skins === false);
  check('sin errores de página', errors.length === 0, errors);
  await browser.close(); await site.close(); console.log(fails ? 'FALLÓ ' + fails : 'OK'); process.exit(fails ? 1 : 0);
})();
