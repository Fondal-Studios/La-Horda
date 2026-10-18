# Baltra, la Campana Hundida (`baltra`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Tanque frontal (rol tanque, resistencia y control). Tono: terco, solemne, de rescate; "mientras suene, seguí subiendo". Lenguaje: campana de bronce, badajo, cuerda, ondas de sonido bajo el agua.
- **Paleta sugerida:** verde-azulado frío `#8bb4bd` (color de clase, `expedition/catalog.js:19`), bronce `#b46c3c` y cobre `#cc9c54` (atlas), cuero `#6c3c24`, claro `#cfeef0`, contorno `#0f2326`, acento verdín oxidado `#6fae9a`.
- **Motivos visuales:** campana y badajo, cuerda, remaches, anillos de sonido (concéntricos con huecos), burbujas de aire, algas, pequeñas gotas.
- **NO debe parecerse a:** **Bront** (acero azul-grisáceo `#8aa4b8` y cristal: Baltra es BRONCE cálido con verdín); **Facu GM** (azul mar y espuma: aquí el agua es solo ambiente, el protagonista es el metal); **Dáriel** (notas musicales: el sonido de Baltra son anillos, no notas).
- **Estado actual del VFX (verificado en código):** Tema procedural `bell` (`themes.js:10`, forma `scallop`; su `a=#8bb4bd` es casi idéntico al de `crystal` de Bront `#8aa4b8`). `skill-fx-a/c/baltra.js`: hab. 1 y definitiva = nova centrada, hab. 2 = cono + aura, hab. 3 = cono. La guardia hoy se dibuja como un arco de ±60° y radio 27 u (`expedition/render.js:35`) y la vibración como puntos sobre la cabeza (`render.js:34`).
- **Fuentes del kit:** `js/champions/expedition/catalog.js:19-24` (stats y kit), `expedition/runtime.js:41-44` (lanzamiento), `:117` (guardia), `expedition/render.js:20-38`, premarcado `aim-targeting.js:68`.

## B. Habilidades

### Básico - Golpe de badajo

- **Mecánica (código):** Golpe cuerpo a cuerpo en arco; alcance 88 u, cooldown 620 ms (arma: badajo de salvamento). *(`expedition/catalog.js:19` (stats `[166,9,.20,137,88,620,false]`))*
- **Silueta y forma:** Semi-arco de golpe de 88 u con una onda de sonido en forma de media luna que sigue al impacto.
- **Color dominante:** Bronce `#b46c3c` y claro `#cfeef0`.
- **Movimiento:** El badajo describe un arco de arriba a abajo; la media luna se separa y avanza 20 u.
- **Anticipación:** El badajo se alza, 2 cuadros.
- **Impacto:** Impacto con onda de media luna, 3 cuadros.
- **Disipación:** La media luna se agranda y se rompe en 2 anillos finos.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros
- **Tamaño sugerido del asset (px nativos):** 64x88 px (radio 88u, ancho de boca 132u, arco 97 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Chispa de metal y 2 burbujas de aire.
- **Ícono 16x16:** badajo de campana golpeando. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Es un golpe corto en arco; las habilidades son anillos, escudo, abanico o campana colosal.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Golpe de Escudo de Tanque (Aldric) y el Martillazo de Brakk: Aldric es un arco azul de escudo, Brakk un arco con polvo; este deja la media luna de sonido bronce.

### Hab. 1 - Bronce vivo

- **Mecánica (código):** Onda circular centrada en ella, radio 125 u (tope 230 u); consume las cargas de vibración (máx. 5): +12% de daño por carga. Costo 26, cooldown 6000 ms. *(`catalog.js:24`, `runtime.js:41`)*
- **Silueta y forma:** Anillo de bronce macizo visto desde arriba con 5 muescas (una por carga posible) que se iluminan según las cargas consumidas; de él salen 1 a 3 ondas.
- **Color dominante:** Bronce `#b46c3c` y dorado apagado `#cc9c54`.
- **Movimiento:** El anillo nace pegado a ella y se expande en 5 cuadros; cada carga consumida añade una onda extra.
- **Anticipación:** Pose de 420 ms (`expedition/runtime.js:28`): la campana vibra; las muescas se encienden una a una según las cargas, 3 cuadros.
- **Impacto:** Anillo y ondas a r=125 u, 4 cuadros.
- **Disipación:** Las ondas se adelgazan y se apagan con burbujas, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros
- **Tamaño sugerido del asset (px nativos):** 168x168 px (diámetro 250u = 2 x r 125u; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Burbujas de aire que suben; destellos metálicos sobre las muescas.
- **Ícono 16x16:** campana vista desde arriba con anillo. (hoy: glifo píxel `bell+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única explosión circular alrededor del cuerpo y de color cálido; las demás son frontales o escudo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Pulso del Cristal de Bront: aquel es un pulso azul acero con cristal; este es bronce con muescas y ondas.

### Hab. 2 - Bajo la campana

- **Mecánica (código):** Guardia frontal de 25% de reducción de daño durante 3500 ms; velocidad -20% mientras dura. Alcance 90 u, radio 70 u (catálogo). Costo 26, cooldown 10000 ms. *(`catalog.js:24`, `runtime.js:42`, `:117`, premarcado `aim-targeting.js:68`)*
- **Silueta y forma:** Media cúpula de bronce (una campana cortada) que cubre 120° frente a ella, con una burbuja de aire azul pálido dentro y remaches visibles.
- **Color dominante:** Verdín-azulado `#8bb4bd` con bordes bronce.
- **Movimiento:** Baja desde arriba como una campana y se planta; vibra cuando recibe golpes (+1 ondita por impacto).
- **Anticipación:** La campana cae, 3 cuadros (~250 ms).
- **Impacto:** Se asienta con anillo de agua, 3 cuadros.
- **Disipación:** Se alza y se desvanece con burbujas, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 80x144 px (radio 120u, ancho de boca 208u, arco 120 grados; 1,5 u/px)
- **Loop:** Sí: cúpula en loop de 8 cuadros durante 3500 ms (con vibración).
- **Partículas / capas secundarias:** Ondas pequeñas al recibir golpes; burbujas internas.
- **Ícono 16x16:** media campana con un escudo. (hoy: glifo píxel `shield+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Única habilidad defensiva y frontal; la 1 y la definitiva son circulares, la 3 un abanico ofensivo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Custodia de Eslabón y Corteza prestada de Maura: aquellos protegen al aliado/envuelven en corteza; esta es una media campana de bronce frontal.

### Hab. 3 - Badajo de retorno

- **Mecánica (código):** Golpe en cono (alcance 180 u, semiángulo 0,85 rad = 97° de boca) que consume vibración (+12% por carga), daña y ralentiza 30% 1200 ms (jefes máx. 12%). Costo 28, cooldown 8500 ms. *(`catalog.js:24`, `runtime.js:43`, `expedition/runtime.js:6` (exCone), premarcado `aim-targeting.js:68`)*
- **Silueta y forma:** Abanico de ondas en V (4 arcos concéntricos cada vez más anchos) que sale de un golpe de badajo hacia adelante.
- **Color dominante:** Azul-verde frío `#cfeef0` con núcleo blanco.
- **Movimiento:** El badajo se recoge y devuelve el golpe: las 4 ondas se despliegan en secuencia (80 ms entre cada una).
- **Anticipación:** El badajo se recoge hacia atrás, 3 cuadros.
- **Impacto:** Golpe y ondas en abanico, 4 cuadros.
- **Disipación:** Las ondas se disuelven en burbujas; los ralentizados llevan un anillo de aire (loop 4 cuadros).
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros
- **Tamaño sugerido del asset (px nativos):** 120x184 px (radio 180u, ancho de boca 270u, arco 97 grados; 1,5 u/px)
- **Loop:** No; el anillo de ralentización sobre enemigos sí hace loop de 4 cuadros.
- **Partículas / capas secundarias:** Burbujas, chispas metálicas.
- **Ícono 16x16:** badajo golpeando con ondas en abanico. (hoy: glifo píxel `hammer+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es frente y frío (azul-verde); la 1 es cálida y circular.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Nota discordante de Dáriel (cono sonoro): aquel dibuja notas musicales ocre; este son arcos lisos azul-verdes sin ninguna nota.

### Definitiva - Que todos la escuchen

- **Mecánica (código):** Tres tañidos durante 2400 ms (uno cada 800 ms), radio 190 u (tope 230 u); el último empuja a comunes (no desplaza jefes); escudo 6% a aliados a ≤ r+60 u; ralentiza 30% 1500 ms. Sin costo, cooldown 37000 ms. *(`catalog.js:24`, `runtime.js:44`, `exPulse` `runtime.js:17`)*
- **Silueta y forma:** Una campana colosal de bronce (silueta de 150 u de alto) con algas y cadenas cuelga sobre ella y toca tres veces; cada tañido expulsa un anillo de agua distorsionada, el tercero con una cresta que empuja.
- **Color dominante:** Bronce `#b46c3c` con verdín `#6fae9a` y destellos `#cfeef0`.
- **Movimiento:** La campana baja oscilando, tañido 1 (anillo r=110 u), tañido 2 (r=150 u), tañido 3 (r=190 u con cresta); cada golpe sacude la imagen levemente.
- **Anticipación:** Pose de 650 ms: la campana desciende entre cadenas, 6 cuadros.
- **Impacto:** Tres tañidos de 4 cuadros cada uno con anillo creciente (12 cuadros), el último con cresta.
- **Disipación:** La campana se alza y se desvanece; los anillos mueren con burbujas, 6 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 12 + disipación 6 = 24 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 192x192 px (diámetro 380u = 2 x r 190u; 2 u/px)
- **Loop:** Sí: campana colgante en loop de 6 cuadros entre tañidos (balanceo).
- **Partículas / capas secundarias:** Distorsión de aguas (anillos con huecos), burbujas, sacudida de pantalla corta en cada tañido.
- **Ícono 16x16:** campana con tres rayas de sonido. (hoy: glifo píxel `horn+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Única con una figura colosal (campana) y tres tiempos nítidos; el resto de su kit no tiene figuras.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Santa Paciencia de Ynara y Vigilia del Farolero (zonas protectoras): aquellas son santuario de luz/farol; esta es una campana de bronce que golpea tres veces.

### Pasiva - Resonancia de rescate

- **Mecánica (código):** Recibir daño efectivo suma vibración (máx. 5, una cada 500 ms). El juego la muestra hoy como puntos "•" sobre la cabeza (`expedition/render.js:34`).
- **Arte:** Reemplazar los puntos por 5 anillitos de 6 px en arco sobre la cabeza que se encienden de a uno (bronce) y vibran al llenarse (loop 3 cuadros). Máximo legible a 1 px de contorno.
