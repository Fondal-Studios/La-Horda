'use strict';
/* js/champions/ult-forms/forms-b2.js — formas de definitiva, segunda tanda (parte 2): Segador (calavera de almas), Sira (mapa que se despliega),
   Solciju (botella y lago de vino), Tibor (panal con goteo de miel). Usa las ayudas de forms-b1.js (ubBolt, ubPath, ubCloud, marcas nuevas de UF_MARK).
   Solo visual: nada de azar (hash fijo), mecánica intacta. */

/* ---------- SEGADOR DE ALMAS: un torbellino de almas pálidas sube en espiral y arma una calavera enorme sobre el héroe; llamas rojas abajo y una guadaña espectral detrás ---------- */
const UB_SKULL = ['...bbbbbbb...', '..bbbbbbbbb..', '.bbbbbbbbbbb.', '.bbbbbbbbbbb.', '.brrrbbbrrrb.', '.brrrbbbrrrb.', '.brrrbbbrrrb.', '.bbbbbobbbbb.', '..bbbbbbbbb..', '..bobobobob..', '...bbbbbbb...'];
ufDefForm('reaper', {N: 34, tall: 2.1, dur: 3400, gdur: 3800, shake: 9, pad: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 3400, out = ufC((T - 2800) / 600, 0, 1);
    const sc = Math.max(1, Math.floor(R * 1.5 / 13)), sx = cx, sy = cy - R * 1.28;
    if(T < 650) ufEdgeMarks(S, o, 12, 'skull', P.b, .2);
    // guadaña espectral detrás: mango en diagonal y hoja curva arriba
    const sk = ufC((T - 500) / 500, 0, 1) * (1 - out);
    if(sk > 0){
      const x0 = cx + R * .2, y0 = cy + R * .2, x1 = cx + R * .62, y1 = cy - R * 1.45; ufLine(S, x0, y0, x1, y1, 3, P.d, .9 * sk + .05); ufLine(S, x0 - 1, y0, x1 - 1, y1, 1, P.a, sk);
      for(let i = 0; i <= 16; i++){ const u = i / 16, bx = x1 + R * .36 * Math.sin(u * 1.6) - R * .06, by = y1 + R * .34 * (1 - Math.cos(u * 1.6)) - R * .05, th = Math.max(1, 5 * (1 - u * .85));
        ufDisc(S, bx, by, th / 2, P.a, .9 * sk + .05); if(i > 1) ufPx(S, bx - th * .4, by - th * .6, P.b); }
    }
    // llamas rojas del aura, a ras de suelo, alrededor del héroe
    const fl = ufC((T - 300) / 400, 0, 1) * (1 - out);
    if(fl > 0) for(let i = 0; i < 12; i++){
      const a = i * .5236 + Math.sin(T / 700) * .1, bx = cx + Math.cos(a) * R * .62, by = cy + Math.sin(a) * R * .62 * .5, hh = R * (.3 + .22 * Math.sin(T / 120 + i * 1.7)) * fl, ww = Math.max(2, R * .07);
      ufPoly(Hd, [[bx - ww, by], [bx - ww * .3, by - hh * .55], [bx + ww * .2, by - hh], [bx + ww * .8, by - hh * .5], [bx + ww, by]], P.a); ufPoly(Hd, [[bx - ww * .4, by], [bx, by - hh * .55], [bx + ww * .5, by]], P.b);
    }
    // almas en espiral que suben hacia la calavera
    const soul = (i) => {
      const u = ((T / 1100) + ufH(i, 5)) % 1, a = ufH(i, 6) * 6.28 + u * 5.2 + T * .004, rr = R * (1 - u) * .9 + 2, x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * .45 - u * R * 1.28;
      const tx = cx + Math.cos(a - .5) * rr * 1.02, ty = cy + Math.sin(a - .5) * rr * 1.02 * .45 - u * R * 1.28 + 3;
      ufLine(S, tx, ty, x, y, 1, P.b, .8); ufDisc(Hd, x, y, 1.4, P.c); ufPx(Hd, x, y - 1, P.e);
    };
    const em = ufC(T / 400, 0, 1) * (1 - out); if(em > 0) for(let i = 0; i < Math.round(18 * em); i++) soul(i);
    // calavera
    const sa = ufC((T - 560) / 480, 0, 1) * (1 - out), jaw = Math.sin(T / 160) > .5 ? 1 : 0;
    if(sa > 0){
      const bob = Math.sin(T / 300) * 1.5;
      ufBmp(Hd, UB_SKULL, {b: P.c, r: P.a, o: P.o}, sx, sy + bob, {sc, keep: (x, y) => ufDith(x, y, sa) || sa > .97});
      if(sa > .9){ const ex = sx - 3 * sc, ey = sy + bob - sc, ex2 = sx + 3.5 * sc; ufPx(Hd, ex, ey, P.b); ufPx(Hd, ex2, ey, P.b); }
      if(jaw) for(let k = 0; k < 4; k++) ufPx(Hd, sx - 3 * sc + k * 2 * sc, sy + bob + 4.5 * sc + sc, P.o);
    }
    // pulso de furia en el impacto
    const pu = T > 560 && T < 820 ? 1 - (T - 560) / 260 : 0;
    if(pu > 0) for(let i = 0; i < 10; i++){ const a = i * .6283 + .3; ufLine(Hd, sx + Math.cos(a) * R * .55, sy + Math.sin(a) * R * .45, sx + Math.cos(a) * R * (.55 + .5 * pu), sy + Math.sin(a) * R * (.45 + .38 * pu), 1, i & 1 ? P.b : P.c); }
    // las almas caen al final
    if(out > 0) for(let i = 0; i < 18; i++){ const a = ufH(i, 8) * 6.28, d = ufH(i, 9) * R * .7, y0 = sy + ufH(i, 10) * R * .3, y = Math.min(cy, y0 + out * out * R * 1.4); if(ufH(i, 11) > out * .85){ ufPx(S, cx + Math.cos(a) * d, y, i & 1 ? P.c : P.b); ufPx(S, cx + Math.cos(a) * d, y - 1, P.b); } }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 3800, k = ufEase(ufC((T - 250) / 450, 0, 1)), fade = ufC((T - 3000) / 800, 0, 1);
    ufEll(S, cx, cy, R * .78 * k, R * .4 * k, P.d, .3 * (1 - fade));
    for(let i = 0; i < 14; i++){ const a = i * .4488, r1 = R * .5 * k, r2 = R * (.7 + .26 * (i & 1)) * k; if(ufH(i, 12) > fade) ufLine(S, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * .5, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2 * .5, 1, P.a); }
  }});

/* ---------- ATLAS: un pergamino de mapa se desenrolla sobre el suelo con rosa de los vientos, ruta punteada y cruces; tres pulsos de luz azul recorren la ruta y se pliega ---------- */
ufDefForm('atlas', {N: 30, tall: 1.15, dur: 2900, gdur: 3500, shake: 3, pad: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 2900, PUL = [800, 1600, 2400];
    const unroll = ufEase(ufC((T - 40) / 520, 0, 1)), fold = ufC((T - 2540) / 360, 0, 1), halfW = R * .95 * unroll * (1 - fold * .92), halfH = R * .5 * (1 - fold * .15), sk = R * .1;
    const rw = (x, y) => [cx + x * halfW, cy + y * halfH];
    if(T < 560) ufEdgeMarks(S, o, 8, 'cross', P.e, .39);
    if(halfW > 3){
      const c1 = [cx - halfW + sk * .5, cy - halfH], c2 = [cx + halfW + sk * .5, cy - halfH], c3 = [cx + halfW - sk * .5, cy + halfH], c4 = [cx - halfW - sk * .5, cy + halfH];
      ubPath(Hd, [c1, c2, c3, c4, c1], 1, P.b); ubPath(Hd, [[c1[0] + 1, c1[1] + 1], [c2[0] - 1, c2[1] + 1], [c3[0] - 1, c3[1] - 1], [c4[0] + 1, c4[1] - 1], [c1[0] + 1, c1[1] + 1]], 1, P.a);
      // rollo en el borde de lo desenrollado
      if(unroll < .98){ const rx = cx - halfW + halfW * 2 * unroll, rr = Math.max(2, R * .12); ufEll(Hd, rx, cy, rr * .7, halfH * 1.02, P.a); ufLine(Hd, rx - rr * .2, cy - halfH, rx - rr * .2, cy + halfH, 1, P.d); ufLine(Hd, rx + rr * .3, cy - halfH, rx + rr * .3, cy + halfH, 1, P.b); }
      if(fold > 0) for(let i = 1; i < 6; i++){ const x = cx - halfW + halfW * 2 * i / 6; ufLine(Hd, x, cy - halfH, x + (i & 1 ? 2 : -2), cy + halfH, 1, P.d); }
      // rosa de los vientos
      if(unroll > .6 && fold < .5){
        const rr = R * .27, a0 = T * .0004, st = []; for(let i = 0; i < 16; i++){ const a = a0 + i * .3927 - 1.5708, r2 = i & 1 ? rr * .35 : rr * (i % 4 === 0 ? 1 : .68); st.push([cx + Math.cos(a) * r2, cy + Math.sin(a) * r2 * .55]); }
        ufPoly(Hd, st, P.b); ufPoly(Hd, st.map(p => [cx + (p[0] - cx) * .5, cy + (p[1] - cy) * .5]), P.c);
        for(const [dx, dy] of [[0, 0], [0, -1], [-1, 0], [1, 0]]) ufPx(Hd, cx + dx, cy - rr * .55 - 3 + dy, P.e);
      }
      // ruta punteada con cruces rojas
      const route = [[-.78, .22], [-.4, -.2], [-.05, .28], [.32, -.22], [.74, .12]].map(p => rw(p[0], p[1]));
      const show = ufC((T - 330) / 420, 0, 1); let tot = 0; const lens = []; for(let i = 1; i < route.length; i++){ lens.push(Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1])); tot += lens[i - 1]; }
      if(show > 0 && fold < .5){
        let acc = 0;
        for(let i = 1; i < route.length; i++){ const a0 = acc / tot, a1 = (acc + lens[i - 1]) / tot; acc += lens[i - 1]; if(show < a0) break; const k = ufC((show - a0) / (a1 - a0), 0, 1);
          ufLine(Hd, route[i - 1][0], route[i - 1][1], ufLerp(route[i - 1][0], route[i][0], k), ufLerp(route[i - 1][1], route[i][1], k), 1, P.b, .55); }
        for(let i = 0; i < route.length; i++) if(show >= i / (route.length - 1) - .01){ const p = route[i], z = i === route.length - 1 ? 3 : 2; ufLine(Hd, p[0] - z, p[1] - z, p[0] + z, p[1] + z, 1, P.e); ufLine(Hd, p[0] - z, p[1] + z, p[0] + z, p[1] - z, 1, P.e); }
        if(show > .8 && R > 30) for(const [mx, my] of [[-.6, -.35], [.55, .35], [.15, -.42]]){ const p = rw(mx, my); ufPx(Hd, p[0], p[1] - 3, P.b); ufPx(Hd, p[0] - 1, p[1] - 2, P.b); ufPx(Hd, p[0] + 1, p[1] - 2, P.b); ufPx(Hd, p[0] - 2, p[1] - 1, P.b); ufPx(Hd, p[0] + 2, p[1] - 1, P.b); }
        // pulsos de luz: un tramo brillante recorre la ruta de punta a punta
        for(const t0 of PUL){
          const k = (T - t0) / 460; if(k < 0 || k > 1.3) continue; const hd = ufC(k, 0, 1) * tot, tl = Math.max(0, hd - tot * .28); let acc2 = 0;
          for(let i = 1; i < route.length; i++){ const s0 = acc2, s1 = acc2 + lens[i - 1]; acc2 = s1; const u0 = ufC((tl - s0) / (s1 - s0), 0, 1), u1 = ufC((hd - s0) / (s1 - s0), 0, 1); if(u1 <= u0) continue;
            ufLine(Hd, ufLerp(route[i - 1][0], route[i][0], u0), ufLerp(route[i - 1][1], route[i][1], u0), ufLerp(route[i - 1][0], route[i][0], u1), ufLerp(route[i - 1][1], route[i][1], u1), 2, P.c); }
          if(k > .7) for(let i = 0; i < route.length; i++) if(((i + f) & 1) === 0) ufPx(Hd, route[i][0] + (ufH(i, 3) - .5) * 8, route[i][1] - 3 - (k - .7) * 10, P.c);
        }
      }
    }
    // retazos de papel al plegarse
    if(fold > 0) for(let i = 0; i < 12; i++){ const a = ufH(i, 33) * 6.28, u = fold, x = cx + Math.cos(a) * R * .8 * u, y = cy + Math.sin(a) * R * .3 * u - Math.sin(u * 3.14) * R * .5; if(ufH(i, 34) > u * .5){ ufPx(S, x, y, i & 1 ? P.a : P.d); ufPx(S, x + 1, y, P.a); } }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 3500, unroll = ufEase(ufC((T - 40) / 520, 0, 1)), fold = ufC((T - 2540) / 360, 0, 1), fade = ufC((T - 2900) / 600, 0, 1), halfW = R * .95 * unroll * (1 - fold * .92), halfH = R * .5 * (1 - fold * .15), sk = R * .1;
    if(halfW < 3) return;
    const poly = [[cx - halfW + sk * .5, cy - halfH], [cx + halfW + sk * .5, cy - halfH], [cx + halfW - sk * .5, cy + halfH], [cx - halfW - sk * .5, cy + halfH]];
    ufPoly(S, poly.map(p => [p[0] + 2, p[1] + 3]), P.o, .35 * (1 - fade));
    ufPoly(S, poly, P.a, 1, ufKeep(fade * .95)); ufPoly(S, [poly[3], poly[2], [poly[2][0], poly[2][1] - 3], [poly[3][0], poly[3][1] - 3]], P.d, 1, ufKeep(fade));
    for(let i = 1; i < 6; i++){ const x = cx - halfW + halfW * 2 * i / 6; ufLine(S, x, cy - halfH + 1, x, cy + halfH - 1, 1, P.d, .3); }
    for(let i = 1; i < 4; i++){ const y = cy - halfH + halfH * 2 * i / 4; ufLine(S, cx - halfW + 2, y, cx + halfW - 2, y, 1, P.d, .25); }
  }});

/* ---------- RESERVA: una botella gigante se vuelca y llena un lago de vino con espiral de copa, uvas que saltan y una corona de salpicadura por cada pulso ---------- */
const UB_BOTTLE = ['...oo...', '..oddo..', '..odco..', '..oddo..', '.oddddo.', 'oddbdddo', 'oddbdddo', 'odccccdo', 'odccccdo', 'oddbdddo', 'oddbdddo', 'oddddddo', '.oooooo.'];
ufDefForm('cellar', {N: 32, tall: 1.8, dur: 4200, gdur: 5000, shake: 5, pad: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 4200, PUL = [900, 1900, 2900, 3800], BX = cx - R * .7, BY = cy - R * 1.5;
    if(T < 700) ufEdgeMarks(S, o, 10, 'drop', P.b, .1);
    // botella: se inclina y vierte
    const tilt = ufEase(ufC(T / 520, 0, 1)), away = ufC((T - 3500) / 500, 0, 1), sc = Math.max(1, Math.round(R / 18));
    if(away < 1){
      const ang = ufLerp(0, -2.0, tilt), ca = Math.cos(ang), sa = Math.sin(ang), bx = BX - away * R * .6, by = BY - away * R * .6;
      for(let j = 0; j < UB_BOTTLE.length; j++) for(let i = 0; i < 8; i++){
        const ch = UB_BOTTLE[j][i]; if(ch === '.') continue; const lx = (i - 3.5) * sc, ly = (j - 2) * sc, px = bx + lx * ca - ly * sa, py = by + lx * sa + ly * ca;
        ufDisc(Hd, px, py, sc * .75, ch === 'o' ? P.o : ch === 'd' ? P.d : ch === 'b' ? P.b : P.c);
      }
      // chorro desde el pico
      const nx = bx - (-2.6 * sc) * sa, ny = by + (-2.6 * sc) * ca;
      if(tilt > .5){ const tx = cx - R * .08, ty = cy - R * .05; for(let i = 0; i < 26; i++){ const u = i / 26, x = ufLerp(nx, tx, u), y = ufLerp(ny, ty, Math.pow(u, 1.8)) - Math.sin(u * 3.14) * R * .05; if(ufH(i, 7) < .92){ ufDisc(Hd, x, y, 1.6, P.a); ufPx(Hd, x - 1, y, P.b); } } }
    }
    // pulsos: corona de salpicadura y uvas que saltan
    PUL.forEach((t0, k) => {
      const d = (T - t0) / 700; if(d < 0 || d > 1) return;
      const cr = Math.sin(d * 3.14);
      for(let i = 0; i < 12; i++){ const a = -3.14 + i * .2856, rr = R * .5 * Math.min(1, d * 1.6), h = R * .45 * cr * (.5 + .5 * Math.sin(i * 2.1 + k)), x = cx + Math.cos(a) * rr, y0 = cy + Math.sin(a) * rr * .3, y = y0 - h * 1.2; ufLine(Hd, x, y0, x, y, 1, i & 1 ? P.b : P.c); ufDisc(Hd, x, y, 1.3, P.c); }
      for(let g = 0; g < 3; g++){ const a = g * 2.1 + k * 1.3, ex = cx + Math.cos(a) * R * .55, up = Math.sin(d * 3.14) * R * .7 * (.7 + g * .15), gx = cx + (ex - cx) * d, gy = cy + Math.sin(a) * R * .22 - up;
        ufDisc(Hd, gx, gy, 2.3, P.d); ufDisc(Hd, gx + 2, gy + 1, 2.1, P.d); ufDisc(Hd, gx - 2, gy + 1.5, 2.1, P.a); ufPx(Hd, gx - 1, gy - 1, P.c); ufPx(Hd, gx + 1, gy - 3, P.e); }
    });
    // luna dorada reflejada en el lago
    const lake = ufEase(ufC((T - 380) / 700, 0, 1)) * (1 - ufC((T - 3900) / 300, 0, 1));
    if(lake > .3){ const mx = cx + R * .12, my = cy - R * .02; ufDisc(Hd, mx, my, R * .16, P.e); ufDisc(Hd, mx + R * .06, my - R * .02, R * .13, P.a); }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, S = L.soft, T = q * 5000, lake = ufEase(ufC((T - 380) / 700, 0, 1)), fade = ufC((T - 4000) / 1000, 0, 1), kp = ufKeep(fade), PUL = [900, 1900, 2900, 3800];
    if(lake <= 0) return;
    // lago irregular con borde de copa en espiral
    const blob = rr => { const pts = []; for(let i = 0; i < 28; i++){ const a = i * .2244; pts.push([cx + Math.cos(a) * rr * (1 + .09 * Math.sin(a * 3 + 1) + .05 * Math.sin(a * 7)) * lake, cy + Math.sin(a) * rr * .5 * (1 + .09 * Math.sin(a * 3 + 1)) * lake]); } return pts; };
    ufPoly(S, blob(R * .98), P.d, 1, kp); ufPoly(S, blob(R * .86), P.a, 1, kp); ufPoly(S, blob(R * .5), P.b, .6, kp);
    for(let i = 0; i < 40; i++){ const t = i / 40 * 9.4 + T * .0015, rr = R * (.1 + .6 * i / 40) * lake; ufPx(S, cx + Math.cos(t) * rr, cy + Math.sin(t) * rr * .5, P.b); }
    PUL.forEach(t0 => { const d = (T - t0) / 800; if(d > 0 && d < 1){ const rr = R * (.2 + .78 * d) * lake; ufRing(S, cx, cy, rr, 1, P.c, {rx: rr, ry: rr * .5, keep: ufKeep(d)}); } });
    for(let i = 0; i < 6; i++){ const a = ufH(i, 5) * 6.28 + T * .0006, rr = R * (.3 + .4 * ufH(i, 6)), gx = cx + Math.cos(a) * rr, gy = cy + Math.sin(a) * rr * .45; if(kp(i, 3)){ ufDisc(S, gx, gy, 1.6, P.o); ufPx(S, gx - 1, gy - 1, P.b); } }
  }});
