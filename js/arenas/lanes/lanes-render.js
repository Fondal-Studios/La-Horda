"use strict";
/* ============================================================
   js/arenas/lanes/lanes-render.js
   GUERRA DE CRISTALES en el motor real — dibujo del escenario: un mapa ancho de piedra con la línea central,
   las bases (portales de la horda y cristal) y las torres de cada equipo. El vestido del mapa (selva, río, empedrado,
   braseros, pilares) está en lanes-scenery.js.
   ============================================================ */
const _lnImg = {};
function lanesImg(key, src){ let i = _lnImg[key]; if(!i){ i = _lnImg[key] = new Image(); i.src = src; } return i; }
let _lnAmber = null;
function lanesCrystalImg(team){
  const img = lanesImg("crystal", "assets/vfx/bosses/hielo/bsAngelPillar_1.png");
  if(team === 0 || !img.complete || !img.naturalWidth) return img;
  if(_lnAmber) return _lnAmber;
  try{ // recoloreado ámbar una sola vez (sin ctx.filter: Safari no lo soporta en canvas)
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height), a = d.data;
    for(let k = 0; k < a.length; k += 4){ const r = a[k], gg = a[k+1], b = a[k+2]; a[k] = Math.min(255, b * 1.05 + 40); a[k+1] = Math.min(255, gg * 0.78 + 20); a[k+2] = Math.min(255, r * 0.45); }
    g.putImageData(d, 0, 0); _lnAmber = c; return c;
  }catch(e){ return img; }
}
const LANES_TEAM_COL = ["#70c9ff", "#ffb86a", "#7be0a0", "#ff7a8a"], LANES_TEAM_NAME = ["ZAFIRO", "ÁMBAR", "ESMERALDA", "CARMESÍ"];
function lanesTeamColor(i){ return LANES_TEAM_COL[i] || "#ffffff"; }
function lanesTeamName(i){ return LANES_TEAM_NAME[i] || "EQUIPO"; }

function lanesStrokePath(pts, w, style){
  ctx.beginPath(); pts.forEach((q, i)=>{ if(i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
  ctx.lineWidth = w; ctx.strokeStyle = style; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
}
function lanesDrawWorld(now){
  if(!LN) return;
  const W = LANES.W, H = LANES.H;
  ctx.save();
  if(!LNS.built) lnsBuild();
  ctx.fillStyle = "#070b07"; ctx.fillRect(-120, -120, W + 240, H + 240);
  ctx.fillStyle = floorPattern || "#1a2418"; ctx.fillRect(0, 0, W, H);     // suelo de selva (tema «convergencia» en arena.js)
  lanesSceneryRiver(now);
  lanesSceneryLanes();
  // campamentos: tierra pisoteada
  for(const cd of LANES_CAMPS){
    if(!inView(cd.x, cd.y, 200)) continue;
    const camp = LN.camps && LN.camps[cd.id], alive = camp ? camp.mons.some(m=>m.alive) : false;
    ctx.fillStyle = "rgba(70,48,28,.65)"; ctx.beginPath(); ctx.ellipse(cd.x, cd.y + 4, 96, 62, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(40,26,14,.5)"; ctx.beginPath(); ctx.ellipse(cd.x, cd.y + 6, 60, 36, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = alive ? "rgba(230,190,110,.55)" : "rgba(160,140,110,.25)"; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.ellipse(cd.x, cd.y + 4, 96, 62, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  }
  lanesSceneryGround(now);
  lanesSceneryLights(now);
  lanesSceneryEdge();
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.62); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.40)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 12; ctx.strokeStyle = "#2a3448"; ctx.strokeRect(0, 0, W, H);
  ctx.restore();
}

function lanesDrawTower(s, now){
  const col = lanesTeamColor(s.team), f = Math.max(0, s.hp / s.maxHp), x = s.x, y = s.y;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(0, 14, 52, 17, 0, 0, Math.PI * 2); ctx.fill();
  if(s.hitFlash > 0){ ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 26; }
  // cuerpo: tres bloques de piedra que se angostan y una gema que late
  const stone = ["#4a566a", "#5b6980", "#3a4558"];
  ctx.fillStyle = stone[2]; ctx.fillRect(-34, -22, 68, 34);
  ctx.fillStyle = stone[0]; ctx.fillRect(-27, -66, 54, 46);
  ctx.fillStyle = stone[1]; ctx.beginPath(); ctx.moveTo(-31, -66); ctx.lineTo(31, -66); ctx.lineTo(22, -88); ctx.lineTo(-22, -88); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0,0,0,.22)"; for(let k = 0; k < 3; k++) ctx.fillRect(-27, -60 + k * 14, 54, 2);
  ctx.fillStyle = col; ctx.fillRect(-34, -22, 68, 5); ctx.fillRect(-27, -66, 54, 4);   // franjas del equipo
  const pulse = 0.7 + Math.sin(now * 3 + s.x) * 0.3;
  ctx.shadowColor = col; ctx.shadowBlur = 18 * pulse; ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, -128); ctx.lineTo(15, -104); ctx.lineTo(0, -86); ctx.lineTo(-15, -104); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.moveTo(0, -122); ctx.lineTo(6, -106); ctx.lineTo(0, -98); ctx.closePath(); ctx.fill();
  if(f < 0.5){ ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, -60); ctx.lineTo(2, -44); ctx.lineTo(-4, -30); ctx.stroke(); }
  if(s.ward > 0){ ctx.strokeStyle = "rgba(169,245,255," + (0.35 + s.ward / 400) + ")"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -52, 70, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}
function lanesDrawCrystal(s){
  const col = lanesTeamColor(s.team), f = Math.max(0, s.hp / s.maxHp), pulse = 1 + Math.sin(performance.now() / 330) * 0.035;
  ctx.save(); ctx.translate(s.x, s.y); ctx.scale(pulse, pulse);
  ctx.fillStyle = "#17222f"; ctx.beginPath(); ctx.ellipse(0, 12, 74, 25, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = col; ctx.shadowBlur = s.hitFlash > 0 ? 44 : 22;
  const img = lanesCrystalImg(s.team), w = 33 * 2.7, h = 75 * 2.7;
  if(img && (img.width || img.naturalWidth)) ctx.drawImage(img, -w / 2, -h + 14, w, h);
  else { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(30, -30); ctx.lineTo(0, 10); ctx.lineTo(-30, -30); ctx.closePath(); ctx.fill(); }
  ctx.shadowBlur = 0;
  if(s.ward > 0){ ctx.strokeStyle = "rgba(169,245,255," + (0.35 + s.ward / 400) + ")"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -40, 78, 0, Math.PI * 2); ctx.stroke(); }
  if(f < 0.5){ ctx.strokeStyle = "rgba(255,255,255," + (0.5 - f).toFixed(2) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -120); ctx.lineTo(4, -90); ctx.lineTo(-3, -70); ctx.lineTo(7, -40); ctx.stroke(); }
  ctx.restore();
}
// Estructuras, barras de vida y disparos de las torres (se dibujan encima del piso; las criaturas las rodean).
function lanesDrawTop(){
  if(!LN) return;
  const now = performance.now() / 1000;
  for(const T of LN.team) for(const s of T.S){
    if(!s.alive || !inView(s.x, s.y, 300)) continue;
    const col = lanesTeamColor(s.team), f = Math.max(0, s.hp / s.maxHp), exposed = lanesExposed(s);
    if(s.kind === "tower") lanesDrawTower(s, now); else lanesDrawCrystal(s);
    const bw = s.kind === "tower" ? 96 : 130, by = s.y + (s.kind === "tower" ? 34 : 40);
    ctx.fillStyle = "rgba(5,8,14,.85)"; ctx.fillRect(s.x - bw / 2 - 2, by, bw + 4, 14);
    ctx.fillStyle = exposed ? (f > 0.5 ? col : (f > 0.25 ? "#ffcf5c" : "#ff6a5a")) : "#7c8798"; ctx.fillRect(s.x - bw / 2, by + 2, bw * f, 10);
    if(!exposed && player && Math.hypot(player.x - s.x, player.y - s.y) < 700){ ctx.font = pxFont(12); ctx.textAlign = "center"; ctx.fillStyle = "#cfd8e4"; ctx.fillText("PROTEGIDA", s.x, by + 28); }
    else if(s.kind === "crystal"){ ctx.font = pxFont(12); ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.fillText(lanesTeamName(s.team) + " " + Math.ceil(s.hp), s.x, by + 28); }
  }
  // disparos de torre
  ctx.save(); ctx.lineCap = "round";
  for(const sh of LN.shots){
    const k = Math.min(1, (LN.t - sh.t) / 200), x = sh.x1 + (sh.x2 - sh.x1) * k, y = sh.y1 + (sh.y2 - sh.y1) * k, col = lanesTeamColor(sh.team);
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.globalAlpha = 1 - k * 0.5; ctx.shadowColor = col; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(sh.x1 + (x - sh.x1) * 0.6, sh.y1 + (y - sh.y1) * 0.6); ctx.lineTo(x, y); ctx.stroke();
  }
  ctx.restore();
  // anillo de equipo bajo los héroes para distinguir aliados de rivales
  for(const h of heroes){ if(!h.alive || h.team == null || !inView(h.x, h.y, 80)) continue;
    ctx.save(); ctx.strokeStyle = lanesTeamColor(h.team); ctx.globalAlpha = h === player ? 0.95 : 0.7; ctx.lineWidth = h === player ? 4 : 3;
    ctx.beginPath(); ctx.ellipse(h.x, h.y + 12, 26, 10, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  // volver a la base: aro que se cierra
  for(const h of heroes){ if(!h._recall || !h.alive || !inView(h.x, h.y, 100)) continue;
    const k = Math.min(1, (LN.t - h._recall.t0) / LANES.RECALL_MS); ctx.save(); ctx.strokeStyle = "#bfe8ff"; ctx.lineWidth = 4; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(h.x, h.y + 6, 60 - 34 * k, 0, Math.PI * 2 * k); ctx.stroke(); ctx.restore(); }
  // anillo de equipo bajo las criaturas (solo las cercanas a la cámara)
  for(const e of enemies){ if(!e.alive || e.lanesProxy || e.team == null || !inView(e.x, e.y, 60)) continue;
    if(e.epicId != null && e.maxHp){ const f = Math.max(0, e.hp / e.maxHp); ctx.fillStyle = "rgba(5,8,14,.85)"; ctx.fillRect(e.x - 62, e.y - 118, 124, 14); ctx.fillStyle = "#d89bff"; ctx.fillRect(e.x - 60, e.y - 116, 120 * f, 10); }
    ctx.save(); ctx.strokeStyle = e.team === 2 ? "#e8c46a" : lanesTeamColor(e.team); ctx.globalAlpha = 0.55; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 6, e.radius * 0.8, e.radius * 0.32, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
}
Object.assign(ARENA_DEFS.convergencia, {drawWorld:lanesDrawWorld, drawTop:lanesDrawTop});
