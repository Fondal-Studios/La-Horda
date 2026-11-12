# Orsa, la Guardacables (`orsa`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Tiradora que distribuye cargas y decide cuándo descargar la horda. (categoría `asesino`) · ataque básico a distancia (alcance 335 u).
- **Color de clase:** `#dfa352` · brillo `#dfa352`.
- **Origen:** Las Minas Profundas. Orsa revisaba los cables que llevaban señales entre los niveles de las Minas. Durante un apagón oyó tres golpes en una línea cortada hacía años, bajó con una bobina a la espalda y encontró una cuadrilla que repetía el mismo turno sin recordar cómo había empezado. Solo uno siguió el cable hasta la luz. Hoy su ballesta guarda descargas para que siempre quede una respuesta.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/orsa.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/orsa/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py orsa --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/orsa.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Asesina a distancia (`roleCategory: asesino`), ballesta de bobina (básico 335 u, 580 ms). Distribuye cargas en los blancos y las descarga.
- **Tono:** Práctica, obrera y terca: rescatista minera que responde a los golpes en un cable. Cobre, hierro, chispas secas y un hilo de cable; ni mágica ni elegante.
- **Fuentes del kit:** `js/champions/expedition/catalog.js:37`; `js/champions/expedition/catalog.js:42`; `js/champions/expedition/runtime.js:53`; pasiva en `js/champions/expedition/catalog.js:40`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/orsa/atlas.png`: cobre/ocre `#903010`/`#703010`, marrón `#501010`, piel `#f0b090`. Color de clase `#dfa352` (`catalog.js:37`). Ballesta ancha con bobina, poncho minero.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Ámbar/cobre (dominante) | `#dfa352` |
  | Amarillo chispa | `#ffe08a` |
  | Cobre oscuro (sombra) | `#a05a1e` |
  | Marrón-negro (contorno) | `#3a1e08` |
  | Marfil-amarillo (núcleo de la chispa) | `#fff9d6` |
  | Azul acero (acento: hierro y cable) | `#2b3d5c` |

- **Motivos visuales:** pernos de metal, cable que se desenrolla, bobinas, chispas cortas de cobre, trazas de circuito en ángulos rectos, tres golpes, nube de tormenta baja.
- **Pasiva:** *Carga conductora* (hasta 3 cargas por blanco, 5 s, `catalog.js:40`) no tiene indicador visual en el código actual (no se dibuja en `expedition/render.js`); no se pide arte. Se recomienda, si hay presupuesto, una micro-chispa ámbar por carga sobre el enemigo (extra, no obligatorio).
- **NO debe parecerse a:** **Thalen/Cadena de Relámpago** y **Axiom** (relámpago violeta/azul eléctrico): las chispas de Orsa son ámbar-cobre, secas y angulosas; sin arcos azules. **Brasa** (cobre `#c58543`, remaches y vapor) y **Zahra** (naranja de horno): Orsa va a pernos, cables y circuitos, sin vapor ni llamas. **Libertador** (disparo pesado azul/blanco).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Perno conductor | Perno lineal que atraviesa varios enemigos y añade una carga. | `expedition` | 22 u |
| Apoyar la culata | Los próximos 3 básicos causan +25%; velocidad −25% mientras dure la postura. Además gana +20% de daño mientras dura la postura. | `expedition` | 50 u |
| Cerrar el circuito | Consume cargas cercanas para aumentar daño; la descarga salta a 2 vecinos como máximo, con presupuesto total de 12 blancos. Siempre da un golpe en área a su alrededor; las cargas suman daño extra. | `expedition` | 175 u |
| **Tormenta de rescate** (definitiva) | Tres barridos cargan objetivos; una descarga final consume las marcas cercanas. Frena a los enemigos y da +15% de velocidad a los aliados. | `expedition` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

No hay bloques de cuerpo abiertos para este campeón en la cola (puede tener calidad, skins o FX pendientes: ver `../bloques/`).

- Habilidades registradas: Perno conductor, Apoyar la culata, Cerrar el circuito; definitiva: Tormenta de rescate.
- Skins/sets registrados: Trueno Carmesí (`exp_orsa`, set), Cazadora de Leviatanes (`orsa_skin`, skin), Ceniza del Alba (`orsa_croma`, croma).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 0 && node tools/art-world/runway-guardian.js orsa f00_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 1 && node tools/art-world/runway-guardian.js orsa f01_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 2 && node tools/art-world/runway-guardian.js orsa f02_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 3 && node tools/art-world/runway-guardian.js orsa f03_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 4 && node tools/art-world/runway-guardian.js orsa f04_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 5 && node tools/art-world/runway-guardian.js orsa f05_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 6 && node tools/art-world/runway-guardian.js orsa f06_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 7 && node tools/art-world/runway-guardian.js orsa f07_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 8 && node tools/art-world/runway-guardian.js orsa f08_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 9 && node tools/art-world/runway-guardian.js orsa f09_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 10 && node tools/art-world/runway-guardian.js orsa f10_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 11 && node tools/art-world/runway-guardian.js orsa f11_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 12 && node tools/art-world/runway-guardian.js orsa f12_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 13 && node tools/art-world/runway-guardian.js orsa f13_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 14 && node tools/art-world/runway-guardian.js orsa f14_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 15 && node tools/art-world/runway-guardian.js orsa f15_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 16 && node tools/art-world/runway-guardian.js orsa f16_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 17 && node tools/art-world/runway-guardian.js orsa f17_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 18 && node tools/art-world/runway-guardian.js orsa f18_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 19 && node tools/art-world/runway-guardian.js orsa f19_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 20 && node tools/art-world/runway-guardian.js orsa f20_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 21 && node tools/art-world/runway-guardian.js orsa f21_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 22 && node tools/art-world/runway-guardian.js orsa f22_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 23 && node tools/art-world/runway-guardian.js orsa f23_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 24 && node tools/art-world/runway-guardian.js orsa f24_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 25 && node tools/art-world/runway-guardian.js orsa f25_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 26 && node tools/art-world/runway-guardian.js orsa f26_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 27 && node tools/art-world/runway-guardian.js orsa f27_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 28 && node tools/art-world/runway-guardian.js orsa f28_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 29 && node tools/art-world/runway-guardian.js orsa f29_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 30 && node tools/art-world/runway-guardian.js orsa f30_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 31 && node tools/art-world/runway-guardian.js orsa f31_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 32 && node tools/art-world/runway-guardian.js orsa f32_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 33 && node tools/art-world/runway-guardian.js orsa f33_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 34 && node tools/art-world/runway-guardian.js orsa f34_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py orsa && python3 tools/art/pose-ref.py orsa 35 && node tools/art-world/runway-guardian.js orsa f35_a1 "<prompt>" art-source/runway-codex-clean/orsa.png art-source/runway-pose-refs/orsa/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Orsa, la Guardacables, assassin, class color #dfa352), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
