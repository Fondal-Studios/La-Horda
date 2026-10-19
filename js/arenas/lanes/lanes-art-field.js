"use strict";
/* ============================================================
   js/arenas/lanes/lanes-art-field.js
   GUERRA DE CRISTALES — IDENTIDAD DEL MAPA (1/3): el "campo" de zonas. Solo geometría de ARTE: dado un punto del mundo dice
   en qué zona está (jungla, borde, base, agua, carril) y a qué distancia de cada rasgo. NO toca la geometría jugable
   (LANES_PATHS, torres, cristales, campamentos y épicos se LEEN, nunca se mueven) ni agrega colisiones.
   Zonas (ver docs/production/art-unification/cristales-identidad/README.md):
     0 BOSQUE ANCESTRAL (cuña izquierda) · 1 VOLCÁNICA (cuña de arriba) · 2 PANTANO CRISTALINO (cuña de abajo)
     3 NECRÓPOLIS (cuña derecha) · 4 BORDE AZUL (riscos fríos) · 5 BORDE ROJO (roca volcánica)
   Lo usan el horneado del suelo (lanes-art-bake.js), la colocación de decorado y el minimapa (lanes-hud.js).
   ============================================================ */
const LNART = {
  K: 0.5,            // píxeles de imagen por unidad de mundo (2 u/px: canon de suelos, ART_BIBLE §14)
  CH: 128,           // lado de un trozo horneado, en píxeles (256 u)
  CAP: 150,          // trozos en memoria como máximo (150 × 64 KB ≈ 9,6 MB)
  NODE: 8,           // separación de la grilla de campos, en píxeles (16 u)
  chunks: new Map(), buckets: null, tall: [], glints: [], mini: null, built: false, stats: {bakes: 0, ms: 0},
  ZONE_NAME: ["Bosque Ancestral", "Jungla Volcánica", "Pantano Cristalino", "Necrópolis", "Riscos azules", "Roca volcánica"]
};
const LNA_W = LANES.W, LNA_H = LANES.H, LNA_D = Math.hypot(LANES.W, LANES.H);
const LNA_AX = LNA_W - 2 * LANES.BASE_OFF, LNA_AY = -(LNA_H - 2 * LANES.BASE_OFF), LNA_A2 = LNA_AX * LNA_AX + LNA_AY * LNA_AY;
const LNA_BX = LANES.BASE_OFF, LNA_BY = LANES.H - LANES.BASE_OFF;
// Hash y ruido de valor deterministas por coordenada de mundo (los trozos encajan sin costuras y en red todos ven lo mismo).
function lnaHash(ix, iy, s){ let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(s | 0, 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function lnaNoise(x, y, sc, s){
  x /= sc; y /= sc; const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = lnaHash(ix, iy, s), b = lnaHash(ix + 1, iy, s), c = lnaHash(ix, iy + 1, s), d = lnaHash(ix + 1, iy + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
let LNA_SG = 0;
// distancia de (x,y) al carril l y lado (LNA_SG: signo del producto cruz con el tramo más cercano)
function lnaLaneD(l, x, y){
  const pts = LANES_PATHS[l].pts; let bd = 1e18, sg = 0;
  for(let i = 1; i < pts.length; i++){
    const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1;
    let t = ((x - a[0]) * dx + (y - a[1]) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const px = a[0] + t * dx - x, py = a[1] + t * dy - y, d2 = px * px + py * py;
    if(d2 < bd){ bd = d2; sg = dx * (y - a[1]) - dy * (x - a[0]); }
  }
  LNA_SG = sg; return Math.sqrt(bd);
}
function lnaSeg(x, y, ax, ay, bx, by){
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1; let t = ((x - ax) * dx + (y - ay) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(ax + t * dx - x, ay + t * dy - y);
}
// Constantes derivadas de la geometría real (se calculan una vez)
const LNA = (()=>{
  const o = {camps: LANES_CAMPS.map(c=>({x: c.x, y: c.y, id: c.id, kind: c.kind})), epics: LANES_EPICS.map(e=>({x: e.x, y: e.y, id: e.id})), trails: [], cx: LNA_W / 2, cy: LNA_H / 2};
  lnaLaneD(1, 1450, 2700); o.midRef = Math.sign(LNA_SG) || 1;   // lado "de arriba" del carril central (donde están lobos y bestias)
  lnaLaneD(0, 0, 0); o.outTop = Math.sign(LNA_SG) || 1;           // lado de afuera de los carriles de borde
  lnaLaneD(2, LNA_W, LNA_H); o.outBot = Math.sign(LNA_SG) || 1;
  // senderos de tierra: de cada campamento al carril más cercano, y entre campamentos de la misma cuña
  const toLane = (x, y)=>{ let best = null; for(let l = 0; l < 3; l++){ const p = laneProject(l, x, y); if(!best || p.d < best.d) best = {d: p.d, l, s: p.s}; } const q = lanePoint(best.l, best.s); return [q.x, q.y]; };
  for(const c of o.camps){ const q = toLane(c.x, c.y); o.trails.push([c.x, c.y, q[0], q[1]]); }
  for(const [a, b] of [[0, 1], [2, 3], [4, 5], [6, 7]]) o.trails.push([o.camps[a].x, o.camps[a].y, o.camps[b].x, o.camps[b].y]);
  for(const e of o.epics){ const q = toLane(e.x, e.y); o.trails.push([e.x, e.y, q[0], q[1]]); }
  o.tw = []; for(let t = 0; t < 2; t++) for(let l = 0; l < 3; l++) for(let k = 0; k < 3; k++){ const p = laneTowerPos(t, l, k); o.tw.push({x: p.x, y: p.y, team: t}); }
  return o;
})();
const LNA_RC = (x)=>154 * Math.sin((x / LNA_W - 0.5) * Math.PI / 0.32);   // el río serpentea y pasa por los dos épicos (a ±154 u de la diagonal)
// Rellena `o` con todos los campos del punto. Es la única fuente de verdad de la zona.
function lnaField(x, y, o){
  let d0 = lnaLaneD(0, x, y), s0 = LNA_SG, d1 = lnaLaneD(1, x, y), s1 = LNA_SG, d2 = lnaLaneD(2, x, y), s2 = LNA_SG;
  o.dLane = Math.min(d0, d1, d2); o.lane = d0 <= d1 && d0 <= d2 ? 0 : d1 <= d2 ? 1 : 2;
  o.t = ((x - LNA_BX) * LNA_AX + (y - LNA_BY) * LNA_AY) / LNA_A2;
  const rd = (y * LNA_W - x * LNA_H) / LNA_D;
  o.cen = Math.hypot(x - LNA.cx, y - LNA.cy);
  let ep = 1e9; for(const e of LNA.epics){ const d = Math.hypot(x - e.x, y - e.y); if(d < ep) ep = d; } o.ep = ep;
  const hw = 118 + 22 * Math.sin(x * 0.0043 + 1) + 70 * Math.exp(-(o.cen * o.cen) / 260000) + 80 * Math.exp(-(ep * ep) / 90000);
  o.riv = Math.abs(rd - LNA_RC(x)) / hw;                                  // < 1 = dentro del río
  o.ring = Math.min(Math.abs(o.cen - 318) / 82, Math.abs(ep - 196) / 52); // < 1 = anillo de agua (Convergencia / fosos épicos)
  o.db0 = Math.hypot(x - LNA_BX, y - LNA_BY); o.db1 = Math.hypot(x - (LNA_W - LNA_BX), y - (LNA_H - LNA_BY));
  let cm = 1e9; for(const c of LNA.camps){ const d = Math.hypot(x - c.x, y - c.y); if(d < cm) cm = d; } o.camp = cm;
  let tr = 1e9; for(const q of LNA.trails){ const d = lnaSeg(x, y, q[0], q[1], q[2], q[3]); if(d < tr) tr = d; } o.trail = tr;
  const below = rd > 0, sameMid = Math.sign(s1) === LNA.midRef;
  let wedge = below ? (sameMid ? 0 : 2) : (sameMid ? 1 : 3);
  const nearBase = Math.min(o.db0, o.db1) < 900;
  if(nearBase) wedge = o.db0 < o.db1 ? 4 : 5;   // alrededores de cada base: roca fría (Zafiro) o volcánica (Ámbar)
  if(!nearBase && ((Math.sign(s0) === LNA.outTop && d0 > 170) || (Math.sign(s2) === LNA.outBot && d2 > 170))) wedge = (o.t + (lnaNoise(x, y, 260, 9) - 0.5) * 0.14) < 0.5 ? 4 : 5;
  o.wedge = wedge; return o;
}
