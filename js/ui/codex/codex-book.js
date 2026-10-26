"use strict";
/* ============================================================
   js/ui/codex/codex-book.js
   EL LIBRO DE LA HORDA — narrado por el Hechicero Supremo (firma "— El Hechicero Supremo" al pie de cada página).
   Visor de libro animado (pasa páginas en 3D con CSS, ilustraciones en canvas:
   js/ui/codex/codex-book-art.js). Cuatro usos, todos con el mismo visor:
     "intro"     gran introducción, una vez, al abrir el juego por primera vez (sobre la pantalla de carga: codexBookBoot)
     "fragment"  fragmento de una arena ganada (botón en la victoria y lista del Códice)
     "short"     carga corta antes de entrar a una arena de campaña en solitario (codexBookShort)
     "revisit"   lo que se vuelve a abrir desde Códice › El Libro
   Reglas (lógica en js/systems/codex-narrative.js): siempre hay Saltar/Esc/tocar; omitir cuenta como visto;
   la intro y la carga corta se cierran solas si el jugador entra a una sala o empieza una partida, así que
   nunca frenan a nadie; prefers-reduced-motion = sin giro de página, cambio instantáneo.
   Un solo narrador a la vez (js/systems/codex-narrative.js): con el Libro abierto el Hechicero no habla en ningún otro lado, y la
   página de carga es lo único que se muestra al entrar a una arena (run-intro.js: ya no hay ficha del Hechicero).
   Es 100% local: no manda nada por la red.
   ============================================================ */
const BOOK = {open:false, boot:false, kind:"", pages:[], i:0, t0:0, raf:0, flipping:false, onEnd:null, shownAt:0, auto:[], prevFocus:null};

function _bkEsc(s){ return String(s==null ? "" : s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }
function bookReducedMotion(){ try{ return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }catch(e){ return false; } }
function bookTextHtml(P){
  const paras = String(P.text || "").split("\n").filter(Boolean).map(t=>`<p>${_bkEsc(t)}</p>`).join("");
  return `<div class="bk-kicker">${_bkEsc(P.kicker || "")}</div><h2 class="bk-title">${_bkEsc(P.title || "")}</h2><div class="bk-body">${paras}</div>`;
}
// Ilustraciones sueltas (tarjeta del fragmento en la victoria): dibuja cada <canvas data-book-art> una vez y de nuevo cuando baja la imagen.
function codexBookPaintArts(root){
  (root || document).querySelectorAll("canvas[data-book-art]").forEach(cv=>{
    const paint = ()=>{ if(cv.isConnected) try{ bookDrawCanvas(cv, cv.dataset.bookArt, 2); }catch(e){} };
    paint(); setTimeout(paint, 250); setTimeout(paint, 900); setTimeout(paint, 2500);
  });
}
function bookEl(){
  let el = document.getElementById("codex-book");
  if(el) return el;
  el = document.createElement("div"); el.id = "codex-book"; el.className = "hidden"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "El Libro de la Horda, escrito por el Hechicero Supremo");
  el.innerHTML = `<svg class="bk-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="bk-ink" x="-2%" y="-6%" width="104%" height="112%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
    <div class="bk-veil"></div>
    <div class="bk-stage"><div class="bk-book">
      <div class="bk-left"><canvas class="bk-art" aria-hidden="true"></canvas><div class="bk-pg bk-pgl"></div></div>
      <div class="bk-right"><div class="bk-text"></div><div class="bk-sign" aria-hidden="true"></div><div class="bk-pg bk-pgr"></div></div>
      <div class="bk-leaf"><div class="bk-face bk-front"><div class="bk-text"></div></div><div class="bk-face bk-back"><canvas class="bk-art2" aria-hidden="true"></canvas></div></div>
      <div class="bk-spine"></div></div>
      <div class="bk-bar"><button type="button" class="bk-nav bk-prev" aria-label="Página anterior">‹</button><div class="bk-dots" aria-hidden="true"></div><button type="button" class="bk-nav bk-next" aria-label="Página siguiente">›</button></div>
    </div>
    <button type="button" class="bk-skip">Saltar ▸▸</button><div class="bk-load" aria-live="polite"></div><div class="bk-timer" aria-hidden="true"><i></i></div>`;
  document.body.appendChild(el);
  el.addEventListener("click", ev=>{
    if(ev.target.closest(".bk-skip")){ bookClose("skip"); return; }
    if(ev.target.closest(".bk-prev")){ bookGo(-1, true); return; }
    if(ev.target.closest(".bk-next")){ bookGo(1, true); return; }
    if(BOOK.kind==="short"){ bookClose("skip"); return; }                        // la carga corta se corta con un toque
    if(ev.target.closest(".bk-left")) bookGo(-1, true);
    else bookGo(1, false);                                                       // tocar el libro pasa de página (con el freno anti-toque-apurado)
  });
  document.addEventListener("keydown", ev=>{
    if(!BOOK.open) return;
    if(ev.key==="Escape"){ ev.preventDefault(); bookClose("skip"); }
    else if(ev.key==="ArrowRight" || ev.key==="Enter" || ev.key===" "){ ev.preventDefault(); bookGo(1, false); }
    else if(ev.key==="ArrowLeft"){ ev.preventDefault(); bookGo(-1, true); }
  }, true);
  window.addEventListener("resize", bookFit);
  return el;
}
// Tamaño del libro según el alto disponible (celular en horizontal: 844×390): todo escala con --bk-h.
function bookPortrait(){ return window.innerWidth < 640 && window.innerHeight > window.innerWidth*1.1; }
function bookFit(){
  const el = document.getElementById("codex-book"); if(!el) return;
  const vw = window.innerWidth, vh = window.innerHeight, short = BOOK.kind==="short", por = bookPortrait();
  const barH = short ? 0 : 46;
  let h, w;
  if(por){ w = Math.min(vw - 20, 520); h = Math.min(vh - barH - 24, w*1.45); }
  else { h = Math.max(150, Math.min((vh - barH - 20)*(short ? 0.78 : 1), (vw - 24)/2.15, 460)); w = h*2.15; }
  el.classList.toggle("bk-portrait", por);
  el.style.setProperty("--bk-h", h.toFixed(0) + "px"); el.style.setProperty("--bk-w", w.toFixed(0) + "px");
}
function bookSizeCanvas(cv){
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
  if(w && (cv.width !== Math.round(w*dpr) || cv.height !== Math.round(h*dpr))){ cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr); }
  return dpr;
}
function bookDrawCanvas(cv, art, t){
  const dpr = bookSizeCanvas(cv), c = cv.getContext("2d"); if(!c || !cv.clientWidth) return;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  bookArtDraw(c, art, cv.clientWidth, cv.clientHeight, t);
}
// Pantalla de carga: estado del juego mientras se lee (ASSET_LOAD, js/assets/preload.js).
function bookLoadStatus(el){
  const L = el.querySelector(".bk-load"); if(!L) return;
  let txt = "";
  try{ const c = ASSET_LOAD.core; txt = c.done >= c.total ? "El juego ya cargó. Seguí leyendo o saltá." : "Cargando el juego… " + Math.floor(c.done*100/Math.max(1, c.total)) + "%"; }catch(e){}
  if(L.textContent !== txt) L.textContent = txt;
}
function bookFrame(){
  if(!BOOK.open) return;
  const el = bookEl(), now = performance.now(), t = (now - BOOK.t0)/1000;
  // seguridad de cooperativo: lo automático nunca se queda sobre una sala o una partida
  if((BOOK.kind==="intro" || BOOK.kind==="short") && typeof codexBookCanAuto==="function" && !codexBookCanAuto()){ bookClose("net"); return; }
  for(const a of BOOK.auto) if(!a.done && now >= a.at){ a.done = true; a.fn(); if(!BOOK.open) return; }
  const P = BOOK.pages[BOOK.i];
  bookDrawCanvas(el.querySelector(".bk-art"), P.art, t);
  if(BOOK.flipping) bookDrawCanvas(el.querySelector(".bk-art2"), BOOK.backArt, (now - BOOK.flipT0)/1000);
  if(BOOK.boot) bookLoadStatus(el);
  const tm = el.querySelector(".bk-timer i"); if(tm && BOOK.kind==="short" && BOOK.dur) tm.style.width = Math.min(100, (now - BOOK.openedAt)/BOOK.dur*100) + "%";
  BOOK.raf = requestAnimationFrame(bookFrame);
}
function bookRender(){
  const el = bookEl(), P = BOOK.pages[BOOK.i], n = BOOK.pages.length;
  el.querySelector(".bk-right .bk-text").innerHTML = bookTextHtml(P);
  el.querySelector(".bk-pgl").textContent = "";
  el.querySelector(".bk-sign").textContent = typeof BOOK_NARRATOR_SIGN!=="undefined" ? BOOK_NARRATOR_SIGN : "";
  el.querySelector(".bk-pgr").textContent = n > 1 ? (BOOK.i + 1) + " / " + n : "";
  const dots = el.querySelector(".bk-dots"); dots.innerHTML = BOOK.pages.map((_, k)=>`<i class="${k===BOOK.i ? "on" : k < BOOK.i ? "done" : ""}"></i>`).join("");
  el.querySelector(".bk-prev").disabled = BOOK.i === 0;
  const nx = el.querySelector(".bk-next"); nx.textContent = BOOK.i >= n - 1 ? "✔" : "›"; nx.setAttribute("aria-label", BOOK.i >= n - 1 ? "Cerrar el libro" : "Página siguiente");
  el.querySelector(".bk-skip").textContent = BOOK.kind==="intro" || BOOK.kind==="short" ? "Saltar ▸▸" : "Cerrar ✕";
  el.dataset.kind = BOOK.kind; el.classList.toggle("bk-short", BOOK.kind==="short"); el.classList.toggle("bk-single", n < 2);
  BOOK.shownAt = performance.now();
}
// delta +1 = hojear hacia adelante, -1 = hacia atrás. `force`: los botones no esperan el freno anti-toque-apurado.
function bookGo(delta, force){
  if(!BOOK.open || BOOK.flipping) return;
  if(!force && performance.now() - BOOK.shownAt < (typeof BOOK_PAGE_MIN_MS!=="undefined" ? BOOK_PAGE_MIN_MS : 600)) return;
  const ni = BOOK.i + delta, n = BOOK.pages.length;
  if(ni < 0) return;
  if(ni >= n){ if(delta > 0) bookClose("end"); return; }
  const el = bookEl(), leaf = el.querySelector(".bk-leaf"), oldP = BOOK.pages[BOOK.i], newP = BOOK.pages[ni];
  if(typeof playSfx==="function") playSfx("ready");
  if(bookReducedMotion() || bookPortrait()){ BOOK.i = ni; BOOK.t0 = performance.now(); bookRender(); return; }
  BOOK.flipping = true; BOOK.flipDir = delta; BOOK.flipT0 = performance.now();
  const front = leaf.querySelector(".bk-front .bk-text");
  const done = ()=>{
    leaf.removeEventListener("transitionend", onEnd); clearTimeout(BOOK.flipTimer);
    leaf.classList.remove("on", "flip", "flipped", "notrans"); BOOK.flipping = false; BOOK.i = ni; BOOK.t0 = BOOK.flipT0; bookRender();
  };
  const onEnd = ev=>{ if(ev.target === leaf && ev.propertyName === "transform") done(); };
  leaf.classList.add("on");
  if(delta > 0){
    // la hoja de la derecha (con el texto viejo) se da vuelta y su dorso es la ilustración nueva
    front.innerHTML = bookTextHtml(oldP); BOOK.backArt = newP.art;
    el.querySelector(".bk-right .bk-text").innerHTML = bookTextHtml(newP);
    leaf.classList.remove("flipped"); void leaf.offsetWidth; leaf.classList.add("flip");
  } else {
    // hacia atrás: la hoja arranca en la izquierda (dorso = ilustración vieja) y cae a la derecha con el texto anterior
    front.innerHTML = bookTextHtml(newP); BOOK.backArt = oldP.art;
    BOOK.i = ni; // por debajo, la izquierda ya muestra la ilustración anterior
    leaf.classList.add("notrans", "flipped"); void leaf.offsetWidth; leaf.classList.remove("notrans"); void leaf.offsetWidth; leaf.classList.remove("flipped");
  }
  leaf.addEventListener("transitionend", onEnd);
  BOOK.flipTimer = setTimeout(done, 3000); // red de seguridad si el navegador no emite transitionend
}
function bookClose(reason){
  if(!BOOK.open) return;
  BOOK.open = false; BOOK.boot = false; cancelAnimationFrame(BOOK.raf); BOOK.auto.forEach(a=>{ a.done = true; });
  clearTimeout(BOOK.flipTimer); BOOK.flipping = false;
  const el = bookEl(); el.classList.add("hidden"); el.querySelector(".bk-leaf").classList.remove("on", "flip", "flipped", "notrans");
  document.body.classList.remove("book-open");
  const fn = BOOK.onEnd; BOOK.onEnd = null; const kind = BOOK.kind, shownMs = performance.now() - (BOOK.openedAt || performance.now());
  // llegar a la última página de la introducción = leída (omitirla solo la deja "vista")
  if((kind==="intro" || kind==="revisit") && BOOK.pages.length > 1 && (reason==="end" || BOOK.i >= BOOK.pages.length - 1) && typeof codexBookMarkIntroRead==="function") codexBookMarkIntroRead();
  try{ if(BOOK.prevFocus && BOOK.prevFocus.focus) BOOK.prevFocus.focus(); }catch(e){} BOOK.prevFocus = null;
  if(fn){ try{ fn(reason, kind, shownMs); }catch(err){ console.error("Libro: error al cerrar", err); } }
}
// Abre el visor. opts: {onEnd(reason), auto:[{at(ms), fn}], dur}.
function codexBookPlay(kind, pages, opts){
  opts = opts || {};
  if(BOOK.open || !pages || !pages.length) return false; // quien llama sigue su camino por su cuenta (nunca se llama dos veces a onEnd)
  const el = bookEl();
  try{ const g = document.getElementById("alpha-guide"); if(g && g.open) g.close(); }catch(e){} // la Guía del Hechicero (diálogo) no queda encima del Libro
  BOOK.open = true; BOOK.kind = kind; BOOK.pages = pages; BOOK.i = opts.startAt|0; BOOK.flipping = false; BOOK.onEnd = opts.onEnd || null; BOOK.dur = opts.dur || 0; BOOK.boot = !!opts.boot;
  BOOK.prevFocus = document.activeElement; BOOK.t0 = BOOK.openedAt = performance.now();
  const now = performance.now(); BOOK.auto = (opts.auto || []).map(a=>({at:now + a.at, fn:a.fn, done:false}));
  document.body.classList.add("book-open");
  el.classList.remove("hidden"); bookFit(); bookRender();
  const tm = el.querySelector(".bk-timer i"); if(tm) tm.style.width = "0%";
  if(typeof playSfx==="function") playSfx("ready");
  cancelAnimationFrame(BOOK.raf); BOOK.raf = requestAnimationFrame(bookFrame);
  try{ el.querySelector(kind==="short" ? ".bk-skip" : ".bk-next").focus({preventScroll:true}); }catch(e){}
  return true;
}

/* ---------------- los cuatro usos ---------------- */
// 1. Introducción: devuelve true si se hizo cargo de seguir con `next` (cuando termina o la saltean).
function codexBookMaybeIntro(next, opts){
  if(typeof codexBookIntroDue!=="function" || !codexBookIntroDue(opts)) return false;
  codexBookMarkIntro(); // omitir también cuenta como visto: si cierran el juego a mitad, no vuelve a aparecer sola
  let ok = false;
  try{ ok = codexBookPlay("intro", codexBookIntroPages(), {onEnd:()=>{ if(next) next(); }}); }catch(err){ console.error("No se pudo abrir el Libro:", err); ok = false; }
  return ok;
}
// PRIMER DESPLIEGUE: la primera vez que se abre el juego (instalación nueva: save.codexBook.introSeen falso) el Libro se lee sobre la
// pantalla de carga del título, desde la tapa, mientras bajan los scripts y el arte. No bloquea ni demora la carga: se saltea
// con Saltar/toque/Esc y, si la carga termina antes que la lectura, sigue abierto con el aviso "El juego ya cargó" (no se corta solo).
// Saltarlo = vista; llegar a la última página = leída (codexBookMarkIntroRead). Las veces siguientes no se repite: queda en
// Códice › El Libro. Ya no hay oferta "Leer el Libro / Después" al volver de la primera arena.
function codexBookBootDue(){
  try{
    if(typeof codexBookIntroDue!=="function" || !codexBookIntroDue({})) return false;
    if(typeof state!=="undefined" && state!=="title") return false;
    if(/[?&](room|cw|return)=/.test(location.search)) return false;                  // invitaciones y vueltas al hub: no se demora a nadie
    if(typeof navigator!=="undefined" && navigator.webdriver && !window.__codexBook) return false; // pruebas automáticas viejas: camino de siempre
  }catch(e){ return false; }
  return true;
}
let _cbBootTries = 0, _cbBooted = false;
function codexBookBoot(){
  if(_cbBooted || BOOK.open) return;
  // espera al guardado REAL (main.js → loadSave): antes `save` es el de fábrica y marcar la intro vista se perdería
  if(typeof state==="undefined" || typeof save==="undefined" || !save || typeof saveLoadStarted==="undefined" || !saveLoadStarted){ if(++_cbBootTries < 200) setTimeout(codexBookBoot, 50); return; }
  if(!codexBookBootDue()) return;
  _cbBooted = true;
  codexBookMarkIntro(); // omitir también cuenta como visto: si cierran el juego a mitad, no vuelve a aparecer sola
  try{ if(!codexBookPlay("intro", codexBookIntroPages(), {boot:true})) _cbBooted = false; }catch(err){ console.error("No se pudo abrir el Libro:", err); }
}
setTimeout(codexBookBoot, 0);
// Releer la introducción desde el Códice (siempre disponible).
function codexBookOpenIntro(onEnd){ return codexBookPlay("revisit", codexBookIntroPages(), {onEnd}); }
// 2. Fragmento de una arena (solo si la ganaste).
function codexBookOpenFragment(arena, onEnd, opts){
  if(!codexBookFragmentUnlocked(arena) && !(opts && opts.force)) return false;
  const pages = codexBookFragmentPages(arena); if(!pages) return false;
  codexBookMarkFragment(arena);
  return codexBookPlay("fragment", pages, {onEnd});
}
// 3. Carga corta: una página que se da vuelta sola (≈2,8 s). Devuelve true si se hizo cargo de seguir con `next(reason, ms)`:
// run-intro.js sigue con la partida al terminar (reason: auto | end | skip | esc).
function codexBookShort(arena, next){
  if(typeof codexBookShortDue!=="function" || !codexBookShortDue(arena)) return false;
  const one = codexBookShortPages(arena); if(!one) return false;
  codexBookShortMark(arena);
  const reduced = bookReducedMotion();
  const pages = reduced ? one : [{kicker:"LA HORDA", title:"", text:"", art:"tapa"}].concat(one);
  // ≈3 s; un texto más largo se queda un poco más (hasta 4,2 s). Siempre se saltea con un toque o Esc.
  const len = String((one[0] && one[0].text) || "").length, dur = (reduced ? 2200 : 3000) + Math.round(Math.max(0, Math.min(80, len - 90))*15);
  const ok = codexBookPlay("short", pages, {dur, onEnd:(reason, kind, shownMs)=>{ if(next) next(reason, shownMs); },
    auto:(reduced ? [] : [{at:380, fn:()=>bookGo(1, true)}]).concat([{at:dur, fn:()=>bookClose("auto")}])});
  return ok;
}
// Desde la victoria: botón [data-book-frag="arena"].
document.addEventListener("click", ev=>{
  const b = ev.target && ev.target.closest ? ev.target.closest("[data-book-frag],[data-book-intro]") : null; if(!b) return;
  ev.preventDefault(); ev.stopPropagation();
  const back = ()=>{ if(typeof state!=="undefined" && state==="codex" && typeof codexRender==="function") codexRender(); };
  if(b.hasAttribute("data-book-intro")) codexBookOpenIntro(back);
  else { const a = b.getAttribute("data-book-frag"); codexBookOpenFragment(a, back, {force:b.hasAttribute("data-book-force")}); }
}, true);

/* ---------------- avisos "NUEVO" ---------------- */
// Insignia sobre el botón CÓDICE del menú: la intro sin leer o un fragmento ganado sin abrir. Solo informa.
function codexBookBadgeSync(){
  const tile = document.getElementById("mainmenu-codex-btn"); if(!tile) return;
  let b = tile.querySelector(".cxb-new");
  const pending = typeof codexBookSave==="function" && codexBookUnread().length > 0 && !(typeof needsStarterChampion==="function" && needsStarterChampion());
  if(pending && !b){ b = document.createElement("span"); b.className = "cxb-new"; b.textContent = "NUEVO"; b.setAttribute("aria-label", "Libro nuevo en el Códice"); tile.appendChild(b); }
  else if(!pending && b) b.remove();
}

/* ---------------- Códice › El Libro ---------------- */
function codexBookListHtml(){
  const cb = codexBookSave(), unread = new Set(codexBookUnread());
  const intro = `<button class="cx-card cxb-card cxb-intro" data-book-intro><span class="cxb-ico">📖</span><span class="cxb-name">Introducción: El Libro de la Horda</span>
    <span class="cxb-sub">${cb.introSeen ? "La gran lectura de 8 páginas, escrita por el Hechicero. Releela cuando quieras." : "Todavía no la leíste. Es corta y se puede saltear."}</span>${cb.introSeen ? "" : '<span class="cxb-new">NUEVO</span>'}</button>`;
  const cards = ARENA_ORDER.filter(a=>BOOK_FRAGMENTS[a]).map(a=>{
    const F = BOOK_FRAGMENTS[a], open = codexBookFragmentUnlocked(a), num = typeof campaignNumberLabel==="function" ? campaignNumberLabel(a) : "";
    return open ? `<button class="cx-card cxb-card" data-book-frag="${a}"><span class="cxb-ico">✒</span><span class="cxb-name">${_bkEsc(F.title)}</span>
        <span class="cxb-sub">Arena ${_bkEsc(num)} · Aprendés: ${_bkEsc(F.topicTitle.toLowerCase())}</span>${unread.has(a) ? '<span class="cxb-new">NUEVO</span>' : ""}</button>`
      : `<div class="cx-card cxb-card locked"><span class="cxb-ico">🔒</span><span class="cxb-name">???</span><span class="cxb-sub">Arena ${_bkEsc(num)} · se abre al completarla</span></div>`;
  }).join("");
  const off = !!cb.shortOff;
  return `<div class="cx-list-head"><div class="cx-list-title">EL LIBRO · ${codexBookFragmentCount()} / ${Object.keys(BOOK_FRAGMENTS).length} fragmentos</div></div>
    <div class="cxb-grid">${intro}${cards}</div>
    <div class="cx-sec cxb-opts"><h3>Cargas</h3><div class="cx-dim">Antes de entrar a una arena de la campaña (en solitario) se da vuelta una página corta del Libro. Se puede saltear con un toque y no aparece en salas con amigos.</div>
      <button class="cx-btn" data-book-short>${off ? "Activar las páginas de carga" : "Desactivar las páginas de carga"}</button>
      <button class="cx-btn" data-book-reset>Que el Hechicero me vuelva a ofrecer la introducción</button></div>`;
}
document.addEventListener("click", ev=>{
  const b = ev.target && ev.target.closest ? ev.target.closest("[data-book-short],[data-book-reset]") : null; if(!b) return;
  if(b.hasAttribute("data-book-short")){ codexBookSetShortOff(!codexBookSave().shortOff); if(typeof codexRender==="function") codexRender(); }
  else { const cb = codexBookSave(); cb.introSeen = false; cb.introRead = false; cb.offered = false; if(typeof persist==="function") persist(); if(typeof showNetToast==="function") showNetToast("El Hechicero te vuelve a ofrecer la introducción al volver al menú."); }
}, true);
