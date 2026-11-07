"use strict";
/* ============================================================
   js/ui/ux-simplify-a.js  (UX simplify A: pausa y Opciones)
   Solo presentación y accesos: no quita ninguna opción ni toca la partida.
   - Acordeones de la pausa (.pause-acc): el panel táctico, "Estadísticas" y "Ayuda y opciones" se pliegan;
     "Continuar" y "Abandonar arena" quedan fijos abajo (css/ux-simplify-a.css).
   - Opciones: chips para saltar a "Accesibilidad", "Controles" o "Legal", y un resumen de lo activado.
   - Pausa > "Accesibilidad…": abre Opciones y salta a esa sección.
   ============================================================ */
(function(){
  function setAcc(sec, open){
    if(!sec) return;
    sec.classList.toggle("open", !!open);
    const h = sec.querySelector(":scope > .pause-acc-h"), b = sec.querySelector(":scope > .pause-acc-b");
    if(h) h.setAttribute("aria-expanded", open ? "true" : "false");
    if(b){ b.toggleAttribute("inert", !open); b.setAttribute("aria-hidden", open ? "false" : "true"); }
    const k = sec.dataset.acc;
    if(k && typeof _tpOpen!=="undefined") _tpOpen[k] = !!open;
  }
  document.addEventListener("click", ev=>{
    const h = ev.target && ev.target.closest && ev.target.closest(".pause-acc-h"); if(!h) return;
    const sec = h.closest(".pause-acc"); if(!sec) return;
    setAcc(sec, !sec.classList.contains("open"));
  });

  function jumpTo(id){
    const box = document.getElementById("hub-options"), el = document.getElementById(id);
    if(!box || !el) return;
    const panel = box.querySelector(".ui-modal-panel"); if(!panel) return;
    const bar = panel.querySelector(".ui-panel-title");
    const off = (bar ? bar.offsetHeight : 0) + 6;
    const top = el.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop - off;
    panel.scrollTo({top: Math.max(0, top), behavior: (typeof JUICE!=="undefined" && JUICE.reduceMotion) ? "auto" : "smooth"});
    el.classList.remove("opt-flash"); void el.offsetWidth; el.classList.add("opt-flash");
  }
  window.optionsJump = jumpTo;
  document.addEventListener("click", ev=>{
    const b = ev.target && ev.target.closest && ev.target.closest("#opt-jump [data-jump]"); if(!b) return;
    jumpTo(b.dataset.jump);
  });
  const a11yBtn = document.getElementById("pause-a11y-btn");
  if(a11yBtn) a11yBtn.addEventListener("click", ()=>{
    if(typeof openHubOptions==="function") openHubOptions();
    requestAnimationFrame(()=>jumpTo("opt-sec-a11y"));
  });

  // Resumen de lo que está activado en Accesibilidad (se ve sin bajar)
  function a11ySummary(){
    const el = document.getElementById("opt-a11y-sum"); if(!el) return;
    const on = [];
    if(typeof JUICE!=="undefined" && JUICE.reduceMotion) on.push("Movimiento reducido");
    if(typeof PREFS!=="undefined"){
      if(PREFS.shake && PREFS.shake!=="normal") on.push("Sacudida " + (PREFS.shake==="off" ? "apagada" : "reducida"));
      if(PREFS.textLg) on.push("Texto grande");
      if(PREFS.contrast) on.push("Alto contraste");
      if(PREFS.cvd && PREFS.cvd!=="off") on.push("Daltonismo");
    }
    const html = on.length ? '<span class="oas-k">Activado:</span>' + on.map(t=>'<span class="oas-chip">' + t + '</span>').join("")
                           : '<span class="oas-k">Todo en valores normales.</span>';
    if(el.__h !== html){ el.__h = html; el.innerHTML = html; }
  }
  const box = document.getElementById("hub-options");
  if(box){
    box.addEventListener("click", ()=>setTimeout(a11ySummary, 30));
    try{ new MutationObserver(a11ySummary).observe(box, {attributes:true, attributeFilter:["class"]}); }catch(e){}
    a11ySummary();
  }
  const pm = document.getElementById("opt-reduce-motion"); if(pm) pm.addEventListener("change", ()=>setTimeout(a11ySummary, 30));
})();
