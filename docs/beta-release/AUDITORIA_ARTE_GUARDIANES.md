# Auditoría de arte de guardianes — runtime vs Códice (2026-11-06, CORREGIDA)

> **Corrección de mi propio error.** La primera versión de esta auditoría comparó el Códice con un atlas `v2` de Ilkan que el juego ya NO carga y concluyó que Ilkan estaba «muy por debajo del Códice». Era falso: el juego carga `ilkan/codex-v1/atlas.png`, que es fiel al Códice. Esta versión lee el mapeo real de atlases y cuadros desde `js/**/*.js` (`champPackLoadAtlas`), y además se verificó **en combate** (capturas en `evidence/guardianes/`).

Método (`tools/art-world/audit-guardians.py`): sprite «FRENTE» del Códice vs el cuadro `idle_down[0]` del atlas real. `dist` = deriva de paleta (chamfer simétrico, 12 colores): mide color/identidad, **no** detalle ni animación; la lectura visual manda.

## Hallazgos confirmados a ojo y en combate
| Guardián | Veredicto | Evidencia |
|---|---|---|
| **Guerrero** | ~~BRECHA REAL DE IDENTIDAD~~ **CORREGIDO en la rama de trabajo** (cuerpo del Códice rescatado de #241, ver RESULTADOS_PR.md): **BRECHA REAL DE IDENTIDAD**: en el juego es una figura gris/verde con dagas; el Códice es un asesino de capucha y bufanda **roja** con hojas curvas | `combate_guerrero_mago_tanque_myla.png`, `champs_2.png` (usa un loader distinto, sin `champPackLoadAtlas`). El cuerpo fiel al Códice existe en el PR **#241** (`art-source/fondal/guerrero-codex`), rechazado por 4 regresiones de cromas/colección |
| **Mago** | Más simple que el Códice (el Códice: sombrero y capa púrpura, bastón con llama azul); misma familia, menos detalle | ídem |
| **Ilkan (humano)** | **FIEL al Códice** (hoces, hombrera de placas, vendas, rostro, fajín); 62 cuadros consistentes | `ilkan_en_combate.png`, `ilkan_atlas_humano_codex-v1.png` |
| **Ilkan — Coloso de Arena** | **DÉBIL**: arte procedural (`tools/art/ilkan/build.py`), rígido, cuatro brazos de bloques repetidos; no hay Códice del Coloso (solo el texto de diseño) | `ilkan_coloso_procedural.png`. Es lo que más se aparta de la calidad del resto |
| Tanque, Myla | Bien | `combate_guerrero_mago_tanque_myla.png` |
| Resto (≈35) | Fieles al Códice a simple vista (sprite más pequeño, mismo diseño y paleta) | `champs_1..4.png` |

## Tabla de deriva de paleta (orden descendente; sólo los que el juego carga con `champPackLoadAtlas`)
| # | Guardián | dist | atlas real | PR abiertos con su arte |
|---|---|---|---|---|
| 1 | musashi | 33.8 | musashi/codex-v1/atlas.png | — |
| 2 | nigromante | 32.1 | nigromante/codex-v1/atlas.png | — |
| 3 | libertador | 31.3 | libertador/v2/atlas.png | — |
| 4 | facu_gm | 28.1 | facu_gm/atlas.png | — |
| 5 | saelis | 25.4 | saelis/atlas.png | #259 (17) |
| 6 | vhal | 22.6 | vhal/atlas.png | — |
| 7 | cazadora | 22.0 | cazadora/codex-v1/atlas.png | — |
| 8 | profeta | 21.8 | profeta/v2/atlas.png | #259 (30) |
| 9 | khepri | 21.1 | khepri/atlas.png | — |
| 10 | segador | 21.0 | segador/v2/atlas.png | — |
| 11 | bront | 20.1 | bront/atlas.png | — |
| 12 | oriel | 18.8 | oriel/atlas.png | — |
| 13 | soporte | 17.9 | soporte/v3/atlas.png | — |
| 14 | ynara | 17.2 | ynara/atlas.png | #259 (22) |
| 15 | velmira | 16.8 | velmira/atlas.png | — |
| 16 | nahir | 16.5 | nahir/atlas.png | — |
| 17 | nano_gm | 16.4 | nano_gm/codex-v2/atlas.png | #231 (1) |
| 18 | veyra | 15.6 | veyra/codex-v1/atlas.png | — |
| 19 | ilkan | 15.4 | ilkan/codex-v1/atlas.png | — |
| 20 | axiom | 14.9 | axiom/codex-v1/atlas.png | #239 (3) |
| 21 | tibor | 14.9 | tibor/atlas.png | — |
| 22 | aelith | 14.0 | aelith/atlas.png | #267 (22), #241 (8), #232 (6) |
| 23 | solciju | 14.0 | solciju/atlas.png | — |
| 24 | zahra | 14.0 | zahra/atlas.png | — |
| 25 | brakk | 13.9 | brakk/atlas.png | #232 (2) |
| 26 | sira | 13.6 | sira/atlas.png | — |
| 27 | orsa | 13.4 | orsa/atlas.png | — |
| 28 | brasa | 13.3 | brasa/atlas.png | — |
| 29 | aurelia | 13.2 | aurelia/atlas.png | #259 (17) |
| 30 | vesper | 12.5 | vesper/atlas.png | — |
| 31 | renko | 12.3 | renko/atlas.png | #259 (61) |
| 32 | dariel | 11.5 | dariel/atlas.png | — |
| 33 | iria | 11.5 | iria/atlas.png | — |
| 34 | farolero | 11.1 | farolero/atlas.png | — |
| 35 | morveth | 11.0 | morveth/atlas.png | #241 (8), #232 (3) |
| 36 | maura | 10.8 | maura/atlas.png | #259 (17) |
| 37 | morwen | 10.2 | morwen/atlas.png | — |
| 38 | baltra | 10.1 | baltra/atlas.png | — |
| 39 | eslabon | 9.4 | eslabon/atlas.png | — |
| 40 | guerrero | — | otro loader | #259 (3), #241 (8), #232 (6) |
| 41 | mago | — | otro loader | #270 (3), #268 (3), #259 (3) |
| 42 | myla | — | otro loader | #259 (14) |
| 43 | tanque | — | otro loader | #259 (3), #241 (8), #232 (7) |

## Qué NO se hizo y por qué
- **No se reemplazó el arte de los 43 guardianes**: casi todos ya son fieles al Códice; sustituirlos habría empeorado lo existente.
- Costo de rehacer un guardián completo con Runway (`gen4_image`, **8 créditos por cuadro**): un atlas de ~60 cuadros ≈ 480 créditos, sin garantía de consistencia entre cuadros. Se probó 1 cuadro de Ilkan (`art-source/runway-guardians/ilkan/intento1_idle_frente`, 8 cr): la calidad estática es muy buena y fiel al Códice, pero un atlas animado exige un pipeline de consistencia que todavía no existe.
- **Prioridades reales:** (1) Guerrero fiel al Códice (rescatar de #241 solo el cuerpo, sin tocar cromas, o reparar las cromas), (2) Mago, (3) Coloso de Ilkan, (4) revisar a ojo Libertador, Musashi y Nigromante (dist alta pero visualmente próximos), (5) skins y cromas de cada uno (aún sin auditar).

## Pendiente de tu confirmación
Si lo que viste «pésimamente producido» de Ilkan fue **el Coloso**, una **skin**, o **una versión publicada anterior** del juego, decime cuál: en el código de esta rama el Ilkan humano está bien.

## Bloques aceptados
1. **Guerrero (Kael)** — cuerpo fiel al Códice (36 cuadros, 14 estados). Evidencia: `guerrero_antes_despues.png`.
2. **Mago (Thalen)** — cuerpo Códice de 36 estados rescatado de #270. Evidencia: `mago_antes_despues.png`.
3. **Tanque (Aldric)** — cuerpo Códice de 36 estados rescatado de #241. Evidencia: `tanque_antes_despues.png`.

## Devueltos al reparador
- **Aelith** y **Morveth** (de #241): sus cromas de paleta deben recolorear el cuerpo NUEVO; ver instrucción en RESULTADOS_PR.md. Reparar `cromas.js` una vez los desbloquea a ambos.
