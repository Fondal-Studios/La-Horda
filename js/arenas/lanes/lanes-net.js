"use strict";
/* ============================================================
   js/arenas/lanes/lanes-net.js
   GUERRA DE CRISTALES en el motor real — multijugador. Usa el cooperativo de siempre (anfitrión
   autoritativo, hasta 4 humanos, bots de relleno): los slots 0 y 1 son el equipo Zafiro y los 2 y 3
   el Ámbar. Los invitados reciben los dos carriles completos en el snapshot (enemigos y héroes ya
   llevan `lane`); acá viaja solo lo propio de la modalidad (cristales, fragmentos, envíos, reloj).
   ============================================================ */
function lanesNetState(){
  const L = LN; if(!L) return null;
  return {t:Math.round(L.t), wave:L.wave, nw:Math.round(L.nextWave), ended:L.ended ? 1 : 0, w:L.winner, why:L.why || "",
    lane:L.lane.map(l=>({sh:l.shards, up:l.upgrade, ra:Math.round(l.repairAt), wa:Math.round(l.wardAt), sa:Math.round(l.sendAt), k:l.kills, se:l.sent, as:l.assist,
      hp:Math.round(l.crystal.hp*10)/10, ward:Math.round(l.crystal.ward)})),
    pend:L.pending.map(p=>({f:p.from, to:p.to, kind:p.kind, due:Math.round(p.due)}))};
}
function lanesApplyNetState(s){
  const L = LN; if(!L || !s) return;
  L.t = s.t; L.wave = s.wave; L.nextWave = s.nw; L.winner = s.w; L.why = s.why;
  const wasEnded = L.ended; L.ended = !!s.ended;
  s.lane.forEach((d, i)=>{ const l = L.lane[i]; if(!l) return;
    l.shards = d.sh; l.upgrade = d.up; l.repairAt = d.ra; l.wardAt = d.wa; l.sendAt = d.sa; l.kills = d.k; l.sent = d.se; l.assist = d.as;
    if(d.hp < l.crystal.hp - 0.5) l.crystal.hitFlash = 220; l.crystal.hp = d.hp; l.crystal.ward = d.ward; });
  L.pending = (s.pend || []).map(p=>({from:p.f, to:p.to, kind:p.kind, due:p.due}));
  if(L.ended && !wasEnded && L.role === "guest") lanesGuestFinished();
}
// Invitado: arranca la partida (gancho guestStart; el guardado temporal ya lo puso netGuestStartRun).
function lanesGuestStart(){
  const L = LN; if(!L) return;
  L.role = "guest"; L.t = 0; L.ended = false; L.winner = -1; L.pending = [];
  lanesHudShow();
}
function lanesGuestUpdate(dt){ const L = LN; if(L && !L.ended) L.t += dt; }
// El invitado se entera del final por el estado de la arena (o por el aviso "end" del anfitrión).
let _lnGuestShown = 0;
function lanesGuestFinished(){
  if(!LN || _lnGuestShown === LN.snap) return; _lnGuestShown = LN.snap;
  setTimeout(()=>{ if(LN && typeof lanesShowResult === "function") lanesShowResult(); }, 1600);
}
function lanesGuestEnd(d){
  const L = LN; if(!L) return;
  if(d.lanes){ L.ended = true; L.winner = d.lanes.winner; L.why = d.lanes.why; }
  lanesGuestFinished();
}
// Compra: el invitado la pide; el anfitrión la valida (equipo, fragmentos, enfriamientos, ventana).
function lanesNetBuyRequest(key){ if(netIsGuest()) { netSendToHost({k:"ln-buy", key}); return true; } return false; }
Object.assign(ARENA_DEFS.convergencia, {netState:lanesNetState, applyNetState:lanesApplyNetState, guestStart:lanesGuestStart, guestUpdate:lanesGuestUpdate});

/* ---------------- entrada online (la Sala de siempre, con el guardado temporal puesto) ---------------- */
// Crea una sala de Guerra de Cristales. El anfitrión elige su guardián entre TODOS (el guardado temporal los habilita).
async function lanesOnlineCreate(champ){
  if(typeof netAvailable === "function" && !netAvailable()){ showNetToast("El modo online no está configurado en esta versión."); return false; }
  if(LN) lanesRestore();
  lanesBegin("lobby");
  if(champ && CLASSES[champ]) selectedClass = champ;
  currentArena = "convergencia";
  setState("prep"); if(typeof renderPrepSummary === "function") renderPrepSummary();
  try{ await netCreateRoom("convergencia", selectedClass, LANES.LEVEL, null); }
  catch(e){ if(LN && LN.lobby) lanesRestore(); setState("mainmenu"); if(typeof renderMainMenu === "function") renderMainMenu(); if(!(e && e.handled)) showNetToast("⚠ No se pudo crear la sala: " + (e && e.message || e)); return false; }
  return true;
}
async function lanesOnlineJoin(code, champ){
  if(typeof netAvailable === "function" && !netAvailable()){ showNetToast("El modo online no está configurado en esta versión."); return false; }
  if(LN) lanesRestore();
  lanesBegin("lobby");
  if(champ && CLASSES[champ]) selectedClass = champ;
  try{ await netJoinRoom(code, selectedClass, LANES.LEVEL, null); }
  catch(e){ if(LN && LN.lobby) lanesRestore(); if(!(e && e.handled)) showNetToast("⚠ No se pudo unir: " + (e && e.message || e)); return false; }
  return true;
}
// Después del resultado: volver a la Sala (mismo código) o salir de la sala.
function lanesLeaveOnline(leaveRoom){
  if(typeof netCancelAutoReturn === "function") netCancelAutoReturn();
  netFinishMatch();                         // devuelve lo de los invitados al guardado temporal y cierra la partida
  const stay = !leaveRoom && netInRoom();
  if(stay){ if(LN){ LN.lobby = true; LN.ended = true; } currentArena = "convergencia"; setState("prep"); if(typeof renderPrepSummary === "function") renderPrepSummary(); lanesHudHide(); return; }
  if(netInRoom()) netLeaveRoom();
  lanesStop("mainmenu");
}
