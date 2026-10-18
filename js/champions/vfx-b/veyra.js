'use strict';
/* Veyra, la Última Herida — tajos carmesí, sangre y latido. Antes: el arco blanco 'fxScytheSlash' (el mismo del Segador) y un escudo celeste.
   Abrir la herida (abanico de tajos) · Paso escarlata (estela de sangre) · Pacto de dolor (sello y vapor de sangre) · La última herida (corte enorme). Solo visual.
   Nota: con el talento "Incisión recta" el corte pasa a ser una línea; la receta dibuja el abanico base. */
{
  const VY = ['#2a0612', '#7a1d38', '#ab3459', '#ff7d8e', '#ffd6dc'];
  kvbDefMotif('vy_drop', 4, 6, kvbBmp(['.r..', 'rhr.', 'rrrr', 'rrrr', '.rr.'], {r: '#ab3459', h: '#ff7d8e'}));
  kvbDefMotif('vy_wisp', 5, 8, kvbBmp(['..r..', '.rhr.', '.rhr.', 'rrhrr', '.rrr.', '.rr..', '..r..', '..r..'], {r: '#ab3459', h: '#ff7d8e'}));
  kvbDefMotif('vy_claw', 9, 9, (g, p) => { for(const [d, col] of [[0, '#ffd6dc'], [-2, '#ff7d8e'], [2, '#ab3459']]){ g.beginPath(); g.arc(p + 1, p + 8 + d * .2, 8 + d * .3, -1.2, -.15); g.strokeStyle = col; g.lineWidth = 1.2; g.stroke(); } });

  const slashStreaks = (lg, c, R, front, q, half, pal) => {
    for(const [u, w] of [[.5, 3], [.72, 4], [.95, 3]]){ const rr = front * u, a0 = -half * .85, a1 = half * .85; for(const [col, th] of [[pal[0], w + 2], [pal[3], w], [pal[4], Math.max(1, w - 2)]]){ lg.beginPath(); lg.arc(c - rr * .35, c, rr * 1.0, a0, a1); lg.strokeStyle = col; lg.lineWidth = th; lg.lineCap = 'butt'; lg.stroke(); } }
    for(let i = 0; i < 6; i++){ const a = (i / 5 - .5) * half * 1.6, x = c + Math.cos(a) * front * .9, y = c + Math.sin(a) * front * .9; kvbDisc(lg, x, y, 1.6, pal[2]); }
  };
  kvbDefDecal('vy_slash', 10, kvbSectorPaint(VY, {fillCol: '#7a1d38', streaks: slashStreaks}));
  const woundDetails = (lg, c, R, rad, pal, q) => {
    const k = kvbEase(Math.min(1, q / .35)), L = rad * .95 * k, pts = []; for(let i = 0; i <= 8; i++){ const u = i / 8 * 2 - 1; pts.push([c + u * L * .85, c + u * L * .5 + (kvbHash(i, 4) - .5) * 7]); }
    for(const [col, th] of [[pal[0], 7], [pal[2], 5], [pal[3], 3], [pal[4], 1.4]]){ lg.beginPath(); lg.moveTo(pts[0][0], pts[0][1]); for(const p of pts) lg.lineTo(p[0], p[1]); lg.strokeStyle = col; lg.lineWidth = th; lg.lineJoin = 'miter'; lg.stroke(); }
    kvbCracks(lg, c, rad * .7, k, 6, pal[2], 1.4, 5);
  };
  kvbDefDecal('vy_wound', 10, kvbRingPaint(VY, {fillCol: '#7a1d38', core: '#ab3459', fill: .4, details: woundDetails, flash: '#ff7d8e', rimThick: 4}));
  kvbDefDecal('vy_pact', 10, kvbRingPaint(VY, {fillCol: '#7a1d38', fill: .34, details: (lg, c, R, rad, pal, q) => { kvbCircle(lg, c, c, rad * .55, pal[3], 1.4); kvbPoly(lg, [[c, c + rad * .32], [c - rad * .3, c - rad * .08], [c - rad * .15, c - rad * .3], [c, c - rad * .14], [c + rad * .15, c - rad * .3], [c + rad * .3, c - rad * .08]], pal[3], pal[4], 1); }, flash: '#ff7d8e'}));
  kvbDefDecal('vy_pact_idle', 12, kvbIdlePaint(VY, {fill: .16, fillCol: '#7a1d38', dash: [4, 3], details: (lg, c, R, rad, pal, q) => { const s = 1 + .12 * Math.sin(q * 6.2832 * 2); kvbCircle(lg, c, c, R * .55 * s, pal[3], 1.4); }}));
  kvbDefBeam('vy_dash', 8, 18, 16, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, half = Math.max(1, Math.round(m * (q < .2 ? .3 + 3 * q : .8 - .5 * post)));
    g.fillStyle = VY[0]; g.fillRect(0, m - half - 1, W, half * 2 + 2); g.fillStyle = VY[2]; g.fillRect(0, m - half, W, half * 2); g.fillStyle = VY[3]; g.fillRect(0, m - Math.max(1, half - 2), W, Math.max(1, (half - 2) * 2));
    g.fillStyle = VY[4]; g.fillRect(0, m - 1, W, 1); g.fillStyle = VY[1]; for(let x = 2; x < W; x += 6) g.fillRect(x, m + half - 1 - ((x >> 1) & 1), 2, 2);
  });

  KVB_FX['veyra.cut'] = (x, y, range, ang, half) => {
    kvbSectorFx('vy_slash', x, y, range, ang, 560, {layer: 'g'});
    kvbEmit('vy_drop', 10, x, y, {ang, spread: (half || .85) * 1.7, v0: range * .5, v1: range * 1.2, up: 20, grav: 300, l0: 340, l1: 560, scale: 1.3, shrink: true});
    kvbPart('vy_claw', x + Math.cos(ang) * range * .55, y + Math.sin(ang) * range * .55, {rot: ang + .2, dur: 380, scale: 2.4, layer: 't', fadeAt: .4});
  };
  KVB_FX['veyra.dash'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('vy_dash', x, y, ex, ey, Math.max(18, r * 1.6), 460, {layer: 'g'});
    kvbEmit('vy_drop', 8, x, y, {ang, spread: 1.4, v0: 30, v1: 110, up: 30, grav: 300, l0: 340, l1: 560, scale: 1.3, shrink: true});
    kvbPart('vy_claw', ex, ey, {rot: ang + .2, dur: 360, scale: 2.2, layer: 't', fadeAt: .4}); kvbDecal('vy_wound', ex, ey, Math.max(28, r * 1.5), 520, {layer: 'g', alpha: .8});
  };
  KVB_FX['veyra.pact'] = (x, y, r) => { kvbDecal('vy_pact', x, y, 46, 760, {layer: 'g'}); kvbEmit('vy_wisp', 7, x, y, {ring: 20, v0: 5, v1: 25, up: 70, l0: 520, l1: 800, scale: 1.3, flat: .6}); };
  KVB_FX['veyra.final'] = (x, y, r) => { kvbDecal('vy_wound', x, y, r, 880, {layer: 'g'}); kvbEmit('vy_drop', 14, x, y, {ring: r * .5, v0: 50, v1: 160, up: 110, grav: 340, l0: 420, l1: 700, scale: 1.4, flat: .6}); kvbEmit('vy_wisp', 6, x, y, {ring: r * .4, v0: 5, v1: 30, up: 90, l0: 560, l1: 900, scale: 1.4, flat: .6}); };
  kvbBindQ5('vey_cut', 'veyra.cut'); kvbBindQ5('vey_dash', 'veyra.dash'); kvbBindQ5('vey_pact', 'veyra.pact'); kvbBindQ5('vey_final', 'veyra.final');
  // Pacto de dolor: mientras dura la velocidad/armadura (temporizador real portSpeedTimer) un sello late bajo sus pies y sube vapor de sangre
  kvbOverlay('veyra', (h, layer, t) => { if(layer === 'g' && h.portSpeedTimer > 0 && h.portSpeedBonus >= .24) kvbLoopDecal('vy_pact_idle', h.x, h.y + 4, 30, t, 800, {alpha: .9}); },
    (h, dt) => { if(h.portSpeedTimer > 0 && h.portSpeedBonus >= .24 && kvbPulseEvery(h, 'wisp', 130, dt)) kvbPart('vy_wisp', h.x + kvbRR(-10, 10), h.y - 4, {vy: -46, dur: 520, scale: 1.1, layer: 't', shrink: true}); });
  kvbBasic('veyra', VY, 'vy_drop');
}
