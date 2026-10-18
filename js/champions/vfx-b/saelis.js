'use strict';
/* Saelis, la Heraldo del Plumaje — plumas blancas, azul cielo y oro. Antes: un remolino de AGUA azul (fxWhirl) para todo, incluida la definitiva.
   Abanico de Plumas (5 carriles) · Ráfaga Ascendente (ráfaga con plumas) · Llamado del Plumaje (vuelo) · Cielo de Plumas (nube con lluvia de plumas).
   Las plumas clavadas, las bendiciones y los avisos de ráfaga/llamado conservan su dibujo propio. Solo visual. */
{
  const SA = ['#1d3250', '#5a8cc0', '#9cd0f0', '#fff4cc', '#ffffff'];
  kvbDefMotif('sa_feather', 9, 9, kvbBmp(['.....wwww', '...wwwwbw', '..wwwwbb.', '.wwwwbb..', 'wwwwbb...', 'wwwbb....', 'wwbb.....', 'wbb......', 'qb.......'], {w: '#fffdf2', b: '#9cd0f0', q: '#e0b030'}));
  kvbDefMotif('sa_feather_g', 9, 9, kvbBmp(['.....gggg', '...ggggyg', '..ggggyy.', '.ggggyy..', 'ggggyy...', 'gggyy....', 'ggyy.....', 'gyy......', 'qy.......'], {g: '#fff0a0', y: '#e0b030', q: '#8a6418'}));
  kvbDefMotif('sa_puff', 9, 7, (g, p) => { kvbDisc(g, p + 4.5, p + 3.5, 3, '#eaf6ff'); kvbDisc(g, p + 2.5, p + 4, 2.2, '#ffffff'); kvbDisc(g, p + 6.5, p + 4, 2.2, '#ffffff'); }, '#5a8cc0');
  kvbDefBeam('sa_lane', 8, 18, 14, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, half = Math.max(1, Math.round(m * (q < .2 ? .3 + 3 * q : .7 - .45 * post)));
    g.fillStyle = SA[1]; g.fillRect(0, m - half - 1, W, half * 2 + 2); g.fillStyle = SA[3]; g.fillRect(0, m - half, W, half * 2); g.fillStyle = SA[4]; g.fillRect(0, m - Math.max(1, half - 2), W, Math.max(1, (half - 2) * 2));
    g.fillStyle = SA[2]; for(let x = (f * 3) % 6; x < W; x += 6){ g.fillRect(x, m - half, 1, 2); g.fillRect(x + 2, m + half - 2, 1, 2); }
  });
  const windDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 4; i++){ const a = i * 1.5708 + q * 2; kvbArcLine(lg, c, c, rad * (.45 + .1 * (i & 1)), a, a + 1.1, pal[4], 2); kvbArcLine(lg, c, c, rad * (.7 + .08 * (i & 1)), a + .8, a + 1.8, pal[3], 1.6); } };
  kvbDefDecal('sa_gust', 10, kvbRingPaint(SA, {fillCol: '#5a8cc0', fill: .3, details: windDetails, flash: '#ffffff', rimThick: 3}));
  const cloudDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 9; i++){ const a = i * .698, x = c + Math.cos(a) * rad * .8, y = c + Math.sin(a) * rad * .8; kvbDisc(lg, x, y, 4.2, pal[3]); kvbDisc(lg, x - 1, y - 1, 2.4, pal[4]); } };
  kvbDefDecal('sa_cloud', 10, kvbRingPaint(SA, {fillCol: '#5a8cc0', fill: .3, details: cloudDetails, flash: '#fff4cc', rimThick: 3}));

  KVB_FX['saelis.feather_fan'] = (x, y, range, ang, half) => { // 5 carriles de pluma (±.42 rad); cada uno daña a lo largo de su línea
    for(const off of [-.42, -.21, 0, .21, .42]){ const a = ang + off, tx = x + Math.cos(a) * range, ty = y + Math.sin(a) * range;
      kvbBeam('sa_lane', x, y, tx, ty, 44, 560, {layer: 'g', alpha: .28}); kvbBeam('sa_lane', x, y, tx, ty, 12, 520, {layer: 't'});
      kvbPart('sa_feather', x, y, {rot: a - .785, vx: Math.cos(a) * range * 2.2, vy: Math.sin(a) * range * 2.2, dur: 440, scale: 1.7, layer: 't', fadeAt: .9, drag: 1.2}); }
    kvbEmit('sa_feather_g', 5, x, y, {ang, spread: 1, v0: 40, v1: 120, l0: 360, l1: 600, scale: 1.2, grav: 40, spin: 4});
  };
  KVB_FX['saelis.updraft'] = (x, y, r) => {
    kvbDecal('sa_gust', x, y, r, 800, {layer: 'g'});
    kvbEmit('sa_feather', 8, x, y, {ring: r * .5, v0: 40, v1: 130, up: 90, grav: 50, l0: 520, l1: 880, scale: 1.5, spin: 5, flat: .7}); kvbEmit('sa_puff', 4, x, y, {ring: r * .6, v0: 20, v1: 60, up: 20, l0: 420, l1: 700, scale: 1.5, flat: .7});
  };
  KVB_FX['saelis.recall'] = (x, y, r) => { kvbDecal('sa_gust', x, y, 38, 600, {layer: 'g'}); kvbEmit('sa_feather_g', 6, x, y, {ring: 18, v0: 20, v1: 70, up: 70, grav: 40, l0: 420, l1: 700, scale: 1.3, spin: 5, flat: .7}); };
  KVB_FX['saelis.feather_sky'] = (x, y, r) => {
    kvbDecal('sa_cloud', x, y, r, 1000, {layer: 'g'});
    kvbEmit('sa_puff', 8, x, y - 30, {ring: r * .6, v0: 8, v1: 30, up: 20, l0: 700, l1: 1100, scale: 1.8, flat: .6}); kvbEmit('sa_feather', 10, x, y - 60, {ring: r * .6, v0: 5, v1: 25, grav: 80, l0: 700, l1: 1100, scale: 1.4, spin: 4, flat: .6});
  };
  kvbBind('asc:feather_fan', 'saelis.feather_fan'); kvbBind('asc:updraft', 'saelis.updraft', true); kvbBind('asc:recall', 'saelis.recall', true); kvbBind('asc:feather_sky', 'saelis.feather_sky');
}
