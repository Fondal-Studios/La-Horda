# Cómo se hace una hoja de enemigo, subjefe o jefe

Fuente: manifiesto `docs/art-brief/manifiestos/mundo_faltantes.json` (filas `C-ENEMY-*`) y los atlas actuales (`js/assets/*-meta.js`). Los prompts por criatura están en `enemigos/<arena>.md`.

## 1. Formato de la hoja

- **Hoja COMPLETA**, no cuadros sueltos: celdas iguales, **8 columnas**, PNG RGBA, alfa 0/255, contorno de 1 px, flat shading.
- **Pies en la fila `anchor × alto de celda`** (el atlas actual de cada criatura trae su `anchor`, típicamente ≈ 0,95).
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

## 3. Qué pedirle a Runway (y qué no)

Runway hace **3 imágenes clave** por criatura: `idle`, `walk_side` y `atk_side` (cada una con `@codex` = el cuadro actual de su atlas como diseño y `@pose` = el cuadro equivalente). El resto (caminar de frente y de espaldas, ataque de frente/espaldas, golpe, muerte) lo deriva el pintor determinista a partir del cuerpo aceptado (`tools/art/painter/enemy_paint.py`, `tools/art-world/build-*.py`), porque pagar los 9 estados por criatura multiplica el costo por 3 sin mejorar el diseño. Si un estado derivado se ve mal, ESE estado se pide a Runway.

## 4. Cómo se diferencia cada rango (para el diseño)

| Rango | Qué tiene que transmitir | Detalle de dibujo |
|---|---|---|
| normal | chusma que llega en masa | silueta simple y legible a 30 px; poco detalle |
| subélite / élite | amenaza con rol | un rasgo propio claro (arma, armadura, aura) y más masa |
| subjefe | casi un jefe | mayor tamaño, animación propia de su ataque principal |
| jefe | el centro de la arena | mayor tamaño del juego; fases/transformaciones se piden como «forma» (`D-…`/`C-FORMA-…` en `bloques/03-mundo.md`) |

El color dominante de cada criatura (`color` en su ficha) tiene que dominar la silueta: es lo que el jugador usa para distinguirla en pantalla.

## 5. Criterio de aceptación

El de `RECETA.md` §5 más: (a) **misma criatura** que el atlas actual (no un rediseño, salvo que el bloque lo pida); (b) los 3 cuadros clave tienen **el mismo tamaño de cuerpo** (tolerancia ±4 % de altura); (c) el ataque muestra el ataque propio de la criatura (su ficha lo lista en «Ataques»); (d) se lee a tamaño real de juego.
