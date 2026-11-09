# Reliquias de la Horda — decisiones dentro de la partida

Motor de retención de la Horda Infinita: **builds con sinergias**. Tras la ronda 3 y tras cada jefe/subjefe (rondas 5, 10, 15...) el jugador elige **1 de 3 reliquias**. Se acumulan solo durante esa partida y se pierden al terminarla. Es el mismo contrato de Vampire Survivors / Hades: cada partida arma una build distinta.

Archivos: `js/data/horde-relics.js` (datos y balance), `js/systems/horde-relics.js` (motor, interfaz, red), `css/horde-relics.css`, textos EN/PT en `tools/i18n/tr/t370.py`, consejo de primera vez en `js/ui/screen-tips.js` (id `reliquias`).

## Reglas de diseño (no negociables)

- **No toca la economía.** Ninguna reliquia da oro, Brasas, XP, gemas, pociones ni botín, y no cambia las probabilidades de nada. `tools/balance/relics_budget.js` busca esos identificadores en el código y falla si aparecen.
- **Solo en la Horda.** Todo cuelga de `endlessOn()`: fuera del modo no hay ganchos de daño, ni oferta, ni capa de estadísticas. Los cosméticos siguen sin estadísticas (las etiquetas llevan íconos pixel, no color de skin).
- **Poder acotado y chequeado.** Presupuesto por jugador, topes por rareza y topes por estadística (ver más abajo). La mejor build posible vale menos que dos refuerzos de la Horda.
- **Sin entidades nuevas.** Los espíritus y las ondas son golpes instantáneos con efecto visual (`kitFx`). Nada que limpiar, nada que sincronizar por red, sin tope de entidades que cuidar.
- **No cambia el balance base.** La capa vive aparte (`HR_APPLIED`, una por `runStats`) y se recalcula entera en cada elección; el pool de refuerzos de siempre queda igual.

## Flujo

1. La ronda se cierra (`beginLevelClear`), aparece el **refuerzo normal** (2 genéricos + 1 de habilidad, como siempre).
2. Si la ronda es 3 o es de jefe/subjefe (`hrelOfferRound`), al elegir el refuerzo se abre una **segunda fase en el mismo estado `buff`** (el juego ya está detenido ahí: no hay acción corriendo mientras se decide). `EN.hrelPhase = 1`.
3. Pantalla de 3 tarjetas. Elegida la reliquia: `endlessAdvance()` (próxima ronda o, cada 5, próxima arena).
4. Al terminar la partida (`endlessFinish`) o empezar otra (`endlessBeginRun`, `endlessOnRunStart`) se llama `hrelReset()`: se borran `h.hrel`, el estado interno y la oferta.

Las herramientas con piloto automático que hacían `if(state==="buff") pickBuff(); if(state!=="playing") break;` necesitan elegir dos veces: `tools/balance/autopilot.js` (`AP.pickBuff`) ya elige hasta salir del estado. Otras herramientas propias deberían hacer lo mismo.

## Oferta determinista y cooperativo

- `hrelBuildOffer(semilla, ronda, mapasDeLosHumanos)` es una función **pura**: semilla = `EN.id` (la fija el anfitrión al empezar), nada de `Math.random`. Misma entrada, misma oferta, en cualquier cliente.
- Excluye lo que **algún** humano ya no puede llevar (tope de nivel, de cantidad o de poder), así que una sola oferta sirve a todos y nadie ve una tarjeta que no pueda elegir. Prefiere tres etiquetas distintas. Rareza por peso según la ronda: 62/33/5 al empezar, 50/36/14 desde la ronda 10 y 40/38/22 desde la 20.
- **Anfitrión autoritativo.** `netHostOpenBuffs` manda a cada invitado el mensaje `buffs` con `relic:1` y la misma lista; además la oferta viaja en la instantánea (`NET_GLOBALS.endless.enRl`). El invitado elige y manda `{k:"buff", id}`. `netHostBuffPicked` solo acepta ids de la oferta (si no, usa la primera carta) y aplica la reliquia al héroe correcto con `netWithHero`, sobre **su** `runStats`. Un mensaje repetido no hace nada (la fase ya cerró). `h.hrel` viaja por la instantánea como cualquier clave del héroe.
- La ronda espera a todos los humanos conectados (tope de 30 s: si alguien no elige, se le da la primera carta). `netHostTryResume` ya no avanza dos veces si un tiempo agotado dispara llamadas anidadas.

## Interfaz

- Tarjeta = `<button>` (táctil, mouse, Enter/Espacio nativos, y `js/core/pad-nav.js` la ve como cualquier botón): rareza, nivel actual (`Nueva` o `Nivel 2/3`), ícono pixel de la etiqueta (`pixelIconHTML`; sin emojis de color), nombre, descripción corta, etiqueta con cuántas llevás, y la línea **Sinergia** cuando esa reliquia activa el bono de 2 o de 4.
- Teclado: `1` `2` `3` eligen, flechas mueven el foco, Enter confirma. Mando: cruceta + A.
- Debajo de las cartas: chips con las reliquias que ya llevás.
- **Resumen** de la pausa (`renderStatsPanel`): bloque "Reliquias de la Horda" con cada una, su nivel y las sinergias activas. **Resultados** de la Horda: chips con las reliquias de la partida.
- Consejo de primera vez (`screen-tips`, id `reliquias`, tema "infinita"): se ve una sola vez y se repite desde Opciones.

## Tabla de reliquias

Poder: cada nivel cuesta 1 (común), 2 (rara) o 3 (épica). Presupuesto por jugador: **20**, máximo **12 niveles**. Topes de nivel: común 3, rara 2, épica 1. `dmg base` = `baseDmg × dmgMult` del héroe.

| Etiqueta | Reliquia | Rareza | Tope | Efecto por nivel |
|---|---|---|---|---|
| Fuego | Brasa viva | Común | 3 | 12% de prender fuego con un básico (2,6 s, 20% del dmg base por s) |
| Fuego | Chispa ardiente | Rara | 2 | +10% de daño a enemigos en llamas |
| Fuego | Corazón de magma | Épica | 1 | un enemigo en llamas explota al morir: 55% del dmg base, 100 px (enfriamiento 0,6 s) |
| Hielo | Aliento gélido | Común | 3 | 12% de ralentizar 30% con un básico, 1,6 s (la mitad en jefes) |
| Hielo | Escarcha quebradiza | Rara | 2 | +10% de daño a enemigos ralentizados |
| Hielo | Invierno eterno | Épica | 1 | cada 9 s, onda de 190 px: ralentiza 40% (2,2 s) y hace 30% del dmg base |
| Veneno | Colmillo tóxico | Común | 3 | 14% de envenenar con un básico (3,2 s, 24% del dmg base por s) |
| Veneno | Toxina persistente | Rara | 2 | +10% de daño a enemigos envenenados |
| Veneno | Plaga | Épica | 1 | al morir un envenenado, contagia a 3 enemigos a 150 px |
| Vida | Savia vital | Común | 3 | +5% de vida máxima |
| Vida | Pulso vital | Rara | 2 | +0,4% de vida máxima por segundo |
| Vida | Bendición de la Horda | Épica | 1 | al vencer élite o jefe, cura 6% a todo el equipo (enfriamiento 3,5 s) |
| Velocidad | Paso del viento | Común | 3 | +4% de velocidad de movimiento |
| Velocidad | Ritmo de guerra | Rara | 2 | +6% de velocidad de ataque |
| Velocidad | Relámpago | Épica | 1 | -8% de enfriamientos; al lanzar la definitiva, +15% de velocidad 4 s |
| Área | Golpe amplio | Común | 3 | los básicos pegan además a 2 enemigos a 80 px con 14% del daño por nivel |
| Área | Eco sísmico | Rara | 2 | al lanzar una habilidad, onda de 110 px con 35% del dmg base por nivel (enfriamiento 1,5 s) |
| Área | Cataclismo | Épica | 1 | cada 12 s, explosión de 190 px con 160% del dmg base |
| Crítico | Ojo afilado | Común | 3 | +4% de probabilidad de crítico |
| Crítico | Golpe certero | Rara | 2 | +20% de daño crítico |
| Crítico | Sentencia | Épica | 1 | +12% de daño a élites/jefes y +12% de rematar |
| Invocaciones | Espíritu cazador | Común | 3 | cada 7 s, un espíritu por nivel golpea al más cercano (420 px) con 60% del dmg base |
| Invocaciones | Pacto de sombras | Rara | 2 | al vencer un élite, 3 espíritus golpean a enemigos a 300 px con 70% del dmg base por nivel (enfriamiento 2,5 s) |
| Invocaciones | Legión espectral | Épica | 1 | cada 15 s, 5 espíritus golpean a enemigos al azar (420 px) con 90% del dmg base |

### Sinergias de etiqueta (se recalculan con la capa; no suman doble)

Con **2** niveles de la misma etiqueta se activa el primer bono; con **4**, el segundo.

| Etiqueta | 2 niveles | 4 niveles |
|---|---|---|
| Fuego | +4% de daño | +6% de daño más |
| Hielo | -4% de enfriamientos | -4% de enfriamientos más |
| Veneno | +6% de daño a debilitados | +6% más a debilitados |
| Vida | +4% de vida máxima | +0,3% de vida por segundo |
| Velocidad | +3% de velocidad | +4% de velocidad de ataque |
| Área | +3% de daño | +10% de carga de la definitiva |
| Crítico | +2% de crítico | +10% de daño crítico |
| Invocaciones | +15% de daño de los espíritus | +20% más (tope total x1,5) |

Además hay cruces **entre reliquias** de una misma etiqueta: Chispa ardiente / Escarcha quebradiza / Toxina persistente solo rinden si Brasa viva / Aliento gélido / Colmillo tóxico (o el estado de otra fuente) dejan al enemigo en ese estado; Corazón de magma y Plaga necesitan las comunes de su etiqueta para tener a quién explotar o contagiar.

## Topes y presupuesto (dónde se toca)

Todo en `HRELIC_CFG` (`js/data/horde-relics.js`):

| Concepto | Valor | Para qué |
|---|---|---|
| `stackCap` | común 3, rara 2, épica 1 | niveles por reliquia |
| `budget` / `powerCost` | 20 / 1-2-3 | poder total por jugador |
| `maxTotalStacks` | 12 | niveles totales por jugador |
| `layerCap` | daño x1,28, crítico +14 pts, daño crítico +0,40, enfriamientos x0,84, velocidad x1,15, vel. de ataque x1,20, vida x1,25, regen +1%/s, élites x1,15, rematar +0,20, definitiva x1,15 | tope de la capa de estadísticas (todas las reliquias + sinergias juntas) |
| `extraDmgPerSec` | 1,1 | daño extra por segundo de los efectos con disparo, por héroe, como múltiplo de su daño base (golpes extra, explosiones, espíritus) |
| `summonCap` | 1,5 | multiplicador máximo de los bonos de Invocaciones |

Referencia: un refuerzo común de la Horda da +20% de daño (`BUFF_POOL`) y se elige uno por ronda. El **índice de daño** de `relics_budget.js` (daño × crítico esperado × √velocidad de ataque × élites/rematar) de la mejor build hallada con búsqueda es **1,40**, bajo el límite de 1,44 (dos refuerzos). Con todas las reliquias a tope y sin presupuesto, la capa topada da 1,50.

## Cómo balancear

1. Cambiá solo `js/data/horde-relics.js` (cifras en `HRELICS[].L`, `HRELIC_FX`, `HRELIC_TAGS`, `HRELIC_CFG`). Los textos son fijos: si cambiás una cifra de una descripción, actualizá también `tools/i18n/tr/t370.py` y `python3 tools/i18n/build.py`.
2. `node tools/balance/relics_budget.js`: datos, determinismo, topes, índice de la mejor build, economía. Si falla el índice, bajá la reliquia que aparezca en "Mejor build hallada" (o su tope de capa), no subas el límite.
3. `node tools/ux/test-horde-relics.js` (navegador, teclado y mando) y `NODE_PATH=server/node_modules node tools/net-test/relics_coop.js` (dos clientes reales).
4. Efecto en el juego: `GOD=1 node tools/balance/relics_effect.js 4 8 guerrero,mago first` y sin `GOD`. Es **pareado** (misma semilla, el control apaga la fase de reliquias). Probá también la política `best` (elige la reliquia que más daño sube): es el techo de lo que haría un jugador optimizando.
5. `node tools/balance/endless_econ.js` debe seguir dando el mismo oro, XP y objetos por minuto que sin reliquias (las reliquias no los tocan).
6. Un efecto nuevo con disparo: pasá su daño por `hrelHit` (usa el techo por segundo), dale enfriamiento interno (`hrelReady`) y no crees entidades. Una estadística nueva en la capa: sumala a `HR_MULT_KEYS`/`HR_ADD_KEYS` y ponele tope en `layerCap`.

## Mediciones (2026-11-08, piloto automático, `tools/balance/relics_effect.js`, pareado, GOD = el equipo no muere, 8 min de juego)

Con el piloto automático nivel 12 la partida "real" no se pierde en 12 minutos: las rondas alcanzadas quedan topadas por el tiempo (ronda ~10), así que la señal útil son bajas, daño y puntaje por minuto. Cada partida acumula solo **2 a 3 reliquias** en 8 minutos (rondas 3, 5 y quizá 10). Las partidas divergen solas (el azar de combate cambia con cada efecto), por eso las cifras por guardián son muy ruidosas: mirar los totales y el signo, no el decimal.

| Muestra | Rondas | Puntaje | Bajas/min | Daño/min |
|---|---|---|---|---|
| guerrero + mago + cazadora, política `first`, 4 partidas c/u (n=12 por brazo) | +0,17 | +5,1% | +2,7% | +7,7% |
| mago, política `first`, 8 partidas (n=8 por brazo) | +0,37 | +9,0% | +7,1% | +10,7% |
| guerrero + cazadora, política `best` (la que más sube el daño), 4 c/u (n=8) | 0,00 | -0,3% | +4,1% | -5,6% |

Lectura: el efecto en el juego es **chico y dentro del ruido** (0 a +10%), de acuerdo con el presupuesto (la mejor build vale 1,40 y en 8 minutos se llevan 2-3 reliquias). Lo que sí se mide: con más tiempo (jefes 10, 15, 20...) se llenan los 12 niveles y el techo de 1,40 pasa a pesar; conviene repetir con partidas de 20-30 minutos y con jugadores reales antes de subir cualquier cifra.

Economía (`tools/balance/endless_econ.js`, GOD, 6 min, guerrero, solo Horda, 3 partidas): mismo código, mismas fuentes de oro/XP/objetos. Con reliquias: 197 de oro/min, 512 de XP/min, 0,88 objetos/min; sin reliquias (árbol de `main`): 281 de oro/min, 660 de XP/min, 1,58 objetos/min. La diferencia sale de **en qué arena cae cada partida** (las partidas que empiezan en la Ciudad se quedan más tiempo en la ronda del subjefe), no de las reliquias: con la comparación pareada (5 partidas por brazo, misma semilla, 6 min) las partidas con reliquias llegaron más lejos (ronda 7,0 contra 5,6) y juntaron más oro y objetos por el mismo motivo. Ningún valor por kill, por ronda ni por cofre cambió (el código de las reliquias ni los nombra; lo vigila `relics_budget.js`). Efecto indirecto aceptado: si matás más rápido, avanzás más rondas por minuto.

## Pruebas

| Prueba | Qué cubre |
|---|---|
| `tools/balance/relics_budget.js` | sin navegador: datos, texto fijo, oferta pura (sin `Math.random`), 3000 builds al azar contra topes, búsqueda de la mejor build, economía, alcance |
| `tools/ux/test-horde-relics.js` | determinismo y topes, flujo real (ronda 3 y 5), teclado (`2`, flechas, Enter), mando simulado (cruceta + A), efectos con disparo y techo por segundo, capa y sinergias, economía intacta, sin efecto fuera de la Horda, Resumen y resultados, limpieza al terminar |
| `tools/net-test/relics_coop.js` | 2 clientes reales + relay propio: misma oferta (mensaje e instantánea, y es la determinista de la semilla), cada uno aplica la suya sobre su `runStats`, id ajeno reemplazado, mensaje repetido sin duplicar, la ronda espera al invitado, resultados y limpieza |
| `tools/balance/relics_effect.js` | efecto en el juego con el piloto automático, pareado |
| `.github/workflows/horde-relics.yml` | las tres de arriba en CI |

## Pendiente y riesgos

- **Sin jugadores reales**: los números salen de simulación con piloto automático y de comparar con los refuerzos existentes; hace falta una tanda con personas (¿alguna etiqueta domina? ¿se elige siempre la misma?).
- La primera oferta temprana (ronda 3) y el ritmo 5-10-15 son una primera apuesta de retención; se ajusta con `firstRound` y `hrelOfferRound`.
- Los efectos con disparo se ejecutan en el anfitrión; en el invitado solo se ven por los eventos de red habituales (`kitFx` pasa por los mismos `vfx*`). Con latencia alta se verán un poco después.
- Las pruebas de otras personas que elijan una sola vez entre "refuerzo" y "estado `playing`" en la Horda deben elegir hasta salir de `buff` (ya hecho en `autopilot.js`).
- Ranking competitivo (`js/net/item-economy.js`): las reliquias no se declaran al servidor; si el ranking pasa a validar builds, hay que mandar `h.hrel`.

## Rangos de Cicatriz (ascensiones de la Horda)
Cinco rangos opcionales (Cicatriz I–V) sobre la Horda Infinita. Cada uno **suma mutadores fijos** (los de `ENDLESS_MUTATORS`, ya balanceados) a los de la temporada y **+15 % de puntaje por rango**. Se abre el siguiente rango llegando a la ronda 10/15/20/25/30 jugando en el rango anterior. Recompensa **solo de identidad**: un título por rango (`marcado_1…5`) y el marco `cicatriz` en el V. Nada de oro, Brasas ni poder.
- Datos y reglas puras: `js/data/scar-ranks.js` (`SCAR_CFG`, `SCAR_RANKS`, `scarOutcome`…). Motor y pantalla: `js/systems/scar-ranks.js` (selector en la preparación de la Horda, resumen en resultados). Enganches mínimos en `js/systems/endless.js` (`scarApplyToRun`, `scarOnRunEnd`, bono en `endlessScoreMult`, `enSr` en la red).
- Cooperativo: el anfitrión elige el rango; los mutadores ya viajan por `enMu`, el invitado ve el rango por `enSr` y no puede cambiarlo.
- Guardado: `save.endless.scar = {max, sel, best:{rango:ronda}, cleared:{rango:1}}`.
- Pruebas: `tools/balance/test-scar-ranks.js` (puras) y `tools/ux/test-scar-ranks.js` (navegador); ambas en el workflow `Reliquias de la Horda`.
- Pendiente: medir con jugadores reales si las rondas meta (10/15/20/25/30) son alcanzables; ajustar `SCAR_CFG.clearRound`.

### Medición de rangos (2026-11-09, `tools/balance/scar_sim.js`, piloto automático, GOD, 6 min, guerrero nv 12)
| Rango | Mutadores efectivos (esta temporada ya trae `furious` y `elites_x2`) | Ronda a los 6 min | Máx. enemigos | Multiplicador de puntaje |
|---|---|---|---|---|
| 0 | furious, elites_x2 | 10 | 86 | ×1,44 |
| III | + fast_horde | 5 | 39 | ×2,51 |
| V | + fast_horde, dense, no_potions | 11 | 85 | ×4,35 |
- Sin errores de página en ningún rango. La ronda 5 es de jefe: el piloto tarda más ahí, por eso el rango III queda atrás en rondas (no es una falla del rango).
- **Límite de la medición**: es un solo piloto, una sola semilla y con GOD; sirve para ver que se juega, no para fijar la dificultad. Las rondas meta (10/15/20/25/30) hay que ajustarlas con jugadores reales.
- **Solapamiento con la temporada**: si la temporada ya trae un mutador del rango (p. ej. `furious`), ese rango suma menos. El multiplicador de puntaje sí sube igual (bono por rango). Si molesta, el remedio es elegir mutadores de rango que la temporada no pueda traer, o reemplazar el repetido por otro.
