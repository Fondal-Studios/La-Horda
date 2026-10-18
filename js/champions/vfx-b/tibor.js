'use strict';
/* Tibor, el Rey sin Corona — enjambre de abejas, panal y polen. Antes: chispas amarillas genéricas (tema 'spark') y un escudo celeste.
   Nube obrera (zona con abejas que pican cada 600 ms) · Volvé a casa (las abejas regresan) · Polen de aviso (nube de polen) · El cielo zumba (colmena mayor). Solo visual. */
{
  const TB = ['#3a2a08', '#8a6d1c', '#c9b365', '#f5df8a', '#fff6c8'];
  kvbDefMotif('tb_bee', 9, 8, [
    kvbBmp(['.ww..ww..', 'w.wwww.w', '..ykyky.', '.ykykykk', '.ykykyk.', '..ykyk..', '...kk...'], {w: '#e8f6ff', y: '#ffd34d', k: '#2a1c08'}),
    kvbBmp(['.........', '.w.wwww.w', 'wwykyky.w', '.ykykykk', '.ykykyk.', '..ykyk..', '...kk...'], {w: '#e8f6ff', y: '#ffd34d', k: '#2a1c08'})]);
  kvbDefMotif('tb_pollen', 3, 3, kvbBmp(['.y.', 'yoy', '.y.'], {y: '#fff6c8', o: '#f5df8a'}));
  kvbDefMotif('tb_hex', 9, 9, (g, p) => { const c = p + 4.5; kvbPoly(g, [0, 1, 2, 3, 4, 5].map(i => [c + Math.cos(i * 1.0472 + .5236) * 4, c + Math.sin(i * 1.0472 + .5236) * 4]), '#f5df8a', '#8a6d1c', 1); kvbDisc(g, c, c, 1.5, '#fff6c8'); });
  kvbDefMotif('tb_drop', 4, 6, kvbBmp(['.y..', 'yoy.', 'yooy', 'yooy', '.yy.'], {y: '#ffd34d', o: '#f5df8a'}));

  const hexDetails = n => (lg, c, R, rad, pal, q) => { // celdas de panal en anillo y al centro
    for(let i = 0; i < n; i++){ const a = i * 6.2832 / n + .1, x = c + Math.cos(a) * rad * .78, y = c + Math.sin(a) * rad * .78; kvbPoly(lg, [0, 1, 2, 3, 4, 5].map(k => [x + Math.cos(k * 1.0472 + .5236) * 5, y + Math.sin(k * 1.0472 + .5236) * 5]), null, pal[3], 1.2); }
    kvbPoly(lg, [0, 1, 2, 3, 4, 5].map(k => [c + Math.cos(k * 1.0472 + .5236) * rad * .32, c + Math.sin(k * 1.0472 + .5236) * rad * .32]), pal[2], pal[4], 1.4);
  };
  kvbDefDecal('tb_hive', 10, kvbRingPaint(TB, {fillCol: '#8a6d1c', core: '#c9b365', fill: .36, details: hexDetails(10), flash: '#fff6c8'}));
  kvbDefDecal('tb_pollen', 10, kvbRingPaint(TB, {fillCol: '#c9b365', fill: .32, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 16; i++){ const a = i * .39 + kvbHash(i, 3), d = rad * (.2 + .7 * kvbHash(i, 8)); kvbDisc(lg, c + Math.cos(a) * d, c + Math.sin(a) * d, 1.6 + (i & 1), pal[4]); } }, flash: '#fff6c8'}));
  kvbDefDecal('tb_hive_idle', 12, kvbIdlePaint(TB, {fill: .14, fillCol: '#8a6d1c', dash: [6, 4], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 8; i++){ const a = i * .7854 + q * .6, x = c + Math.cos(a) * R * .8, y = c + Math.sin(a) * R * .8; kvbPoly(lg, [0, 1, 2, 3, 4, 5].map(k => [x + Math.cos(k * 1.0472 + .5236) * 4.5, y + Math.sin(k * 1.0472 + .5236) * 4.5]), null, pal[3], 1.2); } }}));
  kvbDefBeam('tb_stream', 8, 18, 14, (g, q, W, H, f) => { const m = H / 2; g.fillStyle = TB[1]; g.fillRect(0, m - 2, W, 4); g.fillStyle = TB[3]; for(let x = (f * 3) % 9; x < W; x += 9){ g.fillRect(x, m - 1, 4, 2); g.fillRect(x + 4, m - 4 + ((x >> 2) & 1) * 6, 1, 2); } g.fillStyle = TB[0]; g.fillRect(0, m - 3, W, 1); g.fillRect(0, m + 2, W, 1); });

  const fly = (from, to, n, o) => { const a = Math.atan2(to.y - from.y, to.x - from.x), L = Math.hypot(to.x - from.x, to.y - from.y); for(let i = 0; i < kvbBudget(n); i++){ const sp = L / ((o && o.t) || .5); kvbPart('tb_bee', from.x + kvbRR(-14, 14), from.y + kvbRR(-14, 14), {vx: Math.cos(a) * sp * kvbRR(.8, 1.1) + kvbRR(-20, 20), vy: Math.sin(a) * sp * kvbRR(.8, 1.1) + kvbRR(-20, 20), dur: 480, fps: 14, scale: 1.2, layer: 't', fadeAt: .75}); } };
  KVB_FX['tibor.swarm'] = (x, y, r, ang, a, b) => { // origen (a, b) → punto x, y
    kvbDecal('tb_hive', x, y, r, 820, {layer: 'g'});
    if(a !== undefined) fly({x: a, y: b}, {x, y}, 8); kvbEmit('tb_pollen', 8, x, y, {ring: r * .6, v0: 10, v1: 40, up: 20, l0: 420, l1: 700, scale: 1.2, flat: .7});
  };
  KVB_FX['tibor.recall'] = (x, y, r) => { kvbEmit('tb_bee', 4, x, y, {ring: 24, v0: 10, v1: 40, up: 20, l0: 360, l1: 540, scale: 1.2, fps: 14}); };
  KVB_FX['tibor.pollen'] = (x, y, r, ang, a, b) => {
    kvbDecal('tb_pollen', x, y, r, 800, {layer: 'g'});
    if(a !== undefined) fly({x: a, y: b}, {x, y}, 5); kvbEmit('tb_pollen', 14, x, y, {ring: r * .7, v0: 10, v1: 50, up: 30, l0: 480, l1: 800, scale: 1.3, flat: .7});
  };
  KVB_FX['tibor.hive_sky'] = (x, y, r, ang, a, b) => {
    kvbDecal('tb_hive', x, y, r, 980, {layer: 'g'});
    kvbEmit('tb_hex', 7, x, y, {ring: r * .6, v0: 10, v1: 40, up: 90, grav: 60, l0: 560, l1: 900, scale: 1.4, flat: .7, spin: 3});
    if(a !== undefined) fly({x: a, y: b}, {x, y}, 12);
  };
  kvbBind('ex:swarm', 'tibor.swarm'); kvbBind('ex:recall', 'tibor.recall'); kvbBind('ex:pollen', 'tibor.pollen'); kvbBind('ex:hive_sky', 'tibor.hive_sky');
  // las abejas que viven en la nube (zona real = o.r); al desaparecer la nube vuelven a Tibor
  const beesOf = o => Math.max(9, Math.round(o.r / 7));
  kvbSkin('ex_swarm', {R: o => o.r, loop: 'tb_hive_idle', period: 2000, layers: ['g', 't'],
    pulse: o => { kvbDecal('tb_hive', o.x, o.y, o.r, 520, {layer: 'g', alpha: .8}); kvbEmit('tb_pollen', 6, o.x, o.y, {ring: o.r * .6, v0: 10, v1: 40, up: 30, l0: 360, l1: 560, scale: 1.2, flat: .7}); },
    end: o => { const h = o.owner; if(h && h.alive) fly({x: o.x, y: o.y}, {x: h.x, y: h.y}, 7, {t: .6}); },
    draw: (o, t, layer) => { if(layer !== 't') return; const fr = kvbMotif('tb_bee'); if(!fr) return; ctx.save(); ctx.imageSmoothingEnabled = false; const n = beesOf(o), k = Math.min(1, o.life / 400);
      for(let i = 0; i < n; i++){ const ph = t / 1000 * (1.1 + (i % 3) * .35) + i * 2.399, rad = o.r * (.18 + .72 * kvbHash(i, 5)), x = o.x + Math.cos(ph) * rad, y = o.y + Math.sin(ph * 1.3) * rad * .8 - 8 + Math.sin(t / 90 + i) * 2, f = fr[(Math.floor(t / 70) + i) & 1];
        ctx.globalAlpha = k; ctx.drawImage(f, x - 12, y - 10, 24, 21); } ctx.restore(); }}, 'tibor');
  kvbBasic('tibor', TB, 'tb_pollen');
}
