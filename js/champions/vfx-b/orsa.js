'use strict';
/* Orsa, la Guardacables — cables, rayos de cobre y pernos. Antes: 'fxBolt' (el mismo rayo para todos) y chispas amarillas.
   Perno conductor (línea) · Apoyar la culata (postura, ancla con tornillos) · Cerrar el circuito (anillo de circuito) · Tormenta de rescate (nube + 3 barridos + descarga). Solo visual. */
{
  const OR = ['#3a1e08', '#a05a1e', '#dfa352', '#ffe08a', '#fff9d6'];
  kvbDefMotif('or_spark', 7, 7, kvbBmp(['...y...', '..yoy..', '.yooyy.', 'yooWooy', '.yooyy.', '..yoy..', '...y...'], {y: '#ffe08a', o: '#dfa352', W: '#ffffff'}));
  kvbDefMotif('or_rivet', 5, 5, kvbBmp(['.ooo.', 'ollho', 'olhho', 'ohhho', '.ooo.'], {o: '#a05a1e', l: '#ffe08a', h: '#dfa352'}));
  kvbDefBeam('or_bolt', 8, 24, 20, (g, q, W, H, f) => {
    const m = H / 2, post = q < .5 ? 0 : (q - .5) / .5, amp = Math.max(1, Math.round(5 * (q < .2 ? q * 5 : 1 - .6 * post))), th = Math.max(1, Math.round(3.4 * (1 - .6 * post)));
    const pts = []; for(let x = 0; x <= W; x += 4) pts.push([x, m + (x === 0 || x === W ? 0 : (kvbHash(x + f * 13, 5) - .5) * 2 * amp)]);
    for(const [col, w] of [[OR[0], th + 3], [OR[2], th + 1], [OR[3], th], [OR[4], Math.max(1, th - 2)]]){ g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for(const p of pts) g.lineTo(p[0], p[1]); g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'miter'; g.stroke(); }
    if(kvbHash(f, 9) > .45){ const bx = 6 + kvbHash(f, 2) * 12, by = m + (kvbHash(f, 4) > .5 ? 1 : -1) * amp; kvbLine(g, bx, m, bx + 3, by + (by > m ? 4 : -4), OR[3], 1.4); }
  });
  const circuit = (lg, c, R, rad, pal, q) => {
    for(let i = 0; i < 6; i++){ const a = i * 1.047 + .52, x = c + Math.cos(a) * rad * .8, y = c + Math.sin(a) * rad * .8; kvbLine(lg, c + Math.cos(a) * rad * .22, c + Math.sin(a) * rad * .22, x, y, pal[3], 1.6); kvbDisc(lg, x, y, 3, pal[2]); kvbDisc(lg, x, y, 1.4, pal[4]); }
    kvbCircle(lg, c, c, rad * .22, pal[3], 1.6); kvbCircle(lg, c, c, rad * .55, pal[2], 1);
  };
  kvbDefDecal('or_circuit', 10, kvbRingPaint(OR, {fillCol: '#a05a1e', core: '#dfa352', fill: .42, details: circuit, flash: '#ffe08a', rimThick: 3}));
  kvbDefDecal('or_anchor', 10, kvbRingPaint(OR, {fillCol: '#a05a1e', fill: .3, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 4; i++){ const a = i * 1.5708 + .785, x = c + Math.cos(a) * rad * .72, y = c + Math.sin(a) * rad * .72; kvbDisc(lg, x, y, 2.6, pal[2]); kvbDisc(lg, x, y, 1, pal[4]); kvbLine(lg, c, c, x, y, pal[1], 1.4); } }}));
  kvbDefDecal('or_anchor_idle', 12, kvbIdlePaint(OR, {fill: .12, fillCol: '#a05a1e', dash: [4, 3], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 4; i++){ const a = i * 1.5708 + .785, x = c + Math.cos(a) * R * .75, y = c + Math.sin(a) * R * .75; kvbDisc(lg, x, y, 2.4, pal[2]); if(kvbHash(Math.floor(q * 12), i) > .55) kvbLine(lg, x, y, c + (x - c) * .45, c + (y - c) * .45, pal[4], 1); } }}));
  kvbDefDecal('or_storm_idle', 12, kvbIdlePaint(OR, {fill: .12, fillCol: '#a05a1e', dash: [8, 5], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 5; i++){ const a = q * 6.2832 * (i & 1 ? -1 : 1) + i * 1.2566, x = c + Math.cos(a) * R * .8, y = c + Math.sin(a) * R * .8; kvbLine(lg, x, y, x + Math.cos(a + 1.2) * 5, y + Math.sin(a + 1.2) * 5, pal[3], 1.6); kvbDisc(lg, x, y, 1.5, pal[4]); } kvbCircle(lg, c, c, R * .5, pal[1], 1); }}));
  kvbDefDecal('or_sweep', 10, kvbSectorPaint(OR, {fillCol: '#a05a1e', streaks: (lg, c, R, front, q, half, pal) => { for(let k = -2; k <= 2; k++){ const a = k * half / 2.6; lg.beginPath(); lg.moveTo(c, c); for(let s = 1; s <= 6; s++){ const u = s / 6, j = (kvbHash(k + 9, s) - .5) * 8; lg.lineTo(c + Math.cos(a) * front * .95 * u - Math.sin(a) * j, c + Math.sin(a) * front * .95 * u + Math.cos(a) * j); } lg.strokeStyle = pal[3]; lg.lineWidth = 1.6; lg.stroke(); } }}));

  KVB_FX['orsa.pierce'] = (x, y, r, ang, len) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('or_bolt', x, y, ex, ey, Math.max(22, r * 1.7), 440, {layer: 't'});
    kvbEmit('or_spark', 4, ex, ey, {v0: 20, v1: 90, l0: 260, l1: 420, scale: 1.4, shrink: true});
    kvbEmit('or_spark', 3, x, y, {ang, spread: .8, v0: 30, v1: 90, l0: 240, l1: 380, scale: 1.1, shrink: true});
  };
  KVB_FX['orsa.brace'] = (x, y, r) => {
    kvbDecal('or_anchor', x, y, 42, 720, {layer: 'g'});
    kvbEmit('or_rivet', 6, x, y, {ring: 30, v0: 30, v1: 80, up: 60, grav: 280, l0: 360, l1: 560, scale: 1.4, spin: 6, flat: .6});
  };
  // golpe en área garantizado = 0,7·r; la descarga a objetivos marcados alcanza r (anillo punteado = ese borde real)
  KVB_FX['orsa.discharge'] = (x, y, r) => {
    kvbDecal('or_circuit', x, y, r * .7, 760, {layer: 'g'});
    kvbDecal('or_storm_idle', x, y, r, 600, {layer: 'g', alpha: .75, loop: true, fps: 12});
    for(let i = 0; i < 6; i++){ const a = i * 1.047 + .5; kvbBeam('or_bolt', x + Math.cos(a) * 14, y + Math.sin(a) * 14, x + Math.cos(a) * r * .7, y + Math.sin(a) * r * .7, 14, 380, {layer: 't', alpha: .85}); }
    kvbEmit('or_spark', 8, x, y, {ring: r * .6, v0: 30, v1: 100, l0: 280, l1: 460, scale: 1.3, flat: .7, shrink: true});
  };
  KVB_FX['orsa.storm'] = (x, y, r) => { kvbEmit('or_spark', 10, x, y, {ring: r * .3, v0: 40, v1: 140, up: 40, l0: 300, l1: 520, scale: 1.4, flat: .7, shrink: true}); };
  kvbBind('ex:pierce', 'orsa.pierce'); kvbBind('ex:brace', 'orsa.brace'); kvbBind('ex:discharge', 'orsa.discharge'); kvbBind('ex:storm', 'orsa.storm');

  kvbSkin('ex_storm', {R: o => o.r, loop: 'or_storm_idle', period: 1700,
    pulse: o => { const h = o.owner; if(o.left > 0){ const ang = Math.atan2(h.fy || 0, h.fx || 1), rg = o.range || 280; kvbSectorFx('or_sweep', h.x, h.y, rg, ang, 560, {layer: 'g'}); for(let i = -2; i <= 2; i++) kvbBeam('or_bolt', h.x, h.y, h.x + Math.cos(ang + i * .33) * rg * .9, h.y + Math.sin(ang + i * .33) * rg * .9, 14, 380, {layer: 't', alpha: .8}); }
      else { kvbDecal('or_circuit', o.x, o.y, o.r, 820, {layer: 'g'}); kvbEmit('or_spark', 14, o.x, o.y, {ring: o.r * .6, v0: 50, v1: 160, up: 30, l0: 320, l1: 560, scale: 1.5, flat: .7, shrink: true}); } } }, 'orsa');
  // postura de apoyo: ancla viva mientras dura (braceUntil) con un perno por cada disparo reforzado que queda
  kvbOverlay('orsa', (h, layer, t) => { const s = h.exState; if(layer !== 'g' || !s || !(s.braceUntil > runElapsedMs)) return; kvbLoopDecal('or_anchor_idle', h.x, h.y + 4, 38, t, 900, {alpha: .95});
    for(let i = 0; i < (s.shots || 0); i++){ ctx.fillStyle = OR[3]; ctx.strokeStyle = OR[0]; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(h.x - 12 + i * 12, h.y - 70, 3.5, 0, 6.2832); ctx.fill(); ctx.stroke(); } });
  kvbBasic('orsa', OR, 'or_spark');
}
