# INVENTARIO DE ARTE — estado inicial (NO exhaustivo; auditoría completa = Hito 2)
Medido: `assets/` = 3.298 archivos / 274 MB; `art-source/` = 1,2 GB (fuentes, entregas, producción por bloques). Runtime: `js/rendering/champion-sprites.js`, `js/assets/`, manifiestos en `docs/production/` (asset-blocks.json, art-integrations.json, roster-audit.json, shop-catalog.json).
| Categoría | Referencia | Consumidor runtime | Estado | Prioridad |
|---|---|---|---|---|
| Campeones (cuerpo/skins) | Códice (docs/LA_HORDA_CODEX*, art-source) | champion-sprites.js | Parcial: PR de arte mergeados (Ilkan, Veyra, Axiom, Musashi, Sylva, Ilvar…) y abiertos (#241,#267,#270) — cobertura por campeón **NOT RUN** | 1 |
| Enemigos/élites/jefes | LA_HORDA_BOSS_ASSET_MANIFEST.md | js/enemies, js/arenas | No auditado | 2 |
| Habilidades/VFX | docs/art-gate, vfx-readability | js/skills, js/champions/vfx-b | Gates existen; ejecución NOT RUN | 3 |
| Escenarios/UI/HUD | ui-factory, Runway HUD | css/ui-factory, js/ui | PR #264/#258 mergeados; #261/#265 pendientes | 4 |
Pendiente: cruzar `roster-audit.json` con renderer real, listar duplicados (`tools/factory/duplicity.js`), cuadros faltantes y escala.

## Arenas — estado real al 2026-11-06 (renderer real, capturas en `evidence/`)
| Arena | Qué dibuja el suelo/escenario | Estado | Acción hecha / pendiente |
|---|---|---|---|
| 01 Ciudad Maldita | `cm-render.js`: texturas `tex_*` en patrón x2 + edificios | **Mejorada (candidata)**: techos de pizarra/teja alternados, paredes de entramado | Pendiente: fachadas individuales por casa (B061/B062), ventanas/puertas propias, aldeanos (CM-C01) |
| 02 Fábrica Sin Fin | `fort-art.js` procedural por plataforma | **Mejorada (candidata)**: suelos pintados con respaldo procedural | Pendiente: muros, maquinaria |
| 03 Ruinas Célticas | `buildFloorTile` + arte del Códice integrado (#244/#245) | Sin cambios; revisar densidad | — |
| 04 Reino Fúngico | `mic-render.js` con atlas de mapa propio | Sin tocar | Evaluar el atlas contra el Códice |
| 05 Arena Gélida | `buildFloorTile` + Códice (#244) | Sin cambios; fix de ciclo de vida de Gran Helada (#236) en rama | — |
| 06 Acuática | `buildFloorTile` | **Mejorada (candidata)**: lecho marino pintado | — |
| 07 Laberinto | `buildFloorTile` | **Mejorada (candidata)**: losas con jeroglíficos | — |
| 08 Abismo | `ab-render.js` con `tex_piso` del Códice | Sin cambios. **Regeneración RECHAZADA** (8 cr, maestro enmarcado con diagonal → papel tapiz al repetir) | Reintentar con prompt sin marco/diagonales o conservar el actual |
| 09 Minas Profundas | `mn-render.js`: `tex_tierra_<zona>` por zona (6) | Ya tiene arte por zona, funcional (grava sobre degradado de color); **sin gasto** | Opcional: más estructura |
| 10 Infernal | `buildFloorTile` | **Mejorada (candidata)**: roca agrietada con vetas de lava (atenuada para que sea fondo) | — |
Campeones: NO abordados con Runway (necesitan cuadros de animación coherentes; ver NEXT_SESSION.md). Backlog real: `docs/production/asset-blocks.json` (575 bloques PENDIENTE, 86 SEGUIMIENTO, 56 BLOQUEADO_DECISION, 4 EN_CORRECCION, 10 INTEGRADO_MAIN).

## Enemigos, élites, subjefes y jefes — cobertura REAL de animación (2026-11-06, `tools/art/enemy_coverage.js`)
Método: el propio código del juego arma cada uno de los 104 tipos de `ENEMY_BASE` y los dibuja en 11 estados; se registra si cada estado es arte real, espejo, clon de otro estado, procedural o vacío. Tabla completa: `evidence/enemigos/coverage.tsv`; hojas de contacto `contact_01..06.png`.
**Resultado: 104 de 104 con arte real; 0 procedurales, 0 vacíos, 0 borrosos. Pero 36 tienen caminata de 2 cuadros o menos** y la mayoría de los jefes y subjefes reutilizan clones en 8 de 11 estados (animación pobre, no identidad equivocada).

| Tipo | Arena | Rango | Cuadros de caminata | Estados clonados (de 11) |
|---|---|---|---|---|
| madre_espora | micelial | jefe | 0 | 0 |
| ab_morador | abismo | jefe | 1 | 9 |
| golem_cuerpos | infernal | jefe | 2 | 8 |
| minotauro | laberinto | jefe | 2 | 8 |
| leviatan | acuatica | jefe | 2 | 8 |
| cm_presentador | ciudad | jefe | 2 | 8 |
| mn_cerbero | minas | jefe | 2 | 8 |
| dragon_forja | fortaleza | subjefe | 2 | 8 |
| micelio | micelial | subjefe | 2 | 8 |
| ab_carcelero | abismo | subjefe | 2 | 8 |
| cm_maestro | ciudad | subjefe | 2 | 8 |
| cm_tramoyista | ciudad | subjefe | 2 | 8 |
| cm_dama | ciudad | subjefe | 2 | 8 |
| mn_titan | minas | subjefe | 2 | 8 |
| ab_devorador | abismo | elite | 2 | 1 |
| cm_campanero | ciudad | elite | 2 | 1 |
| foco_convergencia | infernal | subelite | 1 | 9 |
| foco_hielo | hielo | subelite | 1 | 9 |
| lev_tentaculo | acuatica | subelite | 1 | 9 |
| nucleo_micelial | micelial | subelite | 1 | 8 |
| raiz_absorcion | micelial | subelite | 1 | 8 |
| ab_tentaculo | abismo | subelite | 1 | 9 |
| bestia_bosque | bosque | subelite | 2 | 8 |
| ab_acechador | abismo | subelite | 2 | 4 |
| ab_heraldo | abismo | subelite | 2 | 1 |
| ab_tejedor | abismo | subelite | 2 | 1 |
| cm_raptor | ciudad | subelite | 2 | 1 |
| cm_planidera | ciudad | subelite | 2 | 1 |
| cm_acechante | ciudad | subelite | 2 | 1 |
| cm_cometa | ciudad | normal | 1 | 9 |
| engendro | fortaleza | normal | 2 | 9 |
| ab_errante | abismo | normal | 2 | 1 |
| cm_saqueador | ciudad | normal | 2 | 1 |
| cm_perro | ciudad | normal | 2 | 3 |
| cm_sectario | ciudad | normal | 2 | 3 |
| cm_espectro | ciudad | normal | 2 | 1 |

**Jefes y subjefes con caminata de 0-2 cuadros (prioridad de animación):** madre_espora (0, usa su propio rig por estados), ab_morador (1), minotauro, leviatan, dragon_forja, micelio, golem_cuerpos, ab_carcelero, cm_maestro, cm_tramoyista, cm_dama, cm_presentador, mn_titan, mn_cerbero (2 cada uno).
**Minas contra su Códice** (`assets/ui/codex/minas/*.jpg`, único mapa con retratos de enemigos en el repo): el Cerbero en combate es fiel (tres cabezas, fuego); el Titán de Piedra es un buen sprite pero de paleta distinta (arenoso con cristales morados; el Códice: piedra oscura con cristales naranjas). Nota: un recorte del atlas crudo engaña; hay que juzgar en combate.
**Backlog relacionado:** `docs/production/asset-blocks.json` B056–B092 (jefes, élites y normales con «piezas/estados propios» pendientes). La mejora real es agregar cuadros de caminata y estados propios, trabajo de animación que requiere el pipeline de fábrica/pintor con revisión humana; `gen4_image` no produce secuencias coherentes.
