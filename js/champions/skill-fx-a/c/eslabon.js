'use strict';
/* ---- Garren, el Eslabón (cadenas, eslabones) ---- */
SFA_OBJ.chain = {theme: 'chain', draw: sfaBeamObj('chain', o => o.ax !== undefined ? {ax: o.ax, ay: o.ay, bx: o.bx, by: o.by, w: 26} : null)};
SFA_HEROZ.push({key: 'eslabon', theme: 'chain', on: h => h.portRingTimer > 0, r: h => h.portRingR, end: 'nova', alpha: .75});
SFA_BIND.eslabon = {themes: ['chain'],
  0: c => { const o = sfaObj(c, /hook/); if (o) { sfaP('beam', 'chain', c.h.x, c.h.y - 12, 0, {bx: o.x, by: o.y - 12, w: 24, dur: 560, noEnd: 1}); sfaP('burst', 'chain', o.x, o.y, 44, {dur: 480}); } },
  1: c => { const o = sfaObj(c, /chain/); if (o) { sfaP('burst', 'chain', o.ax, o.ay, 40, {dur: 480}); sfaP('burst', 'chain', o.bx, o.by, 40, {dur: 480}); } },
  2: c => { sfaP('aura', 'chain', c.h.x, c.h.y, 44, {fi: sfaHeroIdx(c.h), dur: 2200}); const a = heroes[c.h.portWardSlot]; if (a && a !== c.h && a.alive) { sfaP('aura', 'chain', a.x, a.y, 44, {fi: sfaHeroIdx(a), dur: 2200}); sfaP('beam', 'chain', c.h.x, c.h.y - 12, 0, {bx: a.x, by: a.y - 12, w: 18, dur: 700, noEnd: 1}); } },
  ult: c => sfaP('nova', 'chain', c.h.x, c.h.y, c.h.portRingR || 190, {dur: 1000})
};
