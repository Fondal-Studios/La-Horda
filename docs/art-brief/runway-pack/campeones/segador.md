# Segador, el Olvidado (`segador`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Berserker / tanque ofensivo. Cuanto más daño recibe, más peligroso se vuelve. (categoría `tanque`) · ataque básico cuerpo a cuerpo (alcance 88 u, en arco).
- **Color de clase:** `#c62828` · brillo `#ff8a7a`.
- **Origen:** Un campo de batalla que nadie recuerda. Nadie sabe su nombre, ni siquiera él. Despertó entre los muertos de una guerra olvidada con una guadaña en las manos y una furia que no se apaga. La Horda lo reconoce como algo propio y lo teme por eso mismo. Cuanto más cerca está de volver a morir, más se parece a lo que los monstruos sueñan cuando sueñan con un cazador.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/segador.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/segador/codex-v1/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py segador --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/segador.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Berserker / tanque ofensivo (`roleCategory: tanque`), cuerpo a cuerpo (básico 88 u, 640 ms). Su recurso es la Furia (se gana peleando); cuanto menos vida, más daño.
- **Tono:** Brutal, pesado y agresivo (ART_BIBLE §4): un guerrero sin memoria. Filo ancho, sangre densa y almas pálidas; la violencia sale del tamaño y la silueta, no del realismo.
- **Fuentes del kit:** `js/data/champions.js:82`; `js/skills/abilities.js:1301`; `js/champions/segador.js:10`; `js/skills/abilities.js:1388`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/segador/idle_down_01.png` (sin atlas único): violeta/gris `#705070`/`#503070`/`#503050`, grises `#707070`. Color de clase `#c62828`, brillo `#ff8a7a` (`champions.js`): el rojo es el color del efecto, no del sprite.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Rojo sangre (dominante) | `#c62828` |
  | Rojo claro (filo y brillo) | `#ff8a7a` |
  | Rojo oscuro (sombra y sangre seca) | `#7a1620` |
  | Negro-rojo (contorno) | `#2a0a0e` |
  | Hueso pálido (almas y calaveras) | `#ffe9d6` |
  | Violeta capa (acento del cuerpo) | `#503070` |

- **Motivos visuales:** guadaña de hoja ancha, arcos de sangre, pinchos de armadura, latido de corazón, almas pálidas que suben, calavera emergiendo, cadenas rotas.
- **Pasiva:** *Furia* (recurso que no se regenera solo) y el bono por vida perdida (hasta +90% de daño con 0 de vida, `segador.js`) se muestran en la barra del HUD, no como efecto de combate; no se pide arte. Opcional: un pulso rojo más intenso en los bordes del héroe por debajo de 30% de vida.
- **NO debe parecerse a:** **Veyra** (carmesí `#ab3459`, tajos finos y latidos): el Segador es rojo ladrillo, hoja ancha y masa de sangre; sin hilos ni finura. **Kael/Guerrero** (rojo `#c4544a`, dagas y sangrado): el Segador usa arcos enormes y almas. **Thalen/Cataclismo** (hoy el Segador comparte el generador de estallidos con anillos naranja y cristales de hielo: ver Definitiva). **Ilvar** (calavera y almas verdes).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Tajo del Segador | Corte horizontal amplio; golpea a varios enemigos frente a él | `cone_slash` | 130 u |
| Armadura de la Furia | Recibe menos daño; cada golpe recibido genera más Furia | `fury_armor` | — u |
| Último Aliento | Intensifica su furor: más daño mientras dura, cura una porción al lanzarlo | `last_stand_burst` | — u |
| **Segador de Almas** (definitiva) | Furia máxima: daño e impacto enormes, resiste el control y roba vida. Cada baja alarga la duración | `berserker_ult` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

Bloques de cuerpo abiertos para este campeón (de `docs/production/asset-blocks.json`):

- **B104** (P1, PENDIENTE): ataque_abajo
- **B104** (P1, PENDIENTE): ataque_arriba

- Habilidades registradas: Tajo del Segador, Armadura de la Furia, Último Aliento; definitiva: Segador de Almas.
- Skins/sets registrados: Leónidas (Rey de Esparta) (`marea`, set), Filo de Escarcha (`segador_escarcha`, skin).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 0 && node tools/art-world/runway-guardian.js segador f00_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 1 && node tools/art-world/runway-guardian.js segador f01_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 2 && node tools/art-world/runway-guardian.js segador f02_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 3 && node tools/art-world/runway-guardian.js segador f03_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 4 && node tools/art-world/runway-guardian.js segador f04_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 5 && node tools/art-world/runway-guardian.js segador f05_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 6 && node tools/art-world/runway-guardian.js segador f06_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 7 && node tools/art-world/runway-guardian.js segador f07_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 8 && node tools/art-world/runway-guardian.js segador f08_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 9 && node tools/art-world/runway-guardian.js segador f09_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 10 && node tools/art-world/runway-guardian.js segador f10_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 11 && node tools/art-world/runway-guardian.js segador f11_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 12 && node tools/art-world/runway-guardian.js segador f12_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 13 && node tools/art-world/runway-guardian.js segador f13_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 14 && node tools/art-world/runway-guardian.js segador f14_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 15 && node tools/art-world/runway-guardian.js segador f15_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 16 && node tools/art-world/runway-guardian.js segador f16_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 17 && node tools/art-world/runway-guardian.js segador f17_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 18 && node tools/art-world/runway-guardian.js segador f18_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 19 && node tools/art-world/runway-guardian.js segador f19_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 20 && node tools/art-world/runway-guardian.js segador f20_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 21 && node tools/art-world/runway-guardian.js segador f21_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 22 && node tools/art-world/runway-guardian.js segador f22_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 23 && node tools/art-world/runway-guardian.js segador f23_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 24 && node tools/art-world/runway-guardian.js segador f24_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 25 && node tools/art-world/runway-guardian.js segador f25_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 26 && node tools/art-world/runway-guardian.js segador f26_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 27 && node tools/art-world/runway-guardian.js segador f27_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 28 && node tools/art-world/runway-guardian.js segador f28_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 29 && node tools/art-world/runway-guardian.js segador f29_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 30 && node tools/art-world/runway-guardian.js segador f30_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 31 && node tools/art-world/runway-guardian.js segador f31_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 32 && node tools/art-world/runway-guardian.js segador f32_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 33 && node tools/art-world/runway-guardian.js segador f33_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 34 && node tools/art-world/runway-guardian.js segador f34_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py segador && python3 tools/art/pose-ref.py segador 35 && node tools/art-world/runway-guardian.js segador f35_a1 "<prompt>" art-source/runway-codex-clean/segador.png art-source/runway-pose-refs/segador/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Segador, el Olvidado, tank, class color #c62828), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
