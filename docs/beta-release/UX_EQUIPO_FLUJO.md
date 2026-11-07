# UX equipo — lente FLUJO DEL JUGADOR NUEVO

Método: Playwright, localStorage vacío, `?lazy=0`, 1280x720 y 844x390. Capturas en `docs/beta-release/ux-flujo/` (A_* = "JUGAR AHORA", A2_* = pausa/fin, B_* = Continuar→primer guardián, C_* = hub/modos/guardianes/tienda, pausa_fondo_*). Se ignoró la escena animada del título.

## Recorrido y conteo de clics (desde cero)

| Ruta | Clics hasta jugar | Pantallas |
|---|---|---|
| Título → **JUGAR AHORA** (partida rápida, Sylva + bots, arena Ruinas Élficas) | **1** | título → partida |
| Título → **Tocá para continuar** → guardián (tap) → "¡Lo quiero!" → tutorial jugable | **3** | título, "Tu primer guardián", partida-tutorial. La skin de regalo y el hub llegan después. |
| Hub → **JUGAR** → Ficha de arena → "¡A LA BATALLA!" | 2 desde el hub | hub, ficha, partida |
| Hub → Multijugador → "Modo campaña" | 2 + otra pantalla | |
| Pausa → Continuar | 1, pero el botón está **fuera de pantalla** | ver F3 |
| Fin → Reintentar / Volver al menú | 1 | gameover: 2 botones (bien) |

Lo bueno (conservar): "JUGAR AHORA" a 1 clic; primer guardián con 4 opciones + "Ver los 34"; Game over con 1 primaria y 1 secundaria; hub en 844x390 sin deslizar.

## Hallazgos con evidencia

**F1. Dos botones primarios en el título compiten.** `#bt-play` ("JUGAR AHORA", naranja grande) y `#title-continue-btn` ("Tocá para continuar", casi mismo ancho y borde dorado) están apilados con igual tamaño (1280_1_title). "Continuar" no dice qué pasa: para un nuevo lleva a elegir guardián, y para uno antiguo, al hub. Además, "Cargando…" del botón es un tercer estado y "Instalar en mi dispositivo" suma un enlace suelto arriba a la izquierda.

**F2. El jugador nuevo ve dos "primeras partidas" distintas.** JUGAR AHORA lo mete a una partida con Sylva sin explicar (saltea la elección del guardián de regalo y el tutorial; HUD con "Rastreo 0/5 · Impulso 0/10" sin contexto). Continuar → elige guardián → tutorial con "Saltar tutorial". Dos entradas a "empezar a jugar" con resultados distintos = ruta redundante.

**F3. Pausa: "Continuar" queda al final de un panel de ~2 pantallas.** Medido: `#resume-btn` a y=1320 y `#quit-btn` a y=1384 en 1280x720 (viewport 720); en 844x390 el panel mide 521 de alto y "Continuar" a y=275 queda tras los bloques Estados / Kit / Equipo / Ayuda. Dentro del panel hay **tres ayudas** (bloque "AYUDA", "📖 Guía de juego", "? Cómo se juega") y **dos lugares de opciones** (sliders música/efectos + toggles de movimiento/efectos y el botón "⚙ Opciones: zurdo, texto, vibración…"). Los botones de iconos (Opciones/Guía) muestran el icono pegado al texto con poco aire.

**F4. Hub: demasiado en la cabecera y dos entradas a lo mismo.** 9 controles en la barra superior: perfil, ✦ Brasas (+), tele (oculto), "Botín", "?", 🎖 pase, "ES", ⚙, ⏏. Redundancias: "?" (Cómo se juega) vs. caja "Consultar Guía · Nivel 1" vs. "REPETIR TUTORIAL"; 🎖 Pase de batalla vs. tile "DESAFÍOS · Logros · pase" (el tile ya dice "pase"); ✦ Brasas vs. Tienda > Brasas; idioma "ES" aparece en título y hub. ⏏ ("Volver al título") es un icono críptico sin texto, al lado de ⚙.

**F5. Hub: pares de elementos con el mismo peso que la acción principal.** A la derecha de JUGAR hay "HORDA INFINITA" **bloqueada** (🔒, texto gris) y un "RANKING" morado de igual altura y borde que cualquier modo, aunque el ranking no sirve sin haber jugado la Infinita. Las dos tarjetas "MODOS DE POSTGAME" (Guerra de Cristales, Coliseo) llevan **borde naranja = el mismo que JUGAR**, aunque están bloqueadas hasta terminar la campaña (el bloqueo solo se descubre al tocar, `#pg-gate`). Un nuevo ve ~16 destinos en la primera pantalla.

**F6. Nombres inconsistentes del mismo modo.** Hub: "GUERRA DE CRISTALES". Multijugador: "CONVERGENCIA ALPHA" (cuerpo: "Guerra de Cristales: …"). Hub: "MODOS DE POSTGAME" ≠ "Postgame: se abre al terminar la campaña". "MODO CAMPAÑA" aparece en hub (kicker), en Multijugador y en la ficha de arena como "ACTO I". La etiqueta "ALPHA" en tarjetas y "LA HORDA — ALFA COOPERATIVA" en el título (ALPHA vs ALFA). "Multijugador" abre una pantalla llamada "MODOS Y MULTIJUGADOR" cuyo contenido es mayormente de modos de un jugador (Campaña, Convergencia, Coliseo, Horda infinita 🔒) — los mismos modos que ya están en el hub: **segunda ruta a Campaña, Cristales, Coliseo y Horda Infinita**.

**F7. Multijugador: pantalla densa, 11 acciones, jerarquía invertida.** El bloque de la izquierda (Unirse con código + nombre + Crear sala + Salas abiertas) tiene borde naranja; "JUGAR YA", la acción más simple, queda arriba a la derecha con borde dorado más tenue. Mensaje de error de salas en texto pequeño ("No se pudo consultar el servidor (puede estar despertando…)") y un botón ↻ ancho vacío. En C_1280_3_multi las tarjetas inferiores se cortan por debajo del viewport.

**F8. "Volver" no es consistente.** Etiquetas: "‹ Menú" (Modos, Tienda, Códice), "‹ Atrás" (Guardianes/detalle), "‹ Volver" (Inventario), "⏏ Volver al título" (hub), "Volver al menú" (Game over), "Abandonar arena" (pausa). Casi siempre arriba a la izquierda, pero en pausa y game over está abajo/centro, y en el hub es un icono a la derecha.

**F9. Guardianes: el tile no abre una lista.** `#mainmenu-guardianes-btn` abre directamente el detalle del guardián equipado, en la pestaña **Equipo** (no "Ficha"), con navegación por ‹ › y migas "GUARDIANES › Aldric". El jugador nuevo ve 6 huecos "vacío" y el texto "Todavía no hay objetos en la cuenta" como primera impresión; no hay una vista de roster evidente. Pestañas: Ficha / Equipo / Talentos / Maestría / Apariencias (5), más "Reliquias Únicas" y filtros Compatibles/Recomendados/Todos. Al jugador nuevo le bastaría Ficha primero.

**F10. Primer guardián: dos pasos y salto de layout.** Tocar la tarjeta muestra una caja de confirmación abajo que **reacomoda toda la pantalla** (el título sube ~140 px; B_1280_2 vs B_1280_3), "¡Lo quiero!"/"Elegir otro" son dos botones para algo que el toque ya expresó, y no hay botón "Volver" a título. El texto "Los demás se compran en la Tienda por 2.500 de oro" aparece antes de que sepa qué es la Tienda. Contenido superior vacío (la pantalla está en la parte baja).

**F11. Tienda: ~136 botones visibles/enumerados en la primera pestaña, 5 pestañas y 3 monedas.** "Destacados · Guardianes · Objetos · Skins · Brasas" y encima: 🪙 oro, bolsa 0/30 y ✦ Brasas (otro acceso a Brasas). Dos tipos de moneda (oro vs ✦) sin explicación al nuevo; "TU PRÓXIMA META" ayuda (conservar). Tarjetas con textos truncados ("Guanteletes de Zherath, del…").

**F12. Ficha de arena (Jugar → batalla): texto denso y doble confirmación.** La ficha tiene 9 bloques (objetivo, "lo que te mata", "lo que te ayuda", mecánica, peligro, jefe, botín destacado con 5 slots) + el botón "¡A LA BATALLA!" con texto diminuto y un recordatorio redundante ("tocá ¡A LA BATALLA! para empezar"). "Saltar ▸▸" arriba a la izquierda, lejos del foco, en un tercer estilo de botón. Fuente del botón mucho menor que el título.

**F13. Tutorial.** El primer panel es largo pero se puede saltar ("Saltar tutorial"): bien. El botón de pausa dice "Esc" en un chip (en táctil no hay Esc).

## Cambios propuestos (priorizados; ninguno elimina una opción)

1. **[S] Pausa: subir "Continuar" y "Abandonar arena" a una barra fija inferior (sticky) o a la parte superior del panel; mover Estados/Kit/Equipo/Ayuda a secciones colapsables "Detalles de tu guardián" (cerrada por defecto).** Archivos: CSS `#pause-panel`, `index.html` bloque `#pause-screen`, `#resume-btn`/`#quit-btn`. Todo sigue alcanzable al expandir.
2. **[S] Pausa: juntar las 3 ayudas ("Ayuda", "Guía de juego", "Cómo se juega") en un solo botón "Ayuda" y las opciones (sliders + toggles + "Opciones…") en una sección "Sonido y opciones".** `#pause-howto-btn`, `#pause-opts-btn`. Las mismas funciones, menos botones.
3. **[S] Título: jerarquizar. "JUGAR AHORA" mantiene el estilo primario; "Tocá para continuar" pasa a secundario (más chico, sin relleno) y se renombra según el estado: "Elegir mi guardián" (nuevo) / "Continuar mi campaña" (con guardado).** `#title-continue-btn`, `#bt-play`, `title-screen` (solo botones, no la escena). Mover "Instalar en mi dispositivo" a la línea legal inferior.
4. **[S] Unificar nombres:** "Guerra de Cristales" en todo (reemplazar "Convergencia" donde se muestra), "Modos de postgame" → "Desbloqueables tras la campaña", ALPHA/ALFA coherente, "Atrás/Menú/Volver" → un solo "‹ Volver" (y el destino en la cabecera, p. ej. "‹ Volver al hub"). Archivos: `index.html` (`mode-crystal-wars-btn`, `*-back-btn`), `js/i18n/*` si hay diccionario por clave.
5. **[S] Hub: marcar claramente lo bloqueado.** Bajar el borde naranja de Cristales/Coliseo a gris con candado y "Se abre al terminar la campaña" mientras estén bloqueados; ocultar `#hub-endless-rank-btn` (o dejarlo apagado) hasta desbloquear la Infinita. Nada se borra: se muestra al cumplir la condición, y el ranking sigue en Multijugador/Modos. `hub-tile-crystal`, `#hub-endless-rank-btn`, `#hub-endless-btn`.
6. **[M] Hub: cabecera en 3 grupos con etiquetas.** Izquierda: perfil + oro + Brasas; derecha: "Botín", "Pase 🎖" (renombrado "Pase de batalla"), y un menú "⋯" que agrupe **?**, **ES**, **⚙** y **⏏ ("Volver al título")** con texto. Dejar de repetir Desafíos/Pase: el tile "DESAFÍOS" lleva "Logros y misiones" y el 🎖 queda dentro de esa pantalla o viceversa (un único camino visible, el otro accesible dentro). `hub-top`, `#hub-pass-btn`, `#hub-howto-btn`, `#hub-lang-btn`, `#mainmenu-back-btn`.
7. **[M] Multijugador: separar "Multijugador" de "Modos".** La pantalla `modeselect-screen` mantiene todo, pero se ordena así: 1) JUGAR YA (primaria), 2) Unirse con código / Crear sala (juntos, con nombre en un desplegable "Tu nombre"), 3) "Salas abiertas" colapsado con refresco, 4) "Otros modos" (Campaña, Cristales, Coliseo, Infinita) en una sola fila secundaria con la leyenda "También disponibles en el menú principal". Evita que parezca duplicado y reduce la altura. `index.html` líneas ~384-430, `#mode-quickplay-btn`, `#mode-join-card`.
8. **[M] Primer guardián: selección en un solo toque con vista previa fija.** Reservar el espacio de la confirmación (sin saltos), renombrar "¡Lo quiero!"/"Elegir otro" → "Elegir a Aldric" / "Cambiar", y añadir "‹ Volver" al título. Mantener "Ver los 34 guardianes". `#starter-confirm`, `#starter-all-btn`, `js/ui/starter-select.js`.
9. **[M] Guardianes: abrir en "Ficha" y mostrar primero un selector de guardianes con el equipado resaltado.** El tile sigue dando acceso al detalle; agrupar pestañas Talentos/Maestría bajo "Progreso" para el jugador nuevo (opcionalmente solo pasar a segundo plano visual: Maestría, Reliquias Únicas). `mainmenu-guardianes-btn`, `champdetail` tabs, `js/ui/*champdetail*`.
10. **[S] Ficha de arena: plegar "Mecánica/Peligro/Jefe/Botín" en "Detalles de la arena" (abierto una vez, luego recordado); enlazar el botón principal más grande y quitar el hint redundante "tocá ¡A LA BATALLA!"; "Saltar ▸▸" junto al botón principal como secundario.** Archivo del overlay de ficha (buscar `¡A LA BATALLA!` en `js/ui/`).
11. **[S] Unificar ayuda en el hub:** "?" (Cómo se juega), "Consultar Guía" y "REPETIR TUTORIAL" en una sola tarjeta "Ayuda y tutorial" con dos botones. `hub-howto-btn`, la caja de guía del hub.
12. **[M] Tienda: explicar y limitar el ruido.** Cabecera: oro y Brasas con tooltip "Oro = jugar · ✦ = solo apariencias" (ya existe en el título de `#hub-premium-btn`); mover Brasas a la última pestaña únicamente (el chip ✦ de la cabecera lleva allí); en "Destacados" mostrar solo 6 tarjetas y "Ver todo" (sin quitar nada, el resto sigue en las pestañas). `shop-screen`, `js/systems/shop.js`.

Todos los cambios reordenan, renombran, jerarquizan o pliegan; ninguno elimina un modo, pantalla, ajuste ni compra. Orden sugerido de ejecución: 1, 2, 3, 4, 5, 11 (S, impacto alto) → 6, 7, 8, 9, 10, 12.
