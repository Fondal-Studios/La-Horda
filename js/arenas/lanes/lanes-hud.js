"use strict";
/* ============================================================
   js/arenas/lanes/lanes-hud.js
   GUERRA DE CRISTALES en el motor real — lo que se suma al HUD de siempre (que no se toca):
   marcador de los dos cristales, fragmentos y suministros, vista del carril rival y pantalla de resultado.
   Todo con letra de 14 px o más y botones de 48 px o más.
   ============================================================ */
let _lnHud = null;
function lanesHudBuild(){
  if(_lnHud) return _lnHud;
  const root = document.body; // fuera de #hud (z-index 10) para quedar sobre los controles táctiles
  const el = document.createElement("div"); el.id = "lanes-hud"; el.className = "lanes-hud hidden";
  el.innerHTML =
    '<div class="ln-score" role="status" aria-live="polite">' +
      '<div class="ln-team ln-blue"><b>ZAFIRO</b><span class="ln-pips"></span><span class="ln-hp"></span><i class="ln-bar"><u></u></i></div>' +
      '<div class="ln-clock"><strong class="ln-time">11:00</strong><span class="ln-wave"></span></div>' +
      '<div class="ln-team ln-amber"><b>ÁMBAR</b><span class="ln-pips"></span><span class="ln-hp"></span><i class="ln-bar"><u></u></i></div>' +
    '</div>' +
    '<div class="ln-note" role="status"></div>' +
    '<div class="ln-feed" aria-live="polite"></div>' +
    '<div class="ln-cards hidden" role="group" aria-label="Carta de horda"><div class="ln-cards-title">CARTA DE HORDA <small>potenciá a las criaturas que mandás contra el rival</small></div><div class="ln-cards-row"></div><i class="ln-cards-timer"><u></u></i></div>' +
    '<button type="button" class="ln-chip" aria-expanded="false"><span class="ln-shards">◆ 0</span><span class="ln-phase">Suministros</span></button>' +
    '<div class="ln-shop hidden"></div>' +
    '<div class="ln-rival"><canvas width="330" height="96"></canvas><div class="ln-horde"></div></div>';
  root.appendChild(el);
  const shop = el.querySelector(".ln-shop");
  for(const [key, it] of Object.entries(LANES.SHOP)){
    const b = document.createElement("button"); b.type = "button"; b.dataset.key = key; b.className = "ln-buy" + (key === "swarm" || key === "brute" ? " ln-send" : "");
    b.innerHTML = '<b>' + it.name + '</b><span>' + it.cost + ' ◆</span><small>' + it.desc + '</small>';
    b.addEventListener("click", ()=>{ if(player) lanesBuy(player.team, key, player); lanesHudTick(); });
    shop.appendChild(b);
  }
  const chip = el.querySelector(".ln-chip");
  chip.addEventListener("click", ()=>{ const open = shop.classList.toggle("hidden") === false; chip.setAttribute("aria-expanded", String(open)); el.classList.toggle("ln-shop-open", open); });
  _lnHud = el; return el;
}
function _lnPill(on){ const lv = document.getElementById("hud-level"), sp = lv && lv.parentElement; if(!sp) return;
  sp.innerHTML = on ? 'Oleada <b id="hud-level">0</b> · Vencidos <b id="hud-kills">0</b>' : 'Nivel <b id="hud-level">1</b>/10 · Vencidos <b id="hud-kills">0</b>'; }
function lanesHudShow(){ const el = lanesHudBuild(); el.classList.remove("hidden"); document.body.classList.add("lanes-on"); _lnPill(true); }
function lanesHudSync(s){
  if(_lnHud) _lnHud.style.display = (s === "playing" && LN) ? "" : "none";
  // se fue de la Sala sin jugar (salió de la sala, cerró el menú): se devuelve el guardado real
  if(LN && LN.lobby && s !== "prep" && !(typeof netMatch !== "undefined" && netMatch) && !(typeof netInRoom === "function" && netInRoom())) lanesRestore();
}
function lanesHudHide(){ _lnPill(false); if(_lnHud) _lnHud.classList.add("hidden"); document.body.classList.remove("lanes-on"); const r = document.getElementById("lanes-result"); if(r) r.classList.add("hidden"); }
function _lnClock(ms){ const left = Math.max(0, Math.ceil((LANES.TIME_LIMIT_MS - ms) / 1000)); return Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0"); }

let _lnOfferKey = "";
function lanesHudTick(){
  const L = LN; if(!L || !_lnHud || !player || !L.team.length) return;
  const el = _lnHud, q = s=>el.querySelector(s), me = player.team != null ? player.team : 0, T = L.team[me];
  [0, 1].forEach(i=>{
    const c = L.team[i].S[2], t = el.querySelectorAll(".ln-team")[i];
    t.querySelector(".ln-hp").textContent = Math.ceil(c.hp) + (c.ward > 0 ? " +" + Math.ceil(c.ward) : "");
    t.querySelector(".ln-bar u").style.width = Math.max(0, c.hp / c.maxHp * 100) + "%";
    t.querySelector(".ln-pips").innerHTML = L.team[i].S.slice(0, 2).map(s=>'<em class="' + (s.alive ? "on" : "off") + '">▲</em>').join("") + ' <small>torres</small>';
  });
  q(".ln-time").textContent = _lnClock(L.t);
  q(".ln-wave").textContent = L.t >= LANES.ECLIPSE_MS ? "☀ ECLIPSE" : "Oleada " + L.wave;
  q(".ln-shards").textContent = "◆ " + T.shards;
  q(".ln-phase").textContent = "TIENDA · tocá";
  for(const b of el.querySelectorAll(".ln-buy")) b.disabled = !lanesCanBuy(me, b.dataset.key);
  q(".ln-note").textContent = L.t >= LANES.ECLIPSE_MS ? "Los dos cristales se apagan cada vez más rápido" : (L.t < 15000 ? "Tu horda sale sola. Derribá la torre rival más cercana." : "");
  const foes = L.feed.filter(f=>L.t - f.t < 9000).slice(-3);
  q(".ln-feed").innerHTML = foes.map(f=>'<div style="color:' + lanesTeamColor(f.team) + '">' + f.text + '</div>').join("");
  // carta de horda
  const cards = q(".ln-cards"), key = T.offer ? T.offer.join(",") + "@" + T.offerAt : "";
  if(T.offer){
    if(key !== _lnOfferKey){
      _lnOfferKey = key;
      q(".ln-cards-row").innerHTML = T.offer.map((id, i)=>{ const c = LANES_CARDS[id], n = (T.cards[id] || 0);
        return '<button type="button" class="ln-card" data-i="' + i + '"><span class="ln-card-ico">' + c.icon + '</span><b>' + c.name + '</b><span class="ln-card-desc">' + c.desc + '</span><small>' + (n ? "Nivel " + (n + 1) + "/" + c.max : "Nueva") + '</small></button>'; }).join("");
      for(const b of q(".ln-cards-row").querySelectorAll(".ln-card")) b.addEventListener("click", ()=>{ const i = +b.dataset.i; if(!lanesNetCardRequest(i)) lanesPickCard(me, i); lanesHudTick(); });
    }
    cards.classList.remove("hidden");
    q(".ln-cards-timer u").style.width = Math.max(0, 100 - (L.t - T.offerAt) / LANES.CARD_AUTO_MS * 100) + "%";
  } else { cards.classList.add("hidden"); _lnOfferKey = ""; }
  // horda propia: cartas ya tomadas
  const taken = Object.keys(T.cards).filter(id=>T.cards[id] > 0).map(id=>'<span title="' + LANES_CARDS[id].name + '">' + LANES_CARDS[id].icon + (T.cards[id] > 1 ? "×" + T.cards[id] : "") + '</span>').join("");
  q(".ln-horde").innerHTML = '<b>TU HORDA</b> ' + (taken || '<i>sin cartas todavía</i>');
  lanesDrawMap();
}
// Mapa completo en miniatura: las dos bases, torres, hordas y héroes (se ve todo el tiempo, aunque estés lejos).
function lanesDrawMap(){
  const cv = _lnHud && _lnHud.querySelector(".ln-rival canvas"); if(!cv || !LN) return;
  const g = cv.getContext("2d"), W = cv.width, H = cv.height, sx = W / LANES.W, sy = H / LANES.H;
  g.clearRect(0, 0, W, H); g.fillStyle = "#151b27"; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, "rgba(60,140,210,.28)"); gr.addColorStop(0.5, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(220,140,60,.28)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(220,230,245,.25)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
  g.strokeStyle = "#5a6b88"; g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2);
  for(const T of LN.team) for(const s of T.S){
    if(!s.alive) continue; g.fillStyle = lanesTeamColor(s.team);
    if(s.kind === "crystal"){ const x = s.x * sx, y = s.y * sy; g.beginPath(); g.moveTo(x, y - 11); g.lineTo(x + 8, y); g.lineTo(x, y + 11); g.lineTo(x - 8, y); g.closePath(); g.fill(); }
    else { g.fillRect(s.x * sx - 5, s.y * sy - 5, 10, 10); g.strokeStyle = "#fff"; g.lineWidth = 1; g.strokeRect(s.x * sx - 5, s.y * sy - 5, 10, 10); }
  }
  for(const e of enemies){ if(!e.alive || e.lanesProxy || e.team == null) continue; g.fillStyle = lanesTeamColor(e.team); const z = e.isBrute ? 5 : 2.5; g.fillRect(e.x * sx - z / 2, e.y * sy - z / 2, z, z); }
  for(const h of heroes){ if(h.team == null) continue; g.fillStyle = h.alive ? "#fff" : "#555"; g.beginPath(); g.arc(h.x * sx, h.y * sy, h === player ? 5.5 : 4.5, 0, Math.PI * 2); g.fill(); g.strokeStyle = lanesTeamColor(h.team); g.lineWidth = 2; g.stroke(); }
  if(player){ const vw = (typeof VIEW_WORLD_SHORT !== "undefined" ? VIEW_WORLD_SHORT : 600) * 1.8, vh = vw * 0.56; g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 1; g.strokeRect((player.x - vw / 2) * sx, (player.y - vh / 2) * sy, vw * sx, vh * sy); }
}

/* ---------------- resultado ---------------- */
function lanesShowResult(){
  const L = LN; if(!L) return;
  let r = document.getElementById("lanes-result");
  if(!r){ r = document.createElement("div"); r.id = "lanes-result"; r.className = "lanes-result hidden"; document.body.appendChild(r); }
  const mine = player.team != null ? player.team : 0, won = L.winner === mine, draw = L.winner === -1;
  const rows = heroes.map(h=>{ const s = h.stats || {}; return '<tr' + (h === player ? ' class="me"' : '') + '><td>' + heroLabel(h) + '</td><td>' + (h.team ? "Ámbar" : "Zafiro") + '</td><td>' + Math.round(s.dmgDealt || s.dmg || 0) + '</td><td>' + (s.kills || 0) + '</td><td>' + Math.round(s.healed || s.heal || 0) + '</td></tr>'; }).join("");
  r.innerHTML = '<div class="ln-res-card"><div class="ln-res-kicker">GUERRA DE CRISTALES</div><h2>' + (draw ? "EMPATE" : won ? "¡VICTORIA!" : "CRISTAL CAÍDO") + '</h2>' +
    '<p>Zafiro ' + Math.ceil(L.team[0].S[2].hp) + ' · Ámbar ' + Math.ceil(L.team[1].S[2].hp) + ' · torres en pie ' + lanesTowersAlive(0) + '–' + lanesTowersAlive(1) + ' · bajas de héroes ' + L.team[0].pk + '–' + L.team[1].pk + ' · ' + (L.why === "tiempo" ? "decidida por tiempo" : "cristal destruido") + '</p>' +
    '<table><thead><tr><th>Jugador</th><th>Equipo</th><th>Daño</th><th>Bajas</th><th>Cura</th></tr></thead><tbody>' + rows + '</tbody></table>' +
    '<div class="ln-res-btns"><button type="button" class="ln-again">REVANCHA</button><button type="button" class="ln-exit">VOLVER AL MENÚ</button></div></div>';
  r.classList.remove("hidden");
  const online = !!(typeof netMatch !== "undefined" && netMatch);
  if(online){ r.querySelector(".ln-again").textContent = "VOLVER A LA SALA"; r.querySelector(".ln-exit").textContent = "SALIR DE LA SALA"; }
  r.querySelector(".ln-exit").onclick = ()=>{ r.classList.add("hidden"); if(online){ lanesLeaveOnline(true); } else lanesStop("mainmenu"); };
  r.querySelector(".ln-again").onclick = ()=>{ r.classList.add("hidden"); if(online){ lanesLeaveOnline(false); return; } const s = L.setup; lanesStop(); lanesStart({champ:s.mine, mate:s.mate, rivals:s.rivals}); };
}
