# Receta de producción con Runway (el método que usa el repo)

Todo lo de esta receta sale de lo que ya se hizo y de las herramientas que existen en el repo (`tools/art-world/`, `tools/art/`, `tools/factory/`). Donde algo no está verificado se dice.

## 1. Principios

1. **Qué modelo usar (corregido 2026-11-12).** La cuenta de Runway tiene ~84 modelos (`curl /v1/organization`: `tier.models` y el uso diario de cada uno en `usage.models`). **`gen4_image` NO sirve para poses de campeón** (ignora la pose pedida; medido con el Tanque) y su tope diario (200) se agota fácil; los videos `gen4_turbo` conservan el diseño pero dan movimiento rígido. **`gpt_image_2` (modelo de imagen de la cuenta; nombre en Runway) SÍ respetó poses y diseño** en 5 campeones (Ynara, Tanque, Cazadora, Musashi, Ilkan; 8 hojas, 7 aceptadas y 1 rechazada por escala): pedido como HOJA de 4 poses sobre verde croma, con la lámina limpia (`codex-clean.py`) como referencia, salió bien para Ynara (lanzar y definitiva, 20 créditos por hoja; instalada, con aprobación de arte humana pendiente). Receta: `node tools/art-world/runway-design.js <id> <intento> "<prompt de hoja de 4 poses sobre croma #00FF00>" art-source/runway-codex-clean/<id>.png --ratio 1920:1088 --model gpt_image_2` → `python3 tools/art/sheet-to-cells.py` (croma→celdas del atlas a la escala del campeón) → atlas candidato → capturas del motor antes/después → gates → instalar solo si es claramente mejor. Otros modelos de imagen disponibles sin probar: `gemini_image3_pro`, `nano_banana_2.1`, `seedream5_pro`. Un ratio inválido da un error de validación SIN cobrar (sirve para listar los ratios de cada modelo).
2. **Siempre con referencias.** `@codex` = la lámina del Códice del personaje (fuente de verdad del diseño). `@pose` = el cuadro actual del atlas en la pose pedida (así la pose, el encuadre y la orientación salen bien). Sin referencias el diseño se desvía.
3. **Un cuadro, un intento, un criterio.** Se genera, se evalúa contra la lista de §5 y recién ahí se reduce. Lo que no pasa no se «arregla a mano»: se vuelve a pedir (o se descarta).
4. **El píxel lo manda el repo, no Runway.** Escala nativa (≈ 1 u/px), alfa 0/255, contorno de 1 px, 4–6 colores base: `docs/art-brief/00_ESPECIFICACION_TECNICA.md` y `docs/ART_BIBLE.md`. La imagen de Runway se reduce y se cuantiza; nunca se publica tal cual (salvo ilustraciones: retratos, portadas, libro).
5. **Todo gasto se registra** en `docs/beta-release/ART_CREDITS.md` (fecha, saldo, task id, qué se aceptó y qué no).

## 2. Antes de gastar

```bash
node tools/art-world/runway-world.js status     # {"creditBalance": N}
```
- **Sin tope de créditos** (decisión del dueño, 2026-11-12): se gasta hasta agotar el saldo; el saldo cambia (al 2026-11-12 era 0–2): sin recarga no se puede generar nada. Los scripts de campeón y mundo traen un tope por omisión (`GUARDIAN_RUNWAY_BUDGET` 24, `WORLD_RUNWAY_BUDGET` 40) que es un seguro contra errores: para una tanda grande se sube con la variable de entorno (p. ej. `GUARDIAN_RUNWAY_BUDGET=100000`), a propósito. `runway-design.js` y `gen_sheet.py` no tienen tope propio.
- Costo medido: **8 créditos por imagen** (`gen4_image`, 1024:1024, con 1 a 2 referencias; campeón, mundo y diseño) y **5 por hoja de enemigo 1280:720**. Los `BAD_OUTPUT`: la API informa `cost.credits` = 0, pero en la tanda del Tanque el saldo bajó igual tras los fallos; como la cuenta es compartida no se pudo atribuir con certeza. Contrastar `status` antes y después y **no contar con que un fallo sea gratis**: tras dos fallos seguidos en la misma pose, parar y cambiar el planteo en vez de reintentar.

## 3. Preparar las referencias

**`@codex`** — para campeones, NO la lámina completa sino su recorte limpio: `python3 tools/art/codex-clean.py <id>` → `art-source/runway-codex-clean/<id>.png` (solo las vistas frente/lado/espalda). Motivo, probado con tanque (2026-11-12): con la lámina completa Runway copió el título («ALDRIC…») dentro de la imagen (rechazada por §5.6) y la lámina entera supera la proporción máxima 2,355 que acepta la API. Láminas de otro tamaño que 1774×887: la herramienta avisa y no recorta. En la de farolero queda un rótulo chico abajo: revisar el resultado.
- La lámina original sigue en `assets/ui/codex/champions/<id>.png`. Para enemigos y jefes no hay lámina: se usa el cuadro quieto de su atlas (`pose-ref.py <id> 0`) o, si no tiene atlas, el diseño creado con `runway-design.js` (Paso 0 de su ficha).

**`@pose`** — recorte del cuadro N del atlas actual (la celda NO siempre es 112×112: hay atlas de 192×128, 103×98, 52×52…; el script lee la medida del registro del atlas en el juego). **gen4_image trabaja a 1024×1024: una referencia de 52–112 px llega borrosa**, por eso el script guarda también `fNN_1024.png` (ampliado con vecino más cercano en múltiplo entero, centrado sobre lienzo oscuro) y es ESA la que se pasa como `@pose`:

```bash
python3 tools/art/pose-ref.py <campeon> 12 16 24        # -> art-source/runway-pose-refs/<campeon>/f12.png ...
python3 tools/art/pose-ref.py <campeon> --all           # todas las celdas de la rejilla
python3 tools/art/pose-ref.py <enemigo> 3 --cell 52x52  # enemigo cuya celda no está en un *-meta.js: la medís vos
```
**Ojo con el atlas de partida:** si el cuadro actual tiene el defecto que se quiere arreglar (los atlas marcados `siluetas_partidas` o `cuadros_repetidos` en la cola), usarlo como `@pose` hereda el defecto: en ese caso usar de `@pose` un cuadro vecino sano o el donante, y dejar que el prompt (`beat`) defina la pose. Con DOS referencias (`@codex` + `@pose`) el costo medido por imagen sigue siendo 8 créditos solo para 1 referencia en las pruebas de mundo; **no está medido con 2**: revisar `receipt.json` en la primera generación.
Si el campeón (o enemigo) no tiene atlas registrado, el script avisa: usar un **donante** de la misma complexión (`tools/art/painter/donors.json`) o la plantilla `docs/art-brief/plantillas/champion_atlas_448x1008_PLANTILLA.png` (§7).

## 4. Generar

Campeón (un cuadro por llamada; el prompt, listo, está en `campeones/<id>.md`):

```bash
node tools/art-world/runway-guardian.js <id> f12_a1 "<prompt del paquete>" assets/ui/codex/champions/<id>.png art-source/runway-pose-refs/<id>/f12.png
# -> art-source/runway-guardians/<id>/f12_a1/master.png + receipt.json (GENERATED_NOT_APPROVED)
```
Tope por ejecución: `GUARDIAN_RUNWAY_BUDGET` (24 por omisión = 3 imágenes). No regenera lo que ya existe (usar `FORCE=1`).

Mundo (props, texturas, fachadas): `node tools/art-world/runway-world.js gen <id>`. Los trabajos están en el objeto `JOBS` de ese archivo: para un asset nuevo se **agrega una entrada** con el prompt del paquete (`bloques/03-mundo.md`) y la referencia del Códice (`@ref`). Tope: `WORLD_RUNWAY_BUDGET` (40 por omisión).

Enemigos: hoja completa por criatura con `gen_sheet.py` → `install.py` → `walk_batch.py` (cadena exacta por criatura en `enemigos/<arena>.md`; explicación en `ENEMIGOS_GUIA.md` §3).

Diseño o lámina que falta (campeón sin lámina del Códice, criatura sin atlas): `node tools/art-world/runway-design.js <id> <intento> "<prompt>" [estilo.png] [--dry-run]` → `art-source/runway-designs/<id>/<intento>/master.png` + `receipt.json`. Los prompts salen en cada ficha (`campeones/<id>.md` Paso 0, `enemigos/<arena>.md` Paso 0).

**Anatomía de un buen prompt** (los del paquete ya la siguen): (a) qué es y de qué referencia sale (`@codex`); (b) la pose exacta (`@pose` + su descripción); (c) «keep the @codex design and palette exactly»; (d) orientación explícita (perfil a la derecha / de frente / **de espaldas**); (e) estilo: pixel art nítido, contorno de 1 px, sombreado plano, 4–6 colores, una sola silueta conectada; (f) lo que NO debe haber: texto, marco, efectos pegados al cuerpo, degradé, brillo; (g) fondo oscuro liso (o verde croma para recortar).

## 5. Criterio de aceptación (cada imagen, antes de reducir)

Rechazar si falla CUALQUIERA:
1. **Diseño**: ropa, pelo, colores y proporciones iguales a la lámina. No «parecido»: igual.
2. **Pose**: es la pedida (la del `@pose` con el movimiento de `POSES_CAMPEON.md`), no otra.
3. **Orientación**: la pedida. Error típico registrado: pedir espaldas y recibir frente (Profeta `pf_up`, descartada).
4. **Vista**: cenital 3/4 como el juego. Error registrado: vista isométrica (`casa_b`, rechazada).
   *(Sobre un evaluador automático: el encabezado de `tools/art-world/runway-guardian.js` cita `guardian-eval.py`, que NO existe en el repo. Hoy el criterio es este, a ojo, más los gates de §6.)*
5. **Silueta**: una sola pieza conectada; nada flotando (espada separada, chispas, sombra proyectada).
6. **Limpieza**: sin texto, marco, rejilla, halo, degradé ni efectos dentro del cuerpo.
7. **Anatomía**: manos, pies y arma completos y coherentes (extremidades de más o de menos = rechazo).
8. **Encuadre**: cuerpo entero con margen; pies abajo; no recortado.

Después de reducir a escala nativa (alto de reposo 62–72 px en campeones), ver el cuadro **a tamaño real de juego** (no ampliado): si no se lee, se rechaza aunque la imagen grande sea linda.

## 6. Reducir, armar e integrar (determinista)

| Paso | Herramienta |
|---|---|
| Reducir a escala nativa, alfa 0/255, 4–6 colores base, contorno de 1 px | `tools/art/painter/` (`forge.py`, `painter.py`, `retouch/`); para campeones con donante: `tools/art/painter/install.py <id>` (exige pasar `style_gate.py`) |
| Armar el atlas (campeón: 4 col × 9 filas de 112 px; enemigo: 8 columnas) | `tools/factory/import-authored-sheet.py fuente.json salida/` (rechaza grilla mal armada, silueta pegada al borde, poses fusionadas); `tools/expedition/build-art.py` |
| Chequeos de arte | `python3 tools/art/scan_sprites.py --dir champions/<id>` (halo, semialfa, fragmentos) · `python3 tools/art/painter/style_gate.py <atlas.png>` · `node tools/art/roster_gate.js` (altura y pies) · `node tools/art/pixel-density.js` (densidad) · `node tools/art/enemy_coverage.js` (estados de enemigos) |
| Registro en el juego | `champPackLoadAtlas(...)` (campeones: `js/champions/expedition/art-data.json` + `node tools/expedition/register-art.js`, o `js/champions/ascension/art.js` por `install.py`) |
| WebP y atlas del paquete | `python3 tools/art/webp_convert.py` y `node tools/art/build-art-atlas.js` (hay un gate de que estén sincronizados con los PNG) |
| Pruebas del juego | las del workflow `Champion entry balance` y `QA regresion central` del repo; para un campeón NUEVO: `AGENTS.md` pasos 1–7 |

**Nada de esto aprueba el arte**: `GENERATED_NOT_APPROVED` pasa a aprobado solo con revisión visual a escala de juego y la revisión independiente del repo (`reviews/`).

## 7. Campeón o criatura sin atlas

1. Elegir un **donante** con la misma complexión y atlas completo (`tools/art/painter/donors.json`) para heredar poses y escala.
2. Generar los cuadros con `@codex` = lámina del personaje y `@pose` = cuadro del donante.
3. Armar con `import-authored-sheet.py`; registrar; correr `roster_gate.js` para normalizar la escala.
4. Es un campeón nuevo del juego solo si además se registra su clase (`AGENTS.md`); el arte por sí solo no lo agrega.

## 8. Registro y entrega

- Por cada imagen: línea en `docs/beta-release/ART_CREDITS.md` con fecha, saldo antes→después, task id (está en `receipt.json`) y **aceptada / rechazada + por qué**.
- Los recibos y masters quedan en `art-source/runway-*/` (referencia, no se publica).
- Un bloque completo por entrega; cerrar una pose no cierra el bloque (`docs/production/ASSET_BLOCKS.md`).
- Rama de trabajo y PR: solo si el dueño lo pide; no se mergea sin revisión independiente (`reviews/POLITICA.json`).

## 9. Lo que NO usa Runway

FX de habilidad (tiras horneadas por `js/champions/skill-fx-a/` y `vfx-b`), íconos de habilidad 16×16, proyectiles chicos y auras: son código o pintor determinista. Pedirlos a Runway gasta créditos y no entra al juego sin reconstruirlos igual. Si hace falta una referencia de motivo, una sola imagen basta; el efecto lo arma el motor.
