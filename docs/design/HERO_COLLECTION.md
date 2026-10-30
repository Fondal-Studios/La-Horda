# La Horda — propuesta de héroes coleccionables v1

**Estado: clasificación para revisar en rama.** No está activada en el juego: esta entrega define todas las rutas, sus requisitos y su validación; no instala bloqueos, compras ni entregas de premios. El modelo de pruebas solo evalúa datos, sin modificar cuentas. Base auditada: `6edcd9bce3d2d3cc77578e6d13a394d05b9c5eb6`.

## Decisión de diseño

La colección pasa a ser un objetivo permanente: elegir un primer héroe, descubrir nuevos estilos al jugar y completar las apariencias de cada uno. Cada héroe público tiene una ruta garantizada de juego. Las categorías describen **cómo se consigue**, no su poder ni su rol de combate. No se agregan estadísticas, rarezas de poder, sorteos o vencimientos.

Se propone **elegir uno gratis entre diez**, conservando la elección inicial actual. Los nueve restantes se reclutan por victorias, eligiendo siempre entre los básicos que falten. No se entregan diez héroes juntos. Se ven las diez opciones, con los cuatro roles recomendados destacados y sin una elección preseleccionada.

El plantel contiene **41 héroes coleccionables + 2 fundadores**. Los fundadores no entran en el 100% de colección ni son requisitos de ningún desafío. Las categorías técnicas `STANDARD / FAMILY / ASCENSION / FOUNDER` siguen siendo datos de permisos y balance; la nueva categoría de adquisición será un campo separado. Esta propuesta no certifica el balance de los kits existentes.

## Categorías

| Categoría | Héroes | Objetivo |
|---|---:|---|
| Iniciales | 10 | Diez opciones de inicio y reclutamiento temprano. |
| Cacería | 4 | Bajas y jefes acumulados. |
| Conquista de arenas | 10 | Avance y supervivencia en territorios concretos. |
| Maestría | 4 | Dominar un héroe abre otro estilo. |
| Vínculos | 6 | Encuentros al completar una arena con un héroe relacionado. |
| Legado | 3 | Final de campaña y metas largas. |
| Hazañas | 4 | Retos de habilidad, cooperativo y otros modos. |
| Fundadores | 2 | Concesiones especiales fuera de la colección pública. |

## Los diez iniciales

| Héroe | Rol | Motivo |
|---|---|---|
| Aldric | Tanque | Tanque frontal para aprender. |
| Kael | Asesino | Asesino de daño físico. |
| Thalen | Mago | Mago elemental de distancia. |
| Elyra | Soporte | Sanadora y apoyo de equipo. |
| Sylva (Cazadora) | Asesino | Tiradora móvil. |
| Segador | Tanque | Tanque ofensivo de furia. |
| Nigromante | Mago | Invocador para jugar con criaturas. |
| Brasa | Mago | Ingeniera de torretas. |
| Maura | Tanque | Protectora de zonas y caminos. |
| Dáriel | Soporte | Apoyo musical con ritmo propio. |

**Reclutamiento temprano:** una elección adicional al acumular 1, 2, 3, 5, 7, 10, 13, 16 y 20 victorias válidas de campaña. Son nueve elecciones además de la inicial; no una moneda que se compra. Se elige un básico todavía no obtenido. El desbloqueo y el consumo de la elección se deben guardar juntos en el servidor. Si ya se tienen los diez, no se genera una recompensa duplicada.

Las primeras victorias también pueden conseguir al héroe de una arena. Así, una elección inicial poco cómoda no obliga a repetir muchas partidas antes de probar otra clase. Estos umbrales son una propuesta inicial, no un ritmo de retención ya probado: medirlos con jugadores antes del lanzamiento.

## Clasificación completa y condiciones

Todas las victorias de arena y los vínculos corresponden a campaña, salvo que la condición nombre explícitamente otro modo. El nivel del personaje, el nivel interno de la arena y la ronda de Horda Infinita son contadores diferentes. En los retos de supervivencia cuenta **terminar** el nivel o la ronda; entrar no alcanza.

### Cacería

| Héroe | Desbloqueo propuesto |
|---|---|
| Musashi | Derrotá 500 monstruos en total. |
| Renko | Derrotá 10 jefes finales de arena. |
| Orsa | Derrotá 25 subjefes. |
| Morveth | Derrotá 3.000 monstruos en total. |

### Conquista de arenas

| Héroe | Desbloqueo propuesto |
|---|---|
| Vesper | Completá Ciudad Maldita en campaña. |
| Brakk | Completá Fábrica Sin Fin en campaña. |
| Aelith | Completá Ruinas Élficas en campaña. |
| Morwen | Completá Reino Fúngico en campaña. |
| Baltra | Completá Arena Acuática en campaña. |
| Iria | Completá Laberinto en campaña. |
| Khepri | Completá Abismo en campaña. |
| Farolero | Completá Minas Profundas en campaña. |
| Vhal | Superá el nivel de arena 8 de la Gélida en campaña. |
| Zahra | Superá el nivel de arena 7 de la Infernal en campaña. |

### Maestría

| Héroe | Desbloqueo propuesto |
|---|---|
| Axiom | Llevá a Thalen a nivel 20. |
| Profeta | Ganá 5 arenas de campaña con Elyra. |
| Ilkan | Llevá al Segador a nivel 25. |
| Tibor | Ganá 5 arenas de campaña con el Nigromante. |

### Vínculos

| Héroe | Desbloqueo propuesto |
|---|---|
| Eslabón | Completá la Fábrica Sin Fin con Brasa. |
| Ynara | Completá la Ciudad Maldita con Elyra. |
| Myla | Completá las Ruinas Élficas con Ynara. |
| Solciju | Completá el Reino Fúngico con Morwen. |
| Nahir | Completá el Laberinto con Iria. |
| Sira | Completá el Laberinto con Nahir. |

### Legado

| Héroe | Desbloqueo propuesto |
|---|---|
| Aurelia | Completá las 10 arenas de la campaña. |
| Libertador | Completá la campaña y vencé la Infernal con 3 héroes diferentes. |
| Oriel | Completá las 10 arenas de campaña en Pesadilla. |

### Hazañas

| Héroe | Desbloqueo propuesto |
|---|---|
| Bront | Ganá 3 arenas en cooperativo O 5 veces la Fábrica Sin Fin en solitario. |
| Velmira | Ganá una partida en Arena Divina. |
| Saelis | Ganá 3 arenas de campaña sin caer durante cada partida. |
| Veyra | Completá la ronda 10 de Horda Infinita. |

### Fundadores

| Héroe | Desbloqueo propuesto |
|---|---|
| Nano GM | Concesión de fundador por el servidor. |
| Facu GM | Concesión de fundador por el servidor. |

Los vínculos son propuestas de encuentro y misión, no parentescos que se atribuyen al canon. Brasa y El Eslabón comparten el tema de la Fábrica y sus cadenas; Elyra, Ynara y Myla forman un camino de cuidado y protección; Morwen y Solciju comparten destilación y maldiciones. Iria → Nahir → Sira desarrolla el recorrido de sellos, espejos y mapas del Laberinto.

## Skins como segunda colección

| Ruta | Condición | Recompensa |
|---|---|---|
| Colección de set | Poseer al héroe y reunir las cuatro piezas distintas de su set | Apariencia del set permanente, aunque después se desequipen o desguacen las piezas |
| Maestría | 3 victorias de campaña con el héroe; 6, 9, etc. para cromas adicionales | Cromas existentes en orden determinista; la tienda sigue siendo una vía alternativa |
| Hazaña | Nivel 30 del héroe + victoria en la Infernal con ese mismo héroe | Skins alternativas registradas; la tienda sigue siendo una vía alternativa |
| Conceptos de Ascensión | Set propio para la primera; Infernal con ese héroe para la segunda | Solo activables cuando arte y representación en combate estén aprobados |
| Fundador | Concesión correspondiente del servidor | Apariencias fuera del porcentaje público |

El catálogo [de apariencias](HERO_COLLECTION_SKINS.md) asigna rutas a **82 registros de skins/cromas** y separa **16 conceptos de Ascensión** cuyo registro indica `GENERATED_PENDING_REVIEW`. La carga de los módulos verifica IDs y correspondencias, no calidad visual ni existencia/funcionamiento de todos los PNG. No se encargó arte nuevo ni se declaró aprobado el arte pendiente.

Obtener una apariencia no regala el equipo ni sus bonos. La apariencia es cosmética, sin estadísticas adicionales. El aspecto base viene con el héroe. Los regalos iniciales ya adquiridos y las skins compradas se conservan; si se cumple un reto de algo que ya se posee, se marca completado sin una segunda entrega. Los conceptos no cuentan como una colección imposible de terminar.

## Cómo debería verlo el jugador

En Guardianes y Códice: **Colección 8/41**, filtros por categoría y por estado (`Todos / Obtenidos / Por conseguir`). Cada tarjeta muestra héroe, rol, categoría y requisito exacto: por ejemplo `Musashi — Cacería — 327/500 monstruos`. Las condiciones compuestas muestran cada paso; un promedio no debe presentar una recompensa como lista si falta un requisito.

Una meta se puede fijar en el menú y en el resumen de partida. El resultado explica `+73 monstruos · 400/500` y anuncia el héroe o la skin obtenida. Las fichas bloqueadas siguen permitiendo ver habilidades, historia y apariencia. Las cadenas muestran primero el héroe previo que falta, con enlace a su ficha. El filtro de héroes obtenidos conserva una selección de combate rápida.

Separar el contador de héroes del de skins/cromas. No aumentar el denominador con fundadores, conceptos, internos o apariencias no disponibles. Los modos competitivos y la validación de selección siguen usando propiedad y permisos reales.

## Migración al activar el sistema

1. Crear copia versionada y migración idempotente por cuenta. Conservar TODOS los héroes y cosméticos obtenidos por compra, regalo, desafío o concesión válida. Nunca reiniciar cuentas ni volver a bloquear lo que ya poseen.
2. Reconocer progreso histórico solo si existe evidencia suficiente. Los totales de victorias de un héroe y de una arena por separado NO prueban una victoria de ese héroe en esa arena. Si falta el evento combinado o la confirmación de nivel terminado, empezar ese contador desde cero y explicarlo.
3. Para cuentas antiguas: considerar consumida la elección inicial si ya eligieron o poseen algún héroe; acreditar las nueve elecciones de reclutamiento según victorias históricas válidas, con sus recibos, limitadas a básicos faltantes. No descontar como elecciones nuevas los héroes comprados antes de la migración.
4. Deshabilitar compras de héroes al activar el modelo; el oro sigue para equipo/forja y las Brasas para cosméticos. Mantener los derechos de packs de bienvenida ya pagados y las concesiones válidas. No volver a vender packs que prometan héroes fuera de las nuevas rutas.
5. Sustituir las siete condiciones actuales de Ascensión por las de esta tabla. Quien ya consiguió esos héroes los conserva. Evitar que el hook antiguo conceda por una condición diferente o permita un atajo de compra.
6. Guardar evidencia, reclamo, consumo de elección y recompensa de forma atómica con identificador de partida/recompensa. Reintentar tras desconexión sin duplicar entregas. El servidor vuelve a calcular elegibilidad: no acepta un `unlocked=true` ni un contador arbitrario enviado como prueba.
7. Aplicar las mismas reglas en selección inicial, tienda, Guardianes, Códice, guardado/carga, API económica, selección online y bienvenida. Respetar `artPending`, `releaseState` y permisos de fundador.

## Qué puede reutilizarse y qué falta instrumentar

El juego ya guarda kills, victorias, máximos y progreso de héroe; `js/systems/quests.js` y `js/systems/ascension-unlocks.js` son la base. También existe economía autoritativa y proyección de propiedad en `server/item-economy-live.js`. **No se puede conectar esta clasificación únicamente al cliente:** la proyección del servidor revertiría entregas no registradas.

| Dato | Fuente actual / contrato | Estado para la activación |
|---|---|---|
| `kills` | save.quests.stats.kills | `available` |
| `bosses` | save.quests.stats.bosses | `needs_mode_filter` |
| `subbosses` | save.quests.stats.subjefes | `needs_mode_filter` |
| `arenaWins` | save.quests.stats.byArena[arena].wins | `needs_mode_filter` |
| `arenaLevelCompleted` | Nuevo evento de nivel completado; bestLevel actual mide nivel alcanzado | `new_event` |
| `heroLevel` | save.champions[hero].level | `available` |
| `heroWins` | save.quests.stats.byChamp[hero].wins | `needs_mode_filter` |
| `heroArenaWins` | Nuevo agregado héroe + arena; no inferirlo de dos totales separados | `new_event` |
| `campaignArenas` | save.arenasCleared, contrastado con el modo campaña | `needs_mode_filter` |
| `distinctHeroesArena` | Conjunto de héroes con victoria certificada por arena | `new_event` |
| `difficultyArenas` | save.diffCleared[difficulty], valores true y arenas distintas | `needs_server_difficulty` |
| `coopWins` | save.quests.stats.coopWins | `needs_mode_filter` |
| `soloArenaWins` | Nuevo agregado de victorias de un solo humano por arena | `new_event` |
| `divinaWins` | save.quests.stats.divinaWins | `available` |
| `deathlessWins` | save.quests.stats.deathless | `needs_mode_filter` |
| `endlessRoundCompleted` | Nuevo evento de ronda completada; no usar EN.round como prueba de completitud | `new_event` |

`available` significa que existe un agregado local reutilizable, no que sea una prueba antitrampas. Los agregados de campaña deben excluir Test Lab, pruebas/dev, PvP, entidades invocadas y partidas duplicadas; el cooperativo cuenta por jugador humano, sin exigir cuatro jugadores. La derrota no borra acumulados. La política de progreso offline requiere reconciliación antes de cualquier entrega online.

La API actual `ascension.unlock` admite la categoría y confía en el logro declarado por el cliente; no sirve como validador genérico de los nuevos desafíos. La dificultad tampoco llega hoy al servidor económico. La activación necesita registrar modo, dificultad, héroe, arena, niveles/rondas completados, bajas y resultado por partida, y obtener los agregados desde eventos aceptados.

## Entrega de esta rama y validación

- `docs/design/hero-collection.v1.json`: fuente estructurada de categorías, iniciales, requisitos y recompensas cosméticas.
- `tools/collection/load-roster.js`: lee módulos reales del roster y los registros cosméticos; no ejecuta combates ni descarga arte.
- `tools/collection/validate-plan.js`: detecta héroes faltantes, duplicados, IDs inválidos, ciclos, requisitos de fundador y skins asignadas al héroe incorrecto.
- `tools/collection/model.js`: evaluador puro para probar requisitos y elecciones; no concede recompensas y no se carga en `index.html`.
- `tools/collection/plan.test.js`: límites exactos, progresión inicial, vínculos, alternativas en solitario, campaña completa, cosméticos y validaciones negativas.

```sh
node tools/collection/validate-plan.js
node --test tools/collection/plan.test.js
```

Resultado al preparar la rama: 43 héroes cubiertos, 10 iniciales, 82 cosméticos registrados, 16 conceptos separados; 9 pruebas aprobadas. No se ejecutaron pruebas de combate ni visuales porque esta entrega no cambia el runtime ni los assets. La siguiente implementación debe cerrar la instrumentación y migración descritas antes de activar los premios; esta rama es la clasificación concreta solicitada.
