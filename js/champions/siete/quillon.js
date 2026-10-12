'use strict';
/* ============================================================
   Quillon, el Tahúr de la Última Mano — mago de BARAJA (recurso por palos).
   Mecánica propia: lleva una baraja fija de cuatro palos que se juegan en orden: ♠ Espadas (daño), ♣ Bastos (frena
   y deja vulnerable), ♥ Copas (cura) y ♦ Oros (potencia). Sus habilidades juegan la carta que toca, así que planear
   el orden es el juego. Racha de Cuatro: cuatro cartas seguidas sin descartar hacen doble la siguiente. Apuesta Doble
   salta la carta del tope y duplica la próxima. Sin aleatoriedad: el orden es siempre el mismo y se ve sobre él.
   ============================================================ */
const QUI_SUITS = ['♠', '♣', '♥', '♦'];
const QUI_THEMES = ['slash', 'rune', 'light', 'spark'];
function quiDeck(h){ const s = sietState(h); if(!s.deck){ s.deck = [0, 1, 2, 3]; s.pos = 0; s.streak = 0; } return s; }
function quiPeek(h, n){ const s = quiDeck(h); return s.deck[(s.pos + (n || 0)) % 4]; }
function quiDraw(h){ const s = quiDeck(h), suit = s.deck[s.pos % 4]; s.pos = (s.pos + 1) % 4; return suit; }
function quiPlay(h, suit, p, r, dmg, castId, mult){
  const s = sietState(h); let dbl = mult || 1;
  if(s.doubleNext){ dbl *= 2; s.doubleNext = false; }
  if(s.betUntil > sietNow()){ dbl *= 2; s.betUntil = 0; }
  const cue = h.siCue && h.siCue.until > sietNow() && h.siCue.cards ? h.siCue : (h.siCue = {action: 'qui_cards', until: sietNow() + 900, cards: []});
  if(cue.cards.length < 6) cue.cards.push({x: p.x, y: p.y, suit, r});
  if(suit === 0){
    sietTargets(h, e => distance(e, p) <= r + (e.radius || 0), 20).forEach(e => sietHit(h, e, dmg * dbl, castId, .07));
  } else if(suit === 1){
    sietTargets(h, e => distance(e, p) <= r + (e.radius || 0), 20).forEach(e => { sietHit(h, e, dmg * .3, castId, .04); portadorSlow(h, e, .35 * Math.min(1.4, dbl), 1800); seVuln(e, .12, 2500); });
  } else if(suit === 2){
    for(const a of sietAllies(p, r + 40)){ exHeal(h, a, .03 * dbl); exShield(h, a, .02 * dbl, 2000); }
  } else {
    for(const a of sietAllies(p, r + 40)) kitBuff(h, a, 3000, {dmg: dbl > 1 ? .2 : .12, label: 'ORO'});
  }
  kitFx(QUI_THEMES[suit], p.x, p.y, r * .9);
}
function quiStreak(h){
  const s = quiDeck(h); s.streak = (s.streak || 0) + 1;
  if(s.streak >= 4){ s.streak = 0; s.doubleNext = true; if(typeof floatText === 'function') floatText(h.x, h.y - 56, '¡RACHA!', null); }
}
SIETE_ACTIONS.qui_deal = (h, sk, c) => {
  quiDeck(h);
  const base = Math.atan2(c.dir.y, c.dir.x), d = Math.min(150, c.range);
  for(const off of [-.34, 0, .34]){
    const p = sietSafePoint({x: h.x + Math.cos(base + off) * d, y: h.y + Math.sin(base + off) * d});
    quiPlay(h, quiDraw(h), p, Math.min(80, c.r) * (sietFlag(h, 0, 'wide') ? 1.25 : 1), c.dmg, c.castId);
    quiStreak(h);
  }
  c.noFx = true;
};
SIETE_ACTIONS.qui_ace = (h, sk, c) => {
  quiDeck(h);
  const suit = quiDraw(h), a = {x: h.x, y: h.y}, e2 = c.end, s = c.s, sharp = sietFlag(h, 1, 'sharp') ? 1.25 : 1;
  let dbl = 1; if(s.doubleNext){ dbl *= 2; s.doubleNext = false; } if(s.betUntil > sietNow()){ dbl *= 2; s.betUntil = 0; }
  sietTargets(h, e => seSegDist(e.x, e.y, a.x, a.y, e2.x, e2.y) <= sk.radius + (e.radius || 0), 20).forEach(e => {
    sietHit(h, e, c.dmg * sharp * (suit === 0 ? 1.4 * dbl : .7), c.castId, .07);
    if(suit === 1){ portadorSlow(h, e, .4 * Math.min(1.4, dbl), 1800); seVuln(e, .14, 2500); }
  });
  for(const al of heroes) if(al.alive && !al.fused && seSegDist(al.x, al.y, a.x, a.y, e2.x, e2.y) <= sk.radius + 30){
    if(suit === 2){ exHeal(h, al, .035 * dbl); exShield(h, al, .03 * dbl, 2000); }
    if(suit === 3) kitBuff(h, al, 3000, {dmg: dbl > 1 ? .2 : .12, label: 'ORO'});
  }
  const cue = h.siCue = {action: 'qui_cards', until: sietNow() + 900, cards: [{x: e2.x, y: e2.y, suit, r: 40}]};
  kitFxLine(QUI_THEMES[suit], a.x, a.y, e2.x, e2.y, 24);
  quiStreak(h); c.noFx = true;
};
SIETE_ACTIONS.qui_bet = (h, sk, c) => {
  const s = quiDeck(h);
  s.pos = (s.pos + 1) % 4; s.streak = 0;                  // salta la carta del tope
  s.betUntil = sietNow() + c.life;
  kitBuff(h, h, c.life, {dmg: .14, label: 'APUESTA'});
  for(const a of sietAllies(h, c.r)) if(a !== h){ kitBuff(h, a, c.life, {dmg: .1, label: 'APUESTA'}); if(sietFlag(h, 2, 'rich')) exHeal(h, a, .02); }
  sietCue(h, 'qui_bet', {r: c.r});
};
SIETE_FX.qui_bet = 'spark';
SIETE_ACTIONS.qui_royal = (h, sk, c) => {
  const p = c.point();
  sietObject(h, 'royal', p, c.life, {r: c.r, dmg: c.dmg, castId: c.castId, step: 0, tick: 0}, 1);
  c.noFx = true;
};
SIETE_OBJECTS.royal = (o, dt, h) => {
  if(o.tick > 0 || o.step >= 4) return;
  o.tick += 450;
  quiPlay(h, o.step, o, o.r, o.dmg, o.castId, 1);       // ♠ ♣ ♥ ♦ en ese orden, siempre
  o.step++;
};
sietHeroHooks.push(h => { if(h.classKey === 'quillon') quiDeck(h); });
