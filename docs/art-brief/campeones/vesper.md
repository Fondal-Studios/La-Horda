# Vesper — La Costurera de Sombras (`vesper`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Asesina de preparación (`roleCategory: asesino`), cuerpo a cuerpo (básico 72 u, 430 ms). Marca grupos con puntadas, cose una salida y consume los hilos.
- **Tono:** Callada, precisa y dolida: remendaba trajes de teatro y ahora hilvana sombras. Aguja, hilo, tijera, retazos; elegancia de modista de luto.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:4`; `js/champions/expedition/catalog.js:12`; `js/champions/expedition/runtime.js:33`; pasiva en `js/champions/expedition/catalog.js:8`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/vesper/atlas.png`: ciruela `#703050`/`#503030`/`#703030`, piel `#f0d0b0`, grises `#907070`. Color de clase `#aa75bd` (`catalog.js:4`). Capucha corta, delantal asimétrico, dos tijeras grandes.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Violeta ciruela (dominante) | `#aa75bd` |
  | Lila pálido (brillo de hilo) | `#e0b6f0` |
  | Ciruela profunda (sombra) | `#5b3770` |
  | Negro-violeta (contorno) | `#1a0f24` |
  | Marfil (hilo y tijeras) | `#efe6d0` |
  | Acero (aguja y filo) | `#9aa0b0` |

- **Motivos visuales:** agujas largas, hilo que atraviesa y se enhebra, puntadas en fila, tijeras abiertas, carretes, botones, dedal, costuras que se cierran, retazos de tela.
- **Pasiva:** *Hilván* (puntadas marcadas hasta 3 por objetivo, 5 s; al caer un marcado libera una rotura de hilo de 75 u, 0,3× del daño base, `runtime.js`) no se dibuja hoy (no hay lectura en `expedition/render.js`). Recomendado, opcional: 1–3 puntadas en cruz de marfil sobre el enemigo marcado; se consume con Deshilachar y La última puntada.
- **NO debe parecerse a:** **Nahir** (misma geometría de cono 97° con vidrio aguamarina): las agujas de Vesper son finísimas, violetas, unidas por hilo ondulante. **Iria** (hilos tensos y anclas, lila-azul `#8889c1`, y "Corte de Hilo" con tijeras): Vesper = costura con puntadas, aguja e hilo marfil sobre violeta ciruela; Iria = hilos rectos tensos azulados con sellos. **Veyra** (sangre, `#ab3459`) y **Segador**: sin rojo. **Nigromante** (hilos de alma verdes).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (tijeras de luto)

- **Mecánica (código):** Melee: golpea a todo enemigo a ≤72 u, enfriamiento 430 ms, pose 190 ms; destello de tajo a 38 u. Cada golpe deja una puntada (hasta 3 por objetivo).
- **Tipo:** cuerpo a cuerpo (círculo de golpe) · **Fuente:** `js/champions/expedition/catalog.js:4`; `js/skills/abilities.js:235`; `js/champions/expedition/register.js:9`
- **Silueta y forma:** Un tijeretazo: dos hojas que cierran en X con un hilo marfil que queda 1 cuadro; 40 u.
- **Color dominante:** Marfil `#efe6d0` y acero `#9aa0b0`; hilo lila `#e0b6f0`.
- **Movimiento:** Las hojas cierran en 2 cuadros y dejan una puntada en cruz.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro con las tijeras abiertas.
- **Impacto:** Chasquido de 17 u con una puntada en X.
- **Disipación:** La puntada se desvanece en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 2 · disipación 3 (= 6 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Tijeretazo: 40×28 u → **40×28 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** La puntada en X es el único elemento persistente (opcional, ver Pasiva).
- **Cómo se distingue de las otras del mismo campeón:** Es una cruz breve de tijera; las habilidades son agujas, costura, corte circular y ciclo de cuatro cortes.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Tajo de Nahir (doble, aguamarina) y de Musashi: el de Vesper es una tijera que cierra.

### Habilidad 1 — Agujas de penumbra

- **Mecánica (código):** `needles`: cono de 235 u de alcance, semiángulo 0,85 rad (≈97°), premarcado `cone`; hasta 12 enemigos, 2,38×, añade 1 puntada (máx. 3, 5 s) a cada uno. Coste 24, enfriamiento 5500 ms.
- **Tipo:** cono (abanico de agujas) · **Fuente:** `js/champions/expedition/catalog.js:12`; `js/champions/expedition/runtime.js:33`; `js/champions/expedition/runtime.js:9`; `js/skills/aim-targeting.js:65`
- **Silueta y forma:** Un abanico de 9–11 agujas finísimas (largo hasta 235 u, grosor 2–3 px) con hilo marfil que las une en una trama de puntadas; cada aguja deja una puntada en el enemigo.
- **Color dominante:** Violeta `#aa75bd` con brillo `#e0b6f0` en la punta; hilo marfil `#efe6d0`.
- **Movimiento:** Las agujas salen con un leve ondular y tiran hilo tras de sí; al clavar, el hilo se tensa en 1 cuadro.
- **Anticipación:** Sector punteado del premarcado; 2 cuadros de agujas entre los dedos.
- **Impacto:** Cada aguja clava y deja una puntada en cruz de 12 u sobre el blanco.
- **Disipación:** Los hilos se aflojan y se disuelven en 4 cuadros, salvo las puntadas (marcas).
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Sector del abanico (largo × ancho en la punta): 235×353,1 u → **118×177 px** nativos (2 u/px)
  - Aguja suelta: 80×4 u → **80×4 px** nativos (1 u/px)
  - Puntada en cruz: 12×12 u → **12×12 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Pocos píxeles de grosor: que se lea fina frente a las astillas anchas de Nahir.
- **Ícono 16×16:** hoy `needle+dots` (`js/ui/skill-pixel-glyphs.js:185`); propuesta: aguja con puntos.
- **Cómo se distingue de las otras del mismo campeón:** La única que son líneas finas con hilo; Costura es una línea gruesa en el suelo y Deshilachar es un círculo.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Astillas errantes (Nahir)**: misma forma y alcance (cono 97°, 240 u). Diferencia clave: Vesper = agujas finas violeta unidas por hilo; Nahir = polígonos anchos aguamarina con brillos. **Abanico de Plumas (Saelis)**: plumas anchas azules.

### Habilidad 2 — Costura de fuga

- **Mecánica (código):** `seam`: salta 120 u (premarcado `dash` de 30 u; sin atravesar muros) y deja una costura entre el origen y la llegada que dura 2200 ms y daña en 4 pulsos (cada 550 ms) a ≤24 u de la línea con 0,56×. Máx. 2 costuras. Coste 25, enfriamiento 8500 ms.
- **Tipo:** desplazamiento + zona lineal (4 pulsos) · **Fuente:** `js/champions/expedition/catalog.js:12`; `js/champions/expedition/runtime.js:34`; `js/champions/expedition/runtime.js:97`; `js/skills/aim-targeting.js:65`
- **Silueta y forma:** Una costura de puntadas marfil de 120 × 48 u entre origen y llegada: puntadas alternas arriba/abajo con hilo que se tensa, y nudos en los extremos.
- **Color dominante:** Marfil `#efe6d0` sobre violeta `#aa75bd`; sombras `#5b3770`.
- **Movimiento:** Vesper se desvanece en hilo y reaparece 120 u más allá; la costura se cose de un extremo al otro en 3 cuadros y pulsa 4 veces (el hilo se tensa y suelta).
- **Anticipación:** Premarcado de salto (existente); 1 cuadro de aguja en la mano.
- **Impacto:** Cada pulso: la costura se ilumina 2 cuadros y salta una chispa lila.
- **Disipación:** Las puntadas se descosen de a una en 4 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 4 (= 8 cuadros) + bucle de 8 cuadros
- **Loop:** Costura en bucle de 8 cuadros (puntadas que laten) durante 2,2 s.
- **Tamaño de los assets:**
  - Costura (largo × ancho): 120×48 u → **120×48 px** nativos (1 u/px)
  - Nudo de extremo: 14×14 u → **14×14 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Hasta 2 costuras simultáneas.
- **Ícono 16×16:** hoy `stitch+arrow` (`js/ui/skill-pixel-glyphs.js:185`); propuesta: puntadas con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Única costura en línea y única de desplazamiento; Agujas es un abanico y Deshilachar un círculo.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Paso de ceniza (Zahra)** y **Surco de contención (Renko)**: líneas en el suelo tras un desplazamiento. La de Vesper es una costura de hilo marfil; Zahra, brasas; Renko, tierra.

### Habilidad 3 — Deshilachar

- **Mecánica (código):** `unpick`: sin apuntado; golpea en un radio de 150 u con 1,82× (+20% por puntada consumida, hasta +60%) y consume las puntadas; después Vesper queda afilada: +15% de daño 3 s. Coste 28, enfriamiento 7600 ms.
- **Tipo:** área centrada en el héroe (consume las puntadas) · **Fuente:** `js/champions/expedition/catalog.js:12`; `js/champions/expedition/runtime.js:35`
- **Silueta y forma:** Un corte circular de ⌀300 u hecho con tijeras gigantes que recorren el círculo; los hilos de las puntadas se tensan hacia Vesper y se cortan.
- **Color dominante:** Acero `#9aa0b0` y marfil `#efe6d0` en las tijeras; violeta `#aa75bd` en el corte.
- **Movimiento:** Las tijeras (⌀80 u) dan una vuelta completa en 4 cuadros, cortando el círculo; cada puntada consumida estalla en una cruz de hilo.
- **Anticipación:** Se ven los hilos de las puntadas tensándose hacia ella (2 cuadros).
- **Impacto:** Cierre del círculo con destello lila y cruces de hilo.
- **Disipación:** Los hilos cortados caen y se desvanecen en 5 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 5 (= 11 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Corte circular: 300×300 u → **150×150 px** nativos (2 u/px)
  - Tijeras gigantes: 80×80 u → **80×80 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Variante con más puntadas = más cruces de hilo (lectura del bonus).
- **Ícono 16×16:** hoy `scissors+dots` (`js/ui/skill-pixel-glyphs.js:185`); propuesta: tijeras con puntos.
- **Cómo se distingue de las otras del mismo campeón:** La única circular; Agujas es abanico, Costura es línea, la ulti son 4 cortes.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Corte de Hilo (Iria)**: otra tijera. Vesper = tijeras gigantes que giran (violeta/marfil); Iria = descarga de hilos azulados.

### Definitiva — La última puntada

- **Mecánica (código):** `last_stitch`: sin apuntado; coste 0, enfriamiento 35000 ms, dura 2400 ms, sigue a Vesper. Cuatro cortes (cada 600 ms) en un radio de 155 u con 0,924×; el último consume las puntadas (+20% cada una). Los aliados a ≤235 u ganan +15% de velocidad mientras dura.
- **Tipo:** aura móvil (4 cortes circulares) · **Fuente:** `js/champions/expedition/catalog.js:12`; `js/champions/expedition/runtime.js:36`; `js/champions/expedition/runtime.js:98`
- **Silueta y forma:** Un bordado circular de ⌀310 u sobre el suelo, que se va cosiendo en cuatro vueltas; en cada corte, una tijera gigante lo recorre; el último deja el bordado completo y lo "rompe".
- **Color dominante:** Violeta `#aa75bd` con hilo marfil `#efe6d0` y brillo `#e0b6f0`; núcleo negro-violeta `#1a0f24`.
- **Movimiento:** Cada 600 ms una vuelta de bordado y un corte con tijeras; el cuarto corte rompe el bordado con una ola de hilo; el círculo sigue al héroe.
- **Anticipación:** Pose de 650 ms: carrete y tijeras gigantes en el aire (6 cuadros).
- **Impacto:** Cuarto corte: el bordado estalla en hilos y retazos hacia afuera.
- **Disipación:** Los hilos caen y se disuelven en 6 cuadros.
- **Frames sugeridos:** anticipación 6 · impacto 5 · disipación 6 (= 17 cuadros) + bucle de 8 cuadros
- **Loop:** Bordado en bucle de 8 cuadros (puntadas que avanzan) durante 2,4 s.
- **Tamaño de los assets:**
  - Bordado circular (bucle): 310×310 u → **155×155 px** nativos (2 u/px)
  - Tijeras gigantes: 90×90 u → **90×90 px** nativos (1 u/px)
  - Estallido final: 310×310 u → **155×155 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Retazos de tela que vuelan en el estallido final.
- **Ícono 16×16:** hoy `spool+ring` (`js/ui/skill-pixel-glyphs.js:185`); propuesta: carrete con anillo.
- **Cómo se distingue de las otras del mismo campeón:** Única en cuatro vueltas y móvil con ella; Deshilachar es un corte único.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Tormenta de rescate (Orsa)** y **Atlas de los ausentes (Sira)**: otras ultis de varios pulsos que siguen al héroe/ruta. Vesper = bordado e hilo violeta-marfil.

