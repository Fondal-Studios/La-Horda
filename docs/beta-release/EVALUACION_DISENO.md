# Evaluación independiente de diseño y arte — La Horda (beta abierta)

Auditoría de solo lectura (no se tocó código). Capturas reales a 1280x720 (`pc-*`) y 844x390 móvil horizontal (`mv-*`) en `docs/beta-release/eval-captures/`, con `?lang=es&lazy=0`, assets cargados y guardado con tutorial hecho. Se llegó a cada pantalla con `setState`/`renderMainMenu`/`shopOpen`/`bpOpen` o clic en el botón real. Limitación: game over y victoria se forzaron con `setState` sin datos de partida real (ver nota en E.12); el pase de batalla solo se vio en su estado "sin sesión".

## Puntajes por eje (0-100)

| Eje | Puntaje | Evidencia principal |
|---|---|---|
| Coherencia con pixel-art retro | **82** | Logo pixel dorado, fuente monoespaciada pixel, sprites de guardianes y arenas muy sólidos (`pc-01-titulo`, `pc-09-codice`, `pc-10-hud`). Baja por los fondos de menú, que son degradado marrón plano sin trama pixel. |
| Jerarquía visual / legibilidad | **76** | Hub con JUGAR dominante y 2 niveles claros (`pc-02-hub`). Pero hay muchísimo texto de 9-11 px (descripciones de Tienda/Objetos, "Modos y multijugador") y gris sobre marrón de bajo contraste (arenas bloqueadas, `pc-05-arenas`). |
| Riqueza artística de menús | **58** | Excepciones buenas: título con escena, tarjetas del Códice, banners de skins. El resto (Sala, Arenas, Pausa, Game over, Victoria, Pase) es negro/marrón vacío con una caja de texto (`pc-05`, `pc-12`, `pc-13`). Iconografía mezcla emojis del sistema con iconos pixel (🗝, ⚡, ⚔, 🌐 en `pc-04-modos`). |
| Consistencia entre pantallas | **66** | Marco naranja + título pixel + botón "‹ Menú" se repite bien (Tienda, Códice, Modos). Rompen: Pausa (cajas estiradas y casillas blancas de sistema en PC, `pc-11`, distinto en móvil), Opciones (panel pegado a la izquierda, no centrado), Pase (modal minimalista distinto de todo lo demás). |
| UX táctil / PC | **72** | HUD móvil excelente: joystick y botones grandes con anillos (`mv-10-hud`). Hub móvil entra en una pantalla (`mv-02-hub`). Fallos: Opciones móvil muestra ~1/3 del contenido y "Listo" tapa ajustes (`mv-08`); cabecera del hub recorta "LA HORD" (`mv-02`); el hub PC se corta a 720 (tarjeta DESAFÍOS a medio ver). |
| Claridad del onboarding | **74** | "Tu primer guardián" con 4 tarjetas y explicación de rol (`pc-03b-jugar-click`), "JUGAR AHORA" en el título, guía en el Códice y tutorial en el hub. Baja por: "Tocá para continuar" ambiguo junto a "JUGAR AHORA" (dos CTAs en el título), Horda Infinita bloqueada sin vista previa, Pase y Brasas exigen sesión sin explicar qué se gana. |
| Polish / feedback | **62** | Insignias NUEVO/OFERTA, cuenta atrás de ofertas, barra "Tu próxima meta", partículas en el título. Faltan: pantallas de fin de partida sin recompensas/estadísticas ni animación, estados vacíos sin ilustración (Salas abiertas, Pase), Pausa sin marco. |

## Puntaje global ponderado

Pesos: coherencia 20, jerarquía 15, riqueza menús 20, consistencia 15, UX 15, onboarding 10, polish 5 (la beta pesa más lo visual de menús).

0.20*82 + 0.15*76 + 0.20*58 + 0.15*66 + 0.15*72 + 0.10*74 + 0.05*62 = 16.4 + 11.4 + 11.6 + 9.9 + 10.8 + 7.4 + 3.1 = **70.6, redondeado 71/100**.

Lectura: el juego en sí (sprites, escenarios, HUD de combate) está en nivel 85+, pero los menús "de paso" están 25 puntos por debajo. La beta se verá como dos productos distintos si no se nivela.

## Mejores y peores ejes
- Mejores: coherencia pixel-art (82), jerarquía/legibilidad (76), onboarding (74).
- Peores: riqueza artística de menús (58), polish/feedback (62), consistencia entre pantallas (66).

## Hallazgos por pantalla (resumen)
- **Título** (`pc-01`, `mv-01`): lo mejor del juego. Escena pixel con guardiana y runas, logo, selector ES/EN/PT, CTA ámbar. Dos botones compiten ("JUGAR AHORA" y "Tocá para continuar"); el pie "LA HORDA · ALFA COOPERATIVA" casi invisible sobre el fondo y la insignia "BORRADOR" roja sugiere producto sin terminar de cara a la beta.
- **Hub** (`pc-02`, `mv-02`): buena jerarquía (JUGAR héroe + modos + explorar). Iconos de tarjetas pequeños y en cuadros oscuros; "Guerra de Cristales" usa un rombo blanco genérico. En móvil el logo se recorta.
- **Selección de campeón / Guardianes** (`pc-03-guardianes`): grilla de 34 tarjetas con marco de esquinas doradas, nombre coloreado por rol: rica y clara. Subtítulos truncados ("la Guardiana del Al…"). Todas dicen "Tienda" con candado, sin precio visible.
- **Modos** (`pc-04`): pared de texto pequeño, sin arte por modo, emojis de sistema.
- **Arenas** (`pc-05`): lista de 10 arenas con solo icono de candado y texto; ninguna miniatura del escenario pese a tener arte de arena excelente (se ve en el Códice).
- **Tienda** (`pc-06-*`): Destacados y Skins son lo mejor de los menús (banners pintados, precios en Brasas, tarjetas de colecciones). Objetos es una lista de texto de 9-10 px muy densa (pero con iconos de ítem pixel correctos). Brasas, con la sesión cerrada, queda casi vacía.
- **Pase de batalla** (`pc-07`): sin sesión es una caja de texto sobre negro. No se pudo evaluar la rejilla de recompensas; para beta conviene mostrar una vista previa de recompensas sin sesión.
- **Opciones** (`pc-08`, `mv-08`): funcional y legible en PC, pero panel alineado a la izquierda con el hub visible detrás; en móvil horizontal no cabe.
- **Códice** (`pc-09`): muy buena. 4 portadas con silueta "?" para lo no descubierto, contadores 0/41, 0/70. Referente de calidad para el resto.
- **HUD** (`pc-10`, `mv-10`): claro, con feedback fuerte (anillos de habilidad, joystick, objetivo con temporizador, aliados). El panel superior izquierdo es denso pero legible.
- **Pausa** (`pc-11`, `mv-11`): la más floja visualmente. En PC los botones "Opciones" y "Cómo se juega" aparecen como cajas altas casi vacías y las casillas "Reducir…" son blancas de navegador.
- **Game over / Victoria** (`pc-12`, `pc-13`): título pixel rojo con buena intención, pero sin arte, sin resumen de botín/XP, composición vacía. Nota: forzadas con `setState`; en partida real puede mostrar más datos, aun así el fondo es plano.

## Mejoras priorizadas (máx. 12)

Esfuerzo: S ≤ 0,5 día, M 1-2 días, L > 2 días. "Arte nuevo" indica necesidad de Runway o pintor (`tools/art/painter`).

| # | Mejora | Archivo probable | Esf. | Arte nuevo |
|---|---|---|---|---|
| 1 | **Rehacer Pausa**: arreglar el layout (botones del mismo alto, casillas con estilo `ui-toggle` pixel, panel con marco naranja como Tienda). Es un bug visible a 1280x720. | `css/` de pausa + `#pause-screen` en `index.html` | S | No |
| 2 | **Pantallas de resultado con identidad**: fondo pintado/tinte por arena, sprite del guardián (muerto/triunfante), filas de XP/oro/ítems con animación de conteo y marco. | `#gameover-screen`/`#victory-screen` en `index.html` + `js/ui/screens.js` + CSS | M | Opcional (reusar sprites y arte de arena existentes) |
| 3 | **Miniaturas de arena** en selección de arenas (banner por arena como las skins de Tienda) y estado bloqueado con silueta, no solo candado. | `renderArenaGrid` en `js/ui/menus.js` + CSS | M | Sí si faltan recortes; ya existe arte de arena (Códice), así que primero reusar |
| 4 | **Fondo de menú pixel compartido** (dithering/tile de piedra o madera con viñeta y brasas sutiles en canvas) en lugar del degradado marrón plano de Sala/Modos/Arenas/Pausa/Resultados. | CSS global de pantallas (`css/`) o `<canvas>` de menú | M | Sí, un tile pixel 64x64 (pintor); versión CSS-only como paso 1 |
| 5 | **Nivelar iconografía**: reemplazar emojis de sistema (🗝 ⚡ ⚔ 🌐 🏆 📖) por iconos pixel del juego en Modos, Sala y hub. Hay set de iconos en Tienda (Brasas, oro, mochila) que se puede reusar. | `index.html`, `js/ui/hub.js`, `js/ui/menus.js`, `js/ui/ui-rework.js` | M | Sí, ~10 iconos nuevos 16-24 px (pintor) |
| 6 | **Opciones en móvil horizontal**: panel centrado con dos columnas (audio / controles), cuerpo con scroll y "Listo" fijo sin tapar ajustes. No tocar joystick ni su lógica, solo el layout del modal. | `openHubOptions` en `js/ui/hub.js` + CSS `#hub-options` | S-M | No |
| 7 | **Subir mínimos tipográficos**: descripciones de Tienda/Objetos/Modos de 9-11 px a >=12 px y cortar texto; contraste del gris sobre marrón (arenas bloqueadas, subtítulos). Hay un test de legibilidad del hub que se puede extender. | CSS de `#shop-screen`, `#modeselect-screen`, `#arenaselect-screen` | S | No |
| 8 | **Título más claro**: un solo CTA primario (convertir "Tocá para continuar" en "Menú" secundario ya existente en la config), subir contraste del pie, ocultar la insignia "BORRADOR" en el build de beta si procede. | `js/ui/ui-rework.js` (CFG title), `index.html`, CSS | S | No |
| 9 | **Hub: logo y cabecera móvil**: no recortar "LA HORDA" en 844 px (escala/ocultar texto) y que "DESAFÍOS" no quede cortado a 720 alto en PC. | CSS `.hub-top`, grilla `Explorar` | S | No |
| 10 | **Pase de batalla y Brasas sin sesión**: mostrar vista previa de recompensas bloqueadas (fila de iconos con candado) y un único CTA "Iniciar sesión", en vez de un modal de texto. | `js/ui/battlepass-ui.js`, `js/ui/shop-ui.js` | M | No (reusar iconos de ítems/skins) |
| 11 | **Animación/feedback de menús**: transición corta (fade o barrido pixel de 150 ms) entre pantallas, hover/pressed con desplazamiento de 2 px en botones, brillo animado en CTA "JUGAR" y "OFERTA". Respetar "Reducir movimiento" ya existente. | CSS global + `setState` en `js/ui/screens.js` | S-M | No |
| 12 | **Guardianes: estado de compra visible**: reemplazar "Tienda" con candado por precio en oro o etiqueta "Regalo"/"Poseído", y evitar truncar subtítulos (2 líneas o tooltip). | `js/ui/champions-hub.js` / `js/ui/champion-select.js` + CSS | S | No |

Orden sugerido de ejecución para la beta: 1, 7, 8, 9, 12 (rápidas, bajan riesgo), luego 2, 3, 6, 4, 5, 10, 11.

## Restricciones respetadas
Ninguna propuesta toca el joystick táctil ni la cámara local compartida, las skins siguen siendo cosméticas (la mejora 12 no cambia estadísticas) y no se modifica balance. Las propuestas con arte nuevo (3, 4, 5) deben pasar por el visual gate de `docs/ART_BIBLE.md`.
