"use strict";
/* ============================================================
   js/ui/rank-screen.js
   PANTALLA DE RANGO (menú principal → MODOS COMPETITIVOS → RANGO). Usa la paleta y los botones del menú (css/ui-kit.css, css/rank.css).
   Muestra, por modo (Horda Infinita, Guerra de Cristales, Coliseo): división, rating, avance, partidas, racha, práctica sin puntos e historial.
   El «puesto global» NO existe todavía: no hay servidor de tabla. Si algún día se publica `window.RANK_SYNC` (ver el contrato en
   docs/modes/CRYSTAL_WARS.md) esta pantalla lo usa; mientras tanto lo dice con todas las letras. Nada acá inventa jugadores.
   ============================================================ */
let _rkEl = null, _rkMode = "col";
function _rkEsc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c])); }
function _rkState(){ return typeof Ladder !== "undefined" ? Ladder.ensure(save) : null; }
function rankHubRefresh(){
  const sub = document.getElementById("hub-rank-sub"); if(!sub || typeof Ladder === "undefined") return;
  const L = _rkState(), s = L && Ladder.summary(save);
  sub.textContent = s && s.mode ? s.tier.label + " · " + s.mmr + " · " + Ladder.MODES[s.mode].short : "Tu división · sin partidas todavía";
}
function _rkEl_(){
  if(_rkEl && document.body.contains(_rkEl)) return _rkEl;
  const el = document.createElement("div");
  el.id = "rank-screen"; el.className = "ui-modal hidden"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Rango de La Horda");
  el.innerHTML = '<div class="ui-modal-back" data-rk-close></div><div class="ui-panel ui-modal-panel rk-panel"></div>';
  document.body.appendChild(el);
  el.querySelector("[data-rk-close]").addEventListener("click", rankClose);
  _rkEl = el; return el;
}
function rankClose(){ if(_rkEl) _rkEl.classList.add("hidden"); }
function rankOpen(mode){
  if(typeof Ladder === "undefined") return;
  if(mode && Ladder.MODES[mode]) _rkMode = mode;
  else { const L = _rkState(); let t = 0; if(L) for(const k of Ladder.MODE_KEYS) if(L.modes[k].lastAt > t){ t = L.modes[k].lastAt; _rkMode = k; } }   // abre en el modo que jugaste último
  const el = _rkEl_(); el.classList.remove("hidden"); rankRender();
  if(typeof playSfx === "function") try{ playSfx("ready"); }catch(e){}
  const x = el.querySelector(".rk-x"); if(x) x.focus();
}
function _rkVs(e){ return e.vs === "humans" ? "contra personas" : e.vs === "mixed" ? "personas y bots" : e.vs === "pve" ? "contra la Horda" : "contra bots"; }
function _rkWhy(e){
  if(e.abandon) return "abandono"; if(e.afk) return "inactivo";
  if(e.reason === "ceiling") return "práctica (techo de bots)"; if(e.reason === "daycap") return "práctica (tope diario)";
  return e.outcome === "win" ? "victoria" : e.outcome === "draw" ? "empate" : "derrota";
}
function rankRender(){
  const el = _rkEl_(), panel = el.querySelector(".rk-panel"), L = _rkState(); if(!L) return;
  const M = Ladder.MODES[_rkMode], S = L.modes[_rkMode], T = Ladder.tierOf(S.mmr), nextT = T.hi == null ? null : Ladder.tierOf(T.hi);
  const tabs = Ladder.MODE_KEYS.map(k => '<button type="button" class="rk-tab' + (k === _rkMode ? " on" : "") + '" data-rk-mode="' + k + '" aria-pressed="' + (k === _rkMode) + '"><span aria-hidden="true">' + Ladder.MODES[k].icon + '</span> ' + _rkEsc(Ladder.MODES[k].short) + '</button>').join("");
  const prov = S.games < Ladder.CFG.PROV_GAMES;
  const prog = nextT ? '<div class="rk-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(T.progress * 100) + '"><u style="width:' + Math.round(T.progress * 100) + '%"></u></div><div class="rk-next">Faltan ' + (T.hi - S.mmr) + ' para ' + _rkEsc(nextT.label) + '</div>' : '<div class="rk-next">División máxima: sin tope de rating</div>';
  const tiers = Ladder.TIERS.map(t => '<span class="rk-tier' + (t.key === T.key ? " on" : "") + '" style="--tc:' + t.color + '">' + _rkEsc(t.name) + '</span>').join("");
  const hist = L.log.filter(e => e.mode === _rkMode).slice(-6).reverse().map(e =>
    '<div class="rk-row ' + (e.counted ? (e.delta > 0 ? "up" : e.delta < 0 ? "down" : "") : "prac") + '"><b>' + (e.counted ? (e.delta > 0 ? "+" : e.delta < 0 ? "−" : "±") + Math.abs(e.delta) : "0") + '</b><span>' + _rkEsc(_rkWhy(e)) + '</span><i>' + _rkEsc(_rkVs(e)) + '</i></div>').join("");
  const sync = (typeof window !== "undefined" && window.RANK_SYNC && typeof window.RANK_SYNC.fetchBoard === "function");
  panel.innerHTML =
    '<div class="rk-head"><div class="ui-panel-title">♛ Rango de La Horda</div><button type="button" class="ui-icon-btn rk-x" data-rk-close aria-label="Cerrar">✕</button></div>' +
    '<div class="rk-tabs" role="group" aria-label="Modo">' + tabs + '</div>' +
    '<div class="rk-card" style="--tc:' + T.color + '"><div class="rk-badge"><b>' + _rkEsc(T.name) + '</b><span>' + _rkEsc(T.div || "") + '</span></div>' +
      '<div class="rk-main"><div class="rk-mmr">' + S.mmr + ' <small>puntos · ' + _rkEsc(M.name) + '</small></div>' + prog +
      (prov ? '<div class="rk-prov">En clasificación: ' + S.games + '/' + Ladder.CFG.PROV_GAMES + ' partidas (suben y bajan más)</div>' : '') + '</div></div>' +
    '<div class="rk-stats"><div><b>' + S.games + '</b><span>partidas</span></div><div><b>' + S.wins + '</b><span>victorias</span></div><div><b>' + S.losses + '</b><span>derrotas</span></div><div><b>' + S.peak + '</b><span>mejor rating</span></div><div><b>' + (S.streak > 0 ? "+" + S.streak : S.streak) + '</b><span>racha</span></div><div><b>' + S.abandons + '</b><span>abandonos</span></div></div>' +
    '<div class="rk-prac">Práctica sin puntos: <b>' + S.practice.games + '</b> partidas' + (S.practice.games ? ' (' + S.practice.wins + ' ganadas)' : '') + '</div>' +
    '<div class="rk-tiers" aria-label="Divisiones">' + tiers + '</div>' +
    '<div class="rk-sub">Últimas partidas</div><div class="rk-hist">' + (hist || '<div class="rk-empty">Todavía no jugaste ' + _rkEsc(M.name) + ' con rango.</div>') + '</div>' +
    '<div class="rk-global" id="rk-global"><b>Puesto global:</b> ' + (sync ? 'consultando…' : '— <span>Todavía no hay tabla global: tu rango se guarda en este dispositivo y con tu cuenta. Cuando exista el servidor, tu puesto aparece acá.</span>') + '</div>' +
    '<details class="rk-rules"><summary>Cómo cuenta</summary><ul>' +
      '<li>Contra <b>personas</b> sumás y restás completo.</li>' +
      '<li>Contra <b>bots</b> vale la mitad, con tope de ' + Ladder.tierOf(Ladder.CFG.BOT_CEIL).label + ' y ' + Ladder.CFG.BOT_DAY_GAIN + ' puntos por día. Más arriba es práctica sin puntos.</li>' +
      '<li><b>Abandonar</b> es derrota (y resta de más contra personas). Quedarte <b>inactivo</b> nunca suma.</li>' +
      '<li>La Horda Infinita compara tu ronda con la que se espera de tu rango.</li></ul></details>';
  panel.querySelectorAll("[data-rk-close]").forEach(b => b.addEventListener("click", rankClose));
  panel.querySelectorAll("[data-rk-mode]").forEach(b => b.addEventListener("click", () => { _rkMode = b.dataset.rkMode; rankRender(); const t = _rkEl.querySelector('.rk-tab.on'); if(t) t.focus(); }));
  if(sync) rankLoadBoard();
}
// Con servidor global (window.RANK_SYNC.fetchBoard(mode) → {me:{place,total}, entries:[…]}) se muestra el puesto. Sin él, no se hace nada.
function rankLoadBoard(){
  const mode = _rkMode;
  Promise.resolve().then(() => window.RANK_SYNC.fetchBoard(mode)).then(r => {
    const g = document.getElementById("rk-global"); if(!g || mode !== _rkMode) return;
    g.innerHTML = '<b>Puesto global:</b> ' + (r && r.me && r.me.place ? '#' + (r.me.place | 0) + (r.me.total ? ' de ' + (r.me.total | 0) : "") : "sin puesto todavía");
  }).catch(() => { const g = document.getElementById("rk-global"); if(g) g.innerHTML = '<b>Puesto global:</b> no disponible ahora'; });
}
(function rkWire(){
  const b = document.getElementById("hub-rank-btn"); if(b) b.addEventListener("click", () => rankOpen());
  document.addEventListener("keydown", ev => { if(ev.key === "Escape" && _rkEl && !_rkEl.classList.contains("hidden")) rankClose(); });
  window.rankOpen = rankOpen;
})();
