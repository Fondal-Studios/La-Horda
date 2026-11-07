# Auditoría de coherencia pixel art — `main` @ 5251382e (2026-11-07)

**Referencia canónica: Thalen (`mago`, `codex-v1`).** Átlas 448×1008, celdas 112×112, 36 cuadros, **alfa binario (0/255)**, contorno de 1 px, ~1 u/px, figura de ~109 px de alto, sombreado de píxel nítido. Todo lo demás se mide contra eso.

## Qué se corrió (y qué no)
* **Simulación en el motor real** (Chromium): los 46 guardianes dibujados con `drawChampFigure` en una lámina (`audit-20261107/champions-46-motor.png`); por cada uno se midió el % de píxeles semitransparentes y el tamaño de la figura.
* **Escaneo estático** de 1.113 PNG de `assets/sprites` (alfa semitransparente, colores, suavidad de degradé, bloque nativo de píxel).
* **Informe propio del repo** `docs/art-gate/PIXEL_DENSITY.md` (13 entidades con desvío, última generación 2026-11-06) y `docs/art-gate/RUNWAY_ENEMIES.md`.
* **Contrastado a ojo** contra Thalen en láminas lado a lado (`audit-20261107/*.png`).
* **No corrido:** `tools/art/pixel-density.js` falla en este entorno (`Execution context was destroyed`), por eso se usó su informe ya generado, no una corrida nueva. No se jugaron partidas completas por arena/jefe ni se probó en dispositivo. Los umbrales de mi escaneo son míos, no del gate.

## Resultado general
Los 46 guardianes en el motor se leen coherentes con Thalen, con una excepción (punto 3). La incoherencia vive en **enemigos, jefes y la arena Micelial**.

## Los 5 puntos críticos a modificar
| # | Qué | Evidencia | Por qué rompe la coherencia |
|---|---|---|---|
| **1** | **27 enemigos generados con Runway** (`js/assets/enemy-runway-sheets.js`: golem_hielo, hada_escarcha, zombie, esqueleto, demonio_menor, demonio_mago, ent, medusa, esfinge, tiburones, cm_acechante, cm_perro, cm_campanero, mn_devoraluz…) | Estado oficial `GENERATED_NOT_APPROVED` (sin revisión de arte). Paleta de 28–32 colores (v2 de demonio_menor: 27; demonio_mago: 31) frente a ~1.200 de Thalen. Se dibujan con `hMul` 2,0–3,25 (peores: mn_devoraluz 3,25, hada_escarcha 2,9, esfinge 2,8). El gate marca ciudad/minas con 2,59–2,95 u/px | Píxel 2–3 veces más grueso y plano que el canon: cada píxel de la hoja equivale a 2–3 unidades de mundo. Mezcla de densidades en la misma pantalla que un guardián de 1 u/px |
| **2** | **Jefes y bestias de campo de batalla ampliados** (Leviatán, Minotauro v3, dragón de forja; y las hojas `battlefield/*.png` de 1792×384) | Leviatán 3,54 u/px y 46 tonos; Minotauro v3 2,70; dragón de forja 2,66. El escaneo propio detecta bloque nativo ×2 en 31 de 32 PNG de `battlefield/` | Arte chico ampliado por vecino más cercano: los jefes, que deberían ser lo más detallado, tienen el píxel más grande de todo el juego |
| **3** | **Guardián `facu_gm` (Ascensión): manto y halo vectoriales** (`js/champions/ascension/render.js`, `ascFacuMantle`) | En motor: 34 % de píxeles semitransparentes (el resto de los 46 guardianes: ≤ 0,5 % salvo el alfa heredado, punto abajo), figura de 125×126 px frente a 109×87 de Thalen. Su átlas base sí es binario (112×112); lo que rompe es el dibujo procedural: triángulo relleno translúcido, círculo y líneas finas suavizadas, y el cuerpo se ve con píxel más grande | Es la única figura "vectorial" sobre un sprite pixelado: bordes antialias y trazos de 1 px que no existen en el arte |
| **4** | **Arena Micelial completa** (`assets/sprites/arenas/micelial/*`, 98 imágenes) | 96 de 98 con >2 % de alfa semitransparente; los átlas de sabueso y acechador tienen alfa continuo (241, 239, 237…) en el 100 % de sus píxeles; 17 con degradé suave >30 %. A ojo: sin contorno, pintado/borroso, tamaño chico (`micelial-vs-thalen.png`) | Es ilustración reducida, no pixel art. **Pertenece al trabajo del PR #260 (Madre Espora); no se tocó**: hay que pasarle este hallazgo a esa rama |
| **5** | **Ilustración reducida heredada**: Dama del Bosque (`enemies/bosque/dama_bosque/static.png`, 11 tonos, bloques enormes), Golem y Demonio mayor infernal (`bosses/infernal/demonio_mayor`: 141 tonos, suavidad 0,184), demonio_mago/demonio_menor (átlas raíz) | Informe del gate: tipo `ILUSTRACION`, "degradé suave con pocos píxeles nítidos". `dama_bosque/static.png` se sigue cargando en `enemy-sprites.js:92` (el motor además carga su v2; no verifiqué si `static.png` llega a dibujarse) | Blanco/negro de mosaico borroso frente al contorno nítido de Thalen; ya hay excepciones documentadas, pero ninguna se resolvió |

## Secundarios (medidos, no críticos hoy)
* **Alfa heredado no binario** en los átlas viejos de `tanque`, `guerrero`, `mago` (viejo), `profeta`, `soporte` y sus cromas (≈100 % de píxeles con alfa 252/253 y un halo de alfa 1–7). Visualmente están bien, pero incumplen la regla de alfa binario que sí cumple Thalen. Arreglo mecánico (cuantizar alfa), sin repintar.
* **Props de `battlefield/` (arco, columna, helecho, roble, pino, rocas, torres)** se ven mucho más finos que Thalen (`battlefield-props.png`). Es observación visual; el gate no los mide, así que queda como hipótesis.
* Los FX con alfa suave (glow, humo) son normales y no se cuentan como defecto.

## Orden sugerido
1 y 2 son sistémicos y los más visibles; 3 es de una sola función; 4 se coordina con #260; 5 ya tiene plan en las excepciones del gate.
