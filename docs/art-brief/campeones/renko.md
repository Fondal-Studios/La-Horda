# Renko — El Jardinero de Nombres (El Sepulturero sin Tumbas) (`renko`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones). Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Tanque de preparación del terreno (`roleCategory: tanque`), cuerpo a cuerpo (básico 90 u, 640 ms). Traza surcos, los consume y sacude el suelo; nunca cierra salidas.
- **Tono:** Grave, paciente y respetuoso: un sepulturero que se niega a enterrar a nadie. Tierra arada, estacas con nombres, brotes pequeños; pesado pero no cruel.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:55`; `js/champions/expedition/catalog.js:60`; `js/champions/expedition/runtime.js:63`; pasiva en `js/champions/expedition/catalog.js:58`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/renko/atlas.png`: piedra gris cálido `#907070`/`#705050`, cuero `#705030`, marfil `#b09070`. Color de clase `#a99a83` (`catalog.js:55`). Pala cuadrada, placas de piedra, abrigo de trabajo.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Tierra removida (dominante) | `#7a5a3a` |
  | Tierra clara / marfil de lápida | `#e0cfa8` |
  | Tierra oscura (sombra) | `#5a4128` |
  | Marrón-negro (contorno) | `#2a1d12` |
  | Gris cálido (piedra y color de clase) | `#a99a83` |
  | Brote verde (acento puntual) | `#7fa05a` |

- **Motivos visuales:** surcos arados, terrones, estacas/tablillas con un nombre grabado, pala, brotes que crecen de la tierra, grietas radiales de suelo, lápidas pequeñas (placas).
- **Pasiva:** *Tierra removida* (un básico junto a sus surcos produce una sacudida ×0,25 en 70 u, recarga interna 900 ms, `runtime.js:128`) no tiene indicador visual propio; si se quiere, reutilizar la grieta chica de Devolver a la tierra.
- **NO debe parecerse a:** **Maura** (Raíces de paso: línea que deja espinas sobre suelo, verde oliva): Renko es marrón de tierra arada y tablillas, sin raíces ni espinas. **Brakk** (Muro de asedio, ocre `#cead7a`) y **Bront** (muro de placas): no hay paredes sólidas en Renko (el código las prohíbe: "no bloquean enemigos"). **Segador** (suelo ensangrentado).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (pala)

- **Mecánica (código):** Melee: golpea a todo enemigo a ≤90 u, enfriamiento 640 ms, pose 190 ms; destello de tajo a 38 u frente al héroe (140 ms).
- **Tipo:** cuerpo a cuerpo (círculo de golpe) · **Fuente:** `js/champions/expedition/catalog.js:55`; `js/skills/abilities.js:235`; `js/champions/expedition/register.js:9`
- **Silueta y forma:** Golpe de pala de arriba abajo: hoja cuadrada y un montículo de tierra que salta (≈44 u).
- **Color dominante:** Tierra clara `#e0cfa8` en la hoja, terrones `#7a5a3a`.
- **Movimiento:** La pala cae en 3 cuadros y levanta 3 terrones que saltan y caen.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro con la pala en alto.
- **Impacto:** Polvo y 3 terrones, anillo de 17 u.
- **Disipación:** Los terrones caen y el polvo se asienta en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Golpe de pala: 44×44 u → **44×44 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es corto y de tierra clara; las habilidades son franjas, montículos, anillos de grietas.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Golpe de Escudo de Aldric y Siega del Segador (arcos): el de Renko es una pala vertical con terrones, no un arco.

### Habilidad 1 — Surco de contención

- **Mecánica (código):** `trench`: línea de 235 u (premarcado `line` de 30 u; el golpe alcanza 30 u + radio del enemigo), 2,52×, ralentiza 30% por 1500 ms. Deja en el punto apuntado un parche de "tierra removida" de r 65 u que dura 5000 ms (máx. 3). No bloquea el paso. Coste 25, enfriamiento 6500 ms.
- **Tipo:** línea + zona persistente (tierra removida) · **Fuente:** `js/champions/expedition/catalog.js:60`; `js/champions/expedition/runtime.js:63`; `js/skills/aim-targeting.js:72`
- **Silueta y forma:** Una franja de tierra levantada de 235 × 60 u (un surco con montones a los lados) que termina en una estaca con tablilla; el parche de tierra removida (⌀130 u) queda en el suelo.
- **Color dominante:** Tierra `#7a5a3a` con bordes claros `#b08a5a`; tablilla marfil `#e0cfa8`.
- **Movimiento:** La pala arranca el surco de principio a fin en 3 cuadros, lanzando terrones a los lados; la estaca se clava al final con un golpe.
- **Anticipación:** Premarcado lineal (existente); 2 cuadros de pala hundiéndose.
- **Impacto:** La estaca se clava y la tierra "revienta" ligeramente en el extremo.
- **Disipación:** El surco se asienta (4 cuadros); el parche queda 5 s y se aplana por tramado.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros) + bucle de 6 cuadros
- **Loop:** El parche de tierra removida en bucle de 6 cuadros (terrones que se mueven apenas) durante 5 s.
- **Tamaño de los assets:**
  - Surco: 235×60 u → **118×30 px** nativos (2 u/px)
  - Parche de tierra removida: 130×130 u → **65×65 px** nativos (2 u/px)
  - Estaca con tablilla: 14×30 u → **14×30 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Hasta 3 parches a la vez: que se lean como un campo arado.
- **Ícono 16×16:** hoy `mound+x` (`js/ui/skill-pixel-glyphs.js:193`); propuesta: montículo con estaca y tacha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única línea; Montículo es redondo y elevado, Devolver es un anillo de grietas.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Raíces de paso (Maura)**: también línea con zona de suelo. Renko = tierra marrón y tablilla con nombre; Maura = raíces y zarzas verdes. **Línea de tinta (Sira)** (azul).

### Habilidad 2 — Montículo

- **Mecánica (código):** `mound`: punto elegido (premarcado `point` r 100 u, alcance 160 u). Coste 26, enfriamiento 11000 ms, dura 4200 ms. Zona no sólida: los aliados dentro reciben 8% menos de daño (no se acumula con otros montículos); Renko queda cubierto −20% de daño recibido 3 s. Sin daño.
- **Tipo:** zona de protección (no sólida) · **Fuente:** `js/champions/expedition/catalog.js:60`; `js/champions/expedition/runtime.js:64`; `js/skills/aim-targeting.js:73`
- **Silueta y forma:** Un túmulo bajo de tierra de ⌀200 u, con una corona de brotes verdes y 4 tablillas pequeñas alrededor; sin aristas.
- **Color dominante:** Tierra oscura `#5a4128` con brotes verdes `#7fa05a`.
- **Movimiento:** La tierra sube desde el suelo en 4 cuadros; los brotes crecen y se mecen lento.
- **Anticipación:** Premarcado circular (existente); 2 cuadros de tierra que se agrieta.
- **Impacto:** Estallido corto de terrones al asentarse.
- **Disipación:** El túmulo se hunde y los brotes se marchitan en 5 cuadros al caducar.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 5 (= 10 cuadros) + bucle de 8 cuadros
- **Loop:** Brotes y borde en bucle de 8 cuadros durante 4,2 s.
- **Tamaño de los assets:**
  - Túmulo (bucle): 200×200 u → **100×100 px** nativos (2 u/px)
  - Tablilla: 12×24 u → **12×24 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin partículas pesadas; zona larga.
- **Ícono 16×16:** hoy `mountain+dots` (`js/ui/skill-pixel-glyphs.js:193`); propuesta: montaña pequeña con puntos.
- **Cómo se distingue de las otras del mismo campeón:** Es el único volumen elevado y verde; el Surco es una franja plana y marrón.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Edicto de Luz (Nano GM)** y **Marcha de salida de Dáriel**: zonas protectoras de luz/música. El Montículo es tierra y brotes, sin brillo.

### Habilidad 3 — Devolver a la tierra

- **Mecánica (código):** `burial`: sin apuntado; círculo de 120 u alrededor de Renko, 2,8× + 20% por cada surco/parche consumido (hasta 3). Los parches se eliminan. Coste 28, enfriamiento 8500 ms.
- **Tipo:** área centrada en el héroe (golpe circular) · **Fuente:** `js/champions/expedition/catalog.js:60`; `js/champions/expedition/runtime.js:65`
- **Silueta y forma:** La pala se clava en el suelo y un anillo de grietas radiales de ⌀240 u se abre desde el golpe; cada parche consumido "se hunde" hacia él.
- **Color dominante:** Tierra clara `#b08a5a` y marfil `#e0cfa8` en las grietas; centro oscuro `#2a1d12`.
- **Movimiento:** Grietas que se disparan del centro al borde en 4 cuadros; terrones y polvo suben; los parches se arrastran hacia el centro.
- **Anticipación:** Se ven los parches de tierra pulsando hacia él durante la pose (420 ms).
- **Impacto:** Anillo de 120 u con sacudida corta.
- **Disipación:** Grietas se cierran y el polvo cae en 5 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 5 (= 11 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Anillo de grietas: 240×240 u → **120×120 px** nativos (2 u/px)
  - Terrón: 12×12 u → **12×12 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Cada parche consumido añade 1 grieta extra (hasta 3): lectura del bonus.
- **Ícono 16×16:** hoy `shovel+x` (`js/ui/skill-pixel-glyphs.js:193`); propuesta: pala clavada con tacha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única radial y la única que "consume" los parches del suelo.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Alud del Coloso (Ilkan) y Aplastamiento del Gólem (Ilvar): golpes al suelo azules/arena/verdes. El de Renko es marrón con grietas y estacas.

### Definitiva — Aquí siguen los nombres

- **Mecánica (código):** `faults`: sin apuntado; coste 0, enfriamiento 37000 ms, dura 2400 ms, sigue a Renko. Tres sacudidas (una cada 800 ms) en un radio de 180 u con 1,82×; la última aturde 300 ms a los comunes (no a jefes). Aliados a ≤240 u reciben escudo 5% durante 2400 ms.
- **Tipo:** tres sacudidas en área (aura móvil con escudo) · **Fuente:** `js/champions/expedition/catalog.js:60`; `js/champions/expedition/runtime.js:66`; `js/champions/expedition/runtime.js:105`
- **Silueta y forma:** Tres ondas de suelo a 180 u de radio, cada una más fuerte: grietas radiales y una estaca con un nombre grabado que emerge en cada borde; la 3ª levanta piedras.
- **Color dominante:** Tierra `#7a5a3a`, marfil `#e0cfa8` en los nombres, polvo `#b08a5a`.
- **Movimiento:** Cada sacudida es un pulso que expande un anillo y levanta 6 estacas/tablillas del suelo; la última lanza piedras hacia arriba.
- **Anticipación:** Pose de 650 ms: Renko clava la pala; el suelo empieza a agrietarse con la 1ª sacudida en el final de la pose.
- **Impacto:** 3ª sacudida: anillo de 180 u + piedras + sacudida; los comunes quedan aturdidos 300 ms.
- **Disipación:** Las estacas se hunden en 6 cuadros; queda polvo.
- **Frames sugeridos:** anticipación 4 · impacto 6 · disipación 6 (= 16 cuadros) + bucle de 6 cuadros
- **Loop:** Cada sacudida es un bucle breve de 6 cuadros (3 repeticiones desfasadas 800 ms).
- **Tamaño de los assets:**
  - Sacudida (anillo): 360×360 u → **180×180 px** nativos (2 u/px)
  - Estaca con nombre: 14×34 u → **14×34 px** nativos (1 u/px)
  - Piedra de la 3ª sacudida: 16×16 u → **16×16 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Las tablillas llevan nombres ilegibles (rayas), nunca texto real. Polvo bajo.
- **Ícono 16×16:** hoy `tablet+ring` (`js/ui/skill-pixel-glyphs.js:193`); propuesta: lápida/tablilla con anillo.
- **Cómo se distingue de las otras del mismo campeón:** Es la única con tres golpes escalonados y con estacas que emergen; Devolver es un único anillo.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Hundimiento (Coloso de Ilkan)** (4 pulsos de arena que hunde el suelo) y **Tormenta de rescate (Orsa)** (4 pulsos): también pulsos escalonados. Renko = estacas y tierra marrón; Ilkan = arena anaranjada; Orsa = cobre.

