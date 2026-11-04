# Thalen Códice — captura runtime 01

Estado: **EN_CORRECCION / NO_INTEGRAR**.

Base auditada: `main` `54aa936fa254112044e29493179893dd0f8694d6`.
Padre del taller: `a51c0bfb1a5c3126cc004df58d47ecfe3d1886e5`.
Referencia exacta: `assets/ui/codex/champions/mago.png`, blob `f07788b98aa635bf1587c73f6e0e243c38b3cf64`.

## Alcance nuevo

- Se recuperó un checkout completo y limpio del head remoto.
- Se amplió el arnés existente `tools/art/roster-loading-test.js` sin cambiar umbrales ni lógica del juego.
- El arnés usa el consumidor real `drawMagoAtlas` para las 36 celdas del atlas Códice.
- Fuerza temporalmente `CHAMP_PACK.mago_codex.ready=false` para comprobar el fallback legado y restaura el estado inmediatamente.
- Usa `drawHeroBody` con `convergencia` equipada para comprobar que la skin completa conserva prioridad sobre el cuerpo base.
- Produce `docs/art-gate/thalen-codex/runtime-base-36.png`, `candidate-vs-legacy-fallback.png`, `convergencia-priority.png` y `runtime.json` en CI.

No se modificaron atlas, consumidor, escalas, skins, balance, mecánicas, red ni infraestructura. Los dos archivos temporales ajenos creados por el checkout quedaron sin seguimiento y fuera de esta pasada.

## Verificaciones nuevas locales

- `node --check tools/art/roster-loading-test.js`: PASS.
- `node tools/art/check-thalen-codex-consumer.js`: PASS, 21 mappings.
- Atlas: 448×1008; hash y bytes sin cambios.
- `git diff --check`: PASS.

## Pendiente

El navegador local no pudo instalar Chromium: la descarga devolvió un archivo vacío/truncado, el mismo fallo de entorno observado en tres workflows. La prueba visual debe ejecutarse en el job `Champion entry balance`, que sí instaló Chromium correctamente en el head anterior. Hasta obtener sus PNG y `runtime.json`, este componente no tiene Art Gate ni aprobación de integración.

Después siguen capturas de gameplay móvil/escritorio, secuencia temporal real, multijugador y rendimiento. Esta hoja de estados es evidencia del renderer, no una partida completa.
