# Veyra — La Última Herida (`veyra`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Asesina de riesgo (`roleCategory: asesino`), cuerpo a cuerpo (básico 70 u, 450 ms). Sangrados, un desplazamiento que hiere y un pacto que cuesta vida; pega más fuerte con menos de 40% de vida.
- **Tono:** Fría, dura y con pulso: regresó de un campo de batalla con una herida que no cierra y escucha sus latidos. Rojo vivo, cortes finos y rápidos; dramatismo contenido, no gore.
- **Fuentes del kit:** `js/champions/quality-five/veyra.js:3`; `js/champions/quality-five/veyra.js:23`; `js/champions/quality-five/register.js:33`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/veyra/atlas.png`: carmesí `#701030`/`#901030`/`#501030`, piel `#f0b090`, rosados `#b07070`. Color de clase `#ab3459` (`quality-five/register.js:34`).
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Carmesí vivo (dominante) | `#ab3459` |
  | Rosa sangre (brillo del filo) | `#ff7d8e` |
  | Carmesí profundo (sombra) | `#7a1d38` |
  | Negro-rojo (contorno) | `#2a0612` |
  | Rosa pálido (corte y vendas) | `#ffd6dc` |
  | Gris acero frío (filo de la daga) | `#b8bcc8` |

- **Motivos visuales:** cortes finos, gotas largas, latido de corazón (lub-dub), vendas, herida abierta, estelas de sangre, ritmo de pulso (líneas de electrocardiograma).
- **Pasiva:** *Al filo* (+15% de daño de habilidades y sangrados con menos de 40% de vida, `register.js`) no tiene indicador propio. Opcional: un latido rojo en los bordes del héroe bajo 40%.
- **NO debe parecerse a:** **Segador** (rojo ladrillo `#c62828`, hoja ancha y almas) y **Kael/Guerrero** (rojo `#c4544a`, dagas): Veyra es carmesí-rosado, cortes finos y latidos; sin guadañas ni calaveras. **Solciju** (vino `#923951`, color vecino): Veyra es brillante y opaca con cortes; el vino es oscuro y translúcido con vidrio. **Vesper** (violeta con hilo).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (daga)

- **Mecánica (código):** Melee: golpea a todo enemigo a ≤70 u (con un tope de 12 víctimas por golpe), enfriamiento 450 ms, pose 190 ms; destello de tajo a 38 u.
- **Tipo:** cuerpo a cuerpo (círculo de golpe, tope de 12 blancos) · **Fuente:** `js/champions/quality-five/register.js:33`; `js/champions/quality-five/veyra.js:79`; `js/skills/abilities.js:235`
- **Silueta y forma:** Un tajo diagonal fino de 44 u con una gota larga que se desprende.
- **Color dominante:** Rosa sangre `#ff7d8e` en el filo y carmesí `#ab3459` en la estela.
- **Movimiento:** Barrido diagonal rápido de 2 cuadros, con una gota que cae.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de brillo en la daga.
- **Impacto:** Línea de corte de 17 u y 2 gotas.
- **Disipación:** Las gotas caen y desaparecen en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 2 · disipación 3 (= 6 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Tajo: 44×20 u → **44×20 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es una línea corta; las habilidades son abanico de tres cortes, estela de sangre, sello y corte gigante.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Tajo del Segador (arco ancho rojo ladrillo) y de Musashi: el de Veyra es fino, diagonal y rosado.

### Habilidad 1 — Abrir la herida

- **Mecánica (código):** `vey_cut`: cono de 130 u (el alcance se limita a 180 u) y semiángulo 0,85 rad (≈97°), premarcado `cone`, 0,85×; cada golpeado sangra 3 pulsos (1 s, 12% del daño cada uno); si tiene el talento "Incisión recta" pasa a ser una línea de 35 u de ancho. Coste 22, enfriamiento 5500 ms.
- **Tipo:** cono (tres tajos) + sangrado · **Fuente:** `js/champions/quality-five/veyra.js:4`; `js/champions/quality-five/veyra.js:30`; `js/champions/quality-five/veyra.js:10`; `js/champions/quality-five/veyra.js:87`
- **Silueta y forma:** Tres tajos curvos finos de 130 u en abanico (uno central y dos laterales) que se cruzan en el centro formando una garra, con gotas largas hacia afuera.
- **Color dominante:** Rosa sangre `#ff7d8e` en el filo, carmesí `#ab3459` en la estela; gotas `#7a1d38`.
- **Movimiento:** Los tres tajos barren secuencialmente (izquierda, derecha, centro) en 3 cuadros; la herida de cada blanco queda abierta con un hilo de sangre.
- **Anticipación:** Premarcado cónico (existente); 2 cuadros con la daga atrás.
- **Impacto:** Cada enemigo golpeado recibe una herida (línea de 12 u con gota) que gotea 3 s (3 pulsos).
- **Disipación:** Los tajos se afinan y se apagan en 4 cuadros; las heridas pulsan 3 veces (1 s) antes de cerrarse.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros)
- **Loop:** La herida sobre el enemigo repite 3 cuadros por pulso (3 pulsos).
- **Tamaño de los assets:**
  - Garra de tres tajos (largo × ancho en la punta): 130×195,3 u → **65×98 px** nativos (2 u/px)
  - Herida sobre enemigo: 14×14 u → **14×14 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Gotas largas que caen con el pulso; variante "línea recta" opcional si el talento está activo.
- **Ícono 16×16:** hoy `wound+x` (`js/ui/skill-pixel-glyphs.js:205`); propuesta: herida con tacha.
- **Cómo se distingue de las otras del mismo campeón:** Es el único abanico/garra; Paso es una estela, Pacto un sello y la ulti un corte circular.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Tajo del Segador** (cono ancho, 77°) y **Cosecha de Almas (Ilvar)**: véanse sus fichas. Veyra = tres cortes finos rosados que se cruzan, no un arco ancho.

### Habilidad 2 — Paso escarlata

- **Mecánica (código):** `vey_dash`: avanza hasta 145 u (premarcado `dash` de 28 u; sin atravesar muros), 0,65× a quienes cruza (ancho 28 u) y los hace sangrar. Con el talento "Evasión" gana +15% de armadura 1,5 s. Coste 28, enfriamiento 8000 ms.
- **Tipo:** desplazamiento que hiere · **Fuente:** `js/champions/quality-five/veyra.js:5`; `js/champions/quality-five/veyra.js:34`; `js/champions/quality-five/veyra.js:88`
- **Silueta y forma:** Una estela de sangre de 145 × 40 u con una herida abierta (tajo de 60 u) en el punto de llegada; la silueta de Veyra se estira en la dirección del movimiento.
- **Color dominante:** Carmesí `#ab3459` con rosa sangre `#ff7d8e` en los bordes.
- **Movimiento:** El cuerpo se estira y atraviesa; gotas salen despedidas hacia los costados; en la llegada, el tajo se abre.
- **Anticipación:** Premarcado de salto (existente); 1 cuadro de agachado.
- **Impacto:** Tajo de llegada de 60 u con salpicadura.
- **Disipación:** La estela se afina y desaparece en 5 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 5 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Estela: 145×40 u → **145×40 px** nativos (1 u/px)
  - Tajo de llegada: 60×40 u → **60×40 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Gotas de sangre en parábola.
- **Ícono 16×16:** hoy `dagger+arrow` (`js/ui/skill-pixel-glyphs.js:205`); propuesta: daga con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única de desplazamiento; el resto no mueve al héroe.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Embestida (Aldric)**, **Carga de San Lorenzo (Libertador)**, **Costura de fuga (Vesper)**: dashes. Veyra = estela carmesí que hiere; Aldric = azul; Vesper = costura violeta.

### Habilidad 3 — Pacto de dolor

- **Mecánica (código):** `vey_pact`: sin apuntado; sacrifica 8% de su vida actual para ganar +25% de velocidad y +10% de armadura 3 s. Coste 20, enfriamiento 12000 ms. Hoy se dibuja un anillo de escudo celeste de 80 u (`kitFx` "shield").
- **Tipo:** buff personal con costo de vida · **Fuente:** `js/champions/quality-five/veyra.js:6`; `js/champions/quality-five/veyra.js:39`; `js/champions/quality-five/veyra.js:58`
- **Silueta y forma:** Un sello de latido bajo sus pies (⌀100 u): un corazón con líneas de pulso que se contraen y expanden; tiras de venda rojas giran lento a su alrededor.
- **Color dominante:** Carmesí `#ab3459` con rosa pálido `#ffd6dc` en las líneas; sombra `#7a1d38`.
- **Movimiento:** Dos latidos lub-dub con un anillo expansivo cada uno; el sello pulsa 3 s al ritmo de un corazón acelerado; tiras de venda ondulan.
- **Anticipación:** Pose de 420 ms: el cuerpo se sacude (el cuadro de "dolor") y 3 gotas caen.
- **Impacto:** Doble latido con anillos de 40 y 50 u.
- **Disipación:** El sello se apaga en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros) + bucle de 6 cuadros
- **Loop:** Sello en bucle de 6 cuadros (latido) durante 3 s.
- **Tamaño de los assets:**
  - Sello de latido: 100×100 u → **50×50 px** nativos (2 u/px)
  - Tira de venda: 30×10 u → **30×10 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Evitar el celeste actual de escudo; todo carmesí.
- **Ícono 16×16:** hoy `pact+x` (`js/ui/skill-pixel-glyphs.js:205`); propuesta: pacto/sello con tacha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única con sello de suelo y la única que mira hacia adentro (costo de vida); las otras hieren.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Último Aliento (Segador)**: también un latido rojo. Veyra = sello en el suelo con venda y líneas de pulso, en carmesí-rosado; el Segador = un corazón anatómico grande sobre el pecho.

### Definitiva — La última herida

- **Mecánica (código):** `vey_final`: sin apuntado; radio 145 u, 1,4× (×1,2 si el blanco sangraba), ralentiza 30% durante 1400 ms; consume los sangrados y se cura 2% + 1% por herida consumida (máx. 6%). Coste 0, enfriamiento 34000 ms. Con talentos: reabre sangrados, da velocidad 20% 1,8 s o escudo.
- **Tipo:** área centrada en el héroe (corte circular que consume sangrados) · **Fuente:** `js/champions/quality-five/veyra.js:7`; `js/champions/quality-five/veyra.js:43`; `js/champions/quality-five/veyra.js:54`
- **Silueta y forma:** Un corte circular enorme (⌀290 u) que abre una herida gigante en el suelo: una grieta curva con bordes vivos y un corazón latiendo al centro; las heridas de los enemigos se cierran con un fogonazo (se consumen).
- **Color dominante:** Rosa sangre `#ff7d8e` y blanco rosado `#ffd6dc` en el filo; carmesí `#ab3459` en el interior; negro-rojo `#2a0612` en el fondo.
- **Movimiento:** Un tajo circular recorre 360° en 3 cuadros; la herida del suelo se abre y se cierra en 2 latidos; las heridas de los enemigos viajan al centro y curan a Veyra (hilos de sangre hacia el héroe).
- **Anticipación:** Pose de 650 ms: el cuerpo se tensa, latido lento y la herida empieza a abrirse (6 cuadros).
- **Impacto:** Herida circular de 145 u de radio con sacudida y flash rosado; hilos de sangre hacia Veyra (uno por herida).
- **Disipación:** La herida se cierra de afuera hacia adentro en 6 cuadros.
- **Frames sugeridos:** anticipación 6 · impacto 5 · disipación 6 (= 17 cuadros) + bucle de 6 cuadros
- **Loop:** Latido final: bucle de 6 cuadros durante 1,4 s de ralentización.
- **Tamaño de los assets:**
  - Herida circular: 290×290 u → **145×145 px** nativos (2 u/px)
  - Corazón central: 40×40 u → **40×40 px** nativos (1 u/px)
  - Hilo de sangre a Veyra: 145×8 u → **145×8 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Lectura de curación: un hilo por herida consumida.
- **Ícono 16×16:** hoy `heart+drop` (`js/ui/skill-pixel-glyphs.js:205`); propuesta: corazón con gota.
- **Cómo se distingue de las otras del mismo campeón:** La única circular y de gran radio; Abrir la herida es abanico y Paso es lineal.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Segador de Almas** y **Encarnación del Abismo**: ultis de transformación. La de Veyra es un único corte instantáneo y rosado; sin aura persistente.

