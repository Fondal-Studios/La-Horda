'use strict';
/* ---- Cazadora: Sylva (hojas, flechas) ---- */
SFA_LISTS.push({get: () => traps, ok: t => t.src && t.src.classKey === 'cazadora' && !t.triggered, theme: 'hunt', r: t => t.radius, left: t => t.timer, end: 'nova', endDur: 560});
SFA_LISTS.push({get: () => sylvaRainZones, ok: z => z.src && z.src.classKey === 'cazadora' && !z.exploded, theme: 'hunt', r: z => z.radius, left: z => z.timer, end: 'nova', endDur: 800});
SFA_BIND.cazadora = {themes: ['hunt'],
  0: c => { const d = c.rec.dirs[0] || {x: c.dir.x, y: c.dir.y, range: c.sk.range || 420}, L = d.range || 420; sfaP('beam', 'hunt', c.h.x, c.h.y - 10, 0, {bx: c.h.x + d.x * L, by: c.h.y - 10 + d.y * L, w: 30, dur: 520}); },
  1: c => { const p = c.rec.pts[0]; if (p) sfaP('burst', 'hunt', p.x, p.y, 46, {dur: 480}); },
  2: c => { const p = c.rec.pts[0]; if (p) sfaP('nova', 'hunt', p.x, p.y, p.r, {dur: 600}); },
  ult: sfaMulti(c => sfaP('nova', 'hunt', c.h.x, c.h.y, 110, {dur: 900}), c => sfaP('aura', 'hunt', c.h.x, c.h.y, 44, {fi: sfaHeroIdx(c.h), dur: 4000}))
};
