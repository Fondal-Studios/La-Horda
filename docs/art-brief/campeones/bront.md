# Bront, la Fortaleza Viviente (`bront`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Tanque (rol tanque, resistencia y control). Tono: callado, leal y pesado; una armadura vacía con un cristal en el pecho que sostiene puertas. Lenguaje: placa de acero, remache, cristal facetado, muralla.
- **Paleta sugerida:** acero azul-gris `#8aa4b8` (color de clase, `ascension/catalog.js:91`), cristal celeste `#bfe8ff` y brillo `#5fd0ff`, sombra `#44627a`, hierro `#101c26`, blanco `#ffffff`. (Atlas: `#849cb4`, `#9cb4cc`, `#3c5454`.)
- **Motivos visuales:** placas rectangulares con remaches, cristal facetado que late, juntas con luz azul, almenas, puertas.
- **NO debe parecerse a:** **Baltra** (su `a=#8bb4bd` es casi igual al de Bront `#8aa4b8`: Baltra es bronce cálido y agua, Bront acero frío SIN bronce ni burbujas); **Brakk** (marrón y ladrillo); **Eslabón** (gris con cadenas); **Mago** (hielo): el cristal de Bront no es hielo, es facetado y cian, sin copos.
- **Estado actual del VFX (verificado en código):** Tema procedural `crystal` (`themes.js:13`, forma `hex`, motivos shard/plate/ice/diamond). `skill-fx-a/c/bront.js`: Placa = línea ancha 52, Muro = estallidos en los extremos, Pulso = nova + aura, Ciudadela = nova. El muro usa teja de haz (`SFA_OBJ.as_wall`).
- **Fuentes del kit:** `js/champions/ascension/catalog.js:91-102`, lanzamiento `ascension/runtime.js:145-152`, objetos `:235`, daño de placa `:281`, caída de placas `:290`, premarcado `js/skills/aim-targeting.js:60`, proyectil `ascension/register.js:10`.

## B. Habilidades

### Básico - Puño de bastión

- **Mecánica (código):** Golpe cuerpo a cuerpo (proyectil `fist` de corto alcance); alcance 90 u, cooldown 640 ms (arma: Puño de Bastión). *(`ascension/catalog.js:91` (`stats [178,8,.22,132,90,640,false]`), `register.js:10`)*
- **Silueta y forma:** Puño blindado de placas (20x20 u) que se proyecta con una onda de choque en arco corto.
- **Color dominante:** Acero `#8aa4b8` y blanco azulado.
- **Movimiento:** Golpe lento y pesado: ida 3 cuadros, retorno 2.
- **Anticipación:** Brazo hacia atrás con las placas apretándose, 3 cuadros.
- **Impacto:** Impacto con anillo plano azul claro, 3 cuadros.
- **Disipación:** Ondas de polvo metálico.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 3 = 9 cuadros
- **Tamaño sugerido del asset (px nativos):** 64x88 px (radio 90u, ancho de boca 123u, arco 86 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Chispas de acero, remache saltando.
- **Ícono 16x16:** puño blindado. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Golpe corto y pesado; el resto son placas, muro, pulso y fortaleza.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Golpe de Escudo de Aldric: Aldric deja un arco azul de escudo; Bront un puño recto con onda plana.

### Hab. 1 - Placa Arrojada

- **Mecánica (código):** Lanza una placa en línea (alcance 280 u, colisión ≤32 u del eje) que daña y queda clavada en el suelo como placa defensiva (radio 34 u, 12000 ms, máx. 4): ralentiza 30% a enemigos que la tocan. Costo 22, cooldown 5000 ms. *(`catalog.js:99`, `runtime.js:145`, `:235`, premarcado `aim-targeting.js:60`)*
- **Silueta y forma:** Placa rectangular de acero (32x48 u) que gira como una guillotina horizontal y se clava vertical al final.
- **Color dominante:** Acero `#8aa4b8` con cantos `#bfe8ff`.
- **Movimiento:** Gira 2 vueltas en vuelo; se clava con rebote y sacude el suelo.
- **Anticipación:** La placa se desprende de su hombro con chasquido, 3 cuadros.
- **Impacto:** Clavado: vibra y levanta anillo de polvo, 4 cuadros.
- **Disipación:** La placa queda activa (loop) y al vencer se oxida y se desvanece, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** trayecto 280x32 u -> 188x24 px + placa clavada 32x48 u -> 24x32 px (loop)
- **Loop:** Sí: la placa defensiva clavada, loop de 6 cuadros (brillo de juntas).
- **Partículas / capas secundarias:** Estela de chispas, anillo de polvo.
- **Ícono 16x16:** placa con una flecha. (hoy: glifo píxel `plate+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única pieza que viaja y queda como objeto pequeño; el muro es una pared larga.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Muro de asedio de Brakk y el Abanico de Plumas de Saelis (objetos lanzados que quedan clavados): ladrillo marrón y plumas; esta es una placa azul que gira.

### Hab. 2 - Muro de Placas

- **Mecánica (código):** Levanta una muralla de 160 u de largo a 90 u frente a él (colisión ≤26 u, premarcado 52 u de ancho, alcance 110 u) durante 5000 ms; daña (45%) y ralentiza mucho a los que la cruzan. Costo 28, cooldown 9400 ms. *(`catalog.js:100`, `runtime.js:146-147`, premarcado `aim-targeting.js:60`)*
- **Silueta y forma:** Pared de 4-5 placas verticales encajadas con juntas de luz azul y almenas, más alta que larga (160x52 u); pequeños cristales en las juntas.
- **Color dominante:** Acero `#8aa4b8` con juntas de luz `#5fd0ff`.
- **Movimiento:** Las placas suben en cascada de izquierda a derecha, 120 ms entre cada una; las juntas pulsan al ser cruzadas.
- **Anticipación:** Sombra alargada y vibración del suelo, 3 cuadros.
- **Impacto:** Placas emergen y encastran, 4 cuadros.
- **Disipación:** Se desmorona en placas que caen y se oxidan, 5 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 5 = 12 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 112x48 px (160u x 64u; 1,5 u/px)
- **Loop:** Sí: pared en pie, loop de 6 cuadros (pulso de las juntas).
- **Partículas / capas secundarias:** Polvo en la base; destello en cada placa al aparecer.
- **Ícono 16x16:** muralla de placas. (hoy: glifo píxel `wall+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única pared de placas lisas azul; la placa arrojada es chica y la ciudadela son cuatro paredes más una cúpula.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Muro de asedio de Brakk y el Muro de Fuego de Mago: ladrillo marrón y anillo de llamas; este es acero liso con juntas luminosas.

### Hab. 3 - Pulso del Cristal

- **Mecánica (código):** Pulso alrededor de él (radio 120 u): daño 150%, aparta 60 u a comunes, aturde 300 ms a élites; él y los aliados a ≤180 u ganan 20% de armadura 3000 ms. Costo 24, cooldown 7600 ms. *(`catalog.js:101`, `runtime.js:148`)*
- **Silueta y forma:** Latido del cristal del pecho: onda circular cian desde el pecho, con 6 esquirlas de cristal que apuntan hacia afuera; los aliados reciben un halo hexagonal azul.
- **Color dominante:** Cian cristal `#5fd0ff` y blanco.
- **Movimiento:** Dos latidos: uno chico y uno que sale; las esquirlas giran un cuarto de vuelta.
- **Anticipación:** El cristal late 2 veces, 3 cuadros.
- **Impacto:** Onda de r=120 u y esquirlas, 4 cuadros.
- **Disipación:** La onda se fragmenta y se apaga; el halo hexagonal queda 3000 ms (loop 6) y se desvanece.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 160x160 px (diámetro 240u = 2 x r 120u; 1,5 u/px)
- **Loop:** Solo el halo de armadura de aliados (loop de 6 cuadros, 3000 ms).
- **Partículas / capas secundarias:** Destellos de cristal, polvo azul.
- **Ícono 16x16:** cristal con un anillo. (hoy: glifo píxel `crystal+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única centrada en el pecho y de color cian; las placas son grises.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Bronce vivo de Baltra: aquella es bronce con muescas, esta es cristal cian con esquirlas.

### Definitiva - Ciudadela

- **Mecánica (código):** Se ancla (velocidad 0) y recibe -40% de daño durante 7000 ms: levanta 4 murallas a 170 u en cruz (238 u de largo c/u, 48 u de ancho) y un refugio central de radio 170 u. Sin costo, cooldown 42000 ms. *(`catalog.js:102`, `runtime.js:149-151`, velocidad `:286`, daño recibido `:284`)*
- **Silueta y forma:** Una fortaleza: cuatro murallas con almenas formando un cuadrado alrededor, torres en las esquinas y una cúpula translúcida de cristal sobre el refugio; el cristal del pecho brilla como faro.
- **Color dominante:** Acero `#8aa4b8`, cristal `#5fd0ff`, blanco.
- **Movimiento:** Las murallas surgen una a una (norte, este, sur, oeste, 150 ms entre sí); la cúpula se cierra; el cristal late lento durante los 7000 ms.
- **Anticipación:** Pose de 700 ms: se ancla al suelo y se levantan polvo y vibración, 6 cuadros.
- **Impacto:** Las 4 murallas y la cúpula, 8 cuadros.
- **Disipación:** La fortaleza se hunde y se desvanece en placas, 8 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 8 + disipación 8 = 22 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** suelo Ø(2x170u) = 232x232 px + 4 muros 238x48 u -> 160x32 px + cúpula Ø232 px
- **Loop:** Sí: fortaleza completa en loop de 6 cuadros (brillo del cristal y almenas).
- **Partículas / capas secundarias:** Polvo de cimentación, destellos en almenas, sacudida media al asentarse.
- **Ícono 16x16:** castillo con flecha hacia arriba. (hoy: glifo píxel `castle+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única estructura cuadrada con cúpula, hecha de cuatro muros; la 2 es una sola pared.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Demolición final de Brakk y Catedral del Sol de Aurelia: una es una bola de demolición, la otra una catedral dorada; esta es una fortaleza azul cerrada.

### Pasiva - Bastión

- **Mecánica (código):** Al recibir daño suelta una placa a 40 u de él cada 2500 ms (máx. 4, dura 12000 ms, radio 34 u): ralentiza 30% a enemigos que la toquen y reduce 12% el daño si está a ≤70 u (`ascension/runtime.js:290,235,281`).
- **Arte:** Las placas sueltas usan la misma pieza que Placa Arrojada pero más pequeña (24x32 px) y con un desprendimiento visible del hombro del personaje (3 cuadros).
