# Thalen Códice — captura del consumidor pendiente

Este documento activa la verificación remota del arnés de Thalen sin declarar el componente integrado.

- Estado: `EN_CORRECCION / NO_INTEGRAR`.
- Referencia: `assets/ui/codex/champions/mago.png`.
- Atlas: 36 celdas Códice, hash `1be3454246d9526b93bf9e218318915086311789ca204b0ffda3f7eaf8af01aa`.
- Cambio de esta pasada: evidencia del consumidor real, fallback legado y prioridad de Convergencia.
- Arte y runtime de producción: sin cambios.
- Resultado requerido: 36/36 celdas visibles, candidato y fallback visibles, cuatro estados de Convergencia visibles, cero errores de página.

La salida del renderer no sustituye capturas completas de gameplay, móvil/escritorio, multijugador, rendimiento ni revisión visual. No autoriza merge.

## Intento CI 01

Run `41857272541`, job `126669170632`, artifact `13337413379`: renderer real cargó 36/36 celdas del atlas, 4/4 estados Convergencia, candidato y fallback. El veredicto FAIL fue del arnés porque `drawHeroBody` retorna `undefined` al completar el dibujo; se corrige la aserción y se amplía sólo el lienzo de evidencia de la muerte. Arte, atlas y runtime permanecen byte idénticos.
