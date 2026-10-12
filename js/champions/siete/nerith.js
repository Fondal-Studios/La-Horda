'use strict';
/* ============================================================
   Nerith, la Bruja de la Ciénaga — soporte de ÁREAS PERSISTENTES (curandera-bruja).
   Mecánica propia: deja zonas que duran segundos y pulsan: el Charco de Musgo cura a los aliados y frena a la
   Horda, el Reguero de Lodo traza una línea que muerde y frena, y la Marisma Eterna cubre el campo. Donde se
   solapan musgo y lodo la ciénaga madura (+30% de daño a los enemigos de esa franja). Los aliados dentro de
   sus zonas reciben −8% de daño. Máx. 2 charcos, 2 regueros y 1 marisma; la bruma alarga las zonas hasta 14 s.
   ============================================================ */
function nerMature(h, e){
  const moss = sietOwned(h, 'moss').some(z => distance(z, e) <= z.r) || sietOwned(h, 'marsh').some(z => distance(z, e) <= z.r);
  const mud = sietOwned(h, 'mud').some(z => seSegDist(e.x, e.y, z.x, z.y, z.bx, z.by) <= z.w + (e.radius || 0));
  return moss && mud;
}
function nerPulse(o, h, healPct, slow, slowMs){
  for(const a of sietAllies(o, o.r)){ exHeal(h, a, healPct * (o.rich ? 1.3 : 1)); }
  sietTargets(h, e => distance(e, o) <= o.r + (e.radius || 0), 24).forEach(e => {
    sietHit(h, e, o.dmg * (nerMature(h, e) ? 1.3 : 1), o.castId, .07);
    portadorSlow(h, e, slow, slowMs);
  });
}
SIETE_ACTIONS.ner_moss = (h, sk, c) => {
  sietObject(h, 'moss', c.point(), c.life, {r: c.r, dmg: c.dmg, castId: c.castId, tick: 0, rich: sietFlag(h, 0, 'rich')}, 2);
};
SIETE_FX.ner_moss = 'water';
SIETE_ACTIONS.ner_mud = (h, sk, c) => {
  const bog = sietFlag(h, 1, 'bog'), len = Math.min(300, c.range) * (bog ? 1.25 : 1);
  const e = sietSafePoint({x: h.x + c.dir.x * len, y: h.y + c.dir.y * len});
  sietObject(h, 'mud', {x: h.x, y: h.y}, c.life, {bx: e.x, by: e.y, w: sk.radius, dmg: c.dmg, castId: c.castId, tick: 0, slow: bog ? .5 : .4}, 2);
};
SIETE_FX.ner_mud = 'earth';
SIETE_ACTIONS.ner_mist = (h, sk, c) => {
  for(const a of sietAllies(h, c.r)){ exShield(h, a, .05, c.life); kitBuff(h, a, c.life, {armor: .15, label: 'BRUMA'}); a.slowTimer = 0; if(sietFlag(h, 2, 'purge')) exHeal(h, a, .03); }
  for(const kind of ['moss', 'mud', 'marsh']) for(const o of sietOwned(h, kind)) o.life = Math.min(14000, o.life + 2500);
  sietCue(h, 'ner_mist', {r: c.r});
};
SIETE_FX.ner_mist = 'light';
SIETE_ACTIONS.ner_marsh = (h, sk, c) => {
  const p = c.point();
  sietObject(h, 'marsh', p, c.life, {r: c.r, dmg: c.dmg, castId: c.castId, tick: 0}, 1);
  for(const a of sietAllies(p, c.r)) kitBuff(h, a, 4000, {armor: .12, label: 'MARISMA'});
};
SIETE_FX.ner_marsh = 'water';
SIETE_OBJECTS.moss = (o, dt, h) => { if(o.tick > 0) return; o.tick += 700; nerPulse(o, h, .016, .22, 900); };
SIETE_OBJECTS.marsh = (o, dt, h) => {
  if(o.tick > 0) return; o.tick += 800; nerPulse(o, h, .022, .35, 1000);
  for(const a of sietAllies(o, o.r)) a.slowTimer = 0;
};
SIETE_OBJECTS.mud = (o, dt, h) => {
  if(o.tick > 0) return; o.tick += 600;
  sietTargets(h, e => seSegDist(e.x, e.y, o.x, o.y, o.bx, o.by) <= o.w + (e.radius || 0), 24).forEach(e => {
    sietHit(h, e, o.dmg * (nerMature(h, e) ? 1.3 : 1), o.castId, .07); portadorSlow(h, e, o.slow || .4, 900);
  });
};
sietTakenHooks.push(h => portadorObjects.some(o => o.si && o.life > 0 && o.owner && o.owner.alive && (o.kind === 'si_moss' || o.kind === 'si_marsh') && distance(o, h) <= o.r) ? .92 : 1);
sietDamageHooks.push((h, e) => (h.classKey === 'nerith' && (sietOwned(h, 'moss').some(z => distance(z, e) <= z.r) || sietOwned(h, 'marsh').some(z => distance(z, e) <= z.r))) ? 1.1 : 1);
