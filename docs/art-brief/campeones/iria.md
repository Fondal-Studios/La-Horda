# Iria, la Tejedora de Límites (`iria`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Control geométrico (rol mago, anclas, hilos y triángulos, a distancia). Tono: paciente, meticulosa, melancólica; sostiene puertas que alguien abrió desde adentro. Lenguaje: ancla, hilo, aguja, triángulo, tijera.
- **Paleta sugerida:** índigo `#8889c1` (color de clase, `data/portadores.js:53`), oscuro `#4e50a0`, lila claro `#e3e0ff`, azul medianoche `#24243c` (atlas), oro pálido `#ffd870` (nodos), firma triángulo `#b9b3ff`, contorno `#181830`.
- **Motivos visuales:** hilos finos tensos, nodos en rombo, triángulo de tres anclas, aguja rúnica, tijeras, puntadas.
- **NO debe parecerse a:** **Aelith** (lavanda con relojes: sin círculos graduados ni agujas de reloj); **Aurelia** (triángulos dorados con volumen: los de Iria son de línea fina índigo y SIN relleno sólido); **Vesper** (mitad B: hilo y tijeras ciruela — el icono de tijeras de Corte de Hilo y las puntadas son lo más cercano: Iria usa hilo recto de geometría, nunca puntadas de costura); **Velmira**.
- **Estado actual del VFX (verificado en código):** Tema procedural `thread` (`themes.js:20`, forma `tri`, motivos tri/node/thread/spark). `skill-fx-a/c/iria.js`: ancla = prop con motivo nodo + estallido, Tensión = nova, Corte = nova, definitiva = triángulo de teja de haz + nova 160. Los hilos entre anclas se dibujan con teja de haz (9 u en reposo, 18 u en tensión). Firma `triangle` `#b9b3ff` (`champion-signatures.js:10`).
- **Fuentes del kit:** `js/data/portadores.js:53-60`, lanzamiento `js/champions/portadores.js:155-180`, vínculos `:180-182`, tensión `:236`, triángulo `:261`, pasiva `data/portadores-lore.js:30`.

## B. Habilidades

### Básico - Aguja rúnica

- **Mecánica (código):** Disparo a distancia; alcance 320 u, cooldown 560 ms (arma: Aguja Rúnica). *(`data/portadores.js:53` (`range:320, basic:560, ranged:true`))*
- **Silueta y forma:** Aguja fina y larga (4x16 u) con un ojo en el extremo que deja un hilo de 1 px.
- **Color dominante:** Lila claro `#e3e0ff`.
- **Movimiento:** Vuelo recto y rápido; el hilo se tensa tras la aguja y se corta al impactar.
- **Anticipación:** Aguja y hilo salen de la mano, 2 cuadros.
- **Impacto:** Clavada con un nodo mínimo, 3 cuadros.
- **Disipación:** El hilo se enrosca y desaparece.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 3 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 24x24 px (36u x 36u; 1,5 u/px)
- **Loop:** Proyectil en loop de 3 cuadros.
- **Partículas / capas secundarias:** Hilo de 1 px.
- **Ícono 16x16:** aguja con hilo. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Fina y lineal; las habilidades son nodos, tensiones y triángulos.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Remachadora de Brasa y Segundo robado de Aelith: remache grueso y gota de arena; esta es una aguja fina.

### Hab. 1 - Ancla

- **Mecánica (código):** Coloca un sello (alcance 250 u, radio 30 u) durante 16000 ms, máx. 3; las anclas a ≤400 u se unen en orden con un hilo (no son paredes). Costo 16, cooldown 2200 ms. *(`data/portadores.js:56`, `portadores.js:155,180-182`, premarcado `js/skills/aim-targeting.js` (perfil `ir_anchor` r=30, `data/portadores-lore.js:20`))*
- **Silueta y forma:** Nodo en rombo (30x44 u) clavado al suelo con un anillo triangular fino a su alrededor y un hilo luminoso que lo une a las otras anclas.
- **Color dominante:** Índigo `#8889c1` con oro pálido `#ffd870` en el núcleo.
- **Movimiento:** Cae del aire clavándose, vibra y tensa el hilo con la ancla vecina; flota levemente.
- **Anticipación:** Cae una aguja con luz, 3 cuadros.
- **Impacto:** Se clava con anillo y nace el hilo, 3 cuadros.
- **Disipación:** Al vencer se afloja y se deshilacha, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 32x48 px (44u x 64u; 1,5 u/px)
- **Loop:** Sí: ancla en loop de 8 cuadros durante 16000 ms.
- **Partículas / capas secundarias:** Chispa de núcleo, anillo triangular, hilo con 3 nudos.
- **Ícono 16x16:** ancla con una X. (hoy: glifo píxel `anchor+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es el único objeto que se acumula (hasta 3) y define los vértices de las demás.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Nodo de Aurelia y las plumas de Saelis (objetos sembrados): cristal dorado y plumas; esta es un ancla índigo con hilos.

### Hab. 2 - Tensión

- **Mecánica (código):** Activa los hilos entre anclas durante 4500 ms: cada 550 ms daña 40%, ralentiza 35% 800 ms y marca (+8% daño 1500 ms) a quien los cruce (a ≤24 u); con menos de 2 anclas golpea una vez a ≤80 u de ella. Costo 28, cooldown 8000 ms. *(`data/portadores.js:57`, `portadores.js:156-160,236`)*
- **Silueta y forma:** Los hilos pasan de finos (9 u) a gruesos y luminosos (18 u), vibran como cuerdas de arpa con un destello que corre por cada hilo.
- **Color dominante:** Lila claro `#e3e0ff` brillando sobre índigo.
- **Movimiento:** Los hilos se tensan en 150 ms y vibran a 6 Hz; cada 550 ms un destello recorre de ancla a ancla.
- **Anticipación:** Los hilos se aprietan, 3 cuadros.
- **Impacto:** Vibración y destello en cada pulso, 3 cuadros (cada 550 ms).
- **Disipación:** Los hilos se aflojan, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 200x24 px (400u x 36u; 2 u/px)
- **Loop:** Sí: hilos tensos en loop de 6 cuadros durante 4500 ms.
- **Partículas / capas secundarias:** Ondas de vibración, chispas en los cruces.
- **Ícono 16x16:** rayo en zigzag con una puntada. (hoy: glifo píxel `stitch+bolt`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que transforma las anclas ya puestas; no crea objetos nuevos.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Línea Infranqueable de Garren (cadena que ralentiza): hierro y eslabones; esta son hilos vibrantes de luz.

### Hab. 3 - Corte de Hilo

- **Mecánica (código):** Consume el ancla más cercana al punto elegido (alcance 300 u, radio 75 u): golpea con daño 200% a los enemigos a ≤75 u del ancla o a ≤28 u de sus hilos, uno por enemigo. Sin anclas, área de 75 u con 60%. Costo 30, cooldown 9000 ms. *(`data/portadores.js:58`, `portadores.js:161-170`)*
- **Silueta y forma:** Una tijera gigante de luz (lila) corta el ancla; el nodo estalla en un destello de triángulos y los hilos se disparan hacia afuera como látigos.
- **Color dominante:** Blanco lila `#ffffff` con índigo.
- **Movimiento:** La tijera cierra en 80 ms; el nodo estalla y los hilos azotan en línea recta.
- **Anticipación:** Tijera se abre sobre el ancla, 3 cuadros.
- **Impacto:** Corte y estallido de triángulos, 3 cuadros.
- **Disipación:** Los hilos se enroscan y mueren, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros
- **Tamaño sugerido del asset (px nativos):** 104x104 px (diámetro 150u = 2 x r 75u; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Esquirlas triangulares, chispas.
- **Ícono 16x16:** tijeras con una X. (hoy: glifo píxel `scissors+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que destruye un objeto propio y la única con tijeras; la 2 conserva las anclas.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Desmontaje Rápido de Brasa (retira un objeto propio) y Poda necesaria de Maura (corte circular): llave y engranajes / tijeras de podar verdes; esta es una tijera de luz lila.

### Definitiva - Sello de los Tres Caminos

- **Mecánica (código):** Activa un triángulo entre 3 anclas válidas (cada lado <400 u) durante 6500 ms; sin 3 anclas crea uno propio pequeño (r=160 u). Cada 600 ms daña 55% y ralentiza 35% 800 ms a los enemigos dentro. No encierra ni desplaza. Sin costo, cooldown 36000 ms. *(`data/portadores.js:59`, `portadores.js:171-179,261`)*
- **Silueta y forma:** Un triángulo de líneas finas índigo con un símbolo de tres caminos (triskel) en el centro que gira; en los vértices tres agujas verticales de luz; el interior se llena de una trama de hilos cruzados.
- **Color dominante:** Índigo `#8889c1` con hilos blancos `#e3e0ff`, vértices oro `#ffd870`.
- **Movimiento:** Los tres lados se dibujan uno a uno (200 ms cada uno); el triskel gira una vuelta cada 3000 ms; la trama brilla en cada pulso (600 ms).
- **Anticipación:** Pose de 650 ms: los tres lados se dibujan, 6 cuadros.
- **Impacto:** Relleno de trama y pulso, 4 cuadros por pulso (10 pulsos).
- **Disipación:** Los hilos se deshilachan hacia los vértices, 6 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 10 + disipación 6 = 22 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 216x216 px (diámetro 320u = 2 x r 160u; 1,5 u/px)
- **Loop:** Sí: triskel y trama en loop de 8 cuadros durante 6500 ms.
- **Partículas / capas secundarias:** Nudos en los cruces, agujas en vértices, sacudida suave al cerrarse.
- **Ícono 16x16:** triskel con un anillo. (hoy: glifo píxel `triskele+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con un símbolo central giratorio y con vértices marcados; sin relleno sólido.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Catedral del Sol de Aurelia (triángulo de luz sólida) y El Gran Teatro de Velmira: oro con volumen y máscaras; esta es una trama fina índigo.

### Pasiva - Trama

- **Mecánica (código):** Hasta tres anclas se unen en orden con un máximo de 400 u por hilo; Tensión activa su daño y control; no son paredes (`data/portadores-lore.js:30`, `portadores.js:180-182`). El juego ya dibuja los hilos en reposo (9 u, 50% de alfa) y en tensión (18 u, 90%) (`skill-fx-a/c/iria.js:6`).
- **Arte:** Hilo de reposo: una sola línea de luz de 2 px con nudos cada 40 u; es la base de la que parten Tensión (más gruesa y vibrante) y el Sello (relleno).
