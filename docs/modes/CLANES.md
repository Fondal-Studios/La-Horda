# Clanes y Conquista del Castillo (guerra de clanes)

Estado: **Alpha para jugadores que ya terminaron la campaña (endgame)**. Rama `claude/clanes`, desde `origin/main` (f7c5548).
Etiquetas usadas en este documento: **VERIFIED** (lo corrió una prueba y se ve la salida en la sección «Pruebas»),
**IMPLEMENTED** (está en el código, con prueba parcial o solo de humo), **PROPOSED** (diseño, no existe), **BLOCKED** (no se puede hacer hoy y por qué).

Dos piezas:

1. **Sistema de clanes** (servidor + pantalla «Clan» del hub): crear, buscar, unirse, salir, expulsar, roles, puntos y tabla.
2. **Conquista del Castillo**: un clan ataca un castillo y el otro lo defiende, sobre el motor real de la Guerra de Cristales
   (`js/arenas/lanes/`). **Se juega contra bots**: vos y 4 compañeros controlados por el juego contra un clan rival SIMULADO.

## Qué NO es (para no prometer de más)

- **No es clan contra clan en línea** (BLOCKED): el relay admite como máximo 4 humanos por sala y el netcode de `lanes` une cada héroe a un
  slot. Un 5 contra 5 de clanes online no se puede hoy. Lo que sí queda hecho es el contrato de datos y mensajes para sumarlo (ver más abajo).
- **No es anti-trampa**: el resultado de una partida contra bots lo informa el **cliente** y se puede falsificar. El servidor pone topes y
  validaciones de plausibilidad, no verifica la partida. Los puntos de clan son sociales: no dan poder, ni oro, ni objetos.
- **No es moderación a escala**: hay un filtro básico de nombres y nada más (ver «Qué falta»).

## Cómo entrar

La Horda → Menú principal → tarjeta **CLAN** (sección «Explorar»). Hace falta una **cuenta** (la misma del guardado en la nube):
sin cuenta la pantalla muestra «Entrar o crear cuenta».

- Sin clan: pestañas **Buscar** (por nombre o etiqueta; «Unirme» o «Pedir entrar» según el clan), **Crear** y **Tabla**.
- Con clan: **Mi clan** (resumen, puntos, últimas guerras, editar, salir, disolver), **Miembros** (rangos, expulsar, traspasar liderazgo,
  solicitudes), **Castillo** (lanzar la partida) y **Tabla**.
- La Conquista del Castillo se abre al **completar la campaña** (todas las arenas de `ARENA_ORDER`). En el cliente es obligatorio; en el servidor es
  opcional (`CLAN_WAR_MIN_ARENAS`, según el resumen del guardado en la nube, que también lo informa el cliente).

## Reglas de los clanes (IMPLEMENTED + VERIFIED en el servidor)

| Tema | Regla |
|---|---|
| Nombre | 3 a 20 caracteres: letras latinas, números, espacio y `_ . ' -`; al menos 2 letras. Único por **esqueleto**: sin tildes, sin mayúsculas, sin espacios ni signos, letras repetidas colapsadas y `0 1 3 4 5 7 @ $ !` leídos como `o i e a s t a s i`. «Cuervos de Ceniza», «cuérvos de cénizá» y «Cu3rv0s d3 C3n1z4» son el mismo nombre |
| Etiqueta | 2 a 4 letras/números (se guarda en mayúsculas). Única por esqueleto: `L0L` y `LOL` son la misma |
| Descripción | hasta 120 caracteres, sin enlaces ni usuarios (`http`, `www`, `.com`, `discord`, `@usuario`…) |
| Filtro | lista negra básica (insultos, odio, sexual) por palabra entera —no censura «vehículo» ni «círculo»— o por trozo inequívoco; nombres reservados del equipo del juego (`admin`, `fondal`, `La Horda`, `soporte`…). Letras de otros alfabetos (cirílico…) se rechazan: no se admiten parecidos |
| Miembros | tope 30 (`CLAN_MAX_MEMBERS`), hasta 5 oficiales, un solo clan por cuenta |
| Ingreso | **abierto** (entra quien quiera) o **por solicitud** (un oficial o el líder acepta; hasta 20 solicitudes por clan, 3 por cuenta, vencen a los 3 días) |
| Roles | **Líder**: todo (editar, ascender/bajar oficiales, expulsar a cualquiera, traspasar, disolver). **Oficial**: atiende solicitudes y expulsa a *miembros*. **Miembro**: salir |
| Salir | el líder no puede salir si hay más miembros (traspasa o disuelve); si queda solo, el clan se disuelve |
| Enfriamiento | 5 min (`CLAN_COOLDOWN_MS`) sin poder crear ni unirse tras salir, ser expulsado o disolver |
| Puntos | puntos de clan acumulados (solo suben o bajan con el parte de la Conquista; nunca bajan de 0); cada miembro ve cuánto aportó |
| Tabla | por puntos, luego victorias, luego antigüedad |

Los nombres no se pueden cambiar (evita cambiar de nombre para imitar). Los miembros se muestran con su **nombre visible** de cuenta (el mismo del
ranking semanal); se identifican entre sí con un número propio del clan (`mid`), no con el usuario de login ni con el id de cuenta.

## API (IMPLEMENTED + VERIFIED)

Servidor `server/clans.js` + `server/clan-names.js`, montado por `server/accounts.js`. Todo lo que cambia algo exige `Authorization: Bearer <token>`.

| Ruta | Qué hace |
|---|---|
| `GET /api/clans?q=&limit=&offset=` | público; tabla o búsqueda (límite 50). Con sesión agrega `mine` |
| `GET /api/clan/info?id=` | público; detalle y miembros (sin solicitudes) |
| `GET /api/clan` | mi clan: miembros, solicitudes (líder/oficial), topes de hoy, enfriamiento, límites |
| `POST /api/clan/create` `{name, tag, desc?, joinMode?}` | 400 nombre/etiqueta/descripción · 409 `NAME_TAKEN`/`TAG_TAKEN`/`ALREADY_IN_CLAN` · 429 `COOLDOWN`/`TOO_MANY` |
| `POST /api/clan/join` `{id}` | une o crea solicitud · 409 `CLAN_FULL` |
| `POST /api/clan/cancel` `{id}` | cancela mi solicitud |
| `POST /api/clan/leave` | salir (409 `LEADER_MUST_TRANSFER`) |
| `POST /api/clan/kick` `{mid}` | líder u oficial (403 si el objetivo es de igual o mayor rango) |
| `POST /api/clan/role` `{mid, role:"officer"\|"member"}` | solo líder |
| `POST /api/clan/transfer` `{mid, confirm:true}` | solo líder |
| `POST /api/clan/edit` `{desc?, joinMode?}` | solo líder |
| `POST /api/clan/request` `{rid, accept}` | líder u oficial |
| `POST /api/clan/disband` `{confirm:"<etiqueta>"}` | solo líder, hay que escribir la etiqueta |
| `POST /api/clan/war/report` | parte de la Conquista del Castillo (ver contrato) |

**Persistencia.** El mismo adaptador de cuentas: `clans.json` (escritura atómica) en `DATA_DIR`, o la tabla `horda_clans` en Postgres (se crea sola).
Es **un documento** por servidor; todas las escrituras pasan por `store.clanUpdate(fn)`, que las ejecuta de a una (cola en memoria en el archivo;
`SELECT … FOR UPDATE` en una transacción en Postgres), así que nombre único, tope de miembros y un clan por cuenta no tienen carreras, ni siquiera
entre dos procesos. Es simple y correcto, no está pensado para cientos de miles de clanes (tope `CLAN_MAX_CLANS`, 5000): a esa escala hace falta
una tabla por entidad con índices únicos. En el plan gratuito de Render sin base de datos el archivo se **borra** con cada redeploy, igual que las cuentas.

**Seguridad aplicada (VERIFIED con `server/test-clans.js`)**: sesión obligatoria; permisos decididos en el servidor con el rol guardado; entrada estricta
(tipos, largos, listas cerradas, ids solo dígitos, `__proto__`/`constructor` como id o clave no hacen nada, cuerpos de más de 4 KB → 413);
límites de frecuencia (25 acciones por cuenta cada 5 min, 2 clanes creados por cuenta y 6 por IP por día —solo cuentan los que salieron bien—,
90 búsquedas por minuto por IP) además del límite general de `/api`; sin nombres de login ni ids de cuenta en las respuestas.

## Conquista del Castillo (IMPLEMENTED; sim VERIFIED, ver «Pruebas»)

Variante `mode:"castle"` del motor de la Guerra de Cristales: `js/arenas/lanes/lanes-castle.js` + ganchos mínimos en `lanes-core/minions/render/hud`.
Se lanza desde la pestaña **Castillo**: elegís **atacar** o **defender**, la **dificultad** (1 a 3) y un rival simulado.

- **Mapa**: el de tres carriles de siempre. **Atacantes** = equipo 0 (Zafiro, abajo a la izquierda); **defensores** = equipo 1 (Ámbar, arriba a la derecha).
  Si elegís defender, tu equipo es el 1. 5 contra 5 (vos + 4 bots del juego contra 5 bots).
- **Castillo defensor**, en cada uno de los tres carriles: **Puerta** (la muralla: no dispara y los héroes le hacen solo el 55 % de daño, cae ante la horda y el ariete),
  **Torre** y **Torre del homenaje**; y el **Corazón del castillo**, que queda expuesto cuando cae cualquier torre del homenaje («brecha»).
  Las murallas dibujadas a los lados de cada puerta son **decorado** (no bloquean el paso ni se rompen aparte): la defensa real son esas estructuras.
- **Atacantes**: sin torres; su base es el **Estandarte de asedio**. Su horda es la de siempre (3 carriles, colosos de asedio), pero sus criaturas dañan a las estructuras
  del castillo al 75 % (`CASTLE.SIEGE_K`) para que un asedio dure minutos. Sin cartas de horda al empezar.
- **Defensores**: milicia más chica y más lenta (2 soldados por carril cada 40 s y un hechicero cada dos oleadas) y las torres y puertas del castillo.
- **Vida** (`CASTLE` en `lanes-castle.js`): puerta 4200 · torre 3000 · torre del homenaje 3600 · corazón 4400 · estandarte 5000 (las del castillo se multiplican por la dificultad si el rival defiende).
- **Victoria**: los atacantes ganan si cae el corazón. Los defensores ganan si cae el estandarte **o** si el castillo resiste 11 minutos.
- **Resto igual a la Guerra de Cristales**: niveles 3 a 15 dentro de la partida, cartas de horda, selva, tienda de oro, volver a la base. Sin Eclipse.
- **Dificultad del rival simulado** (afecta solo al rival): 1 «Guarnición novata» (estructuras −20 %), 2 «Compañía de asedio» (una carta de horda y bots +1 nivel),
  3 «Gran ejército» (estructuras +25 %, tres cartas y bots +2 niveles).
- **Guardado**: se juega con el guardado temporal normalizado de la Guerra de Cristales; el progreso real no se toca (verificado en la prueba de interfaz).
  Puntos de clan viven solo en el servidor; no se usa `save.clan`.
- **Abandonar** una partida a mitad no manda parte: no suma ni resta (limitación: no hay forma fiable de castigar el abandono en el cliente).

### Puntos de clan

| Dificultad | Victoria | Derrota |
|---|---|---|
| 1 | +12 | −3 |
| 2 | +20 | −5 |
| 3 | +30 | −8 |

Topes (servidor): **8 partidas por cuenta por día** (UTC), **+400 puntos por clan por día** (las restas no tienen tope), puntos nunca bajo 0, partida de
2 a 20 minutos, y cada partida tiene que caber en el tiempo que pasó desde el parte anterior de esa cuenta (+2 min de margen). Cada parte lleva un `matchId`
único: reintentarlo (corte de red) devuelve lo mismo sin sumar dos veces (`duplicate:true`); usarlo desde otra cuenta da 409.
Un parte sin conexión queda en cola (`localStorage`, hasta 5) y se reenvía al abrir la pantalla Clan o al entrar a la cuenta.

## Contrato de datos y mensajes (para sumar clan contra clan en línea)

Archivo máquina-legible: [`clan-war-contract.json`](clan-war-contract.json); `server/test-clans.js` comprueba que coincide con las constantes del servidor y
que su ejemplo es un parte válido.

- **Parte v1 (IMPLEMENTED)** `POST /api/clan/war/report`: `{matchId, mode:"castle", role:"attack"|"defend", result:"win"|"loss", opponent:"bots", tier:1..3,
  durationMs, stats?:{gates, towers, heartPct, heroKills, heroDeaths, minionKills, seconds}, build?}`. `opponent:"bots"` es la única opción: **un parte del cliente
  nunca suma puntos de clan-vs-clan**.
- **Clan contra clan en línea (PROPOSED, no existe)**:
  1. un oficial desafía a otro clan: `POST /api/clan/war/challenge` → el servidor crea una guerra `{warId, attackerClan, defenderClan, sides, expiresAt}`;
  2. cada jugador pide `POST /api/clan/war/ticket {warId}` → ticket firmado (HMAC compartido con el relay) con `{warId, userId, clanId, side, exp}`;
  3. al crear/unirse a la sala se manda `{t:"create"|"join", arena:"castle", warTicket}`; el relay verifica firma, vencimiento, clan y lado;
  4. el anfitrión simula como en la Guerra de Cristales (invitados no autoritativos);
  5. **el relay**, no el cliente, informa el resultado a `POST /api/internal/clan-war/result` firmado; solo así se suman puntos de clan-vs-clan.
  Lo que falta para esto: más de 4 humanos en relay y netcode (hoy 2 contra 2), secreto compartido relay ↔ cuentas, emparejamiento/calendario de desafíos
  y un resultado que no dependa de un cliente (simulación o verificación en el servidor).

## Pruebas

Todas corridas en esta rama (salida en el informe de la entrega):

| Qué | Comando |
|---|---|
| Servidor de clanes (permisos por rol, nombres duplicados y parecidos, filtro, entradas maliciosas, topes, límites de frecuencia, carreras, persistencia, parte del castillo, contrato) | `node server/test-clans.js` |
| Postgres real (nombre único entre dos procesos, puntos, reinicio) | `HORDA_TEST_PG_URL=postgres://… node server/test-postgres.js` (job `postgres` del workflow) |
| Pantalla Clan + partida de asedio atacando y defendiendo + puntos en el servidor + parte sin conexión + invitado, a 844×390 y 667×375 (letra ≥ 14 px, botones ≥ 44 px, sin texto cortado ni desborde, sin errores de página) | `node tools/clan/clan-ui.js` |
| Partidas completas del castillo con reloj virtual, en los dos roles y las tres dificultades | `node tools/lanes/castle-sim.js [partidas por combinación] [segundos]` |
| Lo que ya existía y no se rompió | `node tools/lanes/flow.js`, `node tools/lanes/sim.js 2 150`, tests de servidor, `tools/ux/test-hub-legibility.js`, `test-touch-targets.js`, `test-text-overflow.js`, `tools/crystal-wars/hub-integration.js` |

Workflow `.github/workflows/champion-entry-balance.yml`: `server/test-clans.js` en `entry-reference`; job nuevo `clans` (35 min) con `clan-ui.js` y `castle-sim.js 1 720`;
el caso Postgres corre dentro del job `postgres` (ya existente).

__SIM__

## Qué falta

- **Clan contra clan en línea** (BLOCKED por relay y netcode; diseño PROPOSED arriba).
- **Anti-trampa**: los resultados de las partidas contra bots son falsificables. Hace falta simulación o verificación en el servidor (o que el relay sea quien informa).
  Los topes por día reducen el daño, no lo impiden: alguien puede sumar hasta 400 puntos por día por clan con partes inventados.
- **Moderación de nombres a escala**: el filtro es una lista corta, sin otros idiomas, sin jerga nueva ni contexto. Falta reportar clanes/jugadores, cola de revisión humana,
  sanciones (renombrar o disolver desde el panel del Game Master) y registro de auditoría. No hay chat de clan, a propósito (sería otra superficie a moderar).
- **Escala**: un solo documento por servidor (ver Persistencia). Sin invitaciones por enlace, sin historial completo de movimientos, sin temporadas ni premios (los puntos no dan nada hoy).
- **Balance de la Conquista del Castillo**: medido solo con bots, sin humanos; no hay prueba con jugadores reales ni en celulares físicos (la prueba móvil es emulación de Chromium 667×375 y 844×390).
- **Murallas**: son decorado; no hay colisión ni brechas físicas. Los compañeros del equipo son bots genéricos del juego, no los miembros reales del clan.
- **Abandono**: abandonar a mitad no cuenta como derrota.
- **Panel del Game Master**: no tiene vistas de clanes todavía.
