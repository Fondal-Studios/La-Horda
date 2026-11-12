# San Martín, el Libertador (`libertador`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Tirador / Guerrero / Soporte ofensivo: disparos lentos y devastadores, bayoneta, mando y caballería. (categoría `asesino`) · ataque básico a distancia (alcance 380 u).
- **Color de clase:** `#2f4f9a` · brillo `#9fc4ff`.
- **Origen:** Del otro lado de la Cordillera. José de San Martín ya cruzó una cordillera entera para liberar a medio continente. Ahora cruza otra, más extraña, para llegar a la Ciudad Maldita. Castiga con disparos lentos y devastadores, y lidera cargas capaces de quebrar ejércitos. Frente a la Horda repite lo mismo que dijo siempre: seamos libres, que lo demás no importa nada.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/libertador.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/libertador/v2/atlas.png` (celda 103×98, 8 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py libertador --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/libertador.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Tirador / guerrero / soporte ofensivo (rol asesino, disparos lentos y devastadores, bayoneta, mando y caballería). Tono: solemne, disciplinado y épico; cruzar la cordillera. Lenguaje: sol de mayo, pólvora, bayoneta, clarín, caballo blanco, nieve.
- **Paleta sugerida:** azul patria `#2f4f9a` (color de clase, `champions.js:191`), azul claro `#6ea0e8`/`#9fc4ff`, blanco `#f4f8ff`, oro del sol `#f2c14e` (disparo de oficial `#ffd66b`), humo de pólvora `#fff1c2` y gris, rojo oscuro `#3c0c24` (atlas), contorno `#0e1c3c`.
- **Motivos visuales:** sol de mayo con rayos, humo de pólvora en aros, bayoneta, clarín, caballo blanco al galope, cordillera nevada, granaderos espectrales azules.
- **NO debe parecerse a:** **Ilkan** (pendón y desierto, no azul); **Mago/Thalen** (hielo cian cristalino: la nieve del Libertador es blanca, en copos y sin facetas); **Aldric/Bront** (acero azul): el azul del Libertador es de tela y de cielo, mate, con oro y blanco; **Musashi** (azul tinta).
- **Estado actual del VFX (verificado en código):** Tema procedural `patria` (`themes.js:22`, forma `sun`, motivos sun/smoke/star/hoof). `skill-fx-a/c/libertador.js`: Bayoneta = haz 44 u de 190 u, Granaderos = nova de 430 u, San Lorenzo = haz de 64 u y 430 u, Andes = nova 210. El juego ya tiene efectos propios (granaderos espectrales, jinetes, parches de escarcha) en `js/champions/libertador.js` (`pushChampFx`) y hojas en `tools/art/redraw/build_se.py`.
- **Fuentes del kit:** `js/data/champions.js:190-204`, balance `js/data/champion-tuning.js:13-31` (`SM_CFG`), `js/champions/libertador.js:56-90` (fusil), `:95-150` (habilidades), `:175-243` (cargas), `:244-260` (Cabral).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Bayoneta | Mantené para apuntar y soltá: embestida corta con la bayoneta. Mucho daño, sangrado y un pequeño tambaleo; se detiene al conectar | `sm_bayonet` | 190 u |
| ¡Granaderos, a la carga! | Levanta el sable, suena el clarín y aparecen Granaderos espectrales: +velocidad, +velocidad de ataque, +daño y resistencia al control para vos y tus aliados cercanos | `sm_granaderos` | 430 u |
| Carga de San Lorenzo | Monta su caballo blanco y carga en línea: atraviesa y empuja a los comunes, aturde a los élite y baja la defensa de los jefes | `sm_san_lorenzo` | 430 u |
| **Cruce de los Andes** (definitiva) | Carga con Granaderos espectrales entre nieve y escarcha y queda 10 s a caballo: sable corvo, más velocidad y daño, menos daño recibido | `sm_andes_ult` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

Bloques de cuerpo abiertos para este campeón (de `docs/production/asset-blocks.json`):

- **B004** (P0, EN_CORRECCION): ataque_abajo
- **B004** (P0, EN_CORRECCION): ataque_arriba
- **B004** (P0, EN_CORRECCION): golpe
- **B004** (P0, EN_CORRECCION): muerte

- Habilidades registradas: Bayoneta, ¡Granaderos, a la carga!, Carga de San Lorenzo; definitiva: Cruce de los Andes.
- Skins/sets registrados: Granadero del Alba (`granadero`, set), Casaca de los Andes (`libertador_escarcha`, skin), Guardia del Monte (`libertador_ancestral`, skin).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

> **Atlas con rejilla propia (8 columnas, celda 103×98):** la pose N de abajo está en la celda `fila × 8 + columna` de ESTE atlas; los comandos ya traen ese índice. La numeración de los cuadros del título es la del atlas estándar 4×9.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 0 && node tools/art-world/runway-guardian.js libertador f00_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 1 && node tools/art-world/runway-guardian.js libertador f01_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 2 && node tools/art-world/runway-guardian.js libertador f02_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 3 && node tools/art-world/runway-guardian.js libertador f03_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 8 && node tools/art-world/runway-guardian.js libertador f04_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f08_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 9 && node tools/art-world/runway-guardian.js libertador f05_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f09_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 10 && node tools/art-world/runway-guardian.js libertador f06_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f10_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 11 && node tools/art-world/runway-guardian.js libertador f07_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f11_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 16 && node tools/art-world/runway-guardian.js libertador f08_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f16_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 17 && node tools/art-world/runway-guardian.js libertador f09_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f17_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 18 && node tools/art-world/runway-guardian.js libertador f10_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f18_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 19 && node tools/art-world/runway-guardian.js libertador f11_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f19_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 24 && node tools/art-world/runway-guardian.js libertador f12_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f24_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 25 && node tools/art-world/runway-guardian.js libertador f13_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f25_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 26 && node tools/art-world/runway-guardian.js libertador f14_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f26_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 27 && node tools/art-world/runway-guardian.js libertador f15_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f27_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 32 && node tools/art-world/runway-guardian.js libertador f16_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f32_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 33 && node tools/art-world/runway-guardian.js libertador f17_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f33_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 34 && node tools/art-world/runway-guardian.js libertador f18_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f34_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 35 && node tools/art-world/runway-guardian.js libertador f19_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f35_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 40 && node tools/art-world/runway-guardian.js libertador f20_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f40_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 41 && node tools/art-world/runway-guardian.js libertador f21_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f41_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 42 && node tools/art-world/runway-guardian.js libertador f22_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f42_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 43 && node tools/art-world/runway-guardian.js libertador f23_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f43_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 48 && node tools/art-world/runway-guardian.js libertador f24_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f48_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 49 && node tools/art-world/runway-guardian.js libertador f25_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f49_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 50 && node tools/art-world/runway-guardian.js libertador f26_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f50_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 51 && node tools/art-world/runway-guardian.js libertador f27_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f51_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 56 && node tools/art-world/runway-guardian.js libertador f28_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f56_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 57 && node tools/art-world/runway-guardian.js libertador f29_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f57_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 58 && node tools/art-world/runway-guardian.js libertador f30_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f58_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 59 && node tools/art-world/runway-guardian.js libertador f31_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f59_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 64 && node tools/art-world/runway-guardian.js libertador f32_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f64_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 65 && node tools/art-world/runway-guardian.js libertador f33_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f65_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 66 && node tools/art-world/runway-guardian.js libertador f34_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f66_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py libertador && python3 tools/art/pose-ref.py libertador 67 && node tools/art-world/runway-guardian.js libertador f35_a1 "<prompt>" art-source/runway-codex-clean/libertador.png art-source/runway-pose-refs/libertador/f67_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (San Martín, el Libertador, assassin, class color #2f4f9a), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
