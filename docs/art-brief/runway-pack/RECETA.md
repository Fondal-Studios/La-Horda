# Receta de producción con Runway (el método que usa el repo)

Todo lo de esta receta sale de lo que ya se hizo y de las herramientas que existen en el repo (`tools/art-world/`, `tools/art/`, `tools/factory/`). Donde algo no está verificado se dice.

## 1. Principios

1. **Runway no pinta hojas.** `gen4_image` devuelve UNA ilustración 1024×1024 por llamada. Un cuadro-clave por imagen; el atlas se arma después, cuadro a cuadro, con las herramientas del repo.
2. **Siempre con referencias.** `@codex` = la lámina del Códice del personaje (fuente de verdad del diseño). `@pose` = el cuadro actual del atlas en la pose pedida (así la pose, el encuadre y la orientación salen bien). Sin referencias el diseño se desvía.
3. **Un cuadro, un intento, un criterio.** Se genera, se evalúa contra la lista de §5 y recién ahí se reduce. Lo que no pasa no se «arregla a mano»: se vuelve a pedir (o se descarta).
4. **El píxel lo manda el repo, no Runway.** Escala nativa (≈ 1 u/px), alfa 0/255, contorno de 1 px, 4–6 colores base: `docs/art-brief/00_ESPECIFICACION_TECNICA.md` y `docs/ART_BIBLE.md`. La imagen de Runway se reduce y se cuantiza; nunca se publica tal cual (salvo ilustraciones: retratos, portadas, libro).
5. **Todo gasto se registra** en `docs/beta-release/ART_CREDITS.md` (fecha, saldo, task id, qué se aceptó y qué no).

## 2. Antes de gastar

```bash
node tools/art-world/runway-world.js status     # {"creditBalance": N}
```
- Regla del repo: no empezar una tanda con saldo < 250; tope de 60 créditos por ejecución salvo que el dueño diga otra cosa (el dueño autorizó gastar hasta agotar el saldo el 2026-11-11, pero hoy el saldo es 2).
- Costo medido: **8 créditos por imagen** (`gen4_image`, 1024:1024, con 1 referencia). Un `BAD_OUTPUT` también se cobra: tras dos fallos seguidos en la misma pose, parar y cambiar el planteo en vez de reintentar.

## 3. Preparar las referencias

**`@codex`** — `assets/ui/codex/champions/<id>.png` (campeones). Para enemigos y jefes no hay lámina: usar el cuadro actual de su atlas como diseño, o la portada de su arena (`art-source/codex-covers/`).

**`@pose`** — recorte del cuadro N del atlas actual (la celda NO siempre es 112×112: hay atlas de 192×128 y otros; el script lee la medida de `champPackLoadAtlas`):

```bash
python3 tools/art/pose-ref.py <campeon> 12 16 24        # -> art-source/runway-pose-refs/<campeon>/f12.png ...
python3 tools/art/pose-ref.py <campeon> --all           # todos los cuadros
```
Si el campeón no tiene atlas registrado, el script avisa: usar un **donante** de la misma complexión (`tools/art/painter/donors.json`) o la plantilla `docs/art-brief/plantillas/champion_atlas_448x1008_PLANTILLA.png` (§7).

## 4. Generar

Campeón (un cuadro por llamada; el prompt, listo, está en `campeones/<id>.md`):

```bash
node tools/art-world/runway-guardian.js <id> f12_a1 "<prompt del paquete>" assets/ui/codex/champions/<id>.png art-source/runway-pose-refs/<id>/f12.png
# -> art-source/runway-guardians/<id>/f12_a1/master.png + receipt.json (GENERATED_NOT_APPROVED)
```
Tope por ejecución: `GUARDIAN_RUNWAY_BUDGET` (24 por omisión = 3 imágenes). No regenera lo que ya existe (usar `FORCE=1`).

Mundo (props, texturas, fachadas): `node tools/art-world/runway-world.js gen <id>`. Los trabajos están en el objeto `JOBS` de ese archivo: para un asset nuevo se **agrega una entrada** con el prompt del paquete (`bloques/03-mundo.md`) y la referencia del Códice (`@ref`). Tope: `WORLD_RUNWAY_BUDGET` (40 por omisión).

Enemigos: 3 imágenes clave por criatura (reposo, caminar de perfil, ataque de perfil). Los demás cuadros (caminar de frente/espaldas, golpe, muerte) los deriva el pintor determinista (`tools/art/painter/enemy_paint.py` y los `tools/art-world/build-*.py`), que reutiliza el cuerpo aceptado: así no se paga cada cuadro.

**Anatomía de un buen prompt** (los del paquete ya la siguen): (a) qué es y de qué referencia sale (`@codex`); (b) la pose exacta (`@pose` + su descripción); (c) «keep the @codex design and palette exactly»; (d) orientación explícita (perfil a la derecha / de frente / **de espaldas**); (e) estilo: pixel art nítido, contorno de 1 px, sombreado plano, 4–6 colores, una sola silueta conectada; (f) lo que NO debe haber: texto, marco, efectos pegados al cuerpo, degradé, brillo; (g) fondo oscuro liso (o verde croma para recortar).

## 5. Criterio de aceptación (cada imagen, antes de reducir)

Rechazar si falla CUALQUIERA:
1. **Diseño**: ropa, pelo, colores y proporciones iguales a la lámina. No «parecido»: igual.
2. **Pose**: es la pedida (la del `@pose` con el movimiento de `POSES_CAMPEON.md`), no otra.
3. **Orientación**: la pedida. Error típico registrado: pedir espaldas y recibir frente (Profeta `pf_up`, descartada).
4. **Vista**: cenital 3/4 como el juego. Error registrado: vista isométrica (`casa_b`, rechazada).
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
