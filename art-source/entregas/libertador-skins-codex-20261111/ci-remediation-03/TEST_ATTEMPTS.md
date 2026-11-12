# Intentos

- `Champion entry balance` run 989: FAIL en `build-art-atlas --check`, huella `359738d2f17d -> f40edcb34a33`; causa exacta: cambio de `js/data/champion-art-normalize.js`.
- Regeneración determinista equivalente: `sources.hash=f40edcb34a337209336a1b7bb72e15a020bb67e7`, 51 archivos fuente. El runtime del atlas no depende de escala corporal y sus registros permanecen iguales.
- `node tools/art/build-art-atlas.js --check`: PASS.
- Intento de regeneración completa con Chromium local: INVALID_ENV, socket del Chromium del sistema rechazado; preservado y no usado como gate.
- `Integracion pruebas` run 603: único fallo `LAB.los_bots_resuelven_en_orden`; todas las demás lanes de integración pasaron. No hay intersección con las rutas modificadas.
