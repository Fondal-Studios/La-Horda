# Kael, la Daga Carmesí (`guerrero`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Asesino de combos (rol asesino, melee, objetivo y jefes). Tono: sigiloso, frío y cruel; cortes rápidos, trampas y veneno. Lenguaje: daga, sangre, rombo de trampa, humo.
- **Paleta sugerida:** carmesí `#c4544a` (color de clase, `champions.js:47`), rosa de sangre `#f0a89a`, rojo oscuro `#7a1c1c`, negro `#2a0808`, verde veneno `#8dffa0` (trampa y definitiva, `asesino.js:62`), violeta de sombra `#9a6ac7`. (Atlas medido: gris y blanco `#3c3c3c`/`#fcfcfc`: el rojo es acento de efectos, el cuerpo es gris encapuchado.)
- **Motivos visuales:** cortes diagonales rápidos, gotas de sangre, rombo de trampa con 4 puntas, humo violeta, hilo de veneno que gotea.
- **NO debe parecerse a:** **Veyra** (sangre y pacto, mitad B); **Segador** (guadaña roja pesada); **Musashi** (tinta azul y trazos largos); **Cazadora** (su trampa es verde oscuro de raíces; la de Kael es un rombo metálico con luz verde neón).
- **Estado actual del VFX (verificado en código):** Ya tiene hojas propias en `assets/vfx/guerrero/` (`corte_sangrante`, `triple_golpe`, `trampa`, `pestilencia`, 336x336 c/u) disparadas con `pushAsesinoFx` (`js/rendering/effects.js:295`) más el tema procedural `blood` (`themes.js:19`, forma `spike`). `skill-fx-a/c/guerrero.js` añade estallido de sangre por habilidad y nova de 60 u en la definitiva.
- **Fuentes del kit:** `js/data/champions.js:46-57`, `js/skills/abilities.js:893-902` (Corte), `:1252-1269` (Triple), `:1271-1289` (Trampa), `:1291-1298` (sigilo), `js/champions/asesino.js:11-109` (trampas y Pestilencia), `aim-targeting.js:15-16,32-33`.

## B. Habilidades

### Básico - Puñalada

- **Mecánica (código):** Corte rápido a un solo objetivo; alcance 64 u, cooldown 420 ms. Pasiva Depredador: +15% contra sangrantes/envenenados. *(`champions.js:50`, `champion-identity.js:31`, `champion-tuning.js:76`)*
- **Silueta y forma:** Tajo diagonal corto de 64 u con un reflejo blanco de hoja.
- **Color dominante:** Gris-blanco `#e4e4e4` con gota carmesí.
- **Movimiento:** Dos cortes cruzados rápidos (el segundo invertido).
- **Anticipación:** Daga hacia atrás, 2 cuadros.
- **Impacto:** Tajo y chispa roja, 2 cuadros.
- **Disipación:** La gota cae.
- **Cuadros sugeridos:** anticipación 2 + impacto 2 + disipación 3 = 7 cuadros
- **Tamaño sugerido del asset (px nativos):** 48x48 px (radio 64u, ancho de boca 72u, arco 69 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Una gota de sangre.
- **Ícono 16x16:** daga pequeña. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Corto y casi blanco; sus habilidades son rojas, verdes o violetas.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a la Flecha de Sylva y la Quilla de Facu: flecha verde y arco de agua; este es un tajo blanco con gota.

### Hab. 1 - Corte Sangrante

- **Mecánica (código):** Golpe a un objetivo (alcance 134 u) con daño 125% y sangrado 3400 ms. Costo 32, cooldown 5000 ms. *(`champions.js:52`, `abilities.js:893-902`, premarcado `aim-targeting.js:32`)*
- **Silueta y forma:** Un tajo profundo diagonal de 90 u en rojo oscuro con borde claro; del corte brota un chorro que luego gotea sobre el objetivo.
- **Color dominante:** Carmesí `#c4544a` y rojo oscuro `#7a1c1c`.
- **Movimiento:** El tajo se traza en 100 ms; el chorro sube y cae; el sangrado es un goteo continuo durante 3400 ms.
- **Anticipación:** Daga en guardia, 2 cuadros.
- **Impacto:** Tajo con salpicadura, 3 cuadros.
- **Disipación:** Gotas que caen (loop 4 cuadros mientras sangra 3400 ms) y luego se secan, 3 cuadros.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 64x64 px (90u x 90u; 1,5 u/px)
- **Loop:** Solo el goteo sobre el objetivo (loop 4 cuadros).
- **Partículas / capas secundarias:** Salpicaduras, hilo de sangre. Existe `corte_sangrante.png` (336x336).
- **Ícono 16x16:** daga con una gota. (hoy: glifo píxel `dagger+drop`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es el único corte único y rojo; la 2 es un combo azul-naranja-rojo, la 3 un rombo verde.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Tajo del Segador y Filo de sangría de Veyra: guadaña roja ancha y filo con pacto; este es un tajo diagonal único con goteo.

### Hab. 2 - Triple Golpe

- **Mecánica (código):** Tres golpes veloces a un objetivo (alcance 114 u): dos de 60% y un tercero de 300% (crítico garantizado). Costo 40, cooldown 6800 ms. *(`champions.js:53`, `abilities.js:1252-1269`, premarcado `aim-targeting.js:33`)*
- **Silueta y forma:** Tres tajos cruzados que forman una "Z" alrededor del objetivo: azul, naranja y rojo (el motor ya usa `#8fd0ff`, `#ff9a4d`, `#ff3b3b`), el último el más grande.
- **Color dominante:** Progresión azul → naranja → rojo.
- **Movimiento:** Cada golpe 80 ms después del anterior; el último con estallido de crítico.
- **Anticipación:** Daga gira en la mano, 2 cuadros.
- **Impacto:** Tres tajos escalonados y estallido final, 5 cuadros.
- **Disipación:** Las líneas se desvanecen en chispas, 3 cuadros.
- **Cuadros sugeridos:** anticipación 2 + impacto 5 + disipación 3 = 10 cuadros
- **Tamaño sugerido del asset (px nativos):** 64x64 px (95u x 95u; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Chispas de los tres colores, "!" de crítico. Existe `triple_golpe.png` (336x336).
- **Ícono 16x16:** dos espadas cruzadas. (hoy: glifo píxel `claws`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única multicolor y de tres golpes visibles; las otras son un solo color.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Mil Cortes de Musashi y Garras de Ilkan: ráfaga de tinta y arcos de arena; este es un combo discreto de 3 tajos en colores.

### Hab. 3 - Trampa de Área

- **Mecánica (código):** Coloca de 1 a 4 trampas (según talento) separadas 46 u en abanico (punto a 170 u, radio de cada una 65 u, 12000 ms, 280 ms de armado); al pisarse aturde 400 ms al primero y encadena daño a 3 enemigos en radio 135 u (75% y -20% por salto). Costo 38, cooldown 9500 ms. *(`champions.js:54`, `abilities.js:1271-1289`, `asesino.js:11-66`, premarcado `aim-targeting.js:16`)*
- **Silueta y forma:** Rombo de metal oscuro con 4 puntas y un núcleo verde neón; al activarse salta y lanza arcos de energía verde entre los enemigos.
- **Color dominante:** Verde neón `#7dffa0` sobre metal oscuro.
- **Movimiento:** La trampa gira lento (0,6 rad/s) mientras está armada; al activarse da un salto y los arcos recorren 3 enemigos.
- **Anticipación:** Se clava y se ilumina, 3 cuadros (280 ms de armado real).
- **Impacto:** Disparo con arcos de cadena, 4 cuadros.
- **Disipación:** Se desarma en piezas, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 88x88 px (diámetro 130u = 2 x r 65u; 1,5 u/px)
- **Loop:** Sí: trampa armada en loop de 6 cuadros (giro de las puntas).
- **Partículas / capas secundarias:** Arcos de energía a 135 u, chispas verdes. Existe `trampa.png` (336x336).
- **Ícono 16x16:** rombo con puntos. (hoy: glifo píxel `trap+dots`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única en el suelo con luz verde; la 1 y la 2 son cortes.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a la Trampa del Bosque de Sylva y la Torreta de clavos de Brakk: raíces verde oscuro y torreta de hierro; esta es un rombo metálico con luz verde.

### Definitiva - Pestilencia Sombría

- **Mecánica (código):** Sigilo de 2000 ms y luego un triple golpe (2 críticos y un final x1,4) a un enemigo a ≤280 u, con veneno 3000 ms y sangrado; encadena veneno a 3 enemigos en radio 150 u (55%, -25% por salto). Sin costo, cooldown 32000 ms. *(`champions.js:56`, `abilities.js:1291-1298`, `asesino.js:70-105`)*
- **Silueta y forma:** Kael se disuelve en humo violeta; reaparece a la espalda del objetivo; tres cortes en cruz y una nube verde tóxica; el veneno une a los vecinos con hilos verdes.
- **Color dominante:** Violeta `#9a6ac7` (sigilo) → verde veneno `#8dffa0` (golpe).
- **Movimiento:** Desaparece en 200 ms; la emboscada cae en 120 ms; la nube verde se expande a 100 u y los hilos saltan a los vecinos.
- **Anticipación:** Sigilo: humo y silueta translúcida durante 2000 ms (loop), 6 cuadros de entrada.
- **Impacto:** Emboscada y 3 cortes, 6 cuadros; hilos de veneno, 4 cuadros por salto.
- **Disipación:** La nube verde se disuelve, 6 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 10 + disipación 6 = 22 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 200x200 px (diámetro 300u = 2 x r 150u; 1,5 u/px)
- **Loop:** Sí: el sigilo (loop 6 cuadros durante 2000 ms).
- **Partículas / capas secundarias:** Humo, burbujas tóxicas, hilos verdes que unen a los infectados. Existe `pestilencia.png` (336x336) con las etapas sigilo, emboscada y veneno.
- **Ícono 16x16:** máscara con calavera. (hoy: glifo píxel `mask+skull`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con sigilo y la única verde que ocurre en cadena; la 3 es una trampa fija.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Plaga de los Condenados de Nigromante y Jardín de la peste de Morveth (zonas venenosas): plaga verdosa en suelo y jardín de hongos; esta es una emboscada con humo violeta.

### Pasiva - Depredador

- **Mecánica (código):** Los básicos contra enemigos sangrantes o envenenados hacen +15% de daño (`js/data/champion-tuning.js:76`).
- **Arte:** Sin indicador visible verificado. Sugerencia: un punto rojo pequeño sobre los enemigos sangrantes (el goteo de Corte Sangrante ya los marca).
