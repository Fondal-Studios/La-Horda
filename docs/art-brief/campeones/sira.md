# Sira — La Cartógrafa del Regreso (La Cartógrafa de lo Perdido) (`sira`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Maga de trazado (`roleCategory: mago`), a distancia (básico 310 u, 570 ms). Dibuja con su propio recorrido (hasta 12 puntos de los últimos 4 s) y lo convierte en ataques.
- **Tono:** Meticulosa, melancólica y decidida: marca los caminos por los que alguien consiguió volver. Tinta, pergamino, brújula, cruces de mapa; líneas hechas a mano, no mágicas ni eléctricas.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:61`; `js/champions/expedition/catalog.js:66`; `js/champions/expedition/runtime.js:67`; pasiva en `js/champions/expedition/catalog.js:64`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/sira/atlas.png`: grises claros `#d0d0d0`/`#b0b0b0`, piel `#f0d0b0`, azul `#303070`/`#707090`. Color de clase `#8aa7da` (`catalog.js:61`). Capa corta con mapas, rollo lateral, pluma de agrimensor.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Azul tinta (dominante) | `#3b5a9a` |
  | Azul claro de trazo | `#8aa7da` |
  | Azul-negro (tinta seca y contorno) | `#101a33` |
  | Pergamino (papel) | `#e8d9b0` |
  | Blanco azulado (brillo) | `#cfe0ff` |
  | Rojo de cruz de mapa (acento puntual) | `#c0453a` |

- **Motivos visuales:** trazos de pluma con salpicaduras, cruces X de tesoro/mapa, líneas punteadas de ruta, huellas, brújula, rosa de los vientos, pergamino que se despliega, goma de borrar.
- **NO debe parecerse a:** **Iria** (hilos y anclas, `#8889c1`, violeta-azulado): Sira es azul tinta con pergamino y cruces, líneas "a mano"; Iria es hilo tenso con nudos. **Vhal** (índigo con estrellas) y **Saelis** (celeste): sin estrellas ni plumas. **Orsa/Nano GM** (otras líneas largas): Sira es siempre tinta azul con salpicaduras, nunca cobre ni negro-oro.

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (brújula)

- **Mecánica (código):** A distancia: `basicRange` 310 u, enfriamiento 570 ms, proyectil `compass` (brújula) a 420 u/s, radio 8 u, vida 900 ms; pose 190 ms.
- **Tipo:** proyectil · **Fuente:** `js/champions/expedition/catalog.js:61`; `js/champions/expedition/register.js:3`; `js/skills/abilities.js:209`
- **Silueta y forma:** Una brújula pequeña (≈18 u) con aguja roja, girando sobre sí; deja una gotita de tinta.
- **Color dominante:** Plata/pergamino `#e8d9b0` con aguja roja `#c0453a` y tinta `#3b5a9a`.
- **Movimiento:** Vuela girando; la aguja siempre apunta hacia el blanco.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de pluma que traza un punto.
- **Impacto:** Mancha de tinta de 17 u con una pequeña cruz X.
- **Disipación:** La tinta se seca en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Brújula: 18×18 u → **18×18 px** nativos (1 u/px)
  - Mancha de tinta: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es pequeña y de objeto; las habilidades son trazos largos, goma y pergaminos.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Disparo de Orsa (perno) y de Vhal (cometa): objetos distintos; la brújula es plateada con aguja roja.

### Habilidad 1 — Línea de tinta

- **Mecánica (código):** `ink_line`: línea de 290 u (premarcado `line` de 22 u; el golpe alcanza 24 u + radio del enemigo), 4,41×, atraviesa hasta 12 enemigos. Coste 25, enfriamiento 6000 ms. Sin estado.
- **Tipo:** línea (proyectil perforante instantáneo) · **Fuente:** `js/champions/expedition/catalog.js:66`; `js/champions/expedition/runtime.js:67`; `js/skills/aim-targeting.js:73`
- **Silueta y forma:** Un trazo largo de pluma de 290 × 48 u, más grueso al principio y afinándose al final como una pincelada, con salpicaduras a los costados y una cruz X donde termina.
- **Color dominante:** Azul tinta `#3b5a9a` con borde claro `#8aa7da`; cruz roja `#c0453a`.
- **Movimiento:** La pluma traza la línea de principio a fin en 3 cuadros (velocidad de pincelada); las salpicaduras saltan perpendicularmente.
- **Anticipación:** Premarcado lineal (existente); 2 cuadros de la pluma levantándose.
- **Impacto:** En cada enemigo: mancha de tinta de 24 u y un pequeño tachón.
- **Disipación:** La tinta se seca y se aclara de azul a gris en 5 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 5 (= 10 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Trazo: 290×48 u → **145×24 px** nativos (2 u/px)
  - Mancha por enemigo: 48×48 u → **48×48 px** nativos (1 u/px)
  - Cruz X final: 24×24 u → **24×24 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Salpicaduras (motivo `si_scrap`/gotas); evitar que la línea parezca un rayo.
- **Ícono 16×16:** hoy `quill+arrow` (`js/ui/skill-pixel-glyphs.js:194`); propuesta: pluma con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única línea recta de pincelada; Volver y Borrar siguen el trazo curvo real de Sira, Atlas es un mapa.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Perno conductor (Orsa)**, **Sentencia Umbría (Nano GM)**, **Corte cruzado (Nahir)**: líneas largas. La de Sira es tinta azul con salpicaduras y X; las otras: cobre, negro-oro, blanco-aguamarina.

### Habilidad 2 — Volver sobre los pasos

- **Mecánica (código):** `retrace`: recorre hacia atrás hasta 170 u del trazo reciente válido, comprobando muros y vacíos paso a paso (sin trazo: retrocede un tramo corto, ≤120 u); gana +20% de velocidad 2,5 s y borra el trazo. Sin daño ni apuntado. Coste 24, enfriamiento 10500 ms.
- **Tipo:** desplazamiento (rebobinado por el trazo) · **Fuente:** `js/champions/expedition/catalog.js:66`; `js/champions/expedition/runtime.js:68`; `js/champions/expedition/runtime.js:18`
- **Silueta y forma:** La ruta reciente se enciende como una línea punteada con flechas "‹‹‹" (chevrones) en sentido contrario; Sira se desliza sobre ella como sobre un hilo.
- **Color dominante:** Azul claro `#8aa7da` y blanco azulado `#cfe0ff` sobre el trazo; chevrones `#e8d9b0`.
- **Movimiento:** Los chevrones corren de la posición actual hacia el origen del trazo en 4 cuadros; Sira se arrastra por encima, con huellas que desaparecen.
- **Anticipación:** Se ven las huellas/trazo reciente (indicador existente) resaltarse 2 cuadros.
- **Impacto:** Al llegar al final del trazo: pequeño sello de brújula ⌀40 u.
- **Disipación:** La línea punteada se borra de a tramos en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 4 (= 10 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Trazo con chevrones (hasta 170 u): 170×24 u → **85×12 px** nativos (2 u/px)
  - Sello de brújula final: 40×40 u → **40×40 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Las huellas son las que ya dibuja el juego (rastro de tinta de la pasiva); no duplicarlas.
- **Ícono 16×16:** hoy `footprints+arrow` (`js/ui/skill-pixel-glyphs.js:194`); propuesta: huellas con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única sin daño y de movimiento hacia atrás; las otras tres hieren.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Paso de ceniza (Zahra)**, **Costura de fuga (Vesper)** y **Reflejo fugitivo (Nahir)**: desplazamientos que dejan algo. Sira no deja nada (borra); el efecto es el rebobinado de sus propias huellas.

### Habilidad 3 — Borrar el camino

- **Mecánica (código):** `erase`: consume el trazo reciente y golpea una sola vez a todo enemigo a ≤28 u de alguno de sus segmentos (hasta 12 puntos / 4 s); sin ruta usa un círculo de 80 u alrededor de ella. 5,04×. Coste 28, enfriamiento 8500 ms.
- **Tipo:** golpe sobre el trazo (línea poligonal del recorrido) · **Fuente:** `js/champions/expedition/catalog.js:66`; `js/champions/expedition/runtime.js:69`; `js/champions/expedition/runtime.js:19`
- **Silueta y forma:** Una goma gigante recorre el trazo real de Sira como una cinta ancha (56 u) que "borra" la línea y daña lo que toque; sin ruta, un círculo de goma de ⌀160 u alrededor de ella.
- **Color dominante:** Blanco pergamino `#e8d9b0` (la goma) sobre azul tinta `#3b5a9a` que se desvanece; migas de goma `#cfe0ff`.
- **Movimiento:** La cinta recorre el trazo desde el pie de Sira hacia el origen en 3 cuadros y deja una estela blanca que se desvanece; migas saltan.
- **Anticipación:** El trazo (indicador existente) se resalta 2 cuadros.
- **Impacto:** En cada enemigo tocado: manchón blanco de 24 u con migas.
- **Disipación:** La cinta blanca se disipa en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Cinta de goma (segmento tipo, ancho 56 u): 120×56 u → **120×56 px** nativos (1 u/px)
  - Círculo sin ruta: 160×160 u → **80×80 px** nativos (2 u/px)
  - Migas: 8×8 u → **8×8 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Se dibuja siguiendo el trazo real: usar un sprite repetible por segmento (tileable) en vez de un único dibujo.
- **Ícono 16×16:** hoy `eraser+x` (`js/ui/skill-pixel-glyphs.js:194`); propuesta: goma de borrar con tacha.
- **Cómo se distingue de las otras del mismo campeón:** Blanco sobre azul y de trazo real; la Línea es azul sobre suelo y recta.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Corte de Hilo (Iria)**: descarga de hilos consumidos. El de Sira es una goma blanca que borra tinta.

### Definitiva — Atlas de los ausentes

- **Mecánica (código):** `atlas`: sin apuntado; coste 0, enfriamiento 36000 ms, dura 2400 ms. Copia la ruta (si no hay, un rombo local de 80 u) y la golpea en 3 pulsos (uno cada 800 ms) con 2,016× y ancho de golpe 32 u. Frena 30% por 1500 ms a los enemigos a ≤112 u y da +15% de velocidad a los aliados a ≤112 u durante 2400 ms. No altera el mapa.
- **Tipo:** tres pulsos sobre una copia de la ruta (zona lineal) · **Fuente:** `js/champions/expedition/catalog.js:66`; `js/champions/expedition/runtime.js:70`; `js/champions/expedition/runtime.js:106`
- **Silueta y forma:** Un pergamino de mapa que se despliega en el suelo siguiendo la ruta: bordes de papel, rosa de los vientos, cruces X y líneas punteadas; sin ruta, un rombo-mapa de 160 × 160 u.
- **Color dominante:** Pergamino `#e8d9b0` y azul tinta `#3b5a9a`; rosa de los vientos `#8aa7da`; cruces rojas `#c0453a`.
- **Movimiento:** El pergamino se despliega desde el pie de Sira siguiendo la ruta en 5 cuadros; cada pulso (3) ilumina las líneas del mapa de un extremo a otro.
- **Anticipación:** Pose de 650 ms: la capa se despliega y se ve la ruta como mapa (6 cuadros).
- **Impacto:** Cada pulso: luz azul blanca recorriendo el mapa y golpes de 32 u sobre los enemigos en la línea.
- **Disipación:** El mapa se pliega y se arruga en 6 cuadros.
- **Frames sugeridos:** anticipación 6 · impacto 3 · disipación 6 (= 15 cuadros) + bucle de 8 cuadros
- **Loop:** Mapa vivo en bucle de 8 cuadros durante 2,4 s; los 3 pulsos son una capa extra de 3 cuadros.
- **Tamaño de los assets:**
  - Rombo-mapa (sin ruta): 160×160 u → **80×80 px** nativos (2 u/px)
  - Segmento de pergamino (tileable por tramo de ruta): 75×64 u → **75×64 px** nativos (1 u/px)
  - Rosa de los vientos: 64×64 u → **64×64 px** nativos (1 u/px)
- **Partículas / capas secundarias:** La forma real depende de la ruta (hasta 12 puntos, 75 u entre puntos como máximo): hacer el pergamino modular.
- **Ícono 16×16:** hoy `map+ring` (`js/ui/skill-pixel-glyphs.js:194`); propuesta: mapa con anillo.
- **Cómo se distingue de las otras del mismo campeón:** Es la única con papel y rosa de los vientos y la única de tres pulsos sobre la ruta.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Paso Seguro (Farolero)** e **hilos de Iria**: senderos de luz o de hilo. El Atlas es pergamino.

### Pasiva — Trazado reciente (rastro de tinta)

- **Mecánica (código):** Conserva hasta 12 puntos de los últimos 4 s; un salto de más de 75 u o terreno inaccesible interrumpe el trazo. Hoy el juego dibuja la ruta como una línea de 2 px; vfx-b la cambió por huellas de tinta que se desvanecen.
- **Tipo:** rastro visible detrás del héroe · **Fuente:** `js/champions/expedition/catalog.js:64`; `js/champions/expedition/render.js:35`; `js/champions/expedition/runtime.js:115`
- **Silueta y forma:** Huellas pequeñas de zapato alternadas, con una gota de tinta cada 3 pasos, a lo largo de los últimos 4 s.
- **Color dominante:** Azul tinta `#3b5a9a`; gotas `#101a33`.
- **Movimiento:** Cada huella aparece pegada al paso (cuando el héroe se mueve ≥16 u) y se desvanece a los 4 s por tramado.
- **Anticipación:** —
- **Impacto:** Aparición.
- **Disipación:** Desvanecimiento de 5 cuadros.
- **Frames sugeridos:** anticipación 0 · impacto 2 · disipación 5 (= 7 cuadros)
- **Loop:** No hace bucle (sprite suelto repetible).
- **Tamaño de los assets:**
  - Huella: 10×10 u → **10×10 px** nativos (1 u/px)
  - Gota de tinta: 6×6 u → **6×6 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Máx. 12 huellas visibles; deben leerse bien porque son la "munición" de Volver, Borrar y Atlas.
- **Cómo se distingue de las otras del mismo campeón:** Es continuo y discreto; no compite con los golpes.
- **Habilidad más parecida de otro campeón y cómo evitarla:** No hay otro rastro persistente en el roster que se le parezca; solo evitar que se lea como el Paso Seguro del Farolero (luz) o como los hilos de Iria.

