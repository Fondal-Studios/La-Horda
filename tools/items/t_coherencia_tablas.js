// COHERENCIA de las TABLAS de botín y de XP (docs/economy/COHERENCIA.md). Sin navegador: carga en Node (vm) el código REAL de
//   js/data/{arenas,loot,items,item-identity}.js, js/systems/{loot,progression,difficulty,difficulty-tiers}.js y comprueba:
//   PODER   el poder esperado de lo que cae (rareza x nivel de objeto x nivel de Gemas) NO baja de una arena a la siguiente dentro de una dificultad
//           (se permite meseta, no caída), el primer escalón de Pesadilla/Infierno paga al menos lo que pagó el último de la anterior (el salto se premia)
//           y Pesadilla/Infierno pagan más que Normal en la MISMA arena;
//   NIVEL   el nivel de objeto de lo que cae es único por (dificultad, arena), crece y no pasa de ITEM_ILVL_MAX; la Divina (sin número) cae con el tope de Normal;
//   XP      la XP de victoria nunca pasa de capLevels niveles al nivel esperado, no baja con el puntaje, la Ciudad no vuelve a dar +5.554 y el cociente
//           victoria/tope respeta que Pesadilla/Infierno suman más XP que Normal;
//   CONF    la dificultad tiene sus perillas (ilvlBase, lootRowShift) y el oro de Pesadilla/Infierno NO bajó (decisión del dueño: gold 1,5 / 2).
//   node tools/items/t_coherencia_tablas.js
const fs = require('fs'); const path = require('path'); const vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 500) : '')); if (!ok) fails++; };
const ctx = { console, location: { search: '' }, window: { addEventListener() {} }, URLSearchParams, Math, document: { addEventListener() {} } };
vm.createContext(ctx);
for (const f of ['js/data/arenas.js', 'js/data/items.js', 'js/data/loot.js', 'js/data/legendaries.js', 'js/data/item-identity.js', 'js/systems/progression.js', 'js/systems/difficulty.js', 'js/systems/difficulty-tiers.js', 'js/systems/loot.js']) {
  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); } catch (e) { if (!/is not defined/.test(e.message)) { console.log('FAIL carga ' + f + ': ' + e.message); fails++; } }
}
const G = k => vm.runInContext(`typeof ${k}!=="undefined" ? ${k} : undefined`, ctx);
const set = (tier) => { ctx.__tier = tier; vm.runInContext('diffCurrent = function(){ return __tier; }', ctx); };
const ORDER = G('CAMPAIGN_ORDER'), TIERS = G('DIFF_TIER_ORDER'), DT = G('DIFF_TIERS');
const RV = G('RARITY_VALUES'), ARENA_LOOT = G('ARENA_LOOT'), ITEM_ILVL_STEP = G('ITEM_ILVL_STEP'), ITEM_LEVEL_STEP = G('ITEM_LEVEL_STEP'), ITEM_ILVL_MAX = G('ITEM_ILVL_MAX'), ITEM_ILVL_NORMAL_MAX = G('ITEM_ILVL_NORMAL_MAX');
const lootTierWeights = G('lootTierWeights'), lootItemLevelFor = G('lootItemLevelFor'), xpToNext = G('xpToNext'), victoryXpFor = G('victoryXpFor'), CFG = G('VICTORY_XP_CFG');
check('CARGA.funciones', [ORDER, TIERS, DT, RV, ARENA_LOOT, lootTierWeights, lootItemLevelFor, xpToNext, victoryXpFor, CFG, ITEM_ILVL_MAX].every(x => x !== undefined));
const slots = Object.keys(RV);
const V = (rar) => slots.reduce((s, sl) => s + RV[sl][rar === 'set' ? 'legendario' : rar], 0) / slots.length;   // poder base medio por ranura (el Set vale como Legendario)
const cat = { comun: 'comun', raro: 'raro', muyraro: 'muyraro', legendario: 'legendario', mitico: 'mitico', set: 'set', unico: 'unico' };
// poder esperado de UN objeto del cofre (calificación A) en (dificultad, arena)
function power(tier, arena, grade) {
  set(tier);
  const w = lootTierWeights(arena, grade || 'A', null, false); let tot = 0, e = 0;
  for (const t in w) { tot += w[t]; e += w[t] * V(cat[t]); }
  const lvl = 1 + (DT[tier].itemLvl || 0), il = lootItemLevelFor(arena);
  return { exp: e / tot * (1 + ITEM_LEVEL_STEP * (lvl - 1)) * (1 + ITEM_ILVL_STEP * (il - 1)), base: e / tot, il, lvl, hi: (w.legendario + w.mitico + w.set + w.unico) / tot };
}
const P = {}; for (const t of TIERS) { P[t] = {}; for (const a of ORDER) P[t][a] = power(t, a); }
const row = t => ORDER.map(a => +P[t][a].exp.toFixed(3));
console.log('PODER esperado por objeto (A):', JSON.stringify({ normal: row('normal'), pesadilla: row('pesadilla'), infierno: row('infierno') }));
for (const t of TIERS) {
  const r = row(t);
  check('PODER.' + t + '.no_baja_de_una_arena_a_la_siguiente', r.every((v, i) => i === 0 || v >= r[i - 1] - 1e-9), r);
  check('PODER.' + t + '.sube_de_la_primera_a_la_ultima_(Normal >=30%; Pesadilla/Infierno >=20%: la rareza ya llega al tope y sube el nivel de objeto)', r[r.length - 1] >= r[0] * (t === 'normal' ? 1.3 : 1.2), [r[0], r[r.length - 1]]);
}
for (let i = 1; i < TIERS.length; i++) {
  const prev = row(TIERS[i - 1]), cur = row(TIERS[i]);
  check('PODER.salto_' + TIERS[i] + '_primer_escalon_>=_ultimo_de_' + TIERS[i - 1], cur[0] >= prev[prev.length - 1] * 0.97, [cur[0], prev[prev.length - 1]]);
  check('PODER.' + TIERS[i] + '_paga_mas_que_' + TIERS[i - 1] + '_en_cada_arena', cur.every((v, k) => v > prev[k]), { prev, cur });
}
// Legendario o mejor: la probabilidad por objeto tampoco baja entre arenas ni entre dificultades en la misma arena
for (const t of TIERS) { const h = ORDER.map(a => P[t][a].hi); check('PODER.' + t + '.prob_legendario_o_mas_no_baja', h.every((v, i) => i === 0 || v >= h[i - 1] - 1e-9), h.map(x => +x.toFixed(4))); }
check('PODER.prob_legendario_o_mas_pesadilla_e_infierno_mayor_en_cada_arena', ORDER.every(a => P.pesadilla[a].hi > P.normal[a].hi && P.infierno[a].hi > P.pesadilla[a].hi));
// ---- NIVEL de objeto ----
const IL = {}; for (const t of TIERS) { set(t); IL[t] = ORDER.map(a => lootItemLevelFor(a)); }
check('NIVEL.normal_1_a_10_como_siempre', JSON.stringify(IL.normal) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), IL.normal);
for (const t of TIERS) check('NIVEL.' + t + '.estrictamente_creciente_y_<=_tope', IL[t].every((v, i) => (i === 0 || v === IL[t][i - 1] + 1) && v <= ITEM_ILVL_MAX), IL[t]);
check('NIVEL.arena_siguiente_de_la_dificultad_empieza_donde_termina_la_otra_(sin_pozo)', IL.pesadilla[0] >= IL.normal[9] - 2 && IL.infierno[0] >= IL.pesadilla[9] - 2, { pes0: IL.pesadilla[0], norEnd: IL.normal[9], inf0: IL.infierno[0], pesEnd: IL.pesadilla[9] });
check('NIVEL.el_tope_alcanza_a_Infierno_Infernal', IL.infierno[9] <= ITEM_ILVL_MAX, [IL.infierno[9], ITEM_ILVL_MAX]);
set('infierno'); check('NIVEL.arena_sin_numero_(Divina)_cae_con_el_tope_de_Normal', lootItemLevelFor('divina') === ITEM_ILVL_NORMAL_MAX, lootItemLevelFor('divina'));
set('normal');
// ---- XP de victoria ----
const caps = [];
for (const t of TIERS) for (const a of ORDER) {
  const ref = Math.min(98, Math.max(1, (CFG.ref[a] || 1) + (DT[t].lvlOffset || 0)));
  const top = Math.round(xpToNext(ref) * CFG.capLevels), got = victoryXpFor(a, 100, 1, t), got0 = victoryXpFor(a, 0, 1, t);
  caps.push({ t, a, ref, got, top, ok: got <= top && got0 >= Math.round(xpToNext(ref) * CFG.minLevels) && got >= got0 });
}
check('XP.victoria_nunca_pasa_del_tope_(capLevels_niveles_al_nivel_esperado)', caps.every(c => c.ok), caps.filter(c => !c.ok).slice(0, 3));
check('XP.sube_con_el_puntaje', ORDER.every(a => TIERS.every(t => { let prev = -1; for (let s = 0; s <= 100; s += 10) { const v = victoryXpFor(a, s, 30, t); if (v < prev) return false; prev = v; } return true; })));
check('XP.Ciudad_Normal_ya_no_da_+5.554_(menos_de_1_nivel_de_su_nivel_esperado)', victoryXpFor('ciudad', 100, 18, 'normal') < xpToNext(CFG.ref.ciudad) * 1.5 && victoryXpFor('ciudad', 100, 18, 'normal') < 2000, victoryXpFor('ciudad', 100, 18, 'normal'));
check('XP.Pesadilla_e_Infierno_pagan_mas_niveles_que_Normal_(hasta_el_tope)', ORDER.every(a => victoryXpFor(a, 80, 1, 'pesadilla') / xpToNext(Math.min(98, CFG.ref[a] + DT.pesadilla.lvlOffset)) >= victoryXpFor(a, 80, 1, 'normal') / xpToNext(CFG.ref[a]) - 1e-9));
check('XP.el_tope_es_de_niveles_y_<=_1,5', CFG.capLevels <= 1.5 && CFG.maxLevels <= CFG.capLevels, CFG);
// ---- Configuración ----
check('CONF.perillas_de_botin_en_DIFF_TIERS', TIERS.every(t => typeof DT[t].ilvlBase === 'number' && typeof DT[t].lootRowShift === 'number' && typeof DT[t].lootFactor === 'number' && typeof DT[t].itemLvl === 'number'), TIERS.map(t => [DT[t].ilvlBase, DT[t].lootRowShift]));
check('CONF.perillas_crecen_Normal_<_Pesadilla_<_Infierno', DT.normal.ilvlBase === 0 && DT.normal.lootRowShift === 0 && DT.pesadilla.ilvlBase > 0 && DT.infierno.ilvlBase > DT.pesadilla.ilvlBase && DT.infierno.lootRowShift >= DT.pesadilla.lootRowShift && DT.pesadilla.lootRowShift > 0);
check('CONF.oro_de_Pesadilla_e_Infierno_no_baja_(decision_del_dueno)', DT.normal.gold === 1 && DT.pesadilla.gold >= 1.5 && DT.infierno.gold >= 2 && DT.infierno.gold > DT.pesadilla.gold, [DT.normal.gold, DT.pesadilla.gold, DT.infierno.gold]);
console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK'); process.exit(fails ? 1 : 0);
