# Oriel — La Portera de las Cicatrices (`oriel`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones). Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Soporte de reposicionamiento (`roleCategory: soporte`), a distancia (básico 270 u, 500 ms). Abre pares de portales que sacan al equipo del cerco.
- **Tono:** Serena y práctica, la que "conoce otro camino": portales, llaves y grietas, con una belleza herida (pétalos que brotan de las fisuras).
- **Fuentes del kit:** `js/champions/ascension/catalog.js:103`; `js/champions/ascension/catalog.js:111`; `js/champions/ascension/runtime.js:153`; pasiva en `js/champions/ascension/catalog.js:107`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/oriel/atlas.png`: rosa frambuesa `#d05070`/`#f07090`, ciruela `#703050`, rojizo `#905050`. Color de clase `#e05a7a`, brillo `#ffd0dc` (`ascension/catalog.js:103`). Arma: llave de las Cicatrices.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Frambuesa (dominante) | `#e05a7a` |
  | Rosa pálido (brillo) | `#ffd0dc` |
  | Ciruela (sombra) | `#8e2a48` |
  | Negro-vino (contorno y vacío del portal) | `#2a0a16` |
  | Blanco (borde de grieta) | `#ffffff` |
  | Oro viejo (llave, acento puntual) | `#d9b25c` |

- **Motivos visuales:** aros de fractura (portales), grietas que se abren con luz, llave ceremonial, pétalos que caen, pares conectados por un hilo, vacío oscuro con puntos de luz adentro.
- **NO debe parecerse a:** **Axiom** (Teletransporte/portal, icono `portal+arrow`) y **Aurelia** (Paso Luminal): sus saltos son digitales o dorados; los portales de Oriel son aros físicos con pétalos. **Vhal** (Pozo gravitatorio, vórtice violeta): el vacío de Oriel es negro-vino y no gira. **Myla/Ynara** (rosas pasteles): Oriel es frambuesa saturada con negro-vino.

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (llave)

- **Mecánica (código):** A distancia: `basicRange` 270 u, enfriamiento 500 ms, proyectil `key` (llave) a 420 u/s, radio 8 u, vida 900 ms; pose de 190 ms.
- **Tipo:** proyectil · **Fuente:** `js/champions/ascension/catalog.js:103`; `js/champions/ascension/register.js:10`; `js/skills/abilities.js:209`
- **Silueta y forma:** Llave pequeña (≈18 u) con el ojo de la llave abierto, dejando una cola de 2 pétalos.
- **Color dominante:** Rosa pálido `#ffd0dc` con ojo oscuro `#2a0a16`; borde frambuesa `#e05a7a`.
- **Movimiento:** Vuela con la punta adelante y gira lento sobre su eje; los pétalos se desprenden.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de brillo en la llave.
- **Impacto:** Chispa de grieta de 17 u (3 líneas finas) con 2 pétalos.
- **Disipación:** Los pétalos caen y la grieta se cierra en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Proyectil: 18×18 u → **18×18 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es el único objeto pequeño con forma de objeto (llave).
- **Habilidad más parecida de otro campeón y cómo evitarla:** Proyectil de Velmira (máscara) y Saelis (pluma): objeto reconocible de color distinto (rosa frente a lila y azul-oro).

### Habilidad 1 — Abrir Cicatriz

- **Mecánica (código):** `portal`: abre un portal donde está Oriel y otro en el punto elegido (premarcado `point` r 38 u, alcance 320 u). Coste 24, enfriamiento 7000 ms, dura 6500 ms; reemplaza el par anterior. Cada portal mide r 38 u. Los aliados que entran salen por el otro con escudo 5% y +20% de velocidad por 3 s (recarga 1300 ms); cada 600 ms rechaza a los enemigos 50 u y los daña (0,5× de su daño base).
- **Tipo:** invocación (par de portales conectados) · **Fuente:** `js/champions/ascension/catalog.js:111`; `js/champions/ascension/runtime.js:153`; `js/champions/ascension/runtime.js:238`; `js/skills/aim-targeting.js:61`
- **Silueta y forma:** Dos aros de fractura de ⌀76 u cada uno, bordes dentados como una grieta circular; interior negro-vino con puntos de luz; un hilo tenue de luz los une.
- **Color dominante:** Borde frambuesa `#e05a7a`; interior `#2a0a16` con motas rosa pálido.
- **Movimiento:** Cada portal se abre como una pupila: el borde crece de 0 a 38 u en 5 cuadros; en reposo los dientes del aro giran lento y caen pétalos; al cruzar un aliado, el aro hace un "latido" de luz.
- **Anticipación:** Premarcado circular de 38 u (existente) en el destino; el portal del origen empieza a abrirse en la pose.
- **Impacto:** Estallido de pétalos y destello blanco en el borde de ambos portales.
- **Disipación:** Al cumplirse los 6,5 s los aros se cierran como un iris en 5 cuadros y dejan pétalos.
- **Frames sugeridos:** anticipación 3 · impacto 5 · disipación 5 (= 13 cuadros) + bucle de 8 cuadros
- **Loop:** Cada aro en bucle de 8 cuadros (giro + pétalos) durante 6,5 s; el latido de cruce es una capa aparte de 3 cuadros.
- **Tamaño de los assets:**
  - Aro de portal (bucle): 76×76 u → **38×38 px** nativos (2 u/px)
  - Hilo que los une (opcional): 320×8 u → **160×4 px** nativos (2 u/px)
  - Latido de cruce: 100×100 u → **50×50 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Pétalos que caen (6–8 por ciclo); estrellitas dentro del vacío. Dos instancias simultáneas desfasadas.
- **Ícono 16×16:** hoy `door+spark` (`js/ui/skill-pixel-glyphs.js:202`); propuesta: puerta/arco rosa con chispa.
- **Cómo se distingue de las otras del mismo campeón:** Son aros de suelo persistentes y pareados; Eco es un pulso, Paso un salto con grieta y la ult una fisura enorme.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Teletransporte de Axiom** y Pozo Gravitatorio de Vhal: sin aros físicos; un agujero con pétalos rosa y hilo de unión es exclusivo de Oriel.

### Habilidad 2 — Eco de la Cicatriz

- **Mecánica (código):** `rift_echo`: sin apuntado; cada portal abierto (o Oriel si no hay) pulsa en un radio de 120 u: daña (1,15×) y cura 3% a los aliados cercanos. Coste 24, enfriamiento 6800 ms.
- **Tipo:** pulso de área (en cada portal) · **Fuente:** `js/champions/ascension/catalog.js:112`; `js/champions/ascension/runtime.js:155`
- **Silueta y forma:** Anillo de grietas radiales de ⌀240 u que sale de cada portal: 8 fisuras rectas con pétalos que nacen en las puntas.
- **Color dominante:** Rosa pálido `#ffd0dc` (luz de las fisuras) sobre frambuesa `#e05a7a`.
- **Movimiento:** Las 8 fisuras se disparan del centro al borde en 4 cuadros y se contraen, mientras los pétalos suben.
- **Anticipación:** Sin retardo; 2 cuadros de latido en el aro del portal.
- **Impacto:** Fisuras al radio completo de 120 u con destello blanco; curación: chispas rosa pálido sobre aliados.
- **Disipación:** Las fisuras se cierran en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 4 (= 10 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Pulso de grietas (por portal): 240×240 u → **120×120 px** nativos (2 u/px)
  - Chispa de curación: 20×20 u → **20×20 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Se instancia una vez por portal abierto (hasta 2).
- **Ícono 16×16:** hoy `ghost+dots` (`js/ui/skill-pixel-glyphs.js:202`); propuesta: fantasma/portal con puntos rosa.
- **Cómo se distingue de las otras del mismo campeón:** Es radial y breve; Abrir Cicatriz es persistente y Paso entre Mundos una sola grieta direccional.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Alba Purificadora de Elyra (pulso curativo): el de Oriel son fisuras rectas y pétalos con luz rosa, no un anillo verde.

### Habilidad 3 — Paso entre Mundos

- **Mecánica (código):** `rift_step`: reaparece en su portal más lejano o en el punto elegido (premarcado `dash` de 30 u, alcance 300 u). Deja en el origen una grieta de r 70 u que dura 2500 ms y daña cada 500 ms (0,4× × 1,2); al llegar golpea 60 u (0,6×). Coste 20, enfriamiento 6200 ms, 1,2×.
- **Tipo:** desplazamiento (teletransporte) con grieta · **Fuente:** `js/champions/ascension/catalog.js:113`; `js/champions/ascension/runtime.js:156`; `js/champions/ascension/runtime.js:242`; `js/skills/aim-targeting.js:61`
- **Silueta y forma:** Salida: una fisura irregular de ⌀140 u en el suelo, con luz pulsante; llegada: un pequeño aro de pétalos de ⌀120 u.
- **Color dominante:** Frambuesa `#e05a7a` con núcleo blanco `#ffffff` en la grieta; pétalos rosa pálido.
- **Movimiento:** El héroe se pliega por su sombra hacia la grieta y emerge del otro lado en 3 cuadros; la fisura de salida pulsa 5 veces (cada 500 ms) y se cierra.
- **Anticipación:** Premarcado de salto (existente); la grieta nace bajo sus pies en 2 cuadros.
- **Impacto:** Llegada: aro de pétalos y luz de 60 u de radio; sacudida muy corta.
- **Disipación:** La fisura de salida se cierra en 5 cuadros tras 2,5 s.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 5 (= 11 cuadros) + bucle de 6 cuadros
- **Loop:** La grieta del origen en bucle de 6 cuadros (pulso) durante 2,5 s.
- **Tamaño de los assets:**
  - Grieta del origen (bucle): 140×140 u → **70×70 px** nativos (2 u/px)
  - Aro de llegada: 120×120 u → **60×60 px** nativos (2 u/px)
  - Hilo del trayecto: 300×24 u → **300×24 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Pétalos que salen hacia atrás en la llegada.
- **Ícono 16×16:** hoy `portal+spark` (`js/ui/skill-pixel-glyphs.js:202`); propuesta: portal con chispa.
- **Cómo se distingue de las otras del mismo campeón:** La única que deja una grieta en el suelo; Abrir Cicatriz son aros, Eco es un anillo de fisuras.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Inversión de Nano GM (runa en el origen): la de Oriel es una fisura de luz con pétalos, sin bicolor.

### Definitiva — La Gran Cicatriz

- **Mecánica (código):** `great_rift`: punto elegido (premarcado `point` r 200 u, alcance 280 u). Coste 0, enfriamiento 40000 ms, dura 6000 ms. Cada 600 ms daña (0,35×) y ralentiza 35% por 800 ms a los enemigos dentro; hasta 6 "ecos de campeones caídos" golpean a un objetivo cada uno (1,2×); según la descripción del kit, los aliados dentro reciben −20% de daño.
- **Tipo:** zona persistente de definitiva (fisura gigante con ecos) · **Fuente:** `js/champions/ascension/catalog.js:114`; `js/champions/ascension/runtime.js:158`; `js/champions/ascension/runtime.js:248`; `js/skills/aim-targeting.js:62`
- **Silueta y forma:** Una grieta enorme en el suelo de ⌀400 u: fisura central serpenteante con bordes dentados que se abren y dejan ver un vacío; de ella emergen 6 siluetas de campeones de espaldas que golpean.
- **Color dominante:** Vacío negro-vino `#2a0a16` al centro, bordes de luz blanca `#ffffff` y frambuesa `#e05a7a`; ecos en rosa pálido translúcido `#ffd0dc`.
- **Movimiento:** La fisura se abre desde el centro en 6 cuadros con una sacudida; cada 600 ms late; cada eco sale por la grieta, golpea con un tajo y se desvanece; pétalos suben sin parar.
- **Anticipación:** Premarcado circular de 200 u (existente); el primer eco golpea recién a los 400 ms (`age>400` en `as_great`), así que la fisura puede abrirse durante ese tiempo.
- **Impacto:** Apertura: destello blanco y sacudida; cada eco: tajo de 60 u y luz.
- **Disipación:** La grieta se cierra desde los extremos hacia el centro en 7 cuadros.
- **Frames sugeridos:** anticipación 5 · impacto 6 · disipación 7 (= 18 cuadros) + bucle de 10 cuadros
- **Loop:** Grieta viva en bucle de 10 cuadros (late y deja salir pétalos) durante 6 s; ecos son capas de 5 cuadros.
- **Tamaño de los assets:**
  - Fisura completa (bucle): 400×400 u → **200×200 px** nativos (2 u/px)
  - Eco de campeón (silueta): 40×56 u → **40×56 px** nativos (1 u/px)
  - Tajo del eco: 60×60 u → **60×60 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Las siluetas de eco deben ser genéricas (no el diseño de un campeón real: ART_BIBLE §5). Pétalos y estrellitas dentro del vacío.
- **Ícono 16×16:** hoy `rift+ring` (`js/ui/skill-pixel-glyphs.js:202`); propuesta: fisura con luz rosa y anillo.
- **Cómo se distingue de las otras del mismo campeón:** Es la única de gran escala y la única con siluetas; el resto son aros chicos o pulsos.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Colapso de Vhal (singularidad violeta que atrae) y Juicio del GM (Nano): la grieta de Oriel es rosa, estática, con ecos; Vhal es un vórtice, Nano parte la arena en blanco y negro.

### Pasiva — Paso entre Cicatrices

- **Mecánica (código):** Los aliados que cruzan un portal salen por el otro con escudo y +20% de velocidad (3 s); los enemigos que lo tocan son rechazados y dañados. No tiene indicador propio hoy.
- **Tipo:** marca visual al cruzar · **Fuente:** `js/champions/ascension/catalog.js:107`; `js/champions/ascension/runtime.js:238`
- **Silueta y forma:** Un halo rosa pálido sobre el aliado que sale (burbuja de ≈40 u) y 4 pétalos.
- **Color dominante:** Rosa pálido `#ffd0dc` y frambuesa `#e05a7a`.
- **Movimiento:** La burbuja se desinfla y se va en 3 cuadros.
- **Anticipación:** —
- **Impacto:** Aparición con halo.
- **Disipación:** Se apaga.
- **Frames sugeridos:** anticipación 0 · impacto 2 · disipación 2 (= 4 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Halo de salida: 48×48 u → **48×48 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Un solo halo por aliado.
- **Cómo se distingue de las otras del mismo campeón:** Muy chico; no compite.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Escudos celestes: éste es rosa pálido.

