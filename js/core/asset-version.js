"use strict";
/* ============================================================
   js/core/asset-version.js — ROMPE LA CACHÉ DEL ARTE CUANDO CAMBIA.
   Los PNG/WebP de assets/ se reescriben en la MISMA ruta; los servidores (nginx/Apache max-age=86400, python -m http.server con
   Last-Modified) y el navegador los guardan hasta 24 h, así que tras actualizar el juego se seguía viendo el arte viejo
   (Ilkan, Myla…) hasta un recargado forzado. Acá cada <img> cuyo src sea relativo a assets/ recibe ?v=ASSET_VER.
   Subí ASSET_VER (tools/perf/bump-asset-version.js) cada vez que cambia arte instalado. Debe cargar ANTES que cualquier cargador de imágenes.
   El service worker (sw.js) valida por ruta + hash y no se ve afectado por la query.
   ============================================================ */
window.ASSET_VER = "2d9da429";
(function(){
  try{
    const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
    if(!d || !d.set || d.set.__assetVer) return;
    const set = function(v){
      if(typeof v === "string" && window.ASSET_VER && v.indexOf("?") < 0 && /^(?:\.\/)?assets\//.test(v)) v += "?v=" + window.ASSET_VER;
      return d.set.call(this, v);
    };
    set.__assetVer = true;
    Object.defineProperty(HTMLImageElement.prototype, "src", { configurable:true, enumerable:d.enumerable, get:d.get, set });
  }catch(e){}
})();
