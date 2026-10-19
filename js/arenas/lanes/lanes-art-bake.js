"use strict";
/* ============================================================
   js/arenas/lanes/lanes-art-bake.js
   GUERRA DE CRISTALES — IDENTIDAD DEL MAPA (2/3): el suelo se HORNEA en trozos de 128×128 px (256 u, 2 u/px, canon de ART_BIBLE §14:
   píxel nativo, sin antialias ni degradés, tramado por hash) la primera vez que cada trozo entra en cámara o en su anillo de
   precarga; se guardan como máximo LNART.CAP (LRU, ≈ 9,6 MB) y por cuadro solo se hacen drawImage de los visibles.
   Todo es arte PROCEDURAL propio (sin recursos de terceros, sin IA). El decorado horneado es plano y NO colisiona; lo alto
   (cristales, espinas) se ordena por profundidad con los héroes (pushTall) y tampoco colisiona.
   ============================================================ */
const _lnaU = h=>{ const n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0; };
const _lnaS = (c, k)=>(((255 << 24) | ((((c >> 16) & 255) * k | 0) << 16) | ((((c >> 8) & 255) * k | 0) << 8) | ((c & 255) * k | 0)) >>> 0);
const LNP = {
  ground: [["#1d3a26", "#264a2e", "#31603a", "#3f7a45"], ["#241a20", "#30222a", "#3f2a30", "#523436"], ["#1b3a3c", "#234b4c", "#2c5f5c", "#38766c"],
           ["#231f33", "#2e2842", "#3b3254", "#4a4068"], ["#14222b", "#1b2f3a", "#254452", "#305867"], ["#1a1113", "#251719", "#33201f", "#46292b"]].map(a=>a.map(_lnaU)),
  dirt: [["#6e5d40", "#7e6c4a", "#907d57"], ["#4f403c", "#5f4c47", "#725a52"], ["#5a6048", "#6a7052", "#7c8460"], ["#5a5070", "#6a6082", "#7c7296"], ["#4a5a66", "#5a6c78", "#6c808c"], ["#4a3a38", "#5a4644", "#6c5450"]].map(a=>a.map(_lnaU)),
  water: ["#0e5068", "#12708a", "#1b97a2", "#38c0bb", "#8fe6dc"].map(_lnaU),
  laneBlue: ["#52627c", "#60728e", "#7185a2", "#8398b4"].map(_lnaU), laneMid: ["#7a6a4e", "#8a7a5a", "#9b8a68", "#ad9c78"].map(_lnaU), laneRed: ["#573d35", "#684a3f", "#7a5849", "#8e6a57"].map(_lnaU),
  bridge: ["#5c616c", "#6e747f", "#818793", "#959ba7"].map(_lnaU),
  violet: ["#2a1f45", "#382a5c", "#4a3877", "#6a52a0"].map(_lnaU), dais: ["#3a3446", "#4a4256", "#5a5268", "#6c6480"].map(_lnaU),
  plazaB: ["#2a3b57", "#34486a", "#41587c", "#54709a"].map(_lnaU), plazaR: ["#1f1316", "#2d1a1d", "#3b2326", "#4c2c2d"].map(_lnaU),
  dark: _lnaU("#0b0f14"), jointB: _lnaU("#16202f"), jointR: _lnaU("#0e0809"), runeB: _lnaU("#7fe0ff"), runeR: _lnaU("#ff6a30"), coreB: _lnaU("#4a80b4"), coreR: _lnaU("#8a2e1e"),
  lava: _lnaU("#ff6a2a"), lava2: _lnaU("#d0401c"), ember: _lnaU("#ffb347"), bone: _lnaU("#cfc7b0"), glowV: _lnaU("#8a50d8"), runeV: _lnaU("#c79bff"),
  tuft: _lnaU("#6fb25a"), flowers: ["#e88ab8", "#b9a0f0", "#f2e27a"].map(_lnaU), turq: _lnaU("#4fe0d0"), shore: _lnaU("#86a08e"), foam: _lnaU("#bff4ec")
};
const LNA_NX = Math.ceil(LNA_W / (LNART.CH / LNART.K)), LNA_NY = Math.ceil(LNA_H / (LNART.CH / LNART.K));
const LNA_NS = [[70, 3], [150, 5], [34, 7], [130, 11], [90, 12], [60, 13], [25, 14], [110, 15], [38, 16], [44, 17]];   // ruidos de valor muestreados en la grilla de nodos (bilineal por píxel)
const _lnaBuf = (()=>{ const NG = LNART.CH / LNART.NODE + 1, n = NG * NG, f = ()=>new Float32Array(n); return {NG, dL: f(), t: f(), riv: f(), ring: f(), cen: f(), ep: f(), db0: f(), db1: f(), camp: f(), trail: f(), wedge: new Uint8Array(n), nz: [0,1,2,3,4,5,6,7,8,9].map(f)}; })();

// El horneado se hace en REBANADAS (lnaBakeBegin + lnaBakeRows con plazo) para no trabar un cuadro: solo hay un trabajo en curso.
function lnaBakeBegin(cx, cy){
  const t0 = performance.now(), CH = LNART.CH, ND = LNART.NODE, B = _lnaBuf, NG = B.NG, o = {};
  for(let j = 0; j < NG; j++) for(let i = 0; i < NG; i++){
    lnaField((cx * CH + i * ND) * 2, (cy * CH + j * ND) * 2, o); const k = j * NG + i;
    B.dL[k] = o.dLane; B.t[k] = o.t; B.riv[k] = o.riv; B.ring[k] = o.ring; B.cen[k] = o.cen; B.ep[k] = o.ep; B.db0[k] = o.db0; B.db1[k] = o.db1; B.camp[k] = o.camp; B.trail[k] = o.trail; B.wedge[k] = o.wedge;
    for(let q = 0; q < 10; q++) B.nz[q][k] = lnaNoise((cx * CH + i * ND) * 2 + (q === 4 ? 900 : 0), (cy * CH + j * ND) * 2, LNA_NS[q][0], LNA_NS[q][1]);
  }
  const cv = document.createElement("canvas"); cv.width = cv.height = CH; const g = cv.getContext("2d"), im = g.createImageData(CH, CH), D = new Uint32Array(im.data.buffer);
  LNART.stats.ms += performance.now() - t0;
  return {cx, cy, cv, g, im, D, row: 0};
}
const _lnaCrB = {x: LNA_BX, y: LNA_BY}, _lnaCrR = {x: LNA_W - LNA_BX, y: LNA_H - LNA_BY};
function lnaBakeRows(J, deadline){
  const tS = performance.now(), cx = J.cx, cy = J.cy, CH = LNART.CH, ND = LNART.NODE, B = _lnaBuf, NG = B.NG, D = J.D, g = J.g, crB = _lnaCrB, crR = _lnaCrR, start = J.row;
  for(; J.row < CH; J.row++){
    if(J.row > start && (J.row & 7) === 0 && performance.now() > deadline){ LNART.stats.ms += performance.now() - tS; return false; }
    const py = J.row;
    const gy = py / ND, j = gy | 0, fy = gy - j, gpy = cy * CH + py, wy = gpy * 2;
    for(let px = 0; px < CH; px++){
      const gx = px / ND, i = gx | 0, fx = gx - i, gpx = cx * CH + px, wx = gpx * 2, k = j * NG + i;
      const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
      const h = lnaHash(gpx, gpy, 1), h2 = lnaHash(gpx, gpy, 2);
      const kk = k + (fx > h ? 1 : 0) + (fy > h2 ? NG : 0), wedge = B.wedge[kk];
      const NZ = B.nz, N = q=>NZ[q][k] * w00 + NZ[q][k + 1] * w10 + NZ[q][k + NG] * w01 + NZ[q][k + NG + 1] * w11;
      const n = N(0), nz = N(1);
      const dL = B.dL[k] * w00 + B.dL[k + 1] * w10 + B.dL[k + NG] * w01 + B.dL[k + NG + 1] * w11, t = B.t[k] * w00 + B.t[k + 1] * w10 + B.t[k + NG] * w01 + B.t[k + NG + 1] * w11,
        riv = B.riv[k] * w00 + B.riv[k + 1] * w10 + B.riv[k + NG] * w01 + B.riv[k + NG + 1] * w11 + (nz - 0.5) * 0.2, ring = B.ring[k] * w00 + B.ring[k + 1] * w10 + B.ring[k + NG] * w01 + B.ring[k + NG + 1] * w11 + (nz - 0.5) * 0.25,
        cen = B.cen[k] * w00 + B.cen[k + 1] * w10 + B.cen[k + NG] * w01 + B.cen[k + NG + 1] * w11, ep = B.ep[k] * w00 + B.ep[k + 1] * w10 + B.ep[k + NG] * w01 + B.ep[k + NG + 1] * w11,
        db0 = B.db0[k] * w00 + B.db0[k + 1] * w10 + B.db0[k + NG] * w01 + B.db0[k + NG + 1] * w11, db1 = B.db1[k] * w00 + B.db1[k + 1] * w10 + B.db1[k + NG] * w01 + B.db1[k + NG + 1] * w11,
        camp = B.camp[k] * w00 + B.camp[k + 1] * w10 + B.camp[k + NG] * w01 + B.camp[k + NG + 1] * w11, trail = B.trail[k] * w00 + B.trail[k + 1] * w10 + B.trail[k + NG] * w01 + B.trail[k + NG + 1] * w11 + (nz - 0.5) * 22;
      const gp = LNP.ground[wedge], v = n * 3.4 + (h - 0.5) * 0.7;
      let ti = v < 0 ? 0 : v > 3 ? 3 : v | 0, col = gp[ti];
      // ---- detalle propio de cada zona
      if(wedge === 0){ if(h < 0.011) col = LNP.tuft; else if(h2 < 0.0016) col = LNP.flowers[(h * 997 | 0) % 3]; else if(N(2) > 0.74) col = gp[Math.min(3, ti + 1)]; }
      else if(wedge === 1 || wedge === 5){
        const r = Math.abs(N(3) - 0.5), r2 = Math.abs(N(4) - 0.5);
        if(r < (wedge === 1 ? 0.013 : 0.020) || (wedge === 5 && r2 < 0.014)) col = (h < 0.5 || r < 0.011) ? LNP.lava : LNP.lava2; else if(r < 0.04) col = LNP.dark; else if(h2 < 0.0022) col = LNP.ember;
      } else if(wedge === 2){
        const r = N(5);
        if(r > 0.68 && N(6) > 0.45) col = LNP.water[2]; else if(r > 0.64 && r <= 0.68) col = gp[0]; else if(h < 0.0016) col = LNP.turq;
      } else if(wedge === 3){
        const r = Math.abs(N(7) - 0.5);
        if(r < 0.010) col = LNP.glowV; else if(r < 0.03) col = gp[0]; else if(h < 0.0026) col = LNP.bone;
      } else if(wedge === 4){ const c2 = N(8); col = c2 > 0.56 ? gp[Math.min(3, ti + 1)] : c2 > 0.5 ? gp[0] : gp[ti]; if(h < 0.006) col = gp[3]; }
      if(wedge >= 4){ const c2 = N(9); if(wedge === 5){ if(c2 > 0.6) col = gp[Math.min(3, ti + 1)]; else if(c2 > 0.55) col = gp[0]; } }
      // ---- senderos de tierra hacia los campamentos
      if(wedge < 4 && trail < 36){ const dp = LNP.dirt[wedge]; col = trail > 31 ? gp[0] : dp[Math.min(2, (n * 2.6 + h * 0.8) | 0)]; if(trail <= 31 && h2 < 0.05) col = dp[0]; }
      // ---- claros de campamento: cada zona tiene el suyo
      if(wedge < 4 && camp < 122){
        const e = camp > 112, dp = LNP.dirt[wedge];
        if(wedge === 0) col = e ? gp[3] : (h < 0.06 ? LNP.tuft : dp[1]);
        else if(wedge === 1) col = e ? LNP.dark : (lnaNoise(wx, wy, 40, 18) > 0.62 ? LNP.lava2 : LNP.plazaR[1 + (h > 0.7 ? 1 : 0)]);
        else if(wedge === 2) col = e ? LNP.shore : LNP.water[1 + (lnaNoise(wx, wy, 30, 19) > 0.55 ? 1 : 0)];
        else col = camp > 88 && camp < 96 ? LNP.runeV : (e ? LNP.violet[3] : LNP.violet[1 + (h > 0.8 ? 1 : 0)]);
      }
      // ---- bases: plaza empedrada, anillos rúnicos y foso del lado de la esquina
      const own = db0 < db1 ? 0 : 1, db = own ? db1 : db0;
      if(db < 560){
        const cb = own ? crR : crB, dx = wx - cb.x, dy = wy - cb.y, pal = own ? LNP.plazaR : LNP.plazaB, jt = own ? LNP.jointR : LNP.jointB, rune = own ? LNP.runeR : LNP.runeB;
        const cd = (dx * (own ? 1 : -1) + dy * (own ? -1 : 1)) / (db * 1.414 + 1);
        if(db < 330 || (db < 470 && h < (470 - db) / 140)){
          const tx = (gpx / 12) | 0, ty = (gpy / 12) | 0, th = lnaHash(tx, ty, 4);
          col = pal[(th * 4) | 0]; if(gpx % 12 === 0 || gpy % 12 === 0) col = jt; else if((gpx + gpy) % 12 === 1 && th > 0.5) col = pal[3];
          if(db < 96) col = (db > 88) ? jt : (own ? LNP.coreR : LNP.coreB); if(db < 60) col = _lnaS(own ? LNP.coreR : LNP.coreB, 1.25);
          else if(db > 96 && db < 108) col = jt;
          else if(db > 230 && db < 238) col = rune;
          else if(db > 296 && db < 306){ const a = Math.atan2(dy, dx); if(((a * 15 + 100) | 0) % 2 === 0) col = rune; else col = jt; }
          else if(db > 306 && db < 316) col = jt;
        }
        // foso: agua fría (Zafiro) o lava (Ámbar) por el lado de la esquina; los carriles lo cruzan por encima
        if(db > 490 && db < 580 && cd > -0.1){ const m = Math.abs(db - 535) / 45 + (nz - 0.5) * 0.3; if(m < 1) col = own ? (m > 0.8 ? LNP.lava2 : (h < 0.03 || m < 0.3 ? LNP.lava : LNP.lava2)) : LNP.water[m > 0.82 ? 3 : m > 0.5 ? 2 : 1]; else if(m < 1.18) col = own ? LNP.dark : LNP.shore; }
      }
      // ---- agua: río que serpentea, anillo de la Convergencia y fosos de los épicos
      let wet = Math.min(riv, ring), isWater = false;
      if(wet < 1){
        isWater = true; const d = riv < ring ? riv : ring;
        let wi = d > 0.86 ? 3 : d > 0.55 ? 2 : d > 0.25 ? 1 : 0;
        if(((gpx * 3 + gpy * 2 + ((n * 9) | 0)) % 13) === 0 && wi < 3) wi++; if(d > 0.92 && h < 0.18) wi = 4; if(h2 < 0.004) wi = 4;
        col = LNP.water[wi]; if(db0 < 330 || db1 < 330) isWater = false;
      } else if(wet < 1.08 && (cen > 235 || ring < riv) && ep > 150) col = wet < 1.03 ? LNP.dark : LNP.shore;
      // ---- plataforma violeta de La Convergencia y estrados de los épicos
      if(cen < 238 || ep < 152){
        const isC = cen < 238, d = isC ? cen : ep, tx = (gpx / 10) | 0, ty = (gpy / 10) | 0, th = lnaHash(tx, ty, 6), pal = isC ? LNP.violet : LNP.dais;
        col = pal[1 + ((th * 2.2) | 0)]; if(gpx % 10 === 0 || gpy % 10 === 0) col = pal[0];
        const rune = isC ? LNP.runeV : (wx < LNA_W / 2 ? _lnaU("#7fe0c8") : _lnaU("#ffb060"));
        if(isC ? ((d > 150 && d < 156) || (d > 205 && d < 210)) : (d > 112 && d < 118)) col = (((Math.atan2(wy - (isC ? LNA.cy : (wx < LNA_W / 2 ? LNA.epics[1].y : LNA.epics[0].y)), wx - (isC ? LNA.cx : (wx < LNA_W / 2 ? LNA.epics[1].x : LNA.epics[0].x))) * 14 + 100) | 0) % 3 === 0) ? pal[0] : rune;
        if(isC && d < 36) col = LNP.runeV; if(isC && d > 232 || !isC && d > 146) col = pal[0];
        isWater = false; wet = 9;
      }
      // ---- carriles: sendero de piedra (azul), tierra (centro) o basalto (rojo); sobre el agua son PUENTES
      if(dL < 158){
        const bridge = wet < 1.22 || isWater;
        if(dL < 150){
          if(bridge){
            const tx = (gpx / 9) | 0, ty = (gpy / 9) | 0, th = lnaHash(tx, ty, 8); col = LNP.bridge[(th * 3.2) | 0]; if(gpx % 9 === 0 || gpy % 9 === 0) col = LNP.bridge[0];
            if(dL > 136) col = dL > 143 ? LNP.dark : LNP.bridge[3];
          } else {
            const tt = t + (nz - 0.5) * 0.1, pal = tt < 0.42 ? LNP.laneBlue : tt > 0.58 ? LNP.laneRed : LNP.laneMid, vv = n * 2.2 + h * 0.9 + 0.35;
            col = pal[vv < 0 ? 0 : vv > 2.99 ? 2 : vv | 0];
            if(tt < 0.42){ const row = (gpy / 10) | 0; if(gpy % 10 === 0 || (gpx + (row & 1) * 8) % 16 === 0) col = pal[0]; else if(h < 0.02) col = pal[3]; }
            else if(tt > 0.58){ if(Math.abs(lnaNoise(wx, wy, 80, 21) - 0.5) < 0.012) col = pal[0]; else if(h2 < 0.0012) col = LNP.ember; else if(h < 0.02) col = pal[3]; }
            else if(h < 0.03) col = pal[Math.min(3, (h2 * 4) | 0)];
            if(dL > 138) col = dL > 146 ? LNP.dark : (((gpx + gpy) & 3) === 0 ? pal[3] : pal[0]);
          }
        } else col = _lnaS(col, 0.55);
      } else if(dL < 172 && !isWater) col = _lnaS(col, 0.8);
      D[py * CH + px] = col;
    }
  }
  g.putImageData(J.im, 0, 0);
  // decorado plano horneado (arbustos, rocas, cristales chicos, estrados de torres): puede cruzar trozos vecinos
  const ck = cy * LNA_NX + cx, list = LNART.buckets && LNART.buckets.get(ck);
  if(list) for(const d of list){ const s = d.spr; g.drawImage(s, Math.round(d.x * LNART.K - cx * CH - s.width / 2), Math.round(d.y * LNART.K - cy * CH - s.height * (d.ay == null ? 0.5 : d.ay))); }
  LNART.stats.bakes++; LNART.stats.ms += performance.now() - tS;
  return true;
}
function lnaBakeChunk(cx, cy){ const J = lnaBakeBegin(cx, cy); lnaBakeRows(J, 1e18); return J.cv; }   // síncrono (herramientas y pruebas)
