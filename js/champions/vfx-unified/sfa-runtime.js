'use strict';
/* js/champions/vfx-unified/sfa-runtime.js — BORDE UNIFICADO para el motor skill-fx-a (generado por tools/art/ability-art/architect.py).
   El arte de cada tema (motivos, siluetas, colores) lo sigue horneando el motor; aquí se envuelve sfaBake para SUPERPONER, en el radio real,
   el borde pintado con el canon (aro con luz arriba-izquierda, contorno 1 px, marcas). La capa se pinta con la paleta del tema EFECTIVO
   (variantes ~h ~p ~k y tinte por arena). Solo (tipo|tema base|tamaño) con capa aprobada; el resto no cambia. No toca daño, alcance,
   duración ni azar. ?ua=0 vuelve al arte anterior. */
const ABS = {off: (function(){ try{ return /[?&](ua|sfa)=0\b/.test(location.search); }catch(e){ return false; } })(), map: {}, hits: 0, hooked: false, cache: new Map(), arena: null};
function abaSfaDecode(s, n){
  const out = new Uint8Array(n); let p = 0, i = 0;
  while(i < s.length){ const d = s.charCodeAt(i++) - 48; let j = i; while(j < s.length && s[j] !== ';') j++; const run = parseInt(s.slice(i, j), 10); i = j + 1; out.fill(d, p, p + run); p += run; }
  return out;
}
function abaSfaRgb(h){ const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function abaSfaOverlay(art, themes, size, w, h, frames){   // themes: nombre o lista de temas base que comparten esta capa
  if(ABS.off || typeof sfaBake !== 'function') return;
  const fr = frames.map(s => abaSfaDecode(s, w * h));
  for(const th of [].concat(themes)) ABS.map[art + '|' + th + '|' + size] = {w, h, fr};
  if(ABS.hooked) return; ABS.hooked = true;
  const orig = sfaBake;
  sfaBake = function(art, theme, size, arc){
    const base = orig.apply(this, arguments), o = ABS.map[art + '|' + String(theme).split('~')[0] + '|' + size];
    if(!o || !base || base.w !== o.w || base.h !== o.h || base.n !== o.fr.length) return base;
    const arena = sfaArenaKey(); if(arena !== ABS.arena){ ABS.cache.clear(); ABS.arena = arena; }
    const key = art + '|' + theme + '|' + size; let b = ABS.cache.get(key); if(b && b.src === base.cv) return b;
    let T = sfaTheme(theme); if(!T) return base;
    if(arena) T = sfaTintTheme(T, arena);
    const P = [T.pal.o, T.pal.d, T.pal.a, T.pal.b, T.pal.c].map(abaSfaRgb), n = o.fr.length;
    const cv = document.createElement('canvas'); cv.width = base.cv.width; cv.height = base.cv.height; const g = cv.getContext('2d'); g.drawImage(base.cv, 0, 0);
    const im = g.getImageData(0, 0, cv.width, cv.height);
    for(let f = 0; f < n; f++) for(let y = 0; y < o.h; y++) for(let x = 0; x < o.w; x++){ const t = o.fr[f][y * o.w + x]; if(!t) continue; const k = (y * cv.width + f * o.w + x) * 4, c = P[t - 1]; im.data[k] = c[0]; im.data[k + 1] = c[1]; im.data[k + 2] = c[2]; im.data[k + 3] = 255; }
    g.putImageData(im, 0, 0); b = {cv, w: base.w, h: base.h, n: base.n, src: base.cv}; ABS.cache.set(key, b); ABS.hits++; return b;
  };
}
