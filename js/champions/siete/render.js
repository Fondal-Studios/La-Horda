'use strict';
/* ============================================================
   js/champions/siete/render.js — capas propias de Ilsa, Vorn y Kora (Art Bible §7: telegraphs siempre visibles; lo
   decorativo respeta fxBudget / "Reducir efectos intensos"). Sin shadowBlur; nada se asigna por partícula.
   Lectura sin color: cada estado tiene forma y texto propios (anillo de postura, aro de forma, estela de impulso).
   ============================================================ */
function siText(txt, x, y, col, size){ ctx.save(); ctx.font = pxFont(size || 12); ctx.fillStyle = '#0b0e16'; ctx.fillText(txt, x + 1, y + 1); ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore(); }
function siAlive(o){ return o.life > 0 && o.owner && o.owner.alive && !o.owner.fused; }
const siOriginalGround = drawPortadorGround;
drawPortadorGround = function(){
  siOriginalGround();
  ctx.save();
  for(const o of portadorObjects){
    if(!o.si || !siAlive(o)) continue;
    const k = o.kind.slice(3), fade = Math.min(1, o.life / 300);
    if(k === 'stomp') ascRing(o.x, o.y, o.r * (.85 + .08 * Math.sin(animNow / 1000 * 8)), '#9ad0a8', 3, .6 * fade);
  }
  ctx.globalAlpha = 1;
  for(const h of heroes){
    if(!sietCandidate(h) || !h.alive) continue;
    const q = h.siCue, s = h.siState;
    if(q && q.until > runElapsedMs && q.r){
      const a = Math.min(1, (q.until - runElapsedMs) / 300);
      ascRing(h.x, h.y, q.r * (q.ult ? 1 : 1.0 - .15 * a), h.cls.glow, q.ult ? 3 : 2, a * .85);
    }
    if(!s) continue;
    // Marcadores de recurso: forma + número (legible sin color).
    let label = '';
    const t0 = runElapsedMs;
    if(h.classKey === 'ilsa') label = '⚔' + (s.riposte || 0) + (s.parryUntil > t0 || s.autoUntil > t0 ? ' ◈' : '');
    else if(h.classKey === 'vorn') label = s.beastUntil > t0 ? '◐ BESTIA' : (s.form ? '≋ TORMENTA' : '▣ PIEDRA');
    else if(h.classKey === 'kora') label = '»' + Math.round(s.mom || 0);
    if(label) siText(label, h.x - 22, h.y - 58, h.cls.glow, 12);
  }
  ctx.restore();
};
// Adorno propio sobre el cuerpo (nunca dentro del Art Gate, que mide solo el cuerpo).
const siOriginalDraw = drawPortador;
drawPortador = function(h, scale, alpha){
  const out = siOriginalDraw(h, scale, alpha);
  if(!sietCandidate(h) || !h.alive || (typeof window !== 'undefined' && window.ART_GATE_NO_VFX)) return out;
  const s = h.siState || {};
  ctx.save(); ctx.globalAlpha = alpha * .85;
  if(h.classKey === 'vorn'){ ctx.strokeStyle = s.form ? '#9ad8ff' : '#b8b8b0'; ctx.lineWidth = 1.5; ctx.setLineDash(s.form ? [3, 3] : []); ctx.beginPath(); ctx.ellipse(h.x, h.y - 4, 20, 8, 0, 0, Math.PI * 2); ctx.stroke(); }
  if(h.classKey === 'kora' && (s.mom || 0) > 20){ ctx.strokeStyle = '#ffb070'; ctx.lineWidth = 1.5; for(let i = 0; i < Math.min(3, Math.floor(s.mom / 30)); i++){ ctx.beginPath(); ctx.moveTo(h.x - 16 - i * 5, h.y - 24 + i * 6); ctx.lineTo(h.x - 26 - i * 5, h.y - 24 + i * 6); ctx.stroke(); } }
  ctx.restore();
  return out;
};
