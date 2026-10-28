'use strict';
/* Nano GM, el Regente del Umbral — decretos de sombra y leyes de luz. Antes: 'dark' (calavera y salpicaduras) y 'light'/'rune' genéricos del motor.
   Sentencia Umbría (decreto en línea) · Edicto de Luz (ley en el suelo) · Inversión (salto con estallido) · Juicio del GM (la arena se parte en dos). Solo visual:
   las zonas persistentes (edicto, runa, juicio) conservan su dibujo propio de Ascensión; aquí se reemplaza el efecto genérico del lanzamiento. */
{
  const NG = ['#15120a', '#7a6420', '#e8c56a', '#fff4d6', '#ffffff'], SH = ['#05030a', '#2a2a3a', '#5a5a74', '#a6a6c0', '#ffffff'];
  kvbDefMotif('ng_shard_d', 7, 9, kvbBmp(['...w...', '..wkw..', '..wkk..', '.wkkkk.', '.wkkkk.', 'wkkkkk.', '.kkkk..', '..kk...', '...k...'], {w: '#f4f4f4', k: '#14121c'}));
  kvbDefMotif('ng_shard_l', 7, 9, kvbBmp(['...e...', '..eWe..', '..eWW..', '.eWWWW.', '.eWWWW.', 'eWWWWW.', '.WWWW..', '..WW...', '...W..'], {e: '#e8c56a', W: '#fff4d6'}));
  kvbDefMotif('ng_scroll', 9, 9, kvbBmp(['.eeeeeee.', 'eWWWWWWWe', 'eWkkWkkWe', 'eWWWWWWWe', 'eWkkkWkWe', 'eWWWWWWWe', '.eeeeeee.'], {e: '#e8c56a', W: '#fff4d6', k: '#7a6420'}));
  kvbDefMotif('ng_mote', 3, 3, kvbBmp(['.y.', 'yWy', '.y.'], {y: '#e8c56a', W: '#fff4d6'}));
  kvbDefBeam('ng_decree', 8, 20, 18, (g, q, W, H, f) => {
    // Separated ink slashes with a travelling gold edge: no continuous cable.
    if(q >= 1) return;
    const head = 4 + (f * 2) % 10;
    for(let x = 2; x < W - 2; x++){
      const u = (x - 2) / (W - 4);
      if(x > head + 4 || x < head - 6) continue;
      const y = Math.round(H * .65 - u * H * .3);
      const thick = Math.max(1, Math.round(7 * Math.sin(u * Math.PI) * (1 - q * .5)));
      g.fillStyle = SH[0]; g.fillRect(x, y - Math.floor(thick / 2), 1, thick);
      g.fillStyle = SH[2]; g.fillRect(x, y, 1, Math.max(1, Math.floor(thick / 2)));
      if(x >= head - 2){g.fillStyle = x > head ? NG[3] : NG[2];g.fillRect(x, y, 1, 1);}
    }
    if(f < 5){g.fillStyle = SH[3];g.fillRect(3 + f, 5, 2, 1);}

  });
  const lawDetails = (lg, c, R, rad, pal, q) => { lg.save(); lg.translate(c, c); lg.rotate(q * .9); const s = rad * .45; kvbPoly(lg, [[-s, -s], [s, -s], [s, s], [-s, s]], null, pal[3], 1.6); lg.rotate(.7854); kvbPoly(lg, [[-s * .7, -s * .7], [s * .7, -s * .7], [s * .7, s * .7], [-s * .7, s * .7]], null, pal[4], 1.2); lg.restore();
    for(let i = 0; i < 8; i++){ const a = i * .7854, x = c + Math.cos(a) * rad * .82, y = c + Math.sin(a) * rad * .82; kvbLine(lg, x, y - 3, x, y + 3, pal[3], 1.4); kvbLine(lg, x - 2, y, x + 2, y, pal[3], 1.2); } kvbCircle(lg, c, c, rad * .62, pal[2], 1); };
  kvbDefDecal('ng_law', 10, kvbRingPaint(NG, {fillCol: '#7a6420', core: '#e8c56a', fill: .36, details: lawDetails, flash: '#fff4d6', rimThick: 3}));
  const splitDetails = (lg, c, R, rad, pal, q) => {
    // Four short paired seals release outward; no dominant half-disc.
    for(let i = 0; i < 4; i++){
      const a = i * Math.PI / 2 + Math.PI / 4;
      const r = rad * (.64 + q * .2), span = .22 * (1 - q * .5);
      lg.beginPath(); lg.arc(c, c, r, a - span, a + span);
      lg.strokeStyle = i & 1 ? NG[3] : SH[3]; lg.lineWidth = 1; lg.stroke();
      const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r;
      kvbLine(lg, x, y, c + Math.cos(a) * (r + 2), c + Math.sin(a) * (r + 2), NG[2], 1);
    }
  };
  kvbDefDecal('ng_verdict', 10, kvbRingPaint(NG, {fill: 0, details: splitDetails, rimThick: 1}));
  kvbDefDecal('ng_burst_d', 10, kvbRingPaint(SH, {fill: 0, details: (lg, c, R, rad) => {
    for(let i = 0; i < 6; i++){
      const a = i * Math.PI / 3, inner = rad * .68, outer = rad * .88;
      const x = c + Math.cos(a) * inner, y = c + Math.sin(a) * inner;
      kvbLine(lg, x, y, c + Math.cos(a + .12) * outer,
        c + Math.sin(a + .12) * outer, i & 1 ? '#e8c56a' : '#a6a6c0', 1);
      kvbLine(lg, x, y, x + Math.cos(a + Math.PI / 2) * 2,
        y + Math.sin(a + Math.PI / 2) * 2, '#05030a', 1);
    }
  }, rimThick: 1}));

  // Keep the bounded shared bake; only Nano's returned impact uses its full area.
  // Evolved Monster H3 can reach 580.1796 without changing the skill's radius.
  function nanoImpactDecal(name, x, y, radius, duration){
    const e = kvbDecal(name, x, y, radius, duration, {layer: 'g'});
    if(e && Number.isFinite(radius) && radius > 520) e.w = e.h = radius * 2;
    return e;
  }
  KVB_FX['nano.sentence'] = (x, y, r, ang, len, impactRadius) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('ng_decree', x, y, ex, ey, Math.max(24, r * 1.7), 640, {layer: 't'});
    nanoImpactDecal('ng_burst_d', ex, ey, Number.isFinite(impactRadius) && impactRadius > 0 ? impactRadius : Math.max(40, r * 2.3), 700); // explosión final: 70 u × área
    kvbEmit('ng_shard_d', 8, ex, ey, {ring: r, v0: 40, v1: 130, up: 60, grav: 240, l0: 380, l1: 620, scale: 1.4, spin: 6});
    kvbEmit('ng_shard_l', 5, x, y, {ang, spread: .6, v0: 30, v1: 100, l0: 300, l1: 460, scale: 1.2, shrink: true});
  };
  KVB_FX['nano.edict'] = (x, y, r) => {
    kvbDecal('ng_law', x, y, r, 840, {layer: 'g'});
    kvbEmit('ng_mote', 12, x, y, {ring: r * .8, v0: 4, v1: 18, up: 80, l0: 600, l1: 1000, scale: 1.3, flat: .7});
    kvbPart('ng_scroll', x, y - 24, {dur: 800, scale: 1.8, layer: 't', vy: -14, fadeAt: .5});
  };
  KVB_FX['nano.invert'] = (x, y, r, ang, len, impactRadius) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    kvbBeam('ng_decree', x, y, ex, ey, 14, 420, {layer: 'g', alpha: .8});
    nanoImpactDecal('ng_verdict', ex, ey, Number.isFinite(impactRadius) && impactRadius > 0 ? impactRadius : Math.max(40, r * 1.3), 760); // estallido de llegada: 1,3 × radio de la runa
    kvbEmit('ng_shard_d', 5, ex, ey, {v0: 40, v1: 120, up: 40, grav: 200, l0: 340, l1: 560, scale: 1.3, spin: 6}); kvbEmit('ng_shard_l', 5, ex, ey, {v0: 40, v1: 120, up: 40, grav: 200, l0: 340, l1: 560, scale: 1.3, spin: 6});
  };
  KVB_FX['nano.judgement'] = (x, y, r) => { // la mitad blanca / negra y la costura las dibuja el objeto del Juicio (radio real); aquí las esquirlas y la ley que cae
    kvbEmit('ng_shard_d', 14, x, y, {ring: r * .15, v0: 80, v1: 260, up: 90, grav: 200, l0: 520, l1: 900, scale: 1.8, spin: 5, flat: .7}); kvbEmit('ng_shard_l', 14, x, y, {ring: r * .15, v0: 80, v1: 260, up: 90, grav: 200, l0: 520, l1: 900, scale: 1.8, spin: 5, flat: .7});
    kvbPart('ng_scroll', x, y - 46, {dur: 1200, scale: 3, layer: 't', vy: -10, fadeAt: .55});
  };
  kvbBind('asc:sentence', 'nano.sentence'); kvbBind('asc:edict', 'nano.edict'); kvbBind('asc:invert', 'nano.invert'); kvbBind('asc:judgement', 'nano.judgement');
  // Capture the actual cast's area before the shared kit adjusts its visual r.
  // Numeric impact geometry travels through the existing optional event argument.
  let nanoVisualCast = null;
  const castNanoBase = ascensionCast, drawNanoBase = ascCastFx, teleportNanoBase = ascTeleport;
  ascTeleport = function(h, destination){
    const moved = teleportNanoBase.apply(this, arguments);
    if(nanoVisualCast && nanoVisualCast.h === h && nanoVisualCast.sk.action === 'invert')
      nanoVisualCast.moved = moved;
    return moved;
  };
  ascensionCast = function(h, sk, isUlt, dmg, area, dur, power){
    const previous = nanoVisualCast;
    nanoVisualCast = h && h.classKey === 'nano_gm' && sk &&
      (sk.action === 'sentence' || sk.action === 'invert') ?
      {h, sk, area: area * (ascState(h).monsterUntil > ascNow() ? 1.4 : 1)} : null;
    try { return castNanoBase.apply(this, arguments); }
    finally { nanoVisualCast = previous; }
  };
  ascCastFx = function(h, sk, isUlt, r, origin, end){
    const c = nanoVisualCast;
    if(KVB.off || !c || c.h !== h || c.sk !== sk) return drawNanoBase.apply(this, arguments);
    // A rejected teleport has no arrival damage. Its existing origin rune remains.
    if(sk.action === 'invert' && c.moved === false) return;
    const g = kvbCastGeom(h, sk, isUlt, r, origin, end);
    const impact = (sk.action === 'sentence' ? 70 : sk.radius * 1.3) * c.area;
    if(sk.action === 'invert') g[3] = Math.atan2(h.y - origin.y, h.x - origin.x);
    kvbFx('nano.' + sk.action, g[0], g[1], g[2], g[3], g[4], impact);
    kvbPunch(h, g[0], g[1], g[2], isUlt ? 2 : 1);
  };
  kvbBasic('nano_gm', NG, 'ng_mote');
}
