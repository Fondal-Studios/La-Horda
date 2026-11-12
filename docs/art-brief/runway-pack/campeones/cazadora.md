# Sylva, la Cazadora del Bosque (`cazadora`) — instrucciones de Runway

> Generado por `tools/art/build-runway-pack.py`. Método general: `../RECETA.md`; las 36 poses explicadas: `../POSES_CAMPEON.md`.

## 1. Quién es (lo que el dibujo tiene que respetar)

- **Rol:** Tiradora extremadamente móvil que gana velocidad mientras persigue a su presa. (categoría `asesino`) · ataque básico a distancia (alcance 300 u).
- **Color de clase:** `#5c9a4a` · brillo `#c8f0a8`.
- **Origen:** Los bosques de las Ruinas. Sylva creció entre los menhires de las Ruinas Célticas, antes de que se pudrieran. Conoce cada sendero, cada rastro y cada presa del bosque viejo. Volvió persiguiendo a la Horda y encontró al Guardián Ancestral convertido en otra cosa. Todavía no se lo perdona, y por eso nunca deja de moverse: quedarse quieta sería empezar a llorarlo.
- **Lámina del Códice (referencia `@codex`):** `assets/ui/codex/champions/cazadora.png` (original) — es la fuente de verdad del diseño: ropa, pelo, colores y proporciones.
- **Atlas registrado en el juego:** `assets/sprites/champions/cazadora/codex-v1/atlas.png` (celda 192×160, 4 columnas). Es el que se usa como `@pose` (`python3 tools/art/pose-ref.py cazadora --info`).

### Identidad visual (extracto LITERAL de `docs/art-brief/campeones/cazadora.md`, sección A; puede citar rutas o estados históricos: manda la sección 1)

- **Rol y tono:** Tiradora móvil (rol asesino, daño sostenido a distancia). Tono: ágil, silenciosa y paciente; persigue a una Presa y se vuelve más rápida. Lenguaje: flecha, hoja, raíz, lobo.
- **Paleta sugerida:** verde bosque `#5c9a4a` (color de clase, `champions.js:158`), hoja clara `#c8f0a8`, verde oscuro `#2f5a24`, dorado `#d8b050` (plumas), crema `#f4ffe0`, turquesa espectral `#5ad0c8` (el lobo, `cazadora.js:167`), contorno `#12220c`.
- **Motivos visuales:** hojas afiladas, flechas con plumas, raíces que atrapan, huellas de lobo, lluvia vertical, lobo espectral.
- **NO debe parecerse a:** **Maura** (olivas y espinas), **Morveth** (verde enfermizo con púrpura), **Khepri** (esmeralda y lima con oro), **Saelis** (plumas celestes): Sylva es verde natural y vivo, sin púrpura ni oro dominante; **Ilkan/Musashi** (trazos de hoja/tinta).
- **Estado actual del VFX (verificado en código):** Tema procedural `hunt` (`themes.js:13`, forma `petal`, motivos leaf/arrow/thorn/spark). `skill-fx-a/c/cazadora.js`: Flecha = haz 30 u, Trampa = estallido 46, Lluvia = nova del radio real, definitiva = nova 110 + aura 4000 ms. Hay arte propio previo en `assets/vfx/cazadora/` (`trap-f1..f4`, `rain-f1..f3`) y una Trampa que crece en 4 etapas durante 200 ms (`asesino.js:drawTrap`).
- **Fuentes del kit:** `js/data/champions.js:157-174` (stats y kit), `js/skills/abilities.js:534-607` (Flecha, Trampa, Lluvia, Cacería), `js/champions/cazadora.js:13-50` (Lluvia), `:83` (carga), `:161-196` (lobo), `js/champions/asesino.js:25-60` (Trampa del Bosque), `js/data/champion-tuning.js:64-71` (pasivas).

## 2. Kit (qué hace, para que el cuerpo lo exprese)

| Habilidad | Qué hace | Tipo | Alcance / radio |
|---|---|---|---|
| Flecha Perforante | Mantené pulsado para cargar: más carga = más daño, velocidad, alcance y penetración. A carga máxima atraviesa varios enemigos | `piercing_shot` | 420 u |
| Trampa del Bosque | Coloca una trampa de raíces; inmoviliza (o ralentiza mucho a bosses) al primer enemigo que la pise | `forest_trap` | 70 u |
| Lluvia de la Cazadora | Tras un breve retraso, una lluvia de flechas cae sobre la zona; prioriza a su Presa si está cerca | `hunter_rain` | 180 u |
| **Cacería Salvaje** (definitiva) | Impulso al máximo fijo, puede correr y disparar a la vez, invoca a un Lobo Espectral que persigue a su Presa | `wild_hunt_ult` | — |

El atlas tiene UNA fila «lanzar» (se usa para las 3 habilidades) y UNA fila «definitiva»: las dos tienen que verse como la acción más característica del kit, no genéricas.

## 3. Qué falta hoy

Bloques de cuerpo abiertos para este campeón (de `docs/production/asset-blocks.json`):

- **B098** (P1, PENDIENTE): ataque_abajo
- **B098** (P1, PENDIENTE): ataque_arriba

- Habilidades registradas: Flecha Perforante, Trampa del Bosque, Lluvia de la Cazadora; definitiva: Cacería Salvaje.
- Skins/sets registrados: Flecha de Fuego (`manada`, set), Manto de Escarcha (`cazadora_escarcha`, skin).

## 4. Las 36 poses con su instrucción de Runway

Cada fila es un cuadro del atlas `448×1008` (4 columnas × 9 filas de 112 px). `@codex` = la lámina de arriba. `@pose` = el cuadro equivalente del atlas actual de este campeón (recorte del atlas registrado, ampliado a 1024 con vecino más cercano por `tools/art/pose-ref.py`; receta en `../RECETA.md` §3) o, si no tiene atlas, el cuadro de un donante de la misma complexión. El prompt va tal cual a `tools/art-world/runway-guardian.js`.

### Cuadro 0 — fila 1, columna 1: caminar · frente (de cara a la cámara)

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 0 && node tools/art-world/runway-guardian.js cazadora f00_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f00_1024.png`

### Cuadro 1 — fila 1, columna 2: caminar · frente (de cara a la cámara)

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 1 && node tools/art-world/runway-guardian.js cazadora f01_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f01_1024.png`

### Cuadro 2 — fila 1, columna 3: caminar · frente (de cara a la cámara)

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 2 && node tools/art-world/runway-guardian.js cazadora f02_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f02_1024.png`

### Cuadro 3 — fila 1, columna 4: caminar · frente (de cara a la cámara)

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 3 && node tools/art-world/runway-guardian.js cazadora f03_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f03_1024.png`

### Cuadro 4 — fila 2, columna 1: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 4 && node tools/art-world/runway-guardian.js cazadora f04_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f04_1024.png`

### Cuadro 5 — fila 2, columna 2: caminar · perfil mirando a la DERECHA

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 5 && node tools/art-world/runway-guardian.js cazadora f05_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f05_1024.png`

### Cuadro 6 — fila 2, columna 3: caminar · perfil mirando a la DERECHA

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 6 && node tools/art-world/runway-guardian.js cazadora f06_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f06_1024.png`

### Cuadro 7 — fila 2, columna 4: caminar · perfil mirando a la DERECHA

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 7 && node tools/art-world/runway-guardian.js cazadora f07_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f07_1024.png`

### Cuadro 8 — fila 3, columna 1: caminar · de espaldas a la cámara

- **Qué es:** contacto: pie delantero apoyado, cuerpo en su punto más bajo, brazos opuestos a las piernas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk contact: front foot planted, body at its lowest, arms opposite to the legs), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 8 && node tools/art-world/runway-guardian.js cazadora f08_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f08_1024.png`

### Cuadro 9 — fila 3, columna 2: caminar · de espaldas a la cámara

- **Qué es:** paso: pierna trasera pasa al frente, cuerpo en su punto MÁS ALTO, ropa/pelo levemente arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk passing: rear leg swings forward, body at its HIGHEST, cloth and hair slightly lifted), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 9 && node tools/art-world/runway-guardian.js cazadora f09_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f09_1024.png`

### Cuadro 10 — fila 3, columna 3: caminar · de espaldas a la cámara

- **Qué es:** contacto del otro pie (espejo del cuadro 1 con brazos y piernas cambiados).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk contact on the other foot (mirror of the first with arms and legs swapped)), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 10 && node tools/art-world/runway-guardian.js cazadora f10_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f10_1024.png`

### Cuadro 11 — fila 3, columna 4: caminar · de espaldas a la cámara

- **Qué es:** paso del otro lado: cuerpo alto, cierra el ciclo y vuelve al cuadro 1.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (walk passing on the other side: body high, closing the loop back to the first frame), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 11 && node tools/art-world/runway-guardian.js cazadora f11_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f11_1024.png`

### Cuadro 12 — fila 4, columna 1: ataque · frente (de cara a la cámara)

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 12 && node tools/art-world/runway-guardian.js cazadora f12_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f12_1024.png`

### Cuadro 13 — fila 4, columna 2: ataque · frente (de cara a la cámara)

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 13 && node tools/art-world/runway-guardian.js cazadora f13_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f13_1024.png`

### Cuadro 14 — fila 4, columna 3: ataque · frente (de cara a la cámara)

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 14 && node tools/art-world/runway-guardian.js cazadora f14_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f14_1024.png`

### Cuadro 15 — fila 4, columna 4: ataque · frente (de cara a la cámara)

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 15 && node tools/art-world/runway-guardian.js cazadora f15_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f15_1024.png`

### Cuadro 16 — fila 5, columna 1: ataque · perfil mirando a la DERECHA

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 16 && node tools/art-world/runway-guardian.js cazadora f16_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f16_1024.png`

### Cuadro 17 — fila 5, columna 2: ataque · perfil mirando a la DERECHA

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 17 && node tools/art-world/runway-guardian.js cazadora f17_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f17_1024.png`

### Cuadro 18 — fila 5, columna 3: ataque · perfil mirando a la DERECHA

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 18 && node tools/art-world/runway-guardian.js cazadora f18_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f18_1024.png`

### Cuadro 19 — fila 5, columna 4: ataque · perfil mirando a la DERECHA

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), facing right in side profile. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 19 && node tools/art-world/runway-guardian.js cazadora f19_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f19_1024.png`

### Cuadro 20 — fila 6, columna 1: ataque · de espaldas a la cámara

- **Qué es:** anticipación: el arma/brazo se echa hacia atrás y el cuerpo se agacha, peso atrás.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack anticipation: weapon or arm pulled back, body crouched, weight on the back foot), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 20 && node tools/art-world/runway-guardian.js cazadora f20_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f20_1024.png`

### Cuadro 21 — fila 6, columna 2: ataque · de espaldas a la cámara

- **Qué es:** golpe: extensión MÁXIMA del arma hacia el objetivo, cuerpo estirado, pie delantero adelantado.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack strike: MAXIMUM extension of the weapon toward the target, body stretched, front foot forward), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 21 && node tools/art-world/runway-guardian.js cazadora f21_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f21_1024.png`

### Cuadro 22 — fila 6, columna 3: ataque · de espaldas a la cámara

- **Qué es:** impacto y seguimiento: el cuerpo sigue el movimiento, el arma ya pasó, ropa arrastrada por la inercia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack follow-through: body carried by the momentum, weapon already past, cloth dragged by inertia), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 22 && node tools/art-world/runway-guardian.js cazadora f22_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f22_1024.png`

### Cuadro 23 — fila 6, columna 4: ataque · de espaldas a la cámara

- **Qué es:** recuperación: vuelve a postura de guardia, arma recogida.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (attack recovery: back to guard stance, weapon drawn in), seen from behind, back to the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 23 && node tools/art-world/runway-guardian.js cazadora f23_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f23_1024.png`

### Cuadro 24 — fila 7, columna 1: lanzar · frente (de cara a la cámara)

- **Qué es:** reunir: brazos/arma al pecho, mirada al frente, energía contenida (sin dibujar el efecto).
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (casting gather: arms or weapon held to the chest, eyes forward, energy held in (do NOT draw the effect)), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 24 && node tools/art-world/runway-guardian.js cazadora f24_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f24_1024.png`

### Cuadro 25 — fila 7, columna 2: lanzar · frente (de cara a la cámara)

- **Qué es:** alzar: brazos o arma suben, el cuerpo se estira hacia arriba.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (casting raise: arms or weapon rise, the body stretches upward), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 25 && node tools/art-world/runway-guardian.js cazadora f25_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f25_1024.png`

### Cuadro 26 — fila 7, columna 3: lanzar · frente (de cara a la cámara)

- **Qué es:** liberar: empuje al frente con la pose más abierta y dinámica.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (casting release: thrust forward, the widest and most dynamic pose), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 26 && node tools/art-world/runway-guardian.js cazadora f26_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f26_1024.png`

### Cuadro 27 — fila 7, columna 4: lanzar · frente (de cara a la cámara)

- **Qué es:** recuperar: baja los brazos y vuelve a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (casting recover: arms lower, back to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 27 && node tools/art-world/runway-guardian.js cazadora f27_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f27_1024.png`

### Cuadro 28 — fila 8, columna 1: definitiva · frente (de cara a la cámara)

- **Qué es:** carga: postura baja, puños/arma cerrados, ropa y pelo ya reaccionan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (ultimate charge: low stance, fists or weapon clenched, cloth and hair already reacting), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 28 && node tools/art-world/runway-guardian.js cazadora f28_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f28_1024.png`

### Cuadro 29 — fila 8, columna 2: definitiva · frente (de cara a la cámara)

- **Qué es:** estallido: se levanta de golpe, brazos abiertos o arma en alto.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (ultimate burst: rises abruptly, arms spread or weapon raised), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 29 && node tools/art-world/runway-guardian.js cazadora f29_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f29_1024.png`

### Cuadro 30 — fila 8, columna 3: definitiva · frente (de cara a la cámara)

- **Qué es:** pico: pose heroica de máxima apertura, la más grande de todo el atlas.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (ultimate peak: heroic pose at maximum spread, the biggest of the whole sheet), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 30 && node tools/art-world/runway-guardian.js cazadora f30_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f30_1024.png`

### Cuadro 31 — fila 8, columna 4: definitiva · frente (de cara a la cámara)

- **Qué es:** liberación: la energía sale, el cuerpo cae a guardia.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (ultimate release: energy leaves, the body drops to guard), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 31 && node tools/art-world/runway-guardian.js cazadora f31_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f31_1024.png`

### Cuadro 32 — fila 9, columna 1: muerte · frente (de cara a la cámara)

- **Qué es:** impacto: el golpe lo sacude, cabeza atrás, arma/escudo se aflojan.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (death impact: struck, head thrown back, weapon or shield loosening), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 32 && node tools/art-world/runway-guardian.js cazadora f32_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f32_1024.png`

### Cuadro 33 — fila 9, columna 2: muerte · frente (de cara a la cámara)

- **Qué es:** tambaleo: rodillas flojas, cuerpo inclinado, una mano suelta el arma.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (death stagger: knees buckling, body leaning, one hand lets go of the weapon), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 33 && node tools/art-world/runway-guardian.js cazadora f33_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f33_1024.png`

### Cuadro 34 — fila 9, columna 3: muerte · frente (de cara a la cámara)

- **Qué es:** caída: el cuerpo cae de costado, pies despegados del suelo.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (death fall: body falling sideways, feet off the ground), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 34 && node tools/art-world/runway-guardian.js cazadora f34_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f34_1024.png`

### Cuadro 35 — fila 9, columna 4: muerte · frente (de cara a la cámara)

- **Qué es:** tendido: cuerpo en el suelo, inmóvil; su borde INFERIOR apoya en la fila 106 de la celda.
- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (death lying: body on the ground, motionless, lowest edge resting on the foot line), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`
- **Comando:** `python3 tools/art/codex-clean.py cazadora && python3 tools/art/pose-ref.py cazadora 35 && node tools/art-world/runway-guardian.js cazadora f35_a1 "<prompt>" art-source/runway-codex-clean/cazadora.png art-source/runway-pose-refs/cazadora/f35_1024.png`

### Golpe recibido (un cuadro; el motor lo toma de la fila de ataque, cuadros 12, 16 y 20)

- **Prompt Runway:** `Pixel art game sprite of the character in @codex (Sylva, la Cazadora del Bosque, assassin, class color #5c9a4a), drawn in the pose of @pose (hurt reaction: flinches backward, one eye shut, weapon lowered), facing the camera. Keep the @codex design and colors exactly. Full body, feet at the bottom, one connected silhouette, crisp pixel art, 1px dark outline, flat shading, plain dark background, no text.`

## 5. Aceptación (antes de dar un cuadro por bueno)

Misma silueta y paleta que la lámina; pose pedida (no otra); orientación pedida (¡de espaldas es de espaldas!); una sola silueta conectada; sin texto, marcos ni efectos pegados al cuerpo. Después se reduce a escala nativa (alto de reposo 62–72 px) y pasa los chequeos de `../RECETA.md` §5.
