# Balance del guerrero (Kael): mitigación y esquiva (2026-11-15)

Encargo del propietario: «probá la mitigación y la esquiva para el guerrero en una ronda aparte». Parte de `BALANCE_DIFICULTAD_20261113.md` (guerrero ~22-32 % global frente a ~45-60 % de los otros roles; ni más vida ni más curación se distinguieron del ruido con 5-8 partidas por casilla).

**Resultado: no concluyente. No se cambió el balance del guerrero.** Ninguna variante supera el ruido con la regla fijada de antemano (ver 4). La esquiva por invulnerabilidad (variante B) es el candidato a confirmar, con el tamaño de muestra de 6.2. El único cambio visible al jugador es el texto de las descripciones (la curación de Kael 4 %/7 % no figuraba).

> Todo son **bots** (`tools/playtest/campaign.js`, piloto competente .85/260 ms, equipo `lootPath=1` + `equipBest`, nivel de entrada = nivel esperado de la arena). No representan a un humano, ni al cooperativo, ni a la red.

## 1. Método

- **Matriz fija**: arenas Ciudad, Bosque, Micelial, Hielo, Infernal × dificultades Normal, Pesadilla, Infierno × semillas. Semilla de cada partida `5000 + 7·i + índiceArena(campaña) + 101·índiceDificultad` (`i` = 0..5 en la primera tanda, 6..9 en la de confirmación), por `Math.random` determinista (mulberry32 del propio `campaign.js`). Cada variante corre **las mismas semillas** que la base; repetir una semilla da el mismo resultado casi siempre (en 31 repeticiones accidentales de la variante C: 30 iguales, 1 distinta), así que una diferencia por pares viene del cambio y no del azar de la partida; sí hay ruido de «qué semillas» (la muestra es pequeña y el guerrero no gana casi nunca en difícil).
- **Tamaños de muestra** (partidas de guerrero): base 130 (Normal 30 = 5 arenas × 6 semillas; Pesadilla 50 y Infierno 50 = 5 arenas × 10 semillas); B igual que la base (130); C 90 (30 por dificultad); A 45 (15 por dificultad, semillas 0-2). Todas cumplen ≥ 15 por dificultad y variante.
- **Otros roles** (solo base, no dependen de las variantes porque los cambios son del guerrero): tanque, mago, soporte, 2 semillas × 5 arenas × 3 dificultades = 10 partidas por casilla.
- **Estadística**: intervalo de Wilson 95 % por casilla (grosero; con n = 15-50 son anchos); comparación por pares de semilla (variante gana y base pierde = «+», al revés = «−») con prueba de signos exacta bilateral. Criterio aplicado: «supera el ruido» = p corregido por 3 variantes (Bonferroni, p < 0,017) sobre el total y una tanda de confirmación con semillas nuevas que no lo contradiga. La regla de adopción («solo si supera el ruido») venía del encargo; el umbral numérico lo fijé al diseñar la tanda de confirmación, antes de verla.
- **Supervivencia** = segundos hasta el final de la partida (mediana de todas y de las derrotas). «Sin muerte (tope 22 min)» = la partida llegó al límite del arnés sin ganar ni morir.
- **Causa de muerte**: `campaign.js` solo guarda el tipo del enemigo o proyectil que dio el golpe letal, no su rango; se agrupa en jefe (`bossHitHero`/jefes nombrados), proyectil (`(proj)`), enemigo/horda (el resto) y peligro de arena. **No se puede distinguir élite de horda** con ese dato; es una limitación del arnés.
- Datos crudos (jsonl): en el scratchpad de la sesión, no se versionan. Arnés: `job.champ` (nuevo en `campaign.js`, l.41-42) aplica una variante `{guard:{..}, skills:{"0":{..}}}` a `CLASSES[cls]` sin tocar los datos del juego.
- Una corrida intermedia tuvo 34 trabajos de B con `ERR_CONNECTION_REFUSED` (el servidor estático se cayó); se descartaron y se repitieron esos 34 trabajos.

## 2. Qué mata al guerrero (base, Pesadilla + Infierno, 89 derrotas de 100)

| | Normal (5 derrotas) | Pesadilla (43) | Infierno (46) |
|---|---|---|---|
| Jefe | 1 | 6 | 9 |
| Proyectil | 2 | 11 | 11 |
| Enemigo/horda | 1 | 24 | 24 |
| Peligro de arena | 1 | 0 | 1 |
| Sin muerte (tope 22 min) | 0 | 2 | 1 |
| Golpe letal / vida máxima (mediana) | 6 % | 16 % | 17 % |
| Vida antes del golpe letal / vida máxima (mediana) | 2 % | 4 % | 3 % |

Conclusión que condiciona el diseño: **el guerrero muere por desgaste, no de un golpe**. El golpe que lo mata es ~16 % de su vida máxima y llega cuando ya le queda ~4 %. Un tope por golpe no sirve contra eso, y la hipótesis de «golpes de élite de 200-600 sobre 1.000-2.000» del documento anterior solo describe una minoría (los golpes grandes aparecen en `bigHits` pero el golpe letal medio es chico).

## 3. Variantes (todas por datos de `CLASSES.guerrero`, apagadas por defecto)

| Variante | Qué hace | Por qué se probó |
|---|---|---|
| **A, mitigación: tope por golpe** | `guard:{capPct:0.30, capCdMs:5000}`: un golpe (ya mitigado) no saca más de 30 % de la vida máxima, 1 vez cada 5 s | Es la mitigación que pidió el encargo; el modelo anterior suponía golpes de élite de 60 % de vida |
| **B, esquiva: invulnerabilidad en la ráfaga** | `skills[0].iframeMs:250` (Corte Sangrante) y `skills[1].iframeMs:450` (Triple Golpe): `invulnTimer` al conectar (reusa el temporizador de Axiom/Musashi; el panel táctico ya lo muestra como «Invulnerable») | Kael no tiene habilidad de movimiento; las dos ráfagas cuerpo a cuerpo son el único momento en que el piloto está pegado al enemigo |
| **C, combinada pequeña** | `burstArmor 0.20` por 2,5 s (`kitBuff` armadura) en ambas ráfagas + 300 ms de invulnerabilidad en Triple Golpe | La mitigación proporcional tras el hallazgo de la sección 2 (el tope no sirve, la reducción de daño continua sí podría) |

Descartada sin medir: esquiva probabilística de golpes telegrafiados (añade azar sin lectura clara para el jugador y los golpes letales no son telegrafiados: son desgaste); invulnerabilidad en la definitiva (el sigilo de Pestilencia Sombría ya cubre 2 s).

Efectos visibles (regla del filtro de habilidades): la esquiva dispara `kitFx("wind")` y el cartel «ESQUIVA»; el tope, `kitFx("shield")` y «TEMPLE»; la armadura usa `kitBuff` (anillo celeste persistente y cartel). Ninguna habilidad nueva apunta (el premarcado de `bleed_hit`/`triple_hit` ya existe en `AIM_PROFILES`).

## 4. Resultados por pares (victorias del piloto; IC Wilson 95 %)

| Variante | Dificultad | Victorias | IC 95 % | Superv. mediana (todas / derrotas) | Vida mín. mediana | Pares vs base: +/− , p (signos) |
|---|---|---|---|---|---|---|
| base | Normal | 25/30 (83 %) | 66-93 | 449 / 426 s | 53 % | |
| base | Pesadilla | 7/50 (14 %) | 7-26 | 311 / 278 s | 21 % | |
| base | Infierno | 4/50 (8 %) | 3-19 | 230 / 226 s | 23 % | |
| A tope 30 % | Normal | 12/15 (80 %) | 55-93 | 439 / 352 s | 48 % | +0/−0, 1,00 |
| A | Pesadilla | 3/15 (20 %) | 7-45 | 280 / 231 s | 28 % | +0/−0, 1,00 |
| A | Infierno | 2/15 (13 %) | 4-38 | 230 / 229 s | 14 % | +0/−2, 0,50 |
| B esquiva | Normal | 24/30 (80 %) | 63-90 | 447 / 627 s | 42 % | +3/−4, 1,00 |
| B | Pesadilla | 14/50 (28 %) | 17-42 | 407 / 358 s | 25 % | +10/−3, 0,09 |
| B | Infierno | 8/50 (16 %) | 8-29 | 258 / 226 s | 29 % | +5/−1, 0,22 |
| C armadura+esq. | Normal | 22/30 (73 %) | 56-86 | 451 / 446 s | 47 % | +0/−3, 0,25 |
| C | Pesadilla | 6/30 (20 %) | 10-37 | 409 / 370 s | 28 % | +4/−1, 0,38 |
| C | Infierno | 6/30 (20 %) | 10-37 | 408 / 383 s | 18 % | +3/−1, 0,63 |

(Los pares de A, B y C se calculan solo sobre las semillas que comparten con la base; las filas de la base son las 130 partidas.)

Lectura honesta:

- **A (tope)**: en Normal y Pesadilla las 30 partidas dan el mismo resultado que la base (el tope casi nunca se activa); en Infierno 0 mejoras y 2 empeoramientos. **Sin efecto**, coherente con la sección 2.
- **C (armadura + esquiva corta)**: 6 pares a favor y 5 en contra (todas las dificultades, p = 0,77). **Sin efecto distinguible**; empeora Normal (−3, sin significancia).
- **B (esquiva)**: es el único con señal. Pesadilla 7/50 → 14/50 (pares +10/−3, p = 0,09); Infierno 4/50 → 8/50 (+5/−1); Normal sin cambio (+3/−4). Agrupando difíciles: 11/100 → 22/100, pares +15/−4, p = 0,019 sin corregir. **No se declara mejora**: (i) con 3 variantes y 3 dificultades p = 0,019 no pasa el umbral corregido (0,017); (ii) la tanda de confirmación con semillas nuevas (semillas 6-9 de Pesadilla e Infierno, 40 partidas por brazo) da 4/40 → 7/40, pares +5/−2, p = 0,45: la dirección se repite, la magnitud no es distinguible del ruido; (iii) los intervalos se solapan (difíciles: 6-19 % frente a 15-31 %).

### 4.1 Contra los otros roles (base, 10 partidas por casilla, IC grosero)

| Dificultad | Guerrero base | Tanque | Mago | Soporte | Media de los otros | Guerrero / media | Guerrero con B / media |
|---|---|---|---|---|---|---|---|
| Normal | 83 % (30) | 70 % | 100 % | 100 % | 90 % | 0,92× | 0,89× |
| Pesadilla | 14 % (50) | 30 % | 80 % | 30 % | 47 % | 0,30× | 0,60× |
| Infierno | 8 % (50) | 40 % | 40 % | 30 % | 37 % | 0,22× | 0,43× |

Meta 0,6×-1,4×: **el guerrero base queda fuera en Pesadilla (0,30×) e Infierno (0,22×)**; con B, Pesadilla llegaría justo al borde (0,60×, IC amplio) e Infierno seguiría fuera (0,43×). El mago es el rol más fuerte (Pesadilla 80 % frente a 30 % del tanque y del soporte; fuera de banda por arriba, como ya se había medido); **no se tocó**. Las partidas de tanque que figuran como derrota sin causa son el tope de 22 min del arnés (1320 s), no muertes.

## 5. Decisión

Regla fijada antes de medir: se adopta una variante solo si en pares supera el ruido (p corregido < 0,05 sobre el total y confirmación con semillas nuevas que no contradiga). **Ninguna lo cumple; B queda como candidato.** Por eso:

- No se modificaron `hpGrowthMult`, `healPct`, estadísticas, la referencia por rol ni `knownChampions`; `check-entry-reference` y `entry-gate` pasan sin tocar nada.
- Las perillas de B/A/C quedan implementadas **apagadas** (valores ausentes = 0) para poder repetir o adoptar la variante sin escribir código nuevo.

**Siguiente paso, si el propietario quiere decidir B**: repetir solo B contra la base con ≈ 150-180 partidas de guerrero por brazo en Pesadilla/Infierno (semillas nuevas, p. ej. 5 arenas × 2 dificultades × 15-18 semillas; cálculo de dos proporciones para un salto de 11 % a 22 % con potencia ~80 %, el apareo puede reducirlo), y validarlo con humanos; con 4 núcleos son del orden de 1-2 h. Para llegar a la meta 0,6×-1,4× en Infierno B por sí sola no alcanza (0,43× estimado): haría falta además más supervivencia al desgaste (el golpe letal llega con ~4 % de vida).

## 6. Perillas y cambios (archivo:línea, valor viejo → nuevo)

Balance: **ninguno cambia de valor**. Código/datos añadidos (todo en cero o ausente = sin efecto):

| Dónde | Qué |
|---|---|
| `js/skills/abilities.js:1507` | `kaelSustain` llama a `kaelBurstGuard(caster, sk)` antes de curar |
| `js/skills/abilities.js:1518-1527` | `kaelBurstGuard`: `sk.iframeMs` (invulnerabilidad + `kitFx("wind")` + cartel) y `sk.burstArmor`/`burstArmorMs` (`kitBuff` armadura); ausentes → no hace nada |
| `js/skills/abilities.js:1529-1537` | `kaelHitGuard`: tope por golpe `cls.guard.{capPct,capCdMs}` con enfriamiento interno; ausente → devuelve el daño sin tocar |
| `js/systems/combat.js:337` | `damageHero`: `if(h.classKey==="guerrero") dmg = kaelHitGuard(...)` después del reparto de portadores y antes de los escudos |
| `tools/playtest/campaign.js:41-42` | `job.champ` para probar variantes sin tocar datos |

Texto al jugador (la curación existente de Kael no figuraba en las descripciones):

| Dónde | Antes | Después |
|---|---|---|
| `js/data/champions.js:52` Corte Sangrante | «Aplica un sangrado profundo» | «Aplica un sangrado profundo y cura 4% de tu vida máxima al conectar» |
| `js/data/champions.js:53` Triple Golpe | «Tres golpes veloces; el último causa +300% de daño» | «… +300% de daño. Cura 7% de tu vida máxima al conectar» |
| `tools/i18n/tr/t00.py:47`, `t05.py:94` | claves viejas | claves nuevas con traducción EN/PT; regeneradas con `python3 tools/i18n/build.py` (`js/i18n/en.js:46,768`, `pt.js:46,768`) y `docs/i18n/es-strings.json` |

La cifra se escala por maestría y `heal_mult` (ver `kaelSustain`), así que «4 %/7 %» es el valor base.

## 7. Comprobaciones (salida real, en esta rama)

- `node tools/balance/check-entry-reference.js` → `PASS: reference synchronization, four new-role budgets, four founder-profile budgets, known roster unchanged, invalid role reported`
- `node tools/balance/entry-gate.js` → `{"registered":46,"newChampions":28,"simulations":84,"status":"PASS"}`
- `node tools/bible/ability-gate.js --strict` → `46 campeones · nuevos que no pasan: 0 · page errors: 0` (exit 0)
- `node tools/bible/boss-validator.js --strict` (con `PLAYWRIGHT_MODULE`) → `page errors: 0` (exit 0)
- `node tools/quality/run-all.js --only t_difficulty` / `test-classic-passives` / `t_drag_aim` / `t_sets` / `t_roles` / `test-ability-inspector` / `t_hit_react` → PASS 1, FAIL 0 cada uno
- `node tools/i18n/test-i18n.js` → `TODO OK`; `node tools/i18n/tour.js --check en` → `PASS cobertura` (0,983)
- `python3 tools/art/test-runway-pack.py` → `9946 comprobaciones OK`; `node tests/art-runtime-clips.test.js` → `"status":"PASS"`; `node tools/art/test-champion-draw-dispatch.js` → `19/19 checks`; `node tools/art/check-guerrero-codex.js` → `PASS guerrero codex`
- Los gates regeneran `docs/balance/entry-gate-results.json` y `docs/bible/generated/{BOSS_AUDIT.md,boss-audit.json}`: se descartaron (solo son salida de la corrida).

## 8. Lo que sigue sin balancear / límites

- **Guerrero: sigue por debajo de la banda** en Pesadilla (0,30×) e Infierno (0,22×). Muere por desgaste (golpe letal con ~4 % de vida); lo que se pruebe a continuación debería atacar el desgaste (curación/mitigación sostenida, o un uso de las ráfagas que no lo deje en melee con poca vida), no los golpes puntuales. Con bots no se ve si un humano lo juega mejor.
- Muestras pequeñas (15-50 partidas por casilla, 10 por rol): intervalos de 15-30 puntos. Roles distintos del guerrero medidos con 10 partidas por casilla.
- No medidos: Fortaleza, Acuática, Laberinto, Abismo, Minas; asesino/tirador distintos de Kael; cooperativo; humanos; red.
- Mago (Pesadilla 80 %) sigue por encima de la banda; no se tocó.
- El arnés no registra el rango del atacante letal: no se puede separar élite de horda.
- `bigHits` y el golpe letal medido se toman del jugador; las partidas sin muerte (tope de 22 min) cuentan como no ganadas.
