'use strict';
/* ============================================================
   Ilsa Corvo, la Esgrimista de Réplica — duelista de CONTRAATAQUE.
   Mecánica propia: Postura de Réplica desvía los golpes enemigos (daño recibido 0) y responde al atacante;
   cada golpe desviado suma una Réplica (máx. 3). Estocada y Giro las gastan para pegar más fuerte; con tres,
   el siguiente básico es una réplica (+60%). Solo desvía golpes de enemigos (no peligros del suelo, no PvP) y la
   definitiva admite 6 desvíos. Contra jefes el contraataque tiene techo por tiempo (sietHit).
   ============================================================ */
function ilsIsAttacker(src){ return !!src && typeof src.hp === 'number' && src.alive !== false && !src.isPvp && !heroes.includes(src); }
function ilsParry(h, s, src, duel){
  const t = sietNow();
  s.riposte = Math.min(3, (s.riposte || 0) + 1);
  const dmg = (h.baseDmg || 8) * (duel ? .9 : 1.2) * (h.buffDmgMult || 1);
  portadorWith(h, () => { if(src.alive) sietHit(h, src, dmg, 'ilsa:counter', .03, true); });
  if(duel){
    s.autoCharges--;
    if(!(s.pulseAt > t)){ s.pulseAt = t + 350;
      portadorWith(h, () => sietTargets(h, e => distance(e, h) <= 125 + (e.radius || 0), 16).forEach(e => sietHit(h, e, (h.baseDmg || 8) * .5, 'ilsa:pulse', .03, true)));
      kitFx('slash', h.x, h.y, 90); }
  } else if(h.cds && h.cds[0] > 0) h.cds[0] = Math.max(0, h.cds[0] - 2000);
  if(sietFlag(h, 0, 'haste')) kitBuff(h, h, 2000, {speed: .15, label: 'PASO LIGERO'});
  if(typeof floatText === 'function') floatText(h.x, h.y - 52, '¡RÉPLICA!', null);
  if(typeof vfxShock === 'function') vfxShock(h.x, h.y - 10, 8, 46, [230, 235, 255], 260, 1);
  if(typeof playSfx === 'function') playSfx('si_parry');
}
const ilsOriginalHurt = damageHero;
damageHero = function(h, amount, src, transferred){
  if(h && h.classKey === 'ilsa' && h.alive && amount > 0 && ilsIsAttacker(src)){
    const s = sietState(h), t = sietNow(), duel = s.autoUntil > t && s.autoCharges > 0;
    if(duel || s.parryUntil > t){ ilsParry(h, s, src, duel); return; }
  }
  return ilsOriginalHurt.apply(this, arguments);
};
SIETE_ACTIONS.ils_parry = (h, sk, c) => {
  c.s.parryUntil = sietNow() + c.life;
  kitBuff(h, h, c.life + 400, {armor: .3, label: 'RÉPLICA'});
  sietCue(h, 'ils_parry', {r: 60, until: sietNow() + c.life});
};
SIETE_ACTIONS.ils_lunge = (h, sk, c) => {
  const a = {x: h.x, y: h.y}, n = c.s.riposte || 0, mult = 1 + .35 * n;
  exDash(h, c.dir, Math.min(190, c.range));
  sietTargets(h, e => seSegDist(e.x, e.y, a.x, a.y, h.x, h.y) <= sk.radius + (e.radius || 0), 20).forEach(e => { sietHit(h, e, c.dmg * mult, c.castId, .08); if(sietFlag(h, 1, 'expose')) seVuln(e, .12, 3000); });
  c.s.riposte = 0;
  kitFxLine('slash', a.x, a.y, h.x, h.y, 26);
  c.noFx = true;
};
SIETE_ACTIONS.ils_whirl = (h, sk, c) => {
  const n = c.s.riposte || 0, mult = 1 + .25 * n;
  sietTargets(h, e => distance(e, h) <= c.r + (e.radius || 0), 24).forEach(e => {
    sietHit(h, e, c.dmg * mult, c.castId, .08);
    portadorSlow(h, e, .25, 1000);
    if(isEliteRank(e)) e.stunTimer = Math.max(e.stunTimer || 0, 250);
    else { const d = distance(e, h) || 1; sietPush(e, (e.x - h.x) / d, (e.y - h.y) / d, 38 + 14 * n); }
  });
  c.s.riposte = n > 0 && sietFlag(h, 2, 'keep') ? 1 : 0;
};
SIETE_ACTIONS.ils_duel = (h, sk, c) => {
  c.s.autoUntil = sietNow() + c.life; c.s.autoCharges = 6; c.s.parryUntil = 0;
  sietTargets(h, e => distance(e, h) <= c.r + (e.radius || 0), 24).forEach(e => { sietHit(h, e, c.dmg, c.castId, .1); portadorSlow(h, e, .3, 1500); });
  kitBuff(h, h, c.life, {armor: .3, speed: .1, label: 'DUELO'});
  sietCue(h, 'ils_duel', {r: c.r, until: sietNow() + c.life, ult: true});
};
sietTakenHooks.push(h => (h.classKey === 'ilsa' && h.siState && h.siState.autoUntil > sietNow()) ? .6 : 1);
sietDamageHooks.push((h, e, amount, opts) => {
  if(h.classKey !== 'ilsa' || !opts.fromBasic || opts.fromProc) return 1;
  const s = h.siState; if(!s || (s.riposte || 0) < 3) return 1;
  s.riposte = 0; return 1.6;
});
sietHeroHooks.push((h, dt) => {
  if(h.classKey !== 'ilsa') return; const s = sietState(h), t = sietNow();
  if(s.autoUntil && s.autoUntil < t){ s.autoUntil = 0; s.autoCharges = 0; }
});
