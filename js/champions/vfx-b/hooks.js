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
// Keep the legacy particle emission and owner budget when replacing Q5 art.
// Burst/spray consume the simulation RNG and share its bounded particle pool.
// Skipping them changes later combat rolls; replaying the real emitter also
// preserves culling, reduced-FX, saturation and network delivery. Only the
// generic sprite/shock (no RNG) are replaced by the native KVB shapes.
function kvbKeepQ5Particles(fn){
  const sprite = window.vfxSprite, shock = window.vfxShock;
  window.vfxSprite = window.vfxShock = function(){};
  try{ return fn(); }
  finally{ window.vfxSprite = sprite; window.vfxShock = shock; }
}
(function(){
  function wrap(name, prefix){
    const o = window[name]; if(typeof o !== 'function') return;
    window[name] = function(h, sk, isUlt, r, origin, end){
      const id = !KVB.off && sk && KVB_ACT[prefix + sk.action];
      if(!id) return o.apply(this, arguments);
      const g = kvbCastGeom(h, sk, isUlt, r, origin, end); kvbFx(id, g[0], g[1], g[2], g[3], g[4], g[5]); kvbPunch(h, g[0], g[1], g[2], isUlt ? 2 : 1);
    };
  }
  wrap('exCastFx', 'ex:'); wrap('ascCastFx', 'asc:');
  // Calidad cinco: la acción en curso viene del lanzamiento (solcijuCast / veyraCast)
  function ctxWrap(name){
    const o = window[name]; if(typeof o !== 'function') return;
    window[name] = function(h, sk){ const prev = KVB.q5; KVB.q5 = {h, sk, area: arguments[4], dur: arguments[5]}; try{ return o.apply(this, arguments); } finally{ KVB.q5 = prev; } };
  }
  ctxWrap('solcijuCast'); ctxWrap('veyraCast');
  if(typeof qualityFiveFx === 'function'){
    const oQ = qualityFiveFx;
    qualityFiveFx = function(h, draw, ...args){
      if(KVB.off || !h || (h.classKey !== 'solciju' && h.classKey !== 'veyra') || (draw !== kitFx && draw !== kitFxLine)) return oQ.apply(this, arguments);
      const c = KVB.q5, id = c && c.h === h && KVB_Q5[c.sk.action];
      if(!c || c.h !== h){ return kvbKeepQ5Particles(() => oQ.apply(this, arguments)); } // conserva partículas; la piel reemplaza sprite/onda
      if(!id) return oQ.apply(this, arguments);
      kvbKeepQ5Particles(() => oQ.apply(this, arguments));
      if(draw === kitFxLine){ const [, ax, ay, bx, by, w] = args; kvbFx(id, ax, ay, w, Math.atan2(by - ay, bx - ax), Math.hypot(bx - ax, by - ay), 0); }
      else if(c.sk.action === 'vey_cut' && aimProfileOf(c.sk,h).type === 'line'){
        const area = c.area || 1;
        kvbFx('veyra.lance',args[1],args[2],Math.min(200,c.sk.radius*area),Math.atan2(h.fy||0,h.fx??1),Math.min(180,c.sk.range*area),0);
      }else if(c.sk.action === 'vey_pact'){
        // Duración e índice del dueño viajan en el evento visual existente.
        kvbFx(id, args[1], args[2], args[3], 0, Math.min(5000, c.sk.duration * c.dur), heroes.indexOf(h));
      }else kvbFx(id, args[1], args[2], args[3], Math.atan2(h.fy || 0, h.fx ?? 1), .85, 0);
      // Los filos y el latido de Veyra ya aportan impacto sin un disco adicional.
      if(h.classKey !== 'veyra') kvbPunch(h, args[1], args[2], args[3] || 60, h.cls && h.cls.ultimate === c.sk ? 2 : 1);
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
    if(KVB.castSeen && caster.alive){ try{ const a = fn(caster, sk, !!isUlt, kvbScale(caster, sk, isUlt, idx, evo), KVB.lastAim, pre, KVB.pre); if(a){ kvbFx.apply(null, a); kvbPunch(caster, a[1], a[2], a[3] || 60, isUlt ? 2 : 1); } }catch(e){ KVB.err = String(e && e.message || e); } }
    return ret;
  };
  // Portadores (Ynara, Myla): el motor ya entrega área y duración reales a portadorCast
  const oPort = portadorCast;
  portadorCast = function(h, sk, isUlt, dmg, area, dur, power){
    const pre = {x: h.x, y: h.y}; KVB.lastAim = null;
    const ret = oPort.apply(this, arguments);
    const fn = !KVB.off && h && h.classKey && KVB_PORT[h.classKey + ':' + sk.kind];
    if(fn && h.alive){ try{ const a = fn(h, sk, !!isUlt, {AREA: area, DUR: dur}, h._lastAimPt || KVB.lastAim || null, pre); if(a){ kvbFx.apply(null, a); kvbPunch(h, a[1], a[2], a[3] || 60, isUlt ? 2 : 1); } }catch(e){ KVB.err = String(e && e.message || e); } }
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

/* ---------------- golpes del ataque básico: micro-impacto con la paleta de cada campeón ---------------- */
// El básico ya tiene su animación de cuerpo (atlas) y su proyectil; esto solo da el "toque" del impacto en el enemigo (antes: chispa blanca genérica).
const KVB_BASIC = {};
function kvbBasic(classKey, pal, motif){
  KVB_BASIC[classKey] = true;
  kvbDefDecal('bh_' + classKey, 6, kvbRingPaint(pal, {fillCol: pal[1], fill: .5, rimThick: 2, flash: pal[3], details: (lg, c, R, rad, p) => { for(let i = 0; i < 6; i++){ const a = i * 1.047 + .3, nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * rad * .2, c + Math.sin(a) * rad * .2], [c + Math.cos(a) * rad * .95 + nx * 1.5, c + Math.sin(a) * rad * .95 + ny * 1.5], [c + Math.cos(a) * rad * .95 - nx * 1.5, c + Math.sin(a) * rad * .95 - ny * 1.5]], i & 1 ? p[3] : p[4]); } }}));
  KVB_FX['bh.' + classKey] = (x, y, r, ang) => { kvbDecal('bh_' + classKey, x, y, 17, 300, {layer: 't'}); kvbEmit(motif, 2, x, y, {ang, spread: 2.2, v0: 30, v1: 90, up: 20, grav: 100, l0: 200, l1: 340, scale: 1, shrink: true}); };
  KVB_HEROES.add(classKey);
}
(function(){
  if(typeof vfxHit !== 'function') return;
  const oHit = vfxHit;
  vfxHit = function(e, src, opts, crit){
    const ret = oHit.apply(this, arguments);
    if(!KVB.off && opts && opts.fromBasic && src && src.classKey && KVB_BASIC[src.classKey] && e && Number.isFinite(e.x)){
      const s = kvbHS(src), now = typeof animNow === 'number' ? animNow : 0;
      if(!(s.bh > now - 110)){ s.bh = now; kvbFx('bh.' + src.classKey, e.x, e.y - 12, 17, Math.atan2(e.y - src.y, e.x - src.x), crit ? 1 : 0, 0); }
    }
    return ret;
  };
})();

/* ---------------- impacto común: flash + ondas + chispas con la paleta del campeón; la definitiva es un momento aparte ---------------- */
// level 1 = habilidad (destello y onda cortos), 2 = definitiva (rayos, tres ondas escalonadas, pilar de motas, sacudida leve existente).
// Solo usa primitivas sin azar (vfxShock, vfxShake, kvb*): no toca el azar de la simulación. Adaptativo: con vfxLoad bajo o «Reducir efectos» se queda en lo esencial.
const KVB_TONE = {};
function kvbTone(hex){
  let t = KVB_TONE[hex]; if(t) return t; const c = kvbRGB(hex || '#ffffff'), mix = (a, k) => '#' + c.map((v, i) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))).toString(16).padStart(2, '0')).join('');
  t = KVB_TONE[hex] = {pal: [mix(0, -.82), mix(0, -.45), hex || '#ffffff', mix(0, .45), mix(0, .85)], key: String(hex).replace('#', '')};
  const k = t.key, pal = t.pal;
  kvbDefMotif('pn_mote_' + k, 5, 5, kvbBmp(['..a..', '.aba.', 'abcba', '.aba.', '..a..'], {a: pal[2], b: pal[3], c: pal[4]}));
  // El destello va ARRIBA de las entidades (capa 't'): solo puntas del cuarto exterior, sin borde ni relleno (el anillo y el relleno van en el suelo), para no tapar al enemigo golpeado
  // (antes era un disco relleno al 50 % con núcleo claro: el «disco rosa» que cubría a los enemigos). El relleno vive en el suelo (pn_floor, capa 'g').
  kvbDefDecal('pn_flash_' + k, 7, kvbRingPaint(pal, {fill: 0, noRim: true, rimThick: 3, details: (lg, c, R, rad, p) => { for(let i = 0; i < 8; i++){ const a = i * .7854 + .39, nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * rad * .72, c + Math.sin(a) * rad * .72], [c + Math.cos(a) * rad * .98 + nx * 1.4, c + Math.sin(a) * rad * .98 + ny * 1.4], [c + Math.cos(a) * rad * .98 - nx * 1.4, c + Math.sin(a) * rad * .98 - ny * 1.4]], i & 1 ? p[3] : p[4]); } }}));
  kvbDefDecal('pn_floor_' + k, 7, kvbRingPaint(pal, {fillCol: pal[1], core: pal[2], fill: .24, rimThick: 3, flash: pal[3]}));
  kvbDefDecal('pn_ult_' + k, 12, kvbRingPaint(pal, {fillCol: pal[1], core: pal[2], fill: .24, rimThick: 4, flash: pal[4], details: (lg, c, R, rad, p, q) => { for(let i = 0; i < 18; i++){ const a = i * .349 + q * .5, L = rad * (i & 1 ? .62 : .98), nx = -Math.sin(a), ny = Math.cos(a); kvbPoly(lg, [[c + Math.cos(a) * rad * .15, c + Math.sin(a) * rad * .15], [c + Math.cos(a) * L + nx * 2.4, c + Math.sin(a) * L + ny * 2.4], [c + Math.cos(a) * L - nx * 2.4, c + Math.sin(a) * L - ny * 2.4]], i & 1 ? p[2] : p[3]); } kvbCircle(lg, c, c, rad * .55, p[3], 1.4); kvbCircle(lg, c, c, rad * .3, p[3], 1); }}));
  return t;
}
// kvbPunch viaja por la red como kvbFx('punch', x, y, r, 0, nivel, color numérico) para que los invitados lo vean igual
function kvbPunch(h, x, y, r, level){
  if(KVB.off || !h || !h.cls) return;
  // con skin de set activa el destello lleva el color de la skin (como el resto de sus efectos: skin-fx.js), no el del guardián base
  let skinHex = null; try{ const sf = typeof skinFxOf === 'function' ? skinFxOf(h) : null; skinHex = sf && (sf.P.tint || sf.P.glow); }catch(e){}
  const hex = (skinHex || h.cls.glow || h.cls.color || '#ffffff').replace('#', '');
  kvbFx('punch', x, y, r, 0, level, parseInt(hex, 16));
}
KVB_FX['punch'] = (x, y, r, ang, level, num) => {
  const hex = '#' + (num >>> 0).toString(16).padStart(6, '0').slice(-6);
  const t = kvbTone(hex), k = t.key, ult = level >= 2;
  r = Math.max(30, Math.min(ult ? 260 : 120, r || 60));
  const rgb = kvbRGB(hex).join(',');
  if(typeof vfxShock === 'function'){
    vfxShock(x, y, r * .1, r * (ult ? .9 : .6), rgb, ult ? 560 : 340, 2);
    if(ult){ vfxShock(x, y, r * .05, r * 1.25, '255,255,255', 760, 2); vfxShock(x, y, r * .1, r * .55, rgb, 900, 1); }
  }
  kvbDecal('pn_floor_' + k, x, y, Math.min(r, 90) * (ult ? 1.1 : .7), ult ? 520 : 340, {layer: 'g', alpha: .9});
  kvbDecal('pn_flash_' + k, x, y, Math.min(r, 90) * (ult ? 1.1 : .7), ult ? 520 : 340, {layer: 't', alpha: .9});
  if(ult){
    kvbDecal('pn_ult_' + k, x, y, Math.min(r * 1.15, 280), 1100, {layer: 'g'});
    kvbEmit('pn_mote_' + k, 22, x, y, {ring: r * .4, v0: 10, v1: 50, up: 140, grav: -30, l0: 700, l1: 1300, scale: 1.5, flat: .6}); // pilar de motas que sube
    kvbEmit('pn_mote_' + k, 16, x, y, {v0: 80, v1: 240, up: 40, grav: 120, l0: 500, l1: 900, scale: 1.3, flat: .6, shrink: true});
    if(typeof vfxShake === 'function' && !kvbCalm()) vfxShake(6);
  } else {
    kvbEmit('pn_mote_' + k, 7, x, y, {v0: 60, v1: 170, up: 30, grav: 140, l0: 260, l1: 460, scale: 1.2, shrink: true});
  }
};
