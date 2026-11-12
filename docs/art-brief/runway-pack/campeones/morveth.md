# Morveth, el Jardinero de la Peste (`morveth`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Mago invocador (categoría `mago`) · ataque básico a distancia (alcance 300 u).
- **Color de clase:** `#a4c56a` · brillo `#a4c56a`.
- **Origen:** El jardín de un hospital sitiado. Morveth cuidaba el jardín de un hospital sitiado. Cuando las medicinas se agotaron, descubrió un micelio capaz de retener la infección en sus raíces. Ahora transporta aquel cultivo en una urna agrietada. Sus hongos necesitan tiempo y terreno para extenderse; arrancarlos deja al jardinero expuesto. No busca una cura perfecta, sino impedir que la próxima cosecha sean los vivos.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/morveth.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/morveth/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py morveth --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/morveth.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Mago invocador (rol mago, infección, hongos y contagio, a distancia). Tono: sereno, clínico y torcido; cultiva un jardín en un hospital sitiado. Lenguaje: hongo, espora, micelio, contagio.
- **Paleta sugerida:** verde enfermizo `#a4c56a` (color de clase, `quality-five/register.js:73`), verde oscuro `#4a6a24`, claro `#dcf0a0`, púrpura de sombrero `#7c476b` (el que ya dibuja el juego, `morveth.js:91`) y acento `#b070d8`, hueso `#d6c1a0` (tallo), contorno `#121c08`.
- **Motivos visuales:** sombrero de hongo con láminas, tallo hueso, esporas en nube, hilos de micelio, flores marchitas, "puntos" de infección.
- **NO debe parecerse a:** **Kael** (su definitiva es verde neón con humo violeta: la peste de Morveth es opaca, amarillo-verdosa, con hongos físicos); **Sylva/Maura** (verde vegetal natural); **Khepri** (iridiscente de insectos); **Nigromante** (verde alma, mitad B); **Brasa** (vapor blanco): las esporas de Morveth no son vapor.
- **Estado actual del VFX (verificado en código):** Tema procedural `plague` (`themes.js:27`, forma `scallop`, motivos spore/shroom/drop/smoke). `skill-fx-a/c/morveth.js`: hongo = prop con motivo "shroom" + estallido, hab. 2 = cono, hab. 3 = nova + aura, definitiva = nova; el hongo y el anillo verde se dibujan en `morveth.js:89-92` (tallo 6x14 u, sombrero elíptico de 28x16 u).
- **Fuentes del kit:** `js/champions/quality-five/morveth.js` (kit :4-8, lanzamiento :26-44, infección :11-25, objetos :45-67, premarcado :87-88, dibujo :89-92), clase y pasiva `quality-five/register.js:73`.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Huerto maldito | Planta un hongo destructible que libera seis pulsos de esporas. Máximo tres hongos. | `expedition` | 85 u |
| Exhalación de peste | Daña un abanico e infecta a sus víctimas durante tres pulsos. | `expedition` | 35 u |
| Simbiosis | Obtiene 15% de armadura y sana 2% de vida. Consume un hongo cercano para sanar 4% en total. | `expedition` | 150 u |
| **Jardín de la peste** (definitiva) | Cuatro pulsos infectan, dañan y ralentizan. Los aliados dentro del jardín reciben protección. | `expedition` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Huerto maldito, Exhalación de peste, Simbiosis; definitiva: Jardín de la peste.
- Skins/sets registrados: Huerto de Sal (`quality_morveth`, set), Micelio Abisal (`morveth_alt1`, skin), Musgo del Retorno (`morveth_croma`, croma).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 0 && node tools/art-world/runway-guardian.js morveth f00_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 1 && node tools/art-world/runway-guardian.js morveth f01_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 2 && node tools/art-world/runway-guardian.js morveth f02_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 3 && node tools/art-world/runway-guardian.js morveth f03_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 4 && node tools/art-world/runway-guardian.js morveth f04_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 5 && node tools/art-world/runway-guardian.js morveth f05_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 6 && node tools/art-world/runway-guardian.js morveth f06_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 7 && node tools/art-world/runway-guardian.js morveth f07_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 8 && node tools/art-world/runway-guardian.js morveth f08_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 9 && node tools/art-world/runway-guardian.js morveth f09_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 10 && node tools/art-world/runway-guardian.js morveth f10_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 11 && node tools/art-world/runway-guardian.js morveth f11_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 12 && node tools/art-world/runway-guardian.js morveth f12_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 13 && node tools/art-world/runway-guardian.js morveth f13_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 14 && node tools/art-world/runway-guardian.js morveth f14_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 15 && node tools/art-world/runway-guardian.js morveth f15_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 16 && node tools/art-world/runway-guardian.js morveth f16_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 17 && node tools/art-world/runway-guardian.js morveth f17_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 18 && node tools/art-world/runway-guardian.js morveth f18_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 19 && node tools/art-world/runway-guardian.js morveth f19_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 20 && node tools/art-world/runway-guardian.js morveth f20_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 21 && node tools/art-world/runway-guardian.js morveth f21_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 22 && node tools/art-world/runway-guardian.js morveth f22_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 23 && node tools/art-world/runway-guardian.js morveth f23_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 24 && node tools/art-world/runway-guardian.js morveth f24_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 25 && node tools/art-world/runway-guardian.js morveth f25_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 26 && node tools/art-world/runway-guardian.js morveth f26_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 27 && node tools/art-world/runway-guardian.js morveth f27_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 28 && node tools/art-world/runway-guardian.js morveth f28_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 29 && node tools/art-world/runway-guardian.js morveth f29_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 30 && node tools/art-world/runway-guardian.js morveth f30_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 31 && node tools/art-world/runway-guardian.js morveth f31_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 32 && node tools/art-world/runway-guardian.js morveth f32_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 33 && node tools/art-world/runway-guardian.js morveth f33_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 34 && node tools/art-world/runway-guardian.js morveth f34_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py morveth && python3 tools/art/pose-ref.py morveth 35 && node tools/art-world/runway-guardian.js morveth f35_a1 "<prompt>" art-source/runway-codex-clean/morveth.png art-source/runway-pose-refs/morveth/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Morveth, el Jardinero de la Peste, mage, class color #a4c56a), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
