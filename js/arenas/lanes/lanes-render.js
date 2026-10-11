"use strict";
/* ============================================================
   js/arenas/lanes/lanes-render.js
   GUERRA DE CRISTALES en el motor real — dibujo del escenario: dos carriles de piedra, portales de la
   Horda arriba y el cristal de cada equipo abajo. Arte reutilizado del juego (sin assets nuevos).
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
function lanesTeamColor(i){ return i === 0 ? "#70c9ff" : "#ffb86a"; }

function lanesDrawWorld(now){
  if(!LN) return;
  for(let i = 0; i < 2; i++){
    const b = laneBox(i), cx = (b.x0 + b.x1) / 2;
    if(!inView(cx, LANES.H / 2, LANES.W * 0.6 + 200)) continue;
    ctx.save();
    ctx.fillStyle = "#10141d"; ctx.fillRect(b.x0 - 60, b.y0 - 60, LANES.W + 120, LANES.H + 120);
    ctx.fillStyle = floorPattern || "#202937"; ctx.fillRect(b.x0, b.y0, LANES.W, LANES.H);
    ctx.fillStyle = "rgba(8,12,20,.38)"; ctx.fillRect(b.x0, b.y0, LANES.W, LANES.H);
    const vg = ctx.createRadialGradient(cx, LANES.H / 2, 160, cx, LANES.H / 2, LANES.W * 0.8); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.5)");
    ctx.fillStyle = vg; ctx.fillRect(b.x0, b.y0, LANES.W, LANES.H);
    ctx.strokeStyle = lanesTeamColor(i); ctx.lineWidth = 8; ctx.strokeRect(b.x0, b.y0, LANES.W, LANES.H);
    // portales de la Horda
    const pimg = lanesImg("portal", "assets/vfx/abismo/portal_activo_0.png");
    for(const p of lanePortals(i)){
      const k = 1 + Math.sin(now * 2.4 + p.x) * 0.03;
      if(pimg.complete && pimg.naturalWidth) ctx.drawImage(pimg, p.x - 80 * k, p.y - 78 * k, 160 * k, 150 * k);
      else { ctx.fillStyle = "#3a1650"; ctx.beginPath(); ctx.ellipse(p.x, p.y, 70, 40, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    // zona de reunión (donde reaparecen)
    const r = laneRally(i); ctx.strokeStyle = lanesTeamColor(i) + "55"; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.arc(r.x, r.y, 120, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
}
// Cristales y avisos sobre las entidades (el cristal es alto: se dibuja encima del piso y los enemigos lo rodean).
function lanesDrawTop(){
  if(!LN) return;
  for(const ln of LN.lane){
    const c = ln.crystal; if(!inView(c.x, c.y, 260)) continue;
    const col = lanesTeamColor(ln.i), f = Math.max(0, c.hp / c.maxHp), pulse = 1 + Math.sin(performance.now() / 330) * 0.035;
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(pulse, pulse);
    ctx.fillStyle = "#17222f"; ctx.beginPath(); ctx.ellipse(0, 12, 70, 24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = col; ctx.shadowBlur = c.hitFlash > 0 ? 44 : 22;
    const img = lanesCrystalImg(ln.i), w = 33 * 2.6, h = 75 * 2.6;
    if(img && (img.width || img.naturalWidth)) ctx.drawImage(img, -w / 2, -h + 14, w, h);
    else { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(30, -30); ctx.lineTo(0, 10); ctx.lineTo(-30, -30); ctx.closePath(); ctx.fill(); }
    ctx.shadowBlur = 0;
    if(c.ward > 0){ ctx.strokeStyle = "rgba(169,245,255," + (0.35 + c.ward / 400) + ")"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -40, 74, 0, Math.PI * 2); ctx.stroke(); }
    if(f < 0.5){ ctx.strokeStyle = "rgba(255,255,255," + (0.5 - f).toFixed(2) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -120); ctx.lineTo(4, -90); ctx.lineTo(-3, -70); ctx.lineTo(7, -40); ctx.stroke(); }
    ctx.restore();
    // barra de vida del cristal
    const bw = 130; ctx.fillStyle = "rgba(5,8,14,.85)"; ctx.fillRect(c.x - bw / 2 - 2, c.y + 40, bw + 4, 14);
    ctx.fillStyle = f > 0.5 ? col : (f > 0.25 ? "#ffcf5c" : "#ff6a5a"); ctx.fillRect(c.x - bw / 2, c.y + 42, bw * f, 10);
    ctx.font = pxFont(12); ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.fillText((ln.i === 0 ? "ZAFIRO " : "ÁMBAR ") + Math.ceil(c.hp), c.x, c.y + 72);
  }
}
Object.assign(ARENA_DEFS.convergencia, {drawWorld:lanesDrawWorld, drawTop:lanesDrawTop});
