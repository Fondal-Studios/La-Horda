# Fase 2b: A/B pareado de los ajustes de dificultad de la Fase 2 (2026-11-15)

Encargo: probar con A/B pareado los ajustes de dificultad más claros que encontró la Fase 2 (`FASE2_BALANCE.md`, rama local `cierre-fase2`, commit 3b96dbae) y aplicar **solo** los que superen el ruido. Resultado: **ninguna variante cumple la regla fijada antes de medir; no se cambió ningún valor de balance.** El A/B queda como no concluyente para la decisión, con una señal fuerte de dosis-respuesta en Ciudad que sirve para la próxima ronda.

> **Todo es resultado de BOTS** (`tools/playtest/campaign.js`, piloto «competente» .85 / 260 ms). No hay humanos, ni cooperativo, ni red. Las tasas del piloto no son las de un jugador; las metas (Normal 70-85 %, Pesadilla 35-55 %, Infierno 15-30 %) son las orientativas de `BALANCE_DIFICULTAD_20261113.md`.

## 1. Método

- **Árbol medido**: worktree aparte de `origin/main` = `b82be0d0` (sin cambios en `js/`, `tools/`, `css/`, `index.html` respecto de `76437c9a`, el árbol de la Fase 2), servido con `python3 -m http.server`. Las variantes **no se escribieron en el árbol**: se aplicaron por partida con la opción `job.mods` del propio arnés (`Object.assign(ARENA_MODS[arena], {tierMods:{…}})`, con el bloque `tierMods` completo de la arena). Una sonda previa confirmó que la variante llega a la partida (`runDifficulty` de Ciudad Pesadilla: base vida ×6,25 / daño ×5,52; con 1,4/1,3 → ×3,5 / ×2,99).
- **Parámetros de cada partida** (los de la Fase 2): campeones base `guerrero`, `tanque`, `mago`, `soporte`; `lvl:'arena'` (Ciudad Pesadilla nivel 37, Minas Infierno 93, Laberinto Pesadilla 62 e Infierno 88); `gear` + `lootPath=1` + `equipBest`; piloto `skill .85 / reaction 260`; tope 22 min (1320 s).
- **Semillas pareadas**: misma fórmula que la Fase 2, `5000 + 7·i + índiceArena + 101·índiceDificultad`. Ciudad Pesadilla y Minas Infierno con `i = 0..9` (10 semillas por rol); **cada semilla y rol se jugó en todos los brazos de su arena**. Laberinto (solo base) con `i = 8..17`, semillas nuevas que no repiten las 8 de la Fase 2.
- **Muestra**: 320 partidas = Ciudad P 4 brazos × 40 + Minas I 2 × 40 + Laberinto P e I 2 × 40. 10 partidas por rol y brazo. 0 cuelgues, 0 `crash`, 0 errores de página. La máquina se reinició una vez al final de la tanda principal (las 280 partidas ya estaban escritas); el brazo V3 se corrió después en el mismo árbol.
- **Estadística**: prueba de signos exacta bilateral sobre pares discordantes (misma semilla y rol; victoria en un brazo y no en el otro), corrección de Holm sobre la familia de pruebas de variantes (alfa familiar 0,05); IC de Wilson 95 % por brazo; «equil.» = media de las cuatro tasas de rol (aquí coincide con la agrupada porque los cuatro roles tienen n = 10). Un tope de 22 min cuenta como no-victoria. Laberinto: Fisher exacto bilateral sobre la muestra combinada con la Fase 2.
- Partidas: `FASE2B_AB_DIFICULTAD_partidas.tsv` (320 filas, mismas columnas que la Fase 2 más `brazo`).

## 2. Regla fijada antes de medir

Escrita en el scratchpad antes de lanzar ninguna partida (resumen fiel):

- Ciudad Pesadilla: base 2,5/2,4/1,3; V1 1,8/1,7/1,2; V2 1,4/1,3/1,15 (Normal e Infierno sin cambio; Normal no se toca por los ganchos `cm_tramoyista.estructura` y `guardian_ancestral.runa_rota` de `boss-validator --strict`).
- Minas Infierno: base 1,25/1,05/1,08; VM 1,1/0,9/1,08.
- Familia de pruebas: C-V1, C-V2, M-VM con Holm, alfa 0,05.
- **Adoptar una variante de Ciudad** si: (a) mejora con p de Holm < 0,05; (b) ningún rol con prueba de signos contraria p < 0,05; (c) tasa equilibrada de la variante ≤ 55 % (no se pasa de la banda); (d) Normal ≥ Pesadilla ≥ Infierno. Si pasan las dos, la más cercana a 45 %.
- **Adoptar VM de Minas** si mejora con p de Holm < 0,05, sin rol contrario, con tasa ≤ la de Minas Pesadilla (59 %) y ≤ 35 %.
- **Laberinto**: la no monotonía es real solo si Infierno > Pesadilla con Fisher p < 0,05 en la muestra combinada; si no, es ruido y no se toca.
- **Adenda** (escrita después de ver V1/V2 y **antes** de medir V3): V1 y V2 mejoran mucho pero fallan (c). Se agrega una sola variante interpolada **V3 = 2,1/2,0/1,25** (vida ×5,25 / daño ×4,6 nominal) con las mismas semillas, pareada contra la base; la familia pasa a 4 pruebas (Holm); V3 se adopta si p de Holm < 0,05, sin rol contrario y con tasa en 35-55 %. No se prueban más variantes en esta ronda.

## 3. Ciudad Pesadilla (objetivo 1)

Multiplicador nominal de Pesadilla (`DIFF_TIERS` × `tierMods`, vida / daño): base ×6,25 / ×5,52; V3 ×5,25 / ×4,6; V1 ×4,5 / ×3,91; V2 ×3,5 / ×2,99 (la media de las otras nueve arenas es ×2,7 / ×2,3).

| Brazo | Victorias | IC Wilson | Guerrero | Tanque | Mago | Soporte | Derrotas < 120 s | Derrota mediana | Topes 22 min |
|---|---|---|---|---|---|---|---|---|---|
| Base 2,5/2,4/1,3 | 12/40 = **30 %** | 18-45 | 0/10 | 2/10 | 7/10 | 3/10 | 2 | 348 s | 6 |
| V3 2,1/2,0/1,25 | 16/40 = **40 %** | 26-55 | 0/10 | 4/10 | 7/10 | 5/10 | 2 | 486 s | 7 |
| V1 1,8/1,7/1,2 | 27/40 = **68 %** | 52-80 | 2/10 | 7/10 | 9/10 | 9/10 | 1 | 588 s | 4 |
| V2 1,4/1,3/1,15 | 26/40 = **65 %** | 50-78 | 1/10 | 7/10 | 10/10 | 8/10 | 0 | 528 s | 2 |

Pares (variante gana y base no / base gana y variante no), prueba de signos y Holm sobre 4 pruebas:

| Comparación | Pares | Var. gana | Base gana | p signos | p Holm | Por rol (var-base) |
|---|---|---|---|---|---|---|
| V1 vs base | 40 | 16 | 1 | 0,0003 | 0,0008 | guerrero 2-0, tanque 5-0, mago 2-0, soporte 7-1 (ningún rol contrario) |
| V2 vs base | 40 | 14 | 0 | 0,0001 | 0,0005 | guerrero 1-0, tanque 5-0, mago 3-0, soporte 5-0 |
| V3 vs base | 40 | 6 | 2 | 0,29 | 0,53 | guerrero 0-0, tanque 2-0, mago 1-1, soporte 3-1 |

Resultado por semilla (`V` victoria, `-` derrota, `T` tope de 22 min; semillas 5101, 5108, …, 5164 en orden):

| Rol | Base | V3 | V1 | V2 |
|---|---|---|---|---|
| Guerrero | `----------` | `----------` | `--V--V----` | `-----V----` |
| Tanque | `TTT-TV---V` | `TTTVVV-T-V` | `TTVVVVVTVV` | `VVVVVV-T-V` |
| Mago | `VVV--VVV-V` | `VVV--VV-VV` | `VVVVVVVV-V` | `VVVVVVVVVV` |
| Soporte | `T-V--VT--V` | `VTVT-TV-VV` | `VVTVVVVVVV` | `TVVVVVV-VV` |

**Decisión Ciudad: sin cambios.**
- V1 y V2 superan el ruido con holgura (p de Holm < 0,001) y no empeoran ningún rol, pero **se pasan de la banda** (68 % y 65 %, IC inferiores 52 % y 50 %): fallan el criterio (c). Pasar de 30 % a 65-68 % cambiaría un escalón brusco por una Pesadilla de Ciudad más fácil que la meta.
- V3 cae dentro de la banda (40 %) pero **no se distingue de la base** con 40 pares (6 contra 2 discordantes, p = 0,29): falla (a).
- La base medida hoy con 10 semillas por rol da 30 % (IC 18-45), algo por encima del 25 % equilibrado de la Fase 2 (que tenía 2 semillas para tanque, mago y soporte). El guerrero va 0/10 en base y en V3, 1-2/10 en V1/V2: la brecha del guerrero en Ciudad no la arregla la dificultad de la arena.
- Lo que sí deja: **una dosis-respuesta clara y no lineal**. Entre ×5,25 y ×4,5 de vida la tasa salta de 40 % a 68 %; entre ×4,5 y ×3,5 ya no sube. Un valor en torno a 2,0/1,9/1,2 (×5,0 / ×4,4) probablemente quedaría cerca del centro de la banda, pero para probar una diferencia de unos 15 puntos (30 % → 45 %) con prueba de signos hacen falta del orden de 25 semillas por rol (≈ 100 pares) con semillas nuevas, preregistrado. Queda para otra ronda.
- Topes: 6 de 40 partidas de la base y 7 de V3 terminan en el tope de 22 min (19 topes en los cuatro brazos de Ciudad, todos de tanque o soporte: 10 retenidos en el nivel 9 con el subjefe en pelea (`holdLevel` activo) y 9 en el nivel 10 con El Presentador vivo al 11-89 % de vida; el patrón ya descrito en `FASE2_BALANCE.md` §5.3). Cuentan como no-victoria; si un arreglo de esos atascos llega a main, la tasa de base subiría y habría que remedir.

## 4. Minas Infierno (objetivo 2)

| Brazo | Victorias | IC Wilson | Guerrero | Tanque | Mago | Soporte | Derrotas < 60 s | < 120 s | Derrota mediana | Topes |
|---|---|---|---|---|---|---|---|---|---|---|
| Base 1,25/1,05/1,08 | 8/40 = **20 %** | 10-35 | 1/10 | 4/10 | 3/10 | 0/10 | 4 | 8 | 315 s | 2 |
| VM 1,1/0,9/1,08 | 13/40 = **32 %** | 20-48 | 0/10 | 5/10 | 6/10 | 2/10 | 3 | 6 | 334 s | 1 |

Pares: VM gana y base no 9, base gana y VM no 4; p signos 0,27, **p Holm 0,53**. Por rol: guerrero 0-1, tanque 2-1, mago 5-2, soporte 2-0.

Resultado por semilla (5210, 5217, …, 5273):

| Rol | Base | VM |
|---|---|---|
| Guerrero | `------V---` | `----------` |
| Tanque | `VT-V-TVV--` | `VV-VV-TV--` |
| Mago | `V-V------V` | `-VVVV-V-V-` |
| Soporte | `----------` | `---V-V----` |

**Decisión Minas: sin cambios.** VM no supera el ruido (p de Holm 0,53) y además su estimación (32 %) ya roza el techo de la banda de Infierno (30 %), cuando la base (20 %) está dentro.

Lo que sí confirma esta muestra: **las muertes tempranas de Minas Infierno son reales y no son raras**. En la base, 8 de 40 partidas (20 %) se pierden antes de 120 s y 4 antes de 60 s (niveles 1-4), siempre por `mn_esclavo`, `mn_insecto` o `mn_acechador`; el golpe letal es de 289-524 de daño con el jugador ya bajo (52-364 de vida restante sobre 1 700-3 200). Con VM bajan a 6 y 3: daño -14 % en todo Infierno no las resuelve. El problema está en los primeros niveles (desgaste en los niveles 1-4), no en el multiplicador global. Un ajuste dirigido (por ejemplo, un daño por oleada temprano propio de Infierno o menos densidad de esos tipos en los primeros niveles) **no se puede expresar con `tierMods`** (que multiplican toda la partida) y queda fuera de esta ronda.

## 5. Laberinto: ¿Pesadilla < Infierno es real? (objetivo 3)

| Muestra | Pesadilla | Infierno |
|---|---|---|
| Fase 2 (semillas i = 0..7) | 14/32 = 44 % | 16/32 = 50 % |
| Fase 2b (semillas nuevas i = 8..17) | 18/40 = 45 % (IC 31-60) | 16/40 = 40 % (IC 26-55) |
| **Combinada** | **32/72 = 44 % (IC 34-56)** | **32/72 = 44 % (IC 34-56)** |

Por rol (combinada, n = 18): Pesadilla guerrero 2, tanque 17, mago 10, soporte 3; Infierno guerrero 3, tanque 16, mago 9, soporte 4. Fisher exacto bilateral p = 1,0.

**Decisión Laberinto: era ruido; sin cambios.** Con las semillas nuevas el orden se invierte (45 % > 40 %) y combinado queda empatado. Lo que sí es estable entre ambas muestras: la esfinge da el golpe letal en 26 de 46 derrotas nuevas (12 de 22 en P, 14 de 24 en I) y la diferencia entre roles (tanque 16-17/18 contra guerrero 2-3/18) es mucho mayor que la diferencia entre dificultades. Pesadilla e Infierno del Laberinto rinden casi igual para el piloto: el escalón P→I es plano (no invertido); si se quiere un escalón, una ronda futura podría endurecer Infierno, no tocar Pesadilla.

## 6. Comprobaciones (árbol sin cambios de balance)

No se adoptó ningún cambio, así que el código de juego es idéntico a `origin/main`. Igual se corrieron las comprobaciones sobre el worktree (salida real; los generados de los gates se restauraron con `git checkout --`):

| Comprobación | Resultado |
|---|---|
| `node tools/bible/boss-validator.js --strict` | `page errors: 0`, exit 0 |
| `node tools/quality/run-all.js --only t_difficulty` | `PASS 47s tools/items/t_difficulty.js` · `PASS 1 FLAKY 0 FAIL 0 (de 1)`, exit 0 |
| `node tools/quality/run-all.js --only t_campaign` | `PASS 88s tools/items/t_campaign.js` · `PASS 1 FLAKY 0 FAIL 0 (de 1)`, exit 0 |
| `node tools/balance/check-entry-reference.js` | `PASS: reference synchronization, four new-role budgets, four founder-profile budgets, known roster unchanged, invalid role reported`, exit 0 |
| `node tools/balance/entry-gate.js` | `{"registered":46,"newChampions":28,"simulations":84,"status":"PASS"}`, exit 0 |
| `python3 tools/art/test-runway-pack.py` | `test-runway-pack: 9946 comprobaciones OK`, exit 0 |

El validador de jefes solo simula Normal, así que los ganchos `cm_tramoyista.estructura` y `guardian_ancestral.runa_rota` no dependen de `tierMods.pesadilla`/`infierno`; aun así, cualquier cambio futuro debe volver a pasar `--strict`.

Aviso de herramienta: `tools/quality/run-all.js` borra **todo archivo no versionado que aparezca durante su corrida** (lo trata como captura generada), aunque lo haya escrito otro proceso. Borró este informe y su TSV mientras se escribían en paralelo a la prueba; se regeneraron desde los jsonl. Conviene no escribir archivos nuevos en el árbol mientras corre `run-all`.

## 7. Límites

- **Bots**: piloto competente .85/260, sin humanos, sin cooperativo, sin red; no esquiva proyectiles como un humano. Las conclusiones son sobre el piloto con el equipo de `lootPath=1` + `equipBest`.
- 10 semillas por rol y brazo: detecta diferencias de ~30 puntos (V1/V2), no de ~10-15 (V3, VM). V3 y VM son «no distinguibles», no «sin efecto».
- Solo los cuatro roles base; la cazadora (recomendada al empezar) y los demás campeones no se midieron.
- Los topes de 22 min (tanque y soporte) cuentan como no-victoria y dependen de atascos que se investigan aparte.
- No se midió Ciudad Infierno ni Minas Pesadilla con las variantes; la monotonía Normal ≥ Pesadilla ≥ Infierno de Ciudad se razonó con la Fase 2 (Normal 96 %, Infierno 28 %), no se remidió.
- Jsonl crudos en el scratchpad de la sesión (no versionados); lo versionado es `FASE2B_AB_DIFICULTAD_partidas.tsv`.
