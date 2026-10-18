'use strict';
/* Zahra, la Mano de la Válvula — horno, brasas, ceniza y vapor. Antes: 'fortFireBurst' (el mismo estallido de fuego de la Fortaleza) y gotas de agua.
   Boca de horno (cono) · Enfriar (nube de vapor) · Paso de ceniza (salto + pulsos) · Abrir todas las válvulas (4 pulsos de vapor). Solo visual. */
{
  const ZH = ['#2a1008', '#a8431a', '#ed8858', '#ffc27a', '#fff2cc'], STEAM = ['#3a4a5a', '#8fa4b8', '#cfe0ee', '#eef6fc', '#ffffff'];
  kvbDefMotif('zh_flame', 7, 10, kvbBmp(['...y...', '..yoy..', '..yoy..', '.yooory', '.yorrry', 'yoorrro', 'yorrrro', 'yorrrro', '.orrrr.', '..rrr..'], {y: '#fff2cc', o: '#ffc27a', r: '#ed8858'}));
  kvbDefMotif('zh_ember', 3, 3, kvbBmp(['.y.', 'yoy', '.y.'], {y: '#fff2cc', o: '#ffa34a'}));
  kvbDefMotif('zh_ash', 3, 3, kvbBmp(['.gg', 'ggl', 'gg.'], {g: '#6a6560', l: '#a9a39b'}));
  kvbDefMotif('zh_steam', 11, 8, (g, p) => { kvbDisc(g, p + 5, p + 4, 3.5, '#cfe0ee'); kvbDisc(g, p + 3, p + 5, 2.6, '#eef6fc'); kvbDisc(g, p + 8, p + 5, 2.6, '#eef6fc'); kvbDisc(g, p + 5, p + 2.5, 2, '#ffffff'); }, '#52667a');
  kvbDefMotif('zh_valve', 11, 11, (g, p) => { kvbCircle(g, p + 5.5, p + 5.5, 4.2, '#c98a4a', 2); kvbLine(g, p + 5.5, p + 1, p + 5.5, p + 10, '#ffc27a', 1.4); kvbLine(g, p + 1, p + 5.5, p + 10, p + 5.5, '#ffc27a', 1.4); kvbDisc(g, p + 5.5, p + 5.5, 1.5, '#fff2cc'); });

  const flameStreaks = (lg, c, R, front, q, half, pal) => {
    for(let k = -3; k <= 3; k++){ const a = k * half / 3.1, L = front * (.7 + .3 * kvbHash(k + 4, 9)), w = 3.5 - Math.abs(k) * .35, tx = c + Math.cos(a) * L, ty = c + Math.sin(a) * L, nx = -Math.sin(a), ny = Math.cos(a), off = Math.sin(q * 12 + k) * 2;
      kvbPoly(lg, [[c + Math.cos(a) * L * .12, c + Math.sin(a) * L * .12], [c + Math.cos(a) * L * .55 + nx * (w + off), c + Math.sin(a) * L * .55 + ny * (w + off)], [tx, ty], [c + Math.cos(a) * L * .55 - nx * (w - off), c + Math.sin(a) * L * .55 - ny * (w - off)]], pal[3]);
      kvbPoly(lg, [[c + Math.cos(a) * L * .2, c + Math.sin(a) * L * .2], [c + Math.cos(a) * L * .5 + nx * w * .4, c + Math.sin(a) * L * .5 + ny * w * .4], [c + Math.cos(a) * L * .85, c + Math.sin(a) * L * .85], [c + Math.cos(a) * L * .5 - nx * w * .4, c + Math.sin(a) * L * .5 - ny * w * .4]], pal[4]); }
  };
  kvbDefDecal('zh_cone', 10, kvbSectorPaint(ZH, {fillCol: '#a8431a', streaks: flameStreaks}));
  const steamDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 12; i++){ const a = i * .5236 + .2, d = rad * (.55 + .38 * kvbHash(i, 11)), x = c + Math.cos(a) * d, y = c + Math.sin(a) * d - q * 6; kvbDisc(lg, x, y, 3 + (i % 3), pal[3]); kvbDisc(lg, x - 1, y - 1, 1.5, pal[4]); } };
  kvbDefDecal('zh_quench', 10, kvbRingPaint(STEAM, {fillCol: '#8fa4b8', fill: .38, details: steamDetails, flash: '#eef6fc', rimThick: 3}));
  const ventDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 8; i++){ const a = i * .7854, x0 = c + Math.cos(a) * rad * .3, y0 = c + Math.sin(a) * rad * .3, x1 = c + Math.cos(a) * rad * .9, y1 = c + Math.sin(a) * rad * .9; kvbLine(lg, x0, y0, x1, y1, pal[3], 2); kvbDisc(lg, x1, y1, 2.2, pal[4]); } kvbCircle(lg, c, c, rad * .3, pal[3], 2); };
  kvbDefDecal('zh_vent', 10, kvbRingPaint(ZH, {fillCol: '#a8431a', core: '#ed8858', fill: .42, details: ventDetails, flash: '#ffc27a', rimThick: 4}));
  kvbDefDecal('zh_vent_idle', 12, kvbIdlePaint(ZH, {fill: .14, fillCol: '#a8431a', dash: [6, 4], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 6; i++){ const a = q * 6.2832 + i * 1.047; const x = c + Math.cos(a) * R * .72, y = c + Math.sin(a) * R * .72; kvbCircle(lg, x, y, 3, pal[3], 1.4); kvbDisc(lg, x, y, 1, pal[4]); } kvbCircle(lg, c, c, R * .42, pal[2], 1); }}));
  kvbDefBeam('zh_ash', 8, 16, 16, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, half = Math.max(1, Math.round(m * (q < .2 ? .3 + 3 * q : .8 - .45 * post)));
    g.fillStyle = '#16100c'; g.fillRect(0, m - half - 1, W, half * 2 + 2); g.fillStyle = '#4a423c'; g.fillRect(0, m - half, W, half * 2);
    g.fillStyle = (q < .6 ? ZH[3] : ZH[2]); let y = m; for(let x = 0; x < W; x += 4){ y = m + (kvbHash(x, 3) > .5 ? -1 : 1); g.fillRect(x, y, 4, 1); }
    g.fillStyle = '#7a726a'; for(let x = 2; x < W; x += 5) g.fillRect(x, m - half, 1, 1);
  });

  KVB_FX['zahra.furnace'] = (x, y, range, ang, half) => {
    kvbSectorFx('zh_cone', x, y, range, ang, 600, {layer: 'g'});
    kvbEmit('zh_flame', 7, x, y, {ang, spread: (half || .85) * 1.6, v0: range * .5, v1: range * 1.0, l0: 280, l1: 460, scale: 1.4, up: 25, shrink: true, rot: 0});
    kvbEmit('zh_ember', 12, x, y, {ang, spread: (half || .85) * 2, v0: range * .5, v1: range * 1.3, l0: 380, l1: 700, scale: 1.2, up: 30, grav: -40, drag: .6});
  };
  KVB_FX['zahra.quench'] = (x, y, r) => {
    kvbDecal('zh_quench', x, y, r, 800, {layer: 'g'});
    kvbEmit('zh_steam', 9, x, y, {ring: r * .75, v0: 8, v1: 30, up: 55, l0: 520, l1: 820, scale: 1.7, flat: .7, drag: .3});
  };
  KVB_FX['zahra.ash_step'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('zh_ash', x, y, ex, ey, Math.max(14, r * 1.2), 520, {layer: 'g'});
    kvbEmit('zh_ash', 8, x, y, {v0: 20, v1: 70, up: 30, grav: 60, l0: 400, l1: 640, scale: 1.4});
    kvbEmit('zh_ember', 8, x, y, {v0: 30, v1: 90, up: 40, grav: -20, l0: 380, l1: 620, scale: 1.2});
  };
  KVB_FX['zahra.vent'] = (x, y, r) => {
    kvbEmit('zh_valve', 3, x, y, {ring: r * .4, v0: 10, v1: 40, up: 70, l0: 500, l1: 760, scale: 1.4, spin: 6});
    kvbEmit('zh_steam', 8, x, y, {ring: r * .5, v0: 20, v1: 60, up: 40, l0: 520, l1: 800, scale: 1.7, flat: .7});
  };
  kvbBind('ex:furnace', 'zahra.furnace'); kvbBind('ex:quench', 'zahra.quench'); kvbBind('ex:ash_step', 'zahra.ash_step'); kvbBind('ex:vent', 'zahra.vent');

  kvbSkin('ex_line', {R: o => o.r, hideBase: true,
    pulse: o => { const n = 4 - o.left; kvbDecal('zh_vent', o.x + (o.bx - o.x) * (n / 4), o.y + (o.by - o.y) * (n / 4), Math.max(18, o.r * 1.2), 420, {layer: 'g', alpha: .85}); kvbEmit('zh_ember', 5, o.x + (o.bx - o.x) * (n / 4), o.y + (o.by - o.y) * (n / 4), {v0: 20, v1: 70, up: 50, l0: 380, l1: 600, scale: 1.2}); },
    draw: (o, t) => { const len = Math.hypot(o.bx - o.x, o.by - o.y); if(len < 4) return; const a = Math.atan2(o.by - o.y, o.bx - o.x), h = Math.max(7, o.r); ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(a); const k = Math.min(1, o.life / 500); ctx.globalAlpha = .6 * k;
      ctx.fillStyle = '#4a423c'; ctx.fillRect(0, -h, len, h * 2); ctx.globalAlpha = k; ctx.fillStyle = '#16100c'; ctx.fillRect(0, -h - 1, len, 2); ctx.fillRect(0, h - 1, len, 2); ctx.fillStyle = (Math.floor(t / 140) & 1) ? ZH[3] : ZH[2]; for(let x = 0; x < len; x += 9) ctx.fillRect(x, ((x >> 3) & 1) ? -2 : 1, 6, 2); ctx.restore(); }}, 'zahra');
  kvbSkin('ex_vent', {R: o => o.r, loop: 'zh_vent_idle', period: 1800,
    pulse: o => { kvbDecal('zh_vent', o.x, o.y, o.r, 760, {layer: 'g'}); kvbEmit('zh_steam', 8, o.x, o.y, {ring: o.r * .6, v0: 20, v1: 60, up: 60, l0: 520, l1: 820, scale: 1.8, flat: .7}); if(o.left === 0) kvbEmit('zh_ember', 14, o.x, o.y, {ring: o.r * .5, v0: 40, v1: 130, up: 90, grav: 80, l0: 420, l1: 700, scale: 1.3}); } }, 'zahra');
  kvbBasic('zahra', ZH, 'zh_ember');
}
