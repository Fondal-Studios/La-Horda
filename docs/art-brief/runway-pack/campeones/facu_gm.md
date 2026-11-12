# Facu GM, el Soberano de las Mareas (`facu_gm`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** No usa el agua: el océano le responde. Encadena corrientes, presión y oleadas para ordenar el campo antes de que el enemigo entienda el patrón. (categoría `asesino`) · ataque básico cuerpo a cuerpo (alcance 92 u, en arco).
- **Color de clase:** `#5aa8e4` · brillo `#d4ecff`.
- **Origen:** La fosa bajo la Arena Acuática. Las Arenas tienen fondo. Debajo del Acuático, más allá de donde el Leviatán dejó de bajar, hay una marea que no responde a ninguna luna. Facu fue el segundo Regente en cruzar el umbral y el único que volvió con el mar detrás. No lo domó: lo entendió. Sabe cuándo una corriente va a girar y cuándo una ola ya decidió romper. Por eso el agua llega antes que sus órdenes. Los guardianes del Acuático lo nombran en voz baja, como se nombra a la marea alta.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/facu_gm.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/facu_gm/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py facu_gm --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/facu_gm.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Asesino de secuencia (rol asesino, melee; Regente Fundador). Tono: sereno y soberbio; no domina el océano, el océano lo reconoce. Lenguaje: corriente, presión, oleada, espuma.
- **Paleta sugerida:** azul mar `#5aa8e4` (color de clase, `ascension/catalog.js:27`), espuma `#d4ecff`, azul profundo `#0c3c6c` y `#3c84cc` (atlas), turquesa `#7af0e0` (acento del tema `tide`), blanco `#ffffff`, contorno `#0a1a34`.
- **Motivos visuales:** ola con cresta, remolino, espuma, burbujas, corriente en vetas, silueta abisal bajo el agua, quilla.
- **NO debe parecerse a:** **Baltra** (bronce y metal sumergido: el agua de Facu es azul vivo y fluida, sin bronce); **Mago/Thalen** (hielo cristalino: aquí no hay cristales ni copos, solo agua curva); **Bront** (acero); **Khepri** (verde).
- **Estado actual del VFX (verificado en código):** Tema procedural `tide` (`themes.js:16`, forma `wave`, motivos wave/drop/shell/bubble). `skill-fx-a/c/facu_gm.js`: Corriente = estallido + teja de haz, Presión = nova, Ola = trazo ancho 56, definitiva = nova. Proyectil básico `wave` (`ascension/register.js:10`).
- **Fuentes del kit:** `js/champions/ascension/catalog.js:27-41` (stats y kit), lanzamiento `ascension/runtime.js:111-114`, objetos `:205-213`, cabalgata `:262-267`, premarcado `js/skills/aim-targeting.js:52-53`.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Corriente de Resaca | Abre una corriente en línea durante 3,5 s: arrastra a los comunes en su dirección y acelera a los aliados que la pisan. (Flujo: Corriente) | `ascension` | 34 u |
| Presión Abisal | Implosión en el punto elegido: atrae a los comunes al centro, daña y frena. Los jefes solo reciben daño y lentitud. (Flujo: Presión) | `ascension` | 120 u |
| Cabalgar la Ola | Facu cabalga una ola a través de los enemigos: los aparta, deja espuma que frena y protege a los aliados que cruza. Se detiene ante muros y bordes. (Flujo: Oleada) | `ascension` | 46 u |
| **El Océano Reclama la Arena** (definitiva) | La arena se inunda: Facu se eleva sobre una ola, el remolino arrastra a la horda al centro, siluetas abisales cruzan bajo el agua y la ola final atraviesa el escenario. Nadie termina fuera de los límites. | `ascension` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Corriente de Resaca, Presión Abisal, Cabalgar la Ola; definitiva: El Océano Reclama la Arena.
- Skins de ascensión pendientes: {'id': 'facu_gm_alt1', 'nombre': 'Soberano de la Fosa', 'iou_vs_base': 0.999}.

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 0 && node tools/art-world/runway-guardian.js facu_gm f00_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 1 && node tools/art-world/runway-guardian.js facu_gm f01_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 2 && node tools/art-world/runway-guardian.js facu_gm f02_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 3 && node tools/art-world/runway-guardian.js facu_gm f03_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 4 && node tools/art-world/runway-guardian.js facu_gm f04_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 5 && node tools/art-world/runway-guardian.js facu_gm f05_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 6 && node tools/art-world/runway-guardian.js facu_gm f06_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 7 && node tools/art-world/runway-guardian.js facu_gm f07_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 8 && node tools/art-world/runway-guardian.js facu_gm f08_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 9 && node tools/art-world/runway-guardian.js facu_gm f09_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 10 && node tools/art-world/runway-guardian.js facu_gm f10_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 11 && node tools/art-world/runway-guardian.js facu_gm f11_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 12 && node tools/art-world/runway-guardian.js facu_gm f12_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 13 && node tools/art-world/runway-guardian.js facu_gm f13_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 14 && node tools/art-world/runway-guardian.js facu_gm f14_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 15 && node tools/art-world/runway-guardian.js facu_gm f15_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 16 && node tools/art-world/runway-guardian.js facu_gm f16_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 17 && node tools/art-world/runway-guardian.js facu_gm f17_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 18 && node tools/art-world/runway-guardian.js facu_gm f18_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 19 && node tools/art-world/runway-guardian.js facu_gm f19_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 20 && node tools/art-world/runway-guardian.js facu_gm f20_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 21 && node tools/art-world/runway-guardian.js facu_gm f21_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 22 && node tools/art-world/runway-guardian.js facu_gm f22_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 23 && node tools/art-world/runway-guardian.js facu_gm f23_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 24 && node tools/art-world/runway-guardian.js facu_gm f24_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (casting raise: arms or weapon rise, the body stretches upward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 25 && node tools/art-world/runway-guardian.js facu_gm f25_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (casting release: thrust forward, the widest and most dynamic pose): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 26 && node tools/art-world/runway-guardian.js facu_gm f26_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (casting recover: arms lower, back to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 27 && node tools/art-world/runway-guardian.js facu_gm f27_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 28 && node tools/art-world/runway-guardian.js facu_gm f28_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 29 && node tools/art-world/runway-guardian.js facu_gm f29_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 30 && node tools/art-world/runway-guardian.js facu_gm f30_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (ultimate release: energy leaves, the body drops to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 31 && node tools/art-world/runway-guardian.js facu_gm f31_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 32 && node tools/art-world/runway-guardian.js facu_gm f32_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 33 && node tools/art-world/runway-guardian.js facu_gm f33_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (death fall: body falling sideways, feet off the ground): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 34 && node tools/art-world/runway-guardian.js facu_gm f34_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py facu_gm 35 && node tools/art-world/runway-guardian.js facu_gm f35_a1 "<prompt>" assets/ui/codex/champions/facu_gm.png art-source/runway-pose-refs/facu_gm/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Facu GM, el Soberano de las Mareas, assassin, class color #5aa8e4), redrawn in exactly the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), same framing, facing the camera. Keep the @codex design and palette exactly. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
