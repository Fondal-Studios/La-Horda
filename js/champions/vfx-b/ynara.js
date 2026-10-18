'use strict';
/* Ynara, la Médica de los Refugios — luz rosa, vapor de estrofonof, cortina de agua y santuario con alas. Antes: salpicaduras blancas y solo los anillos de las zonas.
   Mirada fulminante (abanico de luz de 100 u × alcance real) · Estrogonof reparador (vapor, corazones y aro de la fuente) · No quiero seguir esta conversación (estela y cortina de agua)
   · Santa Paciencia (halo del santuario con pulso por cada ronda). Solo visual: las zonas conservan su aro real; se les suma arte propio. */
{
  const YN = ['#40182c', '#b04a78', '#ed8db5', '#fff0f7', '#ffffff'], WT = ['#10324a', '#3a86b8', '#7fd0f0', '#d6f4ff', '#ffffff'];
  kvbDefMotif('yn_heart', 7, 6, kvbBmp(['.rr.rr.', 'rhrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], {r: '#ed8db5', h: '#fff0f7'}));
  kvbDefMotif('yn_steam', 9, 8, (g, p) => { kvbDisc(g, p + 4.5, p + 4, 3, '#fff0f7'); kvbDisc(g, p + 2.5, p + 5, 2.2, '#ffffff'); kvbDisc(g, p + 6.5, p + 5, 2.2, '#ffffff'); kvbDisc(g, p + 4.5, p + 2.2, 1.8, '#ffffff'); }, '#b04a78');
  kvbDefMotif('yn_drop', 4, 6, kvbBmp(['.b..', 'bhb.', 'bbbb', 'bbbb', '.bb.'], {b: '#7fd0f0', h: '#ffffff'}));
  kvbDefMotif('yn_ray', 5, 5, kvbBmp(['..w..', '..w..', 'wwWww', '..w..', '..w..'], {w: '#fff0f7', W: '#ffffff'}));
  const gazeStreaks = (lg, c, R, front, q, half, pal) => { for(let k = -3; k <= 3; k++){ const a = k * half / 3.2, L = front * (.8 + .18 * kvbHash(k + 4, 5)), x1 = c + Math.cos(a) * L, y1 = c + Math.sin(a) * L; kvbLine(lg, c + Math.cos(a) * L * .1, c + Math.sin(a) * L * .1, x1, y1, pal[3], 2.4 - Math.abs(k) * .3); kvbLine(lg, c + Math.cos(a) * L * .25, c + Math.sin(a) * L * .25, x1, y1, pal[4], 1); kvbDisc(lg, x1, y1, 2, pal[4]); } };
  kvbDefDecal('yn_gaze', 10, kvbSectorPaint(YN, {fillCol: '#b04a78', streaks: gazeStreaks}));
  kvbDefDecal('yn_stew_idle', 12, kvbIdlePaint(YN, {fill: .12, fillCol: '#b04a78', dash: [5, 4], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 6; i++){ const a = q * 6.2832 + i * 1.047, x = c + Math.cos(a) * R * .76, y = c + Math.sin(a) * R * .76 - 2; kvbDisc(lg, x, y, 3, pal[3]); kvbDisc(lg, x - 1, y - 1, 1.4, pal[4]); } }}));
  kvbDefDecal('yn_stew', 10, kvbRingPaint(YN, {fillCol: '#b04a78', fill: .3, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 8; i++){ const a = i * .7854, x = c + Math.cos(a) * rad * .78, y = c + Math.sin(a) * rad * .78; kvbDisc(lg, x, y, 3, pal[3]); kvbDisc(lg, x - 1, y - 1, 1.2, pal[4]); } }, flash: '#fff0f7', rimThick: 3}));
  const halo = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 10; i++){ const a = i * .6283 + q * .6, L = rad * (i & 1 ? .68 : .86), nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * rad * .56, c + Math.sin(a) * rad * .56], [c + Math.cos(a) * L + nx * 1.2, c + Math.sin(a) * L + ny * 1.2], [c + Math.cos(a) * L - nx * 1.2, c + Math.sin(a) * L - ny * 1.2]], i & 1 ? pal[3] : pal[4]); } kvbCircle(lg, c, c, rad * .5, pal[2], 1.2); };
  kvbDefDecal('yn_halo_idle', 12, kvbIdlePaint(YN, {fill: .1, fillCol: '#b04a78', dash: [8, 5], details: halo}));
  kvbDefDecal('yn_pulse', 10, kvbRingPaint(YN, {fillCol: '#b04a78', fill: .3, details: halo, flash: '#fff0f7', rimThick: 3}));
  kvbDefBeam('yn_water', 8, 18, 16, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, half = Math.max(1, Math.round(m * (q < .2 ? .3 + 3 * q : .85 - .5 * post)));
    g.fillStyle = WT[0]; g.fillRect(0, m - half - 1, W, half * 2 + 2); g.fillStyle = WT[1]; g.fillRect(0, m - half, W, half * 2); g.fillStyle = WT[2]; g.fillRect(0, m - half + 1, W, 2);
    g.fillStyle = WT[4]; for(let x = (f * 3) % 8; x < W; x += 8) g.fillRect(x, m - 1 + ((x >> 2) & 1) * 2, 3, 1);
  });

  KVB_FX['ynara.gaze'] = (x, y, range, ang, half) => { kvbSectorFx('yn_gaze', x, y, range, ang, 580, {layer: 'g'}); kvbEmit('yn_ray', 8, x, y, {ang, spread: (half || .85) * 1.6, v0: range * .6, v1: range * 1.2, l0: 260, l1: 440, scale: 1.2, shrink: true}); kvbEmit('yn_heart', 3, x + Math.cos(ang) * range * .5, y + Math.sin(ang) * range * .5, {v0: 8, v1: 30, up: 40, l0: 420, l1: 700, scale: 1.2, jx: 20, jy: 16}); };
  KVB_FX['ynara.leave'] = (x, y, r, ang, len) => { const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len; kvbBeam('yn_water', x, y, ex, ey, Math.max(18, r * 1.6), 520, {layer: 'g', alpha: .85}); kvbEmit('yn_drop', 8, x, y, {ang, spread: 1.4, v0: 30, v1: 110, up: 30, grav: 260, l0: 340, l1: 560, scale: 1.3, shrink: true}); };
  kvbPortador('ynara', 'yn_gaze', (h, sk, u, sc) => ['ynara.gaze', h.x, h.y, sk.range * sc.AREA, Math.atan2(h.fy, h.fx), .85, 0]);
  kvbPortador('ynara', 'yn_leave', (h, sk, u, sc, aim, pre) => ['ynara.leave', pre.x, pre.y, (sk.radius || 32) * sc.AREA, Math.atan2(h.y - pre.y, h.x - pre.x), Math.hypot(h.x - pre.x, h.y - pre.y), 0]);

  // fuente de estrofonof: aro de la zona real + vapor y corazones que suben del plato
  kvbSkin('stroganoff', {R: o => o.r, loop: 'yn_stew_idle', period: 2200, layers: ['g', 't'], hideBase: false,
    born: o => { kvbDecal('yn_stew', o.x, o.y, o.r, 820, {layer: 'g'}); kvbEmit('yn_heart', 5, o.x, o.y, {ring: 16, v0: 6, v1: 24, up: 60, l0: 520, l1: 820, scale: 1.3, flat: .6}); },
    end: o => { kvbEmit('yn_steam', 5, o.x, o.y, {ring: o.r * .4, v0: 10, v1: 30, up: 30, l0: 420, l1: 640, scale: 1.4, flat: .6}); },
    draw: (o, t, layer) => { if(layer !== 't') return; const f = kvbMotif('yn_steam'), hf = kvbMotif('yn_heart'); if(!f) return; ctx.save(); ctx.imageSmoothingEnabled = false;
      for(let i = 0; i < 4; i++){ const u = ((t / 1600) + i / 4) % 1; ctx.globalAlpha = Math.min(1, u * 4, (1 - u) * 2) * .85; ctx.drawImage(f[0], o.x - 11 + Math.sin(u * 6 + i) * 7, o.y - 22 - u * 36, 22, 20); }
      if(hf){ const u = ((t / 2100) + .3) % 1; ctx.globalAlpha = Math.min(1, u * 4, (1 - u) * 2); ctx.drawImage(hf[0], o.x + 14 - 8 + Math.sin(u * 8) * 4, o.y - 26 - u * 40, 16, 14); } ctx.restore(); }}, 'ynara');
  // cortina de agua: la banda real (ancho 2r) con corriente y gotas
  kvbSkin('watercurtain', {R: o => o.r, layers: ['g', 't'], hideBase: false,
    draw: (o, t, layer) => { const len = Math.hypot(o.bx - o.x, o.by - o.y); if(len < 4) return; const a = Math.atan2(o.by - o.y, o.bx - o.x), k = Math.min(1, o.life / 500); ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(a);
      if(layer === 'g'){ ctx.globalAlpha = .3 * k; ctx.fillStyle = WT[1]; ctx.fillRect(0, -o.r, len, o.r * 2); ctx.globalAlpha = .9 * k; ctx.fillStyle = WT[0]; ctx.fillRect(0, -o.r - 1, len, 2); ctx.fillRect(0, o.r - 1, len, 2); ctx.fillStyle = WT[3]; for(let x = ((t / 40) % 16); x < len; x += 16) ctx.fillRect(x, -o.r + 2 + ((x >> 4) & 1) * (o.r * 1.2), 8, 2); }
      else { const f = kvbMotif('yn_drop'); if(f){ ctx.imageSmoothingEnabled = false; for(let i = 0; i < 6; i++){ const u = ((t / 900) + i / 6) % 1; ctx.globalAlpha = Math.min(1, u * 4, (1 - u) * 3) * k; ctx.drawImage(f[0], len * ((i * .173 + .08) % 1) - 5, -o.r + (i % 3) * o.r * .7 - 14 * u, 10, 14); } } }
      ctx.restore(); }}, 'ynara');
  // Santa Paciencia: halo que sigue a Ynara (radio real) y un pulso cada ronda (tick de 600 ms)
  kvbSkin('patience', {R: o => o.r, loop: 'yn_halo_idle', period: 2600, hideBase: false,
    born: o => { kvbDecal('yn_pulse', o.x, o.y, o.r, 900, {layer: 'g'}); },
    upd: (o, st) => { if(st.tick !== undefined && o.tick > st.tick + 300) kvbDecal('yn_pulse', o.x, o.y, o.r, 560, {layer: 'g', alpha: .6}); st.tick = o.tick; },
    end: o => { kvbDecal('yn_pulse', o.x, o.y, o.r, 900, {layer: 'g'}); kvbEmit('yn_heart', 8, o.x, o.y, {ring: o.r * .5, v0: 20, v1: 80, up: 60, l0: 520, l1: 900, scale: 1.4, flat: .7}); }}, 'ynara');
  kvbBasic('ynara', YN, 'yn_heart');
}
