# Simulación de todas las arenas + «alfa de 30 jugadores» (bots)

Fecha de la corrida: 2026-11-13. Rama `claude/la-horda-beta-audit-exec-mwv8x0`, commit base `647a8b6b`. Código del juego sin tocar.

> **Esto es una SIMULACIÓN con bots (el piloto automático `tools/playtest/autopilot.js`).** No hay jugadores reales. No mide diversión, comprensión, frustración ni retención humana. Sí mide: robustez técnica (errores, cuelgues), balance relativo entre campeones/arenas/dificultades, ritmo de la partida y flujo de la primera sesión según los scripts existentes. Todos los números salen del código real del juego en Chromium headless (Playwright 1.63, render por software SwiftShader). Cada partida usa una semilla (una sola semilla por casilla: n pequeño, sin intervalos de confianza).

## 1. Método

- **Motor de partidas:** `tools/playtest/campaign.js` (el que usan `difficulty-matrix.js` y la matriz de dificultad). Partida completa del nivel 1 al jefe con `__AP.sim` (update() acelerado, sin dibujar), tope de 22 min de juego; el jugador **recibe daño real** (a diferencia de `campaign_runs.js`, que lo hace invulnerable). Equipo real: `lootPath=1` + `equipBest` (botín de haber ganado una vez cada arena anterior), nivel de entrada = `DIFF.arenaLevel` de la arena (+ `lvlAdd` en los perfiles). Perfiles de piloto del propio script: aprendiz (.45/650 ms), ocasional (.7/400), habitual (.9/220), competente (.85/260).
- **A. Arenas:** 10 arenas de `CAMPAIGN_ORDER` x Normal con 4 representantes de rol (guerrero=asesino, tanque, mago, soporte) = 40 partidas; x Pesadilla e Infierno con guerrero y mago = 40 partidas. Total 80.
- **B. Alfa de 30 perfiles:** 30 de los 46 campeones (7 tanques, 8 asesinos, 10 magos, 5 soportes), arena rotada, dificultad (18 Normal, 6 Pesadilla, 6 Infierno), nivel de entrada -4..+4 sobre el esperado y los 4 perfiles de piloto.
- **C. Control de campeones:** los 46 campeones en la misma arena (Bosque, Normal, nivel 6, piloto competente, mismo equipo) para comparar sin confundir arena/dificultad.
- **Rendimiento:** `perf_arenas.js` (temporal, no se versiona): 240 s de juego con el piloto, luego 300 cuadros en bucle cerrado midiendo `update()` y `render()` y 6 s de cuadros `requestAnimationFrame` reales con el bucle vivo. Más `tools/beta/perf.js` (`--main` = el mismo árbol, solo línea base absoluta).
- **Flujo/controles/otros modos:** `tools/alfa/q1_first_session.js`, `q2_campaign_smoke.js` (MODE=real, QUICK), `q7_controls.js`, `tools/bots/victory-sim.js` (cw y col).
- Total: 156 partidas de campaña (80 A + 30 B + 46 C) + 1 de Divina (ver límites). **0 errores de página (`pageerror`), 0 excepciones del piloto, 0 cuelgues del navegador** en las 156 (campo `errors`/`apErr` vacío).

## 2. Arenas: qué se pudo simular

Enumeración real: `CAMPAIGN_ORDER`/`ARENA_ORDER` en `js/data/arenas.js` = 10 arenas (ciudad, fortaleza, bosque, micelial, hielo, acuatica, laberinto, abismo, minas, infernal). `ARENA_MODS` además tiene `divina` (postgame, asedio 4v4, fuera de las diez). `tools/playtest/difficulty-matrix.js` usa las mismas 10; `tools/bots/victory-sim.js` cubre otros modos (Guerra de Cristales `cw` y Coliseo `col`). `docs/production/asset-blocks.json` lista bloques de arte (arenas aparecen como enemigos/portadas), no define arenas jugables.

Tabla por arena. Normal = 4 partidas (guerrero, tanque, mago, soporte); Pesadilla/Infierno = 2 (guerrero, mago). «Sin terminar» = el piloto llegó al tope de 22 min sin ganar ni morir. Tiempo = mediana de las victorias Normal (segundos de juego). Daño recibido, oro y bajas = mediana de las 4 de Normal. Rendimiento = guerrero, 240 s de juego, software render.

| Arena | Nivel entrada | Normal | Pesadilla | Infierno | Sin terminar (de 8) | Tiempo victoria | Bajas | Daño recibido | Oro | Pico enemigos | render ms (media/p95) | update ms (media/máx) | FPS real (cuadros >33 ms) | Errores |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ciudad | 1 | 4/4 | 0/2 | 0/2 | 0 | 550 s | 501 | 2354 | 1994 | 35 | 3.16/4.4 | 0.86/4.0 | 43.9 (10%) | 0 |
| fortaleza | 1 | 3/4 | 1/2 | 1/2 | 0 | 583 s | 683 | 3132 | 1931 | 37 | 5.31/7.4 | 1.25/5.7 | 36.7 (20%) | 0 |
| bosque | 6 | 4/4 | 1/2 | 0/2 | 0 | 424 s | 796 | 2980 | 2804 | 32 | 4.21/6.4 | 0.57/3.8 | 32.0 (21%) | 0 |
| micelial | 12 | 3/4 | 1/2 | 0/2 | 1 (infierno guerrero) | 461 s | 1060 | 5390 | 2191 | 49 | 3.21/5.0 | 0.55/16.0 | 52.1 (6%) | 0 |
| hielo | 17 | 4/4 | 0/2 | 0/2 | 0 | 468 s | 1004 | 4790 | 2989 | 39 | 4.49/6.9 | 0.59/9.2 | 39.0 (16%) | 0 |
| acuatica | 23 | 4/4 | 1/2 | 1/2 | 0 | 585 s | 974 | 7859 | 2954 | 32 | 4.63/7.2 | 0.66/4.0 | 37.8 (16%) | 0 |
| laberinto | 26 | 3/4 | 1/2 | 1/2 | 0 | 412 s | 958 | 11432 | 3292 | 46 | 3.94/5.6 | 0.55/2.3 | 45.3 (11%) | 0 |
| abismo | 28 | 2/4 | 1/2 | 1/2 | **4** | 382 s | 597 | 2106 | 1869 | 43 | 2.27/4.0 | 0.59/1.4 | 35.2 (21%) | 0 |
| minas | 31 | 4/4 | 1/2 | 1/2 | 0 | 494 s | 592 | 5702 | 2259 | 37 | 2.09/3.3 | 0.52/2.7 | 40.5 (14%) | 0 |
| infernal | 34 | 4/4 | 0/2 | 0/2 | 0 | 432 s | 1097 | 12273 | 4500 | **77** | 4.14/6.4 | 0.79/4.5 | **24.0 (43%)** | 0 |
| **Total** | | 35/40 | 7/20 | 5/20 | 5 | | | | | | | | | 0 |

(Las victorias en Pesadilla/Infierno están en la fila de cada arena; los niveles de entrada de Pesadilla/Infierno son más altos, p. ej. Bosque 42/68, Minas 67/93.)

Otros modos simulados con el piloto/bots del repo:

| Modo | Corrida | Resultado |
|---|---|---|
| Arena Divina (`divina`) | 1 partida con `campaign.js`, guerrero lv40 | Se ejecutó como PvE (jefe `demonio_mayor`, derrota en nivel 10, 507 s, 962 bajas): **no es el asedio 4v4**; no representativa. |
| Guerra de Cristales | `victory-sim.js cw 2 420` | 2 partidas, 0 errores, **sin ganador en 420 s** (`ganadores:[-1,-1]`), 0.5 torres derribadas por partida, 2.96 ms/cuadro de `update`. Tope de 7 min: no concluyente sobre si la partida termina. |
| Coliseo | `victory-sim.js col 2 600` | 2 torneos terminados, duración media 158 s, 0 errores. |
| Q2 humo de campaña (MODE=real, QUICK) | 10 partidas, 1 campeón por arena, **sin equipo** | 9/10 «OK» (la herramienta cuenta derrota como OK en modo real), pero **5 de 10 fueron derrota** (ciudad, fortaleza, hielo, acuática, laberinto; hielo/acuática/laberinto/fortaleza caen en el nivel 6 a ~4 min) y **1 FALLA**: abismo/nigromante, «el nivel 9 no terminó en 6 min de juego». |

**No simulado / no representativo:** asedio 4v4 de la Arena Divina (el piloto no lo juega), partidas multijugador reales/LAN (`tools/lan`, `tools/net-test` no se corrieron), tablet/gamepad reales, sonido, arte percibido.

## 3. Perfiles: «alfa de 30 jugadores» sintéticos

Nivel = nivel del campeón al entrar. «Bajas aliadas caídas» = cuántas veces cayó un compañero bot (indicador de presión del equipo), «vida mín» = vida mínima del jugador en %, «daño» = daño recibido por el jugador. Bloqueos de UI/errores: 0 en todas (la sim no dibuja UI; ver sección 5 para la primera sesión).

| # | Campeón | Rol | Arena | Dificultad | Piloto | Nivel | Resultado | Nivel run | Tiempo | Bajas | Daño | Aliados caídos | Vida mín | Oro | Causa de derrota | Errores |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | tanque | tanque | fortaleza | normal | aprendiz | 1 | gana | 10 | 804 s | 691 | 3609 | 13 | 72% | 1438 | - | 0 |
| 2 | guerrero | asesino | hielo | normal | ocasional | 17 | gana | 10 | 414 s | 1023 | 2660 | 3 | 38% | 3142 | - | 0 |
| 3 | ilsa | asesino | abismo | pesadilla | habitual | 64 | gana | 10 | 633 s | 777 | 10234 | 18 | 84% | 5099 | - | 0 |
| 4 | sira | mago | ciudad | normal | competente | 5 | gana | 10 | 901 s | 623 | 1368 | 20 | 1% | 1365 | - | 0 |
| 5 | dariel | soporte | micelial | infierno | aprendiz | 74 | pierde | 2 | 50 s | 132 | 13050 | 3 | 55% | 2414 | acechador | 0 |
| 6 | vorn | tanque | laberinto | normal | ocasional | 24 | gana | 10 | 414 s | 963 | 7386 | 0 | 96% | 3211 | - | 0 |
| 7 | orsa | asesino | infernal | normal | habitual | 36 | gana | 10 | 464 s | 1083 | 13168 | 28 | 66% | 4650 | - | 0 |
| 8 | iria | mago | bosque | pesadilla | competente | 42 | pierde | 6 | 181 s | 738 | 8270 | 21 | 8% | 3394 | bestia_bosque | 0 |
| 9 | profeta | soporte | acuatica | normal | aprendiz | 19 | gana | 10 | 527 s | 942 | 4516 | 11 | 61% | 2301 | - | 0 |
| 10 | maura | tanque | minas | infierno | ocasional | 93 | gana | 10 | 578 s | 787 | 306686 | 74 | 32% | 6133 | - | 0 |
| 11 | ilkan | asesino | fortaleza | normal | habitual | 1 | gana | 10 | 571 s | 680 | 2377 | 2 | 79% | 2331 | - | 0 |
| 12 | myla | mago | hielo | normal | competente | 21 | gana | 10 | 404 s | 1027 | 438 | 0 | 94% | 3268 | - | 0 |
| 13 | morveth | mago | abismo | pesadilla | aprendiz | 64 | gana | 10 | 664 s | 765 | 24280 | 24 | 35% | 4462 | - | 0 |
| 14 | segador | tanque | ciudad | normal | ocasional | 1 | gana | 10 | 557 s | 495 | 3217 | 16 | 50% | 1655 | - | 0 |
| 15 | musashi | asesino | micelial | infierno | habitual | 76 | pierde | 10 | 799 s | 1323 | 74495 | 28 | 5% | 6717 | jefe (habilidad de mundo) | 0 |
| 16 | mago | mago | laberinto | normal | competente | 26 | gana | 10 | 389 s | 971 | 2993 | 0 | 60% | 3957 | - | 0 |
| 17 | aurelia | mago | infernal | normal | aprendiz | 30 | gana | 10 | 414 s | 1018 | 6107 | 22 | 60% | 4424 | - | 0 |
| 18 | oriel | soporte | bosque | pesadilla | ocasional | 42 | gana | 10 | 406 s | 1447 | 67457 | 35 | 54% | 7421 | - | 0 |
| 19 | kora | tanque | acuatica | normal | habitual | 23 | gana | 10 | 554 s | 980 | 8816 | 15 | 93% | 2623 | - | 0 |
| 20 | khepri | asesino | minas | infierno | competente | 97 | gana | 10 | 454 s | 643 | 49425 | 27 | 28% | 6851 | - | 0 |
| 21 | zahra | mago | fortaleza | normal | aprendiz | 1 | gana | 10 | 445 s | 679 | 573 | 1 | 78% | 1737 | - | 0 |
| 22 | farolero | soporte | hielo | normal | ocasional | 15 | gana | 10 | 432 s | 968 | 6233 | 12 | 33% | 2362 | - | 0 |
| 23 | renko | tanque | abismo | pesadilla | habitual | 66 | gana | 10 | 367 s | 773 | 5285 | 1 | 100% | 4711 | - | 0 |
| 24 | nahir | asesino | ciudad | normal | competente | 1 | gana | 10 | 475 s | 463 | 1902 | 1 | 32% | 1808 | - | 0 |
| 25 | brasa | mago | micelial | infierno | aprendiz | 70 | pierde | 6 | 189 s | 660 | 25410 | 19 | 23% | 3790 | peregrino (proyectil) | 0 |
| 26 | soporte | soporte | laberinto | normal | ocasional | 26 | gana | 10 | 414 s | 1001 | 5221 | 0 | 91% | 3057 | - | 0 |
| 27 | eslabon | tanque | infernal | normal | habitual | 34 | pierde | 10 | 356 s | 926 | 17916 | 25 | 0% | 2014 | demonio_menor | 0 |
| 28 | libertador | asesino | bosque | pesadilla | competente | 46 | gana | 10 | 467 s | 1342 | 48500 | 16 | 0% | 7893 | - | 0 |
| 29 | axiom | mago | acuatica | normal | aprendiz | 23 | gana | 10 | 569 s | 1000 | 2579 | 0 | 100% | 3014 | - | 0 |
| 30 | vhal | mago | minas | infierno | ocasional | 91 | pierde | 6 | 193 s | 410 | 16494 | 14 | 18% | 3386 | mn_insecto | 0 |

Resumen B: **24/30 victorias**. Por dificultad: Normal 17/18, Pesadilla 5/6, Infierno 2/6. Por piloto: aprendiz 6/8, ocasional 7/8, habitual 5/7, competente 6/7 (no hay gradiente claro de habilidad: el piloto aprendiz casi no pierde, ver crítica 3). Por rol: tanque 6/7, asesino 7/8, mago 7/10, soporte 4/5. Las 6 derrotas: 4 en Infierno/Pesadilla temprano, 1 en Normal (eslabon, Infernal, vida 0%).

## 4. Control de campeones (46 campeones, Bosque, Normal, lv 6, piloto competente)

| Rol | Victorias | Mediana tiempo | Mediana daño recibido | Mediana bajas | Mediana aliados caídos | Mediana oro |
|---|---|---|---|---|---|---|
| tanque (10) | 9/10 | 457 s | 5064 | 809 | 15 | 2428 |
| asesino (12) | 10/12 | 403 s | 2513 | 830 | 9 | 2709 |
| mago (16) | 12/16 | 406 s | 833 | 772 | 5 | 2343 |
| soporte (8) | 5/8 | 416 s | 2361 | 763 | 10 | 1804 |

Derrotas (10/46): guerrero, veyra (asesinos), aelith, morwen, sira, brasa (magos), dariel, oriel, soporte (soportes), renko (tanque). Casi todas mueren en el nivel 10 (jefe) con ~300 de vida máx a nivel 6 (`cu_sith`, `bestia_bosque`, proyectiles del jefe). Mayor daño recibido: kora 8407, brakk 7719, tanque 6772 (mediana general 2243). Ningún campeón gana o pierde siempre con una sola semilla; con n=1 por campeón no se puede afirmar un outlier individual: se señalan solo los patrones que se repiten en varias corridas (guerrero, rol soporte, tanques por daño recibido).

## 5. Flujo de primera sesión, controles y economía (herramientas `tools/alfa`)

- **`q7_controls.js`:** 81 PASS, 0 FAIL (disposición en 5 pantallas, multitouch, zurdo, teclado, mando simulado). Sin problemas.
- **`q1_first_session.js`:** **21 PASS / 25 FAIL**, EXIT 1. Dos tipos de fallo:
  - `CUENTA · sin errores de página`: `fetch` a `https://fondalstudios.com/la-horda/red/api/health` bloqueado por CORS desde `127.0.0.1` (ruido del entorno local, no del juego).
  - En el paso «Tu skin de regalo» el script espera `#starter-skin-yes-btn`, pero la pantalla (captura tomada con `SHOTS=`) muestra solo la barra «Sin apuro: la skin se puede elegir cuando quieras en la Tienda. [Seguir sin skin ›]» hasta elegir una carta. El script nunca avanza, el estado queda en `starter` y todo lo que sigue (Guardianes, Tienda, JUGAR, victoria, derrotas) falla en cascada (`ARENA.empieza_la_partida: "starter"`). Además `SKIN.la_barra_no_tapa_las_cartas` falla de verdad: la barra empieza en y=306 y las cartas terminan en y=314 (8 px de solape; se ve en la captura: la descripción de las cartas queda cortada por la barra) en 844x390 táctil.
  - Consecuencia: **no se pudo medir el resto de la primera sesión (tienda, primera partida, derrotas, recarga) con la herramienta existente.** Q1 está desincronizado con la pantalla actual.
- **`q4_econ.js`** (economía Monte Carlo): **no se pudo correr**, la página crashea («Target crashed») con N=400 y N=100 en este entorno.
- **Economía medida con las partidas (no con `q4_econ`):** oro por victoria Normal ≈ 1.9-2.2k en Ciudad/Fortaleza, ≈ 2.8-3.3k en Bosque-Laberinto, 4.5k en Infernal; Pesadilla/Infierno pagan 4-11k. Niveles ganados por una victoria con el piloto: Ciudad/Fortaleza/Bosque +10-12 niveles, Micelial +8, Hielo +5, Acuática/Laberinto +3-4, Abismo/Minas/Infernal +1-3. Un jugador que ganara Ciudad (nivel 1 → ~12) entraría a Fortaleza (esperado 7) y Bosque (11) sobrenivelado, y a partir de Hielo el crecimiento por partida cae a 3-5 niveles. (Cada partida de la sim arranca en el nivel esperado, así que esto es una lectura por arena, no una campaña encadenada.)

## 6. Outliers y límites

Outliers (patrones, no certezas):
1. **Guerrero (asesino de partida)**: Normal 6/10 (cae en Fortaleza, Micelial, Laberinto; Abismo sin terminar) frente a mago 10/10, soporte 10/10, tanque 9/10 en las mismas 10 arenas; en Pesadilla 1/10 vs mago 6/10; en Infierno 2/10 vs mago 3/10 (las filas de Pesadilla/Infierno agrupan 2 partidas por arena y rol). También pierde en el control de Bosque (`cu_sith`).
2. **Magos** ganan más y reciben ~3x menos daño (mediana 833 vs 2513-5064 en el control).
3. **Tanques con mucho daño recibido** (kora 8407, brakk 7719, maura 306 686 en Infierno con 74 aliados caídos): ganan, pero su partida es de pura absorción.
4. **Abismo**: nivel 9 se queda sin terminar (ver crítica 2). **Micelial Infierno** con guerrero: Madre Espora sigue viva con 27% de vida a los 22 min, daño recibido 241 590.
5. **Infernal** tiene 77 enemigos de pico y 24 FPS (43% de cuadros sobre 33 ms), el peor de las 10 arenas.

Límites:
- Bots: no miden diversión, claridad, curva de aprendizaje ni frustración humana. El piloto no usa todas las habilidades como un humano ni conoce los mapas especiales.
- n pequeño: una semilla por casilla, 2 partidas por casilla de Pesadilla/Infierno. Un 0/2 vs 1/2 no es significativo; las tendencias sí lo son cuando se repiten (Normal 35/40 vs Pesadilla 7/20 vs Infierno 5/20).
- El equipo es el de `lootPath=1` (una victoria por arena anterior); un jugador real con más farmeo (o menos) cambia los resultados. En Q2, sin equipo, 5 de 10 arenas terminan en derrota.
- Rendimiento: SwiftShader (render por software); sirve para comparar arenas, **no** como FPS de un teléfono. Las bajas de FPS reales incluyen la competencia de CPU con otras partidas simuladas (la medición se hizo sola, tras terminar las tandas).
- Dos copias del árbol en `tools/beta/perf.js` apuntando al mismo directorio: línea base absoluta (render medio 4.5-4.6 ms, cuadros >33 ms 8-10%, 0 errores).
- No hubo prueba de red/multijugador real, ni estado de servidor, ni audio.

## 7. Cinco críticas para mejorar (por impacto)

**1. Escalón de dificultad Normal → Pesadilla → Infierno demasiado brusco.**
- Evidencia (80 partidas A + B): Normal 35/40 (88%), Pesadilla 7/20 (35%), Infierno 5/20 (25%). Ciudad, Hielo e Infernal son 0/2 en Pesadilla **y** 0/2 en Infierno; el guerrero gana 1/10 en Pesadilla y 2/10 en Infierno. En el perfil B, Normal 17/18 contra Infierno 2/6. Las derrotas son rápidas: Ciudad Infierno cae en el nivel 3 (84 s), Micelial Pesadilla en el nivel 4 (111 s), Dariel Infierno en el nivel 2 (50 s).
- Acción: revisar `tierMods` por arena en `js/data/arenas.js` (los comentarios ya admiten ajustes ad hoc por arena: Bosque, Hielo) y alinear una meta explícita por dificultad (p. ej. ~70% Normal / ~45% Pesadilla / ~25% Infierno para el equipo esperado); empezar por Ciudad, Hielo e Infernal, y por los primeros 3 niveles de Infierno, que matan antes de que el jugador pueda reaccionar.

**2. Abismo no termina: el nivel 9 se queda esperando a un subjefe (posible soft-lock en la arena 8 de 10).**
- Evidencia: 4 de las 8 partidas de Abismo del barrido A no terminan (guerrero Normal, tanque Normal, guerrero Pesadilla, mago Infierno; tope 22 min de juego) y `q2_campaign_smoke` falla con nigromante («el nivel 9 no terminó en 6 min de juego»). En las 4 de `campaign.js`: `holdLevel` activo, `levelTimer` 1 038 608 ms contra `levelDuration` 45 400 y el subjefe `ab_carcelero` vivo (guerrero Normal: 10 662/22 067 de vida, jugador vivo a ~440 unidades de distancia, 3 aliados caídos; tanque Normal: jugador a ~630 unidades). Las otras 4 partidas de Abismo ganan: mago y soporte (Normal), mago (Pesadilla), guerrero (Infierno). Micelial Infierno (guerrero) también queda sin terminar con Madre Espora al 27%.
- Matiz: no puedo distinguir un fallo del juego de un límite del piloto (no acercarse al Carcelero en plataformas). Aun así el nivel espera indefinidamente a que muera un solo enemigo.
- Acción: reproducir con un humano o con la traza de `stall` de `campaign.js` en `js/arenas/abismo*`; añadir un tope de espera/escalada al `holdLevel` del subjefe (que aparezca el jefe pasado X minutos o que el subjefe se acerque), y un test de humo en `tools/alfa/q2_campaign_smoke.js` para Abismo con 3 clases (hoy solo con una).

**3. Desbalance de campeones: el Guerrero pierde y el Mago casi no pierde.**
- Evidencia: Normal, 10 arenas: guerrero 6/10 (derrotas en Fortaleza nivel 10, Micelial nivel 10 con vida 0%, Laberinto nivel 9) frente a mago 10/10 y soporte 10/10; Pesadilla guerrero 1/10 vs mago 6/10. Control Bosque: guerrero pierde al 34% de vida mínima (`cu_sith`), mientras mago/aurelia/axiom/tibor ganan con 92-100% de vida mínima y 340-650 de daño total. Mediana de daño recibido: mago 833, asesino 2513, soporte 2361, tanque 5064. Además, el perfil B no muestra efecto de la habilidad del piloto (aprendiz 6/8, ocasional 7/8, competente 6/7), lo que sugiere que la habilidad pesa poco frente al campeón/nivel.
- Acción: ejecutar `node tools/balance/clear-potential.js` y `entry-gate.js` sobre guerrero, soporte y magos de punta; revisar la supervivencia del `guerrero` (documentado en `docs/` como «fuera de los recomendados» tras la commit `20647055`); comprobar con humanos antes de tocar números (el piloto no representa el uso humano).

**4. La primera sesión no tiene una prueba verde, y la pantalla de skin pisa las cartas.**
- Evidencia: `q1_first_session.js` termina con 21 PASS / 25 FAIL. Se queda en el paso «Tu skin de regalo» (`#starter-skin-yes-btn` no existe hasta elegir carta; la pantalla muestra «Seguir sin skin ›»), por lo que nada de menú, Tienda, JUGAR ni derrotas se verifica. Fallo real medido: `SKIN.la_barra_no_tapa_las_cartas` con la barra en y=306 px y las cartas hasta y=314 px (8 px de solape, 844x390 táctil); la descripción de las tres cartas queda cortada. La economía (`q4_econ.js`) tampoco corre en este entorno («Target crashed»).
- Acción: actualizar `tools/alfa/q1_first_session.js` al flujo actual (tocar una carta o «Seguir sin skin»), marcar el requisito `/health` bloqueado por CORS como ruido, sumar 8 px de relleno inferior a `.starter-skin-grid` (o subir la barra) en `js/ui/starter-select.js`/CSS, y hacer que `q4_econ` falle con mensaje claro; ponerlas en CI para que la primera sesión no pueda romperse sin aviso.

**5. Rendimiento con hordas grandes: la Arena Infernal baja a 24 FPS en software y tiene 43% de cuadros lentos.**
- Evidencia: Infernal es la peor arena en `perf_arenas`: pico de 77 enemigos (resto 32-49), 24.0 FPS reales, 43% de cuadros >33 ms, p95 de cuadro 100 ms, máx 166.7 ms; Fortaleza (37 enemigos) 36.7 FPS, Bosque y Abismo 21% de cuadros lentos. `render()` medio 4.1 ms en Infernal y 5.3 ms en Fortaleza (la más cara), `update()` es barato (0.5-1.3 ms medios, con picos de 16 ms en Micelial). Línea base `tools/beta/perf.js`: render medio 4.5-4.6 ms, 8-10% de cuadros >33 ms.
- Matiz: SwiftShader, no un teléfono real; sirve para ordenar arenas, no para dar FPS absolutos.
- Acción: medir Infernal y Fortaleza en dispositivo gama baja real; revisar el costo de `render()` por entidad en esas dos arenas (`js/arenas/fortaleza`, `infernal`) y poner un tope/LOD a efectos con >50 enemigos; incluir un presupuesto de ms/cuadro por arena en `tools/perf`.

## 8. Comandos corridos

```
python3 -m http.server 8850 --bind 127.0.0.1          # servidor (detenido al final)
node tools/playtest/campaign.js <jobs.json> <out.jsonl> 8850   # 3 tandas A+B (110 partidas) y 3 tandas C (46)
GAME_URL=http://127.0.0.1:8850/index.html node tools/alfa/q1_first_session.js            # 21 PASS / 25 FAIL
GAME_URL=... QUICK=1 CLASSES=guerrero,mago,nigromante,ilkan,profeta MODE=real node tools/alfa/q2_campaign_smoke.js   # 9/10, abismo FALLA
SE_BASE_URL=http://127.0.0.1:8850 node tools/alfa/q7_controls.js                         # 81 PASS / 0 FAIL
node tools/bots/victory-sim.js cw 2 420 --json ; node tools/bots/victory-sim.js col 2 600 --json
node tools/beta/perf.js --main /home/user/La-Horda --runs 1 --out <tmp>
node tools/balance/q4_econ.js . 400   y   . 100       # "Target crashed" (sin resultados)
node perf_arenas.js (temporal) ciudad,...,infernal 240 guerrero
```
