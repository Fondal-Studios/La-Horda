# La Horda — auditoría de PLATAFORMA / RELEASE para Steam

Rama `claude/la-horda-beta-audit-exec-mwv8x0`, 2026-11-10. Solo lectura: `git status --short` vacío al terminar.
Scripts, capturas y borradores: `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/steam/`.

## Veredicto

El juego **no está empaquetado para escritorio** (solo PWA web), pero **ya arranca y se juega en solitario sin Internet**: ninguna petición externa bloquea el arranque. Lo que falta para Steam se reparte en tres bloques:

1. **Contenedor** (no existe): Electron con protocolo propio de origen fijo. `file://` no sirve y un servidor local con puerto al azar pierde el guardado.
2. **Requisitos de PC que faltan en el código del juego**: pantalla completa en escritorio, salir al escritorio, pausa al perder el foco de ventana, escala de la interfaz en 1440p/ultrawide, joystick táctil visible con teclado, botones de PlayStation, limitador de FPS.
3. **Decisiones y cuentas del dueño**: Steamworks/AppID, compras (hoy apuntan a Mercado Pago web con login propio), textos legales en BORRADOR, correo de soporte vacío, declaración de arte generado con IA.

## Cómo se midió

- Chromium (Playwright) contra el arnés `tools/lib/serve.js`, con **todo lo que no es localhost abortado** (`page.route` → `internetdisconnected`).
- El juego apaga red, cuenta y telemetría cuando detecta `navigator.webdriver` (p. ej. `js/net/net-core.js:148`, `js/net/account.js:863`, `js/net/alpha-services.js:14`). Por eso la lista de peticiones se tomó en una segunda pasada con `navigator.webdriver=false` (`real.js`).
- Resoluciones probadas por redimensionado de ventana: 1280×720, 1920×1080, 2560×1440, 3440×1440, 1280×800.
- **NO VERIFICADO** (sin acceso): Windows real, Steam Deck real, macOS, mando físico, Steamworks, overlay de Steam, ningún build de Electron (los borradores solo pasaron `node --check`).

---

## (a) Checklist "listo para Steam"

### 1. Empaquetado de escritorio

| Ítem | Estado | Evidencia |
|---|---|---|
| Contenedor de escritorio (Electron / NW.js / Tauri / Capacitor) | **FALTA** | Ningún archivo en el repo; `docs/beta-release/ESTADO_REAL.md:80,94` lo confirma. `package.json` de la raíz solo tiene `lan` y `test:lan`. |
| PWA (manifest + service worker) | HECHO (web, no sirve para Steam) | `manifest.webmanifest`, `sw.js` (inactivo sin estampar: `sw.js:13` `BUILD = null`), `instalar.html`, `js/ui/install.js`. |
| Script de build web | HECHO (solo web) | `tools/build-static.mjs:10` copia `assets, css, js, legal, index.html, instalar.html, crystal-wars.html, manifest, sw.js`. Sirve de base para la lista del paquete. |
| `steam_appid.txt`, scripts de SteamPipe, íconos `.ico/.icns` | **FALTA** | Solo existen `assets/icons/icon-192.png` e `icon-512.png`. |
| Tamaño del paquete | PARCIAL | `assets/` 280 MB: 1.844 PNG (~176 MB) + 1.310 WebP (~48 MB) duplicados; `js/` 15 MB. Podando los PNG con gemelo WebP el juego queda en ~100 MB más ~250 MB de Electron. |

### 2. Arranque y juego sin red

| Ítem | Estado | Evidencia |
|---|---|---|
| Arranca sin Internet | **HECHO** | Título jugable a los 4–8 s (navegador real, carga diferida) con todo lo externo abortado; 0 errores de página. Fuentes locales (`index.html:27-29`, `css/base.css:4-7`). |
| Partida en solitario sin Internet | **HECHO** | Título → invitado → guardián de regalo → tutorial → campaña Arena 01 (`state=playing`), sin WebSocket y sin errores. |
| Corre desde `file://` | **FALTA (no viable)** | Arranca y entra a partida, pero: fuentes bloqueadas por CORS, `fetch` de `assets/audio/manifest.json` bloqueado (sin audio de archivo), y `getImageData` falla por canvas "tainted" (21 archivos de `js/` lo usan). |
| Servidor local con puerto al azar | **FALTA (no viable)** | `localStorage` es por origen: al cambiar el puerto entre ejecuciones se perdió el guardado (medido: volvió a la pantalla de primer guardián). Además `laHordaPrivateHost()` (`js/storage/save.js:112-120`) habilita `?dev=1` en localhost. |
| Pantalla de cuenta en cada arranque | **FALTA** | `accountGate` (`js/net/account.js:868-877`) muestra "Entrar / Crear cuenta / Jugar como invitado" si no hay sesión; la elección de invitado se guarda en `sessionStorage` (`account.js:49,692`), así que en escritorio aparecería **en cada lanzamiento**. |
| Pantallas colgadas esperando al servidor | PARCIAL | "SALAS ABIERTAS" queda en "Buscando salas…" más de 14 s sin red (`js/net/net-rooms.js:71`; corte a 12 s en `:35`, y después mensaje "puede estar despertando"). Brasas muestra "—" y "Iniciá sesión para comprar Brasas". Pase de batalla abre un diálogo "Iniciar sesión". Ninguna bloquea el juego en solitario. |

**Peticiones a Internet en frío (navegador real, sin sesión).** Ninguna bloquea ni demora el arranque; todas fallan en silencio.

| Momento | Petición | Origen en el código |
|---|---|---|
| ~2 s | `GET https://fondalstudios.com/la-horda/red/health` | `netWarmup`, `js/net/net-core.js:148` |
| ~3,5 s | `GET …/red/api/world` (noticias y eventos) | `js/net/alpha-services.js:194,259` |
| ~12 s | `GET https://fondalstudios.com/tv/fondal-tv.js` (script) | Fondal TV, `js/net/fondal-tv.js:50,81,248` |
| al tocar "continuar" | `GET …/red/health` y `…/red/api/health` (espera de hasta 90 s, no bloquea) | `accountWarmup`, `js/net/account.js:138-142` |
| cada ~30 s | `POST …/red/api/telemetry` (**activa por defecto**, se apaga en Opciones) | `js/net/alpha-services.js:15,30` |
| al abrir Multijugador | `GET …/red/api/rooms?build=…` | `js/net/net-rooms.js:36` |

Con sesión iniciada se suman `/api/save`, `/api/gm/status`, `/api/me` cada 2 min y `/api/wallet` (`account.js:303,394,945`; `js/systems/premium.js:73`). `js/net/fondal-telemetry.js` no pide nada fuera de `fondalstudios.com` (`:17`).

### 3. Requisitos típicos de PC

| Ítem | Estado | Evidencia |
|---|---|---|
| Pantalla completa / ventana | **FALTA** | `js/core/fullscreen.js:20` solo se activa con `pointer:coarse` (Android). F11 y Alt+Enter no hacen nada desde el juego (medido: `fullscreenElement=false`). No hay opción en Opciones (`index.html:273-316`). |
| El canvas escala sin deformar | **HECHO** | `js/core/canvas.js:26-28,69-84`; `VIEW_WORLD_SHORT=650`, `VIEW_WORLD_LONG_MAX=1500` (`js/core/constants.js:20`). Medido: 16:9 ve 1156×650 unidades en 720p/1080p/1440p; 3440×1440 ve 1500×628 (sin bandas, sin estirar); 1280×800 ve 1040×650. |
| Píxeles nítidos | HECHO | `imageSmoothingEnabled=false` (`canvas.js:76`), `image-rendering: pixelated` (medido). El zoom no es entero (1,108 / 1,662 / 2,215): puede haber "shimmer" al mover la cámara. NO VERIFICADO en monitor real. |
| Interfaz en 1440p y ultrawide | **FALTA** | La interfaz está en px fijos sin escala: el HUD mide 14,4 px en todas las resoluciones y el menú principal es una columna de ~1.000 px (`css/menus.css`, `max-width` 380–840 px). En 1080p se ve correcto; en 2560×1440 y 3440×1440 queda chico y, en ultrawide, corrido hacia abajo. Capturas `shots/f6-menu-3440x1440.png`, `shots/f7-play-3440x1440.png`. |
| Salir al escritorio | **FALTA** | No existe `window.close` ni botón. El menú solo tiene "Volver al título" (`index.html:207`) y la pausa "Abandonar arena" (`index.html:691`). |
| Pausa al perder el foco | PARCIAL | Pausa solo con `visibilitychange` (`js/core/input.js:275-277`), que en escritorio dispara al minimizar pero **no con Alt+Tab**. Medido: tras `blur` el estado sigue en `playing` (solo se sueltan las teclas, `input.js:148`). |
| Esc | HECHO | Esc o P pausan y reanudan, y cierran Opciones (`js/core/input-desk.js:245-250`). Medido. |
| Volumen / silencio | PARCIAL | Música y Efectos por separado en Opciones y en la pausa (`index.html:283,286`; `js/audio/audio.js:67-72`). No hay volumen general ni "silenciar al perder el foco". |
| V-Sync / limitador de FPS | **FALTA** | `requestAnimationFrame` sin tope (`js/core/loop.js:12-47`); en monitores de 144/240 Hz corre a esa tasa. Hay resolución adaptable (`canvas.js:51-63`) pero no opción de calidad ni de FPS. |
| Remapeo de teclas | HECHO (teclado) | Dos esquemas (Clásico / MOBA) y reasignación por acción (`js/core/input-desk.js:36-55`, `js/core/controls-panel.js`, `js/core/prefs.js:23`). El mando **no** se remapea. |
| Mando en partida y en menús | HECHO en código, NO VERIFICADO con mando físico | Perfiles estándar / PlayStation sin mapeo / genérico, zona muerta y vibración (`input-desk.js:384-396,460`); navegación espacial de menús (`js/core/pad-nav.js`). Pendiente declarado en `NEXT_SESSION.md:60`. |
| Avisos con los botones correctos | PARCIAL | Una sola tabla con letras de Xbox (`input-desk.js:534` `PAD_HINTS`): con DualSense se sigue mostrando A/B/X/Y. Con teclado sí muestra las teclas. |
| Restos táctiles en PC | **FALTA** | Con teclado (`body.inp-kb`) el joystick virtual sigue dibujado abajo a la izquierda (`shots/f7-play-1280x720.png`). Textos: "Tocá para continuar", "Tocá uno", "Girá tu dispositivo" (`index.html:88-92`), "El progreso se guarda en este navegador" (`index.html:309`), "Tamaño/Opacidad de los controles" y "Modo zurdo" (`index.html:301-305`). |
| Steam Deck (1280×800, solo mando) | NO VERIFICADO | A 1280×800 el canvas y el HUD se ven bien en captura (14,4 px supera el mínimo de 9 px de Valve). Riesgos: campos de texto (nombre, usuario, código de sala) necesitan teclado en pantalla; la pantalla de cuenta en cada arranque; rendimiento sin medir. |

### 4. Guardado

| Ítem | Estado | Evidencia |
|---|---|---|
| Guardado local | HECHO (`localStorage`) | Clave `laHordaSave_v1` (`js/storage/save.js:12`), escritura como mucho cada 1,5 s en partida (`save.js:488-517`). Opciones en `horda_prefs`, `horda_vol`, `horda_mute`, `horda_motion`, `horda_fx`, `horda_name`. |
| Exportar / importar | HECHO | "Copiar código de guardado" / "Restaurar con código" (`index.html:313-314`, `js/storage/save-code.js`). |
| Guardado en archivo (para Steam Cloud) | **FALTA** | Todo vive en `localStorage`. En Electron queda en `%APPDATA%/La Horda/Local Storage/leveldb`: sobrevive a las actualizaciones de Steam, pero no viaja entre PC y Steam Deck y Auto-Cloud no puede sincronizar LevelDB de forma fiable. |
| Nube propia | HECHO pero fuera de foco | `js/net/account.js` (`/api/save`), requiere cuenta del servidor propio. |

Riesgos en el contenedor: (1) si cambia el origen (puerto, esquema o host) el guardado "desaparece"; (2) el límite de `localStorage` (~5–10 MB) frente a un guardado con inventarios de más de 30 guardianes, tamaño real sin medir; (3) dos fuentes de verdad (nube propia y Steam Cloud) si más adelante se activan las cuentas.

### 5. Integración Steam mínima

| Ítem | Estado | Evidencia |
|---|---|---|
| Logros | PARCIAL (internos sí, Steam no) | **60 logros internos** con id estable, nombre y descripción en `ACHIEVEMENTS` (`js/data/quests.js:42-219`, p. ej. `c_first_win`, `c_arenas_all`). El desbloqueo pasa por un único punto (`js/systems/quests.js:285-292`): mapeo 1:1 con una línea de enganche. Las metas se pueden calcular en Steamworks como logros simples. |
| Overlay | **FALTA / NO VERIFICADO** | Depende del contenedor (Electron necesita interruptores de GPU; ver borrador). |
| Rich presence | **FALTA** | Hay un punto natural: `setState()` ya avisa a `fondalTvOnState` y a la telemetría (`js/ui/screens.js`). |
| Nombre del jugador desde Steam | **FALTA** | Hoy `horda_name` y el campo "Tu nombre" (`index.html:278`). |
| Compras (solo relevamiento) | **FALTA: flujo web no permitido dentro del cliente** | Ver lista abajo. |

Partes del flujo de Brasas/tienda que apuntan a pagos web:

- `js/systems/premium.js:271-280` (`premiumCheckout`): `POST /api/wallet/checkout` al servidor propio, que devuelve un enlace de pasarela.
- `js/ui/shop-ui.js:581`: `window.location.assign(r.redirect)` — **saca al jugador a la pasarela web** (Mercado Pago, `server/payments.js:10-27`).
- Precios en dinero real mostrados en el cliente: `premiumPriceLabel` (`premium.js:261-264`, US$ / AR$ / €) desde `server/premium-packs.json` (US$ 4,99 a 6,99 y más).
- Todo el saldo y las compras con Brasas exigen **cuenta propia** (`premium.js:73,148,187,229,239`); sin sesión la tienda dice "Iniciá sesión para comprar Brasas".
- Pase de batalla: mismo requisito de sesión (`js/ui/battlepass-ui.js`, `server/battlepass.js`).
- Enlaces de Términos y **Reembolsos** propios junto a la compra (`js/ui/legal.js:33`): en Steam los reembolsos los gestiona Valve.

### 6. Contenido que no debe viajar o puede trabar la revisión

| Ítem | Estado | Evidencia |
|---|---|---|
| `?dev=1` (nivel 90, todo abierto) | PARCIAL | Limitado a hosts privados (`js/storage/save.js:122-133`). Con `app://lahorda/` queda apagado; con localhost quedaría **encendible**. `PLAYTEST_UNLOCK_ALL` se consulta en `js/systems/endless.js:64` y `js/arenas/arena-rules.js:37`. |
| Otros parámetros de prueba | **FALTA quitarlos del build** | `?devxp=` (XP ×20, `js/systems/progression.js:16`), `?server=` y `?api=` (`net-core.js:122`, `account.js`), `?debug=1` (panel B1, `js/net/net-debug.js:44-47`, botón en `index.html:96`), `?res=`, `?teleSdk=`, `?beta=`, 7 parámetros `mother*` (`js/arenas/micelial/mic-render.js`). En el contenedor el jugador no escribe la URL, pero el código viaja. |
| Panel de GM / administración | PARCIAL | `js/ui/admin.js`, `js/ui/admin-users.js`, `js/systems/test-lab.js` (`index.html:1209-1211`), ruta `#game-master`; el acceso lo decide el servidor (`admin.js:136-137`), pero el código y `css/game-master.css` viajan al cliente. |
| Textos alpha / beta / borrador | **FALTA** | "LA HORDA — ALFA COOPERATIVA" (`index.html:186`), etiquetas ALPHA en Guerra de Cristales y Coliseo (`index.html:459,463,520`), "BORRADOR" junto a los enlaces legales (`js/data/legal-config.js:13` `draft:true`), "Soporte: correo sin configurar" (`legal-config.js:16` `supportEmail:""`), `alpha:"02"` en la telemetría. |
| Enlaces a instaladores web | **FALTA quitarlos** | "Instalar en mi dispositivo" → `instalar.html` (`index.html:179`); `manifest.webmanifest`; `sw.js`. Metadatos "gratis… en el celular… sin instalar nada" (`index.html:6-19`). |
| Promesa pública | Decisión del dueño | "El primer jugador en completar el juego puede pedir un campeón con diseño propio" (`index.html:451`). |
| Fondal TV en el flujo de PC | **Aparece** (no se toca) | Botón "Jugar en la tele" en el menú "⋯" del hub (`index.html:202`) porque Chromium de escritorio soporta `captureStream`; baja `https://fondalstudios.com/tv/fondal-tv.js` a los 8 s. Es **código remoto ejecutado dentro del cliente**: conviene que el dueño lo sepa para la revisión de Steam. Sin red falla en silencio. |
| Modo LAN | Revisar | "JUGAR EN RED LOCAL" (`index.html:454-456`) describe celulares que entran por navegador a la compu anfitriona y depende de `tools/lan/host.js` + Node, que no viajan en el paquete. En el build de Steam el botón no funcionaría tal cual. |
| Licencia de fuentes | **FALTA** | `assets/fonts/press-start-2p-latin.woff2` y `vt323-latin.woff2` son SIL OFL: la licencia exige incluir su texto y no hay ningún `OFL.txt` en el repo. |
| Licencia de audio | HECHO | 156 MP3 de OpenGameArt, todos CC0, con origen por archivo (`assets/audio/CREDITS.md`, `assets/audio/manifest.json`); música de archivo y sintetizada (`legal/MUSIC_CREDITS.md`). |
| Pantalla de créditos dentro del juego | NO VERIFICADO | No encontré una pantalla de créditos; los créditos están en archivos `.md`. |
| Arte generado con IA (Steam exige declararlo) | **FALTA declarar** | Ver lista abajo. |

Arte generado con IA según `docs/beta-release/ART_CREDITS.md` (Runway `gen4_image`; 90 recibos en `art-source/runway-*/**/receipt.json`):

- **Arenas**: texturas de Ciudad Maldita (techos de pizarra y teja, pared de madera y piedra), casa piloto, estatua central y farol; suelos de Fortaleza (planchas de hierro, adoquín) y rejilla de lava; pisos de Laberinto, Infernal y Acuática; decal central de Infernal (pentagrama), Acuática (templo) y Laberinto (medallón). El piso de Abismo fue rechazado y no se integró.
- **Guardianes**: Libertador (hoja de referencia, poses de ataque, caminata, caballo, caída), Profeta (repintado completo), Coloso de Ilkan (todas las poses y la transformación), Myla (caída), Saelis (caída).
- **Otros recibos**: `runway-hud/arcano_ring` y `arcano_ult`, `runway-enemies/hielo`, `entregas/quality-item-icons-20261020`.
- **Antecedente más amplio**: `docs/art-brief/00_ESPECIFICACION_TECNICA.md:539` dice que el repo no tiene política escrita y que su historial usa hojas generadas con ChatGPT (`SPRITE_PRODUCTION_LIST.md`). Las láminas del "Códice" son la referencia de casi todo el arte: **su origen (IA o a mano) lo tiene que confirmar el dueño**; no lo pude determinar desde el repo.
- Sin IA en tiempo de ejecución: no hay generación en vivo, solo contenido pregenerado.

---

## (b) Implementable YA en el código del juego (sin Steamworks ni decisiones del dueño)

Ordenado por impacto. Todo detrás de una bandera `window.HORDA_DESKTOP` (hoy no existe; el precedente es `window.__HORDA_LAN__`, `js/net/net-core.js:107-116`, que ya apaga cuentas y relay), para no cambiar la versión web.

1. **Modo escritorio sin cuenta ni red al arrancar.** `js/net/account.js:868` (`accountGate`): devolver `false` en escritorio. `js/net/net-core.js:148`: no llamar a `netWarmup`. `js/net/alpha-services.js:15`: `enabled()` falso en escritorio, o telemetría por consentimiento explícito. `js/net/alpha-services.js:259`: no llamar a `refreshWorld()`.
2. **Salir al escritorio.** Botón nuevo junto a `#mainmenu-back-btn` (`index.html:207`) y en la pausa junto a `#quit-btn` (`index.html:691`), visible solo en escritorio, con confirmación (`gameConfirm`) y `persistNow()` antes de `HORDA_DESKTOP.quit()`.
3. **Pantalla completa y ventana.** `js/core/fullscreen.js:20`: hoy excluye escritorio. Agregar una fila "Pantalla: completa / ventana" en Opciones (`index.html:287`, sección "Accesibilidad y pantalla") guardada en `PREFS` (`js/core/prefs.js:28`), y F11 / Alt+Enter en el `keydown` de `js/core/input-desk.js:241`. `canvas.js:93` ya reajusta en `fullscreenchange`.
4. **Pausa al perder el foco.** `js/core/input.js:275`: sumar `window.addEventListener("blur", …)` con la misma condición (`state==="playing" && !netMatch`), más una opción "Pausar al perder el foco" y silenciar el audio (`masterGain`, `js/audio/audio.js:261`) mientras no hay foco.
5. **Ocultar restos táctiles con teclado o mando.** `css/controls.css:21`: `body.inp-kb #joyzone, body.inp-pad #joyzone, … #aim-pad { display:none }`. Ocultar en escritorio las filas "Modo zurdo", "Tamaño" y "Opacidad de los controles" (`index.html:301-305`) y `#rotate-overlay` (`index.html:88`). Cambiar "Tocá para continuar" / "Tocá uno" por texto neutro según `DESK.device`, y `index.html:309` por "El progreso se guarda en este equipo".
6. **Quitar del build de escritorio lo web.** `index.html:179` (enlace a `instalar.html`), `index.html:25` (manifest), `index.html:719` (`sw-register.js`), `index.html:6-19` (metadatos "gratis / celular"), `index.html:96` (`#net-debug-btn`). El borrador `stage.mjs` lo hace por reescritura; es mejor una condición en el propio juego.
7. **Etiquetas de versión.** `index.html:186` ("ALFA COOPERATIVA") → versión real del build; `index.html:459,463,520` (ALPHA): ya existe `js/beta/beta-scope.js:12` (`__BETA_PUBLIC__`) para ocultar esos modos.
8. **Botones de PlayStation.** `js/core/input-desk.js:534` (`PAD_HINTS`): segunda tabla (✕ ○ □ △, L1/R1/L2/R2, Options) cuando el id del mando coincide con el patrón de `:395`. Hoy esa detección solo ocurre si el mando no viene con mapeo estándar; hay que evaluar `g.id` también en `mapping==="standard"`. Lo mismo en la tabla de `js/core/controls-panel.js`.
9. **Limitador de FPS.** `js/core/loop.js:12-15`: saltar el cuadro si `t-lastTime` es menor que el intervalo elegido; opción "FPS: 60 / 120 / sin límite" en Opciones.
10. **Escala de interfaz para 1440p y ultrawide.** No hay variable de escala. Menor riesgo: opción "Tamaño de la interfaz" que aplique `zoom` de CSS a `.screen`, `#hud` y `.ui-modal` según `innerHeight/720` (tope 2). **Requiere revisión del área de UI**: `pad-nav.js` y los "+" de habilidades miden con `getBoundingClientRect`.
11. **Salas abiertas sin red.** `js/net/net-rooms.js:71`: si `navigator.onLine===false` o el primer intento falló, mostrar "Sin conexión" de inmediato en lugar de "Buscando salas…" / "Despertando el servidor".
12. **Enganche de logros.** `js/systems/quests.js:285-292`: tras otorgar un logro, `window.HORDA_DESKTOP?.unlockAchievement(a.id)`. Inocuo en web; listo para cuando exista el AppID. Mismo criterio para rich presence en `setState()`.
13. **Parámetros de prueba.** En escritorio ignorar `?devxp`, `?server`, `?api`, `?debug`, `?teleSdk`, `mother*` (`js/systems/progression.js:16`, `js/net/net-core.js:122`, `js/net/net-debug.js:44`). No cargar `js/ui/admin.js`, `js/ui/admin-users.js` ni `js/systems/test-lab.js` (`index.html:1209-1211`) en ese build, previa verificación de que nada más los referencia sin `typeof`.
14. **Licencias.** Agregar `assets/fonts/OFL.txt` (Press Start 2P y VT323) y una pantalla o sección de créditos que muestre `assets/audio/CREDITS.md`.
15. **Guardado en archivo.** `js/storage/save.js:505`: además de `localStorage`, llamar a un escritor del contenedor. El borrador lo resuelve sin tocar el juego interceptando `setItem`, pero la **lectura al arrancar** necesita que `loadSave()` espere al disco: eso sí requiere un cambio chico en el arranque (`main.js` → `loadSave`).

---

## (c) Requiere al dueño

- **Steamworks**: cuenta de socio (tarifa de US$ 100 por app), datos fiscales y bancarios, **AppID** y DepotIDs, nombre legal del editor.
- **Modelo comercial**: gratuito con compras o de pago; precio y regiones. Si hay Brasas en Steam, deben venderse por microtransacciones de Steam (o no venderse dentro del cliente): decide qué pasa con Mercado Pago, con el Pack de bienvenida (ya abierto en `NEXT_SESSION.md:16,28`) y con el pase de batalla.
- **Cuenta propia frente a identidad de Steam**: si el juego de Steam exige o no la cuenta de Fondal; hoy tienda y pase la requieren.
- **Legales**: `js/data/legal-config.js` está en `draft:true`, sin correo de soporte ni de privacidad, edad mínima provisoria (13). Faltan EULA o Términos para Steam, política de privacidad acorde a la telemetría (hoy activa por defecto), y revisar la página de Reembolsos propia.
- **Clasificación por edad** y cuestionario de contenido de Steam (violencia fantástica, compras, chat global y salas: contenido generado por usuarios → moderación y reporte).
- **Declaración de IA**: confirmar el origen de las láminas del Códice y del arte histórico (ChatGPT) y redactar la declaración de contenido pregenerado.
- **Fondal TV en PC**: se conserva (decisión tomada); decidir si en Steam se muestra el botón y si se acepta cargar un script remoto en el cliente.
- **Modos visibles**: Guerra de Cristales y Coliseo siguen etiquetados ALPHA (decisión abierta en `NEXT_SESSION.md:28`).
- **Promesa del "primer jugador en completar el juego"** (`index.html:451`): mantenerla o quitarla.
- **Plataformas**: macOS exige cuenta de Apple Developer, firma y notarización; Windows conviene firmarlo (SmartScreen); Steam Deck exige pasar la revisión de compatibilidad.
- **Material de tienda**: cápsulas, capturas, tráiler, descripción, idiomas declarados (el juego tiene ES / EN / PT; hay textos nuevos solo en español, `NEXT_SESSION.md:29`).
- **Identificador y marca**: `appId` del paquete (`com.fondalstudios.lahorda` es una suposición), razón social para el copyright.

---

## (d) Borrador del contenedor de escritorio

Carpeta: `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/steam/desktop/` (nada escrito en el repo; sin dependencias instaladas; solo `node --check`).

**Opción recomendada: Electron**, con el juego servido por un protocolo propio `app://lahorda/`.

- **Por qué Electron**: es el mismo motor (Chromium) con el que el juego se prueba hoy, idéntico en Windows, Linux/Steam Deck y macOS. Cientos de `<script>` clásicos con globals, `localStorage`, WebAudio, Gamepad API y Fullscreen funcionan sin tocar el juego. Tauri usa el WebView del sistema (WebView2, WebKitGTK en Linux/Deck, WKWebView en macOS): tres motores distintos, con Gamepad API y rendimiento de canvas dudosos en WebKitGTK. NW.js sirve, pero con menos herramientas de empaquetado y de Steam. Capacitor es para móvil.
- **Por qué `app://` y no `file://` ni localhost**: medido arriba (fuentes, audio y `getImageData` rotos en `file://`; guardado perdido con puerto variable; `?dev=1` habilitado en localhost). Con host `lahorda`, `laHordaPrivateHost` da falso y `netLanPage` no se activa.
- **Costo**: ~250 MB extra por plataforma y ~150 MB de RAM base.

Archivos del borrador:

| Archivo | Contenido |
|---|---|
| `desktop/package.json` | electron, electron-builder, steamworks.js; atajos `start`, `dist:win`, `dist:linux`, `dist:mac`. |
| `desktop/main.js` | Protocolo `app://lahorda/` encerrado en `game/`; ventana en pantalla completa con F11 / Alt+Enter; bloqueo de navegación externa (enlaces `https:` y `mailto:` al navegador del sistema); IPC de guardado en disco (escritura atómica y `.bak`); Steam (logros, rich presence, overlay); salir; instancia única. |
| `desktop/preload.js` | `window.HORDA_DESKTOP` (`quit`, `setFullscreen`, `unlockAchievement`, `setPresence`, `steamInfo`); espejo de `localStorage` a disco; eventos `lahorda-blur` / `lahorda-focus`. |
| `desktop/stage.mjs` | Copia podada a `desktop/game/` y reescrituras de `index.html`. |
| `desktop/electron-builder.yml` | Salida en carpeta (`dir`) para Win x64, Linux x64 y macOS universal; `asarUnpack` de steamworks.js. |
| `desktop/steam_appid.txt` | `480` = AppID de prueba de Valve; reemplazar. Solo desarrollo, no va al depot. |
| `desktop/LEEME.md` | Tabla de archivos y pendientes. |

Faltan por crear cuando haya datos reales: `build/icon.ico|png|icns`, `licenses/`, `steam/app_build.vdf` y `depot_build_*.vdf`.

**Exclusiones del paquete** (no viajan): `server/`, `tools/`, `docs/` (821 MB), `art-source/` (1,5 GB), `reviews/`, `contracts/`, `deploy/`, `tests/`, `.github/`, `.claude/`, todos los `.md` de la raíz, `lan.bat`, `lan.sh`, `render.yaml`, `package.json` de la raíz, `instalar.html`, `crystal-wars.html` (solo redirige), `manifest.webmanifest`, `sw.js`, `assets/og/`. Candidatos tras verificar: PNG con gemelo WebP (~176 MB), `js/ui/admin*.js`, `js/systems/test-lab.js`, `js/net/net-debug.js`, `js/net/fondal-telemetry.js`.

**Steam Cloud**: Auto-Cloud sobre `userData/saves/*.json` (raíz `WinAppDataRoaming`, y las equivalentes de Linux y macOS con la misma subcarpeta), sin código de Steam. Pendiente de diseño: el orden de carga (disco antes de `loadSave()`) y la resolución de conflictos; el juego ya tiene una pantalla de conflicto para la nube de cuentas (`js/net/account.js:467`).

**Sin verificar en el borrador**: overlay de Steam sobre Electron (interruptores `in-process-gpu` y `disable-direct-composition`), compatibilidad de la versión de steamworks.js con la de Electron, Steam Input y mando en Deck, rendimiento en Deck, firma de Windows y notarización de macOS.
