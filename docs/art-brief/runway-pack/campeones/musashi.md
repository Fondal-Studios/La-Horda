# Musashi, el Rōnin del Bokken (`musashi`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Duelista. Daño físico a un solo objetivo y ejecución: elige un rival y se vuelve cada vez más peligroso contra él. (categoría `asesino`) · ataque básico cuerpo a cuerpo (alcance 60 u).
- **Color de clase:** `#5aa8d8` · brillo `#bfe4ff`.
- **Origen:** Un camino sin señor. Musashi cruzó cien duelos para llegar a la Ciudad Maldita y ganó todos sin desenvainar una hoja de verdad. Cree que cualquier arma alcanza contra un rival al que se entiende por completo. Elige uno, lo estudia y lo termina de un solo corte. Ahora busca al único adversario que todavía no entiende: la Horda, que nunca pelea dos veces igual.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/musashi.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/musashi/codex-v1/atlas.png` (celda 192×160, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py musashi --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/musashi.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Duelista (rol asesino, daño a un objetivo y ejecución; melee de velocidad). Tono: silencioso, disciplinado y letal; un camino sin señor. Lenguaje: tinta, pincel, ensō, bokken, luna roja.
- **Paleta sugerida:** azul tinta `#5aa8d8` (color de clase, `champions.js:142`) y claro `#bfe4ff`, azul noche `#2a4a68`, negro `#080c14`, blanco `#ffffff`, rojo sangre `#e04040` (tema `ink`, `themes.js:29`); duelo: carmesí `#7a1f1f`, madera `#241610`, farol `#ffa03c` (`musashi.js:205-250`). (Atlas: azules `#24243c`, rojos oscuros `#9c2424`.)
- **Motivos visuales:** trazo de pincel que se afina en las puntas, salpicadura de tinta, ensō (círculo de un solo trazo), bokken de madera, luna roja, torii, pétalos.
- **NO debe parecerse a:** **Kael** (rojo/gris con daga y trampas verdes); **Segador/Veyra** (sangre pesada); **Libertador** (azul patria con humo); **Aelith** (violeta). Lo de Musashi es TINTA monocroma azul-negra con un único acento rojo; no usa verde ni dorado.
- **Estado actual del VFX (verificado en código):** Tema procedural `ink` (`themes.js:29`, forma `spike`, motivos slash/petal/ink/spark). Ya tiene hojas de pose propias (`assets/sprites/champions/musashi/ronin1-4.png`, `ghost1-4.png`, `thousand1-4.png`, `basic1-5.png`, `ultiPortal.png`, `ultiFinish.png`) y el destello `musashiRoninImpact` (70 u). Las hojas de pose `ronin*`/`thousand*` incluyen el cuerpo del personaje con estelas curvas azul-blanco: el arte nuevo debe ir en una capa SEPARADA del cuerpo (ART_BIBLE s.7) y conservar esa dirección azul-blanco; la arena del duelo es 100% procedural (`musashi.js:205-251`: luna roja de radio 90 u, torii, plataforma de dojo de 405 u de lado, 4 faroles). `skill-fx-a/c/musashi.js` añade trazos de tinta y novas.
- **Fuentes del kit:** `js/data/champions.js:141-156`, `js/skills/abilities.js:390-540` (Rōnin, Paso Fantasma, Mil Cortes, Último Duelo), `js/champions/musashi.js:17-27,122-143,198-251`, premarcado `aim-targeting.js:34-35`.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Corte del Rōnin | Avanza y ejecuta un corte horizontal único y extremadamente rápido | `ronin_slash` | 120 u |
| Paso Fantasma | Atraviesa a un enemigo y aparece detrás suyo; el siguiente básico gana probabilidad de crítico. Si se activa justo antes de recibir un golpe, es un Paso Perfecto: lo evita por completo | `ghost_step` | 190 u |
| Mil Cortes | Ráfaga de cortes alrededor suyo que prioriza a su objetivo de duelo; cuantos menos enemigos haya, más cortes recibe cada uno | `thousand_cuts` | 150 u |
| **Último Duelo** (definitiva) | Se transporta con su objetivo de duelo a una arena privada: 1 contra 1 hasta que uno de los dos caiga o se acabe el tiempo | `last_duel_ult` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

Bloques de cuerpo abiertos para este campeón (de `docs/production/asset-blocks.json`):

- **B101** (P1, PENDIENTE): ataque_abajo
- **B101** (P1, PENDIENTE): ataque_arriba

- Habilidades registradas: Corte del Rōnin, Paso Fantasma, Mil Cortes; definitiva: Último Duelo.
- Skins/sets registrados: Samurái Legendario (`errante`, set), Hoja de Jade (`musashi_ancestral`, skin).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 0 && node tools/art-world/runway-guardian.js musashi f00_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 1 && node tools/art-world/runway-guardian.js musashi f01_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 2 && node tools/art-world/runway-guardian.js musashi f02_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 3 && node tools/art-world/runway-guardian.js musashi f03_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 4 && node tools/art-world/runway-guardian.js musashi f04_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 5 && node tools/art-world/runway-guardian.js musashi f05_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 6 && node tools/art-world/runway-guardian.js musashi f06_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 7 && node tools/art-world/runway-guardian.js musashi f07_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 8 && node tools/art-world/runway-guardian.js musashi f08_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 9 && node tools/art-world/runway-guardian.js musashi f09_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 10 && node tools/art-world/runway-guardian.js musashi f10_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 11 && node tools/art-world/runway-guardian.js musashi f11_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 12 && node tools/art-world/runway-guardian.js musashi f12_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 13 && node tools/art-world/runway-guardian.js musashi f13_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 14 && node tools/art-world/runway-guardian.js musashi f14_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 15 && node tools/art-world/runway-guardian.js musashi f15_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 16 && node tools/art-world/runway-guardian.js musashi f16_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 17 && node tools/art-world/runway-guardian.js musashi f17_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 18 && node tools/art-world/runway-guardian.js musashi f18_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 19 && node tools/art-world/runway-guardian.js musashi f19_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 20 && node tools/art-world/runway-guardian.js musashi f20_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 21 && node tools/art-world/runway-guardian.js musashi f21_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 22 && node tools/art-world/runway-guardian.js musashi f22_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 23 && node tools/art-world/runway-guardian.js musashi f23_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 24 && node tools/art-world/runway-guardian.js musashi f24_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 25 && node tools/art-world/runway-guardian.js musashi f25_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 26 && node tools/art-world/runway-guardian.js musashi f26_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 27 && node tools/art-world/runway-guardian.js musashi f27_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 28 && node tools/art-world/runway-guardian.js musashi f28_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 29 && node tools/art-world/runway-guardian.js musashi f29_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 30 && node tools/art-world/runway-guardian.js musashi f30_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 31 && node tools/art-world/runway-guardian.js musashi f31_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 32 && node tools/art-world/runway-guardian.js musashi f32_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 33 && node tools/art-world/runway-guardian.js musashi f33_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 34 && node tools/art-world/runway-guardian.js musashi f34_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py musashi && python3 tools/art/pose-ref.py musashi 35 && node tools/art-world/runway-guardian.js musashi f35_a1 "<prompt>" art-source/runway-codex-clean/musashi.png art-source/runway-pose-refs/musashi/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Musashi, el Rōnin del Bokken, assassin, class color #5aa8d8), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
