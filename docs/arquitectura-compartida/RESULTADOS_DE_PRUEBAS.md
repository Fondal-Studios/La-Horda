# Resultados de pruebas

Entorno: Linux, Node v22.22.0, 4 CPU, sin acceso a producción. Base: `main` @ `e194910bddf5d976778e1e8e949e3d440d71fc2d`. Rama: `claude/s0a-arquitectura-compartida`. Fecha: 2026-10-31. Todos los números son de corridas reales de esta rama.

## 1. Pruebas de contrato nuevas (`tools/contracts/`)

Se ejecutan contra el servidor real (`server/accounts.js`) **en proceso, en una carpeta temporal, en modo archivo**. No usan red externa ni datos reales.

| Prueba | Qué comprueba | Resultado | Tiempo |
|---|---|---|---|
| `t_contract_schemas.js` | Esquemas con versión vigente; versionado (`BAD_VERSION`, `UNSUPPORTED_VERSION`, MINOR/PATCH); rechazo de datos inválidos por código; reglas de acreditación; idempotencia; códigos documentados | **72 OK, 0 fallidas** | <1 s |
| `t_contract_independence.js` | Ningún archivo del repo es de dos paquetes; patrones sin solapes; contratos puros y sin ciclos; dueños únicos de los archivos clave | **22 OK, 0 fallidas** | 1 s |
| `t_contract_save_compat.js` | Los 3 guardados reales (10, 17 y 19 de oct) se proyectan a `PlayerProfile` sin mutarlos; migración de ids heredados con la implementación real; ida y vuelta de guardado en la nube; conflicto de versión (409); rechazo de datos inválidos (400, 413, 401); reinicio del servidor; reintento tras desconexión | **29 OK, 0 fallidas** | 1 s |
| `t_contract_economy.js` | Una acreditación por partida con cualquier clave de reintento; misma clave con contenido distinto (409); reclamo no respaldado (422) sin cambio de saldo; partida abandonada no paga; reinicio a mitad de partida y reintento; billetera con referencia única (incluidos 8 pedidos simultáneos) y sin saldo negativo; adaptadores a `GameResult` y `EconomyTransaction` | **27 OK, 0 fallidas** | <1 s |
| `t_contract_telemetry.js` | `ACCEPTED_EVENT_NAMES` igual a la lista del servidor; traducción a la forma de red; rechazos (400) por lote vacío, >30 eventos, dimensión peligrosa y valor fuera de rango; datos personales descartados; límite por IP (429) | **18 OK, 0 fallidas** | 1 s |
| **Total** | | **168 comprobaciones OK, 0 fallidas** | ~4 s |

Comando: `for f in schemas independence save_compat economy telemetry; do node tools/contracts/t_contract_$f.js; done`

### Las pruebas detectan fallos (mutaciones)

Se rompió a propósito el módulo de contratos y se comprobó que las pruebas fallan; luego se restauró (comparación byte a byte).

| Mutación | Resultado |
|---|---|
| `compareReplay` ignora las diferencias | `t_contract_schemas` falla (3 comprobaciones) |
| La acreditación no exige `verified` | `t_contract_schemas` falla (2 comprobaciones) |
| Lista de eventos del contrato desalineada con el servidor | `t_contract_telemetry` falla (2 comprobaciones) |

## 2. Hallazgos de las pruebas (información, no fallos)

- El asiento de auditoría de `run.finish` contiene `seq, actor, action, at, requestId`; **no incluye monto, partida ni cuenta afectada**. Tarea del Agente A.
- El registro de la partida no guarda si fue victoria ni lo declarado por el cliente: `fromServerRun` sin datos extra devuelve `outcome: unknown` y `eligible: false`. Tarea del Agente A.
- El cliente puede emitir 27 nombres de evento y el servidor acepta los 27 (con 3 alias normalizados). Los 4 eventos propuestos (`session_end`, `client_error`, `perf_sample`, `retention_day`) el servidor los rechaza hoy (400).
- Acoplamientos de producción entre paquetes: 14 pares (los lista `t_contract_independence` en cada corrida); todos cubiertos por una interfaz congelada declarada. El centro es `server/game-master.js` (estado raíz y auditoría).
- En modo de prueba `GET /api/health` informa `store:"file", persistent:true`. En el servidor de producción relevado el 31-oct informa `persistent:false` (relevamiento previo de solo lectura).

## 3. Comprobaciones de que no se rompió nada existente

La rama solo agrega archivos nuevos (`contracts/`, `docs/arquitectura-compartida/`, `tools/contracts/`); no modifica ninguno existente.

| Comando | Resultado |
|---|---|
| `git diff --stat origin/main` (archivos existentes modificados) | 0 |
| `cd server && npm test` | exit 0 |
| `node tools/art/emoji-lint.js --strict` | exit 0 |
| `node tools/art/check-pixel-icons.js` | exit 0 |
| `node tools/balance/check-entry-reference.js` | exit 0 |

## 4. Estado de `main` que NO se corrigió (deuda de S0, ya medida)

Línea base completa del 31-oct sobre el mismo SHA: 123 pruebas, **116 PASS · 2 FLAKY · 5 FAIL**, y `pixel-density --strict` con error. Fallan `t_save_sanitize`, `t_evolution`, `t_codex`, `lanes/postgame-test` y `t_champs_se` (intermitente). Esta rama no intenta arreglarlas (fuera de alcance de S0A) y no las empeora.

## 5. Lo que NO se probó

- `server/test-postgres.js` y cualquier ruta contra Postgres real (no hay Postgres local).
- Relay, WebSocket y multijugador (fuera de alcance y prohibidos).
- Corte de red real, latencia, carga y rendimiento.
- Guardados de jugadores reales (solo los 3 guardados del repositorio).
- La batería `run-all` completa **sobre esta rama**: se corrió la completa sobre `main` (ver 4) y, como esta rama solo agrega archivos, no se repitió.
- Las pruebas de contrato en CI: todavía no están registradas (tarea de C).
