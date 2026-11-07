# Evaluación de diseño 3 (independiente) — La Horda, beta abierta

Método: Playwright, localStorage limpio, ?lang=es|en|pt&lazy=0, 1280x720 y 844x390. Capturas en `docs/beta-release/eval3-captures/` (varias son estados forzados por `setState`; gameover/victoria "real" con `showGameOverScreen`/`finishBossVictory`).
Referencias previas: 71 y 75.

## Puntajes (0-100)
| Eje | Pts | Evidencia |
|---|---|---|
| Coherencia pixel-art | 78 | Título con escena animada (héroes + jefe) muy lograda; hub, Códice, Guardianes y Tienda comparten marco/fuente/paleta. Restan: ring de telegraph pixelado de otra resolución sobre el mapa, pantalla legada "Elegí tu guardián" con retratos vacíos, Modos con iconos de otra escala. |
| Jerarquía/legibilidad | 77 | Hub: JUGAR dominante, Otros modos, Explorar; cabecera con 5 controles. Notas de 9-10 px en Opciones/Tienda; "Entrenamiento/Guía" muy débil; Horda Infinita bloqueada ocupa lugar prominente. |
| Riqueza artística de menús | 72 | Códice y Tienda ricos; Modos, Desafíos, Pausa, Opciones, Pase y gameover vacío = paneles planos sobre ladrillo sin arte; Arena de Campaña (pantalla Arenas) llegó vacía. |
| Consistencia entre pantallas | 73 | Botón atrás "‹ Volver" y marcos uniformes, pero Tienda/Modos centran con 1000 px y Códice/Guardianes a pantalla completa; títulos con distinta tipografía (Desafíos sin tilde "DESAFIOS", "ELEGI TU GUARDIAN"); gameover y pausa con layouts distintos. |
| UX táctil/PC | 78 | Hub cabe en 844x390 sin scroll; botones >=44 px; HUD de partida claro; Opciones con pestañas. Opciones en 390 px de alto muestra 5 filas; ocultamiento por pestañas ok. |
| Onboarding/simplicidad | 83 | Título "JUGAR AHORA" -> 1 clic a partida con bots y tutorial en pantalla; "Tocá para continuar" compite con él y lleva primero a elegir guardián inicial (2 clics). Menú: 5 verbos claros. |
| Polish/feedback | 73 | Modal de Pase abierto sin sesión es pobre; Brasas muestra "−"; pestaña de Tienda con highlight desincronizado un instante; ítem "Botín" del menú ⋯ sin icono; victoria mostraba pantalla casi vacía en estado forzado. |
| Localización EN/PT | 70 | PT casi limpio. EN: Códice "descubiertas · derrotadas · descubiertos · completadas · fragmentos · yours" sin traducir; nombres de ítems españoles ("Guanteletes de Ysmera, del Paso del Cazador", "Brazales del Acecho") en EN y PT; PT "Crónicas/Bestiario" sin acentos portugueses; descripciones de skin truncadas con "…". |
| Juego en partida | 80 | HUD limpio, habilidades legibles, compañeros con nombre/vida, buen feedback de daño; HUD móvil algo pequeño; pasivas/pausa con mucho texto. |

**Global ponderado: 76** (mejora marginal vs 71/75; sin saltos de calidad).

## Opciones perdidas
Muestra de 15 funciones de la matriz UX_EQUIPO_ARQUITECTURA verificadas alcanzables: Jugar/campaña, Entrenamiento, Guía nivel 1, Horda Infinita/Ranking, Guerra de Cristales, Coliseo, Códice, Guardianes (+Mi Inventario, Reliquias), Tienda (5 pestañas), Multijugador (código/crear/salas/Jugar ya), Desafíos (Diarios/Logros/Pase/Perfil), Pase, Ayuda, Idioma, Opciones (Accesibilidad/Controles/Legal y datos; Chat global, Arsenal·Forja·Subastas, Copiar/Restaurar código), ⋯ (Botín, Tele, Pase, Volver al título), Pausa (Estados/Kit/Talentos/Equipo/Resumen/Ayuda y opciones). No se detectaron opciones perdidas.

## Fallas restantes (priorizadas)
1. Localización EN/PT del Códice: contadores en español (`js/ui/codex/codex.js`, `js/i18n/en.js`, `pt.js`).
2. Nombres de ítems en español en EN/PT en Tienda/ofertas (datos de items, `js/data/items*.js` + i18n).
3. Pantalla legada "Elegí tu guardián" con retratos vacíos y título sin tilde (`index.html` menu-screen / `js/ui/screens.js`).
4. Pantalla Modos (y Desafíos, Pase, Opciones) con paneles planos; falta arte comparable a Códice/Tienda (`css/`, `js/ui/mode-select*`).
5. Pantalla Arenas de campaña se renderizó vacía al entrar por setState; confirmar entrada real y estado de carga.
6. Título: "Tocá para continuar" casi tan visible como "JUGAR AHORA" y lleva al selector de inicial; clarificar rol (`js/ui/title*`).
7. Textos de 9-10 px en Opciones/Tienda/Modos (`css/`), especialmente en 844x390.
8. Pase sin sesión: modal sin contenido útil; Brasas muestra "−" (`js/ui/battlepass-ui.js`).
9. Menú ⋯: "Botín" sin icono, alineación distinta (`js/ui/hub.js`).
10. Tienda: highlight de pestaña desincronizado momentáneamente; descripciones de skin truncadas (`js/ui/shop-ui.js`).
11. Gameover: contenido inferior (cita, tarjeta "¿Qué pasó?") cortado en 720 px (`js/ui/end-screens.js`).
12. Pausa en 844x390 muestra sólo 4 filas; la nota larga arriba consume espacio (`js/ui/tactical-panel.js`).
