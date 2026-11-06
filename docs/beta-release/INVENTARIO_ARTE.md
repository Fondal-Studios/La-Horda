# INVENTARIO DE ARTE — estado inicial (NO exhaustivo; auditoría completa = Hito 2)
Medido: `assets/` = 3.298 archivos / 274 MB; `art-source/` = 1,2 GB (fuentes, entregas, producción por bloques). Runtime: `js/rendering/champion-sprites.js`, `js/assets/`, manifiestos en `docs/production/` (asset-blocks.json, art-integrations.json, roster-audit.json, shop-catalog.json).
| Categoría | Referencia | Consumidor runtime | Estado | Prioridad |
|---|---|---|---|---|
| Campeones (cuerpo/skins) | Códice (docs/LA_HORDA_CODEX*, art-source) | champion-sprites.js | Parcial: PR de arte mergeados (Ilkan, Veyra, Axiom, Musashi, Sylva, Ilvar…) y abiertos (#241,#267,#270) — cobertura por campeón **NOT RUN** | 1 |
| Enemigos/élites/jefes | LA_HORDA_BOSS_ASSET_MANIFEST.md | js/enemies, js/arenas | No auditado | 2 |
| Habilidades/VFX | docs/art-gate, vfx-readability | js/skills, js/champions/vfx-b | Gates existen; ejecución NOT RUN | 3 |
| Escenarios/UI/HUD | ui-factory, Runway HUD | css/ui-factory, js/ui | PR #264/#258 mergeados; #261/#265 pendientes | 4 |
Pendiente: cruzar `roster-audit.json` con renderer real, listar duplicados (`tools/factory/duplicity.js`), cuadros faltantes y escala.
