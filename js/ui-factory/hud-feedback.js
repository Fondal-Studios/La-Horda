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
  var FRAMES = { "btn-basic":1, "btn-s1":1, "btn-s2":1, "btn-s3":1, "btn-ult":1, "btn-emerg":1, "btn-pact":1 }; // marcos pixel-art (UF-ART v1)
  var HOLD_MS = 150, CONFIRM_WINDOW_MS = 600, CONFIRM_MS = 340, REJECT_MS = 260;
  var NAMES = { "btn-basic":"Ataque", "btn-s1":"Habilidad 1", "btn-s2":"Habilidad 2", "btn-s3":"Habilidad 3", "btn-ult":"Definitiva",
                "btn-emerg":"Curación de emergencia", "btn-pact":"Pacto", "btn-revive":"Revivir" };
  var metrics = { presses:0, confirms:0, rejects:0, lastLatencyMs:0, maxLatencyMs:0, lastQueueMs:0, maxQueueMs:0, log:[] };
  var live = {}; // id -> {src:Set, pending, holdT, basicCd}

  function now(){ return performance.now(); }
  function btn(id){ return document.getElementById(id); }
  function emit(name, detail){ try{ window.dispatchEvent(new CustomEvent(name, {detail:detail})); }catch(_){} }
  function playing(){ try{ return typeof state==="undefined" || state==="playing"; }catch(_){ return true; } }
  function pl(){ try{ return (typeof player!=="undefined" && player) ? player : null; }catch(_){ return null; } }
  function blockedKind(el){
    if(el.classList.contains("cd") || el.classList.contains("active")) return "cooldown"; // "active" = efecto en curso con cooldown corriendo
    if(el.classList.contains("noen")) return "resources";
    if(el.classList.contains("locked") || el.classList.contains("hidden") || el.classList.contains("spent")) return "locked";
    var p = pl(), id = el.id;
    if(p && id==="btn-ult" && p.classKey!=="ilkan" && p.classKey!=="libertador" && !el.classList.contains("ready") && !el.classList.contains("holding")) return "charging";
    if(p && id==="btn-pact" && p.classKey==="nigromante" && !p.nigroPact){
      var cost = (typeof NIGRO_PACT_COST!=="undefined") ? NIGRO_PACT_COST : 5;
      if((p.nigroSouls||0) < cost) return "resources"; // faltan almas
    }
    if(p && id==="btn-emerg" && typeof emergCanUse==="function"){ try{ if(!emergCanUse(p)) return "locked"; }catch(_){} }
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
    if(!el.querySelector(":scope > .uf-spr")){ var sp = document.createElement("b"); sp.className = "uf-spr"; sp.setAttribute("aria-hidden","true"); el.appendChild(sp); }
    if(FRAMES[el.id] && !el.querySelector(":scope > .uf-frame")){ var fr = document.createElement("i"); fr.className = "uf-frame"; fr.setAttribute("aria-hidden","true"); el.insertBefore(fr, el.firstChild); }
    if(el.id==="btn-ult" && !el.querySelector(":scope > .uf-cd")){ var cd = document.createElement("b"); cd.className = "uf-cd"; cd.setAttribute("aria-hidden","true"); el.appendChild(cd); }
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
      L.pending = snap(id);
    }
    emit("uf:press", {id:id, input:src, latencyMs:lat, queueMs:queue});
  }
  /* instantánea de los números del juego que cambian SOLO si la acción se ejecutó (lectura, sin escribir) */
  function snap(id){
    var p = pl(), o = { t:now(), id:id, bcd:basicCd(), ready:isReady(btn(id), id) };
    if(p){ o.cds = (p.cds||[]).slice(); o.ult = p.ultCharge||0; o.ultCd = p.ultCd||0; o.emerg = p.emergCharges; o.demon = !!p.nigroDemonForm; o.fused = !!p.fused; o.golem = !!p.golem; }
    return o;
  }
  function executed(id, o){
    var p = pl(); if(!p || !o) return false;
    var i = id==="btn-s1"?0 : id==="btn-s2"?1 : id==="btn-s3"?2 : -1;
    if(i>=0) return (p.cds&&o.cds) ? (p.cds[i]||0) > (o.cds[i]||0) + 1 : false;
    if(id==="btn-ult") return (p.ultCharge||0) < o.ult - 1 || (p.ultCd||0) > o.ultCd + 1 || (!!p.nigroDemonForm && !o.demon) || (!!p.fused && !o.fused) || (!!p.golem && !o.golem);
    if(id==="btn-emerg") return typeof p.emergCharges==="number" && typeof o.emerg==="number" && p.emergCharges < o.emerg;
    return false;
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
    var tn = now(); L.pending = null; L.lastConfirm = tn; metrics.confirms++;
    // el Ataque confirma en cada golpe: la animación no se reinicia mientras la anterior sigue corriendo
    if(!(id==="btn-basic" && L.lastVis && tn - L.lastVis < CONFIRM_MS + 40)){ L.lastVis = tn; restart(el, "uf-confirm", CONFIRM_MS); }
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
  // con js/core/input-desk.js las teclas dependen del esquema elegido en Opciones (Clásico / MOBA) y de lo reasignado
  function keyBtn(code){ return typeof deskBtnForCode==="function" ? deskBtnForCode(code) : KEYS[code]; }
  window.addEventListener("keydown", function(ev){
    if(ev.repeat || typing(ev)) return; var id = keyBtn(ev.code); if(!id) return;
    press(id, "key:"+ev.code, ev.timeStamp);
  }, {capture:true, passive:true});
  window.addEventListener("keyup", function(ev){ var id = keyBtn(ev.code); if(id) release(id, "key:"+ev.code); }, {capture:true, passive:true});

  /* ---- confirmación de ejecución: verdad de terreno leída del juego (cooldown iniciado, carga gastada, básico disparado) ----
     La presión pendiente vive mientras el dedo/tecla siguen abajo y hasta CONFIRM_WINDOW_MS después de soltar. */
  function watchBtns(){ IDS.forEach(function(id){ var el = btn(id); if(el && !el.__ufW){ el.__ufW = 1; decorate(el); } }); }
  var lastBcd = 0, ultTotal = 1, ultPrev = 0, ultSec = -1, ultQ = "";
  /* COOLDOWN DE LA DEFINITIVA (solo lectura de player.ultCd): barrido radial + segundos sobre el botón, como las habilidades 1-3 */
  function ultCooldown(){
    var el = btn("btn-ult"), p = pl(); if(!el || !p) return;
    var cd = p.ultCd||0;
    if(cd > ultPrev + 50) ultTotal = cd;          // empezó un cooldown nuevo: su duración total
    ultPrev = cd;
    var on = cd > 0 && playing();
    if(on !== el.classList.contains("uf-ultcd")) el.classList.toggle("uf-ultcd", on);
    if(!on){ ultSec = -1; return; }
    ensureFx(el);
    var q = Math.max(0, Math.min(1, cd/Math.max(1, ultTotal))).toFixed(2);
    if(q !== ultQ){ ultQ = q; el.style.setProperty("--ufcd", q); }
    var sec = Math.ceil(cd/1000);
    if(sec !== ultSec){ ultSec = sec; var n = el.querySelector(":scope > .uf-cd"); if(n) n.textContent = sec; }
  }
  function ensureFx(el){ if(!el.querySelector(":scope > .uf-cd")) fx(el); }
  function frame(){
    var t = now();
    for(var id in live){
      var L = live[id], o = L.pending; if(!o) continue;
      var held = Object.keys(L.src).length>0;
      if(!held){ if(!L.relT) L.relT = t; if(t - L.relT > CONFIRM_WINDOW_MS){ L.pending = null; L.relT = 0; continue; } } else L.relT = 0;
      if(id!=="btn-basic" && id!=="btn-pact" && executed(id, o)) confirm(id);
    }
    var B = live["btn-basic"], c = basicCd();
    if(B && Object.keys(B.src).length && c>lastBcd+1 && (!B.lastConfirm || t-B.lastConfirm>120)){ B.pending = B.pending || {t:t}; confirm("btn-basic"); B.pending = {t:t}; }
    lastBcd = c;
    ultCooldown();
    requestAnimationFrame(frame);
  }
  /* accesibilidad: rol, nombre y aria-disabled (solo atributos, sin tocar el juego) */
  function decorate(el){
    fx(el);
    if(!el.getAttribute("role")) el.setAttribute("role","button");
    if(!el.getAttribute("aria-label")) el.setAttribute("aria-label", NAMES[el.id]||el.id);
    // Sin tabindex a propósito: Enter/Espacio sobre un div enfocado no ejecutaría nada y Espacio ya es "atacar" en partida.
    // Los atajos reales se anuncian con aria-keyshortcuts.
    var ks = { "btn-basic":"Space", "btn-s1":"1", "btn-s2":"2", "btn-s3":"3", "btn-ult":"R", "btn-emerg":"Q", "btn-pact":"F" }[el.id]; // (input-desk.js lo actualiza al cambiar de esquema)
    if(ks && !el.getAttribute("aria-keyshortcuts")) el.setAttribute("aria-keyshortcuts", ks);
  }
  function syncAria(){
    IDS.forEach(function(id){ var el = btn(id); if(!el) return;
      var b = !!blockedKind(el); if(el.getAttribute("aria-disabled")!==(b?"true":"false")) el.setAttribute("aria-disabled", b?"true":"false"); });
  }
  /* UF-ART v2: marcos propios de cada héroe (atlas css/ui-factory/fx/hero/<héroe>.png). Si el atlas no existe se mantienen los marcos genéricos */
  var heroKey = "", heroTok = 0;
  function syncHeroArt(){
    var p = pl(), key = p && p.classKey ? String(p.classKey) : ""; if(key===heroKey) return; heroKey = key;
    try{ if(window.UIFactory && UIFactory.hero) UIFactory.hero.apply(key); }catch(_){}   // UF-HERO v1: cara, borde e ícono de Ataque del héroe
    var c = document.getElementById("controls"); if(!c) return; var tok = ++heroTok;
    if(!key || !/^[a-z0-9_]+$/.test(key)){ c.removeAttribute("data-uf-art"); return; }
    var url = "css/ui-factory/fx/hero/" + key + ".png", im = new Image();
    im.onload = function(){ if(tok!==heroTok) return; c.style.setProperty("--uf-atlas", 'url("' + new URL(url, document.baseURI).href + '")'); /* absoluta: una URL en una variable CSS se resuelve contra la hoja, no el documento */ c.setAttribute("data-uf-art","hero"); c.setAttribute("data-uf-hero", key); };
    im.onerror = function(){ if(tok!==heroTok) return; c.removeAttribute("data-uf-art"); c.removeAttribute("data-uf-hero"); };
    im.src = url;
  }
  /* D2: el aviso OBJETIVO (animación de 7 s) se re-arma cada vez que el juego cambia su texto o lo vuelve a mostrar */
  function watchGoal(){
    var g = document.getElementById("goal-chip"); if(!g || g.__ufG) return; g.__ufG = 1; var last = g.textContent;
    new MutationObserver(function(){ if(g.textContent===last) return; last = g.textContent; g.style.animation = "none"; void g.offsetWidth; g.style.animation = ""; })
      .observe(g, {childList:true, characterData:true, subtree:true});
  }
  function boot(){ watchGoal(); watchBtns(); syncAria(); setInterval(function(){ watchBtns(); syncAria(); syncHeroArt(); }, 500); requestAnimationFrame(frame); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot); else boot();

  window.UIFactory = { version:1, contract:"UF-HUD-1", metrics:metrics, ids:IDS.slice(), keys:Object.assign({}, KEYS) };
})();
