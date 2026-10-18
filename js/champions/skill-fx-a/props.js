'use strict';
/* js/champions/skill-fx-a/props.js — objetos persistentes con sprite propio (muro y torreta de Brakk, anclas, farolas,
   alambique...). Arte de píxel horneado una vez por tema; el objeto del motor sigue siendo el mismo (misma hitbox y vida):
   esto solo cambia cómo se ve. Nacen con una subida corta y polvo, y al caerse hacen un estallido de escombros. */
const sfaPropCache = new Map();
function sfaPropGet(key, w, h, paint) {
  let b = sfaPropCache.get(key); if (b) return b;
  const S = new SfaStrip(w, h, 1); paint(S); b = {cv: S.toCanvas(), w, h}; sfaPropCache.set(key, b); return b;
}
// motivo del tema ampliado (ancla, farola, frasco...)
function sfaMotifCv(theme, name, sc) {
  return sfaPropGet('m|' + theme + '|' + name + '|' + sc, sfaMotif(name).w * sc + 2, sfaMotif(name).h * sc + 2, S => sfaStamp(S, 0, name, S.w / 2, S.h / 2, sfaThemes[theme], null, false, sc));
}
// teja de muro de ladrillos (16 x 13): hileras desfasadas, luz arriba y sombra abajo
function sfaWallCv(theme) {
  const T = sfaThemes[theme];
  return sfaPropGet('wall|' + theme, 16, 13, S => {
    for (let y = 0; y < 13; y++) { const row = (y / 4) | 0, ry = y % 4, off = row % 2 ? 4 : 0;
      for (let x = 0; x < 16; x++) { const bx = (x + off) % 8, mortar = ry === 0 || bx === 0;
        S.set(0, x, y, mortar ? T.px.o : (ry === 1 ? T.px.b : ry === 3 ? T.px.d : T.px.a)); } }
    for (let x = 0; x < 16; x += 5) S.set(0, x, 6, T.px.e);
  });
}
// torreta de clavos (26 x 26): base de hierro, torreta y cañón que apunta a la derecha; se gira al dibujar
function sfaTurretCv(theme) {
  const T = sfaThemes[theme], P = T.px;
  return sfaPropGet('turret|' + theme, 28, 28, S => {
    const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) S.set(0, x, y, c); };
    rect(3, 16, 24, 26, P.o); rect(4, 17, 23, 25, P.a); rect(4, 17, 23, 18, P.b); rect(4, 24, 23, 25, P.d);
    for (const x of [6, 13, 20]) { rect(x, 20, x + 1, 21, P.o); S.set(0, x, 20, P.c); }
    rect(8, 7, 19, 16, P.o); rect(9, 8, 18, 15, P.a); rect(9, 8, 18, 9, P.b); rect(9, 14, 18, 15, P.d);
    rect(17, 9, 27, 14, P.o); rect(18, 10, 26, 13, P.d); rect(18, 10, 26, 10, P.a); rect(25, 10, 26, 13, P.e);
    S.set(0, 13, 11, P.e); S.set(0, 14, 11, P.e);
  });
}
function sfaPropAlpha(o) { const age = (o.maxLife || o.life) - o.life; return Math.min(1, age / 220, o.life / 300); }
function sfaDrawWallObj(theme) {
  return o => {
    const a = sfaPropAlpha(o); if (a <= 0) return; const b = sfaWallCv(theme), L = o.r * 2, th = 28, rise = Math.min(1, ((o.maxLife || o.life) - o.life) / 260), step = 16 * (th / 13);
    const n = Math.max(1, Math.ceil(L / step));
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(o.x, o.y); ctx.rotate(Math.atan2(o.dy, o.dx)); ctx.globalAlpha = a;
    const hp = o.maxHp ? Math.max(0, o.hp / o.maxHp) : 1;
    for (let i = 0; i < n; i++) { const wl = Math.min(step, L - i * step); ctx.drawImage(b.cv, 0, 0, 16 * (wl / step), 13, -o.r + i * step, -th / 2 * rise, wl, th * rise); }
    if (hp < .5) { ctx.globalAlpha = a * (1 - hp * 2) * .5; ctx.fillStyle = '#101010'; for (let i = 0; i < n; i++) ctx.fillRect(-o.r + i * step + 5, -th / 2 * rise + 4, 4, 7); }
    ctx.restore();
  };
}
function sfaDrawTurretObj(theme) {
  return o => {
    const a = sfaPropAlpha(o); if (a <= 0) return; const b = sfaTurretCv(theme), sc = 2.3, rise = Math.min(1, ((o.maxLife || o.life) - o.life) / 280);
    let ang = 0; const h = o.owner; if (h && typeof qualityFiveEnemies === 'function') { let best = null, bd = o.range || 230; for (const e of qualityFiveEnemies(h)) { const d = Math.hypot(e.x - o.x, e.y - o.y); if (d < bd) { bd = d; best = e; } } if (best) ang = Math.atan2(best.y - o.y, best.x - o.x); }
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = a; ctx.translate(o.x, o.y + 4);
    ctx.drawImage(b.cv, 3, 16, 22, 11, -11 * sc, -4 * sc, 22 * sc, 11 * sc * rise);   // base fija
    ctx.translate(0, -8 * sc * rise); ctx.rotate(ang); ctx.drawImage(b.cv, 8, 7, 20, 10, -6 * sc, -5 * sc * rise, 20 * sc, 10 * sc * rise);   // torreta y cañón giran
    ctx.restore();
  };
}
// objeto con un motivo del tema encima de su zona (ancla, farola, alambique)
function sfaDrawMotifObj(theme, motif, sc, o2) {
  return (o, r) => {
    const age = (o.maxLife || o.life) - o.life, a = Math.min(1, age / 240, o.life / 360);
    if (a <= 0) return; if (o2 && o2.zone !== false) sfaZoneDraw(theme, o.x, o.y, r, a * (o2.zoneAlpha || .85));
    const b = sfaMotifCv(theme, motif, sc), bob = Math.sin(animNow / 260 + (o.id || 0)) * 1.8, rise = Math.min(1, age / 300);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = a; ctx.drawImage(b.cv, o.x - b.w / 2, o.y - b.h - 4 + bob - (1 - rise) * 8, b.w, b.h); ctx.restore();
  };
}
