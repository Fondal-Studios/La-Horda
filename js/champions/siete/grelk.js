'use strict';
/* ============================================================
   Grelk, el Cazador de Fosos — tirador MAESTRO DE TRAMPAS.
   Mecánica propia: coloca trampas en el suelo (máx. 6 vivas). Se arman tras un instante y saltan solas cuando un
   enemigo las pisa; Pulso del Cazador las dispara a distancia. Todo enemigo atrapado queda Presa 4 s:
   recibe +18% de daño de Grelk. Las trampas no son un ejército: no atacan ni tienen vida, se consumen al saltar.
   ============================================================ */
const GRELK_TRAPS = 6;
function grelkPlace(h, c, p, tt, o){
  const arm = {snare: 500, mine: 800, ring: 250}[tt];
  return sietObject(h, 'trap', p, c.life, Object.assign({tt, arm, castId: c.castId, dmg: c.dmg}, o), GRELK_TRAPS);
}
function grelkSpring(o, h, first){
  if(o.life <= 0 && o.sprung) return;
  o.life = 0; o.sprung = true;
  for(const e of sietTargets(h, e => distance(e, o) <= o.R + (e.radius || 0), 16)){
    sietHit(h, e, o.dmg * (e === first ? 1.25 : 1), o.castId, .05);
    e._siPreyUntil = sietNow() + 4000;
    if(o.tt === 'snare'){ portadorSlow(h, e, .85, 1700); if(o.barbs && !isBossRank(e)){ e.bleedTimer = Math.max(e.bleedTimer || 0, 2400); e.bleedDmg = Math.max(e.bleedDmg || 0, o.dmg * .1); } }
    else { portadorSlow(h, e, .3, 1500); if(!isBossRank(e)){ e.bleedTimer = Math.max(e.bleedTimer || 0, 2400); e.bleedDmg = Math.max(e.bleedDmg || 0, o.dmg * .1); } }
    seVuln(e, .1, 3000);
  }
  kitFx(o.tt === 'snare' ? 'spike' : 'fire', o.x, o.y, o.R * .9);
  if(typeof playSfx === 'function') playSfx('si_trap');
}
SIETE_ACTIONS.gre_snare = (h, sk, c) => { grelkPlace(h, c, c.point(), 'snare', {tr: 38, R: 62, barbs: sietFlag(h, 0, 'barbs')}); };
SIETE_ACTIONS.gre_mine = (h, sk, c) => {
  const p = c.point();
  grelkPlace(h, c, p, 'mine', {tr: 46, R: Math.min(110, c.r)});
  if(sietFlag(h, 1, 'cluster')) for(const sd of [-1, 1]) grelkPlace(h, c, sietSafePoint({x: p.x - c.dir.y * 55 * sd, y: p.y + c.dir.x * 55 * sd}), 'mine', {tr: 36, R: 56, dmg: c.dmg * .5});
};
SIETE_ACTIONS.gre_hunt = (h, sk, c) => {
  kitBuff(h, h, c.life, {speed: .25, dmg: .15, label: 'CAZA'});
  let n = 0;
  for(const o of sietOwned(h, 'trap')) if(!(o.arm > 0) && distance(o, h) <= 380){ grelkSpring(o, h, null); n++; }
  c.s.detonated = n;
  if(n >= 2 && sietFlag(h, 2, 'recycle') && h.cds) h.cds[0] = Math.max(0, h.cds[0] - 2000);
  sietCue(h, 'gre_hunt', {r: 380, n});
};
SIETE_ACTIONS.gre_field = (h, sk, c) => {
  const p = c.point(), spots = [p];
  for(let i = 0; i < 5; i++){ const a = i * Math.PI * 2 / 5 + .3; spots.push(sietSafePoint({x: p.x + Math.cos(a) * 64, y: p.y + Math.sin(a) * 64})); }
  for(const q of spots) grelkPlace(h, c, q, 'ring', {tr: 45, R: 78, dmg: c.dmg * .8});
  kitBuff(h, h, 4000, {speed: .2, dmg: .15, label: 'CAZA'});
};
SIETE_OBJECTS.trap = (o, dt, h) => {
  if(o.arm > 0){ o.arm -= dt; return; }
  const foe = sietTargets(h, e => distance(e, o) <= o.tr + (e.radius || 0), 1)[0];
  if(foe) grelkSpring(o, h, foe);
};
sietDamageHooks.push((h, e) => (h.classKey === 'grelk' && e._siPreyUntil > sietNow()) ? 1.18 : 1);
