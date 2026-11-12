# Ynara, la Médica de los Refugios (`ynara`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Sanadora de área: estrogonof, agua y santa paciencia. (categoría `soporte`) · ataque básico a distancia (alcance 300 u).
- **Color de clase:** `#ed8db5` · brillo `#fff0f7`.
- **Origen:** Los refugios de la Ciudad Maldita. Médica silenciosa y cuidadosa, Ynara sostiene los refugios con luz, agua limpia y estrogonof de pollo. Bajo su halo blanco guarda una paciencia finita y una bondad obstinada. Cura incluso a quien la hizo enojar. Nunca pide perdón: escucha, se queda callada y sigue cuidando. Cuando la paciencia se le termina, el halo se abre y los refugios entienden por qué la llaman santa.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/ynara.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/ynara/atlas.png` (celda 96×96, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py ynara --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/ynara.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Sanadora de área (`roleCategory: soporte`), a distancia (básico 300 u, 600 ms). Luz, estrogonof de pollo, agua limpia y una paciencia finita que estalla.
- **Tono:** Silenciosa, cuidadosa y obstinadamente buena: "cura incluso a quien la hizo enojar. Nunca pide perdón". Blanco nacarado, rosa suave, vapor de comida caliente; ternura con filo.
- **Fuentes del kit:** `js/data/portadores.js:5`; `js/data/portadores.js:8`; `js/champions/ynara.js:8`; `js/data/portadores-lore.js:24`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/ynara/atlas.png`: blanco `#f0f0f0` (27%), piel `#f0b090`, rosas `#f0d0d0`/`#b09090`, marrón `#705030`. Color de clase `#ed8db5`, brillo `#fff0f7` (`js/data/portadores.js:5`). Halo nacarado blanco sobre la cabeza.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Rosa claro (dominante) | `#ed8db5` |
  | Blanco nacarado (halo y brillo) | `#fff0f7` |
  | Rosa fuerte (sombra) | `#b04a78` |
  | Granate-ciruela (contorno) | `#40182c` |
  | Crema de salsa (estrogonof) | `#f2d9a8` |
  | Celeste agua (cortina) | `#a9dcf0` |

- **Motivos visuales:** halo blanco nacarado, rayos de luz suave, plato de estrogonof con vapor y corazones, cortina de agua con gotas, santuario circular con alas translúcidas, escudo de luz.
- **NO debe parecerse a:** **Myla** (rosa yogur opaco con crema, charcos y burbujas): Ynara es luz y vapor, rosa transparente con blanco; sin charcos pegajosos. **Elyra** (verde y rayos solares): la luz de Ynara es rosa-blanca suave. **Oriel** (frambuesa saturada con negro-vino) y **Veyra** (carmesí). **Ismara** (turquesa).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Mirada fulminante | Un abanico de luz daña y ralentiza 30% durante 1,5 s. Empuja comunes cercanos; jefes resisten el empuje y limitan el freno al 12%. | `yn_gaze` | 100 u |
| Estrogonof reparador | Sirve estrogonof de pollo: cada 600 ms cura 1% de vida y su vapor daña. Dentro reduce daño 8%. Máximo una fuente por Ynara. | `yn_stroganoff` | 115 u |
| No quiero seguir esta conversación | Se desliza por terreno seguro y limpia ralentización. Deja una cortina de agua que daña y frena. No cruza muros ni vacíos. | `yn_leave` | 32 u |
| **Santa Paciencia** (definitiva) | Santuario móvil: cura 0,8% por pulso y daña cada 0,6 s. Cada golpe que reciben los aliados adentro carga paciencia (máx. 8); al final estalla una onda. | `yn_patience` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

Bloques de cuerpo abiertos para este campeón (de `docs/production/asset-blocks.json`):

- **B006** (P0, BLOQUEADO_DECISION): lanzar
- **B006** (P0, BLOQUEADO_DECISION): definitiva
- **B006** (P0, BLOQUEADO_DECISION): muerte

- Habilidades registradas: Mirada fulminante, Estrogonof reparador, No quiero seguir esta conversación; definitiva: Santa Paciencia.
- Skins/sets registrados: Guardiana del Santuario (`santa_paciencia`, set), Guardia Celeste (`ynara_celeste`, skin).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 0 && node tools/art-world/runway-guardian.js ynara f00_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 1 && node tools/art-world/runway-guardian.js ynara f01_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 2 && node tools/art-world/runway-guardian.js ynara f02_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 3 && node tools/art-world/runway-guardian.js ynara f03_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 4 && node tools/art-world/runway-guardian.js ynara f04_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 5 && node tools/art-world/runway-guardian.js ynara f05_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 6 && node tools/art-world/runway-guardian.js ynara f06_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 7 && node tools/art-world/runway-guardian.js ynara f07_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 8 && node tools/art-world/runway-guardian.js ynara f08_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 9 && node tools/art-world/runway-guardian.js ynara f09_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 10 && node tools/art-world/runway-guardian.js ynara f10_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 11 && node tools/art-world/runway-guardian.js ynara f11_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 12 && node tools/art-world/runway-guardian.js ynara f12_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 13 && node tools/art-world/runway-guardian.js ynara f13_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 14 && node tools/art-world/runway-guardian.js ynara f14_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 15 && node tools/art-world/runway-guardian.js ynara f15_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 16 && node tools/art-world/runway-guardian.js ynara f16_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 17 && node tools/art-world/runway-guardian.js ynara f17_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 18 && node tools/art-world/runway-guardian.js ynara f18_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 19 && node tools/art-world/runway-guardian.js ynara f19_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 20 && node tools/art-world/runway-guardian.js ynara f20_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 21 && node tools/art-world/runway-guardian.js ynara f21_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 22 && node tools/art-world/runway-guardian.js ynara f22_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 23 && node tools/art-world/runway-guardian.js ynara f23_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 24 && node tools/art-world/runway-guardian.js ynara f24_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (casting raise: arms or weapon rise, the body stretches upward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 25 && node tools/art-world/runway-guardian.js ynara f25_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (casting release: thrust forward, the widest and most dynamic pose): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 26 && node tools/art-world/runway-guardian.js ynara f26_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (casting recover: arms lower, back to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 27 && node tools/art-world/runway-guardian.js ynara f27_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 28 && node tools/art-world/runway-guardian.js ynara f28_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 29 && node tools/art-world/runway-guardian.js ynara f29_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 30 && node tools/art-world/runway-guardian.js ynara f30_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (ultimate release: energy leaves, the body drops to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 31 && node tools/art-world/runway-guardian.js ynara f31_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 32 && node tools/art-world/runway-guardian.js ynara f32_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 33 && node tools/art-world/runway-guardian.js ynara f33_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (death fall: body falling sideways, feet off the ground): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 34 && node tools/art-world/runway-guardian.js ynara f34_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py ynara 35 && node tools/art-world/runway-guardian.js ynara f35_a1 "<prompt>" assets/ui/codex/champions/ynara.png art-source/runway-pose-refs/ynara/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ynara, la Médica de los Refugios, support, class color #ed8db5), redrawn in exactly the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), same framing, facing the camera. Keep the @codex design and palette exactly. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
