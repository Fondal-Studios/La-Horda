'use strict';
/* Elyra, la Guardiana del Alba — luz del alba, espadas, escudos y alas. Antes: anillos de partículas del mismo verde para todo y triángulos blancos ('fxHolyHealBurst').
   Alba Purificadora (aro de curación 260 u + sol de daño 160 u) · Bendición de Guerra (espadas rojas sobre cada aliado) · Escudo Sagrado (escudos azules) · Bendición Suprema (sol dorado + ambos).
   Los radios son los REALES del lanzamiento (con maestría y talentos). Solo visual. */
{
  const EL = ['#14352a', '#2f8a5c', '#5fc48c', '#a9f0c9', '#fffbe0'], GO = ['#3a2a08', '#8a6d1c', '#e8c76a', '#fff0b8', '#ffffff'], WR = ['#3a0f0a', '#a8321e', '#ff5a3d', '#ffb08a', '#fff1e6'], SB = ['#10243f', '#2f6fb0', '#5fb0ff', '#bfe0ff', '#ffffff'];
  kvbDefMotif('el_plus', 7, 7, kvbBmp(['..ggg..', '..gWg..', 'ggg.ggg', 'gW...Wg', 'ggg.ggg', '..gWg..', '..ggg..'], {g: '#5fc48c', W: '#fffbe0'}));
  kvbDefMotif('el_mote', 5, 5, kvbBmp(['..y..', '..y..', 'yyWyy', '..y..', '..y..'], {y: '#e8c76a', W: '#ffffff'}));
  kvbDefMotif('el_sword', 7, 13, kvbBmp(['...w...', '...w...', '...w...', '..wcw..', '..wcw..', '..wcw..', '..wcw..', '.yyyyy.', '...r...', '...r...', '...y...'], {w: '#e8eef6', c: '#ffffff', y: '#e8c76a', r: '#c8321e'}));
  kvbDefMotif('el_shield', 9, 11, kvbBmp(['sssssssss', 'sbbbbbbbs', 'sbbWWWbbs', 'sbbWbbbbs', 'sbbWWbbbs', 'sbbWbbbbs', '.sbbbbbs.', '.sbbbbbs.', '..sbbbs..', '...sbs...', '....s....'], {s: '#bfe0ff', b: '#2f6fb0', W: '#ffffff'}));
  kvbDefMotif('el_wing', 11, 9, kvbBmp(['.........ww', '......wwwwW', '...wwwwwWw.', '.wwwwwWww..', 'wwwwWww....', '.wwww......', '..ww.......'], {w: '#fffbe0', W: '#ffffff'}));
  const rays = (n, col1, col2) => (lg, c, R, rad, pal, q) => { for(let i = 0; i < n; i++){ const a = i * 6.2832 / n + .1, L = rad * (i & 1 ? .6 : .94), nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * rad * .16, c + Math.sin(a) * rad * .16], [c + Math.cos(a) * L + nx * 2.4, c + Math.sin(a) * L + ny * 2.4], [c + Math.cos(a) * L - nx * 2.4, c + Math.sin(a) * L - ny * 2.4]], i & 1 ? col2 : col1); } };
  kvbDefDecal('el_dawn', 10, kvbRingPaint(EL, {fillCol: '#2f8a5c', fill: .26, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 10; i++){ const a = i * .628 + .2, x = c + Math.cos(a) * rad * .8, y = c + Math.sin(a) * rad * .8; kvbLine(lg, x - 3, y, x + 3, y, pal[4], 1.6); kvbLine(lg, x, y - 3, x, y + 3, pal[4], 1.6); } kvbCircle(lg, c, c, rad * .55, pal[3], 1); }, flash: '#a9f0c9', rimThick: 3}));
  kvbDefDecal('el_sun', 10, kvbRingPaint(GO, {fillCol: '#8a6d1c', core: '#e8c76a', fill: .4, details: rays(16, GO[3], GO[4]), flash: '#fff0b8', rimThick: 3}));
  kvbDefDecal('el_war', 10, kvbRingPaint(WR, {fillCol: '#a8321e', fill: .28, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 8; i++){ const a = i * .7854 + .39, x = c + Math.cos(a) * rad * .8, y = c + Math.sin(a) * rad * .8; kvbLine(lg, x, y, x + Math.cos(a) * 7, y + Math.sin(a) * 7, pal[3], 2); kvbLine(lg, x - Math.sin(a) * 3, y + Math.cos(a) * 3, x + Math.sin(a) * 3, y - Math.cos(a) * 3, GO[2], 1.6); } kvbCircle(lg, c, c, rad * .5, pal[2], 1); }, flash: '#ffb08a', rimThick: 3}));
  kvbDefDecal('el_aegis', 10, kvbRingPaint(SB, {fillCol: '#2f6fb0', fill: .28, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 6; i++){ const a = i * 1.047 + .52, x = c + Math.cos(a) * rad * .76, y = c + Math.sin(a) * rad * .76; kvbPoly(lg, [[x - 4, y - 4], [x + 4, y - 4], [x + 3, y + 2], [x, y + 6], [x - 3, y + 2]], pal[3], pal[4], 1); } kvbCircle(lg, c, c, rad * .5, pal[2], 1); }, flash: '#bfe0ff', rimThick: 3}));
  kvbDefDecal('el_grand', 10, kvbRingPaint(GO, {fillCol: '#8a6d1c', core: '#e8c76a', fill: .36, details: (lg, c, R, rad, pal, q) => { rays(20, GO[3], GO[4])(lg, c, R, rad, pal, q); kvbCircle(lg, c, c, rad * .55, GO[4], 1.2); for(const side of [-1, 1]) kvbPoly(lg, [[c + side * rad * .12, c], [c + side * rad * .5, c - rad * .22], [c + side * rad * .42, c + rad * .06]], GO[4]); }, flash: '#ffffff', rimThick: 4}));
  const allies = (x, y, r) => heroes.filter(h => h.alive && Math.hypot(h.x - x, h.y - y) <= r);
  const icon = (mot, h, ms, sc) => kvbPart(mot, h.x, h.y, {follow: h, ofx: 0, ofy: -62, dur: ms, scale: sc || 1.3, layer: 't', fadeAt: .9, alpha: .95});
  const ring = (name, h, ms, R) => kvbDecal(name, h.x, h.y + 4, R, ms, {follow: h, ofy: 4, layer: 'g', loop: true, fps: 8, alpha: .8, fadeAt: .85});

  KVB_FX['elyra.heal'] = (x, y, r, ang, dr) => {
    kvbDecal('el_dawn', x, y, r, 900, {layer: 'g'}); if(dr) kvbDecal('el_sun', x, y, dr, 760, {layer: 'g'});
    for(const h of allies(x, y, r)) kvbEmit('el_plus', 3, h.x, h.y - 18, {v0: 5, v1: 25, up: 60, l0: 480, l1: 760, scale: 1.2, jx: 8});
    kvbEmit('el_mote', 12, x, y, {ring: (dr || r) * .7, v0: 5, v1: 30, up: 50, l0: 520, l1: 860, scale: 1.2, flat: .7});
  };
  KVB_FX['elyra.war'] = (x, y, r, ang, ms) => { kvbDecal('el_war', x, y, r, 840, {layer: 'g'}); for(const h of allies(x, y, r)){ icon('el_sword', h, ms || 5500); ring('el_war_ring', h, ms || 5500, 24); kvbEmit('el_mote', 4, h.x, h.y - 10, {v0: 10, v1: 40, up: 50, l0: 380, l1: 620, scale: 1.1}); } };
  KVB_FX['elyra.shield'] = (x, y, r, ang, ms) => { kvbDecal('el_aegis', x, y, r, 840, {layer: 'g'}); for(const h of allies(x, y, r)){ icon('el_shield', h, ms || 5500); ring('el_aegis_ring', h, ms || 5500, 24); kvbEmit('el_mote', 4, h.x, h.y - 10, {v0: 10, v1: 40, up: 50, l0: 380, l1: 620, scale: 1.1}); } };
  KVB_FX['elyra.grand'] = (x, y, r, ang, ms) => {
    kvbDecal('el_grand', x, y, r, 1100, {layer: 'g'}); const h0 = kvbHeroAt(x, y, 'soporte');
    for(const h of allies(x, y, r)){ icon('el_sword', h, ms || 6500); kvbPart('el_shield', h.x, h.y, {follow: h, ofx: 16, ofy: -62, dur: ms || 6500, scale: 1.3, layer: 't', fadeAt: .9, alpha: .95}); kvbEmit('el_plus', 3, h.x, h.y - 18, {v0: 5, v1: 25, up: 60, l0: 480, l1: 760, scale: 1.2, jx: 8}); }
    if(h0) for(const s of [-1, 1]) kvbPart('el_wing', h0.x + s * 8, h0.y - 36, {flip: s < 0, dur: 1000, scale: 2.2, layer: 't', vx: s * 14, vy: -8, fadeAt: .45, ay: .8});
    kvbEmit('el_mote', 16, x, y, {ring: r * .6, v0: 8, v1: 40, up: 70, l0: 600, l1: 1000, scale: 1.3, flat: .7});
  };
  // anillos finos que acompañan a cada aliado mientras dura el efecto (tira corta en bucle)
  kvbDefDecal('el_war_ring', 8, kvbIdlePaint(WR, {fill: .16, fillCol: '#a8321e', dash: [4, 3]}));
  kvbDefDecal('el_aegis_ring', 8, kvbIdlePaint(SB, {fill: .16, fillCol: '#2f6fb0', dash: [4, 3]}));
  kvbClassic('soporte', 'team_heal_aoe', (c, sk, u, sc) => ['elyra.heal', c.x, c.y, sk.radius * sc.AREA, 0, (sk.damageRadius || 0) * sc.AREA, 0]);
  kvbClassic('soporte', 'team_atk_buff', (c, sk, u, sc) => ['elyra.war', c.x, c.y, sk.radius * sc.AREA, 0, sk.duration * sc.DUR, 0]);
  kvbClassic('soporte', 'team_shield_buff', (c, sk, u, sc) => ['elyra.shield', c.x, c.y, sk.radius * sc.AREA, 0, sk.duration * sc.DUR, 0]);
  kvbClassic('soporte', 'team_grand_buff', (c, sk, u, sc) => ['elyra.grand', c.x, c.y, sk.radius * sc.AREA, 0, sk.duration * sc.DUR, 0]);
  kvbBasic('soporte', EL, 'el_mote');
}
