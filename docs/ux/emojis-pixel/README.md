# Emojis de color -> íconos pixel

Capturas a 844x390 (`<pantalla>-antes.png` = `origin/main`, `<pantalla>-despues.png` = esta rama) y la hoja de íconos
(`iconos.png`, 84 íconos 16x16 a 6x).

Emojis de color visibles (texto del DOM fuera de un ícono pixel), contados con Playwright en cada pantalla:

| Pantalla | antes | después |
|---|---|---|
| Menú principal | 2 | 0 |
| Modos y multijugador | 7 | 0 |
| Sala / multijugador (prep) | 4 | 0 |
| Tienda (destacados) | 0 | 0 |
| Tienda (skins) | 1 | 0 |
| Códice (inicio) | 1 | 0 |
| Códice (arena) | 2 | 0 |
| Códice (campeón) | 5 | 0 |
| Partida Minas (barra superior) | 6 | 0 |
| Partida Bosque | 2 | 0 |

`node tools/art/emoji-lint.js`: antes 522 emojis de color en el código, 425 sin ícono pixel; después 507 (se conservan como
texto accesible del DOM), 0 sin ícono ni excepción documentada (2 excepciones con motivo).
