# QUALITY_SCORECARD — Gate 1 (Módulo D, evaluador independiente) · Iteración 2

Candidato: HEAD de `feature/beta-ui-ux-factory` (`758ce1ec`, «UI Factory iter 2») contra línea base `e194910b`. Re-ejecuté todos mis scripts (`tools/ui-factory/eval/`) contra candidato y base; evidencia en `docs/ui-factory/evidence/eval2/`. Lo que declara el productor no cuenta como evidencia: solo lo medido aquí. La iteración 1 queda al final (sección «Historial»).

## 1. Decisión

**Gate 1: CORRECCIONES OBLIGATORIAS (83 / 100; rango 80–89). No es candidato a aprobación (≥ 90).**
Las 6 condiciones obligatorias pasan (la de superposiciones con reserva). Los defectos de iteración 1 R2–R5, R7, R10 quedan resueltos y R1 mejora mucho; quedan 6 rechazos menores, uno de ellos medio (nota online oculta).

## 2. Puntaje

| Criterio | Máx. | It.1 | It.2 | Justificación (cifras mías) |
|---|---|---|---|---|
| Coherencia artística | 20 | 14 | 16 | Marcador ▸/▾ restituido en todos los desplegables (Inventario, Sala; `menus/cand_844x390_inventario.png`, `pause/cand_844x390_prep-desplegado.png`). Botón no disponible presionado ahora se apaga en vez de iluminarse. Pausa en dos columnas coherente con el kit visual. Descuentos: casilla del lobby de Cristales se deforma en un rectángulo ancho (`menus/cand_844x390_cristales.png` vs `base_`); barra degradada de «Comenzar» sigue tapando parte del panel siguiente. |
| Usabilidad y navegación | 20 | 14 | 17 | Blancos < 44 px: **276 → 3** (844x390), 275 → 3 (667x375); con táctil emulado en 1280x800: 260 → 5. «Abandonar arena» pasa de **fuera de pantalla** (base: 42 px, BLOCKED en 844/667/932) a visible y tocable en 3/3 viewports y 4 escenarios reales (solo, online, zurdo, texto grande). Hub→partida: igual (3 toques). Descuentos: pausa en 1280x800 sigue con Continuar/Abandonar bajo el borde (igual que la base); Sala crece de 552 a 593 px de scroll; legales del título siguen en 26 px. |
| Ergonomía del HUD | 20 | 15 | 18 | 240/240 presiones con cambio visible síncrono (base 42/240). Rechazo al presionar ahora en Definitiva sin carga (3/3 uf:reject en estado «sin carga», 2/3 en cd) y Curación sin cargas o con vida llena (3/3). Confirmación por verdad de terreno: tap y mantener ≤ 400 ms 6/6 con ejecución real, 0 falsos (la «energía se agota» ya no confirma), Nigromante-Definitiva por toque confirma. Tamaños del HUD sin cambio (Pausa/Sonido 44, Cura 46). Descuento: `btn-pact` y `btn-revive` no ejercitados; el Ataque confirma por `basicCd` aun sin enemigos (aceptable). |
| Claridad y accesibilidad | 15 | 12 | 13 | `role`, `aria-label`, `aria-disabled` y `aria-keyshortcuts` (Space, 1, 2, 3, R, Q, F) en los botones; `aria-disabled` pasa a `true` en Definitiva sin carga y Curación no usable. Reducir movimiento: `scale:1` medido. Descuentos: la nota de la pausa se oculta (R-C1) y los enlaces legales siguen 26 px. |
| Rendimiento y estabilidad | 10 | 9 | 9 | Sin diferencia fuera del ruido (§4); 66 s sin crecimiento. |
| Onboarding y retención potencial | 15 | 9 | 10 | No mido retención. Mejora acotada: con la pausa reorganizada los 4 controles entran sin desplazar; flujo y primer minuto sin regresión (suites OK). |
| **Total** | 100 | 73 | **83** | 16+17+18+13+9+10 |

## 3. Condiciones obligatorias

| Condición | It.1 | It.2 | Evidencia |
|---|---|---|---|
| Cero superposiciones críticas | FAIL | **PASS (con reserva)** | Pausa: 0 solapes y 0 controles bloqueados en 844x390, 667x375, 932x430 con 4 escenarios (`pause/cand_pause.json`, todos `inViewport` + `reachableAtCenter`; Continuar devuelve a `playing`). Sala: «Comenzar» ahora es barra inferior con degradado y al final del scroll nada queda tapado (`lastContentBottom` 382–422 ≤ alto), pero **a scroll 0 la barra aún cubre 16–29 px de «Equipo, talentos y progresión» (844, 932) o del selector de campeón (667x375)** y en 932x430 el centro del resumen queda bloqueado (`sala-scroll0.json`, `pause/cand_932x430_prep-scroll0.png`). No es crítico (elemento secundario, alcanzable con medio pantallazo de scroll; base: 26 px) pero no es cero. Título: «Instalar en mi dispositivo» × legales, 6 px (igual que la base). |
| Cero botones principales inoperantes | PASS | PASS | Combate 6/6 con toque, mouse y teclado; Continuar/Abandonar con hit-test OK. |
| Cero regresiones críticas de gameplay | PASS (con reservas) | **PASS** | `t_snapshot`: 887 bindings, solo cambia hash del DOM; `t_drag_aim` 12/12 candidato y 12/12 base; **`t_det`: las 5 diferencias del digest `save` aparecen idénticas al comparar base contra base (`compare_det_base-vs-base.txt`: mismas 5 partidas): es ruido de la prueba, no del candidato** (candidato vs base: 28/33 idénticas + esas mismas 5). `t_func` sigue sin ser concluyente (falla igual en ambas, no repetido). |
| Feedback visual en TODOS los botones de combate | PASS | PASS | `hud-cand.json`: basic/s1/s2/s3/ult/emerg, 3 campeones; cambio de píxeles 35–83 % (≥ 35 % también en cooldown/sin energía, ahora apagado) vs ruido 0–33 %; 0 estados pegados en 240 ensayos y en estados raros. |
| No empeorar navegación hub→partida | PASS | PASS | 3 toques idénticos (`#hub-play-btn`, `#prep-start-btn`, `#run-intro .ri-go`); ms 3 corridas: base 2119 / 2135 / 2077, cand 2464 / 2075 / 1922 (la 1.ª, primera tras arrancar, es atípica; mediana 2075 vs 2119). |
| Pruebas automatizadas obligatorias | PASS | PASS | 8 suites `tools/ux` rc=0 (`eval2/suites/cand-summary.txt`). |

## 4. Antes / después (mis cifras; headless sin GPU)

| Métrica | Base | Cand. It.1 | Cand. It.2 |
|---|---|---|---|
| Blancos < 44 px (18 pantallas, 844x390) | 276 | 5 | **3** |
| «Abandonar arena» visible sin scroll (844/667/932) | no (0/3) | no | **sí (3/3)** |
| Pausa: alto de scroll 844x390 / 667x375 | 1639 / 1735 | – | 633 / 737 (el panel táctico tiene su propio scroll) |
| Presión visible síncrona | 42/240 | 240/240 | 240/240 |
| Código→primer cuadro visible, mediana (máx) ms | 5 | 4 (15) | 5 (17; teclado máx. 42) |
| Demora del navegador hasta el handler (táctil, mediana) | 52 | 39 | 56 (corrida con otras pruebas en paralelo; igual en base 52) |
| Rechazo al presionar Definitiva sin carga / Curación inválida | 0 | 0 | 2–3/3 |
| Confirmación falsa (energía se agota) | n/a | sí | **no** |
| FPS 844x390 mediana (3 corridas; 2.ª tanda de 4) | 21,3 (22,2) | 22,0 | 21,4 (21,9); `?uf=0` 20,7 (17,5) |
| FPS 1280x800 mediana | 24,1 (22,8) | 26,3 | 26,4 (22,1) |
| Script CPU 8 s (ms) | 3634–3819 | 3683–3800 | 3624–3986 |
| Fugas en 66 s | 18 intervals, 6016 listeners, 2608 nodos | 19 / 6025 / 2612 | 19 / 6025 / 2612, heap 27–46 → 27 MB |
| `startRun`, mediana ms 844x390 | 1344 (1.ª tanda) | 1261 | 1555 (1.ª tanda) |
| «Continuar» habilitado, mediana ms | 6760 | 5942 | 6128 (1.ª tanda); 2.ª tanda base 9277 / cand 8202: ruido |

Las dos tandas de rendimiento tienen ±20–40 % de dispersión (CPU saturada, la 2.ª con valores atípicos de 12–28 s en la primera repetición): **no distingo mejor ni peor**; concluyo «no peor medible».

## 5. Veredicto sobre las declaraciones del productor

- R1 Sala/Pausa: **Pausa resuelta** (ver §3). **Sala resuelta a medias** (barra con degradado; a scroll 0 aún tapa 16–29 px).
- R2 marcador propio: **confirmado** (▸ cerrado, ▾ abierto en Sala/Inventario).
- R3 rechazo Definitiva/Curación: **confirmado** (`uf:reject` presente, `aria-disabled=true`).
- R4 confirmación por verdad de terreno: **confirmado** (`confirm-hold-cand.json`: confirm en 6/6 ejecuciones ≤ 400 ms, ninguno cuando no se ejecutó; «energía agotada» sin confirm falso; Nigromante por toque sí confirma).
- R5 apagado al presionar no disponible: **confirmado** (`montage`/`hud-cand.json`: press% 36–55 % en cd/noen con filtro gris).
- R6 sliders: **confirmado** (150x44). Legales del título: **NO resuelto** (siguen 26 px; la regla `.legal-foot a` no surte efecto en `#legal-title`).
- R7 sin `tabindex`: **aceptable**. Los atajos de teclado reales (Espacio, 1-3, R, Q, F) son la vía de operación por teclado y se anuncian con `aria-keyshortcuts`; poner `tabindex` sin manejar Enter/Espacio crearía un falso botón enfocable que no hace nada (y Espacio ya ataca). Residual bajo: no hay foco de lector de pantalla en el HUD.
- R8 mínimos solo con `pointer:coarse` o `max-height:520px`: **aceptable para la meta táctil con una salvedad**. Medido con un contexto sin táctil (`menus-mouse/`): en 1280x800 con mouse el candidato es **idéntico a la base** (260 → 260 blancos, mismas casillas 13/24 px, sin regresión). Con táctil habilitado (tablet/híbrido con puntero primario táctil) sí se aplican (260 → 5). Quedan fuera los portátiles con pantalla táctil cuyo puntero primario es el mouse: conviene `any-pointer:coarse` (R-C6).
- R10: **resuelto** (ruido de la prueba, ver §3).

## 6. Rechazos restantes

| # | Hallazgo (reproducible) | Sev. | Clase | Archivo / selector |
|---|---|---|---|---|
| C1 | La pausa oculta `.pause-note` en pantallas bajas: en **partida online** desaparece el aviso «La partida sigue: en multijugador nadie se pausa» (solo queda el título «Panel táctico»); el jugador puede creer que el juego está en pausa mientras lo atacan. Reproducir: `netMatch={fake:1}`, pulsar Pausa a 844x390 (`pause/cand_844x390_online.png`, `pause/cand_pause.json` `noteVisible:false`). En solo se pierde el texto «Partida en pausa». | Media | REPAIR | `css/ui-factory/menus-touch.css` `#pause-screen .pause-note{display:none}`; mostrar una línea compacta al menos con `.tactical-live` |
| C2 | Sala a scroll 0: la barra de «Comenzar» cubre 16–29 px del panel/selector siguiente; en 932x430 el centro del resumen queda bloqueado. | Baja | REPAIR | `#prep-screen` (`padding-bottom` del contenido o barra en flujo); `sala-scroll0.json` |
| C3 | Enlaces legales del título 26 px y su hitbox pisa 6 px a «Instalar en mi dispositivo». | Baja | REPAIR | `#legal-title a` (la regla `.legal-foot a` está en un `@media` y no pisa la especificidad de `css/legal.css`) |
| C4 | Casilla del lobby de Cristales deja de ser un cuadrado y pasa a un rectángulo ancho (`menus/cand_844x390_cristales.png`); el selector «Modo competitivo» sigue cortando el texto («Convergencia – G») como en la base. | Baja | REPAIR | `.screen.screen input[type=checkbox]` vs ancho 100 % del formulario de `crystalwars`; añadir `width:44px` con mayor especificidad |
| C5 | `summary` del hub (555x32) y de Cristales (422x28) siguen < 44 px en 1280x800 táctil. | Baja | REPAIR | reglas `details>summary` específicas del hub |
| C6 | Mínimos de 44 px dependen de `pointer:coarse`: híbridos con mouse como puntero primario no los reciben. | Baja | REPAIR | `@media (pointer:coarse), (any-pointer:coarse), (max-height:520px)` |
| C7 | Pausa en escritorio 1280x800: Continuar/Abandonar quedan bajo el borde (necesita scroll); heredado de la base, no empeora. | Info | REWORK opcional | `#pause-screen` fuera de `max-height:520px` |
| C8 | Gate 2 / `ownership.json` pendientes. | Info | — | `INTEGRATION_CONTRACTS.md §6` |

Ninguno exige REBUILD. Con C1 y C2 resueltos y C3–C6 al menos revisados, el puntaje sube a ≥ 90 con las mismas pruebas.

## 7. Pruebas nuevas en esta iteración

`eval-pause.js` (pausa solo / sin panel (CSS) / online (netMatch simulado) / zurdo / texto grande; Sala plegada y desplegada) en 844x390, 667x375, 932x430, 1280x800; `eval-sala0.js` (hit-test a scroll 0); `eval-menus.js` con `HASTOUCH=0` (mouse real); `run-iter2.sh` (rendimiento, suites, regresión, det antes×2 y después).

## 8. Limitaciones

Mismas que en iteración 1 (mismo modelo con contexto separado; sin hardware táctil real; Chromium headless sin GPU; online solo simulado con `netMatch` falso, sin servidor; sin mando; sin lector de pantalla). Además: **«sin panel táctico» NO quedó cubierto**: la corrida usó `remove()` y el juego volvió a crear el panel (el escenario `solo-sin-panel` es idéntico a `solo`); corregí el script a ocultar con CSS pero no lo repetí; Cristales/Coliseo se evaluaron solo en su pantalla de lobby (no su HUD en partida); `btn-pact`/`btn-revive` no ejercitados; las capturas de pausa incluyen un toast de logro causado por mi perfil de prueba (desbloquea todos los campeones), no por el candidato; `t_func` no se repitió. La medición de latencia corrió en paralelo con otras pruebas en algunas tandas: la cola del navegador sube igual en base y candidato.

---

# Historial
## Iteración 1 (conservada tal cual; rama en 257fba37): RECHAZADO 73/100

Candidato: rama `feature/beta-ui-ux-factory` (HEAD `257fba37`) contra línea base `e194910b` (main pristino, `/tmp/uf-baseline`).
Todo lo medido aquí lo medí con scripts propios en `tools/ui-factory/eval/` (no usé `test-hud-feedback.js` ni acepté declaraciones del productor). Evidencia en `docs/ui-factory/evidence/eval1/`.

### 1. Decisión

**Gate 1: RECHAZADO (puntaje 73 / 100, < 80: según la matriz, reconstrucción parcial; en la práctica REWORK de Sala/Pausa + REPAIR del adaptador y del CSS).**
La rama cumple su objetivo principal (feedback de combate en los 6 botones y blancos de 44 px: 276 → 5 en menús), sin regresión de gameplay ni de flujo medida, pero incumple **una condición obligatoria** (cero superposiciones críticas: los solapes de la línea base siguen y no se corrigieron) y tiene defectos reproducibles del adaptador y del CSS de menús (R2–R8). Nada exige REBUILD completo; la parte buena (adaptador + CSS de combate) es reutilizable.

### 2. Puntaje por criterio

| Criterio | Máx. | Puntos | Justificación (cifras mías) |
|---|---|---|---|
| Coherencia artística | 20 | 14 | Anillo dorado y pulso de confirmación coherentes con la paleta; casillas pixel-art de 44 px acordes (`menus/cand_844x390_pausa.png`). Descuentos: `display:flex` en `summary` borra el triángulo ▶ de «Gestión automática del botín», «Ver habilidades», «Equipo, talentos…» (comparar `menus/base_844x390_inventario.png` / `sala.png` con `cand_*`): los desplegables parecen texto plano. Un botón en cooldown presionado pierde el `filter:saturate(.7)` del juego y se ve brillante (`montage_press.png`, fila 1). La casilla de «Reducir movimiento» queda separada del texto en la pausa. |
| Usabilidad y navegación | 20 | 14 | Blancos < 44 px en 17 pantallas (mi auditoría, 844x390): **276 → 5**; (1280x800) **260 → 7**. Flujo hub→partida idéntico: 3 toques, mismos botones. Descuento: no se tocó nada de los defectos medios de la línea base (#6 pasos, #7 «Comenzar»/«Continuar» flotantes); quedan 3 enlaces legales de 26 px en el título y 2 deslizadores de 28–40 px en la pausa; el scroll de Sala crece 552→593 px, Selección de guardián 1696→1888, Tienda 1487→1525 (más desplazamiento por el relleno). |
| Ergonomía del HUD | 20 | 15 | Los 6 botones de combate ahora responden a la presión en el mismo handler (`syncVisible` 240/240 ensayos; línea base 38/240). Ataque pasó de 0/9 detecciones a 100 %; Definitiva de ~240–770 ms a ~4 ms. Descuentos: no hay señal de rechazo para Definitiva sin carga ni Curación (vida llena / sin cargas): se ve idéntico a una presión válida; confirmación intermitente en lanzamientos al soltar tras ≥ 400 ms de mantener, **y confirmación falsa** si la energía se agota mientras se mantiene (ver §5). Tamaños del HUD sin cambios (Pausa/Sonido 44, Cura 46). |
| Claridad y accesibilidad | 15 | 12 | `role="button"`, `aria-label` y `aria-disabled` presentes en los 8 botones (`aria.json`; antes 5 de 8 sin nombre/rol). `prefers-reduced-motion` / `body.reduce-motion` anula escala (`scale:1`, medido). Sin `tabindex`: los botones de combate siguen sin alcanzarse con Tab. Descuento por pérdida de la affordance ▶ y por legales a 26 px. No medí lector de pantalla real ni contraste nuevo. |
| Rendimiento y estabilidad | 10 | 9 | Sin diferencia fuera del ruido (§4). Sin fugas en 66 s. 0 errores de página nuevos. Se resta 1 por +1 `setInterval`, +9 listeners, +1 MutationObserver, +1 bucle rAF permanentes (costo constante, no creciente) y porque el banco headless no distingue < 10 %. |
| Onboarding y retención potencial | 15 | 9 | No mido retención ni onboarding (sin telemetría ni jugadores): no doy puntos por mejora supuesta. 9/15 = neutro: sin regresión de primer minuto (`test-first-minute-taps.js` y `test-hub-legibility.js` pasan, flujo hub→partida idéntico) pero sin mejora: los pasos extra (#6, 3 toques) y las barras flotantes (#7) de la línea base siguen igual. |
| **Total** | 100 | **73** | 14+14+15+12+9+9 = 73. |

### 3. Condiciones obligatorias

| Condición | Resultado | Evidencia |
|---|---|---|
| Cero superposiciones críticas | **FAIL** | «Comenzar» flotante tapa el panel «Equipo, talentos y progresión» en Sala 844x390 (`menus/cand_844x390_sala.png`, igual que `base_*`), detectado como `summary × button Comenzar (340x19 px)`; pausa: «Continuar»/«Abandonar arena» fuera del primer pantallazo; Sala 1280x800 3 solapes de cajas (tabla en `menus/cand_menus.json`). Todos existen idénticos en la línea base (defecto #7 `Diferido`), **pero la condición no distingue herencia**: el candidato no los corrige. Nuevo: enlace «Instalar en mi dispositivo» (ahora 44 px) pisa 6 px a «Términos»/«Reembolsos» en el título. |
| Cero botones principales inoperantes | PASS | Los 6 botones de combate reaccionan con toque, mouse y teclado en 3 campeones; flujo hub→partida completo en 4 ejecuciones. |
| Cero regresiones críticas de gameplay | PASS (con límites) | `t_snapshot`: 887 enlaces globales/hashes de funciones idénticos, única diferencia = hash del DOM del body (atributos ARIA/`.uf-fx`); `t_drag_aim` 12/12 PASS en candidato; ejecución real de habilidades idéntica (`executed` mismas cuentas en `hud-*.json`); `t_det` 28/33 idénticas y 5 con diferencia solo en el digest `save` (R10, sin explicar). `t_func` falla igual en ambas versiones (entorno), no es evidencia. |
| Feedback visual funcional en TODOS los botones de combate | PASS | basic/s1/s2/s3/ult/emerg: cambio de píxeles 45–85 % vs ruido 0–33 % en los 3 campeones (844x390 táctil+teclado), mouse en 1280x800; `pact` no pude ejercitarlo con mi script (solo nigromante lo muestra; sólo verifiqué rol/aria). |
| No empeorar navegación hub→partida | PASS | 3 toques en ambas; ms primer toque→partida (4 corridas c/u): base 1913, 2070, 2039, 2032; cand 2126, 1917, 2123, 1861. Diferencia dentro del ruido. |
| Pruebas automatizadas obligatorias aprobadas | PASS (parcial) | 8 suites `tools/ux/*` PASS en candidato (rc=0; en baseline no las corrí porque no fallaron). `t_func` no concluyente (§6). |

Como una condición obligatoria está en FAIL (y el puntaje es < 80) → **no se aprueba**.

### 4. Antes / después (mis cifras, mismas condiciones; headless sin GPU, CPU 4 vCPU saturada por el juego)

| Métrica | Base e194910b | Candidato | Notas |
|---|---|---|---|
| Blancos < 44 px, suma de 18 pantallas, 844x390 | 276 | 5 | `menus/*_menus.json`; mi auditoría incluye `label` y `summary` |
| Ídem 1280x800 | 260 | 7 | quedan: 3 enlaces legales 26 px (título), 2 deslizadores (pausa), 2 `summary` 28–32 px (hub/cristales) |
| Feedback de Ataque al presionar | no visible (2/9 detecciones; diff 17 % ≈ ruido) | visible en 100 %; diff 71–78 % | `hud-*.json` |
| Código→primer cuadro visible (mediana, ms) táctil/tap/teclado | 4 / 4 / 5 (solo habilidades en ready; Ataque no detectable) | 4 / 4 / 5 (los 6 botones) | máx. candidato 15 ms (táctil) |
| Presión visible síncrona en el handler | 38/240 ensayos | 240/240 | |
| Demora del navegador hasta el handler (cola), mediana [p90] ms | táctil 36 [57] | táctil 39 [51] | **no es del código**, igual en ambas; máximos 244–348 ms por carga del hilo principal |
| Definitiva: primer cambio visible | ~240 ms (tap) a 766 ms (mantenida) | 4 ms | |
| Cooldown/sin energía al presionar: señal de rechazo | solo al soltar | al presionar, 3/3 en s1–s3 | **Definitiva/Curación: 0** |
| Hub→partida: toques / ms | 3 / ~2020 | 3 / ~2005 | 4 corridas c/u |
| `startRun` disponible, mediana de 3 ms (844x390) | 1209 | 1261 | rango 1189–1238 vs 1239–1298 |
| «Continuar» habilitado, mediana de 3 ms (844x390) | 5782 | 5942 | rango 5445–5801 vs 5587–6306 (+3 % mediana, solapan) |
| FPS en partida 844x390 DPR2, mediana de 3 (8 s) | 21,3 | 22,0 | candidato con `?uf=0`: 19,5; variación entre repeticiones ±10 % |
| FPS 1280x800, mediana de 3 | 24,9 | 26,3 | rango cand. 18,3–27,4 |
| Script CPU en 8 s (ms) | 3530–3828 | 3683–3800 | |
| Fugas en 66 s con toques cada 2 s | intervals 18, listeners 6016, nodos 2608 | intervals 19, listeners 6025, nodos 2612, heap 28–44 MB oscilante | estable desde t=11 s: sin crecimiento |

Headless sin GPU, tareas del hilo principal al 100 %: FPS y carga **no distinguen** diferencias < ~10–15 %. No concluyo «mejor», concluyo «no peor medible».

### 5. Rechazos (numerados, con clasificación)

| # | Hallazgo (reproducible) | Severidad | Clase | Archivo / selector probable |
|---|---|---|---|---|
| R1 | **Superposiciones críticas no resueltas** (condición obligatoria): «Comenzar» flotante sobre el panel de la Sala; pausa con «Continuar»/«Abandonar» bajo el borde; reproducir: `setState('prep'); renderPrepSummary()` a 844x390 y abrir `menus/cand_844x390_sala.png`. Heredado de la base (#7). | Alta | REWORK (rediseño de Sala/Pausa; fuera del CSS actual) | `#prep-start-btn`, `#pause-screen` (css/duo-ux.css, mobile.css); contrato UF-NAV pendiente |
| R2 | `summary` con `display:flex` elimina el marcador ▶ de todos los desplegables (Inventario «Gestión automática», Sala «Ver habilidades»/«Equipo…», hub «Guía», Cristales). Pierde la señal de que se puede abrir; `::marker{color}` no sirve con `display:flex`. | Media | REPAIR | `css/ui-factory/menus-touch.css` línea `.screen.screen summary{display:flex…}`: usar `display:list-item` + `min-height`/`padding`, o añadir `::before` ▶ |
| R3 | Sin rechazo visual para Definitiva sin carga y Curación (vida llena / sin cargas / `spent`): la presión es igual a la de un botón válido; `blockedKind()` solo mira `cd/active/noen/locked/hidden`. Reproducir: `eval-edge.js` casos «definitiva sin carga» y «emergencia gastada» (solo `uf:press`/`uf:release`). | Media | REPAIR | `js/ui-factory/hud-feedback.js` `blockedKind()` / `isReady()` (añadir `.spent`, ult sin `.ready`, emerg sin `.ready`) |
| R4 | **Confirmación falsa y omitida**: (a) «energía se agota mientras se mantiene» emite `uf:confirm` sin lanzar (cds quedan 0); (b) lanzamientos por arrastre/soltar tras ≥ 400 ms: confirm 1/2 a 400 ms y 0 a ≥ 550 ms (`confirm-hold-cand.json`; a 550 la ficha de 480 ms toma el control y no ejecuta, correcto); (c) Definitiva de Nigromante por toque ejecuta (`demon:true`) y no emite confirm; (d) Curación lista: confirm 1/3 con 3/3 ejecuciones; (e) Ataque emite `uf:confirm` duplicado por pulsación y sin ejecutar con 0 enemigos. Incumple UF-B3 («solo si el juego ejecutó»). | Media | REPAIR | `hud-feedback.js` `confirm()`, ventana `CONFIRM_WINDOW_MS`, observer sobre `class`; confirmar por verdad de terreno (cds/energía/ultCharge/emergCharges) |
| R5 | Botón en cooldown/sin energía presionado pierde el `filter:saturate(.7)` y `box-shadow` de estado: se ve más brillante que en reposo (`montage_press.png`). Contradice UF-B4. | Baja | REPAIR | `css/ui-factory/hud-feedback.css` `.uf-press{filter:brightness(1.35) saturate(1.2)}`: no aplicar a `.cd`/`.noen` |
| R6 | Blancos que siguen < 44: enlaces legales del título 26 px; 2 `input[range]` de la pausa (28–40 px); `summary` hub/Cristales 28–32 px. Nuevo solape de 6 px «Instalar en mi dispositivo» × «Términos/Reembolsos». | Baja | REPAIR | `menus-touch.css` (regla `a[href]` no cubre `.legal-links`; sliders no incluidos); `css/legal.css` |
| R7 | Botones de combate no alcanzables con teclado (sin `tabindex`) a pesar de `role="button"`: rol sin operabilidad (ARIA «falso botón»). Documentado por el productor como riesgo; sigue abierto. | Baja | REPAIR | `hud-feedback.js decorate()` (`tabindex=0` + `keydown` Enter/Space) |
| R8 | `min-height:44px` global en `.screen.screen button` aumenta el desplazamiento vertical: Sala 552→593, Selección 1696→1888 (+11 %), Tienda +38 px; Inventario cambia la posición de los chips. Riesgo de regresión en pantallas futuras (selector demasiado amplio, `.screen.screen` + `[role=button]`, `label:has(>input)`). | Baja | REPAIR | `menus-touch.css` encabezado: acotar por pantalla (`#inventory-screen`, `#shop-screen`…) |
| R10 | `t_det` antes/después: 5/33 partidas difieren solo en el digest `save` al terminar (pixeles y eventos idénticos). Causa sin determinar; hay que repetir `t_det` antes-contra-antes para saber si es ruido. | Media (hasta aclararlo) | REPAIR (investigar) | `tools/regression/t_det.js`, guardado al fin de partida; no hay cambio de JS en la rama, por lo que el sospechoso es el DOM/ARIA o ruido de la prueba |
| R9 | Solicitud de proceso: `index.html` (+3 líneas) y el paquete UI siguen sin registrarse en `ownership.json`; Gate 2 no concedido. | Info | — | `docs/ui-factory/INTEGRATION_CONTRACTS.md §6` |

Ninguno exige REBUILD. R1 exige REWORK fuera del alcance del adaptador actual (o aceptar formalmente que es un defecto heredado fuera del Gate 1 y reescribir la condición).

### 6. Pruebas ejecutadas y límites

Suites (`evidence/eval1/suites/cand-*.log`, resumen `cand-summary.txt`): test-touch-targets 21 s, accessibility-prefs 63 s (32 comprobaciones), first-minute-taps 73 s, text-overflow 27 s, hub-legibility 27 s, ability-inspector 23 s, tactical-panel 20 s, skill-glyphs 7 s: **todas rc=0**. No las corrí contra la base (no fallaron en el candidato, no era necesario).

Regresión (`evidence/eval1/regression/`, sitios instrumentados `build_site.py`):
- `t_snapshot` antes/después: 887 bindings, **solo difiere `dom.bodyHash`**.
- `t_drag_aim`: candidato 12/12 PASS (`TODO OK`); base 12/12 PASS (`drag_aim-base.log`; una primera ejecución de la base quedó truncada por un `pkill` mío y la repetí).
- `t_func`: **falla idéntico en ambas versiones** (`nav.mainmenu` y timeout de `page.click`, 5 PASS / 2 FAIL en cada una) por la preparación de sesión del entorno; no es una señal válida de regresión ni de ausencia.
- `t_det` (33 partidas deterministas, `compare_det.txt`): **28 idénticas, 5 con diferencia** (`boss_acuatica_cazadora`, `boss_bosque_guerrero`, `boss_laberinto_segador`, `death_natural_soporte`, `divina_guerrero`). En las 5 la única clave que difiere es el digest `save` en el primer cuadro de fin de partida (victoria/derrota); los hashes de píxeles del canvas coinciden (0 diferencias) y el texto de los eventos también. **No determiné la causa** (sospecho contenido del guardado dependiente de sitio/hora, no verificado: no corrí antes-contra-antes para medir el ruido propio de la prueba). No hay evidencia de regresión de juego, tampoco prueba de que sea ruido: queda como punto abierto (R10).

Estados raros del HUD (`edge-*.json`, `hud-*.json`), candidato 844x390: touchCancel, multitoque s1+s2, ataque sostenido + s1, arrastre fuera, mouse suelto fuera, pausa durante la presión, tecla mantenida + pausa/blur, visibilitychange (sintético y con segunda pestaña real: `visibilityState` quedó `visible` en headless, no se oculta de verdad) y ultimates de Ilkan/Nigromante: **ninguna clase `uf-press/uf-hold` queda pegada** (0/240 ensayos, 0 en los casos raros). `.uf-fx` no se duplica (1 por botón tras 6 toques). Presionar en cooldown no emite `confirm` (0/…).

### 7. Revisión de arquitectura (diff)

- Aditivo: 3 líneas en `index.html`, 2 CSS, 1 JS; el candidato no modifica JS del juego (`t_snapshot`).
- `menus-touch.css`: selectores `.screen.screen button/select/summary/input`, `[role=button]`, `a[href]`, `label:has(>input[checkbox])` y `.ui-icon-btn.ui-icon-btn` aplican a **las 17 pantallas**, incluidas Cristales (lobby), Divina, Mejora y Victoria; no afectan los HUD en partida (no son `.screen`). Medí Cristales (lobby) sin regresión visible; no probé el HUD en partida de Cristales/Coliseo ni el cliente online real.
- `hud-feedback.css`: especificidad `#controls #skillzone .ability-btn.uf-*` gana a `.cd`/`.noen`/`.aiming` del juego (R5).
- Adaptador: `MutationObserver` sobre 8 nodos + `setInterval` 500 ms + rAF permanente + listeners en captura sobre `document`/`window`; costo CPU no medible sobre el ruido (script 3,6–3,8 s en 8 s en ambos).
- Dependencia de contratos no declarados (`player.basicCd`, clases `ready/cd/noen`): si cambian, degrada a «sin confirmación» sin error (revisado en código, no probado).

### 8. Qué no pude probar / limitaciones de independencia

- Soy el mismo modelo que el productor, con contexto separado: puede compartir sesgos de diseño y de prueba. Mis scripts reutilizan convenciones de `baseline.js` (arranque de partida, toques CDP).
- **Sin hardware táctil real**; los toques son CDP sintéticos, sin latencia de pantalla. «<50 ms» se cumple para el código (≈4 ms, máx. 15 ms); la demora del navegador (mediana 36–39 ms, hasta 244 ms bajo carga) no es atribuible al candidato (idéntica en la base) y total evento→píxel puede superar 50 ms en ese banco.
- Headless Chromium 153 sin GPU, CPU saturada; FPS y carga no resuelven < 10–15 %. Mediciones de feedback corridas en paralelo (base y candidato a la vez) para ahorrar tiempo: cola de eventos inflada por igual.
- No probados: online/invitado/cooperativo (solo servidor local; las llamadas a `fondalstudios.com` fallan por CORS en ambas versiones), mando/gamepad, HUD en partida de Cristales/Coliseo/Horda Infinita, Revivir, `btn-pact` en pruebas funcionales, lector de pantalla, retención/onboarding real, red móvil, victoria real con botín.
- Pausa: probada por `setState('paused')`, no pasando por el botón en todos los casos de estados raros.
- La auditoría de blancos usa mi propio selector (incluye `label`, `summary`); no es idéntica a la de `baseline.js SECTIONS=a11y`, por eso las cifras de base difieren de BASELINE.md (276 vs ≈ 250).

### 9. Reproducir

```
# servir: candidato 8881, base 8882
(cd /home/user/La-Horda && python3 -m http.server 8881 --bind 127.0.0.1 &) ; (cd /tmp/uf-baseline && python3 -m http.server 8882 --bind 127.0.0.1 &)
cd tools/ui-factory/eval
BASE=http://127.0.0.1:8881 LABEL=cand OUT=../../../docs/ui-factory/evidence/eval1/hud-cand.json SHOTDIR=../../../docs/ui-factory/evidence/eval1/shots node eval-hud.js   # idem LABEL=base puerto 8882
BASE=... LABEL=... OUT=... node eval-edge.js     # estados raros (R3, R4)
BASE=... LABEL=... OUTDIR=... node eval-menus.js # blancos, solapes, capturas (R1, R2, R6, R8)
MODE=ab|leak OUT=... node eval-perf.js           # rendimiento / fugas
BASE=... OUT=... node eval-confirm-hold.js       # confirmación según tiempo de mantenido (R4)
./run-suites.sh <raíz> <etiqueta> <salida>       # suites tools/ux
./run-regression.sh                              # tools/regression antes/después + nav x3
```
