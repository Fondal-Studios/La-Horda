'use strict';
/* js/champions/vfx-unified/runtime.js — arte de habilidades UNIFICADO (generado por tools/art/ability-art/architect.py).
   Reemplaza el dibujo de decales y rayos de js/champions/vfx-b/pixfx.js por cuadros de píxel pintados con el canon
   (rampa de 5 tonos, contorno 1 px, alfa 0/255, luz arriba-izquierda). NO toca daño, alcance, duración, hitboxes ni azar:
   conserva nombre, nº de cuadros, borde = radio real y el tinte por arena (kvbTintPal). ?ua=0 vuelve al arte anterior. */
const ABA = {off: (function(){ try{ return /[?&](ua|kvb)=0\b/.test(location.search); }catch(e){ return false; } })(), done: {}, orig: {}};
function abaDecodeRle(s, n){
  const out = new Uint8Array(n); let p = 0, i = 0;
  while(i < s.length){ const d = s.charCodeAt(i++) - 48; let j = i; while(j < s.length && s[j] !== ';') j++; const run = parseInt(s.slice(i, j), 10); i = j + 1; out.fill(d, p, p + run); p += run; }
  return out;
}
function abaFrameCanvas(idx, W, H, pal){
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
  const rgb = pal.map(h => kvbRGB(h));
  for(let k = 0; k < idx.length; k++){ const t = idx[k]; if(!t) continue; const col = rgb[t - 1]; im.data[k * 4] = col[0]; im.data[k * 4 + 1] = col[1]; im.data[k * 4 + 2] = col[2]; im.data[k * 4 + 3] = 255; }
  g.putImageData(im, 0, 0); return c;
}
// kind 'decal' (anillo / sector / zona viva) o 'beam' (baldosa). frames = cadenas RLE; w, h = tamaño de pintura.
function abaReplace(kind, name, w, h, pal, frames){
  if(ABA.off || ABA.done[name] || typeof KVB_DEC === 'undefined') return;
  const tab = kind === 'beam' ? KVB_BEAM : KVB_DEC; if(!tab[name]) return;
  ABA.orig[name] = tab[name]; ABA.done[name] = true;
  const dec = frames.map(s => abaDecodeRle(s, w * h));
  const paint = (g, q, S, f) => {
    const p = kind === 'beam' ? pal : kvbTintPal(pal); // las zonas toman la paleta de la arena en curso; los rayos no se tiñen
    const i = Math.max(0, Math.min(dec.length - 1, f));
    g.imageSmoothingEnabled = false; g.drawImage(abaFrameCanvas(dec[i], w, h, p), 0, 0, w, h, 0, 0, kind === 'beam' ? S : S, kind === 'beam' ? h : S);
  };
  if(kind === 'beam') tab[name] = {N: dec.length, tileW: ABA.orig[name].tileW, H: ABA.orig[name].H, paint: (g, q, W, H, f) => { g.imageSmoothingEnabled = false; g.drawImage(abaFrameCanvas(dec[Math.max(0, Math.min(dec.length - 1, f))], w, h, pal), 0, 0, w, h, 0, 0, W, H); }, head: ABA.orig[name].head};
  else tab[name] = {N: ABA.orig[name].N, paint: (g, q, S, f, N) => { const i = Math.round(f / Math.max(1, N - 1) * (dec.length - 1)); g.imageSmoothingEnabled = false; g.drawImage(abaFrameCanvas(dec[Math.max(0, Math.min(dec.length - 1, i))], w, h, kvbTintPal(pal)), 0, 0, w, h, 0, 0, S, S); }};
  for(const k of Object.keys(KVB_CACHE)) if(k.startsWith(name + '@') || k === 'b:' + name) delete KVB_CACHE[k];
}
