"use strict";
/* ============================================================
   js/ui/first-minute.js
   PRIMER MINUTO del jugador nuevo: título → (cuenta) → guardián → skin (saltable) → ESTA HISTORIA CORTA → tutorial.
   Después de elegir guardián, 3 líneas de contexto antes de la práctica, con dos botones siempre visibles:
   "Empezar la práctica" y "Saltar la práctica" (esta deja el tutorial marcado como saltado: se repite desde el hub).
   Solo aparece justo después de elegir al primer guardián (firstMinuteMark en starter-select.js): quien ya tenía guardián
   no la ve. Las pruebas viejas con webdriver siguen el camino de antes (sin historia), igual que el regalo inicial.
   ============================================================ */
let _fmJust = false;
function firstMinuteEnabled(){
  try{ return typeof starterGiftEnabled==="function" ? starterGiftEnabled() : !navigator.webdriver; }catch(e){ return true; }
}
function firstMinuteMark(){ _fmJust = true; }
function firstMinuteLines(){
  const k = typeof selectedClass!=="undefined" ? selectedClass : "mago", cls = (typeof CLASSES!=="undefined" && CLASSES[k]) || {};
  const nm = (typeof championShortName==="function" && CLASSES[k] ? championShortName(k) : cls.name) || "Tu guardián";
  return [
    "La Horda volvió esta noche y la Ciudad Maldita no va a aguantar mucho.",
    `${nm} es el primero en responder al llamado del Hechicero. Va a ser tu guardián.`,
    "No se puede salvar a todos: se sobrevive hasta que el reloj llegue a cero. Primero, dos minutos de práctica."
  ];
}
// Devuelve true si mostró la historia (y se hace cargo de seguir con onStart / onSkip).
function firstMinuteStory(onStart, onSkip){
  if(!_fmJust) return false;
  // un solo narrador a la vez: con el Libro abierto el relato espera a que se cierre y recién ahí sigue el flujo de siempre
  if(typeof narrationBookOpen==="function" && narrationBookOpen()){ narrationWhenFree(()=>{ if(!firstMinuteStory(onStart, onSkip) && onStart) onStart(); }); return true; }
  _fmJust = false;
  if(!firstMinuteEnabled()) return false;
  if(typeof save!=="undefined" && save.tut && (save.tut.firstStory || save.tut.training===1 || save.tut.trainingSkipped===1)) return false; // ya hizo o saltó la práctica: no hay nada que presentar
  let el = document.getElementById("first-story");
  if(el) el.remove();
  el = document.createElement("div"); el.id = "first-story"; el.className = "ui-modal"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "first-story-title");
  const esc = t=>String(t).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  el.innerHTML = `<div class="ui-modal-back"></div><div class="ui-panel ui-modal-panel fs-panel">
    <div class="ui-panel-title" id="first-story-title">La noche en que volvió la Horda</div>
    ${firstMinuteLines().map(l=>`<p class="fs-line">${esc(l)}</p>`).join("")}
    <div class="fs-btns"><button class="btn" id="first-story-go" type="button">Empezar la práctica ›</button><button class="btn secondary" id="first-story-skip" type="button">Saltar la práctica</button></div></div>`;
  document.body.appendChild(el);
  const done = fn=>{
    try{ save.tut = save.tut || {}; save.tut.firstStory = 1; persist(); }catch(e){}
    el.remove(); if(fn) fn();
  };
  el.querySelector("#first-story-go").addEventListener("click", ()=>done(onStart));
  el.querySelector("#first-story-skip").addEventListener("click", ()=>done(onSkip));
  try{ el.querySelector("#first-story-go").focus({preventScroll:true}); }catch(e){}
  return true;
}
