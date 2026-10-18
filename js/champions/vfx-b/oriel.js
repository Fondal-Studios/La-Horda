'use strict';
/* Oriel, la Portera de las Cicatrices — portales, grietas y pétalos rosa. Antes: remolino azul de agua ('vortex') y calavera ('dark') del motor.
   Abrir Cicatriz (dos portales) · Eco de la Cicatriz (pulso en cada portal) · Paso entre Mundos (salto + grieta) · La Gran Cicatriz (fisura gigante). Solo visual:
   los portales, la cicatriz y la fisura persistentes conservan su dibujo propio de Ascensión. */
{
  const OE = ['#2a0a16', '#8e2a48', '#e05a7a', '#ffd0dc', '#ffffff'];
  kvbDefMotif('oe_petal', 5, 6, kvbBmp(['.pp..', 'pPpp.', 'pPPpp', '.pPp.', '..p..'], {p: '#e05a7a', P: '#ffd0dc'}));
  kvbDefMotif('oe_shard', 6, 8, kvbBmp(['..k...', '.kpk..', '.kpp..', 'kppp..', 'kpppk.', '.kpk..', '..k...'], {k: '#2a0a16', p: '#8e2a48'}));
  kvbDefMotif('oe_glow', 5, 5, kvbBmp(['..w..', '.wWw.', 'wWWWw', '.wWw.', '..w..'], {w: '#ffd0dc', W: '#ffffff'}));
  const rift = (lg, c, R, rad, pal, q) => { const k = kvbEase(Math.min(1, q / .35)), L = rad * .92 * k, pts = []; for(let i = 0; i <= 10; i++){ const u = i / 10 * 2 - 1; pts.push([c + u * L, c + Math.sin(u * 5.5) * rad * .12 + (kvbHash(i, 8) - .5) * 5]); }
    for(const [col, th] of [[pal[0], 8], [pal[2], 6], [pal[3], 3], [pal[4], 1.2]]){ lg.beginPath(); lg.moveTo(pts[0][0], pts[0][1]); for(const p of pts) lg.lineTo(p[0], p[1]); lg.strokeStyle = col; lg.lineWidth = th; lg.lineJoin = 'miter'; lg.stroke(); }
    kvbCracks(lg, c, rad * .75, k, 7, pal[2], 1.4, 3); };
  kvbDefDecal('oe_rift', 10, kvbRingPaint(OE, {fillCol: '#8e2a48', core: '#2a0a16', fill: .45, details: rift, flash: '#ffd0dc', rimThick: 4}));
  kvbDefDecal('oe_pulse', 10, kvbRingPaint(OE, {fillCol: '#8e2a48', fill: .3, details: (lg, c, R, rad, pal, q) => { kvbCracks(lg, c, rad * .8, kvbEase(Math.min(1, q / .35)), 9, pal[2], 1.6, 2); kvbCircle(lg, c, c, rad * .5, pal[3], 1); }, flash: '#ffd0dc'}));
  kvbDefDecal('oe_portal', 10, kvbRingPaint(OE, {fillCol: '#2a0a16', core: '#e05a7a', fill: .5, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 3; i++){ const a = q * 7 + i * 2.0944; kvbArcLine(lg, c, c, rad * (.3 + i * .2), a, a + 1.6, pal[3], 1.8); } }, flash: '#ffd0dc', rimThick: 3}));

  KVB_FX['oriel.portal'] = (x, y, r, ang, a, b) => {
    kvbDecal('oe_portal', x, y, Math.max(34, r), 760, {layer: 'g'}); kvbEmit('oe_petal', 8, x, y, {ring: 20, v0: 15, v1: 60, up: 50, grav: 60, l0: 480, l1: 800, scale: 1.4, spin: 4, flat: .7});
    if(a !== undefined){ kvbDecal('oe_portal', a, b, Math.max(34, r), 760, {layer: 'g'}); kvbEmit('oe_petal', 8, a, b, {ring: 20, v0: 15, v1: 60, up: 50, grav: 60, l0: 480, l1: 800, scale: 1.4, spin: 4, flat: .7}); }
  };
  KVB_FX['oriel.rift_echo'] = (x, y, r) => { // un pulso de radio real en cada portal abierto (o en ella si no hay)
    const h = kvbHeroAt(x, y, 'oriel'), ps = h ? portadorObjects.filter(o => o.kind === 'as_portal' && o.owner === h && o.life > 0) : [];
    for(const p of (ps.length ? ps : [{x, y}])){ kvbDecal('oe_pulse', p.x, p.y, r, 760, {layer: 'g'}); kvbEmit('oe_petal', 7, p.x, p.y, {ring: r * .5, v0: 20, v1: 70, up: 40, grav: 60, l0: 420, l1: 700, scale: 1.4, spin: 4, flat: .7}); }
  };
  KVB_FX['oriel.rift_step'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbDecal('oe_rift', x, y, Math.max(40, r), 880, {layer: 'g'}); kvbDecal('oe_pulse', ex, ey, 60, 700, {layer: 'g'});
    kvbEmit('oe_shard', 6, x, y, {v0: 40, v1: 130, up: 50, grav: 200, l0: 380, l1: 620, scale: 1.4, spin: 6}); kvbEmit('oe_petal', 6, ex, ey, {v0: 30, v1: 90, up: 40, grav: 60, l0: 420, l1: 700, scale: 1.4, spin: 4});
  };
  KVB_FX['oriel.great_rift'] = (x, y, r) => {
    kvbDecal('oe_rift', x, y, r, 1000, {layer: 'g'});
    kvbEmit('oe_shard', 10, x, y, {ring: r * .5, v0: 50, v1: 160, up: 90, grav: 200, l0: 480, l1: 820, scale: 1.6, spin: 6, flat: .7}); kvbEmit('oe_glow', 8, x, y, {ring: r * .6, v0: 8, v1: 30, up: 70, l0: 600, l1: 1000, scale: 1.4, flat: .7});
  };
  kvbBind('asc:portal', 'oriel.portal'); kvbBind('asc:rift_echo', 'oriel.rift_echo'); kvbBind('asc:rift_step', 'oriel.rift_step'); kvbBind('asc:great_rift', 'oriel.great_rift');
  kvbBasic('oriel', OE, 'oe_petal');
}
