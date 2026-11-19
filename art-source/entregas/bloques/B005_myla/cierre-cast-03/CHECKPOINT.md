# B005 Myla — cierre cast 03

- Estado: **EN_CORRECCION / FIX / NO_INTEGRAR**.
- PR: https://github.com/Fondal-Studios/La-Horda/pull/297
- Producción reconciliada: `220dc077568bdb7c8ff59fc938a373144eefdec8` sobre `main` `2e0436282104378b0445dedb358600cd44094d7a`.
- Árbol remoto de producción: `6c21bb4c6a86bd0bd40e2624041ecb9825c5424e`.
- Referencia exacta: `assets/ui/codex/champions/myla.png`.

## Avance nuevo

Se reconciliaron los 12 cuadros del lanzamiento base de Myla con los cambios concurrentes de `main` (incluidos Tanque, Libertador y beta cerrada). Los conflictos se limitaron a los registros derivados de arte; se tomó `main` fresco como base y se añadió sólo el paquete Myla. `ATLAS_ARTE --check` y el manifiesto visual pasan.

El fallo restante del head anterior no pertenece a Myla: fue el destello de impacto de `medusa_electrica` en Acuática. El head de PR308 que forma el `main` actual pasó **18/18 workflows**, incluido `Integracion pruebas`; no se cambió ni rebajó ese gate.

## Pruebas nuevas

- Contrato Myla: 8/8 PASS.
- Paquetes visuales: 119 paquetes, 0 candidatos, 0 errores; 6/6 pruebas PASS.
- Atlas estático: PASS; 46 campeones, 872 archivos CODEX_OK, 104 huérfanos registrados y 31 ARTE_VIEJO.

## Bloqueos

El ejecutor no dispone del Chromium de Playwright y el Chromium del sistema sigue bloqueado por el sandbox. No hay capturas nuevas ni Art Gate visual; por eso el PR continúa borrador y no se integra. La generación completa del atlas con navegador quedó sustituida únicamente para este cierre por la conservación del atlas fresco de `main`, el delta exacto de Myla y el `--check` final.

## Próximo paso

Ejecutar capturas reales antes/después del lanzamiento base en Ruinas/Bosque y Gélida/Hielo, escritorio/móvil, apariencias base/skins/Berrinche y multijugador; después revisar el Art Gate y todos los checks del SHA exacto.
