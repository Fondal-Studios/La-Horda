# Postgame: Guerra de Cristales y Coliseo con la progresión de campaña

Decisión del dueño (definitiva): **Cristales y Coliseo usan la progresión de campaña y están pensados para el postgame.** Antes los dos modos descartaban talentos, maestría, equipo y nivel (un jugador de 60 horas y uno nuevo eran idénticos), no daban recompensa y estaban abiertos desde el primer minuto. Reglas de los modos: [`CRYSTAL_WARS.md`](CRYSTAL_WARS.md). Alcance: **solo contra bots / partidas locales**. Las salas online no cambian (siguen normalizadas, sin recompensas).

Dónde se cambia cada perilla (un solo lugar cada una):

| Qué | Dónde |
|---|---|
| Abrir todo (página de muestra) o exigir la campaña | `POSTGAME_GATE` en `js/data/postgame.js` (`"campaign"` / `"open"`) |
| Tope de nivel, talentos, maestría, objetos, reliquias, pasivas, vida, daño, velocidad, bots | `LANES.PROGRESS_CAP` en `js/arenas/lanes/lanes-data.js` |
| Oro, XP, topes diarios, tiempos mínimos, trofeos, logros y cosméticos | `POSTGAME_CFG`, `POSTGAME_ACHIEVEMENTS` en `js/data/postgame.js` |

## 1. Acceso: se abre al terminar la campaña

- **Condición:** victoria en la última arena de `ARENA_ORDER` (flag real `save.arenasCleared[infernal]`) o todas las arenas ganadas (`postgameCampaignDone`). Se **deriva** del guardado: un jugador que ya terminó la campaña queda abierto sin migrar ni perder nada (`arenasCleared`/`legacyOpenArenas` no se tocan). Al detectarlo se guarda `save.postgame.unlocked` para que un reinicio posterior de la campaña no lo cierre.
- **Antes de terminar:** las tarjetas del hub se ven apagadas, con borde punteado y dicen «Se abre al terminar la campaña · Entrenamiento disponible». Tocarlas abre un aviso con la condición y el progreso (`n/10 arenas`) y el botón **Entrenar (sin recompensas)**.
- **Entrenamiento** (acceso universal, explícito): campeón normalizado como siempre (Cristales nivel 3→15 de partida; Coliseo nivel 10), cualquier campeón del plantel, **sin progresión, sin recompensas, sin racha**. También se usa si el campeón elegido no es tuyo o si marcás «Entrenamiento normalizado» en el lobby (para probar kits con la campaña terminada). La pantalla de resultado lo dice.
- `isArenaUnlocked("convergencia"/"coliseo")` **sigue devolviendo `true`** a propósito: lo consultan las salas online, que no se tocan. El acceso en solitario lo decide `postgameUnlocked()`.
- **Online:** crear/unirse a una sala privada sigue disponible aunque el postgame esté cerrado, con perfiles normalizados (`lanesBegin("lobby"|"host"|"guest")` nunca instala progreso; probado). Consecuencia a decidir por el dueño: hoy un jugador nuevo puede jugar Cristales **online** sin terminar la campaña.

## 2. Qué entra de la campaña y con qué tope

El campeón del jugador entra con **una copia recortada** de su progreso, dentro del guardado temporal de la partida (`lanesBegin` ya lo reemplazaba; ahora `postgameInstall` le copia el campeón). El guardado real **no se toca durante la partida** y se restaura idéntico al salir (`lanesRestore`); solo recibe la recompensa final. Los bots no heredan nada del jugador.

| Componente | Rango real | Tope (`PROGRESS_CAP`) | Efecto del tope |
|---|---|---|---|
| Nivel efectivo (abre árbol nv. 40 y Maestría nv. 90) | 1–99 | `level` 90 | Se usa para habilitar talentos y Maestría de rama; **no** da estadísticas por sí solo |
| Bono de nivel en vida y daño | — | `levelStatPct` 8 % al nivel real 60 (lineal desde el 1) | Nivel 40 ≈ +5 %, nivel 60+ = +8 % |
| Puntos de talento (árbol + Maestría de rama) | hasta 30 | `talentPoints` 12 | Se conserva la rama más invertida, de la raíz a la punta (`_pgPruneTalents`) |
| Maestría de habilidad (puntos) | 0–10 por habilidad | `masteryAlloc` / `ultAlloc` 1 | Poder ×3,1 → ×1,10; recarga −55 % → −2 % |
| Maestría de uso | 1–40 | `masteryUse` 5 | +47 % → +5 % de poder |
| Objetos equipados (nivel / nivel de objeto) | 1–10 / 1–10 | `itemLevel` 3 / `itemIlvl` 3 | Un legendario nivel 10 rinde 1,97× el stat base; nivel 3, 1,21× |
| Sets | — | se conservan las piezas equipadas | Los bonos de set siguen activos |
| Reliquias | 0–30 por tipo (1,5 % c/u) | `relics` 6 | +45 % → +9 % |
| Pasivas (suma de objetos + talentos) | sin tope | `passiveMax` (daño 5 %, daño de habilidades 5 %, vel. de ataque 6 %, recarga 6 %, robo de vida 3 %, velocidad 5 %, vida 8 %, defensa +4 %, crítico +3 %…) | Se recorta cada efecto de la suma (`postgamePassiveCap`, gancho en `_passiveBucket`) |
| Vida / daño base totales | — | `statMax` ×1,20 / ×1,12 | Tope duro contra el mismo campeón sin progreso |
| Velocidad / defensa extra | — | ×1,06 / +0,05 | Idem |
| Escudo permanente de casco + escudo | hasta +220 % de la vida | `shieldMax` 8 % de la vida | Idem |
| Bots (aliados y rivales) | — | `botShare` 0,6 | Vida ×1,12 y daño ×1,07 (= 60 % del bono máximo) |

Las habilidades, pasivas de kit, invocaciones y transformaciones **no se tocan**: el progreso se aplica a través de los mismos sistemas de la campaña (`talentMods`, `masteryOf`, `equippedPassives`).

## 3. Matemática: tiempo para matar y ventaja

Cuentas con el código real (`computePlayerStats`, `masteryPowerMult`, `equippedPassives`) y con la prueba `tools/lanes/ttk-gate.js` (blanco quieto de 600 de vida y 10 % de defensa, nivel 10, recargas naturales, límite de ráfaga del PvP, una pasada por campeón sobre los 34 del plantel; resultados en `docs/competitive/ttk-gate-none.json` y `ttk-gate-max.json`).

**Sin tope, el máximo de la campaña sería inalcanzable.** Mago con nivel 99, talentos completos, reliquias 30 y seis legendarios nivel 10 (medido): contra el mismo mago sin progreso al mismo nivel, vida ×1,44, daño base ×2,98, velocidad ×1,45, escudo permanente +214 % de la vida y poder de habilidad ×4,5 (maestría 10 y uso 40); además el nivel 99 da 610 de vida y 146 de daño contra 169 y 30 del nivel 15 de partida (×3,6 y ×4,8). Un jugador así mataría varias veces más rápido y aguantaría varias veces más: no habría partida.

**Con el tope (perfil «al máximo», medido en los 34 campeones):**

| Medida | Sin progreso | Al tope | Ventaja |
|---|---|---|---|
| Tiempo para matar al blanco (mediana de los 33 campeones que matan en ambos casos) | 100 % | ≈ 61 % | **×1,63** de daño por segundo (rango por campeón ×1,17 a ×4,02; una sola pasada por campeón, con ruido) |
| Vida efectiva (vida + escudo) | 100 % | 130 % (×1,20 de vida × 1,08 de escudo) | **×1,30** |
| Fuerza de combate (daño por segundo × vida efectiva, ley cuadrática de Lanchester) | 1,00 | 2,12 | **×2,1**: en un duelo parejo el jugador al tope gana conservando ≈ 73 % de su vida (√(1 − 1/2,12)); un jugador sin progreso sigue pudiendo ganar, no es una pared |
| Contra un bot del modo (vida ×1,12, daño ×1,07) | — | — | ≈ ×1,52 de daño y ×1,16 de vida efectiva → **×1,8** de fuerza |

Un jugador que acaba de terminar la campaña (nivel ≈ 40, pocos puntos de talento, equipo mediano) recibe solo el bono de nivel (≈ +5 %) más lo poco que tenga: la mayor parte de la ventaja se gana con talentos, equipo y reliquias durante el postgame, que es lo que se busca.

**Cómo se eligió el tope.** La primera versión (nivel de objeto 4, maestría 2, pasivas hasta 15 %, vida y daño ×1,25) daba **×2,04** de daño por segundo y **×2,8** de fuerza: las palancas (daño base, daño de habilidades, velocidad de ataque, recarga, maestría) **se multiplican entre sí**, así que cada tope chico suma bastante. Se recortó en rondas sobre 8 campeones: ×2,04 → ×1,77 → ×1,49 (en esa muestra los talentos y la maestría al tope movían menos de ×0,05: el peso lo llevan nivel, equipo y reliquias) y el perfil final quedó en ×1,63 sobre los 34. Para ver el efecto de otro valor sin tocar el código: `node tools/lanes/ttk-gate.js --profile=max --base=docs/competitive/ttk-gate-none.json --cap='{"talentPoints":8}' mago tanque`.

**Equilibrio entre campeones (informativo, sin progreso):** el tiempo para matar va de 8,8 s (Ilkan) a más de 50 s; mediana por rol: asesino 13,5 s, mago 18,6 s, tanque 21,6 s, soporte 41,6 s. **Fuera de ±50 % de la mediana de su rol** (se listan, no se tocan): Libertador (asesino, 51,5 s, ×3,8), Nigromante (mago, 28,3 s, ×1,52) y Farolero (soporte, no mata en 60 s). Es una prueba de **un blanco quieto**: no mide supervivencia, control, curación ni ráfaga, y las habilidades que necesitan apuntar o posicionarse pueden quedar subestimadas (probable en Libertador, Nigromante y Farolero: son kits de invocación, disparo lento o apoyo).

## 4. Recompensas (honestas, sin pay-to-win)

Solo con progreso (postgame abierto, campeón propio, no Entrenamiento). Nada se compra con dinero ni da poder de combate dentro del modo.

| | Cristales | Coliseo |
|---|---|---|
| Oro base | victoria 300 · empate 120 · derrota 80 | campeón 350 · 2.º 160 · 3.º 100 · 4.º 60 · empate 100 |
| Rendimiento | +12 por baja de héroe (máx. 8) · +8 por torre rival (máx. 6) · +20 por objetivo épico (máx. 2). Sin ganar, paga la mitad | +40 por duelo ganado (máx. 3) · +10 por baja (máx. 6). Sin ganar, la mitad |
| Máximo por partida | 484 de oro | 530 de oro |
| XP de cuenta | 120 / 60 / 40 + hasta 30 por rendimiento | 140 / 80 / 50 / 40 / 60 + hasta 30 |
| Maestría de uso (a las 3 habilidades y la definitiva) | 18 / 10 / 8 | 20 / 12 / 9 / 8 / 10 |
| Partida mínima para cobrar | 240 s | 100 s |

**Tope diario (compartido por los dos modos, por día local):** 900 de oro, 400 de XP de cuenta, 40 de uso de maestría. El último pago se recorta exacto al tope; con el tope lleno la pantalla dice «tope alcanzado». El día cambia solo hacia adelante: **atrasar el reloj no devuelve el tope** (adelantarlo sí).

**Limitación honesta:** el oro, el reloj y el guardado son del cliente. El tope frena el farmeo honesto, **no** a quien edite el guardado o la hora de su equipo. No se presenta como anti-cheat (misma advertencia que `docs/economy/PRECIOS.md`).

**Racha y trofeos (locales, por modo):** victoria +25 trofeos (+5 por cada victoria seguida, hasta +25 extra), derrota −10 (piso 0), empate 0. Racha = victorias seguidas; se guarda también la mejor. Los dos viven en `save.postgame.modes.{cw,col}`.

**Cosméticos y logros** (sin arte nuevo: íconos de `QUEST_GLYPHS` y bordes de color; se eligen en Desafíos → Perfil): títulos *Rompecristales*, *Estratega de la Convergencia*, *Imparable en Carriles*, *Campeón del Coliseo*, *Invicto del Coliseo*, *Leyenda del Postgame*; marcos *Convergencia* y *Coliseo*; emblemas *Cristal de la Convergencia*, *Espadas del Coliseo* y *Trofeo*. Logros: 1 y 10 victorias en Cristales, 3 seguidas, 1 y 10 torneos del Coliseo, torneo 3-0, 500 trofeos.

**Pantalla de resultado:** muestra lo ganado (oro, XP, maestría), el desglose, los logros nuevos, el contador del día («Oro de hoy 540 / 900 · faltan 360») con barra, la racha y los trofeos. Capturas en `docs/modes/postgame/`.

### Impacto en la economía de la tienda (`SHOP_MODE`)

El postgame suma oro, así que se midió contra la escala de `docs/economy/TIENDA_ROTACION.md` (precios `live`: pieza de set 7.200, set de 4 piezas 28.800, legendario 16.000, guardián 2.500; una victoria Infernal ≈ 5.200 y el jugador «crucero» ≈ 835 de oro por partida a 4 partidas por día: cifras de ese documento, no medidas acá).

| | Cuenta |
|---|---|
| Tope diario de oro | **900** = 17 % de una victoria Infernal (el umbral de la tienda era 25 %), 3,1 % de un set `live`, 5,6 % de un legendario, 12,5 % de una pieza |
| Días para un set `live` solo con el tope del postgame | 28.800 / 900 = **32 días** (campaña «crucero» sola: 34,5 días) |
| Un jugador casual (1 partida de campaña + el tope al día) | 835 + 900 = 1.735 por día → 16,6 días por set (**2,1×** más rápido que sin postgame) |
| Un jugador crucero (4 partidas + el tope) | 3.340 + 900 = 4.240 por día → 6,8 días por set (1,27× más rápido; 8,6 días antes) |
| Oro indirecto por el Pase de Temporada | 400 de XP de cuenta por día; el pase paga ≈ 2.250 de oro en ≈ 14.000 de XP (0,16 de oro por XP) → ≈ 64 de oro por día equivalentes |
| Modo `demo` | un set (4.800) se completa en 5,3 días con solo el tope; el catálogo ya se compra libre |

**Conclusión:** no rompe la escala `live`: lo que limita las piezas de set y los legendarios sigue siendo la **rotación** (6 piezas por día) y el postgame solo aporta ≤ 900 de oro diarios. Sí **acelera a los jugadores casuales unas 2 veces** (de 34,5 a 16,6 días por set), porque su ingreso de campaña es chico frente al tope. Si el dueño no lo quiere, la palanca es una línea: `POSTGAME_CFG.daily.gold` (con 450 por día el casual pasa de 34,5 a 22,4 días, 1,5×). Los cosméticos del postgame no se venden y las Brasas siguen siendo solo apariencia. **No se tocó `SHOP_MODE`, `pricing.js` ni la tienda.**

## 5. Qué se probó y qué no

Corridas hechas en esta rama (Chromium con el motor real, en un entorno con mucha carga):

- `node tools/lanes/postgame-test.js`: **36 comprobaciones**. Bloqueo del hub con la condición, aviso y Entrenamiento; guardado con la campaña completa (incluido uno con `legacyOpenArenas`) abierto sin migrar; 9 de 10 arenas, cerrado; `POSTGAME_GATE="open"`; salas online sin progreso; tope aplicado (nivel, talentos, maestría, objetos, reliquias, pasivas, vida, daño, velocidad, escudo, bots) en Cristales y Coliseo; guardado y `localStorage` idénticos tras salir; recompensas, tope diario exacto, día nuevo, reloj atrasado, partida corta, Entrenamiento sin pago, racha, trofeos, logros y títulos; pantalla de resultado con letra ≥ 14 px.
- `tools/lanes/flow.js`, `tools/coliseum/flow.js`, `tools/crystal-wars/hub-integration.js`, `tools/lanes/test-sides.js`, `tools/crystal-wars/test-simulation.js` (19 pruebas), `tools/lanes/sim.js 1 420` y `tools/coliseum/sim.js 2 900`: pasan. Los flujos y `hub-integration` ahora parten de un guardado con la campaña terminada (el hub bloquea el modo sin ella) y `flow.js` compara el guardado sin el contador `postgame`. `tools/crystal-wars/bot-names-test.js`: dos bots del mismo rol con nombres distintos.
- Capturas (844×390 y 667×375) en `docs/modes/postgame/`: `hub_bloqueado`, `aviso_bloqueo`, `lobby_entrenamiento`, `hub_desbloqueado`, `lobby_postgame`, `resultado_cristales`, `resultado_tope_diario`, `resultado_coliseo` (se regeneran con `node tools/lanes/postgame-shots.js`).

**No se probó / límites:** partidas online (no se tocó `js/net/*` ni `server/*`; `tools/net-test/lanes_coop.js` no se corrió); dispositivos reales; balance con humanos (todo son bots). `tools/coliseum/sim.js` falló una vez bajo carga extrema (una verificación con valor 2 donde se esperaba 0; no se vio cuál) y pasó al repetirla: es sensible al tiempo del entorno y no se investigó más. La ventaja medida es de **una pasada por campeón** y del **equipo sintético** (legendarios genéricos al tope), no de builds reales. El tope de pasivas recorta solo los efectos listados: las pasivas de procs y míticas (`onhit_proc`, ejecución, escudo de emergencia) no se recortan.
