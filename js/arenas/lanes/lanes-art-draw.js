"use strict";
/* ============================================================
   js/arenas/lanes/lanes-art-draw.js
   GUERRA DE CRISTALES — IDENTIDAD DEL MAPA (3/3): sprites procedurales (píxel a mano con fillRect), colocación DETERMINISTA del
   decorado (sin colisión, sin tocar carriles/torres/campamentos), gestor de trozos (precarga + LRU), destellos animados baratos,
   piezas altas con orden de profundidad, minimapa horneado y props reales del juego como decorado no sólido.
   ============================================================ */
LNART.spr = {};
function lnaSpr(key, w, h, draw){ let c = LNART.spr[key]; if(!c){ c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); LNART.spr[key] = c; } return c; }
const _lnaPx = (g, x, y, w, h, c)=>{ g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
// Mancha con contorno de 1 px: blobs [cx,cy,r]; pal = [borde, sombra, medio, luz]
function lnaBlobSpr(key, w, h, blobs, pal, dots){
  return lnaSpr(key, w, h, (g)=>{
    const m = new Uint8Array(w * h);
    for(let y = 0; y < h; y++) for(let x = 0; x < w; x++) for(const b of blobs){ const dx = (x - b[0]) / b[2], dy = (y - b[1]) / (b[2] * 0.8); if(dx * dx + dy * dy <= 1){ m[y * w + x] = 1; break; } }
    for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
      if(!m[y * w + x]) continue;
      const edge = !m[y * w + x - 1] || !m[y * w + x + 1] || (y > 0 && !m[(y - 1) * w + x]) || (y < h - 1 && !m[(y + 1) * w + x]);
      const tt = (x * 0.5 + y) / (w * 0.5 + h); _lnaPx(g, x, y, 1, 1, edge ? pal[0] : tt < 0.3 ? pal[3] : tt < 0.62 ? pal[2] : pal[1]);
    }
    if(dots) for(const d of dots) _lnaPx(g, d[0], d[1], 1, 1, d[2]);
  });
}
function lnaCrystalSpr(key, w, h, c, shards){
  return lnaSpr(key, w, h, (g)=>{
    for(const s of shards){ // [cx, ancho, alto]
      const top = h - 2 - s[2], hw = s[1] / 2;
      for(let y = top; y < h - 2; y++){
        const t = (y - top) / s[2], half = Math.max(0.5, hw * Math.min(1, t * 2.6)), x0 = Math.round(s[0] - half), x1 = Math.round(s[0] + half), wid = x1 - x0;
        if(wid < 1) continue;
        _lnaPx(g, x0, y, wid, 1, c[0]);
        if(wid > 2){ _lnaPx(g, x0 + 1, y, Math.max(1, wid * 0.45 | 0), 1, c[3]); _lnaPx(g, x0 + 1 + (wid * 0.45 | 0), y, Math.max(1, wid - 2 - (wid * 0.45 | 0)), 1, c[2]); _lnaPx(g, x1 - 2, y, 1, 1, c[1]); }
      }
      _lnaPx(g, s[0] - 1, top + 2, 1, Math.max(1, s[2] * 0.3 | 0), c[4]);
    }
    _lnaPx(g, 1, h - 2, w - 2, 2, c[0]);
  });
}
const LNC = { violet: ["#150c26", "#3b2a73", "#7a4fd8", "#b98cff", "#f0dcff"], turq: ["#06222c", "#12708a", "#2fc0c0", "#8fe6dc", "#e8fffb"], blue: ["#0a1830", "#1f4f9a", "#3f8fe0", "#9ad0ff", "#eaf6ff"],
  red: ["#240a0a", "#8a2010", "#e0502a", "#ffa060", "#ffe0b0"], obs: ["#0c070a", "#2a1a24", "#46283a", "#70404c", "#ff6a2a"] };
Object.keys(LNC).forEach(k=>LNC[k] = LNC[k].map(h=>h));
function lnaSprCrystal(color, big){
  const c = LNC[color]; return big ? lnaCrystalSpr("cr_" + color + "_B", 44, 74, c, [[22, 14, 62], [11, 10, 38], [33, 10, 30], [17, 8, 24]]) : lnaCrystalSpr("cr_" + color + "_s", 24, 30, c, [[12, 8, 24], [5, 6, 14], [19, 6, 12]]);
}
function lnaSprSpire(v){
  return lnaSpr("spire" + v, 28, 58 + v * 6, (g, w, h)=>{
    const c = LNC.obs, hh = h - 3;
    for(let y = 0; y < hh; y++){ const t = y / hh, half = Math.max(1, (w / 2 - 2) * Math.pow(t, 0.8)), x0 = Math.round(w / 2 - half), wid = Math.round(half * 2);
      _lnaPx(g, x0, y + 2, wid, 1, c[0]); if(wid > 2){ _lnaPx(g, x0 + 1, y + 2, wid - 2, 1, c[2]); _lnaPx(g, x0 + 1, y + 2, Math.max(1, wid * 0.35 | 0), 1, c[3]); _lnaPx(g, x0 + wid - 3, y + 2, 2, 1, c[1]); } }
    for(let y = 10; y < hh - 2; y += 5 + (y & 3)) _lnaPx(g, w / 2 - 2 + ((y * 7) % 5), y, 1, 3, c[4]);
    _lnaPx(g, 2, h - 3, w - 4, 3, c[0]);
  });
}
function lnaSprPad(team){
  return lnaSpr("pad" + team, 70, 40, (g, w, h)=>{
    const rim = team ? "#ff8a3a" : "#7fd0ff", base = team ? ["#1a0f12", "#2d1a1d", "#3b2326"] : ["#16202f", "#2a3b57", "#34486a"];
    for(let y = 0; y < h; y++){ const dy = (y - h / 2 + 0.5) / (h / 2), half = Math.floor((w / 2) * Math.sqrt(Math.max(0, 1 - dy * dy)));
      if(half < 1) continue; _lnaPx(g, w / 2 - half, y, half * 2, 1, base[0]);
      if(half > 3) _lnaPx(g, w / 2 - half + 2, y, half * 2 - 4, 1, (y + ((w / 2 - half) | 0)) % 6 < 3 ? base[1] : base[2]); }
    for(let x = 4; x < w - 4; x += 2){ const dx = (x - w / 2) / (w / 2 - 4), yy = Math.round(h / 2 + (h / 2 - 3) * Math.sqrt(Math.max(0, 1 - dx * dx))); if((x >> 1) % 3) _lnaPx(g, x, yy - 1, 2, 1, rim); }
  });
}
function lnaSprDeco(kind, v){
  const dk = ["#06150c", "#1d3a26", "#2f6a3c", "#58a04c"], P = {
    bosque: ["#0a2410", "#255c30", "#3e8a42", "#74c05a"], pantano: ["#06242a", "#1b5a5a", "#2f8c86", "#62d0c0"], volc: ["#0c070a", "#2a1a24", "#46283a", "#74404c"], necro: ["#120c1e", "#2f2646", "#463a68", "#6e5aa0"], rock: ["#101418", "#4a5058", "#6e747c", "#a0a6ae"]
  }[kind], r = aidRng(500 + v * 31 + kind.length * 7);
  const blobs = [], n = kind === "rock" ? 2 : 4; for(let i = 0; i < n; i++) blobs.push([8 + i * 5 + r() * 3, 9 + (i % 2) * 3 + r() * 2, 5 + r() * 3]);
  const dots = []; if(kind === "bosque") for(let i = 0; i < 3; i++) dots.push([6 + r() * 18 | 0, 5 + r() * 8 | 0, ["#e88ab8", "#f2e27a", "#b9a0f0"][i]]);
  if(kind === "volc") for(let i = 0; i < 4; i++) dots.push([6 + r() * 18 | 0, 6 + r() * 8 | 0, "#ff6a2a"]);
  if(kind === "necro") dots.push([10, 8, "#c79bff"], [18, 10, "#c79bff"]);
  if(kind === "pantano") dots.push([9, 7, "#bff4ec"], [17, 9, "#bff4ec"]);
  return lnaBlobSpr("deco_" + kind + v, 30, 20, blobs, P, dots);
}

/* ---------------- colocación determinista ---------------- */
function lnaAddDecor(spr, x, y, ay){
  const CHW = LNART.CH / LNART.K, hw = spr.width / 2 / LNART.K, hh = spr.height / LNART.K, d = {spr, x, y, ay: ay == null ? 0.5 : ay};
  const top = y - hh * d.ay, bot = y + hh * (1 - d.ay);
  for(let cy = Math.max(0, Math.floor(top / CHW)); cy <= Math.min(LNA_NY - 1, Math.floor(bot / CHW)); cy++)
    for(let cx = Math.max(0, Math.floor((x - hw) / CHW)); cx <= Math.min(LNA_NX - 1, Math.floor((x + hw) / CHW)); cx++){ const k = cy * LNA_NX + cx; let a = LNART.buckets.get(k); if(!a){ a = []; LNART.buckets.set(k, a); } a.push(d); }
}
function lnaAddTall(spr, x, y, sc){ LNART.tall.push({x, y, spr, w: spr.width * sc, h: spr.height * sc}); }
function lnaAddGlint(kind, x, y, r){ const k = Math.floor(y / 256) * LNA_NX + Math.floor(x / 256); let a = LNART.glints.get(k); if(!a){ a = []; LNART.glints.set(k, a); } a.push({kind, x, y, ph: r() * 6.28}); }
function lnaBuild(){
  if(LNART.built) return; LNART.built = true;
  LNART.buckets = new Map(); LNART.tall = []; LNART.glints = new Map();
  const r = aidRng(88123), f = {}, W = LNA_W, H = LNA_H, free = (x, y, laneMin, campMin)=>{ lnaField(x, y, f); return f.dLane > laneMin && f.camp > campMin && Math.min(f.db0, f.db1) > 480 && f.cen > 270 && f.ep > 200 && Math.min(f.riv, f.ring) > 1.15; };
  // estrados bajo torres y cristales
  for(const tw of LNA.tw) lnaAddDecor(lnaSprPad(tw.team), tw.x, tw.y + 6);
  // dispersión por zona: arbustos, rocas y cristales chicos (planos); espinas y cristales grandes (altos)
  for(let i = 0; i < 4200; i++){
    const x = 260 + r() * (W - 520), y = 260 + r() * (H - 520), p = r(); if(!free(x, y, 175, 170)) continue;
    const z = f.wedge;
    if(z === 0){ if(p < 0.55) lnaAddDecor(lnaSprDeco("bosque", i % 4), x, y); else if(p < 0.65) lnaAddDecor(lnaSprDeco("rock", i % 3), x, y); }
    else if(z === 1){ if(p < 0.25) lnaAddDecor(lnaSprDeco("volc", i % 4), x, y); else if(p < 0.32) lnaAddTall(lnaSprSpire(i % 3), x, y, 2); else if(p < 0.4) lnaAddGlint(1, x, y, r); }
    else if(z === 2){ if(p < 0.35) lnaAddDecor(lnaSprDeco("pantano", i % 4), x, y); else if(p < 0.43) lnaAddDecor(lnaSprCrystal("turq", false), x, y, 0.85); else if(p < 0.455) lnaAddTall(lnaSprCrystal("turq", true), x, y, 2); }
    else if(z === 3){ if(p < 0.3) lnaAddDecor(lnaSprDeco("necro", i % 4), x, y); else if(p < 0.4) lnaAddDecor(lnaSprCrystal("violet", false), x, y, 0.85); else if(p < 0.425) lnaAddTall(lnaSprCrystal("violet", true), x, y, 2); }
    else if(z === 4){ if(p < 0.2) lnaAddDecor(lnaSprDeco("rock", i % 3), x, y); else if(p < 0.3) lnaAddDecor(lnaSprCrystal("blue", false), x, y, 0.85); }
    else { if(p < 0.2) lnaAddDecor(lnaSprDeco("volc", i % 4), x, y); else if(p < 0.3) lnaAddTall(lnaSprSpire(i % 3), x, y, 2); else if(p < 0.4) lnaAddGlint(1, x, y, r); }
  }
  // arbustos de emboscada: grupos pegados a los carriles (solo decorado, no ocultan a nadie)
  for(let l = 0; l < 3; l++){ const P = LANES_PATHS[l]; for(let s = 500; s < P.len - 400; s += 380 + r() * 260){
    const q = lanePoint(l, s), nx = -q.dy, ny = q.dx, side = r() < 0.5 ? -1 : 1, off = 192 + r() * 26, x = q.x + nx * off * side, y = q.y + ny * off * side;
    lnaField(x, y, f); if(f.dLane < 178 || f.wedge > 3 || Math.min(f.riv, f.ring) < 1.2 || Math.min(f.db0, f.db1) < 520 || f.camp < 150 || f.cen < 270 || f.ep < 200) continue;
    const kind = ["bosque", "volc", "pantano", "necro"][f.wedge]; for(let k = 0; k < 3; k++) lnaAddDecor(lnaSprDeco(kind, (k + (s | 0)) % 4), x + (k - 1) * 22, y + (k % 2) * 8); } }
  // La Convergencia: cristales violeta a los dos lados del carril central + chispas rúnicas
  for(const sg of [-1, 1]){ lnaAddTall(lnaSprCrystal("violet", true), LNA.cx + sg * 0.6 * 215, LNA.cy + sg * 0.8 * 215 + 20, 2.4); lnaAddTall(lnaSprCrystal("violet", false), LNA.cx + sg * 0.6 * 290, LNA.cy + sg * 0.8 * 290, 2.2); }
  for(let i = 0; i < 26; i++){ const a = r() * 6.283, d = 90 + r() * 140; lnaAddGlint(2, LNA.cx + Math.cos(a) * d, LNA.cy + Math.sin(a) * d, r); }
  // bases: pilares de cristal azul (Zafiro) y espinas obsidiana (Ámbar) del lado de la esquina
  for(let t = 0; t < 2; t++){ const c = laneCrystalPos(t); for(let i = 0; i < 7; i++){
    const a = (t ? -0.78 : 2.36) + (i - 3) * 0.36, d = 410 + (i % 2) * 40, x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d;
    if(x < 120 || y < 160 || x > W - 120 || y > H - 80) continue; if(t) lnaAddTall(lnaSprSpire(i % 3), x, y, 2.2); else lnaAddTall(lnaSprCrystal("blue", true), x, y, 2.2); }
    for(let i = 0; i < 90; i++){ const a = r() * 6.283, d = 340 + r() * 220, x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d; lnaField(x, y, f); if(t && Math.min(f.riv, f.ring) > 0 && f.dLane > 170 && f.db1 > 495 && f.db1 < 580) lnaAddGlint(1, x, y, r); } }
  // destellos del agua del río
  for(let i = 0; i < 900; i++){ const x = r() * W, y = r() * H; lnaField(x, y, f); if(Math.min(f.riv, f.ring) < 0.75 && Math.min(f.db0, f.db1) > 560 && !(f.cen < 238) && f.ep > 152 && f.dLane > 160) lnaAddGlint(0, x, y, r); }
  LNART.tall.sort((a, b)=>a.y - b.y);
  // minimapa horneado
  LNART.mini = lnaBakeMini(240, 180);
}
// Props reales (sprites del juego) como decorado NO sólido: ruinas élficas en el carril de arriba, antorchas en todos, hongos, huesos…
function lanesArtBuildProps(){
  const r = aidRng(52291), f = {}; if(typeof battlefieldProp !== "function") return;
  const ok = (x, y, laneMin)=>{ if(x < 140 || y < 140 || x > LNA_W - 140 || y > LNA_H - 140) return false; lnaField(x, y, f); return f.dLane > laneMin && f.camp > 150 && Math.min(f.db0, f.db1) > 330 && f.cen > 250 && f.ep > 190 && Math.min(f.riv, f.ring) > 1.1 && !LNA.tw.some(t=>Math.hypot(t.x - x, t.y - y) < 120) && !(typeof aidSolids !== "undefined" && aidSolids.some(s=>Math.hypot(s.x - x, s.y - y) < 70)); };
  for(let l = 0; l < 3; l++){ const P = LANES_PATHS[l]; let n = 0;
    for(let s = 300; s < P.len - 300; s += 560 + r() * 80){ const q = lanePoint(l, s);
      for(const sg of [-1, 1]){ const x = q.x - q.dy * 170 * sg, y = q.y + q.dx * 170 * sg; if(!ok(x, y, 160)) continue;
        battlefieldProp("brazier", x, y, 62, 0); aidLights.push({x, y: y - 24, r: 110, rgb: (f.t < 0.42 ? "150,205,255" : "255,150,70"), a: 0.46, flick: 0.35, ph: r() * 6, torch: true}); } n++;
      if(l === 0 && n % 2 === 0){ const sg = r() < 0.5 ? -1 : 1, x = q.x - q.dy * (250 + r() * 40) * sg, y = q.y + q.dx * (250 + r() * 40) * sg; if(ok(x, y, 215)) battlefieldProp(n % 4 ? "column" : "arch", x, y, n % 4 ? 112 : 124, 0); } } }
  for(let i = 0; i < 700; i++){
    const x = 260 + r() * (LNA_W - 520), y = 260 + r() * (LNA_H - 520), p = r(); if(!ok(x, y, 200)) continue; const z = f.wedge;
    if(z === 0 && p < 0.1) battlefieldProp(p < 0.05 ? "fern" : "moss-rock", x, y, p < 0.05 ? 54 : 52, 0);
    else if(z === 2 && p < 0.08) battlefieldProp("mushrooms", x, y, 58, 0);
    else if(z === 3 && p < 0.08) battlefieldProp(p < 0.04 ? "bones" : "dead-tree", x, y, p < 0.04 ? 38 : 150, 0);
    else if(z === 1 && p < 0.04) battlefieldProp("slate", x, y, 64, 0);
  }
  // luces de la identidad: cristal central violeta, bases, fosos épicos
  aidLights.push({x: LNA.cx, y: LNA.cy - 30, r: 340, rgb: "170,110,255", a: 0.5, flick: 0.2, ph: 1});
  for(let t = 0; t < 2; t++){ const c = laneCrystalPos(t); aidLights.push({x: c.x, y: c.y - 60, r: 420, rgb: t ? "255,110,50" : "90,170,255", a: 0.5, flick: 0.15, ph: 2 + t}); }
  for(const e of LNA.epics) aidLights.push({x: e.x, y: e.y - 20, r: 230, rgb: e.id ? "110,230,200" : "255,160,80", a: 0.42, flick: 0.2, ph: 4 + e.id});
}

/* ---------------- gestor de trozos y dibujo ---------------- */
let _lnaFrame = 0, _lnaJob = null;
function lnaStore(J){
  LNART.chunks.set(J.cy * LNA_NX + J.cx, {cv: J.cv, used: _lnaFrame});
  if(LNART.chunks.size > LNART.CAP){ for(const [kk, v] of LNART.chunks){ if(v.used < _lnaFrame - 20){ LNART.chunks.delete(kk); if(LNART.chunks.size <= LNART.CAP - 8) break; } } }
}
// Un trabajo de horneado a la vez, en rebanadas con plazo: primero lo visible (el más cercano al centro), luego el anillo de precarga.
function lnaPump(vis, ring, cx, cy, ms){
  const CHW = LNART.CH / LNART.K, deadline = performance.now() + ms, key = (c, r)=>r * LNA_NX + c;
  const next = ()=>{ let best = null, bd = 1e18; for(const list of [vis, ring]){ for(const [c, r] of list){ if(LNART.chunks.has(key(c, r))) continue; if(_lnaJob && _lnaJob.cx === c && _lnaJob.cy === r) continue;
        const d = Math.hypot((c + 0.5) * CHW - cx, (r + 0.5) * CHW - cy); if(d < bd){ bd = d; best = [c, r]; } } if(best) return best; } return null; };
  while(performance.now() < deadline){
    if(!_lnaJob){ const n = next(); if(!n) return; _lnaJob = lnaBakeBegin(n[0], n[1]); }
    if(lnaBakeRows(_lnaJob, deadline)){ lnaStore(_lnaJob); _lnaJob = null; }
  }
}
function lanesArtDrawGround(now){
  if(!LNART.built) lnaBuild(); _lnaFrame++;
  const CHW = LNART.CH / LNART.K, hw = VW / 2 / CAM_ZOOM + 40, hh = VH / 2 / CAM_ZOOM + 40, cx = camSub().x + CAM_LEAD_X, cy = camCenterY();
  const c0 = Math.max(0, Math.floor((cx - hw) / CHW)), c1 = Math.min(LNA_NX - 1, Math.floor((cx + hw) / CHW)), r0 = Math.max(0, Math.floor((cy - hh) / CHW)), r1 = Math.min(LNA_NY - 1, Math.floor((cy + hh) / CHW));
  const vis = [], ring = [], missing = [];
  for(let r = Math.max(0, r0 - 1); r <= Math.min(LNA_NY - 1, r1 + 1); r++) for(let c = Math.max(0, c0 - 1); c <= Math.min(LNA_NX - 1, c1 + 1); c++){
    const inside = c >= c0 && c <= c1 && r >= r0 && r <= r1, ch = LNART.chunks.get(r * LNA_NX + c);
    if(ch) ch.used = _lnaFrame; else (inside ? vis : ring).push([c, r]);
  }
  // primeros cuadros: se hornea todo lo visible de una vez (carga de la partida); después, rebanadas de 5 ms (visibles) o 2 ms (precarga)
  if(_lnaFrame < 3) lnaPump(vis, [], cx, cy, 1e4);
  else lnaPump(vis, ring, cx, cy, vis.length ? 4 : 1.5);
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for(let r = r0; r <= r1; r++) for(let c = c0; c <= c1; c++){
    const ch = LNART.chunks.get(r * LNA_NX + c);
    if(ch) ctx.drawImage(ch.cv, c * CHW, r * CHW, CHW + 1, CHW + 1);
    else { const m = LNART.mini, k = m.width / LNA_W; ctx.drawImage(m, c * CHW * k, r * CHW * k, CHW * k, CHW * k, c * CHW, r * CHW, CHW + 1, CHW + 1); }   // mientras se hornea: la silueta de zonas del minimapa
  }
  ctx.restore();
  // destellos animados (agua, brasas, runas): solo los de los trozos visibles
  ctx.save();
  for(let r = r0; r <= r1; r++) for(let c = c0; c <= c1; c++){ const a = LNART.glints.get(r * LNA_NX + c); if(!a) continue;
    for(const gl of a){ const s = Math.sin(now * (gl.kind === 1 ? 1.1 : 1.6) + gl.ph);
      if(gl.kind === 0){ if(s < 0.55) continue; ctx.fillStyle = s > 0.85 ? "#e8fffb" : "#8fe6dc"; ctx.fillRect(Math.round(gl.x / 2) * 2, Math.round(gl.y / 2) * 2, 10, 2); }
      else if(gl.kind === 1){ const k = (now * 0.5 + gl.ph) % 1; ctx.fillStyle = k < 0.5 ? "#ffb347" : "#ff6a2a"; ctx.globalAlpha = 1 - k; ctx.fillRect(Math.round(gl.x / 2) * 2 + Math.round(Math.sin(gl.ph + now) * 3) * 2, Math.round((gl.y - k * 70) / 2) * 2, 4, 4); ctx.globalAlpha = 1; }
      else { if(s < 0.2) continue; ctx.fillStyle = s > 0.8 ? "#f0dcff" : "#c79bff"; ctx.fillRect(Math.round(gl.x / 2) * 2, Math.round((gl.y - 10 * s) / 2) * 2, 4, 4); } } }
  ctx.restore();
}
function lanesArtPushTall(){
  if(!LNART.built) return;
  for(const t of LNART.tall) if(inView(t.x, t.y - t.h * 0.5, Math.max(t.w, t.h))) _entPush(t.y, null, null, null, {arena: true, lnaTall: t});
}
function lanesArtDrawTall(it){
  const t = it.lnaTall; let a = 1;
  if(t.h > 110 && heroes.some(h=>h.alive && Math.abs(h.x - t.x) < t.w * 0.45 && h.y < t.y && h.y > t.y - t.h * 0.85)) a = 0.4;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.fillRect(t.x - t.w * 0.3, t.y - 3, t.w * 0.6, 8);
  ctx.drawImage(t.spr, t.x - t.w / 2, t.y - t.h + 4, t.w, t.h); ctx.restore();
}

/* ---------------- minimapa: colores de zona (la leyenda del HUD usa los mismos) ---------------- */
const LNA_MINI = {zone: ["#3c7a40", "#8a3a2c", "#2f7f78", "#5e4b8a", "#22404e", "#3a2024"], water: "#3cc4be", laneB: "#9fb0cc", laneM: "#d2c08e", laneR: "#d29a80", plazaB: "#4a80b4", plazaR: "#c24a30", center: "#a070ff", bridge: "#aeb4be"};
function lnaBakeMini(w, h){
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const g = cv.getContext("2d"), f = {}, sx = LNA_W / (w / 2), sy = LNA_H / (h / 2);
  for(let j = 0; j < h / 2; j++) for(let i = 0; i < w / 2; i++){
    const x = (i + 0.5) * sx, y = (j + 0.5) * sy; lnaField(x, y, f); let c = LNA_MINI.zone[f.wedge];
    if(Math.min(f.db0, f.db1) < 330) c = f.db0 < f.db1 ? LNA_MINI.plazaB : LNA_MINI.plazaR;
    const wet = Math.min(f.riv, f.ring) < 1; if(wet) c = LNA_MINI.water;
    if(f.cen < 238) c = LNA_MINI.center;
    if(f.dLane < 150) c = wet || f.cen < 330 ? LNA_MINI.bridge : (f.t < 0.42 ? LNA_MINI.laneB : f.t > 0.58 ? LNA_MINI.laneR : LNA_MINI.laneM);
    else if(f.trail < 30 && f.wedge < 4) c = "#8a7a5a";
    g.fillStyle = c; g.fillRect(i * 2, j * 2, 2, 2);
  }
  return cv;
}
function lanesArtMini(){ if(!LNART.built) lnaBuild(); return LNART.mini; }
