// JEFES DORMIDOS / INTOCABLES (Fase 1b: partidas que no terminan). `dmgTakenMult = 0` es "intocable", pero damageEnemy hacia
// `amount*(e.dmgTakenMult||1)`: el 0 valia 1. El Caballero de Fortaleza sentado (tanque, Pesadilla, semilla 5144), la Madre Espora
// latente de Micelial y el Carcelero surgiendo del Abismo se podian matar ANTES de ser `boss`: onBossDefeated nunca corria,
// la partida no daba victoria y seguia hasta el tope. Esta prueba exige que no reciban dano mientras duermen y que, ya en pelea,
// su muerte si termine la partida.
//   (python3 -m http.server 8771 &) ; node tools/items/t_boss_dormant.js
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.SE_BASE_URL || 'http://127.0.0.1:8771';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 400) : '')); if (!ok) fails++; };
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 900, height: 506 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  await sleep(1500);
  const E = (fn, a) => page.evaluate(fn, a);
  await E(() => { loop = function(){};
    window.__run = (arena, lv) => {
      for (const k of Object.keys(save.champions)){ save.champions[k].unlocked = true; save.champions[k].level = 24; }
      selectedClass = 'guerrero'; currentArena = arena; lobbyAllies = ['mago','soporte','tanque']; startRun(lv);
      spawnTimer = 1e12; return player;
    };
    window.__tick = (ms) => { for (let t = 0; t < ms; t += 16){ for (const h of heroes) if (h.alive) h.hp = Math.max(h.hp, h.maxHp*0.9); update(16); } };
  });

  // ---------- regla general ----------
  const gen = await E(() => { __run('fortaleza', 3); const e = spawnEnemy('esqueleto', false) || enemies[enemies.length-1];
    e.dmgTakenMult = 0; const hp0 = e.hp; damageEnemy(e, 5000, {src:player}); const h0 = e.hp;
    e.dmgTakenMult = 1; damageEnemy(e, 10, {src:player}); const h1 = e.hp; e.dmgTakenMult = undefined; damageEnemy(e, 10, {src:player});
    return { hp0, h0, h1, h2: e.hp }; });
  check('GENERAL.dmgTakenMult_0_es_intocable', gen.h0 === gen.hp0, gen);
  check('GENERAL.dmgTakenMult_1_y_sin_definir_dañan', gen.h1 < gen.hp0 && gen.h2 < gen.h1, gen);

  // ---------- Fortaleza: el Caballero sentado ----------
  const fk = await E(() => { __run('fortaleza', 10); __tick(200);
    const k = enemies.find(o => o.alive && o.type === 'caballero'), hp0 = k.hp;
    const pre = { st: fortS.knight.state, boss: boss === null };
    damageEnemy(k, 1e9, {src:player}); __tick(100);
    const alive = k.alive && k.hp === hp0 && fortS.knight.state === 'waiting' && boss === null;
    // despierta (como al cumplirse riseMs) y recibe el golpe de gracia: debe haber victoria
    fortS.knight.state = 'rising'; fortS.knight.t = FORT_CFG.caballero.riseMs + 10; __tick(100);
    const fight = { st: fortS.knight.state, isBoss: boss === k, active: bossActive };
    k.hp = 1; damageEnemy(k, 1e9, {src:player}); __tick(4000);
    return { pre, alive, fight, dead: !k.alive, state, knight: fortS.knight.state }; });
  check('FORTALEZA.caballero_sentado_no_recibe_daño', fk.pre.st === 'waiting' && fk.pre.boss && fk.alive, fk);
  check('FORTALEZA.caballero_en_pelea_muerto_da_victoria', fk.fight.st === 'fight' && fk.fight.isBoss && fk.dead && fk.state === 'victory', fk);

  // ---------- Fortaleza: nadie queda del otro lado de la puerta cerrada (semillas 5015/5029) ----------
  // Con la puerta g_knight cerrada, un empujón dejaba al Caballero o a un héroe en el patio core_n (fortClamp lleva al piso
  // más cercano) y la pelea no podía terminar. Quien sale de la cámara durante la pelea vuelve a entrar.
  const out = await E(() => { __run('fortaleza', 10); __tick(200);
    const k = enemies.find(o => o.alive && o.type === 'caballero');
    fortS.knight.state = 'rising'; fortS.knight.t = FORT_CFG.caballero.riseMs + 10; __tick(100);
    const plat = FORT_MAP.plats.find(p => p.id === 'knight'), box = _fortOBB(plat.cx, plat.cy, plat.hw, plat.hh, 0, plat);
    const gate = fortS.gates.g_knight.open;
    k.x = 0; k.y = -3320; k._fs = null; k.stunTimer = 5000; const h = heroes[1]; h.x = 40; h.y = -3320; h._fs = null; __tick(500);
    return { st: fortS.knight.state, gate, kIn: _fortIn(box, k.x, k.y, 0), hIn: _fortIn(box, h.x, h.y, 0), k: [Math.round(k.x), Math.round(k.y)], h: [Math.round(h.x), Math.round(h.y)] }; });
  check('FORTALEZA.pelea_nadie_queda_fuera_de_la_camara', out.st === 'fight' && out.gate < 0.6 && out.kIn && out.hIn, out);

  // ---------- Micelial: la Madre Espora latente ----------
  const mm = await E(() => { __run('micelial', 10); __tick(100); micMotherRevealStart();
    const m = enemies.find(o => o.alive && o.type === 'madre_espora'), hp0 = m.hp, pre = { boss: boss === null, dormant: m.micDormant };
    damageEnemy(m, 1e9, {src:player}); __tick(100);
    const alive = m.alive && m.hp === hp0;
    micS.mo.st = 'reveal'; micS.mo.t = MIC_CFG.madre.revealMs + 10; __tick(100);
    const fight = { st: micS.mo.st, isBoss: boss === m };
    m.hp = 1; m.dmgTakenMult = 1; damageEnemy(m, 1e9, {src:player}); __tick(16000);
    return { pre, alive, fight, dead: !m.alive, state }; });
  check('MICELIAL.madre_latente_no_recibe_daño', mm.pre.boss && mm.pre.dormant === 1 && mm.alive, mm);
  check('MICELIAL.madre_en_pelea_muerta_da_victoria', mm.fight.st === 'fight' && mm.fight.isBoss && mm.dead && mm.state === 'victory', mm);

  // ---------- Abismo: el Carcelero surgiendo ----------
  const ca = await E(() => { __run('abismo', 9); levelDuration = 9e9; levelTimer = 1; abCarceleroRise();
    const e = enemies.find(o => o.alive && o.type === 'ab_carcelero'), hp0 = e.hp;
    damageEnemy(e, 1e9, {src:player}); __tick(100);
    return { alive: e.alive && e.hp === hp0, st: abS.ca.st }; });
  check('ABISMO.carcelero_surgiendo_no_recibe_daño', ca.alive && ca.st === 'rise', ca);

  check('SIN_ERRORES', errors.length === 0, errors.slice(0, 5));
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
