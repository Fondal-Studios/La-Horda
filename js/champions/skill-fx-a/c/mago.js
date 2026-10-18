'use strict';
/* ---- Mago: Thalen (fuego, escarcha, tormenta) ---- */
SFA_LISTS.push({get: () => fireWalls, ok: w => w.src && w.src.classKey === 'mago', theme: 'fire', r: w => w.outerR, left: w => w.timer, inner: w => w.innerR / w.outerR, end: 'nova', endDur: 600, alpha: .8});
SFA_HEROZ.push({key: 'mago', theme: 'storm', on: h => h.stormTimer > 0, r: h => h.stormRadius, end: 'nova', alpha: .6});
SFA_BIND.mago = {themes: ['fire', 'frost', 'storm'],
  0: c => { const p = c.rec.pts[0]; if (p) sfaP('nova', 'fire', p.x, p.y, p.r, {dur: 640}); },
  1: c => { const f = c.rec.frost[0]; if (f) sfaP('nova', 'frost', f.x, f.y, f.r, {dur: 700}); },
  2: sfaBolts('storm', 26),
  ult: c => { const f = c.rec.frost[0] || {x: c.h.x, y: c.h.y, r: 230}; sfaP('nova', 'fire', f.x, f.y, f.r, {dur: 1000}); sfaP('nova', 'frost', f.x, f.y, f.r * .85, {dur: 900}); }
};
