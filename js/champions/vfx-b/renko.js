'use strict';
/* Renko, el Jardinero de Nombres — tierra removida, estacas con nombre y brotes. Antes: cristales de hielo azules (tema 'earth' = fxSpike).
   Surco (línea) · Montículo (zona) · Devolver a la tierra (golpe circular) · Aquí siguen los nombres (3 sacudidas). Solo visual. */
{
  const SOIL = ['#2a1d12', '#5a4128', '#7a5a3a', '#b08a5a', '#e0cfa8'], DUST = ['#3a2c1c', '#8a775b', '#b9a688', '#ddd0b2', '#f6efdc'];
  kvbDefMotif('rk_clod', 6, 5, kvbBmp(['.bbb..', 'bccbb.', 'bcbbdd', '.bbdd.', '..dd..'], {b: '#7a5a3a', c: '#b08a5a', d: '#4f3a24'}));
  kvbDefMotif('rk_sprout', 7, 8, kvbBmp(['.h...h.', 'hgh.hgh', 'hggsggh', '.hgsgh.', '..hsh..', '...s...', '...s...', '...s...'], {g: '#8fd06a', h: '#4b8a3a', s: '#3b6a2c'}));
  kvbDefMotif('rk_stake', 7, 10, kvbBmp(['.wwwww.', 'wllllw.', 'wlnnlw.', 'wllllw.', '.wwwww.', '..wdw..', '..wdw..', '..wdw..', '..wdw..', '...d...'], {w: '#c8a468', l: '#efe2c0', n: '#7a5a3a', d: '#8a6a40'}));
  kvbDefMotif('rk_pebble', 3, 3, kvbBmp(['.bb', 'bcb', '.bb'], {b: '#8a775b', c: '#b9a688'}));
  kvbDefMotif('rk_puff', 11, 9, (g, p) => { kvbDisc(g, p + 5, p + 5, 4, '#8a775b'); kvbDisc(g, p + 3, p + 5, 3, '#b9a688'); kvbDisc(g, p + 7, p + 4, 3, '#b9a688'); kvbDisc(g, p + 5, p + 3, 2, '#ddd0b2'); });

  // golpe circular: grietas + sellos de tierra (cast de Devolver a la tierra y cada sacudida de la definitiva)
  const crackDetails = n => (lg, c, R, rad, pal, q, P) => {
    kvbCracks(lg, c, rad, kvbEase(Math.min(1, q / .4)), n, pal[0], 4, 3); kvbCracks(lg, c, rad, kvbEase(Math.min(1, q / .4)), n, pal[3], 2, 3);
    for(let i = 0; i < 10; i++){ const a = i * .628 + kvbHash(i, 2) * .4, d = rad * (.55 + .4 * kvbHash(i, 5)); kvbDisc(lg, c + Math.cos(a) * d, c + Math.sin(a) * d, 2 + (i & 1), pal[3]); }
  };
  kvbDefDecal('rk_burst', 10, kvbRingPaint(SOIL, {fillCol: '#5a4128', core: '#2a1d12', fill: .4, details: crackDetails(7), flash: '#b08a5a'}));
  kvbDefDecal('rk_faults', 10, kvbRingPaint(SOIL, {fillCol: '#3a2a1a', core: '#1b130b', fill: .42, rimThick: 4, details: crackDetails(10), flash: '#e0cfa8'}));
  // zona viva de la definitiva: grietas oscuras que respiran, fijas
  kvbDefDecal('rk_faults_idle', 12, kvbIdlePaint(SOIL, {fill: .14, fillCol: '#3a2a1a', dash: [8, 5], details: (lg, c, R, rad, pal, q, P) => { kvbCracks(lg, c, R * .95, 1, 9, pal[0], 3, 3); kvbCracks(lg, c, R * .95, 1, 9, q < .5 ? pal[3] : pal[2], 1, 3); }}));
  // montículo: aro de terrones con brotes (cast) y su versión viva
  const moundDetails = (lg, c, R, rad, pal, q, P) => {
    for(let i = 0; i < 16; i++){ const a = i * 6.2832 / 16, x = c + Math.cos(a) * rad * .86, y = c + Math.sin(a) * rad * .86; kvbDisc(lg, x, y, 3 + (i & 1), pal[2]); kvbDisc(lg, x - 1, y - 1, 1.2, pal[3]); }
    for(let i = 0; i < 6; i++){ const a = i * 1.047 + .3, x = c + Math.cos(a) * rad * .5, y = c + Math.sin(a) * rad * .5; kvbLine(lg, x, y, x, y - 4, '#5aa642', 2); kvbLine(lg, x - 2, y - 4, x + 2, y - 3, '#8fd06a', 1); }
  };
  kvbDefDecal('rk_mound', 10, kvbRingPaint(SOIL, {fillCol: '#6a5a3a', fill: .45, details: moundDetails, flash: '#b08a5a'}));
  kvbDefDecal('rk_mound_idle', 12, kvbIdlePaint(SOIL, {fill: .2, fillCol: '#6a5a3a', details: moundDetails}));
  // parche de tierra removida (objeto del surco) con su estaca
  kvbDefDecal('rk_soil_idle', 12, kvbIdlePaint(SOIL, {fill: .26, fillCol: '#4f3a24', dash: [6, 4], details: (lg, c, R) => { for(let i = 0; i < 9; i++){ const a = i * .7, d = R * (.2 + .6 * kvbHash(i, 4)); kvbDisc(lg, c + Math.cos(a) * d, c + Math.sin(a) * d * .8, 2, '#8a6a40'); } }}));
  // surco: baldosa de tierra con borde irregular
  kvbDefBeam('rk_furrow', 8, 20, 20, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, half = Math.max(1, Math.round(m * (q < .2 ? .25 + 3.7 * q : .95 - .7 * post)));
    g.fillStyle = SOIL[0]; g.fillRect(0, m - half - 1, W, half * 2 + 2);
    g.fillStyle = SOIL[1]; g.fillRect(0, m - half, W, half * 2);
    g.fillStyle = SOIL[2]; g.fillRect(0, m - half, W, 2); g.fillRect(0, m + half - 2, W, 2);
    g.fillStyle = SOIL[3]; for(let x = 1; x < W; x += 5) g.fillRect(x + (f & 1), m - half, 2, 1);
    g.fillStyle = SOIL[0]; for(let x = 2; x < W; x += 6) g.fillRect(x, m - 1 + ((x >> 1) & 1), 2, 1);
  });

  KVB_FX['renko.trench'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('rk_furrow', x, y, ex, ey, r * 2, 700, {layer: 'g'});
    kvbEmit('rk_puff', 3, ex, ey, {v0: 15, v1: 50, up: 25, l0: 420, l1: 560, scale: 1.4});
    const n = kvbBudget(8);
    for(let i = 0; i < n; i++){ const u = (i + .5) / n, px = x + (ex - x) * u, py = y + (ey - y) * u; kvbPart(i % 3 ? 'rk_clod' : 'rk_pebble', px, py, {vx: kvbRR(-30, 30), vy: -kvbRR(60, 110), grav: 320, spin: kvbRR(-8, 8), dur: kvbRR(430, 650), scale: 1.5}); }
    kvbEmit('rk_puff', 3, x, y, {spread: 1.2, ang, v0: 40, v1: 90, l0: 400, l1: 520, scale: 1.3, up: 10});
    kvbPart('rk_stake', ex, ey + 4, {ay: 1, dur: 700, scale: 1.7, layer: 't', fadeAt: .55});
  };
  KVB_FX['renko.mound'] = (x, y, r) => {
    kvbDecal('rk_mound', x, y, r, 820, {layer: 'g'});
    kvbEmit('rk_sprout', 7, x, y, {ring: r * .8, v0: 5, v1: 20, up: 60, grav: 90, l0: 500, l1: 760, scale: 1.4, ay: 1});
    kvbEmit('rk_clod', 6, x, y, {ring: r * .5, v0: 20, v1: 60, up: 90, grav: 330, spin: 7, l0: 420, l1: 600, scale: 1.4});
  };
  KVB_FX['renko.burial'] = (x, y, r) => {
    kvbDecal('rk_burst', x, y, r, 760, {layer: 'g'});
    kvbEmit('rk_clod', 12, x, y, {ring: r * .35, v0: 60, v1: 150, up: 110, grav: 380, spin: 8, l0: 450, l1: 700, scale: 1.5, flat: .6});
    kvbEmit('rk_puff', 5, x, y, {ring: r * .6, v0: 20, v1: 50, up: 20, l0: 450, l1: 650, scale: 1.7, flat: .6});
  };
  KVB_FX['renko.faults'] = (x, y, r) => { // los decales de cada sacudida los emite la piel del objeto (ex_faults); aquí solo el arranque
    kvbEmit('rk_clod', 10, x, y, {ring: r * .5, v0: 40, v1: 130, up: 100, grav: 360, spin: 8, l0: 480, l1: 760, scale: 1.6, flat: .6});
  };
  kvbBind('ex:trench', 'renko.trench'); kvbBind('ex:mound', 'renko.mound'); kvbBind('ex:burial', 'renko.burial'); kvbBind('ex:faults', 'renko.faults');

  // objetos persistentes
  kvbSkin('ex_soil', {R: o => o.r, loop: 'rk_soil_idle', period: 1600, born: o => kvbPart('rk_stake', o.x, o.y + 4, {ay: 1, dur: Math.max(600, o.life - 300), scale: 1.7, layer: 't', fadeAt: .88}),
    end: o => { kvbEmit('rk_clod', 5, o.x, o.y, {v0: 20, v1: 70, up: 70, grav: 320, spin: 6, l0: 380, l1: 520, scale: 1.3}); kvbEmit('rk_puff', 2, o.x, o.y, {v0: 10, v1: 30, l0: 380, l1: 520, scale: 1.3}); }}, 'renko');
  kvbSkin('ex_mound', {R: o => o.r, loop: 'rk_mound_idle', period: 1800, end: o => { kvbEmit('rk_puff', 4, o.x, o.y, {ring: o.r * .6, v0: 15, v1: 40, l0: 400, l1: 600, scale: 1.6, flat: .6}); }}, 'renko');
  kvbSkin('ex_faults', {R: o => o.r, loop: 'rk_faults_idle', period: 1500,
    pulse: o => { kvbDecal('rk_faults', o.x, o.y, o.r, 800, {layer: 'g', alpha: .9}); kvbEmit('rk_clod', 8, o.x, o.y, {ring: o.r * .55, v0: 40, v1: 120, up: 100, grav: 360, spin: 8, l0: 420, l1: 680, scale: 1.5, flat: .6}); if(o.left === 0) kvbEmit('rk_pebble', 14, o.x, o.y, {ring: o.r * .7, v0: 60, v1: 160, up: 120, grav: 380, l0: 400, l1: 640, scale: 1.8}); }}, 'renko');
  kvbBasic('renko', SOIL, 'rk_pebble');
}
