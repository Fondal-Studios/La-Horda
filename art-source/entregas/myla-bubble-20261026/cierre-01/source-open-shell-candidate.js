'use strict';
/* Myla, la Niña de la Cuchara — yogur cremoso, burbujas y llanto. Ya tenía arte propio (torre de yogur, charco y bebé del Berrinche); esta capa agrega lo que faltaba:
   Burbuja Cremosa (antes solo un anillo finito: ahora una burbuja de yogur alrededor mientras dura el escudo), el charco del Yogurazo (relleno cremoso con burbujas y estallido al caer/secarse)
   y las ondas de llanto del Berrinche (aro de ondas). Solo visual; el arte existente no se toca. */
{
  const myBubbleLatest = new WeakMap();
  const MY = ['#5a2a3e', '#d27a9c', '#e99abb', '#fff1e6', '#ffffff'];
  kvbDefMotif('my_blob', 6, 6, kvbBmp(['.cccc.', 'cwwccc', 'cwcccp', 'cccccp', '.cppp.', '..pp..'], {c: '#fff1e6', w: '#ffffff', p: '#e99abb'}));
  kvbDefMotif('my_tear', 4, 6, kvbBmp(['.b..', 'bhb.', 'bbbb', 'bbbb', '.bb.'], {b: '#9ad8f0', h: '#ffffff'}));
  // Open shell: retain the native rim and highlights without stippling the body.
  kvbDefDecal('my_bubble_idle', 12, (g, q, S) => {
    const pal = kvbTintPal(MY), c = S / 2, R = c - 1.5;
    kvbLayer(g, S, 1, lg => {
      kvbArcLine(lg, c, c, R * .75, -2.4 + q * .8, -1.6 + q * .8, pal[4], 2.4);
      kvbArcLine(lg, c, c, R * .75, .7, 1.1, pal[3], 1.6);
      kvbDisc(lg, c + R * .45, c - R * .45, 2, pal[4]);
      kvbRim(lg, c, c, R, pal, 2, [12, 5]);
    });
  });
  kvbDefDecal('my_pop', 9, kvbRingPaint(MY, {fillCol: '#e99abb', fill: .34, details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 8; i++){ const a = i * .7854 + .3, x = c + Math.cos(a) * rad * .72, y = c + Math.sin(a) * rad * .72; kvbDisc(lg, x, y, 3, pal[3]); kvbDisc(lg, x - 1, y - 1, 1.2, pal[4]); } }, flash: '#fff1e6', rimThick: 3}));
  kvbDefDecal('my_puddle_idle', 14, kvbIdlePaint(MY, {fill: .3, fillCol: '#e99abb', dash: [8, 5], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 7; i++){ const a = i * .8976 + .4, d = R * (.25 + .5 * kvbHash(i, 4)), x = c + Math.cos(a) * d, y = c + Math.sin(a) * d, s = 2 + 1.5 * Math.abs(Math.sin(q * 6.2832 + i)); kvbDisc(lg, x, y, s, pal[3]); kvbDisc(lg, x - .8, y - .8, .9, pal[4]); } }}));
  kvbDefDecal('my_cry_idle', 14, kvbIdlePaint(MY, {fill: .12, fillCol: '#e99abb', dash: [6, 5], details: (lg, c, R, rad, pal, q) => { for(let i = 0; i < 3; i++){ const u = (q + i / 3) % 1; kvbCircle(lg, c, c, R * (.2 + .78 * u), i & 1 ? pal[3] : pal[4], 1.6); } }}));
  KVB_FX['myla.bubble'] = (x, y, r, ang, ms) => { const h = kvbHeroAt(x, y, 'myla'); kvbDecal('my_pop', x, y, 40, 640, {layer: 'g'}); if(h){
    // Reuse the existing atlas; visibility reads the current owner's shield,
    // including damage applied after the VFX update. Like the existing family
    // ring, this represents aggregate shield, not a per-source shield balance.
    // The original cast TTL still bounds late snapshots and replenishment.
    const bubble = kvbDecal('my_bubble_idle', h.x, h.y - 12, 34, ms || 4500, {follow: h, ofy: -12, layer: 't', loop: true, fps: 8, alpha: .8, fadeAt: .88});
    if(bubble){
      myBubbleLatest.set(h, bubble);
      Object.defineProperty(bubble, 'alpha', {enumerable: true, configurable: true, get: () => myBubbleLatest.get(h) === bubble && heroes.includes(h) && h.classKey === 'myla' && h.alive !== false && h.shield > 0 ? .8 : 0});
    }
  } kvbEmit('my_blob', 5, x, y, {ring: 18, v0: 10, v1: 40, up: 60, l0: 420, l1: 700, scale: 1.2, flat: .6}); };
  kvbPortador('myla', 'my_bubble', (h, sk, u, sc) => ['myla.bubble', h.x, h.y, 34, 0, sk.duration * sc.DUR, 0]);
  kvbSkin('yogurt', {R: o => o.r, loop: 'my_puddle_idle', period: 2000, hideBase: false,
    born: o => { kvbDecal('my_pop', o.x, o.y, o.r, 700, {layer: 'g'}); kvbEmit('my_blob', 8, o.x, o.y, {ring: o.r * .5, v0: 30, v1: 110, up: 90, grav: 320, l0: 380, l1: 620, scale: 1.4, flat: .6}); },
    end: o => { kvbEmit('my_blob', 4, o.x, o.y, {ring: o.r * .4, v0: 10, v1: 40, up: 30, grav: 200, l0: 360, l1: 540, scale: 1.2, flat: .6}); }}, 'myla');
  kvbSkin('tantrum', {R: o => o.r, loop: 'my_cry_idle', period: 1300, hideBase: false,
    born: o => { kvbDecal('my_pop', o.x, o.y, o.r, 820, {layer: 'g'}); },
    upd: (o, st) => { if(kvbR() < .08) kvbPart('my_tear', o.x + kvbRR(-30, 30), o.y - 50, {vx: kvbRR(-60, 60), vy: -20, grav: 260, dur: 520, scale: 1.4, layer: 't', shrink: true}); }}, 'myla');
  kvbBasic('myla', MY, 'my_blob');
}
