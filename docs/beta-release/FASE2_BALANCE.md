# Fase 2 del cierre: balance real, mediciones de dificultad en las diez arenas (2026-11-15)

Encargo: «completar las mediciones de dificultad en las diez arenas». Este documento **solo mide y documenta**. No se cambió ningún valor de balance, kit, estadística, referencia ni gate; cualquier ajuste de la sección 7 exige A/B y revisión independiente en otra ronda.

> **Todo es resultado de BOTS** (`tools/playtest/campaign.js`, piloto automático «competente» .85 / 260 ms). No hay humanos, ni cooperativo, ni red. Una tasa de victoria del piloto no dice si una clase o una arena está «equilibrada» o «desequilibrada»: dice cómo le va a un bot con ese equipo. Donde este documento usa palabras como «fuera de banda» se refiere a las metas orientativas de `BALANCE_DIFICULTAD_20261113.md` (Normal 70-85 %, Pesadilla 35-55 %, Infierno 15-30 %, rol entre 0,6× y 1,4× la media de los otros), no a un veredicto.

## 1. Resumen

| Dificultad | 10 arenas, tasa del piloto (conteo agrupado) | Equilibrada por rol y arena | Meta orientativa |
|---|---|---|---|
| Normal | 202/220 = 92 % (IC 87-95) | 91 % | 70-85 % |
| Pesadilla | 126/240 = 53 % (IC 46-59) | 52 % | 35-55 % |
| Infierno | 95/240 = 40 % (IC 34-46) | 40 % | 15-30 % |

Con las cinco arenas nuevas medidas hoy (Fortaleza, Acuática, Laberinto, Abismo, Minas; 480 partidas, 8 semillas por rol y casilla) las cifras suben respecto de lo que se había medido con las cinco anteriores (Normal ~80 %, Pesadilla ~44 %, Infierno ~32-40 %). Las cinco nuevas dan Normal 94 %, Pesadilla 66 %, Infierno 50 % (equilibradas por rol); las cinco previas, 88 / 39 / 30 %. **El conjunto de las diez queda por encima de las metas en Normal e Infierno y dentro de la banda en Pesadilla, pero la media esconde casillas de 0 %, de 100 % y atascos** (sección 5).

Cinco hallazgos, en el orden en que afectan al jugador nuevo (detalle en la sección 6):

1. **El tanque, uno de los cuatro campeones recomendados al empezar, deja partidas sin terminar en Normal**: 4 de 50 partidas de tanque en Normal llegaron al tope de 22 min con el jefe vivo (Fortaleza 2/8, Micelial 2/2). Con la misma semilla se repite igual (4/4 repeticiones).
2. **Un caso reproducible de victoria que no se otorga**: Fortaleza Pesadilla, tanque, semilla 5144. El Caballero queda en estado `dead` en el nivel 10, no hay jefe activo, la partida no termina y sigue 900 s hasta el tope. Es el único caso de este tipo de 480, pero es un posible bloqueo, no un asunto de dificultad.
3. **Ciudad (la primera arena) da el salto más brusco de la campaña**: 96 % en Normal a 25 % en Pesadilla (-71 puntos) con las multiplicaciones nominales más altas (vida ×6,25, daño ×5,5 en Pesadilla; la media de las otras nueve arenas es ×2,7 de vida y ×2,3 de daño, y solo Micelial y Minas pasan de ×3,5 de vida). Es lo primero que ve quien abre Pesadilla.
4. **Abismo: 96/96 victorias, en las tres dificultades**, con el jugador casi sin bajar de vida (vida mínima mediana 100 % en Normal e Infierno, 88 % en Pesadilla). No hay forma de perder con este piloto; puede ser mérito de la arena o un artefacto del bot (rescates de borde: 567 colgadas, 7 caídas). Sin medir con humanos no se sabe.
5. **Escalones de dificultad desparejos y un jefe que muere casi al llegar**: Minas pasa de 100 % a 59 % a 25 % (cada escalón -41 y -34 puntos) y Laberinto no es monótono (Pesadilla 44 %, Infierno 50 %); en Laberinto el Minotauro murió en menos de 20 s en 16 de 58 victorias (en Infierno también: 11-17 s), y el Guardián del Bosque en 7 de 20. En esas arenas la dificultad está en las oleadas, no en el jefe.

Corrida: 480 partidas nuevas + 6 de diagnóstico (repeticiones de atascos con y sin sonda) + 2 de humo. 0 cuelgues, 0 «crash», 1 partida con 3 errores de página (sección 8).

## 2. Método

- **Árbol medido**: instantánea congelada de `76437c9a288bb0edc6f9d9af5867f9e01a293b06` (`git archive` en el scratchpad, servida con `python3 -m http.server`), porque la Fase 1 modificaba el árbol en paralelo. No hay diferencias de código de juego entre ese SHA y `c25aa4cb` (el árbol de las mediciones previas de `BALANCE_GUERRERO_20261115.md`): `git diff c25aa4cb 76437c9a -- js tools css index.html` es vacío. La instantánea se borró al terminar.
- **Arnés**: `tools/playtest/campaign.js` sin modificar (para las repeticiones con sonda se usó una copia con una línea extra en la instantánea, no versionada). Chromium de Playwright, ventana 844×390, 4 trabajadores en paralelo, máquina compartida con otros agentes (carga 15-40 en 4 núcleos; 447 min de pared sumados para 68,3 h de juego simulado).
- **Parámetros de cada partida** (los mismos de `BALANCE_GUERRERO_20261115.md` §1): campeones base `guerrero`, `tanque`, `mago`, `soporte`; nivel de entrada = nivel esperado de la arena y dificultad (`lvl:'arena'`: de 1 en Ciudad/Fortaleza Normal a 96 en Infernal Infierno); equipo real `lootPath=1` + `equipBest` + `gear`; piloto `skill 0,85 / reaction 260`; tope de 22 min de juego (1320 s).
- **Semillas pareadas**: `5000 + 7·i + índiceArena(campaña) + 101·índiceDificultad`, con `i = 0..7` (8 semillas). La misma semilla se usa para los cuatro roles de una casilla. `Math.random` es determinista por semilla, pero el motor mete ruido de tiempo: repetir una semilla casi siempre da lo mismo (aquí 4/4 repeticiones idénticas), no siempre.
- **Muestra**: 5 arenas nuevas × 3 dificultades × 4 roles × 8 semillas = **480 partidas** (se cumplió el objetivo de ≥ 8 por casilla de rol; ninguna casilla perdió partidas). Por arena y dificultad son 32 partidas.
- **Datos previos reutilizados, no repetidos**: Ciudad, Bosque, Micelial, Hielo e Infernal × tres dificultades. Se usan las 220 partidas base de la ronda del guerrero (`BALANCE_GUERRERO_20261115.md` §4 y §4.1): guerrero 130 (Normal 6 semillas, Pesadilla e Infierno 10 por arena) y tanque, mago y soporte 30 cada uno (2 semillas por arena y dificultad, es decir 10 por rol y dificultad). Salieron del mismo arnés y con la misma fórmula de semillas; sus jsonl crudos están en el scratchpad de aquella sesión, no versionados. **En las arenas previas los roles distintos del guerrero tienen n = 2 por casilla**: todo lo que se dice de ellos allí es indicio.
- **Por partida se registró** (en `FASE2_BALANCE_partidas.tsv`, solo las 480 nuevas): resultado (victoria / derrota / tope de 22 min), segundos, nivel alcanzado, tipo del atacante que dio el golpe letal, jefe, segundos de pelea contra el jefe, vida restante del jefe y errores de página.
- **Definiciones** (las del arnés, con sus límites): «segundos de pelea» (`bossSecs`) es el tiempo entre que aparece el jefe (nivel final) y su muerte; es una cota superior de la pelea real, que empieza cuando llega el equipo. «Causa de muerte» es el tipo del enemigo o proyectil del golpe letal, no su rango (no distingue élite de horda). «Supervivencia» son los segundos hasta el final de la partida. «Tope» es una partida que llega a 1320 s sin ganar ni perder.
- **Estadística**: intervalo de Wilson 95 % por conteo; la razón de cada rol contra la media de los otros tres usa la tasa de cada arena con igual peso por arena (macro), con IC por bootstrap de 4000 réplicas que remuestrea partidas dentro de cada casilla arena × rol (no remuestrea arenas, por lo que subestima la incertidumbre entre arenas). «Equilibrada» = media de las cuatro tasas de rol, para que el exceso de semillas de guerrero en las arenas previas (más débil) no sesgue la arena hacia abajo.
- **Calidad de los datos**: sin repeticiones ni descartes. En el servidor estático hubo 26 `BrokenPipeError` (pestañas que cierran) y una escritura del log fallida por disco lleno transitorio de la máquina (otros procesos; 17:30); no cambió ningún resultado verificable. Una carga de página falló y se reintentó sola.

## 3. Las diez arenas × tres dificultades

Victorias/partidas del piloto (todos los roles) con IC de Wilson 95 %. «Equil.» = tasa equilibrada por rol. Las filas con ★ son las cinco arenas nuevas de hoy (n = 32, 8 por rol); las otras son datos previos (n = 12 en Normal y 16 en Pesadilla/Infierno, con guerrero sobrerrepresentado).

| Arena | Normal | Pesadilla | Infierno | Equil. N / P / I | Escalón N→P / P→I (pts, equil.) |
|---|---|---|---|---|---|
| 1 Ciudad | 11/12 = 92 % (65-99) | 2/16 = 13 % (3-36) | 3/16 = 19 % (7-43) | 96 / 25 / 28 | **-71** / +3 |
| 2 Fortaleza ★ | 28/32 = 88 % (72-95) | 18/32 = 56 % (39-72) | 9/32 = 28 % (16-45) | 88 / 56 / 28 | -31 / -28 |
| 3 Bosque | 11/12 = 92 % (65-99) | 6/16 = 38 % (18-61) | 3/16 = 19 % (7-43) | 96 / 55 / 38 | -41 / -18 |
| 4 Micelial | 9/12 = 75 % (47-91) | 5/16 = 31 % (14-56) | 3/16 = 19 % (7-43) | 71 / 43 / 28 | -28 / -15 |
| 5 Hielo | 11/12 = 92 % (65-99) | 3/16 = 19 % (7-43) | 5/16 = 31 % (14-56) | 88 / 38 / 43 | **-50** / +5 |
| 6 Acuática ★ | 30/32 = 94 % (80-98) | 22/32 = 69 % (51-82) | 15/32 = 47 % (31-64) | 94 / 69 / 47 | -25 / -22 |
| 7 Laberinto ★ | 28/32 = 88 % (72-95) | 14/32 = 44 % (28-61) | 16/32 = 50 % (34-66) | 88 / 44 / 50 | -44 / +6 |
| 8 Abismo ★ | **32/32 = 100 %** (89-100) | **32/32 = 100 %** (89-100) | **32/32 = 100 %** (89-100) | 100 / 100 / 100 | 0 / 0 |
| 9 Minas ★ | **32/32 = 100 %** (89-100) | 19/32 = 59 % (42-74) | 8/32 = 25 % (13-42) | 100 / 59 / 25 | -41 / **-34** |
| 10 Infernal | 10/12 = 83 % (55-95) | 5/16 = 31 % (14-56) | 1/16 = 6 % (1-28) | 92 / 33 / 13 | **-59** / -20 |

Casillas de 100 % (Abismo × 3, Minas Normal) o 0 %: **no hay ninguna casilla de arena y dificultad en 0 %** (la más baja es Infernal Infierno, 1/16). Con n = 12-16 una casilla de 3 victorias puede ser 7-43 %.

### 3.1 Supervivencia, duración y jefe por casilla

Segundos de juego. «Superv. med.» = mediana de la duración de todas las partidas; «derrotas» = mediana de las derrotas; «duración media» incluye los topes de 1320 s. «Jefe, mediana (min)» = segundos de pelea contra el jefe en las victorias, y entre paréntesis el mínimo. «<60 s» = derrotas de menos de 60 s. Topes = partidas que llegaron a 22 min sin terminar.

| Arena | Dif. | Superv. med. | Derrotas med. | Duración media | Jefe, mediana (min) | <60 s | Topes |
|---|---|---|---|---|---|---|---|
| Ciudad | N / P / I | 558 / 413 / 611 | 537 / 302 / 520 | 590 / 528 / 594 | 80 (56) / 81 (77) / 202 (134) | 0 / 0 / 0 | 0 / 2 / 0 |
| Fortaleza ★ | N / P / I | 593 / 511 / 555 | 432 / 255 / 228 | 638 / 558 / 686 | 198 (46) / 243 (12) / 351 (22) | 0 / 0 / 0 | 2 / 2 / 9 |
| Bosque | N / P / I | 435 / 371 / 249 | 426 / 279 / 229 | 468 / 343 / 341 | 54 (15) / 26 (13) / 11 (6) | 0 / 0 / 0 | 0 / 0 / 1 |
| Micelial | N / P / I | 631 / 589 / 323 | 352 / 224 / 240 | 739 / 717 / 512 | 207 (83) / 193 (140) / 241 (94) | 0 / 0 / 0 | 2 / 5 / 3 |
| Hielo | N / P / I | 419 / 294 / 232 | 563 / 273 / 216 | 430 / 306 / 294 | 39 (20) / 54 (17) / 43 (3) | 0 / 0 / 0 | 0 / 0 / 0 |
| Acuática ★ | N / P / I | 517 / 444 / 408 | 683 / 271 / 276 | 549 / 500 / 574 | 119 (38) / 132 (31) / 317 (12) | 0 / 0 / 0 | 0 / 0 / 2 |
| Laberinto ★ | N / P / I | 419 / 364 / 382 | 369 / 254 / 267 | 418 / 375 / 384 | 42 (5) / 40 (11) / 36 (11) | 0 / 0 / 0 | 0 / 0 / 0 |
| Abismo ★ | N / P / I | 393 / 503 / 552 | sin derrotas | 404 / 544 / 567 | 35 (10) / 97 (16) / 103 (28) | 0 / 0 / 0 | 0 / 0 / 0 |
| Minas ★ | N / P / I | 442 / 461 / 354 | sin derrotas / 335 / 316 | 472 / 549 / 467 | 64 (14) / 243 (39) / 377 (48) | 0 / 0 / **2** | 0 / 0 / 2 |
| Infernal | N / P / I | 424 / 441 / 316 | 417 / 265 / 229 | 473 / 544 / 484 | 47 (12) / 131 (18) / 880 (880) | 0 / 0 / 0 | 0 / 3 / 2 |

Por dificultad (todas las partidas): Normal mediana 447 s (media 508 s, derrotas 424 s); Pesadilla 417 s (499 s, derrotas 272 s); Infierno 398 s (505 s, derrotas 262 s). El jefe de Infernal Infierno tiene una sola victoria (880 s de pelea); no se puede decir nada de su tiempo.

Derrotas de menos de 60 s: **2 de 480 nuevas** (Minas Infierno, guerrero y soporte, ambas a 47 s en el nivel 2, golpes de 446 y 289 con 2 537 y 3 059 de vida máxima). Entre las 220 previas: ninguna. Derrotas de menos de 120 s: 17 en total (480 nuevas más 220 previas), 6 de ellas en Minas (Pesadilla/Infierno) y 11 de guerrero, todas en Pesadilla o Infierno. Que una derrota llegue al nivel 10 (al jefe) pasa en: Laberinto 10/38, Infernal 9/23, Ciudad 7/26, Bosque 6/23, Acuática 4/27, Fortaleza 2/28, Hielo 2/25, Micelial 0/17, Minas 0/35. Es decir, **en Minas, Micelial y Fortaleza las derrotas ocurren en las oleadas; en Laberinto e Infernal, un tercio llega al jefe.**

### 3.2 Victorias por rol, arena y dificultad

Formato victorias/partidas. Las arenas con ★ tienen 8 semillas por rol; las demás, guerrero 6 (Normal) o 10 (Pes./Inf.) y los otros roles 2.

**Normal**

| Arena | Guerrero | Tanque | Mago | Soporte |
|---|---|---|---|---|
| Ciudad | 5/6 | 2/2 | 2/2 | 2/2 |
| Fortaleza ★ | 7/8 | 6/8 | 7/8 | 8/8 |
| Bosque | 5/6 | 2/2 | 2/2 | 2/2 |
| Micelial | 5/6 | 0/2 | 2/2 | 2/2 |
| Hielo | 6/6 | 1/2 | 2/2 | 2/2 |
| Acuática ★ | 6/8 | 8/8 | 8/8 | 8/8 |
| Laberinto ★ | 5/8 | 8/8 | 8/8 | 7/8 |
| Abismo ★ | 8/8 | 8/8 | 8/8 | 8/8 |
| Minas ★ | 8/8 | 8/8 | 8/8 | 8/8 |
| Infernal | 4/6 | 2/2 | 2/2 | 2/2 |

**Pesadilla**

| Arena | Guerrero | Tanque | Mago | Soporte |
|---|---|---|---|---|
| Ciudad | 0/10 | 0/2 | 2/2 | 0/2 |
| Fortaleza ★ | 5/8 | 4/8 | 5/8 | 4/8 |
| Bosque | 2/10 | 1/2 | 2/2 | 1/2 |
| Micelial | 2/10 | 0/2 | 2/2 | 1/2 |
| Hielo | 0/10 | 2/2 | 1/2 | 0/2 |
| Acuática ★ | 4/8 | 8/8 | 8/8 | 2/8 |
| Laberinto ★ | 1/8 | 8/8 | 3/8 | 2/8 |
| Abismo ★ | 8/8 | 8/8 | 8/8 | 8/8 |
| Minas ★ | 3/8 | 7/8 | 6/8 | 3/8 |
| Infernal | 3/10 | 0/2 | 1/2 | 1/2 |

**Infierno**

| Arena | Guerrero | Tanque | Mago | Soporte |
|---|---|---|---|---|
| Ciudad | 1/10 | 1/2 | 1/2 | 0/2 |
| Fortaleza ★ | 4/8 | 0/8 | 3/8 | 2/8 |
| Bosque | 0/10 | 1/2 | 1/2 | 1/2 |
| Micelial | 1/10 | 1/2 | 1/2 | 0/2 |
| Hielo | 2/10 | 1/2 | 1/2 | 1/2 |
| Acuática ★ | 3/8 | 6/8 | 5/8 | 1/8 |
| Laberinto ★ | 2/8 | 7/8 | 4/8 | 3/8 |
| Abismo ★ | 8/8 | 8/8 | 8/8 | 8/8 |
| Minas ★ | 1/8 | 4/8 | 2/8 | 1/8 |
| Infernal | 0/10 | 0/2 | 0/2 | 1/2 |

Algunas casillas nuevas distinguen roles con claridad aun con n = 8: Acuática Pesadilla (tanque y mago 8/8 contra soporte 2/8), Laberinto Pesadilla (tanque 8/8 contra guerrero 1/8) y Fortaleza Infierno (tanque 0/8 contra guerrero 4/8; el 0/8 del tanque son 2 derrotas y 6 topes de 22 min con el jefe vivo: ver §5.3).

## 4. Por dificultad y por rol

Tasa por rol: victorias/partidas agrupadas (IC de Wilson 95 %) y, entre corchetes, la tasa con igual peso por arena («macro»). La razón es el macro del rol dividido por la media macro de los otros tres, con IC de bootstrap.

| Dificultad | Guerrero | Tanque | Mago | Soporte |
|---|---|---|---|---|
| Normal | 59/70 = 84 % (74-91) [84 %] | 45/50 = 90 % (79-96) [83 %] | 49/50 = 98 % (90-100) [99 %] | 49/50 = 98 % (90-100) [99 %] |
| Pesadilla | 28/90 = 31 % (22-41) [33 %] | 38/50 = 76 % (63-86) [59 %] | 38/50 = 76 % (63-86) [78 %] | 22/50 = 44 % (31-58) [39 %] |
| Infierno | 22/90 = 24 % (17-34) [27 %] | 29/50 = 58 % (44-71) [51 %] | 26/50 = 52 % (39-65) [48 %] | 18/50 = 36 % (24-50) [34 %] |

(El macro del tanque queda por debajo de su tasa agrupada porque en las cinco arenas previas tiene solo 2 partidas por casilla y varias casillas dieron 0/2.)

| Dificultad | Guerrero / media otros | Tanque / media otros | Mago / media otros | Soporte / media otros |
|---|---|---|---|---|
| Normal | 0,90× (0,81-0,99) | 0,88× (0,80-0,96) | 1,12× (1,06-1,17) | 1,12× (1,06-1,17) |
| Pesadilla | **0,57×** (0,43-0,73) | 1,18× (0,97-1,44) | **1,78×** (1,46-2,17) | 0,69× (0,44-0,94) |
| Infierno | **0,60×** (0,43-0,82) | 1,43× (0,97-2,00) | 1,28× (0,83-1,80) | 0,81× (0,49-1,20) |

Lo que **depende del conjunto de arenas** (misma técnica, dos subconjuntos):

| | Guerrero Pes. | Mago Pes. | Guerrero Inf. | Mago Inf. |
|---|---|---|---|---|
| 5 arenas previas (guerrero n = 50, otros n = 10) | 14 % (0,30×) | 80 % (3,24×) | 8 % (0,22×) | 40 % (1,54×) |
| 5 arenas nuevas (n = 40 por rol) | 53 % (0,75×) | 75 % (1,20×) | 45 % (0,87×) | 55 % (1,14×) |

Es decir: **el «guerrero ≈ 0,30× / 0,22× en Pesadilla/Infierno» de las rondas previas no se repite en las cinco arenas nuevas** (0,75× y 0,87×, ambas dentro de la banda 0,6-1,4×). El rol débil o fuerte cambia según la arena: el guerrero gana 8/8 en Abismo y 4/8 en Fortaleza Infierno (el mejor valor del rol tras Abismo) pero 1/8 en Laberinto Pesadilla; el tanque va 8/8 en Acuática y 0/8 en Fortaleza Infierno (por topes, no por derrotas). Con los cuatro roles base esto sugiere que la razón depende de la arena (esfinges y proyectiles castigan al guerrero en Laberinto; el jefe de Fortaleza no lo vence el tanque), no de un único rol «roto». **No se declara equilibrada ni desequilibrada ninguna clase.** El soporte queda en 0,66-0,69× en las cinco nuevas (Acuática 2/8, Laberinto 2/8, Minas 3/8 en Pesadilla) y 0,69-0,81× en el global; con n = 8-50 y los IC de arriba la señal es débil.

Duración por rol (mediana de todas / mediana de derrotas, en segundos): Normal guerrero 445/426, tanque 480/563, mago 402/288, soporte 485/368; Pesadilla guerrero 332/275, tanque 691/317, mago 407/257, soporte 417/266; Infierno guerrero 280/229, tanque 790/397, mago 383/252, soporte 419/291. **La media del tanque es de 757-834 s en Pesadilla/Infierno** por los topes (23 de los 35 topes son de tanque).

## 5. Banderas

### 5.1 Casillas siempre ganadas y arenas sin victoria posible

- **Siempre ganadas** (el piloto): Abismo en Normal, Pesadilla e Infierno (96/96) y Minas Normal (32/32). Con 32 partidas el IC de Wilson inferior es 89 %: no se puede afirmar «imposible de perder», solo que no se perdió en 32 intentos pareados.
- **Sin victorias posibles (0 %)**: ninguna arena × dificultad. Casillas de rol con 0 victorias: Fortaleza Infierno tanque (0/8: 6 topes de 22 min y 2 derrotas), Ciudad Pesadilla guerrero 0/10, Hielo Pesadilla guerrero 0/10, Bosque Infierno guerrero 0/10, Infernal Infierno guerrero 0/10 (y tanque y mago 0/2), Ciudad y Micelial Pesadilla tanque 0/2. Los 0/10 se repiten en cuatro arenas **previas** de guerrero.
- **Abismo** (por qué importa): con tierMods de Pesadilla ×1,15/1,1/1,0 e Infierno ×0,72/0,63/0,8 sobre los de la dificultad, el multiplicador nominal de daño de Abismo Infierno (×2,84) queda por debajo del de Minas (×4,73), Micelial (×5,18), Fortaleza (×3,15) y Acuática (×2,93) y por encima solo del de Infernal (×2,70), Laberinto (×2,48) y Hielo (×2,03). El Abismo se ganó con vida mínima mediana de 100 % (N), 88 % (P), 100 % (I); `falls` 7 y `hangs` 567 (las colgadas del borde se rescataron). No se midió sin el rescate del piloto ni con humanos: **puede ser un artefacto del bot** (el mecanismo de rescate de borde sale bien parado con aliados controlados por bot) y no se debe leer como «la arena es fácil».

### 5.2 Jefes que mueren muy rápido (< 20 s de pelea) y jefes con vida restante

Victorias con jefe muerto en menos de 20 s (cota superior de la pelea, contada desde que aparece el jefe):

| Arena | Normal | Pesadilla | Infierno | Total |
|---|---|---|---|---|
| Laberinto (Minotauro) | 7/28 | 4/14 | 5/16 | **16/58** (mediana 36-42 s) |
| Bosque (Guardián Ancestral) | 3/11 | 2/6 | 2/3 | **7/20** (mediana 11 s en Infierno; mínimo 6 s) |
| Abismo (Morador) | 3/32 | 1/32 | 0/32 | 4/96 |
| Hielo (Ángel Caído) | 0/11 | 1/3 | 1/5 | 2/19 (mínimo 3 s en Infierno) |
| Infernal | 1/10 | 1/5 | 0/1 | 2/16 |
| Fortaleza, Acuática, Minas, Ciudad, Micelial | 0-1 por casilla | | | 3/214 |

El Guardián del Bosque y el Minotauro **no escalan con la dificultad**: Laberinto Infierno mata al jefe en 11-17 s con el nivel de entrada 88, igual que en Normal con 26 (la vida del jefe sube con el nivel del héroe, pero el equipo también). En cambio Minas (mediana 64 → 243 → 377 s), Acuática (119 → 132 → 317 s) y Fortaleza (198 → 243 → 351 s) sí escalan. No hay una meta de duración del jefe en los documentos de balance; **falta decidir cuál es el objetivo** antes de decir si 11 s es poco.

### 5.3 Jefes que no mueren: partidas que llegan al tope de 22 min

35 de 700 partidas (5,0 %): 17 nuevas (Fortaleza 13, Acuática 2, Minas 2) y 18 previas (Micelial 10, Infernal 5, Ciudad 2, Bosque 1). Por dificultad: Normal 4, Pesadilla 12, Infierno 19. Por rol: 23 de tanque, 9 de soporte y 3 de guerrero. Clasificación:

| Tipo | Partidas | Detalle |
|---|---|---|
| Jefe vivo con vida restante parcial (3-90 %) | 18 | Fortaleza (tanque y soporte; Infierno 7-62 %, Pesadilla 57 %, Normal 40 %), Minas Infierno tanque 9 % y 16 %, Acuática Infierno tanque 16 %; previas: Micelial 36-83 %, Infernal 74-87 % |
| Jefe vivo con 94-100 % de vida tras 800-940 s | 11 | Acuática Infierno tanque (95 %), Infernal (3 casos, tanque y soporte), Micelial (guerrero 100 %; tanque 96-98 %), Bosque Infierno soporte 100 %, Fortaleza Infierno soporte 100 %. El jefe casi no recibe daño: o el piloto no lo ataca/alcanza, o la pelea no deja hacer daño (la sonda no cubrió estos casos) |
| **Jefe casi muerto (≤ 3 %) o ya muerto sin victoria** | 2 | Fortaleza Normal tanque 5015 (43 de 7 020 de vida tras 886 s; con sonda: fase 3, a ~360 px del jugador, sin perder vida); **previa, Micelial Pesadilla soporte 5104: el jefe figura muerto (`alive=false`, vida -100) a 22 min y la partida no registró victoria** (no se repitió). Ver §6.2 |
| **Jefe nunca aparece / `dead` sin victoria** | 1 | Fortaleza Pesadilla tanque 5144: `fortS.knight.state === "dead"` desde ~420 s en el nivel 10, `boss` nulo, `bossActive` falso, `levelDuration` infinito; 900 s sin terminar (§6.2) |
| Nivel retenido por un subjefe | 3 | Fortaleza Infierno tanque 5224 (nivel 6 retenido por `dragon_forja`, 119 357 de vida máxima); Ciudad Pesadilla tanque y soporte, nivel 9 retenido por `cm_dama` |

**¿Bug o dificultad?** Los 4 casos de Fortaleza que se repitieron (semillas 5144 P, 5015 N, 5029 N, 5224 I) **dieron el mismo resultado exacto las 4 veces**, así que no son azar de partida. Las sondas de 30 s en 5144 y 5015 indican que **5144 se parece a un bug** (estado `dead` sin victoria registrada) y 5015 a un atasco (el jefe vivo a 400 px sin pelear; no se pudo ver qué lo bloquea). Los topes con el jefe sano (11 casos) no se pueden clasificar con estos datos: dificultad real del tanque/soporte (DPS bajo contra jefes de 150 000-650 000 de vida) y atasco son igual de compatibles. Un jugador real vería una pelea de 20 minutos sin progreso.

### 5.4 Escalones bruscos

Criterio: caída de más de 40 puntos de tasa equilibrada entre dos dificultades consecutivas. Todas son medidas del piloto con n = 12-32 por casilla.

| Arena | N → P | P → I | Nota |
|---|---|---|---|
| Ciudad | -71 | +3 | n = 12/16: 11/12 → 2/16; IC (65-99) → (3-36) |
| Infernal | -59 | -20 | 10/12 → 5/16 → 1/16 |
| Hielo | -50 | +5 | **no monótona** (Infierno ≥ Pesadilla) |
| Laberinto | -44 | +6 | **no monótona**: 44 % → 50 % (n = 32; IC solapados) |
| Bosque | -41 | -18 | |
| Minas | -41 | -34 | 32/32 → 19/32 → 8/32: el único con escalones grandes seguidos |
| Fortaleza | -31 | -28 | |
| Micelial, Acuática | -28/-25 | -15/-22 | los más graduales |
| Abismo | 0 | 0 | plano |

Multiplicadores nominales (`DIFF_TIERS` × `ARENA_MODS[...].tierMods`, solo vida / daño; **no** incluyen nivel de entrada, resistencias, élites, `enemyHpMult` ni `enemyDmgPerWave`): Ciudad Pesadilla 6,25 / 5,52 e Infierno 11,0 / 8,55 (los más altos); Micelial P 3,75 / 3,22, I 6,6 / 5,18; Minas P 4,13 / 3,45, I 6,88 / 4,73; Hielo P 1,75 / 1,61, I 2,48 / 2,03 (los más bajos); Abismo P 2,88 / 2,53, I 3,96 / 2,84; Laberinto P 2,25 / 2,07, I 3,03 / 2,48. Las dos arenas con el mayor escalón de Pesadilla (Ciudad -71, Infernal -59) no tienen los mismos multiplicadores (Infernal P 2,38 / 1,96): el multiplicador no explica por sí solo el escalón; lo explica además la mecánica de cada arena.

### 5.5 Causa de muerte (tipo de atacante del golpe letal)

Derrotas por arena; las cuatro nuevas con una arena dominada por un tipo:

| Arena | Derrotas | Principales atacantes letales |
|---|---|---|
| Laberinto ★ | 38 | **esfinge (proyectil) 24 (63 %)**, proyectil de estilo (`updateEnemyProjectileStyle`) 6, medusa (proyectil) 5 |
| Acuática ★ | 27 | **tiburón blanco 12, tiburón joven 7 (70 % entre los dos)**, leviatán 2, sirena abisal 2 |
| Minas ★ | 35 | **esclavo 12, insecto 11 (66 %)**, `bossHitHero` (jefe y proyectiles de Cerbero) 8, acechador 3 |
| Fortaleza ★ | 28 | verdugo 9, araña (proyectil) 7, autómata 5, prisionero 3, caballero 2 |
| Ciudad (prev.) | 26 | saqueador 9, `bossHitHero` 7, acechante/espectro/perro |
| Bosque (prev.) | 23 | dama del bosque (proyectil) 11, bestia 6 |
| Infernal, Hielo, Micelial (prev.) | 23 / 25 / 17 | esqueleto, demonio menor, demonio_hielo_fuego 8, peregrino (proyectil) 8 |

Que **un único tipo de enemigo mate en dos de cada tres derrotas** en Laberinto (esfinge), Acuática (tiburones) y Minas (esclavo/insecto) es un dato útil para el diseñador y a la vez no prueba que ese enemigo esté mal: el piloto no esquiva proyectiles como un humano.

## 6. Hallazgos priorizados (qué afecta al jugador nuevo primero)

Nota previa: el selector de inicio recomienda **tanque, mago, soporte y cazadora** (`js/ui/starter-select.js`), no el guerrero; el campeón por defecto es el mago. La cazadora (tirador) **no se midió**. Las arenas que ve primero un jugador nuevo son Ciudad, Fortaleza y Bosque, en Normal.

### 6.1 Prioridad alta: lo que ve el jugador nuevo

1. **Tanque en Normal: 4/50 partidas sin terminar** (Fortaleza 2/8 con el jefe a 1 % y 40 % de vida tras 886-957 s; Micelial 2/2 previas con el jefe a 83 % y 50 %). Con 8 de 50 el IC de Wilson de la tasa de topes es 3-19 %. Es la casilla del campeón que el juego recomienda para «aprender». *Evidencia que falta:* qué impide rematar al jefe (sección 6.2) y si un humano con tanque lo remata.
2. **Ciudad Normal 11/12 (92 %) y Ciudad Pesadilla 2/16 (13 %)**: el paso de Normal a Pesadilla en la primera arena es el mayor del juego (-71 puntos) y con los multiplicadores nominales más altos. Quien termine la campaña en Normal y abra Pesadilla entra por Ciudad. *Evidencia que falta:* n = 2 por casilla de rol en Ciudad (mago 2/2, los otros 0/2 en Pesadilla); humanos.
3. **Fortaleza Normal**: 88 %, la derrota media a los 432 s y 2/32 topes de tanque. Es la segunda arena y la primera en la que el piloto deja topes en Normal.
4. **Primeros minutos**: no hay derrotas antes de 60 s salvo Minas Infierno (2, ambas nivel 2); no se encontró un problema en los primeros 60 s de Normal.

### 6.2 Posibles bloqueos (para revisar en código, no en balance)

- **Fortaleza Pesadilla, tanque, semilla 5144: el Caballero muere (`knight.state="dead"`) y la partida no termina** (jefe nulo, `levelDuration` infinito, 900 s). Reproduce 2/2. Un jugador que mate al Caballero así (o que lo mate otra cosa) y no vea victoria perdería la partida por tiempo. Hace falta leer el flujo de victoria de `js/arenas/fortaleza/` (muerte del Caballero → fin de partida) antes de decir causa.
- **Fortaleza Normal, tanque, 5015 y 5029: el Caballero queda casi muerto (43 de 7 020 de vida en 5015, 40 % en 5029 tras 957 s) sin que nadie lo remate**; con la sonda en 5015, 120+ s con el jefe en `fight/3`, sin invulnerabilidad (`dmgTakenMult` 1) y a ~360 px del jugador. Reproducen igual en la repetición.
- **Fortaleza Infierno, tanque, 5224: nivel 6 retenido por `dragon_forja`** (1163 s en el nivel). `fortHoldLevel` impide terminar el nivel 6 mientras el Dragón siga vivo; el tanque no lo mata en 20 minutos. Dificultad o atasco, no distinguible aquí.
- Ciudad Pesadilla tanque/soporte, nivel 9 retenido por `cm_dama` (previo, 2 partidas).
- **Micelial Pesadilla, soporte, semilla 5104 (previa): el jefe figura muerto (`boss.alive=false`) y la partida llegó a 22 min sin victoria.** Segundo caso de «jefe muerto sin victoria» junto con Fortaleza 5144; este no se repitió ni se sondeó.

### 6.3 Prioridad media

5. **Abismo 96/96** (§5.1).
6. **Minas**: la arena con mayor escalón doble (100 → 59 → 25 %), 2 derrotas a 47 s en Infierno y 6 derrotas de menos de 120 s. Fortaleza Infierno (28 %) y Minas Infierno (25 %) son las dos arenas nuevas más duras; Micelial 19 % y Hielo 31 % entre las previas.
7. **Laberinto**: esfinge letal en el 63 % de las derrotas; Pesadilla guerrero 1/8 contra tanque 8/8; el jefe muere en < 20 s en el 28 % de las victorias.
8. **Infierno por encima de la meta en el conjunto (40 % contra 15-30 %)** pero con arenas de 6 % (Infernal), 13 % por rol. La media no es una buena guía.

### 6.4 Prioridad baja o informativa

9. **Guerrero**: la brecha de rondas previas (0,30× / 0,22×) no se reproduce en las cinco arenas nuevas (0,75× / 0,87×); el IC combinado de las diez es 0,43-0,73× en Pesadilla y 0,43-0,82× en Infierno (el límite superior de ambos ya toca o supera 0,6×). No se concluye nada sobre «el guerrero».
10. **Mago**: 1,78× en Pesadilla (IC 1,46-2,17), pero 1,20× en las cinco arenas nuevas.
11. **Soporte**: 0,69× / 0,81× con IC que incluyen 1 en Infierno.

## 7. Propuestas NO aplicadas (con evidencia que falta)

Ninguna de las siguientes se ejecutó ni se aplicó. El tamaño de muestra es por brazo (dos proporciones independientes, 80 % de potencia, α = 0,05 bilateral); el apareo por semilla puede reducirlo, no se contó.

| # | Pregunta | Variante A/B propuesta | Partidas por brazo | Qué se mediría | Por qué no se ejecutó |
|---|---|---|---|---|---|
| P1 | ¿El tope de tanque en Fortaleza es bug o dificultad? | Diagnóstico, no A/B: sonda cada 5 s sobre las 4 semillas de §5.3 registrando daño del jugador al jefe, su distancia y sus estados (`fortS.knight`, `fortHoldLevel`); luego 20 partidas de tanque en Fortaleza Normal con la causa corregida (en una rama de prueba) | 4 (sonda) y 20 (confirmación) | Topes / partidas, `bossSecs`, `hp` del jefe | Pide leer código del arnés y de Fortaleza; es trabajo de Fase 1 o de código, no de medición |
| P2 | ¿Se puede suavizar el salto Normal → Pesadilla de Ciudad? | Ciudad Pesadilla tierMods 2,5/2,4/1,3 → 1,6/1,5/1,2 (un solo valor cambiado) | **89 por brazo** para pasar de 25 % a 45 % equilibrado (4 roles × 22 semillas) | Victorias, supervivencia, derrotas < 120 s | Es un cambio de balance: exige A/B + revisión; la meta Pesadilla 35-55 % se cumple en el global, no por arena |
| P3 | ¿Abismo puede perderse? | (a) misma matriz con el rescate de borde del piloto desactivado; (b) Pesadilla/Infierno tierMods 1,15 / 0,72 → 1,6 / 1,2 | 32 (4 roles × 8) por brazo y dificultad; para ver 100 % → ≤ 75 %: 27 por brazo | Tasa, vida mínima, caídas | No se toca balance; (a) solo cambia el piloto |
| P4 | ¿Minas escala demasiado? | Pesadilla tierMods 1,65/1,5/1,15 → 1,3/1,2/1,1 | 75 por brazo para ir de 59 % a 80 % | Tasa, derrotas < 120 s | Idem |
| P5 | ¿La esfinge de Laberinto es el problema? | Esfinge: daño o velocidad de proyectil -20 % solo en Pesadilla/Infierno | 152 por brazo para 44 % → 60 % | Tasa, % derrotas por esfinge | Idem; con n = 8 por rol la partida de Laberinto no basta |
| P6 | ¿Guerrero con esquiva (variante B de la ronda anterior)? | La ya implementada y apagada | 150-180 (`BALANCE_GUERRERO_20261115.md` §5); **estratificar por arena**, porque la brecha del guerrero hoy es de arenas previas (0,30× frente a 0,75× en las nuevas) | Tasa de guerrero y razón contra otros roles | Sin concluir por el ruido; ahora hay que estratificar |
| P7 | ¿Duración objetivo del jefe? | Decisión de diseño sin A/B: fijar una meta (p. ej. de 60 a 180 s de pelea) y luego probar Bosque y Laberinto | 24 por brazo para mediana de duración | `bossSecs` | No hay meta numérica documentada |
| P8 | ¿Cuánto cuesta cada tipo de piloto? | Repetir una casilla con piloto aprendiz (.45/650) y habitual (.9/220) | 32 por perfil y casilla | Tasa por perfil | `SIMULACION_ALFA_30.md` ya vio que el gradiente de pilotos no es claro |

Cuánta muestra falta para concluir (aproximada, α = 0,05 bilateral, 80 % de potencia): guerrero 33 % contra otros 58 % en Pesadilla, **62 por brazo**; guerrero 27 % contra 44 % en Infierno, **124**; tanque 59 % contra mago 78 %, **93**; soporte 39 % contra tanque 59 %, **97**; arena 56 % contra 69 % (Fortaleza contra Acuática en Pesadilla), **217**; cualquier diferencia de 10 puntos alrededor de 40 %, **388**; de 20 puntos, **97**. Hoy hay 8 partidas por rol y casilla (semiancho del IC 95 % de ±35 puntos), 32 por arena y dificultad (±17) y 40-50 por rol y dificultad (±14-15): con esa muestra solo se distinguen diferencias de más de ~25-35 puntos.

## 8. Errores, cuelgues y límites

**Errores y cuelgues**: 0 `crash`, 0 cuelgues, 0 partidas perdidas. Una partida (Laberinto Pesadilla soporte, 5121) registró 3 errores de página (`ufDefForm is not defined` ×2, `ufChamp is not defined`): son funciones de `js/champions/ult-forms/kit.js`; la partida terminó (derrota por esfinge) y el error parece de carga de script bajo la carga de la máquina (hubo un lapso de disco lleno a las 17:30); no se reprodujo y no se investigó. Una carga de página falló y el arnés la reintentó. En las 220 partidas previas: 0 errores de página.

**No se midió**:
- Arena Divina (asedio 4v4, «todavía sin combate» según `js/data/arenas.js`) y Coliseo (torneo 2v2 contra bots, en `js/arenas/coliseum/`): no son arenas de oleadas y `campaign.js` no las ejecuta; no hay dificultad Normal/Pesadilla/Infierno medible con este arnés.
- Los demás 40+ campeones (cazadora, nigromante, asesinos, tiradores, etc.); el selector de inicio recomienda a la cazadora.
- Cooperativo, humanos, pilotos aprendiz/ocasional/habitual (solo el competente .85/260), nivel de entrada distinto del esperado, equipo distinto de `lootPath=1 + equipBest`.
- En las arenas previas, los roles distintos del guerrero tienen 2 semillas por casilla (no se repitieron para no duplicar lo medido).
- No se midió con humanos si un atasco del §6.2 se ve igual; ni la causa del tope de 11 partidas con el jefe sin daño.
- Los jsonl crudos (previos y nuevos) quedaron en el scratchpad de la sesión (no versionados, pueden desaparecer); lo versionado es la tabla de las 480 partidas nuevas en `FASE2_BALANCE_partidas.tsv`.

**Límites estadísticos**: un resultado agrupado no es una prueba: 5 de las 10 arenas tienen n = 12 en Normal; los IC de Wilson de las casillas de 8 partidas son de ±35 puntos; los IC de la razón no incluyen la variabilidad entre arenas; las tasas «equilibradas» asignan igual peso a cuatro roles que no son equiprobables entre jugadores. Las tasas absolutas del piloto no se pueden comparar con las de un humano.

**Procedimientos y comprobaciones**: no se ejecutaron `check-entry-reference`, `entry-gate` ni `ability-gate` porque no se tocó ningún campeón, referencia ni gate. No se modificó ningún archivo del repo salvo este documento y su TSV.

**Reproducir**: instantánea de `76437c9a`; trabajos `{cls, arena, tier, lvl:'arena', lvlAdd:0, skill:.85, reaction:260, seed:5000+7*i+índiceArena+101*índiceDif, gear:true, lootPath:1, equipBest:true}` con `i = 0..7`, clases `guerrero,tanque,mago,soporte`, arenas `fortaleza,acuatica,laberinto,abismo,minas`; `PLAYWRIGHT_MODULE=/opt/node22/lib/node_modules/playwright node tools/playtest/campaign.js jobs.json out.jsonl <puerto>` con el repo servido por `python3 -m http.server`.
