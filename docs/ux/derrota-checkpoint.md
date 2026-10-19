# Derrota y punto de control: propuesta opcional (NO implementada)

Estado: solo propuesta. Esta PR (`claude/derrota-clara`) no cambia cuánto se pierde ni agrega puntos de control: eso es decisión de diseño del dueño. Lo que sí cambia la PR es cómo se cuenta la derrota (ver el final).

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
