# Baltra, la Campana Sumergida (`baltra`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Tanque frontal que transforma golpes recibidos en ondas de campana. (categoría `tanque`) · ataque básico cuerpo a cuerpo (alcance 88 u, en arco).
- **Color de clase:** `#8bb4bd` · brillo `#8bb4bd`.
- **Origen:** La costa de la Arena Acuática. Baltra cuidaba la campana de aviso de un poblado de la costa. Cuando el agua apareció donde antes había calles, se ató al badajo para seguir tocando mientras los demás subían. La encontraron dentro de la campana, respirando una bolsa de aire que nadie supo explicar. Convirtió el bronce en escafandra: su señal no promete victoria, promete que alguien sostiene la otra punta.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/baltra.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/baltra/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py baltra --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/baltra.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Tanque frontal (rol tanque, resistencia y control). Tono: terco, solemne, de rescate; "mientras suene, seguí subiendo". Lenguaje: campana de bronce, badajo, cuerda, ondas de sonido bajo el agua.
- **Paleta sugerida:** verde-azulado frío `#8bb4bd` (color de clase, `expedition/catalog.js:19`), bronce `#b46c3c` y cobre `#cc9c54` (atlas), cuero `#6c3c24`, claro `#cfeef0`, contorno `#0f2326`, acento verdín oxidado `#6fae9a`.
- **Motivos visuales:** campana y badajo, cuerda, remaches, anillos de sonido (concéntricos con huecos), burbujas de aire, algas, pequeñas gotas.
- **NO debe parecerse a:** **Bront** (acero azul-grisáceo `#8aa4b8` y cristal: Baltra es BRONCE cálido con verdín); **Facu GM** (azul mar y espuma: aquí el agua es solo ambiente, el protagonista es el metal); **Dáriel** (notas musicales: el sonido de Baltra son anillos, no notas).
- **Estado actual del VFX (verificado en código):** Tema procedural `bell` (`themes.js:9`, forma `scallop`; su `a=#8bb4bd` es casi idéntico al de `crystal` de Bront `#8aa4b8`). `skill-fx-a/c/baltra.js`: hab. 1 y definitiva = nova centrada, hab. 2 = cono + aura, hab. 3 = cono. La guardia hoy se dibuja como un arco de ±60° y radio 27 u (`expedition/render.js:35`) y la vibración como puntos sobre la cabeza (`render.js:34`).
- **Fuentes del kit:** `js/champions/expedition/catalog.js:19-24` (stats y kit), `expedition/runtime.js:41-44` (lanzamiento), `:117` (guardia), `expedition/render.js:20-38`, premarcado `aim-targeting.js:68`.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Bronce vivo | Onda circular que consume vibración: +12% de daño por carga. | `expedition` | 125 u |
| Bajo la campana | Guardia frontal de 25%; velocidad −20% mientras dura. | `expedition` | 70 u |
| Badajo de retorno | Golpe en cono: consume vibración y frena enemigos; jefes máximo 12%. | `expedition` | 100 u |
| **Que todos la escuchen** (definitiva) | Tres tañidos; el último empuja comunes. No desplaza jefes. Escuda 6% a los aliados cercanos y frena a los enemigos. | `expedition` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Bronce vivo, Bajo la campana, Badajo de retorno; definitiva: Que todos la escuchen.
- Skins/sets registrados: Festival de los Ausentes (`exp_baltra`, set), Campanero de la Catedral (`baltra_skin`, skin), Ceniza del Alba (`baltra_croma`, croma).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 0 && node tools/art-world/runway-guardian.js baltra f00_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 1 && node tools/art-world/runway-guardian.js baltra f01_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 2 && node tools/art-world/runway-guardian.js baltra f02_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 3 && node tools/art-world/runway-guardian.js baltra f03_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 4 && node tools/art-world/runway-guardian.js baltra f04_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 5 && node tools/art-world/runway-guardian.js baltra f05_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 6 && node tools/art-world/runway-guardian.js baltra f06_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 7 && node tools/art-world/runway-guardian.js baltra f07_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 8 && node tools/art-world/runway-guardian.js baltra f08_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 9 && node tools/art-world/runway-guardian.js baltra f09_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 10 && node tools/art-world/runway-guardian.js baltra f10_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 11 && node tools/art-world/runway-guardian.js baltra f11_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 12 && node tools/art-world/runway-guardian.js baltra f12_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 13 && node tools/art-world/runway-guardian.js baltra f13_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 14 && node tools/art-world/runway-guardian.js baltra f14_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 15 && node tools/art-world/runway-guardian.js baltra f15_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 16 && node tools/art-world/runway-guardian.js baltra f16_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 17 && node tools/art-world/runway-guardian.js baltra f17_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 18 && node tools/art-world/runway-guardian.js baltra f18_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 19 && node tools/art-world/runway-guardian.js baltra f19_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 20 && node tools/art-world/runway-guardian.js baltra f20_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 21 && node tools/art-world/runway-guardian.js baltra f21_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 22 && node tools/art-world/runway-guardian.js baltra f22_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 23 && node tools/art-world/runway-guardian.js baltra f23_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 24 && node tools/art-world/runway-guardian.js baltra f24_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 25 && node tools/art-world/runway-guardian.js baltra f25_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 26 && node tools/art-world/runway-guardian.js baltra f26_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 27 && node tools/art-world/runway-guardian.js baltra f27_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 28 && node tools/art-world/runway-guardian.js baltra f28_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 29 && node tools/art-world/runway-guardian.js baltra f29_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 30 && node tools/art-world/runway-guardian.js baltra f30_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 31 && node tools/art-world/runway-guardian.js baltra f31_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 32 && node tools/art-world/runway-guardian.js baltra f32_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 33 && node tools/art-world/runway-guardian.js baltra f33_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 34 && node tools/art-world/runway-guardian.js baltra f34_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py baltra && python3 tools/art/pose-ref.py baltra 35 && node tools/art-world/runway-guardian.js baltra f35_a1 "<prompt>" art-source/runway-codex-clean/baltra.png art-source/runway-pose-refs/baltra/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Baltra, la Campana Sumergida, tank, class color #8bb4bd), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
