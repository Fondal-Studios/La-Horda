"use strict";
/* ============================================================
   js/ui/how-to-play.js
   ¿CÓMO SE JUEGA? — guía que se puede abrir SIEMPRE (título, menú principal, pausa y Opciones), con lo esencial del modo actual y
   una pestaña por tema: Objetivo, Controles, Botín y objetos, Talentos, Tienda y Brasas, Pausa y Códice, Horda Infinita.
   Reseña de jugadores: nadie entendía qué tenía que hacer. La tarjeta de misión de la primera arena se mostraba una sola vez;
   esta guía es la misma idea, sin límite. Solo explica: no cambia reglas, daño ni recompensas. Lenguaje simple.
   Los consejos de cada pantalla (js/ui/screen-tips.js) usan estos mismos temas: "Repetir consejos" los vuelve a mostrar.
   ============================================================ */
const HOWTO_STEPS = {
  campana:[
    {ic:"🎯", t:"Tu objetivo", x:"Sobrevivir a la horda con tu equipo. Cada nivel dura un ratito: aguantá hasta que el reloj llegue a cero. En el nivel 10 aparece un jefe: derrotalo y ganás la arena."},
    {ic:"↔", t:"Moverte y atacar", x:"El joystick de abajo a la izquierda mueve a tu héroe. El botón grande de ATAQUE pega; las habilidades están alrededor y la definitiva (ULT) se carga peleando."},
    {ic:"✨", t:"Cada nivel, una mejora", x:"Al subir de nivel elegís una carta. Leé el título: te da más daño, vida, velocidad o un poder nuevo. Elegir bien es lo que te hace aguantar más."},
    {ic:"❤️", t:"Cuidate y cuidá a los tuyos", x:"La barra roja es tu vida. Si un compañero cae, mantené ✚ a su lado para levantarlo. Perdés si caen todos a la vez."}
  ],
  cristales:[
    {ic:"🎯", t:"Tu objetivo", x:"Destruí el cristal enemigo antes de que destruyan el tuyo. Para llegar a él tenés que derribar las torres de uno de los tres carriles."},
    {ic:"⚔️", t:"Tu horda pelea por vos", x:"Cada ratito sale una oleada de monstruos de tu base por cada carril. Acompañala, protegela y pegale a los héroes rivales que se acerquen."},
    {ic:"📜", t:"Cada nivel, una carta de horda", x:"Cuando sube de nivel el líder de tu equipo se elige una carta que mejora a TU HORDA: más vida, más daño, más monstruos o gigantes."},
    {ic:"🪙", t:"Oro y tienda", x:"Matar monstruos y torres da oro. Volvé a tu base (botón de volver o tecla B) para comprar objetos. Matar al Dragón o al Rey Coloso da ventajas al equipo."}
  ],
  coliseo:[
    {ic:"🎯", t:"Tu objetivo", x:"Ganá duelos 2 contra 2. El primer equipo que llega a 3 puntos se queda con el torneo."},
    {ic:"⌛", t:"Cada ronda", x:"Primero hay unos segundos de preparación. Después se pelea; si pasa mucho tiempo el anillo del suelo se cierra y obliga a pelear."},
    {ic:"💀", t:"Si caés", x:"No revivís en la ronda: mirás a tu equipo desde la cámara de espectador hasta que termina."}
  ],
  // Temas de ayuda (una pestaña cada uno). Los textos dan las tres formas de jugar: táctil, teclado y mando.
  controles:[
    {ic:"↔", t:"Moverte", x:"Táctil: joystick de abajo a la izquierda. Teclado: WASD o flechas. Mando: stick izquierdo."},
    {ic:"⚔️", t:"Atacar", x:"Táctil: mantené el botón grande de ATAQUE. Teclado: Espacio. Mando: A. Tu guardián le pega solo al enemigo más cercano."},
    {ic:"✨", t:"Habilidades", x:"Pegan mucho más fuerte que el ataque y tienen recarga. Táctil: tocá el botón (si lo mantenés, apuntás). Teclado: 1, 2 y 3. Mando: X, Y y B."},
    {ic:"💥", t:"Definitiva (ULT)", x:"Se carga peleando y se habilita desde el nivel 5 de la arena. Cuando brilla, usala: tocá ULT, apretá R o RB en el mando."}
  ],
  botin:[
    {ic:"🎁", t:"Recoger botín", x:"Los enemigos sueltan objetos en el piso, con un haz de luz según su rareza. Pasá por encima para levantarlos o tocá «Levantar» (tecla E)."},
    {ic:"🛡", t:"Equiparlos", x:"En Guardianes › Equipo elegís qué lleva puesto cada guardián. Los objetos se comparten entre todos tus guardianes."},
    {ic:"🎒", t:"Mi inventario", x:"Lista todo lo que juntaste. Filtrá por rareza o por ranura, y activá la gestión automática del botín si querés ahorrar tiempo."}
  ],
  progreso:[
    {ic:"✨", t:"Talentos", x:"Cada vez que un guardián sube de nivel ganás puntos. Gastalos en Guardianes › Talentos: son mejoras permanentes para ese guardián."},
    {ic:"👑", t:"Maestría", x:"Es el camino final de cada guardián, y se elige una sola. Mirá qué pide en Guardianes › Maestría."},
    {ic:"✚", t:"Habilidades en partida", x:"Cuando ves un + sobre una habilidad, tenés un punto para hacerla más fuerte. Tocalo."}
  ],
  tienda:[
    {ic:"🪙", t:"Oro", x:"Lo ganás jugando. Con oro comprás guardianes y objetos en la Tienda. Mirá «Ofertas del día»: cambian solas."},
    {ic:"✦", t:"Brasas: solo apariencia", x:"Las Brasas compran skins y cosméticos. Nunca dan poder ni ventajas en partida: no hace falta gastarlas para ganar."},
    {ic:"🎨", t:"Skins", x:"Solo cambian el aspecto de tu guardián. Podés probarlas y cambiar de skin cuando quieras desde Guardianes › Apariencias."}
  ],
  pausa:[
    {ic:"⏸", t:"Pausa", x:"Tocá ❚❚ (Esc en teclado, Start en el mando). Con la partida pausada ves tu Resumen, la ayuda y las opciones. En partidas online no hay pausa."},
    {ic:"▶", t:"Continuar o abandonar", x:"«Continuar» está siempre abajo. «Abandonar arena» te saca de la partida y te lleva al menú."},
    {ic:"📖", t:"Códice", x:"Es tu enciclopedia: guardianes, bestiario, jefes y arenas. Se completa a medida que descubrís cosas. Se abre desde el menú principal."}
  ],
  infinita:[
    {ic:"♾", t:"Horda Infinita", x:"Se abre al terminar la Arena 02. Elegís guardián y aguantás oleadas que no terminan: el objetivo es llegar lo más lejos posible."},
    {ic:"✨", t:"Refuerzos", x:"Cada tanto elegís un refuerzo con sinergias. Leé qué hace cada uno antes de elegir."},
    {ic:"🏆", t:"Ranking", x:"Tu mejor marca de la semana entra en el ranking semanal de la Horda Infinita."}
  ]
};
const HOWTO_TOPICS = [
  {id:"objetivo", ic:"🎯", label:"Objetivo"},
  {id:"controles", ic:"🎯", label:"Controles"},
  {id:"botin", ic:"🎁", label:"Botín y objetos"},
  {id:"progreso", ic:"✨", label:"Talentos"},
  {id:"tienda", ic:"🪙", label:"Tienda y Brasas"},
  {id:"pausa", ic:"⏸", label:"Pausa y Códice"},
  {id:"infinita", ic:"♾", label:"Horda Infinita"}
];
let _howtoTopic = "objetivo";
function howtoModeKey(){
  if(typeof lanesOn==="function" && lanesOn()) return LN.mode==="coliseo" ? "coliseo" : "cristales";
  return "campana";
}
function howtoClose(){
  const el = document.getElementById("howto"); if(el) el.classList.add("hidden");
}
function howtoEsc(t){ return String(t).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function howtoSteps(topic, modeKey){
  if(topic==="objetivo") return HOWTO_STEPS[modeKey] || HOWTO_STEPS.campana;
  return HOWTO_STEPS[topic] || HOWTO_STEPS.campana;
}
function howtoRenderList(el, topic, modeKey){
  const steps = howtoSteps(topic, modeKey);
  el.querySelector(".howto-list").innerHTML = steps.map((s,i)=>'<div class="howto-step"><span class="howto-ic" aria-hidden="true">' + s.ic + '</span><div><b>' + (i+1) + '. ' + howtoEsc(s.t) + '</b><p>' + howtoEsc(s.x) + '</p></div></div>').join("");
  el.querySelectorAll(".howto-tab").forEach(b=>{ const on = b.dataset.topic===topic; b.classList.toggle("on", on); b.setAttribute("aria-selected", on ? "true" : "false"); b.tabIndex = on ? 0 : -1; });
  const l = el.querySelector(".howto-list"); if(l) l.scrollTop = 0;
}
// howtoOpen(modo | tema): "campana" | "cristales" | "coliseo" muestran el objetivo de ese modo; un tema ("controles", "botin"...) abre esa pestaña.
function howtoOpen(topic){
  let modeKey = howtoModeKey();
  if(HOWTO_STEPS[topic] && ["campana","cristales","coliseo"].indexOf(topic) >= 0){ modeKey = topic; topic = "objetivo"; }
  if(!HOWTO_TOPICS.some(t=>t.id===topic)) topic = "objetivo";
  _howtoTopic = topic;
  let el = document.getElementById("howto");
  if(!el){
    el = document.createElement("div"); el.id = "howto"; el.className = "hidden"; el.setAttribute("role","dialog"); el.setAttribute("aria-label","Cómo se juega");
    document.body.appendChild(el);
    el.addEventListener("click", e=>{
      if(e.target === el || e.target.closest("[data-howto-close]")) return howtoClose();
      const tab = e.target.closest(".howto-tab"); if(tab){ _howtoTopic = tab.dataset.topic; howtoRenderList(el, _howtoTopic, el.dataset.mode); return; }
      if(e.target.closest("[data-howto-reset]")){ if(typeof screenTipsReset==="function") screenTipsReset(); }
    });
  }
  el.dataset.mode = modeKey;
  const names = {campana:"la Horda", cristales:"Guerra de Cristales", coliseo:"el Coliseo"};
  const topics = HOWTO_TOPICS; // Horda Infinita es parte de la beta; Cristales y Coliseo solo aparecen en "Objetivo" cuando se juegan
  el.innerHTML = '<div class="howto-card"><div class="howto-title">¿CÓMO SE JUEGA ' + names[modeKey].toUpperCase() + '?</div>' +
    '<div class="howto-tabs" role="tablist" aria-label="Temas de ayuda">' + topics.map(t=>'<button type="button" class="howto-tab" role="tab" data-topic="' + t.id + '"><span aria-hidden="true">' + t.ic + '</span> ' + t.label + '</button>').join("") + '</div>' +
    '<div class="howto-list" role="tabpanel"></div>' +
    '<div class="howto-extra"><button type="button" class="btn small secondary" data-howto-reset>Repetir los consejos de cada pantalla</button></div>' +
    '<button class="btn wide" data-howto-close>Entendido</button></div>';
  howtoRenderList(el, topic, modeKey);
  el.classList.remove("hidden");
  try{ const t = el.querySelector(".howto-tab.on"); if(t) t.scrollIntoView({block:"nearest", inline:"center"}); }catch(e){}
}
(function(){
  const bind = (id, mode)=>{ const b = document.getElementById(id); if(b) b.addEventListener("click", ()=>howtoOpen(mode)); };
  bind("hub-howto-btn", "campana");
  bind("pause-howto-btn");
  bind("title-howto-btn", "campana");
  bind("opt-howto-btn", "campana");
  document.addEventListener("keydown", e=>{ if(e.key === "Escape") howtoClose(); });
})();
