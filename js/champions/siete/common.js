'use strict';
/* ============================================================
   js/champions/siete/common.js — BASE COMPARTIDA DE LOS SIETE CAMPEONES
   Ilsa (réplica), Vorn (dos formas) y Kora (ariete). Se registran como campeones del catálogo "Ascensión" (catalog.js)
   para reutilizar su registro, talentos, Códice y skins, pero son STANDARD en TESTING (champion-taxonomy.js).
   Simulación del anfitrión (host-authoritative) sobre los sistemas existentes: portadorObjects (serializado por
   js/net/net-game.js), exHit/exSafeStep, ascHit (techo contra jefes), kitBuff/kitFx (kit-shared.js).
   Reglas de seguridad:
   - Todo daño sostenido (haces, zonas, pulsos) pasa por sietHit con techo por lanzamiento contra jefes.
   - Entidades propias: tope por tipo y total (SIETE_TOTAL) y limpieza al morir, fusionarse o salir.
   - Empujes y desplazamientos validados (ascSafeMove / exSafeStep): nadie queda fuera de la arena.
   - Nada guarda referencias a enemigos dentro de las entidades (se serializan): solo posiciones e ids.
   ============================================================ */
const SIETE_IDS = ['ilsa', 'vorn', 'kora'];
const SIETE_TOTAL = 10;              // tope de entidades propias vivas por campeón
const SIETE_ACTIONS = {};            // acción -> manejador(h, sk, c)
const SIETE_OBJECTS = {};            // tipo de entidad -> actualizador(o, dt, h)
const SIETE_FX = {};                 // acción -> tema de kitFx
const sietCandidate = h => !!h && SIETE_IDS.includes(h.classKey);
function sietFlag(h, idx, flag){ const m = talentSkillMods(h.classKey, idx); return !!(m && m.flags && m.flags[flag]); }
function sietState(h){ return h.siState || (h.siState = {n: 0}); }
function sietNow(){ return runElapsedMs; }
function sietHit(h, e, dmg, castId, frac, proc){ return ascHit(h, e, dmg, castId, frac === undefined ? .06 : frac, proc); }
function sietTargets(h, test, cap){ return ascTargets(h, test, cap || 16); }
function sietOwned(h, kind){ return portadorOwned(h, 'si_' + kind); }
function sietAllies(p, r){ return heroes.filter(a => a.alive && !a.fused && distance(a, p) < r); }
// Crea una entidad propia con tope por tipo y total; nunca crece sin límite.
function sietObject(h, kind, p, life, data, limit, total){
  portadorLimit(h, 'si_' + kind, limit || 1);
  portadorObjects = portadorObjects.filter(o => o.life > 0);
  const own = portadorObjects.filter(o => o.owner === h && o.si && o.life > 0);
  while(own.length >= (total || SIETE_TOTAL)) own.shift().life = 0;
  portadorObjects = portadorObjects.filter(o => o.life > 0);
  return portadorAdd(h, 'si_' + kind, p, Math.min(16000, Math.max(1, life)), Object.assign({si: true, r: 40}, data || {}));
}
// Empuje seguro de un enemigo (reutiliza la validación de Ascensión).
function sietPush(e, dx, dy, px){ return ascSafeMove(e, dx, dy, px); }
function sietSafePoint(p){ const q = {x: p.x, y: p.y, radius: 16}; clampToArena(q); resolveWallCollision(q); return {x: q.x, y: q.y}; }
function sietCue(h, action, extra){ h.siCue = Object.assign({action, x: h.x, y: h.y, until: sietNow() + 420}, extra || {}); }
// Contexto de lanzamiento (mismos topes que ascensionCast, premarcado en aim-targeting.js / register.js).
function sietCast(h, sk, isUlt, dmg, area, dur, power){
  if(!h.alive || h.fused) return;
  const s = sietState(h), castId = h.classKey + ':' + (++s.n) + ':' + sietNow();
  const r = Math.min(isUlt ? 480 : 260, (sk.radius || 100) * area), range = Math.min(460, (sk.range || 200) * area),
        life = Math.min(12000, (sk.duration || 2400) * dur);
  const aimed = !!aimProfileOf(sk, h), dir = aimed ? aimDir(h, range || 200) : {x: h.fx || 1, y: h.fy || 0};
  const c = {s, castId, r, range, life, dir, dmg, area, dur, power, isUlt: !!isUlt, origin: {x: h.x, y: h.y},
             end: {x: h.x + dir.x * range, y: h.y + dir.y * range}, point: () => portadorPoint(h, range, r)};
  if(typeof playSfx === 'function') playSfx('si_' + h.classKey + (isUlt ? '_ult' : '_cast'));
  h.portCastState = isUlt ? 'ultimate' : 'cast'; h.portCastUntil = sietNow() + (isUlt ? 700 : 420);
  if(isUlt) h._ultLockUntil = Math.max(h._ultLockUntil || 0, sietNow() + Math.min(life, 2500));
  const fn = SIETE_ACTIONS[sk.action];
  if(fn) fn(h, sk, c);
  const th = SIETE_FX[sk.action];
  if(th && typeof kitFx === 'function' && !c.noFx){
    const prof = aimProfileOf(sk, h);
    if(prof && prof.type === 'line') kitFxLine(th, c.origin.x, c.origin.y, c.end.x, c.end.y, prof.w);
    else if(prof && prof.type === 'cone') kitFx(th, h.x + (c.end.x - h.x) * .6, h.y + (c.end.y - h.y) * .6, r * .6, {ult: isUlt});
    else if(prof && prof.type === 'dash') { kitFxLine(th, c.origin.x, c.origin.y, h.x, h.y, prof.w); kitFx(th, h.x, h.y, r * .6, {ult: isUlt}); }
    else if(prof && prof.type === 'point' && h._lastAimPt) kitFx(th, h._lastAimPt.x, h._lastAimPt.y, r, {ult: isUlt});
    else kitFx(th, h.x, h.y, r, {ult: isUlt});
  }
}
const sietOriginalCast = ascensionCast;
ascensionCast = function(h, sk, isUlt, dmg, area, dur, power){
  if(sk && SIETE_ACTIONS[sk.action]) return sietCast(h, sk, isUlt, dmg, area, dur, power);
  return sietOriginalCast.apply(this, arguments);
};
// Entidades: el actualizador de cada tipo vive en su archivo (SIETE_OBJECTS).
const sietOriginalObject = ynaraUpdateObject;
ynaraUpdateObject = function(o, dt){
  if(!o.si) return sietOriginalObject(o, dt);
  const h = o.owner;
  if(!h || !h.alive || h.fused || !heroes.includes(h)){ o.life = 0; return true; }
  if(currentArena === 'abismo' && abS && !abWalkable(o.x, o.y)){ o.life = 0; return true; }
  const fn = SIETE_OBJECTS[o.kind.slice(3)];
  o.life = Math.max(0, o.life - dt); o.tick = (o.tick || 0) - dt;
  if(fn) portadorWith(h, () => fn(o, dt, h));
  return true;
};
// Limpieza al morir / fusionarse / salir y estado por héroe.
const sietHeroHooks = [];   // cada campeón registra su actualización por héroe
const sietOriginalHero = updatePortadorHero;
updatePortadorHero = function(h, dt){
  sietOriginalHero(h, dt);
  if(!sietCandidate(h)) return;
  if(!h.alive || h.fused){
    for(const o of portadorObjects) if(o.owner === h && o.si) o.life = 0;
    h.siState = null; h.siCue = null; return;
  }
  for(const fn of sietHeroHooks) fn(h, dt);
};
// Daño recibido, velocidad y daño causado: cada campeón suma su multiplicador.
const sietTakenHooks = [], sietSpeedHooks = [], sietDamageHooks = [];
const sietOriginalTaken = portadorTakenMult;
portadorTakenMult = function(h, src){
  let m = sietOriginalTaken(h, src);
  for(const fn of sietTakenHooks) m *= fn(h, src);
  return m;
};
const sietOriginalSpeed = portadorSpeedMult;
portadorSpeedMult = function(h){
  let m = sietOriginalSpeed(h);
  for(const fn of sietSpeedHooks) m *= fn(h);
  return m;
};
const sietOriginalDamage = damageEnemy;
damageEnemy = function(e, amount, opts){
  const h = opts && opts.src;
  if(h && h.alive !== false && !(opts && opts.execute)) for(const fn of sietDamageHooks) amount *= fn(h, e, amount, opts);
  return sietOriginalDamage.apply(this, [e, amount].concat([].slice.call(arguments, 2)));
};
