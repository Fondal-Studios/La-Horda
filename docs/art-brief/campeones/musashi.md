# Musashi, el Rōnin del Bokken (`musashi`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Duelista (rol asesino, daño a un objetivo y ejecución; melee de velocidad). Tono: silencioso, disciplinado y letal; un camino sin señor. Lenguaje: tinta, pincel, ensō, bokken, luna roja.
- **Paleta sugerida:** azul tinta `#5aa8d8` (color de clase, `champions.js:142`) y claro `#bfe4ff`, azul noche `#2a4a68`, negro `#080c14`, blanco `#ffffff`, rojo sangre `#e04040` (tema `ink`, `themes.js:29`); duelo: carmesí `#7a1f1f`, madera `#241610`, farol `#ffa03c` (`musashi.js:205-250`). (Atlas: azules `#24243c`, rojos oscuros `#9c2424`.)
- **Motivos visuales:** trazo de pincel que se afina en las puntas, salpicadura de tinta, ensō (círculo de un solo trazo), bokken de madera, luna roja, torii, pétalos.
- **NO debe parecerse a:** **Kael** (rojo/gris con daga y trampas verdes); **Segador/Veyra** (sangre pesada); **Libertador** (azul patria con humo); **Aelith** (violeta). Lo de Musashi es TINTA monocroma azul-negra con un único acento rojo; no usa verde ni dorado.
- **Estado actual del VFX (verificado en código):** Tema procedural `ink` (`themes.js:29`, forma `spike`, motivos slash/petal/ink/spark). Ya tiene hojas de pose propias (`assets/sprites/champions/musashi/ronin1-4.png`, `ghost1-4.png`, `thousand1-4.png`, `basic1-5.png`, `ultiPortal.png`, `ultiFinish.png`) y el destello `musashiRoninImpact` (70 u). Las hojas de pose `ronin*`/`thousand*` incluyen el cuerpo del personaje con estelas curvas azul-blanco: el arte nuevo debe ir en una capa SEPARADA del cuerpo (ART_BIBLE s.7) y conservar esa dirección azul-blanco; la arena del duelo es 100% procedural (`musashi.js:205-251`: luna roja de radio 90 u, torii, plataforma de dojo de 405 u de lado, 4 faroles). `skill-fx-a/c/musashi.js` añade trazos de tinta y novas.
- **Fuentes del kit:** `js/data/champions.js:141-156`, `js/skills/abilities.js:390-540` (Rōnin, Paso Fantasma, Mil Cortes, Último Duelo), `js/champions/musashi.js:17-27,122-143,198-251`, premarcado `aim-targeting.js:34-35`.

## B. Habilidades

### Básico - Combo del Bokken

- **Mecánica (código):** Cadena muy rápida de golpes a un objetivo (5 poses de ataque); alcance 60 u, cooldown 260 ms; el tercero pega más fuerte. Combo se reinicia tras 1100 ms sin golpear. *(`champions.js:148`, `champion-identity.js:61`, `musashi.js:17-19`)*
- **Silueta y forma:** Arco de madera de 60 u con un filo blanco de movimiento: golpes alternados en tres ángulos; el tercero con un destello rojo.
- **Color dominante:** Blanco `#ffffff` sobre azul tinta `#5aa8d8`; 3º con acento `#e04040`.
- **Movimiento:** Golpes cortos y secos (80 ms cada uno); tercer golpe más largo con salpicadura de tinta.
- **Anticipación:** Guardia baja, 1 cuadro (sin telegrafiar para mantener la velocidad).
- **Impacto:** 3 arcos de 2 cuadros (6 cuadros).
- **Disipación:** Salpicadura de tinta que se seca, 3 cuadros.
- **Cuadros sugeridos:** anticipación 1 + impacto 6 + disipación 3 = 10 cuadros
- **Tamaño sugerido del asset (px nativos):** 40x56 px (radio 60u, ancho de boca 82u, arco 86 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Gotas de tinta en el 3º golpe.
- **Ícono 16x16:** bokken. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Arcos blancos muy rápidos; la 1 es un trazo largo y la 3 un círculo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a la Puñalada de Kael y las Hoces Gemelas de Ilkan: corte gris con gota y hoces ocres; este es madera blanca con tinta.

### Hab. 1 - Corte del Rōnin

- **Mecánica (código):** Avanza ~66 u (55% del alcance) y da un único corte fuerte al objetivo (alcance 120 u, daño 190%); en Duelo Perfecto (10 de Concentración) aparece un segundo corte 220 ms después. Costo 22, cooldown 3800 ms. *(`champions.js:151`, `abilities.js:390-414`, premarcado `aim-targeting.js:34`)*
- **Silueta y forma:** Una única pincelada horizontal de 120 u de largo, gruesa en el centro y afinada en ambos extremos, con salpicadura de tinta; el destello de impacto es un trazo en cruz.
- **Color dominante:** Negro azulado `#080c14` sobre blanco: tinta `#2a4a68` con destello blanco.
- **Movimiento:** El trazo se dibuja de izquierda a derecha en 100 ms y se quiebra al terminar; el segundo corte (si aparece) es el mismo trazo en negativo y más fino.
- **Anticipación:** Se agacha y desenvaina el bokken, 2 cuadros (~180 ms; ya existe `ronin1..4.png`).
- **Impacto:** Pincelada completa + destello `musashiRoninImpact` de 70 u, 3 cuadros.
- **Disipación:** La tinta gotea y se seca, 4 cuadros.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 4 = 9 cuadros
- **Tamaño sugerido del asset (px nativos):** 80x24 px (120u x 36u; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Gotas de tinta, un pétalo.
- **Ícono 16x16:** espada con una flecha. (hoy: glifo píxel `sword+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única pincelada horizontal única; la 2 son siluetas fantasma, la 3 un círculo de muchos cortes.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Corte Sangrante de Kael y Bayoneta del Libertador (tajo/estocada a un objetivo): tajo rojo con goteo y estocada de acero; este es un trazo de tinta de pincel.

### Hab. 2 - Paso Fantasma

- **Mecánica (código):** Atraviesa al objetivo (alcance 190 u) y aparece 40 u detrás; invulnerable 220 ms; su siguiente básico tiene crítico garantizado 3200 ms. Si se activa justo antes de un golpe (ventana de 220 ms), es Paso Perfecto: invulnerable 340 ms, +3 Concentración. Costo 20, cooldown 5500 ms. *(`champions.js:152`, `abilities.js:422-460`, `musashi.js:18`, premarcado `aim-targeting.js:35`)*
- **Silueta y forma:** Dos siluetas fantasma azul pálido (post-imágenes) que se estiran en una línea entre el origen y el destino, con un trazo de tinta que se disuelve; en el Paso Perfecto, un anillo blanco de 44 u.
- **Color dominante:** Azul pálido translúcido `#bfe4ff`.
- **Movimiento:** Desaparece en una línea de tinta horizontal y reaparece detrás con un tirón; las siluetas se desvanecen en 300 ms.
- **Anticipación:** Se difumina en una silueta, 2 cuadros.
- **Impacto:** Aparece a espaldas con la silueta residual, 3 cuadros.
- **Disipación:** La silueta se disuelve en tinta, 4 cuadros; un crítico preparado deja un destello azul en el bokken (loop 3 cuadros, 3200 ms).
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 4 = 9 cuadros (+ 3 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** trayecto hasta 190x50 u -> 128x32 px + silueta 40x64 u -> 32x40 px (x2) + anillo de Paso Perfecto Ø64 px
- **Loop:** Solo el brillo del bokken preparado (loop 3 cuadros, 3200 ms).
- **Partículas / capas secundarias:** Línea de tinta, pétalos; el Paso Perfecto añade el anillo y un sonido.
- **Ícono 16x16:** fantasma con flecha. (hoy: glifo píxel `ghost+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única translúcida y de dos siluetas; las otras son tinta negra.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Teletransporte de Axiom y Paso Luminal de Aurelia (desplazamientos): pixelado azul y bandas doradas; este son siluetas fantasma de tinta.

### Hab. 3 - Mil Cortes

- **Mecánica (código):** Ráfaga de 14 cortes a los enemigos a ≤150 u (daño 24% c/u), que prioriza a su objetivo de duelo (cuantos menos enemigos hay, más cortes recibe cada uno); anillo de giro de 135 u. Costo 34, cooldown 8000 ms. *(`champions.js:153`, `abilities.js:463-503`)*
- **Silueta y forma:** Ensō: un círculo de pincel de un solo trazo (r=135 u) rodeando a Musashi, atravesado por ~14 trazos finos que parten de él en todas direcciones; chispas blancas.
- **Color dominante:** Blanco `#ffffff` y azul claro `#bfe4ff` sobre fondo azul noche.
- **Movimiento:** Los 14 trazos se disparan en 380 ms en secuencia circular y el ensō se cierra al final; cada corte deja un tic de impacto en su objetivo.
- **Anticipación:** Gira en guardia (hojas `thousand1..4.png`), 3 cuadros.
- **Impacto:** Ráfaga de cortes y cierre del ensō, 6 cuadros.
- **Disipación:** Los trazos se disuelven en pétalos, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 6 + disipación 4 = 13 cuadros
- **Tamaño sugerido del asset (px nativos):** 184x184 px (diámetro 270u = 2 x r 135u; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Pétalos de cerezo, gotas de tinta.
- **Ícono 16x16:** cortes cruzados. (hoy: glifo píxel `slashes`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única en forma de círculo/ensō con muchos trazos; el Rōnin es un solo trazo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Danza del Augurio de la Profeta y Torbellino de Aldric (giros): giro de hoja y torbellino con escudo; este es un ensō con 14 cortes finos.

### Definitiva - Último Duelo

- **Mecánica (código):** Lo transporta con su objetivo de duelo a una arena privada de radio 150 u: 1 contra 1 hasta que uno caiga o se acaben 13000 ms; +25% velocidad, +35% velocidad de ataque, +25% daño, +15% crítico, Paso Fantasma con recarga x0,4. Empieza con 10 de Concentración. Sin costo, cooldown 28000 ms. *(`champions.js:155`, `abilities.js:506-535`, `musashi.js:122-143,198-251`)*
- **Silueta y forma:** Un portal rojo con un torii se abre sobre los duelistas y los lleva a un dojo en la noche: luna roja de 90 u, torii lejanos, plataforma de madera de 405 u de lado con borde rojo pulsante y cuatro faroles; el mundo fuera del ruedo queda negro. El cierre es un único corte que parte la luna.
- **Color dominante:** Carmesí `#7a1f1f` y negro `#0a0508`, madera `#241610`, faroles `#ffa03c`, blanco de tinta.
- **Movimiento:** El portal se abre (ya existe `ultiPortal.png`: torii rojo, luz carmesí y una silueta blanca), los duelistas aparecen enfrentados a 140 u; la luna late; el golpe final (`ultiFinish.png`: luna roja con la silueta del rōnin y salpicadura) corta en diagonal el cuadro.
- **Anticipación:** Portal con torii, 8 cuadros (~700 ms).
- **Impacto:** Arena sostenida, 6 cuadros; golpe final, 8 cuadros.
- **Disipación:** La arena se pliega como un papel y vuelven al campo, 8 cuadros.
- **Cuadros sugeridos:** anticipación 8 + impacto 14 + disipación 8 = 30 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** plataforma 405x405 u -> 208x208 px (2 u/px) + luna Ø180 u -> 120x120 px + portal 130 u de ancho -> 88x88 px + torii 90x120 u -> 64x80 px
- **Loop:** Sí: arena (luna latiendo, faroles titilando) en loop de 6 cuadros durante 13000 ms.
- **Partículas / capas secundarias:** Pétalos que caen, viñeta oscura (ya existe en el motor), banner "¡ÚLTIMO DUELO!".
- **Ícono 16x16:** dos espadas con una chispa. (hoy: glifo píxel `swords+spark`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que cambia el escenario completo (dojo rojo y negro); las otras cuatro suceden sobre la arena normal.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Force Quit de Axiom y Cruce de los Andes del Libertador (definitivas que reemplazan el escenario): negativo de pantalla y paisaje nevado; este es un dojo rojo bajo luna con tinta.

### Pasiva - Marca de Duelo / Concentración

- **Mecánica (código):** Marca a un rival de duelo y acumula Concentración (0-10) al golpearlo; con 10 entra en Duelo Perfecto (segundos cortes y bonus) (`musashi.js:17,35-40`, `abilities.js:390-421`).
- **Arte:** Sobre el rival marcado: un círculo ensō pequeño (24 px) que se completa con la Concentración (10 muescas); al llegar a 10 se cierra en rojo `#e04040`. No se verificó cómo se dibuja la Marca hoy: confirmar antes de rediseñar.
