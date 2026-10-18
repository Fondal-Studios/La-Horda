# Brakk, el Arquitecto del Fin (`brakk`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Tanque constructor (rol tanque, resistencia y control). Tono: pragmático y terco; cada torre compra segundos, cada muro guarda una salida. Lenguaje: ladrillo, clavo, viga, soldadura, escombro.
- **Paleta sugerida:** arena `#cead7a` (color de clase, `quality-five/register.js:56`), tierra `#6d5636`, claro `#f0dcae`, hierro `#504637`, naranja de fragua `#ff8a3c` (solo chispas), contorno `#1b140c`. (Atlas medido: marrones `#6c3c24`, grises `#9c8484`.)
- **Motivos visuales:** ladrillos con juntas desfasadas, clavos, vigas cruzadas, andamio, chispas de soldadura, polvo y escombro, bola de demolición.
- **NO debe parecerse a:** **Bront** (acero azul y cristal celeste, placas): Brakk es marrón-tierra y madera, sin azul; **Eslabón** (gris acero y cadenas); **Brasa** (latón con vapor); **Libertador** (azul y pólvora).
- **Estado actual del VFX (verificado en código):** Tema procedural `siege` (`themes.js:10`, forma `square`). Muro y torreta tienen props propios (`skill-fx-a/props.js:15-58`: muro 130x28 u de ladrillos, torreta de 28 px escalada x2,3); base/golpe usan nova genérica (`skill-fx-a/c/brakk.js`).
- **Fuentes del kit:** `js/champions/quality-five/brakk.js` (kit :4-7, lanzamiento :17-46, objetos :49-75, premarcado :94, dibujo base :95-100), clase y pasiva `quality-five/register.js:56`.

## B. Habilidades

### Básico - Martillazo de obra

- **Mecánica (código):** Golpe en arco frente a él, alcance 75 u, cooldown 650 ms; máximo 12 víctimas por golpe; los muros propios lo protegen. *(`quality-five/register.js:56`, `brakk.js:98-100`, `champion-identity.js:199-202`)*
- **Silueta y forma:** Arco de martillo (75 u) con polvo de ladrillo levantado; la cabeza del martillo deja un rectángulo de impacto.
- **Color dominante:** Arena `#cead7a` y gris `#9c8484`.
- **Movimiento:** Golpe pesado de arriba hacia abajo, con un rebote corto.
- **Anticipación:** Martillo se eleva, 2 cuadros.
- **Impacto:** Impacto con una nube de polvo en abanico, 3 cuadros.
- **Disipación:** Polvo y 3 trocitos de ladrillo que caen.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros
- **Tamaño sugerido del asset (px nativos):** 56x80 px (radio 75u, ancho de boca 113u, arco 97 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Polvo de ladrillo, chispas naranjas.
- **Ícono 16x16:** martillo con una chispa. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Arco seco con polvo; el resto son estructuras, soldadura y demolición.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Golpe de Badajo de Baltra y el Golpe de Escudo de Aldric: ellos dejan onda de sonido o brillo azul; Brakk deja polvo y ladrillo.

### Hab. 1 - Muro de asedio

- **Mecánica (código):** Levanta un muro destructible de 130 u de largo (perpendicular a la mira) en un punto (alcance 180 u, tope 240 u); daña a los enemigos en radio 65 u al aparecer, bloquea a los enemigos 4500 ms; vida 22% de la suya; máximo 2. Costo 28, cooldown 8500 ms. *(`brakk.js:4,24-29,94,98`; muro dibujado 18 u `brakk.js:97`)*
- **Silueta y forma:** Pared de ladrillo de 130x28 u con juntas desfasadas, almenas rotas y 2 clavos; sube del suelo en 3 etapas y muestra grietas al perder vida.
- **Color dominante:** Arena oscura `#9a7a4e` y arena `#cead7a` (junta de mortero `#6d5636`).
- **Movimiento:** Surge del suelo con sacudida (260 ms); polvo a los lados.
- **Anticipación:** Sombra rectangular en el suelo que se agranda, 3 cuadros.
- **Impacto:** Muro sube y golpea con onda de 65 u, 3 cuadros.
- **Disipación:** Al caer (por vida o tiempo): se desmorona en ladrillos, 5 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 5 = 11 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 88x32 px (130u x 40u; 1,5 u/px)
- **Loop:** Sí: muro en pie con 2 variantes de grieta (loop de 6 cuadros con parpadeo de polvo); aparición y derrumbe de una pasada. Estallido de aparición aparte de Ø88 px.
- **Partículas / capas secundarias:** Polvo, ladrillos sueltos, grietas progresivas (3 niveles de daño).
- **Ícono 16x16:** pared de ladrillos con una grieta. (hoy: glifo píxel `wall+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única pieza rectangular y sólida; la torreta es de metal con luz naranja, la 3 un halo, la definitiva una bola de demolición.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Muro de Placas de Bront y Muro de Fuego de Mago: placas azules de acero y anillo de llamas; el de Brakk es ladrillo marrón recto.

### Hab. 2 - Torreta de clavos

- **Mecánica (código):** Construye una torreta destructible (base ~24 u, vida 22%) en un punto (alcance 180 u, tope 240 u); dispara 6 ráfagas (una por segundo en 6000 ms) a hasta 3 enemigos a ≤230 u. Máximo 2. Costo 32, cooldown 10000 ms. *(`brakk.js:5,30,49-72,94`)*
- **Silueta y forma:** Torreta de hierro con base cuadrada, cuerpo cilíndrico y cañón que gira hacia el objetivo; dispara clavos largos.
- **Color dominante:** Hierro `#504637` con boca naranja `#ff8a3c`.
- **Movimiento:** Se arma pieza por pieza; el cañón gira; cada disparo es un clavo recto con retroceso.
- **Anticipación:** Ensamblado de 3 piezas, 4 cuadros (~330 ms).
- **Impacto:** Disparo: fogonazo naranja + clavo (línea de 18 u de semiancho), 3 cuadros.
- **Disipación:** Al destruirse: chatarra y chispas, 5 cuadros.
- **Cuadros sugeridos:** anticipación 4 + impacto 3 + disipación 5 = 12 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 48x48 px (64u x 64u; 1,5 u/px)
- **Loop:** Sí: torreta activa en loop de 6 cuadros (humo tenue); disparo de una pasada.
- **Partículas / capas secundarias:** Clavos incrustados en el suelo; humo.
- **Ícono 16x16:** torreta con un clavo largo. (hoy: glifo píxel `nails+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Única pieza mecánica con piezas móviles y luz naranja; el muro es mampostería.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Centinela de Latón de Brasa y la Torre de Yogur de Myla: Brasa es latón con vapor y Myla yogur rosado; esta es hierro oscuro con clavos.

### Hab. 3 - Apuntalar

- **Mecánica (código):** Repara 35% de vida a sus construcciones a ≤160 u y gana 15% de armadura durante 3000 ms (aliados con el talento `crew`). Costo 24, cooldown 12000 ms. *(`brakk.js:6,31-35`)*
- **Silueta y forma:** Vigas de madera cruzadas en X que se clavan sobre cada construcción y sobre él, con un halo de soldadura azulada.
- **Color dominante:** Madera media `#b08a54` con chispa blanco-azulada.
- **Movimiento:** Las vigas se clavan una a una (golpes secos); el halo late 3000 ms mientras dura la armadura.
- **Anticipación:** Clavos y vigas caen, 3 cuadros.
- **Impacto:** Apuntalado con chispas de soldadura, 3 cuadros.
- **Disipación:** Las vigas se funden con la estructura; el halo se apaga, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 216x216 px (diámetro 320u = 2 x r 160u; 1,5 u/px)
- **Loop:** Sí: halo/arnés sobre el campeón en loop de 6 cuadros (3000 ms).
- **Partículas / capas secundarias:** Chispas de soldadura blanco-azuladas; serrín.
- **Ícono 16x16:** dos vigas cruzadas con clavos. (hoy: glifo píxel `brace+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única de color madera clara y se aplica a las propias construcciones; el resto daña o crea.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Escudo Sagrado de Elyra y Burbuja Cremosa de Myla: aquellos son burbujas translúcidas; esta son vigas sólidas.

### Definitiva - Demolición final

- **Mecánica (código):** Sacrifica las construcciones a ≤180 u, golpea y ralentiza 30% durante 1800 ms a los enemigos a ≤180 u y gana escudo (6% + 2% por construcción, máx. 14%). Sin costo, cooldown 36000 ms. *(`brakk.js:7,36-45`, premarcado ninguno (centrada en él))*
- **Silueta y forma:** Una bola de demolición gigante (80 u) cae del cielo sobre el centro y golpea; las construcciones propias explotan en bloques que vuelan en parábola; una nube de polvo (r=180 u) queda 1800 ms.
- **Color dominante:** Arena `#cead7a` y tierra `#6d5636` con núcleo naranja `#ff8a3c` en la explosión.
- **Movimiento:** La bola oscila de la cadena, cae en 200 ms y rebota; los escombros trazan arcos; el polvo se extiende y se queda.
- **Anticipación:** Pose de 650 ms: sombra de la bola, la cadena se tensa, 6 cuadros.
- **Impacto:** Golpe y explosión con anillo de choque r=180 u, 6 cuadros; los escombros 4 cuadros.
- **Disipación:** El polvo envuelve la zona y se disipa lento (1800 ms), 8 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 6 + disipación 8 = 20 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 240x240 px (diámetro 360u = 2 x r 180u; 1,5 u/px)
- **Loop:** Sí: la nube de polvo en loop de 6 cuadros durante 1800 ms.
- **Partículas / capas secundarias:** Bloques de ladrillo con rotación, chispas, sacudida de pantalla media.
- **Ícono 16x16:** bola de demolición con cadena. (hoy: glifo píxel `ball+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Única con una bola cayendo y escombros volando; el resto de su kit son piezas quietas.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Alud de Ilkan (golpe al suelo) y Colapso de Vhal: Alud es arena en onda, Colapso una estrella; esta es mampostería rota y polvo.

### Pasiva - Cimientos firmes

- **Mecánica (código):** Recibe 8% menos daño a ≤120 u de una construcción propia (`quality-five/register.js:56`).
- **Arte:** No se verificó indicador visible. Opcional: una línea de base de 2 px bajo el campeón (arena) cuando está bajo la protección; no requerido.
