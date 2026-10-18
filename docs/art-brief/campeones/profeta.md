# Ismara — La Profeta Ciega (La Profeta) (`profeta`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Soporte cuerpo a cuerpo (`roleCategory: soporte`): cura, protege y potencia a un aliado; su hoja golpea (básico 82 u, 520 ms).
- **Tono:** Oscura, encorvada e inquietante pero compasiva: ciega, ve el destino. Hilos, relojes que rebobinan, un ojo cerrado que se abre; luz fría, nunca cálida.
- **Fuentes del kit:** `js/data/champions.js:121`; `js/skills/abilities.js:1406`; `js/champions/profeta.js:10`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/profeta/atlas.png`: blanco `#f0f0f0`, turquesa oscuro `#307070`/`#305050`, grises `#505050`. Color de clase `#4fd8c4`, brillo `#bffff0` (`champions.js`).
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Turquesa (dominante) | `#4fd8c4` |
  | Turquesa pálido (brillo) | `#bffff0` |
  | Turquesa profundo (sombra) | `#2a8f86` |
  | Verde-negro (contorno) | `#0d2f33` |
  | Blanco hueso (hoja y vendas) | `#f2fbf6` |
  | Gris ceniza (acento sin vida) | `#8a9aa0` |

- **Motivos visuales:** ojo ciego que se abre, hilos de destino, relojes con las agujas hacia atrás, hoja curva de acero claro, vendas, anillos de runas, alas translúcidas al fusionarse.
- **NO debe parecerse a:** **Axiom** (`#3ad6c4`, teal de glitch/píxeles/cuadrículas): Ismara es turquesa suave y orgánica, hilos y relojes, jamás píxeles. **Nahir** (`#68c6c2`, vidrio): sin facetas ni destellos de cristal. **Elyra** (verde de sanación y alas): la curación de Ismara es fría y simbólica (reloj, ojo), no una luz verde cálida. **Aelith** (tiempo/lila).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Hoja del Augurio

- **Mecánica (código):** Melee (la referencia generada lo define a un solo objetivo): `basicRange` 82 u, enfriamiento 520 ms, pose 190 ms. Cada golpe acumula un Presagio; al 4º golpe seguido (ventana 1500 ms) dispara sola el Giro del Presagio (ver Pasiva).
- **Tipo:** golpe cuerpo a cuerpo (combo de 4) · **Fuente:** `js/data/champions.js:121`; `js/champions/profeta.js:8`; `js/skills/abilities.js:235`
- **Silueta y forma:** Tajo en arco fino de la hoja curva, blanco con borde turquesa, 55 u de largo; en el 4º golpe el arco se cierra en círculo (ver Pasiva).
- **Color dominante:** Blanco hueso `#f2fbf6` con borde turquesa `#4fd8c4`.
- **Movimiento:** Arco de 100° en 3 cuadros, con una estela finísima.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de brillo en la hoja.
- **Impacto:** Destello de 17 u: línea y dos puntos turquesa.
- **Disipación:** Polvo turquesa en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Tajo: 55×36 u → **55×36 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Un pip turquesa pequeño sobre el héroe por cada golpe acumulado (hasta 4), opcional.
- **Cómo se distingue de las otras del mismo campeón:** Es corto y blanco; las habilidades son relojes, ojos y anillos grandes.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Tajo de Veyra y de Musashi: arcos rojo/acero. El de Ismara es blanco-turquesa y fino.

### Habilidad 1 — Destino Restaurado

- **Mecánica (código):** `retro_heal`: sin apuntado; elige al aliado más herido (o a sí misma). Cura 22% de su vida máxima y, si está por debajo de 40%, revierte además 34% del daño recibido en los últimos 4500 ms. Coste 38, enfriamiento 8000 ms. Anillo de 60 u `#8fffe0` sobre el aliado.
- **Tipo:** curación a aliado (efecto en objetivo) · **Fuente:** `js/data/champions.js:135`; `js/skills/abilities.js:1406`
- **Silueta y forma:** Un reloj de arena/de pared de ⌀60 u sobre el aliado cuyas agujas giran hacia atrás, rodeado de un aro de hilos que se enrollan; chispas de números que suben.
- **Color dominante:** Turquesa pálido `#bffff0` en el reloj, turquesa `#4fd8c4` en el aro, blanco en las agujas.
- **Movimiento:** El reloj aparece sobre el aliado; las agujas giran al revés (1 vuelta en 3 cuadros) y las heridas "se rebobinan" como marcas rojas que se borran; el aro se cierra en 4 cuadros.
- **Anticipación:** Hilo fino turquesa de la mano de Ismara al aliado durante la pose (420 ms).
- **Impacto:** Cierre del aro con un destello blanco y números de curación.
- **Disipación:** El reloj se descompone en 6 puntos de luz que suben y se apagan en 5 cuadros.
- **Frames sugeridos:** anticipación 3 · impacto 4 · disipación 5 (= 12 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Reloj sobre el aliado: 60×60 u → **60×60 px** nativos (1 u/px)
  - Hilo Ismara→aliado (largo variable): 120×6 u → **120×6 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Marcas rojas de heridas que se desvanecen (muy tenues) solo cuando se activa la reversión.
- **Ícono 16×16:** hoy `ankh+plus` (`js/ui/skill-pixel-glyphs.js:171`); propuesta: reloj con agujas hacia atrás y signo +.
- **Cómo se distingue de las otras del mismo campeón:** Única con reloj; Visión es un ojo/burbuja y Danza un giro de hoja.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Alba Purificadora (Elyra)**: luz verde en área. La de Ismara es un objeto simbólico (reloj) sobre un solo aliado, turquesa fría.

### Habilidad 2 — Visión del Inmortal

- **Mecánica (código):** `brief_immunity`: elige al aliado más cercano a ≤260 u (o a sí misma); lo vuelve inmune a todo daño y limpia efectos negativos 2400 ms; al terminar recibe una regeneración de 6%. Coste 34, enfriamiento 11000 ms. Anillo de 44 u.
- **Tipo:** protección a aliado (inmunidad) · **Fuente:** `js/data/champions.js:136`; `js/skills/abilities.js:1444`
- **Silueta y forma:** Un ojo abierto grande (≈40 u) sobre el aliado y, a su alrededor, una burbuja translúcida de ⌀64 u con venas de hilo turquesa.
- **Color dominante:** Blanco `#ffffff` y turquesa pálido `#bffff0`; burbuja sin color propio.
- **Movimiento:** El ojo se abre (párpado hacia arriba) en 3 cuadros y la burbuja se infla; mientras dura, la burbuja respira y brilla; al caducar, el ojo se cierra.
- **Anticipación:** Hilo desde la mano durante la pose.
- **Impacto:** Burbuja cerrada con destello blanco.
- **Disipación:** A los 2,4 s la burbuja se desinfla y suelta 4 destellos de regeneración.
- **Frames sugeridos:** anticipación 3 · impacto 2 · disipación 4 (= 9 cuadros) + bucle de 6 cuadros
- **Loop:** Burbuja y ojo en bucle de 6 cuadros (respiración) durante 2,4 s.
- **Tamaño de los assets:**
  - Burbuja (bucle): 64×64 u → **64×64 px** nativos (1 u/px)
  - Ojo: 40×22 u → **40×22 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Hilos finos que corren por la burbuja; capa delante y detrás del aliado.
- **Ícono 16×16:** hoy `eye+up` (`js/ui/skill-pixel-glyphs.js:171`); propuesta: ojo abierto con flecha hacia arriba.
- **Cómo se distingue de las otras del mismo campeón:** Es la única con ojo y la única esférica; Destino es reloj, Danza un anillo de hoja.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Burbuja Cremosa (Myla)**, **Escudo Sagrado (Elyra)** y **Brindis (Solciju)**: escudos redondos de otros colores. La del Inmortal es incolora con ojo y venas de hilo.

### Habilidad 3 — Danza del Augurio

- **Mecánica (código):** `self_spin_stun`: sin apuntado; radio 112 u (1,1×) y radio interno 56 u donde además aturde 500 ms. Coste 36, enfriamiento 9000 ms. La pose de giro dura 480 ms; partícula `spin` de radio 95 u (`#8fffe0`).
- **Tipo:** área centrada en el héroe (giro con aturdimiento interno) · **Fuente:** `js/data/champions.js:137`; `js/skills/abilities.js:1463`
- **Silueta y forma:** Dos anillos concéntricos de hoja: uno exterior de ⌀224 u (daño) y uno interior de ⌀112 u (aturdimiento), cada uno un arco de hoja con estela, con runas de ojo en el interior.
- **Color dominante:** Blanco hueso `#f2fbf6` en el filo exterior, turquesa `#4fd8c4` en el interior, centro `#2a8f86` más oscuro.
- **Movimiento:** La hoja traza dos vueltas completas (la exterior más lenta) en 4 cuadros, dejando estelas que se desvanecen.
- **Anticipación:** Pose de giro de 480 ms (el héroe ya gira); capa de efecto: arranque de 2 cuadros.
- **Impacto:** Anillo de 112 u con destello blanco; el interior parpadea para marcar el aturdimiento.
- **Disipación:** Estelas se disuelven en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 4 (= 10 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Estela exterior: 224×224 u → **112×112 px** nativos (2 u/px)
  - Estela interior: 112×112 u → **56×56 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Runas de ojo pequeñas dentro del anillo interior (4).
- **Ícono 16×16:** hoy `moon+spark` (`js/ui/skill-pixel-glyphs.js:171`); propuesta: luna creciente/hoja con chispa.
- **Cómo se distingue de las otras del mismo campeón:** Es el único giro/anillo de hoja; las otras tres son reloj, ojo y fusión.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Torbellino de Aldric** (aro de hojas de acero azul) y **Mil Cortes de Musashi**: giros con armas. El de Ismara es una hoja fina blanca con interior de aturdimiento y runas.

### Definitiva — Ascensión del Elegido

- **Mecánica (código):** `ascension_fusion`: sin apuntado; se fusiona con el aliado vivo más cercano (si no hay, se potencia a sí misma). Duración 7000 ms: el aliado recibe curación 85% de su vida máxima, ×2,0 de daño, ×1,6 de velocidad de ataque, −45% de daño recibido, 25% de robo de vida y enfriamientos mínimos; ella queda invisible e invulnerable a 32 u del aliado. Coste 0, enfriamiento 34000 ms. Anillo de 90 u y anillo de runas de 70 u (12).
- **Tipo:** fusión con un aliado (buff + aura persistente) · **Fuente:** `js/data/champions.js:139`; `js/skills/abilities.js:1478`
- **Silueta y forma:** Una columna de luz turquesa-blanca de ⌀90 u sobre el aliado; Ismara se deshace en hilos que entran en él; durante 7 s el aliado luce un aura: halo con ojo en la frente y dos alas translúcidas turquesa.
- **Color dominante:** Blanco `#ffffff` y turquesa pálido `#bffff0` en la columna; alas turquesa `#4fd8c4`.
- **Movimiento:** Columna de luz que sube en 4 cuadros; los hilos entran en espiral; el aura respira lento; al terminar los hilos salen y ella reaparece junto al aliado.
- **Anticipación:** Pose de 650 ms: Ismara camina/vuela hacia el aliado dejando hilos; columna se forma en 4 cuadros.
- **Impacto:** Fusión: destello blanco total de 1 cuadro, anillo de 90 u y runas de 70 u girando.
- **Disipación:** La separación (7 s) es el inverso: hilos y destello en 5 cuadros.
- **Frames sugeridos:** anticipación 4 · impacto 4 · disipación 5 (= 13 cuadros) + bucle de 8 cuadros
- **Loop:** Aura persistente en bucle de 8 cuadros durante 7 s.
- **Tamaño de los assets:**
  - Columna de fusión: 90×160 u → **90×160 px** nativos (1 u/px)
  - Anillo de runas (12 runas): 140×140 u → **70×70 px** nativos (2 u/px)
  - Aura con alas (capa detrás del aliado): 96×80 u → **96×80 px** nativos (1 u/px)
- **Partículas / capas secundarias:** No debe cambiar el diseño del aliado (ART_BIBLE §5): el aura es una capa. Hilos en espiral.
- **Ícono 16×16:** hoy `wings+up` (`js/ui/skill-pixel-glyphs.js:171`); propuesta: alas con flecha hacia arriba.
- **Cómo se distingue de las otras del mismo campeón:** Única que afecta al aliado durante 7 s con aura; las demás son momentáneas.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Bendición Suprema (Elyra)**: aura de equipo. Ésta es sobre un aliado con alas y ojo, en turquesa.

### Pasiva — Presagio — Giro del Presagio

- **Mecánica (código):** Cada 4 golpes básicos consecutivos (ventana 1500 ms) dispara sola un giro de radio 105 u con 1,6× del daño del básico; ring `#eafff8` de 105 u (380 ms) y giro de 85 u de radio de partícula (420 ms).
- **Tipo:** giro automático al 4º golpe · **Fuente:** `js/champions/profeta.js:8`; `js/champions/profeta.js:12`; `js/champions/profeta.js:20`
- **Silueta y forma:** Un círculo de hoja de ⌀210 u, más fino que la Danza, con 4 muescas (una por golpe previo).
- **Color dominante:** Blanco `#f2fbf6` y turquesa pálido `#bffff0`.
- **Movimiento:** Una vuelta rápida (2 cuadros) y anillo expansivo.
- **Anticipación:** Propuesta (hoy no hay indicador): 4 pips que se llenan con cada golpe del combo.
- **Impacto:** Anillo de 105 u.
- **Disipación:** Se apaga en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 2 · disipación 3 (= 6 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Giro del Presagio: 210×210 u → **105×105 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Diferenciar claramente de la Danza del Augurio (interior turquesa y runas).
- **Cómo se distingue de las otras del mismo campeón:** Más chico, más fino y sin interior de aturdimiento que la Danza.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Giro de Aldric/Mil Cortes de Musashi: ver arriba.

