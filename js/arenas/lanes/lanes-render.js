"use strict";
/* ============================================================
   js/arenas/lanes/lanes-render.js
   GUERRA DE CRISTALES en el motor real — dibujo del escenario: un mapa ancho de piedra con la línea central,
   las bases (portales de la horda y cristal) y las torres de cada equipo. Arte reutilizado del juego.
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

function lanesDrawWorld(now){
  if(!LN) return;
  const W = LANES.W, H = LANES.H;
  ctx.save();
  ctx.fillStyle = "#0c1018"; ctx.fillRect(-80, -80, W + 160, H + 160);
  ctx.fillStyle = floorPattern || "#202937"; ctx.fillRect(0, 0, W, H);
  // tinte de cada mitad y línea central de combate
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "rgba(40,110,170,.30)"); g.addColorStop(0.42, "rgba(8,12,20,.30)"); g.addColorStop(0.58, "rgba(8,12,20,.30)"); g.addColorStop(1, "rgba(190,110,40,.30)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(190,200,215,.10)"; ctx.fillRect(0, LANES.MID_Y - 130, W, 260);          // camino de la horda
  ctx.strokeStyle = "rgba(220,230,245,.16)"; ctx.lineWidth = 3; ctx.setLineDash([22, 18]);
  ctx.beginPath(); ctx.moveTo(0, LANES.MID_Y); ctx.lineTo(W, LANES.MID_Y); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.62); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.45)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 10; ctx.strokeStyle = "#2c3850"; ctx.strokeRect(0, 0, W, H);
  // bases: zona de curación y portales de la horda
  const pimg = lanesImg("portal", "assets/vfx/abismo/portal_activo_0.png");
  for(let t = 0; t < 2; t++){
    const c = laneCrystalPos(t), col = lanesTeamColor(t);
    if(inView(c.x, c.y, 520)){
      ctx.fillStyle = col + "18"; ctx.beginPath(); ctx.arc(c.x, c.y, 260, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col + "66"; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.arc(c.x, c.y, 260, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      for(const p of lanePortals(t)){
        const k = 1 + Math.sin(now * 2.4 + p.y) * 0.03;
        if(pimg.complete && pimg.naturalWidth) ctx.drawImage(pimg, p.x - 52 * k, p.y - 50 * k, 104 * k, 98 * k);
        else { ctx.fillStyle = "#3a1650"; ctx.beginPath(); ctx.ellipse(p.x, p.y, 44, 28, 0, 0, Math.PI * 2); ctx.fill(); }
      }
    }
  }
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
    if(!exposed){ ctx.font = pxFont(12); ctx.textAlign = "center"; ctx.fillStyle = "#cfd8e4"; ctx.fillText("PROTEGIDA", s.x, by + 28); }
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
  // anillo de equipo bajo las criaturas (solo las cercanas a la cámara)
  for(const e of enemies){ if(!e.alive || e.lanesProxy || e.team == null || !inView(e.x, e.y, 60)) continue;
    ctx.save(); ctx.strokeStyle = lanesTeamColor(e.team); ctx.globalAlpha = 0.55; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 6, e.radius * 0.8, e.radius * 0.32, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
}
Object.assign(ARENA_DEFS.convergencia, {drawWorld:lanesDrawWorld, drawTop:lanesDrawTop});
