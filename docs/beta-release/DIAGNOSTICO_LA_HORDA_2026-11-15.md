# La Horda: diagnóstico de situación (2026-11-15)

Documento pensado para pasárselo a otra IA (ChatGPT) o a una persona que se suma al proyecto. Describe qué es el juego, cómo está construido, en qué estado está, cómo se trabaja y qué falta. Todo lo marcado «medido» sale de ejecuciones reales; lo marcado «no medido» o «supuesto» no tiene evidencia todavía. Cierre del estado: `main` = 8a6ca075 (PR #303 y #304 mergeados). El PR #305 (guerrero + reconciliación de checklists) estaba en CI al escribir esto.

## 1. Qué es el juego

- **La Horda**: ARPG 2D retro de acción en tiempo real, HTML5 Canvas, JavaScript vanilla sin paso de build. Repo `Fondal-Studios/La-Horda`.
- Modos: campaña por arenas, Horda Infinita, Coliseo, Guerra de Cristales (modo competitivo), cooperativo (LAN y online), Arena Divina (asedio).
- Contenido: **46 campeones** (clases con kit de 3 habilidades + definitiva, nivel y talentos), **10 arenas** (Ciudad, Fortaleza, Bosque, Micelial, Hielo, Acuática, Laberinto, Abismo, Minas, Infernal) más Arena Divina y Coliseo, jefes y subjefes por arena, equipo con rarezas y sets, reliquias de la Horda, tienda, pase de batalla, colecciones de apariencias.
- Plataformas objetivo: navegador (PWA), escritorio vía Electron para **Steam** (PC y Steam Deck), LAN local.
- Idioma base: español, con traducciones EN/PT generadas (`tools/i18n`).

## 2. Cómo está construido

- **Cliente**: `index.html` + `js/` (~532 archivos, ~130 mil líneas) organizado por dominio: `core`, `data`, `champions` (un archivo por campeón + kit compartido), `skills`, `systems`, `arenas` (lógica por arena), `enemies`, `ai`, `rendering`, `ui`, `ui-factory`, `ui-clarity`, `modes`, `net`, `storage`, `i18n`, `audio`.
- **Servidor** (`server/`, Node): cuentas, billetera de Brasas, compras (`payments.js`), pase de batalla (`battlepass.js`), entitlements, presencia, inbox de campañas, ranking, base Postgres (migración sin probar en producción). Reglas de economía ejecutadas por el servidor; el cliente propone y el servidor decide.
- **Fuente de verdad de precios**: `js/data/pricing.js`, ejecutada también por el servidor en un contexto aislado (`docs/economy/PRECIOS.md`).
- **Escritorio / Steam**: `desktop/` (Electron, sin construir ni ejecutar todavía) y `docs/steam/` (guía de Steamworks, declaración de IA, logros).
- **Herramientas**: `tools/` (≈1.300 archivos): bots y pilotos automáticos (`tools/playtest`, `tools/balance`, `tools/bots`), puertas de calidad (`tools/bible`, `tools/quality`), arte (`tools/art`, `tools/art-world`), revisión independiente (`tools/review`), fábrica de campeones (`tools/factory`).
- **Pruebas y CI**: ~141 pruebas en la batería `tools/quality/run-all.js` (se ejecutan sobre Chromium con Playwright, contra el juego real) más unas 39 workflows de GitHub. Una corrida completa del CI tarda unos 35 a 40 minutos.

## 3. Reglas de trabajo del proyecto (importan si otra IA colabora)

1. **Revisión independiente obligatoria para mergear a `main`**: `reviews/<rama>.json` con las etapas producción, QA, arquitectura, staging y aprobación; identidades distintas; evidencia citando el SHA **exacto**; el commit del registro debe ser el único cambio sobre el SHA revisado (`node tools/review/check.js --mode merge`). Cualquier commit nuevo invalida las revisiones. La staging corre en una rama `beta/…` (regresión completa, 141 pruebas).
2. **Gates que no se relajan**: referencia de balance por rol, `entry-gate` (simula partidas por candidato), `ability-gate` (filtro de habilidades), `boss-validator`, atlas de arte, paquetes visuales, y pines de hash de arte aprobado (p. ej. Libertador, Tanque).
3. **Campeones nuevos**: pasan por la normalización de entrada y el gate; no se toca `knownChampions` ni la referencia para saltarse el control (`AGENTS.md`).
4. **Economía**: las **Brasas compran solo cosméticos puros** (apariencias, efectos, alas); nunca poder, piezas de set ni campeones. Sin cajas con probabilidad oculta, sin temporizadores falsos.
5. **Arte generado con IA (Runway)**: cada generación se registra con su ID en `docs/beta-release/ART_CREDITS.md`; se declara en `docs/steam/DECLARACION_IA.md`. Regla del dueño: todo cambio de arte se entrega con **una imagen con ANTES y DESPUÉS** del motor real.
6. **Nunca** se declara «listo para Steam» sin las verificaciones del dueño (ver sección 9).

## 4. Estado de las áreas

### 4.1 Código y estabilidad
- Cliente y servidor funcionan; la batería completa de la rama principal pasa (141 de 141 en staging en la última corrida verde).
- Intermitencias conocidas (documentadas en `docs/beta-release/INTERMITENCIAS_CI.md`): `t_identity` (bosque), `t_abismo` (Carcelero), `test-sides`, `t_hpbonus`, `t_breakables`, `LAB.los_bots_resuelven_en_orden`. Varias ya se hicieron deterministas; ninguna bloquea a un jugador. Los reintentos de CI son el método habitual.
- **Bug real corregido esta semana**: el Carcelero del Abismo (subjefe del nivel 9) quedaba clavado en un borde de navegación y el nivel no terminaba nunca (4 de 8 partidas de bots llegaban al tope de 22 min). Arreglado (costuras de plataformas + salto del subjefe tras 9 s) con pruebas.
- **No medido**: multijugador real con latencia, rendimiento en una PC modesta o en Steam Deck, memoria prolongada. El único dato de rendimiento es de render por software (Arena Infernal: pico de 77 enemigos, 24 FPS y 43 % de cuadros >33 ms; sirve para comparar arenas, no como FPS real).
- **Seguridad**: GitHub avisa 105 vulnerabilidades en dependencias de la rama principal (5 críticas). **No investigado todavía.** Pendientes técnicos documentados: candados en memoria (una sola instancia de servidor), barrido O(cuentas), reintegro parcial que no se revierte, nonce del ticket, migración Postgres sin probar, páginas legales que todavía mencionan Mercado Pago.

### 4.2 Primera sesión
- Corregidos: solape de 8 px en la elección de skin en 844x390 y la prueba `q1_first_session` (de 21 PASS/25 FAIL a 69 PASS/0 FAIL). La corrección del layout es un parche con fuentes de CI; el revisor señaló que conviene una solución estructural (barra fuera de `position:sticky`).
- No medido con humanos: comprensión del juego, abandono, frustración.

### 4.3 Balance y dificultad
- **Todo el balance medido sale de bots** (piloto automático), con pocas semillas (5 a 50 partidas por casilla). No hay datos de jugadores.
- Ronda de dificultad: Normal ≈80 %, Pesadilla ≈44 %, Infierno ≈32–40 % de victorias del piloto en 5 de las 10 arenas medidas (Ciudad, Bosque, Micelial, Hielo, Infernal). **No medidas**: Fortaleza, Acuática, Laberinto, Abismo, Minas. Normal en Ciudad y Bosque sigue cerca del 100 % (el endurecimiento rompía ganchos de jefe y se revirtió).
- **Guerrero (Kael)** sigue débil: ≈0,30× la media de los otros roles en Pesadilla y ≈0,22× en Infierno; el mago es el más fuerte (80 % en Pesadilla). Se probaron tres variantes de mitigación/esquiva: resultado **no concluyente** (la esquiva fue la única con señal, sin significancia). Las perillas quedaron apagadas como infraestructura de experimento.
- Simulación «alfa de 30» con bots (156 partidas): 0 errores de página, 0 cuelgues; sirve para robustez y balance relativo, **no** para diversión ni comprensión.

### 4.4 Arte
- 46 campeones: unos 12 con arte nuevo («Códice») completo, 9 con arte viejo, 25 con huecos de animación; 10 arenas con distinto grado de arte nuevo; enemigos: 63 con hoja nueva, ~12 por completar.
- Se instaló esta semana arte generado con Runway `gpt_image_2` para Ynara, Cazadora, Musashi, Ilkan y la definitiva del Libertador; **el dueño aprobó a ojo** lo instalado (2026-11-14). Myla, Saelis, Profeta y el Sabueso están instalados sin aprobación de arte.
- **Cola de arte priorizada** (`docs/art-brief/PRIORIDAD_ASSETS.md`, generada; `python3 tools/art/prioridad-assets.py --next --saldo <créditos>` da la próxima tarea): 706 ítems, 508 activos (44 críticos, 127 importantes, 337 secundarios), 198 duplicados que no hay que regenerar. Primer crítico: integrar el «lanzar» del Tanque (0 créditos; ojo: el atlas del Tanque tiene hash fijado por dos gates).
- **Runway**: saldo ≈37 créditos al último chequeo; la cuenta es compartida y baja por consumo ajeno; `gen4_image` tiene un tope diario móvil (200). Regla de la rutina automática: no gastar con saldo < 250.
- **Auditoría de assets**: el juego está limpio (99,8 % de `assets/` y `css/` en uso); se eliminaron 53 capturas duplicadas; hay candidatos útiles no integrados (caminatas del Tanque por video, fachada `casa_a`, etc.) esperando decisión del dueño. Hay 3 errores 404 preexistentes de marcos de héroe (Ilsa, Vorn, Kora).
- Hay arte repetido en documentos y colas; el checklist ya lo marca.

### 4.5 Economía y monetización
- Diseño vigente: Brasas solo cosméticos; campeones con oro; pase de batalla de 30 días (servidor listo; cosméticos `bp:*` sin arte); packs de Brasas con dólares; **pack de bienvenida US$6,99 (500 + 400 Brasas, solo apariencias)**.
- Los cobros reales están **desactivados** («Muy pronto») hasta conectar el proveedor. Para Steam hay que pasar a **microtransacciones de Steam** (ítems 1001–1006 previstos); el flujo actual apuntaba a Mercado Pago.
- Hay una auditoría de diseño con propuestas de monetización y diversión (`docs/beta-release/AUDITORIA_EQUIPO_DISENO.md`): demo y Next Fest, precio base (pago único bajo vs. gratis con cosméticos), pase solo cosmético, regalos entre jugadores, precios regionales; qué no hacer (poder pagado, cajas, temporizadores falsos).

### 4.6 Nombre y marca
- «La Horda»: la búsqueda de Steam, itch.io y App Store **no mostró ningún juego con ese título exacto**. Las bases de marcas (TMview, WIPO, EUIPO, INPI) no se pudieron consultar de forma automática. Es una expresión común: riesgo de choque y de marca débil. **Pendiente del dueño**: chequeo en clases 9 y 41, preferentemente con un agente de marcas.

## 5. Lo que depende del dueño (no automatizable)

1. Steamworks: cuenta/AppID, ítems 1001–1006, logros, sandbox de compras, página de tienda, precio, íconos oficiales, textos legales, correo de soporte.
2. Construir y probar el binario de Electron en PC real (Windows y Steam Deck): hoy no existe ejecución verificada.
3. Declaración de IA de Steam: confirmar los términos comerciales de `gpt_image_2` (Runway) y los 168+ recibos de generación.
4. Chequeo de marca «La Horda».
5. Recargar Runway o confirmar si se puede gastar con menos saldo; confirmar cuánto consume la cuenta compartida.
6. Decidir candidatos de arte no integrados y la aprobación de Myla, Saelis, Profeta y Sabueso.
7. Probar con jugadores reales: multijugador, rendimiento, balance (hoy solo hay bots).
8. Revisar las 105 alertas de dependencias.

## 6. Riesgos principales (orden de impacto estimado)

1. **Sin pruebas con jugadores humanos**: balance, curva de dificultad, comprensión y retención no están medidos.
2. **Rendimiento y multijugador sin validar** en hardware real (Steam Deck incluida).
3. **Camino a Steam sin recorrer**: sin AppID, sin build de Electron probado, compras aún atadas a otro proveedor.
4. **Dependencias vulnerables** antes de abrir cuentas, pagos y ranking online.
5. **Consistencia de arte**: mezcla de arte viejo, arte nuevo y arte generado con IA; faltan estados de animación en 25 campeones.
6. **Guerrero débil y mago fuerte**: afecta la percepción de equidad (con datos de bots solamente).
7. **Marca**: nombre común sin chequeo oficial.

## 7. Cómo puede ayudar ChatGPT (y qué no)

ChatGPT no puede ejecutar el juego ni el repositorio en este flujo; lo que sí puede aportar si se le pasa este documento y fragmentos concretos:

- **Texto y comunicación**: página de tienda de Steam (descripción corta/larga, tags, capturas sugeridas), tráiler (guion), notas de parche, textos de la demo, FAQ, mensajes de la primera sesión, localización a inglés de calidad (revisión de `js/i18n`).
- **Diseño**: ideas de modificadores diarios, jefes con mecánicas distintas, sinergias de habilidades, estructura del pase de batalla y de los packs cosméticos, curva de progresión; revisión crítica de `AUDITORIA_EQUIPO_DISENO.md`.
- **Monetización y lanzamiento**: plan de lista de deseos, demo y Next Fest, calendario previo al lanzamiento, comparables de precio y de F2P/premium.
- **Legal (borradores a revisar por un abogado)**: términos de uso, privacidad, reembolsos, texto de la declaración de IA, reglas de cosméticos.
- **Revisión de lectura**: leer informes (`docs/beta-release/*.md`), detectar contradicciones y proponer prioridades.
- **No sustituye**: ejecución de pruebas, cambios de código verificados, simulaciones, revisión independiente ni mediciones con jugadores.

Sugerencia de reparto: Claude Code ejecuta, mide y mergea dentro de las reglas del repo; ChatGPT redacta, critica y propone; el dueño decide y hace lo que solo puede hacer él (Steamworks, pruebas en PC real, marca, pagos).

## 8. Dónde mirar (mapa de documentos)

- Estado y siguiente paso: `docs/beta-release/STATUS.md`, `NEXT_SESSION.md`, `INTERMITENCIAS_CI.md`.
- Auditoría y simulación: `docs/beta-release/AUDITORIA_EQUIPO_DISENO.md`, `SIMULACION_ALFA_30.md`, `BALANCE_DIFICULTAD_20261113.md`, `BALANCE_GUERRERO_20261115.md` (este último, tras el merge del PR #305).
- Economía: `docs/economy/PRECIOS.md`; arte: `docs/art-brief/` (`PRIORIDAD_ASSETS.md`, `CHECKLIST_ARTE.md`, `runway-pack/`), `docs/beta-release/ART_CREDITS.md`, `docs/art-brief/AUDITORIA_ASSETS_20261113.md`.
- Steam: `docs/steam/`; revisión independiente: `reviews/`, `docs/arquitectura-compartida/REVISION_INDEPENDIENTE.md`.
- Reglas de balance y campeones: `AGENTS.md`, `BALANCE_CAMPEONES.md`.

## 9. Lo que NO se puede afirmar hoy

- Que el juego está «listo para Steam».
- Que el balance es bueno para jugadores humanos.
- Que el rendimiento es aceptable en una PC modesta o en Steam Deck.
- Que el multijugador funciona con latencia real.
- Que el nombre «La Horda» está libre de conflictos de marca.
