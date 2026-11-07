'use strict';
/* ============================================================
   Vorn, el Cambiapiel — tanque TRANSFORMISTA de dos formas.
   Mecánica propia: Mudar alterna Piedra (−14% daño recibido, −8% velocidad) y Tormenta (+18% velocidad,
   básicos +12% y roban un poco de vida). Zarpa e Instinto cambian de efecto según la forma; Mudar
   es la bisagra: al entrar a cada forma suelta una onda con su efecto. La definitiva fusiona ambas pieles.
   ============================================================ */
const vornForm = h => (h.siState && h.siState.form) | 0;           // 0 Piedra, 1 Tormenta
const vornBeast = h => !!(h.siState && h.siState.beastUntil > sietNow());
SIETE_ACTIONS.vor_shift = (h, sk, c) => {
  const next = 1 - vornForm(h), rr = c.r * (sietFlag(h, 0, 'wide') ? 1.3 : 1);
  c.s.form = next; c.s.formAt = sietNow();
  sietTargets(h, e => distance(e, h) <= rr + (e.radius || 0), 24).forEach(e => {
    sietHit(h, e, c.dmg, c.castId, .07);
    if(next === 0) portadorSlow(h, e, .35, 1600); else seVuln(e, .1, 2500);
    if(!isBossRank(e) && !isEliteRank(e)){ const d = distance(e, h) || 1; sietPush(e, (e.x - h.x) / d, (e.y - h.y) / d, 30); }
  });
  if(next === 0){ exShield(h, h, .1, 3000); kitBuff(h, h, 3000, {armor: .15, label: 'PIEDRA'}); }
  else kitBuff(h, h, 3000, {speed: .25, dmg: .18, label: 'TORMENTA'});
  sietCue(h, 'vor_shift', {r: rr, form: next});
};
SIETE_FX.vor_shift = 'earth';
SIETE_ACTIONS.vor_maul = (h, sk, c) => {
  if(vornForm(h) === 0){
    exCone(h, Math.min(170, c.range), c.dmg, e => { portadorSlow(h, e, .3, 1400); if(sietFlag(h, 1, 'stagger') && !isBossRank(e) && !isEliteRank(e)) e.stunTimer = Math.max(e.stunTimer || 0, 400); if(!isBossRank(e) && !isEliteRank(e)){ const d = distance(e, h) || 1; sietPush(e, (e.x - h.x) / d, (e.y - h.y) / d, 34); } });
  } else {
    const a = {x: h.x, y: h.y};
    exDash(h, c.dir, Math.min(180, c.range));
    sietTargets(h, e => seSegDist(e.x, e.y, a.x, a.y, h.x, h.y) <= sk.radius * .6 + (e.radius || 0), 20).forEach(e => {
      sietHit(h, e, c.dmg * 1.1, c.castId, .07);
      if(!isBossRank(e)){ e.bleedTimer = Math.max(e.bleedTimer || 0, 2600); e.bleedDmg = Math.max(e.bleedDmg || 0, c.dmg * .1); }
    });
    kitFxLine('slash', a.x, a.y, h.x, h.y, 34);
    c.noFx = true;
  }
};
SIETE_FX.vor_maul = 'slash';
SIETE_ACTIONS.vor_instinct = (h, sk, c) => {
  const rr = c.r * (sietFlag(h, 2, 'pack') ? 1.4 : 1);
  if(vornForm(h) === 0){
    for(const a of sietAllies(h, rr)){ exShield(h, a, a === h ? .12 : .08, c.life); kitBuff(h, a, c.life, {armor: .2, label: 'ROCA VIVA'}); }
  } else {
    for(const a of sietAllies(h, rr)) kitBuff(h, a, c.life, {speed: .15, dmg: .12, label: 'AULLIDO'});
  }
  sietCue(h, 'vor_instinct', {r: rr, form: vornForm(h)});
};
SIETE_FX.vor_instinct = 'shield';
SIETE_ACTIONS.vor_beast = (h, sk, c) => {
  c.s.beastUntil = sietNow() + c.life;
  kitBuff(h, h, c.life, {armor: .25, speed: .12, label: 'BESTIA'});
  exShield(h, h, .1, c.life);
  sietObject(h, 'stomp', h, c.life, {r: c.r, dmg: c.dmg, castId: c.castId, tick: 0}, 1);
  sietCue(h, 'vor_beast', {r: c.r, ult: true, until: sietNow() + c.life});
};
SIETE_FX.vor_beast = 'earth';
SIETE_OBJECTS.stomp = (o, dt, h) => {
  o.x = h.x; o.y = h.y;
  if(o.tick > 0) return;
  o.tick += 700;
  sietTargets(h, e => distance(e, o) <= o.r + (e.radius || 0), 24).forEach(e => {
    sietHit(h, e, o.dmg, o.castId, .1); portadorSlow(h, e, .3, 900);
    if(!isBossRank(e) && !isEliteRank(e)){ const d = distance(e, h) || 1; sietPush(e, (e.x - h.x) / d, (e.y - h.y) / d, 22); }
  });
  kitFx('earth', o.x, o.y, o.r * .8);
};
sietTakenHooks.push(h => h.classKey !== 'vorn' ? 1 : vornBeast(h) ? .78 : vornForm(h) === 0 ? .86 : 1);
sietSpeedHooks.push(h => h.classKey !== 'vorn' ? 1 : vornBeast(h) ? 1.1 : vornForm(h) === 0 ? .92 : 1.18);
sietDamageHooks.push((h, e, amount, opts) => {
  if(h.classKey !== 'vorn' || !opts.fromBasic) return 1;
  if(vornForm(h) === 1 || vornBeast(h)){
    const s = sietState(h), t = sietNow();
    if(!(s.leechAt > t)){ s.leechAt = t + 600; exHeal(h, h, .012); }
    return 1.12;
  }
  return 1;
});
