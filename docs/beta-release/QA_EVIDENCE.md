# QA EVIDENCE
## 2026-11-06 · SHA ef415626 · Node v22.23.4 · `cd server && npm ci`
Ejecutadas con `node <suite>.js`, exit code 0 = PASS: test-relay, test-accounts, test-wallet, test-wallet-pieces, test-payments-mp, test-item-economy, test-item-economy-live, test-origins-strict, test-trades, test-presence, test-owner-policy, test-founders, test-legacy-champion-ids, test-item-economy-compat, test-campaign-relay, test-campaign-inbox → **16/16 PASS**. (Logs en el scratchpad de la sesión, no versionados.)
No ejecutadas: `test-postgres.js` (requiere Postgres), `test-admin.js`, `test-game-master.js`, `test-competitive-entitlements.js`, `test-owner-recovery.js`, `test-wallet`… resto de tools/regression, tools/net-test, tools/perf, gates de arte/balance: **NOT RUN**.
## 2026-11-06 · merge de #261 (a835aef8) sobre main ef415626 (local, no publicado)
server: test-item-economy-compat, test-wallet-pieces, test-wallet → exit 0. tools/ui-clarity/{test-hud-clarity,test-shop-clarity,test-brasas-flow} → RESULT OK. tools/items/t_piezas_brasas.js → TODO OK (requiere `python3 -m http.server 8771` en la raíz). tools/ux/test-three-ui-contracts.js → PASS.
Nota: la rama `integration/beta-20261101` ya documenta que #241 fue **rechazado tras QA --fast (4 regresiones: cromas, colección, coliseo, lanes)** → #241 pasa a REPARABLE con defectos concretos; verificar ese informe antes de evaluarlo.

## 2026-11-06 · #236 Gélida (en rama de trabajo)
t_hielo_enemy_lifecycle: sin fix FAIL interrupted/dead/replaced; con fix PASS 5/5. t_hielo_roster_smoke: 13 tipos, 0 no finitos, 0 errores.

## 2026-11-06 · Batería de red/cooperativo (`bash tools/release/net-battery.sh <salida>`) · rama de trabajo @ 83aa547a · sitio estático + relay REAL locales
| Prueba | Resultado | Clasificación |
|---|---|---|
| `e2e.js 2` (2 humanos) | SUMMARY fails=0 | **PASS real** |
| `e2e.js 3` (3 humanos) | SUMMARY fails=0 | **PASS real** |
| `e2e.js 4` (4 humanos) | 1ª corrida: 1 FAIL (`xp.client1_gained`: before=after=3403); reintento: fails=0 | **FLAKY** (1 fallo, 1 pasada) — investigar la sincronización del XP del cliente 1 |
| `e2e.js 1` (1 humano + bots) | FAIL ×3 (excepción `heroes` indefinido tras «Comenzar»: la partida no llega a `playing` en 6 s) | **FAIL real, PREEXISTENTE**: falla idéntico en `main` ef415626. Puede ser el test (espera 4 héroes/arena fija) o el arranque en solitario; sin diagnosticar |
| `endless_coop.js` (Horda Infinita cooperativa) | OK | **PASS real** |
| `ciudad_coop.js` (Campaña, arena 01, cooperativo) | OK | **PASS real** |
| `disconnect.js` (desconexión de anfitrión/invitados) | SUMMARY fails=0 | **PASS real** |
| `boons_coop.js` | SUMMARY OK fails=0 | **PASS real** |
| `campaign-gate.js` | FAIL: `page.click('#mainmenu-jugar-btn')` — el botón «no es visible» | **FAIL real, PREEXISTENTE**: idéntico en `main`; el test apunta a un tile del hub que ya no se ve (test desactualizado respecto del hub actual o regresión previa); sin diagnosticar |
No cubierto: reconexión tras caída de red del jugador, redes inestables/latencia, 5º jugador, soak, dispositivos reales. Estos resultados NO prueban «Campaña completa y terminable» ni estabilidad prolongada.
