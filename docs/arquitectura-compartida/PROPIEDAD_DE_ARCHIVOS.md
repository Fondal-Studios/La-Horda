# Matriz de propiedad de archivos

Fuente de verdad: [`ownership.json`](ownership.json). La prueba `tools/contracts/t_contract_independence.js` comprueba que ningún archivo del repositorio pertenece a dos paquetes, que los patrones no se solapan y que los archivos de integración tienen un solo dueño.

**Regla:** un paquete solo edita sus archivos. Si necesita un cambio en un archivo ajeno, no lo edita: pide al dueño que lo haga por una **interfaz congelada** o abre un PR de contrato.

## Archivos con un dueño único

| Archivo / área | Dueño | Los demás |
|---|---|---|
| `server/item-economy*.js`, `server/wallet.js`, `server/payments.js`, `server/entitlements.js`, `server/trades.js`, `server/shop-pieces.json`, `server/premium-packs.json`, sus `test-*`, `js/net/item-economy.js`, `js/data/pricing.js` | **A** Economía | solo leen |
| `server/accounts.js`, `server/presence.js`, `server/admin-*.js`, `server/rbac.js`, `server/campaign-inbox.js`, `server/package*.json`, `js/storage/**`, `js/net/account.js`, `tools/regression/t_save_sanitize.js` y `fixtures/**`, `deploy/**`, `fly.toml`/`Dockerfile` (nuevos), `contracts/v1/migrations.js` | **B** Persistencia | solo leen |
| `server/game-master.js` (**solo** la ruta `POST /api/telemetry` y `EVENTS`), `js/net/alpha-services.js`, `js/net/fondal-telemetry.js`, `js/ui/legal.js`, `js/data/legal-config.js`, `legal/**`, `tools/quality/run-all.js`, `.github/workflows/**`, `tools/lib/**`, `tools/alpha/**`, `tools/contracts/**` | **C** Telemetría y QA | solo leen |
| `contracts/v1/**` (salvo `migrations.js`), `docs/arquitectura-compartida/**` | **Arquitectura** | PR de contrato con aprobación de A, B y C |
| `index.html` | **Integrador** | ningún paquete (los contratos son solo de servidor) |

## Prohibido para los tres paquetes

Multijugador y red en vivo (`server/relay.js`, `js/net/net-*.js`, `js/net/quick-play.js`; requieren la decisión D-29), combate, progresión y contenido (`js/systems/**`, `js/champions/**`, `js/arenas/**`, `js/combat/**`, `js/entities/**`) y `assets/**`.

## Dónde dos agentes necesitan lo mismo (resolución)

| Componente | Quién lo necesita | Dueño único | Interfaz para el otro |
|---|---|---|---|
| Estado raíz de operaciones (`horda_operations`) | A (economía) y B (persistencia) | **B** guarda; **A** define el contenido | `store.gmRead()` / `store.gmUpdate(fn)`: atómico, semántica congelada |
| Proyección de la economía sobre el guardado | A y B | **A** (`item-economy-live.project`) | B la llama sin modificarla: `project(state, accountId, data)` |
| `server/game-master.js` (hub de estado y auditoría) | A (lee `stateOf`/`audit`) y C (ruta de telemetría) | **C**, acotado a telemetría | A usa `stateOf(raw)` y `audit(state, actor, type, data, now)`: congeladas. Acoplamiento actual, no se rompe en S0A |
| Texto del aviso de compra | A (política de precios), B (`account.js`), C (`legal.js`) | **A** publica **una** función en `js/data/pricing.js` | B y C solo la consumen; ninguno escribe el texto a mano |
| Pruebas nuevas de A y B en la batería y en CI | A, B | **C** (`run-all`, workflows) | A y B entregan un manifiesto `tools/<paquete>/manifest.json`; C lo registra |
| Esquema del guardado y su migración | B y A (inventario) | **B** | A no escribe el guardado: pasa por `project` y por los recibos del libro |
| Telemetría de eventos de economía | A emite, C recibe | **C** (lista `EVENTS`) | A pide el nombre del evento a C; no edita la lista |

## Acoplamientos existentes (medidos, no introducidos)

`server/accounts.js` → `item-economy-live`, `item-economy`, `wallet`, `entitlements`; `server/game-master.js` ↔ `item-economy*`, `wallet`. La prueba de independencia los lista en cada corrida para que no crezcan sin una interfaz declarada.
