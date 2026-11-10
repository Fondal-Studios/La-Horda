"use strict";
/* ============================================================
   js/data/cosmetics-catalog.js
   CATÁLOGO ÚNICO DE COSMÉTICOS (IDENTIDAD). Decisión del dueño: hay DOS sistemas separados.
     · SETS = poder. Se ganan jugando (botín, arenas, Tienda por oro, Forja). Nunca con Brasas.
     · APARIENCIAS = identidad. Brasas, pase, logros, ascensión. Sin estadísticas.
   Este módulo NO guarda nada y NO cambia ningún id ni precio: solo LEE los datos de siempre
   (SET_SKINS, CROMA_SKINS, ASCENSION_SKINS, MYTHIC_APPEARANCES, títulos y marcos del perfil) y los
   ofrece con una forma común para el Probador libre del Códice:
     {id, kind, champ, name, source, price, howTo, effectOnly, ...}
   kind:   "set-skin" | "set-croma" | "skin" | "croma" | "ascension" | "efecto" | "titulo" | "marco"
   source: "set" | "brasas" | "pase" | "logro" | "ascension"
   price:  Brasas ✦ (0 = no se vende). Solo informativo: el precio real lo define js/data/pricing.js.
   champ:  guardián al que pertenece (null = universal, p. ej. los efectos de habilidades).
   Se arma una sola vez, perezosamente (los datos de ascensión se registran después de cargar este archivo).
   ============================================================ */
const COSMETIC_SOURCES = {
  set:        {label:"Reunir un set",       order:0},
  brasas:     {label:"Brasas ✦",            order:1},
  pase:       {label:"Pase de temporada",   order:2},
  logro:      {label:"Logro o racha",       order:3},
  ascension:  {label:"Ascensión",           order:4}
};
// Textos fijos de "cómo conseguirla" (sin datos intercalados: cada oración se traduce entera).
const COSMETIC_HOWTO = {
  set:         "Reuní las piezas del set jugando: caen como botín o se reforjan con piezas repetidas.",
  setBrasas:   "También podés comprar solo esta apariencia con Brasas; no da piezas ni poder.",
  brasas:      "Se compra con Brasas. Es solo un cambio de aspecto: no da poder ni estadísticas.",
  efectoBase:  "Completá en Colección las seis piezas del conjunto: se desbloquea para siempre.",
  efectoBrasas:"Se compra con Brasas en Colección. La Consagrada pide antes la manifestación base.",
  ascension:   "Viene con el guardián: al desbloquearlo elegís esta apariencia con el botón de su ficha.",
  logro:       "Se gana completando logros y hitos de racha; no se compra.",
  pase:        "Es una recompensa del pase de temporada."
};
let _cosmeticsCache = null;
function _cosHex2Rgb(h){ const m = /^#?([0-9a-f]{6})$/i.exec(h||""); if(!m) return "255,190,110"; const n = parseInt(m[1], 16); return `${n>>16&255},${n>>8&255},${n&255}`; }
function _cosPrice(id){ try{ return typeof premiumPrice==="function" ? (premiumPrice(id)|0) : 0; }catch(e){ return 0; } }
function cosmeticsCatalog(){
  if(_cosmeticsCache) return _cosmeticsCache;
  const out = [], seen = new Set();
  const add = e=>{ if(!seen.has(e.id)){ seen.add(e.id); out.push(Object.freeze(e)); } };
  if(typeof SET_SKINS!=="undefined") for(const id of Object.keys(SET_SKINS)){
    const d = SET_SKINS[id];
    if(d.manifest){
      const base = !!d.earnedOnly;
      add({id, kind:"efecto", champ:null, name:d.name, source:base ? "logro" : "brasas", price:base ? 0 : _cosPrice(id), effectOnly:true,
        tint:d.fxTint, tintRgb:_cosHex2Rgb(d.fxTint), howTo:base ? COSMETIC_HOWTO.efectoBase : COSMETIC_HOWTO.efectoBrasas, requiresSet:d.requiresSet || null});
      continue;
    }
    if(typeof SET_DB!=="undefined" && !SET_DB[id]) continue;
    const champ = typeof skinSetChamp==="function" ? skinSetChamp(id) : (d.champ || null);
    const price = _cosPrice(id);
    add({id, kind:(typeof cosmeticIsSetCroma==="function" && cosmeticIsSetCroma(d)) ? "set-croma" : "set-skin", champ, name:d.name || (SET_DB[id] && SET_DB[id].name) || id,
      source:"set", setId:id, price, effectOnly:false, howTo:COSMETIC_HOWTO.set + (price > 0 ? " " + COSMETIC_HOWTO.setBrasas : "")});
  }
  if(typeof CROMA_SKINS!=="undefined") for(const id of Object.keys(CROMA_SKINS)){
    const d = CROMA_SKINS[id];
    add({id, kind:d.appearanceType==="skin" ? "skin" : "croma", champ:d.champ, name:d.name, source:"brasas", price:_cosPrice(id), effectOnly:false, howTo:COSMETIC_HOWTO.brasas});
  }
  if(typeof ASCENSION_SKINS!=="undefined") for(const k of Object.keys(ASCENSION_SKINS)) ASCENSION_SKINS[k].forEach((s, i)=>
    add({id:s.id, kind:"ascension", champ:k, name:s.name, source:"ascension", price:0, effectOnly:false, ascIndex:i+1, howTo:COSMETIC_HOWTO.ascension}));
  // Perfil (título / marco): identidad de la cuenta. Origen: pase de temporada o logro/racha.
  if(typeof SEASON_REWARDS!=="undefined" && typeof QUEST_TITLES!=="undefined"){
    const fromPass = new Set(); for(const r of SEASON_REWARDS){ if(r && r.title) fromPass.add("titulo:" + r.title); if(r && r.frame) fromPass.add("marco:" + r.frame); }
    for(const id of Object.keys(QUEST_TITLES)) add({id:"titulo:" + id, kind:"titulo", champ:null, name:QUEST_TITLES[id].name, source:fromPass.has("titulo:" + id) ? "pase" : "logro", price:0, effectOnly:false,
      howTo:fromPass.has("titulo:" + id) ? COSMETIC_HOWTO.pase : COSMETIC_HOWTO.logro});
    for(const id of Object.keys(QUEST_FRAMES)) add({id:"marco:" + id, kind:"marco", champ:null, name:QUEST_FRAMES[id].name, source:fromPass.has("marco:" + id) ? "pase" : "logro", price:0, effectOnly:false,
      howTo:fromPass.has("marco:" + id) ? COSMETIC_HOWTO.pase : COSMETIC_HOWTO.logro});
  }
  return (_cosmeticsCache = out);
}
function cosmeticEntry(id){ return cosmeticsCatalog().find(e=>e.id===id) || null; }
// Lo que muestra la pestaña Apariencias de un guardián: sus skins/cromas/ascensión + los efectos universales.
function cosmeticsForChampion(key){
  return cosmeticsCatalog().filter(e=>e.kind!=="titulo" && e.kind!=="marco" && (e.champ===key || (e.champ===null && e.effectOnly)));
}
// Un cosmético nunca es poder: el catálogo no tiene campos de combate y las piezas de set jamás tienen precio en Brasas aquí.
function cosmeticsContract(){
  const FORBIDDEN = ["dmg","damage","hp","maxHp","speed","range","radius","cd","armor","stats","power","mods","thresholds","effects"];
  return cosmeticsCatalog().filter(e=>FORBIDDEN.some(k=>k in e) || !COSMETIC_SOURCES[e.source] || !e.howTo).map(e=>e.id);
}
