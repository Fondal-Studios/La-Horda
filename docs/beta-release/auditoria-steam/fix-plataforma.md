# Corrección — Plataforma PC

Archivos tocados: `js/core/input-desk.js`, `js/core/input.js`, `js/core/fullscreen.js`, `js/core/pad-nav.js`, `js/net/account.js`, `js/net/net-rooms.js`, `js/ui/buff-choice.js`, `css/pc-desktop.css` (nuevo, ya enlazado en `index.html:84` por otro compañero) y la prueba nueva `tools/ux/test-pc-input.js`. Ningún otro archivo. Sin git add/commit.

Verificación: `node --check` en los 7 JS y `node tools/ux/test-pc-input.js` (Chromium sin pantalla táctil, 1280x720): **54 PASS, 0 FAIL, "TODO OK", exit 0**. No corrí ninguna otra suite (regresión completa pendiente del integrador).

## Estado por tarea

| # | Tarea | Estado |
|---|---|---|
| 1 | Esc vuelve atrás en menús | HECHO, con 3 excepciones (abajo) |
| 2 | Flechas mueven el foco en menús | HECHO |
| 3 | Refuerzos con 1 / 2 / 3 y Enter | HECHO |
| 4 | F11 y Alt+Enter | HECHO (sin fila en Opciones: es de index.html) |
| 5 | Pausa al perder el foco | HECHO en código; Alt+Tab real NO verificado |
| 6 | Invitado en localStorage | HECHO |
| 7 | Tope de "Buscando salas…" | HECHO (con una salvedad de texto) |
| 8 | Ocultar joystick táctil | PARCIAL a propósito: joystick sí, botonera no |
| 9 | Botones de PlayStation | HECHO en HUD y guía; falta la tabla de Controles (otro archivo) |

### 1. Esc — HECHO
- `input-desk.js`: `deskMenuBack()`, `_deskUiSig()`, `_deskKeyHandledElsewhere()` y el `keydown` principal. Esc llama a `padBack()` de `pad-nav.js` (la misma función de B del mando), sin reglas duplicadas.
- `pad-nav.js`: sumé `#menu-btn-1, #menu-btn-2` ("Volver al menú" de derrota y victoria) a `PN_BACK_SEL`. Cambia también B del mando en esas dos pantallas.
- Medido (pantalla → estado tras Esc): codex→mainmenu, shop→mainmenu, modeselect→mainmenu, arenaselect→modeselect, prep→menu, menu→arenaselect, inventory→codex, divina→arenaselect, champdetail→shop, lan→modeselect, gameover→menu. La prueba confirma que coincide con `padBack()` en cada una.
- Título: Esc no hace nada. Opciones: las cierra y nada más. Diálogo de confirmación: lo cancela (respuesta "no") y la pantalla de atrás no se mueve. En partida: pausa / continúa, como antes. Dentro de un campo de texto: suelta el campo sin volver atrás.
- Para no retroceder dos niveles cuando otra pantalla ya atiende Esc (Ranking, ¿Cómo se juega?, libro del Códice, etc.), se compara una "foto" de la interfaz tomada en fase de captura.
- **No vuelve con Esc:**
  - `crystalwars`: su botón `#back` no entra en el selector. No lo agregué porque esa pantalla tiene partida propia y Esc/B la abandonaría sin confirmación.
  - `victory` en pasos intermedios: solo existe "Continuar"; no saltea recompensas. En el último paso sí (`#menu-btn-2`), no probado.
  - Menú principal: Esc va al título (`#mainmenu-back-btn`), igual que B. La auditoría sugería abrir Opciones; no lo cambié.
- No probado: Sala online real y pantalla de Cuenta (en la prueba `screens.account` no existe hasta abrirla), resultados de Horda (`#en-back-btn` ya coincidía con el selector).

### 2. Flechas — HECHO
- `input-desk.js`: `deskMenuKey()`, `_deskKbNavPlace()`, `deskKbNavTick()` (en el bucle existente). Usan `padCandidates / padPick / padMove / padActivate` y el mismo marco `#pad-focus`.
- Primera flecha muestra el foco; las siguientes lo mueven; Enter o Espacio activan; Tab o mover el mouse devuelven el control. Al cambiar de pantalla el foco se reubica solo.
- En campos de texto ← → son del texto (medido: "abc" + ← + X = "abXc"). ↑ ↓ salen de un campo de una línea hacia el botón vecino (no probado).
- En partida las flechas siguen moviendo al guardián (medido). En la elección de refuerzo/reliquia no actúa: esas pantallas tienen sus teclas.

### 3. Refuerzos — HECHO
- `buff-choice.js`: `buffKeysRefresh()`, `_buffKeyCards()`, un `MutationObserver` sobre `#buff-cards` y un `keydown`. Decora cualquier carta de refuerzo que aparezca ahí, así que cubre campaña, Horda Infinita (`endless.js`) e invitado (`net-game.js`) sin tocar esos archivos. Las reliquias se saltean.
- Número en la esquina como en reliquias (`.buff-key` en `css/pc-desktop.css`). Va en `data-n` y lo pinta el CSS: el texto de la carta no cambia.
- 1 2 3 (fila y teclado numérico), flechas + Enter/Espacio. Protección: se ignoran teclas repetidas y los primeros 350 ms, porque 1 2 3 son habilidades y venían apretadas de la pelea.
- Probado solo en campaña en solitario. Horda Infinita e invitado no los probé.

### 4. Pantalla completa — HECHO
- `fullscreen.js`: `toggle()`, `leave()` y un `keydown` en captura. F11 y Alt+Enter entran y salen (medido las cuatro transiciones con `document.fullscreenElement`). El estado del juego no cambia.
- El camino de Android (`enter()`, orientación, `on`) quedó igual. `?fs=0` también apaga las teclas.
- Si existe `window.HORDA_DESKTOP.setFullscreen` se usa eso; no probado (no hay app de escritorio en el repo).

### 5. Pausa por foco — HECHO en código
- `input.js`: `autoPauseAway()` (regla que ya usaba `visibilitychange`: `state==="playing" && !netMatch`) y `autoPauseOnBlur()` en `window blur` y en `lahorda-blur`.
- Medido llamando a la función con un evento de ventana: pausa en solitario, no pausa con `netMatch`, no hace nada fuera de la partida.
- **No verificado: un Alt+Tab real.** Playwright no genera un `blur` confiable de ventana.
- Dos decisiones: un `blur` fabricado con `dispatchEvent` no pausa (`tools/ui-factory/eval/eval-edge.js:55` lo dispara en plena partida), y en un aparato táctil sin teclado ni mando no se usa.
- No hice "silenciar al perder el foco" ni la opción para desactivarlo.

### 6. Invitado — HECHO
- `account.js`: `_acctGuestGet()` / `_acctGuestSet()`; `_acctGuest`, `_acctSetSession` y `accountGate` los usan. Misma clave `horda_guest_tab`, ahora en localStorage (con try/catch) y sessionStorage de respaldo.
- Al iniciar sesión se borra de los dos. Quien cierra sesión o la pierde vuelve a ver la pantalla de cuenta.
- Medido: clic en "Jugar como invitado" deja `localStorage = "1"`, y con sessionStorage vacío `accountGate()` ya no muestra la pantalla.
- Aplica a todas las plataformas, no solo escritorio.

### 7. Salas abiertas — HECHO
- `net-rooms.js`: `NET_ROOMS_TIMEOUT_MS = 4000`, `NET_ROOMS_OFFLINE`, `_roomsOffline()`; cambios en `netFetchRooms`, `netRenderRoomsList` y oyentes `online` / `offline`.
- Medido: sin servidor, aviso inmediato; puerto cerrado, aviso en menos de 5,5 s; servidor que no contesta, "Buscando salas…" y a los ~4 s el aviso (antes 12 s de corte más la espera de `/health`).
- Con `navigator.onLine === false` ni se intenta. No lo pude probar tal cual: en navegador automatizado sin `?server=` el código sale antes.
- **Salvedad:** con Internet pero servidor dormido también dice "Sin conexión: podés jugar en solitario." a los 4 s. El reintento cada 6 s sigue y la lista aparece sola al despertar. El texto "Despertando el servidor… (la primera vez puede tardar hasta un minuto)" ya no se usa.
- En navegador automatizado sin `?server=` la tarjeta ahora muestra el aviso en vez de "Buscando salas…" para siempre. No encontré pruebas que dependan del texto viejo.

### 8. Controles táctiles — PARCIAL a propósito
- Clases reales: `body.inp-kb` y `body.inp-pad` (`deskSetDevice`, `input-desk.js`).
- `css/pc-desktop.css`: oculta `#joy-base` y `#joy-knob` con `visibility:hidden`. Medido: oculto con teclado y con mando, reaparece al pasar a táctil.
- Usé `visibility` y no `display:none` sobre `#joyzone` porque pruebas existentes miden esas cajas en escritorio (`t_func.js`, `test-touch-targets.js`) y el esquema MOBA usa la zona para el clic derecho.
- **No oculté la botonera (`#skillzone`).** Con teclado y mando es la única barra de recargas y la que muestra las teclas. Si la quieren más chica y centrada, es un rediseño aparte.
- Queda: arrastrar con el mouse sobre la zona izquierda sigue manejando el joystick (ahora se ve mientras dura el arrastre). Cambiarlo rompería pruebas que arrastran con mouse.

### 9. PlayStation — HECHO en HUD y guía
- `input-desk.js`: `gpIsPlayStation()`, `PAD_HINTS_PS`, `PAD_GLYPHS_PS`, `padGlyphSet()`, `padHints()`, `padGlyph(nombre)`, `_deskPadGlyphSync()`; `deskRefreshHints` y `ctlHint` los usan. Clase `body.pad-ps` disponible para CSS.
- Detecta por `gamepad.id` también con mapeo "standard". Medido con ids simulados: DualSense y DualShock muestran ✕ □ △ ○, R1, L1, L2, Options; Xbox sigue con A X Y B.
- Sin mando físico. La pantalla Opciones › Controles sigue con letras de Xbox (`controls-panel.js`, no es mío).

## Textos nuevos exactos (para traducir)
1. `Sin conexión: podés jugar en solitario.` — net-rooms.js
2. `Elegí con 1 2 3 o con clic.` — buff-choice.js (renglón aparte, solo con teclado)
3. `Mantené ✕ para pelear` — input-desk.js `ctlHint` (PlayStation)
4. `Apretá □, △ o ○ (el stick derecho apunta)` — ídem
5. `Apretá R1` — ídem
6. `Pasá por encima del botín o apretá L2` — ídem
7. Rótulos de botón (no se traducen): `✕ □ △ ○ R1 L1 L2 R3 Options`

## Cambios que pido en otros archivos
- `index.html` (Opciones › Accesibilidad y pantalla): fila "Pantalla completa" que llame a `FULLSCREEN.toggle()`; ocultar con teclado/mando las filas "Modo zurdo", "Tamaño de los controles" y "Opacidad de los controles" (líneas ~301-305).
- `js/core/controls-panel.js:11` (`CTL_PAD`) y `:63`: usar `padGlyph("A")`, etc., para que la tabla de Controles muestre símbolos de PlayStation.
- `js/systems/horde-relics.js:326`: la nota dice "…con el mando o tocando" también con teclado (hallazgo 1 de UX).
- `js/modes/crystal-wars/client.js` o su marcado: si quieren Esc/B = volver en el lobby de Guerra de Cristales, poner `data-pad-back` en `#back` solo mientras no hay partida.
- `js/i18n/*`: los textos de arriba; el de "Despertando el servidor…" quedó sin uso.
- Integrador: correr `tools/ux/test-gamepad-menus.js`, `tools/net-test/accounts.js`, `public_rooms.js`, `old_server.js` y `test-accessibility-prefs.js`; son las que tocan lo mismo que cambié y no las corrí.
