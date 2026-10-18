# Zahra — La Mano de la Válvula (La Devoradora de Brasas) (`zahra`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones). Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Maga de calor (`roleCategory: mago`), a distancia (básico 220 u, 550 ms). Su Calor (0–100) sube con las habilidades: desde 60 hace +15% de daño; a 100 se sobrecalienta 1,8 s y solo puede usar Enfriar.
- **Tono:** Seca, responsable y tensa: la que sostuvo una válvula para que otros escaparan. Horno, vapor y ceniza; fuego controlado y cuenta regresiva, no pirotecnia.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:49`; `js/champions/expedition/catalog.js:54`; `js/champions/expedition/runtime.js:60`; `js/champions/expedition/runtime.js:62`; pasiva en `js/champions/expedition/catalog.js:52`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/zahra/atlas.png`: cobre `#903010`/`#703010`, marrón `#503030`, naranja piel `#f09070`/`#f0b070`. Color de clase `#ed8858` (`catalog.js:49`). Guante de horno enorme, delantal chamuscado, máscara subida.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Naranja horno (dominante) | `#ed8858` |
  | Amarillo brasa (brillo) | `#ffc27a` |
  | Rojo carbón (sombra) | `#a8431a` |
  | Marrón-negro (contorno) | `#2a1008` |
  | Crema caliente (núcleo) | `#fff2cc` |
  | Vapor gris-azul (Enfriar y válvulas) | `#8fa4b8` |

- **Motivos visuales:** boca de horno, llamas contenidas, brasas, ceniza gris, vapor blanco-azulado, válvulas y volantes, indicador de calor, compuertas.
- **NO debe parecerse a:** **Brasa** (cobre `#c58543`, Purga de Vapor: cono de vapor con remaches): Zahra es llama viva y brasa en el cono, y vapor azulado solo en Enfriar/ult. **Orsa** (ámbar-cobre, circuitos) y **Tibor** (miel). **Thalen** (Muro de Fuego, naranja + púrpura): la llama de Zahra es de horno (naranja carbón), con ceniza gris. **Segador/Veyra** (rojo).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (vapor)

- **Mecánica (código):** A distancia: `basicRange` 220 u (el menor de los magos), enfriamiento 550 ms, proyectil `steam` (nube de vapor) a 420 u/s, radio 8 u, vida 900 ms; pose 190 ms.
- **Tipo:** proyectil · **Fuente:** `js/champions/expedition/catalog.js:49`; `js/champions/expedition/register.js:3`; `js/skills/abilities.js:209`
- **Silueta y forma:** Una bocanada de vapor (≈20 u) con una brasa dentro y una cola de 2 volutas.
- **Color dominante:** Vapor `#cfe0ee` con brasa `#ffc27a` al centro.
- **Movimiento:** Vuela con un leve ascenso y expansión (crece 20% al final); la brasa parpadea.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de brillo en el guante.
- **Impacto:** Soplo de 17 u: nube que se abre y 2 brasas.
- **Disipación:** El vapor se disipa en 4 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 4 (= 8 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Bocanada: 20×20 u → **20×20 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es vapor con brasa, pequeño; el cono es llama y la ult es vapor en pulsos.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Proyectil de Brasa (`nut`, tuerca) y de Myla: la bocanada de vapor con brasa es de Zahra.

### Habilidad 1 — Boca de horno

- **Mecánica (código):** `furnace`: cono de 190 u de alcance y semiángulo 0,85 rad (≈97°), premarcado `cone`; 4,4× de daño (el más alto del cono), hasta 12 enemigos; suma 30 de Calor. Coste 25, enfriamiento 6000 ms.
- **Tipo:** cono (llamarada) · **Fuente:** `js/champions/expedition/catalog.js:54`; `js/champions/expedition/runtime.js:60`; `js/skills/aim-targeting.js:72`
- **Silueta y forma:** Una llamarada de 190 u: lengua central larga y tres laterales cortas, con brasas que saltan; la base es la boca del guante.
- **Color dominante:** Naranja `#ed8858` con amarillo `#ffc27a` en el centro y rojo carbón `#a8431a` en los bordes; brasas `#fff2cc`.
- **Movimiento:** La llama se alarga hasta 190 u en 3 cuadros, ondulando; al terminar, las brasas caen y el aire tiembla.
- **Anticipación:** Sector punteado del premarcado; 2 cuadros de fuego concentrándose en el guante.
- **Impacto:** La llama llena el cono con un destello blanco-crema en el centro; cada enemigo recibe una chispa de brasas.
- **Disipación:** La llama se encoge a la boca del guante en 4 cuadros y suelta brasas.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Sector de llama (largo × ancho en la punta): 190×285,5 u → **190×285 px** nativos (1 u/px)
  - Brasa suelta: 4×4 u → **4×4 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Que se vea como llama de horno (compacta, controlada), no como bola de fuego.
- **Ícono 16×16:** hoy `furnace+flame` (`js/ui/skill-pixel-glyphs.js:192`); propuesta: horno con llama.
- **Cómo se distingue de las otras del mismo campeón:** La única de fuego vivo; Enfriar es vapor, Paso es ceniza, la ult son pulsos de vapor.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Purga de Vapor (Brasa)**: también cono, pero de vapor blanco-cobre. **Muro de Fuego (Thalen)**: anillo de fuego. **Astillas (Nahir)** / **Agujas (Vesper)** (mismos 97°): la llama es una masa continua, no objetos.

### Habilidad 2 — Enfriar

- **Mecánica (código):** `quench`: sin apuntado; consume todo el Calor, da escudo de 4% a 12% de la vida máxima según el calor consumido (3 s) y apaga sus propias líneas de fuego a ≤160 u (el radio de 140 u del catálogo es solo el del efecto visual, sin daño). Es la única habilidad usable durante la recuperación. Coste 26, enfriamiento 11000 ms. Sin daño.
- **Tipo:** área centrada en el héroe (vapor) + escudo según el Calor · **Fuente:** `js/champions/expedition/catalog.js:54`; `js/champions/expedition/runtime.js:61`; `js/champions/expedition/runtime.js:132`
- **Silueta y forma:** Una nube de vapor blanco-azulado que brota del guante y se expande en un círculo de ⌀280 u; el guante humea y se oscurece.
- **Color dominante:** Vapor `#cfe0ee` y `#eef6fc`; sombras `#8fa4b8`; brasa que se apaga `#a8431a`.
- **Movimiento:** El vapor sale en un chorro y se abre en 4 cuadros; el guante pasa de naranja a gris; un escudo de vapor (⌀50 u) se forma y dura 3 s.
- **Anticipación:** Pose de 420 ms: el puño se abre y silba (1–2 cuadros).
- **Impacto:** Nube de vapor de 140 u de radio; las líneas de fuego propias se apagan con un siseo.
- **Disipación:** El vapor sube y se disipa en 6 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 6 (= 12 cuadros) + bucle de 6 cuadros
- **Loop:** Escudo de vapor en bucle de 6 cuadros durante 3 s.
- **Tamaño de los assets:**
  - Nube de vapor: 280×280 u → **140×140 px** nativos (2 u/px)
  - Escudo de vapor: 50×50 u → **50×50 px** nativos (1 u/px)
- **Partículas / capas secundarias:** El tono del vapor cambia con el calor consumido: más oscuro/denso con más calor.
- **Ícono 16×16:** hoy `ember+snow` (`js/ui/skill-pixel-glyphs.js:192`); propuesta: brasa apagándose con copo.
- **Cómo se distingue de las otras del mismo campeón:** Es la única fría y sin daño; el resto son llama y ceniza.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Burbuja Cremosa (Myla)** y **Nova de Escarcha (Thalen)**: Zahra no congela ni es una burbuja; es vapor que sube, gris-azulado.

### Habilidad 3 — Paso de ceniza

- **Mecánica (código):** `ash_step`: avanza hasta 120 u por suelo seguro (premarcado `dash` de 30 u) y deja una línea de ceniza entre el origen y la llegada que dura 2400 ms y pulsa 4 veces (cada 600 ms) a ≤28 u con 0,8×; suma 25 de Calor. Máx. 2 líneas. Coste 26, enfriamiento 9500 ms.
- **Tipo:** desplazamiento + zona lineal (4 pulsos) · **Fuente:** `js/champions/expedition/catalog.js:54`; `js/champions/expedition/runtime.js:34`; `js/champions/expedition/runtime.js:97`; `js/skills/aim-targeting.js:66`
- **Silueta y forma:** Una estela de ceniza gris de 120 × 56 u con brasas incrustadas que laten; el humo sube en volutas.
- **Color dominante:** Gris ceniza `#6a6560` y `#a9a39b`; brasas `#ed8858`/`#ffc27a`.
- **Movimiento:** Zahra se desvanece en ceniza y reaparece; la línea se enciende de brasa en brasa en 3 cuadros y pulsa 4 veces.
- **Anticipación:** Premarcado de salto (existente); 1 cuadro de brasas en los pies.
- **Impacto:** Cada pulso: las brasas brillan 2 cuadros y suelta una chispa.
- **Disipación:** La ceniza se apaga y se disuelve en 5 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 5 (= 9 cuadros) + bucle de 8 cuadros
- **Loop:** Línea en bucle de 8 cuadros (brasas que laten) durante 2,4 s.
- **Tamaño de los assets:**
  - Estela de ceniza (largo × ancho): 120×56 u → **120×56 px** nativos (1 u/px)
  - Brasa: 4×4 u → **4×4 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Hasta 2 líneas simultáneas.
- **Ícono 16×16:** hoy `boots+flame` (`js/ui/skill-pixel-glyphs.js:192`); propuesta: botas con llama.
- **Cómo se distingue de las otras del mismo campeón:** Es la única gris; Boca es llama brillante y Enfriar es vapor claro.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Costura de fuga (Vesper)** (violeta/marfil) y **Surco de contención (Renko)** (marrón): líneas tras un desplazamiento. La de Zahra es gris con brasas.

### Definitiva — Abrir todas las válvulas

- **Mecánica (código):** `vent`: sin apuntado; coste 0, enfriamiento 36000 ms, dura 2400 ms, sigue a Zahra. Cuatro pulsos (cada 600 ms) en un radio de 155 u con 1,8× (+0,4% por punto de Calor consumido, hasta +40%); el Calor vuelve a 0 y los aliados a ≤215 u reciben escudo 5% por 2,4 s.
- **Tipo:** aura móvil (4 pulsos de vapor) · **Fuente:** `js/champions/expedition/catalog.js:54`; `js/champions/expedition/runtime.js:62`; `js/champions/expedition/runtime.js:104`
- **Silueta y forma:** Seis válvulas gigantes de latón con volante (⌀40 u cada una) alrededor de Zahra, en un anillo de ⌀310 u, que sueltan chorros de vapor ardiente hacia afuera en cada pulso.
- **Color dominante:** Vapor blanco-azulado `#eef6fc` con interior naranja `#ed8858` y brasas `#ffc27a`; válvulas latón `#c98a4a`.
- **Movimiento:** Las válvulas giran sus volantes y se abren de una en una (cada pulso, un chorro mayor); el anillo de vapor se expande y vuelve; el calor cambia de naranja a blanco.
- **Anticipación:** Pose de 650 ms: las válvulas se materializan alrededor y el guante se pone al rojo blanco (6 cuadros).
- **Impacto:** Cada pulso: chorros de 155 u de radio con silbido y sacudida corta en el 4º.
- **Disipación:** Las válvulas se cierran y el vapor sube en 6 cuadros.
- **Frames sugeridos:** anticipación 6 · impacto 4 · disipación 6 (= 16 cuadros) + bucle de 8 cuadros
- **Loop:** Anillo de válvulas y vapor en bucle de 8 cuadros durante 2,4 s; los chorros son una capa de 4 cuadros por pulso.
- **Tamaño de los assets:**
  - Anillo de válvulas y vapor (bucle): 310×310 u → **155×155 px** nativos (2 u/px)
  - Válvula con volante: 40×40 u → **40×40 px** nativos (1 u/px)
  - Chorro de vapor: 155×40 u → **155×40 px** nativos (1 u/px)
- **Partículas / capas secundarias:** El tamaño de los chorros crece con el calor consumido (lectura del bono).
- **Ícono 16×16:** hoy `valve+ring` (`js/ui/skill-pixel-glyphs.js:192`); propuesta: válvula con anillo.
- **Cómo se distingue de las otras del mismo campeón:** La única con válvulas y vapor ardiente; Boca es llama directa, Enfriar vapor frío, Paso ceniza.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Eclipse (Khepri)**, **Tormenta de rescate (Orsa)**, **Última puntada (Vesper)**: ultis móviles de 4 pulsos. Zahra = válvulas de latón con vapor.

### Pasiva — Calor prestado (indicador)

- **Mecánica (código):** Calor 0–100: desde 60, +15% de daño; a 100 entra 1,8 s en recuperación (solo Enfriar); pierde 1,5/s fuera de uso. Hoy se muestra como texto "NN°" sobre la cabeza.
- **Tipo:** indicador numérico + estado de sobrecalentamiento · **Fuente:** `js/champions/expedition/catalog.js:52`; `js/champions/expedition/render.js:34`; `js/champions/expedition/runtime.js:72`
- **Silueta y forma:** (Propuesta) un guante que cambia de color con el calor: gris (0–30), naranja (30–60), rojo vivo con grietas (60–99), blanco incandescente con humo (100).
- **Color dominante:** Gris `#6a6560` → naranja `#ed8858` → rojo `#a8431a` → crema `#fff2cc`.
- **Movimiento:** Parpadeo creciente entre 60 y 100; sobrecalentamiento: vibración y humo.
- **Anticipación:** —
- **Impacto:** Entrada en recuperación: silbido de vapor.
- **Disipación:** —
- **Frames sugeridos:** anticipación 0 · impacto 2 · disipación 0 (= 2 cuadros) + bucle de 4 cuadros
- **Loop:** Bucle de 4 cuadros por nivel de calor (4 variantes).
- **Tamaño de los assets:**
  - Guante (4 variantes de calor): 30×30 u → **30×30 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Opcional: el número actual funciona; no cambia la mecánica.
- **Cómo se distingue de las otras del mismo campeón:** Es continuo y pequeño.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Contador de Tibor (%): distinto color y forma.

