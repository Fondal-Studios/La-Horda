# Plan de pruebas del build de escritorio (Electron) — para correr en tu máquina

El contenedor (`desktop/`) **nunca se construyó ni se ejecutó dentro de Electron**: lo único probado es la lógica en Node y el
staging en Chromium headless (`desktop/test-stage.mjs`). Este plan cubre lo que falta. Marcá cada punto: ✅ pasa · ❌ falla (anotá
qué viste) · ➖ no aplica. Pasos de construcción: `desktop/LEEME.md`.

## 0. Preparar

```bash
cd desktop
npm install
node test-stage.mjs          # debe terminar en "OK: todas las comprobaciones pasan" (requiere Playwright)
node stage.mjs               # arma desktop/game/ (~152 MB)
npx electron .               # primera prueba en ventana (con DevTools)
npm run dist:win             # -> desktop/dist/win-unpacked/La Horda.exe
```
Si `npm run dist:win` falla, lo más probable son claves de `electron-builder.yml` (`extraResources`, `electronFuses`): mandame el error.

## 1. Arranque y ventana (Windows 10/11)

- [ ] Abre en 1280×720 y se puede redimensionar; el canvas escala sin deformarse.
- [ ] F11 y Alt+Enter alternan pantalla completa; la opción «Pantalla completa» de Opciones hace lo mismo.
- [ ] No hay barra de menú. F12, Ctrl+Shift+I, Ctrl+R y F5 no hacen nada en el build empaquetado.
- [ ] En el título el botón dice «Continuar» y avanza; no hay textos de «ALFA / gratis / en tu celu».
- [ ] Opciones → «Salir al escritorio» pide confirmación y cierra el proceso (Administrador de tareas: no queda ningún `La Horda.exe`).
- [ ] Cerrar con la X también termina el proceso.

## 2. Guardado

- [ ] Jugar una arena, cerrar, abrir: el progreso sigue.
- [ ] Existe `%APPDATA%/La Horda/saves/laHordaSave_v1.json` (y aparece `.bak` tras el segundo guardado).
- [ ] Cerrar a la fuerza (Administrador de tareas) en medio de una partida y reabrir: el guardado no queda corrupto.
- [ ] Borrar a mano `laHordaSave_v1.json` con el juego cerrado: al abrir, no se pierde el progreso si `localStorage` lo conserva (anotar qué pasa).
- [ ] Sin Internet: el juego arranca y se juega en solitario.

## 3. Entrada

- [ ] Solo teclado: WASD/flechas, 1-2-3, ataque, definitiva; no aparece el joystick táctil ni textos «Tocá…».
- [ ] Mando físico (Xbox y, si podés, PlayStation): menús, partida, pausa (Start); los avisos muestran los botones correctos del mando detectado.
- [ ] Alt+Tab en plena partida **en solitario**: el juego se pausa. Online no se pausa.
- [ ] Resoluciones 1080p, 1440p y ultrawide: HUD legible y botones clicables (el HUD usa `zoom` ×1,4 desde 1.700 px de ancho).

## 4. Rendimiento (con GPU real; todo lo medido hasta hoy fue headless)

- [ ] 60 FPS sostenidos en la Horda Infinita hasta la ronda ~20 (medí con el contador de FPS del overlay de Steam o con el del sistema).
- [ ] Sin tirones al cambiar de arena (carga diferida del arte).
- [ ] Memoria estable tras 30 minutos de partida (Administrador de tareas).
- [ ] Anotar: modelo de GPU, CPU, RAM, FPS mínimo/medio.

## 5. Steam (con Steam abierto y `steam_appid.txt` con tu AppID de prueba)

- [ ] El juego arranca desde Steam y el overlay (Shift+Tab) se abre sin romper el render. *Electron + overlay es históricamente frágil.*
- [ ] Desbloquear un logro jugando: aparece la notificación y figura en la cuenta (requiere haberlos cargado: `docs/steam/STEAMWORKS_GUIA.md` §2).
- [ ] Sin Steam abierto el juego corre igual (el puente falla en silencio).
- [ ] Steam Cloud: jugar en la PC A, abrir en la PC B y comprobar que baja el guardado; probar un conflicto (dos PC offline) y anotar el comportamiento.

## 6. Steam Deck / Linux

- [ ] `npm run dist:linux` en una máquina Linux x64; el ejecutable arranca (anotar el nombre real en `dist/linux-unpacked/`).
- [ ] En el Deck (modo juego): el mando funciona sin configurar, la pantalla 1280×800 se ve completa y legible, y el rendimiento es estable.
- [ ] Teclado en pantalla no es necesario para ninguna pantalla (el login de cuenta puede necesitarlo: anotar).

## 7. Seguridad básica

- [ ] En el build empaquetado, `?dev=1`, `?devxp=…`, `?server=…` en la URL no activan nada (ya probado en Node: `desktop/test-stage.mjs`; confirmar en la app real).
- [ ] Un enlace externo (legales, soporte) abre el navegador del sistema, no una ventana del juego.

## Qué mandarme

Un mensaje con los puntos ❌ (con captura o texto del error) y los datos de hardware del §4. Con eso arreglo lo que sea de código y
actualizo `docs/steam/README.md`.
