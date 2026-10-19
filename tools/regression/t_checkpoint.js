// PUNTO DE CONTROL en el nivel 5 (js/systems/checkpoint.js): crear al pasar el 5, ofrecerlo tras perder, reanudar con el
// estado esperado, limpiar al ganar, no ofrecerlo en sala/Horda Infinita/Divina, guardado viejo sin el campo, arenas.
//   node tools/regression/t_checkpoint.js   (servidor propio en puerto libre; SE_BASE_URL para usar otro)
//   SHOTS=docs/ux/checkpoint  -> guarda capturas de la pantalla de derrota con punto de control
const HARNESS = require('../lib/serve');   // (no se llama H: la prueba usa un H local)
const path = require('path'), http = require('http'), fs = require('fs'), { spawn } = require('child_process');
let BASE;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!ok) fails++; };
(async () => {
  const site = await HARNESS.startSite({ envUrl: ['SE_BASE_URL'] }); BASE = site.url;   // puerto libre propio; SE_BASE_URL para uno externo
  const browser = await HARNESS.launch();
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const boot = async () => { await HARNESS.goto(page, `${BASE}/index.html?dev=1`, { waitUntil: 'load', timeout: 180000 }); await page.waitForFunction(() => typeof startRun === 'function' && typeof save !== 'undefined' && typeof checkpointAvailable === 'function', null, { timeout: 120000 }); await sleep(1200); };
  await boot();
  const shot = async name => { if (process.env.SHOTS) { fs.mkdirSync(process.env.SHOTS, { recursive: true }); await page.screenshot({ path: path.join(process.env.SHOTS, name) }); } };

  // ---------- 1. crear al pasar el nivel 5 ----------
  const A = await page.evaluate(() => {
    const o = {}; save.tut = Object.assign(save.tut || {}, { training: 1, basics: 1 }); selectedClass = 'mago'; lobbyAllies = ['tanque', 'soporte', 'guerrero'];
    save.defeatCount = 9; save.defeatLegacy = 9; save.arenaDefeats = {}; save.penaltyWarned = {}; save.checkpoints = {}; save.arenasCleared = {};
    for (const a of ARENA_ORDER) save.arenasCleared[a] = true; // todas abiertas
    save.champions.mago.unlocked = true;
    currentArena = 'bosque'; startRun(1); setState('playing'); spawnTimer = 1e12;
    // nivel 4 -> sin punto de control
    runLevel = 4; beginLevel(); levelTimer = levelDuration + 1; let g = 0; while (state === 'playing' && g++ < 400) update(16);
    o.stBuff4 = state; document.querySelector('#buff-cards .buff-card').click(); o.afterLvl4 = { level: runLevel, cp: !!save.checkpoints.bosque };
    // nivel 5 superado -> punto de control
    spawnTimer = 1e12; enemies.length = 0; levelTimer = levelDuration + 1; g = 0; while (state === 'playing' && g++ < 400) update(16);
    const xpBefore = totalXpForChamp('mago'), goldBefore = save.gold;
    document.querySelector('#buff-cards .buff-card').click();
    o.afterLvl5 = { level: runLevel, cp: JSON.parse(JSON.stringify(save.checkpoints.bosque || null)), banked: runBanked, base: [runStartXp === xpBefore, runStartGold === goldBefore] };
    // pasar el 6 no lo vuelve a crear (uses se mantiene)
    save.checkpoints.bosque.uses = 2; spawnTimer = 1e12; enemies.length = 0; levelTimer = levelDuration + 1; g = 0; while (state === 'playing' && g++ < 400) update(16);
    document.querySelector('#buff-cards .buff-card').click(); o.afterLvl6 = { level: runLevel, uses: save.checkpoints.bosque.uses }; save.checkpoints.bosque.uses = 0;
    return o;
  });
  check('nivel 4 superado: sin punto de control', A.stBuff4 === 'buff' && A.afterLvl4.level === 5 && A.afterLvl4.cp === false, A.afterLvl4);
  check('nivel 5 superado: se crea UN punto de control de la arena', A.afterLvl5.level === 6 && A.afterLvl5.cp && A.afterLvl5.cp.level === 5 && A.afterLvl5.cp.champ === 'mago' && A.afterLvl5.cp.diff === 'normal' && A.afterLvl5.cp.uses === 0, A.afterLvl5);
  check('lo ganado hasta el punto de control queda a salvo (base del castigo)', A.afterLvl5.banked === true && A.afterLvl5.base[0] && A.afterLvl5.base[1]);
  check('superar el nivel 6 no recrea el punto', A.afterLvl6.level === 7 && A.afterLvl6.uses === 2, A.afterLvl6);

  // ---------- 2. perder: castigo solo sobre lo ganado después + oferta ----------
  const B = await page.evaluate(() => {
    const o = {}; const xp0 = totalXpForChamp('mago'), g0 = save.gold; grantXP('mago', 400); grantGold(200);
    o.gained = [totalXpForChamp('mago') - xp0, save.gold - g0];
    for (const h of heroes) { h.hp = 0; h.alive = false; } onPlayerDeath(); let t = 0; while (state === 'playing' && t < 4000) { update(16); t += 16; }
    o.state = state; o.lostXp = totalXpForChamp('mago') - xp0; o.lostGold = save.gold - g0;
    const loss = document.getElementById('go-loss'), rb = document.getElementById('retry-btn'), r1 = document.getElementById('retry-from1-btn');
    o.lossTxt = loss.innerText; o.lossFs = parseFloat(getComputedStyle(loss).fontSize); o.subFs = Math.min(...[...loss.querySelectorAll('.go-loss-sub')].map(s => parseFloat(getComputedStyle(s).fontSize)));
    o.retry = rb.textContent; o.retryCp = rb.dataset.cp; o.from1 = r1.textContent; o.from1Hidden = r1.classList.contains('hidden');
    o.btnFs = [parseFloat(getComputedStyle(rb).fontSize), parseFloat(getComputedStyle(r1).fontSize)];
    o.avail = !!checkpointAvailable(); o.cp = JSON.parse(JSON.stringify(save.checkpoints.bosque));
    return o;
  });
  check('perder: 50% solo de lo ganado después del punto de control', B.state === 'gameover' && Math.abs(B.lostXp - B.gained[0] * 0.5) <= 2 && B.lostXp > 0 && (m => m && Math.abs(+m[1] - B.gained[0] * 0.5) <= 2 && Math.abs(+m[2] - B.gained[1] * 0.5) <= 2)(B.lossTxt.match(/\((\d+) de XP.*? y (\d+) de oro\)/)), B);
  check('derrota: ofrece los dos botones con su texto', B.retry === 'Reanudar desde el nivel 5' && B.retryCp === 'resume' && B.from1 === 'Empezar de nuevo desde el nivel 1' && !B.from1Hidden, [B.retry, B.from1]);
  check('derrota: dice qué se conserva y qué se pierde', /Se conserva/.test(B.lossTxt) && /Se pierde/.test(B.lossTxt) && /refuerzos/i.test(B.lossTxt) && /25%/.test(B.lossTxt) && /a salvo/.test(B.lossTxt), B.lossTxt);
  check('derrota: texto >= 12 px (844x390)', B.lossFs >= 12 && B.subFs >= 12 && B.btnFs[0] >= 12 && B.btnFs[1] >= 12, [B.lossFs, B.subFs, B.btnFs]);
  await shot('derrota-con-checkpoint-844x390.png');
  const C = await page.evaluate(() => { const r = [...document.querySelectorAll('#gameover-screen button, #go-loss, #go-stats')].map(e => { const b = e.getBoundingClientRect(); return [e.id, Math.round(b.top), Math.round(b.bottom)]; }); const sc = document.getElementById('gameover-screen'); return { r, scrolls: sc.scrollHeight > sc.clientHeight + 1, h: [sc.scrollHeight, sc.clientHeight] }; });
  check('derrota: se puede llegar a ambos botones (cabe o scrollea)', C.scrolls ? true : C.r.every(x => x[2] <= 390), C);
  // desplaza hasta el final para la segunda captura
  await page.evaluate(() => { const sc = document.getElementById('gameover-screen'); sc.scrollTop = sc.scrollHeight; }); await shot('derrota-con-checkpoint-844x390-abajo.png');
  await page.evaluate(() => { const sc = document.getElementById('gameover-screen'); sc.scrollTop = 0; });

  // ---------- 3. reanudar ----------
  const D = await page.evaluate(() => {
    const o = {}; o.xpBefore = totalXpForChamp('mago'); o.goldBefore = save.gold; o.lvBefore = save.champions.mago.level;
    document.getElementById('retry-btn').click();
    o.state = state; o.runLevel = runLevel; o.resumed = runResumed; o.banked = runBanked; o.uses = save.checkpoints.bosque.uses; o.arena = currentArena;
    o.xpAfter = totalXpForChamp('mago'); o.goldAfter = save.gold; o.base = [runStartXp === o.xpAfter, runStartGold === save.gold];
    o.boons = Object.keys(player.boons || {}).length; o.crit = runStats.critChance; o.hp = player.hp === player.maxHp; o.bossLevel = LEVEL_COUNT;
    const x0 = totalXpForChamp('mago'), g0 = save.gold; grantXP('mago', 400); grantGold(200); o.pay = [totalXpForChamp('mago') - x0, save.gold - g0];
    // el jefe sigue en el nivel 10: se llega jugando los niveles 5..9
    spawnTimer = 1e12; let steps = []; let g = 0;
    while (runLevel < LEVEL_COUNT && g++ < 20) { enemies.length = 0; spawnTimer = 1e12; levelTimer = levelDuration + 1; let k = 0; while (state === 'playing' && k++ < 600) update(16); if (state !== 'buff') break; steps.push(runLevel); document.querySelector('#buff-cards .buff-card').click(); }
    o.steps = steps; o.endLevel = runLevel; o.prevCp = save.checkpoints.bosque.uses;
    enemies.length = 0; levelTimer = levelDuration + 1; let k2 = 0; while (!bossActive && k2++ < 600) update(16);
    o.bossActive = bossActive; o.bossAlive = !!(boss && boss.alive); o.arenasClearedBefore = !!save.arenasCleared.bosque; o.victory = state === 'victory';
    return o;
  });
  check('reanudar: arranca en el nivel 5, mismo estado de cuenta, arena y partida nueva', D.state === 'playing' && D.runLevel === 5 && D.resumed && D.arena === 'bosque' && D.xpAfter === D.xpBefore && D.goldAfter === D.goldBefore, D);
  check('reanudar: gasta 1 uso y la base del castigo es el estado actual', D.uses === 1 && D.base[0] && D.base[1] && D.banked);
  check('reanudar: sin refuerzos de la incursión anterior y con la vida llena', D.boons === 0 && D.hp);
  check('reanudar: paga 75% de la XP y el oro de combate (400/200 -> 300/150)', Math.abs(D.pay[0] - 300) <= 1 && Math.abs(D.pay[1] - 150) <= 1, D.pay);
  check('reanudar: el jefe sigue esperando en el nivel 10 (no se saltea)', D.endLevel === D.bossLevel && D.bossActive && !D.victory, [D.steps, D.endLevel]);
  check('reanudar: no desbloquea ni da la arena por sí solo', D.arenasClearedBefore === true /* ya estaba abierta por el montaje */ && D.victory === false);

  // ---------- 4. perder en la partida reanudada: sin botín de consuelo, el punto sigue ----------
  await page.evaluate(() => { for (const h of heroes) { h.hp = 0; h.alive = false; } onPlayerDeath(); let t = 0; while (state === 'playing' && t < 4000) { update(16); t += 16; } });
  const E2 = await page.evaluate(() => {
    const o = {}; o.state = state; o.lootTxt = document.getElementById('go-progress').innerText; o.cpKept = !!save.checkpoints.bosque; o.uses = save.checkpoints.bosque.uses;
    o.offer = !!checkpointAvailable(); o.retry = document.getElementById('retry-btn').textContent; o.left = (document.getElementById('go-loss').innerText.match(/restantes: (\d)/) || [])[1];
    return o;
  });
  check('derrota tras reanudar: sin botín de consuelo, el punto sigue con 2 reanudaciones', E2.state === 'gameover' && E2.cpKept && E2.uses === 1 && E2.left === '2' && /Reanudar/.test(E2.retry), E2);
  const F = await page.evaluate(() => { const r = grantEndOfRunLoot('mago', { grade: 'A' }, false); return { items: r.items.length, gems: r.gems }; });
  check('partida reanudada: grantEndOfRunLoot de derrota no da nada', F.items === 0 && F.gems === 0, F);
  // agotar reanudaciones
  const G = await page.evaluate(() => {
    const o = {}; save.checkpoints.bosque.uses = 3; o.offer = !!checkpointAvailable(); save.checkpoints.bosque.uses = 1; return o;
  });
  check('agotado (3 reanudaciones): ya no se ofrece', G.offer === false, G);

  // ---------- 5. botón "Empezar de nuevo desde el nivel 1" ----------
  const H = await page.evaluate(() => { document.getElementById('retry-from1-btn').click(); return { st: state, lv: runLevel, resumed: runResumed, cp: !!save.checkpoints.bosque }; });
  check('"Empezar de nuevo": nivel 1, partida normal (sin descuento) y el punto no se pierde', H.st === 'playing' && H.lv === 1 && H.resumed === false && H.cp === true, H);

  // ---------- 6. ganar limpia ----------
  const I = await page.evaluate(() => {
    const o = {}; enemies.length = 0; spawnTimer = 1e12; const x0 = totalXpForChamp('mago');
    o.cpBefore = !!save.checkpoints.bosque; const b = spawnEnemy('guardian_ancestral', true); boss = b; bossActive = true;
    damageEnemy(b, 1e9, { src: player }); let t = 0; while (state === 'playing' && t < 9000) { update(16); t += 16; }
    o.state = state; o.cpAfter = !!save.checkpoints.bosque; o.cleared = !!save.arenasCleared.bosque; return o;
  });
  check('ganar la arena borra su punto de control', I.cpBefore && I.state === 'victory' && I.cpAfter === false && I.cleared, I);
  const I2 = await page.evaluate(() => {
    save.checkpoints.bosque = { level: 5, champ: 'mago', diff: 'normal', uses: 0, xp: 0, gold: 0 }; save.checkpoints.ciudad = { level: 5, champ: 'mago', diff: 'normal', uses: 0, xp: 0, gold: 0 };
    checkpointClear('bosque'); return { b: !!save.checkpoints.bosque, c: !!save.checkpoints.ciudad };
  });
  check('un solo punto por arena: borrar una no toca las otras', I2.b === false && I2.c === true, I2);

  // ---------- 7. victoria en partida reanudada: XP/oro de la victoria sin descuento ----------
  const V = await page.evaluate(() => {
    const o = {}; save.checkpoints.bosque = { level: 5, champ: 'mago', diff: 'normal', uses: 0, xp: 0, gold: 0 };
    currentArena = 'bosque'; startRun(1); setState('playing'); spawnTimer = 1e12; // partida normal para tener player
    // forzar una partida reanudada con la oferta
    _cpResuming = true; startRun(5); setState('playing'); spawnTimer = 1e12; enemies.length = 0;
    const g0 = save.gold; const b = spawnEnemy('guardian_ancestral', true); boss = b; bossActive = true; damageEnemy(b, 1e9, { src: player });
    let t = 0; while (state === 'playing' && t < 9000) { update(16); t += 16; }
    o.state = state; o.goldGain = save.gold - g0; o.pay = checkpointPay(); o.cp = !!save.checkpoints.bosque; return o;
  });
  check('victoria reanudada: el pago de la victoria no se descuenta y se limpia el punto', V.state === 'victory' && V.pay === 1 && V.goldGain >= 80 && V.cp === false, V);

  // ---------- 8. no ofrecerlo fuera de la campaña en solitario ----------
  const N = await page.evaluate(() => {
    const o = {}; save.checkpoints = { bosque: { level: 5, champ: 'mago', diff: 'normal', uses: 0, xp: 0, gold: 0 } };
    currentArena = 'bosque'; startRun(1); setState('playing'); spawnTimer = 1e12;
    o.solo = !!checkpointAvailable();
    const net0 = [net.room, net.role];
    net.room = 'ABCD'; net.role = 'host'; o.sala = [!!checkpointAvailable(), checkpointEligible(), checkpointDefeatHTML()]; net.role = 'guest'; o.salaInvitado = !!checkpointAvailable();
    runLevel = 5; const cpBefore = JSON.stringify(save.checkpoints); delete save.checkpoints.bosque; levelTimer = 0; runLevel = 6; o.crearEnSala = checkpointOnLevelPassed(); o.creado = !!save.checkpoints.bosque; net.room = net0[0]; net.role = net0[1];
    save.checkpoints = JSON.parse(cpBefore);
    const e0 = endlessActive; endlessActive = true; o.endless = [!!checkpointAvailable(), checkpointEligible()]; runLevel = 6; o.crearEndless = checkpointOnLevelPassed(); endlessActive = e0;
    const d0 = divinaMode; divinaMode = true; o.divina = [!!checkpointAvailable(), checkpointEligible()]; divinaMode = d0;
    const a0 = currentArena; currentArena = 'divina'; o.arenaDivina = checkpointEligible(); currentArena = a0;
    const nm = netMatch; netMatch = { seed: 1, diff: 'normal', slots: [] }; o.netMatch = [!!checkpointAvailable(), checkpointEligible()]; netMatch = nm;
    o.otroGuardian = (() => { const k = selectedClass; player.classKey = 'guerrero'; const r = !!checkpointAvailable(); player.classKey = k; return r; })();
    o.otraDificultad = (() => { const f = diffCurrent; const prev = window.diffCurrent; diffCurrent = () => 'pesadilla'; const r = !!checkpointAvailable(); diffCurrent = f; return r; })();
    o.noLanes = typeof lanesOn === 'function' && lanesOn() === false;
    return o;
  });
  check('solo campaña: en solitario sí se ofrece', N.solo === true);
  check('sala (anfitrión/invitado) y partida en red: no se ofrece ni se crea', N.sala[0] === false && N.sala[1] === false && N.sala[2] === null && N.salaInvitado === false && N.crearEnSala === false && N.creado === false && N.netMatch[0] === false && N.netMatch[1] === false, [N.sala, N.salaInvitado, N.crearEnSala, N.netMatch]);
  check('Horda Infinita: no se ofrece ni se crea', N.endless[0] === false && N.endless[1] === false && N.crearEndless === false, N.endless);
  check('Arena Divina: no se ofrece', N.divina[0] === false && N.divina[1] === false && N.arenaDivina === false, [N.divina, N.arenaDivina]);
  check('otro guardián u otra dificultad: no se ofrece', N.otroGuardian === false && N.otraDificultad === false, [N.otroGuardian, N.otraDificultad]);

  // pantalla de derrota en Horda Infinita / sala: sin botón de reanudar (el flujo real de la derrota normal solo ofrece en campaña solo)
  const N2 = await page.evaluate(() => {
    const o = {}; save.checkpoints = { bosque: { level: 5, champ: 'mago', diff: 'normal', uses: 0, xp: 0, gold: 0 } }; currentArena = 'bosque'; startRun(1); setState('playing');
    net.room = 'ABCD'; net.role = 'guest'; for (const h of heroes) { h.hp = 0; h.alive = false; }
    try { showGameOverScreen(); } catch (e) { o.err = String(e); }
    o.retryCp = document.getElementById('retry-btn').dataset.cp; o.from1Hidden = document.getElementById('retry-from1-btn').classList.contains('hidden'); o.txt = document.getElementById('go-loss').innerText;
    net.room = null; net.role = null; return o;
  });
  check('derrota en sala: sin botón de reanudar y con el aviso de siempre', !N2.retryCp && N2.from1Hidden === true && /Sin puntos de control/.test(N2.txt), N2);

  // ---------- 9. guardado viejo sin el campo / saneo ----------
  const S0 = await page.evaluate(() => { save.gold = 4321; save.checkpoints = { micelial: { level: 5, champ: 'mago', diff: 'infierno', uses: 1, xp: 10, gold: 5 } }; persistNow(); return { champ: save.champions.mago.level, gold: save.gold }; });
  await boot();
  const S1 = await page.evaluate(() => ({ cps: JSON.parse(JSON.stringify(save.checkpoints)), gold: save.gold }));
  check('guardado nuevo: el punto sobrevive a recargar', S1.cps.micelial && S1.cps.micelial.uses === 1 && S1.cps.micelial.diff === 'infierno' && S1.gold === 4321, S1);
  await page.evaluate(() => { const raw = JSON.parse(localStorage.getItem(SAVE_KEY)); delete raw.checkpoints; localStorage.setItem(SAVE_KEY, JSON.stringify(raw)); });
  await boot();
  const S2 = await page.evaluate(() => ({ cps: save.checkpoints, gold: save.gold, level: save.champions.mago.level, defeat: save.defeatCount, ok: !save.loadFailed }));
  check('guardado viejo SIN el campo: carga sin pérdida, checkpoints = {}', JSON.stringify(S2.cps) === '{}' && S2.gold === 4321 && S2.level === S0.champ, S2);
  await page.evaluate(() => { const raw = JSON.parse(localStorage.getItem(SAVE_KEY)); raw.checkpoints = { ciudad: { level: 5, champ: 'mago', diff: 'x', uses: 99, xp: -4 }, bosque: { level: 3, champ: 'mago' }, hielo: 'basura', fortaleza: null }; localStorage.setItem(SAVE_KEY, JSON.stringify(raw)); });
  await boot();
  const S3 = await page.evaluate(() => JSON.parse(JSON.stringify(save.checkpoints)));
  check('campo dañado: se sanea (uses<=3, diff válida, nivel inválido descartado)', Object.keys(S3).join() === 'ciudad' && S3.ciudad.uses === 3 && S3.ciudad.diff === 'normal' && S3.ciudad.xp === 0, S3);

  // ---------- 10. reanudar en cada arena de la campaña: arranca y corre sin errores ----------
  const errs0 = errors.length;
  const T = await page.evaluate(() => {
    const out = []; selectedClass = 'mago'; lobbyAllies = ['tanque', 'soporte', 'guerrero']; save.checkpoints = {};
    for (const a of ARENA_ORDER) {
      save.arenasCleared = save.arenasCleared || {}; for (const k of ARENA_ORDER) save.arenasCleared[k] = true;
      currentArena = a; startRun(1); setState('playing'); save.checkpoints[a] = { level: 5, champ: 'mago', diff: 'normal', uses: 0, xp: 0, gold: 0 };
      const ok = checkpointResume(); let t = 0; try { while (state === 'playing' && t < 6000) { update(16); t += 16; } } catch (e) { out.push([a, 'ERR ' + e.message]); continue; }
      out.push([a, ok, runLevel, state]);
    }
    return out;
  });
  check('reanudar en las ' + T.length + ' arenas: sin excepciones y en el nivel 5', T.every(x => x[1] === true && x[2] === 5 && x[3] === 'playing'), T.filter(x => !(x[1] === true && x[2] === 5 && x[3] === 'playing')));
  check('sin errores de página', errors.length === 0 && errs0 === 0, errors.slice(0, 3));
  await browser.close(); await site.close(); console.log(fails ? 'FALLÓ ' + fails : 'OK'); process.exit(fails ? 1 : 0);
})();
