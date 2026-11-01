/* js/ui-factory/hud-feedback.js — UI Factory · HUD feedback adapter (contrato UF-HUD v1).
   SOLO OBSERVA el juego: no llama funciones del juego ni modifica su estado. Añade clases/atributos de presentación
   a los botones #btn-* y emite eventos DOM. Se puede apagar con ?uf=0, localStorage uf_off=1 o body.uf-off.
   Estados que distingue (docs/ui-factory/INTEGRATION_CONTRACTS.md §3):
     uf-press    presión recibida (se aplica SINCRÓNICAMENTE dentro del handler del evento de entrada)
     uf-hold     presión mantenida (>= HOLD_MS)
     uf-confirm  ejecución confirmada por el juego (el botón sale de "ready" o sube basicCd tras la presión)
     uf-reject   presión sobre un botón en cooldown / sin recursos / bloqueado (no se ejecutó nada)
   Entradas: puntero (mouse/táctil/lápiz) y teclado. Eventos: uf:press, uf:confirm, uf:reject, uf:release en window. */
(function(){
  "use strict";
  var off = false;
  try{ off = /[?&]uf=0\b/.test(location.search) || localStorage.getItem("uf_off")==="1"; }catch(_){}
  if(off || window.UIFactory) { if(off) document.documentElement.classList.add("uf-off"); return; }

  var IDS = ["btn-basic","btn-s1","btn-s2","btn-s3","btn-ult","btn-emerg","btn-pact","btn-revive"];
  var KEYS = { Space:"btn-basic", KeyJ:"btn-basic", Digit1:"btn-s1", Numpad1:"btn-s1", Digit2:"btn-s2", Numpad2:"btn-s2",
               Digit3:"btn-s3", Numpad3:"btn-s3", KeyR:"btn-ult", Digit4:"btn-ult", Numpad4:"btn-ult", KeyQ:"btn-emerg", KeyF:"btn-pact" };
  var HOLD_MS = 150, CONFIRM_WINDOW_MS = 600, CONFIRM_MS = 340, REJECT_MS = 260;
  var NAMES = { "btn-basic":"Ataque", "btn-s1":"Habilidad 1", "btn-s2":"Habilidad 2", "btn-s3":"Habilidad 3", "btn-ult":"Definitiva",
                "btn-emerg":"Curación de emergencia", "btn-pact":"Pacto", "btn-revive":"Revivir" };
  var metrics = { presses:0, confirms:0, rejects:0, lastLatencyMs:0, maxLatencyMs:0, lastQueueMs:0, maxQueueMs:0, log:[] };
  var live = {}; // id -> {src:Set, pending, holdT, basicCd}

  function now(){ return performance.now(); }
  function btn(id){ return document.getElementById(id); }
  function emit(name, detail){ try{ window.dispatchEvent(new CustomEvent(name, {detail:detail})); }catch(_){} }
  function playing(){ try{ return typeof state==="undefined" || state==="playing"; }catch(_){ return true; } }
  function blockedKind(el){
    if(el.classList.contains("cd") || el.classList.contains("active")) return "cooldown"; // "active" = efecto en curso con cooldown corriendo
    if(el.classList.contains("noen")) return "resources";
    if(el.classList.contains("locked") || el.classList.contains("hidden")) return "locked";
    return "";
  }
  function isReady(el, id){
    if(id==="btn-basic") return true;
    return el.classList.contains("ready") || el.classList.contains("holding");
  }
  function basicCd(){ try{ return (typeof player!=="undefined" && player) ? (player.basicCd||0) : 0; }catch(_){ return 0; } }
  function fx(el){
    var f = el.querySelector(":scope > .uf-fx");
    if(!f){ f = document.createElement("i"); f.className = "uf-fx"; f.setAttribute("aria-hidden","true"); el.appendChild(f); }
    return f;
  }
  function restart(el, cls, ms){
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(function(){ el.classList.remove(cls); }, ms);
  }

  function press(id, src, ts){
    var el = btn(id); if(!el || !playing()) return;
    var L = live[id] || (live[id] = {src:{}, pending:null, holdT:0});
    var first = !Object.keys(L.src).length;
    L.src[src] = true;
    if(!first) return;
    fx(el);
    var t0 = ts || now(), tH = now();
    el.classList.add("uf-press");                       // ← feedback inmediato, dentro del handler de entrada
    // handlerMs = lo que tarda ESTE módulo desde que entra al handler hasta que la clase está aplicada (≈0);
    // queueMs = demora del navegador entre el evento de hardware y el handler (hilo principal ocupado), no atribuible al módulo.
    var lat = Math.max(0, now() - tH), queue = Math.max(0, tH - t0);
    metrics.presses++; metrics.lastLatencyMs = lat; metrics.lastQueueMs = queue; if(lat>metrics.maxLatencyMs) metrics.maxLatencyMs = lat; if(queue>metrics.maxQueueMs) metrics.maxQueueMs = queue;
    if(metrics.log.length<200) metrics.log.push({id:id, src:src, handlerMs:+lat.toFixed(3), queueMs:+queue.toFixed(1)});
    clearTimeout(L.holdT); L.holdT = setTimeout(function(){ if(Object.keys(L.src).length) el.classList.add("uf-hold"); }, HOLD_MS);
    var kind = blockedKind(el);
    if(kind){
      restart(el, "uf-reject", REJECT_MS); el.dataset.ufReject = kind; metrics.rejects++;
      emit("uf:reject", {id:id, reason:kind, input:src});
      L.pending = null;
    } else {
      L.pending = { t:now(), ready:isReady(el,id), bcd:basicCd() };
    }
    emit("uf:press", {id:id, input:src, latencyMs:lat, queueMs:queue});
  }
  function release(id, src){
    var L = live[id], el = btn(id); if(!L || !el) return;
    delete L.src[src];
    if(Object.keys(L.src).length) return;
    clearTimeout(L.holdT);
    el.classList.remove("uf-press","uf-hold");
    emit("uf:release", {id:id, input:src});
  }
  function confirm(id){
    var el = btn(id), L = live[id]; if(!el || !L || !L.pending) return;
    L.pending = null; metrics.confirms++;
    restart(el, "uf-confirm", CONFIRM_MS);
    emit("uf:confirm", {id:id});
  }
  function releaseAll(){ for(var id in live){ live[id].src = {}; clearTimeout(live[id].holdT); var el = btn(id); if(el) el.classList.remove("uf-press","uf-hold"); } }

  /* ---- entrada: puntero (captura, antes que cualquier handler del juego) ---- */
  function ptrId(ev){ var t = ev.target; var el = t && t.closest ? t.closest(".ability-btn") : null; return el && IDS.indexOf(el.id)>=0 ? el.id : ""; }
  var ptrMap = {};
  document.addEventListener("pointerdown", function(ev){
    if(ev.pointerType==="mouse" && ev.button!==0) return;
    var id = ptrId(ev); if(!id) return;
    ptrMap[ev.pointerId] = id; press(id, "ptr"+ev.pointerId, ev.timeStamp);
  }, {capture:true, passive:true});
  function ptrEnd(ev){ var id = ptrMap[ev.pointerId]; if(id){ delete ptrMap[ev.pointerId]; release(id, "ptr"+ev.pointerId); } }
  ["pointerup","pointercancel","lostpointercapture"].forEach(function(n){ document.addEventListener(n, ptrEnd, {capture:true, passive:true}); });
  window.addEventListener("blur", function(){ ptrMap = {}; releaseAll(); });
  document.addEventListener("visibilitychange", function(){ if(document.hidden){ ptrMap = {}; releaseAll(); } });

  /* ---- entrada: teclado ---- */
  function typing(ev){ var t = ev.target && ev.target.tagName; return t==="INPUT" || t==="TEXTAREA" || t==="SELECT"; }
  window.addEventListener("keydown", function(ev){
    if(ev.repeat || typing(ev)) return; var id = KEYS[ev.code]; if(!id) return;
    press(id, "key:"+ev.code, ev.timeStamp);
  }, {capture:true, passive:true});
  window.addEventListener("keyup", function(ev){ var id = KEYS[ev.code]; if(id) release(id, "key:"+ev.code); }, {capture:true, passive:true});

  /* ---- confirmación de ejecución: el juego cambia el estado del botón tras la presión ---- */
  var mo = new MutationObserver(function(list){
    for(var i=0;i<list.length;i++){
      var el = list[i].target, id = el.id, L = live[id];
      if(!L || !L.pending || now()-L.pending.t>CONFIRM_WINDOW_MS) continue;
      if(id!=="btn-basic" && L.pending.ready && !isReady(el,id)) confirm(id);
    }
  });
  function watchBtns(){ IDS.forEach(function(id){ var el = btn(id); if(el && !el.__ufW){ el.__ufW = 1; mo.observe(el, {attributes:true, attributeFilter:["class","data-state"]}); decorate(el); } }); }
  /* Ataque básico: confirmación = sube basicCd (el juego disparó) mientras está presionado */
  var lastBcd = 0;
  function frame(){
    var L = live["btn-basic"], c = basicCd();
    if(L && Object.keys(L.src).length && c>lastBcd + 1) { L.pending = L.pending || {t:now(), ready:true, bcd:lastBcd}; confirm("btn-basic"); L.pending = {t:now(), ready:true, bcd:c}; }
    lastBcd = c;
    requestAnimationFrame(frame);
  }
  /* accesibilidad: rol, nombre y aria-disabled (solo atributos, sin tocar el juego) */
  function decorate(el){
    if(!el.getAttribute("role")) el.setAttribute("role","button");
    if(!el.getAttribute("aria-label")) el.setAttribute("aria-label", NAMES[el.id]||el.id);
  }
  function syncAria(){
    IDS.forEach(function(id){ var el = btn(id); if(!el) return;
      var b = !!blockedKind(el); if(el.getAttribute("aria-disabled")!==(b?"true":"false")) el.setAttribute("aria-disabled", b?"true":"false"); });
  }
  function boot(){ watchBtns(); syncAria(); setInterval(function(){ watchBtns(); syncAria(); }, 500); requestAnimationFrame(frame); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot); else boot();

  window.UIFactory = { version:1, contract:"UF-HUD-1", metrics:metrics, ids:IDS.slice(), keys:Object.assign({}, KEYS) };
})();
