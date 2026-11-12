# Saelis, la Heraldo del Plumaje (`saelis`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Soporte de bendiciones: deja Plumas en el suelo que aceleran y fortalecen a quien las recoge, y las convierte en proyectiles cuando la Horda se acerca. (categoría `soporte`) · ataque básico a distancia (alcance 280 u).
- **Color de clase:** `#9cd0f0` · brillo `#fff4cc`.
- **Origen:** Las copas altas del Bosque. Saelis cuidaba los nidos de las copas altas del Bosque cuando la Horda subió por los troncos. Las aves se fueron todas juntas, en una sola bandada, y le dejaron las plumas que perdieron al huir. Desde entonces las siembra en cada campo de batalla. Dice que una pluma en el suelo es una promesa: alguien va a volver a levantar vuelo.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/saelis.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/saelis/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py saelis --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/saelis.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Soporte de bendiciones (`roleCategory: soporte`), a distancia (básico 280 u, 520 ms). Siembra Plumas en el suelo que aceleran y fortalecen a quien las pisa, y las dispara de vuelta.
- **Tono:** Aérea, noble y ligera: una heraldo de las copas altas del Bosque. Plumas blancas con filo dorado, cielo azul pálido, viento; elegante pero cercana.
- **Fuentes del kit:** `js/champions/ascension/catalog.js:115`; `js/champions/ascension/catalog.js:123`; `js/champions/ascension/runtime.js:160`; pasiva en `js/champions/ascension/catalog.js:119`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/saelis/atlas.png`: blancos azulados `#d0d0f0`/`#b0b0d0`, grises `#707090`/`#9090b0`. Color de clase `#9cd0f0`, brillo `#fff4cc` (`ascension/catalog.js:115`). Dos alas de plumas, aro dorado detrás de la cabeza.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Celeste cielo (dominante) | `#9cd0f0` |
  | Oro pluma (acento) | `#fff4cc` |
  | Azul medio (sombra) | `#5a8cc0` |
  | Azul noche (contorno) | `#1d3250` |
  | Blanco pluma | `#ffffff` |
  | Lila gris (raquis y sombras) | `#9090b0` |

- **Motivos visuales:** plumas con raquis y filo dorado, alas abiertas, ráfagas curvas de viento, nubecitas, aro de luz, estelas de vuelo, hexágono de plumas en el suelo.
- **NO debe parecerse a:** **Elyra** (alas y luz verde-dorada de sanación): Saelis es celeste con plumas físicas, nada de rayos de luz verde. **Oriel** (pétalos rosa que caen): las plumas de Saelis son blancas y azules, rígidas, no pétalos. **Nano GM** (alas de luz/sombra): las de Saelis son plumas azules, nunca bicolor. **Mago/Facu GM** (agua azul): el celeste de Saelis es aire, sin gotas ni espuma.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Abanico de Plumas | Lanza cinco plumas en abanico: cada una daña a los dos primeros enemigos que cruza y queda clavada en el suelo como Pluma. | `ascension` | 22 u |
| Ráfaga Ascendente | Bate las alas: aparta a los comunes, frena a los élites, bendice a los aliados cercanos y dispara cada Pluma cercana contra el enemigo más próximo. | `ascension` | 150 u |
| Llamado del Plumaje | Todas sus Plumas vuelan de regreso: dañan a los enemigos del camino y cada una le acorta 0,2 s las recargas. Aunque no haya plumas, gana +20% de velocidad y bendice a los aliados que estén a su lado. | `ascension` | 26 u |
| **Cielo de Plumas** (definitiva) | Abre un cielo sobre la zona: caen plumas sobre los enemigos de adentro, los aliados quedan bendecidos y al final seis Plumas quedan en el suelo. | `ascension` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Abanico de Plumas, Ráfaga Ascendente, Llamado del Plumaje; definitiva: Cielo de Plumas.
- Skins de ascensión pendientes: {'id': 'saelis_alt1', 'nombre': 'Heraldo del Ocaso', 'iou_vs_base': 1.0}, {'id': 'saelis_alt2', 'nombre': 'Heraldo de la Aurora Boreal', 'iou_vs_base': 1.0}.

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 0 && node tools/art-world/runway-guardian.js saelis f00_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 1 && node tools/art-world/runway-guardian.js saelis f01_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 2 && node tools/art-world/runway-guardian.js saelis f02_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 3 && node tools/art-world/runway-guardian.js saelis f03_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 4 && node tools/art-world/runway-guardian.js saelis f04_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 5 && node tools/art-world/runway-guardian.js saelis f05_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 6 && node tools/art-world/runway-guardian.js saelis f06_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 7 && node tools/art-world/runway-guardian.js saelis f07_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 8 && node tools/art-world/runway-guardian.js saelis f08_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 9 && node tools/art-world/runway-guardian.js saelis f09_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 10 && node tools/art-world/runway-guardian.js saelis f10_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 11 && node tools/art-world/runway-guardian.js saelis f11_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 12 && node tools/art-world/runway-guardian.js saelis f12_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 13 && node tools/art-world/runway-guardian.js saelis f13_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 14 && node tools/art-world/runway-guardian.js saelis f14_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 15 && node tools/art-world/runway-guardian.js saelis f15_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 16 && node tools/art-world/runway-guardian.js saelis f16_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 17 && node tools/art-world/runway-guardian.js saelis f17_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 18 && node tools/art-world/runway-guardian.js saelis f18_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 19 && node tools/art-world/runway-guardian.js saelis f19_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 20 && node tools/art-world/runway-guardian.js saelis f20_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 21 && node tools/art-world/runway-guardian.js saelis f21_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 22 && node tools/art-world/runway-guardian.js saelis f22_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 23 && node tools/art-world/runway-guardian.js saelis f23_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 24 && node tools/art-world/runway-guardian.js saelis f24_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 25 && node tools/art-world/runway-guardian.js saelis f25_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 26 && node tools/art-world/runway-guardian.js saelis f26_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 27 && node tools/art-world/runway-guardian.js saelis f27_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 28 && node tools/art-world/runway-guardian.js saelis f28_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 29 && node tools/art-world/runway-guardian.js saelis f29_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 30 && node tools/art-world/runway-guardian.js saelis f30_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 31 && node tools/art-world/runway-guardian.js saelis f31_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 32 && node tools/art-world/runway-guardian.js saelis f32_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 33 && node tools/art-world/runway-guardian.js saelis f33_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 34 && node tools/art-world/runway-guardian.js saelis f34_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py saelis && python3 tools/art/pose-ref.py saelis 35 && node tools/art-world/runway-guardian.js saelis f35_a1 "<prompt>" art-source/runway-codex-clean/saelis.png art-source/runway-pose-refs/saelis/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Saelis, la Heraldo del Plumaje, support, class color #9cd0f0), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
