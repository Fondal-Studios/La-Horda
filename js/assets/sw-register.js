"use strict";
/* Registra sw.js (caché de visitas repetidas / sin conexión) cuando la página se sirve por HTTPS. Es inofensivo si el
   sitio no fue estampado con tools/perf/stamp-sw.js (el worker no hace nada). Las pruebas automáticas
   (navigator.webdriver) no lo registran salvo con ?sw=1; ?sw=0 lo apaga. No toca la red multijugador. */
(function(){
  try{
    if(!("serviceWorker" in navigator)) return;
    const q = location.search, force = /[?&]sw=1(&|$)/.test(q);
    if(/[?&]sw=0(&|$)/.test(q) || (navigator.webdriver && !force)) return;
    if(location.protocol !== "https:" && !force) return;
    // después de "load" para no competir con la carga inicial
    window.addEventListener("load", ()=>{ setTimeout(()=>{
      // register() solo busca una versión nueva de sw.js cada 24 h por su cuenta: update() la pide en cada carga (un GET chico)
      navigator.serviceWorker.register("sw.js").then(r=>{ if(r && r.update) return r.update(); }).catch(()=>{});
    }, 1500); });
  }catch(e){}
})();
