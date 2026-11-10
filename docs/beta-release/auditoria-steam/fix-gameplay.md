# GAMEPLAY — corrección de bugs de QA

Rama `claude/la-horda-beta-audit-exec-mwv8x0`. Sin git add/commit. Archivos tocados: `js/storage/save.js`,
`js/ui/end-screens.js`, `js/systems/combat.js`, `js/systems/endless.js` y la prueba nueva
`tools/regression/t_save_resilience.js`.

## Verificación real

- `node tools/regression/t_save_resilience.js` (una instancia de navegador):
  - ANTES de los arreglos: 17 fallas de 22 chequeos (`dept/fix-gameplay-before.log`).
  - DESPUÉS: 22 de 22 PASS, "TODO OK", exit 0, sin errores de página (`dept/fix-gameplay-after.log`).
- `node --check` de los 4 archivos y de la prueba: bien.
- `node tools/balance/relics_budget.js`: "TODO OK".
- Salvedad sobre el "antes": los 4 chequeos [C] de combate fallaban en parte por un defecto de mi prueba (el guardián
  de nivel 1 caía con el primer golpe). Corregí la prueba antes de la corrida final. La evidencia de "el golpe cura"
  es la de QA (`defcap.js`), no mi corrida previa. Los demás "antes" son válidos.

## Por tarea

### 1. Victoria trabada si no se puede guardar — HECHO
- `js/ui/end-screens.js`, `victorySaveReady()`: ya no devuelve `false` por el guardado. Si la sesión no escribe a
  propósito (Test Lab, LAN sandbox, Guerra de Cristales) pasa sin intentar guardar ni avisar. Si la escritura falla,
  avisa una vez por pantalla de victoria y deja seguir.
- `js/storage/save.js`: `saveNoWriteByDesign()` nueva (reúne las tres condiciones que ya estaban en `persistNow()`).
- Los tres botones pasan por `victorySaveReady()`, así que quedan arreglados sin tocar `js/ui/menus.js`.
- Sigue bloqueando un solo caso, a propósito: `netMatch.rewardPending` (el servidor guardando la recompensa del
  equipo online). No lo toqué ni lo probé.
- Prueba: [E] almacenamiento lleno → un aviso y "Continuar" sale de la victoria; [F] LAN sandbox → "Volver a entrar",
  "Volver al menú" y "Continuar" funcionan sin aviso.

### 2. Guardado ilegible / almacenamiento lleno — HECHO
- `js/storage/save.js`, catch de `_loadSaveInner()` + funciones nuevas `saveBackupUnreadable()`,
  `saveNoticeUnreadable()`, `saveNoticeWriteFailed()`, `saveNoticeWriteHandled()`, cola `_saveNoticePush/_saveNoticePump`.
- Guardado ilegible: se copia a `laHordaSave_v1_noCargo`; si ya hay un respaldo distinto, la copia nueva va a
  `laHordaSave_v1_noCargo_<fecha>` (nunca se pisa uno existente). Se muestra un aviso una vez.
- El juego vuelve a guardar recién cuando el jugador acepta el aviso (y la copia existe). Hasta ahí `saveLoadFailed`
  sigue en `true` y el original no se toca; así se respeta lo que exige `t_save_sanitize.js` (no lo corrí).
- Si no se pudo hacer la copia, no se habilita la escritura y el aviso lo dice.
- Almacenamiento lleno: `persistNow()` avisa una vez por sesión. Nunca interrumpe la pelea (espera a salir de
  `playing`/`buff`); en la victoria lo reemplaza el aviso propio de la tarea 1.
- Prueba: [A] (7 chequeos, incluye recarga sin aviso repetido y segunda rotura sin pisar el respaldo) y [B].
- No hice la pantalla de tres opciones que proponía QA (reintentar / exportar / empezar de cero): es decisión del dueño.

### 3. Armadura sin tope en la Horda — HECHO (con una interpretación a confirmar)
- `js/systems/combat.js`, `damageHero()`: constante `RUN_DEF_BONUS_CAP = 0.80` con comentario; `defBonus` acotado a
  [0, 0.80]; el daño final nunca es negativo.
- Interpretación: el tope se aplica al refuerzo apilable de la partida (`runStats.defBonus`: Piel de Brasa, Baluarte,
  Muralla Viva), que es el origen del bug y lo que QA llamó "reducción total". NO acoté el producto con defensa base,
  habilidades y pasivas: eso sí cambiaría builds actuales de Campaña (un tanque con definitiva activa ya pasa el 80 %).
  Si diseño quiere el tope sobre el producto total, es una línea más en el mismo lugar.
- Prueba [C]: con 0 %, 16 %, 48 % y 80 % el daño es idéntico a la fórmula anterior; con 96 % y 128 % queda en el 20 %
  del golpe y nunca cura.
- No toqué `cdMult` ("Mente Fría" ×12) ni que la Horda deje de ofrecer el refuerzo al tope: fuera de lo pedido.

### 4. Vida por encima del máximo — HECHO en mis archivos, PARCIAL en total
- `combat.js`, `damageHero()`: después del golpe, `hp` se acota a `maxHp`. Prueba [C].
- `endless.js` (elección de refuerzo): el relleno del 25 % solo se aplica si el jugador está en pie. Sin prueba propia.
- Falta el mismo cambio en Campaña, archivo ajeno (ver pedidos).

### 5. Cofres de la Horda con inventario lleno — CONFIRMADO y HECHO
- Confirmado en navegador: con el inventario lleno `endlessRollItem()` devolvía `null` sin crear el objeto (chequeo [D]
  del "antes": `got:false, mail:0`).
- `js/systems/endless.js`, `endlessRollItem()`: usa `addItemToInventory(..., true)`, el mismo camino de la Campaña que
  manda el excedente a `rewardOverflowPush` (buzón "Recompensas pendientes"). `endlessAwardChest()` y la pantalla de
  resultados ajustan el texto.
- Prueba [D]: el objeto queda en el buzón. No probé reclamarlo desde el menú ni el caso de invitado online.

### 6. `victoryReceipts` sin límite — HECHO
- `js/ui/end-screens.js`: `VICTORY_RECEIPTS_KEEP = 50` y `victoryReceiptsTrim()`, llamada al crear un recibo en
  `buildVictoryData()`. Borra solo marcas ya revisadas y sin botín, de la más vieja a la más nueva; nunca el recibo
  actual ni los sin revisar.
- Prueba [E]: 121 recibos → quedan el actual, el pendiente y los más nuevos; llamar de nuevo a `buildVictoryData()`
  no entrega dos veces.
- Riesgo residual, no probado: `reward-mailbox.js` usa los recibos para filtrar recompensas online sin confirmar. Si
  el servidor reofreciera una de hace más de 50 victorias, se podría cobrar otra vez.

## Textos nuevos al jugador (exactos)

1. Diálogo, título `Guardado`:
   `No pudimos leer tu guardado.` / `No se borró: quedó una copia de respaldo en este dispositivo.` /
   `Empezás con un perfil nuevo y el juego lo va a guardar normalmente.` (tres líneas, separadas por `\n`)
2. `No pudimos leer tu guardado ni hacerle una copia de respaldo.` /
   `Para no pisarlo, lo que juegues en esta sesión no se va a guardar. Liberá espacio y volvé a abrir el juego.`
3. `No se pudo guardar el progreso: el almacenamiento está lleno o bloqueado.` /
   `Podés seguir jugando, pero lo nuevo se puede perder al cerrar. Liberá espacio: el juego vuelve a intentar solo.`
4. Victoria: `No se pudo guardar el progreso de esta partida.` /
   `Podés seguir, pero el botín se puede perder al cerrar el juego.`
5. Cartel de la Horda: `COFRE DE LA CICATRIZ: <objeto> (a Recompensas pendientes)`
6. Resultados de la Horda: `Tu inventario llegó al máximo: lo que no entró quedó en Recompensas pendientes, en el menú principal.`

Textos que dejaron de usarse: `No se pudo guardar el botín. Sigue en esta sesión: liberá espacio y volvé a intentar
antes de cerrar el juego.` y `Tu inventario llegó al máximo: algunas recompensas no se pudieron guardar.`

## Cambios que pido en archivos ajenos

- `js/i18n/en.js`, `js/i18n/pt.js` (y `docs/i18n/static-strings.json` / `tools/i18n` si corresponde): agregar los 6
  textos de arriba; las claves son el texto en español. Hasta entonces salen en español en inglés y portugués.
- `js/ui/buff-choice.js` (~línea 39, Campaña): `player.hp = Math.min(...)` → anteponer `if(player.alive)`, igual que
  hice en `endless.js`. Otro programador está editando ese archivo.
- `js/net/account.js`: revisar qué pasa con una cuenta en la nube cuando el guardado local era ilegible. Después de
  aceptar el aviso, el perfil nuevo se guarda y `accountOnPersist()` lo marca para subir; no verifiqué si la
  reconciliación protege el guardado de la nube.

## Lo que NO verifiqué

- Ninguna otra suite (`t_save_sanitize.js`, `test-critical-rewards.js`, `reward-recovery.js`, i18n): las corre el integrador.
- LAN con dos dispositivos reales: probé el sandbox forzado en solitario, igual que QA.
- Victoria online con `rewardPending`, Test Lab y Guerra de Cristales.
- El aviso con el diálogo en un teléfono real, y cómo convive con la pantalla "Tu primer guardián".
- Una partida larga de Horda con el tope de armadura (solo golpes directos a `damageHero`).
- No toqué el castigo por cerrar el juego, la curva del nivel 9 ni la vida de jefes.
