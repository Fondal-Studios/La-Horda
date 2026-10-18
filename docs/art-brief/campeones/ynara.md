# Ynara — La Médica de los Refugios (El Ángel del Silencio) (`ynara`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones). Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Sanadora de área (`roleCategory: soporte`), a distancia (básico 300 u, 600 ms). Luz, estrogonof de pollo, agua limpia y una paciencia finita que estalla.
- **Tono:** Silenciosa, cuidadosa y obstinadamente buena: "cura incluso a quien la hizo enojar. Nunca pide perdón". Blanco nacarado, rosa suave, vapor de comida caliente; ternura con filo.
- **Fuentes del kit:** `js/data/portadores.js:5`; `js/data/portadores.js:8`; `js/champions/ynara.js:8`; `js/data/portadores-lore.js:24`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/ynara/atlas.png`: blanco `#f0f0f0` (27%), piel `#f0b090`, rosas `#f0d0d0`/`#b09090`, marrón `#705030`. Color de clase `#ed8db5`, brillo `#fff0f7` (`js/data/portadores.js:5`). Halo nacarado blanco sobre la cabeza.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Rosa claro (dominante) | `#ed8db5` |
  | Blanco nacarado (halo y brillo) | `#fff0f7` |
  | Rosa fuerte (sombra) | `#b04a78` |
  | Granate-ciruela (contorno) | `#40182c` |
  | Crema de salsa (estrogonof) | `#f2d9a8` |
  | Celeste agua (cortina) | `#a9dcf0` |

- **Motivos visuales:** halo blanco nacarado, rayos de luz suave, plato de estrogonof con vapor y corazones, cortina de agua con gotas, santuario circular con alas translúcidas, escudo de luz.
- **NO debe parecerse a:** **Myla** (rosa yogur opaco con crema, charcos y burbujas): Ynara es luz y vapor, rosa transparente con blanco; sin charcos pegajosos. **Elyra** (verde y rayos solares): la luz de Ynara es rosa-blanca suave. **Oriel** (frambuesa saturada con negro-vino) y **Veyra** (carmesí). **Ismara** (turquesa).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (vial)

- **Mecánica (código):** A distancia: `basicRange` 300 u, enfriamiento 600 ms, proyectil `vial` (frasquito) a 420 u/s, radio 8 u, vida 900 ms, color de brillo `#fff0f7`; pose 190 ms.
- **Tipo:** proyectil · **Fuente:** `js/data/portadores.js:5`; `js/data/portadores-lore.js:3`; `js/skills/abilities.js:209`
- **Silueta y forma:** Un frasquito de vidrio (≈18 u) con líquido rosa que se mece al volar, con un destello blanco.
- **Color dominante:** Blanco nacarado `#fff0f7` y líquido rosa `#ed8db5`.
- **Movimiento:** Vuela con un balanceo suave; suelta 2 gotas de luz.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de brillo en el halo.
- **Impacto:** El frasco estalla en un destello rosa-blanco de 17 u con 3 gotitas.
- **Disipación:** Las gotas desaparecen en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Vial: 18×18 u → **18×18 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es pequeño y de vidrio; las habilidades son abanico de luz, plato con vapor, cortina de agua y santuario.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Disparo de Myla (cuchara) y de Elyra (orbe): frasco de vidrio con líquido rosa.

### Habilidad 1 — Mirada fulminante

- **Mecánica (código):** `yn_gaze`: cono de 190 u de alcance y semiángulo 0,85 rad (≈97°), premarcado `cone`; 0,65×, ralentiza 30% por 1500 ms; empuja 35 u a los comunes a <100 u. Coste 24, enfriamiento 6500 ms.
- **Tipo:** cono (abanico de luz) · **Fuente:** `js/data/portadores.js:8`; `js/champions/ynara.js:10`; `js/data/portadores-lore.js:15`
- **Silueta y forma:** Un abanico de luz rosa-blanca de 190 u con rayos finos que parten de un ojo/halo central y ablandan los bordes (difuminados por tramado, no sólidos).
- **Color dominante:** Rosa claro `#ed8db5` con blanco `#fff0f7` en el centro de cada rayo.
- **Movimiento:** Los rayos se abren desde el halo en 3 cuadros, con un parpadeo sostenido; los enemigos tocados quedan "pegados" 1,5 s por una pequeña onda.
- **Anticipación:** Sector punteado del premarcado; 2 cuadros con el halo brillando.
- **Impacto:** Un destello en cada enemigo y el empuje de 35 u marcado por una línea corta.
- **Disipación:** Los rayos se difuminan en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Sector del abanico (largo × ancho en la punta): 190×285,5 u → **190×285 px** nativos (1 u/px)
  - Destello por enemigo: 24×24 u → **24×24 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Rayos finos sin partículas pesadas; mantener lectura de luz, no de cristal.
- **Ícono 16×16:** hoy `eye+bolt` (`js/ui/skill-pixel-glyphs.js:178`); propuesta: ojo con rayo.
- **Cómo se distingue de las otras del mismo campeón:** Es la única de luz en abanico; el Estrogonof es un plato, la Cortina una línea de agua.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Astillas errantes (Nahir)** y **Agujas de penumbra (Vesper)**: mismos 97°. Ynara = rayos suaves rosa-blancos, sin aristas; Nahir = vidrio sólido; Vesper = hilo. **Cosecha de Almas (Ilvar)**: cono verde de manos.

### Habilidad 2 — Estrogonof reparador

- **Mecánica (código):** `yn_stroganoff`: punto elegido (premarcado `point` r 115 u, alcance 180 u), dura 4800 ms; cada 600 ms cura 1% de vida máx. a los aliados dentro y daña (0,06×) a los enemigos; los aliados dentro reciben 8% menos de daño. Máx. una fuente por Ynara. Coste 32, enfriamiento 12000 ms.
- **Tipo:** zona persistente (fuente de curación) · **Fuente:** `js/data/portadores.js:9`; `js/champions/ynara.js:12`; `js/champions/ynara.js:41`
- **Silueta y forma:** Un plato hondo de estrogonof de pollo (≈34 u) en el centro de un círculo de 230 u, con vapor que sube en volutas y corazoncitos; el círculo tiene un borde de cuchara/tenedor y un mantel.
- **Color dominante:** Crema `#f2d9a8` en la comida, rosa `#ed8db5` en el vapor y los corazones, blanco `#fff0f7` en el borde.
- **Movimiento:** El plato desciende con un rebote en 3 cuadros; el vapor sube y gira; cada 600 ms sale un corazón del plato y un pulso suave por el círculo.
- **Anticipación:** Premarcado circular de 115 u (existente); 2 cuadros con el plato cayendo.
- **Impacto:** Pulso con corazoncitos sobre cada aliado curado cada 600 ms.
- **Disipación:** El plato y el vapor se apagan en 5 cuadros al terminar.
- **Frames sugeridos:** anticipación 2 · impacto 2 · disipación 5 (= 9 cuadros) + bucle de 8 cuadros
- **Loop:** Vapor y círculo en bucle de 8 cuadros durante 4,8 s; el pulso es una capa de 3 cuadros cada 600 ms.
- **Tamaño de los assets:**
  - Círculo de la fuente (bucle): 230×230 u → **115×115 px** nativos (2 u/px)
  - Plato con vapor: 34×48 u → **34×48 px** nativos (1 u/px)
  - Corazón: 8×8 u → **8×8 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Corazones con tope de 4 por pulso.
- **Ícono 16×16:** hoy `bowl+plus` (`js/ui/skill-pixel-glyphs.js:178`); propuesta: cuenco con signo +.
- **Cómo se distingue de las otras del mismo campeón:** Es la única con comida y vapor, y la única persistente de curación; la Mirada es instantánea y la Cortina daña.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Alba Purificadora (Elyra)** (pulso verde instantáneo) y **Gran Reserva (Solciju)**: zonas de pulsos. La de Ynara es cálida, con comida y vapor rosa.

### Habilidad 3 — No quiero seguir esta conversación

- **Mecánica (código):** `yn_leave`: se desliza hasta 130 u (premarcado `line` de 32 u; sin atravesar muros ni vacíos), se limpia la ralentización y deja una cortina de agua entre el origen y la llegada que dura 2400 ms: cada 600 ms daña (0,06×) y ralentiza 30% (850 ms) a ≤32 u de la línea. Máx. una cortina. Coste 26, enfriamiento 10000 ms.
- **Tipo:** desplazamiento + zona lineal (cortina de agua) · **Fuente:** `js/data/portadores.js:10`; `js/champions/ynara.js:14`; `js/data/portadores-lore.js:15`
- **Silueta y forma:** Una cortina de agua vertical de 130 × 64 u (como una cascada plana vista desde arriba, de gotas y corrientes) entre origen y llegada; Ynara se desdibuja en un velo blanco al moverse.
- **Color dominante:** Celeste agua `#a9dcf0` con brillos blancos `#fff0f7` y bordes rosa `#ed8db5`.
- **Movimiento:** Ynara se desliza hacia atrás con el velo en 3 cuadros; la cortina cae como agua en bucle durante 2,4 s con 4 pulsos de ondas.
- **Anticipación:** Premarcado lineal (existente); 1 cuadro del velo.
- **Impacto:** La cortina se abre con un chapoteo corto en cada extremo.
- **Disipación:** La cortina se seca de arriba hacia abajo en 5 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 5 (= 9 cuadros) + bucle de 8 cuadros
- **Loop:** Cortina en bucle de 8 cuadros (corriente descendente) durante 2,4 s.
- **Tamaño de los assets:**
  - Cortina de agua (largo × ancho): 130×64 u → **130×64 px** nativos (1 u/px)
  - Velo de movimiento: 130×40 u → **130×40 px** nativos (1 u/px)
  - Chapoteo de extremo: 40×40 u → **40×40 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Gotas de 3 tamaños; sin espuma gruesa (no confundir con Facu GM).
- **Ícono 16×16:** hoy `door+arrow` (`js/ui/skill-pixel-glyphs.js:178`); propuesta: puerta con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única de agua y la única que se aleja de los enemigos; las otras tres son luz y comida.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Cabalgar la Ola (Facu GM)**: ola/espuma azul. **Enfriar (Zahra)**: vapor. La de Ynara es una cortina delgada celeste con gotas, y rosa en los bordes.

### Definitiva — Santa Paciencia

- **Mecánica (código):** `yn_patience`: sin apuntado; coste 0, enfriamiento 36000 ms, dura 6000 ms, sigue a Ynara. Cada 600 ms cura 0,8% y daña (0,07×) en 170 u; cada golpe que reciben los aliados adentro carga paciencia (máx. 8, uno cada 400 ms); al final estalla una onda de 170 u con 0,07 × (3 + 0,35 × cargas).
- **Tipo:** aura móvil (santuario) con estallido final · **Fuente:** `js/data/portadores.js:11`; `js/champions/ynara.js:22`; `js/champions/ynara.js:47`
- **Silueta y forma:** Un santuario circular de ⌀340 u alrededor de ella: un halo grande en el suelo con 8 muescas (una por carga), alas translúcidas que se levantan detrás de Ynara y rayos suaves que caen del cielo.
- **Color dominante:** Blanco nacarado `#fff0f7` y rosa `#ed8db5`; muescas `#b04a78`.
- **Movimiento:** El halo se abre en 5 cuadros; las alas respiran; cada golpe que reciben los aliados enciende una muesca y un destello recorre el aro; al final, las 8 muescas estallan en una onda.
- **Anticipación:** Pose de 650 ms: el halo sobre su cabeza crece y las alas se abren (6 cuadros).
- **Impacto:** Onda final de 170 u con luz blanca (más fuerte con más cargas) y sacudida corta.
- **Disipación:** Las alas se pliegan y el halo se apaga en 6 cuadros.
- **Frames sugeridos:** anticipación 6 · impacto 5 · disipación 6 (= 17 cuadros) + bucle de 8 cuadros
- **Loop:** Santuario en bucle de 8 cuadros durante 6 s; muescas que se encienden con cada carga.
- **Tamaño de los assets:**
  - Halo del santuario (bucle): 340×340 u → **170×170 px** nativos (2 u/px)
  - Alas translúcidas (capa detrás del cuerpo): 96×70 u → **96×70 px** nativos (1 u/px)
  - Onda final: 340×340 u → **170×170 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Sin cambiar el diseño del personaje (§5). Rayos del cielo con tope de 4.
- **Ícono 16×16:** hoy `halo+up` (`js/ui/skill-pixel-glyphs.js:178`); propuesta: halo con flecha hacia arriba.
- **Cómo se distingue de las otras del mismo campeón:** La única con alas y con onda final; Estrogonof es una fuente fija, Cortina una línea.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Bendición Suprema (Elyra)**, **Catedral del Sol (Aurelia)** y **Ascensión del Elegido (Ismara)**: ultis de apoyo. Ynara = halo nacarado con 8 muescas y alas rosa-blancas, centrado en ella.

### Pasiva — Impecable (escudo y destello)

- **Mecánica (código):** Tras 8 s sin recibir golpes obtiene un escudo del 8% de su vida máxima (9 s); si el escudo se rompe por daño, libera luz en 90 u (0,3× del daño base) y vuelve a prepararse. No se acumula.
- **Tipo:** escudo automático + estallido al romperse · **Fuente:** `js/data/portadores-lore.js:24`; `js/champions/ynara.js:34`; `js/champions/ynara.js:26`
- **Silueta y forma:** Una capa fina de vidrio nacarado alrededor del cuerpo (⌀50 u) que brilla suave, y al romperse, un destello en anillo de 90 u de radio.
- **Color dominante:** Blanco nacarado `#fff0f7` translúcido, borde rosa `#ed8db5`.
- **Movimiento:** La capa aparece con un destello y respira; al romperse se agrieta y estalla.
- **Anticipación:** —
- **Impacto:** Estallido de 90 u en 3 cuadros.
- **Disipación:** Cae en fragmentos de luz en 3 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 3 (= 8 cuadros) + bucle de 6 cuadros
- **Loop:** Capa en bucle de 6 cuadros.
- **Tamaño de los assets:**
  - Capa de escudo: 50×50 u → **50×50 px** nativos (1 u/px)
  - Estallido al romperse: 180×180 u → **90×90 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Lectura clara de "listo / no listo" (aparece solo tras 8 s).
- **Cómo se distingue de las otras del mismo campeón:** Es sutil y pequeña; no compite con las habilidades.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Burbuja Cremosa (Myla): ésta es una capa de vidrio nacarado, no yogur.

