"use strict";
/* ============================================================
   js/systems/codex-narrative.js
   EL CÓDICE COMO EJE NARRATIVO — lógica de disparo, omisión y persistencia del Libro de la Horda.
   NARRADOR: el Hechicero Supremo (el Libro es su voz escrita). Mientras el Libro está abierto, él no habla en ningún otro
   lado (panel de consejos, voces de la historia, ficha previa, relato del primer minuto): ver "UN SOLO NARRADOR A LA VEZ" abajo.
   Sin DOM: solo lee/escribe save.codexBook y decide cuándo toca mostrar algo. Los textos están en
   js/data/codex-book-text.js y el visor animado en js/ui/codex/codex-book.js.

   Qué se muestra y cuándo (todo es local, nunca viaja por la red):
     1. INTRODUCCIÓN grande (8 páginas): ya NO se abre antes de jugar. Se OFRECE una sola vez al volver al menú después de la
        primera arena (victoria o derrota): "Leer el Libro" o "Después" (codexBookOffer, js/ui/codex/codex-book.js). Si dice
        "Después" queda siempre en Códice › El Libro. Antes (PR "primer minuto") se abría tras elegir guardián, o sea
        8 páginas de lectura antes de tocar un botón de juego.
     2. FRAGMENTOS: uno por arena de la campaña, se ganan al completarla y aparecen en la pantalla de
        victoria (story.js); quedan siempre releíbles en Códice › El Libro.
     3. CARGA CORTA: una página de libro antes de entrar a una arena de campaña en solitario
        (run-intro.js), como mucho BOOK_SHORT_MAX veces por arena, apagable.
   Reglas que no se rompen:
     - NUNCA bloquea: siempre hay "Saltar", Esc o tocar; omitir cuenta como visto.
     - Nunca arranca por sí sola dentro de una sala/partida online ni jugando (no frena a nadie).
     - Todo se puede revisitar desde el Códice.
   Guardado: save.codexBook = {v, introSeen, introAt, introRead, ran, offered, frag:{arena:ts}, shortCount:{arena:n}, shortOff}.
   ran = ya terminó una partida (victoria o derrota); offered = ya se le ofreció el Libro (no se repite);
   introRead = llegó a la última página de la introducción (saltearla es "visto", pero no "leído": solo lo leído hace que la
   ficha de la primera arena no repita prólogo, misión ni cartel del Acto I). Campo nuevo: los guardados sin él migran a false.
   Guardados anteriores: ver codexBookMigrate (no pierde nada; quien ya tenía campeón no ve la intro
   a la fuerza, y las arenas ya superadas quedan como fragmentos "leídos" pero releíbles).
   ============================================================ */
const CODEX_BOOK_V = 1;
const BOOK_SHORT_MAX = 3;      // veces que la carga corta se muestra sola por arena
const BOOK_PAGE_MIN_MS = 600;  // un toque apurado no saltea una página sin leer (el botón Saltar sí corta)

function codexBookDefault(){ return {v:CODEX_BOOK_V, introSeen:false, introAt:0, introRead:false, ran:false, offered:false, frag:{}, shortCount:{}, shortOff:false}; }
function _cbObj(o){ return o && typeof o==="object" && !Array.isArray(o) ? o : {}; }
// Normaliza lo que haya guardado (o nada) sin perder campos desconocidos. `raw` = el guardado leído del disco.
function codexBookMigrate(raw){
  raw = _cbObj(raw);
  const cur = raw.codexBook;
  if(cur && typeof cur==="object"){
    const out = Object.assign(codexBookDefault(), cur);
    out.v = CODEX_BOOK_V; out.introSeen = !!out.introSeen; out.introAt = +out.introAt || 0; out.introRead = !!out.introRead; out.shortOff = !!out.shortOff; out.ran = !!out.ran; out.offered = !!out.offered;
    out.frag = Object.assign({}, _cbObj(cur.frag));
    out.shortCount = {}; const sc = _cbObj(cur.shortCount); for(const k in sc) out.shortCount[k] = Math.max(0, sc[k]|0);
    return out;
  }
  // Guardado de antes del Libro: no se fuerza la gran introducción a quien ya tiene guardián o ya jugó.
  const out = codexBookDefault();
  const champs = _cbObj(raw.champions);
  const hasChamp = !!raw.starterChosen || Object.keys(champs).some(k=>champs[k] && champs[k].unlocked);
  const cleared = _cbObj(raw.arenasCleared);
  out.introSeen = hasChamp || Object.keys(cleared).some(a=>cleared[a]);
  // las arenas que ya superó cuentan como fragmentos ya "vistos" (siguen releíbles en el Códice)
  for(const a of Object.keys(cleared)) if(cleared[a] && typeof BOOK_FRAGMENTS!=="undefined" && BOOK_FRAGMENTS[a]) out.frag[a] = 1;
  return out;
}
function codexBookSave(){
  if(typeof save==="undefined" || !save) return codexBookDefault();
  const cb = save.codexBook;
  if(!cb || typeof cb!=="object" || cb.v!==CODEX_BOOK_V || typeof cb.frag!=="object" || !cb.frag || typeof cb.shortCount!=="object" || !cb.shortCount)
    save.codexBook = codexBookMigrate({codexBook:cb});
  return save.codexBook;
}
function _cbPersist(){ try{ if(typeof persist==="function") persist(); }catch(e){} }

// Las pruebas automáticas viejas (navigator.webdriver) siguen el camino de antes, sin libro por iniciativa propia: igual que el
// regalo inicial (starter-gift.js) y el primer arranque. Las que miden el libro definen window.__codexBook = true (o __firstRun / ?primera=1).
function codexBookAutoEnabled(){
  try{
    if(typeof window==="undefined") return true;
    if(window.__codexBook===false) return false;
    if(window.__codexBook) return true;
    if(window.__firstRun || (typeof location!=="undefined" && /[?&]primera=1\b/.test(location.search))) return true;
    return !(typeof navigator!=="undefined" && navigator.webdriver);
  }catch(e){ return true; }
}
// ¿Se puede mostrar algo por iniciativa propia? No dentro de una sala/partida ni en modos que no usan el guardado real.
function codexBookCanAuto(){
  if(!codexBookAutoEnabled()) return false;
  try{
    if(typeof state!=="undefined" && (state==="playing" || state==="paused")) return false;
    if(typeof netInRoom==="function" && netInRoom()) return false;
    if(typeof netMatch!=="undefined" && netMatch) return false;
    if(typeof lanesOn==="function" && lanesOn()) return false;
    if(typeof testLabActive==="function" && testLabActive()) return false;
    if(narrationOtherOpen()) return false; // otra capa de historia en pantalla: el Libro espera, no se pisa con ella
  }catch(e){ return false; }
  return true;
}

/* ---------------- UN SOLO NARRADOR A LA VEZ ---------------- */
// El Hechicero habla por varias capas: el Libro (escrito), la ficha previa de cada arena y sus pantallas de historia
// (run-intro.js), el relato del primer minuto (first-minute.js), el cuadro de consejos y voces (tutorial.js / story.js),
// el epílogo (story.js) y el tutorial de práctica (alpha-training.js). Regla: nunca dos a la vez.
//   - Con el Libro abierto, las demás no abren: esperan a que cierre (narrationWhenFree) o se descartan si son efímeras.
//   - Con otra capa de historia a pantalla completa, el Libro por iniciativa propia (intro, carga corta, oferta) espera.
//   - Lo que el Libro ya contó no se repite en las otras (ver run-intro.js y goal-guide.js).
// Solo lee estado; sin DOM propio. En cooperativo el Libro nunca abre, así que ninguna de estas esperas aplica ahí.
function narrationBookOpen(){ return typeof BOOK!=="undefined" && !!BOOK.open; }
// ¿Hay una capa de historia a pantalla completa distinta del Libro? (la ficha previa, el epílogo, el relato del primer minuto o el tutorial)
function narrationOtherOpen(){
  try{
    if(typeof RUN_INTRO!=="undefined" && RUN_INTRO.open) return true;
    if(typeof STORY_CINE!=="undefined" && STORY_CINE.open) return true;
    if(typeof ALPHA_TRAINING!=="undefined" && ALPHA_TRAINING.active) return true;
    if(typeof document!=="undefined" && document.getElementById("first-story")) return true;
  }catch(e){}
  return false;
}
// Corre fn cuando el Libro se cierre (o tras maxMs, para no colgar nunca el flujo). Si ya está cerrado, corre al toque.
function narrationWhenFree(fn, maxMs){
  if(!narrationBookOpen()){ fn(); return; }
  const t0 = performance.now(), lim = maxMs || 20000;
  const tick = ()=>{ if(!narrationBookOpen() || performance.now() - t0 > lim) fn(); else setTimeout(tick, 200); };
  setTimeout(tick, 200);
}

/* ---------------- 1. introducción ---------------- */
// Las páginas que repetirían el prólogo de la Ciudad (ya visto en la ficha previa) salen en su versión `recap`: mismas 8 páginas, sin repetir.
function codexBookIntroPages(){
  const pro = typeof save!=="undefined" && !!(save && save.storyPrologueSeen);
  return BOOK_INTRO_PAGES.map(p=>{ const o = Object.assign({}, p); delete o.recap; if(pro && p.recap) o.text = p.recap; return o; });
}
// opts.joinsRoom: el flujo que sigue es entrar a la sala de otro: no se demora a nadie, queda para el Códice.
function codexBookIntroDue(opts){
  if(codexBookSave().introSeen) return false;
  if(opts && opts.joinsRoom) return false;
  return codexBookCanAuto();
}
// OFERTA tras la primera arena: toca si no vio la intro, no se le ofreció todavía y ya terminó una partida.
function codexBookOfferDue(){
  const cb = codexBookSave();
  if(cb.introSeen || cb.offered || !cb.ran) return false;
  if(typeof state!=="undefined" && state!=="mainmenu") return false;
  return codexBookCanAuto();
}
function codexBookMarkRan(){ const cb = codexBookSave(); if(cb.ran) return; cb.ran = true; _cbPersist(); }
function codexBookMarkIntro(){
  const cb = codexBookSave(); if(cb.introSeen) return;
  cb.introSeen = true; cb.introAt = Date.now(); _cbPersist();
}
// Llegó a la última página (intro automática o releída desde el Códice).
function codexBookMarkIntroRead(){
  const cb = codexBookSave(); if(cb.introRead) return;
  cb.introRead = true; if(!cb.introSeen){ cb.introSeen = true; cb.introAt = Date.now(); } _cbPersist();
}
function codexBookIntroRead(){ return !!codexBookSave().introRead; }

/* ---------------- 2. fragmentos ---------------- */
function codexBookHasFragment(arena){ return typeof BOOK_FRAGMENTS!=="undefined" && !!BOOK_FRAGMENTS[arena]; }
function codexBookFragmentUnlocked(arena){
  return codexBookHasFragment(arena) && !!(typeof save!=="undefined" && save.arenasCleared && save.arenasCleared[arena]);
}
function codexBookFragmentPages(arena){
  const F = codexBookHasFragment(arena) ? BOOK_FRAGMENTS[arena] : null; if(!F) return null;
  const num = typeof campaignNumberLabel==="function" ? campaignNumberLabel(arena) : "";
  const pages = [
    {kicker:"FRAGMENTO" + (num ? " · ARENA " + num : ""), title:F.title, text:F.lore, art:"arena:" + arena},
    {kicker:"LO QUE TE ENSEÑO", title:F.topicTitle, text:F.lesson, art:F.topicArt}
  ];
  return pages.concat((F.extra || []).map(p=>Object.assign({}, p)));
}
function codexBookFragmentSeen(arena){ return !!codexBookSave().frag[arena]; }
function codexBookMarkFragment(arena){
  if(!codexBookHasFragment(arena)) return;
  const cb = codexBookSave(); if(cb.frag[arena] && cb.frag[arena]!==1) return;
  cb.frag[arena] = Date.now(); _cbPersist();
}
// Fragmentos ya ganados y todavía sin abrir (insignia "NUEVO" en el Códice). Los de saves viejos (valor 1) no cuentan.
function codexBookUnread(){
  const cb = codexBookSave();
  return Object.keys(BOOK_FRAGMENTS).filter(a=>codexBookFragmentUnlocked(a) && !cb.frag[a]);
}
function codexBookFragmentCount(){ return Object.keys(BOOK_FRAGMENTS).filter(codexBookFragmentUnlocked).length; }

/* ---------------- 3. carga corta ---------------- */
function codexBookShortPages(arena){
  const line = typeof BOOK_SHORT_LINES!=="undefined" ? BOOK_SHORT_LINES[arena] : null; if(!line) return null;
  const num = typeof campaignNumberLabel==="function" ? campaignNumberLabel(arena) : "";
  const label = (typeof ARENA_MODS!=="undefined" && ARENA_MODS[arena] && ARENA_MODS[arena].label) || arena;
  return [{kicker:num ? "ARENA " + num : "ARENA", title:String(label).toUpperCase(), text:line, art:"arena:" + arena}];
}
function codexBookShortDue(arena){
  const cb = codexBookSave();
  if(cb.shortOff || !BOOK_SHORT_LINES[arena]) return false;
  if(typeof endlessOn==="function" && endlessOn()) return false;
  if(typeof divinaMode!=="undefined" && divinaMode) return false;
  if((cb.shortCount[arena]|0) >= BOOK_SHORT_MAX) return false;
  return codexBookCanAuto();
}
function codexBookShortMark(arena){ const cb = codexBookSave(); cb.shortCount[arena] = (cb.shortCount[arena]|0) + 1; _cbPersist(); }
function codexBookSetShortOff(off){ codexBookSave().shortOff = !!off; _cbPersist(); }

/* ---------------- cobertura: ¿el recorrido enseña todo? ---------------- */
// Devuelve los temas cubiertos por los fragmentos de las arenas de la campaña y los que faltan.
function codexBookCoverage(){
  const topics = Object.keys(BOOK_FRAGMENTS).map(a=>BOOK_FRAGMENTS[a].topic);
  return {topics, missing:BOOK_REQUIRED_TOPICS.filter(t=>!topics.includes(t))};
}
