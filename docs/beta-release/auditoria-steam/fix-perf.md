# Corrección — RENDIMIENTO Y RELEASE (informe)

Rama `claude/la-horda-beta-audit-exec-mwv8x0`, 2026-11-10. Sin git add/commit, sin `npm install`, sin Electron descargado.
Verificación solo por conteos deterministas, `node --check` y mis dos pruebas nuevas (ambas pasan, exit 0). No corrí ninguna otra suite.

Registros: `perf-after.log`, `perf-before.log`, `stage-test.log` y los originales para el "antes" en `perf-baseline/`, todo en
`/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/`.

## Resumen por tarea

| Tarea | Estado | Archivos |
|---|---|---|
| A1 carrera del título | HECHO | `js/assets/preload.js` |
| A2 layout forzado por cuadro | PARCIAL | `js/core/canvas.js`, `js/ui/hud.js` |
| A3 caché de `pixel-stroke.js` | PARCIAL (caché sí, `putImageData` no) | `js/rendering/pixel-stroke.js` |
| A4 `sfaCache` | HECHO (con una limitación fuera de mis archivos) | `js/champions/skill-fx-a/engine.js` |
| B contenedor `desktop/` | HECHO como código; **binario NO construido ni probado** | `desktop/*` (nuevo), `docs/steam/README.md` (nuevo) |
| Pruebas nuevas | HECHO | `tools/perf/test-hud-throttle.js`, `desktop/test-stage.mjs` |

Cómo se midió el antes/después: la misma prueba (`tools/perf/test-hud-throttle.js`) corrida dos veces, una contra el árbol y otra con
`PERF_BASELINE_DIR` sirviendo los 5 archivos originales (`git show HEAD:`). Mismas entradas en las dos corridas.

## A1 — Carrera del título: HECHO

Cambio: el botón y `startRest()` (cola de arte diferido) esperan además la señal de main: el `setState("title")` de `js/main.js`
(llega por `assetsOnState`, justo después de `loadSave()`) o `DOMContentLoaded` como red de seguridad. La 1ª tanda de imágenes sigue
arrancando de inmediato, así que el menú no se demora más que lo que tarden los scripts. Contrato intacto: mismo id, mismo texto,
`assetsAllReady()` sigue exigiendo `restStarted`.

Medida (con `js/main.js` retenido hasta 1,5 s después de terminar la 1ª tanda; foto tomada en la primera línea de main):

| | Antes | Después |
|---|---|---|
| Botón del título habilitado antes de `loadSave()` | **sí** | no |
| `restStarted` antes de `loadSave()` | true | false |
| Grupos de arte diferido ya arrancados | 13 | 0 |
| Imágenes ya pedidas | 496 | 46 (núcleo 33 + las del título) |
| `assetsAllReady()` antes del guardado | true | false |
| Después de main: botón habilitado, `restStarted`, `assetsAllReady()` | sí | sí |

No verificado: cuánto baja el tiempo real hasta el menú en disco local (la auditoría estimaba −25 a −35 %; acá no se puede medir).
No hice "`pumpBackground` solo en menús": la Horda cambia de arena en plena partida y podría dejar arte sin cargar.

## A2 — Layout forzado por cuadro: PARCIAL

Hecho:
- `canvas.js`: `ensureCanvasSize()` ya no lee `clientWidth/clientHeight` cada cuadro. Un `ResizeObserver` sobre el canvas marca la
  caja como sucia y hay una medición de control cada 30 cuadros (por si iOS no avisa). DPR y tele se siguen comparando cada cuadro.
  Sin `ResizeObserver` o sin layout, se mide cada cuadro como antes.
- `hud.js`: los `title` de vida y escudo se escriben solo si cambian (`hudTitle`), y el `closest()` por cuadro queda cacheado.

| | Antes | Después |
|---|---|---|
| Lecturas de layout del canvas en 300 cuadros | 600 (2,0/cuadro) | 20 (0,067/cuadro) |
| Escrituras al DOM en 120 cuadros sin cambios | 360 (3,0/cuadro) | 120 (1,0/cuadro) |
| Escrituras al DOM en 600 cuadros con actividad | 4,93/cuadro | 3,01/cuadro |
| Escrituras de `title` en esos 600 cuadros | 1.200 | 49 (= 49 cambios reales de valor) |
| Barra de vida: escrituras / cambios de valor | 49 / 49 | 49 / 49 (sin cambio) |
| Cuadros en que vida o energía quedaron atrasadas | 0 | 0 |
| Cambio de ventana seguido | sí | sí |
| Cambio de la caja sin evento de ventana | corregido en 1 cuadro | corregido en **2 cuadros** |

Diferencia de comportamiento a saber: si la caja del canvas cambia sin evento `resize` de la ventana, la corrección llega un cuadro
más tarde (el observador avisa después del dibujo). Con `resize` normal no cambia nada.

Lo que NO hice y por qué:
- Bajar la parte DOM del HUD a 10-15 Hz o cuantizar más las barras: el barrido de enfriamiento y la energía se verían a saltos; no
  puedo garantizar que sea invisible. Las escrituras que quedan son valores que cambian de verdad (`#en-fill` 480/600,
  `#wave-timer-bar` 233/600, `--cdp` de cada botón ~100/600).
- **Queda 1 escritura por cuadro que no es mía**: `#goal-chip` reescribe su `class` en cada cuadro (es el 100 % de las escrituras en
  reposo). Archivo `js/ui/goal-guide.js`, función `goalChipTick`. Cambio exacto:
  - línea 77: `el.classList.add("peekable");` → `if(!el.classList.contains("peekable")) el.classList.add("peekable");`
  - línea 82: `el.classList.remove("peekable");` → `if(el.classList.contains("peekable")) el.classList.remove("peekable");`
  Con eso los cuadros en reposo quedan en 0 escrituras, que es lo que de verdad elimina el recálculo de estilo del primer `ctx.font=`.
- No verificado: la ganancia en ms (la auditoría estimaba ~1,2 ms/cuadro sumando todo; yo solo cuento).

## A3 — `pixel-stroke.js`: PARCIAL

Hecho: la caché de colores pasa de un objeto que dejaba de aceptar claves a las 400 (y pagaba un `Object.keys()` de 400 por cada
color nuevo) a dos generaciones de 256 con promoción (LRU aproximado, O(1), máximo 512). La interpretación del color no cambió.

| | Antes | Después |
|---|---|---|
| 50 colores fijos usados 20 veces con la caché ya llena: interpretaciones (regex) | 1.000 | 50 |
| 1.500 colores de un solo uso | 1.500 | 1.500 (inevitable: cada cadena es distinta) |
| Tamaño de la caché al final | 400 (saturada) | 372 (tope 512) |
| Valores distintos frente a la interpretación de referencia (incluye casos raros) | 0 | 0 |
| Hash de píxeles de 4 trazos (2 anillos, disco, línea) | `d92caa90` | `d92caa90` (idéntico) |
| `putImageData` en esos 4 trazos | 4 | 4 |

No hecho: bajar los `putImageData` (4-13 por cuadro). Cachear el anillo horneado exige que la clave incluya la posición dentro de la
celda, porque el trazo y el tramado van anclados a la rejilla del mundo; solo acertaría con anillos quietos y cada fallo costaría un
canvas nuevo. Sin GPU no puedo medir si conviene ni probar que no empeora, así que no lo toqué.

## A4 — `sfaCache`: HECHO

- Tope por bytes en la caché de la arena en curso (64 MB): al pasarlo se sueltan los menos usados, nunca el recién horneado ni lo
  usado en los últimos ~2 cuadros.
- Al cambiar de arena ya no se tira todo: lo de la arena que se deja pasa a una reserva LRU de 32 MB y se recupera tal cual al volver.
  `sfaCache` sigue conteniendo **solo** claves de la arena actual (lo exigen `tools/vfx/test-*-legible.js`, que no toqué) y
  `sfaCacheArena` se comporta igual (lo usa `brakk.js`). `sfaCache.clear()` también vacía la reserva, así las herramientas que fuerzan
  un horneado siguen funcionando.
- En equipos con poca memoria (`deviceMemory ≤ 4` o solo puntero táctil) la reserva es 0: comportamiento idéntico al anterior.

| Recorrido bosque → hielo → infernal → bosque, 6 efectos | Antes | Después |
|---|---|---|
| Horneados por visita | 6, 6, 6, **6** | 6, 6, 6, **0** |
| Píxeles al volver iguales a los de la primera visita | sí | sí |
| Claves de `sfaCache` solo de la arena actual | sí | sí |
| Horneado tras `sfaCache.clear()` | 6 | 6 |
| Recorte por bytes (10 entradas de 10 kB, tope 35 kB) | sin tope | deja 3, conserva la protegida y las más recientes |

Limitaciones:
- La ganancia existe solo al **volver** a una arena ya vista en la sesión (otra partida, rejugar). La primera vez en cada arena se
  hornea igual: el tinte por arena cambia los píxeles.
- `js/champions/vfx-unified/sfa-runtime.js` (no es mío) envuelve `sfaBake` y vacía su propia caché `ABS.cache` en cada cambio de
  arena (línea 24), así que al volver todavía recompone la capa superpuesta (más barato que hornear, pero crea un canvas). Para cerrar
  eso habría que darle la misma reserva a `ABS.cache`.
- No verificado: memoria real en una sesión de 3 partidas (`tools/perf/canvas-mem.js` no lo corrí). El peor caso sube hasta 32 MB
  respecto de antes por la reserva; a cambio la caché activa ahora tiene techo.

## B — Contenedor de escritorio: código HECHO, binario NO construido

**No se construyó ni se ejecutó Electron. Nada se probó en Windows ni en Steam Deck.** `main.js` y `preload.js` solo pasaron
`node --check`; la lógica que no depende de Electron (`url-policy.js`, `save-mirror.js`) sí se ejecutó con Node.

Archivos en `desktop/`: `main.js`, `preload.js`, `url-policy.js`, `save-mirror.js`, `package.json`, `electron-builder.yml`,
`stage.mjs`, `test-stage.mjs`, `steam_appid.txt.example` (sin AppID real), `LEEME.md`, `.gitignore`. Más `docs/steam/README.md`.

Cambios respecto del borrador:
- Ventana 1280×720 (el borrador arrancaba en pantalla completa); el juego va suelto en `resources/game`, no dentro del asar.
- Parámetros: lista blanca `return, cw, room, mode`; el resto se quita en el protocolo (302) y en `will-navigate`.
- Se cancela todo script/marco que no venga de `app://lahorda/` (efecto: "Jugar en la tele" no funciona en este build).
- El espejo del guardado del borrador **no habría funcionado**: parcheaba `Storage.prototype.setItem` desde el preload, que con
  `contextIsolation` es otro mundo JS, y restauraba de forma asíncrona (después de `loadSave`). Ahora: plan de arranque síncrono antes
  del primer script y sondeo cada 2 s + `pagehide`, sin tocar prototipos.
- Guardado: escritura atómica (temporal + fsync + rename, `.bak`), revisión que solo crece (no compara relojes entre máquinas), un
  archivo dañado nunca se adopta, y si el local tiene cambios sin espejar gana el local y el archivo ajeno queda como `.conflict-N.json`.
- `stage.mjs` no quita ni reordena ningún `<script>` (el borrador quitaba tres sin revisar dependencias); solo saca manifest,
  canonical, og/twitter y el enlace de instalación. `--beta-public` es opcional y está apagado.
- `steamworks.js` quedó como dependencia opcional.

### PNG con gemelo WebP: NO se excluyen

Revisé `js/assets/lazy-images.js` y `js/assets/asset-webp.js` (el `js/core/asset-webp.js` del encargo no existe; está en `js/assets/`).
El cambio a `.webp` solo ocurre cuando la imagen se pide por la propiedad `img.src` desde JS. Rutas que piden el `.png` igual:
1. `<img src="...">` escrito como HTML: miniaturas `preview.png` de skins en `js/ui/shop-ui.js` (232, 260, 274, 479, 547, 560),
   `js/ui/shop-cromas.js:29` y `js/ui/codex/codex.js` (527, 539). 27 `preview.png` tienen gemelo.
2. CSS: `css/hud.css` → `assets/sprites/bosses/infernal/hechicero/portrait.png` (tiene gemelo).
3. El reintento `onWebpErr` y `?webp=0` (este último ya no se puede activar desde el paquete).

Por eso el staging lleva los 1.310 pares (65,1 MB de PNG "duplicados"). Dato suelto: 33 pares en disco no figuran en `asset-webp.js`.

### Resultado de `desktop/test-stage.mjs` (35 comprobaciones, todas pasan)

- **Tamaño del staging: 285,6 MB en 3.979 archivos** (PNG: 1.895 = 220,6 MB).
- Raíz del staging: `assets, css, index.html, js, legal`. Nada de `art-source/`, `docs/`, `tools/`, `server/`, `tests/`, `reviews/`,
  `.github/`, ni `sw.js`, `manifest.webmanifest`, `instalar.html`, `package.json`, `.md` de la raíz.
- 582 referencias locales de `index.html`, todas presentes; los 579 scripts y hojas en el mismo orden que el original; 24 `url()` de CSS presentes.
- Carga en Chromium headless por servidor estático local: llega al título con el botón habilitado, pide las 1.430 imágenes del
  manifiesto, 0 errores de página, 0 pedidos con 404 o fallidos; al tocar el botón pasa a `starter`.
- Staging hecho en `…/scratchpad/dept/stage-out/game` y **borrado al terminar** (verificado).

## Lo que no verifiqué

- Electron en cualquier forma: arranque, protocolo `app://`, pantalla completa, bloqueo de DevTools, IPC del guardado, `electron-builder`
  (incluidas las claves `electronFuses` y `extraResources`), overlay de Steam, `steamworks.js`, Steam Cloud, Windows, Steam Deck.
- Tiempos y FPS de cualquier optimización (sin GPU, CPU compartida): solo conteos.
- Regresión general: no corrí otras suites. Las que más conviene que corra el integrador por mis cambios:
  `tools/regression/t_camera.js` (canvas), `tools/vfx/test-morveth-legible.js`, `test-aelith-silhouette-legible.js`,
  `test-brakk-deploy-legible.js`, `verify-brakk-armor.js` (caché de efectos), `tools/balance/test-campaign-startup.js` y
  `tools/perf/load-bench.js` (título), contratos de HUD en `tools/ux/`.
- iOS/Safari real para el cambio de `ensureCanvasSize`.
- La prueba de carga del staging corre con `navigator.webdriver`, donde el juego apaga red, cuenta y telemetría.

## Pedidos a otros dueños de archivos

1. `js/ui/goal-guide.js` líneas 77 y 82: los dos cambios de arriba (elimina la última escritura por cuadro en reposo).
2. `js/champions/vfx-unified/sfa-runtime.js:24`: no vaciar `ABS.cache` al cambiar de arena sin reserva (ver A4).
3. `.gitignore` de la raíz: no hace falta, `desktop/.gitignore` ya cubre `node_modules/`, `game/`, `dist/` y `steam_appid.txt`.
4. Para poder quitar 65 MB de PNG: pasar las miniaturas de tienda/Códice y el retrato de `css/hud.css` por WebP.
