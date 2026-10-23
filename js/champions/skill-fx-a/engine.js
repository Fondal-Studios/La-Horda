'use strict';
/* ============================================================
   js/champions/skill-fx-a/engine.js — SPRITES DE EFECTO PROPIOS DE HABILIDAD (mitad A del roster)
   Arte de píxel procedural: cada efecto se hornea UNA vez en una tira de cuadros (canvas fuera de pantalla, alfa 0/255,
   contorno oscuro de 1 px, 3 tonos por color, tramado ordenado en vez de degradados) con la paleta del campeón y sus
   motivos (relojes, engranajes, notas, cadenas, escarabajos...). En juego es un drawImage por efecto: sin partículas
   nuevas, sin shadowBlur, pool fijo.
   Cada efecto cuenta con tres tiempos: ANTICIPACIÓN (el área verdadera, punteada, con marcas que convergen),
   IMPACTO (frente que barre el área real) y DISIPACIÓN (el contorno se afina y los motivos se deshacen).
   El radio de cada nova/zona es el de la habilidad real: el contorno exterior es el borde de la hitbox y el arte va dentro.
   Solo cosmético: no toca daño, alcance, enfriamientos, duraciones ni hitboxes.
   Red: vfxSfaPlay viaja como evento del anfitrión (NET_EVENT_FNS) con argumentos numéricos; los efectos derivados de
   objetos (zonas) se dibujan en cada cliente desde el estado sincronizado.
   "Reducir efectos intensos" (JUICE.reduceFx) recorta la cantidad y los motivos decorativos.
   ============================================================ */
const SFA_POOL_MAX = 40;
const sfaPool = [];
const sfaCache = new Map();
let sfaCacheArena = null;
const sfaThemes = {};
let sfaLastT = 0;
const sfaStats = {baked: 0, bakeMs: 0, drawn: 0};

const sfaCol = hex => { const n = parseInt(hex.slice(1), 16); return (((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255)) >>> 0); };
const sfaHash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const SFA_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const sfaDither = (x, y, density) => (SFA_BAYER[((y & 3) << 2) + (x & 3)] + .5) / 16 < density;
// Techo de relleno trameado de los decales de área (nova / zona / cono): ~20–25 % de los píxeles, el anillo exterior manda (docs/vfx/decal-legible)
const SFA_FILL = .24;
const sfaClamp = (v, a, b) => v < a ? a : v > b ? b : v;
const sfaEase = k => 1 - (1 - k) * (1 - k);

/* ---------------- tira de cuadros ---------------- */
class SfaStrip {
  constructor(w, h, n) { this.w = w; this.h = h; this.n = n; this.W = w * n; this.d = new Uint32Array(this.W * h); }
  set(f, x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.W + f * this.w + x] = c; }
  get(f, x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0; return this.d[y * this.W + f * this.w + x]; }
  toCanvas() {
    const cv = document.createElement('canvas'); cv.width = this.W; cv.height = this.h;
    const g = cv.getContext('2d'), im = g.createImageData(this.W, this.h);
    new Uint32Array(im.data.buffer).set(this.d); g.putImageData(im, 0, 0); return cv;
  }
}

/* ---------------- motivos: arte de píxel a mano en motifs.js (SFA_MOTIF_SRC). o contorno, d sombra, a color, b luz, c brillo, e acento ---------------- */
const sfaMotifCache = {};
function sfaMotif(name) {
  let m = sfaMotifCache[name]; if (m) return m;
  const rows = SFA_MOTIF_SRC[name] || SFA_MOTIF_SRC.spark, w = Math.max(...rows.map(r => r.length));
  m = sfaMotifCache[name] = {w, h: rows.length, rows}; return m;
}
function sfaStamp(S, f, name, cx, cy, T, keep, flip, sc) {
  sc = sc || 1; const m = sfaMotif(name), ox = Math.round(cx - m.w * sc / 2), oy = Math.round(cy - m.h * sc / 2), pal = T.px;
  for (let y = 0; y < m.h; y++) { const row = m.rows[y];
    for (let x = 0; x < m.w; x++) {
      const ch = row[flip ? m.w - 1 - x : x]; if (!ch || ch === '.') continue;
      const c = pal[ch]; if (!c) continue;
      for (let j = 0; j < sc; j++) for (let i = 0; i < sc; i++) { const px = ox + x * sc + i, py = oy + y * sc + j; if (keep && !keep(px, py)) continue; S.set(f, px, py, c); }
    } }
}

/* ---------------- siluetas del frente (siempre <= 1: el borde exterior del área verdadera no se excede) ---------------- */
const SFA_SHAPE = {
  round:   () => 1,
  gear:    th => Math.sin(th * 8) > 0 ? 1 : .9,
  scallop: th => .92 + .08 * Math.abs(Math.sin(th * 4)),
  tri:     th => { const a = ((th + Math.PI / 2) % (Math.PI * 2 / 3) + Math.PI * 2 / 3) % (Math.PI * 2 / 3) - Math.PI / 3; return .5 / Math.cos(a); },
  hex:     th => { const a = ((th % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3) - Math.PI / 6; return .866 / Math.cos(a); },
  square:  th => { let a = ((th % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2); if (a > Math.PI / 4) a -= Math.PI / 2; return .707 / Math.cos(a); },
  spike:   th => .78 + .22 * (Math.abs(Math.sin(th * 5)) > .8 ? 1 : .0) + .0,
  sun:     th => Math.sin(th * 12) > .55 ? 1 : .86,
  wave:    th => .93 + .07 * Math.sin(th * 7),
  petal:   th => .78 + .22 * Math.abs(Math.cos(th * 3)),
  glitch:  th => (Math.floor((th + Math.PI) * 5) % 2) ? 1 : .88
};

/* ---------------- primitivas de dibujo ---------------- */
function sfaRing(S, f, c, R, band, T, o) {
  o = o || {}; const shp = SFA_SHAPE[o.shape || T.shape] || SFA_SHAPE.round, P = T.px, keep = o.keep, dash = o.dash;
  const x0 = Math.max(0, Math.floor(c - R - 2)), x1 = Math.min(S.w - 1, Math.ceil(c + R + 2));
  for (let y = x0; y <= x1; y++) for (let x = x0; x <= x1; x++) {
    const dx = x + .5 - c, dy = y + .5 - c, d = Math.hypot(dx, dy), th = Math.atan2(dy, dx), e = R * shp(th) - d;
    if (e < -1 || e > band + 1) continue;
    if (keep && !keep(x, y, th)) continue;
    if (dash && ((th + Math.PI) / (Math.PI * 2) * dash.n + dash.ph) % 1 > dash.on) continue;
    let col;
    if (e < 0) col = P.o; else if (e < 1) col = o.rim ? P[o.rim] : P.b; else if (e < band - 1) col = P.a; else if (e < band) col = P.d; else col = band >= 3 ? P.o : 0;
    if (col) S.set(f, x, y, col);
  }
}
function sfaDisc(S, f, c, R, col, density, T, o) {
  o = o || {}; const shp = SFA_SHAPE[o.shape || T.shape] || SFA_SHAPE.round, keep = o.keep;
  const x0 = Math.max(0, Math.floor(c - R - 1)), x1 = Math.min(S.w - 1, Math.ceil(c + R + 1));
  for (let y = x0; y <= x1; y++) for (let x = x0; x <= x1; x++) {
    const dx = x + .5 - c, dy = y + .5 - c, d = Math.hypot(dx, dy);
    if (d > R * (o.noShape ? 1 : shp(Math.atan2(dy, dx)))) continue;
    if (!sfaDither(x, y, density * (o.grad ? .5 + .5 * d / R : 1))) continue;
    if (keep && !keep(x, y, 0)) continue;
    S.set(f, x, y, col);
  }
}
// contorno punteado del área verdadera (borde de la hitbox)
function sfaTrueEdge(S, f, c, R, T, a, ph) { sfaRing(S, f, c, R, 1, T, {shape: 'round', rim: 'a', dash: {n: 28, on: a === undefined ? .55 : a, ph: ph || 0}}); }
const sfaDissolve = (k, seed) => (x, y) => sfaHash(x + (seed || 0), y) >= k;

/* ---------------- NOVA: anticipación (2) + impacto (5) + disipación (5) ---------------- */
const SFA_NOVA_N = 12, SFA_NOVA_A = 2, SFA_NOVA_I = 5;
function sfaBakeNova(T, size, o) {
  const S = new SfaStrip(size, size, SFA_NOVA_N), c = size / 2, R = c - 1.5, N = o && o.motifs || T.nMotif;
  const mot = T.motifs, big = size >= 64, ms = size >= 72 ? 2 : 1, bw = 3 + (size >= 48 ? 1 : 0) + (size >= 72 ? 1 : 0);
  for (let f = 0; f < SFA_NOVA_N; f++) {
    if (f < SFA_NOVA_A) {          // ANTICIPACIÓN: borde verdadero punteado + marcas que convergen + núcleo
      sfaTrueEdge(S, f, c, R, T, .62, f * .15);
      sfaDisc(S, f, c, R * .16 + f * 2, T.px.d, .7, T, {noShape: true});
      const rr = R * (.9 - .3 * f);
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + (f ? .2 : 0); sfaStamp(S, f, 'spark', c + Math.cos(a) * rr, c + Math.sin(a) * rr, T, null, false, ms); }
      sfaDisc(S, f, c, 2 + f * 2, T.px.c, 1, T, {noShape: true});
    } else if (f < SFA_NOVA_A + SFA_NOVA_I) {   // IMPACTO: el frente barre el área real
      const k = (f - SFA_NOVA_A + 1) / SFA_NOVA_I, front = R * sfaEase(k) * .97;
      sfaDisc(S, f, c, front, T.px.d, SFA_FILL - k * .1, T, {grad: true});
      sfaDisc(S, f, c, front * .7, T.px.a, SFA_FILL * .6 - k * .06, T, {});
      if (k < .45) sfaDisc(S, f, c, R * .22 * (1 - k * 1.8), T.px.c, .85, T, {noShape: true});
      sfaRing(S, f, c, front, bw + (k < .6 ? 1 : 0), T, {});
      if (k > .2) for (let i = 0; i < N; i++) { const a = i * Math.PI * 2 / N + k * .5; sfaStamp(S, f, mot[i % mot.length], c + Math.cos(a) * front * .94, c + Math.sin(a) * front * .94, T, null, false, ms); }
      if (big && k > .35) for (let i = 0; i < 6; i++) { const a = i * Math.PI * 2 / 6 + 1 + k, rr = front * .55; sfaStamp(S, f, mot[(i + 1) % mot.length], c + Math.cos(a) * rr, c + Math.sin(a) * rr, T, null, false, ms); }
      sfaTrueEdge(S, f, c, R, T, .45, f * .1);
    } else {                        // DISIPACIÓN: el anillo se afina y los motivos se deshacen hacia afuera
      const k = (f - SFA_NOVA_A - SFA_NOVA_I + 1) / (SFA_NOVA_N - SFA_NOVA_A - SFA_NOVA_I), keep = sfaDissolve(k * .95, f);
      sfaDisc(S, f, c, R * .96, T.px.d, SFA_FILL * .8 * (1 - k), T, {grad: true, keep});
      sfaRing(S, f, c, R * .96, k < .5 ? bw - 1 : 2, T, {keep});
      for (let i = 0; i < N; i++) { const a = i * Math.PI * 2 / N + .5 + k * .3, rr = R * (.94 + k * .1); sfaStamp(S, f, mot[i % mot.length], c + Math.cos(a) * rr, c + Math.sin(a) * rr - k * 5, T, sfaDissolve(k * .9, i * 7 + f), false, ms); }
      sfaTrueEdge(S, f, c, R, T, .4 * (1 - k), f * .1);
      if (k < .8) sfaStamp(S, f, T.emblem, c, c - k * 3, T, sfaDissolve(k, 3), false, ms);
    }
  }
  return S;
}

/* ---------------- ZONA persistente (bucle de 8 cuadros: borde punteado girando, motivos en órbita, emblema) ---------------- */
const SFA_ZONE_N = 8;
function sfaBakeZone(T, size, inner) {
  inner = inner || 0;
  const S = new SfaStrip(size, size, SFA_ZONE_N), c = size / 2, R = c - 1.5, mot = T.motifs, M = size >= 64 ? 8 : 6, ms = size >= 72 ? 2 : 1;
  const band = inner ? {keep: (x, y) => Math.hypot(x + .5 - c, y + .5 - c) >= R * inner - 1} : {};
  for (let f = 0; f < SFA_ZONE_N; f++) {
    const ph = f / SFA_ZONE_N;
    sfaDisc(S, f, c, R * .98, T.px.d, SFA_FILL * .7, T, Object.assign({grad: true}, band));
    sfaDisc(S, f, c, R * .6, T.px.a, SFA_FILL * .32, T, inner ? {keep: band.keep} : {});
    sfaRing(S, f, c, R * .96, 3, T, {dash: {n: 16, on: .66, ph: -ph}});
    if (inner) sfaRing(S, f, c, R * inner, 2, T, {shape: 'round', dash: {n: 18, on: .7, ph: ph}});
    else sfaRing(S, f, c, R * .64, 1, T, {shape: 'round', rim: 'a', dash: {n: 10, on: .5, ph: ph}});
    sfaTrueEdge(S, f, c, R, T, .55, ph * .5);
    const mr = inner ? R * (1 + inner) / 2 * .98 : R * .8;
    for (let i = 0; i < M; i++) { const a = i * Math.PI * 2 / M + ph * Math.PI * 2 / M * 2, bob = Math.sin((ph + i / M) * Math.PI * 2) * 1.2; sfaStamp(S, f, mot[i % mot.length], c + Math.cos(a) * mr, c + Math.sin(a) * mr + bob, T, null, false, ms); }
    if (!inner) sfaStamp(S, f, T.emblem, c, c, T, null, false, ms);
    for (let i = 0; i < 4; i++) { const u = (ph + i / 4) % 1, a = i * 2.1 + 1, rr = R * (inner ? (inner + (1 - inner) * ((i * 37) % 10) / 12) : .2 + .35 * ((i * 37) % 10) / 10); if (u < .85) sfaStamp(S, f, 'spark', c + Math.cos(a) * rr, c + Math.sin(a) * rr - u * 10, T, sfaDissolve(u * .9, i)); }
  }
  return S;
}

/* ---------------- CONO: barrido de un abanico (apex a la izquierda, centro vertical) ---------------- */
const SFA_CONE_N = 10;
function sfaBakeCone(T, size, arc) {
  const h = Math.ceil(2 * size * Math.sin(Math.min(arc, 1.5)) + 6), S = new SfaStrip(size + 2, h, SFA_CONE_N), cy = h / 2, R = size - 1, mot = T.motifs;
  const inW = (x, y) => { const dx = x + .5 - 1, dy = y + .5 - cy, d = Math.hypot(dx, dy); return d <= R && d > 1 && Math.abs(Math.atan2(dy, dx)) <= arc; };
  for (let f = 0; f < SFA_CONE_N; f++) {
    const k = f < 2 ? 0 : f < 7 ? (f - 1) / 5 : 1, tail = f >= 7 ? (f - 6) / 3 : 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < S.w; x++) {
      if (!inW(x, y)) continue;
      const dx = x + .5 - 1, dy = y + .5 - cy, d = Math.hypot(dx, dy), th = Math.atan2(dy, dx), edge = !inW(x + 1, y) || !inW(x - 1, y) || !inW(x, y + 1) || !inW(x, y - 1);
      if (edge) { if (f < 2) { if (((x + y) & 3) < 2) S.set(f, x, y, T.px.a); } else if (sfaHash(x, y + f) >= tail) S.set(f, x, y, ((x + y) & 1) || f < 7 ? T.px.b : T.px.a); continue; }
      if (f < 2) { if (sfaDither(x, y, .24)) S.set(f, x, y, T.px.d); continue; }
      const front = -arc + 2 * arc * k, behind = th - front;   // el frente barre de arriba a abajo
      if (f < 7) {
        if (Math.abs(behind) < .09 && d > R * .25) S.set(f, x, y, d > R * .8 ? T.px.c : T.px.b);
        else if (Math.abs(behind) < .2 && d > R * .25) S.set(f, x, y, T.px.a);
        else if (behind < 0 && sfaDither(x, y, SFA_FILL * 1.2 * (1 + behind / (2 * arc)) + .05)) S.set(f, x, y, behind > -.7 ? T.px.a : T.px.d);
      } else if (sfaDither(x, y, SFA_FILL * .8 * (1 - tail)) && sfaHash(x, y) >= tail) S.set(f, x, y, T.px.d);
    }
    if (f >= 2) for (let i = 0; i < 5; i++) { const a = -arc * .75 + i * arc * .375, rr = R * (.45 + .1 * (i % 2) + (f - 2) * .04); sfaStamp(S, f, mot[i % mot.length], 1 + Math.cos(a) * rr, cy + Math.sin(a) * rr, T, tail ? sfaDissolve(tail, i + f) : null); }
  }
  return S;
}

/* ---------------- HAZ: teja de 16 px que fluye a lo largo de la línea (+ casquete en la cabeza) ---------------- */
const SFA_BEAM_N = 8;
function sfaBakeBeam(T, H) {
  const S = new SfaStrip(16, H, SFA_BEAM_N), c = H / 2, P = T.px;
  for (let f = 0; f < SFA_BEAM_N; f++) {
    for (let y = 0; y < H; y++) { const e = Math.abs(y + .5 - c) / (H / 2);
      for (let x = 0; x < 16; x++) {
        const flow = ((x - f * 2) % 16 + 16) % 16;
        let col = 0;
        if (e > .86) col = P.o; else if (e > .68) col = flow < 9 ? P.a : P.d; else if (e > .4) col = flow < 6 ? P.b : P.a; else col = (flow < 4) ? P.c : (flow < 11 ? P.b : P.a);
        if (e <= .86 && e > .55 && flow > 12 && sfaDither(x, y, .5)) col = P.d;
        if (col) S.set(f, x, y, col);
      } }
    if (H >= 12) { const m = T.motifs[0]; sfaStamp(S, f, m, ((8 - f * 2) % 16 + 16) % 16, c, T); }
  }
  return S;
}

/* ---------------- ESTALLIDO radial pequeño (punto de impacto, eco, invocación) ---------------- */
const SFA_BURST_N = 8;
function sfaBakeBurst(T, size) {
  const S = new SfaStrip(size, size, SFA_BURST_N), c = size / 2, R = c - 1.5, mot = T.motifs;
  for (let f = 0; f < SFA_BURST_N; f++) {
    const k = f / (SFA_BURST_N - 1);
    if (f < 3) sfaDisc(S, f, c, R * (.25 + .2 * f), f === 0 ? T.px.c : T.px.b, 1, T, {noShape: true});
    if (f < 3) sfaRing(S, f, c, R * (.3 + .25 * f), 2, T, {shape: 'round'});
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + (i % 2 ? .1 : 0), len = R * (.3 + .7 * sfaEase(Math.min(1, k * 1.3))), keep = f > 3 ? sfaDissolve((k - .4) * 1.4, i) : null;
      const steps = Math.floor(len * .6); for (let s = Math.floor(len * .25); s < steps; s++) { const x = c + Math.cos(a) * s * 1.6, y = c + Math.sin(a) * s * 1.6; if (!keep || keep(x | 0, y | 0)) S.set(f, x, y, s > steps - 2 ? T.px.c : (i % 2 ? T.px.b : T.px.a)); } }
    if (f > 1) for (let i = 0; i < 5; i++) { const a = i * 1.26 + .4, rr = R * (.35 + .6 * sfaEase(k)); sfaStamp(S, f, mot[i % mot.length], c + Math.cos(a) * rr, c + Math.sin(a) * rr - k * 3, T, f > 4 ? sfaDissolve((k - .4) * 1.5, i + 11) : null); }
  }
  return S;
}

/* ---------------- AURA sobre un aliado (bucle de 8 cuadros: anillo en el suelo + motivos que suben) ---------------- */
const SFA_AURA_N = 8;
function sfaBakeAura(T) {
  const W = 40, Hh = 56, S = new SfaStrip(W, Hh, SFA_AURA_N), mot = T.motifs, gy = Hh - 9;
  for (let f = 0; f < SFA_AURA_N; f++) {
    const ph = f / SFA_AURA_N;
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      const dx = (x + .5 - W / 2) / 17.5, dy = (y + .5 - gy) / 7, d = Math.hypot(dx, dy);
      if (d <= 1 && d > .66) { const th = Math.atan2(dy, dx); if (((th + Math.PI) / 6.283 * 12 - ph * 2) % 1 < .7) S.set(f, x, y, d > .86 ? T.px.o : d > .76 ? T.px.b : T.px.a); }
      else if (d <= .66 && sfaDither(x, y, .24)) S.set(f, x, y, T.px.d);
      // columna: tramado que se desvanece hacia arriba, con estelas verticales que suben
      const cx = Math.abs(x + .5 - W / 2);
      if (y < gy - 2 && cx < 13 - (gy - y) * .12 && sfaDither(x, y, .3 * (1 - (gy - y) / (gy + 4)))) S.set(f, x, y, T.px.a);
      if (y < gy - 4 && (x % 6 === 3) && ((y + f * 3) % 12) < 5 && cx < 14) S.set(f, x, y, T.px.b);
    }
    for (let i = 0; i < 3; i++) { const u = (ph + i / 3) % 1, x = W / 2 + Math.sin((u + i) * 5) * 10 + (i - 1) * 3, y = gy - 2 - u * 40;
      sfaStamp(S, f, mot[i % mot.length], x, y, T, u > .72 ? sfaDissolve((u - .72) * 3.5, i) : null); }
    for (let i = 0; i < 6; i++) { const u = (ph * 2 + i / 6) % 1; if (u < .85) S.set(f, W / 2 - 15 + (i * 7) % 31, gy - 4 - u * 38, T.px.c); }
  }
  return S;
}

/* ---------------- horneado con caché ---------------- */
function sfaTheme(name) {
  let T = sfaThemes[name]; if (T) return T;
  const i = name.indexOf('~'); if (i < 0) return null;
  const base = sfaThemes[name.slice(0, i)]; if (!base) return null;
  return (sfaThemes[name] = sfaDeriveVariant(base, name.slice(i + 1)));
}
// Variantes de un tema para que las habilidades de un mismo campeón no se vean iguales: h = tono girado (cálido/frío), p = pálida y brillante,
// k = oscura y densa. Cambian color, silueta del frente y motivos; el borde exterior sigue siendo el radio real.
const SFA_SHAPES = ['round', 'hex', 'spike', 'petal', 'sun', 'wave', 'scallop', 'gear', 'square', 'glitch'];
function sfaHsl(hex) { const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function sfaHex(h, s, l) { h = ((h % 360) + 360) % 360; s = sfaClamp(s, 0, 1); l = sfaClamp(l, 0, 1); const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2; let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  return '#' + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join(''); }
function sfaDeriveVariant(base, v) {
  const P = {}, mut = (hex, dh, ds, dl) => { const [h, s, l] = sfaHsl(hex); return sfaHex(h + dh, s * ds, l + dl); };
  const k = {h: [50, 1.15, .02], p: [0, .55, .22], k: [-40, 1.05, -.14]}[v] || [0, 1, 0];
  for (const c of ['d', 'a', 'b']) P[c] = mut(base.pal[c], k[0], k[1], k[2]);
  P.o = v === 'k' ? mut(base.pal.o, k[0], 1, -.04) : base.pal.o; P.c = v === 'p' ? '#ffffff' : base.pal.c; P.e = mut(base.pal.e, k[0] + 30, 1, 0);
  const si = SFA_SHAPES.indexOf(base.shape), shift = {h: 2, p: 4, k: 6}[v] || 0, rot = {h: 0, p: 1, k: 2}[v] || 0;
  let mo = base.motifs.slice(); mo = mo.slice(rot).concat(mo.slice(0, rot)); if (v === 'h') mo.reverse();
  const px = {}; for (const c in P) px[c] = sfaCol(P[c]);
  return Object.assign({}, base, {pal: P, px, shape: SFA_SHAPES[(Math.max(0, si) + shift) % SFA_SHAPES.length], motifs: mo});
}
// Tinte por arena: la paleta del tema se mezcla con AID_INLAY_PALETTES[arena] (js/rendering/arena-props.js); contorno y brillo conservan el carácter del campeón.
function sfaArenaKey() { try { return (typeof currentArena === 'string' && typeof AID_INLAY_PALETTES !== 'undefined' && AID_INLAY_PALETTES[currentArena]) ? currentArena : ''; } catch (e) { return ''; } }
function sfaMix(a, b, t) { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), ch = s => { const x = (A >> s) & 255, y = (B >> s) & 255; return Math.round(x + (y - x) * t); }; return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join(''); }
function sfaTintTheme(T, arena) {
  const key = '@' + arena; if (T[key]) return T[key];
  const A = AID_INLAY_PALETTES[arena], lit = (c, k) => sfaMix(c, '#ffffff', k), p = T.pal, P = Object.assign({}, p);
  P.o = sfaMix(p.o, A[0], .45); P.d = sfaMix(p.d, A[1], .75); P.a = sfaMix(p.a, A[2], .7); P.b = sfaMix(p.b, lit(A[2], .3), .7); P.c = sfaMix(p.c, lit(A[2], .6), .6); if (p.e) P.e = sfaMix(p.e, lit(A[2], .3), .5);
  const px = {}; for (const c in P) px[c] = sfaCol(P[c]);
  return (T[key] = Object.assign({}, T, {pal: P, px}));
}
function sfaBake(art, theme, size, arc) {
  const arena = sfaArenaKey();
  // Arena tint must not retain ten copies of every baked animation on mobile.
  if (arena !== sfaCacheArena) { sfaCache.clear(); sfaCacheArena = arena; }
  const key = art + '|' + theme + '|' + size + '|' + (arc || 0) + '|' + arena; let b = sfaCache.get(key); if (b) return b;
  let T = sfaTheme(theme); if (!T) return null;
  if (arena) T = sfaTintTheme(T, arena);
  const t0 = performance.now();
  let S = typeof T.bake === 'function' ? T.bake(T, art, size, arc) : null;
  if (S) { /* receta propia de un kit, con la misma caché y tinte de arena */ }
  else if (art === 'nova') S = sfaBakeNova(T, size); else if (art === 'zone') S = sfaBakeZone(T, size, arc); else if (art === 'cone') S = sfaBakeCone(T, size, arc);
  else if (art === 'beam') S = sfaBakeBeam(T, size); else if (art === 'burst') S = sfaBakeBurst(T, size); else if (art === 'aura') S = sfaBakeAura(T);
  else if (art === 'rays') S = sfaBakeRays(T, size); else if (art === 'rings') S = sfaBakeRings(T, size); else if (art === 'column') S = sfaBakeColumn(T);
  else return null;
  b = {cv: S.toCanvas(), w: S.w, h: S.h, n: S.n}; sfaCache.set(key, b); sfaStats.baked++; sfaStats.bakeMs += performance.now() - t0; return b;
}
function sfaDefineTheme(name, def) {
  const px = {}; for (const k in def.pal) px[k] = sfaCol(def.pal[k]);
  sfaThemes[name] = Object.assign({shape: 'round', nMotif: 8, emblem: 'spark', motifs: ['spark']}, def, {px});
}
const sfaBucket = d => d <= 44 ? 32 : d <= 66 ? 48 : d <= 98 ? 64 : d <= 150 ? 80 : d <= 230 ? 96 : d <= 340 ? 128 : d <= 500 ? 160 : 192; // diámetro en unidades de mundo -> px de diseño (de ~1,4 a ~4,5 u/px)

/* ---------------- reproducción ---------------- */
// Area footprints belong below actors: thinning the fill alone still lets the
// impact band and motifs hide a target. Keep airborne beams/bursts on top.
const SFA_LAYER = {nova: 'ground', cone: 'ground', beam: 'top', burst: 'top', aura: 'top', zone: 'ground', rays: 'top', rings: 'top', column: 'top'};
const sfaLite = () => (typeof JUICE !== 'undefined' && JUICE.reduceFx) || (typeof vfxLoad === 'number' && vfxLoad < .6);   // pocos recursos: se omiten las capas decorativas
// art: nova|zone|cone|beam|burst|aura; (x,y) centro / origen; r radio (cono: alcance); ang dirección del cono; (bx,by) fin del haz; w ancho del haz; fi índice de héroe a seguir (aura)
function vfxSfaPlay(art, theme, x, y, r, ang, dur, bx, by, w, fi, arc, dl) { return sfaPush(art, theme, x, y, r, ang, dur, bx, by, w, fi, arc, dl); }
function sfaPush(art, theme, x, y, r, ang, dur, bx, by, w, fi, arc, dl) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !sfaTheme(theme) || !SFA_LAYER[art]) return;
  if (sfaLite() && (art === 'rays' || art === 'rings' || art === 'column' || w === -3)) return;
  const span = art === 'beam' ? Math.max(Math.abs(bx - x), Math.abs(by - y)) + r : r * 2;
  if (typeof inView === 'function' && !inView(art === 'beam' ? (x + bx) / 2 : x, art === 'beam' ? (y + by) / 2 : y, Math.max(90, span / 2 + 30))) return;
  const cap = sfaLite() ? 16 : SFA_POOL_MAX;
  // Auras de fase única: una secuencia vigente por tema y receptor, incluso al relanzar.
  if (art === 'aura' && fi >= 0 && sfaTheme(theme).auraEventPhase) {
    const family=sfaTheme(theme).auraFamily;
    for (let i=sfaPool.length-1;i>=0;i--) {
      const old=sfaPool[i],same=old.theme===theme || family && sfaTheme(old.theme)?.auraFamily===family;
      if(old.art==='aura' && same && old.fi===fi) sfaPool.splice(i,1);
    }
  }
  if (sfaPool.length >= cap) { const i = sfaPool.findIndex(s => !s.ult && s.art !== 'zone'); sfaPool.splice(i < 0 ? 0 : i, 1); }
  sfaPool.push({art, theme, x, y, r: r || 60, ang: ang || 0, t: -(dl || 0), dur: dur || (art === 'nova' ? 720 : art === 'beam' ? 560 : art === 'cone' ? 520 : art === 'aura' ? 1200 : 460), bx: bx || 0, by: by || 0, w: w || 24, fi: fi === undefined ? -1 : fi, arc: arc || .85, ult: (dur || 0) >= 900});
}
// tejas del haz entre (ax,ay) y (bx,by): ancho w, opacidad alpha, espesor relativo thick (anticipación = fino, disipación = se afina)
function sfaBeamTiles(g, theme, ax, ay, bx, by, w, alpha, thick, phase) {
  const L = Math.hypot(bx - ax, by - ay); if (L < 4) return;
  const H = w < 18 ? 8 : w < 34 ? 12 : w < 56 ? 16 : 24, b = sfaBake('beam', theme, H); if (!b) return;
  const eventPhase = sfaTheme(theme).beamEventPhase && Number.isFinite(phase);
  const sc = w / H, f = eventPhase ? Math.min(b.n-1,Math.max(0,Math.floor(phase*b.n))) : ((animNow / 70) | 0) % b.n, step = 16 * sc, n = Math.ceil(L / step);
  g.save(); g.translate(ax, ay); g.rotate(Math.atan2(by - ay, bx - ax)); g.globalAlpha = alpha;
  for (let i = 0; i < n; i++) { const wl = Math.min(step, L - i * step); g.drawImage(b.cv, f * 16, 0, 16 * (wl / step), H, i * step, -b.h * sc * thick / 2, wl, b.h * sc * thick); }
  g.restore();
}
const sfaDrawOne = (s, g) => {
  const k = s.t / s.dur; if (k >= 1 || k < 0) return;
  if (s.art === 'rays' || s.art === 'rings' || s.art === 'column') { sfaDrawArt2(s, g, k); sfaStats.drawn++; return; }
  const calm = typeof JUICE !== 'undefined' && JUICE.reduceFx, T = sfaThemes[s.theme];
  if (s.art === 'nova' || s.art === 'zone') {
    const size = sfaBucket(s.r * 2), b = sfaBake(s.art, s.theme, size); if (!b) return;
    const f = s.art === 'nova' ? Math.min(b.n - 1, (k * b.n) | 0) : ((animNow / 95) | 0) % b.n, sc = (s.r * 2) / (size - 3), D = size * sc;
    let a = s.art === 'nova' ? .96 : Math.min(1, k * 8, (1 - k) * 4) * .95;
    g.globalAlpha = calm ? a * .8 : a; g.drawImage(b.cv, f * b.w, 0, b.w, b.h, s.x - D / 2, s.y - D / 2, D, D);
  } else if (s.art === 'burst') {
    const size = sfaBucket(s.r * 2), b = sfaBake('burst', s.theme, size); if (!b) return;
    const f = Math.min(b.n - 1, (k * b.n) | 0), D = s.r * 2 * (size / (size - 3));
    g.globalAlpha = .95; g.drawImage(b.cv, f * b.w, 0, b.w, b.h, s.x - D / 2, s.y - D / 2, D, D);
  } else if (s.art === 'cone') {
    const size = s.r < 90 ? 48 : s.r < 150 ? 64 : 96, ak = Math.round(s.arc * 20) / 20, b = sfaBake('cone', s.theme, size, ak); if (!b) return;
    const f = Math.min(b.n - 1, (k * b.n) | 0), sc = s.r / (size - 1);
    g.save(); g.translate(s.x, s.y); g.rotate(s.ang); g.globalAlpha = .95;
    g.drawImage(b.cv, f * b.w, 0, b.w, b.h, -sc, -b.h / 2 * sc, b.w * sc, b.h * sc); g.restore();
  } else if (s.art === 'beam') {
    const custom=sfaTheme(s.theme)?.beamDraw;
    if(typeof custom==='function'){custom(s,g);sfaStats.drawn++;return;}
    const dis = k > .62 ? (k - .62) / .38 : 0;
    sfaBeamTiles(g, s.theme, s.x, s.y, s.bx, s.by, s.w, (k < .18 ? .45 : .95) * (1 - dis * .8), k < .18 ? .3 : 1 - dis * .75, k);
    if (k >= .12 && k < .6 && !calm && s.fi !== -2) { const q = sfaBake('burst', s.theme, 32); if (q) { const fb = Math.min(q.n - 1, (((k - .12) / .48) * q.n) | 0), D = Math.max(40, s.w * 1.8); g.globalAlpha = .95; g.drawImage(q.cv, fb * q.w, 0, q.w, q.h, s.bx - D / 2, s.by - D / 2, D, D); } }
  } else if (s.art === 'aura') {
    const b = sfaBake('aura', s.theme, 0); if (!b) return;
    const h = s.fi >= 0 && typeof heroes !== 'undefined' ? heroes[s.fi] : null, x = h ? h.x : s.x, y = h ? h.y : s.y;
    if (h && !h.alive) { s.t = s.dur; return; }
    const f = sfaTheme(s.theme).auraEventPhase ? Math.min(b.n-1,Math.max(0,Math.floor(k*b.n))) : ((animNow / 100) | 0) % b.n, a = Math.min(1, k * 10, (1 - k) * 5), sc = (s.r || 28) / 20;
    g.globalAlpha = a * .95; g.drawImage(b.cv, f * b.w, 0, b.w, b.h, x - b.w * sc / 2, y + 8 * sc - b.h * sc, b.w * sc, b.h * sc);
  }
  sfaStats.drawn++;
};
function sfaFrame(layer) {
  if (!sfaPool.length) return;
  if (layer === 'ground') { const d = sfaLastT ? Math.min(60, animNow - sfaLastT) : 16; sfaLastT = animNow; for (const s of sfaPool) s.t += d; }
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for (const s of sfaPool) if (SFA_LAYER[s.art] === layer) sfaDrawOne(s, ctx);
  ctx.restore(); ctx.globalAlpha = 1;
  if (layer === 'top') for (let i = sfaPool.length - 1; i >= 0; i--) if (sfaPool[i].t >= sfaPool[i].dur) sfaPool.splice(i, 1);
}
function sfaReset() { sfaPool.length = 0; sfaLastT = 0; }
(function () {
  const g0 = drawPortadorGround, t0 = drawPortadorTop;
  drawPortadorGround = function () { g0.apply(this, arguments); if (window.SFA_OFF) return; try { if (typeof sfaObjectsFrame === 'function') sfaObjectsFrame(); sfaFrame('ground'); } catch (e) { sfaFail(e); } };
  drawPortadorTop = function () { t0.apply(this, arguments); if (window.SFA_OFF) return; try { sfaFrame('top'); } catch (e) { sfaFail(e); } };
  if (typeof portadorReset === 'function') { const r0 = portadorReset; portadorReset = function () { sfaReset(); if (typeof sfaObjectsReset === 'function') sfaObjectsReset(); return r0.apply(this, arguments); }; }
  if (typeof NET_EVENT_FNS !== 'undefined' && typeof netHookEvents === 'function') { if (!NET_EVENT_FNS.includes('vfxSfaPlay')) NET_EVENT_FNS.push('vfxSfaPlay'); netHookEvents(); }
})();
let sfaErrAt = 0;
function sfaFail(e) { if (animNow - sfaErrAt > 4000) { sfaErrAt = animNow; console.error('skill-fx-a:', e); } }
