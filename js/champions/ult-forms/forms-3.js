'use strict';
/* js/champions/ult-forms/forms-3.js — formas compactas para HABILIDADES normales (no definitivas): esquirlas, zarpazos, órbita y flor.
   Misma técnica que las definitivas pero más cortas (0,6–1,2 s) y de menor tamaño; sirven para que las tres habilidades de un campeón
   se distingan por forma y no solo por color. Ver kit.js para el contrato de paint(L, o). Solo visual. */

/* ---------- ESQUIRLAS: cristales / espinas que brotan en abanico y se quiebran ---------- */
ufDefForm('shards', {N: 18, tall: 1.4, dur: 1000, gdur: 1500, shake: 0,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .16){ ufEdgeMarks(S, o, 8, 'diamond', P.b, .2); return; }
    const post = ufC((q - .55) / .45, 0, 1), list = [];
    for(let i = 0; i < 12; i++){ const a = i * 0.5236 + ufH(i, 1) * .3, rho = R * (.2 + .72 * Math.sqrt(ufH(i, 2))); list.push({x: cx + Math.cos(a) * rho, y: cy + Math.sin(a) * rho * .72, rho, h: R * (.4 + .6 * ufH(i, 3)) * (1 - rho / R * .35), w: R * (.09 + .07 * ufH(i, 4)), i}); }
    list.sort((p, q2) => p.y - q2.y);
    for(const s of list){
      const g = ufEase(ufC((q - .14 - s.rho / R * .08) / .1, 0, 1)), h = s.h * g * (1 - ufIn(post) * .5); if(h < 2) continue; const kp = ufKeep(post * .95, s.i * 5), top = s.y - h, tilt = (ufH(s.i, 7) - .5) * s.w * 1.2;
      ufPoly(Hd, [[s.x - s.w, s.y], [s.x + tilt, top], [s.x, s.y]], P.a, 1, kp);
      ufPoly(Hd, [[s.x, s.y], [s.x + tilt, top], [s.x + s.w, s.y]], P.d, 1, kp);
      ufLine(Hd, s.x + tilt * .3 - s.w * .3, s.y - h * .15, s.x + tilt, top + 1, 1, P.b); ufPx(Hd, s.x + tilt, top, P.c);
    }
    for(let i = 0; i < 10; i++){ const a = ufH(i, 9) * 6.28, d = R * (.2 + .75 * ufH(i, 10)), u = (ufH(i, 11) + q * 1.3) % 1; if(q > .2 && ufH(i, 12) > post) ufPx(S, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .72 - u * R * .5, i & 1 ? P.c : P.b); }
  },
  gpaint(L, o){ const {P, R, cx, cy, q} = o; if(q < .16) return; const g = ufEase(ufC((q - .16) / .1, 0, 1)), fade = ufC((q - .6) / .4, 0, 1);
    ufEll(L.soft, cx, cy, R * g, R * g * .72, P.d, .2 * (1 - fade));
    for(let i = 0; i < 12; i++){ const a = i * .5236 + ufH(i, 21), len = R * (.5 + .45 * ufH(i, 22)) * g; if(ufH(i, 23) > fade) ufLine(L.soft, cx + Math.cos(a) * R * .12, cy + Math.sin(a) * R * .09, cx + Math.cos(a) * len, cy + Math.sin(a) * len * .72, 1, P.b); } }});

/* ---------- ZARPAZOS: tres tajos curvos paralelos en diagonal, orientados hacia donde mira el héroe ---------- */
ufDefForm('claws', {N: 16, tall: 1, rot: true, dur: 650, gdur: 1000, shake: 2,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .16){ for(let k = 0; k < 3; k++){ const y = (k - 1) * R * .3; for(let t = 0; t < 8; t++) ufPx(S, cx - R * .1 + t * R * .1 * ph.ant, cy + y + t * R * .05 * ph.ant, P.b); } return; }
    const post = ufC((q - .5) / .5, 0, 1);
    for(let k = 0; k < 3; k++){
      const rv = ufEase(ufC((q - .16 - k * .05) / .16, 0, 1)), y0 = (k - 1) * R * .3, pts = [];
      for(let i = 0; i <= 20; i++){ const u = i / 20; if(u > rv) break; const x = -R * .15 + u * R * 1.05, y = y0 - R * .42 + u * R * .84 + Math.sin(u * 3.14) * R * .08, wd = Math.sin(u * 3.14) * R * .09 * (1 - post * .7) + .8; pts.push([cx + x, cy + y, wd]); }
      if(pts.length < 2) continue;
      const a = pts.map(p => [p[0] - p[2] * .6, p[1] - p[2]]), b = pts.map(p => [p[0] + p[2] * .3, p[1] + p[2]]);
      ufPoly(S, a.concat(b.slice().reverse()).map(p => [p[0] - 3, p[1] - 2]), P.d, .4 * (1 - post));
      ufPoly(Hd, a.concat(b.slice().reverse()), P.a, 1, ufKeep(post * .9, k)); const m = pts.map(p => [p[0], p[1]]); for(let i = 0; i < m.length - 1; i++) ufLine(Hd, m[i][0], m[i][1], m[i + 1][0], m[i + 1][1], 1, P.c);
      if(rv < 1) ufDisc(Hd, pts[pts.length - 1][0], pts[pts.length - 1][1], 2, P.c);
    }
    for(let i = 0; i < 10; i++){ const t = ufH(i, 3), x = cx + R * (.1 + .8 * t) * ufEase(ufC((q - .2) / .2, 0, 1)), y = cy + (ufH(i, 4) - .5) * R * .9; if(ufH(i, 5) > post) ufPx(S, x, y, i & 1 ? P.e : P.b); }
  }});

/* ---------- ÓRBITA: tres esferas giran en elipse cada vez más cerradas, dejan estela y colapsan en una estrella ---------- */
ufDefForm('orbit', {N: 24, tall: 1, dur: 1200, gdur: 0, shake: 2,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .16){ ufEdgeMarks(S, o, 3, 'spark', P.c, ph.q * 2); return; }
    const t = ufC((q - .16) / .5, 0, 1), post = ufC((q - .66) / .34, 0, 1), tilt = .35;
    const pos = (k, tt) => { const rho = R * (1 - .72 * ufEase(tt)), ang = k * 2.0944 + tt * 9 + (tt * tt) * 6; const ex = Math.cos(ang) * rho, ey = Math.sin(ang) * rho * .55; return [cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), cy + ex * Math.sin(tilt) + ey * Math.cos(tilt)]; };
    if(q < .7) for(let k = 0; k < 3; k++){
      for(let s = 14; s >= 1; s--){ const tt = Math.max(0, t - s * .018), p = pos(k, tt); if(s % 2 === 0 || s < 5) ufDisc(S, p[0], p[1], Math.max(.8, 2.6 - s * .16), s < 6 ? P.b : P.a, s < 9 ? 1 : .5); }
      const p = pos(k, t); ufDisc(Hd, p[0], p[1], R * .08 + 1, P.a); ufDisc(Hd, p[0] - 1, p[1] - 1, R * .05, P.b); ufPx(Hd, p[0] - 1, p[1] - 1, P.c);
    }
    if(q >= .62){ const k = ufC((q - .62) / .1, 0, 1) * (1 - post); if(k > .04){ for(let i = 0; i < 8; i++){ const a = i * .7854 + .39, l = R * .5 * k * (i & 1 ? .6 : 1); ufLine(Hd, cx, cy, cx + Math.cos(a) * l, cy + Math.sin(a) * l, i & 1 ? 1 : 2, i & 1 ? P.b : P.c); } ufDisc(Hd, cx, cy, 3 * k + 1, P.c); } }
    if(post > 0) for(let i = 0; i < 14; i++){ const a = ufH(i, 5) * 6.28, d = R * .6 * post * (.4 + ufH(i, 6)); if(ufH(i, 7) > post) ufPx(S, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .7, i & 1 ? P.c : P.e); }
  }});

/* ---------- FLOR: ocho pétalos que se abren desde el centro y caen girando ---------- */
ufDefForm('bloom', {N: 22, tall: 1.1, dur: 1300, gdur: 0, shake: 0,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .16){ ufEdgeMarks(S, o, 8, 'dot', P.b, .1); ufDisc(Hd, cx, cy, 1 + ph.ant * 2, P.e); return; }
    const op = ufEase(ufC((q - .16) / .22, 0, 1)), post = ufC((q - .55) / .45, 0, 1), spin = q * 1.2;
    const petal = (a, len, wd, col, lite) => { if(len < 3) return; const pts = []; for(let i = 0; i <= 10; i++){ const u = i / 10; pts.push([u * len, Math.sin(Math.pow(u, .7) * 3.14) * wd]); } for(let i = 10; i >= 0; i--){ const u = i / 10; pts.push([u * len, -Math.sin(Math.pow(u, .7) * 3.14) * wd]); }
      const ca = Math.cos(a), sa = Math.sin(a), map = pts.map(p => [cx + p[0] * ca - p[1] * sa, cy + p[0] * sa + p[1] * ca]), kp = ufKeep(post * .9, Math.round(a * 9));
      ufPoly(Hd, map, col, 1, kp); ufLine(Hd, cx + ca * len * .2, cy + sa * len * .2, cx + ca * len * .85, cy + sa * len * .85, 1, lite); };
    for(let i = 0; i < 8; i++) petal(i * .7854 + .3927 + spin * .5, R * .78 * op * (1 - post * .3), R * .14, P.a, P.b);
    for(let i = 0; i < 8; i++) petal(i * .7854 + spin, R * .98 * op * (1 - post * .2), R * .17, P.b, P.c);
    ufDisc(Hd, cx, cy, R * .1 * op + 1, P.e); ufDisc(Hd, cx, cy, R * .05 * op, P.c);
    if(q > .3) for(let i = 0; i < 18; i++){ const u = (ufH(i, 5) + q * 1.1) % 1, a = ufH(i, 6) * 6.28, d = R * (.2 + .8 * ufH(i, 7)), x = cx + Math.cos(a) * d + Math.sin(u * 9 + i) * 4, y = cy + Math.sin(a) * d * .8 - R * .5 + u * R * .9; if(ufH(i, 8) > post * .9) { ufPx(S, x, y, i & 1 ? P.b : P.a); ufPx(S, x + 1, y, i & 1 ? P.b : P.a); } }
  }});
