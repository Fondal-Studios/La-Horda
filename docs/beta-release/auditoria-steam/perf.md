# La Horda — auditoría de RENDIMIENTO (solo lectura)

Rama `claude/la-horda-beta-audit-exec-mwv8x0`. Nada editado en el repo (`git status --short` vacío).
Scripts y datos crudos: `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/perf/`
(`startup.js`, `startup_prof.js`, `startup_trace.js`, `startup_defer.js`, `g3.js`, `g5.js`, `g4.js`, `g6.js`, `*.log`, `*.json`, `prof_*.cpuprofile`).

## Cómo leer los números (límites de la medición)

- Chromium headless de Playwright, 1280×720, DPR 1, **sin GPU** (canvas 2D rasterizado por software) y en una máquina compartida. Los tiempos absolutos son ruidosos; valen las proporciones, los conteos y los perfiles.
- En partida, el 70-73 % del tiempo ocupado del hilo principal es `(program)` (código nativo: rasterizado y composición por software). **Ese costo no es representativo de una PC con GPU** y no lo pude medir con GPU. Lo que sí es trasladable: el costo de JS por cuadro, los conteos de llamadas al canvas y al DOM, y el crecimiento de memoria.
- "10 minutos de Horda" se midió **simulado**: `update(16,67)` a paso fijo con `render()` 1 de cada 3 pasos (no 10 minutos de reloj).
- No medí: arranque dentro de Electron/Steam real, RSS del proceso, memoria de imágenes decodificadas, costo con GPU.

## Tabla de medidas

### Arranque (`?lazy=1`, caché fría, contexto nuevo por corrida)

| Medida | Valor | n | Dispersión |
|---|---|---|---|
| Hasta botón habilitado + DOMContentLoaded, servidor HTTP local | 5098 / 5341 / 5550 ms | 3 | 5,1-5,6 s |
| Ídem, otro servidor estático local | 3582 / 3612 / 4105 ms | 3 | 3,6-4,1 s |
| Ídem, `file://` (lo más parecido a Steam) | 3848 / 4332 / 5200 ms | 3 | 3,8-5,2 s |
| `file://`: botón habilitado (`tBtn`) | 1704 / 1866 / 2423 ms | 3 | — |
| `file://`: DOMContentLoaded (termina `main.js`) | 3711 / 4008 / 5096 ms | 3 | — |
| Scripts cargados antes del menú | 523 archivos, 11,3 MB | 6 | constante |
| CSS | 53 archivos, 0,54 MB | 6 | constante |
| Imágenes antes de "listo" (HTTP) | 85-144 archivos, 7,9-9,8 MB | 3 | — |
| Imágenes antes de "listo" (`file://`) | 806-822 archivos, 59 MB | 3 | — |
| Imágenes en los 3 s siguientes (`file://`) | 660-676 archivos, 18,4-18,8 MB | 3 | — |
| Total que termina cargando solo, sin tocar nada | ~1480 imágenes, ~77,5 MB | 3 | — |
| Ejecución de JS (suma `EvaluateScript`) | 445-984 ms | 9 | HTTP 770-984, `file://` 445-530 |
| Long tasks ≥ 100 ms (HTTP) | 1 a 7 por arranque; la peor 284 ms (593 ms en una corrida previa) | 3 | suma de long tasks 1048-1675 ms |
| Long tasks > 200 ms | 0-1 por arranque (207 / 284 / ninguna) | 3 | — |
| `js/ui/pixel-icons.js` (eval) | 431, 94, 212, 121, 111, 74 ms | 6 | muy variable |
| `js/champions/vfx-unified/sfa_overlay.js` (1,7 MB, eval) | 69, 130, 107, 142, 83, 76 ms | 6 | — |
| `js/main.js` (eval; incluye `loadSave`) | 59, 141, 362, 28, 50, 57 ms | 6 | — |
| `js/champions/expedition/art.js` (eval) | 69-99 ms | 2 | no entró al top en las otras |
| Traza `file://`: hilo principal antes de DCL | ~3 s en plomería de carga de 1625 recursos vs 277 ms de `v8.run` | 1 | una sola traza |
| Perfil de CPU del arranque (`file://`) | 83 % `(program)`; JS propio ~700 ms | 1 | una sola corrida |
| `tools/perf/bundle.js` (42 scripts) vs suelto (523), intercalado | eval 1627-2624 ms vs 604-907 ms; listo 3778-6318 ms vs 3582-4105 ms | 3+3 | el empaquetado actual es MÁS LENTO en local |
| Experimento: cola de imágenes de 2.º plano después de DCL (`file://`) | DCL 3,5 / 3,7 / 4,4 / 4,5 s vs base 4,7 / 5,7 / 7,5 / 17,2 s | 4+4 | muy ruidoso; indicativo |

`en.js` y `pt.js` (1,3 MB cada uno) no se cargan en el arranque: están bien diferidos.

### Partida (Horda, GOD, piloto automático, guerrero + 3 aliados)

| Medida | Valor | n | Dispersión |
|---|---|---|---|
| Escena medida | ronda 13, Reino Micelial, 90 enemigos de media (mín. 83-87) | 3 capturas de 8 s | — |
| `update()` mediana / p95 | 1,7 / 2,1 / 1,7 ms — p95 4,1 / 4,5 / 3,3 ms | 3 | — |
| `render()` (solo JS) mediana / p95 / máx | 4,9 / 5,5 / 3,7 ms — p95 9,7 / 18,8 / 7,0 — máx 24 / 38 / 29 ms | 3 | — |
| JS total del `loop` por cuadro (perfil) | 7,9 / 9,4 / 6,2 ms | 3 | — |
| Intervalo entre cuadros (headless, sin GPU) | mediana 27,0 / 31,2 / 23,8 ms; p95 45,9 / 47,5 / 34,6 ms | 3 | no trasladable a PC con GPU |
| `(program)` nativo | 71,7 % del tiempo ocupado (17,5 s de 24,4 s) | 3 | 69,7-72,6 % en otras 2 corridas |
| GC | 0,83 % del tiempo ocupado | 3 | 0,5-0,8 % en otras corridas |
| `update()` simulado por ronda (sin dibujar) | 0,7-2,75 ms por paso hasta ronda 19 (98-99 enemigos) | 1 partida de 16 min | pico en Laberinto r16-17 |
| Enemigos máximos por ronda | 90-99 desde la ronda 8 (tope `aliveCap: 90`) | 1 | — |
| Llamadas al canvas por cuadro | `drawImage` 517-545, `fillRect` 319-337, `save`/`restore` 371-393, `globalAlpha=` 648-700, `stroke` 118-128, `fill` 41-93 | 2 corridas | — |
| Gradientes creados por cuadro | radial 1,9-13,6; lineal 9-26 | 2 | — |
| `putImageData` por cuadro | 3,9-13,1 | 2 | — |
| `measureText` / `fillText` / `font=` por cuadro | 9,7-25,5 / 15,7-29,9 / 14,3-26,9 | 2 | — |
| `getImageData`, `shadowBlur>0`, `filter` distinto de none | 0-0,1 / 0,6-0,7 / 0 por cuadro | 2 | no son problema |
| `toLocaleString` por cuadro | 0,06-0,15 | 2 | no es problema |
| Canvas creados por cuadro | 0,15-0,19 | 2 | — |
| Escrituras al DOM por cuadro (HUD) | 7,5-8,1 | 2 | 4,4-7,3 en otra corrida |
| Primer `ctx.font=` del cuadro | 0,35 / 1,27 / 0,80 ms; los otros 7-17 juntos 0,03-0,06 ms | 3 ventanas de 7 s | recálculo de estilo forzado |
| `canvas.clientWidth` por cuadro | 0,46-0,52 ms | 3 | layout forzado |

### Top del perfil de CPU (3 capturas × 8 s, 90 enemigos; % sobre el JS del `loop` = 6553 ms)

Tiempo propio:

| # | Función | archivo:línea | ms | % loop |
|---|---|---|---|---|
| 1 | `drawImage` (nativo) | — | 896 | 13,7 |
| 2 | `drawPortadorGround` (línea 33: `ctx.font = pxFont(13)`) | `js/champions/expedition/render.js:19` | 504 | 7,7 |
| 3 | `get clientWidth` (nativo) | llamado desde `js/core/canvas.js:86` | 308 | 4,7 |
| 4 | `restore` (nativo) | — | 265 | 4,0 |
| 5 | `save` (nativo) | — | 258 | 3,9 |
| 6 | `update` | `js/core/update.js:8` | 242 | 3,7 |
| 7 | GC | — | 202 | 3,1 |
| 8 | `putImageData` (nativo) | desde `js/rendering/pixel-stroke.js:57` | 184 | 2,8 |
| 9 | `render` | `js/rendering/renderer.js:8` | 125 | 1,9 |
| 10 | `pxsParse` | `js/rendering/pixel-stroke.js:18` | 121 | 1,9 |
| 11 | `micClamp` | `js/arenas/micelial/mic-map.js:155` | 98 | 1,5 |
| 12 | `micEnemyWorldUpdate` | `js/arenas/micelial/mic-enemies.js:333` | 93 | 1,4 |
| 13 | `drawEnemyOverlays` | `js/rendering/entities.js:372` | 91 | 1,4 |
| 14 | `animPose` | `js/rendering/animfx.js:173` | 90 | 1,4 |
| 15 | `micDrawWorld` | `js/arenas/micelial/mic-render.js:176` | 81 | 1,2 |

Inclusivo: `render` 68,9 %, `update` 23,5 % (del cual `arenaHook` del Micelial 17,2 %), `drawEnemy` (`entities.js:251`) 14,4 %, `pxsRing`/`pxsPath`/`pxsCompose` (`pixel-stroke.js:85/63/35`) 5,7-6,2 %, `drawAnimFrameSized` (`anim-atlas.js:89`) 6,2 %, `ensureCanvasSize` 4,9 %, `drawArena` 4,6 %, `drawHero` 4,5 %, `updateHUD` (`hud.js:126`) 3,4 %, `drawGoreDecals` 3,2 %.

En otra corrida (ronda 12, Fortaleza, otros aliados) el primer puesto de JS fue `drawEnemyRoleMarks` (`js/enemies/enemy-roles.js:220`, 803 ms = 15 % del loop), con 1388 de 1448 muestras en la línea 233, que también es un `ctx.font = pxFont(10)`. El punto caliente se mueve según qué código hace el primer `ctx.font=` del cuadro: es el mismo problema (ver optimización 5).

No encontré bucles O(n²) que pesen: `update()` queda en 1,7-2,1 ms con 90 enemigos.

### Memoria (1 corrida; 10 min simulados + 2 partidas más con "UNA MÁS")

| Momento | Heap JS | Canvas vivos | Píxeles de canvas | Creados acumulados |
|---|---|---|---|---|
| Partida 1, min 1 | 48,6 MB | 317 | 47,2 MB | 607 |
| Partida 1, min 5 | 54,6 MB | 805 | 94,6 MB | 1645 |
| Partida 1, min 10 (ronda 15) | 57,2 MB | 1059 | 94,9 MB | 2907 |
| Resultados 1 | 57,5 MB | 1195 | 116,1 MB | 3064 |
| Partida 2, min 3 | 58,6 MB | 1324 | 139,1 MB | 3909 |
| Resultados 2 | 58,6 MB | 1464 | 174,9 MB | 4050 |
| Partida 3, min 3 | 60,6 MB | 1439 | 146,9 MB | 4699 |
| Resultados 3 | 60,7 MB | 1589 | 182,4 MB | 4850 |

- El heap de JS está sano: +8,6 MB en 10 min (desacelera) y ~+2 MB por partida. Entidades acotadas (enemigos ≤ 99, `embers` 60, `vfxTeles` 96, `floatTexts` 70).
- **Lo que crece son los canvas en caché**: de 47 a 182 MB de píxeles y de 317 a 1589 canvas vivos tras `gc()`. Quién los crea (al final de la partida 3): `js/champions/ult-forms/kit.js:128` 45,7 MB ×712; `js/champions/skill-fx-a/engine.js:39` 24,8 MB ×110; `js/rendering/art-direction.js:127` 11,4 MB ×47; `js/rendering/juice.js:207` 11,3 MB ×92; `js/champions/vfx-unified/sfa-runtime.js:29` 11-16 MB ×34-40; `js/arenas/fortaleza/fort-art.js:40` 8,8 MB ×42 (arte de una arena que ya no se juega).
- `PXS.cache` (`pixel-stroke.js`) llega a su tope de 400 en el minuto 1 y queda saturada.
- Horneado en el hilo principal en una sesión de ~10 min: `sfaStats` 265 horneados, 2658 ms; `UF.stats` 10 horneados, 263 ms.

### Tamaño en disco

| Qué | Tamaño |
|---|---|
| Checkout completo | 22 GB (`.claude/` 16 GB, `.git` 3,6 GB, `art-source/` 1,5 GB, `docs/` 821 MB) |
| `assets/` | 272 MB reales (280 MB en disco), 3334 archivos |
| — `assets/sprites/champions` | 91 MB |
| — `assets/ui/codex` | 91 MB (84 MB son 43 retratos PNG de 1774×887 RGB, ~2 MB cada uno) |
| — `assets/sprites/arenas` / `enemies` / `bosses` / `battlefield` | 33 / 14 / 9,7 / 6,3 MB |
| — `assets/vfx` | 31 MB |
| — `assets/audio` | 6 MB (156 mp3) |
| PNG con gemelo WebP | 1310 pares: PNG 65,1 MB + WebP 44,9 MB |
| PNG sin gemelo WebP | 534 archivos, 155,3 MB (83,9 MB retratos del Códice + 71,5 MB resto) |
| `js/` + `css/` + `index.html` | 14 MB + 0,76 MB + 81 KB (637 archivos) |
| No viaja | `art-source/`, `docs/`, `tools/` 20 MB, `server/`, `tests/`, `reviews/`, `deploy/`, `contracts/`, ~40 `.md` de la raíz |
| Assets sin referencia literal ni pedido observado | 258 archivos, 18,4 MB (incluye 5 MB de música que se arma por patrón; ~12 MB dudosos: `ui/codex/arenas` 6,2 MB, `sprites/arenas/micelial` 3,8 MB, `vfx/bosses/bosque` 1 MB) |

Estimación del paquete del juego (sin el runtime de Chromium, que no medí):

| Escenario | Tamaño |
|---|---|
| Solo lo que el juego carga (`index.html`, `js/`, `css/`, `assets/`, `legal/`) | ~287 MB |
| + sin los 1310 PNG que ya tienen WebP | ~222 MB |
| + retratos del Códice a WebP q90 (×0,10 medido en 8 muestras) | ~146 MB |
| + resto de PNG sin gemelo a WebP sin pérdida (×0,70 medido en 50 muestras) | ~125 MB |

## Optimizaciones (ordenadas por ganancia esperada / riesgo)

Las marcadas **HACER YA** son de bajo riesgo y alta ganancia.

### 1. HACER YA — Lista blanca para el depósito de Steam
- **Evidencia**: el checkout pesa 22 GB; el juego solo carga `index.html`, `js/`, `css/`, `assets/` (y `legal/`). El juego arranca completo desde `file://` (medido, 3 corridas, sin errores).
- **Cambio**: script de empaquetado que copia solo esas rutas (lista blanca, no lista negra). Excluye `art-source/`, `docs/`, `tools/`, `server/`, `tests/`, `reviews/`, `deploy/`, `.git`, `.claude`, los `.md`.
- **Ganancia**: de GB a ~287 MB.
- **Riesgo**: muy bajo. Prueba: arrancar la copia empaquetada con `file://` y jugar una ronda con registro de 404.

### 2. HACER YA — No distribuir los PNG que ya tienen WebP
- **Evidencia**: 1310 pares; en todas las corridas se pidieron los 1310 `.webp` y **0** de esos `.png`. 65,1 MB.
- **Archivo**: `js/assets/lazy-images.js:60-75` (`pick` / `onWebpErr`), lista `ASSET_WEBP` en `js/assets/asset-webp.js`.
- **Cambio**: en el build de Steam borrar el `.png` de cada entrada de `ASSET_WEBP`. El Chromium embebido siempre lee WebP.
- **Ganancia**: −65 MB (287 → 222 MB).
- **Riesgo**: bajo-medio. Rutas que no pasan por `Image.src` (CSS `url()`, `fetch`, `?webp=0`) pedirían el PNG. Prueba: recorrer título, Códice, tienda, todas las arenas y los modos con registro de pedidos y exigir 0 fallos; `tests/art-runtime-clips.test.js`.

### 3. HACER YA — Retratos del Códice a WebP y convertir los PNG sin gemelo
- **Evidencia**: `assets/ui/codex/champions/*.png` = 43 archivos, 83,9 MB (31 % de `assets/`). Son ilustraciones RGB de 1774×887, no pixel art. Muestra de 8: WebP q90 ×0,10 (15,6 → 1,6 MB); sin pérdida ×0,71. Los otros 491 PNG sin gemelo (71,5 MB): sin pérdida ×0,70 en muestra de 50.
- **Archivo**: rutas en `js/ui/codex/codex.js:398+`; conversor `tools/art/webp_convert.py`.
- **Cambio**: generar el WebP y sumarlos a `ASSET_WEBP`. q90 para los retratos (decisión de arte) o sin pérdida si no se acepta.
- **Ganancia**: −75 MB con q90 (o −24 MB sin pérdida) y −21 MB del resto. Paquete ~125-146 MB.
- **Riesgo**: bajo en lo técnico; q90 necesita visto bueno de arte. Prueba: CI `webp-sync` y revisión visual del Códice.

### 4. HACER YA — La cola de imágenes de 2.º plano no debe arrancar antes de que terminen los scripts
- **Evidencia**: en `file://` el botón se habilita a los 1,7-2,4 s y `main.js` recién corre a los 3,7-5,1 s. En ese hueco ya se pidieron 806-822 imágenes (59 MB) que compiten con los 523 scripts. La traza muestra ~3 s del hilo principal en plomería de carga de 1625 recursos contra 277 ms de ejecución de JS. Experimento sin tocar el repo (n = 4, ruidoso): DCL 3,5-4,5 s con la cola diferida vs 4,7-17,2 s.
- **Efecto secundario que conviene avisar a UI/gameplay**: el botón queda clicable 2-3 s antes de `loadSave()` (`js/main.js`, script n.º 523). `preload.js` es el script n.º 3 y el manejador del clic está en `js/ui/menus.js:18`. En Steam (disco local, imágenes rápidas) el hueco es mayor que en la web. No probé qué pasa si se hace clic en ese hueco.
- **Archivo**: `js/assets/preload.js:68-72` (`refreshTitle`) y `:124-135` (`startRest`).
- **Cambio**: `startRest()` y `btn.disabled = false` solo después de `DOMContentLoaded`. Y `pumpBackground` solo en estados de menú, no durante la partida.
- **Ganancia**: orden de −25 a −35 % del tiempo hasta el menú en disco local (indicativo); cierra la carrera del botón.
- **Riesgo**: bajo. Prueba: `tools/perf/load-bench.js`, `tools/balance/test-campaign-startup.js` y las pruebas que esperan `#title-continue-btn`.

### 5. HACER YA — Sacar del cuadro el estilo/layout forzado (HUD + `clientWidth`)
- **Evidencia**: el primer `ctx.font=` de cada cuadro cuesta 0,35-1,27 ms (los otros 7-17 juntos, 0,03-0,06 ms): es el recálculo de estilo que obligan las 7,5-8 escrituras al DOM que `updateHUD` hace por cuadro. `canvas.clientWidth` cuesta 0,46-0,52 ms por cuadro. Juntos ~1,2 ms de ~7,7 ms de JS por cuadro. En el perfil: 7,7-15 % + 4,7 % del loop.
- **Archivos**: `js/core/canvas.js:86-89` (`ensureCanvasSize`, cada cuadro desde `js/core/loop.js:20`); `js/ui/hud.js:137-139` (`healthRow.title` y `shieldRow.title` se escriben cada cuadro sin comparar, más un `closest()`); `#goal-chip` (clase cada cuadro), `#btn-s1..3`, `#wave-timer-bar`, `#en-fill` (estilo 0,5-0,8 por cuadro cada uno).
- **Cambio**: (a) `ResizeObserver` + `resize` y dejar el chequeo por cuadro cada ~30 cuadros (el comentario dice que iOS a veces no avisa); (b) escribir `title` solo si cambió; (c) pasar la parte DOM de `updateHUD` a 10-15 Hz (la vida puede seguir por cuadro); (d) recargas con `transform`.
- **Ganancia**: ~1,2 ms por cuadro, ~15 % del JS del cuadro, y menos trabajo de estilo/layout del navegador.
- **Riesgo**: bajo-medio. Deduplicar solo `title` no alcanzó en mi A/B (0,35/1,27/0,80 vs 0,88/0,62/0,64 ms): hay que bajar todas las escrituras. Prueba: `tools/perf/dom-reads.js`, `tools/perf/runtime-ab.js`, contratos de HUD en `tools/ux/`.

### 6. HACER YA — `pixel-stroke.js`: caché de colores saturada y `putImageData` por anillo
- **Evidencia**: `PXS.cache` se llena (400) en el minuto 1; desde ahí cada color nuevo paga regex + `Object.keys(PXS.cache).length` sobre 400 claves (`pxsParse` 1,9 % del loop; 265 ms en otra corrida). `pxsCompose` 5,7 % inclusivo; `putImageData` 3,9-13,1 por cuadro (2,8 % del loop; 616 ms en otra corrida); 5700 trazos en una sesión. Cada trazo crea `ImageData`, una closure y un `Object.assign`.
- **Archivo**: `js/rendering/pixel-stroke.js:18-27` (`pxsParse`), `:35-60` (`pxsCompose`), `:85-88` (`pxsRing`).
- **Cambio**: cuantizar el alfa a 1/16 antes de armar la clave (el tramado ya solo tiene 16 niveles: `lim = Math.round(lvl*16)`), contador en vez de `Object.keys`, y cachear el anillo horneado por (rx, ry, capas, celda) cuantizados para estamparlo con `drawImage`.
- **Ganancia**: 4-8 % del JS del cuadro cuando hay guardianes con anillos. Con GPU además evita una subida de textura por trazo (no medido).
- **Riesgo**: bajo (cosmético). Prueba: visual gate de `docs/ART_BIBLE.md`, pruebas de `tools/vfx/`.

### 7. Arranque: trabajo síncrono que se puede diferir
- **Evidencia**: `js/ui/pixel-icons.js:1727-1736` corre `start()` al cargar: codifica 94 íconos a PNG con `toDataURL`, arma una hoja CSS con data-URL y recorre todo el `body` (74-431 ms, n = 6; es la long task más repetida). `sfa_overlay.js` (1,7 MB) decodifica 52 capas al cargar (69-142 ms; `abaSfaDecode` en `sfa-runtime.js:8`). `loadSave` → `questsEvaluate` (`js/systems/quests.js:279`) 23 ms.
- **Cambio**: generar el CSS de íconos en build (o diferirlo a `requestIdleCallback` después del título); guardar las cadenas de `abaSfaOverlay` y decodificar en el primer `sfaBake` de esa clave.
- **Ganancia**: −150 a −550 ms de hilo principal y las long tasks más grandes.
- **Riesgo**: bajo-medio (íconos sin pintar un instante si se difiere mal). Prueba: pruebas de `pixel-icons`, `tools/art/ability-art/pipeline.py`, capturas de título.

### 8. No usar `tools/perf/bundle.js` tal como está para Steam
- **Evidencia**: 3+3 corridas intercaladas: con el paquete (42 scripts) la ejecución sube de 604-907 ms a 1627-2624 ms y el "listo" de 3,6-4,1 s a 3,8-6,3 s. Inyectar el código como texto pierde la compilación en streaming.
- **Cambio**: en disco local dejar los archivos sueltos o hacer concatenación real por tramos (riesgo alto: zona muerta temporal, `typeof` entre archivos). Alternativa a evaluar por el área de empaquetado: caché de código de V8 con protocolo propio en Electron (no medido).
- **Ganancia**: evita una regresión de ~1 s. **Riesgo** de no hacer nada: ninguno.

### 9. Tope global para los canvas en caché
- **Evidencia**: 47 → 182 MB de píxeles y 317 → 1589 canvas vivos en 3 partidas. `sfaCache` (`js/champions/skill-fx-a/engine.js:18`, clave con `size` y arena en `:279`) y `ABS.cache` (`sfa-runtime.js:7`) no tienen tope: solo se vacían al cambiar de arena. `UF_PX_MAX = 12e6` (`ult-forms/kit.js:18`) limita 48 MB pero no cuenta los cuadros que retiene el pool. Queda arte de arenas ya jugadas (`fort-art.js:40`, 8,8 MB).
- **Cambio**: presupuesto único con LRU para `sfaCache`/`ABS.cache`; soltar cachés de arena y de definitivas en `endlessFinish()` / `startRun()`; reutilizar canvas (se crean ~4,8 por segundo).
- **Ganancia**: memoria gráfica estable (~100 MB en vez de crecer). Importa en sesiones largas y GPU integradas.
- **Riesgo**: medio: soltar de más provoca re-horneados (ver 10). Prueba: `tools/perf/canvas-mem.js` ampliado a 3 partidas con umbral.

### 10. Horneado de efectos fuera del cuadro
- **Evidencia**: 265 horneados y 2658 ms en ~10 min (~10 ms cada uno), en el hilo principal; `render()` máx 24-169 ms contra mediana 4-9 ms. `sfaCache.clear()` en cada cambio de arena (`engine.js:278`), y la Horda cambia de arena cada 5 rondas.
- **Cambio**: no vaciar por arena (la arena ya está en la clave: usar LRU), y pre-hornear los temas del equipo durante la pantalla de transición o de reliquias.
- **Ganancia**: menos tirones al entrar en arena y al primer uso de cada habilidad.
- **Riesgo**: bajo-medio. Prueba: contar cuadros > 33 ms en `tools/perf/runtime-ab.js`.

### 11. Menos `save`/`restore` y estado redundante en el dibujo de enemigos
- **Evidencia**: 371-393 `save`+`restore` por cuadro (7,9 % del loop en tiempo propio), 648-700 `globalAlpha=`, 517-545 `drawImage`; `drawEnemy` 14,4 % inclusivo (`js/rendering/entities.js:251`, `:317`, `:372`); `drawEnemyRoleMarks` arma 3 cadenas `rgba()` por enemigo con rol por cuadro (`enemy-roles.js:224-233`).
- **Cambio**: restaurar a mano lo que se tocó en vez de `save`/`restore` en los caminos por enemigo; pre-renderizar la insignia de rol a un sprite por rol; `pxFont(n)` con tabla (hoy `toFixed` + plantilla en 62 sitios).
- **Ganancia**: 5-8 % del JS del cuadro.
- **Riesgo**: medio (fugas de estado del contexto = errores visuales). Prueba: regresión visual y `tests/art-runtime-clips.test.js`.

### 12. Medir en el hardware objetivo antes de tocar el render grueso
- **Evidencia**: aquí el 70-73 % del cuadro es rasterizado por software; no dice nada de una PC con GPU. La resolución adaptable (`js/core/canvas.js:58`) está apagada bajo automatización.
- **Cambio**: en el shell de Steam, con GPU, capturar una traza de la misma escena (ronda 13+, 90 enemigos; `g5.js` sirve de guía) y revisar `putImageData` → `drawImage` y los ~10-40 gradientes por cuadro, que son los candidatos a costar en GPU.
- **Ganancia**: desconocida hasta medir. **Riesgo**: ninguno.

## Lo que está bien y no tocaría
- `update()`: 1,7-2,1 ms con 90 enemigos; el tope `aliveCap: 90` funciona.
- GC por debajo del 1 %: las asignaciones por cuadro no son prioridad (las partículas ya usan pools tipados en `js/rendering/vfx.js`).
- `getImageData`, `shadowBlur`, `filter` y `toLocaleString` casi no aparecen en caliente.
- Los idiomas `en`/`pt` (2,6 MB) ya se cargan por demanda.
