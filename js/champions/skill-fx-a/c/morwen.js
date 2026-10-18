'use strict';
/* ---- Morwen: destiladora de ecos (frascos, burbujas) ---- */
SFA_OBJ.alembic = {theme: 'alchemy', draw: sfaDrawMotifObj('alchemy', 'flask', 3), end: 'nova', endDur: 640};
SFA_BIND.morwen = {themes: ['alchemy'],
  0: c => { const p = c.rec.pts[0]; if (p) sfaP('nova', 'alchemy', p.x, p.y, p.r || 100, {dur: 680}); },
  1: sfaCone('alchemy'),
  2: sfaMulti(sfaAura('alchemy'), c => sfaP('burst', 'alchemy', c.h.x, c.h.y, 50, {dur: 480})),
  ult: c => { const o = sfaObj(c, /alembic/) || c.h; sfaP('nova', 'alchemy', o.x, o.y, 170, {dur: 1000}); }
};
