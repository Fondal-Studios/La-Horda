# Segador — Segador Olvidado (El Segador) (`segador`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Berserker / tanque ofensivo (`roleCategory: tanque`), cuerpo a cuerpo (básico 88 u, 640 ms). Su recurso es la Furia (se gana peleando); cuanto menos vida, más daño.
- **Tono:** Brutal, pesado y agresivo (ART_BIBLE §4): un guerrero sin memoria. Filo ancho, sangre densa y almas pálidas; la violencia sale del tamaño y la silueta, no del realismo.
- **Fuentes del kit:** `js/data/champions.js:82`; `js/skills/abilities.js:1301`; `js/champions/segador.js:10`; `js/skills/abilities.js:1388`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/segador/idle_down_01.png` (sin atlas único): violeta/gris `#705070`/`#503070`/`#503050`, grises `#707070`. Color de clase `#c62828`, brillo `#ff8a7a` (`champions.js`): el rojo es el color del efecto, no del sprite.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Rojo sangre (dominante) | `#c62828` |
  | Rojo claro (filo y brillo) | `#ff8a7a` |
  | Rojo oscuro (sombra y sangre seca) | `#7a1620` |
  | Negro-rojo (contorno) | `#2a0a0e` |
  | Hueso pálido (almas y calaveras) | `#ffe9d6` |
  | Violeta capa (acento del cuerpo) | `#503070` |

- **Motivos visuales:** guadaña de hoja ancha, arcos de sangre, pinchos de armadura, latido de corazón, almas pálidas que suben, calavera emergiendo, cadenas rotas.
- **Pasiva:** *Furia* (recurso que no se regenera solo) y el bono por vida perdida (hasta +90% de daño con 0 de vida, `segador.js`) se muestran en la barra del HUD, no como efecto de combate; no se pide arte. Opcional: un pulso rojo más intenso en los bordes del héroe por debajo de 30% de vida.
- **NO debe parecerse a:** **Veyra** (carmesí `#ab3459`, tajos finos y latidos): el Segador es rojo ladrillo, hoja ancha y masa de sangre; sin hilos ni finura. **Kael/Guerrero** (rojo `#c4544a`, dagas y sangrado): el Segador usa arcos enormes y almas. **Thalen/Cataclismo** (hoy el Segador comparte el generador de estallidos con anillos naranja y cristales de hielo: ver Definitiva). **Ilvar** (calavera y almas verdes).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Siega

- **Mecánica (código):** Melee: golpea a todo enemigo a ≤88 u ("tajo amplio en arco a corta distancia"), enfriamiento 640 ms, pose 190 ms; destello de tajo 140 ms a 38 u. Cada golpe y cada herida que recibe cargan Furia.
- **Tipo:** cuerpo a cuerpo (círculo de golpe, tajo amplio) · **Fuente:** `js/data/champions.js:82`; `js/data/champion-identity.js:46`; `js/skills/abilities.js:235`
- **Silueta y forma:** Arco de guadaña ancho de ≈76 u, con hoja gruesa y un borde de sangre; más grande y pesado que el de cualquier otro básico.
- **Color dominante:** Rojo claro `#ff8a7a` en el filo, rojo `#c62828` en el cuerpo del arco.
- **Movimiento:** Barrido pesado de 120° en 4 cuadros: arranca lento y termina rápido (peso), con gotas que salen del filo.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro con la guadaña en alto.
- **Impacto:** Splash de sangre de 17 u con 3 gotas largas.
- **Disipación:** La sangre se asienta y se seca en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 4 · disipación 3 (= 8 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Arco de la Siega: 76×56 u → **76×56 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Gotas de sangre que dejan una marca breve en el suelo (≤1 s).
- **Cómo se distingue de las otras del mismo campeón:** Es de un solo trazo y chico frente al Tajo (130 u) y al estallido de la Definitiva.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Tajo de Veyra y arcos de Musashi: finos/acero. La Siega es gruesa y roja.

### Habilidad 1 — Tajo del Segador

- **Mecánica (código):** `cone_slash`: hoy cono de alcance 130 u y abertura total 1,35 rad (≈77°), 1,7×, empuje 60; golpea hasta 3 + nivel de talento enemigos (4 a 7). Con la Armadura de la Furia en nivel 5+ el alcance cae 30%. En talento alto (nivel 7+) una onda de choque de 0,4× y radio 0,75 × alcance llega 170 ms después. Coste 34, enfriamiento 6200 ms. Premarcado `cone`.
- **Tipo:** cono (corte horizontal amplio) · **Fuente:** `js/data/champions.js:93`; `js/skills/abilities.js:1301`; `js/skills/aim-targeting.js:26`
- **Silueta y forma:** Un tajo de guadaña de 130 u de radio y 77° de abertura, con hoja gruesa y estela; ya existe `fxScytheSlash` (115×70 px) dibujado a 60–120 u según el alcance.
- **Color dominante:** Rojo `#c62828` con filo `#ff8a7a` y chispa `#ffe9d6`; estela oscura `#7a1620`.
- **Movimiento:** La guadaña recorre el arco de 77° en 3 cuadros (lento al inicio) y deja una estela de sangre que se corta en pedazos.
- **Anticipación:** Pose de 420 ms; 2 cuadros de guadaña en el hombro y premarcado cónico (existente).
- **Impacto:** Onda de choque secundaria en talento alto: anillo de 97 u rojo en 170 ms.
- **Disipación:** La estela se rompe en gotas y se disipa en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Tajo (largo × ancho en la punta): 130×162,5 u → **65×81 px** nativos (2 u/px)
  - Onda de choque (talento alto, ⌀): 195×195 u → **98×98 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Chispas `#ffe9d6` en los enemigos golpeados; hasta 7 marcas de impacto.
- **Ícono 16×16:** hoy `scythe` (`js/ui/skill-pixel-glyphs.js:169`); propuesta: guadaña (mantener el motivo).
- **Cómo se distingue de las otras del mismo campeón:** El único cono; la Armadura es un aro de pinchos y la ulti un aura vertical.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Cosecha de Almas (Ilvar)** y **Mirada fulminante (Ynara)**: conos de almas verdes/luz rosa. **Abrir la herida (Veyra)**: tres tajos carmesí finos en abanico de 97°. El del Segador es un único arco ancho, rojo ladrillo.

### Habilidad 2 — Armadura de la Furia

- **Mecánica (código):** `fury_armor`: sin apuntado; dura 5000 ms: −30% de daño recibido (con mastería ≥2), +14% de robo de vida, más generación de Furia por golpe recibido; nivel 5: +50% de daño y −30% de área del Tajo; nivel 6: al terminar dispara un Tajo Final (radio 130 u, 2,5× y empuje 220). Coste 30, enfriamiento 11000 ms. Aro de 46 u al lanzar.
- **Tipo:** aura / buff personal (pinchos) · **Fuente:** `js/data/champions.js:94`; `js/skills/abilities.js:1304`; `js/champions/segador.js:10`
- **Silueta y forma:** Una coraza de pinchos de hueso y metal rojo que brota de los hombros y la espalda del héroe (silueta ≈ +20 u por lado), con venas de sangre que laten.
- **Color dominante:** Rojo oscuro `#7a1620` con pinchos `#ffe9d6` y venas `#c62828`.
- **Movimiento:** Los pinchos brotan en 3 cuadros; durante la duración laten con cada golpe recibido; al terminar se rompen y caen.
- **Anticipación:** Pose de 420 ms; aro de 46 u con pinchos creciendo.
- **Impacto:** Anillo de 46 u con pinchos radiales; en el nivel 6, Tajo Final: anillo de 130 u rojo brillante y empuje.
- **Disipación:** Los pinchos se desprenden y se disuelven en 5 cuadros.
- **Frames sugeridos:** anticipación 3 · impacto 3 · disipación 5 (= 11 cuadros) + bucle de 8 cuadros
- **Loop:** Aro de pinchos en bucle de 8 cuadros (latido) durante 5 s.
- **Tamaño de los assets:**
  - Aro de pinchos (capa alrededor del cuerpo): 92×92 u → **92×92 px** nativos (1 u/px)
  - Tajo Final (nivel 6, ⌀): 260×260 u → **130×130 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Capa detrás y delante del cuerpo (§7); sin cambiar el diseño del personaje.
- **Ícono 16×16:** hoy `armor+up` (`js/ui/skill-pixel-glyphs.js:169`); propuesta: armadura con flecha hacia arriba.
- **Cómo se distingue de las otras del mismo campeón:** Es la única pegada al cuerpo con pinchos; el Tajo es un cono, la ulti un aura de almas.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Grito de Guerra (Aldric)** y **Piel de Duna (Ilkan)**: buffs defensivos con aro/escudo azul o arena. La del Segador es de pinchos rojos con venas.

### Habilidad 3 — Último Aliento

- **Mecánica (código):** `last_stand_burst`: +35% de daño por 3500 ms y cura 8% de su vida máxima al lanzarlo; el pasivo de bono por vida faltante corre siempre. Coste 26, enfriamiento 9000 ms. Estallido de 40 u (`#8a1414` / `#ff5c4a`).
- **Tipo:** buff / pulso de curación · **Fuente:** `js/data/champions.js:95`; `js/skills/abilities.js:1375`
- **Silueta y forma:** Un corazón anatómico estilizado (≈36 u) que late sobre el pecho, con anillos de latido que se expanden y vuelven (2 anillos de 40 u).
- **Color dominante:** Rojo oscuro `#8a1414` y rojo vivo `#ff5c4a`; destello `#ffe9d6`.
- **Movimiento:** Dos latidos seguidos (lub-dub): el corazón se agranda un 30% y suelta un anillo, luego queda un brillo débil mientras dura el +35%.
- **Anticipación:** 1 cuadro de contracción antes del primer latido.
- **Impacto:** Latido doble con ondas de 40 u y números de curación.
- **Disipación:** El corazón se apaga en 4 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 4 · disipación 4 (= 9 cuadros) + bucle de 6 cuadros
- **Loop:** Brillo de furor: bucle de 6 cuadros (latido tenue) durante 3,5 s.
- **Tamaño de los assets:**
  - Corazón: 36×36 u → **36×36 px** nativos (1 u/px)
  - Ondas de latido: 80×80 u → **80×80 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Gotas de sangre rojas que suben (la curación).
- **Ícono 16×16:** hoy `tombstone+x` (`js/ui/skill-pixel-glyphs.js:169`); propuesta: un corazón con gota (no una lápida).
- **Cómo se distingue de las otras del mismo campeón:** Es el único elemento orgánico (corazón) y de corto plazo; la Armadura es dura y la ulti, de almas.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Destino Restaurado (Ismara)**: curación con reloj turquesa; la del Segador es un corazón rojo.

### Definitiva — Segador de Almas

- **Mecánica (código):** `berserker_ult`: sin apuntado; coste 0, enfriamiento 34000 ms, dura 6000 ms. +65% de daño, −35% de daño recibido, 30% de robo de vida; cada baja prolonga 450 ms; mantiene la Armadura de la Furia activa. Hoy: `cataclysmVFX` de radio 90 u (anillo naranja `#ff6a3d`, giro celeste `#9fe3ff` y, con talento ≥5, cristales de hielo) y el sprite `fxSoulReapBurst` (150 u, 650 ms) sobre la cabeza.
- **Tipo:** transformación / aura de furia (6 s) · **Fuente:** `js/data/champions.js:97`; `js/skills/abilities.js:1388`; `js/skills/ability-vfx.js:61`
- **Silueta y forma:** Un torbellino de almas pálidas que sube en espiral desde el suelo y forma una calavera enorme (⌀150 u) sobre el héroe, mientras el cuerpo queda envuelto en un aura roja pulsante con una guadaña espectral detrás.
- **Color dominante:** Rojo `#c62828` y rojo oscuro `#7a1620` en el aura; almas y calavera en hueso `#ffe9d6`; destellos `#ff8a7a`.
- **Movimiento:** Las almas se arremolinan en 6 cuadros y la calavera emerge; el aura late a cada baja (+450 ms) con un golpe de luz; las almas suben continuamente.
- **Anticipación:** Pose de 650 ms: almas del suelo se arremolinan hacia él; shake leve al final.
- **Impacto:** Calavera de ⌀150 u sobre el héroe, anillo de 90 u de radio (el del código) y un pulso mayor puramente visual; sacudida de pantalla.
- **Disipación:** A los 6 s el aura se rompe en 6 cuadros y las almas caen.
- **Frames sugeridos:** anticipación 6 · impacto 6 · disipación 6 (= 18 cuadros) + bucle de 8 cuadros
- **Loop:** Aura de furia en bucle de 8 cuadros durante 6 s; las almas ascendentes son partículas.
- **Tamaño de los assets:**
  - Calavera de almas: 150×150 u → **150×150 px** nativos (1 u/px)
  - Aura roja alrededor del cuerpo: 110×120 u → **110×120 px** nativos (1 u/px)
  - Anillo de arranque: 180×180 u → **90×90 px** nativos (2 u/px)
- **Partículas / capas secundarias:** **Quitar** el parentesco con Thalen: sin cristales de hielo ni giro celeste; todo rojo y hueso. Almas = partículas de 6–8 px.
- **Ícono 16×16:** hoy `skull+drop` (`js/ui/skill-pixel-glyphs.js:169`); propuesta: calavera con gota de sangre.
- **Cómo se distingue de las otras del mismo campeón:** Es la única vertical (calavera + aura) y duradera; Tajo, Armadura y Último Aliento son locales y breves.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Encarnación del Abismo (Ilvar)**: aura verde de llamas. **Cataclismo Elemental (Thalen)**: comparte hoy el generador `cataclysmVFX` pero debe verse totalmente distinta.

