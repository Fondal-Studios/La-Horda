# Línea base de interfaz — La Horda (Módulo A, fábrica UI/UX)

Auditoría de la interfaz EXISTENTE, medida (no supuesta) sobre una copia pristina de `main` (commit `e194910b`, "Arte: integrar Axiom y sus skins según el Códice (#245)"), servida desde `/tmp/uf-baseline`. Nada del juego fue modificado.

- Script reproducible: `tools/ui-factory/baseline.js` (re-ejecutable contra otra versión).
- Datos crudos: `docs/ui-factory/evidence/baseline/metrics.json`.
- Capturas: `docs/ui-factory/evidence/baseline/<viewport>/<pantalla>.png`.

```
PHASE=baseline BASE_DIR=/tmp/uf-baseline OUT_DIR=docs/ui-factory/evidence/baseline node tools/ui-factory/baseline.js
# parcial: SECTIONS=load,nav,hud,a11y,shots   TRIALS=3   CHAMPS=mago,ilkan,nigromante   VIEWPORTS=844x390,667x375,1280x800
# contra otra versión: PHASE=despues BASE_DIR=<copia> OUT_DIR=docs/ui-factory/evidence/despues  -> comparar los dos metrics.json
```

## 1. Condiciones de prueba (leer antes de usar cualquier cifra)

| Dato | Valor |
|---|---|
| Navegador | Chromium 153 headless, **sin GPU** (render por software) |
| Máquina | Xeon 2,8 GHz, 4 vCPU, 17 GB RAM, Linux 6.18 (contenedor) |
| Red | loopback `127.0.0.1` (`python3 -m http.server`), sin latencia ni límite de ancho de banda; contexto nuevo cada vez (sin caché), service worker bloqueado |
| Viewports | 844x390 (móvil apaisado, DPR 2, táctil), 667x375 (móvil chico, DPR 2), 1280x800 (escritorio, DPR 1). En escritorio el contexto también tiene táctil habilitado para poder despachar toques CDP |
| Campeones del HUD | mago, ilkan, nigromante (nivel 20, `startRun(3)`, sin enemigos durante los ensayos para que no maten ni suban de nivel) |
| Repeticiones | 3 ensayos por botón y entrada (toque, y mouse solo en escritorio); 3 cargas |
| Entradas | Toque = CDP `Input.dispatchTouchEvent` (touchStart/touchEnd); mouse = CDP vía `page.mouse`; teclado = `page.keyboard` |

**Límites de las cifras:** no es un teléfono real. Los FPS son una cota inferior de software, no representan un móvil. El `event.timeStamp` de eventos sintéticos lo asigna el navegador al procesarlos, no un dedo con pantalla real: las latencias de presión son de la tubería del navegador + el CSS/JS del juego, **no incluyen la latencia del hardware táctil** (típicamente decenas de ms más). El perfil de prueba se arma por código (guardado con campeón, entrenamiento marcado hecho); no es un jugador real.

## 2. Metodología

- **Carga:** `performance.now()` en el momento en que `typeof startRun==='function'` (sondeo cada 5 ms desde un script de inicio) y cuando el botón "Continuar" del título deja de estar deshabilitado; más `navigation`/`resource` timing. 3 corridas.
- **FPS:** 5 s de `requestAnimationFrame` en partida real (con enemigos, 3 aliados bot) tras 1,5 s de asentamiento, a 844x390 con DPR 2 y repetido con DPR 1.
- **Navegación:** perfil con campeón, recarga de página, y toques reales CDP en el centro del botón visible. Un toque nuevo solo cuando la pantalla cambió y pasaron ≥ 520 ms (la ficha de arena descarta toques en sus primeros 450 ms, ver `js/ui/run-intro.js:168`). Excluye carga. **Sin tiempo de reacción humano**: es el piso mecánico.
- **HUD, por botón:** geometría (`getBoundingClientRect`, solapes, `elementFromPoint` para detectar tapado). Latencia de presión: desde `pointerdown.timeStamp` hasta el primer `requestAnimationFrame` donde cambia la firma de estilo computado del botón (clase, transform, filter, box-shadow, borde, fondo, opacidad, pseudo-elementos, hijos). Las propiedades que ya varían en reposo (la animación infinita `hordaEmber` del estado "listo" anima `box-shadow`) se enmascaran. Además una **diferencia real de píxeles** (captura del botón en reposo x2 = ruido, y con el dedo apoyado 220 ms; el canvas del juego se oculta para no contaminar). Estado "mantenido" (700 ms), estados cooldown / sin energía, rechazo (pulsar en cooldown / sin energía), clases tras soltar, y teclado.
- **Accesibilidad:** blancos de toque en 9 pantallas de menú; foco con Tab (firma de estilo con y sin foco); ARIA (botones sin nombre, imágenes sin alt, roles); contraste = cociente WCAG del color del texto contra el fondo muestreado de una captura con el texto oculto (**aproximado**: los fondos tienen degradado/sprites).
- **Capturas:** 13 pantallas por viewport + HUD completo + secuencia del botón de habilidad.

## 3. Métricas medidas

### 3.1 Carga y rendimiento (844x390, DPR 2, headless sin GPU)

| Métrica | Valor medido |
|---|---|
| `startRun` disponible (mediana de 3: 1118 / 1095 / 1133 ms) | **1,1 s** |
| Botón "Continuar" del título habilitado (5355 / 5209 / 4978 ms) | **5,2 s** (el título muestra "Cargando… NN %") |
| `DOMContentLoaded` | 1,44–1,49 s |
| Recursos | 250 (215 scripts), 3,72 MB transferidos (cuerpo) |
| FPS en partida, DPR 2 | promedio **22,2**; p5 **9,1**; mínimo 8,2; 60 de 111 cuadros > 33 ms; 31 > 50 ms (9 enemigos) |
| FPS en partida, DPR 1 | promedio **38,5**; p5 **14,0**; 36 cuadros > 33 ms |

Solo sirve para comparar versiones en esta misma máquina. En un móvil real con GPU y en red 4G el resultado será otro (la carga, peor).

### 3.2 Navegación hasta tener una partida iniciada (844x390, toques reales, sin carga)

| Recorrido | Toques | Botones | Tiempo primer toque → `playing` |
|---|---|---|---|
| Título → hub (informativo) | 1 | `#title-continue-btn` | 0,31 s |
| **Hub → partida** (perfil con campeón, 2.ª partida en adelante) | **3** | `#hub-play-btn` → `#prep-start-btn` ("Comenzar", en la Sala) → `#run-intro .ri-go` ("¡A LA BATALLA!") | **1,77 s** (toques a 0,14 / 0,81 / 1,52 s) |
| Derrota → partida | **1** | `#retry-btn` | 0,37 s |
| Victoria → partida | **no medido de forma fiable** | `#victory-next-btn` | — |

Notas: el atajo "directo a la ficha" (2 toques) existe solo para la primera partida en solitario (`hubSoloDirectDue`, `js/ui/hub.js:100`); desde la segunda, JUGAR pasa por la Sala. En una pasada previa (toques cada 260 ms) el tercer toque cayó dentro de los 450 ms de guarda y hubo que repetirlo: **un jugador apurado puede necesitar 4 toques**. La victoria es de 5 pasos (`VICTORY_STEPS.length = 5`, con ceremonia de botín); forzarla con `showVictoryScreen()` no reproduce el guardado ni el botín reales y el script no llegó a partida en 10 toques: no hay cifra. Por código, desde la victoria harían falta varios "Continuar" + Sala + ficha (estimación, no medida).

### 3.3 HUD en combate

**Geometría (idéntica en los 3 campeones y los 3 viewports; HUD no escala por viewport):**

| Control | Tamaño CSS px | Notas |
|---|---|---|
| Ataque | 72x72 | |
| Habilidades 1/2/3 | 54x54 | |
| Definitiva | 60x60 | |
| Cura / Pacto (nigromante) | 46x46 | |
| Pausa / Sonido | 44x44 | justo el mínimo |
| Joystick (base) | 92x92 | |

Ningún control < 44 px; sin solapes entre cajas; ninguno fuera de pantalla; ninguno tapado (el botón Revivir, contextual, figura "tapado" porque se muestra solo con un aliado caído: no medido). Los círculos de habilidad se separan 8–14 px entre bordes (calculado de las posiciones: s1–s2 68 px entre centros con radios de 27); la "distancia mínima 0" de `metrics.json` es un artefacto de cajas rectangulares.

**Latencia de presión (ms, `pointerdown` → primer cuadro con cambio visible). Mediana [máx.] y detecciones sobre ensayos:**

| Botón | Toque 844x390 | Toque 667x375 | Toque 1280x800 | Mouse 1280x800 | Teclado (tecla) |
|---|---|---|---|---|---|
| Habilidad 1 | 58 [85] 9/9 | 61 [99] 9/9 | 53 [82] 9/9 | 9 | 14–22 ms (`1`) |
| Habilidad 2 | 46 [54] 9/9 | 52 [68] 9/9 | 44 [107] 9/9 | 12 | 22 ms (`2`) |
| Habilidad 3 | 55 [113] 9/9 | 59 [62] 9/9 | 60 [78] 9/9 | 20 | 17–25 ms (`3`) |
| **Ataque** | **no detectable** (2/9, inconsistente) | 2/9 | 2/9 | 0/3 (excepto 1 ensayo de 144) | 15 ms (`Espacio`) |
| **Definitiva** | ~200 (mago/nigro) | ~180–207 | ~233–246 | ~120 | 18–27 ms (`R`) |
| Cura | 4/9 detectados, inconsistente | 4/9 | 5/9 | 1/3 | 5–30 ms (`Q`) |

- La latencia del toque (44–60 ms) es mayor que la del mouse (9–20 ms) en este banco; **no se pudo separar** cuánto es del camino de eventos táctiles de CDP y cuánto del juego: no atribuir esa diferencia a la interfaz sin probar en hardware real.
- **Presión sobre las 3 habilidades:** al presionar con la habilidad lista el botón recibe la clase `aiming` y un cambio de `transform` en el primer cuadro; la diferencia de píxeles con dedo apoyado es 62–80 % del botón (ruido de reposo 0–10 %): feedback claro y consistente.
- **Presión sobre Ataque: sin feedback visible.** Diferencia de píxeles 5,0–5,5 % contra un ruido de reposo igual (mago 5,1/5,1; nigromante 26,1/26,6 por animación propia del botón); las capturas `2b-ataque-reposo.png` y `2c-ataque-presionado.png` son indistinguibles. Causa verificada: la regla `#controls .ability-btn:active` (especificidad 1,2,0, `css/combat-readability.css:86`) pierde contra `#controls #skillzone .ability-btn` (2,1,0, `css/hud-horda.css`); `:active` sí se activa (`matches(':active') === true`) pero no cambia nada visible.
- **Definitiva:** nada visible en el `pointerdown`; el primer cambio aparece ~200 ms después (con la ejecución, la prueba suelta a los 90 ms), cuando la diferencia de píxeles a 220 ms sí es 27–34 %. En Ilkan la definitiva no se pudo ejercitar (la tecla `R` no gastó carga; la transformación es otro mecanismo): **sin dato válido** para ilkan-definitiva.
- **Estado mantenido:** habilidades sí (clase `aiming` + transform mientras se mantiene 700 ms; la ficha de la habilidad se abre a los 480 ms, `ABILITY_INSPECT_MS`); Ataque, Definitiva y Cura no.
- **Cooldown visible:** habilidades sí (clase `cd`, superposición cónica y segundos); Ataque no aplica; Definitiva, no cuenta atrás (usa la carga/anillo `#ult-meter`); Cura/Pacto: **no medido su estado propio** (cargas por nivel / vida llena: solo comprobé que no cambian con cooldown o energía de habilidades).
- **Sin energía:** habilidades sí (clase `noen`, borde discontinuo y marca ✦ pequeña arriba a la derecha; en `5-sin-energia.png` es sutil); distinguible de listo y de cooldown en las 3 habilidades.
- **Rechazo:** pulsar una habilidad en cooldown/sin energía muestra la clase `deny` **al soltar** (~175–190 ms desde el `pointerdown`, con hold de 90 ms), no al presionar.
- **Confirmación de ejecución distinta de la presión:** no hay una animación propia de "éxito": tras soltar la habilidad pasa de `aiming` a `cd`/`active` (el botón cambia a cooldown); el resto de la confirmación vive en el canvas (efectos de la habilidad). `readyPop` solo ocurre al recuperarse la habilidad (cd → listo).
- **Teclado:** responden las 6 entradas con efecto de juego: `1`,`2`,`3` (habilidades), `R` (definitiva; excepto el caso de Ilkan anotado), `Q` (cura), `Espacio` (ataque mantenido); además `F` (pacto), `J`, `Esc/P` por código. El botón recibe la clase `key-press` en 5–36 ms (mediana ~17 ms) en cuadros de este banco.

### 3.4 Accesibilidad y blancos de toque en menús

Blancos interactivos **< 44 px** (en 844x390; CSS px, medido sobre la pantalla visible):

| Pantalla | Controles | < 44 px | Mínimo | Ejemplos |
|---|---|---|---|---|
| Hub | 17 | 4 (24 %) | 44x40 | Botín, ?, Opciones, Volver al título (44x40) |
| Selección de guardián inicial | 5 | 0 | 196x44 | — |
| Guardianes (Códice › Guardianes) | 18 | 18 (100 %) | 42x40 | ‹ Atrás (92x40), chips Quieto/Caminar/Ataque (40 de alto) |
| Inventario | 26 | **26 (100 %)** | **13x13** | casillas de verificación 13x13, "Gestión automática del botín" (19 de alto) |
| Arenas | 12 | 1 | 92x40 | ‹ Modos |
| Tienda | 24 | 21 (88 %) | 82x40 | botones de precio 163x40 |
| Modos | 12 | 7 (58 %) | 92x40 | Unirse/Pegar/Nombre (40–42 de alto) |
| Sala (previa a la partida) | 19 | 16 (84 %) | **57x13** | "Ver habilidades" (13 de alto), chips 40 |
| Códice | 9 | 3 | 92x40 | ‹ Menú, Reliquias Únicas (42), Guía (42) |

En 1280x800 el patrón se repite (inventario 25/26, tienda 26/30, Sala 14/19). La mayoría rozan 40 px (casi); los que importan son los de 13–19 px de alto.

- **Foco visible:** todos los elementos recorridos con Tab (hasta 12 por pantalla; 9 pantallas) muestran un cambio de estilo al recibir foco (0 sin indicador). Hay reglas `:focus-visible` por CSS (p. ej. `css/combat-readability.css:92`, outline 3 px blanco). Alcance limitado: máximo 12 tabulaciones por pantalla.
- **ARIA en menús:** 0 botones sin nombre accesible, 0 imágenes sin alt, 0 elementos `div` con `onclick` sin rol, en las 9 pantallas. Las pantallas no declaran `role="dialog"` ni `aria-label`.
- **ARIA en el HUD (defecto):** las habilidades 1/2/3 y la definitiva son `<div>` con `aria-label` pero **sin `role` ni `tabindex`**; **Ataque, Cura, Pacto, Revivir y el joystick no tienen ni `aria-label`**; el `<canvas id="game">` no tiene etiqueta. Solo Pausa y Sonido son `<button>` con etiqueta. Los botones de combate no se alcanzan con Tab.
- **Contraste (hub, 18 textos en 844x390, 23 en 1280x800):** ninguno por debajo de AA con el fondo promedio y ninguno con el peor 5 % de píxeles. El más bajo: subtítulo del botón JUGAR "con Thalen, el Tejedor Elemental" 15 px: 6,6:1 promedio / 5,2:1 peor (1280x800: 5,8 / 4,8). Aproximado; el emoji 🏚 (sin color de texto real) se excluyó. Tamaños de texto del hub: 14–16 px (subtítulos 14 px).

## 4. Defectos y fricciones

Severidad: crítico (bloquea jugar o rompe el contrato), alto (afecta cada partida o a muchos jugadores), medio, bajo.

| # | Sev. | Hallazgo | Evidencia |
|---|---|---|---|
| 1 | **Alto** | El botón **Ataque** (el más usado) no tiene retroalimentación visual de presión: `:active` se activa pero la regla pierde por especificidad; capturas idénticas; el feedback de combate depende solo del canvas. | `844x390/ability-sequence/2b-ataque-reposo.png` vs `2c-ataque-presionado.png`; `metrics.json › hud.cells[*].buttons.btn-basic` |
| 2 | **Alto** | **Definitiva** sin respuesta en el `pointerdown`: el primer cambio visible llega a ~200 ms (con la ejecución al soltar), vs ~45–60 ms de las habilidades. El control más caro de fallar es el que menos confirma la presión. | `metrics.json › hud` (btn-ult); `844x390/ability-sequence/0-hud-completo.png` |
| 3 | **Alto** | Blancos de toque en menús: Inventario 26/26 controles < 44 px (casillas de 13x13 px, filtros de 19 px), Sala 16/19 ("Ver habilidades" de 13 px de alto), Tienda 21/24, Guardianes 18/18 (40 px), Modos 7/12. | `844x390/inventory-screen.png`, `prep-screen.png`, `shop-screen.png`; `metrics.json › a11y.viewports.844x390.targets` |
| 4 | **Alto** | Carga: el título bloquea "Continuar" (deshabilitado "Cargando… NN %") hasta ~5,2 s aunque el juego ya está usable a ~1,1 s; 250 recursos / 215 scripts / 3,7 MB cargados al inicio. En red móvil real será peor (no medido). | `844x390/title-screen.png`; `metrics.json › load` |
| 5 | **Medio** | Habilidades sin teclado/lector: los botones de combate son `div` sin `role`/`tabindex`; Ataque/Cura/Pacto/Revivir/joystick sin `aria-label`; el canvas sin etiqueta. (Los atajos de teclado sí existen.) | `metrics.json › a11y.viewports.*.hudControls` |
| 6 | **Medio** | Partida repetida desde el hub = 3 toques efectivos y 4 si se toca antes de los 450 ms de la ficha; el atajo de 2 toques solo vale para la primera partida. Pasar por la Sala ("Comenzar") antes de la ficha añade un paso a cada reentrada. Mejor caso medido tras derrota: 1 toque. | `metrics.json › nav.flows` |
| 7 | **Medio** | En 844x390 el botón flotante **"Comenzar"** de la Sala tapa parte del panel inferior (texto cortado) y, en la **Pausa**, "Continuar" flotante tapa el texto de la ficha de habilidades; la pausa abre con una ficha de kit densa y los controles de audio/opciones quedan fuera del primer pantallazo. | `844x390/prep-screen.png`, `844x390/pause-screen.png` |
| 8 | **Medio** | Rechazo de habilidad (cooldown/sin energía) solo se muestra al soltar (~180 ms); en presión no hay señal de "no disponible". | `metrics.json › buttons.*.touchWhileCooldown` |
| 9 | **Medio** | Estado "sin energía" muy sutil: marca ✦ pequeña en la esquina + borde discontinuo (se distingue de cooldown y listo, pero cuesta verlo en movimiento). | `844x390/ability-sequence/5-sin-energia.png` |
| 10 | **Medio** | Rendimiento: 22 fps promedio (p5 9 fps) a DPR 2 y 38 fps a DPR 1 en este banco por software; el costo escala con los píxeles. No concluyente para móviles reales, pero es la referencia a no empeorar. | `metrics.json › load.fps`, `load.fpsDpr1` |
| 11 | **Bajo** | Mínimo exacto de 44 px en Pausa y Sonido (sin margen) y 46 px en Cura/Pacto (< 48 px habituales en guías móviles); círculos de habilidad separados 8–14 px. | `metrics.json › hud.cells[*].geometry` |
| 12 | **Bajo** | Hub: 4 botones superiores de 44x40 (altura 40 < 44). | `844x390/mainmenu-screen.png` |
| 13 | **Bajo** | Pantalla del Códice: título "CÓDICE" duplicado (pequeño a la izquierda y grande al centro) y chip "Reliquias Únicas" a todo el ancho encima del título. | `844x390/codex-screen.png` |

No son defectos (medido): contraste del hub sin fallos AA; foco visible presente; menús sin botones sin nombre; HUD ≥ 44 px, sin solapes ni controles fuera de pantalla en los 3 viewports y 3 campeones; las 3 habilidades tienen presión, mantenido, cooldown, sin energía y teclado funcionales.

## 5. Lo que NO se pudo medir y por qué

- **Latencia táctil real de extremo a extremo** (dedo → píxel): requiere cámara de alta velocidad o un dispositivo con herramientas de medición; aquí solo hay eventos sintéticos CDP.
- **FPS y carga en móviles reales o con GPU, y en redes 3G/4G:** el banco es headless por software y loopback.
- **Retención, abandono, tiempo de primera sesión o satisfacción:** no hay telemetría ni jugadores; no se inventa ninguna cifra.
- **Victoria → nueva partida:** el recorrido real incluye una ceremonia de botín y guardado de servidor; la victoria forzada por código no es representativa.
- **Estado propio de Cura/Pacto/Revivir** (cargas, vida llena, aliado caído) y Revivir en general: contextuales; solo medí geometría y presión de Cura/Pacto.
- **Definitiva de Ilkan:** el script no logró ejercitarla (mecanismo de transformación); sin dato.
- **Lector de pantalla real (TalkBack/VoiceOver/NVDA):** no automatizable aquí; solo se auditó el DOM (roles, etiquetas, foco).
- **Contraste exacto:** aproximado por muestreo de píxeles; los fondos con degradado/sprites pueden variar por zona.
- **Modos online/cooperativo, Guerra de Cristales, Coliseo, Horda Infinita:** fuera del alcance de esta línea base.
- **La presión en `pointerdown` de la Cura** dio 4–5 detecciones de 9 con valores dispersos (46–400 ms): no concluyente.
- Los toasts de logros pueden ensuciar capturas: se evitó desbloqueando solo 3 campeones en el perfil de prueba.

## 6. Reproducir y comparar

`tools/ui-factory/baseline.js` escribe todo en `OUT_DIR/metrics.json` (estructura: `load`, `nav`, `hud.cells[]`, `a11y.viewports`, `shots`). Una corrida completa tarda ~20 min. Para una comparación antes/después, ejecutar el mismo comando con `PHASE=despues` y otra `BASE_DIR`/`OUT_DIR`, en la misma máquina y sin otra carga concurrente (la latencia y los FPS dependen de la CPU del banco).
