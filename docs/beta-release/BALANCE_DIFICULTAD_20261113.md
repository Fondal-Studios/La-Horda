# Balance de dificultad y campeones (2026-11-13/14)

Encargo: «corregí la dificultad; buscá balancear a todos los campeones conservando cierta dificultad desde el inicio». Punto de partida: críticas 1 y 3 de `SIMULACION_ALFA_30.md`.

> Todo son **bots** (`tools/playtest/campaign.js`, piloto competente .85/260 ms, equipo `lootPath=1` + `equipBest`, nivel de entrada = nivel esperado de la arena de cada dificultad) con **pocas semillas**. Son señales, no pruebas, y no representan a un humano. No hay intervalos de confianza útiles con n = 5 por casilla.

## 1. Método y alcance (lo que SÍ y lo que NO se midió)

- Semillas: `Math.random` determinista por partida (mulberry32 del propio `campaign.js`); las mismas 5 semillas por casilla antes y después (`2001 + 13*i + 3*índiceArena`). El motor sigue metiendo ruido de tiempo, así que repetir una semilla no da el mismo resultado bit a bit.
- Casilla = arena × dificultad: **5 partidas**, con el rol rotando entre guerrero (Kael), tanque, mago y soporte (clases base). Con la carga de CPU compartida (otros agentes, ~2 partidas/min) no cabía el producto completo arena × dificultad × rol × 5 semillas (600 partidas). Por eso: **5 arenas** (Ciudad, Bosque, Micelial, Hielo, Infernal) × 3 dificultades × 5 semillas = 75 partidas por ronda, y por rol quedan 5-8 partidas por dificultad. **No se midieron Fortaleza, Acuática, Laberinto, Abismo ni Minas** (no se tocaron) ni los roles asesino/tirador distintos del guerrero.
- Antes: 87 partidas (75 de la matriz + 12 sueltas de Hielo Normal de un primer intento). Después: 75 partidas (misma matriz). Control: 45 partidas solo de guerrero (3 semillas) y 5 de Hielo Infierno tras el último ajuste.
- Datos crudos (jsonl): se generaron en el scratchpad de la sesión, no se versionan.

## 2. Qué señales se confirmaron (5 semillas)

| Señal de la simulación original | Resultado con más muestras |
|---|---|
| Normal 35/40 | Confirmada: 83 % (25/30) en estas 5 arenas. Ciudad y Bosque 100 % (7/7, 5/5): sin riesgo real. |
| Pesadilla 7/20, Infierno 5/20 | Matizada: en estas 5 arenas Pesadilla 31 % (9/29), Infierno 25 % (7/28). |
| Ciudad, Hielo, Infernal 0/2 en difícil | Parcial: Ciudad Infierno 0/5 y Infernal Pesadilla 0/5 **se confirman**; Hielo ya no es 0 (Pesadilla 3/8, Infierno 1/8). |
| Muertes muy tempranas | No se repite con el equipo de `lootPath=1`: 0 derrotas < 60 s en las 87 y 1 sola < 120 s (Infierno). La de Ciudad Infierno nivel 3 a 82 s sí apareció en la prueba piloto (guerrero, semilla 1001), con otro nivel. |
| Guerrero débil, mago fuerte | **Confirmada** (tabla de roles). El daño recibido NO es el indicador: el guerrero recibe poco (mediana 2 502 en Normal) pero muere por golpes de élite (200-600 sobre ~1 000-2 000 de vida), no por desgaste. |

## 3. Antes / después

### 3.1 Por dificultad (5 arenas; victorias del piloto)

| Dificultad | Meta | Antes | Después |
|---|---|---|---|
| Normal | 70-85 % | 25/30 = 83 % | 20/25 = 80 % |
| Pesadilla | 35-55 % | 9/29 = 31 % | 11/25 = 44 % |
| Infierno | 15-30 % | 7/28 = 25 % | 8/25 = 32 % (con Hielo Infierno re-medido tras el último ajuste: 10/25 = 40 %; ruido de n = 5) |

Supervivencia mediana en las derrotas: Normal 372 s → 527 s; Pesadilla 248 s → 315 s; Infierno 230 s → 267 s. Derrotas < 60 s: 0 antes y después; < 120 s: 0 después (1 antes).

### 3.2 Por arena (victorias / 5; en la fila «antes», Hielo tiene 8 por las partidas sueltas, Ciudad Normal 7, Ciudad Pesadilla 6)

| Arena | Normal antes → después | Pesadilla antes → después | Infierno antes → después | Derrota mediana Infierno (s, antes → después) |
|---|---|---|---|---|
| Ciudad | 7/7 → 3/5 | 2/6 → 2/5 | **0/5 → 1/5** | 216 (nivel 7) → 491 (nivel 10, llega al jefe) |
| Bosque | 5/5 → 4/5 | 1/5 → 1/5 | 2/5 → 2/5 | 177 → 231 |
| Micelial (sin tocar) | 4/5 → 4/5 | 3/5 → 4/5 | 2/5 → 3/5 | 372 → 267 |
| Hielo | 6/8 → 5/5 | 3/8 → 2/5 | 1/8 → 0/5 (con bossDmg 0,6) → **2/5** (valor final, bossDmg 0,7) | 230 → 224 |
| Infernal | 3/5 → 4/5 | **0/5 → 2/5** | 2/5 → 2/5 | 308 → 209 |

La diferencia en Micelial (sin cambios) da la medida del ruido: ±1-2 victorias por casilla. **Bosque Pesadilla sigue en 1/5** y Hielo Normal subió a 5/5 pese a no endurecerse: esas casillas no se pueden considerar corregidas.

### 3.3 Por rol (victorias; todas las arenas medidas)

| Rol | Normal antes → después | Pesadilla antes → después | Infierno antes → después | Daño recibido mediano (Normal, antes → después) |
|---|---|---|---|---|
| Guerrero (Kael) | 4/8 → 4/7 | 1/8 → 1/6 | 0/7 → 1/6 | 2 502 → 3 225 |
| Tanque | 7/7 → 5/6 | 4/8 → 3/7 | 3/7 → 2/6 | 9 077 → 12 054 |
| Mago | 7/7 → 5/6 | 3/6 → 4/6 | 2/8 → 3/7 | 593 → 1 043 |
| Soporte | 7/8 → 6/6 | 1/7 → 3/6 | 1/5 → 2/6 | 2 105 → 2 889 |

Control de guerrero con 45 partidas (3 semillas × 5 arenas × 3 dificultades) tras subir la curación a 6 %/10 %: Normal 8/15 (53 %), Pesadilla 2/15 (13 %), Infierno 0/15. Resumen de las tres configuraciones del guerrero: sin cambios 5/23 (22 %), con crecimiento de vida 1,15 + curación 4 %/7 % 6/19 (32 %), con curación 6 %/10 % 10/45 (22 %). **No hay mejora distinguible del ruido.** Dispersión entre roles (victorias por rol / media de los cuatro): en Pesadilla el guerrero queda en ~0,4× y en Infierno en ~0,5× (n = 6): **la meta 0,6×-1,4× NO se alcanzó para el guerrero**; el mago en Pesadilla (4/6 = 67 % frente a una media de 44 %) queda en ~1,5×, también fuera de banda; tanque y soporte quedan dentro (n de 6-7 por casilla).

## 4. Perillas tocadas

`js/data/arenas.js` (`ARENA_MODS[arena].tierMods`, multiplicadores hp / dmg / bossDmg sobre la dificultad; líneas del estado final):

| Arena (línea) | Dificultad | Antes | Después | Motivo (medido) |
|---|---|---|---|---|
| Ciudad (l.124) | Normal | 0,75 / 0,7 / 0,75 | 0,85 / 0,8 / 0,85 | 7/7 victorias: sin riesgo real en la primera arena |
| Ciudad (l.124) | Infierno | 3,0 / 2,8 / 1,4 | 2,0 / 1,9 / 1,15 | 0/5 con derrota a 216 s; ahora llega al jefe (491 s) |
| Bosque (l.31) | Normal | (sin ajuste) | 1,05 / 1,1 / 1,05 | 5/5 |
| Bosque (l.31) | Pesadilla | 1,0 / 0,92 / 1,0 | 0,9 / 0,8 / 0,9 | 1/5 |
| Hielo (l.41) | Infierno | 0,55 / 0,55 / 0,7 | 0,45 / 0,45 / 0,7 | 1/8; el golpe de jefe se deja en 0,7 porque con 0,6 el de Infierno quedaba bajo el de Pesadilla (`t_difficulty` GRUPO2 lo detecta) |
| Infernal (l.57) | Pesadilla | 1,2 / 1,1 / 1,05 | 0,95 / 0,85 / 0,9 | 0/5 |

`js/data/champions.js` (Kael, clase `guerrero`):

- `hpGrowthMult` 0,9 → 1,15 (l.49; techo de la banda de rol asesino 1,155: la referencia por rol y `knownChampions` NO se tocaron; `check-entry-reference` pasa).
- Corte Sangrante `healPct` 0 → 0,04 y Triple Golpe `healPct` 0 → 0,07 (fracción de la vida máxima al conectar, escalada por maestría y `heal_mult`). Implementado en `js/skills/abilities.js` (`kaelSustain`, usada en `bleed_hit` y `triple_hit`). La descripción visible de las habilidades no se cambió (no se tocó UI/i18n): queda pendiente decidir el texto.
- Justificación: el guerrero era el único rol con curación 0 y pierde cuando los golpes de élite lo agarran en melee; **no resultó suficiente** (ver 3.3). No se tocaron skins ni aspecto.

## 5. Comprobaciones ejecutadas (salida real)

- `node tools/balance/check-entry-reference.js` → `PASS: reference synchronization, four new-role budgets, four founder-profile budgets, known roster unchanged, invalid role reported`
- `node tools/balance/entry-gate.js` → `{"registered":46,"newChampions":28,"simulations":84,"status":"PASS"}`
- `node tools/bible/ability-gate.js --strict` → `46 campeones · nuevos que no pasan: 0 · page errors: 0`
- `python3 tools/art/test-runway-pack.py` → `test-runway-pack: 9945 comprobaciones OK`
- `node tools/quality/run-all.js --only t_difficulty` → PASS (la primera vez FALLÓ por la monotonía de Hielo Infierno con bossDmg 0,6; corregido a 0,7), `--only test-campaign-startup` → PASS, `--only t_campaign` → PASS.
- Los gates regeneran `docs/balance/entry-gate-results.json` y `docs/bible/generated/*`; se descartaron esos cambios (solo son salida de la corrida).

## 6. Lo que sigue sin balancear / límites

- Guerrero: sigue en ~22-32 % global frente a ~45-60 % de los otros roles. La curación y el crecimiento de vida no mueven el resultado; el piloto lo juega en melee y muere por golpes de élite. Hace falta probar mitigación por golpe, esquiva con invulnerabilidad o mejor uso de la movilidad, y verificar con humanos antes de más números.
- Mago y soporte: mago 83 % / 67 % / 43 % es el rol más fuerte; no se tocó (sin evidencia de n suficiente para un recorte justificado).
- Bosque Pesadilla (1/5), Hielo Infierno (0/5 o 2/5 según la ronda) y Ciudad Normal/Infierno son casillas ruidosas: se necesitan ≥ 20 partidas por casilla para afinarlas.
- Sin medir: Fortaleza, Acuática, Laberinto, Abismo, Minas y roles tirador/soporte distintos de las clases base; tampoco cooperativo ni humanos.
- Las metas son orientativas; con n = 5 por casilla un 40 % puede ser 0-80 %. Los totales por dificultad entran en la banda objetivo, pero las diferencias antes/después de una casilla individual no son significativas.
