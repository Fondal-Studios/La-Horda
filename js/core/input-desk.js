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
(function(){
  const cv = document.getElementById("game"); if(!cv) return;
  // el mouse se sigue en TODA la ventana: las zonas del joystick y de los botones cubren media pantalla
  // cada una y, mirando solo el canvas, apuntar hacia abajo a la derecha no funcionaba
  window.addEventListener("pointermove", (e)=>{ if(e.pointerType==="mouse"){ DESK.mouse.x = e.clientX; DESK.mouse.y = e.clientY; DESK.mouse.on = true; } }, {passive:true});
  document.documentElement.addEventListener("mouseleave", ()=>{ DESK.mouse.on = false; });
  const sz = document.getElementById("skillzone");
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
  // después de tocar un botón con el mouse (pausa, continuar) el foco no se queda en él: si no, Espacio lo volvía a apretar
  document.addEventListener("click", (e)=>{
    const b = e.target && e.target.closest && e.target.closest("#pause-btn, #mute-btn, #resume-btn, .skill-plus");
    if(b && typeof b.blur==="function") setTimeout(()=>{ try{ b.blur(); }catch(_){} }, 0);
  }, true);
})();

/* ---------------- mando (Gamepad API) ---------------- */
const GP_DEAD = 0.28;
function _gpPad(){
  if(typeof navigator==="undefined" || typeof navigator.getGamepads!=="function") return null;
  let list; try{ list = navigator.getGamepads(); }catch(e){ return null; }
  if(!list) return null;
  for(const g of list) if(g && g.connected!==false && g.buttons && g.buttons.length) return g;
  return null;
}
function _gpBtn(g, i){ const b = g.buttons[i]; return !!(b && (b.pressed || (typeof b.value==="number" && b.value > 0.5))); }
function deskGamepadTick(){
  const g = _gpPad();
  if(!g){ if(DESK.gp.on){ DESK.gp.on = false; DESK.gpVec = {x:0,y:0}; DESK.gp.aim = null; if(DESK.gpBasic){ DESK.gpBasic = false; _deskBasicSync(); } deskApplyMove(); } return; }
  const prev = DESK.gp.prev, now = [];
  for(let i=0;i<Math.min(18, g.buttons.length);i++) now[i] = _gpBtn(g, i);
  const edge = i => now[i] && !prev[i], rel = i => !now[i] && prev[i];
  DESK.gp.prev = now;
  const ax = g.axes || [];
  let mx = Math.abs(ax[0]||0) > GP_DEAD ? ax[0] : 0, my = Math.abs(ax[1]||0) > GP_DEAD ? ax[1] : 0;
  if(now[14]) mx = -1; if(now[15]) mx = 1; if(now[12]) my = -1; if(now[13]) my = 1;
  const rx = ax[2]||0, ry = ax[3]||0, rl = Math.hypot(rx, ry);
  DESK.gp.aim = rl > 0.45 ? {x:rx/rl, y:ry/rl} : null;
  const any = mx || my || now.some(Boolean) || rl > 0.45;
  if(any){ DESK.gp.on = true; deskSetDevice("pad"); }
  if(edge(9) || edge(8)) deskPauseToggle();
  if(state!=="playing"){
    if(DESK.gpVec.x || DESK.gpVec.y){ DESK.gpVec = {x:0,y:0}; deskApplyMove(); }
    if(DESK.gpBasic){ DESK.gpBasic = false; _deskBasicSync(); }
    return;
  }
  const l = Math.hypot(mx, my);
  DESK.gpVec = l > 1 ? {x:mx/l, y:my/l} : {x:mx, y:my};
  deskApplyMove();
  if(now[0]!==DESK.gpBasic){ DESK.gpBasic = now[0]; _deskBasicSync(); }
  [[2,0],[3,1],[1,2]].forEach(([b, idx])=>{ if(edge(b)) deskSkill(idx, true, "g"); else if(rel(b)) deskSkill(idx, false, "g"); });
  if(edge(5) || edge(7)) deskUlt();
  if(edge(4) && typeof emergPress==="function") emergPress();
  if(edge(11)) deskPact();
  if(edge(6)){ DESK.gp.ctx = true; deskCtx(true); } else if(rel(6) && DESK.gp.ctx){ DESK.gp.ctx = false; deskCtx(false); }
}

/* ---------------- guía de controles de la primera partida ----------------
   Acompaña los tres primeros consejos del Hechicero (js/systems/tutorial.js: b_move, b_attack,
   b_skill) SIN texto nuevo: un aro que late sobre el joystick, sobre Ataque o sobre las habilidades
   (y la perilla que "muestra" el gesto), y se va solo apenas el jugador lo hace. El texto lo pone el
   Hechicero, adaptado a teclado/mando con ctlHint(). */
function ctlHint(kind){
  const d = DESK.device;
  if(d==="pad") return {move:"Movete con el stick izquierdo", attack:"Mantené A para pelear", skill:"Apretá X, Y o B (el stick derecho apunta)"}[kind];
  if(d==="kb") return {move:"Movete con WASD o las flechas", attack:"Mantené Espacio (o clic) para pelear", skill:"Apretá 1, 2 o 3 (apuntan al mouse)"}[kind];
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
(function(){
  const HINTS = { "btn-basic":["Espacio","A"], "btn-s1":["1","X"], "btn-s2":["2","Y"], "btn-s3":["3","B"], "btn-ult":["R","RB"],
    "btn-emerg":["Q","LB"], "btn-pact":["F","R3"], "btn-revive":["E","LT"], "pause-btn":["Esc","Start"] };
  const add = ()=>{
    for(const id in HINTS){
      const el = document.getElementById(id); if(!el || el.querySelector(".kh")) continue;
      const s = document.createElement("span"); s.className = "kh"; s.setAttribute("aria-hidden", "true");
      s.dataset.kb = HINTS[id][0]; s.dataset.pad = HINTS[id][1];
      el.appendChild(s);
    }
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", add); else add();
})();

// un solo bucle liviano para el mando y la guía (no depende del bucle del juego: la pausa también lo escucha)
(function loop(){
  try{ deskGamepadTick(); deskOnboardTick(); }catch(e){ if(typeof console!=="undefined") console.warn("input-desk", e); }
  requestAnimationFrame(loop);
})();
// al rotar el teléfono o cambiar a modo zurdo, los "+" de subir habilidad se vuelven a ubicar junto a su botón
window.addEventListener("resize", ()=> setTimeout(()=>{ if(typeof positionSkillPlusButtons==="function" && state==="playing") positionSkillPlusButtons(); }, 80));
