# B004 mosquete: preflight v1 — FIX, no instalar

Run39318409142, job118285806387, head e85a1608eff1993b93c57a0b990a382161f8fd59.
Ocho sustituciones ensambladas;28 cuadros originales RGBA intactos. StyleGate PASS.
Native Gate FIX: cuadros20/21/23 fallan ILUSTRACION (suave0,389–0,397; ruido60,4–64,6). No se aprueban por pasar StyleGate.
El arma vuelve a ser mosquete/bayoneta y la pose13 tiene frente, pero las poses nuevas no mantienen la misma escala: cuerpo8/9/10/11=67/65/67/63;13=73;20/21/23=74. Referencias previas respectivas71/69/71/71;67;63/63/63.
Siguiente paso: corregir geometría de las cinco poses reutilizables con escalado NEAREST uniforme, redibujar20/21/23 con píxel nativo y cuerpo similar a22, repetir todos los gates. No aplicar filtros para ocultar ilustración.

El guard canónico rechaza sustituir el atlas61 vigente por plantilla36, detectando clips perdidos de mosquete/recarga/bayoneta/definitiva. Se conserva montura y todo el runtime actual. Esta revisión sigue SOURCE_ONLY, no está instalada ni aprobada para producción.
Resultados y preview exactos: preflight-v1/. Fuente y prompt se conservan; la receta inicial queda en source-v1.json antes de nuevos ajustes.
