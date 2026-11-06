"use strict";
/* ============================================================
   js/beta/beta-scope.js — ALCANCE DE LA BETA PÚBLICA (docs/beta-release)
   Modos de la beta: Campaña y Horda Infinita. Convergencia (Guerra de Cristales) y Coliseo quedan
   OCULTOS y bloqueados SIN borrar su código ni sus datos (se reactivan quitando la bandera).
   La bandera se enciende SOLO en el paquete beta: `BETA_PUBLIC=1 node tools/build-static.mjs` inyecta
   window.__BETA_PUBLIC__=true, o se prueba con ?beta=1. Sin bandera el juego se comporta como siempre
   (así las pruebas de los modos competitivos siguen valiendo).
   ============================================================ */
(function(){
  let q = ""; try{ q = location.search || ""; }catch(e){}
  const on = window.__BETA_PUBLIC__ === true || /[?&]beta=1(&|$)/.test(q);
  window.BETA_SCOPE = { public: on, hiddenModes: ["crystalWars", "coliseum", "divina"],
    modeAllowed: id => !on || window.BETA_SCOPE.hiddenModes.indexOf(id) < 0 };
  if(on){ try{ document.body.classList.add("beta-public"); }catch(e){} }
})();
