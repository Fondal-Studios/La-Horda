'use strict';
/* ---- Guerrero: Kael (sangre, hojas de daga) ---- */
SFA_LISTS.push({get: () => traps, ok: t => t.src && t.src.classKey === 'guerrero' && !t.triggered, theme: 'blood', r: t => t.radius, left: t => t.timer, end: 'nova', endDur: 520});
SFA_BIND.guerrero = {themes: ['blood'],
  0: sfaTgtBurst('blood', 40), 1: sfaTgtBurst('blood', 56),
  2: c => { const p = c.rec.pts[0]; if (p) sfaP('burst', 'blood', p.x, p.y, 50, {dur: 480}); },
  ult: sfaMulti(c => sfaP('nova', 'blood', c.h.x, c.h.y, 60, {dur: 640}), c => sfaP('aura', 'blood', c.h.x, c.h.y, 44, {fi: sfaHeroIdx(c.h), dur: 3000}))
};
