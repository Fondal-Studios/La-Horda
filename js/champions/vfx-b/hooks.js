'use strict';
/* ============================================================
   js/champions/vfx-b/hooks.js — enganches de los efectos propios (2.ª mitad del roster) al motor, SIN tocar la mecánica.
     · Expedición / Ascensión: se envuelve exCastFx / ascCastFx (los puntos donde ya se dibujaba el efecto genérico de kit-shared.js,
       con el radio, origen y fin REALES del lanzamiento). Si la acción tiene receta propia se usa esa; si no, el efecto de siempre.
     · Calidad cinco (Solciju, Veyra): se envuelve qualityFiveFx y se reconoce la acción por el lanzamiento en curso.
     · Clásicos (Aldric, Elyra, Segador, Ismara…): se envuelve castAbility; el área real se recompone con las mismas fórmulas
       (maestría, talentos y evolución capturada de skillEvoOnCast) y se dibuja DESPUÉS del lanzamiento original.
     · Zonas persistentes (portadorObjects: ex_*, as_*, sol_*): "pieles" que siguen el estado real del objeto (radio, vida, pulsos
       restantes) y reemplazan el anillo + glifo genérico solo mientras el objeto exista.
     · Auras de estado (buffs con temporizador real): overlays por héroe que leen los mismos temporizadores del motor.
   KVB.off = true apaga todo (así las pruebas comparan la mecánica con y sin efectos).
   ============================================================ */
const KVB_ACT = {}, KVB_Q5 = {}, KVB_CLASSIC = {}, KVB_PORT = {}, KVB_OBJ = {}, KVB_HEROES = new Set();
const KVB_KEEPCUE = {}; // acciones cuyo aviso original (asCue) se conserva porque ya es fiel y legible
function kvbBind(key, id, keepCue){ KVB_ACT[key] = id; if(keepCue) KVB_KEEPCUE[key] = true; }
function kvbBindQ5(action, id){ KVB_Q5[action] = id; }
function kvbClassic(classKey, kind, fn){ KVB_CLASSIC[classKey + ':' + kind] = fn; KVB_HEROES.add(classKey); }
// Portadores (Ynara, Myla): su lanzamiento pasa por portadorCast, que ya recibe área y duración reales
function kvbPortador(classKey, kind, fn){ KVB_PORT[classKey + ':' + kind] = fn; KVB_HEROES.add(classKey); }
// Piel de un objeto persistente: por tipo (ex_line…) y, si varios campeones comparten el tipo, por clase del dueño
function kvbSkin(kind, spec, classKey){ KVB_OBJ[classKey ? kind + ':' + classKey : kind] = spec; }
function kvbSpecOf(o){ return o.owner ? (KVB_OBJ[o.kind + ':' + o.owner.classKey] || KVB_OBJ[o.kind]) : null; }
const kvbDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Geometría real del lanzamiento (mismos perfiles de apuntado que usan los kits) → [x, y, r, ang, a, b]:
//   línea  : origen, semiancho r, ángulo, a = largo         salto : origen, semiancho r, ángulo, a = largo recorrido
//   cono   : vértice, r = alcance, ángulo, a = semiángulo    punto : punto apuntado, r, ángulo hacia él, (a, b) = origen del lanzamiento
//   sobre sí: posición actual, r, ángulo, (a, b) = posición de origen del lanzamiento
function kvbCastGeom(h, sk, isUlt, r, origin, end){
  const prof = typeof aimProfileOf === 'function' ? aimProfileOf(sk, h) : null, ang = Math.atan2(end.y - origin.y, end.x - origin.x);
  if(prof && prof.type === 'line') return [origin.x, origin.y, r, ang, Math.hypot(end.x - origin.x, end.y - origin.y)];
  if(prof && prof.type === 'cone') return [h.x, h.y, Math.hypot(end.x - h.x, end.y - h.y), Math.atan2(end.y - h.y, end.x - h.x), .85];
  if(prof && prof.type === 'dash') return [origin.x, origin.y, r, ang, Math.hypot(h.x - origin.x, h.y - origin.y)];
  if(prof && prof.type === 'point' && h._lastAimPt) return [h._lastAimPt.x, h._lastAimPt.y, r, Math.atan2(h._lastAimPt.y - origin.y, h._lastAimPt.x - origin.x), origin.x, origin.y];
  return [h.x, h.y, r, ang, origin.x, origin.y];
}
// Héroe de una clase en una posición (los recetas solo reciben números, que son lo que viaja por la red)
function kvbHeroAt(x, y, classKey){ let best = null, bd = 1e9; for(const h of heroes){ if(classKey && h.classKey !== classKey) continue; const d = Math.hypot(h.x - x, h.y - y); if(d < bd){ bd = d; best = h; } } return best; }
(function(){
  function wrap(name, prefix){
    const o = window[name]; if(typeof o !== 'function') return;
    window[name] = function(h, sk, isUlt, r, origin, end){
      const id = !KVB.off && sk && KVB_ACT[prefix + sk.action];
      if(!id) return o.apply(this, arguments);
      const g = kvbCastGeom(h, sk, isUlt, r, origin, end); kvbFx(id, g[0], g[1], g[2], g[3], g[4], g[5]);
    };
  }
  wrap('exCastFx', 'ex:'); wrap('ascCastFx', 'asc:');
  // Calidad cinco: la acción en curso viene del lanzamiento (solcijuCast / veyraCast)
  function ctxWrap(name){
    const o = window[name]; if(typeof o !== 'function') return;
    window[name] = function(h, sk){ const prev = KVB.q5; KVB.q5 = {h, sk}; try{ return o.apply(this, arguments); } finally{ KVB.q5 = prev; } };
  }
  ctxWrap('solcijuCast'); ctxWrap('veyraCast');
  if(typeof qualityFiveFx === 'function'){
    const oQ = qualityFiveFx;
    qualityFiveFx = function(h, draw, ...args){
      if(KVB.off || !h || (h.classKey !== 'solciju' && h.classKey !== 'veyra') || (draw !== kitFx && draw !== kitFxLine)) return oQ.apply(this, arguments);
      const c = KVB.q5, id = c && c.h === h && KVB_Q5[c.sk.action];
      if(!c || c.h !== h){ return; } // efectos de objetos persistentes: los dibuja la piel del objeto
      if(!id) return oQ.apply(this, arguments);
      if(draw === kitFxLine){ const [, ax, ay, bx, by, w] = args; kvbFx(id, ax, ay, w, Math.atan2(by - ay, bx - ax), Math.hypot(bx - ax, by - ay), 0); }
      else kvbFx(id, args[1], args[2], args[3], Math.atan2(h.fy || 0, h.fx || 1), .85, 0);
    };
  }
  // Último punto apuntado (premarcado) y marca de "el lanzamiento sí ocurrió" (castAbility sale antes si está congelado/fusionado)
  const oAim = aimPoint; aimPoint = function(){ const p = oAim.apply(this, arguments); if(p) KVB.lastAim = {x: p.x, y: p.y}; return p; };
  const oFlash = vfxCastFlash; vfxCastFlash = function(){ KVB.castSeen = true; return oFlash.apply(this, arguments); };
})();

/* ---------------- clásicos: castAbility ---------------- */
function kvbScale(c, sk, isUlt, idx, evo){
  const key = isUlt ? 'ult' : (idx === undefined ? 0 : idx);
  try{
    const m = effectiveMasteryFor(c.classKey, key), t = c.classKey ? talentSkillMods(c.classKey, key) : {areaMult: 0, durationMult: 0};
    return {AREA: masteryAreaMult(m) * (1 + t.areaMult) * (evo ? evo.area : 1), DUR: masteryDurationMult(m) * (1 + t.durationMult) * 1};
  }catch(e){ return {AREA: 1, DUR: 1}; }
}
(function(){
  // fn(caster, sk, isUlt, {AREA, DUR}, puntoApuntado, posiciónPrevia) → [id, x, y, r, ang, a, b] o null. El dibujo sale por kvbFx (se repite en los invitados).
  const oCast = castAbility;
  castAbility = function(caster, sk, isUlt, idx){
    const fn = !KVB.off && caster && caster.classKey && sk && KVB_CLASSIC[caster.classKey + ':' + sk.kind];
    if(!fn) return oCast.apply(this, arguments);
    const oEvo = skillEvoOnCast; let evo = null;
    skillEvoOnCast = function(){ evo = oEvo.apply(this, arguments); return evo; };
    KVB.castSeen = false; KVB.lastAim = null; let ret; const pre = {x: caster.x, y: caster.y};
    const before = heroes.map(h => h.hp / Math.max(1, h.maxHp));
    KVB.pre = {pos: pre, hpRatio: before};
    try{ ret = oCast.apply(this, arguments); } finally{ skillEvoOnCast = oEvo; }
    if(KVB.castSeen && caster.alive){ try{ const a = fn(caster, sk, !!isUlt, kvbScale(caster, sk, isUlt, idx, evo), KVB.lastAim, pre, KVB.pre); if(a) kvbFx.apply(null, a); }catch(e){ KVB.err = String(e && e.message || e); } }
    return ret;
  };
  // Portadores (Ynara, Myla): el motor ya entrega área y duración reales a portadorCast
  const oPort = portadorCast;
  portadorCast = function(h, sk, isUlt, dmg, area, dur, power){
    const pre = {x: h.x, y: h.y}; KVB.lastAim = null;
    const ret = oPort.apply(this, arguments);
    const fn = !KVB.off && h && h.classKey && KVB_PORT[h.classKey + ':' + sk.kind];
    if(fn && h.alive){ try{ const a = fn(h, sk, !!isUlt, {AREA: area, DUR: dur}, h._lastAimPt || KVB.lastAim || null, pre); if(a) kvbFx.apply(null, a); }catch(e){ KVB.err = String(e && e.message || e); } }
    return ret;
  };
})();

/* ---------------- pieles de objetos persistentes ---------------- */
// spec: {R(o), loop:'decal' [, period], layers:['g','t'], draw(o,t,layer,R), born(o), pulse(o), upd(o, st), end(o), hideBase=true}
KVB.objSeen = new Map();
function kvbObjUpdate(){
  if(typeof portadorObjects === 'undefined') return;
  const seen = KVB.objSeen, now = new Set();
  for(const o of portadorObjects){
    const sp = kvbSpecOf(o); if(!sp || !o.owner) continue;
    now.add(o.id);
    let st = seen.get(o.id);
    if(!st){ st = {left: o.left, o, born: false, sp}; seen.set(o.id, st); if(sp.born && o.life > 0){ try{ sp.born(o); }catch(e){} } }
    if(sp.pulse && o.left !== undefined && st.left !== undefined && o.left < st.left){ try{ sp.pulse(o, st.left - o.left); }catch(e){} }
    if(sp.upd){ try{ sp.upd(o, st); }catch(e){} }
    st.left = o.left; st.o = o;
  }
  for(const [id, st] of seen){ if(!now.has(id)){ const sp = st.sp; if(sp && sp.end){ try{ sp.end(st.o); }catch(e){} } seen.delete(id); } }
}
const KVB_FLAGS = ['ex', 'asc', 'solciju'];
function kvbObjDraw(layer){
  const t = animNow;
  for(const o of portadorObjects){
    const sp = kvbSpecOf(o); if(!sp || o.life <= 0 || !o.owner || (o.owner.alive === false)) continue;
    if(!(sp.layers || [sp.layer || 'g']).includes(layer)) continue;
    const R = sp.R ? sp.R(o) : o.r;
    if(!inView(o.x, o.y, R + 60)) continue;
    if(sp.loop && layer === 'g') kvbLoopDecal(sp.loop, o.x, o.y, R, t + (o.id || 0) * 137, sp.period || 1400, {alpha: sp.alpha});
    if(sp.draw) sp.draw(o, t, layer, R);
  }
}
(function(){
  const oG = drawPortadorGround;
  drawPortadorGround = function(){
    if(KVB.off) return oG.apply(this, arguments);
    const saved = [], cues = [];
    for(const o of portadorObjects){ const sp = kvbSpecOf(o); if(sp && sp.hideBase !== false && o.life > 0) for(const f of KVB_FLAGS) if(o[f]){ saved.push([o, f]); o[f] = false; } }
    for(const h of heroes){ if(h.exCue && KVB_ACT['ex:' + h.exCue.action]){ cues.push([h, h.exCue]); h.exCue = null; }
      if(h.asCue && KVB_ACT['asc:' + h.asCue.action] && !KVB_KEEPCUE['asc:' + h.asCue.action]){ cues.push([h, h.asCue, 'asCue']); h.asCue = null; } }
    // Sira: el trazo propio (ruta de tinta) lo dibuja su piel; se oculta el segmento genérico solo durante el dibujo base
    const routes = [];
    for(const h of heroes){ if(h.classKey === 'sira' && h.exState && h.exState.route){ routes.push([h.exState, h.exState.route]); h.exState.route = []; } }
    try{ return oG.apply(this, arguments); }
    finally{
      for(const [o, f] of saved) o[f] = true; for(const [h, c, k] of cues) h[k || 'exCue'] = c; for(const [s, r] of routes) s.route = r;
      try{ kvbObjDraw('g'); kvbOverlays('g'); }catch(e){ KVB.err = String(e && e.message || e); }
    }
  };
  const oT = drawPortadorTop;
  drawPortadorTop = function(){ oT.apply(this, arguments); if(KVB.off) return; try{ kvbObjDraw('t'); kvbOverlays('t'); }catch(e){ KVB.err = String(e && e.message || e); } };
  const oUpd = vfxUpdate; vfxUpdate = function(dt){ oUpd.apply(this, arguments); if(!KVB.off) try{ kvbObjUpdate(); kvbOverlayUpdate(dt); }catch(e){ KVB.err = String(e && e.message || e); } };
  const oRes = vfxResetRun; vfxResetRun = function(){ oRes.apply(this, arguments); KVB.objSeen.clear(); };
})();

/* ---------------- overlays por héroe (auras de estado) ---------------- */
// fn(h, layer, t) dibuja; upd(h, dt) opcional (emisión de partículas ligada a estados reales)
function kvbOverlay(classKey, fn, upd){ KVB.overlays.push({classKey, fn, upd}); KVB_HEROES.add(classKey); }
function kvbOverlays(layer){
  if(!KVB.overlays.length) return;
  for(const h of heroes){ if(!h.alive || h.fused) continue; for(const ov of KVB.overlays) if(ov.classKey === h.classKey && ov.fn) ov.fn(h, layer, animNow); }
}
function kvbOverlayUpdate(dt){
  for(const h of heroes){ if(!h.alive) continue; for(const ov of KVB.overlays) if(ov.classKey === h.classKey && ov.upd) ov.upd(h, dt); }
}
// Auxiliares de uso común en las recetas
KVB.hs = new WeakMap(); // estado cosmético por héroe (no se escribe en el héroe: no viaja por la red)
function kvbHS(h){ let s = KVB.hs.get(h); if(!s){ s = {}; KVB.hs.set(h, s); } return s; }
function kvbPulseEvery(h, key, ms, dt){ const s = kvbHS(h); s[key] = (s[key] || 0) - dt; if(s[key] <= 0){ s[key] += ms; return true; } return false; }
