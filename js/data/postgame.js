"use strict";
/* ============================================================
   js/data/postgame.js
   POSTGAME: Guerra de Cristales y Coliseo son contenido de DESPUÉS de la campaña (decisión del dueño). Este archivo concentra
   el interruptor, las recompensas y los cosméticos; la lógica vive en js/systems/postgame.js y el tope de progresión en
   LANES.PROGRESS_CAP (js/arenas/lanes/lanes-data.js). Documento: docs/modes/POSTGAME.md.

   INTERRUPTOR DE ACCESO — un único lugar:
     "open" (POR DEFECTO en ALFA): todo abierto desde el primer minuto, como hasta ahora. La progresión y las recompensas funcionan igual
                               (con el progreso real del jugador y su tope). No toca el guardado.
     "campaign" (= cerrado)  : regla de desbloqueo completa: los modos se abren al ganar la última arena de la campaña EN NORMAL (flag real
                               `arenasCleared`; no hace falta Pesadilla ni Infierno). Antes de eso el hub los muestra bloqueados («Se abre al
                               terminar la campaña») y ofrece el Entrenamiento (campeón normalizado, sin recompensas).
   Para cerrar el postgame al salir de la alfa basta cambiar la línea de abajo a "campaign".
   Esto solo decide el modo SOLO contra bots; las salas online no cambian (siguen normalizadas y sin recompensas).
   ============================================================ */
var POSTGAME_GATE = "open";   // "open" (alfa: abierto) | "campaign" (cerrado hasta terminar la campaña)

// RECOMPENSAS (honestas y sin pay-to-win: oro del juego, XP de cuenta, uso de maestría y cosméticos; nada se compra con plata).
// El oro, el reloj y el guardado son del CLIENTE: el tope diario frena el farmeo honesto, no a quien edite su guardado ni a quien
// cambie la hora del equipo (adelantarla reinicia el día; atrasarla NO lo reinicia). Ver docs/modes/POSTGAME.md.
const POSTGAME_CFG = {
  daily:{gold:900, accountXp:400, masteryUse:40},    // tope por día local y por cuenta (los dos modos suman al mismo tope)
  minMs:{cw:240000, col:100000},                      // tiempo mínimo de juego para cobrar (una partida regalada o abandonada no paga)
  cw:{win:300, draw:120, loss:80,                     // oro base
      perKill:12, maxKills:8,                         //  + 12 por baja de héroe (hasta 8)
      perTower:8, maxTowers:6,                        //  + 8 por torre rival derribada por el equipo (hasta 6)
      perEpic:20, maxEpics:2,                         //  + 20 por objetivo épico (Dragón / Rey Coloso) (hasta 2)
      lossPerfShare:0.5,                              // si no ganás, el rendimiento paga la mitad
      xp:{win:120, draw:60, loss:40}, perfXp:30, use:{win:18, draw:10, loss:8}},
  col:{win:350, second:160, third:100, fourth:60, draw:100, // oro base por puesto del torneo
      perDuel:40, maxDuels:3,                          //  + 40 por duelo ganado por tu equipo (hasta 3)
      perKill:10, maxKills:6,                          //  + 10 por baja (hasta 6)
      lossPerfShare:0.5,
      xp:{win:140, second:80, third:50, fourth:40, draw:60}, perfXp:30, use:{win:20, second:12, third:9, fourth:8, draw:10}},
  trophies:{win:25, streakStep:5, streakMax:25, loss:-10, draw:0}   // trofeos locales por modo (nunca bajan de 0)
};

// COSMÉTICOS de postgame (sin arte nuevo: los íconos de QUEST_GLYPHS y los pixel de js/ui/pixel-icons.js; el marco es un borde de color).
// Se suman a las tablas de js/data/quests.js, que decide qué se muestra en Desafíos → Perfil.
Object.assign(QUEST_TITLES, {
  pg_rompe:    {name:"Rompecristales"},
  pg_estratega:{name:"Estratega de la Convergencia"},
  pg_racha:    {name:"Imparable en Carriles"},
  pg_campeon:  {name:"Campeón del Coliseo"},
  pg_invicto:  {name:"Invicto del Coliseo"},
  pg_leyenda:  {name:"Leyenda del Postgame"}
});
Object.assign(QUEST_FRAMES, {
  pg_convergencia:{name:"Convergencia", c:["#d8f2ff","#4aa0d8","#10304a"], glow:"112,201,255"},
  pg_coliseo:     {name:"Coliseo",      c:["#ffe6b0","#d8943a","#4a2a0a"], glow:"255,184,106"}
});
Object.assign(QUEST_EMBLEMS, {
  pg_cristales:{name:"Cristal de la Convergencia", icon:"crystal", tint:"#70c9ff"},
  pg_coliseo:  {name:"Espadas del Coliseo",        icon:"sword",   tint:"#ffb86a"},
  pg_trofeo:   {name:"Trofeo",                     icon:"trophy",  tint:"#ffcf5c"}
});
// LOGROS de postgame. `test(P, mode, ctx)`: P = save.postgame, ctx = resultado de la partida que acaba de terminar.
const POSTGAME_ACHIEVEMENTS = [
  {id:"pg_cw1",   mode:"cw",  name:"Rompecristales",       desc:"Ganá una Guerra de Cristales.",                    test:(P)=>P.modes.cw.wins>=1,  reward:{title:"pg_rompe"}},
  {id:"pg_cw10",  mode:"cw",  name:"Estratega",            desc:"Ganá 10 Guerras de Cristales.",                    test:(P)=>P.modes.cw.wins>=10, reward:{title:"pg_estratega", frame:"pg_convergencia", emblem:"pg_cristales"}},
  {id:"pg_cws3",  mode:"cw",  name:"Imparable",            desc:"Ganá 3 Guerras de Cristales seguidas.",            test:(P)=>P.modes.cw.best>=3,  reward:{title:"pg_racha"}},
  {id:"pg_col1",  mode:"col", name:"Campeón del Coliseo",  desc:"Ganá un torneo del Coliseo.",                      test:(P)=>P.modes.col.wins>=1, reward:{title:"pg_campeon"}},
  {id:"pg_col10", mode:"col", name:"Gladiador",            desc:"Ganá 10 torneos del Coliseo.",                     test:(P)=>P.modes.col.wins>=10, reward:{frame:"pg_coliseo", emblem:"pg_coliseo"}},
  {id:"pg_colperf",mode:"col",name:"Invicto",              desc:"Ganá un torneo sin perder ni un duelo (3-0).",     test:(P,m,c)=>m==="col" && !!c && c.won && c.duelsWon>=3 && c.duelsNotWon===0, reward:{title:"pg_invicto"}},
  {id:"pg_trof500",mode:"any",name:"Leyenda del postgame", desc:"Juntá 500 trofeos en un modo.",                    test:(P)=>Math.max(P.modes.cw.trophies,P.modes.col.trophies)>=500, reward:{title:"pg_leyenda", emblem:"pg_trofeo"}}
];
