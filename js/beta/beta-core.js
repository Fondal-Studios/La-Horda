"use strict";
/* ============================================================
   js/beta/beta-core.js
   BETA VISUAL IMPACT — núcleo del Vertical Slice (rama feature/beta-visual-impact).

   Reglas de esta capa (ver docs/beta/VISUAL_IMPACT_SLICE.md):
     · Es ADITIVA: no cambia contratos compartidos, red/relay, balance ni guardado. Todo se engancha envolviendo
       funciones globales ya existentes (mismo patrón que tools/ux/playtest.js) y se apaga entero con ?beta=0.
     · Solo cosmética: nunca toca daño, tiempos de simulación, RNG de la partida ni hitboxes.
     · Pool fijo de partículas, sin shadowBlur ni filtros; presupuesto según vfxLoad / "Reducir efectos".
     · "Reducir movimiento" apaga sacudidas, letterbox y zoom; "Reducir efectos intensos" baja a ~35 % las partículas.

   Activación:  index.html?beta=0 → versión de main (sin esta capa).  Por defecto, en esta rama: ENCENDIDA.
   ============================================================ */
// RNG PRIVADO (Mulberry32): la capa visual nunca consume Math.random, que es el de la partida (daño, IA, botín).
// Misma convención que el audio (docs/production/audio-rng-isolation.md). Probado en tools/beta/test-rng-isolation.js.
let _brS = (Date.now() ^ 0x9e3779b9) >>> 0;
function brand(){
  _brS = (_brS + 0x6D2B79F5) >>> 0;
  let t = _brS; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const BETA = (function(){
  let on = true;
  try{
    const v = new URLSearchParams(location.search).get("beta");
    if(v==="0" || v==="off" || v==="false") on = false;
  }catch(e){}
  return {
    on,
    ARENA: "bosque",          // Ruinas Célticas / Élficas
    HERO: "cazadora",         // Sylva, la Cazadora del Bosque
    // contadores para las pruebas (tools/beta/*.js)
    stats: {spark:0, ring:0, death:0, ult:0, loot:0, press:0, ready:0, intro:0, hazard:0, playerDeath:0, drawMs:0, drawN:0},
    ult: {t:0, dur:1100, rgb:"255,220,140"},
    intro: {t:0, dur:2400},
    dead: {t:0, dur:1700},
    flash: {a:0, rgb:"255,255,255"},
    banner: null
  };
})();
function betaOn(){ return BETA.on; }
function betaArenaOn(){ return BETA.on && typeof currentArena!=="undefined" && currentArena===BETA.ARENA; }
function betaReduceMotion(){ return typeof JUICE!=="undefined" && JUICE.reduceMotion; }

/* ---------------- Pool de partículas propias (mundo) ---------------- */
// k: 1 chispa (línea), 2 anillo (elipse que se abre), 3 mota que sube, 4 destello en cruz, 5 tajo (arco),
//    6 rayo de suelo (suelo agrietado de luz), 7 columna de luz
const BFX_MAX = 260;
const bfx = [];
for(let i=0;i<BFX_MAX;i++) bfx.push({on:false, k:0, x:0, y:0, vx:0, vy:0, g:0, life:0, max:1, s:1, r0:0, r1:0, rot:0, rgb:"255,255,255", a:1, w:2});
let _bfxN = 0;
function bfxBudget(n){
  const load = typeof vfxLoad==="number" ? Math.max(0.35, Math.min(1, vfxLoad)) : 1;
  const fb = typeof fxBudget==="function" ? fxBudget(n) : n;
  return Math.max(1, Math.round(fb*load));
}
function bfxAlloc(){
  for(let i=0;i<BFX_MAX;i++){ const p = bfx[(_bfxN+i)%BFX_MAX]; if(!p.on){ _bfxN = (_bfxN+i+1)%BFX_MAX; return p; } }
  return null;
}
function bfxSpawn(o){
  const p = bfxAlloc(); if(!p) return null;
  p.on = true; p.k = o.k; p.x = o.x; p.y = o.y; p.vx = o.vx||0; p.vy = o.vy||0; p.g = o.g||0;
  p.life = p.max = o.life||400; p.s = o.s||2; p.r0 = o.r0||0; p.r1 = o.r1||40; p.rot = o.rot||0;
  p.rgb = o.rgb||"255,255,255"; p.a = o.a===undefined ? 1 : o.a; p.w = o.w||2;
  return p;
}
function bfxReset(){ for(const p of bfx) p.on = false; BETA.ult.t = 0; BETA.intro.t = 0; BETA.dead.t = 0; BETA.flash.a = 0; _betaBannerHide(); }
function bfxUpdate(dt){
  const k = dt/1000;
  for(const p of bfx){
    if(!p.on) continue;
    p.life -= dt;
    if(p.life <= 0){ p.on = false; continue; }
    if(p.k===1 || p.k===3){ p.vy += p.g*k; p.x += p.vx*k; p.y += p.vy*k; if(p.k===1){ p.vx *= 0.94; p.vy *= 0.94; } }
  }
}
// Rayo de color RGB "r,g,b" → #rrggbb no hace falta: se usa rgba() directo con la cadena "r,g,b".
function bfxDraw(now){
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for(const p of bfx){
    if(!p.on) continue;
    const t = 1 - p.life/p.max;           // 0 → 1
    const fade = Math.min(1, p.life/Math.max(60, p.max*0.45)); // se apaga en la segunda mitad
    if(p.k===1){                           // chispa: línea en la dirección del movimiento
      const sp = Math.hypot(p.vx, p.vy)||1, l = Math.min(14, 2 + sp*0.045)*p.s;
      ctx.strokeStyle = `rgba(${p.rgb},${p.a*fade})`; ctx.lineWidth = p.w;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx/sp*l, p.y - p.vy/sp*l); ctx.stroke();
    } else if(p.k===2){                    // anillo plano (perspectiva de piso)
      const r = p.r0 + (p.r1-p.r0)*(1-Math.pow(1-t, 2.2));
      ctx.strokeStyle = `rgba(${p.rgb},${p.a*(1-t)*0.95})`; ctx.lineWidth = Math.max(1, p.w*(1-t*0.7));
      ctx.beginPath(); ctx.ellipse(p.x, p.y, r, r*0.58, 0, 0, 6.2832); ctx.stroke();
    } else if(p.k===3){                    // mota luminosa
      const tw = 0.65 + 0.35*Math.sin(now*9 + p.rot);
      ctx.fillStyle = `rgba(${p.rgb},${p.a*fade*tw})`;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      if(p.s >= 2 && typeof glowSprite==="function"){ ctx.globalAlpha = 0.35*fade*tw; ctx.drawImage(glowSprite(p.rgb), p.x-p.s*3, p.y-p.s*3, p.s*6, p.s*6); ctx.globalAlpha = 1; }
    } else if(p.k===4){                    // destello en cruz (pixel star)
      const a = p.a*(1-t), L = p.s*(1 + (1-t)*1.2);
      ctx.fillStyle = `rgba(${p.rgb},${a})`;
      ctx.fillRect(Math.round(p.x-L), Math.round(p.y), L*2+1, 1); ctx.fillRect(Math.round(p.x), Math.round(p.y-L), 1, L*2+1);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(Math.round(p.x-1), Math.round(p.y-1), 3, 3);
    } else if(p.k===5){                    // tajo: arco que se afina
      const r = p.r0 + (p.r1-p.r0)*Math.min(1, t*2.2), arc = 1.3*(1-t*0.6);
      ctx.strokeStyle = `rgba(${p.rgb},${p.a*(1-t)})`; ctx.lineWidth = Math.max(1, p.w*(1-t));
      ctx.beginPath(); ctx.arc(p.x, p.y, r, p.rot-arc, p.rot+arc); ctx.stroke();
    } else if(p.k===6){                    // rayos radiales en el piso
      ctx.strokeStyle = `rgba(${p.rgb},${p.a*(1-t)*0.7})`; ctx.lineWidth = 2;
      const n = 10, r1 = p.r1*(0.4 + 0.6*Math.min(1, t*3));
      ctx.beginPath();
      for(let i=0;i<n;i++){ const a = p.rot + i*6.2832/n; ctx.moveTo(p.x+Math.cos(a)*p.r0, p.y+Math.sin(a)*p.r0*0.58); ctx.lineTo(p.x+Math.cos(a)*r1, p.y+Math.sin(a)*r1*0.58); }
      ctx.stroke();
    } else if(p.k===7){                    // columna de luz (aparición, botín raro)
      const h = p.r1*Math.min(1, t*4)*(1-Math.max(0, t-0.55)/0.45*0.35), w = p.w*(1-t*0.6);
      const g = ctx.createLinearGradient(0, p.y-h, 0, p.y);
      g.addColorStop(0, `rgba(${p.rgb},0)`); g.addColorStop(0.7, `rgba(${p.rgb},${p.a*(1-t)*0.55})`); g.addColorStop(1, `rgba(${p.rgb},${p.a*(1-t)})`);
      ctx.fillStyle = g; ctx.fillRect(p.x-w/2, p.y-h, w, h);
    }
  }
  ctx.restore();
}

/* ---------------- Primitivas reutilizables ---------------- */
function betaHeroRgb(h){ return (typeof fxHeroRgb==="function" && h) ? fxHeroRgb(h) : "255,230,160"; }
function betaRing(x, y, r0, r1, rgb, life, w, a){ BETA.stats.ring++; return bfxSpawn({k:2, x, y, r0, r1, rgb, life, w:w||3, a:a===undefined?1:a}); }
function betaSparks(x, y, n, rgb, speed, dirX, dirY, spread, life, size){
  n = bfxBudget(n);
  const base = (dirX||dirY) ? Math.atan2(dirY, dirX) : 0, full = !(dirX||dirY);
  for(let i=0;i<n;i++){
    const a = full ? brand()*6.2832 : base + (brand()-0.5)*spread;
    const sp = speed*(0.45 + brand()*0.75);
    bfxSpawn({k:1, x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - speed*0.1, g:220, life:life*(0.6+brand()*0.6), s:size||1, w:(size||1) > 1.4 ? 2 : 1.4, rgb, a:1});
  }
  BETA.stats.spark += n;
}
function betaMotes(x, y, n, rgb, spread, rise, life){
  n = bfxBudget(n);
  for(let i=0;i<n;i++) bfxSpawn({k:3, x:x+(brand()-0.5)*spread, y:y+(brand()-0.5)*spread*0.5, vx:(brand()-0.5)*18, vy:-rise*(0.5+brand()), g:-6, life:life*(0.6+brand()*0.7), s:brand()<0.3 ? 3 : 2, rot:brand()*6, rgb, a:0.95});
}
function betaFlash(a, rgb){ BETA.flash.a = Math.max(BETA.flash.a, a); BETA.flash.rgb = rgb||"255,255,255"; }
function betaHaptic(pattern){ try{ if(typeof hapticPulse==="function" && !betaReduceMotion()) hapticPulse(pattern, true); }catch(e){} }

/* ---------------- Enganches (envolver funciones globales una sola vez) ---------------- */
function betaWrap(name, make){
  const orig = window[name];
  if(typeof orig!=="function" || orig.__beta) return false;
  const w = make(orig); w.__beta = true; w.__orig = orig;
  window[name] = w;
  return true;
}
let _bLast = 0;
function betaFrameDt(){
  const n = performance.now(), d = _bLast ? Math.min(64, n - _bLast) : 16; _bLast = n;
  return typeof state!=="undefined" && state==="playing" ? d : 0;
}

/* ---------------- Cartel de rareza (DOM, una sola vez por hallazgo grande) ---------------- */
function _betaBannerHide(){ const el = document.getElementById("bt-banner"); if(el) el.remove(); BETA.banner = null; }
function betaBanner(kicker, text, rgb, ms){
  if(typeof document==="undefined") return;
  _betaBannerHide();
  const el = document.createElement("div");
  el.id = "bt-banner"; el.setAttribute("role", "status");
  el.style.setProperty("--bt-rgb", rgb);
  const k = document.createElement("div"); k.className = "bt-b-kick"; k.textContent = kicker;
  const t = document.createElement("div"); t.className = "bt-b-text"; t.textContent = text;
  el.appendChild(k); el.appendChild(t);
  document.body.appendChild(el);
  BETA.banner = el;
  setTimeout(()=>{ if(el.parentNode){ el.classList.add("out"); setTimeout(()=>el.remove(), 420); } }, ms||2200);
}

if(BETA.on){
  const apply = ()=>{ try{ document.body.classList.add("beta-visual"); }catch(e){} };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", apply); else apply();
}
