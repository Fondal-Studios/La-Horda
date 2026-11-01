"use strict";
/* ============================================================
   js/beta/beta-ui.js
   BETA VISUAL IMPACT — (1) pantalla de entrada con campeón animado y acceso rápido a partida;
                        (2) feedback táctil de las habilidades.

   Coordinación con la UI Factory (kit existente, css/ui-kit.css + js/core/prefs.js): NO se duplica nada.
     · colores/tipografía/relieve salen de los tokens --ui-* / --ember* del kit;
     · el estado de cada botón (ready / cd / noen / active) y su sonido "ready" ya los decide js/ui/hud.js
       (_setBtnState, clase .ready-pop): esta capa solo LEE esas clases y suma respuesta táctil encima;
     · la vibración pasa por hapticPulse() y respeta Opciones (Vibración) y "Reducir movimiento".
   Acceso rápido: un toque en "JUGAR AHORA" arranca Ruinas Élficas con Sylva (usa startRun/accountGate del juego).
   ============================================================ */
(function(){
  if(!BETA.on) return;
  const B = BETA;
  const $ = id => document.getElementById(id);

  /* ======================= 2) Feedback táctil de habilidades ======================= */
  const BTN_IDS = ["btn-basic", "btn-s1", "btn-s2", "btn-s3", "btn-ult", "btn-emerg"];
  function ripple(el, e){
    const r = el.getBoundingClientRect();
    const sp = document.createElement("span"); sp.className = "bt-ripple";
    const x = (e && typeof e.clientX==="number" && e.clientX) ? e.clientX - r.left : r.width/2;
    const y = (e && typeof e.clientY==="number" && e.clientY) ? e.clientY - r.top : r.height/2;
    sp.style.left = x + "px"; sp.style.top = y + "px";
    el.appendChild(sp);
    setTimeout(()=>sp.remove(), 520);
  }
  function onPress(e){
    const el = e.target && e.target.closest ? e.target.closest(".ability-btn") : null;
    if(!el || BTN_IDS.indexOf(el.id) < 0) return;
    B.stats.press++;
    const waiting = el.classList.contains("cd") || el.classList.contains("noen");
    el.classList.remove("bt-press", "bt-deny", "bt-cast"); void el.offsetWidth;
    if(waiting){ // sin energía o en recarga: la respuesta tiene que decir "no", sin ambigüedad
      el.classList.add("bt-deny");
      if(typeof hapticPulse==="function") try{ hapticPulse(10, true); }catch(_){}
    } else {
      el.classList.add("bt-press", "bt-cast");
      ripple(el, e);
      betaHaptic(el.id==="btn-ult" ? [18, 20, 36] : el.id==="btn-basic" ? 6 : 12);
    }
    setTimeout(()=>el.classList.remove("bt-press", "bt-deny", "bt-cast"), 360);
  }
  document.addEventListener("pointerdown", onPress, {capture:true, passive:true});
  // teclado (PC): mismo feedback
  document.addEventListener("keydown", e=>{
    const map = {KeyJ:"btn-basic", KeyK:"btn-s1", KeyL:"btn-s2", KeyU:"btn-s3", KeyI:"btn-ult", Digit1:"btn-s1", Digit2:"btn-s2", Digit3:"btn-s3", KeyQ:"btn-s1", KeyW:"btn-s2", KeyE:"btn-s3", KeyR:"btn-ult"};
    const id = map[e.code], el = id && $(id); if(!el || e.repeat) return;
    onPress({target:el});
  }, true);
  // cuando una habilidad vuelve a estar lista (hud.js pone .ready-pop): destello extra de anillo
  const mo = new MutationObserver(list=>{
    for(const m of list){
      const el = m.target;
      if(el.classList && el.classList.contains("ready-pop") && !el._btRdy){
        el._btRdy = 1; B.stats.ready++;
        const ring = document.createElement("span"); ring.className = "bt-readyring"; el.appendChild(ring);
        setTimeout(()=>{ ring.remove(); el._btRdy = 0; }, 640);
        if(el.id==="btn-ult") betaHaptic([14, 30, 14]);
      }
    }
  });
  function observe(){ for(const id of BTN_IDS){ const el = $(id); if(el) mo.observe(el, {attributes:true, attributeFilter:["class"]}); } }
  observe();

  /* ======================= 1) Pantalla de entrada ======================= */
  const scr = $("title-screen");
  if(!scr) return;
  const bg = document.createElement("div"); bg.id = "bt-bg"; bg.setAttribute("aria-hidden", "true");
  bg.innerHTML = '<div class="bt-bg-shade"></div>';
  const cv = document.createElement("canvas"); cv.id = "bt-hero-cv"; cv.setAttribute("aria-hidden", "true");
  const cta = document.createElement("div"); cta.id = "bt-cta";
  cta.innerHTML = '<div class="bt-cta-kick">PRÓXIMA PARTIDA</div>' +
    '<button type="button" id="bt-play" class="btn bt-play" disabled><span class="bt-play-main">Cargando…</span><span class="bt-play-sub"></span></button>' +
    '<div class="bt-cta-meta"><span class="ui-tag">Sylva · Cazadora</span><span class="ui-tag new">Ruinas Élficas</span></div>';
  scr.insertBefore(bg, scr.firstChild);
  const canvas0 = $("title-canvas");
  if(canvas0) canvas0.insertAdjacentElement("afterend", cv); else scr.appendChild(cv);
  scr.appendChild(cta);
  scr.classList.add("bt-title");

  const heroName = (typeof championShortName==="function" && championShortName(B.HERO)) || "Sylva";
  const playBtn = $("bt-play"), mainSpan = playBtn.querySelector(".bt-play-main"), subSpan = playBtn.querySelector(".bt-play-sub");
  subSpan.textContent = "Partida rápida · " + heroName;

  // mismo estado que el botón clásico: no se puede tocar hasta que el arte esté listo
  function syncPlay(){
    const c = $("title-continue-btn");
    const loading = !c || c.disabled;
    playBtn.disabled = loading;
    mainSpan.textContent = loading ? ((c && c.textContent) || "Cargando…") : "▶ JUGAR AHORA";
  }
  setInterval(syncPlay, 200); syncPlay();

  let launching = false;
  function quickPlay(){
    if(launching || playBtn.disabled) return;
    launching = true;
    if(typeof startMusic==="function") try{ startMusic(); }catch(_){}
    const go = ()=>{
      try{
        selectedClass = B.HERO; currentArena = B.ARENA; B.demo = true;
        if(typeof lobbyNextArena!=="undefined") lobbyNextArena = null;
        scr.classList.add("bt-launch");
        betaHaptic([16, 20, 40]);
        setTimeout(()=>{
          try{ startRun(1); }catch(err){ console.error("beta quick start", err); if(typeof showNetToast==="function") showNetToast("No se pudo arrancar la partida rápida."); }
          setTimeout(()=>{ scr.classList.remove("bt-launch"); launching = false; }, 400);
        }, 520);
      }catch(err){ launching = false; console.error(err); }
    };
    // cuentas: sin sesión recordada el juego pide Entrar / Crear cuenta / Invitado; después sigue acá
    if(typeof accountGate==="function" && accountGate(go)) { launching = false; return; }
    go();
  }
  playBtn.addEventListener("click", quickPlay);
  B.quickPlay = quickPlay;

  /* ---- telón de fondo: el atlas REAL de Ruinas (menhires rúnicos, árboles) en capas, con luz y niebla ---- */
  const atlas = new Image(); let atlasOK = false; atlas.onload = ()=>{ atlasOK = true; }; atlas.src = "assets/sprites/arenas/world-v1/bosque.png";
  const CELL = 128, tintCache = {};
  // celda del atlas (columna, fila) → canvas; tint = silueta oscura teñida para las capas lejanas
  function cell(c, r, tint){
    const key = c + "," + r + "," + (tint||"");
    if(tintCache[key]) return tintCache[key];
    const cv2 = document.createElement("canvas"); cv2.width = cv2.height = CELL;
    const g = cv2.getContext("2d"); g.imageSmoothingEnabled = false;
    g.drawImage(atlas, c*CELL, r*CELL, CELL, CELL, 0, 0, CELL, CELL);
    if(tint){ g.globalCompositeOperation = "source-atop"; g.fillStyle = tint; g.fillRect(0, 0, CELL, CELL); }
    return (tintCache[key] = cv2);
  }
  function backdrop(g, W, H, unit, t){
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#03100c"); sky.addColorStop(0.5, "#0a2118"); sky.addColorStop(1, "#040b08");
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    if(!atlasOK) return;
    g.imageSmoothingEnabled = false;
    const drift = Math.sin(t/9000)*W*0.008;
    // capa lejana: copas en silueta verde-azulada
    for(let i=0;i<7;i++){
      const sz = CELL*unit*(2.3 + (i%3)*0.35), x = W*(i/6.2) - sz*0.2 + drift*(1 + i%2), y = H*0.66;
      g.globalAlpha = 0.9; g.drawImage(cell(i%3, 0, "rgba(6,30,22,0.82)"), x, y - sz*0.92, sz, sz);
    }
    g.globalAlpha = 1;
    // niebla entre capas
    const mist = g.createLinearGradient(0, H*0.4, 0, H*0.8); mist.addColorStop(0, "rgba(120,200,170,0)"); mist.addColorStop(0.55, "rgba(120,200,170,0.13)"); mist.addColorStop(1, "rgba(120,200,170,0)");
    g.fillStyle = mist; g.fillRect(0, H*0.4, W, H*0.4);
    // suelo: claro circular de piedra con anillo rúnico
    const gg = g.createLinearGradient(0, H*0.62, 0, H); gg.addColorStop(0, "#0b1d14"); gg.addColorStop(1, "#050d09");
    g.fillStyle = gg; g.fillRect(0, H*0.64, W, H*0.36);
    const cx = W*0.30, cy = H*0.835, pul = 0.6 + 0.4*Math.sin(t/650);
    g.strokeStyle = "rgba(0,0,0,0.6)"; g.lineWidth = 7*unit; g.beginPath(); g.ellipse(cx, cy, 120*unit, 22*unit, 0, 0, 6.2832); g.stroke();
    g.globalCompositeOperation = "lighter";
    g.strokeStyle = `rgba(110,255,205,${0.35 + 0.35*pul})`; g.lineWidth = 2.5*unit; g.beginPath(); g.ellipse(cx, cy, 120*unit, 22*unit, 0, 0, 6.2832); g.stroke();
    g.strokeStyle = `rgba(255,225,140,${0.2 + 0.3*pul})`; g.lineWidth = 1.6*unit; g.beginPath(); g.ellipse(cx, cy, 88*unit, 16*unit, 0, 0, 6.2832); g.stroke();
    for(let i=0;i<12;i++){ const a = i*0.5236 + t/9000, rx = cx + Math.cos(a)*120*unit, ry = cy + Math.sin(a)*22*unit; g.fillStyle = `rgba(150,255,215,${0.5 + 0.4*Math.sin(t/400 + i)})`; g.fillRect(rx - unit, ry - unit, 3*unit, 3*unit); }
    g.globalCompositeOperation = "source-over";
    // menhires rúnicos que enmarcan al héroe (cian a la izquierda, ámbar a la derecha), con su luz
    const menh = [[0, 2, W*0.075, "110,255,235", 1.0], [1, 1, W*0.505, "255,190,70", 0.92]];
    for(const [c, r, mx, rgb, k] of menh){
      const sz = CELL*unit*2.1*k*0.82, my = H*0.86;
      g.globalCompositeOperation = "lighter";
      const hl = 0.55 + 0.45*Math.sin(t/800 + mx);
      const gl = g.createRadialGradient(mx, my - sz*0.45, 4, mx, my - sz*0.45, sz*0.9); gl.addColorStop(0, `rgba(${rgb},${0.35*hl})`); gl.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gl; g.fillRect(mx - sz, my - sz*1.4, sz*2, sz*1.6);
      g.globalCompositeOperation = "source-over";
      g.drawImage(cell(c, r), mx - sz/2, my - sz*0.93, sz, sz);
    }
    // arbustos de primer plano en silueta
    for(let i=0;i<6;i++){ const sz = CELL*unit*1.5, x = W*(i/5.2) - sz*0.2; g.globalAlpha = 0.95; g.drawImage(cell(i%2, 3, "rgba(2,14,8,0.78)"), x, H - sz*0.62, sz, sz); }
    g.globalAlpha = 1;
    // haces de luz entre las copas
    g.globalCompositeOperation = "lighter";
    for(let i=0;i<4;i++){
      const bx = W*(0.08 + i*0.26) + Math.sin(t/3000 + i*1.7)*W*0.02, a = 0.05 + 0.035*Math.sin(t/1700 + i*2.1);
      g.fillStyle = `rgba(235,245,170,${a})`;
      g.beginPath(); g.moveTo(bx, 0); g.lineTo(bx + W*0.09, 0); g.lineTo(bx + W*0.30, H); g.lineTo(bx + W*0.17, H); g.closePath(); g.fill();
    }
    g.globalCompositeOperation = "source-over";
    // viñeta
    const v = g.createRadialGradient(W*0.38, H*0.6, H*0.25, W*0.5, H*0.55, Math.hypot(W, H)*0.62); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,4,2,0.8)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  }

  /* ---- campeón animado: Sylva grande + polvo/luciérnagas; solo corre con el título a la vista ---- */
  let raf = 0, last = 0, t = 0, parts = [];
  function heroFrame(now){
    if(scr.classList.contains("hidden")){ raf = 0; return; }
    raf = requestAnimationFrame(heroFrame);
    if(now - last < 33) return;
    const dt = Math.min(100, now - (last || now)); last = now; t += dt;
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if(!w || !h) return;
    if(cv.width !== Math.round(w*dpr) || cv.height !== Math.round(h*dpr)){ cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr); parts = []; }
    const g = cv.getContext("2d"), W = cv.width, H = cv.height, unit = Math.min(W/844, H/390);
    g.clearRect(0, 0, W, H); g.imageSmoothingEnabled = false;
    backdrop(g, W, H, unit, t);
    if(!parts.length){ for(let i=0;i<42;i++) parts.push({x:brand()*W, y:H*(0.25 + brand()*0.7), v:(8 + brand()*22)*unit, s:(1 + brand()*2)*unit, ph:brand()*6.28, c:brand()<0.55}); }
    const loading = playBtn.disabled;
    // el campeón: de pie, respira; cada ~5 s da un paso al frente y ataca (animación real del juego)
    if(!loading && typeof drawChampFigure==="function"){
      if(typeof _titleMeasure==="function" && !_titleNorm[B.HERO]) try{ _titleMeasure(); }catch(_){}
      const norm = Math.max(0.5, Math.min(2.4, (typeof _titleNorm!=="undefined" && _titleNorm[B.HERO]) || 1));
      const sc = 5.7*unit*norm, cx = W*0.30, base = H*0.83;
      const cyc = (t % 6200), atk = cyc > 4300 && cyc < 4800, walk = cyc > 5200 || cyc < 700;
      const bob = Math.sin(t/(walk ? 140 : 560))*(walk ? 1.6 : 1.2)*unit, lunge = atk ? Math.sin((cyc-4300)/500*Math.PI)*10*unit : 0;
      // sombra + halo de luz detrás (contraluz)
      g.globalCompositeOperation = "lighter";
      const hg = g.createRadialGradient(cx, base - 110*unit, 10*unit, cx, base - 110*unit, 190*unit);
      hg.addColorStop(0, "rgba(255,225,150,0.30)"); hg.addColorStop(0.5, "rgba(120,220,170,0.12)"); hg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = hg; g.fillRect(cx - 220*unit, base - 330*unit, 440*unit, 380*unit);
      g.globalCompositeOperation = "source-over";
      g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.ellipse(cx, base + 3*unit, 46*unit, 9*unit, 0, 0, 6.2832); g.fill();
      try{ drawChampFigure(g, B.HERO, cx + lunge, base + bob, sc, 1, t, walk || atk, atk ? {attackAnim:Math.max(1, 520 - (cyc-4300))} : null); }catch(_){}
    }
    // polvo dorado y luciérnagas (aditivo)
    g.globalCompositeOperation = "lighter";
    for(const p of parts){
      p.y -= p.v*dt/1000; p.x += Math.sin(t/900 + p.ph)*0.35*unit;
      if(p.y < H*0.12){ p.y = H*(0.9 + brand()*0.1); p.x = brand()*W; }
      const a = Math.min(1, (p.y - H*0.12)/(H*0.25))*(0.55 + 0.45*Math.sin(t/300 + p.ph));
      g.fillStyle = p.c ? `rgba(255,226,140,${0.8*a})` : `rgba(170,255,205,${0.8*a})`;
      g.fillRect(p.x, p.y, p.s, p.s);
    }
    g.globalCompositeOperation = "source-over";
  }
  function startHero(){ if(!raf){ last = 0; raf = requestAnimationFrame(heroFrame); } }
  // el título vuelve a mostrarse cada vez que se sale al menú: reanimar
  new MutationObserver(()=>{ if(!scr.classList.contains("hidden")) startHero(); }).observe(scr, {attributes:true, attributeFilter:["class"]});
  startHero();
})();
