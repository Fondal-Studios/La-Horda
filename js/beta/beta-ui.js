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
    '<div class="bt-cta-menu"><div class="bt-cta-menu-sub">Campaña, guardianes y tienda</div></div>' +
    '<div class="bt-cta-meta"><span class="ui-tag">Sylva · Cazadora</span><span class="ui-tag new">Ruinas Élficas</span></div>';
  scr.insertBefore(bg, scr.firstChild);
  const canvas0 = $("title-canvas");
  if(canvas0) canvas0.insertAdjacentElement("afterend", cv); else scr.appendChild(cv);
  scr.appendChild(cta);
  // el acceso al menú/campaña (mismo nodo, mismo id y eventos) pasa a la columna del CTA, justo bajo JUGAR AHORA
  const contBtn0 = $("title-continue-btn"), menuBox = cta.querySelector(".bt-cta-menu");
  if(contBtn0 && menuBox) menuBox.insertBefore(contBtn0, menuBox.firstChild);
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

  /* ---- telón de fondo: key-art pixel de TODA La Horda (11 arenas en franjas + siluetas de enemigos/guardianes).
         Generado por tools/art/menu/make_title_key_art.py; la variante apaisada (1280x592) cubre móviles. ---- */
  const kaWide = new Image(), kaMob = new Image(); let kaOK = false;
  kaWide.onload = ()=>{ kaOK = true; }; kaWide.src = "assets/ui/title-horda-1280x720.png"; kaMob.src = "assets/ui/title-horda-1280x592.png";
  function backdrop(g, W, H, unit, t){
    g.fillStyle = "#06070b"; g.fillRect(0, 0, W, H);
    const img = (W/H > 2.0 && kaMob.complete && kaMob.naturalWidth) ? kaMob : kaWide;
    if(!kaOK && !(img.complete && img.naturalWidth)) return;
    g.imageSmoothingEnabled = false;
    const k = Math.max(W/img.naturalWidth, H/img.naturalHeight), dw = img.naturalWidth*k, dh = img.naturalHeight*k;
    g.drawImage(img, (W - dw)/2, H - dh, dw, dh);          // cubre el lienzo; el recorte sobrante queda arriba
    // luz tenue que respira sobre la horda
    g.globalCompositeOperation = "lighter";
    const pul = 0.5 + 0.5*Math.sin(t/900), gl = g.createRadialGradient(W*0.30, H*0.78, 4, W*0.30, H*0.78, H*0.6);
    gl.addColorStop(0, `rgba(255,190,90,${0.10 + 0.06*pul})`); gl.addColorStop(1, "rgba(255,190,90,0)");
    g.fillStyle = gl; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "source-over";
    const v = g.createRadialGradient(W*0.38, H*0.6, H*0.3, W*0.5, H*0.55, Math.hypot(W, H)*0.62); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,4,2,0.55)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  }

  /* ---- escena de combate en bucle: cinco guardianes de roles distintos (Aldric tanque, San Martín, Sylva a distancia,
         Thalen mago, Elyra apoyo) contra un jefe de la arena de hielo (Ángel Caído de Hielo; NO el Rey de la Horda) y
         tres bichos comunes. Mismo arte real que la partida (drawChampFigure / _cxDrawEnemy del Códice). El tiempo
         lo manda t (sin estado): cada actor tiene su ciclo de ataque, con proyectiles y destellos simples.
         Compone a la izquierda del CTA (se mide en pantalla) para no tapar botones, logo, idioma ni pie. ---- */
  const BOSS = "angel_caido_hielo", MOBS = ["golem_hielo", "lobo_artico", "hada_escarcha"];
  const HEROES = [ // fx = posición en el campo (0..1 del ancho libre); row 1 = segunda fila (más atrás)
    {k:"tanque",     fx:0.43, row:0, per:3200, off:0,    kind:"melee"},
    {k:"libertador", fx:0.26, row:0, per:3800, off:900,  kind:"melee"},
    {k:"soporte",    fx:0.09, row:0, per:4800, off:2000, kind:"heal"},
    {k:"cazadora",   fx:0.18, row:1, per:2600, off:300,  kind:"arrow"},
    {k:"mago",       fx:0.34, row:1, per:3400, off:1500, kind:"bolt"}
  ];
  const BATTLE_GROUPS = HEROES.map(h => "ch:" + h.k).concat(["ar:hielo"]);
  const STATIC_T = 4160;   // cuadro fijo (Reducir movimiento): flecha y hechizo en vuelo, golpe del tanque
  let raf = 0, last = 0, t = 0, parts = [], groupsAsked = false, lastStatic = -1e9, ents = {}, normAt = 0;
  const mkEnemy = type => (typeof _cxFakeEnemy==="function") ? _cxFakeEnemy(type) : null;
  function groupReady(gk){ try{ return typeof _alGroupReady!=="function" || _alGroupReady(gk); }catch(_){ return true; } }
  const cyc = (tt, per, off) => ((tt - off) % per + per) % per;
  const sm = x => Math.max(0, Math.min(1, x));
  function spark(g, x, y, u, age, col){ // destello de impacto: anillo + 6 chispas
    if(age < 0 || age > 300) return;
    const q = age/300, r = (5 + 20*q)*u;
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 1 - q;
    g.fillStyle = col; g.fillRect(x - r*0.5, y - r*0.12, r, Math.max(2, 2.4*u)); g.fillRect(x - r*0.12, y - r*0.5, Math.max(2, 2.4*u), r);
    for(let i=0;i<6;i++){ const a = i*1.047 + 0.4; g.fillRect(x + Math.cos(a)*r, y + Math.sin(a)*r, 3*u, 3*u); }
    g.restore();
  }
  function bolt(g, x0, y0, x1, y1, q, u, kind){ // proyectil simple con estela
    if(q <= 0 || q >= 1) return;
    const x = x0 + (x1 - x0)*q, y = y0 + (y1 - y0)*q - Math.sin(q*Math.PI)*(kind==="arrow" ? 10 : 4)*u;
    g.save();
    if(kind === "arrow"){
      g.fillStyle = "#e8d9a8"; g.fillRect(x - 7*u, y - 1*u, 12*u, 2*u);
      g.fillStyle = "#fff6d0"; g.fillRect(x + 5*u, y - 2*u, 3*u, 4*u);
      g.fillStyle = "#9fd77a"; g.fillRect(x - 8*u, y - 2*u, 3*u, 4*u);
    } else {
      g.globalCompositeOperation = "lighter";
      for(let i=5;i>=1;i--){ g.globalAlpha = 0.14*(6-i); g.fillStyle = kind==="ice" ? "#8fd8ff" : "#c79bff"; const s = (7 - i)*u; g.fillRect(x - (x1>x0?1:-1)*i*5*u - s/2, y - s/2, s, s); }
      g.globalAlpha = 1; g.fillStyle = kind==="ice" ? "#eaffff" : "#fff0ff"; g.fillRect(x - 4*u, y - 4*u, 8*u, 8*u);
    }
    g.restore();
  }
  function heroFrame(now){
    if(scr.classList.contains("hidden")){ raf = 0; return; }
    raf = requestAnimationFrame(heroFrame);
    const still = !!(typeof JUICE!=="undefined" && JUICE.reduceMotion);   // incluye prefers-reduced-motion (juice.js)
    if(still ? (now - lastStatic < 500) : (now - last < 33)) return;
    const dt = Math.min(100, now - (last || now)); last = now; lastStatic = now;
    if(!still) t += dt;
    const T = still ? STATIC_T : t;
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if(!w || !h) return;
    if(cv.width !== Math.round(w*dpr) || cv.height !== Math.round(h*dpr)){ cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr); parts = []; }
    const g = cv.getContext("2d"), W = cv.width, H = cv.height, unit = Math.min(W/844, H/390);
    g.clearRect(0, 0, W, H); g.imageSmoothingEnabled = false;
    backdrop(g, W, H, unit, T);
    if(!parts.length){ for(let i=0;i<42;i++) parts.push({x:brand()*W, y:H*(0.25 + brand()*0.7), v:(8 + brand()*22)*unit, s:(1 + brand()*2)*unit, ph:brand()*6.28, c:brand()<0.55}); }
    const loading = playBtn.disabled;
    if(!loading && !groupsAsked){ groupsAsked = true; try{ if(typeof assetsStartGroup==="function") BATTLE_GROUPS.forEach(assetsStartGroup); }catch(_){} } // carga liviana: solo lo del cuadro, ya con "Tocá para continuar"
    if(!loading && typeof drawChampFigure==="function" && typeof _cxDrawEnemy==="function") try{ battle(g, W, H, unit, T, still, now); }catch(e){ if(!battle.warned){ battle.warned = 1; console.error("title battle", e); } }
    // polvo dorado y luciérnagas (aditivo; quietos con Reducir movimiento)
    g.globalCompositeOperation = "lighter";
    for(const p of parts){
      if(!still){ p.y -= p.v*dt/1000; p.x += Math.sin(t/900 + p.ph)*0.35*unit; if(p.y < H*0.12){ p.y = H*(0.9 + brand()*0.1); p.x = brand()*W; } }
      const a = Math.min(1, (p.y - H*0.12)/(H*0.25))*(still ? 0.8 : 0.55 + 0.45*Math.sin(t/300 + p.ph));
      g.fillStyle = p.c ? `rgba(255,226,140,${0.8*a})` : `rgba(170,255,205,${0.8*a})`;
      g.fillRect(p.x, p.y, p.s, p.s);
    }
    g.globalCompositeOperation = "source-over";
  }
  function battle(g, W, H, unit, T, still, now){
    // zona libre = a la izquierda del CTA (en pantalla); en vertical, sobre el CTA
    const sr = scr.getBoundingClientRect(), cr = cta.getBoundingClientRect(), k = W/Math.max(1, cv.clientWidth);
    const portrait = H > W;
    const left = W*0.03, right = portrait ? W*0.97 : Math.max(W*0.4, (cr.left - sr.left)*k - W*0.015);
    const Sw = right - left;
    const floor = portrait ? Math.min(H*0.5, (cr.top - sr.top)*k - H*0.03) : H*0.8;
    const Hh = Math.min(portrait ? H*0.16 : H*0.25, Sw*(portrait ? 0.3 : 0.225));
    if(now - normAt > 700){ normAt = now; if(HEROES.some(o => !_titleNorm[o.k] && groupReady("ch:" + o.k)) && typeof _titleMeasure==="function") try{ _titleMeasure(); }catch(_){} }
    const bossOK = groupReady("ar:hielo") && ENEMY_BASE[BOSS];
    const mB = bossOK && _cxMeasure(BOSS), mM = bossOK ? MOBS.map(_cxMeasure) : [];
    const rowY = r => floor - r*H*0.07;
    // ---- posiciones ----
    const Hb = Hh*(Hh < 100 ? 1.9 : 2.1), kB = mB ? Hb/mB.h : 1, bw = mB ? mB.w*kB : Hh*1.6;
    const bossX = Math.min(left + Sw*0.80, right - bw*0.5), bossY = floor - H*0.01;
    const mobDef = [{x:0.60, r:0, th:0.62}, {x:0.66, r:1, th:0.5}, {x:0.55, r:1, th:0.5}];
    const hx = o => left + Sw*o.fx*(portrait ? 1.7 : 1);
    const tank = HEROES[0], tx = hx(tank);
    const items = [];
    // golpes recibidos (para chispas / retroceso)
    const hits = {boss:[], mob:[[], [], []], tank:[]};
    for(const o of HEROES){
      const c = cyc(T, o.per, o.off), atk = c < 520, hitAt = o.kind==="melee" ? 260 : o.kind==="arrow" ? 250 + 430 : o.kind==="bolt" ? 300 + 500 : -1;
      o._c = c; o._atk = atk;
      if(o.kind==="melee") (o.k==="tanque" ? hits.mob[0] : hits.mob[1]).push(c - hitAt);
      else if(o.kind==="arrow" || o.kind==="bolt") hits.boss.push(c - hitAt);
    }
    // el jefe: carga el ataque y lanza una esquirla de hielo al tanque
    const cB = cyc(T, 4400, 600), bAtk = cB < 620, bossHitTank = cB - (520 + 600);
    hits.tank.push(bossHitTank);
    const mobC = [cyc(T, 2800, 400), cyc(T, 2600, 1300), cyc(T, 3000, 2200)];
    // ---- héroes ----
    for(const o of HEROES){
      const ok = groupReady("ch:" + o.k) && _titleNorm[o.k];
      if(!ok) continue;
      const c = o._c, atk = c < 520, row = o.row;
      let x = hx(o), y = rowY(row);
      const lunge = o.kind==="melee" && atk ? Math.sin(c/520*Math.PI)*Sw*0.045 : 0;
      let sh = 0; if(o.k==="tanque"){ const a = bossHitTank; if(a > 0 && a < 260) sh = Math.sin(a/260*Math.PI*3)*3*unit; }
      const sc = (Hh/34)*Math.max(0.5, Math.min(2.4, _titleNorm[o.k]));
      const ex = atk ? {attackAnim:Math.max(1, 520 - c), _aPrev:1e9, _aDur:520} : null;
      if(ex && (o.kind==="bolt" || o.kind==="heal")) ex._packCastUntil = Infinity;
      items.push({y, draw(){
        g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.ellipse(x + lunge, y + 2*unit, Hh*0.32, Hh*0.07, 0, 0, 6.2832); g.fill();
        drawChampFigure(g, o.k, x + lunge + sh, y + Math.sin(T/(still ? 1e9 : 560) + x)*1*unit, sc, 1, T + o.off, false, ex);
      }});
    }
    // ---- jefe y comunes ----
    if(bossOK && mB){
      const e = ents[BOSS] || (ents[BOSS] = mkEnemy(BOSS));
      e.fx = -1; e.animT = T; e.attackAnim = bAtk ? Math.max(1, 620 - cB) : 0; e.stunTimer = bAtk ? 0 : 1;
      let hb = 0; for(const a of hits.boss) if(a > 0 && a < 260) hb = Math.max(hb, 1 - a/260);
      items.push({y:bossY, draw(){
        g.save(); g.globalCompositeOperation = "lighter";   // aura de jefe (hielo)
        const ag = g.createRadialGradient(bossX, bossY - Hb*0.5, Hb*0.1, bossX, bossY - Hb*0.5, Hb*0.8);
        ag.addColorStop(0, `rgba(130,200,255,${0.16 + 0.12*hb})`); ag.addColorStop(1, "rgba(130,200,255,0)");
        g.fillStyle = ag; g.fillRect(bossX - Hb, bossY - Hb*1.4, Hb*2, Hb*1.6); g.restore();
        g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.ellipse(bossX, bossY + 2*unit, bw*0.4, Hh*0.1, 0, 0, 6.2832); g.fill();
        _cxDrawEnemy(g, e, bossX - mB.cx*kB + hb*4*unit - (bAtk ? Math.sin(cB/620*Math.PI)*5*unit : 0), bossY - mB.bottom*kB, kB);
        if(hb > 0){ g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35*hb; _cxDrawEnemy(g, e, bossX - mB.cx*kB + hb*4*unit, bossY - mB.bottom*kB, kB); g.restore(); }
        // barra de vida del jefe: baja de a poco y se recompone (decorativa)
        const bwid = Math.max(60*unit, bw*0.75), bx = bossX - bwid/2, by = bossY - Hb - 10*unit, hp = 1 - 0.38*((T % 12000)/12000);
        g.fillStyle = "rgba(0,0,0,0.7)"; g.fillRect(bx - 2*unit, by - 2*unit, bwid + 4*unit, 7*unit);
        g.fillStyle = "#b3261e"; g.fillRect(bx, by, bwid*hp, 3*unit); g.fillStyle = "#e65a4f"; g.fillRect(bx, by, bwid*hp, 1.2*unit);
      }});
      MOBS.forEach((type, i) => {
        const m = mM[i]; if(!m) return;
        const d = mobDef[i], me = ents[type] || (ents[type] = mkEnemy(type)), c = mobC[i];
        const kk = (Hh*d.th)/m.h, mAtk = c < 420;
        me.fx = -1; me.animT = T + i*250; me.attackAnim = mAtk ? Math.max(1, 420 - c) : 0; me.stunTimer = mAtk ? 0 : 1;
        let rec = 0; for(const a of hits.mob[i]) if(a > 0 && a < 260) rec = Math.max(rec, 1 - a/260);
        const x = left + Sw*d.x + (mAtk ? -Math.sin(c/420*Math.PI)*Sw*0.03 : 0) + rec*7*unit, y = rowY(d.r);
        items.push({y, draw(){
          g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.ellipse(x, y + 2*unit, m.w*kk*0.4, Hh*0.05, 0, 0, 6.2832); g.fill();
          _cxDrawEnemy(g, me, x - m.cx*kk, y - m.bottom*kk, kk);
        }});
      });
    }
    items.sort((a, b) => a.y - b.y).forEach(it => it.draw());
    // ---- proyectiles, curación y chispas (encima) ----
    const bossC = {x:bossX - bw*0.18, y:bossY - Hb*0.5};
    for(const o of HEROES){
      const c = o._c, y0 = rowY(o.row) - Hh*0.55, x0 = hx(o) + Hh*0.25;
      if(o.kind==="arrow") bolt(g, x0, y0, bossC.x, bossC.y, sm((c - 250)/430) , unit*1.2, "arrow");
      if(o.kind==="bolt")  bolt(g, x0, y0 - Hh*0.1, bossC.x, bossC.y, sm((c - 300)/500), unit*1.3, "magic");
      if(o.kind==="heal" && c > 250 && c < 1500){
        const q = (c - 250)/1250;
        for(const tg of [tank, HEROES[1]]){
          const px = hx(tg), py = rowY(0);
          g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.8*(1 - q);
          g.strokeStyle = "#8dffb0"; g.lineWidth = 2*unit; g.beginPath(); g.ellipse(px, py, Hh*(0.15 + 0.3*q), Hh*(0.05 + 0.1*q), 0, 0, 6.2832); g.stroke();
          g.fillStyle = "#c9ffd8"; for(let i=0;i<4;i++){ const sy = py - q*Hh*0.9 - i*Hh*0.12; g.fillRect(px + (i-1.5)*Hh*0.1, sy, 3*unit, 3*unit); g.fillRect(px + (i-1.5)*Hh*0.1 - 1*unit, sy + 1*unit, 5*unit, 1*unit); }
          g.restore();
        }
      }
    }
    if(mB && bossOK){
      const tgx = tx + Hh*0.2, tgy = rowY(0) - Hh*0.5;
      bolt(g, bossX - bw*0.35, bossY - Hb*0.55, tgx, tgy, sm((cB - 520)/600), unit*1.3, "ice");
      spark(g, tgx, tgy, unit*1.2, bossHitTank, "#bfe8ff");
      for(const a of hits.boss) spark(g, bossC.x + Hb*0.05, bossC.y, unit*1.2, a, "#fff2c0");
      mM.forEach((m, i) => { for(const a of hits.mob[i]) spark(g, left + Sw*mobDef[i].x - 12*unit, rowY(mobDef[i].r) - Hh*mobDef[i].th*0.5, unit*1.1, a, "#ffe9a0"); });
    }
  }
  function startHero(){ if(!raf){ last = 0; raf = requestAnimationFrame(heroFrame); } }
  // el título vuelve a mostrarse cada vez que se sale al menú: reanimar
  new MutationObserver(()=>{ if(!scr.classList.contains("hidden")) startHero(); }).observe(scr, {attributes:true, attributeFilter:["class"]});
  startHero();
})();
