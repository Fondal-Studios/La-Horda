'use strict';
/* ============================================================
   js/champions/vfx-b/templates.js — plantillas de decal / sector / rayo para los efectos de la 2.ª mitad del roster.
   Cada plantilla devuelve un paint() para kvbDefDecal / kvbDefBeam (pixfx.js). Paleta = [contorno, sombra, base, luz, brillo].
   Fases de toda animación de golpe (q = 0..1): anticipación 0–.22 (el borde converge y el glifo se forma), impacto .22–.42
   (relleno trameado, borde grueso en el RADIO REAL) y disipación .42–1 (el relleno y el borde se deshacen por tramado).
   ============================================================ */
// Disco con borde en el radio real. o.details(lg, c, R, rad, pal, q, P): marcas internas (rayos, glifo, sellos).
function kvbRingPaint(pal0, o){
  o = o || {};
  return function(g, q, S){
    const pal = kvbTintPal(pal0), c = S / 2, R = c - 1.5, P = kvbPhase(q), ant = q < .22, big = S >= 96 ? .75 : S >= 72 ? .9 : 1; // las zonas enormes (≥ 200 u) llevan menos relleno para no tapar la pantalla
    const rad = ant ? R * (.5 + .5 * kvbEase(P.ant)) : R, fl = Math.min(KVB_FILL_CAP, o.fill === undefined ? .45 : o.fill);
    const fill = big * (ant ? .1 * P.ant : q < .42 ? fl : fl * (1 - P.post));
    if(o.fill !== 0) kvbLayer(g, S, fill, lg => { kvbDisc(lg, c, c, rad - 1, kvbTintCol(o.fillCol) || pal[1]); if(o.core) kvbDisc(lg, c, c, rad * .5, kvbTintCol(o.core, .5)); });
    const detLv = (ant ? P.ant * .55 : Math.max(0, 1 - P.post * 1.15)) * (S >= 72 ? .7 : 1); // marcas internas: más ralas en zonas grandes, para no cubrir al enemigo
    if(o.details && detLv > .05) kvbLayer(g, S, detLv, lg => o.details(lg, c, R, rad, pal, q, P));
    const th = ant ? 1 : q < .42 ? (o.rimThick || 3) : Math.max(1, Math.round((o.rimThick || 3) - 1 - P.post * 1.2));
    const rimLv = P.post < .55 ? 1 : Math.max(0, 1 - (P.post - .55) / .45);
    if(rimLv > .05) kvbLayer(g, S, rimLv, lg => kvbRim(lg, c, c, rad, pal, th, ant ? [5, 3] : (o.dash || null)));
    if(!ant && q < .5 && o.flash) kvbLayer(g, S, .2 * (1 - (q - .22) / .28), lg => kvbDisc(lg, c, c, rad * .72, kvbTintCol(o.flash, .5)));
  };
}
// Anillo "de zona viva" en bucle (q = fase del bucle, sin disipación): borde fijo + marcas que giran
function kvbIdlePaint(pal0, o){
  o = o || {};
  return function(g, q, S){
    const pal = kvbTintPal(pal0), c = S / 2, R = c - 1.5, pulse = .5 + .5 * Math.sin(q * 6.2832), big = S >= 96 ? .75 : S >= 72 ? .9 : 1;
    kvbLayer(g, S, Math.min(KVB_FILL_CAP, ((o.fill === undefined ? .22 : o.fill) + .06 * pulse)) * big, lg => { kvbDisc(lg, c, c, R - 1, kvbTintCol(o.fillCol) || pal[1]); });
    if(o.details) kvbLayer(g, S, 1, lg => o.details(lg, c, R, R, pal, q, {pulse}));
    kvbLayer(g, S, 1, lg => kvbRim(lg, c, c, R, pal, 2, o.dash || null));
  };
}
// Sector (cono) con el vértice en el centro y el eje en +x: el borde exterior llega al alcance real (R) y los lados a ±half.
function kvbSectorPaint(pal0, o){
  o = o || {}; const half = o.half || .85;
  return function(g, q, S){
    const pal = kvbTintPal(pal0), c = S / 2, R = c - 1.5, P = kvbPhase(q);
    const front = R * kvbEase(Math.min(1, q / .4)), fill = q < .42 ? KVB_FILL_CAP : KVB_FILL_CAP * (1 - P.post);
    kvbLayer(g, S, fill, lg => { lg.beginPath(); lg.moveTo(c, c); lg.arc(c, c, Math.max(2, front), -half, half); lg.closePath(); lg.fillStyle = kvbTintCol(o.fillCol) || pal[1]; lg.fill(); });
    const detLv = q < .12 ? q / .12 : Math.max(0, 1 - P.post * 1.2);
    if(o.streaks && detLv > .05) kvbLayer(g, S, detLv, lg => o.streaks(lg, c, R, front, q, half, pal));
    const rimLv = P.post < .5 ? 1 : Math.max(0, 1 - (P.post - .5) / .5), th = q < .42 ? 2 : 1;
    if(rimLv > .05) kvbLayer(g, S, rimLv, lg => {
      const f = Math.max(3, front);
      for(const [col, w] of [[pal[0], th + 2], [pal[2], th]]){
        lg.beginPath(); lg.arc(c, c, f, -half, half); lg.strokeStyle = col; lg.lineWidth = w; lg.stroke();
        lg.beginPath(); lg.moveTo(c + Math.cos(-half) * f, c + Math.sin(-half) * f); lg.lineTo(c, c); lg.lineTo(c + Math.cos(half) * f, c + Math.sin(half) * f); lg.strokeStyle = col; lg.lineWidth = Math.max(1, w - 1); lg.stroke();
      }
    });
  };
}
// Hace la tira decal de un sector orientado: se dibuja rotado alrededor del vértice (centro del sprite)
function kvbSectorFx(name, x, y, range, ang, dur, o){
  o = o || {}; return kvbDecal(name, x, y, range, dur, Object.assign({rot: ang, layer: 'g'}, o));
}
// Rayo con cuerpo de baldosa: paint(g, q, tileW, H, f). pal para borde.
function kvbBeamPaint(pal, o){
  o = o || {};
  return function(g, q, W, H, f){
    const m = H / 2, ant = q < .2, post = q < .45 ? 0 : (q - .45) / .55, th = ant ? .2 + 2 * q : 1 - .55 * post;
    const half = Math.max(1, Math.round(m * th * (o.body || .7)));
    g.fillStyle = pal[0]; g.fillRect(0, m - half - 1, W, half * 2 + 2);
    g.fillStyle = pal[2]; g.fillRect(0, m - half, W, half * 2);
    if(half > 2){ g.fillStyle = pal[3]; g.fillRect(0, m - Math.max(1, half - 2), W, Math.max(1, (half - 2) * 2)); }
    if(half > 3){ g.fillStyle = pal[4]; g.fillRect(0, m - 1, W, 2); }
    if(o.tile) o.tile(g, q, W, H, f, pal, half);
  };
}
// Azar determinista (NO consume Math.random ni el RNG cosmético): geometría estable entre cuadros de una misma tira
function kvbHash(a, b){ let h = (a * 374761393 + b * 668265263) | 0; h = ((h ^ (h >>> 13)) * 1274126177) | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
// Grietas quebradas que salen del centro y crecen con grow (0..1): n rayos, cada uno con codos desparejos
function kvbCracks(g, c, len, grow, n, col, th, seed){
  for(let i = 0; i < n; i++){
    const a0 = i * 6.2832 / n + kvbHash(i, seed || 1) * .5, L = len * (.55 + .45 * kvbHash(i, 7 + (seed || 1))) * grow;
    let x = c, y = c, a = a0; const seg = 4;
    g.beginPath(); g.moveTo(x, y);
    for(let k = 1; k <= seg; k++){ a = a0 + (kvbHash(i * 9 + k, seed || 1) - .5) * .9; const d = L / seg; x += Math.cos(a) * d; y += Math.sin(a) * d; g.lineTo(x, y); }
    g.strokeStyle = col; g.lineWidth = th; g.lineCap = 'butt'; g.stroke();
  }
}
// Rombo / estrella de n puntas rellena (para estrellas, destellos, glifos)
function kvbStar(g, cx, cy, r, n, col, inner){
  const pts = []; for(let i = 0; i < n * 2; i++){ const a = -1.5708 + i * Math.PI / n, rr = i % 2 ? r * (inner || .45) : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  kvbPoly(g, pts, col);
}
