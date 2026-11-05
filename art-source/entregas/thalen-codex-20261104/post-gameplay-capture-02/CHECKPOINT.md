# Thalen Códice — cierre captura gameplay 02

Estado: **EN_CORRECCION / FIX / NO_INTEGRAR**.

Producción probada: `5ee56724a4ca6d0e9f272416eebaafa9b61b7fa7`. Base main auditada: `54aa936fa254112044e29493179893dd0f8694d6`. PR268 permanece borrador. No cambió el atlas, el consumidor ni el runtime del juego en esta pasada.

## Evidencia nueva

- Workflow `Champion entry balance`: run `41906244085`, job `126841546205`, artifact `13360839398`.
- Digest del artefacto: `sha256:a30bab25b9db564c28fa2547614dbdb41f4d01854bcf7471663844ba574eea64`.
- El arnés de gameplay pasó con **96 filas, ocho hojas y cero errores de página**.
- Matriz: seis arenas, densidades sparse/dense separadas, base/Convergencia, escritorio/viewport móvil y candidato/fallback legado.
- Referencia exacta: `assets/ui/codex/champions/mago.png`, blob `f07788b98aa635bf1587c73f6e0e243c38b3cf64`.
- Los ocho PNG originales quedan identificados por tamaño y SHA-256 en `runtime.json` y en el artefacto CI; el repositorio conserva una hoja JPEG de revisión.

## Revisión visual

La corrección mejora la escala de escritorio, separa las secuencias sparse/dense y mantiene legibles la comparación legado/candidato, la muerte y la prioridad de Convergencia. Continúa **FIX**: en Bosque denso los VFX verdes/blancos dominan la silueta; en móvil el cuerpo sigue demasiado pequeño para aprobar continuidad; el fixture sparse todavía contiene actores del escenario alrededor del sujeto. Las otras arenas verifican enganche y contraste amplio, no el Art Gate completo.

## CI y alcance

`roster-loading-test.js` y la captura Thalen terminaron en PASS. El job falló después, en el paso heredado que inicia el servidor HTTP admin; el artefacto se subió correctamente. No se modificaron gates, balance, mecánicas, red, cuentas, cobros ni infraestructura.

## Próximo paso

Mantener el mismo atlas y consumidor. Resolver la lectura de silueta bajo capas/VFX en gameplay y la escala móvil sin cambiar mecánicas; después completar dispositivo físico, relay de dos clientes, rendimiento del renderer, Art Gate y todos los workflows del SHA exacto. No mergear PR268.
