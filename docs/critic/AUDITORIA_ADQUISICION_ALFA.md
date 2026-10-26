# La Horda: auditoría de adquisición y alfa simulada

Fecha: 26/10/2026. Base medida: `origin/main` `78039728` (incluye economía V2 #225, Libro de tinta china #226 y los 20 PRs de arte #219). Parte de las corridas de campaña y de la tienda se midieron sobre `7e4e653e` (el main de un día antes); se marca en cada caso. Análisis y redacción: no se tocó código del juego.

**Etiquetas.** HECHO = leído en el repo. MEDIDO = lo corrí yo (comando en el apéndice). ESTIMACIÓN = cálculo mío con supuestos a la vista. SUPUESTO = no hay dato. **No hay ningún jugador humano real en esta auditoría**: los "perfiles" son guiones y un piloto automático. Lo de legal es lectura de producto, no asesoramiento jurídico.

---

## Resumen ejecutivo

1. **Veredicto del comité: COMPRAR CON CONDICIONES** (el comité compraría la propiedad intelectual y el motor; no pagaría por un negocio, porque hoy no hay negocio que cobrar).
2. **Puntaje global ponderado: 6,2 / 10** como producto. Promedio de los cinco miembros del comité, ajustado por riesgo de compra: **4,7 / 10**.
3. **Estado honesto: alfa jugable, ancha y todavía sin cerrar.** Tiene la amplitud de contenido de una beta (43 campeones, 10 arenas × 3 dificultades, 5 modos) pero el eje de negocio (cobro, servidor persistente, legal, datos de jugadores) está en prototipo. No es vertical slice: no hay una porción única pulida de punta a punta con audio real.
4. **Lo mejor, MEDIDO:** de "Tocá para continuar" a estar en la arena hay 6 toques y unos 12 s de reloj; 0 errores de página en todas las corridas; 21 partidas completas del piloto sin una sola excepción; 60 fps de CPU con la horda grande (software, sin GPU).
5. **Lo nuevo que suma:** el Libro de tinta china tapa la espera de carga con identidad propia (se lee desde los 2,9 s), y la economía V2 (inventario en servidor, Forja, subastas) está integrada y verde en sus 162 pruebas de servidor, pero **dormida**: solo se enciende con base persistente, que hoy no hay.
6. **El bloqueo número uno no es de juego:** el servidor público declara almacenamiento no persistente y la base gratuita vence el 28/10/2026 (HECHO, `docs/commercial/INDEPENDENT_HOSTING.md`). Pagos, V2, cuentas y ranking dependen de eso.
7. **Conflicto de política sin resolver (HECHO):** `PIECES_FOR_BRASAS = true`; la tienda dice en pantalla «Las Brasas compran apariencia y piezas de set (equipo)». Eso es dinero por poder. Un comprador lo trata como riesgo de reputación y de tiendas.
8. **Balance de entrada, MEDIDO (21 corridas, sin equipo):** 11 victorias, 8 derrotas, 2 partidas que no terminan en 22 min. Arena 1: 7/9; Fortaleza: 3/6; Infernal: 1/6. El primer jefe (Presentador) mató 2 veces a magos al borde de la victoria.
9. **Sin audio real:** cero archivos mp3/ogg/wav en el repo; todo sintetizado (HECHO). El Libro y el arte suben la identidad; el sonido la baja.
10. **Calidad de pruebas:** 117 pruebas en la batería rápida sobre este main: 115 verdes y 2 rojas conocidas (`t_evolution`, `t_save_sanitize`), 2.318 comprobaciones en verde.
11. **Cinco puntos a mejorar, por impacto/esfuerzo:** (1) decidir y cerrar "Brasas = solo cosmético"; (2) infraestructura persistente + soporte + legal + Mercado Pago sandbox; (3) embudo de datos y alfa cerrada con humanos; (4) los primeros 10 minutos y la pared de jefes; (5) audio real y cierre de arte.
12. **Lo que no se pudo medir:** retención, conversión, FPS en teléfono, red mala real, partidas con humanos. Todo eso es el contenido de los puntos 2 y 3.

---

## 1. El comité comprador

Cinco miembros de un comité de due diligence de un publisher mediano. Cada uno puntúa lo que mira y lista sus "dealbreakers" (lo que frena la firma hasta que se resuelva).

| Miembro | Tesis | Puntaje | Dealbreakers |
|---|---|---|---|
| **Dirección de desarrollo** (calidad técnica, escala) | Un motor JS propio de ~94.000 líneas en 452 archivos, con una batería de 117 pruebas y gates automáticos poco comunes para una alfa. Se puede heredar y mantener. Lo que preocupa es la arquitectura multijugador: **el anfitrión simula la partida**, el servidor no es autoritativo (HECHO, `ITEM_ECONOMY_V2_INTEGRACION.md` §6.1), y todos los scripts son globales (`index.html` carga ~450). | **6,5** | (a) Resultados competitivos sin servidor autoritativo: no se puede abrir ranking con premios. (b) Carga sin empaquetar: 451 JS y 812 pedidos en frío; el empaquetado existe (`tools/perf/bundle.js`) pero no se midió en producción. |
| **Producto y monetización** | Modelo cosmético sano por diseño (servidor decide precios, sin cajas, sin oro por dinero real). Pero **hoy no se puede cobrar**, hay una excepción de poder por dinero (piezas de set por Brasas) y no hay embudo medible. | **4,0** | (a) `PIECES_FOR_BRASAS = true`. (b) Pagos apagados y sin prueba contra Mercado Pago real. (c) Cero telemetría de tienda y de retención. |
| **Dirección creativa** (arte, identidad) | Identidad fuerte y reconocible: pixel art cuidado, título, hub, el Libro de tinta china con tono propio. Pero el arte es de resolución mezclada, hay 1.217 registros de producción abiertos y varios candidatos del último lote de 20 PRs quedaron NO_INTEGRAR. El sonido es sintético. | **7,0** | (a) Audio. (b) Cerrar la línea de arte con un criterio de "congelado". |
| **Live-ops** | El juego tiene lo que una operación necesita en piezas (panel de Game Master, eventos, rotación diaria de tienda, temporadas en V2) pero **ninguna se probó con jugadores ni con base persistente**. | **3,0** | (a) Sin base persistente no hay cuentas, ni ranking, ni V2. (b) Sin respaldo probado (el preflight lo marca amarillo). (c) Chat libre sin lista de palabras ni reporte. |
| **Legal y cumplimiento** | Las bases están bien pensadas (confirmación de precio, sin cargos de un toque, reversión por reembolso y contracargo probada contra un Mercado Pago falso). Pero los textos son **borrador**, el correo de soporte está vacío (se ve en la portada, captura 08), no hay botón de borrar cuenta, edad mínima provisoria, y V2 introduce subastas entre jugadores. | **3,0** | (a) Textos legales sin abogado. (b) Soporte sin correo. (c) Subastas = mercado entre jugadores: hay que decidir si se habilita, con qué comisión y qué advertencia. (d) Derechos del arte y de la música sin revisar (`LAUNCH.md`). |

**Promedio del comité: 4,7 / 10.** El puntaje de producto (sección 3) es más alto porque pondera el juego; el comité pondera lo que falta para poder cobrar.

---

## 2. Alfa simulada: un hallazgo por perfil

Resumen de método: servidor estático propio en puerto libre, Chromium de Playwright, perfil limpio. Capturas en `docs/critic/auditoria-adquisicion-evidencia/` (844x390 táctil). Lo medido con el piloto automático son **guiones, no personas**: el propio repo documenta que sus perfiles solo difieren en cuándo esquivan un aviso (`docs/quality/PLAYTEST_PROFILES.md`).

### (a) Novato móvil casual, 5 minutos (MEDIDO, main `78039728`, 844x390 táctil)

Secuencia nueva medida con un perfil vacío y las banderas de primer arranque:

| Paso | Reloj desde que se pide la página | Toque |
|---|---|---|
| Aparece el Libro sobre la portada ("Cargando el juego… 4 %") | 2,9 s | |
| Salteo el Libro | 3,9 s | 1 |
| "Tocá para continuar" habilitado | ~9 s | |
| Continuar → regalo de guardián | 9,6 s | 2 |
| Elijo y confirmo guardián | 10,0 a 10,5 s | 3 y 4 |
| Regalo de skin ("después") | 11,0 s | 5 |
| Historia inicial: Empezar práctica | 11,5 s → **jugando a los 11,8 s** | 6 |
| Variante: "Saltar la práctica" → JUGAR → ficha de arena → "¡A la batalla!" | **jugando a los 13,6 s** | 8 |
| Primer enemigo vencido (ataque tocado sin moverse) | 27,5 s | |

- HECHO/MEDIDO: no aparece el Libro de arena en la primera partida (va directo a la ficha), como declara `docs/lore/LIBRO_TINTA_CHINA.md`.
- **Lo que anda bien:** el Libro convierte la espera de carga en contenido; a 4 s de abrir hay una escena de tinta y no una barra. El regalo de guardián da 4 opciones con una línea de rol cada una (captura 02). No hay Sala ni login obligatorio.
- **Lo que confunde (captura 04, 05):** (1) el panel de misión del tutorial ocupa un tercio de la pantalla y tapa un aviso del regalo de skin que llega arriba a la derecha ("Te guardamos un vale de skin…" queda cortado). (2) La ficha de arena en 844x390 corta su última fila detrás del botón "¡A LA BATALLA!" y mezcla tres tamaños de letra. (3) Sin guardián de apoyo: el tutorial arranca con el joystick y 5 botones de habilidad a la vez.
- **Caveat de carga:** en este equipo sin límites de red la portada tarda ~9 s en habilitarse porque `navigator.webdriver` desactiva la carga perezosa y se bajan ~2.000 archivos (78,9 MB por `content-length`). Con la carga perezosa activa y red simulada (`tools/perf/load-bench.js`, 20 Mbit/s, 40 ms, CPU ×4): **frío 8,3 a 10,4 s, 812 pedidos, 8,3 a 10 MB; tibio 1,3 a 2,5 s** (corrido sobre `7e4e653e` con la máquina cargada). Un teléfono con 4G real: **no medido**.

### (b) Veterano de ARPG: builds y loot (MEDIDO + HECHO)

- HECHO: 43 campeones, 6 rarezas, 6 ranuras de equipo, talentos hasta nivel 40, sets, afijos. El repo tiene pruebas de que los 281 objetos diseñados tienen íconos distintos (`ESTADO_DE_PRUEBAS.md`).
- MEDIDO: 10 niveles por arena, 10 arenas, 3 dificultades (Normal, Pesadilla, Infierno). Con la V2 integrada el cofre de victoria da de 1 a 3 objetos y el botín del piso lo decide el servidor, **pero solo con base persistente** (hoy dormida). Sin ella, "inventario lleno" cae a buzón de recompensas o reserva (hasta 150).
- Hallazgo: la **dificultad no viaja al servidor** con V2 activa: el botín online se calcula como Normal y con calificación A fija (`ITEM_ECONOMY_V2_INTEGRACION.md` §2). Para un veterano que juega Pesadilla/Infierno esto quita justo la razón de subir de dificultad. Es una deuda de V2 a resolver antes de encenderla.
- Lo que este perfil no puede confirmar acá: si hay "un build" divertido. Eso es el tipo de dato que solo da una alfa humana.

### (c) Pareja/amigos en cooperativo online (MEDIDO en servidor; humanos NO medido)

- MEDIDO: `server/` `npm test` con 192 comprobaciones PASS y 0 FAIL; más `test-item-economy` (49), `test-item-economy-live` (51), y la prueba sintética del relay con 50 conexiones, 13 salas, 20 Hz, 60 s: 100 % de entrega, p95 de ping 1,9 ms (`docs/commercial/capacity-local.json`, corrida del 17/10; solo transporte, sin render ni base).
- HECHO: salas de 4, bots con nombre, "JUGAR YA", código de invitación. La integración V2 declara sin probar "dos humanos reales en cooperativo ni PostgreSQL" (§6.5).
- Riesgo: el anfitrión simula; si el anfitrión tiene mala red, todos juegan mal. No hay migración de anfitrión medida.

### (d) Competitivo: Guerra de Cristales y Coliseo (HECHO; no hay humanos)

- HECHO: Guerra de Cristales 5 vs 5 con bots en 3 carriles; Coliseo "torneo de 8, equipos de 2" contra bots. `docs/modes/CRYSTAL_WARS.md`: «Online: todavía no».
- Hallazgo comercial: el hub ofrece los dos como mosaicos principales (captura 06). Un jugador competitivo que busca ranking y rivales humanos encuentra bots. No es un defecto de la alfa, pero **no se puede vender nada competitivo** ni prometerlo hasta que haya servidor autoritativo.
- Ranking semanal de Horda Infinita: resultados declarados por el cliente con filtros de plausibilidad (V2 STATUS). No es seguro para premios.

### (e) Coleccionista de skins y comprador potencial (MEDIDO en `7e4e653e`; el código no cambió en esta parte)

- HECHO: skins y cromas solo con Brasas; la compra con oro quedó cerrada el 20/10 (`shopBuySkinGold` devuelve `PREMIUM_NO_GOLD_SKINS`). Las escaleras: croma 300, skin de set 800, diseño propio 1.200 Brasas (captura 07).
- MEDIDO: un invitado ve las skins y precios, pero el cartel pide "Iniciá sesión para comprar Brasas". Los packs de dinero real responden "Muy pronto" (pagos apagados).
- Problema (captura 07): el cartel de la tienda dice que las Brasas compran "piezas de set (equipo)". Un coleccionista que compra por estética se cruza con un mensaje de que se puede comprar poder.
- V2 suma manifestaciones cosméticas de sets Míticos: la base es solo de juego (`earnedOnly`); variantes Astral y Consagrada con precio. Idea correcta (mérito + variante pagada).
- Rotación diaria y colecciones existen, pero `SHOP_MODE = "demo"`: en ese modo la rotación y los precios por pieza no son los de producción.

### (f) Streamer / creador de clips (HECHO + capturas)

- Positivo: título y hub con identidad propia; el Libro (captura 01) es "contenido" en sí; 25 campeones con proyectil propio y 8 arenas con objetivo propio (gate de identidad); jefes con fases.
- Negativo: audio sintetizado; no hay modo espectador, replay, ni compartir clip. Un creador no tiene "momento capturable" prefabricado más allá de los jefes.
- No medido: legibilidad en 1080p con 60 enemigos y 4 jugadores (la escena de mayor ruido visual).

### (g) Tester de QA técnico (MEDIDO)

- **Estabilidad:** 0 `pageerror` en todas las corridas (8 corridas del primer minuto, hub, 21 partidas completas). El único error de consola fue una petición abortada a `fondalstudios.com` que yo mismo bloqueé en la prueba (artefacto de la prueba, no del juego).
- **FPS:** 58,7 a 60,7 fps de `requestAnimationFrame` en reposo en 844x390 y 47 en 1280x720, por **software** sin GPU, y 41 fps en la arena con mi script. No es un teléfono. La tarjeta del repo (`SCORECARD.md`, Rendimiento 57/100) ya dice: costo de código 10,8 a 12,2 ms por cuadro con CPU ×4 y 19 % de cuadros lentos en Micelial.
- **Memoria JS:** 29 a 31 MB tras 20 s de juego (una arena; no hay curva de fuga medida).
- **Guardado y red mala:** hay pruebas de recuperación de recompensas con reinicio del relay (`reward-recovery`), buzón de recompensas y cola `reward.claim`; no las repetí con una red degradada real. **No medido en dispositivo.**
- **Servidor:** persistencia `store:file, persistent:false` en el servidor público declarado (`LAUNCH.md`, docs de hosting). La base gratuita vence el 28/10.

### Partidas completas con el piloto automático (MEDIDO sobre `7e4e653e`, `tools/playtest/campaign.js`)

Guiones aprendiz / ocasional / habitual (habilidad 0,45 / 0,7 / 0,9; reacción 650 / 400 / 220 ms), Mago y Tanque, **sin equipo**, arenas Ciudad (1), Fortaleza (2) e Infernal (10). 21 corridas, una por casilla (+ un Mago extra en Ciudad por perfil).

| Arena | Victorias | Derrotas | No terminó (22 min) | Mediana de duración (victorias) |
|---|---|---|---|---|
| Ciudad Maldita | 7 de 9 | 2 | 0 | 510 s (8,5 min) |
| Fortaleza | 3 de 6 | 2 | 1 | 741 s |
| Infernal | 1 de 6 | 4 | 1 | 409 s (una sola) |
| **Total** | **11 de 21 (52 %)** | 8 | 2 | **532 s (8,9 min)** |

- Por guion: aprendiz 3/7, ocasional 4/7, habitual 4/7. **Tamaño de muestra n=7 por guion: no sirve para comparar perfiles** (el repo ya documenta ±15 puntos con 3 semillas). Lo que sí se ve: el guion "habitual" **no** supera al "ocasional".
- Muertes: Ciudad = el jefe Presentador (dos veces, con 6 % y 36 % de su vida restante); Fortaleza = autómata/verdugo en el nivel 8 o 9; Infernal = proyectil del demonio mago en 3 de 4 (golpes de 49 a 70 con 21 a 27 de vida) y demonio menor.
- **Dos partidas no terminan** (Tanque en Fortaleza con el jefe al 34 %, Tanque en Infernal con el jefe al 100 % tras 22 min): el Tanque del piloto no tiene daño suficiente para matar al jefe. Un jugador real puede equiparse; igual es una señal de balance de rol.
- Duración mediana 8,9 min por arena: dentro del rango objetivo del repo (6 a 13 min).
- 0 errores en las 21 corridas. Oro por partida: 600 a 4.019 (mediana ~1.400).
- Honestidad: sin equipo ni talentos reales, una "derrota" acá no es una derrota de un jugador con equipo. Sirve para ver paredes, no para fijar dificultad.

---

## 3. Puntajes

| Categoría | Peso | Nota | Evidencia |
|---|---|---|---|
| Core loop y combate | 20 % | **7,0** | 21 partidas completas sin errores; 8,9 min por arena; jefes con fases (gate de jefes 28 fichas); 60 fps de CPU. Resta: Tanque que no mata al jefe, Infernal 1/6, Presentador como pared. |
| Progresión, loot, builds | 15 % | **6,5** | 43 campeones, 6 rarezas, talentos nv. 40, sets; V2 integrada (Forja, subastas, reliquias, temporada) con 162 comprobaciones de servidor verdes. Resta: V2 dormida sin base persistente, dificultad no viaja al servidor, el oro del modo sin cuenta sigue en el cliente, el anfitrión simula. |
| Contenido y variedad | 10 % | **8,0** | 43 campeones, 10 arenas × 3 dificultades × 10 niveles, 5 modos, códice y Libro. Es el punto más fuerte del producto. |
| Arte, audio, identidad | 15 % | **6,5** | Pixel art con firma propia (capturas 01 a 06); el Libro suma tono. Resta: 0 archivos de audio, 1.217 registros de producción abiertos, resolución de arte mezclada, candidatos NO_INTEGRAR en el último lote. |
| Onboarding y primer minuto | 10 % | **7,0** | 6 toques a jugar, ~12 s; el Libro cubre la carga; regalo de guardián claro. Resta: panel de misión que tapa un tercio de pantalla, ficha que corta su última fila en 844x390, primera arena con jefe-pared. |
| Social y multijugador | 10 % | **5,0** | Relay probado (192 comprobaciones, 50 conexiones, 100 % de entrega); salas, bots. Resta: sin humanos medidos, anfitrión-simula, Cristales y Coliseo solo contra bots, chat libre sin lista de palabras. |
| Economía y monetización | 10 % | **4,0** | Diseño correcto: servidor decide, sin cajas, reversión por reembolso y contracargo (27 comprobaciones contra Mercado Pago falso). Resta: pagos apagados, `PIECES_FOR_BRASAS = true`, `SHOP_MODE = "demo"`, sin telemetría de embudo. |
| Calidad técnica y performance | 5 % | **6,5** | Batería de 117 pruebas (115 verdes) y gates; 0 errores de página. Resta: carga sin empaquetar 451 JS, FPS no medido en dispositivo, 19 % de cuadros lentos en Micelial. |
| Operación, legal, escalabilidad | 5 % | **3,0** | Preflight: **0 rojos, 27 amarillos, 31 verdes** (con `ws` instalado). Resta: sin base persistente, textos en borrador, correo de soporte vacío, sin borrar cuenta, respaldo sin probar. |
| **Global ponderado** | 100 % | **6,2 / 10** | 0,20·7,0 + 0,15·6,5 + 0,10·8,0 + 0,15·6,5 + 0,10·7,0 + 0,10·5,0 + 0,10·4,0 + 0,05·6,5 + 0,05·3,0 = **6,225** |

**Lo que cambió con V2 y el Libro, en el puntaje.** V2: progresión +0,5 (más profundidad y servidor que decide botín), economía +0,5 (mercado y ledger auditable), pero ambos se **cobran a cuenta** hasta que corra con Postgres. Libro: onboarding +0,5 y identidad +0,5; no cambia la nota de audio. Sin V2 ni Libro el global sería ~5,9.

**Contraste con la tarjeta interna.** `docs/quality/SCORECARD.md` da 92/100 (4/10/2026). No son comparables: esa tarjeta mide si las pruebas del propio repo pasan y su propio documento lista como "juicio humano pendiente" el FPS en teléfono, el sonido y la belleza del arte. Un comprador puntúa justo eso y el negocio.

---

## 4. Veredicto del comité

**COMPRAR CON CONDICIONES.** Alternativa explícita si no se acepta ninguna condición: **pasar**.

**Qué pagaría.** (1) El motor y el pipeline de calidad: pocas alfas llegan con gates de arte, de identidad, de habilidades y de entrada de campeones automatizados. (2) Contenido: 43 campeones, 10 arenas × 3 dificultades, jefes con fases. (3) Identidad visual y narrativa propia (título, hub, Libro). (4) Un diseño de monetización coherente: servidor decide, sin cajas, reversión de pagos probada. (5) Costo de salida bajo: sin dependencias externas pesadas.

**Qué descontaría.** (1) Cero evidencia de demanda: no hay un solo dato de jugadores reales (`AUDITORIA_2_CRECIMIENTO.md` §0 lo dice; sigue siendo cierto). (2) La excepción de poder por dinero. (3) Servidor y legal no listos para cobrar. (4) Sin audio real. (5) Dependencia de pocas personas: el flujo de arte y balance es denso y artesanal.

**Condiciones (si se firma):** cerrar los puntos 1 y 2 de la sección 5 antes del cierre; y una alfa cerrada con humanos (punto 3) con retención D1 y D7 medidas, antes de cualquier pago diferido.

**Estado del proyecto: alfa jugable.** Ni prototipo (el bucle es completo y estable) ni vertical slice (no hay una porción final con audio y arte cerrado) ni beta (no hay cuentas persistentes, cobro ni datos).

---

## 5. Los cinco puntos a mejorar (por impacto / esfuerzo)

Contraste con el informe de críticos del 20/10 (`origin/claude/critica-monetizacion`: `MONETIZACION_MANTENER_Y_SACAR.md`). **Lo que cambió desde entonces, HECHO:**
- Cerrado: la compra de skins con oro (commit `50707ed2`, 20/10). Cerrada la reversión por reembolso y contracargo con ensayo local (`c23abfe4`, 20/10).
- Empeoró en política: el 21/10 entraron las piezas de set por Brasas (`179e7c44`): el informe decía "NO VENDER poder".
- Nuevo: V2 integrada (inventario en servidor, subastas), Libro único, 20 PRs de arte.
- **Sigue igual:** pagos apagados, servidor no persistente, correo de soporte vacío, textos en borrador, `SHOP_MODE = "demo"`, `POSTGAME_GATE = "open"`, lista de palabras del chat vacía, sin telemetría de embudo.

### 1. Cerrar "Brasas = solo cosmético" (esfuerzo XS, impacto alto)

- **Problema (HECHO):** `js/data/pricing.js:46` `PIECES_FOR_BRASAS = true`; `js/systems/premium.js:34` y la captura 07 muestran el cartel «Las Brasas compran apariencia y piezas de set (equipo)». V2 reclasificó los 5 conjuntos universales como Míticos; ya no se listan en tienda, pero el resto de las piezas sigue vendiéndose. La rama original de V2 lo apagaba; la integración lo dejó pendiente "decisión del dueño" (`ITEM_ECONOMY_V2_INTEGRACION.md` §4).
- **Por qué bloquea la monetización:** poder por dinero es el motivo más común de rechazo en tiendas y de mala reputación en F2P; además contradice `PRECIOS.md` y el pitch.
- **Qué hacer:** decidir; si es cosmético, `PIECES_FOR_BRASAS = false`, retirar la frase del cartel, mantener el derecho adquirido de compras previas, y actualizar `test-wallet-pieces.js`. Decidir también si las subastas V2 se habilitan y con qué aviso.
- **Claude:** el cambio, las pruebas y el texto. **Humano:** la decisión y el criterio sobre compras ya hechas.
- **Se mide (HECHO al terminar):** ninguna ruta compra estadísticas con Brasas (prueba); el cartel ya no lo dice; `server/test-wallet-pieces.js` verde.

### 2. Poder cobrar: infraestructura persistente, soporte, legal y Mercado Pago sandbox (esfuerzo M, impacto máximo, mayormente humano)

- **Problema (HECHO):** `store:file, persistent:false`; base gratuita vence **28/10/2026**; `legal-config.js`: `draft: true`, `supportEmail: ""` (captura 08); preflight 0 rojos pero 27 amarillos; el ensayo con Mercado Pago **falso** pasa 27 comprobaciones, no se probó con una cuenta real.
- **Por qué bloquea:** sin base persistente no hay cuentas ni V2 ni ranking ni cobro (el servidor se niega a cobrar).
- **Qué hacer:** `CHECKLIST_ULTIMA_PRUEBA.md` bloques 1 a 5: Postgres persistente con respaldo y restauración probada; correo de soporte real; abogado revisa `docs/legal/*.md`; edad mínima; botón o procedimiento de borrar cuenta; cuenta vendedora de Mercado Pago, usuarios de prueba, una compra sandbox de punta a punta y luego una real de monto mínimo.
- **Claude:** preparar el entorno, correr preflight, regenerar legales, escribir el procedimiento de borrado, ensayar la migración y el respaldo. **Humano:** cuentas, credenciales, abogado, decisiones fiscales.
- **Se mide:** `preflight --launch` sin rojos; `/api/health` con `persistent:true`; una compra sandbox acreditada una sola vez; una restauración documentada; V2 encendida (`/api/economy*` deja de dar 503).

### 3. Embudo de datos y alfa cerrada con humanos (esfuerzo M, impacto alto)

- **Problema (HECHO):** `fondal-telemetry.js` solo envía presencia y señales de inicio/fin de partida; no hay evento de tienda abierta, intento de compra ni paso del tutorial. **Cero** datos de jugadores en el repo.
- **Por qué bloquea:** sin esto no se puede ni ajustar precios ni demostrar a un comprador que alguien vuelve. Todo lo de este documento sobre demanda es SUPUESTO.
- **Qué hacer:** eventos mínimos con consentimiento (paso del tutorial, primera arena ganada o perdida, tienda abierta, intento de compra, D1/D7); invitar a 20 a 50 personas a una alfa cerrada en el servidor persistente; registrar cuántos terminan la primera arena y cuántos vuelven.
- **Claude:** instrumentar, panel, guion de la alfa, análisis. **Humano:** reclutar jugadores, observar sesiones.
- **Se mide (objetivos SUPUESTO, a calibrar con la primera alfa):** ≥70 % termina la primera arena; D1 y D7 medidos; porcentaje que abre la tienda.

### 4. Pulir los primeros 10 minutos y las paredes (esfuerzo S a M, impacto alto)

- **Problema (MEDIDO):** Presentador mató 2 de 9 corridas en Ciudad con el jefe casi muerto; Infernal 1/6; Tanque no mata jefes en 2 de 6 corridas; panel de misión que tapa 1/3 de la pantalla y un aviso (captura 04); ficha cortada en 844x390 (captura 05).
- **Por qué bloquea:** la primera arena decide D1; sin D1 no hay a quién cobrarle.
- **Qué hacer:** reducir el panel de misión a 1 línea sobre el HUD en móvil; ajustar el layout de la ficha para pantallas cortas; revisar el daño del Tanque contra jefes; medir de nuevo con el piloto y con 10 personas reales.
- **Claude:** ajustes, capturas, medición con el piloto. **Humano:** jugar y juzgar la dificultad.
- **Se mide:** primera arena aprendiz con 70 a 85 % de victorias (objetivo del propio repo: 50 a 80 %), 0 partidas sin terminar por rol, captura 844x390 sin corte.

### 5. Audio real y cierre de arte (esfuerzo L, impacto medio-alto, humano)

- **Problema (HECHO):** 0 archivos de audio (todo sintetizado); `docs/production/ASSET_BLOCKS.md`: 1.217 registros abiertos; el lote de 20 PRs integró candidatos y dejó otros NO_INTEGRAR (`docs/quality/gameplay-20261023/PROGRESS.md`, `CORRECTION_BATCH.json`).
- **Por qué bloquea:** lo que se vende se ve y se escucha; el audio sintético baja el valor percibido de una skin "premium".
- **Qué hacer:** encargar música y efectos reales (mínimo menú, arena 1, jefe, victoria); definir un "congelado de arte" para el lanzamiento con el Art Gate como criterio; descartar o rehacer los NO_INTEGRAR.
- **Claude:** auditar, integrar lo que pase gates, mezcla y niveles. **Humano:** compositor/sonidista, aprobación de arte.
- **Se mide:** audio real en menú, arena 1, jefe y victoria; cantidad de NO_INTEGRAR = 0 o documentados; los gates de arte en verde.

---

## 6. Límites del análisis (qué NO se pudo medir)

- Humanos reales: retención, conversión, diversión. Ningún dato de jugadores.
- FPS y memoria en teléfonos reales; red móvil real; red mala real.
- Cooperativo con humanos en dos redes; migración de anfitrión.
- Mercado Pago con cuenta real (solo el ensayo con el falso); PostgreSQL con V2 encendida.
- Audio: no se escuchó nada (no hay archivos); arte: revisión visual de capturas, no revisión de arte completa.
- Corrida de campaña sobre `7e4e653e` (un día antes de V2 y el Libro). V2 cambia el botín solo con servidor persistente, así que para un invitado local no debería cambiar; SUPUESTO, no se repitió.
- Máquina cargada en parte de las mediciones de tiempo (carga fría de 8 a 10 s con otra batería en paralelo).
- Los guiones del piloto no son personas; n=7 por guion.
- Estimaciones de ingresos: **no se hacen**. El informe de críticos del 20/10 dio rangos con supuestos; sin datos no los repito.

## 7. Estado de pruebas (batería `run-all --fast --jobs 2`)

MEDIDO sobre `78039728`, una sola corrida: **117 pruebas, 115 PASS, 2 FAIL, 0 intermitentes; 2.318 comprobaciones individuales en verde; 5.698 s de suma de pruebas** (con 2 en paralelo). Las dos rojas son las conocidas:

- `tools/items/t_evolution.js` (`EVO.todos_los_campeones_dejan_su_firma`): rojo ya en el main de ayer.
- `tools/regression/t_save_sanitize.js`: 3 guardados de ejemplo (`save_2026-10-10`, `-10-17`, `-10-19`) en los que "el normalizador no ajusta nada (guardado legítimo)"; rojo ya en el main de ayer.

`t_champs_se` pasó esta vez (en la corrida del main de ayer falló: es intermitente, como avisó el equipo). Antes (main `7e4e653e`): 116 pruebas, 109 PASS, 4 intermitentes, 3 FAIL, 2.115 comprobaciones.
Además, fuera de la batería: `server` `npm test` 192 PASS / 0 FAIL, `test-item-economy` 49, `test-item-economy-live` 51, preflight `--offline` 0 rojos / 27 amarillos / 31 verdes, `mp-readiness` 27 comprobaciones.
**Qué no dice esta batería:** no corre relay con humanos, pagos reales, dispositivos ni revisión de arte o audio (lo advierte `tools/quality/run-all.js`).

## Apéndice: comandos reproducibles

```bash
git fetch origin && git checkout -B claude/auditoria-adquisicion origin/main
python3 -m http.server 18432            # desde la raíz; verificar /proc/<pid>/cwd; matar por PID

# primer minuto (script propio, con banderas de primer arranque; ver abajo)
PORT=18432 node docs/critic/auditoria-adquisicion-evidencia/ftue2.js 844 390 n844 tutorial     # Libro -> guardián -> regalo -> práctica
node docs/critic/auditoria-adquisicion-evidencia/ftue2.js 844 390 s844 skip         # ... -> saltar práctica -> JUGAR -> ficha -> juego

PERF_URL=http://127.0.0.1:18432/index.html node tools/perf/load-bench.js 2
node tools/playtest/campaign.js docs/critic/auditoria-adquisicion-evidencia/campaign-jobs.json out.jsonl 18432   # 21 corridas, perfiles por habilidad/reacción
node tools/release/preflight.js --offline --no-color        # (necesita `npm ci` en server/ para el ensayo)
node tools/release/mp-readiness.js                          # ensayo con Mercado Pago falso: 27 comprobaciones
(cd server && npm ci && npm test)                           # 192 PASS
(cd server && node test-item-economy.js && node test-item-economy-live.js)   # 49 + 51
node tools/quality/run-all.js --fast --jobs 2
```

Banderas del primer arranque en pruebas (porque `navigator.webdriver` las desactiva a propósito): `window.__codexBook = true`, `window.__starterGift = true`, `window.__firstRun = true`, inyectadas antes de cargar.

Capturas: `docs/critic/auditoria-adquisicion-evidencia/` (01 a 05 sobre `78039728`; 06 a 08 sobre `7e4e653e`, el código involucrado no cambió: `PIECES_FOR_BRASAS` y `supportEmail` siguen igual en `78039728`).
