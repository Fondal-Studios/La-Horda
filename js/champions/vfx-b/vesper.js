'use strict';
/* Vesper, la Costurera de Sombras — agujas, hilo y puntadas violeta. Antes: calavera y salpicaduras de 'dark' (fxSoulReapBurst).
   Agujas de penumbra (cono) · Costura de fuga (salto + costura que pulsa) · Deshilachar (corte circular) · La última puntada (4 cortes). Solo visual. */
{
  const VS = ['#1a0f24', '#5b3770', '#aa75bd', '#e0b6f0', '#ffffff'];
  kvbDefMotif('vs_needle', 12, 2, kvbBmp(['pppnnnnnnnnw', '...ddddddd..'], {p: '#aa75bd', n: '#e9e4f2', d: '#8c8aa6', w: '#ffffff'}));
  kvbDefMotif('vs_stitch', 7, 7, kvbBmp(['p.....p', '.p...p.', '..p.p..', '...w...', '..p.p..', '.p...p.', 'p.....p'], {p: '#e0b6f0', w: '#ffffff'}));
  kvbDefMotif('vs_scissors', 9, 9, (g, p) => { kvbLine(g, p + 1, p + 1, p + 7, p + 7, '#e9e4f2', 1.4); kvbLine(g, p + 7, p + 1, p + 1, p + 7, '#cfc8e0', 1.4); kvbDisc(g, p + 2, p + 7, 1.5, '#aa75bd'); kvbDisc(g, p + 6.5, p + 7, 1.5, '#aa75bd'); });
  kvbDefMotif('vs_thread', 9, 4, kvbBmp(['..ppp....', '.p...pp..', 'p.....p.p', '.......pp'], {p: '#e0b6f0'}));

  const threadStreaks = (lg, c, R, front, q, half, pal) => {
    for(let k = -2; k <= 2; k++){ const a = k * half / 2.5, L = front * .92; let px = c, py = c;
      lg.beginPath(); lg.moveTo(c, c);
      for(let s = 1; s <= 8; s++){ const u = s / 8, wob = Math.sin(u * 9 + k) * 2.2 * u, x = c + Math.cos(a) * L * u - Math.sin(a) * wob, y = c + Math.sin(a) * L * u + Math.cos(a) * wob; lg.lineTo(x, y); px = x; py = y; }
      lg.strokeStyle = pal[3]; lg.lineWidth = 1.4; lg.stroke();
      kvbLine(lg, px - 2, py - 2, px + 2, py + 2, pal[4], 1.2); kvbLine(lg, px + 2, py - 2, px - 2, py + 2, pal[4], 1.2); }
  };
  kvbDefDecal('vs_fan', 10, kvbSectorPaint(VS, {fillCol: '#5b3770', streaks: threadStreaks}));
  const cutDetails = n => (lg, c, R, rad, pal, q, P) => {
    for(let i = 0; i < n; i++){ const a = i * 6.2832 / n, x0 = c + Math.cos(a) * rad * .94, y0 = c + Math.sin(a) * rad * .94, k = q < .42 ? kvbEase(q / .42) : 1, x1 = c + Math.cos(a) * rad * (.94 - .7 * k), y1 = c + Math.sin(a) * rad * (.94 - .7 * k);
      kvbLine(lg, x0, y0, x1, y1, pal[3], 1.4); kvbLine(lg, x0 - 2, y0 - 2, x0 + 2, y0 + 2, pal[4], 1.2); kvbLine(lg, x0 + 2, y0 - 2, x0 - 2, y0 + 2, pal[4], 1.2); }
    kvbCircle(lg, c, c, rad * .6, pal[3], 1);
  };
  kvbDefDecal('vs_unpick', 10, kvbRingPaint(VS, {fillCol: '#5b3770', details: cutDetails(10), flash: '#e0b6f0', dash: [4, 3]}));
  kvbDefDecal('vs_cut', 10, kvbRingPaint(VS, {fillCol: '#5b3770', details: cutDetails(14), flash: '#e0b6f0', fill: .5, rimThick: 4}));
  kvbDefDecal('vs_stitch_idle', 12, kvbIdlePaint(VS, {fill: .13, fillCol: '#5b3770', dash: [3, 3], details: (lg, c, R, rad, pal, q) => { kvbCircle(lg, c, c, R * .62, pal[2], 1); for(let i = 0; i < 8; i++){ const a = q * 6.2832 + i * .7854, x = c + Math.cos(a) * R * .8, y = c + Math.sin(a) * R * .8; kvbLine(lg, x - 2, y - 2, x + 2, y + 2, pal[3], 1.2); kvbLine(lg, x + 2, y - 2, x - 2, y + 2, pal[3], 1.2); } }}));
  kvbDefBeam('vs_seam', 8, 14, 14, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, half = Math.max(1, Math.round(m * (q < .2 ? .3 + 3 * q : .85 - .5 * post)));
    g.fillStyle = VS[0]; g.fillRect(0, m - half - 1, W, half * 2 + 2); g.fillStyle = VS[1]; g.fillRect(0, m - half, W, half * 2);
    g.fillStyle = VS[3]; for(let x = 0; x < W; x += 7) g.fillRect(x, m - 1, 4, 2);
    g.fillStyle = VS[2]; for(let x = 3; x < W; x += 7){ g.fillRect(x, m - half, 1, 2); g.fillRect(x + 1, m + half - 2, 1, 2); }
  });

  KVB_FX['vesper.needles'] = (x, y, range, ang, half) => {
    kvbSectorFx('vs_fan', x, y, range, ang, 620, {layer: 'g'});
    kvbEmit('vs_needle', 12, x, y, {ang, spread: (half || .85) * 1.8, v0: range * .8, v1: range * 1.5, l0: 260, l1: 420, scale: 1.3, faceVel: true, drag: .5, shrink: true});
    kvbEmit('vs_stitch', 4, x + Math.cos(ang) * range * .8, y + Math.sin(ang) * range * .8, {spread: 1.2, ang, v0: 5, v1: 25, l0: 380, l1: 560, scale: 1.2, jy: 24, jx: 20});
  };
  KVB_FX['vesper.seam'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('vs_seam', x, y, ex, ey, Math.max(14, r * 1.2), 520, {layer: 'g'});
    kvbEmit('vs_thread', 5, x, y, {v0: 20, v1: 60, up: 20, l0: 360, l1: 520, scale: 1.3, spin: 4});
    kvbEmit('vs_stitch', 3, ex, ey, {v0: 10, v1: 35, l0: 360, l1: 520, scale: 1.2});
  };
  KVB_FX['vesper.unpick'] = (x, y, r) => {
    kvbDecal('vs_unpick', x, y, r, 760, {layer: 'g'});
    kvbEmit('vs_scissors', 3, x, y, {ring: r * .5, v0: 10, v1: 40, up: 30, l0: 380, l1: 560, scale: 1.4, spin: 5});
    kvbEmit('vs_thread', 8, x, y, {ring: r * .8, v0: 30, v1: 80, l0: 360, l1: 560, scale: 1.2, spin: 6, flat: .7});
  };
  KVB_FX['vesper.last_stitch'] = (x, y, r) => { kvbEmit('vs_needle', 8, x, y, {ring: r * .3, v0: 80, v1: 200, l0: 280, l1: 460, scale: 1.3, faceVel: true, drag: .8, flat: .7, shrink: true}); };
  kvbBind('ex:needles', 'vesper.needles'); kvbBind('ex:seam', 'vesper.seam'); kvbBind('ex:unpick', 'vesper.unpick'); kvbBind('ex:last_stitch', 'vesper.last_stitch');

  // costura de fuga: los 4 pulsos recorren el trazo (zona real: segmento de ancho 2r)
  kvbSkin('ex_line', {R: o => o.r, hideBase: true,
    pulse: o => { const n = 4 - o.left; kvbDecal('vs_cut', o.x + (o.bx - o.x) * (n / 4), o.y + (o.by - o.y) * (n / 4), Math.max(18, o.r * 1.2), 420, {layer: 'g', alpha: .8}); kvbBeam('vs_seam', o.x, o.y, o.bx, o.by, Math.max(14, o.r * 1.4), 380, {layer: 'g', alpha: .9}); },
    draw: (o, t, layer) => { const len = Math.hypot(o.bx - o.x, o.by - o.y); if(len < 4) return; const a = Math.atan2(o.by - o.y, o.bx - o.x), h = Math.max(7, o.r); ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(a); ctx.globalAlpha = .55 * Math.min(1, o.life / 400);
      ctx.fillStyle = VS[1]; ctx.fillRect(0, -h, len, h * 2); ctx.globalAlpha *= 1.6; ctx.fillStyle = VS[3]; for(let x = 0; x < len; x += 14) ctx.fillRect(x, -1, 8, 2); ctx.fillStyle = VS[0]; ctx.fillRect(0, -h - 1, len, 2); ctx.fillRect(0, h - 1, len, 2); ctx.restore(); }}, 'vesper');
  // La última puntada: bordado circular fijo + un corte por pulso (el último, mayor)
  kvbSkin('ex_stitch', {R: o => o.r, loop: 'vs_stitch_idle', period: 2400,
    pulse: o => { kvbDecal(o.left === 0 ? 'vs_cut' : 'vs_unpick', o.x, o.y, o.r, 760, {layer: 'g'}); if(o.left === 0) kvbEmit('vs_needle', 14, o.x, o.y, {ring: o.r * .4, v0: 90, v1: 220, l0: 300, l1: 520, scale: 1.4, faceVel: true, drag: .8, flat: .7, shrink: true}); } }, 'vesper');
}
