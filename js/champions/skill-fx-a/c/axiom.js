'use strict';
/* ---- Axiom: el reescritor (bloques de glitch) ---- */
SFA_LISTS.push({get: () => axiomZones, ok: z => z.mode === 'delay' && !z.exploded, theme: 'glitch', r: z => z.radius, left: z => z.timer, end: 'nova', endDur: 620});
SFA_HEROZ.push({key: 'axiom', theme: 'glitch', on: h => axiomFreezeTimer > 0 && axiomFreezeCaster === h, r: () => 230, end: 'nova', alpha: .7});
SFA_BIND.axiom = {themes: ['glitch'],
  0: sfaBurstAt('glitch', 44), 1: sfaBolts('glitch', 22), 2: sfaDash('glitch', {w: 40}),
  ult: c => sfaP('nova', 'glitch', c.h.x, c.h.y, 230, {dur: 1000})
};
