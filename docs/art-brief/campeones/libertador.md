# El Libertador (San Martín) (`libertador`) - brief de arte de habilidades

> Formato técnico (canvas, paleta, export, nombres de archivo, fps, alfa): `docs/art-brief/00_ESPECIFICACION_TECNICA.md` (escrito por otro agente; este brief no lo duplica y, si difiere, manda esa especificación).
> Reglas de este documento: los números de mecánica son los del código (alcance, radio, duración en **unidades de mundo (u)** y milisegundos) con la fuente `archivo:linea`. El resto (colores, cuadros, tamaños en px, tiempos de anticipación del arte) es **dirección/sugerencia** para el artista, no mecánica. Tamaño en px = diámetro o largo en u dividido por 1,5 u/px (hasta 360 u), 2 u/px (hasta 640 u) o 3 u/px (más grande), redondeado a múltiplo de 8; el personaje mide ~70 px para ~66-70 u (ART_BIBLE s.2; `refH:70` en `js/assets/quality-five-collection-meta.js:142`), o sea ~1 u/px, y el motor procedural actual usa 1,4 a 4,5 u/px (`js/champions/skill-fx-a/engine.js:277`). Las habilidades que apuntan tienen premarcado propio del juego (perfiles en `js/skills/aim-targeting.js`); el arte no lo reemplaza.
> Índice con todas las habilidades de la mitad A y colisiones a evitar: `INDEX_A.md`.

## A. Identidad

- **Rol y tono:** Tirador / guerrero / soporte ofensivo (rol asesino, disparos lentos y devastadores, bayoneta, mando y caballería). Tono: solemne, disciplinado y épico; cruzar la cordillera. Lenguaje: sol de mayo, pólvora, bayoneta, clarín, caballo blanco, nieve.
- **Paleta sugerida:** azul patria `#2f4f9a` (color de clase, `champions.js:191`), azul claro `#6ea0e8`/`#9fc4ff`, blanco `#f4f8ff`, oro del sol `#f2c14e` (disparo de oficial `#ffd66b`), humo de pólvora `#fff1c2` y gris, rojo oscuro `#3c0c24` (atlas), contorno `#0e1c3c`.
- **Motivos visuales:** sol de mayo con rayos, humo de pólvora en aros, bayoneta, clarín, caballo blanco al galope, cordillera nevada, granaderos espectrales azules.
- **NO debe parecerse a:** **Ilkan** (pendón y desierto, no azul); **Mago/Thalen** (hielo cian cristalino: la nieve del Libertador es blanca, en copos y sin facetas); **Aldric/Bront** (acero azul): el azul del Libertador es de tela y de cielo, mate, con oro y blanco; **Musashi** (azul tinta).
- **Estado actual del VFX (verificado en código):** Tema procedural `patria` (`themes.js:23`, forma `sun`, motivos sun/smoke/star/hoof). `skill-fx-a/c/libertador.js`: Bayoneta = haz 44 u de 190 u, Granaderos = nova de 430 u, San Lorenzo = haz de 64 u y 430 u, Andes = nova 210. El juego ya tiene efectos propios (granaderos espectrales, jinetes, parches de escarcha) en `js/champions/libertador.js` (`pushChampFx`) y hojas en `tools/art/redraw/build_se.py`.
- **Fuentes del kit:** `js/data/champions.js:190-204`, balance `js/data/champion-tuning.js:13-31` (`SM_CFG`), `js/champions/libertador.js:56-90` (fusil), `:95-150` (habilidades), `:175-243` (cargas), `:244-260` (Cabral).

## B. Habilidades

### Básico - Fusil de Granadero

- **Mecánica (código):** Disparo lento y potente; alcance 380 u, recarga 1450 ms, bala a 1000 u/s (vida 520 ms). Cada 4 impactos el siguiente es un Disparo de Oficial (x2,2, perfora 1 más, crítico). Montado: Sable corvo, arco de 98 u cada 560 ms. *(`champions.js:196`, `champion-tuning.js:15-17,30-31`, `libertador.js:56-90`)*
- **Silueta y forma:** Fogonazo con aro de humo y bala con estela; el Disparo de Oficial lanza un rayo dorado con corona de sol que perfora.
- **Color dominante:** Humo `#fff1c2` y gris; Oficial: oro `#ffd66b`.
- **Movimiento:** Retroceso corto (5 px), fogonazo y bala rapidísima; el aro de humo sube y se deshace.
- **Anticipación:** Se apunta (120 ms), 2 cuadros.
- **Impacto:** Fogonazo + bala, 3 cuadros; impacto 3 cuadros.
- **Disipación:** El aro de humo se ensancha y se disipa en 6 cuadros.
- **Cuadros sugeridos:** anticipación 2 + impacto 6 + disipación 6 = 14 cuadros (+ 3 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 32x32 px (40u x 40u; 1,5 u/px)
- **Loop:** Proyectil en loop de 3 cuadros; el Oficial es otro sprite (más largo, 64x16 u) con rayos de sol.
- **Partículas / capas secundarias:** Humo, chispas, retroceso y sacudida (2/4 px). El Sable corvo: arco de 98 u azul y blanco.
- **Ícono 16x16:** fusil. (hoy: glifo píxel `rifle`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es el único disparo lento con humo y recarga larga; las habilidades son carga, formación y caballería.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a la Flecha de Sylva y el Paquete de Axiom: flecha con plumas y cubo glitch; esta es una bala con humo de pólvora.

### Hab. 1 - Bayoneta

- **Mecánica (código):** Mantener para apuntar y soltar: embestida corta de 190 u a 950 u/s; daño 250%, sangrado 3000 ms, tambaleo 350 ms; se detiene al conectar; ejecución visual si el objetivo queda bajo 15%. Costo 24, cooldown 5500 ms. *(`champions.js:199`, `champion-tuning.js:19`, `libertador.js:99-107,196-209`, premarcado `aim-targeting.js:37`)*
- **Silueta y forma:** Estocada: un trazo recto de acero blanco-azulado de 190 u con la hoja de bayoneta en la punta; al impactar un destello en cruz.
- **Color dominante:** Acero blanco-azulado `#f4f8ff` con filo `#6ea0e8`.
- **Movimiento:** Se agacha, parte con una ráfaga rápida (200 ms) y se detiene en seco al clavar; polvo en los pies.
- **Anticipación:** Pose de agachado, 2 cuadros (~90 ms).
- **Impacto:** Embestida y estocada con destello en cruz, 3 cuadros.
- **Disipación:** Sale la hoja y cae una gota (sangrado) que se repite durante 3000 ms (loop 3 cuadros).
- **Cuadros sugeridos:** anticipación 2 + impacto 3 + disipación 4 = 9 cuadros (+ 3 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 128x32 px (190u x 48u; 1,5 u/px)
- **Loop:** Solo el sangrado sobre el objetivo (loop 3 cuadros).
- **Partículas / capas secundarias:** Polvo bajo los pies, mini-estampido de impacto.
- **Ícono 16x16:** fusil con bayoneta. (hoy: glifo píxel `rifle`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es el único trazo recto de acero y la única con parada al impacto; la 3 es una carga ancha de caballo.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a la Lanza-Pendón de Ilkan y el Corte del Rōnin de Musashi (dashes de corte): lanza con pendón ocre y tajo de tinta; esta es una estocada de acero con destello en cruz.

### Hab. 2 - ¡Granaderos, a la carga!

- **Mecánica (código):** Buff de equipo en radio 430 u durante 8000 ms: +20% velocidad, +15% velocidad de ataque, +15% daño, 40% resistencia al control; aparecen 5 Granaderos espectrales a 90 u (1500 ms) y un anillo azul claro de 430 u (600 ms). Costo 36, cooldown 16000 ms. *(`champions.js:200`, `champion-tuning.js:21`, `libertador.js:109-127`)*
- **Silueta y forma:** Formación: cinco granaderos fantasma azules (40x56 u) con fusil al hombro marchan en abanico; un anillo de luz celeste se expande hasta 430 u con sol de mayo en el centro; sobre los aliados queda un penacho dorado.
- **Color dominante:** Azul real `#2f4f9a` con anillo celeste `#9fc4ff` y oro `#f2c14e`.
- **Movimiento:** Un toque de clarín (520 ms): el sol se abre, los granaderos aparecen en fila y avanzan 40 u; los aliados reciben un brillo dorado en la cabeza durante 8000 ms.
- **Anticipación:** Pose de clarín, 5 cuadros (~520 ms).
- **Impacto:** Aparición de granaderos y anillo, 4 cuadros.
- **Disipación:** Los granaderos se desvanecen marchando, 5 cuadros; el penacho se apaga.
- **Cuadros sugeridos:** anticipación 5 + impacto 4 + disipación 5 = 14 cuadros (+ 8 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 288x288 px (diámetro 860u = 2 x r 430u; 3 u/px)
- **Loop:** Sí: penacho dorado en aliados (loop de 8 cuadros, 8000 ms).
- **Partículas / capas secundarias:** Notas de clarín, polvo de marcha, destellos de bayonetas.
- **Ícono 16x16:** bala con una flecha. (hoy: glifo píxel `ball+arrow`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con figuras humanas (los granaderos) y la más grande del kit humano (430 u).
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Bendición Suprema de Elyra y Gran Teatro de Velmira (buffs grandes): luz verde y máscaras; esta es una formación militar azul con sol.

### Hab. 3 - Carga de San Lorenzo

- **Mecánica (código):** Monta (260 ms), carga 430 u a 880 u/s en una franja de 64 u, atraviesa y empuja 80 u a comunes, aturde 650 ms a élites y baja 20% la defensa de jefes 4000 ms, daño 190%; desmonta (280 ms). Costo 40, cooldown 12000 ms. *(`champions.js:201`, `champion-tuning.js:23-24`, `libertador.js:129-142,213-232`, premarcado `aim-targeting.js:38`)*
- **Silueta y forma:** Caballo blanco al galope (80x56 u) con el Libertador y el sable en alto; levanta una estela ancha de polvo y tierra de 64 u.
- **Color dominante:** Blanco `#f4f8ff` con polvo arena `#e6d2aa`.
- **Movimiento:** Sale de la pose de montar en 260 ms y galopa en línea recta; las pezuñas dejan marcas; al detenerse el caballo se levanta en dos patas.
- **Anticipación:** Montar: saltar al caballo, 3 cuadros (~260 ms).
- **Impacto:** Galope (loop de 4 cuadros) y choque con onda de polvo, 4 cuadros.
- **Disipación:** Desmontar y polvo, 4 cuadros.
- **Cuadros sugeridos:** anticipación 3 + impacto 4 + disipación 4 = 11 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** 216x32 px (430u x 64u; 2 u/px)
- **Loop:** Sí: galope en loop de 4 cuadros durante la carga (~490 ms).
- **Partículas / capas secundarias:** Polvo, pezuñas, sacudida de pantalla 5 px al final.
- **Ícono 16x16:** bota con un rayo. (hoy: glifo píxel `boots+bolt`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con una montura completa y de color blanco; la Bayoneta es acero y corta.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente a Embestida de Aldric y Cabalgar la Ola de Facu (cargas lineales): tanque con escudo y cresta de agua; esta es caballería blanca con polvo.

### Definitiva - Cruce de los Andes

- **Mecánica (código):** Pose de 950 ms; carga de 640 u en 1250 ms con 12 jinetes espectrales en una franja de 240 u: daño 420%, empuja 110 u, aturde 900 ms a élites, baja 25% la defensa de jefes 6000 ms, deja 10 parches de escarcha 7000 ms; luego 10000 ms a caballo (+40% velocidad, +25% daño, -20% daño recibido). Sin costo, cooldown 45000 ms. *(`champions.js:203`, `champion-tuning.js:28-31`, `libertador.js:143-148,175-190`)*
- **Silueta y forma:** Una cordillera nevada se alza detrás y un sol de mayo gigante sale entre los picos; 12 jinetes fantasma azules con banderas avanzan en línea ancha entre nieve y escarcha; el Libertador al frente con el sable en alto.
- **Color dominante:** Blanco nieve `#f4f8ff`, azul `#2f4f9a`/`#9fc4ff`, oro del sol `#f2c14e`.
- **Movimiento:** Se levanta el sable (950 ms) y la cordillera surge; la carga recorre 640 u dejando nieve; al final los parches de escarcha quedan 7000 ms.
- **Anticipación:** Pose de 950 ms: sable al cielo, el sol asoma entre las montañas, 8 cuadros.
- **Impacto:** Carga: jinetes y nieve, 8 cuadros (loop corto de 4 mientras avanzan 1250 ms).
- **Disipación:** Los jinetes se desvanecen en copos; la escarcha queda y se funde, 8 cuadros.
- **Cuadros sugeridos:** anticipación 8 + impacto 8 + disipación 8 = 24 cuadros (+ 4 de loop sostenido)
- **Tamaño sugerido del asset (px nativos):** franja de carga 640x240 u -> 320x120 px (2 u/px) + 12 jinetes 56x64 u -> 40x40 px + fondo cordillera 400x120 px + parches de escarcha Ø64 px (x10)
- **Loop:** Sí: jinetes en loop de 4 cuadros durante la carga; los parches de escarcha son loop de 6 cuadros (7000 ms).
- **Partículas / capas secundarias:** Nieve (70 copos), bandera ondeando, sacudida 8 px y flash azul de pantalla (ya existen en el motor).
- **Ícono 16x16:** montaña con una flecha arriba. (hoy: glifo píxel `mountain+up`, motivo 12x12 + insignia 4x4, `js/ui/skill-pixel-glyphs.js:164`)
- **Se distingue de las otras del mismo campeón:** Es la única con paisaje (cordillera y sol) y 12 figuras; la Carga de San Lorenzo es una sola montura.
- **Se distingue de la habilidad más parecida de otro campeón:** Frente al Cataclismo Elemental de Mago y la Hora imposible de Aelith (definitivas espectaculares): tormenta elemental y reloj; esta es una carga de caballería entre montañas.

### Pasiva - Soldado Cabral

- **Mecánica (código):** Una vez por partida, al recibir un golpe mortal queda con 1 de vida, es invulnerable 2000 ms y gana +30% velocidad 3000 ms, con un soldado espectral que lo cubre (`champion-tuning.js:26`, `libertador.js:244-256`).
- **Arte:** Un granadero espectral azul de 40x56 u salta ante él y absorbe el golpe: escudo celeste (loop 6 cuadros, 2000 ms) con destello `159,196,255` y la leyenda SOLDADO CABRAL; ya hay un anillo de 90 u de 500 ms en el motor.
