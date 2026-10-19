# Ayuda adaptativa del jefe de campaña

Código: `js/systems/boss-assist.js`. Prueba: `tools/regression/t_boss_assist.js`. Datos crudos: `docs/ux/jefe-ayuda/datos/`. Capturas: `docs/ux/jefe-ayuda/`.

## Qué hace

Solo en Normal, en solitario y en arenas de la campaña que todavía no superaste. Cada derrota en el nivel 10 (el del jefe) de una arena suma 7 % de reducción, hasta un tope de 25 % (a la 4.ª derrota):

| Derrotas previas en esa arena | Vida del jefe | Daño del jefe y de sus golpes con aviso | Daño de la horda del nivel 10 |
|---|---|---|---|
| 0 | 0 % | 0 % | 0 % |
| 1 | −7 % | −7 % | −7 % |
| 2 | −14 % | −14 % | −14 % |
| 3 | −21 % | −21 % | −21 % |
| 4 o más | −25 % | −25 % | −25 % |

- Se limpia al ganar la arena (solo el contador de esa arena). Quien gana a la primera no la ve nunca.
- Guardado: `save.bossDefeats = {arena: n}`. Los guardados viejos no lo tienen, valen 0 (`save.js` lo normaliza y acota a 0..99). No toca `arenaDefeats` (perdón de XP/oro) ni `defeatCount`.
- No aplica en: cooperativo/sala, Horda Infinita, Divina, Coliseo, Guerra de Cristales, Test Lab, entrenamiento, Pesadilla, Infierno, ni en una arena ya superada (rejugarla es el jefe pleno).
- Aviso: al entrar a la arena (cartel con la cifra exacta), en la pantalla de derrota (cifra del próximo intento y el tope) y en Opciones. Se desactiva con el interruptor "Ayuda con el jefe" (`PREFS.bossAssist`, por dispositivo) o con el botón de la pantalla de derrota. Apagada = jefe de siempre; la derrota igual se cuenta, por si se vuelve a activar.
- Cómo se aplica: la vida del jefe, en `scaleBossStats` (`waves.js`); el daño, multiplicando `runDifficulty.avgHp` (ancla `e.dmg` y los golpes con aviso de los jefes) y `runDifficulty.dmg` una sola vez al empezar el nivel 10 (`beginLevel`). Los niveles 1-9, los subjefes anteriores y la vida de la horda no cambian.
- Conteo de derrotas: cuenta la derrota real (pantalla "La Horda te ha consumido") con `runLevel >= 10`, haya salido el jefe o no. Abandonar no cuenta.

## Por qué la horda del nivel 10 también baja de daño

Primera versión: solo vida y daño del jefe. La medición (abajo) mostró que casi ninguna muerte ocurre contra el jefe: ocurren antes de que salga (la horda del nivel 10, o niveles 6-9). Como el contador sí suma esas muertes del nivel 10, la ayuda también baja el daño de la horda de ese nivel. Esto aparece en el cartel de entrada ("la horda del nivel 10 también pega −X %") y en la descripción de Opciones.

## Método

- `tools/ux/playtest.js` (autopiloto por perfil: aprendiz skill 0,45 / reacción 650 ms; ocasional 0,7 / 400; habitual 0,9 / 220), nivel esperado de cada arena, sin equipo, tope 900 s. Se le agregaron variables de entorno: `BOSS_DEFEATS=0,2` (repite cada casilla con esas derrotas previas), `OUT`, `PORT`, `SEED0`, `BOSS_STEP`, `BOSS_CAP`, `FAST`. Cada casilla reinicia `save.arenasCleared` y `save.bossDefeats`.
- Semillas fijas (0, 1, 2) pareadas entre k = 0 y k > 0. El host estaba muy cargado (carga 55-100 en 4 núcleos) y los autopilotos dependen del tiempo: la misma semilla no repite la misma partida. Los resultados son ruidosos.
- Pérdida = no ganar en 900 s. Intervalos: Wilson al 95 %.
- Arenas medidas en partida completa: ciudad, fortaleza, laberinto, infernal (las de las derrotas del playtest con partida alcanzable por el autopiloto). Habitual: solo en k = 0. Bosque, micelial, hielo, acuática, abismo y minas no se midieron en completo.
- Descartado: un modo `FAST=1` (salta los niveles 1-9 y juega entero el nivel 10) sobre 6 arenas. Rompe arenas con mapa propio (fortaleza se traba en el nivel 6) y hace perder a los habituales (bosque 4/4 de pérdida sin jefe). Los datos quedan en `datos/rapidas-descartadas.json` solo como registro; no se usan para ninguna conclusión.

## Resultados (partida completa)

Pérdidas sobre las 3 arenas medidas en todas las condiciones (fortaleza, laberinto, infernal), versión final de la ayuda salvo donde dice lo contrario:

| Perfil | k = 0 (sin ayuda) | k = 2 (−14 %) | k = 3 (−21 %) |
|---|---|---|---|
| Aprendiz | 4/9 (44 %, IC 19-73) | 4/9 (44 %) | 5/9 (56 %) |
| Ocasional | 7/9 (78 %, IC 45-94) | 5/9 (56 %) | 7/9 (78 %) |
| Habitual | 3/9 (33 %, IC 12-65) | no medido | no medido |

Ciudad (solo k = 0 y k = 2 con la versión 1, solo jefe): 0 pérdidas en 12 corridas de aprendiz+ocasional en ambas condiciones. La versión 1 (solo jefe) no cambió nada en las otras 3 arenas: 4/9 y 7/9 en k = 2, igual que k = 0.

Mediana de segundos hasta ganar (victorias): aprendiz 516 s en k = 0 y 425 s en k = 2; ocasional 602 s y 499 s. Con 4-9 victorias por celda, es ruido.

**Dónde mueren.** En las 96 corridas completas (todas las condiciones y perfiles) hubo 46 pérdidas:

- Contra el jefe ya presente: 0. De 50 combates contra el jefe alcanzados, el autopiloto ganó los 50 (con y sin ayuda).
- Antes de que salga el jefe en el nivel 10: 13 (infernal 9, laberinto 4).
- En los niveles 1-9: 33 (fortaleza, laberinto e infernal).

El playtest committeado (`docs/ux/playtest-summary.json`, una semilla por casilla, sin ayuda) sí tiene 4 combates contra el jefe perdidos de 26 alcanzados (ciudad, fortaleza, laberinto, infernal) y 3 detenidos con el jefe a vida completa (micelial, minas ×2: el autopiloto no lo ataca). Mis corridas no reproducen eso: 0 de 50.

## Conclusión honesta

- **El objetivo ("aprendices pierden menos del 20 % en el jefe tras ≤ 2 intentos") no se puede confirmar ni refutar con estos datos.** La ayuda no mostró efecto medible: 4/9 → 4/9 (aprendiz) y 7/9 → 5/9 (ocasional, intervalos que se solapan por completo). Con n = 9 por celda, solo se detectaría un efecto enorme.
- **Lo que sí muestran los datos:** con este autopiloto, el jefe no es el muro. Las pérdidas del autopiloto en estas arenas (33-78 % según perfil) ocurren antes del jefe, y ningún jefe alcanzado le ganó al autopiloto. La premisa de la auditoría (todas las derrotas son contra el jefe del nivel 10) viene de una sola corrida por casilla y no se reprodujo. Para el jugador humano no hay datos en este repo.
- **Habituales:** la ayuda no se activa sin derrotas previas (`assist = 0` en las 12 corridas de habitual; es inactiva por construcción en k = 0). Ganaron 9/12 (ciudad 3/3, laberinto 3/3, fortaleza 2/3, infernal 1/3); las 3 pérdidas fueron antes del jefe y son independientes de este cambio. Esto no cumple "casi siempre" en infernal y fortaleza, y no depende de la ayuda.
- **Ajuste base de la curva del nivel 9-10: no se hizo.** Ninguna medición lo respalda (el jefe no mata); tocarlo solo cambiaría las partidas que ya funcionan.
- **Calibración 7 % / 25 %:** son los valores propuestos en el pedido; los datos no permiten calibrarlos. Con 14 % la vida del jefe pasa p. ej. de 24.102 a 20.728 (laberinto) y de 8.259 a 7.103 (fortaleza), verificado en las corridas. Si el equipo tiene datos de jugadores reales, el paso y el tope son constantes en `BOSS_ASSIST` (una línea).

## Pendientes y recomendaciones

1. Medir con jugadores reales (o con un piloto que pierda contra el jefe) antes de dar por buena la ayuda; hoy es una red de seguridad sin efecto demostrado.
2. Las muertes de los niveles 6-10 en infernal, laberinto y fortaleza en Normal (aprendiz y ocasional) son el muro que sí se midió; es un problema de balance de esas arenas, fuera de este cambio.
3. Si se quiere que la ayuda llegue a quienes mueren en la horda de niveles anteriores, habría que cambiar qué cuenta como derrota; no se hizo para no inflar la promesa de "ayuda para el jefe".
4. Pesadilla e Infierno no se tocaron (otro frente trabaja `ARENA_MODS.*.tierMods.pesadilla`).
