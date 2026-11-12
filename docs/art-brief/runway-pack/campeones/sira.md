# Sira, la Cartógrafa del Regreso (`sira`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Maga que dibuja con su recorrido y convierte trayectos recientes en ataques. (categoría `mago`) · ataque básico a distancia (alcance 310 u).
- **Color de clase:** `#8aa7da` · brillo `#8aa7da`.
- **Origen:** Las entradas del Laberinto. El padre de Sira volvió del Laberinto con un mapa en blanco, señaló caminos que nadie más veía y un día salió sin abrigo. Sira siguió su última marca y encontró otras en muros, telas y huesos: no indicaban adónde ir, sino dónde alguien había conseguido regresar. Desde entonces registra sus propios pasos y borra las rutas que ya no son seguras.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/sira.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/sira/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py sira --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/sira.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Maga de trazado (`roleCategory: mago`), a distancia (básico 310 u, 570 ms). Dibuja con su propio recorrido (hasta 12 puntos de los últimos 4 s) y lo convierte en ataques.
- **Tono:** Meticulosa, melancólica y decidida: marca los caminos por los que alguien consiguió volver. Tinta, pergamino, brújula, cruces de mapa; líneas hechas a mano, no mágicas ni eléctricas.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:61`; `js/champions/expedition/catalog.js:66`; `js/champions/expedition/runtime.js:67`; pasiva en `js/champions/expedition/catalog.js:64`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/sira/atlas.png`: grises claros `#d0d0d0`/`#b0b0b0`, piel `#f0d0b0`, azul `#303070`/`#707090`. Color de clase `#8aa7da` (`catalog.js:61`). Capa corta con mapas, rollo lateral, pluma de agrimensor.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Azul tinta (dominante) | `#3b5a9a` |
  | Azul claro de trazo | `#8aa7da` |
  | Azul-negro (tinta seca y contorno) | `#101a33` |
  | Pergamino (papel) | `#e8d9b0` |
  | Blanco azulado (brillo) | `#cfe0ff` |
  | Rojo de cruz de mapa (acento puntual) | `#c0453a` |

- **Motivos visuales:** trazos de pluma con salpicaduras, cruces X de tesoro/mapa, líneas punteadas de ruta, huellas, brújula, rosa de los vientos, pergamino que se despliega, goma de borrar.
- **NO debe parecerse a:** **Iria** (hilos y anclas, `#8889c1`, violeta-azulado): Sira es azul tinta con pergamino y cruces, líneas "a mano"; Iria es hilo tenso con nudos. **Vhal** (índigo con estrellas) y **Saelis** (celeste): sin estrellas ni plumas. **Orsa/Nano GM** (otras líneas largas): Sira es siempre tinta azul con salpicaduras, nunca cobre ni negro-oro.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Línea de tinta | Trazo recto que atraviesa hasta 12 enemigos. | `expedition` | 24 u |
| Volver sobre los pasos | Recorre hacia atrás hasta 170 unidades del trazo válido. Comprueba cada paso contra muros y vacíos. Sin trazo, retrocede un tramo corto; siempre gana +20% de velocidad 2,5 s. | `expedition` | 24 u |
| Borrar el camino | Consume el trazo e impacta una sola vez por objetivo; sin ruta usa un círculo de radio 80. | `expedition` | 28 u |
| **Atlas de los ausentes** (definitiva) | Tres pulsos sobre una copia de la ruta; sin ruta dibuja un rombo local. No altera el mapa. Frena a los enemigos cercanos y da +15% de velocidad a los aliados. | `expedition` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Línea de tinta, Volver sobre los pasos, Borrar el camino; definitiva: Atlas de los ausentes.
- Skins/sets registrados: Cartógrafa Corsaria (`exp_sira`, set), Atlas Astral (`sira_skin`, skin), Ceniza del Alba (`sira_croma`, croma).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 0 && node tools/art-world/runway-guardian.js sira f00_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 1 && node tools/art-world/runway-guardian.js sira f01_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 2 && node tools/art-world/runway-guardian.js sira f02_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 3 && node tools/art-world/runway-guardian.js sira f03_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 4 && node tools/art-world/runway-guardian.js sira f04_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 5 && node tools/art-world/runway-guardian.js sira f05_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 6 && node tools/art-world/runway-guardian.js sira f06_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 7 && node tools/art-world/runway-guardian.js sira f07_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 8 && node tools/art-world/runway-guardian.js sira f08_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 9 && node tools/art-world/runway-guardian.js sira f09_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 10 && node tools/art-world/runway-guardian.js sira f10_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 11 && node tools/art-world/runway-guardian.js sira f11_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 12 && node tools/art-world/runway-guardian.js sira f12_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 13 && node tools/art-world/runway-guardian.js sira f13_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 14 && node tools/art-world/runway-guardian.js sira f14_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 15 && node tools/art-world/runway-guardian.js sira f15_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 16 && node tools/art-world/runway-guardian.js sira f16_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 17 && node tools/art-world/runway-guardian.js sira f17_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 18 && node tools/art-world/runway-guardian.js sira f18_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 19 && node tools/art-world/runway-guardian.js sira f19_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 20 && node tools/art-world/runway-guardian.js sira f20_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 21 && node tools/art-world/runway-guardian.js sira f21_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 22 && node tools/art-world/runway-guardian.js sira f22_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 23 && node tools/art-world/runway-guardian.js sira f23_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 24 && node tools/art-world/runway-guardian.js sira f24_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (casting raise: arms or weapon rise, the body stretches upward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 25 && node tools/art-world/runway-guardian.js sira f25_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (casting release: thrust forward, the widest and most dynamic pose): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 26 && node tools/art-world/runway-guardian.js sira f26_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (casting recover: arms lower, back to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 27 && node tools/art-world/runway-guardian.js sira f27_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 28 && node tools/art-world/runway-guardian.js sira f28_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 29 && node tools/art-world/runway-guardian.js sira f29_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 30 && node tools/art-world/runway-guardian.js sira f30_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (ultimate release: energy leaves, the body drops to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 31 && node tools/art-world/runway-guardian.js sira f31_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 32 && node tools/art-world/runway-guardian.js sira f32_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 33 && node tools/art-world/runway-guardian.js sira f33_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (death fall: body falling sideways, feet off the ground): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 34 && node tools/art-world/runway-guardian.js sira f34_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `python3 tools/art/pose-ref.py sira 35 && node tools/art-world/runway-guardian.js sira f35_a1 "<prompt>" assets/ui/codex/champions/sira.png art-source/runway-pose-refs/sira/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sira, la Cartógrafa del Regreso, mage, class color #8aa7da), redrawn in exactly the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), same framing, facing the camera. Keep the @codex design and palette exactly. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
