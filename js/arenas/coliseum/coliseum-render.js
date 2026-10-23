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
  for(let pit = 0; pit < 2; pit++){
    const p = colPitCenter(pit);
    if(!inView(p.x, p.y, COL.PIT_R + 200)) continue;
    colDrawStadium(p);
    // base y borde de piedra
    ctx.fillStyle = "#8a7554"; ctx.beginPath(); ctx.arc(p.x, p.y, COL.PIT_R + 46, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#c4aa79"; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(p.x, p.y, COL.PIT_R + 38, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, COL.PIT_R, 0, Math.PI * 2); ctx.clip();
    colDrawSand(p);
    ctx.fillStyle = "rgba(70,46,24,.12)"; ctx.fillRect(p.x - COL.PIT_R, p.y - COL.PIT_R, COL.PIT_R * 2, COL.PIT_R * 2);
    const g = ctx.createRadialGradient(p.x, p.y, COL.PIT_R * 0.3, p.x, p.y, COL.PIT_R); g.addColorStop(0, "rgba(255,255,255,.05)"); g.addColorStop(1, "rgba(0,0,0,.45)");
    ctx.fillStyle = g; ctx.fillRect(p.x - COL.PIT_R, p.y - COL.PIT_R, COL.PIT_R * 2, COL.PIT_R * 2);
    // zona de peligro: fuera del anillo
    if(c.ringR < COL.PIT_R - 2){
      ctx.fillStyle = "rgba(190,30,30," + (0.28 + 0.1 * Math.sin(now * 5)) + ")";
      ctx.beginPath(); ctx.rect(p.x - COL.PIT_R, p.y - COL.PIT_R, COL.PIT_R * 2, COL.PIT_R * 2); ctx.arc(p.x, p.y, c.ringR, 0, Math.PI * 2, true); ctx.fill("evenodd");
    }
    ctx.restore();
    // anillo
    const warn = c.ringR < COL.PIT_R - 2;
    ctx.strokeStyle = warn ? "#ff6a5a" : "rgba(255,255,255,.35)"; ctx.lineWidth = warn ? 5 : 3; ctx.setLineDash(warn ? [] : [14, 12]);
    ctx.beginPath(); ctx.arc(p.x, p.y, c.ringR, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // marcas de inicio de cada equipo del duelo
    const pair = c.pairs[pit];
    [-1, 1].forEach((side, i)=>{
      const x = p.x + side * COL.START_DIST, rel = sidesOfTeam(pair[i]), col = sidesCol(rel).hi;   // bando (verde / rojo), no color de equipo
      sidesRing(ctx, rel, x, p.y, 74, 100, {lw:4, alpha:0.65});
      ctx.font = pxFont(14); ctx.textAlign = "center"; ctx.fillStyle = col; ctx.fillText(pair[i] === sidesViewTeam() ? "TU EQUIPO" : lanesTeamName(pair[i]), x, p.y - 112);
    });
    ctx.font = pxFont(14); ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillText(pit === 0 ? "DUELO A" : "DUELO B", p.x, p.y + COL.PIT_R + 78);
  }
  ctx.restore();
}
// Anillo del bando bajo cada luchador (verde aliado liso · rojo enemigo discontinuo · yo = blanco + verde brillante).
function colDrawTop(){
  if(!LN) return;
  for(const h of heroes){
    if(!h.alive || h.team == null || !inView(h.x, h.y, 80)) continue;
    sidesRing(ctx, sidesOf(h), h.x, h.y + 12, 26, 10, {lw:h === player ? 3.5 : 3, alpha:h === player ? 0.95 : 0.8});
  }
}
Object.assign(ARENA_DEFS.coliseo, {drawWorld:colDrawWorld, drawTop:colDrawTop});
