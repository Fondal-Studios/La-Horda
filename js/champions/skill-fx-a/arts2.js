'use strict';
/* js/champions/skill-fx-a/arts2.js — capas de impacto: rayos radiales (destello), ondas concéntricas y columna de luz.
   Se suman a la nova/cono/haz de cada habilidad para dar anticipación, golpe y estela; las definitivas las combinan en capas.
   Se omiten solas con "Reducir efectos intensos" o cuando el motor va justo (sfaLite). */
const SFA_RAYS_N = 8;
function sfaBakeRays(T, size) {
  const S = new SfaStrip(size, size, SFA_RAYS_N), c = size / 2, R = c - 1.5, P = T.px, NR = 14;
  for (let f = 0; f < SFA_RAYS_N; f++) {
    const k = f / (SFA_RAYS_N - 1), grow = f < 2 ? .35 + f * .2 : 1, fade = f >= 5 ? (f - 4) / 3 : 0, keep = sfaDissolve(fade * .95, f);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = x + .5 - c, dy = y + .5 - c, d = Math.hypot(dx, dy); if (d > R * grow || d < 2) continue;
      const th = Math.atan2(dy, dx), seg = (th + Math.PI) / (Math.PI * 2) * NR, i = Math.round(seg), da = Math.abs(seg - i) * (Math.PI * 2 / NR), perp = d * Math.sin(da);
      const long = (i % 2 === 0) ? 1 : .62, wid = (1.6 + 1.6 * (1 - d / R)) * (f < 2 ? .6 : 1);
      if (d > R * grow * long || perp > wid || !keep(x, y)) continue;
      S.set(f, x, y, perp < wid * .35 ? (d > R * .55 ? P.c : P.b) : perp < wid * .75 ? P.a : P.o);
    }
    if (f >= 1 && f <= 4) sfaRing(S, f, c, R * (.25 + f * .17), 2, T, {shape: 'round', keep});
    if (f <= 3) sfaDisc(S, f, c, R * (.34 - f * .07), P.c, 1, T, {noShape: true});
    if (f >= 2 && f <= 5) for (let i = 0; i < 6; i++) { const a = i * 1.047 + .4, rr = R * (.45 + (f - 2) * .15); sfaStamp(S, f, 'spark', c + Math.cos(a) * rr, c + Math.sin(a) * rr, T, keep); }
  }
  return S;
}
const SFA_RINGS_N = 10;
function sfaBakeRings(T, size) {
  const S = new SfaStrip(size, size, SFA_RINGS_N), c = size / 2, R = c - 1.5;
  for (let f = 0; f < SFA_RINGS_N; f++) for (let j = 0; j < 3; j++) {
    const u = sfaClamp((f / (SFA_RINGS_N - 1) - j * .16) / .66, 0, 1); if (u <= 0 || u >= 1) continue;
    const keep = u > .6 ? sfaDissolve((u - .6) * 2.4, j * 9 + f) : null;
    sfaRing(S, f, c, R * sfaEase(u) * (1 - j * .06), 3 - (j ? 1 : 0), T, {shape: j === 1 ? 'round' : T.shape, keep, dash: j === 2 ? {n: 22, on: .6, ph: f * .1} : null});
  }
  return S;
}
const SFA_COL_N = 10;
function sfaBakeColumn(T) {
  const W = 40, H = 88, S = new SfaStrip(W, H, SFA_COL_N), P = T.px, gy = H - 8;
  for (let f = 0; f < SFA_COL_N; f++) {
    const rise = f < 2 ? .3 : f < 6 ? Math.min(1, (f - 1) / 3) : 1, fade = f >= 7 ? (f - 6) / 3 : 0, wk = f < 2 ? .12 : 1 - fade * .55;
    for (let y = 0; y < H; y++) { const ht = (gy - y) / gy; if (ht < 0 || ht > rise) continue;
      const hw = (f < 2 ? 2.2 : 13.5 * (.78 + .22 * (1 - ht))) * wk, keep = fade ? sfaHash(y, f) >= fade * (1 - ht * .6) : true;
      for (let x = 0; x < W; x++) { const dx = Math.abs(x + .5 - W / 2); if (dx > hw || !keep) continue;
        const e = dx / hw;
        if (e > .86) S.set(f, x, y, P.o); else if (e > .66) S.set(f, x, y, ((y + f) & 1) ? P.a : P.d); else if (e > .3) { if (sfaDither(x, y + f, .85 - ht * .45)) S.set(f, x, y, P.b); else if ((x + y) & 1) S.set(f, x, y, P.a); } else S.set(f, x, y, ht < .15 ? P.c : (sfaDither(x, y, .7) ? P.c : P.b)); } }
    // base y destello superior
    for (let x = 0; x < W; x++) { const dx = (x + .5 - W / 2) / 17, dy = .0; if (Math.abs(dx) <= 1 && f >= 2 && f < 8) { S.set(f, x, gy + 1, P.o); S.set(f, x, gy, Math.abs(dx) < .6 ? P.c : P.b); } }
    if (f >= 2 && f < 8) sfaStamp(S, f, T.motifs[0], W / 2, gy - rise * (gy - 6), T, fade ? sfaDissolve(fade, f) : null);
    for (let i = 0; i < 4; i++) { const u = (f / SFA_COL_N * 1.6 + i / 4) % 1; if (f >= 2 && f < 9) sfaStamp(S, f, T.motifs[(i + 1) % T.motifs.length], W / 2 + Math.sin((u + i) * 6) * 9, gy - u * rise * (gy - 4), T, u > .75 ? sfaDissolve((u - .75) * 4, i) : null); }
  }
  return S;
}
// dibujo de rays / rings / column
function sfaDrawArt2(s, g, k) {
  if (s.art === 'column') {
    const b = sfaBake('column', s.theme, 0); if (!b) return;
    const f = Math.min(b.n - 1, (k * b.n) | 0), sc = s.r / 20, dw = b.w * sc, dh = b.h * sc;
    g.globalAlpha = .95; g.drawImage(b.cv, f * b.w, 0, b.w, b.h, s.x - dw / 2, s.y - dh + 8 * sc, dw, dh); return;
  }
  const size = sfaBucket(s.r * 2), b = sfaBake(s.art, s.theme, size); if (!b) return;
  const f = Math.min(b.n - 1, (k * b.n) | 0), D = size * (s.r * 2) / (size - 3);
  g.globalAlpha = s.art === 'rays' ? 1 : .92; g.drawImage(b.cv, f * b.w, 0, b.w, b.h, s.x - D / 2, s.y - D / 2, D, D);
}
