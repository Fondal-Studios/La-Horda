# Dificultad, grupo 2: Gélida (hielo), Acuática y Laberinto

Decisión del dueño: «si hay barreras, hay que cambiar la dificultad e ir cambiándola hasta que quede una dificultad adecuada en TODAS las dificultades» (Normal, Pesadilla, Infierno).
Este documento cubre solo `ARENA_MODS.hielo`, `.acuatica` y `.laberinto` (otros dos agentes hermanos tienen las demás arenas). Los valores viven en `js/data/arenas.js`
(`tierMods.pesadilla` y `tierMods.infierno`, aplicados por `diffApplyToRun` en `js/systems/difficulty-tiers.js`, sin cambios en el motor). No se tocó `js/net/*`, `server/*`, campeones ni drops/XP/oro.

## 1. Cambio de método (importante)

Todo lo medido antes (PESADILLA_PAREJA.md y mis primeras corridas) usaba `loot=N` + `gear` de `tools/playtest/campaign.js`. La rama de coherencia (`docs/economy/COHERENCIA.md`) demostró que eso deja al guardián
casi desnudo (`loot=N` tira solo el cofre, ~2 objetos por victoria contra 12-37 de una victoria real; `gear` solo llena ranuras vacías). Se descartó y se re-midió TODO así:

- `lootPath=1` + `equipBest`: el equipo real de 1 victoria en cada arena anterior a la medida, en el orden Normal → Pesadilla → Infierno (`tools/balance/real-loot.js`; mezcla ya con el botín nuevo de Pesadilla/Infierno de COHERENCIA: `ilvlBase`, `lootRowShift`).
  Posición en la campaña: Gélida es la 5.ª arena (4 victorias previas en Normal), Acuática la 6.ª (5), Laberinto la 7.ª (6); en Pesadilla se suman las 10 de Normal + las previas de Pesadilla; en Infierno, además, las 10 de Pesadilla.
- Nivel del guardián al entrar: el del modelo de COHERENCIA §2 (promedio de 1 y 1,4 intentos por arena): Normal 24 / 27 / 30, Pesadilla 52 / 55 / 57, Infierno 77 / 80 / 82 (Gélida / Acuática / Laberinto). Antes se usaba 54 fijo, que no corresponde a Infierno.
- Perfiles de Normal (los de `tools/ux/playtest.js`): aprendiz skill 0,45 / reacción 650 ms, ocasional 0,7 / 400, habitual 0,9 / 220 (opciones `skill`/`reaction` nuevas en `campaign.js`), con Tanque, Mago y Cazadora rotando.
  Pesadilla e Infierno: skill 0,9 / reacción 220, Tanque, Mago, Cazadora y Soporte.
- Semillas fijas por intento (`seed = 1000 + 7·k`, `Math.random` determinista), pero el host estaba muy cargado y es ruidoso: la misma semilla no repite la misma partida. Intervalos: Wilson 95 %.
- Herramientas agregadas a `campaign.js`: `skill`/`reaction` por trabajo, reintento de un trabajo si la página falla al cargar (host cargado: «Page crashed» / `startRun is not defined`), `CHROMIUM_PATH`. La opción `lootPlan` (una victoria por entrada con el botín de su dificultad) quedó como método intermedio y no se usó para los resultados finales.

## 2. Resultado final (código en esta rama)

Victorias / intentos (IC 95 % Wilson). Por campeón, n = 4 cada uno (solo indica dirección).

| Arena | Dificultad | tierMods (hp / dmg / jefes) | Total | Tanque | Mago | Cazadora | Soporte | Objetivo |
|---|---|---|---|---|---|---|---|---|
| Gélida | Normal (aprendiz / ocasional / habitual) | sin ajuste (hack propio del motor ×0,85 vida ×0,8 daño) | 6/6 · 6/6 · 6/6 (IC 61-100) | – | – | – | – | 60 / 80 / 95 % |
| Gélida | Pesadilla | 0,7 / 0,7 / 0,8 | 11/16 = 69 % (44-86) | 4/4 | 4/4 | 2/4 | 1/4 | 40-70 % |
| Gélida | Infierno | 0,55 / 0,55 / 0,7 | 5/16 = 31 % (14-56) | 2/4 | 2/4 | 1/4 | 0/4 | 25-55 % |
| Acuática | Normal (aprendiz / ocasional / habitual) | sin ajuste | 6/6 · 6/6 · 6/6 | – | – | – | – | 60 / 80 / 95 % |
| Acuática | Pesadilla | 0,75 / 0,75 / 0,85 | 11/16 = 69 % (44-86) | 4/4 | 3/4 | 2/4 | 2/4 | 40-70 % |
| Acuática | Infierno | 0,65 / 0,65 / 0,75 | 9/16 = 56 % (33-77) | 1/4 | 4/4 | 2/4 | 2/4 | 25-55 % |
| Laberinto | Normal (aprendiz / ocasional / habitual) | sin ajuste (maná ×0,5, pociones ×2,2, vida ×0,8) | 6/6 · 6/6 · 6/6 | – | – | – | – | 60 / 80 / 95 % |
| Laberinto | Pesadilla | 0,9 / 0,9 / 0,85 | 7/16 = 44 % (23-67) | 4/4 | 2/4 | 1/4 | 0/4 | 40-70 % |
| Laberinto | Infierno | 0,55 / 0,55 / 0,7 | 7/16 = 44 % (23-67) | 4/4 | 1/4 | 1/4 | 1/4 | 25-55 % |

Normal: 81/81 victorias (27 de la línea base + 54 de la verificación; 6 por arena × perfil en la verificación) entre las 3 arenas × 3 perfiles, con la mediana de partida ~390-440 s. Las tasas altas de Normal son ciertas **con este autopiloto y estos niveles de llegada**: ver §5.
Monotonía medida: en cada arena Normal (100 %) > Pesadilla (56-69 %) > Infierno (31-56 %). Acuática y Laberinto tienen IC de Pesadilla e Infierno que se solapan (69 vs 56 %, 56 vs 44 %): el orden es el esperado pero no está demostrado con n = 16.

## 3. Historia de pasos (antes → después, con el método nuevo salvo donde se indica)

| Arena | Dificultad | Paso | tierMods | Resultado |
|---|---|---|---|---|
| todas | Normal | Método viejo (`loot=N`+`gear`, nivel arenaLevel 17/23/26), referencia | sin ajuste | Gélida 22 / 29 / 20 % (aprendiz / ocasional / habitual, n = 9 / 7 / 5), Acuática ~45 %, Laberinto aprendiz 20 %: «barrera», pero era de un guardián desnudo |
| Gélida | Normal | Método viejo, probes | 0,8 → 0,7 → 0,6 (hp/dmg) | 67-100 %; descartado: el método estaba mal |
| todas | Normal | Método nuevo, línea base | sin ajuste | 3/3 por celda (9/9 por arena × perfil parcial) → luego 54/54: no hay barrera, no se toca |
| Gélida | Pesadilla | Método nuevo, valor de PR #160 | 0,35 / 0,3 / 0,55 | 15/16 = 94 % (demasiado fácil) |
| Acuática | Pesadilla | ídem, valor de PR #160 | 0,6 / 0,5 / 0,8 | 16/16 = 100 % |
| Laberinto | Pesadilla | ídem, valor de PR #160 | 0,5 / 0,4 / 0,7 | 10/10 = 100 % |
| Gélida | Pesadilla | sin ajuste | 1 / 1 / 1 | 2/8 = 25 % (solo gana el Tanque) |
| Acuática | Pesadilla | sin ajuste | 1 / 1 / 1 | 2/6 = 33 % |
| Laberinto | Pesadilla | sin ajuste | 1 / 1 / 1 | 1/6 = 17 % |
| Gélida | Pesadilla | intermedio | 0,75 / 0,75 / 0,85 | 6/16 = 38 % (18-61), apenas bajo el rango → se baja a 0,7 |
| Acuática | Pesadilla | intermedio = final | 0,75 / 0,75 / 0,85 | 11/16 = 69 % |
| Laberinto | Pesadilla | intermedio | 0,75 / 0,75 / 0,85 | 7/8 = 88 % → se sube a 0,9 |
| Laberinto | Pesadilla | 0,9 / 0,9 / 0,95 | | 9/16 = 56 % (33-77); el test de monotonía mostró que el daño de jefes de Pesadilla (×0,95) superaba al de Infierno (×0,7): se bajó a 0,85 |
| Laberinto | Pesadilla | final | 0,9 / 0,9 / 0,85 | 7/16 = 44 % (23-67) |
| Gélida / Acuática / Laberinto | Infierno | línea base (nunca medido) | sin ajuste | 1/8 · 0/8 · 1/8 (13 / 0 / 13 %) |
| Gélida / Acuática / Laberinto | Infierno | intermedio | 0,7 / 0,7 / 0,8 | 1/6 · 1/6 · 2/6 (17 / 17 / 33 %) |
| Gélida | Infierno | final | 0,55 / 0,55 / 0,7 | 5/16 = 31 % |
| Acuática | Infierno | intermedio | 0,55 / 0,55 / 0,7 | 6/8 = 75 % → se sube a 0,65 |
| Laberinto | Infierno | final | 0,55 / 0,55 / 0,7 | 7/16 = 44 % |

Las muestras de «final» suman las corridas de prueba con el mismo valor (hechas con `job.mods`, que sobrescribe `tierMods` en memoria) y una de verificación con el código ya escrito, semillas distintas.

## 4. Qué quedó fuera de rango y por qué

- **Cazadora y Soporte** quedan por debajo de Tanque y Mago en Pesadilla en la Gélida (2/4 y 1/4) y en general entre 25 y 50 % con n = 4: con el mismo equipo y la misma dificultad, la Cazadora (poca vida) y el Soporte (poco daño propio) pierden más que el Tanque o el Mago. Subir o bajar el `tierMods` mueve a todos juntos; igualarlos exigiría tocar campeones o sus escalas, fuera de este encargo. Con n = 4 por campeón el IC es de ±30-40 puntos, así que «40-70 % por campeón» no se puede afirmar ni refutar celda por celda; se verificó por arena y se documenta por campeón como dirección.
- **Infierno, Acuática**: Tanque 1/4 contra Mago 4/4 (y en Laberinto al revés, Tanque 4/4 y Mago 1/4): dispersión de campeón con n = 4, no una tendencia que se pueda ajustar sin más muestras.
- **Normal**: no hay barrera; está por encima del rango en todos los perfiles (100 % en aprendiz, ocasional y habitual). El objetivo pide mínimos (≥ 60 / 80 / 95 %); no se bajó nada. No se endureció tampoco: el objetivo del dueño es quitar barreras, y con el equipo y nivel de llegada reales Normal no es una; ver §5 para la incertidumbre.
- **Monotonía Pesadilla > Infierno** en Acuática y Laberinto: ver §2 (IC solapados).

## 5. Incertidumbre y límites

- Autopiloto, no personas: sirve para comparar valores, no para predecir tasas humanas. Aprendiz/ocasional/habitual son solo parámetros de reacción y habilidad del piloto.
- Nivel de llegada: el modelo de COHERENCIA (piloto con puntaje de victoria 80). Una persona que llegue con menos nivel o menos equipo lo pasará peor que estas tasas. Prueba de sensibilidad en Normal con los niveles de `DIFF.arenaLevel` (17 / 23 / 26) en lugar de 24 / 27 / 30, aprendiz, n = 6 por arena: 18/18 victorias (IC 82-100 en conjunto). Normal queda por encima del mínimo incluso con 7 niveles menos.
- 16 intentos por celda (arena × dificultad) → IC de ±20 puntos; 4 por campeón. El host cargado hizo caer varios navegadores: los trabajos se reintentaron hasta completarse (no se descartaron resultados por perder).
- `lootPath=1`: una victoria por arena previa. Con 2 victorias previas (jugador que repite) el equipo es mejor y las tasas suben.
- Se verificó que las muestras de Pesadilla hechas con `lootPath` usan el botín nuevo de COHERENCIA (rama mergeada: `ilvlBase`, `lootRowShift`, oro de Infierno ×3).

## 6. Pruebas

`tools/items/t_difficulty.js`, bloque delimitado `GRUPO2` (entre `>>> GRUPO2` y `<<< GRUPO2`): para Gélida, Acuática y Laberinto, vida, daño y daño de jefes cumplen Normal < Pesadilla < Infierno de forma estricta en el código real;
vida × daño sube al menos ×1,3 en cada escalón; las claves de `tierMods` de todas las arenas son solo `normal`/`pesadilla`/`infierno` y sus valores están acotados.
El chequeo previo `TIERMODS.infierno_y_normal_intactos` (que exigía que Normal e Infierno no tuvieran `tierMods`) se reemplazó por `GRUPO2.tierMods_validos`, porque Infierno ahora lleva ajuste en estas tres arenas;
los agentes de las otras arenas probablemente deban tocar la misma línea. Para que las comprobaciones previas `ESCALAS.vida_y_danio_suben` y `CALIBRACION.infierno_x6_en_su_nivel` sigan midiendo la escala de la dificultad (y no el ajuste puntual), ahora también dividen el `tierMods.infierno` de la arena de prueba
(campo nuevo `tmInf`, igual que ya se hacía con `tm` de Pesadilla). Resultado: 8 FALLAS, las mismas 8 de antes (`CALIBRACION.pesadilla_x2_5_en_su_nivel`, `CALIBRACION.se_siente_mas_dificil_sin_ser_un_muro`, 2 SEMILLA, 4 TRAZADO); los 3 chequeos GRUPO2 pasan.
`se_siente_mas_dificil_sin_ser_un_muro` falla igual con o sin mis valores: la sensación base de Pesadilla (sin dividir el ajuste) da 2,56-2,57 en Gélida y Minas contra el tope 2,5.

## 7. Pendientes

- Asesino no se midió. Cazadora y Soporte necesitan más muestras (n ≥ 10 por campeón) para afirmar el rango por campeón.
- Normal está en 100 % para el autopiloto: si se quiere que aprendiz/ocasional/habitual tengan algo de riesgo en estas arenas habría que endurecer Normal, pero el dueño pidió quitar barreras, no crear dificultad; decisión de diseño pendiente. El soporte `tierMods.normal` que probé en una versión intermedia se retiró del motor porque no hizo falta.
- Repetir la medición cuando se ajusten XP/oro/drops de nuevo (cambia el nivel y el equipo de llegada).
- `tools/playtest/campaign.js` lanza hasta 12 reinicios en mi runner (no incluido en el repo) cuando un navegador cae; en el repo solo hay un reintento por trabajo.
