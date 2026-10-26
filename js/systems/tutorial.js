"use strict";
/* ============================================================
   js/systems/tutorial.js
   INDICACIONES DE INTERFAZ Y CUADRO DE VOZ DE LA PARTIDA.

   El Hechicero NO habla en la partida: su única voz es el Libro de la Horda (js/ui/codex/codex-book.js). Este cuadro
   (un cuadro chico abajo, sin bloquear nada) solo muestra, sin retrato ni nombre (data-face="none"):
   - Indicaciones neutras de interfaz, una vez por perfil (save.tut[concepto]): moverse -> atacar -> habilidad (primera
     partida, si no hizo el entrenamiento), el "+" para mejorar una habilidad y el botón de revivir al primer caído.
   - Las voces de otros personajes (jefes, Guardianes, Crónicas; js/systems/story.js, con `who`) y el jefe final de la
     Arena Infernal (TUT_VILLAIN: es historia, no un consejo).
   Todo lo demás que las arenas pedían decir con tutSay() (qué te mata, qué te ayuda, objetivo, lecciones) ya no se dice:
   tutSay lo descarta (ver TUT_NEUTRAL). Esa información está a pedido en Códice › Arenas y en la pausa › Ayuda.
   Cada cliente tiene el suyo (en cooperativo, cada jugador ve sus propias indicaciones).
   ============================================================ */
const TUT = { key:null, until:0, goal:null, basicsStep:0, moved:0, lx:null, ly:null, k0:0, r0:0, reviveAt:0,
  ducked:false, duckUntil:0, duckSpent:0, lastTick:0, rect:null };
// El cuadro se AGACHA (se hace invisible) mientras te pegan o si el guardián le queda encima, y vuelve
// solo después, con el mismo texto y el tiempo que le quedaba (reseña #10: en el teléfono tapaba la
// pelea). Tope por línea: pasado TUT_DUCK_MAX_MS escondido se muestra igual, para no perderla nunca.
const TUT_DUCK_MS = 2200, TUT_DUCK_MAX_MS = 6000;
const TUT_NO_DUCK = {hurt:1, revive:1}; // indicaciones que hablan justo de eso: se ven aunque te estén pegando
// Lo único que se muestra sin `who`: controles y acciones (neutras, sin voz del Hechicero) y el jefe final de la Infernal.
const TUT_NEUTRAL = {b_move:1, b_attack:1, b_skill:1, b_end:1, skillup:1, revive:1};
const TUT_VILLAIN = {hech_betrayal:1, hech_final:1};
function tutFlags(){ if(!save.tut) save.tut = {}; return save.tut; }
// Las claves que empiezan con "~" son líneas de una sola vez en ESTA partida (voces de la historia,
// js/systems/story.js): nunca se guardan como vistas.
function tutSeen(key){ return key.charAt(0)!=="~" && !!tutFlags()[key]; }
function tutMark(key){ if(key.charAt(0)!=="~" && !tutSeen(key)){ tutFlags()[key] = 1; persist(); } }
// Muestra una indicación (si ese concepto no se mostró todavía). Sin `who`, solo las neutras (TUT_NEUTRAL) y las del jefe final. `goal` = el objetivo
// concreto ("Mantené ✚..."). `ms` = cuánto queda si nadie lo cumple (después se da por visto).
// `urgent` = pasa por encima de un consejo que se esté mostrando (p.ej. revivir a un caído).
// `who` = quién habla, si no es el Hechicero: {name, face} (voces de la historia, story.js). El retrato
// cambia con data-face (css/story.css).
function tutSay(key, text, goal, ms, urgent, who){
  if(typeof narrationBookOpen==="function" && narrationBookOpen()) return false; // con el Libro abierto (su voz escrita) no se superpone nada
  if(!who && !TUT_NEUTRAL[key] && !TUT_VILLAIN[key]) return false; // el Hechicero no aconseja en la partida: consejos de arena y de combate descartados
  if(tutSeen(key) || (!urgent && TUT.key && TUT.key!==key && performance.now() < TUT.until - 1500)) return false;
  if(urgent && TUT.key && TUT.key!==key && !TUT.key.startsWith("b_")) tutMark(TUT.key); // el que se tapa se da por visto
  const el = document.getElementById("tut-panel"); if(!el) return false;
  const compact = typeof hudCompact==="function" && hudCompact();
  el.querySelector(".tut-text").textContent = compact ? hudShortText(text, innerWidth < 760 ? 72 : 104) : text; // celular apaisado: 1-2 renglones
  el.classList.remove("ghost"); clearTimeout(el._ghostT);
  if(compact) el._ghostT = setTimeout(()=>el.classList.add("ghost"), 5500); // se desvanece solo; el objetivo sigue vigente en el juego
  const neutral = !who && !!TUT_NEUTRAL[key];
  const wh = el.querySelector(".tut-who"); if(wh) wh.textContent = neutral ? "" : (who && who.name ? who.name : "EL HECHICERO SUPREMO");
  el.dataset.face = neutral ? "none" : (who && who.face ? who.face : "hech");
  const g = el.querySelector(".tut-goal"); g.textContent = goal ? "▶ " + goal : ""; g.classList.remove("done");
  el.classList.remove("hidden", "show", "duck"); void el.offsetWidth; el.classList.add("show");
  TUT.key = key; TUT.goal = goal || null; TUT.until = performance.now() + (ms || 9000);
  TUT.ducked = false; TUT.duckSpent = 0; TUT.rect = _tutRect(el);
  return true;
}
function _tutRect(el){ try{ const r = el.getBoundingClientRect(); return r.width ? {l:r.left, t:r.top, r:r.right, b:r.bottom} : null; }catch(e){ return null; } }
// Lo llama registerPlayerHurt (feedback.js), en el anfitrión y en el invitado.
function tutDuck(){
  if(!TUT.key || TUT_NO_DUCK[TUT.key] || TUT.duckSpent >= TUT_DUCK_MAX_MS) return;
  TUT.duckUntil = performance.now() + TUT_DUCK_MS;
  if(!TUT.ducked){ TUT.ducked = true; const el = document.getElementById("tut-panel"); if(el) el.classList.add("duck"); }
}
// ¿El guardián (en pantalla) queda debajo del cuadro? (p.ej. con la cámara levantada por la Madre Espora)
function _tutOverHero(){
  const R = TUT.rect; if(!R || !player || typeof worldToScreen!=="function") return false;
  const cr = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : {left:0, top:0};
  const s = worldToScreen(player.x, player.y), hx = s.x + cr.left, hy = s.y + cr.top, head = 70*CAM_ZOOM;
  return hx > R.l - 24 && hx < R.r + 24 && hy + 8 > R.t && hy - head < R.b;
}
function _tutDuckTick(now){
  const dt = TUT.lastTick ? Math.min(250, now - TUT.lastTick) : 0; TUT.lastTick = now;
  if(!TUT.key) return;
  if(!TUT.ducked && TUT.duckSpent < TUT_DUCK_MAX_MS && !TUT_NO_DUCK[TUT.key] && _tutOverHero()){ TUT.duckUntil = now + 400; TUT.ducked = true; const el = document.getElementById("tut-panel"); if(el) el.classList.add("duck"); }
  if(!TUT.ducked) return;
  TUT.until += dt; TUT.duckSpent += dt; // escondido no corre su tiempo
  if(TUT.duckSpent >= TUT_DUCK_MAX_MS || (now > TUT.duckUntil && !_tutOverHero())){
    TUT.ducked = false; const el = document.getElementById("tut-panel"); if(el) el.classList.remove("duck");
  }
}
// El jugador hizo lo que se pedía: tilde, se guarda y se va.
function tutDone(key){
  tutMark(key);
  if(TUT.key!==key) return;
  const el = document.getElementById("tut-panel"); if(!el) return;
  const g = el.querySelector(".tut-goal"); if(TUT.goal){ g.textContent = "✓ " + TUT.goal; g.classList.add("done"); }
  TUT.until = Math.min(TUT.until, performance.now() + 1300);
}
function tutHide(){
  const el = document.getElementById("tut-panel");
  if(el){ el.classList.remove("show", "duck"); el.classList.add("hidden"); }
  TUT.ducked = false; TUT.rect = null;
  if(TUT.key && !TUT.goal) tutMark(TUT.key); // los consejos sin objetivo se dan por vistos al mostrarse
  TUT.key = null; TUT.goal = null;
}
// objetivo de los básicos según con qué se juega (táctil / teclado / mando): js/core/input-desk.js
function _ctl(kind, fallback){ return (typeof ctlHint==="function" && ctlHint(kind)) || fallback; }
function tutReset(){ TUT.basicsStep = 0; TUT.moved = 0; TUT.lx = null; TUT.k0 = 0; TUT.r0 = 0; tutHide(); }
// Cada cuadro desde updateHUD (anfitrión e invitado).
function tutTick(){
  if(typeof lanesOn==="function" && lanesOn()){ if(TUT.key) tutHide(); return; } // Guerra de Cristales: sin consejos del Hechicero
  if(state!=="playing" || !player){ if(TUT.key) tutHide(); return; }
  if(TUT.run !== runStats){ TUT.run = runStats; tutReset(); } // partida nueva
  const now = performance.now();
  _tutDuckTick(now);
  if(TUT.key && now > TUT.until){
    // un objetivo básico que nadie cumplió queda pendiente (vuelve a aparecer), el resto se da por visto
    if(!TUT.key.startsWith("b_")) tutMark(TUT.key);
    tutHide();
  }
  const st = player.stats || {};
  // ---- básicos, en orden, en la primera partida ----
  // Si ya hizo o saltó el entrenamiento (save.tut.training / trainingSkipped, js/systems/alpha-training.js) los básicos no se enseñan
  // otra vez dentro de la arena (antes: segundo tutorial "movete / atacá / habilidad" + "tu misión es SOBREVIVIR").
  if(!tutSeen("basics") && typeof tutorialDone==="function" && tutorialDone()){ const f = tutFlags(); f.basics = f.b_move = f.b_attack = f.b_skill = 1; if(f.training===1) f.cooldown = 1; /* ya lo practicó (paso "Recarga") */ persist(); }
  if(!tutSeen("basics")){
    if(TUT.lx===null){ TUT.lx = player.x; TUT.ly = player.y; TUT.k0 = st.kills||0; }
    TUT.moved += Math.hypot(player.x-TUT.lx, player.y-TUT.ly); TUT.lx = player.x; TUT.ly = player.y;
    if(!tutSeen("b_move")){
      if(!TUT.key) tutSay("b_move", "Primero, movete.", _ctl("move", "Movete con el joystick"), 14000);
      if(TUT.moved > 260) tutDone("b_move");
    } else if(!tutSeen("b_attack")){
      if(!TUT.key) tutSay("b_attack", "Mantené apretado Ataque: tu guardián golpea solo al enemigo más cercano.", _ctl("attack", "Mantené Ataque para pelear"), 16000);
      if((st.kills||0) > TUT.k0) tutDone("b_attack");
    } else if(!tutSeen("b_skill")){
      if(!TUT.key) tutSay("b_skill", "Tus habilidades pegan mucho más fuerte que el ataque. Tocá una; si la mantenés, podés apuntarla.", _ctl("skill", "Tocá una habilidad (mantené y arrastrá para apuntar)"), 16000);
      if(player.cds && player.cds.some(c=>c>0)) tutDone("b_skill");
    } else {
      tutMark("basics");
      tutSay("b_end", "Sobreviví hasta que el reloj llegue a cero (arriba a la izquierda).", null, 5000);
      tutFlags().goalMission = 1; persist(); // el cartel del HUD ya no repite "sobrevivir"
    }
  }
  // ---- mejorar una habilidad (después de los básicos) ----
  if(tutSeen("basics") && !TUT.key){
    if(!tutSeen("skillup") && document.querySelector(".skill-plus:not(.hidden)")) tutSay("skillup", "¡Subiste de nivel y tenés un punto! Tocá el + junto a una habilidad para hacerla más fuerte.", "Tocá el + junto a una habilidad", 12000);
  }
  if(TUT.key==="skillup" && !document.querySelector(".skill-plus:not(.hidden)")) tutDone("skillup");
  // ---- revivir: la primera vez que cae un compañero ----
  if(!duoEnabled() && !tutSeen("revive") && TUT.key!=="revive" && player.alive && heroes.some(h=>h!==player && !h.alive))
    tutSay("revive", "¡Cayó un compañero! Parate al lado y mantené el botón REVIVIR ✚ para levantarlo.", "Mantené ✚ junto al caído para revivirlo", 12000, true);
  if(TUT.key==="revive" && (st.revives||0) > 0) tutDone("revive");
  if(typeof storyTick==="function") storyTick(); // voces de la historia y Crónicas (js/systems/story.js)
}
// al rotar o cambiar el tamaño, el cuadro cambia de lugar: se vuelve a medir para saber si tapa al guardián
window.addEventListener("resize", ()=>{ setTimeout(()=>{ if(TUT.key){ const el = document.getElementById("tut-panel"); if(el) TUT.rect = _tutRect(el); } }, 60); });
