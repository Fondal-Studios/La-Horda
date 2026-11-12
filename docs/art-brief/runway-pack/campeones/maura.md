# Maura, la Pastora de Espinas (`maura`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Protectora de avance: recibe el choque, recoge semillas y abre un corredor. (categoría `tanque`) · ataque básico cuerpo a cuerpo (alcance 86 u, en arco).
- **Color de clase:** `#879c60` · brillo `#879c60`.
- **Origen:** Las Ruinas Célticas. Maura guiaba rebaños por senderos que ya no figuran en los mapas. Al volver a las Ruinas encontró las cercas convertidas en espinas y un camino que parecía respirar. No intentó dominar el bosque: cortó una vereda tan estrecha que solo se pasaba de a uno, y por ella salieron todos. Desde esa noche las zarzas crecen en su cayado, y ella las poda cada mañana.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/maura.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/maura/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py maura --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/maura.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Tanque de avance (rol tanque, protección y apertura de caminos, melee). Tono: pragmático y cuidadoso; "de a uno, yo cierro la fila". Lenguaje: cayado de zarza, corteza, espina, semilla, vereda.
- **Paleta sugerida:** oliva `#879c60` (color de clase, `expedition/catalog.js:25`), verde oscuro `#4a5a30`, claro `#cfe0a0`, rojo seco `#8b3a2a` (atlas `#542424`), corteza `#6c5424`, rosa de espina `#d86a8a` (acento), contorno `#1a2010`.
- **Motivos visuales:** zarza con espinas largas, corteza agrietada, semillas, rosas rígidas, cayado curvo, vereda estrecha.
- **NO debe parecerse a:** **Sylva** (verde vivo con flechas y hojas); **Morveth** (verde enfermo con púrpura y hongos); **Khepri** (esmeralda iridiscente de insectos); **Baltra/Brakk** (los otros tanques de expedición, bronce y ladrillo): Maura es madera, espina y oliva, SIN metal.
- **Estado actual del VFX (verificado en código):** Tema procedural `thorn` (`themes.js:26`, forma `petal`, motivos thorn/seed/vine/leaf). `skill-fx-a/c/maura.js`: Raíces = haz, Corteza = nova + aura, Poda = nova, definitiva = nova. Las semillas se muestran como puntos "•" sobre la cabeza (`expedition/render.js:34`).
- **Fuentes del kit:** `js/champions/expedition/catalog.js:25-30`, lanzamiento `expedition/runtime.js:45-48`, pulsos `:17`, premarcado `aim-targeting.js:69`.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Raíces de paso | Una línea de raíces daña, frena y deja un suelo de espinas temporal. | `expedition` | 26 u |
| Corteza prestada | Escudo de 10% de vida; al expirar libera una sola descarga si sigue viva. | `expedition` | 95 u |
| Poda necesaria | Corte circular que consume semillas; cura 1% por semilla, máximo 5%. | `expedition` | 110 u |
| **El bosque camina** (definitiva) | Seis pulsos móviles de espinas. No aumenta la hitbox ni crea un ejército. | `expedition` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Raíces de paso, Corteza prestada, Poda necesaria; definitiva: El bosque camina.
- Skins/sets registrados: Pastora Invernal (`exp_maura`, set), Rosa del Luto (`maura_skin`, skin), Ceniza del Alba (`maura_croma`, croma).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 0 && node tools/art-world/runway-guardian.js maura f00_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 1 && node tools/art-world/runway-guardian.js maura f01_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 2 && node tools/art-world/runway-guardian.js maura f02_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 3 && node tools/art-world/runway-guardian.js maura f03_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 4 && node tools/art-world/runway-guardian.js maura f04_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 5 && node tools/art-world/runway-guardian.js maura f05_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 6 && node tools/art-world/runway-guardian.js maura f06_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 7 && node tools/art-world/runway-guardian.js maura f07_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 8 && node tools/art-world/runway-guardian.js maura f08_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 9 && node tools/art-world/runway-guardian.js maura f09_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 10 && node tools/art-world/runway-guardian.js maura f10_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 11 && node tools/art-world/runway-guardian.js maura f11_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 12 && node tools/art-world/runway-guardian.js maura f12_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 13 && node tools/art-world/runway-guardian.js maura f13_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 14 && node tools/art-world/runway-guardian.js maura f14_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 15 && node tools/art-world/runway-guardian.js maura f15_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 16 && node tools/art-world/runway-guardian.js maura f16_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 17 && node tools/art-world/runway-guardian.js maura f17_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 18 && node tools/art-world/runway-guardian.js maura f18_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 19 && node tools/art-world/runway-guardian.js maura f19_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 20 && node tools/art-world/runway-guardian.js maura f20_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 21 && node tools/art-world/runway-guardian.js maura f21_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 22 && node tools/art-world/runway-guardian.js maura f22_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 23 && node tools/art-world/runway-guardian.js maura f23_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 24 && node tools/art-world/runway-guardian.js maura f24_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (casting raise: arms or weapon rise, the body stretches upward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 25 && node tools/art-world/runway-guardian.js maura f25_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (casting release: thrust forward, the widest and most dynamic pose): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 26 && node tools/art-world/runway-guardian.js maura f26_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (casting recover: arms lower, back to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 27 && node tools/art-world/runway-guardian.js maura f27_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 28 && node tools/art-world/runway-guardian.js maura f28_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 29 && node tools/art-world/runway-guardian.js maura f29_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 30 && node tools/art-world/runway-guardian.js maura f30_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (ultimate release: energy leaves, the body drops to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 31 && node tools/art-world/runway-guardian.js maura f31_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 32 && node tools/art-world/runway-guardian.js maura f32_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 33 && node tools/art-world/runway-guardian.js maura f33_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (death fall: body falling sideways, feet off the ground): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 34 && node tools/art-world/runway-guardian.js maura f34_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py maura 35 && node tools/art-world/runway-guardian.js maura f35_a1 "<prompt>" assets/ui/codex/champions/maura.png art-source/runway-pose-refs/maura/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Maura, la Pastora de Espinas, tank, class color #879c60), redrawn in exactly the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), same framing, facing the camera. Keep the @codex design and palette exactly. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
