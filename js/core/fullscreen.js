"use strict";
/* ============================================================
   js/core/fullscreen.js
   ANDROID: pantalla completa y horizontal.
   En Chrome para Android, con el teléfono acostado la barra de direcciones y la de navegación se comen
   ~56 px de los ~360-410 de alto, y como la página no scrollea nunca se esconden solas: el juego quedaba
   más bajito que en iPhone (HUD encimado, menos arena a la vista). Al tocar "Toca para continuar",
   "Unirse", "Listo" o "Comenzar" se pide pantalla completa (Fullscreen API, necesita ese toque) y se
   traba la orientación horizontal. Si se sale con el botón Atrás, el próximo de esos toques la vuelve a pedir.
   iPhone no tiene Fullscreen API para páginas: no hace nada (ahí manda "Agregar a inicio"). Escritorio
   (sin pantalla táctil): no se pide sola. ?fs=0 lo apaga; en pruebas automatizadas está apagado salvo ?fs=1.
   Instalado desde Chrome ("Agregar a la pantalla principal"), manifest.webmanifest ya abre así.
   ESCRITORIO: F11 y Alt+Enter ALTERNAN pantalla completa / ventana con la misma Fullscreen API (toggle()).
   La tecla es el gesto que la API exige; no traba la orientación ni cambia nada del camino de Android.
   Si el juego corre empaquetado y la app ofrece window.HORDA_DESKTOP.setFullscreen, se usa eso.
   ============================================================ */
const FULLSCREEN = (function(){
  let q; try{ q = new URLSearchParams(location.search); }catch(e){ q = new URLSearchParams(""); }
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  const coarse = typeof matchMedia==="function" && matchMedia("(pointer:coarse)").matches;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints > 1);
  const on = !!req && coarse && !ios && q.get("fs")!=="0" && !(navigator.webdriver && q.get("fs")!=="1");
  const S = { requests:0, lockOk:null, toggles:0, native:false };
  function active(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function lockLandscape(){
    try{
      if(screen.orientation && typeof screen.orientation.lock==="function")
        screen.orientation.lock("landscape").then(()=>{ S.lockOk = true; }, ()=>{ S.lockOk = false; });
    }catch(e){ S.lockOk = false; }
  }
  function enter(){
    if(!on || active()) return false;
    S.requests++;
    try{
      const p = req.call(el, {navigationUI:"hide"});
      if(p && typeof p.then==="function") p.then(lockLandscape, ()=>{}); else lockLandscape();
    }catch(e){ return false; }
    return true;
  }
  function leave(){
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    if(!ex) return false;
    try{ const p = ex.call(document); if(p && typeof p.catch==="function") p.catch(()=>{}); }catch(e){ return false; }
    return true;
  }
  // Alterna (F11 / Alt+Enter). No depende de "on": es un pedido explícito del jugador, también en escritorio.
  function toggle(){
    if(q.get("fs")==="0") return false;
    S.toggles++;
    try{
      const D = window.HORDA_DESKTOP; // app de escritorio: la ventana la maneja la app
      if(D && typeof D.setFullscreen==="function"){ S.native = !S.native; D.setFullscreen(); return true; }   // sin argumento: la app alterna según el estado REAL de la ventana (F11 lo cambia sin avisarle al juego)
    }catch(e){}
    if(active()) return leave();
    if(!req) return false;
    try{ const p = req.call(el, {navigationUI:"hide"}); if(p && typeof p.catch==="function") p.catch(()=>{}); }catch(e){ return false; }
    return true;
  }
  window.addEventListener("keydown", (ev)=>{
    const f11 = ev.code==="F11" && !ev.altKey && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey;
    const altEnter = (ev.code==="Enter" || ev.code==="NumpadEnter") && ev.altKey && !ev.ctrlKey && !ev.metaKey;
    if(!f11 && !altEnter) return;
    if(q.get("fs")==="0" || (!req && !(window.HORDA_DESKTOP && typeof window.HORDA_DESKTOP.setFullscreen==="function"))) return; // sin API: la tecla sigue siendo del navegador
    ev.preventDefault(); ev.stopPropagation(); // Alt+Enter no "aprieta" el botón con foco; F11 no dispara además la del navegador
    if(!ev.repeat) toggle();
  }, true);
  // un solo oyente: los botones que arrancan algo (el click es un gesto válido para la Fullscreen API)
  const SEL = "#title-continue-btn, #title-join-btn, #mode-join-btn, #net-ready-btn, #prep-start-btn, #run-intro .ri-go";
  document.addEventListener("click", (ev)=>{
    const t = ev.target && ev.target.closest ? ev.target.closest(SEL) : null;
    if(t) enter();
  }, true);
  return { enter, active, toggle, get toggles(){ return S.toggles; }, get enabled(){ return on; }, get requests(){ return S.requests; }, get lockOk(){ return S.lockOk; } };
})();

/* Opciones › Pantalla: botón de pantalla completa y, solo en la app de escritorio, "Salir del juego". */
(function wireScreenOptions(){
  function wire(){
    const fs = document.getElementById("opt-fs-btn"), qr = document.getElementById("opt-quit-row"), qb = document.getElementById("opt-quit-btn");
    if(fs) fs.addEventListener("click", ()=>{ try{ FULLSCREEN.toggle(); }catch(e){} });
    const D = window.HORDA_DESKTOP;
    if(D && D.desktop && document.body) document.body.classList.add("app-desktop"); // css/pc-desktop.css: la beta de Steam muestra Campaña y Horda Infinita
    if(qr && D && typeof D.quit === "function") qr.hidden = false;
    if(qb) qb.addEventListener("click", async ()=>{
      const D2 = window.HORDA_DESKTOP; if(!D2 || typeof D2.quit !== "function") return;
      let ok = true; try{ ok = typeof gameConfirm === "function" ? await gameConfirm("¿Cerrar el juego? Tu progreso ya está guardado.", {okText:"Salir"}) : true; }catch(e){}
      if(ok) try{ if(typeof persistNow === "function") persistNow(); }catch(e){} if(ok) D2.quit();
    });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire); else wire();
})();
