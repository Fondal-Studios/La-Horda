# Paquetes de agentes

Tres paquetes independientes. Cada uno nace de `main` en su propia rama (`branchPrefix` en `ownership.json`), lee `contracts/v1` y **no modifica** el contrato ni los archivos de otro paquete. Prompt de cada uno: [`prompts/`](prompts).

**Política de seguridad común.** Los detalles de cualquier debilidad de seguridad se mantienen en el entorno privado del estudio (anexo que entrega el director). Ni el código, ni los mensajes de commit, ni la descripción del PR, ni los comentarios de un repositorio público describen cómo explotar algo. En público se describen comportamientos correctos y pruebas de comportamiento correcto.

---

## Agente A — Economía y seguridad

**Misión.** Que toda recompensa se acredite solo con evidencia verificada por el servidor, sin duplicados y con auditoría completa.

| | |
|---|---|
| Archivos permitidos | `server/item-economy*.js`, `server/wallet.js`, `server/payments.js`, `server/entitlements.js`, `server/trades.js`, `server/shop-pieces.json`, `server/premium-packs.json`, sus `server/test-*`, `js/net/item-economy.js`, `js/data/pricing.js`, `tools/economy/**`, `docs/economia-seguridad/**` |
| Prohibidos | todo lo de B y C (ver `PROPIEDAD_DE_ARCHIVOS.md`), `contracts/v1/**`, multijugador, combate, progresión, `index.html` |
| Contratos que posee | `GameResult`, `EconomyTransaction` |
| Interfaces que consume | `store.gmUpdate/gmRead`, `store.walletApply` (B); `game-master.stateOf/audit` (C) |
| Interfaces que ofrece | `project(state, accountId, data)`, `recordLogin(store, user, now)`; registros de partida legibles con `fromServerRun` |
| Dependencias | `contracts/v1`. La **activación** de la Economía V2 depende de B (base persistente) y de las decisiones D-03/D-16 |
| Entregables | (1) La partida persiste `outcome`, `claimed` y `closedAt`; (2) toda acreditación de oro, gemas, objetos y Brasas pasa por una función que valida `EconomyTransaction`; (3) el asiento de auditoría incluye monto, moneda, cuenta y `evidenceRef`; (4) topes por cuenta y por día en todas las fuentes de recompensa; (5) la V2 queda apagada por defecto hasta decisión; (6) el texto del aviso de compra sale de una sola función en `pricing.js` |
| Pruebas | `server/test-item-economy*.js` y `test-wallet*.js` siguen verdes con la bandera en 0 y en 1; `tools/contracts/t_contract_economy.js` verde; nuevas pruebas de comportamiento correcto (sin recetas de abuso) |
| Aceptación | 1) el saldo sube exactamente una vez por partida aunque se repita el cierre, con cualquier clave; 2) `GameResult` de una partida cerrada sale `eligible` sin datos extra; 3) todo asiento de la billetera y del libro valida contra `EconomyTransaction`; 4) con la V2 apagada el comportamiento es el de hoy; 5) 0 cambios en combate, progresión y multijugador (`git diff --stat` lo demuestra) |
| No hacer | activar la V2, cambiar precios o tasas de botín, tocar `server/accounts.js` |

## Agente B — Persistencia

**Misión.** Que cuentas, guardados y billetera sobrevivan a reinicios y despliegues, con migraciones declaradas y recuperación demostrada.

| | |
|---|---|
| Archivos permitidos | `server/accounts.js`, `presence.js`, `recover-owner.js`, `admin-users.js`, `admin-levels.js`, `rbac.js`, `campaign-inbox.js`, `server/package*.json`, `operator-config.json`, `launch.env.example`, sus `test-*` (incluido `test-postgres.js`), `js/storage/**`, `js/net/account.js`, `tools/regression/t_save_sanitize.js` y `fixtures/**`, `deploy/**`, `fly.toml`, `Dockerfile`, `contracts/v1/migrations.js`, `tools/persistence/**`, `docs/persistencia/**` |
| Prohibidos | economía (A), telemetría y QA (C), `contracts/v1/**` salvo `migrations.js`, multijugador, `index.html` |
| Contrato que posee | `PlayerProfile` |
| Interfaces que consume | `item-economy-live.project`, `item-economy.recordLogin` (A), solo llamarlas |
| Interfaces que ofrece | `store.gmRead/gmUpdate`, `store.walletApply`, `store.getSave/putSave` (atómicas, con control de versión); `GET /api/health` (`store`, `persistent`) |
| Dependencias | `contracts/v1`; decisión D-02 (destino canónico y base) |
| Entregables | (1) Persistencia real en el destino elegido, verificable en `GET /api/health`; (2) migración de los datos de archivo a la base, idempotente y ensayada; (3) copia de seguridad y restauración ensayadas; (4) versión de esquema en el guardado en la nube y migraciones ejecutables registradas en `migrations.js`; (5) `t_save_sanitize` corregida **sin debilitarla**; (6) configuración de Fly versionada; (7) separación del estado de operaciones en filas por función o plan escrito para hacerlo |
| Pruebas | `server/test-accounts.js`, `test-postgres.js` (con base real), `tools/contracts/t_contract_save_compat.js`, `t_save_sanitize` con los 3 guardados reales; ensayo de reinicio con datos |
| Aceptación | 1) los 3 guardados reales se cargan sin ajustes; 2) tras reiniciar el proceso, cuentas, guardados, billetera y economía son idénticos; 3) la restauración desde copia deja el mismo estado; 4) dos dispositivos con versión base vieja reciben 409 y no pierden datos; 5) ninguna migración se aplica dos veces |
| No hacer | desplegar sin autorización, borrar datos, cambiar la semántica de las interfaces congeladas |

## Agente C — Telemetría y QA

**Misión.** Que se pueda medir la retención y los errores sin datos personales y que las pruebas protejan de verdad.

| | |
|---|---|
| Archivos permitidos | `server/game-master.js` (**solo** la ruta de telemetría y `EVENTS`), `server/test-game-master.js`, `js/net/alpha-services.js`, `js/net/fondal-telemetry.js`, `js/ui/legal.js`, `js/data/legal-config.js`, `legal/**`, `docs/legal/**`, `tools/quality/run-all.js`, `.github/workflows/**`, `docs/quality/**`, `tools/lib/**`, `tools/alpha/**`, `tools/contracts/**`, `tools/telemetry/**`, `docs/telemetria-qa/**` |
| Prohibidos | economía (A), persistencia (B), el resto de `game-master.js`, multijugador, `index.html` |
| Contrato que posee | `TelemetryEvent` |
| Interfaces que consume | `GameResult` vía `fromServerRun` (solo lectura) |
| Interfaces que ofrece | registro de pruebas de A y B en `run-all` y en CI desde sus manifiestos |
| Dependencias | `contracts/v1`; decisiones D-06 (opt-in), D-07 (edad y legal), D-08 (correo de contacto) |
| Entregables | (1) Telemetría con consentimiento previo y sección en la política de privacidad; (2) eventos de retención y de error (`session_end`, `client_error`, `perf_sample`, `retention_day`) habilitados en el servidor con tope por lote; (3) métricas D1/D7 en el panel; (4) pruebas herméticas: el cliente de prueba no consulta producción; (5) pasos de CI bloqueantes: se quita `continue-on-error` de las pruebas que hoy pasan; (6) registro de las pruebas de contrato y de los manifiestos en `run-all` y CI |
| Pruebas | `server/test-game-master.js`, `tools/alpha/services-browser.js`, `tools/contracts/t_contract_telemetry.js`, `run-all` completo |
| Aceptación | 1) sin consentimiento no se envía nada; 2) un evento con dato personal se rechaza en el contrato y en el servidor; 3) `ACCEPTED_EVENT_NAMES` coincide con el servidor (la prueba de deriva lo comprueba); 4) la batería corre con la red bloqueada; 5) un cambio que rompe una prueba hoy tolerada pone el CI en rojo |
| No hacer | enviar identificadores de cuenta, texto de chat o URLs; tocar el multijugador (el arreglo de hermeticidad va en `tools/lib/**`, no en `js/net/**`) |
