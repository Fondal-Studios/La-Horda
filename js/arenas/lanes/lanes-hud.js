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
      '<div class="ln-team ln-blue"><b>ZAFIRO</b><span class="ln-hp"></span><i class="ln-bar"><u></u></i></div>' +
      '<div class="ln-clock"><strong class="ln-time">7:00</strong><span class="ln-wave"></span></div>' +
      '<div class="ln-team ln-amber"><b>ÁMBAR</b><span class="ln-hp"></span><i class="ln-bar"><u></u></i></div>' +
    '</div>' +
    '<div class="ln-note" role="status"></div>' +
    '<button type="button" class="ln-chip" aria-expanded="false"><span class="ln-shards">◆ 0</span><span class="ln-phase">Suministros</span></button>' +
    '<div class="ln-shop hidden"></div>' +
    '<div class="ln-rival"><div class="ln-rival-title">CAMPO RIVAL</div><canvas width="240" height="150"></canvas></div>';
  root.appendChild(el);
  const shop = el.querySelector(".ln-shop");
  for(const [key, it] of Object.entries(LANES.SHOP)){
    const b = document.createElement("button"); b.type = "button"; b.dataset.key = key; b.className = "ln-buy" + (key === "swarm" || key === "brute" ? " ln-send" : "");
    b.innerHTML = '<b>' + it.name + '</b><span>' + it.cost + ' ◆</span><small>' + it.desc + '</small>';
    b.addEventListener("click", ()=>{ if(player) lanesBuy(player.lane, key, player); lanesHudTick(); });
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

function lanesHudTick(){
  const L = LN; if(!L || !_lnHud || !player || L.ended && !L.lane.length) return;
  const el = _lnHud, q = s=>el.querySelector(s);
  [0, 1].forEach(i=>{
    const c = L.lane[i].crystal, t = el.querySelectorAll(".ln-team")[i];
    t.querySelector(".ln-hp").textContent = Math.ceil(c.hp) + (c.ward > 0 ? " +" + Math.ceil(c.ward) : "");
    t.querySelector(".ln-bar u").style.width = Math.max(0, c.hp / c.maxHp * 100) + "%";
  });
  q(".ln-time").textContent = _lnClock(L.t);
  q(".ln-wave").textContent = L.t >= LANES.ECLIPSE_MS ? "☀ ECLIPSE" : "Oleada " + L.wave;
  const mine = L.lane[player.lane != null ? player.lane : 0], open = lanesShopOpen();
  q(".ln-shards").textContent = "◆ " + mine.shards + (mine.upgrade ? " · Mejora " + mine.upgrade + "/3" : "");
  q(".ln-phase").textContent = open ? "SUMINISTROS · tocá" : "Suministros en " + Math.max(0, Math.ceil((L.nextWave - L.t) / 1000)) + " s";
  el.classList.toggle("ln-supply", open);
  for(const b of el.querySelectorAll(".ln-buy")) b.disabled = !lanesCanBuy(player.lane, b.dataset.key);
  const incoming = L.pending.filter(p=>p.to === player.lane);
  q(".ln-note").textContent = incoming.length ? "⚠ " + incoming.map(p=>(p.kind === "brute" ? "COLOSO" : "ACECHADORES") + " EN " + Math.max(0, Math.ceil((p.due - L.t) / 1000)) + " s").join(" · ") : (L.t >= LANES.ECLIPSE_MS ? "Los dos cristales se apagan cada vez más rápido" : "");
  lanesDrawRival();
}
// Vista del carril rival: cristal, portales, enemigos y héroes, en miniatura (se ve aunque no haya interacción directa).
function lanesDrawRival(){
  const cv = _lnHud && _lnHud.querySelector(".ln-rival canvas"); if(!cv || !LN) return;
  const g = cv.getContext("2d"), rl = 1 - (player.lane || 0), b = laneBox(rl), W = cv.width, H = cv.height, sx = W / LANES.W, sy = H / LANES.H;
  g.clearRect(0, 0, W, H); g.fillStyle = "#171d29"; g.fillRect(0, 0, W, H);
  g.strokeStyle = lanesTeamColor(rl); g.lineWidth = 3; g.strokeRect(1, 1, W - 2, H - 2);
  g.fillStyle = "#7a3fb0"; for(const p of lanePortals(rl)){ g.beginPath(); g.ellipse((p.x - b.x0) * sx, p.y * sy, 12, 6, 0, 0, Math.PI * 2); g.fill(); }
  for(const e of enemies){ if(!e.alive || e.lane !== rl) continue; g.fillStyle = e.isBrute ? "#ff7a5a" : "#e8dcc4"; const s = e.isBrute ? 5 : 3; g.fillRect((e.x - b.x0) * sx - s / 2, e.y * sy - s / 2, s, s); }
  const c = LN.lane[rl].crystal; g.fillStyle = lanesTeamColor(rl); g.beginPath(); g.moveTo((c.x - b.x0) * sx, c.y * sy - 16); g.lineTo((c.x - b.x0) * sx + 8, c.y * sy); g.lineTo((c.x - b.x0) * sx, c.y * sy + 8); g.lineTo((c.x - b.x0) * sx - 8, c.y * sy); g.closePath(); g.fill();
  g.fillStyle = "#0b0f17"; g.fillRect(8, H - 14, W - 16, 8); g.fillStyle = lanesTeamColor(rl); g.fillRect(8, H - 14, (W - 16) * Math.max(0, c.hp / c.maxHp), 8);
  for(const h of heroes){ if(h.lane !== rl) continue; g.fillStyle = h.alive ? "#ffffff" : "#555"; g.beginPath(); g.arc((h.x - b.x0) * sx, h.y * sy, 5, 0, Math.PI * 2); g.fill(); g.strokeStyle = lanesTeamColor(rl); g.lineWidth = 2; g.stroke(); }
}

/* ---------------- resultado ---------------- */
function lanesShowResult(){
  const L = LN; if(!L) return;
  let r = document.getElementById("lanes-result");
  if(!r){ r = document.createElement("div"); r.id = "lanes-result"; r.className = "lanes-result hidden"; document.body.appendChild(r); }
  const mine = player.lane != null ? player.lane : 0, won = L.winner === mine, draw = L.winner === -1;
  const rows = heroes.map(h=>{ const s = h.stats || {}; return '<tr' + (h === player ? ' class="me"' : '') + '><td>' + heroLabel(h) + '</td><td>' + (h.lane ? "Ámbar" : "Zafiro") + '</td><td>' + Math.round(s.dmgDealt || s.dmg || 0) + '</td><td>' + (s.kills || 0) + '</td><td>' + Math.round(s.healed || s.heal || 0) + '</td></tr>'; }).join("");
  r.innerHTML = '<div class="ln-res-card"><div class="ln-res-kicker">GUERRA DE CRISTALES</div><h2>' + (draw ? "EMPATE" : won ? "¡VICTORIA!" : "CRISTAL CAÍDO") + '</h2>' +
    '<p>Zafiro ' + Math.ceil(L.lane[0].crystal.hp) + ' · Ámbar ' + Math.ceil(L.lane[1].crystal.hp) + ' · ' + L.wave + ' oleadas · ' + (L.why === "tiempo" ? "decidida por tiempo" : "cristal destruido") + '</p>' +
    '<table><thead><tr><th>Jugador</th><th>Equipo</th><th>Daño</th><th>Bajas</th><th>Cura</th></tr></thead><tbody>' + rows + '</tbody></table>' +
    '<div class="ln-res-btns"><button type="button" class="ln-again">REVANCHA</button><button type="button" class="ln-exit">VOLVER AL MENÚ</button></div></div>';
  r.classList.remove("hidden");
  const online = !!(typeof netMatch !== "undefined" && netMatch);
  if(online){ r.querySelector(".ln-again").textContent = "VOLVER A LA SALA"; r.querySelector(".ln-exit").textContent = "SALIR DE LA SALA"; }
  r.querySelector(".ln-exit").onclick = ()=>{ r.classList.add("hidden"); if(online){ lanesLeaveOnline(true); } else lanesStop("mainmenu"); };
  r.querySelector(".ln-again").onclick = ()=>{ r.classList.add("hidden"); if(online){ lanesLeaveOnline(false); return; } const s = L.setup; lanesStop(); lanesStart({champ:s.mine, mate:s.mate, rivals:s.rivals}); };
}
