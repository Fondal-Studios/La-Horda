# Solciju — La Enóloga (`solciju`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Maga de control (`roleCategory: mago`), a distancia (básico 300 u, 560 ms). Marca con vino (hasta 3 marcas por objetivo) y cobra con barricas y una reserva.
- **Tono:** Seca, sarcástica y reservada: "no pienso brindar por ustedes". Elegancia de bodega con borde cruel; vino oscuro, madera y vidrio, nada brillante ni infantil.
- **Fuentes del kit:** `js/champions/quality-five/solciju.js:4`; `js/champions/quality-five/solciju.js:38`; `js/champions/quality-five/register.js:7`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/solciju/atlas.png`: burdeos `#703030`/`#503030`, piel `#f0b090`, marrón `#705030`/`#b07050`. Color de clase `#923951` (`quality-five/register.js:8`); zona de suelo en código: anillo `#d69aae` con relleno `#923951`, barrica `#623c2b` con borde `#f0d3a0` (`solciju.js`).
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Vino burdeos (dominante) | `#923951` |
  | Vino claro / rosado de brillo | `#d46a86` |
  | Vino oscuro (sombra) | `#6b1f38` |
  | Negro-vino (contorno) | `#2a0814` |
  | Madera de barrica | `#623c2b` |
  | Dorado de copa y aros (acento) | `#f0d3a0` |

- **Motivos visuales:** gotas y salpicaduras de vino, barricas con aros de metal, copas y botellas, racimos de uva, corcho y sacacorchos, mechas de vela, charco con brillo.
- **Pasiva:** *Fermentación* (hasta 3 marcas de fermentación por objetivo, 5 s; la 3ª "madura" y se consume con +25% y ralentización, `solciju.js:11-27`) no tiene indicador visual en el código actual. Recomendado pero opcional: un racimo de 1–3 uvas sobre el enemigo marcado.
- **NO debe parecerse a:** **Veyra** (carmesí `#ab3459`, color casi idéntico al vino): el vino de Solciju es oscuro, translúcido y con vidrio/madera; la sangre de Veyra es brillante y opaca con cortes. **Segador** (rojo). **Myla** (rosa yogur): el vino no es rosa pastel. **Morwen** (reactivos/alambique, violeta `#a46191`): sin laboratorio, sin vapor químico.

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (sacacorchos)

- **Mecánica (código):** A distancia: `basicRange` 300 u, enfriamiento 560 ms, proyectil `wine_corkscrew` a 420 u/s, radio 8 u, vida 900 ms; pose 190 ms. Cada impacto añade una marca de fermentación.
- **Tipo:** proyectil · **Fuente:** `js/champions/quality-five/register.js:12`; `js/champions/quality-five/solciju.js:26`; `js/skills/abilities.js:209`
- **Silueta y forma:** Un sacacorchos pequeño (≈20 u) que gira como tornillo, con una gota de vino que cuelga de la punta.
- **Color dominante:** Dorado `#f0d3a0` en el metal, gota burdeos `#923951`.
- **Movimiento:** Vuela girando como tornillo (1 vuelta cada ~160 ms) y suelta 1 gota detrás.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de brillo en la copa.
- **Impacto:** Salpicadura de vino de 17 u con 3 gotas.
- **Disipación:** Las gotas caen y la mancha se seca en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Sacacorchos: 20×10 u → **20×10 px** nativos (1 u/px)
  - Salpicadura: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es pequeño y de metal con una gota; las habilidades son charcos, barricas y copas grandes.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Proyectil de Myla (cuchara rosa) y de Veyra (melee): el sacacorchos dorado con vino oscuro es único.

### Habilidad 1 — Vino maldito

- **Mecánica (código):** `sol_wine`: punto elegido (premarcado `point` r 85 u, alcance 300 u); golpea a hasta 12 enemigos con 0,9× y añade una marca de fermentación (la 3ª marca se consume: +25% y ralentiza 35% por 1200 ms). Coste 24, enfriamiento 6200 ms.
- **Tipo:** área en punto (salpicadura instantánea) · **Fuente:** `js/champions/quality-five/solciju.js:5`; `js/champions/quality-five/solciju.js:46`; `js/champions/quality-five/solciju.js:22`; `js/champions/quality-five/solciju.js:127`
- **Silueta y forma:** Una salpicadura de vino que se abre en corona sobre el punto (⌀170 u): gotas largas radiales y un charquito central que brilla.
- **Color dominante:** Burdeos `#923951` con brillo `#d46a86` y gotas oscuras `#6b1f38`.
- **Movimiento:** Un chorro baja de arriba (≤120 ms) y revienta en corona de 6 cuadros; las gotas caen con gravedad.
- **Anticipación:** Premarcado circular de 85 u (existente); 2 cuadros de copa inclinada en la mano.
- **Impacto:** Corona de 85 u de radio y uvas que saltan; marcas (racimo) sobre los golpeados.
- **Disipación:** El charquito se seca por tramado en 5 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 5 · disipación 5 (= 12 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Corona de vino: 170×170 u → **85×85 px** nativos (2 u/px)
  - Gota larga: 10×22 u → **10×22 px** nativos (1 u/px)
  - Racimo (marca): 14×14 u → **14×14 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Con el talento "Poso maldito" deja un charco de 2 s que late dos veces: añadir la variante de charco fijo.
- **Ícono 16×16:** hoy `goblet+skull` (`js/ui/skill-pixel-glyphs.js:204`); propuesta: copa con calavera/gota.
- **Cómo se distingue de las otras del mismo campeón:** Es la única instantánea con corona; la Barrica es un objeto y la Reserva un charco con pulsos.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Yogurazo (Myla)**: también salpicadura en 95 u con charco. Vino = granate oscuro con uvas y vidrio; yogur = rosa opaco con burbujas.

### Habilidad 2 — Barrica añeja

- **Mecánica (código):** `sol_cask`: punto elegido (premarcado `point` r 100 u, alcance 240 u); coloca una barrica que estalla a los 2400 ms (1,3× en 100 u). Máx. 2; reemplazar una no la detona. Con el talento "Bodega protectora", al estallar da armadura 10% 2 s a aliados cercanos. Coste 30, enfriamiento 8500 ms.
- **Tipo:** invocación con retardo (explosión programada) · **Fuente:** `js/champions/quality-five/solciju.js:6`; `js/champions/quality-five/solciju.js:50`; `js/champions/quality-five/solciju.js:72`; `js/champions/quality-five/solciju.js:135`
- **Silueta y forma:** Una barrica de madera (≈24 × 30 u) con dos aros dorados, una mecha de vela que se consume por encima y una espita que gotea; al estallar, duelas voladoras.
- **Color dominante:** Madera `#623c2b` con aros `#f0d3a0`; vino `#923951`; mecha amarilla.
- **Movimiento:** Cae del cielo y rebota una vez (4 cuadros); la mecha se acorta en una cuenta atrás de 2,4 s (hoy un arco que se completa alrededor); la barrica tiembla cada vez más; estalla.
- **Anticipación:** Retardo real de 2400 ms: 4 cuadros de caída + bucle de cuenta atrás (la mecha/arco debe leerse como tiempo restante) + aceleración de temblor los últimos 600 ms.
- **Impacto:** Estallido de 100 u: duelas, aros dorados y un chorro de vino.
- **Disipación:** El vino se derrama y se seca en 6 cuadros; quedan 3 duelas que se desvanecen.
- **Frames sugeridos:** anticipación 4 · impacto 5 · disipación 6 (= 15 cuadros) + bucle de 8 cuadros
- **Loop:** Cuenta atrás en bucle de 8 cuadros (mecha + temblor) hasta que estalla.
- **Tamaño de los assets:**
  - Barrica: 24×30 u → **24×30 px** nativos (1 u/px)
  - Estallido: 200×200 u → **100×100 px** nativos (2 u/px)
  - Anillo de aviso: 200×200 u → **100×100 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Duelas voladoras (hasta 6) y gotas; las barricas son dos a la vez: sin brillo constante.
- **Ícono 16×16:** hoy `cask+drop` (`js/ui/skill-pixel-glyphs.js:204`); propuesta: barrica con gota.
- **Cómo se distingue de las otras del mismo campeón:** Es el único objeto con cuenta atrás y estallido retardado.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Torre de Yogur (Myla)** y **Torreta (Brakk/Brasa)**: estructuras que disparan. La barrica no dispara: solo cuenta atrás y estalla. **Trampa de Área (Kael)** (explota): la barrica es de madera y vino.

### Habilidad 3 — Brindis a solas

- **Mecánica (código):** `sol_toast`: sin apuntado; +15% de armadura 3 s y cura 4% de la vida máxima; con el talento "Hospitalidad improbable" también beneficia a los aliados en 120 u. Coste 26, enfriamiento 11000 ms.
- **Tipo:** buff personal (con curación) · **Fuente:** `js/champions/quality-five/solciju.js:7`; `js/champions/quality-five/solciju.js:52`
- **Silueta y forma:** Una copa alzada sobre el hombro con un destello, y un aro de vidrio fino (⌀70 u) alrededor del cuerpo que refleja la luz.
- **Color dominante:** Dorado `#f0d3a0` en la copa y el aro, vino `#923951` dentro; destello blanco rosado `#ffd2dc`.
- **Movimiento:** La copa sube en 3 cuadros y "choca" con la nada (chispa de cristal); el aro se cierra y respira 3 s.
- **Anticipación:** Pose de 420 ms: la copa se llena en 2 cuadros.
- **Impacto:** Chispa de brindis de 20 u y aro cerrado.
- **Disipación:** El aro se rompe como cristal en 4 cuadros al terminar.
- **Frames sugeridos:** anticipación 2 · impacto 2 · disipación 4 (= 8 cuadros) + bucle de 6 cuadros
- **Loop:** Aro en bucle de 6 cuadros durante 3 s.
- **Tamaño de los assets:**
  - Copa alzada: 24×28 u → **24×28 px** nativos (1 u/px)
  - Aro de vidrio: 70×70 u → **70×70 px** nativos (1 u/px)
  - Radio de aliados (talento, referencia): 240×240 u → **120×120 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Sin partículas pesadas; solo 2 destellos de cristal.
- **Ícono 16×16:** hoy `toast+up` (`js/ui/skill-pixel-glyphs.js:204`); propuesta: dos copas que chocan.
- **Cómo se distingue de las otras del mismo campeón:** Es la única copa/cristal y la única personal; las otras tres son vino en el suelo.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Burbuja Cremosa (Myla)**, **Escudo Sagrado (Elyra)** y **Visión del Inmortal (Ismara)**: escudos redondos. El Brindis es una copa con un aro de vidrio fino, color vino-oro.

### Definitiva — Gran Reserva

- **Mecánica (código):** `sol_reserve`: punto elegido (premarcado `point` r 160 u, alcance 280 u); coste 0, enfriamiento 36000 ms, dura 4000 ms. Cuatro pulsos (1 por segundo): cada uno daña (0,35×) y ralentiza 25% por 1100 ms a los enemigos dentro y da armadura 10% por 1,2 s a los aliados; un pulso añade una marca. Con la bandera de talento `cellarRelease` detona las barricas dentro. Máx. 1.
- **Tipo:** zona persistente (charco con 4 pulsos) · **Fuente:** `js/champions/quality-five/solciju.js:8`; `js/champions/quality-five/solciju.js:60`; `js/champions/quality-five/solciju.js:88`; `js/champions/quality-five/solciju.js:138`
- **Silueta y forma:** Un lago de vino de ⌀320 u: borde de copa en espiral, racimos de uvas que flotan, y 4 "ondas de cata" que se expanden con cada pulso; reflejo de una luna dorada al centro.
- **Color dominante:** Burdeos oscuro `#6b1f38` en el fondo, vino `#923951` en el centro y brillo `#d46a86`; uvas `#2a0814`.
- **Movimiento:** El lago se llena desde los bordes en 6 cuadros; cada pulso (1 s) lanza una onda de vino y hace saltar 3 uvas.
- **Anticipación:** Premarcado circular de 160 u (existente); 650 ms de pose: una botella se vuelca (4 cuadros).
- **Impacto:** Primer pulso con salpicadura radial y 3 uvas; luego pulsos más suaves.
- **Disipación:** El vino se evapora y se drena en 6 cuadros.
- **Frames sugeridos:** anticipación 4 · impacto 4 · disipación 6 (= 14 cuadros) + bucle de 8 cuadros
- **Loop:** Lago en bucle de 8 cuadros (ondas lentas) durante 4 s, con 4 pulsos puntuales.
- **Tamaño de los assets:**
  - Lago de vino (bucle): 320×320 u → **160×160 px** nativos (2 u/px)
  - Onda de pulso: 320×320 u → **160×160 px** nativos (2 u/px)
  - Racimo: 14×14 u → **14×14 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Uvas que saltan (hasta 6 por pulso); el borde se oscurece al final.
- **Ícono 16×16:** hoy `bottle+ring` (`js/ui/skill-pixel-glyphs.js:204`); propuesta: botella con anillo.
- **Cómo se distingue de las otras del mismo campeón:** Es la mayor, persistente y líquida; la Barrica es un objeto, el Vino una corona, el Brindis un aro.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Pozo Gravitatorio (Vhal)** y **Hundimiento del Coloso (Ilkan)**: zonas con pulsos. La Reserva es un lago de vino, sin succión ni remolino. **Jardín de la peste (Morveth)**: esporas verdes.

