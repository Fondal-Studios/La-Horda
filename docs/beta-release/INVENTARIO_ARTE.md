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
