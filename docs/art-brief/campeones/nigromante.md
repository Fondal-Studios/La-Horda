# Ilvar — El Señor de las Criptas (Nigromante) (`nigromante`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones). Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Mago invocador (`roleCategory: mago`), a distancia (básico 320 u, 480 ms). Ejército de esqueletos y un gólem, almas como recurso; su definitiva lo transforma en demonio.
- **Tono:** Sombrío, ceremonial y encorvado: un sepulturero que manda sobre los muertos. Verde sepulcral, hueso y niebla; nada alegre ni brillante.
- **Fuentes del kit:** `js/data/champions.js:175`; `js/skills/abilities.js:616`; `js/champions/nigromante.js:411`; `js/champions/nigromante.js:290`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/nigromante/idle.png` (sin atlas único): grises de hueso/capa `#707070`/`#505050`, tonos azulados `#507070`/`#90b0b0`. Color de clase `#4ab88a`, brillo `#8ef0c8` (`champions.js`).
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Verde alma (dominante) | `#4ab88a` |
  | Verde fuego de alma (brillo) | `#8ef0c8` |
  | Verde profundo (sombra) | `#2a7a5a` |
  | Negro-verde (contorno) | `#0a241b` |
  | Hueso | `#d8d2b8` |
  | Verde maldición vivo (plaga/ult) | `#50e68c` |

- **Motivos visuales:** almas flotantes, cadenas de alma, calaveras, huesos, niebla del suelo, cadáveres que se fusionan en un gólem, llamas verdes, manos esqueléticas.
- **NO debe parecerse a:** **Segador** (calavera/almas rojas) y **Veyra/Vesper** (calavera de `kitFx` oscuro): Ilvar es verde, el Segador rojo y Vesper violeta con hilo. **Morveth** (hongos/peste verde `#a4c56a`) y **Khepri** (verde escarabajo `#3fae8a`): la plaga de Ilvar es verde azulado sepulcral con calaveras; Morveth es verde amarillento con esporas; Khepri, insectos. **Cazadora** (verde bosque): el verde de Ilvar es frío, no hojas.

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Proyectil de Hueso (y Garras del Abismo)

- **Mecánica (código):** A distancia: `basicRange` 320 u, enfriamiento 480 ms, proyectil `soul` a 440 u/s, radio 7 u, vida 900 ms, color `#8ef0c8`; +30% contra enemigos malditos. Transformado (Encarnación): Garras del Abismo, cono corto de 100 u (producto escalar ≥ 0,25, ≈151°), 1,5× de daño.
- **Tipo:** proyectil / cono corto en forma demonio · **Fuente:** `js/skills/abilities.js:134`; `js/skills/abilities.js:168`; `js/skills/abilities.js:146`
- **Silueta y forma:** Cráneo diminuto con cola de alma verde (≈16 u); en forma demonio, tres tajos de garra verdes paralelos y curvos.
- **Color dominante:** Verde alma `#8ef0c8` con núcleo hueso `#d8d2b8`.
- **Movimiento:** Vuela recto con un leve zigzag de la cola; las garras barren de arriba abajo en 3 cuadros.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de brillo en la mano; las garras: 1 cuadro de tensión.
- **Impacto:** Estallido verde de 17 u con 2 astillas de hueso.
- **Disipación:** Las astillas caen y la ceniza verde se apaga en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Proyectil: 18×18 u → **18×18 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
  - Garras (cono demonio): 100×100 u → **100×100 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin partículas pesadas; las almas grandes se reservan para las habilidades.
- **Cómo se distingue de las otras del mismo campeón:** Es pequeño y rápido; las habilidades son cono, cuerpo fusionado, niebla y transformación.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Disparo de Elyra (`wisp`) y de Ismara (`rune`): luz o runa. El de Ilvar es un cráneo-alma verde con cola.

### Habilidad 1 — Cosecha de Almas

- **Mecánica (código):** `soul_harvest`: cono de 210 u de alcance y semiángulo 1,05 rad (≈120° de abertura), premarcado `cone`. Coste 28, enfriamiento 6500 ms, 1,15×; ralentiza 30% por 1200 ms; da hasta 2 almas. Con Pacto (5 almas): nova completa de 231 u (1,1×), 1,8× de daño, levanta 2 esqueletos y cura 10%.
- **Tipo:** cono con cadenas de alma · **Fuente:** `js/data/champions.js:184`; `js/champions/nigromante.js:411`; `js/skills/abilities.js:616`; `js/skills/aim-targeting.js:27`
- **Silueta y forma:** Cono de zarcillos de alma: de 4 a 6 cadenas verdes parten de cada enemigo golpeado hacia Ilvar (máx. 6), sobre un abanico de manos espectrales de 210 u.
- **Color dominante:** Verde alma `#4ab88a` con brillo `#8ef0c8`; núcleos blancos en las almas.
- **Movimiento:** El cono se abre como una mano que arranca: manos espectrales avanzan hasta el alcance y retroceden tirando de cadenas de alma que vuelan de vuelta al héroe.
- **Anticipación:** Sin retardo; 2 cuadros de mano espectral formándose en el sector punteado del premarcado.
- **Impacto:** Cada enemigo expulsa un alma (esfera verde) que viaja a Ilvar; marca de ralentización (cadena en el pie) 1,2 s.
- **Disipación:** Las manos se disuelven en niebla verde en 4 cuadros; las almas llegan y se absorben (destello en el pecho).
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 4 (= 10 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Sector del cono (largo × ancho en la punta): 210×364,3 u → **210×364 px** nativos (1 u/px)
  - Alma en vuelo: 12×12 u → **12×12 px** nativos (1 u/px)
  - Nova con Pacto (⌀): 462×462 u → **231×231 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Cadenas de alma (hoy `pushChainBolt`, máx. 6): conservar como capa de eslabones finos. Con Pacto, la nova es un anillo completo con 2 esqueletos que brotan.
- **Ícono 16×16:** hoy `ghost+skull` (`js/ui/skill-pixel-glyphs.js:174`); propuesta: mano espectral abierta con alma.
- **Cómo se distingue de las otras del mismo campeón:** Es la única en cono y con cadenas; el Gólem es un cuerpo grande, la Plaga una niebla en el suelo.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Cosecha vs Tajo del Segador** (también cono): el del Segador es un arco de guadaña rojo; éste es de manos/cadenas verdes. **Mirada fulminante de Ynara** (cono rosa).

### Habilidad 2 — Gólem de Carne

- **Mecánica (código):** `summon_golem`: sin gólem, consume hasta 6 cadáveres a ≤300 u y arma un gólem junto a Ilvar (vida = 260 × (0,7 + 0,15 × cuerpos); piel piedra, fuego o hielo). Con gólem vivo, el mismo botón lo hace saltar al punto apuntado (premarcado `point` r 110 u, alcance 320 u) y APLASTA: 1,6× en 110 u, aturde 800 ms (1200 ms si hielo; los jefes no se aturden). Coste 36, enfriamiento 12000 ms.
- **Tipo:** invocación + salto-aplastamiento · **Fuente:** `js/champions/nigromante.js:440`; `js/champions/nigromante.js:193`; `js/skills/abilities.js:637`; `js/skills/aim-targeting.js:29`
- **Silueta y forma:** Dos fases: (1) cadáveres arrastrados por cadenas hacia un punto que se funden en un coloso de carne y piedra con costuras (≈100 u de alto); (2) el coloso salta, cae y el impacto levanta un anillo de 110 u de radio con rocas.
- **Color dominante:** Verde apagado `#2a7a5a` con carne `#8a6a5a` y piedra gris `#707070`; fuego `#ff8a3d` / hielo `#9fe3ff` según la piel.
- **Movimiento:** Cuerpos que se arrastran, aplastan y se funden en 7 cuadros; la caída es un golpe seco: onda circular y rocas que saltan.
- **Anticipación:** Armado: cadenas de cadáver a gólem durante ~420 ms (spawn `nigroGolemSpawn`, 420 ms). Aplastar: premarcado circular y 3 cuadros de salto.
- **Impacto:** Armado: estallido de niebla verde de 60 u. Aplastar: onda de 110 u + rocas + sacudida corta (4).
- **Disipación:** La onda y el polvo se disipan en 5 cuadros; el gólem queda en reposo.
- **Frames sugeridos:** anticipación 5 · impacto 5 · disipación 5 (= 15 cuadros)
- **Loop:** El gólem tiene su propio atlas animado (idle/andar/ataque); estas capas no hacen bucle.
- **Tamaño de los assets:**
  - Armado (fusión): 120×120 u → **120×120 px** nativos (1 u/px)
  - Onda de aplastamiento: 220×220 u → **110×110 px** nativos (2 u/px)
  - Roca suelta: 14×14 u → **14×14 px** nativos (1 u/px)
- **Partículas / capas secundarias:** El sprite del gólem ya existe (arte propio: piedra/fuego/hielo); este brief pide las capas de fusión y de impacto, no rehacer el gólem.
- **Ícono 16×16:** hoy `fist+skull` (`js/ui/skill-pixel-glyphs.js:174`); propuesta: puño de piedra con costuras.
- **Cómo se distingue de las otras del mismo campeón:** Única invocación de gran tamaño y única con salto; Cosecha y Plaga no se mueven.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Aplastamiento de Aldric/Alud del Coloso de Ilkan: los de ellos son golpes al suelo azules o de arena; éste deja rocas y niebla verde con costuras de carne.

### Habilidad 3 — Plaga de los Condenados

- **Mecánica (código):** `condemned_plague`: punto elegido (premarcado `point` r 150 u, alcance 300 u). Maldice a los enemigos del área por 6000 ms: daño continuo (0,22 × 0,35 por segundo) y +30% de daño recibido; si un maldito muere, contagia a otros a ≤140 u (hasta 2 generaciones; con Pacto 60% más de radio y una generación más). Coste 44, enfriamiento 13000 ms.
- **Tipo:** zona (maldición que se contagia) · **Fuente:** `js/skills/abilities.js:645`; `js/champions/nigromante.js:53`; `js/champions/nigromante.js:13`; `js/skills/aim-targeting.js:20`
- **Silueta y forma:** Niebla verde baja sobre el suelo de ⌀300 u, con calaveras y ojos que se asoman; sobre cada maldito, una marca de cráneo; al morir uno, hilos verdes saltan a los vecinos.
- **Color dominante:** Verde maldición `#50e68c` con negro-verde `#0a241b`; calaveras en hueso `#d8d2b8`.
- **Movimiento:** La niebla cae desde arriba y se arrastra al ras con ondulación; las marcas de cráneo laten; el contagio es un rayo de hilos de 140 u.
- **Anticipación:** Premarcado circular (existente) + anillo verde de 460 ms que se cierra (hoy una onda `#50e68c`).
- **Impacto:** Estallido inicial `nigroPlagueBurst` (ya existe, 260 ms) a 150 u de radio.
- **Disipación:** La niebla se desvanece en 6 cuadros al terminar los 6 s o se disuelve donde cae un maldito.
- **Frames sugeridos:** anticipación 3 · impacto 3 · disipación 6 (= 12 cuadros) + bucle de 8 cuadros
- **Loop:** Niebla en bucle de 8 cuadros mientras dure (6 s); marca de cráneo en bucle de 4.
- **Tamaño de los assets:**
  - Niebla de la plaga: 300×300 u → **150×150 px** nativos (2 u/px)
  - Marca de cráneo sobre enemigo: 18×18 u → **18×18 px** nativos (1 u/px)
  - Hilo de contagio (largo máx.): 140×12 u → **140×12 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Ya hay arte propio (`nigroPlague`, 3 cuadros de suelo); conservarlo como referencia de estilo y no cambiar el tono.
- **Ícono 16×16:** hoy `cloud+skull` (`js/ui/skill-pixel-glyphs.js:174`); propuesta: nube verde con calavera.
- **Cómo se distingue de las otras del mismo campeón:** La única niebla de suelo persistente y la única que se contagia por muerte.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Plaga/Esporas de Morveth** (Jardín de la peste, hongos) y **Gran Reserva de Solciju** (charco): niebla con calaveras vs esporas amarillo-verdosas vs vino granate.

### Definitiva — Encarnación del Abismo

- **Mecánica (código):** `abyss_incarnation_ult`: sin apuntado; coste 0, enfriamiento 38000 ms, dura 11000 ms. Absorbe los esqueletos y el gólem (se deshacen en almas), tarda 900 ms en transformarse (`NIGRO_TRANSFORM_MS`) y queda como Demonio Nigromántico: vida ×1,9 y daño ×1,8 (hasta +60% más según el tamaño del ejército absorbido). Anillo verde `#50e68c` de 90 u al empezar. No puede usar Cosecha ni Gólem transformado; la Plaga sí. Al terminar, el ejército vuelve.
- **Tipo:** transformación (aura) con absorción del ejército · **Fuente:** `js/skills/abilities.js:679`; `js/champions/nigromante.js:290`; `js/champions/nigromante.js:310`; `js/champions/nigromante.js:12`
- **Silueta y forma:** Tres momentos: (1) las almas del ejército se arrancan y vuelan al héroe; (2) 900 ms de torbellino de almas y huesos que lo envuelve y crece; (3) el Demonio Nigromántico (arte propio ya existente; tamaño sugerido ≈1,5× el alto de un campeón) con un aura de llamas verdes y detalles de hueso.
- **Color dominante:** Verde fuego `#50e68c` y `#8ef0c8` sobre negro-verde `#0a241b`; hueso `#d8d2b8` en cuernos y costillas.
- **Movimiento:** Absorción: cada esqueleto y el gólem se desarman en una columna de almas que sube en espiral hacia él; transformación: espiral de huesos que se cierra y estalla; demonio: llamas verdes ascendentes constantes; al terminar, la espiral se invierte y devuelve el ejército.
- **Anticipación:** Absorción de 450 ms (6 cuadros: almas viajan) + transformación de 900 ms real (el sprite del demonio ya existe: `NIGRO_DEMON_READY` en `abilities.js`).
- **Impacto:** Estallido de transformación: anillo de 90 u, columna de fuego verde de 200 u de alto, sacudida (hoy una sola onda; ampliarlo).
- **Disipación:** Al terminar (11 s): el demonio se desarma en almas que se convierten en el ejército en 6 cuadros.
- **Frames sugeridos:** anticipación 6 · impacto 8 · disipación 6 (= 20 cuadros) + bucle de 8 cuadros
- **Loop:** Aura de llamas del demonio en bucle de 8 cuadros durante 11 s; absorción y transformación no repiten.
- **Tamaño de los assets:**
  - Estallido/anillo de transformación: 180×180 u → **90×90 px** nativos (2 u/px)
  - Columna de fuego verde: 90×200 u → **90×200 px** nativos (1 u/px)
  - Aura de llamas (capa detrás del demonio): 120×150 u → **120×150 px** nativos (1 u/px)
  - Alma individual: 10×10 u → **10×10 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Almas en espiral (hasta ~14 por unidad), chispas verdes; el demonio ya tiene arte (garras, pose `soulFireCast`): este brief es el aura y las transiciones.
- **Ícono 16×16:** hoy `demon+skull` (`js/ui/skill-pixel-glyphs.js:174`); propuesta: cabeza de demonio con cuernos y llama verde.
- **Cómo se distingue de las otras del mismo campeón:** Única que cambia el cuerpo del héroe; las otras cuatro son proyectil, cono, invocación y niebla.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Segador de Almas** (aura roja de furia + calavera) y **Coloso de Arena de Ilkan** (transformación): aura verde de llamas y almas, no roja ni arenosa.

### Pasiva — Necromancia (almas y esqueletos)

- **Mecánica (código):** Los enemigos muertos dejan cadáveres; cada ~2,1 s (`NIGRO_RAISE_MS`) levanta un esqueleto de un cadáver a ≤340 u (`NIGRO_RAISE_R`) si le faltan (máx. según maestría: 2 a 6). Cada baja suelta almas (0–10; +2% de daño por alma); el HUD muestra los pips de alma y marca el Pacto en 5.
- **Tipo:** invocación pasiva + contador de almas · **Fuente:** `js/champions/nigromante.js:354`; `js/champions/nigromante.js:356`; `js/ui/hud.js:194`
- **Silueta y forma:** Un hilo de alma sube del cadáver, se une a una cadena verde con el héroe y de la mancha se levanta un esqueleto en 3 cuadros.
- **Color dominante:** Verde alma `#8ef0c8` y hueso `#d8d2b8`.
- **Movimiento:** Cadena de alma de 260 ms del cadáver al héroe; el esqueleto se arma del suelo hacia arriba.
- **Anticipación:** Cadena de 260 ms (`pushChainBolt`).
- **Impacto:** Esqueleto formado con destello verde.
- **Disipación:** Sin disipación (permanece como unidad).
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 0 (= 5 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Alma volando: 10×10 u → **10×10 px** nativos (1 u/px)
  - Levantamiento (esqueleto saliendo): 40×40 u → **40×40 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Los esqueletos ya tienen arte propio. Pedir solo las capas de cadena y de levantamiento.
- **Cómo se distingue de las otras del mismo campeón:** Es continuo y sin botón: no compite con las habilidades.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Hilos de contagio de Veyra/Vesper: los de Ilvar son verdes con cadenas de eslabones.

