# Dificultad del grupo 3 (Abismo, Minas Profundas, Arena Infernal) en Normal, Pesadilla e Infierno

Decisión del dueño: «si hay barreras, hay que cambiar la dificultad e ir cambiándola hasta que quede una dificultad adecuada en TODAS las dificultades».
Este documento cubre las tres últimas arenas de la campaña (posiciones 8, 9 y 10). Los otros dos grupos de arenas los ajustan otros agentes; aquí solo se tocaron
las entradas `ARENA_MODS.abismo|minas|infernal` (`js/data/arenas.js`). No se tocaron `js/net/*`, `server/*`, campeones ni las tablas de botín/XP/oro (eso es de `claude/coherencia-drops`, ya mergeada en esta rama).

## Cambio de método (importante)

Primera pasada (descartada): `loot=N` + `gear` de `tools/playtest/campaign.js`. Según `docs/economy/COHERENCIA.md` §3.2 eso deja al guardián casi desnudo (`loot=N` solo tira el cofre; `gear` llena ranuras vacías).
Recibí ese aviso a mitad de trabajo y re-medí TODO con el método nuevo. Datos de la pasada descartada (guardián casi desnudo, solo como referencia): Normal Infernal aprendiz 3/8, ocasional 1/8, habitual 3/8;
Pesadilla Infernal 1/7; Infierno Infernal 0/5. Con equipo real el panorama es otro: **Normal ya no tenía barrera**; lo que estaba mal era Pesadilla (demasiado fácil: 100 %) e Infierno (muro en la Infernal).

Método vigente (todo con el código de `main` + `coherencia-drops`, `ilvlBase`/`lootRowShift` incluidos):

- Autopilot `tools/playtest/campaign.js` (partida completa, nivel 1 a victoria o derrota, tope 22 min), semillas fijas `1000 + 7k` (`Math.random` determinista, pero el host mete ruido de tiempo: la misma semilla no repite la partida).
- Equipo: `lootPath=1` + `equipBest` (`tools/balance/real-loot.js`): una victoria real en CADA arena anterior de la campaña, en el orden Normal → Pesadilla → Infierno (piso + cofre, rareza/nivel de objeto de la dificultad de cada tramo), y se equipa lo mejor por ranura.
  Así «N victorias previas» corresponde a la posición real: Abismo = 7 arenas Normal; Minas = 8; Infernal = 9; en Pesadilla se suman las 10 de Normal + las previas de Pesadilla; en Infierno, 10 + 10 + las previas.
- Nivel: el de entrada del modelo de `COHERENCIA.md` (1 intento por arena): Normal 32 / 34 / 36 (Abismo / Minas / Infernal), Pesadilla 60 / 63 / 65, Infierno 84 / 87 / 89.
- Normal: tres perfiles del autopilot (`job.skill`/`job.reaction`, los de `tools/ux/playtest.js`): aprendiz 0,45 / 650 ms, ocasional 0,7 / 400, habitual 0,9 / 220, y «nc» = piloto por defecto (0,85 / 260), todos rotando Tanque, Mago, Cazadora y Soporte. Pesadilla e Infierno: piloto por defecto («c4»), los mismos cuatro campeones. Asesino no se midió (no hubo tiempo).
- Cambios al arnés (`campaign.js`): `job.skill`/`job.reaction`, `job.lootSeq` (botín arena a arena con `arena@dificultad`; quedó sin uso en la medición final, que usa `lootPath`), reintento de carga de página (el host compartido tiraba pestañas y dejaba cargas a medias),
  `executablePath` por `CHROMIUM_PATH`.
- Incertidumbre: intervalos de Wilson 95 %. Cada celda arena × dificultad tiene 8 a 31 partidas, pero **por campeón solo 2 a 5** (no llegué a 8 por campeón: cada partida tarda 1 a 2,5 min en el host saturado y cada ajuste había que re-medirlo).
  Los porcentajes por campeón son orientativos; los de la celda ya agrupada tienen IC de ±20 a ±25 puntos. Hubo corridas perdidas por caídas del navegador del host (se descartaron o se repitieron; se ven como `crash` en los datos crudos, no cuentan).

## Objetivos

| Dificultad | Objetivo |
|---|---|
| Normal | aprendiz ≥ 60 %, ocasional ≥ 80 %, habitual ≥ 95 % (en la Infernal, el cierre de la campaña, que abre el postgame: aprendiz ≥ 50 %, ocasional ≥ 70 %, habitual ≥ 90 %: épica pero ganable por quien llegó en orden) |
| Pesadilla | 40 a 70 % con el equipo de haber completado Normal y siempre más difícil que Normal |
| Infierno | 25 a 55 % con el equipo de haber hecho Pesadilla y siempre más difícil que Pesadilla |

## Tabla final: arena × dificultad (victorias / intentos, % e IC95 %)

Valores finales en el código (los datos de cada fila son SOLO de partidas con esos valores exactos).

| Arena | Dificultad | Ajuste (`tierMods`: vida / daño / daño de jefes) | Resultado | Por campeón (Tanque, Mago, Cazadora, Soporte) |
|---|---|---|---|---|
| Abismo | Normal aprendiz | sin ajuste | 6/8 (75 %, 41-93) | 2/2, 1/2, 2/2, 1/2 |
| Abismo | Normal ocasional | sin ajuste | 6/6 (100 %, 61-100) | |
| Abismo | Normal habitual | sin ajuste | 7/8 (88 %, 53-98) | 2/2, 2/2, 2/2, 1/2 |
| Abismo | Normal piloto por defecto | sin ajuste | 4/4 | |
| Abismo | Pesadilla | 1,15 / 1,10 / 1,0 | 13/20 (65 %, 43-82) | 2/5, 5/5, 4/5, 2/5 |
| Abismo | Infierno | 0,72 / 0,63 / 0,8 | 6/20 (30 %, 15-52) | 1/5, 3/5, 1/5, 1/5 |
| Minas | Normal aprendiz | sin ajuste | 8/8 (100 %, 68-100) | |
| Minas | Normal ocasional | sin ajuste | 6/6 (100 %, 61-100) | |
| Minas | Normal habitual | sin ajuste | 8/8 (100 %, 68-100) | |
| Minas | Normal piloto por defecto | sin ajuste | 4/4 | |
| Minas | Pesadilla | 1,65 / 1,5 / 1,15 | 11/20 (55 %, 34-74) | 4/5, 3/5, 4/5, 0/5 |
| Minas | Infierno | 1,25 / 1,05 / 1,08 | 4/12 (33 %, 14-61) | 1/3, 2/3, 1/3, 0/3 |
| Infernal | Normal aprendiz | sin ajuste | 10/11 (91 %, 62-98) | 1/2, 3/3, 3/3, 3/3 |
| Infernal | Normal ocasional | sin ajuste | 6/6 (100 %, 61-100) | |
| Infernal | Normal habitual | sin ajuste | 7/8 (88 %, 53-98) | 2/2, 2/2, 2/2, 1/2 |
| Infernal | Normal piloto por defecto | sin ajuste | 4/4 | |
| Infernal | Pesadilla | 1,2 / 1,1 / 1,05 | 5/12 (42 %, 19-68) | 1/3, 2/3, 1/3, 1/3 |
| Infernal | Infierno | 0,73 / 0,6 / 0,84 | 3/12 (25 %, 9-53) | 1/3, 1/3, 1/3, 0/3 |

Orden por arena (tasa de la celda): Abismo 75-100 % → 65 % → 30 %; Minas 100 % → 55 % → 33 %; Infernal 88-100 % → 42 % → 25 %. Siempre Normal > Pesadilla > Infierno en la misma muestra de campeones. El resto del ajuste es el de las filas «antes/después» de abajo.

## Antes / después y pasos intermedios

«Antes» = valores de `main` (PR #160) medidos con el método nuevo (equipo real). Todas las tasas de abajo son del método nuevo salvo que diga lo contrario.

| Arena | Dificultad | Antes (valores → tasa) | Pasos intermedios (valores → tasa) | Después |
|---|---|---|---|---|
| Abismo | Normal | sin ajuste → aprendiz 75 %, habitual 88 % | no hizo falta tocarlo | igual |
| Abismo | Pesadilla | 0,85 / 0,75 / 0,9 → 8/8 | 1,0 / 1,0 / 1,0 → 3/4 (solo 4 válidas; el navegador cayó) | 1,15 / 1,10 / 1,0 → 65 % (13/20) |
| Abismo | Infierno | sin ajuste (Infierno puro): no medido en el método nuevo | 0,5 / 0,4 / 0,7 → 4/7; 0,6 / 0,5 / 0,8 → 4/4 (con Pesadilla 1,0) | 0,72 / 0,63 / 0,8 → 30 % (6/20) |
| Minas | Normal | sin ajuste → 100 % en los tres perfiles | no hizo falta tocarlo | igual |
| Minas | Pesadilla | 0,6 / 0,5 / 0,8 → 8/8 | 1,0 / 1,0 / 1,0 → 6/8; 1,2 / 1,15 / 1,0 → 6/8; 1,5 / 1,4 / 1,15 → 6/8; 1,8 / 1,6 / 1,2 → 2/8 (25 %) | 1,65 / 1,5 / 1,15 → 55 % (11/20) |
| Minas | Infierno | sin ajuste: no medido | 0,5 / 0,4 / 0,7 → 7/7; 0,7 / 0,6 / 0,85 → 7/8; 0,75 / 0,66 / 0,8 → 6/8; 1,0 / 0,9 / 1,0 → 4/8; 1,15 / 1,0 / 1,05 → 2/8; 1,05 / 0,95 / 1,02 → 4/8; 1,1 / 0,98 / 1,04 → 8/12 | 1,25 / 1,05 / 1,08 → 33 % (4/12) |
| Infernal | Normal | sin ajuste → aprendiz 91 %, ocasional 100 %, habitual 88 % | no hizo falta tocarlo | igual |
| Infernal | Pesadilla | 0,45 / 0,35 / 0,65 → 4/4 | 0,8 / 0,7 / 0,9 → 5/8 y luego 10/12; 0,9 / 0,8 / 0,95 → 9/12 | 1,2 / 1,1 / 1,05 → 42 % (5/12) |
| Infernal | Infierno | sin ajuste → 0/4 (derrotas en los niveles 6 a 10) | 0,5 / 0,4 / 0,7 → 3/8 y luego 7/11; 0,55 / 0,45 / 0,75 → 7/10; 0,85 / 0,7 / 0,9 → 1/12 (8 %); 0,7 / 0,57 / 0,82 → 5/11; 0,76 / 0,62 / 0,85 → 2/12 | 0,73 / 0,6 / 0,84 → 25 % (3/12) |

Lectura:

- **Normal no era la barrera.** Con equipo real y nivel de entrada, Normal da 75-100 % en los tres perfiles. La barrera que medía la pasada anterior (Infernal 33 %) era el guardián desnudo.
  Por eso no se tocó ningún valor de Normal (sigue siendo la dificultad de referencia) y no hizo falta soporte nuevo en el motor (probé `tierMods.normal` y lo quité).
- **Pesadilla era un paseo, no un muro**, y en las tres arenas hubo que SUBIR los `tierMods` de PR #160 (de 0,45-0,85 a 1,15-1,65). En Minas el factor llega a 1,65 de vida: es la arena donde más escalón hubo (la curva es una meseta en 75 % entre 1,0 y 1,5 y cae a 25 % en 1,8).
- **Infierno** no tenía ajuste: con vida ×5,5 y daño ×4,5 puros, la Infernal da 0 %; el ajuste lo deja en 25-33 %. En Abismo y Minas el escalón es menos brusco.
- La curva es muy empinada y ruidosa (un paso de 0,05 a 0,1 mueve 20 a 40 puntos con n = 8-12), por eso varios pasos intermedios se contradicen entre sí (Minas Infierno 1,1 → 67 % pero 1,05 → 50 % y 1,15 → 25 %). Los valores finales se eligieron con la muestra más grande de cada zona, y luego se verificaron con el código final.

## Qué quedó fuera de rango o con reservas

- **Normal habitual en Abismo e Infernal: 88 % (7/8), por debajo del objetivo 95 % / 90 %.** El IC (53-98 %) incluye el objetivo; las derrotas son del nivel 9-10. No se tocó porque el Normal de esas arenas ya es la referencia y n = 8; hay que remedir con más partidas si se quiere afirmar que está por debajo.
- **Normal Minas y Pesadilla Minas**: Minas Normal es 100 % (puede ser demasiado fácil), pero el objetivo de Normal es un piso y es la dificultad de referencia; Pesadilla Minas queda en 55 %.
- **Soporte en Minas Pesadilla (0/5) e Infierno (0/3)**: fuera de rango para ese campeón; Cazadora y Tanque (4/5) están arriba. Con n = 5 es indicativo, no concluyente. El resto de los campeones está en 33-100 % en Pesadilla.
- **Tanque en la Infernal a veces «se traba»**: la partida termina por el tope de 22 min con el jefe al 100 % de vida (el autopilot del Tanque nunca llega a dañarlo). Cuenta como no-victoria; es un artefacto del piloto, no de la dificultad, y empuja hacia abajo las tasas del Tanque.
- **Por campeón no hay 8 intentos por celda** (ver incertidumbre). Asesino no se midió.
- El autopilot no es una persona: sirve para comparar antes/después, no para predecir tasas humanas. Los perfiles aprendiz/ocasional/habitual son piloto con habilidad y reacción distintas, no gente.
- Otra capa que no se midió: cooperativo (varios humanos) y el escalón de Pesadilla/Infierno con 2 intentos por arena (`lootPath=2`).

## Pruebas

`tools/items/t_difficulty.js`: bloque nuevo `GRUPO3` (delimitado por `INICIO/FIN BLOQUE GRUPO3`): para Abismo, Minas e Infernal con el mismo equipo (nivel 54), comprueba que vida, daño y daño de jefes de la horda crezcan estrictamente Normal < Pesadilla < Infierno y que el salto vida × daño sea ≥ 1,5 (Pesadilla sobre Normal) y ≥ 1,3 (Infierno sobre Pesadilla).
También se relajaron dos comprobaciones del bloque `TIERMODS` que asumían los valores viejos: el rango permitido de un `tierMods` pasa de 0,25-1 a 0,25-2 (Minas Pesadilla es 1,65) y las tres arenas del grupo pueden tener `tierMods.infierno`.
Resultado: 74 PASS y 8 FALLAS, las mismas 8 que ya fallaban antes (2 CALIBRACION, 2 SEMILLA, 4 TRAZADO); no se tocaron. Los 12 `GRUPO3.*` pasan.

## Cómo repetirlo

Servir la raíz (`python3 -m http.server 8871`) y correr `campaign.js` con trabajos como estos (ejemplo, Infernal Pesadilla):
`{"cls":"mago","arena":"infernal","tier":"pesadilla","lvl":65,"seed":1000,"lootPath":1,"equipBest":true}`; para Normal por perfil agregar `"skill":0.45,"reaction":650` (aprendiz), `0.7/400` (ocasional) o `0.9/220` (habitual) con `lvl` 32 / 34 / 36.
Para probar un valor sin tocar el código: `"mods":{"tierMods":{"pesadilla":{"hp":1.2,"dmg":1.1,"bossDmg":1.05}}}`.
