"use strict";
/* ============================================================
   js/net/clan.js
   CLANES (servidor: server/clans.js, /api/clans y /api/clan/*) y puerta de entrada a la CONQUISTA DEL CASTILLO.
   - Pantalla «Clan» (tarjeta CLAN del hub): sin clan -> buscar / crear / tabla; con clan -> resumen, miembros (rangos,
     expulsar, solicitudes), Conquista del Castillo y tabla. Requiere cuenta (la misma sesión del guardado en la nube).
   - El servidor decide todos los permisos; acá solo se muestran los botones que corresponden a tu rango.
   - Conquista del Castillo (js/arenas/lanes/lanes-castle.js): tu clan contra un clan rival SIMULADO con bots. El resultado
     lo informa ESTE cliente y puede falsificarse: el servidor valida plausibilidad y topes, no es antitrampa.
     Un parte sin conexión queda en cola (localStorage) y se reintenta; el matchId evita sumarlo dos veces.
   Estado para pruebas: window.__clan.
   ============================================================ */
const CLAN = { data: null, list: null, table: null, tab: "", q: "", loading: false, err: "", msg: "", busy: false, el: null, side: "attack", tier: 1, rivalIdx: 0, confirmOpen: false };
window.__clan = CLAN;
const CLAN_PENDING_KEY = "horda_clan_pending_v1";

function _cEsc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function _cFmt(n){ return Math.round(n || 0).toLocaleString("es-AR"); }
function _cLogged(){ try{ return typeof accountState === "function" && accountState().logged; }catch(e){ return false; } }
function _cCan(){ return typeof accountAvailable === "function" && accountAvailable() && typeof accountFetch === "function"; }
const CLAN_ROLE = { leader: "Líder", officer: "Oficial", member: "Miembro" };
const CLAN_NOT_ON_SERVER = "Los clanes todavía no están disponibles en este servidor.";

// Llama a la API y devuelve {status, j}; un corte de red se convierte en un mensaje legible.
async function clanApi(method, path, body, opts){
  try{ return await accountFetch(method, path, body, Object.assign({ timeout: 30000 }, opts || {})); }
  catch(e){
    const code = e && e.code;
    return { status: 0, j: { error: code || "OFFLINE", msg: code === "NO_API" || code === "NO_SERVER" ? CLAN_NOT_ON_SERVER : code === "TIMEOUT" ? "El servidor no respondió: probá de nuevo en un minuto." : "Sin conexión con el servidor." } };
  }
}
const _cErrText = r => r.status === 404 && r.j && r.j.error === "NOT_FOUND" ? CLAN_NOT_ON_SERVER : ((r.j && r.j.msg) || "No se pudo completar la acción.");

/* ---------------- parte de la Conquista del Castillo ---------------- */
function _cPendingRead(){ try{ const a = JSON.parse(localStorage.getItem(CLAN_PENDING_KEY) || "[]"); return Array.isArray(a) ? a.slice(0, 5) : []; }catch(e){ return []; } }
function _cPendingWrite(a){ try{ localStorage.setItem(CLAN_PENDING_KEY, JSON.stringify(a.slice(0, 5))); }catch(e){} }
function _cPendingAdd(rep){ const a = _cPendingRead().filter(r => r.matchId !== rep.matchId); a.push(rep); _cPendingWrite(a.slice(-5)); }
function _cPendingDrop(id){ _cPendingWrite(_cPendingRead().filter(r => r.matchId !== id)); }
async function clanFlushPending(){
  if(CLAN.flushing || !_cLogged() || !_cCan()) return 0;
  const list = _cPendingRead(); if(!list.length) return 0;
  CLAN.flushing = true; let sent = 0;
  try{
    for(const rep of list){
      const r = await clanApi("POST", "/api/clan/war/report", rep);
      if(r.status === 0 || r.status === 429 && r.j.error === "TOO_MANY") break;   // sigue sin red: queda en cola
      _cPendingDrop(rep.matchId);                                                 // aceptado o rechazado de forma definitiva: no se reintenta
      if(r.status === 200) sent++;
    }
  } finally { CLAN.flushing = false; }
  if(sent) CLAN.data = null;
  return sent;
}
// Lo llama la pantalla de resultado de la Conquista del Castillo: manda el parte y devuelve el texto para el jugador.
async function clanSubmitWar(rep){
  if(!rep) return "No hay resultado para contar.";
  if(!_cLogged()) return "Sin cuenta, esta partida no suma puntos de clan. Entrá a tu cuenta para jugar por tu clan.";
  if(!(rep.durationMs >= 120000)) return "La partida fue demasiado corta para sumar puntos de clan.";
  if(!_cCan()) { _cPendingAdd(rep); return "Sin servidor: el resultado queda guardado y se manda cuando haya conexión."; }
  const r = await clanApi("POST", "/api/clan/war/report", rep);
  if(r.status === 200 && r.j.ok){
    CLAN.data = null;
    const j = r.j, sign = j.delta > 0 ? "+" : "";
    if(j.duplicate) return "Este resultado ya estaba contado (" + sign + j.delta + "). Puntos del clan: " + _cFmt(j.points) + ".";
    if(j.delta === 0 && j.capped) return "El clan llegó al tope de puntos de hoy: esta victoria no suma más. Puntos del clan: " + _cFmt(j.points) + ".";
    return (j.delta >= 0 ? "Puntos de clan: " : "Puntos de clan: ") + sign + j.delta + " · total " + _cFmt(j.points) + (j.capped ? " (recortado por el tope diario)" : "") + ".";
  }
  if(r.status === 0){ _cPendingAdd(rep); return "Sin conexión: el resultado queda guardado y se manda cuando vuelva la red."; }
  if(r.status === 404 && r.j.error === "NOT_IN_CLAN") return "No estás en ningún clan: este resultado no suma puntos.";
  return _cErrText(r);
}
window.clanSubmitWar = clanSubmitWar;

/* ---------------- pantalla ---------------- */
function _cEl(){
  if(CLAN.el && document.body.contains(CLAN.el)) return CLAN.el;
  const el = document.createElement("div");
  el.id = "clan-screen"; el.className = "ui-modal clan-modal hidden"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Clan");
  el.innerHTML = '<div class="ui-modal-back" data-clan-close></div><div class="ui-panel ui-modal-panel clan-panel"></div>';
  document.body.appendChild(el);
  el.querySelector("[data-clan-close]").addEventListener("click", clanClose);
  el.addEventListener("click", ev => _cClick(ev));
  el.addEventListener("submit", ev => { ev.preventDefault(); _cSubmit(ev.target); });
  CLAN.el = el;
  return el;
}
function clanClose(){ if(CLAN.el) CLAN.el.classList.add("hidden"); }
function clanIsOpen(){ return !!CLAN.el && !CLAN.el.classList.contains("hidden"); }
function clanOpen(opts){
  opts = opts || {};
  const el = _cEl(); el.classList.remove("hidden");
  if(opts.tab) CLAN.tab = opts.tab;
  CLAN.msg = ""; CLAN.err = "";
  _cRender();
  clanFlushPending().finally(() => clanLoad());
  if(typeof playSfx === "function") try{ playSfx("ready"); }catch(e){}
}
async function clanLoad(){
  if(!_cLogged() || !_cCan()){ CLAN.data = null; _cRender(); return; }
  CLAN.loading = true; CLAN.err = ""; _cRender();
  const r = await clanApi("GET", "/api/clan");
  CLAN.loading = false;
  if(r.status === 200){
    CLAN.data = r.j;
    const tabs = _cTabs().map(t => t[0]);
    if(!tabs.includes(CLAN.tab)) CLAN.tab = tabs[0];
    if(CLAN.tab === "find" || CLAN.tab === "table") await _cLoadList();
  } else { CLAN.data = null; CLAN.err = r.status === 401 ? "Tu sesión venció. Entrá de nuevo." : _cErrText(r); }
  _cRender();
}
async function _cLoadList(){
  const sort = CLAN.tab === "table";
  const r = await clanApi("GET", "/api/clans?limit=" + (sort ? 30 : 20) + (!sort && CLAN.q ? "&q=" + encodeURIComponent(CLAN.q) : ""));
  if(r.status === 200){ if(sort) CLAN.table = r.j; else CLAN.list = r.j; }
  else CLAN.err = _cErrText(r);
}
function _cTabs(){
  const d = CLAN.data;
  if(!d) return [];
  return d.clan ? [["clan", "Mi clan"], ["members", "Miembros"], ["castle", "Castillo"], ["table", "Tabla"]] : [["find", "Buscar"], ["create", "Crear"], ["table", "Tabla"]];
}

/* ---- Conquista del Castillo: requisitos ---- */
function _cCampaignLeft(){
  try{ if(typeof ARENA_ORDER === "undefined") return 0; const cl = (save && save.arenasCleared) || {}; return ARENA_ORDER.filter(a => !cl[a]).length; }catch(e){ return 0; }
}
function _cChampion(){
  try{
    let k = selectedClass;
    if(typeof championCompetitive === "function" && (!k || !championCompetitive(k))) k = Object.keys(CLASSES).find(c => save.champions[c] && save.champions[c].unlocked && championCompetitive(c)) || k;
    return k;
  }catch(e){ return null; }
}
const CLAN_TIERS = { 1: ["Guarnición novata", "Estructuras rivales 20 % más débiles"], 2: ["Compañía de asedio", "Rival parejo, con una carta de horda y bots de nivel +1"], 3: ["Gran ejército", "Estructuras +25 %, tres cartas de horda y bots de nivel +2"] };
function clanStartCastle(){
  const d = CLAN.data; if(!d || !d.clan) return false;
  if(typeof lanesStart !== "function"){ _cMsg("La Conquista del Castillo no está disponible en esta versión."); return false; }
  if(_cCampaignLeft() > 0){ _cMsg("Completá la campaña para abrir la Conquista del Castillo."); return false; }
  if(typeof netInRoom === "function" && netInRoom()){ _cMsg("Salí de tu sala actual antes de jugar."); return false; }
  const champ = _cChampion(); if(!champ){ _cMsg("Elegí un guardián en GUARDIANES."); return false; }
  const rv = (typeof CASTLE !== "undefined" ? CASTLE.RIVALS : [["Colmillos Rojos", "CRJ"]])[CLAN.rivalIdx % (typeof CASTLE !== "undefined" ? CASTLE.RIVALS.length : 1)];
  let ok = false;
  try{
    clanClose();
    ok = lanesStart({ champ, mode: "castle", castle: { side: CLAN.side, tier: CLAN.tier, clanName: d.clan.name, clanTag: d.clan.tag, rivalName: rv[0], rivalTag: rv[1], rivalIdx: CLAN.rivalIdx } });
  }catch(e){ console.error("Conquista del Castillo:", e); ok = false; }
  if(!ok){ clanOpen({ tab: "castle" }); _cMsg("No se pudo empezar la partida ahora (¿estás en el entrenamiento?). Probá de nuevo."); }
  return ok;
}

/* ---- render ---- */
function _cMsg(text){ CLAN.msg = text; _cRender(); }
function _cRow(c, mine){
  const mem = c.members + "/" + c.maxMembers;
  const act = c.id === mine ? '<span class="clan-badge">TU CLAN</span>' : (CLAN.data && CLAN.data.clan ? "" :
    '<button type="button" class="btn small clan-btn" data-clan-join="' + c.id + '"' + (c.members >= c.maxMembers ? " disabled" : "") + '>' + (c.members >= c.maxMembers ? "Completo" : c.joinMode === "closed" ? "Pedir entrar" : "Unirme") + '</button>');
  return '<div class="clan-row' + (c.id === mine ? " me" : "") + '"><span class="clan-rank">#' + c.rank + '</span><span class="clan-rname"><span class="clan-nm"><b>[' + _cEsc(c.tag) + ']</b> ' + _cEsc(c.name) +
    '</span><small>' + _cEsc(c.desc || "Sin descripción.") + '</small></span><span class="clan-rstat">' + _cFmt(c.points) + ' pts<small>' + mem + ' · ' + (c.joinMode === "closed" ? "por solicitud" : "abierto") + '</small></span>' + act + '</div>';
}
function _cBody(){
  const d = CLAN.data;
  if(!_cLogged()) return '<div class="clan-empty"><p>Para tener un clan necesitás una cuenta: es la misma que guarda tu progreso en la nube.</p><button type="button" class="btn clan-btn" data-clan-account>Entrar o crear cuenta</button></div>';
  if(!_cCan()) return '<div class="clan-empty clan-warn">' + CLAN_NOT_ON_SERVER + '</div>';
  if(CLAN.loading && !d) return '<div class="clan-empty">Cargando tu clan…</div>';
  if(CLAN.err && !d) return '<div class="clan-empty clan-warn">' + _cEsc(CLAN.err) + '</div><div class="clan-actions"><button type="button" class="btn small clan-btn" data-clan-reload>Reintentar</button></div>';
  if(!d) return "";
  const c = d.clan, me = d.me, lim = d.limits;
  const cool = d.cooldownMs > 0 ? '<div class="clan-note">Podés unirte a otro clan en ' + Math.ceil(d.cooldownMs / 60000) + ' min.</div>' : "";
  if(CLAN.tab === "find"){
    const L = CLAN.list;
    return cool + '<form class="clan-search" data-clan-form="search"><input type="text" name="q" maxlength="40" value="' + _cEsc(CLAN.q) + '" placeholder="Nombre o etiqueta" aria-label="Buscar clan" autocomplete="off"><button class="btn small clan-btn" type="submit">Buscar</button></form>' +
      (L ? (L.clans.length ? '<div class="clan-list">' + L.clans.map(x => _cRow(x, L.mine)).join("") + '</div>' : '<div class="clan-empty">No hay clanes con ese nombre. ¡Creá el tuyo!</div>') : '<div class="clan-empty">Cargando clanes…</div>');
  }
  if(CLAN.tab === "create"){
    return cool + '<form class="clan-form" data-clan-form="create">' +
      '<label>Nombre del clan <small>(' + lim.nameMin + ' a ' + lim.nameMax + ' letras, números o espacios)</small><input type="text" name="name" maxlength="' + lim.nameMax + '" required autocomplete="off"></label>' +
      '<label>Etiqueta <small>(' + lim.tagMin + ' a ' + lim.tagMax + ' letras o números)</small><input type="text" name="tag" maxlength="' + lim.tagMax + '" required autocomplete="off" style="text-transform:uppercase"></label>' +
      '<label>Descripción <small>(opcional, hasta ' + lim.descMax + ' caracteres, sin enlaces)</small><input type="text" name="desc" maxlength="' + lim.descMax + '" autocomplete="off"></label>' +
      '<label>Ingreso<select name="joinMode"><option value="open">Abierto: entra quien quiera</option><option value="closed">Por solicitud: aprueba un oficial</option></select></label>' +
      '<div class="clan-note">Hasta ' + lim.maxMembers + ' miembros. El nombre y la etiqueta son únicos y no se pueden cambiar después. Sin insultos ni nombres del equipo del juego.</div>' +
      '<div class="clan-actions"><button class="btn clan-btn" type="submit">Crear clan</button></div></form>';
  }
  if(CLAN.tab === "table"){
    const T = CLAN.table;
    return T ? (T.clans.length ? '<div class="clan-list">' + T.clans.map(x => _cRow(x, T.mine)).join("") + '</div>' : '<div class="clan-empty">Todavía no hay clanes. ¡Creá el primero!</div>') : '<div class="clan-empty">Cargando la tabla…</div>';
  }
  if(!c) return "";
  const isLeader = me.role === "leader", canMod = me.role === "leader" || me.role === "officer";
  if(CLAN.tab === "clan"){
    const hist = c.history.length ? '<ul class="clan-hist">' + c.history.map(h => '<li class="' + (h.result === "win" ? "win" : "loss") + '">' + (h.role === "attack" ? "Ataque" : "Defensa") + ' · nivel ' + h.tier + ' · ' + (h.result === "win" ? "victoria" : "derrota") + ' <b>' + (h.delta > 0 ? "+" : "") + h.delta + '</b></li>').join("") + '</ul>' : '<div class="clan-note">Todavía no jugaron la Conquista del Castillo.</div>';
    const today = d.today.clanGainMax ? '<div class="clan-note">Hoy el clan sumó ' + d.today.clanGain + ' de ' + d.today.clanGainMax + ' puntos posibles. Vos: ' + d.today.userReports + ' de ' + d.today.userMax + ' partidas contadas.</div>' : "";
    let edit = "";
    if(isLeader) edit = '<form class="clan-form clan-edit" data-clan-form="edit"><label>Descripción<input type="text" name="desc" maxlength="' + lim.descMax + '" value="' + _cEsc(c.desc) + '" autocomplete="off"></label>' +
      '<label>Ingreso<select name="joinMode"><option value="open"' + (c.joinMode === "open" ? " selected" : "") + '>Abierto</option><option value="closed"' + (c.joinMode === "closed" ? " selected" : "") + '>Por solicitud</option></select></label>' +
      '<div class="clan-actions"><button class="btn small clan-btn" type="submit">Guardar cambios</button></div></form>';
    const leave = isLeader ? '<form class="clan-form clan-disband" data-clan-form="disband"><label>Para disolver el clan escribí su etiqueta (' + _cEsc(c.tag) + ')<input type="text" name="confirm" maxlength="4" autocomplete="off"></label><div class="clan-actions"><button class="btn small secondary clan-btn clan-danger" type="submit">Disolver clan</button></div></form>' : "";
    return '<div class="clan-head"><div class="clan-title"><b>[' + _cEsc(c.tag) + ']</b> ' + _cEsc(c.name) + '</div><div class="clan-desc">' + _cEsc(c.desc || "Sin descripción.") + '</div></div>' +
      '<div class="clan-chips"><span class="ui-chip gold"><b>' + _cFmt(c.points) + '</b> puntos</span><span class="ui-chip">Puesto <b>#' + c.rank + '</b></span><span class="ui-chip"><b>' + c.members + '/' + c.maxMembers + '</b> miembros</span><span class="ui-chip">' + c.wins + ' victorias · ' + c.losses + ' derrotas</span><span class="ui-chip">Tu rango: <b>' + CLAN_ROLE[me.role] + '</b></span></div>' +
      '<h3 class="clan-h3">Últimas guerras</h3>' + hist + today + edit +
      '<div class="clan-actions"><button type="button" class="btn small secondary clan-btn" data-clan-leave>Salir del clan</button></div>' + leave;
  }
  if(CLAN.tab === "members"){
    const rows = c.memberList.map(m => {
      let act = "";
      if(!m.you && canMod && (isLeader || m.role === "member")){
        if(isLeader){ act += m.role === "member" ? '<button type="button" class="btn small clan-btn" data-clan-role="' + m.mid + ':officer">Ascender</button>' : '<button type="button" class="btn small clan-btn" data-clan-role="' + m.mid + ':member">Bajar</button>'; act += '<button type="button" class="btn small clan-btn" data-clan-transfer="' + m.mid + '">Dar liderazgo</button>'; }
        act += '<button type="button" class="btn small secondary clan-btn clan-danger" data-clan-kick="' + m.mid + '">Expulsar</button>';
      }
      return '<div class="clan-member' + (m.you ? " me" : "") + '" data-role="' + m.role + '"><span class="clan-mname"><span class="clan-nm"><b>' + _cEsc(m.name) + '</b>' + (m.you ? " (vos)" : "") + '</span><small>' + CLAN_ROLE[m.role] + ' · aportó ' + _cFmt(m.contrib) + ' pts</small></span>' + (act ? '<span class="clan-macts">' + act + '</span>' : "") + '</div>';
    }).join("");
    const reqs = canMod && c.requests && c.requests.length ? '<h3 class="clan-h3">Solicitudes (' + c.requests.length + ')</h3><div class="clan-list">' + c.requests.map(r => '<div class="clan-member"><span class="clan-mname"><b>' + _cEsc(r.name) + '</b><small>quiere entrar</small></span><span class="clan-macts"><button type="button" class="btn small clan-btn" data-clan-req="' + r.rid + ':1">Aceptar</button><button type="button" class="btn small secondary clan-btn" data-clan-req="' + r.rid + ':0">Rechazar</button></span></div>').join("") + '</div>' : (canMod ? '<div class="clan-note">No hay solicitudes pendientes.</div>' : "");
    return '<div class="clan-list">' + rows + '</div>' + reqs;
  }
  if(CLAN.tab === "castle"){
    const left = _cCampaignLeft(), champ = _cChampion(), cn = champ && typeof CLASSES !== "undefined" && CLASSES[champ] ? CLASSES[champ].name : "tu guardián";
    const rv = (typeof CASTLE !== "undefined" ? CASTLE.RIVALS : [["Colmillos Rojos", "CRJ"]])[CLAN.rivalIdx % (typeof CASTLE !== "undefined" ? CASTLE.RIVALS.length : 1)];
    const pts = lim.war.points[CLAN.tier];
    const tierBtns = [1, 2, 3].map(t => '<button type="button" class="clan-opt' + (CLAN.tier === t ? " on" : "") + '" data-clan-tier="' + t + '" aria-pressed="' + (CLAN.tier === t) + '"><b>Nivel ' + t + '</b><small>' + CLAN_TIERS[t][0] + '</small></button>').join("");
    return '<div class="clan-castle"><p class="clan-lead"><b>CONQUISTA DEL CASTILLO.</b> Un clan ataca un castillo (puertas, torres y corazón) y el otro lo defiende; la horda es la fuerza de asedio. <b>Hoy se juega contra bots:</b> vos y 4 compañeros controlados por el juego contra un clan rival simulado. No es clan contra clan en línea.</p>' +
      (left > 0 ? '<div class="clan-lock">Se abre al completar la campaña (te faltan ' + left + ' arenas).</div>' : '') +
      '<div class="clan-vs"><span><b>[' + _cEsc(c.tag) + ']</b> ' + _cEsc(c.name) + '</span><em>contra</em><span><b>[' + rv[1] + ']</b> ' + _cEsc(rv[0]) + ' <small>(simulado)</small></span><button type="button" class="btn small secondary clan-btn" data-clan-rival>Otro rival</button></div>' +
      '<div class="clan-opts" role="group" aria-label="Tu rol"><button type="button" class="clan-opt' + (CLAN.side === "attack" ? " on" : "") + '" data-clan-side="attack" aria-pressed="' + (CLAN.side === "attack") + '"><b>ATACAR</b><small>Rompé las puertas y el corazón</small></button><button type="button" class="clan-opt' + (CLAN.side === "defend" ? " on" : "") + '" data-clan-side="defend" aria-pressed="' + (CLAN.side === "defend") + '"><b>DEFENDER</b><small>Resistí 11 minutos</small></button></div>' +
      '<div class="clan-opts" role="group" aria-label="Dificultad del rival">' + tierBtns + '</div>' +
      '<div class="clan-note">' + CLAN_TIERS[CLAN.tier][1] + '. Victoria: <b>+' + pts.win + '</b> puntos de clan · derrota: <b>' + pts.loss + '</b>. Hasta ' + lim.war.userDailyMax + ' partidas por día y ' + lim.war.clanDailyGainMax + ' puntos por día para el clan. Jugás con <b>' + _cEsc(cn) + '</b>.</div>' +
      '<div class="clan-note">Los resultados los informa tu dispositivo: sirven para jugar en comunidad, no son una clasificación verificada.</div>' +
      '<div class="clan-actions"><button type="button" class="btn clan-btn clan-go" data-clan-start' + (left > 0 ? " disabled" : "") + '>COMENZAR ASEDIO</button></div></div>';
  }
  return "";
}
function _cRender(){
  const el = CLAN.el; if(!el) return;
  const panel = el.querySelector(".clan-panel");
  const tabs = _cTabs();
  const keep = panel.querySelector(".clan-scroll") ? panel.querySelector(".clan-scroll").scrollTop : 0;
  const focusName = document.activeElement && el.contains(document.activeElement) ? (document.activeElement.name || "") : "";
  const pending = _cPendingRead().length;
  panel.innerHTML = '<div class="clan-top"><div class="ui-panel-title">⚑ Clan</div><button type="button" class="ui-icon-btn clan-x" data-clan-close aria-label="Cerrar">✕</button></div>' +
    (tabs.length ? '<div class="clan-tabs" role="tablist">' + tabs.map(t => '<button type="button" role="tab" class="clan-tab' + (CLAN.tab === t[0] ? " on" : "") + '" aria-selected="' + (CLAN.tab === t[0]) + '" data-clan-tab="' + t[0] + '">' + t[1] + '</button>').join("") + '</div>' : "") +
    '<div class="clan-scroll">' + (CLAN.msg ? '<div class="clan-msg" role="status">' + _cEsc(CLAN.msg) + '</div>' : "") +
    (pending ? '<div class="clan-note">Hay ' + pending + ' resultado(s) de la Conquista del Castillo esperando conexión.</div>' : "") + _cBody() + '</div>';
  const sc = panel.querySelector(".clan-scroll"); if(sc) sc.scrollTop = keep;
  if(focusName){ const f = panel.querySelector('[name="' + focusName + '"]'); if(f) try{ f.focus({ preventScroll: true }); }catch(e){} }
}

/* ---- acciones ---- */
async function _cDo(method, path, body, okMsg){
  if(CLAN.busy) return null;
  CLAN.busy = true;
  const r = await clanApi(method, path, body);
  CLAN.busy = false;
  if(r.status === 200 && r.j.ok){ CLAN.msg = okMsg || ""; CLAN.list = null; CLAN.table = null; await clanLoad(); return r; }
  CLAN.msg = _cErrText(r); _cRender(); return r;
}
async function _cAsk(text, okText, danger){
  if(typeof gameConfirm === "function") return gameConfirm(text, { okText, danger });
  return window.confirm(text);
}
function _cClick(ev){
  const t = ev.target.closest && ev.target.closest("button"); if(!t || !CLAN.el.contains(t)) return;
  const ds = t.dataset;
  if(ds.clanClose !== undefined){ clanClose(); return; }
  if(ds.clanAccount !== undefined){ clanClose(); if(typeof window.accountOpen === "function") window.accountOpen(); return; }
  if(ds.clanReload !== undefined){ clanLoad(); return; }
  if(ds.clanTab){ CLAN.tab = ds.clanTab; CLAN.msg = ""; _cRender(); if(CLAN.tab === "find" || CLAN.tab === "table") _cLoadList().then(_cRender); return; }
  if(ds.clanJoin){ const id = +ds.clanJoin; _cDo("POST", "/api/clan/join", { id }, "").then(r => { if(r && r.j && r.j.requested){ CLAN.msg = "Pediste entrar a " + r.j.clan + ". Un oficial tiene que aceptarte."; _cRender(); } else if(r && r.j && r.j.joined){ CLAN.tab = "clan"; CLAN.msg = "¡Ya sos parte de " + r.j.clan + "!"; _cRender(); } }); return; }
  if(ds.clanLeave !== undefined){ _cAsk("¿Salir del clan? No vas a poder entrar a otro por unos minutos.", "Salir", true).then(ok => { if(ok) _cDo("POST", "/api/clan/leave", undefined, "Saliste del clan."); }); return; }
  if(ds.clanKick){ _cAsk("¿Expulsar a este miembro?", "Expulsar", true).then(ok => { if(ok) _cDo("POST", "/api/clan/kick", { mid: +ds.clanKick }, "Miembro expulsado."); }); return; }
  if(ds.clanRole){ const [mid, role] = ds.clanRole.split(":"); _cDo("POST", "/api/clan/role", { mid: +mid, role }, role === "officer" ? "Ascendido a oficial." : "Bajado a miembro."); return; }
  if(ds.clanTransfer){ _cAsk("¿Pasar el liderazgo? Vas a quedar como oficial.", "Pasar liderazgo", true).then(ok => { if(ok) _cDo("POST", "/api/clan/transfer", { mid: +ds.clanTransfer, confirm: true }, "Liderazgo traspasado."); }); return; }
  if(ds.clanReq){ const [rid, acc] = ds.clanReq.split(":"); _cDo("POST", "/api/clan/request", { rid: +rid, accept: acc === "1" }, acc === "1" ? "Solicitud aceptada." : "Solicitud rechazada."); return; }
  if(ds.clanSide){ CLAN.side = ds.clanSide === "defend" ? "defend" : "attack"; _cRender(); return; }
  if(ds.clanTier){ CLAN.tier = [1, 2, 3].includes(+ds.clanTier) ? +ds.clanTier : 1; _cRender(); return; }
  if(ds.clanRival !== undefined){ CLAN.rivalIdx = (CLAN.rivalIdx + 1) % (typeof CASTLE !== "undefined" ? CASTLE.RIVALS.length : 1); _cRender(); return; }
  if(ds.clanStart !== undefined){ clanStartCastle(); return; }
}
function _cSubmit(form){
  const kind = form.dataset.clanForm, f = new FormData(form), g = k => String(f.get(k) == null ? "" : f.get(k));
  if(kind === "search"){ CLAN.q = g("q").trim().slice(0, 40); CLAN.list = null; _cRender(); _cLoadList().then(_cRender); return; }
  if(kind === "create"){ _cDo("POST", "/api/clan/create", { name: g("name"), tag: g("tag"), desc: g("desc"), joinMode: g("joinMode") }, "¡Clan creado!").then(r => { if(r && r.j && r.j.ok){ CLAN.tab = "clan"; _cRender(); } }); return; }
  if(kind === "edit"){ _cDo("POST", "/api/clan/edit", { desc: g("desc"), joinMode: g("joinMode") }, "Cambios guardados."); return; }
  if(kind === "disband"){ _cAsk("¿Disolver el clan para siempre? Se pierden sus puntos.", "Disolver", true).then(ok => { if(ok) _cDo("POST", "/api/clan/disband", { confirm: g("confirm") }, "El clan se disolvió."); }); return; }
}

/* ---------------- enganches ---------------- */
window.clanOpen = clanOpen;
window.clanClose = clanClose;
window.clanStartCastle = clanStartCastle;
(function clanWire(){
  const b = document.getElementById("mainmenu-clan-btn");
  if(b) b.addEventListener("click", () => clanOpen());
  document.addEventListener("keydown", ev => { if(ev.key === "Escape" && clanIsOpen()) clanClose(); });
  // al entrar a la cuenta: se mandan los partes pendientes
  window.addEventListener("account-change", ev => { if(ev && ev.detail && ev.detail.logged && !ev.detail.syncing) clanFlushPending(); if(clanIsOpen()) clanLoad(); });
  setTimeout(() => { if(_cLogged()) clanFlushPending(); }, 6000);
})();
