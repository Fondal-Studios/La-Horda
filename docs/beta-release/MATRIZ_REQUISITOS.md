# MATRIZ DE REQUISITOS (estado al SHA ef415626)
Estados: OK-código (implementado, sin prueba E2E de esta sesión) · PARCIAL · FALTA · NOT RUN · BLOCKED. Responsable = rol (ver PLAN_HITOS).

| ID | Requisito | Implementación actual | Prueba | Estado | Responsable |
|---|---|---|---|---|---|
| R01 | Solo 2 modos en la beta | `beta-scope.js` + `BETA_PUBLIC=1` (oculta y bloquea Cristales/Coliseo) | tools/ux/test-beta-scope.js PASS | IMPLEMENTADO en rama, falta revisión independiente | UI/UX |
| R02 | Campaña completa 1–4j | 10 arenas, relay | tools/net-test/campaign-gate.js | NOT RUN | QA/Multijugador |
| R03 | Horda Infinita 1–4j | endless.js + net | net-test/endless_coop.js | NOT RUN | Gameplay |
| R04 | Ranking por oleada personal sobrevivida | `endlessTrackSurvival` + envío de `survived` (ambos caminos del servidor) | t_endless_personal, test-leaderboard-order, test-item-economy-live PASS | IMPLEMENTADO en rama; falta revisión independiente | Backend+Gameplay |
| R05 | Anti-trampas de resultados | Persistente: recibos de partida con duración/progreso del servidor; archivo: plausibilidad | test-item-economy-live, test-accounts | PARCIAL (el cliente aún informa `survived`) | Seguridad |
| R06 | Cuentas y progreso entre plataformas | accounts.js, guardado en nube | test-accounts PASS | PARCIAL (sin cliente nativo) | Backend |
| R07 | Coop 1–4, desconexión/reconexión | relay | test-relay PASS; net-test disconnect.js | PARCIAL / NOT RUN E2E | Multijugador |
| R08 | Oro progresión | existente | test-item-economy PASS | OK-código | Economía |
| R09 | Brasas solo compra/pase; sin pay-to-win | wallet.js, premium.js | test-wallet PASS | PARCIAL (auditar PIECES_FOR_BRASAS) | Economía |
| R10 | Pase de batalla 30 días free/premium | `server/battlepass.js` (30 niveles, rutas free/premium, desafíos de Campaña y Horda, XP solo por partidas verificadas) | `server/test-battlepass.js` PASS en archivo y PostgreSQL | BACKEND IMPLEMENTADO en rama; **falta UI de cliente, precios finales y arte de las recompensas (`bp:*` son ids provisorios)** | Economía/Backend |
| R11 | Reclamación idempotente / sin doble cargo | wallet/payments + pase (ref único por nivel y por compra) | test-wallet, test-payments-mp, test-battlepass (5 reclamos simultáneos = 1 entrega; recompra = 1 cargo) PASS | OK en backend | Backend |
| R12 | Compras nativas (Steam/GP/iOS) | no existe | — | FALTA / BLOCKED credenciales | Builds |
| R13 | Builds Steam/Android/iOS | no existe | — | FALTA; iOS BLOCKED (sin macOS) | Builds |
| R14 | Roster de lanzamiento verificado | gates en tools/ | entry-gate, ability-gate, roster_gate | NOT RUN | Balance |
| R15 | Arte Códice→runtime coherente | factory + PR de arte | tools/art/*, visual gates | NOT RUN | Dir. arte/Evaluador |
| R16 | “Comenzar partida” visible | PR #271 (sin integrar) | tools/ux/test-campaign-start-layout.js | PARCIAL | UI/UX |
| R17 | Tutorial/primera partida | existe (primer minuto) | tools/ux | NOT RUN | UI/UX |
| R18 | Rendimiento (FPS/memoria/carga) | tools/perf | perf.json histórico | NOT RUN hoy | Rendimiento |
| R19 | Seguridad auth/compras server-side | accounts/wallet | tests servidor PASS | PARCIAL | Seguridad |
| R20 | No tocar subsistema de celulares/joystick (Fondal TV) | PR #269/#272–274 ya en main de otro dev | — | RESPETAR | Integrador |
