# Myla — La Niña de la Cuchara (La Maga del Yogur) (`myla`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Maga de control (`roleCategory: mago`): torres, charcos y una definitiva de llanto en área. Distancia, 320 u de básico.
- **Tono:** Infantil, desafiante y dulce con un borde de berrinche: la merienda convertida en magia. Nada es filoso; todo es blando, curvo, goteante y brillante.
- **Fuentes del kit:** `js/data/portadores.js:16`; `js/data/portadores.js:19`; `js/champions/portadores.js:89`; pasiva en `js/data/portadores-lore.js:25`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/myla/atlas.png`: crema `#f0f0d0`, rosa yogur `#f090b0`, naranja piel `#f0b070`, marrón de pelo/chocolate `#703010`/`#703030`. Color de clase `#e99abb`, brillo `#fff1e1` (`js/data/portadores.js:13`).
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Rosa yogur (dominante) | `#e99abb` |
  | Crema / leche | `#fff1e1` |
  | Rosa profundo (sombra) | `#d27a9c` |
  | Ciruela oscura (contorno) | `#5a2a3e` |
  | Cereza (acento puntual: copete de la torre) | `#d9344f` |
  | Lágrima (acento del Berrinche) | `#9ad8f0` |

- **Motivos visuales:** gotas y cucharadas, charcos con burbujas, torres de crema con cereza, burbujas con brillo, lágrimas grandes, pañal. Siluetas redondeadas, ningún ángulo agudo.
- **NO debe parecerse a:** **Ynara** (`#ed8db5`, también rosa): Myla es materia densa y opaca (crema, charco, gota) con contorno ciruela; Ynara es luz, vapor y halo blanco. **Brasa/Centinela** y **Brakk/Torreta** (torres metálicas): la torre de Myla es blanda y sin aristas. **Elyra** (burbuja/escudo celeste): la Burbuja Cremosa es rosa-crema, no celeste.

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Disparo de cuchara

- **Mecánica (código):** Básico a distancia: `basicRange` 320 u, enfriamiento 560 ms, proyectil `spoon` (cuchara) a 420 u/s, radio 8 u, vida 900 ms; la pose de ataque dura 190 ms. Se dispara al enemigo más cercano.
- **Tipo:** proyectil · **Fuente:** `js/data/portadores.js:13`; `js/data/portadores-lore.js:3`; `js/skills/abilities.js:209`
- **Silueta y forma:** Cuchara de madera pequeña con una bola de yogur encima, girando; cola de 2–3 gotitas que se desprenden. Silueta compacta y redonda (≈16 u).
- **Color dominante:** Crema `#fff1e1` en la bola; rosa `#e99abb` en las gotas; cuchara marrón `#703030`.
- **Movimiento:** Vuela recta con giro lento de la cuchara (1 vuelta cada ~300 ms) y las gotas cayendo por gravedad hacia atrás.
- **Anticipación:** Sin retardo mecánico: la anticipación es la pose del héroe (190 ms); el proyectil nace ya en vuelo con 1 cuadro de destello de crema en la punta de la cuchara.
- **Impacto:** Salpicadura plana en corona de 17 u de radio (hoy: decal `bh_myla` de 17 u por 300 ms, `js/champions/vfx-b/hooks.js:177`): 6 gotas radiales + mancha rosa.
- **Disipación:** Las gotas caen y la mancha se seca en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 5 · disipación 3 (= 9 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros (giro); impacto y disipación no repiten.
- **Tamaño de los assets:**
  - Proyectil: 16×16 u → **16×16 px** nativos (1 u/px)
  - Impacto/corona: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** 3–4 gotas sueltas por impacto (motivo `my_blob` 6×6 px ya existente en `vfx-b/myla.js`); sin brillo extra para no competir con las habilidades.
- **Cómo se distingue de las otras del mismo campeón:** Es el único elemento pequeño y rápido del kit; el resto son estructuras, charcos y áreas.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Disparo de Elyra (`wisp`, luz verde) y de Ilvar (`soul`, verde): el de Myla es rosa-crema con giro y goteo, forma de cuchara reconocible.

### Habilidad 1 — Torre de Yogur

- **Mecánica (código):** `my_tower`: se apunta a un punto (premarcado `point`, r 40 u, alcance 200 u). Coste 32, enfriamiento 9000 ms, vive 12000 ms. Torreta con vida propia = 45% de la vida máxima de Myla, tarda 500 ms en construirse, dispara cada 850 ms al enemigo más cercano en 320 u (0,5× de daño) y lo ralentiza 25% por 1000 ms. Máximo 2: la tercera reemplaza a la más antigua. Cada disparo crea un objeto "shot" de 160 ms.
- **Tipo:** invocación (estructura que dispara) · **Fuente:** `js/data/portadores.js:16`; `js/champions/portadores.js:57`; `js/champions/portadores.js:248`; `js/data/portadores-lore.js:16`
- **Silueta y forma:** Torre de 3 pisos tipo helado/torta: base ancha (piso rosa), piso medio crema con ventanita, copete con cereza roja; una boca-cañón de cucharón en el piso medio. Aprox. 56 u de ancho × 80 u de alto (más alta que un campeón: domina el campo).
- **Color dominante:** Rosa yogur `#e99abb` (cuerpo) con crema `#fff1e1` (pisos) y un punto de cereza `#d9344f`.
- **Movimiento:** Se construye de abajo hacia arriba (pisos que "brotan"); en reposo el copete se balancea apenas; al disparar el cañón retrocede 2 px y escupe una gota; al morir se derrite hacia el suelo.
- **Anticipación:** Construcción de 500 ms (real): 6 cuadros, la torre aparece translúcida y se solidifica en el último cuadro (mientras se construye no dispara). Antes, el premarcado circular de 40 u (existente).
- **Impacto:** Cuadro final de la construcción: pequeño estallido de crema radial de ≈40 u y la cereza "pop".
- **Disipación:** Al caducar a los 12 s o al morir: derretimiento en 5 cuadros que deja una mancha rosa de 40 u que se seca.
- **Frames sugeridos:** anticipación 6 · impacto 3 · disipación 5 (= 14 cuadros) + bucle de 4 cuadros
- **Loop:** Reposo en bucle de 4 cuadros (balanceo) + disparo de 3 cuadros bajo demanda (160 ms).
- **Tamaño de los assets:**
  - Torre (sprite): 56×80 u → **56×80 px** nativos (1 u/px)
  - Mancha de derretimiento: 80×80 u → **40×40 px** nativos (2 u/px)
  - Gota de disparo: 10×10 u → **10×10 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Cada disparo: una gota rosa viaja hasta el blanco y deja un hilo pegajoso 1 cuadro (refleja la ralentización). Ver pasiva.
- **Ícono 16×16:** hoy `bowl+ring` (`js/ui/skill-pixel-glyphs.js:179`); propuesta: torre de 3 pisos con cereza (no un cuenco); contorno ciruela.
- **Cómo se distingue de las otras del mismo campeón:** Única estructura vertical y persistente del kit; el Yogurazo es plano (charco) y la Burbuja es esférica.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Centinela de Latón (Brasa) y Torreta de clavos (Brakk): torretas rígidas, metálicas. La de Myla es blanda, rosa/crema, curva y goteante; ninguna arista, nada de engranajes.

### Habilidad 2 — Yogurazo

- **Mecánica (código):** `my_splash`: punto elegido (premarcado r 95 u, alcance 280 u). Coste 28, enfriamiento 6200 ms. Golpe inmediato 1,0× en radio 95 u y deja un charco de 95 u que dura 3600 ms: cada 600 ms hace 0,2× y ralentiza 40% por 850 ms. Máximo 3 charcos (el 4º borra el más viejo).
- **Tipo:** zona (golpe instantáneo + charco persistente) · **Fuente:** `js/data/portadores.js:17`; `js/champions/portadores.js:90`; `js/champions/portadores.js:258`; `js/data/portadores-lore.js:16`
- **Silueta y forma:** Una cucharada enorme que cae en arco y revienta en corona; luego un charco irregular (lóbulos, no círculo perfecto) con 5–7 burbujas que suben y estallan. ⌀190 u.
- **Color dominante:** Rosa yogur `#e99abb` con borde crema `#fff1e1`; burbujas blancas `#ffffff`.
- **Movimiento:** Cuchara descendiendo de arriba (caída rápida, ≤150 ms), corona radial que se expande y baja, charco que respira (bordes ondulan) y burbujas que ascienden.
- **Anticipación:** Premarcado circular r 95 u (existente) + 2 cuadros de la cuchara apareciendo sobre el punto; el daño es inmediato, la caída visual debe resolverse en ≤150 ms.
- **Impacto:** Corona de salpicadura a 95 u de radio (hoy: decal `my_pop` + 8 gotas), 5 cuadros; el golpe más "grueso" y claro del kit de suelo.
- **Disipación:** El charco se seca por tramado en los últimos 600 ms y suelta una última burbuja.
- **Frames sugeridos:** anticipación 2 · impacto 5 · disipación 4 (= 11 cuadros) + bucle de 8 cuadros
- **Loop:** Charco en bucle de 8 cuadros (burbujas) durante 3,6 s; el cuadro de impacto y el secado no repiten.
- **Tamaño de los assets:**
  - Corona de impacto: 190×190 u → **95×95 px** nativos (2 u/px)
  - Charco (bucle): 190×190 u → **95×95 px** nativos (2 u/px)
  - Cuchara cayendo: 40×60 u → **40×60 px** nativos (1 u/px)
- **Partículas / capas secundarias:** 8 gotas radiales al impactar (`my_blob`), burbujas que suben desde el charco; en pantalla pequeña las gotas se pueden omitir.
- **Ícono 16×16:** hoy `splat+drop` (`js/ui/skill-pixel-glyphs.js:179`); propuesta: mantener: salpicadura de crema con una gota.
- **Cómo se distingue de las otras del mismo campeón:** Es plano y de suelo; la Torre es vertical y la Burbuja es un volumen alrededor del cuerpo. Rosa saturado con lóbulos frente a la torre vertical.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Charco de vino de Solciju (Gran Reserva) y espuma de Facu GM (Cabalgar la Ola): el de Myla es rosa-crema opaco con burbujas blancas y bordes lobulados; el vino es granate con uvas y la espuma es azul.

### Habilidad 3 — Burbuja Cremosa

- **Mecánica (código):** `my_bubble`: sin apuntado, sobre sí misma. Coste 26, enfriamiento 10000 ms. Escudo = 18% de su vida máxima (24% con set de 3 piezas) durante 4500 ms y limpia su ralentización; anillo de aviso de 45 u.
- **Tipo:** aura / escudo personal · **Fuente:** `js/data/portadores.js:18`; `js/champions/portadores.js:91`
- **Silueta y forma:** Esfera de yogur translúcida que envuelve el cuerpo (⌀ ≈ 68 u), con 2 reflejos de luz curvos y 3–4 burbujitas internas.
- **Color dominante:** Crema `#fff1e1` translúcida con borde rosa `#e99abb`; reflejos blancos.
- **Movimiento:** Se infla desde el cuerpo en 3 cuadros, flota respirando (±2 px) y sigue al héroe; los reflejos giran lento.
- **Anticipación:** Sin retardo: 2 cuadros de gotas que suben y se juntan alrededor del cuerpo dentro de la pose de lanzamiento.
- **Impacto:** Ancla de "pop" suave de crema al cerrarse la esfera (anillo de 45 u).
- **Disipación:** Cuando termina o el escudo se rompe: la esfera explota en 4 burbujas que se disuelven (hoy `my_pop`).
- **Frames sugeridos:** anticipación 3 · impacto 2 · disipación 4 (= 9 cuadros) + bucle de 6 cuadros
- **Loop:** Bucle de 6 cuadros (respiración + reflejos) mientras dure el escudo (4,5 s); se acelera el parpadeo en el último segundo.
- **Tamaño de los assets:**
  - Burbuja (bucle): 68×68 u → **68×68 px** nativos (1 u/px)
  - Pop final: 90×90 u → **90×90 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Burbujitas internas; capa trasera y delantera separadas para que el héroe quede "dentro" (§7: no pintar sobre el cuerpo).
- **Ícono 16×16:** hoy `bubble+up` (`js/ui/skill-pixel-glyphs.js:179`); propuesta: mantener: burbuja con brillo.
- **Cómo se distingue de las otras del mismo campeón:** Es el único volumen esférico pegado al cuerpo; Torre y Yogurazo están en el suelo.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Escudo Sagrado de Elyra y Burbuja de Ynara/otros escudos celestes: aquí es rosa-crema, con espesor visible (yogur) y no un hexágono de luz.

### Definitiva — BERRINCHE

- **Mecánica (código):** `my_tantrum`: se centra en Myla y la sigue; coste 0, enfriamiento 34000 ms, dura 6500 ms. Cada 600 ms (≈10 ondas) golpea a los enemigos a ≤180 u con 0,55× y los ralentiza 35% por 850 ms; Myla se agranda (sprite `myla_berrinche` a escala ×1,35, en pañales) y puede moverse. Con set de 4 piezas +15% de daño.
- **Tipo:** aura móvil en área (transformación) · **Fuente:** `js/data/portadores.js:19`; `js/champions/portadores.js:92`; `js/champions/portadores.js:257`; `js/rendering/portadores.js:6`
- **Silueta y forma:** Zona circular grande ⌀360 u: anillos de llanto concéntricos que salen del cuerpo, con lágrimas gigantes cayendo y salpicando yogur. El cuerpo agrandado es la silueta central (ver sprite `berrinche.png`).
- **Color dominante:** Rosa yogur `#e99abb` en las ondas; lágrimas celestes `#9ad8f0`; crema `#fff1e1` en la salpicadura.
- **Movimiento:** Cada 600 ms sale una onda nueva desde el centro hacia 180 u mientras otra se apaga: siempre 2–3 anillos en pantalla; las lágrimas caen en picada y rebotan.
- **Anticipación:** Pose de 650 ms: el héroe se agranda (el sprite lo resuelve); capa de efecto: en 4 cuadros se hincha una burbuja de llanto y se ven 3 lágrimas cargándose en los ojos, sin retrasar la primera onda.
- **Impacto:** Primera onda a 180 u con salpicadura radial gruesa + sacudida de pantalla corta; luego pulsos más suaves cada 600 ms.
- **Disipación:** Las ondas se hacen más lentas y chicas en 4 cuadros; quedan 3 charquitos de lágrimas que se evaporan.
- **Frames sugeridos:** anticipación 4 · impacto 6 · disipación 4 (= 14 cuadros) + bucle de 8 cuadros
- **Loop:** Pulso de onda en bucle de 8 cuadros cada 600 ms durante 6,5 s (se instancia varias veces desfasado).
- **Tamaño de los assets:**
  - Onda de llanto (bucle): 360×360 u → **180×180 px** nativos (2 u/px)
  - Lágrima gigante: 20×34 u → **20×34 px** nativos (1 u/px)
  - Burbuja de anticipación: 120×120 u → **120×120 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Lágrimas (`my_tear` 4×6 px ya existente) y gotas de yogur; en modo "reducir efectos" solo 1 anillo por pulso.
- **Ícono 16×16:** hoy `burst+x` (`js/ui/skill-pixel-glyphs.js:179`); propuesta: onda concéntrica con una lágrima (no una tacha).
- **Cómo se distingue de las otras del mismo campeón:** Es la única con anillos concéntricos que viajan hacia afuera; el Yogurazo es un charco fijo y la Burbuja es un volumen cerrado.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Abrir todas las válvulas de Zahra (4 pulsos de vapor) y Ráfaga Ascendente de Saelis: pulsos de vapor o de aire. Las de Myla llevan lágrimas celestes y salpicaduras cremosas, color rosa.

### Pasiva — Yogur Pegajoso

- **Mecánica (código):** Los disparos de las torres ralentizan brevemente (25% por 1000 ms; los jefes, menos). No tiene indicador propio: el único rastro es el disparo de torre.
- **Tipo:** marca visual en los disparos de torre · **Fuente:** `js/data/portadores-lore.js:25`; `js/champions/portadores.js:253`
- **Silueta y forma:** Hilo corto de yogur que une la torre con el blanco durante 1 cuadro y una gota pegajosa sobre el enemigo ralentizado.
- **Color dominante:** Rosa `#e99abb` y crema `#fff1e1`.
- **Movimiento:** La gota resbala por el sprite del enemigo durante 1 s.
- **Anticipación:** —
- **Impacto:** Hilo de 1 cuadro entre torre y blanco.
- **Disipación:** La gota se estira y cae en 3 cuadros.
- **Frames sugeridos:** anticipación 0 · impacto 1 · disipación 3 (= 4 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Gota pegajosa: 12×12 u → **12×12 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Una sola gota por enemigo (no apilar): evita ruido con la Torre doble.
- **Cómo se distingue de las otras del mismo campeón:** Minúscula: no compite con las habilidades.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Ralentización de otros (hielo, red de Sira): la de Myla es una gota rosa, nunca un cristal.

