# Vorn, el Cambiapiel (`vorn`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Tanque transformista: alterna una piel de piedra que resiste y una de tormenta que persigue, y cada skill cambia con la forma. (categoría `tanque`) · ataque básico cuerpo a cuerpo (alcance 84 u, en arco).
- **Color de clase:** `#7fa88c` · brillo `#d8f0e0`.
- **Origen:** El santuario del Laberinto. El santuario del Laberinto exigía que alguien guardara la puerta con dos pieles: una de piedra, para resistir, y una de tormenta, para avisar. Vorn aceptó el pacto sin preguntar cuánto duraba. Ya no recuerda cuál de las dos fue la suya primero, y cada muda le cuesta un poco de nombre. Cuando entra en la Bestia deja de elegir, y dice que es el único momento en que se siente entero.
- **SIN LÁMINA DEL CÓDICE:** `assets/ui/codex/champions/vorn.png` NO existe. **Paso 0 (Runway crea la lámina, ~8 créditos por intento):** `node tools/art-world/runway-design.js vorn codex1 "Character concept art for a retro 2D action RPG codex, Vorn, el Cambiapiel, tank champion, full body, standing, three-quarter front view, centered on a plain dark background. Class color #7fa88c. Design faithful to the kit and lore: Vorn alterna dos pieles, Piedra y Tormenta, y las funde en una Bestia que nadie quiere frenar.. Painterly dark fantasy pixel-art look like the style reference, no text, no frame." assets/ui/codex/champions/aelith.png` → `art-source/runway-designs/vorn/codex1/master.png`. Aprobarla (diseño coherente con el kit y el atlas actual, ver §5 de `../RECETA.md`); esa imagen es el `@codex` de las 36 poses (ruta en los comandos de abajo). El dueño usa ChatGPT para el Códice definitivo: esta lámina es la referencia de trabajo hasta que llegue la oficial.
- **Atlas registrado en el juego:** `assets/sprites/champions/vorn/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py vorn --info`).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Mudar | Cambia de piel. A Piedra: onda que frena y una coraza propia. A Tormenta: onda que debilita y +velocidad y +daño. Dura hasta que mudes de nuevo. | `ascension` | 115 u |
| Zarpa | Piedra: golpe en abanico que aparta y frena. Tormenta: se lanza en línea y deja sangrado. | `ascension` | 70 u |
| Instinto | Piedra: Roca Viva, coraza y armadura para el grupo. Tormenta: Aullido, +velocidad y +daño para el grupo. | `ascension` | 170 u |
| **Bestia Primordial** (definitiva) | Funde ambas pieles 6 s: −22% de daño recibido, +velocidad y un pisotón cada 0,7 s que frena y aparta. | `ascension` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 0 && node tools/art-world/runway-guardian.js vorn f00_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 1 && node tools/art-world/runway-guardian.js vorn f01_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 2 && node tools/art-world/runway-guardian.js vorn f02_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 3 && node tools/art-world/runway-guardian.js vorn f03_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 4 && node tools/art-world/runway-guardian.js vorn f04_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 5 && node tools/art-world/runway-guardian.js vorn f05_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 6 && node tools/art-world/runway-guardian.js vorn f06_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 7 && node tools/art-world/runway-guardian.js vorn f07_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 8 && node tools/art-world/runway-guardian.js vorn f08_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 9 && node tools/art-world/runway-guardian.js vorn f09_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 10 && node tools/art-world/runway-guardian.js vorn f10_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 11 && node tools/art-world/runway-guardian.js vorn f11_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 12 && node tools/art-world/runway-guardian.js vorn f12_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 13 && node tools/art-world/runway-guardian.js vorn f13_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 14 && node tools/art-world/runway-guardian.js vorn f14_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 15 && node tools/art-world/runway-guardian.js vorn f15_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 16 && node tools/art-world/runway-guardian.js vorn f16_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 17 && node tools/art-world/runway-guardian.js vorn f17_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 18 && node tools/art-world/runway-guardian.js vorn f18_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 19 && node tools/art-world/runway-guardian.js vorn f19_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 20 && node tools/art-world/runway-guardian.js vorn f20_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 21 && node tools/art-world/runway-guardian.js vorn f21_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 22 && node tools/art-world/runway-guardian.js vorn f22_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 23 && node tools/art-world/runway-guardian.js vorn f23_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 24 && node tools/art-world/runway-guardian.js vorn f24_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 25 && node tools/art-world/runway-guardian.js vorn f25_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 26 && node tools/art-world/runway-guardian.js vorn f26_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 27 && node tools/art-world/runway-guardian.js vorn f27_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 28 && node tools/art-world/runway-guardian.js vorn f28_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 29 && node tools/art-world/runway-guardian.js vorn f29_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 30 && node tools/art-world/runway-guardian.js vorn f30_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 31 && node tools/art-world/runway-guardian.js vorn f31_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 32 && node tools/art-world/runway-guardian.js vorn f32_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 33 && node tools/art-world/runway-guardian.js vorn f33_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 34 && node tools/art-world/runway-guardian.js vorn f34_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/pose-ref.py vorn 35 && node tools/art-world/runway-guardian.js vorn f35_a1 "<prompt>" art-source/runway-designs/vorn/codex1/master.png art-source/runway-pose-refs/vorn/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vorn, el Cambiapiel, tank, class color #7fa88c), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
