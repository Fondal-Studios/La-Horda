"use strict";
/* ============================================================
   js/core/pad-nav.js
   NAVEGACIÓN DE MENÚS CON MANDO. Hasta ahora el mando solo servía dentro de la partida: el título, el hub, Modos,
   Guardianes, Tienda, Pase, Opciones, Pausa, las pantallas de fin y los diálogos no tenían ningún camino por mando.

   - Cruceta o stick izquierdo: mueven el FOCO al botón vecino en esa dirección (navegación espacial por posición en
     pantalla; solo cuenta lo que se ve y no está tapado por otra capa, así un diálogo o las Opciones encerrados "atrapan" el foco).
   - A: confirmar (un clic real sobre el botón). En un selector o deslizador, izquierda/derecha cambian el valor.
   - B: atrás / volver / cerrar (botón "Volver", cerrar de un diálogo, Cancelar, Continuar en la pausa).
   - LB / RB: pestaña anterior / siguiente donde haya (Tienda, Códice, Inventario, Pase...). Stick derecho: desplaza la lista.
   - Start: en el título, JUGAR AHORA; en partida y en la pausa, pausar / continuar (js/core/input-desk.js).
   El foco es un marco pixel-art (#pad-focus, css/controls-polish.css) que solo se ve mientras se juega con mando:
   mover el mouse o tocar la pantalla lo oculta, y no cambia nada de lo táctil ni del mouse.
   input-desk.js llama a padNavTick() cada cuadro con el mando ya traducido a nombres lógicos (A B X Y LB RB... UP DOWN).
   ============================================================ */
const PADNAV = { el:null, sig:null, shown:false, key:"", need:false, rep:{dir:"", t:0, n:0}, tScan:0, hiddenByMouse:false, box:null, mouseAcc:0, tBump:0 };
const PN_SEL = 'button, a[href], [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [role="menuitem"], select, input:not([type="hidden"]), textarea, summary, [tabindex]:not([tabindex="-1"])';
const PN_TAB_SEL = '[role="tab"], .hub-tab, .shop-tab, .cx-tab, .tab, button[class*="-tab"]';
const PN_ACTIVE_SEL = '.on, .active, .sel, .selected, [aria-selected="true"], [aria-pressed="true"]';
const PN_BACK_SEL = '[data-pad-back], .gd-cancel, .ui-back, .cx-back, [id$="-back-btn"], [id$="-close-btn"], [id="resume-btn"], [data-opt-close].btn, [data-cw-gate-close].btn, [data-pg-gate-close].btn, .modal-close, [aria-label="Cerrar"], [aria-label="Close"]';
const PN_BACK_TXT = /^(‹\s*)?(volver|atr[aá]s|cerrar|cancelar|listo|salir|back|close|cancel|done|exit|voltar|fechar|pronto|sair)$/i;
const PN_DEFAULT_SEL = ['[data-pad-default]', '.gd-danger .gd-cancel', '#bt-play', '#hub-play-btn', '#starter-yes-btn', '.ri-go', '.gd-ok', '#resume-btn',
  '.btn:not(.secondary):not(.small)', 'button.btn', 'button'];

function _pnVisibleEl(e){ return !!e && e.isConnected && e.getClientRects().length > 0 && !e.closest(".hidden"); }
// Hay algo encima de la partida que se maneja con el foco (ficha de arena, historia, diálogo, Opciones, Pausa online...)
function padNavOverlayOpen(){
  try{
    if(typeof _deskOverlayOpen==="function" && _deskOverlayOpen()) return true;
    if(typeof GAME_DIALOG!=="undefined" && GAME_DIALOG.cur) return true;
    if(typeof _deskOptionsOpen==="function" && _deskOptionsOpen()) return true;
    if(state==="playing"){
      const m = document.querySelector(".ui-modal:not(.hidden)"); if(m && _pnVisibleEl(m)) return true;
      const ps = document.getElementById("pause-screen"); if(ps && !ps.classList.contains("hidden") && _pnVisibleEl(ps)) return true;
      const fs = document.getElementById("first-story"); if(fs && _pnVisibleEl(fs)) return true;
    }
  }catch(e){}
  return false;
}
// "firma" de lo que hay en pantalla: si cambia (otra pantalla, se abrió un diálogo), el foco se vuelve a ubicar
function _pnCtxKey(){
  let k = String(state);
  document.querySelectorAll(".screen:not(.hidden), .ui-modal:not(.hidden), #run-intro:not(.hidden), #first-story").forEach(e=>{ if(e.id && _pnVisibleEl(e)) k += "|" + e.id; });
  try{ if(typeof GAME_DIALOG!=="undefined" && GAME_DIALOG.cur) k += "|dlg"; }catch(e){}
  return k;
}

/* ---------------- candidatos ---------------- */
function _pnScrollers(el){
  const out = [];
  for(let p = el.parentElement; p && p!==document.body && p!==document.documentElement; p = p.parentElement){
    const cs = getComputedStyle(p), ov = cs.overflowX + " " + cs.overflowY;
    if(/(auto|scroll|hidden|clip)/.test(ov)) out.push({el:p, scroll:/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 2});
  }
  return out;
}
// null = no sirve (invisible, tapado, minúsculo); si no, {el, rect, off} (off: fuera del área visible de su lista, se puede desplazar hasta él)
function _pnInspect(el, vw, vh){
  if(el.disabled || el.closest("[data-pad-skip]") || el.id==="pad-focus" || el.closest("#pad-focus") || el.classList.contains("ui-modal-back")) return null;
  const r = el.getBoundingClientRect();
  if(r.width < 8 || r.height < 8) return null;
  const cs = getComputedStyle(el);
  if(cs.visibility==="hidden" || cs.display==="none" || +cs.opacity < 0.05 || cs.pointerEvents==="none") return null;
  if(r.width*r.height > 0.55*vw*vh && el.tagName!=="BUTTON" && el.tagName!=="A") return null; // fondos de diálogo
  if(el.getAttribute("aria-hidden")==="true" && el.tagName!=="BUTTON") return null;
  let clip = {l:0, t:0, r:vw, b:vh}, scroller = null;
  const scs = _pnScrollers(el);
  // pegado (sticky) dentro de su lista, como la barra de pestañas o el "Listo" de Opciones: siempre "está a mano", así que
  // no gana contra las filas de la lista al moverse (solo cuando no queda nada más en esa dirección)
  let sticky = false;
  { const top = scs.length ? scs[0].el : null; for(let p = el; p && p!==top && p!==document.body; p = p.parentElement){ const ps = p===el ? cs : getComputedStyle(p); if(ps.position==="sticky"){ sticky = true; break; } } if(!top) sticky = false; }
  for(const s of scs){
    const pr = s.el.getBoundingClientRect();
    clip = {l:Math.max(clip.l, pr.left), t:Math.max(clip.t, pr.top), r:Math.min(clip.r, pr.right), b:Math.min(clip.b, pr.bottom)};
    if(s.scroll && !scroller) scroller = s.el;
  }
  const il = Math.max(r.left, clip.l), it = Math.max(r.top, clip.t), ir = Math.min(r.right, clip.r), ib = Math.min(r.bottom, clip.b);
  if(ir - il >= 6 && ib - it >= 6){
    const h = document.elementFromPoint((il + ir)/2, (it + ib)/2);
    if(!h) return null;
    if(!(el===h || el.contains(h) || h.contains(el))){
      // tapado por una barra pegada de su propia lista (el "Listo" de Opciones): se llega desplazando; tapado por otra capa: no vale
      if(scroller && scroller.contains(h)) return {el, rect:r, off:true, sticky};
      return null;
    }
    return {el, rect:r, off:false, sticky};
  }
  if(scroller){ // fuera del área visible de su lista: vale si la lista misma está a la vista y destapada
    const sr = scroller.getBoundingClientRect();
    const sx = Math.max(0, Math.min(vw, (sr.left + sr.right)/2)), sy = Math.max(0, Math.min(vh, (sr.top + Math.min(sr.bottom, vh))/2));
    const h = document.elementFromPoint(sx, sy);
    if(h && scroller.contains(h)) return {el, rect:r, off:true, sticky};
  }
  return null;
}
function padCandidates(){
  const vw = innerWidth, vh = innerHeight, seen = new Set(), out = [];
  const add = (el)=>{ if(seen.has(el)) return; seen.add(el); const c = _pnInspect(el, vw, vh); if(c) out.push(c); };
  document.querySelectorAll(PN_SEL).forEach(add);
  // tarjetas y casillas "clicables" que no son botones: el cursor de mano (que se hereda) marca dónde empieza lo clicable
  const all = document.body.getElementsByTagName("*");
  for(let i = 0; i < all.length; i++){
    const el = all[i];
    if(seen.has(el) || el.id==="pad-focus" || !el.getClientRects().length || el.tagName==="CANVAS" || el.tagName==="SCRIPT") continue;
    const cs = getComputedStyle(el);
    if(cs.cursor!=="pointer") continue;
    const pc = el.parentElement ? getComputedStyle(el.parentElement).cursor : "";
    if(pc==="pointer") continue;
    add(el);
  }
  // un contenedor que tiene otros candidatos adentro no es un objetivo
  return out.filter(c => !out.some(o => o!==c && c.el.contains(o.el)));
}
function _pnCenter(r){ return {x:(r.left + r.right)/2, y:(r.top + r.bottom)/2}; }
function _pnOverlap(a0, a1, b0, b1){ return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0)); }
function padPick(from, dir, cands){
  const fr = from.getBoundingClientRect(), fc = _pnCenter(fr), vert = dir==="UP" || dir==="DOWN";
  let best = null, bestS = Infinity;
  for(const c of cands){
    if(c.el===from) continue;
    const r = c.rect, cc = _pnCenter(r);
    // el candidato tiene que quedar del lado elegido (su borde cercano pasa de la mitad del actual)
    if(dir==="DOWN" && !(r.top >= fr.top + fr.height*0.5 && cc.y > fc.y + 2)) continue;
    if(dir==="UP" && !(r.bottom <= fr.bottom - fr.height*0.5 && cc.y < fc.y - 2)) continue;
    if(dir==="RIGHT" && !(r.left >= fr.left + fr.width*0.5 && cc.x > fc.x + 2)) continue;
    if(dir==="LEFT" && !(r.right <= fr.right - fr.width*0.5 && cc.x < fc.x - 2)) continue;
    const prim = vert ? Math.abs(cc.y - fc.y) : Math.abs(cc.x - fc.x), sec = vert ? Math.abs(cc.x - fc.x) : Math.abs(cc.y - fc.y);
    const gap = vert ? (cc.y > fc.y ? r.top - fr.bottom : fr.top - r.bottom) : (cc.x > fc.x ? r.left - fr.right : fr.left - r.right);
    const ov = vert ? _pnOverlap(fr.left, fr.right, r.left, r.right) : _pnOverlap(fr.top, fr.bottom, r.top, r.bottom);
    // vertical: manda la fila más cercana (la columna importa poco: las filas de Opciones tienen la etiqueta a un lado y el control al otro);
    // horizontal: se queda en la fila, y solo si no hay nada ahí salta a otra (con castigo)
    const s = Math.max(0, gap) + prim*0.1 + (vert ? sec*(ov > 0 ? 0.15 : 0.4) : sec*(ov > 0 ? 0.3 : 2.5) + (ov > 0 ? 0 : 60)) + (c.off ? 30 : 0) + (c.sticky ? 600 : 0);
    if(s < bestS){ bestS = s; best = c; }
  }
  return best;
}
function padDefault(cands){
  if(!cands.length) return null;
  const order = cands.slice().sort((a, b)=>{ const ay = Math.round(a.rect.top/28), by = Math.round(b.rect.top/28); return ay - by || a.rect.left - b.rect.left; });
  let pool = order.filter(c => !c.off);
  const inModal = pool.filter(c => c.el.closest(".ui-modal"));
  if(inModal.length) pool = inModal; // un panel encima: se empieza por su primer control (no por el "Listo" del final)
  for(const sel of PN_DEFAULT_SEL.slice(0, inModal.length ? 2 : PN_DEFAULT_SEL.length)){ const c = pool.find(x => x.el.matches(sel)); if(c) return c; }
  return pool.find(c => !c.sticky) || pool[0] || order[0];
}

/* ---------------- foco visible ---------------- */
function _pnBox(){
  if(PADNAV.box && PADNAV.box.isConnected) return PADNAV.box;
  const b = document.createElement("div"); b.id = "pad-focus"; b.setAttribute("aria-hidden", "true"); b.setAttribute("data-pad-skip", "");
  document.body.appendChild(b); PADNAV.box = b; return b;
}
function _pnDraw(){
  const b = PADNAV.box; if(!b) return;
  const el = PADNAV.el;
  if(!PADNAV.shown || !el || !_pnVisibleEl(el)){ b.classList.remove("on"); return; }
  const r = el.getBoundingClientRect();
  b.style.transform = "translate(" + Math.round(r.left) + "px," + Math.round(r.top) + "px)";
  b.style.width = Math.round(r.width) + "px"; b.style.height = Math.round(r.height) + "px";
  b.classList.toggle("pf-in", r.left < 30);
  b.classList.add("on");
}
function _pnSig(el){
  const r = el.getBoundingClientRect(), c = _pnCenter(r);
  return {id:el.id || "", tag:el.tagName, text:(el.textContent || "").trim().slice(0, 40), x:c.x, y:c.y};
}
// si una barra pegada (sticky) de la lista tapa el elemento, se desplaza la lista hasta destaparlo
function _pnReveal(el){
  for(let i = 0; i < 3; i++){
    const r = el.getBoundingClientRect(); if(r.width < 1) return;
    const cx = Math.max(1, Math.min(innerWidth - 1, (r.left + r.right)/2)), cy = Math.max(1, Math.min(innerHeight - 1, (r.top + r.bottom)/2));
    const h = document.elementFromPoint(cx, cy);
    if(!h || el===h || el.contains(h) || h.contains(el)) return;
    const sc = _pnScrollers(el).find(s => s.scroll); if(!sc || !sc.el.contains(h)) return;
    const hr = h.getBoundingClientRect(), d = hr.top > r.top ? (r.bottom - hr.top + 10) : -(hr.bottom - r.top + 10);
    const before = sc.el.scrollTop; sc.el.scrollTop += d; if(sc.el.scrollTop===before) return;
  }
}
function padPlace(c, instant){
  if(!c) return false;
  PADNAV.el = c.el; PADNAV.shown = true; PADNAV.need = false;
  try{ c.el.scrollIntoView({block:"nearest", inline:"nearest", behavior:"instant"}); }catch(e){ try{ c.el.scrollIntoView(false); }catch(_){} }
  _pnReveal(c.el);
  PADNAV.sig = _pnSig(c.el);
  _pnBox(); _pnDraw();
  return true;
}
function padNavHide(soft){
  PADNAV.key = ""; // al volver (de la partida, del mouse) se vuelve a leer qué hay en pantalla y se ubica el foco
  if(!PADNAV.shown && !PADNAV.need) return;
  PADNAV.shown = false; if(!soft) PADNAV.need = false;
  const b = PADNAV.box; if(b) b.classList.remove("on");
}
// el mouse o un toque devuelven el control: el marco se oculta hasta el próximo botón del mando
function padNavMouseMoved(e, click){
  if(!PADNAV.shown && !PADNAV.need) return;
  PADNAV.mouseAcc += click ? 99 : (Math.abs(e.movementX||0) + Math.abs(e.movementY||0));
  if(PADNAV.mouseAcc > 8){ PADNAV.mouseAcc = 0; PADNAV.hiddenByMouse = true; padNavHide(); }
}
window.addEventListener("pointerdown", (e)=>{ if(e.pointerType==="touch" || e.pointerType==="pen"){ PADNAV.hiddenByMouse = true; padNavHide(); } else if(e.pointerType==="mouse" && PADNAV.shown) padNavMouseMoved(e, true); }, {capture:true, passive:true});
// el elemento enfocado desapareció (se redibujó la lista): se busca el "mismo" por id, texto o posición
function _padRecover(cands){
  const s = PADNAV.sig; if(!s || !cands.length) return null;
  let c = s.id && cands.find(x => x.el.id===s.id);
  if(!c) c = s.text && cands.find(x => x.el.tagName===s.tag && (x.el.textContent || "").trim().slice(0, 40)===s.text);
  if(!c){ let bd = Infinity; for(const x of cands){ const cc = _pnCenter(x.rect), d = Math.hypot(cc.x - s.x, cc.y - s.y); if(d < bd){ bd = d; c = x; } } }
  return c || null;
}

/* ---------------- acciones ---------------- */
function _pnFlash(){ const b = PADNAV.box; if(!b) return; b.classList.remove("press"); void b.offsetWidth; b.classList.add("press"); }
function _pnBump(){ const b = PADNAV.box; if(!b) return; b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
function _pnFire(el, type){ el.dispatchEvent(new Event(type, {bubbles:true})); }
function padActivate(el){
  if(!el || !el.isConnected) return;
  _pnFlash();
  const tag = el.tagName, ty = (el.type || "").toLowerCase();
  if(tag==="SELECT"){ padAdjust(el, 1); return; }
  if(tag==="INPUT" && ty==="range") return;
  if(tag==="INPUT" && (ty==="text" || ty==="search" || ty==="email" || ty==="password" || ty==="number") || tag==="TEXTAREA"){ try{ el.focus(); }catch(e){} return; }
  el.click();
}
// izquierda/derecha sobre un selector o deslizador: cambia el valor (devuelve true si lo manejó)
function padAdjust(el, d){
  const tag = el.tagName, ty = (el.type || "").toLowerCase();
  if(tag==="SELECT"){
    const n = el.options.length; if(!n) return true;
    el.selectedIndex = (el.selectedIndex + d + n) % n; _pnFire(el, "input"); _pnFire(el, "change"); return true;
  }
  if(tag==="INPUT" && ty==="range"){
    const before = el.value; if(d > 0) el.stepUp(); else el.stepDown();
    if(el.value!==before){ _pnFire(el, "input"); _pnFire(el, "change"); }
    return true;
  }
  return false;
}
function _pnScrollNear(el, dy){
  for(const s of (el ? _pnScrollers(el) : [])) if(s.scroll){ const before = s.el.scrollTop; s.el.scrollTop += dy; if(s.el.scrollTop!==before) return true; }
  const se = document.scrollingElement; if(se && se.scrollHeight > se.clientHeight + 2){ const before = se.scrollTop; se.scrollTop += dy; return se.scrollTop!==before; }
  return false;
}
function padMove(dir){
  const el = PADNAV.el;
  if(el && (dir==="LEFT" || dir==="RIGHT") && padAdjust(el, dir==="RIGHT" ? 1 : -1)){ _pnFlash(); return; }
  const cands = padCandidates();
  if(!el || !_pnVisibleEl(el)){ padPlace(padDefault(cands)); return; }
  const c = padPick(el, dir, cands);
  if(c){ padPlace(c); return; }
  if((dir==="UP" || dir==="DOWN") && _pnScrollNear(el, dir==="DOWN" ? 140 : -140)){ // no hay más botones en esa dirección: la lista sigue
    const again = padPick(el, dir, padCandidates()); if(again) padPlace(again); return;
  }
  _pnBump();
}
function padBack(){
  try{
    if(typeof GAME_DIALOG!=="undefined" && GAME_DIALOG.cur && GAME_DIALOG.el){
      const cancel = GAME_DIALOG.el.querySelector(".gd-cancel"), ok = GAME_DIALOG.el.querySelector(".gd-ok");
      (cancel && !cancel.classList.contains("hidden") ? cancel : ok).click(); return true;
    }
  }catch(e){}
  const cands = padCandidates();
  // dentro del diálogo/capa de arriba si la hay; si no, en toda la pantalla
  const modals = [...document.querySelectorAll(".ui-modal:not(.hidden)")].filter(_pnVisibleEl), top = modals[modals.length - 1];
  const pool = top ? cands.filter(c => top.contains(c.el)) : cands;
  let hit = pool.find(c => c.el.matches(PN_BACK_SEL));
  if(!hit) hit = pool.find(c => PN_BACK_TXT.test((c.el.textContent || "").trim()));
  if(hit){ _pnFlash(); hit.el.click(); return true; }
  if(top){ // sin botón de cerrar a la vista: lo mismo que tocar el fondo
    if(top.id==="hub-options" && typeof closeHubOptions==="function"){ closeHubOptions(); return true; }
    const back = top.querySelector(".ui-modal-back"); if(back){ back.click(); return true; }
  }
  return false;
}
function padTab(d){
  const tabs = padCandidates().map(c => c.el).filter(e => e.matches(PN_TAB_SEL));
  if(tabs.length < 2) return false;
  const groups = new Map(); tabs.forEach(t => { const l = groups.get(t.parentElement) || []; l.push(t); groups.set(t.parentElement, l); });
  let g = null; for(const l of groups.values()){ if(l.length >= 2 && (!g || l.length > g.length)) g = l; }
  if(!g) return false;
  let i = g.findIndex(t => t.matches(PN_ACTIVE_SEL)); if(i < 0) i = 0;
  const next = g[(i + d + g.length) % g.length];
  _pnFlash(); next.click();
  PADNAV.sig = _pnSig(next); // la pestaña se vuelve a dibujar: el foco la sigue
  return true;
}

/* ---------------- ciclo ---------------- */
function _pnDir(r, now){
  if(now.UP) return "UP"; if(now.DOWN) return "DOWN"; if(now.LEFT) return "LEFT"; if(now.RIGHT) return "RIGHT";
  const x = r.lx, y = r.ly, ax = Math.abs(x), ay = Math.abs(y);
  if(Math.max(ax, ay) < 0.55) return "";
  return ay > ax ? (y < 0 ? "UP" : "DOWN") : (x < 0 ? "LEFT" : "RIGHT");
}
function padNavTick(r, edge, rel, any){
  const t = performance.now(), now = r.b;
  if(any) PADNAV.hiddenByMouse = false;
  const key = _pnCtxKey();
  if(key!==PADNAV.key){ PADNAV.key = key; PADNAV.need = true; PADNAV.el = null; PADNAV.sig = null; PADNAV.tScan = 0; if(PADNAV.box) PADNAV.box.classList.remove("on"); PADNAV.shown = false; }
  const press = GP_NAMES.some(n => edge(n)) || !!_pnDir(r, now);
  const woke = !PADNAV.shown && press;
  // mostrar el foco: al cambiar de pantalla con el mando en la mano, o con el primer botón apretado en un menú
  if(PADNAV.need && ((DESK.device==="pad" && !PADNAV.hiddenByMouse) || woke) && (woke || t - PADNAV.tScan > 90)){
    PADNAV.tScan = t;
    const c = padDefault(padCandidates());
    if(c){
      padPlace(c);
      // en el título, A (o Start) con el foco recién aparecido ya arranca la partida rápida
      if(woke && state==="title" && (edge("A") || edge("START")) && c.el.id==="bt-play") padActivate(c.el);
      PADNAV.rep = {dir:_pnDir(r, now), t:t, n:0};
      return;
    }
  }
  if(!PADNAV.shown) return;
  if(!_pnVisibleEl(PADNAV.el)){ const rc = _padRecover(padCandidates()); if(rc) padPlace(rc); else { PADNAV.shown = false; PADNAV.need = true; PADNAV.tScan = t; } return; }
  if(woke){ PADNAV.rep = {dir:_pnDir(r, now), t:t, n:0}; return; }
  // dirección con repetición al mantener
  const d = _pnDir(r, now);
  if(d){
    if(d!==PADNAV.rep.dir){ PADNAV.rep = {dir:d, t:t, n:0}; padMove(d); }
    else if(t - PADNAV.rep.t > (PADNAV.rep.n ? 130 : 380)){ PADNAV.rep.t = t; PADNAV.rep.n++; padMove(d); }
  } else PADNAV.rep.dir = "";
  if(edge("A")) padActivate(PADNAV.el);
  else if(edge("B")) padBack();
  else if(edge("LB")) padTab(-1);
  else if(edge("RB")) padTab(1);
  else if(edge("START") && state==="title"){ const p = document.getElementById("bt-play"); if(p && !p.disabled) padActivate(p); }
  if(r.rl > 0.3 && Math.abs(r.ry) > 0.3) _pnScrollNear(PADNAV.el, r.ry*16); // stick derecho: desplaza la lista
  _pnDraw();
}
