'use strict';
/* js/champions/ult-forms/forms-2a-1.js — segunda tanda de definitivas con silueta propia (parte 1): aelith, aurelia, axiom, baltra, dariel, farolero, guerrero.
   Mismo contrato que forms-1/2/3: ufDefForm(id, {N, tall, dur, gdur, shake, paint(L, o), gpaint(L, o)}). L.soft = debajo (sin contorno, tramados), L.hard = arriba (con contorno de 1 px).
   o = {R (radio REAL en px), cx, cy (centro en el suelo), P (colores), q (0..1 de la vida), f (cuadro), N}. Sin Math.random: todo el "azar" sale de ufH (hash fijo). Solo visual.
   Cada forma cuenta a su campeón (brief de arte docs/art-brief/campeones/<clave>.md): dial de reloj con agujas que saltan, catedral con rosetón, ventana de sistema, campana, pentagrama con puerta
   de salida, faroles en órbita, red de veneno entre trampas. Ninguna es un anillo con polvo. */

/* ---------------- ayudas comunes de la tanda (prefijo UA) ---------------- */
const UA = {
  // engranaje de n dientes (keep opcional para enterrarlo en el suelo)
  gear(B, x, y, r, n, rot, cBody, cTooth, cHub, keep){
    const pts = [], step = 6.2832 / n;
    for(let i = 0; i < n; i++){ const a = rot + i * step; pts.push([x + Math.cos(a - step * .22) * r, y + Math.sin(a - step * .22) * r], [x + Math.cos(a - step * .13) * r * 1.28, y + Math.sin(a - step * .13) * r * 1.28], [x + Math.cos(a + step * .13) * r * 1.28, y + Math.sin(a + step * .13) * r * 1.28], [x + Math.cos(a + step * .22) * r, y + Math.sin(a + step * .22) * r], [x + Math.cos(a + step * .5) * r * .94, y + Math.sin(a + step * .5) * r * .94]); }
    ufPoly(B, pts, cTooth, 1, keep); ufDisc(B, x, y, r * .98, cBody, 1, keep); ufRing(B, x, y, r * .62, Math.max(1, r * .12), cTooth, {keep}); ufDisc(B, x, y, Math.max(1.5, r * .22), cHub, 1, keep);
    for(let i = 0; i < 3; i++) ufLine(B, x + Math.cos(rot + i * 2.0944) * r * .22, y + Math.sin(rot + i * 2.0944) * r * .22, x + Math.cos(rot + i * 2.0944) * r * .62, y + Math.sin(rot + i * 2.0944) * r * .62, 1, cTooth);
  },
  // llama: gota con balanceo (h = alto, w = ancho, s = fase de parpadeo)
  flame(B, x, y, w, h, s, c1, c2, c3){
    const sw = Math.sin(s) * w * .35, pts = [[x - w / 2, y], [x - w * .55, y - h * .35], [x - w * .2 + sw * .4, y - h * .75], [x + sw, y - h], [x + w * .2 + sw * .4, y - h * .7], [x + w * .55, y - h * .3], [x + w / 2, y]];
    ufPoly(B, pts, c1); ufPoly(B, pts.map(p => [x + (p[0] - x) * .62 + (p[1] < y - h * .5 ? sw * .25 : 0), y + (p[1] - y) * .74]), c2); ufPoly(B, pts.map(p => [x + (p[0] - x) * .3, y - 1 + (p[1] - y) * .46]), c3);
  },
  // letras de 3x5 para carteles
  font: {S: ['.xx', 'x..', '.x.', '..x', 'xx.'], A: ['.x.', 'x.x', 'xxx', 'x.x', 'x.x'], L: ['x..', 'x..', 'x..', 'x..', 'xxx'], I: ['xxx', '.x.', '.x.', '.x.', 'xxx'], D: ['xx.', 'x.x', 'x.x', 'x.x', 'xx.']},
  text(B, str, x, y, c){ for(let i = 0; i < str.length; i++){ const g = UA.font[str[i]]; if(!g) continue; for(let r = 0; r < 5; r++) for(let k = 0; k < 3; k++) if(g[r][k] === 'x') ufPx(B, x + i * 4 + k, y + r, c); } },
  // polígono de una pieza orientada: eje desde (x,y) con ángulo a, vista en perspectiva de suelo (ey = achatamiento vertical)
  bar(B, x, y, a, len, wid, ey, c, back){
    const ca = Math.cos(a), sa = Math.sin(a), px = -sa * wid, py = ca * wid * ey, b = back || 0, tx = x + ca * len, ty = y + sa * len * ey;
    ufPoly(B, [[x - ca * b + px, y - sa * b * ey + py], [x + ca * len * .72 + px, y + sa * len * .72 * ey + py], [tx, ty], [x + ca * len * .72 - px, y + sa * len * .72 * ey - py], [x - ca * b - px, y - sa * b * ey - py]], c);
  }
};

/* ---------- DIAL (aelith): la hora imposible. 13 numerales, dos agujas enormes que saltan 120 grados en cada pulso, engranajes que emergen del borde y un vidrio que se quiebra ---------- */
ufDefForm('dial', {N: 40, tall: 1.35, dur: 3400, gdur: 0, shake: 6,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, EY = .6, TAU = 6.2832, qp = [.17, .47, .77];
    const E = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r * EY];
    const jump = () => { let s = 0; for(const p of qp){ const k = ufC((q - p) / .05, 0, 1); s += k < 1 ? ufEase(k) * 1.12 - (k > .6 ? (k - .6) * .3 : 0) : 1; } return s; };
    const tr = ufC(q / .15, 0, 1), fade = ufC((q - .9) / .1, 0, 1), keep = ufKeep(fade);
    // anticipación: se trazan los trece numerales sobre el borde real
    for(let i = 0; i < 13; i++){
      if(i / 13 > tr + .02) break; const a = -1.5708 + i * TAU / 13, e = E(a, R * .97), big = i === 0, fl = qp.some(p => q > p && q < p + .06);
      ufDisc(Hd, e[0], e[1], big ? 3.2 : 2.4, fl ? P.c : big ? P.b : P.a, 1, keep); ufPx(Hd, e[0], e[1] - 1, P.c); ufLine(S, e[0], e[1], ...E(a, R * .8), 1, P.d);
      if(q < .15){ const t = E(a, R * 1.05); ufPx(S, t[0], t[1], P.e); }
    }
    if(q < .15){ const n = Math.floor(tr * 24); for(let i = 0; i < n; i++){ const a = -1.5708 + i * TAU / 24, e = E(a, R * .9); ufPx(S, e[0], e[1], P.d); } return; }
    // el vidrio: cuñas de cada salto (sectores tramados)
    qp.forEach((p, i) => { const k = ufC((q - p) / .16, 0, 1); if(k <= 0 || k >= 1) return; const a1 = -1.5708 + (i + 1) * 2.0944, pts = [E(0, 0)]; for(let s = 0; s <= 12; s++){ const a = a1 - 2.0944 + s / 12 * 2.0944 * ufEase(ufC(k * 2, 0, 1)); pts.push(E(a, R * .94)); } ufPoly(S, pts, i === 2 ? P.e : P.d, .5 * (1 - k)); });
    // engranajes verticales que emergen del borde (se entierran bajo la línea del suelo)
    [[-2.62, 1, .17, 0], [-.52, -1, .15, .04], [1.5708, 1, .13, .08]].forEach(([a, dir, rr, dl]) => {
      const g = ufEase(ufC((q - .1 - dl) / .1, 0, 1)); if(g <= 0) return; const e = E(a, R * 1.0), gr = R * rr, gy = e[1] + (a > 0 ? 2 : 0), cyy = gy - gr * .55 * g + (1 - g) * gr * 1.5;
      UA.gear(Hd, e[0], cyy, gr, 8, dir * q * 9, P.d, P.a, P.b, (px, py) => py <= gy + 1); if(g > .8) for(let i = 0; i < 4; i++){ const aa = dir * q * 9 + i * 1.5708; ufPx(Hd, e[0] + Math.cos(aa) * gr * 1.28, cyy + Math.sin(aa) * gr * 1.28, P.c); }
    });
    // agujas: la de minutos (larga, ámbar) y la de horas (corta, lavanda); saltan 120 y 40 grados
    const sj = jump(), am = -1.5708 + sj * 2.0944, ah = -1.5708 + sj * .6981, c0 = E(0, 0);
    const hand = (a, len, w, c1, c2) => { UA.bar(Hd, c0[0], c0[1], a, len, w + 1, EY, c1, R * .18); UA.bar(Hd, c0[0], c0[1], a, len, Math.max(1, w * .5), EY, c2, R * .1); const tp = E(a, len); ufDisc(Hd, tp[0], tp[1], w * 1.5 + 1, c1); ufPx(Hd, tp[0], tp[1], P.c); };
    if(q > .14){ hand(ah, R * .62, 2.5 + R / 24, P.a, P.e); hand(am, R * .95, 2 + R / 30, P.b, P.c); ufDisc(Hd, c0[0], c0[1], 3 + R / 26, P.d); ufDisc(Hd, c0[0], c0[1], 1.8 + R / 40, P.b); ufPx(Hd, c0[0], c0[1] - 1, P.c); }
    // tercer pulso: el vidrio se resquebraja (grietas blancas) y las esquirlas suben
    if(q > qp[2]){ const k = ufC((q - qp[2]) / .1, 0, 1), up = ufC((q - qp[2] - .06) / .17, 0, 1);
      for(let i = 0; i < 9; i++){ const a = i * .698 + ufH(i, 3) * .4; let px = c0[0], py = c0[1]; for(let s = 1; s <= 5; s++){ if(s / 5 > k) break; const aa = a + (ufH(i * 9 + s, 5) - .5) * .7, rr = R * .94 * s / 5, e = E(aa, rr); if(ufH(i, 21 + s) > fade) ufLine(Hd, px, py, e[0], e[1], 1, s & 1 ? P.c : P.b); px = e[0]; py = e[1]; } }
      for(let i = 0; i < 16; i++){ const a = ufH(i, 7) * TAU, r = R * (.2 + .75 * ufH(i, 8)), e = E(a, r), y = e[1] - up * R * (.5 + ufH(i, 9)), s = ufH(i, 10) > .5 ? 2 : 1.4; if(up > 0 && ufH(i, 11) > up * .8){ ufPoly(Hd, [[e[0], y - s * 2], [e[0] + s, y + s], [e[0] - s * 1.2, y + s * .6]], i & 1 ? P.c : P.b); } } }
    // arena en suspensión
    for(let i = 0; i < 26; i++){ const a = ufH(i, 31) * TAU, r = R * Math.sqrt(ufH(i, 32)), u = (ufH(i, 33) + q * 1.3) % 1, e = E(a, r); if(q > .17 && ufH(i, 34) > fade) ufPx(S, e[0], e[1] - u * R * .5, u < .7 ? P.e : P.b); }
  }});

/* ---------- CATEDRAL (aurelia): tres pilares en los vértices del triángulo, arcos ojivales y un rosetón de vitral que gira ---------- */
ufDefForm('cathedral', {N: 40, tall: 1.75, dur: 3600, gdur: 0, shake: 6,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, EY = .55, ph = ufC(q / .14, 0, 1), up = ufEase(ufC((q - .14) / .17, 0, 1)), dis = ufC((q - .72) / .28, 0, 1), keep = ufKeep(dis * .9);
    const V = [[-.74, .42], [.74, .42], [0, -.52]].map(([x, y]) => [cx + x * R, cy + y * R * EY / .55 * .75]);   // izquierda, derecha y fondo
    if(q < .14){
      ufEdgeMarks(S, o, 12, 'diamond', P.b, .1);
      for(let i = 0; i < 3; i++){ const a = V[i], b = V[(i + 1) % 3]; for(let t = 0; t < ph * 14; t++){ const u = t / 14; ufPx(S, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, P.c); } ufDisc(Hd, a[0], a[1], 2 + ph * 2, P.a); ufPx(Hd, a[0], a[1], P.c); }
      return;
    }
    // el suelo del triángulo se llena de luz (tramado) y late con los pulsos
    const beat = .5 + .5 * Math.sin(q * 28), flo = ufPoly; flo(S, V, P.b, (.12 + .1 * beat) * (1 - dis));
    // pilares (los de atrás primero)
    const order = [2, 0, 1], H = [R * 1.42, R * 1.42, R * 1.42];
    const top = i => [V[i][0], V[i][1] - H[i] * up * (1 - ufIn(dis))];
    for(const i of order){
      const [x, y] = V[i], t = top(i), w = Math.max(3, R * .11), hh = y - t[1]; if(hh < 3) continue;
      ufEll(S, x, y, w * 1.8, w * .6, P.d, .6);
      ufPoly(Hd, [[x - w, y], [x - w, t[1] + w], [x, t[1] - w * .9], [x + w, t[1] + w], [x + w, y]], P.a, 1, keep);
      ufPoly(Hd, [[x - w * .35, y - 1], [x - w * .35, t[1] + w * 1.3], [x, t[1] - w * .1], [x + w * .1, t[1] + w * 1.3], [x + w * .1, y - 1]], P.b, 1, keep);
      ufLine(Hd, x + w * .55, y - 1, x + w * .55, t[1] + w, 1, P.d);
      for(let yy = y - 6; yy > t[1] + w * 2; yy -= 7) ufLine(Hd, x - w, yy, x + w, yy, 1, P.d);
      ufDisc(Hd, x, t[1] - w * 1.1, 1.6, P.c);
    }
    // arcos ojivales entre los pilares: dos arcos de círculo que se cruzan en la clave
    const arch = (i, j, rise) => { const A = top(i), B = top(j), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 - rise * up, n = 14;
      for(let s = 0; s <= n; s++){ const u = s / n, x = A[0] + (B[0] - A[0]) * u, y = A[1] + (B[1] - A[1]) * u - Math.sin(u * 3.1416) * rise * up * (1 - Math.abs(u - .5) * .55); if(ufH(s, i * 3 + j) < dis) continue; ufDisc(Hd, x, y, 1.5, P.a); ufPx(Hd, x, y - 1, P.b); } };
    if(up > .55){ arch(0, 2, R * .34); arch(2, 1, R * .34); arch(0, 1, R * .42); }
    // rosetón: rueda de 12 cuñas de vitral (cian y magenta), rayos y corona, sobre el centro del triángulo
    const rc = [cx, cy - R * 1.12 * up], rr = R * .33 * ufEase(ufC((q - .26) / .16, 0, 1)) * (1 - dis * .4);
    if(rr > 2){
      const spin = q * 6 + (dis > 0 ? dis * 3 : 0), wedge = 12;
      for(let i = 0; i < wedge; i++){ const a0 = spin + i * TAU / wedge, a1 = a0 + TAU / wedge * (1 - dis * .5), col = i % 3 === 0 ? P.e : i % 3 === 1 ? P.f : P.b, gap = dis * R * .35 * ufH(i, 5), dx = Math.cos(a0 + .26) * gap, dy = Math.sin(a0 + .26) * gap + dis * dis * R * .6;
        ufPoly(Hd, [[rc[0] + dx, rc[1] + dy], [rc[0] + dx + Math.cos(a0) * rr, rc[1] + dy + Math.sin(a0) * rr], [rc[0] + dx + Math.cos((a0 + a1) / 2) * rr * 1.04, rc[1] + dy + Math.sin((a0 + a1) / 2) * rr * 1.04], [rc[0] + dx + Math.cos(a1) * rr, rc[1] + dy + Math.sin(a1) * rr]], col, 1, ufKeep(dis * .7, i)); }
      ufRing(Hd, rc[0], rc[1], rr, 2, P.a, {keep}); ufRing(Hd, rc[0], rc[1], rr * .38, 1, P.c, {keep}); ufDisc(Hd, rc[0], rc[1], rr * .2, P.c);
      for(let i = 0; i < 12; i++){ const a = spin * .6 + i * TAU / 12, pulse = (q * 28 + i * .5) % 6.28 < 1.4 ? 1.55 : 1.2; if(ufH(i, 9) > dis) ufLine(S, rc[0] + Math.cos(a) * rr * 1.1, rc[1] + Math.sin(a) * rr * 1.1, rc[0] + Math.cos(a) * rr * pulse * 1.35, rc[1] + Math.sin(a) * rr * pulse * 1.35, 1, i & 1 ? P.b : P.c); }
      // pulso de luz hacia el suelo: rayos desde el rosetón a cada vértice
      if(beat > .92 && dis < .5) for(const v of V) ufLine(S, rc[0], rc[1] + rr * .8, v[0], v[1] - H[0] * .3, 1, P.c, .6);
    }
    // el vidrio de luz asciende al final
    if(dis > 0) for(let i = 0; i < 22; i++){ const x = cx + (ufH(i, 1) - .5) * R * 1.8, y = cy - ufH(i, 2) * R * .6 - dis * R * (.8 + ufH(i, 3)); if(ufH(i, 4) > dis * .95) ufPx(S, x, y, i & 1 ? P.c : P.b); }
  }});

/* ---------- VENTANA (axiom): un diálogo de sistema gigante se abre por trazos, congela, parpadea, implosiona en bloques y estalla ---------- */
ufDefForm('window', {N: 44, tall: 1.15, dur: 4400, gdur: 0, shake: 9,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, T = q * 4400;
    const op = ufC(q / .09, 0, 1), flick = q > .74 && q < .85, imp = ufEase(ufC((q - .85) / .05, 0, 1)), blast = ufC((q - .9) / .1, 0, 1);
    const W = R * 1.7, Hh = R * 1.1, k = 1 - imp, wx = cx - W / 2 * k, wy = cy - R * .08 - Hh * k, ww = W * k, wh = Hh * k, tb = Math.max(5, R * .17) * k;
    const sq = (x, y, w, h, c) => ufPoly(Hd, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], c);
    if(q < .09){ ufEdgeMarks(S, o, 12, 'cross', P.a, .1); const per = 2 * (W + Hh), len = per * op;   // el contorno se traza por trazos
      for(let s = 0; s < len; s += 2){ let d = s, x, y; if(d < W){ x = cx - W / 2 + d; y = wy; } else if((d -= W) < Hh){ x = cx + W / 2; y = wy + d; } else if((d -= Hh) < W){ x = cx + W / 2 - d; y = wy + Hh; } else { d -= W; x = cx - W / 2; y = wy + Hh - d; } ufPx(Hd, x, y, P.b); ufPx(Hd, x + 1, y, P.e); }
      return; }
    if(imp < 1 && !(flick && ((f >> 1) & 1))){
      const sh = q > .8 ? ((f & 1) ? 1 : -1) : 0;            // desplazamiento RGB: cian y magenta a los lados
      sq(wx - 2 - sh, wy, ww, wh, P.e); sq(wx + 2 + sh, wy, ww, wh, P.b);
      sq(wx, wy, ww, wh, P.d);
      sq(wx, wy, ww, tb, P.a); sq(wx + ww - tb * 1.3, wy + 1, tb * 1.3 - 1, tb - 2, P.e);       // barra de título y botón X
      ufLine(Hd, wx + ww - tb * 1.1, wy + tb * .3, wx + ww - tb * .25, wy + tb * .75, 1, P.c); ufLine(Hd, wx + ww - tb * .25, wy + tb * .3, wx + ww - tb * 1.1, wy + tb * .75, 1, P.c);
      for(let i = 0; i < 5; i++) sq(wx + 3 + i * 4, wy + tb * .35, 3, Math.max(1, tb * .3), P.c);
      // cuerpo: icono de advertencia, líneas de texto y barra de progreso (la cuenta atrás hasta el golpe)
      const bx = wx + ww * .08, by = wy + tb + wh * .12;
      ufPoly(Hd, [[bx + 5, by], [bx + 10, by + 9], [bx, by + 9]], P.c); ufPx(Hd, bx + 5, by + 4, P.d); ufPx(Hd, bx + 5, by + 6, P.d);
      for(let i = 0; i < 3; i++) sq(bx + 14, by + 1 + i * 4, ww * (.5 - i * .1) * (i === 2 ? .8 : 1), 2, i === 0 ? P.b : P.a);
      const pbx = wx + ww * .08, pby = wy + wh - wh * .24, pw = ww * .84, pr = ufC((q - .09) / .7, 0, 1);
      sq(pbx, pby, pw, Math.max(3, wh * .1), P.o); sq(pbx + 1, pby + 1, Math.max(0, (pw - 2) * pr), Math.max(1, wh * .1 - 2), pr > .9 ? P.e : P.b);
      if(((f >> 2) & 1) === 0) sq(bx + 14 + ww * .1, by + 14, 2, 4, P.c);       // cursor
      // barrido de scanline
      const sy = wy + ((q * 3.4) % 1) * wh; for(let x = wx; x < wx + ww; x += 2) ufPx(Hd, x, sy, P.a);
      for(let y = wy + tb; y < wy + wh; y += 3) for(let x = wx + ((y >> 1) & 1); x < wx + ww; x += 4) if((y + x) % 7 === 0) ufPx(Hd, x, y, P.o);
    }
    // bloques que se desprenden durante el parpadeo
    if(q > .7 && q < .88) for(let i = 0; i < 8; i++){ const x = wx + ufH(i, 1) * ww, y = wy + ufH(i, 2) * wh; if(ufH(i, f >> 2) > .5) sq(x, y, 4, 4, i & 1 ? P.b : P.e); }
    // implosión a un punto y estallido de bloques con un anillo cuadrado
    if(imp > 0 && imp < 1) for(let i = 0; i < 14; i++){ const a = ufH(i, 4) * 6.28, d = (1 - imp) * R * .9; sq(cx + Math.cos(a) * d, cy - R * .6 + Math.sin(a) * d * .6, 3, 3, i & 1 ? P.b : P.e); }
    if(blast > 0){ const e = ufEase(blast), rr = R * e * .98, fadeb = ufC((blast - .55) / .45, 0, 1);
      for(let i = 0; i < 44; i++){ const a = ufH(i, 7) * 6.28, d = rr * (.35 + .65 * ufH(i, 8)), s = ufH(i, 9) > .6 ? 4 : 3; if(ufH(i, 10) > fadeb) sq(cx + Math.cos(a) * d - s / 2, cy - R * .5 + Math.sin(a) * d * .55 - s / 2, s, s, i % 3 === 0 ? P.c : i % 3 === 1 ? P.b : P.e); }
      for(let s = 0; s < 4; s++){ const half = rr; for(let t = -half; t <= half; t += 3){ const hh = ufH(Math.round(t), s + 40); if(hh < fadeb) continue; const xx = s < 2 ? t : (s === 2 ? -half : half), yy = s < 2 ? (s ? half : -half) : t; ufPx(S, cx + xx, cy - R * .5 + yy * .55, s & 1 ? P.b : P.e); } }
      if(blast < .25) sq(cx - 4, cy - R * .6 - 4, 8, 8, P.c); }
  }});

/* ---------- CAMPANA (baltra): una campana colosal de bronce baja entre cadenas y toca tres veces; cada tañido expulsa una onda de agua con huecos ---------- */
ufDefForm('bell', {N: 36, tall: 1.95, dur: 3000, gdur: 0, shake: 7,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, EY = .5, tolls = [.3, .52, .74];
    const desc = ufEase(ufC(q / .2, 0, 1)), rise = ufC((q - .86) / .14, 0, 1), by = cy - R * (1.5 - .95 * desc + rise * 1.2);   // y del labio de la campana
    let sw = 0; tolls.forEach((t, i) => { const k = ufC((q - t) / .12, 0, 1); if(k > 0 && k < 1) sw += Math.sin(k * 9) * (1 - k) * (i === 2 ? .3 : .22); }); if(q < .22) sw = Math.sin(q * 30) * .05 * desc;
    const bw = R * .5, bh = R * .6, ax = cx, ay = cy - R * 2.1;                   // ancla de la cadena (arriba, fuera de la tira)
    const px = (x, y) => [ax + (x - ax) * Math.cos(sw) - (y - ay) * Math.sin(sw), ay + (x - ax) * Math.sin(sw) + (y - ay) * Math.cos(sw)];   // gira alrededor del ancla
    if(q < .2){ ufEdgeMarks(S, o, 10, 'dot', P.e, .2, 1); }
    // cadena con eslabones
    const cyTop = by - bh; for(let y = ay; y < cyTop; y += 4){ const p = px(cx, y); ufDisc(Hd, p[0], p[1], 1.6, ((y - ay) >> 2) & 1 ? P.d : P.a); }
    // cuerpo de la campana: cúpula, falda acampanada, labio y badajo
    const prof = [], N = 14; for(let i = 0; i <= N; i++){ const u = i / N, w = bw * (.42 + .58 * Math.pow(u, 1.8)) * (u > .93 ? 1.1 : 1); prof.push([w, cyTop + bh * u]); }
    const L1 = prof.map(p => px(cx - p[0], p[1])), R1 = prof.map(p => px(cx + p[0], p[1]));
    ufPoly(Hd, L1.concat(R1.slice().reverse()), P.a);
    ufPoly(Hd, L1.map((p, i) => px(cx - prof[i][0] * .6, prof[i][1])).concat(L1.map((p, i) => px(cx - prof[i][0] * .15, prof[i][1])).reverse()), P.b);
    ufPoly(Hd, R1.map((p, i) => px(cx + prof[i][0] * .55, prof[i][1])).concat(R1.map((p, i) => px(cx + prof[i][0] * 1.0, prof[i][1])).reverse()), P.d);
    for(let i = 2; i <= 3; i++){ const y = cyTop + bh * (.3 + i * .22); ufLine(Hd, px(cx - bw * .75, y)[0], px(cx - bw * .75, y)[1], px(cx + bw * .75, y)[0], px(cx + bw * .75, y)[1], 1, P.d); }
    const lip = px(cx, by), lw = bw * 1.12; ufLine(Hd, px(cx - lw, by)[0], px(cx - lw, by)[1], px(cx + lw, by)[0], px(cx + lw, by)[1], 2, P.b);
    for(let i = 0; i < 4; i++){ const p = px(cx - bw * .6 + i * bw * .4, cyTop + bh * .2); ufPx(Hd, p[0], p[1], i & 1 ? P.e : P.c); }   // remaches
    const clap = px(cx + Math.sin(sw * 3) * bw * .2, by + 3 + R * .06); ufDisc(Hd, clap[0], clap[1], 2.2, P.d); ufPx(Hd, clap[0] - 1, clap[1] - 1, P.c);
    // algas que cuelgan y burbujas
    for(let i = 0; i < 4; i++){ const x0 = cx - bw * .7 + i * bw * .47; let ox = x0, oy = by - 2; for(let s = 0; s < 6; s++){ const nx = x0 + Math.sin(s * .9 + f * .25 + i) * 2.2, ny = oy + 3; ufLine(Hd, ox, oy, nx, ny, 1, P.e); ox = nx; oy = ny; } }
    for(let i = 0; i < 10; i++){ const u = (ufH(i, 3) + q * 1.6) % 1; if(q > .2) ufDisc(S, cx + (ufH(i, 4) - .5) * R * 1.6, cy - u * R * 1.2, 1.2, P.c); }
    // tañidos: tres ondas elípticas con huecos, con ondulación; la tercera con cresta
    tolls.forEach((t, i) => { const k = ufC((q - t) / .3, 0, 1); if(k <= 0) return; const e = ufEase(k), rr = R * (i === 0 ? .6 : i === 1 ? .82 : 1) * e, fd = ufC((k - .55) / .45, 0, 1);
      for(let s = 0; s < 70; s++){ const a = s / 70 * TAU; if(((s + i * 3) % 7) < 2) continue; if(ufH(s, i + 90) < fd) continue; const wob = 1 + Math.sin(a * 6 + f * .5 + i) * .035, x = cx + Math.cos(a) * rr * wob, y = cy + Math.sin(a) * rr * wob * EY;
        const crest = i === 2 && Math.sin(a) > 0 ? 2 : 1; ufDisc(Hd, x, y, crest > 1 ? 1.7 : 1.1, i === 2 ? P.c : P.e); if(crest > 1 && s % 2) ufPx(Hd, x, y - 2, P.c); }
      if(k < .25) ufEll(S, cx, cy, R * .5 * (k / .25), R * .25 * (k / .25), P.e, .4); });
  }});

/* ---------- PENTAGRAMA (dariel): un pentagrama ondulado cruza el área con notas que saltan, un reflector cae y al final se enciende la puerta de SALIDA ---------- */
ufDefForm('staff', {N: 40, tall: 1.5, dur: 3800, gdur: 0, shake: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, Wd = R * 1.9, x0 = cx - Wd / 2, base = cy - R * .32, gap = Math.max(2, R * .07);
    const open = ufEase(ufC(q / .14, 0, 1)), dis = ufC((q - .86) / .14, 0, 1), beat = i => (i + .5) / 6;
    const wy = (x, ln) => base + (ln - 2) * gap + Math.sin((x - x0) / Wd * 6.2 + q * 7) * R * .1 * open;
    if(q < .14) ufEdgeMarks(S, o, 12, 'tick', P.b, .1);
    // reflector: cono de luz desde arriba hasta el pentagrama
    const lt = ufC((q - .08) / .1, 0, 1); if(lt > 0 && dis < .9) ufPoly(S, [[cx - 3, cy - R * 1.45], [cx + 3, cy - R * 1.45], [cx + R * .5 * lt, base + gap * 3], [cx - R * .5 * lt, base + gap * 3]], P.b, .16 * (1 - dis));
    // cinco líneas del pentagrama (se despliegan desde el centro hacia los lados)
    for(let ln = 0; ln < 5; ln++){ const half = Wd / 2 * open; for(let x = cx - half; x <= cx + half; x += 1){ if(ufH(Math.round(x), ln + 5) < dis) continue; ufPx(Hd, x, wy(x, ln), ln === 2 ? P.b : P.a); if(((x | 0) + ln) % 5 === 0) ufPx(Hd, x, wy(x, ln) + 1, P.d); } }
    ufLine(Hd, x0, wy(x0, 0), x0, wy(x0, 4), 2, P.b);                          // línea de compás inicial
    // seis compases: líneas divisorias que se encienden al pulso
    for(let i = 1; i < 6; i++){ const x = x0 + Wd * i / 6, hit = q > beat(i - 1) && q < beat(i - 1) + .05; if(open > .98) ufLine(Hd, x, wy(x, 0), x, wy(x, 4), 1, hit ? P.c : P.d); }
    // notas: una por compás, la de daño (vino) o la de cura (oro); suben, se encienden y estallan en brillos
    if(q > .12) for(let i = 0; i < 6; i++){
      const nx = x0 + Wd * (i + .5) / 6, k = ufC((q - beat(i) + .06) / .12, 0, 1), landed = q >= beat(i) - .03, drop = (1 - ufEase(k)) * R * .6, ny = wy(nx, i % 4 + 0.5) - drop - (q > beat(i) ? Math.sin(ufC((q - beat(i)) / .1, 0, 1) * 3.14) * R * .18 : 0), dmg = i % 2 === 0, c1 = dmg ? P.d : P.a, c2 = dmg ? P.e : P.b;
      if(k <= 0 || ufH(i, 5) < dis) continue;
      ufEll(Hd, nx, ny, 3.2, 2.3, c1); ufPx(Hd, nx - 1, ny - 1, c2); ufLine(Hd, nx + 3, ny, nx + 3, ny - 11, 1, c1); if(i % 2) { ufLine(Hd, nx + 3, ny - 11, nx + 7, ny - 7, 1, c1); ufLine(Hd, nx + 3, ny - 9, nx + 7, ny - 5, 1, c1); }
      const pk = ufC((q - beat(i)) / .12, 0, 1); if(landed && pk < 1) for(let s = 0; s < 8; s++){ const a = s * .7854 + .2; ufPx(S, nx + Math.cos(a) * (3 + pk * R * .22), ny + Math.sin(a) * (3 + pk * R * .22), dmg ? P.e : P.c); }
    }
    // puerta de salida: marco, hoja que se abre con luz y cartel SALIDA
    const dk = ufEase(ufC((q - .68) / .14, 0, 1));
    if(dk > 0){ const dx = x0 + Wd + 2 - R * .2, dw = R * .26, dh = R * .55, dy = cy; const fl = ((f >> 2) & 1) ? P.c : P.b;
      ufPoly(Hd, [[dx - dw, dy], [dx - dw, dy - dh], [dx + dw, dy - dh], [dx + dw, dy]], P.d);
      ufPoly(S, [[dx - dw * .7, dy], [dx - dw * .7, dy - dh + 3], [dx + dw * .7, dy - dh + 3], [dx + dw * .7, dy]], P.c, 1);
      const open2 = dw * 1.4 * dk; ufPoly(Hd, [[dx - dw * .7, dy], [dx - dw * .7 + open2 * .45, dy - 3], [dx - dw * .7 + open2 * .45, dy - dh + 5], [dx - dw * .7, dy - dh + 3]], P.o);
      ufPoly(S, [[dx, dy - 2], [dx + R * .8 * dk, dy + gap * 3], [dx + R * .8 * dk, dy - gap * 2]], P.b, .3);
      const sx = dx - dw, sy = dy - dh - 8; ufPoly(Hd, [[sx, sy], [sx + dw * 2, sy], [sx + dw * 2, sy + 7], [sx, sy + 7]], fl); if(R >= 36) UA.text(Hd, 'SALIDA', sx + 1, sy + 1, P.d); else { ufLine(Hd, sx + 3, sy + 3, sx + dw * 2 - 3, sy + 3, 1, P.d); ufPx(Hd, sx + dw * 2 - 4, sy + 2, P.d); } }
    // telón vino a los lados que cierra al final
    if(dis > 0.05){ const cw = Wd * .5 * dis; ufPoly(Hd, [[x0, base - R * .5], [x0 + cw, base - R * .5], [x0 + cw, base + R * .5], [x0, base + R * .5]], P.d, .5); ufPoly(Hd, [[x0 + Wd, base - R * .5], [x0 + Wd - cw, base - R * .5], [x0 + Wd - cw, base + R * .5], [x0 + Wd, base + R * .5]], P.d, .5); }
  }});

/* ---------- FAROLES (farolero): siete faroles de llama giran alrededor, un farol grande arriba y gotas de luz que salen en cada pulso ---------- */
ufDefForm('lanterns', {N: 40, tall: 1.65, dur: 3600, gdur: 0, shake: 3,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, EY = .5, pulse = i => .2 + i * .15, on = ufEase(ufC(q / .14, 0, 1)), die = ufC((q - .8) / .2, 0, 1);
    const surge = (() => { let s = 0; for(let i = 0; i < 5; i++){ const k = (q - pulse(i)) / .06; if(k > 0 && k < 1) s = Math.max(s, Math.sin(k * 3.14)); } return s; })();
    if(q < .14) ufEdgeMarks(S, o, 7, 'spark', P.e, 0, 1);
    const sp = [], N7 = 7;
    for(let i = 0; i < N7; i++){ const ap = ufC(on * N7 - i, 0, 1); if(ap <= 0) continue; const a = i * TAU / N7 + q * 3.8 - 1.57, x = cx + Math.cos(a) * R * .96, y = cy + Math.sin(a) * R * .96 * EY - R * .22; sp.push({i, x, y, ap, z: Math.sin(a)}); }
    sp.sort((p, r) => p.z - r.z);
    // filamentos de luz entre faroles vecinos (tramado)
    for(let k = 0; k < sp.length; k++){ const A = sp[k]; for(const B of sp) if(B.i === (A.i + 1) % N7){ for(let t = 1; t < 12; t++){ const u = t / 12; if(ufDith(t, A.i, .45 * (1 - die))) ufPx(S, A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u + Math.sin(u * 3.14) * 3, P.a); } } }
    for(const p of sp){
      const out = ufC(die * 8 - p.i, 0, 1), fl = (1 - out) * (1 + surge * .7), h = 8 + R * .09, w = 4.2;
      ufEll(S, p.x, p.y - 4, R * .25 * p.ap * (1 - die * .7), R * .17 * p.ap * (1 - die * .7), P.a, .22);
      ufPoly(Hd, [[p.x - w / 2, p.y - h * .6], [p.x + w / 2, p.y - h * .6], [p.x + w * .7, p.y - h * .1], [p.x - w * .7, p.y - h * .1]], P.d);    // vidrio
      ufPoly(Hd, [[p.x - w * .2, p.y - h * .55], [p.x + w * .2, p.y - h * .55], [p.x + w * .45, p.y - h * .15], [p.x - w * .45, p.y - h * .15]], P.b);
      ufPoly(Hd, [[p.x - w * .8, p.y - h * .1], [p.x + w * .8, p.y - h * .1], [p.x + w * .6, p.y + 1], [p.x - w * .6, p.y + 1]], P.a);          // base
      ufPoly(Hd, [[p.x - w * .9, p.y - h * .6], [p.x + w * .9, p.y - h * .6], [p.x, p.y - h * .95]], P.a); ufLine(Hd, p.x, p.y - h * .95, p.x, p.y - h * 1.15, 1, P.a);   // tapa y asa
      if(fl > .05) UA.flame(Hd, p.x, p.y - h * .15, 3.4 * fl, (4 + 3 * surge) * (fl + .2) + 1, f * .9 + p.i, P.e, P.b, P.c);
      if(out > 0 && out < 1) for(let s = 0; s < 3; s++) ufPx(S, p.x + Math.sin(f * .4 + s) * 2, p.y - h - s * 3 - out * 6, P.d);
    }
    // farol grande sobre el centro
    const cyL = cy - R * (.95 + .08 * Math.sin(q * 9)), big = R * .22 * on * (1 - die * .8);
    if(big > 2){ ufEll(S, cx, cyL, big * 2.1, big * 1.5, P.a, .18 * (1 - die)); ufPoly(S, [[cx - 2, cyL + big], [cx + 2, cyL + big], [cx + R * .6, cy + 2], [cx - R * .6, cy + 2]], P.b, .12 * (1 - die));
      ufLine(Hd, cx, cyL - big * 1.9, cx, cyL - big * 1.1, 1, P.d);
      ufPoly(Hd, [[cx - big * .8, cyL - big], [cx + big * .8, cyL - big], [cx, cyL - big * 1.5]], P.a);
      ufPoly(Hd, [[cx - big * .75, cyL - big * .9], [cx + big * .75, cyL - big * .9], [cx + big, cyL + big * .6], [cx - big, cyL + big * .6]], P.d);
      ufPoly(Hd, [[cx - big * .5, cyL - big * .7], [cx + big * .5, cyL - big * .7], [cx + big * .7, cyL + big * .45], [cx - big * .7, cyL + big * .45]], P.b);
      ufPoly(Hd, [[cx - big, cyL + big * .6], [cx + big, cyL + big * .6], [cx + big * .75, cyL + big * .9], [cx - big * .75, cyL + big * .9]], P.a);
      UA.flame(Hd, cx, cyL + big * .45, big * 1, big * 1.5 * (1 + surge * .5) * (1 - die * .7), f * .7, P.e, P.b, P.c);
      // polillas pequeñas que giran en torno al farol grande
      for(let m = 0; m < 5; m++){ const a = q * 11 + m * 1.26, mx = cx + Math.cos(a) * big * 2.1, my = cyL + Math.sin(a * 1.3) * big * 1.2; ufPx(Hd, mx, my, P.c); ufPx(Hd, mx - 1, my - ((f + m) & 1), P.b); ufPx(Hd, mx + 1, my - ((f + m) & 1), P.b); } }
    // gotas de luz que salen de los faroles hacia el centro en cada pulso
    for(let i = 0; i < 5; i++){ const k = (q - pulse(i) - .02) / .12; if(k <= 0 || k >= 1) continue; for(const p of sp){ if((p.i + i) % 2) continue; const e = ufEase(k), gx = p.x + (cx - p.x) * e, gy = p.y + (cy - R * .15 - p.y) * e - Math.sin(e * 3.14) * R * .25; ufDisc(Hd, gx, gy, 1.6 * (1 - k * .5), P.c); ufPx(S, gx - (cx - p.x) * .08, gy + 1, P.b); } }
  }});

/* ---------- RED DE VENENO (guerrero): el rombo de trampa marca el área, tres cortes en cruz, una nube tóxica y hilos verdes que saltan entre los vecinos ---------- */
ufDefForm('toxin', {N: 36, tall: 1.4, dur: 3400, gdur: 0, shake: 6,
  paint(L, o){
    const {P, R, cx, cy, q, f} = o, S = L.soft, Hd = L.hard, TAU = 6.2832, EY = .55, qs = .58, post = ufC((q - qs) / (1 - qs), 0, 1), k = ufC((q - qs) / .08, 0, 1);
    const nodes = [0, 1, 2].map(i => { const a = -1.9 + i * 2.2 + ufH(i, 11) * .5, d = R * (.78 + .2 * ufH(i, 12)); return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * EY]; });
    const dia = (x, y, s, c1, c2) => { ufPoly(Hd, [[x, y - s], [x + s * .8, y], [x, y + s], [x - s * .8, y]], c1); ufPx(Hd, x, y, c2); };
    // anticipación larga: humo violeta que sube y la zona marcada con rombos de trampa de cuatro puntas
    if(q < qs){
      const a = ufC(q / .2, 0, 1); for(let i = 0; i < 3; i++){ const e = nodes[i]; if(ufC(a * 3 - i, 0, 1) > 0){ dia(e[0], e[1], 3 + (q * 20 % 2), P.a, P.b); ufPx(S, e[0], e[1] + 5, P.d); } }
      ufEdgeMarks(S, o, 14, 'diamond', P.a, .1, 1);
      for(let i = 0; i < 12; i++){ const u = (ufH(i, 3) + q * 1.4) % 1, x = cx + (ufH(i, 4) - .5) * R * .6 + Math.sin(u * 7 + i) * 3, y = cy - u * R * .9; ufDisc(S, x, y, 2.5 * (1 - u * .5), P.d, .6); }
      // marca de objetivo: rombo central que late
      dia(cx, cy, 4 + Math.sin(q * 40) * 1.2, P.o, P.b); ufLine(Hd, cx - 7, cy, cx + 7, cy, 1, P.b); ufLine(Hd, cx, cy - 5, cx, cy + 5, 1, P.b);
      return;
    }
    // tres cortes en cruz (asterisco): blanco con borde rojo
    if(post < .3) for(let i = 0; i < 3; i++){ const an = -.35 + i * 1.0472, ca = Math.cos(an), sa = Math.sin(an), len = R * .95 * ufEase(k) * (1 - post * 2.2), w = 2 - post * 4;
      if(len < 2) continue; ufLine(Hd, cx - ca * len, cy - R * .25 - sa * len * .8, cx + ca * len, cy - R * .25 + sa * len * .8, 3, P.e); ufLine(Hd, cx - ca * len, cy - R * .25 - sa * len * .8, cx + ca * len, cy - R * .25 + sa * len * .8, 1, P.c); }
    // nube tóxica: racimo de volutas verdes tramadas que sube y se abre
    const cl = ufEase(ufC((q - qs) / .22, 0, 1)) * 1.5, fd = ufC((post - .6) / .4, 0, 1);
    for(let i = 0; i < 11; i++){ const a = ufH(i, 21) * TAU, d = ufH(i, 22) * R * .55 * cl, r = R * (.14 + .11 * ufH(i, 23)) * cl, x = cx + Math.cos(a) * d, y = cy - R * .2 - post * R * .35 + Math.sin(a) * d * .55 - Math.abs(Math.sin(i)) * 6 * cl;
      ufDisc(S, x, y, r, P.d, .7 * (1 - fd)); ufDisc(S, x - r * .15, y - r * .2, r * .72, P.b, (.42 - post * .3) * (1 - fd)); if(r > 3 && ufH(i, 24) > fd) ufRing(Hd, x, y, r, 1, P.a, {a0: 3.5, a1: 2.4, keep: ufKeep(fd)}); }
    // hilos de veneno: del centro a cada vecino, zigzag que se corta; nodos con rombo y gota
    nodes.forEach((e, i) => { const t = ufEase(ufC((q - qs - .03 - i * .04) / .1, 0, 1)); if(t <= 0) return; let px = cx, py = cy - R * .2; const n = 9;
      for(let s = 1; s <= n; s++){ if(s / n > t) break; const u = s / n, x = cx + (e[0] - cx) * u + (s < n ? (ufH(i * 9 + s, 3) - .5) * 7 : 0), y = cy - R * .2 + (e[1] - cy + R * .2) * u + (s < n ? (ufH(i * 9 + s, 4) - .5) * 5 : 0); if(ufH(s, i + 60) > fd * 1.1) ufLine(Hd, px, py, x, y, 1, s & 1 ? P.b : P.a); px = x; py = y; }
      if(t >= 1 && fd < .8){ dia(e[0], e[1], 4, P.a, P.c); ufPx(Hd, e[0], e[1] - 5 - (f % 3), P.b); const drip = ((f + i * 3) % 9); ufPx(Hd, e[0], e[1] + 5 + drip, P.b); ufPx(Hd, e[0] + 1, e[1] + 5 + drip, P.b); } });
    // gotas y chispas rojas
    for(let i = 0; i < 16; i++){ const a = ufH(i, 31) * TAU, d = R * (.1 + .7 * ufH(i, 32)) * cl, u = (ufH(i, 33) + post * 1.5) % 1; if(ufH(i, 34) > fd) ufPx(S, cx + Math.cos(a) * d, cy - R * .2 + Math.sin(a) * d * .5 + u * 8, i % 3 ? P.b : P.e); }
  }});
