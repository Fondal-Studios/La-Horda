'use strict';
/* ---- Ilkan: caminante de dunas (arena, pendones) ---- */
SFA_BIND.ilkan = {themes: ['sand'],
  0: c => { const L = ILKAN_CFG.hook.dashDist || 330; sfaP('beam', 'sand', c.h.x, c.h.y, 0, {bx: c.h.x + c.dir.x * L, by: c.h.y + c.dir.y * L, w: 40, dur: 600}); },
  1: sfaAura('sand'),
  2: sfaMulti(c => sfaP('nova', 'sand', c.h.x, c.h.y, ILKAN_CFG.advance.allyRadius || 220, {dur: 800}), sfaAura('sand', {allies: true, r: ILKAN_CFG.advance.allyRadius || 220, test: a => a.advAllyTimer > 0})),
  ult: c => sfaP('nova', 'sand', c.h.x, c.h.y, 230, {dur: 1000})
};
