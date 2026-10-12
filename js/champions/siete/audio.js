'use strict';
// Acentos sintetizados propios de los siete (mezcla compartida: mute, prioridades y techo de voces de audio.js).
// Lanzamiento: 2 capas; definitiva: 4 capas. Son acentos de diseño, no audio aprobado por escucha humana.
const SI_AUDIO = {ostrel:[880,1320,'sine'], grelk:[196,130,'triangle'], ilsa:[1175,880,'triangle'], vorn:[110,82,'triangle'],
  nerith:[330,494,'sine'], quillon:[587,740,'triangle'], kora:[98,65,'triangle']};
for(const [k, [a, b, type]] of Object.entries(SI_AUDIO)){
  ARENA_SFX['si_' + k + '_cast'] = {p: 2, gap: 330, play(t, D){ _tone(t, type, a, b, .16, .045, D); _tone(t + .06, 'sine', b, b * 1.5, .12, .022, D); return .2; }};
  ARENA_SFX['si_' + k + '_ult'] = {p: 3, gap: 900, play(t, D){ _tone(t, type, a * .5, a, .3, .05, D); _tone(t + .18, 'sine', b, b * 1.5, .35, .035, D); _tone(t + .36, 'sine', a * 1.5, a, .4, .028, D); _tone(t + .5, 'triangle', a * .25, a * .25, .6, .03, D); return .9; }};
}
ARENA_SFX.si_trap = {p: 1, gap: 120, play(t, D){ _tone(t, 'triangle', 180, 90, .1, .04, D); _tone(t + .02, 'sine', 900, 400, .06, .02, D); return .12; }};
ARENA_SFX.si_parry = {p: 2, gap: 150, play(t, D){ _tone(t, 'triangle', 1568, 1175, .08, .04, D); _tone(t + .03, 'sine', 2093, 1568, .08, .02, D); return .12; }};
