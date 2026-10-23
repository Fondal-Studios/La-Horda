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
const PXS = {cv: null, g: null, buf: null, u32: null, cap: 0, cache: {}, drawn: 0};
const PXS_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const PXS_LE = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1; // little endian: ABGR en el Uint32
// color css → {c: entero ABGR opaco, lvl: alfa 0..1 (pasa a tramado)}
function pxsParse(c){
  let v = PXS.cache[c]; if(v) return v;
  let r = 255, g = 255, b = 255, a = 1, m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(c);
  if(m){ r = +m[1]; g = +m[2]; b = +m[3]; a = m[4] === undefined ? 1 : +m[4]; }
  else if((m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(c))){ const n = parseInt(m[1], 16); r = n >> 16 & 255; g = n >> 8 & 255; b = n & 255; a = m[2] ? parseInt(m[2], 16) / 255 : 1; }
  else if((m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(c))){ r = parseInt(m[1] + m[1], 16); g = parseInt(m[2] + m[2], 16); b = parseInt(m[3] + m[3], 16); }
  r &= 255; g &= 255; b &= 255;
  v = {c: PXS_LE ? ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0 : ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0, lvl: Math.max(0, Math.min(1, a))};
  if(Object.keys(PXS.cache).length < 400) PXS.cache[c] = v; return v;
}
function pxsBuffer(n){
  if(!PXS.cv){ PXS.cv = document.createElement('canvas'); PXS.g = PXS.cv.getContext('2d'); }
  if(n > PXS.cap){ PXS.cap = Math.max(n, PXS.cap * 2, 4096); PXS.buf = new Uint8ClampedArray(PXS.cap * 4); PXS.u32 = new Uint32Array(PXS.buf.buffer); }
  PXS.u32.fill(0, 0, n); return PXS.u32;
}
// Compone las capas (cada una: [color, ancho u]) en una rejilla de celdas (arreglo tipado, sin lienzo intermedio por capa) y la estampa con vecino más cercano.
// stamp(set, th, lo, cl, dash): set(cx, cy, ancho, alto) pinta un rectángulo de celdas del mundo (cx, cy) con el color y el tramado de la capa en curso.
function pxsCompose(x0, y0, x1, y1, cell, pad, layers, o, stamp){
  if(typeof ctx === 'undefined' || !layers || !layers.length) return false;
  if(!Number.isFinite(x0 + y0 + x1 + y1)) return false;
  while(cell < 64 && ((x1 - x0) / cell > 380 || (y1 - y0) / cell > 380)) cell *= 2; // trazos enormes: celda más grande en vez de no dibujar
  const ox = Math.floor(x0 / cell) - pad, oy = Math.floor(y0 / cell) - pad, w = Math.floor(x1 / cell) + pad + 2 - ox, h = Math.floor(y1 / cell) + pad + 2 - oy;
  if(w > 420 || h > 420 || w < 1 || h < 1) return false;
  const u = pxsBuffer(w * h), kk = o.k === undefined ? 1 : o.k; let any = false, col = 0, lim = 16;
  const set = (cx, cy, rw, rh) => {
    let gx0 = cx - ox, gy0 = cy - oy, gx1 = gx0 + rw, gy1 = gy0 + rh; if(gx0 < 0) gx0 = 0; if(gy0 < 0) gy0 = 0; if(gx1 > w) gx1 = w; if(gy1 > h) gy1 = h;
    if(lim >= 16){ for(let y = gy0; y < gy1; y++){ const row = y * w; for(let x = gx0; x < gx1; x++) u[row + x] = col; } return; }
    // tramado ordenado anclado a la rejilla del mundo: solo se pinta la fracción lim/16 de las celdas
    for(let y = gy0; y < gy1; y++){ const row = y * w, by = ((y + oy) & 3) * 4; for(let x = gx0; x < gx1; x++) if(PXS_BAYER[by + ((x + ox) & 3)] < lim) u[row + x] = col; }
  };
  for(const L of layers){
    const p = pxsParse(L[0]), lvl = p.lvl * kk; if(lvl <= 0.02) continue;
    const th = Math.max(1, Math.round(L[1] / cell)), lo = -((th - 1) >> 1);
    col = p.c; lim = Math.round(lvl * 16); if(lim < 1) continue; any = true;
    stamp(set, th, lo, cell, o.dash);
  }
  if(!any) return true;
  if(PXS.cv.width < w || PXS.cv.height < h){ PXS.cv.width = Math.max(w, PXS.cv.width); PXS.cv.height = Math.max(h, PXS.cv.height); } // el lienzo solo crece (redimensionarlo en cada trazo es lo caro)
  PXS.g.putImageData(new ImageData(PXS.buf.subarray(0, w * h * 4), w, h), 0, 0);
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
  return pxsCompose(minx, miny, maxx, maxy, cell, Math.ceil(wm / cell / 2) + 1, layers, o, (set, th, lo, cl, dash) => {
    let travelled = 0, lx = 0, ly = 0;
    for(let i = 0; i < pts.length; i += 2){
      const cx = Math.floor(pts[i] / cl), cy = Math.floor(pts[i + 1] / cl);
      if(i && cx === lx && cy === ly) continue; // la misma celda no se repite
      lx = cx; ly = cy; travelled++;
      if(dash){ const per = dash[0] + dash[1], k = (((travelled + (dash[2] || 0)) % per) + per) % per; if(k >= dash[0]) continue; }
      set(cx + lo, cy + lo, th, th);
    }
  });
}
// Muestreo de una elipse (o un arco) con paso menor que la celda para que el trazo no deje huecos
function pxsEllipsePts(x, y, rx, ry, a0, a1, cell){
  const R = Math.max(rx, ry, 1), n = Math.max(12, Math.min(900, Math.ceil(Math.abs(a1 - a0) * R / (cell * .8)))), pts = new Array(n * 2 + 2);
  for(let i = 0; i <= n; i++){ const a = a0 + (a1 - a0) * i / n; pts[i * 2] = x + Math.cos(a) * rx; pts[i * 2 + 1] = y + Math.sin(a) * ry; }
  return pts;
}
function pxsRing(x, y, rx, ry, layers, o){
  o = o || {}; const cell = o.cell || (pxsWmax(layers) >= 8 ? 4.4 : 2.2);
  return pxsPath(pxsEllipsePts(x, y, Math.max(1, rx), Math.max(1, ry), o.a0 || 0, o.a1 === undefined ? 6.2832 : o.a1, cell), layers, Object.assign({}, o, {cell}));
}
function pxsLine(x0, y0, x1, y1, layers, o){
  o = o || {}; const cell = o.cell || (pxsWmax(layers) >= 8 ? 4.4 : 2.2), n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (cell * .8))), pts = new Array(n * 2 + 2);
  for(let i = 0; i <= n; i++){ pts[i * 2] = x0 + (x1 - x0) * i / n; pts[i * 2 + 1] = y0 + (y1 - y0) * i / n; }
  return pxsPath(pts, layers, Object.assign({}, o, {cell}));
}
// Elipse rellena (color css, con alfa → tramado)
function pxsDisc(x, y, rx, ry, color, o){
  o = o || {}; rx = Math.max(.5, rx); ry = Math.max(.5, ry); const cell = o.cell || 4.4;
  return pxsCompose(x - rx, y - ry, x + rx, y + ry, cell, 1, [[color, cell]], o, (set, th, lo, cl) => {
    const j0 = Math.floor((y - ry) / cl), j1 = Math.floor((y + ry) / cl);
    for(let j = j0; j <= j1; j++){
      const dy = ((j + .5) * cl - y) / ry; if(dy < -1 || dy > 1) continue;
      const hw = Math.sqrt(1 - dy * dy) * rx, i0 = Math.round((x - hw) / cl), i1 = Math.round((x + hw) / cl);
      if(i1 > i0) set(i0, j, i1 - i0, 1);
    }
  });
}
