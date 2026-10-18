'use strict';
/* ---- Iria: tejedora de límites (hilos, triángulos) ---- */
SFA_OBJ.anchor = {theme: 'thread', draw: sfaDrawMotifObj('thread', 'node', 3), end: 'nova', endDur: 480};
SFA_OBJ.triangle = {theme: 'thread', draw: o => { const age = (o.maxLife || o.life) - o.life, a = Math.min(1, age / 260, o.life / 420) * .85; if (a <= 0) return; ctx.save(); ctx.imageSmoothingEnabled = false;
  sfaBeamTiles(ctx, 'thread', o.ax, o.ay, o.bx, o.by, 18, a, 1); sfaBeamTiles(ctx, 'thread', o.bx, o.by, o.cx, o.cy, 18, a, 1); sfaBeamTiles(ctx, 'thread', o.cx, o.cy, o.ax, o.ay, 18, a, 1); ctx.restore(); }};
SFA_POLL.push(() => { for (const h of heroes) { if (!h.alive || h.classKey !== 'iria') continue; const tension = h.portTensionTimer > 0;
  ctx.save(); ctx.imageSmoothingEnabled = false; for (const l of portadorLinks(h)) sfaBeamTiles(ctx, 'thread', l.a.x, l.a.y, l.b.x, l.b.y, tension ? 18 : 9, tension ? .9 : .5, 1); ctx.restore(); } });
SFA_BIND.iria = {themes: ['thread'],
  0: c => { const o = sfaObj(c, /anchor/); if (o) { sfaP('burst', 'thread', o.x, o.y, 44, {dur: 520}); sfaP('nova', 'thread', o.x, o.y, 30, {dur: 560}); } },
  1: sfaNovaAt('thread', {self: true, r: 80}),
  2: c => { const p = c.rec.pts[0] || c.h; sfaP('nova', 'thread', p.x, p.y, c.sk.radius || 75, {dur: 640}); },
  ult: c => { const o = sfaObj(c, /triangle/), p = o ? {x: (o.ax + o.bx + o.cx) / 3, y: (o.ay + o.by + o.cy) / 3} : c.h; sfaP('nova', 'thread', p.x, p.y, 160, {dur: 1000}); }
};
