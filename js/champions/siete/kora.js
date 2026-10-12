'use strict';
/* ============================================================
   Kora, la Ariete — tanque de IMPULSO y colisión.
   Mecánica propia: moverse acumula Impulso (0–100; se pierde parada) que suma +0,4% de daño por punto a sus básicos y escala sus habilidades de impacto.
   Arremetida arrastra hasta seis comunes y los estrella contra los vecinos; Pisotón gasta Impulso para
   empujar y frenar; Cabeza Gacha vuelve imparable el avance; Estampida es una carrera guiada que arrolla.
   Jefes y élites nunca se arrastran (ascMovable): solo reciben el golpe; el daño contra jefes tiene techo.
   ============================================================ */
const koraMom = h => (h.siState && h.siState.mom) || 0;
SIETE_ACTIONS.kor_ram = (h, sk, c) => {
  const mult = 1 + koraMom(h) * .006, a = {x: h.x, y: h.y}, carried = [];
  let moved = 0;
  while(moved < Math.min(220, c.range)){
    const st = Math.min(8, Math.min(220, c.range) - moved);
    if(!exSafeStep(h, {x: h.x + c.dir.x * st, y: h.y + c.dir.y * st})) break;
    moved += st;
    for(const e of sietTargets(h, e => distance(e, h) <= 40 + (e.radius || 0), 24))
      if(carried.length < (sietFlag(h, 0, 'bigcarry') ? 9 : 6) && !carried.includes(e) && ascMovable(e) && !isEliteRank(e)) carried.push(e);
    for(const e of carried) sietPush(e, c.dir.x, c.dir.y, st);
  }
  const done = new Set(carried);
  for(const e of sietTargets(h, e => seSegDist(e.x, e.y, a.x, a.y, h.x, h.y) <= sk.radius + (e.radius || 0), 24)) done.add(e);
  for(const e of done) sietHit(h, e, c.dmg * mult, c.castId, .08);
  // colisión: cada arrastrado golpea a los vecinos que no arrastró
  for(const e of carried) for(const n of sietTargets(h, n => !done.has(n) && distance(n, e) <= 58 + (n.radius || 0), 8)){
    sietHit(h, n, c.dmg * mult * .7, c.castId, .08); n.stunTimer = Math.max(n.stunTimer || 0, isBossRank(n) ? 0 : 500);
  }
  c.s.mom = Math.max(0, koraMom(h) - 40);
  kitFxLine('earth', a.x, a.y, h.x, h.y, 40); c.noFx = true;
};
SIETE_ACTIONS.kor_quake = (h, sk, c) => {
  const mult = 1 + koraMom(h) * .009, stun = sietFlag(h, 1, 'stun'), rr = c.r * (stun ? 1.2 : 1);
  sietTargets(h, e => distance(e, h) <= rr + (e.radius || 0), 24).forEach(e => {
    sietHit(h, e, c.dmg * mult, c.castId, .08);
    portadorSlow(h, e, .3, 1400);
    if(isEliteRank(e)) e.stunTimer = Math.max(e.stunTimer || 0, 300);
    else {
      if(stun && !isBossRank(e)) e.stunTimer = Math.max(e.stunTimer || 0, 400); const d = distance(e, h) || 1; sietPush(e, (e.x - h.x) / d, (e.y - h.y) / d, 40 + koraMom(h) * .3); }
  });
  c.s.mom = Math.floor(koraMom(h) / 2);
};
SIETE_FX.kor_quake = 'earth';
SIETE_ACTIONS.kor_brace = (h, sk, c) => {
  c.s.braceUntil = sietNow() + c.life;
  kitBuff(h, h, c.life, {armor: .25, speed: .12, label: 'CABEZA GACHA'});
  exShield(h, h, .08, c.life); h.slowTimer = 0;
  if(sietFlag(h, 2, 'roll')) c.s.mom = Math.min(100, koraMom(h) + 25);
  sietCue(h, 'kor_brace', {r: 46});
};
SIETE_FX.kor_brace = 'shield';
SIETE_ACTIONS.kor_stampede = (h, sk, c) => {
  c.s.stampede = {until: sietNow() + c.life, ang: Math.atan2(c.dir.y, c.dir.x), dmg: c.dmg, castId: c.castId, tick: 0, r: c.r};
  kitBuff(h, h, c.life + 2000, {armor: .3, speed: .1, label: 'ESTAMPIDA'});
  sietCue(h, 'kor_stampede', {r: 60, ult: true, until: sietNow() + c.life});
};
SIETE_FX.kor_stampede = 'earth';
function koraStampede(h, dt){
  const s = sietState(h), st = s.stampede; if(!st) return;
  const t = sietNow();
  if(t >= st.until){
    s.stampede = null;
    sietTargets(h, e => distance(e, h) <= st.r + (e.radius || 0), 24).forEach(e => { sietHit(h, e, st.dmg * 1.4 * (1 + koraMom(h) * .004), st.castId, .1); portadorSlow(h, e, .35, 1500); if(!isBossRank(e) && !isEliteRank(e)){ const d = distance(e, h) || 1; sietPush(e, (e.x - h.x) / d, (e.y - h.y) / d, 48); } });
    kitFx('earth', h.x, h.y, st.r, {ult: true}); s.mom = 0; return;
  }
  const d = aimDir(h, 300), want = Math.atan2(d.y, d.x);
  let diff = Math.atan2(Math.sin(want - st.ang), Math.cos(want - st.ang));
  const lim = 0.0028 * dt; diff = Math.max(-lim, Math.min(lim, diff)); st.ang += diff;
  let moved = 0; const len = dt * .34;
  while(moved < len){ const stp = Math.min(6, len - moved); if(!exSafeStep(h, {x: h.x + Math.cos(st.ang) * stp, y: h.y + Math.sin(st.ang) * stp})){ st.until = t; break; } moved += stp; }
  st.tick -= dt;
  if(st.tick <= 0){ st.tick += 200;
    portadorWith(h, () => sietTargets(h, e => distance(e, h) <= 58 + (e.radius || 0), 24).forEach(e => {
      sietHit(h, e, st.dmg * .3, st.castId, .1);
      if(!isBossRank(e) && !isEliteRank(e)) sietPush(e, Math.cos(st.ang), Math.sin(st.ang), 26);
    }));
  }
}
sietHeroHooks.push((h, dt) => {
  if(h.classKey !== 'kora') return;
  const s = sietState(h), t = sietNow();
  const moved = h._siPX === undefined ? 0 : Math.hypot(h.x - h._siPX, h.y - h._siPY);
  h._siPX = h.x; h._siPY = h.y;
  const boost = s.braceUntil > t ? 2 : 1;
  if(moved > .5 && moved < 80) s.mom = Math.min(100, (s.mom || 0) + moved * .2 * boost);
  else if(moved <= .5) s.mom = Math.max(0, (s.mom || 0) - dt * .02);
  if(s.braceUntil > t){ h.slowTimer = 0; h.stunTimer = 0; }
  koraStampede(h, dt);
});
sietDamageHooks.push((h, e, amount, opts) => (h.classKey === 'kora' && opts.fromBasic && !opts.fromProc) ? 1 + koraMom(h) * .004 : 1);
