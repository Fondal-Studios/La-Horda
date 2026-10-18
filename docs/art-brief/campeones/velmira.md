# Velmira — La Reina de las Máscaras (`velmira`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Soporte de control (`roleCategory: soporte`), a distancia (básico 270 u, 520 ms). Cuatro máscaras = cuatro estados (Inspiración, Terror, Silencio, Protección); cambiar de rostro potencia la siguiente habilidad un 30%.
- **Tono:** Teatral, majestuosa y pícara: reina del viejo teatro de la Ciudad Maldita. Telón, máscaras, confeti, escena; elegancia con un toque de pesadilla.
- **Fuentes del kit:** `js/champions/ascension/catalog.js:67`; `js/champions/ascension/catalog.js:75`; `js/champions/ascension/runtime.js:75`; `js/champions/ascension/runtime.js:136`; pasiva en `js/champions/ascension/catalog.js:71`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/velmira/atlas.png`: violetas `#503070`/`#705090`/`#703090`, rosado `#503050`, piel `#f0b090`. Color de clase `#c06bd8`, brillo `#f3d1ff` (`ascension/catalog.js:67`). Vestido de telón con cuello alto; cuatro máscaras flotan detrás de la cabeza.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Violeta teatral (dominante) | `#c06bd8` |
  | Lila pálido (brillo y confeti) | `#f3d1ff` |
  | Violeta oscuro (telón) | `#8a3aa6` |
  | Ciruela-negro (contorno) | `#2a1038` |
  | Máscara Inspiración (oro) | `#f0c14e` |
  | Máscara Terror (rojo) | `#d04040` |
  | Máscara Silencio (azul) | `#4a7ad0` |
  | Máscara Protección (verde) | `#4ab070` |

- **Motivos visuales:** máscaras de teatro (sonriente/trágica/muda/escudo), telones, confeti, focos de escenario, palco, bambalinas, cetro. El color del efecto sigue a la máscara ACTIVA.
- **NO debe parecerse a:** **Thalen** (púrpura arcano `#a15fc7`) y **Oriel** (frambuesa): el violeta de Velmira siempre va con una máscara reconocible y confeti, sin runas ni grietas. **Nano GM** (Juicio dividido blanco/negro): las máscaras de Velmira son cuatro colores distintos. **Axiom** (glitch).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (máscara)

- **Mecánica (código):** A distancia: `basicRange` 270 u, enfriamiento 520 ms, proyectil `mask` (mini máscara) a 420 u/s, radio 8 u, vida 900 ms; pose 190 ms.
- **Tipo:** proyectil · **Fuente:** `js/champions/ascension/catalog.js:67`; `js/champions/ascension/register.js:10`; `js/skills/abilities.js:209`
- **Silueta y forma:** Una máscara pequeña (≈18 u) de perfil, girando; el color de la máscara activa cambia con la máscara de Velmira.
- **Color dominante:** Color de la máscara activa (oro/rojo/azul/verde) con ojos oscuros `#2a1038`.
- **Movimiento:** Vuela girando sobre su eje vertical (muestra de frente y de perfil) y suelta 2 confetis.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de destello en el cetro.
- **Impacto:** Estallido de confeti de 17 u del color de la máscara.
- **Disipación:** El confeti cae en 4 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 4 (= 8 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Máscara: 18×18 u → **18×18 px** nativos (1 u/px)
  - Confeti: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** 4 variantes de color (una por máscara).
- **Cómo se distingue de las otras del mismo campeón:** Es una sola máscara pequeña; las habilidades usan máscaras grandes, en órbita o espectrales.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Proyectil de Oriel (llave) y de Nano GM (media luna): objeto distinto y confeti.

### Habilidad 1 — Máscara Arrojada

- **Mecánica (código):** `mask_throw`: línea de 320 u (premarcado `line` de 30 u), 1,3×. Daña a los enemigos de la línea y aplica el efecto de la máscara activa a enemigos y aliados que toca: Inspiración +20% de velocidad 3 s (aliados), Terror ralentiza 40% 1,5 s y empuja 30 u, Silencio silencia 2,5 s (y aturde 250 ms a élites), Protección escudo 6% 3 s (aliados). Coste 22, enfriamiento 4800 ms.
- **Tipo:** proyectil lineal con efecto de máscara · **Fuente:** `js/champions/ascension/catalog.js:75`; `js/champions/ascension/runtime.js:132`; `js/champions/ascension/runtime.js:75`; `js/skills/aim-targeting.js:57`
- **Silueta y forma:** Una máscara grande (⌀50 u) que vuela girando a lo largo de 320 u, con una estela de confeti del color de la máscara y listones.
- **Color dominante:** Color de la máscara activa; borde lila `#f3d1ff`.
- **Movimiento:** Gira sobre su eje vertical, deja una estela ondulada de listones; atraviesa y deja un destello de confeti en cada contacto.
- **Anticipación:** Premarcado lineal (existente); 2 cuadros de la máscara saliendo de detrás de la cabeza.
- **Impacto:** En cada contacto: icono del efecto (sonrisa, grito, mano en boca, escudo) 12 u sobre el afectado.
- **Disipación:** La estela se desvanece en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros) + bucle de 6 cuadros
- **Loop:** La máscara vuela en bucle de 6 cuadros (giro); impacto y disipación no repiten.
- **Tamaño de los assets:**
  - Máscara en vuelo: 50×50 u → **50×50 px** nativos (1 u/px)
  - Estela (línea completa): 320×40 u → **160×20 px** nativos (2 u/px)
  - Icono de efecto: 14×14 u → **14×14 px** nativos (1 u/px)
- **Partículas / capas secundarias:** 4 variantes de color y de icono. Confeti con tope bajo.
- **Ícono 16×16:** hoy `mask+arrow` (`js/ui/skill-pixel-glyphs.js:199`); propuesta: máscara con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única lineal; Coro es un aro, Cambio un salto corto y la ulti, cuatro máscaras gigantes.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Sentencia Umbría (Nano GM)** y **Estrella Errante (Vhal)**: proyectiles lineales. La máscara arrojada es un objeto grande de 4 colores posibles.

### Habilidad 2 — Coro de Rostros

- **Mecánica (código):** `chorus`: sin apuntado; radio 170 u, 0,9×. Aplica el efecto de la máscara activa a los enemigos (castigo) y a los aliados (beneficio) dentro. Coste 26, enfriamiento 8600 ms.
- **Tipo:** área centrada en el héroe (máscaras en órbita) · **Fuente:** `js/champions/ascension/catalog.js:76`; `js/champions/ascension/runtime.js:134`
- **Silueta y forma:** Las cuatro máscaras giran en un aro de ⌀340 u alrededor de Velmira (la activa más grande), dejando una estela circular; el piso se ve como un escenario circular con foco.
- **Color dominante:** Las cuatro máscaras en sus colores; aro lila `#c06bd8`, foco `#f3d1ff`.
- **Movimiento:** Las máscaras salen de detrás de su cabeza, se abren en círculo en 3 cuadros, giran una vuelta completa en 4 cuadros y se recogen.
- **Anticipación:** Pose de 420 ms: máscaras se despliegan.
- **Impacto:** Pulso del aro de 170 u con el color de la máscara activa; efectos sobre afectados.
- **Disipación:** Se recogen en 4 cuadros.
- **Frames sugeridos:** anticipación 3 · impacto 4 · disipación 4 (= 11 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Aro de máscaras: 340×340 u → **170×170 px** nativos (2 u/px)
  - Máscara orbital (×4): 28×28 u → **28×28 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin confeti pesado.
- **Ícono 16×16:** hoy `masks+ring` (`js/ui/skill-pixel-glyphs.js:199`); propuesta: cuatro máscaras en aro.
- **Cómo se distingue de las otras del mismo campeón:** Es el único aro con las cuatro máscaras juntas; Arrojada es una, Gran Teatro son cuatro gigantes quietas.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Danza del Augurio (Ismara)** y **Torbellino (Aldric)**: aros giratorios. Coro = máscaras de colores, sin hojas.

### Habilidad 3 — Cambio de Rostro

- **Mecánica (código):** `face_swap`: salta hasta 140 u (premarcado `dash` de 30 u), golpea 90 u en la llegada (0,8×), cambia a la siguiente máscara y la próxima habilidad sale un 30% más fuerte. Coste 18, enfriamiento 5200 ms.
- **Tipo:** desplazamiento corto + cambio de estado · **Fuente:** `js/champions/ascension/catalog.js:77`; `js/champions/ascension/runtime.js:135`; `js/skills/aim-targeting.js:57`
- **Silueta y forma:** El héroe se pliega en una cortina de telón durante el salto y reaparece con otra máscara; al llegar, un estallido de confeti de ⌀180 u del color de la nueva máscara.
- **Color dominante:** Color de la máscara saliente → color de la entrante (degradado).
- **Movimiento:** Cortina que se cierra en 2 cuadros, salta 140 u y se abre; las 4 máscaras de detrás giran un cuarto de vuelta.
- **Anticipación:** Premarcado de salto (existente); 1 cuadro de la cortina.
- **Impacto:** Estallido de confeti de 90 u de radio.
- **Disipación:** El confeti cae en 4 cuadros; un brillo "+30%" queda sobre el héroe hasta lanzar la siguiente habilidad.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 4 (= 8 cuadros)
- **Loop:** No hace bucle (el brillo de "potenciada" es una capa de bucle de 4 cuadros).
- **Tamaño de los assets:**
  - Cortina del salto: 140×40 u → **140×40 px** nativos (1 u/px)
  - Confeti de llegada: 180×180 u → **90×90 px** nativos (2 u/px)
  - Brillo +30%: 36×36 u → **36×36 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Mostrar claramente qué máscara queda activa (alineado con la pasiva).
- **Ícono 16×16:** hoy `swap+arrow` (`js/ui/skill-pixel-glyphs.js:199`); propuesta: dos máscaras intercambiadas con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Es el único desplazamiento y el único con cortina; las demás son lanzamientos o auras.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Inversión (Nano GM)** y **Reflejo fugitivo (Nahir)**: saltos con estela bicolor/vidrio. Éste es una cortina de teatro con cambio de máscara.

### Definitiva — El Gran Teatro

- **Mecánica (código):** `theatre`: sin apuntado; radio 260 u, coste 0, enfriamiento 40000 ms, dura 5600 ms = 4 actos de 1400 ms (Inspiración, Terror, Silencio, Protección). Al comenzar cada acto golpea a los enemigos del área (0,9×) y aplica el efecto de esa máscara a enemigos y aliados (×1,2). Se queda donde se lanzó.
- **Tipo:** zona de definitiva en 4 actos (aura en el sitio) · **Fuente:** `js/champions/ascension/catalog.js:78`; `js/champions/ascension/runtime.js:136`; `js/champions/ascension/runtime.js:222`; `js/champions/ascension/render.js:181`
- **Silueta y forma:** Un escenario circular de ⌀520 u con un telón rojo-violeta que se abre al cielo y, sobre él, una máscara espectral gigante por acto (⌀200 u cada una), una a la vez, con focos de luz que bajan.
- **Color dominante:** Telón violeta `#8a3aa6` y lila `#f3d1ff`; cada acto cambia de color: oro, rojo, azul, verde.
- **Movimiento:** Cada 1,4 s una máscara aparece grande, "habla" (abre la boca, onda de 260 u) y se retira mientras entra la siguiente; el telón respira; confeti constante.
- **Anticipación:** Pose de 650 ms: el telón se levanta (6 cuadros) y el escenario se ilumina.
- **Impacto:** Cada acto: onda de 260 u del color de la máscara y su efecto (sonrisa dorada, rostro rojo gritando, azul con dedo en los labios, escudo verde).
- **Disipación:** La máscara final se parte y el telón cae en 6 cuadros.
- **Frames sugeridos:** anticipación 6 · impacto 5 · disipación 6 (= 17 cuadros) + bucle de 8 cuadros
- **Loop:** Escenario en bucle de 8 cuadros durante 5,6 s; las 4 máscaras son capas de 5 cuadros por acto.
- **Tamaño de los assets:**
  - Escenario y telón (bucle): 520×520 u → **260×260 px** nativos (2 u/px)
  - Máscara gigante (×4, una por acto): 200×200 u → **100×100 px** nativos (2 u/px)
  - Onda de acto: 520×520 u → **260×260 px** nativos (2 u/px)
- **Partículas / capas secundarias:** 4 variantes completas de color. Focos y confeti con tope bajo.
- **Ícono 16×16:** hoy `curtain+ring` (`js/ui/skill-pixel-glyphs.js:199`); propuesta: telón de teatro con anillo.
- **Cómo se distingue de las otras del mismo campeón:** La única estática, enorme y con un orden temporal de 4 actos; Coro gira alrededor y dura un instante.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Juicio del GM (Nano GM)**: parte la arena en 2 colores; **La Gran Cicatriz (Oriel)**: fisura. El Gran Teatro es un escenario de 4 máscaras gigantes de colores.

### Pasiva — Mil Rostros (máscara activa)

- **Mecánica (código):** Lleva una máscara activa; cada habilidad aplica el efecto de esa máscara y cambiar de rostro potencia la siguiente un 30%. Hoy las 4 máscaras flotan detrás de la cabeza (la activa más grande, 7 frente a 4,5 de radio) y una etiqueta (☺ ☠ ✕ ⛨ y "+" si está potenciada) aparece sobre ella.
- **Tipo:** indicador sobre el héroe · **Fuente:** `js/champions/ascension/catalog.js:71`; `js/champions/ascension/render.js:127`; `js/champions/ascension/render.js:227`
- **Silueta y forma:** Cuatro máscaras en arco sobre/detrás de la cabeza (ángulos de 207° a 331° de la fórmula del render, a 20 × 14 u del centro); la activa más grande y brillante.
- **Color dominante:** Las cuatro en sus colores; la activa con borde lila `#f3d1ff`.
- **Movimiento:** La activa late; al cambiar, la nueva sube al centro y la anterior baja.
- **Anticipación:** —
- **Impacto:** Cambio: destello de 2 cuadros.
- **Disipación:** —
- **Frames sugeridos:** anticipación 0 · impacto 2 · disipación 0 (= 2 cuadros) + bucle de 6 cuadros
- **Loop:** Bucle de 6 cuadros (latido de la activa).
- **Tamaño de los assets:**
  - Máscara pequeña (×4): 14×14 u → **14×14 px** nativos (1 u/px)
  - Máscara activa: 22×22 u → **22×22 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Capa del cuerpo (§7), no cambia el diseño.
- **Cómo se distingue de las otras del mismo campeón:** Es el indicador permanente; el brillo de potenciada se muestra con Cambio de Rostro.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Alas de Nano GM/Saelis: aquí son máscaras.

