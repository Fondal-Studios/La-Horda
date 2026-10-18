# Morwen, la Destiladora de Ecos (`morwen`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Alquimista (rol mago, resina, catalizador y reacciones controladas, a distancia). Tono: curiosa, íntima y algo triste; destila las voces del micelio sin entregarse a la Madre Espora. Lenguaje: frasco, vidrio, burbuja, serpentina, eco.
- **Paleta sugerida:** ciruela `#a46191` (tema `alchemy`, `themes.js:28`, y color de clase, `data/portadores.js:37`), crema `#edd0a5`, ciruela oscuro `#6e3a60`, menta `#7ae0b0` (reacción), rojo vino `#84243c` (atlas), contorno `#24101e`, firma de gotas `#cc99ff` (`champion-signatures.js:10`).
- **Motivos visuales:** frascos y retortas de vidrio con tapón, burbujas, gotas pesadas, serpentina de destilación, alambique, caras tenues dentro del líquido (los ecos).
- **NO debe parecerse a:** **Solciju** (vino y barricas, mitad B: sus rojos `#923951` están cerca de la ciudad de Morwen; Morwen es ciruela y vidrio con menta, nunca barril ni copa); **Brasa** (latón y vapor); **Iria** (índigo); **Morveth** (verde peste y hongos): el verde de Morwen es una menta clara SOLO en las reacciones.
- **Estado actual del VFX (verificado en código):** Tema procedural `alchemy` (`themes.js:28`, forma `hex`, motivos flask/bubble/drop/spark). `skill-fx-a/c/morwen.js`: Resina = nova del radio real, Sal = cono, Destilación = aura + estallido, Alambique = prop con motivo "flask" (`SFA_OBJ.alembic`) + nova 170. Firma `drops` `#cc99ff` (`skills/champion-signatures.js:10`).
- **Fuentes del kit:** `js/data/portadores.js:37-44`, lanzamiento `js/champions/portadores.js:134-147`, reacción `:62-78`, objetos `:239-`, pasiva `data/portadores-lore.js:28`.

## B. Habilidades

### Básico - Aguja de vidrio

- **Mecánica (código):** Disparo a distancia; alcance 300 u, cooldown 540 ms (arma: Aguja de Vidrio). *(`data/portadores.js:37` (`range:300, basic:540, ranged:true`))*
- **Silueta y forma:** Aguja de vidrio con una gota de reactivo ciruela en la punta (4x14 u) que gira al volar.
- **Color dominante:** Ciruela `#a46191` con vidrio `#edd0a5`.
- **Movimiento:** Vuelo recto con la gota oscilando; deja 2 burbujitas.
- **Anticipación:** Una gota se forma en la aguja, 2 cuadros.
- **Impacto:** Se rompe en un salpicón de gotas, 3 cuadros.
- **Disipación:** Las gotas se evaporan.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 24x24 px (36u x 36u; 1,5 u/px)
- **Loop:** Proyectil en loop de 4 cuadros.
- **Partículas / capas secundarias:** Burbujas, gotas.
- **Ícono 16x16:** gota sobre aguja. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Fina con gota ciruela; las habilidades son frasco, cono de sal, escudo y alambique.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a la Aguja rúnica de Iria: aguja lila con hilo; esta es una aguja de vidrio con una gota pesada.

### Hab. 1 - Resina Amarga

- **Mecánica (código):** Un frasco cae en un punto (alcance 280 u, radio 100 u): daña 75%, ralentiza 30% 1800 ms y marca con Resina 5000 ms (x1,4 si está dentro del Alambique); si el enemigo ya tenía Sal reacciona UNA vez (daño x2,0, vulnerabilidad 16% 2200 ms, +1 residuo, máx. 5). Costo 26, cooldown 6000 ms. *(`data/portadores.js:40`, `portadores.js:134-139,62-78`)*
- **Silueta y forma:** Frasco que describe un arco y se rompe en un charco viscoso ciruela-ámbar de 100 u con burbujas; los enemigos quedan con una película pegajosa; la reacción añade un anillo menta-blanco.
- **Color dominante:** Ciruela `#a46191` y ámbar `#edd0a5`; reacción: menta `#7ae0b0`.
- **Movimiento:** El frasco vuela (250 ms), se rompe con un splat, el charco se extiende en 4 cuadros y las burbujas suben; la reacción es un flash secundario.
- **Anticipación:** Frasco lanzado en arco (parábola de 280 u), 3 cuadros.
- **Impacto:** Splat y charco, 4 cuadros; reacción menta 3 cuadros.
- **Disipación:** El charco se evapora, 5 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 5 = 12 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 136x136 px (diámetro 200u = 2 x r 100u; 1,5 u/px)
- **Loop:** Sí: la película pegajosa sobre enemigos en loop de 6 cuadros (5000 ms).
- **Partículas / capas secundarias:** Burbujas, vidrio roto, destello menta si hay reacción.
- **Ícono 16x16:** frasco con puntos. (hoy: glifo píxel `drop+dots`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que tira un frasco en arco y deja un charco; la 2 es un cono de cristales.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Yogurazo de Myla (splash + charco que ralentiza): yogur rosado y cremoso; esta es resina ciruela con vidrio y burbujas.

### Hab. 2 - Sal de Ruptura

- **Mecánica (código):** Cono de catalizador (alcance 200 u, semiángulo 0,9 rad = 103° de boca): daña 90% y marca con Sal 5000 ms; reacciona con Resina. Costo 30, cooldown 6500 ms. *(`data/portadores.js:41`, `portadores.js:140`, `:49`)*
- **Silueta y forma:** Cuña de cristales de sal blancos y menta (como granizo geométrico) que se dispersa en abanico; los marcados llevan cristalitos pegados.
- **Color dominante:** Menta `#c8f0dc` con cristales `#7ae0b0`.
- **Movimiento:** Los cristales salen disparados en abanico con rebote y se pegan; si hay Resina, un destello menta cruza el campo.
- **Anticipación:** Morwen agita un tubo de ensayo, 3 cuadros.
- **Impacto:** Abanico de cristales, 4 cuadros.
- **Disipación:** Los cristales se funden en gotas, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 136x216 px (radio 200u, ancho de boca 313u, arco 103 grados; 1,5 u/px)
- **Loop:** Solo los cristalitos sobre marcados (loop de 4 cuadros).
- **Partículas / capas secundarias:** Polvo cristalino, destello menta.
- **Ícono 16x16:** cristal con una X. (hoy: glifo píxel `crystal+x`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única blanca-menta y de cristales duros; la 1 es líquida ciruela.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a la Nova de Escarcha de Mago y el Pulso del Cristal de Bront: hielo cian y cristal azul de acero; esta es sal en cristales blancos.

### Hab. 3 - Destilación

- **Mecánica (código):** Consume sus residuos (0-5) para ganar un escudo de 6% + 2,5% por residuo durante 4000 ms y limpia ralentización y quemadura; sin residuos, una cubierta menor. Costo 24, cooldown 10000 ms. *(`data/portadores.js:42`, `portadores.js:141-146`)*
- **Silueta y forma:** Una retorta de vidrio gira sobre su cabeza y baja a envolverla: el vapor se condensa en una esfera de vidrio ciruela transparente con las gotas de los residuos orbitando dentro.
- **Color dominante:** Vidrio lila-rosado `#c9a0bd` con líquido `#a46191`.
- **Movimiento:** Los residuos suben en espiral a la retorta, esta gira y condensa; la esfera queda estable con las gotas girando.
- **Anticipación:** La retorta aparece y gira, 4 cuadros.
- **Impacto:** Se condensa y envuelve, 3 cuadros.
- **Disipación:** La esfera estalla en gotas, 5 cuadros.
- **Cuadros sugeridos:** anticipación 4 + impacto 3 + disipación 5 = 12 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 64x80 px (96u x 112u; 1,5 u/px)
- **Loop:** Sí: esfera con gotas orbitando en loop de 8 cuadros durante 4000 ms (el nº de gotas = residuos usados, 1 a 5).
- **Partículas / capas secundarias:** Gotas (una por residuo), burbujas, brillo de vidrio.
- **Ícono 16x16:** frasco con flecha arriba. (hoy: glifo píxel `flask+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que la envuelve en vidrio y la única que muestra una cuenta (residuos).
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Escudo Sagrado de Elyra y Burbuja Cremosa de Myla: escudos translúcidos de luz y de yogur; este es una esfera de vidrio con gotas.

### Definitiva - Alambique del Silencio

- **Mecánica (código):** Área de radio 170 u (alcance 240 u) durante 8000 ms: cada 600 ms daña 40% a quienes están dentro y prolonga 1500 ms sus marcas de Resina/Sal; cada reacción permite una onda secundaria (30%, 85 u). Sin costo, cooldown 36000 ms. *(`data/portadores.js:43`, `portadores.js:147,62-78,260`)*
- **Silueta y forma:** Un alambique de cobre y vidrio de 100 u de alto sube del suelo: caldero ciruela hirviendo, serpentina que da dos vueltas y un matraz; el círculo de 170 u se vuelve desaturado y silencioso, y cada 600 ms una burbuja explota soltando una silueta de rostro translúcida (un eco) que sube.
- **Color dominante:** Ciruela `#a46191`, cobre-crema `#edd0a5`, rostros menta `#7ae0b0`.
- **Movimiento:** El alambique se arma en 650 ms; el líquido hierve en loop; cada 600 ms sube un rostro y una onda silenciosa de 85 u (anillo sin sonido) en las reacciones.
- **Anticipación:** Pose de 650 ms: las piezas descienden y se ensamblan, 6 cuadros.
- **Impacto:** Hervor y ecos, 6 cuadros por ciclo de 600 ms.
- **Disipación:** El alambique se enfría, la serpentina se rompe y los ecos suben, 8 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 6 + disipación 8 = 20 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 232x232 px (diámetro 340u = 2 x r 170u; 1,5 u/px)
- **Loop:** Sí: alambique en marcha en loop de 8 cuadros durante 8000 ms.
- **Partículas / capas secundarias:** Burbujas, rostros tenues, gotas de destilado, desaturación de la zona.
- **Ícono 16x16:** alambique con anillo. (hoy: glifo píxel `alembic+ring`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con un aparato grande y rostros; el resto del kit son frascos y cristales.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Santa Paciencia de Ynara y El Gran Teatro de Velmira (zonas con figuras): santuario y máscaras; esta es un alambique con rostros que suben.

### Pasiva - Reactivos

- **Mecánica (código):** Resina y Catalizador (Sal) reaccionan una sola vez, se consumen y dejan un residuo; conserva hasta 5 residuos para Destilación (`data/portadores-lore.js:28`, `portadores.js:62-78`).
- **Arte:** Hasta 5 gotas de 4 px que orbitan su cintura (ciruela), una por residuo, con un destello menta al ganar una nueva.
