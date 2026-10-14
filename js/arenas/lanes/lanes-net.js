"use strict";
/* ============================================================
   js/arenas/lanes/lanes-net.js
   GUERRA DE CRISTALES en el motor real — multijugador. Usa el cooperativo de siempre (anfitrión
   autoritativo, hasta 4 humanos, bots de relleno): los slots 0 y 1 son el equipo Zafiro y los 2 y 3
   el Ámbar. Los invitados reciben el mapa completo en el snapshot (enemigos y héroes ya llevan `team`);
   acá viaja solo lo propio de la modalidad (estructuras, fragmentos, cartas de horda, reloj).
   ============================================================ */
// OJO: el serializador de red corta la profundidad (los arrays dentro de objetos anidados se pierden): solo escalares por equipo
// y todo lo demás en arrays PLANOS al nivel superior (índice = equipo*3 + estructura, equipo*N + carta).
function lanesNetState(){
  const L = LN; if(!L) return null;
  const cards = [], hp = [], wd = [], al = [];
  for(const T of L.team){ for(const id of LANES_CARD_IDS) cards.push(T.cards[id] || 0); for(const x of T.S){ hp.push(Math.round(x.hp*10)/10); wd.push(Math.round(x.ward)); al.push(x.alive ? 1 : 0); } }
  return {t:Math.round(L.t), wave:L.wave, ended:L.ended ? 1 : 0, w:L.winner, why:L.why || "",
    team:L.team.map(T=>({ra:Math.round(T.repairAt), wa:Math.round(T.wardAt), sa:Math.round(T.sendAt), k:T.kills, se:T.sent, as:T.assist, pk:T.pk, tw:T.tk, wv:T.wave, nw:Math.round(T.nextWave),
      tk:T.taken, cl:T.cardLevel, oa:Math.round(T.offerAt), pc:T.pendingCards, sw:T.superWaves})),
    hp, wd, al, cd:cards, of:L.team.map(T=>T.offer ? T.offer.join(",") : ""),
    bf:L.team.reduce((a, T)=>a.concat([Math.round(T.buffs.dragon), Math.round(T.buffs.rey)]), []),
    ep:(L.epics || []).reduce((a, e)=>a.concat([e.mon && e.mon.alive ? 1 : 0, Math.round(e.respawnAt)]), []),
    sh:L.shots.slice(-8).reduce((a, x)=>a.concat([Math.round(x.x1), Math.round(x.y1), Math.round(x.x2), Math.round(x.y2), Math.round(L.t - x.t), x.team]), []),
    fd:L.feed.map(f=>f.team + "|" + Math.round(f.t) + "|" + f.text)};
}
function lanesApplyNetState(s){
  const L = LN; if(!L || !s || !s.team) return;
  L.t = s.t; L.wave = s.wave; L.winner = s.w; L.why = s.why;
  const wasEnded = L.ended; L.ended = !!s.ended;
  const N = LANES_CARD_IDS.length;
  s.team.forEach((d, i)=>{ const T = L.team[i]; if(!T) return;
    T.repairAt = d.ra; T.wardAt = d.wa; T.sendAt = d.sa; T.kills = d.k; T.sent = d.se; T.assist = d.as; T.pk = d.pk; T.tk = d.tw; T.wave = d.wv; T.nextWave = d.nw;
    T.cards = {}; LANES_CARD_IDS.forEach((id, k)=>{ const n = s.cd && s.cd[i * N + k]; if(n) T.cards[id] = n; });
    T.cardLevel = d.cl == null ? LANES.LEVEL0 + d.tk + (d.pc || 0) + ((s.of && s.of[i]) ? 1 : 0) : d.cl;
    T.taken = d.tk; T.offerAt = d.oa; T.pendingCards = d.pc || 0; T.superWaves = d.sw || 0; T.mods = lanesModsOf(T.cards);
    const o = s.of && s.of[i]; T.offer = o ? o.split(",") : null;
    if(s.bf){ T.buffs.dragon = s.bf[i * 2]; T.buffs.rey = s.bf[i * 2 + 1]; }
    T.S.forEach((S, k)=>{ const j = i * 10 + k, hp = s.hp ? s.hp[j] : S.hp; if(hp < S.hp - 0.5) S.hitFlash = 200; S.hp = hp; S.ward = s.wd ? s.wd[j] : 0; S.alive = s.al ? !!s.al[j] : true; }); });
  L.epics = LANES_EPICS.map((e, i)=>({id:e.id, mon:(s.ep && s.ep[i * 2]) ? {alive:true} : null, respawnAt:s.ep ? s.ep[i * 2 + 1] : 0}));
  L.shots = []; for(let k = 0; s.sh && k + 5 < s.sh.length; k += 6) L.shots.push({x1:s.sh[k], y1:s.sh[k+1], x2:s.sh[k+2], y2:s.sh[k+3], t:s.t - s.sh[k+4], team:s.sh[k+5]});
  L.feed = (s.fd || []).map(f=>{ const p = String(f).split("|"); return {team:+p[0], t:+p[1], text:p.slice(2).join("|")}; });
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
function lanesNetRecallRequest(){ if(netIsGuest()){ netSendToHost({k:"ln-recall"}); return true; } return false; }
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
  try{ await netCreateRoom("convergencia", selectedClass, LANES.LEVEL0, null); }
  catch(e){ if(LN && LN.lobby) lanesRestore(); setState("mainmenu"); if(typeof renderMainMenu === "function") renderMainMenu(); if(!(e && e.handled)) showNetToast("⚠ No se pudo crear la sala: " + (e && e.message || e)); return false; }
  return true;
}
async function lanesOnlineJoin(code, champ){
  if(typeof netAvailable === "function" && !netAvailable()){ showNetToast("El modo online no está configurado en esta versión."); return false; }
  if(LN) lanesRestore();
  lanesBegin("lobby");
  if(champ && CLASSES[champ]) selectedClass = champ;
  try{ await netJoinRoom(code, selectedClass, LANES.LEVEL0, null); }
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
  return '<div class="net-hint" style="font-size:15px;line-height:1.35"><b style="color:#70c9ff">ZAFIRO:</b> jugadores 1 y 2 · <b style="color:#ffb86a">ÁMBAR:</b> jugadores 3 y 4. Vos jugás en <b>' + mine + '</b>. Todos arrancan en nivel 3 y sin equipo; los lugares libres los ocupan bots (en línea hoy son 2 contra 2).</div>';
}
