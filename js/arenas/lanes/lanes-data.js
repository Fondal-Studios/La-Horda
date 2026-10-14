"use strict";
/* ============================================================
   js/arenas/lanes/lanes-data.js
   GUERRA DE CRISTALES en el MOTOR REAL — datos y geometría. Mapa 2D inspirado en Wild Rift:
   tres carriles (arriba, medio, abajo) entre dos bases (Zafiro abajo a la izquierda, Ámbar arriba a la derecha), selva con
   campamentos entre los carriles y un río en diagonal con dos objetivos épicos. Cada equipo tiene 3 torres por carril
   (exterior, interior, inhibidora) y un cristal; el cristal queda expuesto cuando cae la torre inhibidora de cualquier carril.
   Los héroes son los de la campaña (mismas habilidades, HUD y controles) y el PvP está permitido. La HORDA de cada equipo
   (súbditos melee, hechiceros y colosos) avanza sola por los tres carriles; las cartas de nivel la potencian.
   ============================================================ */
const LANES = {
  W:6400, H:4800,                     // tamaño del mapa (u)
  LEVEL0:3, LEVEL_MAX:15, OWN_LEVEL_CAP:10,             // nivel de partida: todos arrancan en 3 y suben a 15 con experiencia (sin cuenta ni equipo)
  RUNLEVEL:5,                         // runLevel fijo (habilita la definitiva, ver ULT_MIN_ARENA_LEVEL)
  BASE_OFF:560,                       // distancia del cristal a los bordes
  CRYSTAL_HP:2600, CRYSTAL_R:56,
  TOWER_HP:[2200, 2600, 3000], TOWER_R:42, TOWER_DMG:46, TOWER_RANGE:440, TOWER_CD:1100, TOWER_VS_MINION:0.7, // la torre pega suave a los súbditos (antes ×3): la horda aguanta bajo torre y se puede pelear ahí
 
  TOWER_T:[0.36, 0.26, 0.16],         // dónde está cada torre del equipo 0 (exterior, interior, inhibidora) como fracción del carril
  PVP_BURST:0.4,                      // tope de vida que un héroe puede perder por PvP en 1 s
  PVP_DMG:0.7,                        // los héroes se hacen menos daño entre sí que a la horda (si no, nadie dura)
  FIRST_WAVE_MS:14000, WAVE_MS:32000, // primera oleada y cada cuánto sale una nueva en cada carril
  MAX_MINIONS:130,                    // criaturas vivas por equipo
  MINION_SPEED:1.5, MINION_AGGRO_MIN:150, MINION_AGGRO_HERO:260, // los súbditos caminan más rápido que en la campaña; a quién atacan al pasar
  RESPAWN_MS:6000, RESPAWN_PER_LEVEL:1400, RESPAWN_PER_MIN:1500, BASE_HEAL:0.08, // reaparición (crece con el nivel y el reloj) y curación en la base
  RECALL_MS:5500,                     // volver a la base: se canaliza y se corta si te golpean o te movés
  ECLIPSE_MS:780000, TIME_LIMIT_MS:1080000,
  START_GOLD:500, GOLD_PASSIVE:1.6, GOLD_MINION:[20, 24, 60], GOLD_HERO_KILL:300, GOLD_ASSIST:110, GOLD_TOWER:130, GOLD_EPIC:170, MAX_GOLD:3500, // oro de cada héroe (se gasta en la base)
  SHOP_RADIUS:430,                    // distancia a tu cristal para poder comprar objetos (o estar caído)
  XP_MINION:16, XP_CASTER:20, XP_SIEGE:55, XP_HERO:110, XP_TOWER:140, XP_SHARE_R:900, // experiencia por baja (se reparte entre los héroes cercanos)
  CARD_AUTO_MS:15000, MAX_CARDS:12,   // una carta de horda por cada nuevo nivel máximo del equipo; tiempo para elegir
  CAMP_RESPAWN_MS:75000, CAMP_LEASH:520, CAMP_AGGRO:250,
  EPIC_FIRST_MS:240000, EPIC_RESPAWN_MS:300000, BUFF_MS:100000,
  SHOP:{   // pedidos de equipo (se pagan con TU oro, desde donde estés)
    repair:{name:"Reparar estructura", desc:"+260 de vida a tu torre o cristal más dañado", cost:120, cd:15000},
    ward:{name:"Barrera", desc:"Escudo de 200 a tu estructura más adelantada", cost:140, cd:20000},
    swarm:{name:"Enviar acechadores", desc:"5 corredores por el carril donde estás", cost:80, cd:10000},
    brute:{name:"Enviar coloso", desc:"Un coloso por el carril donde estás", cost:220, cd:10000}
  }
};
// Objetos de héroe: se compran en la base (o estando caído) con tu oro; tres niveles por objeto. `field` es la mejora en el héroe.
const LANES_ITEMS = {
  atk:{name:"Hoja de Ceniza", icon:"⚔", field:"itAtk", costs:[350, 700, 1100], desc:"+9 % de daño por nivel"},
  hp:{name:"Coraza de Hueso", icon:"♥", field:"itHp", costs:[300, 600, 950], desc:"+10 % de vida por nivel"},
  speed:{name:"Botas del Errante", icon:"➤", field:"itSpd", costs:[250, 500, 800], desc:"+7 % de velocidad por nivel"},
  siege:{name:"Ariete de Hierro", icon:"⛫", field:"itSiege", costs:[300, 600, 950], desc:"+25 % de daño a torres y cristal por nivel"},
  regen:{name:"Savia Viva", icon:"✧", field:"itRegen", costs:[250, 500, 800], desc:"Curación de 0,6 %/s por nivel"}
};
const LANES_ITEM_ORDER = ["atk", "hp", "speed", "siege", "regen"];
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
const LANES_CARD_IDS = Object.keys(LANES_CARDS);   // orden fijo (viaja en la red como lista de números)
function lanesModsOf(counts){
  const m = {hp:1, dmg:1, speed:1, count:0, siege:1, brute:0, pace:1, regen:0};
  for(const id in LANES_CARDS) for(let k = 0; k < (counts[id] || 0); k++) LANES_CARDS[id].mod(m);
  return m;
}
ARENA_MODS.convergencia = { label:"Guerra de Cristales", icon:"◆", desc:"Dos bases, dos torres y un cristal cada una. Tu horda ataca la base rival; el PvP está permitido.", hazardName:"La Horda",
  fireDmgMult:1.0, iceDmgMult:1.0, enemyDmgPerWave:0.0, unlockLevel:0, heroSpeedMult:1.0, heroCdMult:1.0, heroEnergyRegenMult:1.0, abilityDmgMult:1.0, heroDmgMult:1.0, enemyRegenPct:0, hazard:null, hasWalls:false, potionMult:0 };

/* ---------------- geometría (team 0 = Zafiro, abajo a la izquierda; team 1 = Ámbar, arriba a la derecha) ---------------- */
// Los carriles son líneas quebradas del equipo 0 hacia el 1. El de abajo es el de arriba girado 180°.
const LANES_PATHS = (()=>{
  const W = LANES.W, H = LANES.H;
  const top = [[640, H-1000], [560, 3300], [560, 1900], [700, 900], [1300, 560], [2600, 560], [4000, 560], [W-1100, 600]];
  const mid = [[1000, H-1000], [W*0.3, H*0.65], [W*0.5, H*0.5], [W*0.7, H*0.35], [W-1000, 1000]];
  const bot = top.map(([x, y])=>[W-x, H-y]).reverse();
  return [top, mid, bot].map(pts=>{
    const cum = [0]; for(let i = 1; i < pts.length; i++) cum.push(cum[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
    return {pts, cum, len:cum[cum.length-1]};
  });
})();
const LANE_NAMES = ["ARRIBA", "MEDIO", "ABAJO"];
// Punto del carril `l` a `s` unidades desde la base Zafiro (con la dirección de avance del equipo 0).
function lanePoint(l, s){
  const P = LANES_PATHS[l]; s = Math.max(0, Math.min(P.len, s));
  let i = 1; while(i < P.pts.length - 1 && P.cum[i] < s) i++;
  const a = P.pts[i-1], b = P.pts[i], seg = (P.cum[i] - P.cum[i-1]) || 1, t = (s - P.cum[i-1]) / seg;
  return {x:a[0] + (b[0]-a[0]) * t, y:a[1] + (b[1]-a[1]) * t, dx:(b[0]-a[0]) / seg, dy:(b[1]-a[1]) / seg};
}
// Proyección de un punto sobre el carril `l`: s (distancia desde la base Zafiro) y d (distancia al camino).
function laneProject(l, x, y){
  const P = LANES_PATHS[l]; let bs = 0, bd = 1e12;
  for(let i = 1; i < P.pts.length; i++){
    const a = P.pts[i-1], b = P.pts[i], dx = b[0]-a[0], dy = b[1]-a[1], L2 = dx*dx + dy*dy || 1;
    const t = Math.max(0, Math.min(1, ((x-a[0]) * dx + (y-a[1]) * dy) / L2)), px = a[0] + t*dx, py = a[1] + t*dy, d = Math.hypot(x-px, y-py);
    if(d < bd){ bd = d; bs = P.cum[i-1] + t * Math.sqrt(L2); }
  }
  return {s:bs, d:bd};
}
function laneBox(){ return {x0:0, y0:0, x1:LANES.W, y1:LANES.H}; }
function laneCrystalPos(team){ return team === 0 ? {x:LANES.BASE_OFF, y:LANES.H - LANES.BASE_OFF} : {x:LANES.W - LANES.BASE_OFF, y:LANES.BASE_OFF}; }
function laneTowerPos(team, l, k){ const P = LANES_PATHS[l], f = LANES.TOWER_T[k], p = lanePoint(l, P.len * (team === 0 ? f : 1 - f)); return {x:p.x, y:p.y}; }
// De dónde sale la horda de cada equipo en el carril `l` y hacia dónde avanza (+1 = de la base Zafiro a la Ámbar).
function laneSpawn(team, l){ const P = LANES_PATHS[l], p = lanePoint(l, team === 0 ? 60 : P.len - 60); return {x:p.x, y:p.y, dir:team === 0 ? 1 : -1}; }
function laneRally(team){ const c = laneCrystalPos(team); return {x:c.x + (team === 0 ? 260 : -260), y:c.y + (team === 0 ? -260 : 260)}; }
function laneOfPoint(x){ return x < LANES.W / 2 ? 0 : 1; }
// Campamentos de la selva (lado Zafiro; el lado Ámbar es el mismo girado 180°) y objetivos épicos del río.
const LANES_CAMP_BASE = [[1450, 2700, "lobos"], [1750, 2000, "bestias"], [2500, 3750, "escorpiones"], [3300, 3450, "gigante"]];
const LANES_CAMPS = (()=>{ const out = []; LANES_CAMP_BASE.forEach(([x, y, kind], i)=>{ out.push({id:i, x, y, kind, side:0}); out.push({id:i + 4, x:LANES.W - x, y:LANES.H - y, kind, side:1}); }); return out; })();
const LANES_EPICS = [
  {id:0, key:"dragon", name:"Dragón de Piedra", x:LANES.W * 0.66, y:LANES.H * 0.70, buff:"dragon"},
  {id:1, key:"rey", name:"Rey Coloso", x:LANES.W * 0.34, y:LANES.H * 0.30, buff:"rey"}
];
