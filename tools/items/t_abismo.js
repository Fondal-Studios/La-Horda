// ARENA DEL ABISMO: orden de campaña, estados del piso (STABLE -> CRACKED -> CRITICAL -> COLLAPSE ->
// REBUILD), regla de seguridad (siempre piso conectado, la entrada nunca cae), caminar nunca tira,
// los empujones sí (enemigos al vacío), colgarse + RESCATAR, trepar solo si nadie puede ayudar,
// metadata "terrain" de habilidades, sin fuego amigo, Carcelero (nivel 9), El Que Mora Debajo
// (nivel 10: fases, patrones con piso mínimo, muerte) y estado de red compacto.
//   (python3 -m http.server 8771 &) ; node tools/items/t_abismo.js
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
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::|404/.test(m.text())) errors.push('console: ' + m.text().slice(0, 300)); });
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  await sleep(1500);
  const E = (fn, a) => page.evaluate(fn, a);
  await E(() => { loop = function(){};
    window.__run = (lv, allies) => {
      for (const k of Object.keys(save.champions)){ save.champions[k].unlocked = true; save.champions[k].level = 24; }
      selectedClass = 'guerrero'; currentArena = 'abismo'; lobbyAllies = allies || ['mago','soporte','tanque']; startRun(lv || 1);
      spawnTimer = 1e12; enemies.length = 0; levelDuration = 9e9; return player;
    };
    window.__tick = (ms) => { for (let t = 0; t < ms; t += 16){ for (const h of heroes) if (h.alive) h.hp = Math.max(h.hp, h.maxHp*0.9); update(16); } };
    window.__idx = id => AB_PLATS.findIndex(p => p.id === id);
    window.__edgeOf = (id) => { const i = __idx(id), c = abPlatCenter(AB_PLATS[i]), p = AB_PLATS[i];   // un punto del piso pegado al borde (hacia afuera del mapa)
      const a = Math.atan2(c.y/AB_ASP, c.x); let x = c.x, y = c.y;
      for (let s = 0; s < 400; s += 2){ const nx = c.x + Math.cos(a)*s, ny = c.y + Math.sin(a)*s*AB_ASP; if (!abWalkable(nx, ny, AB_EDGE)) break; x = nx; y = ny; }
      return {x, y, ux:Math.cos(a), uy:Math.sin(a)*AB_ASP}; };
  });

  // ---------- registro y orden de campaña ----------
  const reg = await E(() => ({ order: ARENA_ORDER.slice(), def: !!ARENA_DEFS.abismo, mods: !!ARENA_MODS.abismo, rules: !!ARENA_RULES.abismo,
    atlas: Object.keys(ABISMO_ATLAS).filter(k => ENEMY_ATLAS_PACK[k] && ENEMY_ATLAS_PACK[k].ready).length, fx: Object.keys(ABISMO_FX).length,
    enemies: ['ab_errante','ab_acechador','ab_heraldo','ab_devorador','ab_tejedor','ab_jinete','ab_carcelero','ab_morador'].every(t => ENEMY_BASE[t]) }));
  // Orden canónico (docs/lore/LA_HORDA_LORE_BIBLE.md): Laberinto (07) → Abismo (08, punto de no retorno) → Minas (09) → Infernal (10)
  check('ORDEN.abismo_entre_laberinto_y_minas', reg.order.indexOf('abismo') > reg.order.indexOf('laberinto') && reg.order.indexOf('abismo') === reg.order.indexOf('minas') - 1 && reg.order.indexOf('minas') === reg.order.indexOf('infernal') - 1, reg.order);
  check('REGISTRO.arena_mods_reglas', reg.def && reg.mods && reg.rules);
  check('ARTE.7_atlas_cargados', reg.atlas === 7, reg);
  check('ARTE.fx_de_la_hoja', reg.fx >= 30, reg.fx);
  check('DATOS.fichas_de_enemigos', reg.enemies);

  // ---------- estados del piso ----------
  const st = await E(() => { __run(3); const i = __idx('s0'), S = abS.p[i], out = [];
    abDamagePlat(i, 34); out.push(S.st); abDamagePlat(i, 33); out.push(S.st); abDamagePlat(i, 40); out.push(S.st);
    __tick(AB_CFG.plat.fallWarn + 100); out.push(S.st);
    abRebuildAll(0); out.push(S.st); __tick(AB_CFG.plat.rebuildMs + 100); out.push(S.st, Math.round(S.hp));
    return out; });
  check('PISO.stable_cracked_critical_collapse_gone', st[0] === 1 && st[1] === 2 && st[2] === 3 && st[3] === 4, st);
  check('PISO.reconstruccion_entre_niveles', st[4] === 5 && st[5] === 0 && st[6] === 100, st);

  const safe = await E(() => { __run(3); for (let k = 0; k < 3; k++) for (let i = 0; i < AB_PLATS.length; i++) abDamagePlat(i, 999); __tick(AB_CFG.plat.fallWarn + 200);
    const solid = abS.p.filter(p => p.st <= 2).length, anchor = abS.p[AB_ENTRY].st;
    const seen = abComponentOf(AB_ENTRY); let reach = 0; for (let i = 0; i < AB_PLATS.length; i++) if (abS.p[i].st <= 2 && seen[i]) reach++;
    return { solid, anchor, reach, min: Math.ceil(AB_PLATS.length*0.55) }; });
  check('SEGURIDAD.siempre_queda_piso_minimo', safe.solid >= safe.min, safe);
  check('SEGURIDAD.la_entrada_nunca_cae', safe.anchor <= 2, safe);
  check('SEGURIDAD.todo_conectado_a_la_entrada', safe.reach === safe.solid, safe);

  const dev = await E(() => { __run(3); const i = __idx('h0'); for (let k = 0; k < 20; k++) abDamagePlat(i, 30, {cap:1}); return abS.p[i].st; });
  check('DEVORADOR.agrieta_pero_nunca_derrumba_solo', dev === 2, dev);

  const ff = await E(() => { __run(3); const i = __idx('h0'), c = abPlatCenter(AB_PLATS[i]); player.x = c.x; player.y = c.y;
    abDamageArea(c.x, c.y, 200, 999, {heroSafe:true}); const a = abS.p[i].st;
    envEmit('terrain', c.x, c.y, player, {r:200, dmg:999}); return {a, b: abS.p[i].st}; });
  check('SIN_FUEGO_AMIGO.habilidades_no_tiran_a_un_aliado', ff.a === 2 && ff.b === 2, ff);

  const terr = await E(() => { __run(3); const i = __idx('o2'), c = abPlatCenter(AB_PLATS[i]); player.x = AB_MAP.start.x; player.y = AB_MAP.start.y;
    const before = abS.p[i].hp; envEmit('terrain', c.x, c.y, player, {r:120, dmg:40});
    return { before, after: abS.p[i].hp, table: typeof SKILL_TERRAIN !== 'undefined' && Object.keys(SKILL_TERRAIN).length, perKind: !!SKILL_TERRAIN.colossus_sinkhole && !SKILL_TERRAIN.guerrero }; });
  check('TERRAIN.metadata_por_tipo_de_habilidad', terr.after < terr.before && terr.table >= 10 && terr.perKind, terr);

  // ---------- caminar no tira; empujar sí ----------
  const walk = await E(() => { __run(3); const p = __edgeOf('h0'); player.x = p.x + p.ux*30; player.y = p.y + p.uy*30; clampToArena(player);
    return { hang: !!player.abHang, onGround: abWalkable(player.x, player.y, 0) }; });
  check('CAMINAR.nunca_te_tira_al_vacio', !walk.hang && walk.onGround, walk);

  const voidk = await E(() => { __run(3); const p = __edgeOf('h0'); const e = abSpawnAt('ab_errante', p.x - p.ux*6, p.y - p.uy*6); e.abEmerge = 0;
    player.x = p.x - p.ux*60; player.y = p.y - p.uy*60; const vk = abS.voidKills;
    damageEnemy(e, 1, {src:player, knockback:true}); __tick(64);
    return { alive: e.alive, fell: !!e.abFall, vk: abS.voidKills - vk }; });
  check('VACIO.un_empujon_de_habilidad_tira_al_enemigo', !voidk.alive && voidk.fell && voidk.vk === 1, voidk);

  const jin = await E(() => { __run(3); const p = __edgeOf('h0'); const e = abSpawnAt('ab_devorador', p.x - p.ux*20, p.y - p.uy*20); e.abEmerge = 0; e.hp = e.maxHp = 1e6;
    abShove(e, p.ux, p.uy, 190, player); __tick(400); return { alive: e.alive, fell: !!e.abFall }; });
  check('JINETE.su_empuje_tira_a_la_horda_al_vacio', !jin.alive && jin.fell, jin);

  // ---------- colgarse, rescatar, caer ----------
  const hang = await E(() => { __run(3); const h = heroes[1]; const p = __edgeOf('h0'); h.x = p.x - p.ux*8; h.y = p.y - p.uy*8;
    abShove(h, p.ux, p.uy, 120, null); for (let t = 0; t < 300; t += 16){ abShoveUpdate(h, 16); abClamp(h); }
    const hung = !!h.abHang, locked = heroMoveLocked(h), dmgMult = heroDmgTakenMult(h);
    const r = abS.rescue[0], helper = heroes[2]; helper.x = r.x; helper.y = r.y;
    let rescued = false; for (let t = 0; t < 3000 && !rescued; t += 16){ helper.x = r.x; helper.y = r.y; helper._ctxHold = r.id; update(16); rescued = !h.abHang; }
    return { hung, locked, dmgMult, rescued, alive: h.alive, onGround: abWalkable(h.x, h.y, 0) }; });
  check('CAIDA.queda_colgado_del_borde', hang.hung, hang);
  check('CAIDA.colgado_no_se_mueve_ni_recibe_golpes', hang.locked && hang.dmgMult === 0, hang);
  check('RESCATE.un_aliado_lo_sube_con_RESCATAR', hang.rescued && hang.alive && hang.onGround, hang);

  const fall = await E(() => { __run(3, ['mago','soporte']); const h = heroes[1]; const p = __edgeOf('h4'); h.x = p.x; h.y = p.y; abHangStart(h);
    for (const o of heroes) if (o !== h && o !== player) { o.alive = false; }
    player.x = AB_MAP.start.x; player.y = AB_MAP.start.y;
    const spy = []; const oc = abRescue; abRescue = function(){ spy.push('rescue'); return oc.apply(this, arguments); };
    for (let t = 0; t < AB_CFG.hang.ms + 400; t += 16){ player.x = AB_MAP.start.x; player.y = AB_MAP.start.y; heroes.forEach(o=>{ if(o!==h && o!==player) o.alive = false; }); update(16); }
    abRescue = oc; return { alive: h.alive, hang: !!h.abHang, spy: spy.length }; });
  check('CAIDA.sin_rescate_cae_y_usa_muerte_normal', !fall.alive && !fall.hang && fall.spy === 0, fall);

  const solo = await E(() => { __run(3, ['mago']); const p = __edgeOf('h0'); player.x = p.x; player.y = p.y; abHangStart(player);
    heroes.forEach(o => { if (o !== player) o.alive = false; });
    let t = 0; while (player.abHang && t < 9000){ heroes.forEach(o => { if (o !== player) o.alive = false; }); update(16); t += 16; }
    return { hang: !!player.abHang, alive: player.alive, t, need: AB_CFG.hang.soloClimbMs }; });
  check('SEGURIDAD.si_nadie_puede_rescatar_trepa_solo', !solo.hang && solo.alive && solo.t >= solo.need - 100, solo);

  const bots = await E(() => { __run(3); allies.forEach(a => { a.x = AB_MAP.start.x + 60; a.y = AB_MAP.start.y - 40; });
    const h = heroes[1]; const p = __edgeOf('h2'); h.x = p.x; h.y = p.y; abHangStart(h);
    let t = 0; while (h.abHang && t < AB_CFG.hang.ms){ update(16); t += 16; } return { rescued: !h.abHang && h.alive, t }; });
  check('BOTS.rescatan_al_compañero_colgado', bots.rescued, bots);

  const esc = await E(() => { __run(3); allies.push(player); const out = [];
    for (const pid of ['s1','r3','o5']){
      const i = __idx(pid), c = abPlatCenter(AB_PLATS[i]);
      heroes.forEach((h, k) => { h.x = c.x + (k-1.5)*14; h.y = c.y + (k%2)*10; h.abHang = null; h.alive = true; });
      abS.p[i].hp = 1; abDamagePlat(i, 50); __tick(AB_CFG.plat.fallWarn + 400);
      out.push(heroes.filter(h => h.abHang).length); for (const h of heroes) if (h.abHang) abRescue(h, null);
      abRebuildAll(100); __tick(AB_CFG.plat.rebuildMs + 200);
    }
    allies.splice(allies.indexOf(player), 1); return out; });
  check('BOTS.escapan_de_la_plataforma_que_se_derrumba', esc.every(n => n === 0), esc);

  // ---------- oleadas: introducción progresiva ----------
  const pools = await E(() => { const o = {}; for (const lv of [1,2,3,4,5,6,9]) o[lv] = abSpawnPool(lv).filter(p => p.w > 0).map(p => p.t.replace('ab_','')); return o; });
  check('OLEADAS.una_mecanica_nueva_por_nivel', pools[1].length === 1 && pools[2].includes('acechador') && pools[3].includes('heraldo') && pools[4].includes('devorador') && pools[5].includes('tejedor') && pools[6].includes('jinete'), pools);

  // ---------- Carcelero (nivel 9) ----------
  const ca = await E(() => { __run(9); levelDuration = 60000; levelTimer = levelDuration*0.46; __tick(200);
    const rise = abS.ca.st; __tick(3800); const e = enemies.find(o => o.alive && o.type === 'ab_carcelero');
    const hold = !!arenaHook('holdLevel'); const chains = abS.chains.filter(c => !c.hook).length;
    e.hp = e.maxHp*0.6;
    // se espera a la condición (la IA rompe la cadena al 66 %), no 300 ms fijos: un aliado aturde al subjefe al azar (medido 3 de 120 corridas, stun 160-304 ms)
    // y mientras `stunTimer>0` update.js salta su IA, así que broken1 quedaba en 0. Tope 4 s: sin el cambio de fase la prueba sigue fallando.
    for (let g = 0; g < 4000 && !(abS.ca.broken & 1); g += 16) __tick(16);
    const broken1 = abS.ca.broken & 1;
    e.hp = 1; damageEnemy(e, 999999, {src:player}); __tick(300);
    return { rise, fight: !!e, hold, chains, broken1, dead: abS.ca.st, holdAfter: !!arenaHook('holdLevel') }; });
  check('CARCELERO.aparece_a_mitad_del_nivel_9_y_retiene_el_nivel', ca.rise === 'rise' && ca.fight && ca.hold, ca);
  check('CARCELERO.cadenas_ancladas_y_se_rompen_por_fase', ca.chains === 4 && ca.broken1 === 1, ca);
  check('CARCELERO.al_morir_libera_el_nivel', ca.dead === 'dead' && !ca.holdAfter, ca);

  // ---------- Carcelero atascado (informe SIMULACION_ALFA_30, crítica 2) ----------
  // Causa: la grilla de navegación (celdas de 40 u, borde de 16 u) pierde los cuellos de 30 u donde se tocan los hubs
  // con los puentes: el Carcelero parado en un puente del NO veía distancia infinita a los héroes, iba derecho al vacío,
  // abClamp lo devolvía al borde y el nivel 9 esperaba para siempre. Estado real capturado en la partida atascada:
  const STALL = 'h0:0 h1:0 h2:1 h3:2 h4:4 h5:1 h6:0 h7:0 s0:0 s1:0 s2:0 s3:1 s4:4 s5:1 s6:4 s7:0 o0:4 o1:2 o2:2 o3:4 o4:4 o5:2 o6:0 o7:4 r0:0 r1:0 r2:0 r3:4 r4:4 r5:4 r6:1 r7:0';
  const nv = await E((st) => { __run(9);
    st.split(' ').forEach((q, i) => { abS.p[i].st = +q.split(':')[1]; }); abNavMaybe();
    for (const h of heroes) { h.x = -526; h.y = 415; h.hp = h.maxHp; }
    AID_NAV.t = 0; aidNavUpdate(1);
    // toda plataforma en pie y conectada (grafo de plataformas) debe ser alcanzable por la grilla desde un héroe
    const seen = abComponentOf(AB_ENTRY), miss = [];
    AB_PLATS.forEach((p, i) => { if (!seen[i] || abS.p[i].st > 2) return; const c = abPlatCenter(p), k = aidNavCell(c.x, c.y);
      if (AID_NAV.dist[k] === 65535) miss.push(p.id); });
    // y lo mismo con 150 derrumbes al azar (la regla de seguridad deja siempre un grafo conectado)
    let bad = 0, n = 0; let seed = 12345; const rnd = () => (seed = (seed*1664525 + 1013904223) >>> 0) / 4294967296;
    for (let t = 0; t < 150; t++) {
      for (let i = 0; i < AB_PLATS.length; i++) abS.p[i].st = 0;
      for (let k = 0; k < 14; k++) { const i = Math.floor(rnd()*AB_PLATS.length); if (i === AB_ENTRY) continue; abS.p[i].st = 4; if (!abConnectedWithout(-1).ok) abS.p[i].st = 0; }
      abNavMaybe(); const hc = abPlatCenter(AB_PLATS[AB_ENTRY]); for (const h of heroes) { h.x = hc.x; h.y = hc.y; } AID_NAV.t = 0; aidNavUpdate(1);
      const sn = abComponentOf(AB_ENTRY);
      AB_PLATS.forEach((p, i) => { if (abS.p[i].st > 2 || !sn[i]) return; n++; const c = abPlatCenter(p); if (AID_NAV.dist[aidNavCell(c.x, c.y)] === 65535) bad++; });
    }
    return { miss, bad, n }; }, STALL);
  check('CARCELERO.grilla_de_navegacion_conecta_lo_que_el_mapa_conecta', nv.miss.length === 0 && nv.bad === 0, nv);
  const st2 = await E((st) => { __run(9);
    st.split(' ').forEach((q, i) => { abS.p[i].st = +q.split(':')[1]; }); abNavMaybe();
    levelDuration = 9e9; levelTimer = 1; abCarceleroRise(); abS.ca.t = 3700; __tick(200);
    const e = enemies.find(o => o.alive && o.type === 'ab_carcelero'); const c = abPlatCenter(AB_PLATS[__idx('s5')]);
    e.x = c.x + 110; e.y = c.y - 20; e.hp = e.maxHp*0.9;
    for (const h of heroes) { h.x = -526 + Math.random()*30; h.y = 415; }
    let best = Infinity, tt = 0;
    for (; tt < 150000; tt += 16) { __tick(16); if (!e.alive) break;
      for (const h of heroes) if (h.alive) best = Math.min(best, Math.hypot(h.x - e.x, h.y - e.y)); if (best < 240) break; }
    const cl = aidNavCell(e.x, e.y), d = aidNavDir(e);
    return { best: Math.round(best), t: tt, st: abS.ca.st, x: Math.round(e.x), y: Math.round(e.y), dist: AID_NAV.dist[cl], blk: AID_NAV.blocked[cl], dir: d && [+d.x.toFixed(2), +d.y.toFixed(2)], nb: e._navBlocked, plat: abPlatAt(e.x, e.y, 0) >= 0 && AB_PLATS[abPlatAt(e.x, e.y, 0)].id, w16: abWalkable(e.x, e.y, 16), act: e.abAct && e.abAct.k, busy: e.abBusy, spd: abSpd(e), heroes: heroes.map(h => [Math.round(h.x), Math.round(h.y), h.alive, !!h.abHang]) }; }, STALL);
  check('CARCELERO.alcanza_a_los_heroes_aunque_los_puentes_esten_cortados', st2.best < 240, st2);

  // Tope de espera: aunque algo lo clave (aquí, velocidad 0), a los stuckMs salta junto al equipo en vez de retener el nivel para siempre
  const lp = await E(() => { __run(9); levelDuration = 9e9; levelTimer = 1; abCarceleroRise(); abS.ca.t = 3700; __tick(200);
    const e = enemies.find(o => o.alive && o.type === 'ab_carcelero'); e.speed = 0;
    const hc = abPlatCenter(AB_PLATS[__idx('h2')]); for (const h of heroes) { h.x = hc.x; h.y = hc.y; }
    e.x = -380; e.y = -300; let t = 0, d0 = Math.hypot(player.x - e.x, player.y - e.y), banner = false;
    for (; t < AB_CFG.carcelero.stuckMs + 6000; t += 16) { __tick(16); if (Math.hypot(player.x - e.x, player.y - e.y) < 260) break; }
    return { d0: Math.round(d0), d1: Math.round(Math.hypot(player.x - e.x, player.y - e.y)), t, stuckMs: AB_CFG.carcelero.stuckMs }; });
  check('CARCELERO.tope_de_espera_salta_junto_al_equipo', lp.d1 < 260 && lp.t <= lp.stuckMs + 4000, lp);

  // ---------- El Que Mora Debajo (nivel 10) ----------
  const mo = await E(() => { __run(10); __tick(10200); const b = boss;
    const r = { st: abS.mo.st, boss: b && b.type, ph1: abS.mo.ph };
    b.hp = b.maxHp*0.6; __tick(400); r.ph2 = abS.mo.ph;
    b.patCd = 0; __tick(200); r.pat = abS.mo.pat; __tick(AB_CFG.morador.patWarn + 300);
    r.solid = abS.p.filter(p => p.st <= 2).length; r.minG = Math.ceil(AB_PLATS.length*AB_CFG.morador.minGround);
    const ring = ['r0','r1','r2','r3','r4','r5','r6','r7'].filter(id => abS.p[__idx(id)].st <= 2).length; r.ringLeft = ring;
    b.hp = b.maxHp*0.3; __tick(400); r.ph3 = abS.mo.ph;
    damageEnemy(b, b.hp*10 + 1e6, {src:player}); __tick(200); r.dying = abS.mo.st;
    __tick(AB_CFG.morador.deathMs + 500); r.final = abS.mo.st; r.state = state;
    return r; });
  check('JEFE.despierta_en_el_nivel_10', mo.st === 'fight' && mo.boss === 'ab_morador' && mo.ph1 === 1, mo);
  check('JEFE.tres_fases', mo.ph2 === 2 && mo.ph3 === 3, mo);
  check('JEFE.patron_de_geometria_con_piso_minimo', !!mo.pat && mo.solid >= mo.minG, mo);
  check('JEFE.siempre_hay_anillo_para_pegarle', mo.ringLeft >= 4, mo);
  check('JEFE.secuencia_de_muerte_y_victoria', mo.dying === 'dying' && mo.final === 'dead', mo);

  // ---------- red ----------
  const net = await E(() => { __run(6); const s = abNetState(); const j = JSON.stringify(netSer(s, 1));
    const back = JSON.parse(j); abS = null; abApplyNetState(netDecode(back)); abGuestUpdate(16); render();
    return { bytes: j.length, plats: abS.p.length }; });
  check('RED.estado_compacto_y_aplicable', net.bytes < 4000 && net.plats === 32, net);

  check('SIN_ERRORES', errors.length === 0, errors.slice(0, 5));
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
