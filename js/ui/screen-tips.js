"use strict";
/* ============================================================
   js/ui/screen-tips.js
   CONSEJOS DE PANTALLA — el tutorial liviano de los menús (la primera vez que entrás a cada pantalla).
   Un solo sistema para todo: un cartelito CHICO abajo, de 1 o 2 pasos, con "Entendido", "Más ayuda" (abre ¿Cómo se juega? en ese tema)
   y "Omitir todos". Reglas:
   - No bloquea: no es un modal, no atrapa el foco, no captura teclas ni toques fuera de sus botones. Se puede tocar lo de abajo
     (táctil), navegar con teclado y con mando (pad-nav lo ve como cualquier botón) y se retira solo a los 20 segundos.
   - Una vez por pantalla/tema: se guarda en save.tut.tips[id]. "Omitir todos" guarda save.tut.tipsOff.
     Se vuelve a mostrar con "Repetir los consejos" (¿Cómo se juega? y Opciones). Opciones también los apaga/enciende.
   - Dentro de la partida NO se usa este cartel: ahí enseñan js/systems/tutorial.js (moverse, atacar, habilidad, definitiva, botín,
     revivir) y el entrenamiento (js/systems/alpha-training.js). Esos pasos también se repiten desde el entrenamiento.
   - Los navegadores automatizados (navigator.webdriver) no los ven salvo con ?tips=1, igual que el regalo inicial: las pruebas de
     recorrido no se encuentran con un cartel encima.
   Solo presentación y un par de marcas en el guardado: no cambia reglas, daño ni recompensas. css/screen-tips.css
   ============================================================ */
const SCREEN_TIPS_AUTO_MS = 20000;
const SCREEN_TIPS = [
  {id:"hub", topic:"objetivo", when:()=>state==="mainmenu", steps:[
    {ic:"🏰", t:"Esta es tu base", x:"Tocá JUGAR para seguir la campaña. Abajo tenés el Códice, tus Guardianes y la Tienda. Si te perdés, el botón Ayuda explica todo."}]},
  {id:"arenas", topic:"objetivo", when:()=>state==="arenaselect", steps:[
    {ic:"🧭", t:"Elegí una arena", x:"La historia va en orden, de la 01 a la 10. Tocá una para ver su ficha y empezar. Las que tienen candado se abren al terminar la anterior."}]},
  {id:"horda", topic:"infinita", when:()=>state==="menu" && typeof endlessPending!=="undefined" && endlessPending, steps:[
    {ic:"♾", t:"Horda Infinita", x:"Elegí un guardián y aguantá oleadas que no terminan. No hay final: se trata de llegar lo más lejos posible. Cada tanto elegís un refuerzo."}]},
  {id:"reliquias", topic:"infinita", when:()=>state==="buff" && typeof hrelPhaseVisible==="function" && hrelPhaseVisible(), steps:[
    {ic:"✦", t:"Reliquias de la Horda", x:"Una mejora solo para esta partida: elegí 1 de 3 cartas. Las del mismo tipo se potencian entre sí. Se pierden al terminar y no dan oro ni botín."}]},
  {id:"sala", topic:"objetivo", when:()=>state==="prep", steps:[
    {ic:"🛡", t:"Antes de entrar", x:"Acá ves a tu guardián y su equipo. Para cambiar objetos o talentos, usá las pestañas. Cuando estés listo, tocá el botón grande para entrar a la arena."}]},
  {id:"guardian", topic:"botin", when:()=>_tipChampTab()==="ficha", steps:[
    {ic:"🛡", t:"Tu guardián", x:"Con ‹ › cambiás de guardián. Las pestañas de arriba: Equipo (objetos), Talentos, Maestría, Sets (poder) y Apariencias (skins, sin poder)."}]},
  {id:"equipo", topic:"botin", when:()=>_tipChampTab()==="equipo", steps:[
    {ic:"🎒", t:"Equipo", x:"Los objetos que juntás en las arenas se equipan acá, en los huecos del guardián. Se comparten entre todos tus guardianes. Si no tenés ninguno, jugá una arena: el botín cae al piso."}]},
  {id:"talentos", topic:"progreso", when:()=>_tipChampTab()==="talentos", steps:[
    {ic:"✨", t:"Talentos", x:"Cada vez que el guardián sube de nivel ganás puntos. Gastalos acá: son mejoras permanentes solo para este guardián."}]},
  {id:"maestria", topic:"progreso", when:()=>_tipChampTab()==="habilidades", steps:[
    {ic:"👑", t:"Maestría", x:"Es el camino final del guardián y se elige una sola. Tocá una para leer qué pide y qué da antes de decidir."}]},
  {id:"skins", topic:"tienda", when:()=>_tipChampTab()==="skins", steps:[
    {ic:"🎨", t:"Apariencias", x:"Las skins solo cambian cómo se ve tu guardián. No dan poder ni ventajas."}]},
  {id:"inventario", topic:"botin", when:()=>state==="inventory", steps:[
    {ic:"🎒", t:"Mi inventario", x:"Acá está todo lo que juntaste. Filtrá por rareza o por ranura. Para equiparlo, abrí un guardián y andá a su pestaña Equipo."}]},
  {id:"tienda", topic:"tienda", when:()=>state==="shop" && typeof shopTab!=="undefined" && shopTab!=="brasas", steps:[
    {ic:"🪙", t:"Tienda", x:"Con oro 🪙, que ganás jugando, comprás guardianes y objetos. Las Brasas ✦ son otra moneda: solo compran apariencias, nunca poder."}]},
  {id:"brasas", topic:"tienda", when:()=>state==="shop" && typeof shopTab!=="undefined" && shopTab==="brasas", steps:[
    {ic:"✦", t:"Brasas: solo apariencia", x:"Compran skins y cosméticos. No hace falta gastarlas para ganar: nada de lo que dan te hace más fuerte."}]},
  {id:"codice", topic:"pausa", when:()=>state==="codex" && !_tipChampTab(), steps:[
    {ic:"📖", t:"Códice", x:"Tu enciclopedia: guardianes, bestiario, jefes y arenas. Se completa a medida que descubrís cosas. Tocá una tarjeta para abrirla."}]},
  {id:"opciones", topic:"controles", modal:true, when:()=>_tipVis("#hub-options") && !_tipVis("#ctl-map"), steps:[
    {ic:"⚙", t:"Opciones", x:"Sonido, idioma, controles y accesibilidad. «Ver controles» muestra las teclas y los botones del mando. Acá también podés repetir los consejos."}]},
  {id:"pausa", topic:"pausa", when:()=>state==="paused", steps:[
    {ic:"⏸", t:"Pausa", x:"El juego está detenido. «Continuar» sigue la partida. «Resumen» muestra tu daño y «Ayuda y opciones» tiene el sonido y Cómo se juega."}]},
  {id:"fin", topic:"botin", when:()=>state==="gameover" || state==="victory", steps:[
    {ic:"🚩", t:"Fin de la partida", x:"Podés reintentar o volver al menú. Lo que juntaste ya quedó guardado en tu cuenta: miralo en Guardianes › Equipo."}]}
];

let _tip = {id:null, i:0, el:null, since:0, auto:0, seenTicks:0, cand:null};
function _tipVis(sel){
  const e = document.querySelector(sel);
  return !!e && e.getClientRects().length > 0 && !e.closest(".hidden");
}
// Pestaña abierta de la ficha de un guardián (Guardianes abre la hoja del Códice; "champdetail" es la vista vieja). null = no hay ficha a la vista.
function _tipChampTab(){
  const t = document.querySelector("#codex-screen:not(.hidden) .cx-tab.on[data-ctab], #champdetail-screen:not(.hidden) .cx-tab.on[data-ctab]");
  return t ? t.getAttribute("data-ctab") : null;
}
function _tipFlags(){ try{ if(typeof save==="undefined" || !save) return null; if(!save.tut) save.tut = {}; return save.tut; }catch(e){ return null; } }
function screenTipsEnabled(){
  const f = _tipFlags(); if(!f || f.tipsOff) return false;
  let q = ""; try{ q = location.search || ""; }catch(e){}
  if(/[?&]tips=0(&|$)/.test(q)) return false;
  return !navigator.webdriver || /[?&]tips=1(&|$)/.test(q);
}
function screenTipsSetEnabled(on){
  const f = _tipFlags(); if(!f) return;
  f.tipsOff = on ? 0 : 1; if(!on) screenTipHide(); try{ persist(); }catch(e){}
  screenTipsSyncOptions();
}
function screenTipSeen(id){ const f = _tipFlags(); return !!(f && f.tips && f.tips[id]); }
function screenTipMark(id){ const f = _tipFlags(); if(!f) return; f.tips = f.tips || {}; if(!f.tips[id]){ f.tips[id] = 1; try{ persist(); }catch(e){} } }
function screenTipsReset(){
  const f = _tipFlags(); if(!f) return;
  f.tips = {}; f.tipsOff = 0; try{ persist(); }catch(e){}
  _tip.cand = null; screenTipHide(); screenTipsSyncOptions();
  if(typeof showNetToast==="function") showNetToast("Listo: los consejos vuelven a aparecer en cada pantalla.");
}
// ¿Algo más importante está encima? (diálogos, ficha de arena, historia, Libro, ayuda, entrenamiento): ahí el cartel espera
function _tipBusy(tip){
  if(_tipVis("#howto") || _tipVis("#first-story") || _tipVis("#cw-gate") || _tipVis("#pg-gate") || _tipVis("#alpha-training-panel")) return true;
  if(!tip.modal && document.querySelector(".ui-modal:not(.hidden)")) return true;
  try{
    if(typeof RUN_INTRO!=="undefined" && RUN_INTRO.open) return true;
    if(typeof STORY_CINE!=="undefined" && STORY_CINE.open) return true;
    if(typeof CAMP!=="undefined" && CAMP.open) return true;
    if(typeof GAME_DIALOG!=="undefined" && GAME_DIALOG.cur) return true;
    if(typeof narrationBookOpen==="function" && narrationBookOpen()) return true;
  }catch(e){}
  return false;
}
function screenTipHide(){
  clearTimeout(_tip.auto);
  if(_tip.el){ _tip.el.remove(); _tip.el = null; }
  _tip.id = null;
}
function _tipRender(){
  const tip = SCREEN_TIPS.find(t=>t.id===_tip.id); if(!tip) return screenTipHide();
  const st = tip.steps[_tip.i], last = _tip.i >= tip.steps.length - 1;
  const esc = t=>String(t).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  let el = _tip.el;
  if(!el){ el = _tip.el = document.createElement("div"); el.id = "screen-tip"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
  el.dataset.tip = tip.id;
  el.innerHTML = '<span class="st-ic" aria-hidden="true">' + st.ic + '</span><div class="st-body"><b class="st-t">' + esc(st.t) + '</b><span class="st-x">' + esc(st.x) + '</span></div>' +
    '<div class="st-btns"><button type="button" class="btn small st-ok" data-st="ok">' + (last ? "Entendido" : "Siguiente") + '</button>' +
    '<button type="button" class="btn small secondary st-more" data-st="more">Más ayuda</button>' +
    '<button type="button" class="btn small secondary st-off" data-st="off">Omitir todos</button></div>';
  clearTimeout(_tip.auto); _tip.auto = setTimeout(()=>{ if(_tip.id) screenTipDone(); }, SCREEN_TIPS_AUTO_MS);
}
function screenTipShow(id){
  const tip = SCREEN_TIPS.find(t=>t.id===id); if(!tip) return false;
  _tip.id = id; _tip.i = 0; _tip.since = performance.now(); _tip.cand = null; _tipRender();
  return true;
}
function screenTipDone(){ if(_tip.id) screenTipMark(_tip.id); screenTipHide(); }
document.addEventListener("click", e=>{
  const b = e.target && e.target.closest && e.target.closest("#screen-tip [data-st]"); if(!b || !_tip.id) return;
  const tip = SCREEN_TIPS.find(t=>t.id===_tip.id), act = b.getAttribute("data-st");
  if(act==="ok"){ if(tip && _tip.i < tip.steps.length - 1){ _tip.i++; _tipRender(); } else screenTipDone(); }
  else if(act==="more"){ const topic = tip && tip.topic; screenTipDone(); if(typeof howtoOpen==="function") howtoOpen(topic); }
  else if(act==="off"){ screenTipDone(); screenTipsSetEnabled(false); if(typeof showNetToast==="function") showNetToast("Consejos apagados. Para volver a verlos: Opciones › Ayuda y tutoriales."); }
});
// Cada 600 ms (solo fuera de la partida): elige el primer consejo pendiente de lo que se ve; tiene que verse dos cuadros seguidos para no parpadear al pasar de pantalla
function screenTipsTick(){
  if(typeof state==="undefined" || state==="playing"){ if(_tip.id) screenTipHide(); _tip.cand = null; return; }
  if(!screenTipsEnabled()){ if(_tip.id) screenTipHide(); return; }
  if(_tip.id){
    const cur = SCREEN_TIPS.find(t=>t.id===_tip.id);
    let still = false; try{ still = !!cur && cur.when() && !_tipBusy(cur); }catch(e){}
    if(!still){ if(performance.now() - _tip.since > 4000) screenTipMark(_tip.id); screenTipHide(); } // salió de la pantalla: si alcanzó a leerlo, queda visto
    return;
  }
  let next = null;
  for(const t of SCREEN_TIPS){ try{ if(!screenTipSeen(t.id) && t.when() && !_tipBusy(t)){ next = t; break; } }catch(e){} }
  if(!next){ _tip.cand = null; return; }
  if(_tip.cand === next.id) screenTipShow(next.id); else _tip.cand = next.id;
}
function screenTipsSyncOptions(){
  const b = document.getElementById("opt-tips-switch"); if(!b) return;
  const f = _tipFlags(), on = !!f && !f.tipsOff;
  b.setAttribute("aria-checked", on ? "true" : "false"); b.textContent = on ? "Sí" : "No";
}
(function(){
  const sw = document.getElementById("opt-tips-switch");
  if(sw) sw.addEventListener("click", ()=>{ const f = _tipFlags(); screenTipsSetEnabled(!!(f && f.tipsOff)); });
  const rs = document.getElementById("opt-tips-reset-btn");
  if(rs) rs.addEventListener("click", ()=>screenTipsReset());
  const box = document.getElementById("hub-options");
  if(box) try{ new MutationObserver(screenTipsSyncOptions).observe(box, {attributes:true, attributeFilter:["class"]}); }catch(e){}
  setInterval(screenTipsTick, 600);
})();
