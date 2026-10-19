# Auditoría de `innerHTML` (datos de red y del guardado)

Alcance: los 171 usos de `innerHTML` / `insertAdjacentHTML` en `js/` (rama `claude/seguridad-guardado`).
Criterio: un uso es **riesgoso** si interpola texto que controla otra persona (nombre de jugador, sala, chat,
ranking, texto del servidor) o texto del guardado / código de guardado importado, sin pasar por un escapador.
Escapadores del repo: `guideEsc` (js/ui/champion-guide.js), `_chatEsc`, `_lbEsc`, `_roomsEsc`, `_trEsc`, `_acctEsc`,
`_fpEsc`, `_cxEsc`, `escapeHTML` (Guerra de Cristales). No hay un `esc()` global único.

Método y límite: lectura de las interpolaciones en los archivos que reciben datos de red o del guardado (`js/net/*`,
HUD de Guerra de Cristales/Coliseo, `end-screens`, `account`, `leaderboard`, `admin*`) y búsqueda de interpolaciones con
`name/user/host/text/msg` en ellos. No es un análisis automático de flujo de datos: el resto de archivos
(`ui/*`, `systems/*`) se clasificó por muestreo de su naturaleza (datos de catálogo y números). Un hallazgo nuevo allí
es posible.

## Corregidos en este cambio

| Archivo | Dato | Problema | Arreglo |
|---|---|---|---|
| `js/net/net-lobby.js` (~202) | `s.name` de cada puesto de la sala | nombre del compañero sin escapar | `guideEsc(s.name)` |
| `js/net/net-lobby.js` (~88) | nombre del anfitrión en la barra de sala | idem | `guideEsc(...)` |
| `js/arenas/lanes/lanes-hud.js`, `js/arenas/coliseum/coliseum-hud.js` | `f.text` del feed (llega del anfitrión por red e incluye nombres) | texto de red sin escapar | `guideEsc(f.text)` |
| Nombres/descripciones de objetos del guardado (`end-screens.js`, `loot-ceremony.js`, `inventory-ui.js`, `item-preview.js`...) | `it.name`, `it.desc`, `it.noun`, `it.baseName` | entran por guardado en la nube o *código de guardado* de otra persona y se dibujan con `innerHTML` | `saveSanitize` (js/storage/save-sanitize.js) quita `<` y `>` y limita el largo al cargar (`net-trade.js` ya lo hacía con lo que llega por intercambio) |
| `js/ui/menus.js` (`Oro: <b>${save.gold}</b>`), `hud.js`... | números del guardado | un `gold:"<img onerror=...>"` se dibujaba tal cual | `saveSanitize` fuerza números finitos y acotados |

Defensa en profundidad: el relay oficial ya quita `<` y `>` de nombres y chat (`clean()` en `server/relay.js`); los
arreglos de arriba cubren un servidor no oficial o malicioso y los guardados importados.

## Ya escapados (verificados leyendo el código)

- `net-chat.js` (`_chatEsc` en nombre y texto), `net-rooms.js` (`_roomsEsc` en arena y anfitrión), `net-trade.js`
  (`_trEsc` en nombres, ítems y log; además la función de saneo de ítems recibidos quita `<>"`` ` `` y claves de prototipo),
  `leaderboard.js` (`_lbEsc` en nombre, guardián y mensajes), `account.js` (`_acctEsc` en nombre/avatar; el cartel
  de bienvenida va por `textContent` vía `showNetToast`), `founder-presence.js` (`_fpEsc`), `crystal-wars/client.js`
  (`escapeHTML(h.name)`), `alpha-services.js` chat global (nodos + `textContent`), `net-debug.js` (escapa `<`),
  `quick-play.js` (solo números).
- `showBanner`, `showNetToast`, `_acctStatus`: `textContent`.
- `net-game.js:204` dibuja el nombre en el canvas (`fillText`), no HTML.

## Veredicto del resto (no se tocaron)

| Archivos | Veredicto |
|---|---|
| `ui/hud.js`, `boss-hud.js`, `buff-choice.js`, `panels-skills.js`, `panels-inventory.js`, `tactical-panel.js`, `run-intro.js`, `arena-briefing.js`, `ability-inspector.js`, `welcome-picks.js`, `starter-select.js`, `champion-select.js`, `first-minute.js` | Datos estáticos del juego (`CLASSES`, tablas de buffs) y números calculados. Aceptable mientras los números del guardado sean números: ahora lo garantiza `saveSanitize`. |
| `ui/menus.js`, `shop-ui.js`, `shop-cromas.js`, `quests-ui.js`, `end-screens.js`, `codex/*.js`, `loot-ceremony.js` | Catálogo + números del guardado; textos de objetos limpiados al cargar. Riesgo residual bajo. |
| `systems/endless.js`, `camp.js`, `alpha-training.js`, `difficulty-tiers.js`, `affixes.js`, `story.js`, `campaign-story.js`, `ground-loot.js`, `duo-roster.js`, `crystal-resonance.js` | Locales: textos propios y números. Los nombres del ranking de red se dibujan en `leaderboard.js` (escapado). |
| `ui/admin.js`, `admin-users.js` | Panel de administración: nodos con `textContent`; `founderBadgeHTML` recibe solo una clave de catálogo cerrado. `admin.js` es una línea minificada: revisada solo en sus usos de `innerHTML`. |
| `arenas/lanes/*`, `arenas/coliseum/*` (resto) | Nombres de equipo fijos y números. El feed se corrigió arriba. |

## Pendiente / recomendación

- Unificar un único escapador global (hoy hay ocho copias) y una regla de lint contra `${...}` sin escapar en `innerHTML`
  para variables de red.
- Una `Content-Security-Policy` sin `unsafe-inline` reduciría el impacto de cualquier XSS que se escape (no se tocó:
  afecta despliegue y pruebas).
- `net-lobby.js:52` pone el nombre local en `value="..."` quitando solo comillas; es dato propio (localStorage) y va
  dentro de comillas, se dejó.
