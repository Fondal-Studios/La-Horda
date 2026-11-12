# Cómo se hace una hoja de enemigo, subjefe o jefe

Fuente: manifiesto `docs/art-brief/manifiestos/mundo_faltantes.json` (filas `C-ENEMY-*`) y los atlas actuales (`js/assets/*-meta.js`). Los prompts por criatura están en `enemigos/<arena>.md`.

## 1. Formato de la hoja

- **Hoja COMPLETA**, no cuadros sueltos: celdas iguales, **8 columnas**, PNG RGBA, alfa 0/255, contorno de 1 px, flat shading.
- **Pies en la fila `anchor × alto de celda`** (el atlas de cada criatura trae su `anchor`, típicamente ≈ 0,95).
- **Perfil mirando a la DERECHA** (la izquierda la espeja el juego).
- Escala canon ≈ **1,0 unidad de mundo por píxel** (banda 0,45–2,4). El tamaño en pantalla sale del radio y la escala del enemigo (ver su ficha en `enemigos/<arena>.md`).
- La celda de cada criatura es la de su atlas actual (p. ej. 52×52, 61×41): se conserva al rehacer.

## 2. Los 9 estados que el motor usa

| Estado | Cuadros | Movimiento |
|---|---|---|
| `idle` | 1 (el motor lo repite) | de pie, en guardia; la silueta tiene que distinguirse de `walk` |
| `walk_side` | 4–6 | ciclo de caminata de perfil: contacto / paso alto / contacto / paso alto |
| `walk_down` | 4–6 | ciclo de frente |
| `walk_up` | 4–6 | ciclo de espaldas |
| `atk_side` | 3–4 | anticipación → golpe (con el ataque propio de la criatura) → seguimiento → recuperación |
| `atk_down` | 3–4 | ídem de frente |
| `atk_up` | 3–4 | ídem de espaldas |
| `hit` | 2 | golpe recibido (perfil y frente): se echa hacia atrás |
| `death` | 4–6 | sacudida → caída → queda tendido (o se deshace/disuelve según la criatura) |

`node tools/art/enemy_coverage.js <salida>` mide, para las 104 criaturas, cuáles de esos estados tienen arte real, cuáles el motor los rellena clonando o espejando, y cuáles se dibujan por código. El manifiesto marca cuántos de los 11 estados «rellena el motor en vez de dibujar»: esos son los que faltan pintar.

## 3. Cómo se hace (el método que ya usa el repo)

Es el flujo de `docs/art-gate/RUNWAY_ENEMIES.md`, no uno inventado: **hoja completa por criatura**, no cuadros sueltos.

0. **Si la criatura no tiene atlas propio, el atlas se crea:** `node tools/art-world/runway-design.js <id> d1 "<prompt de su ficha>" assets/sprites/enemies/hielo/golem_cristal/atlas.png` genera su imagen de diseño (reposo, perfil derecha) con el estilo de una hoja ya aprobada. Se aprueba (`RECETA.md` §5); ese PNG es el diseño de partida de los pasos siguientes. (Si ya tiene atlas: `python3 tools/art/pose-ref.py <id> 0` recorta su cuadro quieto.)
1. **Hoja de combate:** `python3 tools/art/runway/gen_sheet.py <arena> <id> "<descripción en inglés>" <diseño.png> [--mode fly] [--nostyle]` → 3 filas × 6 cuadros sobre croma verde (caminar/volar, ataque, quieto+golpe+muerte), ~5 créditos.
2. **Armar e instalar:** `python3 tools/art/runway/install.py <arena> <id> <hMul> <altoNativo> [--kind bosses]` (croma → alfa, recorte, escala común, pies alineados, paleta, contorno de 1 px, atlas de 8 columnas, registro en `js/assets/enemy-runway-sheets.js`).
3. **Caminatas de frente y de espaldas:** `python3 tools/art/runway/walk_batch.py <arena> <id> <hMul> <altoNativo> front|side [fly]`. Aviso del repo: Runway devuelve ciclos de caminata casi idénticos entre cuadros; si la métrica de movimiento queda < 0,20 se usa el ciclo procedural (`procWalk` del spec, `build_sheet.py`).
4. **Chequeos:** `scan_sprites.py`, `enemy_coverage.js`, `pixel-density.js` y verlo en el motor (8 estados) antes de aprobar.

Reglas aprendidas (de ese mismo documento): sin palabras de combate violento en el prompt (Runway las rechaza); referencias chicas necesitan `--nostyle`; las hojas con texto o filas faltantes se rechazan, no se esconden. **Los jefes con retrato de campo de batalla** (`js/rendering/battlefield-art.js`: golem_cuerpos, mn_titan, mn_cerbero, ab_carcelero, minotauro, leviatán, dragón de la forja, micelio, bestia del bosque…) se ven con ese retrato, no con la hoja: rehacer su hoja no cambia lo que ve el jugador; el retrato es otro trabajo (`bloques/03-mundo.md`).

## 4. Cómo se diferencia cada rango (para el diseño)

| Rango | Qué tiene que transmitir | Detalle de dibujo |
|---|---|---|
| normal | chusma que llega en masa | silueta simple y legible a 30 px; poco detalle |
| subélite / élite | amenaza con rol | un rasgo propio claro (arma, armadura, aura) y más masa |
| subjefe | casi un jefe | mayor tamaño, animación propia de su ataque principal |
| jefe | el centro de la arena | mayor tamaño del juego; fases/transformaciones se piden como «forma» (`D-…`/`C-FORMA-…` en `bloques/03-mundo.md`) |

El color dominante de cada criatura (`color` en su ficha) tiene que dominar la silueta: es lo que el jugador usa para distinguirla en pantalla.

## 5. Criterio de aceptación

El de `RECETA.md` §5 más: (a) **misma criatura** que el atlas actual (no un rediseño, salvo que el bloque lo pida); (b) los 3 cuadros clave tienen **el mismo tamaño de cuerpo** (tolerancia ±4 % de altura); (c) el ataque muestra el ataque propio de la criatura (su ficha lo lista en «Ataques»; si el Códice no la tiene, el de su atlas actual); (d) se lee a tamaño real de juego.
