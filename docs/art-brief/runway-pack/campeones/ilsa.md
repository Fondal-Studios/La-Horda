# Ilsa, la Esgrimista de Réplica (`ilsa`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Duelista de contraataque: desvía los golpes enemigos, responde a cada atacante y gasta Réplicas en estocadas. (categoría `asesino`) · ataque básico cuerpo a cuerpo (alcance 70 u, en arco).
- **Color de clase:** `#d94f6a` · brillo `#ffd0da`.
- **Origen:** Los salones de la Ciudad. Ilsa Corvo enseñaba esgrima en los salones de la Ciudad con una sola regla: jamás atacar primero. Perdió a su mejor alumno por un golpe que nadie desvió y decidió que a nadie más le tocaría pagar por no responder. Ahora espera el golpe con el florete bajo y la cinta carmesí en la muñeca, y devuelve cada uno con intereses. No se jacta: cuenta las respuestas, porque la tercera siempre es la que cierra el duelo.
- **SIN LÁMINA DEL CÓDICE:** `assets/ui/codex/champions/ilsa.png` NO existe. **Paso 0 (Runway crea la lámina, ~8 créditos por intento):** `node tools/art-world/runway-design.js ilsa codex1 "Character concept art for a retro 2D action RPG codex, Ilsa, la Esgrimista de Réplica, assassin champion, full body, standing, three-quarter front view, centered on a plain dark background. Class color #d94f6a. Design faithful to the kit and lore: Ilsa desvía los golpes, los devuelve con interés y convierte cada Réplica en una estocada.. Painterly dark fantasy pixel-art look like the style reference, no text, no frame." assets/ui/codex/champions/aelith.png` → `art-source/runway-designs/ilsa/codex1/master.png`. Aprobarla (diseño coherente con el kit y el atlas actual, ver §5 de `../RECETA.md`); esa imagen es el `@codex` de las 36 poses (ruta en los comandos de abajo). El dueño usa ChatGPT para el Códice definitivo: esta lámina es la referencia de trabajo hasta que llegue la oficial.
- **Atlas registrado en el juego:** `assets/sprites/champions/ilsa/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py ilsa --info`).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Postura de Réplica | Durante 0,9 s desvía todos los golpes que recibas y contraataca a cada atacante. Cada golpe desviado suma una Réplica (máx. 3) y acorta 2 s esta recarga. | `ascension` | 110 u |
| Estocada de Réplica | Se lanza en línea y atraviesa a cuantos haya en el camino; cada Réplica gastada suma +35% de daño. | `ascension` | 26 u |
| Giro de Acero | Gira con el acero: daña, frena y aparta a los comunes que la rodean. Cada Réplica gastada suma +25% de daño y empuja más lejos. | `ascension` | 105 u |
| **Duelo de Mil Réplicas** (definitiva) | Estallido que frena alrededor y, durante 4 s, desvía hasta seis golpes con una onda de respuesta. Recibe 40% menos de daño mientras dura. | `ascension` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 0 && node tools/art-world/runway-guardian.js ilsa f00_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 1 && node tools/art-world/runway-guardian.js ilsa f01_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 2 && node tools/art-world/runway-guardian.js ilsa f02_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 3 && node tools/art-world/runway-guardian.js ilsa f03_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 4 && node tools/art-world/runway-guardian.js ilsa f04_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 5 && node tools/art-world/runway-guardian.js ilsa f05_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 6 && node tools/art-world/runway-guardian.js ilsa f06_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 7 && node tools/art-world/runway-guardian.js ilsa f07_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 8 && node tools/art-world/runway-guardian.js ilsa f08_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 9 && node tools/art-world/runway-guardian.js ilsa f09_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 10 && node tools/art-world/runway-guardian.js ilsa f10_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 11 && node tools/art-world/runway-guardian.js ilsa f11_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 12 && node tools/art-world/runway-guardian.js ilsa f12_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 13 && node tools/art-world/runway-guardian.js ilsa f13_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 14 && node tools/art-world/runway-guardian.js ilsa f14_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 15 && node tools/art-world/runway-guardian.js ilsa f15_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 16 && node tools/art-world/runway-guardian.js ilsa f16_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 17 && node tools/art-world/runway-guardian.js ilsa f17_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 18 && node tools/art-world/runway-guardian.js ilsa f18_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 19 && node tools/art-world/runway-guardian.js ilsa f19_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 20 && node tools/art-world/runway-guardian.js ilsa f20_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 21 && node tools/art-world/runway-guardian.js ilsa f21_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 22 && node tools/art-world/runway-guardian.js ilsa f22_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 23 && node tools/art-world/runway-guardian.js ilsa f23_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 24 && node tools/art-world/runway-guardian.js ilsa f24_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 25 && node tools/art-world/runway-guardian.js ilsa f25_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 26 && node tools/art-world/runway-guardian.js ilsa f26_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 27 && node tools/art-world/runway-guardian.js ilsa f27_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 28 && node tools/art-world/runway-guardian.js ilsa f28_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 29 && node tools/art-world/runway-guardian.js ilsa f29_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 30 && node tools/art-world/runway-guardian.js ilsa f30_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 31 && node tools/art-world/runway-guardian.js ilsa f31_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 32 && node tools/art-world/runway-guardian.js ilsa f32_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 33 && node tools/art-world/runway-guardian.js ilsa f33_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 34 && node tools/art-world/runway-guardian.js ilsa f34_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py ilsa 35 && node tools/art-world/runway-guardian.js ilsa f35_a1 "<prompt>" art-source/runway-designs/ilsa/codex1/master.png art-source/runway-pose-refs/ilsa/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ilsa, la Esgrimista de Réplica, assassin, class color #d94f6a), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
