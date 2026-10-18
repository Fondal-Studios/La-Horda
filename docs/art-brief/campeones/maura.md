# Maura, la Pastora de Espinas (`maura`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Tanque de avance (rol tanque, protección y apertura de caminos, melee). Tono: pragmático y cuidadoso; "de a uno, yo cierro la fila". Lenguaje: cayado de zarza, corteza, espina, semilla, vereda.
- **Paleta sugerida:** oliva `#879c60` (color de clase, `expedition/catalog.js:25`), verde oscuro `#4a5a30`, claro `#cfe0a0`, rojo seco `#8b3a2a` (atlas `#542424`), corteza `#6c5424`, rosa de espina `#d86a8a` (acento), contorno `#1a2010`.
- **Motivos visuales:** zarza con espinas largas, corteza agrietada, semillas, rosas rígidas, cayado curvo, vereda estrecha.
- **NO debe parecerse a:** **Sylva** (verde vivo con flechas y hojas); **Morveth** (verde enfermo con púrpura y hongos); **Khepri** (esmeralda iridiscente de insectos); **Baltra/Brakk** (los otros tanques de expedición, bronce y ladrillo): Maura es madera, espina y oliva, SIN metal.
- **Estado actual del VFX (verificado en código):** Tema procedural `thorn` (`themes.js:27`, forma `petal`, motivos thorn/seed/vine/leaf). `skill-fx-a/c/maura.js`: Raíces = haz, Corteza = nova + aura, Poda = nova, definitiva = nova. Las semillas se muestran como puntos "•" sobre la cabeza (`expedition/render.js:34`).
- **Fuentes del kit:** `js/champions/expedition/catalog.js:25-30`, lanzamiento `expedition/runtime.js:45-48`, pulsos `:17`, premarcado `aim-targeting.js:69`.

## B. Habilidades

### Básico - Cayado de zarza

- **Mecánica (código):** Golpe cuerpo a cuerpo; alcance 86 u, cooldown 590 ms (arma: Cayado de zarza). Los impactos directos generan semillas. *(`expedition/catalog.js:25` (`stats [152,9,.18,150,86,590,false]`))*
- **Silueta y forma:** Arco de cayado (86 u) con la punta de zarza que deja 2 espinas clavadas un instante.
- **Color dominante:** Oliva `#879c60` con espinas `#8b3a2a`.
- **Movimiento:** Golpe curvo de lado a lado, algo lento.
- **Anticipación:** Cayado atrás, 2 cuadros.
- **Impacto:** Golpe y espinas, 3 cuadros.
- **Disipación:** Una semilla rueda un instante.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros
- **Tamaño sugerido del asset (px nativos):** 64x88 px (radio 86u, ancho de boca 129u, arco 97 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Una semilla por impacto (visible un instante).
- **Ícono 16x16:** cayado con espina. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Arco de madera con semilla; las habilidades son raíces, corteza, tijera y bosque.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Puño de bastión de Bront y el Martillazo de Brakk: acero y ladrillo; este es madera con espinas.

### Hab. 1 - Raíces de paso

- **Mecánica (código):** Línea de raíces (alcance 245 u, colisión ≤26 u del eje): daño 350%, ralentiza 30% 1400 ms y deja una zona de espinas de radio 70 u en el punto durante 2400 ms (máx. 2). Costo 25, cooldown 6500 ms. *(`catalog.js:30`, `runtime.js:45`, premarcado `aim-targeting.js:69`)*
- **Silueta y forma:** Raíces gruesas que brotan una tras otra a lo largo de 245 u, trazando un camino; al final un matorral de espinas de 70 u de radio.
- **Color dominante:** Verde oscuro `#4a5a30` con raíces `#6c5424` y espinas rojo seco.
- **Movimiento:** Las raíces corren desde sus pies hacia la punta en ~150 ms con un retardo escalonado y quedan clavadas; el matorral crece en 300 ms.
- **Anticipación:** Tierra que se agrieta en línea, 3 cuadros.
- **Impacto:** Raíces salen en cadena, 4 cuadros.
- **Disipación:** Raíces se retraen y el matorral se seca (2400 ms), 5 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 5 = 12 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** camino de raíces 245x52 u -> 168x40 px + matorral Ø(140 u) = 96x96 px
- **Loop:** Sí: el matorral de espinas en loop de 6 cuadros durante 2400 ms.
- **Partículas / capas secundarias:** Tierra levantada, hojas muertas.
- **Ícono 16x16:** raíces con una flecha. (hoy: glifo píxel `roots+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única línea de raíces; la 2 es corteza en el cuerpo y la 3 una tijera circular.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Trampa del Bosque de Sylva y Línea Infranqueable de Garren (control de suelo): cepo circular y cadena; esta es una línea de raíces con espinas.

### Hab. 2 - Corteza prestada

- **Mecánica (código):** Escudo de 10% de su vida durante 4000 ms; al expirar libera una única descarga de radio 95 u (daño 157%) si sigue viva. Costo 28, cooldown 11500 ms. *(`catalog.js:30`, `runtime.js:46`)*
- **Silueta y forma:** Corteza agrietada que le cubre hombros, pecho y brazos con grietas que dejan ver savia roja; al estallar, una corona de espinas sale en todas direcciones.
- **Color dominante:** Corteza `#6c5424` y verde oscuro `#4a5a30`, savia roja `#8b3a2a`.
- **Movimiento:** La corteza crece pedazo a pedazo; las grietas brillan según el escudo restante; al final se abre y dispara espinas radiales.
- **Anticipación:** La corteza sube por el cuerpo, 4 cuadros.
- **Impacto:** Armadura completa, 2 cuadros.
- **Disipación:** Descarga: anillo de espinas de 95 u, 4 cuadros; la corteza cae.
- **Cuadros sugeridos:** anticipación 4 + impacto 2 + disipación 4 = 10 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 64x80 px (96u x 112u; 1,5 u/px)
- **Loop:** Sí: armadura en loop de 8 cuadros durante 4000 ms.
- **Partículas / capas secundarias:** Astillas, savia.
- **Ícono 16x16:** tronco con una flecha arriba. (hoy: glifo píxel `bark+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única armadura de madera y la única con descarga al final.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Caparazón Vivo de Khepri y Piel de Duna de Ilkan: insectos iridiscentes y arena; esta es corteza vegetal con savia.

### Hab. 3 - Poda necesaria

- **Mecánica (código):** Corte circular a su alrededor (radio 110 u, daño 315%); consume las semillas y se cura 1% por semilla (máx. 5%). Costo 26, cooldown 8000 ms. *(`catalog.js:30`, `runtime.js:47`)*
- **Silueta y forma:** Unas tijeras de podar enormes, de madera y hoja verde, cierran en un giro de 360° alrededor de ella, cortando zarzas y soltando pétalos rojos; las semillas vuelan a su pecho.
- **Color dominante:** Verde claro `#cfe0a0` con filo y pétalos rojo seco.
- **Movimiento:** Las hojas giran una vuelta completa en 250 ms y cierran con un chasquido; los pétalos salen como confeti.
- **Anticipación:** Las tijeras se abren, 3 cuadros.
- **Impacto:** Giro y corte circular, 4 cuadros.
- **Disipación:** Pétalos y hojas caen, las semillas entran a Maura con un destello verde, 5 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 5 = 12 cuadros
- **Tamaño sugerido del asset (px nativos):** 152x152 px (diámetro 220u = 2 x r 110u; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Pétalos rojos, semillas que vuelan hacia el pecho.
- **Ícono 16x16:** tijeras de podar con una X. (hoy: glifo píxel `shears+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única en que la figura (tijeras) gira 360°; las otras son líneas, armaduras o pulsos.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Corte de Hilo de Iria y Tajo del Segador: tijera de luz lila y tajo rojo ancho; esta es una tijera de podar verde con pétalos.

### Definitiva - El bosque camina

- **Mecánica (código):** Seis pulsos móviles de espinas durante 4800 ms (uno cada 800 ms), radio 135 u alrededor de ella, daño 112% por pulso; no aumenta su hitbox ni crea un ejército. Sin costo, cooldown 36000 ms. *(`catalog.js:30`, `runtime.js:48`, `exPulse` `runtime.js:17`)*
- **Silueta y forma:** Seis arbolitos espinosos (40x72 u) brotan en círculo alrededor de ella y la acompañan caminando (balanceando su copa); cada 800 ms un anillo de zarzas se expande a 135 u y retrocede.
- **Color dominante:** Verde oscuro `#4a5a30`, oliva `#879c60`, espinas `#8b3a2a`, rosas `#d86a8a` en las copas.
- **Movimiento:** Los árboles brotan en 400 ms, se mueven con ella y balancean las ramas; cada pulso un anillo de zarzas sale y vuelve.
- **Anticipación:** Pose de 650 ms: planta el cayado y los arbolitos brotan, 6 cuadros.
- **Impacto:** Seis pulsos de 3 cuadros (18 cuadros).
- **Disipación:** Los árboles se marchitan y se hunden, 6 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 18 + disipación 6 = 30 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 184x184 px (diámetro 270u = 2 x r 135u; 1,5 u/px)
- **Loop:** Sí: arbolitos que caminan en loop de 8 cuadros durante 4800 ms.
- **Partículas / capas secundarias:** Hojas, rosas rígidas, zarzas que ondulan, vibración suave.
- **Ícono 16x16:** árbol con una flecha. (hoy: glifo píxel `tree+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con un bosque que se mueve con el personaje; los pulsos son de zarza.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Jardín de la peste de Morveth y Cielo de Plumas de Saelis (zonas con vegetación o plumas): hongos púrpuras y plumas celestes; este son árboles espinosos oliva en marcha.

### Pasiva - Semillero

- **Mecánica (código):** Los impactos directos generan hasta 5 semillas (como máximo una cada 500 ms) que luego consume Poda necesaria; hoy se muestran como puntos sobre la cabeza (`expedition/catalog.js:25`, `render.js:34`).
- **Arte:** Sustituir los puntos por 5 semillas de 4 px en arco sobre el hombro que se encienden de a una (oliva → rojo seco) y vuelan al pecho al gastarse.
