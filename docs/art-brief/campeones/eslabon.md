# Garren, el Eslabón (`eslabon`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Tanque protector (rol tanque, cadenas, custodia y separación, melee). Tono: grave y remordido; el carcelero que abrió la puerta. Lenguaje: eslabón, grillete, candado, llave.
- **Paleta sugerida:** gris acero `#9195a1` (color de clase, `data/portadores.js:29`), gris oscuro `#5b606e`, hueso `#e4dfc8`, oro viejo `#d8b868`, azul pálido de firma `#d3dff5` (`champion-signatures.js:9`), contorno `#14161c`. (Atlas: grises `#3c3c3c`, hueso `#e4ccb4`.)
- **Motivos visuales:** eslabones ovales, grilletes abiertos, candado, llave, barrotes, cadena tendida.
- **NO debe parecerse a:** **Iria** (hilo/ancla índigo con triángulos); **Bront/Brakk** (placas y ladrillos: Garren no levanta muros, extiende cadenas); **Aelith** (violeta); **Baltra** (cuerda y bronce).
- **Estado actual del VFX (verificado en código):** Tema procedural `chain` (`themes.js:16`, forma `hex`, motivos link/chain/nail/spark). `skill-fx-a/c/eslabon.js`: gancho = haz de cadena de 24 u + estallido; línea = tejas de cadena (`SFA_OBJ.chain`); Custodia = auras + haz; definitiva = nova del radio real.
- **Fuentes del kit:** `js/data/portadores.js:29-36`, lanzamiento `js/champions/portadores.js:110-133`, objetos `:239-`, daño compartido `:183-195`, velocidad `:205`.

## B. Habilidades

### Básico - Cadena de Grilletes

- **Mecánica (código):** Golpe cuerpo a cuerpo; alcance 85 u, cooldown 650 ms (arma: Cadena de Grilletes). *(`data/portadores.js:29` (`range:85, basic:650`))*
- **Silueta y forma:** Latigazo de cadena en arco de 85 u con un grillete al extremo.
- **Color dominante:** Gris acero `#9195a1` y hueso.
- **Movimiento:** La cadena describe un arco horizontal con inercia; el grillete se abre al impactar.
- **Anticipación:** La cadena se recoge, 2 cuadros.
- **Impacto:** Latigazo con chispa metálica, 3 cuadros.
- **Disipación:** La cadena rebota y se recoge.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros
- **Tamaño sugerido del asset (px nativos):** 64x88 px (radio 85u, ancho de boca 128u, arco 97 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Chispas, eslabón suelto.
- **Ícono 16x16:** cadena con un grillete. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Arco con cadena visible; las habilidades son gancho, línea, vínculo y anillo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Puño de bastión y Martillazo de obra: golpe de puño y martillo; esta es una cadena.

### Hab. 1 - Cadena de Retorno

- **Mecánica (código):** Engancha al enemigo elegido (alcance 290 u): daño 140%, ralentiza 25% 1200 ms y lo acerca hasta 135 u hacia él (los jefes no se desplazan). El gancho dura 350 ms. Costo 26, cooldown 6500 ms. *(`data/portadores.js:32`, `portadores.js:110-119`)*
- **Silueta y forma:** Cadena recta con garfio en la punta que cruza el campo y vuelve tirando; en el objetivo se cierra un grillete.
- **Color dominante:** Gris acero y hueso `#e4dfc8`.
- **Movimiento:** Va hasta el objetivo (5 cuadros), se traba y recoge arrastrando (tensión), 350 ms de vida real.
- **Anticipación:** Garfio sale girando, 3 cuadros.
- **Impacto:** Se clava y cierra el grillete, 3 cuadros.
- **Disipación:** Se recoge dejando un arrastre de eslabones, 3 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 3 = 9 cuadros
- **Tamaño sugerido del asset (px nativos):** 200x16 px (290u x 24u; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Chispas, polvo en el tirón.
- **Ícono 16x16:** gancho con flecha. (hoy: glifo píxel `hook+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única cadena que se mueve hacia el objetivo y vuelve; la 2 queda quieta.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Facu GM (Corriente de Resaca) y Bayoneta del Libertador: arrastre de agua y embestida; esta es un gancho con tirón.

### Hab. 2 - Línea Infranqueable

- **Mecánica (código):** Tiende una cadena de 200 u (perpendicular a la mira) en un punto (alcance 180 u) durante 6000 ms: cada 600 ms daña 35% y ralentiza 45% 850 ms a quienes la cruzan; no bloquea a aliados. Costo 32, cooldown 10500 ms. *(`data/portadores.js:33`, `portadores.js:120-123`, `:239-`)*
- **Silueta y forma:** Cadena tendida entre dos estacas con candado en el centro; los eslabones tintinean al ser tocados.
- **Color dominante:** Gris oscuro `#5b606e` con oro viejo `#d8b868` en el candado.
- **Movimiento:** Cae del aire y se tensa de golpe; cada 600 ms los eslabones se encienden con un pulso.
- **Anticipación:** Las estacas se clavan y la cadena cae, 3 cuadros.
- **Impacto:** Tensión y chispa, 3 cuadros.
- **Disipación:** La cadena se afloja y desaparece, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 136x16 px (200u x 24u; 1,5 u/px)
- **Loop:** Sí: cadena tendida en loop de 6 cuadros con pulsos cada 600 ms.
- **Partículas / capas secundarias:** Polvo en las estacas.
- **Ícono 16x16:** dos estacas con una línea. (hoy: glifo píxel `barrier+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única estática y horizontal; la 1 se mueve, la 3 une a dos aliados, la definitiva es un anillo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Muro de asedio de Brakk y las Anclas de Iria: ladrillos y nodos con hilos; esta es una sola cadena.

### Hab. 3 - Custodia

- **Mecánica (código):** Elige un aliado (alcance 250 u): absorbe 25% de su daño con presupuesto máximo de 35% de la vida de Garren (50% con maestría) durante 5000 ms; solo, gana -12% daño recibido. Costo 30, cooldown 10000 ms. *(`data/portadores.js:34`, `portadores.js:124-132`, `:183-195`)*
- **Silueta y forma:** Una cadena fina de luz une a Garren con el aliado; sobre cada uno un candado con llave que se enciende cuando se redirige daño.
- **Color dominante:** Hueso `#e4dfc8` con oro viejo.
- **Movimiento:** La cadena ondula y se tensa; al redirigir daño, un eslabón brillante viaja del aliado a Garren.
- **Anticipación:** La llave gira en el aire, 3 cuadros.
- **Impacto:** Candado se cierra en cada uno con chispa, 3 cuadros.
- **Disipación:** Candado se abre y la cadena se disuelve, 3 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 3 = 9 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** candado 32x40 u -> 24x32 px (x2) + cadena de unión 250 u de largo, tile 16 px
- **Loop:** Sí: cadena y candados en loop de 8 cuadros durante 5000 ms.
- **Partículas / capas secundarias:** Eslabones de luz que viajan por la cadena.
- **Ícono 16x16:** candado con una flecha hacia arriba. (hoy: glifo píxel `padlock+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que une a dos personajes y la única de color hueso/oro; las otras son grises.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Custodia... y a Visión del Inmortal de Profeta (protección a un aliado): aquella es una luz dorada con ojo; esta es un candado con cadena.

### Definitiva - Nadie Queda Atrás

- **Mecánica (código):** Anillo móvil de radio 190 u durante 6500 ms: cada 650 ms daña 40%, empuja 25 u y ralentiza 25% 700 ms; los aliados dentro reciben -15% de daño; su velocidad cae 20%. Sin costo, cooldown 35000 ms. *(`data/portadores.js:35`, `portadores.js:133`, `:205`, tick `:234`)*
- **Silueta y forma:** Un cinturón de eslabones gigantes que gira alrededor de Garren; cada 650 ms sobre él se abren puertas de celda en el suelo y de ellas salen cadenas rotas que dibujan una estrella de puertas abiertas.
- **Color dominante:** Gris acero `#9195a1`, hueso `#e4dfc8`, oro viejo `#d8b868` en las llaves, destello azul pálido `#d3dff5`.
- **Movimiento:** El anillo gira lento (una vuelta por 3000 ms); en cada pulso las celdas "se abren" y las cadenas saltan hacia afuera.
- **Anticipación:** Pose de 650 ms: Garren sacude la llave del juramento y la cadena se despliega, 6 cuadros.
- **Impacto:** 10 pulsos (6500 ms / 650 ms): cada uno 3 cuadros de apertura de celda.
- **Disipación:** El anillo se afloja, cae y se desvanece, 6 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 10 + disipación 6 = 22 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 192x192 px (diámetro 380u = 2 x r 190u; 2 u/px)
- **Loop:** Sí: anillo en loop de 8 cuadros durante 6500 ms.
- **Partículas / capas secundarias:** Llaves doradas que flotan, eslabones sueltos, barrotes que se abren.
- **Ícono 16x16:** cadena circular. (hoy: glifo píxel `chain+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con puertas de celda abiertas y un anillo continuo de eslabones; las otras cuatro son líneas o candado.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Vigilia del Farolero y Santa Paciencia de Ynara (zonas móviles): círculo de luz y santuario de luz; este es un anillo de eslabones de metal.

### Pasiva - Contrapeso

- **Mecánica (código):** Controlar a un enemigo concede 12% de resistencia durante 1,6 s, con 2,2 s de espera interna; no acumula (`js/data/portadores-lore.js:27`; código `portadores.js:41` y `:198`).
- **Arte:** No se verificó un indicador visible. Sugerencia: un eslabón brillante que gira sobre el hombro durante los 1600 ms de resistencia.
