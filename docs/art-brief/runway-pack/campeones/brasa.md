# Brasa, la Mecánica Fugitiva (`brasa`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Ingeniera de posición: torretas, presión y vapor. (categoría `mago`) · ataque básico a distancia (alcance 310 u).
- **Color de clase:** `#c58543` · brillo `#ffd28a`.
- **Origen:** La Fábrica Sin Fin. Brasa mantenía las máquinas de la Fábrica Sin Fin. Un día descubrió que una de sus cadenas no estaba hecha para un monstruo, sino para alguien que se había negado a obedecer. Escapó con los planos bajo el brazo y una llave inglesa que nunca suelta. Todavía no sabe quién estaba del otro lado de esa cadena, y desarma cada máquina de la Horda buscando la respuesta.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/brasa.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/brasa/atlas.png` (celda 96×96, 6 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py brasa --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/brasa.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Ingeniera de posición (rol mago, torretas, presión y vapor, a distancia). Tono: práctico, cansado y obstinado; escapó de la Fábrica con los planos y una llave inglesa. Lenguaje: latón, caldera, manómetro, silbato, vapor.
- **Paleta sugerida:** latón `#c58543` y brillo `#ffd28a` (color y glow de clase, `data/portadores.js:21`), rojo de caldera `#b43c24` y `#842424` (atlas), vapor `#fff4dc`, hierro `#3c2424`, contorno `#2a1608`.
- **Motivos visuales:** engranajes gruesos de pocos dientes, válvulas, tuberías con codo, manómetro de aguja, remaches, nubes de vapor con perlas de condensación, sirena giratoria.
- **NO debe parecerse a:** **Brakk** (también torretas: Brakk es hierro oscuro cuadrado con clavos y fogonazo naranja; Brasa es latón redondo con chimenea y vapor); **Zahra** (válvulas y calor de horno, segunda mitad); **Farolero/Aurelia/Dáriel** (dorados: el latón de Brasa es naranja-rojizo con vapor blanco); **Morwen** (frascos de vidrio).
- **Estado actual del VFX (verificado en código):** Tema procedural `steam` (`themes.js:11`, forma `gear`, motivos gear/steam/rivet/spark). `skill-fx-a/c/brasa.js`: torreta = estallido + nova, Purga = cono, Desmontaje = aura + estallido, definitiva = nova r=120 + nova por torreta. Firma de partículas: engranaje `#ffcb78` (`skills/champion-signatures.js:9`).
- **Fuentes del kit:** `js/data/portadores.js:21-28` (stats y kit), `js/champions/portadores.js:57-61` (torreta), `:94-109` (lanzamiento), `:210-214` (pasiva), `:239-` (objetos), `skill-fx-a/c/brasa.js`.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Centinela de Latón | Monta una torreta fija con vida propia. Máximo dos; una tercera retira la más antigua. | `br_turret` | 40 u |
| Purga de Vapor | Cono de vapor: descarga la presión y empuja comunes; ralentiza a jefes sin moverlos. | `br_purge` | 110 u |
| Desmontaje Rápido | Retira la torreta más cercana, recupera parte de su recarga y acelera. Sin torreta también acelera. | `br_dismantle` | — u |
| **Turno de Emergencia** (definitiva) | Sobrecarga sus torretas. Sin ninguna, monta una temporal. Después deben enfriarse. | `br_overclock` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

Bloques de cuerpo abiertos para este campeón (de `docs/production/asset-blocks.json`):

- **B409** (P2, PENDIENTE): definitiva

- Habilidades registradas: Centinela de Latón, Purga de Vapor, Desmontaje Rápido; definitiva: Turno de Emergencia.
- Skins/sets registrados: Maquinista de la Caldera (`ultimo_turno`, set).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

> **Atlas con rejilla propia (6 columnas, celda 96×96):** la pose N de abajo está en la celda `fila × 6 + columna` de ESTE atlas; los comandos ya traen ese índice. La numeración de los cuadros del título es la del atlas estándar 4×9.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 0 && node tools/art-world/runway-guardian.js brasa f00_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 1 && node tools/art-world/runway-guardian.js brasa f01_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 2 && node tools/art-world/runway-guardian.js brasa f02_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 3 && node tools/art-world/runway-guardian.js brasa f03_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 6 && node tools/art-world/runway-guardian.js brasa f04_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f06_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 7 && node tools/art-world/runway-guardian.js brasa f05_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f07_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 8 && node tools/art-world/runway-guardian.js brasa f06_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f08_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 9 && node tools/art-world/runway-guardian.js brasa f07_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f09_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 12 && node tools/art-world/runway-guardian.js brasa f08_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f12_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 13 && node tools/art-world/runway-guardian.js brasa f09_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f13_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 14 && node tools/art-world/runway-guardian.js brasa f10_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f14_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 15 && node tools/art-world/runway-guardian.js brasa f11_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f15_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 18 && node tools/art-world/runway-guardian.js brasa f12_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f18_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 19 && node tools/art-world/runway-guardian.js brasa f13_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f19_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 20 && node tools/art-world/runway-guardian.js brasa f14_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f20_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 21 && node tools/art-world/runway-guardian.js brasa f15_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f21_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 24 && node tools/art-world/runway-guardian.js brasa f16_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f24_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 25 && node tools/art-world/runway-guardian.js brasa f17_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f25_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 26 && node tools/art-world/runway-guardian.js brasa f18_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f26_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 27 && node tools/art-world/runway-guardian.js brasa f19_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f27_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 30 && node tools/art-world/runway-guardian.js brasa f20_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f30_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 31 && node tools/art-world/runway-guardian.js brasa f21_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f31_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 32 && node tools/art-world/runway-guardian.js brasa f22_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f32_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 33 && node tools/art-world/runway-guardian.js brasa f23_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f33_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 36 && node tools/art-world/runway-guardian.js brasa f24_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f36_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 37 && node tools/art-world/runway-guardian.js brasa f25_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f37_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 38 && node tools/art-world/runway-guardian.js brasa f26_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f38_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 39 && node tools/art-world/runway-guardian.js brasa f27_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f39_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 42 && node tools/art-world/runway-guardian.js brasa f28_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f42_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 43 && node tools/art-world/runway-guardian.js brasa f29_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f43_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 44 && node tools/art-world/runway-guardian.js brasa f30_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f44_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 45 && node tools/art-world/runway-guardian.js brasa f31_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f45_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 48 && node tools/art-world/runway-guardian.js brasa f32_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f48_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 49 && node tools/art-world/runway-guardian.js brasa f33_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f49_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 50 && node tools/art-world/runway-guardian.js brasa f34_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f50_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py brasa && python3 tools/art/pose-ref.py brasa 51 && node tools/art-world/runway-guardian.js brasa f35_a1 "<prompt>" art-source/runway-codex-clean/brasa.png art-source/runway-pose-refs/brasa/f51_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Brasa, la Mecánica Fugitiva, mage, class color #c58543), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
