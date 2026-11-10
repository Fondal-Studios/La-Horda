# La Horda — Auditoría UX/UI para Steam (PC)

Rama `claude/la-horda-beta-audit-exec-mwv8x0`, solo lectura (`git status --short` vacío al terminar).
Recorrido real con Chromium (Playwright, deviceScaleFactor 1) a 1280x720 y 1920x1080, con mouse, teclado y mando simulado (`tools/lib/gamepad-sim.js`). Guardado vacío para el jugador nuevo; guardado avanzado (todos los guardianes Nv. 12, arenas 01-02 superadas) para el resto.

Todas las capturas están en `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/` (abajo se cita la ruta completa de cada una). Solo figura lo que vi en pantalla.

Alcance no cubierto: PT no se revisó (solo ES y EN); Códice/Bestiario, Guerra de Cristales y Coliseo solo se abrieron para probar Esc; victoria de campaña no se jugó (solo derrota y resultados de Horda); mando real y Steam Deck no se pueden probar acá.

## Lo que ya está bien (no tocar)

- Hay pantalla de controles completa con columna de teclado y de mando y reasignación de teclas (Opciones › Controles › Ver controles): `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/h-ver-controles.png`.
- Los botones del HUD muestran la tecla correcta (Espacio, 1 2 3, R, Q, Esc) y cambian a A/X/Y/B/RB/LB/Start al tocar el mando: `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/p06-pad-hud.png`.
- Con mando se navega el menú principal (foco visible, A confirma, B vuelve) y se eligen refuerzos y reliquias.
- Sets (poder) vs Apariencias (cosmético) está bien explicado en la ficha del guardián: `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/a03-g-sets.png` y `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/a03-g-skins.png`.
- La pantalla de derrota explica qué pasó y no castiga la primera arena: `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n27-defeat.png`.
- No encontré "NaN", "TODO" ni "[object Object]" en las pantallas recorridas; sí "undefined" (hallazgo 10).

---

## CRÍTICO

### 1. El tutorial y la ayuda le hablan al jugador de PC como si tuviera un celular
- **Pantalla / resolución:** tutorial inicial (pasos 2, 3, 4, 7, 8, 11, 14), "¿Cómo se juega?", título, primer guardián, ficha de arena. 1280x720 y 1920x1080.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n08-tut-c.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/m-ayuda-new.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n01-title-1280.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n02-after-continue.png`.
- **Qué ve:** con teclado y mouse (el juego ya detectó teclado: `body.inp-kb`) lee "Usá el joystick de abajo a la izquierda para moverte", "Mantené el botón Ataque de la derecha", "Tocá una. Si la mantenés y arrastrás, elegís dónde cae", "Tocá ❚❚ arriba a la derecha", "Tocá para continuar", "Tocá uno: es tu regalo", "tocá ¡A LA BATALLA! para empezar", "Elegí con 1 2 3… o tocando".
- **Por qué confunde:** nunca le dice WASD / Espacio / 1 2 3 / R. Es la primera media hora y delata un port de celular. Hay 158 apariciones de "tocá/toque/pulgar" en JS/HTML fuera de i18n.
- **Dónde:** `js/systems/alpha-training.js:26-27` y `:66-80`; `js/ui/how-to-play.js:13`; `js/assets/preload.js:58`; `index.html:341`; `js/ui/run-intro.js:105`; `js/systems/horde-relics.js:326`.
- **Arreglo:** el texto correcto ya existe en el otro camino de entrada ("Movete con WASD o las flechas", "Apretá 1, 2 o 3 (apuntan al mouse)", `js/ui/first-minute.js`). Elegir el texto según `DESK.device` y `deskActionLabel()`:
  - Paso 2: "Movete con **W A S D** o las flechas." (mando: "Movete con el stick izquierdo.")
  - Paso 3: "Mantené **Espacio** (o clic izquierdo): {n} golpea al enemigo cercano. Derrotá al esqueleto."
  - Paso 4: "Las habilidades pegan mucho más. Apretá **1**, **2** o **3**: salen hacia donde apunta el mouse."
  - Paso 7: "Dejá el mouse sobre una habilidad para leer su ficha." Paso 14: "Apretá **Esc**: el Panel táctico muestra…"
  - Título: "Tocá para continuar" → "Menú principal". Primer guardián: "Elegí uno: es tu regalo…". Ficha: "Enter o clic para empezar". Reliquias: sacar "o tocando" con teclado/mando.
- **Decisión del dueño:** no.

### 2. Joystick y botonera táctil en pantalla durante toda la partida en PC
- **Pantalla / resolución:** partida (campaña, tutorial, Horda), 1280x720 y 1920x1080, con teclado y con mando.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n20-match-4s.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/p06-pad-hud.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/h-opc-controles.png`.
- **Qué ve:** un joystick azul abajo a la izquierda que no usa, y abajo a la derecha la rueda de botones táctiles. En Opciones › Controles aparecen "Modo zurdo: joystick a la derecha", "Tamaño de los controles", "Opacidad de los controles" y una vista previa del joystick.
- **Por qué confunde:** ocupa pantalla, tapa enemigos y refuerza la sensación de port.
- **Dónde:** `css/hud.css:184` (`#joyzone`), `css/controls.css:21-27` (ya existe `body.inp-kb` / `body.inp-pad`).
- **Arreglo (CSS):** `body.inp-kb #joyzone, body.inp-pad #joyzone{ display:none; }`. La rueda de habilidades puede quedar como barra de recargas, pero más chica y centrada abajo. En Opciones, ocultar con teclado/mando: Modo zurdo, Tamaño, Opacidad y la vista previa.
- **Decisión del dueño:** sí, menor: si en PC la rueda de habilidades queda en la esquina o pasa a una barra inferior.

### 3. A 1920x1080 la interfaz no escala: menú en una columna de 1000 px y HUD diminuto
- **Pantalla / resolución:** todo, 1920x1080.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/f05-after-skip.png` (menú), `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/f02-starter-1080.png` (primer guardián), `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/f07-prep-1080.png` (partida).
- **Qué ve:** el menú principal ocupa 1000 px centrados con 280 px vacíos arriba y la tarjeta DESAFÍOS cae sola a una segunda fila. "Tu primer guardián" deja dos tercios de la pantalla en negro. En partida el mundo se agranda pero el HUD queda en píxeles fijos: panel de vida de 165 px, textos de 12-14 px, botones de 54 px en la esquina.
- **Por qué confunde:** 1080p es la resolución más común en Steam; se lee chico y parece una ventana de celular estirada.
- **Dónde:** `css/ui-kit.css:164` y `:179`, `css/hub-scroll.css:5` (`max-width:1000px`); HUD en px en `css/hud.css`.
- **Arreglo:** escala de interfaz global. Mínimo viable: `@media (min-width:1600px) and (min-height:900px){ html{ zoom:1.5; } }` (y `zoom:2` desde 2560x1440), verificando que el canvas compense el zoom. Mejor: opción "Escala de interfaz 100/125/150/200 %" junto a "Tamaño del texto". Para la tarjeta huérfana: `grid-template-columns:repeat(5,1fr)` en la fila EXPLORAR.
- **Decisión del dueño:** no (sí requiere una pasada de QA visual completa).

### 4. Elegir guardián para la Horda Infinita: 7.000 px de scroll hasta el botón "Entrar a la Arena"
- **Pantalla / resolución:** "ELEGI TU GUARDIAN" (estado `menu`), 1280x720. Se llega desde HORDA INFINITA y desde "Volver al menú" tras una partida rápida.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/e01-endless-open.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/e02-endless-bottom.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/p04-pad-champsel.png`.
- **Qué ve:** 46 tarjetas en una grilla de 2 columnas y 420 px de ancho, en una pantalla de 1280. La página mide 7.129 px; el único botón para seguir ("Entrar a la Arena") está en y=6964. Arriba solo se ve "‹ Volver". Enter no avanza. Con mando el foco salta entre los "Habilidades y estilo" y no entra en las tarjetas (son `div` sin rol): no pude elegir guardián con mando.
- **Por qué confunde:** el jugador elige un guardián y no pasa nada; no hay indicio de que el botón está al fondo.
- **Dónde:** `css/menus.css:146-149` (`.champ-grid{grid-template-columns:1fr 1fr; max-width:420px}`; la versión de 6 columnas solo aplica a `max-height:520px`, `css/menus.css:193`).
- **Arreglo (CSS):** `@media (min-width:900px){ .champ-grid{ grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); max-width:1180px; } }` y `#start-btn{ position:sticky; bottom:12px; z-index:5; }`. Además: tarjetas con `role="button" tabindex="0"`, doble clic o Enter = entrar, y mostrar primero las propias.
- **Decisión del dueño:** no.

---

## ALTO

### 5. Esc no vuelve atrás en casi ninguna pantalla
- **Pantalla / resolución:** Códice, Guardianes, Tienda, Multijugador, Desafíos, Cuenta, Guerra de Cristales, Coliseo, Sala, selección de guardián, primer guardián, derrota, resultados de Horda. 1280x720.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/m-tienda-new.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/m-perfil-new.png`.
- **Qué ve:** aprieta Esc y no pasa nada (comprobado pantalla por pantalla: el estado no cambia). Solo funciona en Opciones, Ranking, "¿Cómo se juega?" y pausa. En la pantalla de cuenta ni siquiera hay botón Volver a la vista a 720 de alto.
- **Por qué confunde:** en PC Esc = atrás; con mando B sí vuelve en todas, o sea que la lógica ya existe.
- **Dónde:** `js/core/input-desk.js:245-250` (Esc solo cierra Opciones o pausa); la búsqueda del botón "atrás" está en `js/core/pad-nav.js` (`PN_BACK_SEL`, `PN_BACK_TXT`).
- **Arreglo:** en ese mismo manejador, si no hay partida ni Opciones, ejecutar la misma acción "atrás" que usa B del mando (clic en el botón Volver/Cerrar visible de la capa superior). En el menú principal, Esc puede abrir Opciones. Las flechas tampoco mueven el foco en menús (solo Tab): reutilizar la navegación espacial del mando para las flechas.
- **Decisión del dueño:** no.

### 6. "JUGAR AHORA" del título deja al jugador nuevo en un callejón de guardianes bloqueados
- **Pantalla / resolución:** título → JUGAR AHORA → derrota → "Volver al menú". 1280x720, guardado vacío.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/q01-jugar-ahora.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/q06-start-locked.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/q08-volver2.png`.
- **Qué ve:** el botón más grande del título lo mete en la Arena 03 con Sylva (que no es suya) y mecánicas propias ("Rastreo 0/5", "Impulso 0/10", "Runas"). Al terminar, "Volver al menú" no va al menú: va a "ELEGI TU GUARDIAN" con los 46 guardianes a 2.500 de oro (tiene 25) y el aviso "Ese guardián está bloqueado: desbloquealo en la Tienda". Hacen falta tres "Volver" (guardianes → arenas → Modos y multijugador con "Buscando salas…") para llegar al menú, donde recién JUGAR ofrece el guardián gratis.
- **Por qué confunde:** cree que tiene que pagar para seguir jugando; el regalo del primer guardián queda escondido. Además hay dos primeras experiencias distintas: esta (con guía de teclado) y "Tocá para continuar" (tutorial táctil, hallazgo 1).
- **Dónde:** `index.html:644` (`#menu-btn-1`), `js/ui/menus.js:526`; rótulos del título en `js/ui/ux-simplify-b.js` y `js/ui/ui-rework.js:10`.
- **Arreglo:** si `!save.starterChosen`, "Volver al menú" abre directamente "Tu primer guardián" (`openStarterSelect`) y después el menú principal. Rótulo del botón del título: "JUGAR AHORA · Partida de prueba con Sylva".
- **Decisión del dueño:** sí: cuál es LA primera experiencia en Steam (recomiendo una sola: elegir guardián → tutorial con teclas → Arena 01).

### 7. Sala de preparación: el retrato se estira y pisa los textos
- **Pantalla / resolución:** Sala › Equipo (campaña y Horda), 1280x720.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n14-after-battle.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n16-prep-bottom.png`.
- **Qué ve:** un retrato gigante y deformado (392x528 para un lienzo de 104x104) llena la pantalla. Abajo, el nombre, "Nv. 1", "Ver habilidades" y "Cambiar campeón" quedan superpuestos con "Equipo, talentos y progresión" y con el desplegable.
- **Por qué confunde:** es la pantalla previa a cada partida y se ve rota; no se entiende qué es clicable.
- **Dónde:** `css/base.css:51` (`canvas{width:100%; height:100%}`) le gana a `css/duo-ux.css:3` (`.duo-card canvas` sin tamaño); solo el caso celular apaisado fija 64 px (`css/duo-ux.css:10`).
- **Arreglo (CSS, una línea):** `.duo-card>canvas{ width:160px; height:160px; }` en `css/duo-ux.css`.
- **Decisión del dueño:** no.

### 8. Enter en la Ficha de arena manda a la Sala y la ficha aparece dos veces
- **Pantalla / resolución:** menú → JUGAR (clic) → Ficha de arena → Enter. 1280x720. Reproducido dos veces.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n13-after-jugar.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n14-after-battle.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n18-match-5s.png`.
- **Qué ve:** con clic en "¡A LA BATALLA!" entra a jugar. Con Enter termina en la Sala (el foco seguía en el botón JUGAR de atrás) y, al apretar "Comenzar partida", le muestran la misma ficha otra vez.
- **Por qué confunde:** Enter es la tecla natural para confirmar; el mismo paso da dos resultados.
- **Dónde:** `js/ui/run-intro.js` (apertura de la ficha) y `js/ui/menus.js:340`.
- **Arreglo:** al abrir la ficha, mover el foco a `.ri-go` y que su manejador de Enter haga `preventDefault()` + `stopPropagation()`. De paso: Enter en el título no hace nada (debería equivaler al botón principal).
- **Decisión del dueño:** no.

### 9. Los refuerzos de nivel no se pueden elegir con teclado
- **Pantalla / resolución:** "Nivel N superado — elegí un refuerzo", 1280x720.
- **Captura:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n23-pause.png`.
- **Qué ve:** tres cartas; probé Tab, Enter, 1, flechas y Espacio: nada. Solo clic. La pantalla gemela de reliquias (`/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/e08-relic-choice.png`) sí acepta 1 2 3 y muestra los números; con mando ambas funcionan.
- **Por qué confunde:** aparece cada nivel, en medio del combate, con las manos en WASD.
- **Dónde:** `js/ui/buff-choice.js:23` (cartas `div.buff-card` sin foco ni teclas); referencia buena en `js/systems/horde-relics.js`.
- **Arreglo:** misma mecánica que las reliquias: insignias 1/2/3, teclas 1 2 3, flechas + Enter, y la nota "Elegí con 1 2 3 o con clic".
- **Decisión del dueño:** no.

### 10. "undefined" y textos internos a la vista en la Tienda y el título
- **Pantalla / resolución:** Tienda › Destacados › CROMAS, Tienda › Skins, Tienda › Brasas, título. 1280x720.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/t01-shop-undefined.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/m-premium-new.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n01-title-1280.png`.
- **Qué ve:**
  - "Garren, el Eslabón · undefined", "Morwen… · undefined", "Dáriel… · undefined", "Tobías… · undefined" en cuatro cromas a 1.200 Brasas.
  - En Skins: "Sets sin skin todavía (arte pendiente, ver docs/assets_faltantes/skins_sets/): …" (nota de desarrollo; texto leído del DOM visible, sin captura propia).
  - "Soporte: correo sin configurar" y la etiqueta "BORRADOR" junto a Términos/Reembolsos, en el título y en la Tienda.
  - "LA HORDA — ALFA COOPERATIVA" e "Instalar en mi dispositivo" en el título.
  - "FOUNDER · GM UNICO" (inglés mezclado) en Fundadores.
- **Por qué confunde:** un "undefined" al lado de un precio en moneda paga es motivo directo de reseña negativa.
- **Dónde:** `js/ui/shop-ui.js:257` (`p.crystalLabel` sin valor), `js/ui/shop-ui.js:474`, `js/ui/legal.js:47`, `index.html:186`, `index.html:179`.
- **Arreglo:** `:257` → `${p.champName}${p.crystalLabel ? " · " + p.crystalLabel : ""}`. `:474` → borrar el bloque o dejar "Próximamente: más apariencias de set." Ocultar la fila de soporte si no hay correo y sacar "BORRADOR" al publicar. Título: "LA HORDA · v{versión}" y sin enlace "Instalar" en la build de Steam.
- **Decisión del dueño:** sí: correo de soporte y textos legales finales.

### 11. En inglés quedan pantallas enteras en español
- **Pantalla / resolución:** con `I18N.setLang('en')`, 1280x720: pausa / Panel táctico, resultados de Horda, Sala de Horda, Tienda.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/en09-results.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/en06-endless-prep.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/en02-shop.png`.
- **Qué ve (texto leído del DOM visible):**
  - Pausa: "Partida en pausa. Objetos y talentos se cambian en la Sala…", "Daño: 42% del daño", "Energía: 42", "Duración: 4,5 s", "sin equipar", "Puntos de habilidad disponibles", "Guía de juego".
  - Resultados de Horda: "La Horda siguió avanzando", "Tu récord queda en este dispositivo.", "⟳ UNA MÁS", "Botín juntado", "Jefes y subjefes vencidos", "Récord global".
  - Sala de Horda: "la Cicatriz elige las arenas", "∞ Rondas sin fin…".
  - Tienda: "Entrá con tu cuenta para comprar con Brasas.", "varias apariencias de un campeón…", "1 apariencia sin comprar", "Ver solo las de Thalen", "Skin al completarlo", "Insignia de Vesper/Nahir/…".
  - HUD: "Élites dobles", "La Ciudad Arde ×4". Ayuda: "1. Tu objetivo".
- **Bien traducidos:** menú principal, Desafíos, Opciones, elección de reliquia.
- **Por qué confunde:** el público de Steam es mayoritariamente angloparlante. NEXT_SESSION solo anota como pendientes los textos de Rangos; esto es bastante más.
- **Dónde:** tablas en `tools/i18n/tr/`; textos armados por plantilla en `js/systems/endless.js:630-660`, `js/ui/tactical-panel.js`, `js/ui-clarity/shop-clarity.js:41` y `:112`, `js/ui/shop-ui.js:546`.
- **Arreglo:** pasar esas cadenas por la tabla y agregar un test que recorra estas pantallas en EN/PT buscando tildes y palabras en español.
- **Decisión del dueño:** sí: si EN y PT se anuncian como idiomas soportados en la ficha de Steam el día 1.

### 12. Menú principal: la Horda Infinita está bloqueada para el nuevo y nueve destinos compiten
- **Pantalla / resolución:** menú principal, guardado vacío, 1280x720.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/m-endless-locked-new.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n11-after-jugarya.png`.
- **Qué ve:** JUGAR destaca bien. Pero HORDA INFINITA dice "Completá la Arena 02 (Fábrica Sin Fin) para desbloquearla", mientras Guerra de Cristales y Coliseo, en tarjetas grandes, están abiertos desde el minuto uno. Debajo de JUGAR hay un recuadro casi vacío con "REPETIR TUTORIAL · 3 min" y "▸ Guía · Nivel 1: Primeros pasos". En total 9 destinos más 6 botones arriba.
- **Por qué confunde:** el modo de retención está cerrado y los dos que la beta quería esconder están abiertos. Esto se suma a la decisión abierta (1) de NEXT_SESSION; el dato nuevo es que la Horda está bloqueada.
- **Arreglo:** para el jugador nuevo, mostrar solo JUGAR + HORDA INFINITA (con candado y barra "Arena 1 de 2") y plegar "Otros modos" hasta completar la Arena 02. Mover "Repetir tutorial" y "Guía" al botón "? Ayuda" y eliminar el recuadro.
- **Decisión del dueño:** sí.

---

## MEDIO

### 13. Rangos de Cicatriz: escondidos en la segunda pestaña, a 10 px y sin explicar
- **Pantalla / resolución:** Sala › pestaña "Horda Infinita", 1280x720.
- **Captura:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/e04-endless-arena-tab.png`.
- **Qué ve:** la Sala abre en "Equipo" (el retrato del hallazgo 7), así que los Rangos no se ven si no cambia de pestaña. En la pestaña, todo va en tres renglones apretados arriba con el resto vacío. Fichas "0 I II 🔒🔒🔒" a 9,6 px y la descripción a 10 px (medido), por debajo del piso de 14 px. Nada explica qué es "la Cicatriz" ni un "mutador".
- **Dónde:** `css/endless.css:106` (`font-size:0.6rem`) y `:110` (`font-size:0.8em`); la Sala rotula "Sala · …" aunque se juegue solo (`js/ui/menus.js:418`).
- **Arreglo:** `.en-scar-chip{font-size:14px}` y `.en-scar-info{font-size:14px; opacity:1}`. En la Horda, abrir la Sala en esa pestaña. Texto: "RANGO DE CICATRIZ — dificultad extra opcional. Cada rango suma reglas más duras y multiplica tu puntaje. Llegá a la ronda 10 para abrir el Rango I." Con un solo jugador, titular "Preparación · Horda Infinita".
- **Decisión del dueño:** no.

### 14. Títulos sin tilde: "ELEGI TU GUARDIAN", "DESAFIOS", "MECANICA", "BOTIN", "¡NUEVO RECORD GLOBAL!", "RUINAS CELTICAS"
- **Pantalla / resolución:** todo título en fuente pixel, cualquier resolución.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/e01-endless-open.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/m-desafios-new.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n13-after-jugar.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/e10-endless-results.png`.
- **Por qué confunde:** se lee como falta de ortografía, y al lado el mismo término aparece con tilde en la otra fuente ("DESAFÍOS" en el menú, "DESAFIOS" en la pantalla).
- **Dónde:** es deliberado: `js/ui/pixel-font-fix.js` quita las tildes porque el archivo de Press Start 2P no trae mayúsculas acentuadas.
- **Arreglo:** incluir el subconjunto latino completo de la fuente (Á É Í Ó Ú Ü) y retirar `pixel-font-fix.js`.
- **Decisión del dueño:** no.

### 15. Tres monedas, dos sin nombre a la vista
- **Pantalla / resolución:** cabecera del menú y de la Tienda, 1280x720.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/a01-menu-adv.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/m-tienda-new.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/a05-quests-Pase.png`.
- **Qué ve:** el oro con ícono y número; al lado una ficha violeta "✦ — +" sin palabra (son las Brasas, sin saldo porque no hay cuenta). Las Gemas no aparecen en ninguna cabecera aunque el pase y los resultados las regalan ("◆ 2 Gemas", "Gemas +3 ◆"): con 320 gemas en el guardado no las vi en menú, Tienda ni Guardianes. La pestaña Brasas sí explica bien ("Las Brasas solo compran apariencia. Nunca poder.").
- **Dónde:** `index.html:199` (nombre solo en `title`/`aria-label`); gemas solo en `js/ui/inventory-ui.js:165`.
- **Arreglo:** tres fichas rotuladas: "🪙 Oro 48.250 · ◆ Gemas 320 · ✦ Brasas 0", con ayuda al pasar el mouse: Oro "se gana jugando; compra guardianes y objetos", Gemas "se ganan jugando; mejoran objetos", Brasas "solo apariencias; nunca poder". Sin cuenta, mostrar "✦ Brasas 0" en vez de "—".
- **Decisión del dueño:** sí: si en la versión de Steam sin cuentas las Brasas se muestran o se ocultan.

### 16. Resultados de la Horda: "RECORD GLOBAL" que es local y textos pegados
- **Pantalla / resolución:** resultados de Horda Infinita, 1280x720.
- **Captura:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/e10-endless-results.png`.
- **Qué ve:** "¡NUEVO RECORD GLOBAL!" y, justo debajo, "Tu récord queda en este dispositivo." "Global" significa "entre todos tus guardianes", pero se lee "mundial". La línea "Te faltaron 8 rondas para Cicatriz III" está pegada a la insignia "Cicatriz II". El botón "Creá una cuenta para entrar al ranking" se parte en cuatro renglones. Esc no sale.
- **Dónde:** `js/systems/endless.js:638` y `:659`.
- **Arreglo:** "¡NUEVA MEJOR MARCA!" y "Tu mejor marca (todos los guardianes)". Poner la insignia del rango primero y separada: "Cicatriz II · te faltaron 8 rondas para abrir la III". Botón: "Crear cuenta" con `white-space:nowrap`.
- **Decisión del dueño:** no.

### 17. Compañeros con nombres de persona y etiqueta P2/P3/P4; el jugador sin etiqueta
- **Pantalla / resolución:** partida en solitario, 1280x720 y 1920x1080.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n20-match-4s.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/f07-prep-1080.png`.
- **Qué ve:** entra solo y aparecen "P4 Elena", "P2 Dylan", "P3 Fede" (en otras partidas "Diego_G", "Lobo", "Manu"), amontonados sobre su personaje, que no lleva marca. Recién la pantalla de derrota aclara "Esta partida incluyó compañeros controlados por el juego."
- **Por qué confunde:** no sabe cuál es él y cree que juega online con desconocidos; nombres de persona en bots suelen leerse como jugadores falsos.
- **Arreglo:** etiqueta "VOS" (o flecha) sobre el propio durante los primeros 10 s; bots rotulados "BOT · Elyra" (nombre del guardián, no de persona) o con ícono de robot.
- **Decisión del dueño:** sí: nombres humanos en bots.

### 18. Ficha de arena: demasiada información para la primera partida y texto cortado
- **Pantalla / resolución:** Ficha de arena 01, 1280x720.
- **Captura:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n13-after-jugar.png`.
- **Qué ve:** antes de su primera partida: cita de lore, Objetivo, "Lo que te mata", "Lo que te ayuda" y cuatro cajas (Mecánica, Peligro, Jefe, Botín destacado con "Profecía del Alba · 0/6" y seis casillas "?"). Una caja corta su texto: "…mantener RESCATAR y escoltarlos a un…". El botón "¡A LA BATALLA!" tiene el rótulo a 12,8 px dentro de un botón de 528 px. "estructuras críticas" y "Profecía del Alba" no se explican.
- **Arreglo:** para el novato, solo Objetivo + una línea de ayuda + botón; el resto detrás de "Ver más". Sacar el recorte (`-webkit-line-clamp`) de esas cajas. Rótulo del botón a 18 px. "estructuras críticas" → "los 5 edificios de la ciudad".
- **Decisión del dueño:** no.

---

## BAJO

### 19. Avisos emergentes tapan los botones de arriba a la derecha
- **Pantalla / resolución:** menú principal y ficha de guardián, 1280x720.
- **Capturas:** `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n11-after-jugarya.png`, `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/a03-g-skins.png`.
- **Qué ve:** el aviso ("Entrenamiento completado…", "Horda Infinita: Completá la Arena 02…", "LOGRO DESBLOQUEADO") cae sobre Idioma / Opciones / ⋯ en el menú y sobre "Reliquias Únicas" y las flechas ‹ › en la ficha.
- **Arreglo (CSS):** anclar el contenedor de avisos abajo al centro (`top:auto; bottom:24px; left:50%; transform:translateX(-50%)`) o bajarlo a `top:84px`.
- **Decisión del dueño:** no.

### 20. Contradicciones chicas de rótulos
- **Pase:** arriba dice "Nv. 1" y la tarjeta "Nivel 2 / 30" — `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/a05-quests-Pase.png`. Usar un solo número (el del pase).
- **Nivel vs Arena:** el HUD dice "Nivel 1/10" y la pausa "Arena 2/10" para lo mismo, junto a "Nv. 2" del guardián — `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n26-pause.png`. Proponer "Oleada 2/10" para la arena y reservar "Nivel" para el guardián.
- **Sets:** la ficha dice "Tienda: las piezas se compran con oro" (`js/ui/codex/codex.js:624`) y la Tienda muestra las mismas piezas como "No obtenido · Se consigue jugando" — `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/a03-g-sets.png` y `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/a04-shop-Objetos.png`. Dejar una sola versión (requiere confirmar con el dueño cuál es la regla).
- **Tutorial:** el botón verde "▶ JUGAR YA" lleva al menú principal, no a jugar — `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/n10-tut-checkpoint.png`. Rótulo: "Terminar e ir al menú", o que arranque la Arena 01.
- **Carruseles:** las filas horizontales (recompensas del pase, cromas y skins de la Tienda, pestañas de "¿Cómo se juega?") se cortan en el borde sin flechas ni barra — misma captura del pase y `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/t01-shop-undefined.png`. Agregar flechas ‹ › o hacer que la rueda del mouse desplace en horizontal.
- **HUD de Horda:** textos cortados "∞ Ronda 4 · 2.249 pts · …" y "Engranajes Implacable…" — `/tmp/claude-0/-home-user-La-Horda/04b52423-a24b-572b-bfbd-23078b1c4a24/scratchpad/dept/ux/shots/e09-endless-playing.png`. Ensanchar el panel a 240 px en escritorio.

---

## Decisiones que necesita tomar el dueño

1. Cuál es la primera experiencia única en Steam: JUGAR AHORA con Sylva o guardián → tutorial → Arena 01 (hallazgo 6).
2. Qué modos ve el jugador nuevo y si la Horda Infinita sigue bloqueada hasta la Arena 02 (hallazgo 12).
3. Si EN/PT se anuncian como soportados el día 1 (hallazgo 11).
4. Correo de soporte y textos legales finales (hallazgo 10).
5. Brasas visibles u ocultas en la versión sin cuentas (hallazgo 15).
6. Nombres humanos en los bots (hallazgo 17).
7. Rueda de habilidades en la esquina o barra inferior en PC (hallazgo 2).
