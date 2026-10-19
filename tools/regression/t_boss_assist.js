// AYUDA ADAPTATIVA DEL JEFE (js/systems/boss-assist.js): activa solo tras una derrota en el nivel del jefe, acumula y topa, se limpia al ganar,
// no existe en sala/endless/Pesadilla/arena superada, se apaga con la preferencia, guardado viejo sin el campo, textos de aviso y derrota.
//   node tools/regression/t_boss_assist.js   (SE_BASE_URL, default http://127.0.0.1:8774; lo levanta si no hay nada)  SHOTS=dir guarda capturas
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path'), http = require('http'), fs = require('fs'), { spawn } = require('child_process');
const BASE = process.env.SE_BASE_URL || 'http://127.0.0.1:8774';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!ok) fails++; };
function ping(url) { return new Promise(res => { const r = http.get(url, x => { x.resume(); res(x.statusCode < 500); }); r.on('error', () => res(false)); r.setTimeout(1500, () => { r.destroy(); res(false); }); }); }
(async () => {
  let srv = null;
  if (!(await ping(BASE + '/index.html'))) { const u = new URL(BASE); srv = spawn('python3', ['-m', 'http.server', u.port, '--bind', u.hostname], { cwd: path.resolve(__dirname, '..', '..'), stdio: 'ignore' }); for (let i = 0; i < 50 && !(await ping(BASE + '/index.html')); i++) await sleep(100); }
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${BASE}/index.html?dev=1`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => typeof startRun === 'function' && typeof save !== 'undefined' && typeof bossAssistPct === 'function', null, { timeout: 120000 }); await sleep(1500);
  const shot = async name => { if (process.env.SHOTS) { fs.mkdirSync(process.env.SHOTS, { recursive: true }); await page.screenshot({ path: path.join(process.env.SHOTS, name) }); } };

  const R = await page.evaluate(() => {
    const o = {}; save.tut = Object.assign(save.tut || {}, { training: 1, basics: 1 }); selectedClass = 'mago'; lobbyAllies = ['tanque', 'soporte', 'guerrero'];
    save.champions.mago.unlocked = true; save.arenasCleared = {}; save.bossDefeats = {}; PREFS.bossAssist = true;
    const bossHp = () => { const e = spawnEnemy('guardian_ancestral', true); scaleBossStats(e, 'guardian_ancestral'); enemies = enemies.filter(x => x !== e); return { hp: e.maxHp, dmg: e.dmg }; };
    const lose = () => { // derrota real: el equipo cae en el nivel actual de la partida
      for (const h of heroes) { h.hp = 0; h.alive = false; } onPlayerDeath(); let t = 0; while (state === 'playing' && t < 4000) { update(16); t += 16; } return state; };
    currentArena = 'bosque';
    // 1. sin derrotas: nada (ni en el nivel 10)
    o.eligible0 = bossAssistEligible(); o.pct0 = bossAssistPct();
    startRun(10); setState('playing'); spawnTimer = 1e12; o.frac0 = bossAssistFrac; const b0 = bossHp(); o.base = b0; const avg0 = runDifficulty.avgHp;
    // 2. una derrota en un nivel anterior al jefe NO cuenta
    startRun(5); setState('playing'); lose(); o.afterLvl5Loss = save.bossDefeats.bosque | 0; o.lastNull = bossAssistLast;
    // 3. derrota en el nivel del jefe: cuenta 1, el siguiente intento lleva -7 %
    startRun(10); setState('playing'); spawnTimer = 1e12; lose(); o.n1 = save.bossDefeats.bosque; o.last1 = JSON.parse(JSON.stringify(bossAssistLast));
    o.lossTxt1 = document.getElementById('go-loss').innerText;
    // 4. acumulación y tope: la ayuda de la partida, el HP/daño del jefe y el daño anclado
    const rows = [];
    for (let n = 1; n <= 6; n++) {
      save.bossDefeats.bosque = n; startRun(10); setState('playing'); spawnTimer = 1e12; const b = bossHp();
      rows.push({ n, frac: +bossAssistFrac.toFixed(3), hpRatio: +(b.hp / b0.hp).toFixed(3), dmgRatio: +(b.dmg / b0.dmg).toFixed(3), avgRatio: +(runDifficulty.avgHp / avg0).toFixed(3) });
    }
    o.rows = rows;
    // 5. la ayuda se fija en el nivel 10: en el nivel 4 de esa partida no toca nada
    save.bossDefeats.bosque = 3; startRun(4); setState('playing'); spawnTimer = 1e12; o.frac4 = bossAssistFrac; o.avg4 = +(runDifficulty.avgHp / avg0).toFixed(3);
    // 6. aviso al entrar y renglón de derrota con las cifras exactas (2 derrotas previas -> 14 %)
    save.bossDefeats.bosque = 2; o.entry = bossAssistEntryText(); save.bossDefeats.bosque = 0; o.entry0 = bossAssistEntryText();
    // 7. preferencia apagada: sin ayuda, el jefe pleno, y la derrota igual cuenta (y ofrece activarla)
    save.bossDefeats.bosque = 2; PREFS.bossAssist = false; o.pctOff = bossAssistPct(); o.entryOff = bossAssistEntryText();
    startRun(10); setState('playing'); spawnTimer = 1e12; const bo = bossHp(); o.offRatio = [+(bo.hp / b0.hp).toFixed(3), +(bo.dmg / b0.dmg).toFixed(3), bossAssistFrac];
    lose(); o.offN = save.bossDefeats.bosque; o.offTxt = document.getElementById('go-loss').innerText; o.offBtn = (document.querySelector('#go-loss [data-boss-assist]') || {}).dataset;
    PREFS.bossAssist = true;
    // 8. no corresponde: sala/cooperativo, Horda Infinita, Pesadilla, arena ya superada, otra arena (su propio contador)
    save.bossDefeats = { bosque: 2 }; currentArena = 'bosque';
    o.solo = bossAssistPct();
    const nm = typeof netMatch !== 'undefined' ? netMatch : null; netMatch = { diff: 'normal', seed: 1 }; o.coop = bossAssistPct(); netMatch = nm;
    const dc = diffCurrent; diffCurrent = () => 'pesadilla'; o.pesadilla = bossAssistPct(); diffCurrent = () => 'infierno'; o.infierno = bossAssistPct(); diffCurrent = dc;
    const eo = endlessOn; endlessOn = () => true; o.endless = bossAssistPct(); endlessOn = eo;
    const lo = lanesOn; lanesOn = () => true; o.lanes = bossAssistPct(); lanesOn = lo;
    divinaMode = true; o.divina = bossAssistPct(); divinaMode = false;
    const ni = netInRoom; netInRoom = () => true; o.room = bossAssistPct(); netInRoom = ni;
    save.arenasCleared.bosque = true; o.cleared = bossAssistPct(); save.arenasCleared = {};
    currentArena = 'hielo'; o.otherArena = bossAssistPct(); currentArena = 'bosque';
    // derrota en el nivel 10 en cooperativo/endless: no suma
    save.bossDefeats = {}; startRun(10); setState('playing'); netMatch = { diff: 'normal', seed: 1 }; o.coopLoss = bossAssistOnDefeat(); netMatch = nm; o.coopSaved = JSON.stringify(save.bossDefeats);
    // 9. ganar la arena limpia SOLO el contador de esa arena
    save.bossDefeats = { bosque: 3, hielo: 1 }; startRun(10); setState('playing'); spawnTimer = 1e12; finishBossVictory(); o.afterWin = JSON.stringify(save.bossDefeats); o.clearedFlag = !!save.arenasCleared.bosque;
    // 10. guardado viejo sin el campo (y con basura): carga limpia, sin ayuda
    save.arenasCleared = {}; delete save.bossDefeats; persistNow(); const raw = JSON.parse(localStorage.getItem(SAVE_KEY)); delete raw.bossDefeats; localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    loadSave(); o.oldSave = [typeof save.bossDefeats, JSON.stringify(save.bossDefeats), bossAssistPct(), bossDefeatsOf('bosque')];
    raw.bossDefeats = { bosque: 3, hielo: -5, x: 'abc', ciudad: 500 }; localStorage.setItem(SAVE_KEY, JSON.stringify(raw)); loadSave(); o.dirtySave = JSON.stringify(save.bossDefeats);
    // 11. interruptor de Opciones
    const sw = document.querySelector('#hub-options .opt-switch[data-pref="bossAssist"]'); o.hasSwitch = !!sw;
    if (sw) { PREFS.bossAssist = true; optionsSync(); o.swOn = [sw.getAttribute('aria-checked'), sw.textContent]; sw.click(); o.swOff = [PREFS.bossAssist, sw.getAttribute('aria-checked')]; sw.click(); o.swBack = PREFS.bossAssist; }
    o.prefPersist = JSON.parse(localStorage.getItem('horda_prefs') || '{}').bossAssist;
    return o;
  });
  check('sin derrotas: sin ayuda (ni en el nivel 10)', R.eligible0 === true && R.pct0 === 0 && R.frac0 === 0, [R.pct0, R.frac0]);
  check('una derrota antes del nivel del jefe no cuenta', R.afterLvl5Loss === 0 && R.lastNull === null, [R.afterLvl5Loss, R.lastNull]);
  check('derrota en el nivel 10: cuenta 1 y anuncia -7 % para el próximo intento', R.n1 === 1 && R.last1 && Math.abs(R.last1.next - 0.07) < 1e-9 && R.last1.now === 0, [R.n1, R.last1]);
  check('pantalla de derrota: cifra exacta, máximo y botón para desactivar', /Ayuda para el jefe: −7 % de vida y daño en tu próximo intento/.test(R.lossTxt1) && /25 %/.test(R.lossTxt1) && /Desactivar la ayuda/.test(R.lossTxt1), R.lossTxt1);
  const want = [0.07, 0.14, 0.21, 0.25, 0.25, 0.25];
  check('acumula 7 % por derrota y topa en 25 %', R.rows.every((r, i) => Math.abs(r.frac - want[i]) < 0.0011), R.rows.map(r => r.frac));
  check('vida del jefe baja exactamente la ayuda', R.rows.every((r, i) => Math.abs(r.hpRatio - (1 - want[i])) < 0.004), R.rows.map(r => r.hpRatio));
  check('daño del jefe y golpes anclados bajan exactamente la ayuda', R.rows.every((r, i) => Math.abs(r.dmgRatio - (1 - want[i])) < 0.01 && Math.abs(r.avgRatio - (1 - want[i])) < 0.002), R.rows.map(r => [r.dmgRatio, r.avgRatio]));
  check('la ayuda recién se fija en el nivel 10 (nivel 4: nada cambia)', R.frac4 === 0 && R.avg4 === 1, [R.frac4, R.avg4]);
  check('aviso al entrar con la cifra exacta, y nada sin derrotas', R.entry === 'Ayuda activa: el jefe tiene −14 % de vida y daño tras tus intentos. Se puede apagar en Opciones.' && R.entry0 === null, [R.entry, R.entry0]);
  check('apagada: ningún efecto, jefe pleno, sin aviso', R.pctOff === 0 && R.entryOff === null && R.offRatio[0] === 1 && R.offRatio[1] === 1 && R.offRatio[2] === 0, [R.pctOff, R.offRatio]);
  check('apagada: la derrota igual cuenta y se ofrece activarla', R.offN === 3 && /desactivada/.test(R.offTxt) && R.offBtn && R.offBtn.bossAssist === 'on', [R.offN, R.offTxt, R.offBtn]);
  check('solo en solitario/Normal: sala, Pesadilla, Infierno, endless, Coliseo/Cristales, Divina, arena superada = 0', R.solo === 0.14 && [R.coop, R.pesadilla, R.infierno, R.endless, R.lanes, R.divina, R.room, R.cleared].every(v => v === 0), R);
  check('el contador es por arena', R.otherArena === 0);
  check('derrota en el nivel 10 en cooperativo no suma', R.coopLoss === null && R.coopSaved === '{}', [R.coopLoss, R.coopSaved]);
  check('ganar la arena limpia solo el contador de esa arena', R.afterWin === '{"hielo":1}' && R.clearedFlag === true, R.afterWin);
  check('guardado viejo sin el campo: vacío y sin ayuda', R.oldSave[0] === 'object' && R.oldSave[1] === '{}' && R.oldSave[2] === 0 && R.oldSave[3] === 0, R.oldSave);
  check('guardado con basura se normaliza (0..99)', R.dirtySave === '{"bosque":3,"ciudad":99}', R.dirtySave);
  check('interruptor en Opciones (prende/apaga y persiste en el aparato)', R.hasSwitch && R.swOn[0] === 'true' && R.swOff[0] === false && R.swOff[1] === 'false' && R.swBack === true && R.prefPersist === true, [R.swOn, R.swOff, R.swBack, R.prefPersist]);

  // ---- pantallas: aviso al entrar y derrota con ayuda ----
  const S = await page.evaluate(async () => {
    const o = {}; save.arenasCleared = {}; save.bossDefeats = { bosque: 1 }; PREFS.bossAssist = true; currentArena = 'bosque'; selectedClass = 'mago';
    startRun(1); setState('playing'); spawnTimer = 1e12; save.bossDefeats.bosque = 2; bossAssistEntryNotice();
    await new Promise(r => setTimeout(r, 500)); const b = document.getElementById('center-banner'); o.banner = b ? b.textContent : null;
    return o;
  });
  await sleep(300); await shot('entrada-con-ayuda.png');
  const D = await page.evaluate(() => {
    const o = {}; save.bossDefeats = { bosque: 1 }; PREFS.bossAssist = true; currentArena = 'bosque'; startRun(10); setState('playing'); spawnTimer = 1e12;
    for (const h of heroes) { h.hp = 0; h.alive = false; } onPlayerDeath(); let t = 0; while (state === 'playing' && t < 4000) { update(16); t += 16; }
    const l = document.getElementById('go-loss'); o.txt = l.innerText; o.fs = parseFloat(getComputedStyle(l.querySelector('.go-loss-assist b')).fontSize);
    const btn = l.querySelector('[data-boss-assist]'); o.btnH = btn.getBoundingClientRect().height; o.retryAbove = document.getElementById('retry-btn').getBoundingClientRect().bottom <= document.getElementById('go-stats').getBoundingClientRect().top;
    return o;
  });
  await sleep(300); await shot('derrota-con-ayuda.png');
  await page.click('#go-loss [data-boss-assist="off"]'); await sleep(200);
  const D2 = await page.evaluate(() => ({ pref: PREFS.bossAssist, txt: document.getElementById('go-loss').innerText }));
  await shot('derrota-ayuda-desactivada.png');
  check('entrada: el cartel dice la cifra exacta', /Ayuda activa: el jefe tiene −14 % de vida y daño tras tus intentos/.test(S.banner || ''), S.banner);
  check('derrota: 2.ª derrota anuncia -14 %, texto legible y botón táctil', /−14 %/.test(D.txt) && D.fs >= 12 && D.btnH >= 28, [D.fs, D.btnH, D.txt]);
  check('derrota: Reintentar queda sobre el resumen', D.retryAbove === true);
  check('el botón de la derrota apaga la ayuda y lo dice', D2.pref === false && /desactivada/.test(D2.txt) && /Activar la ayuda/.test(D2.txt), D2);
  check('sin errores de página', errors.length === 0, errors);
  await browser.close(); if (srv) srv.kill(); console.log(fails ? 'FALLÓ ' + fails : 'OK'); process.exit(fails ? 1 : 0);
})();
