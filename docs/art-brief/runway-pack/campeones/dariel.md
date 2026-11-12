# Dáriel, el Último Compás (`dariel`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Músico de ritmo alternado: daño moderado, protección y recuperación acotada. (categoría `soporte`) · ataque básico a distancia (alcance 300 u).
- **Color de clase:** `#d6af77` · brillo `#d6af77`.
- **Origen:** El teatro de la Ciudad Maldita. Dáriel dirigía la música entre escenas. Cuando el Presentador dejó de permitir que el público se levantara, cambió el final de una melodía por la señal de evacuación de los tramoyistas, y unos pocos siguieron el ritmo hasta las puertas de servicio. Él salió último, marcando el compás. Ahora viaja con los portadores tocando una canción que sabe callarse cuando todos cruzaron.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/dariel.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/dariel/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py dariel --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/dariel.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Soporte rítmico (rol soporte, protección y recuperación acotada, a distancia). Tono: elegante, cansado, con humor seco; dirigía la música entre escenas y marcó la salida de emergencia. Lenguaje: pentagrama, nota, diapasón, telón.
- **Paleta sugerida:** ocre `#d6af77` (color de clase, `expedition/catalog.js:31`), crema `#f6dba8` y `#fffaf0`, vino `#7a1f35`, negro cálido `#1a1410`, acento violeta `#c88aff` (acento del tema `music`). (Atlas: marrón `#6c3c24`, dorado apagado `#b4843c`.)
- **Motivos visuales:** pentagrama de 5 líneas, notas (negra, corchea, bemol), diapasón, telón de teatro, cartel de salida, aplausos.
- **NO debe parecerse a:** **Baltra** (sonido como anillos concéntricos de bronce; el de Dáriel son NOTAS y pentagramas); **Aelith/Aurelia/Farolero** (dorados: Dáriel mezcla ocre con vino y negro); **Libertador** (clarín); **Velmira** (máscaras).
- **Estado actual del VFX (verificado en código):** Tema procedural `music` (`themes.js:14`, forma `wave`, motivos note/note2/star/spark). `skill-fx-a/c/dariel.js`: hab. 1 = cono, hab. 2 y 3 = nova en sí mismo + aura de aliados, definitiva = nova. Las notas acumuladas se muestran como texto "♪♪♪" sobre la cabeza (`expedition/render.js:34`).
- **Fuentes del kit:** `js/champions/expedition/catalog.js:31-36`, lanzamiento `expedition/runtime.js:49-52`, cono `:6`, nota acumulada `:30`, premarcado `aim-targeting.js:69`, proyectil `expedition/register.js:3`.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Nota discordante | Cono sonoro: daño y −8% de daño enemigo durante 1,5 s; jefes −4%. | `expedition` | 95 u |
| Marcha de salida | Aliados cercanos: escudo 4% sin acumular y velocidad +8%. | `expedition` | 150 u |
| Volver al estribillo | Daño circular y cura 1% +0,6% por nota consumida; máximo 2,8%. | `expedition` | 130 u |
| **Todavía hay una salida** (definitiva) | Seis pulsos alternan daño y cura de 1% con escudo de 2%, sin acumulación. | `expedition` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Nota discordante, Marcha de salida, Volver al estribillo; definitiva: Todavía hay una salida.
- Skins/sets registrados: Carnaval de Medianoche (`exp_dariel`, set), Director del Réquiem (`dariel_skin`, skin), Ceniza del Alba (`dariel_croma`, croma).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 0 && node tools/art-world/runway-guardian.js dariel f00_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 1 && node tools/art-world/runway-guardian.js dariel f01_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 2 && node tools/art-world/runway-guardian.js dariel f02_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 3 && node tools/art-world/runway-guardian.js dariel f03_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 4 && node tools/art-world/runway-guardian.js dariel f04_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 5 && node tools/art-world/runway-guardian.js dariel f05_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 6 && node tools/art-world/runway-guardian.js dariel f06_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 7 && node tools/art-world/runway-guardian.js dariel f07_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 8 && node tools/art-world/runway-guardian.js dariel f08_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 9 && node tools/art-world/runway-guardian.js dariel f09_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 10 && node tools/art-world/runway-guardian.js dariel f10_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 11 && node tools/art-world/runway-guardian.js dariel f11_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 12 && node tools/art-world/runway-guardian.js dariel f12_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 13 && node tools/art-world/runway-guardian.js dariel f13_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 14 && node tools/art-world/runway-guardian.js dariel f14_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 15 && node tools/art-world/runway-guardian.js dariel f15_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 16 && node tools/art-world/runway-guardian.js dariel f16_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 17 && node tools/art-world/runway-guardian.js dariel f17_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 18 && node tools/art-world/runway-guardian.js dariel f18_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 19 && node tools/art-world/runway-guardian.js dariel f19_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 20 && node tools/art-world/runway-guardian.js dariel f20_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 21 && node tools/art-world/runway-guardian.js dariel f21_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 22 && node tools/art-world/runway-guardian.js dariel f22_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 23 && node tools/art-world/runway-guardian.js dariel f23_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 24 && node tools/art-world/runway-guardian.js dariel f24_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 25 && node tools/art-world/runway-guardian.js dariel f25_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 26 && node tools/art-world/runway-guardian.js dariel f26_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 27 && node tools/art-world/runway-guardian.js dariel f27_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 28 && node tools/art-world/runway-guardian.js dariel f28_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 29 && node tools/art-world/runway-guardian.js dariel f29_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 30 && node tools/art-world/runway-guardian.js dariel f30_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 31 && node tools/art-world/runway-guardian.js dariel f31_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 32 && node tools/art-world/runway-guardian.js dariel f32_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 33 && node tools/art-world/runway-guardian.js dariel f33_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 34 && node tools/art-world/runway-guardian.js dariel f34_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py dariel && python3 tools/art/pose-ref.py dariel 35 && node tools/art-world/runway-guardian.js dariel f35_a1 "<prompt>" art-source/runway-codex-clean/dariel.png art-source/runway-pose-refs/dariel/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Dáriel, el Último Compás, support, class color #d6af77), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
