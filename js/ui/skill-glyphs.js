"use strict";
/* ============================================================
   js/ui/skill-glyphs.js
   ÍCONOS DE HABILIDAD: paleta, categorías y búsqueda por palabras clave, bajo el CONTRATO ÚNICO de js/ui/pixel-icons.js
   (16x16 nativos, 6 colores como máximo, contorno de 1 px, marco por categoría, sin degradés, alfa 0/255).
   Antes había tres idiomas (ilustraciones con degradé, recortes del sprite del héroe y glifos de 2 tonos con insignia
   diminuta); ahora todo sale de skillIconUriFromGlyph(). El arte de cada habilidad de cada campeón está en
   js/ui/skill-pixel-glyphs.js; este archivo cubre además a las que no tienen entrada propia (Crystal Wars, kits
   nuevos) con un motivo genérico por tipo (espada, llama, escudo, calavera...).
   Es solo presentación: no toca estadísticas ni el kit de ningún campeón.
   ============================================================ */
// Color de cuerpo por botón del HUD (identidad de cada ranura; el marco lo fija la categoría, no la ranura).
const SKILL_ICON_BODY = {basic:"#e8884a", s1:"#4fc3f7", s2:"#a98bff", s3:"#4fe0a0", ult:"#ff9d3a"};
// Crystal Wars (y cualquier llamador viejo) pasa un color de ranura: se traduce a la ranura.
const SKILL_ICON_SLOT_OF_COLOR = {"#8fe0ff":"s1", "#cfc2ff":"s2", "#97f0cc":"s3", "#ffe9a8":"ult"};
// slot: 0|1|2 (habilidades), 3|"ult"|"u" (definitiva), "basic", o ya "s1".."s3"
function skillIconSlotKey(slot){
  if(slot===3 || slot==="ult" || slot==="u") return "ult";
  if(slot==="basic") return "basic";
  if(slot===0 || slot===1 || slot===2) return "s" + (slot+1);
  return SKILL_ICON_BODY[slot] ? slot : "s1";
}
function skillIconCategory(slotKey){ return slotKey==="ult" ? "ult" : slotKey==="basic" ? "basic" : "skill"; }
const _skillTint = (hex, t)=>{ // t>0 aclara hacia blanco, t<0 oscurece hacia negro
  const n = parseInt(hex.slice(1), 16), c = [n>>16&255, n>>8&255, n&255].map(v=>Math.round(t>0 ? v+(255-v)*t : v*(1+t)));
  return "#" + c.map(v=>v.toString(16).padStart(2, "0")).join("");
};
const _skillIconUri = {};
// rows14: 14 filas de 14 letras (. k # l d a). Devuelve la imagen (data URI PNG 16x16) bajo el contrato, o null sin canvas.
function skillIconUriFromGlyph(rows14, slot, accent){
  const slotKey = skillIconSlotKey(slot), id = rows14.join("") + "|" + slotKey + "|" + accent;
  if(_skillIconUri[id] !== undefined) return _skillIconUri[id];
  const cat = skillIconCategory(slotKey), m = SKILL_ICON_BODY[slotKey];
  const rows = pxiIconCompose(rows14, cat), colors = pxiIconColors(cat, {m, l:_skillTint(m, .55), d:_skillTint(m, -.35)}, accent);
  return _skillIconUri[id] = pxiIconDataURL(rows, colors);
}
// Motivo genérico por palabras clave -> nombre de motivo de PIX_MOTIFS (skill-pixel-glyphs.js).
const SKILL_GLYPH_MOTIF = {
  blade:"sword", crossed:"swords", bolt:"bolt", flame:"ember", frost:"frost", nova:"burst", shield:"shield", heal:"cross",
  horn:"horn", eye:"eye", dash:"boots", trap:"trap", skull:"skull", whirl:"vortex", hook:"hook", tower:"turret",
  flask:"flask", drop:"drop", arrow:"arrow", star:"star", crown:"crown"
};
// Qué símbolo lleva cada habilidad, por su tipo/nombre/descripción (la primera regla que coincida).
const SKILL_GLYPH_RULES = [
  [/heal|cura|sana|alba|vital|regener|retro_heal|✚/i, "heal"],
  [/shield|escudo|armad|guard|bubble|burbuja|barrier|inmun|brief_immunity|vigil|🛡/i, "shield"],
  [/taunt|provoc|war_cry|grito|buff|bendic|bless|rally|team_|horn|corneta|himno/i, "horn"],
  [/frost|hielo|escarcha|helad|ice|nieve|invierno/i, "frost"],
  [/fire|flame|llama|fuego|ember|brasa|burn|igni|infern|lava|🔥/i, "flame"],
  [/chain|rayo|elect|bolt|storm|tormenta|trueno|spark|⚡/i, "bolt"],
  [/teleport|blink|dash|charge|embest|paso|path|ghost|salto|leave|sprint|carga|↯/i, "dash"],
  [/trap|trampa|snare|jaw/i, "trap"],
  [/hook|gancho|grapple|arpon/i, "hook"],
  [/turret|torre|tower|cañ|cano|canon|alembic|alambique/i, "tower"],
  [/summon|golem|invoc|plague|condemned|soul|hunt|skeleton|nigro|corrupt|muerte|death|calavera|last_stand|reap|segad|abyss|abismo|💀/i, "skull"],
  [/spin|whirl|giro|torn|vortex|remolino|danza|🌀/i, "whirl"],
  [/poison|veneno|acid|resin|brew|alquim|distill|potion|salt|sal_|plaga/i, "flask"],
  [/thousand|mil_|triple|multi|volley|flurry|ronin|cuts/i, "crossed"],
  [/nova|glitch|overwrite|burst|explos|pulse|pulso|splash|ring|tantrum|ira|anillo/i, "nova"],
  [/shot|arrow|rain|flecha|piercing|rifle|bala|disparo|lluvia|snipe|line|lanza/i, "arrow"],
  [/eye|vision|visión|stealth|sombra|shadow|ojo|gaze|mirada|lantern|linterna|flash/i, "eye"],
  [/slash|cut|corte|tajo|blade|sable|sword|espada|bayon|strike|golpe|hit|cone|bleed|sangr|⚔|🗡|🩸/i, "blade"]
];
function skillGlyphKey(sk, isUlt){
  const hay = [sk.kind, sk.name, sk.ico].join(" ");
  for(const [re, key] of SKILL_GLYPH_RULES) if(re.test(hay)) return key;
  return isUlt ? "star" : "nova";
}
// Imagen (data URI PNG 16x16 del contrato) con el motivo genérico de la habilidad. `color` solo identifica la ranura.
function skillGlyphUri(sk, color, isUlt){
  const motif = SKILL_GLYPH_MOTIF[skillGlyphKey(sk, isUlt)], g = typeof skillPixelGrid==="function" ? skillPixelGrid(motif) : null;
  if(!g) return null;
  const slot = isUlt ? "ult" : (SKILL_ICON_SLOT_OF_COLOR[color] || "s1");
  return skillIconUriFromGlyph(skillPixelContractRows(g), slot, skillPixelAccent(motif));
}

// Rótulo corto del botón (fuente pixel del juego, 8 px = su grilla nativa, 5 letras como máximo = 40 px en el
// botón de 46 px útiles; 6 letras = 48 px no entran sin tocar el aro). Nombre completo siempre en el tooltip y en el aria-label.
// Se escribe a mano por habilidad y cada rótulo es una PALABRA COMPLETA (sinónimo corto si el nombre no entra), nunca el
// nombre cortado ("ENJAM", "RESAC", "PRESI"...). test-skill-glyphs.js exige entrada propia para toda habilidad. Clave "campeón:ranura".
const SKILL_SHORT_LABEL = {
  "tanque:0":"GIRO","tanque:1":"CARGA","tanque:2":"GRITO",
  "guerrero:0":"CORTE","guerrero:1":"GOLPE","guerrero:2":"CEPO",
  "mago:0":"MURO","mago:1":"HIELO","mago:2":"RAYO",
  "soporte:0":"ALBA","soporte:1":"VIGOR","soporte:2":"EGIDA",
  "segador:0":"TAJO","segador:1":"FURIA","segador:2":"FINAL",
  "axiom:0":"404","axiom:1":"EDITA","axiom:2":"WARP",
  "profeta:0":"HADO","profeta:1":"VISTA","profeta:2":"DANZA",
  "musashi:0":"RONIN","musashi:1":"PASO","musashi:2":"MIL",
  "cazadora:0":"TIRO","cazadora:1":"LAZO","cazadora:2":"SALVA",
  "nigromante:0":"ALMAS","nigromante:1":"GOLEM","nigromante:2":"PLAGA",
  "libertador:0":"BAYON","libertador:1":"TROPA","libertador:2":"CARGA",
  "ilkan:0":"LANZA","ilkan:1":"DUNA","ilkan:2":"GRITO",
  "ynara:0":"MIRA","ynara:1":"PLATO","ynara:2":"NO",
  "myla:0":"TORRE","myla:1":"YOGUR","myla:2":"CREMA",
  "brasa:0":"LATON","brasa:1":"PURGA","brasa:2":"PRISA",
  "eslabon:0":"TIRON","eslabon:1":"LINEA","eslabon:2":"ASILO",
  "morwen:0":"BREA","morwen:1":"SAL","morwen:2":"GOTA",
  "farolero:0":"FAROL","farolero:1":"FLASH","farolero:2":"PASO",
  "iria:0":"ANCLA","iria:1":"TENSA","iria:2":"HILO",
  "vesper:0":"AGUJA","vesper:1":"COSER","vesper:2":"HEBRA",
  "nahir:0":"LASCA","nahir:1":"FUGA","nahir:2":"CRUZ",
  "baltra:0":"METAL","baltra:1":"DOMO","baltra:2":"GOLPE",
  "maura:0":"RAIZ","maura:1":"ARBOL","maura:2":"PODA",
  "dariel:0":"NOTA","dariel:1":"RITMO","dariel:2":"BIS",
  "orsa:0":"PERNO","orsa:1":"APOYO","orsa:2":"CARGA",
  "tibor:0":"NUBE","tibor:1":"CASA","tibor:2":"POLEN",
  "zahra:0":"HORNO","zahra:1":"FRIO","zahra:2":"HUMO",
  "renko:0":"SURCO","renko:1":"LOMA","renko:2":"SUELO",
  "sira:0":"TINTA","sira:1":"ATRAS","sira:2":"BORRA",
  "nano_gm:0":"FALLO","nano_gm:1":"BANDO","nano_gm:2":"REVES",
  "facu_gm:0":"MAREA","facu_gm:1":"FOSA","facu_gm:2":"OLA",
  "aurelia:0":"IRIS","aurelia:1":"ARCO","aurelia:2":"LUZ",
  "khepri:0":"HORDA","khepri:1":"CAPA","khepri:2":"VUELO",
  "velmira:0":"CARA","velmira:1":"CORO","velmira:2":"MUDAR",
  "vhal:0":"ASTRO","vhal:1":"POZO","vhal:2":"ORBE",
  "bront:0":"PLACA","bront:1":"MURO","bront:2":"PULSO",
  "oriel:0":"ABRIR","oriel:1":"ECO","oriel:2":"PASO",
  "saelis:0":"PLUMA","saelis:1":"SOPLO","saelis:2":"CANTO",
  "solciju:0":"VINO","solciju:1":"TONEL","solciju:2":"COPA",
  "veyra:0":"LLAGA","veyra:1":"PASO","veyra:2":"PACTO",
  "brakk:0":"MURO","brakk:1":"TORRE","brakk:2":"POSTE",
  "morveth:0":"BROTE","morveth:1":"PESTE","morveth:2":"UNION",
  "aelith:0":"ROTO","aelith:1":"RAJA","aelith:2":"RELOJ",
  "ilkan_colossus:0":"ALUD","ilkan_colossus:1":"SIMA","ilkan_colossus:2":"DUNAS"
};
function skillShortLabel(champId, slot, name){
  const k = champId + ":" + slot;
  if(SKILL_SHORT_LABEL[k]) return SKILL_SHORT_LABEL[k];
  // sin entrada propia: primera palabra de más de 2 letras, 5 letras como máximo, sin tildes (la fuente pixel no las trae)
  const w = String(name||"").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().split(/\s+/).filter(x=>x.length>2 && !/^(DEL|LAS|LOS|CON|POR)$/.test(x));
  return (w[0] || String(name||"").toUpperCase()).slice(0, 5);
}
