'use strict';
/* ---- Tobías, el Farolero (llama, polillas, luz) ---- */
SFA_OBJ.lantern = {theme: 'lantern', draw: sfaDrawMotifObj('lantern', 'lantern', 3), end: 'nova', endDur: 520};
SFA_OBJ.path = {theme: 'lantern', draw: sfaBeamObj('lantern', o => o.bx !== undefined ? {ax: o.x, ay: o.y, bx: o.bx, by: o.by, w: Math.max(36, (o.r || 40) * 1.6)} : null)};
SFA_HEROZ.push({key: 'farolero', theme: 'lantern', on: h => h.portVigilTimer > 0, r: h => h.portVigilR, end: 'nova', alpha: .7});
SFA_BIND.farolero = {themes: ['lantern'],
  0: c => { const o = sfaObj(c, /lantern/); if (o) sfaP('nova', 'lantern', o.x, o.y, o.r, {dur: 700}); },
  1: sfaMulti(sfaCone('lantern'), c => sfaP('burst', 'lantern', c.h.x, c.h.y, 60, {dur: 480})),
  2: c => { const o = sfaObj(c, /path/); if (o) sfaP('beam', 'lantern', o.x, o.y, 0, {bx: o.bx, by: o.by, w: Math.max(36, o.r * 1.6), dur: 700}); },
  ult: c => sfaP('nova', 'lantern', c.h.x, c.h.y, c.h.portVigilR || 190, {dur: 1000})
};
