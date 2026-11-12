# Tibor, el Rey sin Corona (`tibor`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Mago territorial con una sola nube que debe conservar y recolocar. (categoría `mago`) · ataque básico a distancia (alcance 300 u).
- **Color de clase:** `#c9b365` · brillo `#c9b365`.
- **Origen:** Los apiarios del Reino Fúngico. A Tibor lo llamaban rey porque era incapaz de dar una orden a sus abejas: les abría las cajas y esperaba. Cuando el micelio empezó a repetir voces humanas, una colonia se instaló en su carro y las demás quedaron cubiertas de cera gris. Las conduce por donde el aire todavía deja pasar la luz. Si encuentra un lugar seguro, piensa dejar allí la colmena y marcharse sin corona.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/tibor.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/tibor/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py tibor --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/tibor.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Mago territorial (`roleCategory: mago`), a distancia (básico 300 u, 560 ms). Una sola nube de abejas por vez que debe conservar y recolocar; su "Colonia" (0–100) se gasta con cada pulso.
- **Tono:** Apacible, terco y humilde: apicultor que no da órdenes, solo abre las cajas. Miel, cera y zumbido; nada agresivo ni brillante.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:43`; `js/champions/expedition/catalog.js:48`; `js/champions/expedition/runtime.js:57`; pasiva en `js/champions/expedition/catalog.js:46`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/tibor/atlas.png`: crema `#f0d0b0`/`#d0b090`, marrón `#705030`/`#905030`, ámbar `#b07030`. Color de clase `#c9b365` (`catalog.js:43`). Máscara de malla, colmena a la espalda, incensario.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Miel apagada (dominante) | `#c9b365` |
  | Miel clara / polen | `#f5df8a` |
  | Miel oscura (sombra) | `#8a6d1c` |
  | Marrón-negro (contorno y rayas de abeja) | `#3a2a08` |
  | Cera crema (panal) | `#fff6c8` |
  | Humo gris-marrón del incensario | `#8a7a62` |

- **Motivos visuales:** abejas con rayas, panal de hexágonos, nube de zumbido que orbita, polen, humo de incensario, gotas de miel, la colmena pequeña.
- **NO debe parecerse a:** **Khepri** (enjambre de escarabajos verde metálico, Enjambre/Eclipse): las abejas son amarillas con rayas y alas translúcidas, siempre con panal; Khepri no usa hexágonos. **Orsa** (ámbar-cobre `#dfa352`) y **Zahra** (naranja de horno): el amarillo de Tibor es miel apagada y cera, sin chispas ni llamas. **Aurelia** (oro brillante).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Nube obrera | Coloca una nube que daña cada 600 ms hasta agotarse o expirar. | `expedition` | 110 u |
| Volvé a casa | Retira la nube, daña su recorrido y recupera 20 de fuerza. Escudo 7%; sin nube, 3%. | `expedition` | 30 u |
| Polen de aviso | Salpicadura que daña, frena y mueve la nube al punto elegido. | `expedition` | 90 u |
| **El cielo zumba** (definitiva) | Rellena la fuerza y reemplaza la nube por otra mayor durante 6 s. | `expedition` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Nube obrera, Volvé a casa, Polen de aviso; definitiva: El cielo zumba.
- Skins/sets registrados: Colmena de Ámbar (`exp_tibor`, set), Señor de las Polillas (`tibor_skin`, skin), Ceniza del Alba (`tibor_croma`, croma).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 0 && node tools/art-world/runway-guardian.js tibor f00_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 1 && node tools/art-world/runway-guardian.js tibor f01_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 2 && node tools/art-world/runway-guardian.js tibor f02_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 3 && node tools/art-world/runway-guardian.js tibor f03_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 4 && node tools/art-world/runway-guardian.js tibor f04_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 5 && node tools/art-world/runway-guardian.js tibor f05_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 6 && node tools/art-world/runway-guardian.js tibor f06_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 7 && node tools/art-world/runway-guardian.js tibor f07_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 8 && node tools/art-world/runway-guardian.js tibor f08_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 9 && node tools/art-world/runway-guardian.js tibor f09_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 10 && node tools/art-world/runway-guardian.js tibor f10_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 11 && node tools/art-world/runway-guardian.js tibor f11_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 12 && node tools/art-world/runway-guardian.js tibor f12_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 13 && node tools/art-world/runway-guardian.js tibor f13_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 14 && node tools/art-world/runway-guardian.js tibor f14_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 15 && node tools/art-world/runway-guardian.js tibor f15_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 16 && node tools/art-world/runway-guardian.js tibor f16_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 17 && node tools/art-world/runway-guardian.js tibor f17_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 18 && node tools/art-world/runway-guardian.js tibor f18_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 19 && node tools/art-world/runway-guardian.js tibor f19_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 20 && node tools/art-world/runway-guardian.js tibor f20_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 21 && node tools/art-world/runway-guardian.js tibor f21_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 22 && node tools/art-world/runway-guardian.js tibor f22_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 23 && node tools/art-world/runway-guardian.js tibor f23_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 24 && node tools/art-world/runway-guardian.js tibor f24_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 25 && node tools/art-world/runway-guardian.js tibor f25_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 26 && node tools/art-world/runway-guardian.js tibor f26_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 27 && node tools/art-world/runway-guardian.js tibor f27_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 28 && node tools/art-world/runway-guardian.js tibor f28_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 29 && node tools/art-world/runway-guardian.js tibor f29_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 30 && node tools/art-world/runway-guardian.js tibor f30_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 31 && node tools/art-world/runway-guardian.js tibor f31_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 32 && node tools/art-world/runway-guardian.js tibor f32_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 33 && node tools/art-world/runway-guardian.js tibor f33_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 34 && node tools/art-world/runway-guardian.js tibor f34_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tibor && python3 tools/art/pose-ref.py tibor 35 && node tools/art-world/runway-guardian.js tibor f35_a1 "<prompt>" art-source/runway-codex-clean/tibor.png art-source/runway-pose-refs/tibor/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Tibor, el Rey sin Corona, mage, class color #c9b365), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
