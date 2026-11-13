'use strict';
/* ---- Nigromante (Ilvar): Plaga de los Condenados ----
   Antes la zona se dibujaba con tres imágenes pintadas a mano (plague-ground1/2/3: degradados suaves y miles de colores) escaladas en el suelo,
   fuera del estilo pixel art del resto. Ahora es una zona NATIVA (SFA) en el punto REAL del lanzamiento y con el radio REAL de la habilidad.
   Solo visual: daño, alcance, duración y contagio no cambian (abilities.js, case "condemned_plague"). */
SFA_BIND.nigromante = {themes: ['necro'],
  2: c => {
    const p = c.rec.pts[0] || {x: c.h.x + c.dir.x * 150, y: c.h.y + c.dir.y * 150, r: c.sk.radius || 140};
    sfaP('nova', 'necro', p.x, p.y, p.r, {dur: 700});
    sfaP('zone', 'necro', p.x, p.y, p.r, {dur: 1500});
  }
};

/* Contagio de la Plaga: al morir un maldito, un hilo de alma verde va del cadáver a cada contagiado (antes el contagio no se veía: el vecino
   simplemente aparecía maldito). Solo dibujo; el alcance y el tope de generaciones son los de nigromantePlagueDeathSpread. El hilo lo dibuja
   drawNigroCurseMark (js/rendering/entities.js) desde e._linkFx; la onda violeta de llegada también. Máx. 5 por muerte y cuadro. */
let nigroLinkFrame = -1, nigroLinkCount = 0;
function nigroPlagueLinkFx(from, to) {
  if (window.SFA_OFF) return;
  if (nigroLinkFrame !== animNow) { nigroLinkFrame = animNow; nigroLinkCount = 0; }
  if (++nigroLinkCount > 5) return;
  to._linkFx = {x: from.x, y: from.y, t0: performance.now()};
}

/* Alma que viaja al Nigromante (Cosecha de Almas / muerte de un maldito). Antes era pushChainBolt: el rayo azul y blanco de la Cadena de Relámpago,
   fuera de la paleta verde espectral del campeón y confundible con un ataque eléctrico. Ahora un orbe verde con estela en arco, píxel nativo
   y con contorno oscuro. Solo dibujo: la ganancia de almas (nigroGainSouls) no cambia. Máx. 14 orbes a la vez. */
const NIGRO_SOUL_FX = [];
function nigroSoulFx(x, y, h) {
  if (window.SFA_OFF) return false;
  if (NIGRO_SOUL_FX.length >= 14) NIGRO_SOUL_FX.shift();
  NIGRO_SOUL_FX.push({x, y, h, t0: performance.now(), dur: 380 + Math.min(260, Math.hypot(h.x - x, h.y - y) * 0.6)});
  return true;
}
(function () {
  if (typeof drawPortadorTop !== 'function') return;
  const t0 = drawPortadorTop;
  drawPortadorTop = function () {
    t0.apply(this, arguments);
    if (!NIGRO_SOUL_FX.length || window.SFA_OFF) return;
    const now = performance.now();
    ctx.save();
    for (let i = NIGRO_SOUL_FX.length - 1; i >= 0; i--) {
      const f = NIGRO_SOUL_FX[i], k = (now - f.t0) / f.dur;
      if (k >= 1 || k < 0 || !f.h || !f.h.alive) { NIGRO_SOUL_FX.splice(i, 1); continue; }
      const tx = f.h.x, ty = f.h.y - 28;
      for (let j = 4; j >= 0; j--) {   // cabeza (j=0) y estela
        const u = Math.max(0, k - j * 0.045), e = u * u * (3 - 2 * u), arc = Math.sin(u * Math.PI) * 26;
        const px = Math.round(f.x + (tx - f.x) * e), py = Math.round(f.y + (ty - f.y) * e - arc), s = j === 0 ? 9 : 7 - (j > 2 ? 2 : 0);
        ctx.globalAlpha = (1 - k * 0.4) * (1 - j * 0.17);
        ctx.fillStyle = '#06140c'; ctx.fillRect(px - s / 2 - 1, py - s / 2 - 1, s + 2, s + 2);
        ctx.fillStyle = j === 0 ? '#f0fff4' : j < 3 ? '#a8ffc8' : '#3fe08a'; ctx.fillRect(px - s / 2, py - s / 2, s, s);
      }
    }
    ctx.restore();
  };
})();
