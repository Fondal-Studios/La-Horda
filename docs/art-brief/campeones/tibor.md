# Tibor — El Rey sin Corona (El Rey del Enjambre) (`tibor`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones). Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Mago territorial (`roleCategory: mago`), a distancia (básico 300 u, 560 ms). Una sola nube de abejas por vez que debe conservar y recolocar; su "Colonia" (0–100) se gasta con cada pulso.
- **Tono:** Apacible, terco y humilde: apicultor que no da órdenes, solo abre las cajas. Miel, cera y zumbido; nada agresivo ni brillante.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:43`; `js/champions/expedition/catalog.js:48`; `js/champions/expedition/runtime.js:57`; pasiva en `js/champions/expedition/catalog.js:46`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/tibor/atlas.png`: crema `#f0d0b0`/`#d0b090`, marrón `#705030`/`#905030`, ámbar `#b07030`. Color de clase `#c9b365` (`catalog.js:43`). Máscara de malla, colmena a la espalda, incensario.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Miel apagada (dominante) | `#c9b365` |
  | Miel clara / polen | `#f5df8a` |
  | Miel oscura (sombra) | `#8a6d1c` |
  | Marrón-negro (contorno y rayas de abeja) | `#3a2a08` |
  | Cera crema (panal) | `#fff6c8` |
  | Humo gris-marrón del incensario | `#8a7a62` |

- **Motivos visuales:** abejas con rayas, panal de hexágonos, nube de zumbido que orbita, polen, humo de incensario, gotas de miel, la colmena pequeña.
- **NO debe parecerse a:** **Khepri** (enjambre de escarabajos verde metálico, Enjambre/Eclipse): las abejas son amarillas con rayas y alas translúcidas, siempre con panal; Khepri no usa hexágonos. **Orsa** (ámbar-cobre `#dfa352`) y **Zahra** (naranja de horno): el amarillo de Tibor es miel apagada y cera, sin chispas ni llamas. **Aurelia** (oro brillante).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (abejas)

- **Mecánica (código):** A distancia: `basicRange` 300 u, enfriamiento 560 ms, proyectil `swarm` (un pequeño enjambre) a 420 u/s, radio 8 u, vida 900 ms; pose 190 ms.
- **Tipo:** proyectil · **Fuente:** `js/champions/expedition/catalog.js:43`; `js/champions/expedition/register.js:3`; `js/skills/abilities.js:209`
- **Silueta y forma:** Un puñado de 3 abejas (≈20 u de nube) en formación que zumba hacia el blanco.
- **Color dominante:** Amarillo miel `#f5df8a` con rayas `#3a2a08`; alas blancas translúcidas.
- **Movimiento:** Vuelan en espiral cerrada alrededor del eje de avance (±4 px); las alas parpadean cada 2 cuadros.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de humo en el incensario.
- **Impacto:** Las abejas se dispersan 17 u y se van.
- **Disipación:** Se alejan zumbando en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Mini-enjambre: 20×20 u → **20×20 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es pequeño y vivo; la Nube obrera es grande y orbita.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Proyectil de Khepri (`scarab`, escarabajo): el de Tibor son abejas amarillas con rayas y alas translúcidas.

### Habilidad 1 — Nube obrera

- **Mecánica (código):** `swarm`: punto elegido (premarcado `point` r 110 u, alcance 260 u). Coste 30, enfriamiento 8500 ms; dura 4800 ms; cada 600 ms (hasta 8 veces) hace 0,63× a los enemigos dentro y le cuesta 8 de Colonia (si queda <8, la nube se disuelve). Una sola nube por dueño. Hoy: 6 glifos de abeja orbitan a 0,6 del radio.
- **Tipo:** zona persistente (nube que pica cada 600 ms) · **Fuente:** `js/champions/expedition/catalog.js:48`; `js/champions/expedition/runtime.js:57`; `js/champions/expedition/runtime.js:103`; `js/champions/expedition/render.js:25`
- **Silueta y forma:** Una nube de zumbido de ⌀220 u: cientos de puntitos (abejas) en anillos que orbitan, con un panal tenue en el suelo debajo y una colmena diminuta al centro.
- **Color dominante:** Miel `#c9b365` con abejas `#f5df8a`/`#3a2a08`; panal `#fff6c8` translúcido.
- **Movimiento:** La nube se forma de afuera hacia adentro en 4 cuadros; después las abejas orbitan (1 vuelta cada ~1,2 s) y se "pican" hacia los enemigos cada 600 ms con un destello.
- **Anticipación:** Premarcado circular de 110 u (existente); 2 cuadros de abejas saliendo de la colmena.
- **Impacto:** Cada picada (cada 600 ms): abejas se lanzan 2 cuadros sobre los enemigos de adentro.
- **Disipación:** La nube se deshace en abejas que vuelan hacia Tibor (4 cuadros) o se dispersan si expira.
- **Frames sugeridos:** anticipación 4 · impacto 2 · disipación 4 (= 10 cuadros) + bucle de 8 cuadros
- **Loop:** Nube en bucle de 8 cuadros durante 4,8 s; la picada es una capa de 2 cuadros cada 600 ms.
- **Tamaño de los assets:**
  - Nube (bucle): 220×220 u → **110×110 px** nativos (2 u/px)
  - Abeja suelta: 8×8 u → **8×8 px** nativos (1 u/px)
  - Panal en el suelo: 220×220 u → **110×110 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Hasta ~40 abejas visibles; un sprite de abeja de 8 px reutilizado en varias fases.
- **Ícono 16×16:** hoy `swarm+x` (`js/ui/skill-pixel-glyphs.js:191`); propuesta: nube de abejas con tacha.
- **Cómo se distingue de las otras del mismo campeón:** La única que orbita y pica por turnos; Polen es una salpicadura y El cielo zumba una versión mayor con panal grande.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Enjambre (Khepri)**: enjambre que va, envuelve y vuelve. El de Tibor es amarillo con rayas y panal, fijo en un punto 4,8 s.

### Habilidad 2 — Volvé a casa

- **Mecánica (código):** `recall`: sin apuntado. Si hay nube: la retira, daña su recorrido (de la nube a Tibor, ancho 30 u, 1,68×), recupera 20 de Colonia y da escudo 7% por 3 s; sin nube, escudo 3% solamente. Coste 25, enfriamiento 10000 ms.
- **Tipo:** retorno de la nube (línea hacia el héroe) + escudo · **Fuente:** `js/champions/expedition/catalog.js:48`; `js/champions/expedition/runtime.js:58`
- **Silueta y forma:** Las abejas de la nube se juntan en una columna que vuela en línea hasta Tibor y se meten en la colmena de su espalda; un escudo de cera hexagonal (⌀60 u) lo cubre.
- **Color dominante:** Miel `#c9b365` en las abejas, cera `#fff6c8` en el escudo.
- **Movimiento:** La nube se estira en una cinta en 2 cuadros, cruza el campo hasta él y desaparece en la colmena con un chasquido.
- **Anticipación:** Las abejas de la nube se agitan 2 cuadros.
- **Impacto:** Escudo de cera cerrándose con un destello.
- **Disipación:** Escudo se desvanece en 4 cuadros al terminar.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros) + bucle de 6 cuadros
- **Loop:** Escudo en bucle de 6 cuadros durante 3 s.
- **Tamaño de los assets:**
  - Cinta de abejas (largo variable ≤ 260 u): 260×30 u → **260×30 px** nativos (1 u/px)
  - Escudo hexagonal de cera: 60×60 u → **60×60 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin nube: solo el escudo (variante pequeña).
- **Ícono 16×16:** hoy `hive+arrow` (`js/ui/skill-pixel-glyphs.js:191`); propuesta: colmena con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única de retorno en línea y con hexágono de cera; no coloca nada.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Llamado del Plumaje (Saelis)**: retorno de plumas con estelas doradas. Aquí son abejas amarillas y un escudo hexagonal.

### Habilidad 3 — Polen de aviso

- **Mecánica (código):** `pollen`: punto elegido (premarcado `point` r 90 u, alcance 260 u); golpea 1,365× en 90 u, ralentiza 25% por 1200 ms y mueve la nube actual a ese punto. Coste 24, enfriamiento 6000 ms.
- **Tipo:** área en punto (salpicadura) + reubica la nube · **Fuente:** `js/champions/expedition/catalog.js:48`; `js/champions/expedition/runtime.js:59`; `js/skills/aim-targeting.js:71`
- **Silueta y forma:** Una nube de polen amarillo-pálido (⌀180 u) que cae como salpicadura sobre el punto, con granos grandes y pequeños y flores diminutas; la nube de abejas se desliza hacia allí.
- **Color dominante:** Polen `#f5df8a` y crema `#fff6c8`; granos `#c9b365`.
- **Movimiento:** El polen se lanza desde el incensario y se expande en 3 cuadros; después flota y cae como lluvia fina.
- **Anticipación:** Premarcado circular de 90 u (existente); 1 cuadro de incensario inclinado.
- **Impacto:** Estallido de 90 u de radio con granos que saltan.
- **Disipación:** El polen se asienta en 5 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 5 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Nube de polen: 180×180 u → **90×90 px** nativos (2 u/px)
  - Grano grande: 6×6 u → **6×6 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Granos de dos tamaños; pocas flores para no confundir con Myla.
- **Ícono 16×16:** hoy `flower+up` (`js/ui/skill-pixel-glyphs.js:191`); propuesta: flor con flecha hacia arriba.
- **Cómo se distingue de las otras del mismo campeón:** Es polvo amarillo sin abejas; la Nube y El cielo zumba son de abejas.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Yogurazo (Myla)** y **Vino maldito (Solciju)**: salpicaduras de colores distintos. Aquí es polvo amarillo seco, sin líquido.

### Definitiva — El cielo zumba

- **Mecánica (código):** `hive_sky`: punto elegido (premarcado `point` r 155 u, alcance 270 u). Coste 0, enfriamiento 36000 ms, dura 6000 ms. Rellena la Colonia a 100 y reemplaza la nube por otra mayor que pulsa cada 600 ms (hasta 10 veces, 8 de Colonia cada una) con 0,756×. Una sola nube.
- **Tipo:** zona persistente de definitiva (colmena mayor) · **Fuente:** `js/champions/expedition/catalog.js:48`; `js/champions/expedition/runtime.js:57`; `js/skills/aim-targeting.js:71`
- **Silueta y forma:** Un enjambre enorme de ⌀310 u en forma de colmena abierta: un panal de hexágonos gigantes como cielo sobre la zona, con una nube de abejas que gira debajo y un haz de luz de miel que cae del centro.
- **Color dominante:** Miel `#c9b365`, luz de miel `#f5df8a`, cera `#fff6c8`, sombras `#8a6d1c`.
- **Movimiento:** El panal se forma sobre la zona en 6 cuadros (hexágono a hexágono desde el centro); la nube gira cada vez más rápido; cada pulso (600 ms) cae una lluvia de abejas.
- **Anticipación:** Pose de 650 ms: Tibor abre la colmena de su espalda y salen abejas hacia el punto.
- **Impacto:** Cierre del panal con destello de miel y una ola de abejas de 155 u de radio.
- **Disipación:** El panal se rompe hexágono a hexágono y las abejas vuelven a la colmena en 6 cuadros.
- **Frames sugeridos:** anticipación 6 · impacto 4 · disipación 6 (= 16 cuadros) + bucle de 8 cuadros
- **Loop:** Panal y nube en bucle de 8 cuadros durante 6 s.
- **Tamaño de los assets:**
  - Nube y panal (bucle): 310×310 u → **155×155 px** nativos (2 u/px)
  - Hexágono grande: 40×46 u → **40×46 px** nativos (1 u/px)
  - Haz de luz de miel: 60×200 u → **60×200 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Hexágonos que se iluminan en secuencia con cada pulso.
- **Ícono 16×16:** hoy `bee+ring` (`js/ui/skill-pixel-glyphs.js:191`); propuesta: abeja con anillo.
- **Cómo se distingue de las otras del mismo campeón:** La mayor y la única con panal gigante; la Nube obrera es plana y chica.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Eclipse de Escarabajos (Khepri)** (se descompone en enjambre) y **Cielo de Plumas (Saelis)** (nube desde arriba): aquí hay hexágonos de panal y abejas amarillas.

### Pasiva — Colonia viva (indicador)

- **Mecánica (código):** Fuerza de colonia 0–100: sin nube recupera 9/s; cada pulso de nube cuesta 8. Hoy se muestra como texto "NN%" sobre la cabeza (`expedition/render.js`).
- **Tipo:** indicador numérico sobre el héroe · **Fuente:** `js/champions/expedition/catalog.js:46`; `js/champions/expedition/render.js:34`
- **Silueta y forma:** (Propuesta) una colmena diminuta a la espalda con tantas abejas visibles como colonia (0 a 6 puntitos) en lugar del número.
- **Color dominante:** Miel `#c9b365`.
- **Movimiento:** Las abejas entran y salen de la colmena.
- **Anticipación:** —
- **Impacto:** —
- **Disipación:** —
- **Frames sugeridos:** anticipación 0 · impacto 1 · disipación 0 (= 1 cuadros) + bucle de 4 cuadros
- **Loop:** Bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Colmena de espalda con abejas: 28×28 u → **28×28 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Es opcional; el número actual sirve.
- **Cómo se distingue de las otras del mismo campeón:** Es continuo y pequeño.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Contador de Zahra (° de calor): distinto color y forma.

