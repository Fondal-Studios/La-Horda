'use strict';
/* ---- Dáriel: último compás (notas, pentagrama) ---- */
SFA_OBJ.ex_concert = {theme: 'music', pulse: true, end: 'nova', endDur: 700};
SFA_BIND.dariel = {themes: ['music'],
  0: sfaCone('music'),
  1: sfaMulti(sfaNovaAt('music', {self: true}), sfaAura('music', {allies: true, r: 150, test: a => (a.shield || 0) > 0})),
  2: sfaMulti(sfaNovaAt('music', {self: true}), sfaAura('music', {allies: true, r: 140, test: a => a.hp < a.maxHp})),
  ult: sfaNovaAt('music', {self: true})
};
