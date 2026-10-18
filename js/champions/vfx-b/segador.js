'use strict';
/* Segador, el Olvidado — filo carmesí, sangre y almas. Antes: la Armadura de la Furia y el Último Aliento solo mostraban un texto y un anillo; el tajo, un arco blanco.
   Tajo (guadaña que barre el abanico real) · Armadura de la Furia (aro de pinchos mientras dura) · Último Aliento (latido que cura) · Segador de Almas (aura de furia + almas, mientras dure). Solo visual. */
{
  const SG = ['#2a0a0e', '#7a1620', '#c62828', '#ff8a7a', '#ffe9d6'];
  kvbDefMotif('sg_drop', 4, 6, kvbBmp(['.r..', 'rhr.', 'rrrr', 'rrrr', '.rr.'], {r: '#c62828', h: '#ff8a7a'}));
  kvbDefMotif('sg_wisp', 6, 9, kvbBmp(['..ww..', '.wWWw.', '.wWWw.', 'wwWWww', '.wWWw.', '.wwWw.', '..wWw.', '...ww.', '....w.'], {w: '#ff8a7a', W: '#ffe9d6'}));
  kvbDefMotif('sg_skull', 9, 9, kvbBmp(['.wwwwwww.', 'wwwwwwwww', 'wkkwwwkkw', 'wkkwwwkkw', 'wwwwkwwww', '.wwwwwww.', '..wkwkw..', '..wwwww..'], {w: '#ffe9d6', k: '#2a0a0e'}));
  kvbDefMotif('sg_ember', 3, 3, kvbBmp(['.y.', 'yoy', '.y.'], {y: '#ffe9d6', o: '#ff8a7a'}));
  kvbDefMotif('sg_heart', 9, 8, kvbBmp(['.rr...rr.', 'rrhr.rrrr', 'rhrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'], {r: '#c62828', h: '#ff8a7a'}));
  const slashStreaks = (lg, c, R, front, q, half, pal) => {
    const sweep = Math.min(1, q / .4), a0 = -half + 2 * half * sweep;
    for(const [u, w] of [[.55, 5], [.8, 7], [1, 4]]){ const rr = front * u; for(const [col, th] of [[pal[0], w + 2], [pal[2], w], [pal[3], Math.max(1, w - 3)], [pal[4], 1]]){ lg.beginPath(); lg.arc(c - rr * .25, c, rr, -half * .95, Math.min(half * .95, a0)); lg.strokeStyle = col; lg.lineWidth = th; lg.lineCap = 'butt'; lg.stroke(); } }
  };
  kvbDefDecal('sg_slash', 10, kvbSectorPaint(SG, {half: .675, fillCol: '#7a1620', streaks: slashStreaks}));
  kvbDefDecal('sg_roar', 9, kvbRingPaint(SG, {fillCol: '#7a1620', fill: .38, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 10; i++){ const a = i * .628, L = rad * .95, nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * rad * .5, c + Math.sin(a) * rad * .5], [c + Math.cos(a) * L + nx * 2.5, c + Math.sin(a) * L + ny * 2.5], [c + Math.cos(a) * L - nx * 2.5, c + Math.sin(a) * L - ny * 2.5]], pal[3]); } }, flash: '#ff8a7a', rimThick: 3}));
  kvbDefDecal('sg_flare', 9, kvbRingPaint(SG, {fillCol: '#7a1620', fill: .34, details: (lg, c, R, rad, pal, q) => { kvbCircle(lg, c, c, rad * .5, pal[3], 1.4); }, flash: '#ff8a7a', rimThick: 2}));
  kvbDefDecal('sg_berserk', 10, kvbRingPaint(SG, {fillCol: '#7a1620', core: '#c62828', fill: .44, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 14; i++){ const a = i * .4488, L = rad * (i & 1 ? .6 : .96), nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * rad * .2, c + Math.sin(a) * rad * .2], [c + Math.cos(a) * L + nx * 2.8, c + Math.sin(a) * L + ny * 2.8], [c + Math.cos(a) * L - nx * 2.8, c + Math.sin(a) * L - ny * 2.8]], i & 1 ? pal[3] : pal[4]); } kvbDisc(lg, c, c, rad * .16, pal[0]); }, flash: '#ffe9d6', rimThick: 4}));
  kvbDefDecal('sg_armor_idle', 12, kvbIdlePaint(SG, {fill: .14, fillCol: '#7a1620', dash: [3, 3], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 10; i++){ const a = i * .628 + q * .8, x0 = c + Math.cos(a) * R * .86, y0 = c + Math.sin(a) * R * .86; kvbPoly(lg, [[x0 + Math.cos(a + 1.57) * 2, y0 + Math.sin(a + 1.57) * 2], [x0 + Math.cos(a) * 6, y0 + Math.sin(a) * 6], [x0 - Math.cos(a + 1.57) * 2, y0 - Math.sin(a + 1.57) * 2]], pal[3]); } }}));
  kvbDefDecal('sg_berserk_idle', 12, kvbIdlePaint(SG, {fill: .2, fillCol: '#7a1620', dash: [5, 3], details: (lg, c, R, rad, pal, q) => { const k = .5 + .5 * Math.sin(q * 6.2832 * 2); for(let i = 0; i < 12; i++){ const a = i * .5236 - q * 1.2, L = R * (.72 + .22 * ((i & 1) ? k : 1 - k)), nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * R * .55, c + Math.sin(a) * R * .55], [c + Math.cos(a) * L + nx * 2, c + Math.sin(a) * L + ny * 2], [c + Math.cos(a) * L - nx * 2, c + Math.sin(a) * L - ny * 2]], i & 1 ? pal[3] : pal[2]); } }}));

  KVB_FX['segador.slash'] = (x, y, range, ang, half) => { // abanico real: alcance sk.range·área (−30 % con la Armadura nivel 5+), semiángulo arc/2
    kvbSectorFx('sg_slash', x, y, range, ang, 560, {layer: 'g'});
    kvbEmit('sg_drop', 9, x, y, {ang, spread: (half || .675) * 1.8, v0: range * .5, v1: range * 1.3, up: 20, grav: 320, l0: 340, l1: 560, scale: 1.3, shrink: true});
  };
  KVB_FX['segador.armor'] = (x, y, r) => { kvbDecal('sg_roar', x, y, r, 720, {layer: 'g'}); kvbEmit('sg_ember', 8, x, y, {ring: 18, v0: 10, v1: 40, up: 60, l0: 440, l1: 760, scale: 1.2, flat: .6}); };
  KVB_FX['segador.last'] = (x, y, r) => { kvbDecal('sg_flare', x, y, r, 700, {layer: 'g'}); kvbPart('sg_heart', x, y - 50, {dur: 800, scale: 1.9, layer: 't', vy: -22, fadeAt: .5}); kvbEmit('sg_ember', 8, x, y, {ring: 14, v0: 10, v1: 40, up: 70, l0: 420, l1: 720, scale: 1.2, flat: .6}); };
  KVB_FX['segador.ult'] = (x, y, r) => { kvbDecal('sg_berserk', x, y, r, 1000, {layer: 'g'}); kvbPart('sg_skull', x, y - 62, {dur: 1000, scale: 2.6, layer: 't', vy: -16, fadeAt: .5}); kvbEmit('sg_wisp', 10, x, y, {ring: r * .5, v0: 10, v1: 40, up: 90, l0: 600, l1: 1000, scale: 1.4, flat: .6}); };
  kvbClassic('segador', 'cone_slash', (c, sk, u, sc) => { const furyArea = c.furyArmorTimer > 0 ? (c.furyAreaMult || 1) : 1; return ['segador.slash', c.x, c.y, sk.range * sc.AREA * furyArea, Math.atan2(c.fy, c.fx), sk.arc / 2, 0]; });
  kvbClassic('segador', 'fury_armor', (c, sk) => ['segador.armor', c.x, c.y, 46, 0, 0, 0]);
  kvbClassic('segador', 'last_stand_burst', (c, sk) => ['segador.last', c.x, c.y, 40, 0, 0, 0]);
  kvbClassic('segador', 'berserker_ult', (c, sk) => ['segador.ult', c.x, c.y, 100, 0, 0, 0]);
  // estados reales: Armadura de la Furia (furyArmorTimer) y Segador de Almas (berserkTimer)
  kvbOverlay('segador', (h, layer, t) => {
    if(layer !== 'g') return;
    if(h.berserkTimer > 0) kvbLoopDecal('sg_berserk_idle', h.x, h.y + 4, 52, t, 700, {alpha: Math.min(1, h.berserkTimer / 400)});
    else if(h.furyArmorTimer > 0) kvbLoopDecal('sg_armor_idle', h.x, h.y + 4, 36, t, 1400, {alpha: Math.min(1, h.furyArmorTimer / 400) * .95});
  }, (h, dt) => { if(h.berserkTimer > 0 && kvbPulseEvery(h, 'soul', 150, dt)) kvbPart('sg_wisp', h.x + kvbRR(-16, 16), h.y - 4, {vy: -52, dur: 640, scale: 1.2, layer: 't', shrink: true}); });
}
