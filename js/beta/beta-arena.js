"use strict";
/* ============================================================
   js/beta/beta-arena.js
   BETA VISUAL IMPACT — Ruinas Élficas (arena "bosque") enriquecida: iluminación, ambiente y peligros legibles.
     · Piedras rúnicas que respiran y se "encienden" en cadena al empezar (alrededor del jugador).
     · Niebla baja a la deriva + sombras de copas que cruzan el claro (anclado al mundo, no a la pantalla).
     · Foco de luz cálido-verdoso sobre el jugador (lectura del personaje) y polen/luciérnagas propias.
     · Peligros: toda Raíz / zona de peligro se dibuja con borde ámbar-rojo + rayado + cuenta regresiva.
       Las raíces son verdes sobre un bosque verde: el aviso se leía mal; el rayado no depende del color.
   Solo cosmética. Se monta al final de aidGrade() (ya se dibuja encima del mundo y debajo del HUD).
   ============================================================ */
(function(){
  if(!BETA.on) return;
  const B = BETA;
  let _blob = null, _dark = null, _mote = 0, _runes = [], _runeKey = "";

  function blobSprite(){ // mancha suave blanca (cacheada)
    if(_blob) return _blob;
    _blob = document.createElement("canvas"); _blob.width = _blob.height = 128;
    const g = _blob.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.55, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return _blob;
  }
  function darkSprite(){ // mancha oscura (sombra de copa)
    if(_dark) return _dark;
    _dark = document.createElement("canvas"); _dark.width = _dark.height = 128;
    const g = _dark.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(2,12,6,0.85)"); gr.addColorStop(0.6, "rgba(2,12,6,0.4)"); gr.addColorStop(1, "rgba(2,12,6,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return _dark;
  }
  function hash(n){ n = Math.sin(n*127.1 + 311.7)*43758.5453; return n - Math.floor(n); }

  // Piedras grandes del decorado = piedras rúnicas (se recalcula si cambia la cantidad de props)
  function runes(){
    const key = (typeof aidProps!=="undefined" ? aidProps.length : 0) + ":" + currentArena;
    if(key===_runeKey) return _runes;
    _runeKey = key; _runes = [];
    if(typeof aidProps==="undefined") return _runes;
    for(const p of aidProps){
      if(p.h < 70 || p.w < 38 || p.alpha < 1) continue;
      const nm = (p.img && (p.img.__src || p.img.src || "")) + "";
      if(/log|shroom|mush|tree|arbol|trunk|bush|fern/i.test(nm)) continue; // solo piedra/ruina
      _runes.push({x:p.x, y:p.y - p.h*0.5, h:p.h, ph:hash(p.x*0.013 + p.y*0.007)*6.28, hue:hash(p.x + p.y) > 0.5 ? "120,255,210" : "255,215,120"});
      if(_runes.length >= 40) break;
    }
    return _runes;
  }

  function drawRunes(now, introP){
    const px = player.x, py = player.y;
    let drawn = 0;
    for(const r of runes()){
      if(drawn >= 14) break;
      if(!inView(r.x, r.y, 80)) continue;
      // al empezar, se encienden en cadena desde el jugador hacia afuera
      let lit = 1;
      if(introP < 1){ const d = Math.hypot(r.x - px, r.y - py); lit = Math.max(0, Math.min(1, (introP*1500 - d*1.5)/260)); }
      if(lit <= 0) continue;
      const beat = 0.62 + 0.38*Math.sin(now*1.6 + r.ph), R = 54 + r.h*0.25;
      ctx.globalAlpha = 0.5*beat*lit;
      ctx.drawImage(typeof glowSprite==="function" ? glowSprite(r.hue) : blobSprite(), r.x - R, r.y - R*0.8, R*2, R*1.6);
      // glifo: rombo + trazo vertical (pixel)
      ctx.globalAlpha = (0.55 + 0.4*beat)*lit; ctx.fillStyle = `rgb(${r.hue})`;
      const gx = Math.round(r.x), gy = Math.round(r.y - 4);
      ctx.fillRect(gx - 1, gy - 7, 2, 14); ctx.fillRect(gx - 5, gy - 1, 10, 2); ctx.fillRect(gx - 2, gy - 4, 4, 2); ctx.fillRect(gx - 2, gy + 3, 4, 2);
      drawn++;
    }
    ctx.globalAlpha = 1;
  }

  function drawMistAndShade(now, x0, y0, W, H){
    // niebla baja (aditiva, muy suave) — tres capas con velocidades distintas
    ctx.globalCompositeOperation = "lighter";
    const sp = blobSprite();
    for(let i=0;i<5;i++){
      const sz = 380 + i*70, fx = x0 + (((now*(9 + i*4) + i*531) % (W + sz*2)) - sz), fy = y0 + H*(0.18 + i*0.19) + Math.sin(now*0.17 + i*2)*26;
      ctx.globalAlpha = 0.085;
      ctx.drawImage(sp, fx - sz, fy - sz*0.34, sz*2, sz*0.68);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    // sombras de copas: manchas oscuras ancladas al mundo que cruzan despacio (rejilla por hash)
    const cell = 300, ds = darkSprite();
    const gx0 = Math.floor((x0 - 200)/cell), gx1 = Math.floor((x0 + W + 200)/cell), gy0 = Math.floor((y0 - 200)/cell), gy1 = Math.floor((y0 + H + 200)/cell);
    for(let gx=gx0; gx<=gx1; gx++) for(let gy=gy0; gy<=gy1; gy++){
      const h1 = hash(gx*7.13 + gy*3.77), h2 = hash(gx*1.31 + gy*9.17);
      if(h1 < 0.45) continue;
      const bx = gx*cell + h1*cell + Math.sin(now*0.09 + h2*6)*70, by = gy*cell + h2*cell + Math.cos(now*0.07 + h1*6)*40, sz = 170 + h1*160;
      ctx.globalAlpha = 0.5*(0.55 + 0.45*Math.sin(now*0.12 + h1*9));
      ctx.drawImage(ds, bx - sz, by - sz*0.6, sz*2, sz*1.2);
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayerSpot(now){
    if(!player || !player.alive) return;
    // foco cálido sobre el héroe: lo despega del fondo verde (lectura del personaje)
    ctx.globalCompositeOperation = "lighter";
    const R = 150, pul = 0.9 + 0.1*Math.sin(now*2.2);
    ctx.globalAlpha = 0.22*pul;
    ctx.drawImage(typeof glowSprite==="function" ? glowSprite("255,230,170") : blobSprite(), player.x - R, player.y - R*0.7, R*2, R*1.1);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  }

  // Peligros: borde ámbar/rojo + rayado diagonal + cuenta regresiva. Funciona sobre cualquier color de fondo.
  function drawHazard(x, y, r, p, now, lethal){
    if(!inView(x, y, r + 20)) return;
    B.stats.hazard++;
    const cy = y + 6;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, cy, r, r, 0, 0, 6.2832); ctx.clip();
    // relleno que sube con el tiempo (más urgente cuanto más cerca)
    ctx.fillStyle = `rgba(255,${lethal ? 60 : 110},40,${0.10 + 0.26*p})`; ctx.fillRect(x - r, cy - r, r*2, r*2);
    // rayado diagonal (no depende del color)
    ctx.strokeStyle = `rgba(30,0,0,${0.25 + 0.2*p})`; ctx.lineWidth = 3; ctx.beginPath();
    const step = 14, off = (now*14)%step;
    for(let k=-r*2; k<r*2; k+=step){ ctx.moveTo(x + k + off - r, cy + r); ctx.lineTo(x + k + off + r, cy - r); }
    ctx.stroke();
    ctx.restore();
    // borde: negro (contraste) + ámbar pulsante + puntas giratorias
    const pul = 0.7 + 0.3*Math.sin(now*(6 + p*10));
    ctx.lineWidth = 6; ctx.strokeStyle = "rgba(0,0,0,0.75)"; ctx.beginPath(); ctx.ellipse(x, cy, r, r, 0, 0, 6.2832); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,${lethal ? 70 : 150},45,${0.75 + 0.25*pul})`; ctx.stroke();
    // cuenta regresiva: arco blanco que se completa
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,245,215,0.95)"; ctx.beginPath(); ctx.arc(x, cy, r - 5, -1.5708, -1.5708 + 6.2832*Math.min(1, p)); ctx.stroke();
    // marca central
    ctx.fillStyle = `rgba(255,235,200,${0.7 + 0.3*pul})`;
    const cx = Math.round(x), cyy = Math.round(cy);
    ctx.fillRect(cx - 1, cyy - 9, 3, 11); ctx.fillRect(cx - 1, cyy + 4, 3, 3);
  }
  function drawHazards(now){
    if(typeof bossStrikes!=="undefined"){
      for(const s of bossStrikes){ if(s.delay > 0) drawHazard(s.x, s.y, s.r, Math.min(1, s.t/s.delay), now, true); }
    }
    if(typeof hazardZones!=="undefined" && hazardZones){
      for(const z of hazardZones){ if(z.t < z.warn) drawHazard(z.x, z.y, z.r, Math.min(1, z.t/z.warn), now, false); }
    }
  }

  function spawnAmbient(dt){
    _mote -= dt;
    if(_mote > 0 || !player) return;
    _mote = 340 + brand()*220;
    const a = brand()*6.28, d = 60 + brand()*260;
    betaMotes(player.x + Math.cos(a)*d, player.y + Math.sin(a)*d*0.7, 1, brand()<0.5 ? "255,236,150" : "170,255,200", 4, 12, 3800);
  }

  // Todo lo de la capa de mundo cuelga de aidGrade(): se ejecuta una vez por cuadro dentro de la cámara.
  betaWrap("aidGrade", orig => function(now){
    const r = orig.apply(this, arguments);
    const t0 = performance.now();
    try{
      if(!player || player.duelActive) return r;
      const dt = betaFrameDt(); B._dt = dt;
      bfxUpdate(dt);
      if(betaArenaOn()){
        const hw = VW/2/CAM_ZOOM, hh = VH/2/CAM_ZOOM;
        const x0 = camSub().x - hw - 40, y0 = camCenterY() - hh - 40, W = hw*2 + 80, H = hh*2 + 80;
        const introP = B.intro.t > 0 ? 1 - B.intro.t/B.intro.dur : 1;
        ctx.save();
        const lite = typeof vfxLoad==="number" && vfxLoad < 0.55;
        if(!lite) drawMistAndShade(now, x0, y0, W, H);
        drawRunes(now, introP);
        drawPlayerSpot(now);
        drawHazards(now);
        ctx.restore();
        if(dt) spawnAmbient(dt);
      }
      bfxDraw(now);
    }catch(err){ if(!B._err){ B._err = err; console.error("beta-arena", err); } }
    B.stats.drawMs += performance.now() - t0; B.stats.drawN++;
    return r;
  });
})();
