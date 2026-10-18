'use strict';
/* Vhal, el Astrónomo Caído — estrellas, polvo estelar y gravedad. Antes: remolino de agua violeta ('vortex') y runas heladas.
   Estrella Errante (cometa en línea) · Pozo Gravitatorio (espiral que atrae) · Órbita (arco de estrellas) · Colapso (singularidad). Solo visual:
   el pozo y el colapso persistentes conservan su dibujo propio de Ascensión. */
{
  const VH = ['#0e1033', '#3a44b0', '#6f7cf2', '#d9e1ff', '#ffffff'];
  kvbDefMotif('vh_star4', 9, 9, kvbBmp(['....w....', '....w....', '...wcw...', '...wcw...', 'wwwcCcwww', '...wcw...', '...wcw...', '....w....', '....w....'], {w: '#d9e1ff', c: '#ffffff', C: '#ffffff'}));
  kvbDefMotif('vh_star5', 9, 9, (g, p) => kvbStar(g, p + 4.5, p + 4.7, 4.4, 5, '#ffe58a', .45));
  kvbDefMotif('vh_orb', 5, 5, kvbBmp(['.bbb.', 'bBwBb', 'bwwwb', 'bBwBb', '.bbb.'], {b: '#3a44b0', B: '#6f7cf2', w: '#d9e1ff'}));
  kvbDefMotif('vh_dust', 3, 3, kvbBmp(['.w.', 'wcw', '.w.'], {w: '#d9e1ff', c: '#ffffff'}));
  kvbDefBeam('vh_bolt', 8, 20, 18, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, half = Math.max(1, Math.round(m * (q < .18 ? .3 + 3.8 * q : .72 - .5 * post)));
    g.fillStyle = VH[0]; g.fillRect(0, m - half - 1, W, half * 2 + 2); g.fillStyle = VH[2]; g.fillRect(0, m - half, W, half * 2); g.fillStyle = VH[3]; g.fillRect(0, m - Math.max(1, half - 2), W, Math.max(1, (half - 2) * 2)); g.fillStyle = VH[4]; g.fillRect(0, m - 1, W, 2);
    g.fillStyle = '#ffe58a'; for(let x = (f * 5) % 10; x < W; x += 10) g.fillRect(x, m - half - 1 - (x & 1), 2, 2);
  });
  const novaDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 8; i++){ const a = i * .7854 + .39, L = rad * (i & 1 ? .6 : .95), nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * rad * .15, c + Math.sin(a) * rad * .15], [c + Math.cos(a) * L + nx * 2, c + Math.sin(a) * L + ny * 2], [c + Math.cos(a) * L - nx * 2, c + Math.sin(a) * L - ny * 2]], i & 1 ? pal[3] : '#ffe58a'); } };
  kvbDefDecal('vh_nova', 10, kvbRingPaint(VH, {fillCol: '#3a44b0', core: '#6f7cf2', fill: .42, details: novaDetails, flash: '#d9e1ff'}));
  const spiral = (lg, c, R, rad, pal, q) => { for(let arm = 0; arm < 3; arm++){ lg.beginPath(); for(let s = 0; s <= 24; s++){ const u = s / 24, a = arm * 2.0944 + u * 5 - q * 4, rr = rad * (.12 + .82 * u); const x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr; if(!s) lg.moveTo(x, y); else lg.lineTo(x, y); } lg.strokeStyle = pal[3]; lg.lineWidth = 2; lg.stroke(); }
    kvbDisc(lg, c, c, rad * .14, '#05061a'); kvbCircle(lg, c, c, rad * .16, pal[4], 1.2); };
  kvbDefDecal('vh_well', 10, kvbRingPaint(VH, {fillCol: '#3a44b0', core: '#0e1033', fill: .42, details: spiral, flash: '#6f7cf2', rimThick: 3}));
  const orbitDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 8; i++){ const a = Math.PI + i * Math.PI / 8 * (i / 7 + .5), x = c + Math.cos(a) * rad * .86, y = c + Math.sin(a) * rad * .86; kvbStar(lg, x, y, 3.4, 4, i % 3 ? pal[3] : '#ffe58a', .4); } };
  kvbDefDecal('vh_ring', 10, kvbRingPaint(VH, {fillCol: '#3a44b0', fill: .26, details: orbitDetails, flash: '#d9e1ff', rimThick: 2}));
  kvbDefDecal('vh_collapse', 10, kvbRingPaint(VH, {fillCol: '#0e1033', core: '#3a44b0', fill: .5, details: (lg, c, R, rad, pal, q) => { spiral(lg, c, R, rad, pal, q); novaDetails(lg, c, R, rad * .8, pal, q); }, flash: '#ffffff', rimThick: 4}));

  KVB_FX['vhal.star_bolt'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('vh_bolt', x, y, ex, ey, Math.max(20, r * 1.5), 520, {layer: 't'});
    kvbPart('vh_star5', x, y, {vx: Math.cos(ang) * len * 2.4, vy: Math.sin(ang) * len * 2.4, spin: 9, dur: 400, scale: 2.2, layer: 't', fadeAt: .9});
    kvbDecal('vh_nova', ex, ey, Math.max(36, r * 1.6), 560, {layer: 'g'});
    kvbEmit('vh_dust', 8, x, y, {ang, spread: .8, v0: 20, v1: 80, l0: 300, l1: 520, scale: 1.4}); kvbEmit('vh_star4', 4, ex, ey, {v0: 30, v1: 100, l0: 300, l1: 520, scale: 1.2});
  };
  KVB_FX['vhal.well'] = (x, y, r) => {
    kvbDecal('vh_well', x, y, r, 840, {layer: 'g'});
    for(let i = 0; i < kvbBudget(10); i++){ const a = kvbRR(0, 6.2832), d = r * kvbRR(.6, 1), sp = d / .55; kvbPart('vh_dust', x + Math.cos(a) * d, y + Math.sin(a) * d, {vx: -Math.cos(a) * sp, vy: -Math.sin(a) * sp, dur: 540, scale: 1.4, layer: 't', shrink: true}); }
  };
  KVB_FX['vhal.orbit'] = (x, y, r, ang, a, b) => { // órbita: radio = distancia a ella (60..160), media vuelta alrededor del punto
    const rad = a === undefined ? 80 : Math.max(60, Math.min(160, Math.hypot(a - x, b - y)));
    kvbDecal('vh_ring', x, y, rad, 820, {layer: 'g'}); kvbEmit('vh_star4', 6, x, y, {ring: rad * .8, v0: 5, v1: 30, l0: 480, l1: 800, scale: 1.2});
  };
  KVB_FX['vhal.collapse'] = (x, y, r) => {
    kvbDecal('vh_collapse', x, y, Math.min(r, 120), 900, {layer: 'g', alpha: .9}); // el crecimiento y el estallido final de radio real los dibuja el objeto
    for(let i = 0; i < kvbBudget(12); i++){ const a = kvbRR(0, 6.2832), d = r * kvbRR(.5, 1), sp = d / .7; kvbPart('vh_star4', x + Math.cos(a) * d, y + Math.sin(a) * d, {vx: -Math.cos(a) * sp, vy: -Math.sin(a) * sp, dur: 700, scale: 1.5, layer: 't', shrink: true, spin: 4}); }
  };
  kvbBind('asc:star_bolt', 'vhal.star_bolt'); kvbBind('asc:well', 'vhal.well'); kvbBind('asc:orbit', 'vhal.orbit'); kvbBind('asc:collapse', 'vhal.collapse');
}
