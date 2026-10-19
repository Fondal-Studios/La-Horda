'use strict';
/* js/champions/ult-forms/bind-2a.js — segunda tanda (14 definitivas): qué forma, paleta y geometría usa cada una y cómo se engancha a su mitad del roster.
   Se carga después de bind.js (usa ufSfa y ufB) y de forms-2a-1.js / forms-2a-2.js. Mismo contrato que bind.js: ?uf=0 (o window.UF_OFF) restablece los efectos anteriores.
   Paleta = {o contorno, d sombra, a base, b luz, c brillo, e acento, f opcional}; los colores salen del brief de arte de cada campeón (docs/art-brief/campeones/<clave>.md). Solo visual. */
const UA_PAL = {
  dial:      {o: '#1e1633', d: '#5a4a8c', a: '#bfa7dc', b: '#f0c070', c: '#fff8e0', e: '#d9c9f5'},                 // aelith: violeta profundo, agujas ámbar
  cathedral: {o: '#3a2400', d: '#a86a12', a: '#f2c14e', b: '#ffe69a', c: '#fffbe8', e: '#7fe3ff', f: '#ff7ad9'},   // aurelia: oro blanco, vitral cian y magenta solo en el rosetón
  window:    {o: '#06161a', d: '#24243c', a: '#3ad6c4', b: '#9df5ea', c: '#ffffff', e: '#ff4fd8'},                 // axiom: turquesa, negro azulado, desplazamiento RGB magenta
  bell:      {o: '#0f2326', d: '#5a2616', a: '#9c4a2e', b: '#d78a5a', c: '#cfeef0', e: '#6fae9a'},                 // baltra: cobre rojizo con verdín
  staff:     {o: '#1a1410', d: '#7a1f35', a: '#d6af77', b: '#f6dba8', c: '#fffaf0', e: '#c88aff'},                 // dariel: vino, ocre y cartel crema
  lanterns:  {o: '#2a1c08', d: '#6b4a1e', a: '#e8c060', b: '#ffe7a5', c: '#fff7d6', e: '#ff9a3c'},                 // farolero: ámbar de llama
  toxin:     {o: '#12081a', d: '#5a3d7a', a: '#9a6ac7', b: '#8dffa0', c: '#eaffee', e: '#c4544a'},                 // guerrero: violeta de sigilo a verde veneno, sangre
  weave:     {o: '#181830', d: '#4e50a0', a: '#8889c1', b: '#e3e0ff', c: '#ffffff', e: '#ffd870'},                 // iria: índigo, hilos blancos, vértices oro
  eclipse:   {o: '#0a1a12', d: '#1f6a50', a: '#3fae8a', b: '#c8f27a', c: '#ffd24a', e: '#e48424'},                 // khepri: negro verdoso, corona de oro, élitros naranja
  grove:     {o: '#1a2010', d: '#4a5a30', a: '#879c60', b: '#cfe0a0', c: '#d86a8a', e: '#8b3a2a', f: '#6c5424'},   // maura: oliva, espinas rojas, rosas, corteza
  garden:    {o: '#121c08', d: '#4a6a24', a: '#a4c56a', b: '#dcf0a0', c: '#d6c1a0', e: '#b070d8', f: '#7c476b'},   // morveth: verde enfermizo, sombrero púrpura, hueso
  still:     {o: '#24101e', d: '#6e3a60', a: '#a46191', b: '#edd0a5', c: '#fff2d8', e: '#7ae0b0'},                 // morwen: ciruela, cobre-crema, menta de reacción
  tears:     {o: '#5a2a3e', d: '#d27a9c', a: '#e99abb', b: '#fff1e1', c: '#ffffff', e: '#9ad8f0'},                 // myla: rosa yogur, crema, lágrimas celestes
  abyss:     {o: '#0a241b', d: '#2a7a5a', a: '#4ab88a', b: '#8ef0c8', c: '#d8d2b8', e: '#50e68c'}                  // nigromante: verde alma, hueso, fuego verde
};
const UA_MAP = {
  aelith: ['dial'], aurelia: ['cathedral'], axiom: ['window', null, {minR: 200}], baltra: ['bell'], dariel: ['staff'], farolero: ['lanterns'], guerrero: ['toxin'],
  iria: ['weave'], khepri: ['eclipse'], maura: ['grove'], morveth: ['garden'], morwen: ['still'], myla: ['tears'], nigromante: ['abyss']
};
for(const k in UA_MAP){ const [form, pal, extra] = UA_MAP[k]; ufChamp(k, Object.assign({form, pal: UA_PAL[pal || form], seed: 0}, extra)); UF.register(k); }

/* ---------------- mitad A (skill-fx-a): se envuelve SFA_BIND[k].ult con la geometría real que ya usaba cada definitiva ---------------- */
const UA_A = {
  aelith: c => { const p = sfaPt(c); return {x: p.x, y: p.y, r: sfaR(c)}; },
  aurelia: c => { const p = sfaPt(c); return {x: p.x, y: p.y, r: sfaR(c)}; },
  axiom: c => ({x: c.h.x, y: c.h.y, r: 230}),
  baltra: null,
  dariel: null,
  farolero: c => ({x: c.h.x, y: c.h.y, r: c.h.portVigilR || 190}),
  iria: c => { const o = sfaObj(c, /triangle/); if(!o) return {x: c.h.x, y: c.h.y, r: 160}; const x = (o.ax + o.bx + o.cx) / 3, y = (o.ay + o.by + o.cy) / 3; return {x: x, y: y, r: Math.max(80, Math.min(400, Math.max(Math.hypot(o.ax - x, o.ay - y), Math.hypot(o.bx - x, o.by - y), Math.hypot(o.cx - x, o.cy - y))))}; },
  khepri: null,
  maura: null,
  morveth: c => { const p = sfaPt(c); return {x: p.x, y: p.y, r: sfaR(c)}; },
  morwen: c => { const o = sfaObj(c, /alembic/) || c.h; return {x: o.x, y: o.y, r: 170}; }
};
for(const k in UA_A){ const B = SFA_BIND[k]; if(B && B.ult && ufHas(k)) B.ult = ufSfa(k, B.ult, UA_A[k]); }
// Guerrero: el sigilo conserva su aura; la forma cae sobre el enemigo más cercano (el mismo que elegirá la emboscada de 2 s después, radio de encadenado 150 u)
(function(){
  const B = SFA_BIND.guerrero, old = B && B.ult; if(!old || !ufHas('guerrero')) return;
  B.ult = function(c){
    if(!ufHas('guerrero')) return (old.run || old)(c);
    sfaP('aura', 'blood', c.h.x, c.h.y, 44, {fi: sfaHeroIdx(c.h), dur: 3000});
    const t = typeof nearestEnemyTo === 'function' ? nearestEnemyTo(c.h, 280) : null;
    if(t) kvbFx('uf.guerrero', t.x, t.y, 150, Math.atan2(t.y - c.h.y, t.x - c.h.x));
  };
  // el golpe de la emboscada empuja un anillo de partículas verde: la forma ocupa su lugar
  if(typeof performShadowStrike === 'function'){
    const ps = performShadowStrike;
    performShadowStrike = function(h){ const n0 = typeof particles !== 'undefined' ? particles.length : 0; try{ return ps.apply(this, arguments); } finally { if(ufHas('guerrero') && typeof particles !== 'undefined') for(let i = particles.length - 1; i >= n0; i--){ const p = particles[i]; if(p && p.ring) particles.splice(i, 1); } } };
  }
})();
/* Zonas persistentes de la mecánica: solo el borde de trazos (el área real sigue marcada), sin las ondas de pulso ni la onda de cierre genéricas de la receta anterior. */
function uaQuiet(cfg, champ){
  if(!cfg || cfg.__ua) return; cfg.__ua = true;
  for(const p of ['pulse', 'end']){ const v = cfg[p]; Object.defineProperty(cfg, p, {get: () => ufHas(champ) ? undefined : v, set: nv => { }, configurable: true, enumerable: true}); }
}
for(const [champ, kind] of [['aelith', 'ael_hour'], ['aurelia', 'as_cathedral'], ['baltra', 'ex_toll'], ['dariel', 'ex_concert'], ['khepri', 'as_eclipse'], ['maura', 'ex_forest'], ['morveth', 'mor_garden']]){
  if(SFA_OBJ[kind] && ufHas(champ)){ uaQuiet(SFA_OBJ[kind], champ); UF.lite[champ + ':' + kind] = true; }
}
for(const cfg of SFA_HEROZ) if((cfg.key === 'axiom' || cfg.key === 'farolero') && ufHas(cfg.key)){ uaQuiet(cfg, cfg.key); UF.lite[cfg.key] = true; }

/* ---------------- mitad B (vfx-b) ---------------- */
// Nigromante: la receta clásica de la definitiva (anillo de almas de 110 u) pasa a la forma, con el radio de absorción del ejército
(function(){
  const id = 'nigromante:abyss_incarnation_ult', old = KVB_CLASSIC[id];
  if(old && ufHas('nigromante')) KVB_CLASSIC[id] = ufB('nigromante', old, c => ({x: c.x, y: c.y, r: 190}));
})();
// Myla: la piel del Berrinche (ondas de llanto en anillo y lágrimas sueltas) cede el lugar a las lágrimas gigantes; se conserva el borde del área
(function(){
  const sp = KVB_OBJ['tantrum:myla']; if(!sp || !ufHas('myla')) return;
  const born = sp.born, upd = sp.upd, loop = sp.loop;
  Object.defineProperty(sp, 'loop', {get: () => ufHas('myla') ? null : loop, configurable: true, enumerable: true});
  sp.born = o => { if(!ufHas('myla')) return born && born(o); ufPlay('myla', o.x, o.y, Math.max(120, Math.min(200, o.r || 180)), 0); };
  sp.upd = (o, st) => { if(!ufHas('myla') && upd) return upd(o, st); };
  sp.draw = (o, t, layer, R) => { if(layer === 'g' && ufHas('myla')) ufZoneEdge('myla:tantrum', o.x, o.y, R, .85); };
  UF.lite['myla:tantrum'] = true;
  // las ondas rosas y medialunas de llanto de cada 300 ms del motor de familia son anillos: se quitan mientras la forma esté activa (queda la salpicadura sobre los enemigos)
  if(typeof famMilaTantrum === 'function'){
    const fm = famMilaTantrum;
    famMilaTantrum = function(){ if(!ufHas('myla')) return fm.apply(this, arguments); const fr = window.famRing; window.famRing = function(){}; try{ return fm.apply(this, arguments); } finally { window.famRing = fr; } };
  }
})();
