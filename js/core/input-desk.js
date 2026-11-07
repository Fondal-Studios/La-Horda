"use strict";
/* ============================================================
   js/core/input-desk.js
   Controles de ESCRITORIO y de MANDO, más las guías de primera vez de los controles.
   Todo termina en las mismas variables/funciones que usan los controles táctiles (joyVec,
   basicHeld, useSkill, useUltimate...), así que el cooperativo y la simulación no cambian.

   ESQUEMA CLÁSICO (Opciones > Controles)   MANDO (Gamepad API: "standard" y mandos sin mapeo)
   - WASD / flechas: moverse                - stick izquierdo / cruceta: moverse
   - Espacio o J (o clic izquierdo          - A: atacar (mantener)
     sobre el mapa): atacar                 - X / Y / B: habilidades 1 / 2 / 3
   - 1 / 2 / 3: habilidades                 - RB o RT: Definitiva
     (apuntan al mouse sobre el mapa;       - LB: curación de emergencia
     si no, al mejor objetivo)              - LT: revivir / acción (mantener)
   - R o 4: Definitiva                      - R3 (apretar el stick derecho): Pacto (Nigromante)
   - Q: curación · E: revivir/acción        - stick derecho: apuntar las habilidades
   - F: Pacto (Nigromante)                  - Start / Select: pausa y continuar
   - Esc o P: pausa y continuar             - En menús: cruceta/stick mueven el foco, A confirma, B vuelve,
                                              LB/RB cambian de pestaña (js/core/pad-nav.js)
   ESQUEMA MOBA / tipo LoL
   - clic DERECHO sobre el mapa: ir hacia ese punto (marcador en el piso; respeta paredes y arena); flechas también mueven
   - clic izquierdo: atacar · Espacio / J / A: atacar
   - Q / W / E: habilidades 1 / 2 / 3 · R: Definitiva · D: curación · F: revivir / acción / Pacto
   Las teclas se pueden reasignar (Opciones > Controles > Ver controles: js/core/controls-panel.js).
   Las teclas se muestran en los botones apenas se usa el teclado (o si el aparato tiene mouse y no
   pantalla táctil); con mando, las letras del mando.
   ============================================================ */
const DESK = { codes:new Set(), kbVec:{x:0,y:0}, gpVec:{x:0,y:0}, ctmVec:{x:0,y:0}, drove:false,
  mouse:{x:0, y:0, on:false}, mouseBasic:false, kbBasic:false, gpBasic:false, kbCtx:false,
  sylvaSrc:null, gp:{prev:{}, aim:null, on:false, ctx:false, id:"", profile:"", seen:""}, device:null,
  ctm:{on:false, x:0, y:0, hold:null, snapT:0, snapX:0, snapY:0} };
const KB_ARROWS = { ArrowUp:[0,-1], ArrowLeft:[-1,0], ArrowDown:[0,1], ArrowRight:[1,0] };
const KB_WASD = { KeyW:[0,-1], KeyA:[-1,0], KeyS:[0,1], KeyD:[1,0] };
// Esquemas de teclado. "move": teclas de movimiento; "binds": acción -> teclas (la primera es la que se muestra en el botón).
const KB_SCHEMES = {
  classic:{ move:Object.assign({}, KB_WASD, KB_ARROWS),
    binds:{ basic:["Space","KeyJ"], s1:["Digit1","Numpad1"], s2:["Digit2","Numpad2"], s3:["Digit3","Numpad3"], ult:["KeyR","Digit4","Numpad4"], emerg:["KeyQ"], ctx:["KeyE"], pact:["KeyF"] } },
  moba:{ move:Object.assign({}, KB_ARROWS),
    binds:{ basic:["Space","KeyJ","KeyA"], s1:["KeyQ"], s2:["KeyW"], s3:["KeyE"], ult:["KeyR"], emerg:["KeyD"], ctx:["KeyF"], pact:["KeyF"] } }
};
// acciones que se pueden reasignar, en el orden en que se listan (en MOBA "pact" sigue a "ctx": una sola tecla F para revivir / acción / Pacto)
const KB_ACTIONS = ["basic","s1","s2","s3","ult","emerg","ctx","pact"];
const KB_RESERVED = new Set(["Escape","KeyP","Tab","Enter","NumpadEnter","MetaLeft","MetaRight","ContextMenu"]);
const ACT_BTN = { basic:"btn-basic", s1:"btn-s1", s2:"btn-s2", s3:"btn-s3", ult:"btn-ult", emerg:"btn-emerg", ctx:"btn-revive", pact:"btn-pact" };
const ACT_SKILL = { s1:0, s2:1, s3:2 };
function deskScheme(){ return (typeof PREFS!=="undefined" && PREFS.ctlScheme==="moba") ? "moba" : "classic"; }
function deskMoveKeys(){ return KB_SCHEMES[deskScheme()].move; }
// teclas de una acción en el esquema activo (con lo reasignado en Opciones)
function deskActionCodes(act, scheme){
  scheme = scheme || deskScheme();
  const ov = typeof PREFS!=="undefined" && PREFS.keyBinds && PREFS.keyBinds[scheme];
  const base = KB_SCHEMES[scheme].binds;
  if(scheme==="moba" && act==="pact") act = "ctx"; // MOBA: Pacto comparte tecla con revivir/acción
  if(ov && ov[act]) return [ov[act]];
  return base[act].slice();
}
let _deskActMap = null;
function deskBindsInvalidate(){ _deskActMap = null; }
function _deskBuildActMap(){
  const m = new Map(), sc = deskScheme();
  for(const act of KB_ACTIONS){ for(const c of deskActionCodes(act, sc)){ const l = m.get(c) || []; if(!l.includes(act)) l.push(act); m.set(c, l); } }
  _deskActMap = m; return m;
}
// acciones de una tecla (por posición física, ev.code: así Q W E R valen igual en cualquier distribución)
function deskKeyActs(code){ return (_deskActMap || _deskBuildActMap()).get(code) || []; }
// botón de pantalla (id) al que corresponde una tecla del esquema activo: lo usan hud-feedback.js y beta-ui.js para el efecto de pulsación
function deskBtnForCode(code){ const a = deskKeyActs(code); return a.length ? ACT_BTN[a[0]] : ""; }
// rótulo corto de una tecla para mostrar en pantalla
function deskKeyLabel(code){
  if(!code) return "—";
  let m;
  if((m = /^Key([A-Z])$/.exec(code))) return m[1];
  if((m = /^Digit(\d)$/.exec(code))) return m[1];
  if((m = /^Numpad(\d)$/.exec(code))) return "Num"+m[1];
  const t = { Space:"Espacio", ArrowUp:"↑", ArrowDown:"↓", ArrowLeft:"←", ArrowRight:"→", Escape:"Esc", ShiftLeft:"Shift", ShiftRight:"Shift", ControlLeft:"Ctrl", ControlRight:"Ctrl",
    AltLeft:"Alt", AltRight:"Alt", Backquote:"`", Minus:"-", Equal:"=", Comma:",", Period:".", Slash:"/", Semicolon:";", Quote:"'", BracketLeft:"[", BracketRight:"]", Backslash:"\\", CapsLock:"Bloq", Backspace:"Borrar" };
  return t[code] || code;
}
// primera tecla de una acción, como rótulo
function deskActionLabel(act){ return deskKeyLabel(deskActionCodes(act)[0]); }
const SKILL_BTN_IDS = ["btn-s1","btn-s2","btn-s3"];

function _deskTyping(ev){
  const t = ev && ev.target; if(!t) return false;
  const tag = t.tagName;
  return tag==="INPUT" || tag==="TEXTAREA" || tag==="SELECT" || !!t.isContentEditable;
}
// pantallas encima de la partida que manejan su propio Esc/Enter (Hechicero, historia, campamento)
function _deskOverlayOpen(){
  try{
    if(typeof RUN_INTRO!=="undefined" && RUN_INTRO.open) return true;
    if(typeof STORY_CINE!=="undefined" && STORY_CINE.open) return true;
    if(typeof CAMP!=="undefined" && CAMP.open) return true;
  }catch(e){}
  return false;
}
function _deskOptionsOpen(){ const o = document.getElementById("hub-options"); return !!(o && !o.classList.contains("hidden")); }
// Qué se usó por última vez: cambia las teclas que se muestran en los botones y el texto de la guía.
function deskSetDevice(d){
  if(DESK.device===d) return;
  DESK.device = d;
  if(d!=="pad" && typeof padNavHide==="function") padNavHide(); // el foco del mando solo se ve con el mando en la mano
  const b = document.body; if(!b) return;
  b.classList.toggle("inp-kb", d==="kb");
  b.classList.toggle("inp-pad", d==="pad");
}
// Aparato con mouse y sin pantalla táctil: las teclas se ven desde el principio.
(function(){
  try{
    const fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    const touch = ("ontouchstart" in window) || (navigator.maxTouchPoints||0) > 0;
    // (un viewport apaisado de teléfono, <=500 px de alto, no se trata como teclado hasta que se aprieta una tecla: sin Esc/Espacio/R sobre los botones)
    const phoneSized = Math.min(innerWidth||0, innerHeight||0) <= 500;
    const set = ()=>{ if(fine && !touch && !phoneSized) deskSetDevice("kb"); };
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", set); else set();
  }catch(e){}
})();
// un toque en la pantalla vuelve a los textos táctiles
window.addEventListener("pointerdown", (e)=>{ if(e.pointerType==="touch") deskSetDevice("touch"); }, {capture:true, passive:true});

/* ---------------- movimiento (teclado + mando) ---------------- */
function _deskKbVec(){
  let x = 0, y = 0;
  const mk = deskMoveKeys();
  for(const c of DESK.codes){ const v = mk[c]; if(v){ x += v[0]; y += v[1]; } }
  const l = Math.hypot(x, y);
  DESK.kbVec = l ? {x:x/l, y:y/l} : {x:0, y:0};
}
// El joystick táctil manda; si no se está usando, teclado + mando escriben joyVec.
function deskApplyMove(){
  if(typeof joyActive!=="undefined" && joyActive) { DESK.drove = false; return; }
  let x = DESK.kbVec.x + DESK.gpVec.x + DESK.ctmVec.x, y = DESK.kbVec.y + DESK.gpVec.y + DESK.ctmVec.y;
  const l = Math.hypot(x, y);
  if(l > 0.01){ if(l > 1){ x /= l; y /= l; } joyVec = {x, y}; DESK.drove = true; }
  else if(DESK.drove){ joyVec = {x:0, y:0}; DESK.drove = false; }
}
function _deskBasicSync(){ basicHeld = DESK.kbBasic || DESK.mouseBasic || DESK.gpBasic || (typeof basicPtr!=="undefined" && basicPtr!==null && (typeof atkMode!=="function" || atkMode()!=="toggle")) || (typeof basicLatch!=="undefined" && basicLatch); }

/* ---------------- apuntado con mouse / stick derecho ---------------- */
function _deskMouseWorld(){
  if(!DESK.mouse.on || !player || typeof CAM_ZOOM==="undefined") return null;
  const r = canvas.getBoundingClientRect();
  const sx = DESK.mouse.x - r.left, sy = DESK.mouse.y - r.top;
  const x = player.x + CAM_LEAD_X + (sx - VW/2)/CAM_ZOOM;
  const y = player.y - CAM_LIFT + CAM_LEAD_Y + (sy - (VH/2 - CAM_Y_ANCHOR))/CAM_ZOOM;
  return {x, y};
}
// Punto/dirección a mano para la habilidad idx (mismo formato que manualAimWorld de aim.js), o null = automático.
function deskAimWorld(idx){
  if(!player || !player.cls) return null;
  const sk = player.cls.skills[idx];
  const range = (typeof aimRangeOf==="function" ? aimRangeOf(player, sk, idx) : 0) || 300;
  if(DESK.gp.aim){
    const a = DESK.gp.aim;
    return {x:player.x + a.x*range*0.8, y:player.y + a.y*range*0.8, dx:a.x, dy:a.y};
  }
  if(DESK.device==="kb"){
    const m = _deskMouseWorld(); if(!m) return null;
    const dx = m.x - player.x, dy = m.y - player.y, l = Math.hypot(dx, dy);
    if(l < 8) return null;
    return {x:m.x, y:m.y, dx:dx/l, dy:dy/l};
  }
  return null;
}

/* ---------------- habilidades, Definitiva, pausa ---------------- */
function _deskFlash(el){ if(!el) return; el.classList.remove("key-press"); void el.offsetWidth; el.classList.add("key-press"); }
// down=true al apretar la tecla/botón, false al soltarla (solo importa para la carga de Sylva).
function deskSkill(idx, down, src){
  if(!player || !player.cls || state!=="playing") return;
  const el = document.getElementById(SKILL_BTN_IDS[idx]);
  const sk = player.cls.skills[idx]; if(!sk) return;
  const isSylva = player.classKey==="cazadora" && sk.kind==="piercing_shot";
  if(!down){
    if(DESK.sylvaSrc===src+idx){ DESK.sylvaSrc = null; if(el) el.classList.remove("aiming"); sylvaChargeRelease(deskAimWorld(idx)); }
    return;
  }
  if(typeof aimState!=="undefined" && aimState) return; // se está apuntando con el dedo
  if(!_skillReadyFor(idx)){ if(el) _denyFeedback(el, idx); return; }
  _deskFlash(el);
  if(isSylva){ if(sylvaChargeStart()){ DESK.sylvaSrc = src+idx; if(el) el.classList.add("aiming"); } return; }
  const aim = aimProfileOf(sk) ? deskAimWorld(idx) : null;
  const ok = aim ? useSkill(idx, aim) : useSkill(idx);
  if(!ok && el) _denyFeedback(el, idx);
}
function deskUlt(){ if(state==="playing"){ _deskFlash(document.getElementById("btn-ult")); useUltimate(); } }
function deskPact(){
  const b = document.getElementById("btn-pact");
  if(!b || b.classList.contains("hidden") || state!=="playing") return;
  b.dispatchEvent(new PointerEvent("pointerdown", {bubbles:true, cancelable:true}));
}
function deskCtx(on){
  const btn = document.getElementById("btn-revive"); if(!btn) return;
  btn.dispatchEvent(new PointerEvent(on ? "pointerdown" : "pointerup", {bubbles:true}));
}
function deskPauseToggle(){
  if(_deskOptionsOpen()){ if(typeof closeHubOptions==="function") closeHubOptions(); return; }
  const ps = document.getElementById("pause-screen");
  if(state==="playing" && ps && !ps.classList.contains("hidden")){ document.getElementById("resume-btn").click(); return; } // online: menú abierto
  if(state==="playing"){ document.getElementById("pause-btn").click(); return; }
  if(state==="paused"){ document.getElementById("resume-btn").click(); }
}
// Suelta todo lo que el teclado/mando esté manteniendo (lo llama inputResetAll de input.js).
function deskInputReset(){
  DESK.codes.clear(); DESK.kbVec = {x:0,y:0}; DESK.gpVec = {x:0,y:0};
  deskMoveCancel();
  DESK.kbBasic = DESK.mouseBasic = DESK.gpBasic = false;
  if(DESK.kbCtx){ DESK.kbCtx = false; deskCtx(false); }
  if(DESK.drove){ joyVec = {x:0,y:0}; DESK.drove = false; }
  if(DESK.sylvaSrc!==null && player){ player.sylvaCharging = false; player.sylvaChargeTimer = 0; if(typeof netIsGuest==="function" && netIsGuest()) netSendToHost({k:"sylva", on:false, aim:null, cancel:true}); }
  DESK.sylvaSrc = null;
  for(const id of SKILL_BTN_IDS){ const el = document.getElementById(id); if(el && !(typeof aimState!=="undefined" && aimState && aimState.el===el)) el.classList.remove("aiming"); }
  if(DESK.gp.ctx){ DESK.gp.ctx = false; deskCtx(false); }
}

/* ---------------- teclado ---------------- */
// Revivir / acción / levantar botín (mantener) o, si no hay nada para hacer, el Pacto del Nigromante.
function deskCtxOrPact(down, both){
  if(!down){ if(DESK.kbCtx){ DESK.kbCtx = false; deskCtx(false); } return; }
  const rv = document.getElementById("btn-revive");
  if(!both || (rv && rv.classList.contains("ready"))){ DESK.kbCtx = true; deskCtx(true); return; }
  deskPact();
}
function deskKeyDown(c, acts){
  for(const act of acts){
    if(act==="basic"){ DESK.kbBasic = true; _deskBasicSync(); }
    else if(act in ACT_SKILL) deskSkill(ACT_SKILL[act], true, "k");
    else if(act==="ult") deskUlt();
    else if(act==="emerg"){ if(typeof emergPress==="function" && player && state==="playing") emergPress(); }
    else if(act==="ctx"){ deskCtxOrPact(true, acts.includes("pact")); return; }
    else if(act==="pact" && !acts.includes("ctx")) deskPact();
  }
}
function deskKeyUp(c, acts){
  for(const act of acts){
    if(act==="basic"){ DESK.kbBasic = false; _deskBasicSync(); }
    else if(act in ACT_SKILL) deskSkill(ACT_SKILL[act], false, "k");
    else if(act==="ctx") deskCtxOrPact(false);
  }
}
window.addEventListener("keydown", (ev)=>{
  if(_deskTyping(ev)) return;
  if(DESK.rebinding) return; // la pantalla de Controles está esperando una tecla (controls-panel.js)
  const c = ev.code;
  if((c==="Escape" || c==="KeyP") && !ev.repeat){
    // Esc: cierra Opciones si están abiertas; en partida, pausa / continuar
    if(_deskOptionsOpen()){ ev.preventDefault(); if(typeof closeHubOptions==="function") closeHubOptions(); return; }
    if((state==="playing" || state==="paused") && !_deskOverlayOpen()){ ev.preventDefault(); deskPauseToggle(); }
    return;
  }
  if(state!=="playing") return;
  const mv = deskMoveKeys()[c], acts = deskKeyActs(c);
  if(!mv && !acts.length) return;
  // que Espacio/flechas no "aprieten" el último botón que quedó con foco (la pausa, un menú) ni scrolleen
  ev.preventDefault();
  deskSetDevice("kb");
  if(mv){ DESK.codes.add(c); deskMoveCancel(); _deskKbVec(); deskApplyMove(); return; }
  if(ev.repeat) return;
  deskKeyDown(c, acts);
});
window.addEventListener("keyup", (ev)=>{
  const c = ev.code;
  if(DESK.codes.has(c)){ DESK.codes.delete(c); _deskKbVec(); deskApplyMove(); }
  const acts = deskKeyActs(c);
  if(acts.length){ deskKeyUp(c, acts); if(state==="playing" && acts.includes("basic")) ev.preventDefault(); }
});

/* ---------------- mouse sobre el mapa ---------------- */
// Clic derecho (esquema MOBA): ir hacia ese punto. El punto se recorta con las mismas reglas que el movimiento
// (clampToArena + resolveWallCollision: nunca queda fuera de la arena ni dentro de una pared) y el guardián camina
// hacia él con joyVec; si se choca contra algo y deja de avanzar, o apenas se toca otro control de movimiento, se cancela.
const CTM_ARRIVE = 10, CTM_SNAP_MS = 450, CTM_STUCK_PX = 5;
function _deskWorldToClient(wx, wy){
  if(!player || typeof CAM_ZOOM==="undefined") return null;
  const r = canvas.getBoundingClientRect();
  const sx = (wx - player.x - CAM_LEAD_X)*CAM_ZOOM + VW/2;
  const sy = (wy - (player.y - CAM_LIFT + CAM_LEAD_Y))*CAM_ZOOM + (VH/2 - CAM_Y_ANCHOR);
  return {x:r.left + sx, y:r.top + sy};
}
function _ctmMarker(){
  let m = document.getElementById("ctm-marker");
  if(!m){ m = document.createElement("div"); m.id = "ctm-marker"; m.className = "hidden"; m.setAttribute("aria-hidden", "true"); m.innerHTML = "<i></i><b></b>"; document.body.appendChild(m); }
  return m;
}
function deskMoveCancel(){
  const c = DESK.ctm;
  if(!c.on && !DESK.ctmVec.x && !DESK.ctmVec.y) return;
  c.on = false; DESK.ctmVec = {x:0, y:0};
  const m = document.getElementById("ctm-marker"); if(m) m.classList.add("hidden");
  deskApplyMove();
}
// (wx, wy) en el mundo; devuelve false si no hay a dónde ir
function deskMoveTo(wx, wy, ping){
  if(!player || !player.alive || state!=="playing" || (typeof joyActive!=="undefined" && joyActive)) return false;
  const pt = {x:wx, y:wy, radius:player.radius || 18};
  try{ clampToArena(pt); resolveWallCollision(pt); }catch(e){}
  if(!isFinite(pt.x) || !isFinite(pt.y)) return false;
  const c = DESK.ctm, wasOn = c.on;
  c.on = true; c.x = pt.x; c.y = pt.y; c.snapT = performance.now(); c.snapX = player.x; c.snapY = player.y;
  const m = _ctmMarker(); m.classList.remove("hidden");
  if(ping || !wasOn){ m.classList.remove("ping"); void m.offsetWidth; m.classList.add("ping"); }
  return true;
}
function deskMoveToMouse(ping){ const w = _deskMouseWorld(); return w ? deskMoveTo(w.x, w.y, ping) : false; }
// una vez por cuadro (lo llama el bucle del mando)
function deskCtmTick(){
  const c = DESK.ctm; if(!c.on) return;
  const m = document.getElementById("ctm-marker");
  if(state!=="playing" || !player || !player.alive || (typeof joyActive!=="undefined" && joyActive) || deskScheme()!=="moba"){ deskMoveCancel(); return; }
  if(c.hold!==null && DESK.mouse.on){ const w = _deskMouseWorld(); if(w){ const pt = {x:w.x, y:w.y, radius:player.radius||18}; try{ clampToArena(pt); resolveWallCollision(pt); }catch(e){} c.x = pt.x; c.y = pt.y; } }
  const dx = c.x - player.x, dy = c.y - player.y, d = Math.hypot(dx, dy);
  if(d <= CTM_ARRIVE && c.hold===null){ deskMoveCancel(); return; }
  if(d > CTM_ARRIVE){
    const k = d < 28 ? Math.max(0.5, d/28) : 1;
    DESK.ctmVec = {x:dx/d*k, y:dy/d*k};
  } else DESK.ctmVec = {x:0, y:0};
  const t = performance.now();
  if(t - c.snapT > CTM_SNAP_MS){
    const moved = Math.hypot(player.x - c.snapX, player.y - c.snapY);
    const frozen = (player.stunTimer>0) || player.fused || (player.slowAmt||0) > 0.75;
    if(!frozen && moved < CTM_STUCK_PX && d > CTM_ARRIVE && c.hold===null){ deskMoveCancel(); return; } // pared: no insistir
    c.snapT = t; c.snapX = player.x; c.snapY = player.y;
  }
  deskApplyMove();
  if(m){ const p = _deskWorldToClient(c.x, c.y); if(p){ m.style.left = p.x + "px"; m.style.top = p.y + "px"; } }
}
(function(){
  const cv = document.getElementById("game"); if(!cv) return;
  // el mouse se sigue en TODA la ventana: las zonas del joystick y de los botones cubren media pantalla
  // cada una y, mirando solo el canvas, apuntar hacia abajo a la derecha no funcionaba
  window.addEventListener("pointermove", (e)=>{ if(e.pointerType==="mouse"){ DESK.mouse.x = e.clientX; DESK.mouse.y = e.clientY; DESK.mouse.on = true; if(typeof padNavMouseMoved==="function") padNavMouseMoved(e); } }, {passive:true});
  document.documentElement.addEventListener("mouseleave", ()=>{ DESK.mouse.on = false; });
  const sz = document.getElementById("skillzone"), jz = document.getElementById("joyzone"), ctl = document.getElementById("controls");
  const down = (e, host)=>{
    if(e.pointerType!=="mouse" || e.button!==0 || state!=="playing" || e.target!==host) return;
    DESK.mouse.x = e.clientX; DESK.mouse.y = e.clientY; DESK.mouse.on = true;
    DESK.mouseBasic = true; _deskBasicSync();
    try{ host.setPointerCapture(e.pointerId); }catch(_){}
  };
  const up = (e)=>{ if(e.pointerType==="mouse" && DESK.mouseBasic){ DESK.mouseBasic = false; _deskBasicSync(); } };
  // clic en el mapa = atacar; también en el hueco de la zona de botones (que tapa el mapa abajo a la derecha)
  for(const host of [cv, sz]){
    if(!host) continue;
    host.addEventListener("pointerdown", e=> down(e, host));
    host.addEventListener("pointerup", up); host.addEventListener("pointercancel", up); host.addEventListener("lostpointercapture", up);
  }
  cv.addEventListener("contextmenu", (e)=> e.preventDefault());
  // Esquema MOBA: el mouse manda sobre TODA la zona de juego (mapa + zonas táctiles transparentes, que en escritorio tapan
  // media pantalla cada una): clic derecho = moverse hacia el punto, clic izquierdo = atacar. Se atiende en captura y no
  // se deja pasar al joystick táctil, que queda intacto para el teléfono.
  const isField = t => t===cv || t===sz || t===jz || t===ctl || (t && t.id==="hud");
  window.addEventListener("pointerdown", (e)=>{
    if(e.pointerType!=="mouse" || state!=="playing" || !isField(e.target) || deskScheme()!=="moba") return;
    if(typeof padNavMouseMoved==="function") padNavMouseMoved(e, true);
    DESK.mouse.x = e.clientX; DESK.mouse.y = e.clientY; DESK.mouse.on = true;
    deskSetDevice("kb");
    if(e.button===2){
      e.preventDefault(); e.stopImmediatePropagation();
      DESK.ctm.hold = e.pointerId; deskMoveToMouse(true);
    } else if(e.button===0){
      e.stopImmediatePropagation();
      DESK.mouseBasic = true; _deskBasicSync();
    }
  }, true);
  const mobaUp = (e)=>{
    if(e.pointerType!=="mouse") return;
    if(e.button===2 && DESK.ctm.hold!==null){ DESK.ctm.hold = null; const c = DESK.ctm; if(c.on && Math.hypot(c.x-player.x, c.y-player.y) <= CTM_ARRIVE) deskMoveCancel(); }
    if(e.button===0 && DESK.mouseBasic){ DESK.mouseBasic = false; _deskBasicSync(); }
  };
  window.addEventListener("pointerup", mobaUp, true); window.addEventListener("pointercancel", mobaUp, true);
  // el menú del navegador no aparece al hacer clic derecho sobre el juego (mapa o zonas táctiles)
  window.addEventListener("contextmenu", (e)=>{ if(state==="playing" && isField(e.target)) e.preventDefault(); }, true);
  // después de tocar un botón con el mouse (pausa, continuar) el foco no se queda en él: si no, Espacio lo volvía a apretar
  document.addEventListener("click", (e)=>{
    const b = e.target && e.target.closest && e.target.closest("#pause-btn, #mute-btn, #resume-btn, .skill-plus");
    if(b && typeof b.blur==="function") setTimeout(()=>{ try{ b.blur(); }catch(_){} }, 0);
  }, true);
})();

/* ---------------- mando (Gamepad API) ----------------
   Mandos "standard" (Xbox, y los que el navegador ya mapea: DualShock/DualSense, Switch Pro...) y un respaldo para los
   SIN mapeo (mapping ""): genéricos USB/HID y PlayStation crudos. Cada perfil traduce botones y ejes a nombres lógicos
   (A B X Y LB RB LT RT BACK START L3 R3 UP DOWN LEFT RIGHT + sticks); lo demás del juego solo conoce esos nombres. */
const GP_DEAD = 0.24, GP_NAV = 0.55;
const GP_NAMES = ["A","B","X","Y","LB","RB","LT","RT","BACK","START","L3","R3","UP","DOWN","LEFT","RIGHT"];
const GP_PROFILES = {
  standard:{ label:"Estándar", btn:{A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,BACK:8,START:9,L3:10,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15}, left:[0,1], right:[2,3] },
  // mandos de PlayStation sin mapeo (Firefox/Windows y varios HID): cuadrado 0, cruz 1, círculo 2, triángulo 3; palanca de dirección en el eje 9
  ps:{ label:"PlayStation", btn:{A:1,B:2,X:0,Y:3,LB:4,RB:5,LT:6,RT:7,BACK:8,START:9,L3:10,R3:11}, left:[0,1], right:[2,5], trig:[3,4], hat:9 },
  // genéricos sin mapeo (estilo xpad/HID): A 0, B 1, X 2, Y 3...; stick derecho en 2-3 (4 ejes) o 3-4 (6 o más), gatillos analógicos en 2 y 5
  generic:{ label:"Genérico", btn:{A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,BACK:8,START:9,L3:10,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15}, left:[0,1], right:null, hat:9 }
};
function gpProfileOf(g){
  if(g.mapping==="standard") return "standard";
  if(/054c|sony|playstation|dualshock|dualsense|wireless controller|ps[345] /i.test(g.id||"")) return "ps";
  return "generic";
}
function _gpPad(){
  if(typeof navigator==="undefined" || typeof navigator.getGamepads!=="function") return null;
  let list; try{ list = navigator.getGamepads(); }catch(e){ return null; }
  if(!list) return null;
  for(const g of list) if(g && g.connected!==false && g.buttons && g.buttons.length) return g;
  return null;
}
function _gpBtn(g, i){ const b = g.buttons[i]; return !!(b && (b.pressed || (typeof b.value==="number" && b.value > 0.5))); }
// zona muerta circular con reescalado: un mando gastado no "camina solo" y el recorrido útil sigue siendo completo
function _gpStick(x, y, dz){
  x = x||0; y = y||0; const l = Math.hypot(x, y);
  if(l < dz) return {x:0, y:0, l:0};
  const k = Math.min(1, (l - dz)/(1 - dz))/l;
  return {x:x*k, y:y*k, l:Math.min(1, (l - dz)/(1 - dz))};
}
// Lee el mando con su perfil: {b:{A:bool,...}, lx, ly, rx, ry, profile}
function gpRead(g){
  const pf = gpProfileOf(g), P = GP_PROFILES[pf], ax = g.axes || [], b = {};
  for(const n of GP_NAMES){ const i = P.btn[n]; b[n] = i!==undefined ? _gpBtn(g, i) : false; }
  if(pf!=="standard"){
    // cruceta como palanca de dirección (eje 9: -1 arriba, pasos de 2/7, ~1.29 en reposo) o como dos ejes (6 y 7)
    if(ax.length >= 10 && P.hat!==undefined && typeof ax[P.hat]==="number" && ax[P.hat] <= 1.05){
      const idx = Math.round((ax[P.hat] + 1)*3.5);
      const dirs = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]][idx];
      if(dirs){ b.LEFT = b.LEFT || dirs[0] < 0; b.RIGHT = b.RIGHT || dirs[0] > 0; b.UP = b.UP || dirs[1] < 0; b.DOWN = b.DOWN || dirs[1] > 0; }
    } else if(ax.length === 8){
      const hx = ax[6]||0, hy = ax[7]||0;
      { b.LEFT = b.LEFT || hx < -0.5; b.RIGHT = b.RIGHT || hx > 0.5; b.UP = b.UP || hy < -0.5; b.DOWN = b.DOWN || hy > 0.5; }
    }
    // gatillos solo analógicos (sin botón 6/7): ejes de reposo -1
    const tr = P.trig || (ax.length >= 6 ? [2,5] : null);
    if(tr && g.buttons.length < 8){ b.LT = b.LT || (ax[tr[0]]||-1) > 0; b.RT = b.RT || (ax[tr[1]]||-1) > 0; }
  }
  const L = P.left, R = P.right || (ax.length >= 6 ? [3,4] : [2,3]);
  const ls = _gpStick(ax[L[0]], ax[L[1]], GP_DEAD), rs = _gpStick(ax[R[0]], ax[R[1]], GP_DEAD*1.3);
  return {b, lx:ls.x, ly:ls.y, ll:ls.l, rx:rs.x, ry:rs.y, rl:rs.l, profile:pf, id:g.id||""};
}
let _gpToastedId = "";
function _gpToast(text){
  try{ if(typeof showNetToast==="function") showNetToast(text); }catch(e){}
}
function deskPadConnected(g){
  if(!g) return;
  const id = g.id || "pad";
  DESK.gp.id = id; DESK.gp.profile = gpProfileOf(g);
  if(_gpToastedId===id) return;
  _gpToastedId = id;
  deskSetDevice("pad");
  _gpToast("Mando conectado");
  if(typeof deskControlsChanged==="function") deskControlsChanged();
}
window.addEventListener("gamepadconnected", (e)=> deskPadConnected(e.gamepad));
function deskPadGone(){
  if(!_gpToastedId) return;
  _gpToastedId = ""; DESK.gp.id = ""; DESK.gp.prev = {};
  _gpToast("Mando desconectado");
  if(typeof deskControlsChanged==="function") deskControlsChanged();
}
window.addEventListener("gamepaddisconnected", deskPadGone);
// vibración del mando (si lo trae): la usa hapticPulse() de prefs.js solo cuando se juega con mando
function padRumble(ms){
  if(DESK.device!=="pad") return false;
  const g = _gpPad(); const act = g && g.vibrationActuator; if(!act || typeof act.playEffect!=="function") return false;
  const d = Array.isArray(ms) ? ms.reduce((a, b)=> a + b, 0) : (+ms||40);
  try{ act.playEffect("dual-rumble", {duration:Math.max(20, Math.min(400, d)), strongMagnitude:0.5, weakMagnitude:0.7}); return true; }catch(e){ return false; }
}
function deskGamepadTick(){
  const g = _gpPad();
  if(!g){ if(DESK.gp.on){ DESK.gp.on = false; DESK.gpVec = {x:0,y:0}; DESK.gp.aim = null; if(DESK.gpBasic){ DESK.gpBasic = false; _deskBasicSync(); } deskApplyMove(); if(typeof padNavHide==="function") padNavHide(); } deskPadGone(); return; }
  if(!DESK.gp.id) deskPadConnected(g); // por si el navegador no avisó (gamepadconnected)
  const r = gpRead(g), now = r.b, prev = DESK.gp.prev;
  const edge = n => now[n] && !prev[n], rel = n => !now[n] && prev[n];
  DESK.gp.prev = now;
  let mx = r.lx, my = r.ly;
  if(now.LEFT) mx = -1; if(now.RIGHT) mx = 1; if(now.UP) my = -1; if(now.DOWN) my = 1;
  DESK.gp.aim = r.rl > 0.3 ? {x:r.rx/r.rl, y:r.ry/r.rl} : null;
  const any = mx || my || GP_NAMES.some(n => now[n]) || r.rl > 0.3;
  if(any){ DESK.gp.on = true; deskSetDevice("pad"); }
  const ov = typeof padNavOverlayOpen==="function" && padNavOverlayOpen(); // ficha de arena, diálogo, Opciones... encima de la partida
  const playing = state==="playing" && !ov;
  if((edge("START") || edge("BACK")) && (state==="paused" || (state==="playing" && !ov) || (_deskOptionsOpen() && !ov))) deskPauseToggle();
  if(!playing){
    if(DESK.gpVec.x || DESK.gpVec.y){ DESK.gpVec = {x:0,y:0}; deskApplyMove(); }
    if(DESK.gpBasic){ DESK.gpBasic = false; _deskBasicSync(); }
    if(typeof padNavTick==="function") padNavTick(r, edge, rel, any);
    return;
  }
  if(typeof padNavHide==="function") padNavHide(true);
  const l = Math.hypot(mx, my);
  DESK.gpVec = l > 1 ? {x:mx/l, y:my/l} : {x:mx, y:my};
  if(l > 0.05) deskMoveCancel();
  deskApplyMove();
  if(now.A!==DESK.gpBasic){ DESK.gpBasic = now.A; _deskBasicSync(); }
  [["X",0],["Y",1],["B",2]].forEach(([b, idx])=>{ if(edge(b)) deskSkill(idx, true, "g"); else if(rel(b)) deskSkill(idx, false, "g"); });
  if(edge("RB") || edge("RT")) deskUlt();
  if(edge("LB") && typeof emergPress==="function") emergPress();
  if(edge("R3")) deskPact();
  if(edge("LT")){ DESK.gp.ctx = true; deskCtx(true); } else if(rel("LT") && DESK.gp.ctx){ DESK.gp.ctx = false; deskCtx(false); }
}

/* ---------------- guía de controles de la primera partida ----------------
   Acompaña los tres primeros consejos del Hechicero (js/systems/tutorial.js: b_move, b_attack,
   b_skill) SIN texto nuevo: un aro que late sobre el joystick, sobre Ataque o sobre las habilidades
   (y la perilla que "muestra" el gesto), y se va solo apenas el jugador lo hace. El texto lo pone el
   Hechicero, adaptado a teclado/mando con ctlHint(). */
function ctlHint(kind){
  const d = DESK.device;
  if(d==="pad") return {move:"Movete con el stick izquierdo", attack:"Mantené A para pelear", skill:"Apretá X, Y o B (el stick derecho apunta)"}[kind];
  if(d==="kb"){
    const moba = deskScheme()==="moba", dflt = !(PREFS.keyBinds && PREFS.keyBinds[deskScheme()] && Object.keys(PREFS.keyBinds[deskScheme()]).length);
    if(moba) return {move:"Movete con clic derecho (o las flechas)", attack:"Mantené Espacio (o clic) para pelear",
      skill: dflt ? "Apretá Q, W o E (apuntan al mouse)" : "Apretá las teclas de habilidad (apuntan al mouse)"}[kind];
    return {move:"Movete con WASD o las flechas", attack:"Mantené Espacio (o clic) para pelear",
      skill: dflt ? "Apretá 1, 2 o 3 (apuntan al mouse)" : "Apretá las teclas de habilidad (apuntan al mouse)"}[kind];
  }
  const thumb = typeof PREFS!=="undefined" && PREFS.lefty ? "pulgar derecho" : "pulgar izquierdo"; // modo zurdo
  return {move:"Movete con el joystick ("+thumb+")", attack:"Mantené Ataque para pelear", skill:"Tocá una habilidad (mantené y arrastrá para apuntar)"}[kind];
}
let _onbCls = "";
function deskOnboardTick(){
  let want = "";
  if(state==="playing" && typeof TUT!=="undefined" && TUT.key && !TUT.ducked && player && player.alive){
    // (con teclado o mando el aro del joystick no sirve: el Hechicero ya dice qué teclas usar)
    if(TUT.key==="b_move" && DESK.device!=="kb" && DESK.device!=="pad" && !(joyActive || Math.hypot(joyVec.x, joyVec.y) > 0.1)) want = "onb-move";
    else if(TUT.key==="b_attack" && !basicHeld) want = "onb-attack";
    else if(TUT.key==="b_skill" && !(typeof aimState!=="undefined" && aimState) && !(player.cds && player.cds.some(c=>c>0))) want = "onb-skill";
  }
  if(want===_onbCls) return;
  const b = document.body;
  if(_onbCls) b.classList.remove(_onbCls);
  if(want) b.classList.add(want);
  _onbCls = want;
}

/* ---------------- teclas en los botones ---------------- */
// rótulo del mando por botón de pantalla (fijo: el mando no se reasigna)
const PAD_HINTS = { "btn-basic":"A", "btn-s1":"X", "btn-s2":"Y", "btn-s3":"B", "btn-ult":"RB", "btn-emerg":"LB", "btn-pact":"R3", "btn-revive":"LT", "pause-btn":"Start" };
function deskRefreshHints(){
  for(const id in PAD_HINTS){
    const el = document.getElementById(id); if(!el) continue;
    let s = el.querySelector(".kh");
    if(!s){ s = document.createElement("span"); s.className = "kh"; s.setAttribute("aria-hidden", "true"); el.appendChild(s); }
    const act = Object.keys(ACT_BTN).find(a => ACT_BTN[a]===id);
    const kb = id==="pause-btn" ? "Esc" : deskActionLabel(act);
    if(s.dataset.kb!==kb) s.dataset.kb = kb;
    if(s.dataset.pad!==PAD_HINTS[id]) s.dataset.pad = PAD_HINTS[id];
    if(act && el.hasAttribute("aria-keyshortcuts")){ const ks = (deskActionCodes(act)[0] || "").replace(/^(Key|Digit)/, ""); if(el.getAttribute("aria-keyshortcuts")!==ks) el.setAttribute("aria-keyshortcuts", ks); }
  }
}
// cambió el esquema, una tecla o el mando: se rehacen la tabla de teclas, los rótulos y el marcador
function deskControlsChanged(){
  deskBindsInvalidate(); deskMoveCancel(); DESK.codes.clear(); DESK.kbVec = {x:0,y:0};
  deskRefreshHints();
  try{ window.dispatchEvent(new CustomEvent("lh:controls")); }catch(e){}
}
(function(){
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", deskRefreshHints); else deskRefreshHints();
  setInterval(deskRefreshHints, 1500); // los botones del HUD se crean/clonan al armar la partida: se vuelven a rotular solos
})();

// un solo bucle liviano para el mando y la guía (no depende del bucle del juego: la pausa también lo escucha)
(function loop(){
  try{ deskGamepadTick(); deskCtmTick(); deskOnboardTick(); }catch(e){ if(typeof console!=="undefined") console.warn("input-desk", e); }
  requestAnimationFrame(loop);
})();
// al rotar el teléfono o cambiar a modo zurdo, los "+" de subir habilidad se vuelven a ubicar junto a su botón
window.addEventListener("resize", ()=> setTimeout(()=>{ if(typeof positionSkillPlusButtons==="function" && state==="playing") positionSkillPlusButtons(); }, 80));
