# Saelis — La Heraldo del Plumaje (`saelis`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones), salvo que midan más de 160 u de lado: entonces también 2,0 u/px. Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Soporte de bendiciones (`roleCategory: soporte`), a distancia (básico 280 u, 520 ms). Siembra Plumas en el suelo que aceleran y fortalecen a quien las pisa, y las dispara de vuelta.
- **Tono:** Aérea, noble y ligera: una heraldo de las copas altas del Bosque. Plumas blancas con filo dorado, cielo azul pálido, viento; elegante pero cercana.
- **Fuentes del kit:** `js/champions/ascension/catalog.js:115`; `js/champions/ascension/catalog.js:123`; `js/champions/ascension/runtime.js:160`; pasiva en `js/champions/ascension/catalog.js:119`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/saelis/atlas.png`: blancos azulados `#d0d0f0`/`#b0b0d0`, grises `#707090`/`#9090b0`. Color de clase `#9cd0f0`, brillo `#fff4cc` (`ascension/catalog.js:115`). Dos alas de plumas, aro dorado detrás de la cabeza.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Celeste cielo (dominante) | `#9cd0f0` |
  | Oro pluma (acento) | `#fff4cc` |
  | Azul medio (sombra) | `#5a8cc0` |
  | Azul noche (contorno) | `#1d3250` |
  | Blanco pluma | `#ffffff` |
  | Lila gris (raquis y sombras) | `#9090b0` |

- **Motivos visuales:** plumas con raquis y filo dorado, alas abiertas, ráfagas curvas de viento, nubecitas, aro de luz, estelas de vuelo, hexágono de plumas en el suelo.
- **NO debe parecerse a:** **Elyra** (alas y luz verde-dorada de sanación): Saelis es celeste con plumas físicas, nada de rayos de luz verde. **Oriel** (pétalos rosa que caen): las plumas de Saelis son blancas y azules, rígidas, no pétalos. **Nano GM** (alas de luz/sombra): las de Saelis son plumas azules, nunca bicolor. **Mago/Facu GM** (agua azul): el celeste de Saelis es aire, sin gotas ni espuma.

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (pluma)

- **Mecánica (código):** A distancia: `basicRange` 280 u, enfriamiento 520 ms, proyectil `feather` (pluma) a 420 u/s, radio 8 u, vida 900 ms; pose 190 ms.
- **Tipo:** proyectil · **Fuente:** `js/champions/ascension/catalog.js:115`; `js/champions/ascension/register.js:10`; `js/skills/abilities.js:209`
- **Silueta y forma:** Una pluma pequeña (≈20 u) con raquis dorado; se ve de perfil, apenas girando.
- **Color dominante:** Blanco `#ffffff` con borde celeste `#9cd0f0` y raquis oro `#fff4cc`.
- **Movimiento:** Vuela con oscilación suave (±3 px) y deja una pelusa de 2 plumillas.
- **Anticipación:** Sin retardo (pose 190 ms): 1 cuadro de brillo dorado en el báculo.
- **Impacto:** Estallido de 17 u: 4 plumillas que salen y flotan.
- **Disipación:** Las plumillas caen lentas en 4 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 4 (= 8 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Pluma: 20×10 u → **20×10 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin extras.
- **Cómo se distingue de las otras del mismo campeón:** Es pequeña y blanca; las habilidades dejan plumas grandes clavadas, ráfagas y un cielo.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Proyectil de Oriel (llave) y de Velmira (máscara): objetos; el de Saelis es una pluma blanca.

### Habilidad 1 — Abanico de Plumas

- **Mecánica (código):** `feather_fan`: cinco plumas a -0,42, -0,21, 0, +0,21 y +0,42 rad (±24°) de alcance 300 u cada una; cada una daña a los dos primeros enemigos que cruza (0,65×, ancho de golpe 22 u). Premarcado `cone`. Cada pluma queda clavada en el punta (vive 8000 ms, r 18, máx. 8). Coste 22, enfriamiento 5200 ms.
- **Tipo:** 5 proyectiles lineales en abanico (siembran plumas) · **Fuente:** `js/champions/ascension/catalog.js:123`; `js/champions/ascension/runtime.js:160`; `js/champions/ascension/runtime.js:47`; `js/skills/aim-targeting.js:63`
- **Silueta y forma:** Cinco plumas en abanico (48° entre las exteriores) que viajan a 300 u y se clavan verticales en el suelo con raquis dorado; en total el conjunto ocupa 300 × 245 u.
- **Color dominante:** Blanco `#ffffff` y celeste `#9cd0f0` con oro `#fff4cc` en la punta.
- **Movimiento:** Las cinco plumas salen del báculo, se abren y planean; al final clavan en el suelo con un pequeño rebote y quedan temblando.
- **Anticipación:** Premarcado cónico (existente); 2 cuadros de plumas que se despliegan en el báculo.
- **Impacto:** Cada pluma deja un destello dorado de 14 u al clavarse y al cruzar un enemigo.
- **Disipación:** Las plumas clavadas quedan 8 s (objeto del suelo, ver Pasiva) y se desvanecen al caducar.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 3 (= 9 cuadros)
- **Loop:** La pluma clavada tiene su propio bucle (ver Pasiva).
- **Tamaño de los assets:**
  - Pluma en vuelo: 36×14 u → **36×14 px** nativos (1 u/px)
  - Abanico completo (largo × ancho en la punta): 300×244,7 u → **150×122 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Estelas muy finas; evitar mancha opaca que tape enemigos.
- **Ícono 16×16:** hoy `fan+arrow` (`js/ui/skill-pixel-glyphs.js:203`); propuesta: abanico de plumas con flecha.
- **Cómo se distingue de las otras del mismo campeón:** Es la única de proyectiles discretos y paralelos; Ráfaga es un anillo y Llamado una vuelta.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Astillas errantes (Nahir)** y **Agujas de penumbra (Vesper)**: también abanicos. Saelis = plumas grandes que se **clavan** y quedan; los otros se disuelven.

### Habilidad 2 — Ráfaga Ascendente

- **Mecánica (código):** `updraft`: sin apuntado; radio 150 u. Aparta a los comunes 70 u, ralentiza 40% a los élites, bendice a los aliados (+15% de velocidad, 3 s) y dispara cada Pluma a ≤360 u contra el enemigo más próximo a ≤300 u de ella (0,6×). 0,8×. Coste 26, enfriamiento 8200 ms.
- **Tipo:** área centrada en el héroe (empuje + bendición + plumas disparadas) · **Fuente:** `js/champions/ascension/catalog.js:124`; `js/champions/ascension/runtime.js:162`
- **Silueta y forma:** Un aleteo: dos alas grandes se abren a los costados y una ráfaga circular de ⌀300 u (curvas de viento tipo espiral) empuja plumillas y nubecitas hacia afuera.
- **Color dominante:** Celeste pálido `#d6ecfa` y blanco `#ffffff`; sombras `#5a8cc0`.
- **Movimiento:** Las alas golpean hacia abajo (3 cuadros); el anillo de viento se expande con espirales; cada pluma del suelo se alza y sale disparada trazando una línea al enemigo.
- **Anticipación:** Pose de 420 ms: alas que se abren.
- **Impacto:** Anillo de 150 u con nubecitas y plumas disparadas.
- **Disipación:** Las espirales se aflojan y las nubecitas se disuelven en 4 cuadros.
- **Frames sugeridos:** anticipación 3 · impacto 4 · disipación 4 (= 11 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Ráfaga (anillo): 300×300 u → **150×150 px** nativos (2 u/px)
  - Alas abiertas (capa del cuerpo): 90×60 u → **90×60 px** nativos (1 u/px)
  - Línea de pluma disparada: 300×12 u → **150×6 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Nubecitas (puffs) y plumillas; hasta 8 líneas de pluma si hay muchas.
- **Ícono 16×16:** hoy `updraft+up` (`js/ui/skill-pixel-glyphs.js:203`); propuesta: flechas hacia arriba entre alas.
- **Cómo se distingue de las otras del mismo campeón:** Es la única circular y la única con alas; Abanico es direccional, Llamado es de vuelta, Cielo es una nube en el aire.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Ráfaga/Remolino de Facu GM** y **Alud/Nova de Thalen**: ondas. La de Saelis es aire pálido con plumas y alas; sin agua ni hielo.

### Habilidad 3 — Llamado del Plumaje

- **Mecánica (código):** `recall`: sin apuntado. Todas sus Plumas vuelan de regreso: dañan a los enemigos del camino (0,6×, ancho 26 u) y cada Pluma le quita 0,2 s a todos sus enfriamientos. Gana +20% de velocidad 2 s y bendice a los aliados a ≤130 u. Coste 20, enfriamiento 7000 ms. Sin plumas, solo el buff.
- **Tipo:** retorno de proyectiles (líneas hacia el héroe) · **Fuente:** `js/champions/ascension/catalog.js:125`; `js/champions/ascension/runtime.js:166`
- **Silueta y forma:** Cada pluma del suelo despega, traza una estela dorada curva hasta Saelis y se desvanece en una chispa dorada al llegar a su pecho; (hasta 8 estelas).
- **Color dominante:** Oro `#fff4cc` en las estelas, blanco `#ffffff` en las plumas.
- **Movimiento:** Las plumas se alzan en 2 cuadros y se curvan hacia ella; en el pecho, un destello dorado por pluma.
- **Anticipación:** Las plumas del suelo vibran 2 cuadros antes de despegar.
- **Impacto:** Destello dorado en el pecho por pluma + halo sobre Saelis.
- **Disipación:** Estelas se apagan en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Estela dorada (por pluma): 300×26 u → **150×13 px** nativos (2 u/px)
  - Destello en el pecho: 40×40 u → **40×40 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin plumas hay un halo dorado solo (sin estelas): es el estado vacío.
- **Ícono 16×16:** hoy `feather+spark` (`js/ui/skill-pixel-glyphs.js:203`); propuesta: pluma con chispa.
- **Cómo se distingue de las otras del mismo campeón:** Es la única con trayectoria de regreso y estelas doradas curvas; Abanico es de ida.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Volvé a casa (Tibor)**: también un "regreso" (las abejas vuelven). Saelis = estelas finas doradas con plumas; Tibor = enjambre amarillo.

### Definitiva — Cielo de Plumas

- **Mecánica (código):** `feather_sky`: punto elegido (premarcado `point` r 220 u, alcance 260 u). Coste 0, enfriamiento 40000 ms, dura 5000 ms. Cada 400 ms cae una lluvia sobre hasta 4 enemigos dentro (0,5× × 0,35 ≈ 0,18× por golpe) y bendice a los aliados de adentro; al terminar, 6 Plumas quedan en el suelo formando un hexágono de 110 u de radio. Máx. 1.
- **Tipo:** zona persistente (nube con lluvia de plumas) · **Fuente:** `js/champions/ascension/catalog.js:126`; `js/champions/ascension/runtime.js:170`; `js/champions/ascension/runtime.js:244`; `js/skills/aim-targeting.js:63`
- **Silueta y forma:** Una nube plana y blanca de ⌀440 u sobre el área, de la que cae una lluvia continua de plumas; el suelo debajo se ve como un cielo reflejado con círculo de plumas.
- **Color dominante:** Nube blanca-celeste `#d6ecfa` con plumas `#ffffff` y oro `#fff4cc`; sombra azul `#5a8cc0`.
- **Movimiento:** La nube se forma en 5 cuadros desde los bordes; las plumas caen en diagonal cada 400 ms; la nube rota muy lento.
- **Anticipación:** Premarcado circular (existente) + nube que se condensa 5 cuadros sobre el punto.
- **Impacto:** Cada lluvia: 4 plumas clavándose con destello dorado; golpe final: 6 plumas formando el hexágono.
- **Disipación:** La nube se deshace en 6 cuadros y quedan 6 plumas hexagonales.
- **Frames sugeridos:** anticipación 5 · impacto 4 · disipación 6 (= 15 cuadros) + bucle de 8 cuadros
- **Loop:** Nube y lluvia en bucle de 8 cuadros durante 5 s.
- **Tamaño de los assets:**
  - Nube (bucle): 440×440 u → **220×220 px** nativos (2 u/px)
  - Pluma que cae: 30×12 u → **30×12 px** nativos (1 u/px)
  - Hexágono de 6 plumas final: 220×220 u → **110×110 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Mucha cantidad de plumas: limitar a 4 por pulso (igual que el código); sombra suave de la nube en el suelo.
- **Ícono 16×16:** hoy `wings+ring` (`js/ui/skill-pixel-glyphs.js:203`); propuesta: alas con anillo.
- **Cómo se distingue de las otras del mismo campeón:** Es la única en cielo (desde arriba) y la única que deja un patrón fijo (hexágono).
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Tormenta de rescate (Orsa)** y **Cataclismo Elemental (Thalen)**: nubes de tormenta oscuras. La de Saelis es blanca con plumas; **Lluvia de la Cazadora** (flechas verdes).

### Pasiva — Muda Celeste (Plumas en el suelo y Bendición del Plumaje)

- **Mecánica (código):** Sus habilidades dejan Plumas en el suelo (máx. 8, r 18 u, 8000 ms). Un aliado (nunca ella) que pisa una Pluma la absorbe y recibe la Bendición del Plumaje: +15% de velocidad y +8% de daño por 3 s. Hoy se dibuja la pluma con flotación y una etiqueta "❦N" sobre Saelis.
- **Tipo:** objetos persistentes + buff visible · **Fuente:** `js/champions/ascension/catalog.js:119`; `js/champions/ascension/runtime.js:47`; `js/champions/ascension/runtime.js:48`; `js/champions/ascension/render.js:199`
- **Silueta y forma:** Pluma vertical de ≈36 u de alto clavada en el suelo, que flota ±1,5 px; al recogerla, un halo celeste-dorado pasa al aliado.
- **Color dominante:** Blanco `#ffffff` con oro `#fff4cc`; bendición celeste `#9cd0f0`.
- **Movimiento:** La pluma se mece; al pisarla se disuelve en chispas que suben al aliado y le dejan 3 s un brillo en los pies.
- **Anticipación:** La pluma recién creada "cae" 2 cuadros.
- **Impacto:** Absorción con destello.
- **Disipación:** Bendición se apaga en 4 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros) + bucle de 6 cuadros
- **Loop:** Pluma en reposo: bucle de 6 cuadros (balanceo).
- **Tamaño de los assets:**
  - Pluma clavada: 18×36 u → **18×36 px** nativos (1 u/px)
  - Halo de bendición: 40×40 u → **40×40 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Hasta 8 plumas en pantalla: sprite chico y sin brillo constante.
- **Cómo se distingue de las otras del mismo campeón:** Es el elemento persistente pequeño del kit; las habilidades son grandes.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Pétalos de Oriel: aquí son plumas rígidas blancas.

