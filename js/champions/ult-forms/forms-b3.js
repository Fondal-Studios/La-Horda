'use strict';
/* js/champions/ult-forms/forms-b3.js — formas de definitiva, segunda tanda (parte 3): Tibor (panal con miel), Vesper (bordado y tijeras), Veyra (herida en C con corazon),
   Vhal (estrella, agujero negro con disco, colapso), Ynara (alas y rayos), Zahra (valvulas de laton con vapor). Ayudas en forms-b1.js. Solo visual, sin azar. */

const ubHex = (B, x, y, r, c, th, dens) => { const p = []; for(let i = 0; i < 6; i++) p.push([x + Math.cos(i * 1.0472 + .5236) * r, y + Math.sin(i * 1.0472 + .5236) * r * .92]); if(th === 0) ufPoly(B, p, c, dens); else { p.push(p[0]); ubPath(B, p, th || 1, c, dens); } };

/* ---------- PANAL: un panal de hexagonos sobre la zona se arma celda a celda, la miel gotea hasta el suelo y un enjambre gira debajo ---------- */
ufDefForm('hive', {N: 40, tall: 1.9, dur: 6000, gdur: 6800, shake: 4, pad: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 6000, out = ufC((T - 5200) / 800, 0, 1), HY = cy - R * 1.25, cs = R * .21;
    if(T < 650) ufEdgeMarks(S, o, 12, 'hexa', P.b, .1);
    const cells = []; for(let a = -2; a <= 2; a++) for(let b = -2; b <= 2; b++){ if(Math.abs(a + b) > 2) continue; cells.push({x: cx + cs * 1.73 * (a + b / 2), y: HY + cs * 1.5 * b * .62, d: Math.max(Math.abs(a), Math.abs(b), Math.abs(a + b)), a, b}); }
    const beamK = ufC((T - 800) / 400, 0, 1) * (1 - out);
    if(beamK > 0) ufPoly(S, [[cx - cs * .7, HY + cs * .4], [cx + cs * .7, HY + cs * .4], [cx + R * .5, cy], [cx - R * .5, cy]], P.b, .16 * beamK + .04 * Math.sin(T / 150));
    for(const c of cells){
      const g = ufEase(ufC((T - 380 - c.d * 150) / 260, 0, 1)), br = ufC((out * 1.4 - ufH(c.a + 5, c.b + 9) * .6), 0, 1); if(g <= 0 || br >= 1) continue;
      const yy = c.y + br * br * R * 1.1 + (1 - g) * -6, fill = ((T / 700 + c.d * .3 + ufH(c.a, c.b)) % 1) > .35;
      ubHex(Hd, c.x, yy, cs * g, P.a, 0); ubHex(Hd, c.x, yy, cs * g * .62, fill ? P.e : P.b, 0); ubHex(Hd, c.x, yy, cs * g, P.d, 1);
      if(fill) ufPx(Hd, c.x - 1, yy - 1, P.c);
    }
    // goteo de miel desde las celdas de abajo
    if(out < .4) for(let i = 0; i < 6; i++){ const c = cells[(i * 3) % cells.length], u = ((T / 900) + ufH(i, 5)) % 1, x = c.x, y0 = c.y + cs * .9; if(T < 1000) break; const len = u * R * 1.1;
      ufLine(Hd, x, y0, x, Math.min(cy, y0 + len * .6), 1, P.e); ufDisc(Hd, x, Math.min(cy, y0 + len), 1.6, P.e); ufPx(Hd, x - 1, Math.min(cy, y0 + len) - 1, P.c); }
    // enjambre: dos orbitas inclinadas de abejas
    const sw = ufC((T - 600) / 500, 0, 1) * (1 - out * .9);
    for(let i = 0; i < Math.round(26 * sw); i++){ const ph = T * (.0035 + (i % 3) * .0009) + i * 2.399, rr = R * (.25 + .6 * ufH(i, 7)), x = cx + Math.cos(ph) * rr, y = cy - R * .55 + Math.sin(ph) * rr * .35 + Math.sin(ph * 2 + i) * 3, up = Math.sin(ph) > 0;
      ufLine(S, x - Math.sin(ph) * 3 * 1, y + Math.cos(ph) * 1, x, y, 1, P.d, .8); ufPx(Hd, x, y, P.o); ufPx(Hd, x + 1, y, P.b); ufPx(Hd, x, y - 1, (f + i) & 1 ? P.c : P.a); }
    // vuelven a la colmena
    if(out > .4) for(let i = 0; i < 10; i++){ const u = ufC((out - .4) / .6, 0, 1), x = ufLerp(cx + (ufH(i, 2) - .5) * R, cx - R * .9, u), y = ufLerp(cy - R * .5, cy - R * 1.6, u); ufPx(Hd, x, y, P.o); ufPx(Hd, x + 1, y, P.b); }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 6800, k = ufEase(ufC((T - 700) / 600, 0, 1)), fade = ufC((T - 5600) / 1200, 0, 1), kp = ufKeep(fade), cs = R * .21;
    for(let a = -2; a <= 2; a++) for(let b = -2; b <= 2; b++){ if(Math.abs(a + b) > 2) continue; const x = cx + cs * 1.73 * (a + b / 2) * 1.15 * k, y = cy + cs * 1.5 * b * .62 * k * 1.1 - 2; ubHex(S, x, y, cs * .8 * k, P.d, 1, undefined); if(kp(a + 7, b + 9)) ubHex(S, x, y, cs * .72 * k, P.a, 0, .3); }
  }});

/* ---------- PUNTADA: un bordado en estrella se cose en cuatro vueltas y unas tijeras gigantes cortan cada una; la ultima revienta en hilos y retazos ---------- */
ufDefForm('stitch', {N: 30, tall: 1.6, dur: 3000, gdur: 3600, shake: 5, pad: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 3000, LAP = [600, 1200, 1800, 2400];
    const sy = .55;
    if(T < 600) ufEdgeMarks(S, o, 14, 'stitch', P.c, .1);
    // carrete y tijeras en el aire durante la anticipacion
    const air = ufC(T / 300, 0, 1) * (1 - ufC((T - 700) / 400, 0, 1));
    const scissors = (px, py, ang, open, sz) => { for(const s of [-1, 1]){ const a = ang + s * open, ex = px + Math.cos(a) * sz, ey = py + Math.sin(a) * sz, hx = px - Math.cos(a + s * .35) * sz * .45, hy = py - Math.sin(a + s * .35) * sz * .45;
        ufLine(Hd, px, py, ex, ey, 2, P.e); ufLine(Hd, px, py, ex, ey, 1, P.c); ufLine(Hd, px, py, hx, hy, 2, P.b); ufDisc(Hd, hx - Math.cos(a + s * .35) * 2, hy - Math.sin(a + s * .35) * 2, Math.max(1.5, sz * .13), P.a); } ufDisc(Hd, px, py, 1.5, P.o); };
    if(air > .05){ scissors(cx, cy - R * 1.0, -1.57, .35 + .3 * Math.sin(T / 60), R * .45 * air); ufDisc(Hd, cx + R * .45, cy - R * .8, R * .13, P.a); ufRing(Hd, cx + R * .45, cy - R * .8, R * .13, 1, P.c, {dash: {n: 4, on: .5}}); }
    // vueltas de bordado: octogono, estrella {8/3}, aro de puntadas, cruces
    const lap = (k, fn) => { const d = ufC((T - LAP[k] + 500) / 500, 0, 1); if(d > 0) fn(d); };
    const brk = ufC((T - 2400) / 600, 0, 1);
    const pt = (r, i, n, off) => { const a = off + i * 6.2832 / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * sy]; };
    lap(0, d => { const n = 8; for(let i = 0; i < n * d; i++){ const a = pt(R * .95, i, n, 0), b = pt(R * .95, i + 1, n, 0); ufLine(Hd, a[0], a[1], b[0], b[1], 1, P.c, .75); } });
    lap(1, d => { const n = 8; for(let i = 0; i < n * d; i++){ const a = pt(R * .95, i, n, 0), b = pt(R * .95, i + 3, n, 0); ufLine(Hd, a[0], a[1], b[0], b[1], 1, P.b, .6); } });
    lap(2, d => { for(let i = 0; i < 32 * d; i++){ const a = pt(R * .5, i, 32, 0); ufPx(Hd, a[0], a[1], i & 1 ? P.c : P.a); ufPx(Hd, a[0] + 1, a[1], P.a); } });
    lap(3, d => { for(let i = 0; i < 8 * d; i++){ const a = pt(R * .72, i, 8, .39); UF_MARK.cross(Hd, a[0], a[1], 0, P.e); } });
    // cada corte: tijeras que recorren la vuelta
    LAP.forEach((t0, k) => { const d = (T - t0 + 300) / 420; if(d < 0 || d > 1) return; const a = pt(R * (k === 2 ? .5 : .95), d * 8, 8, 0); scissors(a[0], a[1] - 4, -.8 + d * 3, .12 + .45 * Math.abs(Math.sin(d * 18)), R * .36); if(d > .2) for(let j = 0; j < 4; j++) ufPx(S, a[0] + (ufH(j, k) - .5) * 10, a[1] + (ufH(j, k + 3) - .5) * 6, P.c); });
    // el cuarto corte rompe el bordado: hilos hacia afuera y retazos
    if(brk > 0) for(let i = 0; i < 20; i++){ const a = i * .3142 + .1, r0 = R * (.2 + .2 * ufH(i, 3)), r1 = R * (.5 + .55 * brk) * (.7 + .3 * ufH(i, 4)); if(ufH(i, 8) > brk * .85){ ufLine(Hd, cx + Math.cos(a) * r0 * (1 + brk), cy + Math.sin(a) * r0 * sy * (1 + brk), cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * sy - brk * 6, 1, i & 1 ? P.c : P.b); } }
    if(brk > 0) for(let i = 0; i < 10; i++){ const a = ufH(i, 21) * 6.28, r1 = R * (.3 + .8 * brk) * ufH(i, 22), y = cy + Math.sin(a) * r1 * sy - Math.sin(brk * 3.14) * R * .5 * ufH(i, 23); ufPx(S, cx + Math.cos(a) * r1, y, P.a); ufPx(S, cx + Math.cos(a) * r1 + 1, y, P.d); }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 3600, k = ufEase(ufC((T - 200) / 400, 0, 1)), fade = ufC((T - 2700) / 900, 0, 1);
    ufEll(S, cx, cy, R * .98 * k, R * .55 * .98 * k, P.d, .12 * (1 - fade));
    for(let i = 0; i < 8; i++){ const a = i * .7854, b = a + 2.356; if(ufH(i, 5) > fade) ufLine(S, cx + Math.cos(a) * R * .9 * k, cy + Math.sin(a) * R * .5 * k, cx + Math.cos(b) * R * .9 * k, cy + Math.sin(b) * R * .5 * k, 1, P.d, .5); }
  }});

/* ---------- HERIDA: un tajo circular abre una herida en C con un corazon latiendo; hilos de sangre convergen y se cierra con puntos de sutura ---------- */
const UB_HEART = ['.rr.rr.', 'rhrrrrr', 'rhrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'];
ufDefForm('wound', {N: 30, tall: 1.2, dur: 2200, gdur: 3000, shake: 9, pad: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 2200, sy = .6;
    const hs = Math.max(1, Math.round(R / 20)), beat = k => 1 + .35 * Math.max(0, Math.sin(k * 6.28)) ** 3;
    if(T < 400){ ufEdgeMarks(S, o, 12, 'tick', P.b, .2); ufBmp(Hd, UB_HEART, {r: P.a, h: P.b}, cx, cy, {sc: hs * (T / 400 * .6 + .4)}); return; }
    // tajo circular: arco brillante que recorre 360 grados
    const sw = ufC((T - 380) / 260, 0, 1), a1 = -2.2 + sw * 6.28;
    if(sw < 1) for(let i = 0; i < 18; i++){ const a = a1 - i * .09; if(a < -2.2) break; ufPx(Hd, cx + Math.cos(a) * R * .95, cy + Math.sin(a) * R * .95 * sy, i < 3 ? P.e : i < 8 ? P.c : P.b); ufPx(Hd, cx + Math.cos(a) * R * .88, cy + Math.sin(a) * R * .88 * sy, P.b); }
    // herida en C: banda de labios que se abre y se cierra de afuera hacia adentro
    const open = ufEase(ufC((T - 640) / 280, 0, 1)), shut = ufC((T - 1500) / 500, 0, 1), wid = R * .24 * open * (1 - shut * .97), span = 4.9 * (1 - shut * .5);
    if(wid > .8){
      const out = [], inn = [], rim = [];
      for(let i = 0; i <= 28; i++){ const u = i / 28, a = .7 + u * span, e = Math.sin(u * 3.14) ** .8, r0 = R * .8, w = wid * e; out.push([cx + Math.cos(a) * (r0 + w), cy + Math.sin(a) * (r0 + w) * sy]); inn.push([cx + Math.cos(a) * (r0 - w), cy + Math.sin(a) * (r0 - w) * sy]); }
      ufPoly(Hd, out.concat(inn.slice().reverse()), P.o); ufPoly(Hd, out.map((p, i) => [ufLerp(p[0], inn[i][0], .25), ufLerp(p[1], inn[i][1], .25)]).concat(inn.map((p, i) => [ufLerp(p[0], out[i][0], .25), ufLerp(p[1], out[i][1], .25)]).reverse()), P.d, 1);
      ubPath(Hd, out, 1, P.b); ubPath(Hd, inn, 1, P.c);
      for(let i = 2; i < 28; i += 3){ const p = out[i], p2 = inn[i]; ufLine(Hd, p[0], p[1], ufLerp(p[0], p2[0], .4), ufLerp(p[1], p2[1], .4), 1, P.a); }
      // puntos de sutura al cerrarse
      if(shut > .3) for(let i = 3; i < 28; i += 4){ const m = [(out[i][0] + inn[i][0]) / 2, (out[i][1] + inn[i][1]) / 2]; ufLine(Hd, m[0] - 2, m[1] - 2, m[0] + 2, m[1] + 2, 1, P.c); ufLine(Hd, m[0] - 2, m[1] + 2, m[0] + 2, m[1] - 2, 1, P.c); }
    }
    // corazon que late dos veces
    const hk = ufC((T - 640) / 800, 0, 1), hb = beat(hk * 2) * (1 - shut * .4);
    if(T > 600 && shut < 1) ufBmp(Hd, UB_HEART, {r: P.a, h: P.b}, cx, cy, {sc: Math.max(1, Math.round(hs * hb))});
    // hilos de sangre que convergen al centro desde los bordes (heridas consumidas)
    if(T > 800 && T < 1800) for(let i = 0; i < 6; i++){ const a = i * 1.0472 + .4, tt = ufC((T - 800 - i * 60) / 700, 0, 1); if(tt <= 0) continue;
      for(let j = 0; j < 14; j++){ const u = j / 14, v = ufC(tt * 1.3 - u * .3, 0, 1); if(v <= 0 || v >= 1) continue; const rr = R * (1 - v) * .85, bend = Math.sin(v * 3.14) * .5, aa = a + bend; ufPx(Hd, cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr * sy, j % 3 ? P.a : P.b); } }
    if(sw > .5 && sw < 1) for(let i = 0; i < 8; i++) ufPx(S, cx + Math.cos(a1 + i) * R * (.4 + ufH(i, 2) * .6), cy + Math.sin(a1 + i) * R * .6 * (.4 + ufH(i, 2) * .6) - 2, P.b);
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 3000, fade = ufC((T - 1800) / 1200, 0, 1);
    for(let i = 0; i < 40; i++){ const a = .7 + ufH(i, 1) * 4.9, r = R * (.6 + .38 * ufH(i, 2)), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .6; if(T > 700 && ufH(i, 3) > fade) ufDisc(S, x, y, 1.2 + (i % 3 === 0), i & 1 ? P.d : P.a); }
  }});

/* ---------- COLAPSO: una estrella de cinco puntas crece, se vuelve un agujero negro con disco de acrecion y estrellas succionadas, se contrae y revienta ---------- */
ufDefForm('collapse', {N: 42, tall: 1.5, dur: 4300, gdur: 4900, shake: 11, pad: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 4300, CY = cy - R * .45, st = R * .55;
    if(T < 500) ufEdgeMarks(S, o, 12, 'star', P.e, .1);
    const star = (x, y, r1, r2, rot, c, dens) => { const p = []; for(let i = 0; i < 10; i++){ const a = rot + i * .6283 - 1.5708, rr = i & 1 ? r2 : r1; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } ufPoly(Hd, p, c, dens); };
    if(T < 1500){ // fase 1: estrella que pulsa y crece
      const g = ufEase(T / 1500), r1 = (R * .12 + R * .35 * g) * (1 + .08 * Math.sin(T / 90)), rot = T * .0008;
      star(cx, CY, r1, r1 * .45, rot, P.e); star(cx, CY, r1 * .68, r1 * .3, rot, P.c); ufDisc(Hd, cx, CY, r1 * .22, P.c);
      for(let i = 0; i < 10; i++){ const a = rot + i * .6283 - 1.5708; if(i & 1) continue; ufLine(S, cx + Math.cos(a) * r1 * 1.05, CY + Math.sin(a) * r1 * 1.05, cx + Math.cos(a) * r1 * (1.4 + .2 * Math.sin(T / 80 + i)), CY + Math.sin(a) * r1 * (1.4 + .2 * Math.sin(T / 80 + i)), 1, P.e); }
    } else if(T < 3700){ // fase 2: singularidad
      const u = (T - 1500) / 2200, bh = R * (.34 - .1 * u), ap = ufEase(ufC((T - 1500) / 300, 0, 1));
      ufDisc(Hd, cx, CY, bh, P.o); ufRing(Hd, cx, CY, bh, 1, P.b);
      const disc = (front) => { for(let k = 0; k < 5; k++){ const rr = (bh + 3 + k * R * .1) * ap, th = k < 2 ? 2 : 1; ufRing(Hd, cx, CY, rr, th, k < 2 ? P.e : k < 4 ? P.b : P.a, {rx: rr * 1.5, ry: rr * .3, keep: (x, y) => ((y > CY) === front) && (front || Math.hypot(x - cx, (y - CY) * 3) > bh * 1.05) && ufDith(x + ((T / 60) | 0) % 4 * (k + 1), y, k < 3 ? 1 : .7) || false}); } };
      disc(false); disc(true);
      // estrellas lejanas succionadas en espiral
      for(let i = 0; i < 26; i++){ const p = ((T / 1600) + ufH(i, 5)) % 1, a = ufH(i, 6) * 6.28 + p * 4, rr = R * (1 - p) * .98 + bh * .5, x = cx + Math.cos(a) * rr, y = CY + Math.sin(a) * rr * .5; const a2 = a - .35, x2 = cx + Math.cos(a2) * rr * 1.04, y2 = CY + Math.sin(a2) * rr * 1.04 * .5; ufLine(S, x2, y2, x, y, 1, P.b, .7); ufPx(Hd, x, y, i & 1 ? P.c : P.e); }
    } else { // fase 3: contraccion, destello y onda
      const u = ufC((T - 3700) / 160, 0, 1), v = ufC((T - 3860) / 440, 0, 1);
      if(u < 1) { ufDisc(Hd, cx, CY, R * .24 * (1 - u) + 1, P.o); ufRing(Hd, cx, CY, R * .24 * (1 - u) + 1, 1, P.c); }
      if(v < .25) { ufDisc(Hd, cx, CY, R * (.3 + v * 3), P.c); }
      for(let i = 0; i < 16; i++){ const a = i * .3927, r1 = R * ufEase(v) * .98, r0 = r1 * .55; ufLine(Hd, cx + Math.cos(a) * r0, CY + Math.sin(a) * r0 * .5, cx + Math.cos(a) * r1, CY + Math.sin(a) * r1 * .5, i & 1 ? 1 : 2, v < .6 ? P.c : P.b); }
      for(let i = 0; i < 28; i++){ const a = ufH(i, 13) * 6.28, d = R * ufEase(v) * (.3 + .7 * ufH(i, 14)); if(ufH(i, 15) > v * .9) ufPx(S, cx + Math.cos(a) * d, CY + Math.sin(a) * d * .5, i & 1 ? P.e : P.a); }
      if(v < .6) ufRing(Hd, cx, CY, R * ufEase(v) * .98, 2, P.c, {rx: R * ufEase(v) * .98, ry: R * ufEase(v) * .49, keep: ufKeep(v * 1.4)});
    }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 4900, g = ufC((T - 1500) / 300, 0, 1), fade = ufC((T - 4100) / 800, 0, 1);
    if(T > 1500 && T < 3700) ufEll(S, cx, cy - R * .05, R * .75 * g, R * .3 * g, P.o, .25);
    if(T > 3860) for(let i = 0; i < 30; i++){ const a = ufH(i, 21) * 6.28, d = R * (.3 + .65 * ufH(i, 22)), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .5; if(ufH(i, 23) > fade) ufPx(S, x, y, i & 1 ? P.a : P.d); }
  }});

/* ---------- SANTUARIO: alas nacaradas se abren detras de ella, un halo con ocho muescas enciende una por golpe y rayos suaves caen del cielo ---------- */
ufDefForm('halo', {N: 40, tall: 1.8, dur: 6200, gdur: 6800, shake: 5, pad: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 6200, out = ufC((T - 5500) / 700, 0, 1), WY = cy - R * .75;
    if(T < 650) ufEdgeMarks(S, o, 8, 'star', P.c, .2);
    const open = ufEase(ufC((T - 200) / 600, 0, 1)) * (1 - out * .9), br = 1 + .06 * Math.sin(T / 500);
    // alas: cada una con cinco plumas largas
    if(open > .02) for(const s of [-1, 1]) for(let i = 0; i < 6; i++){
      const a = -.2 - i * .24 * open + (s < 0 ? 0 : 0), len = R * (.8 - i * .06) * open * br, x0 = cx + s * R * .12, y0 = WY - i * 1.5, ex = x0 + s * Math.cos(a) * len, ey = y0 + Math.sin(a) * len - i * R * .02, mx = (x0 + ex) / 2, my = Math.min(y0, ey) - R * .1 * open;
      const pts = []; for(let j = 0; j <= 10; j++){ const u = j / 10; pts.push([ufLerp(ufLerp(x0, mx, u), ufLerp(mx, ex, u), u), ufLerp(ufLerp(y0, my, u), ufLerp(my, ey, u), u)]); }
      ubPath(Hd, pts, 3 - (i > 3), P.a); ubPath(Hd, pts, 1, P.c); if(i < 5) ufPx(Hd, ex, ey + 1, P.e);
      ufPoly(S, [pts[2], pts[10], [ex, ey + R * .22 * open], [pts[2][0], pts[2][1] + R * .1]], P.b, .22);
    }
    // rayos del cielo
    const rk = ufC((T - 900) / 500, 0, 1) * (1 - out); if(rk > 0) for(let i = 0; i < 5; i++){ const bx = cx + (i - 2) * R * .38, sw = Math.sin(T / 700 + i) * 3; for(let y = 0; y < cy - 1; y += 1) if(ufDith(bx | 0, y, .3 * rk)) { ufPx(S, bx + sw * (1 - y / cy), y, P.c); ufPx(S, bx + 1 + sw * (1 - y / cy), y, P.b); } }
    // halo de pie con ocho muescas encima de la cabeza
    const hk = ufEase(ufC((T - 150) / 500, 0, 1)) * (1 - out), hr = R * .5 * hk;
    if(hr > 2){ ufRing(Hd, cx, WY - R * .55, hr, 2, P.c, {rx: hr, ry: hr * .3}); ufRing(Hd, cx, WY - R * .55, hr - 2, 1, P.a, {rx: hr - 2, ry: hr * .3 - 1});
      for(let i = 0; i < 8; i++){ const a = i * .7854, lit = T > 900 + i * 650; ufDisc(Hd, cx + Math.cos(a) * hr, WY - R * .55 + Math.sin(a) * hr * .3, lit ? 1.6 : 1.1, lit ? P.e : P.d); } }
    // brillo de golpe: un destello recorre el aro cada 650 ms
    const fl = (T % 650) / 650; if(T > 900 && out < 1 && fl < .3 && hr > 2){ const a = fl * 20; ufPx(Hd, cx + Math.cos(a) * hr, WY - R * .55 + Math.sin(a) * hr * .3, P.c); }
    // onda final
    if(out > 0 && out < .6){ const v = out / .6; for(let i = 0; i < 14; i++){ const a = i * .4488; ufLine(Hd, cx + Math.cos(a) * R * .3 * v, cy + Math.sin(a) * R * .17 * v, cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * .5 * v, 1, P.c); } }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 6800, k = ufEase(ufC((T - 200) / 600, 0, 1)), fade = ufC((T - 5600) / 1200, 0, 1), rr = R * .96 * k;
    ufEll(S, cx, cy, rr, rr * .5, P.b, .1 * (1 - fade));
    const seg = (x, y) => Math.min(7, Math.floor(((Math.atan2((y - cy) * 2, x - cx) + Math.PI) / 6.2832) * 8)), kk = ufKeep(fade);
    ufRing(S, cx, cy, rr, 2, P.c, {rx: rr, ry: rr * .5, keep: (x, y) => T > 900 + seg(x, y) * 650 && kk(x, y)});
    ufRing(S, cx, cy, rr, 2, P.a, {rx: rr, ry: rr * .5, keep: (x, y) => !(T > 900 + seg(x, y) * 650) && kk(x, y)});
  }});

/* ---------- VALVULAS: seis valvulas de laton con volante sueltan chorros de vapor en abanico, uno mayor en cada pulso; el guante se pone al rojo blanco ---------- */
ufDefForm('valves', {N: 30, tall: 1.6, dur: 3100, gdur: 3700, shake: 6, pad: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 3100, PUL = [700, 1300, 1900, 2500], out = ufC((T - 2800) / 300, 0, 1);
    if(T < 650) ufEdgeMarks(S, o, 12, 'dot', P.e, .1);
    const vk = ufEase(ufC(T / 400, 0, 1)) * (1 - out);
    const VA = [-.5, .5, 2.2, 3.1 + .0, 4.1, 5.3].map((a, i) => a + 0), pos = i => ({x: cx + Math.cos(i * 1.0472 + .52) * R * .74, y: cy + Math.sin(i * 1.0472 + .52) * R * .74 * .55});
    // tuberias del centro a cada valvula
    for(let i = 0; i < 6; i++){ const p = pos(i); ufLine(Hd, cx, cy, ufLerp(cx, p.x, vk), ufLerp(cy, p.y, vk), 2, P.d); ufLine(Hd, cx, cy - 1, ufLerp(cx, p.x, vk), ufLerp(cy, p.y, vk) - 1, 1, P.e); }
    // guante al rojo blanco en el centro
    const heat = ufC(T / 600, 0, 1); ufDisc(Hd, cx, cy - 2, R * .12 * vk + 1, heat > .6 ? P.c : P.b); ufDisc(Hd, cx, cy - 2, R * .07 * vk, P.c);
    const jets = [];
    for(let i = 0; i < 6; i++){
      const p = pos(i), v = vk, wr = Math.max(2, R * .1), open = PUL.some((t0, k) => (k % 6 === i % 4 || k === 3) && T > t0 && T < t0 + 450);
      if(v > .3){ ufDisc(Hd, p.x, p.y, wr, P.e); ufDisc(Hd, p.x, p.y, wr * .6, P.o);
        for(let s = 0; s < 4; s++){ const a = T * .006 * (i & 1 ? 1 : -1) + s * 1.5708; ufLine(Hd, p.x, p.y, p.x + Math.cos(a) * wr * 1.25, p.y + Math.sin(a) * wr * 1.25, 1, P.b); }
        ufDisc(Hd, p.x, p.y, 1, P.c); ufPoly(Hd, [[p.x - wr * .5, p.y + wr * .8], [p.x + wr * .5, p.y + wr * .8], [p.x + wr * .7, p.y + wr * 1.5], [p.x - wr * .7, p.y + wr * 1.5]], P.e); }
      for(const [k, t0] of PUL.entries()){ const d = (T - t0 - i * 25) / 520; if(d < 0 || d > 1) continue; jets.push({p, d, k, i, big: k === 3 || (k % 6) === i % 4}); }
    }
    // chorros de vapor: nubes de pixel que salen hacia afuera y suben
    for(const j of jets){ const ang = Math.atan2(j.p.y - cy, j.p.x - cx), n = j.big ? 9 : 5;
      for(let s = 0; s < n; s++){ const u = ufC(j.d * 1.2 - s * .07, 0, 1); if(u <= 0 || u >= 1) continue; const dist = R * (.04 + .3 * u) * (j.big ? 1.1 : .85), x = j.p.x + Math.cos(ang) * dist + (ufH(s, j.i + j.k * 5) - .5) * 4 * u, y = j.p.y + Math.sin(ang) * dist * .55 - u * R * .5 - 2, r = 1.4 + u * R * (j.big ? .14 : .1);
        ufDisc(Hd, x, y, r, s % 3 === 0 ? P.b : P.c, 1); ufDisc(S, x + 1, y + 1, r * .6, P.d, .5); } }
    if(jets.some(j => j.k === 3 && j.d < .3)) for(let i = 0; i < 12; i++){ const a = i * .5236; ufLine(Hd, cx + Math.cos(a) * R * .3, cy + Math.sin(a) * R * .17, cx + Math.cos(a) * R * .9, cy + Math.sin(a) * R * .5, 1, P.c); }
    // brasas
    for(let i = 0; i < 12; i++){ const u = ((T / 700) + ufH(i, 5)) % 1, a = ufH(i, 6) * 6.28, d = R * .5 * ufH(i, 7); if(vk > .5) ufPx(S, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .5 - u * R * .6, i & 1 ? P.b : P.a); }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 3700, k = ufEase(ufC(T / 400, 0, 1)), fade = ufC((T - 2900) / 800, 0, 1);
    for(let i = 0; i < 6; i++){ const a = i * 1.0472 + .52, x = cx + Math.cos(a) * R * .74, y = cy + Math.sin(a) * R * .74 * .55; ufEll(S, x, y + 2, R * .13 * k, R * .06 * k, P.o, .5 * (1 - fade)); ufLine(S, cx, cy, x, y, 1, P.d, .4 * (1 - fade)); }
    ufEll(S, cx, cy, R * .8 * k, R * .44 * k, P.d, .1 * (1 - fade));
  }});
