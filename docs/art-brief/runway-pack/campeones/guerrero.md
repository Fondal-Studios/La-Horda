# Kael, la Daga Carmesí (`guerrero`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Daño físico cuerpo a cuerpo contra objetivos y jefes. (categoría `asesino`) · ataque básico cuerpo a cuerpo (alcance 64 u).
- **Color de clase:** `#c4544a` · brillo `#f0a89a`.
- **Origen:** Los callejones de la Ciudad Maldita. Kael cobraba por desaparecer a la gente equivocada. Cuando la ciudad cayó descubrió que los monstruos también sangran, y que él sabe exactamente dónde cortar. No pelea por los Guardianes ni por la gloria: pelea porque nadie le paga mejor que la venganza, y porque la Horda se llevó lo único que no estaba en venta.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/guerrero.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/guerrero/codex-v1/atlas.png` (celda 144×144, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py guerrero --info`).
- Ojo: existe también `assets/sprites/champions/guerrero/atlas.png` pero NO es el registrado; manda el de arriba.

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/guerrero.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Asesino de combos (rol asesino, melee, objetivo y jefes). Tono: sigiloso, frío y cruel; cortes rápidos, trampas y veneno. Lenguaje: daga, sangre, rombo de trampa, humo.
- **Paleta sugerida:** carmesí `#c4544a` (color de clase, `champions.js:47`), rosa de sangre `#f0a89a`, rojo oscuro `#7a1c1c`, negro `#2a0808`, verde veneno `#8dffa0` (trampa y definitiva, `asesino.js:62`), violeta de sombra `#9a6ac7`. (Atlas medido: gris y blanco `#3c3c3c`/`#fcfcfc`: el rojo es acento de efectos, el cuerpo es gris encapuchado.)
- **Motivos visuales:** cortes diagonales rápidos, gotas de sangre, rombo de trampa con 4 puntas, humo violeta, hilo de veneno que gotea.
- **NO debe parecerse a:** **Veyra** (sangre y pacto, mitad B); **Segador** (guadaña roja pesada); **Musashi** (tinta azul y trazos largos); **Cazadora** (su trampa es verde oscuro de raíces; la de Kael es un rombo metálico con luz verde neón).
- **Estado actual del VFX (verificado en código):** Ya tiene hojas propias en `assets/vfx/guerrero/` (`corte_sangrante`, `triple_golpe`, `trampa`, `pestilencia`, 336x336 c/u) disparadas con `pushAsesinoFx` (`js/rendering/effects.js:295`) más el tema procedural `blood` (`themes.js:18`, forma `spike`). `skill-fx-a/c/guerrero.js` añade estallido de sangre por habilidad y nova de 60 u en la definitiva.
- **Fuentes del kit:** `js/data/champions.js:46-57`, `js/skills/abilities.js:893-902` (Corte), `:1252-1269` (Triple), `:1271-1289` (Trampa), `:1291-1298` (sigilo), `js/champions/asesino.js:11-109` (trampas y Pestilencia), `aim-targeting.js:15-16,32-33`.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Corte Sangrante | Aplica un sangrado profundo | `bleed_hit` | — u |
| Triple Golpe | Tres golpes veloces; el último causa +300% de daño | `triple_hit` | — u |
| Trampa de Área | Coloca una trampa que explota y encadena daño | `area_trap` | 65 u |
| **Pestilencia Sombría** (definitiva) | Sigilo total y un triple golpe que envenena y encadena sangrado | `shadow_stealth` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

Bloques de cuerpo abiertos para este campeón (de `docs/production/asset-blocks.json`):

- **B003** (P0, EN_CORRECCION): lanzar
- **B003** (P0, EN_CORRECCION): muerte
- **B003** (P0, EN_CORRECCION): golpe

- Habilidades registradas: Corte Sangrante, Triple Golpe, Trampa de Área; definitiva: Pestilencia Sombría.
- Skins/sets registrados: Jack el Destripador (Caballero Carmesí) (`nocturno`, set).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 0 && node tools/art-world/runway-guardian.js guerrero f00_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 1 && node tools/art-world/runway-guardian.js guerrero f01_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 2 && node tools/art-world/runway-guardian.js guerrero f02_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 3 && node tools/art-world/runway-guardian.js guerrero f03_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 4 && node tools/art-world/runway-guardian.js guerrero f04_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 5 && node tools/art-world/runway-guardian.js guerrero f05_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 6 && node tools/art-world/runway-guardian.js guerrero f06_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 7 && node tools/art-world/runway-guardian.js guerrero f07_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 8 && node tools/art-world/runway-guardian.js guerrero f08_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 9 && node tools/art-world/runway-guardian.js guerrero f09_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 10 && node tools/art-world/runway-guardian.js guerrero f10_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 11 && node tools/art-world/runway-guardian.js guerrero f11_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 12 && node tools/art-world/runway-guardian.js guerrero f12_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 13 && node tools/art-world/runway-guardian.js guerrero f13_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 14 && node tools/art-world/runway-guardian.js guerrero f14_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 15 && node tools/art-world/runway-guardian.js guerrero f15_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 16 && node tools/art-world/runway-guardian.js guerrero f16_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 17 && node tools/art-world/runway-guardian.js guerrero f17_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 18 && node tools/art-world/runway-guardian.js guerrero f18_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 19 && node tools/art-world/runway-guardian.js guerrero f19_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 20 && node tools/art-world/runway-guardian.js guerrero f20_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 21 && node tools/art-world/runway-guardian.js guerrero f21_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 22 && node tools/art-world/runway-guardian.js guerrero f22_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 23 && node tools/art-world/runway-guardian.js guerrero f23_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 24 && node tools/art-world/runway-guardian.js guerrero f24_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 25 && node tools/art-world/runway-guardian.js guerrero f25_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 26 && node tools/art-world/runway-guardian.js guerrero f26_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 27 && node tools/art-world/runway-guardian.js guerrero f27_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 28 && node tools/art-world/runway-guardian.js guerrero f28_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 29 && node tools/art-world/runway-guardian.js guerrero f29_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 30 && node tools/art-world/runway-guardian.js guerrero f30_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 31 && node tools/art-world/runway-guardian.js guerrero f31_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 32 && node tools/art-world/runway-guardian.js guerrero f32_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 33 && node tools/art-world/runway-guardian.js guerrero f33_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 34 && node tools/art-world/runway-guardian.js guerrero f34_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py guerrero && python3 tools/art/pose-ref.py guerrero 35 && node tools/art-world/runway-guardian.js guerrero f35_a1 "<prompt>" art-source/runway-codex-clean/guerrero.png art-source/runway-pose-refs/guerrero/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Kael, la Daga Carmesí, assassin, class color #c4544a), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
