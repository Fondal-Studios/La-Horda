"use strict";
/* ============================================================
   js/arenas/common/arena-objectives.js
   OBJETIVOS VARIADOS POR ARENA (niveles 1 a 9 de la campaña).
   Antes casi todas las arenas decían "OBJETIVO: sobrevivir". Cada arena tiene ahora un VERBO propio
   (recoger, escoltar, encender, cazar, apagar, defender) con una regla real y un progreso legible en el
   chip de objetivo (js/ui/goal-guide.js -> objChipText) y en el mundo (marcas dibujadas por objDraw).

   Reglas de diseño
   - Es un BONUS: cumplirlo cura al equipo (+20 % de vida máxima). Fallarlo NO castiga: el nivel
     termina igual por tiempo y la campaña, los jefes y el desbloqueo no cambian. Dificultad no mayor
     que la anterior (el único costo es la presa marcada del objetivo "cazar": +40 % de vida de UN
     enemigo común que ya iba a aparecer).
   - Nivel 10 (jefe), Horda Infinita, Divina, Coliseo/Cristales y el entrenamiento: sin objetivo.
   - COOPERATIVO / SALA: el objetivo vive SOLO en la partida local. En una sala (anfitrión o invitado,
     netMatch != null) objEnabled() es false y el chip vuelve a "sobrevivir": así no hace falta estado
     nuevo en la red (no se toca js/net/*). Documentado en docs/arena-identity/objetivos.md.
   - Los bots no persiguen estos objetivos; el jugador los lleva (si un bot pisa la marca, también cuenta).

   Cinco mecánicas, un verbo por arena (OBJ_DEFS):
     collect  RECOGER  caminar sobre N marcas repartidas por el piso.
     hold     ENCENDER / APAGAR  quedarse dentro de N zonas hasta llenar su barra (se enfría si te vas).
     defend   DEFENDER  un objeto con integridad: cada enemigo pegado lo desgasta; quedarse cerca lo repara.
     escort   ESCOLTAR  una criatura que sigue al guardián hasta una zona segura (la desgastan igual).
     hunt     CAZAR     un enemigo común del nivel queda marcado; matarlo cumple.
   ============================================================ */
const OBJ_DEFS = {
  bosque:    {kind:"collect", verb:"recogé",   noun:"semillas de luz",          color:"#9be36b", glyph:"✿", n:[3,5]},
  acuatica:  {kind:"escort",  verb:"escoltá",  noun:"a la tortuga guía",       color:"#5ad7e8", glyph:"🐢", goalName:"la corriente segura"},
  hielo:     {kind:"hold",    verb:"encendé",  noun:"faros de escarcha",        color:"#ffb04a", glyph:"❄", n:[2,3], dur:3200},
  laberinto: {kind:"hunt",    verb:"cazá",     noun:"al centinela marcado",    color:"#d9b25a", glyph:"☠"},
  infernal:  {kind:"defend",  verb:"defendé",  noun:"el altar",                color:"#ff6a3d", glyph:"✦"},
  fortaleza: {kind:"hold",    verb:"apagá",    noun:"generadores",             color:"#7fd0ff", glyph:"⚙", n:[2,3], dur:3600},
  abismo:    {kind:"collect", verb:"recogé",   noun:"esquirlas del vacío",     color:"#b58cff", glyph:"◆", n:[3,5]},
  micelial:  {kind:"hunt",    verb:"cazá",     noun:"al portaesporas marcado", color:"#d58cff", glyph:"☠"}
};
const OBJ_REWARD_HEAL = 0.20;   // fracción de la vida máxima que cura cumplirlo (solo bonus)
const OBJ_MAX_LEVEL = 9;        // el nivel 10 es del jefe
let OBJ = {on:false, kind:null, def:null, items:[], need:0, done:0, ok:false, fail:false, level:0, t:0, target:null, markAt:0, hp:100, goal:null, npc:null};

function objReset(){ OBJ = {on:false, kind:null, def:null, items:[], need:0, done:0, ok:false, fail:false, level:0, t:0, target:null, markAt:0, hp:100, goal:null, npc:null}; }
// ¿Esta partida usa objetivos? Solo la campaña local (nunca en sala: ver cabecera).
function objEnabled(){
  if(typeof currentArena==="undefined" || !OBJ_DEFS[currentArena]) return false;
  if(typeof divinaMode!=="undefined" && divinaMode) return false;
  if(typeof endlessOn==="function" && endlessOn()) return false;
  if(typeof lanesOn==="function" && lanesOn()) return false;
  if(typeof ALPHA_TRAINING!=="undefined" && ALPHA_TRAINING.active) return false;
  if(typeof netMatch!=="undefined" && netMatch) return false;
  return true;
}
function objActive(){ return OBJ.on && objEnabled() && state==="playing" && !bossActive && runLevel<=OBJ_MAX_LEVEL; }

// ¿Se puede pararse acá? Usa la colisión REAL del arena (la misma que el validador de arenas).
function objWalkable(x, y, rad){
  const t = {x:x, y:y, radius:rad||16};
  clampToArena(t); resolveWallCollision(t);
  return Math.hypot(t.x-x, t.y-y) < 1.5;
}
// Camino recto libre entre dos puntos (para que la meta de la escolta se pueda alcanzar caminando).
function objClearLine(ax, ay, bx, by, rad){
  const n = Math.max(2, Math.ceil(Math.hypot(bx-ax, by-ay)/28));
  for(let i=1;i<=n;i++){ const f = i/n; if(!objWalkable(ax+(bx-ax)*f, ay+(by-ay)*f, rad)) return false; }
  return true;
}
function objPickSpots(n, dMin, dMax, sep, lineFree){
  const out = [], px = player.x, py = player.y;
  for(let tries=0; tries<260 && out.length<n; tries++){
    const a = Math.random()*Math.PI*2, d = dMin + Math.random()*(dMax-dMin);
    const x = px + Math.cos(a)*d, y = py + Math.sin(a)*d;
    if(!objWalkable(x, y, 22)) continue;
    if(out.some(o=>Math.hypot(o.x-x, o.y-y) < sep)) continue;
    if(lineFree && !objClearLine(px, py, x, y, 14)) continue;
    out.push({x:Math.round(x), y:Math.round(y)});
  }
  return out;
}

function objBeginLevel(){
  objReset();
  if(!objEnabled() || !player || runLevel>OBJ_MAX_LEVEL || runLevel>=LEVEL_COUNT) return;
  const def = OBJ_DEFS[currentArena]; OBJ.def = def; OBJ.kind = def.kind; OBJ.level = runLevel;
  const lv = runLevel;
  if(def.kind==="collect"){
    const n = Math.min(def.n[1], def.n[0] + (lv>=5?1:0) + (lv>=8?1:0));
    OBJ.items = objPickSpots(n, 170, 430, 130).map(s=>({x:s.x, y:s.y, got:false, ph:Math.random()*6}));
    OBJ.need = OBJ.items.length;
  } else if(def.kind==="hold"){
    const n = lv>=6 ? def.n[1] : def.n[0];
    OBJ.items = objPickSpots(n, 200, 420, 190).map(s=>({x:s.x, y:s.y, r:58, prog:0, done:false}));
    OBJ.need = OBJ.items.length;
  } else if(def.kind==="defend"){
    const s = objPickSpots(1, 130, 260, 0)[0];
    if(s){ OBJ.items = [{x:s.x, y:s.y, r:34}]; OBJ.hp = 100; OBJ.need = 1; }
  } else if(def.kind==="escort"){
    const s = objPickSpots(1, 60, 120, 0)[0];
    const g = objPickSpots(1, 480, 700, 0, true)[0] || objPickSpots(1, 300, 480, 0, true)[0];
    if(s && g){ OBJ.npc = {x:s.x, y:s.y, r:15, fx:1, fy:0}; OBJ.goal = {x:g.x, y:g.y, r:64, from:{x:s.x, y:s.y}}; OBJ.hp = 100; OBJ.need = 1; }
  } else if(def.kind==="hunt"){
    OBJ.need = 1; OBJ.markAt = levelDuration*(0.12 + Math.random()*0.08);
  }
  OBJ.on = OBJ.need>0;
  if(OBJ.on) { const t = `${def.verb} ${objNounText()}`; showBanner("¡" + t.charAt(0).toUpperCase() + t.slice(1) + "!"); }
}
function objNounText(){
  const d = OBJ.def; if(!d) return "";
  if(OBJ.kind==="collect" || OBJ.kind==="hold") return `${OBJ.need} ${d.noun}`;
  return d.noun;
}

function objComplete(){
  if(OBJ.ok || OBJ.fail) return;
  OBJ.ok = true;
  for(const h of heroes){
    if(!h.alive) continue;
    const add = h.maxHp*OBJ_REWARD_HEAL*arenaRuleHealMult();
    h.hp = Math.min(h.maxHp, h.hp + add);
    if(typeof floatText==="function") floatText(h.x, h.y-34, "+"+Math.round(add), "heal");
  }
  const at = OBJ.items[0] || OBJ.npc || player;
  if(typeof vfxShock==="function") vfxShock(at.x, at.y, 20, 220, "255,230,150", 700, 2);
  showBanner("¡OBJETIVO CUMPLIDO! El equipo recupera vida");
}
function objFailed(why){
  if(OBJ.ok || OBJ.fail) return;
  OBJ.fail = true;
  showBanner(why || "Objetivo perdido · seguí sobreviviendo");
}

// Enemigos comunes pegados a (x,y): desgastan al objeto que se defiende / escolta.
function objContactCount(x, y, r){
  let n = 0;
  for(const e of enemies){
    if(!e.alive || e.rank==="jefe" || e.rank==="subjefe") continue;
    if(Math.hypot(e.x-x, e.y-y) < r + (e.radius||14) + 8){ if(++n>=3) break; }
  }
  return n;
}
function objHeroNear(x, y, r){ for(const h of heroes) if(h.alive && Math.hypot(h.x-x, h.y-y) < r) return h; return null; }
function objDrainHp(x, y, r, dt){
  const c = objContactCount(x, y, r);
  const near = objHeroNear(x, y, 150);
  let d = c*3.6 - (near ? 2.6 : 0) - (c===0 ? 0.8 : 0);   // %/s
  OBJ.hp = Math.max(0, Math.min(100, OBJ.hp - d*dt/1000));
}

function objUpdate(dt){
  if(!OBJ.on || !objEnabled() || state!=="playing") return;
  if(levelClearing>0){
    // fin del nivel: "defender" se cumple resistiendo hasta el final
    if(!OBJ.ok && !OBJ.fail && OBJ.kind==="defend" && OBJ.hp>0) objComplete();
    return;
  }
  if(bossActive || OBJ.ok || OBJ.fail || !player) return;
  OBJ.t += dt;
  const k = OBJ.kind;
  if(k==="collect"){
    for(const it of OBJ.items){
      if(it.got) continue;
      if(objHeroNear(it.x, it.y, 30)){
        it.got = true; OBJ.done++;
        if(typeof vfxBurst==="function") vfxBurst(it.x, it.y, 10, [OBJ.def.color, "#ffffff"], 90, 420, 3, 2, 0.4);
        if(typeof playSfx==="function") try{ playSfx("pickup"); }catch(e){}
      }
    }
    if(OBJ.done>=OBJ.need) objComplete();
  } else if(k==="hold"){
    OBJ.done = 0;
    for(const z of OBJ.items){
      if(z.done){ OBJ.done++; continue; }
      if(objHeroNear(z.x, z.y, z.r)) z.prog += dt;
      else z.prog = Math.max(0, z.prog - dt*0.5);
      if(z.prog >= OBJ.def.dur){
        z.prog = OBJ.def.dur; z.done = true; OBJ.done++;
        if(typeof vfxBurst==="function") vfxBurst(z.x, z.y, 14, [OBJ.def.color, "#ffffff"], 110, 520, 3, 2, 0.5);
      }
    }
    if(OBJ.done>=OBJ.need) objComplete();
  } else if(k==="defend"){
    const o = OBJ.items[0]; if(!o) return;
    objDrainHp(o.x, o.y, o.r, dt);
    if(OBJ.hp<=0) objFailed("El altar cayó · seguí sobreviviendo");
  } else if(k==="escort"){
    const n = OBJ.npc, g = OBJ.goal; if(!n || !g) return;
    // sigue al guardián; no se separa de él
    let lead = null, ld = Infinity;
    if(player.alive){ lead = player; ld = Math.hypot(player.x-n.x, player.y-n.y); }   // sigue a QUIEN JUEGA (los bots no la guían)
    else for(const h of heroes){ if(!h.alive) continue; const d = Math.hypot(h.x-n.x, h.y-n.y); if(d<ld){ ld = d; lead = h; } }
    if(lead && ld > 80){
      const spd = Math.min(165, (lead.baseSpeed||160)*0.82), step = Math.min(spd*dt/1000, ld-70);
      const dx = (lead.x-n.x)/ld, dy = (lead.y-n.y)/ld;
      const ox = n.x, oy = n.y;
      n.x += dx*step; n.y += dy*step; n.fx = dx; n.fy = dy;
      const t = {x:n.x, y:n.y, radius:14}; clampToArena(t); resolveWallCollision(t); n.x = t.x; n.y = t.y;
      if(Math.hypot(n.x-ox, n.y-oy) < 0.05*step) n.stuck = (n.stuck||0) + dt; else n.stuck = 0;
    }
    objDrainHp(n.x, n.y, n.r, dt);
    if(OBJ.hp<=0) return objFailed("La tortuga se perdió · seguí sobreviviendo");
    if(Math.hypot(n.x-g.x, n.y-g.y) < g.r) objComplete();
  } else if(k==="hunt"){
    if(!OBJ.target){
      if(OBJ.t >= OBJ.markAt){
        if(OBJ.t > levelDuration*0.62) return objFailed("El cazador se escapó · seguí sobreviviendo");
        const c = enemies.filter(e=>e.alive && e.rank!=="jefe" && e.rank!=="subjefe" && e.rank!=="elite" && !activeChampion
          && Math.hypot(e.x-player.x, e.y-player.y) < 900);
        if(c.length){
          const e = c[(Math.random()*c.length)|0];
          e._objMark = true; e.hp = e.maxHp = Math.round(e.maxHp*1.4);
          OBJ.target = e; showBanner("¡Presa marcada! Cazala");
        } else OBJ.markAt = OBJ.t + 1000;
      }
    } else if(!OBJ.target.alive){
      OBJ.done = 1; objComplete();
    }
  }
}

// Texto del chip de objetivo (sin el tiempo). null = sin objetivo propio (se usa "sobrevivir").
function objChipText(){
  if(!OBJ.on || !objEnabled() || OBJ.level!==runLevel) return null;
  const d = OBJ.def, k = OBJ.kind;
  if(OBJ.ok) return "✔ objetivo cumplido · sobrevivir";
  if(OBJ.fail) return null;
  if(k==="collect" || k==="hold") return `${d.verb} ${d.noun} ${OBJ.done}/${OBJ.need}`;
  if(k==="defend") return `${d.verb} ${d.noun} · integridad ${Math.round(OBJ.hp)}%`;
  if(k==="escort"){
    const n = OBJ.npc, g = OBJ.goal; if(!n || !g) return null;
    const tot = Math.max(1, Math.hypot(g.x-g.from.x, g.y-g.from.y)), left = Math.max(0, Math.hypot(g.x-n.x, g.y-n.y) - g.r);
    return `${d.verb} ${d.noun} · llegó ${Math.round(Math.max(0, Math.min(1, 1-left/tot))*100)}% · salud ${Math.round(OBJ.hp)}%`;
  }
  if(k==="hunt") return OBJ.target ? `${d.verb} ${d.noun} ☠` : `${d.verb} ${d.noun} · aparece en breve`;
  return null;
}

/* ---------------- dibujo en el mundo ---------------- */
function _objBar(x, y, w, f, col){
  ctx.fillStyle = "rgba(10,8,12,0.8)"; ctx.fillRect(x-w/2-1, y-1, w+2, 6);
  ctx.fillStyle = col; ctx.fillRect(x-w/2, y, w*Math.max(0, Math.min(1, f)), 4);
}
function objDraw(){
  if(!OBJ.on || !objEnabled() || OBJ.level!==runLevel || state!=="playing") return;
  const now = animNow/1000, d = OBJ.def, col = d.color, k = OBJ.kind;
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if(k==="collect"){
    for(const it of OBJ.items){
      if(it.got || !inView(it.x, it.y, 60)) continue;
      const bob = Math.sin(now*3 + it.ph)*3;
      ctx.globalAlpha = 0.35 + 0.2*Math.sin(now*4 + it.ph);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(it.x, it.y, 26, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(10,8,12,0.85)"; ctx.beginPath(); ctx.arc(it.x, it.y-8+bob, 13, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = pxFont(17); drawCanvasIcon(ctx, d.glyph, it.x, it.y-8+bob, 17, "#fff");
    }
  } else if(k==="hold"){
    for(const z of OBJ.items){
      if(!inView(z.x, z.y, z.r+60)) continue;
      const f = z.prog/d.dur;
      ctx.globalAlpha = z.done ? 0.7 : 0.6 + 0.25*Math.sin(now*4);
      ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.setLineDash(z.done ? [] : [8,6]);
      ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = z.done ? 0.2 : 0.09; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI*2); ctx.fill();
      if(z.done){ ctx.globalAlpha = 0.18; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI*2); ctx.fill(); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(10,8,12,0.85)"; ctx.beginPath(); ctx.arc(z.x, z.y-6, 14, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(z.x, z.y-6, 14, -Math.PI/2, -Math.PI/2 + Math.PI*2*f); ctx.stroke();
      ctx.fillStyle = z.done ? col : "#fff"; ctx.font = pxFont(17); drawCanvasIcon(ctx, d.glyph, z.x, z.y-6, 17, z.done ? col : "#fff");
    }
  } else if(k==="defend"){
    const o = OBJ.items[0];
    if(o && inView(o.x, o.y, 80)){
      ctx.globalAlpha = 0.3 + 0.15*Math.sin(now*3);
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([6,6]);
      ctx.beginPath(); ctx.arc(o.x, o.y, 150, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#2a2220"; ctx.fillRect(o.x-26, o.y-38, 52, 42);
      ctx.fillStyle = "#4a3b34"; ctx.fillRect(o.x-26, o.y-38, 52, 8);
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(o.x-26, o.y-38, 52, 42);
      ctx.fillStyle = col; ctx.font = pxFont(32); drawCanvasIcon(ctx, d.glyph, o.x, o.y-16, 30, col);
      _objBar(o.x, o.y-50, 56, OBJ.hp/100, OBJ.hp>40 ? col : "#ff4a4a");
    }
  } else if(k==="escort"){
    const g = OBJ.goal, n = OBJ.npc;
    if(g && inView(g.x, g.y, g.r+60)){
      ctx.globalAlpha = 0.45 + 0.25*Math.sin(now*4);
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([9,6]);
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 0.15; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = "#fff"; ctx.font = pxFont(14); ctx.fillText("META", g.x, g.y);
    }
    if(n && inView(n.x, n.y, 60)){
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(n.x, n.y+4, 13, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#3f8f6a"; ctx.beginPath(); ctx.ellipse(n.x, n.y-8, 20, 14, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#8fd7a5"; ctx.beginPath(); ctx.arc(n.x + (n.fx>=0?18:-18), n.y-10, 7, 0, Math.PI*2); ctx.fill();
      _objBar(n.x, n.y-34, 40, OBJ.hp/100, OBJ.hp>40 ? col : "#ff4a4a");
    }
  } else if(k==="hunt"){
    const e = OBJ.target;
    if(e && e.alive && inView(e.x, e.y, 80)){
      const r = (e.radius||16) + 14 + Math.sin(now*6)*2;
      ctx.globalAlpha = 0.9; ctx.strokeStyle = "#ff4a4a"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(e.x, e.y-4, r, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = "#ff4a4a"; ctx.font = pxFont(18); drawCanvasIcon(ctx, "☠", e.x, e.y - r - 8, 18, "#ff4a4a");
      _objBar(e.x, e.y + r + 4, 34, e.hp/e.maxHp, "#ff4a4a");
    }
  }
  ctx.restore();
}
// Flechas en el borde de la pantalla hacia lo que falta (marcas fuera de cámara).
function objDrawScreen(){
  if(!OBJ.on || !objEnabled() || OBJ.level!==runLevel || state!=="playing" || !player || !player.alive || OBJ.ok || OBJ.fail) return;
  const now = animNow/1000, col = OBJ.def.color, m = 30;
  let pts = [];
  if(OBJ.kind==="collect") pts = OBJ.items.filter(i=>!i.got);
  else if(OBJ.kind==="hold") pts = OBJ.items.filter(i=>!i.done);
  else if(OBJ.kind==="defend") pts = OBJ.items;
  else if(OBJ.kind==="escort") pts = OBJ.goal ? [OBJ.goal] : [];
  else if(OBJ.kind==="hunt") pts = OBJ.target && OBJ.target.alive ? [OBJ.target] : [];
  pts.sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y));
  const p = pts[0]; if(!p || inView(p.x, p.y, -40)) return;
  const s = worldToScreen(p.x, p.y), cx = VW/2, cy = VH/2;
  const dx = s.x-cx, dy = s.y-cy;
  const kk = Math.min((VW/2 - m)/Math.abs(dx||1e-6), (VH/2 - m)/Math.abs(dy||1e-6));
  const x = cx + dx*kk, y = cy + dy*kk, a = Math.atan2(dy, dx);
  ctx.save(); ctx.translate(x, y);
  ctx.globalAlpha = 0.75 + 0.25*Math.sin(now*5);
  ctx.fillStyle = "rgba(10,8,12,0.8)"; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  ctx.rotate(a); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(14, -6); ctx.lineTo(14, 6); ctx.closePath(); ctx.fill();
  ctx.rotate(-a); ctx.fillStyle = "#fff"; ctx.font = pxFont(14); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  drawCanvasIcon(ctx, OBJ.def.glyph, 0, 1, 14, "#fff");
  ctx.restore();
}
