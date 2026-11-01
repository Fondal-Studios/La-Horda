# Auditoría de arquitectura S0F (evidencia del 2026-11-01)

Método: lectura del código, `git merge-tree` entre las ramas/PR activas, y ejecución de las pruebas. Nada de lo siguiente es opinión sin comando.

## Hallazgos
| Id | Sev. | Hallazgo | Evidencia | Impacto | Solución / estado |
|---|---|---|---|---|---|
| P0-1 | P0 | **No hay credenciales de generación**: la meta «producir arte nuevo real» no puede ejecutarse | `generate champion cazadora` → `BLOCKED_CREDENTIAL`, gasto 0 (`docs/art-factory/pilot-sylva/blocked-run-result.json`) | La fábrica solo audita, evalúa y planifica hasta tener clave | Conexión implementada y probada; falta `BFL_API_KEY` (pasos en `SYLVA_PILOT_REPORT.md`). **Bloqueo de negocio, no de código** |
| P1-1 | P1 | #253 (Art Factory 2.0) y #255 (otro agente) editan los mismos archivos (add/add) | `git merge-tree`: conflicto en `art_factory.py`, `test_art_factory.py`, `README.md` | Merge doble imposible; riesgo de pisar el endurecimiento de #255 | **Resuelto en S0F**: se integró #255 y el bloque S0F va encima; 17 pruebas OK. Decisión: cerrar #253 o fusionarlo después de #255 |
| P1-2 | P1 | El ensayo BFL del PR #232 asumía atlas 112×112 que `main` ya reemplazó por atlas del Códice (#240–#245) | `bfl-provider.test.js` #3 fallaba con «Unsupported existing atlas layout» tras integrar main | `bfl-repair` ya no puede reparar esos campeones | Prueba corregida: exige rechazo explícito. El adaptador S0F lee el contrato vivo y no depende de ese supuesto |
| P1-3 | P1 | La capa Beta Visual Impact (ya en main) editó `index.html` (7 líneas), que S0C declara «solo del Integrador» | `ownership.json` → `shared["index.html"]`; `git show fe8a151 -- index.html` | Violación de propiedad de archivo; el integrador debe regularizarla | **Abierto** (no se reescribe lo fusionado): pedir a S0C que las líneas pasen por `INDEX_HTML.md` |
| P1-4 | P1 | #232 modifica `js/net/net-rooms.js` (+3) y `server/accounts.js` (+1), archivos de red/cuentas | `git diff origin/main --stat -- server js/net` | Toca multijugador sin su dueño | El cambio de `net-rooms.js` corrige un error real (`t_codex` falla por CORS en navegadores automatizados; con el fix pasa). `relay.js` **no** está tocado. Requiere visto bueno del propietario |
| P1-5 | P1 | Estado global y orden de carga frágiles | 463 `<script>` en `index.html`; 6.304 declaraciones de nivel superior (355 `let/var` mutables); 6,6 MB de JS | Cualquier módulo nuevo debe envolver funciones globales por orden de carga (así lo hace la capa Beta) | Riesgo asumido y documentado; recomendación: puntos de extensión explícitos (decisión de S0C). Sin reescrituras masivas |
| P1-6 | P1 | Contratos de campeón heterogéneos | Sylva: 192×160, 52 cuadros; Libertador: otro; Tanque: cuadros sueltos sin `champPackLoadAtlas` | Una fábrica que asuma 36 poses rompería el motor | `contract.js` lee el contrato real y bloquea (`BLOCKED_CONTRACT`) lo no soportado |
| P2-1 | P2 | `roster-sheet.png` (generado) en conflicto engine↔main | `git merge-tree` | Solo ruido | Se toma el de main |
| P2-2 | P2 | Cobertura de skins premium: **50** faltantes para la meta de 3 por campeón (registro: 18/44 cumplen) | `docs/art-factory/PREMIUM_SKINS_COVERAGE.md` | Sin skins no hay producto premium completo | Generador listo; falta clave. Confirmar skins fuera del registro |
| P2-3 | P2 | Evaluador automático no ve fidelidad al Códice ni calidad de animación | Limitaciones en `evaluation.json` | Una puntuación alta no es aprobación artística | `requires_human_art_review: true` siempre; `approve` exige revisor humano |
| P2-4 | P2 | Rendimiento de la capa Beta ya medida | `docs/beta/perf.json`: `render()` medio 5,8 ms (rama) vs 6,8 ms (main), 5 corridas A/B, Chromium sin GPU (ruidoso) | Sin regresión medible | S0F no agrega código al camino de ejecución del juego (0 ms, 0 bytes) |

## Pruebas ejecutadas en esta rama
* `node --test tools/fondal-art-engine/*.test.js tools/factory/s0f/*.test.js`: **52/52**.
* `python3 -m unittest tools/factory/test_art_factory.py tools/factory/test_art_generator.py`: **OK** (17 + 4).
* `node tools/contracts/t_contract_independence.js`: 25/25.
* `node tools/lib/with-site.js tools/items/t_codex.js`: OK en esta rama (en main falla en este entorno por CORS; el fix de #232 lo corrige).

## Riesgos críticos para la beta (resumen)
1. Sin clave de proveedor no hay arte nuevo (P0-1). 2. Dos PR de la fábrica en conflicto (P1-1, resuelto aquí). 3. Regularizar `index.html` y la propiedad de red (P1-3/P1-4). 4. Nada de lo generado se integra sin revisión humana y registro por PR.
