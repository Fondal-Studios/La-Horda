"use strict";
/* ============================================================
   js/ui/buff-choice.js
   Pantalla de elección de refuerzo al superar un nivel.
   ============================================================ */

/* ============================================================
   BUFF CHOICE
   ============================================================ */
// Nota al pie: el texto viejo ("se decide por voto del equipo") era falso en las dos modalidades. En
// cooperativo cada humano elige SU refuerzo y se sigue cuando eligieron todos; solo, los bots no eligen.
function buffNoteRefresh(){
  const n = document.getElementById("vote-note"); if(!n) return;
  const coop = typeof netMatch!=="undefined" && !!netMatch;
  n.textContent = coop ? "Cada jugador elige su propio refuerzo; la partida sigue cuando eligieron todos." : "El refuerzo dura hasta el final de esta incursión.";
  buffKeysRefresh();
}
function openBuffChoice(){
  if(typeof endlessOn==="function" && endlessOn()){ endlessOpenBuffChoice(); return; } // Horda Infinita: refuerzos con sinergias (js/systems/endless.js)
  setState("buff");
  buffNoteRefresh();
  document.getElementById("buff-title").textContent = `Nivel ${runLevel} superado — elegí un refuerzo`;
  if(typeof campaignStoryOnBuff==="function") campaignStoryOnBuff(); // prólogo pendiente del cooperativo
  const cards = document.getElementById("buff-cards");
  cards.innerHTML = "";
  // 3 cartas: 1-2 refuerzos que TRANSFORMAN una habilidad del guardián (js/data/boons.js; un dúo
  // habilitado sale primero) mezclados con los genéricos de siempre.
  const opts = boonBuildOffers(player, BUFF_POOL, false);
  opts.forEach(opt=>{
    const el = document.createElement("div");
    el.className = buffOptClass(opt);
    el.innerHTML = buffOptHTML(opt, player);
    el.addEventListener("click", ()=>{
      if(state!=="buff") return;
      buffApplyOpt(player, opt); // genérico: runStats + refreshEquippedStats (la vida máxima aplica ya) · refuerzo: player.boons
      // B1: en cooperativo cada humano elige el suyo; se sigue cuando eligieron todos
      if(netIsHost()){ cards.innerHTML = `<div class="net-wait">Elegiste <b>${buffOptName(opt)}</b>.</div>`; netHostPickedLocal(); return; }
      runLevel++;
      checkpointOnLevelPassed(); // al superar el nivel 5: punto de control (checkpoint.js)
      if(player.alive) player.hp = Math.min(player.maxHp, player.hp + player.maxHp*0.25);
      player.energy = player.maxEnergy;
      beginLevel();
      setState("playing");
    });
    cards.appendChild(el);
  });
  buffOwnedRefresh(player);
  if(netIsHost()) netHostOpenBuffs();
}
// Debajo de las cartas: los refuerzos de habilidad que ya tiene este héroe (la build de la incursión).
function buffOwnedRefresh(h){
  const cards = document.getElementById("buff-cards"); if(!cards || !cards.parentNode) return;
  let el = document.getElementById("boon-owned");
  if(!el){ el = document.createElement("div"); el.id = "boon-owned"; cards.parentNode.insertBefore(el, cards.nextSibling); }
  el.innerHTML = boonOwnedLineHTML(h);
}

/* ---------------- teclado: 1 / 2 / 3, flechas y Enter ----------------
   Igual que las Reliquias de la Horda (js/systems/horde-relics.js), que ya lo tenían. Vale para TODAS las cartas de
   refuerzo que se dibujan en #buff-cards (campaña acá arriba, Horda Infinita en endless.js, invitado en net-game.js):
   en vez de tocar cada lugar, se decoran al aparecer (número en la esquina, foco con Tab) y un solo oyente las elige.
   Las reliquias (button.hrel-card) traen su número y sus teclas: acá se saltean. El número va en un atributo y lo pinta
   el CSS (css/pc-desktop.css, .buff-key): el texto de la carta queda igual para lectores de pantalla y traducciones. */
const BUFF_KEYS = { at:0, guardMs:350, obs:null };
function _buffKeyCards(){ return [...document.querySelectorAll("#buff-cards .buff-card:not(.hrel-card)")]; }
function _buffRelicsOpen(){ try{ return typeof HR_UI!=="undefined" && !!HR_UI.open; }catch(e){ return false; } }
function buffKeysRefresh(){
  const cards = _buffKeyCards();
  let fresh = false;
  cards.forEach((el, i)=>{
    if(i > 8) return;
    let k = el.querySelector(":scope > .buff-key");
    if(!k){
      k = document.createElement("span"); k.className = "buff-key"; k.setAttribute("aria-hidden", "true"); el.appendChild(k); fresh = true;
      if(!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      if(!el.hasAttribute("role")) el.setAttribute("role", "button");
    }
    if(k.dataset.n!==String(i + 1)) k.dataset.n = String(i + 1);
  });
  if(fresh) BUFF_KEYS.at = performance.now();
  // con teclado, la nota dice cómo elegir (renglón aparte: no cambia el texto de la nota de siempre)
  const note = document.getElementById("vote-note");
  if(note && note.parentNode){
    let hint = document.getElementById("buff-key-note");
    const show = cards.length > 0 && typeof DESK!=="undefined" && DESK.device==="kb" && !_buffRelicsOpen();
    if(show && !hint){ hint = document.createElement("div"); hint.id = "buff-key-note"; hint.textContent = "Elegí con 1 2 3 o con clic."; note.parentNode.insertBefore(hint, note.nextSibling); }
    if(hint) hint.classList.toggle("hidden", !show);
  }
}
(function(){
  const cards = document.getElementById("buff-cards"); if(!cards) return;
  if(typeof MutationObserver!=="undefined"){
    BUFF_KEYS.obs = new MutationObserver(()=>{ try{ buffKeysRefresh(); }catch(e){} });
    BUFF_KEYS.obs.observe(cards, {childList:true});
  }
  window.addEventListener("keydown", ev=>{
    if(typeof state==="undefined" || state!=="buff" || _buffRelicsOpen() || ev.defaultPrevented) return;
    if(ev.altKey || ev.ctrlKey || ev.metaKey) return;
    try{ if(typeof GAME_DIALOG!=="undefined" && GAME_DIALOG.cur) return; }catch(e){}
    const t = ev.target, tag = t && t.tagName; if(tag==="INPUT" || tag==="TEXTAREA" || tag==="SELECT") return;
    const list = _buffKeyCards(); if(!list.length) return;
    const k = ev.key, cur = list.indexOf(document.activeElement);
    if(k==="ArrowRight" || k==="ArrowLeft" || k==="ArrowDown" || k==="ArrowUp"){
      const d = (k==="ArrowRight" || k==="ArrowDown") ? 1 : -1;
      ev.preventDefault();
      const next = cur < 0 ? (d > 0 ? 0 : list.length - 1) : (cur + d + list.length) % list.length;
      try{ list[next].focus({preventScroll:true}); }catch(e){}
      return;
    }
    if(ev.repeat) return; // una tecla que venía apretada de la pelea (1 2 3 son habilidades, Espacio es el ataque) no elige nada
    if(performance.now() - BUFF_KEYS.at < BUFF_KEYS.guardMs) return; // ni un toque que llegó justo cuando aparecían las cartas
    const digit = /^(Digit|Numpad)([1-9])$/.exec(ev.code || "");
    if(digit){ const c = list[(+digit[2]) - 1]; if(c){ ev.preventDefault(); c.click(); } return; }
    if((k==="Enter" || k===" ") && cur >= 0){ ev.preventDefault(); list[cur].click(); }
  });
  window.addEventListener("lh:controls", ()=>{ try{ buffKeysRefresh(); }catch(e){} });
})();
