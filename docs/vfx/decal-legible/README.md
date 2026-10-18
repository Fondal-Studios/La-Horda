# Decales de efecto legibles (antes / después)

Capturas del juego real (844x390, Playwright) del mismo efecto con `origin/main` (`antes/`) y con esta rama (`despues/`).
La posición de los enemigos cambia entre capturas (la partida no es determinista); lo que se compara es el decal.

| Captura | Qué muestra |
|---|---|
| `aelith_ult_bosque`, `oriel_ult_hielo`, `solciju_ult_infernal`, `morwen_ult_laberinto`, `nigromante_ult_acuatica`, `veyra_ult_minas` | Definitivas Q5: el «disco» `pn_ult_*` / `pn_flash_*` de `kvbPunch` y el decal propio de cada kit |
| `ynara_ult_hielo`, `iria_ult_bosque`, `vesper_1_laberinto`, `profeta_1_acuatica`, `morwen_1_minas` | Nova / zona de `skill-fx-a` (mitad A del roster) |

Qué cambió:

- **Relleno**: techo de relleno trameado `KVB_FILL_CAP` / `SFA_FILL` = 24 % de los píxeles del disco; el destello de impacto baja de 50 % a 20 % y el anillo exterior (el radio real) queda como único elemento «lleno».
- **Tinte por arena**: los sprites se hornean con `AID_INLAY_PALETTES[arena]` (caché por arena), así el mismo rosa de un campeón no es idéntico en el bosque, el hielo o el infierno.
- **Destello de impacto (`punch`)**: la capa superior (sobre las entidades) solo lleva puntas del cuarto exterior; relleno y anillo pasan al suelo (`pn_floor_*`).
- **Trazos vectoriales → rejilla de píxel**: `js/rendering/pixel-stroke.js` (`pxsRing`, `pxsLine`, `pxsPath`, `pxsDisc`) para ondas de choque, anillos de partículas, anillos de familia y los trazos directos de Solciju, Sira y Orsa.

Prueba: `node tools/vfx/test-decal-legible.js` (ver cabecera del archivo).
