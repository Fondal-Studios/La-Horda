'use strict';
/* js/champions/ult-forms/bind-b.js — segunda tanda de definitivas con silueta propia (Oriel, Orsa, Renko, Saelis, Segador, Sira, Solciju, Tibor, Vesper,
   Veyra, Vhal, Ynara, Zahra): paleta, forma y enganche. Mismo mecanismo que bind.js (kvbFx('uf.<clave>') viaja por la red como evento del anfitrión; ?uf=0 vuelve
   a los efectos de antes). Todas son de la mitad B (vfx-b): el id de la acción pasa a 'uf.<clave>' mientras la forma esté activa (getter sobre KVB_ACT / KVB_Q5),
   el clásico del Segador se envuelve con ufB, y las pieles de las zonas persistentes dejan de empujar anillos con relleno: quedan solo el borde del área real
   (ufZoneEdge) y lo que ya era del campeón (las abejas de Tibor, los ecos de Oriel).
   Paleta = {o contorno, d sombra, a base, b luz, c brillo, e acento}. Solo visual. */
const UFB_PAL = {
  oriel:    {o: '#2a0a16', d: '#8e2a48', a: '#e05a7a', b: '#ffd0dc', c: '#ffffff', e: '#d9b25c'},   // frambuesa y negro-vino, llave de oro viejo
  orsa:     {o: '#141b2e', d: '#a05a1e', a: '#dfa352', b: '#ffe08a', c: '#fff9d6', e: '#3b4a74'},   // nube azul-negra con rayos de cobre
  renko:    {o: '#2a1d12', d: '#5a4128', a: '#7a5a3a', b: '#b08a5a', c: '#e0cfa8', e: '#a99a83'},   // tierra removida y marfil de lápida
  saelis:   {o: '#1d3250', d: '#5a8cc0', a: '#9cd0f0', b: '#d6ecfa', c: '#ffffff', e: '#fff4cc'},   // cielo, pluma blanca y oro
  segador:  {o: '#2a0a0e', d: '#7a1620', a: '#c62828', b: '#ff8a7a', c: '#ffe9d6', e: '#fff6ec'},   // rojo sangre y hueso pálido
  sira:     {o: '#101a33', d: '#9a8456', a: '#e8d9b0', b: '#3b5a9a', c: '#cfe0ff', e: '#c0453a'},   // pergamino, tinta azul y cruces rojas
  solciju:  {o: '#2a0814', d: '#6b1f38', a: '#923951', b: '#d46a86', c: '#ffd2dc', e: '#e8c76a'},   // vino burdeos y luna dorada
  tibor:    {o: '#3a2a08', d: '#8a6d1c', a: '#c9b365', b: '#f5df8a', c: '#fff6c8', e: '#e89a1c'},   // miel, cera y ámbar
  vesper:   {o: '#1a0f24', d: '#5b3770', a: '#aa75bd', b: '#e0b6f0', c: '#efe6d0', e: '#c8d0e0'},   // violeta, hilo marfil y acero
  veyra:    {o: '#2a0612', d: '#7a1d38', a: '#ab3459', b: '#ff7d8e', c: '#ffd6dc', e: '#ffffff'},   // carmesí y rosa sangre
  vhal:     {o: '#0e1033', d: '#3a44b0', a: '#6f7cf2', b: '#d9e1ff', c: '#ffffff', e: '#ffe9a0'},   // índigo cósmico y oro estelar
  ynara:    {o: '#40182c', d: '#b04a78', a: '#ed8db5', b: '#f8c8dc', c: '#fff0f7', e: '#f2d9a8'},   // rosa, blanco nacarado y crema
  zahra:    {o: '#2a1008', d: '#a8431a', a: '#ed8858', b: '#ffc27a', c: '#eef6fc', e: '#c98a4a'}    // horno, brasa, vapor blanco-azulado y latón
};
// campeón -> [forma, extra]. rm = multiplicador del radio de la receta (el área real de la mecánica puede ser mayor que r), minR, follow = la forma sigue al héroe
const UFB_MAP = {
  oriel:   ['rift', {minR: 120}],
  orsa:    ['thunder', {minR: 120, rm: 1.25, follow: true}],
  renko:   ['graves', {minR: 100, follow: true}],
  saelis:  ['plumage', {minR: 120}],
  segador: ['reaper', {minR: 80, follow: true}],
  sira:    ['atlas', {minR: 120}],
  solciju: ['cellar', {minR: 110}],
  tibor:   ['hive', {minR: 110}],
  vesper:  ['stitch', {minR: 110, follow: true}],
  veyra:   ['wound', {minR: 100, follow: true}],
  vhal:    ['collapse', {minR: 120}],
  ynara:   ['halo', {minR: 120, follow: true}],
  zahra:   ['valves', {minR: 110, follow: true}]
};
for(const k in UFB_MAP){
  const [form, extra] = UFB_MAP[k]; if(!UF.forms[form]) continue;
  const rm = extra.rm || 1, fol = extra.follow; delete extra.rm; delete extra.follow;
  ufChamp(k, Object.assign({form, pal: UFB_PAL[k], seed: 0}, extra)); UF.register(k);
  // receta propia: radio corregido y, si la zona sigue al héroe, la forma también
  KVB_FX['uf.' + k] = (x, y, r, ang) => {
    const ents = ufPlay(k, x, y, r * rm, ang), h = fol ? kvbHeroAt(x, y, k) : null;
    if(h && ents) for(const e of ents){ e.follow = h; e.ofx = e.x - h.x; e.ofy = e.y - h.y; }
  };
}
/* ---------------- acciones de Expedición / Ascensión / Calidad cinco: el id pasa a la forma mientras esté activa ---------------- */
function ufbAct(champ, actKey, tbl){
  tbl = tbl || KVB_ACT; const old = tbl[actKey]; if(!old || !UF.champs[champ]) return;
  Object.defineProperty(tbl, actKey, {get: () => ufHas(champ) ? 'uf.' + champ : old, configurable: true, enumerable: true});
}
for(const [c, a] of [['oriel', 'asc:great_rift'], ['orsa', 'ex:storm'], ['renko', 'ex:faults'], ['saelis', 'asc:feather_sky'], ['sira', 'ex:atlas'], ['tibor', 'ex:hive_sky'],
  ['vesper', 'ex:last_stitch'], ['vhal', 'asc:collapse'], ['zahra', 'ex:vent']]) ufbAct(c, a);
ufbAct('solciju', 'sol_reserve', KVB_Q5); ufbAct('veyra', 'vey_final', KVB_Q5);
// clásico del Segador: berserker_ult
if(UF.champs.segador){ const old = KVB_CLASSIC['segador:berserker_ult']; if(old) KVB_CLASSIC['segador:berserker_ult'] = ufB('segador', old, c => ({x: c.x, y: c.y, r: 100})); }

/* ---------------- pieles de zonas persistentes: sin anillo con relleno; solo el borde real del área ---------------- */
const ufbEdge = (champ, o, R) => { const al = Math.min(1, o.life / 400, (o.maxLife - o.life) / 300 + .25); return ufZoneEdge(champ, o.x, o.y, R, al); };
function ufbSkin(id, champ, mute, edge){
  const sp = KVB_OBJ[id]; if(!sp || !UF.champs[champ]) return;
  for(const fn of mute){ const old = sp[fn]; if(typeof old === 'function') sp[fn] = function(){ return ufHas(champ) ? undefined : old.apply(this, arguments); }; }
  if(edge){
    UF.lite[champ] = true; const oLoop = sp.loop, oDraw = sp.draw;
    Object.defineProperty(sp, 'loop', {get: () => ufHas(champ) ? null : oLoop, set(v){}, configurable: true, enumerable: true});
    sp.draw = function(o, t, layer, R){ if(ufHas(champ) && layer === 'g') ufbEdge(champ, o, R); if(oDraw) return oDraw.apply(this, arguments); };
  }
}
ufbSkin('ex_storm:orsa', 'orsa', ['pulse'], true);
ufbSkin('ex_faults:renko', 'renko', ['pulse'], true);
ufbSkin('ex_swarm:tibor', 'tibor', ['pulse'], true);
ufbSkin('ex_stitch:vesper', 'vesper', ['pulse'], true);
ufbSkin('ex_vent:zahra', 'zahra', ['pulse'], true);
ufbSkin('sol_reserve:solciju', 'solciju', ['pulse', 'end'], true);
// Sira: el pergamino con la ruta lo dibuja la forma; la piel conserva los números de la mecánica pero deja de dibujar la banda y los decales
ufbSkin('ex_atlas:sira', 'sira', ['pulse', 'draw'], false);
// Ynara: la forma nace con el objeto (halo, alas y rayos); la piel deja de empujar el anillo de pulso
(function(){
  const sp = KVB_OBJ['patience:ynara']; if(!sp || !UF.champs.ynara) return;
  UF.lite.ynara = true;
  const oBorn = sp.born, oUpd = sp.upd, oEnd = sp.end, oLoop = sp.loop;
  sp.born = function(o){ if(!ufHas('ynara')) return oBorn && oBorn.apply(this, arguments); kvbFx('uf.ynara', o.x, o.y, o.r, 0, 0, 0); };
  sp.upd = function(o, st){ if(!ufHas('ynara')) return oUpd && oUpd.apply(this, arguments); st.tick = o.tick; };
  sp.end = function(o){ if(!ufHas('ynara')) return oEnd && oEnd.apply(this, arguments); };
  Object.defineProperty(sp, 'loop', {get: () => ufHas('ynara') ? null : oLoop, set(v){}, configurable: true, enumerable: true});
  sp.draw = function(o){ if(ufHas('ynara')) ufbEdge('ynara', o, o.r); };
})();
// Ascensión (Oriel, Saelis, Vhal): sus objetos no tenían piel; se esconde el dibujo base (anillo + relleno) mientras la forma esté activa y queda el borde real
for(const [kind, champ] of [['as_great', 'oriel'], ['as_sky', 'saelis'], ['as_collapse', 'vhal']]){
  if(!UF.champs[champ]) continue; UF.lite[champ] = true;
  kvbSkin(kind, {R: o => o.r, layers: ['g'], get hideBase(){ return ufHas(champ); },
    draw: (o, t, layer, R) => {
      if(!ufHas(champ)) return;
      ufbEdge(champ, o, R);
      // los ecos de Oriel son parte de la mecánica (golpean a un objetivo): se sigue marcando dónde golpean, con el dibujo de siempre
      if(champ === 'oriel' && o.echo && o.echo.until > runElapsedMs){ const roster = ['tanque', 'guerrero', 'musashi', 'cazadora', 'segador', 'ilkan'], k = roster[o.echo.champ % roster.length]; ctx.save(); ctx.globalAlpha = .45; try{ drawChampPack(k, {x: o.echo.x, y: o.echo.y, classKey: k, _codexSet: 'attack_down', _codexT: (500 - (o.echo.until - runElapsedMs)) / 500}, 2, .45); }catch(e){} ctx.restore(); }
    }}, champ);
}
/* Segador: su definitiva heredaba cataclysmVFX (anillo naranja, giro celeste, brasas y cristales de hielo de Thalen). Se deja que corra (consume el mismo azar que antes: la mecánica
   y la comparación con ?uf=0 no cambian) y se retiran las partículas que dibujó; el sprite del lanzamiento ya lo silencia el envoltorio de bind.js. */
(function(){
  if(!UF.champs.segador || typeof castAbility !== 'function') return;
  const ca = castAbility, COL = new Set(['#ff6a3d', '#9fe3ff', '#ffb36a', '#bfe8ff', '#ffcf5c', '#7ad0ff']);
  castAbility = function(caster, sk){
    if(!caster || caster.classKey !== 'segador' || !sk || sk.kind !== 'berserker_ult' || !ufHas('segador') || typeof particles === 'undefined') return ca.apply(this, arguments);
    const n0 = particles.length;
    try{ return ca.apply(this, arguments); } finally {
      for(let i = particles.length - 1; i >= n0; i--){ const p = particles[i]; if(p && (p.ring || p.spin || p.crystal || p.runeRing || COL.has(p.color))) particles.splice(i, 1); }
    }
  };
})();
