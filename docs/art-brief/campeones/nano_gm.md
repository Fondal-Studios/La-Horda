# Nano GM — El Regente del Umbral (`nano_gm`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones). Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Mago de reglas (`roleCategory: mago`), a distancia (básico 270 u, 420 ms). Alterna afinidad Luz y Oscuridad; con 2+2 entra en la Forma del Regente.
- **Tono:** Solemne y absoluto, con humor seco de "Game Master": decreta, sentencia, parte la arena en dos. Contraste duro entre dos mitades (blanco/oro contra negro/índigo).
- **Fuentes del kit:** `js/champions/ascension/catalog.js:12`; `js/champions/ascension/catalog.js:23`; `js/champions/ascension/runtime.js:101`; pasiva en `js/champions/ascension/catalog.js:17`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/nano_gm/atlas.png`: oro envejecido `#d0b070`/`#f0d090`, negro-índigo `#0c0c24`/`#24243c`, grises `#505050`. Color de clase `#e8c56a`, brillo `#fff4d6` (`ascension/catalog.js:12`). Ala de luz y ala de sombra asimétricas (render en `ascension/render.js`).
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Oro envejecido (Luz, dominante) | `#e8c56a` |
  | Marfil de decreto | `#fff4d6` |
  | Negro-índigo (Oscuridad, dominante opuesto) | `#15122a` |
  | Ocre oscuro (sombra del oro) | `#7a6420` |
  | Violeta de sombra (filo de la Oscuridad) | `#4a3a8a` |
  | Blanco puro (golpe de Juicio) | `#ffffff` |

- **Motivos visuales:** mitades enfrentadas (blanco/negro), balanza, martillo de juez, pergaminos y decretos con runas, tatuajes que se agrietan en glifos, ala de luz + ala de sombra, líneas rectas de "regla" (geometría de reglamento), media luna mitad blanca/mitad negra.
- **NO debe parecerse a:** **Aurelia** (oro/sol, prismas): el oro de Nano siempre va partido con negro; nada de rayos de sol ni cristales. **Segador/Veyra** (negro y rojo): la oscuridad de Nano es índigo con filo dorado, sin rojo. **Elyra** (luz dorada de curación): la Luz de Nano es ley/escritura en el suelo (círculos de runas), no destellos de curación.

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (media luna)

- **Mecánica (código):** A distancia: `basicRange` 270 u, enfriamiento 420 ms, proyectil `halfmoon` (media luna) a 420 u/s, radio 8 u, vida 900 ms (genérico de proyectiles de clase, `abilities.js`); pose de 190 ms.
- **Tipo:** proyectil · **Fuente:** `js/champions/ascension/catalog.js:12`; `js/champions/ascension/register.js:10`; `js/skills/abilities.js:209`
- **Silueta y forma:** Media luna de ≈18 u: la mitad delantera blanco-oro, la trasera negro-índigo (cada disparo es "una moneda partida" en vuelo).
- **Color dominante:** Mitad `#fff4d6` / mitad `#15122a`, con filo oro `#e8c56a`.
- **Movimiento:** Vuela recto girando sobre su eje largo (alterna cara blanca/negra cada ~120 ms); cola corta de 2 chispas del color de la cara visible.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de runa en la mano.
- **Impacto:** Chasquido de 17 u de radio en el color de la cara que golpea, con 2 esquirlas.
- **Disipación:** 3 cuadros de polvo mitad blanco/mitad negro.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros (giro).
- **Tamaño de los assets:**
  - Proyectil: 20×20 u → **20×20 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Cola mínima para no competir con Sentencia.
- **Cómo se distingue de las otras del mismo campeón:** Es el único objeto pequeño y giratorio; las habilidades son decretos, círculos y estallidos grandes.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Proyectil de Vhal (cometa) y de Velmira (máscara): la media luna bicolor es inconfundible; no usar cola larga ni confeti.

### Habilidad 1 — Sentencia Umbría

- **Mecánica (código):** `sentence`, afinidad OSCURIDAD: línea de 330 u (premarcado `line` de 26 u; el golpe usa 30 u de radio a cada lado), 4,6× de daño; el enemigo queda SENTENCIADO (+15% de daño recibido, 4 s) y los comunes con menos de 22% de vida son ejecutados. Termina en una explosión de 70 u (0,6×) que también sentencia. Coste 22, enfriamiento 4600 ms.
- **Tipo:** línea (decreto) + estallido final · **Fuente:** `js/champions/ascension/catalog.js:23`; `js/champions/ascension/runtime.js:101`; `js/skills/aim-targeting.js:50`
- **Silueta y forma:** Un decreto de sombra: franja negra de 330 × 60 u con filo dorado y sellos de runa que se estampan a lo largo; el extremo cierra con un sello/martillo de juez de 140 u de diámetro.
- **Color dominante:** Negro-índigo `#15122a` dominante, filo oro `#e8c56a`, violeta `#4a3a8a` en los sellos.
- **Movimiento:** La franja se despliega como pergamino de la mano hacia el final en 3 cuadros; los sellos se estampan secuencialmente; el sello final cae con golpe de martillo.
- **Anticipación:** Premarcado lineal (existente); 2 cuadros de pergamino que se desenrolla en la mano.
- **Impacto:** Sello final de 70 u de radio con estallido negro y marca de "SENTENCIA" (runa) sobre cada afectado.
- **Disipación:** La franja se rompe en fragmentos de pergamino y la marca de los enemigos pulsa 4 s antes de apagarse.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 4 (= 10 cuadros)
- **Loop:** No hace bucle; la marca sobre los sentenciados repite 3 cuadros durante 4 s.
- **Tamaño de los assets:**
  - Franja del decreto: 330×60 u → **330×60 px** nativos (1 u/px)
  - Sello final: 140×140 u → **140×140 px** nativos (1 u/px)
  - Marca sobre enemigo: 20×20 u → **20×20 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Fragmentos de pergamino, 1 destello dorado por sello. En Forma del Regente (afinidad "ambas") los aliados en la línea reciben un escudo corto: añadir un borde dorado.
- **Ícono 16×16:** hoy `gavel+x` (`js/ui/skill-pixel-glyphs.js:195`); propuesta: martillo de juez sobre sello negro.
- **Cómo se distingue de las otras del mismo campeón:** Única línea larga y la única negra; el Edicto es un círculo dorado y la Inversión un salto bicolor.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Línea de tinta (Sira) y Perno conductor (Orsa): líneas largas. La de Nano es negra con filo dorado y sellos; Sira es azul tinta, Orsa cobre.

### Habilidad 2 — Edicto de Luz

- **Mecánica (código):** `edict`, afinidad LUZ: punto elegido (premarcado `point` r 135 u, alcance 300 u), dura 5000 ms; cada 500 ms los aliados dentro reciben escudo 3% y curación 1,2%, y los enemigos dentro se ralentizan 20%. En Forma del Regente también daña. Coste 26, enfriamiento 8200 ms. Máx. 2.
- **Tipo:** zona persistente (ley en el suelo) · **Fuente:** `js/champions/ascension/catalog.js:24`; `js/champions/ascension/runtime.js:104`; `js/champions/ascension/runtime.js:196`
- **Silueta y forma:** Círculo de ley en el suelo de ⌀270 u: doble anillo con runas escritas, balanza al centro y líneas rectas radiales (como un reglamento).
- **Color dominante:** Oro `#e8c56a` y marfil `#fff4d6` sobre el suelo; sombras en ocre `#7a6420`.
- **Movimiento:** Las runas se escriben de adentro hacia afuera al aparecer; el anillo exterior gira lento (1 vuelta cada ~6 s) y cada 500 ms pulsa un destello suave desde el centro.
- **Anticipación:** Premarcado circular (existente); 3 cuadros de las runas dibujándose antes de que el círculo se cierre.
- **Impacto:** Cierre del círculo con destello dorado radial de 135 u.
- **Disipación:** Las runas se borran de afuera hacia adentro en 4 cuadros.
- **Frames sugeridos:** anticipación 3 · impacto 3 · disipación 4 (= 10 cuadros) + bucle de 8 cuadros
- **Loop:** Bucle de 8 cuadros (runas girando y pulso) durante 5 s.
- **Tamaño de los assets:**
  - Círculo de ley: 270×270 u → **135×135 px** nativos (2 u/px)
  - Destello de pulso: 270×270 u → **135×135 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Líneas de luz que suben tenues al borde; sin partículas pesadas (la zona dura mucho: bajo costo de lectura).
- **Ícono 16×16:** hoy `scroll+up` (`js/ui/skill-pixel-glyphs.js:195`); propuesta: pergamino enrollado con runa.
- **Cómo se distingue de las otras del mismo campeón:** Es luminosa, fija y plana; la Sentencia es negra y direccional, la Inversión es un salto.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Alba Purificadora de Elyra y Cielo de Plumas de Saelis (círculos de luz): el de Nano es un círculo de **escritura** dorada con balanza, no un destello verde ni plumas.

### Habilidad 3 — Inversión

- **Mecánica (código):** `invert`, afinidad ALTERNA (opuesta a su última): salta al punto elegido (premarcado `dash` de 30 u, alcance 260 u). Deja en el origen una runa de 110 u que dura 700 ms (si es Sombra: estalla al final con daño; si es Luz: cura a los aliados a ≤150 u al llegar). Al llegar estalla en 143 u (110×1,3) con 0,8×. Coste 20, enfriamiento 6800 ms, 2,9×.
- **Tipo:** desplazamiento (teletransporte) con runa y estallido · **Fuente:** `js/champions/ascension/catalog.js:25`; `js/champions/ascension/runtime.js:105`; `js/champions/ascension/runtime.js:197`; `js/skills/aim-targeting.js:51`
- **Silueta y forma:** Dos huellas opuestas: la runa del origen (círculo de 220 u, negra o blanca según la afinidad) y la llegada con un estallido de 286 u de diámetro mitad blanco/mitad negro.
- **Color dominante:** Mitad `#fff4d6` / mitad `#15122a` en el estallido; la runa es del color opuesto a la afinidad previa.
- **Movimiento:** El héroe se parte en una hebra blanca y una negra que cruzan el trayecto y se recomponen al llegar; la runa del origen late y estalla/cura a los 700 ms.
- **Anticipación:** Runa del origen aparece al lanzar (2 cuadros). Premarcado de salto (existente).
- **Impacto:** Llegada: estallido bicolor de 143 u con un cuadro de inversión de color (negativo) en el centro.
- **Disipación:** La runa del origen estalla (Sombra) o se disuelve en luz (Luz) a los 700 ms y se apaga en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 4 (= 10 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Runa del origen (2 variantes: blanca y negra): 220×220 u → **110×110 px** nativos (2 u/px)
  - Estallido de llegada: 286×286 u → **143×143 px** nativos (2 u/px)
  - Hebra del trayecto: 260×30 u → **260×30 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Producir **dos variantes** de la runa (negra para Sombra, blanca para Luz). El texto/estado del botón no depende del arte.
- **Ícono 16×16:** hoy `swap+spark` (`js/ui/skill-pixel-glyphs.js:195`); propuesta: dos flechas opuestas, mitad blanca y mitad negra.
- **Cómo se distingue de las otras del mismo campeón:** Es la única bicolor al mismo tiempo; Sentencia es toda negra y Edicto toda dorada.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Teletransporte de Axiom y Paso Luminal de Aurelia: saltos con destello. El de Nano deja una **runa en el origen** que estalla/cura y llega con mitad blanca/mitad negra.

### Definitiva — Juicio del GM

- **Mecánica (código):** `judgement`: sin apuntado, centrada en él; coste 0, enfriamiento 62000 ms. Radio 440 u (tope de definitiva 480). Nano levita 2600 ms. De 0 a 700 ms los comunes en el área reciben pulsos de 200 ms de aturdimiento; a los 700 ms cae el Juicio: los aliados recuperan 25% de su vida máxima y reciben escudo 15% y +20% de velocidad por 6 s; comunes con ≤45% de vida son ejecutados, el resto recibe 1,2× (élites 1,6×; los jefes reciben 1,0× con tope del 7% de su vida); sacudida de pantalla 10. Después, 8 s de Forma del Regente y de monstruo en blanco y negro (+40% de área en todo y mundo desaturado).
- **Tipo:** zona global de definitiva (canal + sentencia + transformación) · **Fuente:** `js/champions/ascension/catalog.js:26`; `js/champions/ascension/runtime.js:109`; `js/champions/ascension/runtime.js:198`; `js/champions/ascension/render.js:36`
- **Silueta y forma:** La arena se parte en dos mitades con una grieta de luz vertical que cruza el círculo de ⌀880 u: mitad izquierda blanca (columnas de luz, ley) y derecha negra (zarpas y filos de sombra). Sobre Nano, una balanza gigante y el martillo.
- **Color dominante:** Dos dominantes enfrentados: blanco/oro `#fff4d6`+`#e8c56a` (mitad Luz) y negro-índigo `#15122a`+`#4a3a8a` (mitad Oscuridad); la grieta central blanca `#ffffff`.
- **Movimiento:** 0–700 ms: el área se tiñe desde los bordes, Nano levita y la balanza desciende; 700 ms: la grieta se abre de arriba hacia abajo en 3 cuadros y las mitades se desplazan en sentidos opuestos; las columnas de luz suben y las zarpas bajan; luego el mundo queda desaturado 8 s.
- **Anticipación:** Dura 700 ms reales (el canal): 6 cuadros. Mostrar el círculo de 440 u de radio cerrándose y los comunes aturdidos con una runa sobre la cabeza.
- **Impacto:** Frame blanco total de 1 cuadro (flash), grieta + dos mitades + sacudida; cada común ejecutado se desintegra en polvo blanco o negro según su lado.
- **Disipación:** Las mitades se funden en 6 cuadros y deja a Nano con Forma del Regente (ver pasiva) durante 8 s.
- **Frames sugeridos:** anticipación 6 · impacto 6 · disipación 6 (= 18 cuadros) + bucle de 8 cuadros
- **Loop:** Bucle de 8 cuadros del borde de la grieta durante el canal; el resto no repite. Capa de desaturación: efecto de pantalla, no un sprite.
- **Tamaño de los assets:**
  - Disco de la arena (mitades, 4 cuadrantes de ≤220 px recomendados): 880×880 u → **440×440 px** nativos (2 u/px)
  - Grieta central: 40×880 u → **20×440 px** nativos (2 u/px)
  - Balanza + martillo sobre Nano: 120×120 u → **120×120 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Pilares/zarpas en el borde, polvo blanco y negro. 880 u supera los 650 u del lado corto de pantalla: ver nota de tamaños en INDEX_B (`kvbS` limita a 128 px).
- **Ícono 16×16:** hoy `scales+ring` (`js/ui/skill-pixel-glyphs.js:195`); propuesta: balanza con plato blanco y plato negro.
- **Cómo se distingue de las otras del mismo campeón:** La única que cubre toda la pantalla y la única bicolor dividida; el resto son formas locales de un solo color.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Force Quit (Axiom, colores invertidos) y Catedral del Sol (Aurelia): Axiom invierte colores del mundo en neón, Aurelia es dorada y arquitectónica; Nano parte el campo en dos mitades blanca/negra con grieta.

### Pasiva — Autoridad del GM — Forma del Regente

- **Mecánica (código):** Alternar afinidades acumula Equilibrio; con 2 Luz y 2 Sombra entra en Forma del Regente 8 s (recarga interna 20 s): ambas afinidades, +20% de daño, −15% de daño recibido, +15% de radio. Hoy se dibuja un ala de luz y una ala de sombra que se abren (más abiertas en Regente/definitiva), un halo con media luna y la etiqueta "◐ REGENTE"; el anillo de entrada es dorado.
- **Tipo:** aura / transformación visual · **Fuente:** `js/champions/ascension/catalog.js:17`; `js/champions/ascension/runtime.js:54`; `js/champions/ascension/render.js:19`; `js/champions/ascension/render.js:220`
- **Silueta y forma:** Dos alas asimétricas detrás de la espalda (ala de luz de plumas rectas y blancas, ala de sombra de filos angulares negros) y un halo roto con media luna sobre la cabeza.
- **Color dominante:** Alas: marfil `#fff4d6` y negro-índigo `#15122a`; halo oro `#e8c56a`.
- **Movimiento:** En reposo las alas están medio cerradas; al entrar en Regente se abren completas y laten lentas; anillo dorado que se expande de 40 a 100 u al entrar.
- **Anticipación:** Anillo de entrada 3 cuadros.
- **Impacto:** Alas abiertas con destello.
- **Disipación:** Se pliegan al terminar los 8 s.
- **Frames sugeridos:** anticipación 3 · impacto 2 · disipación 3 (= 8 cuadros) + bucle de 6 cuadros
- **Loop:** Alas abiertas: bucle de 6 cuadros (aleteo leve).
- **Tamaño de los assets:**
  - Par de alas (capa detrás del cuerpo): 84×64 u → **84×64 px** nativos (1 u/px)
  - Anillo de entrada: 200×200 u → **200×200 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Las alas son capa propia (ART_BIBLE §7); no cambian el diseño del personaje.
- **Cómo se distingue de las otras del mismo campeón:** Es una aura del cuerpo, no un área; se diferencia del Juicio por ser pequeña y persistente.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Alas de Saelis (plumas azules) y de Elyra (alas de luz): las de Nano son asimétricas y bicolor.

