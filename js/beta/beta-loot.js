"use strict";
/* ============================================================
   js/beta/beta-loot.js
   BETA VISUAL IMPACT — presentación del botín por rareza (encima de js/systems/ground-loot.js, que ya trae haz de
   luz, sonido por categoría y nombre flotante; esta capa suma el momento de la caída y la presencia en el piso).

     común      polvo + un destello. Sin ceremonia: no tiene que competir con lo raro.
     raro       anillo azul + chispas que suben + sello giratorio chico.
     muy raro   anillo dorado doble + fuente de chispas + sello con 4 puntas.
     legendario fisura de luz en el piso + columna + cartel "LEGENDARIO" + temblor corto + órbita de motas.
     mítico/set/único  lo anterior + destello de pantalla + sello propio (mítico ✚ rojo · set ⬡ verde · único ✦ violeta).

   La forma del sello es distinta por categoría, así se distingue sin depender del color.
   Solo cosmética: no cambia qué cae, ni con qué probabilidad, ni la lista del piso.
   ============================================================ */
(function(){
  if(!BETA.on) return;
  const B = BETA;
  const LABEL = {comun:"COMÚN", raro:"RARO", muyraro:"MUY RARO", legendario:"LEGENDARIO", mitico:"MÍTICO", set:"DE SET", unico:"ÚNICO"};
  const RANK = {comun:0, raro:1, muyraro:2, legendario:3, mitico:4, set:5, unico:6};
  const rgbOf = t => (typeof GROUND_BEAM!=="undefined" && GROUND_BEAM[t]) || "200,200,200";

  betaWrap("groundLootDrop", orig => function(){
    const before = typeof groundLoot!=="undefined" ? groundLoot.length : 0;
    const g = orig.apply(this, arguments);
    try{
      if(!g || typeof inView!=="function" || !inView(g.x, g.y, 120)) return g;
      B.stats.loot++;
      const rk = RANK[g.tier]||0, rgb = rgbOf(g.tier);
      if(rk===0){ betaSparks(g.x, g.y, 4, "200,200,210", 60, 0, -1, 2.4, 280, 1); return g; }
      betaRing(g.x, g.y + 2, 6, 40 + rk*9, rgb, 520 + rk*70, 2.5 + rk*0.3, 0.9);
      betaSparks(g.x, g.y - 6, 6 + rk*4, rgb, 130 + rk*18, 0, -1, 2.2, 520 + rk*60, rk >= 3 ? 1.7 : 1.2);
      if(rk >= 2) betaRing(g.x, g.y + 2, 4, 70 + rk*6, "255,255,255", 380, 2, 0.8);
      if(rk >= 3){
        bfxSpawn({k:6, x:g.x, y:g.y + 2, r0:10, r1:110 + rk*10, rot:brand()*6, rgb, life:700});
        bfxSpawn({k:7, x:g.x, y:g.y + 2, r1:200 + rk*16, w:30, rgb, life:900, a:0.9});
        betaMotes(g.x, g.y - 20, 12, rgb, 30, 60, 1300);
        if(typeof vfxShake==="function") vfxShake(2.5 + (rk-3)*1.2);
        betaBanner(LABEL[g.tier] || "", g.item && g.item.name || "", rgb, rk >= 4 ? 2800 : 2200);
        betaHaptic(rk >= 4 ? [30, 30, 70] : 28);
      }
      if(rk >= 4) betaFlash(0.14, rgb);
    }catch(err){}
    return g;
  });

  // sello en el piso + órbita de motas, mientras el objeto espera a que lo levanten
  function seal(x, y, rk, rgb, t, id){
    const R = 22 + rk*3, rot = t*(0.6 + rk*0.1) + id;
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(0,0,0,0.55)`; ctx.beginPath(); ctx.ellipse(x, y + 3, R, R*0.5, 0, 0, 6.2832); ctx.stroke();
    ctx.strokeStyle = `rgba(${rgb},0.9)`; ctx.beginPath(); ctx.ellipse(x, y + 3, R, R*0.5, 0, 0, 6.2832); ctx.stroke();
    // forma propia de cada categoría (rotando sobre el piso)
    const n = rk===3 ? 4 : rk===4 ? 4 : rk===5 ? 6 : rk===6 ? 5 : rk===2 ? 4 : 3;
    ctx.beginPath();
    for(let i=0;i<=n;i++){
      const a = rot + i*6.2832/n, rr = (rk===6 && i%2) ? R*0.55 : R*0.95; // único: estrella
      const px = x + Math.cos(a)*rr, py = y + 3 + Math.sin(a)*rr*0.5;
      if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    if(rk===4){ for(let i=0;i<4;i++){ const a = rot + i*1.5708; ctx.moveTo(x, y + 3); ctx.lineTo(x + Math.cos(a)*R*0.95, y + 3 + Math.sin(a)*R*0.48); } } // mítico: cruz
    ctx.stroke();
  }
  betaWrap("groundLootDrawGround", orig => function(){
    const r = orig.apply(this, arguments);
    try{
      if(typeof groundLoot==="undefined" || !groundLoot.length) return r;
      const t = (typeof animNow!=="undefined" ? animNow : performance.now())/1000;
      ctx.save();
      for(const g of groundLoot){
        const rk = RANK[g.tier]||0;
        if(rk < 1 || !inView(g.x, g.y, 60)) continue;
        const rgb = rgbOf(g.tier);
        ctx.globalCompositeOperation = "lighter";
        seal(g.x, g.y, rk, rgb, t, g.id);
        // órbita de motas (más cuanto más raro)
        const n = rk >= 3 ? 3 + (rk-3) : 1;
        for(let i=0;i<n;i++){
          const a = t*(1.4 + i*0.3) + i*6.2832/n + g.id, rr = 16 + rk*2.5 + Math.sin(t*2 + i)*2;
          const ox = g.x + Math.cos(a)*rr, oy = g.y - 14 + Math.sin(a)*rr*0.45 - (Math.sin(t*1.3 + i)*5);
          ctx.fillStyle = `rgba(${rgb},0.95)`; ctx.fillRect(Math.round(ox), Math.round(oy), 2, 2);
          if(typeof glowSprite==="function"){ ctx.globalAlpha = 0.4; ctx.drawImage(glowSprite(rgb), ox - 7, oy - 7, 14, 14); ctx.globalAlpha = 1; }
        }
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.restore();
    }catch(err){}
    return r;
  });

  // Reparación ronda 1 (evaluador): con muchos objetos en el piso los nombres se apilaban y tapaban el HUD.
  // Se dibujan como máximo 4 (los más raros primero, luego los más cercanos); el resto sigue en el piso con su sello.
  betaWrap("groundLootDrawNames", orig => function(){
    const all = groundLoot;
    if(!all || all.length <= 4 || !player) return orig.apply(this, arguments);
    const keep = all.slice().sort((a,b)=>(RANK[b.tier]||0)-(RANK[a.tier]||0) || Math.hypot(player.x-a.x, player.y-a.y) - Math.hypot(player.x-b.x, player.y-b.y)).slice(0, 4);
    groundLoot = keep;
    try{ return orig.apply(this, arguments); } finally { groundLoot = all; }
  });

  // al levantar: la luz sube hacia el jugador (no se pierde en silencio)
  betaWrap("groundLootPick", orig => function(g){
    const info = g ? {x:g.x, y:g.y, tier:g.tier} : null;
    const r = orig.apply(this, arguments);
    try{
      if(r && info && inView(info.x, info.y, 40)){
        const rk = RANK[info.tier]||0, rgb = rgbOf(info.tier);
        betaSparks(info.x, info.y - 10, 5 + rk*3, rgb, 160, 0, -1, 2.6, 420, 1.3);
        betaRing(info.x, info.y + 2, 4, 26 + rk*5, rgb, 320, 2, 0.8);
        if(rk >= 3) betaFlash(0.06 + (rk-3)*0.02, rgb);
      }
    }catch(err){}
    return r;
  });
})();
