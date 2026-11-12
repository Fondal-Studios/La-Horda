# Nano GM, el Regente del Umbral (`nano_gm`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Regente que reescribe las reglas locales de la arena: la Luz decide quién resiste y la Oscuridad, quién cae. (categoría `mago`) · ataque básico a distancia (alcance 270 u).
- **Color de clase:** `#e8c56a` · brillo `#fff4d6`.
- **Origen:** El umbral sobre la Arena Infernal. Antes de que el Forjador partiera el Sello, alguien escribió las reglas de las Arenas: cuánto pesa un golpe, qué cuenta como victoria. Los Regentes no pelearon contra la Horda; la observaron desde el umbral donde la luz y la sombra aún no se separaban. Nano es el primero que decidió cruzar. Sus tatuajes no son adorno: son las cláusulas del pacto, grabadas en la piel para que ninguna regla se le olvide. Cuando entra en combate, la arena lo reconoce antes que los campeones.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/nano_gm.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/nano_gm/codex-v2/atlas.png` (celda 192×128, 8 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py nano_gm --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/nano_gm.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Mago de reglas (`roleCategory: mago`), a distancia (básico 270 u, 420 ms). Alterna afinidad Luz y Oscuridad; con 2+2 entra en la Forma del Regente.
- **Tono:** Solemne y absoluto, con humor seco de "Game Master": decreta, sentencia, parte la arena en dos. Contraste duro entre dos mitades (blanco/oro contra negro/índigo).
- **Fuentes del kit:** `js/champions/ascension/catalog.js:12`; `js/champions/ascension/catalog.js:23`; `js/champions/ascension/runtime.js:101`; pasiva en `js/champions/ascension/catalog.js:17`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/nano_gm/atlas.png`: oro envejecido `#d0b070`/`#f0d090`, negro-índigo `#0c0c24`/`#24243c`, grises `#505050`. Color de clase `#e8c56a`, brillo `#fff4d6` (`ascension/catalog.js:12`). Ala de luz y ala de sombra asimétricas (render en `ascension/render.js`).
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Oro envejecido (Luz, dominante) | `#e8c56a` |
  | Marfil de decreto | `#fff4d6` |
  | Negro-índigo (Oscuridad, dominante opuesto) | `#15122a` |
  | Ocre oscuro (sombra del oro) | `#7a6420` |
  | Violeta de sombra (filo de la Oscuridad) | `#4a3a8a` |
  | Blanco puro (golpe de Juicio) | `#ffffff` |

- **Motivos visuales:** mitades enfrentadas (blanco/negro), balanza, martillo de juez, pergaminos y decretos con runas, tatuajes que se agrietan en glifos, ala de luz + ala de sombra, líneas rectas de "regla" (geometría de reglamento), media luna mitad blanca/mitad negra.
- **NO debe parecerse a:** **Aurelia** (oro/sol, prismas): el oro de Nano siempre va partido con negro; nada de rayos de sol ni cristales. **Segador/Veyra** (negro y rojo): la oscuridad de Nano es índigo con filo dorado, sin rojo. **Elyra** (luz dorada de curación): la Luz de Nano es ley/escritura en el suelo (círculos de runas), no destellos de curación.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Sentencia Umbría | Decreto de sombra en línea: daña y SENTENCIA (+15% de daño recibido, 4 s). Comunes sentenciados con menos de 22% de vida son ejecutados. La línea termina en una explosión que también sentencia. | `ascension` | 30 u |
| Edicto de Luz | Ley de refugio en el suelo: aliados dentro reciben escudo, −15% de daño y regeneración; enemigos dentro se frenan. | `ascension` | 135 u |
| Inversión | Se traslada al punto elegido. Deja una runa opuesta a su última afinidad: Sombra estalla en daño; Luz cura al llegar. Al llegar estalla en área. | `ascension` | 110 u |
| **Juicio del GM** (definitiva) | La arena se divide: restaura a los aliados, ejecuta o devasta a los comunes y golpea fuerte a élites y jefes. Luego Nano es 8 s un monstruo en blanco y negro: +40% de área en todo y Forma del Regente. | `ascension` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Sentencia Umbría, Edicto de Luz, Inversión; definitiva: Juicio del GM.
- Skins de ascensión pendientes: {'id': 'nano_gm_alt1', 'nombre': 'Regente del Eclipse Dorado', 'iou_vs_base': 0.915}.

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

> **Atlas con rejilla propia (8 columnas, celda 192×128):** la pose N de abajo está en la celda `fila × 8 + columna` de ESTE atlas; los comandos ya traen ese índice. La numeración de los cuadros del título es la del atlas estándar 4×9.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 0 && node tools/art-world/runway-guardian.js nano_gm f00_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 1 && node tools/art-world/runway-guardian.js nano_gm f01_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 2 && node tools/art-world/runway-guardian.js nano_gm f02_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 3 && node tools/art-world/runway-guardian.js nano_gm f03_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 8 && node tools/art-world/runway-guardian.js nano_gm f04_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f08_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 9 && node tools/art-world/runway-guardian.js nano_gm f05_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f09_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 10 && node tools/art-world/runway-guardian.js nano_gm f06_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f10_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 11 && node tools/art-world/runway-guardian.js nano_gm f07_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f11_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 16 && node tools/art-world/runway-guardian.js nano_gm f08_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f16_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 17 && node tools/art-world/runway-guardian.js nano_gm f09_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f17_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 18 && node tools/art-world/runway-guardian.js nano_gm f10_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f18_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 19 && node tools/art-world/runway-guardian.js nano_gm f11_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f19_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 24 && node tools/art-world/runway-guardian.js nano_gm f12_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f24_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 25 && node tools/art-world/runway-guardian.js nano_gm f13_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f25_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 26 && node tools/art-world/runway-guardian.js nano_gm f14_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f26_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 27 && node tools/art-world/runway-guardian.js nano_gm f15_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f27_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 32 && node tools/art-world/runway-guardian.js nano_gm f16_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f32_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 33 && node tools/art-world/runway-guardian.js nano_gm f17_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f33_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 34 && node tools/art-world/runway-guardian.js nano_gm f18_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f34_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 35 && node tools/art-world/runway-guardian.js nano_gm f19_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f35_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 40 && node tools/art-world/runway-guardian.js nano_gm f20_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f40_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 41 && node tools/art-world/runway-guardian.js nano_gm f21_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f41_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 42 && node tools/art-world/runway-guardian.js nano_gm f22_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f42_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 43 && node tools/art-world/runway-guardian.js nano_gm f23_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f43_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 48 && node tools/art-world/runway-guardian.js nano_gm f24_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f48_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (casting raise: arms or weapon rise, the body stretches upward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 49 && node tools/art-world/runway-guardian.js nano_gm f25_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f49_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (casting release: thrust forward, the widest and most dynamic pose): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 50 && node tools/art-world/runway-guardian.js nano_gm f26_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f50_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (casting recover: arms lower, back to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 51 && node tools/art-world/runway-guardian.js nano_gm f27_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f51_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 56 && node tools/art-world/runway-guardian.js nano_gm f28_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f56_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 57 && node tools/art-world/runway-guardian.js nano_gm f29_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f57_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 58 && node tools/art-world/runway-guardian.js nano_gm f30_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f58_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (ultimate release: energy leaves, the body drops to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 59 && node tools/art-world/runway-guardian.js nano_gm f31_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f59_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 64 && node tools/art-world/runway-guardian.js nano_gm f32_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f64_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 65 && node tools/art-world/runway-guardian.js nano_gm f33_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f65_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (death fall: body falling sideways, feet off the ground): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 66 && node tools/art-world/runway-guardian.js nano_gm f34_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f66_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py nano_gm 67 && node tools/art-world/runway-guardian.js nano_gm f35_a1 "<prompt>" assets/ui/codex/champions/nano_gm.png art-source/runway-pose-refs/nano_gm/f67_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Nano GM, el Regente del Umbral, mage, class color #e8c56a), redrawn in exactly the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), same framing, facing the camera. Keep the @codex design and palette exactly. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
