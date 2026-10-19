'use strict';
/* js/champions/ult-forms/forms-2.js — formas de definitiva (parte 2): portal, rayo ramificado, haz giratorio, grieta con ladrillos, embudo,
   lluvia de flechas, telón de teatro y estandarte. Ver kit.js para el contrato de paint(L, o). Solo visual. */

/* ---------- PORTAL: una puerta vertical de remolino que se abre, aspira hacia adentro y se cierra con un destello ---------- */
ufDefForm('portal', {N: 24, tall: 1.5, dur: 1900, gdur: 2400, shake: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .2){ ufEdgeMarks(S, o, 12, 'spark', P.b, .1); ufLine(S, cx, cy - R * .75 * ph.ant, cx, cy, 1, P.c); return; }
    const open = ufEase(ufC((q - .18) / .14, 0, 1)), clos = ufC((q - .66) / .22, 0, 1), ow = open * (1 - ufIn(clos)), pcy = cy - R * .8, rx = R * .36 * ow, ry = R * .8 * (1 - clos * .15);
    if(rx > 1.5){
      for(let y = -ry; y <= ry; y++) for(let x = -rx; x <= rx; x++){ const nx = x / rx, ny = y / ry, r = Math.hypot(nx, ny); if(r > 1) continue; const a = Math.atan2(ny, nx), v = Math.sin(a * 3 + r * 9 - f * .55), gx = cx + x, gy = pcy + y;
        ufPx(S, gx, gy, r < .16 ? P.c : v > .62 ? P.b : v > .05 ? P.a : P.d); }
      ufRing(Hd, cx, pcy, 1, 3, P.a, {rx: rx + 2, ry: ry + 2}); ufRing(Hd, cx, pcy, 1, 1, P.b, {rx: rx - 1, ry: ry - 1});
      for(let i = 0; i < 10; i++){ const a = i * .6283 + q * 3, x = cx + Math.cos(a) * (rx + 3), y = pcy + Math.sin(a) * (ry + 3); if(Math.sin(a * 2 + f) > -.3) { ufDisc(Hd, x, y, 1.6, i & 1 ? P.c : P.e); } }
    }
    ufEll(S, cx, cy, R * .5 * ow + 1, R * .13 * ow + 1, P.d, .6);
    // aspiración: trazos que entran desde el borde real hacia la puerta
    if(q > .26 && q < .72) for(let i = 0; i < 22; i++){ const a = ufH(i, 1) * 6.28, u = (ufH(i, 2) + q * 2.4) % 1, r0 = R * (1 - u * .96), r1 = R * (1 - (u + .1) * .96); const tx = cx, ty = cy - R * .35;
      const x0 = ufLerp(tx, cx + Math.cos(a) * R, r0 / R), y0 = ufLerp(ty, cy + Math.sin(a) * R * .8, r0 / R), x1 = ufLerp(tx, cx + Math.cos(a) * R, Math.max(0, r1) / R), y1 = ufLerp(ty, cy + Math.sin(a) * R * .8, Math.max(0, r1) / R); ufLine(S, x0, y0, x1, y1, 1, i & 1 ? P.b : P.e); }
    if(clos > .75){ const k = (clos - .75) / .25; for(let i = 0; i < 10; i++){ const a = i * .628; ufLine(Hd, cx, pcy, cx + Math.cos(a) * R * .5 * (1 - k * .4), pcy + Math.sin(a) * R * .5 * (1 - k * .4), i & 1 ? 1 : 2, i & 1 ? P.b : P.c); } ufDisc(Hd, cx, pcy, 4 * (1 - k) + 1, P.c); }
  },
  gpaint(L, o){ const {P, R, cx, cy, q, f} = o; if(q < .2) return; const fade = ufC((q - .7) / .3, 0, 1);
    for(let i = 0; i < 18; i++){ const a = ufH(i, 5) * 6.28, d = Math.sqrt(ufH(i, 6)) * R * .9; if(ufH(i, 7) > fade) ufPx(L.soft, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8, ((i + f) % 3) ? P.d : P.b); } }});

/* ---------- RAYO: tres descargas ramificadas caen del cielo, queman el suelo con estrellas de grietas y chispean ---------- */
ufDefForm('lightning', {N: 26, tall: 1.95, dur: 1500, gdur: 2600, shake: 10,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    const strikes = [[0, 0, .22], [-.6, .22, .29], [.56, -.2, .35]];
    if(q < .24) ufEdgeMarks(S, o, 10, 'chev', P.b, .2, 1, 1.5708);
    if(q < .22){ for(const [dx, dy] of strikes) UF_MARK.cross(S, cx + dx * R, cy + dy * R, 0, P.c); }
    const bolt = (x1, y1, x0, seed, wd, depth) => {   // de (x0, y0=2) a (x1, y1) con desplazamiento del punto medio
      const pts = [[x0, 2]], n = 9; for(let i = 1; i < n; i++){ const u = i / n; pts.push([ufLerp(x0, x1, u) + (ufH(i, seed) - .5) * R * .42 * (1 - u * .5), ufLerp(2, y1, u)]); } pts.push([x1, y1]); return {pts, wd};
    };
    for(const [dx, dy, q0] of strikes){
      const age = q - q0; if(age < 0 || age > .3) continue;
      const lx = cx + dx * R, ly = cy + dy * R, seed = Math.round((dx + 3) * 17), flick = age < .06 ? 1 : (ufH(f, seed) > .35 ? 1 : 0), fade = ufC((age - .1) / .2, 0, 1);
      const b = bolt(lx, ly, lx + R * .25 * (dx >= 0 ? 1 : -1) * .4, seed, 3), tw = age < .06 ? 3 : 2;
      if(flick || fade > 0){ const gl = fade > .3 ? P.d : P.a;
        for(let i = 0; i < b.pts.length - 1; i++){ const a = b.pts[i], c = b.pts[i + 1]; if(flick){ ufLine(S, a[0], a[1], c[0], c[1], tw + 4, gl, .5); ufLine(Hd, a[0], a[1], c[0], c[1], tw + 1, P.a); ufLine(Hd, a[0], a[1], c[0], c[1], tw - 1 > 1 ? tw - 1 : 1, P.b); ufLine(Hd, a[0], a[1], c[0], c[1], 1, P.c); } else ufLine(S, a[0], a[1], c[0], c[1], 1, P.d); }
        if(flick) for(let k = 2; k < b.pts.length - 2; k += 2){ const a = b.pts[k]; if(ufH(k, seed + 3) < .75){ const dir = ufH(k, seed + 5) < .5 ? -1 : 1; let x = a[0], y = a[1]; for(let s = 0; s < 3; s++){ const nx = x + dir * (4 + ufH(s, k) * 6), ny = y + 5 + ufH(s, k + 9) * 6; ufLine(Hd, x, y, nx, ny, s ? 1 : 2, s ? P.b : P.a); ufLine(Hd, x, y, nx, ny, 1, P.c); x = nx; y = ny; } } }
      }
      const imp = ufC(1 - age / .2, 0, 1); if(imp > 0){ ufDisc(S, lx, ly, R * .17 * (.5 + imp), imp > .5 ? P.c : P.b, 1); }
      if(age > .02) for(let i = 0; i < 6; i++){ const a = ufH(i, seed) * 6.28, d = R * .2 * Math.min(1, age * 8) * (.5 + ufH(i, 9)); if(ufH(i, 10) > age * 2.6) ufPx(S, lx + Math.cos(a) * d, ly + Math.sin(a) * d * .6 - age * R, i & 1 ? P.e : P.c); }
    }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q, f} = o, strikes = [[0, 0, .22], [-.6, .22, .29], [.56, -.2, .35]], fade = ufC((q - .55) / .45, 0, 1);
    for(const [dx, dy, q0] of strikes){ const age = q - q0; if(age < 0) continue; const lx = cx + dx * R, ly = cy + dy * R, g = ufEase(ufC(age / .08, 0, 1)), col = age < .12 ? P.c : age < .3 ? P.b : P.d;
      ufDisc(L.soft, lx, ly, R * .12 * g, P.d, .6 * (1 - fade));
      for(let i = 0; i < 9; i++){ const a0 = i * .698 + ufH(i, 3), len = R * (.24 + .3 * ufH(i, 4)) * g; let x = lx, y = ly; for(let s = 0; s < 4; s++){ const a = a0 + (ufH(i * 7 + s, 5) - .5) * 1.1, d = len / 4, nx = x + Math.cos(a) * d, ny = y + Math.sin(a) * d * .8; if(ufH(i, 6 + s) > fade) ufLine(L.soft, x, y, nx, ny, 1, col); x = nx; y = ny; } } }
  }});

/* ---------- HAZ GIRATORIO: dos haces opuestos de sirena giran como faro con estela, y se apagan en destello ---------- */
ufDefForm('sweep', {N: 28, tall: 1, dur: 2200, gdur: 2500, shake: 3,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .2){ for(let i = 0; i < 24; i++){ const a = i * .2618, l = i % 2 ? 2 : 4; ufLine(S, cx + Math.cos(a) * (R - l), cy + Math.sin(a) * (R - l), cx + Math.cos(a) * (R + 1), cy + Math.sin(a) * (R + 1), 1, i % 2 ? P.b : P.c); } ufDisc(Hd, cx, cy, 2 + ph.ant * 3, P.c); return; }
    const sw = ufEase(ufC((q - .18) / .62, 0, 1)), phi = -1 + sw * 6.2832 * 3.2, len = R * .98 * (1 - ufIn(ufC((q - .8) / .2, 0, 1))), half = .2, post = ufC((q - .8) / .2, 0, 1);
    for(let b = 0; b < 2; b++){
      const base = phi + b * Math.PI, col = b ? P.e : P.a, light = b ? P.e : P.b;
      // estela: sector detrás del haz, cada vez más tramado
      for(let s = 1; s <= 10; s++){ const a1 = base - half - (s - 1) * .075, a0 = base - half - s * .075, dens = .5 * (1 - s / 10) * (1 - post); if(dens <= .02) continue; ufPoly(S, [[cx, cy], [cx + Math.cos(a1) * len, cy + Math.sin(a1) * len], [cx + Math.cos(a0) * len, cy + Math.sin(a0) * len]], b ? P.e : P.d, dens); }
      if(len > 4){
        ufPoly(S, [[cx, cy], [cx + Math.cos(base - half) * len, cy + Math.sin(base - half) * len], [cx + Math.cos(base + half) * len, cy + Math.sin(base + half) * len]], col, .62);
        ufPoly(S, [[cx, cy], [cx + Math.cos(base - half * .45) * len, cy + Math.sin(base - half * .45) * len], [cx + Math.cos(base + half * .45) * len, cy + Math.sin(base + half * .45) * len]], light, .85);
        ufLine(Hd, cx, cy, cx + Math.cos(base + half) * len, cy + Math.sin(base + half) * len, 2, light); ufLine(Hd, cx, cy, cx + Math.cos(base + half) * len, cy + Math.sin(base + half) * len, 1, P.c);
        ufDisc(Hd, cx + Math.cos(base + half) * len, cy + Math.sin(base + half) * len, 2.4, P.c);
        for(let i = 0; i < 5; i++){ const u = (ufH(i, b) + q * 3) % 1, a = base + (ufH(i, 5 + b) - .5) * half * 1.6; ufPx(S, cx + Math.cos(a) * len * u, cy + Math.sin(a) * len * u, P.c); }
      }
    }
    // lámpara: torre pequeña con casquete
    ufDisc(Hd, cx, cy, R * .11, P.d); ufRing(Hd, cx, cy, R * .11, 1, P.b); ufDisc(Hd, cx, cy, R * .055, (f & 2) ? P.c : P.e);
    if(post > .5) for(let i = 0; i < 10; i++){ const a = i * .628 + .3; ufLine(Hd, cx, cy, cx + Math.cos(a) * R * .3 * (post - .5) * 2, cy + Math.sin(a) * R * .3 * (post - .5) * 2, 1, P.c); }
  },
  gpaint(L, o){ const {P, R, cx, cy, q, f} = o; if(q < .2) return; const sw = ufEase(ufC((q - .18) / .62, 0, 1)), phi = -1 + sw * 6.2832 * 3.2, fade = ufC((q - .75) / .25, 0, 1);
    for(let b = 0; b < 2; b++) for(let s = 0; s < 18; s++){ const a = phi + b * Math.PI - s * .24, r = R * (.35 + .6 * ufH(s, b + 3)); if(ufH(s, b + 7) > fade && (q < .8 || s % 2)) ufDisc(L.soft, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.2, b ? P.e : P.b); } }});

/* ---------- GRIETA: el suelo se abre en grietas de lava, lanza ladrillos por el aire y se enfría dejando las fisuras ---------- */
ufDefForm('fissure', {N: 26, tall: 1.5, dur: 1700, gdur: 3000, shake: 11,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .2){ ufEdgeMarks(S, o, 10, 'brack', P.b, .2); for(let i = 0; i < 7; i++){ const a = i * .8976 + .3, l = R * .3 * ph.ant; ufLine(S, cx + Math.cos(a) * 3, cy + Math.sin(a) * 3, cx + Math.cos(a) * (3 + l), cy + Math.sin(a) * (3 + l), 1, P.c); } return; }
    const k = (q - .2) / .8;
    // ladrillos y bloques por el aire (parábola) que quedan en el suelo
    for(let i = 0; i < 18; i++){ const a = ufH(i, 11) * 6.28, v = R * (.3 + .65 * ufH(i, 12)), t0 = .22 + ufH(i, 13) * .06, u = (q - t0) / .3; if(u < 0) continue; const uu = Math.min(1, u), hgt = (4 * uu * (1 - uu)) * R * (.5 + .7 * ufH(i, 14)), x = cx + Math.cos(a) * v * ufEase(uu), y = cy + Math.sin(a) * v * ufEase(uu) * .7 - hgt;
      if(ufH(i, 15) < ufC((q - .75) / .25, 0, 1)) continue; const big = i % 3 === 0; ufBmp(Hd, big ? ['bbbb', 'bddb', 'bddb', 'aaaa'] : ['bbb', 'dda'], {a: P.d, b: P.b, d: P.a}, x, y, {sc: R >= 40 ? 2 : 1}); }
    for(let i = 0; i < 20; i++){ const a = ufH(i, 21) * 6.28, d = R * (.1 + .8 * ufH(i, 22)), u = (ufH(i, 23) + k * 1.6) % 1; if(k > .05 && ufH(i, 24) > k * .85) ufPx(S, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8 - u * R * .5, i & 1 ? P.e : P.c); }
  },
  gpaint(L, o){
    const {P, R, cx, cy, q, f} = o; if(q < .2) return; const k = (q - .2) / .8, g = ufEase(ufC(k / .16, 0, 1)), heat = 1 - ufC(k / .75, 0, 1), fade = ufC((k - .75) / .25, 0, 1), keep = ufKeep(fade);
    // cráter de lava irregular en el centro
    for(let y = -R * .45; y <= R * .45; y++) for(let x = -R * .45; x <= R * .45; x++){ const a = Math.atan2(y, x), rr = R * .24 * g * (1 + .3 * Math.sin(a * 5 + 1) + .15 * Math.sin(a * 9)), d = Math.hypot(x, y); if(d > rr) continue; const px = cx + x, py = cy + y; if(!keep(px | 0, py | 0)) continue;
      ufPx(L.soft, px, py, d < rr * .45 && heat > .3 ? P.c : heat > .45 ? P.a : heat > .15 ? P.d : P.o); }
    for(let i = 0; i < 10; i++){ const a0 = i * .6283 + ufH(i, 3) * .35, len = R * (.6 + .38 * ufH(i, 4)) * g, col = heat > .6 ? P.c : heat > .3 ? P.a : P.d, wd = heat > .3 ? 3 : 2; let x = cx + Math.cos(a0) * R * .22, y = cy + Math.sin(a0) * R * .22, a = a0;
      for(let s = 0; s < 7; s++){ a = a0 + (ufH(i * 9 + s, 5) - .5) * .9; const d = (len - R * .22) / 7, nx = x + Math.cos(a) * d, ny = y + Math.sin(a) * d; if(ufH(i, 20 + s) > fade) { ufLine(L.soft, x - 1, y + 1, nx - 1, ny + 1, wd, P.o); ufLine(L.soft, x, y, nx, ny, wd, col); if(heat > .5) ufLine(L.soft, x, y, nx, ny, 1, P.c); }
        if(s === 3 || s === 5){ const b = a + (s === 3 ? .8 : -.8), bl = d * 1.6; ufLine(L.soft, x, y, x + Math.cos(b) * bl, y + Math.sin(b) * bl, 1, heat > .3 ? P.a : P.d); } x = nx; y = ny; } }
  }});

/* ---------- EMBUDO: un tornado de arena se desplaza por el área con escombros en órbita y se desenrosca ---------- */
ufDefForm('funnel', {N: 26, tall: 1.9, dur: 2000, gdur: 2200, shake: 6,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .2){ ufEdgeMarks(S, o, 18, 'dot', P.e, ph.q * 3); return; }
    const mv = ufSm(ufC((q - .18) / .6, 0, 1)), px0 = cx + ufLerp(-R * .62, R * .62, mv), Hf = R * 1.65, grow = ufEase(ufC((q - .18) / .12, 0, 1)), unw = ufC((q - .74) / .26, 0, 1), top = cy - Hf * grow * (1 - ufIn(unw) * .6);
    const rAt = hh => R * (.1 + .4 * Math.pow(hh, 1.05)) * (1 - ufIn(unw) * .8), sway = hh => Math.sin(hh * 3.1416) * R * .14 * Math.sin(q * 9 + hh * 2);
    const orb = (front) => { for(let i = 0; i < 16; i++){ const hh = ufH(i, 1) * .95, a = ufH(i, 2) * 6.28 + f * (.22 + hh * .1) * (i & 1 ? 1 : 1.3), r = rAt(hh) * (1.12 + .3 * ufH(i, 3)), z = Math.sin(a); if((z > 0) !== front) continue; const x = px0 + sway(hh) + Math.cos(a) * r, y = cy - hh * Hf * grow - 0;
        if(ufH(i, 9) < unw * .9) continue; if(i % 3 === 0) { ufPx(Hd, x, y, P.d); ufPx(Hd, x + 1, y, P.d); ufPx(Hd, x, y + 1, P.a); ufPx(Hd, x + 1, y + 1, P.a); } else ufPx(Hd, x, y, i & 1 ? P.c : P.e); } };
    orb(false);
    for(let y = cy; y >= top; y--){ const hh = (cy - y) / Hf; if(hh > 1) break; const r = rAt(hh), cxx = px0 + sway(hh); if(r < 1) continue;
      for(let x = -r; x <= r; x++){ const u = x / r, ph1 = Math.asin(Math.max(-1, Math.min(1, u))) + hh * 7 - f * .55, st = Math.sin(ph1 * 3); if(ufH((cxx + x) | 0, y | 0) < unw * 1.05 * (1 - hh * .3) + (hh > .86 ? (hh - .86) * 6.5 : 0)) continue;
        const edge = Math.abs(u) > .86; ufPx(Hd, cxx + x, y, edge ? P.d : st > .45 ? P.b : st > -.25 ? P.a : P.d); } }
    orb(true);
    // grano levantado al pie (puntos, no humo)
    for(let i = 0; i < 24; i++){ const a = ufH(i, 5) * 6.28 + f * .3, d = R * (.12 + .36 * ufH(i, 6)), hh = ufH(i, 7) * .22; ufPx(S, px0 + Math.cos(a) * d, cy + Math.sin(a) * d * .35 - hh * Hf, i & 1 ? P.e : P.b); }
  },
  gpaint(L, o){ const {P, R, cx, cy, q, f} = o; if(q < .2) return; const mv = ufSm(ufC((q - .18) / .6, 0, 1)), fade = ufC((q - .72) / .28, 0, 1), px0 = cx + ufLerp(-R * .62, R * .62, mv);
    for(let i = 0; i < 40; i++){ const u = ufH(i, 31), x = cx + ufLerp(-R * .62, px0 - cx, u) + (ufH(i, 32) - .5) * R * .5, y = cy + (ufH(i, 33) - .5) * R * .3; if(ufH(i, 34) > fade && u < mv + .01) ufPx(L.soft, x, y, ((i + f) & 3) ? P.e : P.d); }
    ufEll(L.soft, px0, cy, R * .45 * (1 - fade), R * .12 * (1 - fade), P.d, .3); }});

/* ---------- LLUVIA DE FLECHAS: cada flecha marca su punto en el suelo, cae en diagonal y queda clavada ---------- */
ufDefForm('volley', {N: 26, tall: 1.7, dur: 1800, gdur: 0, shake: 4,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .24) ufEdgeMarks(S, o, 12, 'chev', P.b, .4, 1, 1.5708);
    const n = 34, post = ufC((q - .7) / .3, 0, 1);
    for(let i = 0; i < n; i++){
      const a = ufH(i, 1) * 6.28, d = Math.sqrt(ufH(i, 2)) * R * .94, lx = cx + Math.cos(a) * d, ly = cy + Math.sin(a) * d * .85, tl = .26 + ufH(i, 3) * .36, fall = .07;
      if(q < tl - fall - .12 && q < .2) continue;
      if(q < tl - fall){ if(q > .08 && (((f + i) >> 1) & 1)) UF_MARK.cross(S, lx, ly, 0, P.b); continue; }
      if(q < tl){ const u = (q - (tl - fall)) / fall, ax = lx + (1 - u) * 26, ay = ly - (1 - u) * (cy - 4) * 1.45 + (1 - u) * 0; const dx = lx - ax, dy = ly - ay, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, L2 = 12;
        ufLine(Hd, ax - ux * L2, ay - uy * L2, ax, ay, R >= 40 ? 2 : 1, P.b); ufLine(Hd, ax - ux * L2, ay - uy * L2, ax - ux * (L2 - 3), ay - uy * (L2 - 3), 2, P.a); ufDisc(Hd, ax, ay, 1.6, P.c); continue; }
      if(ufH(i, 4) < post) continue;
      const age = (q - tl) / .12, sw = Math.sin(q * 30 + i) * Math.max(0, 1 - age * 2) * 1.5;
      ufLine(Hd, lx + 3 + sw, ly - 9, lx, ly, R >= 40 ? 2 : 1, P.b); ufLine(Hd, lx + 3.5 + sw, ly - 10, lx + 2 + sw, ly - 7, 2, P.a); ufPx(Hd, lx, ly, P.c);
      if(age < 1){ const r = 2 + age * 5; for(let k = 0; k < 6; k++){ const aa = k * 1.047 + i; ufPx(S, lx + Math.cos(aa) * r, ly + Math.sin(aa) * r * .6, k & 1 ? P.c : P.e); } }
    }
  }});

/* ---------- TELÓN: el escenario baja con dos cortinados de pliegues, un volante festoneado, foco de luz y confeti ---------- */
ufDefForm('curtain', {N: 26, tall: 1.55, dur: 2100, gdur: 2500, shake: 5,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .2){ ufEdgeMarks(S, o, 12, 'diamond', P.e, .15); for(let i = 0; i < 9; i++) ufPx(S, cx - R + i * R * .25, cy - R * 1.3 * ph.ant, P.c); return; }
    const dn = ufEase(ufC((q - .18) / .16, 0, 1)), post = ufC((q - .62) / .38, 0, 1), hT = R * 1.38, slide = ufIn(post) * R * .55, keep = ufKeep(post * .85);
    // foco de luz sobre el centro del escenario
    if(q > .3) ufPoly(S, [[cx - 3, cy - hT + 2], [cx + 3, cy - hT + 2], [cx + R * .45, cy], [cx - R * .45, cy]], P.c, .2 * (1 - post));
    // cortinados laterales con pliegues
    for(const sd of [-1, 1]){
      const x0 = cx + sd * (R * .98 - slide), x1 = cx + sd * (R * .52 - slide * .2), lo = Math.min(x0, x1), hi = Math.max(x0, x1), hh = hT * dn;
      for(let y = cy - hh; y <= cy; y++) for(let x = lo; x <= hi; x++){ if(!keep(x | 0, y | 0)) continue; const u = (x - lo) / (hi - lo), swing = Math.sin(u * 18 + (y - cy) * .05 + f * .15) * .5 + .5, wob = (cy - y) < R * .1 ? 0 : 0;
        const fold = swing; ufPx(Hd, x, y + Math.sin(u * 18 + f * .2) * 1, fold > .72 ? P.b : fold > .3 ? P.a : P.d); }
      // flecos dorados al pie y recogedor
      for(let x = lo; x <= hi; x += 2) { ufLine(Hd, x, cy, x, cy + 3, 1, P.e); }
      ufDisc(Hd, ufLerp(x0, x1, .5), cy - hh * .38, 2.2, P.e);
    }
    // volante festoneado arriba
    const vw = R * 1.05 * dn; if(dn > .1) for(let i = -6; i <= 6; i++){ const x = cx + i * (vw / 6), sc = ufH(i + 9, 1) * 2; if(!keep(x | 0, cy - hT)) continue; ufPoly(Hd, [[x - vw / 6, cy - hT - 4], [x + vw / 6, cy - hT - 4], [x + vw / 6, cy - hT + 3], [x, cy - hT + 9 + sc], [x - vw / 6, cy - hT + 3]], i & 1 ? P.a : P.b); ufLine(Hd, x - vw / 6 + 1, cy - hT + 4, x, cy - hT + 9 + sc, 1, P.e); }
    for(let x = cx - vw; x <= cx + vw; x++) if(keep(x | 0, cy - hT)) ufLine(Hd, x, cy - hT - 5, x + 1, cy - hT - 5, 2, P.e);
    // confeti
    for(let i = 0; i < 30; i++){ const u = (ufH(i, 5) + q * 1.5) % 1, x = cx + (ufH(i, 6) - .5) * R * 1.9, y = cy - hT + 9 + u * hT * .95; if(q > .3 && ufH(i, 7) > post) ufPx(S, x + Math.sin(u * 12 + i) * 3, y, i % 3 === 0 ? P.e : i % 3 === 1 ? P.c : P.b); }
  },
  gpaint(L, o){ const {P, R, cx, cy, q, f} = o; if(q < .2) return; const g = ufEase(ufC((q - .2) / .1, 0, 1)), fade = ufC((q - .65) / .35, 0, 1), keep = ufKeep(fade);
    // tablas del escenario dentro del radio real
    for(let y = -R * .45; y <= R * .45; y += 1) for(let x = -R; x <= R; x++){ if(x * x + y * y > R * R * .94) continue; if(!keep((cx + x) | 0, (cy + y) | 0)) continue; const plank = Math.floor((y + R) / 4) & 1; if((((x + (plank ? 5 : 0)) % 14) + 14) % 14 === 0 || ((y + R) | 0) % 4 === 0) ufPx(L.soft, cx + x * g, cy + y, P.d); else if(ufDith((cx + x) | 0, (cy + y) | 0, .22 * (plank ? 1 : .7))) ufPx(L.soft, cx + x * g, cy + y, P.a); }
    ufEll(L.soft, cx, cy, R * .4 * g, R * .14 * g, P.c, .3 * (1 - fade)); }});

/* ---------- ESTANDARTE: un gran estandarte clavado en el centro y seis banderines en el borde real; la tela ondea ---------- */
ufDefForm('banner', {N: 26, tall: 1.7, dur: 2200, gdur: 2600, shake: 6,
  paint(L, o){
    const {P, R, cx, cy, q, f, ph} = o, S = L.soft, Hd = L.hard;
    if(q < .2){ ufEdgeMarks(S, o, 6, 'brack', P.e, .5); ufLine(S, cx, cy, cx, cy - 14 * ph.ant, 1, P.c); return; }
    const rise = ufEase(ufC((q - .18) / .13, 0, 1)), post = ufC((q - .66) / .34, 0, 1), keep = ufKeep(post * .9), wave = (x, y) => Math.sin(x * .22 - f * .55 + y * .1) * (1.5 + R * .03);
    const flag = (px, py, h, w, col, trim, emb, tapered) => {   // palo desde (px, py) hacia arriba h px; tela a la derecha
      if(h < 4) return; const top = py - h;
      for(let x = 0; x < w; x++){ const hh = h * .5 * (tapered ? 1 - x / w * .85 : 1 - (x / w) * .08), u = x / w;
        for(let y = 0; y < hh; y++){ const ox = px + 2 + x, oy = top + 1 + y + wave(x, y) * (u * 1.2); if(!keep(ox | 0, oy | 0)) continue; ufPx(Hd, ox, oy, y > hh - 3 ? trim : (emb && u > .3 && u < .7 && y > hh * .25 && y < hh * .75 ? ((x + y) & 1 ? P.e : P.c) : col)); } }
      ufLine(Hd, px, py, px, top, 2, P.d); ufLine(Hd, px, py, px, top, 1, P.b); ufDisc(Hd, px, top - 1, 1.8, P.e);
    };
    for(let i = 0; i < 6; i++){ const a = i * 1.0472 + .52, g = ufEase(ufC((q - .22 - i * .02) / .12, 0, 1)); flag(cx + Math.cos(a) * R * .88, cy + Math.sin(a) * R * .88 * .8, R * .55 * g, R * .3, P.a, P.d, false, true); }
    flag(cx - R * .12, cy + 2, R * 1.55 * rise, R * .78, P.a, P.d, true, false);
    // rangos dorados que suben al grito
    for(let i = 0; i < 3; i++){ const u = ((q - .26) * 2.2 - i * .18); if(u > 0 && u < 1 && post < .5){ const y = cy - R * .5 - u * R * 1.1, a = 1 - u; for(let k = -1; k <= 1; k += 2) ufLine(S, cx - R * .12 + k * R * .28 * a - k * 0, y, cx - R * .12, y - 6, 2, P.e); } }
    for(let i = 0; i < 12; i++){ const u = (ufH(i, 5) + q * 1.4) % 1, x = cx + (ufH(i, 6) - .5) * R * 1.8; if(q > .3 && ufH(i, 7) > post) ufPx(S, x, cy - u * R * 1.4, i & 1 ? P.e : P.b); }
  },
  gpaint(L, o){ const {P, R, cx, cy, q, f} = o; if(q < .2) return; const g = ufEase(ufC((q - .2) / .1, 0, 1)), fade = ufC((q - .65) / .35, 0, 1), keep = ufKeep(fade);
    // sombra del grito: seis rayos de pisada hacia cada banderín
    for(let i = 0; i < 6; i++){ const a = i * 1.0472 + .52; for(let t = R * .18; t < R * .86 * g; t += 3) if(keep((cx + Math.cos(a) * t) | 0, (cy + Math.sin(a) * t * .8) | 0)) ufPx(L.soft, cx + Math.cos(a) * t, cy + Math.sin(a) * t * .8, ((t | 0) % 6) ? P.d : P.a); }
    ufDisc(L.soft, cx, cy, R * .12 * g, P.d, .7 * (1 - fade)); }});
