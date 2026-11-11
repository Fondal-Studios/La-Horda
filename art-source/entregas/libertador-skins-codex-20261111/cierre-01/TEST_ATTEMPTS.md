# TEST_ATTEMPTS — Libertador skins Códice, cierre 01

## Válidos para los bytes finales

- `tools/art/libertador-skins-contract.py`: PASS; 2 skins, 36 cuadros e índices por skin, 35 sets, alfa binaria, bordes 0, horses exactos.
- `tools/art/check-libertador-motion.js`: PASS; 261 controles, 0 fallos, 0 errores.
- `tools/art/unique_skins/check.js`: PASS; 6.638 controles, 0 fallos, 0 errores.
- `tools/art/capture-libertador-skins-close.js`: PASS; 8 escenas candidato y 8 escenas originales, 0 errores.
- `tools/art/capture-libertador-skins-paired.js`: PASS; 8 pares exactos, 0 errores.
- Revisión visual: `atlas-review.jpg`, `libertador-renderer-rows.png`, `gameplay-paired-before-after.jpg`.

## Intentos fallidos preservados

- Primer scratch reciclado antes del push: commit local perdido; fuentes recuperadas y bytes regenerados/revalidados.
- `casaca-attempt01`: retiró una reacción pero conservó otra; rechazado.
- `casaca-attempt02`: retiró la segunda reacción; sirvió de paso intermedio, no como fuente final aislada.
- Invocaciones GUI con `/opt/codex/runtimes/codex-primary-runtime/bin/node`: `127`, ruta inexistente.
- Invocaciones con checkout parcial: `MODULE_NOT_FOUND` y timeouts de carga; inválidas para arte o runtime.
- Primera captura no pareada: escenarios equivalentes pero aliados divergentes por ejecuciones separadas; reemplazada por ocho pares en el mismo estado y renderer.
