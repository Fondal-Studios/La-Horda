'use strict';
/* ---- Musashi: el rōnin (tinta, cortes) ---- */
SFA_BIND.musashi = {themes: ['ink'],
  0: sfaMulti(sfaDash('ink', {w: 30}), sfaTgtBurst('ink', 54)),
  1: sfaMulti(sfaDash('ink', {w: 30}), sfaTgtBurst('ink', 46)),
  2: c => sfaP('nova', 'ink', c.h.x, c.h.y, 150, {dur: 700}),
  ult: c => { sfaP('nova', 'ink', c.h.x, c.h.y, 200, {dur: 1000}); const t = c.h.duelTarget; if (t) sfaP('burst', 'ink', t.x, t.y, 70, {dur: 700}); }
};
