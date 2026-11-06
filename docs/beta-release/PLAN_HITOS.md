# PLAN DE HITOS (ruta crítica)
Roles reales disponibles en esta sesión: un solo modelo + subagentes opcionales; los roles se separan por tarea y por checkpoint (no se finge concurrencia). Nadie aprueba su propio cambio: el veredicto del Evaluador se registra en `RESULTADOS_PR.md` con SHA antes de que el Integrador actúe.

| Hito | Objetivo | Entregables / gate | Dependencias |
|---|---|---|---|
| H0 | Fase Cero | 6 docs de auditoría (este directorio) | — |
| H1 | Saneamiento PR: ciclo 1 (#271, #236) y luego pila UI (#261→#263→#265) | Veredicto + CI + merge verificado en main | H0 |
| H2 | Alcance de modos: ocultar Cristales/Coliseo por flag | test UX; sin borrar código | H1 (menus.js) |
| H3 | Ranking personal + anti-trampas (R04/R05) | tests servidor + net-test endless_coop | contrato de red Horda |
| H4 | Pase de batalla 30 días + economía (R09–R11) | `server/battlepass.js`, tests idempotencia | wallet.js |
| H5 | Roster de lanzamiento por evidencia | entry-gate/ability-gate/roster_gate | H1 |
| H6 | Arte: campeones→enemigos→VFX con evaluador independiente | rúbrica 85+0 críticos; presupuesto Runway = **15 créditos observados (bloqueado)** | autorización de gasto |
| H7 | UI/tutorial/retención pruebas de flujo completo | Playwright flows | H1,H2 |
| H8 | Rendimiento/seguridad | presupuestos y reportes | H5 |
| H9 | Builds candidatas: PWA→Steam (Electron/Tauri), Android (TWA/Capacitor), iOS | instrucciones + lista de accesos; iOS BLOCKED sin macOS | H8 |
| H10 | QA final y declaración de beta | matriz completa | todos |

Rollback general: cada hito en rama propia desde `main`; revertir por `git revert` del merge; no se borran ramas ni datos.
Paralelismo permitido: H3/H4 (server) con H6 (arte) con H2 (UI) — archivos disjuntos. Prohibido paralelizar PR que tocan `index.html`/`js/ui/menus.js`.
