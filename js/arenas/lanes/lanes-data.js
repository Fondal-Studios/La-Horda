"use strict";
/* ============================================================
   js/arenas/lanes/lanes-data.js
   GUERRA DE CRISTALES en el MOTOR REAL — datos y geometría.
   Dos carriles (equipo Zafiro = 0, equipo Ámbar = 1) dentro del mismo mundo, muy separados:
   cada equipo defiende su cristal contra la misma horda (oleadas espejo) y puede enviarle monstruos
   al carril rival. Los héroes son los de la campaña (mismas habilidades, HUD y controles).
   ============================================================ */
const LANES = {
  W:1100, H:820, GAP:3000,           // tamaño de cada carril y distancia entre carriles (u)
  LEVEL:10,                           // nivel normalizado de todos los guardianes (sin cuenta ni equipo)
  RUNLEVEL:5,                         // runLevel fijo (habilita la definitiva, ver ULT_MIN_ARENA_LEVEL)
  CRYSTAL_HP:1200, CRYSTAL_R:44,
  FIRST_WAVE_MS:6000, WAVE_MS:35000, SUPPLY_MS:8000, // primera oleada, intervalo y ventana de suministros
  MAX_ENEMIES:60,                     // por carril
  RESPAWN_MS:8000, DEATH_COST:65,     // caer: vuelve a los 8 s y le cuesta 65 al cristal propio
  ECLIPSE_MS:300000, TIME_LIMIT_MS:420000,
  START_SHARDS:30, WAVE_SHARDS:10, KILL_SHARDS:1, ELITE_SHARDS:5, MAX_SHARDS:200,
  CATCHUP_GAP:250, CATCHUP_SHARDS:6,
  SHOP:{
    repair:{name:"Reparar cristal", desc:"+180 de vida al cristal", cost:35, cd:15000},
    upgrade:{name:"Mejora de equipo", desc:"+12% de daño (máx. 3)", cost:38},
    ward:{name:"Barrera", desc:"Escudo de 150 al cristal", cost:40, cd:20000},
    swarm:{name:"Enviar acechadores", desc:"5 corredores al rival", cost:16, cd:10000},
    brute:{name:"Enviar coloso", desc:"Un coloso al rival", cost:42, cd:10000}
  }
};
ARENA_MODS.convergencia = { label:"Guerra de Cristales", icon:"◆", desc:"Dos equipos, dos carriles, una horda. Defendé tu cristal y presioná al rival.", hazardName:"La Horda",
  fireDmgMult:1.0, iceDmgMult:1.0, enemyDmgPerWave:0.0, unlockLevel:0, heroSpeedMult:1.0, heroCdMult:1.0, heroEnergyRegenMult:1.0, abilityDmgMult:1.0, heroDmgMult:1.0, enemyRegenPct:0, hazard:null, hasWalls:false, potionMult:0 };
function laneX0(i){ return i*(LANES.W+LANES.GAP); }
function laneBox(i){ const x0 = laneX0(i); return {x0, y0:0, x1:x0+LANES.W, y1:LANES.H}; }
function laneCrystalPos(i){ return {x:laneX0(i)+LANES.W/2, y:LANES.H-120}; }
function lanePortals(i){ const x0 = laneX0(i); return [0.18,0.5,0.82].map(k=>({x:x0+LANES.W*k, y:78})); }
function laneRally(i){ const c = laneCrystalPos(i); return {x:c.x, y:c.y-170}; }
function laneOfPoint(x){ return x < laneX0(1)-LANES.GAP/2 ? 0 : 1; }
