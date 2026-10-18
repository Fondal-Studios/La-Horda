# Sylva, la Cazadora del Bosque (`cazadora`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Tiradora móvil (rol asesino, daño sostenido a distancia). Tono: ágil, silenciosa y paciente; persigue a una Presa y se vuelve más rápida. Lenguaje: flecha, hoja, raíz, lobo.
- **Paleta sugerida:** verde bosque `#5c9a4a` (color de clase, `champions.js:158`), hoja clara `#c8f0a8`, verde oscuro `#2f5a24`, dorado `#d8b050` (plumas), crema `#f4ffe0`, turquesa espectral `#5ad0c8` (el lobo, `cazadora.js:167`), contorno `#12220c`.
- **Motivos visuales:** hojas afiladas, flechas con plumas, raíces que atrapan, huellas de lobo, lluvia vertical, lobo espectral.
- **NO debe parecerse a:** **Maura** (olivas y espinas), **Morveth** (verde enfermizo con púrpura), **Khepri** (esmeralda y lima con oro), **Saelis** (plumas celestes): Sylva es verde natural y vivo, sin púrpura ni oro dominante; **Ilkan/Musashi** (trazos de hoja/tinta).
- **Estado actual del VFX (verificado en código):** Tema procedural `hunt` (`themes.js:14`, forma `petal`, motivos leaf/arrow/thorn/spark). `skill-fx-a/c/cazadora.js`: Flecha = haz 30 u, Trampa = estallido 46, Lluvia = nova del radio real, definitiva = nova 110 + aura 4000 ms. Hay arte propio previo en `assets/vfx/cazadora/` (`trap-f1..f4`, `rain-f1..f3`) y una Trampa que crece en 4 etapas durante 200 ms (`asesino.js:drawTrap`).
- **Fuentes del kit:** `js/data/champions.js:157-174` (stats y kit), `js/skills/abilities.js:534-607` (Flecha, Trampa, Lluvia, Cacería), `js/champions/cazadora.js:13-50` (Lluvia), `:83` (carga), `:161-196` (lobo), `js/champions/asesino.js:25-60` (Trampa del Bosque), `js/data/champion-tuning.js:64-71` (pasivas).

## B. Habilidades

### Básico - Flecha

- **Mecánica (código):** Disparo a distancia; alcance 300 u, cooldown 420 ms (acelera con Impulso y Rastreo); daño x0,88. *(`champions.js:166`, `champion-tuning.js:66-69`)*
- **Silueta y forma:** Flecha corta con plumas doradas (6x18 u) y punta de hoja.
- **Color dominante:** Verde claro `#c8f0a8` con pluma `#d8b050`.
- **Movimiento:** Vuelo recto y silbante; deja 2 hojitas en la estela.
- **Anticipación:** Arco que se tensa, 2 cuadros.
- **Impacto:** Clavado con una hojita que salta, 3 cuadros.
- **Disipación:** La flecha se pierde con un destello verde.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 24x24 px (36u x 36u; 1,5 u/px)
- **Loop:** Proyectil en loop de 4 cuadros.
- **Partículas / capas secundarias:** Hojitas, plumas pequeñas.
- **Ícono 16x16:** flecha con una hoja. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Flecha pequeña y clara; la Perforante es más grande y dorada, el resto son suelo y lobo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Disparo de prisma de Aurelia y Fusil del Libertador: prisma facetado y bala con humo; esta es una flecha con plumas.

### Hab. 1 - Flecha Perforante

- **Mecánica (código):** Se carga manteniendo hasta 900 ms (3 tiers: x1 / x1,5 desde 35% / x2,3 desde 85% de carga); vuela a 640 u/s durante 900 ms (~576 u), los tiers 2 y 3 aplican Hemorragia 3200 ms a la Presa y el tier 3 perfora. Alcance de la ficha 420 u, premarcado en línea ancho 16 u. Costo 30, cooldown 6500 ms. *(`champions.js:169`, `abilities.js:534-570`, `cazadora.js:83`, premarcado `aim-targeting.js:24`)*
- **Silueta y forma:** Saeta larga con aro de energía: tier 1 pequeña verde, tier 2 con aro, tier 3 dorada (30 u de largo) con estela de hojas y onda cónica en la punta.
- **Color dominante:** Verde `#5c9a4a` → dorado `#fff6a8` en tier 3.
- **Movimiento:** La carga la ilumina de la mano a la punta (3 niveles); sale recta y rápida; el tier 3 deja un surco de luz que atraviesa a varios.
- **Anticipación:** La carga de hasta 900 ms: tres estados de brillo del arco (loop de 3 cuadros por tier).
- **Impacto:** Disparo y atravesar enemigos: aro de impacto en cada uno, 4 cuadros.
- **Disipación:** La estela de hojas se queda 300 ms y se disuelve, 4 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 4 + disipación 4 = 14 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 216x24 px (420u x 36u; 2 u/px)
- **Loop:** Sí: la carga en loop (3 tiers x 2 cuadros); impacto y estela de una pasada.
- **Partículas / capas secundarias:** Hojas arrastradas, anillo de aire al disparar.
- **Ícono 16x16:** flecha larga apuntando a un círculo. (hoy: glifo píxel `arrow+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única línea larga y la única con 3 tiers visuales de carga.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Refracción de Aurelia y Fractura de Aelith (líneas): luz blanca y grieta; esta es un proyectil físico con plumas, verde/dorado.

### Hab. 2 - Trampa del Bosque

- **Mecánica (código):** Coloca una trampa de radio 70 u (alcance 220 u) que se arma 200 ms y dura 9000 ms; al primer enemigo que la pise inmoviliza a los comunes 2200 ms (élites 45%, jefes solo ralentizados 55%). Costo 26, cooldown 9500 ms. *(`champions.js:170`, `abilities.js:575-589`, `asesino.js:25-48`, premarcado `aim-targeting.js:18`)*
- **Silueta y forma:** Cepo de raíces: un círculo de 70 u de raíces espiraladas con dientes de hojas que se cierra sobre la víctima.
- **Color dominante:** Verde oscuro `#2f5a24` con raíces `#5c9a4a` y destello `#c8f0a8`.
- **Movimiento:** Crece en 4 etapas durante el armado (ya existen 4 sprites `trap-f1..f4`); al pisarse las raíces suben y aprietan.
- **Anticipación:** Brotes que salen del suelo en 4 etapas, 4 cuadros (200 ms de armado real).
- **Impacto:** Disparo: las raíces cierran en espiral, 4 cuadros.
- **Disipación:** Se marchita y se hunde (último 1200 ms ya baja el alfa), 5 cuadros.
- **Cuadros sugeridos:** anticipación 4 + impacto 4 + disipación 5 = 13 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 96x96 px (diámetro 140u = 2 x r 70u; 1,5 u/px)
- **Loop:** Sí: trampa armada en loop de 6 cuadros (balanceo) hasta 9000 ms.
- **Partículas / capas secundarias:** Hojas que flotan; anillo verde pequeño al armarse.
- **Ícono 16x16:** cepo de raíces. (hoy: glifo píxel `trap+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única trampa estática en el suelo del kit; la Lluvia cae desde arriba.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Trampa de Área de Kael y Raíces de paso de Maura: Kael = rombo verde neón con cadena; Maura = línea de espinas; esta es un cepo circular de raíces.

### Hab. 3 - Lluvia de la Cazadora

- **Mecánica (código):** Zona de radio 180 u (alcance 220 u) con demora de 900 ms; al cumplirse recibe 12 impactos de 28% repartidos (prioriza a su Presa si está en el área). Costo 42, cooldown 12000 ms. *(`champions.js:171`, `abilities.js:591-601`, `cazadora.js:13-50`, premarcado `aim-targeting.js:19`)*
- **Silueta y forma:** Cortina de flechas verticales cayendo desde arriba fuera de pantalla sobre un círculo punteado de 180 u; las flechas se clavan formando un patrón de hierba.
- **Color dominante:** Verde brillante `#8fd45a` (el color de la zona actual) con núcleo claro.
- **Movimiento:** Las 12 flechas caen escalonadas en los últimos ~350 ms de los 900 ms (el daño llega junto con el último impacto); se clavan y vibran.
- **Anticipación:** 900 ms reales (`abilities.js:595`): círculo punteado + sombras de flechas que se acercan, 5 cuadros.
- **Impacto:** Impactos y polvo, 4 cuadros.
- **Disipación:** Las flechas se desvanecen en hojas, 5 cuadros.
- **Cuadros sugeridos:** anticipación 5 + impacto 4 + disipación 5 = 14 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 240x240 px (diámetro 360u = 2 x r 180u; 1,5 u/px)
- **Loop:** Sí: sombras de aviso en loop de 4 cuadros durante la demora.
- **Partículas / capas secundarias:** Polvo, hojas, hierba aplastada; ya existen 3 sprites `rain-f1..f3`.
- **Ícono 16x16:** lluvia de flechas. (hoy: glifo píxel `rain`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que cae desde arriba y la única con 12 elementos escalonados; la Trampa es un cepo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Error 404 de Axiom (zona con demora de 900 ms) y Cielo de Plumas de Saelis: ventana glitch cian y plumas azules; esta son flechas verdes.

### Definitiva - Cacería Salvaje

- **Mecánica (código):** Durante 8000 ms: Impulso al máximo fijo, +30% velocidad, +35% velocidad de ataque, +20% crítico, +15% alcance, puede correr y disparar, y un Lobo Espectral (300 u/s, muerde cada 850 ms, ralentiza 40% 1500 ms) persigue a su Presa. Sin costo, cooldown 32000 ms. *(`champions.js:173`, `abilities.js:603-613`, `cazadora.js:161-196`)*
- **Silueta y forma:** Espíritu de manada: un lobo espectral turquesa (40x28 u) con la silueta de los arcos de la luna, y una aura verde de hojas en torno a Sylva.
- **Color dominante:** Verde `#5c9a4a` con turquesa espectral `#5ad0c8` en el lobo.
- **Movimiento:** El lobo emerge del suelo con aullido y corre estelas de hojas; Sylva deja huellas de zarpa brillando bajo sus pies al correr.
- **Anticipación:** Pose de 650 ms: aullido, la luna se asoma en el suelo (círculo luminoso), 6 cuadros.
- **Impacto:** Aparición del lobo, 6 cuadros; mordida con rasguño, 3 cuadros.
- **Disipación:** Al terminar el lobo se disuelve en hojas, 6 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 9 + disipación 6 = 21 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** lobo 40x28 u -> 32x24 px por pose (corre, salta, muerde) + aura de Sylva 64x80 px + círculo de aullido Ø120 px
- **Loop:** Sí: lobo corriendo (loop 8 cuadros) y aura de Sylva (loop 8 cuadros) durante 8000 ms.
- **Partículas / capas secundarias:** Huellas luminosas, hojas arrastradas, chispas turquesa en las mordidas.
- **Ícono 16x16:** garras con una llama. (hoy: glifo píxel `claws+flame`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** La única con una criatura aliada que se mueve sola; el resto de su kit son proyectiles y zonas.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Gólem de Carne de Nigromante y los Granaderos espectrales del Libertador (invocaciones/espectros): el gólem es carne y piedra, los granaderos azules; el lobo es turquesa translúcido.

### Pasiva - Instinto de Caza (Presa / Rastreo / Impulso)

- **Mecánica (código):** Cada impacto suma una marca de Rastreo (0-5) sobre la Presa y el Impulso sube moviéndose y atacando (0-10): cada marca da +3,5% velocidad de ataque y +4% velocidad, con 5 marcas +18% crítico; cada punto de Impulso +1,4% velocidad de ataque y +1% velocidad (`champion-tuning.js:66-69`; `cazadora.js:78-127`).
- **Arte:** Presa: marca de punta de flecha de 12 px sobre el enemigo (verde) con hasta 5 muescas; Impulso: estela de huellas en el suelo que se alarga con cada punto. No se verificó cómo se dibuja hoy la Presa en el motor: pedir confirmación antes de rediseñar.
