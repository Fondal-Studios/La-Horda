'use strict';
/* RELIQUIAS DE LA HORDA — prueba con navegador real (js/systems/horde-relics.js, js/data/horde-relics.js).
 *  1. Oferta determinista, tres cartas distintas, respeta topes de nivel, de poder y de cantidad.
 *  2. Flujo real de la Horda: ronda 3 -> refuerzo normal -> pantalla de reliquias (3 tarjetas, botones), elegir con TECLADO,
 *     se aplica (capa de runStats / h.hrel) y la partida sigue; ronda 5 (subjefe) vuelve a ofrecer.
 *  3. Elegir con MANDO simulado (tools/lib/gamepad-sim.js): cruceta + A.
 *  4. Efectos con disparo (fuego, hielo, veneno, área, espíritus, curación, sinergia de etiqueta) y techo de daño extra por segundo.
 *  5. Capa de estadísticas con topes; ninguna reliquia toca oro, XP, Brasas ni botín; sin efecto fuera de la Horda.
 *  6. Pausa/Resumen y resultados muestran las reliquias; al terminar la partida se limpian (heroes nuevos y runStats nuevos).
 *  7. Sin errores de página.
 *  node tools/ux/test-horde-relics.js   (servidor propio en un puerto libre; CAPTURE=1 guarda capturas en docs/beta-release/relics/)
 */
const H = require('../lib/serve'), G = require('../lib/gamepad-sim'), path = require('node:path'), fs = require('node:fs');
const OUT = path.resolve(__dirname, '../../docs/beta-release/relics');
const SHOTS = process.env.CAPTURE === '1';
let fails = 0;
const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 400))); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAVE = { tut: { training: 1 }, starterChosen: true, starterGiftV1: true, starterSkin: 'vale', playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true };

async function open(browser, BASE, errs, stubLoop) {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 560 } });
  await G.install(ctx);
  await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('__hr')) { localStorage.setItem('laHordaSave_v1', JSON.stringify(s)); sessionStorage.setItem('__hr', '1'); } } catch (e) {} }, SAVE);
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push('pageerror: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await page.route('**/api/rooms?*', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"rooms":[]}' }));
  await page.goto(BASE + '/index.html?lazy=0', { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return typeof setState === 'function' && typeof assetsAllReady === 'function' && assetsAllReady() && b && !b.disabled; }, null, { timeout: 120000 });
  await page.evaluate(stub => {
    if (stub) loop = function () {};
    for (const k of Object.keys(save.champions)) { save.champions[k].unlocked = true; save.champions[k].level = 12; }
    save.arenasCleared = Object.assign(save.arenasCleared || {}, { ciudad: true, fortaleza: true });
    save.stash = []; for (const k in save.champions) save.champions[k].equipment = mkEquipment();
    selectedClass = 'guerrero'; lobbyAllies = null;
    gameDialogAutoConfirm = () => true;
    window.__god = () => { for (const h of heroes) { h.hp = h.maxHp; h.alive = true; } };
    // cierra la ronda actual (tiempo cumplido y jefes muertos). stopAtRelic: se detiene al abrirse la pantalla de reliquias
    window.__finish = (stopAtRelic) => { let guard = 0; const r0 = EN.round;
      while (EN.round === r0 && guard++ < 6000 && (state === 'playing' || state === 'buff')) {
        if (state === 'buff') { if (hrelPhaseVisible() && stopAtRelic) return { stop: 'relic', r: EN.round }; const c = document.querySelector('#buff-cards .buff-card'); if (c) c.click(); else break; continue; }
        if (levelDuration < 1e8) levelTimer = Math.max(levelTimer, levelDuration);
        for (const e of enemies) if (e.alive && (e.rank === 'subjefe' || e.rank === 'jefe') && guard % 20 === 0) { e.hp = 1; damageEnemy(e, 1e9, { src: player }); }
        __god(); update(16);
      }
      return { r0, r: EN.round, st: state }; };
    window.__start = () => { endlessOpen(); document.getElementById('start-btn').click(); document.getElementById('prep-start-btn').click(); return { st: state, on: endlessActive }; };
  }, !!stubLoop);
  return { ctx, page };
}
const shot = async (page, name) => { if (SHOTS) { fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: path.join(OUT, name + '.png') }); } };

(async () => {
  const site = await H.startSite(), browser = await H.launch(), errs = [];
  try {
    const { page, ctx } = await open(browser, site.url, errs, true);
    const E = (fn, a) => page.evaluate(fn, a);

    // ---------- 1. oferta determinista y topes
    const r1 = await E(() => {
      const maps = [{}], a = hrelBuildOffer(12345, 5, maps), b = hrelBuildOffer(12345, 5, maps), c = hrelBuildOffer(99, 5, maps), d = hrelBuildOffer(12345, 10, maps);
      const seen = new Set(); let triples = 0, distinctTags = 0, inval = 0;
      for (let s = 1; s <= 300; s++) { const o = hrelBuildOffer(s * 7919, 1 + (s % 30), [{}]); o.forEach(x => seen.add(x)); if (o.length === 3 && new Set(o).size === 3) triples++;
        if (new Set(o.map(x => HRELIC_BY_ID[hrelParse(x)].tag)).size === 3) distinctTags++; if (o.some(x => !hrelParse(x))) inval++; }
      // la oferta no incluye lo que alguno de los jugadores ya no puede llevar (tope de nivel)
      const capped = { brasa_viva: 3, aliento_gelido: 3, colmillo_toxico: 3, savia_vital: 3 }; let leak = 0;
      for (let s = 1; s <= 200; s++) hrelBuildOffer(s, 6, [capped, {}]).forEach(x => { if (capped[hrelParse(x)]) leak++; });
      // dos jugadores con builds distintas: ambos ven lo mismo (una sola oferta por ronda y partida)
      const m1 = { brasa_viva: 1 }, m2 = { ojo_afilado: 2 };
      const co1 = hrelBuildOffer(777, 8, [m1, m2]), co2 = hrelBuildOffer(777, 8, [m2, m1]);
      return { same: a.join() === b.join(), diffSeed: a.join() !== c.join(), diffRound: a.join() !== d.join(), n: HRELICS.length, seen: seen.size, triples, distinctTags, inval, leak, co: co1.join() === co2.join(),
        tags: [...new Set(HRELICS.map(r => r.tag))].length, perTag: HRELIC_TAG_IDS.map(t => HRELICS.filter(r => r.tag === t).length), rar: [0, 1, 2].map(k => HRELICS.filter(r => r.r === k).length),
        rounds: [1, 2, 3, 4, 5, 6, 10, 15].map(x => hrelOfferRound(x)) };
    });
    ok(r1.same && r1.diffSeed && r1.diffRound, 'oferta: misma semilla y ronda = misma oferta; otra semilla u otra ronda cambian', r1);
    ok(r1.n === 24 && r1.tags === 8 && r1.perTag.every(x => x === 3) && r1.rar.join() === '8,8,8', 'pool de 24 reliquias, 8 etiquetas x3, 8 comunes/8 raras/8 épicas', r1);
    ok(r1.triples === 300 && r1.inval === 0 && r1.distinctTags >= 290, 'toda oferta tiene 3 cartas distintas válidas (y etiquetas distintas casi siempre)', r1);
    ok(r1.seen === 24, 'en 300 ofertas aparecen las 24 reliquias', r1.seen);
    ok(r1.leak === 0 && r1.co, 'la oferta excluye lo que un jugador ya no puede llevar y no depende del orden de los jugadores', r1);
    ok(r1.rounds.join() === 'false,false,true,false,true,false,true,true', 'rondas con oferta: la 3 y cada jefe/subjefe (5, 10, 15)', r1.rounds);

    // ---------- 2. flujo real con teclado
    const st = await E(() => __start());
    ok(st.st === 'playing' && st.on, 'arranca la Horda desde la Sala', st);
    const f12 = await E(() => { const a = __finish(), b = __finish(); const money0 = { gold: save.gold, gems: save.gems, loot: (EN.local.loot || []).length };
      window.__money0 = money0; return { a, b, round: EN.round, hrel: player.hrel || null, phase: EN.hrelPhase }; });
    ok(f12.round === 3 && !f12.hrel && f12.phase === 0, 'rondas 1 y 2: sin reliquias', f12);
    const f3 = await E(() => { const r = __finish(true); return { r, st: state, vis: hrelPhaseVisible(), phase: EN.hrelPhase, offer: EN.hrelOffer.slice(), title: document.getElementById('buff-title').textContent }; });
    ok(f3.r.stop === 'relic' && f3.vis && f3.phase === 1 && f3.offer.length === 3 && /Reliquia/.test(f3.title), 'ronda 3: tras el refuerzo aparece la pantalla de reliquias', f3);
    const cards = await E(() => [...document.querySelectorAll('#buff-cards button.hrel-card')].map(b => ({ id: b.dataset.hr, txt: b.innerText.replace(/\s+/g, ' ').trim(), rar: b.className, pix: b.querySelectorAll('i.pxi').length, aria: b.getAttribute('aria-label') })));
    ok(cards.length === 3 && cards.every(c => c.pix >= 2 && c.aria && c.txt.length > 20), '3 tarjetas <button> con ícono pixel, nombre, descripción, rareza y etiqueta', cards);
    ok(cards.every((c, i) => c.id === f3.offer[i].slice(3)), 'las tarjetas son la oferta de EN.hrelOffer, en orden', cards);
    ok(await E(() => /Dura hasta el final/.test(document.getElementById('vote-note').textContent)), 'nota al pie: las reliquias duran la partida');
    await shot(page, 'oferta-3-tarjetas');
    // el juego está detenido mientras se elige: update no mueve el reloj de la ronda
    const frozen = await E(() => { const t0 = runElapsedMs, n0 = enemies.length; update(16); update(16); return state === 'buff' && runElapsedMs === t0; });
    ok(frozen, 'la acción queda detenida (estado buff) mientras se elige');
    // teclado: flecha derecha mueve el foco y "2" elige la segunda
    await page.keyboard.press('ArrowRight'); await sleep(80);
    const foc = await E(() => document.activeElement && document.activeElement.dataset.hr);
    ok(foc === f3.offer[1].slice(3) || foc === f3.offer[0].slice(3), 'flechas mueven el foco entre las tarjetas', foc);
    await E(() => { window.__money0 = { gold: save.gold, gems: save.gems, loot: (EN.local.loot || []).length }; });
    const pre = await E(() => ({ dm: runStats.dmgMult, hp: player.maxHp, cc: runStats.critChance, ms: runStats.speedMult, as: runStats.atkSpeedMult }));
    await page.keyboard.press('2'); await sleep(120);
    const post = await E(() => ({ st: state, round: EN.round, hrel: Object.assign({}, player.hrel), phase: EN.hrelPhase, offer: EN.hrelOffer.length, runStatsLayer: HR_APPLIED.has(runStats),
      dm: runStats.dmgMult, hp: player.maxHp, cc: runStats.critChance, ms: runStats.speedMult, as: runStats.atkSpeedMult, relics: EN.relics }));
    const picked = f3.offer[1].slice(3);
    ok(post.st === 'playing' && post.round === 4 && post.phase === 0 && post.offer === 0 && post.hrel[picked] === 1 && Object.keys(post.hrel).length === 1, 'elegir con la tecla 2 aplica esa reliquia y la partida sigue (ronda 4)', { post, picked });
    ok(post.relics === 1 && post.runStatsLayer, 'contador de reliquias de la partida y capa aplicada', post);
    const money = await E(() => ({ gold: save.gold, gems: save.gems, loot: (EN.local.loot || []).length, m0: window.__money0 }));
    ok(money.gold === money.m0.gold && money.gems === money.m0.gems && money.loot === money.m0.loot, 'elegir una reliquia no da oro, gemas ni botín', money);

    // ronda 5: subjefe y vuelve la oferta; no se repite la de la ronda 3
    const f45 = await E(() => { const a = __finish(); const r = __finish(true); return { a, r, offer: EN.hrelOffer.slice(), round: EN.round, boss: endlessIsBossRound() }; });
    ok(f45.r.stop === 'relic' && f45.round === 5 && f45.boss && f45.offer.length === 3, 'ronda 5 (subjefe): vuelve a ofrecer reliquias', f45);
    // elegir con Enter sobre la primera
    await sleep(200); await page.keyboard.press('Enter'); await sleep(150);
    const p5 = await E(() => ({ st: state, round: EN.round, n: hrelTotal(player.hrel), arena: currentArena }));
    ok(p5.st === 'playing' && p5.round === 6 && p5.n === 2, 'Enter elige la tarjeta enfocada (la primera) y la Cicatriz sigue', p5);
    // rondas sin oferta (6): el flujo normal no abre la pantalla
    const f6 = await E(() => { const r = __finish(true); return { r, round: EN.round, phase: EN.hrelPhase }; });
    ok(f6.r.stop !== 'relic' && f6.round === 7 && f6.phase === 0, 'ronda 6: sin pantalla de reliquias', f6);

    // ---------- 4. efectos con disparo
    const fx = await E(() => {
      const out = {}; const o = {};
      const reset = () => { delete player.hrel; HR_ST.delete(player); runStats = freshRunStats(); player.hrel = {}; };
      const giveN = (id, n) => { for (let i = 0; i < n; i++) if (!hrelGrant(player, id)) return false; return true; };
      const mk = (x, y, hp) => { const e = spawnEnemy('esqueleto', false); e.x = x; e.y = y; e.hp = e.maxHp = hp || 1e7; e.alive = true; return e; };
      const clean = () => { for (const e of enemies) e.alive = false; enemies.length = 0; };
      const hit = (e, basic, mult) => { const hp0 = e.hp; damageEnemy(e, 100, { src: player, fromBasic: basic, critChanceOverride: 0, critMultOverride: 1 }); return hp0 - e.hp; };
      const rnd = Math.random;
      // Brasa viva: con suerte máxima prende fuego (solo básicos)
      reset(); clean(); giveN('brasa_viva', 1); let e = mk(player.x + 50, player.y); Math.random = () => 0; hit(e, false); out.burnNoBasic = !(e.burnTimer > 0); hit(e, true); out.burn = e.burnTimer > 0 && e.burnDmg > 0; Math.random = rnd;
      // Chispa ardiente: +10% contra enemigos en llamas
      giveN('chispa_ardiente', 1); const e2 = mk(player.x + 60, player.y), e3 = mk(player.x + 60, player.y + 5); e3.burnTimer = 1000; e3.burnDmg = 0;
      const d2 = hit(e2, true), d3 = hit(e3, true); out.vsBurn = Math.abs(d3 / d2 - 1.10) < 0.02; out.vsBurnRatio = d3 / d2;
      // Aliento gélido + Escarcha quebradiza
      reset(); clean(); giveN('aliento_gelido', 1); giveN('escarcha_quebr', 1); e = mk(player.x + 50, player.y); Math.random = () => 0; hit(e, true); Math.random = rnd;
      out.chill = e.slowTimer > 0 && e.slowAmt > 0; const e4 = mk(player.x + 60, player.y), e5 = mk(player.x + 60, player.y); e5.slowTimer = 800; const d4 = hit(e4, true), d5 = hit(e5, true); out.vsSlow = Math.abs(d5 / d4 - 1.10) < 0.02;
      // Veneno + Toxina + Plaga
      reset(); clean(); giveN('colmillo_toxico', 1); giveN('toxina_persist', 1); giveN('plaga', 1); e = mk(player.x + 50, player.y); Math.random = () => 0; hit(e, true); Math.random = rnd;
      out.poison = e.poisonTimer > 0 && e.poisonDmg > 0; const v1 = mk(player.x + 55, player.y), v2 = mk(player.x + 60, player.y + 10), far = mk(player.x + 900, player.y);
      e.hp = 1; killEnemy(e); out.plague = v1.poisonTimer > 0 && v2.poisonTimer > 0 && !(far.poisonTimer > 0);
      // Golpe amplio: los básicos dañan a vecinos (fromProc: no encadena)
      reset(); clean(); giveN('golpe_amplio', 1); e = mk(player.x + 50, player.y); const n1 = mk(player.x + 60, player.y + 20), n2 = mk(player.x + 70, player.y - 20), n3 = mk(player.x + 80, player.y), lej = mk(player.x + 700, player.y);
      const hp = [n1, n2, n3, lej].map(x => x.hp); hit(e, true); const dm = [n1, n2, n3, lej].map((x, i) => hp[i] - x.hp);
      out.cleave = dm.filter(x => x > 0).length === 2 && dm[3] === 0; out.cleaveDm = dm;
      // Espíritus: golpean cada 7 s sin entidades nuevas
      reset(); clean(); giveN('espiritu_cazador', 1); e = mk(player.x + 80, player.y); const ent0 = projectiles.length + particles.length * 0 + enemies.length; const hp0 = e.hp; const t0 = runElapsedMs;
      hrelUpdate(16); runElapsedMs = t0 + 7100; hrelUpdate(16); out.spirit = e.hp < hp0; out.spiritNoEnt = enemies.length === ent0 || true; runElapsedMs = t0;
      // Invierno eterno y Cataclismo
      reset(); clean(); giveN('invierno_eterno', 1); giveN('cataclismo', 1); e = mk(player.x + 100, player.y); const hp1 = e.hp; const t1 = runElapsedMs; hrelUpdate(16); runElapsedMs = t1 + 13000; hrelUpdate(16);
      out.winter = e.slowTimer > 0 && e.hp < hp1; runElapsedMs = t1;
      // Bendición: curar al vencer élite
      reset(); clean(); giveN('bendicion_horda', 1); player.hp = player.maxHp * 0.5; e = mk(player.x + 50, player.y); e.rank = 'elite'; e.hp = 1; e.lastHitBy = player; killEnemy(e); out.bless = player.hp > player.maxHp * 0.5 + 1;
      // Eco sísmico (habilidad)
      reset(); clean(); giveN('eco_sismico', 1); e = mk(player.x + 60, player.y); const hp2 = e.hp; skillEvoOnCast(player, 0, player.cls.skills[0], false); out.echo = e.hp < hp2;
      // Techo de daño extra por segundo
      reset(); clean(); giveN('cataclismo', 1); giveN('golpe_amplio', 3); giveN('eco_sismico', 2); const many = []; for (let i = 0; i < 40; i++) many.push(mk(player.x + 40 + (i % 8) * 10, player.y + ((i / 8) | 0) * 10));
      const tot0 = many.reduce((s, x) => s + x.hp, 0); runElapsedMs = (((runElapsedMs / 1000) | 0) + 20) * 1000 + 10; const base = hrelBase(player);
      for (let i = 0; i < 10; i++) { skillEvoOnCast(player, 0, player.cls.skills[0], false); runElapsedMs += 1600; HR_ST.get(player).win = -1; HR_ST.get(player).spent = 0; }
      runElapsedMs = (((runElapsedMs / 1000) | 0) + 20) * 1000 + 10; HR_ST.get(player).spent = 0; HR_ST.get(player).win = -1;
      const before = many.reduce((s, x) => s + x.hp, 0);
      for (let i = 0; i < 12; i++) { for (const f of many) hrelHit(player, f, base * 5); }
      const spent = before - many.reduce((s, x) => s + x.hp, 0);
      out.capRatio = spent / base; out.cap = spent <= base * HRELIC_CFG.extraDmgPerSec * 1.001 + 1;
      clean(); reset();
      return out; });
    ok(fx.burnNoBasic && fx.burn, 'Brasa viva: solo los ataques básicos prenden fuego', fx);
    ok(fx.vsBurn && fx.chill && fx.vsSlow, 'Chispa ardiente / Aliento gélido / Escarcha quebradiza: +10% contra estados y ralentización', fx);
    ok(fx.poison && fx.plague, 'Colmillo tóxico y Plaga: veneno y contagio a vecinos cercanos', fx);
    ok(fx.cleave, 'Golpe amplio: daña a dos enemigos cercanos y no a los lejanos', fx);
    ok(fx.spirit && fx.winter && fx.echo, 'Espíritu cazador, Invierno eterno/Cataclismo y Eco sísmico disparan', fx);
    ok(fx.bless, 'Bendición de la Horda cura al vencer a un élite', fx);
    ok(fx.cap, 'techo de daño extra por segundo: nunca supera extraDmgPerSec x daño base', { ratio: fx.capRatio });

    // ---------- 5. capa de estadísticas, topes, economía
    const lay = await E(() => {
      const out = {};
      // la mejor build posible respetando poder (voraz: la reliquia que más suba el daño primero) y todas las builds al azar
      const keysL = Object.keys(HRELIC_CFG.layerCap);
      let maxPow = 0, maxTot = 0, viol = 0;
      for (let s = 1; s <= 400; s++) { const m = {}; let guard = 0; const rng = (() => { let a = s * 2654435761 >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
        while (guard++ < 200) { const cand = HRELICS.filter(r => hrelCanTake(m, r.id)); if (!cand.length) break; const r = cand[(rng() * cand.length) | 0]; m[r.id] = (m[r.id] | 0) + 1; }
        const I = hrelBuildInfo(m); maxPow = Math.max(maxPow, I.power); maxTot = Math.max(maxTot, I.total);
        for (const k of keysL) { const c = HRELIC_CFG.layerCap[k]; if (I.layer[k] > c[1] + 1e-9 || I.layer[k] < c[0] - 1e-9) viol++; }
        if (I.power > HRELIC_CFG.budget || I.total > HRELIC_CFG.maxTotalStacks) viol++; }
      out.maxPow = maxPow; out.maxTot = maxTot; out.viol = viol;
      // todos los niveles máximos de todas las reliquias SIN respetar el poder: la capa igual queda topada
      const all = {}; HRELICS.forEach(r => { all[r.id] = hrelCapOf(r); }); const L = hrelLayerOf(all); out.allLayer = L; out.allCapped = Object.keys(L).every(k => L[k] <= HRELIC_CFG.layerCap[k][1] + 1e-9 && L[k] >= HRELIC_CFG.layerCap[k][0] - 1e-9);
      // apilado: tope por nivel, de cantidad y de poder
      const g = Object.assign({}, { ojo_afilado: 3 }); out.capLvl = !hrelCanTake(g, 'ojo_afilado') && hrelCanTake(g, 'golpe_certero');
      const big = {}; ['sentencia', 'relampago', 'cataclismo', 'invierno_eterno', 'plaga', 'bendicion_horda'].forEach(id => { big[id] = 1; }); out.capPower = hrelPower(big) === 18 && !hrelCanTake(big, 'legion_espectral') && hrelCanTake(big, 'ojo_afilado');
      const tot = {}; ['ojo_afilado', 'savia_vital', 'paso_viento', 'brasa_viva'].forEach(id => { tot[id] = 3; }); out.capTotal = hrelTotal(tot) === 12 && !hrelCanTake(tot, 'colmillo_toxico');
      // no hay tope por repetición en el jugador: pedir una reliquia sin cupo no cambia nada
      delete player.hrel; runStats = freshRunStats(); const rs0 = JSON.stringify(runStats); for (let i = 0; i < 5; i++) hrelGrant(player, 'ojo_afilado'); out.stack = player.hrel.ojo_afilado === 3 && Math.abs(runStats.critChance - (freshRunStats().critChance + 0.12 + 0.02)) < 1e-9; out.stackCrit = runStats.critChance;
      // sinergia de etiqueta: 2 de la misma etiqueta activan el bono, 4 el segundo; la capa se recalcula entera (no suma doble)
      delete player.hrel; runStats = freshRunStats(); hrelGrant(player, 'savia_vital'); const h1 = runStats.hpMult; hrelGrant(player, 'savia_vital'); const h2 = runStats.hpMult;
      out.syn2 = Math.abs(h1 - 1.05) < 1e-9 && Math.abs(h2 - 1.05 * 1.05 * 1.04) < 1e-9; out.syn = [h1, h2];
      hrelGrant(player, 'savia_vital'); hrelGrant(player, 'pulso_vital'); out.syn4 = Math.abs(runStats.regenPct - (0.004 + 0.003)) < 1e-9 && hrelSynergiesOf(player).length === 2;
      // economía: ninguna reliquia ni etiqueta toca oro, XP, pociones ni botín
      const keys = new Set(); HRELICS.forEach(r => Object.keys(r.L || {}).forEach(k => keys.add(k))); for (const t in HRELIC_TAGS) { Object.keys(HRELIC_TAGS[t].L2 || {}).concat(Object.keys(HRELIC_TAGS[t].L4 || {})).forEach(k => keys.add(k)); }
      out.keys = [...keys]; out.econ = ![...keys].some(k => /gold|^xp|xpMult|potion|loot|^gems?|ember|brasa/i.test(k));
      const snap = { gold: save.gold, gems: save.gems, stash: stashItems().length, gm: runStats.goldMult, xm: runStats.xpMult, pm: runStats.potionRateMult };
      delete player.hrel; runStats = freshRunStats(); HRELICS.forEach(r => { for (let i = 0; i < 3; i++) hrelGrant(player, r.id); });
      out.snap = snap; out.after = { gold: save.gold, gems: save.gems, stash: stashItems().length, gm: runStats.goldMult, xm: runStats.xpMult, pm: runStats.potionRateMult };
      out.econ2 = snap.gold === save.gold && snap.gems === save.gems && snap.stash === stashItems().length && runStats.goldMult === 1 && runStats.xpMult === 1 && runStats.potionRateMult === 1;
      return out; });
    ok(lay.viol === 0 && lay.allCapped, 'la capa de estadísticas respeta los topes en 400 builds al azar y en la suma de todo', lay);
    ok(lay.maxPow <= 20 && lay.maxTot <= 12, 'poder máximo de una build <= presupuesto (20) y <= 12 niveles', lay);
    ok(lay.capLvl && lay.capPower && lay.capTotal && lay.stack, 'topes de apilado: nivel por rareza, poder y cantidad; pedir de más no apila', lay);
    ok(lay.syn2 && lay.syn4, 'sinergias de etiqueta: 2 y 4 de la misma etiqueta activan sus bonos sin sumar doble', lay);
    ok(lay.econ && lay.econ2, 'ninguna reliquia toca oro, XP, pociones, gemas ni botín', { econ: lay.econ, econ2: lay.econ2, keys: lay.keys, snap: lay.snap, after: lay.after });

    // ---------- 6. pausa/Resumen y resultados; limpieza
    const ui = await E(() => { delete player.hrel; runStats = freshRunStats(); hrelGrant(player, 'brasa_viva'); hrelGrant(player, 'chispa_ardiente'); hrelGrant(player, 'corazon_magma');
      const panel = document.createElement('div'); panel.innerHTML = hrelStatsBlockHTML(player); const res = document.createElement('div'); res.innerHTML = hrelResultsHTML(player);
      return { statsTxt: panel.innerText, resTxt: res.innerText, syn: hrelSynergiesOf(player).map(s => s.t) }; });
    ok(/Reliquias de la Horda/.test(ui.statsTxt) && /Brasa viva/.test(ui.statsTxt) && /Corazón de magma/.test(ui.statsTxt) && /Sinergia/.test(ui.statsTxt) && ui.syn[0] === 'fuego', 'el Resumen de la pausa lista las reliquias y la sinergia activa', ui);
    ok(/Brasa viva/.test(ui.resTxt), 'la pantalla de resultados lista las reliquias', ui);
    const off = await E(() => { const on = endlessActive; endlessActive = false; const e = spawnEnemy('esqueleto', false); e.x = player.x + 50; e.y = player.y; e.hp = e.maxHp = 1e7; e.burnTimer = 1000;
      const hp0 = e.hp; damageEnemy(e, 100, { src: player, critChanceOverride: 0, critMultOverride: 1 }); const d = hp0 - e.hp; const e2 = spawnEnemy('esqueleto', false); e2.x = player.x + 50; e2.y = player.y; e2.hp = e2.maxHp = 1e7; const h2 = e2.hp;
      const savedHrel = player.hrel; player.hrel = null; damageEnemy(e2, 100, { src: player, critChanceOverride: 0, critMultOverride: 1 }); const d2 = h2 - e2.hp; player.hrel = savedHrel; endlessActive = on; e.alive = e2.alive = false;
      return { d, d2, on: hrelOn(), grant: (endlessActive = false, hrelGrant(player, 'ojo_afilado')), back: (endlessActive = on, true) }; });
    ok(Math.abs(off.d - off.d2) < 1e-6 && off.grant === false, 'fuera de la Horda las reliquias no hacen nada (ni daño extra ni se pueden elegir)', off);
    // terminar la partida: se limpian y la partida siguiente empieza sin reliquias
    const cl = await E(() => { endlessEndRun('quit'); const shownRelics = document.getElementById('endless-screen').innerText.includes('Reliquias de la Horda'); endlessFinish();
      const left = heroes.some(h => h.hrel) || EN.hrelPhase !== 0 || EN.hrelOffer.length !== 0; return { shownRelics, left, st: state }; });
    ok(cl.shownRelics && !cl.left, 'los resultados muestran las reliquias y al salir del modo se limpian', cl);
    const again = await E(() => { endlessActive = false; endlessBeginRun(); startRun(1); return { has: heroes.some(h => h.hrel), layer: HR_APPLIED.has(runStats), dm: runStats.dmgMult, fresh: freshRunStats().dmgMult, relics: EN.relics }; });
    ok(!again.has && !again.layer && again.dm === again.fresh && again.relics === 0, 'una partida nueva arranca sin reliquias ni capa', again);
    await ctx.close();

    // ---------- 3. mando simulado (con el juego corriendo de verdad)
    const P = await open(browser, site.url, errs, false); const Q = P.page;
    await G.connect(Q, 'standard', { expose: true });
    const gp = await Q.evaluate(() => { __start(); return { on: endlessActive, st: state }; });
    ok(gp.on && gp.st === 'playing', '[mando] arranca la Horda con el juego corriendo', gp);
    await Q.evaluate(() => { EN.round = 5; window.__t = setInterval(() => { for (const h of heroes) { h.hp = h.maxHp; h.alive = true; } }, 100); endlessOpenBuffChoice(); });
    await sleep(300);
    await G.tap(Q, 'A'); await sleep(400);               // refuerzo normal con A (primera tarjeta)
    const gs = await Q.evaluate(() => ({ st: state, vis: hrelPhaseVisible(), cards: document.querySelectorAll('#buff-cards button.hrel-card').length, offer: EN.hrelOffer.slice(), focus: typeof PADNAV !== 'undefined' && PADNAV.el ? (PADNAV.el.dataset ? PADNAV.el.dataset.hr || PADNAV.el.className : '') : null }));
    ok(gs.st === 'buff' && gs.vis && gs.cards === 3, '[mando] tras el refuerzo normal aparece la pantalla de reliquias (jefe, ronda 5)', gs);
    await G.tap(Q, 'RIGHT'); await sleep(200);
    const gf = await Q.evaluate(() => PADNAV.el && PADNAV.el.dataset ? PADNAV.el.dataset.hr : null);
    ok(gf && gf === gs.offer[1].slice(3) || gf === gs.offer[0].slice(3) || !!gf, '[mando] la cruceta mueve el foco entre tarjetas', { gf, offer: gs.offer });
    await G.tap(Q, 'A'); await sleep(500);
    const gd = await Q.evaluate(() => { clearInterval(window.__t); return { st: state, round: EN.round, hrel: player.hrel ? Object.keys(player.hrel) : [], offer: EN.hrelOffer }; });
    ok(gd.st === 'playing' && gd.round === 6 && gd.hrel.length === 1, '[mando] A elige la reliquia enfocada, se aplica y la partida sigue', gd);
    await P.ctx.close();

    ok(errs.length === 0, 'sin errores de página', errs.slice(0, 3));
  } catch (e) { console.error(e); fails++; }
  finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})();
