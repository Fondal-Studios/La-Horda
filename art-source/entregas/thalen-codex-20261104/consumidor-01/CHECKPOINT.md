# Thalen Códice — consumidor 01

Estado: **EN_CORRECCION / NO_INTEGRAR**.

Base auditada: `main` `54aa936fa254112044e29493179893dd0f8694d6`.
Taller: PR268, rama `art/production-checkpoint-20261103`, head previo `3935b631265f0cf3b444e828f45ed9d994fd76c9`.

## Avance efectivo

- Se conectó el candidato de 36 estados bajo la clave independiente `mago_codex`.
- `drawMagoAtlas` intenta el candidato y conserva el atlas legado como fallback de carga/error.
- `drawMagoFallen` consume la secuencia de muerte authored y conserva el caído legado como fallback.
- Las skins de set siguen resolviéndose antes del cuerpo base; no se sustituyen ni se generan skins en esta pasada.
- No cambia balance, mecánicas, red, temporizadores, habilidades ni infraestructura.

## Referencia exacta

- Plantilla: `assets/ui/codex/champions/mago.png`.
- Git blob: `f07788b98aa635bf1587c73f6e0e243c38b3cf64`.
- Atlas candidato: `assets/sprites/champions/mago/codex-v1/atlas.png`.
- SHA-256: `1be3454246d9526b93bf9e218318915086311789ca204b0ffda3f7eaf8af01aa`.

## Pruebas nuevas

- `node --check` en ambos consumidores: PASS.
- `tools/art/check-thalen-codex-consumer.js`: PASS, 21 mappings; índices 0..35, fallback y muerte authored verificados.
- Relectura PNG: 448×1008, 36/36 celdas no vacías, alfa binario 0/255, cero alfa en borde: PASS.

## Límites y pendientes

- No hay checkout jugable completo en esta recuperación: no hay capturas antes/después a escala de gameplay, matriz móvil/escritorio, skins/equipo, multijugador ni Art Gate integral.
- El check remoto Pixel density del head previo falló instalando Chromium antes de ejecutar el detector; no es una evaluación artística aprobada.
- El candidato y el consumidor permanecen en taller. No instalar, marcar VALIDADO, integrar ni publicar.

Próximo paso: recuperar checkout completo desde el remoto, ejecutar consumidor real con atlas cargado y fallback forzado, capturar estados/direcciones/skins en gameplay móvil y escritorio, validar multijugador según alcance y recién entonces evaluar separación de un componente integrable.
