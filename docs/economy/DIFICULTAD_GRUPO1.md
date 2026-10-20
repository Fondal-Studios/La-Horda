# Dificultad del grupo 1 (Ciudad, Fábrica, Ruinas del Bosque, Reino Fúngico)

Decisión del dueño: si hay barreras, se cambia la dificultad hasta que quede adecuada en las tres (Normal, Pesadilla, Infierno).
Ajuste en `ARENA_MODS.<arena>.tierMods.<normal|pesadilla|infierno>` (`js/data/arenas.js`); `diffApplyToRun` (`js/systems/difficulty-tiers.js`) ya aplicaba Pesadilla/Infierno y ahora también `tierMods.normal` (3 líneas).
No se tocaron enemigos, drops, XP ni oro. Datos crudos por partida: `docs/economy/dificultad_grupo1_datos.jsonl` (ronda, valores probados, campeón, semilla, resultado).

## Método (y cambio de método)

- `tools/playtest/difficulty-matrix.js` genera y resume los trabajos de `tools/playtest/campaign.js` (partida completa, autopilot). IC de Wilson 95 %.
- **Equipo real**: `lootPath=1` + `equipBest` (botín real de una victoria en cada arena previa, en el orden Normal -> Pesadilla -> Infierno, `tools/balance/real-loot.js`), con el botín nuevo de Pesadilla/Infierno de la rama de coherencia (ya mergeada). Las mediciones previas con `loot=N`+`gear` (guardián casi desnudo) NO se usan; las de `PESADILLA_PAREJA.md` quedan como historia (con equipo real Pesadilla era más fácil de lo medido: Bosque `x0,6/0,5/0,8` daba 100 %).
- **Niveles de entrada**: Normal 1 / 12 / 18 / 23 (Ciudad / Fábrica / Bosque / Fúngico; de dos progresiones reales con autopilot: Fábrica se pisa en nv. 11-15, Bosque 17-21); Pesadilla 39 / 41 / 44 / 46 (entra en nv. 38-40 según `COHERENCIA.md`); Infierno 64 / 66 / 69 / 72.
- Normal: aprendiz (skill 0,45 / reacción 650), ocasional (0,7 / 400), habitual (0,9 / 220), 8 semillas por perfil, campeones rotando Tanque/Mago/Cazadora/Soporte. Pesadilla/Infierno: autopilot competente (0,85 / 260), 8-16 por arena (2-4 por campeón).
- **Limitación importante**: el perfil casi no cambia la partida (solo el retraso de esquiva), así que los tres perfiles de Normal son muestras del mismo jugador; por eso se juntan (n = 24 por arena). Las mismas semillas con distintas dificultades NO repiten la partida (el host y el tiempo meten ruido) y entre bloques de semillas hay diferencias de hasta ±25 puntos: por eso se agrupan rondas con el mismo valor. Las celdas por campeón (n = 2-4) no alcanzan para decidir nada; **no se cumplió «≥ 8 por campeón»**, sí ≥ 8-16 por arena y dificultad.
- Hallazgo de código: `cmShotsUpdate` (Ciudad) podía romper la partida (`cmS.shots[i]` indefinido si `bossHitHero` vacía la lista a mitad del bucle); se agregó la guarda `if(!s) continue;`.

## Valores finales

| Arena | Normal (`tierMods.normal`) | Pesadilla | Infierno |
|---|---|---|---|
| Ciudad | 0,75 / 0,7 / 0,75 | 2,5 / 2,4 / 1,3 (antes sin ajuste) | 3,0 / 2,8 / 1,4 (antes sin ajuste) |
| Fábrica | 0,85 / 0,8 / 0,9 | 1,1 / 1,0 / 1,05 (antes 0,6 / 0,5 / 0,8) | 0,8 / 0,7 / 0,9 (antes sin ajuste) |
| Bosque | sin ajuste | 1,0 / 0,92 / 1,0 (antes 0,6 / 0,5 / 0,8) | 0,8 / 0,7 / 0,9 (antes sin ajuste) |
| Fúngico | sin ajuste | 1,5 / 1,4 / 1,1 (antes 0,9 / 0,85 / 0,95) | 1,2 / 1,15 / 1,05 (antes sin ajuste) |

(hp / daño / daño de jefe, multiplicadores sobre la dificultad.)

## Resultado: victorias / intentos (IC95 %)

| Arena | Normal antes | Normal después | Pesadilla antes (valor viejo, equipo real) | Pesadilla después | Infierno antes (sin ajuste) | Infierno después |
|---|---|---|---|---|---|---|
| Ciudad | 19/23 (83 %) | 24/24 (100 %, 86-100) | 8/8 (100 %) | 10/16 (63 %, 39-82) | 7/8 (88 %) | 6/16 (38 %, 18-61) |
| Fábrica | 15/22 (68 %, habitual 4/7) | 45/48 (94 %, 83-98) | 6/8 (75 %) | 6/12 (50 %, 25-75) | 2/8 (25 %) | 7/12 (58 %, 32-81) |
| Bosque | 24/24 (100 %) | 48/48 (100 %, sin cambio) | 8/8 (100 %) | 6/12 (50 %, 25-75) | 1/8 (13 %) | 3/8 (38 %, 14-69) |
| Fúngico | 19/21 (90 %) | 41/45 (91 %, 79-97) | 6/8 (75 %) | 4/8 (50 %, 22-78) | 3/8 (38 %) | 5/12 (42 %, 19-68) |

Normal por perfil (después, ronda final de cada arena): Ciudad 8/8, 8/8, 8/8 (aprendiz/ocasional/habitual); Fábrica 16/16, 16/16, 13/16; Bosque 16/16, 16/16, 16/16; Fúngico 14/15, 12/15, 15/15 (sumando las rondas con el mismo valor).
Ocasional y aprendiz cumplen en todas (>= 80 % y >= 60 %). Habitual >= 95 %: Ciudad, Bosque y Fúngico sí; **Fábrica habitual 13/16 (81 %)** queda por debajo (la Fábrica es la arena con el salto más abrupto, ver abajo).

Historial de pasos (hp/dmg/jefe -> victorias; ver el archivo de datos): Ciudad Normal 1/1/1 83 %, 0,85/0,8/0,9 79 % (38/48), 0,75/0,7/0,75 100 %; Fábrica Normal 1/1/1 68 %, 0,85/0,8/0,9 94 %; Ciudad Pesadilla 1/1/1 100 %, 1,5/1,4/1,1 100 %, 2,5/2,4/1,3 63 %; Bosque Pesadilla 0,6 100 %, 0,85/0,8 63 % y 100 %, 0,9/0,85 100 %, 1,3/1,2 13 %, 1,1/1,0 33 %, 1,0/0,92 50 %; Fábrica Pesadilla 0,6/0,5 75 %, 0,7/0,6 88 %, 1,3/1,2 88 %, 1,5/1,4 25 %, 1,6/1,5 75 %, 1,7/1,55 0 %, 1,8/1,65 13 %, 2,0/1,8 25 %, 0,85/0,75 100 % (12/12), 1,4/1,3 17 %, 1,1/1,0 50 %; Fúngico Pesadilla 0,9 75 %, 1,4/1,3 50 % y 100 %, 1,5/1,4 50 %; Ciudad Infierno 1,4/1,3 75 %, 2,2/2,0 50 %, 3/2,8 38 %; Fábrica Infierno 0,8/0,7 25 % (con 0,55/0,45: 38 % y 63 %), 0,5/0,4 75 %, 1,0 8 %, 0,7/0,6 83 %, 0,8/0,7 58 %; Bosque Infierno 0,65/0,55 63 %, 0,7/0,6 50 %, 0,8/0,7 38 %; Fúngico Infierno 0,85/0,8 75 %, 1,2/1,15 50 % y 42 %, 1,3/1,25 17 %.

## Qué quedó fuera de rango y por qué

- **Fábrica habitual en Normal 81 %** (objetivo 95 %): la agrupada (94 %) cumple; con el autopilot el perfil no cambia casi nada y n = 16.
- **Fábrica es un acantilado**: pasar de ~75-88 % a ~15-25 % con un paso de 0,2 en los multiplicadores y los resultados de dos bloques de semillas del mismo valor difieren 50 puntos. Pesadilla y Infierno de la Fábrica casi se solapan (50 % y 58 %): **Infierno no es estrictamente más difícil que Pesadilla en la Fábrica** con esta muestra (los IC se pisan por completo). Se necesitan más intentos o un cambio de diseño (verdugo, autómata y dragón de bronce deciden la partida, no la escala).
- **Fúngico Pesadilla (50 %) vs Infierno (42 %)** y **Ciudad (63 % vs 38 %)**, Bosque (50 % vs 38 %): en el orden correcto pero con IC solapados.
- **Cazadora y Soporte** pierden más (Tanque/Soporte fallan en Ciudad e Infierno Fúngico); con 2-4 intentos por campeón no se pudo ajustar por campeón. No se tocaron kits.
- Pesadilla/Infierno del Bosque con 12 y 8 intentos, Infierno del Fúngico 12: IC de ±25 puntos.

## Pruebas

`tools/items/t_difficulty.js`: ahora acepta ajustes puntuales en cualquier dificultad (rango 0,25-4, claves válidas), la calibración divide también por el ajuste de Normal e Infierno, y el bloque nuevo `MONOTONIA` verifica para el grupo 1 que vida x daño y daño de jefe crecen Normal < Pesadilla < Infierno (y por saltos >= x1,5). Resultado: 8 fallas, las mismas 8 preexistentes (2 CALIBRACION, 2 SEMILLA, 4 TRAZADO). La monotonía de la tasa de victoria la dan las tablas de arriba (no hay prueba automática: es de simulación).

## Pendientes

- Más intentos en Fábrica (Pesadilla/Infierno) y por campeón (>= 8) para cerrar IC; separar la Fábrica Infierno de la Pesadilla.
- Normal habitual en Fábrica.
- El autopilot no distingue perfiles: conviene un perfil que realmente falle más (reacción/posicionamiento) para medir aprendiz vs habitual.
- Los otros grupos de arenas deben agregar sus arenas a `MONOTONIA`.
