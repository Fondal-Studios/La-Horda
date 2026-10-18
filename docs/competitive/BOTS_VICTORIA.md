# Bots orientados a victoria (Guerra de Cristales y Coliseo)

Antes los bots atacaban "lo más cercano" (`nearestEnemyTo`) y, en Guerra de Cristales, los laners puntuaban criaturas de la selva y al
Dragón/Rey Coloso por igual que a una torre, sin importar si estaban solos. Ahora cada bot decide por estados y apunta a lo que gana la partida.

## Qué hace (reutiliza `bot-brain.js`, `lanes-bots.js`, `colBotMove`; no duplica)
- `js/arenas/lanes/lanes-bot-ai.js` (nuevo, Guerra de Cristales):
  - **Amenazas** (`lanesThreat`): fuerza aliada vs rival en 760 u (vida x nivel), y si está bajo una torre rival sin escolta.
  - **Estados** (`lanesDecide` → `h._ai.state`): `retreat` (vida < 35 % con histéresis hasta 75 %, superado en número, bajo torre) ·
    `defend` (cristal atacado, torre dañada con héroes o ≥ 4 súbditos encima) · `objective` (épico con ≥ 3 héroes sanos; se reúnen en un punto
    antes de entrar y se rinden 90 s si a los 30 s el épico sigue sano) · `push` (≥ 3 sanos desde el minuto 2:30, en el carril donde la horda va más
    adelantada) · `lane` · `jungle`.
  - **Plan de equipo** (`lanesPlan`, cada 0,5 s y uno por equipo) y **camino táctico** (`lanesSteer`: los viajes largos rodean el alcance de torres rivales).
  - **Objetivos** (`lanesTargetScore`, compartido por el movimiento y el ataque básico vía `nearestEnemyTo`): héroe débil > cristal/torre expuestos con escolta
    (≥ 3 súbditos o ≥ 3 héroes) > épico con el equipo > súbdito que estorba. Los campamentos son solo de la selvática; nadie le pega a un épico sin equipo.
- `bot-brain.js`: gancho `botState` (paso 2e). `combat.js`: `nearestEnemyTo` respeta el objetivo del bot (solo bots: `h._bot`).
- Coliseo (`coliseum-core.js`): remata al más herido (+160 bajo 30 %), concentra fuego con el compañero y modo **sobrevivir** (vida < 38 % y rival a < 340 u: se aleja
  sin salir del anillo y deja que el compañero remate). No toca el revivir (rama aparte `claude/coliseo-sin-revivir`).
- Interruptor: `globalThis.BOT_VICTORY_TEAMS` (lista de equipos con el cerebro nuevo; sin definir = todos).

## Cómo medir
```
node tools/bots/victory-sim.js cw  5 1000 --cfg=legacy|victory|h2h [--seed0=n] [--root=dir]   # Guerra de Cristales
node tools/bots/victory-sim.js col 12 900 --cfg=h2h                                              # Coliseo
```
`h2h` enfrenta cerebro nuevo vs anterior en la MISMA partida (se alternan lados por semilla; campeones y `Math.random` con semilla). `--root` sirve otra copia del
juego (se usó un `git archive origin/main` como línea base real). El héroe del jugador lo conduce el mismo cerebro y no cuenta en las métricas.

## Resultados medidos (Chromium headless, motor real, 10 contra 10 héroes, 1000 s de reloj virtual)
Guerra de Cristales, `h2h`, 10 partidas (promedio por partida; "anterior" es el cerebro de `origin/main` en el otro equipo):

| Métrica | Anterior | Nuevo |
|---|---|---|
| Golpes a campamentos de la selva por laners | 764 | 268 (-65 %) |
| % del tiempo en que un laner tiene un campamento como objetivo | 13,4 % | 6,0 % |
| Golpes a Dragón/Rey sin ≥ 3 aliados cerca | 2027 | 77 (-96 %) |
| Daño a estructuras | 426 | 1387 (x3,3) |
| Daño a héroes rivales | 2898 | 3558 (+23 %) |
| Torres derribadas | 2,1 | 3,7 |
| Muertes de héroes | 11,3 | 11,5 (sin cambio) |
| Partidas ganadas (misma partida) | 4 | 6 |

Coliseo, `h2h`, 48 torneos (2 de los 4 equipos con cada cerebro): duelos ganados 138 → 154, bajas 298 → 351, daño a rivales 5328 → 5911 por torneo, muertes por torneo 6,4 → 5,4.

## Límites honestos
- 6-4 en 10 partidas (y 11-9 sumando una tanda previa con otra versión) **no es significativo**; el motor no es determinista al 100 % y los resultados varían entre tandas.
- El % de golpes a "objetivos relevantes" **no mejoró** (15 % vs 28 %): los básicos cuerpo a cuerpo y las habilidades de área golpean a todo lo que esté en alcance,
  y el cerebro nuevo pasa más tiempo escoltando asedios entre súbditos. También baja el % de tiempo con objetivo relevante (52 % vs 63 %) por retiradas y espera. El cambio real está en
  las conductas medidas arriba, no en esa proporción. Con ambos equipos nuevos (`victory`) las muertes suben (31 vs 17 por partida): las defensas concentran peleas.
- Los puntos de decisión usan umbrales fijos sin ajustar por campeón; el bot de selva no se une al empuje; no hay visión ni arbustos. Rendimiento: ~7 ms por cuadro de `update` en ambos.
- No se probó en navegador real con humanos ni en red (solo simulación local); el Coliseo se simuló sin la rama de "sin revivir".
