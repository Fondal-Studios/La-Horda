# Fase 1 del cierre: jugabilidad (2026-11-15)

Rama local `cierre-fase1` (desde `76437c9a`). Sin push, sin PR, sin Runway, sin secretos. No se tocó ningún valor de balance (`tierMods`, estadísticas, kits), ninguna referencia de balance ni ningún gate/prueba existente (solo se **añadieron** dos pruebas y dos opciones del arnés de bots).

> **Todo lo medido acá sale de bots (`tools/playtest/autopilot.js`, `victory-sim.js`) y de pruebas con Chromium headless (Playwright, render por software).** No hay jugadores humanos, ni red real (solo `127.0.0.x`), ni teléfonos/tablets/mandos reales, ni sonido, ni arte percibido. Un PASS acá no mide diversión ni comprensión. La máquina era compartida con otro agente (promedio de carga 25-43 en 4 núcleos durante toda la sesión): todo lo lento se acotó y una prueba con esperas fijas falló por eso una vez (ver 5).

Convención: **EV** = evidencia medida en esta sesión (comando y salida abajo); **CITADO** = medido antes por otra sesión y reutilizado sin repetir (fuente indicada); **no probado** = con motivo.

## 1. Matriz modo × comprobación

### 1.1 Campaña: las 10 arenas

Fuente principal CITADA: `docs/beta-release/SIMULACION_ALFA_30.md` §2 (80 partidas de arena + 30 perfiles + 46 campeones = 156 partidas completas del nivel 1 al jefe, `tools/playtest/campaign.js`, el jugador recibe daño real, **0 errores de página**) y `STATUS.md` (Carcelero del Abismo arreglado). EV propia: jefes (`boss-validator`), cadena de desbloqueo y victoria (`t_campaign`), derrota (`t_defeat_clear`, `t_run_end`), punto de control (`t_checkpoint`).

| Arena | Inicia y juega | Jefe | Victoria (Normal, 4 roles) | Derrota | Recompensa | Transición a la siguiente |
|---|---|---|---|---|---|---|
| 01 ciudad | CITADO 4/4 llegan al nivel 10 | EV 4 jefes PASS (2 PASS*) | CITADO 4/4, 550 s, oro 1994 | EV `t_defeat_clear` 10 PASS | CITADO oro/XP por victoria (+10-12 niveles) | EV `t_campaign` ciudad -> 02 Fábrica (banner y `open`) |
| 02 fortaleza | CITADO | EV 2 PASS | CITADO 3/4, 583 s | idem | CITADO oro 1931 | EV `t_campaign` -> 03 (ver 5: flake) |
| 03 bosque | CITADO | EV 2 PASS | CITADO 4/4, 424 s | idem | CITADO oro 2804 | EV cadena |
| 04 micelial | CITADO; **ver 2.a** | EV 2 PASS (Madre Espora PASS*) | CITADO 3/4, 461 s | idem | CITADO oro 2191 | EV cadena |
| 05 hielo | CITADO | EV 3 PASS (Ángel Caído PASS*) | CITADO 4/4, 468 s | idem | CITADO oro 2989 | EV cadena |
| 06 acuática | CITADO | EV 2 PASS | CITADO 4/4, 585 s | idem | CITADO oro 2954 | EV `t_campaign` acuática -> laberinto |
| 07 laberinto | CITADO | EV 2 PASS (Minotauro PASS*) | CITADO 3/4, 412 s | idem | CITADO oro 3292 | EV cadena |
| 08 abismo | CITADO; el nivel 9 se atascaba (Carcelero), **arreglado** (`STATUS.md`, `t_abismo.js`) | EV 2 PASS | CITADO 2/4 **antes del arreglo** (4 de 8 sin terminar); no se repitió después | idem | CITADO oro 1869 | EV cadena abismo -> minas |
| 09 minas | CITADO | EV 2 PASS | CITADO 4/4, 494 s | idem | CITADO oro 2259 | EV cadena minas -> infernal |
| 10 infernal | CITADO (pico 77 enemigos, 24 FPS en software: el peor) | EV 6 jefes PASS (Golem de Cuerpos y Demonio Mayor PASS*) | CITADO 4/4, 432 s | idem | CITADO oro 4500 | EV `t_campaign` infernal -> abre Divina |

Comandos y salidas EV:

```
PLAYWRIGHT_MODULE=/opt/node22/lib/node_modules/playwright node tools/bible/boss-validator.js --strict
  -> 28 jefes en 11 arenas: 20 PASS, 8 PASS* (aviso de «forma posterior no alcanzada en la ventana», cubierta por t_boss_arena_hooks.js), 0 FAIL, "page errors: 0"
node tools/quality/run-all.js --jobs 2 --retry 0 --only tools/items/t_campaign.js ...   (18 pruebas, ver 6)
  -> t_campaign: 29 PASS + 1 FAIL en la corrida bajo carga 40 (VICTORIA.fabrica_abre_ruinas_03: el banner aún decía «02 — Fábrica»; `next` y `open` correctos);
     reintento solo del archivo: 30 PASS, 0 FAIL (OK)
t_defeat_clear 10 PASS · t_run_end 3 PASS · t_checkpoint 33 PASS · t_boss_assist 24 PASS · t_story 37 PASS
```

Límite: la victoria/derrota por arena sale de bots con equipo `lootPath=1`; no mide cómo lo vive un humano. «Recompensa» = oro/XP medidos con el piloto, no la economía percibida.

### 1.2 Otros modos

| Modo | Inicia | Juega | Fin / victoria | Evidencia |
|---|---|---|---|---|
| **Horda Infinita** (rondas, reliquias, fin) | EV desde la Sala | EV rondas 1-10, subjefe en la 5, jefe en la 10, mutadores, rescate | EV pantalla de resultados, récord, «una más», abandonar sin castigo | `t_endless.js` 30 PASS (73 s). Reliquias: `tools/ux/test-horde-relics.js` 47 PASS en el reintento (ver 5: la 1.ª corrida bajo carga falló 2 comprobaciones de espera de 150 ms) |
| **Coliseo** (torneo completo) | EV hub -> Coliseo -> campeón | EV torneo con HUD real, marcador, espectador | CITADO 2 torneos terminados, 158 s de media, 0 errores (`victory-sim.js col 2 600`, SIMULACION_ALFA_30 §2); EV flujo hasta resultado/revancha/volver al hub | `tools/coliseum/flow.js` PASS 844x390 y 667x375; `lanes/test-sides.js` no se corrió acá |
| **Guerra de Cristales** | EV hub -> sala -> entrenar | EV HUD, suministros, compra | **EV: SÍ hay condición alcanzable.** Cristal caído = fin (`lanes-core.js:253`) y tiempo máximo 1 080 s (`LANES.TIME_LIMIT_MS`, `lanes-data.js:26`; `lanes-core.js:380-382`, gana el equipo con más torres + vida del cristal). Las 2 partidas de 420 s «sin ganador» eran solo el tope corto del arnés | `lanes/flow.js` PASS x2; `crystal-wars/test-simulation.js` 19 PASS; `test-competitive.js` 8 PASS; `victory-sim.js cw 2 1200`: `"ganadores":[0,1]`, `duracion_media_s:813`, sin errores |
| **Arena Divina** (asedio 4v4) | EV: el modo real arranca (`startDivinaExploration`: 8 estructuras, 4 rivales) | EV: rivales mueren, oleadas de minions, aliados atacan estructuras (torre intermedia enemiga al 43 %) | EV por API real: castillo enemigo destruido -> «¡Castillo enemigo destruido! Seguir — Nivel 2», `divinaLevel` 1->2; castillo propio -> «Tu castillo ha caído / Reintentar — Nivel 1»; castillo protegido mientras queden torres | scripts del scratchpad (ver 2.c). **No medido**: victoria natural por daño (el piloto no empuja estructuras; con el jugador al azar la partida se perdió a los 91 s) |
| **Cooperativo LAN** (sin red real) | EV | EV 4 jugadores en Horda Infinita, se ven y se mueven entre sí, cámara común | EV reconexión del invitado y salida de la anfitriona | `node tools/lan/test-lan.js`: **74 PASS, 0 FAIL** (3 Chromium independientes 127.0.0.1/2/3); `server/test-lan.js` OK; `server/test-campaign-relay.js` PASS (WebSockets reales locales); `server/test-campaign-inbox.js` PASS. LAN solo ofrece Campaña y Horda Infinita (`menu.solo_campana_y_horda_infinita`) |

### 1.3 Transversales

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Selección de campeón -> inicio de partida; botón de comenzar visible y usable | **EV: PASS en los 5 tamaños** (ver 3) | `tools/ux/test-start-button-viewports.js` (nuevo) 67 PASS |
| Habilidades y definitivas de los 46 campeones | EV: los 46 pasan el filtro (cada habilidad se lanza en el motor real contra 10 muñecos y 3 aliados); EV: lanzadas por el piloto en partida, ver 4 | `ability-gate.js --strict`: 46 campeones, 0 nuevos que fallan, 0 page errors, canario rechazado |
| Movimiento y colisiones | EV colisiones; CITADO controles | `t_collision` 7 PASS; CITADO `q7_controls` 81 PASS (teclado, multitouch, zurdo, mando simulado) |
| Inventario y equipamiento | EV | `t_itemization` 28 PASS; `real-loot.js` + `equipBest` usados en las 156 partidas citadas |
| Progresión y talentos | EV | `test-talent-gate` 1 PASS; `t_quests` 33 PASS; XP/oro/nivel tras partida medidos en `t_reload_midrun` |
| Guardado y recuperación | EV, ver 6 | `t_save_sanitize` 40 PASS; `t_reload_midrun` (nuevo) 5 PASS; `server/test-owner-recovery.js` PASS; `t_checkpoint` 33 PASS; `server/test-campaign-inbox.js`/`test-campaign-relay.js` PASS |
| Victoria / derrota | EV | `t_run_end` 3 PASS (llega aunque caiga el lanzador), `t_defeat_clear` 10 PASS |
| Primera sesión | CITADO `q1_first_session` 69 PASS; EV `test-first-minute-taps` 30 PASS | |
| Gates | EV | `check-entry-reference`: PASS; `test-runway-pack.py`: 9946 comprobaciones OK; `qa-manifest-check`: OK |

## 2. Pendientes conocidos: veredicto

### a) Micelial Infierno con guerrero: la Madre Espora queda viva y la partida no termina

**Reproducido. No es un bloqueo del juego: es un empate mecánico de la regla del jefe contra un piloto que no corta la red, y un tope de 22 min del arnés.**

- Matriz (guerrero, Micelial, Infierno, `lvl:'arena'`=74, `equipBest`): 11 partidas con otras semillas y `lootPath` 0/1/2 (`/tmp` del scratchpad; el `lootPath` 0 cae en el nivel 1 en 17-25 s, equipo ausente = no representativo): 3 victorias (la Madre cae), 6 derrotas, **2 «playing» a los 1 320 s con la Madre viva** (al 40 % y al 6 %). Sin errores de página.
- Partida de 60 min (semilla 100, `lootPath=2`, nuevo `job.maxMin=60`, `job.trace=60`): la partida **sigue en curso a los 3 600 s**; el jugador sigue vivo (vida ~2 000/2 222) y la Madre llegó a 203 k de 619 k de vida (t=1020 s) y **volvió a 619 790 (vida máxima) en t=2700 s**, luego bajó otra vez. Nunca murió nadie: ni el jugador ni la Madre.
- Causa: `js/arenas/micelial/mic-network.js:20-21` (`regen:0.0008`) y `:52`: mientras haya núcleos micelial vivos la Madre regenera `0,08 % de su vida máxima por segundo y por núcleo` (con 2 núcleos ≈ 990 vida/s) y recibe menos daño (`shield`). El texto del juego lo avisa (`tutSay("mic_net", "Mientras sus NÚCLEOS vivan, la Madre casi no recibe daño y se regenera. Cortalos todos…")`). El piloto golpea lo más cercano y rara vez corta todos los núcleos; el DPS efectivo del guerrero en Infierno (≈430/s medidos) queda por debajo de la regeneración.
- Decisión: **no se cambia nada** (es regla de diseño y números de balance, que están fuera de alcance y los mide Fase 2). Queda para el dueño: la partida no tiene tope de tiempo en el nivel del jefe (`levelDuration: "inf"`), de modo que un jugador humano que no corte la red puede sostener el empate indefinidamente; es decisión de diseño si se quiere un tope/enfurecimiento, no un defecto reproducible de código.
- Cambio de arnés mínimo (reversible, solo `tools/playtest/campaign.js`): `job.maxMin` (tope de la partida, por omisión 22) y `job.trace` (serie `[t, vida del jefe, vida del jugador, vivo, distancia]`); sin esas opciones el comportamiento es idéntico.

### b) Guerra de Cristales: 2 partidas de 420 s sin ganador

Resuelto como límite del tope de 7 min: ver 1.2. Con 1 200 s ambas terminaron con ganador (`ganadores:[0,1]`, 813 s de media). Salida: `{"mode":"cw","games":2,"secs":1200,... "ganadores":[0,1],"duracion_media_s":813 ...}` (`node tools/bots/victory-sim.js cw 2 1200 --json`).

### c) Arena Divina

Verificado que el modo real (no el PvE contra `demonio_mayor` de la simulación citada) arranca y termina. Los dos finales reales (victoria y derrota) y la regla «castillo protegido» se comprobaron llamando a la API real (`damageDivinaStructure`) sobre una partida iniciada con `startDivinaExploration()`: **es una prueba de flujo, no de partida jugada**. Jugada natural: con el piloto la partida se perdió a los 10-11 s (el piloto carga contra el equipo rival); con el jugador inmóvil sus aliados mataron a los 4 rivales y bajaron la torre intermedia enemiga al 43 % antes de que el jugador cayera (91 s). **Victoria natural por daño: no determinada.** Además la Arena Divina está oculta en la beta pública (`js/beta/beta-scope.js:13`, `hiddenModes`). No se escribió una prueba permanente: ya existe `t_det.js` (escenarios `divina_*`) y `lanes/postgame-test.js` PASS; el flujo de fin queda en este documento.

### d) 404 de `css/ui-factory/fx/hero/{ilsa,vorn,kora}.png`

Confirmado con el juego real: al jugar con `ilsa`, `vorn` o `kora` el navegador pide el PNG y recibe 404 (una línea «Failed to load resource» en la consola, **0 errores de página**); `guerrero` (control) no da 404. El HUD tolera la falta por diseño: `js/ui-factory/hud-feedback.js:196-198` (`im.onerror` quita `data-uf-art` y se mantienen los marcos genéricos). El jugador no ve ningún error, solo no tiene el marco propio de esos 3 héroes (los otros 43 sí). **No se corrigió**: el arreglo real es arte (3 atlas de 392x132 con Runway, prohibido en esta fase); evitar el pedido con una lista fija en el código solo tapa un aviso de consola y obliga a recordar quitarla cuando llegue el arte. Pendiente de arte.

### e) `tools/balance/q4_econ.js`

Ya documentado (`STATUS.md`, «`q4_econ.js` "Target crashed"»: fuga de memoria de la herramienta con los 12 guardianes en una sola evaluación; alternativa un proceso por guardián, `docs/alfa/q4_econ_2026-11-14.json`). No se corrió ni se tocó.

## 3. Botón de comenzar: rects reales

Prueba nueva `tools/ux/test-start-button-viewports.js` (registrada en `run-all.js` y `qa-manifest.json`; pasa por `run-all`: PASS 2/2 con `t_reload_midrun`). Juego real (no HTML recortado como `test-campaign-start-layout.js`), perfil nuevo creado tocando (título -> guardián -> skin después -> saltar práctica), táctil.

Por viewport mide: la ficha de la primera partida (`#run-intro .ri-go`, «Entrar») y la Sala de la segunda partida (`#prep-start-btn`, «Comenzar partida») con el contenido arriba y al fondo: dentro del viewport, sin elemento encima (`elementFromPoint` del centro), alto/ancho >= 40 px, un toque real arranca la partida (o la ficha) y 0 errores de página.

| Viewport | «Entrar» (ficha) x,y,ancho,alto | «Comenzar» (Sala) x,y,ancho,alto | Toque arranca | Resultado |
|---|---|---|---|---|
| 844x390 | 536x42 en (154,331) | 740x52 en (52,328) | sí | PASS |
| 667x375 | 536x42 | 631x52 en (18,313) | sí | PASS |
| 932x430 | 536x42 en (198,371) | 740x52 en (96,368) | sí | PASS |
| 1280x720 | 528x42 | 740x52 en (270,658) | sí | PASS |
| 390x844 vertical táctil | El juego **no se juega en vertical por diseño**: `#rotate-overlay` (css/overlays.css:12-14) cubre toda la pantalla con «Girá tu dispositivo» y `#stage{visibility:hidden}`; no hay botón usable en vertical. La prueba comprueba que el aviso cubre el viewport y que al girar a horizontal el botón vuelve visible y usable | | | PASS |

Total 67 PASS, 0 FAIL, «TODO OK». Observación: «Entrar» de la ficha mide 42 px de alto (el umbral de la prueba es 40; la Sala da 52). Si el dueño quiere 44 px como en las guías de plataforma, es un ajuste de CSS que no se hizo.

Esto no repite lo que ya había: `test-campaign-start-layout.js` cubre 568x320, 667x375, 844x390 y 1366x768 con HTML sin scripts; faltaban 932x430, 1280x720 y 390x844 y el juego real.

## 4. Habilidades y definitivas lanzadas en partidas reales

Medición propia (script del scratchpad): para los **46** campeones, partida de la arena Bosque de 150 s de juego con el piloto (nivel 30, sin equipo), contando llamadas a `useSkill(i)` y `useUltimate()`:

- 46/46 campeones invocan su definitiva; **45/46 invocan sus 3 habilidades**; la excepción es `cazadora`, cuya habilidad 0 no fue usada por el piloto en 150 s (límite del piloto: el filtro `ability-gate` sí la lanza y pasa).
- **Límite importante:** son llamadas (intentos de lanzamiento), no lanzamientos confirmados (la definitiva figura con ~160-200 llamadas en 150 s, así que el piloto reintenta cada cuadro). Que cada habilidad tenga efecto medible y visual lo mide `ability-gate`, no este conteo. 0 errores de página en las 46 partidas.

## 5. Intermitencias vistas (no se tocó ningún umbral)

Medidas con carga 25-43 en 4 núcleos (otro agente compartiendo la máquina).

- `tools/items/t_campaign.js` `VICTORIA.fabrica_abre_ruinas_03`: 1 de 2 corridas bajo carga. El estado era correcto (`next:"bosque"`, `open` de 3 arenas); solo el texto del banner a los 2 900 s de espera aún mostraba el de la victoria anterior. Reintento sin otra carga: 30 PASS. Causa probable: espera fija de 2 900 ms contra la cola de banners (`hudBannerPush`); no investigada más.
- `tools/ux/test-horde-relics.js`: 1.ª corrida bajo carga: 2 FALLAS («Enter elige la tarjeta enfocada», «ronda 6: sin pantalla de reliquias»; la prueba espera 150 ms tras apretar Enter y el estado seguía en `buff`); 2.ª corrida: 47 PASS, TODO OK.
- Ambas se anotan acá; no se modificó ninguna prueba.

## 6. Guardado y recuperación (¿se prueba cerrar la pestaña a mitad de partida y retomar?)

- Antes: no existía una prueba de cerrar/recargar a mitad de partida. Lo que había: `t_checkpoint.js` (punto de control del nivel 5 tras perder), `t_save_sanitize.js` (guardados corruptos/viejos), `server/test-owner-recovery.js` y `server/test-campaign-inbox.js`/`test-campaign-relay.js` (recuperación de recompensas en el servidor), workflow `reward-recovery.yml` (`tools/net-test/reward-recovery.js` necesita relay; no se corrió).
- Nueva `tools/regression/t_reload_midrun.js` (registrada en `run-all.js`/manifiesto; 5 PASS): partida de 150 s (nivel 5 de la carrera, 133 oro, 873 XP) -> `pagehide` -> recarga. Resultado medido: **oro, XP, nivel y arenas ganadas quedan guardados sin castigo; la partida NO se retoma (el juego vuelve al título); sin errores de página.** Retomar a mitad de partida **no existe por diseño** (solo el punto de control del nivel 5 después de perder). Observación de diseño para el dueño: como el progreso ya se acredita durante la partida, cerrar la pestaña no aplica la penalización de derrota (decisión de diseño; no se tocó).

## 7. Qué se cambió (archivo, prueba que lo cubre)

| Cambio | Archivo | Cubre |
|---|---|---|
| Prueba nueva: botón de comenzar en 5 viewports con rects reales | `tools/ux/test-start-button-viewports.js` (nuevo) | sí misma (67 PASS); registrada en `tools/quality/run-all.js` (`T(...)` tras `test-first-minute-taps`) y `tools/quality/qa-manifest.json` |
| Prueba nueva: cierre de pestaña a mitad de partida | `tools/regression/t_reload_midrun.js` (nuevo) | sí misma (5 PASS); registrada en `run-all.js` (lista `regression`) y `qa-manifest.json` |
| Opciones del arnés de bots `job.maxMin` y `job.trace` | `tools/playtest/campaign.js` (3 líneas) | uso en 2.a; sin las opciones el comportamiento es el anterior |
| Documentación | este archivo y la sección de `STATUS.md` | |

**No se encontró ningún bloqueo real del juego que impida jugar o terminar una partida**, por lo que **no se modificó ningún archivo de juego (`js/`, `css/`, `index.html`)**. No había fallo que reproducir y «corregir con prueba que falle antes»: las pruebas nuevas son de caracterización y pasan contra el código actual.

## 8. No determinado / límites

- Victoria natural de la Arena Divina por daño (el piloto no la juega); solo flujo de fin por API.
- Coliseo y Guerra de Cristales con humanos o en red real: no. `tools/net-test/*` (relay real, e2e, capacity), `server/test-postgres.js`, pagos: no corridos (necesitan relay/BD/red real).
- Dispositivos reales (teléfonos, tablets, mando), sonido, rendimiento en hardware real: no. El rendimiento medido es SwiftShader (citado: Infernal 24 FPS software).
- Las 156 partidas de campaña son CITADAS, no repetidas; `q1_first_session` 69 PASS, `q7_controls` 81 PASS y las «~141 pruebas verdes en staging» de `tools/quality/run-all.js` son CITADAS del encargo (no verificadas acá: solo se corrieron 20 archivos de pruebas listados arriba y los gates).
- `tools/items/t_difficulty.js` (lenta) y la batería completa: no corridas (máquina compartida y cargada).
- Micelial: causa de que la Madre regenere más de lo que el guerrero daña (balance/diseño); la semilla `Math.random` del arnés no hace la partida idéntica (el host mete ruido de tiempo), por eso se informan tasas (3/6/2 de 11), no una semilla reproducible.
- Cobertura de habilidades en partida (sección 4): intentos de lanzamiento, no efectos.
- Pantalla legada `menu-screen` («Entrar a la Arena», `#start-btn`): no medida (el flujo actual es hub -> Sala/ficha).
- Sin procesos vivos ni servidores abiertos al terminar (ver el reporte final).
