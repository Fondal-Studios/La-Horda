"use strict";
/* ============================================================
   js/systems/ranking-hooks.js
   RANGO — conecta js/systems/ranking.js (Ladder, sin DOM) con las partidas del juego:
   Guerra de Cristales y Coliseo del motor real (LN), la Horda Infinita y las salas en línea de la versión Convergencia (client.js).
   - Durante una partida de lanes/Coliseo el guardado en uso es TEMPORAL (LN.snap.save guarda el real): el rango se anota SIEMPRE en
     el real y se escribe a disco al volver (ladderFlush, desde lanesRestore). Nada más del guardado se toca.
   - Abandono: salir de una partida de lanes/Coliseo sin terminarla (lanesRestore) o cerrar la pestaña (pagehide).
   - Inactividad (AFK): el jugador no se mueve, ni ataca, ni usa habilidades durante AFK_MS con vida y en plena pelea.
   ============================================================ */
const LADDER_AFK_MS = {col: 30000, cw: 75000, horda: 45000};
let _ladderDirty = false;

function ladderTargetSave(){
  if(typeof lanesOn === "function" && lanesOn() && LN && LN.snap && LN.snap.save) return LN.snap.save;   // el guardado REAL, no el temporal de la partida
  return save;
}
function ladderEligibleNow(){
  if(typeof ALPHA_TRAINING !== "undefined" && ALPHA_TRAINING.active) return false;
  if(typeof testLabActive === "function" && testLabActive()) return false;                              // banco de pruebas / GM: nunca cuenta
  return true;
}
// Anota un informe en el guardado real. Devuelve el resultado de Ladder.record (o null si no hay rango).
function ladderCommit(rep){
  if(typeof Ladder === "undefined") return null;
  const sv = ladderTargetSave(); if(!sv) return null;
  let res = null;
  try{ res = Ladder.record(sv, rep, Date.now()); }catch(e){ console.error("Rango:", e); return null; }
  if(res && (res.counted || res.reason === "ceiling" || res.reason === "daycap")) _ladderDirty = true;
  return res;
}
// Escribe a disco lo anotado (solo cuando el guardado real ya es el que está en uso).
function ladderFlush(){
  if(!_ladderDirty) return;
  if(typeof lanesOn === "function" && lanesOn()) return;
  _ladderDirty = false;
  try{ if(typeof persistNow === "function") persistNow(); }catch(e){}
}
function ladderMatchId(L, tag){ return L.rankId || (L.rankId = (tag || "m") + "-" + Date.now().toString(36) + "-" + ((L.rng || 0) >>> 0).toString(36)); }

/* ---------------- lanes / Coliseo (motor real) ---------------- */
function ladderLanesReport(L){
  const me = player && player.team != null ? player.team : 0, col = L.mode === "coliseo", humanIn = t => heroes.some(h => h.team === t && lanesIsHuman(h));
  const rep = {id: ladderMatchId(L, col ? "col" : "cw"), mode: col ? "col" : "cw", durationMs: Math.round(L.t || 0), eligible: ladderEligibleNow() && !L.lobby && L.role !== "lobby", afk: !!(L.afk && L.afk.flagged)};
  if(col){
    rep.field = 4; rep.opps = L.team.filter(T => T.team !== me).map(T => ({human: humanIn(T.team)}));
    const st = (typeof colStanding === "function") ? colStanding() : [], mine = st.findIndex(T => T.team === me), T0 = L.team[me];
    rep.place = mine >= 0 ? mine + 1 : 4;
    rep.tied = Math.max(1, st.filter(T => T.points === T0.points && T.pk === T0.pk).length);
    if(rep.tied > 1) rep.place = st.findIndex(T => T.points === T0.points && T.pk === T0.pk) + 1;   // empate: comparte el mejor puesto
    rep.outcome = rep.place === 1 && rep.tied === 1 ? "win" : rep.place >= 3 ? "loss" : "draw";
  } else {
    rep.field = 2; rep.opps = [{human: humanIn(1 - me)}];
    rep.outcome = L.winner === me ? "win" : L.winner === -1 ? "draw" : "loss";
  }
  return rep;
}
// La partida terminó y se muestran los resultados (lanesShowResult / colShowResult). Una sola vez por partida.
function ladderOnLanesResult(L){
  if(!L || L.rankDone || typeof Ladder === "undefined") return null;
  L.rankDone = true;
  const res = ladderCommit(ladderLanesReport(L));
  L.rankRes = res; return res;
}
// Se sale de una partida sin terminarla: abandono. Lo llama lanesRestore antes de soltar LN.
function ladderOnLanesExit(L){
  if(!L || L.rankDone || L.ended || L.lobby || typeof Ladder === "undefined" || !player) return null;
  L.rankDone = true;
  const rep = ladderLanesReport(L); rep.abandon = true;
  return ladderCommit(rep);
}
// Línea de texto para la pantalla de resultados (vacía si no hay rango para mostrar).
function ladderResultLine(res){ return typeof Ladder !== "undefined" && res ? Ladder.describe(res) : ""; }

/* ---------------- inactividad (AFK) ---------------- */
let _afk = {id: null, ms: 0, x: 0, y: 0, cd: 0};
function ladderAfkContext(){
  if(typeof state === "undefined" || state !== "playing" || !player || !player.alive) return null;
  if(typeof lanesOn === "function" && lanesOn() && LN && !LN.ended){
    if(LN.mode === "coliseo"){ const c = LN.col; return c && c.phase === "fight" && !c.res[player.pit] ? "col" : null; }
    return "cw";
  }
  if(typeof endlessOn === "function" && endlessOn() && !runEnding) return "horda";
  return null;
}
function ladderAfkTick(dt){
  const ctxKey = ladderAfkContext(); if(!ctxKey){ _afk.ms = 0; return; }
  const cd = (player.cds ? player.cds[0] + player.cds[1] + player.cds[2] : 0) + (player.ultCd || 0) + (player.basicCd || 0);
  const moved = Math.hypot(player.x - _afk.x, player.y - _afk.y) > 3, used = cd > _afk.cd + 1;
  const input = (typeof joyVec !== "undefined" && (Math.abs(joyVec.x) > 0.1 || Math.abs(joyVec.y) > 0.1)) || (typeof basicHeld !== "undefined" && basicHeld);
  _afk.x = player.x; _afk.y = player.y; _afk.cd = cd;
  if(moved || used || input){ _afk.ms = 0; return; }
  _afk.ms += dt;
  if(_afk.ms >= LADDER_AFK_MS[ctxKey]){
    if(ctxKey === "horda"){ if(typeof EN !== "undefined" && EN.local) EN.local.afk = true; }
    else if(LN){ LN.afk = LN.afk || {}; if(!LN.afk.flagged){ LN.afk.flagged = true; try{ showBanner("Seguís sin moverte: esta partida no va a sumar puntos"); }catch(e){} } }
  }
}

/* ---------------- Horda Infinita ---------------- */
// Lo llama endlessEndRun (una vez por partida, antes de guardar). `reason`: "defeat" | "quit".
function ladderOnEndless(L, reason){
  if(typeof Ladder === "undefined" || typeof EN === "undefined") return null;
  const rep = {id: "horda-" + String(EN.id || Date.now()), mode: "horda", outcome: "loss", round: EN.round | 0, durationMs: Math.round(typeof runElapsedMs !== "undefined" ? runElapsedMs : 0),
    eligible: ladderEligibleNow(), abandon: reason === "quit", afk: !!(L && L.afk)};
  const res = ladderCommit(rep); if(L) L.rankRes = res; return res;
}

/* ---------------- salas en línea de Convergencia (js/modes/crystal-wars/client.js) ---------------- */
// info: {mode:"cw"|"col", outcome, humansOpp, id, durationMs, abandon}. Solo se llama en salas (nunca en el entrenamiento contra bots).
function ladderOnLegacy(info){
  if(typeof Ladder === "undefined" || !info) return null;
  const opps = [{human: (info.humansOpp | 0) > 0}];
  const res = ladderCommit({id: "lg-" + String(info.id || Date.now()), mode: info.mode === "col" ? "col" : "cw", field: 2, outcome: info.outcome, opps, durationMs: info.durationMs | 0, abandon: !!info.abandon, eligible: ladderEligibleNow()});
  ladderFlush(); return res;
}

/* ---------------- cierre de pestaña = abandono ---------------- */
addEventListener("pagehide", () => {
  try{
    if(typeof lanesOn !== "function" || !lanesOn() || !LN || LN.ended || LN.rankDone) return;
    const res = ladderOnLanesExit(LN);
    if(res && res.counted && LN.snap && LN.snap.save && typeof SAVE_KEY !== "undefined") localStorage.setItem(SAVE_KEY, JSON.stringify(LN.snap.save));   // el guardado real, ya con el abandono
  }catch(e){}
});
