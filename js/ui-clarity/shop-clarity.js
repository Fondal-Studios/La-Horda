"use strict";
/* ============================================================
   js/ui-clarity/shop-clarity.js — UC-SHOP v1 (claridad de la tienda de apariencias)
   NO crea monedas, precios ni flujos de pago, y NO es autoridad de nada: el saldo, el precio y la propiedad siguen siendo del
   servidor (js/systems/premium.js: /api/wallet/buy con referencia idempotente, bloqueo de compra en curso y verificación de precio).
   Esta capa solo hace legible lo que ya existe:
     · precio completo con el nombre de la moneda («✦ 800 Brasas») y, si no alcanza, cuánto falta y cuánto tenés (texto visible, no solo un tooltip);
       sin sesión: «Entrá con tu cuenta para comprar»;
     · la confirmación dice PARA QUIÉN, QUÉ TIPO de apariencia, que no cambia estadísticas y el saldo antes → después;
     · comparar «Ver original» / «Ver la skin» sobre la vista previa animada (la misma figura del juego, con y sin la apariencia);
     · un solo diálogo de compra por artículo (doble toque no abre dos confirmaciones ni dos pedidos);
     · eventos locales `uc:shop` {type,id} (sin datos de pago ni de cuenta) para medir el embudo cuando la telemetría los admita.
   Interruptores: ?uc=0 o localStorage.uc_off="1". Todo es DOM/CSS: no dibuja en canvas ni toca el guardado.
   ============================================================ */
(function(){
  try{ if(/[?&]uc=0\b/.test(location.search) || localStorage.getItem("uc_off")==="1") return; }catch(e){}
  var STATS = {open:0, view:0, buyStart:0, buyOk:0, buyError:0, cancel:0, compare:0, dupBlocked:0};
  var pending = {}, lastBuyId = null, seen = {};
  function emit(type, id){ if(STATS[type]!==undefined) STATS[type]++; try{ window.dispatchEvent(new CustomEvent("uc:shop", {detail:{type:type, id:id||""}})); }catch(e){} }
  function fmt(n){ return Number(n).toLocaleString("es-AR"); }
  function G(name){ try{ return window[name]; }catch(e){ return undefined; } }
  function balance(){ try{ return (typeof PREMIUM!=="undefined" && PREMIUM.premium!=null) ? PREMIUM.premium : null; }catch(e){ return null; } }
  function loggedIn(){ try{ return typeof premiumAvailable==="function" && premiumAvailable(); }catch(e){ return false; } }
  function champOf(id){
    try{ if(typeof SET_SKINS!=="undefined" && SET_SKINS[id] && typeof skinSetChamp==="function"){ var c = skinSetChamp(id); if(c) return premiumChampName(c); return "Universal (cualquier guardián compatible)"; }
         if(typeof CROMA_SKINS!=="undefined" && CROMA_SKINS[id]) return premiumChampName(CROMA_SKINS[id].champ); }catch(e){}
    return "";
  }
  function tierLabel(id){ try{ var t = premiumTier(id); return (typeof PREMIUM_TIER_LABEL!=="undefined" && PREMIUM_TIER_LABEL[t]) || "Apariencia"; }catch(e){ return "Apariencia"; } }

  /* ---- 1) precio completo y faltante, visibles ---- */
  function decorateButtons(panel){
    panel.querySelectorAll("[data-skin-premium]").forEach(function(b){
      var id = b.getAttribute("data-skin-premium"), price = 0; try{ price = premiumPrice(id); }catch(e){}
      if(!(price>0)) return;
      var want = "✦ " + fmt(price) + " Brasas"; if(b.textContent!==want) b.textContent = want;
      b.setAttribute("aria-label", "Comprar " + (typeof premiumSkinName==="function" ? premiumSkinName(id) : id) + " por " + fmt(price) + " Brasas");
      var bal0 = balance(); if(loggedIn() && bal0!=null){ var short = bal0 < price; if(b.disabled !== short) b.disabled = short; b.setAttribute("aria-disabled", short ? "true" : "false"); } /* el saldo cambia sin redibujar la tienda: el botón sigue al saldo real */
      var host = b.parentNode, note = host.querySelector(":scope > .uc-need[data-for=\"" + id + "\"]"), bal = balance(), text = "";
      if(!loggedIn()) text = "Entrá con tu cuenta para comprar con Brasas.";
      else if(bal!=null && bal < price) text = "Te faltan " + fmt(price - bal) + " Brasas · tenés " + fmt(bal) + ".";
      else if(bal!=null) text = "Tenés " + fmt(bal) + " Brasas · te quedarían " + fmt(bal - price) + ".";
      if(text){ if(!note){ note = document.createElement("div"); note.className = "uc-need"; note.setAttribute("data-for", id); note.setAttribute("role", "note"); b.insertAdjacentElement("afterend", note); } if(note.textContent!==text) note.textContent = text; note.classList.toggle("uc-short", bal!=null && bal<price || !loggedIn()); }
      else if(note) note.remove();
    });
  }

  // Colecciones (varias apariencias de un campeón con ahorro calculado por el servidor/precios reales): mismo criterio de precio y faltante
  function decorateCollections(panel){
    panel.querySelectorAll("[data-col-premium]").forEach(function(b){
      var k = b.getAttribute("data-col-premium"), q = null; try{ q = premiumCollection(k); }catch(e){} if(!q || !(q.price>0)) return;
      var want = "\u2726 " + fmt(q.price) + " Brasas"; if(b.textContent!==want) b.textContent = want;
      var bal = balance(), note = b.parentNode.querySelector(":scope > .uc-need[data-for=\"col-" + k + "\"]"), text = "";
      if(loggedIn() && bal!=null){ var short = bal < q.price; if(b.disabled !== short) b.disabled = short; if(short) text = "Te faltan " + fmt(q.price - bal) + " Brasas \u00b7 ten\u00e9s " + fmt(bal) + "."; }
      else if(!loggedIn()) text = "Entr\u00e1 con tu cuenta para comprar con Brasas.";
      if(text){ if(!note){ note = document.createElement("div"); note.className = "uc-need uc-short"; note.setAttribute("data-for", "col-" + k); note.setAttribute("role", "note"); b.insertAdjacentElement("afterend", note); } if(note.textContent!==text) note.textContent = text; }
      else if(note) note.remove();
    });
  }

  /* ---- 2) comparar base y variante sobre la vista previa animada ---- */
  function decorateCompare(panel){
    panel.querySelectorAll(".shop-skin").forEach(function(card){
      var cv = card.querySelector("canvas.shop-skin-anim"); if(!cv || card.querySelector(".uc-cmp")) return;
      var id = card.getAttribute("data-skin-card") || card.getAttribute("data-croma-card"); if(!id) return;
      var info = card.querySelector(".shop-skin-info") || card, b = document.createElement("button");
      b.type = "button"; b.className = "shop-btn sec uc-cmp"; b.setAttribute("data-uc-cmp", id); b.setAttribute("aria-pressed", "false"); b.textContent = "Ver original";
      info.appendChild(b); if(!seen[id]){ seen[id] = 1; emit("view", id); }
    });
  }
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-uc-cmp]"); if(!b) return; ev.preventDefault(); ev.stopPropagation();
    var card = b.closest(".shop-skin"), cv = card && card.querySelector("canvas.shop-skin-anim"), id = b.getAttribute("data-uc-cmp"); if(!cv) return;
    var base = cv.dataset.skin === ""; cv.dataset.skin = base ? id : ""; b.setAttribute("aria-pressed", base ? "false" : "true"); b.textContent = base ? "Ver original" : "Ver la skin"; emit("compare", id);
    var tag = card.querySelector(".uc-cmp-tag"); if(!tag){ tag = document.createElement("div"); tag.className = "uc-cmp-tag"; tag.setAttribute("aria-live", "polite"); (card.querySelector(".shop-skin-info")||card).insertBefore(tag, b); }
    tag.textContent = base ? "" : "Mostrando la apariencia ORIGINAL del guardián (sin esta skin)";
  }, true);

  /* ---- 3) un solo diálogo por artículo + confirmación con saldo y contenido ---- */
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-skin-premium]"); if(!b) return; var id = b.getAttribute("data-skin-premium");
    if(pending[id]){ ev.preventDefault(); ev.stopImmediatePropagation(); emit("dupBlocked", id); return; }
    pending[id] = true; lastBuyId = id; emit("buyStart", id);
  }, true);
  (function wrapConfirm(){
    var orig = window.gameConfirm; if(typeof orig!=="function" || orig.__uc) return;
    var w = function(message, opts){
      var id = lastBuyId, isBuy = id && typeof message==="string" && /^¿Comprar (el croma|la skin) /.test(message);
      if(isBuy){ var price = 0; try{ price = premiumPrice(id); }catch(e){} var bal = balance();
        message += "\n\nPara: " + champOf(id) + "\nTipo: " + tierLabel(id) + "\nCambia: solo la apariencia (no modifica estadísticas ni da ventajas)" + (bal!=null ? "\nTu saldo: " + fmt(bal) + " Brasas → después: " + fmt(bal - price) + " Brasas" : ""); }
      if(typeof message==="string" && /^\u00bfComprar la colecci\u00f3n de /.test(message)){ var qb = balance(), qm = message.match(/por ([\d.]+) Brasas/), qp = qm ? Number(qm[1].replace(/\./g, "")) : 0;
        message += "\n\nIncluye: todas las apariencias que todav\u00eda no ten\u00e9s de ese guardi\u00e1n (el ahorro sale de los precios vigentes)" + (qb!=null && qp ? "\nTu saldo: " + fmt(qb) + " Brasas \u2192 despu\u00e9s: " + fmt(qb - qp) + " Brasas" : ""); }
      var p = orig.call(this, message, opts);
      if(isBuy && p && p.then){ p.then(function(ok){ if(!ok){ emit("cancel", id); delete pending[id]; } }); }
      return p;
    }; w.__uc = true; window.gameConfirm = w;
  })();
  (function wrapBuy(){
    var orig = window.premiumBuySkin; if(typeof orig!=="function" || orig.__uc) return;
    var w = async function(id){ var r; try{ r = await orig.apply(this, arguments); } finally { delete pending[id]; } emit(r && r.ok ? "buyOk" : "buyError", id); return r; };
    w.__uc = true; window.premiumBuySkin = w;
  })();

  /* ---- 4) sugerencia según el guardián elegido (no bloquea nada: es una franja con un botón) ---- */
  function decorateReco(panel){
    var list = panel.querySelector(".shop-skin-list"); if(!list || panel.querySelector(".shop-skin-focus") || panel.querySelector(".uc-reco")) return;
    var k = typeof selectedClass!=="undefined" ? selectedClass : null; if(!k || typeof CLASSES==="undefined" || !CLASSES[k]) return;
    var n = 0; try{ n = premiumChampSkinIds(k).length; }catch(e){} if(!n) return;
    var bar = document.createElement("div"); bar.className = "uc-reco"; bar.setAttribute("role", "note");
    bar.innerHTML = '<span>Para tu guardi\u00e1n actual (<b></b>): <span class="uc-reco-n"></span></span> <button type="button" class="shop-btn sec" data-uc-reco></button>';
    bar.querySelector("b").textContent = premiumChampName(k); bar.querySelector(".uc-reco-n").textContent = n + (n===1 ? " apariencia sin comprar" : " apariencias sin comprar"); bar.querySelector("button").textContent = "Ver solo las de " + premiumChampName(k);
    list.parentNode.insertBefore(bar, list);
  }
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-uc-reco]"); if(!b) return; ev.preventDefault();
    try{ shopSkinFocus = selectedClass; if(typeof renderShop==="function") renderShop(); }catch(e){}
  }, true);

  /* ---- observar la tienda ---- */
  var raf = 0;
  function run(){ raf = 0; var panel = document.getElementById("shop-panel"); if(!panel) return; decorateButtons(panel); decorateCollections(panel); decorateCompare(panel); decorateReco(panel); }
  function sched(){ if(!raf) raf = requestAnimationFrame(run); }
  function boot(){
    var panel = document.getElementById("shop-panel"); if(!panel){ return setTimeout(boot, 500); }
    new MutationObserver(sched).observe(panel, {childList:true, subtree:true});
    document.addEventListener("premium-change", sched);
    var scr = document.getElementById("shop-screen"); if(scr) new MutationObserver(function(){ if(!scr.classList.contains("hidden")){ emit("open"); sched(); } }).observe(scr, {attributes:true, attributeFilter:["class"]});
    sched();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.UIClarityShop = {version:1, contract:"UC-SHOP-1", stats:STATS};
})();
