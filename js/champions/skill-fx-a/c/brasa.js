'use strict';
/* ---- Brasa: mecánica fugitiva (latón, vapor, engranajes) ---- */
SFA_OBJ.steam = {theme: 'steam', end: 'nova', endDur: 480};
SFA_BIND.brasa = {themes: ['steam'],
  0: c => { const o = sfaObj(c, /turret/); if (o) { sfaP('burst', 'steam', o.x, o.y, 44, {dur: 520}); sfaP('nova', 'steam', o.x, o.y, 40, {dur: 620}); } },
  1: sfaCone('steam'),
  2: sfaMulti(sfaAura('steam'), c => sfaP('burst', 'steam', c.h.x, c.h.y, 50, {dur: 480})),
  ult: c => { sfaP('nova', 'steam', c.h.x, c.h.y, 120, {dur: 1000}); sfaAura('steam')(c); for (const t of sfaOwn('turret').filter(o => o.owner === c.h)) sfaP('nova', 'steam', t.x, t.y, 56, {dur: 700}); }
};
