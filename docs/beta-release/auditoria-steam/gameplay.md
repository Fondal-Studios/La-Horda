# GAMEPLAY / QA — auditoría de la beta (solo lectura)

Rama `claude/la-horda-beta-audit-exec-mwv8x0`. No se editó nada del repo; `git status --short` quedó vacío.
Scripts y salidas crudas: `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/gameplay/`
(`play.js`, `scen.js`, `savetest.js`, `misc.js`, `hordeboss.js`, `levi.js`, `defcap.js`; salida en `out.log` y `batch1.log`).

## Cómo se probó (y qué NO se probó)

- Chromium headless + `tools/lib/serve.js`, `/index.html?lazy=0`, piloto `tools/balance/autopilot.js`.
  La simulación corre `update(16.67)` en bucle y llama a `render()` cada 15 cuadros (para atrapar errores de dibujo).
- "Jugador nuevo" = guardado nuevo, guardián y bots en nivel 1, sin equipo ni talentos.
- "GOD" = los héroes se rellenan de vida; sirve para ver flujo, no dificultad.
- NO probado: tiempo real a 60 fps con audio, mando/teclado físicos, cooperativo online, LAN con dos dispositivos,
  Pesadilla/Infierno, arenas 4 a 10 de la campaña completas, rondas de Horda más allá de la 13.
- Límite del piloto: no resuelve mecánicas de mapa (ver nota en el hallazgo 6). Los datos de dificultad son del piloto,
  no de personas.
- Desvío de la regla "una sola instancia": un chequeo de sintaxis mío lanzó por error una segunda partida en
  paralelo durante unos minutos (una vez). No afectó los resultados reportados.

## Resumen de lo que SÍ funciona (verificado)

- 16 partidas con piloto (Campaña: Ciudad ×8, Fortaleza ×2, Bosque ×1; Horda ×3 sin GOD y ×2 con GOD, una hasta la ronda 14
  con 1.844 bajas) más 20 rondas forzadas de jefe/subjefe: **0 errores de página, 0 errores de consola, 0 NaN/Infinity** en vida,
  daño, posición, oro, bajas y puntaje. `render()` se chequeó en 13 de las 16 partidas: 0 excepciones.
- Entidades acotadas: enemigos ≤ 94 (tope 90 + jefes), proyectiles ≤ 20, partículas ≤ 106, temporizadores ≤ 8, pociones ≤ 23,
  avisos 96 (pool fijo). Nada crece sin límite.
- Campaña completa hasta la pantalla de victoria: Ciudad (4 veces) y Fortaleza (con GOD, 12:37).
- Pausa: congela el reloj, la pausa por pestaña oculta funciona y suelta los controles apretados.
- Abandonar desde la pausa → menú → partida nueva: estado limpio (bajas 0, sin jefe, sin temporizadores).
- Horda: "Terminar" desde la pausa → resultados; **UNA MÁS** arranca limpia (ronda 1, puntaje 0, reliquias y sinergias en 0,
  contador de partidas +1 por partida); volver al menú y entrar a Campaña después no deja el modo Horda activo.
- Muerte y revivir: los bots reviven al jugador en 5,1–5,4 s; equipo caído → derrota/resultados en 0,65 s; caer todos
  durante el cierre de ronda también termina bien.
- Horda, rondas de subjefe (ronda 5) en las 10 arenas y de jefe (ronda 10) en las 6 arenas con jefe: el jefe aparece,
  la ronda avanza y la reliquia se ofrece. (Fortaleza, Acuática e Infernal no llegaron a morir dentro del tope de tiempo: ver 6.)
- Guardados raros pero con JSON válido (tipos equivocados, `champions:null`, `stash:{}`, guardado viejo sin banderas):
  cargan sin excepción y conservan nivel, oro, objeto equipado y arenas.
- Sin golpes de un toque: el golpe más grande visto fue 38 % de la vida máxima (jefe / verdugo); 0 golpes ≥ 50 %.
  Hay topes en código (`DIFF.hitCap`: 12 % común, 20 % subélite; `js/systems/difficulty.js:23`).

---

## CRÍTICO

Ninguno confirmado. El hallazgo 1 sube a CRÍTICO si se confirma en una partida LAN real y el LAN va en el build de Steam.

## ALTO

### 1. La pantalla de victoria queda trabada si el guardado no se puede escribir (LAN, guardado ilegible, disco lleno)
- **VERIFICADO.** Los tres botones de la victoria ("Continuar", "Volver a entrar", "Volver al menú") llaman primero a
  `victorySaveReady()`, que solo deja pasar si `persistNow()` devuelve `true`. `persistNow()` devuelve `undefined` en
  sesión LAN y con guardado que no cargó, y `false` con almacenamiento lleno. Resultado: aviso "No se pudo guardar el botín…"
  en cada clic y no se puede salir de la pantalla; hay que cerrar el juego.
- **Evidencia** (`misc.js`): modo normal → pasa los 4 pasos y llega a la Sala. Modos `quota`, `lan` y `corrupt` →
  `stepAfterNext:0`, estado `victory` tras los tres botones, 10 avisos, único botón visible "Continuar".
- **Alcance del caso LAN:** lo forcé poniendo `LAN.sandbox = true` en una partida en solitario. No lo probé con dos
  dispositivos reales; puede existir un retorno automático a la sala que lo esquive. Si se confirma, es CRÍTICO para el LAN:
  cada victoria de campaña en red local trabaría la pantalla.
- **Causa:** `js/ui/end-screens.js:234-241` (solo exceptúa Test Lab); `js/storage/save.js:488-505` (los `return` sin valor de Test Lab, LAN,
  Guerra de Cristales y `saveLoadFailed`); botones en `js/ui/end-screens.js:441` y `js/ui/menus.js:539-541`.
- **Arreglo:** que `victorySaveReady()` trate como "listo" los casos donde no se escribe a propósito (`lanNoPersist()`,
  `saveLoadFailed`) y, ante un fallo real de escritura, avise una vez y deje salir igual ("Salir sin guardar").
- **Decisión del dueño:** no. Sí conviene una prueba LAN real de victoria antes de publicar.

### 2. Guardado ilegible: el juego arranca como perfil nuevo, no guarda nunca más y no avisa
- **VERIFICADO.** Con `laHordaSave_v1` truncado, `null`, `[]` o `42`: el juego abre en el título como jugador nuevo
  (oro 0, nivel 1, pide elegir guardián). No hay ningún texto en pantalla; solo `console.error`. `saveLoadFailed` queda en
  `true` y `persistNow()` no escribe. **Al recargar sigue igual** (el dato roto sigue ahí), o sea para siempre.
  El jugador puede jugar horas y perder todo en cada cierre sin enterarse. Si gana una arena, cae en el hallazgo 1.
- Lo bueno: el guardado original no se pisa y queda copia en `laHordaSave_v1_noCargo`.
- **Mismo efecto** con cualquier excepción futura dentro de `_loadSaveInner` (una migración con un bug dejaría a todos sin
  guardar, en silencio). SOSPECHADO por lectura: todo el cuerpo está en un solo `try`.
- **Almacenamiento lleno** (VERIFICADO, `savetest.js` caso `quotaFull`): `persistNow()` devuelve `false`, sin aviso en
  menús ni en partida; el único aviso existe en la victoria.
- **Evidencia:** `corruptTrunc` → `failed:true, gold:0, visibleMsgs:[], writeOK:false`, `reload → failed:true`.
- **Causa:** `js/storage/save.js:306-314` (catch), `:501` (`if(saveLoadFailed) return`), `:504` (catch mudo). La única
  salida hoy es importar un código de guardado (`js/storage/save-code.js:13-18`), que el jugador no tiene por qué conocer.
- **Arreglo:** pantalla bloqueante al cargar con tres opciones: reintentar, exportar la copia `_noCargo`, o empezar de cero
  (mueve el roto a un respaldo con fecha y limpia `saveLoadFailed`). Aviso persistente si una escritura falla.
  Para Steam: guardar en archivo con escritura atómica y respaldo rotativo (lo ve el área de Steam).
- **Decisión del dueño:** no para el aviso; sí para el texto y si se ofrece "empezar de cero".

### 3. Horda: el refuerzo de armadura se apila sin tope y vuelve inmortal (el daño pasa a curar)
- **VERIFICADO** forzando la elección; la frecuencia real es una ESTIMACIÓN.
- "Piel de Brasa" suma `defBonus += 0.16`, "Baluarte" `+0.08`, la sinergia Muralla Viva `+0.06`. No hay tope y el daño se
  calcula con `(1 - defBonus)`. Con 6 elecciones el golpe cura.
- **Evidencia** (`defcap.js`, golpe de élite de 100): 0 elecciones → −88 de vida; 5 → −12; **6 (defBonus 1,02) → +1,8**;
  7 → +15,9; 8 → +30. Parado 40 s solo entre enemigos con 8 elecciones: vida 65 → **411 con vida máxima 217**; nunca bajó.
- **Alcance:** en Campaña hay 9 elecciones por arena, casi imposible. En la Horda se ofrecen 2 genéricos de 23 por ronda:
  ~17 % de rondas ofrecen armadura o Baluarte, así que el umbral llega cerca de la ronda 40 eligiéndolos siempre
  (y con 4 elecciones ya hay 70 % de reducción). Es justo el tramo donde se decide el ranking: quien llega no muere más
  y el puntaje no tiene techo.
- **Causa:** `js/systems/combat.js:326-328` (sin `Math.min` ni `Math.max(0, dmg)`), `:356` (`h.hp -= dmg` sin acotar a
  `maxHp`); `js/data/buffs.js:15,28`; `js/data/endless.js:92` (sinergia `baluarte`).
- **Otros apilables sin tope** (VERIFICADO el número): 12× "Mente Fría" deja `cdMult` en 0,069 (enfriamientos al 7 %).
- **Arreglo:** acotar la reducción total (`Math.min(0.75, defBonus)`), `dmg = Math.max(0, dmg)`, piso para `cdMult`
  (p. ej. 0,4), y que la Horda deje de ofrecer un refuerzo que ya llegó a su tope.
- **Decisión del dueño:** sí, los valores de los topes (cambia el balance de la Horda larga).

---

## MEDIO

### 4. Cerrar el juego en plena partida evita el castigo de la derrota
- **VERIFICADO.** La XP y el oro se guardan durante la partida; el castigo (perder 50 %) solo se aplica en la pantalla de
  derrota o al abandonar. Cerrar la ventana conserva todo y no cuenta derrota.
- **Evidencia** (`misc.js` M5, Fortaleza con los perdones ya gastados, 2 min de juego): cerrar y reabrir → +1157 XP y
  +200 de oro conservados, `defeatCount` 0. Misma situación abandonando desde la pausa → queda 476 de 951 XP (50 %) y
  `defeatCount` 1.
- **Causa:** `runStartXp`/`runStartGold` viven solo en memoria (`js/systems/progression.js:141-159`); no hay marca de
  "partida en curso" en el guardado.
- **Arreglo:** guardar al empezar `save.runOpen = {arena, champ, xp0, gold0}` y borrarlo al terminar; al cargar con la marca
  puesta, aplicar el mismo castigo (o el perdón) y avisar.
- **Decisión del dueño:** sí. Castigar un cierre también castiga un corte de luz o un cuelgue; la alternativa es sacar el
  castigo o hacerlo más leve.

### 5. Primera arena: los guardianes cuerpo a cuerpo no la pasan con el piloto; el nivel 9 es el muro
- **VERIFICADO con piloto** (no con personas). Jugador nuevo, Ciudad Maldita, 8 partidas:

  | Guardián | Resultado | Tiempo | Dónde |
  |---|---|---|---|
  | Mago | Victoria | 8:18 | sin caídas |
  | Cazadora | Victoria | 7:23 | sin caídas |
  | Tanque | Victoria | 11:19 | sin caídas |
  | Soporte | Victoria | 13:42 | sin caídas; el nivel 9 duró 6:06 |
  | Guerrero | Derrota | 9:01 | nivel 9, subjefes |
  | Guerrero | Derrota | 7:22 | nivel 9, al Maestro le quedaban 119 de 1907 |
  | Guerrero | Sin terminar | tope 12:00 | nivel 10, 4 en pie, jefe con 6148 de vida |
  | Musashi | Derrota | 10:07 | nivel 10, jefe con 1322 de vida |

- El nivel 9 (Maestro + Tramoyista y después la Dama) duró 103 s, 144 s, 188 s y 366 s en las victorias, contra 45 s
  nominales de nivel. Los niveles 1 a 8 pasan sin caídas en todos los casos.
- El Guerrero figura entre los 4 guardianes recomendados para empezar (`js/ui/starter-select.js:20-25`).
- Atenuantes ya existentes: la primera arena no castiga la derrota, hay punto de control en el nivel 5 y la XP ganada
  queda (el Guerrero terminó la partida perdida en nivel 10).
- **Arreglo propuesto:** bajar la vida del trío del nivel 9 en la Ciudad, o sacar al Guerrero de los recomendados, o subir
  su aguante inicial. Medir primero con 5–10 personas reales.
- **Decisión del dueño:** sí (curva de la primera hora).

### 6. Horda: las rondas de jefe y subjefe duran muy distinto según la arena que toque
- **VERIFICADO con GOD y piloto**, equipo nivel 20. La ronda normal dura 33–41 s.
  - Subjefe (ronda 5): Infernal 44 s, Laberinto 51 s, Acuática 57 s, Bosque 71 s, Fortaleza 74 s, Micelial 86 s,
    Hielo 95 s, Ciudad 133 s (3 subjefes en cadena), Abismo 299 s, **Minas > 347 s sin terminar** (Titán 13.816 de vida,
    le quedaban 3.299). La vida del subjefe va de 2.827 (Infernal) a 13.816 (Minas) en la misma ronda.
  - Jefe (ronda 10): Bosque 98 s, Hielo 239 s, Laberinto 239 s, **Infernal > 379 s** (3 formas, 28.000 de vida total),
    **Acuática > 379 s** (el Leviatán tiene 3 vidas completas, ~32.000), **Fortaleza > 6 min**.
- Leviatán (`levi.js`): con Cazadora a distancia murió a los 318 s de pelea en Campaña; con Guerrero, en 379 s solo se le
  bajó cerca de un tercio. Los bots estuvieron a menos de 150 px del jefe en el 6,5 % de las muestras y a más de 500 px en
  el 37 %: casi todo el daño lo pone el jugador.
- **Límite del piloto:** huye de todos los avisos y, en la Fortaleza, su regla de "no acercarse al borde" lo saca de la
  cámara del Caballero (el jefe quedó 20 min con la vida completa). Con esa regla desactivada la pelea avanza
  (9.722 de 17.774 a los 7 min). No es un cuelgue del juego; los tiempos reales con personas pueden ser menores.
- **Causa:** `ENDLESS_CFG.bossHpBase/bossHpPerRound` escala igual a todos (`js/data/endless.js`), pero la vida base y las
  fases de cada jefe son las de la campaña (`js/core/run.js:222-239`, 3 vidas del Leviatán).
- **Arreglo:** multiplicador por arena para la Horda (o tope de vida total por ronda), y en la Horda dar al Leviatán una
  sola barra repartida en 3 fases.
- **Decisión del dueño:** sí (ritmo del modo y justicia del ranking: el puntaje depende de la arena que toque).

### 7. Horda: el botín de cofres se pierde con el inventario lleno; la Campaña lo manda al buzón
- **SOSPECHADO por lectura; no lo vi pasar** (en mis partidas el inventario llegó a 12 de 30).
- `endlessRollItem` devuelve `null` si `stashFull()` y marca `L.full`; el cofre del jefe muestra
  "COFRE DE LA CICATRIZ (inventario lleno)". La Campaña usa `rewardOverflow` (buzón) para lo mismo.
- En la Horda el botín del piso también ocupa lugar: en una sola ronda con GOD se juntaron hasta 11 objetos.
- **Causa:** `js/systems/endless.js:352-354` y `:383-384`.
- **Arreglo:** usar `rewardOverflowPush` cuando el inventario está lleno.
- **Decisión del dueño:** no.

---

## BAJO

### 8. Cofre de jefe de la Horda atado a quien dio el último golpe
- **SOSPECHADO por lectura.** `endlessOnRoundClear` agenda el cofre con `runLater(900, …)` (`js/systems/endless.js:167`).
  `runLater` ata el temporizador a quien está lanzando una habilidad (`js/core/run.js:18`); si el jefe muere por una
  habilidad y ese héroe cae en los 900 ms siguientes, el cofre no se entrega. El propio archivo explica el problema y
  ofrece `runLaterFlow` (`js/core/run.js:19-23`).
- **Arreglo:** cambiar a `runLaterFlow` en `endless.js:167` y `:222`.

### 9. Importar un código de guardado pisa el progreso actual sin respaldo y usa `prompt()`
- **SOSPECHADO por lectura.** `applySaveCode` escribe en `localStorage` antes de validar con `loadSave()` y no guarda copia
  del guardado anterior (`js/storage/save-code.js:13-18`). Exportar/importar dependen de `prompt()` (`:25-33`), que en un
  contenedor tipo Electron no existe.
- **Arreglo:** respaldo `_antesDeImportar` antes de escribir, validar primero, y un diálogo propio (`game-dialog.js`).

### 10. La vida puede quedar por encima del máximo o mayor que 0 estando caído
- **VERIFICADO** (cosmético salvo en el caso del hallazgo 3): vida 411 con máximo 217; una Cazadora caída terminó con
  `alive:false, hp:6`. Al elegir refuerzo se suma 25 % de vida sin mirar si el jugador está caído
  (`js/ui/buff-choice.js:39`, `js/systems/endless.js:337`).
- **Arreglo:** acotar `hp` a `[0, maxHp]` en `damageHero` y saltear el relleno si `!player.alive`.

### 11. `save.victoryReceipts` crece para siempre
- **SOSPECHADO por lectura.** Cada victoria deja una entrada `{id, reviewed:true}` (~90 bytes) que nunca se borra, y el
  recibo completo si se cierra antes de revisar el botín (`js/ui/end-screens.js:207-224`, `:446`). Lento, pero el guardado
  vive en `localStorage` (límite ~5 MB) y llenarlo lleva a los hallazgos 1 y 2.
- **Arreglo:** conservar solo los últimos N (p. ej. 50) recibos revisados.

### 12. Se puede salir de la cámara del Caballero y la pelea queda en espera sin límite
- **VERIFICADO con piloto** (Horda, ronda 10 en Fortaleza): el equipo quedó a 2.600 px del jefe, el jefe no salió de su
  cámara (y = −3540) y la partida siguió 20 minutos sin cambios, con `levelDuration = 9e9`.
- No es un bloqueo: se puede volver caminando. No comprobé si la puerta se cierra detrás del equipo como dice el
  comentario de `js/arenas/fortaleza/fort-map.js:318`.
- **Arreglo:** cerrar la puerta al empezar la pelea o traer al equipo de vuelta si se aleja.

---

## Datos de dificultad (para decidir, no son defectos)

- **Horda, guardián nivel 12 sin equipo**, mutadores del mes "Jefes furiosos" + "Élites dobles":
  Mago cayó en la ronda 6 (3:35), Guerrero en la 7 (4:17), Cazadora en la 9 (6:06). La meta del Rango I es la ronda 10.
  Los tres cayeron al poco de entrar a la segunda arena. Golpe más grande: 17–38 % de la vida.
- **Fortaleza con Mago nivel 7** (nivel de entrada esperado): derrota en el nivel 9 a los 5:26.
- **Bosque con Cazadora nivel 11** (nivel de entrada esperado): derrota en el nivel 6 a los 3:13, equipo entero caído.
- **Horda con GOD (Mago):** 14 rondas en 10:31 por Ciudad → Bosque → Micelial, 97.595 puntos; la ronda 5 de la Ciudad duró
  144 s y la ronda 10 (jefe del Bosque) 72 s.
- Abandonar da los logros de primera vez (550 de oro la primera, 150 la tercera, 0 después): no es explotable en bucle.
