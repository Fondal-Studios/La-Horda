"use strict";
/* ============================================================
   js/core/controls-panel.js
   Pantalla "Controles" (Opciones > Controles > Ver controles): lista las teclas del esquema activo (Clásico o
   MOBA / tipo LoL) junto a los botones del mando, y deja reasignar las teclas de las acciones principales
   (Ataque, Habilidades 1-3, Definitiva, Curación, Revivir/acción, Pacto). Los botones del mando son fijos y se
   muestran de solo lectura. Lo reasignado se guarda por esquema en PREFS.keyBinds (js/core/prefs.js).
   Lógica de teclas y tabla de esquemas: js/core/input-desk.js.
   ============================================================ */
const CTL_LABEL = { basic:"Ataque", s1:"Habilidad 1", s2:"Habilidad 2", s3:"Habilidad 3", ult:"Definitiva", emerg:"Curación de emergencia", ctx:"Revivir / acción", pact:"Pacto (Nigromante)" };
const CTL_PAD = { basic:"A", s1:"X", s2:"Y", s3:"B", ult:"RB / RT", emerg:"LB", ctx:"LT", pact:"R3" };
// otras teclas del esquema que no se reasignan (se muestran para que no haya sorpresas)
const CTL_EXTRA_KEYS = { basic:{classic:"clic izquierdo", moba:"clic izquierdo"} };
const CTL_NOTES = {
  classic:"Clásico: WASD o flechas para moverte, Espacio para atacar, 1 2 3 habilidades, R Definitiva, Q curación, E acción, Esc pausa. También funciona con mando.",
  moba:"MOBA: clic derecho para moverte, clic izquierdo o Espacio para atacar, Q W E habilidades, R Definitiva, D curación, F acción, Esc pausa. También funciona con mando."
};
const CTL_SUB = {
  classic:"Esquema Clásico: movés con WASD o las flechas y lanzás con 1 2 3.",
  moba:"Esquema MOBA: clic derecho en el mapa para ir hasta ahí, clic izquierdo para atacar y Q W E R para lanzar. Las flechas también mueven."
};
let _ctlWaiting = null; // {act, btn}

function _ctlEl(id){ return document.getElementById(id); }
function ctlMsg(t){ const m = _ctlEl("ctl-msg"); if(m) m.textContent = t || ""; }
function ctlRows(){
  const sc = deskScheme();
  return KB_ACTIONS.filter(a => !(sc==="moba" && a==="pact")); // MOBA: una sola tecla (F) para revivir, acción y Pacto
}
function ctlRender(){
  const body = _ctlEl("ctl-map-body"); if(!body) return;
  const sc = deskScheme();
  body.textContent = "";
  const row = (cls, label, kbNode, pad)=>{
    const r = document.createElement("div"); r.className = "ctl-row " + cls;
    const a = document.createElement("span"); a.className = "ctl-act"; a.textContent = label;
    const k = document.createElement("span"); k.className = "ctl-kb"; k.appendChild(kbNode);
    const p = document.createElement("span"); p.className = "ctl-pad"; if(pad){ const c = document.createElement("kbd"); c.textContent = pad; p.appendChild(c); }
    r.append(a, k, p); body.appendChild(r); return r;
  };
  const caps = (list)=>{ const w = document.createDocumentFragment(); list.forEach((t, i)=>{ if(i){ const s = document.createElement("i"); s.textContent = "/"; w.appendChild(s); } const c = document.createElement("kbd"); c.textContent = t; w.appendChild(c); }); return w; };
  // movimiento
  const mv = document.createElement("span");
  mv.appendChild(caps(sc==="moba" ? ["Clic derecho", "← ↑ ↓ →"] : ["W A S D", "← ↑ ↓ →"]));
  row("ctl-fixed", "Moverte", mv, "Stick izq. / cruceta");
  // acciones reasignables
  for(const act of ctlRows()){
    const b = document.createElement("button"); b.type = "button"; b.className = "ctl-key"; b.dataset.act = act;
    b.textContent = deskActionLabel(act);
    b.setAttribute("aria-label", CTL_LABEL[act] + ": " + deskActionLabel(act));
    b.addEventListener("click", ()=> ctlWait(act, b));
    const wrap = document.createElement("span"); wrap.appendChild(b);
    const extra = deskActionCodes(act).slice(1).map(deskKeyLabel);
    if(CTL_EXTRA_KEYS[act]) extra.push(CTL_EXTRA_KEYS[act][sc]);
    if(act==="ctx" && sc==="moba") extra.push("Pacto");
    if(extra.length){ const e = document.createElement("small"); e.className = "ctl-alias"; e.textContent = extra.join(" · "); wrap.appendChild(e); }
    row("ctl-bind", act==="ctx" && sc==="moba" ? "Revivir / acción / Pacto" : CTL_LABEL[act], wrap, CTL_PAD[act]);
  }
  // fijos
  const fx = (t)=>{ const s = document.createElement("span"); s.appendChild(caps(t)); return s; };
  row("ctl-fixed", "Apuntar", fx(["Mouse"]), "Stick der.");
  row("ctl-fixed", "Pausa", fx(["Esc", "P"]), "Start");
  row("ctl-fixed", "En los menús", fx(["Mouse"]), "Cruceta · A · B · LB/RB");
  const sub = _ctlEl("ctl-scheme-sub"); if(sub) sub.textContent = CTL_SUB[sc];
  const note = _ctlEl("opt-keys-note"); if(note) note.textContent = CTL_NOTES[sc];
  const pl = _ctlEl("ctl-pad-line");
  if(pl){
    pl.textContent = "";
    const s = document.createElement("span"); s.textContent = DESK.gp.id ? "Mando detectado:" : "Mando: conectalo y apretá cualquier botón.";
    pl.appendChild(s);
    if(DESK.gp.id){ const n = document.createElement("b"); n.textContent = " " + DESK.gp.id.replace(/\s*\(.*$/, "").slice(0, 40) + " · " + (GP_PROFILES[DESK.gp.profile] ? GP_PROFILES[DESK.gp.profile].label : ""); pl.appendChild(n); }
  }
  // selector de esquema
  document.querySelectorAll('#ctl-scheme button[data-v]').forEach(b => b.setAttribute("aria-pressed", b.dataset.v===sc ? "true" : "false"));
}
function ctlWait(act, btn){
  ctlCancelWait();
  _ctlWaiting = {act, btn}; DESK.rebinding = true;
  btn.classList.add("waiting"); btn.textContent = "Apretá una tecla";
  ctlMsg("Apretá la tecla nueva. Esc cancela.");
}
function ctlCancelWait(){
  if(!_ctlWaiting) return;
  _ctlWaiting.btn.classList.remove("waiting"); _ctlWaiting = null; DESK.rebinding = false;
  ctlRender();
}
// asigna "code" a la acción; si otra acción ya la usaba, se intercambian
function ctlSetBind(act, code){
  const sc = deskScheme();
  if(KB_RESERVED.has(code)){ ctlMsg("Esa tecla está reservada."); return false; }
  if(deskMoveKeys()[code]){ ctlMsg("Esa tecla mueve a tu guardián."); return false; }
  if(!PREFS.keyBinds[sc]) PREFS.keyBinds[sc] = {};
  const ov = PREFS.keyBinds[sc], old = deskActionCodes(act)[0];
  if(old===code){ ctlMsg(""); return true; }
  const other = ctlRows().find(a => a!==act && deskActionCodes(a).includes(code));
  ov[act] = code;
  if(other){ const oc = deskActionCodes(other); ov[other] = oc[0]===code ? old : oc[0]; ctlMsg("Teclas intercambiadas con otra acción."); }
  else ctlMsg("");
  prefsSave(); deskControlsChanged();
  return true;
}
function ctlReset(){
  const sc = deskScheme();
  PREFS.keyBinds[sc] = {}; prefsSave(); deskControlsChanged(); ctlMsg("Teclas restauradas.");
}
function openControlsMap(){
  const box = _ctlEl("ctl-map"); if(!box) return;
  ctlMsg(""); ctlRender(); box.classList.remove("hidden");
}
function closeControlsMap(){
  ctlCancelWait();
  const box = _ctlEl("ctl-map"); if(box) box.classList.add("hidden");
}
// mientras se espera una tecla, se la queda esta pantalla (en captura, antes que el juego, la pausa y los diálogos)
window.addEventListener("keydown", (ev)=>{
  if(_ctlWaiting){
    ev.preventDefault(); ev.stopImmediatePropagation();
    if(ev.repeat) return;
    if(ev.code==="Escape"){ ctlCancelWait(); ctlMsg(""); return; }
    if(/^(Shift|Control|Alt|Meta)/.test(ev.code)) return;
    const w = _ctlWaiting; _ctlWaiting = null; DESK.rebinding = false;
    w.btn.classList.remove("waiting");
    ctlSetBind(w.act, ev.code);
    ctlRender();
    const nb = document.querySelector('#ctl-map-body .ctl-key[data-act="' + w.act + '"]'); if(nb) try{ nb.focus({preventScroll:true}); }catch(e){}
    return;
  }
  const box = _ctlEl("ctl-map");
  if(ev.code==="Escape" && box && !box.classList.contains("hidden")){ ev.preventDefault(); ev.stopImmediatePropagation(); closeControlsMap(); }
}, true);
window.addEventListener("lh:controls", ()=>{ const note = _ctlEl("opt-keys-note"); if(note) note.textContent = CTL_NOTES[deskScheme()]; const box = _ctlEl("ctl-map"); if(box && !box.classList.contains("hidden") && !_ctlWaiting) ctlRender(); });
(function(){
  const bind = ()=>{
    const open = _ctlEl("opt-keys-btn"); if(open) open.addEventListener("click", openControlsMap);
    const box = _ctlEl("ctl-map"); if(!box) return;
    box.querySelectorAll("[data-ctl-close]").forEach(b => b.addEventListener("click", closeControlsMap));
    const reset = _ctlEl("ctl-reset-btn"); if(reset) reset.addEventListener("click", ctlReset);
    // el selector de esquema de esta pantalla (el de Opciones lo conecta prefs.js)
    box.querySelectorAll("#ctl-scheme button[data-v]").forEach(b => b.addEventListener("click", ()=>{ ctlCancelWait(); prefSet("ctlScheme", b.dataset.v); ctlRender(); }));
    const note = _ctlEl("opt-keys-note"); if(note) note.textContent = CTL_NOTES[deskScheme()];
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", bind); else bind();
})();
