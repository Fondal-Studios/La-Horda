'use strict';
/* Velmira, la Reina de las Máscaras — máscaras de colores y confeti. Antes: chispas amarillas / runas heladas genéricas.
   Máscara Arrojada (la máscara vuela girando) · Coro de Rostros (máscaras en órbita + pulso) · Cambio de Rostro (cambio de máscara) · El Gran Teatro (cuatro actos).
   El color sigue a la máscara ACTIVA (Inspiración dorada, Terror roja, Silencio azul, Protección verde). Solo visual. */
{
  const VL = ['#2a1038', '#8a3aa6', '#c06bd8', '#f3d1ff', '#ffffff'], MASK = ['#ffd34d', '#e0405a', '#6aa8f0', '#5fd08c'];
  const maskPaint = i => (g, p) => { const acc = MASK[i];
    g.beginPath(); g.moveTo(p + 1, p + 2); g.quadraticCurveTo(p + 6, p, p + 11, p + 2); g.lineTo(p + 10, p + 9); g.quadraticCurveTo(p + 6, p + 13, p + 2, p + 9); g.closePath(); g.fillStyle = '#fbf0ff'; g.fill();
    g.fillStyle = acc; g.fillRect(p + 1, p + 2, 10, 2);
    g.fillStyle = '#2a1038'; g.fillRect(p + 3, p + 5, 2, 2); g.fillRect(p + 8, p + 5, 2, 2);
    if(i === 0){ g.fillRect(p + 4, p + 9, 5, 1); g.fillRect(p + 3, p + 8, 1, 1); g.fillRect(p + 9, p + 8, 1, 1); }
    else if(i === 1){ g.fillRect(p + 4, p + 8, 5, 1); g.fillRect(p + 3, p + 9, 1, 1); g.fillRect(p + 9, p + 9, 1, 1); kvbPoly(g, [[p + 1, p + 2], [p - 1, p - 1], [p + 3, p + 2]], acc); kvbPoly(g, [[p + 11, p + 2], [p + 13, p - 1], [p + 9, p + 2]], acc); }
    else if(i === 2){ g.fillRect(p + 4, p + 9, 5, 1); kvbLine(g, p + 5, p + 8, p + 8, p + 10, acc, 1); kvbLine(g, p + 8, p + 8, p + 5, p + 10, acc, 1); }
    else { g.fillRect(p + 5, p + 9, 3, 1); kvbPoly(g, [[p + 6.5, p + 3.5], [p + 8.5, p + 4.5], [p + 6.5, p + 7], [p + 4.5, p + 4.5]], acc); } };
  for(let i = 0; i < 4; i++) kvbDefMotif('vl_mask' + i, 13, 13, maskPaint(i));
  for(let i = 0; i < 4; i++) kvbDefMotif('vl_conf' + i, 3, 3, kvbBmp(['cc.', 'ccc', '.cc'], {c: MASK[i]}));
  kvbDefMotif('vl_conf4', 3, 3, kvbBmp(['cc.', 'ccc', '.cc'], {c: '#f3d1ff'}));
  const ringDetails = i => (lg, c, R, rad, pal, q) => { for(let k = 0; k < 4; k++){ const a = k * 1.5708 + q * 2 + .78, x = c + Math.cos(a) * rad * .72, y = c + Math.sin(a) * rad * .72; kvbDisc(lg, x, y, 5, k === i ? MASK[i] : pal[3]); kvbDisc(lg, x, y, 3, '#fbf0ff'); kvbDisc(lg, x - 1.2, y - .6, .9, pal[0]); kvbDisc(lg, x + 1.2, y - .6, .9, pal[0]); } kvbCircle(lg, c, c, rad * .5, pal[2], 1); };
  for(let i = 0; i < 4; i++){
    const pal = [VL[0], VL[1], MASK[i], VL[3], VL[4]];
    kvbDefDecal('vl_ring' + i, 10, kvbRingPaint(pal, {fillCol: '#8a3aa6', fill: .34, details: ringDetails(i), flash: '#f3d1ff', rimThick: 3}));
    kvbDefBeam('vl_beam' + i, 8, 16, 14, kvbBeamPaint(pal, {body: .5}));
  }
  const maskOf = (x, y) => { const h = kvbHeroAt(x, y, 'velmira'); return h && h.asState ? (h.asState.mask | 0) & 3 : 0; };

  KVB_FX['velmira.mask_throw'] = (x, y, r, ang, len) => {
    const i = maskOf(x, y), ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('vl_beam' + i, x, y, ex, ey, Math.max(20, r * 1.3), 480, {layer: 'g', alpha: .6});
    kvbPart('vl_mask' + i, x, y, {vx: Math.cos(ang) * len * 2.6, vy: Math.sin(ang) * len * 2.6, spin: 14, dur: 380, scale: 2.2, layer: 't', fadeAt: .88});
    kvbEmit('vl_conf' + i, 10, ex, ey, {v0: 40, v1: 130, up: 40, grav: 220, l0: 380, l1: 620, scale: 1.5, spin: 8});
  };
  KVB_FX['velmira.chorus'] = (x, y, r) => {
    const i = maskOf(x, y); kvbDecal('vl_ring' + i, x, y, r, 840, {layer: 'g'});
    for(let k = 0; k < 4; k++){ const a = k * 1.5708 + .78; kvbPart('vl_mask' + k, x, y - 8, {vx: Math.cos(a) * r * 1.4, vy: Math.sin(a) * r * .8, dur: 520, scale: 2, layer: 't', fadeAt: .55, drag: 2}); }
    kvbEmit('vl_conf' + i, 12, x, y, {ring: r * .6, v0: 20, v1: 80, up: 60, grav: 200, l0: 420, l1: 700, scale: 1.5, spin: 8, flat: .7});
  };
  KVB_FX['velmira.face_swap'] = (x, y, r, ang, len) => {
    const i = maskOf(x, y), ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len, h = kvbHeroAt(ex, ey, 'velmira'), hx = h ? h.x : ex, hy = h ? h.y : ey;
    kvbDecal('vl_ring' + i, hx, hy, Math.max(40, r), 720, {layer: 'g'}); kvbPart('vl_mask' + i, hx, hy - 52, {dur: 760, scale: 2.4, layer: 't', vy: -20, spin: 6, fadeAt: .5});
    kvbEmit('vl_conf' + i, 10, hx, hy, {v0: 30, v1: 110, up: 60, grav: 220, l0: 380, l1: 640, scale: 1.5, spin: 8});
  };
  KVB_FX['velmira.theatre'] = (x, y, r) => {
    for(let k = 0; k < 4; k++){ kvbEmit('vl_conf' + k, 6, x, y, {ring: r * .5, v0: 30, v1: 120, up: 90, grav: 180, l0: 560, l1: 900, scale: 1.6, spin: 8, flat: .7}); const a = -1.5708 + k * 1.5708; kvbPart('vl_mask' + k, x, y, {vx: Math.cos(a) * r * 1.0, vy: Math.sin(a) * r * .6, dur: 700, scale: 3.4, layer: 't', fadeAt: .4, drag: 2.4}); }
  };
  kvbBind('asc:mask_throw', 'velmira.mask_throw'); kvbBind('asc:chorus', 'velmira.chorus'); kvbBind('asc:face_swap', 'velmira.face_swap'); kvbBind('asc:theatre', 'velmira.theatre');
}
