"use strict";
/* ============================================================
   js/assets/lazy-images.js
   CARGA DE IMÁGENES EN DOS TANDAS + WebP SIN PÉRDIDA (auditoría pre-alfa).

   Antes, al abrir el juego se pedían TODAS las imágenes a la vez (1.366 archivos, ~51 MB) y el
   título esperaba a la última. Ahora:
     1) primera tanda: lo que se ve en título, menús, Sala y guardianes (todo lo que no es de una
        arena). "Toca para continuar" se habilita apenas termina esa tanda.
     2) segunda tanda: el arte de las arenas (enemigos, jefes, escenarios) y los efectos de las habilidades baja
        mientras el jugador elige guardián, arena y equipo. La partida NO arranca hasta que terminó
        (la ficha del Hechicero muestra "Preparando la arena… N %"): nunca se juega con arte a
        medio cargar, igual que antes.
   Además, si existe una copia .webp sin pérdida (mismos píxeles, alfa exacto; la genera
   tools/art/webp_convert.py y la lista está en asset-webp.js), se pide esa, más liviana; si el
   navegador no puede leer WebP, esa imagen vuelve sola al .png.

   Cómo funciona: intercepta la propiedad `src` de las imágenes ANTES de que carguen los demás
   scripts (por eso va primero en index.html). Una imagen de arena queda "en espera" hasta
   LAZY_IMG.release(). Todo el código que dibuja ya chequea `naturalWidth`, así que una imagen en
   espera simplemente no se dibuja todavía.

   Pruebas automáticas (navigator.webdriver): cargan todo junto como siempre, para que las trazas
   deterministas no cambien. ?lazy=1 (o window.__lazyAssets=true) fuerza las dos tandas; ?lazy=0 las
   apaga; ?webp=0 apaga el WebP.
   ============================================================ */
const LAZY_IMG = (function(){
  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
  const S = { deferredOn:true, released:false, queue:[], webp:true, groups:{}, relGroups:new Set() };
  try{
    const q = new URLSearchParams(location.search);
    const forced = q.get("lazy")==="1" || window.__lazyAssets === true;
    if(q.get("lazy")==="0" || (navigator.webdriver && !forced)) S.deferredOn = false;
    if(q.get("webp")==="0") S.webp = false;
  }catch(e){}
  // segunda tanda: arte de arenas (enemigos, jefes, escenarios), TODOS los efectos (solo se ven en partida),
  // las hojas de las SKINS y CROMAS de los guardianes (~15 MB en PNG con la expedición) y sus hojas de set: hasta
  // que bajan se ve el atlas base (setSkinPackKey / champPackCloneAtlas) y la partida espera a que esté todo
  // (whenAssetsReady). Las miniaturas (preview) de las skins siguen en la primera tanda: las muestran la tienda y
  // la Sala. En 4G simulado la portada bajaba 24 MB y tardaba ~22 s (tools/audit/loadtime.js).
  // GRUPOS (carga por demanda): cada imagen diferida pertenece a un grupo y se suelta cuando hace falta.
  //   "ch:<campeón>"  todo lo pesado de UN guardián (atlas, hojas, skins, sets, cromas; las miniaturas siguen en la 1ª tanda)
  //   "ar:<arena>"    el arte de UNA arena (escenario, enemigos, jefes, efectos propios)
  //   "common"        efectos de habilidades y demás arte compartido
  // Antes la portada bajaba el atlas de los 38 guardianes (~17 MB) y la partida esperaba el arte de TODAS las arenas.
  const CH_RE = /(^|\/)assets\/sprites\/champions\/([^/]+)\/(?!preview|set-preview|skins\/[^/]+\/preview)/;
  const AR_DEFER_RE = /(^|\/)assets\/(sprites\/(arenas|enemies|bosses)\/|vfx\/)/;
  const AR_RE = /(^|\/)assets\/(?:sprites\/(?:arenas|enemies|bosses)|vfx|vfx\/bosses)\/(ciudad|fortaleza|bosque|micelial|hielo|acuatica|laberinto|abismo|minas|infernal|divina)\//;
  function groupOf(u){
    if(/assets\/sprites\/battlefield\//.test(u)){
      const key=u.split('/').pop().split('.')[0];
      const arenas={golem_cuerpos:'infernal',mn_titan:'minas',mn_cerbero:'minas',ab_carcelero:'abismo',cm_maestro:'ciudad',cm_dama:'ciudad',cm_tramoyista:'ciudad',cm_presentador:'ciudad',minotauro:'laberinto',leviatan:'acuatica',dragon_forja:'fortaleza',micelio:'micelial'};
      return arenas[key]?'ar:'+arenas[key]:'common';
    }
    let m = CH_RE.exec(u); if(m) return "ch:" + m[2];
    if(!AR_DEFER_RE.test(u)) return null;
    m = AR_RE.exec(u); return m ? "ar:" + m[2] : "common";
  }
  function isDeferred(u){ return groupOf(u) !== null; }
  function pick(u){
    if(!S.webp || typeof ASSET_WEBP==="undefined" || !/\.png(\?|$)/.test(u)) return u;
    const i = u.indexOf("assets/"); if(i < 0) return u;
    return ASSET_WEBP.has(u.slice(i).replace(/\?.*$/, "")) ? u.replace(/\.png(\?|$)/, ".webp$1") : u;
  }
  function onWebpErr(){
    this.removeEventListener("error", onWebpErr);
    const png = this.__pngSrc; this.__pngSrc = null;
    if(png){ S.webp = false; desc.set.call(this, png); } // este navegador no lee WebP: PNG de acá en más
  }
  function realSet(img, u){
    const w = pick(u);
    if(w !== u){ img.__pngSrc = u; img.addEventListener("error", onWebpErr); }
    desc.set.call(img, w);
  }
  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable:true, enumerable:desc.enumerable,
    get(){ return this.__lazySrc ? new URL(this.__lazySrc, document.baseURI).href : desc.get.call(this); },
    set(v){
      const u = String(v);
      if(S.deferredOn && !S.released){
        const g = groupOf(u);
        if(g && !S.relGroups.has(g)){ if(!this.__lazySrc) (S.groups[g] || (S.groups[g] = [])).push(this); this.__lazySrc = u; return; }
      }
      this.__lazySrc = null;
      realSet(this, u);
    }
  });
  // suelta UN grupo (las imágenes que ya pidieron cargar, y las que pidan después)
  function releaseGroup(g){
    if(S.relGroups.has(g)) return;
    S.relGroups.add(g);
    const q = S.groups[g] || []; S.groups[g] = [];
    for(const img of q){ const u = img.__lazySrc; if(!u) continue; img.__lazySrc = null; realSet(img, u); }
  }
  function release(){   // todo junto (compatibilidad y pruebas)
    if(S.released) return;
    S.released = true;
    for(const g of Object.keys(S.groups)) releaseGroup(g);
  }
  return { isDeferred, groupOf, release, releaseGroup, isGroupReleased:(g)=>S.released || S.relGroups.has(g), get deferredOn(){ return S.deferredOn; }, get released(){ return S.released; }, get webp(){ return S.webp; } };
})();
