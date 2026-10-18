'use strict';
/* ---- Morveth: jardinero de la peste ---- */
SFA_OBJ.mor_mushroom = {theme: 'plague', pulse: true, draw: sfaDrawMotifObj('plague', 'shroom', 3), end: 'nova', endDur: 520};
SFA_OBJ.mor_garden = {theme: 'plague', pulse: true, end: 'nova', endDur: 720};
SFA_BIND.morveth = {themes: ['plague'],
  0: sfaNovaAt('plague', {dur: 620}),
  1: sfaCone('plague'),
  2: sfaMulti(sfaNovaAt('plague', {self: true, dur: 640}), sfaAura('plague', {allies: true, r: 150})),
  ult: sfaNovaAt('plague')
};
