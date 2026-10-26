'use strict';
/* Nahir, el Restaurador de Espejos — vidrio, reflejos y destellos aguamarina. Antes: chispas amarillas genéricas (tema 'spark').
   Astillas (cono) · Reflejo fugitivo (salto + espejo en pie) · Corte cruzado (línea + ecos) · Galería de nadie (3 espejos que estallan). Solo visual. */
{
  const NH = ['#0d2e33', '#2f8f8c', '#68c6c2', '#c9fffb', '#ffffff'];
  kvbDefMotif('nh_shard', 7, 9, kvbBmp(['...c...', '..cwc..', '..cwb..', '.cwwbb.', '.cwbbb.', 'cwbbbd.', '.bbbdd.', '..bdd..', '...d...'], {c: '#c9fffb', w: '#ffffff', b: '#68c6c2', d: '#2f8f8c'}));
  kvbDefMotif('nh_glint', 7, 7, kvbBmp(['...w...', '...w...', '...c...', 'wwcwcww', '...c...', '...w...', '...w...'], {w: '#ffffff', c: '#c9fffb'}));
  kvbDefMotif('nh_mirror', 12, 20, (g, p) => { // espejo de pie: marco oval con brillo diagonal
    g.beginPath(); g.ellipse(p + 6, p + 9, 5.5, 9, 0, 0, 6.2832); g.fillStyle = '#2f8f8c'; g.fill();
    g.beginPath(); g.ellipse(p + 6, p + 9, 3.8, 7.4, 0, 0, 6.2832); g.fillStyle = '#9ff0ea'; g.fill();
    kvbLine(g, p + 3, p + 13, p + 8, p + 4, '#ffffff', 1.4); kvbLine(g, p + 5, p + 15, p + 9, p + 8, '#c9fffb', 1);
    g.fillStyle = '#2f8f8c'; g.fillRect(p + 5, p + 17, 2, 2); });

  const fanStreaks = (lg, c, R, front, q, half, pal) => {
    for(let k = -2; k <= 2; k++){ const a = k * half / 2.6, L = front * (.78 + .2 * kvbHash(k + 5, 3)), x1 = c + Math.cos(a) * L, y1 = c + Math.sin(a) * L;
      kvbLine(lg, c + Math.cos(a) * L * .18, c + Math.sin(a) * L * .18, x1, y1, pal[3], 2); kvbLine(lg, c + Math.cos(a) * L * .3, c + Math.sin(a) * L * .3, x1, y1, pal[4], 1);
      const nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[x1 + Math.cos(a) * 5, y1 + Math.sin(a) * 5], [x1 + nx * 3, y1 + ny * 3], [x1 - nx * 3, y1 - ny * 3]], pal[4]); }
  };
  kvbDefDecal('nh_fan', 10, kvbSectorPaint(NH, {fillCol: '#2f8f8c', streaks: fanStreaks}));
  const burstDetails = (lg, c, R, rad, pal, q) => {
    for(let i = 0; i < 8; i++){ const a = i * .7854 + .39, a2 = Math.cos(a), b2 = Math.sin(a), L = rad * .92, nx = -b2, ny = a2;
      kvbPoly(lg, [[c + a2 * rad * .25, c + b2 * rad * .25], [c + a2 * L + nx * 3, c + b2 * L + ny * 3], [c + a2 * L * 1.0 - nx * 3, c + b2 * L - ny * 3]], i & 1 ? pal[3] : pal[2]); }
    kvbPoly(lg, [[c, c - rad * .3], [c + rad * .2, c], [c, c + rad * .3], [c - rad * .2, c]], pal[4]);
  };
  kvbDefDecal('nh_burst', 10, kvbRingPaint(NH, {fillCol: '#2f8f8c', core: '#68c6c2', details: burstDetails, flash: '#c9fffb', fill: .4}));
  kvbDefDecal('nh_shatter', 9, kvbRingPaint(NH, {fillCol: '#2f8f8c', fill: .3, details: burstDetails, rimThick: 2}));
  kvbDefDecal('nh_mirror_idle', 12, kvbIdlePaint(NH, {fill: .16, fillCol: '#2f8f8c', dash: [7, 4], details: (lg, c, R, rad, pal, q) => { const a = q * 6.2832; for(let i = 0; i < 4; i++){ const b = a + i * 1.5708; kvbPoly(lg, [[c + Math.cos(b) * R * .8, c + Math.sin(b) * R * .8 - 3], [c + Math.cos(b) * R * .8 + 2, c + Math.sin(b) * R * .8], [c + Math.cos(b) * R * .8, c + Math.sin(b) * R * .8 + 3], [c + Math.cos(b) * R * .8 - 2, c + Math.sin(b) * R * .8]], pal[3]); } }}));
  kvbDefBeam('nh_cut', 8, 16, 16, kvbBeamPaint(NH, {body: .62, tile: (g, q, W, H, f, pal, half) => { g.fillStyle = pal[4]; for(let x = (f * 3) % 8; x < W; x += 8) g.fillRect(x, H / 2 - half - 1, 1, 2); }}));
  kvbDefBeam('nh_streak', 8, 16, 16, kvbBeamPaint(NH, {body: .5}));

  KVB_FX['nahir.shards'] = (x, y, range, ang, half) => {
    kvbSectorFx('nh_fan', x, y, range, ang, 620, {layer: 'g'});
    kvbEmit('nh_shard', 9, x, y, {ang, spread: (half || .85) * 1.7, v0: range * .55, v1: range * 1.0, l0: 280, l1: 460, scale: 1.5, faceVel: true, rot: 1.5708, drag: 1.2, shrink: true});
    kvbEmit('nh_glint', 4, x + Math.cos(ang) * range * .7, y + Math.sin(ang) * range * .7, {spread: 1.4, ang, v0: 10, v1: 40, l0: 250, l1: 420, scale: 1.2, jx: 30, jy: 20});
  };
  KVB_FX['nahir.reflect'] = (x, y, r, ang, len) => { // origen (x, y), salto de largo len
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('nh_streak', x, y, ex, ey, 18, 460, {layer: 't'});
    kvbDecal('nh_shatter', x, y, 38, 560, {layer: 'g'});
    kvbEmit('nh_shard', 6, x, y, {v0: 40, v1: 110, up: 30, grav: 120, l0: 380, l1: 560, scale: 1.3, spin: 6, shrink: true});
    kvbEmit('nh_glint', 3, ex, ey, {v0: 10, v1: 50, l0: 300, l1: 480, scale: 1.3, jx: 10, jy: 14});
  };
  KVB_FX['nahir.cross'] = (x, y, r, ang, len, width) => {
    // New casts carry a conservative visibility radius separately from stroke width.
    // Legacy/replayed events without the extra number retain their original geometry.
    if(Number.isFinite(width) && width > 0) r = width;
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len, h = kvbHeroAt(x, y, 'nahir');
    kvbBeam('nh_cut', x, y, ex, ey, r * 2, 520, {layer: 't'});
    kvbDecal('nh_shatter', ex, ey, Math.max(30, r * 1.8), 480, {layer: 'g'});
    if(h) for(const o of portadorObjects){ if(o.kind === 'ex_reflection' && o.owner === h && o.life > 0){
      // Secondary cuts keep a narrow silhouette even when mastery widens the hit corridor.
      const echo = kvbBeam('nh_cut', o.x, o.y, ex, ey, Math.min(12, r * .4), 480, {layer: 't', alpha: .7});
      // A live reflection can be farther than the shared beam's 900-unit budget.
      // Extend only this echo; the native tiled renderer preserves its pixel pitch.
      const echoLength = Math.hypot(ex - o.x, ey - o.y);
      if(echo && Number.isFinite(echoLength) && echoLength > echo.len) echo.len = echoLength;
      kvbEmit('nh_glint', 2, o.x, o.y, {v0: 10, v1: 40, l0: 260, l1: 420, scale: 1.2});
    } }
    kvbEmit('nh_shard', 5, ex, ey, {v0: 50, v1: 120, up: 30, grav: 140, l0: 300, l1: 480, scale: 1.3, spin: 6, shrink: true});
  };
  KVB_FX['nahir.gallery'] = (x, y, r, ang, ox, oy) => { // tres espejos a 100 u en 0°, 120° y 240°; cada uno estalla en 80 u
    const px = ox === undefined ? x : ox, py = oy === undefined ? y : oy, pts = [];
    for(let i = 0; i < 3; i++){ const a = i * 2.0944, mx = px + Math.cos(a) * 100, my = py + Math.sin(a) * 100; pts.push([mx, my]); kvbDecal('nh_burst', mx, my, 80, 820, {layer: 'g'}); kvbEmit('nh_shard', 6, mx, my, {v0: 40, v1: 130, up: 40, grav: 150, l0: 360, l1: 600, scale: 1.4, spin: 6, shrink: true}); }
    for(let i = 0; i < 3; i++){ const a = pts[i], b = pts[(i + 1) % 3]; kvbBeam('nh_streak', a[0], a[1], b[0], b[1], 8, 700, {layer: 'g', alpha: .8}); }
  };
  kvbBind('ex:shards', 'nahir.shards'); kvbBind('ex:reflect', 'nahir.reflect'); kvbBind('ex:cross', 'nahir.cross'); kvbBind('ex:gallery', 'nahir.gallery');

  const castFx = exCastFx;
  exCastFx = function(h, sk, isUlt, r, origin, end){
    if(KVB.off || !h || h.classKey !== 'nahir' || !sk || sk.action !== 'cross') return castFx.apply(this, arguments);
    const g = kvbCastGeom(h, sk, isUlt, r, origin, end);
    // The caster may be offscreen while a live reflection and its cut are visible.
    // Keep the normal network event and culling; supply the bounds of this cast.
    let bounds = Math.max(r, Math.hypot(end.x - origin.x, end.y - origin.y));
    for(const o of portadorObjects){
      if(o.kind === 'ex_reflection' && o.owner === h && o.life > 0){
        const d = Math.hypot(o.x - origin.x, o.y - origin.y);
        if(Number.isFinite(d)) bounds = Math.max(bounds, d);
      }
    }
    kvbFx('nahir.cross', g[0], g[1], bounds, g[3], g[4], r);
    kvbPunch(h, g[0], g[1], r, isUlt ? 2 : 1);
  };

  // el reflejo en pie: espejo oval con brillo + copia tenue de Nahir (igual que el dibujo original)
  kvbSkin('ex_reflection', {R: o => o.r, loop: 'nh_mirror_idle', period: 1600, born: o => kvbDecal('nh_shatter', o.x, o.y, 34, 520, {layer: 'g'}),
    end: o => { kvbEmit('nh_shard', 7, o.x, o.y, {v0: 30, v1: 100, up: 50, grav: 160, l0: 380, l1: 560, scale: 1.3, spin: 6, shrink: true}); },
    draw: (o, t, layer, R) => {
      const h = o.owner; if(!h || typeof drawChampPack !== 'function') return;
      ctx.save(); ctx.globalAlpha = .5; drawChampPack('nahir', {...h, x: o.x, y: o.y, _codexSet: 'idle_down', _codexT: 0}, h.scale || 2, .5); ctx.restore();
      const kf = kvbMotif('nh_mirror'); if(kf){ const bob = Math.sin(t / 380 + o.id) * 2; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = .9; ctx.drawImage(kf[0], o.x - 9, o.y - 58 + bob, 18, 32); ctx.restore(); }
    }}, 'nahir');
  kvbBasic('nahir', NH, 'nh_glint');
}
