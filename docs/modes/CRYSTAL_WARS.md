# Guerra de Cristales — CW-3, ritmo y visión simultánea

Estado: prototipo Alpha para entrenamiento y salas privadas. No es una temporada clasificatoria ni un lanzamiento comercial. Implementado a partir de main d1ae0d6.

## Cómo entrar

La Horda → Multijugador / Modos → Guerra de Cristales. Es una pantalla más de `index.html` (state `crystalwars`). Enlace directo: `index.html?cw=1&room=ABC123[&server=…]`; el viejo `crystal-wars.html` solo redirige ahí para no romper invitaciones.

1. Elegir nombre y campeón.
2. Entrenar con bots o crear una sala privada.
3. Compartir su enlace/código. Cada invitado elige su propio campeón y marca LISTO.
4. J1 y J2 forman Zafiro; J3 y J4 forman Ámbar. Con dos personas, ambas cooperan contra dos bots. Los espacios libres se completan con bots identificados.
5. El anfitrión inicia cuando los invitados están listos.

PC: WASD/flechas; habilidades 1–4. Táctil: joystick y cuatro botones. Básico automático. Ambos campos están visibles simultáneamente. Ampliar el rival mantiene movimiento, habilidades y compras en el propio campo.

## Reglas implementadas

- Dos arenas separadas de 880 × 620, cristales de 1.200 HP.
- Siete minutos máximos; Eclipse a los cinco minutos; victoria por cristal destruido o mayor vida al finalizar. Empate explícito si coinciden.
- Oleadas simétricas cada 24 segundos; coloso cada tres oleadas. Límite de 75 enemigos por arena.
- Primera oleada a los 0,75 segundos; siete segundos de suministros al inicio de cada oleada.
- 30 fragmentos iniciales, 10 por oleada, 1 por baja normal y 5 por coloso. Bolsa compartida por equipo, máximo 200.
- Reparación: 35 fragmentos, +180 HP, enfriamiento compartido de 15 segundos.
- Mejora: 38 fragmentos, +12% daño de equipo, máximo tres mejoras.
- Cinco acechadores: 16 fragmentos. Coloso: 42. Envío limitado por equipo, 10 segundos entre envíos, aviso de tres segundos al rival.
- Caer resta 65 HP al propio cristal; regreso tras ocho segundos con protección temporal.
- Cuatro roles: tanque, asesino, mago y sanadora; cada uno tiene un kit propio del Coliseo con daño de área. Sus habilidades adaptadas están definidas en `simulation.js`; NO se afirma que sean las implementaciones completas de campaña.
- Sin nivel de cuenta, inventario, reservas de dúo ni bonificaciones permanentes. Sin premios, castigos, logros ni escrituras al guardado de campaña. Solo se persiste un identificador de reconexión en sessionStorage.

## Integración y decisiones

`index.html` contiene la pantalla `#crystalwars-screen` y la tarjeta; `js/ui/menus.js` (`cwGo`) la abre conservando una eventual URL de servidor de prueba, y `js/modes/crystal-wars/client.js` no carga nada hasta la primera apertura (`CrystalWarsUI.open/close`). La simulación vive en `js/modes/crystal-wars/` y la presentación en `crystal-wars.html` y `css/crystal-wars.css`.

Se reutilizan `NET_CONFIG.serverUrl`, el protocolo 1 de `server/relay.js`, los atlas de los cuatro campeones, la animación del esqueleto y la del gólem. El build `CW-3` separa sus salas de las de campaña; no requiere cambiar el servidor actual. Las salas son privadas. No se creó infraestructura adicional.

La simulación es controlada por el anfitrión, igual que el cooperativo existente. Los invitados envían intenciones de movimiento y acciones; nunca posiciones, daño, fragmentos ni resultados autoritativos. Se validan movimiento, índices, recursos, ventanas y cooldowns. Los snapshots viajan a 10 Hz, las entradas aproximadamente a 16 Hz y la simulación a 30 Hz. El resultado final se envía inmediatamente, incluso entre intervalos de snapshot.

El anfitrión aún es una fuente de confianza: este modelo NO es apropiado para premios monetarios, clasificaciones públicas verificadas ni anti-cheat competitivo. Eso exige simulación/validación en servidor. No hay migración de anfitrión. Su desconexión interrumpe la partida sin adjudicar victoria; el invitado desconectado se reemplaza por un bot y puede recuperar el mismo lugar. Al volver a la sala se conserva el código para la revancha.

## Validación reproducible (resultados históricos CW-1; actualización CW-3 al final)

```sh
node tools/crystal-wars/test-simulation.js
npm ci --prefix server
# Requiere Playwright + Chromium instalados:
node tools/crystal-wars/browser-test.js
# CHROMIUM_PATH puede indicar un ejecutable alternativo.
```

- Diez pruebas de simulación: semillas reproducibles, oleadas equivalentes, normalización, economía y cooldowns, aviso de amenazas, separación de daño/curación, acciones inválidas, movimiento, resultados y ocho partidas completas.
- Ocho partidas de bots con semillas 1–8 terminaron en 475–600 segundos; máximo observado de 46 enemigos simultáneos. Esto prueba finalización y límites, no demuestra balance entre roles.
- Prueba real de navegador con cuatro contextos y relay local: selección, equipos, movimiento, habilidades, rechazo de estado falsificado, resultados compartidos, revancha, desconexión de anfitrión y diseño 390 × 844 sin desbordamiento horizontal.
- Revisión visual de capturas de escritorio y móvil; sin errores JavaScript en esa prueba.
- Referencias de balance de campaña sin cambios, verificadas con `tools/balance/check-entry-reference.js`.

## Límites de esta entrega y siguiente iteración

El campo es una arena funcional inicial con los assets disponibles. Los efectos y sonidos son básicos. No hay nuevas skins, tienda de dinero real, desafíos semanales ni telemetría de monetización en esta entrega. Se priorizó el modo que pidió el usuario.

Antes de ampliar a todo el roster: probar parejas de roles, igualar rendimiento de bots, ensayar latencia real desde celulares, probar Safari/iPhone físico y observar sesiones humanas completas. La prueba móvil actual es emulación de Chromium; no certifica Safari. El anfitrión debe mantener su pestaña activa: la suspensión del navegador pausa la simulación. La conexión de producción y el despliegue deben verificarse por separado de las pruebas locales.


## Integración al juego y presentación (octubre 2026)
- Tarjeta propia **CRISTALES** en el hub (antes solo se llegaba por Multijugador → modos) y entrada en
  `GAME_MODE_REGISTRY.crystalWars`. El enlace "‹ LA HORDA" vuelve **directo al hub** (`index.html?return=hub`), sin la portada.
- En celular horizontal el encabezado (con el botón de volver) ya no desaparece en el lobby: solo se oculta durante la partida.
- Arte del juego reutilizado, sin assets nuevos: piso de piedra de las Minas con viñeta, tres portales de la Horda del Abismo
  y el cristal del Ángel como cristal del equipo (recoloreado a ámbar para el rival; se agrieta por debajo del 50 %).
  Héroes más grandes (76 u) y tipografía pixel de La Horda (Press Start 2P para títulos, VT323 para el resto).
- Prueba: `node tools/crystal-wars/hub-integration.js` (844×390 y 667×375: tarjeta visible, ≥ 44 px, ida y vuelta al hub).


## Auditoría y mejoras de competitividad (CW-2, octubre 2026)

**Qué NO se pudo hacer:** el servidor de producción (`fondalstudios.com`) no es alcanzable desde el entorno de esta sesión (el proxy de salida devuelve 403 para ese dominio). La auditoría se hizo contra el MISMO `server/relay.js` ejecutado en local (4 clientes reales de navegador). Falta una prueba de punta a punta contra Fondal: publicar el build actual, redeplegar el relay y correr `node tools/crystal-wars/browser-test.js` con `?server=wss://fondalstudios.com/la-horda/red`. Para permitirlo desde esta sesión hay que agregar el dominio en *Allowed domains* del entorno.

**Hallazgos de la auditoría**
1. Balance de roles (bots, 660 partidas, línea base CW-1): Tanque 33 % y Sanadora 31 % de victorias contra Asesino 67 % y Mago 69 % — dos roles eran trampa.
2. Pocas partidas se resolvían: 14 % terminaban por tiempo; el que “más vida conservara” ganaba sin dramatismo.
3. Una sola estrategia de compra (defensiva) dominaba y enviar monstruos casi nunca valía la pena (política agresiva ~17–25 %).
4. Sin estadísticas ni cierre de partida: no se sabía quién aportó qué, ni había racha.
5. Pantalla de juego en celular horizontal (844×390): el marcador quedaba recortado y la arena ocupaba ~ una cuarta parte de la pantalla.
6. **Servidor:** el relay no limitaba mensajes por conexión: un invitado podía inundar al anfitrión (que simula la partida). Corregido.
7. Texto de reglas engañoso (“destruí el cristal rival”): nunca se ataca directamente al cristal rival; se presiona con envíos y caídas.

**Cambios (build `CW-2`)**
- Rebalance de roles (Tanque daño 44 / cadencia .55; Sanadora daño 29 / .5; Asesino 29; Mago 21).
- Nuevas decisiones de compra: **Barrera** (+150 de escudo al cristal, 40 ◆, enfriamiento 20 s) y **Furia** (+43 % de velocidad de ataque 20 s, 50 ◆). Costes de envíos ajustados (16 / 42 ◆) y mejora a 38 ◆.
- **Ayuda del cristal** (remontada): al comienzo de cada oleada el equipo que va 250 o más de vida abajo recibe +6 fragmentos.
- **Eclipse** a los 8 min: los dos cristales pierden vida cada vez más rápido; las partidas se resuelven (99–100 % terminan en cristal) con duración media ~8,4 min.
- Presión creciente: oleadas hasta 36 enemigos y daño enemigo +7 % por oleada.
- Estadísticas por jugador (daño, bajas, curación, caídas, envíos), estrella al mejor de cada equipo y racha/mejor racha local (solo partidas online; el entrenamiento contra bots no suma). Se guarda únicamente en `localStorage` (`cw-record`); no toca la cuenta ni la campaña.
- Celular horizontal: arena a pantalla completa con controles flotantes; los suministros aparecen solo durante la ventana de compra.
- Relay: cubeta de fichas por conexión (120 mensajes/s sostenidos, ráfaga 240); se descartan los excedentes y se corta tras 600 descartes. Prueba `server/test-relay.js` (inundación).
- Políticas de los bots (`balanced / economy / aggro / turtle`) sirven también para verificar que ninguna estrategia domine.

**Resultados medidos** (`node tools/crystal-wars/balance-gate.js`, partidas de bots): roles 49–53 %, políticas de compra 38–56 %, ventaja de lado 48 %, empates 0 %, 100 % terminan en cristal, 503 s de duración media. Es una puerta de CI.

**Límites honestos:** los bots son simples; miden el modo pero NO a jugadores humanos. No hay matchmaking, ranking verificado ni anti-cheat (el anfitrión sigue siendo de confianza; ver arriba). Las salas son privadas, así que sin amigos el modo no tiene cola pública. Próximos pasos propuestos: cola pública con relleno de bots, ranking por temporada con simulación en el servidor, partidas de 1 contra 1, y pruebas reales con 10+ personas.


## CW-3 — revisión pedida por el jugador (10/10/2026 UTC)

Implementado en rama desde `18f6b7b`:

- Dos campos dibujados en cada cuadro. El botón cambia el espacio asignado al rival, sin suspender movimiento ni bloquear habilidades/compras.
- Los envíos conservan `sender` / `sentBy` en el estado autoritativo. El campo rival muestra cuenta regresiva, unidades enviadas vivas y anillos dorados que las distinguen de la oleada natural.
- Primer despliegue 5 → 0,75 s; oleadas 35 → 24 s; envíos 5 → 3 s. Héroes comienzan más cerca del frente; enemigos normales pasan de 34 + oleada a 52 + oleada y colosos de 28 a 44 unidades/s. Límite de enemigos sin cambios.
- Eclipse 8 → 5 min, límite 10 → 7 min. El objetivo de duración media del gate pasa explícitamente de 300–560 s a 180–390 s por la petición de partidas más ágiles; **los límites de victorias por rol, política y lado no se relajan**.
- Con el ritmo nuevo, Sanadora dominaba (65 % en la primera tanda). Daño 29 → 22, conserva curas. Barrera 150 → 125 para no favorecer en exceso la defensa. El bot económico posterga su tercera inversión hasta la quinta oleada.
- Suministros móviles ubicados entre joystick y habilidades, sin cubrir el campo rival con el panel de compras.
- `CW-3` evita mezclar clientes con distintas reglas dentro de una sala.

Validación local:

- 19 pruebas deterministas de simulación: las anteriores y contacto antes de 6 s en los cuatro roles × cuatro semillas, atribución de envíos y ventanas de suministro.
- Cuatro navegadores contra relay local: campos simultáneos, movimiento/habilidades/compras con foco rival, llegada atribuida, entradas falsificadas, reconexión, resultado, revancha y caída del anfitrión. Sin errores JS.
- Capturas y límites de controles a 844×390 y 667×375; escritorio 1280×1000. Emulación Chromium, no certificación de dispositivos físicos.
- Integración de hub, tutorial saltado, regreso, archivo faltante e invitaciones antiguas: PASS.
- Las políticas con solo 8 semillas oscilaron entre aprobado y fallido al cambiar el lote. Se aumentan a 32 semillas por pareja (384 partidas de políticas), manteniendo umbrales. Se comprueba además un lote separado con `CW_BALANCE_SEED_OFFSET=100000`.

Pendiente solicitado: **plantel completo**. El modo aún ofrece cuatro kits, no los 38 de campaña. Su motor aislado implementa solo esos cuatro: la ampliación requiere adaptar efectos, pasivas, invocaciones y atlas, con pruebas por campeón y cliente. No se presentan cambios de nombre/imagen sobre un kit genérico como campeones completos. Esta entrega resuelve visión y ritmo; no da ese reclamo por terminado.

No se modifican progreso, billeteras, permisos ni servidor de producción. El taller de cinco campeones permanece en PR #78 con su diagnóstico de Saelis y sus gates incompletos guardados.

Resultados finales del gate CW-3 (804 partidas por lote, 1.608 en total):

| Lote | Tanque | Asesino | Mago | Sanadora | Políticas min–max | Lado Zafiro | Media | Resultado |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Semillas habituales | 43% | 47% | 59% | 50% | 48–52% | 42% | 260 s | PASS |
| Offset 100000 | 42% | 47% | 56% | 55% | 46–54% | 49% | 259 s | PASS |

El 100% (redondeado) de las partidas de composición terminan por cristal; empates 1% / 0%. Son simulaciones con bots, no una evaluación de diversión ni balance competitivo humano.

## Guerra de Cristales en el motor real — versión MOBA de un carril (12/10/2026, reemplazada por la de abajo)
Reemplaza al modo de "dos carriles separados". Código: `js/arenas/lanes/` (el motor de la campaña, no el simulador simplificado).

**Qué es.** Un mapa ancho con dos bases (Zafiro a la izquierda, Ámbar a la derecha). Cada base tiene **dos torres y un cristal**;
se derriban en orden (exterior → interior → cristal; las demás están "PROTEGIDAS"). Las torres disparan a la horda rival primero y
a los héroes rivales después. **PvP permitido**. Las dos hordas marchan solas contra la base contraria; hay que defenderse de ella.
**Cartas de horda:** cada ~55 s el equipo elige 1 de 3 cartas que potencian a *su propia horda* (vida, daño, velocidad, cantidad,
asedio, colosos, oleadas más rápidas, regeneración) en lugar de potenciar al héroe. Si nadie elige, se elige sola a los 15 s.
La tienda de fragmentos sigue (reparar, barrera, mandar acechadores/coloso).

**Cómo funciona el PvP sin tocar ningún kit.** Cada héroe tiene un *avatar* invisible dentro de `enemies`; como todas las
habilidades de la campaña golpean a `enemies`, los 29 campeones funcionan en PvP. El daño que pierde el avatar se le pasa al héroe
real (`lanesSync`, escalado por `LANES.PVP_DMG`). Torres y cristales funcionan igual. Mientras un héroe lanza algo, `heroes`/`allies`
son solo su equipo y `enemies` solo sus rivales (`lanesTeamCall`): curas, escudos y áreas caen del lado correcto. Redes de seguridad:
`damageEnemy` ignora el fuego amigo y las estructuras protegidas; `damageHero` ignora a la horda propia; los proyectiles atraviesan
a los propios.

**HUD.** El mismo de la campaña. Se suman: marcador con torres en pie, mapa completo en miniatura (bases, torres, hordas, héroes y
tu cámara), carta de horda (tres botones grandes), tienda y registro de eventos. Todo con letra ≥ 14 px.

**Pruebas** (`tools/lanes/`): `sim.js` (partidas completas: sin NaN, sin fuego amigo, cartas, estructuras), `kits.js` (los 29 campeones
con todas sus habilidades en el centro del mapa frente a un rival), `flow.js` (UI en 844×390 y 667×375), `tools/net-test/lanes_coop.js`
(2 clientes reales con relay).

**Pendiente / límites.** Balance con humanos sin medir (solo bots); sin cola pública (salas por código); relay limitado a 4 humanos.

## Coliseo en el motor real — torneo 2v2 de 8 luchadores (12/10/2026)
Código: `js/arenas/coliseum/`. Estilo "Arena" de Wild Rift: **cuatro equipos de dos**; en cada ronda se juegan **dos duelos 2v2 a la vez**
en dos fosos del mismo mundo (el tuyo es siempre el A; el B lo juegan los otros dos equipos). Gana el duelo el equipo que deja al rival
sin nadie en pie (si se acaba el tiempo, el de más vida; si empatan, nadie suma). **1 punto por duelo ganado; el primero en llegar a 3 gana**
(tres emparejamientos que se repiten; tope de 9 rondas, desempata por bajas de héroes).
- Fases por ronda: cuenta regresiva (héroes quietos e invulnerables) → pelea (80 s; desde los 28 s **el anillo se cierra** y fuera de él se
  pierde vida) → resultados. Sin reaparición dentro de la ronda.
- **Espectador:** si caés, la cámara (`CAM_SUBJECT`, ver `js/rendering/camera.js`) sigue a tu compañero o a otro luchador; botones
  ‹ › para cambiar y «OTRO DUELO» para ver el otro foso. También hay un mapa con los dos fosos siempre visible.
- Mismos campeones, habilidades y HUD de la campaña; el PvP es el de Guerra de Cristales (avatares + `lanesTeamCall`).
- Pruebas: `tools/coliseum/sim.js` (torneos completos: puntos coherentes, sin fuego amigo, protección en la cuenta regresiva, cámara
  espectadora, guardado restaurado) y `tools/coliseum/flow.js` (UI 844×390 y 667×375: hub → torneo → espectador → resultado → revancha → salir).

**Límites honestos:** el relay admite 4 humanos y el netcode une cada héroe a un slot, así que **el Coliseo online todavía no está** (el
torneo de 8 se juega contra bots); la próxima fase es sumar luchadores "virtuales" para que los invitados vean los dos fosos. El
balance entre kits en PvP no está afinado: con recargas naturales, vencer a un blanco quieto tarda entre 3 y 50 s según el campeón
(mediana ≈ 15 s). `LANES.PVP_DMG` y `LANES.PVP_BURST` son las perillas.

## Guerra de Cristales estilo Wild Rift 2D — fase 1 (12/10/2026)
Reemplaza al mapa de un solo carril. Código en `js/arenas/lanes/` (`lanes-data/levels/minions/jungle/bots/core/render/hud/net`).
- **Mapa 6400×4800** con tres carriles (arriba, medio, abajo), selva, río en diagonal y dos bases (Zafiro abajo a la izquierda, Ámbar arriba a la derecha).
  **9 torres por equipo** (3 por carril: exterior, interior, inhibidora) + cristal. Dentro de un carril se derriban en orden; el cristal queda
  expuesto cuando cae la inhibidora de cualquiera. Las torres disparan primero a la horda rival y después a los héroes.
- **Horda por carril:** cada 32 s sale una oleada por cada carril (3 esqueletos, 2 cristales voladores que disparan y, cada 3 oleadas, un coloso de
  asedio). Caminan por el carril (`laneProject`/`lanePoint`), pelean contra los súbditos rivales, atacan a héroes cercanos y derriban estructuras.
- **Selva:** 8 campamentos (lobos, bestias, escorpiones y un Gigante que bendice con +12 % de daño) que reaparecen a los 75 s, y dos objetivos épicos
  desde el minuto 4: **Dragón de Piedra** (+10 % de daño al equipo) y **Rey Coloso** (un coloso real por carril en las dos oleadas siguientes).
- **Niveles 3→15 dentro de la partida** (curva de `computePlayerStats`): experiencia por súbditos, campamentos, héroes y torres, repartida entre los
  héroes cercanos. **Cada nuevo nivel máximo del equipo da una carta de horda (una sola vez, aunque varios héroes alcancen ese nivel)** (elegís 1 de 3; los equipos de bots eligen solos).
- **Volver a la base (B)** canalizado 5,5 s (se corta si te movés o te golpean). Reaparición que crece con el nivel y el reloj.
- **Bots por rol** (medio, abajo ×2, arriba, selva): acompañan al frente de su horda fuera del alcance de las torres, retroceden heridos y el de la
  selva limpia campamentos. **5 contra 5** en solitario; en línea sigue siendo 2 contra 2 (límite del relay: 4 humanos).
- Pruebas: `tools/lanes/sim.js` (10 héroes, niveles, cartas, selva), `kits.js` (29 campeones en el medio del mapa frente a un rival), `flow.js`
  (UI 844×390 y 667×375, recall, tienda, carta), `tools/net-test/lanes_coop.js` (2 clientes reales, 24 avatares/estructuras sincronizados).
- **Pendiente para acercarse más a Wild Rift:** ítems por héroe (hoy el oro de equipo compra reparaciones/refuerzos), arbustos y visión, ping,
  hechizos de invocador, más variedad de súbditos, IA de bots que se agrupen para objetivos, y 3 contra 3/5 contra 5 en línea.
