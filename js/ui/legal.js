"use strict";
/* ============================================================
   js/ui/legal.js
   Legal y soporte dentro del juego (los datos salen de js/data/legal-config.js; las páginas, de docs/legal/ → legal/*.html):
     · Enlaces a Privacidad, Términos y Reembolsos + correo de soporte: pantalla de título, Opciones y tienda de Brasas.
     · Crear cuenta: casilla obligatoria "tengo N años o más y acepto los Términos y la Privacidad" (menores: con permiso de un adulto).
     · Primera compra con dinero real: confirmación única de Términos/Reembolsos y autorización de un adulto si es menor.
   NO recolecta datos nuevos: la aceptación queda SOLO en este navegador (localStorage: versión de los términos y fecha).
   NO toca js/net/*: se engancha por fuera (observa la pantalla de cuenta y envuelve renderShopBrasas).
   Limitación asumida: la aceptación no viaja al servidor (ver docs/quality/SEGURIDAD_PRELANZAMIENTO.md, ítem de consentimiento).
   ============================================================ */
(function(){
  const L = (typeof HORDA_LEGAL !== "undefined" && HORDA_LEGAL) || { draft: true, supportEmail: "", minAge: 13, termsVersion: "0", base: "legal/" };
  const KEY_TERMS = "horda_legal_terms", KEY_BUY = "horda_legal_buy";
  const store = {
    get(k){ try{ return JSON.parse(localStorage.getItem(k) || "null"); }catch(e){ return null; } },
    set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  };
  const MAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
  const mail = () => (typeof L.supportEmail === "string" && MAIL_RE.test(L.supportEmail.trim())) ? L.supportEmail.trim() : "";
  const age = () => Math.max(1, Math.min(99, L.minAge | 0 || 13));
  const accepted = key => { const r = store.get(key); return !!(r && r.v === L.termsVersion); };
  const page = slug => (L.base || "legal/") + slug + ".html";

  function el(tag, attrs, kids){
    const n = document.createElement(tag);
    for(const k in (attrs || {})){ if(k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); }
    for(const c of [].concat(kids || [])) if(c) n.append(c);
    return n;
  }
  const link = (slug, text) => el("a", { href: page(slug), target: "_blank", rel: "noopener", text });

  // Línea de enlaces: Privacidad · Términos · Reembolsos (+ marca "borrador" mientras lo sea)
  function linksLine(){
    const row = el("span", { class: "legal-links" });
    [["privacidad", "Privacidad"], ["terminos", "Términos"], ["reembolsos", "Reembolsos"]].forEach(([s, t], i) => {
      if(i) row.append(el("span", { class: "legal-sep", "aria-hidden": "true", text: "·" }));
      row.append(link(s, t));
    });
    if(L.draft) row.append(el("span", { class: "legal-draft", title: "Los textos legales son un borrador y se están revisando con un abogado", text: "borrador" }));
    return row;
  }
  function supportLine(){
    const m = mail(), row = el("span", { class: "legal-support" });
    row.append("Soporte: ");
    if(m) row.append(el("a", { href: "mailto:" + m, text: m }));
    else row.append(el("span", { class: "legal-nomail", text: "correo sin configurar" }));
    return row;
  }
  function fill(box, opts){
    if(!box) return;
    box.replaceChildren();
    box.append(linksLine());
    if(!opts || opts.support !== false) box.append(supportLine());
  }

  // ---- dónde van los enlaces ----
  function mountStatic(){
    fill(document.getElementById("legal-title"));
    fill(document.getElementById("legal-opts"));
  }
  function wrapShop(){
    const base = window.renderShopBrasas;
    if(typeof base !== "function" || base.__legal) return;
    const wrapped = function(panel){
      const r = base.apply(this, arguments);
      try{
        if(panel && !panel.querySelector(".legal-shop")){
          const box = el("div", { class: "legal-foot legal-shop", role: "note" });
          box.append(el("div", { class: "legal-shop-txt", text: "Antes de comprar leé los Términos y la Política de Reembolsos. Si tenés un problema con un pago, escribinos con tu usuario y el número de operación." }));
          const row = el("div", { class: "legal-shop-row" }); fill(row); box.append(row);
          panel.append(box);
        }
      }catch(e){}
      return r;
    };
    wrapped.__legal = true;
    window.renderShopBrasas = wrapped;
  }

  // ---- Crear cuenta: casilla obligatoria ----
  function consentText(withLinks){
    const t = el("span", { class: "legal-consent-txt" });
    t.append(`Tengo ${age()} años o más y acepto los `);
    t.append(withLinks ? link("terminos", "Términos") : "Términos");
    t.append(" y la ");
    t.append(withLinks ? link("privacidad", "Política de Privacidad") : "Política de Privacidad");
    t.append(". Si soy menor de 18, mi madre, padre o tutor está de acuerdo con que juegue.");
    return t;
  }
  function decorateAccount(root){
    const pass2 = root.querySelector("#acc-pass2"), submit = root.querySelector("#acc-submit");
    if(!pass2 || !submit || root.querySelector(".legal-consent")) return;
    const id = "legal-consent-cb";
    const box = el("div", { class: "legal-consent" });
    const cb = el("input", { type: "checkbox", id, name: "legalConsent", "aria-required": "true" });
    if(accepted(KEY_TERMS)) cb.checked = true;
    const lab = el("label", { for: id }); lab.append(consentText(true));
    box.append(cb, lab);
    submit.before(box);
  }
  // Atrapa el envío del formulario de registro ANTES de que lo procese account.js (captura en document).
  document.addEventListener("submit", ev => {
    const form = ev.target;
    if(!form || !form.classList || !form.classList.contains("acc-form") || !form.querySelector("#acc-pass2")) return;
    const cb = form.querySelector("#legal-consent-cb");
    if(!cb) return;                       // por si la casilla no se pudo agregar, no se bloquea el registro
    if(cb.checked){ store.set(KEY_TERMS, { v: L.termsVersion, at: new Date().toISOString(), via: "register" }); return; }
    ev.preventDefault(); ev.stopImmediatePropagation();
    if(typeof _acctStatus === "function") _acctStatus(`Para crear la cuenta marcá que tenés ${age()} años o más y que aceptás los Términos y la Privacidad.`, "err");
    cb.focus();
  }, true);
  let accObserver = null;
  function watchAccount(){
    const attach = root => {
      if(!root || root.__legalWatched) return;
      root.__legalWatched = true;
      new MutationObserver(() => decorateAccount(root)).observe(root, { childList: true, subtree: true });
      decorateAccount(root);
    };
    const now = document.getElementById("account-screen");
    if(now){ attach(now); return; }
    const host = document.getElementById("stage") || document.body;
    accObserver = new MutationObserver(() => {
      const r = document.getElementById("account-screen");
      if(r){ attach(r); accObserver.disconnect(); accObserver = null; }
    });
    accObserver.observe(host, { childList: true });
  }

  // ---- Primera compra con dinero real ----
  const autoMode = () => { try{ return typeof gameDialogAutoConfirm === "function" && gameDialogAutoConfirm(); }catch(e){ return false; } };
  function askPurchase(){
    return new Promise(resolve => {
      const prev = document.activeElement;
      const wrap = el("div", { class: "ui-modal legal-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "legal-buy-title" });
      const back = el("div", { class: "ui-modal-back" });
      const panel = el("div", { class: "ui-panel ui-modal-panel" });
      panel.append(el("div", { class: "ui-panel-title", id: "legal-buy-title", text: "Antes de tu primera compra" }));
      panel.append(el("p", { class: "legal-buy-p", text: "Las Brasas se pagan con dinero real por Mercado Pago y solo compran apariencia, nunca poder. Tenés derechos como consumidor; leé cómo pedir una devolución." }));
      const lr = el("p", { class: "legal-buy-links" }); lr.append(linksLine()); panel.append(lr);
      const box = el("div", { class: "legal-consent" });
      const cb = el("input", { type: "checkbox", id: "legal-buy-cb", "aria-required": "true" });
      const lab = el("label", { for: "legal-buy-cb" });
      const t = el("span", { class: "legal-consent-txt" });
      t.append("Acepto los "); t.append(link("terminos", "Términos")); t.append(" y la "); t.append(link("reembolsos", "Política de Reembolsos"));
      t.append(`. Tengo ${age()} años o más; si soy menor de 18, esta compra la autoriza mi madre, padre o tutor, que es responsable del medio de pago.`);
      lab.append(t); box.append(cb, lab); panel.append(box);
      const err = el("div", { class: "legal-err", role: "alert" });
      panel.append(err);
      const btns = el("div", { class: "legal-btns" });
      const no = el("button", { type: "button", class: "btn secondary", text: "Cancelar" });
      const ok = el("button", { type: "button", class: "btn", text: "Continuar" });
      btns.append(no, ok); panel.append(btns);
      wrap.append(back, panel); document.body.append(wrap);
      const done = v => { wrap.remove(); document.removeEventListener("keydown", onKey, true); try{ if(prev && prev.focus) prev.focus(); }catch(e){} resolve(v); };
      const onKey = ev => { if(ev.key === "Escape"){ ev.stopPropagation(); done(false); } };
      document.addEventListener("keydown", onKey, true);
      back.addEventListener("click", () => done(false));
      no.addEventListener("click", () => done(false));
      ok.addEventListener("click", () => {
        if(!cb.checked){ err.textContent = "Marcá la casilla para continuar."; cb.focus(); return; }
        store.set(KEY_BUY, { v: L.termsVersion, at: new Date().toISOString(), via: "purchase" });
        done(true);
      });
      cb.focus();
    });
  }
  document.addEventListener("click", ev => {
    const b = ev.target && ev.target.closest ? ev.target.closest("[data-brasas-buy]") : null;
    if(!b || b.__legalPass || accepted(KEY_BUY) || autoMode()) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    askPurchase().then(ok => { if(ok){ b.__legalPass = true; try{ b.click(); }finally{ b.__legalPass = false; } } });
  }, true);

  window.HordaLegal = { accepted: k => accepted(k === "buy" ? KEY_BUY : KEY_TERMS), supportEmail: mail, minAge: age, draft: !!L.draft, remount: mountStatic };
  const start = () => { mountStatic(); wrapShop(); watchAccount(); };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
