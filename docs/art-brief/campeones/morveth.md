# Morveth, el Jardinero de la Peste (`morveth`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Mago invocador (rol mago, infección, hongos y contagio, a distancia). Tono: sereno, clínico y torcido; cultiva un jardín en un hospital sitiado. Lenguaje: hongo, espora, micelio, contagio.
- **Paleta sugerida:** verde enfermizo `#a4c56a` (color de clase, `quality-five/register.js:73`), verde oscuro `#4a6a24`, claro `#dcf0a0`, púrpura de sombrero `#7c476b` (el que ya dibuja el juego, `morveth.js:91`) y acento `#b070d8`, hueso `#d6c1a0` (tallo), contorno `#121c08`.
- **Motivos visuales:** sombrero de hongo con láminas, tallo hueso, esporas en nube, hilos de micelio, flores marchitas, "puntos" de infección.
- **NO debe parecerse a:** **Kael** (su definitiva es verde neón con humo violeta: la peste de Morveth es opaca, amarillo-verdosa, con hongos físicos); **Sylva/Maura** (verde vegetal natural); **Khepri** (iridiscente de insectos); **Nigromante** (verde alma, mitad B); **Brasa** (vapor blanco): las esporas de Morveth no son vapor.
- **Estado actual del VFX (verificado en código):** Tema procedural `plague` (`themes.js:27`, forma `scallop`, motivos spore/shroom/drop/smoke). `skill-fx-a/c/morveth.js`: hongo = prop con motivo "shroom" + estallido, hab. 2 = cono, hab. 3 = nova + aura, definitiva = nova; el hongo y el anillo verde se dibujan en `morveth.js:89-92` (tallo 6x14 u, sombrero elíptico de 28x16 u).
- **Fuentes del kit:** `js/champions/quality-five/morveth.js` (kit :4-8, lanzamiento :26-44, infección :11-25, objetos :45-67, premarcado :87-88, dibujo :89-92), clase y pasiva `quality-five/register.js:73`.

## B. Habilidades

### Básico - Esporas de cultivo

- **Mecánica (código):** Disparo a distancia que contagia una infección de tres pulsos; alcance 300 u, cooldown 600 ms. *(`quality-five/register.js:73` (`basicRange:300, basicCd:600`), `champion-identity.js:206`)*
- **Silueta y forma:** Cápsula de espora (10 u) con un halo de 6 granitos que la rodean y se sueltan.
- **Color dominante:** Amarillo verdoso `#c3d581` con granos púrpura.
- **Movimiento:** Vuelo lento y ondulado, los granos orbitan; al impactar la cápsula revienta en nube.
- **Anticipación:** La cápsula se hincha en la mano, 2 cuadros.
- **Impacto:** Revienta en una nube de granos, 3 cuadros.
- **Disipación:** La nube cae como polvo y deja un punto verde sobre el objetivo (infección, 3 pulsos de 1000 ms).
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 24x24 px (36u x 36u; 1,5 u/px)
- **Loop:** Proyectil en loop de 4 cuadros; el punto de infección en el objetivo en loop de 3 cuadros.
- **Partículas / capas secundarias:** Granos de espora.
- **Ícono 16x16:** espora. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Pequeña y clara; las habilidades son hongo, aliento, micelio y jardín.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Segundo robado de Aelith y la Remachadora de Brasa: gota de arena y remache; esta es una cápsula que revienta en esporas.

### Hab. 1 - Huerto maldito

- **Mecánica (código):** Planta un hongo destructible (vida 20% de la suya) en un punto (alcance 260 u, tope 330 u, radio 85 u) que libera 6 pulsos de esporas (uno por segundo, 6000 ms); máximo 3 hongos (se reemplaza el más viejo). Costo 28, cooldown 8000 ms. *(`morveth.js:4,32,45-67,88`)*
- **Silueta y forma:** Hongo de tallo hueso y sombrero púrpura con láminas visibles, de unos 40x48 u, que brota con un "pop"; cada pulso expulsa un aro de esporas de 85 u.
- **Color dominante:** Púrpura `#7c476b` y hueso `#d6c1a0`, esporas verdes.
- **Movimiento:** Brota del suelo en 3 pasos; cada segundo el sombrero se hincha y suelta el aro; al romperse se desinfla.
- **Anticipación:** Tierra que se agrieta y un brote, 3 cuadros.
- **Impacto:** Hongo completo + primer aro de esporas, 3 cuadros; cada pulso 3 cuadros.
- **Disipación:** Muere desinflándose y tosiendo una última nube, 5 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 5 = 11 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** hongo 40x48 u -> 32x32 px + aro de esporas Ø(2 x 85u) = 112x112 px
- **Loop:** Sí: hongo vivo en loop de 8 cuadros (respira) durante 6000 ms.
- **Partículas / capas secundarias:** Esporas, barra de vida del hongo (la dibuja el juego).
- **Ícono 16x16:** brote con una calavera. (hoy: glifo píxel `sprout+skull`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única pieza que se siembra y respira; el aliento es un cono y el jardín un campo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Torre de Yogur de Myla y Torreta de clavos de Brakk (objetos destructibles que atacan): torre rosada y torreta de hierro; este es un hongo vivo púrpura.

### Hab. 2 - Exhalación de peste

- **Mecánica (código):** Abanico (alcance 210 u, semiángulo 0,85 rad = 97° de boca; tope 280 u): daño 80% e infecta a las víctimas durante tres pulsos (1000 ms c/u). Costo 24, cooldown 6000 ms. *(`morveth.js:5,33,87`)*
- **Silueta y forma:** Aliento: una nube amarillo-verdosa en forma de cuña, con 3 "ondas de tos" concéntricas y granos que se desprenden; los enemigos quedan con puntos verdes (infección).
- **Color dominante:** Amarillo verdoso `#a4c56a` con borde `#dcf0a0`.
- **Movimiento:** La nube sale en un solo soplo y avanza 210 u; los granos giran un instante y caen.
- **Anticipación:** Morveth inhala (el pecho se hincha), 3 cuadros.
- **Impacto:** Cuña de nube con tres ondas, 4 cuadros.
- **Disipación:** Se desvanece dejando puntos que parpadean 3 pulsos (loop 3 cuadros).
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 3 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 144x216 px (radio 210u, ancho de boca 316u, arco 97 grados; 1,5 u/px)
- **Loop:** Solo los puntos de infección sobre enemigos (loop 3 cuadros).
- **Partículas / capas secundarias:** Granos de espora, restos de niebla.
- **Ícono 16x16:** nube con gotas. (hoy: glifo píxel `cloud+drop`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única cuña de niebla opaca; el hongo es un objeto y el jardín un campo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Purga de Vapor de Brasa y Sal de Ruptura de Morwen (conos): vapor blanco y sal cristalina; esta es una niebla amarillo-verdosa con puntos.

### Hab. 3 - Simbiosis

- **Mecánica (código):** Gana 15% de armadura durante 3000 ms y sana 2% de vida; si consume un hongo propio a ≤150 u sana 4%. Con el talento `share` alcanza a aliados cercanos. Costo 26, cooldown 12000 ms. *(`morveth.js:6,34-37`)*
- **Silueta y forma:** Filamentos blancos de micelio suben por su cuerpo y forman una envoltura tejida; si hay un hongo cercano, este se desploma y le entrega un destello de polen.
- **Color dominante:** Verde pálido `#c3d581` con hilos blancos.
- **Movimiento:** Los hilos crecen desde los pies y se entretejen; el hongo se marchita hacia él con una línea de polen.
- **Anticipación:** Micelio emerge del suelo, 3 cuadros.
- **Impacto:** La envoltura se cierra, 3 cuadros.
- **Disipación:** Hilos se aflojan y polen sube, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 64x80 px (96u x 112u; 1,5 u/px)
- **Loop:** Sí: envoltura de micelio en loop de 8 cuadros durante 3000 ms.
- **Partículas / capas secundarias:** Polen, hilos blancos, +2%/+4% de curación como destello pequeño.
- **Ícono 16x16:** seta con flecha arriba. (hoy: glifo píxel `mushroom+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única centrada en el cuerpo con hilos blancos; no cubre zona.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Caparazón Vivo de Khepri y Corteza prestada de Maura (envolturas): insectos y corteza; esta son hilos de micelio.

### Definitiva - Jardín de la peste

- **Mecánica (código):** Zona de radio 165 u (alcance 250 u, tope 330 u) durante 4000 ms con 4 pulsos (uno por segundo): infectan, dañan 30% y ralentizan 30% 1200 ms; los aliados dentro ganan 10% de armadura 1200 ms por pulso. Bloquea la definitiva 4000 ms. Sin costo, cooldown 36000 ms. *(`morveth.js:7,38-41,56-64,88`)*
- **Silueta y forma:** Un jardín que florece de golpe: decenas de hongos de sombreros púrpuras y flores marchitas surgen en círculo; en el centro un hongo gigante (60 u) con las láminas brillando; cada pulso una ola de esporas y filamentos cruza la zona.
- **Color dominante:** Verde `#a4c56a`, púrpura `#7c476b`/`#b070d8` y hueso `#d6c1a0`.
- **Movimiento:** Brotan del exterior hacia el centro (500 ms); cada segundo una ola de esporas sale del hongo central; al final todos revientan y llueve esporas.
- **Anticipación:** Pose de 650 ms: planta una semilla y el suelo se oscurece, 6 cuadros.
- **Impacto:** 4 pulsos de 4 cuadros con ola de esporas, 16 cuadros.
- **Disipación:** Los hongos reventan en lluvia de esporas, 8 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 16 + disipación 8 = 30 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 224x224 px (diámetro 330u = 2 x r 165u; 1,5 u/px)
- **Loop:** Sí: jardín en pie en loop de 8 cuadros entre pulsos.
- **Partículas / capas secundarias:** Esporas en suspensión, hilos de micelio entre hongos, sacudida suave en cada pulso.
- **Ícono 16x16:** árbol con calavera. (hoy: glifo píxel `tree+skull`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con un campo vegetal completo y un hongo gigante; el Huerto es un solo hongo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a El bosque camina de Maura y Eclipse de Escarabajos de Khepri (campos vivos): árboles espinosos y enjambre; este es un jardín de hongos púrpuras.

### Pasiva - Contagio terminal

- **Mecánica (código):** Cuando muere un enemigo infectado contagia hasta 3 vecinos a ≤95 u con 70% de la infección; los contagios secundarios no vuelven a propagarse (`morveth.js:20-23`; texto `register.js:73`).
- **Arte:** Al morir el infectado: un estallido de esporas de 95 u (4 cuadros) y 3 filamentos que salen hacia los vecinos (3 cuadros) donde aparece el punto de infección.
