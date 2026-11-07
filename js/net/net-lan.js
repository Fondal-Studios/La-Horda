"use strict";
/* ============================================================
   js/net/net-lan.js
   JUGAR EN RED LOCAL: cooperativo por el WiFi de la casa, sin internet ni cuentas.
   Docs: docs/beta-release/MULTIJUGADOR_LOCAL.md. Servidor: tools/lan/host.js (relay en modo LA_HORDA_LAN=1 + juego estático).

   Cómo encaja (se reutiliza TODO el cooperativo B1: sala, lobby, sincronización de net-game.js):
   - La anfitriona corre `npm run lan` y sirve el juego con window.__HORDA_LAN__ = true. En esa página, net-core.js
     (netLanPage) usa el relay del MISMO origen y js/net/account.js no se conecta a ninguna cuenta.
   - MODOS Y MULTIJUGADOR → «Jugar en red local»: pantalla de dos pasos. «Crear sala local» (Campaña u Horda Infinita:
     los dos modos de la beta) y «Unirme a sala local» (lista de salas de la red, código o enlace). Quien abre la
     dirección de la anfitriona entra directo a esta pantalla.
   - La sala local se lista sola para la red (net-lobby.js: netPublicPref) y la Sala muestra el QR con el enlace.
   - SIN PROGRESO: al entrar a la red local el juego trabaja sobre una COPIA del guardado (lanEnter) y persistNow no escribe
     (lanNoPersist, js/storage/save.js): no se toca economía, ranking, Brasas ni el guardado real; no se sube nada. Al volver
     al menú se descarta la copia (lanLeave). En red local todas las arenas están abiertas (solo en la copia).
   - UNA SOLA CÁMARA: la pantalla de la anfitriona es la vista común (hasta 4 jugadores). Mientras dura una partida local, una capa
     PROPIA (lanCamStep, abajo) encuadra a los héroes vivos con un zoom alejado, sin modificar js/rendering/camera.js: se engancha
     a updateArenaCameraZoom() y usa CAM_SUBJECT/CAM_ZOOM, que ya existen. Los invitados calculan el mismo encuadre con los mismos
     datos de la partida, así que todas las pantallas muestran lo mismo; su mando (joystick y botones) no se toca.
   Fuera de una página servida por la anfitriona, la entrada solo explica cómo empezar y no cambia nada del juego.
   ============================================================ */
const LAN = { info:null, infoAt:0, sandbox:false, snap:null, wantCreate:false, autoOpened:false, roomsAt:-1e9, roomsBusy:false };
window.__lan = LAN;

function lanOn(){ return typeof netLanPage==="function" && netLanPage(); }
function lanNoPersist(){ return LAN.sandbox; }
function _lanEsc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])); }

/* ---------------- direcciones para los invitados ---------------- */
async function lanLoadInfo(){
  if(!lanOn()) return null;
  try{
    const r = await fetch("/lan.json", {cache:"no-store"});
    if(r.ok){ const j = await r.json(); if(j && j.lan) { LAN.info = j; LAN.infoAt = performance.now(); } }
  }catch(e){}
  return LAN.info;
}
// Dirección base que se le da a los demás: desde "localhost" la compu no sirve de nada para el celular, así que se usa la IP de la red.
function lanBase(){
  const loop = /^(localhost|127\.|\[::1\]|::1$)/i.test(location.hostname);
  if(loop && LAN.info && LAN.info.primary) return LAN.info.primary;
  return location.origin + "/";
}
function lanHasShareableAddress(){ return !/^(localhost|127\.|\[::1\]|::1$)/i.test(new URL(lanBase()).hostname); }
function lanInviteUrl(code){ return lanBase() + (code ? "?room=" + encodeURIComponent(code) : ""); }
// QR + enlace en la Sala de la anfitriona (net-lobby.js, rama "host").
function lanBarHTML(){
  if(!lanOn() || !net.code) return "";
  const url = lanInviteUrl(net.code);
  let svg = "";
  try{ if(typeof LanQR!=="undefined") svg = LanQR.svg(url, {scale:4}); }catch(e){}
  const warn = lanHasShareableAddress() ? "" : `<div class="lan-warn">No encontré la dirección de esta compu en la red: conectala al WiFi y recargá, o pasales la IP a mano.</div>`;
  return `<div class="lan-share" id="lan-share">${svg ? `<div class="lan-qr">${svg}</div>` : ""}
    <div class="lan-share-txt"><b>📡 Que se sumen desde el celular o la compu (misma WiFi):</b>
      <div>Escaneá el QR con la cámara o abrí esta dirección en el navegador:</div><code>${_lanEsc(url)}</code>
      <div>También sirve entrar a la dirección de la anfitriona y escribir el código:</div><b>${_lanEsc(net.code)}</b>${warn}</div></div>`;
}
// "Crear sala local": al llegar a la Sala (ya con modo, arena y guardián elegidos) la sala se arma sola.
function lanAfterBar(){
  if(!LAN.wantCreate || !lanOn() || netInRoom()) return;
  const c = document.getElementById("net-create-btn");
  if(c && !c.disabled){ LAN.wantCreate = false; setTimeout(()=>{ if(c.isConnected && !c.disabled) c.click(); }, 0); }
}

/* ---------------- sin progreso: copia del guardado ---------------- */
function lanEnter(){
  if(!lanOn() || LAN.sandbox) return;
  try{ if(typeof persistNow==="function") persistNow(); }catch(e){}   // el progreso real se guarda ANTES de usar la copia
  let copy; try{ copy = JSON.parse(JSON.stringify(save)); }catch(e){ return; }
  LAN.snap = save; save = copy; LAN.sandbox = true;
  // todas las arenas abiertas y la Horda Infinita disponible, solo en la copia
  const cl = save.arenasCleared = Object.assign({}, save.arenasCleared);
  if(typeof ARENA_ORDER!=="undefined") ARENA_ORDER.slice(0, -1).forEach(k=>{ cl[k] = true; });
  if(typeof invalidatePassiveCache==="function") invalidatePassiveCache();
  document.body.classList.add("lan-session");
}
function lanLeave(){
  if(!LAN.sandbox) return;
  if(typeof netMatch!=="undefined" && netMatch) return;
  if(typeof netInRoom==="function" && netInRoom()) return;
  LAN.sandbox = false; LAN.wantCreate = false;
  if(LAN.snap){ save = LAN.snap; LAN.snap = null; }
  if(typeof invalidatePassiveCache==="function") invalidatePassiveCache();
  document.body.classList.remove("lan-session");
}
// Cualquier sala (crear, unirse, JUGAR YA) en una página de red local trabaja sobre la copia.
(function lanWrapNet(){
  if(typeof netCreateRoom==="function"){ const f = netCreateRoom; netCreateRoom = function(){ lanEnter(); return f.apply(this, arguments); }; }
  if(typeof netJoinRoom==="function"){ const f = netJoinRoom; netJoinRoom = function(){ lanEnter(); return f.apply(this, arguments); }; }
  if(typeof setState==="function"){
    const f = setState;
    setState = function(s){
      const r = f.apply(this, arguments);
      if(s==="mainmenu" || s==="title") lanLeave();
      if(s==="mainmenu" && lanOn() && !LAN.autoOpened && !netLobby.pendingJoin){ LAN.autoOpened = true; setTimeout(()=>{ if(state==="mainmenu") lanOpen(); }, 0); }
      return r;
    };
  }
})();

/* ---------------- pantalla ---------------- */
function lanEl(id){ return document.getElementById(id); }
async function lanOpen(){
  const on = lanOn();
  if(on) lanEnter();
  lanEl("lan-on").classList.toggle("hidden", !on);
  lanEl("lan-off").classList.toggle("hidden", on);
  if(on){
    const nm = lanEl("lan-join-name"); if(nm && document.activeElement!==nm) nm.value = netPlayerName()==="Jugador" ? "" : netPlayerName();
    lanSetStatus("lan-join-status", ""); lanSetStatus("lan-create-status", "");
    if(typeof ensureOwnedSelection==="function") ensureOwnedSelection();
  }
  setState("lan");
  if(on){ await lanLoadInfo(); lanRefreshRooms(true); }
}
function lanSetStatus(id, text, isErr){ const el = lanEl(id); if(!el) return; el.textContent = text || ""; el.classList.toggle("ok", !!text && !isErr); }
async function lanRefreshRooms(force){
  if(!lanOn() || LAN.roomsBusy) return;
  const box = lanEl("lan-rooms-list"), st = lanEl("lan-rooms-status"); if(!box) return;
  const now = performance.now(); if(!force && now - LAN.roomsAt < 4500) return;
  LAN.roomsAt = now; LAN.roomsBusy = true;
  try{
    const list = await netFetchRooms();
    if(list===null) { if(st) st.textContent = "No se pudo consultar el servidor de esta red."; return; }
    box.innerHTML = list.map(r=>_roomRowHTML(r)).join("");
    if(st) st.textContent = list.length ? "" : "Todavía no hay salas en esta red. Pedile el código a la anfitriona.";
  }finally{ LAN.roomsBusy = false; }
}
function lanCreate(mode){
  if(!lanOn()) return;
  lanEnter();
  const nm = lanEl("lan-join-name"); if(nm && nm.value.trim()) netSetPlayerName(nm.value);
  if(typeof ensureOwnedSelection==="function") ensureOwnedSelection();
  LAN.wantCreate = true;
  const startCreate = ()=>{
    if(mode==="endless"){
      if(typeof endlessOpen==="function" && !window.endlessOpen()){ LAN.wantCreate = false; lanSetStatus("lan-create-status", "La Horda Infinita no está disponible.", true); }
    } else { setState("arenaselect"); if(typeof renderArenaGrid==="function") renderArenaGrid(); }
  };
  // campaña: un perfil nuevo elige primero su guardián de regalo
  if(typeof needsStarterChampion==="function" && needsStarterChampion()){ openStarterSelect(()=>{ setState("lan"); startCreate(); }, {joinsRoom:true}); return; }
  startCreate();
}
function lanJoin(raw){
  if(!lanOn()) return;
  const nm = lanEl("lan-join-name"); if(nm) netSetPlayerName(nm.value);
  const pre = netValidateCode(raw);
  if(pre.err){ lanSetStatus("lan-join-status", pre.err, true); return; }
  lanEl("lan-join-code").value = pre.code;
  const btn = lanEl("lan-join-btn");
  const go = ()=>netJoinWithCode(pre.code, btn, "UNIRSE");
  if(typeof needsStarterChampion==="function" && needsStarterChampion()){ openStarterSelect(()=>{ setState("lan"); go(); }, {joinsRoom:true}); return; }
  go();
}
(function lanSetup(){
  if(typeof screens!=="undefined" && !screens.lan) screens.lan = lanEl("lan-screen");
  const bind = (id, fn)=>{ const e = lanEl(id); if(e) e.addEventListener("click", fn); };
  bind("mode-lan-btn", ()=>lanOpen());
  bind("lan-back-btn", ()=>{ setState("modeselect"); });
  bind("lan-create-campaign", ()=>lanCreate("campaign"));
  bind("lan-create-endless", ()=>lanCreate("endless"));
  bind("lan-join-btn", ()=>lanJoin(lanEl("lan-join-code").value));
  bind("lan-join-paste", async ()=>{
    const inp = lanEl("lan-join-code");
    try{ const t = await navigator.clipboard.readText(); if(t){ const v = netValidateCode(t); inp.value = v.code || t.trim(); } }
    catch(e){ inp.focus(); showNetToast("Mantené apretado el cuadro y elegí Pegar."); }
  });
  const code = lanEl("lan-join-code");
  if(code){
    code.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); lanJoin(code.value); } });
    code.addEventListener("input", ()=>lanSetStatus("lan-join-status", ""));
  }
  const nm = lanEl("lan-join-name"); if(nm) nm.addEventListener("change", ()=>netSetPlayerName(nm.value));
  const list = lanEl("lan-rooms-list");
  if(list) list.addEventListener("click", e=>{
    const b = e.target.closest("[data-room-join]"); if(!b || b.disabled) return;
    const hid = lanEl("mode-join-name"); if(hid && nm) hid.value = nm.value;   // netJoinPublicRoom lee el nombre de ese campo
    netJoinPublicRoom(b.getAttribute("data-room-join"), b);
  });
  setInterval(()=>{ if(typeof state!=="undefined" && state==="lan" && !document.hidden) lanRefreshRooms(false); }, 2000);
  if(lanOn()) document.body.classList.add("lan-page");
})();

/* ---------------- cámara única y alejada ---------------- */
const LAN_MAX_PLAYERS = 4;                       // tope duro de la sala local (el servidor lo hace cumplir: MAX_HUMANS)
const LANCAM = { on:false, subj:{x:0, y:0}, z:0, lastFit:null };
if(lanOn() && typeof NET_ERRORS!=="undefined") NET_ERRORS.ROOM_FULL = "SALA COMPLETA: en red local juegan 4 como máximo (la anfitriona y 3 más).";
function lanCamActive(){
  return lanOn() && typeof netMatch!=="undefined" && !!netMatch && state==="playing" && typeof heroes!=="undefined" && heroes.length > 1 && !!player;
}
// Zoom que mete a todos en pantalla (con aire), nunca más cerca que el normal y nunca más lejos que la arena entera.
function lanCamFit(list){
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for(const h of list){ x0 = Math.min(x0, h.x); x1 = Math.max(x1, h.x); y0 = Math.min(y0, h.y); y1 = Math.max(y1, h.y); }
  const PAD = 190, normal = computeCamZoom(VW, VH);
  const need = Math.min((VW * 0.92) / ((x1 - x0) + PAD * 2), (VH * 0.78) / ((y1 - y0) + PAD * 2));
  const farthest = Math.min(VW, VH) * 0.8 / (ARENA_RADIUS * 2 + 200);       // la arena completa
  const z = Math.max(farthest, Math.min(normal * 0.72, need));              // "alejada" por defecto (72 % del zoom normal)
  return { z, cx:(x0 + x1) / 2, cy:(y0 + y1) / 2 };
}
(function lanWrapCamera(){
  if(typeof updateArenaCameraZoom!=="function") return;
  const orig = updateArenaCameraZoom;
  updateArenaCameraZoom = function(){
    orig.apply(this, arguments);
    if(state==="paused") return;
    if(!lanCamActive()){
      if(LANCAM.on){ LANCAM.on = false; if(CAM_SUBJECT===LANCAM.subj) CAM_SUBJECT = null; }   // camera.js vuelve solo al zoom normal (_arenaZoomActive)
      return;
    }
    const live = heroes.filter(h=>h && h.alive!==false && Number.isFinite(h.x) && Number.isFinite(h.y));
    const f = lanCamFit(live.length ? live : [player]);
    LANCAM.lastFit = f;
    if(!LANCAM.on){ LANCAM.on = true; LANCAM.z = CAM_ZOOM; LANCAM.subj.x = f.cx; LANCAM.subj.y = f.cy; }
    LANCAM.z += (f.z - LANCAM.z) * 0.1;
    LANCAM.subj.x += (f.cx - LANCAM.subj.x) * 0.18; LANCAM.subj.y += (f.cy - LANCAM.subj.y) * 0.18;
    CAM_SUBJECT = LANCAM.subj; CAM_ZOOM = LANCAM.z; CAM_Y_ANCHOR = camFitAnchor(VW, VH, CAM_ZOOM);
    _arenaZoomActive = true;                      // al terminar, camera.js recupera el zoom normal con su propio suavizado
  };
})();
