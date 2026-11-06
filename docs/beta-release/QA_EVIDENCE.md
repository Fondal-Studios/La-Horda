# QA EVIDENCE
## 2026-11-06 · SHA ef415626 · Node v22.23.4 · `cd server && npm ci`
Ejecutadas con `node <suite>.js`, exit code 0 = PASS: test-relay, test-accounts, test-wallet, test-wallet-pieces, test-payments-mp, test-item-economy, test-item-economy-live, test-origins-strict, test-trades, test-presence, test-owner-policy, test-founders, test-legacy-champion-ids, test-item-economy-compat, test-campaign-relay, test-campaign-inbox → **16/16 PASS**. (Logs en el scratchpad de la sesión, no versionados.)
No ejecutadas: `test-postgres.js` (requiere Postgres), `test-admin.js`, `test-game-master.js`, `test-competitive-entitlements.js`, `test-owner-recovery.js`, `test-wallet`… resto de tools/regression, tools/net-test, tools/perf, gates de arte/balance: **NOT RUN**.
## 2026-11-06 · merge de #261 (a835aef8) sobre main ef415626 (local, no publicado)
server: test-item-economy-compat, test-wallet-pieces, test-wallet → exit 0. tools/ui-clarity/{test-hud-clarity,test-shop-clarity,test-brasas-flow} → RESULT OK. tools/items/t_piezas_brasas.js → TODO OK (requiere `python3 -m http.server 8771` en la raíz). tools/ux/test-three-ui-contracts.js → PASS.
Nota: la rama `integration/beta-20261101` ya documenta que #241 fue **rechazado tras QA --fast (4 regresiones: cromas, colección, coliseo, lanes)** → #241 pasa a REPARABLE con defectos concretos; verificar ese informe antes de evaluarlo.
