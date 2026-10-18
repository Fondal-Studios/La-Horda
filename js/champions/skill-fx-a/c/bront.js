'use strict';
/* ---- Bront: fortaleza viviente (placas de acero, cristal) ---- */
SFA_OBJ.as_keep = {theme: 'crystal', end: 'nova', endDur: 600};
SFA_OBJ.as_wall = {theme: 'crystal', draw: sfaBeamObj('crystal', o => o.ax !== undefined ? {ax: o.ax, ay: o.ay, bx: o.bx, by: o.by, w: Math.max(26, (o.r || 26) * 1.1)} : null)};
SFA_BIND.bront = {themes: ['crystal'],
  0: sfaLine('crystal', {w: 52}),
  1: c => { const o = sfaObj(c, /as_wall/); if (o) { sfaP('burst', 'crystal', o.ax, o.ay, 40, {dur: 480}); sfaP('burst', 'crystal', o.bx, o.by, 40, {dur: 480}); sfaP('burst', 'crystal', o.x, o.y, 50, {dur: 520}); } },
  2: sfaMulti(sfaNovaAt('crystal', {self: true}), sfaAura('crystal', {allies: true, r: 180})),
  ult: sfaNovaAt('crystal', {self: true})
};
