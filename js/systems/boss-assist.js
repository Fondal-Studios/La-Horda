"use strict";
/* ============================================================
   js/systems/boss-assist.js
   AYUDA ADAPTATIVA HONESTA PARA EL JEFE DE CAMPAÑA (solo Normal, solo en solitario).
   Problema (auditoría de producto, docs/economy/JEFE_AYUDA.md): las derrotas del playtest caen todas contra el jefe del
   nivel 10; para el jugador medio la campaña era un muro ahí.
   Regla: cada derrota en el nivel del jefe de una arena que todavía no superaste suma BOSS_ASSIST.step de reducción de
   vida Y daño del jefe de ESA arena, hasta BOSS_ASSIST.cap. Se limpia al ganar la arena. Quien gana a la primera no la ve.
   - Honesta: se avisa al entrar a la arena y en la pantalla de derrota, con la cifra exacta, y se puede apagar (Opciones, PREFS.bossAssist,
     o el botón de la pantalla de derrota). Apagada = jefe de siempre.
   - Acotada: solo Normal (Pesadilla/Infierno no), solo en solitario (nada en cooperativo, sala, Horda Infinita, Divina, Coliseo,
     Guerra de Cristales, Test Lab ni entrenamiento) y solo en arenas de la campaña sin superar (rejugar una superada es el jefe pleno).
   - Qué toca: vida del jefe (scaleBossStats, waves.js) y daño (runDifficulty.avgHp, que ancla e.dmg y los golpes con aviso del jefe, se
     reduce UNA vez al empezar el nivel 10). La horda, los subjefes de niveles anteriores y los enemigos invocados no cambian.
   - Guardado: save.bossDefeats = {arena: derrotas en el nivel del jefe}. Guardados viejos no lo tienen: vale 0 (save.js lo normaliza).
   ============================================================ */
let BOSS_ASSIST = { step:0.07, cap:0.25 };   // let: tools/playtest/boss-assist.js lo varía para calibrar
let bossAssistFrac = 0;                       // reducción aplicada a ESTA partida (se fija al empezar el nivel 10)
let bossAssistLast = null;                    // resultado de la última derrota registrada (para la pantalla de derrota)

function bossDefeatsOf(arena){ const m = save.bossDefeats; return (m && typeof m==="object") ? Math.max(0, m[arena]|0) : 0; }
// ¿Esta partida puede llevar la ayuda? (campaña en solitario, Normal, arena de la campaña sin superar)
function bossAssistEligible(){
  try{
    if(typeof currentArena==="undefined" || typeof ARENA_ORDER==="undefined" || !ARENA_ORDER.includes(currentArena)) return false;
    if(typeof netMatch!=="undefined" && netMatch) return false;
    if(typeof netInRoom==="function" && netInRoom()) return false;
    if(typeof netIsHost==="function" && netIsHost()) return false;
    if(typeof endlessOn==="function" && endlessOn()) return false;
    if(typeof lanesOn==="function" && lanesOn()) return false;
    if(typeof testLabActive==="function" && testLabActive()) return false;
    if(typeof divinaMode!=="undefined" && divinaMode) return false;
    if(typeof ALPHA_TRAINING!=="undefined" && ALPHA_TRAINING.active) return false;
    if(typeof diffCurrent==="function" && diffCurrent()!=="normal") return false;
    return !(save.arenasCleared && save.arenasCleared[currentArena]);
  }catch(e){ return false; }
}
function bossAssistPrefOn(){ return typeof PREFS==="undefined" || PREFS.bossAssist!==false; }
// Reducción (0..cap) que llevaría el jefe con `n` derrotas
function bossAssistPctFor(n){ return Math.min(BOSS_ASSIST.cap, Math.max(0, n|0)*BOSS_ASSIST.step); }
// Reducción vigente ahora en la arena actual (0 si no corresponde o está apagada)
function bossAssistPct(){
  if(!bossAssistPrefOn() || !bossAssistEligible()) return 0;
  return bossAssistPctFor(bossDefeatsOf(currentArena));
}
const bossAssistTxt = f => "−" + Math.round(f*100) + " %";
// Se llama al empezar el nivel 10 (waves.js: beginLevel): fija la ayuda de la partida y baja el daño anclado del jefe.
function bossAssistBegin(){
  bossAssistFrac = 0;
  if(typeof LEVEL_COUNT==="undefined" || runLevel!==LEVEL_COUNT) return;
  const f = bossAssistPct();
  if(f > 0 && typeof runDifficulty!=="undefined" && runDifficulty){ bossAssistFrac = f; runDifficulty.avgHp *= (1 - f); }
}
// Multiplicador de vida del jefe (scaleBossStats). Solo vale desde el nivel 10.
function bossAssistHpMult(){ return (bossAssistFrac > 0 && runLevel>=LEVEL_COUNT) ? (1 - bossAssistFrac) : 1; }
function bossAssistReset(){ bossAssistFrac = 0; bossAssistLast = null; }
// Derrota real (pantalla "La Horda te ha consumido") en el nivel del jefe: suma un intento. Devuelve el resumen para la pantalla.
function bossAssistOnDefeat(){
  bossAssistLast = null;
  if(typeof LEVEL_COUNT==="undefined" || runLevel < LEVEL_COUNT || !bossAssistEligible()) return null;
  const n = Math.min(99, bossDefeatsOf(currentArena) + 1);
  if(!save.bossDefeats || typeof save.bossDefeats!=="object") save.bossDefeats = {};
  save.bossDefeats[currentArena] = n;
  try{ persist(); }catch(e){}
  bossAssistLast = { n, now:bossAssistFrac, next:bossAssistPctFor(n), on:bossAssistPrefOn(), capped:bossAssistPctFor(n) >= BOSS_ASSIST.cap };
  return bossAssistLast;
}
// Ganar la arena (finishBossVictory) borra el contador de ESA arena.
function bossAssistOnVictory(arena){
  if(save.bossDefeats && arena in save.bossDefeats){ delete save.bossDefeats[arena]; try{ persist(); }catch(e){} }
}
// Aviso al entrar a la arena (solo si hay ayuda activa)
function bossAssistEntryText(){
  const f = bossAssistPct(); if(f <= 0) return null;
  return `Ayuda activa: el jefe tiene ${bossAssistTxt(f)} de vida y daño tras tus intentos. Se puede apagar en Opciones.`;
}
function bossAssistEntryNotice(){
  if(typeof state!=="undefined" && state!=="playing") return;
  const t = bossAssistEntryText(); if(t && typeof showBanner==="function") showBanner(t, 2);
}
// Renglón de la pantalla de derrota (go-loss). null = nada que mostrar (no hubo derrota en el jefe o no corresponde).
function bossAssistDefeatHTML(){
  const L = bossAssistLast; if(!L) return null;
  const btn = (on)=>`<button type="button" class="btn small secondary go-assist-btn" data-boss-assist="${on?"on":"off"}">${on?"Activar la ayuda":"Desactivar la ayuda"}</button>`;
  if(!L.on) return `<b style="color:#cfc6b0;">Ayuda del jefe desactivada.</b><span class="go-loss-sub">Tenés ${L.n} derrota${L.n===1?"":"s"} en el jefe de esta arena. Con la ayuda, el próximo intento sería con ${bossAssistTxt(L.next)} de vida y daño del jefe.</span>${btn(true)}`;
  return `<b style="color:#ffd27a;">Ayuda para el jefe: ${bossAssistTxt(L.next)} de vida y daño en tu próximo intento.</b>` +
    `<span class="go-loss-sub">${L.capped ? "Es el máximo" : `Suma ${Math.round(BOSS_ASSIST.step*100)} % por derrota hasta ${bossAssistTxt(BOSS_ASSIST.cap)}`}; se quita al ganar la arena. Solo en esta arena y en solitario.</span>${btn(false)}`;
}
document.addEventListener("click", e=>{
  const b = e.target.closest && e.target.closest("[data-boss-assist]"); if(!b) return;
  const on = b.dataset.bossAssist==="on";
  if(typeof prefSet==="function") prefSet("bossAssist", on);
  if(bossAssistLast){ bossAssistLast.on = on; const el = document.querySelector("#go-loss .go-loss-assist"); if(el) el.innerHTML = bossAssistDefeatHTML() || ""; }
});
