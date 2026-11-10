"use strict";
/* ============================================================
   js/ui/battlepass-ui.js — PANTALLA DEL PASE DE BATALLA (servidor: server/battlepass.js).
   · Nivel, barra de XP, días de la temporada, ruta GRATIS y ruta PREMIUM, desafíos de Campaña y Horda Infinita.
   · Reclamar: un pedido por toque (el botón queda bloqueado mientras viaja) y con requestId propio; si se repite el pedido, el servidor
     responde `duplicate` y no entrega dos veces. El XP NO se pide desde acá: lo da el servidor al cerrar una partida verificada.
   · Las Brasas ✦ del pase son recompensa de la ruta premium. El pase no da poder: oro, cosméticos y Brasas.
   · Precio y recompensas son PROVISORIOS (los define el socio); los cosméticos `bp:*` aún no tienen arte aprobado y se rotulan así.
   Estado para pruebas: window.__bp.
   ============================================================ */
const BP = { data: null, loading: false, busy: false, err: "", el: null };
window.__bp = BP;
const _bpEsc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const _bpFmt = n => Math.round(n || 0).toLocaleString("es-AR");
function _bpLogged(){ try{ return typeof accountState === "function" && accountState().logged; }catch(e){ return false; } }
function _bpCan(){ return typeof accountAvailable === "function" && accountAvailable() && typeof accountFetch === "function"; }
function _bpRid(){ try{ if(crypto && crypto.randomUUID) return "bp_" + crypto.randomUUID().replace(/-/g, "").slice(0, 24); }catch(e){} return "bp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12); }
function _bpRewardText(r){
  if(!r) return "";
  if(r.gold) return `🪙 ${_bpFmt(r.gold)} oro`;
  if(r.brasas) return `✦ ${_bpFmt(r.brasas)} Brasas`;
  if(r.cosmetic){
    const k = String(r.cosmetic).split(":")[1] || "";
    const kind = /^marco/.test(k) ? "Marco de perfil" : /^skin/.test(k) ? "Apariencia" : /^alas/.test(k) ? "Alas" : /^efecto/.test(k) ? "Efecto visual" : /^aura/.test(k) ? "Aura" : "Cosmético";
    return `🎨 ${kind} <i class="bp-soon">(arte pendiente)</i>`;
  }
  return "";
}
// ¿La ruta premium trae cosméticos `bp:*` sin arte aprobado? (los mismos que _bpRewardText rotula «arte pendiente»)
function _bpPremiumPending(d){ return !!(d && Array.isArray(d.track) && d.track.some(t => t && t.premium && t.premium.cosmetic)); }
// RETENER LA VENTA del premium mientras tenga cosméticos sin arte (decisión de producto: no se vende lo que no tiene arte final).
// El botón se reemplaza por un aviso neutro. Para probar el flujo de compra real, una prueba (o el equipo) puede abrirlo con
// `window.__BP_PREMIUM_OPEN__ = true` antes de cargar el juego (tools/ux/test-battlepass-ui.js lo hace). Cuando los cosméticos
// `bp:*` tengan arte, la ruta deja de estar "pendiente" (_bpPremiumPending) y el botón vuelve solo.
const BP_PREMIUM_HOLD = !(typeof window !== "undefined" && window.__BP_PREMIUM_OPEN__ === true);
// Salidas útiles cuando el pase del servidor no se puede ver (sin cuenta, sin conexión): el pase gratis del cliente y el probador.
function _bpExitsHTML(login){
  const quests = typeof window.questsOpen === "function", skins = typeof openGuardians === "function";
  return `${quests ? '<div class="bp-msg" data-bp-free>Sin cuenta también tenés un pase: el Pase de temporada es gratis y se juega desde Desafíos.</div>' : ""}
    <div class="mpc-cta-row">${quests ? '<button class="btn small" type="button" data-bp-act="freepass">Ver el pase gratis</button>' : ""}${skins ? '<button class="btn small secondary" type="button" data-bp-act="skins">Probar apariencias</button>' : ""}${login ? '<button class="btn small secondary" type="button" data-bp-act="login">Iniciar sesión</button>' : ""}</div>`;
}
function _bpEl(){
  if(BP.el && document.body.contains(BP.el)) return BP.el;
  const el = document.createElement("div");
  el.id = "bp-screen"; el.className = "ui-modal hidden"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Pase de batalla");
  el.innerHTML = `<div class="ui-modal-back" data-bp-close></div><div class="ui-panel ui-modal-panel bp-panel"></div>`;
  document.body.appendChild(el);
  el.querySelector("[data-bp-close]").addEventListener("click", bpClose);
  el.addEventListener("click", ev => {
    const b = ev.target.closest && ev.target.closest("[data-bp-act]"); if(!b || b.disabled) return;
    if(b.dataset.bpAct === "close") bpClose();
    else if(b.dataset.bpAct === "retry") bpLoad();
    else if(b.dataset.bpAct === "login"){ bpClose(); if(typeof window.accountOpen === "function") window.accountOpen(); }
    else if(b.dataset.bpAct === "freepass"){ bpClose(); if(typeof window.questsOpen === "function") window.questsOpen("pase"); }
    else if(b.dataset.bpAct === "skins"){ bpClose(); if(typeof openGuardians === "function") openGuardians("skins"); }
    else if(b.dataset.bpAct === "premium") bpBuyPremium();
    else if(b.dataset.bpAct === "claim") bpClaim(+b.dataset.tier, b.dataset.track);
  });
  BP.el = el; return el;
}
function bpClose(){ if(BP.el) BP.el.classList.add("hidden"); }
function bpOpen(){
  const el = _bpEl(); el.classList.remove("hidden"); _bpRender(); bpLoad();
  if(typeof playSfx === "function") playSfx("ready");
}
async function bpLoad(){
  if(!_bpLogged()){ BP.data = null; BP.err = "login"; _bpRender(); return; }
  if(!_bpCan()){ BP.err = "Necesitás conexión con el servidor para ver el pase."; _bpRender(); return; }
  BP.loading = true; BP.err = ""; _bpRender();
  try{
    const r = await accountFetch("GET", "/api/battlepass", undefined, { timeout: 60000 });
    if(r.status === 200 && r.j && Array.isArray(r.j.track)){ BP.data = r.j; BP.err = ""; }
    else if(r.status === 404){ BP.data = null; BP.err = "El pase de batalla todavía no está disponible en este servidor."; }
    else if(r.status === 401){ BP.data = null; BP.err = "login"; }
    else { BP.data = null; BP.err = (r.j && (r.j.msg || r.j.error)) || "No se pudo cargar el pase."; }
  }catch(e){ BP.data = null; BP.err = e && e.code === "NO_API" ? "El pase de batalla todavía no está disponible en este servidor." : "Sin conexión con el servidor."; }
  BP.loading = false; _bpRender();
}
async function _bpPost(path, body){
  if(BP.busy) return null;
  BP.busy = true; _bpRender();
  try{
    const r = await accountFetch("POST", path, Object.assign({ requestId: _bpRid() }, body), { timeout: 30000 });
    if(r.status === 200 && r.j && Array.isArray(r.j.track)){ BP.data = r.j; BP.err = ""; BP.note = ""; return r.j; }
    BP.note = (r.j && (r.j.msg || r.j.error)) || "No se pudo completar la acción.";
  }catch(e){ BP.note = "Sin conexión: no se hizo ningún cambio."; }
  finally{ BP.busy = false; _bpRender(); }
  return null;
}
async function bpClaim(tier, track){
  const r = await _bpPost("/api/battlepass/claim", { tier, track });
  if(r && r.granted){
    if(r.granted.gold && typeof showNetToast === "function") showNetToast(`Pase: +${_bpFmt(r.granted.gold)} de oro`);
    if(r.granted.brasas && typeof showNetToast === "function") showNetToast(`Pase: +${_bpFmt(r.granted.brasas)} Brasas ✦`);
    if(r.granted.cosmetic && typeof showNetToast === "function") showNetToast("Pase: cosmético desbloqueado");
    try{ if(typeof premiumRefresh === "function") premiumRefresh(true); if(typeof accountPull === "function") accountPull(); }catch(e){}
  }
}
async function bpBuyPremium(){
  const d = BP.data; if(!d || d.premium) return;
  if(BP_PREMIUM_HOLD && _bpPremiumPending(d)) return;
  const ok = typeof gameConfirm === "function" ? await gameConfirm(`¿Activar la ruta premium por ✦ ${_bpFmt(d.pricePremiumBrasas)} Brasas? Dura toda la temporada y solo da cosméticos, oro y Brasas (nunca poder).${_bpPremiumPending(d) ? " Sus cosméticos todavía no tienen el arte final." : ""}`) : true;
  if(!ok) return;
  const r = await _bpPost("/api/battlepass/premium", {});
  if(r){ try{ if(typeof premiumRefresh === "function") premiumRefresh(true); }catch(e){} if(typeof showNetToast === "function") showNetToast("Ruta premium activada"); }
}
function _bpRender(){
  const el = BP.el; if(!el) return;
  const P = el.querySelector(".bp-panel"), d = BP.data;
  const head = `<div class="ui-panel-title">🎖 Pase de batalla</div>`;
  const close = `<div class="bp-foot"><button class="btn small secondary" type="button" data-bp-act="close">Cerrar</button></div>`;
  if(!d){
    let body;
    if(BP.loading) body = `<div class="bp-msg">Cargando el pase…</div>`;
    else if(BP.err === "login") body = `<div class="bp-msg">Iniciá sesión con tu cuenta para ver y reclamar el pase. Tu progreso del pase se guarda en el servidor y te sigue entre dispositivos.</div>
      ${_bpExitsHTML(true)}`;
    else body = `<div class="bp-msg bp-err">${_bpEsc(BP.err || "")}</div><button class="btn small" type="button" data-bp-act="retry">Reintentar</button>${_bpExitsHTML(false)}`;
    P.innerHTML = head + body + close; return;
  }
  const into = d.xp - d.tier * d.xpPerTier, pct = d.tier >= d.tiers ? 100 : Math.max(0, Math.min(100, Math.round(into / d.xpPerTier * 100)));
  const claimed = new Set(d.claimed), dis = BP.busy ? " disabled" : "", pend = _bpPremiumPending(d);
  const cell = (t, track) => {
    const rw = t[track]; if(!rw) return `<div class="bp-cell bp-empty">—</div>`;
    const key = track + ":" + t.tier, done = claimed.has(key), unlocked = d.tier >= t.tier, canPremium = track !== "premium" || d.premium;
    const st = done ? "done" : (unlocked && canPremium ? "ready" : "locked");
    const act = st === "ready" ? `<button class="btn small bp-claim" type="button" data-bp-act="claim" data-tier="${t.tier}" data-track="${track}"${dis}>Reclamar</button>`
      : st === "done" ? `<span class="bp-tag">✔ Reclamado</span>` : `<span class="bp-tag">${!unlocked ? "Nivel " + t.tier : (BP_PREMIUM_HOLD && pend ? "Más adelante" : "Requiere premium")}</span>`;
    return `<div class="bp-cell bp-${st}" data-key="${key}"><div class="bp-rw">${_bpRewardText(rw)}</div>${act}</div>`;
  };
  const rows = d.track.map(t => `<div class="bp-row${d.tier >= t.tier ? " bp-reached" : ""}"><div class="bp-lv">${t.tier}</div>${cell(t, "free")}${cell(t, "premium")}</div>`).join("");
  const chs = d.challenges.map(c => `<div class="bp-ch${c.done ? " bp-ch-done" : ""}"><span class="bp-ch-mode">${_bpEsc(c.mode)}</span> ${_bpEsc(c.text)} <b>${c.progress}/${c.target}</b> · +${_bpFmt(c.xp)} XP${c.done ? " ✔" : ""}</div>`).join("");
  const prem = d.premium ? `<span class="bp-tag bp-on">Ruta premium activa</span>`
    : BP_PREMIUM_HOLD && pend ? `<span class="bp-tag" data-bp-hold>El pase premium llega más adelante.</span>`
    : `<button class="btn small bp-buy" type="button" data-bp-act="premium"${dis}>Activar premium · ✦ ${_bpFmt(d.pricePremiumBrasas)}</button>`;
  P.innerHTML = head +
    `<div class="bp-top"><div><b>Temporada ${d.season.id}</b> · quedan ${d.season.daysLeft} días</div><div>Nivel <b>${d.tier}</b>/${d.tiers} · ${_bpFmt(d.xp)} XP</div></div>` +
    `<div class="bp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>` +
    `<div class="bp-prem">${prem}<span class="bp-hint">El XP se gana al terminar partidas de Campaña y Horda Infinita. Premium no da poder.</span>${pend && !d.premium && !BP_PREMIUM_HOLD ? '<span class="bp-hint" data-bp-pending>Los cosméticos premium todavía no tienen el arte final. El pase gratis no cambia.</span>' : ""}</div>` +
    (BP.note ? `<div class="bp-msg bp-err" role="alert">${_bpEsc(BP.note)}</div>` : "") +
    `<div class="bp-cols"><div class="bp-track"><div class="bp-row bp-hd"><div class="bp-lv">Nv</div><div class="bp-cell">Gratis</div><div class="bp-cell">Premium ✦</div></div>${rows}</div>` +
    `<div class="bp-chs"><div class="bp-sub">Desafíos de la temporada</div>${chs}</div></div>` + close;
}
window.bpOpen = bpOpen;
(function bpWire(){
  const b = document.getElementById("hub-pass-btn");
  if(b){ b.classList.remove("hidden"); b.addEventListener("click", ev => { ev.stopPropagation(); bpOpen(); }); }
})();
