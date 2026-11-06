# INVENTARIO DE PR — tabla viva (corte 2026-11-06, main = ef415626)
Fuente: API de GitHub (24 PR abiertos; 75 cerrados listados en la primera página, #153–#274; el resto anterior a #153 **no inventariado aún**). Ramas remotas: ~115 (`art/*`, `art-workshop/*`, `chatgpt/*`, `beta/integracion`, `audit/*`…).
**Clasificación = PRE-CLASIFICACIÓN por metadatos y fusionabilidad (git merge-tree). NINGÚN veredicto emitido todavía:** requiere evaluación con pruebas por el Evaluador. “Crítico” = afecta Campaña/Horda Infinita/UI/economía de la beta.

| PR | Título (resumen) | Base ← Head | Archivos / +/− | Estado GH | Crítico beta | Pre-clasificación | Nota |
|---|---|---|---|---|---|---|---|
| 271 | Comenzar partida visible | main ← fix/campaign-start-visible | 5 / +86−5 | borrador, merge limpio (7 atrás de main) | **Sí** (R16) | REPARABLE→candidato a INTEGRABLE | Rebase trivial; tiene test propio `tools/ux/test-campaign-start-layout.js`. Primer ciclo. |
| 236 | Gélida: cancelar congelación al interrumpir | main ← fix/gelida-enemy-lifecycle | 9 / +319 | abierto, merge limpio (77 atrás) | Sí (estabilidad Campaña A5) | REPARABLE (rebase+tests) | +2 líneas de código, resto evidencia/tests. |
| 239 | Guardianes propios en Cristales/Coliseo + revisión Códice | main ← fix/codex-install… | 20 / +348−22 | abierto, mergeable “unstable” | Parcial | EXTRAER_COMPONENTES | La parte de Cristales/Coliseo es FUERA_DE_ALCANCE; extraer revisión Códice antes de instalar arte. |
| 241 | Recuperar arte del Códice (Aldric, Kael, Aelith, Morveth) | main ← fix/recover-generated-art | 60 / +31957 | abierto | Sí (arte campeones) | REPARABLE (evaluar arte) | Mucho peso binario; requiere evaluador artístico. |
| 261 | UI Clarity bloques 1–3 | main ← feature/ui-clarity-hud-shop | 79 / +1270 | borrador, **dirty** | Sí | REPARABLE (conflictos) | **Pila:** 261 ← 263 ← 265. Ordenar: 261, 263, 265. |
| 263 | Brasas solo cosméticas + regresiones | feature/ui-clarity-hud-shop ← fix/cosmetics-only… | 6 / +83−21 | borrador | Sí (R09) | REPARABLE | Depende de 261. |
| 265 | UI claridad: HUD heredados, ficha, compra segura | integration/beta-20261101 ← ui/clarity-shop | 17 / +333 | abierto, base apunta a rama integración | Sí | REPARABLE (re-basar sobre main) | Base `integration/beta-20261101` no es main. |
| 267 | Aelith lanzamiento de espalda | main ← fix/aelith-recovered-cast | 25 / +651 | borrador | Sí (arte) | REPARABLE (evaluador artístico) | |
| 268 | Checkpoint Thalen Códice | main ← art/production-checkpoint-20261103 | 115 / +10250 | borrador | No | **BLOQUEADO / NO_INTEGRAR** (marcado por su autor) | Respetar bloqueo; rescatar solo con aprobación independiente en PR aparte. |
| 270 | Thalen cierre cuerpo Códice (EN_VALIDACION) | main ← art/thalen-codex-close | 49 / +3254 | borrador | Sí (roster) | REPARABLE (validación arte) | Posible duplicado parcial de 268. |
| 259 | Fábrica de sprites: repintado, Tanque/Guerrero/Mago, Myla/Ynara | main ← art/sylva-layered-walk | 401 / +42867 | borrador | Sí (arte) | EXTRAER_COMPONENTES | Demasiado grande: dividir por campeón. |
| 256 | S0F Art Factory 3.0 (BFL/OpenAI) | beta/integracion ← feature/s0f… | 334 / +93296 | borrador | No directo | **BLOQUEADO** (sin credenciales BFL/OpenAI) | Pila: 256 ← 257. Reutilizable para fábrica. |
| 257 | Conexión Runway UI→cola→S0F | s0f ← fix/runway-queue-connection | 55 / +2928 | borrador | Parcial | BLOQUEADO (depende de 256; Runway con 15 créditos) | |
| 253 | S0D Art Factory 2.0 | main ← claude/art-factory-2 | 101 / +42587 | borrador, limpio | No directo | EXTRAER_COMPONENTES / posible SUPERADO por #256 | Verificar solapamiento con tools/factory de main. |
| 252 | S0C arquitectura Beta (contratos) | beta/integracion ← claude/s0c… | 42 / +1311 | abierto | Parcial | EXTRAER_COMPONENTES | **Pila:** 252 ← 254 ← 255. Rama `beta/integracion` está 67 commits por delante y 16 por detrás de main: no mergear a ciegas. |
| 254 | S0E condiciones revisión S0C | s0c ← s0e/s0c-conditions | 6 / +78 | borrador | Parcial | EXTRAER_COMPONENTES | Depende de 252. |
| 255 | Art Factory fail-closed + handoff | s0e ← fix/art-factory-safe-integration | 107 / +41830 | borrador | No | REPARABLE / extraer | Depende de 254. |
| 249 | Build Evolution 2.0 (3 campeones) | beta/integracion ← feature/beta-build-evolution | 13 / +4788 | borrador | Parcial | EXTRAER_COMPONENTES | Requiere pasar gates de campeón. |
| 250 | Premium Skin Factory (catálogo simulado, sin assets) | beta/integracion ← feature/beta-premium-skins | 11 / +1740 | borrador | Parcial (economía cosmética) | EXTRAER_COMPONENTES | |
| 246 | Captura social automática | main ← feature/social-content-factory | 4 / +64 | borrador | No | FUERA_DE_ALCANCE (archivar) | |
| 232 | Fondal Art Engine (bloques Códice + worker) | main ← feature/fondal-art-engine | 131 / +45540 | borrador, dirty | Sí (fábrica) | REPARABLE (conflictos) | Pedido explícito de auditar Art Engine. |
| 231 | NanoGM firmas H1/H3 [NO_INTEGRAR] | main ← art/nano-impact | 268 / +28030 | borrador, dirty | No | **BLOQUEADO / NO_INTEGRAR** | Respetar. |
| 92 | Guerra de Cristales: mapa con arte | main ← claude/cw-mapa-arte | 14 / +435−67 | abierto, dirty, 3 semanas | No | FUERA_DE_ALCANCE (archivar) | Modo fuera de la beta. |
| 90 | Tres campeones nuevos (Ilsa, Vorn, Kora) TESTING | main ← claude/siete-campeones | 62 / +5322−868 | abierto, dirty | Parcial | EXTRAER_COMPONENTES | Según AGENTS.md, no entra a `knownChampions` sin gate; reevaluar. |

## Cerrados (primera página #153–#274)
- Mergeados: ~71 (incluye #274, #273, #272, #269 “Fondal TV” — subsistema de otro dev —, #266, #264, #262, #260, #258, #251, #248, #247 y los de arte/economía #153–#245).
- Cerrados sin merge: **#242** [FIX / NO_INTEGRAR] arenas Ruinas/Gélida (cierre artístico) y **#233** [FIX / NO_INTEGRAR] Veyra Códice 112 cuadros. Hay que comprobar si su contenido llegó por #244/#240 antes de dar disposición (pendiente).
- Pendiente: página 2 de cerrados (< #153).

## Cola de ciclos (orden por valor/riesgo/dependencia)
1. #271 → 2. #236 → 3. pila UI #261→#263→#265 → 4. #241/#267/#270 (arte, con evaluador artístico) → 5. extracciones de #252/#254/#249/#250 → 6. archivar #92/#246, documentar BLOQUEADOS #256/#257/#268/#231.

## Actualización 2026-11-06 (ejecución 09:23 UTC)
- **#265 → EXTRAER_COMPONENTES (evidencia):** su base es `integration/beta-20261101` (81 commits de la pila beta): contra `main` son 295 archivos y conflictos en `index.html` y `hud-layout.css`; no se puede integrar tal cual. Sus 3 commits propios: `20e95d88` B0 (3 fallos de contrato de UI) → **SUPERADO** por #262 (ya en main, mismos 3 contratos; tocaba el mismo `hud-layout.css`); `7bdc8a32` B2/B3 → **parte extraída** (ver abajo) y parte en conflicto con la versión de `js/ui-clarity/shop-clarity.js` de #261 (dos implementaciones distintas de la misma ficha de apariencia: AA en `shop-clarity.js` y `test-shop-clarity.js`) → **requiere decisión de diseño de un revisor**, no se resolvió a ciegas; `5a66689c` docs.
- **Extraído de #265 (commit `7bdc8a32`, solo `js/systems/premium.js`):** referencia de compra PENDIENTE persistente (`premiumPendingRef`, 10 min, solo `{sku, ref, at}`), confirmación de entrega sin recobro, bloqueo de doble diálogo, telemetría local y línea de saldo/faltante. Prueba nueva `tools/ux/test-purchase-pending-ref.js` PASS (misma referencia al reintentar tras un corte; se borra al contestar el servidor; otro artículo no la hereda; vence a los 10 min; falla en `main`, donde la función no existe). Regresión: `t_piezas_brasas` TODO OK, `t_shop_rotation` TODO OK, `brasas-store` 56 PASS, `test-battlepass-ui` PASS. Aporta a R11 (compra duplicada). Sin evaluación independiente.
- **#241 → REPARABLE** con 4 defectos concretos (cromas/skins derivan del atlas anterior; roster/colección; lanes). Ver RESULTADOS_PR.md.
- **#236 → INTEGRABLE** (fix + tests extraídos a la rama de trabajo; esperando revisión independiente y CI remoto).
