# Auditoría de arte de guardianes — runtime vs Códice (2026-11-06)

Método (reproducible: `tools/art-world/audit-guardians.py`): se compara el sprite «FRENTE» del Códice (`assets/ui/codex/champions/<id>.png`, plantilla 1774×887 igual para los 43) con el primer sprite del atlas que usa el juego. **`dist` = distancia entre paletas dominantes (chamfer simétrico en RGB, 12 colores)**: mide solo deriva de color/identidad; NO mide detalle, proporciones ni animación (por eso Ilkan, que tiene la paleta cercana pero un dibujo muy pobre, sale a media tabla). Láminas de cotejo visual en `evidence/guardianes/`. Los PR son los **abiertos** cuyo diff toca archivos del guardián.

| # | Guardián | dist paleta | alto del sprite (px de atlas) | atlas que usa | PR abiertos con su arte |
|---|---|---|---|---|---|
| 1 | facu_gm | 33.0 | 272 | atlas.png | — |
| 2 | musashi | 28.9 | 303 | v2/atlas.png | — |
| 3 | khepri | 27.9 | 278 | atlas.png | — |
| 4 | guerrero | 25.8 | 283 | atlas.png | #259 (3 arch.), #241 (8 arch.), #232 (6 arch.) |
| 5 | vhal | 24.8 | 267 | atlas.png | — |
| 6 | axiom | 24.7 | 290 | v2/atlas.png | #239 (3 arch.) |
| 7 | saelis | 24.4 | 284 | atlas.png | #259 (17 arch.) |
| 8 | nahir | 24.0 | 272 | atlas.png | #259 (1 arch.) |
| 9 | mago | 23.9 | 272 | atlas.png | #270 (3 arch.), #268 (3 arch.), #259 (3 arch.) |
| 10 | profeta | 23.4 | 230 | v2/atlas.png | #259 (30 arch.) |
| 11 | libertador | 21.9 | 276 | v2/atlas.png | — |
| 12 | cazadora | 21.5 | 300 | v2/atlas.png | — |
| 13 | soporte | 20.5 | 280 | v2/atlas.png | — |
| 14 | tanque | 19.4 | 264 | atlas.png | #259 (3 arch.), #241 (8 arch.), #232 (7 arch.) |
| 15 | ilkan | 18.9 | 292 | v2/atlas.png | — |
| 16 | oriel | 18.9 | 268 | atlas.png | — |
| 17 | orsa | 18.7 | 272 | atlas.png | #259 (1 arch.) |
| 18 | ynara | 18.5 | 276 | atlas.png | #259 (22 arch.) |
| 19 | bront | 18.4 | 266 | atlas.png | — |
| 20 | velmira | 17.7 | 274 | atlas.png | — |
| 21 | aelith | 17.3 | 271 | atlas.png | #267 (22 arch.), #241 (8 arch.), #232 (6 arch.) |
| 22 | segador | 17.2 | 295 | v2/atlas.png | — |
| 23 | nano_gm | 16.3 | 220 | codex-v2/atlas.png | #231 (1 arch.) |
| 24 | zahra | 15.2 | 268 | atlas.png | #259 (1 arch.) |
| 25 | aurelia | 15.0 | 267 | atlas.png | #259 (17 arch.) |
| 26 | sira | 15.0 | 268 | atlas.png | #259 (1 arch.) |
| 27 | solciju | 14.9 | 273 | atlas.png | — |
| 28 | nigromante | 14.6 | 283 | v2/atlas.png | — |
| 29 | myla | 13.7 | 282 | atlas.png | #259 (14 arch.) |
| 30 | veyra | 13.0 | 268 | atlas.png | — |
| 31 | renko | 11.9 | 255 | atlas.png | #259 (61 arch.) |
| 32 | brasa | 11.8 | 272 | atlas.png | — |
| 33 | vesper | 11.8 | 264 | atlas.png | #259 (1 arch.) |
| 34 | brakk | 11.2 | 270 | atlas.png | #232 (2 arch.) |
| 35 | morwen | 11.2 | 290 | atlas.png | — |
| 36 | tibor | 11.1 | 273 | atlas.png | #259 (1 arch.) |
| 37 | maura | 11.0 | 274 | atlas.png | #259 (17 arch.) |
| 38 | iria | 10.9 | 272 | atlas.png | — |
| 39 | baltra | 10.4 | 266 | atlas.png | #259 (1 arch.) |
| 40 | morveth | 10.1 | 268 | atlas.png | #241 (8 arch.), #232 (3 arch.) |
| 41 | farolero | 9.6 | 272 | atlas.png | — |
| 42 | dariel | 8.4 | 265 | atlas.png | #259 (1 arch.) |
| 43 | eslabon | 8.0 | 272 | atlas.png | — |

## Lectura honesta
- **Ilkan** (primer caso pedido): la paleta es parecida pero el sprite del juego es un muñeco plano de brazos en T, **sin las hoces, sin hombrera de placas, sin antebrazos vendados, con pantalón turquesa en vez de marrón y sin el dobladillo con flecos** del Códice. Ningún PR abierto toca su arte. Es una brecha de DIBUJO, no de color.
- **Guerrero**: el juego muestra una figura gris/verde encapuchada; el Códice, un asesino de capucha y bufanda **roja** con hojas curvas: deriva de identidad real. Tocado por #259, #241 y #232.
- Los PR con más arte de campeones pendiente: **#259** (Renko 61 archivos, Profeta 30, Ynara 22, Saelis/Aurelia/Maura 17, Myla 14…), **#241** (Guerrero, Tanque, Aelith, Morveth: rechazado por 4 regresiones, ver RESULTADOS_PR.md), **#267** (Aelith 22), **#232** (Art Engine: Guerrero, Tanque, Aelith, Morveth…), **#270/#268** (Thalen/Mago; #268 NO_INTEGRAR).
- Los datos están en `evidence/guardianes/champ_metric.json`.
