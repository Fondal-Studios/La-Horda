# Elyra — La Guardiana del Alba (Soporte) (`soporte`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones). Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Sanadora a distancia (`roleCategory: soporte`): básico 320 u, 600 ms. Cura, bendice y protege al equipo con luz en área, y esa misma luz daña a la Horda.
- **Tono:** Luminosa, protectora y firme (ART_BIBLE §4: báculo con brillo). Amanecer: oro cálido y verde menta; solemne pero amable. Las habilidades de equipo cambian de color según su función (verde cura, rojo ataque, azul defensa, violeta-oro bendición).
- **Fuentes del kit:** `js/data/champions.js:70`; `js/skills/abilities.js:1155`; `js/skills/abilities.js:1226`; efectos de base en `js/champions/kit-shared.js:37`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/soporte/atlas.png`: blancos/cremas `#f0f0d0`/`#d0f0d0`, marrón `#705030`, tostado `#d0b090`. Color de clase `#5fc48c`, brillo `#a9f0c9` (`champions.js`). Báculo luminoso.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Verde menta (dominante) | `#5fc48c` |
  | Verde pálido (brillo) | `#a9f0c9` |
  | Verde profundo (sombra) | `#2f8a5c` |
  | Verde-negro (contorno) | `#14352a` |
  | Oro alba (acento solar) | `#ffe7a5` |
  | Blanco cálido | `#fffbe0` |

- **Motivos visuales:** sol naciente, rayos de alba, cruz de luz (+), espadas y escudos luminosos por función, alas y halo, anillos grandes que abrazan al equipo, sellos en el suelo.
- **Pasiva:** *Gracia del Alba* (+25% de curación a aliados con menos de 35% de vida) no tiene efecto visual propio; no se pide arte.
- **NO debe parecerse a:** **Aurelia** (oro/sol, prismas, `#f2c14e`): Elyra es verde menta con oro solo en el centro; nada de prismas ni nodos. **Saelis** (alas de pluma celeste) y **Ismara** (turquesa fría): la luz de Elyra es verde-oro cálido. **Cazadora/Nigromante** (verdes de bosque/sepulcral): el verde de Elyra es claro y luminoso. **Nano GM** (Edicto de Luz dorado).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Rayo de Alba

- **Mecánica (código):** A distancia: `basicRange` 320 u, enfriamiento 600 ms, proyectil `wisp` (luz) a 420 u/s, radio 8 u, vida 900 ms, color `#a9f0c9`; al lanzar suelta 2–3 partículas cálidas (`#fff2c0`/`#ffe08a`); pose 190 ms.
- **Tipo:** proyectil · **Fuente:** `js/data/champions.js:70`; `js/data/champion-identity.js:41`; `js/skills/abilities.js:219`
- **Silueta y forma:** Un orbe de luz con una pequeña cruz (+), de 18 u, con una cola de 2 destellos.
- **Color dominante:** Verde pálido `#a9f0c9` con centro blanco cálido `#fffbe0`.
- **Movimiento:** Vuela recto con pulso suave del brillo (±15%).
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de brillo en el báculo.
- **Impacto:** Destello de 17 u en cruz con 2 chispas doradas.
- **Disipación:** Se apaga en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Orbe: 18×18 u → **18×18 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Chispas doradas mínimas.
- **Cómo se distingue de las otras del mismo campeón:** Es pequeño y verde; sus cuatro habilidades usan anillos grandes con el color de su función.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Disparo de Ismara (`rune`) y de Ilvar (`soul`): verde-oro cálido vs turquesa vs verde sepulcral.

### Habilidad 1 — Alba Purificadora

- **Mecánica (código):** `team_heal_aoe`: sin apuntado; cura 24% de la vida máxima a los aliados a ≤260 u y daña a todos los enemigos a ≤160 u con 1,2×. Anillo `#7dffa0` de 260 u (600 ms) y estallido interior de 160 u (`#ffe7a5`/`#d3ffdb`). Cada aliado curado recibe además el sprite `fxHolyHealBurst` (96 u, 480 ms). Coste 40, enfriamiento 7000 ms.
- **Tipo:** área centrada en el héroe (dos radios: cura y daño) · **Fuente:** `js/data/champions.js:76`; `js/skills/abilities.js:1155`
- **Silueta y forma:** Dos círculos concéntricos: un sol de luz de ⌀320 u (daño) dentro de un anillo de curación de ⌀520 u (equipo); sobre cada aliado, un destello en cruz.
- **Color dominante:** Verde menta `#5fc48c` (anillo de cura) y oro alba `#ffe7a5` (sol interior).
- **Movimiento:** El sol interior revienta con 8 rayos en 3 cuadros; el anillo exterior viaja más lento hasta 260 u; los aliados reciben chispas que suben.
- **Anticipación:** Pose de 420 ms: el báculo se alza y el halo de Elyra se enciende en 2 cuadros.
- **Impacto:** Sol de 160 u con rayos + anillo de 260 u; números de curación sobre los aliados.
- **Disipación:** Los dos anillos se disuelven en 5 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 5 (= 11 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Sol interior (daño): 320×320 u → **160×160 px** nativos (2 u/px)
  - Anillo de curación: 520×520 u → **260×260 px** nativos (2 u/px)
  - Destello sobre aliado: 96×96 u → **96×96 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Pocos rayos largos (8); evitar niebla opaca porque el anillo cubre media pantalla.
- **Ícono 16×16:** hoy `sun+plus` (`js/ui/skill-pixel-glyphs.js:168`); propuesta: sol con signo +.
- **Cómo se distingue de las otras del mismo campeón:** Es la única verde y la única con dos radios; las otras dos de equipo son rojo y azul con símbolos propios, y la ulti violeta-oro.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Edicto de Luz (Nano GM)** y **Cielo de Plumas (Saelis)**: zonas de luz/plumas. Elyra = anillos verdes sin escritura ni plumas, y centrada en el héroe.

### Habilidad 2 — Bendición de Guerra

- **Mecánica (código):** `team_atk_buff`: sin apuntado; +22% de daño a los aliados a ≤260 u durante 5500 ms. Sello bajo Elyra de radio 156 u (`#ff4a3d`) mientras dura, y anillo `#ff4a3d` de 260 u (600 ms). Coste 36, enfriamiento 8200 ms.
- **Tipo:** aura de equipo (buff de ataque) · **Fuente:** `js/data/champions.js:77`; `js/skills/abilities.js:1178`
- **Silueta y forma:** Un sello de espadas cruzadas en el suelo bajo Elyra (⌀312 u) y, sobre cada aliado alcanzado, una pequeña espada de luz roja que flota y un aura de filo en los pies.
- **Color dominante:** Rojo luz `#ff4a3d` con oro `#ffe7a5` en los filos; sombra `#7a1620`.
- **Movimiento:** El sello gira lento y se enciende en 3 cuadros; las espadas aparecen sobre los aliados y se mecen durante 5,5 s.
- **Anticipación:** Pose de 420 ms: espada de luz en el báculo.
- **Impacto:** Anillo de 260 u rojo y destello en cada aliado.
- **Disipación:** Espadas y sello se apagan en 5 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 5 (= 10 cuadros) + bucle de 6 cuadros
- **Loop:** Sello y espadas en bucle de 6 cuadros durante 5,5 s.
- **Tamaño de los assets:**
  - Sello bajo Elyra: 312×312 u → **156×156 px** nativos (2 u/px)
  - Espada sobre aliado: 18×30 u → **18×30 px** nativos (1 u/px)
  - Anillo de onda: 520×520 u → **260×260 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Debe poder reconocerse a distancia: espada = ataque.
- **Ícono 16×16:** hoy `sword+up` (`js/ui/skill-pixel-glyphs.js:168`); propuesta: espada con flecha hacia arriba.
- **Cómo se distingue de las otras del mismo campeón:** Roja con espadas, frente a verde con cruz (Alba), azul con escudos (Escudo) y violeta-oro con corona (ulti).
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Bendición Suprema** propia y **Piel/Grito (Ilkan, Aldric)**: gritos de buff. La de Elyra es un sello rojo de espadas, y sobre los aliados.

### Habilidad 3 — Escudo Sagrado

- **Mecánica (código):** `team_shield_buff`: sin apuntado; +26% de defensa y escudo del 18% de la vida máxima a los aliados a ≤260 u durante 5500 ms. Sello de radio 156 u (`#5fb0ff`) y anillo de 260 u. Coste 38, enfriamiento 8600 ms.
- **Tipo:** aura de equipo (buff de defensa + escudo) · **Fuente:** `js/data/champions.js:78`; `js/skills/abilities.js:1204`
- **Silueta y forma:** Un sello de escudo en el suelo bajo Elyra (⌀312 u) y sobre cada aliado un escudo heráldico de luz azul que flota y una burbuja suave cuando absorbe.
- **Color dominante:** Azul `#5fb0ff` con borde claro `#bfe0ff`; oro `#ffe7a5` en el emblema.
- **Movimiento:** El sello se cierra como un portón en 3 cuadros; cada escudo aparece con un pequeño golpe y se mece; al absorber daño, chispa.
- **Anticipación:** Pose de 420 ms: escudo de luz en el báculo.
- **Impacto:** Anillo de 260 u azul y destello en cada aliado.
- **Disipación:** Escudos se agrietan y se desvanecen en 5 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 5 (= 10 cuadros) + bucle de 6 cuadros
- **Loop:** Sello y escudos en bucle de 6 cuadros durante 5,5 s.
- **Tamaño de los assets:**
  - Sello bajo Elyra: 312×312 u → **156×156 px** nativos (2 u/px)
  - Escudo sobre aliado: 26×30 u → **26×30 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Escudo = heráldico, no hexágono ni burbuja.
- **Ícono 16×16:** hoy `shield+plus` (`js/ui/skill-pixel-glyphs.js:168`); propuesta: escudo con signo +.
- **Cómo se distingue de las otras del mismo campeón:** Azul con escudos frente a rojo con espadas y verde con cruz.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Burbuja Cremosa (Myla)**, **Brindis (Solciju)**, **Visión del Inmortal (Ismara)**: escudos redondos de otros colores. Elyra = escudo heráldico azul.

### Definitiva — Bendición Suprema

- **Mecánica (código):** `team_grand_buff`: sin apuntado; a los aliados a ≤280 u: cura 30% de su vida máxima, +28% de daño y +30% de defensa durante 6500 ms. Sello de radio 154 u (`#c88cff`) y anillo `#c88cff` de 280 u (800 ms) con estallido oro `#ffcf5c`. Coste 0, enfriamiento 32000 ms. Cada aliado curado recibe `fxHolyHealBurst`.
- **Tipo:** aura de equipo (cura + ataque + defensa) · **Fuente:** `js/data/champions.js:80`; `js/skills/abilities.js:1226`
- **Silueta y forma:** Un gran sello coronado en el suelo (⌀308 u) con las tres figuras de las otras habilidades (cruz, espada, escudo) alrededor de una corona; sobre cada aliado, un halo con alas pequeñas de luz.
- **Color dominante:** Violeta `#c88cff` con oro `#ffcf5c` en la corona y verde menta `#a9f0c9` en los bordes.
- **Movimiento:** El sello se dibuja en 4 cuadros con las tres figuras encendiéndose una a una (cruz, espada, escudo); estalla una columna de luz en el centro; el halo de los aliados respira.
- **Anticipación:** Pose de 650 ms: Elyra se eleva 6 u y el báculo ilumina; el sello se traza.
- **Impacto:** Columna de luz y anillo de 280 u dorado-violeta, flash corto de pantalla (ya existe).
- **Disipación:** El sello y los halos se apagan en 6 cuadros.
- **Frames sugeridos:** anticipación 4 · impacto 5 · disipación 6 (= 15 cuadros) + bucle de 8 cuadros
- **Loop:** Halo de aliados y sello en bucle de 8 cuadros durante 6,5 s.
- **Tamaño de los assets:**
  - Sello coronado: 308×308 u → **154×154 px** nativos (2 u/px)
  - Anillo de onda: 560×560 u → **280×280 px** nativos (2 u/px)
  - Halo con alas sobre aliado: 44×30 u → **44×30 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Resumen visual de las otras tres: cruz verde + espada roja + escudo azul orbitando la corona.
- **Ícono 16×16:** hoy `crown+up` (`js/ui/skill-pixel-glyphs.js:168`); propuesta: corona con flecha hacia arriba.
- **Cómo se distingue de las otras del mismo campeón:** Única violeta-oro y única con corona; reúne los símbolos de las otras tres.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Catedral del Sol (Aurelia)** (arquitectura de luz dorada) y **Ascensión del Elegido (Ismara)**: Elyra = sello coronado en violeta-oro sobre todo el equipo; Aurelia = tres nodos geométricos; Ismara = fusión sobre un solo aliado.

