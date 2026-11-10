# La Horda — Auditoría de PRODUCTO (retención y monetización)

Rama `claude/la-horda-beta-audit-exec-mwv8x0`. Solo lectura: no se tocó el repo (`git status --short` vacío).
Fuentes: código y datos del cliente, `server/battlepass.js` y `server/premium-packs.json` (lectura), un volcado en
navegador del catálogo real (`cosmeticsCatalog()`, `premiumCollection()`, `championCounts()`, guardado nuevo) y
`docs/art/ATLAS_ARTE.json` para el estado del arte.

Cifras que NO medí yo y tomo de informes del repo (se indican): oro por partida (`docs/alfa/q4_economia.md`),
nivel de guardián por partida y victorias hasta completar un set (`LA_HORDA_PROGRESSION_ECONOMY_REPORT.md`, anterior
a los últimos cambios de precios), rondas de la Horda por minuto (`HORDA_MEJORAS.md`, piloto automático).
No hay datos de jugadores reales en el repo: todo lo de "tiempo hasta X" es cálculo sobre tablas. No se citan cifras de mercado.

---

## 1. Mapa de la progresión con números

### 1.1 Primera sesión (supuesto del repo: partida de campaña ≈ 7 min; victoria en cada una)

| Momento | Qué tiene / gana el jugador | De dónde sale |
|---|---|---|
| Minuto 0 | 0 de oro, 0 gemas. Elige 1 guardián de regalo (34 elegibles) + 1 skin de ese guardián. Si elige la skin de set recibe **las 4 piezas del set** (o sea, el set completo de su guardián desde el minuto 0); si no, un vale | `js/storage/save.js:91`, `js/systems/starter-gift.js:72-79` |
| Minuto 0 (hub) | Ya ve: ficha TIENDA con insignias NUEVO y OFERTA, chip de Brasas «✦ —», botón «🎖 Pase de batalla», ficha DESAFÍOS («Logros · pase de temporada») | `index.html:199,239`, `js/ui/hub.js:61-75`, `js/ui/battlepass-ui.js:128-131` |
| Partida 1 (~7 min) | ~1.638 de oro (658 peleando + 710 de logros + 120 de desafíos + 150 del pase) + 2 gemas; un Muy Raro garantizado para una ranura vacía; ~12,7 objetos caídos; el guardián pasa de nivel 4 a ~19 | q4_economia §4; `js/data/loot.js:106`; informe de progresión §1 |
| ~15 min (2 partidas) | Alcanza para el **2.º guardián** (2.500 de oro; «2,0 partidas desde cero»). Al ganar la Fortaleza (arena 2) se abre la **Horda Infinita** | q4_economia §5; `js/data/endless.js:52` |
| ~30 min (4 partidas) | ~4.200 de oro acumulado, 2 guardianes, nivel ~28, 3-4 arenas de 10. Pase de temporada del cliente en nivel ~11 de 30 (≈3.400 XP de cuenta: 4 × ~600 por partida + logros a 50 + diarios 510) | cálculo sobre `seasonXpToNext`, `QUEST_XP` |
| ~60 min (8 partidas) | ~8.000 de oro (3 guardianes), nivel ~35-37, 7-8 arenas. Pase del cliente en nivel ~17 de 30. Primer legendario: mediana 14 victorias (todavía no) | idem |
| ~2,6 h (22 partidas) | **Pase de temporada del cliente terminado** (13.340 XP; el propio informe Q4 dice «~22 partidas») | `js/data/quests.js:181` |

**Cuándo ve la tienda, el pase y las Brasas: en el minuto 0, antes de jugar**, y los tres son callejones sin salida para
quien no tiene cuenta: el chip dice «✦ —», los paquetes dicen «Muy pronto», el Pase de batalla abre un cartel de
«Iniciá sesión» con seis candados (`js/ui/battlepass-ui.js:99-102`), y la insignia OFERTA de la Tienda está
encendida siempre que haya ofertas del día, es decir siempre (`js/ui/hub.js:67-68`).

**Objetivos por plazo**

- Corto (esta partida): claro en campaña (cartel «sobrevivir», `goal-guide.js`); en la Horda, la ronda y el puntaje.
  Falta el «para qué»: la pantalla de fin solo dice «Pase Nv. N ▲» en una línea, sin barra ni próxima recompensa
  (`js/ui/quests-ui.js:98`).
- Medio (esta semana): el más sano es **comprar guardianes con oro** (41 obtenibles: 36 a 2.500 + 7 de Ascensión
  a 8.000-14.000 = 165.500 de oro ≈ 198 partidas de crucero a 835 ≈ 23 h). La Tienda ya muestra «Tu próxima meta»
  (`shop-ui.js:187-196`), pero solo dentro de la Tienda.
- Largo: set propio del guardián (mediana **157 victorias**, p10 93, p90 280, según el informe de progresión) →
  regala su skin. Es la única ruta gratis a un cosmético de 800 ✦ y nadie la muestra como meta con progreso fuera
  de la ficha de la skin.

### 1.2 Bucles de retención: qué piden, qué dan, cuándo se agotan

| Bucle | Pide | Da | Se agota en | Hueco detectado |
|---|---|---|---|---|
| **Desafíos diarios** (3/día, 1 cambio) | p. ej. 200 bajas, 1 victoria, 2 subjefes | 110-160 de oro c/u (≈390/día = 0,7 partidas de oro) + 120 XP c/u; los 3: **cofre 1** | Nunca (rotan) | El premio de «¡DÍA COMPLETO!» es el cofre más pobre: 1 objeto con calificación B y 0 gemas (`QUEST_CHESTS[1]`); un Raro se vende a ~8-10 de oro. No se siente |
| **Desafíos semanales** (3/sem) | p. ej. 1.500 bajas, 5 victorias | 550-720 de oro c/u (≈1.900/sem) + 400 XP c/u; los 3: cofre 3 + 500 XP | Nunca | Razonable. Es el único bucle semanal |
| **Racha diaria** | 1 diario por día | Día 3: cofre 2 · día 7: título «Constante» · día 14: cofre 3 + marco animado | **Día 14** (`next` queda en `null`) | Del día 15 en adelante no hay nada; los hitos se pueden recobrar una vez por mes calendario, pero la pantalla no lo dice |
| **Pase de temporada (cliente, gratis)** | 13.340 XP de cuenta | 2.250 de oro, 20 gemas, 7 cofres, 7 títulos, 4 marcos, 3 emblemas | **~22 partidas (≈2,6 h)** | `SEASON_DEF.id` es fijo `"t1"`: **no se reinicia nunca**. Después del primer fin de semana queda muerto para siempre |
| **Pase de batalla (servidor, 30 días)** | 30.000 XP (30 × 1.000). Partida: campaña 200 si gana / 40 si pierde; Horda 25 + 15 × ronda, tope 400 (ronda 25). Tope diario 2.400. Desafíos de temporada: 2.900 en total | Gratis: 27.000 de oro + 3 marcos `bp:*`. Premium (950 ✦): 250 ✦ + 6 cosméticos `bp:*` (2 skins, 2 alas, 1 efecto, 1 aura) | 11,3 días jugando al tope diario | **Ritmo imposible para quien paga jugando normal**: 4 victorias de campaña por día, los 30 días = 26.900 XP → nivel 26, no llega al 28 (último cosmético premium) ni al 30. 2 partidas de Horda a ronda 10 por día → nivel ~11. Y los 9 cosméticos no tienen arte («(arte pendiente)» visible al jugador, `battlepass-ui.js:27`) |
| **Nivel de cuenta** | 400 + 80 × nivel | Títulos en 5, 10 y 20 | **Nivel 20** (21.280 XP ≈ 30 partidas) | Sin tope de nivel pero sin premios después del 20 |
| **Logros** (59) | Variado | 9.090 de oro en total (≈11 partidas), 15 títulos, 5 marcos, 3 emblemas | Los largos: 10.000 bajas (~20 partidas), 50 partidas, nivel 60 (~31 partidas), 25 partidas coop | Buena cola media; nada después |
| **Nivel de guardián** | `90 + 26·n + 0,16·n³` | Puntos de talento | Nivel 40 ≈ partida 10-12; nivel 60 ≈ partida 31 (552.594 XP) | Por guardián: 41 guardianes es mucha cola, pero nada lo muestra como colección («3 de 41 a nivel 20») |
| **Reliquias de la Horda** | Elegir 1 de 3 en rondas 3, 5, 10, 15… | Build de la partida (se pierde al terminar) | No se agota | No deja nada persistente: ni «reliquias descubiertas 9/24» ni sinergias vistas. Es variedad sin colección |
| **Rangos de Cicatriz** | Llegar a la ronda 10/15/20/25/30/35 en el rango 0/I/II/III/IV/V | 5 títulos + marco en el V; +15 % de puntaje por rango | Mínimo teórico ≈ 135 rondas ≈ 1 h 30 de reloj de ronda + 27 jefes ≈ **2 h** si todo sale a la primera | El marco del rango V y el del top 10 del ranking son **el mismo id** (`cicatriz` está dos veces en `QUEST_FRAMES`, `js/data/quests.js:160` y `:165`; gana la segunda definición): el premio del V no es exclusivo. Después del V solo queda el puntaje |
| **Sets** (52 sets, 41 de guardián) | Botín: set 0,08 % en la Ciudad → 3 % en la Infernal por objeto; sesgo ×14 al guardián jugado | Bonos 2/3/4 piezas + su skin | Mediana 157 victorias por set | Cola larguísima y sana, pero invisible: no hay «te faltan 2 piezas, caen más en tal arena» fuera del Códice |
| **Ranking mensual de la Horda** | Puntaje | Títulos top 50 / top 10 / #1 + marco | Mensual | Depende del servidor (no validable hoy); sin cuenta queda local |
| **Tienda: ofertas del día** | Oro | −15/−30 % en 4 objetos + 1 guardián destacado | Diario | Solo oro. **Ninguna apariencia de Brasas se destaca ni rota**; la «skin del día» solo aparece si el destacado sale skin |

**Calendarios desalineados (confunde y diluye el «volvé»):** la temporada de la Horda es el mes calendario UTC
(`endless.js:42`); el Pase de batalla son bloques de 30 días desde el 1/11/2026 (la temporada 3 empieza el 31/12);
el pase del cliente es «Temporada 1» eterna; los desafíos rotan a medianoche local y lunes local; la Tienda `demo`
a medianoche local. Cinco relojes distintos.

**Dónde se queda sin nada nuevo:** a las ~2,6 h se termina el pase gratis; a las ~1,5-2 h de victorias seguidas, la
campaña (10 arenas); día 14, la racha; nivel 20, los títulos de cuenta. Lo que sigue vivo después (guardianes por
oro, Ascensión, dificultades, Cicatriz, sets) existe pero no tiene un lugar donde se vea como «lo próximo».

### 1.3 Catálogo cosmético real

Catálogo unificado: 174 entradas. **Vendibles por Brasas: 92**.

| Tipo | Cantidad | Precio ✦ | Equivalente (pack base, 100 ✦/US$) | Estado del arte (atlas) |
|---|---|---|---|---|
| Skin de set | 34 | 800 | US$ 8,00 | 8 `CODEX_OK`, 3 arte viejo, 23 con reposo de 1 cuadro |
| Skin con diseño propio | 33 | 1.200 | US$ 12,00 | 0 `CODEX_OK`, 2 arte viejo, 31 con reposo de 1 cuadro |
| Croma | 15 | 300 | US$ 3,00 | 1 `CODEX_OK`, 14 con reposo de 1 cuadro; **10 de las 15 se llaman igual («Ceniza del Alba»)** |
| Efecto de habilidades (Astral / Consagrada) | 10 | 800 | US$ 8,00 | Sin arte propio: solo tiñen el efecto (lo dice `NEXT_SESSION.md`) |
| Total | **92** | **79.300** sueltas | ≈ US$ 793 (≈ US$ 610 con el pack de 130 ✦/US$) | — |

- «1 cuadro» significa **reposo** de 1 cuadro (90 de 104 apariencias); caminar, atacar y lanzar sí están animados
  (3-4 / 2-3 cuadros) y el reposo tiene respiración procedural. Ninguna apariencia es totalmente estática.
  Con arte del Códice completo hay **9 de 82** apariencias con sprite a la venta.
- Gratis: 22 skins de Ascensión (todas con reposo de 1 cuadro), 5 efectos base (completar el conjunto de 6 piezas),
  41 títulos, 12 marcos distintos, 7 emblemas.
- Pase de batalla: 9 ids `bp:*` por temporada (6 premium + 3 marcos gratis), **ninguno con arte**.
- La documentación quedó vieja: `PRECIOS.md` habla de 62 apariencias (29 + 23 + 10); el juego tiene 92.

**Cuánto cuesta «todo» de un guardián** (colección con 15 %/20 % de descuento, `premiumCollection`):

- 5 guardianes tienen **una sola** apariencia vendible, su skin de set a 800 ✦: Kael (guerrero), Thalen (mago),
  Elyra (soporte), Ilkan e Iria. Para tres de los cuatro clásicos, el regalo inicial ya entrega esa skin: **el jugador
  que empieza con ellos no tiene nada que comprar para su guardián principal.**
- 11 guardianes: 2 apariencias, 2.000 → 1.700 ✦ (US$ 17).
- 17 guardianes: 3 apariencias, 2.300 → 1.840 ✦ (US$ 18,40) o 3.200 → 2.560 ✦ (US$ 25,60).
- Dariel: 4 apariencias, 3.500 → 2.800 ✦ (US$ 28).
- 12 guardianes (7 de Ascensión, 2 Fundadores, Ilsa, Vorn, Kora) no tienen nada a la venta.
- Las 34 colecciones juntas: 58.940 ✦ (71.300 sueltas).

**Escalera de precios contra paquetes: tres desajustes de «te falta poquito»**

| Paquete | Brasas | US$ | Qué pasa |
|---|---|---|---|
| `brasas_500` | 500 | 4,99 | Compra 1 croma (300) y **sobran 200** que no compran nada (lo único de 200 era la pieza de set, apagada). No alcanza para ninguna skin |
| Bienvenida | 700 | 6,99 | **Le faltan 100** para una skin de set (800) |
| `brasas_1000` | 1.100 | 9,99 | **Le faltan 100** para una skin con diseño propio (1.200) y le sobran 150 después del pase (950) |
| Pase premium | 950 ✦ | — | El primer paquete que lo paga es el de US$ 9,99 |

- Primer escalón barato: existe (croma, US$ 3 dentro de un paquete de US$ 4,99) pero solo para 15 de 46 guardianes
  (los 15 más nuevos). Para los otros 19 con algo a la venta, lo más barato cuesta 800 ✦.
- Hay dos paquetes `launchOnly` en `server/premium-packs.json:66-87`: 1.200 ✦ por US$ 2,99 (401 ✦/US$) y 2.800 ✦ por
  US$ 5,99 (467 ✦/US$), **sin `once`**. Si se activan tal cual, valen 4 veces más que cualquier otro paquete y
  rompen la nota del mismo archivo («valor por dólar creciente: 100 a 130»).

**¿El pase premium vale 950 ✦?** Hoy no: devuelve 250 ✦ (26 % del precio) y 6 cosméticos que no existen. Con arte,
sí valdría: 6 cosméticos a precio de catálogo serían ≥ 4.800 ✦ sueltos por un costo neto de 700 ✦. El problema ya
no sería el precio sino el ritmo (ver tabla 1.2): quien paga y juega 2-4 partidas por día no llega al final.

---

## 2. Propuestas priorizadas (12)

Marcadas **[YA]** las 5 que se pueden implementar en el cliente sin decisiones del dueño, sin servidor y sin arte nuevo.

| # | Propuesta | Problema medido que resuelve | Dónde | Esfuerzo | Riesgo | Impacto |
|---|---|---|---|---|---|---|
| 1 **[YA]** | **Panel «Lo próximo que desbloqueás»** al terminar la partida y en el hub: barra del pase con la recompensa del nivel siguiente, oro que falta para el próximo guardián, días hasta el próximo hito de racha, ronda que falta para el próximo Rango | El fin de partida solo dice «Pase Nv. N ▲»; las metas de medio plazo existen pero no se ven fuera de su pantalla | `questsShowRunSummary` (`js/ui/quests-ui.js:88-99`), resultados de la Horda (`js/systems/endless.js:~640`), `renderHub` (`js/ui/hub.js`); datos ya disponibles: `questsSeason()`, `SEASON_REWARDS`, `questsStreakInfo()`, `shopNowRowHTML` (reusar su cálculo), `scarOutcome` | M | Bajo: desborde a 667×375 y textos EN/PT | Retención: alto |
| 2 **[YA]** | **Cerrar los callejones del minuto 0**: sin cuenta, el chip ✦ y el botón del pase llevan al Probador libre de apariencias y al pase gratis de DESAFÍOS en vez de «Muy pronto» / «Iniciá sesión»; la insignia OFERTA solo se enciende si hay ofertas sin ver | Primera exposición a la monetización = tres pantallas vacías antes de jugar; insignia permanente = ruido | `js/ui/hub.js:67-68` y `:222`, `bpOpen`/`bpLoad` (`js/ui/battlepass-ui.js:47-52`), `openGuardians('skins')` | S | Bajo | Ingresos: medio (deseo antes que muro) · Retención: medio |
| 3 **[YA]** | **Vitrina en momentos de orgullo**: en récord nuevo de la Horda, rango de Cicatriz completado y victoria con S/S+, mostrar al guardián con su apariencia y dos botones: «Equipar título/marco ganado» y «Ver apariencias de X». Hoy el enlace existe pero es discreto, solo en victoria de campaña y solo jugando solo | El jugador gana títulos y marcos (41 + 12) y nadie le ofrece ponérselos; el enlace a apariencias no aparece en la Horda | `endSkinsLinkHTML` (`js/ui/end-screens.js:126-134`), resultados de la Horda (`endless.js:632-660`, ya calcula `L.newGlobal`/`L.newGuardian`), `js/systems/scar-ranks.js` (resumen), `questsSetCosmetic` | S-M | Bajo; mantenerlo como botón secundario, nunca antes de «Continuar» | Ingresos: medio-alto · Retención: medio |
| 4 **[YA]** | **Racha y diarios a la vista en el hub**: chip con días de racha, estado «hoy todavía no» (`atRisk`), congelador y próximo hito con su premio; y decir en DESAFÍOS que los hitos se renuevan cada mes | La racha solo se ve dentro de DESAFÍOS; el motivo para volver mañana no está en la pantalla donde se decide jugar | `js/ui/hub.js` (`renderHub`), `questsStreakInfo()` (`js/systems/quests.js:372`), `js/ui/quests-ui.js` | S | Bajo. Texto informativo, sin cuenta regresiva roja | Retención D1/D7: alto |
| 5 **[YA]** | **Limpieza de coherencia con las reglas** (lista de la sección 3): textos «casi todo el poder», «se compran con oro en la Tienda», marco `cicatriz` duplicado, y **no ofrecer «Activar premium» mientras alguna recompensa premium sea `bp:*` sin arte** (se muestra «Próximamente») | Se vende (en diseño) un premium con «(arte pendiente)»; el marco del rango V no es exclusivo; dos textos contradicen la promesa | `js/ui/shop-ui.js:279`, `js/data/cosmetics-catalog.js:26`, `js/data/quests.js:160/165` (renombrar uno, p. ej. `cicatriz_v`, y `SCAR_RANKS[5].frame`), `js/ui/battlepass-ui.js:118` | S | Bajo; el renombre del marco necesita migración de `save.quests.frames` | Confianza / reseñas: alto |
| 6 | **Pase del cliente con reinicio mensual**, alineado al mes de la Horda, y curva más larga (hoy 13.340 XP = 22 partidas) | El único pase jugable sin servidor muere a las 2,6 h y no vuelve | `SEASON_DEF` y `seasonXpToNext` (`js/data/quests.js:180-181`), `questsNormalize` (`js/systems/quests.js:31-32` ya reinicia si cambia el id) | S-M | Medio: reinyecta 2.250 de oro + 20 gemas + 7 cofres por mes; el reloj es del cliente. Decisión del dueño por economía | Retención mensual: alto |
| 7 | **Marcos, títulos y emblemas nuevos sin arte**: los marcos son 3 colores + brillo y los emblemas son glifos 12×12 que ya están en el código (24 glifos, 6 usados). Usarlos para: hitos de racha 21 y 30, nivel de cuenta 30/40/50, y **dar contenido real a los 3 `bp:marco_*` de la ruta gratis** | Racha muerta el día 14, cuenta muerta en el nivel 20, 3 de 9 placeholders del pase | `QUEST_FRAMES`, `QUEST_EMBLEMS`, `QUEST_TITLES`, `STREAK_MILESTONES` (`js/data/quests.js`); mapa `bp:marco_*` → marco en `battlepass-ui.js:_bpRewardText` | S | Bajo. Los nombres y colores conviene que los apruebe arte (Códice) | Retención: medio |
| 8 | **Colección persistente de la Horda**: «Reliquias descubiertas 9/24», sinergias activadas alguna vez, mejor ronda por guardián (41) y por rango, en el Códice y en la preparación | Las reliquias no dejan nada entre partidas; el récord por guardián ya se guarda (`S.byGuardian`) y no se muestra como colección | `js/systems/horde-relics.js` (registrar en `save.endless`), `js/systems/endless.js:583` y pantalla de preparación (`:739-755`) | M | Bajo (solo identidad, sin economía) | Retención de la Horda: medio-alto |
| 9 | **Meta de sesión de 3 pasos** al entrar al hub («Hoy: 1 diario · subí 1 nivel del pase · probá a X»), generada con lo que ya existe; al cumplirla, el cofre del día | La sesión no tiene cierre: el jugador no sabe cuándo «ya cumplió» | `js/ui/hub.js`, `questsEnsureRotation`, `CHALLENGE_BONUS` | M | Medio: no duplicar los diarios; mejor presentar los 3 diarios como «la meta de hoy» | Retención: medio |
| 10 | **«Apariencia de la semana» en la vitrina**, elegida por el guardián más jugado (`questsFavChamp`), sin descuento ni contador; y aviso de rotación en el hub solo cuando cambió | Ninguna apariencia de Brasas se destaca; la vitrina solo rota cosas de oro | `shopDailyShowcase` (`js/systems/shop.js`), `renderShopShowcase` (`js/ui/shop-ui.js:198`) | S-M | Bajo si no hay descuento ni urgencia | Ingresos: medio |
| 11 | **Progreso de set como meta visible**: «Baluarte 3/4 · te falta el casco · cae más en Fortaleza y Laberinto · al completarlo ganás la skin», en el hub y al caer una pieza | La única ruta gratis a una skin (mediana 157 victorias) no se comunica; sirve de ancla de valor para la skin de 800 ✦ | `SET_ARENA_WEIGHTS` (`js/data/loot.js:80`), `shopSetMissing`, `js/ui/loot-ceremony.js`, hub | M | Bajo | Retención larga: medio · Ingresos: medio (ancla) |
| 12 | **Cromas como premio de maestría** (nivel 30 del guardián da su croma) o vale de croma en el hito de racha de 30 días, usando el sistema de vales que ya existe pero limitado al escalón croma | Faltan premios cosméticos «de verdad» ganables; hay 15 cromas de 300 ✦, 10 genéricas | `_giftSkin`/`skinVoucherRedeem` (`js/systems/starter-gift.js:57-122`), `questsGrant` | M | **Alto si no se limita**: hoy el vale canjea skins de set y entrega las 4 piezas (poder), y también skins de 1.200. Regala el único escalón barato. Decisión del dueño | Retención: medio · Ingresos: ambiguo |

Orden sugerido: 5 → 2 → 1 → 4 → 3 (las cinco [YA]), después 7 y 6, después 8, 10, 11.

---

## 3. Contradicciones con las reglas de negocio (archivo:línea)

Regla: gratis; Brasas compran SOLO cosmético puro; nunca poder, piezas ni efecto de set; set completo regala cosmético; pase de 30 días gratis + premium.

**Poder por dinero (directo)**

1. `server/premium-packs.json:10-20` — Pack de bienvenida de US$ 6,99 con `"championGifts": 3`. Tres guardianes por dinero real.
2. `js/data/pricing.js:31-33` — `welcome: { pack: "brasas_bienvenida", champions: 3, category: "STANDARD" }` (la misma regla, del lado que ejecuta el cliente y el servidor).
3. `js/ui/shop-ui.js:503-506` — la tarjeta lo vende así: «+ 3 campeones», «3 campeones de regalo, a tu elección (en la Tienda valen 🪙 7.500 de oro)».
4. `js/ui/welcome-picks.js` (todo el archivo; `:34-36`, `:56`, `:81`) y `server/payments.js:74` — pantalla y entrega del regalo de campeones.
5. `docs/economy/PRECIOS.md:20`, `:46`, `:85-91`, `:98` — lo documenta como aceptado («atajo de unas 9 partidas»).

**Poder por dinero (latente / insinuado)**

6. `js/systems/premium.js:159` y `js/data/pricing.js:27,35,46` — sigue vivo todo el camino de compra de piezas de set por Brasas (`pieza: 200`, `PIECES_FOR_BRASAS`); está apagado, pero un solo booleano lo enciende. La regla dice «nunca».
7. `js/systems/premium.js:33-34` — existe el texto público alternativo «Las Brasas compran apariencia y piezas de set (equipo)».
8. `js/ui/shop-ui.js:279` — «⚖ **Casi todo** el poder se consigue jugando». Con la regla vigente es «todo»; el «casi» insinúa que algo de poder se compra.
9. `js/systems/starter-gift.js:72-79` — el vale de skin (`skinVoucherRedeem`) entrega las piezas del set (poder). Hoy es un regalo del juego, no dinero; se vuelve violación en cuanto un vale salga de un paquete o del pase premium.
10. `js/ui/shop-ui.js:557-558` — sin sesión, «Con Brasas se desbloquean» + cinco íconos con candado (🎨 👑 ✦ 🎁 💠) sin decir qué son. Ambiguo; conviene nombrar solo cosméticos.

**Textos falsos o documentación que contradice al código**

11. `js/data/cosmetics-catalog.js:26` — «Reuní las piezas del set jugando: caen como botín, **se compran con oro en la Tienda** o se reforjan». Falso: `js/systems/shop.js:168` rechaza la compra de piezas con oro.
12. `docs/economy/BRASAS_SOLO_COSMETICOS.md:4` — dice que la skin de set es `earnedOnly`, precio 0 y «no se vende por Brasas». En el juego las 34 skins de set se venden a 800 ✦ (`js/systems/premium.js:38`; solo los 5 efectos base son `earnedOnly`). No viola la regla (es cosmético), pero el documento de la regla y el código dicen cosas distintas.
13. `docs/economy/PRECIOS.md:22` y §5-bis (`:109-127`) — siguen describiendo las piezas por Brasas como política vigente; la corrección está solo al final (`:136-137`).
14. `docs/economy/PRECIOS.md:43-44,62` — «23 skins de diseño propio, 10 cromas, 29 de colección»; el catálogo real es 33 / 15 / 34 + 10 efectos.

**Pase**

15. `server/battlepass.js:18,25-28` y `js/ui/battlepass-ui.js:27,118` — se ofrece «Activar premium · ✦ 950» con 6 recompensas rotuladas «(arte pendiente)».
16. `js/data/quests.js:178-180` («Sin pista paga», «Pase de temporada») frente a `js/ui/battlepass-ui.js` («Pase de batalla»): dos pases con nombres casi iguales, tablas distintas y calendarios distintos, los dos en el hub.
17. `server/battlepass.js:16-17` — temporadas de 30 días fijas desde el 1/11/2026; la Horda usa mes calendario (`js/systems/endless.js:42`). Se desfasan desde la temporada 3.

**Precios / otros**

18. `server/premium-packs.json:66-87` — paquetes `launchOnly` a 401 y 467 ✦/US$ sin `once`, contra la nota de `:7` («valor por dólar creciente: 100…130»).
19. `js/data/quests.js:160` y `:165` — clave `cicatriz` duplicada en `QUEST_FRAMES`: el marco del Rango V y el del top 10 del ranking son el mismo objeto.
20. `js/ui/shop-ui.js:568` y `js/ui/legal.js:140` — «Mercado Pago cobra en pesos argentinos». Para la versión de Steam el cobro dentro del juego tiene que ir por la billetera de Steam; ese texto y ese flujo no pueden salir en esa build (coordinar con el área Steam).

---

## 4. Qué NO hacer

- **Cajas de botín pagas o cualquier compra con resultado al azar.** Los cofres de desafío tiran botín con tablas: están bien mientras se ganen jugando. No venderlos, ni llaves, ni «tiradas» por Brasas. No meter cofres en la ruta premium.
- **Vender poder por cualquier puerta**: guardianes en paquetes, piezas de set, vales que entreguen piezas, aceleradores de XP/oro, reliquias de la Horda, congeladores de racha, cambios de desafío o saltos de nivel del pase por Brasas (saltar niveles es vender tiempo; es lo primero que piden estos sistemas y lo primero que rompe la promesa).
- **Brasas como premio corriente** (logros, racha, diarios): la regla dice solo compra real o pase.
- **Urgencia engañosa**: contadores que se reinician, «última oportunidad», precio tachado inflado, ofertas «solo para vos» con reloj. La rotación ya está bien escrita («se renueva en…», «vuelve en N días»): mantener ese tono también para las apariencias.
- **Precios «te falta poquito»** (hoy pasa tres veces, sección 1.3): dejar al jugador siempre 100 ✦ corto empuja a un segundo paquete y es el patrón que más reseñas negativas genera. Alinear paquetes con precios.
- **Castigar la racha con culpa** («vas a perder tu racha de 12 días» en rojo, notificaciones insistentes). Informar sí, presionar no; el congelador ganado jugando es el diseño correcto.
- **Vender algo sin arte o sin terminar**: premium con «(arte pendiente)», efectos que solo tiñen a precio de skin.
- **Skins que cambien la lectura del combate** (siluetas o efectos que escondan telegrafías): pasarían a ser ventaja. Vale para alas, auras y efectos del pase.
- **Compras de un toque y cobros fuera de la plataforma** en la build de Steam; mantener la confirmación con precio que ya existe.
- **Exclusivos de temporada que no vuelven nunca** anunciados como presión. Si un cosmético del pase no vuelve, decirlo antes de vender; mejor que vuelva más adelante a la Tienda.

---

## 5. Decisiones que son del dueño (con recomendación en una línea)

| Decisión | Recomendación |
|---|---|
| Pack de bienvenida con 3 guardianes | Sacar `championGifts`; que el pack dé 800 ✦ (alcanza justo para una skin de set) + un marco y un título exclusivos «de fundación», que no requieren arte. |
| Escalera de paquetes contra precios | Hacer que cada paquete alcance exacto para algo: 300 / 800 / 1.200 (o bajar «diseño propio» a 1.100) y que ningún paquete deje un resto sin uso. |
| Paquetes `launchOnly` (US$ 2,99 y 5,99) | Dejarlos solo si llevan `once: true`; son el mejor primer escalón (una skin por US$ 2,99) pero repetibles destruyen el resto de la tabla. |
| Precio y contenido del pase premium | No venderlo hasta tener los 6 cosméticos con arte del Códice; 950 ✦ está bien si trae 2 skins de guardián reales y devuelve 250 ✦. |
| Ritmo del pase de batalla (servidor) | Bajar a ~500 XP por nivel o sumar un bono de «primera victoria del día»: que 2 partidas por día durante 25 días lleguen al nivel 30. |
| Un solo pase o dos | Uno solo a la vista: el del servidor cuando haya cuenta; sin cuenta, el pase gratis del cliente bajo el mismo botón y con el mismo nombre. |
| Reinicio mensual del pase del cliente (propuesta 6) | Sí, alineado al mes de la Horda, con la mitad del oro actual para no inflar la economía. |
| Skins de set: ¿se venden a 800 ✦ además de ganarse? | Seguir vendiéndolas (para 5 guardianes es lo único que hay) y corregir `BRASAS_SOLO_COSMETICOS.md`. |
| Efectos Astral/Consagrada a 800 ✦ sin arte propio | Bajarlos al escalón croma (300) o sacarlos de la venta hasta que tengan arte; hoy cuestan como una skin entera. |
| Código de piezas por Brasas (`PIECES_FOR_BRASAS`) | Borrar el camino entero (cliente y servidor), no solo dejarlo apagado: la regla dice «nunca». |
| Cofre de «día completo» | Subirlo de la variante 1 a la 2 (calificación A + 1 gema): el premio diario principal tiene que sentirse. |
| Racha después del día 14 y cuenta después del nivel 20 | Agregar hitos 21 y 30 y niveles 30/40/50 con títulos, marcos y emblemas de datos (propuesta 7). |
| Cromas como premio de hitos (propuesta 12) | Solo las 10 genéricas «Ceniza del Alba» como premio de maestría; las 5 con nombre propio y todo lo de 800+ siguen siendo de compra. |
| Guardianes con una sola apariencia (Kael, Thalen, Elyra, Ilkan, Iria) | Prioridad de arte: una croma para cada uno antes que skins nuevas para los que ya tienen 3; son los guardianes con los que empieza la mayoría. |
| `SHOP_MODE = "live"` (rotación de objetos por oro) | Mantener `demo` en la beta; activarlo recién con servidor autoritativo y oro medido en Pesadilla. |
| Cobro por Mercado Pago en la versión Steam | Texto y flujo de pago por plataforma; en Steam, billetera de Steam. |

---

## 6. Límites de esta auditoría

- Sin datos de jugadores reales: los tiempos salen de tablas y de simulaciones del repo con piloto automático.
- El oro por partida (835 crucero, 1.638 la primera) y el nivel por partida vienen de informes anteriores a la tanda de Rangos y reliquias; no los volví a medir.
- El Pase de batalla se leyó en el servidor; no se probó contra un servidor levantado (no se trabaja en servidor).
- No evalué la calidad visual de las 92 apariencias una por una; el estado del arte es el del atlas (`docs/art/ATLAS_ARTE.json`).
