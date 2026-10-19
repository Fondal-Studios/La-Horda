# Derrota y punto de control en el nivel 5

Estado: IMPLEMENTADO (variante C, aprobada por el dueño) en `claude/checkpoint-nivel-5`, que depende de la PR #123 (`claude/derrota-clara`). La propuesta original y sus números siguen abajo; la sección "Implementado" (al final) manda sobre ella.

## Hechos verificados en el código

- Un nivel dura `22000 + runLevel*2600` ms (`js/systems/waves.js`, `beginLevel`). Niveles 1-9: 9*22000 + 2600*45 = 315 000 ms, 5,25 min, y después el jefe del nivel 10.
- Al caer, o al abandonar antes del jefe, se pierde `ARENA_FAIL_PENALTY_PCT = 0.5` de la XP y del oro ganados en esa partida, no del total (`applyArenaFailurePenalty`, `js/systems/progression.js`). La XP perdida puede bajar el nivel del guardián (`setChampFromTotalXp`), nunca por debajo del nivel con el que se entró.
- Sin perdón la partida siguiente empieza siempre en el Nivel 1 (`startRun(1)` desde Reintentar).
- Perdón actual con esta PR: primera arena en Normal, y las primeras 3 derrotas de cada arena. Antes eran las 3 primeras de la cuenta.

## Propuesta: retomar en el Nivel 5 con penalización menor

Idea: si el jugador llegó al Nivel 6 o más antes de caer, Reintentar ofrece dos botones.

| Opción | Empieza en | Lo que se pierde de esa partida | Lo que se conserva |
|---|---|---|---|
| Reintentar desde el Nivel 1 | 1 | 50 % XP y oro (como hoy) | nada extra |
| Retomar en el Nivel 5 | 5 | 50 % XP y oro (igual) | refuerzos de la incursión anterior: no |

Variante a evaluar con números (la "penalización menor" pedida): retomar en el 5 pierde menos que reintentar desde cero, porque la partida es más corta.

| Variante | Tramo a rejugar | Pérdida sobre lo ganado | Duración del tramo restante (niveles 5-9 + jefe) |
|---|---|---|---|
| Hoy (desde el 1) | niveles 1-9 + jefe | 50 % | 5,25 min + jefe |
| A: retomar en 5, pérdida 50 % | niveles 5-9 + jefe | 50 % | 22000*5 + 2600*(5+6+7+8+9)=110 000+91 000 = 201 000 ms, 3,4 min + jefe |
| B: retomar en 5, pérdida 25 % | idem | 25 % | 3,4 min + jefe |
| C: retomar en 5, el oro y la XP de los niveles 1-4 quedan pagados de antemano (0 % sobre eso), 50 % sobre lo ganado después | idem | 50 % solo del tramo 5+ | 3,4 min + jefe |

Recomendación si se decide hacerlo: variante C (más simple de explicar: "lo de antes del checkpoint es tuyo"), con tope de uso: el checkpoint solo existe si la partida anterior pasó el nivel 5, y solo una vez por partida de arena.

### Números de impacto estimados

Son cuentas sobre las duraciones de `waves.js`, no simulaciones nuevas. Falta correr `tools/playtest` y `tools/balance` con la variante antes de decidir.

- Tiempo hasta volver a intentar el jefe tras caer en el nivel 8: hoy 5,25 min; con checkpoint en 5, 3,35 min (-36 %).
- Cuántos intentos de jefe da una hora de juego (solo tiempo de niveles, sin pausas ni campamento): hoy ~11; con checkpoint ~18. Eso es un salto de ~57 % en intentos al jefe.
- Si la XP/oro por minuto es parecida en todos los niveles, retomar en 5 reduce lo que se puede ganar y perder por intento en ~35 %, así que la pérdida absoluta por derrota baja también.

### Riesgos

1. Economía: más intentos por hora significa más oro, XP y botín por hora. Hay que recalibrar contra las 360 partidas simuladas de `progression.js` (el comentario del bloque de castigo) y contra `DEFEAT_LOOT`.
2. Dificultad de arena: la progresión de armas, refuerzos y ítems del tramo 1-4 no se rehace. Los refuerzos elegidos en niveles 1-4 se pierden si no se guardan, así que el jugador llega al 5 más débil que quien llegó jugando. Guardarlos es más complejo (estado de run, multijugador).
3. Estado de partida: recuperar `runLevel`, refuerzos (`boons`), cristales, objetivos de arena y semilla del mapa. Cualquier campo no restaurado es un bug de exploit o de pérdida.
4. Cooperativo: el anfitrión decide el reinicio; el punto de control debería ser de la sala, y toca `js/net/*` y `server/*`, fuera del alcance de esta PR.
5. Exploits: caer a propósito en el nivel 9 para "congelar" XP. Mitigar con el tope de una vez por partida y manteniendo el 50 % sobre lo ganado después del checkpoint.
6. Objetivos de arena y logros que cuentan "sin morir" o "desde el Nivel 1" (`quests.js`, `goals`) pueden quedar mal definidos.
7. Mensaje: tendría que dejar de decir "Sin puntos de control". Esa línea de `end-screens.js` se actualizaría.

### Esfuerzo y pruebas

- Guardar `checkpoint = {arena, level, xpBase, goldBase}` en la partida, no en `save` persistente (sobrevive solo a Reintentar).
- Pruebas nuevas: reintento con checkpoint, cooperativo, abandono, jefes y limpieza de estado (`resetRunTransients`).
- Pruebas existentes a revisar: `tools/regression/t_run_end.js`, `tools/items/t_difficulty.js`, `tools/items/t_story.js`, `tools/items/t_camp.js`.

## Lo que sí cambia esta PR (sin tocar cuánto se pierde)

1. Pantalla de derrota: arriba, en 16 px, qué se perdió o perdonó y "Sin puntos de control"; debajo, Reintentar y Volver al menú; el resumen va al final. Nada queda bajo un botón fijo.
2. Aviso previo único por arena, cuando el perdón de esa arena se acabó: "Desde ahora, si caés en esta arena perdés la mitad de la XP y el oro ganados en la partida."
3. Perdón de las 3 primeras derrotas por arena (`save.arenaDefeats`). Guardados anteriores: `save.defeatLegacy` congela su total de derrotas y vale como punto de partida de toda arena sin registro, así que nadie recupera perdones ya gastados y las cuentas veteranas no ven el aviso.
4. Se quitó la oferta "Ver apariencias de X" de la derrota. Sigue en victoria y en la Tienda.

## Implementado: punto de control en el nivel 5 (variante C)

Código: `js/systems/checkpoint.js` (todo el comportamiento), enganches mínimos en `run.js`, `buff-choice.js`, `progression.js`, `loot.js`, `quests.js`, `end-screens.js`, `menus.js`, `input.js`, `save.js`. Prueba: `tools/regression/t_checkpoint.js`. No se tocó `js/net/*` ni `server/*`.

### Reglas

| Tema | Regla |
|---|---|
| Variante | C, la que recomienda la propuesta: lo ganado hasta el nivel 5 es tuyo; el 50 % solo cuenta sobre lo ganado después. |
| Creación | Al superar el nivel 5 (entrar al 6) en una partida que empezó en el nivel 1. Un punto por arena, `save.checkpoints[arena] = {level:5, champ, diff, uses, xp, gold}`. Pasar el 5 otra vez en una partida nueva lo reemplaza (usos a 0). Una partida reanudada nunca lo crea. |
| Efecto en el castigo | Al crearlo, la base del castigo (`runStartXp/Gold`) sube al estado de ese momento: perder o abandonar descuenta el 50 % solo de lo ganado después. Al reanudar, la base es el estado actual. El perdón por arena (3 primeras derrotas) sigue igual. |
| Oferta | Solo en la pantalla de derrota normal, solo en solitario campaña (`checkpointEligible`): no en sala/cooperativo/partida en red, Horda Infinita, Divina, Coliseo, Guerra de Cristales ni Test Lab. Mismo guardián y misma dificultad que al crearlo, arena abierta. |
| Botones | "Reanudar desde el nivel 5" (principal) y "Empezar de nuevo desde el nivel 1". Empezar de nuevo no borra el punto. Sin punto: el botón de siempre y el aviso de que se crea al superar el nivel 5. |
| Texto | Qué se conserva (nivel, XP y oro hasta el nivel 5; el jefe sigue en el 10), qué se pierde (refuerzos y mejoras de la incursión, botín de consuelo, 25 % de XP/oro al reanudar) y reanudaciones restantes. Texto 15-17 px, botones 12-14 px (844x390). |
| Reanudar pierde | Refuerzos y mejoras elegidos en los niveles 1-5 (no se guardan: riesgo 2 de la propuesta, a propósito), el botín y las gemas de consuelo de la derrota, y `CP_PAY` = 75 % de la XP y el oro de combate. |
| Límite | `CP_MAX_RESUMES` = 3 reanudaciones por punto. Después hay que volver a pasar el 5 jugando. |
| Se limpia | Al ganar la arena (`finishBossVictory`). La XP y el oro de la victoria no se descuentan. |
| No se saltea | El jefe sigue en el nivel 10 (se juegan 5-9). Desbloqueo de la arena siguiente, de la Divina y de dificultades solo ocurren en `finishBossVictory`; el punto no marca nada como superado y exige la arena abierta. |
| Logros | La XP de cuenta de la partida cuenta los niveles jugados (`runLevel - 4`) en una reanudada. |
| Guardado | Campo nuevo `checkpoints`. Guardados viejos sin el campo cargan con `{}` sin tocar nada más; un campo dañado se sanea (nivel 5, `uses` 0-3, dificultad válida). |

### Cifras medidas

`tools/balance/checkpoint_econ.js`: piloto automático invulnerable, guerrero, partida completa con el código real, XP y oro de combate por nivel (datos crudos en `docs/ux/checkpoint/econ.jsonl`; una partida por arena, ruido alto).

| Arena (nivel del guardián) | XP niveles 1-4 | XP niveles 5-9 | Oro 1-4 | Oro 5-9 | XP/min de 5-9 vs 1-9 | Oro/min de 5-9 vs 1-9 |
|---|---|---|---|---|---|---|
| Ciudad (1)* | 801 | 1317 | 85 | 117 | x1,09 | x1,01 |
| Bosque (11) | 731 | 2975 | 230 | 341 | x1,27 | x0,94 |
| Hielo (19) | 1012 | 2570 | 271 | 577 | x1,13 | x1,08 |

\* Ciudad retiene el nivel 9 (rescate de civiles) y la partida automática no lo cerró: son los niveles 1-8.

Los niveles 5-9 rinden hasta 27 % más XP por minuto que la partida completa, y el tramo dura 208 s contra 329 s. Con el mismo 50 % sobre lo ganado, repetir "reanudar y caer en el 9" pagaría hasta x1,27 por minuto lo que paga repetir "desde el 1 y caer en el 9". Con `CP_PAY` = 0,75 queda en x0,95 (Bosque, el peor caso), x0,82 (Ciudad) y x0,85 (Hielo) en XP, y entre x0,70 y x0,81 en oro. Por eso el descuento es 25 %: reanudar no rinde más por minuto que jugar completo. Además es más débil (sin refuerzos), no da botín de consuelo y se agota a las 3 reanudaciones.

Pérdida por derrota (Bosque, caer en el nivel 9): hoy se pierden 0,5*(731+2975) = 1853 XP; con punto de control (1-4 a salvo), 0,5*2975 = 1488 XP (-20 %); al caer en la partida reanudada, 0,5*0,75*2975 = 1116 XP (-40 % contra hoy). Tiempo hasta volver a ver al jefe tras caer: 329 s desde el 1, 208 s reanudando (-37 %).

Lo que NO se midió: no se corrieron `tools/playtest` ni `tools/balance/campaign_runs.js` con el punto de control ni partidas humanas; la economía por hora con intentos reales de jefe queda pendiente.

### Riesgos de la propuesta: estado

1. Economía: acotada con `CP_PAY`, tope de 3 usos, sin botín de consuelo. Recalibrar si el balance cambia.
2. Refuerzos: no se conservan (decisión explícita, el texto lo dice).
3. Estado de partida: se reanuda con `startRun(5)` como el Test Lab; el resto del estado es el de una partida nueva. Humo: arranca y corre 6 s sin excepciones en las 10 arenas; mecánicas por arena que asumen niveles 1-4 jugados (compuertas de la Fortaleza, rescate de la Ciudad, etc.) no se revisaron una por una.
4. Cooperativo: fuera de alcance, no se ofrece.
5. Exploit "caer a propósito": el 50 % sobre lo ganado después sigue vigente.
6. Logros "sin morir"/"desde el nivel 1": solo se ajustó la XP de cuenta; los desafíos que cuentan niveles no se auditaron.
7. Mensaje: "Sin puntos de control" queda solo donde el punto no existe (sala, Horda, Divina); en solitario avisa que se crea al superar el nivel 5.
