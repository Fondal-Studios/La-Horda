# Oriel, la Portera de las Cicatrices (`oriel`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Soporte de reposicionamiento: abre pares de portales a través de las Cicatrices de la Horda y convierte el mapa en un atajo para su equipo. (categoría `soporte`) · ataque básico a distancia (alcance 270 u).
- **Color de clase:** `#e05a7a` · brillo `#ffd0dc`.
- **Origen:** Las grietas del Reino Fúngico. Las Cicatrices de la Horda unen arenas que no deberían tocarse. Oriel trabajaba en la Fábrica marcando las grietas para que nadie cayera. Un día una se abrió bajo sus pies y salió del otro lado del Fúngico, viva. Desde entonces sabe dónde se puede pasar. No cierra las Cicatrices: las usa para llevar a los suyos lejos de la Horda antes de que la Horda llegue.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/oriel.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/oriel/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py oriel --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/oriel.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Soporte de reposicionamiento (`roleCategory: soporte`), a distancia (básico 270 u, 500 ms). Abre pares de portales que sacan al equipo del cerco.
- **Tono:** Serena y práctica, la que "conoce otro camino": portales, llaves y grietas, con una belleza herida (pétalos que brotan de las fisuras).
- **Fuentes del kit:** `js/champions/ascension/catalog.js:103`; `js/champions/ascension/catalog.js:111`; `js/champions/ascension/runtime.js:153`; pasiva en `js/champions/ascension/catalog.js:107`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/oriel/atlas.png`: rosa frambuesa `#d05070`/`#f07090`, ciruela `#703050`, rojizo `#905050`. Color de clase `#e05a7a`, brillo `#ffd0dc` (`ascension/catalog.js:103`). Arma: llave de las Cicatrices.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Frambuesa (dominante) | `#e05a7a` |
  | Rosa pálido (brillo) | `#ffd0dc` |
  | Ciruela (sombra) | `#8e2a48` |
  | Negro-vino (contorno y vacío del portal) | `#2a0a16` |
  | Blanco (borde de grieta) | `#ffffff` |
  | Oro viejo (llave, acento puntual) | `#d9b25c` |

- **Motivos visuales:** aros de fractura (portales), grietas que se abren con luz, llave ceremonial, pétalos que caen, pares conectados por un hilo, vacío oscuro con puntos de luz adentro.
- **NO debe parecerse a:** **Axiom** (Teletransporte/portal, icono `portal+arrow`) y **Aurelia** (Paso Luminal): sus saltos son digitales o dorados; los portales de Oriel son aros físicos con pétalos. **Vhal** (Pozo gravitatorio, vórtice violeta): el vacío de Oriel es negro-vino y no gira. **Myla/Ynara** (rosas pasteles): Oriel es frambuesa saturada con negro-vino.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Abrir Cicatriz | Abre un portal donde está y otro en el punto elegido. Aliados que entran salen por el otro; enemigos son rechazados. | `ascension` | 38 u |
| Eco de la Cicatriz | Cada portal abierto pulsa: daña enemigos y cura un poco a los aliados cercanos. | `ascension` | 120 u |
| Paso entre Mundos | Oriel aparece en su otro portal (o en el punto elegido) y deja una grieta que daña. | `ascension` | 70 u |
| **La Gran Cicatriz** (definitiva) | Abre una Cicatriz gigante: enemigos dentro se frenan y reciben daño; ecos de campeones caídos salen a golpear y los aliados dentro reciben −20% de daño. | `ascension` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Abrir Cicatriz, Eco de la Cicatriz, Paso entre Mundos; definitiva: La Gran Cicatriz.
- Skins de ascensión pendientes: {'id': 'oriel_alt1', 'nombre': 'Llavera del Alba', 'iou_vs_base': 1.0}, {'id': 'oriel_alt2', 'nombre': 'Guardiana del Ojo Rojo', 'iou_vs_base': 0.998}.

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 0 && node tools/art-world/runway-guardian.js oriel f00_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 1 && node tools/art-world/runway-guardian.js oriel f01_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 2 && node tools/art-world/runway-guardian.js oriel f02_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 3 && node tools/art-world/runway-guardian.js oriel f03_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 4 && node tools/art-world/runway-guardian.js oriel f04_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 5 && node tools/art-world/runway-guardian.js oriel f05_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 6 && node tools/art-world/runway-guardian.js oriel f06_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 7 && node tools/art-world/runway-guardian.js oriel f07_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 8 && node tools/art-world/runway-guardian.js oriel f08_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 9 && node tools/art-world/runway-guardian.js oriel f09_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 10 && node tools/art-world/runway-guardian.js oriel f10_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 11 && node tools/art-world/runway-guardian.js oriel f11_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 12 && node tools/art-world/runway-guardian.js oriel f12_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 13 && node tools/art-world/runway-guardian.js oriel f13_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 14 && node tools/art-world/runway-guardian.js oriel f14_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 15 && node tools/art-world/runway-guardian.js oriel f15_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 16 && node tools/art-world/runway-guardian.js oriel f16_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 17 && node tools/art-world/runway-guardian.js oriel f17_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 18 && node tools/art-world/runway-guardian.js oriel f18_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 19 && node tools/art-world/runway-guardian.js oriel f19_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 20 && node tools/art-world/runway-guardian.js oriel f20_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 21 && node tools/art-world/runway-guardian.js oriel f21_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 22 && node tools/art-world/runway-guardian.js oriel f22_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 23 && node tools/art-world/runway-guardian.js oriel f23_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 24 && node tools/art-world/runway-guardian.js oriel f24_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 25 && node tools/art-world/runway-guardian.js oriel f25_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 26 && node tools/art-world/runway-guardian.js oriel f26_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 27 && node tools/art-world/runway-guardian.js oriel f27_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 28 && node tools/art-world/runway-guardian.js oriel f28_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 29 && node tools/art-world/runway-guardian.js oriel f29_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 30 && node tools/art-world/runway-guardian.js oriel f30_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 31 && node tools/art-world/runway-guardian.js oriel f31_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 32 && node tools/art-world/runway-guardian.js oriel f32_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 33 && node tools/art-world/runway-guardian.js oriel f33_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 34 && node tools/art-world/runway-guardian.js oriel f34_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py oriel && python3 tools/art/pose-ref.py oriel 35 && node tools/art-world/runway-guardian.js oriel f35_a1 "<prompt>" art-source/runway-codex-clean/oriel.png art-source/runway-pose-refs/oriel/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Oriel, la Portera de las Cicatrices, support, class color #e05a7a), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
