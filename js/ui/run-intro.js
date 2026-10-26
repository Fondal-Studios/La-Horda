"use strict";
/* ============================================================
   js/ui/run-intro.js
   ENTRADA A LA ARENA. Secuencia estricta, sin superposición:
     página del Libro de la arena (carga corta, ≈3 s, saltable) → se cierra del todo → FICHA DE ARENA (solo novatos) → partida.
   La ficha es una tarjeta de interfaz neutra y sobria: objetivo, qué amenaza, qué ayuda y las celdas del briefing
   (js/ui/arena-briefing.js). Sin voz, retrato ni alas del Hechicero y sin frase de apertura: el Hechicero habla solo por el Libro
   (js/ui/codex/codex-book.js). Textos en js/data/arena-brief.js.
   Novato = la cuenta todavía no completó esa arena (runIntroNovice). Los veteranos entran directo y la tienen a pedido en
   Códice › Arenas y en la pausa › Ayuda. En cooperativo online no se muestra (bloquearía a los demás).
   Prólogo, misión y cartel de Acto I no se repiten a quien ya LEYÓ la introducción del Libro; la misión tampoco a quien terminó la práctica.
   ============================================================ */
// Aviso (solo texto, sin sistema que adjudique): "completar el juego" = vencer al Rey de la Horda en la Arena Infernal, la misma condición
// que abre a Aurelia (js/systems/ascension-unlocks.js). Mismo texto que la tarjeta de Campaña (#campaign-first-notice en index.html).
const FIRST_FINISH_NOTICE = "El primer jugador en completar el juego puede pedir un campeón con diseño propio.";
const RUN_INTRO = { open:false, t0:0, onGo:null, prologue:false, pages:[], arena:null, mission:false };
// Novato en esta arena: la cuenta todavía no la completó. Los veteranos no ven la ficha sola.
function runIntroNovice(arena){ return !(typeof save!=="undefined" && save && save.arenasCleared && save.arenasCleared[arena]); }
// ¿El Libro ya contó el prólogo y el Acto I? (leyó la introducción completa): la ficha no los vuelve a pasar.
function runIntroBookToldIntro(){ return typeof codexBookIntroRead==="function" && codexBookIntroRead(); }
function runIntroNeedsPrologue(arena){
  if(typeof save==="undefined" || save.storyPrologueSeen || typeof ARENA_ORDER==="undefined" || arena!==ARENA_ORDER[0] || typeof CAMPAIGN_PROLOGUE!=="string") return false;
  // hizo o saltó el entrenamiento: el prólogo no frena la entrada a la arena; queda entero en el Libro (Códice › El Libro)
  if(typeof tutorialDone==="function" && tutorialDone()){ if(typeof storyDeferPrologue==="function") storyDeferPrologue(); else { save.storyPrologueSeen = true; try{ if(typeof persist==="function") persist(); }catch(e){} } return false; }
  if(runIntroBookToldIntro()){ save.storyPrologueSeen = true; try{ if(typeof persist==="function") persist(); }catch(e){} return false; }
  return true;
}
function runIntroNeedsAct(arena){
  const act = typeof storyActOf==="function" ? storyActOf(arena) : null;
  if(!(act && act.arenas[0]===arena && typeof save!=="undefined" && !(save.storyActsSeen && save.storyActsSeen[act.n]))) return null;
  // Acto I: igual que el prólogo, con el entrenamiento hecho o saltado no frena la entrada (la ficha ya rotula "ACTO I · …")
  if(act.n==="I" && ((typeof tutorialDone==="function" && tutorialDone()) || runIntroBookToldIntro())){ save.storyActsSeen = save.storyActsSeen || {}; save.storyActsSeen[act.n] = 1; try{ if(typeof persist==="function") persist(); }catch(e){} return null; }
  return act;
}

// ¿Esta entrada va a mostrar pantallas de historia (prólogo, misión, cartel de acto)? No marca nada como visto, salvo lo que el
// Libro ya contó (intro leída: prólogo y Acto I quedan como vistos, ver runIntroNeedsPrologue / runIntroNeedsAct).
function runIntroHasStoryPages(arena){
  if(typeof save==="undefined") return false;
  if(runIntroNeedsPrologue(arena)) return true;
  if(typeof goalNeedsMission==="function" && goalNeedsMission()) return true;
  return !!runIntroNeedsAct(arena);
}
let _riBookGate = false; // true mientras la página corta del Libro está en pantalla (la continuación vuelve a entrar acá)
let _riNoBook = false;   // primera partida en solitario (JUGAR directo): la ficha es la ÚNICA pantalla, sin la página de carga del Libro
// Arranca la partida esperando, si hace falta, a que termine de bajar el arte de las arenas (preload.js).
function runIntroStartNow(onGo){
  if(typeof assetsAllReady==="function" && !assetsAllReady()){ if(typeof showNetToast==="function") showNetToast("Preparando la arena…"); whenAssetsReady(onGo); }
  else onGo();
}
function runIntroShow(arena, onGo, opts){
  if(opts && opts.first) _riNoBook = true;
  // un solo narrador a la vez: si el Libro está abierto (por ejemplo, abierto a mano desde otra pantalla), la ficha espera
  if(typeof narrationBookOpen==="function" && narrationBookOpen() && !_riBookGate){ narrationWhenFree(()=>runIntroShow(arena, onGo)); return; }
  // EL LIBRO DE LA HORDA: carga corta (una página que se da vuelta, ≈3 s, se saltea con un toque). Solo en solitario (esta
  // pantalla no se usa en salas), nunca encima de las pantallas de historia y como mucho 3 veces por arena (codex-narrative.js).
  if(!_riBookGate && !_riNoBook && ARENA_BRIEF[arena] && typeof codexBookShort==="function" && !runIntroHasStoryPages(arena)){
    _riBookGate = true;
    let took = false;
    // el Libro se cierra del todo antes de que aparezca la ficha: nunca están juntos en pantalla
    try{ took = codexBookShort(arena, ()=>{ setTimeout(()=>runIntroShow(arena, onGo), 0); }); }catch(err){ console.error("Libro: carga corta", err); took = false; }
    if(took) return;
  }
  _riBookGate = false; _riNoBook = false;
  const el = document.getElementById("run-intro"); const B = ARENA_BRIEF[arena];
  if(!el || !B){
    runIntroStartNow(onGo);
    return;
  }
  // Pantallas de historia antes de la ficha (con la partida todavía sin empezar, en vez de taparte la
  // pantalla en pleno combate): el PRÓLOGO la primera vez en la primera arena, y el cartel de cada ACTO
  // la primera vez que entrás a la arena que lo abre (STORY_ACTS, js/data/story-text.js).
  const pages = [];
  if(runIntroNeedsPrologue(arena)){
    save.storyPrologueSeen = true;
    pages.push(...(typeof CAMPAIGN_PROLOGUE_PAGES!=="undefined" ? CAMPAIGN_PROLOGUE_PAGES : [{who:"PRÓLOGO", title:"LA NOCHE EN QUE VOLVIÓ LA HORDA", text:CAMPAIGN_PROLOGUE}]));
  }
  if(typeof goalMissionPages==="function") pages.unshift(...goalMissionPages()); // misión: SOBREVIVIR, antes de la historia
  const act = runIntroNeedsAct(arena);
  if(act){
    save.storyActsSeen = save.storyActsSeen || {}; save.storyActsSeen[act.n] = 1;
    pages.push({who:"ACTO " + act.n, title:act.name, text:act.intro});
  }
  if(pages.length && typeof persist==="function") persist();
  // veterano (ya completó esta arena): entra directo, la ficha queda a pedido (Códice › Arenas, pausa › Ayuda)
  if(!pages.length && !runIntroNovice(arena)){ runIntroStartNow(onGo); return; }
  RUN_INTRO.pages = pages; RUN_INTRO.prologue = pages.length > 0;
  runIntroFill(el, arena, B);
  el.classList.remove("hidden");
  RUN_INTRO.open = true; RUN_INTRO.onGo = onGo; RUN_INTRO.t0 = performance.now(); RUN_INTRO.arena = arena;
  if(typeof playSfx==="function") playSfx("ready");
}
function runIntroFill(el, arena, B){
  const M = ARENA_MODS[arena] || {};
  const pro = !!RUN_INTRO.prologue;
  el.classList.toggle("ri-prologue", pro);
  const go = el.querySelector(".ri-go");
  go.textContent = pro ? "SEGUIR ▸" : "¡A LA BATALLA!"; go.disabled = false;
  // todavía baja el arte de las arenas: el botón lo dice y se habilita solo al terminar
  if(!pro && typeof assetsAllReady==="function" && !assetsAllReady()){
    go.disabled = true; go.textContent = "Preparando la arena… " + assetsRestPct() + "%";
    whenAssetsReady(()=>{ if(!RUN_INTRO.prologue){ go.disabled = false; go.textContent = "¡A LA BATALLA!"; } },
      pct=>{ if(!RUN_INTRO.prologue && go.disabled) go.textContent = "Preparando la arena… " + pct + "%"; });
  }
  const tap = el.querySelector(".ri-tap"); if(tap) tap.textContent = pro ? "tocá para seguir" : "tocá ¡A LA BATALLA! para empezar";
  // "Saltar ▸▸" (arriba a la izquierda, sobre el arte): con la historia en pantalla, un toque lleva directo a la
  // ficha de la arena (primer arranque corto)
  let skip = el.querySelector(".ri-skip");
  if(!skip){
    skip = document.createElement("button"); skip.type = "button"; skip.className = "btn secondary small ri-skip"; skip.textContent = "Saltar ▸▸";
    skip.addEventListener("click", ev=>{
      ev.stopPropagation(); if(!RUN_INTRO.open) return;
      if(RUN_INTRO.prologue){
        RUN_INTRO.pages = []; RUN_INTRO.prologue = false; RUN_INTRO.t0 = performance.now();
        runIntroFill(el, RUN_INTRO.arena, ARENA_BRIEF[RUN_INTRO.arena]);
      } else runIntroGo(true); // en la ficha de la arena, "Saltar" empieza la partida (sin la demora anti-toque apurado)
    });
    (el.querySelector(".ri-card") || el).appendChild(skip); // dentro de la tarjeta (arriba a la derecha): no pisa el texto en celular apaisado
  }
  // visible en TODAS las páginas desde el primer toque (antes solo en las de historia y recién cuando terminaba el fundido de entrada)
  skip.setAttribute("aria-label", pro ? "Saltar la historia" : "Saltar y empezar la partida");
  skip.classList.remove("hidden");
  const who = el.querySelector(".ri-who"), hero = runIntroHeroEl(el), actEl = el.querySelector(".ri-act");
  // carteles en mayúsculas CON tilde: la fuente pixel no trae ÁÉÍÓÚ (pixel-font-fix.js las pasaba a "MISION", "PROLOGO")
  for(const q of [who, actEl, el.querySelector(".ri-arena")]) if(q) q.classList.add("keep-accents");
  if(pro){
    const P = RUN_INTRO.pages[0];
    if(who) who.textContent = P.who;
    el.querySelector(".ri-arena").textContent = P.title;
    const sayP = el.querySelector(".ri-say"); sayP.textContent = P.text; sayP.style.display = "";
    hero.textContent = ""; hero.style.display = "none"; if(actEl) actEl.textContent = "";
    return;
  }
  if(who) who.textContent = "FICHA DE ARENA";
  // en qué acto de la historia estás, y lo que dice tu guardián al entrar (HERO_VOICES, story-text.js)
  const act = typeof storyActOf==="function" ? storyActOf(arena) : null;
  if(actEl) actEl.textContent = act ? "ACTO " + act.n + " · " + act.name : "";
  const HV = typeof HERO_VOICES!=="undefined" && typeof selectedClass!=="undefined" ? HERO_VOICES[selectedClass] : null;
  const cls = typeof CLASSES!=="undefined" && typeof selectedClass!=="undefined" ? CLASSES[selectedClass] : null;
  if(HV && HV.pick && cls){ hero.innerHTML = ""; const b = document.createElement("b"); b.textContent = cls.name; b.style.color = cls.color || ""; hero.appendChild(b); hero.appendChild(document.createTextNode(" «" + HV.pick + "»")); hero.style.display = ""; }
  else { hero.textContent = ""; hero.style.display = "none"; }
  el.querySelector(".ri-arena").textContent = (M.icon ? M.icon + " " : "") + (typeof campaignNumberLabel==="function" && campaignNumberLabel(arena) ? campaignNumberLabel(arena) + " — " : "") + (M.label || arena).toUpperCase();
    const sayEl = el.querySelector(".ri-say"); sayEl.textContent = ""; sayEl.style.display = "none"; // sin frase de apertura ni voz del narrador
  el.querySelector(".ri-kill").textContent = B.kill;
  el.querySelector(".ri-help").textContent = B.help;
  // "SOBREVIVÍ…" se explica una sola vez: en el entrenamiento (o, si lo saltó, en esta ficha: queda marcado al empezar la partida)
  const teach = !(typeof goalMissionTaught==="function" && goalMissionTaught());
  RUN_INTRO.mission = teach;
  el.querySelector(".ri-goal").textContent = (teach && !/^Sobreviv/.test(B.goal) ? "SOBREVIVÍ: aguantá 10 niveles con vida. " : "") + B.goal;
  const first = el.querySelector(".ri-first");
  if(first){ first.hidden = arena !== "infernal"; first.textContent = arena === "infernal" ? "🏆 " + FIRST_FINISH_NOTICE : ""; }
  const cr = el.querySelector(".ri-crystals");
  if(cr){ const show = typeof crystalRowHtml==="function" && (crystalsOwned().length > 0 || CRYSTAL_BY_ARENA[arena] || arena==="infernal"); cr.innerHTML = show ? crystalRowHtml() + (typeof resonancePickerHtml==="function" ? '<div class="res-wrap">' + resonancePickerHtml() + '</div>' : "") : ""; if(show && typeof resonanceBindPicker==="function") resonanceBindPicker(cr); cr.style.display = show ? "" : "none"; }
}
// Línea del guardián elegido y rótulo del acto (se crean una vez dentro de la tarjeta de la ficha).
function runIntroHeroEl(el){
  let h = el.querySelector(".ri-hero");
  if(!h){
    h = document.createElement("div"); h.className = "ri-hero";
    const say = el.querySelector(".ri-say"); say.parentNode.insertBefore(h, say.nextSibling);
    const a = document.createElement("div"); a.className = "ri-act";
    const ar = el.querySelector(".ri-arena"); ar.parentNode.insertBefore(a, ar);
  }
  return h;
}
function runIntroGo(force){
  if(!RUN_INTRO.open) return;
  if(force!==true && performance.now() - RUN_INTRO.t0 < 450) return; // un toque apurado del botón "Comenzar" no la saltea
  if(RUN_INTRO.prologue){ // pantalla de historia → la siguiente, y al final la ficha de la arena
    RUN_INTRO.pages.shift(); RUN_INTRO.prologue = RUN_INTRO.pages.length > 0; RUN_INTRO.t0 = performance.now();
    runIntroFill(document.getElementById("run-intro"), RUN_INTRO.arena, ARENA_BRIEF[RUN_INTRO.arena]);
    return;
  }
  if(typeof assetsAllReady==="function" && !assetsAllReady()) return; // "Preparando la arena…"
  RUN_INTRO.open = false;
  if(RUN_INTRO.mission && typeof save!=="undefined" && save){ save.tut = save.tut || {}; save.tut.goalMission = 1; try{ if(typeof persist==="function") persist(); }catch(e){} } // la misión ya se dijo: HUD y Hechicero no la repiten
  RUN_INTRO.mission = false;
  document.getElementById("run-intro").classList.add("hidden");
  const fn = RUN_INTRO.onGo; RUN_INTRO.onGo = null; if(fn) fn();
}
(()=>{
  const el = document.getElementById("run-intro"); if(!el) return;
  el.addEventListener("click", (e)=>{ // en la ficha larga, deslizar/tocar el texto NO empieza la partida: solo el botón (o el fondo)
    if(!RUN_INTRO.prologue && e.target.closest && e.target.closest(".ri-card") && !e.target.closest(".ri-go")) return;
    runIntroGo();
  });
  document.addEventListener("keydown", (e)=>{ if(RUN_INTRO.open && (e.key==="Enter" || e.key===" ")) runIntroGo(); });
})();
