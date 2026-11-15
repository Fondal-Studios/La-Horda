# Fase 1b: partidas que no terminan (2026-11-15)

Origen: informe de la Fase 2 (`FASE2_BALANCE.md` y `FASE2_BALANCE_partidas.tsv`, rama local `cierre-fase2`, commit 3b96dbae). Mismo piloto y parámetros: `tools/playtest/campaign.js`, piloto 0,85 / 260, `lvl:'arena'`, `lootPath=1` + `equipBest`, tope de 22 min de juego.

**Resultado:** dos bugs del juego, los dos arreglados con un cambio de lógica pequeño y sin tocar valores de balance. Un humano también quedaba atascado con cualquiera de los dos. El resto de los topes de 22 min avanza sin parar hasta el final: es el ritmo de daño del tanque o del soporte (dificultad) o un límite del piloto automático, no un atasco.

## 1. Bugs del juego

### Bug 1: un jefe dormido o intocable se podía matar antes de ser `boss` y la victoria no llegaba

- **Casos:** Fortaleza Pesadilla, tanque, semilla 5144 (Caballero en estado `dead`, `boss` nulo, 900 s hasta el tope). Es también la explicación más probable de Micelial Pesadilla, soporte, semilla 5104 (Madre Espora con `alive=false` y vida −100, sin victoria). Ese caso no se repitió en la Fase 2 ni acá.
- **Causa raíz:** `damageEnemy` multiplicaba por `(e.dmgTakenMult||1)`. Un `0` es falso en JavaScript, así que **`dmgTakenMult = 0` valía 1** y el jefe recibía daño completo. Tres jefes usan `0` para quedar intocables mientras todavía no son `boss`:
  - el Caballero sentado en su trono (`fort-map.js`, `fortKnightLevelStart`);
  - la Madre Espora latente (`mic-mother.js`, `micMotherRevealStart`);
  - el Carcelero mientras surge (`ab-bosses.js`, `abCarceleroRise`).

  Si el equipo los mataba en ese estado, `killEnemy` no llamaba a `onBossDefeated` (`e !== boss`), no había victoria y la partida seguía hasta perder por tiempo.
- **Traza (5144, sin arreglo):** el equipo entra al nivel 10 a los 351 s. El Caballero está en `waiting`, con `boss=null` y `dmgTakenMult=0`. Pierde 128 318 de vida en 14 s y queda `dead` a los 365 s, todavía con `boss=null`, `bossActive=false` y `levelDuration=9e9`. De ahí en adelante no pasa nada hasta los 1320 s.
- **Arreglo:** `js/systems/combat.js:15`, `(e.dmgTakenMult===0 ? 0 : (e.dmgTakenMult||1))`, más una línea de comentario en la 8. Un valor sin definir sigue valiendo 1.
- **Efecto colateral (intencional, de diseño):** las ventanas que ya pedían inmunidad con `0` ahora la tienen de verdad: la transición a fase 3 del Caballero (1,7 s, `fort-bosses.js:426`), la transición a fase 2 de la Madre (`mic-mother.js:268`, termina en la 226) y la construcción del subjefe de Micelial (`mic-subboss.js:68`, termina en la 35). Las trampas de Fortaleza ya trataban `< 0.05` como inmune (`fort-traps.js:110`), y otros jefes usaban `0.0001` para esquivar este mismo error (`cm-bosses.js:381`, `fort-duo.js:30`). No cambia ninguna vida, daño, `tierMods` ni kit.

### Bug 2: el Caballero o el equipo quedaban del otro lado de la puerta cerrada de la cámara

- **Casos:** Fortaleza Normal, tanque, semillas 5029 y 5015. El informe decía «jefe casi muerto, a ~360 px, sin perder vida».
- **Causa raíz:** con la puerta `g_knight` cerrada queda un hueco sin piso entre la cámara (piso hasta y ≈ −3540) y el patio `core_n` (desde y ≈ −3390). La Carga del Caballero, sus barridos y golpes de escudo empujan a los héroes, y las habilidades del equipo lo empujan a él. Cuando alguien quedaba fuera del piso, `fortClamp` (`fort-map.js`) lo llevaba al piso más cercano. Si estaba más cerca del patio, «aparecía» afuera, al otro lado de la puerta cerrada. Nada lo devolvía a la cámara: la red de seguridad existente solo actúa en el estado `waiting`.
- **Traza (5029, solo con el arreglo 1):** a los 570 s dos aliados ya están en y = −3390, es decir, afuera. A los 589-591 s, tras una Carga, el Caballero pasa de y −3577 a −3492 (sin piso) y luego a −3344 (afuera). Desde los 616 s se queda clavado en y = −3390 contra la puerta, mientras el jugador sigue en la cámara, a 500 px. El Caballero queda en 2935/7089 de vida hasta el tope.
- **Arreglo:** `js/arenas/fortaleza/fort-map.js:330-334` y la función nueva `fortKnightKeepInside` (`fort-map.js:372-386`). Durante la pelea (`K.state === "fight"`), quien sale de la cámara vuelve a entrar por la puerta, igual que en la red de seguridad de la espera. Si es un héroe, vuelve 100 px adentro; si es el Caballero, 170 px (y no mientras dura su Carga). Se usa una posición fija, sin `Math.random`, para no consumir la semilla. No hay pausa ni tope de espera, y no cambia la dificultad.

## 2. Topes que no son bugs (dificultad o piloto)

| Caso | Diagnóstico (sonda en las corridas con los dos arreglos) | Clasificación |
|---|---|---|
| Fortaleza Infierno, tanque, 5224 (nivel 6 retenido por `dragon_forja`) | El Dragón baja sin pausas de 119 357 a 48 639 de vida en 1150 s (huye al 25 %, o sea a 29 839). Los aliados murieron, el jugador pelea solo y siempre hay 20 enemigos vivos. `fortHoldLevel` funciona como se diseñó. | Dificultad, ritmo de daño del tanque solo (y el piloto no reanima). No es un atasco. |
| Fortaleza Infierno, tanque, 5217 | El jugador y el Caballero siempre dentro de la cámara (sonda `kIn=1`, héroes `i`). Entre 500 y 700 s el equipo pelea contra el Dragón acompañante (el Caballero queda al 99 %). Después el Caballero baja 1 % cada 20 s; con armadura del dúo y los aliados caídos, llega al tope con 72 %. | Dificultad. Límite del piloto: no usa las válvulas ni el fuego del Dragón para dejarlo EXPUESTO (la regla del encuentro). |
| Fortaleza Pesadilla 5109; Fortaleza Infierno, tanque, 5203, 5238 y 5245 | El jefe baja de forma continua (ningún hueco de más de 50 s sin cambio) y termina con 49 %, 60 %, 21 % y 3 %. En 5109 y 5203 el equipo llega al nivel 10 tarde (948 y 1051 s). | Dificultad o ritmo del tanque. |
| Acuática Infierno, tanque, 5249 | El Leviatán baja de 84 % (1020 s) a 16 % (1320 s) sin pausas. | Dificultad. |
| Minas Infierno, tanque, 5245 | El Cerbero baja de 44 % a 16 % entre 1020 y 1320 s; el mayor hueco sin cambio es de 53 s. | Dificultad. |
| Micelial Pesadilla, soporte, 5104 (repetición) | La Madre llega a fase 3 con 65 585/238 043. Su vida sube a ratos (regeneración del diseño, ya documentada en `FASE1_JUGABILIDAD.md`). No murió ni quedó `dead` sin victoria. | Dificultad o regla de diseño. El «muerto sin victoria» original encaja con el bug 1 (ver §1). |

## 3. Antes y después

«Antes» = la Fase 2 (TSV, 17 topes de 480) y mis repeticiones sin arreglo. «Después» = una corrida por caso con los dos arreglos (`campaign.js` con `maxMin:22`). Las semillas fijan `Math.random`, pero el anfitrión mete ruido de tiempo y los arreglos cambian el consumo de números al azar. Por eso las partidas no son idénticas entre versiones, y el «después» de cada caso es una sola corrida.

| Caso | Antes | Solo arreglo 1 | Arreglos 1 + 2 |
|---|---|---|---|
| Fortaleza P tanque 5144 | tope, jefe nulo (TSV; repetido acá: `playing 1320s boss=null`) | **victoria 443 s** | **victoria 442 s** |
| Fortaleza N tanque 5015 | tope, Caballero al 1 % | victoria 1253 s | **victoria 1178 s** |
| Fortaleza N tanque 5029 | tope, Caballero al 40 % | tope (Caballero afuera de la cámara desde 616 s) | **victoria 894 s** |
| Fortaleza I soporte 5210 / 5224 / 5245 | tope (100 % / 7 % / 62 %) | victoria 670 s / tope / tope | **victoria 615 s / 995 s / 1121 s** |
| Fortaleza I tanque 5231 | tope (51 %) | tope | **victoria 1246 s** |
| Minas I tanque 5217 | tope (9 %) | victoria 1022 s | victoria 1268 s |
| Acuática I tanque 5214 | tope (95 %) | victoria 1305 s | derrota en el nivel 9 a los 320 s |
| Fortaleza P tanque 5109; I tanque 5203, 5217, 5238, 5245; I tanque 5224 (nivel 6); Acuática I 5249; Minas I 5245; Micelial P soporte 5104 | tope | tope | tope, con avance continuo (§2) |

Con los dos arreglos, de los 18 casos (17 topes del TSV más 5104): 9 victorias, 1 derrota y 8 topes. Ninguno de los 8 topes está trabado: en todos baja la vida del jefe o del subjefe hasta el último segundo.

## 4. Pruebas

- **Nueva:** `tools/items/t_boss_dormant.js`, registrada en `tools/quality/run-all.js` y `tools/quality/qa-manifest.json` (obligatoria, `campana_progresion`). Comprueba siete cosas:
  - regla general: `dmgTakenMult` 0 no recibe daño; 1 o sin definir, sí;
  - el Caballero sentado no recibe daño;
  - el Caballero muerto en pelea da `state === 'victory'`;
  - durante la pelea, el Caballero y un héroe puestos en el patio `core_n` con la puerta cerrada vuelven a la cámara;
  - la Madre latente no recibe daño;
  - la Madre muerta en pelea da victoria;
  - el Carcelero surgiendo no recibe daño.
- **Sin arreglos:** 6 fallas (sin `combat.js`) y 1 falla (sin `fort-map.js`: `pelea_nadie_queda_fuera_de_la_camara`, con el Caballero y el héroe en y = −3320). **Con arreglos:** `TODO OK`.
- **Comprobaciones con salida real** (en el worktree, con los arreglos):
  - `run-all --only` de cada una por separado: t_boss_dormant, t_abismo, t_objectives, t_boss_assist, test-campaign-startup, t_difficulty y t_campaign dan PASS 1 / FAIL 0;
  - `tools/fortaleza/t_fortaleza.js` (no está en run-all; se corrió directo): 41/41 PASS, 0 errores de página;
  - `boss-validator.js --strict`: 20 PASS y 8 PASS*, 0 errores de página (caballero, madre_espora y ab_carcelero en PASS o PASS*);
  - `ability-gate.js --strict`: 46 campeones, 0 nuevos que no pasan;
  - `check-entry-reference.js`: PASS;
  - `test-runway-pack.py`: 9946 comprobaciones OK.
  - Los archivos generados por los gates se restauraron con `git checkout --`.
- **`tools/playtest/campaign.js`:** se copiaron de `cierre-fase1` (4d17b8c8) las opciones `maxMin` y `trace`, sin cambiar el comportamiento por defecto (22 min, sin traza). Las sondas por segundo usaron una copia temporal del arnés con un `job.probe` evaluado cada segundo, que no se versiona.

## 5. Lo que no se determinó

- El caso Micelial 5104 original (Madre muerta sin victoria) no se reprodujo. Se atribuye al bug 1 porque coincide la firma (vida negativa, `alive=false`, sin victoria) y porque la prueba demuestra que la Madre latente se podía matar sin ser `boss`. No hay traza de esa partida.
- Hay otros 18 topes del total de 35 sobre 700 que pertenecen a rondas previas a este TSV. No están en `FASE2_BALANCE_partidas.tsv` y no se pudieron listar ni repetir.
- Ciudad Pesadilla (nivel 9 retenido por `cm_dama`) no se repitió.
- No se midió con humanos. Tampoco se repitió cada caso varias veces con el arreglo: hay una corrida por caso, sin intervalo de confianza.
- El balance del tanque y del soporte contra el Caballero acorazado y el Dragón en Infierno queda para una ronda de balance. Acá no se tocó.
