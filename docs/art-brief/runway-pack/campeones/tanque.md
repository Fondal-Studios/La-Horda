# Aldric, el Último Bastión (`tanque`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Resistencia, protección y control de área. (categoría `tanque`) · ataque básico cuerpo a cuerpo (alcance 78 u, en arco).
- **Color de clase:** `#5f8fc4` · brillo `#a9cdf0`.
- **Origen:** Muralla de la Ciudad Maldita. Aldric era capitán de la guardia cuando la Horda volvió a la Ciudad Maldita. Sostuvo la puerta norte tres noches seguidas, hasta que el escudo le quedó soldado al brazo. Nadie sabe cómo sigue en pie. Desde entonces camina delante de todos: dice que ya tiene la costumbre de recibir los golpes y que prefiere que sean suyos.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/tanque.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/tanque/codex-v1/atlas.png` (celda 112×112, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py tanque --info`).
- Ojo: existe también `assets/sprites/champions/tanque/atlas.png` pero NO es el registrado; manda el de arriba.

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/tanque.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol:** Tanque de línea (`roleCategory: tanque`), cuerpo a cuerpo (básico 78 u, 620 ms). Atrae a la Horda, protege al equipo y arrasa con su torbellino. Es la referencia oficial de estilo (ART_BIBLE §2).
- **Tono:** Heroico, sólido y protector: el Caballero. Acero azul, escudo, estandarte y chispas de metal; pesado y confiable, nunca siniestro ni brillante en exceso.
- **Fuentes del kit:** `js/data/champions.js:34`; `js/skills/abilities.js:999`; `js/skills/abilities.js:1070`
- **Sprite actual (referencia de color):** cuantizado de `assets/sprites/champions/tanque/atlas.png`: azul acero `#103090`/`#103070`, marrón cuero `#905030`/`#703010`, rojo oscuro `#703030`. Color de clase `#5f8fc4`, brillo `#a9cdf0` (`champions.js`). Es el Master Reference: no se rediseña.
- **Paleta sugerida (4–6 colores):**

  | Uso | Hex |
  |---|---|
  | Azul acero (dominante) | `#5f8fc4` |
  | Azul claro (chispa y brillo) | `#a9cdf0` |
  | Azul profundo (sombra) | `#2f5a96` |
  | Azul-negro (contorno) | `#14213a` |
  | Blanco acero (destello) | `#f2fbff` |
  | Rojo provocación (solo la definitiva) | `#ff5a3d` |

- **Motivos visuales:** escudo, torbellino de hojas de acero, chispas de metal, estandarte, ondas de voz, aura que crece, sello de provocación rojo con signo "!".
- **Pasiva:** *Bastión* (aliados a ≤200 u reciben 8% menos de daño) no tiene indicador visual propio; no se pide arte.
- **NO debe parecerse a:** **Baltra** (campana, bronce y azul), **Bront** (acero gris-azul, placas) y **Brakk** (ocre): Aldric es azul acero con chispas, sin bronce ni placas. **Musashi** (`#5aa8d8`) y **Libertador** (`#2f4f9a`): el azul de Aldric es de armadura de caballero; evitar espadas finas o uniformes. **Thalen** (hielo/azul cristal): sin cristales. **Facu GM** (azul mar).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Torbellino | Gira sin parar dañando a su alrededor | `spin_channel` | 115 u |
| Embestida | Carga, arrastra y golpea a un enemigo | `charge_drag` | 230 u |
| Grito de Guerra | Grito que aumenta armadura, vida máxima y su tamaño | `war_cry` | — u |
| **Grito Provocador** (definitiva) | Provoca a los enemigos, se agiganta y gana armadura y vida máxima | `taunt_provoke` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

Bloques de cuerpo abiertos para este campeón (de `docs/production/asset-blocks.json`):

- **B002** (P0, EN_CORRECCION): lanzar
- **B002** (P0, EN_CORRECCION): muerte
- **B002** (P0, EN_CORRECCION): golpe

- Habilidades registradas: Torbellino, Embestida, Grito de Guerra; definitiva: Grito Provocador.
- Skins/sets registrados: El Último Juramento (`baluarte`, set), Bastión Ancestral (`tanque_ancestral`, skin), Paladín del Juicio (`tanque_juicio`, skin).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 0 && node tools/art-world/runway-guardian.js tanque f00_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 1 && node tools/art-world/runway-guardian.js tanque f01_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 2 && node tools/art-world/runway-guardian.js tanque f02_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 3 && node tools/art-world/runway-guardian.js tanque f03_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 4 && node tools/art-world/runway-guardian.js tanque f04_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 5 && node tools/art-world/runway-guardian.js tanque f05_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 6 && node tools/art-world/runway-guardian.js tanque f06_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 7 && node tools/art-world/runway-guardian.js tanque f07_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 8 && node tools/art-world/runway-guardian.js tanque f08_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 9 && node tools/art-world/runway-guardian.js tanque f09_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 10 && node tools/art-world/runway-guardian.js tanque f10_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 11 && node tools/art-world/runway-guardian.js tanque f11_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 12 && node tools/art-world/runway-guardian.js tanque f12_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 13 && node tools/art-world/runway-guardian.js tanque f13_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 14 && node tools/art-world/runway-guardian.js tanque f14_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 15 && node tools/art-world/runway-guardian.js tanque f15_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 16 && node tools/art-world/runway-guardian.js tanque f16_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 17 && node tools/art-world/runway-guardian.js tanque f17_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 18 && node tools/art-world/runway-guardian.js tanque f18_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 19 && node tools/art-world/runway-guardian.js tanque f19_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 20 && node tools/art-world/runway-guardian.js tanque f20_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 21 && node tools/art-world/runway-guardian.js tanque f21_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 22 && node tools/art-world/runway-guardian.js tanque f22_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 23 && node tools/art-world/runway-guardian.js tanque f23_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 24 && node tools/art-world/runway-guardian.js tanque f24_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 25 && node tools/art-world/runway-guardian.js tanque f25_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 26 && node tools/art-world/runway-guardian.js tanque f26_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 27 && node tools/art-world/runway-guardian.js tanque f27_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 28 && node tools/art-world/runway-guardian.js tanque f28_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 29 && node tools/art-world/runway-guardian.js tanque f29_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 30 && node tools/art-world/runway-guardian.js tanque f30_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 31 && node tools/art-world/runway-guardian.js tanque f31_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 32 && node tools/art-world/runway-guardian.js tanque f32_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 33 && node tools/art-world/runway-guardian.js tanque f33_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 34 && node tools/art-world/runway-guardian.js tanque f34_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py tanque && python3 tools/art/pose-ref.py tanque 35 && node tools/art-world/runway-guardian.js tanque f35_a1 "<prompt>" art-source/runway-codex-clean/tanque.png art-source/runway-pose-refs/tanque/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Aldric, el Último Bastión, tank, class color #5f8fc4), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
