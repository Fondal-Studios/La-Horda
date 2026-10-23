# Axiom, el Reescritor (`axiom`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Mago de reglas (rol mago, daño de área y control, a distancia). Tono: frío, extraño, glitcheado; no lanza hechizos, reescribe la realidad. Lenguaje: ventanas de error, píxeles cuadrados, scanlines, separación RGB.
- **Paleta sugerida:** turquesa `#3ad6c4` (color de clase, `champions.js:100`), cian claro `#9df5ea`, azul eléctrico `#5aa8d8`/`#5ac8ff` (teletransporte, `abilities.js:752`), magenta de falla `#ff4fd8`, negro azulado `#06161a`/`#24243c` (atlas), blanco `#ffffff`.
- **Motivos visuales:** bloques cuadrados de 4-8 px, ventanas de sistema con barra de título, cursores, scanlines, desplazamiento RGB (cian/magenta), dígitos hexadecimales, inversión de color.
- **NO debe parecerse a:** **Aelith** (relojes y lavanda); **Mago/Thalen** (rayos y elementos); **Aurelia** (facetas doradas); **Iria** (hilos). Evitar cualquier curva suave: todo en bloques y rectas.
- **Estado actual del VFX (verificado en código):** Tema procedural `glitch` (`themes.js:8`, forma `glitch`). `skill-fx-a/c/axiom.js`: hab. 1 = estallido, hab. 2 = rayos de cadena, hab. 3 = trazo dash, definitiva = nova de r=230. Además existen PNG propios en `assets/vfx/axiom/` (`err404`, `overwrite`, `teleport_in/out`, `forcequit`) y la zona punteada turquesa de `axiom.js:drawAxiomZones`. Ya hay inversión de color de pantalla durante Force Quit (`abilities.js:775`, `axiomForceQuitFlash`).
- **Fuentes del kit:** `js/data/champions.js:99-120` (kit y stats), `js/skills/abilities.js:687-766` (Error 404, Sobrescribir, Teletransporte, Force Quit :767-800), `js/champions/axiom.js:1-54`, `aim-targeting.js:17,21,31`.

## B. Habilidades

### Básico - Paquete Corrupto

- **Mecánica (código):** Disparo a distancia contra el enemigo más cercano; alcance 340 u, cooldown 540 ms. *(`champions.js:110`, `champion-identity.js:51`)*
- **Silueta y forma:** Cubo de datos de 8x8 px que parpadea entre dos desplazamientos RGB (cian y magenta).
- **Color dominante:** Cian claro `#9df5ea`.
- **Movimiento:** Avanza a saltos de 3 px (no suave) y a veces "pierde" un cuadro (paquete caído).
- **Anticipación:** Cursor parpadeando en la mano, 2 cuadros.
- **Impacto:** Al llegar: el cubo se descompone en 4 bloques de 3 px, 3 cuadros.
- **Disipación:** Los bloques caen y se apagan por scanlines.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 3 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 24x24 px (36u x 36u; 1,5 u/px)
- **Loop:** Proyectil en loop de 3 cuadros.
- **Partículas / capas secundarias:** Estela de 2 bloques que se pierden; sin glow suave.
- **Ícono 16x16:** cubo pixelado con un punto de color. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Pequeño, cuadrado y cian claro: las habilidades usan rectángulo/ventana, cadena magenta, trazo azul o negativo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Proyectil Arcano de Mago y Segundo robado de Aelith: orbe redondo y gota; aquí todo es cuadrado y entrecortado.

### Hab. 1 - Error 404

- **Mecánica (código):** Marca una zona (alcance 200 u, radio 130 u) y tras 900 ms colapsa: daño 150% y ralentiza 35% durante 1800 ms. Costo 38, cooldown 8500 ms. *(`champions.js:115`, `abilities.js:687-706`, `axiom.js:7-11,26-31`, premarcado `aim-targeting.js:17`)*
- **Silueta y forma:** Ventana de sistema (rectángulo con barra de título y un "!" de 8 px) proyectada en el suelo dentro del círculo de 130 u; el borde circular va punteado.
- **Color dominante:** Turquesa `#3ad6c4` con blanco en el marco.
- **Movimiento:** Durante los 900 ms reales la ventana parpadea cada vez más rápido y se "desfasa" en RGB; al cumplirse colapsa hacia el centro en bloques.
- **Anticipación:** 900 ms de demora real (`champions.js:115`, `delay:900`): loop de parpadeo de 6 cuadros que acelera.
- **Impacto:** Colapso: bloques de 8 px convergen y estallan, anillo cuadrado de choque, 5 cuadros.
- **Disipación:** Los bloques se esparcen y se apagan; los enemigos ralentizados arrastran un "lag" (cuadro duplicado) durante 1800 ms, 5 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 5 + disipación 5 = 16 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 176x176 px (diámetro 260u = 2 x r 130u; 1,5 u/px)
- **Loop:** Sí: la ventana de demora en loop de 6 cuadros (900 ms); colapso y disipación de una pasada.
- **Partículas / capas secundarias:** Texto "404" de 12x5 px que se descompone; bloques desplazados.
- **Ícono 16x16:** ventana con un triángulo de advertencia. (hoy: glifo píxel `glitch+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única zona con demora y forma de ventana rectangular; Sobrescribir es una cadena, Teletransporte un salto, Force Quit un negativo de pantalla.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Instante roto de Aelith (zona con eco) y Lluvia de la Cazadora (zona con demora de 900 ms): aquellas son disco con reloj y lluvia de flechas; esta es una ventana de error cuadrada.

### Hab. 2 - Sobrescribir

- **Mecánica (código):** Infecta al enemigo objetivo (alcance 300 u) y salta a 2 más (+ bonus) en radio 220 u con 88% de daño por salto; sangrado 2600 ms; ejecuta a comunes por debajo de 18% de vida (x2,2). Costo 40, cooldown 9200 ms. *(`champions.js:116`, `abilities.js:708-740`, premarcado `aim-targeting.js:31`)*
- **Silueta y forma:** Cadena quebrada de bloques magenta que une a los enemigos (línea en escuadra, no curva) con un cursor-flecha en cada eslabón; el infectado lleva una etiqueta "{ }".
- **Color dominante:** Magenta de falla `#ff4fd8` con cian de contraste.
- **Movimiento:** El código viaja de enemigo en enemigo en saltos de ~150 ms; el sangrado son dígitos hex que gotean hacia abajo del infectado.
- **Anticipación:** Cursor se posa sobre el objetivo y parpadea, 3 cuadros.
- **Impacto:** Cada salto: línea de bloques + flash magenta, 4 cuadros por enlace.
- **Disipación:** Los dígitos del sangrado caen y se pierden (loop 4 cuadros mientras sangra 2600 ms) y luego se apagan.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** cadena: tile de 16 px de ancho repetible a lo largo de 220 u (~148 px por enlace) + cabeza Ø48 px en cada infectado
- **Loop:** Solo el goteo de dígitos (loop 4 cuadros); la cadena es de una pasada.
- **Partículas / capas secundarias:** Dígitos hexadecimales, cursores pequeños, bloques que se desprenden.
- **Ícono 16x16:** cursor-flecha con una chispa. (hoy: glifo píxel `cursor+spark`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Única con color magenta y única que enlaza varios objetivos; la 1 es cian en el suelo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Cadena de Relámpago de Mago: el rayo es amarillo y zigzaguea; esta es magenta, en escuadra y con cursores. Frente a Máscara Arrojada de Velmira (línea con efecto): sin rostros.

### Hab. 3 - Teletransporte

- **Mecánica (código):** Blink en la dirección que mira (alcance 280 u) con 250 ms de invulnerabilidad; casi sin cooldown al máximo. Anillo de salida de 36 u. Costo 24, cooldown 2500 ms. *(`champions.js:117`, `abilities.js:745-766`, premarcado `aim-targeting.js:21`)*
- **Silueta y forma:** Se pixela en una columna de bloques cuadrados en el origen (teleport_out) y se recompone de abajo hacia arriba en el destino (teleport_in), unidos por un trazo recto de 30 u.
- **Color dominante:** Azul eléctrico `#4f8cff` (distinto del cian `#5ac8ff` del anillo actual del juego, para que no se confunda con el cristal de Bront).
- **Movimiento:** Cuadros en vertical tipo barrido de monitor: 4 scanlines suben/bajan en 250 ms.
- **Anticipación:** Pixelado del personaje, 2 cuadros (~170 ms).
- **Impacto:** Reaparición con barrido de abajo hacia arriba, 3 cuadros.
- **Disipación:** Bloques residuales en el origen decaen, 3 cuadros.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros
- **Tamaño sugerido del asset (px nativos):** origen Ø48 px + destino Ø48 px + trazo 280x30 u (~188x24 px a 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Líneas de barrido horizontales; anillo de 36 u azul.
- **Ícono 16x16:** flecha en un portal cuadrado. (hoy: glifo píxel `portal+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Única azul eléctrico y única que tiene dos extremos (origen y destino).
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Paso Luminal de Aurelia y Paso Fantasma de Musashi: Aurelia dorado en bandas, Musashi con tinta y un cuerpo que atraviesa; este es un pixelado azul de monitor.

### Definitiva - Force Quit

- **Mecánica (código):** Durante 4000 ms todos menos Axiom quedan inmóviles (enemigos y aliados) y la pantalla se invierte; al terminar cae el daño de golpe en radio 230 u (160%, élites x0,55) centrado donde esté Axiom. Sin costo, cooldown 33000 ms. *(`champions.js:119`, `abilities.js:767-800`, estado de pantalla `axiomForceQuitFlash`)*
- **Silueta y forma:** Diálogo de sistema gigante (ventana con barra de título y botón X) del diámetro de la zona; la pantalla pasa a negativo; al cierre la ventana colapsa en bloques que implosionan y explotan.
- **Color dominante:** Negativo: blanco y negro con desplazamiento RGB cian/magenta; núcleo `#3ad6c4`.
- **Movimiento:** Congelamiento de 4000 ms con scanlines lentas; en los últimos 600 ms la ventana parpadea; el cierre implosiona y luego estalla hacia afuera con un anillo de bloques.
- **Anticipación:** Flash de negativo (120 ms) y la ventana se abre por trazos, 6 cuadros.
- **Impacto:** Cierre: implosión a un punto y estallido de bloques con anillo de choque de r=230 u, 8 cuadros.
- **Disipación:** Los bloques se esparcen; la pantalla vuelve a color con un barrido, 6 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 8 + disipación 6 = 20 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 232x232 px (diámetro 460u = 2 x r 230u; 2 u/px)
- **Loop:** Sí: la ventana sostenida en loop de 8 cuadros durante los 4000 ms; el resto de una pasada.
- **Partículas / capas secundarias:** Inversión de color de pantalla completa (ya implementada por el motor, no es arte), scanlines, sacudida corta al estallar.
- **Ícono 16x16:** botón de apagado dentro de una ventana. (hoy: glifo píxel `power+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** La única que cambia toda la pantalla (negativo) y no usa color propio; las otras cuatro son cian/magenta/azul sobre fondo normal.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Cataclismo Elemental de Mago y Colapso de Vhal (definitivas de área): aquellas son tormenta de elementos y estrella; esta es un congelamiento de sistema con negativo.

### Pasiva - Recompilar

- **Mecánica (código):** Las bajas con habilidades devuelven 3 de energía (máx. 15 por segundo) (`js/data/champion-tuning.js:74-80`, `CLASSIC_PASSIVES.axiom`).
- **Arte:** No se verificó un indicador visible. Opcional: un "+3" en bloques cian sobre la barra de energía; no requerido.
