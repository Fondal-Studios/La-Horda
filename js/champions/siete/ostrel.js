'use strict';
/* ============================================================
   Ostrel, el Cazador de Estrellas — mago de RAYO SOSTENIDO (canalizador).
   Mecánica propia: el Haz se mantiene mientras dura y gira hacia donde apunta; cada pulso seguido sin
   interrumpirlo suma Foco (+4%, máx +60%). Mientras canaliza camina más lento, salvo con Concentración.
   Lente de Aumento marca enemigos (vulnerables +14%) y el Haz les pega más fuerte dentro de ella.
   ============================================================ */
const OST_TICK = 150;
function ostFocusBonus(s){ return s.focusUntil > sietNow() ? s.focus : 0; }
function ostBeamEnd(o, len){ return {x: o.x + Math.cos(o.ang) * len, y: o.y + Math.sin(o.ang) * len}; }
function ostStartBeam(h, sk, c, width, tickMs, turn, ult){
  const s = c.s;
  for(const o of sietOwned(h, 'beam')) o.life = 0;
  const ang = Math.atan2(c.dir.y, c.dir.x);
  const len = Math.min(ult ? 470 : 340, c.range);
  const o = sietObject(h, 'beam', h, c.life, {ang, len, w: width, dmg: c.dmg, castId: c.castId, tickMs, turn, ult: !!ult, n: 0, castLife: c.life, tick: tickMs, split: !ult && sietFlag(h, 0, 'split')}, 1);
  if(o){ s.beamUntil = sietNow() + c.life; s.beamId = o.id; }
  return o;
}
SIETE_ACTIONS.ost_beam = (h, sk, c) => { ostStartBeam(h, sk, c, sk.radius, OST_TICK, 0.0036, false); };
SIETE_ACTIONS.ost_lens = (h, sk, c) => {
  const p = c.point();
  sietObject(h, 'lens', p, c.life, {r: c.r, dmg: c.dmg, castId: c.castId, tick: 350, scorch: sietFlag(h, 1, 'scorch')}, 2);
  // el primer pulso es inmediato: marca y daña a la vez
  sietTargets(h, e => distance(e, p) <= c.r + (e.radius || 0), 20).forEach(e => { sietHit(h, e, c.dmg * .8, c.castId, .05); seVuln(e, .14, 3500); portadorSlow(h, e, .25, 1400); });
};
SIETE_ACTIONS.ost_focus = (h, sk, c) => {
  const s = c.s;
  s.focusFreeUntil = sietNow() + c.life;                 // sin lentitud al canalizar
  kitBuff(h, h, c.life, {dmg: .2, speed: .1, label: 'ENFOQUE'});
  for(const a of sietAllies(h, c.r)) if(a !== h) kitBuff(h, a, c.life, sietFlag(h, 2, 'swift') ? {dmg: .12, speed: .15, label: 'ENFOQUE'} : {dmg: .12, label: 'ENFOQUE'});
  if(h.cds) h.cds[0] = Math.max(0, h.cds[0] * .5);       // el Haz vuelve antes
  sietCue(h, 'ost_focus', {r: c.r, ult: false});
};
SIETE_ACTIONS.ost_align = (h, sk, c) => {
  const o = ostStartBeam(h, sk, c, sk.radius, 180, 0.0055, true);
  for(const a of sietAllies(h, 260)) if(a !== h) kitBuff(h, a, c.life, {dmg: .1, label: 'ALINEACIÓN'});
  kitBuff(h, h, c.life, {dmg: .15, label: 'ALINEACIÓN'});
  if(o) o.novaR = Math.min(220, c.r);
  sietCue(h, 'ost_align', {r: 90, ult: true});
};
SIETE_OBJECTS.beam = (o, dt, h) => {
  const s = sietState(h);
  o.x = h.x; o.y = h.y;
  // gira hacia donde apunta (aimDir) con una velocidad angular limitada: el haz tiene peso
  const d = aimDir(h, o.len), want = Math.atan2(d.y, d.x);
  let diff = Math.atan2(Math.sin(want - o.ang), Math.cos(want - o.ang));
  const step = o.turn * dt; diff = Math.max(-step, Math.min(step, diff)); o.ang += diff;
  while(o.tick <= 0 && !o.ended){
    o.tick += o.tickMs; o.n++;
    const bonus = Math.min(.6, o.n * .04), end = ostBeamEnd(o, o.len);
    for(const e of sietTargets(h, e => seSegDist(e.x, e.y, o.x, o.y, end.x, end.y) <= o.w + (e.radius || 0), 24)){
      const lens = sietOwned(h, 'lens').some(z => distance(z, e) <= z.r);
      sietHit(h, e, o.dmg * (1 + bonus) * (lens ? 1.25 : 1), o.castId, o.ult ? .1 : .06);
      if(o.ult) portadorSlow(h, e, .3, 600);
    }
    if(o.split) for(const off of [-.35, .35]){ const a2 = {x: o.x + Math.cos(o.ang + off) * o.len, y: o.y + Math.sin(o.ang + off) * o.len};
      sietTargets(h, e => seSegDist(e.x, e.y, o.x, o.y, a2.x, a2.y) <= o.w * .6 + (e.radius || 0), 16).forEach(e => sietHit(h, e, o.dmg * .4 * (1 + bonus), o.castId, .06)); }
    s.focus = bonus; s.focusUntil = sietNow() + 2000;
    if(typeof vfxSpray === 'function' && o.n % 3 === 0) vfxSpray(end.x, end.y, 2, 't_#ffe9a8', Math.cos(o.ang), Math.sin(o.ang), 80, 260, 2, 1);
  }
  if(o.life <= 0) ostEndBeam(o, h);
};
function ostEndBeam(o, h){
  if(o.ended) return;
  o.ended = true; sietState(h).beamUntil = 0;
  if(o.ult){
    const end = ostBeamEnd(o, Math.min(o.len, 300));
    sietTargets(h, e => distance(e, end) <= o.novaR + (e.radius || 0), 24).forEach(e => sietHit(h, e, o.dmg * 3, o.castId, .08));
    kitFx('light', end.x, end.y, o.novaR, {ult: true});
  }
}
SIETE_OBJECTS.lens = (o, dt, h) => {
  if(o.tick > 0) return;
  o.tick += 700;
  for(const e of sietTargets(h, e => distance(e, o) <= o.r + (e.radius || 0), 24)){ sietHit(h, e, o.dmg, o.castId, .05); seVuln(e, .14, 1500); portadorSlow(h, e, .22, 900);
    if(o.scorch && !isBossRank(e)){ e.burnTimer = Math.max(e.burnTimer || 0, 3000); e.burnDmg = Math.max(e.burnDmg || 0, o.dmg * .15); } }
};
// Pasiva: Foco Sostenido. Al terminar el Haz, el bono vive 2 s en los básicos.
sietDamageHooks.push((h, e, amount, opts) => (h.classKey === 'ostrel' && opts.fromBasic && !opts.fromProc && sietState(h).focusUntil > sietNow()) ? 1 + (sietState(h).focus || 0) * .6 : 1);
sietSpeedHooks.push(h => { if(h.classKey !== 'ostrel') return 1; const s = h.siState; return s && s.beamUntil > sietNow() && !(s.focusFreeUntil > sietNow()) ? .6 : 1; });
sietHeroHooks.push((h, dt) => { if(h.classKey !== 'ostrel') return; const s = sietState(h); if(s.focus && s.focusUntil < sietNow() && !(s.beamUntil > sietNow())) s.focus = 0; });
