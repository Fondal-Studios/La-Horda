'use strict';
/* js/champions/skill-fx-a/templates.js — plantillas de efecto reutilizables por los kits de cada campeón (c/<clave>.js). Solo visual.
   Las plantillas leen la geometría real que registró bind.js (c.rec / c.objs / c.h.exCue / c.h.asCue). */
const sfaCue = c => c.h.exCue || c.h.asCue || null;
const sfaR = c => { const q = sfaCue(c), f = sfaFx(c); return (q && q.r) || (f && f.r) || (c.rec.pts.length && c.rec.pts[c.rec.pts.length - 1].r) || c.sk.radius || 80; };
const sfaPt = c => sfaObj(c) || (c.rec.pts.length && c.rec.pts[c.rec.pts.length - 1]) || (sfaFx(c) && {x: sfaFx(c).x, y: sfaFx(c).y}) || c.h;
function sfaLineOf(c) {
  const l = sfaFx(c, 'line'), q = sfaCue(c);
  if (q && q.bx !== undefined) return {ax: c.from.x, ay: c.from.y, bx: q.bx, by: q.by, w: Math.max(18, q.r * 2)};
  if (l) return {ax: l.ax, ay: l.ay, bx: l.bx, by: l.by, w: Math.max(18, (l.w || 12) * 2)};
  const d = c.rec.dirs[0]; if (d) return {ax: c.from.x, ay: c.from.y, bx: c.from.x + d.x * d.range, by: c.from.y + d.y * d.range, w: 30};
  return null;
}
// plantillas ------------------------------------------------------------
const sfaNovaAt = (th, o) => c => { const p = o && o.self ? c.h : sfaPt(c), r = (o && o.r) || sfaR(c); sfaP('nova', th, p.x, p.y, r, {dur: c.isUlt ? 1000 : (o && o.dur) || 700}); };
const sfaLine = (th, o) => c => { const l = sfaLineOf(c); if (!l) return; sfaP('beam', th, l.ax, l.ay, 0, {bx: l.bx, by: l.by, w: (o && o.w) || l.w, dur: (o && o.dur) || 720, noEnd: 1}); if (!(o && o.noEnd)) sfaP('burst', th, l.bx, l.by, 34, {dur: 420}); };
const sfaCone = (th, o) => c => { const k = c.rec.cones[0]; if (!k) return; sfaP('cone', th, k.x, k.y, k.r, {ang: k.angle, arc: k.arc, dur: c.isUlt ? 760 : 560}); };
const sfaDash = (th, o) => c => { const w = (o && o.w) || 38; if (Math.hypot(c.to.x - c.from.x, c.to.y - c.from.y) > 12) sfaP('beam', th, c.from.x, c.from.y, 0, {bx: c.to.x, by: c.to.y, w, dur: 520, noEnd: 1}); sfaP('burst', th, c.from.x, c.from.y, 30, {dur: 420}); sfaP('burst', th, c.to.x, c.to.y, 38, {dur: 460}); };
const sfaBuffed = a => { const t = runElapsedMs; return (a._kitDmgUntil || 0) > t || (a._kitArmorUntil || 0) > t || a.portSpeedTimer > 0 || (a.shield || 0) > 0; };
const sfaAura = (th, o) => c => {
  o = o || {}; const R = o.r || 150, dur = o.dur || 1600, test = o.test || sfaBuffed;
  const list = o.allies ? heroes.filter(a => a === c.h || Math.hypot(a.x - c.h.x, a.y - c.h.y) <= R) : [c.h];
  for (const a of list) if (a.alive && (a === c.h && o.always !== false ? true : test(a))) sfaP('aura', th, a.x, a.y, 44, {fi: sfaHeroIdx(a), dur});
};
const sfaMulti = (...fs) => c => { for (const f of fs) f(c); };
const sfaThemesOf = (...t) => t;

// objeto-haz persistente (muros, corrientes): teja animada entre dos puntos mientras vive el objeto
const sfaBeamObj = (th, pick) => (o, r) => { const g = pick(o); if (!g) return; const age = (o.maxLife || o.life) - o.life, a = Math.min(1, age / 240, o.life / 380) * .8; if (a <= 0) return;
  ctx.save(); ctx.imageSmoothingEnabled = false; sfaBeamTiles(ctx, th, g.ax, g.ay, g.bx, g.by, g.w, a, 1); ctx.restore(); };


const sfaBurstAt = (th, r, dur) => c => { const p = sfaPt(c); sfaP('burst', th, p.x, p.y, r, {dur: dur || 480}); };
const sfaBolts = (th, w) => c => { for (const b of c.rec.bolts) { sfaP('beam', th, b.x1, b.y1, 0, {bx: b.x2, by: b.y2, w: w || 22, dur: 520, noEnd: 1}); sfaP('burst', th, b.x2, b.y2, 34, {dur: 440}); } };
const sfaTgtBurst = (th, r) => c => { const e = c.rec.tgts[0]; if (e) sfaP('burst', th, e.x, e.y - 8, r, {dur: 460}); };
const sfaOwn = kind => (typeof portadorObjects !== 'undefined' ? portadorObjects : []).filter(o => o.kind === kind && o.life > 0);
