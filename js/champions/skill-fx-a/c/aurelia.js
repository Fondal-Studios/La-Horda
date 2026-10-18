'use strict';
/* ---- Aurelia: arquitecta solar (prismas, haces, catedral) ---- */
SFA_OBJ.as_cathedral = {theme: 'prism', end: 'nova', endDur: 700};
SFA_BIND.aurelia = {themes: ['prism'],
  0: sfaMulti(sfaNovaAt('prism', {dur: 620}), c => { const p = sfaPt(c); sfaP('burst', 'prism', p.x, p.y, 40, {dur: 520}); }),
  1: sfaLine('prism'),
  2: sfaDash('prism', {w: 44}),
  ult: sfaNovaAt('prism')
};
