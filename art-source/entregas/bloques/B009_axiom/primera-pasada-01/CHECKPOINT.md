# B009 Axiom — primera pasada de Force Quit

2026-10-22. Estado EN_CORRECCION / FIX_NO_INTEGRAR. 28/28 celdas no vacías; esto no es aprobación visual. Fuentes, prompt, receta, atlas diagnóstico y preview preservados en esta carpeta.

Base main80683b03de58286398ef47de828c39196542c14d. Se comprobó que existen cinco PNG de efectos, carga en js/assets/vfx-sprites.js y una ventana procedural de44 cuadros en js/champions/ult-forms/forms-2a-1.js. No se afirma que faltara la habilidad. Esta fuente completa la secuencia raster solicitada6+8loop+8impacto+6disipación en el brief. No modifica renderer ni gameplay.

Prueba: python art-source/entregas/bloques/B009_axiom/primera-pasada-01/build.py. Exporta una tira28x232 y preview7x4 por recorte fijo237 y vecino más cercano; conserva alfa original. technical.json registra hash, cajas por cuadro y548169 píxeles semitransparentes.

Revisión visual: identidad ventana/glitch reconocible; variación de escala en bucle6–13 y bordes suaves/ruidosos. Agrupar estas correcciones con Myla PR192, Aelith PR191 y Aurelia PR193; no iterar ahora ni integrar. Validación de renderer, escala real, capas, coste y multijugador pendiente.

Siguiente acción exacta: auditar assets/vfx/axiom/{err404,overwrite,teleport_in,teleport_out}.png y sus consumidores frente a docs/art-brief/campeones/axiom.md, reconciliar lo existente y producir únicamente secuencias faltantes. Revisar también Paquete Corrupto (glifo procedural). Después avanzar Baltra B010. Recuperar este PR remoto antes de trabajar; no duplicar source.png.
