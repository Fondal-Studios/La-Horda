"use strict";
/* ============================================================
   js/ui-clarity/shop-clarity.js — UC-SHOP v1 (claridad de la ficha de apariencia en la Tienda).
   SOLO LEE: no crea monedas, precios ni catálogo. Fuente única: premiumPrice()/PREMIUM (js/systems/premium.js, precios en js/data/pricing.js,
   saldo del servidor) y skinOwnedFull()/skinIsActiveOn() (la misma que usan inventario y partida). No usa js/systems/cosmetic-catalog.js (simulado).
     · UCShop.skinLine(id, previewKey) -> HTML con el ESTADO en texto (disponible / adquirida / equipada / bloqueada), el precio y el saldo/faltante
       a la vista (antes el motivo de un botón deshabilitado vivía solo en el atributo title, que no existe en el móvil).
     · «Ver base / Ver skin»: alterna la vista previa animada de la tarjeta entre el guardián sin skin y con ella (mismo dibujo que la partida).
   Interruptor: ?uc=0 o localStorage.uc_off="1" (igual que UC-HUD): la tienda vuelve a como estaba.
   ============================================================ */
(function(){
  var off = false;
  try{ off = /[?&]uc=0\b/.test(location.search) || localStorage.getItem("uc_off")==="1"; }catch(e){}
  function fmt(n){ return typeof premiumFmt==="function" ? premiumFmt(n) : String(n); }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function setName(id){ try{ return (SET_DB[id] && SET_DB[id].name) || id; }catch(e){ return id; } }

  // Estado de una apariencia de set (lo que la tienda muestra como etiqueta de texto).
  function skinState(id){
    var owned = typeof skinOwnedFull==="function" && skinOwnedFull(id);
    var comp = typeof skinCompatibleChamps==="function" ? skinCompatibleChamps(id) : [];
    var active = owned && comp.some(function(k){ return skinIsActiveOn(id, k); });
    if(active) return "equipped";
    if(owned) return "owned";
    var price = typeof premiumPrice==="function" ? premiumPrice(id) : 0;
    return price > 0 ? "available" : "locked";
  }
  function skinLine(id, previewKey){
    if(off) return "";
    var st = skinState(id), html = "";
    if(st==="available" && typeof premiumPendingFor==="function" && premiumPendingFor("skin:" + id)){
      html += '<div class="uc-shop-state uc-st-pending"><b>⏳ PENDIENTE</b> · la compra se envió y no recibimos confirmación. Tocá «Confirmar entrega»: si ya se cobró, no se vuelve a cobrar.</div>';
    } else if(st==="available"){
      var price = premiumPrice(id), P = typeof PREMIUM!=="undefined" ? PREMIUM : null;
      var line = typeof premiumBalanceLine==="function" ? premiumBalanceLine(price) : "";
      if(typeof premiumAvailable==="function" && !premiumAvailable()) line = "Iniciá sesión para comprar con Brasas";
      html += '<div class="uc-shop-state uc-st-available"><b>◇ DISPONIBLE</b> · ✦ ' + fmt(price) + ' Brasas · solo se paga con Brasas</div>' + (line ? '<div class="uc-shop-bal' + (P && P.premium!=null && P.premium<price ? ' uc-short' : '') + '">' + esc(line) + '</div>' : "");
    } else if(st==="locked"){
      html += '<div class="uc-shop-state uc-st-locked"><b>🔒 BLOQUEADA</b> · no se vende: se gana completando el set «' + esc(setName(id)) + '» jugando. Las piezas se consiguen en partida.</div>';
    } else if(st==="owned"){
      html += '<div class="uc-shop-state uc-st-owned"><b>✔ ADQUIRIDA</b> · todavía no la tenés equipada</div>';
    } else {
      html += '<div class="uc-shop-state uc-st-equipped"><b>★ EQUIPADA</b> · es la que se ve en tus partidas</div>';
    }
    if(previewKey) html += '<button type="button" class="shop-btn sec uc-compare" data-uc-compare="' + esc(id) + '" aria-pressed="false">Ver base</button>';
    return html;
  }
  // Comparar: la tarjeta tiene un canvas animado (data-skin = id). "" = guardián base. Se lee en cada fotograma (js/ui/menus.js).
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-uc-compare]"); if(!b) return;
    var card = b.closest(".shop-skin"), cv = card && card.querySelector("canvas.shop-skin-anim"); if(!cv) return;
    var id = b.getAttribute("data-uc-compare"), showBase = cv.dataset.skin !== "";
    cv.dataset.skin = showBase ? "" : id;
    b.setAttribute("aria-pressed", showBase ? "true" : "false"); b.textContent = showBase ? "Ver skin" : "Ver base";
    cv.setAttribute("aria-label", showBase ? "Guardián base, sin la skin" : "Guardián con la skin");
  });
  window.UCShop = { version:1, contract:"UC-SHOP-1", skinLine:skinLine, skinState:skinState, off:off };
})();
