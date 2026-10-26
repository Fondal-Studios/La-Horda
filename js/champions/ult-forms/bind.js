'use strict';
/* js/champions/ult-forms/bind.js — qué forma, paleta y duración usa la definitiva de cada campeón rehecho, y cómo se engancha a cada mitad.
   Elegidas con la matriz de tools/vfx/silhouette-diff.js (las definitivas más parecidas entre sí en main) y con el tema de cada uno:
   cada forma cuenta a su campeón (la marea de Facu, el taller de asedio de Brakk, el estandarte de Aldric...).
   Paleta = {o contorno, d sombra, a base, b luz, c brillo, e acento}. */
const UF_PAL = {
  column:  {o: '#0d2b1a', d: '#2f7d4c', a: '#6fd48c', b: '#c9f8c2', c: '#ffffff', e: '#ffe9a0'},   // soporte: bendición, verde y blanco
  spiral:  {o: '#3a2400', d: '#a8680f', a: '#f0bf4a', b: '#ffe596', c: '#fffbea', e: '#b78cff'},   // profeta: ascensión, oro
  chain:   {o: '#12141a', d: '#4b5263', a: '#8b95aa', b: '#dde2ee', c: '#ffffff', e: '#ffa63d'},   // eslabón: acero con chispas naranja
  cross:   {o: '#1a0409', d: '#7c1226', a: '#e23c55', b: '#ffb3bb', c: '#ffffff', e: '#ffd34d'},   // musashi: filo blanco con borde carmesí
  meteor:  {o: '#2a0c02', d: '#a8340c', a: '#ff7a2e', b: '#ffc766', c: '#fff6d2', e: '#ffffff'},   // mago: bola de fuego
  wave:    {o: '#06142e', d: '#154a9e', a: '#2f86ec', b: '#a4d9ff', c: '#ffffff', e: '#53f0d6'},   // facu: marea
  dome:    {o: '#06262a', d: '#25808a', a: '#4fd0dc', b: '#bff6ff', c: '#ffffff', e: '#ffd36a'},   // bront: ciudadela de cristal
  ridge:   {o: '#2a190c', d: '#6b4426', a: '#b47a46', b: '#f0d6a8', c: '#ffffff', e: '#ffcf4a'},   // libertador: cordillera nevada y sol
  portal:  {o: '#2a0a2a', d: '#7a1f7a', a: '#e04ad0', b: '#ffb0f2', c: '#ffffff', e: '#5ff0e8'},   // nahir: puerta magenta de remolino
  lightning: {o: '#14102e', d: '#5a4ad0', a: '#8f86ff', b: '#e0dcff', c: '#ffffff', e: '#ffe36a'}, // nano_gm: juicio, violeta y blanco con chispas amarillas
  sweep:   {o: '#2a1a00', d: '#a86a10', a: '#ffc83a', b: '#fff0a0', c: '#ffffff', e: '#ff5a4a'},   // brasa: sirena ámbar y roja
  fissure: {o: '#1a0606', d: '#7a1818', a: '#ff4a1c', b: '#ffb04a', c: '#fff0c0', e: '#ffd24a'},   // brakk: lava y ladrillos al rojo
  funnel:  {o: '#2a1a08', d: '#9a6a30', a: '#d9a458', b: '#f6dc9a', c: '#ffffff', e: '#ffb86a'},   // ilkan: arena
  volley:  {o: '#12220c', d: '#3f7a22', a: '#8fd646', b: '#d8f59a', c: '#ffffff', e: '#ffd34d'},   // cazadora: flechas verdes
  curtain: {o: '#1e0a2a', d: '#6a2a8e', a: '#b04ad8', b: '#e8b0ff', c: '#ffffff', e: '#ffd34d'},   // velmira: telón púrpura y oro
  banner:  {o: '#14213a', d: '#2f5a96', a: '#d8402e', b: '#ff8a70', c: '#f2fbff', e: '#ffd34d'}    // tanque: estandarte rojo con asta de acero
};
// campeón -> forma (+ paleta). dur/p opcionales.
const UF_MAP = {
  soporte: ['column'], profeta: ['spiral'], eslabon: ['chain'], musashi: ['cross'], mago: ['meteor'], facu_gm: ['wave'], bront: ['dome'], libertador: ['ridge'],
  nahir: ['portal', null, {minR: 170}], nano_gm: ['lightning'], brasa: ['sweep'], brakk: ['fissure'], ilkan: ['funnel'], cazadora: ['volley'], velmira: ['curtain'], tanque: ['banner']
};
for(const k in UF_MAP){ const [form, pal, extra] = UF_MAP[k]; ufChamp(k, Object.assign({form, pal: UF_PAL[pal || form], seed: 0}, extra)); UF.register(k); }

/* ---------------- enganche mitad A (skill-fx-a): reemplaza la nova + capas de impacto genéricas de la definitiva ----------------
   Se envuelve SFA_BIND[k].ult: el spec anterior se conserva intacto (?uf=0 lo restablece para comparar antes/después). Como la forma
   no empuja sprites con sfaP, sfaExtras (rayos, ondas, columna y segunda nova iguales para todas) no agrega nada.
   Centro y radio salen de la geometría que ya usaba cada definitiva (radio real de su área). */
function ufSfa(key, old, geom){
  return function(c){
    if(!ufHas(key)) return (old.run || old)(c);
    const g = geom ? geom(c) : {x: c.h.x, y: c.h.y, r: sfaR(c)};
    kvbFx('uf.' + key, g.x, g.y, Math.min(420, g.r), Math.atan2(c.h.fy || 0, c.h.fx || 1));
  };
}
const UF_A = {
  brakk: null, bront: null,
  facu_gm: c => { const p = sfaPt(c); return {x: p.x, y: p.y, r: sfaR(c)}; },
  brasa: c => ({x: c.h.x, y: c.h.y, r: 120}),
  cazadora: c => ({x: c.h.x, y: c.h.y, r: 110}),
  eslabon: c => ({x: c.h.x, y: c.h.y, r: c.h.portRingR || 190}),
  ilkan: c => ({x: c.h.x, y: c.h.y, r: 230}),
  libertador: c => ({x: c.h.x, y: c.h.y, r: 210}),
  mago: c => c.rec.frost[0] || {x: c.h.x, y: c.h.y, r: 230},
  musashi: c => { const t = c.h.duelTarget && c.h.duelTarget.alive ? c.h.duelTarget : c.h; return {x: t.x, y: t.y, r: 190}; }
};
for(const k in UF_A){ const B = SFA_BIND[k]; if(B && B.ult && ufHas(k)) B.ult = ufSfa(k, B.ult, UF_A[k]); }
for(const k of ['eslabon', 'mago', 'bront:as_keep']) UF.lite[k] = true;   // anillo de estado de Eslabón, tormenta de Mago y zona de la Ciudadela: solo el borde, en trazos
/* ---------------- habilidades normales (menor escala): formas compactas por casilla ----------------
   Solo los kits cuyas tres habilidades se leían como la misma nova: Mago, Musashi y Cazadora (hab. 2). add = true conserva el efecto de antes y le suma la forma. */
const UF_PAL_SK = {
  fire:   {o: '#2a0a02', d: '#a8340c', a: '#ff7a2e', b: '#ffc766', c: '#fff6d2', e: '#ffffff'},
  ice:    {o: '#0a1c2c', d: '#3a78a8', a: '#7ad0ff', b: '#cff3ff', c: '#ffffff', e: '#9df5ea'},
  storm:  {o: '#20184a', d: '#6a58d8', a: '#ffe36a', b: '#fff6b0', c: '#ffffff', e: '#a89cff'},
  sakura: {o: '#2a0a18', d: '#a82a62', a: '#ff7aa8', b: '#ffd0e0', c: '#ffffff', e: '#ffd34d'},
  blade:  {o: '#0a1030', d: '#2a4aa0', a: '#6ea0ff', b: '#c8dcff', c: '#ffffff', e: '#ffd34d'},
  ink:    {o: '#0a0a14', d: '#3a3a5c', a: '#e8e8f4', b: '#ffffff', c: '#ffffff', e: '#e23c55'},
  thorn:  {o: '#12220c', d: '#3f7a22', a: '#8fd646', b: '#d8f59a', c: '#ffffff', e: '#d86a8a'}
};
ufDefForm('musashiCuts', musashiThousandForm());
const UF_SK = [   // [campeón, casilla, forma, paleta, duración, geometría(c) -> {x, y, r} | null, add]
  ['mago', 0, 'column', 'fire', 1000, c => { const p = c.rec.pts[0]; return p && {x: p.x, y: p.y - 100, r: 24}; }],
  ['mago', 1, 'shards', 'ice', 1000, c => { const f = c.rec.frost[0]; return f && {x: f.x, y: f.y, r: f.r}; }],
  ['mago', 2, 'lightning', 'storm', 1100, c => { const b = c.rec.bolts[0]; return b && {x: b.x2, y: b.y2, r: 80}; }],
  ['musashi', 0, 'claws', 'ink', 700, c => { const t = c.rec.tgts[0] || c.h; return {x: t.x, y: t.y, r: 80}; }, true],
  ['musashi', 1, 'bloom', 'sakura', 1200, c => ({x: c.to.x, y: c.to.y, r: 80}), true],
  ['musashi', 2, 'musashiCuts', 'blade', 1200, musashiThousandGeometry],
  ['cazadora', 1, 'shards', 'thorn', 900, c => { const p = c.rec.pts[0]; return p && {x: p.x, y: p.y, r: Math.max(50, p.r || 60)}; }]
];
for(const [k, slot, form, pal, dur, geom, add] of UF_SK){
  const id = k + '.' + slot, B = SFA_BIND[k], old = B && B[slot]; if(!old) continue;
  ufChamp(id, {form, pal: UF_PAL_SK[pal], dur, gdur: Math.round(dur * 1.4), minR: id === 'mago.0' ? 24 : 40}); UF.register(id);
  B[slot] = function(c){ if(!ufHas(id)) return (old.run || old)(c); if(add) (old.run || old)(c); const g = geom(c); if(!g){ if(!add) return (old.run || old)(c); return; } kvbFx('uf.' + id, g.x, g.y, Math.min(id === 'musashi.2' ? 420 : 300, g.r), Math.atan2(c.h.fy || 0, c.h.fx || 1)); };
}
/* ---------------- enganche mitad B (vfx-b): sin tocar sus archivos ----------------
   · Expedición / Ascensión (acción ligada con kvbBind): el id pasa a ser 'uf.<clave>' mientras la forma esté activa (getter sobre KVB_ACT).
   · Clásicos (kvbClassic): se envuelve la receta; solo la definitiva (u = true) usa la forma, las habilidades siguen como estaban.
   · kvbPunch (anillo + ondas genéricos de toda definitiva de la mitad B) se omite para las definitivas con forma propia. */
for(const [k, key] of [['nahir', 'ex:gallery'], ['nano_gm', 'asc:judgement'], ['velmira', 'asc:theatre']]){
  const old = KVB_ACT[key]; if(!old || !UF.champs[k]) continue;
  Object.defineProperty(KVB_ACT, key, {get: () => ufHas(k) ? 'uf.' + k : old, configurable: true, enumerable: true});
}
function ufB(key, old, geom){
  return function(c, sk, u, sc){
    if(!u || !ufHas(key)) return old.apply(this, arguments);
    const g = geom ? geom(c, sk, sc, old.apply(this, arguments)) : {x: c.x, y: c.y, r: (sk.radius || 120) * ((sc && sc.AREA) || 1)};
    return ['uf.' + key, g.x, g.y, Math.min(420, g.r), Math.atan2(c.fy || 0, c.fx || 1), 0, 0];
  };
}
for(const [k, kind, geom] of [['soporte', 'team_grand_buff', null], ['tanque', 'taunt_provoke', null], ['profeta', 'ascension_fusion', (c, sk, sc, a) => ({x: a ? a[1] : c.x, y: a ? a[2] : c.y, r: 130})]]){
  const id = k + ':' + kind, old = KVB_CLASSIC[id]; if(old && UF.champs[k]) KVB_CLASSIC[id] = ufB(k, old, geom);
}
(function(){
  if(typeof kvbPunch !== 'function') return;
  const op = kvbPunch;
  kvbPunch = function(h, x, y, r, level){ if(level >= 2 && h && ufHas(h.classKey)) return; return op.apply(this, arguments); };
})();
/* La corona de escarcha del Mago (anillo + red de seis rayos + seis cristales en círculo) repite cada nova de hielo durante toda la definitiva:
   mientras Mago tenga formas propias (hielo = esquirlas, definitiva = meteoro) esa corona no se dibuja (puro dibujo; el registro de geometría de skill-fx-a sigue corriendo). */
(function(){
  if(typeof vfxFrostCrown !== 'function') return;
  const ofc = vfxFrostCrown;
  vfxFrostCrown = function(){
    if(!ufHas('mago.1') && !ufHas('mago')) return ofc.apply(this, arguments);
    const sp = window.vfxSprite, on0 = typeof championSignatures !== 'undefined' ? championSignatures.map(x => x.on) : null; window.vfxSprite = function(){};
    try{ return ofc.apply(this, arguments); } finally { window.vfxSprite = sp; if(on0) championSignatures.forEach((x, i) => { if(x.on && !on0[i] && x.key === '__frost') x.on = false; }); }
  };
})();
/* ---------------- la definitiva con forma propia no suma las ondas ni sprites genéricos del lanzamiento ----------------
   Durante el lanzamiento se silencian vfxShock / vfxSprite y se quitan los anillos de partículas (ring / warnRing) que empuja el juego (anillos y sprites del kit y del juego: puro dibujo, no consumen azar ni cambian estado)
   y vfxCastFlash pasa a solo marcar KVB.castSeen (lo que necesita la mitad B para saber que el lanzamiento ocurrió). El resto del lanzamiento corre igual. */
/* Ventana de silencio de 3,2 s alrededor del punto de lanzamiento: los anillos de partículas (ring / warnRing) y las ondas de choque (vfxShocks) que el juego
   siga creando ahí después del lanzamiento (novas diferidas, pulsos de tormenta) se apagan en cada cuadro. Solo dibujo: no son entidades ni tocan la mecánica. */
UF.quiet = [];
(function(){
  if(typeof vfxResetRun === 'function'){ const orr = vfxResetRun; vfxResetRun = function(){ UF.quiet.length = 0; return orr.apply(this, arguments); }; }
  if(typeof vfxUpdate !== 'function') return;
  const ou = vfxUpdate;
  vfxUpdate = function(dt){
    const r = ou.apply(this, arguments), Q = UF.quiet;
    if(Q.length){
      for(let i = Q.length - 1; i >= 0; i--){ Q[i].ttl -= dt; if(Q[i].ttl <= 0) Q.splice(i, 1); }
      for(const z of Q){
        if(typeof particles !== 'undefined') for(let i = particles.length - 1; i >= 0; i--){ const p = particles[i]; if(p && (p.ring || p.warnRing) && Math.hypot(p.x - z.x, p.y - z.y) < 60 && (p.maxR || 0) <= z.r) particles.splice(i, 1); }
        if(typeof vfxShocks !== 'undefined') for(const s of vfxShocks) if(s.on && Math.hypot(s.x - z.x, s.y - z.y) < 60 && s.r1 <= z.r) s.on = false;
      }
    }
    return r;
  };
})();
(function(){
  const ca = castAbility;
  castAbility = function(caster, sk, isUlt){
    if(!isUlt || !caster || !ufHas(caster.classKey)) return ca.apply(this, arguments);
    const s0 = window.vfxShock, s1 = window.vfxSprite, s2 = window.vfxCastFlash, nop = function(){};
    window.vfxShock = nop; window.vfxSprite = nop; window.vfxCastFlash = function(){ if(typeof KVB !== 'undefined') KVB.castSeen = true; };
    UF.quiet.push({x: caster.x, y: caster.y, r: Math.max(120, ((sk && sk.radius) || 200) * 1.6), ttl: 3200});   // los anillos que el propio juego sigue empujando después (Mago: novas diferidas)
    const n0 = typeof particles !== 'undefined' ? particles.length : 0, sig0 = typeof championSignatures !== 'undefined' ? championSignatures.map(x => x.on) : null;
    try{ return ca.apply(this, arguments); } finally {
      window.vfxShock = s0; window.vfxSprite = s1; window.vfxCastFlash = s2;
      // anillos de partículas que el propio juego empuja al lanzar (puro dibujo): la forma propia ocupa su lugar
      if(typeof particles !== 'undefined') for(let i = particles.length - 1; i >= n0; i--){ const p = particles[i]; if(p && (p.ring || p.warnRing)) particles.splice(i, 1); }
      // corona de escarcha y cono genéricos del juego (champion-signatures.js: dibujo puro); la cresta del campeón sobre la cabeza se conserva
      if(sig0) championSignatures.forEach((x, i) => { if(x.on && !sig0[i] && (x.key === '__frost' || x.key === '__cone')) x.on = false; });
    }
  };
})();
