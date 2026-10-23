'use strict';
/* ---- Baltra: campana sumergida (bronce, ondas de sonido) ---- */
SFA_OBJ.ex_toll = {theme: 'bell', pulse: true, end: 'nova', endDur: 700};
SFA_BIND.baltra = {themes: ['bell'],
  0: sfaNovaAt('bell', {self: true}),
  1: sfaMulti(c => { const k = c.rec.cones[0], d = c.dir; sfaP('cone', 'bell', c.h.x, c.h.y, 120, {ang: k ? k.angle : Math.atan2(d.y, d.x), arc: .95, dur: 700}); }, sfaAura('bell')),
  2: sfaCone('bell'),
  ult: sfaNovaAt('bell', {self: true})
};
