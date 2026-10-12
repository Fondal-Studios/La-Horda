"use strict";
/* ============================================================
   js/arenas/lanes/lanes-data.js
   GUERRA DE CRISTALES en el MOTOR REAL — datos y geometría.
   Un solo mapa ancho, como una partida de MOBA: la base Zafiro (equipo 0) a la izquierda, la Ámbar (equipo 1)
   a la derecha. Cada base tiene dos torres y un cristal; hay que derribar las torres en orden antes de poder
   tocar el cristal. Los héroes son los de la campaña (mismas habilidades, HUD y controles) y el PvP está permitido.
   Cada equipo manda su propia HORDA contra la base rival, y cada tanto elige una carta para hacerla más fuerte.
   ============================================================ */
const LANES = {
  W:4600, H:1000,                     // tamaño del mapa (u)
  LEVEL:10,                           // nivel normalizado de todos los guardianes (sin cuenta ni equipo)
  RUNLEVEL:5,                         // runLevel fijo (habilita la definitiva, ver ULT_MIN_ARENA_LEVEL)
  BASE_X:330, MID_Y:500,              // distancia del cristal al borde y altura de la línea central
  TOWER_X:[1450, 860],                // torres de un equipo, de afuera hacia adentro (equipo 0; el 1 es el espejo)
  CRYSTAL_HP:2000, CRYSTAL_R:52,
  TOWER_HP:2400, TOWER_R:40, TOWER_DMG:48, TOWER_RANGE:440, TOWER_CD:1100,
  PVP_DMG:0.55,                       // los héroes se hacen menos daño entre sí que a la horda (si no, nadie dura)
  FIRST_WAVE_MS:8000, WAVE_MS:30000, SUPPLY_MS:8000, // primera oleada, intervalo y ventana de suministros
  MAX_MINIONS:70,                     // criaturas vivas por equipo
  RESPAWN_MS:6000, RESPAWN_PER_MIN:2500, BASE_HEAL:0.08, // reaparición (crece con el reloj) y curación en la base
  ECLIPSE_MS:480000, TIME_LIMIT_MS:660000,
  START_SHARDS:30, WAVE_SHARDS:10, KILL_SHARDS:1, ELITE_SHARDS:5, HERO_KILL_SHARDS:16, TOWER_SHARDS:30, MAX_SHARDS:220,
  CARD_FIRST_MS:40000, CARD_EVERY_MS:55000, CARD_AUTO_MS:15000, MAX_CARDS:9, // cartas de horda: la primera, cada cuánto, tiempo para elegir
  SHOP:{
    repair:{name:"Reparar estructura", desc:"+220 de vida a tu torre o cristal más dañado", cost:35, cd:15000},
    ward:{name:"Barrera", desc:"Escudo de 180 a tu estructura más adelantada", cost:40, cd:20000},
    swarm:{name:"Enviar acechadores", desc:"5 corredores contra la base rival", cost:16, cd:10000},
    brute:{name:"Enviar coloso", desc:"Un coloso contra la base rival", cost:42, cd:10000}
  }
};
// Cartas de horda: cada una potencia a las criaturas que ESTE equipo manda contra el rival. `max` = cuántas veces se puede tomar.
const LANES_CARDS = {
  hp:{name:"Piel de ceniza", desc:"+22% de vida a tu horda", icon:"♥", max:4, mod:m=>{ m.hp *= 1.22; }},
  dmg:{name:"Garras afiladas", desc:"+20% de daño a tu horda", icon:"⚔", max:4, mod:m=>{ m.dmg *= 1.20; }},
  speed:{name:"Marcha forzada", desc:"+10% de velocidad", icon:"➤", max:3, mod:m=>{ m.speed *= 1.10; }},
  count:{name:"Más bocas", desc:"+2 criaturas por oleada", icon:"✚", max:4, mod:m=>{ m.count += 2; }},
  siege:{name:"Ariete de huesos", desc:"+45% de daño a torres y cristal", icon:"⛫", max:3, mod:m=>{ m.siege *= 1.45; }},
  brute:{name:"Coloso de guerra", desc:"+1 coloso en cada oleada", icon:"☗", max:2, mod:m=>{ m.brute += 1; }},
  pace:{name:"Oleadas más rápidas", desc:"Las oleadas llegan 12% antes", icon:"⌛", max:3, mod:m=>{ m.pace *= 0.88; }},
  regen:{name:"Carne que se cierra", desc:"Tu horda se cura 2% por segundo", icon:"✧", max:3, mod:m=>{ m.regen += 0.02; }}
};
function lanesModsOf(counts){
  const m = {hp:1, dmg:1, speed:1, count:0, siege:1, brute:0, pace:1, regen:0};
  for(const id in LANES_CARDS) for(let k = 0; k < (counts[id] || 0); k++) LANES_CARDS[id].mod(m);
  return m;
}
ARENA_MODS.convergencia = { label:"Guerra de Cristales", icon:"◆", desc:"Dos bases, dos torres y un cristal cada una. Tu horda ataca la base rival; el PvP está permitido.", hazardName:"La Horda",
  fireDmgMult:1.0, iceDmgMult:1.0, enemyDmgPerWave:0.0, unlockLevel:0, heroSpeedMult:1.0, heroCdMult:1.0, heroEnergyRegenMult:1.0, abilityDmgMult:1.0, heroDmgMult:1.0, enemyRegenPct:0, hazard:null, hasWalls:false, potionMult:0 };

/* ---------------- geometría (team 0 = Zafiro, izquierda; team 1 = Ámbar, derecha) ---------------- */
function laneSide(team, x){ return team === 0 ? x : LANES.W - x; }
function laneBox(){ return {x0:0, y0:0, x1:LANES.W, y1:LANES.H}; }
function laneCrystalPos(team){ return {x:laneSide(team, LANES.BASE_X), y:LANES.MID_Y}; }
function laneTowerPos(team, k){ return {x:laneSide(team, LANES.TOWER_X[k]), y:LANES.MID_Y}; } // k: 0 exterior, 1 interior
function lanePortals(team){ return [-190, 0, 190].map(dy=>({x:laneSide(team, LANES.BASE_X + 210), y:LANES.MID_Y + dy})); }
function laneRally(team){ return {x:laneSide(team, LANES.BASE_X + 200), y:LANES.MID_Y}; }
function laneOfPoint(x){ return x < LANES.W / 2 ? 0 : 1; }
