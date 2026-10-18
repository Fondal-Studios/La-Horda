# Aelith, la Ladrona de Segundos (`aelith`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Maga temporal (rol mago, daño de área y control, a distancia). Tono: melancólico y preciso; una estación de relojes sin trenes, tiempo "robado" que se devuelve con intereses. Lenguaje: esfera de reloj, aguja, arena, eco.
- **Paleta sugerida:** lavanda `#bfa7dc` (color de clase, `quality-five/register.js:90`), ámbar de reloj `#eed5a4` (aguja que ya dibuja el juego, `aelith.js:65`), violeta de noche `#5a4a8c`, bronce `#f0c070`, crema `#fff8e0`, contorno `#1e1633`. (Atlas medido: castaños/crema con sombras `#3c2424`; el lavanda es la capa mágica, no el cuerpo.)
- **Motivos visuales:** esfera de reloj con 12 marcas, agujas que saltan de a un tic, arena que cae hacia arriba, engranaje fino, silueta fantasma duplicada ("eco"), grietas de vidrio de reloj.
- **NO debe parecerse a:** **Iria** (lavanda/índigo con triángulos e hilos: aquí NO hay triángulos ni líneas de hilo, solo círculos graduados y agujas); **Aurelia / Farolero / Dáriel** (dorado: el ámbar de Aelith es acento, nunca color dominante); **Brasa** (engranajes de latón con vapor: los de Aelith son finos, violetas y sin vapor); **Mago/Axiom** (cian/rayo).
- **Estado actual del VFX (verificado en código):** Tema procedural `time` (`js/champions/skill-fx-a/themes.js:6`, forma `sun`, motivos tick/sand/gear/spark) con plantillas genéricas: hab. 1 y definitiva = "nova" circular, hab. 2 = haz, hab. 3 = aura (`skill-fx-a/c/aelith.js`); más el anillo lavanda con aguja de `aelith.js:65`. Todas comparten el mismo arte base "nova": esta es la razón principal del rediseño.
- **Fuentes del kit:** `js/champions/quality-five/aelith.js` (kit :4-7, lanzamiento :14-41, objetos :43-58, premarcado :63-64), clase y pasiva `js/champions/quality-five/register.js:90`, básico `js/data/champion-identity.js:207-210`.

## B. Habilidades

### Básico - Segundo robado

- **Mecánica (código):** Disparo a distancia contra el enemigo más cercano; alcance 300 u, cooldown 560 ms (base mago). *(`quality-five/register.js:90`, `champion-identity.js:210`)*
- **Silueta y forma:** Gota de arena alargada (8x14 u) que va girando; deja 3 "tics" (puntos) que se apagan atrás.
- **Color dominante:** Lavanda claro con núcleo crema.
- **Movimiento:** Vuelo recto y rápido; los 3 puntos de estela parpadean como un segundero.
- **Anticipación:** Chispa de arena en la punta del cayado, 2 cuadros (~160 ms).
- **Impacto:** Al llegar: mini-dial de 8 u que marca 1 tic y salta una arenilla.
- **Disipación:** La arenilla cae hacia arriba y se desvanece.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 24x24 px (36u x 36u; 1,5 u/px)
- **Loop:** Proyectil en loop de 4 cuadros mientras vuela; el resto no.
- **Partículas / capas secundarias:** 3 partículas de arena en el impacto; sin capa extra para no competir con las habilidades.
- **Ícono 16x16:** gota/lágrima de arena inclinada con un punto de tic. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Es la única pieza pequeña y lavanda clara: las habilidades usan círculos graduados grandes, líneas o auras.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Proyectil Arcano de Mago y el Paquete Corrupto de Axiom: ellos son orbes/cubos de color pleno; el de Aelith es una gota alargada con tics, sin glow redondo.

### Hab. 1 - Instante roto

- **Mecánica (código):** Área circular de radio 75 u en un punto elegido (alcance 290 u, tope 350 u); daña al instante y deja un eco que repite 30% del daño tras 800 ms. Máximo 2 ecos. Costo 25, cooldown 6500 ms. *(`aelith.js:4,24-27,63`; eco `aelith.js:43-46`)*
- **Silueta y forma:** Esfera de reloj plana (disco con 12 marcas) cuyo borde es el radio de 75 u, con 3 grietas radiales de vidrio roto. El eco es el mismo dial en negativo (ámbar sobre violeta oscuro), más tenue, que queda esperando.
- **Color dominante:** Lavanda `#bfa7dc` con grietas ámbar `#eed5a4`.
- **Movimiento:** La aguja de minutos salta un tic al golpear; las grietas se abren de adentro hacia afuera. El eco "rebobina": sus cuadros van en reversa hasta el estallido.
- **Anticipación:** El juego da 420 ms de pose de lanzamiento (`aelith.js:18`): el dial se dibuja marca por marca (4 cuadros, ~330 ms).
- **Impacto:** Cuadro de golpe: dial brillante + aguja marcada + anillo de choque; 4 cuadros.
- **Disipación:** Las grietas se cierran y el dial se desarma en arena. El eco pendiente dura 800 ms reales (`aelith.js:27`): loop de espera y luego un segundo estallido más chico (usar la misma pieza al 70% de brillo).
- **Cuadros sugeridos:** anticipación 4 + impacto 4 + disipación 4 = 12 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 104x104 px (diámetro 150u = 2 x r 75u; 1,5 u/px)
- **Loop:** Sí, solo el eco en espera (8 cuadros en loop durante 800 ms); el resto es de una pasada.
- **Partículas / capas secundarias:** Granos de arena que suben; 2 engranajes fantasma de 12 u girando en sentidos opuestos en el eco.
- **Ícono 16x16:** esfera de reloj con una grieta en zigzag. (hoy: glifo píxel `clock+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es el único efecto con dial de disco completo en el suelo y con DOS tiempos (golpe + eco). La hab. 2 es una línea, la 3 un aura, la definitiva un dial 2,3 veces más grande.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Error 404 de Axiom (zona con demora): aquel es una ventana cuadrada con glitch cian; este es un círculo graduado lavanda con agujas. Frente a Nova de Escarcha de Mago: sin cristales ni azul.

### Hab. 2 - Fractura de segundos

- **Mecánica (código):** Línea de hasta 330 u (260 u de alcance base, tope 330), colisión a ≤26 u del eje; daña y ralentiza 35% durante 1800 ms. Costo 27, cooldown 8000 ms. *(`aelith.js:5,28-32,64`)*
- **Silueta y forma:** Rasgadura en el aire: una hendidura de bordes dentados (vidrio de reloj partido) con esquirlas de agujas y engranajes flotando dentro. Más estrecha que larga; la punta es afilada.
- **Color dominante:** Blanco lila frío `#d9c9f5` con núcleo blanco; bordes violeta `#5a4a8c`.
- **Movimiento:** Se abre desde la mano hasta la punta en un "zip" de ~150 ms y queda abierta; luego se cose de la punta hacia la mano.
- **Anticipación:** Línea finísima de 1 px recorre el trayecto (3 cuadros, ~250 ms dentro de los 420 ms de pose).
- **Impacto:** La hendidura se abre completa (4 cuadros) con destello en cada enemigo cruzado.
- **Disipación:** Los bordes se juntan como una cremallera, 5 cuadros. En los enemigos golpeados queda un ícono de "arena lenta" (loop 4 cuadros, 1800 ms, `aelith.js:29`).
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 5 = 12 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 224x40 px (330u x 52u; 1,5 u/px)
- **Loop:** No; solo el estado "lento" sobre enemigos es loop.
- **Partículas / capas secundarias:** Esquirlas de reloj (aguja, tuerca, resorte) que flotan 600 ms; polvo blanco en la punta.
- **Ícono 16x16:** cristal con raja diagonal y una chispa. (hoy: glifo píxel `crystal+spark`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Única pieza en línea (la 1 es disco, la 3 aura, la definitiva dial grande) y la única casi blanca.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Refracción de Aurelia y Sentencia Umbría de Nano GM (haces rectos): estos son haces lisos y rectos; Fractura es una grieta dentada con objetos flotando, no un rayo.

### Hab. 3 - Tiempo prestado

- **Mecánica (código):** Buff sobre sí misma: +25% velocidad y +10% armadura durante 3000 ms; al terminar sufre 15% de lentitud 800 ms ("deuda"). Con el talento `share` alcanza a aliados a 140 u. Costo 24, cooldown 12000 ms. *(`aelith.js:6,33-34,59-62`)*
- **Silueta y forma:** Aura de "estela": 3 siluetas fantasma del campeón (post-imágenes) detrás de ella y un anillo de segundero a sus pies.
- **Color dominante:** Ámbar arena `#f0c070` (única habilidad cálida del kit).
- **Movimiento:** Las post-imágenes se estiran hacia atrás al correr; la aguja del anillo da UNA vuelta completa en los 3000 ms. Al terminar las siluetas son jaladas de vuelta hacia ella y todo se apaga a gris (800 ms de deuda).
- **Anticipación:** Granos de arena que entran hacia el pecho, 3 cuadros (~250 ms).
- **Impacto:** Ráfaga de aire cálido y el anillo se enciende, 4 cuadros.
- **Disipación:** La deuda: las siluetas colapsan a ella con un tirón, 4 cuadros, color a gris lavanda.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 64x80 px (96u x 120u; 1,5 u/px)
- **Loop:** Sí: aura y anillo en loop de 8 cuadros durante 3000 ms.
- **Partículas / capas secundarias:** Post-imágenes con 40% de alfa en pasos de 60 ms; 6 granos de arena que giran.
- **Ícono 16x16:** bota con flecha hacia arriba y un punto de arena. (hoy: glifo píxel `boots+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Única habilidad ámbar y la única centrada en el propio personaje; no tiene área en el suelo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Marcha de salida de Dáriel y Grito de Caravana de Ilkan (buffs de velocidad): aquellos dibujan notas/pendones; este usa post-imágenes del propio campeón y un segundero.

### Definitiva - La hora imposible

- **Mecánica (código):** Círculo de radio 170 u en un punto (alcance 260 u, tope 350 u) durante 3600 ms con 3 pulsos (uno cada 1200 ms): cada pulso daña, ralentiza 45% (1300 ms) y da escudo 5% a aliados dentro. Bloquea la definitiva 3600 ms. Sin costo, cooldown 37000 ms. *(`aelith.js:7,35-38,43-58,63`)*
- **Silueta y forma:** Esfera de reloj colosal en el suelo con **13** numerales (la hora imposible), dos agujas enormes y engranajes verticales que emergen del borde. En el tercer pulso el vidrio del dial se resquebraja y las esquirlas caen hacia arriba.
- **Color dominante:** Violeta profundo `#5a4a8c` con agujas ámbar `#f0c070` y destellos blancos.
- **Movimiento:** Las agujas saltan 120° en cada pulso (3 pulsos = una vuelta); cada salto lanza una onda violeta y levanta arena en suspensión.
- **Anticipación:** Pose de definitiva de 650 ms (`aelith.js:18`): se trazan los 13 numerales y el borde (6 cuadros).
- **Impacto:** Tres golpes de 4 cuadros (uno por pulso, a los 0, 1200 y 2400 ms) más el resquebrajamiento final.
- **Disipación:** El dial se fractura y se desvanece en 6 cuadros; la arena queda flotando medio segundo.
- **Cuadros sugeridos:** anticipación 6 + impacto 12 + disipación 6 = 24 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 232x232 px (diámetro 340u = 2 x r 170u; 1,5 u/px)
- **Loop:** Sí: el dial sostenido en loop de 6 cuadros entre pulsos; pulsos y cierre son de una pasada.
- **Partículas / capas secundarias:** Engranajes gigantes de 60 u, arena suspendida, onda de choque que sacude la pantalla suave (el motor ya tiene `vfxShake`).
- **Ícono 16x16:** reloj de arena atravesado por un anillo. (hoy: glifo píxel `hourglass+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Único efecto con tres pulsos marcados y 13 numerales; ocupa un disco 2,3 veces mayor que el eco de la hab. 1.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a La Gran Cicatriz de Oriel y Colapso de Vhal (zonas grandes con centro oscuro): aquellas son vórtices/portales; esta es un dial legible con agujas, sin vacío central.

### Pasiva - Segundos hurtados

- **Mecánica (código):** Cada tercer lanzamiento resta 0,5 s a las otras habilidades activas (mínimo 1 s) (`aelith.js:21-22`; descripción en `register.js:90`).
- **Arte:** No se verificó un indicador visible propio en el código. Opcional (no requerido): un "tic" de arena de 4 cuadros sobre la barra de la habilidad cada vez que se roba tiempo.
