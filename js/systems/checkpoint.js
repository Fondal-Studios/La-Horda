"use strict";
/* ============================================================
   js/systems/checkpoint.js
   PUNTO DE CONTROL EN EL NIVEL 5 (solo campaña en solitario). Diseño: docs/ux/derrota-checkpoint.md (variante C).
   - Al superar el nivel 5 de una arena (partida que empezó en el nivel 1) se guarda UN punto de control por arena
     en save.checkpoints[arena]. Lo ganado hasta ahí queda a salvo: el castigo de derrota/abandono (progression.js)
     solo cuenta lo ganado DESPUÉS del punto de control.
   - Tras caer, la pantalla de derrota ofrece "Reanudar desde el nivel 5" o "Empezar de nuevo desde el nivel 1".
   - Reanudar NO conserva refuerzos ni mejoras de la incursión, paga CP_PAY de la XP y el oro de combate, no da botín de
     consuelo, y el punto de control se agota tras CP_MAX_RESUMES reanudaciones. Ganar la arena lo borra.
   - Nunca se salta el jefe (nivel 10) ni los desbloqueos: solo se gana en finishBossVictory.
   - No existe en cooperativo / sala / Horda Infinita / Divina / Coliseo / Guerra de Cristales / Test Lab.
   ============================================================ */
const CP_LEVEL = 5;          // nivel que se reanuda; el punto de control se crea al SUPERARLO (entrar al 6)
const CP_MAX_RESUMES = 3;    // reanudaciones por punto de control (después hay que volver a pasar el nivel 5 jugando)
const CP_PAY = 0.75;         // fracción de XP/oro de combate que paga una partida reanudada (ver docs/ux/derrota-checkpoint.md)
let _cpResuming = false;     // lo arma checkpointResume(); startRun lo consume
let runResumed = false;      // esta partida arrancó desde un punto de control
let runBanked = false;       // el castigo de esta partida ya parte del punto de control (lo anterior está a salvo)
let cpVictory = false;       // victoria en curso: su XP/oro no se descuentan

function checkpointEligible(){
  try{
    if(typeof netMatch!=="undefined" && netMatch) return false;
    if(typeof netInRoom==="function" && netInRoom()) return false;
    if(typeof netIsHost==="function" && netIsHost()) return false;
    if(typeof endlessOn==="function" && endlessOn()) return false;
    if(typeof lanesOn==="function" && lanesOn()) return false;
    if(typeof testLabActive==="function" && testLabActive()) return false;
    if(typeof divinaMode!=="undefined" && divinaMode) return false;
    return typeof ARENA_ORDER!=="undefined" && ARENA_ORDER.includes(currentArena);
  }catch(e){ return false; }
}
function checkpointDiff(){ return typeof diffCurrent==="function" ? diffCurrent() : "normal"; }
// El punto de control de la arena actual si se puede usar ahora (mismo guardián y dificultad, arena abierta, no agotado).
function checkpointAvailable(){
  if(!checkpointEligible() || typeof player==="undefined" || !player) return null;
  const cp = save.checkpoints && save.checkpoints[currentArena];
  if(!cp || cp.level!==CP_LEVEL || cp.champ!==player.classKey || cp.diff!==checkpointDiff()) return null;
  if((cp.uses|0) >= CP_MAX_RESUMES) return null;
  if(typeof isArenaUnlocked==="function" && !isArenaUnlocked(currentArena)) return null;
  return cp;
}
function checkpointLeft(cp){ return Math.max(0, CP_MAX_RESUMES - ((cp && cp.uses)|0)); }
// Nueva partida: se llama desde startRun, después de fijar la base del castigo.
function checkpointOnRunStart(){
  runResumed = _cpResuming; _cpResuming = false; runBanked = runResumed; cpVictory = false;
}
// Se superó un nivel (buff-choice.js, ya sumado runLevel): al pasar el 5 en una partida que empezó en el 1 se crea el punto de control.
function checkpointOnLevelPassed(){
  if(runLevel!==CP_LEVEL+1 || runResumed || !checkpointEligible()) return false;
  save.checkpoints = save.checkpoints || {};
  const champ = player.classKey;
  save.checkpoints[currentArena] = {level:CP_LEVEL, champ, diff:checkpointDiff(), uses:0, xp:totalXpForChamp(champ), gold:save.gold|0};
  runStartXp = totalXpForChamp(champ); runStartGold = save.gold; runBanked = true; // lo ganado hasta acá queda a salvo
  persist();
  if(typeof showBanner==="function") showBanner("PUNTO DE CONTROL: nivel 5 superado. Lo ganado hasta acá queda a salvo.", 2);
  return true;
}
// Reanudar: arranca en el nivel 5 con la base del castigo en el estado actual. Devuelve false si no hay punto válido.
function checkpointResume(){
  const cp = checkpointAvailable(); if(!cp) return false;
  cp.uses = (cp.uses|0) + 1; persist();
  _cpResuming = true;
  startRun(CP_LEVEL);
  return true;
}
function checkpointClear(arena){ if(save.checkpoints && arena in save.checkpoints){ delete save.checkpoints[arena]; return true; } return false; }
// Multiplicador de XP/oro de combate (progression.js: grantXP / grantGold). La victoria no se descuenta.
function checkpointPay(){ return (runResumed && !cpVictory) ? CP_PAY : 1; }
// Guardado: un objeto {arena: {level, champ, diff, uses, xp, gold}}; lo inválido se descarta, nada más se toca.
function checkpointsNormalize(raw){
  const out = {};
  if(!raw || typeof raw!=="object") return out;
  for(const a in raw){
    const c = raw[a]; if(!c || typeof c!=="object" || !a) continue;
    if((c.level|0)!==CP_LEVEL || typeof c.champ!=="string") continue;
    out[a] = {level:CP_LEVEL, champ:c.champ, diff:["normal","pesadilla","infierno"].includes(c.diff)?c.diff:"normal",
      uses:Math.max(0, Math.min(CP_MAX_RESUMES, c.uses|0)), xp:Math.max(0, +c.xp||0), gold:Math.max(0, +c.gold||0)};
  }
  return out;
}
// Texto de la pantalla de derrota. null = no hay oferta (se muestra el aviso de siempre).
function checkpointDefeatHTML(){
  const cp = checkpointAvailable(); if(!cp) return null;
  const left = checkpointLeft(cp), pay = Math.round((1-CP_PAY)*100);
  return `<b style="color:#8fd8ff;">Punto de control disponible: nivel ${CP_LEVEL}.</b>` +
    `<span class="go-loss-sub"><b>Se conserva:</b> tu nivel, tu XP y tu oro hasta el nivel ${CP_LEVEL}, y el jefe sigue en el nivel ${typeof LEVEL_COUNT!=="undefined"?LEVEL_COUNT:10}.</span>` +
    `<span class="go-loss-sub"><b>Se pierde:</b> refuerzos y mejoras de esta incursión, el botín de consuelo y un ${pay}% de la XP y el oro que ganes al reanudar. Reanudaciones restantes: ${left}.</span>`;
}
function checkpointNoOfferHTML(){
  if(!checkpointEligible()) return "Sin puntos de control: la próxima incursión comienza en el Nivel 1.";
  return `Sin punto de control todavía: se crea al superar el nivel ${CP_LEVEL} de una arena. Ahora la próxima incursión comienza en el Nivel 1.`;
}
