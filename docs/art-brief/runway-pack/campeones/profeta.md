# Ismara, la Profeta Ciega (`profeta`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Sanadora de apoyo cuerpo a cuerpo. Cura, protege y potencia a un aliado elegido. (categoría `soporte`) · ataque básico cuerpo a cuerpo (alcance 82 u).
- **Color de clase:** `#4fd8c4` · brillo `#bffff0`.
- **Origen:** El Oráculo sin ojos. Ismara entregó los ojos al Oráculo a cambio de ver unos segundos más adelante. A veces le alcanza para cambiar el destino de un aliado, y a veces solo para verlo venir. Pelea cuerpo a cuerpo porque nadie más está tan cerca del golpe que va a llegar. Sus visiones sobre los cristales la despiertan de noche: siempre terminan en el mismo lugar, en llamas.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/profeta.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/profeta/codex-v1/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py profeta --info`).
- Ojo: existe también `assets/sprites/champions/profeta/atlas.png` pero NO es el registrado; manda el de arriba.

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/profeta.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Soporte cuerpo a cuerpo (`roleCategory: soporte`): cura, protege y potencia a un aliado; su hoja golpea (básico 82 u, 520 ms).
- **Tono:** Oscura, encorvada e inquietante pero compasiva: ciega, ve el destino. Hilos, relojes que rebobinan, un ojo cerrado que se abre; luz fría, nunca cálida.
- **Fuentes del kit:** `js/data/champions.js:121`; `js/skills/abilities.js:1406`; `js/champions/profeta.js:10`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/profeta/atlas.png`: blanco `#f0f0f0`, turquesa oscuro `#307070`/`#305050`, grises `#505050`. Color de clase `#4fd8c4`, brillo `#bffff0` (`champions.js`).
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Turquesa (dominante) | `#4fd8c4` |
  | Turquesa pálido (brillo) | `#bffff0` |
  | Turquesa profundo (sombra) | `#2a8f86` |
  | Verde-negro (contorno) | `#0d2f33` |
  | Blanco hueso (hoja y vendas) | `#f2fbf6` |
  | Gris ceniza (acento sin vida) | `#8a9aa0` |

- **Motivos visuales:** ojo ciego que se abre, hilos de destino, relojes con las agujas hacia atrás, hoja curva de acero claro, vendas, anillos de runas, alas translúcidas al fusionarse.
- **NO debe parecerse a:** **Axiom** (`#3ad6c4`, teal de glitch/píxeles/cuadrículas): Ismara es turquesa suave y orgánica, hilos y relojes, jamás píxeles. **Nahir** (`#68c6c2`, vidrio): sin facetas ni destellos de cristal. **Elyra** (verde de sanación y alas): la curación de Ismara es fría y simbólica (reloj, ojo), no una luz verde cálida. **Aelith** (tiempo/lila).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Destino Restaurado | Cura al instante al aliado más herido. Si está gravemente herido, además revierte parte del daño reciente que recibió | `retro_heal` | — u |
| Visión del Inmortal | Un aliado cercano se vuelve inmune a todo daño y a efectos negativos por unos segundos; al terminar, recibe una pequeña regeneración | `brief_immunity` | 260 u |
| Danza del Augurio | Gira con su hoja y genera daño de área a su alrededor; si un enemigo está muy cerca, lo aturde brevemente | `self_spin_stun` | 112 u |
| **Ascensión del Elegido** (definitiva) | Se fusiona con un aliado: él recibe una gran curación, mucho más daño, velocidad de ataque y resistencia, y recarga sus habilidades casi al instante mientras dura | `ascension_fusion` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

Bloques de cuerpo abiertos para este campeón (de `docs/production/asset-blocks.json`):

- **B103** (P1, PENDIENTE): ataque_abajo
- **B103** (P1, PENDIENTE): ataque_arriba

- Habilidades registradas: Destino Restaurado, Visión del Inmortal, Danza del Augurio; definitiva: Ascensión del Elegido.
- Skins/sets registrados: Ángel Caído (Doncella Oscura) (`profecia`, set), Velo del Bosque (`profeta_ancestral`, skin).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 0 && node tools/art-world/runway-guardian.js profeta f00_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 1 && node tools/art-world/runway-guardian.js profeta f01_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 2 && node tools/art-world/runway-guardian.js profeta f02_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 3 && node tools/art-world/runway-guardian.js profeta f03_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 4 && node tools/art-world/runway-guardian.js profeta f04_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 5 && node tools/art-world/runway-guardian.js profeta f05_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 6 && node tools/art-world/runway-guardian.js profeta f06_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 7 && node tools/art-world/runway-guardian.js profeta f07_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 8 && node tools/art-world/runway-guardian.js profeta f08_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 9 && node tools/art-world/runway-guardian.js profeta f09_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 10 && node tools/art-world/runway-guardian.js profeta f10_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 11 && node tools/art-world/runway-guardian.js profeta f11_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 12 && node tools/art-world/runway-guardian.js profeta f12_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 13 && node tools/art-world/runway-guardian.js profeta f13_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 14 && node tools/art-world/runway-guardian.js profeta f14_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 15 && node tools/art-world/runway-guardian.js profeta f15_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 16 && node tools/art-world/runway-guardian.js profeta f16_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 17 && node tools/art-world/runway-guardian.js profeta f17_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 18 && node tools/art-world/runway-guardian.js profeta f18_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 19 && node tools/art-world/runway-guardian.js profeta f19_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 20 && node tools/art-world/runway-guardian.js profeta f20_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 21 && node tools/art-world/runway-guardian.js profeta f21_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 22 && node tools/art-world/runway-guardian.js profeta f22_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 23 && node tools/art-world/runway-guardian.js profeta f23_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 24 && node tools/art-world/runway-guardian.js profeta f24_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (casting raise: arms or weapon rise, the body stretches upward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 25 && node tools/art-world/runway-guardian.js profeta f25_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (casting release: thrust forward, the widest and most dynamic pose): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 26 && node tools/art-world/runway-guardian.js profeta f26_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (casting recover: arms lower, back to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 27 && node tools/art-world/runway-guardian.js profeta f27_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 28 && node tools/art-world/runway-guardian.js profeta f28_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 29 && node tools/art-world/runway-guardian.js profeta f29_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 30 && node tools/art-world/runway-guardian.js profeta f30_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (ultimate release: energy leaves, the body drops to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 31 && node tools/art-world/runway-guardian.js profeta f31_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 32 && node tools/art-world/runway-guardian.js profeta f32_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 33 && node tools/art-world/runway-guardian.js profeta f33_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (death fall: body falling sideways, feet off the ground): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 34 && node tools/art-world/runway-guardian.js profeta f34_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py profeta 35 && node tools/art-world/runway-guardian.js profeta f35_a1 "<prompt>" assets/ui/codex/champions/profeta.png art-source/runway-pose-refs/profeta/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Ismara, la Profeta Ciega, support, class color #4fd8c4), redrawn in exactly the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), same framing, facing the camera. Keep the @codex design and palette exactly. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
