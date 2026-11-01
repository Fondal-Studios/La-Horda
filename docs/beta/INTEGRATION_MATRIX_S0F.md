# Matriz de integración S0F (verificada con `git merge-tree` el 2026-11-01)

| Componente | PR / rama | Estado | Conflicto con S0F | Resolución |
|---|---|---|---|---|
| Beta Visual Impact | #251 → **main** (fusionado) | Fusionado | Ninguno | Incluido (S0F parte de main + engine) |
| Fondal Art Engine | #232 `feature/fondal-art-engine` (borrador) | Base de S0F | `docs/art-gate/roster-sheet.png` (binario generado) | Se tomó el de main |
| Art Factory 2.0 | #253 `claude/art-factory-2` (borrador) | Integrado | — | Incluido |
| Art Factory fail-closed + handoff S0C | #255 `fix/art-factory-safe-integration` (otro agente) | Integrado | **add/add** en `art_factory.py`, `test_art_factory.py`, `docs/art-factory/README.md` (mismo origen que #253) | Se conservó su versión endurecida y se añadió encima el bloque S0F; sus 17 pruebas pasan |
| S0C Arquitectura Beta / S0E condiciones | #252, #254 | Compatible | Ninguno | `t_contract_independence.js`: 25/25. Paquete **D** (UI y arte) es dueño de `tools/factory/**`, `tools/art/**`, `docs/art-gate/**` |
| Build Evolution (G) | #249 | Sin conflicto con S0F | `feature/beta-build-evolution` vs engine: 2 archivos (de la base vieja del engine) | Ya resueltos en S0F al integrar main |
| Premium Skin Factory (I) | #250 | Sin conflicto con S0F | idem | S0F entrega `PREMIUM_SKINS_COVERAGE.md` (50 skins faltantes) y `generate skin` para alimentarla |
| Códice y selección de campeones | main | Leído, no modificado | — | Es la referencia (`assets/ui/codex/champions/<id>.png`) |
| Renderizado y precarga | main | No modificado | — | Los candidatos se instalan en `codex-v2/` sin registrar |
| Multijugador / relay | main | **No modificado** | — | `server/relay.js` y `contracts/v1/**` intactos |

Pendiente de decisión de S0C: cerrar #253 a favor de #255 (mismo contenido base) o fusionar #255 primero; revisar las 3 líneas de `js/net/net-rooms.js` y 1 de `server/accounts.js` que trae #232.
