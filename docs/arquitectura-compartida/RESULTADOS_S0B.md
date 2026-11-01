# S0B — Estabilización, QA automatizada y preparación del relay: resultados

Base: `main` @ `e194910bddf5d976778e1e8e949e3d440d71fc2d`. Rama: `claude/s0b-estabilizacion`, que **contiene** la rama de S0A (PR #247) y no se mezcla a `main` automáticamente. Fecha: 2026-11-01. Todos los números son de corridas reales; lo no probado figura al final.

## 1. Integración de S0A (#247)

- Los checks de GitHub del PR #247 estaban en verde (6: CodeQL ×4, emoji-lint ×2).
- Estrategia: S0B nace de la rama de S0A (misma historia), así que los contratos entran **sin conflicto y sin tocar `main`**. Las 5 pruebas de contrato dan 168 comprobaciones OK sobre la rama de S0B, y ahora corren dentro de `run-all` y de CI.
- Compatibilidad con `main`: `main` no se movió durante el trabajo (`e194910b`); S0A solo agrega archivos.
- Adaptadores: ya existían (`fromServerRun`, `fromWalletEntry`, `fromSave`, `toWire`). No hizo falta uno nuevo. Pendiente para el Agente A: persistir `outcome`/`claimed` para que `fromServerRun` sea acreditable sin datos extra.

## 2. Defectos corregidos (causa real)

| Falla (S0A) | Causa real encontrada | Corrección | Evidencia |
|---|---|---|---|
| `t_save_sanitize` (3 guardados reales) | `saveSanitize` creaba `rewardOverflow` en guardados legítimos, sin reportarlo: rompía su propia regla («un guardado legítimo no genera ajustes») | `js/storage/save-sanitize.js`: la clave solo se crea al mover el exceso del inventario, y entonces se reporta. La prueba no se tocó | PASS; `test-critical-rewards` sigue en PASS |
| `t_evolution` (Solciju, Veyra, Brakk) | Los tres atacan con `portadorHit(..., true)`, que marca `fromProc` para no encadenar objetos; `damageEnemy` ignoraba por completo la evolución en golpes `fromProc` | `portadores.js` marca `evoHit` en golpes de habilidad (no en el eco real); `combat.js` y `skill-evolution.js` lo respetan. Los objetos siguen sin dispararse | PASS (los 43 campeones dejan su firma) |
| `t_codex`, `lanes/postgame-test` | `netFetchRooms` ignoraba la regla que impide a un navegador automatizado salir a Internet; consultaba el servidor real y su CORS rechazaba `127.0.0.1` | `js/net/net-rooms.js`: misma guarda que `netCapsProbe`/`netWarmup`. Solo afecta a navegadores automatizados | PASS ambas |
| `t_champs_se` (intermitente, 3/3 rojo en S0A) | Cada espera era un `sleep` de reloj real contra el loop de `requestAnimationFrame`; bajo carga el juego simulaba menos cuadros que los esperados y fallaban checks distintos en cada corrida | `tools/regression/t_champs_se.js`: el tiempo de juego avanza con `update(16)` (misma aserción, mismos umbrales) | Antes 1 PASS y 2 FAIL en 3 corridas; después PASS 2/2 aisladas y PASS en la regresión completa |
| `lanes/kits` (`profeta cross:6` en CI) | **No se encontró la causa.** No se reprodujo en 13 corridas locales. Se identificó que la prueba usaba `Math.random` sin semilla (resultados distintos en cada corrida) | `tools/lanes/kits.js`: azar reproducible por campeón y diagnóstico (`quien`) de qué entidad sale del mapa. El umbral (`cross === 0`) no cambió | 34/34 OK. Si vuelve a fallar en CI, ahora se repite igual y dice quién |
| `pixel-density --strict` | `assets/sprites/arenas/world-v1` (`bosque.png`, `hielo.png`) es una ilustración, no pixel art. **No es un defecto de código**: o se rehace el arte o el director firma una excepción | **No se tocó** (no se agregó excepción ni se bajó ningún umbral). Queda **informativa** por `docs/ART_BIBLE.md` §14 | Decisión D-24 |
| `t_nigro_golems`, `t_objectives` (intermitentes bajo carga) | No investigadas a fondo | Pasaron 131/131 en la regresión completa; `t_nigro_golems` sigue declarada como tolerada en CI | Pendiente de seguimiento |

## 3. Resultados de pruebas

| Corrida | Comando | Resultado |
|---|---|---|
| **Regresión final** | `node tools/quality/qa.js --full --jobs 3` sobre `22972dfe` | **131 PASS · 0 FLAKY · 0 FAIL** de 131 pruebas (40 min 41 s); `server npm test` PASS; clasificación PASS; `pixel-density` FAIL (informativa, D-24) |
| Línea base previa (S0A, `main`) | `run-all --jobs 2` | 116 PASS · 2 FLAKY · 5 FAIL de 123 |
| Contratos | `t_contract_*` | 168 comprobaciones OK |
| Puerta de propiedad | `tools/agents/test-agents.js` | 15/15 |
| Humo del relay local | `relay-smoke.js --local --create-room` | OK (3 avisos esperados) |
| `lanes/kits` completo | `node tools/lanes/kits.js 55` | 34/34 campeones OK |
| Rendimiento | `test-perf-budget.js` (dentro de la regresión) | p50 13,5 ms · p95 48,1 ms por cuadro (presupuesto 30/90) |

La batería pasó de 123 a 131 pruebas: +`test-perf-budget`, +5 de contrato, +`test-agents`, +`relay-smoke`.

## 4. Pipeline de QA

Ver `docs/quality/PIPELINE_QA.md`. Resumen: `qa.js` (un comando local y de CI) · `qa-manifest.json` (131 pruebas clasificadas en 11 categorías, nivel obligatorio/informativo/externo) · `qa-manifest-check.js` (falla si hay falsos verdes) · `qa-report.js` (informe legible con rendimiento) · `qa-regresion.yml` (check único para cada PR + nocturno).

**Falsos verdes eliminados:** se quitó `continue-on-error` de 19 pasos de `integracion-pruebas.yml` cuyas pruebas pasan. Quedan 2 tolerados, declarados con motivo: `t_nigro_golems` y `pixel-density`. Los 3 pasos de `soporte-v3.yml` no eran falsos verdes (su resultado se exige al final) y el verificador ya lo reconoce.

## 5. Contratos

| Contrato | Estado |
|---|---|
| GameResult, EconomyTransaction, PlayerProfile, TelemetryEvent v1 | **Integrados** en la rama; validados por 168 comprobaciones; cubiertos por CI |
| Persistencia de `outcome`/`claimed` en el registro de la partida | **Pendiente** (Agente A) |
| Eventos de retención/error (`session_end`, `client_error`, `perf_sample`, `retention_day`) | **Pendiente** (Agente C: el servidor los rechaza hoy) |
| Migraciones ejecutables y versión de esquema del guardado en la nube | **Pendiente** (Agente B) |

## 6. Lo que NO se hizo o NO se pudo verificar

1. **El relay real y la forma exacta en que el socio lo actualiza:** sin acceso, no se verificó. Solo hay una consulta de solo lectura previa (31-oct) que mostró `store:file, persistent:false`. La guía y las preguntas están en `docs/operacion/`.
2. **Postgres:** `server/test-postgres.js` no se ejecutó (no hay base de pruebas local); en CI corre en otro workflow.
3. **Causa de `profeta cross`:** sin encontrar.
4. **Protección de `main` y checks requeridos:** sin acceso a los ajustes de GitHub. `qa-regresion.yml` existe pero **solo bloquea merges si se lo marca como requerido**.
5. **El workflow nuevo no corrió todavía en GitHub** (se ejecuta al abrirse/actualizarse el PR); su sintaxis se validó localmente, su comportamiento no.
6. **Móvil real, carga, red real, cobertura de líneas:** no medidos.
7. **No se retiró ningún workflow anterior** (consolidación parcial, ver `PIPELINE_QA.md`).
8. **13 pruebas pasan sin imprimir `PASS`** (lista en `docs/quality/ESTADO_DE_PRUEBAS.md`): quedan para revisión; no se consideran falsos verdes confirmados.
