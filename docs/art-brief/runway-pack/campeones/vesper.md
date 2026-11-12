# Vesper, la Costurera de Sombras (`vesper`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Asesina de preparación: marca grupos, cose una salida y consume los hilos. (categoría `asesino`) · ataque básico cuerpo a cuerpo (alcance 72 u, en arco).
- **Color de clase:** `#aa75bd` · brillo `#aa75bd`.
- **Origen:** El teatro de la Ciudad Maldita. Vesper remendaba los trajes del teatro de la Ciudad. La noche del regreso encontró a su hermana frente a un espejo: el cuerpo seguía allí, pero la sombra ya se movía sola. Intentó sujetarla con el hilo con el que cosía nombres dentro de los abrigos. Desde entonces hilvana las sombras de los corrompidos, y sigue cada Cicatriz preguntándose cuánto queda de una persona.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/vesper.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas actual en el juego:** `assets/sprites/champions/vesper/atlas.png`.

### Identidad visual (extracto de `docs/art-brief/campeones/vesper.md`, sección A)

- **Rol:** Asesina de preparación (`roleCategory: asesino`), cuerpo a cuerpo (básico 72 u, 430 ms). Marca grupos con puntadas, cose una salida y consume los hilos.
- **Tono:** Callada, precisa y dolida: remendaba trajes de teatro y ahora hilvana sombras. Aguja, hilo, tijera, retazos; elegancia de modista de luto.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:4`; `js/champions/expedition/catalog.js:12`; `js/champions/expedition/runtime.js:33`; pasiva en `js/champions/expedition/catalog.js:8`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/vesper/atlas.png`: ciruela `#703050`/`#503030`/`#703030`, piel `#f0d0b0`, grises `#907070`. Color de clase `#aa75bd` (`catalog.js:4`). Capucha corta, delantal asimétrico, dos tijeras grandes.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Violeta ciruela (dominante) | `#aa75bd` |
  | Lila pálido (brillo de hilo) | `#e0b6f0` |
  | Ciruela profunda (sombra) | `#5b3770` |
  | Negro-violeta (contorno) | `#1a0f24` |
  | Marfil (hilo y tijeras) | `#efe6d0` |
  | Acero (aguja y filo) | `#9aa0b0` |

- **Motivos visuales:** agujas largas, hilo que atraviesa y se enhebra, puntadas en fila, tijeras abiertas, carretes, botones, dedal, costuras que se cierran, retazos de tela.
- **Pasiva:** *Hilván* (puntadas marcadas hasta 3 por objetivo, 5 s; al caer un marcado libera una rotura de hilo de 75 u, 0,3× del daño base, `runtime.js`) no se dibuja hoy (no hay lectura en `expedition/render.js`). Recomendado, opcional: 1–3 puntadas en cruz de marfil sobre el enemigo marcado; se consume con Deshilachar y La última puntada.
- **NO debe parecerse a:** **Nahir** (misma geometría de cono 97° con vidrio aguamarina): las agujas de Vesper son finísimas, violetas, unidas por hilo ondulante. **Iria** (hilos tensos y anclas, lila-azul `#8889c1`, y "Corte de Hilo" con tijeras): Vesper = costura con puntadas, aguja e hilo marfil sobre violeta ciruela; Iria = hilos rectos tensos azulados con sellos. **Veyra** (sangre, `#ab3459`) y **Segador**: sin rojo. **Nigromante** (hilos de alma verdes).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Agujas de penumbra | Abanico de agujas: daño y una puntada por enemigo. | `expedition` | 85 u |
| Costura de fuga | Avanza por terreno seguro y deja una costura que daña en 4 pulsos. | `expedition` | 24 u |
| Deshilachar | Consume las puntadas cercanas: +20% de daño por puntada. Después queda afilada: +15% de daño 3 s. | `expedition` | 150 u |
| **La última puntada** (definitiva) | Cuatro cortes circulares; el último consume las marcas para amplificarse. Los aliados cercanos ganan +15% de velocidad mientras dura. | `expedition` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Agujas de penumbra, Costura de fuga, Deshilachar; definitiva: La última puntada.
- Skins/sets registrados: Costurera de Espantapájaros (`exp_vesper`, set), Sastre de la Corte Muerta (`vesper_skin`, skin), Ceniza del Alba (`vesper_croma`, croma).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte de 112×112; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f00_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f00.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f01_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f01.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f02_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f02.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f03_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f03.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f04_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f04.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f05_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f05.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f06_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f06.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f07_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f07.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f08_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f08.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f09_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f09.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f10_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f10.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f11_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f11.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f12_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f12.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f13_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f13.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f14_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f14.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f15_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f15.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f16_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f16.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f17_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f17.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f18_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f18.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f19_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f19.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f20_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f20.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f21_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f21.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f22_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f22.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f23_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f23.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f24_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f24.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (casting raise: arms or weapon rise, the body stretches upward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f25_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f25.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (casting release: thrust forward, the widest and most dynamic pose): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f26_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f26.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (casting recover: arms lower, back to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f27_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f27.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f28_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f28.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f29_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f29.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f30_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f30.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (ultimate release: energy leaves, the body drops to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f31_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f31.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f32_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f32.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f33_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f33.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (death fall: body falling sideways, feet off the ground): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f34_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f34.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js vesper f35_a1 "<prompt>" assets/ui/codex/champions/vesper.png art-source/runway-pose-refs/vesper/f35.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Vesper, la Costurera de Sombras, assassin, class color #aa75bd), redrawn in exactly the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), same framing, facing the camera. Keep the @codex design and palette exactly. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
