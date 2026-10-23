'use strict';
/* ---- Aelith: tiempo (reloj, arena, engranajes) ---- */
SFA_OBJ.ael_echo = {theme: 'time', end: 'nova', endDur: 520};
SFA_OBJ.ael_hour = {theme: 'time', pulse: true, end: 'nova', endDur: 720};
SFA_BIND.aelith = {themes: ['time'],
  0: sfaNovaAt('time'),
  1: sfaLine('time'),
  2: sfaAura('time', {r: 140, allies: true, test: a => a.aelithDebtUntil > runElapsedMs}),
  ult: sfaNovaAt('time')
};
