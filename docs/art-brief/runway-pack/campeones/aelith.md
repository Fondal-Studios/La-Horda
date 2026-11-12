# Aelith, la Ladrona de Segundos (`aelith`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Maga temporal (categoría `mago`) · ataque básico a distancia (alcance 300 u).
- **Color de clase:** `#bfa7dc` · brillo `#bfa7dc`.
- **Origen:** Una estación de relojes sin trenes. Aelith reparaba relojes en una estación donde ningún tren volvía a tiempo. Tras la llegada de la Horda descubrió que los instantes perdidos seguían allí, suspendidos entre los dientes de los engranajes. Aprendió a soltarlos en ecos breves, incapaz de cambiar lo ocurrido. Cada aceleración exige una pausa después: roba segundos a su propio futuro, nunca una vida entera al pasado.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/aelith.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/aelith/factory-b76f27906a1dacff0014848b630711fbb0022c4df476f284be6c94afb48bf5eb/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py aelith --info`).
- Ojo: existe también `assets/sprites/champions/aelith/atlas.png` pero NO es el registrado; manda el de arriba.

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/aelith.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Maga temporal (rol mago, daño de área y control, a distancia). Tono: melancólico y preciso; una estación de relojes sin trenes, tiempo "robado" que se devuelve con intereses. Lenguaje: esfera de reloj, aguja, arena, eco.
- **Paleta sugerida:** lavanda `#bfa7dc` (color de clase, `quality-five/register.js:90`), ámbar de reloj `#eed5a4` (aguja que ya dibuja el juego, `aelith.js:65`), violeta de noche `#5a4a8c`, bronce `#f0c070`, crema `#fff8e0`, contorno `#1e1633`. (Atlas medido: castaños/crema con sombras `#3c2424`; el lavanda es la capa mágica, no el cuerpo.)
- **Motivos visuales:** esfera de reloj con 12 marcas, agujas que saltan de a un tic, arena que cae hacia arriba, engranaje fino, silueta fantasma duplicada ("eco"), grietas de vidrio de reloj.
- **NO debe parecerse a:** **Iria** (lavanda/índigo con triángulos e hilos: aquí NO hay triángulos ni líneas de hilo, solo círculos graduados y agujas); **Aurelia / Farolero / Dáriel** (dorado: el ámbar de Aelith es acento, nunca color dominante); **Brasa** (engranajes de latón con vapor: los de Aelith son finos, violetas y sin vapor); **Mago/Axiom** (cian/rayo).
- **Estado actual del VFX (verificado en código):** Tema procedural `time` (`js/champions/skill-fx-a/themes.js:6`, forma `sun`, motivos tick/sand/gear/spark) con plantillas genéricas: hab. 1 y definitiva = "nova" circular, hab. 2 = haz, hab. 3 = aura (`skill-fx-a/c/aelith.js`); más el anillo lavanda con aguja de `aelith.js:65`. Todas comparten el mismo arte base "nova": esta es la razón principal del rediseño.
- **Fuentes del kit:** `js/champions/quality-five/aelith.js` (kit :4-7, lanzamiento :14-41, objetos :43-58, premarcado :63-64), clase y pasiva `js/champions/quality-five/register.js:90`, básico `js/data/champion-identity.js:207-210`.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Instante roto | Daña un área y deja un eco que repite 30% del daño tras 0,8 s. Máximo dos ecos. | `expedition` | 75 u |
| Fractura de segundos | Abre una línea que daña y ralentiza a sus enemigos durante 1,8 s. | `expedition` | 26 u |
| Tiempo prestado | Gana 25% de velocidad y 10% de armadura durante 3 s. Después sufre 15% de lentitud durante 0,8 s. | `expedition` | 140 u |
| **La hora imposible** (definitiva) | Tres pulsos dañan y ralentizan enemigos. Escuda a aliados dentro del círculo. | `expedition` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Instante roto, Fractura de segundos, Tiempo prestado; definitiva: La hora imposible.
- Skins/sets registrados: Custodia del Mediodía (`quality_aelith`, set), Relojera del Vacío (`aelith_alt1`, skin), Segundo Carmesí (`aelith_croma`, croma).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 0 && node tools/art-world/runway-guardian.js aelith f00_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 1 && node tools/art-world/runway-guardian.js aelith f01_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 2 && node tools/art-world/runway-guardian.js aelith f02_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 3 && node tools/art-world/runway-guardian.js aelith f03_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 4 && node tools/art-world/runway-guardian.js aelith f04_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 5 && node tools/art-world/runway-guardian.js aelith f05_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 6 && node tools/art-world/runway-guardian.js aelith f06_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 7 && node tools/art-world/runway-guardian.js aelith f07_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 8 && node tools/art-world/runway-guardian.js aelith f08_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 9 && node tools/art-world/runway-guardian.js aelith f09_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 10 && node tools/art-world/runway-guardian.js aelith f10_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 11 && node tools/art-world/runway-guardian.js aelith f11_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 12 && node tools/art-world/runway-guardian.js aelith f12_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 13 && node tools/art-world/runway-guardian.js aelith f13_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 14 && node tools/art-world/runway-guardian.js aelith f14_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 15 && node tools/art-world/runway-guardian.js aelith f15_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 16 && node tools/art-world/runway-guardian.js aelith f16_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 17 && node tools/art-world/runway-guardian.js aelith f17_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 18 && node tools/art-world/runway-guardian.js aelith f18_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 19 && node tools/art-world/runway-guardian.js aelith f19_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 20 && node tools/art-world/runway-guardian.js aelith f20_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 21 && node tools/art-world/runway-guardian.js aelith f21_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 22 && node tools/art-world/runway-guardian.js aelith f22_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 23 && node tools/art-world/runway-guardian.js aelith f23_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 24 && node tools/art-world/runway-guardian.js aelith f24_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 25 && node tools/art-world/runway-guardian.js aelith f25_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 26 && node tools/art-world/runway-guardian.js aelith f26_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 27 && node tools/art-world/runway-guardian.js aelith f27_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 28 && node tools/art-world/runway-guardian.js aelith f28_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 29 && node tools/art-world/runway-guardian.js aelith f29_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 30 && node tools/art-world/runway-guardian.js aelith f30_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 31 && node tools/art-world/runway-guardian.js aelith f31_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 32 && node tools/art-world/runway-guardian.js aelith f32_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 33 && node tools/art-world/runway-guardian.js aelith f33_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 34 && node tools/art-world/runway-guardian.js aelith f34_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py aelith && python3 tools/art/pose-ref.py aelith 35 && node tools/art-world/runway-guardian.js aelith f35_a1 "<prompt>" art-source/runway-codex-clean/aelith.png art-source/runway-pose-refs/aelith/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aelith, la Ladrona de Segundos, mage, class color #bfa7dc), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
