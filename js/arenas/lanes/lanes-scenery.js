"use strict";
/* ============================================================
   js/arenas/lanes/lanes-scenery.js
   GUERRA DE CRISTALES en el motor real — VESTIR EL MAPA. El mapa era piedra lisa con líneas: acá se le pone selva (árboles,
   matas, rocas, troncos y hongos luminosos), carriles empedrados con musgo en los bordes, río con orillas de piedra, juncos y
   nenúfares, bases con empedrado, runas, braseros y estandartes, portales de piedra por donde sale la horda, torres sobre
   plataforma con antorchas, fosos épicos con pilares rúnicos y campamentos con huesos y estacas.
   Todo es pixel art generado UNA vez en canvas (aidArt) y en cada cuadro solo se dibuja lo que está en cámara.
   Solo decora: no bloquea el paso, no cambia reglas, daño ni recompensas. Semilla fija: el mapa es igual en cada partida.
   ============================================================ */
const LNS = {flat:[], tall:[], lights:[], edge:[], pads:[], reeds:[], solid:[], grid:null, bushes:[], bushGrid:null, built:false, roadPat:null, mossPat:null};

/* ---------------- sprites (pixel art, se dibujan al doble) ---------------- */
const LNS_GREENS = [[34, 70, 36], [52, 104, 50], [86, 150, 70], [130, 196, 96]];
function lnsArtTree(v){
  return aidArt("lnTree" + v, 44, 60, (g, w, h)=>{
    const rnd = aidRng(101 + v * 13), cx = w / 2;
    aidPx(g, cx - 3, h - 20, 6, 20, "#2b1a10"); aidPx(g, cx - 1, h - 20, 2, 20, "#4a2e1c");     // tronco
    aidPx(g, cx - 6, h - 4, 3, 3, "#2b1a10"); aidPx(g, cx + 3, h - 5, 3, 3, "#2b1a10");       // raíces
    const layers = [[cx, 30, 19, 15], [cx - 7 + rnd() * 14, 20, 15, 12], [cx - 4 + rnd() * 8, 12, 11, 9]];
    layers.forEach((L, i)=>{ aidBlob(g, L[0], L[1], L[2], L[3], aidShade(LNS_GREENS[Math.min(2, i)], 1), rnd, 10); });
    aidBlob(g, cx - 5, 11, 7, 5, aidShade(LNS_GREENS[3], 0.9), rnd, 5);                       // luz arriba a la izquierda
    for(let i = 0; i < 10; i++) aidPx(g, 6 + rnd() * 32, 6 + rnd() * 30, 2, 1, "rgba(0,0,0,.28)");  // sombra entre hojas
  });
}
function lnsArtBush(v){
  return aidArt("lnBush" + v, 30, 18, (g, w, h)=>{ const rnd = aidRng(31 + v * 7);
    aidBlob(g, w / 2, h - 7, 13, 6, aidShade(LNS_GREENS[0], 1), rnd, 8); aidBlob(g, w / 2 - 2, h - 9, 10, 5, aidShade(LNS_GREENS[1], 1), rnd, 7);
    aidBlob(g, w / 2 - 5, h - 11, 5, 3, aidShade(LNS_GREENS[2], 1), rnd, 4);
    if(v === 1) for(let i = 0; i < 4; i++) aidPx(g, 6 + rnd() * 18, 4 + rnd() * 8, 2, 2, "#ffd36a");    // bayas
  });
}
function lnsArtRock(v){
  return aidArt("lnRock" + v, 26, 16, (g, w, h)=>{ const rnd = aidRng(57 + v * 5);
    aidBlob(g, w / 2, h - 6, 11, 5, "#3a4250", rnd, 7); aidBlob(g, w / 2 - 2, h - 8, 8, 4, "#5a6474", rnd, 6); aidBlob(g, w / 2 - 4, h - 10, 4, 2, "#8a94a4", rnd, 3);
    aidPx(g, 4, h - 3, 18, 1, "rgba(0,0,0,.35)"); if(v === 1) aidBlob(g, w / 2 + 5, h - 5, 4, 2, aidShade(LNS_GREENS[1], 1), rnd, 3);  // musgo
  });
}
function lnsArtMushroom(){
  return aidArt("lnMush", 14, 16, (g)=>{ aidPx(g, 6, 8, 3, 8, "#cfc6a8"); aidPx(g, 2, 4, 10, 5, "#4fd1b0"); aidPx(g, 3, 2, 8, 2, "#7af0d0"); aidPx(g, 4, 5, 2, 2, "#e8fff8"); aidPx(g, 9, 6, 2, 1, "#e8fff8");
    aidPx(g, 10, 10, 2, 6, "#cfc6a8"); aidPx(g, 9, 8, 4, 3, "#4fd1b0"); });
}
function lnsArtLog(){
  return aidArt("lnLog", 36, 12, (g)=>{ aidPx(g, 2, 3, 32, 7, "#3a2416"); aidPx(g, 2, 3, 32, 2, "#56351f"); aidPx(g, 32, 2, 4, 9, "#6a4a30"); aidPx(g, 33, 4, 2, 5, "#2b1a10");
    for(let x = 6; x < 30; x += 7) aidPx(g, x, 5, 1, 4, "rgba(0,0,0,.35)"); aidPx(g, 0, 10, 36, 1, "rgba(0,0,0,.4)"); });
}
function lnsArtBones(){
  return aidArt("lnBones", 26, 12, (g)=>{ aidPx(g, 2, 6, 14, 2, "#d9d2b8"); aidPx(g, 1, 4, 3, 2, "#d9d2b8"); aidPx(g, 1, 8, 3, 2, "#d9d2b8"); aidPx(g, 14, 4, 3, 2, "#d9d2b8"); aidPx(g, 14, 8, 3, 2, "#d9d2b8");
    aidPx(g, 18, 2, 7, 7, "#e6e0c8"); aidPx(g, 19, 4, 2, 2, "#2a2420"); aidPx(g, 23, 4, 2, 2, "#2a2420"); aidPx(g, 20, 8, 4, 2, "#bdb59c"); });
}
function lnsArtStake(){
  return aidArt("lnStake", 14, 40, (g)=>{ aidPx(g, 6, 10, 3, 30, "#3a2416"); aidPx(g, 7, 10, 1, 30, "#56351f"); aidPx(g, 3, 0, 8, 9, "#e6e0c8"); aidPx(g, 4, 3, 2, 2, "#2a2420"); aidPx(g, 8, 3, 2, 2, "#2a2420"); aidPx(g, 5, 7, 4, 2, "#bdb59c");
    aidPx(g, 2, 16, 10, 2, "#8a2a2a"); aidPx(g, 2, 24, 10, 2, "#8a2a2a"); });
}
function lnsArtBrazier(){
  return aidArt("lnBrazier", 18, 28, (g)=>{ aidPx(g, 5, 24, 8, 4, "#2a2a30"); aidPx(g, 8, 16, 2, 8, "#3a3a44"); aidPx(g, 3, 12, 12, 5, "#4a4a56"); aidPx(g, 4, 12, 10, 1, "#6a6a78");
    aidPx(g, 5, 6, 8, 7, "#ff8a2a"); aidPx(g, 7, 2, 4, 6, "#ffd36a"); aidPx(g, 4, 9, 2, 3, "#ff5a1a"); aidPx(g, 12, 8, 2, 4, "#ff5a1a"); });
}
function lnsArtTorch(){
  return aidArt("lnTorch", 10, 24, (g)=>{ aidPx(g, 4, 8, 2, 16, "#3a2416"); aidPx(g, 3, 6, 4, 3, "#4a4a56"); aidPx(g, 3, 2, 4, 4, "#ff8a2a"); aidPx(g, 4, 0, 2, 3, "#ffd36a"); });
}
function lnsArtBanner(team){
  const col = team === 0 ? ["#2a6aa8", "#70c9ff"] : ["#a86a1a", "#ffb86a"];
  return aidArt("lnBanner" + team, 16, 46, (g)=>{ aidPx(g, 2, 2, 2, 44, "#5a5a66"); aidPx(g, 1, 0, 4, 3, "#c9c9d6"); aidPx(g, 4, 3, 11, 24, col[0]); aidPx(g, 4, 3, 11, 3, col[1]);
    aidPx(g, 4, 27, 11, 1, col[1]); for(let x = 4; x < 15; x += 3) aidPx(g, x, 27, 2, 3, col[0]); aidPx(g, 8, 10, 3, 9, col[1]); aidPx(g, 6, 13, 7, 3, col[1]); });
}
function lnsArtPortal(){
  return aidArt("lnPortal", 64, 68, (g)=>{ const st = ["#3a4558", "#5b6980", "#7a889c"];
    for(const x of [4, 50]){ aidPx(g, x, 16, 10, 52, st[0]); aidPx(g, x + 2, 16, 4, 52, st[1]); aidPx(g, x - 2, 62, 14, 6, st[0]); aidPx(g, x - 1, 14, 12, 4, st[2]); for(let y = 24; y < 60; y += 10) aidPx(g, x, y, 10, 1, "rgba(0,0,0,.35)"); }
    g.fillStyle = st[0]; g.beginPath(); g.moveTo(2, 20); g.quadraticCurveTo(32, -14, 62, 20); g.lineTo(54, 20); g.quadraticCurveTo(32, -2, 10, 20); g.closePath(); g.fill();
    g.fillStyle = st[1]; g.beginPath(); g.moveTo(8, 18); g.quadraticCurveTo(32, -6, 56, 18); g.lineTo(52, 18); g.quadraticCurveTo(32, 0, 12, 18); g.closePath(); g.fill();
    aidPx(g, 28, 2, 8, 5, "#9aa8bc"); aidPx(g, 30, 3, 4, 3, "#e8f0ff"); });
}
function lnsArtPillar(){
  return aidArt("lnPillar", 22, 64, (g)=>{ aidPx(g, 2, 58, 18, 6, "#2a2436"); aidPx(g, 5, 6, 12, 54, "#4a4060"); aidPx(g, 6, 6, 4, 54, "#6a5a86"); aidPx(g, 3, 2, 16, 5, "#5a5078"); aidPx(g, 4, 0, 14, 3, "#8a7aa8");
    for(let y = 14; y < 56; y += 9) aidPx(g, 5, y, 12, 1, "rgba(0,0,0,.35)"); aidPx(g, 10, 20, 2, 14, "#d89bff"); aidPx(g, 8, 26, 6, 2, "#d89bff"); aidPx(g, 9, 38, 4, 4, "#d89bff"); });
}
function lnsArtRoad(){
  return aidArt("lnRoad", 64, 64, (g, w, h)=>{ const rnd = aidRng(4242); g.fillStyle = "#2c3038"; g.fillRect(0, 0, w, h);
    for(let y = 0; y < h; y += 16) for(let x = 0; x < w; x += 16){ const ox = (y / 16) % 2 ? 8 : 0, t = 0.8 + rnd() * 0.35;
      g.fillStyle = aidShade([96, 104, 120], t); g.fillRect(((x + ox) % w) + 1, y + 1, 14, 14); g.fillStyle = aidShade([126, 134, 150], t); g.fillRect(((x + ox) % w) + 2, y + 2, 12, 2);
      if(rnd() < 0.2) g.fillStyle = "rgba(0,0,0,.18)", g.fillRect(((x + ox) % w) + 3 + rnd() * 8, y + 5 + rnd() * 6, 3, 2); }
    for(let i = 0; i < 14; i++){ g.fillStyle = "rgba(70,120,50,.45)"; g.fillRect(rnd() * w, rnd() * h, 3, 2); }   // musgo entre las piedras
  });
}
function lnsArtMoss(){
  return aidArt("lnMoss", 48, 48, (g, w, h)=>{ const rnd = aidRng(999); g.clearRect(0, 0, w, h);
    for(let i = 0; i < 18; i++){ g.fillStyle = i % 3 ? "rgba(60,110,46,.55)" : "rgba(100,160,70,.5)"; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 4 + rnd() * 6, 2 + rnd() * 3, 0, 0, 6.283); g.fill(); }
  });
}

/* ---------------- dónde va cada cosa (determinista) ---------------- */
function lnsRiverDist(x, y){ const W = LANES.W + 200, H = LANES.H + 200; return Math.abs((x + 100) * H - (y + 100) * W) / Math.hypot(W, H); }
function lnsRiverPoint(t, off){ const W = LANES.W, H = LANES.H, L = Math.hypot(W + 200, H + 200), nx = -(H + 200) / L, ny = (W + 200) / L; return {x:-100 + (W + 200) * t + nx * off, y:-100 + (H + 200) * t + ny * off}; }
function lnsFree(x, y, laneGap, riverGap){
  if(x < 50 || y < 50 || x > LANES.W - 50 || y > LANES.H - 50) return false;
  for(let l = 0; l < 3; l++) if(laneProject(l, x, y).d < laneGap) return false;
  if(lnsRiverDist(x, y) < riverGap) return false;
  for(let t = 0; t < 2; t++){ const c = laneCrystalPos(t); if(Math.hypot(x - c.x, y - c.y) < 430) return false; }
  for(const c of LANES_CAMPS) if(Math.hypot(x - c.x, y - c.y) < 200) return false;
  for(const e of LANES_EPICS) if(Math.hypot(x - e.x, y - e.y) < 280) return false;
  return true;
}
function lnsBuild(){
  const L = LNS, rnd = aidRng(7331), W = LANES.W, H = LANES.H;
  L.flat = []; L.tall = []; L.lights = []; L.edge = []; L.pads = []; L.reeds = [];
  // selva: una pieza por celda (con un poco de azar), lejos de carriles, río, bases y fosos
  for(let gy = 120; gy < H; gy += 200) for(let gx = 120; gx < W; gx += 200){
    const x = gx + (rnd() - 0.5) * 150, y = gy + (rnd() - 0.5) * 150, r = rnd();
    if(r > 0.82 || !lnsFree(x, y, 215, 300)) continue;
    const k = rnd();
    if(k < 0.52) L.tall.push({k:"tree", v:(rnd() * 3) | 0, x, y, fl:rnd() < 0.5});
    else if(k < 0.72) L.flat.push({k:"bush", v:(rnd() * 2) | 0, x, y, fl:rnd() < 0.5});
    else if(k < 0.85) L.flat.push({k:"rock", v:(rnd() * 2) | 0, x, y, fl:rnd() < 0.5});
    else if(k < 0.94){ L.flat.push({k:"mush", x, y}); L.lights.push({x, y:y - 10, r:60, a:0.22, rgb:"90,220,170", ph:rnd() * 6, flick:0.3}); }
    else L.flat.push({k:"log", x, y, fl:rnd() < 0.5});
  }
  // orillas del río: piedras y juncos; nenúfares en el agua
  for(let t = 0.02; t < 0.98; t += 0.011){
    for(const side of [-1, 1]){
      const off = side * (248 + rnd() * 50), p = lnsRiverPoint(t, off);
      if(!lnsFree(p.x, p.y, 190, 0)) continue;
      if(rnd() < 0.5) L.flat.push({k:"rock", v:(rnd() * 2) | 0, x:p.x, y:p.y, fl:rnd() < 0.5, s:0.7});
      else L.reeds.push({x:p.x, y:p.y, n:3 + ((rnd() * 3) | 0), h:28 + rnd() * 22, ph:rnd() * 6});
    }
    if(rnd() < 0.35){ const p = lnsRiverPoint(t + 0.004, (rnd() - 0.5) * 300); if(lnsFree(p.x, p.y, 170, 0)) L.pads.push({x:p.x, y:p.y, r:9 + rnd() * 8, a:rnd() * 6}); }
  }
  // borde del mapa: copas oscuras cerrando la selva
  for(let x = -60; x <= W + 60; x += 150){ L.edge.push({x:x + (rnd() - 0.5) * 60, y:-30 + rnd() * 40, r:120 + rnd() * 70, t:rnd()}); L.edge.push({x:x + (rnd() - 0.5) * 60, y:H + 30 - rnd() * 40, r:120 + rnd() * 70, t:rnd()}); }
  for(let y = 100; y < H; y += 150){ L.edge.push({x:-30 + rnd() * 40, y:y + (rnd() - 0.5) * 60, r:120 + rnd() * 70, t:rnd()}); L.edge.push({x:W + 30 - rnd() * 40, y:y + (rnd() - 0.5) * 60, r:120 + rnd() * 70, t:rnd()}); }
  // bases: braseros alrededor, estandartes y portales de la horda en la boca de cada carril
  for(let team = 0; team < 2; team++){
    const c = laneCrystalPos(team), rgb = team === 0 ? "110,200,255" : "255,184,106";
    for(let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2 + 0.3, x = c.x + Math.cos(a) * 330, y = c.y + Math.sin(a) * 330 * 0.78;
      L.tall.push({k:"brazier", x, y}); L.lights.push({x, y:y - 36, r:110, a:0.5, rgb:"255,150,60", ph:i, flick:0.5, torch:true}); }
    for(let i = 0; i < 4; i++){ const a = i / 4 * Math.PI * 2 + Math.PI / 4; L.tall.push({k:"banner", team, x:c.x + Math.cos(a) * 240, y:c.y + Math.sin(a) * 240 * 0.78}); }
    for(let l = 0; l < 3; l++){ const sp = laneSpawn(team, l), p = lanePoint(l, team === 0 ? 20 : LANES_PATHS[l].len - 20);
      L.tall.push({k:"portal", team, x:p.x, y:p.y + 40}); L.lights.push({x:p.x, y:p.y - 10, r:120, a:0.38, rgb, ph:l, flick:0.25}); void sp; }
  }
  // torres: antorchas a los lados
  for(let team = 0; team < 2; team++) for(let l = 0; l < 3; l++) for(let k = 0; k < 3; k++){
    const p = laneTowerPos(team, l, k);
    for(const dx of [-62, 62]){ L.tall.push({k:"torch", x:p.x + dx, y:p.y + 22}); L.lights.push({x:p.x + dx, y:p.y - 10, r:70, a:0.42, rgb:"255,160,70", ph:dx + l, flick:0.6, torch:true}); }
  }
  // fosos épicos: cuatro pilares rúnicos
  for(const e of LANES_EPICS) for(let i = 0; i < 4; i++){ const a = i / 4 * Math.PI * 2 + Math.PI / 4; L.tall.push({k:"pillar", x:e.x + Math.cos(a) * 195, y:e.y + Math.sin(a) * 195 * 0.7 + 10}); }
  // campamentos: huesos, rocas en el borde y una estaca con calavera en el del Gigante
  for(const c of LANES_CAMPS){
    L.flat.push({k:"bones", x:c.x - 40 + rnd() * 80, y:c.y + 30 + rnd() * 20});
    for(let i = 0; i < 3; i++){ const a = rnd() * Math.PI * 2; L.flat.push({k:"rock", v:(rnd() * 2) | 0, x:c.x + Math.cos(a) * 105, y:c.y + 6 + Math.sin(a) * 68, fl:rnd() < 0.5}); }
    if(c.kind === "gigante") L.tall.push({k:"stake", x:c.x + 70, y:c.y - 40});
  }
  // OBJETOS USABLES: árboles y peñascos SÓLIDOS entre los carriles (cobertura: frenan el paso, hay que rodearlos) y MATORRALES donde un
  // héroe se esconde (los rivales, bots, torres y súbditos no lo ven si están a más de BUSH_SEE). Siempre lejos de carriles, bases y campamentos.
  L.solid = []; L.bushes = [];
  for(const d of L.tall) if(d.k === "tree") L.solid.push({x:d.x, y:d.y, r:22});
  for(let gy = 260; gy < H; gy += 330) for(let gx = 260; gx < W; gx += 330){
    const x = gx + (rnd() - 0.5) * 220, y = gy + (rnd() - 0.5) * 220, k = rnd();
    if(!lnsFree(x, y, 235, 330)) continue;
    if(k < 0.42){ L.tall.push({k:"boulder", v:(rnd() * 2) | 0, x, y, fl:rnd() < 0.5}); L.solid.push({x, y, r:34}); }
    else if(k < 0.80) L.bushes.push({x, y, r:76 + rnd() * 34, ph:rnd() * 6});
  }
  L.grid = lnsGrid(L.solid, 160); L.bushGrid = lnsGrid(L.bushes, 220);
  L.roadPat = ctx.createPattern(lnsArtRoad(), "repeat"); L.mossPat = ctx.createPattern(lnsArtMoss(), "repeat");
  L.built = true;
}

/* ---------------- capa de suelo (debajo de todos) ---------------- */
function lanesSceneryRiver(now){
  const W = LANES.W, H = LANES.H, L = LNS;
  ctx.save(); ctx.lineCap = "butt";
  const line = (w, style)=>{ ctx.beginPath(); ctx.moveTo(-100, -100); ctx.lineTo(W + 100, H + 100); ctx.lineWidth = w; ctx.strokeStyle = style; ctx.stroke(); };
  line(520, "rgba(28,36,26,.9)");            // barro de la orilla
  line(486, "rgba(96,86,62,.55)");           // arena
  line(450, "rgba(22,64,110,.92)");          // agua profunda
  line(390, "rgba(44,110,172,.75)");
  line(250, "rgba(70,150,215,.45)");
  if(vfxLoad > 0.6){
    ctx.setLineDash([70, 110]); ctx.lineDashOffset = -(now * 45) % 180; ctx.lineWidth = 5; ctx.strokeStyle = "rgba(205,238,255,.28)";
    for(const off of [-130, -40, 50, 140]){ const a = lnsRiverPoint(0, off), b = lnsRiverPoint(1, off); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    ctx.setLineDash([]);
  }
  ctx.restore();
  for(const p of L.pads){ if(!inView(p.x, p.y, 30)) continue; const bob = Math.sin(now * 1.2 + p.a) * 2;
    ctx.fillStyle = "#2f6a34"; ctx.beginPath(); ctx.ellipse(p.x, p.y + bob, p.r, p.r * 0.62, 0, 0.45, 6.0); ctx.lineTo(p.x, p.y + bob); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(120,190,110,.5)"; ctx.beginPath(); ctx.ellipse(p.x - p.r * 0.3, p.y + bob - 2, p.r * 0.35, p.r * 0.2, 0, 0, 6.283); ctx.fill(); }
}
function lanesSceneryLanes(){
  const L = LNS;
  for(let l = 0; l < 3; l++){
    const pts = LANES_PATHS[l].pts;
    lanesStrokePath(pts, 310, "rgba(18,22,16,.85)");       // zanja oscura del borde
    lanesStrokePath(pts, 290, L.mossPat || "rgba(60,110,46,.5)");   // musgo que se come el camino
    lanesStrokePath(pts, 250, L.roadPat || "rgba(96,104,120,.8)");  // empedrado
    lanesStrokePath(pts, 110, "rgba(255,240,210,.07)");      // franja gastada por el paso de la horda
    ctx.save(); ctx.setLineDash([18, 44]); lanesStrokePath(pts, 3, "rgba(255,255,255,.10)"); ctx.restore();
  }
}
function lanesSceneryGround(now){
  const L = LNS;
  // bases: empedrado y anillo de runas del color del equipo
  for(let t = 0; t < 2; t++){
    const c = laneCrystalPos(t), col = lanesTeamColor(t); if(!inView(c.x, c.y, 640)) continue;
    ctx.save(); ctx.fillStyle = L.roadPat || "#5a6474"; ctx.beginPath(); ctx.ellipse(c.x, c.y, 330, 330 * 0.8, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "rgba(10,12,16,.7)"; ctx.lineWidth = 14; ctx.stroke();
    ctx.strokeStyle = col + "99"; ctx.lineWidth = 6; ctx.setLineDash([24, 18]); ctx.lineDashOffset = -(now * 20) % 42; ctx.beginPath(); ctx.ellipse(c.x, c.y, 300, 300 * 0.8, 0, 0, 6.283); ctx.stroke();
    ctx.setLineDash([]); ctx.strokeStyle = col + "55"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(c.x, c.y, 180, 180 * 0.8, 0, 0, 6.283); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = col + "66";
    for(let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2 + now * 0.15; ctx.beginPath(); ctx.moveTo(c.x + Math.cos(a) * 185, c.y + Math.sin(a) * 148); ctx.lineTo(c.x + Math.cos(a) * 295, c.y + Math.sin(a) * 236); ctx.stroke(); }
    ctx.restore();
  }
  // plataforma de cada torre
  for(let t = 0; t < 2; t++) for(let l = 0; l < 3; l++) for(let k = 0; k < 3; k++){
    const p = laneTowerPos(t, l, k); if(!inView(p.x, p.y, 140)) continue;
    ctx.save(); ctx.fillStyle = "rgba(10,12,16,.6)"; ctx.beginPath(); ctx.ellipse(p.x, p.y + 10, 104, 44, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = L.roadPat || "#5a6474"; ctx.beginPath(); ctx.ellipse(p.x, p.y + 8, 94, 38, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = lanesTeamColor(t) + "66"; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  }
  // fosos épicos: anillo rúnico que late
  for(const e of LANES_EPICS){
    if(!inView(e.x, e.y, 320)) continue; const pulse = 0.5 + 0.5 * Math.sin(now * 1.6 + e.id);
    ctx.save(); ctx.fillStyle = "#1c1428"; ctx.beginPath(); ctx.ellipse(e.x, e.y, 170, 120, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = "rgba(60,40,90,.6)"; ctx.beginPath(); ctx.ellipse(e.x, e.y, 130, 90, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "rgba(216,155,255," + (0.35 + 0.4 * pulse) + ")"; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(e.x, e.y, 150, 104, 0, 0, 6.283); ctx.stroke();
    ctx.lineWidth = 2; ctx.setLineDash([10, 14]); ctx.lineDashOffset = now * 25; ctx.beginPath(); ctx.ellipse(e.x, e.y, 112, 78, 0, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = pxFont(14); ctx.textAlign = "center"; ctx.fillStyle = "rgba(235,215,255,.85)"; ctx.fillText(e.name.toUpperCase(), e.x, e.y + 160); ctx.restore();
  }
  // piezas chatas de la selva y las orillas
  for(const d of L.flat){
    if(!inView(d.x, d.y, 60)) continue;
    const img = d.k === "bush" ? lnsArtBush(d.v) : d.k === "rock" ? lnsArtRock(d.v) : d.k === "mush" ? lnsArtMushroom() : d.k === "log" ? lnsArtLog() : lnsArtBones();
    const s = 2 * (d.s || 1), w = img.width * s, h = img.height * s;
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(d.x, d.y); if(d.fl) ctx.scale(-1, 1);
    ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(0, 2, w * 0.4, 5, 0, 0, 6.283); ctx.fill();
    ctx.drawImage(img, -w / 2, -h + 4, w, h); ctx.restore();
  }
  // juncos que se mecen
  if(vfxLoad > 0.5) for(const k of L.reeds){ if(!inView(k.x, k.y, 60)) continue; ctx.save(); ctx.lineCap = "round";
    for(let j = 0; j < k.n; j++){ const ox = (j - (k.n - 1) / 2) * 6; ctx.strokeStyle = j % 2 ? "#4a7a2e" : "#6a9a3e"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(k.x + ox, k.y); const sw = Math.sin(now * 1.4 + k.ph + j) * 6; ctx.quadraticCurveTo(k.x + ox + sw * 0.5, k.y - k.h * 0.6, k.x + ox + sw, k.y - k.h); ctx.stroke(); }
    ctx.restore(); }
}
function lanesSceneryLights(now){
  const L = LNS; if(!L.lights.length) return;
  ctx.save(); ctx.globalCompositeOperation = "lighter"; const rich = vfxLoad > 0.8;
  for(const g of L.lights){
    if(!rich && g.a < 0.4) continue; if(!inView(g.x, g.y, g.r)) continue;
    const f = 1 - g.flick * 0.5 + g.flick * 0.5 * Math.sin(now * (g.torch ? 11 : 3.2) + g.ph) * Math.sin(now * 1.7 + g.ph * 2);
    ctx.globalAlpha = Math.max(0, g.a * f); const r = g.r * (0.92 + 0.08 * f);
    ctx.drawImage(glowSprite(g.rgb), g.x - r, g.y - r * 0.62, r * 2, r * 1.24);
  }
  ctx.restore();
}
function lanesSceneryEdge(){
  for(const b of LNS.edge){ if(!inView(b.x, b.y, b.r)) continue;
    ctx.fillStyle = b.t < 0.5 ? "#0b1609" : "#101f0c"; ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r, b.r * 0.7, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = "rgba(50,90,36,.3)"; ctx.beginPath(); ctx.ellipse(b.x - b.r * 0.2, b.y - b.r * 0.2, b.r * 0.5, b.r * 0.32, 0, 0, 6.283); ctx.fill(); }
}


/* ---------------- objetos usables: colisión y matorrales ---------------- */
function lnsGrid(list, cell){
  const g = {cell, m:new Map()};
  list.forEach((o, i)=>{ const x0 = Math.floor((o.x - o.r) / cell), x1 = Math.floor((o.x + o.r) / cell), y0 = Math.floor((o.y - o.r) / cell), y1 = Math.floor((o.y + o.r) / cell);
    for(let a = x0; a <= x1; a++) for(let b = y0; b <= y1; b++){ const k = a + "," + b; (g.m.get(k) || g.m.set(k, []).get(k)).push(i); } });
  return g;
}
function lnsNear(g, list, x, y, fn){
  if(!g) return; const c = g.cell, a = Math.floor(x / c), b = Math.floor(y / c);
  for(let i = a - 0; i <= a; i++) for(let j = b - 0; j <= b; j++){ const arr = g.m.get(i + "," + j); if(arr) for(const k of arr) fn(list[k]); }
}
// Saca a una entidad de los árboles y peñascos (solo en el suelo: no afecta a lo que vuela por encima). Se llama desde lanesClamp.
function lanesPushOut(ent){
  const L = LNS; if(ent.lanesProxy || ent.isProj) return; if(!L.built) lnsBuild(); if(!L.grid) return;
  const er = (ent.radius || 18) * 0.35;
  lnsNear(L.grid, L.solid, ent.x, ent.y, o=>{
    const dx = ent.x - o.x, dy = ent.y - o.y, d = Math.hypot(dx, dy), m = o.r + er;
    if(d < m && d > 0.001){ ent.x = o.x + dx / d * m; ent.y = o.y + dy / d * m; }
    else if(d <= 0.001){ ent.x = o.x + m; }
  });
}
// ¿Está el punto dentro de un matorral?
function lanesInBush(x, y){
  const L = LNS; if(!L.built) lnsBuild(); if(!L.bushGrid) return null; let hit = null;
  lnsNear(L.bushGrid, L.bushes, x, y, b=>{ if(!hit && Math.hypot(x - b.x, y - b.y) < b.r) hit = b; });
  return hit;
}
// ¿Puede el equipo `team` ver a este héroe? Escondido en un matorral solo se ve de cerca.
function lanesHeroVisibleTo(h, x, y){ return !h._bush || Math.hypot(h.x - x, h.y - y) < LANES.BUSH_SEE; }

/* ---------------- piezas altas: se ordenan por profundidad con los personajes ---------------- */
function lanesSceneryPushTall(){
  const L = LNS; if(!L.built) return;
  for(let i = 0; i < L.tall.length; i++){ const d = L.tall[i]; if(inView(d.x, d.y - 60, 120)) _entPush(d.y, null, null, null, {arena:1, lnTall:i}); }
}
function lanesSceneryDrawTall(it, now){
  const d = LNS.tall[it.lnTall]; if(!d) return;
  const img = d.k === "boulder" ? lnsArtRock(d.v) : d.k === "tree" ? lnsArtTree(d.v) : d.k === "brazier" ? lnsArtBrazier() : d.k === "banner" ? lnsArtBanner(d.team) : d.k === "portal" ? lnsArtPortal() :
              d.k === "torch" ? lnsArtTorch() : d.k === "pillar" ? lnsArtPillar() : lnsArtStake();
  const s = d.k === "portal" ? 2.6 : d.k === "boulder" ? 3.4 : 2, w = img.width * s, h = img.height * s;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(d.x, d.y);
  if(d.k === "portal"){ const col = lanesTeamColor(d.team); ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.45 + 0.2 * Math.sin(now * 2.2 + d.x);
    ctx.drawImage(glowSprite(d.team === 0 ? "110,200,255" : "255,184,106"), -70, -150, 140, 150); ctx.restore();
    ctx.fillStyle = col + "33"; ctx.beginPath(); ctx.ellipse(0, 2, 70, 18, 0, 0, 6.283); ctx.fill(); }
  ctx.fillStyle = "rgba(0,0,0,.32)"; ctx.beginPath(); ctx.ellipse(0, 3, w * (d.k === "tree" ? 0.36 : 0.3), Math.max(5, w * 0.1), 0, 0, 6.283); ctx.fill();
  if(d.fl) ctx.scale(-1, 1);
  if(d.k === "tree"){ const sway = Math.sin(now * 0.8 + d.x * 0.01 + d.y * 0.013) * 0.012; ctx.rotate(sway); }
  ctx.drawImage(img, -w / 2, -h + 6, w, h);
  ctx.restore();
}

// Matorrales: se dibujan ENCIMA de los personajes (con transparencia) para que quien está dentro se vea tapado.
function lanesSceneryBushes(now){
  const L = LNS; if(!L.built) return; const mine = player ? player.team : -1;
  for(const b of L.bushes){
    if(!inView(b.x, b.y, b.r + 40)) continue;
    const sway = Math.sin(now * 1.1 + b.ph) * 3, occupied = heroes.some(h=>h.alive && h._bush === b);
    ctx.save(); ctx.globalAlpha = occupied ? 0.78 : 0.92;
    for(let i = 0; i < 9; i++){ const a = i / 9 * Math.PI * 2 + b.ph, rr = b.r * (0.45 + (i % 3) * 0.2);
      const x = b.x + Math.cos(a) * rr * 0.9 + sway, y = b.y + Math.sin(a) * rr * 0.55;
      ctx.fillStyle = i % 2 ? "#2c6a30" : "#3c8a3c"; ctx.beginPath(); ctx.ellipse(x, y, b.r * 0.42, b.r * 0.30, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(150,220,110,.35)"; ctx.beginPath(); ctx.ellipse(x - 5, y - 7, b.r * 0.2, b.r * 0.1, 0, 0, 6.283); ctx.fill(); }
    ctx.restore();
    if(occupied && mine >= 0 && heroes.some(h=>h._bush === b && h.team === mine)){ ctx.save(); ctx.strokeStyle = "rgba(160,255,160,.55)"; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r, b.r * 0.62, 0, 0, 6.283); ctx.stroke(); ctx.restore(); }
  }
}
Object.assign(ARENA_DEFS.convergencia, {pushTall:lanesSceneryPushTall, drawTall:lanesSceneryDrawTall});
