'use strict';
/* js/champions/ult-forms/forms-2a-2.js — segunda tanda de definitivas con silueta propia (parte 2): iria, khepri, maura, morveth, morwen, myla, nigromante.
   Mismo contrato que forms-1/2/3 y forms-2a-1.js (usa las ayudas UA de ese archivo). Sin Math.random: el "azar" sale de ufH (hash fijo). Solo visual.
   Tejido de hilos con triskel, eclipse con huracán de escarabajos, arboledad de zarzas que camina, jardín de hongos con micelio, alambique con ecos, lágrimas gigantes con charcos lobulados,
   columna de fuego verde con cráneo cornudo y almas que entran. */

/* ---------- TEJIDO (iria): triángulo de hilos finos con arte de cuerdas entre los lados, triskel que gira y tres agujas de luz en los vértices ---------- */
ufDefForm('weave', {N: 40, tall: 1.5, dur: 3600, gdur: 0, shake: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, EY = .62, fray = ufC((q - .8) / .2, 0, 1);
    const V = [0, 1, 2].map(i => { const a = -1.5708 + i * 2.0944; return [cx + Math.cos(a) * R * .98, cy + Math.sin(a) * R * .98 * EY]; });
    const sideK = j => ufEase(ufC((q - .02 - j * .045) / .06, 0, 1));
    if(q < .2) ufEdgeMarks(S, o, 12, 'diamond', P.b, 0, 1);
    // los tres lados se dibujan uno a uno
    for(let j = 0; j < 3; j++){ const A = V[j], B = V[(j + 1) % 3], k = sideK(j); if(k <= 0) continue; const bx = A[0] + (B[0] - A[0]) * k, by = A[1] + (B[1] - A[1]) * k;
      ufLine(S, A[0], A[1], bx, by, 2, P.a); ufLine(S, A[0], A[1], bx, by, 1, P.b); if(fray > 0) for(let t = 0; t < 12; t++){ const u = t / 12 * k; if(ufH(t, j + 5) < fray) ufPx(S, A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, P.d); } }
    // arte de cuerdas: desde cada esquina, rectas que unen puntos de los dos lados (el envolvente es una curva)
    const m = 9, glow = (q * 10) % 1 < .3 ? 1 : 0;
    for(let i = 0; i < 3; i++){ const C = V[i], A = V[(i + 1) % 3], B = V[(i + 2) % 3];
      for(let kk = 1; kk < m; kk++){ const t = kk / m, e = ufC((q - .16 - i * .02 - kk * .008) / .06, 0, 1); if(e <= 0) continue;
        const p1 = [C[0] + (A[0] - C[0]) * t, C[1] + (A[1] - C[1]) * t], p2 = [C[0] + (B[0] - C[0]) * (1 - t), C[1] + (B[1] - C[1]) * (1 - t)], fr = fray * (.4 + .6 * ufH(kk, i + 3));
        if(ufH(kk, i + 70) < fray * .85) continue;
        ufLine(S, ufLerp(p1[0], C[0], fr), ufLerp(p1[1], C[1], fr), ufLerp(p1[0], p2[0], e), ufLerp(p1[1], p2[1], e), 1, glow && (kk + i) % 3 === 0 ? P.c : (kk & 1 ? P.b : P.a)); } }
    // triskel en el centro
    const tk = ufEase(ufC((q - .18) / .1, 0, 1)), sp = q * TAU * 1.5, tr = R * .26 * tk;
    if(tr > 2){ for(let a = 0; a < 3; a++){ let px = cx, py = cy; for(let s = 1; s <= 12; s++){ const u = s / 12, an = sp + a * 2.0944 + u * 2.4, r = tr * (.12 + .88 * u), x = cx + Math.cos(an) * r, y = cy + Math.sin(an) * r * EY * 1.35; ufLine(Hd, px, py, x, y, 2, P.a); ufLine(Hd, px, py, x, y, 1, P.b); px = x; py = y; } ufDisc(Hd, px, py, 2, P.c); }
      ufDisc(Hd, cx, cy, 2.4, P.d); ufPx(Hd, cx, cy, P.c); }
    // agujas de luz en los vértices
    for(let i = 0; i < 3; i++){ const v = V[i], g = ufEase(ufC((q - .12 - i * .03) / .1, 0, 1)) * (1 - ufIn(fray)), h = R * (.95 + glow * .12) * g; if(h < 3) continue;
      ufPoly(Hd, [[v[0] - 2, v[1]], [v[0], v[1] - h], [v[0] + 2, v[1]]], P.b); ufLine(Hd, v[0], v[1], v[0], v[1] - h + 3, 1, P.c);
      ufPoly(Hd, [[v[0], v[1] - h - 4], [v[0] + 2.4, v[1] - h], [v[0], v[1] - h + 4], [v[0] - 2.4, v[1] - h]], P.e); ufDisc(Hd, v[0], v[1], 2.6, P.e); ufPx(Hd, v[0], v[1], P.c);
      for(let s = 0; s < 4; s++) ufPx(S, v[0] + (ufH(s, i + f) - .5) * 5, v[1] - ((s * 7 + f * 2) % Math.max(4, h | 0)), P.b); }
    // pulso de trama: el interior brilla tramado
    ufPoly(S, V, P.b, .1 + .08 * glow, ufKeep(fray * .9));
    if(fray > 0) for(let i = 0; i < 12; i++){ const v = V[i % 3], u = ufH(i, 5) * (1 - fray * .5); if(ufH(i, 6) > fray) ufPx(S, ufLerp(cx, v[0], u), ufLerp(cy, v[1], u) + fray * 6, P.d); }
  }});

/* ---------- ECLIPSE (khepri): un disco negro con corona de oro se alza sobre la zona; debajo gira un huracán de escarabajos y al final todo estalla hacia afuera ---------- */
ufDefForm('eclipse', {N: 40, tall: 2.0, dur: 3800, gdur: 0, shake: 9,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, EY = .55, rise = ufEase(ufC((q - .12) / .18, 0, 1)), fin = ufC((q - .8) / .2, 0, 1), blast = ufEase(ufC((q - .8) / .2, 0, 1));
    const dc = [cx, cy - R * (.5 + 1.15 * rise)], dr = R * .46 * (.3 + .7 * rise), pul = Math.max(0, Math.sin(q * 52));
    if(q < .14){ ufEdgeMarks(S, o, 12, 'spark', P.c, .1); }
    // el cielo se oscurece: umbra que baja del disco al suelo (tramado)
    if(rise > .1) ufPoly(S, [[dc[0] - dr * .8, dc[1] + dr * .6], [dc[0] + dr * .8, dc[1] + dr * .6], [cx + R * .8, cy + 2], [cx - R * .8, cy + 2]], P.d, .22 * (1 - fin));
    // huracán de escarabajos: espirales a velocidad creciente alrededor del eje
    const nB = R >= 36 ? 74 : 44, spd = 1.2 + 4 * q;
    for(let i = 0; i < nB; i++){
      const hh = ufH(i, 1), hz = ufH(i, 2), hr = ufH(i, 3), up = hz * R * 1.25, rho = R * (.2 + .78 * hr) * (.55 + .45 * Math.sqrt(hz)) * (1 - fin * .1);
      let a = ufH(i, 4) * TAU + q * TAU * spd * (i & 1 ? 1 : .8), x, y;
      if(blast > 0){ const dd = R * 1.15 * blast * (.5 + hh * .5), ang = ufH(i, 5) * TAU; x = cx + Math.cos(ang) * dd; y = cy - up * .6 + Math.sin(ang) * dd * EY - blast * R * .3; if(ufH(i, 6) < fin * .85) continue; }
      else { if(q < .1 + hz * .1) continue; x = cx + Math.cos(a) * rho; y = cy - up * ufC((q - .1) / .15, 0, 1) + Math.sin(a) * rho * EY; }
      const near = Math.sin(a) > 0 || blast > 0, col = i % 3 === 0 ? P.e : i % 3 === 1 ? P.b : P.a, wing = ((f + i) & 1);
      if(near && i % 2 === 0){ ufPoly(Hd, [[x - 2, y - 1], [x + 2, y - 1], [x + 2, y + 1], [x - 2, y + 1]], col); ufPx(Hd, x - 1 + wing * 2, y - 2, P.c); } else { ufPx(S, x, y, col); ufPx(S, x + 1, y, col); ufPx(S, x, y + 1, P.d); }
    }
    // el disco solar: negro con anillo de corona dorada que pulsa
    if(dr > 3 && fin < 1){
      const cr = dr * (1.55 + .35 * pul), nr = 28;
      for(let i = 0; i < nr; i++){ const a = i * TAU / nr + q * .4, ln = cr * (i % 2 ? .78 : 1) * (.85 + .3 * ufH(i, 7)), wb = i % 2 ? .1 : .13;
        if(fin > 0 && ufH(i, 8) < fin) continue; ufPoly(Hd, [[dc[0] + Math.cos(a - wb) * dr, dc[1] + Math.sin(a - wb) * dr], [dc[0] + Math.cos(a) * ln, dc[1] + Math.sin(a) * ln], [dc[0] + Math.cos(a + wb) * dr, dc[1] + Math.sin(a + wb) * dr]], i % 4 === 0 ? P.c : P.e); }
      if(fin < .6) ufDisc(S, dc[0], dc[1], dr * 1.28, P.c, (.3 + .2 * pul) * (1 - fin / .6));
      const pieces = fin > 0 ? 3 : 1;
      for(let pi = 0; pi < pieces; pi++){ const a0 = pi * 2.0944 + .5, off = fin * R * .8, dx = Math.cos(a0 + 1.05) * off, dy = Math.sin(a0 + 1.05) * off + fin * fin * R * .6;
        if(pieces === 1) ufDisc(Hd, dc[0], dc[1], dr, P.o); else { const pts = [[dc[0] + dx, dc[1] + dy]]; for(let s = 0; s <= 8; s++){ const a = a0 + s / 8 * 2.0944; pts.push([dc[0] + dx + Math.cos(a) * dr, dc[1] + dy + Math.sin(a) * dr]); } ufPoly(Hd, pts, P.o, 1, ufKeep(fin * .9, pi)); } }
      ufRing(Hd, dc[0], dc[1], dr, 1.5, P.c, {a0: 3.7, a1: 1.6, keep: ufKeep(fin)});      // aro de luz del eclipse total
      for(let i = 0; i < 6; i++){ const a = 4 + i * .22; ufPx(Hd, dc[0] + Math.cos(a) * (dr - 2), dc[1] + Math.sin(a) * (dr - 2), P.d); }
    }
    // chispas de oro que caen de la corona
    for(let i = 0; i < 12; i++){ const u = (ufH(i, 9) + q * 1.5) % 1, x = dc[0] + (ufH(i, 10) - .5) * dr * 3, y = dc[1] + dr + u * (cy - dc[1] - dr); if(rise > .5 && ufH(i, 11) > fin) ufPx(S, x, y, i & 1 ? P.c : P.e); }
  }});

/* ---------- ARBOLEDA (maura): seis arbolitos espinosos brotan y caminan; cada pulso un seto de zarzas sale y vuelve ---------- */
ufDefForm('grove', {N: 40, tall: 1.55, dur: 3600, gdur: 0, shake: 5,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, EY = .55, wilt = ufC((q - .82) / .18, 0, 1), sprout = i => ufEase(ufC((q - .08 - i * .02) / .1, 0, 1));
    if(q < .12) ufEdgeMarks(S, o, 12, 'chev', P.a, 0, 1, 1.5708 * 3);
    const T = [];
    for(let i = 0; i < 6; i++){ const a = i * 1.0472 + .5 + (ufH(i, 1) - .5) * .5, d = R * (.58 + .2 * ufH(i, 2)), walk = Math.sin(q * 14 + i * 1.7); T.push({i, x: cx + Math.cos(a) * d + walk * R * .04, y: cy + Math.sin(a) * d * EY - Math.abs(Math.sin(q * 28 + i)) * 1.5, s: R * (.17 + .05 * ufH(i, 3)), sway: Math.sin(q * 11 + i * 1.3)}); }
    T.sort((p, r) => p.y - r.y);
    // setos de zarzas: seis pulsos, el seto sale hasta el borde real y regresa
    for(let n = 0; n < 6; n++){ const k = ufC((q - .13 - n * .115) / .11, 0, 1); if(k <= 0 || k >= 1) continue; const rr = R * .98 * (k < .55 ? ufEase(k / .55) : 1 - ufEase((k - .55) / .45)) ;
      for(let seg = 0; seg < 8; seg++){ const a0 = seg * .7854 + n * .3, pts = 9; let px = null, py = null; for(let s = 0; s <= pts; s++){ const a = a0 + s / pts * .55, w = (s & 1 ? 1.8 : -1.8) * (k < .9 ? 1 : 0), x = cx + Math.cos(a) * (rr + w), y = cy + Math.sin(a) * (rr + w) * EY; if(px !== null) ufLine(S, px, py, x, y, 1, n & 1 ? P.a : P.d); if(s & 1) ufPx(S, x + Math.cos(a) * 2, y + Math.sin(a) * 2 * EY, P.e); px = x; py = y; } } }
    for(const t of T){
      const g = sprout(t.i), s = t.s * g * (1 - wilt * .6), sink = wilt * s * .9; if(g <= 0 || s < 2) continue; const bx = t.x, by = t.y + sink;
      ufEll(S, bx, by + 1, s * 1.2, s * .35, P.d, .7);
      ufPoly(Hd, [[bx - s * .22, by], [bx - s * .14, by - s * 1.5], [bx + s * .14, by - s * 1.5], [bx + s * .22, by]], P.f); ufLine(Hd, bx - s * .05, by, bx - s * .05, by - s * 1.3, 1, P.d);   // tronco
      const cyC = by - s * 1.9 - wilt * s * .4, sw = t.sway * s * .25;
      [[-.55, .35, .8, P.d], [.55, .35, .8, P.d], [0, -.15, 1.0, P.a]].forEach(([dx, dy, rr, col]) => ufDisc(Hd, bx + dx * s + sw, cyC + dy * s, s * rr, col));
      ufDisc(Hd, bx + sw - s * .2, cyC - s * .35, s * .55, P.b);        // luz sobre la copa
      for(let k = 0; k < 9; k++){ const a = k * .698 + ufH(t.i, k) * .3, rr = s * (1.0 + .1 * (k & 1)), x = bx + sw + Math.cos(a) * rr * 1.18, y = cyC + Math.sin(a) * rr * .9;   // espinas rojas
        ufPoly(Hd, [[x - 1, y], [x + 1, y], [x + Math.cos(a) * 3, y + Math.sin(a) * 3]], P.e); }
      for(let k = 0; k < 3; k++) { ufDisc(Hd, bx + sw + (k - 1) * s * .55, cyC + (k & 1 ? -1 : 1) * s * .2, 1.6, P.c); ufPx(Hd, bx + sw + (k - 1) * s * .55, cyC + (k & 1 ? -1 : 1) * s * .2, P.b); }    // rosas
    }
    // hojas que caen al marchitarse
    if(wilt > 0) for(let i = 0; i < 24; i++){ const u = (ufH(i, 4) + wilt * 1.2) % 1, x = cx + (ufH(i, 5) - .5) * R * 1.8, y = cy - R * .6 + u * R * .7; if(ufH(i, 6) > wilt) ufPx(S, x + Math.sin(u * 9 + i) * 2, y, i & 1 ? P.a : P.c); }
  }});

/* ---------- JARDÍN (morveth): hongos de sombrero púrpura brotan del borde al centro, un hongo gigante en medio y el micelio lleva olas de esporas ---------- */
ufDefForm('garden', {N: 40, tall: 1.5, dur: 3600, gdur: 0, shake: 5,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, EY = .58, burst = ufC((q - .8) / .2, 0, 1), pulses = [.26, .42, .58, .72];
    if(q < .14){ ufEdgeMarks(S, o, 12, 'dot', P.b, 0, 1); ufDisc(Hd, cx, cy - 2, 2 + 3 * q / .14, P.c); ufLine(S, cx, cy - 2, cx, cy - 2 - 8 * q / .14, 1, P.b); }
    const M = [];
    for(let i = 0; i < 15; i++){ const a = ufH(i, 1) * TAU, dd = Math.sqrt(ufH(i, 2)) * .88 + .12, x = cx + Math.cos(a) * dd * R, y = cy + Math.sin(a) * dd * R * EY, s = R * (.075 + .07 * ufH(i, 3)) * (1.15 - dd * .3); M.push({i, x, y, s, dd, g: ufEase(ufC((q - .08 - (1 - dd) * .14 - (dd > .7 ? -.05 : 0)) / .08, 0, 1))}); }
    M.push({i: 99, x: cx, y: cy, s: R * .3, dd: 0, g: ufEase(ufC((q - .22) / .12, 0, 1)), big: true});
    M.sort((p, r) => p.y - r.y);
    // micelio: filamentos del centro a cada hongo y una ola de brillo que viaja por ellos
    for(const m of M){ if(m.big || m.g <= 0) continue; for(let t = 0; t < 16; t++){ const u = t / 16, x = cx + (m.x - cx) * u + Math.sin(u * 6 + m.i) * 2, y = cy + (m.y - cy) * u; ufPx(S, x, y + 1, ufDith(t, m.i, .6 * (1 - burst)) ? P.d : P.a); }
      pulses.forEach(p => { const k = (q - p - m.dd * .06) / .08; if(k > 0 && k < 1){ const x = cx + (m.x - cx) * k + Math.sin(k * 6 + m.i) * 2, y = cy + (m.y - cy) * k; ufDisc(S, x, y, 1.5, P.b); ufPx(S, x, y, P.c); } }); }
    for(const m of M){
      if(m.g <= 0) continue; const s = m.s * m.g, cp = burst > 0 ? ufC(burst * 3 - (m.i % 5) * .3, 0, 1) : 0; if(cp >= 1) continue;
      const bx = m.x, by = m.y, sh = m.big ? s * .09 : 0, bump = pulses.some(p => q > p && q < p + .04) ? 1.12 : 1, ss = s * bump;
      ufEll(S, bx, by + 1, ss * 1.1, ss * .3, P.d, .7);
      ufPoly(Hd, [[bx - ss * .22, by], [bx - ss * .16, by - ss * 1.1], [bx + ss * .16, by - ss * 1.1], [bx + ss * .22, by]], P.c); ufLine(Hd, bx + ss * .08, by, bx + ss * .08, by - ss * 1.0, 1, P.d);
      const cy2 = by - ss * 1.1, rx = ss * .82, ry = ss * (m.big ? .72 : .6);
      ufEll(Hd, bx, cy2, rx, ry, P.f, 1, (x, y) => y <= cy2 + 1 && ufH(Math.round(x), Math.round(y)) >= cp); ufEll(Hd, bx - rx * .22, cy2 - ry * .12, rx * .66, ry * .6, P.e, .75, (x, y) => y <= cy2 && ufH(Math.round(x), Math.round(y)) >= cp);
      ufLine(Hd, bx - rx, cy2 + 1, bx + rx, cy2 + 1, 1, P.d);
      if(m.big){ for(let k = -4; k <= 4; k++){ const gx = bx + k * rx * .2, glow = (f + k * 2) % 6 < 3; ufLine(Hd, gx, cy2 + 2, gx + k * .3, cy2 + 2 + ss * .28, 1, glow ? P.b : P.a); } }
      for(let k = 0; k < (m.big ? 5 : 3); k++){ const dx = (ufH(m.i, k + 20) - .5) * rx * 1.2, dy = -ufH(m.i, k + 30) * ry * .8; if(ufH(m.i, k + 40) >= cp) ufDisc(Hd, bx + dx, cy2 + dy, m.big ? 2.2 : 1.3, P.c); }
      // esporas que suben de los sombreros con cada pulso
      pulses.forEach((p, n) => { const k = (q - p - m.dd * .05) / .12; if(k > 0 && k < 1) for(let s2 = 0; s2 < 3; s2++) ufPx(S, bx + (s2 - 1) * 3 + Math.sin(k * 8 + s2) * 2, cy2 - ry - k * R * .35, s2 & 1 ? P.b : P.e); });
    }
    // flores marchitas entre los hongos
    for(let i = 0; i < 7; i++){ const a = ufH(i, 51) * TAU, dd = .3 + .65 * ufH(i, 52), x = cx + Math.cos(a) * dd * R, y = cy + Math.sin(a) * dd * R * EY, g = ufEase(ufC((q - .1 - (1 - dd) * .12) / .08, 0, 1)); if(g <= 0 || burst > .3) continue;
      ufLine(S, x, y, x + 1, y - 7 * g, 1, P.a); ufPx(S, x + 2, y - 7 * g, P.e); ufPx(S, x + 1, y - 7 * g + 1, P.e); ufPx(S, x + 3, y - 7 * g + 1, P.d); }
    // los hongos revientan: lluvia de esporas
    if(burst > 0) for(let i = 0; i < 46; i++){ const u = (ufH(i, 61) + burst * 1.4) % 1, x = cx + (ufH(i, 62) - .5) * R * 1.9, y = cy - R * (.9 - u * 1.1) - 4; if(ufH(i, 63) > burst * .95) ufPx(S, x + Math.sin(u * 7 + i) * 2, y, i % 3 === 0 ? P.c : i % 3 === 1 ? P.b : P.e); }
  }});

/* ---------- ALAMBIQUE (morwen): un alambique de cobre y vidrio se ensambla; cada burbuja que revienta suelta un eco con rostro que sube ---------- */
ufDefForm('still', {N: 40, tall: 1.85, dur: 3800, gdur: 0, shake: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, as = i => ufEase(ufC((q - .02 - i * .035) / .1, 0, 1)), cool = ufC((q - .84) / .16, 0, 1), brk = ufC((q - .86) / .14, 0, 1);
    if(q < .16) ufEdgeMarks(S, o, 12, 'hex', P.b, 0, 1);
    const cxC = cx - R * .16, cyC = cy - R * .05, cw = R * .34, ch = R * .27, drop = i => (1 - as(i)) * -R * 1.0;
    // llama bajo el caldero
    if(as(0) > .5 && cool < .8) for(let i = -2; i <= 2; i++) UA.flame(Hd, cxC + i * cw * .3, cyC + ch + 2, 3.4, 4 + ((f + i * 3) % 4) + (cool * -3), f * .8 + i, P.e, P.b, P.c);
    // caldero: panza, aro, líquido hirviendo y patas
    const y0 = cyC + drop(0);
    ufPoly(Hd, [[cxC - cw * .7, y0 + ch * 1.08], [cxC - cw * .9, y0 + ch * 1.35], [cxC - cw * .6, y0 + ch * 1.3]], P.d); ufPoly(Hd, [[cxC + cw * .7, y0 + ch * 1.08], [cxC + cw * .9, y0 + ch * 1.35], [cxC + cw * .6, y0 + ch * 1.3]], P.d);
    ufEll(Hd, cxC, y0 + ch * .3, cw, ch, P.a); ufEll(Hd, cxC - cw * .25, y0 + ch * .1, cw * .55, ch * .55, P.d, .5); ufLine(Hd, cxC - cw * .6, y0 + ch * .65, cxC + cw * .5, y0 + ch * .75, 1, P.b);
    ufEll(Hd, cxC, y0 - ch * .55, cw * .95, ch * .28, P.b); ufEll(Hd, cxC, y0 - ch * .55, cw * .75, ch * .18, cool > .5 ? P.d : P.a);
    for(let i = 0; i < 4; i++){ const t = (q * 6 + i * .27) % 1; ufDisc(Hd, cxC + (ufH(i, 3) - .5) * cw * 1.1, y0 - ch * .62 - t * 2.5 * (1 - cool), 1.4, P.e); }
    // cuello y cabeza del alambique
    const yh = cy - R * .95 + drop(1), hr = R * .16;
    ufPoly(Hd, [[cxC - cw * .38, y0 - ch * .55], [cxC - cw * .16, yh + hr], [cxC + cw * .16, yh + hr], [cxC + cw * .38, y0 - ch * .55]], P.b); ufLine(Hd, cxC - cw * .12, y0 - ch * .6, cxC - cw * .08, yh + hr, 1, P.c);
    ufEll(Hd, cxC, yh, hr, hr * 1.1, P.b, 1, (x, y) => y <= yh + hr * .5); ufEll(Hd, cxC - hr * .3, yh - hr * .2, hr * .4, hr * .5, P.c, .5); ufRing(Hd, cxC, yh + hr * .6, hr * .9, 1, P.d, {rx: hr, ry: hr * .3});
    // tubo y serpentín de dos vueltas
    const sx = cx + R * .3, st = yh + hr * .1, sb = cy - R * .28 + drop(2);
    ufLine(Hd, cxC + hr, st, sx - R * .06, st + 2, 2, P.b); const n = 38; let px = sx, py = st + 3;
    for(let s = 1; s <= n; s++){ const u = s / n, x = sx + Math.sin(u * TAU * 2.5) * R * .13, y = st + 3 + (sb - st - 3) * u; if(brk > 0 && ufH(s, 91) < brk * 1.4 && s % 3 === 0){ px = x; py = y; continue; } ufLine(Hd, px, py, x, y, 2, P.b); if(s & 1) ufPx(Hd, x - 1, y - 1, P.c); px = x; py = y; }
    // matraz: vidrio con líquido de menta que sube con el tiempo
    const fx = sx, fy = cy - R * .02 + drop(3), fr = R * .17, fill = ufC((q - .18) / .6, 0, 1) * (1 - cool * .6);
    ufLine(Hd, px, py, fx, fy - fr * 1.5, 2, P.b);
    ufDisc(Hd, fx, fy, fr, P.d, .5); ufDisc(Hd, fx, fy, fr, P.c, .22); ufPoly(Hd, [[fx - fr * .3, fy - fr * .85], [fx - fr * .3, fy - fr * 1.5], [fx + fr * .3, fy - fr * 1.5], [fx + fr * .3, fy - fr * .85]], P.d, .6);
    ufDisc(Hd, fx, fy + fr * (1 - fill) * .8, fr * .88, P.e, 1, (x, y) => y >= fy + fr * .8 - fill * fr * 1.6); ufRing(Hd, fx, fy, fr, 1, P.b); ufPx(Hd, fx - fr * .5, fy - fr * .4, P.c);
    // burbujas que revientan y sueltan ecos (rostros translúcidos)
    for(let n2 = 0; n2 < 6; n2++){ const t0 = .2 + n2 * .1, k = (q - t0) / .3; if(k <= 0 || k >= 1) continue; const fx2 = cxC + (n2 % 3 - 1) * cw * .5 + Math.sin(k * 5 + n2) * 3, pk = ufC(k / .25, 0, 1), face = ufC((k - .22) / .78, 0, 1);
      if(k < .25){ const by2 = y0 - ch * .6 - pk * R * .35; ufRing(Hd, fx2, by2, 2.5 + pk * 2, 1, P.e); ufPx(Hd, fx2 - 1, by2 - 1, P.c); }
      else { const ex = fx2 + Math.sin(face * 6 + n2) * 3, ey = y0 - ch * .6 - R * .35 - face * R * 1.0, fw = 4 + R * .05, fh = fw * 1.3, a = 1 - face * .8;
        if(ufH(n2, f >> 1) < a + .25){ ufEll(S, ex, ey, fw, fh, P.e, .55 * a); ufRing(S, ex, ey, 1, 1, P.e, {rx: fw, ry: fh, dash: {n: 12, on: .6, ph: n2}}); ufPx(S, ex - fw * .4, ey - fh * .2, P.c); ufPx(S, ex + fw * .4, ey - fh * .2, P.c); ufLine(S, ex - 1, ey + fh * .45, ex + 1, ey + fh * .45, 1, P.c); ufPx(S, ex, ey + fh * .6, P.c); }
        if(face < .25) for(let s = 0; s < 6; s++){ const aa = s * 1.0472; ufPx(S, ex + Math.cos(aa) * (3 + face * 30), ey + Math.sin(aa) * (3 + face * 30), P.b); } } }
    // vapor ciruela que sale del cuello al final
    if(cool > 0) for(let i = 0; i < 8; i++){ const u = (ufH(i, 5) + cool) % 1; ufPx(S, cxC + (ufH(i, 6) - .5) * 8, yh - u * R * .6, P.d); }
  }});

/* ---------- LÁGRIMAS (myla): tres lágrimas gigantes caen, salpican yogur en corona y dejan charcos de bordes lobulados que se evaporan ---------- */
ufDefForm('tears', {N: 36, tall: 1.9, dur: 3400, gdur: 0, shake: 6,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, EY = .55, evap = ufC((q - .76) / .24, 0, 1);
    const fall = [.2, .38, .56], land = [[-.46, .1], [.42, -.12], [.02, .3]].map(([x, y]) => [cx + x * R, cy + y * R * EY / .55 * .75]);
    const tear = (x, y, s, c1, c2, c3) => { ufDisc(Hd, x, y, s, c1); ufPoly(Hd, [[x - s * .92, y - s * .25], [x, y - s * 2.5], [x + s * .92, y - s * .25]], c1); ufDisc(Hd, x - s * .3, y + s * .1, s * .55, c2); ufPx(Hd, x - s * .35, y - s * .15, c3); ufPx(Hd, x - s * .35, y - s * .15 - 1, c3); };
    // anticipación: una burbuja de llanto se hincha con tres lágrimas dentro
    if(q < .2){ const k = ufC(q / .16, 0, 1), bc = [cx, cy - R * 1.35], br = R * .3 * k; if(br > 2){ ufRing(Hd, bc[0], bc[1], br, 1.4, P.b); ufDisc(S, bc[0], bc[1], br, P.b, .2); ufPx(Hd, bc[0] - br * .5, bc[1] - br * .5, P.c);
        for(let i = 0; i < 3; i++) tear(bc[0] + (i - 1) * br * .55, bc[1] + 1 + (i & 1) * br * .15, Math.max(1.4, br * .2) * (.5 + k * .5), P.e, P.c, P.c); }
      ufEdgeMarks(S, o, 12, 'dot', P.a, .1); return; }
    // charcos de bordes lobulados que se ensanchan
    land.forEach((l, i) => { const k = ufEase(ufC((q - fall[i] - .07) / .12, 0, 1)); if(k <= 0) return; const grow = k * (1 + (q - fall[i]) * .5), rmax = R * (.3 + .05 * i) * grow * (1 - evap * .5), ph = i * 1.3 + q * 4 + f * .02;
      const pts = []; for(let s = 0; s < 42; s++){ const a = s / 42 * TAU; pts.push([l[0] + Math.cos(a) * rmax * (1 + .17 * Math.sin(7 * a + ph)), l[1] + Math.sin(a) * rmax * .6 * (1 + .17 * Math.sin(7 * a + ph))]); }
      ufPoly(Hd, pts, P.a, 1, ufKeep(evap, i)); ufPoly(S, pts.map(p => [l[0] + (p[0] - l[0]) * .62, l[1] + (p[1] - l[1]) * .62 - 1]), P.b, .5, ufKeep(evap, i));
      for(let b = 0; b < 4; b++){ const a = ufH(i * 9 + b, 2) * TAU, d = rmax * .55 * ufH(i * 9 + b, 3), bx = l[0] + Math.cos(a) * d, by = l[1] + Math.sin(a) * d * .6 - ((q * 30 + b * 5) % 6) * (evap > 0 ? 1.5 : .3); if(ufH(b, i + 4) >= evap) { ufRing(Hd, bx, by, 1.8, 1, P.c); } } });
    // lágrimas gigantes que caen (con sombra que crece en el punto de caída)
    fall.forEach((t, i) => { const k = ufC((q - t) / .08, 0, 1), l = land[i]; if(q < t - .1) return; const sk = ufC((q - t + .1) / .1, 0, 1);
      if(k < 1){ const ty = ufLerp(cy - R * 2.2, l[1] - 2, k * k); ufEll(S, l[0], l[1], 3 + sk * 7, 1.5 + sk * 3, P.d, .6); tear(l[0], ty, R * .13 + 1, P.e, P.c, P.c); }
      // corona de salpicadura: gotas en parábola en todas direcciones
      const sp = ufC((q - t - .08) / .22, 0, 1); if(sp > 0 && sp < 1) for(let s = 0; s < 11; s++){ const a = s * TAU / 11 + .2, v = R * (.28 + .22 * ufH(s, i + 5)), x = l[0] + Math.cos(a) * v * sp, y = l[1] + Math.sin(a) * v * sp * .5 - Math.sin(sp * 3.14) * R * (.35 + .25 * ufH(s, i + 9)); ufDisc(Hd, x, y, 1.6 - sp * .6, s & 1 ? P.b : P.c); } });
    // llovizna de lágrimas pequeñas
    if(q > .3 && q < .8) for(let i = 0; i < 7; i++){ const u = (ufH(i, 5) + q * 2.6) % 1, x = cx + (ufH(i, 6) - .5) * R * 1.8, y = cy - R * 1.6 + u * R * 1.6; tear(x, y, 1.4, P.e, P.c, P.c); }
    // burbujitas de yogur que suben al evaporarse
    if(evap > 0) for(let i = 0; i < 14; i++){ const u = (ufH(i, 15) + evap) % 1, x = cx + (ufH(i, 16) - .5) * R * 1.4, y = cy - u * R * .9; if(ufH(i, 17) > evap) ufRing(Hd, x, y, 1.6, 1, P.b); }
  }});

/* ---------- ABISMO (nigromante): las almas del ejército entran en arcos, una hélice de huesos se cierra, estalla una columna de fuego verde con cráneo cornudo ---------- */
ufDefForm('abyss', {N: 40, tall: 2.0, dur: 3800, gdur: 0, shake: 9,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, EY = .55, abs = ufC(q / .2, 0, 1), tr = ufC((q - .18) / .2, 0, 1), col = ufEase(ufC((q - .36) / .1, 0, 1)), collapse = ufC((q - .8) / .2, 0, 1);
    const hub = [cx, cy - R * .15];
    // almas: ocho arcos que llegan desde el borde real hacia el héroe (y al final salen de vuelta al ejército)
    const streams = 8, dirOut = q > .8;
    if(q < .38 || dirOut) for(let s = 0; s < streams; s++){
      const a = s * TAU / streams + .2, sx = cx + Math.cos(a) * R * .98, sy = cy + Math.sin(a) * R * .98 * EY, mx = (sx + hub[0]) / 2 + Math.cos(a + 1.5708) * R * .35, my = (sy + hub[1]) / 2 + Math.sin(a + 1.5708) * R * .2 - R * .1;
      for(let k = 0; k < 4; k++){
        let u = dirOut ? ufC((q - .8) / .2 * 1.2 - k * .09, 0, 1) : ufC(abs * 1.3 - k * .13 - (s & 1) * .05, 0, 1) + 0; if(dirOut) u = 1 - u; if(!dirOut && (abs <= 0 || u <= 0 || u >= 1)) { if(!(u >= 1 && tr < 1 && q < .34)) continue; u = 1; if(tr > .5) continue; }
        if(dirOut && (u <= 0 || u >= 1)) continue;
        const bx = (1 - u) * (1 - u) * sx + 2 * u * (1 - u) * mx + u * u * hub[0], by = (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * my + u * u * hub[1];
        for(let t = 1; t <= 4; t++){ const v = ufC(u + (dirOut ? -1 : 1) * 0, 0, 1) - t * .03 * (dirOut ? -1 : 1), tx = (1 - v) * (1 - v) * sx + 2 * v * (1 - v) * mx + v * v * hub[0], ty = (1 - v) * (1 - v) * sy + 2 * v * (1 - v) * my + v * v * hub[1]; ufPx(S, tx, ty, t < 3 ? P.a : P.d); }
        ufDisc(Hd, bx, by, 1.9, k & 1 ? P.b : P.e); ufPx(Hd, bx - 1, by - 1, P.c);
      }
      if(q < .14){ const k2 = ufC(q / .14, 0, 1); ufLine(Hd, sx - 3, sy + k2 * 3, sx + 3, sy - k2 * 2, 2, P.c); ufDisc(Hd, sx - 3, sy + k2 * 3, 1.5, P.c); ufDisc(Hd, sx + 3, sy - k2 * 2, 1.5, P.c); }       // hueso que se deshace
    }
    // hélice de huesos que se cierra sobre el eje
    if(tr > 0 && col < 1){ const hh = R * 1.35 * tr * (1 - col * .3), rad = R * (.5 - .36 * tr) * (1 - col), n = 26;
      let p1 = null, p2 = null; for(let s = 0; s <= n; s++){ const u = s / n, y = cy - hh * u, ph = u * 9 - q * 16, x1 = hub[0] + Math.sin(ph) * rad * (1 - u * .35), x2 = hub[0] - Math.sin(ph) * rad * (1 - u * .35), z = Math.cos(ph);
        if(p1){ ufLine(Hd, p1[0], p1[1], x1, y, 2, z > 0 ? P.c : P.d); ufLine(Hd, p2[0], p2[1], x2, y, 2, z > 0 ? P.d : P.c); } if(s % 3 === 0) ufLine(S, x1, y, x2, y, 1, P.b); p1 = [x1, y]; p2 = [x2, y]; } }
    // estallido: destello en estrella al nacer la columna
    const bk = ufC((q - .36) / .1, 0, 1); if(bk > 0 && bk < 1) for(let i = 0; i < 10; i++){ const a = i * .6283, ln = R * .6 * Math.sin(bk * 3.14) * (i & 1 ? .6 : 1); ufLine(Hd, hub[0], hub[1] - R * .2, hub[0] + Math.cos(a) * ln, hub[1] - R * .2 + Math.sin(a) * ln * .8, i & 1 ? 1 : 2, i & 1 ? P.b : P.c); }
    // columna de fuego verde (labios que lamen) y cráneo cornudo en la cima
    if(col > 0){ const H = R * 1.25 * col * (1 - collapse * .85), base = cy, wBase = R * .27, y = k => base - H * k;
      for(let layer = 0; layer < 3; layer++){ const c = layer === 0 ? P.d : layer === 1 ? P.a : P.b, sc = [1, .72, .4][layer], L0 = [], R0 = [];
        for(let s = 0; s <= 16; s++){ const u = s / 16, w = wBase * sc * (Math.pow(1 - u, .55) * (1 + .22 * Math.sin(u * 14 - f * .7 + layer * 2)) + .12), sw = Math.sin(u * 5 - f * .4) * R * .05 * u; L0.push([hub[0] - w + sw, y(u * (1 - layer * .06))]); R0.push([hub[0] + w + sw, y(u * (1 - layer * .06))]); }
        ufPoly(Hd, L0.concat(R0.slice().reverse()), c, 1, ufKeep(collapse * .8, layer)); }
      // lenguas sueltas y brasas
      for(let i = 0; i < 8; i++){ const u = (ufH(i, 3) + q * 1.7) % 1, x = hub[0] + (ufH(i, 4) - .5) * wBase * 2.4 * (1 - u * .4), yy = base - u * H * 1.05; if(ufH(i, 5) > collapse) { ufPx(S, x, yy, i & 1 ? P.b : P.e); ufPx(S, x, yy - 1, P.a); } }
      // cráneo con cuernos
      const sk = [hub[0], base - H * .95], sw2 = R * .15, kk = ufC((col - .5) / .5, 0, 1) * (1 - collapse);
      if(kk > .1){ const pk = ufKeep(collapse); ufEll(Hd, sk[0], sk[1], sw2 * kk, sw2 * .9 * kk, P.c, 1, pk); ufPoly(Hd, [[sk[0] - sw2 * .6 * kk, sk[1] + sw2 * .5 * kk], [sk[0] + sw2 * .6 * kk, sk[1] + sw2 * .5 * kk], [sk[0] + sw2 * .4 * kk, sk[1] + sw2 * 1.15 * kk], [sk[0] - sw2 * .4 * kk, sk[1] + sw2 * 1.15 * kk]], P.c, 1, pk);
        ufPoly(Hd, [[sk[0] - sw2 * .55 * kk, sk[1] - sw2 * .1 * kk], [sk[0] - sw2 * .15 * kk, sk[1] + sw2 * .15 * kk], [sk[0] - sw2 * .5 * kk, sk[1] + sw2 * .45 * kk]], P.o); ufPoly(Hd, [[sk[0] + sw2 * .55 * kk, sk[1] - sw2 * .1 * kk], [sk[0] + sw2 * .15 * kk, sk[1] + sw2 * .15 * kk], [sk[0] + sw2 * .5 * kk, sk[1] + sw2 * .45 * kk]], P.o);
        ufPx(Hd, sk[0] - sw2 * .38 * kk, sk[1] + sw2 * .1 * kk, P.e); ufPx(Hd, sk[0] + sw2 * .38 * kk, sk[1] + sw2 * .1 * kk, P.e);
        for(const sg of [-1, 1]){ let px = sk[0] + sg * sw2 * .7 * kk, py = sk[1] - sw2 * .4 * kk; for(let s = 1; s <= 6; s++){ const u = s / 6, x = sk[0] + sg * (sw2 * .7 + sw2 * 1.3 * Math.sin(u * 1.4)) * kk, yy = sk[1] - sw2 * (.4 + 1.5 * u) * kk; ufLine(Hd, px, py, x, yy, 2 - (u > .6 ? 1 : 0), P.c); px = x; py = yy; } } }
    }
  }});
