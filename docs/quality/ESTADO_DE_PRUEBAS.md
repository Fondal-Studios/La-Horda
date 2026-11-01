# Estado de las pruebas

Generado por `node tools/quality/qa.js --full` (informe completo: `PIPELINE_QA.md`). Los datos crudos de esta corrida están en `ultima-corrida.json`.

| Dato | Valor |
|---|---|
| Compilación medida | `22972dfe` (rama `claude/s0b-estabilizacion`, sobre `main` @ `e194910b`) |
| Fecha y duración | 2026-11-01 · 40 min 41 s (`--jobs 3`, 4 CPU) |
| Resultado de la batería | **131 PASS · 0 FLAKY · 0 FAIL** de 131 pruebas |
| Servidor (`cd server && npm test`) | PASS |
| Densidad de píxel (`pixel-density --strict`) | **FAIL, informativa**: `assets/sprites/arenas/world-v1` (ilustración, no pixel art) sin excepción firmada. Decisión del director D-24 |
| Clasificación y workflows (`qa-manifest-check`) | PASS |

## Por categoría (pruebas obligatorias)

| Categoría | Obligatorias | PASS | FLAKY | FAIL |
|---|---|---|---|---|
| inicio | 8 | 8 | 0 | 0 |
| navegacion_tutorial | 10 | 10 | 0 | 0 |
| campeones_habilidades | 45 | 45 | 0 | 0 |
| campana_progresion | 26 | 26 | 0 | 0 |
| guardados | 7 | 7 | 0 | 0 |
| economia | 20 | 20 | 0 | 0 |
| multijugador_simulado | 5 | 5 | 0 | 0 |
| rendimiento | 7 | 7 | 0 | 0 |
| sprites_atlas | 9 | 9 | 0 | 0 |
| movil | 7 | 7 | 0 | 0 |
| coordinacion_agentes | 6 | 6 | 0 | 0 |

## Rendimiento (guarda de regresión, navegador sin GPU)

| Prueba | p50 ms | p95 ms | máx ms |
|---|---|---|---|
| tools/quality/test-perf-budget.js | 13.5 | 48.1 | 517.6 |

Presupuesto: p50 <= 30 ms y p95 <= 90 ms por cuadro. No es una medición de FPS en dispositivos reales.

## Pruebas que pasaron sin imprimir una aserción `PASS`

Se informan para revisión (no son errores: algunas imprimen otro formato de éxito):

- `tools/crystal-wars/required-files.js`
- `tools/ux/functional.js`
- `tools/art/check-presentation-browser.js`
- `tools/collection/shop-pricing-browser.js`
- `tools/collection/pricing-sync.js`
- `tools/collection/welcome-picks.js`
- `tools/quality/test-ability-resources.js`
- `tools/quality/test-nano-render.js`
- `tools/art/check-pixel-icons.js`
- `tools/art/roster-loading-test.js`
- `tools/vfx/test-decal-legible.js`
- `tools/balance/entry-gate.js`
- `tools/vfx/test-ult-forms.js`

## Lo que esta corrida NO cubre

- Relay y base reales (nivel `external`): `relay-smoke.js --url`, `server/test-postgres.js`.
- Dispositivos móviles reales, carga y caos.
- Cobertura de líneas de código (no se mide).
- Intermitentes: ninguna se observó en esta corrida, pero `lanes/kits` (profeta `cross`) falló en CI y no se pudo reproducir localmente (ver `docs/arquitectura-compartida/RESULTADOS_S0B.md`).
