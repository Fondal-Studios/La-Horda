'use strict';
/* js/champions/ult-forms/forms-b1.js — formas de definitiva, segunda tanda (parte 1): Oriel (cicatriz con ecos), Orsa (tormenta de abanicos), Renko (cementerio), Saelis (cielo de plumas).
   Misma regla que forms-1..3: paint(L, o) pinta UN cuadro; L.soft debajo (sin contorno), L.hard encima (con contorno de 1 px); solo hash fijo, nada de azar.
   Las formas largas (zonas de 4 a 6 s) usan el tiempo real de la mecánica (T = q * dur, en ms) para que cada golpe de la zona tenga su momento.
   Solo visual: no cambia daño, enfriamientos, alcances ni hitboxes. */

/* ---------------- ayudas comunes de esta tanda ---------------- */
// marcas nuevas para la anticipación sobre el borde real (cada forma elige las suyas)
Object.assign(UF_MARK, {
  petal: (B, x, y, a, c) => { ufPx(B, x, y, c); ufPx(B, x + 1, y, c); ufPx(B, x, y + 1, c); ufPx(B, x - 1, y + 1, c); },
  stake: (B, x, y, a, c) => { ufLine(B, x, y - 4, x, y, 1, c); ufPx(B, x - 1, y - 3, c); ufPx(B, x + 1, y - 3, c); },
  feather: (B, x, y, a, c) => { ufLine(B, x - 2, y + 2, x + 2, y - 2, 1, c); ufPx(B, x - 1, y - 1, c); ufPx(B, x + 1, y + 1, c); },
  stitch: (B, x, y, a, c) => { const ca = Math.cos(a), sa = Math.sin(a); ufLine(B, x - ca * 3, y - sa * 3, x + ca * 3, y + sa * 3, 1, c, .6); ufPx(B, x, y, c); },
  bolt: (B, x, y, a, c) => { ufPx(B, x + 1, y - 3, c); ufPx(B, x, y - 2, c); ufPx(B, x, y - 1, c); ufPx(B, x - 1, y, c); ufPx(B, x, y + 1, c); ufPx(B, x - 1, y + 2, c); },
  drop: (B, x, y, a, c) => { ufPx(B, x, y - 2, c); ufPx(B, x - 1, y - 1, c); ufPx(B, x + 1, y - 1, c); ufPx(B, x - 1, y, c); ufPx(B, x + 1, y, c); ufPx(B, x, y + 1, c); },
  hexa: (B, x, y, a, c) => { ufPx(B, x - 1, y - 2, c); ufPx(B, x + 1, y - 2, c); ufPx(B, x - 2, y, c); ufPx(B, x + 2, y, c); ufPx(B, x - 1, y + 2, c); ufPx(B, x + 1, y + 2, c); },
  skull: (B, x, y, a, c) => { ufPx(B, x - 1, y - 1, c); ufPx(B, x + 1, y - 1, c); ufPx(B, x, y, c); ufPx(B, x - 1, y + 1, c); ufPx(B, x + 1, y + 1, c); },
  star:  (B, x, y, a, c) => { ufPx(B, x, y, c); ufPx(B, x, y - 2, c); ufPx(B, x, y + 2, c); ufPx(B, x - 2, y, c); ufPx(B, x + 2, y, c); }
});
// rayo en zigzag entre dos puntos: n tramos, amplitud amp (px), semilla s
function ubBolt(x0, y0, x1, y1, n, amp, s){
  const pts = [[x0, y0]], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  for(let i = 1; i < n; i++){ const u = i / n, o = (ufH(i, s) - .5) * 2 * amp * (1 - Math.abs(u - .5) * .5); pts.push([x0 + dx * u + nx * o, y0 + dy * u + ny * o]); }
  pts.push([x1, y1]); return pts;
}
function ubPath(B, pts, th, c, dens){ for(let i = 1; i < pts.length; i++) ufLine(B, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], th, c, dens); }
// nube de bultos (óvalo festoneado): w, h en px; sh = sombra de abajo (color), c = cuerpo, hi = luz de arriba
function ubCloud(B, cx, cy, w, h, c, sh, hi, seed, k){
  k = k === undefined ? 1 : k; const n = 8;
  ufEll(B, cx, cy + h * .12, w * .5 * k, h * .3 * k, c);
  for(let i = 0; i < n; i++){
    const u = (i + .5) / n, s = Math.sin(u * Math.PI), rr = h * (.3 + .32 * s) * (.8 + .4 * ufH(i, seed)) * k, x = cx + (u - .5) * w * k * .94, y = cy - s * h * .22 * k;
    ufDisc(B, x, y, rr, c);
  }
  if(sh) ufEll(B, cx, cy + h * .26 * k, w * .46 * k, h * .16 * k, sh, .55);
  if(hi) for(let i = 0; i < n; i++){ const u = (i + .5) / n, s = Math.sin(u * Math.PI), rr = h * (.3 + .32 * s) * (.8 + .4 * ufH(i, seed)) * k, x = cx + (u - .5) * w * k * .94, y = cy - s * h * .22 * k; ufDisc(B, x - rr * .15, y - rr * .3, rr * .55, hi, .6); }
}

/* ---------- CICATRIZ: una fisura en forma de ojo se abre en el suelo; vacío negro-vino con estrellas, ecos translúcidos salen a golpear, pétalos suben ---------- */
const UB_ECHO = ['..bb..', '.bbbb.', '..bb..', '.bbbb.', 'bbbbbb', 'b.bb.b', '..bb..', '.b..b.', '.b..b.'];
ufDefForm('rift', {N: 36, tall: 1.75, dur: 6000, gdur: 7000, shake: 8, pad: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 6000;
    const open = ufEase(ufC((T - 380) / 560, 0, 1)), close = ufC((T - 5250) / 750, 0, 1), beat = (T % 600) / 600, pulse = open > .9 && close === 0 && beat < .22 ? 1 - beat / .22 : 0;
    if(T < 560){ ufEdgeMarks(S, o, 10, 'petal', P.b, .3); const k = ufC(T / 380, 0, 1); for(let x = -R * .98 * k; x <= R * .98 * k; x += 1) ufPx(Hd, cx + x, cy + (ufH(x | 0, 3) - .5) * 3, P.c); }
    const Wd = R * .98 * open * (1 - close * .985), Hh = R * .36 * open * (1 - close * .92) * (1 + .07 * pulse);
    if(Wd > 2){
      const ay = x => cy + Math.sin(x / Wd * 3.1 + .6) * R * .07 * open, amp = Math.max(1.2, R * .055);
      // haces de luz que salen del vacío
      if(open > .8 && close < .4) for(let i = 0; i < 5; i++){ const bx = cx + (i - 2) * Wd * .38 + Math.sin(T / 400 + i) * 2, bh = R * (.7 + .4 * ufH(i, 15)) * (1 - close * 2.5); for(let y = 0; y < bh; y++) if(ufDith(bx | 0, (cy - y) | 0, .3 * (1 - y / bh) + .08)) { for(let w = -1; w <= 1; w++) ufPx(S, bx + w, ay(bx - cx) - Hh * .5 - y, P.b); } }
      for(let x = -Math.floor(Wd); x <= Math.floor(Wd); x++){
        const u = x / Wd, env = Math.pow(Math.max(0, 1 - u * u), .75), tri = Math.abs(((x + 33) % 7) - 3.5) / 3.5, tri2 = Math.abs(((x + 31) % 6) - 3) / 3, y0 = ay(x), top = y0 - Hh * env - tri * amp * Math.min(1, env * 3), bot = y0 + Hh * env * .85 + tri2 * amp * .8 * Math.min(1, env * 3), gx = cx + x;
        if(bot - top < 1) { ufPx(Hd, gx, y0, P.c); continue; }
        for(let y = Math.ceil(top); y <= bot; y++) ufPx(Hd, gx, y, (y - top < 2.2 && ufDith(gx, y, .5)) ? P.d : P.o);
        ufPx(Hd, gx, top, P.c); ufPx(Hd, gx, bot, P.c); ufPx(Hd, gx, top - 1, pulse > .3 ? P.b : P.a); ufPx(Hd, gx, bot + 1, pulse > .3 ? P.b : P.a);
        if(pulse > .5) { ufPx(Hd, gx, top - 2, P.a); ufPx(Hd, gx, bot + 2, P.a); }
      }
      for(let i = 0; i < 16; i++){ const sx = (ufH(i, 21) * 2 - 1) * Wd * .82, env = Math.pow(Math.max(0, 1 - (sx / Wd) ** 2), .75), sy = (ufH(i, 22) * 2 - 1) * Hh * env * .55; if(((f + i) & 3) !== 0) ufPx(Hd, cx + sx, ay(sx) + sy, i % 3 ? P.b : P.c); }
      // grietas que salen del borde
      for(let i = 0; i < 8; i++){ const sx = (ufH(i, 41) * 2 - 1) * Wd * .85, env = Math.pow(Math.max(0, 1 - (sx / Wd) ** 2), .75), dirv = i & 1 ? -1 : 1, x0 = cx + sx, y0 = ay(sx) + dirv * Hh * env, pts = ubBolt(x0, y0, x0 + (ufH(i, 42) - .5) * R * .3, y0 + dirv * R * (.14 + .12 * ufH(i, 43)) * open, 4, 2, i + 60); ubPath(Hd, pts, 1, i % 3 ? P.a : P.c); }
      ufPx(Hd, cx - Wd, cy, P.c); ufPx(Hd, cx + Wd, cy, P.c); if(R > 36){ ufPx(Hd, cx - Wd - 1, cy, P.a); ufPx(Hd, cx + Wd + 1, cy, P.a); }
    }
    // ecos: siluetas translúcidas que suben del vacío, tajan y se desvanecen
    const sc = Math.max(1, Math.round(R / 16)), DX = [-.62, .2, -.2, .6, -.42, .38];
    for(let i = 0; i < 6; i++){
      const t0 = 950 + i * 760, k = (T - t0) / 560; if(k < 0 || k > 2.1 || close > .5) continue;
      const rise = ufEase(ufC(k, 0, 1)), fade = ufC((k - 1.45) / .65, 0, 1), ex = cx + DX[i] * R, hgt = 9 * sc, by = cy + 1;
      ufBmp(Hd, UB_ECHO, {b: P.b}, ex, by - hgt * rise + hgt / 2, {sc, keep: (x, y) => y <= by && ufDith(x, y, .72) && ufH(x + i, y) >= fade});
      if(k > 1 && k < 1.5){ const s = ufC((k - 1) / .5, 0, 1); ufLine(Hd, ex - 7 * sc * (1 - s), by - hgt - 2, ex + 7 * sc * s, by - hgt * .1, 2, P.a); ufLine(Hd, ex - 7 * sc * (1 - s), by - hgt - 2, ex + 7 * sc * s, by - hgt * .1, 1, P.c); }
    }
    if(open > .5 && close < .7) for(let i = 0; i < 18; i++){ const u = ((T / 2700) + ufH(i, 31)) % 1, x = cx + (ufH(i, 32) * 2 - 1) * Wd * .92 + Math.sin(u * 7 + i) * 3, y = cy - 2 - u * R * 1.2; if(u < .88){ ufPx(S, x, y, i & 1 ? P.a : P.b); ufPx(S, x + 1, y, i & 1 ? P.b : P.c); } }
    if(close > .7){ const k = (close - .7) / .3; for(let i = 0; i < 8; i++){ const a = i * .7854; ufLine(Hd, cx, cy, cx + Math.cos(a) * R * .18 * (1 - k), cy + Math.sin(a) * R * .1 * (1 - k), 1, P.c); } }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, T = q * 7000, k = ufEase(ufC((T - 250) / 800, 0, 1)), fade = ufC((T - 5900) / 1100, 0, 1), kp = ufKeep(fade);
    ufEll(S, cx, cy, R * .98 * k, R * .4 * k, P.d, .13 * (1 - fade));
    const pts = []; for(let i = -12; i <= 12; i++) pts.push([cx + i / 12 * R * .98 * k, cy + (ufH(i + 40, 7) - .5) * R * .09]);
    for(let i = 1; i < pts.length; i++) ufLine(S, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 1, P.d, undefined);
    for(let i = 0; i < 12; i++){ const a = (i < 6 ? 0 : Math.PI) + (ufH(i, 9) - .5) * 1.6, x0 = cx + Math.cos(a) * R * .98 * k, y0 = cy + (ufH(i, 5) - .5) * 2, L2 = R * (.14 + .2 * ufH(i, 6)) * k; for(let t = 0; t < L2; t++) if(kp(Math.round(x0 - Math.cos(a) * t + i), Math.round(y0 + Math.sin(a) * t * .6 + t * (ufH(i, 11) - .5) * .7))) ufPx(S, x0 + Math.cos(a) * t * .5 + (ufH(i, 12) - .5) * t, y0 + (ufH(i, 13) - .3) * t * .8, P.a); }
  }});

/* ---------- TORMENTA: nube baja azul-negra sobre ella; tres abanicos de rayos de cobre caen y una descarga redonda cierra ---------- */
ufDefForm('thunder', {N: 30, tall: 1.6, dur: 2800, gdur: 3400, shake: 9, pad: 3,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 2800, FAN = [600, 1200, 1800], CEN = [-2.3, -.2, 1.9], BY = cy - R * .95;
    const grow = ufEase(ufC(T / 520, 0, 1)), melt = ufC((T - 2450) / 350, 0, 1), cw = R * 1.75 * grow * (1 - melt * .5), ch = R * .5 * grow * (1 - melt * .6);
    if(T < 600) ufEdgeMarks(S, o, 12, 'bolt', P.b, .1);
    if(cw > 3){
      ubCloud(Hd, cx, BY, cw, ch, P.e, P.o, null, 4);
      ubCloud(S, cx, BY - 1, cw * .98, ch, P.e, null, P.d, 4, 1);
      // la nube se enciende con cada descarga
      let lit = 0; for(const t0 of FAN.concat([2400])) { const d = T - t0; if(d >= 0 && d < 300) lit = Math.max(lit, 1 - d / 300); }
      if(lit > 0) ufEll(Hd, cx, BY + ch * .1, cw * .42, ch * .3, P.a, .5 * lit);
      // lluvia fina bajo la nube
      if(T < 2500) for(let i = 0; i < 14; i++){ const x = cx + (ufH(i, 61) * 2 - 1) * cw * .4, u = ((T / 330) + ufH(i, 62)) % 1, y = BY + ch * .4 + u * R * .75; if(y < cy - 2) { ufPx(S, x, y, P.e); ufPx(S, x - 1, y + 1, P.e); } }
    }
    for(let k = 0; k < 3; k++){
      const d = T - FAN[k]; if(d < 0 || d > 340) continue; const on = 1 - d / 340;
      for(let b = -2; b <= 2; b++){
        const ta = CEN[k] + b * .38, ex = cx + Math.cos(ta) * R * .95, ey = cy + Math.sin(ta) * R * .95 * .55;
        const pts = ubBolt(cx + b * 3, BY + ch * .3, ex, ey, 7, R * .07, k * 7 + b + 20 + f * 3);
        ubPath(Hd, pts, 2, P.a); ubPath(Hd, pts, 1, on > .45 ? P.c : P.b);
        if(on > .5) ufDisc(Hd, ex, ey, 1.6 + R * .02, P.c);
      }
      // sector real del cono sobre el suelo
      const a0 = CEN[k] - .85, a1 = CEN[k] + .85, poly = [[cx, cy]]; for(let i = 0; i <= 8; i++){ const a = a0 + (a1 - a0) * i / 8; poly.push([cx + Math.cos(a) * R * .95, cy + Math.sin(a) * R * .95 * .55]); }
      ufPoly(S, poly, P.d, .3 * on);
    }
    const dd = T - 2400;
    if(dd >= 0 && dd < 480){
      const on = 1 - dd / 480, pts = ubBolt(cx, BY + ch * .3, cx, cy, 6, R * .05, 77 + f);
      ubPath(Hd, pts, 4, P.a); ubPath(Hd, pts, 2, P.b); ubPath(Hd, pts, 1, P.c);
      for(let i = 0; i < 12; i++){ const a = i * .5236 + .26, rr = R * .75 * ufEase(ufC(dd / 160, 0, 1)), ex = cx + Math.cos(a) * rr, ey = cy + Math.sin(a) * rr * .55, bp = ubBolt(cx, cy, ex, ey, 4, R * .05, 90 + i + f); ubPath(Hd, bp, 1, on > .5 ? P.c : P.b); }
      ufDisc(Hd, cx, cy, R * .16 * on + 1, P.c);
    }
    if(T > 2500 && T < 2800) for(let i = 0; i < 16; i++){ const a = ufH(i, 5) * 6.28, d2 = ufH(i, 6) * R * .6; if(ufH(i, 8) > (T - 2500) / 300) ufPx(S, cx + Math.cos(a) * d2, cy + Math.sin(a) * d2 * .55 - (T - 2500) * .04, i & 1 ? P.b : P.e); }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 3400, fade = ufC((T - 2400) / 1000, 0, 1), kp = ufKeep(fade);
    const scorch = (x, y, big) => { ufDisc(S, x, y, (big ? 3 : 1.6) * Math.max(1, R / 40), P.o, .7, kp); ufPx(S, x - 2, y, P.d); ufPx(S, x + 2, y, P.d); ufPx(S, x, y - 1, P.a); };
    [600, 1200, 1800].forEach((t0, k) => { if(T > t0) for(let b = -2; b <= 2; b++){ const ta = [-2.3, -.2, 1.9][k] + b * .38; scorch(cx + Math.cos(ta) * R * .95, cy + Math.sin(ta) * R * .95 * .55, false); } });
    if(T > 2400) for(let i = 0; i < 12; i++){ const a = i * .5236 + .26, rr = R * .75; ufLine(S, cx, cy, cx + Math.cos(a) * rr * ufC((T - 2400) / 160, 0, 1), cy + Math.sin(a) * rr * .55 * ufC((T - 2400) / 160, 0, 1), 1, P.d, .6); }
    if(T > 2400) scorch(cx, cy, true);
  }});

/* ---------- CEMENTERIO: tres oleadas de lápidas con nombres brotan del suelo agrietado; la última lanza piedras; luego se hunden ---------- */
ufDefForm('graves', {N: 32, tall: 1.4, dur: 3300, gdur: 4200, shake: 7, pad: 3,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 3300, W0 = [700, 1500, 2300], sink = ufIn(ufC((T - 2850) / 450, 0, 1));
    if(T < 700) ufEdgeMarks(S, o, 14, 'stake', P.c, .1);
    const tw = Math.max(3, Math.round(R * .13)), th = Math.round(tw * 1.8), items = [];
    for(let w = 0; w < 3; w++) for(let i = 0; i < 6; i++){
      const a = ufH(i + w * 9, 41) * 6.2832, r = R * (.1 + w * .3 + ufH(i + w * 9, 42) * .26), d = (ufH(i + w * 9, 43) - .5) * 90;
      items.push({x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * .62, t: W0[w] + d, w, i});
    }
    items.sort((p, r2) => p.y - r2.y);
    for(const m of items){
      const k = ufEase(ufC((T - m.t) / 170, 0, 1)), over = k < 1 ? Math.sin(k * 3.14) * .15 : 0, dust = (T - m.t) / 420;
      if(dust >= 0 && dust < 1) { ufDisc(S, m.x - tw, m.y, 2 + dust * 4, P.b, .55 * (1 - dust)); ufDisc(S, m.x + tw, m.y, 2 + dust * 4, P.e, .55 * (1 - dust)); }
      if(k <= 0) continue;
      const h = th * (k + over) * (1 - sink), x0 = m.x - tw / 2, x1 = m.x + tw / 2;
      if(h < 2) continue;
      ufEll(S, m.x, m.y + 1, tw * .9, 1.6, P.d, .8);
      ufPoly(Hd, [[x0, m.y], [x0, m.y - h + tw / 2], [x1, m.y - h + tw / 2], [x1, m.y]], P.c); ufDisc(Hd, m.x, m.y - h + tw / 2, tw / 2, P.c);
      ufLine(Hd, x0 + .5, m.y - 1, x0 + .5, m.y - h + tw / 2, 1, P.b);
      if(h > th * .6){ ufLine(Hd, m.x - tw * .25, m.y - h * .55, m.x + tw * .25, m.y - h * .55, 1, P.d); if(tw > 4) ufLine(Hd, m.x - tw * .25, m.y - h * .4, m.x + tw * .2, m.y - h * .4, 1, P.d); }
      if(m.i === 0 && m.w > 0) ufLine(Hd, m.x + 1, m.y - h * .8, m.x + tw * .3, m.y - h * .45, 1, P.o);
    }
    // piedras de la tercera sacudida
    const st = T - W0[2]; if(st > 0 && st < 800) for(let i = 0; i < 12; i++){ const a = ufH(i, 51) * 6.28, v = R * (.5 + .6 * ufH(i, 52)), u = st / 800, x = cx + Math.cos(a) * v * u * .9, y = cy + Math.sin(a) * v * u * .45 - Math.sin(u * Math.PI) * R * (.6 + .5 * ufH(i, 53)); ufDisc(Hd, x, y, 1.3 + (i % 3 === 0), i & 1 ? P.e : P.c); }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 4200, fade = ufC((T - 3000) / 1200, 0, 1), kp = ufKeep(fade), W0 = [700, 1500, 2300];
    for(let w = 0; w < 3; w++){ if(T < W0[w]) continue; const g = ufEase(ufC((T - W0[w]) / 260, 0, 1));
      ufEll(S, cx, cy, R * (.3 + w * .32) * g, R * (.3 + w * .32) * .62 * g, P.d, .08 * (1 - fade));
      for(let i = 0; i < 6; i++){ const a = ufH(i + w * 9, 41) * 6.2832, r = R * (.1 + w * .3 + ufH(i + w * 9, 42) * .26), ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r * .62, pts = ubBolt(cx, cy, cx + (ex - cx) * g, cy + (ey - cy) * g, 6, 1.6, i + w * 5);
        for(let j = 1; j < pts.length; j++) ufLine(S, pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], 1, P.o, undefined);
        ufDisc(S, ex, ey, 2, P.d, .7, kp); } }
  }});

/* ---------- PLUMAJE: una nube blanca plana sobre el área deja caer plumas en diagonal; al final, seis plumas dibujan un hexágono ---------- */
ufDefForm('plumage', {N: 36, tall: 1.95, dur: 5000, gdur: 6200, shake: 4, pad: 3,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 5000, BY = cy - R * 1.28, grow = ufEase(ufC(T / 600, 0, 1)), melt = ufC((T - 4500) / 500, 0, 1);
    if(T < 500) ufEdgeMarks(S, o, 12, 'feather', P.c, .2);
    const cw = R * 1.95 * grow * (1 - melt * .6), ch = R * .5 * grow * (1 - melt * .7), sway = Math.sin(T / 900) * 3;
    if(cw > 3){ ubCloud(Hd, cx + sway, BY, cw, ch, P.b, P.a, P.c, 3); ubCloud(S, cx + sway, BY + 2, cw * .96, ch * .9, P.a, P.d, null, 6, .94); }
    // plumas: una tanda cada 400 ms, cada una cae en diagonal con vaivén y se clava con destello dorado
    const fl = Math.max(4, R * .2), dir = [.5, .866];
    const feather = (x, y, rot, c1, c2) => { const ca = Math.cos(rot), sa = Math.sin(rot); ufLine(Hd, x - ca * fl * .5, y - sa * fl * .5, x + ca * fl * .5, y + sa * fl * .5, 1, c1);
      for(let j = -1; j <= 1; j++){ const bx = x + ca * fl * .22 * j, by = y + sa * fl * .22 * j; ufLine(Hd, bx, by, bx - sa * fl * .28 - ca * fl * .12, by + ca * fl * .28 - sa * fl * .12, 1, c2); ufLine(Hd, bx, by, bx + sa * fl * .28 - ca * fl * .12, by - ca * fl * .28 - sa * fl * .12, 1, c2); }
      ufPx(Hd, x + ca * fl * .5, y + sa * fl * .5, P.e); };
    for(let wv = 0; wv < 11; wv++) for(let i = 0; i < 4; i++){
      const t0 = 650 + wv * 400 + i * 70, k = (T - t0) / 560, id = wv * 4 + i; if(k < 0 || k > 1.9) continue;
      const tx = cx + (ufH(id, 71) * 2 - 1) * R * .88, ty = cy + (ufH(id, 72) * 2 - 1) * R * .42, sx = tx - R * .5, sy = BY + ch * .3;
      if(k < 1){ const u = ufIn(k) * .55 + k * .45, x = ufLerp(sx, tx, u) + Math.sin(u * 9 + id) * R * .05, y = ufLerp(sy, ty, u); feather(x, y, Math.atan2(dir[1], dir[0]) + Math.sin(u * 9 + id) * .5, P.c, P.b); }
      else { const s = k - 1, fd = ufC((s - .4) / .5, 0, 1); if(s < .25) { const a = s / .25; ufDisc(Hd, tx, ty, 2.5 * (1 - a) + 1, P.e); for(let j = 0; j < 4; j++) ufPx(Hd, tx + Math.cos(j * 1.57) * (2 + a * 4), ty + Math.sin(j * 1.57) * (2 + a * 4) * .6, P.c); }
        const h = fl * .7 * (1 - fd); if(h > 1.5){ ufLine(Hd, tx, ty, tx - 1, ty - h, 1, P.c); ufPx(Hd, tx - 1, ty - h, P.e); ufPx(Hd, tx, ty - h * .5, P.b); } }
    }
    // la nube se deshace en llovizna
    if(melt > 0) for(let i = 0; i < 18; i++){ const x = cx + (ufH(i, 81) * 2 - 1) * R * .9, u = (ufH(i, 82) + melt * 1.4) % 1.4; ufPx(S, x, BY + ch * .3 + u * R * .9, i & 1 ? P.b : P.c); }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 6200, k = ufEase(ufC((T - 200) / 700, 0, 1)), fade = ufC((T - 5200) / 1000, 0, 1);
    ufEll(S, cx, cy - R * .3, R * .95 * k, R * .38 * k, P.d, .22 * (1 - fade));
    for(let i = 0; i < 22; i++){ const a = ufH(i, 91) * 6.28, d = Math.sqrt(ufH(i, 92)) * R * .9 * k; if(ufH(i, 93) > fade) ufPx(S, cx + Math.cos(a) * d, cy - R * .3 + Math.sin(a) * d * .42, i & 1 ? P.b : P.a); }
    const hk = ufC((T - 4400) / 400, 0, 1) * (1 - fade); if(hk > 0) for(let i = 0; i < 6; i++){ const a0 = i * 1.0472 - 1.5708, a1 = a0 + 1.0472; ufLine(S, cx + Math.cos(a0) * R * .5, cy + Math.sin(a0) * R * .27, cx + Math.cos(a1) * R * .5, cy + Math.sin(a1) * R * .27, 1, P.e, .5 * hk + .2); UF_MARK.feather(S, cx + Math.cos(a0) * R * .5, cy + Math.sin(a0) * R * .27, 0, P.c); }
  }});
