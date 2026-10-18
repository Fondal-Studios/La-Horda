# Thalen, el Tejedor Elemental (`mago`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Mago elemental (rol mago, daño mágico, área y control, a distancia). Tono: elegante, seguro y teatral; combina fuego, hielo y rayo, "la Torre de las Dos Llamas". Lenguaje: sombrero puntiagudo, elementos puros, reacciones.
- **Paleta sugerida:** violeta arcano `#a15fc7` (color de clase, `champions.js:59`) y `#d9a9f0`; fuego `#ff6a3d` / `#ffc36a`; hielo `#7ad0ff` / `#cff3ff`; rayo `#ffe36a` / `#6a58d8`; azul noche `#242454` (atlas), contorno `#0c0c24`.
- **Motivos visuales:** llama, copos de escarcha, relámpago, sombrero arcano, círculos mágicos de runas, vapor (reacción fuego + hielo).
- **NO debe parecerse a:** **Aelith** (lavanda pálida con relojes: el violeta de Thalen es saturado y solo para su proyectil); **Axiom** (turquesa digital); **Segador/Brasa** (rojo y naranja de fuego industrial): el fuego de Thalen es llama pura y limpia sin vapor ni engranajes; **Libertador/Bront** (azules metálicos): el hielo de Thalen es cian translúcido con cristales.
- **Estado actual del VFX (verificado en código):** Tres temas procedurales `fire`/`frost`/`storm` (`themes.js:24-26`). El juego YA tiene arte propio fuerte: sprites animados `MuroFuego` (formación, activo, extinción; `mago.js:drawFireWall`), `frostNovaVFX` y `cataclysmVFX` con tiers por talento, y PNG `assets/vfx/skills/` (`nova_escarcha`, `nova_hielo`, `ventisca`, `armadura_hielo`). `skill-fx-a/c/mago.js` solo añade una nova procedural por habilidad. Este brief fija lo que el artista debe mantener y diferenciar.
- **Fuentes del kit:** `js/data/champions.js:58-69`, `js/skills/abilities.js:852-880` (cadena), `:1091-1135` (muro, nova, cataclismo), `js/champions/mago.js:8-89`, premarcado `aim-targeting.js:15,30`.

## B. Habilidades

### Básico - Proyectil Arcano

- **Mecánica (código):** Disparo mágico a distancia contra el enemigo más cercano; alcance 340 u, cooldown 560 ms. *(`champions.js:62`, `champion-identity.js:36`)*
- **Silueta y forma:** Orbe de energía violeta de 12 u con un pequeño anillo orbital y estela corta.
- **Color dominante:** Violeta `#a15fc7` con núcleo `#d9a9f0`.
- **Movimiento:** Vuelo recto con el anillo rotando.
- **Anticipación:** Chispa violeta en la punta del bastón, 2 cuadros.
- **Impacto:** Estallido de 6 chispas, 3 cuadros.
- **Disipación:** Las chispas se apagan.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 24x24 px (36u x 36u; 1,5 u/px)
- **Loop:** Proyectil en loop de 4 cuadros.
- **Partículas / capas secundarias:** Chispas violeta, sin elemento (el color no debe parecer fuego/hielo/rayo).
- **Ícono 16x16:** orbe con anillo. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Único violeta del kit; las habilidades son naranja, cian, amarilla y mixta.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Segundo robado de Aelith y el Paquete de Axiom: aquellos son gota de arena y cubo; este es un orbe violeta saturado.

### Hab. 1 - Muro de Fuego

- **Mecánica (código):** Anillo de fuego en un punto (alcance 190 u, entre 38 u y 82 u de radio, es decir una corona de 44 u de ancho) durante 4500 ms; quema cada 450 ms (daño 42%) a quien lo pise. Aparece en 300 ms y se apaga en los últimos 500 ms. Costo 42, cooldown 9000 ms. *(`champions.js:64`, `abilities.js:1091-1107`, `mago.js:8-89`, premarcado `aim-targeting.js:15`)*
- **Silueta y forma:** Corona de llamas: entre 16 y 28 lenguas de fuego (según el tier de talento) alrededor de un centro libre, con brasas y humo en los tiers altos.
- **Color dominante:** Naranja `#ff6a3d` con núcleo `#ffc36a`.
- **Movimiento:** Las llamas nacen en secuencia horaria (300 ms), danzan, giran lento (0,12 rad/s) y se apagan en 500 ms.
- **Anticipación:** Anillo punteado naranja que se dibuja (500 ms de aviso `warnRing`), 3 cuadros.
- **Impacto:** Formación de llamas, 3 cuadros (las 3 etapas del sprite `MuroFuego`: formacion, activo, extincion).
- **Disipación:** Extinción: las lenguas se achican a brasas, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 3 + disipación 4 = 10 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 112x112 px (diámetro 164u = 2 x r 82u; 1,5 u/px)
- **Loop:** Sí: llamas activas en loop de 8 cuadros durante 4500 ms (ya existe `MuroFuego.activo`).
- **Partículas / capas secundarias:** Brasas, humo (tier 4), resplandor cálido del suelo; con el Único "Fuego del Vacío" cambia a violeta (se hace con filtro de color, no hace falta otro arte).
- **Ícono 16x16:** llama. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Es la única corona de fuego persistente con centro libre; la Nova es instantánea y la Cadena es un rayo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Purga de Vapor de Brasa y Resina de Morwen (zonas calientes): vapor blanco y vidrio; esta es una corona de llamas puras.

### Hab. 2 - Nova de Escarcha

- **Mecánica (código):** Nova centrada en él, radio 125 u: daño 105% y congela (ralentización de 92%) durante 1900 ms; un aturdimiento breve en el 45% central con el talento Escarcha Paralizante. Costo 40, cooldown 8200 ms. *(`champions.js:65`, `abilities.js:1107-1122`)*
- **Silueta y forma:** Flor de hielo: 8 pétalos de cristal que salen del centro en estrella y un anillo de copos que se expande hasta 125 u; los enemigos quedan encerrados en bloques de hielo.
- **Color dominante:** Cian `#7ad0ff` con brillo `#cff3ff`.
- **Movimiento:** Los pétalos se disparan en 200 ms, el anillo de copos los alcanza y todo "se congela" quieto (hielo estático) 1900 ms antes de romperse.
- **Anticipación:** Cristales que brotan en los pies, 3 cuadros.
- **Impacto:** Estrella y anillo hasta 125 u, 4 cuadros (ya existen `nova_escarcha`, `nova_hielo`).
- **Disipación:** El hielo se fisura y estalla en esquirlas, 5 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 5 = 12 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 168x168 px (diámetro 250u = 2 x r 125u; 1,5 u/px)
- **Loop:** Sí: los bloques de hielo sobre enemigos en loop de 6 cuadros (1900 ms).
- **Partículas / capas secundarias:** Esquirlas, copos, vapor frío al romperse.
- **Ícono 16x16:** copo de nieve. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Es la única fría y la única que "congela" en estático.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Presión Abisal de Facu y Ciudadela de Bront (azules): agua oscura y acero; esta es hielo cristalino cian con copos.

### Hab. 3 - Cadena de Relámpago

- **Mecánica (código):** Rayo que salta entre hasta 4 enemigos (+ bonus) en un radio de 190 u por salto, partiendo del objetivo a ≤340 u, con 78% del daño por salto; electrifica a cada impactado 500-860 ms. Costo 42, cooldown 5800 ms. *(`champions.js:66`, `abilities.js:852-880`, premarcado `aim-targeting.js:30`)*
- **Silueta y forma:** Rayo en zigzag grueso (el grosor sube con el tier) entre los enemigos, con un destello estrellado en cada impacto y chispas que se quedan sobre ellos.
- **Color dominante:** Amarillo `#ffe36a` con núcleo blanco y contorno violeta `#6a58d8`.
- **Movimiento:** Cada salto dura ~100 ms y es irregular; los impactados quedan "electrificados" con chispas giratorias.
- **Anticipación:** Chispa en la mano, 2 cuadros.
- **Impacto:** Rayo + destello por cada salto, 3 cuadros por tramo.
- **Disipación:** Los arcos se apagan y las chispas persisten ~500 ms, 3 cuadros.
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 3 = 8 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 232x32 px (340u x 40u; 1,5 u/px)
- **Loop:** Solo las chispas sobre enemigos (loop 4 cuadros).
- **Partículas / capas secundarias:** Destellos de 46-126 px según tier, trueno visual.
- **Ícono 16x16:** rayo con una cadena. (el ataque básico no tiene entrada en `SKILL_PIXEL_MAP`, `js/ui/skill-pixel-glyphs.js:164`; ícono opcional)
- **Se distingue de las otras del mismo campeón:** Es el único rayo y el único amarillo; salta entre objetivos, no cubre zona.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Sobrescribir de Axiom y Tensión de Iria (líneas entre objetivos): cadena magenta en escuadra e hilo lila; este es un relámpago amarillo en zigzag.

### Definitiva - Cataclismo Elemental

- **Mecánica (código):** Radio 230 u: 3 novas de hielo (a los 0, 1000 y 2000 ms; congelación 70% 1300 ms) más una lluvia de rayos durante 5000 ms (cada 420 ms, daño 85%), quemadura, ralentización 45% y armadura de fuego +25% para él. Costo: ninguno, cooldown 32000 ms. *(`champions.js:68`, `abilities.js:1124-1155`)*
- **Silueta y forma:** Los tres elementos juntos: tres anillos de hielo expandiéndose, una tormenta de rayos que cae dentro de la zona y un manto de fuego que cubre a Thalen como armadura; el cielo se pone violeta.
- **Color dominante:** Violeta `#a15fc7` con fuego, hielo y rayo en capas; núcleo blanco.
- **Movimiento:** Nova de hielo (0 ms) → nova (1000) → nova (2000); rayos cada 420 ms sobre puntos al azar; el fuego rodea al personaje todo el tiempo (5000 ms).
- **Anticipación:** Pose de 650 ms: el bastón se alza y los tres elementos giran sobre él, 6 cuadros.
- **Impacto:** Tres novas de 4 cuadros + rayos (loop), 12 cuadros.
- **Disipación:** Todo se funde en vapor violeta y se disipa, 6 cuadros.
- **Cuadros sugeridos:** anticipación 6 + impacto 12 + disipación 6 = 24 cuadros (+ 6 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 232x232 px (diámetro 460u = 2 x r 230u; 2 u/px)
- **Loop:** Sí: tormenta y armadura de fuego en loop de 6 cuadros durante 5000 ms.
- **Partículas / capas secundarias:** Sacudida fuerte, `cataclysmVFX` al nivel máximo (siempre en la definitiva), vapor.
- **Ícono 16x16:** cometa con llama. (hoy: glifo píxel `comet+flame`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única que mezcla los tres elementos; cada habilidad base es un solo elemento.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Force Quit de Axiom y Colapso de Vhal (definitivas de área): negativo de pantalla y estrella; esta es una tormenta elemental violeta.

### Pasiva - Maestro Elemental

- **Mecánica (código):** Sus reacciones elementales (p. ej. Vapor) tienen su bonus x1,5 (+50% pasa a +75%) (`champion-tuning.js:77`, `CLASSIC_PASSIVES.mago`).
- **Arte:** Sin indicador visible verificado. Sugerencia: una nubecita de vapor `#ffffff` de 6 cuadros cuando se produce la reacción (fuego + hielo).
