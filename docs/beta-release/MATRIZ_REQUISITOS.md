# MATRIZ DE REQUISITOS (estado al SHA ef415626)
Estados: OK-código (implementado, sin prueba E2E de esta sesión) · PARCIAL · FALTA · NOT RUN · BLOCKED. Responsable = rol (ver PLAN_HITOS).

| ID | Requisito | Implementación actual | Prueba | Estado | Responsable |
|---|---|---|---|---|---|
| R01 | Solo 2 modos en la beta | `beta-scope.js` + `BETA_PUBLIC=1` (oculta y bloquea Cristales/Coliseo) | tools/ux/test-beta-scope.js PASS | IMPLEMENTADO en rama, falta revisión independiente | UI/UX |
| R02 | Campaña completa 1–4j | 10 arenas, relay | tools/net-test/campaign-gate.js | NOT RUN | QA/Multijugador |
| R03 | Horda Infinita 1–4j | endless.js + net | net-test/endless_coop.js | NOT RUN | Gameplay |
| R04 | Ranking por oleada personal sobrevivida | Envía EN.round de grupo | — | **FALTA** (brecha 1) | Backend+Gameplay |
| R05 | Anti-trampas de resultados | Solo plausibilidad de rango/tiempo | server/test-accounts.js | PARCIAL | Seguridad |
| R06 | Cuentas y progreso entre plataformas | accounts.js, guardado en nube | test-accounts PASS | PARCIAL (sin cliente nativo) | Backend |
| R07 | Coop 1–4, desconexión/reconexión | relay | test-relay PASS; net-test disconnect.js | PARCIAL / NOT RUN E2E | Multijugador |
| R08 | Oro progresión | existente | test-item-economy PASS | OK-código | Economía |
| R09 | Brasas solo compra/pase; sin pay-to-win | wallet.js, premium.js | test-wallet PASS | PARCIAL (auditar PIECES_FOR_BRASAS) | Economía |
| R10 | Pase de batalla 30 días free/premium | no existe | — | **FALTA** | Economía/Backend |
| R11 | Reclamación idempotente / sin doble cargo | wallet/payments | test-wallet, test-payments-mp PASS | PARCIAL (aplicar a pase) | Backend |
| R12 | Compras nativas (Steam/GP/iOS) | no existe | — | FALTA / BLOCKED credenciales | Builds |
| R13 | Builds Steam/Android/iOS | no existe | — | FALTA; iOS BLOCKED (sin macOS) | Builds |
| R14 | Roster de lanzamiento verificado | gates en tools/ | entry-gate, ability-gate, roster_gate | NOT RUN | Balance |
| R15 | Arte Códice→runtime coherente | factory + PR de arte | tools/art/*, visual gates | NOT RUN | Dir. arte/Evaluador |
| R16 | “Comenzar partida” visible | PR #271 (sin integrar) | tools/ux/test-campaign-start-layout.js | PARCIAL | UI/UX |
| R17 | Tutorial/primera partida | existe (primer minuto) | tools/ux | NOT RUN | UI/UX |
| R18 | Rendimiento (FPS/memoria/carga) | tools/perf | perf.json histórico | NOT RUN hoy | Rendimiento |
| R19 | Seguridad auth/compras server-side | accounts/wallet | tests servidor PASS | PARCIAL | Seguridad |
| R20 | No tocar subsistema de celulares/joystick (Fondal TV) | PR #269/#272–274 ya en main de otro dev | — | RESPETAR | Integrador |
