'use strict';
/* Sira, la Cartógrafa del Regreso — tinta, mapas y brújula. Antes: runas heladas (tema 'rune' = fxFrostRune) y una línea finita con un muñequito.
   Línea de tinta (trazo) · Volver sobre los pasos (rebobinado por el trazo) · Borrar el camino (goma sobre la ruta) · Atlas de los ausentes (mapa con 3 pulsos).
   El rastro que va dejando al caminar (su ruta real, la que consume Borrar el camino) se dibuja como huellas de tinta. Solo visual. */
{
  const SI = ['#101a33', '#3b5a9a', '#8aa7da', '#cfe0ff', '#ffffff'], INK = '#1c2a52', PARCH = '#e8d9b0', PARCH_D = '#a8946a';
  kvbDefMotif('si_blot', 5, 6, kvbBmp(['..b..', '.bbb.', 'bbbbb', 'bbhbb', '.bbb.', '..b..'], {b: '#2a3f7a', h: '#8aa7da'}));
  kvbDefMotif('si_x', 7, 7, kvbBmp(['x.....x', '.x...x.', '..x.x..', '...x...', '..x.x..', '.x...x.', 'x.....x'], {x: '#c4543a'}));
  kvbDefMotif('si_chev', 8, 9, kvbBmp(['cc......', '.cc.....', '..cc....', '...cc...', '....cc..', '...cc...', '..cc....', '.cc.....', 'cc......'], {c: '#cfe0ff'}));
  kvbDefMotif('si_compass', 15, 15, (g, p) => { const c = p + 7.5; kvbCircle(g, c, c, 6, PARCH_D, 1.4); kvbPoly(g, [[c, c - 7], [c + 2, c], [c, c + 7], [c - 2, c]], '#cfe0ff'); kvbPoly(g, [[c - 7, c], [c, c - 2], [c + 7, c], [c, c + 2]], '#8aa7da'); kvbPoly(g, [[c, c - 7], [c + 1.5, c - 1], [c - 1.5, c - 1]], '#c4543a'); kvbDisc(g, c, c, 1.3, '#ffffff'); });
  kvbDefMotif('si_scrap', 4, 4, kvbBmp(['.pp.', 'pppp', 'pdpp', '.pp.'], {p: '#e8d9b0', d: '#a8946a'}));

  kvbDefBeam('si_ink', 8, 22, 18, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, half = Math.max(1, Math.round(m * (q < .18 ? .3 + 3.8 * q : .78 - .5 * post)));
    g.fillStyle = SI[4]; g.fillRect(0, m - half - 2, W, half * 2 + 4); g.fillStyle = INK; g.fillRect(0, m - half - 1, W, half * 2 + 2);
    g.fillStyle = '#2a3f7a'; g.fillRect(0, m - half, W, half * 2); g.fillStyle = SI[2]; for(let x = 0; x < W; x += 3){ if(kvbHash(x + f, 3) > .35) g.fillRect(x, m - half, 2, 1); }
    g.fillStyle = INK; for(let x = 2; x < W; x += 7){ const b = kvbHash(x, 9) > .5 ? 1 : -1; g.fillRect(x, m + b * (half + 1), 3, 1); }
  });
  kvbDefBeam('si_rewind', 8, 20, 12, (g, q, W, H, f) => { const m = H / 2; g.fillStyle = SI[1]; g.fillRect(0, m - 2, W, 4); g.fillStyle = SI[3]; for(let x = (W - (f * 4) % W) % W; x < W + 6; x += 10){ g.fillRect(x - 2, m - 1, 5, 2); } g.fillStyle = SI[0]; g.fillRect(0, m - 3, W, 1); g.fillRect(0, m + 2, W, 1); });
  const mapDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 8; i++){ const a = i * .7854, x = c + Math.cos(a) * rad * .84, y = c + Math.sin(a) * rad * .84; kvbLine(lg, x - 2, y - 2, x + 2, y + 2, '#c4543a', 1.3); kvbLine(lg, x + 2, y - 2, x - 2, y + 2, '#c4543a', 1.3); } kvbCircle(lg, c, c, rad * .55, pal[3], 1); kvbPoly(lg, [[c, c - rad * .4], [c + 3, c], [c, c + rad * .4], [c - 3, c]], PARCH); kvbPoly(lg, [[c - rad * .4, c], [c, c - 3], [c + rad * .4, c], [c, c + 3]], pal[3]); };
  kvbDefDecal('si_erase', 10, kvbRingPaint(SI, {fillCol: '#a8946a', fill: .4, details: mapDetails, flash: '#e8d9b0'}));
  kvbDefDecal('si_atlas', 10, kvbRingPaint(SI, {fillCol: '#3b5a9a', fill: .35, details: mapDetails, flash: '#cfe0ff', rimThick: 3}));
  kvbDefDecal('si_atlas_idle', 12, kvbIdlePaint(SI, {fill: .1, fillCol: '#3b5a9a', dash: [8, 5], details: (lg, c, R, rad, pal, q) => { kvbCircle(lg, c, c, R * .6, pal[2], 1); const a = q * 6.2832; kvbPoly(lg, [[c + Math.cos(a) * R * .55, c + Math.sin(a) * R * .55], [c + Math.cos(a + 2.5) * 4, c + Math.sin(a + 2.5) * 4], [c + Math.cos(a - 2.5) * 4, c + Math.sin(a - 2.5) * 4]], pal[3]); }}));

  const routeOf = h => (h && h.exState && h.exState.route) || [];
  KVB_FX['sira.ink_line'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('si_ink', x, y, ex, ey, Math.max(18, r * 1.8), 760, {layer: 'g'});
    kvbEmit('si_blot', 7, ex, ey, {ang, spread: 1.6, v0: 40, v1: 120, up: 30, grav: 220, l0: 360, l1: 560, scale: 1.3, shrink: true});
    kvbEmit('si_blot', 5, x, y, {spread: 1.8, ang, v0: 20, v1: 70, up: 20, grav: 200, l0: 300, l1: 460, scale: 1.1, shrink: true});
    for(let i = 1; i < 5; i++){ const u = i / 5; kvbPart('si_x', x + (ex - x) * u + kvbRR(-8, 8), y + (ey - y) * u + kvbRR(-8, 8), {dur: 600, scale: 1, layer: 'g', alpha: .8}); }
  };
  KVB_FX['sira.retrace'] = (x, y, r, ang, ox, oy) => { // desde donde estaba (ox, oy) hasta donde queda (x, y)
    if(ox !== undefined && Math.hypot(ox - x, oy - y) > 8){ kvbBeam('si_rewind', ox, oy, x, y, 16, 520, {layer: 'g'}); const L = Math.hypot(x - ox, y - oy), a = Math.atan2(y - oy, x - ox); for(let i = 0; i < 5; i++){ const u = (i + .5) / 5; kvbPart('si_chev', ox + (x - ox) * u, oy + (y - oy) * u, {rot: a, vx: Math.cos(a) * 80, vy: Math.sin(a) * 80, dur: 460, scale: 1.2, layer: 't', shrink: true}); } }
    kvbPart('si_compass', x, y - 8, {dur: 620, scale: 1.7, layer: 't', vy: -22, fadeAt: .45});
    kvbEmit('si_scrap', 6, x, y, {v0: 20, v1: 70, up: 40, grav: 120, l0: 360, l1: 560, scale: 1.3, spin: 6});
  };
  KVB_FX['sira.erase'] = (x, y, r) => {
    const h = kvbHeroAt(x, y, 'sira'), s = h && kvbHS(h), rt = s && s.routeCopy && s.routeCopy.length > 1 ? s.routeCopy : null;
    if(rt){ for(let i = 1; i < rt.length; i++) kvbBeam('si_rewind', rt[i - 1].x, rt[i - 1].y, rt[i].x, rt[i].y, Math.max(16, r * 1.6), 520, {layer: 'g', alpha: .9, add: false});
      for(const p of rt) kvbEmit('si_scrap', 1, p.x, p.y, {v0: 20, v1: 60, up: 40, grav: 120, l0: 340, l1: 520, scale: 1.3, spin: 6}); s.routeCopy = []; }
    else { kvbDecal('si_erase', x, y, 80, 760, {layer: 'g'}); kvbEmit('si_scrap', 8, x, y, {ring: 60, v0: 20, v1: 70, up: 40, grav: 120, l0: 360, l1: 560, scale: 1.3, spin: 6, flat: .7}); }
  };
  KVB_FX['sira.atlas'] = (x, y, r) => { kvbPart('si_compass', x, y - 20, {dur: 900, scale: 2.4, layer: 't', vy: -16, fadeAt: .5}); };
  kvbBind('ex:ink_line', 'sira.ink_line'); kvbBind('ex:retrace', 'sira.retrace'); kvbBind('ex:erase', 'sira.erase'); kvbBind('ex:atlas', 'sira.atlas');

  // Atlas: copia de la ruta sobre el suelo (banda de pergamino con hilo punteado y cruces) + 3 pulsos
  kvbSkin('ex_atlas', {R: o => o.r + 30, hideBase: true,
    pulse: o => { const p = o.points || []; for(let i = 0; i < p.length; i += 2) kvbDecal('si_atlas', p[i].x, p[i].y, Math.max(26, o.r * 1.5), 560, {layer: 'g', alpha: .85}); kvbEmit('si_scrap', 6, o.owner.x, o.owner.y, {v0: 40, v1: 110, up: 40, grav: 100, l0: 360, l1: 620, scale: 1.4, spin: 6}); },
    draw: (o, t) => { const p = o.points || []; if(p.length < 2) return; const k = Math.min(1, o.life / 500, (o.maxLife - o.life) / 250 + .15);
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = .22 * k; ctx.strokeStyle = PARCH; ctx.lineWidth = o.r * 2; ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for(const q of p) ctx.lineTo(q.x, q.y); ctx.stroke();
      ctx.globalAlpha = .9 * k; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t / 60; ctx.strokeStyle = '#101a33'; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
      for(const q of p){ ctx.strokeStyle = '#c4543a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(q.x - 4, q.y - 4); ctx.lineTo(q.x + 4, q.y + 4); ctx.moveTo(q.x + 4, q.y - 4); ctx.lineTo(q.x - 4, q.y + 4); ctx.stroke(); }
      const cf = kvbMotif('si_compass'); if(cf){ ctx.imageSmoothingEnabled = false; ctx.globalAlpha = k; ctx.drawImage(cf[0], o.owner.x - 17, o.owner.y - 70, 34, 34); } ctx.restore(); }}, 'sira');
  // El rastro real (su ruta de los últimos 4 s) como huellas de tinta que se desvanecen; se guarda una copia para Borrar el camino
  kvbOverlay('sira', (h, layer, t) => {
    if(layer !== 'g') return; const rt = routeOf(h); if(rt.length < 2) return; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for(let i = 1; i < rt.length; i++){ const age = runElapsedMs - rt[i].at, k = Math.max(.15, 1 - age / 4200); ctx.globalAlpha = .75 * k; ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(rt[i - 1].x, rt[i - 1].y); ctx.lineTo(rt[i].x, rt[i].y); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.fillStyle = '#8aa7da'; for(const p of rt){ ctx.globalAlpha = .9; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); } ctx.restore();
  }, (h, dt) => { const rt = routeOf(h); if(rt.length) kvbHS(h).routeCopy = rt.map(p => ({x: p.x, y: p.y})); });
}
