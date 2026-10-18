# Vhal — El Astrónomo Caído (`vhal`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Mago gravitatorio (`roleCategory: mago`), a distancia (básico 320 u, 560 ms). Acumula Masa (hasta 5) sobre los enemigos; con 3 o más atraen a los comunes cercanos, y el Colapso consume la Masa.
- **Tono:** Silencioso, obsesivo y trágico: un astrónomo de la torre de la Arena Gélida cuyo torso se abre a un cielo estrellado. Cosmos frío, estrellas pequeñas y nítidas, gravedad lenta.
- **Fuentes del kit:** `js/champions/ascension/catalog.js:79`; `js/champions/ascension/catalog.js:87`; `js/champions/ascension/runtime.js:138`; `js/champions/ascension/runtime.js:143`; pasiva en `js/champions/ascension/catalog.js:83`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/vhal/atlas.png`: azules `#303070`/`#505090`/`#5050b0`/`#305090`, índigo `#303050`. Color de clase `#6f7cf2`, brillo `#d9e1ff` (`ascension/catalog.js:79`). Astrolabio roto orbitando su mano.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Índigo claro (dominante) | `#6f7cf2` |
  | Blanco azulado (brillo y estrellas) | `#d9e1ff` |
  | Azul real (sombra) | `#3a44b0` |
  | Azul-noche (contorno y vacío) | `#0e1033` |
  | Dorado estelar (acento puntual) | `#ffe9a0` |
  | Violeta frío (sombra de gravedad) | `#5a3fa0` |

- **Motivos visuales:** estrellas de cinco puntas, polvo estelar, cometas, órbitas en arco, astrolabio, constelaciones unidas por líneas finas, discos de acreción, singularidad negra con anillo blanco.
- **Pasiva:** *Masa Crítica* (hasta 5 de Masa por enemigo durante 8 s; con 3+ atrae a comunes cercanos) no se dibuja hoy (no hay rastros en `ascension/render.js`). Recomendado, opcional: 1–5 puntitos de estrella en órbita sobre el enemigo con Masa.
- **NO debe parecerse a:** **Nano GM** (índigo-negro con oro, balanza): Vhal es azul cósmico con estrellas blanco-doradas. **Thalen** (púrpura arcano `#a15fc7`, hielo azul) y **Aelith** (lila `#bfa7dc`). **Facu GM** (azul mar, vórtices de agua): el Pozo de Vhal es un disco de estrellas, no un remolino de agua. **Axiom** (neón).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (cometa)

- **Mecánica (código):** A distancia: `basicRange` 320 u, enfriamiento 560 ms, proyectil `comet` (cometa) a 420 u/s, radio 8 u, vida 900 ms; pose 190 ms.
- **Tipo:** proyectil · **Fuente:** `js/champions/ascension/catalog.js:79`; `js/champions/ascension/register.js:10`; `js/skills/abilities.js:209`
- **Silueta y forma:** Un cometa mínimo (≈20 u): cabeza de estrella de 4 puntas y cola de polvo estelar de 3 puntos.
- **Color dominante:** Blanco azulado `#d9e1ff` con cola índigo `#6f7cf2`.
- **Movimiento:** Vuela recto, la cola se afina; la cabeza titila cada 2 cuadros.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de brillo en el astrolabio.
- **Impacto:** Destello de 17 u en cruz de estrella.
- **Disipación:** Polvo estelar cae en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Cometa: 20×12 u → **20×12 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es pequeño y con cola; la Estrella Errante es el mismo motivo en grande, con 26 u de ancho.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Proyectil de Nano GM (media luna bicolor) y de Oriel (llave): el cometa tiene cola.

### Habilidad 1 — Estrella Errante

- **Mecánica (código):** `star_bolt`: línea de 360 u (premarcado `line` de 24 u; el golpe alcanza 26 u + radio del enemigo), 1,8×, suma 1 de Masa al enemigo. Coste 22, enfriamiento 4400 ms.
- **Tipo:** proyectil lineal (cometa grande) · **Fuente:** `js/champions/ascension/catalog.js:87`; `js/champions/ascension/runtime.js:138`; `js/champions/ascension/runtime.js:186`; `js/skills/aim-targeting.js:58`
- **Silueta y forma:** Un cometa con cabeza de estrella de cinco puntas (⌀40 u) y cola larga de polvo estelar (hasta 360 u) que deja una estela de puntitos y una línea fina de constelación.
- **Color dominante:** Blanco `#ffffff` en la cabeza, azul claro `#d9e1ff` en la cola, índigo `#6f7cf2` en el borde.
- **Movimiento:** La estrella recorre la línea de 360 u en 3 cuadros, girando; deja puntitos que se van apagando de a uno.
- **Anticipación:** Premarcado lineal (existente); 2 cuadros de una estrella formándose en la mano.
- **Impacto:** En cada enemigo: destello de estrella de 5 puntas y +1 puntito de Masa (se queda orbitando).
- **Disipación:** La cola se apaga de la cabeza hacia atrás en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Estrella con cola (largo × ancho): 360×40 u → **180×20 px** nativos (2 u/px)
  - Destello de impacto: 36×36 u → **36×36 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Polvo estelar con tope bajo (≤20 puntos).
- **Ícono 16×16:** hoy `star+arrow` (`js/ui/skill-pixel-glyphs.js:200`); propuesta: estrella con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única línea de estrella; Pozo y Colapso son discos, Órbita es un arco.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Perno conductor (Orsa)**, **Sentencia (Nano GM)**, **Línea de tinta (Sira)**: líneas largas. Vhal = estrella de 5 puntas con polvo azul.

### Habilidad 2 — Pozo Gravitatorio

- **Mecánica (código):** `well`: punto elegido (premarcado `point` r 130 u, alcance 300 u), dura 3500 ms. Cada 200 ms atrae a los comunes al centro (6 u × (1 + 0,3 × Masa)) y cada 500 ms daña (0,55×) con 50% de sumar 1 de Masa. Máx. 2 pozos. Coste 28, enfriamiento 9000 ms.
- **Tipo:** zona persistente (atracción) · **Fuente:** `js/champions/ascension/catalog.js:88`; `js/champions/ascension/runtime.js:139`; `js/champions/ascension/runtime.js:225`; `js/skills/aim-targeting.js:58`
- **Silueta y forma:** Un disco de estrellas en espiral de ⌀260 u: brazos de polvo estelar que giran hacia un centro oscuro con un punto blanco; el borde se curva como un lente.
- **Color dominante:** Azul real `#3a44b0` y índigo `#6f7cf2`; centro negro-azul `#0e1033`; estrellas `#d9e1ff`.
- **Movimiento:** Las estrellas giran en espiral hacia el centro (1 vuelta cada ~1,5 s), aceleradas hacia adentro; cada 500 ms pulsa un destello hacia el centro.
- **Anticipación:** Premarcado circular (existente); 3 cuadros de estrellas apareciendo en el borde.
- **Impacto:** Cierre del disco con destello blanco-azulado.
- **Disipación:** El disco se contrae al centro y se apaga en 5 cuadros.
- **Frames sugeridos:** anticipación 3 · impacto 2 · disipación 5 (= 10 cuadros) + bucle de 8 cuadros
- **Loop:** Disco en bucle de 8 cuadros durante 3,5 s.
- **Tamaño de los assets:**
  - Disco espiral (bucle): 260×260 u → **130×130 px** nativos (2 u/px)
  - Estrella suelta: 8×8 u → **8×8 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Hasta 2 pozos en pantalla: estrellas pequeñas, bajo contraste de relleno.
- **Ícono 16×16:** hoy `vortex+dots` (`js/ui/skill-pixel-glyphs.js:200`); propuesta: espiral de estrellas con puntos.
- **Cómo se distingue de las otras del mismo campeón:** Es el disco que gira; el Colapso es una singularidad en crecimiento, la Órbita un arco.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Presión Abisal (Facu GM)** y **Hundimiento (Coloso de Ilkan)**: implosión de agua/arena que atrae. Vhal = estrellas e índigo sobre fondo oscuro.

### Habilidad 3 — Órbita

- **Mecánica (código):** `orbit`: elige un centro (premarcado `point` r 60 u, alcance 220 u) y se desplaza en un arco de 180° (8 pasos de π/8) a su alrededor, con radio igual a su distancia al centro (entre 60 y 160 u); la estela dura 1800 ms, daña a ≤60 u de su trayecto (1,2×) y suma 1 de Masa. +15% de daño 4 s. Coste 22, enfriamiento 7800 ms.
- **Tipo:** desplazamiento en arco con estela dañina · **Fuente:** `js/champions/ascension/catalog.js:89`; `js/champions/ascension/runtime.js:140`; `js/champions/ascension/runtime.js:227`; `js/skills/aim-targeting.js:59`
- **Silueta y forma:** Un arco de estrellas de 180° (semicírculo de radio 60–160 u) con una banda de polvo estelar de 60 u de ancho y pequeñas órbitas de puntos que nacen en la estela.
- **Color dominante:** Blanco azulado `#d9e1ff` y azul `#6f7cf2`; dorado `#ffe9a0` en las estrellas del trayecto.
- **Movimiento:** El héroe traza el arco en 4 cuadros dejando estrellas que se encienden una tras otra; la banda se afina y se apaga.
- **Anticipación:** Premarcado circular de 60 u (centro de la órbita); 1 cuadro de astrolabio girando.
- **Impacto:** Cierre del arco con una estrella grande de 5 puntas en el final.
- **Disipación:** La banda se desvanece en 5 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 4 · disipación 5 (= 10 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Arco (radio máximo 160 u): 320×160 u → **160×80 px** nativos (2 u/px)
  - Estrella del trayecto: 12×12 u → **12×12 px** nativos (1 u/px)
- **Partículas / capas secundarias:** La forma real depende de la distancia al centro; hacer la banda modular por tramos.
- **Ícono 16×16:** hoy `orbit+up` (`js/ui/skill-pixel-glyphs.js:200`); propuesta: órbita con flecha hacia arriba.
- **Cómo se distingue de las otras del mismo campeón:** Es la única en arco y de movimiento; Estrella es recta, Pozo fijo y Colapso fijo.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Paso Luminal (Aurelia)** e **Inversión (Nano GM)**: saltos. Órbita es un trazado curvo de estrellas que daña por donde pasa.

### Definitiva — Colapso

- **Mecánica (código):** `collapse`: punto elegido (premarcado `point` r 190 u, alcance 320 u); coste 0, enfriamiento 42000 ms, dura 4200 ms. De 0 a 1500 ms una estrella crece y daña (0,3× cada 500 ms) en 120 u; de 1500 a 3700 ms es una singularidad que atrae (radio 320 u) y ralentiza 30%; a los 3700 ms colapsa en 190 u con 1,1× multiplicado por (1 + 0,15 × Masa, hasta ×3). Los aliados a ≤320 u ganan +10% de daño mientras dura.
- **Tipo:** zona de definitiva en 3 fases (estrella → singularidad → explosión) · **Fuente:** `js/champions/ascension/catalog.js:90`; `js/champions/ascension/runtime.js:143`; `js/champions/ascension/runtime.js:229`; `js/skills/aim-targeting.js:59`
- **Silueta y forma:** Fase 1: una estrella de 5 puntas que crece hasta ⌀240 u; fase 2: una esfera negra con anillo de acreción blanco y estrellas absorbidas desde 320 u; fase 3: implosión y estallido de 190 u de radio en un anillo de luz blanca.
- **Color dominante:** Fase 1 blanco-dorado `#ffe9a0`; fase 2 negro-azul `#0e1033` con anillo `#d9e1ff`; fase 3 blanco `#ffffff` y azul `#6f7cf2`.
- **Movimiento:** La estrella pulsa y crece 1,5 s; luego se oscurece y las estrellas lejanas son succionadas en espiral 2,2 s; se contrae en 2 cuadros y revienta con onda blanca.
- **Anticipación:** Premarcado circular de 190 u (existente); 3 fases reales de 1500 / 2200 / 500 ms: las dos primeras funcionan como anticipación larga.
- **Impacto:** Colapso: contracción, flash blanco total de 1 cuadro, onda de 190 u y sacudida.
- **Disipación:** Anillo de polvo estelar que se disipa en 6 cuadros.
- **Frames sugeridos:** anticipación 8 · impacto 5 · disipación 6 (= 19 cuadros) + bucle de 8 cuadros
- **Loop:** Fase 2 (singularidad) en bucle de 8 cuadros durante 2,2 s; fase 1 y 3 no repiten.
- **Tamaño de los assets:**
  - Estrella en crecimiento (fase 1, ⌀ máximo): 240×240 u → **120×120 px** nativos (2 u/px)
  - Singularidad + disco de acreción (fase 2): 380×380 u → **190×190 px** nativos (2 u/px)
  - Explosión (fase 3): 380×380 u → **190×190 px** nativos (2 u/px)
  - Radio de succión (referencia): 640×640 u → **320×320 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Estrellas absorbidas (hasta ~30) en espiral. Brillo del aura de aliados +10% como borde azul en sus pies.
- **Ícono 16×16:** hoy `blackhole+ring` (`js/ui/skill-pixel-glyphs.js:200`); propuesta: agujero negro con anillo.
- **Cómo se distingue de las otras del mismo campeón:** La única en tres fases; Pozo es un disco simple y Órbita un arco.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Gran Cicatriz (Oriel)** y **Force Quit (Axiom)**: ultis de zona grande. Colapso = singularidad negra con anillo de acreción, en azul cósmico.

