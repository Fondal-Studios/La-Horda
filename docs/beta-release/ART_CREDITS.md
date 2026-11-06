# ART CREDITS
| Fecha | Saldo | Evento |
|---|---|---|
| 2026-11-06 | 15 | observado al inicio (sin gasto) |
| 2026-11-06 | 1015 | el propietario cargó crédito |
| 2026-11-06 | 999 | piloto casas Ciudad Maldita: casa_a (8 cr, task 312cc081-dfaa-43fa-9c6c-c30c4ab22922), casa_b (8 cr, task 1d95c72c-b11f-4d50-94a6-ce71f2443ad9). Recibos en `art-source/runway-world/ciudad/*/receipt.json` |

Costo medido: gen4_image 1024:1024 con 1 imagen de referencia = **8 créditos**.
Evaluación (GENERATED_NOT_APPROVED, sin revisión independiente): casa_a = dirección válida (fachada frontal + tejado de tejas, ventanas encendidas); casa_b = **rechazada para uso directo** (vista isométrica, no coincide con la vista oblicua frontal del juego); queda como referencia.
Regla de gasto: ≤40 créditos por ejecución (`WORLD_RUNWAY_BUDGET`); no regenerar sin causa registrada.
| 2026-11-06 | 975 | texturas Ciudad Maldita: tex_techo_pizarra (8 cr, task 0a5a7d62-2c56-45ed-a1e0-b82e411ddf09), tex_techo_roja (8 cr, f6ac09f8-4695-4561-a83c-56c3ad25282f), tex_pared_madera_piedra (8 cr, cf35449b-4322-45dd-bde4-e9b3d9e12570) |

Integración (rama de trabajo, **sin evaluación independiente**): `tex_techo.png` ← pizarra, `tex_techo_roja.png` nueva (techos alternados por id de edificio, `cm-render.js`), `tex_pared_ext.png` ← entramado de madera y piedra. Copias .webp regeneradas sin pérdida. Procesado: reducción BOX a 96 px, costura continua por mezcla, ≤64 tonos. Originales recuperables con `git show ef415626:assets/vfx/ciudad/<archivo>`.
Evidencia: `docs/beta-release/evidence/ciudad-casas/` (antes/después en renderer real, 1000x560). `tools/ciudad/smoke.js`: SUMMARY OK, 0 errores de página. `tools/art/pixel-density.js --strict`: un solo desvío sin excepción (`assets/sprites/arenas/world-v1`, ajeno a esta rama); las texturas nuevas no figuran como desvío.
