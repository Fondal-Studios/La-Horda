# Pipeline central de QA

Un solo comando, el mismo en tu máquina y en GitHub Actions:

```
node tools/quality/qa.js --quick     # clasificación + contratos + lógica pura y pruebas rápidas
node tools/quality/qa.js --fast      # + servidor + toda la batería menos las más lentas (cada PR)
node tools/quality/qa.js --full      # + las lentas y la densidad de píxel (nocturno / antes de una beta)
```

Deja en `qa-out/`: `informe.md` (legible), `informe.json`, `run-all/resumen.json` y un log por paso. Sale con código 1 si falla algo **obligatorio**.

> **No edites archivos del repositorio mientras corre.** `run-all` restaura los archivos modificados y borra los nuevos que aparecieron *durante* su corrida (para dejar el árbol como estaba). Si estás trabajando en el mismo árbol, usá `--keep-artifacts` en `run-all` o trabajá en otra copia.

## Qué se comprueba y con qué

| Área pedida | Categoría del manifiesto | Pruebas obligatorias (ejemplos) |
|---|---|---|
| Inicio del juego | `inicio` | `tools/alpha/main-flow.js`, `public-onboarding.js`, `new-account-starter.js` |
| Navegación y tutorial | `navegacion_tutorial` | `navigation-profiles.js`, `training-test.js`, `test-arena-briefing-tutorial.js` |
| Campeones y habilidades | `campeones_habilidades` | `t_evolution`, `t_champs_se`, `ability-gate`, `champion-validator`, `test-ult-forms` |
| Campaña y progresión | `campana_progresion` | `t_campaign`, `t_difficulty`, `t_checkpoint`, `lanes/flow`, `coliseum/flow` |
| Guardados y recuperación | `guardados` | `t_save_sanitize`, `t_ilkan_migration`, contratos `save_compat`, suite `server` |
| Economía y recompensas | `economia` | `t_items`, `t_ground_loot`, `t_q4_economia`, contratos `economy`, `server/test-item-economy*` |
| Multijugador simulado | `multijugador_simulado` | `rooms-unit`, `lanes/postgame-test`, `server/test-relay.js` (relay en proceso) |
| Rendimiento y FPS | `rendimiento` | `test-perf-budget` (p50/p95 por cuadro), `t_perf_exploits`, `test-floating-text-rate` |
| Sprites y atlas | `sprites_atlas` | `check-skill-icons`, `check-pixel-icons`, `roster-loading-test`, `t_pixrig_bosses`; `pixel-density` (informativa) |
| Móvil | `movil` | `test-touch-targets`, `test-text-overflow`, `test-tactical-panel`, `test-first-minute-taps` |

La lista completa y cada nivel están en `tools/quality/qa-manifest.json`.

## Niveles

| Nivel | Significado | Efecto |
|---|---|---|
| `required` | Protege algo crítico | Si falla, el PR queda en rojo |
| `informational` | Se corre y se informa; hay un motivo escrito | No bloquea (hoy: `pixel-density`, por la decisión D-24) |
| `external` | Depende de infraestructura que el repo no controla (relay real, Postgres) | No corre en CI; se corre aparte (`relay-smoke.js --url …`, `test-postgres.js`) |

## Cómo se evitan los falsos verdes

`node tools/quality/qa-manifest-check.js` (corre primero, en segundos) hace fallar el PR si:
1. una prueba de `run-all` no está clasificada, o el manifiesto nombra una que ya no existe;
2. una categoría queda sin ninguna prueba obligatoria;
3. un paso de CI usa `continue-on-error: true` sin estar declarado en `tolerated` con motivo (o sobre una prueba obligatoria sin issue);
4. un paso enmascara el resultado con `|| true` o `exit 0`.

Además el informe lista las pruebas que **pasaron sin imprimir ninguna aserción** (posibles falsos verdes) y las intermitentes.

## Workflows

`.github/workflows/qa-regresion.yml` es el pipeline para exigir como check de cada PR (job `rapido` + job `regresion`). Los workflows anteriores siguen activos porque cubren áreas con rutas propias; **no se borró ninguno**. Cuando `QA regresion central` lleve dos semanas en verde, los solapamientos se pueden retirar (candidatos: los pasos de `integracion-pruebas.yml` y `champion-entry-balance.yml` que repiten pruebas de `run-all`). No se usa ningún servicio pago.

## Cobertura: qué hay y qué no

- Hay: cobertura **funcional por categoría** (tabla del informe). No hay cobertura de **líneas de código** (no se midió; hacerlo en un juego de navegador sin build exige instrumentar con la API de cobertura de Playwright, fuera de este alcance).
- Rendimiento: guarda de regresión del costo por cuadro en un navegador sin GPU. No sustituye medir FPS en dispositivos reales.
- Móvil: pruebas automatizadas en viewports chicos y objetivos táctiles; no hay dispositivos reales.
- Multijugador: relay en proceso y flujo de salas simulado; las pruebas contra un relay real (`tools/net-test`) quedan como `external`.
