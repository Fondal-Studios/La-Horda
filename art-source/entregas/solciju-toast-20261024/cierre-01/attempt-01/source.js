'use strict';
/* Solciju, la Enóloga — vino, uvas, barricas y copas. Antes: calavera y salpicaduras de 'dark' (fxSoulReapBurst) y un escudo celeste.
   Vino maldito (salpicadura) · Barrica añeja (barrica con mecha que estalla) · Brindis a solas (copa en alto) · Gran Reserva (charco de vino con 4 pulsos). Solo visual. */
{
  const SO = ['#2a0814', '#6b1f38', '#923951', '#d46a86', '#ffd2dc'], SOrgb = '146,57,81';
  kvbDefMotif('so_drop', 5, 7, kvbBmp(['..r..', '.rrr.', 'rrhrr', 'rrrrr', '.rrr.'], {r: '#923951', h: '#d46a86'}));
  kvbDefMotif('so_stave', 9, 3, kvbBmp(['wwwwwwwww', 'wllllllw.', '.wwwwwww.'], {w: '#7a4a2a', l: '#a8703c'}));
  kvbDefMotif('so_barrel', 16, 18, (g, p) => {
    g.beginPath(); g.moveTo(p + 3, p + 3); g.quadraticCurveTo(p - 1, p + 9, p + 3, p + 16); g.lineTo(p + 13, p + 16); g.quadraticCurveTo(p + 17, p + 9, p + 13, p + 3); g.closePath(); g.fillStyle = '#7a4a2a'; g.fill();
    g.beginPath(); g.ellipse(p + 8, p + 3, 5, 2.2, 0, 0, 6.2832); g.fillStyle = '#a8703c'; g.fill();
    g.fillStyle = '#c9b365'; g.fillRect(p + 1, p + 6, 14, 2); g.fillRect(p + 1, p + 12, 14, 2); g.fillStyle = '#a8703c'; g.fillRect(p + 5, p + 8, 1, 4); g.fillRect(p + 10, p + 8, 1, 4);
    g.fillStyle = '#923951'; g.fillRect(p + 7, p + 15, 2, 2); });
  kvbDefMotif('so_goblet', 9, 12, kvbBmp(['ggggggggg', 'gwwwwwwwg', 'gwrrrrrwg', '.gwrrrwg.', '..gwrwg..', '...ggg...', '....g....', '....g....', '..ggggg..'], {g: '#e8c76a', w: '#ffd2dc', r: '#923951'}));
  kvbDefMotif('so_grape', 7, 7, kvbBmp(['..ll...', '.pppp..', 'ppPpp..', '.pppPp.', '..pppp.', '...pp..'], {l: '#6fae4f', p: '#6b1f38', P: '#d46a86'}));
  kvbDefMotif('so_spark', 5, 5, kvbBmp(['..y..', '..y..', 'yywyy', '..y..', '..y..'], {y: '#e8c76a', w: '#ffffff'}));

  const splashDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 9; i++){ const a = i * .698 + .3, d = rad * (.3 + .6 * kvbHash(i, 6)), x = c + Math.cos(a) * d, y = c + Math.sin(a) * d; kvbDisc(lg, x, y, 2 + (i % 3), pal[3]); kvbDisc(lg, x - 1, y - 1, 1, pal[4]); kvbLine(lg, c + Math.cos(a) * rad * .15, c + Math.sin(a) * rad * .15, x, y, pal[2], 1.2); } kvbDisc(lg, c, c, rad * .16, pal[3]); };
  kvbDefDecal('so_splash', 10, kvbRingPaint(SO, {fillCol: '#6b1f38', core: '#923951', fill: .42, details: splashDetails, flash: '#d46a86'}));
  kvbDefDecal('so_pool_idle', 14, kvbIdlePaint(SO, {fill: .3, fillCol: '#6b1f38', dash: [8, 5], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 3; i++){ const a = q * 6.2832 + i * 2.0944; kvbArcLine(lg, c, c, R * (.35 + i * .2), a, a + 1.4, pal[3], 1.6); } for(let i = 0; i < 5; i++){ const a = i * 1.2566 - q * 6.2832, d = R * .55; kvbDisc(lg, c + Math.cos(a) * d, c + Math.sin(a) * d, 2, pal[4]); } }}));
  kvbDefDecal('so_fuse', 10, kvbRingPaint(SO, {fillCol: '#6b1f38', fill: .5, details: splashDetails, flash: '#ffd2dc', rimThick: 4}));
  // Copa grande que se alza: silueta vertical, no sello circular de potenciación.
  kvbDefDecal('so_toast', 10, (g, q, S) => {
    const c = S / 2, u = S / 24, lift = Math.sin(Math.min(1, q / .65) * Math.PI / 2) * 3;
    const y = c - lift * u, fade = q < .65 ? 1 : (1 - q) / .35;
    const cup = [[c-6*u,y-6*u],[c+6*u,y-6*u],[c+4*u,y],[c,y+2*u],[c-4*u,y]];
    // Vidrio abierto y vino trameado: la copa no oculta al enemigo bajo el brindis.
    kvbLayer(g,S,.18*fade,lg=>kvbPoly(lg,cup,kvbTintCol('#923951',.30)));
    kvbLayer(g, S, fade, lg => {
      kvbPoly(lg, cup, null, '#2a0814', 3*u);
      kvbPoly(lg, cup, null, '#e8c76a', u);
      kvbLine(lg,c-4*u,y-4*u,c+4*u,y-4*u,'#ffd2dc',u);
      kvbLine(lg,c,y+2*u,c,y+6*u,'#2a0814',3*u);
      kvbLine(lg,c,y+2*u,c,y+6*u,'#e8c76a',u);
      kvbLine(lg,c-4*u,y+7*u,c+4*u,y+7*u,'#2a0814',3*u);
      kvbLine(lg,c-4*u,y+7*u,c+4*u,y+7*u,'#e8c76a',u);
    });
  });

  const toward = (from, to, n, mot, sc) => { const a = Math.atan2(to.y - from.y, to.x - from.x), L = Math.hypot(to.x - from.x, to.y - from.y); for(let i = 0; i < kvbBudget(n); i++){ const sp = L / .42; kvbPart(mot, from.x + kvbRR(-6, 6), from.y - 10 + kvbRR(-6, 6), {vx: Math.cos(a) * sp * kvbRR(.75, 1.05), vy: Math.sin(a) * sp * kvbRR(.75, 1.05) - 80, grav: 330, dur: 480, scale: sc || 1.3, layer: 't', shrink: true}); } };
  KVB_FX['solciju.wine'] = (x, y, r) => { const h = kvbHeroAt(x, y, 'solciju'); if(h) toward(h, {x, y}, 6, 'so_drop'); kvbDecal('so_splash', x, y, r, 780, {layer: 'g'}); kvbEmit('so_drop', 8, x, y, {ring: r * .5, v0: 30, v1: 110, up: 80, grav: 330, l0: 380, l1: 620, scale: 1.4, flat: .6}); };
  KVB_FX['solciju.cask'] = (x, y, r) => { kvbDecal('so_splash', x, y, 22, 520, {layer: 'g', alpha: .7}); };
  KVB_FX['solciju.toast'] = (x, y, r) => { kvbDecal('so_toast', x, y - 45, 38, 900, {layer: 't', prio: true}); kvbEmit('so_spark', 9, x, y - 30, {ring: 22, v0: 15, v1: 55, up: 40, l0: 420, l1: 700, scale: 1.2}); };
  KVB_FX['solciju.reserve'] = (x, y, r) => { const h = kvbHeroAt(x, y, 'solciju'); if(h) toward(h, {x, y}, 10, 'so_drop'); kvbDecal('so_splash', x, y, r, 960, {layer: 'g'}); kvbEmit('so_grape', 6, x, y, {ring: r * .5, v0: 30, v1: 90, up: 100, grav: 300, l0: 480, l1: 760, scale: 1.4, flat: .6, spin: 5}); };
  kvbBindQ5('sol_wine', 'solciju.wine'); kvbBindQ5('sol_cask', 'solciju.cask'); kvbBindQ5('sol_toast', 'solciju.toast'); kvbBindQ5('sol_reserve', 'solciju.reserve');

  // Barrica: cae al suelo, la mecha (arco) cuenta el tiempo REAL hasta que estalla y el anillo punteado es el radio de la explosión
  kvbSkin('sol_cask', {R: o => o.r, layers: ['g', 't'],
    born: o => { kvbPart('so_barrel', o.x, o.y - 70, {ay: 1, dur: 260, vy: 280, scale: 1.7, layer: 't', fadeAt: .99}); kvbEmit('so_drop', 4, o.x, o.y, {v0: 20, v1: 60, up: 40, grav: 300, l0: 320, l1: 480, scale: 1.2, delay: 0}); },
    end: o => { kvbDecal('so_fuse', o.x, o.y, o.r, 820, {layer: 'g'}); kvbEmit('so_stave', 8, o.x, o.y, {v0: 60, v1: 170, up: 120, grav: 380, spin: 9, l0: 460, l1: 760, scale: 1.5, flat: .6}); kvbEmit('so_drop', 14, o.x, o.y, {ring: o.r * .4, v0: 40, v1: 140, up: 110, grav: 340, l0: 420, l1: 700, scale: 1.4, flat: .6}); },
    draw: (o, t, layer, R) => {
      if(layer === 'g'){ const k = 1 - o.life / o.maxLife; // anillo punteado = radio real de la explosión; relleno que crece con la mecha (rejilla de píxel: pixel-stroke.js)
        pxsDisc(o.x, o.y, R * k, R * k, 'rgba(' + SOrgb + ',' + (.12 + .16 * k) + ')'); pxsRing(o.x, o.y, R, R, [[SO[0], 6.6], [SO[3], 2.2]], {dash: [3, 2, Math.floor(t / 260)]}); return; }
      if(o.maxLife - o.life < 260) return; const f = kvbMotif('so_barrel'); if(!f) return; const k = o.life / o.maxLife, shake = k < .3 ? Math.sin(t / 30) * 1.5 : 0;
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(f[0], o.x - 17 + shake, o.y - 34, 34, 38);
      pxsRing(o.x, o.y - 14, 24, 24, [[SO[0], 6.6], [k < .3 ? '#ffd2dc' : SO[3], 2.2]], {a0: -1.5708, a1: -1.5708 + 6.2832 * k}); ctx.restore(); }}, 'solciju');
  kvbSkin('sol_reserve', {R: o => o.r, loop: 'so_pool_idle', period: 2400,
    pulse: o => { kvbDecal('so_splash', o.x, o.y, o.r, 760, {layer: 'g', alpha: .9}); kvbEmit('so_drop', 8, o.x, o.y, {ring: o.r * .6, v0: 30, v1: 100, up: 90, grav: 320, l0: 400, l1: 660, scale: 1.4, flat: .6}); },
    end: o => { kvbEmit('so_drop', 8, o.x, o.y, {ring: o.r * .5, v0: 10, v1: 50, up: 30, grav: 200, l0: 400, l1: 640, scale: 1.3, flat: .6}); }}, 'solciju');
  kvbSkin('sol_lees', {R: o => o.r, loop: 'so_pool_idle', period: 2000, alpha: .7}, 'solciju');
  kvbBasic('solciju', SO, 'so_drop');
}
