'use strict';
/* Ismara, la Profeta Ciega — ojo del destino, hilos turquesa y relojes que rebobinan. Antes: anillos finos y chispas sin lectura (curas y escudos casi invisibles).
   Destino Restaurado (reloj que rebobina sobre el aliado curado) · Visión del Inmortal (burbuja sobre el aliado mientras dura la inmunidad) · Danza del Augurio (giro de hoja, aro de daño y aro de aturdimiento)
   · Ascensión del Elegido (hilo hasta el aliado fusionado y aura mientras dura). Solo visual. */
{
  const PF = ['#0d2f33', '#2a8f86', '#4fd8c4', '#bffff0', '#ffffff'];
  kvbDefMotif('pf_mote', 5, 5, kvbBmp(['..t..', '.tWt.', 'tWWWt', '.tWt.', '..t..'], {t: '#4fd8c4', W: '#ffffff'}));
  kvbDefMotif('pf_eye', 13, 7, kvbBmp(['.....ttt.....', '...ttwwwtt...', '.ttwwwiwwwtt.', 'ttwwwiIiwwwtt', '.ttwwwiwwwtt.', '...ttwwwtt...', '.....ttt.....'], {t: '#4fd8c4', w: '#eafff8', i: '#2a8f86', I: '#0d2f33'}));
  kvbDefMotif('pf_arrow', 7, 7, kvbBmp(['...tt..', '..ttt..', '.tttttt', 'ttt.ttt', '.tt..tt', '.t...t.', 't.....t'], {t: '#bffff0'}));
  kvbDefMotif('pf_clock', 11, 11, (g, p) => { kvbCircle(g, p + 5.5, p + 5.5, 4.6, '#bffff0', 1.6); kvbLine(g, p + 5.5, p + 5.5, p + 5.5, p + 2, '#ffffff', 1.3); kvbLine(g, p + 5.5, p + 5.5, p + 3, p + 6.5, '#4fd8c4', 1.3); kvbDisc(g, p + 5.5, p + 5.5, 1, '#ffffff'); });
  const clockDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 3; i++){ const a = -q * 8 + i * 2.0944; kvbArcLine(lg, c, c, rad * .78, a, a + 1.2, pal[3], 2); const ax = c + Math.cos(a) * rad * .78, ay = c + Math.sin(a) * rad * .78; kvbPoly(lg, [[ax, ay], [ax + Math.cos(a + 2.3) * 4, ay + Math.sin(a + 2.3) * 4], [ax + Math.cos(a - 2.3 + 3.14) * 4, ay + Math.sin(a - 2.3 + 3.14) * 4]], pal[4]); }
    kvbLine(lg, c, c, c + Math.cos(-q * 12 - 1.5) * rad * .5, c + Math.sin(-q * 12 - 1.5) * rad * .5, pal[4], 1.6); kvbLine(lg, c, c, c + Math.cos(-q * 4 - 1.5) * rad * .3, c + Math.sin(-q * 4 - 1.5) * rad * .3, pal[3], 2); };
  kvbDefDecal('pf_rewind', 10, kvbRingPaint(PF, {fillCol: '#2a8f86', fill: .34, details: clockDetails, flash: '#bffff0', rimThick: 3}));
  kvbDefDecal('pf_bubble_idle', 12, kvbIdlePaint(PF, {fill: .16, fillCol: '#2a8f86', dash: [10, 4], details: (lg, c, R, rad, pal, q) => { kvbArcLine(lg, c, c, R * .7, q * 6.2832, q * 6.2832 + 1.2, pal[4], 2); kvbArcLine(lg, c, c, R * .7, q * 6.2832 + 3.14, q * 6.2832 + 4.3, pal[3], 2); }}));
  const spinDetails = (lg, c, R, rad, pal, q) => { for(let i = 0; i < 3; i++){ const a = i * 2.0944 + q * 7; kvbArcLine(lg, c, c, rad * .72, a, a + 1.3, pal[0], 5); kvbArcLine(lg, c, c, rad * .72, a, a + 1.3, pal[3], 3); kvbArcLine(lg, c, c, rad * .72, a + .2, a + 1.1, pal[4], 1.2); } };
  kvbDefDecal('pf_spin', 10, kvbRingPaint(PF, {fillCol: '#2a8f86', fill: .32, details: spinDetails, flash: '#bffff0', rimThick: 3}));
  kvbDefDecal('pf_stun', 9, kvbRingPaint(PF, {fillCol: '#4fd8c4', fill: .28, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 6; i++){ const a = i * 1.047, x = c + Math.cos(a) * rad * .7, y = c + Math.sin(a) * rad * .7; kvbStar(lg, x, y, 3.4, 4, pal[4], .4); } }, flash: '#ffffff', rimThick: 2}));
  kvbDefDecal('pf_fuse_idle', 12, kvbIdlePaint(PF, {fill: .16, fillCol: '#2a8f86', dash: [6, 4], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 6; i++){ const a = q * 6.2832 + i * 1.047, x = c + Math.cos(a) * R * .75, y = c + Math.sin(a) * R * .75; kvbStar(lg, x, y, 3, 4, i & 1 ? pal[4] : pal[3], .4); } kvbCircle(lg, c, c, R * .5, pal[2], 1.2); }}));

  const heroNear = (x, y) => { let b = null, bd = 1e9; for(const h of heroes){ const d = Math.hypot(h.x - x, h.y - y); if(d < bd){ bd = d; b = h; } } return b; };
  KVB_FX['profeta.retro'] = (x, y, r) => { kvbDecal('pf_rewind', x, y, r, 820, {layer: 'g'}); kvbPart('pf_clock', x, y - 50, {dur: 880, scale: 2.2, layer: 't', vy: -16, spin: -4, fadeAt: .5}); kvbEmit('pf_mote', 8, x, y, {ring: r * .5, v0: 8, v1: 30, up: 70, l0: 460, l1: 820, scale: 1.2, flat: .7}); };
  KVB_FX['profeta.immune'] = (x, y, r, ang, ms) => { const h = heroNear(x, y); kvbDecal('pf_rewind', x, y, 40, 560, {layer: 'g', alpha: .8}); if(h) kvbDecal('pf_bubble_idle', h.x, h.y + 4, 38, ms || 2400, {follow: h, ofy: 4, layer: 'g', loop: true, fps: 8, alpha: .9, fadeAt: .86}); kvbPart('pf_eye', x, y - 56, {dur: 700, scale: 1.6, layer: 't', vy: -12, fadeAt: .5}); };
  KVB_FX['profeta.spin'] = (x, y, R, ang, ri) => { kvbDecal('pf_spin', x, y, R, 760, {layer: 'g'}); if(ri) kvbDecal('pf_stun', x, y, ri, 620, {layer: 'g'}); kvbEmit('pf_mote', 10, x, y, {ring: R * .7, v0: 20, v1: 80, l0: 300, l1: 520, scale: 1.2, flat: .7, shrink: true}); };
  KVB_FX['profeta.fusion'] = (x, y, r, ang, ms) => { const h = heroNear(x, y);
    kvbDecal('pf_rewind', x, y, 50, 700, {layer: 'g'}); kvbPart('pf_eye', x, y - 64, {dur: 900, scale: 2, layer: 't', vy: -10, fadeAt: .5});
    if(h){ kvbDecal('pf_fuse_idle', h.x, h.y + 4, 40, ms || 7000, {follow: h, ofy: 4, layer: 'g', loop: true, fps: 8, alpha: .9, fadeAt: .92}); kvbEmit('pf_mote', 10, h.x, h.y - 10, {ring: 20, v0: 10, v1: 50, up: 80, l0: 520, l1: 900, scale: 1.3, flat: .7}); } };
  kvbClassic('profeta', 'retro_heal', (c, sk, u, sc, aim, pre, snap) => { let t = null, lo = 1; heroes.forEach((h, i) => { const r = (snap.hpRatio[i] === undefined ? 1 : snap.hpRatio[i]); if(h.alive && r < lo){ lo = r; t = h; } }); t = t || c; return ['profeta.retro', t.x, t.y, 56, 0, 0, 0]; });
  kvbClassic('profeta', 'brief_immunity', (c, sk, u, sc) => { let t = null, bd = sk.range || 260; for(const h of heroes){ if(h === c || !h.alive) continue; const d = Math.hypot(h.x - (c.x), h.y - c.y); if(d <= bd){ bd = d; t = h; } } t = t || c; return ['profeta.immune', t.x, t.y, 44, 0, sk.duration * sc.DUR, 0]; });
  kvbClassic('profeta', 'self_spin_stun', (c, sk, u, sc) => ['profeta.spin', c.x, c.y, sk.radius * sc.AREA, 0, sk.innerR * sc.AREA, 0]);
  kvbClassic('profeta', 'ascension_fusion', (c, sk, u, sc) => { let t = null, bd = 1e9; for(const h of heroes){ if(h === c || !h.alive) continue; const d = Math.hypot(h.x - c.x, h.y - c.y); if(d < bd){ bd = d; t = h; } } t = t || c; return ['profeta.fusion', t.x, t.y, 50, 0, sk.duration * sc.DUR, 0]; });
  kvbBasic('profeta', PF, 'pf_mote');
}
