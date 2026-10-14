"use strict";
/* ============================================================
   js/arenas/coliseum/coliseum-data.js
   COLISEO en el MOTOR REAL — torneo 2v2 de 8 luchadores (estilo "Arena" de Wild Rift / League of Legends).
   Cuatro equipos de dos. Cada ronda se juegan DOS duelos 2v2 a la vez, en dos fosos del mismo mundo: el tuyo y el de los
   otros dos equipos (que podés mirar si caés). Quien gana un duelo suma 1 punto; el primero en llegar a WIN_POINTS gana.
   Los guardianes son los de la campaña (mismas habilidades y HUD). Reusa el PvP de Guerra de Cristales (lanes-core.js).
   IDENTIDAD PROPIA (octubre 2026): (a) CARTAS DE ARENA entre rondas: cada equipo elige 1 de 3 (potenciaciones chicas, topadas);
   (b) cada 3.ª ronda es «TODOS CONTRA TODOS»: las cuatro duplas en un solo foso grande, puntos por puesto.
   ============================================================ */
const COL = {
  W:3800, H:1100, PIT_R:380,
  PITS:[{x:900, y:550}, {x:2900, y:550}, {x:1900, y:550}],   // foso A (tu duelo), foso B (el otro duelo) y el foso grande de «Todos contra todos» (el del medio)
  PIT_RS:[380, 380, 440],
  PREP_MS:4500, ROUND_MS:80000, RING_START_MS:28000, RING_SHRINK_MS:36000, RING_MIN:110, RING_DMG:0.09, // anillo que se cierra: fuera de él se pierde vida
  INTER_MS:5500, WIN_POINTS:3, MAX_ROUNDS:9,
  START_DIST:250,                                     // distancia de cada equipo al centro de su foso
  // TODOS CONTRA TODOS: cada FFA_EVERY rondas (3, 6 y 9: la 9.ª es siempre la final) las cuatro duplas pelean en el foso grande.
  // Puesto por equipo (cae el último integrante = equipo fuera): 1.º suma 2 puntos, 2.º suma 1, el resto nada. Sin fuego amigo dentro de la dupla.
  FFA_EVERY:3, FFA_ROUND_MS:90000, FFA_RING_START_MS:24000, FFA_RING_SHRINK_MS:42000, FFA_RING_MIN:130, FFA_POINTS:[2, 1, 0, 0], FFA_START_R:290,
  // CARTAS DE ARENA: entre rondas cada equipo elige 1 de 3. Las de «ronda» valen solo la próxima ronda; las de «torneo» son más chicas y quedan
  // (tope por carta y TOURN_CAP en total por equipo). Los topes duros de CARD_CAP se aplican siempre, pase lo que pase.
  CARD_MS:12000, CARD_BOT_MIN_MS:1500, CARD_BOT_SPREAD_MS:3000, TOURN_CAP:3,
  CARD_CAP:{hp:1.25, dmg:1.20, spd:1.15, cdr:0.20, shield:0.20, regen:0.016, ring:0.5, last:0.20}
};
// Qué equipos se enfrentan en cada ronda (tres emparejamientos y se repiten). El equipo 0 (el tuyo) siempre juega en el foso A.
const COL_PAIRINGS = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
// Cartas de arena. `scope`: "ronda" (solo la próxima ronda) | "torneo" (queda; `max` por carta). `mod` suma al acumulado del equipo.
// Textos cortos a propósito: se leen en 3 botones de ~135 px a 14 px de letra (667×375) sin cortarse.
const COL_CARDS = {
  piel:    {name:"Piel de ceniza",  icon:"♥", scope:"ronda",  desc:"+15% de vida",              mod:m=>{ m.hp *= 1.15; }},
  garras:  {name:"Garras afiladas", icon:"⚔", scope:"ronda",  desc:"+12% de daño",              mod:m=>{ m.dmg *= 1.12; }},
  paso:    {name:"Marcha forzada",  icon:"➤", scope:"ronda",  desc:"+10% de velocidad",         mod:m=>{ m.spd *= 1.10; }},
  escudo:  {name:"Escudo de brasas",icon:"◈", scope:"ronda",  desc:"Escudo del 18% de vida",    mod:m=>{ m.shield += 0.18; }},
  mente:   {name:"Mente fría",      icon:"⌛", scope:"ronda",  desc:"−12% de esperas",           mod:m=>{ m.cdr += 0.12; }},
  aliento: {name:"Último aliento",  icon:"✦", scope:"ronda",  desc:"Con 30% de vida, curás 20%", mod:m=>{ m.last += 0.20; }},
  temple:  {name:"Temple",          icon:"★", scope:"torneo", desc:"+5% de daño", max:2,         mod:m=>{ m.dmg *= 1.05; }},
  robusto: {name:"Robustez",        icon:"✚", scope:"torneo", desc:"+6% de vida", max:2,         mod:m=>{ m.hp *= 1.06; }},
  cierra:  {name:"Carne que cierra",icon:"✧", scope:"torneo", desc:"Curás 0,8% por segundo", max:2, mod:m=>{ m.regen += 0.008; }},
  piedra:  {name:"Piel de piedra",  icon:"☗", scope:"torneo", desc:"El anillo duele 40% menos", max:1, mod:m=>{ m.ring *= 0.6; }}
};
const COL_CARD_IDS = Object.keys(COL_CARDS);
// Acumulado de un equipo: cartas de torneo tomadas (`cards`: id → veces) + la carta de ronda elegida (`pick`). Siempre con los topes de COL.CARD_CAP.
function colModsOf(cards, pick){
  const m = {hp:1, dmg:1, spd:1, cdr:0, shield:0, regen:0, ring:1, last:0};
  for(const id of COL_CARD_IDS){ const n = (cards && cards[id]) || 0; for(let k = 0; k < n; k++) COL_CARDS[id].mod(m); }
  if(pick && COL_CARDS[pick] && COL_CARDS[pick].scope === "ronda") COL_CARDS[pick].mod(m);
  const C = COL.CARD_CAP;
  m.hp = Math.min(C.hp, m.hp); m.dmg = Math.min(C.dmg, m.dmg); m.spd = Math.min(C.spd, m.spd); m.cdr = Math.min(C.cdr, m.cdr); m.shield = Math.min(C.shield, m.shield);
  m.regen = Math.min(C.regen, m.regen); m.ring = Math.max(C.ring, m.ring); m.last = Math.min(C.last, m.last);
  return m;
}
function colPitR(pit){ return COL.PIT_RS[pit] || COL.PIT_R; }
function colTournCount(cards){ let n = 0; for(const id of COL_CARD_IDS) if(COL_CARDS[id].scope === "torneo") n += (cards && cards[id]) || 0; return n; }
ARENA_MODS.coliseo = { label:"Coliseo", icon:"⚔", desc:"Torneo 2 contra 2 de ocho luchadores. Ganá duelos para sumar puntos.", hazardName:"El Coliseo",
  fireDmgMult:1.0, iceDmgMult:1.0, enemyDmgPerWave:0.0, unlockLevel:0, heroSpeedMult:1.0, heroCdMult:1.0, heroEnergyRegenMult:1.0, abilityDmgMult:1.0, heroDmgMult:1.0, enemyRegenPct:0, hazard:null, hasWalls:false, potionMult:0 };
function colPitCenter(pit){ return COL.PITS[pit]; }
function colPitOf(x){ return x < 1400 ? 0 : x > 2400 ? 1 : 2; }   // (los fosos A y B están a los lados; el grande, en el medio)
