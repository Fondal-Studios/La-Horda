"use strict";
/* ============================================================
   js/assets/preload.js
   CARGA POR DEMANDA con grupos (ver lazy-images.js):
     1ª tanda (core)  lo que se ve al abrir: título, menús, miniaturas. "Tocá para continuar" se habilita
                      apenas termina ESTA tanda (antes también esperaba el atlas de los 38 guardianes: ~17 MB).
     grupos           "ch:<guardián>" (todo lo pesado de un guardián), "ar:<arena>" (arte de una arena) y "common"
                      (efectos compartidos). Se piden según lo que haga falta: tu guardián y el de tu equipo, la arena
                      elegida y los efectos comunes. El resto baja en segundo plano, de a poco.
   assetsAllReady() / whenAssetsReady(cb, onProgress) dicen si ya está lo NECESARIO para jugar la arena elegida con el
   equipo elegido; la partida espera a eso antes de arrancar (nunca se juega con sprites a medio cargar).
   ============================================================ */
const ASSET_LOAD = { core:{done:0, total:0}, rest:{done:0, total:0}, groups:{}, waiters:[], progress:[], restStarted:false, bgQueue:[] };
function _alGroup(g){ return ASSET_LOAD.groups[g] || null; }
function _alGroupReady(g){ const o = _alGroup(g); return !o || (o.started && o.done >= o.total); } // un grupo sin imágenes cuenta como listo
// Qué hace falta para jugar AHORA: efectos comunes, el arte de la arena elegida y el de cada guardián de la partida/sala.
function assetsNeededGroups(){
  const need = ["common"];
  try{ if(typeof currentArena!=="undefined" && currentArena) need.push("ar:"+currentArena); }catch(e){}
  try{
    const ks = new Set();
    if(typeof selectedClass!=="undefined" && selectedClass) ks.add(selectedClass);
    if(typeof lobbyAllies!=="undefined" && Array.isArray(lobbyAllies)) lobbyAllies.forEach(k=>ks.add(k));
    if(typeof netMatch!=="undefined" && netMatch && Array.isArray(netMatch.slots)) netMatch.slots.forEach(s=>{ if(s && s.champ) ks.add(s.champ); });
    if(typeof heroes!=="undefined" && Array.isArray(heroes)) heroes.forEach(h=>{ if(h && h.classKey) ks.add(h.classKey); });
    ks.forEach(k=>need.push("ch:"+k));
  }catch(e){}
  return need.filter(g=>_alGroup(g));
}
function assetsAllReady(){
  const c = ASSET_LOAD.core; if(c.done < c.total || !ASSET_LOAD.restStarted) return false;
  const need = assetsNeededGroups(); need.forEach(assetsStartGroup);
  return need.every(_alGroupReady);
}
function assetsRestPct(){
  const need = assetsNeededGroups(); let d = 0, t = 0;
  for(const g of need){ const o = _alGroup(g); if(o){ d += o.done; t += o.total; } }
  return t ? Math.floor(d*100/t) : 100;
}
function whenAssetsReady(cb, onProgress){
  if(assetsAllReady()){ cb(); return; }
  ASSET_LOAD.waiters.push(cb); if(onProgress) ASSET_LOAD.progress.push(onProgress);
}
let assetsStartGroup = function(){}, assetsStartAllChampions = function(){}, assetsOnState = function(){};
// Include atlas sources registered after this preloader, even with an older static manifest.
let assetsRegisterSource = function(){};
(function(){
  const btn = document.getElementById("title-continue-btn");
  if(typeof ASSET_MANIFEST === "undefined"){ ASSET_LOAD.restStarted = true; return; }
  const lazy = typeof LAZY_IMG !== "undefined" && LAZY_IMG.deferredOn;
  const core = [], byGroup = {};
  for(const src of ASSET_MANIFEST){
    const g = lazy ? LAZY_IMG.groupOf(src) : null;
    if(g) (byGroup[g] || (byGroup[g] = [])).push(src); else core.push(src);
  }
  ASSET_LOAD.core.total = core.length;
  for(const g in byGroup){ ASSET_LOAD.groups[g] = {list:byGroup[g], done:0, total:byGroup[g].length, started:false}; ASSET_LOAD.rest.total += byGroup[g].length; }
  const label = "Tocá para continuar"; // el HTML arranca en "Cargando…" y deshabilitado (no se puede tocar antes de tiempo)
  function load(list, bucket, onStep){
    for(const src of list){
      const im = new Image();
      let settled = false;
      const done = ok => { if(settled) return; settled = true; bucket.done++; if(!ok) console.error("No se pudo cargar la imagen:", src); onStep(); };
      im.addEventListener("load", ()=>done(true));
      // si falló el .webp, lazy-images.js reintenta con el .png (queda marcado en __pngSrc): se espera
      // a ese segundo intento, que dispara su propio load o error
      im.addEventListener("error", ()=>{ if(!im.__pngSrc) done(false); });
      im.src = src;
    }
  }
  function refreshTitle(){
    const c = ASSET_LOAD.core;
    if(!btn) return;
    if(c.done >= c.total){ btn.textContent = label; btn.disabled = false; return; }
    btn.textContent = "Cargando… " + Math.floor(c.done*100/Math.max(1, c.total)) + "%";
  }
  function refreshRest(){
    for(const f of ASSET_LOAD.progress){ try{ f(assetsRestPct()); }catch(e){} }
    pumpBackground();
    if(assetsAllReady()){
      const w = ASSET_LOAD.waiters; ASSET_LOAD.waiters = []; ASSET_LOAD.progress = [];
      for(const f of w){ try{ f(); }catch(e){ console.error(e); } }
    }
  }
  const registered = new Set(ASSET_MANIFEST);
  assetsRegisterSource = function(src){
    if(!src || registered.has(src) || /^(data:|blob:)/.test(src)) return;
    registered.add(src);
    const g = lazy ? LAZY_IMG.groupOf(src) : null;
    if(!g){
      ASSET_LOAD.core.total++;
      load([src], ASSET_LOAD.core, ()=>{ refreshTitle(); if(ASSET_LOAD.core.done >= ASSET_LOAD.core.total) startRest(); });
      return;
    }
    const o = ASSET_LOAD.groups[g] || (ASSET_LOAD.groups[g] = {list:[], done:0, total:0, started:false});
    o.list.push(src); o.total++; ASSET_LOAD.rest.total++;
    if(o.started) load([src], o, refreshRest);
    else if(ASSET_LOAD.restStarted){
      if(!ASSET_LOAD.bgQueue.includes(g)) ASSET_LOAD.bgQueue.push(g);
      assetsOnState(typeof state === "undefined" ? "title" : state);
      pumpBackground();
    }
  };
  assetsStartGroup = function(g){
    if(lazy) LAZY_IMG.releaseGroup(g);
    const o = ASSET_LOAD.groups[g]; if(!o || o.started) return;
    o.started = true;
    load(o.list, o, refreshRest);
  };
  // segundo plano: de a un grupo por vez, solo cuando lo necesario ya está (no le saca ancho de banda a lo que se está esperando)
  let bgBusy = 0;
  function pumpBackground(){
    if(!ASSET_LOAD.restStarted || ASSET_LOAD.core.done < ASSET_LOAD.core.total) return;
    const need = assetsNeededGroups();
    if(!need.every(_alGroupReady)) return;
    while(bgBusy < 2 && ASSET_LOAD.bgQueue.length){
      const g = ASSET_LOAD.bgQueue.shift(), o = ASSET_LOAD.groups[g]; if(!o || o.started) continue;
      bgBusy++; const prev = o.done; assetsStartGroup(g);
      const iv = setInterval(()=>{ if(o.done >= o.total){ clearInterval(iv); bgBusy--; pumpBackground(); } }, 400);
    }
  }
  assetsStartAllChampions = function(){ for(const g in ASSET_LOAD.groups) if(g.startsWith("ch:")) assetsStartGroup(g); };
  // pantallas que muestran muchos guardianes: se piden ya
  const CHAMP_SCREENS = new Set(["starter","champions","champhub","menu","prep","shop","codex","modeselect"]);
  assetsOnState = function(s){ try{ assetsNeededGroups().forEach(assetsStartGroup); }catch(e){} if(CHAMP_SCREENS.has(s)) assetsStartAllChampions(); };
  function startRest(){
    if(ASSET_LOAD.restStarted) return;
    ASSET_LOAD.restStarted = true;
    // prioridad: efectos comunes + la arena por defecto/elegida + los guardianes que se van a ver primero
    ["common"].forEach(assetsStartGroup);
    try{ assetsNeededGroups().forEach(assetsStartGroup); }catch(e){}
    try{ if(typeof DEFAULT_CHAMPION!=="undefined") assetsStartGroup("ch:"+DEFAULT_CHAMPION); }catch(e){}
    try{ ["tanque","guerrero","soporte"].forEach(k=>assetsStartGroup("ch:"+k)); }catch(e){}
    try{ assetsStartGroup("ar:ciudad"); }catch(e){}
    // el resto, de a poco: guardianes primero, después las demás arenas
    ASSET_LOAD.bgQueue = Object.keys(ASSET_LOAD.groups).sort((a, b)=>(a.startsWith("ch:") ? 0 : 1) - (b.startsWith("ch:") ? 0 : 1));
    refreshRest();
  }
  if(btn) btn.disabled = true;
  load(core, ASSET_LOAD.core, ()=>{ refreshTitle(); if(ASSET_LOAD.core.done >= ASSET_LOAD.core.total) startRest(); });
  refreshTitle();
  if(!core.length) startRest();
})();
