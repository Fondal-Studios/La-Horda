"use strict";
/* ============================================================
   js/systems/set-visuals.js
   EFECTOS VISUALES DE SET (modelo B, docs/economy/BRASAS_REDEFINICION.md).
   Los sets dan bono de estadísticas + estos efectos (partículas y color de aura); la SKIN es premium aparte.
   Solo cosmético: no toca estadísticas. Respeta "Reducir efectos" (JUICE.reduceFx).
   Intensidad por piezas: 2 = chispas leves, 3-4 = más densas, set completo = ráfaga plena.
   ============================================================ */
function setVisualDominant(h){
  const c = typeof heroSetCounts === "function" ? heroSetCounts(h) : null;
  if(!c) return null;
  let best = null, bn = 0;
  for(const id in c){ if(c[id] >= 2 && c[id] > bn && SET_DB[id]){ best = id; bn = c[id]; } }
  return best ? {id:best, n:bn, full:bn >= setFullCount(best), rgb:SET_DB[best].aura || "200,200,255"} : null;
}
function setVisualBlurb(setId){
  const S = SET_DB[setId]; if(!S) return "";
  return "Efecto visual del set: aura y partículas de color (2 piezas leve, set completo plena). No cambia estadísticas.";
}
function updateSetVisuals(h, dt){
  if(!h || !h.alive || typeof particles === "undefined") return;
  if(typeof JUICE !== "undefined" && JUICE.reduceFx) return;
  const v = setVisualDominant(h); if(!v) return;
  const rate = (v.full ? 0.14 : v.n >= 3 ? 0.07 : 0.035) * (dt / 16.7);
  if(Math.random() >= rate) return;
  particles.push({x:h.x + (Math.random()-0.5)*26, y:h.y - 4 - Math.random()*18, vx:(Math.random()-0.5)*12, vy:-22 - Math.random()*14, life:520, color:"rgb(" + v.rgb + ")"});
}
