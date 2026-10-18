# Ilkan, el Caminante de Dunas (`ilkan`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Guerrero / berserker (rol asesino, melee, movilidad extrema; gana Tormenta con el riesgo y se transforma en el Coloso de Arena). Tono: nómada, orgulloso, sereno bajo presión. Lenguaje: pendón, lanza, duna, grano de arena, caravana.
- **Paleta sugerida:** arena ocre `#d89a4a` (tema `sand`, `themes.js:19`) y tierra `#b8793a` (color de clase, `champions.js:206`), claro `#f4d08a`, oscuro `#8a5a2a`, turquesa de Tormenta `#4fe3cf` (glow de clase), contorno `#2a1608`. (Atlas: `#cc9c54`, turquesa `#249c9c`, amarillo `#fccc54`.)
- **Motivos visuales:** pendón de tela con flecos, lanza, hoces gemelas, dunas ondulantes, granos de arena arrastrados por el viento, remolino de tormenta, coloso de arena con runas turquesas.
- **NO debe parecerse a:** **Libertador** (pendón azul y sable); **Brakk** (arena pero ladrillo y madera); **Khepri** (dorado con verde); **Facu** (olas de agua). El turquesa de Ilkan SOLO aparece como Tormenta/energía (runas, núcleos), nunca como color de agua.
- **Estado actual del VFX (verificado en código):** Tema procedural `sand` (`themes.js:19`, forma `scallop`, motivos grain/banner/flag/spark). `skill-fx-a/c/ilkan.js`: Lanza = haz 40 u, Piel = aura, Caravana = nova + aura, definitiva = nova r=230. Tiene hojas propias en `assets/sprites/champions/ilkan/` (v2) y efectos en `ilkanQuakeFx` (`ilkan.js`).
- **Fuentes del kit:** `js/data/champions.js:205-232` (kit humano y Coloso), `js/data/champion-tuning.js:33-62` (`ILKAN_CFG`), `js/champions/ilkan.js:150-200` (casteo), `aim-targeting.js:39-40`.

## B. Habilidades

### Básico - Hoces Gemelas

- **Mecánica (código):** Combo de 3 cortes en arco; alcance 84 u, cooldown 380 ms, multiplicadores 1,0 / 1,0 / 1,45 en una ventana de 900 ms; el tercero carga más Tormenta. *(`champions.js:211`, `champion-tuning.js:38`, `champion-identity.js:81`)*
- **Silueta y forma:** Tres arcos de hoz: el primero y el segundo ocre, el tercero más grande con borde turquesa (Tormenta).
- **Color dominante:** Ocre claro `#f4d08a`; turquesa en el 3º `#4fe3cf`.
- **Movimiento:** Arco izquierda-derecha, derecha-izquierda y un tajo cruzado final con remolino de arena.
- **Anticipación:** Hoz hacia atrás, 2 cuadros.
- **Impacto:** Cada corte 3 cuadros (3 piezas), el 3º con estallido de arena, 4 cuadros.
- **Disipación:** La arena cae.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros
- **Tamaño sugerido del asset (px nativos):** 56x88 px (radio 84u, ancho de boca 126u, arco 97 grados; 1,5 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Granos de arena, destello turquesa en el 3º.
- **Ícono 16x16:** hoz. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Combo de 3 arcos ocres; el Coloso cambia a golpes de zona.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a la Puñalada de Kael y los Mil Cortes de Musashi: daga gris y tinta; estas son hoces ocres con arena.

### Hab. 1 - Lanza-Pendón

- **Mecánica (código):** Mantener para apuntar y soltar: arroja la lanza y sale disparado tras su pendón (360 u a 1150 u/s, 90 ms de preparación); durante el vuelo una segunda lanza permite cambiar de dirección (300 u); corta a ≤74 u del camino con daño 140%. Costo 22, cooldown 7000 ms. *(`champions.js:214`, `champion-tuning.js:40`, `ilkan.js:150-161`, premarcado `aim-targeting.js:39`)*
- **Silueta y forma:** Lanza larga con un pendón de tela ocre ondeando y una estela de granos; en el cambio de dirección un segundo pendón se desprende en ángulo.
- **Color dominante:** Ocre `#d89a4a` con pendón turquesa `#4fe3cf` en el borde.
- **Movimiento:** La lanza vuela recta y el pendón flamea; Ilkan sale tras él como una línea de arena; el cambio de dirección dibuja un codo.
- **Anticipación:** Pose de 90 ms: Ilkan levanta la lanza, 2 cuadros.
- **Impacto:** Vuelo y corte con arco de 74 u, 4 cuadros.
- **Disipación:** La lanza se clava y el pendón cae lento, 5 cuadros.
- **Cuadros sugeridos:** anticipación 2 + impacto 4 + disipación 5 = 11 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 240x32 px (360u x 48u; 1,5 u/px)
- **Loop:** Sí: el pendón flameando en loop de 4 cuadros mientras la lanza está clavada.
- **Partículas / capas secundarias:** Arena levantada, flecos, dobles destellos en el cambio de dirección.
- **Ícono 16x16:** pendón/bandera. (hoy: glifo píxel `banner`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única línea larga con un objeto (pendón) y un codo opcional; el resto son auras o zonas.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Bayoneta del Libertador y Flecha Perforante de Sylva (líneas): bayoneta azul con humo y saeta verde con plumas; esta es una lanza con pendón ocre.

### Hab. 2 - Piel de Duna

- **Mecánica (código):** Durante 3500 ms recibe 35% menos daño y cada golpe recibido carga x3 Tormenta (no es invulnerabilidad). Costo 25, cooldown 14000 ms. *(`champions.js:215`, `champion-tuning.js:42`, `ilkan.js:163-169`)*
- **Silueta y forma:** Una cúpula de granos de arena que se compactan en capas (como escamas de duna) alrededor del cuerpo; cada golpe recibido deja un destello turquesa que sube.
- **Color dominante:** Ocre quieto `#b8793a` con destello `#4fe3cf`.
- **Movimiento:** Los granos giran y se endurecen en 420 ms; al recibir daño la cúpula vibra y suelta chispas turquesas.
- **Anticipación:** Granos entran al cuerpo y se compactan, 4 cuadros (~520 ms de pose, `ilkan.js:166`).
- **Impacto:** Cúpula completa, 3 cuadros.
- **Disipación:** Se deshace en arena que cae, 4 cuadros.
- **Cuadros sugeridos:** anticipación 4 + impacto 3 + disipación 4 = 11 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 64x80 px (96u x 112u; 1,5 u/px)
- **Loop:** Sí: cúpula en loop de 8 cuadros durante 3500 ms.
- **Partículas / capas secundarias:** Chispas turquesas en cada golpe, polvo de duna.
- **Ícono 16x16:** duna con una flecha arriba. (hoy: glifo píxel `dune+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única cúpula pegada al cuerpo y la única que se alimenta del daño recibido.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Armadura de la Furia del Segador y Corteza prestada de Maura: aura roja y corteza verde; esta es arena que se compacta.

### Hab. 3 - Grito de Caravana

- **Mecánica (código):** Durante 7000 ms: +18% velocidad, +18% daño y x1,5 Tormenta (más fuerte con poca vida, hasta +80%); los aliados a ≤300 u reciben el 35%. Costo 30, cooldown 15000 ms. *(`champions.js:216`, `champion-tuning.js:44`, `ilkan.js:170-179`)*
- **Silueta y forma:** Un cuerno de caravana suena y una onda de viento cálido sale hasta 300 u levantando una fila de pendones y siluetas de caravana (camellos y mercaderes) al fondo de la onda; los aliados reciben un pendón pequeño sobre la cabeza.
- **Color dominante:** Dorado arena `#f4d08a` y ocre.
- **Movimiento:** La onda es lenta y larga (700 ms); los pendones ondean; las siluetas cruzan lento.
- **Anticipación:** Pose de 620 ms: levanta el cuerno, 5 cuadros.
- **Impacto:** Onda de viento y pendones, 4 cuadros.
- **Disipación:** Los pendones caen y las siluetas se desvanecen, 5 cuadros.
- **Cuadros sugeridos:** anticipación 5 + impacto 4 + disipación 5 = 14 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 304x304 px (diámetro 600u = 2 x r 300u; 2 u/px)
- **Loop:** Sí: pendones en aliados en loop de 8 cuadros durante 7000 ms.
- **Partículas / capas secundarias:** Polvo de viaje, arena en el aire, pendones.
- **Ícono 16x16:** brújula con flecha arriba. (hoy: glifo píxel `compass+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única onda larga y de paisaje (siluetas); la 2 se pega al cuerpo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a ¡Granaderos, a la carga! del Libertador y Marcha de salida de Dáriel (buffs de equipo): clarín azul y pentagrama; esta es un viento de caravana ocre.

### Definitiva - Coloso de Arena

- **Mecánica (código):** Con la Tormenta llena se transforma (1600 ms) en un Coloso de 22000 ms: vida x2,6, daño x1,9, escala visual x2,7, velocidad x0,82; sus propias habilidades pasan a ser Alud, Hundimiento y Marcha de Dunas (abajo). Sin costo, cooldown 40000 ms. *(`champions.js:218`, `champion-tuning.js:48-50`, `ilkan.js:181-188`)*
- **Silueta y forma:** Tromba de arena que sube en columna (1600 ms) y se condensa en un gólem de dunas de 2,7 veces su tamaño, cuerpo de roca y arena, con runas y núcleo turquesa en el pecho y una cabeza sin rostro.
- **Color dominante:** Ocre `#d89a4a` y roca `#8a5a2a`, runas `#4fe3cf`.
- **Movimiento:** La columna gira y absorbe el cuerpo; el coloso se levanta en 3 pasos; la arena le cae por los hombros todo el tiempo.
- **Anticipación:** Tromba y absorción, 10 cuadros (~1600 ms).
- **Impacto:** El coloso se levanta con onda de arena, 6 cuadros.
- **Disipación:** Al terminar se desmorona en arena y deja a Ilkan agotado (6 s de lentitud), 8 cuadros.
- **Cuadros sugeridos:** anticipación 10 + impacto 6 + disipación 8 = 24 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** tromba Ø(2x120u) = 160x160 px + coloso 190x190 u -> 128x128 px por pose
- **Loop:** Sí: la arena que le cae por los hombros en loop de 8 cuadros durante 22000 ms.
- **Partículas / capas secundarias:** Sacudida de pantalla fuerte al levantarse, arena suspendida.
- **Ícono 16x16:** puño con un anillo. (hoy: glifo píxel `fist+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única transformación del kit; las habilidades humanas son rápidas y pequeñas.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Encarnación del Abismo de Nigromante (transformación): demonio verde; esta es un gólem de arena ocre-turquesa.

### Coloso 1 - Alud

- **Mecánica (código):** Golpe violento al suelo: onda circular de 230 u, daño x3,2 con caída del 45% hacia el borde, empuja 95 u y aturde 500 ms a élites. Cooldown 6500 ms, sin costo. *(`champions.js:227`, `champion-tuning.js:51` (`sismo`), `ilkan.js:189-199`)*
- **Silueta y forma:** El coloso levanta ambos puños y los baja; del impacto sale una onda circular de arena con grietas radiales y rocas que saltan.
- **Color dominante:** Ocre `#d89a4a` con grietas oscuras.
- **Movimiento:** Puños arriba 300 ms, bajada rápida y onda de 230 u; las grietas se extienden 180 ms más.
- **Anticipación:** Puños al aire y sombra que crece, 4 cuadros.
- **Impacto:** Impacto y onda circular, 5 cuadros.
- **Disipación:** Las grietas se rellenan de arena y la onda muere, 5 cuadros.
- **Cuadros sugeridos:** anticipación 4 + impacto 5 + disipación 5 = 14 cuadros
- **Tamaño sugerido del asset (px nativos):** 232x232 px (diámetro 460u = 2 x r 230u; 2 u/px)
- **Loop:** No.
- **Partículas / capas secundarias:** Rocas que saltan, polvo, sacudida fuerte de pantalla.
- **Ícono 16x16:** puño con una X. (hoy: glifo píxel `fist+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es el golpe circular instantáneo del coloso; Hundimiento es sostenido y Marcha lineal.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Demolición final de Brakk y Pulso del Cristal de Bront: bola de demolición y pulso azul; esta es un golpe de puños con grietas de arena.

### Coloso 2 - Hundimiento

- **Mecánica (código):** Canalizada: planta los pies y hunde el suelo en 4 pulsos (cada 500 ms) de radio 250 u y daño x1,25; los enemigos reciben +25% de daño; mientras dura, Ilkan recibe más daño. Cooldown 13000 ms. *(`champions.js:228`, `champion-tuning.js:52` (`terremoto`))*
- **Silueta y forma:** El suelo se hunde en un cráter de arena que se traga a los enemigos; cada pulso es un anillo que se contrae hacia el centro y agrieta más.
- **Color dominante:** Ocre oscuro `#8a5a2a` con centro negro.
- **Movimiento:** Cuatro pulsos que bajan el cráter un nivel cada uno; los bordes se derrumban hacia adentro.
- **Anticipación:** El coloso se agacha y hunde las manos, 4 cuadros.
- **Impacto:** 4 pulsos de 3 cuadros (12 cuadros).
- **Disipación:** El cráter se rellena, 5 cuadros.
- **Cuadros sugeridos:** anticipación 4 + impacto 12 + disipación 5 = 21 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 256x256 px (diámetro 500u = 2 x r 250u; 2 u/px)
- **Loop:** Sí: borde del cráter en loop de 4 cuadros entre pulsos.
- **Partículas / capas secundarias:** Arena que cae al hueco, rocas.
- **Ícono 16x16:** duna con una X. (hoy: glifo píxel `dune+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es el único efecto que baja el suelo (cráter) con 4 pulsos.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Colapso de Vhal y la Presión Abisal de Facu (atraen al centro): estrella negra y remolino de agua; este es un cráter de arena.

### Coloso 3 - Marcha de Dunas

- **Mecánica (código):** Avanza pisando: 6 pasos de 520 ms a 95 u/s (~300 u de recorrido), radio 160 u por paso, daño x1,35 y empuje 60 u; control de dirección limitado. Cooldown 14000 ms. *(`champions.js:229`, `champion-tuning.js:53` (`march`), premarcado `aim-targeting.js:40`)*
- **Silueta y forma:** Seis huellas gigantes de coloso que se hunden en la arena con una onda de destrucción en cada paso; entre pasos el polvo forma una estela.
- **Color dominante:** Ocre `#d89a4a`, huellas oscuras.
- **Movimiento:** Paso a paso: cada 520 ms una huella se hunde y levanta un anillo; el cuerpo se balancea.
- **Anticipación:** El pie se levanta, 3 cuadros por paso.
- **Impacto:** Pisada y anillo de 160 u, 3 cuadros por paso.
- **Disipación:** La huella queda 1500 ms y se rellena, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 216x216 px (diámetro 320u = 2 x r 160u; 1,5 u/px)
- **Loop:** Sí: la huella (loop de 4 cuadros mientras queda).
- **Partículas / capas secundarias:** Polvo, rocas, vibración de pantalla leve.
- **Ícono 16x16:** pisadas con un anillo. (hoy: glifo píxel `boots+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única en pasos secuenciales con huellas; Alud y Hundimiento son en un punto.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Cabalgar la Ola de Facu y Carga de San Lorenzo del Libertador: cresta y caballería; esta son pisadas de gigante.

### Coloso 4 - Los Tres Pasos

- **Mecánica (código):** Definitiva secreta: rugido 1300 ms, aviso 1350 ms, y tres pasos con 650 ms de pausa a 320 u cada uno, radios 250, 250 y 420 u, daño x8, x8 y x13, empuja 140 u; 9 siluetas de coloso. Máximo 2 por partida; después Ilkan queda agotado 6000 ms. *(`champions.js:231`, `champion-tuning.js:55-61` (`finale`))*
- **Silueta y forma:** Un paso colosal por vez sobre el campo: sombra gigante que crece (aviso), pie de gólem que cae, onda enorme y grietas; el tercero con una onda de 420 u y las 9 siluetas de colosos en el horizonte mirando.
- **Color dominante:** Ocre profundo `#8a5a2a` con núcleos turquesa `#4fe3cf` y blanco en el impacto.
- **Movimiento:** Rugido (el cielo se oscurece), sombra de pie en el suelo 1350 ms (aviso real), caída, pausa, caída, pausa, caída final mayor.
- **Anticipación:** Rugido y sombras, 10 cuadros; aviso por pie: sombra que crece, 8 cuadros (1350 ms).
- **Impacto:** 3 pisadas de 6 cuadros con ondas de 250, 250 y 420 u.
- **Disipación:** Polvo cubre el campo y se asienta, 10 cuadros.
- **Cuadros sugeridos:** anticipación 10 + impacto 18 + disipación 10 = 38 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 280x280 px (diámetro 840u = 2 x r 420u; 3 u/px)
- **Loop:** Sí: sombra de aviso de cada pie en loop de 8 cuadros durante 1350 ms.
- **Partículas / capas secundarias:** Sacudida de pantalla máxima, 9 siluetas en el borde, grietas persistentes.
- **Ícono 16x16:** huellas con una calavera. (hoy: glifo píxel `footprints+skull`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con aviso y siluetas de otros colosos; de lejos la más grande del roster.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Colapso de Vhal y Demolición de Brakk: estrella y bola; esta son pies gigantes.

### Pasiva - Sed de Horizonte

- **Mecánica (código):** Con menos del 25% de vida: +15% velocidad, +15% daño y x1,5 Tormenta (`champion-tuning.js:46`). La barra de Tormenta es la barra de la definitiva (`champion-tuning.js:34-36`).
- **Arte:** Bajo 25% de vida: viento de arena constante alrededor (loop 6 cuadros) y ojos turquesa en la silueta. La barra de Tormenta llena: la hoz y el pendón dejan chispas turquesas (anticipo de la transformación).
