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
| 2026-11-06 | 959 | Fábrica Sin Fin: fort_planchas_hierro (8 cr, task 33a63322-b9c0-46b3-8d8b-ca381cf36f5f), fort_adoquin_patio (8 cr, task 61567fa2-40f9-4bf4-bb22-fec82a30cb2a) |

Fábrica Sin Fin (ejecución programada 06:23 UTC): suelos pintados `assets/vfx/fortaleza/tex_planchas_hierro.png` (128 px, plataformas forge/interior/core/slide) y `tex_adoquin_patio.png` (96 px, patio/puente/hub) cargados por `fortTex()` en `js/arenas/fortaleza/fort-art.js` con respaldo al dibujo procedural. Evidencia: `evidence/fortaleza-antes-despues.png`; `tools/fortaleza/smoke.js` ERRORS 0; `pixel-density --strict`: solo el desvío preexistente `world-v1`. Un primer intento invalidando la caché al cargar rompió el render (negro); se descartó y se precargan las texturas al abrir el juego. Sin evaluación independiente.
| 2026-11-06 | 935 | pisos: laberinto_piso (8 cr, task 3ad574b2-bbf2-43c1-b85b-e8ec3562a1ae), infernal_piso (8 cr, 2ffcc0a4-30ad-4ad0-bfe7-c5fc52e6afc0), acuatica_piso (8 cr, 92e95af3-3d91-4692-ab5d-6b7f0e66e68a) |

Pisos pintados de Laberinto, Infernal y Acuática: `assets/vfx/<arena>/tex_piso.png` cargados por `FLOOR_PAINTED` en `js/rendering/arena.js` (`buildFloorTile`, respaldo procedural; dim por arena para que el piso sea fondo). Laberinto: se recortó el centro del maestro (traía viñeta). Evidencia: `evidence/pisos-laberinto-infernal-acuatica-antes-despues.png` (fila de arriba = antes, abajo = después); sin errores de página; `pixel-density --strict` sin desvíos nuevos (solo el preexistente `world-v1`). Sin evaluación independiente ni prueba de regresión larga todavía (NOT RUN: tools/regression).
Gasto de esta ejecución programada: 40 créditos (de 60 permitidos).
| 2026-11-06 | 927 | abismo_piso (8 cr, task d2367459-fdcf-4726-aa02-3312d7208102) — **RECHAZADO, no integrado**: el maestro salió como una losa enmarcada con borde negro y una diagonal; recortando 2×2 losas y repitiendo, la diagonal forma un papel tapiz evidente. Intento 1 de 3 para el Abismo. Próxima estrategia (sin repetir gasto a ciegas): prompt sin marco, sin diagonales y con losas uniformes, o dejar el `tex_piso` actual del Códice |
