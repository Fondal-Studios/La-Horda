# Tobías, el Farolero (`farolero`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Escolta (rol soporte, luz local, sendas y escudos por pulsos, melee). Tono: callado y terco; baja otra vez a las minas a sostener la luz hasta que cruce el último. Lenguaje: farol de mina, llama, polilla, riel, picota.
- **Paleta sugerida:** ámbar apagado `#bba56e` (color de clase, `data/portadores.js:45`), luz `#ffe7a5`, llama `#ff9a3c`, dorado cálido `#e8c060`, pardo de mina `#3c2424`, humo `#5a4a3a`, contorno `#2a1c08`.
- **Motivos visuales:** farol de vidrio con llama, polillas, rieles, madera de apuntalar, picota, polvo de carbón, halo de luz tenue.
- **NO debe parecerse a:** **Aurelia** (oro facetado y frío); **Dáriel** (ocre con notas); **Brasa** (latón rojizo con vapor); **Libertador** (sol de mayo): el Farolero es luz de LLAMA viva, parpadeante y sin geometría; **Khepri** (polillas/escarabajos: sus polillas son pequeñas y de luz).
- **Estado actual del VFX (verificado en código):** Tema procedural `lantern` (`themes.js:18`, forma `sun`, motivos flame/moth/star/spark, emblema farol). `skill-fx-a/c/farolero.js`: farol = prop con motivo de farol + nova del radio, Destello = cono + estallido, Paso Seguro = haz 36-84 u, Vigilia = zona de héroe + nova. Firma `sun` `#ffe592` (`skills/champion-signatures.js:10`).
- **Fuentes del kit:** `js/data/portadores.js:45-52`, lanzamiento `js/champions/portadores.js:148-154`, objetos `:239-`, luz `:216-224`, escudos de Vigilia `:235`, pasiva `data/portadores-lore.js:29`.

## B. Habilidades

### Básico - Piqueta de guardia

- **Mecánica (código):** Golpe cuerpo a cuerpo; alcance 90 u, cooldown 590 ms (arma: Piqueta de Guardia). *(`data/portadores.js:45` (`range:90, basic:590`))*
- **Silueta y forma:** Arco corto de picota con una chispa de pedernal en el choque.
- **Color dominante:** Ámbar apagado `#bba56e` y chispa `#ffe7a5`.
- **Movimiento:** Golpe de arriba hacia abajo, más lento que el de Kael.
- **Anticipación:** La picota se levanta, 2 cuadros.
- **Impacto:** Choque contra roca con chispa, 3 cuadros.
- **Disipación:** Chispas que caen.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros
- **Tamaño sugerido del asset (px nativos):** 64x96 px (radio 90u, ancho de boca 135u, arco 97 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Chispas, polvo de carbón.
- **Ícono 16x16:** picota. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Corte de picota con chispa; sus habilidades son luz.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Martillazo de obra de Brakk: polvo de ladrillo; aquí hay chispa y roca.

### Hab. 1 - Farol de Guardia

- **Mecánica (código):** Coloca un farol (alcance 170 u, radio 120 u, 9000 ms, máx. 1): cada 600 ms da un escudo mínimo (1,6% de vida por potencia) a los aliados dentro, -8% daño recibido dentro y luz débil local. No enciende braseros. Costo 28, cooldown 9500 ms. *(`data/portadores.js:48`, `portadores.js:148,216-222,200`)*
- **Silueta y forma:** Farol de mina colgado de un poste (24x56 u) con vidrio, llama que baila y 3 polillas que lo rodean; el suelo se ilumina en un disco de luz tenue de 120 u con anillos tramados.
- **Color dominante:** Ámbar `#e8c060` y llama `#ff9a3c`.
- **Movimiento:** La llama parpadea (8 cuadros) y las polillas orbitan; cada 600 ms un pulso suave sale del vidrio.
- **Anticipación:** El poste se clava y el vidrio se enciende, 4 cuadros.
- **Impacto:** La luz se abre y llena el disco, 3 cuadros.
- **Disipación:** La llama se achica y se apaga con una voluta de humo, 4 cuadros.
- **Cuadros sugeridos:** anticipación 4 + impacto 3 + disipación 4 = 11 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** farol 24x56 u -> 16x40 px + disco de luz Ø160 px (r=120 u)
- **Loop:** Sí: llama y polillas en loop de 8 cuadros durante 9000 ms.
- **Partículas / capas secundarias:** Polillas, cenizas, pulso suave cada 600 ms.
- **Ícono 16x16:** farol de mina con un poste. (hoy: glifo píxel `lantern+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es el único objeto fijo y cálido; las demás son cono, senda y anillo móvil.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Nodo de Aurelia y las Anclas de Iria (objetos puntuales): cristal frío y nodo con hilos; este es llama caliente en vidrio.

### Hab. 2 - Destello

- **Mecánica (código):** Cono (alcance 180 u, semiángulo 0,85 rad = 97° de boca): daña 110%, ralentiza 35% 1500 ms y aturde 450 ms a los no jefes. Costo 26, cooldown 7500 ms. *(`data/portadores.js:49`, `portadores.js:149`)*
- **Silueta y forma:** Haz de luz blanco-ámbar que se abre en abanico (como linterna con tapa abierta), con rayos finos radiales y estrellitas en los enemigos aturdidos.
- **Color dominante:** Blanco cálido `#ffe7a5` con borde ámbar.
- **Movimiento:** Sale de golpe y se ensancha con un parpadeo; los enemigos quedan "ciegos" con estrellitas girando 450 ms.
- **Anticipación:** Se abre la tapa del farol, 3 cuadros.
- **Impacto:** Haz y abanico de rayos, 3 cuadros.
- **Disipación:** La luz se enfría a ámbar y se apaga, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros
- **Tamaño sugerido del asset (px nativos):** 120x184 px (radio 180u, ancho de boca 270u, arco 97 grados; 1,5 u/px)
- **Loop:** Solo las estrellitas sobre los enemigos aturdidos (loop 3 cuadros).
- **Partículas / capas secundarias:** Destello blanco de pantalla mínimo, estrellitas.
- **Ícono 16x16:** estrella con chispa. (hoy: glifo píxel `star+spark`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única blanca y la única de corto instante con aturdimiento; el farol es persistente.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Purga de Vapor de Brasa y Nota discordante de Dáriel (conos): vapor blanco y notas; este es un haz de luz con rayos.

### Hab. 3 - Paso Seguro

- **Mecánica (código):** Senda de 250 u de largo y 84 u de ancho (radio 42 u) desde su posición hasta el punto elegido durante 4500 ms: reduce 15% el daño ambiental y limpia ralentizaciones a los aliados que la pisan. Costo 30, cooldown 10500 ms. *(`data/portadores.js:50`, `portadores.js:150-153,200-202`, premarcado: sin perfil propio (se lanza en dirección del puntero))*
- **Silueta y forma:** Una senda de losetas/tablones de mina con farolitos pequeños a ambos lados y huellas luminosas en el centro.
- **Color dominante:** Ámbar tenue `#e8c060` sobre pardo.
- **Movimiento:** Las losetas se encienden de a una desde sus pies hasta la punta (40 ms entre cada una) y quedan con un latido suave.
- **Anticipación:** Un farolito sale rodando y marca el camino, 3 cuadros.
- **Impacto:** La senda se ilumina de punta a punta, 4 cuadros.
- **Disipación:** Las losetas se apagan en reversa, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 168x56 px (250u x 84u; 1,5 u/px)
- **Loop:** Sí: la senda iluminada en loop de 6 cuadros (latido) durante 4500 ms.
- **Partículas / capas secundarias:** Motas de luz que corren por la senda.
- **Ícono 16x16:** bota con flecha. (hoy: glifo píxel `boots+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única plana y alargada con luz tenue; el destello es cono brillante.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Corriente de Resaca de Facu y Fractura de Aelith (líneas): río azul y grieta lila; esta es una senda de mina cálida.

### Definitiva - Vigilia

- **Mecánica (código):** Círculo móvil de luz de radio 190 u alrededor de él durante 7000 ms: cada 1300 ms da escudo (3,5% de vida) a los aliados dentro por 2200 ms; luz débil en 90 u. No da inmunidad. Sin costo, cooldown 35000 ms. *(`data/portadores.js:51`, `portadores.js:154,235`, luz `:216-222`)*
- **Silueta y forma:** Un anillo de 7 velas/faroles pequeños que orbita a 190 u de Tobías, uniendo sus llamas con un halo cálido en el suelo; en el centro una gran luz de farol sobre él; cada pulso, todas las llamas se alzan y lanzan una gota de luz hacia los aliados.
- **Color dominante:** Ámbar cálido `#ffe7a5` con llamas `#ff9a3c` y dorado `#e8c060`.
- **Movimiento:** Las velas giran despacio una vuelta por 7000 ms; cada 1300 ms las llamas crecen y salen gotas hacia los aliados.
- **Anticipación:** Pose de 650 ms: levanta el farol y las velas aparecen una a una, 6 cuadros.
- **Impacto:** 5 pulsos (7000 ms / 1300 ms): cada uno 3 cuadros de crecimiento de llamas.
- **Disipación:** Las velas se apagan en cadena, 6 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 5 + disipación 6 = 17 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 192x192 px (diámetro 380u = 2 x r 190u; 2 u/px)
- **Loop:** Sí: velas girando en loop de 8 cuadros durante 7000 ms.
- **Partículas / capas secundarias:** Gotas de luz hacia aliados, polillas, humo de velas apagadas.
- **Ícono 16x16:** vela con una cruz de cura. (hoy: glifo píxel `candle+plus`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con muchas fuentes de luz orbitando; el Farol es un único punto fijo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Santa Paciencia de Ynara y Nadie Queda Atrás de Garren (zonas móviles): santuario de luz blanca y anillo de cadenas; esta son velas ámbar en órbita.

### Pasiva - Seguir la Luz

- **Mecánica (código):** Los aliados a menos de 230 u que se mueven hacia el Farolero ganan 8% de velocidad (no acumula) (`data/portadores-lore.js:29`, `portadores.js:205-208`).
- **Arte:** Hilo de luz fino y ámbar entre un aliado y Tobías mientras el aliado se acerca (2 px, loop 4 cuadros), con un farolito de 8 px que parpadea sobre el aliado.
