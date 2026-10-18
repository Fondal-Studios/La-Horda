# La Horda — Especificación técnica de arte (para el artista)

> Documento autosuficiente: qué dibujar, en qué formato, con qué medidas, dónde dejarlo, cómo se carga en el juego y cómo se comprueba.
> Cada afirmación cita `archivo:línea` del repo en `origin/main` (commit `d57cf5e`, 2026-10-18). Lo que **no** existe todavía en el código está marcado **[HUECO]** y el contrato propuesto está en la sección 8; no se afirma nada que no se haya leído en el código o ejecutado.
> Marcas: **[VERIFICADO]** leído en el código o ejecutado en este entorno · **[PROPUESTA]** decisión nueva que este documento recomienda (no existe aún) · **[DECIDE EL DUEÑO]** hay una contradicción en el repo que solo el dueño puede resolver.

Índice: 0 Lectura rápida · 1 Canon visual · 2 Assets por tipo (2.1 campeón · 2.2 FX de habilidad · 2.3 proyectiles · 2.4 props · 2.5 decales de suelo · 2.6 íconos · 2.7 Códice, portadas) · 3 Chequeos · 4 Presupuestos · 5 Legal · 6 Entrega y flujo · 7 Ejemplo completo · 8 Lo que Claude debe construir · 9 Apéndice.

Archivos de apoyo en esta carpeta: `plantillas/` (hojas guía con rejilla, generadas por `plantillas/generar_plantillas.py`) y `ejemplos/nova_time_80_PROCEDURAL_referencia.png` (la tira de nova que hoy genera el código para Aelith, exportada del motor real).

---

## 0. Lectura rápida (lo que más importa)

1. **Qué es procedural hoy y qué no.** Los **sprites de campeón son atlas PNG ya pintados** (no procedurales; excepción: Ilkan, `docs/ILKAN_REWORK.md`). Son procedurales: **los efectos de habilidad** (`js/champions/skill-fx-a/`, `js/champions/vfx-b/`), **los íconos de habilidad** (`js/ui/skill-pixel-glyphs.js`), **los muros/torretas/zonas persistentes** (`js/champions/skill-fx-a/props.js`, `js/rendering/portadores.js`) y **los proyectiles con identidad** (`js/systems/skill-evolution.js:168`).
2. **Formato del campeón**: un atlas `448×1008` (4 columnas × 9 filas de celdas de `112×112`), pies en la fila `106` de cada celda, perfil mirando a la **derecha** (la izquierda la genera el juego espejando), 36 poses fijas (sección 2.1). Plantilla: `plantillas/champion_atlas_448x1008_PLANTILLA.png`.
3. **Escala**: el cuerpo del campeón mide **≈ 65 px de alto** (del tope de la cabeza/gorro a los pies) → 1,0 unidad de mundo por píxel (`docs/ART_BIBLE.md` §14). Un campeón entero cabe en `110×106` px.
4. **Alfa 0 o 255**. Sin semitransparencias, sin antialiasing, sin degradés suaves, sin fondo, sin texto ni rejilla pegada. Vecino más cercano siempre.
5. **Cada pose = una sola silueta conectada** (8-conectividad). El importador cuenta componentes: si una espada flota separada del cuerpo, falla con `expected 36 separated silhouettes` (`tools/factory/import-authored-sheet.py:47`).
6. **Los FX tienen tres tiempos**: anticipación → impacto → disipación (`engine.js:8-10`), y **el borde exterior del arte es el radio real de la habilidad** (la hitbox). El arte nunca decide el área.
7. **Hoy NO hay forma de que un PNG pintado reemplace a un FX procedural de habilidad, ni a un muro/torreta, ni a un ícono** (salvo skins de set y unos pocos efectos sueltos). Es el **hueco principal**: la sección 8 propone el contrato exacto. Mientras no se construya, el artista puede entregar igual (sección 6) y Claude integra.
8. **Paleta = 4–6 colores BASE + variaciones tonales** (decisión del dueño, sección 1.3). La Art Bible fija la identidad (4–6 colores base) y el Style Gate mide la riqueza por cuadro (≈1.260–2.920 colores distintos): esa riqueza sale de las sombras, luces y tintes que el artista construye a partir de los colores base. No hay contradicción; se cumplen las dos. Además hay otras discrepancias menores en 1.3.
9. **El arte tiene que ser 100 % original** (sección 5). El caso Eren → Ilkan es la lección.
10. **Ante cualquier duda, entregar 1 muestra** (un campeón, un FX, un ícono) y pedir que Claude corra los chequeos (sección 3) antes de producir el lote.

---

## 1. Canon visual

### 1.1 Valores numéricos exactos del repo [VERIFICADO]

| Parámetro | Valor | Fuente |
|---|---|---|
| Identidad | Modern dark-fantasy pixel art: personajes en pixel art, VFX modernos | `docs/ART_BIBLE.md` §1, §7 |
| Vista | Cenital 3/4, cámara desde arriba en diagonal; luz desde arriba a la izquierda | `docs/ART_COMMISSION_BRIEF.md` (Prompt 0); `docs/production/PAINTER.md` ("volumen, luz arriba-izquierda") |
| Mundo visible | `650` unidades en el lado corto (máx. `1500` en el largo) | `js/core/constants.js:18-20` |
| Zoom de cámara | `min(w,h)/650` px CSS por unidad. A 844×390 = **0,6 px CSS/u** (medido en navegador: `computeCamZoom(844,390)=0.6`) | `js/core/canvas.js:25-27` |
| DPR / resolución | DPR tope 2; la resolución interna baja a 75 % y 60 % si el juego va lento; el arte se amplía nítido | `js/core/canvas.js:_dprNow, RES_LEVELS` |
| Radio del campeón | `24` unidades, escala `2.0` | `js/champions/hero-factory.js:25` |
| Altura del cuerpo en mundo | `radio × 2,7 = 64,8` u (la **altura total de la pose de reposo** se escala a eso) | `js/rendering/champion-sprites.js:245-247` (`champPackScale`) |
| Densidad de píxel canon | **1,0 u/px** para campeones, enemigos, élites, jefes, retratos; banda PASS **0,45 – 2,4 u/px** | `docs/ART_BIBLE.md` §14; `tools/art/pixel-density.js:CANON` |
| Suelos y fondos | 2,0 u/px (Ciudad, Minas), banda 1 – 2,4, ≤ 250 tonos, sin JPG | `docs/ART_BIBLE.md` §14; `tools/art/pixel-density.js:FLOOR_SCALE` |
| Celda de atlas de campeón | **112×112**, 4 columnas × 9 filas = `448×1008` | `tools/expedition/build-art.py:49,57-59,70`; `tools/factory/import-authored-sheet.py:70` |
| Línea de pies | fila **106** de la celda (`anchor = 106/112 = 0,9464`) | `tools/expedition/build-art.py:70`; `import-authored-sheet.py:77` |
| Altura de pose de reposo (`refH`) | 53 – 72 px en los atlas actuales (Renko 53 … Maura 72) | `js/champions/expedition/art.js` |
| Altura de cuerpo de referencia | el Caballero: **59 px a escala 2**; tolerancia **±4 %** de altura y **±2 px** de pies | `js/rendering/champion-art-normalize.js:1-9`, `js/data/champion-art-normalize.js:3`; `tools/art/roster_gate.js:TOL` |
| Contorno | 1 px, oscuro, uniforme en todo el roster. El gate de estilo exige que **≥ 61 %** del borde de la silueta sea oscuro (luminosidad Lab < 22) | `docs/ART_BIBLE.md` §2; `tools/art/painter/style_gate.py:42-43`; rango en `docs/art-gate/style-gate.json` |
| Alfa | **0 o 255** (medido en `baltra/atlas.png`: 0 píxeles semitransparentes) | `docs/ART_BIBLE.md` §2 y §6; `import-authored-sheet.py:74` (umbral ≥128 → 255) |
| Suavizado | `imageSmoothingEnabled=false` en todo sprite; vecino más cercano | `docs/ART_BIBLE.md` §6; p. ej. `js/rendering/anim-atlas.js:55` |
| Direcciones | 3 vistas dibujadas (abajo/frente, perfil derecha, arriba/espalda) + izquierda por espejo | `js/assets/champion-sprites.js:307-336` (`fix.left:"mirror"`), `js/rendering/champion-sprites.js:235-266` |
| Degradé "ilustración" (gate) | `suave > 0,18` **y** `ruido < 80/1000` px = ILUSTRACIÓN → REDRAW | `tools/art/pixel-density.js:CANON` |
| Paleta general de referencia del proyecto (8 muestras) | `#0e0a12 #3a2a30 #7a2a2a #c0503a #e8c27a #8a9a8a #4a78a8 #efe6d6` | `docs/ART_COMMISSION_BRIEF.md` (Prompt 0) |
| Paleta de los FX de habilidad | 6 roles por tema: `o` contorno, `d` sombra, `a` color, `b` luz, `c` brillo, `e` acento (24 temas, tabla en 2.2.6) | `js/champions/skill-fx-a/themes.js` |
| Alfa y colores de un FX horneado | alfa solo 0/255, **5–6 colores** por tira (medido: nova `time` = 5 colores, 0 semitransparentes) | verificado en navegador con `sfaBake('nova','time',80)` |
| Íconos de habilidad | 16×16 nativos, ≤ 6 colores, marco por categoría — **solo en el PR #119 (abierto)**, no en main | `git show origin/claude/iconos-contrato:js/ui/pixel-icons.js` líneas 305-355 |

### 1.2 Tamaño real de cada tipo de arte en pantalla (para calibrar el píxel)

Una unidad de mundo = 0,6 px CSS a 844×390 (1,2 px de dispositivo con DPR 2).

| Tipo | u/px de arte | Ejemplo |
|---|---|---|
| Campeón (celda 112) | ≈ 1,0 | cuerpo 65 px → 65 u → 39 px CSS |
| Motor A de FX (`skill-fx-a`) | 1,2 – 4,5 según el tamaño de la tira (`sfaBucket`, `engine.js:277`) | nova de radio 75: tira de 80 px → 1,95 u/px |
| Motor B de FX (`vfx-b`, decales) | ≈ 4,4 (`kvbS`, `pixfx.js:86`: "1 píxel de arte ≈ 4,4 unidades") | decal de radio 100 → 44 px |
| Motivos sueltos (`kvbPart`) | ≈ 2,2 (escala 1,6 × 1,35, `pixfx.js:127-128`) | abeja 9×8 → 24×21 u |
| Torreta de Brakk | 2,3 (`props.js: sc = 2.3`) | lienzo 28×28 → 64 u |
| Muro (teja) | ≈ 2,15 de alto (28 u / 13 px) y 2,15 de largo (34,5 u / 16 px) | `props.js:sfaDrawWallObj` |
| Ícono | 16×16 mostrado a 32 px CSS (2×) o 24 px (secundarias) | `css/hud-horda.css:38-39` |

### 1.3 Regla de paleta y contradicciones del repo que hay que conocer antes de producir [VERIFICADO]

**Regla de paleta (decisión del dueño): Art Bible y Style Gate son compatibles.** La Art Bible (§2) fija **4–6 colores BASE** por personaje (identidad); el Style Gate (`style_gate.py`) mide la **riqueza de color por cuadro** (1.484,5–2.535,5 colores distintos, ±15 % → ≈ 1.262–2.916), que sale de las **variaciones** (sombras, luces, tintes, sombreado) de esos colores base. El artista elige 4–6 colores base y construye todas las variaciones tonales a partir de ellos hasta entrar en el rango del gate. No se cambia ninguno de los dos.

**Ejemplo verificado (Baltra, cuadro 0 de `assets/sprites/champions/baltra/atlas.png`)**: 1.965 píxeles opacos con **1.881 colores distintos**; la mediana de los 12 cuadros de caminar es 1.806,5 (rango 1.664–1.944, dentro del gate). Agrupados en 6 colores base (cuantización por mediana de corte, % de píxeles): `#100b0b` 24,8 % (contorno/sombra profunda) · `#342018` 20,5 % · `#473328` 15,4 % · `#945b31` 14,3 % · `#6c3f22` 13,7 % · `#d6995e` 11,3 % (luz). Los ~1.880 colores son las gradaciones entre esas familias. Contraprueba: el mismo atlas reducido a 12 colores falla el gate (`colores 12 fuera de [1.26e+03, 2.92e+03]`, única medida que falla). Por eso: paleta base corta **y** variaciones tonales ricas, nunca paleta plana.

**Otras contradicciones:**

| # | Contradicción | Evidencia | Qué hacer |
|---|---|---|---|
| C2 | **El Caballero (Master Reference) no cumple el canon técnico**: `tanque/atlas.png` es `1024×1536`, cuadros de ~168×202 px, y **todos** sus píxeles no transparentes tienen alfa < 255 (máx. 254, borde difuso); se dibuja reducido con mipmap (`js/rendering/art-direction.js:129-149`). | medición propia (621.242 px no transparentes, 0 con alfa 255); `docs/ART_BIBLE.md` §2 vs §6 | No copiar el formato técnico del Caballero. Copiar su **gramática** (proporción chibi, contorno, lectura). El formato a seguir es el atlas de 112 px (2.1). |
| C3 | **Unidad de escala**: `docs/ART_COMMISSION_BRIEF.md` dice "1 px de arte = 2 u; un guardián ≈ 32–36 px"; `SPRITE_PRODUCTION_LIST.md` dice "90–120 px de alto para campeones"; `ART_BIBLE.md` §14 dice 1,0 u/px (≈ 65 px). El gate mide con §14. | los tres documentos; `pixel-density.js:CANON` | **Usar §14: ≈ 65 px de alto de cuerpo.** |
| C4 | **El gate de densidad no mide campeones ni FX**: `loadDensity` y el inventario excluyen `assets/sprites/champions` y `fx/vfx` (`pixel-density.js:120,155`). Los campeones solo pasan por `roster_gate.js` (escala/pies) y `style_gate.py` (estilo); los FX por nada de arte. | `tools/art/pixel-density.js` | Los FX no tienen gate visual hoy: ver 3.4 y sección 8 (`check-entrega`). |
| C5 | **Íconos**: el contrato 16×16 y su chequeo (`tools/art/check-skill-icons.js`) **no están en main** (PR #119 abierto). En main: motivos de 12×12 + insignia de 4×4 (`skill-pixel-glyphs.js`) y 6 PNG sueltos de tamaños 32×32, 69×79, 49×70. | `ls tools/art/check-skill-icons.js` → no existe; `assets/ui/skill-icons/` | Diseñar ya para el contrato de 16×16 (2.6) pero **no está garantizado hasta el merge**. |
| C6 | **Portadas de arena**: son `JPG` de 960×420 e ilustración (en la lista de excepciones del gate: ILUSTRACION + FORMATO_JPG). El código fija la extensión `.jpg`. | `docs/art-gate/pixel-density-exceptions.json`; `js/ui/codex/codex.js:270` | Ver 2.7. |
| C7 | **VFX**: el Art Bible dice que los VFX son "libres" (§7, §14) pero los motores horneados usan alfa 0/255 y ≤ 6 colores, y `test-vfx-b.js` exige alfa nítido para los sprites del motor B. El PR #120 (abierto) topa el relleno de decales en 24 %. | `tools/vfx/test-vfx-b.js:8`; PR #120 | Tomar alfa binario como contrato de hecho. |

### 1.4 Reglas de dibujo (resumen operativo)

| Regla | Sprites de campeón | FX de habilidad | Íconos |
|---|---|---|---|
| Alfa | 0/255 | 0/255 (translucidez = tramado Bayer 4×4, no alfa) | 0/255 |
| Contorno | 1 px oscuro, todo el borde | 1 px oscuro (`o`) en motivos; en anillos, borde exterior = radio | 1 px `#0b0f18` automático |
| Colores | 4–6 base + variaciones hasta el rango del roster (1.3) | 5–6 roles de tema | ≤ 6 (contrato) |
| Degradé | prohibido (sombreado por tonos) | prohibido (tramado) | prohibido |
| Glow / halo | **no pintado** (va en capas del motor, `docs/ART_BIBLE.md` §7) | **no pintar glow**: el motor suma sombra de contraste y copia aditiva (`anim-atlas.js:96-107`) en el camino `drawAnimFrameSized` | no |
| Texto en el arte | prohibido | prohibido | rótulo lo pone el HUD |
| Efectos dentro del cuerpo | prohibido: los VFX van en capas propias (`ART_BIBLE` §7) | — | — |

---

## 2. Assets por tipo

Cada subsección: **formato** · **nombre/carpeta** · **registro** · **enlace a la habilidad** · **prueba** · **estado**.

### 2.1 Sprite de campeón (atlas 4×9)

**Estado**: existe y funciona de punta a punta [VERIFICADO]. Es el formato de los 36 atlas actuales de 112 px (`assets/sprites/champions/*/atlas.png`: mediana 285 KB).

#### 2.1.1 Formato

| Campo | Valor |
|---|---|
| Archivo | PNG RGBA 8 bits, fondo transparente real, **`448 × 1008`** (4 col × 9 filas de 112 px). Sin padding entre celdas. |
| Pose | Una por celda, **una sola silueta conectada**, dentro de `x ∈ [1,110]`, `y ∈ [1,111]` (el importador rechaza si no cabe: `import-authored-sheet.py:78-79`). |
| Pies | Línea de pies en la fila **106** de la celda. Las poses de muerte (frames 32–35) se apoyan con el borde **inferior** de la silueta en la fila 106 (`import-authored-sheet.py:76`: `foot = frame.height-1` si `i>=32`). |
| Altura | **Altura total de la pose de reposo (cuadro 0) entre 62 y 72 px** (tope del gorro/pelo a los pies). Esa altura se guarda como `refH` y se mapea a 64,8 u. Si la pose es más alta, el motor la **achica**; si el arma/gorro sobresale mucho, el cuerpo queda chico y el Roster Art Gate lo corrige después (`champion-art-normalize`). |
| Escala del importador | `scale = targetHeight(70) / mediana(alto de bbox de los primeros 12 cuadros)`, reescalado `NEAREST` (`import-authored-sheet.py:69-72`). **Si la hoja fuente ya está a tamaño final (mediana de alto = 70 px), `scale = 1` y no se remuestrea nada.** Entregar a tamaño final. |
| Dirección del perfil | Mirando a la **derecha**. La izquierda se obtiene espejando alrededor del punto de apoyo (`champPackFeet` mide la mediana horizontal de piernas+torso, `js/assets/champion-sprites.js:352`); no dibujar vista izquierda. |
| Origen horizontal | Centrado en la celda; el motor recalcula el apoyo, pero un torso descentrado >18 % del ancho se recorta a ese límite (`champion-sprites.js:352-380`, `lim = fw*0.18`). |

#### 2.1.2 Las 36 poses (orden fijo)

El orden sale de `tools/expedition/build-art.py:57-59` (así se arman los `sets`). Plantilla con esta rejilla: `plantillas/champion_atlas_448x1008_PLANTILLA.png`.

| Fila | Cuadros | Contenido | Cómo lo usa el motor |
|---|---|---|---|
| 1 | 0–3 | Caminar **abajo** (frente) | `walk_down`; `idle_down` = cuadro **0** (un solo cuadro, sin animación de reposo) |
| 2 | 4–7 | Caminar **perfil derecha** | `walk_side`; `idle_side` = cuadro 4 |
| 3 | 8–11 | Caminar **arriba** (espalda) | `walk_up`; `idle_up` = cuadro 8 |
| 4 | 12–15 | Ataque básico abajo | `attack_down`; `hit_down` = cuadro 12 |
| 5 | 16–19 | Ataque básico perfil | `attack_side`; `hit_side` = cuadro 16 |
| 6 | 20–23 | Ataque básico arriba | `attack_up`; `hit_up` = cuadro 20 |
| 7 | 24–27 | **Lanzar habilidad** (de frente; se usa para las 3 direcciones) | `cast_*` |
| 8 | 28–31 | **Definitiva** (de frente) | `ultimate_*` (solo si el kit marca `portCastState==='ultimate'`: `champion-sprites.js:306`) |
| 9 | 32–35 | **Muerte** (termina tendido) | `death_*` |

Temporización real [VERIFICADO, `js/rendering/champion-sprites.js:288-330`]:

| Estado | Cómo se reproduce |
|---|---|
| Caminar | `floor(animT/130) % n` → ≈ 7,7 cuadros/s; ciclo de 4 cuadros = 520 ms |
| Reposo | un cuadro (si el set tiene varios: `floor(animNow/230) % n`) |
| Ataque / lanzar | el progreso real de `attackAnim` se reparte entre los cuadros; lanzar habilidad ≈ 420 ms (≈ 105 ms/cuadro), definitiva ≈ 650 ms (≈ 160 ms/cuadro) (`js/champions/quality-five/aelith.js:18`; ascensión 700 ms) |
| Golpe recibido | un cuadro durante 160 ms |
| Muerte | 170 ms por cuadro; luego queda el último cuadro a alfa 0,55 |

**Limitaciones del formato** (no son errores del artista): no hay animación de respiración en reposo (1 cuadro); el cast y la definitiva son de frente para las tres direcciones; no hay pose distinta por habilidad. Si se quiere más, es **[HUECO]** de importador (sección 8, H7).

#### 2.1.3 Carpeta, nombre y registro

| Qué | Dónde |
|---|---|
| Atlas base | `assets/sprites/champions/<id>/atlas.png` |
| Miniatura | `assets/sprites/champions/<id>/preview.png` = recorte `(0,0,112,112)` del atlas (`import-authored-sheet.py:84`) |
| Skin / croma de arte propio | `assets/sprites/champions/<id>/skins/<pack>/atlas.png` (+ `preview.png`) |
| `<id>` | clave interna del campeón (minúsculas, `[a-z_]`), la misma de `CLASSES` (p. ej. `aelith`, `nano_gm`) |

**Registro (línea de código)** [VERIFICADO]: una llamada `champPackLoadAtlas(id, ruta, meta)` en un archivo cargado después de `js/assets/champion-sprites.js` (`index.html:600`). Ejemplo mínimo real (`js/champions/expedition/art.js:3`):

```js
champPackLoadAtlas("baltra","assets/sprites/champions/baltra/atlas.png",{"w":112,"h":112,"cols":4,"refH":64,"anchor":0.9464285714285714,"fix":{"left":"mirror"},"sets":{"idle_down":[0],"walk_down":[0,1,2,3],"attack_down":[12,13,14,15],"cast_down":[24,25,26,27],"ultimate_down":[28,29,30,31],"hit_down":[12],"death_down":[32,33,34,35],"idle_side":[4],"walk_side":[4,5,6,7],"attack_side":[16,17,18,16],"cast_side":[24,25,26,27],"ultimate_side":[28,29,30,31],"hit_side":[16],"death_side":[32,33,34,35],"idle_up":[8],"walk_up":[8,9,10,11],"attack_up":[20,21,22,23],"cast_up":[24,25,26,27],"ultimate_up":[28,29,30,31],"hit_up":[20],"death_up":[32,33,34,35]}});
```

`champPackLoadAtlas` (`js/assets/champion-sprites.js:382`) registra la fuente en el precargador (`assetsRegisterSource`), normaliza los sets (rellena izquierda por espejo, estados faltantes, caminatas cortas: `champPackNormalize`, `:307`) y deja el atlas en `CHAMP_PACK[id]`. Un índice **negativo** `n` en un set es el cuadro `~n` espejado.

**Qué archivo editar según el caso**:

| Caso | Archivo | Cómo |
|---|---|---|
| Campeón de la Expedición | `js/champions/expedition/art-data.json` → `node tools/expedition/register-art.js` regenera `js/champions/expedition/art.js` | `register-art.js` escribe un `champPackLoadAtlas` por entrada |
| Campeón de Ascensión / calidad cinco | `js/champions/ascension/art.js` (línea por campeón, p. ej. `:34` Aelith); lo escribe `python3 tools/art/painter/install.py <id>` | `install.py` copia atlas+preview y reescribe la línea |
| Hoja de autor humano (sin donante) | **[HUECO]**: `import-authored-sheet.py` solo genera `atlas.png`, `preview.png` e `import-report.json` con estado `IMPORTED_NOT_APPROVED`; **no registra** nada. Claude escribe la línea (con los `sets` estándar de arriba, `refH` = alto del cuadro 0). |
| Campeón **nuevo** (clase, kit, balance) | `AGENTS.md` pasos 1–7: registrar clase y módulos **antes** de `js/systems/champion-entry-balance.js` en `index.html:960`, correr `check-entry-reference.js` y `entry-gate.js`, no tocar `knownChampions`. Es trabajo de Claude, no del artista. | `docs/production/PRODUCTION_BIBLES.md` ("Champion Bible"), `tools/factory/cli.js` |

Carga en el juego: todo lo que cuelga de `assets/sprites/champions/<id>/` (salvo `preview*`) entra al grupo diferido **`ch:<id>`** y baja con el campeón elegido (`js/assets/lazy-images.js` `CH_RE`); `preview.png` va en la primera tanda. WebP: `python3 tools/art/webp_convert.py` genera copias sin pérdida de los PNG listados en `js/assets/asset-manifest.js` (el juego pide `.webp` si está en `js/assets/asset-webp.js`).

#### 2.1.4 Cómo se enlaza a la jugabilidad

Por **clave de campeón** (`h.classKey`) y **estado**: `drawChampPack(key, h, …)` elige el set `<estado>_<dirección>` (`js/rendering/champion-sprites.js:288`). **No hay enlace por habilidad**: las 3 habilidades usan la misma fila "lanzar", y la definitiva la fila "definitiva". El efecto de cada habilidad se pinta aparte (2.2).

#### 2.1.5 Cómo se prueba

Orden: (1) `python3 tools/factory/import-authored-sheet.py fuente.json salida/` (rechaza grilla mal armada, silueta pegada al borde, poses fusionadas, recorte al escalar); (2) `python3 tools/art/scan_sprites.py --dir champions/<id>` (halo, semialfa, fragmentos; solo informa; **ejecutado sobre `champions/baltra`: 0/7 archivos marcados**); (3) `python3 tools/art/painter/style_gate.py <atlas.png>` (estilo); (4) con el atlas instalado: `node tools/art/roster_gate.js --write` y luego `node tools/art/roster_gate.js` (escala y pies; **ejecutado en main: 136 apariencias, 0 fallos**); (5) `node tools/art/skin_audit.js <carpeta>` (vistas izquierda/derecha opuestas, estados que resuelven; **ejecutado con `PACKS=baltra`: 0 fallas**); (6) revisión humana contra el Caballero (`docs/ART_BIBLE.md` §8). Detalle y significado de fallos: sección 3.

---

### 2.2 Efectos de habilidad (FX)

**Estado**: **100 % procedural** [VERIFICADO]. Hay dos motores y un camino de sprites sueltos. **No existe hook para cargar arte pintado en reemplazo del procedural** (salvo sprites sueltos y skins de set): ver 2.2.7 y sección 8 (H1–H3).

Cantidad a cubrir: 172 habilidades (88 de la mitad A + 84 de la mitad B, sin contar básicos) = 88 de la mitad A (22 campeones × 4; `docs/vfx/HABILIDADES_VFX_MITAD_A.md`) + 84 de la mitad B (21 × 4; `docs/vfx/vfx-audit-b.md` describe ese reparto). Priorizar: definitivas → habilidad firma → resto.

#### 2.2.1 Contrato de tiempo (los tres tiempos)

`engine.js:8-10`: **ANTICIPACIÓN** (el área verdadera, punteada, con marcas que convergen) → **IMPACTO** (frente que barre el área real) → **DISIPACIÓN** (el contorno se afina y los motivos se deshacen). `docs/production/PRODUCTION_BIBLES.md` ("Ability Bible"): anticipación → ejecución → impacto → feedback; una habilidad peligrosa necesita una oportunidad real de respuesta. El arte **no cambia** cooldown, radio, daño ni hitbox.

#### 2.2.2 Motor A (`js/champions/skill-fx-a/`, 22 campeones: `aelith` … `musashi`)

Una tira horizontal por **(arte, tema-variante, tamaño)**; los cuadros están pegados, sin separación (`drawImage(cv, f*w, 0, w, h)`, `engine.js:308`). Alfa 0/255. Se dibuja en una de dos capas: `top` (sobre las entidades) o `ground` (bajo ellas) (`SFA_LAYER`, `engine.js:280`).

| Arte | Tira (cuadros × celda) | Fases por cuadro | Loop | Pivote / orientación | Cómo escala al radio real |
|---|---|---|---|---|---|
| `nova` (onda en el área) | **12** × `S×S` | 0–1 anticipación (borde punteado + marcas); 2–6 impacto (5 cuadros); 7–11 disipación (5) — `engine.js:104` (`SFA_NOVA_N=12, A=2, I=5`) | no; `f = floor(k·12)` sobre `dur` (700 ms; 1000 ms en definitiva: `templates.js:15`) | centro de la celda = centro del área | `S = sfaBucket(2r)`; se dibuja a `D = S·2r/(S−3)`: el **anillo exterior queda a 1,5 px del borde** de la celda y ese borde es el radio real |
| `zone` (zona persistente) | **8** × `S×S` | bucle: borde punteado girando + motivos en órbita + emblema | **sí**, `floor(animNow/95) % 8` (760 ms); alfa sube en 260 ms y baja en los últimos 420 ms | centro | igual que `nova` |
| `cone` (abanico) | **10** × `(S+2) × H`, con `H = ceil(2·S·sin(min(arc,1.5)) + 6)`; `S ∈ {48,64,96}` | 0–1 anticipación; 2–6 barrido (frente de arriba a abajo); 7–9 cola | no | **vértice a la izquierda en (1, H/2)**, eje en +x; se gira por el ángulo | `sc = r/(S−1)`; el borde del arco = alcance |
| `beam` (haz / línea) | **8** × teja de `16 × H`, `H ∈ {8,12,16,24}` según el ancho | cuerpo que fluye: la teja se desplaza 2 px por cuadro y **debe repetirse sin costura cada 16 px** | sí (`floor(animNow/70)`) | se repite a lo largo de la línea, +x | `sc = w/H`; la anticipación usa espesor 0,3 y alfa 0,45; la disipación se afina |
| `burst` (estallido pequeño: punto de impacto, eco, invocación) | **8** × `S×S`, `S` por `sfaBucket` (32 mín.) | 0–2 núcleo; 3–7 rayos que se deshacen | no | centro | `D = 2r·S/(S−3)` |
| `aura` (sobre un aliado) | **8** × `40×56` | bucle: anillo en el suelo + columna + motivos que suben | sí (`floor(animNow/100)`) | **centro del anillo de suelo en (20, 47)** (`gy = 56−9`); se dibuja con `sc = r/20` (r=44 → 2,2) y la base 8·sc **debajo** de los pies | sigue al héroe (`fi`) |
| `rays` (destello radial) | **8** × `S×S` | 0–1 crece; 2–4 pleno; 5–7 se deshace | no | centro | como `nova`, radio 0,42·r (mín. 40) |
| `rings` (ondas concéntricas) | **10** × `S×S` | 3 anillos desfasados que se abren | no | centro | radio = `r` de la nova |
| `column` (columna de luz, definitiva) | **10** × `40×88` | sube (0–5), pleno, se deshace (7–9) | no | **base en (20, 80)**; se dibuja `y − dh + 8·sc`, `sc = r/20` | `r` = 16 (en auras) o 26–70 (definitiva) |

Fuentes: `engine.js:104-260`, `arts2.js:1-60`, `bind.js:151-176` (`sfaExtras`). Capas añadidas **automáticamente** a cada habilidad: no-definitiva = `rays` + `rings` (si r ≥ 60); definitiva = `rays` + `rings` + `column` + una `nova` oscura (`~k`) retrasada 380 ms + `vfxShake(8)` (`bind.js:151-165`). El pintor debe saber que **una habilidad es un conjunto de varias tiras**, no una.

**Buckets de tamaño** (`sfaBucket`, `engine.js:277`; verificado en navegador): diámetro en unidades → celda en px.

| Diámetro u | ≤44 | ≤66 | ≤98 | ≤150 | ≤230 | ≤340 | ≤500 | >500 |
|---|---|---|---|---|---|---|---|---|
| Celda `S` (px) | 32 | 48 | 64 | 80 | 96 | 128 | 160 | 192 |

Con maestría/talentos el radio crece y la tira cambia de bucket (p. ej. radio 75 → bucket 80; radio 76 → bucket 96): **un arte pintado debe existir en todos los buckets que su habilidad pueda alcanzar, o el motor debe poder escalar un máster** (H1).

#### 2.2.3 Qué tira, qué tema, qué variante: cómo se enlaza a una habilidad

Cadena [VERIFICADO]: `SFA_BIND[campeón][ranura]` (`bind.js:14`) → plantilla (`js/champions/skill-fx-a/templates.js`: `sfaNovaAt`, `sfaLine`, `sfaCone`, `sfaDash`, `sfaAura`, `sfaMulti`…) → `sfaP(arte, tema, x, y, r, opciones)` (`bind.js:34`) → `vfxSfaPlay` (`engine.js:283`, viaja por red a los invitados) → `sfaPush` → pool.

* La geometría **sale del lanzamiento real** (`aimPoint`, `aimDir`, `vfxSkillCone`, `kitFx`, objetos nuevos), no de una tabla (`bind.js:2-8`). El arte solo se escala.
* **Variante por ranura** (`SFA_VSUF`, `bind.js:32`): básico `~p`, hab. 1 base, hab. 2 `~h`, hab. 3 `~p`, definitiva `~h`. `~h` = tono girado, `~p` = pálida, `~k` = oscura (`engine.js:sfaDeriveVariant`). Hoy las variantes son recolores procedurales del mismo tema; un arte pintado necesita **su propia tira por variante** o una clave por habilidad (decisión H1).
* Ejemplo real (Aelith, `js/champions/skill-fx-a/c/aelith.js`):

```js
SFA_OBJ.ael_echo = {theme: 'time', end: 'nova', endDur: 520};
SFA_OBJ.ael_hour = {theme: 'time', pulse: true, end: 'nova', endDur: 720};
SFA_BIND.aelith = {themes: ['time'],
  0: sfaNovaAt('time'),
  1: sfaLine('time'),
  2: sfaAura('time', {r: 140, allies: true, test: a => a.aelithDebtUntil > runElapsedMs}),
  ult: sfaNovaAt('time')
};
```

* **Objetos persistentes** (`SFA_OBJ`, `bind.js:15`): zonas ligadas a `portadorObjects` por `kind`; dibujan `zone` mientras vive el objeto y al morir emiten `end` (`nova`/`burst`).
* **Ataque básico** (`bind.js:174-191`): tajo/estallido corto y pálido (`~p`): cono de arco 0,6 y 260 ms (cuerpo a cuerpo) o `burst` r=24 de 280 ms (a distancia).

#### 2.2.4 Motor B (`js/champions/vfx-b/`, 21 campeones: `myla` … `zahra`)

| Pieza | Formato | Detalle |
|---|---|---|
| **Decal** (`kvbDefDecal(name, N, paint)`) | `N` cuadros cuadrados `S×S`, `S = clamp(round(2R/4.4/4)·4, 24, 128)` (múltiplos de 4: R=50→24, R=100→44, R=200→92, R≥280→128) | El borde exterior = radio. Fases por `q` (0..1) — `kvbPhase` (`pixfx.js:60`): **anticipación 0–0,22**, **impacto 0,22–0,42**, **disipación 0,42–1**. Cuadro = `min(N−1, floor(q·N))`. Capa `g` (suelo) o `t` (encima). `loop:true` para zonas vivas (`kvbLoopDecal`). |
| **Sector** (`kvbSectorPaint`) | decal con **vértice en el centro** y eje en +x; se gira por `rot` | borde exterior = alcance real |
| **Rayo** (`kvbDefBeam(name,N,tileW,H,paint)`) | `N` cuadros de teja `tileW×H` repetible a lo largo de la línea | dibujo `kvbDrawLayer` (`pixfx.js:168`) |
| **Motivo** (`kvbDefMotif(name,w,h,paints,ol)`) | sprite chico de `(w+2)×(h+2)` con contorno de 1 px, 1 o varios cuadros; ráfagas con `kvbEmit` (≤ 60 por llamada) | escala ×1,6 × 1,35 por defecto |
| **Decales de impacto genérico** | `pn_flash_<color>` y `pn_ult_<color>`, derivados del color del campeón | `hooks.js:kvbTone`, `kvbPunch` |

Enlace a la habilidad (`js/champions/vfx-b/hooks.js:16-22`): `kvbBind('ex:swarm','tibor.swarm')` (acción de Expedición/Ascensión) · `kvbBindQ5(acción, id)` (calidad cinco) · `kvbClassic(clase, kind, fn)` · `kvbPortador(clase, kind, fn)` · `kvbSkin(kind, spec, clase)` (objeto persistente) → `KVB_FX['tibor.swarm'] = (x,y,r,ang,a,b) => {...}` que llama `kvbDecal`/`kvbEmit`. Ejemplo mínimo: `js/champions/vfx-b/tibor.js`. Los efectos se graban en el anfitrión y se repiten en los invitados con argumentos numéricos (`NET_EVENT_FNS`, `pixfx.js:213`).

#### 2.2.5 Sprites sueltos (`vfxSprite`) — el único camino que ya acepta PNG pintados

`js/rendering/vfx.js:167-223`: pool de **40**; cada entrada = una lista de `Image` (`VFX_SPR_EXTRA[clave] = {imgs, ready, ground}`), un cuadro por archivo; `vfxSprite(clave, cuadro, x, y, h, dur, follow, grow, flip, anchorY, fps, vx, vy, rot)`. Dibuja a **alto `h` en unidades de mundo** (ancho proporcional), crece de 35 % a 100 % durante `grow` (fracción de la vida), se desvanece en el último 30 %. Pasa por `drawAnimFrameSized`, así que **recibe sombra de contraste y copia aditiva** (`anim-atlas.js:96-107`).

Precedentes de arte pintado que usan este camino:

| Familia | Archivos | Registro |
|---|---|---|
| Efectos de skins de set | `assets/vfx/skins/<set>/<clip>_<n>.png` (un cuadro por archivo; 53×33 … 104×29 px, mediana 12 KB) | `js/assets/skin-fx-meta.js` (generado por `tools/art/skins_sets/fx.py` desde `art-source/skins_sets/*.png`) + plan por skin en `js/systems/skin-fx.js` (`SKIN_FX_PLAN`: modos `front/self/feet/aim/proj/origin/dest`) |
| Pack "newfx" | `assets/vfx/abilities/<nombre>_<NN>.png` | `js/assets/vfx-sprites.js:134-136` (`newfxLoad`) + `VFX_SPR_EXTRA` (`vfx.js:199-205`) |
| Jefes (aliento, nova) | tiras de 12 cuadros | `js/rendering/effect-atlases.js` (`buildStripClip`) |

#### 2.2.6 Los 24 temas de color del motor A

Paleta `o d a b c e` (contorno, sombra, color, luz, brillo, acento) y silueta del frente (`js/champions/skill-fx-a/themes.js`). Campeones: aelith `time` · aurelia `prism` · axiom `glitch` · baltra `bell` · brakk `siege` · brasa `steam` · bront `crystal` · cazadora `hunt` · dariel `music` · eslabon `chain` · facu_gm `tide` · farolero `lantern` · guerrero `blood` · ilkan `sand` · iria `thread` · khepri `scarab` · libertador `patria` · mago `fire`/`frost`/`storm` · maura `thorn` · morveth `plague` · morwen `alchemy` · musashi `ink`.

| Tema | o | d | a | b | c | e | Silueta |
|---|---|---|---|---|---|---|---|
| time | #1e1633 | #5a4a8c | #a58fd6 | #d9c9f5 | #fff8e0 | #f0c070 | sun |
| prism | #3a2400 | #a86a12 | #f2c14e | #ffe69a | #fffbe8 | #ffffff | hex |
| glitch | #06161a | #1f6e75 | #3ad6c4 | #9df5ea | #ffffff | #ff4fd8 | glitch |
| bell | #0f2326 | #3d6d73 | #8bb4bd | #cfeef0 | #ffffff | #d9a24a | scallop |
| siege | #1b140c | #6d5636 | #cead7a | #f0dcae | #fff6dc | #ff8a3c | square |
| steam | #2a1608 | #8a5426 | #c58543 | #ffd28a | #fff4dc | #ffffff | gear |
| crystal | #101c26 | #44627a | #8aa4b8 | #bfe8ff | #ffffff | #5fd0ff | hex |
| hunt | #12220c | #2f5a24 | #5c9a4a | #c8f0a8 | #f4ffe0 | #d8b050 | petal |
| music | #2a1a08 | #8a6a34 | #d6af77 | #f6dba8 | #fffaf0 | #c88aff | wave |
| chain | #14161c | #5b606e | #9195a1 | #e4dfc8 | #ffffff | #d8b868 | hex |
| tide | #0a1a34 | #2a6ab0 | #5aa8e4 | #b8e0ff | #ffffff | #7af0e0 | wave |
| lantern | #2a1c08 | #8a6c30 | #e8c060 | #ffe7a5 | #fff9e0 | #ff9a3c | sun |
| blood | #2a0808 | #7a1c1c | #c4544a | #f0a89a | #fff0ec | #ffd0a0 | spike |
| sand | #2a1608 | #8a5a2a | #d89a4a | #f4d08a | #fff6dc | #4fe3cf | scallop |
| thread | #181830 | #4e50a0 | #8889c1 | #e3e0ff | #ffffff | #ffd870 | tri |
| scarab | #0a1a12 | #1f6a50 | #3fae8a | #c8f27a | #f4ffd0 | #ffd24a | petal |
| patria | #0e1c3c | #2f4f9a | #6ea0e8 | #f4f8ff | #ffffff | #f2c14e | sun |
| fire | #2a0a04 | #b02a10 | #ff6a3d | #ffc36a | #fff4c8 | #ffffff | spike |
| frost | #0c1c2c | #3a78a8 | #7ad0ff | #cff3ff | #ffffff | #ffffff | hex |
| storm | #20184a | #6a58d8 | #ffe36a | #fff6b0 | #ffffff | #a89cff | glitch |
| thorn | #1a2010 | #4a5a30 | #879c60 | #cfe0a0 | #f4ffe0 | #d86a8a | petal |
| plague | #121c08 | #4a6a24 | #a4c56a | #dcf0a0 | #f8ffe0 | #b070d8 | scallop |
| alchemy | #24101e | #6e3a60 | #a46191 | #edd0a5 | #fff6e8 | #7ae0b0 | hex |
| ink | #080c14 | #2a4a68 | #5aa8d8 | #bfe4ff | #ffffff | #e04040 | spike |

Los motivos (3–9 px, a mano en ASCII) están en `js/champions/skill-fx-a/motifs.js` (`o` contorno, `d` sombra, `a` color, `b` luz, `c` brillo, `e` acento; todas las filas del mismo largo; lo comprueba `tools/vfx/sfa-sheet.js`).

#### 2.2.7 Estado del reemplazo por arte pintado [HUECO]

| Pieza | ¿Se puede cargar un PNG pintado hoy? |
|---|---|
| Tiras `nova/zone/cone/beam/burst/aura/rays/rings/column` (motor A) | **No.** Todas pasan por `sfaBake` (`engine.js:262`), que siempre hornea por código. Propuesta H1. |
| Decales/rayos/motivos (motor B) | **No.** `kvbDecalFrames`/`kvbMotif`/`kvbBeamFrames` (`pixfx.js:87-110`) pintan por código. Propuesta H2. |
| Sprites sueltos (`vfxSprite`) y arte de proyectil (`p.sprite`) | **Sí**, con una entrada en `VFX_SPR_EXTRA` (`vfx.js:172`) y llamando `vfxSprite` desde el kit. Falta un registro declarativo (H3). |
| Skins de set | **Sí**, ya integrado (`skin-fx.js`). |

#### 2.2.8 Comportamiento con "Reducir efectos intensos" y con carga alta

[VERIFICADO] (`engine.js:281-296,302-312`; `pixfx.js:20-26,111-118`): con `JUICE.reduceFx` o `vfxLoad < 0,6`, el motor A **omite** `rays`/`rings`/`column` y baja el pool de 40 a **16**; `nova`/`zone` se dibujan a alfa 0,8. El motor B reduce el presupuesto de motivos al 40 % (`kvbBudget`) y el pool de 128 a 64. "Reducir movimiento" (`JUICE.reduceMotion`) deja los bucles de decal en el cuadro 0 (`kvbCalm`). **Lo que comunica el peligro tiene que leerse sin las capas decorativas**: el arte esencial = borde de área + ola de impacto; `rays/rings/column` son accesorios.

---

### 2.3 Proyectiles

**Estado**: parcialmente soportado [VERIFICADO] (`js/rendering/entities.js:500-546`).

| Camino | Formato | Registro / enlace |
|---|---|---|
| Forma propia por campeón (procedural: `arrow`, `dagger`, `orb`, `wisp`, `crescent`, `glyph`, `rune`, `soul`, `bullet`, `slug`, …) | código (`drawProjStyle`, `js/systems/skill-evolution.js:168`) | `CHAMP_IDENTITY[clase].proj` (`js/data/champion-identity.js`) |
| **Sprite pintado** | lista de `Image` con una entrada en `VFX_SPR_EXTRA` (cuadros de archivos sueltos, ciclo de 80 ms por cuadro); el proyectil lleva `p.sprite = <clave>` y `p.sprH` | `entities.js:535-538`: dibuja a **alto `r·(sprH||2,6)`**, **rotado hacia la velocidad** → el arte debe **apuntar a +x (derecha)** |
| Glow, estela y sombra | **no se pintan**: `_drawProjCore` suma sombra de contraste (`fxDarkSprite`), estela aditiva con alma blanca y brillo (`glowSprite`) debajo de cualquier sprite | `entities.js:510-531` |

Medidas recomendadas: `radius` del proyectil `r ≥ 3`; con `sprH = 2,6` el sprite mide `2,6·r` u de alto (r = 4–8 → 10–21 u; a 1 u/px ≈ 10–21 px). Tira de 1–4 cuadros, **la punta hacia +x**, centrado. Carpeta propuesta: `assets/sprites/champions/<id>/fx/proj_<nombre>_<NN>.png`. **Prueba existente**: `node tools/quality/test-projectile-identity.js` (cada campeón que dispara tiene forma propia, ninguna repetida, dibujos distintos píxel a píxel). **[HUECO]**: asignar `p.sprite` en el kit de cada campeón es código por campeón (el registro de skins lo hace con `SKIN_FX_PLAN`, `m:"proj"`).

---

### 2.4 Props persistentes (muros, torretas, trampas, zonas)

**Estado**: **código** [VERIFICADO]; no hay camino de PNG para objetos de habilidad. Hay un camino de PNG para **decorado de arena**.

#### 2.4.1 Objetos de habilidad (`portadorObjects`)

| Objeto | Cómo se dibuja hoy | Medidas del arte horneado |
|---|---|---|
| Muro (Brakk) | `sfaDrawWallObj`: teja repetible rotada por `(o.dx,o.dy)` | **teja `16×13`** px (hileras desfasadas, luz arriba, sombra abajo); largo `2·o.r`; se estira a 28 u de alto (sube en 260 ms) y 34,5 u de largo por teja (`props.js`) |
| Torreta (Brakk) | `sfaDrawTurretObj` | lienzo **`28×28`**: base fija `22×11` en (3,16) + torreta/cañón `20×10` en (8,7) que **gira hacia el enemigo más cercano** (el cañón apunta a la **derecha** en reposo); escala 2,3 |
| Ancla / farol / alambique / hongos | `sfaDrawMotifObj`: un motivo del tema sobre su zona | motivo de 3–9 px × `sc` + zona |
| Zona de suelo de cada objeto | `SFA_OBJ[kind]` (`bind.js:15`) → tira `zone` | 2.2.2 |
| Objetos del motor B | `kvbSkin(kind, spec, clase)` con `R`, `loop`, `draw`, `pulse`, `end` (`hooks.js:22`) | ejemplo: `tibor.js` (`ex_swarm`) |
| Objetos del motor base (cadena, camino, torre de Myla, farol…) | `fillRect` y círculos en `drawPortadorGround/Top` | `js/rendering/portadores.js` |

Reglas: **la hitbox y la vida son las del objeto** (`o.r`, `o.hp`); el arte nunca las cambia. Nacen con una subida de 220–300 ms y al caer hacen estallido de escombros (`props.js`). Prueba: `ability-gate` (efecto visual), `verify-mechanics.js`, `parity-skill-fx.js`.

#### 2.4.2 Decorado de arena (sí acepta PNG pintado)

`js/rendering/battlefield-art.js` + `js/assets/battlefield-meta.js`: cada prop es un PNG en **`assets/sprites/battlefield/<clave>.png`**, descrito en `BATTLEFIELD_META[clave] = {"w":448,"h":384,"ref":…}`; se instancia con `battlefieldProp(clave, x, y, alto, radioSólido)` (alto en u; ancho = `alto·w/h`; ancla `(0,5; 0,98)`; alfa 0,38 si un héroe queda detrás y el prop mide > 110 u). Los 32 PNG actuales miden 84–683 KB. Hoy los arma `tools/art/import-battlefield.py` y `tools/art/battlefield_pixelize.py` (reduce a la grilla nativa con paleta propia). Es el modelo a imitar para props pintados de habilidad (H4).

---

### 2.5 Decales de suelo

**Estado**: procedural [VERIFICADO]. Tres familias:

| Familia | Capa | Qué es | Formato equivalente |
|---|---|---|---|
| `zone` del motor A (`sfaObjectsFrame`, `sfaListsFrame`, `sfaHeroZFrame`) | `ground` | zona persistente de 8 cuadros en bucle | 2.2.2 (`zone`) |
| Decales del motor B (`layer:'g'`, `kvbLoopDecal`) | suelo | `N` cuadros cuadrados | 2.2.4 |
| **Avisos de peligro** (`vfxTelegraph`, `vfx.js:155-166`; formas 0 círculo, 1 cono, 2 línea) | suelo | **código, no arte** | se mantienen: son la hitbox verdadera y existe la opción "Avisos de alto contraste" (`vfx.js:VFX_HICON`, contorno negro + filo blanco punteado + rayado) |

**Regla**: el arte pintado de un decal **no sustituye al aviso de peligro del enemigo**; el contorno exterior es el radio real y el relleno va tramado a baja densidad (el PR #120 lo topa en 24 % y exige ≥ 80 % del sprite enemigo visible: `tools/vfx/test-decal-legible.js`, solo en esa rama).

---

### 2.6 Íconos de habilidad

#### 2.6.1 Estado en `main` [VERIFICADO]

| Dato | Valor |
|---|---|
| Qué se ve en el HUD | si existe `SKILL_ICON_IMG[sk.name]` un PNG (hoy solo **6**: Torbellino, Embestida, Grito de Guerra, Cadena de Relámpago, Nova de Escarcha, Muro de Fuego; **tamaños 32×32, 69×79 y 49×70**: `js/assets/ui-icons.js:7-14`); si no, un glifo pixel procedural `skillPixelGlyphUri(champ, ranura, color)` (`js/ui/skill-pixel-glyphs.js:247`); si no, un SVG genérico por palabras clave (`js/ui/skill-glyphs.js`) |
| Glifo pixel | **motivo de 12×12 + insignia de 4×4** en una grilla de 14×14 con contorno de 1 px automático (`skill-pixel-glyphs.js:217-245`); paleta por letra: `#` color del botón · `l` luz · `d` sombra · `k` trazo oscuro · `a` oro · `r` rojo · `g` verde · `c` celeste · `w` blanco; el mapa `"campeón:ranura":"motivo+insignia"` está en `SKILL_PIXEL_MAP` (`:164`; ranuras `0,1,2,u`) |
| Dónde se muestra | `ico-pix`: 32 px (24 px las secundarias), `image-rendering: pixelated` (`css/hud-horda.css:38-39`); rótulo de hasta **8** caracteres (`hudSkillLabel`, `js/ui/hud.js:9`) |
| Usos del PNG por nombre | HUD `hud.js:25`, panel de Habilidades `panels-skills.js:29`, inspector `ability-inspector.js:29`, registro `ability-registry.js:102`, refuerzos `boons.js:99` |
| Prueba | `node tools/ux/test-skill-glyphs.js` (ningún campeón con glifo genérico, dos habilidades de un kit nunca comparten motivo, ninguna pareja motivo+insignia se repite, el rótulo no se sale del botón) |

#### 2.6.2 Contrato nuevo (PR #119, **abierto, no mergeado**) [VERIFICADO en la rama `origin/claude/iconos-contrato`]

| Regla | Valor |
|---|---|
| Tamaño nativo | **16×16** (se muestra a 2× = 32 px, entero; sin suavizado) |
| Colores | **≤ 6** y **≥ 4**: contorno `#0b0f18`, marco, cuerpo en 3 tonos, 1 acento |
| Glifo | **14×14** dentro del marco; contorno de 1 px oscuro automático alrededor de todo lo pintado (un píxel del glifo que toque el vacío sin contorno es falla) |
| Marco de 1 px por categoría | **básico**: cuadrado, cobre `#e0924f` · **habilidad**: esquinas cortadas, acero `#9fb4cc` · **definitiva**: cuadrado con tachones, oro `#ffd35a` (la forma distingue la categoría, no solo el color) |
| Alfa | 0 o 255; interior transparente (se ve la placa del botón) |
| Color del cuerpo | el cuerpo (3 tonos) toma el color de la **ranura** del botón (`#8fe0ff` hab.1, `#cfc2ff` hab.2, `#97f0cc` hab.3, `#ffe9a8` definitiva); el artista pinta **roles tonales** (medio/luz/sombra) + 1 acento, no colores libres |
| Rótulo | fuente Press Start 2P a 8 px, **máx. 5 letras** (`SKILL_SHORT_LABEL`), dentro del botón sin tocar aro ni ícono |
| Unicidad | dos definitivas con > 85 % de píxeles iguales (o silueta IoU > 92 %), o dos íconos de un mismo kit con > 85 %, **fallan** |
| Chequeo | `node tools/art/check-skill-icons.js [--self-test] [--write]` (solo en la rama del PR #119; **no existe en main**) |

Qué entregar (válido para ambos estados): PNG **16×16** por habilidad con el glifo en `x,y ∈ [1,14]` ya con contorno, **en roles tonales**, y una **hoja 14×14 sin marco** si Claude debe convertirla a las letras del motor. Plantilla: `plantillas/icono_16x16_ampliado_x16_PLANTILLA.png` (marcos por categoría). Carpeta de entrega: `assets/ui/skill-icons16/<campeón>_<ranura>.png` (**[PROPUESTA]**, no existe). Nombre: `<id>_0.png`, `<id>_1.png`, `<id>_2.png`, `<id>_u.png` (+ `basic`).

**[HUECO]**: ni main ni el PR #119 cargan un PNG 16×16 pintado: ambos construyen el ícono desde letras ASCII (`PIX_MOTIFS`, o `js/ui/skill-icon-motifs.js` generado por `tools/art/skill-motifs/gen.py` en el PR). Dos salidas sin cambiar el motor: (a) Claude convierte el PNG a las 14 filas de letras (script); (b) un hook `SKILL_ICON_PNG16` (H5).

---

### 2.7 Retratos del Códice, previews y portadas de arena

| Pieza | Realidad [VERIFICADO] |
|---|---|
| **Retrato de campeón** | **No existe como asset.** El Códice dibuja el **sprite real animado** del juego en un `<canvas>` (`js/ui/codex/codex-preview.js`: `drawChampFigure`/`drawChampPack`; el comentario del archivo: "no hay sprites propios del Códice"). La miniatura es `preview.png` (112×112, 2.1.3). → el "retrato" del campeón lo da el atlas; una ilustración de Códice aparte requeriría código nuevo. |
| **Retratos de enemigos del Códice** | `assets/ui/codex/minas/*.jpg` (11 JPG, p. ej. `titan.jpg` 192×208, `esclavo.jpg` 222×198). **Ningún `.js` del juego los carga** (búsqueda en el repo: solo `tools/art/minas/*.py`, el gate y su informe). Los mide `pixel-density.js` (grupo `retratos`, todos con excepción ILUSTRACION + FORMATO_JPG). |
| **Portada de arena** | `assets/ui/codex/arenas/<id>.jpg`, **960×420, RGB, JPG** (46–170 KB). `<id>` ∈ abismo, acuatica, bosque, ciudad, divina, fortaleza, hielo, infernal, laberinto, micelial, minas. Se usa en: Códice (`js/ui/codex/codex.js:270` `codexArenaImage`), el libro (`codex-book-art.js:20`, teñido de tinta), la ficha de arena (`js/ui/arena-briefing.js:58`), el campamento (`js/systems/camp.js:204,298`) y las pantallas de historia (`js/systems/story.js:340`). Está en la lista de excepciones del gate (ILUSTRACION + FORMATO_JPG, plan "rehacer a píxel nativo"). |
| **Suelos de arena** | `assets/vfx/<arena>/tex_*.png` (2 u/px, ≤ 250 tonos, sin degradé) — gate `fondos` de `pixel-density.js`. |
| **Portadas de modos** | `docs/coliseum-cover/README.md` (gate propio `tools/art/check-coliseum-cover.js`) |

Entrega recomendada de una portada: **PNG pixel art a 960×420** (o la grilla nativa que se elija) y que Claude cambie la extensión en un único resolvedor (**[HUECO]** H6: hoy la extensión `.jpg` está fija en 5 archivos). Si se entrega JPG: calidad ≥ 90, sin degradé de compresión visible, y quedará marcada como excepción ILUSTRACION.

---

## 3. Chequeos automáticos

Todos los comandos se corren **desde la raíz del repo**. Los que necesitan el juego corriendo aceptan una URL de un servidor propio (`python3 -m http.server <puerto libre> --bind 127.0.0.1`). Resultados de abajo: ejecutados en este entorno sobre `origin/main`.

Dependencias: Node 22 + `playwright` (Chromium) y, para Python, `numpy`, `Pillow`, `scipy` y **`opencv-python`** (`cv2`; `style_gate.py` falla con `ModuleNotFoundError: cv2` si falta; se instaló con `pip install opencv-python-headless`).

### 3.1 Sprites y arte de campeón

| Chequeo | Comando exacto | Qué verifica / cómo leer el fallo | Resultado hoy |
|---|---|---|---|
| Importador de hoja de 36 poses | `python3 tools/factory/import-authored-sheet.py fuente.json salida/` ; pruebas: `python -m unittest tools/factory/test_import_authored_sheet.py` | Errores: `source hash mismatch` (cambió el PNG tras firmar el SHA-256) · `source must have a real alpha channel` · `source has no transparent background` · `source silhouette touches canvas edge; redraw clipped poses` · `expected 36 separated silhouettes, found N` (faltan poses, hay poses fusionadas o **una pose con piezas desconectadas**) · `pose N: outside its expected grid cell` · `pose N: would clip at uniform scale` · `rowBounds must partition…`. Genera `atlas.png`, `preview.png`, `import-report.json` (`IMPORTED_NOT_APPROVED`). | no se corrió (necesita una hoja fuente); sus pruebas corren en CI (`.github/workflows/authored-sheet-factory.yml`) |
| Escáner técnico | `python3 tools/art/scan_sprites.py --dir champions/<id>` (`--apply` limpia en el lugar) | **halo** (píxeles claros/grises del fondo original), **semialpha** (% de píxeles con 0<alfa<255), **fragments** (islas sueltas), **huge** (tamaño anómalo). Solo defectos técnicos; no decide estilo. | `champions/baltra`: 0/7 marcados |
| Gate de estilo | `python3 tools/art/painter/style_gate.py <atlas.png>` o `--strict` (todo el roster; **reescribe `docs/art-gate/style-gate.json`**) | Mide 4 cosas sobre los 12 cuadros de caminar: `colores` (rango 1.484,5–2.535,5), `contorno` (0,612–0,936), `sombreado` (7,64–15,53), `detalle` (0,370–0,846), cada una ±15 %. Falla si una cae fuera. | `--strict`: PASS en todo el roster instalado |
| Roster Art Gate (escala y pies) | `ROSTER_BASE_URL=http://127.0.0.1:<puerto> node tools/art/roster_gate.js` ; tras instalar un atlas nuevo: `… roster_gate.js --write` (regenera `js/data/champion-art-normalize.js`) y volver a correr sin `--write` | Altura de cuerpo **±4 %** y pies **±2 px** respecto del Caballero en frente, perfil y espalda; + auditoría de textos de presentación. Falla CI. Reescribe `docs/art-gate/roster-gate.json` y `roster-sheet.png` (revisar la hoja: líneas de cabeza y pies del Caballero). | `{"appearances":136,"scaleFailures":0,"presentationFailures":0,"errors":0}` |
| Auditoría de atlas | `SE_BASE_URL=http://127.0.0.1:<puerto> [PACKS=a,b] node tools/art/skin_audit.js <carpeta_salida>` | Izquierda y derecha mirando a **lados opuestos**, estados/vistas que no resuelven, cuadros que miran al otro lado dentro de un set, saltos de tamaño. Sale 1 si falla. Deja una hoja de contacto por pack. | `PACKS=baltra`: 0 fallas (1 WARN: cuadro 14 "parece mirar al otro lado") |
| Roster visual (humano) | `REGRESSION_BASE_URL=http://127.0.0.1:<puerto> node tools/art/roster_visual_test.js [salida.png]` | Hoja de contacto: misma escala/fondo/luz, sin VFX. Pregunta obligatoria: *¿parecen personajes distintos del MISMO juego?* (`docs/ART_BIBLE.md` §8) | requiere revisión humana |
| Fábrica (contrato) | `node tools/factory/cli.js validate <manifiesto.json>` ; `node tools/factory/cli.js gate all` | `STRUCTURAL_PASS` ≠ aprobación. Revisa `art.directions == 4`, `atlas must be PNG`, `atlas dimensions must align to frame grid`, que las animaciones declaradas no superen la capacidad del atlas, SHA-256 del atlas y conteos de `idle/walk/attack/cast/hit/death/ultimate` (`tools/factory/contracts.js:72-85`). Presupuestos: 64 partículas, 8 invocaciones, 4 voces (`:38`). | no se corrió |

### 3.2 Densidad de píxel (gate informativo)

`node tools/art/pixel-density.js [--group enemigos,jefes,retratos,fondos] [--only texto] [--all] [--json out.json] [--write] [--strict] [--self-test]`

| Hallazgo | Significa | Corrección |
|---|---|---|
| `PIXEL_GRUESO` | densidad efectiva > **2,4 u/px**: arte chico ampliado por vecino más cercano | rehacer a resolución nativa |
| `PIXEL_FINO` | < **0,45 u/px** (salvo retratos): ilustración reducida | rehacer |
| `ILUSTRACION` | `suave > 0,18` y `ruido < 80/1000`: degradé de pintura, no pixel art | rehacer; **no** esconder con filtro |
| `PALETA_EXCESIVA` (suelos) | > 250 tonos | reducir paleta |
| `FORMATO_JPG` | JPG en suelos/retratos | PNG |
| `SIN_DECODIFICAR` | el navegador no pudo leer el archivo | reexportar |

`--strict` solo falla por desvíos **sin** excepción en `docs/art-gate/pixel-density-exceptions.json`. **Un asset nuevo no entra a esa lista**: tiene que entrar dentro del canon. **No mide campeones ni FX** (C4). `--self-test`: **OK**. Corrida completa: `191 entidades analizadas; 51 con desvíos; 0 sin excepción documentada`. CI informativo: `.github/workflows/pixel-density.yml` (`continue-on-error: true`).

### 3.3 Filtro de habilidades, VFX y mecánica

| Chequeo | Comando exacto | Qué significa | Resultado hoy |
|---|---|---|---|
| Ability gate | `node tools/bible/ability-gate.js --strict` (`ONLY=a,b`; `ABILITY_BASE_URL` o `ABILITY_GATE_PORT`) ; reglas `docs/bible/ABILITY_GATE.md` | Lanza cada habilidad contra 10 muñecos + 3 aliados y mide **categorías** (ÁREA ≥4 enemigos, MÚLTIPLE ≥2, POTENCIA, CURA, CONTROL, MOVILIDAD, INVOCA). Un campeón **nuevo** debe tener: 1 ÁREA, otra distinta que dañe a varios, 1 POTENCIA o CURA; la definitiva suma ≥ 3 categorías; **efecto visual** en toda habilidad; **premarcado** si apunta (`AIM_PROFILES`/`ACTION_AIM_PROFILES`, `js/skills/aim-targeting.js:14,48`). Un canario (Caballero sin efecto) debe salir rechazado. Sin `ONLY` reescribe `docs/bible/generated/`. | `ONLY=aelith`: `PASS … nuevos que no pasan: 0 · page errors: 0`; canario rechazado |
| Motor B | `ABILITY_BASE_URL=http://127.0.0.1:<puerto>/ node tools/vfx/test-vfx-b.js` | 6 pruebas: ningún efecto consume `Math.random`; pool acotado (≤128) y se limpia al reiniciar; argumentos hostiles (NaN, 0, negativos); cada vínculo corresponde a una habilidad real; red (`kvbFx`); **alfa 0/255 y límite de tamaño de cada sprite** | `PASS vfx-b…` (98 recetas, 0 llamadas a `Math.random`, `poolMax:128`) |
| Paridad del motor A | `BASE_URL=http://127.0.0.1:<puerto>/ [ONLY=a,b] [FRAMES=360] node tools/vfx/parity-skill-fx.js` | Con la misma semilla, lanzar con y sin sprites (`SFA_OFF`) deja el **mismo estado** y el **mismo consumo de `Math.random`**. Si difiere, el arte movió la simulación (cae). | `ONLY=aelith`: `IGUAL … 14799 = 14799` |
| Mecánica del motor B | `ONLY=a,b ABILITY_BASE_URL=http://127.0.0.1:<puerto>/ node tools/vfx/verify-mechanics.js` | Huellas del estado simulado con `KVB.off` true/false deben coincidir; mide costo `update()+render()`. Sale 1 si difiere. | no se corrió |
| Costo | `BASE_URL=…/ [ONLY=a,b] [SECS=5] node tools/vfx/perf-skill-fx.js` (→ `docs/vfx/perf-skill-fx.json`) · `ONLY=a,b REPS=5 FRAMES=375 ABILITY_BASE_URL=…/ node tools/vfx/bench-cost.js` | Horda de 150 enemigos + kit en bucle, con y sin FX; son números **relativos** (Chromium sin GPU), no una certificación de teléfono. | no se corrió |
| Hoja de contacto de FX | `PORT=8952 [ARTS=nova,zone,cone,beam,burst,aura] [THEMES=a,b] [SCALE=3] node tools/vfx/sfa-sheet.js` (→ `docs/vfx/sfa-sheet.png`) | hornea cada arte de cada tema; valida que los motivos tengan filas del mismo largo | no se corrió |
| Auditoría con capturas | `ONLY=a,b PHASE=antes\|despues FRAMES=1 node tools/vfx/audit-ability-vfx.js` | cuenta qué se dibuja por habilidad y guarda capturas 844×390 | no se corrió |
| Pools | `node tools/quality/test-vfx-pools.js` | prioridades, límites y limpieza entre partidas del motor real sin canvas | no se corrió |
| Glifos | `node tools/ux/test-skill-glyphs.js` (`GLYPH_FAST=1` salta el HUD) | ver 2.6.1 | no se corrió |
| Íconos (contrato) | `node tools/art/check-skill-icons.js` | **solo PR #119**; ver 2.6.2 | no existe en main |
| Rendimiento | `node tools/audit/fps.js [arena] [cpuRate]` | CPU de celular de gama media simulada (×4 más lenta), tramo más cargado | no se corrió |

### 3.4 Visual Gate de la Art Bible (humano)

`docs/ART_BIBLE.md` §8: "BEFORE INTEGRATING ANY NEW VISUAL ASSET, RUN THE LA HORDA VISUAL GATE. IF STATUS != PASS, DO NOT MERGE THE ASSET INTO THE PRODUCTION VISUAL SET."

| Estado | Significa | Acción |
|---|---|---|
| **PASS** | coincide con la Art Bible | integrar |
| **FIX** | defecto técnico corregible sin rediseñar (halo, alfa, escala, pixel snapping, frames desalineados) | corregir con `scan_sprites.py` y revalidar |
| **REDRAW REQUIRED** | de otra dirección artística (anime, semi-realista, densidad incompatible, el diseño cambia entre frames) | no esconder con filtro: documentar en `docs/ART_REPLACEMENT_QUEUE.md` y rehacer |
| **REJECT** | defectuoso o incorrecto | no integrar; conservar el anterior |

Reglas que un revisor aplica: el diseño del personaje no cambia entre `idle/walk/attack/cast/hit/death/ultimate` (rostro, pelo, ropa, arma, colores, proporciones, escala, densidad: §5); las skins no alteran estadísticas (§Cosmetic Bible); un arte generado automáticamente nunca es PASS por sí solo; `STRUCTURAL_PASS` no sustituye la revisión humana, ni las simulaciones, ni pruebas reales de multijugador y rendimiento (`AGENTS.md` punto 7).

**[HUECO] Chequeo de FX pintados**: ningún gate mide hoy el arte de un FX (alfa, colores, que el anillo toque el borde de la celda, bucle sin costura, fases). Se propone `tools/art/check-entrega.js` (sección 8, H8).

---

## 4. Presupuestos de rendimiento

### 4.1 Topes que ya existen en el código [VERIFICADO]

| Recurso | Tope | Fuente |
|---|---|---|
| Efectos de habilidad simultáneos (motor A) | **40** (16 en modo ligero); al llenarse, expulsa el más viejo que no sea definitiva/zona | `engine.js:16,289-290` |
| Entradas del pool del motor B | **128** (64 en modo ligero); si está lleno, descarta las que no son `prio` | `pixfx.js:16,111-118` |
| Sprites sueltos (`vfxSprite`) | **40** | `vfx.js:167` |
| Partículas del VFX central | **720** (cada ráfaga se recorta con `vfxLoad`) | `vfx.js:9,26-31` |
| Ondas de choque | **28** · Telégrafos de peligro **96** | `vfx.js:145,155` |
| Ráfaga de motivos (`kvbEmit`) | ≤ **60** por llamada, multiplicada por `kvbBudget` (×0,4 con "Reducir efectos", ×0,6 con carga alta) | `pixfx.js:20-25,135` |
| Campeón nuevo (admisión) | hasta **64** partículas propias simultáneas, **8** invocaciones (preferir 1–3), sin asignaciones sin límite por tick; techos de admisión, no mediciones | `docs/production/PRODUCTION_BIBLES.md` ("VFX Bible"); `tools/factory/contracts.js:38` (`STANDARD:{particles:64, summons:8, audioVoices:4}`, `FOUNDER:{particles:96,…}`) |
| FPS | objetivo **60**, piso sostenido **30** en dispositivos de referencia; medir p95 de frame, entidades y memoria; la emulación móvil de escritorio no aprueba un iPhone real | `PRODUCTION_BIBLES.md` ("VFX Bible") |
| Carga adaptable | `vfxLoad` baja de 1 a 0,3 entre 18 y 34 ms de frame medio (y ×0,75 con > 90 enemigos); la resolución interna baja a 75 % y 60 % | `vfx.js:16-23`; `canvas.js` |
| "Reducir efectos intensos" (`JUICE.reduceFx`) / "Reducir movimiento" (`JUICE.reduceMotion`) | decoración ×0,35 (`fxBudget`); sin sacudidas ni hit-stop; **nunca** se recortan telégrafos ni la lectura del peligro | `js/rendering/juice.js:20-45` |
| Costo por FX | un `drawImage` por efecto, sin `shadowBlur`, tiras horneadas una vez y cacheadas | `engine.js:1-14` |

### 4.2 Tamaños de archivo medidos en el repo (referencia)

| Asset | Mediana | Máximo | n |
|---|---|---|---|
| `atlas.png` de campeón (base) | 285 KB | 2.093 KB (el Caballero, 1024×1536) | 36 |
| `atlas.png` de skin | 285 KB | 533 KB | 78 |
| `preview.png` | 8 KB | 12 KB | 30 |
| Cuadro de FX de skin | 12 KB | 35 KB | 87 |
| Tira de FX (`assets/vfx/skills`, `axiom`) | 264–423 KB | 470 KB (mín. 89 KB) | 9 |
| Portada de arena JPG | 85 KB | 170 KB | 11 |
| Prop de campo de batalla PNG | 196 KB | 683 KB | 32 |

La carga inicial es sensible: en 4G simulado la portada bajaba 24 MB y tardaba ~22 s (`js/assets/lazy-images.js`, comentario); por eso lo pesado de cada campeón va en el grupo diferido `ch:<id>`.

### 4.3 Presupuestos que se piden al artista **[PROPUESTA, derivada de lo medido arriba; no son un gate]**

| Asset | Tope |
|---|---|
| Atlas de campeón `448×1008` | ≤ **400 KB** PNG (los actuales rondan 250–300 KB; con WebP sin pérdida baja ~5–20 %) |
| `preview.png` | ≤ 15 KB |
| Tira de FX motor A | ≤ **150 KB** por tira; **frames**: los de la tabla de 2.2.2 (8–12); no agregar cuadros sin acordarlo |
| Decal/motivo motor B | ≤ 24 KB por decal; motivos ≤ 2 KB |
| Sprite suelto / cuadro de proyectil | ≤ 35 KB (como el máximo de skins) |
| Ícono 16×16 | ≤ 1 KB |
| Portada 960×420 | ≤ 170 KB |
| Peso de FX por campeón (todas sus habilidades) | ≤ **1,2 MB** (viaja con el grupo `ch:<id>`) |
| Partículas / entradas simultáneas por habilidad | una habilidad no debería ocupar más de **8** entradas del pool a la vez (el pool compartido es 40/128 con 4 jugadores) |
| Modo "Reducir efectos intensos" | la tira de `nova/zone/cone/beam` debe **leerse sola** (área y borde) cuando se omiten `rays/rings/column` y la alfa baja a 0,8 |

---

## 5. Reglas legales y de originalidad

**Regla de oro (`docs/ART_BIBLE.md` §14; `ARENA_ASSET_REQUIREMENTS.md`):** sin recursos de terceros, conservando diseño y hitboxes; "no se descargó ni se va a descargar arte de terceros con derechos".

1. **Todo el arte es obra original del artista.** Prohibido: calcar, "inspirarse" de forma reconocible, redibujar o recolorear personajes, siluetas, paletas, símbolos, efectos o habilidades de obras ajenas (juegos, anime, cine, cómics, otras skins comerciales).
2. **Caso Eren → Ilkan** (`docs/ILKAN_REWORK.md`, `docs/commercial/LAUNCH.md:28`, `docs/commercial/APP_STORE.md:15`): el campeón anterior (clave interna `eren`) "era un personaje derivado de una obra de terceros: nombre, identidad, silueta, paleta, arte, textos, habilidades nombradas y efectos remitían a esa obra. **No se podía vender.** Cambiar solo el nombre no resolvía el arte ni la identidad derivados": se rehízo todo lo que el jugador ve y oye y se conservaron solo las mecánicas. Lecciones para el artista: (a) el nombre no basta; (b) cuenta la **silueta**, la **paleta**, el **atuendo**, los **símbolos**, el **nombre de las habilidades** y la **forma de los efectos**; (c) cada pieza debe poder describirse con un concepto propio (Ilkan: capucha de orejas de zorro del desierto, hombrera de tres placas de arenisca, lanza-pendón, hoces gemelas; Coloso de losas de arenisca; tabla de concepto en ese documento).
3. **Personas e instituciones reales o históricas** (el roster incluye al Libertador, Musashi…): revisar caso por caso con el dueño antes de dibujar (`docs/SANMARTIN_LIBERTADOR.md`). No usar figuras con derechos de imagen vigentes.
4. **Referencias**: solo propias o con licencia que permita uso comercial y se registre. Prohibido pegar capturas de juegos o arte ajeno dentro de los archivos entregados (ni en capas ocultas).
5. **Fuentes tipográficas**: el repo trae `assets/fonts/press-start-2p-latin.woff2` y `vt323-latin.woff2` pero **no hay archivo de licencia en esa carpeta** (**[DECIDE EL DUEÑO]**: registrar la licencia). No incrustar texto en los PNG.
6. **Arte generado con IA**: el repo **no tiene una política escrita** y su historial usa hojas generadas con ChatGPT (`SPRITE_PRODUCTION_LIST.md`; `docs/ART_COMMISSION_BRIEF.md` trae prompts). Para el arte final, **el artista debe declarar cualquier paso asistido por IA** en `entrega.json` (`proveniencia`); si se admite o no es **decisión del dueño** (propiedad intelectual registrable y riesgo de derivados). Un asset "generado automáticamente" nunca es PASS por sí solo (`ART_BIBLE` §8).
7. **Registro de procedencia obligatorio** por entrega (autor, fecha, herramientas, archivos fuente `.aseprite/.psd` conservados, referencias usadas con su licencia). El inventario de derechos es requisito de lanzamiento (`docs/commercial/LAUNCH.md:52`: "Confirmación de licencias de arte, música y personajes").
8. Las skins son cosméticas: **no alteran estadísticas por colores, auras o efectos** (`AGENTS.md` punto 6; `PRODUCTION_BIBLES.md` "Cosmetic Bible"). Croma ≠ skin: croma = paleta; skin = ropa/armadura/accesorios/silueta secundaria (un aura sola no es skin).

---

## 6. Entrega: checklist y flujo

### 6.1 Dónde dejar los archivos

Convención existente: fuentes del artista en `art-source/<tema>/` y atlas ya procesados en `assets/` (`art-source/` hoy tiene `skins_sets`, `redraw`, `pack_canon`, `quality-five-original`, `battlefield`, `ynara`, …). **[PROPUESTA]** una carpeta por entrega:

```
art-source/entregas/<AAAA-MM-DD>_<lote>/
  entrega.json                       # manifiesto (abajo)
  campeones/<id>/hoja_36poses.png     # fuente 448×1008 (o 4×9 a tamaño final) + <id>.aseprite
  fx/<id>/<habilidad>_<arte>_<S>.png  # tiras (2.2)
  proyectiles/<id>/<nombre>_<NN>.png
  props/<id>/<nombre>.png
  iconos/<id>_<ranura>.png            # 16×16
  portadas/<arena>.png
  fuentes/…                          # .aseprite/.psd editables
```

Un archivo = un propósito; nombres en minúsculas, sin espacios ni acentos, `[a-z0-9_]`, sufijo de tamaño/cuadros cuando aplique (`..._80x12f.png`).

### 6.2 Manifiesto `entrega.json` **[PROPUESTA]** (lo valida `check-entrega.js`, H8)

```json
{
  "schema": 1, "lote": "2026-11-aelith", "autor": "…", "fecha": "2026-11-02",
  "proveniencia": { "original": true, "ia": false, "referencias": [], "herramientas": ["Aseprite 1.3"], "fuentesEditables": ["fuentes/aelith.aseprite"] },
  "assets": [
    { "tipo": "campeon", "id": "aelith", "archivo": "campeones/aelith/hoja_36poses.png", "celda": [112,112], "cols": 4, "filas": 9, "refH": 70 },
    { "tipo": "fx", "campeon": "aelith", "ranura": 0, "arte": "nova", "tema": "time", "celda": [80,80], "cuadros": 12,
      "fases": {"anticipacion":[0,1],"impacto":[2,6],"disipacion":[7,11]}, "loop": false, "radioDiseno": 75, "archivo": "fx/aelith/instante_roto_nova_80x12f.png" },
    { "tipo": "icono", "campeon": "aelith", "ranura": 0, "categoria": "skill", "archivo": "iconos/aelith_0.png" }
  ]
}
```

### 6.3 Checklist por asset (antes de entregar)

**Todos**: PNG RGBA; alfa solo 0/255 (verificar histograma de alfa); sin fondo/rejilla/texto/marca de agua; sin píxeles sueltos fuera de la silueta; `.aseprite`/`.psd` guardado; procedencia declarada; sin nada de terceros.

| Tipo | Checklist |
|---|---|
| **Campeón** | 448×1008 (36 poses, 112×112) · cuadros en el **orden de 2.1.2** · cada pose **una sola silueta conectada** · pies en fila 106 (muerte: borde inferior en 106) · perfil mirando a la **derecha** · altura de reposo 62–72 px · mismo diseño en todos los cuadros (rostro, pelo, ropa, arma, colores) · sin VFX pintados en el cuerpo · mismo tamaño de pose en cada fila (sin "respirar" de escala) · pasa `scan_sprites.py`, `style_gate.py`, `roster_gate.js` |
| **FX (tira)** | celda = bucket de 2.2.2 · nº de cuadros exacto del arte · anillo/borde exterior a 1,5 px del borde de la celda (o el borde exacto del área) · 3 tiempos visibles (ant./impacto/disip.) · bucle sin costura si es `zone`/`aura`/`beam` (último → primero) · sin glow pintado ni alfa suave · se lee **sola** con alfa 0,8 y sin `rays/rings/column` · el borde del área coincide con la hitbox (revisar contra `docs/vfx/` y el ability-gate) |
| **Proyectil** | 1–4 cuadros · punta a +x · centrado · sin estela ni glow pintados |
| **Prop** | base apoyada en el centro-inferior del lienzo · tamaño según 2.4 · no cambia hitbox/vida · muro: teja `16×13` repetible; torreta: base + cañón separados apuntando a la derecha |
| **Decal** | cuadrado `S×S` (múltiplo de 4), borde exterior = radio, relleno tramado ≤ 24 %, sector con vértice en el centro y eje +x |
| **Ícono** | 16×16 · glifo en `[1,14]` con contorno 1 px · 4–6 colores en roles tonales · marco de su categoría · alfa 0/255 · distinto del resto de su kit (< 85 % de píxeles iguales) · se lee a 32 px |
| **Portada** | 960×420 · sin texto · sin degradé de compresión · pixel art |

### 6.4 Flujo de trabajo

1. **Pedido** (dueño): qué campeón/habilidad/lote y prioridad. Ver `docs/vfx/HABILIDADES_VFX_MITAD_A.md` (mitad A) y `docs/vfx/vfx-audit-b.md` (mitad B), `docs/LA_HORDA_ABILITY_MATRIX.md`.
2. **Muestra primero**: un atlas, un FX, un ícono → Claude corre los chequeos de la sección 3 y devuelve el informe (qué falló, por qué, cómo corregir).
3. **Producción del lote** en `art-source/entregas/<fecha>_<lote>/` (6.1) con `entrega.json`.
4. **Dejar el commit en una rama** `art/<lote>` (o pasar la carpeta al dueño); **no** tocar `js/`: la integración la hace Claude.
5. **Integración (Claude)**: importar/convertir (importador, WebP), registrar (2.1.3 / sección 8), enlazar a las habilidades, regenerar `champion-art-normalize` (`roster_gate --write`), correr chequeos 3.1–3.3 y `ability-gate --strict`, capturas 844×390 antes/después y paridad mecánica (`parity-skill-fx`, `verify-mechanics`).
6. **Revisión humana** con el Visual Gate (3.4): PASS / FIX / REDRAW / REJECT. Solo PASS entra al set de producción.
7. **Pruebas que no se automatizan** (`AGENTS.md` punto 7): multijugador real, rendimiento en iPhone real, revisión de arte/audio.

---

## 7. Ejemplo completo de punta a punta: Aelith, «Instante roto» (habilidad 1)

Datos reales, verificados lanzando la habilidad en el motor (`castAbility(player, skills[0])` con 3 enemigos delante, servidor propio; log de `vfxSfaPlay`).

### 7.1 Qué es la habilidad

`js/champions/quality-five/aelith.js:4`: `{name:'Instante roto', action:'ael_echo', cd:6500, range:290, radius:75, duration:800, dmgMult:1}` — "daña un área y deja un eco que repite 30 % del daño tras 0,8 s". Tiene premarcado: `ACTION_AIM_PROFILES['expedition:ael_echo']` = punto, radio `min(220, radius)` (`aelith.js:63`). Vínculo de FX: `SFA_BIND.aelith[0] = sfaNovaAt('time')` y `SFA_OBJ.ael_echo = {theme:'time', end:'nova', endDur:520}` (`js/champions/skill-fx-a/c/aelith.js`).

### 7.2 Lo que el motor emite hoy al lanzarla (medido)

| Llamada `vfxSfaPlay` | Arte | Tema | r | Duración | Capa |
|---|---|---|---|---|---|
| 1 | `nova` | `time` | 75 | 700 ms | encima |
| 2 | `rays` | `time~p` | 40 | 380 ms | encima |
| 3 | `rings` | `time~p` | 75 | 700 ms (retraso 120 ms) | encima |
| objeto `ael_echo` (`r=75`, vida 800 ms) | `zone` | `time` | 75 | bucle 8 cuadros mientras vive | suelo |
| al morir el objeto | `nova` | `time` | 75 | 520 ms | encima |

Cálculo de escala: diámetro `150` → bucket **80** (`sfaBucket`, `engine.js:277`) → celda `80×80`; `D = 80·150/(80−3) = 155,8 u`; 1 px de arte = 1,95 u; a 844×390 la nova mide **≈ 93 px CSS** de lado (0,6 px/u) y cada píxel de arte ≈ 1,17 px CSS. La tira procedural resultante (`960×80`, 12 cuadros, 5 colores, 0 semitransparentes) está en `ejemplos/nova_time_80_PROCEDURAL_referencia.png`; la guía vacía en `plantillas/fx_nova_80x12f_960x80_PLANTILLA.png`.

### 7.3 Lo que el artista entrega

| # | Archivo | Medidas | Contenido |
|---|---|---|---|
| 1 | `fx/aelith/instante_roto_nova_80x12f.png` | **960×80** (12 cuadros de 80×80) | cuadros 0–1: borde punteado del área + marcas que convergen (anticipación, ≈ 117 ms); 2–6: el frente barre el área real, anillo grueso en el borde (impacto, ≈ 292 ms); 7–11: el anillo se afina y los motivos (relojes, arenas, engranajes) se deshacen hacia afuera (disipación, ≈ 292 ms). Anillo exterior a 1,5 px del borde de la celda (radio ≈ 38,5 px). Paleta `time`: `#1e1633 #5a4a8c #a58fd6 #d9c9f5 #fff8e0 #f0c070`. |
| 2 | `fx/aelith/instante_roto_zona_80x8f.png` | **640×80** (8 cuadros, bucle 760 ms) | zona viva: borde punteado girando + motivos en órbita + emblema de reloj; último cuadro empalma con el primero |
| 3 | `fx/aelith/instante_roto_rays_64x8f.png` | **512×64** (8 cuadros de 64×64) | destello radial (decorativo; se omite en "Reducir efectos") |
| 4 | `fx/aelith/instante_roto_rings_80x10f.png` | 800×80 | 3 ondas concéntricas (decorativo) |
| 5 | `iconos/aelith_0.png` | 16×16 | motivo **reloj** + marco de habilidad (hoy `"aelith:0":"clock+x"`, `skill-pixel-glyphs.js:208`), 4–6 colores en roles tonales |
| 6 | `campeones/aelith/hoja_36poses.png` | 448×1008 | solo si se rehace el sprite: pose de **lanzar** en los cuadros 24–27 (la misma para las 3 habilidades) |
| 7 | `entrega.json` | — | manifiesto de 6.2 con los 5 assets de arriba |

La tira 3 está a **otro tamaño** que la nova: `rays` se pide con `r = max(40, 0,42·r)` = 40 u → diámetro 80 → bucket **64** (`sfaDrawArt2`, `arts2.js`); por eso `rays|time~p|64`. Se enumeran las capas 3 y 4 para que ninguna quede procedural sin decisión (H1).

### 7.4 Cómo se registra (hoy y con el contrato propuesto)

* **Hoy no hay camino** para (1)–(4): el motor las hornea con `sfaBake`. Lo que sí funciona hoy sin tocar código del motor: **nada** de este conjunto. Se documenta como [HUECO] H1.
* **Con el contrato propuesto (H1)**: una entrada por tira en `js/assets/painted-fx-meta.js`:

```js
PAINTED_FX["nova|time|80"] = {src:"assets/sprites/champions/aelith/fx/instante_roto_nova_80x12f.png", w:80, h:80, n:12};
PAINTED_FX["zone|time|80"] = {src:"assets/sprites/champions/aelith/fx/instante_roto_zona_80x8f.png",  w:80, h:80, n:8};
PAINTED_FX["rays|time~p|64"]  = {src:"…/instante_roto_rays_64x8f.png",  w:64, h:64, n:8};
PAINTED_FX["rings|time~p|80"] = {src:"…/instante_roto_rings_80x10f.png", w:80, h:80, n:10};
```

  y `sfaBake` devuelve la tira pintada en lugar de hornear (forma de retorno `{cv, w, h, n}`, la misma que usa el resto del motor, `engine.js:271`).
* **Enlace con la habilidad**: no cambia: `SFA_BIND.aelith[0] → sfaNovaAt('time') → sfaP('nova','time',x,y,75) → vfxSfaPlay`. La clave `nova|time|80` sale del tema y del radio reales. **Ojo**: la clave es por (arte, tema, tamaño), no por habilidad; la definitiva de Aelith (`ult`, `time~h`) y su hab. 2 (`time~h`, otro arte) no colisionan, pero dos habilidades con el mismo arte y la misma variante **compartirían** tira hasta resolver la decisión de H1.
* **Ícono**: o se convierte a letras (`SKILL_PIXEL_MAP`/`js/ui/skill-icon-motifs.js` del PR #119) o se usa el hook H5.
* **Sprite**: si hay atlas nuevo, `python3 tools/art/painter/install.py` no aplica (no hay donante); Claude escribe la línea `champPackLoadAtlas("aelith", …)` en `js/champions/ascension/art.js:34`.

### 7.5 Cómo se prueba (comandos que existen y se corrieron)

```bash
python3 -m http.server 8793 --bind 127.0.0.1 &        # puerto libre (verificar antes con ps / ss)
ABILITY_BASE_URL=http://127.0.0.1:8793/ ONLY=aelith node tools/bible/ability-gate.js --strict   # PASS, 0 page errors
BASE_URL=http://127.0.0.1:8793/ ONLY=aelith FRAMES=120 node tools/vfx/parity-skill-fx.js        # IGUAL (14799 = 14799)
ABILITY_BASE_URL=http://127.0.0.1:8793/ node tools/vfx/test-vfx-b.js                             # PASS
ROSTER_BASE_URL=http://127.0.0.1:8793 node tools/art/roster_gate.js                              # 136 apariencias, 0 fallos
python3 tools/art/scan_sprites.py --dir champions/aelith                                         # halo / semialfa / fragmentos
python3 tools/art/painter/style_gate.py assets/sprites/champions/aelith/atlas.png                # estilo (si se rehace el atlas)
```

Criterios de aceptación visual (captura a 844×390): el borde exterior de la nova coincide con el radio de 75 u (≈ 45 px CSS de radio); se distinguen las tres fases; con "Reducir efectos intensos" la nova sigue leyéndose sin `rays/rings`; la zona de eco dura 800 ms y su cierre es la `nova` de 520 ms. Faltaría una prueba automática propia del arte (H8).

---

## 8. Lo que Claude debe construir para recibir arte

Ninguno de estos puntos está implementado; son contratos exactos para construir **sin tocar mecánica** (todo cosmético, sin `Math.random`, con paridad `parity-skill-fx`/`verify-mechanics`).

### H1 — Tiras pintadas del motor A (`skill-fx-a`)
* **Dónde**: nuevo `js/assets/painted-fx-meta.js` (datos) y un parche de `sfaBake(art, theme, size, arc)` (`engine.js:262`), que es el **único** punto por donde pasan `sfaDrawOne`, `sfaZoneDraw`, `sfaObjectsFrame` y `sfaBeamTiles`.
* **Datos**: `PAINTED_FX["<arte>|<tema>|<tamaño>"] = {src, w, h, n, [arc]}`; carga con `new Image()` + `assetsRegisterSource(src)` (queda en el grupo `ch:<id>` si la ruta es `assets/sprites/champions/<id>/fx/…`, `lazy-images.js` `CH_RE`).
* **Comportamiento**: si la tira existe **y** cargó → devolver `{cv: Image, w, h, n}` (`drawImage` acepta `Image`); si no, hornear como hoy (nunca desaparece un efecto mientras baja). `arc` solo para `cone`.
* **Decisión abierta (clave por habilidad)**: la clave por (arte, variante, tamaño) hace que dos habilidades con el mismo arte y variante compartan tira. Opciones: (a) aceptarlo; (b) añadir la ranura al tema (`time@0`) en `sfaVarOf` (`bind.js:33`), viaja por red como string. Elegir (b) si el artista pinta por habilidad.
* **Escala**: `sfaDrawOne` calcula `sc` con el bucket (`engine.js:308`); hacer que use `b.w` para que el anillo exterior coincida con el radio exacto si la celda pintada difiere del bucket. Definir si basta **un máster por arte** (escalado `nearest`) o un PNG por bucket.
* **Capas automáticas**: decidir si `rays/rings/column` se pintan o se dejan procedurales (la mezcla debe verse coherente).
* **Pruebas nuevas**: `parity-skill-fx` (mismo estado y `Math.random`), costo (`perf-skill-fx`), `test-vfx-b` análogo para alfa 0/255, tamaño y que el anillo toque el borde.

### H2 — Decales y motivos pintados del motor B (`vfx-b`)
Parchear `kvbDecalFrames(name,S)` (`pixfx.js:87`), `kvbMotif(name)` (`:95`) y `kvbBeamFrames(name)` (`:103`) para devolver `Image`/canvas por cuadro cortados de una tira `PAINTED_KVB[name] = {src, w, n}`; fallback procedural. Un máster por decal (no por `S`): `kvbDecal` ya escala `w:2R, h:2R` (`pixfx.js:120`).

### H3 — Registro declarativo de sprites sueltos y proyectiles
Un `js/assets/painted-sprites-meta.js` (como `skin-fx-meta.js`) que cree `VFX_SPR_EXTRA[clave] = {ground, imgs, ready}` por archivo y permita `PROJECTILE_SPRITE[campeón:acción] = {clave, sprH}` para que el kit ponga `p.sprite`/`p.sprH` sin editar cada archivo de kit (`entities.js:535`).

### H4 — Props pintados de habilidad (muro, torreta, trampa)
Aprovechar `SFA_OBJ[kind].draw(o, r)` (`bind.js:80`) y `kvbSkin(...).draw` (`hooks.js:22`): un helper `paintedProp(kind, {src, w, h, anchor})` que dibuje el PNG en lugar de `sfaDrawWallObj/sfaDrawTurretObj`, **manteniendo** subida de 220–300 ms, escombros al caer y la rotación de la torreta hacia el objetivo (base + cañón separados). Para decorado estático usar el camino de `battlefieldProp` (2.4.2).

### H5 — Ícono PNG de 16×16
Tras el merge del PR #119: en `skillPixelGlyphUri` (y `pxiIcon*`) priorizar `SKILL_ICON_PNG16["<campeón>:<ranura>"]`, validado con `pxiIconAudit` y mostrado a 2×. O, sin hook: script `PNG 14×14 → filas de letras` que escriba `js/ui/skill-icon-motifs.js`. Extender `check-skill-icons.js` para exigir que el PNG cumpla el contrato.

### H6 — Resolvedor único de portada y retratos
`codexArenaImage(a)` ya existe (`codex.js:270`) pero otros 4 sitios arman la ruta `.jpg` a mano (`codex-book-art.js:20`, `arena-briefing.js:58`, `camp.js:204,298`, `story.js:340`). Unificar en un resolvedor que pruebe `.png` y caiga a `.jpg`; decidir si el "retrato" de campeón se sigue dibujando con el atlas en vivo (hoy sí) o se agrega una ilustración.

### H7 — Importador de hoja de autor humano
Extender `tools/factory/import-authored-sheet.py` para: (a) **registrar** (emitir la línea `champPackLoadAtlas` con los `sets` estándar de `build-art.py:57-59`, `refH` = alto del cuadro 0 y `fix.left:"mirror"`); (b) aceptar más filas (idle de varios cuadros, ataques con más cuadros) mediante `sets` en el manifiesto; (c) fallar con un mensaje que indique **qué pose** está desconectada.

### H8 — Verificador de entrega `tools/art/check-entrega.js` (o `.py`)
Lee `entrega.json` y valida **sin abrir el juego**: tipo de archivo, dimensiones exactas según 2.1/2.2/2.6, `n` cuadros por tira, alfa solo 0/255, recuento de colores (campeón: rango del roster; FX: ≤ 6 + contorno; ícono: ≤ 6), silueta conectada por pose, línea de pies, margen del anillo exterior (≈ 1,5 px), costura del bucle (cuadro 0 vs último), peso ≤ presupuesto (4.3), procedencia presente. Salida: `PASS/FIX/REJECT` por archivo con la causa.

### H9 — Empaquetado de carga
Añadir las rutas nuevas a `js/assets/asset-manifest.js` (para `tools/art/webp_convert.py`) o llamar `ASSET_WEBP.add(src)` + `assetsRegisterSource(src)` como hace `battlefield-art.js:5`; confirmar que el grupo `ch:<id>` carga con el campeón y que `whenAssetsReady` espera a las tiras antes de empezar la partida.

---

## 9. Apéndice

### 9.1 Mapa rápido de rutas verificadas

| Qué | Dónde |
|---|---|
| Biblia de arte y Visual Gate | `docs/ART_BIBLE.md` (§2 Caballero, §6 técnica, §7 VFX, §8 gate, §13 roster gate, §14 píxel nativo) |
| Estándares de producción | `docs/production/PRODUCTION_BIBLES.md` (Champion/Enemy/Ability/VFX/Audio/UI/HUD/Cosmetic/Set) |
| Carga y dibujo de campeones | `js/assets/champion-sprites.js` (carga y normalización), `js/rendering/champion-sprites.js` (dibujo), `js/rendering/anim-atlas.js` |
| Motores de FX | `js/champions/skill-fx-a/` (engine, bind, templates, themes, motifs, props, arts2, `c/<clave>.js`), `js/champions/vfx-b/` (pixfx, templates, hooks, `<clave>.js`) |
| Sprites sueltos / proyectiles | `js/rendering/vfx.js`, `js/rendering/entities.js`, `js/systems/skin-fx.js`, `js/assets/vfx-sprites.js`, `js/assets/skin-fx-meta.js` |
| Íconos | `js/ui/skill-pixel-glyphs.js`, `js/ui/skill-glyphs.js`, `js/ui/pixel-icons.js`, `js/assets/ui-icons.js`, `js/ui/hud.js` |
| Herramientas de arte | `tools/art/` (`pixel-density.js`, `roster_gate.js`, `scan_sprites.py`, `skin_audit.js`, `painter/`, `pixrig/`, `redraw/`, `skins_sets/fx.py`), `tools/factory/` (`import-authored-sheet.py`, `cli.js`, `contracts.js`), `tools/vfx/*` |
| Estado del gate | `docs/art-gate/` (`PIXEL_DENSITY.md`, `pixel-density-exceptions.json`, `style-gate.json`, `roster-gate.json`) |
| PR abiertos relacionados | #119 (contrato de íconos), #120 (decales legibles), #78 (borrador "five champions art workshop") |

### 9.2 Cosas que **no** se pudieron verificar

* No se corrió `tools/vfx/verify-mechanics.js`, `perf-skill-fx.js`, `bench-cost.js`, `tools/audit/fps.js` ni `node tools/factory/cli.js gate all` (largos o dependientes de evidencias del candidato).
* No se probó rendimiento en dispositivo real ni multijugador real.
* Los presupuestos de 4.3 son propuestas derivadas de tamaños medidos, no un gate existente.
* El contrato de íconos (2.6.2) se verificó **leyendo la rama** `origin/claude/iconos-contrato`; no está en main.
* No se leyó el contenido de `docs/vfx/vfx-audit-b.md` en detalle (se cita solo la cifra de 84 habilidades de la mitad B de `docs/vfx/HABILIDADES_VFX_MITAD_A.md`).
* Licencias de las fuentes `Press Start 2P` y `VT323` no están registradas en el repo.
