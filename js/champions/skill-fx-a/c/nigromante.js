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
