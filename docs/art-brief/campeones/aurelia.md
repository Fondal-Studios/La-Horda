# Aurelia, la Arquitecta Solar (`aurelia`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Maga constructora (rol mago, área y control, a distancia). Tono: sereno, geométrico y solemne; planos de luz sólida con una puerta siempre abierta. Lenguaje: prisma, nodo, triángulo, catedral.
- **Paleta sugerida:** oro `#f2c14e` (color de clase, `ascension/catalog.js:43`), oro claro `#ffe69a`, blanco solar `#fffbe8`, ámbar oscuro `#a86a12`, contorno `#3a2400`, y SOLO en los bordes de dispersión: cian `#7fe3ff` y magenta `#ff7ad9` (luz partida por el prisma). (Atlas medido: oro `#cc9c3c` y `#e4b454`, sombras `#9c6c24`.)
- **Motivos visuales:** prismas y octaedros de cristal sólido, haces rectos que rebotan a 60°, hexágonos, compás, arcos ojivales y rosetón de catedral, dispersión espectral en los bordes.
- **NO debe parecerse a:** **Iria** (también triángulos: Aurelia es oro con VOLUMEN y relleno de luz, Iria es índigo con líneas finas e hilos); **Farolero** (llama cálida y polillas); **Dáriel** (ocre con notas); **Brakk** (arena/ladrillo); **Libertador** (sol de mayo): el oro de Aurelia es frío-brillante, nunca naranja.
- **Estado actual del VFX (verificado en código):** Tema procedural `prism` (`themes.js:8`, forma `hex`, motivos prism/diamond/ray/spark). `skill-fx-a/c/aurelia.js`: hab. 1 y definitiva = nova, hab. 2 = línea, hab. 3 = línea ancha (dash). La catedral reutiliza la nova (`SFA_OBJ.as_cathedral`).
- **Fuentes del kit:** `js/champions/ascension/catalog.js:43-54` (stats y kit), `ascension/runtime.js:116-125` (lanzamiento), `:214` (catedral), `:271` (triángulo de nodos), premarcado `js/skills/aim-targeting.js:54-55`, proyectil `ascension/register.js:10`.

## B. Habilidades

### Básico - Disparo de prisma

- **Mecánica (código):** Proyectil a distancia; alcance 310 u, cooldown 520 ms; estilo de proyectil `prism`. *(`ascension/catalog.js:43`, `ascension/register.js:10`)*
- **Silueta y forma:** Prisma triangular de cristal (12x14 u) que rota sobre su eje mientras vuela.
- **Color dominante:** Oro claro `#ffe69a` con filo blanco.
- **Movimiento:** Vuelo recto con giro lento; deja una línea fina de dispersión cian-magenta de 1 px.
- **Anticipación:** Destello dorado en la mano, 2 cuadros.
- **Impacto:** Al impactar: chispa de 5 rayos y un rombo de luz, 3 cuadros.
- **Disipación:** Rombo se parte en 2 triangulitos que caen.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 24x24 px (36u x 36u; 1,5 u/px)
- **Loop:** Proyectil en loop de 4 cuadros.
- **Partículas / capas secundarias:** Línea de dispersión espectral (la única aparición de cian/magenta en un ataque básico del roster).
- **Ícono 16x16:** triángulo/prisma con un rayo. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Pequeño, dorado y triangular; las habilidades son nodos altos, haces anchos o estructuras grandes.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Flecha de Cazadora y Hoces de Ilkan: la flecha es alargada y verde, las hoces un arco; el prisma es compacto y facetado.

### Hab. 1 - Prisma

- **Mecánica (código):** Cristaliza un Nodo Solar en el punto elegido (alcance 280 u, tope 420 u) con un estallido de radio 40 u; el nodo dura hasta 9000 ms y se acumulan 3 como máximo (radio del nodo 16 u). Costo 22, cooldown 4200 ms. *(`ascension/catalog.js:51`, `runtime.js:116`, premarcado `aim-targeting.js:54`)*
- **Silueta y forma:** Octaedro de cristal dorado (rombo alto, 28x44 u) que flota sobre su punto, con una base de anillo hexagonal fina.
- **Color dominante:** Oro saturado `#f2c14e`.
- **Movimiento:** Cae una gota de luz desde arriba, se solidifica y queda flotando con vaivén de ±3 px y un giro lento de brillo.
- **Anticipación:** Gota de luz que cae, 3 cuadros (~250 ms).
- **Impacto:** Cristalización: 4 aristas se rellenan de luz y estallido de 40 u, 3 cuadros.
- **Disipación:** Al expirar (9000 ms) el nodo se fractura en 3 esquirlas y se apaga, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 32x48 px (40u x 64u; 1,5 u/px)
- **Loop:** Sí: el nodo en loop de 8 cuadros mientras vive (hasta 9000 ms). El estallido de 40 u es un asset aparte de Ø56 px.
- **Partículas / capas secundarias:** Destellos en cruz en las aristas; polvo dorado que sube lento.
- **Ícono 16x16:** rombo/octaedro dorado flotando sobre una base. (hoy: glifo píxel `prism+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es un OBJETO persistente vertical; las demás son haz, desplazamiento y estructura.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Farol de Guardia de Farolero y las Anclas de Iria (objetos puntuales): el farol es llama dentro de vidrio, el ancla un nodo plano índigo; este es cristal facetado dorado.

### Hab. 2 - Refracción

- **Mecánica (código):** Rayo en línea (alcance 340 u, tope 420 u, ancho de premarcado 24 u); cada nodo a ≤40 u de la línea refracta un segundo rayo al enemigo más cercano a ≤260 u (60% del daño, visible 300 ms). Costo 26, cooldown 6400 ms. *(`catalog.js:52`, `runtime.js:117-119`, premarcado `aim-targeting.js:54`)*
- **Silueta y forma:** Haz recto de luz blanca con núcleo fino y dos filamentos de dispersión (cian y magenta) en los bordes; en cada nodo se quiebra en ángulo de 60°.
- **Color dominante:** Blanco dorado `#fffbe8` con borde `#ffe69a`.
- **Movimiento:** Se dispara instantáneo y "respira" (ancho +20%) 2 cuadros; los rayos refractados se encienden 300 ms después en cadena nodo a nodo.
- **Anticipación:** Línea de 1 px brilla en el trayecto, 2 cuadros (~170 ms).
- **Impacto:** Haz completo y quiebres, 4 cuadros.
- **Disipación:** Los filamentos se separan abriéndose como abanico y se apagan, 4 cuadros.
- **Cuadros sugeridos:** anticipación 2 + impacto 4 + disipación 4 = 10 cuadros
- **Tamaño sugerido del asset (px nativos):** 232x32 px (340u x 48u; 1,5 u/px)
- **Loop:** No (el quiebre es una pieza corta de ~120x24 px reutilizable).
- **Partículas / capas secundarias:** Motas de prisma en cada quiebre; pequeño arco iris de 8 px en el nodo tocado.
- **Ícono 16x16:** rayo recto que se parte en dos. (hoy: glifo píxel `rays+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única pieza blanca y lineal del kit; la 1 es dorada vertical, la 3 un trazo de desplazamiento, la definitiva un edificio.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Fractura de segundos de Aelith y Estrella Errante de Vhal (líneas): aquellas son una grieta dentada y un proyectil con cola; Refracción es un haz liso con quiebres geométricos y borde espectral.

### Hab. 3 - Paso Luminal

- **Mecánica (código):** Se traslada al nodo más lejano (o al punto elegido si no hay nodos; alcance 320 u, tope 420 u), deja un nodo nuevo donde estaba y estalla en radio 90 u al llegar; ella y los aliados a ≤160 u ganan +15% de daño durante 4000 ms ("LUZ SÓLIDA"). Costo 24, cooldown 8800 ms. *(`catalog.js:53`, `runtime.js:120-121`, premarcado `aim-targeting.js:55`)*
- **Silueta y forma:** Desmaterialización: la silueta se corta en líneas horizontales de luz (scanlines) que viajan al destino y se recomponen; en el destino un destello hexagonal de 90 u; los aliados reciben un halo hexagonal dorado.
- **Color dominante:** Ámbar solar `#e4b454` con trazos blancos.
- **Movimiento:** Origen: se desarma de arriba hacia abajo; trayecto: ráfaga horizontal; destino: se arma de abajo hacia arriba. Aliados: halo hexagonal que gira lento 4000 ms.
- **Anticipación:** Silueta se divide en 4 bandas de luz, 3 cuadros (~250 ms).
- **Impacto:** Llegada con destello hexagonal de Ø120 px, 4 cuadros.
- **Disipación:** Las bandas se disipan; el halo de aliados se apaga en 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** trayecto 320x60 u -> 216x40 px (1,5 u/px) + llegada Ø120 px (r=90 u) + halo de aliado Ø64 px
- **Loop:** Solo el halo de aliados (loop 6 cuadros, 4000 ms); trayecto y llegada son de una pasada.
- **Partículas / capas secundarias:** Motas hexagonales sueltas en la trayectoria; un nodo nuevo "nace" en el origen (reutiliza la pieza de Prisma).
- **Ícono 16x16:** zapato/paso con un destello solar. (hoy: glifo píxel `sunstep+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que mueve al personaje y la única que se ve en aliados; sus colores son más cálidos que Refracción.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Teletransporte de Axiom e Inversión de Nano GM: Axiom pixela en cian y Nano usa runa blanca/negra; este se parte en bandas doradas y deja un nodo cristal.

### Definitiva - Catedral del Sol

- **Mecánica (código):** Los 3 nodos se elevan en una catedral geométrica; radio 170 u (tope 480 u en definitiva) durante 6500 ms, pulsos cada 700 ms que dañan dentro del triángulo o a ≤ r/2 y curan 1,5% de vida máxima a aliados. Sin nodos, crea 3 alrededor del punto (alcance 200 u, 140 u del centro). Sin costo, cooldown 40000 ms. *(`catalog.js:54`, `runtime.js:122-125,214`, premarcado `aim-targeting.js:55`)*
- **Silueta y forma:** Catedral de luz: tres columnas verticales (una por nodo, 40x140 u) unidas por arcos ojivales; en el centro un rosetón circular que gira con rayos solares. El suelo del triángulo se rellena de luz dorada.
- **Color dominante:** Oro blanco `#fffbe8` y oro `#f2c14e`, con vitral cian/magenta SOLO en el rosetón.
- **Movimiento:** Las columnas suben en ~600 ms, los arcos se cierran, el rosetón gira lento y lanza un pulso de luz cada 700 ms (9 pulsos en 6500 ms).
- **Anticipación:** Los nodos laten y se unen con hilos de luz en el suelo, 6 cuadros (~650 ms, pose de definitiva).
- **Impacto:** Ascenso de columnas y cierre de arcos, 8 cuadros; luego pulsos.
- **Disipación:** Las columnas se desvanecen hacia arriba en luz y el rosetón se parte en cuñas, 8 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 8 + disipación 8 = 22 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 232x232 px (diámetro 340u = 2 x r 170u; 1,5 u/px)
- **Loop:** Sí: rosetón y pulsos en loop de 8 cuadros mientras dura; ascenso y cierre de una pasada.
- **Partículas / capas secundarias:** Polvo de luz que sube por las columnas; haces verticales finos; sacudida breve al asentarse.
- **Ícono 16x16:** catedral con rosetón y tres torres. (hoy: glifo píxel `sun+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** La única estructura vertical con volumen (3 columnas + arcos + rosetón); sus compañeras son plano o línea.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Sello de los Tres Caminos de Iria (triángulo): el de Iria es plano, de líneas índigo finas; la catedral es oro con volumen y rosetón. Frente a Ciudadela de Bront: aquella son muros de acero azul.

### Pasiva - Convergencia

- **Mecánica (código):** Con 3 Nodos Solares vivos se forma un triángulo cada 500 ms de chequeo que daña y frena a los enemigos dentro (no se crea si hay una catedral activa) (`ascension/runtime.js:271`; texto `catalog.js:43`).
- **Arte:** Hilos de luz dorada fina (3 px) entre los 3 nodos que pulsan lento, con relleno al 15% de alfa dentro del triángulo (loop 8 cuadros). Debe leerse como "plano" delgado, claramente menos pesado que la Catedral.
