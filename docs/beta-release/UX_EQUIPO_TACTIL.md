# UX equipo — lente móvil/táctil, legibilidad y accesibilidad (ES/EN/PT)

Evaluador: móvil/táctil. Método: Playwright (`?lazy=0&lang=es|en|pt`, `hasTouch`) en 844x390, 667x375, 932x430 y 1280x720, 11 pantallas
(hub, Modos, Arenas, Guardianes, Tienda, Pase, Códice, Opciones, Pausa, Derrota, Victoria; título excluido), con auditoría automática
(texto <12 px, objetos táctiles <44 px, texto recortado, desbordes) más revisión visual de cada captura. No se tocó el joystick ni la cámara.
Capturas: `docs/beta-release/ux-equipo-captures/` (`<pantalla>-<idioma>-<viewport>.png`; extras `opciones-scroll-*`, `tienda-en-1280x720-focus.png`).
Limitaciones: la grilla de Arenas salió vacía en mi arnés (`arenaselect-*.png`, se llamó `setState` sin el flujo real) y Victoria sin datos de partida;
no son hallazgos. Las alertas de recorte de iconos `.pxi` son ruido (emoji sustituidos por pixel-art) y se descartaron.

## Lo que está bien
- Hub en celular horizontal: todo en una pantalla, tiles >=44 px alto, sin texto <14 px (el test existente se cumple). Cabecera opaca.
- Opciones existentes y completas: zurdo, vibración, modo de ataque, tamaño/opacidad de controles, sacudida, reducir movimiento, texto grande,
  alto contraste, daltonismo (con demo), carteles de bots. Interruptores y segmentados tienen 44 px de alto. Hay flecha "hay más abajo" sobre "Listo".
- Pausa ofrece Reducir movimiento y Reducir efectos como atajo, y enlaza a Opciones (`#pause-opts-btn`).
- Foco de teclado visible en todos los elementos del hub (1280x720); el modal de Opciones devuelve el foco al botón.
- Cero errores JS en las 132 combinaciones auditadas.

## Hallazgos (con evidencia)

### P1 — Traducciones incompletas: se mezclan idiomas en pantallas principales
- `?lang=en` Tienda (`tienda-en-1280x720-focus.png`): "TU PRÓXIMA META", "se gana jugando las arenas", "Te faltan 150 of gold", "Ver Básicos",
  "Desbloquear", "OFERTA -30%", nombres de objetos ("Guanteletes de Morvath…", "Brazales Veloz del Viento").
- `?lang=pt` Tienda (`tienda-pt-667x375.png`): "TU PRÓXIMA META", "Lo más barato que da poder", "Te faltan", "Ver Básicos". Guardianes PT: etiqueta "Tienda" (`guardianes-pt-667x375.png`).
- `?lang=pt` Modos (`modeselect-pt-667x375.png`): "¿Un amigo creó una sala? Escribí su código… entrás directo".
- `?lang=pt` Derrota (`gameover-pt-667x375.png`): "Esta vez la Horda te perdona… Te quedan 2 derrotas…" y toast "Hermandad". Victoria PT: toast "Hermandad" (ES).
- `?lang=en` Hub: botón "REPETIR TUTORIAL · 3 min" (`mainmenu-en-844x390.png`). Opciones PT: nota "Teclado: WASD o flechas… También funciona con mando" en ES (`opciones-scroll-b-pt-844x390.png`).
- Etiqueta `Loot` (EN) / `Saque` (ES) del botón de la cabecera no es clara frente a "Botín/Brasas"; revisar con el equipo de textos.

### P1 — Toasts tapan botones de cierre en pantallas de fin
- En 667x375 el toast "Logro desbloqueado" (abajo a la derecha) cubre "Continuar" en Victoria y "Volver al menú" en Derrota
  (`victory-pt-667x375.png`, `gameover-pt-667x375.png`). Hay que mover la columna de toasts o hacerla no interactiva/auto-descartable sin tapar.

### P1 — Objetos táctiles <44 px en móvil
- Hub: 6 botones de icono de cabecera miden 40x44 (`css/menu-polish-a.css:101` fija `width:40px`): `#hub-tele-btn, #hub-howto-btn, #hub-pass-btn, #hub-lang-btn, #hub-options-btn, #mainmenu-back-btn` (los 3 viewports).
  Además `#mainmenu-back-btn` (⏏) está pegado al de Opciones: riesgo de salir al título por error.
- Opciones: `#opt-name, #opt-lang, #opt-music-style` y los sliders `#opt-vol-music/#opt-vol-sfx/#opt-ctl-size/#opt-ctl-op` miden 40 px de alto.
- Pase (`#bp-screen`): botones "Iniciar sesión" 42 px y "Cerrar" 32 px de alto, con fuente 11,5 px (`button.btn.small`), en todos los idiomas.
- Pausa en 1280 (mouse/híbrido): sliders `#vol-music/#vol-sfx` 28 px de alto. En celular quedan bien.

### P2 — Accesibilidad difícil de encontrar
- Las opciones de accesibilidad están muy abajo: panel de Opciones 1452 px con 372 visibles (~4 pantallas de scroll en 844x390). "Controles" empieza a 256 px, "Pantalla"
  (reducir movimiento, texto grande, contraste, daltonismo) a 659 px (`opciones-scroll-*-pt-844x390.png`). No hay índice ni secciones plegables; el único indicador es una flecha pequeña.
- Texto grande, alto contraste y daltonismo no están en la Pausa (solo movimiento y efectos); el atajo "Opciones: zurdo, texto, vibración…" se corta con "…" en PT (`pausa-pt-667x375.png`).
- Modo zurdo solo existe dentro de Opciones del hub (se ve en celular sin saber que existe); no hay prompt la primera vez con el mando táctil.
- `.opt-sub` ayuda mide 12 px (`css/menu-polish-a.css:81`); aceptable en el mínimo pero con "Texto grande" activado no se verificó que crezca todo el modal.

### P2 — Texto recortado/partido por traducciones largas
- Códice PT: "GUARDIÕES" se parte como "GUARDIÕE/S" y "BESTIÁRIO" como "BESTIARI/O" (`codice-pt-667x375.png`, `.cx-home-title` con `overflow-wrap:anywhere` y fuente 11 px en 667x375, bajo 12 px).
- Hub: `#hub-endless-sub` ("Completá la Arena 02 (Fábrica Sin Fin) para desbloquear") recortado con elipsis en los 3 idiomas y 3 viewports (319>197 px en 667x375) — la condición de desbloqueo es información clave y se pierde.
- Hub ES 844x390: "Nv. 1" se parte en dos líneas en la tarjeta JUGAR (`mainmenu-es-844x390.png`).
- Guardianes: `.cx-card-title` (subtítulo "la Guardiana del Alba", "the Lord of the Crypts") recortado 118>111 px en todos los idiomas.
- Tienda 667x375: `.shop-item-sub` ("Lendário · Capacete") recortado 104>77; `.shop-hero-title` <12 px.
- Pausa PT/EN: etiqueta "Reducir efectos intensos" pegada al interruptor, sin aire (`pausa-en-844x390.png`).

### P3 — Teclado / PC
- Orden de Tab en el hub 1280x720: perfil, Brasas, tele, buzón, ayuda, pase, idioma, opciones, volver, JUGAR, **Horda Infinita, Ranking**, luego Guerra de Cristales, Coliseo, Códice…
  El orden DOM salta el panel de modos (visualmente Cristales/Coliseo están a la derecha de JUGAR). "⏏ volver al título" queda a un Tab de Opciones.
- Tienda 1280x720: las tarjetas de skins y de ofertas se cortan a la derecha en carrusel (elementos hasta x=1465 con viewport 1280) sin barra ni indicador de scroll horizontal (`tienda-en-1280x720-focus.png`).
- Contraste: botón "Desbloquear" y precios en las ofertas diarias (gris sobre fondo oscuro, `tienda-en-1280x720-focus.png`) se ven apagados/deshabilitados aun cuando son acciones.

## Correcciones propuestas (priorizadas)
| # | Prio | Corrección | Archivo / selector probable | Esfuerzo |
|---|---|---|---|---|
| 1 | P1 | Completar claves faltantes ES→EN/PT: Tienda (meta, "Te faltan", "Ver Básicos", "Desbloquear", "OFERTA"), Modos PT, Derrota PT, toasts de logros, "Repetir tutorial", nota de teclado | `js/i18n/en.js`, `js/i18n/pt.js`, `js/ui/shop-ui.js`, `js/ui/end-screens.js`, `js/ui/hub.js`; agregar test que falle si hay español en ?lang=en/pt | M |
| 2 | P1 | Que los toasts no tapen botones de fin: subirlos o ponerlos arriba al centro y `pointer-events:none` | `css/onboarding.css` (`#toast-stack.end`), `js/ui/screens.js toastStackHost` | S |
| 3 | P1 | Iconos de cabecera del hub a 44x44 (ancho) y separar ⏏ de ⚙; si no entra, pasar Tele/Ayuda al sheet "⋯" ya existente | `css/menu-polish-a.css:101` `#mainmenu-screen .hub-top .ui-icon-btn`, `js/ui/ui-rework.js` (CFG.moreSheet) | S |
| 4 | P1 | Campos y sliders de Opciones y botones del Pase a min-height 44 px y fuente >=12/14 px | `css/controls.css`/`css/menu-polish-a.css` (`#hub-options input,select`), `css/battlepass.css` (`#bp-screen .btn.small`) | S |
| 5 | P2 | Atajos de accesibilidad arriba: mover "Pantalla/Accesibilidad" antes de Controles (o plegar secciones) y chips de salto ("Controles · Pantalla · Legal") fijos sobre el scroll | `index.html` `#hub-options` (orden de `.opt-sec`), `js/ui/hub.js` | M |
| 6 | P2 | Mostrar el motivo de bloqueo de Horda Infinita completo (2 líneas o `title`) en lugar de elipsis | `css/ui-kit.css:363` y `css/hub-scroll.css:50` `.hub-endless-sub` (`white-space:normal; line-clamp:2`) | S |
| 7 | P2 | Títulos del Códice sin partir palabras: `overflow-wrap:normal; hyphens:auto`, fuente >=12 px, `lang` en el html | `css/codex.css:65` `.cx-home-title` | S |
| 8 | P2 | Subtítulos de tarjetas recortados: permitir 2 líneas (`.cx-card-title`, `.shop-item-sub`) y piso de 12 px en `.shop-hero-title` | `css/codex.css`, `css/shop*.css` | S |
| 9 | P2 | Primer arranque en táctil: pregunta única "¿Sos zurdo?" y acceso a Opciones desde la Pausa con las 4 de accesibilidad (texto, contraste, daltonismo, zurdo) en vez de solo 2 | `index.html` `#pause-screen .pause-audio`, `js/core/prefs.js` | M |
| 10 | P3 | Orden de foco del hub igual al visual (Jugar → Cristales → Coliseo → Multijugador → Códice…), `tabindex` o reordenar DOM | `index.html` `#mainmenu-screen`, `js/ui/ui-rework.js` | M |
| 11 | P3 | Indicador de scroll horizontal (sombra/flechas/paginación) y botón "Desbloquear" con contraste AA en Tienda | `js/ui/shop-ui.js` carrusel, `css/shop*.css` `.shop-btn:disabled` | M |
| 12 | P3 | Test automático: extender `tools/ux/test-touch-targets.js` / `test-text-overflow.js` a menús (Opciones, Pase, Pausa, Códice) en los 3 idiomas con piso 44 px/12 px | `tools/ux/test-touch-targets.js`, `tools/ux/test-text-overflow.js` | M |

Nota de coordinación: #3 y #10 tocan el hub reorganizado por `js/ui/ui-rework.js` (sheets MODOS y ⋯); coordinar con el equipo que lo mantiene. Ninguna propuesta toca joystick ni cámara.
