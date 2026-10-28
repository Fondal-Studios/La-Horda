'use strict';
/* Nano GM, el Regente del Umbral — decretos de sombra y leyes de luz. Antes: 'dark' (calavera y salpicaduras) y 'light'/'rune' genéricos del motor.
   Sentencia Umbría (decreto en línea) · Edicto de Luz (ley en el suelo) · Inversión (salto con estallido) · Juicio del GM (la arena se parte en dos). Solo visual:
   las zonas persistentes (edicto, runa, juicio) conservan su dibujo propio de Ascensión; aquí se reemplaza el efecto genérico del lanzamiento. */
{
  const NG = ['#15120a', '#7a6420', '#e8c56a', '#fff4d6', '#ffffff'], SH = ['#05030a', '#2a2a3a', '#5a5a74', '#a6a6c0', '#ffffff'];
  kvbDefMotif('ng_shard_d', 7, 9, kvbBmp(['...w...', '..wkw..', '..wkk..', '.wkkkk.', '.wkkkk.', 'wkkkkk.', '.kkkk..', '..kk...', '...k...'], {w: '#f4f4f4', k: '#14121c'}));
  kvbDefMotif('ng_shard_l', 7, 9, kvbBmp(['...e...', '..eWe..', '..eWW..', '.eWWWW.', '.eWWWW.', 'eWWWWW.', '.WWWW..', '..WW...', '...W..'], {e: '#e8c56a', W: '#fff4d6'}));
  kvbDefMotif('ng_scroll', 9, 9, kvbBmp(['.eeeeeee.', 'eWWWWWWWe', 'eWkkWkkWe', 'eWWWWWWWe', 'eWkkkWkWe', 'eWWWWWWWe', '.eeeeeee.'], {e: '#e8c56a', W: '#fff4d6', k: '#7a6420'}));
  kvbDefMotif('ng_mote', 3, 3, kvbBmp(['.y.', 'yWy', '.y.'], {y: '#e8c56a', W: '#fff4d6'}));
  kvbDefBeam('ng_decree', 8, 20, 18, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, half = Math.max(1, Math.round(m * (q < .18 ? .3 + 3.8 * q : .82 - .5 * post)));
    g.fillStyle = NG[2]; g.fillRect(0, m - half - 2, W, half * 2 + 4); g.fillStyle = SH[0]; g.fillRect(0, m - half, W, half * 2);
    g.fillStyle = SH[1]; g.fillRect(0, m - half + 1, W, 2); g.fillRect(0, m + half - 3, W, 2); g.fillStyle = NG[3]; for(let x = (f * 4) % 10; x < W; x += 10) g.fillRect(x, m - 1, 4, 2);
    g.fillStyle = '#ffffff'; for(let x = 3; x < W; x += 9){ if(kvbHash(x + f, 6) > .5) g.fillRect(x, m - half + 2 + (x & 3), 1, 1); }
  });
  const lawDetails = (lg, c, R, rad, pal, q) => { lg.save(); lg.translate(c, c); lg.rotate(q * .9); const s = rad * .45; kvbPoly(lg, [[-s, -s], [s, -s], [s, s], [-s, s]], null, pal[3], 1.6); lg.rotate(.7854); kvbPoly(lg, [[-s * .7, -s * .7], [s * .7, -s * .7], [s * .7, s * .7], [-s * .7, s * .7]], null, pal[4], 1.2); lg.restore();
    for(let i = 0; i < 8; i++){ const a = i * .7854, x = c + Math.cos(a) * rad * .82, y = c + Math.sin(a) * rad * .82; kvbLine(lg, x, y - 3, x, y + 3, pal[3], 1.4); kvbLine(lg, x - 2, y, x + 2, y, pal[3], 1.2); } kvbCircle(lg, c, c, rad * .62, pal[2], 1); };
  kvbDefDecal('ng_law', 10, kvbRingPaint(NG, {fillCol: '#7a6420', core: '#e8c56a', fill: .36, details: lawDetails, flash: '#fff4d6', rimThick: 3}));
  const splitDetails = (lg, c, R, rad, pal, q) => { lg.beginPath(); lg.arc(c, c, rad - 2, Math.PI / 2, Math.PI * 1.5); lg.closePath(); lg.fillStyle = '#fff4d6'; lg.fill(); lg.beginPath(); lg.arc(c, c, rad - 2, -Math.PI / 2, Math.PI / 2); lg.closePath(); lg.fillStyle = '#14121c'; lg.fill(); kvbLine(lg, c, c - rad, c, c + rad, NG[2], 2); kvbDisc(lg, c - rad * .5, c, 2.4, '#14121c'); kvbDisc(lg, c + rad * .5, c, 2.4, '#fff4d6'); };
  kvbDefDecal('ng_verdict', 10, kvbRingPaint(NG, {fillCol: '#7a6420', fill: .5, details: splitDetails, flash: '#fff4d6', rimThick: 3}));
  kvbDefDecal('ng_burst_d', 10, kvbRingPaint(SH, {fillCol: '#2a2a3a', core: '#05030a', fill: .5, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 10; i++){ const a = i * .628, L = rad * .9, nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * rad * .2, c + Math.sin(a) * rad * .2], [c + Math.cos(a) * L + nx * 2.5, c + Math.sin(a) * L + ny * 2.5], [c + Math.cos(a) * L - nx * 2.5, c + Math.sin(a) * L - ny * 2.5]], i & 1 ? '#f4f4f4' : '#5a5a74'); } }, flash: '#a6a6c0', rimThick: 3}));

  KVB_FX['nano.sentence'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('ng_decree', x, y, ex, ey, Math.max(24, r * 1.7), 640, {layer: 't'});
    kvbDecal('ng_burst_d', ex, ey, Math.max(40, r * 2.3), 700, {layer: 'g'}); // explosión final: 70 u × área
    kvbEmit('ng_shard_d', 8, ex, ey, {ring: r, v0: 40, v1: 130, up: 60, grav: 240, l0: 380, l1: 620, scale: 1.4, spin: 6});
    kvbEmit('ng_shard_l', 5, x, y, {ang, spread: .6, v0: 30, v1: 100, l0: 300, l1: 460, scale: 1.2, shrink: true});
  };
  KVB_FX['nano.edict'] = (x, y, r) => {
    kvbDecal('ng_law', x, y, r, 840, {layer: 'g'});
    kvbEmit('ng_mote', 12, x, y, {ring: r * .8, v0: 4, v1: 18, up: 80, l0: 600, l1: 1000, scale: 1.3, flat: .7});
    kvbPart('ng_scroll', x, y - 24, {dur: 800, scale: 1.8, layer: 't', vy: -14, fadeAt: .5});
  };
  KVB_FX['nano.invert'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('ng_decree', x, y, ex, ey, 14, 420, {layer: 'g', alpha: .8});
    kvbDecal('ng_verdict', ex, ey, Math.max(40, r * 1.3), 760, {layer: 'g'}); // estallido de llegada: 1,3 × radio de la runa
    kvbEmit('ng_shard_d', 5, ex, ey, {v0: 40, v1: 120, up: 40, grav: 200, l0: 340, l1: 560, scale: 1.3, spin: 6}); kvbEmit('ng_shard_l', 5, ex, ey, {v0: 40, v1: 120, up: 40, grav: 200, l0: 340, l1: 560, scale: 1.3, spin: 6});
  };
  KVB_FX['nano.judgement'] = (x, y, r) => { // la mitad blanca / negra y la costura las dibuja el objeto del Juicio (radio real); aquí las esquirlas y la ley que cae
    kvbEmit('ng_shard_d', 14, x, y, {ring: r * .15, v0: 80, v1: 260, up: 90, grav: 200, l0: 520, l1: 900, scale: 1.8, spin: 5, flat: .7}); kvbEmit('ng_shard_l', 14, x, y, {ring: r * .15, v0: 80, v1: 260, up: 90, grav: 200, l0: 520, l1: 900, scale: 1.8, spin: 5, flat: .7});
    kvbPart('ng_scroll', x, y - 46, {dur: 1200, scale: 3, layer: 't', vy: -10, fadeAt: .55});
  };
  kvbBind('asc:sentence', 'nano.sentence'); kvbBind('asc:edict', 'nano.edict'); kvbBind('asc:invert', 'nano.invert'); kvbBind('asc:judgement', 'nano.judgement');
  kvbBasic('nano_gm', NG, 'ng_mote');
}
