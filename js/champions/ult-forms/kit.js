'use strict';
/* ============================================================
   js/champions/ult-forms/kit.js — FORMAS ÚNICAS DE DEFINITIVA (ambas mitades del roster)
   Problema que resuelve: las definitivas se leían como "un anillo con humo" (círculo + polvo con otro color). Acá cada
   definitiva rehecha tiene su PROPIA silueta (columna, espiral, cadena, cuchillas cruzadas, meteoro con cráter, ola,
   cúpula, enjambre, rayo ramificado, portal, cometas, grieta, hongos, embudo, lluvia de flechas, haz giratorio,
   estandarte...), color dominante, movimiento y duración de rastro propios. Solo visual: no toca daño, enfriamientos,
   alcances ni hitboxes; el área real sigue marcada en la anticipación con marcas propias de cada forma sobre el radio real.
   Arte de píxel procedural (ART_BIBLE §14): cada fotograma se pinta una vez en un buffer de 32 bits, alfa 0/255, contorno
   de 1 px, 3 tonos por capa (+ acento), translucidez por tramado ordenado (Bayer 4x4), sin antialias ni shadowBlur.
   En juego es un drawImage por entrada del pool de pixfx.js (kvbAdd): sin partículas nuevas ni Math.random (hash fijo).
   Reduce efectos / vfxLoad bajo: se omite el rastro de suelo y el pool de pixfx ya baja a la mitad (prio: true solo en lo principal).
   Red: se reproduce con kvbFx('uf.<campeón>', x, y, r, ang) (ya viaja como evento del anfitrión).
   ?uf=0 en la URL (o window.UF_OFF) vuelve a los efectos anteriores de cada campeón (comparaciones antes/después).
   Una forma = {N cuadros, tall (alto relativo), paint(L, o) para la capa de arriba, gpaint(L, o) opcional para el suelo,
   rot (se orienta con el ángulo), dur, gdur}. Cada campeón elige forma + paleta (ult-forms/bind.js).
   ============================================================ */
const UF = {forms: {}, champs: {}, cache: new Map(), stats: {baked: 0, bakeMs: 0, played: 0}, off: (function(){ try{ return /[?&]uf=0\b/.test(location.search); }catch(e){ return false; } })()};
const ufIsOff = () => UF.off || window.UF_OFF === true;
const ufCol = hex => { const n = parseInt(hex.slice(1), 16); return (((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255)) >>> 0); };
const UF_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const ufDith = (x, y, d) => (UF_BAYER[((y & 3) << 2) + (x & 3)] + .5) / 16 < d;
const ufH = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const ufC = (v, a, b) => v < a ? a : v > b ? b : v;
const ufEase = k => 1 - (1 - k) * (1 - k), ufIn = k => k * k, ufSm = k => k * k * (3 - 2 * k);
const ufLerp = (a, b, k) => a + (b - a) * k;

/* ---------------- buffer de píxeles y primitivas ---------------- */
const ufBuf = (w, h) => ({w, h, d: new Uint32Array(w * h)});
function ufPx(B, x, y, c){ if(x < 0 || y < 0) return; x |= 0; y |= 0; if(x >= B.w || y >= B.h) return; B.d[y * B.w + x] = c; }
function ufDisc(B, cx, cy, r, c, dens, keep){
  const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(B.w - 1, Math.ceil(cx + r)), y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(B.h - 1, Math.ceil(cy + r));
  for(let y = y0; y <= y1; y++) for(let x = x0; x <= x1; x++){ const dx = x + .5 - cx, dy = y + .5 - cy; if(dx * dx + dy * dy > r * r) continue; if(dens !== undefined && dens < 1 && !ufDith(x, y, dens)) continue; if(keep && !keep(x, y)) continue; B.d[y * B.w + x] = c; }
}
// elipse rellena (rx, ry)
function ufEll(B, cx, cy, rx, ry, c, dens, keep){
  const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(B.w - 1, Math.ceil(cx + rx)), y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(B.h - 1, Math.ceil(cy + ry));
  for(let y = y0; y <= y1; y++) for(let x = x0; x <= x1; x++){ const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if(dx * dx + dy * dy > 1) continue; if(dens !== undefined && dens < 1 && !ufDith(x, y, dens)) continue; if(keep && !keep(x, y)) continue; B.d[y * B.w + x] = c; }
}
// anillo / arco: o = {a0, a1 (arco), dash: {n, on, ph}, keep, rx, ry}
function ufRing(B, cx, cy, r, th, c, o){
  o = o || {}; const rx = o.rx || r, ry = o.ry || r, R = Math.max(rx, ry) + th + 1, x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(B.w - 1, Math.ceil(cx + R)), y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(B.h - 1, Math.ceil(cy + R));
  for(let y = y0; y <= y1; y++) for(let x = x0; x <= x1; x++){
    const dx = x + .5 - cx, dy = y + .5 - cy; let e; if(o.rx || o.ry){ const d = Math.hypot(dx / rx, dy / ry) || 1e-6, g = Math.hypot(dx / (rx * rx), dy / (ry * ry)) / d; e = (d - 1) / (g || 1e-6); } else e = Math.hypot(dx, dy) - r; if(e > 0 || e < -th) continue;
    const a = Math.atan2(dy, dx); if(o.a1 !== undefined){ let d = a - o.a0; d = ((d % 6.2832) + 6.2832) % 6.2832; if(d > o.a1) continue; }
    if(o.dash && ((a + Math.PI) / 6.2832 * o.dash.n + (o.dash.ph || 0)) % 1 > o.dash.on) continue;
    if(o.keep && !o.keep(x, y)) continue; B.d[y * B.w + x] = c;
  }
}
// línea gruesa (th px) con tramado opcional
function ufLine(B, x0, y0, x1, y1, th, c, dens){
  const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(L)), hh = Math.max(.5, th / 2);
  for(let i = 0; i <= n; i++){ const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u;
    if(th <= 1.2){ if(dens === undefined || ufDith(x | 0, y | 0, dens)) ufPx(B, x, y, c); } else ufDisc(B, x, y, hh, c, dens); }
}
// polígono relleno (par-impar)
function ufPoly(B, pts, c, dens, keep){
  let y0 = 1e9, y1 = -1e9; for(const p of pts){ if(p[1] < y0) y0 = p[1]; if(p[1] > y1) y1 = p[1]; }
  y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(B.h - 1, Math.ceil(y1));
  for(let y = y0; y <= y1; y++){ const yy = y + .5, xs = [];
    for(let i = 0, n = pts.length; i < n; i++){ const a = pts[i], b = pts[(i + 1) % n]; if((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) xs.push(a[0] + (yy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((p, q) => p - q);
    for(let k = 0; k + 1 < xs.length; k += 2) for(let x = Math.max(0, Math.round(xs[k])); x < Math.min(B.w, Math.round(xs[k + 1])); x++){ if(dens !== undefined && dens < 1 && !ufDith(x, y, dens)) continue; if(keep && !keep(x, y)) continue; B.d[y * B.w + x] = c; }
  }
}
// mapa de píxeles a mano: filas de texto + {letra: color uint}; (cx, cy) = centro; o.flip, o.sc, o.keep
function ufBmp(B, rows, map, cx, cy, o){
  o = o || {}; const sc = o.sc || 1, w = rows[0].length, h = rows.length, ox = Math.round(cx - w * sc / 2), oy = Math.round(cy - h * sc / 2);
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){ const ch = rows[y][o.flip ? w - 1 - x : x]; if(ch === '.' || !map[ch]) continue;
    for(let j = 0; j < sc; j++) for(let i = 0; i < sc; i++){ const px = ox + x * sc + i, py = oy + y * sc + j; if(o.keep && !o.keep(px, py)) continue; ufPx(B, px, py, map[ch]); } }
}
// contorno de 1 px (4 vecinos) alrededor de lo pintado
function ufOutline(B, c){
  const w = B.w, h = B.h, s = B.d, o = new Uint32Array(s);
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){ const i = y * w + x; if(s[i]) continue;
    if((x > 0 && s[i - 1]) || (x < w - 1 && s[i + 1]) || (y > 0 && s[i - w]) || (y < h - 1 && s[i + w])) o[i] = c; }
  B.d.set(o);
}
// pixel que sobrevive a un disolver k (0 = todo, 1 = nada), hash fijo
const ufKeep = (k, seed) => (x, y) => ufH(x + (seed || 0), y * 7 + 3) >= k;

/* ---------------- marcas del borde real (anticipación): cada forma elige las suyas ---------------- */
const UF_MARK = {
  tick:    (B, x, y, a, c) => ufLine(B, x - Math.cos(a) * 3, y - Math.sin(a) * 3, x + Math.cos(a) * 3, y + Math.sin(a) * 3, 1, c),
  diamond: (B, x, y, a, c) => { ufPx(B, x, y - 2, c); ufPx(B, x - 1, y - 1, c); ufPx(B, x + 1, y - 1, c); ufPx(B, x - 2, y, c); ufPx(B, x + 2, y, c); ufPx(B, x - 1, y + 1, c); ufPx(B, x + 1, y + 1, c); ufPx(B, x, y + 2, c); },
  chev:    (B, x, y, a, c) => { const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca; ufLine(B, x - ca * 3 + nx * 3, y - sa * 3 + ny * 3, x + ca * 2, y + sa * 2, 1, c); ufLine(B, x - ca * 3 - nx * 3, y - sa * 3 - ny * 3, x + ca * 2, y + sa * 2, 1, c); },
  cross:   (B, x, y, a, c) => { ufLine(B, x - 2, y - 2, x + 2, y + 2, 1, c); ufLine(B, x - 2, y + 2, x + 2, y - 2, 1, c); },
  dot:     (B, x, y, a, c) => { ufPx(B, x, y, c); ufPx(B, x + 1, y, c); ufPx(B, x, y + 1, c); ufPx(B, x + 1, y + 1, c); },
  brack:   (B, x, y, a, c) => { const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca; ufLine(B, x + nx * 4, y + ny * 4, x - nx * 4, y - ny * 4, 1, c); ufLine(B, x + nx * 4, y + ny * 4, x + nx * 4 - ca * 3, y + ny * 4 - sa * 3, 1, c); ufLine(B, x - nx * 4, y - ny * 4, x - nx * 4 - ca * 3, y - ny * 4 - sa * 3, 1, c); },
  hex:     (B, x, y, a, c) => { for(let i = 0; i < 6; i++){ const a0 = i * 1.0472 + a, a1 = a0 + 1.0472; ufLine(B, x + Math.cos(a0) * 3, y + Math.sin(a0) * 3, x + Math.cos(a1) * 3, y + Math.sin(a1) * 3, 1, c); } },
  spark:   (B, x, y, a, c) => { ufPx(B, x, y, c); ufPx(B, x - 1, y, c); ufPx(B, x + 1, y, c); ufPx(B, x, y - 1, c); ufPx(B, x, y + 1, c); ufPx(B, x, y - 3, c); ufPx(B, x, y + 3, c); ufPx(B, x - 3, y, c); ufPx(B, x + 3, y, c); }
};
// n marcas sobre el radio REAL R (px), a partir del ángulo a0, con el estilo 'kind', orientadas radialmente (o.fixed = ángulo fijo)
function ufEdgeMarks(B, o, n, kind, c, a0, scale, fixed){
  const f = UF_MARK[kind] || UF_MARK.dot, R = o.R * (scale || 1);
  for(let i = 0; i < n; i++){ const a = (a0 || 0) + i * 6.2832 / n; f(B, o.cx + Math.cos(a) * R, o.cy + Math.sin(a) * R, fixed === undefined ? a : fixed, c); }
}

/* ---------------- fases comunes ---------------- */
// q = 0..1 a lo largo de la vida. ant = anticipación (0-.2), hit = impacto (.2-.4), post = disipación (.4-1)
const ufPhase = q => ({q, ant: ufC(q / .2, 0, 1), hit: ufC((q - .2) / .2, 0, 1), post: ufC((q - .4) / .6, 0, 1)});

/* ---------------- registro y horneado ---------------- */
function ufDefForm(id, spec){ UF.forms[id] = Object.assign({N: 20, tall: 1, dur: 1200, gdur: 0, rot: false, shake: 0, pad: 2}, spec); }
function ufChamp(key, spec){ UF.champs[key] = spec; }
const ufHas = key => !ufIsOff() && !!UF.champs[key];
const UF_BUCKET = [24, 32, 40, 48, 56, 64, 72];
function ufRpx(R){ const t = R / 4.3; let best = UF_BUCKET[0]; for(const b of UF_BUCKET) if(Math.abs(b - t) < Math.abs(best - t)) best = b; return best; }
// Horneado por tandas: un "trabajo" por (campeón, capa, tamaño). El horneado previo lo avanza en cortes de pocos ms en tiempo ocioso;
// si la definitiva se lanza antes de terminar, ufBake completa el resto de una vez (nunca falta un cuadro).
function ufJob(key, layerName, Rpx){
  const ck = key + ':' + layerName + '@' + Rpx, hit = UF.cache.get(ck); if(hit) return hit;
  const C = UF.champs[key], F = C && UF.forms[C.form]; if(!F) return null;
  const paint = layerName === 'g' ? F.gpaint : F.paint; if(!paint) return null;
  const pad = F.pad, W = 2 * (Rpx + pad), H = Math.round(W * F.tall), P = {}, pal = {}; for(const k in C.pal){ pal[k] = C.pal[k]; P[k] = ufCol(C.pal[k]); }
  const job = {key, layerName, Rpx, C, F, paint, W, H, cx: W / 2, cy: H - W / 2, P, pal, frames: [], done: false, ms: 0};
  UF.cache.set(ck, job); return job;
}
function ufStep(job, budget){
  const t0 = performance.now(), F = job.F;
  while(job.frames.length < F.N){
    const f = job.frames.length, q = f / (F.N - 1), L = {soft: ufBuf(job.W, job.H), hard: ufBuf(job.W, job.H)};
    job.paint(L, {W: job.W, H: job.H, cx: job.cx, cy: job.cy, R: job.Rpx, P: job.P, pal: job.pal, q, f, N: F.N, ph: ufPhase(q), key: job.key});
    ufOutline(L.hard, job.P.o);
    const cv = document.createElement('canvas'); cv.width = job.W; cv.height = job.H; const g = cv.getContext('2d'), im = g.createImageData(job.W, job.H), d = new Uint32Array(im.data.buffer);
    for(let i = 0; i < d.length; i++) d[i] = L.hard.d[i] || L.soft.d[i];
    g.putImageData(im, 0, 0); job.frames.push(cv);
    if(budget && performance.now() - t0 > budget) break;
  }
  const dt = performance.now() - t0; job.ms += dt; UF.stats.bakeMs += dt;
  if(job.frames.length >= F.N && !job.done){ job.done = true; UF.stats.baked++; }
  return job.done;
}
function ufBake(key, layerName, Rpx){ const job = ufJob(key, layerName, Rpx); if(!job) return null; if(!job.done) ufStep(job, 0); return job; }

/* ---------------- borde de zona persistente ----------------
   Algunas definitivas dejan una zona de estado (anillo + relleno + motivos del motor de la mitad A). Para las que tienen forma propia, la zona se dibuja
   solo como borde de trazos sueltos (el área real sigue marcada, pero no como un disco): ufZoneEdge(clave, x, y, r, alfa) devuelve true si la dibujó. */
UF.edge = {};
UF.lite = {};   // 'campeón' (zona ligada al héroe) o 'campeón:tipo' (objeto de zona) -> true: se dibuja solo el borde
function ufEdgeFrames(key, Rpx){
  const ck = key + '@' + Rpx, hit = UF.edge[ck]; if(hit) return hit; const C = UF.champs[key]; if(!C) return null;
  const P = {}, W = 2 * (Rpx + 3), frames = []; for(const k in C.pal) P[k] = ufCol(C.pal[k]);
  for(let f = 0; f < 8; f++){
    const B = ufBuf(W, W), c = W / 2;
    ufRing(B, c, c, Rpx, 2, P.a, {dash: {n: 22, on: .5, ph: f / 8}}); ufRing(B, c, c, Rpx - 2, 1, P.b, {dash: {n: 22, on: .5, ph: f / 8}});
    for(let i = 0; i < 6; i++){ const a = i * 1.0472 + f * .1; UF_MARK.diamond(B, c + Math.cos(a) * Rpx, c + Math.sin(a) * Rpx, a, P.c); }
    ufOutline(B, P.o); const cv = document.createElement('canvas'); cv.width = W; cv.height = W; const g = cv.getContext('2d'), im = g.createImageData(W, W); new Uint32Array(im.data.buffer).set(B.d); g.putImageData(im, 0, 0); frames.push(cv);
  }
  return UF.edge[ck] = {frames, W};
}
function ufZoneEdge(key, x, y, r, alpha){
  if(!UF.lite[key] || ufIsOff() || !(r > 8)) return false;
  const Rpx = ufRpx(r), e = ufEdgeFrames(key.split(':')[0], Rpx); if(!e) return false;
  const k = r / Rpx, D = e.W * k, f = ((animNow / 120) | 0) % 8;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = Math.min(1, alpha * 1.1); ctx.drawImage(e.frames[f], x - D / 2, y - D / 2, D, D); ctx.restore(); ctx.globalAlpha = 1; return true;
}
const ufCalm = () => typeof JUICE !== 'undefined' && !!JUICE.reduceFx;
const ufLite = () => ufCalm() || (typeof vfxLoad === 'number' && vfxLoad < .6);
// Reproduce la forma de un campeón: (x, y) centro, R radio real (unidades de mundo), ang = dirección (formas orientadas)
function ufPlay(key, x, y, R, ang){
  if(ufIsOff() || !Number.isFinite(x) || !Number.isFinite(y) || !(R > 6)) return;
  const C = UF.champs[key], F = C && UF.forms[C.form]; if(!F) return;
  R = Math.max(C.minR || 30, Math.min(420, R)); const Rpx = ufRpx(R), k = R / Rpx, ent = [];
  const mk = (layerName, dur, layer, extra) => { const b = ufBake(key, layerName, Rpx); if(!b) return null;
    const e = kvbAdd(Object.assign({frames: b.frames, x, y, w: b.W * k, h: b.H * k, rot: F.rot ? (ang || 0) : 0, dur, layer, ax: .5, ay: b.cy / b.H, alpha: 1, fadeAt: .88, prio: true}, extra)); if(e) ent.push(e); return e; };
  mk('t', (C.dur || F.dur), 't');
  if(F.gpaint && !ufLite()) mk('g', (C.gdur || F.gdur || F.dur * 1.5), 'g', {fadeAt: .7, prio: false});
  UF.stats.played++;
  const sh = F.shake; if(sh && !(typeof kvbCalm === 'function' && kvbCalm()) && typeof vfxShake === 'function') vfxShake(sh);
  return ent;
}
// punto de entrada con nombre vfx*: el filtro de habilidades (tools/bible/ability-gate.js) cuenta como "efecto visual" toda llamada a vfx*; no viaja por la red por sí
// mismo (ya viaja dentro de kvbFx, que se repite en los invitados: registrarlo también lo dibujaría dos veces)
function vfxUltForm(key, x, y, R, ang){ return ufPlay(key, x, y, R, ang); }
(function(){
  if(typeof KVB_FX === 'undefined') return;
  // un id por campeón: 'uf.<clave>'
  UF.register = key => { KVB_FX['uf.' + key] = (x, y, r, ang) => vfxUltForm(key, x, y, r, ang); };
})();
// Horneado previo en tiempo ocioso: R de la definitiva y los dos tamaños vecinos, en cortes de ~4 ms cada 40 ms
function ufPrebake(key){
  const cls = typeof CLASSES !== 'undefined' && CLASSES[key]; if(!cls || !UF.champs[key]) return;
  const r0 = Math.max(60, Math.min(420, (cls.ultimate && cls.ultimate.radius) || 150)), jobs = [], base = ufRpx(r0), i0 = UF_BUCKET.indexOf(base), F = UF.forms[UF.champs[key].form];
  for(const rp of [base, UF_BUCKET[Math.min(UF_BUCKET.length - 1, i0 + 1)], UF_BUCKET[Math.max(0, i0 - 1)]]){ const j = ufJob(key, 't', rp); if(j) jobs.push(j); if(F.gpaint){ const g = ufJob(key, 'g', rp); if(g) jobs.push(g); } }
  (function step(){ while(jobs.length && jobs[0].done) jobs.shift(); const j = jobs[0]; if(!j) return; try{ ufStep(j, 4); }catch(e){ jobs.shift(); } setTimeout(step, 40); })();
}
(function(){
  if(typeof startRun !== 'function') return;
  const sr = startRun;
  startRun = function(){ const r = sr.apply(this, arguments); try{ for(const h of heroes) if(h && UF.champs[h.classKey]) ufPrebake(h.classKey); }catch(e){} return r; };
})();
