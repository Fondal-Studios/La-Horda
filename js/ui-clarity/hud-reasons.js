"use strict";
/* ============================================================
   js/ui-clarity/hud-reasons.js — UC-HUD v1 (claridad de la interfaz en partida)
   Dice POR QUÉ una habilidad no se puede usar, sin tapar el combate, y deja el estado visible sin tocar el botón.
     · Consume el contrato UF-HUD v1 de la UI Factory (docs/ui-factory/INTEGRATION_CONTRACTS.md): el evento `uf:reject {id, reason, input}`
       y los estados que ya pone js/ui/hud.js (ready / cd / noen / locked, data-state). No cambia reglas, cooldowns ni costos: solo LEE player/CLASSES.
     · Una sola burbuja a la vez (sin apilar), en la esquina superior derecha bajo Pausa: fuera del centro de la acción y lejos de los controles.
       Pulsar 20 veces seguidas actualiza la misma burbuja: no genera mensajes ni acciones duplicadas.
     · Etiqueta corta persistente en el propio botón cuando falta energía («FALTA 12»): se entiende sin pulsar, no depende del color.
   Interruptores: ?uc=0 o localStorage.uc_off="1". Respeta body.reduce-motion (sin animación). Emite `uc:reason {id, text, kind}` en window.
   ============================================================ */
(function(){
  try{ if(/[?&]uc=0\b/.test(location.search) || localStorage.getItem("uc_off")==="1"){ document.documentElement.classList.add("uc-off"); return; } }catch(e){}
  var IDX = {"btn-s1":0, "btn-s2":1, "btn-s3":2};
  var NAME = {"btn-basic":"Ataque", "btn-ult":"Definitiva", "btn-emerg":"Cura", "btn-pact":"Pacto", "btn-revive":"Revivir"};
  var bubble = null, hideT = 0, cur = null;
  function pl(){ try{ return (typeof player!=="undefined" && player) ? player : null; }catch(e){ return null; } }
  function skillOf(id){ var p = pl(); if(!p || !p.cls) return null; if(id==="btn-ult") return p.cls.ultimate || null; var i = IDX[id]; return i===undefined ? null : (p.cls.skills && p.cls.skills[i]) || null; }
  function nameOf(id){ var s = skillOf(id); return (s && s.name) || NAME[id] || "Habilidad"; }
  function secs(ms){ return Math.max(1, Math.ceil((ms||0)/1000)); }
  // Texto del motivo, calculado en el momento a partir del estado real (nunca de una copia).
  function reasonFor(id, reason){
    var p = pl(); if(!p) return null;
    if(reason==="cooldown"){
      var ms = id==="btn-ult" ? p.ultCd : id==="btn-basic" ? p.basicCd : IDX[id]!==undefined ? (p.cds||[])[IDX[id]] : 0;
      return {kind:"cooldown", text:"recarga " + secs(ms) + " s"};
    }
    if(reason==="resources"){
      var sk = skillOf(id), miss = sk && typeof sk.cost==="number" ? Math.ceil(sk.cost - (p.energy||0)) : 0;
      return {kind:"resources", text: miss>0 ? "faltan " + miss + " de energía" : "sin energía"};
    }
    if(id==="btn-ult"){
      var lvl = typeof ULT_MIN_ARENA_LEVEL==="number" ? ULT_MIN_ARENA_LEVEL : 0;
      if(typeof runLevel==="number" && runLevel < lvl) return {kind:"locked", text:"se desbloquea en el nivel " + lvl};
      if(p.ultMax && p.ultCharge < p.ultMax) return {kind:"charge", text:"carga " + Math.floor(100*p.ultCharge/p.ultMax) + " %"};
    }
    return {kind:"locked", text:"no disponible ahora"};
  }
  function ensure(){
    if(bubble && bubble.isConnected) return bubble;
    bubble = document.createElement("div"); bubble.className = "uc-reason"; bubble.setAttribute("role", "status"); bubble.setAttribute("aria-live", "polite");
    var host = document.getElementById("controls") || document.body; host.appendChild(bubble); return bubble;
  }
  function place(b){
    // bajo el botón de Pausa y bajo la pila de avisos si está visible: nunca en el centro ni encima de los botones de combate
    var top = 58, st = document.getElementById("toast-stack");
    if(st && st.getBoundingClientRect){ var r = st.getBoundingClientRect(); if(r.height>2 && r.width>2) top = Math.max(top, Math.round(r.bottom + 4)); }
    b.style.top = top + "px";
    // pantallas bajas: si choca con el botón más alto del cluster, sube hasta pegarse justo encima de él (sin tapar botones)
    var limit = 1e9, btns = document.querySelectorAll(".ability-btn");
    for(var i=0;i<btns.length;i++){ var br = btns[i].getBoundingClientRect(); if(br.width>2 && br.height>2 && br.left > innerWidth*0.4 && +getComputedStyle(btns[i]).opacity > 0.05) limit = Math.min(limit, br.top); }
    var h = b.offsetHeight || 36; if(top + h > limit - 3) b.style.top = Math.max(8, Math.round(limit - 3 - h)) + "px";
  }
  function show(id, info){
    var b = ensure(), label = nameOf(id) + ": " + info.text;
    if(cur && cur.id===id && cur.kind===info.kind){ b.textContent = label; }   // misma causa: se refresca, no se apila
    else { b.textContent = label; b.setAttribute("data-kind", info.kind); b.classList.remove("uc-in"); void b.offsetWidth; b.classList.add("uc-in"); window.dispatchEvent(new CustomEvent("uc:reason", {detail:{id:id, text:label, kind:info.kind}})); }
    cur = {id:id, kind:info.kind, reason:info.kind}; place(b); b.classList.add("uc-on");
    clearTimeout(hideT); hideT = setTimeout(function(){ b.classList.remove("uc-on"); cur = null; }, 1600);
  }
  window.addEventListener("uf:reject", function(ev){
    var d = ev.detail || {}; if(!d.id) return; var info = reasonFor(d.id, d.reason); if(info) show(d.id, info);
  });
  // la cuenta regresiva de la burbuja sigue al estado real mientras está visible
  setInterval(function(){ if(!cur || !bubble || !bubble.classList.contains("uc-on")) return; var info = reasonFor(cur.id, cur.reason==="cooldown" || cur.kind==="cooldown" ? "cooldown" : cur.kind==="resources" ? "resources" : "locked"); if(info && info.kind===cur.kind) bubble.textContent = nameOf(cur.id) + ": " + info.text; }, 250);

  // Etiqueta persistente en el botón: «FALTA n» cuando la habilidad está lista salvo por energía (no depende del color)
  function badges(){
    var p = pl(); if(!p) return;
    for(var id in IDX){ var el = document.getElementById(id); if(!el) continue; var bd = el.querySelector(":scope > .uc-badge");
      var sk = skillOf(id), miss = (el.classList.contains("noen") && sk && typeof sk.cost==="number") ? Math.ceil(sk.cost - (p.energy||0)) : 0;
      if(miss>0){ el.classList.add("uc-noen"); if(!bd){ bd = document.createElement("i"); bd.className = "uc-badge"; bd.setAttribute("aria-hidden", "true"); el.appendChild(bd); } var t = "FALTA " + miss; if(bd.textContent!==t) bd.textContent = t; }
      else { el.classList.remove("uc-noen"); if(bd) bd.remove(); } }
  }
  setInterval(function(){ try{ if(typeof state==="undefined" || state==="playing") badges(); }catch(e){} }, 300);
  window.UIClarity = {version:1, contract:"UC-HUD-1", reasonFor:reasonFor};
})();
