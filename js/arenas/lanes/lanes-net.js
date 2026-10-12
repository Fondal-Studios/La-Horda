"use strict";
/* ============================================================
   js/arenas/lanes/lanes-net.js
   GUERRA DE CRISTALES en el motor real — multijugador. Usa el cooperativo de siempre (anfitrión
   autoritativo, hasta 4 humanos, bots de relleno): los slots 0 y 1 son el equipo Zafiro y los 2 y 3
   el Ámbar. Los invitados reciben el mapa completo en el snapshot (enemigos y héroes ya llevan `team`);
   acá viaja solo lo propio de la modalidad (estructuras, fragmentos, cartas de horda, reloj).
   ============================================================ */
function lanesNetState(){
  const L = LN; if(!L) return null;
  return {t:Math.round(L.t), wave:L.wave, ended:L.ended ? 1 : 0, w:L.winner, why:L.why || "",
    team:L.team.map(T=>({sh:T.shards, ra:Math.round(T.repairAt), wa:Math.round(T.wardAt), sa:Math.round(T.sendAt), k:T.kills, se:T.sent, as:T.assist, pk:T.pk, wv:T.wave, nw:Math.round(T.nextWave),
      c:T.cards, tk:T.taken, of:T.offer, oa:Math.round(T.offerAt), nc:T.nextCard === Infinity ? -1 : Math.round(T.nextCard),
      s:T.S.map(x=>({hp:Math.round(x.hp*10)/10, wd:Math.round(x.ward), al:x.alive ? 1 : 0}))})),
    sh:L.shots.slice(-6).map(x=>[Math.round(x.x1), Math.round(x.y1), Math.round(x.x2), Math.round(x.y2), Math.round(L.t - x.t), x.team]),
    feed:L.feed.map(f=>({t:Math.round(f.t), x:f.text, team:f.team}))};
}
function lanesApplyNetState(s){
  const L = LN; if(!L || !s) return;
  L.t = s.t; L.wave = s.wave; L.winner = s.w; L.why = s.why;
  const wasEnded = L.ended; L.ended = !!s.ended;
  s.team.forEach((d, i)=>{ const T = L.team[i]; if(!T) return;
    T.shards = d.sh; T.repairAt = d.ra; T.wardAt = d.wa; T.sendAt = d.sa; T.kills = d.k; T.sent = d.se; T.assist = d.as; T.pk = d.pk; T.wave = d.wv; T.nextWave = d.nw;
    T.cards = d.c || {}; T.taken = d.tk; T.offer = d.of || null; T.offerAt = d.oa; T.nextCard = d.nc < 0 ? Infinity : d.nc; T.mods = lanesModsOf(T.cards);
    d.s.forEach((x, k)=>{ const S = T.S[k]; if(!S) return; if(x.hp < S.hp - 0.5) S.hitFlash = 200; S.hp = x.hp; S.ward = x.wd; S.alive = !!x.al; }); });
  L.shots = (s.sh || []).map(a=>({x1:a[0], y1:a[1], x2:a[2], y2:a[3], t:s.t - a[4], team:a[5]}));
  L.feed = (s.feed || []).map(f=>({t:f.t, text:f.x, team:f.team}));
  if(L.ended && !wasEnded && L.role === "guest") lanesGuestFinished();
}
// Invitado: arranca la partida (gancho guestStart; el guardado temporal ya lo puso netGuestStartRun).
function lanesGuestStart(){
  const L = LN; if(!L) return;
  L.role = "guest"; L.t = 0; L.ended = false; L.winner = -1; L.shots = []; L.feed = [];
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
function lanesNetCardRequest(i){ if(netIsGuest()){ netSendToHost({k:"ln-card", i}); return true; } return false; }
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

// Aviso de equipos en la Sala (solo cuando la sala es de Guerra de Cristales).
function lanesTeamHint(){
  if(typeof currentArena === "undefined" || currentArena !== "convergencia") return "";
  const me = typeof net !== "undefined" ? net.slot : 0, mine = me < 2 ? "ZAFIRO" : "ÁMBAR";
  return '<div class="net-hint" style="font-size:15px;line-height:1.35"><b style="color:#70c9ff">ZAFIRO:</b> jugadores 1 y 2 · <b style="color:#ffb86a">ÁMBAR:</b> jugadores 3 y 4. Vos jugás en <b>' + mine + '</b>. Todos juegan al mismo nivel y sin equipo; los lugares libres los ocupan bots.</div>';
}
