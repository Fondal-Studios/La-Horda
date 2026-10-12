'use strict';
/* ============================================================
   js/champions/siete/render.js — capas propias de los siete (Art Bible §7: telegraphs siempre visibles; lo
   decorativo respeta fxBudget / "Reducir efectos intensos"). Sin shadowBlur; nada se asigna por partícula.
   Lectura sin color: cada entidad tiene forma distinta (haz, lente, placa con púas, charco con juncos, naipes).
   ============================================================ */
const SI_SUIT_COL = ['#e8e8f0', '#6fb0e8', '#e86a8a', '#f0c850'];
function siText(txt, x, y, col, size){ ctx.save(); ctx.font = pxFont(size || 12); ctx.fillStyle = '#0b0e16'; ctx.fillText(txt, x + 1, y + 1); ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore(); }
function siAlive(o){ return o.life > 0 && o.owner && o.owner.alive && !o.owner.fused; }
const siOriginalGround = drawPortadorGround;
drawPortadorGround = function(){
  siOriginalGround();
  const t = animNow / 1000;
  ctx.save();
  for(const o of portadorObjects){
    if(!o.si || !siAlive(o)) continue;
    const k = o.kind.slice(3), fade = Math.min(1, o.life / 300), h = o.owner;
    switch(k){
      case 'beam': {
        const len = o.len, ex = o.x + Math.cos(o.ang) * len, ey = o.y + Math.sin(o.ang) * len, y0 = o.y - 14, y1 = ey - 14, w = o.w;
        ctx.save(); ctx.lineCap = 'round';
        ctx.globalAlpha = .28 * fade; ctx.strokeStyle = '#ffd86a'; ctx.lineWidth = w * 2 + 6; ctx.beginPath(); ctx.moveTo(o.x, y0); ctx.lineTo(ex, y1); ctx.stroke();
        ctx.globalAlpha = .75 * fade; ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = Math.max(3, w * (.9 + .15 * Math.sin(t * 40))); ctx.beginPath(); ctx.moveTo(o.x, y0); ctx.lineTo(ex, y1); ctx.stroke();
        ctx.globalAlpha = fade; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1.5, w * .3); ctx.beginPath(); ctx.moveTo(o.x, y0); ctx.lineTo(ex, y1); ctx.stroke();
        if(o.split) for(const off of [-.35, .35]){ ctx.globalAlpha = .45 * fade; ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(o.x, y0); ctx.lineTo(o.x + Math.cos(o.ang + off) * len, o.y - 14 + Math.sin(o.ang + off) * len); ctx.stroke(); }
        ctx.restore(); ascFill(ex, ey, 7 + 2 * Math.sin(t * 30), '#fff3c4', .8 * fade); break;
      }
      case 'lens': {
        ascFill(o.x, o.y, o.r, '#ffe08a', .1 * fade); ascRing(o.x, o.y, o.r, '#f0d27a', 2, .8 * fade);
        ctx.save(); ctx.globalAlpha = .8 * fade; ctx.strokeStyle = '#0b0e16'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r * .42, o.r * .26, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); break;
      }
      case 'trap': {
        const armed = !(o.arm > 0), big = o.tt !== 'snare' ? 1.3 : 1;
        ctx.save(); ctx.globalAlpha = (armed ? .95 : .45) * fade; ctx.fillStyle = '#2b2418'; ctx.strokeStyle = armed ? '#e1ecb0' : '#8a9a5b'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(o.x, o.y, 8 * big, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const n = o.tt === 'snare' ? 8 : 6; ctx.fillStyle = armed ? '#e1ecb0' : '#8a9a5b';
        for(let i = 0; i < n; i++){ const a = i * Math.PI * 2 / n + (o.tt === 'snare' ? 0 : Math.PI / n); ctx.beginPath(); ctx.moveTo(o.x + Math.cos(a) * 8 * big, o.y + Math.sin(a) * 8 * big); ctx.lineTo(o.x + Math.cos(a - .22) * 4 * big, o.y + Math.sin(a - .22) * 4 * big); ctx.lineTo(o.x + Math.cos(a + .22) * 4 * big, o.y + Math.sin(a + .22) * 4 * big); ctx.closePath(); ctx.fill(); }
        ctx.restore();
        if(armed) ascRing(o.x, o.y, o.tr, '#e1ecb0', 1, .25 + .1 * Math.sin(t * 5)); break;
      }
      case 'stomp': ascRing(o.x, o.y, o.r * (.85 + .08 * Math.sin(t * 8)), '#9ad0a8', 3, .6 * fade); break;
      case 'moss': case 'marsh': {
        const marsh = k === 'marsh';
        ascFill(o.x, o.y, o.r, marsh ? '#3e8a6a' : '#5aa070', .16 * fade); ascRing(o.x, o.y, o.r, '#a8e0b8', marsh ? 3 : 2, .7 * fade);
        ctx.save(); ctx.globalAlpha = .8 * fade; ctx.strokeStyle = '#2a5a3c'; ctx.lineWidth = 2;
        for(let i = 0; i < (marsh ? 9 : 5); i++){ const a = i * 2.4 + o.id, d = o.r * (.25 + ((i * 37) % 60) / 100), x = o.x + Math.cos(a) * d, y = o.y + Math.sin(a) * d * .8, sway = Math.sin(t * 2 + i) * 2;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sway, y - 9); ctx.stroke(); ctx.fillStyle = '#c8e8a0'; ctx.fillRect(x + sway - 1, y - 12, 2, 4); }
        ctx.restore(); break;
      }
      case 'mud': {
        ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = .55 * fade; ctx.strokeStyle = '#3a2c1a'; ctx.lineWidth = o.w * 2; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.bx, o.by); ctx.stroke();
        ctx.globalAlpha = .6 * fade; ctx.strokeStyle = '#7a5e36'; ctx.lineWidth = o.w * 1.1; ctx.stroke(); ctx.restore(); break;
      }
      case 'royal': {
        ascRing(o.x, o.y, o.r, '#ffd6e3', 3, .6 * fade);
        for(let i = 0; i < 4; i++){ const a = i * Math.PI / 2 + t * .5; siText(QUI_SUITS[i], o.x + Math.cos(a) * o.r * .8 - 6, o.y + Math.sin(a) * o.r * .8 + 5, i < o.step ? SI_SUIT_COL[i] : '#8a7a82', 16); }
        break;
      }
    }
  }
  ctx.globalAlpha = 1;
  for(const h of heroes){
    if(!sietCandidate(h) || !h.alive) continue;
    const q = h.siCue, s = h.siState;
    if(q && q.until > runElapsedMs){
      const a = Math.min(1, (q.until - runElapsedMs) / 300);
      if(q.cards) for(const c of q.cards){ ascRing(c.x, c.y, c.r, SI_SUIT_COL[c.suit], 2, a * .7); siText(QUI_SUITS[c.suit], c.x - 8, c.y + 7, SI_SUIT_COL[c.suit], 22); }
      else if(q.r) ascRing(q.x === undefined ? h.x : h.x, h.y, q.r * (q.ult ? 1 : 1.0 - .15 * a), h.cls.glow, q.ult ? 3 : 2, a * .85);
    }
    if(!s) continue;
    // Marcadores de recurso: forma + número (legible sin color).
    let label = '';
    const t0 = runElapsedMs;
    if(h.classKey === 'ostrel' && s.focus > 0 && s.focusUntil > t0) label = '☼' + Math.round(s.focus * 100) + '%';
    else if(h.classKey === 'grelk') label = '▲' + sietOwned(h, 'trap').length;
    else if(h.classKey === 'ilsa') label = '⚔' + (s.riposte || 0) + (s.parryUntil > t0 || s.autoUntil > t0 ? ' ◈' : '');
    else if(h.classKey === 'vorn') label = s.beastUntil > t0 ? '◐ BESTIA' : (s.form ? '≋ TORMENTA' : '▣ PIEDRA');
    else if(h.classKey === 'nerith') label = '❦' + portadorObjects.filter(o => o.si && o.owner === h && o.life > 0).length;
    else if(h.classKey === 'quillon' && s.deck){ label = [0, 1, 2].map(i => QUI_SUITS[quiPeek(h, i)]).join('') + (s.doubleNext ? '×2' : ''); }
    else if(h.classKey === 'kora') label = '»' + Math.round(s.mom || 0);
    if(label) siText(label, h.x - 22, h.y - 58, h.cls.glow, 12);
  }
  ctx.restore();
};
// Adorno propio sobre el cuerpo (nunca dentro del Art Gate, que mide solo el cuerpo): órbitas pequeñas.
const siOriginalDraw = drawPortador;
drawPortador = function(h, scale, alpha){
  const out = siOriginalDraw(h, scale, alpha);
  if(!sietCandidate(h) || !h.alive || (typeof window !== 'undefined' && window.ART_GATE_NO_VFX)) return out;
  const t = animNow / 1000, s = h.siState || {};
  ctx.save(); ctx.globalAlpha = alpha * .85;
  if(h.classKey === 'ostrel'){ ctx.strokeStyle = '#f0d27a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(h.x, h.y - 40, 15, 5, t * .8, 0, Math.PI * 2); ctx.stroke(); }
  if(h.classKey === 'quillon' && s.deck){ for(let i = 0; i < 3; i++){ const a = t * 1.6 + i * 2.094; siText(QUI_SUITS[quiPeek(h, i)], h.x + Math.cos(a) * 18 - 4, h.y - 36 + Math.sin(a) * 6, SI_SUIT_COL[quiPeek(h, i)], 10); } }
  if(h.classKey === 'vorn'){ ctx.strokeStyle = s.form ? '#9ad8ff' : '#b8b8b0'; ctx.lineWidth = 1.5; ctx.setLineDash(s.form ? [3, 3] : []); ctx.beginPath(); ctx.ellipse(h.x, h.y - 4, 20, 8, 0, 0, Math.PI * 2); ctx.stroke(); }
  if(h.classKey === 'kora' && (s.mom || 0) > 20){ ctx.strokeStyle = '#ffb070'; ctx.lineWidth = 1.5; for(let i = 0; i < Math.min(3, Math.floor(s.mom / 30)); i++){ ctx.beginPath(); ctx.moveTo(h.x - 16 - i * 5, h.y - 24 + i * 6); ctx.lineTo(h.x - 26 - i * 5, h.y - 24 + i * 6); ctx.stroke(); } }
  ctx.restore();
  return out;
};
