'use strict';
/* ---- San Martín, el Libertador (sol, humo de pólvora) ---- */
SFA_BIND.libertador = {themes: ['patria'],
  0: c => sfaP('beam', 'patria', c.h.x, c.h.y, 0, {bx: c.h.x + c.dir.x * 190, by: c.h.y + c.dir.y * 190, w: 44, dur: 560}),
  1: c => sfaP('nova', 'patria', c.h.x, c.h.y, SM_CFG.granaderos.radius || 430, {dur: 1000}),
  2: c => sfaP('beam', 'patria', c.h.x, c.h.y, 0, {bx: c.h.x + c.dir.x * 430, by: c.h.y + c.dir.y * 430, w: 64, dur: 720}),
  ult: c => sfaP('nova', 'patria', c.h.x, c.h.y, 210, {dur: 1000})
};
