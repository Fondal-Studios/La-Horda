"use strict";
/* ============================================================
   js/ui/skill-glyphs.js
   SÍMBOLOS de las habilidades en los botones del HUD, con el estilo de La Horda: trazos gruesos de hierro y hueso,
   siempre del color del botón. 146 de las 152 habilidades solo tenían un emoji suelto; acá cada una recibe un símbolo
   por su tipo (espada, llama, escudo, calavera...). Las que ya tienen ícono pixel propio (SKILL_ICON_IMG) no cambian.
   Es solo presentación: no toca estadísticas ni el kit de ningún campeón.
   ============================================================ */
const SKILL_GLYPHS = {
  blade:'<path d="M26 3l3 3-16 16-3-3z"/><path d="M7 19l6 6-2 2-6-6z"/><path d="M9 23l-5 5" stroke-width="3" fill="none"/>',
  crossed:'<path d="M5 3l-3 3 12 12 3-3z"/><path d="M27 3l3 3-12 12-3-3z"/><path d="M5 29l-3-3 5-5 3 3zM27 29l3-3-5-5-3 3z"/>',
  bolt:'<path d="M18 1L5 18h8l-3 13 17-19h-9z"/>',
  flame:'<path d="M16 1c3 8 11 10 11 19 0 6-5 11-11 11S5 26 5 20c0-5 4-7 5-12 3 2 4 4 4 7 2-4 2-8 2-14z"/><path d="M16 17c3 3 5 5 5 8a5 5 0 0 1-10 0c0-3 3-5 5-8z" fill="#0b0f18" opacity=".45"/>',
  frost:'<g fill="none" stroke-width="3.2" stroke-linecap="round"><path d="M16 2v28M4 9l24 14M28 9L4 23"/><path d="M12 4l4 3 4-3M12 28l4-3 4 3" stroke-width="2.4"/></g>',
  nova:'<circle cx="16" cy="16" r="5"/><circle cx="16" cy="16" r="11" fill="none" stroke-width="2.6"/><g stroke-width="3" stroke-linecap="round"><path d="M16 1v4M16 27v4M1 16h4M27 16h4M5 5l3 3M24 24l3 3M27 5l-3 3M5 27l3-3"/></g>',
  shield:'<path d="M16 2l12 4v9c0 8-6 13-12 15C10 28 4 23 4 15V6z"/><path d="M16 7v18M9 13h14" stroke="#0b0f18" stroke-width="2.4" opacity=".5" fill="none"/>',
  heal:'<path d="M12 3h8v9h9v8h-9v9h-8v-9H3v-8h9z"/>',
  horn:'<g fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17l11-10 11 10"/><path d="M5 27l11-10 11 10"/></g>',
  eye:'<path d="M1 16C6 7 26 7 31 16 26 25 6 25 1 16z"/><circle cx="16" cy="16" r="5" fill="#0b0f18"/><circle cx="16" cy="16" r="2" />',
  dash:'<path d="M2 6l13 10L2 26z"/><path d="M15 6l13 10-13 10z"/>',
  trap:'<path d="M2 24l5-14 5 10 4-12 4 12 5-10 5 14z"/><rect x="2" y="25" width="28" height="3"/>',
  skull:'<path fill-rule="evenodd" d="M16 2C9 2 4 7 4 14c0 4 2 7 5 9v6h4v-3h2v3h2v-3h2v3h4v-6c3-2 5-5 5-9 0-7-5-12-12-12zM10.5 12a3 3 0 1 0 .01 0zm11 0a3 3 0 1 0 .01 0z"/>',
  whirl:'<path d="M16 4a12 12 0 1 1-12 12" fill="none" stroke-width="4" stroke-linecap="round"/><path d="M0 12l8 8 4-9z"/>',
  hook:'<path d="M20 3v16a6 6 0 1 1-12 0" fill="none" stroke-width="4" stroke-linecap="round"/><path d="M3 15l5 7 5-7z"/>',
  tower:'<path d="M7 29V11h3V6h3v5h6V6h3v5h3v18z"/><rect x="13" y="19" width="6" height="10" fill="#0b0f18" opacity=".5"/>',
  flask:'<path d="M11 2h10v2h-2v7l9 15c1 3-1 5-4 5H8c-3 0-5-2-4-5l9-15V4h-2z"/><path d="M9 21h14" stroke="#0b0f18" stroke-width="2.6" opacity=".5" fill="none"/>',
  drop:'<path d="M16 2c6 9 11 13 11 19a11 11 0 0 1-22 0C5 15 10 11 16 2z"/>',
  arrow:'<path d="M3 29L24 8" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M28 4v12l-4-3-4 4-4-4 4-4-3-4z"/><path d="M3 29l-1-6 4 1 1 4z"/>',
  star:'<path d="M16 1l4.5 9.5L31 12l-7.5 7.3L25.3 30 16 25 6.7 30l1.8-10.7L1 12l10.5-1.5z"/>',
  crown:'<path d="M3 26L1 8l8 8 7-12 7 12 8-8-2 18z"/><rect x="3" y="27" width="26" height="3"/>'
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
const _glyphUri = {};
// Devuelve una imagen (data URI de un SVG) con el símbolo de la habilidad, del color indicado.
function skillGlyphUri(sk, color, isUlt){
  const key = skillGlyphKey(sk, isUlt), id = key + color;
  if(_glyphUri[id]) return _glyphUri[id];
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="' + color + '" stroke="' + color + '" stroke-linejoin="round"><g stroke-width="1.2">' + SKILL_GLYPHS[key] + '</g></svg>';
  return _glyphUri[id] = "data:image/svg+xml," + encodeURIComponent(svg);
}
