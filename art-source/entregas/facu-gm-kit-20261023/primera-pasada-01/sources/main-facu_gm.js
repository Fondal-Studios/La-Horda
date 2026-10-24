'use strict';
/* ---- Facu GM: soberano de las mareas ---- */
SFA_OBJ.as_current = {theme: 'tide', draw: sfaBeamObj('tide', o => o.bx !== undefined ? {ax: o.x, ay: o.y, bx: o.bx, by: o.by, w: Math.max(30, (o.r || 30) * 1.6)} : null)};
SFA_OBJ.as_ocean = {theme: 'tide', end: 'nova', endDur: 800};
SFA_BIND.facu_gm = {themes: ['tide'],
  0: sfaMulti(c => { const o = sfaObj(c, /as_current/); if (o) sfaP('burst', 'tide', o.x, o.y, 44, {dur: 480}); }),
  1: sfaNovaAt('tide'),
  2: sfaDash('tide', {w: 56}),
  ult: sfaNovaAt('tide')
};
