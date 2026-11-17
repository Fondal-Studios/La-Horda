"use strict";
/* ============================================================
   js/net/beta-kit.js — KIT DE BETA CERRADA (cliente). Todo depende de lo que anuncie el servidor en
   /api/health (beta: {invite, reports, errors}); sin servidor o con todo apagado, no se ve ni se manda nada.
   - "Reportar un problema": botón en Opciones y en Pausa → Ayuda y opciones. Texto corto (hasta 1000), categoría y
     contexto técnico NO personal (versión, estado, arena, nivel, campeón, pantalla, navegador, últimos 5 errores).
   - Errores de JavaScript automáticos (solo si el servidor tiene BETA_ERROR_REPORTS=1): agrupados por mensaje +
     archivo:línea, con contador, como mucho 20 envíos por sesión. Nunca la URL completa, cuentas ni textos del jugador.
   - El código de invitación del registro vive en js/net/account.js (campo "Código de invitación").
   Servidor: server/beta-kit.js · Guía del dueño: docs/beta-release/BETA_CERRADA_OPERADOR.md
   ============================================================ */
const BetaKit = (() => {
  const MAX_TEXT = 1000, MAX_SENT = 20, MAX_PENDING = 20, FLUSH_MS = 15000;
  const recent = [];               // últimos errores (solo en memoria), para adjuntar a un reporte
  const pending = new Map();       // firma -> {message, src, line, col, count}
  const sentKeys = new Set();
  let sentCount = 0, timer = null, panel = null, prevFocus = null, sending = false;
  // En automatización (Playwright) no se despierta al servidor real: las pruebas lo activan con window.__betaKitTest.
  const productEnabled = () => typeof navigator === "undefined" || !navigator.webdriver || window.__betaKitTest === true;
  const flags = () => (typeof acct !== "undefined" && acct.health && acct.health.beta) || {};
  const online = () => typeof accountAvailable === "function" && accountAvailable();
  const reportsOn = () => online() && !!flags().reports;
  const errorsOn = () => online() && !!flags().errors && productEnabled();
  const buildTag = () => (typeof NET_CONFIG !== "undefined" && NET_CONFIG.build) || "?";
  // solo la ruta del archivo: sin dominio, query ni hash
  function pathOf(src){
    let s = String(src || "");
    try{ if(/^[a-z]+:\/\//i.test(s)) s = new URL(s).pathname; }catch(e){ s = ""; }
    return s.replace(/[?#].*$/, "").replace(/^.*?\/(js|css)\//, "$1/").slice(-160);
  }

  /* ---------------- errores ---------------- */
  function record(message, src, line, col){
    message = String(message || "").replace(/\s+/g, " ").trim().slice(0, 300);
    if(!message || /^Script error\.?$/i.test(message)) return;                 // error de otro origen: sin datos útiles
    if(/^(chrome|moz|safari)-extension:/i.test(String(src || ""))) return;    // extensiones del navegador: no son del juego
    const file = pathOf(src);
    recent.push(message + (file ? " @ " + file + ":" + (line | 0) : "")); if(recent.length > 5) recent.shift();
    const key = message + "|" + file + "|" + (line | 0);
    const e = pending.get(key);
    if(e) e.count++; else if(pending.size < MAX_PENDING) pending.set(key, { message, src: file, line: line | 0, col: col | 0, count: 1 });
    schedule();
  }
  function fromStack(stack){ const m = /((?:https?|file):\/\/[^\s)]+?):(\d+):(\d+)/.exec(String(stack || "")); return m ? { src: m[1], line: +m[2], col: +m[3] } : {}; }
  window.addEventListener("error", e => { if(e && (e.message || e.error)) record(e.message || String(e.error), e.filename, e.lineno, e.colno); });
  window.addEventListener("unhandledrejection", e => {
    const r = e && e.reason, msg = r instanceof Error ? (r.name + ": " + r.message) : (typeof r === "string" ? r : "Promesa rechazada");
    const at = fromStack(r && r.stack); record("(promesa) " + msg, at.src, at.line, at.col);
  });
  function schedule(){ if(!timer && errorsOn()) timer = setTimeout(() => { timer = null; flush(); }, FLUSH_MS); }
  function batch(max){
    const out = [];
    for(const [key, e] of pending){
      if(sentCount >= MAX_SENT || out.length >= max) break;
      out.push(Object.assign({}, e)); pending.delete(key); sentKeys.add(key); sentCount++;
    }
    return out;
  }
  async function flush(beacon){
    if(sending || !pending.size || !errorsOn() || sentCount >= MAX_SENT) return;
    const errors = batch(10); if(!errors.length) return;
    const body = { build: buildTag(), errors };
    if(beacon && navigator.sendBeacon){ try{ navigator.sendBeacon(accountApiBase() + "/api/beta/errors", new Blob([JSON.stringify(body)], { type: "text/plain" })); }catch(e){} return; }
    sending = true;
    try{ await accountFetch("POST", "/api/beta/errors", body, { auth: false, timeout: 10000 }); }catch(e){ /* nunca frena el juego */ }
    finally{ sending = false; if(pending.size) schedule(); }
  }
  window.addEventListener("pagehide", () => flush(true));

  /* ---------------- reporte ---------------- */
  function context(){
    const g = (fn, d) => { try{ const v = fn(); return v === undefined || v === null ? d : v; }catch(e){ return d; } };
    const dpr = Math.round((window.devicePixelRatio || 1) * 100) / 100;
    return {
      build: buildTag(), state: String(g(() => state, "")), arena: String(g(() => currentArena, "")), level: Number(g(() => runLevel, 0)) || 0,
      champion: String(g(() => selectedClass, "")), lang: String(g(() => I18N.lang, "es")),
      viewport: Math.round(window.innerWidth) + "x" + Math.round(window.innerHeight) + "@" + dpr,
      ua: String(navigator.userAgent || "").slice(0, 200), errors: recent.slice(-5)
    };
  }
  function close(){
    if(!panel) return;
    panel.remove(); panel = null;
    if(prevFocus && prevFocus.focus) try{ prevFocus.focus(); }catch(e){}
  }
  // Teclas dentro del diálogo: no llegan al juego (WASD, 1 2 3...). Escape cierra el diálogo, no la pausa.
  document.addEventListener("keydown", e => {
    if(!panel) return;
    if(e.key === "Escape"){ e.preventDefault(); e.stopImmediatePropagation(); close(); return; }
    if(panel.contains(e.target)){
      e.stopImmediatePropagation();
      if(e.key === "Tab"){ const items = [...panel.querySelectorAll("button,select,textarea")].filter(x => !x.disabled); const first = items[0], last = items[items.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); } }
    }
  }, true);
  function open(){
    if(panel) return;
    prevFocus = document.activeElement;
    panel = document.createElement("section");
    panel.className = "beta-report"; panel.id = "beta-report"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-labelledby", "beta-report-title");
    panel.innerHTML = `<header><h2 id="beta-report-title">Reportar un problema</h2><button type="button" class="beta-report-x" data-close aria-label="Cerrar">✕</button></header>
      <form novalidate>
        <label class="beta-report-field"><span>Categoría</span><select name="category" id="beta-report-category">
          <option value="bug">Error (bug)</option><option value="balance">Balance</option><option value="idea">Idea</option><option value="otro">Otro</option></select></label>
        <label class="beta-report-field"><span>¿Qué pasó?</span><textarea name="text" id="beta-report-text" maxlength="${MAX_TEXT}" rows="5" placeholder="Contá qué hiciste, qué esperabas y qué pasó."></textarea></label>
        <p class="beta-report-count" data-count>0/${MAX_TEXT}</p>
        <p class="beta-report-note">Se adjunta información técnica: versión, pantalla, arena, nivel, campeón, navegador y los últimos errores del juego. Nunca tu correo ni tu ubicación.</p>
        <p class="beta-report-status" data-status role="status" aria-live="polite"></p>
        <div class="beta-report-actions"><button type="button" class="btn secondary" data-close>Cancelar</button><button type="submit" class="btn" id="beta-report-send">Enviar reporte</button></div>
      </form>`;
    document.body.append(panel);
    const local = panel, text = local.querySelector("textarea"), count = local.querySelector("[data-count]"), status = local.querySelector("[data-status]");
    const say = (msg, kind) => { status.textContent = msg; status.dataset.kind = kind || ""; };
    local.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", close));
    text.addEventListener("input", () => { count.textContent = text.value.length + "/" + MAX_TEXT; });
    local.querySelector("form").addEventListener("submit", async ev => {
      ev.preventDefault();
      const value = text.value.trim(), category = local.querySelector("select").value;
      if(value.length < 3){ say("Contá qué pasó (al menos unas palabras).", "err"); text.focus(); return; }
      if(text.value.length > MAX_TEXT){ say("El reporte puede tener hasta 1000 caracteres.", "err"); text.focus(); return; }
      if(flags().invite && !(typeof acct !== "undefined" && acct.session)){ say("Entrá a tu cuenta para mandar un reporte.", "err"); return; }
      const btn = local.querySelector("#beta-report-send"); btn.disabled = true; say("Enviando…");
      try{
        const r = await accountFetch("POST", "/api/beta/report", { category, text: value, context: context() }, { timeout: 15000 });
        if(panel !== local) return;
        if(r.status === 201){ say("¡Gracias! Recibimos tu reporte.", "ok"); text.value = ""; count.textContent = "0/" + MAX_TEXT; setTimeout(() => { if(panel === local) close(); }, 1500); return; }
        say((r.j && r.j.msg) || "No se pudo enviar el reporte. Probá de nuevo más tarde.", "err");
      }catch(e){ if(panel === local) say("Sin conexión con el servidor. Probá de nuevo más tarde.", "err"); }
      finally{ if(panel === local) btn.disabled = false; }
    });
    text.focus();
  }

  /* ---------------- botones (ocultos hasta que el servidor anuncie los reportes) ---------------- */
  function mount(){
    const opts = document.querySelector("#hub-options > .ui-modal-panel");
    if(opts && !document.getElementById("beta-report-opt")){
      const row = document.createElement("div"); row.className = "opt-row"; row.id = "beta-report-opt"; row.hidden = true;
      row.innerHTML = '<span class="opt-lbl">Reportar un problema<span class="opt-sub">Contanos un error, un problema de balance o una idea</span></span>';
      const b = document.createElement("button"); b.type = "button"; b.className = "btn small"; b.id = "beta-report-opt-btn"; b.textContent = "Reportar"; b.addEventListener("click", open);
      row.append(b); opts.insertBefore(row, document.getElementById("opt-close-btn"));
    }
    const pause = document.querySelector("#pause-screen .pause-btnrow");
    if(pause && !document.getElementById("beta-report-pause-btn")){
      const b = document.createElement("button"); b.type = "button"; b.className = "btn small secondary"; b.id = "beta-report-pause-btn"; b.hidden = true;
      b.textContent = "Reportar un problema"; b.addEventListener("click", open); pause.append(b);
    }
    refresh();
  }
  function refresh(){
    const on = reportsOn();
    for(const id of ["beta-report-opt", "beta-report-pause-btn"]){ const el = document.getElementById(id); if(el) el.hidden = !on; }
    if(pending.size) schedule();
  }
  function init(){
    mount();
    if(online() && productEnabled() && typeof accountWarmup === "function") accountWarmup().then(refresh, refresh);
  }
  window.addEventListener("account-change", refresh);
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  return { open, close, refresh, flush, record, context, state: () => ({ sentCount, pending: pending.size, recent: recent.slice() }) };
})();
