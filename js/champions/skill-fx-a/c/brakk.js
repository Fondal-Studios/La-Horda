'use strict';
/* ---- Brakk: arquitecto del fin (hierro, clavos, ladrillos) ---- */
SFA_OBJ.brk_wall = {theme: 'siege', draw: sfaDrawWallObj('siege'), end: 'burst', endR: 52, endDur: 520};
SFA_OBJ.brk_turret = {theme: 'siege', draw: sfaDrawTurretObj('siege'), pulse: true, pulseArt: 'burst', pulseR: 28, pulseDur: 380, end: 'burst', endR: 46, endDur: 520};
SFA_BIND.brakk = {themes: ['siege'],
  0: sfaMulti(sfaNovaAt('siege', {dur: 600}), c => { const p = sfaPt(c); sfaP('burst', 'siege', p.x, p.y, 44, {dur: 500}); }),
  1: sfaMulti(c => { const p = sfaPt(c); sfaP('burst', 'siege', p.x, p.y, 40, {dur: 500}); }, sfaNovaAt('siege', {r: 45, dur: 520})),
  2: sfaMulti(sfaNovaAt('siege', {self: true, dur: 640}), sfaAura('siege')),
  ult: sfaNovaAt('siege', {self: true})
};
