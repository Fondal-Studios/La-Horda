'use strict';
/* Aldric, el Último Bastión — acero azul, chispas de escudo y estandarte. Antes: anillos de partículas y un "destello" genérico sin silueta propia.
   Torbellino (aro de hojas con el radio y la duración REALES del giro) · Embestida (estela de velocidad + impacto de escudo) · Grito de Guerra (ondas de voz + estandarte)
   · Grito Provocador (aro de provocación y marca "!" sobre cada enemigo provocado mientras dure su temporizador). Solo visual. */
{
  const AL = ['#14213a', '#2f5a96', '#5f8fc4', '#a9cdf0', '#f2fbff'], RD = ['#3a0f0a', '#a8321e', '#ff5a3d', '#ffb08a', '#fff1e6'];
  kvbDefMotif('al_spark', 5, 5, kvbBmp(['..w..', '.wcw.', 'wcWcw', '.wcw.', '..w..'], {w: '#a9cdf0', c: '#f2fbff', W: '#ffffff'}));
  kvbDefMotif('al_dust', 9, 7, (g, p) => { kvbDisc(g, p + 4.5, p + 3.5, 3, '#9aa7b8'); kvbDisc(g, p + 2.5, p + 4, 2.2, '#c9d3e0'); kvbDisc(g, p + 6.5, p + 4, 2.2, '#c9d3e0'); }, '#4a5870');
  kvbDefMotif('al_blade', 11, 5, kvbBmp(['..........w', '......wwwcw', '..wwwcccw..', 'wwcccwww...', 'wwww.......'], {w: '#a9cdf0', c: '#f2fbff'}));
  kvbDefMotif('al_shield', 9, 11, kvbBmp(['sssssssss', 'sbbbbbbbs', 'sbbWWWbbs', 'sbbWbbbbs', 'sbbWWbbbs', 'sbbWbbbbs', '.sbbbbbs.', '.sbbbbbs.', '..sbbbs..', '...sbs...', '....s....'], {s: '#a9cdf0', b: '#2f5a96', W: '#ffd34d'}));
  kvbDefMotif('al_excl', 5, 11, kvbBmp(['.rrr.', '.rwr.', '.rwr.', '.rwr.', '.rwr.', '.rwr.', '..r..', '.....', '..r..', '.rwr.', '..r..'], {r: '#ff5a3d', w: '#fff1e6'}));
  kvbDefMotif('al_chev', 9, 6, kvbBmp(['....y....', '...yYy...', '..yYyYy..', '.yYy.yYy.', 'yYy...yYy', 'yy.....yy'], {y: '#ffd34d', Y: '#fff0b8'}));
  const spinDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 4; i++){ const a = i * 1.5708 + q * 5; kvbArcLine(lg, c, c, rad * .72, a, a + 1.0, pal[0], 5); kvbArcLine(lg, c, c, rad * .72, a, a + 1.0, pal[3], 3); kvbArcLine(lg, c, c, rad * .72, a + .2, a + .9, pal[4], 1.4); } };
  kvbDefDecal('al_spin', 10, kvbRingPaint(AL, {fillCol: '#2f5a96', fill: .34, details: spinDetails, flash: '#a9cdf0', rimThick: 3}));
  kvbDefDecal('al_spin_idle', 12, kvbIdlePaint(AL, {fill: .12, fillCol: '#2f5a96', dash: [8, 5], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 4; i++){ const a = i * 1.5708 + q * 6.2832 * 2; kvbArcLine(lg, c, c, R * .8, a, a + 1.0, pal[0], 5); kvbArcLine(lg, c, c, R * .8, a, a + 1.0, pal[3], 3); kvbArcLine(lg, c, c, R * .8, a + .25, a + .9, pal[4], 1.4); } }}));
  kvbDefDecal('al_shout', 9, kvbRingPaint(AL, {fillCol: '#2f5a96', fill: .3, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 3; i++) kvbCircle(lg, c, c, rad * (.35 + i * .22), i & 1 ? pal[3] : pal[4], 1.6); }, flash: '#f2fbff', rimThick: 2}));
  kvbDefDecal('al_banner_idle', 12, kvbIdlePaint(AL, {fill: .12, fillCol: '#2f5a96', dash: [5, 3], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 4; i++){ const a = q * 6.2832 + i * 1.5708, x = c + Math.cos(a) * R * .78, y = c + Math.sin(a) * R * .78; kvbPoly(lg, [[x, y - 4], [x + 4, y + 2], [x, y], [x - 4, y + 2]], '#ffd34d'); } }}));
  const tauntDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 10; i++){ const a = i * .628, d = rad * .88, x = c + Math.cos(a) * d, y = c + Math.sin(a) * d, ix = c + Math.cos(a) * rad * .62, iy = c + Math.sin(a) * rad * .62; kvbLine(lg, x, y, ix, iy, pal[3], 2); kvbPoly(lg, [[ix, iy], [ix + Math.cos(a + 2.5) * 4, iy + Math.sin(a + 2.5) * 4], [ix + Math.cos(a - 2.5) * 4, iy + Math.sin(a - 2.5) * 4]], pal[4]); } kvbCircle(lg, c, c, rad * .4, pal[2], 1.4); };
  kvbDefDecal('al_taunt', 10, kvbRingPaint(RD, {fillCol: '#a8321e', core: '#ff5a3d', fill: .36, details: tauntDetails, flash: '#ffb08a', rimThick: 4}));
  kvbDefDecal('al_taunt_idle', 12, kvbIdlePaint(RD, {fill: .14, fillCol: '#a8321e', dash: [6, 4], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 6; i++){ const a = q * 6.2832 + i * 1.047, x = c + Math.cos(a) * R * .78, y = c + Math.sin(a) * R * .78; kvbPoly(lg, [[x, y - 4], [x + 3, y + 3], [x - 3, y + 3]], pal[3]); } }}));
  kvbDefBeam('al_charge', 8, 20, 18, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, k = q < .15 ? q / .15 : 1 - .6 * post; g.fillStyle = AL[0];
    for(const dy of [-5, 0, 5]){ const L = Math.round(W * (dy ? .7 : 1) * k), y = m + dy * k; g.fillStyle = AL[1]; g.fillRect(W - L, y - 2, L, 4); g.fillStyle = AL[3]; g.fillRect(W - L, y - 1, L, 2); g.fillStyle = AL[4]; g.fillRect(W - Math.round(L * .6), y, Math.round(L * .6), 1); }
  });

  KVB_FX['aldric.spin'] = (x, y, r) => { kvbDecal('al_spin', x, y, r, 700, {layer: 'g'}); kvbEmit('al_spark', 8, x, y, {ring: r * .8, v0: 30, v1: 110, l0: 260, l1: 440, scale: 1.2, flat: .7, shrink: true}); };
  KVB_FX['aldric.charge'] = (x, y, w, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('al_charge', x, y, ex, ey, 38, 520, {layer: 'g'}); kvbEmit('al_dust', 5, x, y, {ang: ang + 3.14, spread: 1.2, v0: 30, v1: 90, up: 15, l0: 380, l1: 560, scale: 1.4});
    kvbDecal('al_shout', ex, ey, 34, 480, {layer: 'g'}); kvbPart('al_shield', ex, ey - 30, {dur: 520, scale: 1.8, layer: 't', vy: -20, fadeAt: .5}); kvbEmit('al_spark', 7, ex, ey, {v0: 40, v1: 130, up: 30, l0: 240, l1: 420, scale: 1.3, shrink: true});
  };
  KVB_FX['aldric.warcry'] = (x, y, r) => { kvbDecal('al_shout', x, y, r, 820, {layer: 'g'}); kvbEmit('al_chev', 5, x, y, {ring: 18, v0: 5, v1: 20, up: 70, l0: 520, l1: 800, scale: 1.3, flat: .6}); kvbPart('al_shield', x, y - 54, {dur: 800, scale: 1.7, layer: 't', vy: -16, fadeAt: .5}); };
  KVB_FX['aldric.taunt'] = (x, y, r) => { kvbDecal('al_taunt', x, y, r, 980, {layer: 'g'}); kvbEmit('al_spark', 12, x, y, {ring: r * .5, v0: 30, v1: 140, up: 40, l0: 300, l1: 520, scale: 1.4, flat: .7, shrink: true}); kvbPart('al_excl', x, y - 64, {dur: 900, scale: 2.4, layer: 't', vy: -12, fadeAt: .5}); };

  kvbClassic('tanque', 'spin_channel', (c, sk, u, sc) => ['aldric.spin', c.x, c.y, c.spinRadius || sk.radius * sc.AREA, 0, 0, 0]);
  kvbClassic('tanque', 'charge_drag', (c, sk, u, sc, aim, pre) => { const d = Math.hypot(c.x - pre.x, c.y - pre.y); return ['aldric.charge', pre.x, pre.y, 26, Math.atan2(c.y - pre.y, c.x - pre.x), d, 0]; });
  kvbClassic('tanque', 'war_cry', (c, sk, u, sc) => ['aldric.warcry', c.x, c.y, 70, 0, 0, 0]);
  kvbClassic('tanque', 'taunt_provoke', (c, sk, u, sc) => ['aldric.taunt', c.x, c.y, sk.radius * sc.AREA, 0, 0, 0]);
  // estados reales: el aro del giro (spinRadius, spinTimer), el estandarte del grito (growTimer) y el aura roja de la provocación (colossalTimer + tauntTimer de cada enemigo)
  kvbOverlay('tanque', (h, layer, t) => {
    if(layer === 'g'){
      if(h.spinTimer > 0 && h.spinRadius > 0) kvbLoopDecal('al_spin_idle', h.x, h.y, h.spinRadius, t, 600, {alpha: Math.min(1, h.spinTimer / 300) * .95});
      if(h.growTimer > 0 && !(h.colossalTimer > 0)) kvbLoopDecal('al_banner_idle', h.x, h.y + 4, 36, t, 1500, {alpha: Math.min(1, h.growTimer / 400) * .95});
      if(h.colossalTimer > 0) kvbLoopDecal('al_taunt_idle', h.x, h.y + 4, 58, t, 1600, {alpha: Math.min(1, h.colossalTimer / 400) * .95});
    } else if(h.colossalTimer > 0){
      const f = kvbMotif('al_excl'); if(!f) return; let n = 0; ctx.save(); ctx.imageSmoothingEnabled = false;
      for(const e of enemies){ if(n >= 24) break; if(!e.alive || e.tauntedBy !== h || !(e.tauntTimer > 0) || !inView(e.x, e.y, 30)) continue; n++; const bob = Math.sin(t / 140 + e.x) * 2; ctx.globalAlpha = Math.min(1, e.tauntTimer / 300); ctx.drawImage(f[0], e.x - 6, e.y - (e.radius || 16) - 28 + bob, 12, 26); }
      ctx.restore();
    }
  });
  kvbBasic('tanque', AL, 'al_spark');
}
