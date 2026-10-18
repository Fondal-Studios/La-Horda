'use strict';
/* ---- Maura: pastora de espinas ---- */
SFA_OBJ.ex_thorns = {theme: 'thorn', end: 'nova', endDur: 520};
SFA_OBJ.ex_bark = {theme: 'thorn', end: 'nova', endDur: 560};
SFA_OBJ.ex_forest = {theme: 'thorn', pulse: true, end: 'nova', endDur: 720};
SFA_BIND.maura = {themes: ['thorn'],
  0: sfaLine('thorn'),
  1: sfaMulti(sfaNovaAt('thorn', {self: true, dur: 640}), sfaAura('thorn')),
  2: sfaNovaAt('thorn', {self: true}),
  ult: sfaNovaAt('thorn', {self: true})
};
