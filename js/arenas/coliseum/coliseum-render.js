"use strict";
/* ============================================================
   js/arenas/coliseum/coliseum-render.js
   COLISEO en el motor real — dibujo de los dos fosos: piso de piedra circular con borde, el anillo que se cierra (fuera de él
   duele) y las marcas de cada equipo. Arte reutilizado del juego.
   ============================================================ */
function colDrawWorld(now){
  if(!LN || !LN.col) return;
  const c = LN.col;
  ctx.save();
  ctx.fillStyle = "#07090f"; ctx.fillRect(-100, -100, COL.W + 200, COL.H + 200);
  const act = colActivePits(c);
  for(let pit = 0; pit < 3; pit++){
    const p = colPitCenter(pit), R = colPitR(pit), on = act.includes(pit), ffa = pit === 2;
    if(!inView(p.x, p.y, R + 160)) continue;
    // base y borde de piedra
    ctx.fillStyle = "#1a1f2b"; ctx.beginPath(); ctx.arc(p.x, p.y, R + 46, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ffa ? "#5a4a2a" : "#3a465d"; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(p.x, p.y, R + 38, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = floorPattern || "#2b3347"; ctx.fillRect(p.x - R, p.y - R, R * 2, R * 2);
    ctx.fillStyle = on ? "rgba(8,12,20,.30)" : "rgba(4,6,12,.62)"; ctx.fillRect(p.x - R, p.y - R, R * 2, R * 2);   // el foso que no se usa esta ronda queda apagado
    const g = ctx.createRadialGradient(p.x, p.y, R * 0.3, p.x, p.y, R); g.addColorStop(0, "rgba(255,255,255,.05)"); g.addColorStop(1, "rgba(0,0,0,.45)");
    ctx.fillStyle = g; ctx.fillRect(p.x - R, p.y - R, R * 2, R * 2);
    if(ffa && on){ ctx.fillStyle = "rgba(255,200,90,.07)"; ctx.fillRect(p.x - R, p.y - R, R * 2, R * 2); }
    // zona de peligro: fuera del anillo
    if(on && c.ringR < R - 2){
      ctx.fillStyle = "rgba(190,30,30," + (0.28 + 0.1 * Math.sin(now * 5)) + ")";
      ctx.beginPath(); ctx.rect(p.x - R, p.y - R, R * 2, R * 2); ctx.arc(p.x, p.y, c.ringR, 0, Math.PI * 2, true); ctx.fill("evenodd");
    }
    ctx.restore();
    // anillo
    const rr = on ? c.ringR : R, warn = on && c.ringR < R - 2;
    ctx.strokeStyle = warn ? "#ff6a5a" : "rgba(255,255,255," + (on ? 0.35 : 0.12) + ")"; ctx.lineWidth = warn ? 5 : 3; ctx.setLineDash(warn ? [] : [14, 12]);
    ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    if(on && !ffa){
      // marcas de inicio de cada equipo del duelo
      const pair = c.pairs[pit];
      [-1, 1].forEach((side, i)=>{
        const x = p.x + side * COL.START_DIST, col = lanesTeamColor(pair[i]);
        ctx.strokeStyle = col; ctx.globalAlpha = 0.65; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, p.y, 74, 100, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.font = pxFont(14); ctx.textAlign = "center"; ctx.fillStyle = col; ctx.fillText(pair[i] === 0 ? "TU EQUIPO" : lanesTeamName(pair[i]), x, p.y - 112);
      });
    } else if(on && ffa && c.phase !== "fight"){
      // las cuatro duplas, en círculo
      for(let t = 0; t < 4; t++){
        const ang = Math.PI / 2 + t * Math.PI / 2, x = p.x + Math.cos(ang) * COL.FFA_START_R, y = p.y + Math.sin(ang) * COL.FFA_START_R * 0.78, col = lanesTeamColor(t);
        ctx.strokeStyle = col; ctx.globalAlpha = 0.65; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, 90, 70, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.font = pxFont(14); ctx.textAlign = "center"; ctx.fillStyle = col; ctx.fillText(t === 0 ? "TU EQUIPO" : lanesTeamName(t), x, y + (Math.sin(ang) > 0.5 ? 92 : -84));
      }
    }
    ctx.font = pxFont(14); ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,255,255," + (on ? 0.55 : 0.3) + ")"; ctx.fillText(pit === 0 ? "DUELO A" : pit === 1 ? "DUELO B" : "TODOS CONTRA TODOS", p.x, p.y + R + 78);
  }
  ctx.restore();
}
// Anillo de equipo bajo cada luchador (aliados vs rivales a simple vista).
function colDrawTop(){
  if(!LN) return;
  for(const h of heroes){
    if(!h.alive || h.team == null || !inView(h.x, h.y, 80)) continue;
    ctx.save(); ctx.strokeStyle = lanesTeamColor(h.team); ctx.globalAlpha = h === player ? 0.95 : 0.75; ctx.lineWidth = h === player ? 4 : 3;
    ctx.beginPath(); ctx.ellipse(h.x, h.y + 12, 26, 10, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
}
Object.assign(ARENA_DEFS.coliseo, {drawWorld:colDrawWorld, drawTop:colDrawTop});
