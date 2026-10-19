# Coherencia: drops, progresión y dificultad

Decisión del dueño: «tiene que quedar coherente el dropeo, la progresión y la dificultad; si hay barreras, se cambia la dificultad». Otros tres agentes ajustan la dureza ENEMIGA por arena y dificultad (`ARENA_MODS.*.tierMods`); este documento cubre lo que el jugador RECIBE: equipo, XP, oro y ritmo. No se tocó la dureza de los enemigos, `js/net/*`, `server/*` ni campeones.

Herramientas (todas con el código real del juego): `tools/balance/campaign_runs.js` (partida completa por arena, ahora con `TIER=`), `tools/balance/coherencia_loot.js` (botín real por arena y dificultad + carrera de un jugador típico), `tools/balance/coherencia_model.js` (nivel partida a partida), `tools/balance/real-loot.js` (botín de una victoria real, piso + cofre). Prueba de tablas sin navegador: `node tools/items/t_coherencia_tablas.js`.

## 1. Qué se midió y con qué incertidumbre

| Medición | Cómo | Incertidumbre (declarada) |
|---|---|---|
| Bajas, XP de bajas y oro por arena y dificultad | `campaign_runs.js`: guerrero invulnerable con el piloto automático, una partida por celda, jefe rematado a los 16 min. Normal: 9 de 10 arenas (las Minas no terminó: se interpola); Pesadilla: 5 de 10 (Ciudad, Fábrica, Gélida, Laberinto, Infernal); Infierno: 3 de 10 (Ciudad, Abismo, Infernal). Las demás celdas son interpolación lineal por posición de la misma dificultad (marcadas con `*`) | **Una sola partida por celda.** El host estaba saturado (carga 20-35): la misma arena varió ±40 % en bajas entre corridas (Ciudad Normal: 3.184 vs 5.475 XP de bajas en dos corridas). El piloto invulnerable mata más que una persona: el oro y la XP de bajas son una **cota alta**. Tomar los números como orden de magnitud |
| Equipo que dropea | `coherencia_loot.js`, Monte Carlo sobre `groundLootRollCount` + `groundLootRollTier` + `materializeLoot` + `grantEndOfRunLoot`, con las bajas medidas de cada celda; 100 victorias por celda y 50 carreras de 2 victorias por arena | «Poder» = stat garantizado (`itemStat`) relativo a un Muy Raro nivel de objeto 1 = 1,00. **No cuenta pasivas, afijos ni poderes**, que valen mucho en Legendarios+. Ruido de la carrera: ±0,05 en el poder; ±0,2 en mejoras por victoria |
| Nivel del guardián | `coherencia_model.js`: `xpToNext` y `victoryXpFor` reales + XP de bajas medida, reescalada por el multiplicador de XP por nivel de grupo (1 + 0,022 por nivel, tope 2,5). Puntaje de victoria 80 (el piloto dio 89-100; una persona 40-80), 1 o 1,4 intentos por arena (la derrota paga 0,5 de las bajas) | Depende de la XP de bajas medida (ver arriba) y de la suposición de intentos |
| Efecto en combate del equipo real | `campaign.js`, Mago nv.54, Pesadilla Laberinto, 4 semillas por modo | **n = 4 por modo**: solo indica dirección (ver §3) |

## 2. Tabla: poder esperado al entrar a cada arena frente al que dropea

Guerrero, 1 victoria por arena en el orden Normal → Pesadilla → Infierno. «Poder al entrar» = mejor stat por ranura que ya tiene el jugador (promedio de las 6 ranuras). «Poder que dropea» = mejor por ranura entre 2 victorias de esa arena, solo esa arena. Nivel al entrar: modelo con puntaje 80, 1 intento / 1,4 intentos por arena. `*` = celda interpolada (no medida).

| Dificultad | Arena | Nv. esperado | Nv. al entrar (1 / 1,4) | XP bajas | XP victoria | Oro por victoria | Nv. objeto | Poder al entrar (antes) | Poder que dropea: ANTES → DESPUÉS | Mejoras en la 1ª victoria: ANTES → DESPUÉS |
|---|---|---|---|---|---|---|---|---|---|---|
| normal | 1 ciudad | 1 | 1 / 1 | 3,2 k | 0,5 k | 2,8 k | 1 | 0 | 0,83 → 0,83 | 5,4 → 5,3 |
| normal | 2 fortaleza | 1 | 12 / 13 | 4,6 k | 1,1 k | 2,4 k | 2 | 0,81 | 0,92 → 0,92 | 2,2 → 2,3 |
| normal | 3 bosque | 6 | 18 / 19 | 4,4 k | 1,8 k | 2,9 k | 3 | 0,99 | 1,10 → 1,10 | 2,6 → 2,4 |
| normal | 4 micelial | 12 | 21 / 22 | 4,8 k | 2,9 k | 3,1 k | 4 | 1,18 | 1,10 → 1,10 | 1,7 → 1,7 |
| normal | 5 hielo | 17 | 24 / 25 | 7,1 k | 4,0 k | 3,6 k | 5 | 1,30 | 1,28 → 1,28 | 2,0 → 1,8 |
| normal | 6 acuatica | 23 | 27 / 29 | 5,7 k | 5,3 k | 3,6 k | 6 | 1,43 | 1,41 → 1,41 | 1,8 → 1,9 |
| normal | 7 laberinto | 26 | 30 / 31 | 6,5 k | 6,9 k | 3,6 k | 7 | 1,58 | 1,42 → 1,42 | 1,0 → 1,1 |
| normal | 8 abismo | 28 | 32 / 33 | 6,2 k | 8,2 k | 2,5 k | 8 | 1,69 | 1,43 → 1,43 | 1,0 → 0,9 |
| normal | 9 minas* | 31 | 34 / 35 | 7,0 k | 9,6 k | 3,2 k | 9 | 1,79 | 1,44 → 1,44 | 1,0 → 0,7 |
| normal | 10 infernal | 34 | 36 / 38 | 7,7 k | 11,2 k | 3,9 k | 10 | 1,86 | 1,82 → 1,82 | 1,8 → 1,7 |
| pesadilla | 1 ciudad | 37 | 38 / 40 | 18,4 k | 23,8 k | 5,9 k | 11 | 2,04 | **0,96 → 1,74** | **0,0 → 1,0** |
| pesadilla | 2 fortaleza | 37 | 42 / 43 | 13,5 k | 32,1 k | 5,6 k | 12 | 2,16 | 1,14 → 1,95 | 0,1 → 1,1 |
| pesadilla | 3 bosque* | 42 | 45 / 46 | 15,5 k | 40,0 k | 6,0 k | 13 | 2,28 | 1,14 → 1,89 | 0,0 → 0,8 |
| pesadilla | 4 micelial* | 48 | 48 / 49 | 17,5 k | 49,2 k | 6,5 k | 14 | 2,37 | 1,23 → 2,00 | 0,1 → 0,9 |
| pesadilla | 5 hielo | 53 | 51 / 53 | 19,7 k | 57,0 k | 7,0 k | 15 | 2,50 | 1,50 → 2,37 | 0,2 → 1,4 |
| pesadilla | 6 acuatica* | 59 | 54 / 56 | 18,8 k | 65,5 k | 7,4 k | 16 | 2,70 | 1,41 → 2,15 | 0,2 → 0,9 |
| pesadilla | 7 laberinto | 62 | 57 / 58 | 17,9 k | 74,9 k | 7,8 k | 17 | 2,79 | 1,71 → 2,52 | 0,6 → 0,9 |
| pesadilla | 8 abismo* | 64 | 60 / 61 | 18,1 k | 81,7 k | 7,3 k | 18 | 2,92 | 1,59 → 2,24 | 0,4 → 0,6 |
| pesadilla | 9 minas* | 67 | 63 / 64 | 18,2 k | 88,8 k | 6,9 k | 19 | 3,01 | 1,62 → 2,35 | 0,5 → 0,5 |
| pesadilla | 10 infernal | 70 | 65 / 66 | 18,1 k | 96,3 k | 6,4 k | 20 | 3,10 | 2,09 → 2,82 | 1,2 → 1,1 |
| infierno | 1 ciudad | 63 | 67 / 68 | 35,8 k | 88,8 k | 9,7 k | 19 | 3,25 | **1,06 → 2,70** | **0,0 → 0,6** |
| infierno | 2 fortaleza* | 63 | 70 / 71 | 35,1 k | 108,5 k | 9,5 k | 20 | 3,36 | 1,21 → 2,64 | 0,0 → 0,8 |
| infierno | 3 bosque* | 68 | 72 / 73 | 33,7 k | 126,1 k | 9,3 k | 21 | 3,50 | 1,28 → 2,79 | 0,0 → 0,7 |
| infierno | 4 micelial* | 74 | 75 / 76 | 32,3 k | 145,7 k | 9,0 k | 22 | 3,59 | 1,36 → 2,84 | 0,0 → 0,6 |
| infierno | 5 hielo* | 79 | 77 / 78 | 31,0 k | 161,6 k | 8,8 k | 23 | 3,68 | 1,42 → 2,89 | 0,1 → 0,5 |
| infierno | 6 acuatica* | 85 | 80 / 81 | 29,6 k | 178,6 k | 8,6 k | 24 | 3,79 | 1,53 → 3,02 | 0,1 → 0,8 |
| infierno | 7 laberinto* | 88 | 82 / 83 | 28,2 k | 196,8 k | 8,4 k | 25 | 3,97 | 1,65 → 2,94 | 0,3 → 0,5 |
| infierno | 8 abismo | 90 | 84 / 85 | 26,9 k | 209,6 k | 8,2 k | 26 | 4,04 | 1,89 → 3,22 | 0,4 → 0,6 |
| infierno | 9 minas* | 93 | 87 / 88 | 26,2 k | 223,0 k | 7,6 k | 27 | 4,19 | 1,84 → 3,27 | 0,7 → 0,8 |
| infierno | 10 infernal | 96 | 89 / 90 | 25,5 k | 229,8 k | 6,9 k | 28 | 4,31 | 2,33 → 3,71 | 1,3 → 1,1 |

(«Poder al entrar» tras el cambio; entre paréntesis en el antes el valor era 2,0 constante durante las primeras 5 arenas de Pesadilla y 2,39 durante las primeras 5 de Infierno: no subía.) Oro de Infierno ya con ×3 (ver §4); medido a ×2 era 4,4-6,3 k.

## 3. Incoherencias detectadas

1. **Botín muerto al cambiar de dificultad (la principal).** El nivel de objeto era el número de la arena (1-10) y la fila de `ARENA_LOOT` la de la arena, igual en las tres dificultades. La primera arena de Pesadilla pagaba como «Introducción» (poder 0,96) cuando el jugador ya llevaba 2,0 del final de Normal: **0,0-0,1 mejoras por victoria durante las 4 primeras arenas de Pesadilla y las 5 primeras de Infierno** (≈ 10 victorias sin progreso de equipo). El premio de Pesadilla/Infierno (`lootFactor` 1,7 / 2,6, +2/+4 Gemas) no alcanzaba para saltar la brecha.
2. **`loot=N` de `campaign.js` no da lo que parece.** Solo tira el cofre: ≈ 1,3 objetos útiles por victoria contra 12-37 de una victoria real (piso + cofre). Con `loot=16` el mejor stat por ranura es 1,35-1,45 contra 1,91-1,95 de 16 victorias reales (Normal) y 2,3 contra 3,1 (Pesadilla). Peor: la opción `gear` usa `autoEquipBest`, que solo llena ranuras vacías con piezas diseñadas PARA ESE guardián; medido con `loot=16` + `gear` el guardián queda con **0-1 de 6 ranuras equipadas** (Tanque `[1,1,1,0,0,1]`, Mago `[0,0,1,0,0,0]`, Cazadora `[0,0,0,0,0,0]`, 6 repeticiones). **Las mediciones de dureza hechas así miden a un guardián casi desnudo.** Comparación de prueba (Mago nv.54, Pesadilla Laberinto): `loot=16`+`gear` ganó **2/4**; `lootPath=1`+`equipBest` (equipo real de una victoria por arena previa, mejor stat por ranura) ganó **4/4**. n=4 por modo: dirección, no tasa. Se agregaron `job.lootPath` y `job.equipBest` a `campaign.js` (las opciones viejas no cambian).
3. **Oro de Infierno no premiaba el salto.** Medido a ×2: 4,4-6,3 k por victoria, **menos** que Pesadilla (5,4-7,8 k, ×1,5), porque con vida ×5,5 se matan menos enemigos por partida. Subido a ×3 (no se bajó nada): 6,9-9,7 k (≈ +25 % sobre Pesadilla).
4. **Saltos de XP.** El +5.554 de la Ciudad ya no existe (`victoryXpFor`): +0,5-0,6 k. Lo que sí sube fuerte es la victoria en Pesadilla/Infierno (24 k → 230 k): es 55-90 % del XP de cada partida y es lo que mantiene al guardián cerca del nivel esperado (ver §5). No se tocó.
5. **«Botín escaso en arenas 1-4»: no se reproduce.** Con el piso incluido caen 12-18 objetos por victoria, 2-4 Muy Raros+ y 2,2-5,3 mejoras en la primera victoria. Lo escaso es el cofre solo (2 objetos): si el crítico midió con `loot=N`, esa es la causa.
6. **Arenas que trivializan.** No hay: el poder dropeado por arena sube sin escalones (±0,1) dentro de cada dificultad; las mejoras por victoria bajan de 5 a ≈ 1 en Normal y se quedan en 0,5-1,4 en Pesadilla/Infierno (un objetivo siempre vivo, nunca nulo ni regalado).
7. **Minas (Normal)**: la partida con el piloto no terminó en 21 min (pasa por el Umbral); se interpola. Pendiente de una medición propia.

## 4. Cambios (todo en `DIFF_TIERS`, `js/systems/difficulty-tiers.js`)

| Perilla | Normal | Pesadilla | Infierno | Para qué |
|---|---|---|---|---|
| `ilvlBase` (nuevo): suma al nivel de objeto de la arena | 0 | **10** | **18** | Normal 1-10 (igual que siempre), Pesadilla 11-20, Infierno 19-28. +5 % de todos los números del objeto por nivel (`ITEM_ILVL_STEP`), con `ITEM_ILVL_MAX` 10 → 30 (Normal sigue en `ITEM_ILVL_NORMAL_MAX` = 10; la Divina cae con 10) |
| `lootRowShift` (nuevo): corre la fila de `ARENA_LOOT` | 0 | **6** | **9** | Pesadilla Ciudad paga como la arena 7; Infierno, como la Infernal (tope: última fila). Sigue multiplicando `lootFactor` |
| `lootFactor`, `itemLvl` | 1 / 0 | 1,7 / 2 | 2,6 / 4 | Sin cambios |
| `gold` | 1 | 1,5 (sin cambios) | **3** (era 2) | Ver §3.3 |
| `xp`, `lvlOffset` | | | | Sin cambios |

Matemática del criterio (verificada por `tools/items/t_coherencia_tablas.js`, sin navegador): poder esperado por objeto = Σ peso(categoría) × valor medio de la rareza / Σ peso × (1 + 0,04 × (nivel Gemas − 1)) × (1 + 0,05 × (ilvl − 1)). Antes: Normal 0,17 → 0,43; Pesadilla 0,35 → 0,61; Infierno 0,59 → 0,83 (Pesadilla Ciudad 0,35 < Normal Infernal 0,43). Después: Normal 0,17 → 0,43; Pesadilla 0,46 → 0,68; Infierno 0,77 → 0,95. El primer escalón de cada dificultad paga +7 % / +13 % sobre el último de la anterior y el final de Infierno ≈ ×2,2 el final de Normal, que es del orden de la dureza que se siente (×2-2,5, `t_difficulty.js`, bloque CALIBRACIÓN). Para reajustar: cambiar `ilvlBase` / `lootRowShift` y correr `node tools/items/t_coherencia_tablas.js` (rápido) y `coherencia_loot.js` (con `TIERCFG='{"pesadilla":{"ilvlBase":8}}'` se prueba sin editar el código).

Cambios de soporte: la etiqueta del nivel de objeto en la ficha y el inventario (`itemIlvlLabel`: «Arena 7» o «Nivel de objeto 17»), el test `t_q4_economia.js` (el tope del nivel de objeto ahora es `ITEM_ILVL_MAX`).

**Efecto sobre las mediciones de dureza de los otros agentes:** `loot=N` + `gear` bajo `tier=pesadilla/infierno` ahora genera objetos con nivel de objeto +10/+18 y fila corrida (más poder, aunque `gear` equipe casi nada). Para medir con el equipo que de verdad tiene un jugador usar `lootPath=1` (o 2) + `equipBest`. Los win rates de `PESADILLA_PAREJA.md` se midieron con un guardián casi desnudo: **con equipo real los tierMods de Pesadilla quizá estén de más** (a confirmar con más intentos).

## 5. Ritmo de progresión (XP: sin cambios, verificado)

Modelo, puntaje 80, 1 intento por arena (cada derrota extra suma partidas, no victorias):

| Hito | Victorias | Partidas (1 / 1,4 / 2 intentos por arena) | Lectura |
|---|---|---|---|
| Fin de Normal | 10 | 10 / 14 / 20 | Meta: 12-16 partidas. Con 1,4 intentos por arena (una derrota cada 2-3 arenas): **14** |
| Talentos (nv. 40) | 10-11 | 14 / 15 | Se llega al ganar la Infernal de Normal (nivel 38-40) o la primera victoria de Pesadilla. Con puntaje 40 es la 11.ª |
| Maestría (nv. 90) | **29-30** (19-20 de Pesadilla/Infierno) | 30 / 41 / 58 | Justo al cerrar Infierno (Minas/Infernal). Con puntaje 40, 60 y 100 da 29-30 también (la XP depende de la victoria con tope, no del puntaje) |

Definición del número para Maestría: **≈ 20 victorias en Pesadilla/Infierno** (rango pedido 15-30). Es la meta final de la campaña de 30 victorias: al terminar Infierno el guardián está en nv. 91-92. Coherencia nivel/dificultad: el guardián entra a Pesadilla en nv. 38-40 (esperado 37) y la brecha con el nivel esperado se queda entre −7 y +7 en Pesadilla e Infierno; en Normal va 4-13 niveles arriba del «nivel esperado» de `DIFF.arenaLevel` (esa escala de Normal es más baja que `VICTORY_XP_CFG.ref`: pendiente de unificar, no es una barrera). Por eso no se cambió `VICTORY_XP_CFG` ni `xp`.

**Oro frente a la tienda** (`js/data/pricing.js`, `SHOP_MODE`): campeón 2.500 en ambos modos (1 victoria de Normal ≈ 2,4-3,9 k alcanza). Modo `demo`: pieza de set 1.200, set 4.800, legendario 4.000: una victoria de Normal (2,4-3,9 k) paga entre la mitad y 4/5 de un set, una de Pesadilla/Infierno (5,4-9,7 k) paga un set entero o más (es la página de muestra, intencional). Modo `live` (set ×6 = 28.800, pieza 7.200, legendario 16.000): regla de `TIENDA_ROTACION.md`, una victoria no debe pasar del 25 % del set (28.800). Medido: Normal 8-14 %; Pesadilla **19-27 %** (7,8 k en el Laberinto = 27 %: cota alta por el piloto invulnerable); Infierno **24-34 %**. **Pesadilla/Infierno pueden pasar el 25 % en `live`**: no se baja el oro (decisión del dueño); la palanca es `SHOP_LIVE.priceScale.set` 6 → 8 (set 38.400 → Infierno máx. 25 %), **no aplicada** porque `t_shop_rotation.js` fija 7.200/28.800 y el modo `live` no está activo. Decisión del dueño.

## 6. Pruebas

| Prueba | Resultado |
|---|---|
| `tools/items/t_coherencia_tablas.js` (nueva, sin navegador, 30 comprobaciones) | todo OK: poder esperado monótono por arena en cada dificultad, salto premiado entre dificultades, Pesadilla/Infierno > anterior en la misma arena, probabilidad de Legendario+ monótona, nivel de objeto único y creciente, tope de XP por victoria (≤ 1,5 niveles al nivel esperado), Ciudad sin +5.554, perillas y oro |
| `t_q4_economia.js` | todos PASS |
| `t_difficulty.js` | 62 PASS, 8 FALLAS: las mismas 8 preexistentes (2 CALIBRACION, 2 SEMILLA, 4 TRAZADO). Con el host saturado la página se cae («Page crashed») de forma intermitente: repetir hasta que complete |
| `t_endless.js` | 29 PASS, 0 FALLAS |
| `endless_econ.js` (GOD=1, nv. 8, Bosque) | corre sin errores (campaña 358 oro/min, infinita 254) |

## 7. Pendientes

- Repetir las celdas interpoladas (`*`) con más de una partida: ahora hay 1 por celda medida y 10 celdas sin medir.
- Medir Minas (Normal) y los tres tierMods con equipo real (`lootPath` + `equipBest`) antes de dar por buenos los win rates de Pesadilla.
- Decidir el oro de Pesadilla/Infierno frente al precio `live` del set (§5).
- Pasivas, afijos y poderes legendarios no entran en el «poder»: una medición de combate con equipo real (varios guardianes) confirmaría que Infierno no queda demasiado fácil con ×2,2 de equipo. **HUMAN TEST REQUIRED.**
- Una victoria real suelta 12-37 objetos (hielo, laberinto e infernal tienen muchas élites): el inventario de 30 se llena en 1-2 partidas y el reciclado (`RECYCLE_GEM`) pasa a ser la regla, no la excepción.
- El nivel de objeto 11-28 permite, por intercambio entre jugadores (`js/net/net-trade.js` solo recorta), traer objetos de ilvl hasta 30: no se tocó la red.
