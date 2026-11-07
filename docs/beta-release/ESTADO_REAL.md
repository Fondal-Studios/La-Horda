# ESTADO REAL — Fase Cero (2026-11-06)

**SHA de `main` auditado:** `ef415626fd0d1f4d093de9bcb6703074854e72ae` (merge de PR #274). Rama de trabajo: `claude/la-horda-beta-audit-exec-mwv8x0` (idéntica a main al iniciar).
Este documento se basa en inspección directa del repositorio y de GitHub, no en resúmenes históricos. Lo no verificado figura como `NOT RUN` o `BLOCKED`.

## 1. Arquitectura (verificado)
- Juego web puro: HTML5 Canvas 2D, JS sin framework ni bundler (`index.html` ~1058 líneas cargando scripts en orden; `js/` por sistema). Sin `package.json` en la raíz; `server/` tiene el suyo (`ws`, `pg`).
- Backend: `server/relay.js` (salas WebSocket, simulación en el **anfitrión**) + `server/accounts.js` (cuentas, guardado en nube, ranking, Postgres o archivo) + `wallet.js`, `payments.js` (Mercado Pago, apagado por defecto), `item-economy*.js`, `entitlements.js`, `trades.js`.
- Despliegue: `deploy/` (nginx/apache/pm2/systemd, `update.sh`, `rollback.sh`), `render.yaml`. Hay PWA (`manifest.webmanifest`, `sw.js`).
- Tamaño: ~12.3k archivos, `assets/` 274 MB (3.298 archivos), `art-source/` 1,2 GB, repo 3,5 GB. Ninguna build de tienda: **no existen** `android/`, `ios/`, Electron, Capacitor ni Steam en el repo (`tools/build-static.mjs` solo empaqueta web).
- CI: 30 workflows en `.github/workflows` (calidad, arte, economía, HUD, balance de campeones…). Gates propios: `tools/balance/entry-gate.js`, `tools/bible/ability-gate.js`, `tools/factory/cli.js`.

## 2. Modos
| Modo | Estado en main (por código) |
|---|---|
| Campaña (10 arenas, 1–4 jugadores) | Existe (`mode-arena-btn`). Terminabilidad completa **NOT RUN** (requiere partida real). |
| Horda Infinita | Existe (`js/systems/endless.js`, 779 líneas; `js/data/endless.js`; ranking `js/net/leaderboard.js`). |
| Convergencia/Guerra de Cristales, Coliseo, Arena Divina | Visibles en el selector (`mode-crystal-wars-btn`, `mode-coliseum-btn`) etiquetados ALPHA. **Deben ocultarse/marcarse no disponibles** para la beta. |

## 3. Brechas críticas detectadas en código (hallazgos, no suposiciones)
1. **Ranking de Horda Infinita no cumple el requisito.** `lbAfterRun` (js/net/leaderboard.js:53) envía `EN.round` y `EN.score` del estado **del anfitrión/grupo**, no la oleada que ese jugador sobrevivió personalmente. El servidor (`POST /api/leaderboard/submit`, server/accounts.js ~911) valida solo rangos y plausibilidad de tiempo (`lbCheck`, `IMPLAUSIBLE`), pero **confía en el puntaje que manda el cliente**; no hay verificación de la partida del lado servidor. Cualquier cliente modificado puede publicar un puntaje plausible. → Requiere diseño de ronda personal + atestación del anfitrión + límites verificables.
2. **No hay pase de batalla.** Búsquedas en js/server no muestran sistema de pase gratuito/premium; sí hay misiones (`quests`), temporadas semanales/mensuales del ranking y “Arsenal/temporadas mensuales” de economía de ítems. Temporada de 30 días del pase: **inexistente**.
3. **Brasas:** el wallet es del servidor (`server/wallet.js`) y premium.js declara que solo compran apariencia (y piezas de set si `PIECES_FOR_BRASAS`). La regla “Brasas solo por compra o pase, nunca recompensa ordinaria” y “sin pay-to-win” **no está verificada**: la bandera de piezas de set con Brasas debe auditarse/apagarse. Pagos: Mercado Pago apagado; **no hay adaptadores Steam/Google Play/App Store**.
4. **Empaquetado nativo inexistente** (Steam/Android/iOS). Solo PWA.
5. **Roster completo/terminado:** no verificado; docs históricas mencionan 43 héroes con botones UI, pero el número con kit+arte aprobado debe medirse con `tools/art/roster_gate.js` y gates (NOT RUN).

## 4. Evidencia de pruebas ejecutadas en esta sesión
Ver `QA_EVIDENCE.md`. Resumen: 16 suites del servidor (`server/test-*.js`) → **PASS real** (exit 0) sobre el SHA `ef415626`. Pruebas con navegador (regresión Playwright, net-test, perf, arte): **NOT RUN** en esta fase.

## 5. Servicios externos
- Runway (`api.dev.runwayml.com`): conectado vía proxy. **Saldo observado: `creditBalance = 15`** (unidad Runway; el costo por generación no se midió). Se considera prácticamente agotado para producción de arte; no se gastó nada.
- BFL FLUX/OpenAI (PR #256): **BLOQUEADO** sin credenciales.
- Servidor Fondal de producción: docs previas (#172) registran `persistent:false` como P0 externo; no re-verificado hoy.
- macOS/Xcode/certificados, Google Play, Steamworks: no disponibles → iOS/Android/Steam **no compilables** aquí.

## 6. No inventado
No se reportan porcentajes de avance: no hay denominador verificable aún (la matriz de requisitos lo establecerá).
