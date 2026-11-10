# La Horda — checklist "listo para Steam"

Estado al 2026-11-10, rama `claude/la-horda-beta-audit-exec-mwv8x0`. Estados: **HECHO** (existe y se comprobó acá), **FALTA**
(no existe), **NO VERIFICADO** (existe pero no se pudo probar en este entorno). Guía de construcción y subida: `desktop/LEEME.md`.

> **Lo más importante:** el contenedor de escritorio (`desktop/`) está **escrito pero nunca se construyó ni se ejecutó**. No se
> instaló Electron, no hay ningún `.exe`, y nada se probó en Windows, en Linux de escritorio ni en Steam Deck. Lo único que se
> ejecutó acá es `desktop/test-stage.mjs` (Node + Chromium headless de Playwright en Linux, sin GPU). Todo lo que dependa de
> Electron, de Steam o de hardware real figura abajo como NO VERIFICADO.

## 1. Paquete

| Punto | Estado | Detalle |
|---|---|---|
| Contenedor de escritorio (Electron) | NO VERIFICADO | `desktop/main.js`, `preload.js`, `url-policy.js`, `save-mirror.js`. Pasan `node --check`. Nunca se ejecutaron dentro de Electron. |
| Origen estable del guardado (`app://lahorda/`) | NO VERIFICADO | Protocolo propio registrado en `main.js`; ni `file://` ni `localhost`. La lógica de rutas se probó con Node (sin path traversal). Falta verlo andar en Electron. |
| Ventana 1280×720 redimensionable, F11 / Alt+Enter | NO VERIFICADO | Implementado en `main.js` + `url-policy.js` (`keyAction`, probado con Node). El juego ya escala el canvas sin deformar. |
| Sin menú de aplicación, sin DevTools en producción | NO VERIFICADO | `Menu.setApplicationMenu(null)`, `devTools: !app.isPackaged`, F12 / Ctrl+Shift+I / Ctrl+R / F5 anulados en el paquete. |
| Salida limpia | NO VERIFICADO | Cerrar la ventana termina el proceso; el guardado se empuja a disco en `pagehide`. **Falta** un botón "Salir al escritorio" dentro del juego (el puente `HORDA_DESKTOP.quit()` existe; el juego no lo llama). |
| Enlaces externos al navegador del sistema | NO VERIFICADO | `https:` y `mailto:` → `shell.openExternal`; todo lo demás se niega. Clasificación probada con Node. |
| Parámetros de desarrollo imposibles de activar | HECHO (lógica) / NO VERIFICADO (en Electron) | Lista blanca `return, cw, room, mode`. `?dev=1`, `?devxp`, `?server`, `?api`, `?debug`, `?res`, `?lazy`, `?webp`, `?sw`, `?beta`, `mother*` se quitan (prueba: `desktop/test-stage.mjs`). El código de esos modos sigue dentro del paquete. |
| Sin código remoto dentro del cliente | NO VERIFICADO | Se cancelan scripts / marcos que no sean `app://lahorda/`. Consecuencia: "Jugar en la tele" no funciona en este build. |
| Staging por lista blanca | **HECHO** | `desktop/stage.mjs`: `index.html`, `css/`, `js/`, `assets/`, `legal/`. Medido: **285,6 MB, 3.979 archivos**. No viaja `art-source/`, `docs/`, `tools/`, `server/`, `tests/`, `reviews/`, `.github/`, `deploy/`, `contracts/`, `sw.js`, `manifest.webmanifest`, `instalar.html`, `assets/og/`. |
| El staging carga sin errores ni 404 | **HECHO** (en Chromium headless, por HTTP local) | `desktop/test-stage.mjs`: llega al título, pide las ~1.430 imágenes del manifiesto, 0 errores de página, 0 pedidos fallidos, y el botón del título avanza. No es Electron ni `app://`. |
| Quitar los PNG que tienen gemelo WebP (−65 MB) | **FALTA** (a propósito) | 1.310 pares. No se quitan porque hay rutas que piden el PNG aunque exista el WebP: `<img src>` escrito como HTML en tienda y Códice (miniaturas `preview.png`), `css/hud.css` (retrato del Hechicero), y el reintento de `lazy-images.js`. Hay que pasar esas rutas por el selector de WebP primero. |
| Retratos del Códice a WebP (−75 MB) | **FALTA** | 43 PNG, 84 MB. Necesita visto bueno de arte (con pérdida) y regenerar `asset-webp.js`. |
| Tamaño final de la descarga | NO VERIFICADO | 286 MB del juego + el runtime de Electron (no medido acá; suele rondar 250–300 MB sin comprimir). |
| Íconos `.ico` / `.png` del ejecutable | **FALTA** | Solo existen `assets/icons/icon-192.png` e `icon-512.png`. Depende del dueño / arte. |
| Empaquetado (`electron-builder.yml`) | NO VERIFICADO | Nunca se corrió `electron-builder`. La sintaxis YAML es válida; las claves (`extraResources`, `electronFuses`) hay que confirmarlas en la primera construcción. |
| Build de Windows | **FALTA** | No construido. |
| Build de Linux / Steam Deck | **FALTA** | No construido. Rendimiento en Deck sin medir. |
| macOS | **FALTA** (fuera de alcance) | Requiere firma y notarización de Apple. |

## 2. Guardado

| Punto | Estado | Detalle |
|---|---|---|
| Guardado local | HECHO | `localStorage`, clave `laHordaSave_v1` (ya existía). |
| El botón del título espera al guardado | **HECHO** | `js/assets/preload.js`: antes el botón se habilitaba y la cola de arte arrancaba antes de `loadSave()`; ahora esperan la señal de `main.js`. Prueba: `tools/perf/test-hud-throttle.js`. |
| Espejo a archivo para Steam Cloud | HECHO (lógica) / NO VERIFICADO (en Electron) | `desktop/save-mirror.js`: escritura atómica (temporal + fsync + rename), copia `.bak`, revisión que solo crece, nunca adopta un archivo dañado, nunca pisa un guardado local con cambios. 13 casos probados con Node. El lado de Electron (`preload.js`: lectura síncrona al arrancar, sondeo cada 2 s) no se ejecutó. |
| Steam Cloud (Auto-Cloud) configurado | **FALTA** | Depende del dueño (Steamworks). Rutas sugeridas en `desktop/LEEME.md`; confirmar la carpeta real en la máquina. |
| Conflicto entre dos máquinas | NO VERIFICADO | Gana lo local y el archivo ajeno queda apartado como `.conflict-<rev>.json`. **No hay pantalla** que le avise al jugador: falta en el juego. |
| Tamaño del guardado vs límite de `localStorage` | NO VERIFICADO | Sin medir con un perfil con los 30+ guardianes. |

## 3. Requisitos de PC (código del juego)

| Punto | Estado | Detalle |
|---|---|---|
| Pantalla completa | NO VERIFICADO | La da el contenedor (F11 / Alt+Enter). **Falta** la opción en el menú de Opciones del juego. |
| Salir al escritorio desde el juego | **FALTA** | Ver arriba. |
| Pausa al perder el foco (Alt+Tab) | **FALTA** | El contenedor emite `lahorda-blur` / `lahorda-focus`; el juego no los escucha. |
| Interfaz en 1440p y ultrawide | **FALTA** | Interfaz en px fijos (auditoría de plataforma). |
| Joystick táctil y textos "Tocá…" con teclado | **FALTA** | Restos de la versión móvil. |
| Limitador de FPS / V-Sync | **FALTA** | `requestAnimationFrame` sin tope. |
| Mando | NO VERIFICADO | Implementado en el juego; sin probar con mando físico ni Steam Input. Los avisos muestran siempre botones de Xbox. |
| Teclado remapeable, Esc pausa | HECHO | Ya existía. |
| Rendimiento con GPU real | NO VERIFICADO | Todas las medidas son en Chromium headless sin GPU. Las optimizaciones de esta fase se verificaron por conteos (escrituras al DOM, lecturas de layout, horneados), no por FPS. |

## 4. Integración con Steam

| Punto | Estado | Detalle |
|---|---|---|
| Cuenta de Steamworks, AppID, depots | **FALTA** | Depende del dueño. `desktop/steam_appid.txt.example` es una plantilla sin AppID. |
| steamcmd y script de subida | **FALTA** | Plantilla de `app_build.vdf` en `desktop/LEEME.md`; necesita AppID y DepotID reales. |
| Página de la tienda (capturas, tráiler, descripción, cápsulas) | **FALTA** | Depende del dueño. |
| Overlay de Steam | NO VERIFICADO | Interruptores de GPU incluidos solo cuando lo lanza Steam. Electron + overlay es históricamente frágil. |
| Logros | **FALTA** | 60 logros internos; el puente `HORDA_DESKTOP.unlockAchievement` existe, el juego no lo llama y los logros no están cargados en Steamworks. |
| Rich presence, nombre desde Steam | **FALTA** | Puente listo, sin uso. |
| `steamworks.js` | NO VERIFICADO | Dependencia opcional, nunca instalada. Sin ella el juego corre igual. |

## 5. Contenido y legal (depende del dueño)

| Punto | Estado | Detalle |
|---|---|---|
| Compras | **FALTA / decisión** | La tienda apunta a una pasarela web (Mercado Pago) con cuenta propia. Dentro de Steam hay que usar la cartera de Steam o quitar la tienda del build. |
| Textos legales | **FALTA** | Siguen en BORRADOR (`js/data/legal-config.js`, `draft: true`); correo de soporte vacío. |
| Declaración de arte generado con IA | **FALTA** | Steam la exige; lista en `docs/beta-release/ART_CREDITS.md`. El origen de las láminas del Códice lo tiene que confirmar el dueño. |
| Licencias de fuentes (SIL OFL) | **FALTA** | No hay `OFL.txt` en el repo para Press Start 2P ni VT323. |
| Licencia de audio | HECHO | CC0 con origen por archivo (`assets/audio/CREDITS.md`, viaja en el paquete). |
| Textos "ALFA / gratis / en tu celu / sin instalar" | **FALTA** | El staging quita los metadatos web de `index.html`, pero los textos visibles del juego siguen. |
| Modos visibles (Convergencia, Coliseo, LAN, GM) | Decisión | `stage.mjs --beta-public` los oculta; apagado por omisión. El modo LAN no funciona desde el paquete. |
| Clasificación por edades, precio, regiones | **FALTA** | Depende del dueño. |

## Orden sugerido

1. Dueño: cuenta de Steamworks, AppID, íconos, decisión sobre compras.
2. Primera construcción en Windows siguiendo `desktop/LEEME.md` y la lista de pruebas mínima de ese archivo. Corregir lo que aparezca (es esperable: nada de Electron se ejecutó todavía).
3. Juego: salir al escritorio, pausa al perder el foco, opción de pantalla completa, restos táctiles.
4. Subir a una rama privada de Steam, probar overlay, Cloud y Steam Deck.
5. Recién entonces: logros, reducción de tamaño (WebP), página de la tienda.

## Logros de Steam (hecho en el código, falta cargarlos en Steamworks)
- El juego tiene 59 logros internos (`js/data/quests.js`). Cada vez que se desbloquea uno, `js/systems/quests.js` (`questsSteamUnlock`) llama a `window.HORDA_DESKTOP.unlockAchievement(id)`; en el navegador no hace nada. El API Name es el id **en minúsculas** (`m_gradeA` → `m_gradea`).
- La lista lista para cargar en Steamworks está en `docs/steam/achievements.csv` y `.json` (se regenera con `node tools/steam/export-achievements.js`; el CI falla si quedan desactualizados).
- **Falta (del dueño)**: crear los 59 logros en el panel de Steamworks con esos API Name, nombres y descripciones, y subir sus íconos. Hasta entonces el desbloqueo no tiene efecto visible en Steam. Probado solo con una app simulada: no se probó contra Steamworks real.
