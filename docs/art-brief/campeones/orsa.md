# Orsa — La Guardacables (La Cazadora del Trueno) (`orsa`)

> **Especificación técnica** (atlas, paleta, alfa, nombres de archivo, export): `docs/art-brief/00_ESPECIFICACION_TECNICA.md`. Este brief NO la duplica; si ella fija otra escala de píxel, convertir con `px = u ÷ escala`.
> **Estilo:** `docs/ART_BIBLE.md` §7 (VFX libres, en capas propias, nunca pintados dentro del cuerpo) y §14 (densidad). **Unidades:** `u` = unidad de mundo; la pantalla muestra 650 u en el lado corto (`js/core/constants.js:20`); un campeón mide ~66–70 u (ART_BIBLE §2). **Escala de px usada acá (supuesto explícito):** decales y zonas de suelo 2,0 u/px (canon de suelos, ART_BIBLE §14); proyectiles, auras y efectos a escala de cuerpo 1,0 u/px (canon de campeones). Los tamaños en u son del código (a nivel base: maestría y talentos multiplican radio/alcance, `AREA` en `js/skills/abilities.js`); los px son conversión.
> **Tiempos:** casi todas las habilidades son instantáneas (el daño se aplica al lanzar). La pose de lanzamiento del héroe dura 420 ms (650 ms en definitiva); la anticipación del efecto debe caber ahí y en el premarcado del apuntado, sin retrasar el golpe, salvo donde se indica un retardo real.

## A. Identidad

- **Rol:** Asesina a distancia (`roleCategory: asesino`), ballesta de bobina (básico 335 u, 580 ms). Distribuye cargas en los blancos y las descarga.
- **Tono:** Práctica, obrera y terca: rescatista minera que responde a los golpes en un cable. Cobre, hierro, chispas secas y un hilo de cable; ni mágica ni elegante.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:37`; `js/champions/expedition/catalog.js:42`; `js/champions/expedition/runtime.js:53`; pasiva en `js/champions/expedition/catalog.js:40`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/orsa/atlas.png`: cobre/ocre `#903010`/`#703010`, marrón `#501010`, piel `#f0b090`. Color de clase `#dfa352` (`catalog.js:37`). Ballesta ancha con bobina, poncho minero.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Ámbar/cobre (dominante) | `#dfa352` |
  | Amarillo chispa | `#ffe08a` |
  | Cobre oscuro (sombra) | `#a05a1e` |
  | Marrón-negro (contorno) | `#3a1e08` |
  | Marfil-amarillo (núcleo de la chispa) | `#fff9d6` |
  | Azul acero (acento: hierro y cable) | `#2b3d5c` |

- **Motivos visuales:** pernos de metal, cable que se desenrolla, bobinas, chispas cortas de cobre, trazas de circuito en ángulos rectos, tres golpes, nube de tormenta baja.
- **Pasiva:** *Carga conductora* (hasta 3 cargas por blanco, 5 s, `catalog.js:40`) no tiene indicador visual en el código actual (no se dibuja en `expedition/render.js`); no se pide arte. Se recomienda, si hay presupuesto, una micro-chispa ámbar por carga sobre el enemigo (extra, no obligatorio).
- **NO debe parecerse a:** **Thalen/Cadena de Relámpago** y **Axiom** (relámpago violeta/azul eléctrico): las chispas de Orsa son ámbar-cobre, secas y angulosas; sin arcos azules. **Brasa** (cobre `#c58543`, remaches y vapor) y **Zahra** (naranja de horno): Orsa va a pernos, cables y circuitos, sin vapor ni llamas. **Libertador** (disparo pesado azul/blanco).

## B. Habilidades

Convención de cada ficha: *Mecánica* = lo que hace el código hoy (no se inventa nada); el resto es lo que se pide al dibujante. "Frames" = cuadros sugeridos por fase.

### Ataque básico — Ataque básico (perno de ballesta)

- **Mecánica (código):** A distancia: `basicRange` 335 u, enfriamiento 580 ms, proyectil `bolt` (perno) a 420 u/s, radio 8 u, vida 900 ms; pose de 190 ms. Cada impacto deja una carga conductora (máx. 3 por blanco).
- **Tipo:** proyectil · **Fuente:** `js/champions/expedition/catalog.js:37`; `js/champions/expedition/register.js:3`; `js/skills/abilities.js:209`
- **Silueta y forma:** Perno corto de metal (≈20 u) con plumas de hierro y una chispa en la punta; un hilo fino de cable lo une un instante a la ballesta.
- **Color dominante:** Hierro `#2b3d5c` y cobre `#dfa352`, chispa `#ffe08a`.
- **Movimiento:** Vuela recto, sin giro; la chispa de la punta parpadea cada 2 cuadros.
- **Anticipación:** Sin retardo (pose 190 ms); 1 cuadro de destello en la bobina.
- **Impacto:** Chispazo de 17 u (4 líneas rectas) y una carga ámbar que queda 1 cuadro en el blanco.
- **Disipación:** Líneas de chispa se apagan en 3 cuadros.
- **Frames sugeridos:** anticipación 1 · impacto 3 · disipación 3 (= 7 cuadros) + bucle de 4 cuadros
- **Loop:** Proyectil en bucle de 4 cuadros.
- **Tamaño de los assets:**
  - Perno: 20×8 u → **20×8 px** nativos (1 u/px)
  - Impacto: 34×34 u → **34×34 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Sin partículas pesadas.
- **Cómo se distingue de las otras del mismo campeón:** Es corto y sin cola; Perno conductor es largo, con cable.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Disparo de Libertador y Cazadora (flecha/bala): el perno de Orsa es un virote de ballesta con cable y chispa cobre.

### Habilidad 1 — Perno conductor

- **Mecánica (código):** `pierce`: línea de 340 u, atraviesa todos (hasta 12; premarcado `line` de 20 u; el golpe alcanza 22 u + radio del enemigo). Coste 25, enfriamiento 6500 ms, 3,08×; deja una carga por enemigo golpeado.
- **Tipo:** proyectil lineal perforante · **Fuente:** `js/champions/expedition/catalog.js:42`; `js/champions/expedition/runtime.js:53`; `js/champions/expedition/runtime.js:8`; `js/skills/aim-targeting.js:70`
- **Silueta y forma:** Un perno largo (≈60 u) que arrastra un cable desenrollándose tras de sí; el cable queda tendido 1 cuadro en toda la línea de 340 u (340 × 44 u).
- **Color dominante:** Cobre `#dfa352` en el cable, chispa amarilla `#ffe08a` en los blancos, hierro `#2b3d5c` en el perno.
- **Movimiento:** Sale de la ballesta y cruza la línea entera en 2 cuadros; el cable se tensa y vibra, dejando chispas en cada enemigo atravesado.
- **Anticipación:** Premarcado lineal (existente); 2 cuadros de bobina girando antes del disparo.
- **Impacto:** En cada enemigo: chispazo de 24 u y una carga ámbar visible 1 cuadro.
- **Disipación:** El cable se enrolla de vuelta hacia la ballesta en 4 cuadros (se recoge).
- **Frames sugeridos:** anticipación 2 · impacto 3 · disipación 4 (= 9 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Perno: 60×12 u → **60×12 px** nativos (1 u/px)
  - Cable tendido (línea completa): 340×44 u → **340×44 px** nativos (1 u/px)
  - Chispazo por blanco: 48×48 u → **48×48 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Chispas cortas y angulosas (nada de arcos curvos).
- **Ícono 16×16:** hoy `rod+bolt` (`js/ui/skill-pixel-glyphs.js:190`); propuesta: perno con cable y chispa.
- **Cómo se distingue de las otras del mismo campeón:** Es la única línea larga, la única con cable; Cerrar el circuito es un anillo, Apoyar la culata un ancla.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Línea de tinta (Sira)** y **Sentencia Umbría (Nano GM)**: líneas largas. Orsa = cobre/hierro con cable; Sira = azul tinta con cruces de mapa; Nano = negro y oro. También **Perforante de Cazadora** (flecha verde).

### Habilidad 2 — Apoyar la culata

- **Mecánica (código):** `brace`: sin apuntado ni área; coste 24, enfriamiento 10500 ms, dura 3500 ms. Mientras dure y queden disparos: velocidad −25%, sus próximos 3 básicos hacen +25% y gana +20% de daño (AFIRMADA).
- **Tipo:** postura (buff personal) · **Fuente:** `js/champions/expedition/catalog.js:42`; `js/champions/expedition/runtime.js:54`; `js/champions/expedition/runtime.js:118`
- **Silueta y forma:** Una ancla de metal bajo la ballesta: bípode de dos patas con tornillos clavados al suelo y un aro de seguridad de ≈60 u en el suelo; 3 pernos de reserva visibles que se "gastan" con cada disparo reforzado.
- **Color dominante:** Hierro `#2b3d5c` con tornillos cobre `#dfa352` y aro ámbar `#ffe08a`.
- **Movimiento:** Las patas bajan y se clavan en 3 cuadros; el aro late lento; cada disparo reforzado hace saltar un perno y un chispazo en el aro.
- **Anticipación:** Pose de 420 ms: ballesta hacia el suelo, patas desplegándose.
- **Impacto:** Clavado con un golpe seco y destello del aro.
- **Disipación:** Las patas se pliegan y el aro se apaga en 4 cuadros al terminar.
- **Frames sugeridos:** anticipación 3 · impacto 2 · disipación 4 (= 9 cuadros) + bucle de 6 cuadros
- **Loop:** Aro en bucle de 6 cuadros mientras dure (3,5 s o hasta gastar los 3 disparos).
- **Tamaño de los assets:**
  - Aro de anclaje: 60×60 u → **30×30 px** nativos (2 u/px)
  - Bípode/patas (capa del cuerpo): 36×24 u → **36×24 px** nativos (1 u/px)
  - Perno de reserva (×3): 8×14 u → **8×14 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Los 3 pernos de reserva funcionan como contador visual (sin texto).
- **Ícono 16×16:** hoy `rifle+up` (`js/ui/skill-pixel-glyphs.js:190`); propuesta: ballesta apoyada con flecha hacia arriba.
- **Cómo se distingue de las otras del mismo campeón:** Es la única inmóvil y sin proyectil: una postura de suelo; las demás se mueven o explotan.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Armadura de la Furia (Segador) y Grito de Guerra (Aldric): buffs con aro. El aro de Orsa es mecánico (patas, tornillos), no una aura roja ni azul.

### Habilidad 3 — Cerrar el circuito

- **Mecánica (código):** `discharge`: sin apuntado; coste 30, enfriamiento 9000 ms, 1,82×. Golpe inmediato de 0,5× en un radio de 122 u (0,7 × 175) y descarga de 175 u: consume las cargas de los enemigos marcados (+20% de daño por carga), y salta a 2 vecinos a ≤85 u de cada marcado (25%); presupuesto de 12 blancos.
- **Tipo:** área centrada en el héroe (golpe + descarga) · **Fuente:** `js/champions/expedition/catalog.js:42`; `js/champions/expedition/runtime.js:55`; `js/champions/expedition/runtime.js:20`
- **Silueta y forma:** Un circuito impreso circular en el suelo: dos anillos (122 u y 175 u) unidos por trazas rectas en ángulos de 90° que se encienden desde el centro; arcos cortos entre los enemigos marcados.
- **Color dominante:** Ámbar `#dfa352` en las trazas, amarillo `#ffe08a` al encenderse, fondo cobre oscuro `#a05a1e`.
- **Movimiento:** Las trazas se iluminan de adentro hacia afuera en 4 cuadros (como una corriente); los arcos saltan a los marcados con quiebres a 90°.
- **Anticipación:** Se ve el anillo punteado de 175 u (aviso, existente) y 1–2 cuadros de las trazas energizándose.
- **Impacto:** Destello radial de 175 u y arcos de 85 u entre marcados.
- **Disipación:** Las trazas se apagan de afuera hacia adentro en 5 cuadros.
- **Frames sugeridos:** anticipación 2 · impacto 4 · disipación 5 (= 11 cuadros)
- **Loop:** No hace bucle.
- **Tamaño de los assets:**
  - Circuito (anillo exterior): 350×350 u → **175×175 px** nativos (2 u/px)
  - Anillo de golpe interior: 245×245 u → **122×122 px** nativos (2 u/px)
  - Arco entre marcados: 85×16 u → **85×16 px** nativos (1 u/px)
- **Partículas / capas secundarias:** Chispas que saltan en las esquinas de las trazas; los arcos usan siempre ángulos rectos (diferencia con rayos curvos de otros).
- **Ícono 16×16:** hoy `circuit+bolt` (`js/ui/skill-pixel-glyphs.js:190`); propuesta: circuito con rayo.
- **Cómo se distingue de las otras del mismo campeón:** Es radial y de suelo, con retícula; Perno es línea, Tormenta es nube.
- **Habilidad más parecida de otro campeón y cómo evitarla:** Nova de Escarcha (Thalen) y Error 404 (Axiom): estallidos radiales. El de Orsa es un tablero de circuito cobre con trazas rectas.

### Definitiva — Tormenta de rescate

- **Mecánica (código):** `storm`: sin apuntado; coste 0, enfriamiento 36000 ms, dura 2400 ms, sigue a Orsa. Cuatro pulsos cada 600 ms: los 3 primeros son conos de 280 u (semiángulo 0,85 rad ≈ 97°) que marcan +1 carga por enemigo; el 4º es una descarga de 210 u que consume las marcas. Ralentiza 25% por 1500 ms a los enemigos a ≤280 u; los aliados a ≤280 u ganan +15% de velocidad por la duración. 1,12×.
- **Tipo:** aura móvil (nube con 3 barridos cónicos + descarga final) · **Fuente:** `js/champions/expedition/catalog.js:42`; `js/champions/expedition/runtime.js:56`; `js/champions/expedition/runtime.js:102`
- **Silueta y forma:** Una nube de tormenta baja y plana sobre Orsa (⌀420 u); desde ella caen 3 barridos en abanico (cada uno un cono de 280 u) con rayos de cobre angulosos y, al final, una descarga redonda de 210 u.
- **Color dominante:** Nube azul-negra `#1b2438` con rayos ámbar `#dfa352` y núcleo `#fff9d6`.
- **Movimiento:** La nube se forma sobre ella en 4 cuadros y la sigue; cada 600 ms un barrido gira (desplaza el ángulo) hasta el cuarto, que cae en círculo; truenos entre barridos.
- **Anticipación:** Pose de 650 ms: la nube se forma y oscurece; el primer barrido empieza al terminar la pose.
- **Impacto:** Tercer barrido y descarga final: destello radial de 210 u y marcas consumidas en cadena, sacudida (si el motor la habilita).
- **Disipación:** La nube se deshace en lluvia fina y chispas en 6 cuadros.
- **Frames sugeridos:** anticipación 4 · impacto 6 · disipación 6 (= 16 cuadros) + bucle de 8 cuadros
- **Loop:** Nube en bucle de 8 cuadros durante 2,4 s; los barridos son capas de 4 cuadros, no repiten.
- **Tamaño de los assets:**
  - Nube (bucle): 420×420 u → **210×210 px** nativos (2 u/px)
  - Barrido cónico (largo × ancho): 280×420,7 u → **280×421 px** nativos (1 u/px)
  - Descarga final (⌀): 420×420 u → **210×210 px** nativos (2 u/px)
- **Partículas / capas secundarias:** Lluvia fina y chispas; el rayo debe leerse como cable de cobre quebrado, no como relámpago de tormenta azul.
- **Ícono 16×16:** hoy `storm+ring` (`js/ui/skill-pixel-glyphs.js:190`); propuesta: nube con rayo y anillo.
- **Cómo se distingue de las otras del mismo campeón:** Única definitiva móvil y en secuencia de cuatro golpes; el resto son pernos, posturas y circuitos fijos.
- **Habilidad más parecida de otro campeón y cómo evitarla:** **Cataclismo Elemental (Thalen)** y **Cielo de Plumas (Saelis)**: también tormentas/nubes sobre el área. La de Orsa es de cobre con conos barridos y se mueve con ella.

