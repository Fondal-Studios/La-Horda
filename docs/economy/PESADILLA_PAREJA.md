# Pesadilla pareja: ajuste de dificultad por arena

Decisión del dueño: el oro de Pesadilla (e Infierno) queda como está (generoso, no se baja) y se baja la dificultad de Pesadilla donde era una pared.
Este documento registra el método, la tabla antes/después y la incertidumbre. El ajuste vive solo en `ARENA_MODS.<arena>.tierMods.pesadilla`
(`js/data/arenas.js`, aplicado en `diffApplyToRun`, `js/systems/difficulty-tiers.js`). No se tocó Normal, Infierno, el diseño de enemigos, el oro ni la XP.

## Método

- Herramienta: `tools/playtest/campaign.js` (autopilot "jugador competente", partida completa nivel 1 a victoria o derrota).
- Cada intento: campeón a nivel 54, `tier=pesadilla`, `loot=16` (botín de 16 victorias de campaña, equipado con `gear`), semilla fija por intento
  (`seed = 1000 + 7*k`; `Math.random` determinista, pero el host mete ruido de tiempo, así que la misma semilla no repite la partida exacta).
- Campeones: Tanque, Mago, Cazadora (roles distintos) y Soporte. Sin Asesino (no alcanzó el tiempo).
- Medición de tanteo con `job.mods` (sobrescribe `tierMods` en memoria) y verificación final con el valor ya escrito en el código, con semillas nuevas.
  Las muestras de tanteo con el mismo valor final se suman a la tabla "después".
- Incertidumbre: son 8 a 10 intentos por celda (campeón x arena): un intervalo de Wilson 95% por celda ronda ±30 puntos. Por arena (32-40 intentos) ronda ±14 puntos.
  Tomar los porcentajes por arena como orden de magnitud, no como cifra exacta. Un intento con error de carga de página (`save is not defined`) se descartó.
- Normal se midió con 3 campeones x 3 semillas por arena (9 intentos): solo sirve para ver que Pesadilla queda por debajo; el intervalo es muy ancho.

## Tabla (victorias / intentos)

Antes = rama del PR #131 (solo la Gélida con x0,5/0,4/0,7). Después = valores de abajo.

| Arena | tierMods.pesadilla (hp / dmg / jefes) | Antes (total) | Después (total, IC95%) | Después Tanque | Mago | Cazadora | Soporte | Normal (9 int.) |
|---|---|---|---|---|---|---|---|---|
| Ciudad | sin ajuste | 22/32 (69%) | no cambia | - | - | - | - | 9/9 |
| Fábrica (fortaleza) | 0,6 / 0,5 / 0,8 | 4/32 (12%) | 26/40 (65%, 49-78) | 7/10 | 8/10 | 3/10 | 8/10 | 9/9 |
| Bosque | 0,6 / 0,5 / 0,8 | 1/32 (3%) | 17/40 (42%, 29-58) | 3/10 | 7/10 | 1/10 | 6/10 | 9/9 |
| Micelial | 0,9 / 0,85 / 0,95 | 11/32 (34%) | 24/39 (62%, 46-75) | 6/10 | 7/9 | 5/10 | 6/10 | 8/9 |
| Gélida (hielo) | 0,35 / 0,3 / 0,55 (antes 0,5 / 0,4 / 0,7) | 5/32 (16%) | 28/40 (70%, 54-82) | 10/10 | 9/10 | 4/10 | 5/10 | 9/9 |
| Acuática | 0,6 / 0,5 / 0,8 | 0/32 (0%) | 23/40 (58%, 42-71) | 7/10 | 7/10 | 3/10 | 6/10 | 7/9 |
| Laberinto | 0,5 / 0,4 / 0,7 | 0/32 (0%) | 23/40 (58%, 42-71) | 9/10 | 7/10 | 2/10 | 5/10 | 6/9 |
| Abismo | 0,85 / 0,75 / 0,9 | 8/32 (25%) | 16/40 (40%, 26-55) | 1/10 | 6/10 | 5/10 | 4/10 | 6/9 |
| Minas | 0,6 / 0,5 / 0,8 | 1/32 (3%) | 20/40 (50%, 35-65) | 9/10 | 6/10 | 2/10 | 3/10 | 8/9 |
| Infernal | 0,45 / 0,35 / 0,65 | 0/32 (0%) | 6/16 (38%, 19-61) | 0/4 | 2/4 | 1/4 | 3/4 | 3/9 |

Antes por campeón (Tanque / Mago / Cazadora / Soporte, de 8 cada uno): Fábrica 2-1-0-1, Bosque 1-0-0-0, Micelial 2-4-1-4, Gélida 2-2-0-1, Acuática 0-0-0-0,
Laberinto 0-0-0-0, Abismo 3-1-2-2, Minas 0-1-0-0, Infernal 0-0-0-0, Ciudad 4-6-6-6.

Pasos intermedios medidos (sirven para ver lo empinada que es la curva): Bosque x0,5/0,4/0,7 = 12/16 (75%); Fábrica/Acuática/Laberinto/Bosque x0,6/0,5/0,8 -> Laberinto 6/24 (25%), por eso
Laberinto bajó a x0,5/0,4/0,7 (12/24 = 50%); Gélida x0,35/0,3/0,55; Micelial x0,8/0,7/0,9 = 17/24 (71%, se subió a 0,9/0,85/0,95); Minas x0,5/0,4/0,7 = 19/24 (79%),
x0,7/0,6/0,85 = 5/24 (21%); Infernal x0,5/0,4/0,7 = 6/24 (25%), x0,4/0,3/0,6 = 11/24 (46%), valor final 0,45/0,35/0,65 (6/16 con la muestra de verificación).

## Lectura y riesgos

- Pesadilla sigue siendo más difícil que Normal en la misma muestra en todas las arenas medidas (por ejemplo Bosque 100% en Normal contra 42%, Gélida 100% contra 70%).
  En la escala pura de vida x daño, la Gélida (x0,87 de vida y x0,9 de daño contra Normal) y el Infernal quedan cerca de Normal o algo debajo: lo que las mantiene más duras son los extras de Pesadilla
  (élites, resistencia elemental, tope por golpe). La prueba `TIERMODS.no_cae_por_debajo_de_normal` solo pone un piso (vida x daño >= 0,6 de Normal).
- El Infernal en Normal da apenas 33% (9 intentos): la propia arena final es dura con este equipo y esta autopilot. Por eso Pesadilla Infernal no se bajó más (sería más fácil que Normal).
- Cazadora (344 de vida a nivel 54) y Soporte son los que más sufren; Tanque y Mago ganan 70-100% en Gélida, Laberinto y Minas. Cazadora queda bajo 30% en Bosque (1/10), Laberinto (2/10),
  Minas (2/10) y Fábrica (3/10 es el borde). No se bajó más para no regalar Tanque/Mago (la curva es muy empinada: un paso de 0,1 mueve 30-50 puntos). Tanque en Abismo 1/10 es un caso aparte (arena de caídas, depende del autopilot).
- El autopilot no es un jugador humano: sirve para comparar antes/después, no para predecir tasas reales.
- La tabla suma muestras de tanteo (hechas antes de mergear `main`, con `job.mods`) y una de verificación con el código final ya sobre `main` (Infernal solo tiene esta última).
- Pendiente: Asesino/otros roles, medir Infierno (no se tocó; con Pesadilla ahora más baja el salto Pesadilla -> Infierno es mayor), y repetir con más intentos para afinar Cazadora.
- Oro: no se modificó. Con el multiplicador x1,5 por baja de #131, y victorias más frecuentes, el ingreso por hora de Pesadilla sube; es lo que pidió el dueño.

## Pruebas

`tools/items/t_difficulty.js`, bloque `TIERMODS`: por cada arena con `tierMods.pesadilla` verifica que multiplique exactamente vida/daño/daño de jefes sobre la misma arena sin el ajuste,
que los valores estén en 0,25-1, que Pesadilla no caiga por debajo del 60% de Normal en vida x daño, que Infierno siga por encima y que Normal e Infierno no tengan `tierMods`.
Resultado: 62 PASS y 8 FALLAS, las mismas 8 que ya fallaban (2 CALIBRACION, 2 SEMILLA, 4 TRAZADO); no se tocaron.
