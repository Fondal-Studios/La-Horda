'use strict';
/* ============================================================
   js/rendering/pixel-stroke.js — anillos y trazos de efecto sobre la rejilla de píxel (alfa 0/255, sin antialias)
   Antes los anillos y trazos de los efectos eran líneas vectoriales (ctx.arc + stroke) con borde suavizado y alfa continuo,
   mezcladas con decales de píxel duro (docs/ART_BIBLE.md §14, contrato de js/champions/vfx-b/pixfx.js). Aquí cada trazo se
   "traza" celda a celda en un lienzo auxiliar (sin lectura de píxeles) y se estampa con vecino más cercano:
     · celda = 4,4 u de mundo para trazos gruesos (≥ 8 u; misma rejilla que los decales) y 2,2 u para trazos y filos finos,
     · la translucidez de un color rgba(r,g,b,a) pasa a tramado ordenado Bayer 4x4 (a = fracción de celdas) en lugar de mezcla,
     · los trazos van anclados a la rejilla del mundo: se mueven a saltos de celda, como el resto del pixel art.
   Todo es COSMÉTICO (no toca daño, alcance ni hitboxes, ni usa Math.random). Si algo falla, el llamador dibuja el vector de siempre.
   API: pxsRing(x, y, rx, ry, capas, o) (o.a0 / o.a1 = arco)   pxsLine(x0, y0, x1, y1, capas, o)   pxsPath(puntos, capas, o)   pxsDisc(x, y, rx, ry, color, o)
        capas = [[color css, ancho en u], ...] de abajo hacia arriba (sombra, color, filo); o.dash = [celdas on, celdas off, fase]
   ============================================================ */
const PXS = {cv: null, g: null, cv2: null, g2: null, W: 0, H: 0, cache: {}, tiles: [], drawn: 0};
const PXS_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function pxsParse(c){
  let v = PXS.cache[c]; if(v) return v;
  let m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(c);
  if(m) v = {col: 'rgb(' + (+m[1] | 0) + ',' + (+m[2] | 0) + ',' + (+m[3] | 0) + ')', lvl: m[4] === undefined ? 1 : Math.max(0, Math.min(1, +m[4]))};
  else if((m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(c))) v = {col: '#' + m[1], lvl: m[2] ? parseInt(m[2], 16) / 255 : 1};
  else v = {col: c, lvl: 1};
  if(Object.keys(PXS.cache).length < 400) PXS.cache[c] = v; return v;
}
function pxsSurface(w, h){
  if(!PXS.cv){ PXS.cv = document.createElement('canvas'); PXS.g = PXS.cv.getContext('2d'); PXS.cv2 = document.createElement('canvas'); PXS.g2 = PXS.cv2.getContext('2d'); }
  if(w > PXS.W || h > PXS.H){ PXS.W = Math.max(w, PXS.W); PXS.H = Math.max(h, PXS.H); for(const c of [PXS.cv, PXS.cv2]){ c.width = PXS.W; c.height = PXS.H; c.getContext('2d').imageSmoothingEnabled = false; } }
  PXS.g.setTransform(1, 0, 0, 1, 0, 0); PXS.g.globalCompositeOperation = 'source-over'; PXS.g.clearRect(0, 0, w, h);
}
// baldosa Bayer 4x4 (alfa 0/255) para una fracción lvl de celdas llenas
function pxsTile(n){
  let t = PXS.tiles[n]; if(t) return t;
  const c = document.createElement('canvas'); c.width = c.height = 4; const g = c.getContext('2d'); g.fillStyle = '#000';
  for(let y = 0; y < 4; y++) for(let x = 0; x < 4; x++) if(PXS_BAYER[y * 4 + x] < n) g.fillRect(x, y, 1, 1);
  return PXS.tiles[n] = PXS.g2.createPattern(c, 'repeat');
}
// Estampa en el lienzo auxiliar las capas (cada una: color, ancho, nivel) usando stamp(g, th, lo, dash) y luego lo dibuja con vecino más cercano.
function pxsCompose(x0, y0, x1, y1, cell, pad, layers, o, stamp){
  if(typeof ctx === 'undefined' || !layers || !layers.length) return false;
  if(!Number.isFinite(x0 + y0 + x1 + y1)) return false;
  while(cell < 64 && ((x1 - x0) / cell > 380 || (y1 - y0) / cell > 380)) cell *= 2; // trazos enormes: celda más grande en vez de no dibujar
  const ox = Math.floor(x0 / cell) - pad, oy = Math.floor(y0 / cell) - pad, w = Math.floor(x1 / cell) + pad + 2 - ox, h = Math.floor(y1 / cell) + pad + 2 - oy;
  if(w > 420 || h > 420 || w < 1 || h < 1) return false;
  pxsSurface(w, h); const g = PXS.g, g2 = PXS.g2, kk = o.k === undefined ? 1 : o.k; let any = false;
  for(const L of layers){
    const p = pxsParse(L[0]), lvl = p.lvl * kk; if(lvl <= 0.02) continue;
    const th = Math.max(1, Math.round(L[1] / cell)), lo = -((th - 1) >> 1), n = Math.round(lvl * 16), full = n >= 15;
    const tg = full ? g : g2;
    if(!full){ g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalCompositeOperation = 'source-over'; g2.clearRect(0, 0, w, h); }
    tg.fillStyle = p.col; stamp(tg, th, lo, ox, oy, cell, o.dash); any = true;
    if(!full){
      // tramado ordenado anclado a la rejilla del mundo: se conserva solo la fracción n/16 de las celdas
      g2.globalCompositeOperation = 'destination-in'; g2.setTransform(1, 0, 0, 1, (4 - (ox & 3)) & 3, (4 - (oy & 3)) & 3); g2.fillStyle = pxsTile(n); g2.fillRect(-4, -4, w + 8, h + 8); g2.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(PXS.cv2, 0, 0, w, h, 0, 0, w, h);
    }
  }
  if(!any) return true;
  const sm = ctx.imageSmoothingEnabled, ga = ctx.globalAlpha; ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1;
  ctx.drawImage(PXS.cv, 0, 0, w, h, ox * cell, oy * cell, w * cell, h * cell);
  ctx.imageSmoothingEnabled = sm; ctx.globalAlpha = ga; PXS.drawn++; return true;
}
const pxsWmax = layers => { let m = 1; for(const L of layers) m = Math.max(m, L[1]); return m; };
// Polilínea de puntos [x, y, ...] en coordenadas de mundo
function pxsPath(pts, layers, o){
  o = o || {}; if(!layers || pts.length < 4) return false;
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  for(let i = 0; i < pts.length; i += 2){ const x = pts[i], y = pts[i + 1]; if(!Number.isFinite(x) || !Number.isFinite(y)) return false; if(x < minx) minx = x; if(x > maxx) maxx = x; if(y < miny) miny = y; if(y > maxy) maxy = y; }
  const wm = pxsWmax(layers), cell = o.cell || (wm >= 8 ? 4.4 : 2.2);
  return pxsCompose(minx, miny, maxx, maxy, cell, Math.ceil(wm / cell / 2) + 1, layers, o, (g, th, lo, ox, oy, cl, dash) => {
    let travelled = 0, lx = 0, ly = 0;
    for(let i = 0; i < pts.length; i += 2){
      const cx = Math.floor(pts[i] / cl), cy = Math.floor(pts[i + 1] / cl);
      if(i && cx === lx && cy === ly) continue; // la misma celda no se repite
      lx = cx; ly = cy; travelled++;
      if(dash){ const per = dash[0] + dash[1], k = (((travelled + (dash[2] || 0)) % per) + per) % per; if(k >= dash[0]) continue; }
      g.fillRect(cx + lo - ox, cy + lo - oy, th, th);
    }
  });
}
// Muestreo de una elipse (o un arco) con paso menor que la celda para que el trazo no deje huecos
function pxsEllipsePts(x, y, rx, ry, a0, a1, cell){
  const R = Math.max(rx, ry, 1), n = Math.max(12, Math.min(900, Math.ceil(Math.abs(a1 - a0) * R / (cell * .6)))), pts = new Array(n * 2 + 2);
  for(let i = 0; i <= n; i++){ const a = a0 + (a1 - a0) * i / n; pts[i * 2] = x + Math.cos(a) * rx; pts[i * 2 + 1] = y + Math.sin(a) * ry; }
  return pts;
}
function pxsRing(x, y, rx, ry, layers, o){
  o = o || {}; const cell = o.cell || (pxsWmax(layers) >= 8 ? 4.4 : 2.2);
  return pxsPath(pxsEllipsePts(x, y, Math.max(1, rx), Math.max(1, ry), o.a0 || 0, o.a1 === undefined ? 6.2832 : o.a1, cell), layers, Object.assign({}, o, {cell}));
}
function pxsLine(x0, y0, x1, y1, layers, o){
  o = o || {}; const cell = o.cell || (pxsWmax(layers) >= 8 ? 4.4 : 2.2), n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (cell * .6))), pts = new Array(n * 2 + 2);
  for(let i = 0; i <= n; i++){ pts[i * 2] = x0 + (x1 - x0) * i / n; pts[i * 2 + 1] = y0 + (y1 - y0) * i / n; }
  return pxsPath(pts, layers, Object.assign({}, o, {cell}));
}
// Elipse rellena (color css, con alfa → tramado)
function pxsDisc(x, y, rx, ry, color, o){
  o = o || {}; rx = Math.max(.5, rx); ry = Math.max(.5, ry); const cell = o.cell || 4.4;
  return pxsCompose(x - rx, y - ry, x + rx, y + ry, cell, 1, [[color, cell]], o, (g, th, lo, ox, oy, cl) => {
    const j0 = Math.floor((y - ry) / cl), j1 = Math.floor((y + ry) / cl);
    for(let j = j0; j <= j1; j++){
      const dy = ((j + .5) * cl - y) / ry; if(dy < -1 || dy > 1) continue;
      const hw = Math.sqrt(1 - dy * dy) * rx, i0 = Math.round((x - hw) / cl), i1 = Math.round((x + hw) / cl);
      if(i1 > i0) g.fillRect(i0 - ox, j - oy, i1 - i0, 1);
    }
  });
}
