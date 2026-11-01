# Piloto Sylva — informe

**Estado de la generación real: BLOQUEADA (`BLOCKED_CREDENTIAL`).** No hay clave de proveedor en el entorno y no hay autorización de gasto nueva. **No se generó ninguna imagen con IA, no se gastó nada (US$ 0) y no se afirma ningún resultado de calidad.**

## Qué sí se ejecutó (evidencia en `docs/art-factory/pilot-sylva/`)
| Paso | Resultado |
|---|---|
| Contrato real de Sylva (`contract.json`) | Atlas `codex-v1`, celda 192×160, 4 columnas, 13 filas, 52 cuadros, `refH` 84, anclaje 0,7125, 22 clips (idle/walk/attack/hit/death en 3 direcciones, cast, aim, run), espejo para la izquierda. No es la grilla de 36 poses. |
| Referencias | Página del Códice `assets/ui/codex/champions/cazadora.png` (1774×887) + tira de poses actuales por clip. |
| Plan (`plan.json`, `estimate.json`) | **13 pedidos** (tiras de ≤ 4 poses). Tope conservador **US$ 1,30** (10 ¢ por pedido) con Runway gen4_image (US$ 3,25 con BFL, que reserva 25 ¢); el costo real lo informa el proveedor y queda en el libro de gasto. |
| Corrida real sin clave (`blocked-run-result.json`) | `BLOCKED`, `spent_cents: 0`, sin atlas. Mensaje: falta `BFL_API_KEY` / `ART_GEN_API_KEY`. |
| Línea base (`baseline-evaluation.json`) | El atlas actual de Sylva obtiene **100/100** en el evaluador (calibración: el evaluador no rechaza arte aprobado). |

## Entregables del piloto pedidos y su estado
| Pedido | Estado |
|---|---|
| Propuesta de cuerpo base | **BLOQUEADO** (requiere API) |
| Variante de pose o animación | **BLOQUEADO** |
| Atlas candidato compatible con el motor | **BLOQUEADO** (el ensamblador y el evaluador están probados con un proveedor FIXTURE de pruebas, no con IA) |
| Vista previa comparativa con el sprite actual | Implementada (`preview`); se genera cuando exista candidato |
| Informe de calidad, costo y tiempo | Costo estimado arriba; medido: pendiente |

## Cómo ejecutarlo apenas haya clave (≈ 10 minutos y ≤ US$ 5)
```bash
export BFL_API_KEY=...            # (secreto del entorno; ver abajo)
export FONDAL_SPEND_LEDGER=/ruta/absoluta/gasto.json
node tools/factory/cli.js generate animation cazadora walk_down --provider bfl --max-task-cents 25 --max-batch-cents 100   # 1 pedido de prueba
node tools/factory/cli.js validate cazadora && node tools/factory/cli.js preview cazadora                                 # evaluación + hoja comparativa
# si la calidad lo justifica: generate champion cazadora (13 pedidos), luego revisión humana, approve e integrate
```
Criterio de corte: si el primer pedido no devuelve una tira con el número correcto de poses separables y con el personaje reconocible, **no** se sigue gastando: se prueba el proveedor alternativo (`--provider openai`) con 1 pedido y se decide.

## Dónde cargar la clave (Runway, proveedor por defecto)
Crear la cuenta y el proyecto en https://dev.runway.com, cargar crédito (US$ 5 alcanzan de sobra: el plan de Sylva cuesta ≈ US$ 0,65–1,04) y crear una API key. En el menú del entorno de esta sesión → **Edit** → *Network secrets* (o variable de entorno) con el nombre **`RUNWAYML_API_SECRET`**. Una sesión **nueva** la toma. Nunca pegarla en el chat. Primer paso con la clave: `node tools/factory/cli.js generate animation cazadora walk_down --provider runway --max-task-cents 10 --max-batch-cents 40`.

## Otra alternativa (BFL)
Menú del entorno en la barra de título de la sesión → **Edit** → *Network secrets* (o variable de entorno si no aparece) → nombre `BFL_API_KEY`. Una sesión **nueva** la toma. Nunca pegarla en el chat ni en el repo. La clave se crea en https://dashboard.bfl.ai (API → Keys → Add Key; se muestra una sola vez) con crédito prepago acotado.
