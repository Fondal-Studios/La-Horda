# Beta Visual Impact — Vertical Slice (Ruinas Élficas · Sylva)

Rama: `claude/la-horda-beta-visual-impact-jze96f` (el encargo la llamó `feature/beta-visual-impact`; se trabajó en la rama
designada por el entorno). **No se fusionó a `main`. Pendiente de aprobación.**

## Qué es
Un slice jugable que sube la calidad percibida en los primeros 30 segundos, sobre un campeón y una arena **ya existentes**:

| Elección | Por qué |
|---|---|
| Arena: **Ruinas Célticas/Élficas** (`bosque`, Arena 03) | Su atlas de arte (`assets/sprites/arenas/world-v1/bosque.png`: menhires rúnicos con 4 estados, árboles, arbustos) ya está integrado según el Códice (#244). No se pintó arte nuevo. |
| Campeón: **Sylva, la Cazadora del Bosque** (`cazadora`) | Es la guardiana "de las Ruinas" en el lore (`champion-identity.js`), tiene arte propio animado y sus efectos ya pasaron `tools/vfx/check-cazadora-loading.js`. No se agrega ningún campeón: el flujo de `AGENTS.md` para campeones nuevos no aplica y `knownChampions` no se toca. |

## Los cinco pedidos

| # | Pedido | Qué se hizo | Archivo |
|---|---|---|---|
| 1 | Entrada con campeón animado y acceso rápido | Título nuevo: telón de Ruinas armado con el atlas real en capas (copas en silueta, niebla, menhires cian/ámbar que respiran, anillo rúnico, haces de luz), Sylva grande con ciclo reposo → paso → ataque (animación real del juego) y **JUGAR AHORA**: un toque arranca la partida en Ruinas. El botón clásico queda como "Tocá para continuar" (menú completo). Pasa por `accountGate()` si no hay sesión. | `js/beta/beta-ui.js`, `css/beta-visual.css` |
| 2 | Feedback táctil de habilidades | Pulsación con squash + anillo de lanzamiento + onda desde el dedo + vibración; rechazo con sacudida cuando está en recarga o sin energía; anillo extra al volver a estar lista. | `js/beta/beta-ui.js` |
| 3 | Impacto de combate | Golpes: chispas direccionales según la fuerza, tajo, destello en cruz (críticos en dorado). Muerte: almas que suben, anillo, rayos de suelo en élites/jefes. Definitiva: viñeta del color del héroe, líneas de velocidad, letterbox, 3 anillos, columna de luz. Daño recibido: borde rojo del lado del golpe. Caída: desaturación + viñeta oscura. | `js/beta/beta-combat.js` |
| 4 | Arena enriquecida | Piedras rúnicas que se encienden en cadena al empezar, niebla baja, sombras de copas ancladas al mundo, foco de luz sobre el héroe, polen/luciérnagas, viñeta propia, y **peligros legibles** (borde ámbar/rojo + rayado + cuenta regresiva: la Raíz era verde sobre bosque verde). | `js/beta/beta-arena.js` |
| 5 | Botín por rareza | Caída con anillo/chispas/columna según rareza, **sello en el piso con forma propia por categoría** (no depende del color), órbita de motas, cartel para Legendario o más, destello de pantalla desde Mítico. | `js/beta/beta-loot.js` |

Aparición del héroe al empezar (círculo de luz que revela la escena, columna de luz, runas que se encienden): `beta-combat.js` (`startRun`).

## Arquitectura y límites (cumplimiento del encargo)

* **No se modificó ningún contrato compartido ni el relay** (`server/`, `js/net/*`, formatos de guardado, `CLASSES`,
  `ENEMY_BASE`, `GROUND_LOOT_CFG`, `AIM_PROFILES`). `git diff main --stat` solo toca `index.html` (7 líneas: 1 hoja de
  estilos y 5 scripts), archivos nuevos en `js/beta/`, `css/beta-visual.css`, `tools/beta/` y `docs/beta/`.
* **Aditiva y apagable.** Se engancha envolviendo funciones globales existentes (mismo patrón que `tools/ux/playtest.js`):
  `impactFeedback`, `killEnemy`, `castAbility`, `damageHero`, `startRun`, `aidGrade`, `drawScreenFeedback`,
  `groundLootDrop`, `groundLootDrawGround`, `groundLootPick`. `?beta=0` la desactiva completa (probado).
* **RNG privado.** La capa usa `brand()` (Mulberry32) y no consume `Math.random` de la partida
  (convención de `docs/production/audio-rng-isolation.md`). `tools/beta/test-rng-isolation.js` corre la misma semilla con
  `?beta=0` y `?beta=1`, con `update()+render()` por paso y los enganches ejercitados, y exige igualdad de bajas, vida,
  daño, habilidades, botín y **estado del RNG**.
* **Solo cosmética.** Nada cambia daño, tiempos de simulación, hit-stop, hitboxes ni probabilidades. En red no se envía nada
  nuevo (todo es local a cada pantalla, igual que `feedback.js`/`juice.js`).
* **Accesibilidad.** Respeta `JUICE.reduceMotion` (sin letterbox, sin vibración, sin animaciones de botón),
  `reduceFx` (`fxBudget`) y `vfxLoad` (presupuesto de partículas por carga). El peligro se distingue por rayado y arco, no por color.
* **Una excepción de balance, acotada a la demo.** En la partida rápida del título (`BETA.demo`), la 5.ª baja suelta un
  objeto Raro como mínimo y la 11.ª un Muy Raro (mismo `groundLootDrop`, con su pity y su piso). Sin esto, un común suelta
  botín con 0,5 % y la rareza no se vería en 30 s. Fuera de la demo, el botín es el de `main`. **Decisión pendiente para
  S0C/economía:** si se quiere conservar un primer botín garantizado en producción.

## Coordinación con S0C y la UI Factory — estado real
En este repositorio **no hay documentos, issues ni código de S0C ni de una "UI Factory"** (se buscó por nombre en todo el
árbol), y esta sesión no tiene canal para hablar con ellos. Por eso:

* **UI Factory:** el kit de UI existente es `css/ui-kit.css` (+ `js/core/prefs.js`). La capa **reutiliza** sus tokens
  (`--ui-*`, `--ember*`), las clases `.ui-tag`/`.btn`, `hapticPulse()` y `PREFS.vibrate`, y **lee** el estado de los botones que
  ya decide `js/ui/hud.js` (`ready/cd/noen`, `ready-pop`, sonido `ready`): no duplica lógica de estados ni de sonido.
* **S0C (arquitecto):** no hubo aprobación humana de S0C. Dependencias que se le **elevan** para decisión:
  1. ¿Se aceptan los enganches por envoltura (`betaWrap`) o se prefieren puntos de extensión explícitos (`window.HordaHooks`)?
  2. ¿El botín de muestra de la demo (arriba) pasa a producción o queda solo en la demo?
  3. Sylva + Ruinas como pareja de la "primera partida rápida": ¿se mantiene al integrar el flujo de cuentas/entrenamiento?
  4. Arte: la pantalla de título usa el atlas de arena como telón (no hay un fondo de título dedicado en el Códice).
* Nada de lo anterior se fusiona sin su visto bueno.

## Cómo probarlo
```bash
python3 -m http.server 8000          # y abrir http://localhost:8000      → versión beta (por defecto en esta rama)
                                     #     http://localhost:8000/?beta=0  → comportamiento de main
node tools/beta/test-beta.js                 # 23 chequeos funcionales/táctiles/no-regresión
node tools/beta/test-rng-isolation.js 30     # la capa no altera la partida (misma semilla, beta=0 vs beta=1)
node tools/beta/capture.js --target beta --base <url> --out <dir> [--video]   # mismo guion en main y en la rama
node tools/beta/perf.js --main <worktree-de-main>                              # costo de render() y cuadros reales
```
