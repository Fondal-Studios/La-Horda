"use strict";
/* ============================================================
   js/arenas/coliseum/coliseum-data.js
   COLISEO en el MOTOR REAL — torneo 2v2 de 8 luchadores (estilo "Arena" de Wild Rift / League of Legends).
   Cuatro equipos de dos. Cada ronda se juegan DOS duelos 2v2 a la vez, en dos fosos del mismo mundo: el tuyo y el de los
   otros dos equipos (que podés mirar si caés). Quien gana un duelo suma 1 punto; el primero en llegar a WIN_POINTS gana.
   Los guardianes son los de la campaña (mismas habilidades y HUD). Reusa el PvP de Guerra de Cristales (lanes-core.js).
   ============================================================ */
const COL = {
  W:3800, H:1100, PIT_R:380,
  PITS:[{x:900, y:550}, {x:2900, y:550}],           // foso A (tu duelo) y foso B (el otro duelo)
  PREP_MS:4500, ROUND_MS:80000, RING_START_MS:28000, RING_SHRINK_MS:36000, RING_MIN:110, RING_DMG:0.09, // anillo que se cierra: fuera de él se pierde vida
  INTER_MS:5500, WIN_POINTS:3, MAX_ROUNDS:9,
  START_DIST:250                                      // distancia de cada equipo al centro de su foso
};
// Qué equipos se enfrentan en cada ronda (tres emparejamientos y se repiten). El equipo 0 (el tuyo) siempre juega en el foso A.
const COL_PAIRINGS = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
ARENA_MODS.coliseo = { label:"Coliseo", icon:"⚔", desc:"Torneo 2 contra 2. Usá pilares y rocas para cubrirte de proyectiles y rodeá al rival. El anillo se cierra: ganá duelos para sumar puntos.", hazardName:"El Coliseo",
  fireDmgMult:1.0, iceDmgMult:1.0, enemyDmgPerWave:0.0, unlockLevel:0, heroSpeedMult:1.0, heroCdMult:1.0, heroEnergyRegenMult:1.0, abilityDmgMult:1.0, heroDmgMult:1.0, enemyRegenPct:0, hazard:null, hasWalls:false, potionMult:0 };
function colPitCenter(pit){ return COL.PITS[pit]; }
function colPitOf(x){ return x < COL.W / 2 ? 0 : 1; }
