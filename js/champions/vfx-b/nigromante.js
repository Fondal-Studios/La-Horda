'use strict';
/* Ilvar, el Señor de las Criptas — almas verdes, huesos y abismo. Ya tenía arte propio (plaga del suelo, gólem que se arma, esqueletos); lo que faltaba:
   Encarnación del Abismo (antes solo la firma flotante y la transformación: ahora un estallido de abismo al absorber el ejército y una aura de llamas verdes mientras dure el Demonio)
   y el toque de impacto del ataque básico. Solo visual; el arte existente no se toca. */
{
  const NI = ['#0a241b', '#2a7a5a', '#4ab88a', '#8ef0c8', '#ffffff'];
  kvbDefMotif('ni_soul', 6, 9, kvbBmp(['..ww..', '.wWWw.', '.wWWw.', 'wwWWww', '.wWWw.', '.wwWw.', '..wWw.', '...ww.', '....w.'], {w: '#8ef0c8', W: '#ffffff'}));
  kvbDefMotif('ni_bone', 7, 3, kvbBmp(['bb...bb', 'bbbbbbb', 'bb...bb'], {b: '#e9e6d6'}));
  const abyss = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 12; i++){ const a = i * .5236, L = rad * (i & 1 ? .6 : .95), nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * rad * .2, c + Math.sin(a) * rad * .2], [c + Math.cos(a) * L + nx * 2.4, c + Math.sin(a) * L + ny * 2.4], [c + Math.cos(a) * L - nx * 2.4, c + Math.sin(a) * L - ny * 2.4]], i & 1 ? pal[3] : pal[2]); } kvbDisc(lg, c, c, rad * .18, pal[0]); kvbCircle(lg, c, c, rad * .22, pal[3], 1.4); };
  kvbDefDecal('ni_abyss', 10, kvbRingPaint(NI, {fillCol: '#2a7a5a', core: '#0a241b', fill: .44, details: abyss, flash: '#8ef0c8', rimThick: 4}));
  kvbDefDecal('ni_demon_idle', 12, kvbIdlePaint(NI, {fill: .16, fillCol: '#2a7a5a', dash: [5, 3], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 10; i++){ const a = i * .628 - q * 1.4, k = .6 + .35 * Math.abs(Math.sin(q * 6.2832 + i)), nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * R * .6, c + Math.sin(a) * R * .6], [c + Math.cos(a) * R * k + nx * 2, c + Math.sin(a) * R * k + ny * 2], [c + Math.cos(a) * R * k - nx * 2, c + Math.sin(a) * R * k - ny * 2]], i & 1 ? pal[3] : pal[2]); } }}));
  KVB_FX['nigro.abyss'] = (x, y, r) => { kvbDecal('ni_abyss', x, y, r, 1000, {layer: 'g'}); kvbEmit('ni_soul', 10, x, y, {ring: r * .6, v0: 8, v1: 30, up: 90, l0: 600, l1: 1000, scale: 1.4, flat: .6}); kvbEmit('ni_bone', 6, x, y, {ring: r * .4, v0: 30, v1: 110, up: 80, grav: 300, spin: 8, l0: 420, l1: 700, scale: 1.3, flat: .6}); };
  kvbClassic('nigromante', 'abyss_incarnation_ult', (c, sk) => ['nigro.abyss', c.x, c.y, 110, 0, 0, 0]);
  kvbOverlay('nigromante', (h, layer, t) => { if(layer === 'g' && h.nigroDemonForm) kvbLoopDecal('ni_demon_idle', h.x, h.y + 6, 52, t, 800, {alpha: .95}); },
    (h, dt) => { if(h.nigroDemonForm && kvbPulseEvery(h, 'soul', 170, dt)) kvbPart('ni_soul', h.x + kvbRR(-18, 18), h.y - 4, {vy: -50, dur: 640, scale: 1.2, layer: 't', shrink: true}); });
  kvbBasic('nigromante', NI, 'ni_soul');
}
