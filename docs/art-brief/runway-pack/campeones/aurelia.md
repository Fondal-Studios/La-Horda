# Aurelia, la Arquitecta Solar (`aurelia`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Maga constructora: levanta geometría de luz sólida y convierte el terreno en un plano que castiga a quien lo cruza. (categoría `mago`) · ataque básico a distancia (alcance 310 u).
- **Color de clase:** `#f2c14e` · brillo `#fff1b8`.
- **Origen:** El templo solar del Laberinto. Aurelia trazaba los planos del Laberinto cuando todavía era un templo al sol. Vio cómo la Horda torció los pasillos para que nadie encontrara la salida. No intentó romper las paredes: aprendió a dibujar otras encima, de luz sólida, que duran lo suficiente para que alguien pase. Lleva el compás de su maestra y una regla: toda estructura que levanta debe tener una puerta.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/aurelia.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas actual en el juego:** `assets/sprites/champions/aurelia/atlas.png`.

### Identidad visual (extracto de `docs/art-brief/campeones/aurelia.md`, sección A)

- **Rol y tono:** Maga constructora (rol mago, área y control, a distancia). Tono: sereno, geométrico y solemne; planos de luz sólida con una puerta siempre abierta. Lenguaje: prisma, nodo, triángulo, catedral.
- **Paleta sugerida:** oro `#f2c14e` (color de clase, `ascension/catalog.js:43`), oro claro `#ffe69a`, blanco solar `#fffbe8`, ámbar oscuro `#a86a12`, contorno `#3a2400`, y SOLO en los bordes de dispersión: cian `#7fe3ff` y magenta `#ff7ad9` (luz partida por el prisma). (Atlas medido: oro `#cc9c3c` y `#e4b454`, sombras `#9c6c24`.)
- **Motivos visuales:** prismas y octaedros de cristal sólido, haces rectos que rebotan a 60°, hexágonos, compás, arcos ojivales y rosetón de catedral, dispersión espectral en los bordes.
- **NO debe parecerse a:** **Iria** (también triángulos: Aurelia es oro con VOLUMEN y relleno de luz, Iria es índigo con líneas finas e hilos); **Farolero** (llama cálida y polillas); **Dáriel** (ocre con notas); **Brakk** (arena/ladrillo); **Libertador** (sol de mayo): el oro de Aurelia es frío-brillante, nunca naranja.
- **Estado actual del VFX (verificado en código):** Tema procedural `prism` (`themes.js:7`, forma `hex`, motivos prism/diamond/ray/spark). `skill-fx-a/c/aurelia.js`: hab. 1 y definitiva = nova, hab. 2 = línea, hab. 3 = línea ancha (dash). La catedral reutiliza la nova (`SFA_OBJ.as_cathedral`).
- **Fuentes del kit:** `js/champions/ascension/catalog.js:43-54` (stats y kit), `ascension/runtime.js:116-125` (lanzamiento), `:214` (catedral), `:271` (triángulo de nodos), premarcado `js/skills/aim-targeting.js:54-55`, proyectil `ascension/register.js:10`.

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Prisma | Cristaliza un Nodo Solar en el punto elegido (máx. 3) con un pequeño estallido. | `ascension` | 40 u |
| Refracción | Rayo en línea; cada nodo que toca lo refracta hacia el enemigo más cercano. | `ascension` | 24 u |
| Paso Luminal | Se traslada al nodo más lejano (o al punto elegido) y crea un nodo donde estaba. Ella y los aliados cercanos ganan +15% de daño 4 s (Luz Sólida). | `ascension` | 90 u |
| **Catedral del Sol** (definitiva) | Los nodos se elevan en una catedral geométrica de luz: pulsos de daño dentro y regeneración para aliados. | `ascension` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Prisma, Refracción, Paso Luminal; definitiva: Catedral del Sol.
- Skins de ascensión pendientes: {'id': 'aurelia_alt1', 'nombre': 'Vitral del Mediodía', 'iou_vs_base': 1.0}, {'id': 'aurelia_alt2', 'nombre': 'Catedral Corrupta', 'iou_vs_base': 1.0}.

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte de 112×112; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f00_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f00.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f01_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f01.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f02_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f02.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f03_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f03.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f04_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f04.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f05_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f05.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f06_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f06.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f07_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f07.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f08_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f08.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f09_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f09.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f10_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f10.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f11_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f11.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f12_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f12.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f13_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f13.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f14_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f14.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f15_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f15.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f16_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f16.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f17_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f17.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f18_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f18.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (facing right in side profile). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f19_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f19.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f20_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f20.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f21_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f21.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f22_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f22.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (attack recovery: back to guard stance, weapon drawn in): same body pose, same framing, same facing (seen from behind (back to the camera)). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f23_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f23.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f24_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f24.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (casting raise: arms or weapon rise, the body stretches upward): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f25_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f25.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (casting release: thrust forward, the widest and most dynamic pose): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f26_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f26.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (casting recover: arms lower, back to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f27_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f27.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f28_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f28.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f29_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f29.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f30_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f30.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (ultimate release: energy leaves, the body drops to guard): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f31_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f31.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f32_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f32.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f33_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f33.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (death fall: body falling sideways, feet off the ground): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f34_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f34.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line): same body pose, same framing, same facing (facing the camera). Keep the @codex design, outfit and palette exactly; do not copy the face style or colors of the pose reference. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`
- **Comando:** `node tools/art-world/runway-guardian.js aurelia f35_a1 "<prompt>" assets/ui/codex/champions/aurelia.png art-source/runway-pose-refs/aurelia/f35.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aurelia, la Arquitecta Solar, mage, class color #f2c14e), redrawn in exactly the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), same framing, facing the camera. Keep the @codex design and palette exactly. Full body, centered, feet at the bottom of the frame, ONE connected silhouette, crisp pixel art, 1px dark outline all around, flat shading with 4-6 base colors, no gradients, no glow, no text, no effects overlapping the body, plain dark background.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
