'use strict';
/* Botín de la economía V2 con EL MISMO catálogo y las MISMAS reglas que el cliente.
   En vez de duplicar tablas, se ejecutan en un contexto aislado (vm) los módulos reales del juego:
   js/data/{items,sets,loot,legendaries,mage-kit,champion-sets,portadores,mythic-sets-v2,item-identity,affixes,ground-loot}.js y
   js/systems/{items,loot,rewards,affixes,mage-passives,ground-loot}.js. Así el servidor puede emitir los mismos objetos diseñados
   (legendarios con nombre, legendarios de build, Kit de Magos con roleOnly, míticos de receta, únicos de guardián, piezas de set)
   y respeta afinidad por arena, mínimos de arena (BUILD_LEGEND_MIN_ARENA, MAGE_KIT_MIN_ARENA), pesos por set y protección (pity).
   Límite documentado: la dificultad Pesadilla/Infierno no viaja al servidor (se trata como Normal). */
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), crypto = require('node:crypto');
const ROOT = path.join(__dirname, '..');
const FILES = ['js/data/champion-tuning.js', 'js/data/combat-language.js', 'js/data/pricing.js', 'js/data/champions.js', 'js/data/champion-taxonomy.js',
  'js/data/talent-trees.js', 'js/data/arenas.js', 'js/data/items.js', 'js/data/sets.js', 'js/data/loot.js', 'js/data/mythic-sets-v2.js', 'js/data/legendaries.js', 'js/data/mage-kit.js',
  'js/data/champion-sets.js', 'js/data/item-identity.js', 'js/data/rewards.js', 'js/data/portadores.js', 'js/data/affixes.js', 'js/data/ground-loot.js', 'js/data/endless.js',
  'js/systems/items.js', 'js/systems/champion-sets.js', 'js/systems/loot.js', 'js/systems/rewards.js', 'js/systems/affixes.js', 'js/systems/mage-passives.js', 'js/systems/ground-loot.js'];
let CTX = null;
function ctx() {
  if (CTX) return CTX;
  // crypto.randomInt como fuente de azar del servidor: Math.random queda sustituido SOLO dentro del contexto aislado.
  const M = Object.create(Math); M.random = () => crypto.randomInt(0, 2 ** 31) / 2 ** 31;
  const c = vm.createContext({ console: { log() {}, warn() {}, error() {} }, Math: M, Date, performance: { now: () => Date.now() },
    save: { stash: [], champions: {}, lootPity: {} }, persist() {}, currentArena: 'ciudad', selectedClass: 'tanque', player: null, CTX_KINDS: {},
    window: { dispatchEvent() {}, addEventListener() {} }, CustomEvent: function () {}, localStorage: { getItem() { return null; }, setItem() {} },
    __endless: false });
  c.endlessOn = () => c.__endless;
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), c, { filename: f, timeout: 5000 });
  return (CTX = c);
}
// Expone solo lo necesario. Devuelve un objeto de la partida (formato del cliente) o null.
function api() {
  const c = ctx();
  return {
    run(code) { return vm.runInContext(code, c, { timeout: 2000 }); },
    c
  };
}
const SLOT_TYPES = ['arma', 'escudo', 'casco', 'pechera', 'guantes', 'botas'];
/* Tira UN objeto como lo haría el juego.
   o = { arena, grade, champion, owned:Set<designId>, pity:{}, endless:bool, source:'chest'|'ground', highMult, floor, victory, subjefes }
   Devuelve { item, tier, pity } (item: formato cliente, sin uid/owner de servidor). */
function rollOne(o) {
  const a = api(), c = a.c;
  c.__endless = !!o.endless; c.currentArena = o.arena; c.selectedClass = o.champion || 'tanque';
  c.save.stash = [...(o.owned || [])].map(designId => ({ designId, uid: 'o_' + designId }));
  c.save.lootPity = Object.assign({ legendario: 0, set: 0, mitico: 0, unico: 0 }, o.pity || {});
  c.__o = o;
  const out = a.run(`(function(){
    const o = __o, classKey = o.champion || 'tanque', owned = ownedDesignIds();
    let spec;
    if(o.source === 'ground'){
      let tier = o.build ? 'legendario' : groundLootRollTier(o.arena, o.grade || 'B', o.highMult == null ? 1 : o.highMult, save.lootPity, null, o.floor || null);
      spec = o.build ? {tier, build:true} : {tier};
      if(tier === 'set'){ const sp = _rollSetPiece(o.arena, owned, Math.random, classKey); spec = sp ? {tier, setId:sp.setId, designId:sp.designId, type:sp.type} : {tier:'legendario'}; }
    } else {
      const r = rollLoot({arena:o.arena, grade:o.grade || 'A', victory:true, subjefes:o.subjefes || 0, owned:new Set(owned), pity:save.lootPity, classKey, floor:o.floor || null});
      spec = r.items[0] || {tier:'comun'};
    }
    const it = materializeLoot(spec, classKey, o.arena);
    if(it) it.lootTier = spec.tier;
    return {item: it ? JSON.parse(JSON.stringify(it)) : null, tier: spec.tier};
  })()`);
  return out;
}
// Cofre de fin de partida: n objetos (1..3) de victoria, uno solo de consuelo. Reutiliza rollLoot() real (cantidad, piso, pity).
function rollChest(o) {
  const a = api(), c = a.c;
  c.__endless = !!o.endless; c.currentArena = o.arena; c.selectedClass = o.champion || 'tanque';
  c.save.stash = [...(o.owned || [])].map(designId => ({ designId, uid: 'o_' + designId }));
  c.save.lootPity = Object.assign({ legendario: 0, set: 0, mitico: 0, unico: 0 }, o.pity || {});
  c.__o = o;
  return a.run(`(function(){
    const o = __o, classKey = o.champion || 'tanque';
    const res = rollLoot({arena:o.arena, grade:o.grade || 'A', victory:!!o.victory, runLevel:o.runLevel || 0, subjefes:o.subjefes || 0, owned:ownedDesignIds(), pity:save.lootPity, classKey, floor:o.victory ? LOOT_VICTORY_FLOOR : null});
    const items = res.items.map(spec => { const it = materializeLoot(spec, classKey, o.arena); if(it) it.lootTier = spec.tier; return it ? JSON.parse(JSON.stringify(it)) : null; }).filter(Boolean);
    return {items, pity: res.pity, grade: res.grade};
  })()`);
}
// ¿puede esta clase usar el objeto? (diseñado de guardián / roleOnly), igual que canEquipItem del cliente.
function canEquip(item, champion) {
  const a = api(), c = a.c; c.__it = item; c.__ch = champion;
  return a.run('canEquipItem(__ch, __it)');
}
function designedItem(designId) {
  const a = api(); a.c.__d = designId;
  return a.run('(function(){const it = makeDesignedItem(__d); return it ? JSON.parse(JSON.stringify(it)) : null;})()');
}
function designed(id) { const a = api(); a.c.__d = id; return a.run('DESIGNED_ITEMS[__d] ? {id:DESIGNED_ITEMS[__d].id, type:DESIGNED_ITEMS[__d].type, rarity:DESIGNED_ITEMS[__d].rarity, set:DESIGNED_ITEMS[__d].set||null, roleOnly:DESIGNED_ITEMS[__d].roleOnly||null, champion:DESIGNED_ITEMS[__d].champion||null, name:DESIGNED_ITEMS[__d].name} : null'); }
// Primera victoria de campaña: Muy Raro para la primera ranura vacía (FIRST_WIN_LOOT.slotOrder), como loot.js firstWinLootSpec.
// equipment = {slot:uid} del guardián; si no hay ranura vacía, la primera del orden.
function firstWinItem(champion, arena, equipment) {
  const a = api(); a.c.__eq = equipment || {}; a.c.__ar = arena; a.c.__ch = champion;
  return a.run(`(function(){ const order = FIRST_WIN_LOOT.slotOrder.filter(t=>ITEM_TYPES[t]); const type = order.find(t=>!__eq[t]) || order[0];
    const it = makeItem(type, FIRST_WIN_LOOT.tier, __ch, {arena:__ar}); it.ilvl = lootItemLevelFor(__ar); it.lootTier = FIRST_WIN_LOOT.tier; return JSON.parse(JSON.stringify(it)); })()`);
}
function setPieces(setId) { const a = api(); a.c.__s = setId; return a.run('typeof SET_DB!=="undefined" && SET_DB[__s] ? setPieceIds(__s) : []'); }
// Arquetipo procedural de la tienda ("a:<ranura>:<sustantivo>") como Legendario, igual que admin-mailbox.js.
function archetypeItem(type, noun) { const a = api(); a.c.__t = type; a.c.__n = noun; return a.run('(function(){ if(!ITEM_TYPES[__t] || !(ITEM_NOUNS[__t]||[]).includes(__n)) return null; return JSON.parse(JSON.stringify(makeItem(__t,"legendario",null,{noun:__n}))); })()'); }
// Cofre final de la Horda Infinita (js/data/endless.js): un objeto por umbral alcanzado, calificación según la ronda; gemas desde la ronda 8.
function endlessEnd(round) {
  const a = api(); a.c.__r = round;
  return a.run('({items: ENDLESS_CFG.endChestItems.filter(r=>__r>=r).length, grade: endlessGradeForRound(__r), gems: __r>=10 ? 3 : (__r>=ENDLESS_CFG.endChestMinRound ? 1 : 0)})');
}
function groundCfg() { return api().run('JSON.parse(JSON.stringify(GROUND_LOOT_CFG))'); }
module.exports = { rollOne, rollChest, canEquip, designedItem, designed, setPieces, archetypeItem, firstWinItem, endlessEnd, groundCfg, SLOT_TYPES, ctx };
