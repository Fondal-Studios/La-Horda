# Brasa, la Última Maquinista (`brasa`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Ingeniera de posición (rol mago, torretas, presión y vapor, a distancia). Tono: práctico, cansado y obstinado; escapó de la Fábrica con los planos y una llave inglesa. Lenguaje: latón, caldera, manómetro, silbato, vapor.
- **Paleta sugerida:** latón `#c58543` y brillo `#ffd28a` (color y glow de clase, `data/portadores.js:21`), rojo de caldera `#b43c24` y `#842424` (atlas), vapor `#fff4dc`, hierro `#3c2424`, contorno `#2a1608`.
- **Motivos visuales:** engranajes gruesos de pocos dientes, válvulas, tuberías con codo, manómetro de aguja, remaches, nubes de vapor con perlas de condensación, sirena giratoria.
- **NO debe parecerse a:** **Brakk** (también torretas: Brakk es hierro oscuro cuadrado con clavos y fogonazo naranja; Brasa es latón redondo con chimenea y vapor); **Zahra** (válvulas y calor de horno, segunda mitad); **Farolero/Aurelia/Dáriel** (dorados: el latón de Brasa es naranja-rojizo con vapor blanco); **Morwen** (frascos de vidrio).
- **Estado actual del VFX (verificado en código):** Tema procedural `steam` (`themes.js:11`, forma `gear`, motivos gear/steam/rivet/spark). `skill-fx-a/c/brasa.js`: torreta = estallido + nova, Purga = cono, Desmontaje = aura + estallido, definitiva = nova r=120 + nova por torreta. Firma de partículas: engranaje `#ffcb78` (`skills/champion-signatures.js:9`).
- **Fuentes del kit:** `js/data/portadores.js:21-28` (stats y kit), `js/champions/portadores.js:57-61` (torreta), `:94-109` (lanzamiento), `:210-214` (pasiva), `:239-` (objetos), `skill-fx-a/c/brasa.js`.

## B. Habilidades

### Básico - Remachadora

- **Mecánica (código):** Disparo a distancia; alcance 310 u, cooldown 580 ms (arma: Remachadora). *(`data/portadores.js:21` (`range:310, basic:580, ranged:true`))*
- **Silueta y forma:** Remache grande de cabeza redonda (10x10 u) que gira como una tuerca; deja chispas de metal.
- **Color dominante:** Latón dorado `#e0a050`.
- **Movimiento:** Vuelo recto con giro rápido; la cabeza deja una línea de vapor de 1 px.
- **Anticipación:** Fogonazo corto en la boca de la remachadora, 2 cuadros.
- **Impacto:** Clavado del remache con anillo de chispas, 3 cuadros.
- **Disipación:** El remache queda un instante clavado y se desvanece con un hilo de vapor.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 24x24 px (36u x 36u; 1,5 u/px)
- **Loop:** Proyectil en loop de 4 cuadros.
- **Partículas / capas secundarias:** Chispas naranjas, hilo de vapor.
- **Ícono 16x16:** remache/tuerca con una chispa. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Pequeño y metálico; sus habilidades son torreta, nube, desarme y sirena.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Segundo robado de Aelith y el Paquete de Axiom: orbes de color; este es un objeto de metal con giro, color latón.

### Hab. 1 - Centinela de Latón

- **Mecánica (código):** Monta una torreta fija con vida propia (45% de su vida máxima) en un punto (alcance 190 u); dura 15000 ms, 500 ms de armado, dispara cada 850 ms a ≤320 u; máximo 2 (la tercera retira la más antigua). Costo 34, cooldown 8500 ms. *(`data/portadores.js:24`, `portadores.js:57-61,94,239-`)*
- **Silueta y forma:** Torreta de latón redonda: base ancha, cúpula con ventanilla y manómetro, chimenea fina que echa humo; el cañón apunta al objetivo.
- **Color dominante:** Latón `#c58543` con vapor blanco.
- **Movimiento:** Se arma con un resoplido de vapor; el cañón gira; cada disparo expulsa una bocanada de vapor.
- **Anticipación:** Armado de 500 ms real (`portadores.js:60`): 4 cuadros de ensamblado con chispas.
- **Impacto:** Disparo: remache + bocanada, 3 cuadros (cada 850 ms).
- **Disipación:** Destruida o vencida: se desinfla en vapor y engranajes sueltos, 5 cuadros.
- **Cuadros sugeridos:** anticipación 4 + impacto 3 + disipación 5 = 12 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 48x48 px (64u x 72u; 1,5 u/px)
- **Loop:** Sí: torreta en reposo en loop de 6 cuadros (humo de chimenea y aguja del manómetro).
- **Partículas / capas secundarias:** Humo, engranaje que gira en la espalda, aguja del manómetro.
- **Ícono 16x16:** torreta redonda con chimenea. (hoy: glifo píxel `turret+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única pieza redonda y fija; la 2 es un cono de nube, la 3 un movimiento, la definitiva una luz roja.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Torreta de clavos de Brakk y Torre de Yogur de Myla: Brakk = hierro cuadrado con clavos; Myla = yogur rosado; esta es latón con chimenea y vapor.

### Hab. 2 - Purga de Vapor

- **Mecánica (código):** Cono de vapor (alcance 170 u, semiángulo 0,85 rad = 97° de boca): daño 165% (+12% por punto de Presión; cada lanzamiento suma 1, máx. 3, y el de la propia Purga ya cuenta), empuja 55 u a los comunes y ralentiza 35% durante 1200 ms. Costo 28, cooldown 6500 ms. *(`data/portadores.js:25`, `portadores.js:95-100`)*
- **Silueta y forma:** Nube densa de vapor en forma de cuña, con "perlas" de condensación y dos válvulas laterales de las que sale el chorro.
- **Color dominante:** Blanco vapor `#fff4dc` con borde latón `#ffd28a`.
- **Movimiento:** El chorro sale a presión y la nube avanza 170 u en 5 cuadros, enrollándose en las puntas; la Presión acumulada engrosa la nube (3 niveles).
- **Anticipación:** Se oye el silbato: manómetro al máximo y válvulas tiemblan, 3 cuadros.
- **Impacto:** Chorro y cuña de vapor, 5 cuadros.
- **Disipación:** La nube se separa en bocanadas y sube, 5 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 5 + disipación 5 = 13 cuadros
- **Tamaño sugerido del asset (px nativos):** 120x176 px (radio 170u, ancho de boca 255u, arco 97 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Gotas de condensación, remaches sueltos.
- **Ícono 16x16:** nube de vapor con un anillo. (hoy: glifo píxel `cloud+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Única nube blanca y única que se pone más gruesa con la Presión.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Destello de Farolero y Sal de Ruptura de Morwen (conos): destello de luz y catalizador de vidrio; este es vapor blanco denso.

### Hab. 3 - Desmontaje Rápido

- **Mecánica (código):** Retira la torreta más cercana (recupera hasta 3500 ms de la recarga de Centinela) y gana +25% velocidad durante 2200 ms; sin torreta también acelera. Costo 18, cooldown 7500 ms. *(`data/portadores.js:26`, `portadores.js:101-105`)*
- **Silueta y forma:** La torreta se pliega en una caja de piezas que sale volando hacia su mochila; Brasa deja una estela de engranajes y líneas de velocidad.
- **Color dominante:** Latón `#e0a050` con líneas blancas.
- **Movimiento:** La llave inglesa gira y desarma en 200 ms; las piezas viajan en arco hasta ella; los engranajes de la estela giran 2200 ms.
- **Anticipación:** La llave inglesa gira sobre la torreta, 3 cuadros.
- **Impacto:** Torreta se pliega y vuela, 4 cuadros.
- **Disipación:** Las piezas entran en la mochila con un "clac"; la estela decae en 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** torreta Ø64 px + estela de pies 64x48 px (loop)
- **Loop:** Sí: estela de engranajes en pies, loop de 6 cuadros durante 2200 ms.
- **Partículas / capas secundarias:** Engranajes sueltos, líneas de velocidad.
- **Ícono 16x16:** llave inglesa con una X. (hoy: glifo píxel `wrench+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que ocurre sobre su propia torreta y deja estela; las otras apuntan a enemigos.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Paso Seguro de Farolero y Salida de Ynara (movimiento): senda de luz y cortina de agua; esta es una caja que vuela y engranajes.

### Definitiva - Turno de Emergencia

- **Mecánica (código):** Sobrecarga sus torretas 8000 ms (disparo cada 460 ms y +daño); si no tiene ninguna monta una temporal a 35 u; al terminar las torretas se enfrían 2000 ms. Sin costo, cooldown 34000 ms. No tiene área propia. *(`data/portadores.js:27`, `portadores.js:106-109`; fin del sobrecalentamiento `portadores.js:233`)*
- **Silueta y forma:** Sirena giratoria de fábrica sobre cada torreta y sobre Brasa que barre conos de luz roja por el suelo; las torretas se ponen al rojo, tuberías de vapor las conectan con ella.
- **Color dominante:** Rojo caldera `#b43c24` con naranja `#ff6a3d` y destellos `#ffd28a`.
- **Movimiento:** Un anillo de presión sale de Brasa por las tuberías hasta cada torreta; las sirenas giran 8000 ms; al final todas ventean un chorro de vapor.
- **Anticipación:** Alarma de 650 ms: la sirena se enciende y la luz roja barre, 6 cuadros.
- **Impacto:** Las torretas se sobrecargan con onda de calor (6 cuadros).
- **Disipación:** Enfriamiento de 2000 ms: ventean vapor y se apagan, 8 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 6 + disipación 8 = 20 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** sirena 40x56 px + aura de torreta Ø96 px + anillo de conexión hasta 400 px
- **Loop:** Sí: sirenas y torretas incandescentes en loop de 6 cuadros durante 8000 ms.
- **Partículas / capas secundarias:** Distorsión de calor, luz roja proyectada en el suelo, sacudida corta al encenderse.
- **Ícono 16x16:** sirena roja con un anillo. (hoy: glifo píxel `siren+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única roja del kit y la única que altera a sus objetos (las torretas); sin círculo de daño propio.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Vigilia del Farolero y Santa Paciencia de Ynara (definitivas con aura móvil): aquellas son círculos de luz; la de Brasa es una sirena roja y objetos incandescentes, sin círculo central.

### Pasiva - Presión

- **Mecánica (código):** Cada habilidad lanzada suma 1 de Presión (máx. 3, `portadores.js:84`); Purga la consume (+12% por punto) y con 3 el siguiente básico suelta un cono de 120 u (30% extra) y +35% de daño (`portadores.js:210-214`; texto `js/data/portadores-lore.js:26`).
- **Arte:** No se verificó un indicador visible. Sugerencia: 3 luces pequeñas en el manómetro del arma que se encienden con cada lanzamiento (rojo/ámbar).
