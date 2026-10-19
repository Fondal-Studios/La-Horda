'use strict';
/* js/champions/ult-forms/forms-1.js — formas de definitiva (parte 1): columna, espiral, cadena, cuchillas cruzadas, meteoro con cráter,
   ola frontal, cúpula y cordillera. Cada paint(L, o) pinta UN cuadro: L.soft (debajo, sin contorno, para tramados) y L.hard (arriba, con
   contorno de 1 px). o = {R (radio REAL en px), cx, cy, P (colores), ph {ant, hit, post}, q, f, N, key}. Solo visual. */

/* ---------- COLUMNA: catedral de columnas de luz que sube desde el suelo y se desgasta por arriba ---------- */
ufDefForm('column', {N: 22, tall: 1.95, dur: 1700, gdur: 2300, shake: 5,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    ufEdgeMarks(ph.q < .2 ? S : S, o, 12, 'brack', P.b, 0, 1);       // anticipación: corchetes sobre el radio real
    if(q < .2){ for(const dx of [0, -.5, .5]) for(let y = 0; y < 18 * ph.ant; y += 3) ufPx(S, cx + dx * R, cy - y, P.c); return; }
    const cols = [[0, .3, 1.75, 0], [-.52, .17, 1.12, .035], [.52, .17, 1.12, .035], [-.88, .1, .62, .07], [.88, .1, .62, .07]], erode = ufC((q - .55) / .45, 0, 1);
    // rayos de luz desde la cima de la columna central
    const topC = cy - cols[0][2] * R * ufEase(ufC((q - .18) / .14, 0, 1)) * (1 - ufIn(erode));
    if(q > .26 && erode < .9) ufPoly(S, [[cx - 2, topC + 4], [cx + 2, topC + 4], [cx + R * .95, cy], [cx - R * .95, cy]], P.b, .16 * (1 - erode));
    for(const [dx, wr, hr, dl] of cols){
      const g = ufEase(ufC((q - .18 - dl) / .14, 0, 1)), h = hr * R * g * (1 - ufIn(erode)), x = cx + dx * R, w = Math.max(2, wr * R);
      if(h < 3) continue;
      const top = cy - h, tip = Math.min(h * .4, w * 1.4);
      ufEll(S, x, cy, w * 1.7, w * .5, P.d, .5); ufRing(S, x, cy, 1, 1, P.a, {rx: w * 1.7, ry: w * .5});
      ufPoly(Hd, [[x - w / 2, cy], [x - w / 2, top + tip], [x, top], [x + w / 2, top + tip], [x + w / 2, cy]], P.a);
      ufPoly(Hd, [[x - w * .3, cy - 1], [x - w * .3, top + tip + 2], [x, top + 3], [x + w * .3, top + tip + 2], [x + w * .3, cy - 1]], P.b);
      ufPoly(Hd, [[x - w * .1, cy - 2], [x - w * .1, top + tip + 5], [x, top + 6], [x + w * .1, top + tip + 5], [x + w * .1, cy - 2]], P.c);
      for(let y = cy - 2 - ((f * 3) % 8); y > top + tip; y -= 8) ufLine(Hd, x - w * .3, y, x + w * .3, y, 1, P.a);   // bandas que suben
      if(erode > 0) for(let i = 0; i < 6; i++){ const yy = top - 2 - i * 3 - erode * 14, xx = x + (ufH(i, f) - .5) * w * 1.4; ufPx(S, xx, yy, P.c); }
    }
    for(let i = 0; i < 18; i++){ const u = (ufH(i, 1) + q * 2.2) % 1, xx = cx + (ufH(i, 2) - .5) * R * 1.9, hh = (1 - Math.abs(xx - cx) / (R * 1.1)) * R * 1.4;
      if(hh > 4 && erode < .95) { const yy = cy - u * hh; ufPx(S, xx, yy, i & 1 ? P.c : P.b); if(i % 3 === 0) ufPx(S, xx, yy + 1, P.b); } }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o; if(q < .2) return; const k = ufC((q - .2) / .1, 0, 1), fade = ufC((q - .6) / .4, 0, 1);
    ufEll(L.soft, cx, cy, R * .95 * k, R * .5 * k, P.d, .2 * (1 - fade));
    for(let i = 0; i < 12; i++){ const a = i * .5236, r = R * (.35 + .6 * k); if(ufH(i, 5) > fade) ufLine(L.soft, cx + Math.cos(a) * r * .5, cy + Math.sin(a) * r * .28, cx + Math.cos(a) * r, cy + Math.sin(a) * r * .55, 1, P.a); }
  }});

/* ---------- ESPIRAL: tres brazos de arena/tiempo que giran hacia afuera y se desenroscan ---------- */
ufDefForm('spiral', {N: 26, tall: 1, dur: 2100, shake: 3,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    const spin = q * 7.5, head = q < .2 ? ph.ant * .6 : .6 + .4 * ufEase(ph.hit), tail = ph.post < .45 ? 0 : ufC((ph.post - .45) / .55, 0, 1) * .98;
    if(q < .2){ ufEdgeMarks(S, o, 12, 'tick', P.b, .26); }
    for(let arm = 0; arm < 3; arm++){
      const a0 = arm * 2.0944, pts = []; let prev = null;
      for(let i = 0; i <= 60; i++){
        const s = i / 60; if(s > head || s < tail) { prev = null; continue; }
        const th = a0 + s * 8.4 - spin * .5 + (q > .2 ? 0 : 0), r = R * s * .98, x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r, w = q < .2 ? 1 : 1.6 + (R > 36 ? 4 : 3) * Math.pow(Math.sin(Math.PI * s), .7);
        if(q < .2){ if(i % 2 === 0) ufPx(S, x, y, P.b); }
        else { if(prev) ufLine(Hd, prev[0], prev[1], x, y, w, arm === 0 ? P.a : arm === 1 ? P.a : P.a); if(w > 2.2 && prev) ufLine(Hd, prev[0], prev[1], x, y, w - 2.2, P.b); if(w > 3.4 && prev) ufLine(Hd, prev[0], prev[1], x, y, 1, P.c); prev = [x, y]; if(i % 6 === 0) ufPx(S, x + Math.cos(th + 1.57) * (w + 2), y + Math.sin(th + 1.57) * (w + 2), P.e); }
        if(q < .2) prev = [x, y];
      }
      if(q >= .2 && head - tail > .05){ const th = a0 + Math.min(head, 1) * 8.4 - spin * .5, r = R * Math.min(head, 1) * .98; ufDisc(Hd, cx + Math.cos(th) * r, cy + Math.sin(th) * r, 2.6, P.c); }
    }
    // reloj en el centro: esfera, doce marcas y dos agujas
    const fr = R * .16; ufDisc(Hd, cx, cy, fr, P.d); ufRing(Hd, cx, cy, fr, 1, P.b);
    for(let i = 0; i < 12; i++){ const a = i * .5236; ufPx(Hd, cx + Math.cos(a) * (fr - 2), cy + Math.sin(a) * (fr - 2), P.c); }
    ufLine(Hd, cx, cy, cx + Math.cos(spin * 5) * fr * .85, cy + Math.sin(spin * 5) * fr * .85, 1, P.c); ufLine(Hd, cx, cy, cx + Math.cos(spin * .6) * fr * .55, cy + Math.sin(spin * .6) * fr * .55, 1, P.e);
    if(ph.post > 0) for(let i = 0; i < 26; i++){ const a = ufH(i, 3) * 6.28 + spin * .3, r = R * (.25 + .75 * ufH(i, 4)) * (.7 + .5 * ph.post); if(ufH(i, 9) > ph.post) ufPx(S, cx + Math.cos(a) * r, cy + Math.sin(a) * r, i & 1 ? P.c : P.e); }
  }});

/* ---------- CADENA: una cadena de eslabones con bola de pinchos que da la vuelta como látigo y cae ---------- */
ufDefForm('chain', {N: 26, tall: 1, dur: 1700, shake: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    const LH = ['.bbb.', 'b...b', '.bbb.'], LV = ['.b.', 'b.b', 'b.b', 'b.b', '.b.'], LD1 = ['.bb.', 'b..b', '.b.b', '..bb'].map(s => s), LD2 = ['bb..', 'b..b', 'b.b.', '.bb.'];
    const map = {b: P.b}, mapA = {b: P.a};
    const lk = R >= 40 ? 2 : 1, sweep = ufEase(ufC((q - .14) / .42, 0, 1)), phi = -1.2 + sweep * 7.2, span = 2.3 * (1 - ufC((q - .62) / .3, 0, 1) * .6);
    if(q < .2){ ufEdgeMarks(S, o, 10, 'diamond', P.b, .1); for(let i = 0; i < 6 * ph.ant; i++){ const a = -1.2 - i * .12; ufBmp(Hd, i & 1 ? LV : LH, map, cx + Math.cos(a) * R * .62, cy + Math.sin(a) * R * .62); } return; }
    const n = 40, drop = ufIn(ufC((q - .6) / .4, 0, 1));
    for(let i = 0; i <= n; i++){
      const u = i / n, ang = phi - span * (1 - u), r = R * (.5 + .46 * u) + Math.sin(u * 11 + f * .8) * R * .03, drp = drop * R * .5 * (1 - u * .4);
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r + drp, tg = ang + 1.5708, tc = Math.abs(Math.cos(tg)), ts = Math.abs(Math.sin(tg));
      if(ufH(i, 77) < drop * 1.1) continue;
      if(i % 3 === 0){ const rows = tc > .86 ? LH : ts > .86 ? LV : (Math.cos(tg) * Math.sin(tg) > 0 ? LD1 : LD2); ufBmp(Hd, rows, (i / 3) % 2 ? mapA : map, x, y, {sc: lk}); }
      else if(i % 3 === 1) ufBmp(Hd, ['bb', 'bb'], mapA, x, y, {sc: lk});
      if(i % 5 === 0 && u > .3) ufPx(S, x - Math.cos(ang) * 4, y - Math.sin(ang) * 4, P.d);
    }
    // estela tramada y bola de pinchos en la cabeza
    for(let i = 0; i < 30; i++){ const u = i / 30, ang = phi - span * 1.15 * (1 - u * .9), r = R * (.5 + .46 * u); if(ufDith(i, f, .5 * u) && drop < .4) ufPx(S, cx + Math.cos(ang) * (r + 6), cy + Math.sin(ang) * (r + 6), P.d); }
    const hr = R * .96, hx = cx + Math.cos(phi) * hr, hy = cy + Math.sin(phi) * hr + drop * R * .2;
    if(drop < .6){ ufDisc(Hd, hx, hy, R * .1 + 1, P.d); ufDisc(Hd, hx - 1, hy - 1, R * .07, P.a); ufPx(Hd, hx - 1, hy - 2, P.c);
      for(let k = 0; k < 8; k++){ const a = k * .7854 + f * .2; ufLine(Hd, hx + Math.cos(a) * R * .08, hy + Math.sin(a) * R * .08, hx + Math.cos(a) * (R * .08 + 4), hy + Math.sin(a) * (R * .08 + 4), 1.5, P.b); } }
    if(q > .54 && q < .72){ const k = (q - .54) / .18; for(let i = 0; i < 9; i++){ const a = i * .698 + .2, d = R * .1 + k * R * .22; ufLine(S, hx + Math.cos(a) * d * .5, hy + Math.sin(a) * d * .5, hx + Math.cos(a) * d, hy + Math.sin(a) * d, 1, i & 1 ? P.c : P.e); } }
  }});

/* ---------- CUCHILLAS CRUZADAS: dos tajos en equis y uno horizontal, sin círculo ---------- */
ufDefForm('cross', {N: 22, tall: 1, dur: 1000, gdur: 1500, shake: 7,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard, post = ph.post;
    if(q < .2){ ufEdgeMarks(S, o, 12, 'cross', P.b, .1);
      for(const an of [-.61, .61]){ const ca = Math.cos(an), sa = Math.sin(an); for(let t = -R; t <= R; t += 4) if(Math.abs(t) > R * (1 - ph.ant)) ufPx(S, cx + ca * t, cy + sa * t, P.c); }
      return; }
    const slash = (an, delay, mir, lenK, thK) => {
      const rv = -1 + 2 * ufEase(ufC((q - .18 - delay) / .11, 0, 1)), tailS = -1 + 2 * ufC((post - .12) / .6, 0, 1) * 1.05;
      if(rv <= -.99) return;
      const ca = Math.cos(an), sa = Math.sin(an), nx = -sa * mir, ny = ca * mir, Lh = R * .98 * lenK, split = post * R * .12, top = [], bot = [];
      const hi = [], lo = [];
      for(let i = 0; i <= 28; i++){ const s = -1 + i / 14; if(s > rv || s < tailS) continue; const b = Math.pow(Math.max(0, 1 - s * s), .7), to = R * .24 * b * thK * (1 - post * .7), ti = R * .05 * b * thK, al = s * Lh + (s > 0 ? split : -split);
        top.push([cx + ca * al + nx * -to, cy + sa * al + ny * -to]); bot.push([cx + ca * al + nx * ti, cy + sa * al + ny * ti]);
        hi.push([cx + ca * al + nx * -to * .5, cy + sa * al + ny * -to * .5]); lo.push([cx + ca * al + nx * ti * .2, cy + sa * al + ny * ti * .2]); }
      if(top.length < 2) return;
      ufPoly(S, top.concat(bot.slice().reverse()).map(p => [p[0] + (-nx) * 3, p[1] + (-ny) * 3]), P.d, .4 * (1 - post));       // estela tramada
      ufPoly(Hd, top.concat(bot.slice().reverse()), P.a); ufPoly(Hd, hi.concat(lo.slice().reverse()), P.b);
      for(let i = 0; i < hi.length - 1; i++) ufLine(Hd, (hi[i][0] + lo[i][0]) / 2, (hi[i][1] + lo[i][1]) / 2, (hi[i + 1][0] + lo[i + 1][0]) / 2, (hi[i + 1][1] + lo[i + 1][1]) / 2, 1, P.c);
      const j = top.length - 1; if(post < .3) ufDisc(Hd, (top[j][0] + bot[j][0]) / 2, (top[j][1] + bot[j][1]) / 2, 2.4 * (1 - post * 2), P.c);
    };
    slash(-.62, 0, 1, 1, 1); slash(.62, .05, -1, 1, 1); slash(0, .12, 1, .92, .55);
    // estrella de impacto y esquirlas
    const k = ufC((q - .2) / .1, 0, 1) * (1 - ufC((q - .34) / .3, 0, 1));
    if(k > 0.05){ const r = R * .3 * k; for(let i = 0; i < 8; i++){ const a = i * .7854 + .39; ufLine(Hd, cx, cy, cx + Math.cos(a) * r * (i & 1 ? .6 : 1), cy + Math.sin(a) * r * (i & 1 ? .6 : 1), i & 1 ? 1 : 2, i & 1 ? P.b : P.c); } ufDisc(Hd, cx, cy, 3 * k + 1, P.c); }
    if(q > .22) for(let i = 0; i < 14; i++){ const a = ufH(i, 1) * 6.28, d = R * (.15 + .7 * ufEase(ufC((q - .22) / .45, 0, 1))) * (.5 + ufH(i, 2) * .5); if(ufH(i, 8) > post) { ufPx(S, cx + Math.cos(a) * d, cy + Math.sin(a) * d, i & 1 ? P.e : P.c); ufPx(S, cx + Math.cos(a) * d + 1, cy + Math.sin(a) * d, P.e); } }
  },
  gpaint(L, o){ const {P, R, cx, cy, q} = o; if(q < .3) return; const f = ufC((q - .6) / .4, 0, 1);
    for(const an of [-.62, .62, 0]){ const ca = Math.cos(an), sa = Math.sin(an), l = R * .9; for(let t = -l; t <= l; t += 1) if(ufH(Math.round(t), an * 9) > f && ((t | 0) & 3) < 2 && Math.abs(t) < l * ufC((q - .2) / .1, 0, 1)) ufPx(L.soft, cx + ca * t, cy + sa * t, P.d); } }});

/* ---------- METEORO: cae en diagonal con cola de fuego, estalla y deja un cráter con grietas que se enfrían ---------- */
ufDefForm('meteor', {N: 28, tall: 1.9, dur: 1300, gdur: 2800, shake: 9,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard, qi = .36;
    if(q < qi){
      const t = ufIn(ufC((q - .08) / (qi - .08), 0, 1)), sx = cx + R * .95, sy = cy - R * 2.35, px = ufLerp(sx, cx, t), py = ufLerp(sy, cy - 2, t), dx = cx - sx, dy = cy - 2 - sy, dl = Math.hypot(dx, dy), ux = dx / dl, uy = dy / dl, nx = -uy, ny = ux, rr = R * .16 * (.6 + .4 * t);
      if(q < .26){ ufEdgeMarks(S, o, 8, 'chev', P.b, .2, 1, undefined); for(let i = 0; i < 4; i++) ufLine(S, cx + Math.cos(i * 1.5708) * R * .08, cy + Math.sin(i * 1.5708) * R * .08, cx + Math.cos(i * 1.5708) * R * .22, cy + Math.sin(i * 1.5708) * R * .22, 1, P.c); }
      if(t > 0){ const tl = R * (.9 + .8 * t);
        ufPoly(S, [[px + nx * rr * 1.3, py + ny * rr * 1.3], [px - nx * rr * 1.3, py - ny * rr * 1.3], [px - ux * tl, py - uy * tl]], P.a, .75);
        ufPoly(S, [[px + nx * rr * .9, py + ny * rr * .9], [px - nx * rr * .9, py - ny * rr * .9], [px - ux * tl * .7, py - uy * tl * .7]], P.b, .85);
        ufPoly(Hd, [[px + nx * rr * .5, py + ny * rr * .5], [px - nx * rr * .5, py - ny * rr * .5], [px - ux * tl * .45, py - uy * tl * .45]], P.c);
        for(let i = 0; i < 9; i++){ const d = ufH(i, f) * tl, w = (ufH(i, 3) - .5) * rr * 2.4; ufPx(S, px - ux * d + nx * w, py - uy * d + ny * w, i & 1 ? P.e : P.c); }
        ufDisc(Hd, px, py, rr, P.d); ufDisc(Hd, px - 1, py - 1, rr * .72, P.a); ufDisc(Hd, px - rr * .3, py - rr * .3, rr * .35, P.c); }
      return;
    }
    const k = (q - qi) / (1 - qi), hit = ufC(k / .22, 0, 1), fl = 1 - ufC(k / .5, 0, 1);
    if(fl > 0){ ufDisc(S, cx, cy, R * .36 * ufEase(hit), P.c, fl > .5 ? 1 : .5); ufDisc(S, cx, cy, R * .2 * ufEase(hit) * fl + 2, P.b, 1); }
    // rayas radiales que llegan al radio REAL
    for(let i = 0; i < 14; i++){ const a = i * .4488 + ufH(i, 2) * .2, e = ufEase(ufC(k / .3, 0, 1)), r0 = R * e * .98 - 8 - ufH(i, 5) * 6; if(k < .45) ufLine(Hd, cx + Math.cos(a) * Math.max(4, r0), cy + Math.sin(a) * Math.max(4, r0), cx + Math.cos(a) * R * e * .98, cy + Math.sin(a) * R * e * .98, 1, i & 1 ? P.c : P.b); }
    // escombros parabólicos
    for(let i = 0; i < 16; i++){ const a = ufH(i, 11) * 6.28, v = R * (.4 + 1.3 * ufH(i, 12)) * .9, tt = k * 1.6, x = cx + Math.cos(a) * v * tt * .85, y = cy + Math.sin(a) * v * tt * .5 - (R * 1.5 * tt) * (1 - tt) * ufH(i, 13) * 1.6 + R * .2 * tt * tt;
      if(tt < 1 && ufH(i, 14) > k * .8) { ufDisc(Hd, x, y, 1.6, P.d); ufPx(Hd, x - 1, y - 1, P.a); } }
    for(let i = 0; i < 18; i++){ const a = ufH(i, 21) * 6.28, d = R * .9 * ufH(i, 22), u = (ufH(i, 23) + k * 1.4) % 1; if(k > .2 && ufH(i, 24) > k * .9) ufPx(S, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8 - u * R * .6, i & 1 ? P.e : P.c); }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q} = o, qi = .36; if(q < qi) return; const k = (q - qi) / (1 - qi), g = ufEase(ufC(k / .18, 0, 1)), fade = ufC((k - .7) / .3, 0, 1), heat = 1 - ufC(k / .8, 0, 1), keep = ufKeep(fade);
    ufEll(L.hard, cx, cy, R * .34 * g, R * .25 * g, P.d, 1, keep); ufEll(L.soft, cx, cy + 1, R * .26 * g, R * .18 * g, P.o, 1, keep);
    ufRing(L.soft, cx, cy, 1, 2, P.b, {rx: R * .34 * g, ry: R * .25 * g, a0: 3.4, a1: 2.6, keep});
    for(let i = 0; i < 8; i++){ const a0 = i * .7854 + ufH(i, 3) * .3, len = R * (.55 + .43 * ufH(i, 4)) * g, col = heat > .55 ? P.c : heat > .2 ? P.a : P.d; let x = cx + Math.cos(a0) * R * .3, y = cy + Math.sin(a0) * R * .3, a = a0;
      for(let s = 0; s < 6; s++){ a = a0 + (ufH(i * 9 + s, 5) - .5) * .8; const d = (len - R * .3) / 6, nx = x + Math.cos(a) * d, ny = y + Math.sin(a) * d; ufLine(L.soft, x, y, nx, ny, heat > .3 ? 2 : 1, col); if(heat > .55) ufLine(L.soft, x, y, nx, ny, 1, P.c); x = nx; y = ny; } }
    for(let i = 0; i < 10; i++){ const a = ufH(i, 31) * 6.28, d = R * (.5 + .45 * ufH(i, 32)) * g; if(ufH(i, 33) > fade) ufDisc(L.soft, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .75, 1.5, P.d); }
  }});

/* ---------- OLA: una cresta de agua con espuma cruza el área de lado a lado y el agua se retira ---------- */
ufDefForm('wave', {N: 24, tall: 1, rot: true, dur: 1800, gdur: 2300, shake: 6,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .2){ ufEdgeMarks(S, o, 14, 'chev', P.b, 0, 1, 0); for(let i = 0; i < 5; i++) ufLine(S, cx - R * .92 + i * 3, cy - 4 + i * 2, cx - R * .92 + i * 3, cy + 4 - i * 2, 1, P.c); return; }
    const t = ufSm(ufC((q - .18) / .46, 0, 1)), xw = ufLerp(-R * .92, R * .92, t), yMax = Math.sqrt(Math.max(4, R * R - xw * xw)) * .97, drain = ufC((q - .62) / .38, 0, 1);
    // hoja de agua detrás de la cresta: tramado que se vacía hacia atrás
    for(let y = -R; y <= R; y += 1) for(let x = -R; x <= R; x++){
      const gx = cx + x, gy = cy + y; if(x * x + y * y > R * R * .985) continue;
      const behind = xw - .24 * R - x; if(behind < 0) continue; if(drain > 0 && (x + R) / (2 * R) > 1 - drain * 1.15) continue;
      const rip = Math.sin(x * .45 + y * .25 - f * .9 + ufH(x >> 2, y >> 2) * 3);
      const dd = .42 * (1 - Math.min(1, behind / (R * 1.6))) * (1 - drain * .5) + .06;
      if(rip > .55 && ufDith(gx | 0, gy | 0, dd + .35)) ufPx(S, gx, gy, P.b); else if(ufDith(gx | 0, gy | 0, dd)) ufPx(S, gx, gy, P.d);
    }
    // tres crestas en cuña (la mayor al frente): cuerpo rayado, espuma en el filo y gotas por delante
    if(t > 0 && t < 1.001) for(const [off, sz] of [[-.5, .62], [-.26, .8], [0, 1]]){
      const xc = xw + off * R, yM = Math.sqrt(Math.max(0, R * R - xc * xc)) * .96; if(yM < 6 || t < .04 - off * .1) continue;
      const top = [], bot = [];
      for(let i = 0; i <= 24; i++){ const u = i / 12 - 1, bul = 1 - u * u; top.push([cx + xc + R * .2 * sz * bul, cy + u * yM]); bot.push([cx + xc - R * .02 * sz * bul - R * .03 * sz * bul * bul, cy + u * yM]); }
      ufPoly(Hd, top.concat(bot.slice().reverse()), sz < 1 ? P.d : P.a);
      for(let y = -yM + 2; y < yM - 1; y += 3){ const u = y / yM, bul = 1 - u * u; ufLine(Hd, cx + xc - R * .02 * sz * bul + ((f * 2 + y) % 5), cy + y, cx + xc + R * .2 * sz * bul - 3, cy + y, 1, sz < 1 ? P.a : P.b); }
      for(let i = 0; i <= 24; i++){ const u = i / 12 - 1, bul = 1 - u * u, xx = cx + xc + R * .2 * sz * bul, yy = cy + u * yM; if(sz === 1 || i % 2 === 0) ufDisc(Hd, xx, yy, (1.2 + 1.3 * bul) * sz, P.c, 1); if(i % 2 === 0) ufPx(S, xx + 3 + ufH(i, f) * 4 * sz, yy + (ufH(i, 9) - .5) * 4, P.c); }
    }
    if(t > 0 && t < 1.001) for(let i = 0; i < 18; i++){ const a = (ufH(i, 3) - .5) * 2, xx = cx + xw + R * .26 + ufH(i, f) * R * .16, yy = cy + a * Math.sqrt(Math.max(0, R * R - xw * xw)) * .95; ufPx(S, xx, yy, i & 1 ? P.c : P.b); }
    if(t >= .98) for(let i = 0; i < 22; i++){ const a = (ufH(i, 5) - .5) * 2.4, d = ufH(i, 6) * R * .18 * (1 + drain), xx = cx + R * .9 + Math.cos(a) * d, yy = cy + Math.sin(a) * d * 3.2; if(ufH(i, 7) > drain) ufPx(S, xx, yy, i & 1 ? P.c : P.b); }
  },
  gpaint(L, o){ const {P, R, cx, cy, q, f} = o; if(q < .25) return; const fade = ufC((q - .62) / .38, 0, 1);
    for(let y = -R; y <= R; y += 2) for(let x = -R; x <= R; x += 2){ if(x * x + y * y > R * R * .95) continue; if(ufH(x >> 1, y >> 1) > .78 && ufH(x >> 1, y >> 1) > .78 + fade * .22 && (x + R) / (2 * R) < ufC((q - .18) / .46, 0, 1) + .02) ufPx(L.soft, cx + x, cy + y, ((x + y + f) & 3) ? P.d : P.a); } }});

/* ---------- CÚPULA: media esfera de paneles hexagonales que sube, aguanta y se hace pedazos ---------- */
ufDefForm('dome', {N: 24, tall: 1, dur: 2300, gdur: 2800, shake: 6,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .2){ ufEdgeMarks(S, o, 12, 'hex', P.b, .05); ufLine(S, cx - R * ph.ant, cy, cx + R * ph.ant, cy, 1, P.c); return; }
    const g = ufEase(ufC((q - .18) / .17, 0, 1)), post = ufC((q - .55) / .45, 0, 1), rad = R * g * .98, cell = Math.max(6, Math.round(R / 6));
    const alive = (x, y) => { const gx = Math.floor((x + (Math.floor(y / cell) & 1) * cell / 2) / cell), gy = Math.floor(y / cell); return ufH(gx, gy + 5) >= post * 1.2; };
    // relleno de cristal tramado por celdas
    for(let y = -rad; y <= 0; y++) for(let x = -rad; x <= rad; x++){ const dd = Math.hypot(x, y); if(dd > rad) continue; const px = cx + x | 0, py = cy + y | 0; if(!alive(x + 999, y + 999)) continue;
      const gx = Math.floor((x + 999 + (Math.floor((y + 999) / cell) & 1) * cell / 2) / cell), gy = Math.floor((y + 999) / cell), tone = ufH(gx, gy);
      if(tone < .3 && ufDith(px, py, .34)) ufPx(S, px, py, P.b); else if(ufDith(px, py, .17 + .1 * tone)) ufPx(S, px, py, P.d); }
    // costillas: meridianos y paralelos
    for(let i = -3; i <= 3; i++){ if(i === 0) continue; const pts = []; for(let s = 0; s <= 24; s++){ const a = Math.PI + s / 24 * Math.PI; pts.push([cx + Math.cos(a) * rad * Math.abs(i) / 3.3 * Math.sign(i), cy + Math.sin(a) * rad]); }
      for(let s = 0; s < 24; s++) if(alive(pts[s][0] - cx + 999, pts[s][1] - cy + 999)) ufLine(Hd, pts[s][0], pts[s][1], pts[s + 1][0], pts[s + 1][1], 1, P.b); }
    for(const hk of [.38, .7]) ufRing(Hd, cx, cy, rad * hk, 1, P.a, {rx: rad * Math.sqrt(1 - hk * hk * .3), ry: rad * hk * .25, a0: Math.PI, a1: Math.PI, keep: (x, y) => y <= cy && alive(x - cx + 999, y - cy + 999)});
    // borde exterior grueso (media circunferencia) con brillo que recorre
    ufRing(Hd, cx, cy, rad, 3, P.a, {a0: Math.PI, a1: Math.PI, keep: (x, y) => y <= cy + 1 && alive(x - cx + 999, y - cy + 999)});
    ufRing(Hd, cx, cy, rad - 1, 1, P.b, {a0: Math.PI, a1: Math.PI, keep: (x, y) => y <= cy + 1 && alive(x - cx + 999, y - cy + 999)});
    const ga = Math.PI + ((q * 3.2) % 1) * Math.PI; if(g > .9) for(let s = -4; s <= 4; s++) ufPx(Hd, cx + Math.cos(ga + s * .025) * (rad - 1), cy + Math.sin(ga + s * .025) * (rad - 1), P.c);
    // base: línea de suelo con aro delantero y pernos
    ufRing(Hd, cx, cy, rad, 2, P.a, {rx: rad, ry: rad * .26, a0: 0, a1: Math.PI, keep: (x, y) => y >= cy});
    for(let i = 0; i < 8; i++){ const a = i * .7854 + .39; if(Math.sin(a) > 0 && ufH(i, 4) >= post) ufDisc(Hd, cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * .26, 1.5, P.c); }
    if((q > .46 && q < .5) || (q > .66 && q < .7)){ let x = cx - rad * .5, y = cy - rad * .9; for(let s = 0; s < 6; s++){ const nx = x + (ufH(s, f) - .3) * 9, ny = y + 6 + ufH(s, 2) * 5; ufLine(Hd, x, y, nx, ny, 1, P.c); x = nx; y = ny; } }
    // pedazos que caen
    if(post > 0) for(let i = 0; i < 16; i++){ const a = Math.PI + ufH(i, 3) * Math.PI, r = rad * (.55 + .45 * ufH(i, 4)), fall = post * post * R * (.5 + ufH(i, 5) * .5); if(ufH(i, 7) > post * .9) ufPoly(Hd, [[cx + Math.cos(a) * r, cy + Math.sin(a) * r + fall], [cx + Math.cos(a) * r + 5, cy + Math.sin(a) * r + fall + 2], [cx + Math.cos(a) * r + 2, cy + Math.sin(a) * r + fall + 6]], i & 1 ? P.b : P.a); }
  },
  gpaint(L, o){ const {P, R, cx, cy, q, f} = o; if(q < .18) return; const g = ufEase(ufC((q - .18) / .17, 0, 1)), fade = ufC((q - .55) / .45, 0, 1);
    ufEll(L.soft, cx, cy, R * g, R * g * .35, P.d, .22 * (1 - fade));
    ufRing(L.soft, cx, cy, 1, 1, P.a, {rx: R * g, ry: R * g * .35, dash: {n: 18, on: .6, ph: f * .05}, keep: ufKeep(fade)}); }});

/* ---------- CORDILLERA: picos nevados que brotan del suelo en todo el área, con la bandera en el más alto ---------- */
ufDefForm('ridge', {N: 24, tall: 1.55, dur: 2000, gdur: 2600, shake: 8,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .2){ ufEdgeMarks(S, o, 12, 'tick', P.b, .1); for(let i = 0; i < 5; i++) ufPx(S, cx + (ufH(i, 1) - .5) * R * 1.3, cy + (ufH(i, 2) - .5) * R, P.c); return; }
    const peaks = []; for(let i = 0; i < 13; i++){ const a = ufH(i, 7) * 6.28, d = Math.sqrt(ufH(i, 8)) * R * .84; peaks.push({x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * .8 + R * .08, h: R * (.55 + .7 * ufH(i, 9)) * (1.15 - d / R * .45), w: R * (.2 + .12 * ufH(i, 10)), d, i}); }
    peaks.push({x: cx, y: cy + R * .1, h: R * 1.55, w: R * .34, d: 0, i: 99}); peaks.sort((a, b) => a.y - b.y);
    const post = ufC((q - .6) / .4, 0, 1);
    for(const p of peaks){
      const g = ufC((q - .18 - p.d / R * .12 - ufH(p.i, 3) * .03) / .14, 0, 1), over = g < 1 ? Math.sin(g * 3.14) * .12 : 0, h = p.h * (ufEase(g) + over) * (1 - ufIn(post)); if(h < 3) continue;
      const top = p.y - h, w = p.w, kp = ufKeep(post * .9, p.i);
      ufEll(S, p.x, p.y, w * 1.1, w * .32, P.d, .6);
      ufPoly(Hd, [[p.x - w, p.y], [p.x - w * .15, top + h * .02], [p.x, top], [p.x + w * .1, top + h * .05], [p.x + w, p.y]], P.d, 1, kp);     // cara en sombra
      ufPoly(Hd, [[p.x + w * .05, p.y], [p.x, top], [p.x + w * .1, top + h * .05], [p.x + w, p.y]], P.a, 1, kp);                                     // cara iluminada
      const sn = h * .34; ufPoly(Hd, [[p.x - w * .38, top + sn], [p.x - w * .1, top + sn * .55], [p.x, top], [p.x + w * .1, top + sn * .5], [p.x + w * .38, top + sn], [p.x + w * .15, top + sn * .8], [p.x - w * .05, top + sn * .95]], P.c, 1, kp);
      ufLine(Hd, p.x, top + 1, p.x + w * .96, p.y - 1, 1, P.e, undefined);
      if(g > 0 && g < .9) for(let k = 0; k < 4; k++) ufPx(S, p.x + (ufH(k, p.i) - .5) * w * 2.2, p.y - ufH(k, 4) * 10 * g, P.b);
      if(p.i === 99 && g > .85 && post < .5){ const fy = top - 9; ufLine(Hd, p.x, top, p.x, fy, 1, P.o); ufPoly(Hd, [[p.x, fy], [p.x + 9 + Math.sin(f * .7) * 1.5, fy + 2], [p.x, fy + 5]], P.b); ufPx(Hd, p.x + 4, fy + 2, P.e); }
    }
  },
  gpaint(L, o){ const {P, R, cx, cy, q} = o; if(q < .2) return; const fade = ufC((q - .6) / .4, 0, 1), g = ufC((q - .2) / .2, 0, 1);
    ufEll(L.soft, cx, cy, R * g, R * g * .8, P.d, .18 * (1 - fade));
    for(let i = 0; i < 30; i++){ const a = ufH(i, 41) * 6.28, d = Math.sqrt(ufH(i, 42)) * R * .95 * g; if(ufH(i, 43) > fade) ufDisc(L.soft, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8, 1.3, i & 1 ? P.a : P.d); } }});
