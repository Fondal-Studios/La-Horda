'use strict';
/* ---- Khepri: portador del enjambre (escarabajos) ---- */
SFA_OBJ.as_eclipse = {theme: 'scarab', end: 'nova', endDur: 700};
SFA_BIND.khepri = {themes: ['scarab'],
  0: c => { const o = sfaObj(c, /as_swarm/), r = sfaR(c); const tx = o ? o.tx : c.h.x, ty = o ? o.ty : c.h.y; sfaP('beam', 'scarab', c.h.x, c.h.y, 0, {bx: tx, by: ty, w: 26, dur: 520, noEnd: 1}); sfaP('nova', 'scarab', tx, ty, r, {dur: 700}); },
  1: sfaAura('scarab'),
  2: sfaDash('scarab', {w: 44}),
  ult: sfaNovaAt('scarab', {self: true})
};
