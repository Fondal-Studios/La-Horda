# Thalen Códice — post captura runtime 01

Estado: **EN_CORRECCION / NO_INTEGRAR**.

Producción probada: `1ccee0285792984dfa38da1eaa3c9c718b5a8790` sobre `main` `54aa936fa254112044e29493179893dd0f8694d6`.
Referencia exacta: `assets/ui/codex/champions/mago.png`, blob `f07788b98aa635bf1587c73f6e0e243c38b3cf64`.
Atlas sin cambios: SHA-256 `1be3454246d9526b93bf9e218318915086311789ca204b0ffda3f7eaf8af01aa`.

## Evidencia nueva

Run `41858565807`, job `126673766662`, artifact `13340885821`.

- Renderer real: 36/36 celdas del atlas con `ok=true` y píxeles opacos.
- Convergencia: 4/4 estados con `ok=true` y píxeles opacos.
- Atlas candidato cargado: PASS.
- Fallback legado forzado y cargado: PASS.
- Revisión visual de las tres capturas: las nueve secuencias se ven completas; candidato y fallback se distinguen; Convergencia conserva prioridad y la muerte queda enteramente encuadrada.
- El intento anterior `13337413379` queda preservado como falso negativo de arnés; no fue un fallo de arte.

Las capturas y `runtime.json` se guardan en `captures/` con hashes en el manifiesto.

## CI exacto y límites

El paso `node tools/art/roster-loading-test.js` pasó en el SHA de producción. También pasaron los validadores de estilo, poses, forja, balance, RNG, consumidores, navegador, relay y controles generales ejecutados antes del fallo posterior.

No todos los workflows están verdes:

- Pixel density, Art presentation y VFX readability fallaron antes de sus detectores: Playwright no admite Chromium en `ubuntu26.04-x64` en esos jobs.
- `lanes` falló por el botón volver a base menor a 48 px, ajeno al alcance Thalen.
- Integración falló en la autoprueba de íconos con 86 fallos; no se modificaron íconos.
- El job de entrada falló después de todas las pruebas de Thalen al iniciar el HTTP admin; subió el artifact correctamente.

No se rebajaron gates ni se atribuye aprobación global. Faltan capturas de gameplay antes/después en móvil/escritorio, secuencia temporal dentro de una partida, multijugador específico del componente, rendimiento y Art Gate completo. No mergear.
