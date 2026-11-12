# Solciju, la Enóloga (`solciju`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Maga de control (categoría `mago`) · ataque básico a distancia (alcance 300 u).
- **Color de clase:** `#923951` · brillo `#923951`.
- **Origen:** Las bodegas de la Ciudad Maldita. Solciju conservaba las últimas cosechas de una ciudad que ya nadie recordaba. Cuando la peste alcanzó sus bodegas, descubrió que el vino retenía algo más que años: atrapaba las maldiciones de quienes lo bebían. Ahora recorre las ruinas con una reserva que jamás ofrece por cortesía. Dice detestar la compañía, pero siempre guarda una copa para quien sobreviva a su lado.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/solciju.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/solciju/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py solciju --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/solciju.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Maga de control (`roleCategory: mago`), a distancia (básico 300 u, 560 ms). Marca con vino (hasta 3 marcas por objetivo) y cobra con barricas y una reserva.
- **Tono:** Seca, sarcástica y reservada: "no pienso brindar por ustedes". Elegancia de bodega con borde cruel; vino oscuro, madera y vidrio, nada brillante ni infantil.
- **Fuentes del kit:** `js/champions/quality-five/solciju.js:4`; `js/champions/quality-five/solciju.js:38`; `js/champions/quality-five/register.js:7`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/solciju/atlas.png`: burdeos `#703030`/`#503030`, piel `#f0b090`, marrón `#705030`/`#b07050`. Color de clase `#923951` (`quality-five/register.js:8`); zona de suelo en código: anillo `#d69aae` con relleno `#923951`, barrica `#623c2b` con borde `#f0d3a0` (`solciju.js`).
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Vino burdeos (dominante) | `#923951` |
  | Vino claro / rosado de brillo | `#d46a86` |
  | Vino oscuro (sombra) | `#6b1f38` |
  | Negro-vino (contorno) | `#2a0814` |
  | Madera de barrica | `#623c2b` |
  | Dorado de copa y aros (acento) | `#f0d3a0` |

- **Motivos visuales:** gotas y salpicaduras de vino, barricas con aros de metal, copas y botellas, racimos de uva, corcho y sacacorchos, mechas de vela, charco con brillo.
- **Pasiva:** *Fermentación* (hasta 3 marcas de fermentación por objetivo, 5 s; la 3ª "madura" y se consume con +25% y ralentización, `solciju.js:11-27`) no tiene indicador visual en el código actual. Recomendado pero opcional: un racimo de 1–3 uvas sobre el enemigo marcado.
- **NO debe parecerse a:** **Veyra** (carmesí `#ab3459`, color casi idéntico al vino): el vino de Solciju es oscuro, translúcido y con vidrio/madera; la sangre de Veyra es brillante y opaca con cortes. **Segador** (rojo). **Myla** (rosa yogur): el vino no es rosa pastel. **Morwen** (reactivos/alambique, violeta `#a46191`): sin laboratorio, sin vapor químico.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Vino maldito | Salpica vino en un área y añade una marca de fermentación. | `expedition` | 85 u |
| Barrica añeja | Coloca una barrica que estalla tras 2,4 s. Máximo dos; reemplazar una no la detona. | `expedition` | 100 u |
| Brindis a solas | Obtiene 15% de armadura durante 3 s y recupera 4% de vida máxima. | `expedition` | 120 u |
| **Gran Reserva** (definitiva) | Cuatro pulsos de vino dañan y ralentizan enemigos. Protege a aliados dentro del área. | `expedition` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Vino maldito, Barrica añeja, Brindis a solas; definitiva: Gran Reserva.
- Skins/sets registrados: Vendimiadora del Asedio (`quality_solciju`, set), Viuda de Medianoche (`solciju_alt1`, skin), Añada Esmeralda (`solciju_croma`, croma).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 0 && node tools/art-world/runway-guardian.js solciju f00_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 1 && node tools/art-world/runway-guardian.js solciju f01_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 2 && node tools/art-world/runway-guardian.js solciju f02_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 3 && node tools/art-world/runway-guardian.js solciju f03_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 4 && node tools/art-world/runway-guardian.js solciju f04_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 5 && node tools/art-world/runway-guardian.js solciju f05_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 6 && node tools/art-world/runway-guardian.js solciju f06_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 7 && node tools/art-world/runway-guardian.js solciju f07_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 8 && node tools/art-world/runway-guardian.js solciju f08_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 9 && node tools/art-world/runway-guardian.js solciju f09_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 10 && node tools/art-world/runway-guardian.js solciju f10_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 11 && node tools/art-world/runway-guardian.js solciju f11_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 12 && node tools/art-world/runway-guardian.js solciju f12_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 13 && node tools/art-world/runway-guardian.js solciju f13_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 14 && node tools/art-world/runway-guardian.js solciju f14_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 15 && node tools/art-world/runway-guardian.js solciju f15_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 16 && node tools/art-world/runway-guardian.js solciju f16_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 17 && node tools/art-world/runway-guardian.js solciju f17_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 18 && node tools/art-world/runway-guardian.js solciju f18_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 19 && node tools/art-world/runway-guardian.js solciju f19_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 20 && node tools/art-world/runway-guardian.js solciju f20_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 21 && node tools/art-world/runway-guardian.js solciju f21_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 22 && node tools/art-world/runway-guardian.js solciju f22_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 23 && node tools/art-world/runway-guardian.js solciju f23_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 24 && node tools/art-world/runway-guardian.js solciju f24_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 25 && node tools/art-world/runway-guardian.js solciju f25_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 26 && node tools/art-world/runway-guardian.js solciju f26_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 27 && node tools/art-world/runway-guardian.js solciju f27_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 28 && node tools/art-world/runway-guardian.js solciju f28_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 29 && node tools/art-world/runway-guardian.js solciju f29_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 30 && node tools/art-world/runway-guardian.js solciju f30_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 31 && node tools/art-world/runway-guardian.js solciju f31_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 32 && node tools/art-world/runway-guardian.js solciju f32_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 33 && node tools/art-world/runway-guardian.js solciju f33_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 34 && node tools/art-world/runway-guardian.js solciju f34_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py solciju && python3 tools/art/pose-ref.py solciju 35 && node tools/art-world/runway-guardian.js solciju f35_a1 "<prompt>" art-source/runway-codex-clean/solciju.png art-source/runway-pose-refs/solciju/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Solciju, la Enóloga, mage, class color #923951), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
