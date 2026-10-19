# Guerra de Cristales y Coliseo — versión vigente

Un solo documento, una sola versión. Las reglas están verificadas contra el código (`js/arenas/lanes/`, `js/arenas/coliseum/`) y las constantes se leen de `LANES` y `COL`. El historial de cómo se llegó acá (simulador CW-1/2/3, mapa de un carril, dos carriles) está en git: **no rige nada de eso**. Estado: Alpha.

Los dos modos son **contenido de postgame**: usan la progresión de campaña (con tope) y se abren al terminar la campaña. Progresión, bloqueo, Entrenamiento y recompensas: [`POSTGAME.md`](POSTGAME.md).

## Cómo entrar

Hub → **MODOS DE POSTGAME** → *Guerra de Cristales* o *Coliseo* (también desde Multijugador → Modos). Es una pantalla del propio `index.html` (state `crystalwars`); el enlace de invitación es `index.html?cw=1&room=ABC123[&server=…]` y `crystal-wars.html` solo redirige ahí.

- **Campaña sin terminar:** la tarjeta se ve bloqueada («Se abre al terminar la campaña») y ofrece **Entrenar**: campeón normalizado contra bots, sin progreso ni recompensas.
- **Campaña terminada:** se entra directo. *ENTRENAR CON BOTS* usa tu campeón con tope de progresión; la casilla «Entrenamiento normalizado» lo apaga.
- **Salas privadas (online):** siguen disponibles siempre y **normalizadas** (nivel fijo, sin equipo ni talentos, sin recompensas). No dependen del postgame.

PC: WASD/flechas, habilidades 1–4, `B` vuelve a la base (solo Cristales). Táctil: joystick y botones de habilidad. El ataque básico es automático.

## Guerra de Cristales (`js/arenas/lanes/`)

MOBA 2D de tres carriles en el **motor real de la campaña**: mismos campeones, habilidades, HUD y controles. 5 contra 5 contra bots en solitario; **2 contra 2 en línea** (el relay admite 4 humanos).

- **Mapa** 6400 × 4800 con tres carriles (arriba, medio, abajo), selva, un río en diagonal y dos bases: Zafiro (abajo a la izquierda, equipo 0) y Ámbar (arriba a la derecha, equipo 1).
- **Estructuras:** 9 torres por equipo (3 por carril: exterior 2.200, interior 2.600, inhibidora 3.000 de vida) y un cristal de 2.600. Dentro de un carril se derriban en orden; las demás están protegidas. El cristal queda **expuesto** cuando cae la inhibidora de cualquier carril. Las torres disparan primero a la horda rival y después a los héroes.
- **Horda por carril:** la primera oleada sale a los 14 s y luego cada 32 s, por cada carril: 3 esqueletos, 2 cristales voladores y, cada tres oleadas, un coloso de asedio. Hasta 130 criaturas por equipo. Pelean contra la horda rival, atacan héroes cercanos y derriban estructuras.
- **Cartas de horda:** cada nuevo nivel máximo del equipo (una sola vez aunque varios héroes lo alcancen) ofrece 1 carta de 3 que potencia **a tu horda** (vida, daño, velocidad, cantidad, asedio, colosos, ritmo, regeneración; hasta 12). Si nadie elige, se elige sola a los 15 s (bots, a los 2,5 s).
- **Selva:** 8 campamentos (lobos, bestias, escorpiones y un Gigante que da +12 % de daño) que reaparecen a los 75 s, y dos objetivos épicos desde el minuto 4: **Dragón de Piedra** (+10 % de daño al equipo) y **Rey Coloso** (dos oleadas con un coloso extra por carril); reaparecen a los 5 min.
- **Niveles de partida 3 → 15** por experiencia (súbditos, campamentos, héroes, torres; se reparte entre los héroes cercanos). Cada nivel sube vida, daño y defensa con la curva de la campaña (`computePlayerStats`).
- **Oro y objetos:** cada héroe cobra oro (pasivo, súbditos, bajas, torres, épicos) y lo gasta **en su base o estando caído**: Hoja de Ceniza (+9 % daño), Coraza de Hueso (+10 % vida), Botas del Errante (+7 % velocidad), Ariete de Hierro (+25 % a estructuras), Savia Viva (curación), tres niveles cada uno. Pedidos de equipo desde donde estés: reparar (+260), barrera (+200), enviar acechadores o un coloso. Máximo 3.500 de oro.
- **Volver a la base (B):** se canaliza 5,5 s y se corta si te movés, lanzás algo o te golpean. Reaparición de 6 s + 1,4 s por nivel + 1,5 s por minuto (tope 45 s).
- **PvP:** permitido. Cada héroe tiene un *avatar* invisible dentro de `enemies`; como todas las habilidades golpean a `enemies`, **los campeones funcionan en PvP sin tocar ningún kit**. El daño del avatar se pasa al héroe real (`lanesSync`) escalado por `LANES.PVP_DMG` (0,7) y nadie pierde más del 40 % de su vida por segundo (`LANES.PVP_BURST`). Mientras un héroe lanza algo, `heroes`/`allies` son solo su equipo y `enemies` solo sus rivales (`lanesTeamCall`). Sin fuego amigo.
- **Final:** gana quien derriba el cristal rival. **Eclipse** a los 13 min (los dos cristales se apagan cada vez más rápido); a los 18 min decide el que tenga más torres y vida (empate explícito si coinciden).
- **Bots** por rol (medio, abajo ×2, arriba, selva): acompañan el frente de su horda fuera del alcance de torres, retroceden heridos y el de la selva limpia campamentos; estados retirada / defensa / objetivo / empuje (`docs/competitive/BOTS_VICTORIA.md`).
- **HUD:** marcador con torres en pie, mapa completo en miniatura, carta de horda, tienda y registro. Letra ≥ 14 px, botones ≥ 48 px.

## Coliseo (`js/arenas/coliseum/`)

**Torneo de 8 luchadores: cuatro equipos de dos.** En cada ronda se juegan **dos duelos 2 contra 2 a la vez**, en dos fosos del mismo mundo: el tuyo es siempre el A; el B lo juegan los otros dos equipos. No es un todos contra todos de cuatro bandos (2v2v2v2 simultáneo): cada duelo enfrenta a dos equipos.

- **Emparejamientos** (se repiten): ronda 1 → tu equipo vs equipo 1 y equipo 2 vs equipo 3; ronda 2 → 0 vs 2 y 1 vs 3; ronda 3 → 0 vs 3 y 1 vs 2.
- **Punto:** gana el duelo el equipo que deja al rival sin nadie en pie (a los 80 s, el de más vida; si empatan, nadie suma). **1 punto por duelo; el primero a 3 gana** (tope 9 rondas; desempata por bajas de héroes).
- **Fases por ronda:** cuenta regresiva de 4,5 s (héroes quietos e invulnerables) → pelea (80 s; desde los 28 s **el anillo se cierra** y fuera de él se pierde vida) → resultados de 5,5 s. Sin reaparición dentro de la ronda.
- **Espectador:** si caés, la cámara sigue a tu compañero o a otro luchador (‹ ›), «OTRO DUELO» salta al otro foso y un mapa muestra los dos fosos.
- **Campeones:** los de la campaña con sus habilidades; el PvP es el mismo de Cristales (avatares + `lanesTeamCall`). Nivel fijo 10 para todos (en postgame, el del jugador con tope de progresión).
- **Online:** todavía no. El relay admite 4 humanos y el netcode une cada héroe a un slot; el torneo de 8 se juega contra bots. Próxima fase: luchadores «virtuales» para que los invitados vean los dos fosos.

## Equipos claros: aliado / enemigo / neutral

Convención única en Cristales y Coliseo (`js/arenas/lanes/lanes-sides.js`, tokens `--ally/--enemy/--neutral/--self` en `css/ui-kit.css`): aliado verde con marco liso y escudo; enemigo rojo con marco grueso y muescas y espada; neutral (selva, Dragón, Rey Coloso) ámbar punteado; «yo» verde brillante con borde blanco. Aplica a barras, rótulos, aros, disparos de torre, minimapa, marcador y registro; el color de EQUIPO (zafiro/ámbar) se conserva en cuerpos de torre y bases. El punto de vista es el del equipo del jugador (o del luchador que mira la cámara si es espectador). Una paleta para daltónicos solo debe sobrescribir los tokens. Capturas en `docs/production/art-unification/equipos-claros/`.

## Identidad visual del mapa

Zonas con identidad (Bosque Ancestral, Jungla Volcánica, Pantano Cristalino, Necrópolis, bases, río y La Convergencia), suelo horneado por trozos y minimapa con leyenda; geometría y colisiones sin cambios. Detalle, costo por cuadro y pendientes de arte humano: `docs/production/art-unification/cristales-identidad/README.md`.

## Qué es confiable y qué no

- La simulación corre en el **anfitrión / el dispositivo**. El oro, el reloj y el guardado son del cliente: este modelo **no sirve** para premios monetarios, clasificaciones verificadas ni anti-cheat competitivo (eso exige simulación y validación en servidor). Las recompensas de postgame tienen tope diario por esa razón (ver `POSTGAME.md`).
- Los bots miden el modo, **no** a jugadores humanos: el equilibrio entre kits en PvP no está afinado. La prueba informativa `tools/lanes/ttk-gate.js` lista los campeones fuera de ±50 % de la mediana de su rol (no bloquea ni toca campeones).
- No hay cola pública ni matchmaking (salas por código), ni ranking verificado.
- Pendiente de la fase Wild Rift: arbustos y visión, pings, hechizos de invocador, más variedad de súbditos, 3v3/5v5 en línea.
- `?legacy=1` conserva el simulador viejo de cuatro roles (`js/modes/crystal-wars/`, 15 bajas) solo como respaldo de salas privadas; no es el modo vigente.

## Pruebas

```sh
node tools/lanes/flow.js            # Cristales por la interfaz (844×390 y 667×375): hub → lobby → partida → tienda → resultado → revancha
node tools/coliseum/flow.js         # Coliseo por la interfaz: hub → torneo → espectador → resultado → revancha
node tools/lanes/sim.js 1 420       # partida completa de Cristales sin interfaz (sin NaN, sin fuego amigo, cartas, selva, guardado restaurado)
node tools/coliseum/sim.js 2 900    # torneos completos (puntos coherentes, protección en la cuenta regresiva, cámara, guardado)
node tools/lanes/test-sides.js      # convención aliado/enemigo/neutral con píxeles reales
node tools/lanes/postgame-test.js   # bloqueo/desbloqueo, tope de progresión, guardado intacto, recompensas y tope diario
node tools/lanes/ttk-gate.js        # INFORMATIVA: tiempo para matar por campeón y rol (fuera de ±50 % de la mediana)
node tools/crystal-wars/hub-integration.js   # tarjetas del hub (≥ 44 px) e ida y vuelta
node tools/crystal-wars/test-simulation.js   # simulador viejo (respaldo)
node tools/lanes/kits.js            # los campeones con todas sus habilidades en el centro del mapa
node tools/net-test/lanes_coop.js   # 2 clientes reales con relay (online)
```
