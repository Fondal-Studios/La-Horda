"use strict";
/* ============================================================
   js/storage/legacy-champion-ids.js
   MIGRACIÓN DE IDS DE CAMPEÓN (rework del campeón anterior a Ilkan, docs/ILKAN_REWORK.md).
   El campeón con clave "eren" pasó a ser el personaje original "ilkan". Nadie pierde progreso: al cargar
   un guardado (localStorage, nube o código de guardado) y al recibirlo el servidor, todo lo que estaba bajo
   la clave vieja se mueve a la nueva, con sus niveles, XP, talentos, maestrías, equipo, estadísticas y
   objetos. Idempotente: aplicarla dos veces (o a un guardado ya migrado) no cambia nada.
   Archivo compartido: lo carga el navegador (script clásico) y el servidor (require / vm).
   ============================================================ */
var LEGACY_CHAMPION_IDS = { eren: "ilkan" };
// Ids de talentos / ramas / maestrías del campeón viejo -> nuevos (por prefijo; el orden importa).
var LEGACY_TALENT_PREFIXES = [
  ["er_m_man_", "il_m_pen_"], ["er_m_ins_", "il_m_dun_"], ["er_m_tit_", "il_m_col_"],
  ["er_man_", "il_pen_"], ["er_ins_", "il_dun_"], ["er_tit_", "il_col_"]
];
var LEGACY_BRANCH_IDS = { maniobras: "pendon", instinto: "duna", titan: "coloso" };

function legacyChampionId(id){
  return (typeof id === "string" && Object.prototype.hasOwnProperty.call(LEGACY_CHAMPION_IDS, id)) ? LEGACY_CHAMPION_IDS[id] : id;
}
function legacyTalentId(id){
  if(typeof id !== "string") return id;
  for(var i = 0; i < LEGACY_TALENT_PREFIXES.length; i++){
    var p = LEGACY_TALENT_PREFIXES[i];
    if(id.indexOf(p[0]) === 0) return p[1] + id.slice(p[0].length);
  }
  return id;
}
function _legacyRemapKeys(obj, fn){
  if(!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  var out = {}, keys = Object.keys(obj);
  for(var i = 0; i < keys.length; i++){
    var nk = fn(keys[i]);
    // si ya existe la clave nueva, se conserva el mayor rango (nunca se pierde un punto)
    if(Object.prototype.hasOwnProperty.call(out, nk) && typeof out[nk] === "number" && typeof obj[keys[i]] === "number") out[nk] = Math.max(out[nk], obj[keys[i]]);
    else out[nk] = obj[keys[i]];
  }
  return out;
}
// Registro de campeón viejo (nivel, talentos...) -> ids de talentos nuevos.
function _legacyMigrateTalents(rec){
  if(!rec || typeof rec !== "object" || !rec.talents || typeof rec.talents !== "object") return;
  var t = rec.talents;
  if(t.nodes) t.nodes = _legacyRemapKeys(t.nodes, legacyTalentId);
  if(t.masteryNodes) t.masteryNodes = _legacyRemapKeys(t.masteryNodes, legacyTalentId);
  if(t.picks) t.picks = _legacyRemapKeys(t.picks, legacyTalentId);
  if(typeof t.mastery === "string" && Object.prototype.hasOwnProperty.call(LEGACY_BRANCH_IDS, t.mastery)) t.mastery = LEGACY_BRANCH_IDS[t.mastery];
}
function _legacyProgress(r){
  if(!r || typeof r !== "object") return -1;
  return (r.unlocked ? 1e7 : 0) + (r.level | 0) * 1e3 + Math.min(999, (r.xp | 0));
}
// campos de texto que guardan un id de campeón: champion, champ, classKey, lastChamp (el guardián elegido la última vez), guardian, fav...
var _LEGACY_VALUE_KEY = /^(champion|champ|classKey|guardian|fav|favorite|hero|heroKey|champKey|lastChamp|lastClass|starterChamp|favChamp|favGuardian)$/i;
var _LEGACY_LIST_KEY = /champ|guardian|ally|allies|roster|party|hero|favorite/i;
var _LEGACY_SKIP_KEY = /^(name|names|user|username|chat|friends|players|text|message|note)$/i;
function _legacyWalk(node, depth, parentKey){
  if(!node || typeof node !== "object" || depth > 8) return false;
  var changed = false;
  if(Array.isArray(node)){
    for(var i = 0; i < node.length; i++){
      var v = node[i];
      if(typeof v === "string"){ if(_LEGACY_LIST_KEY.test(parentKey || "") && legacyChampionId(v) !== v){ node[i] = legacyChampionId(v); changed = true; } }
      else if(_legacyWalk(v, depth + 1, parentKey)) changed = true;
    }
    return changed;
  }
  var keys = Object.keys(node);
  for(var j = 0; j < keys.length; j++){
    var k = keys[j], val = node[k];
    if(_LEGACY_SKIP_KEY.test(k)) continue;
    if(Object.prototype.hasOwnProperty.call(LEGACY_CHAMPION_IDS, k) && depth > 0){
      var nk = LEGACY_CHAMPION_IDS[k];
      if(!Object.prototype.hasOwnProperty.call(node, nk)) node[nk] = val;
      else if(val && typeof val === "object" && node[nk] && typeof node[nk] === "object") { for(var q in val) if(!(q in node[nk])) node[nk][q] = val[q]; }
      else if(typeof val === "number" && typeof node[nk] === "number") node[nk] += val;
      delete node[k]; changed = true; val = node[nk]; k = nk;
    }
    if(typeof val === "string"){
      if(_LEGACY_VALUE_KEY.test(k) && legacyChampionId(val) !== val){ node[k] = legacyChampionId(val); changed = true; }
    } else if(val && typeof val === "object"){
      if(_legacyWalk(val, depth + 1, k)) changed = true;
    }
  }
  return changed;
}
// data = guardado completo (objeto ya parseado). opts.refreshItem(it): callback del cliente para refrescar
// el nombre/descripcion de objetos de set cuyo texto cambió (recibe cada objeto del inventario).
// Devuelve true si cambió algo.
function legacyChampionMigrate(data, opts){
  if(!data || typeof data !== "object") return false;
  var changed = false;
  var champs = data.champions;
  if(champs && typeof champs === "object" && !Array.isArray(champs)){
    for(var legacy in LEGACY_CHAMPION_IDS){
      var nid = LEGACY_CHAMPION_IDS[legacy];
      if(Object.prototype.hasOwnProperty.call(champs, legacy)){
        var old = champs[legacy], cur = champs[nid];
        // el registro con más progreso manda (el de la clave nueva solo puede ser uno recién creado por defecto)
        champs[nid] = (cur && _legacyProgress(cur) > _legacyProgress(old)) ? cur : old;
        delete champs[legacy];
        changed = true;
      }
      if(champs[nid]) _legacyMigrateTalents(champs[nid]);
    }
  }
  var keys = Object.keys(data);
  for(var i = 0; i < keys.length; i++){
    if(keys[i] === "champions") continue;
    if(typeof data[keys[i]] === "string"){
      if(_LEGACY_VALUE_KEY.test(keys[i]) && legacyChampionId(data[keys[i]]) !== data[keys[i]]){ data[keys[i]] = legacyChampionId(data[keys[i]]); changed = true; }
      continue;
    }
    if(_legacyWalk(data[keys[i]], 1, keys[i])) changed = true;
  }
  // objetos que quedaron en el inventario por campeón (formato viejo) y en el inventario de la cuenta
  var lists = [];
  if(Array.isArray(data.stash)) lists.push(data.stash);
  if(champs && typeof champs === "object") for(var c in champs){ var rec = champs[c]; if(rec && Array.isArray(rec.inventory)) lists.push(rec.inventory); if(rec && Array.isArray(rec._legacyInventory)) lists.push(rec._legacyInventory); }
  for(var l = 0; l < lists.length; l++) for(var m = 0; m < lists[l].length; m++){
    var it = lists[l][m];
    if(it && typeof it === "object"){
      if(typeof it.champion === "string" && legacyChampionId(it.champion) !== it.champion){ it.champion = legacyChampionId(it.champion); changed = true; }
      if(opts && typeof opts.refreshItem === "function" && opts.refreshItem(it)) changed = true;
    }
  }
  return changed;
}
if(typeof module !== "undefined" && module.exports) module.exports = { LEGACY_CHAMPION_IDS: LEGACY_CHAMPION_IDS, legacyChampionId: legacyChampionId, legacyTalentId: legacyTalentId, legacyChampionMigrate: legacyChampionMigrate };
