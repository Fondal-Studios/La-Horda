"use strict";
/* ============================================================
   js/beta/beta-combat.js
   BETA VISUAL IMPACT — impacto de combate: golpes, daño recibido, muerte y definitiva.
   Se monta SOBRE js/rendering/feedback.js y juice.js (hit-stop, temblor, retroceso, cámara lenta ya existen y
   no se duplican): esta capa agrega lo que faltaba para que se VEA — chispas direccionales, tajos, destellos,
   anillos de muerte, la fase de definitiva (viñeta + líneas de velocidad + letterbox) y el momento de caída.
   Nada acá cambia daño, tiempos ni RNG de la partida.
   ============================================================ */
(function(){
  if(!BETA.on) return;
  const B = BETA;
  const HURT = {a:0, dx:0, dy:0};
  B.hurt = HURT;

  /* ---------- golpes: chispas direccionales + tajo + destello ---------- */
  betaWrap("impactFeedback", orig => function(e, dmg, crit, opts, pow, src){
    const r = orig.apply(this, arguments);
    try{
      src = src || (opts && opts.src) || player;
      if(!e || !src || typeof inView!=="function" || !inView(e.x, e.y, 20)) return r;
      if(opts && opts.fromProc) return r;
      const mine = src===player, q = mine ? 1 : 0.5;
      const dx = e.x - src.x, dy = e.y - src.y, d = Math.hypot(dx, dy)||1, ux = dx/d, uy = dy/d;
      const cy = e.y - (e.radius||20)*0.7, rgb = crit ? "255,226,110" : betaHeroRgb(src);
      const n = Math.max(1, Math.round([0, 3, 6, 11, 18][Math.max(1, Math.min(4, pow|0))]*q));
      const big = e.rank==="jefe" || e.rank==="subjefe" || e.rank==="elite";
      betaSparks(e.x, cy, n + (crit ? 4 : 0), rgb, 120 + pow*38 + (crit ? 40 : 0), ux, uy, 1.5 - pow*0.12, 340 + pow*70, pow >= 3 ? 1.6 : 1);
      if(pow >= 2) bfxSpawn({k:5, x:e.x - ux*4, y:cy, r0:6, r1:(big ? 34 : 26) + pow*3, rot:Math.atan2(uy, ux) + Math.PI, rgb:"255,255,255", life:190, w:2.4 + pow*0.5, a:0.9});
      if(pow >= 3 || crit) bfxSpawn({k:4, x:e.x, y:cy, s:5 + pow*2, rgb:crit ? "255,235,150" : rgb, life:230, a:1});
      if(pow >= 3 && mine) betaRing(e.x, e.y + 4, 8, 34 + pow*8, rgb, 320, 2.5, 0.85);
    }catch(err){}
    return r;
  });

  /* ---------- DEMO (solo la partida rápida del título): botín de muestra en los primeros 30 s ----------
     En una partida normal un común suelta botín con 0,5 % de probabilidad: en 30 s casi nunca se ve una caída.
     En la demo, la 5.ª baja suelta un objeto Raro (como mínimo) y la 11.ª un Muy Raro. Usa el mismo
     groundLootDrop del juego (pity, materialización y piso de rareza incluidos); no se activa fuera de la demo. */
  const DEMO_DROPS = {5:"raro", 11:"muyraro"};

  /* ---------- muerte de un enemigo ---------- */
  betaWrap("killEnemy", orig => function(e){
    const r = orig.apply(this, arguments);
    try{
      if(B.demo && e && typeof kills!=="undefined" && DEMO_DROPS[kills] && typeof groundLootDrop==="function" && !e.noLoot){
        const f = DEMO_DROPS[kills]; B.stats.demoDrops = (B.stats.demoDrops||0) + 1;
        groundLootDrop(e.x, e.y, f==="raro" ? "B" : "A", 1, currentArena, "named", false, null, f);
      }
    }catch(err){}
    try{
      if(!e || typeof inView!=="function" || !inView(e.x, e.y, 30)) return r;
      B.stats.death++;
      const big = e.rank==="jefe" || e.rank==="subjefe" || e.rank==="elite";
      const rad = e.radius || 20, cy = e.y - rad*0.5;
      // almas que se desprenden: motas verde-agua que suben (se leen en la oscuridad del bosque)
      betaMotes(e.x, cy, big ? 14 : 5, big ? "255,215,120" : "190,255,225", rad*1.4, 46, 900);
      if(typeof bfxSpawn==="function") bfxSpawn({k:4, x:e.x, y:cy, s:big ? 9 : 5, rgb:"255,255,255", life:260});
      betaRing(e.x, e.y + 4, rad*0.4, rad*(big ? 3.4 : 1.9), big ? "255,200,90" : "170,255,215", big ? 520 : 340, big ? 3.2 : 2, big ? 0.95 : 0.7);
      if(big){
        betaSparks(e.x, cy, 18, "255,210,110", 210, 0, 0, 0, 520, 1.6);
        bfxSpawn({k:6, x:e.x, y:e.y + 4, r0:rad*0.5, r1:rad*3.2, rot:brand()*6, rgb:"255,200,90", life:480});
        betaFlash(e.rank==="jefe" ? 0.16 : 0.07, "255,220,150");
      }
    }catch(err){}
    return r;
  });

  /* ---------- definitiva del jugador ---------- */
  betaWrap("castAbility", orig => function(caster, sk, isUlt, idx){
    const r = orig.apply(this, arguments);
    try{
      if(isUlt && caster && caster===player && player.alive){
        B.stats.ult++;
        const rgb = betaHeroRgb(player);
        B.ult.t = B.ult.dur; B.ult.rgb = rgb;
        betaRing(player.x, player.y + 6, 10, 280, rgb, 700, 4.5, 1);
        betaRing(player.x, player.y + 6, 6, 190, "255,255,255", 520, 3, 0.9);
        bfxSpawn({k:6, x:player.x, y:player.y + 6, r0:18, r1:230, rot:0.2, rgb, life:620});
        bfxSpawn({k:7, x:player.x, y:player.y + 6, r1:170, w:34, rgb, life:560, a:0.6});
        betaSparks(player.x, player.y - 14, 12, rgb, 220, 0, 0, 0, 520, 1.6);
        betaFlash(0.12, rgb);
        if(typeof camPunch==="function") camPunch(0.06, 520);
        betaHaptic([28, 24, 50]);
      }
    }catch(err){}
    return r;
  });

  /* ---------- daño y caída del jugador ---------- */
  betaWrap("damageHero", orig => function(h, amount, src){
    const was = h && h.alive, hp0 = h ? h.hp : 0;
    const r = orig.apply(this, arguments);
    try{
      if(h===player && was){
        const lost = Math.max(0, hp0 - h.hp);
        if(lost > 0){
          const f = Math.min(1, lost/Math.max(1, h.maxHp));
          HURT.a = Math.min(0.85, Math.max(HURT.a, 0.18 + f*2.4));
          if(src && typeof src.x==="number"){ const dx = src.x - h.x, dy = src.y - h.y, d = Math.hypot(dx, dy)||1; HURT.dx = dx/d; HURT.dy = dy/d; } else { HURT.dx = 0; HURT.dy = 0; }
          if(f > 0.06) betaHaptic(f > 0.18 ? [40, 30, 60] : 18);
          if(inView(h.x, h.y, 10)) betaSparks(h.x, h.y - 12, Math.min(10, 3 + Math.round(f*30)), "255,70,50", 130, -(HURT.dx||0), -(HURT.dy||0), 2.2, 320, 1.3);
        }
        if(!h.alive){
          B.stats.playerDeath++;
          B.dead.t = B.dead.dur;
          betaRing(h.x, h.y + 6, 10, 200, "255,70,60", 900, 4, 0.9);
          betaMotes(h.x, h.y - 10, 16, "255,120,100", 40, 50, 1100);
          betaHaptic([60, 40, 90]);
        }
      }
    }catch(err){}
    return r;
  });

  /* ---------- aparición al empezar la partida (primeros segundos) ---------- */
  betaWrap("startRun", orig => function(fromLevel){
    const r = orig.apply(this, arguments);
    try{
      bfxReset();
      if(betaArenaOn() && (!fromLevel || fromLevel===1) && player){
        B.stats.intro++;
        B.intro.t = B.intro.dur;
        const rgb = betaHeroRgb(player);
        bfxSpawn({k:7, x:player.x, y:player.y + 6, r1:260, w:60, rgb:"190,255,220", life:1500, a:0.95});
        betaRing(player.x, player.y + 6, 8, 240, "190,255,220", 1100, 4, 1);
        betaRing(player.x, player.y + 6, 4, 150, rgb, 800, 3, 0.9);
        bfxSpawn({k:6, x:player.x, y:player.y + 6, r0:14, r1:200, rot:0, rgb:"190,255,220", life:900});
        betaMotes(player.x, player.y, 26, "190,255,220", 90, 70, 1500);
        if(typeof camPunch==="function") camPunch(0.05, 1100);
      }
    }catch(err){}
    return r;
  });

  /* ---------- dibujo de pantalla (debajo del HUD, encima del mundo) ---------- */
  let _vigCv = null, _vigW = 0, _vigH = 0;
  function vignette(W, H){
    if(_vigCv && _vigW===W && _vigH===H) return _vigCv;
    _vigCv = document.createElement("canvas"); _vigCv.width = W; _vigCv.height = H; _vigW = W; _vigH = H;
    const g = _vigCv.getContext("2d"), cx = W/2, cy = H*0.52, R = Math.hypot(W, H)*0.55;
    const gr = g.createRadialGradient(cx, cy, R*0.28, cx, cy, R);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.62, "rgba(2,10,6,0.20)"); gr.addColorStop(1, "rgba(2,8,6,0.78)");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    return _vigCv;
  }
  B.vignette = vignette;
  function ease(x){ return x<0 ? 0 : x>1 ? 1 : x*x*(3-2*x); }

  function drawScreen(dtMs){
    const W = VW, H = VH, now = performance.now();
    if(dtMs){
      if(B.ult.t > 0) B.ult.t = Math.max(0, B.ult.t - dtMs);
      if(B.intro.t > 0) B.intro.t = Math.max(0, B.intro.t - dtMs);
      if(B.dead.t > 0 && state==="playing") B.dead.t = Math.max(0, B.dead.t - dtMs);
      HURT.a = Math.max(0, HURT.a - dtMs/520);
      B.flash.a = Math.max(0, B.flash.a - dtMs/260);
    }
    ctx.save(); // (la transformación base del lienzo ya escala VW×VH: no se resetea)
    // ---- viñeta propia de la arena (profundidad + foco en el jugador) ----
    if(betaArenaOn() && !(player && player.duelActive)){
      ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true; ctx.drawImage(vignette(W, H), 0, 0);
    }
    // ---- definitiva: viñeta del color del héroe, líneas de velocidad, letterbox ----
    if(B.ult.t > 0){
      const p = 1 - B.ult.t/B.ult.dur, inn = ease(p/0.14), out = 1 - ease((p-0.55)/0.45), k = Math.min(inn, out);
      const rgb = B.ult.rgb;
      const g = ctx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, Math.hypot(W, H)*0.55);
      g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(1, `rgba(${rgb},${0.3*k})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if(!betaReduceMotion()){
        ctx.strokeStyle = `rgba(255,255,255,${0.12*k})`; ctx.lineWidth = 1.5; ctx.beginPath();
        const sp = player && typeof worldToScreen==="function" ? worldToScreen(player.x, player.y) : {x:W/2, y:H/2};
        for(let i=0;i<22;i++){
          const a = i*0.2856 + Math.sin(i*12.9898)*0.08, r0 = H*(0.34 + 0.1*((i*37)%7)/7) + p*H*0.25, r1 = r0 + H*(0.12 + 0.08*((i*53)%5)/5);
          ctx.moveTo(sp.x + Math.cos(a)*r0, sp.y + Math.sin(a)*r0); ctx.lineTo(sp.x + Math.cos(a)*r1, sp.y + Math.sin(a)*r1);
        }
        ctx.stroke();
        const bar = Math.round(H*0.045*k);
        ctx.fillStyle = "rgba(0,0,0,0.85)"; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H-bar, W, bar);
      }
    }
    // ---- daño recibido: borde rojo (más fuerte del lado del golpe) ----
    if(HURT.a > 0.01){
      const a = HURT.a, g = ctx.createRadialGradient(W/2, H/2, H*0.35, W/2, H/2, Math.hypot(W, H)*0.55);
      g.addColorStop(0, "rgba(160,0,10,0)"); g.addColorStop(1, `rgba(170,10,16,${0.5*a})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if(HURT.dx || HURT.dy){
        const cx = W/2 + HURT.dx*W*0.52, cy = H/2 + HURT.dy*H*0.52, g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, H*0.55);
        g2.addColorStop(0, `rgba(255,40,30,${0.42*a})`); g2.addColorStop(1, "rgba(255,40,30,0)");
        ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
      }
    }
    // ---- caída del jugador: se desatura y se oscurece ----
    if(B.dead.t > 0){
      const p = 1 - B.dead.t/B.dead.dur, k = ease(p/0.2)*(1 - ease((p-0.25)/0.4)*0.6); // se aclara tras el primer golpe: no tapa el cartel «Caíste»
      ctx.globalCompositeOperation = "saturation"; ctx.fillStyle = `rgba(128,128,128,${0.9*k})`; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      const g = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, Math.hypot(W, H)*0.55);
      g.addColorStop(0, "rgba(40,0,0,0)"); g.addColorStop(1, `rgba(40,0,6,${0.75*k})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // ---- aparición: sale de la oscuridad con un círculo de luz alrededor del héroe ----
    if(B.intro.t > 0){
      const p = 1 - B.intro.t/B.intro.dur, k = 1 - ease(p/0.75);
      const sp = player && typeof worldToScreen==="function" ? worldToScreen(player.x, player.y) : {x:W/2, y:H/2};
      const R = H*(0.22 + 1.1*ease(p/0.8));
      const g = ctx.createRadialGradient(sp.x, sp.y, R*0.35, sp.x, sp.y, R);
      g.addColorStop(0, "rgba(0,6,4,0)"); g.addColorStop(1, `rgba(0,6,4,${0.92*k})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // ---- destello general ----
    if(B.flash.a > 0.01){ ctx.fillStyle = `rgba(${B.flash.rgb},${Math.min(0.5, B.flash.a)})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }

  betaWrap("drawScreenFeedback", orig => function(){
    const r = orig.apply(this, arguments);
    try{
      if(typeof state!=="undefined" && (state==="playing" || state==="paused" || state==="buff" || state==="gameover")) drawScreen(B._dt || 0);
    }catch(err){}
    return r;
  });
})();
