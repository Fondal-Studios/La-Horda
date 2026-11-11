# CHECKPOINT — Libertador skins Códice, cierre 01

Fecha: 2026-11-11
PR: https://github.com/Fondal-Studios/La-Horda/pull/293
Estado del componente: **VALIDADO_LOCAL / PENDING_CI / NO_INTEGRADO**

## Componente cerrado localmente

- `libertador_escarcha`: 36 poses autorales instaladas, con Casaca de los Andes, poncho blanco/rojo, bufanda azul, bicorne y mosquete con bayoneta.
- `libertador_ancestral`: 36 poses autorales instaladas, con Guardia del Monte, sombrero con pluma, capa verde, morral y mosquete con bayoneta.
- Referencia exacta: `assets/ui/codex/champions/libertador.png`.
- Los dos `horse.png`, Granadero, cuerpo base, estadísticas, habilidades y red se preservan por hash/diff.
- `js/assets/unique-skins-meta.js` asigna los 36 cuadros a 35 estados reales, incluidos los estados especializados de Libertador.

## Evidencia nueva

- Contrato estático: 2 skins, 72 cuadros, 72 índices consumidos, alfa 0/255 y cero píxeles opacos en bordes.
- Renderer completo: 6.638 controles, cero fallos y cero errores; filas de las dos skins revisadas.
- Locomoción/cuerpo especializado: 261 controles, cero fallos y cero errores.
- Gameplay real: ocho pares exactos antes/después, Bosque/Ruinas y Hielo/Gélida, escritorio/móvil; mismo estado, arena, aliados y cámara dentro de cada par.
- Revisión visual de atlas, filas del renderer y pares de gameplay: identidad Códice legible y siluetas separadas de las versiones previas.

## Interrupción recuperada

El primer scratch de cierre fue reciclado antes de subir el commit. Se conservaron las dos fuentes generadas; se reconstruyeron atlas y evidencia desde esas fuentes, se verificaron hashes actuales y se repitieron todos los gates afectados. Los intentos con checkout parcial y rutas de Node incorrectas quedan registrados como fallidos y no certifican el componente.

## Pendiente remoto

Subir este cierre a la rama de PR293, mantener el PR como borrador/FIX mientras corre CI y revisar todos los checks/workflows del SHA exacto. Sólo si todos quedan aprobados se elimina `FIX/NO_INTEGRAR`, se marca listo y se integra con `expected_head_sha`. La publicación canónica se verifica por separado.
