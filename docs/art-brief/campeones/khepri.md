# Khepri, el Portador del Enjambre (`khepri`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Asesino de enjambre (rol asesino, melee; el enjambre es visible y potencia sus habilidades). Tono: ritual, sobrio y hambriento; sacerdote de tumbas, lo único que la Horda no corrompió. Lenguaje: escarabajo, élitro, hoz, disco solar eclipsado.
- **Paleta sugerida:** esmeralda `#3fae8a` (color de clase, `ascension/catalog.js:55`), lima `#c8f27a` (glow), verde profundo `#1f6a50` y `#0c543c` (atlas), oro ritual `#ffd24a`, naranja de élitro `#e48424` (atlas), negro verdoso `#0a1a12`.
- **Motivos visuales:** escarabajo con élitros abiertos, hoces curvas, disco solar opaco con corona, enjambre en nube, caparazón segmentado iridiscente, jeroglíficos mínimos.
- **NO debe parecerse a:** **Morveth** (verde enfermizo con púrpura y hongos); **Maura/Sylva** (verde vegetal y hojas); **Axiom** (turquesa digital); **Ilkan** (ocre y dorado de desierto). Khepri es verde IRIDISCENTE (esmeralda a lima con destellos naranja) hecho de insectos, nunca de plantas.
- **Estado actual del VFX (verificado en código):** Tema procedural `scarab` (`themes.js:22`, forma `petal`, motivos beetle/wing/spark/spore). `skill-fx-a/c/khepri.js`: Enjambre = haz + nova en el destino, Caparazón = aura, Élitros = trazo 44 u, definitiva = nova en sí mismo; el eclipse tiene `SFA_OBJ.as_eclipse`. El render del Regente dibuja élitros procedurales (`ascension/render.js:24-40`).
- **Fuentes del kit:** `js/champions/ascension/catalog.js:55-66`, lanzamiento `ascension/runtime.js:127-130`, objetos `:216-221`, daño recibido `:284`, estado `:15`, premarcado `js/skills/aim-targeting.js:56`, proyectil `ascension/register.js:10`.

## B. Habilidades

### Básico - Hoz de élitro

- **Mecánica (código):** Golpe cuerpo a cuerpo (proyectil `scarab` de corto alcance); alcance 78 u, cooldown 440 ms (arma: Hoces de Élitro). *(`ascension/catalog.js:55` (`stats [106,11,.08,182,78,440,false]`), `register.js:10`)*
- **Silueta y forma:** Arco de hoz curva (78 u) del que se desprenden 2-3 escarabajos pequeños que siguen el golpe.
- **Color dominante:** Esmeralda `#3fae8a` con filo lima.
- **Movimiento:** El arco barre y los escarabajos vuelan un instante tras él.
- **Anticipación:** Hoces cruzadas, 2 cuadros.
- **Impacto:** Corte y escarabajos, 3 cuadros.
- **Disipación:** Los escarabajos regresan a él y se esfuman.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros
- **Tamaño sugerido del asset (px nativos):** 56x80 px (radio 78u, ancho de boca 117u, arco 97 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** 2-3 escarabajos de 6x6 u.
- **Ícono 16x16:** hoz con escarabajo. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Arco rápido con escarabajos pequeños; las habilidades son nube, caparazón, dash y eclipse.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Hoces Gemelas de Ilkan: arcos ocres de arena; estos son verdes con insectos.

### Hab. 1 - Enjambre

- **Mecánica (código):** Envía el enjambre al punto elegido (alcance 320 u, radio 85 u): viaja a 420 u/s, se queda envolviendo a los enemigos y vuelve a 500 u/s tras ~3700 ms en total; daña cada 300 ms (el multiplicador de daño va de x0,25 con 0 escarabajos a x0,75 con 60). Costo 24, cooldown 6000 ms. *(`catalog.js:63`, `runtime.js:127,216-220`, premarcado `aim-targeting.js:56`)*
- **Silueta y forma:** Una nube densa de 20 a 60 escarabajos (6x6 u) que viaja como una bandada y se asienta en un disco de 85 u con los insectos arremolinándose.
- **Color dominante:** Verde iridiscente `#3fae8a` con destellos lima y naranja.
- **Movimiento:** Sale en bandada compacta, se abre al llegar y gira como remolino; al volver se recoge en un hilo de bichos hacia él.
- **Anticipación:** Los élitros se abren y los escarabajos se levantan de su espalda, 4 cuadros.
- **Impacto:** La nube cae sobre el punto y se asienta, 4 cuadros.
- **Disipación:** El enjambre vuelve en hilera y se funde con él, 5 cuadros.
- **Cuadros sugeridos:** anticipación 4 + impacto 4 + disipación 5 = 13 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 120x120 px (diámetro 170u = 2 x r 85u; 1,5 u/px)
- **Loop:** Sí: nube asentada en loop de 8 cuadros mientras envuelve (~3000 ms).
- **Partículas / capas secundarias:** Escarabajos sueltos con trayectoria propia (partículas), polvo verde; la densidad escala con el nº de escarabajos (3 niveles de relleno: 20/40/60).
- **Ícono 16x16:** enjambre con una flecha. (hoy: glifo píxel `swarm+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única nube de muchos individuos que viaja y vuelve; la 2 es una armadura, la 3 un dash, la 4 un eclipse.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Hongos de Morveth y Pozo Gravitatorio de Vhal (zonas persistentes): hongos púrpuras y un pozo estelar; esta es una bandada de insectos que se mueve.

### Hab. 2 - Caparazón Vivo

- **Mecánica (código):** Los escarabajos forman una armadura: consume hasta 15 del enjambre y da escudo de 3% + 0,6% por escarabajo (máx. 14%) durante 4000 ms. Costo 22, cooldown 9000 ms. *(`catalog.js:64`, `runtime.js:128`)*
- **Silueta y forma:** Armadura de placas segmentadas, cada una un escarabajo con el élitro cerrado, que cubre hombros, pecho y espalda con brillo iridiscente (hexagonal y solapado).
- **Color dominante:** Verde esmeralda `#1f6a50` a lima `#c8f27a` con reflejos naranja.
- **Movimiento:** Los escarabajos suben por su cuerpo y se alinean; al recibir daño una placa se levanta un instante y vuelve.
- **Anticipación:** Los bichos suben por las piernas, 4 cuadros.
- **Impacto:** Se cierran las placas con un clac, 3 cuadros.
- **Disipación:** Las placas se abren y los escarabajos escapan en todas direcciones, 5 cuadros.
- **Cuadros sugeridos:** anticipación 4 + impacto 3 + disipación 5 = 12 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 64x80 px (96u x 112u; 1,5 u/px)
- **Loop:** Sí: armadura en loop de 8 cuadros durante 4000 ms (brillo que recorre las placas).
- **Partículas / capas secundarias:** Destello al absorber golpes, 3 escarabajos sueltos al aparecer.
- **Ícono 16x16:** escarabajo con una flecha arriba. (hoy: glifo píxel `beetle+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que se pega al cuerpo como armadura de insectos; el eclipse es un campo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Corteza prestada de Maura y Piel de Duna de Ilkan (envolturas): corteza vegetal y arena; esta son insectos iridiscentes.

### Hab. 3 - Vuelo de Élitros

- **Mecánica (código):** Salto rasante de hasta 220 u en la dirección elegida; los escarabajos muerden todo lo que cruza (colisión ≤40 u del trazo, daño 190% x (1 + escarabajos/120)). Costo 24, cooldown 7200 ms. *(`catalog.js:65`, `runtime.js:129`, premarcado `aim-targeting.js:56`)*
- **Silueta y forma:** Khepri abre dos élitros enormes (alas de escarabajo, 70 u de envergadura) y vuela a ras del suelo; tras él queda una estela de escarabajos que muerden, de 80 u de ancho.
- **Color dominante:** Lima `#c8f27a` y naranja `#e48424` en las alas.
- **Movimiento:** Las alas se despliegan, aleteo rápido y un trazo largo recto; la estela se deshilacha.
- **Anticipación:** Alas se abren, 3 cuadros.
- **Impacto:** Vuelo y mordiscos a lo largo del trazo, 4 cuadros.
- **Disipación:** La estela se dispersa en bichos, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros
- **Tamaño sugerido del asset (px nativos):** 152x56 px (220u x 80u; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Escarabajos que se desprenden y muerden, polvo bajo el trazo.
- **Ícono 16x16:** alas de escarabajo con flecha. (hoy: glifo píxel `wings+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con alas abiertas y movimiento rasante; las demás no mueven a Khepri.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Paso Luminal de Aurelia y Cabalgar la Ola de Facu (desplazamientos): bandas de luz y cresta de agua; este es un vuelo de alas de insecto.

### Definitiva - Eclipse de Escarabajos

- **Mecánica (código):** Se descompone en enjambre y cubre una región de radio 210 u siguiéndolo durante 6000 ms: daña cada 400 ms (60% + hasta 100% según el enjambre) y recibe -60% de daño; al terminar el enjambre queda lleno (60). Sin costo, cooldown 38000 ms. *(`catalog.js:66`, `runtime.js:130,221,284`)*
- **Silueta y forma:** Un disco solar opaco (negro con corona dorada) se alza sobre la zona como un eclipse; debajo, un huracán de miles de escarabajos gira alrededor de Khepri, que desaparece en el centro; el suelo queda sumido en sombra verde.
- **Color dominante:** Negro verdoso `#0a1a12`, corona dorada `#ffd24a`, enjambre esmeralda y lima.
- **Movimiento:** El disco sube y se centra; el enjambre gira en espiral horaria a velocidad creciente; la corona pulsa cada 400 ms con el daño; el final es una explosión de escarabajos hacia afuera.
- **Anticipación:** Pose de 700 ms: se descompone en bichos y el cielo se oscurece, 8 cuadros.
- **Impacto:** Eclipse completo, 6 cuadros; pulsos cada 400 ms.
- **Disipación:** El disco se parte en 3 y los escarabajos explotan hacia afuera, 8 cuadros.
- **Cuadros sugeridos:** anticipación 8 + impacto 6 + disipación 8 = 22 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 216x216 px (diámetro 420u = 2 x r 210u; 2 u/px)
- **Loop:** Sí: disco solar y huracán en loop de 8 cuadros durante 6000 ms.
- **Partículas / capas secundarias:** Sombra proyectada en el suelo, mil escarabajos como partículas, sacudida suave al comienzo y al final.
- **Ícono 16x16:** eclipse con un anillo. (hoy: glifo píxel `eclipse+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con disco solar y un campo oscuro enorme; la 1 es una nube que se mueve y no oscurece el suelo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Colapso de Vhal y la Hora imposible de Aelith (campos grandes): estrella y reloj; esta es un eclipse de insectos.

### Pasiva - Carroñeros

- **Mecánica (código):** Cada enemigo que muere cerca alimenta el enjambre (máx. 60 escarabajos; empieza en 20); es visible y potencia sus habilidades (`ascension/catalog.js:55-62`, `runtime.js:15`).
- **Arte:** Escarabajos orbitando a su alrededor en 3 niveles de densidad (20 / 40 / 60) con loop de 8 cuadros; cada baja cercana lanza un bicho que entra a su espalda (3 cuadros).
