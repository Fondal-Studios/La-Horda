# Evaluación independiente de diseño y arte 2 — La Horda (beta abierta)

Solo lectura salvo este documento y `docs/beta-release/eval2-captures/` (`pc-*` 1280x720, `mv-*` 844x390; `?lang=es|en|pt&lazy=0`, assetsAllReady, dsf 1, tutorial hecho). Partida real con `startRun`/`setState('playing')` (12 s + movimiento/ataque/habilidades). Fin de partida con `showGameOverScreen()` / `showVictoryScreen()` (datos de partida casi vacíos: victoria con "Enemigos vencidos 0").

## Puntajes (0-100)

| Eje | Pts | Evidencia |
|---|---|---|
| Coherencia pixel-art retro | 84 | Logo/escena del título, hub con iconos pixel, sprites y banners (`pc-es-01`, `pc-es-02`, `pc-es-09`). Resta: fondo de ladrillo plano en Modos/Arenas/Pausa/Fin y ligadura "fi" rota ("Élñcas", "Calificación") en la fuente. |
| Jerarquía / legibilidad | 77 | JUGAR domina el hub y la Tienda se lee. Texto de 9-10 px en Objetos/Skins/Modos (`pc-es-06b-tienda-objetos`, `pc-es-04`), gris sobre marrón en arenas bloqueadas. Códice y Guardianes: "CODICE" sin tilde, barra "Reliquias Únicas" de 9 px que no dice nada. |
| Riqueza artística de menús | 66 | Título, hub, Códice y Victoria (banner de arena + héroe) son buenos. Arenas (`pc-es-05`: 1 tarjeta ilustrada + candados oscuros sobre vacío), Modos (texto), Pausa, Pase y Opciones siguen siendo cajas de texto. Mejor que antes, aún dos niveles. |
| Consistencia entre pantallas | 70 | Marco naranja + título pixel se repite. Rompen: Opciones pegado a la izquierda, no centrado y cortado abajo ("Vista previa" se corta, `pc-es-08`); Pase como modal minimalista; Guardianes/Códice con cabecera propia (barra extraña) distinta del resto; en Opciones las etiquetas Música/Estilo/Efectos están centradas y desalineadas con "Tu nombre". |
| UX táctil / PC | 77 | Móvil muy bueno: hub en una pantalla (`mv-es-02`), HUD con joystick y botones grandes (`mv-es-10b`), Tienda legible. Fallos: Opciones móvil muestra ~1/3 sin pista de scroll (`mv-es-08`), el joystick táctil aparece también en PC (`pc-es-10`), hub PC a 720 de alto apenas entra, texto "Arsenal · Forja · Subastas" asoma tras Opciones en móvil. |
| Onboarding | 76 | "JUGAR AHORA" + próxima partida, "Tu primer guardián", Guía en hub y Códice, aviso de oleada en partida, "Qué pasó?" en derrota. Resta: dos CTAs en el título ("Tocá para continuar" vs JUGAR AHORA), Pase/Brasas piden sesión sin vista previa, Horda Infinita bloqueada sin preview. |
| Polish / feedback | 72 | Pantallas de fin ya con héroe, stats, calificación por rol y toasts de logro/pase (`pc-es-12`, `pc-es-13b`); insignias NUEVO/OFERTA. Resta: título superpuesto "LAS ULTIMAS PALABRAS · GUARDIAN ANCESTRAL" (dos líneas pisadas, sin tildes, `pc-es-13`), Pausa con interruptores blancos de sistema, "Brasas -" sin sesión. |
| Localización EN/PT (visual) | 62 | Hub EN/PT impecable y sin cortes (`pc-en-02`, `pc-pt-02`). Pero: Códice EN mezcla ("GUARDIANS" / "BESTIARIO", "JEFES", "0 / 70 descubiertas", subtítulo y GUÍA en español, `pc-en-09`); Códice PT con "Reliquias Únicas", "GUÍA · aprender a jugar", "tuyos/descubiertas", "CRONICAS"; Tienda EN/PT "Objetos" con nombres de set y descripciones en español ("Mortaja Cosida", "Se consigue jugando", "Legendarios (24)", `pc-en-06b-tienda-objetos`); "REPETIR TUTORIAL · 3 min" en EN y PT; "Guardiôes" con ligatura rara en PT. |
| Juego en partida | 88 | Sprites y arenas sólidos, HUD claro, aliados con nombre, aviso de oleada, anillos de habilidad legibles, VFX con peso (`pc-es-10`, `pc-es-10c`, `mv-es-10b`). Resta: con muchos efectos (círculo de aura + blancos en `10c`) los enemigos se pierden; nombres de aliados pequeños; paneles del HUD superior izquierdo ocupan mucho en PC. |

## Global ponderado

Pesos: coherencia 15, jerarquía 10, riqueza menús 15, consistencia 10, UX 10, onboarding 8, polish 7, localización 10, partida 15.
0.15*84 + 0.10*77 + 0.15*66 + 0.10*70 + 0.10*77 + 0.08*76 + 0.07*72 + 0.10*62 + 0.15*88 = 12.6+7.7+9.9+7.0+7.7+6.1+5.0+6.2+13.2 = **75.4 → 75/100**.

Lectura: la partida y el título están en nivel 85+; la beta se resiente por menús secundarios vacíos y por la localización (EN/PT dejan español visible justo en las pantallas de gancho: Códice y Tienda de Objetos).

## Fallas restantes (priorizadas)

1. Códice EN/PT con textos en español (tarjetas, subtítulo, contadores, GUÍA, barra "Reliquias Únicas", "CRONICAS"). `js/ui/codex/codex.js`, `js/i18n/*`.
2. Tienda > Objetos en EN/PT: nombres de piezas/sets, "Se consigue jugando", "No obtenido", filtros "Legendarios/De guardián/Básicos" sin traducir. `js/ui/shop-ui.js`, datos de ítems/sets + i18n.
3. "REPETIR TUTORIAL · 3 min" y otros literales del hub fuera del diccionario en EN/PT. `js/ui/menus.js`, `index.html` (hub).
4. Opciones: panel pegado a la izquierda, cortado abajo en PC ("Vista previa"), en móvil muestra ~1/3 sin pista de scroll; etiquetas desalineadas. `css/` de `#hub-options`.
5. Menús vacíos: Arenas (candados sobre negro, 1 sola ilustración), Modos (solo texto), Pausa (interruptores de sistema), Pase (modal minimalista). `css/`, `js/ui/menus.js`, `js/ui/battlepass-ui.js`.
6. Victoria: cabecera "LAS ULTIMAS PALABRAS · GUARDIAN ANCESTRAL" superpuesta y sin tildes (fuente pixel sin glifos Ú/Á/Ó; también "CODICE"). `js/ui/end-screens.js` + fuente/`css`.
7. Ligadura "fi" rota en la fuente mono ("Élñcas", "Calificación"); desactivar `font-variant-ligatures`. `css/`.
8. Barra "Reliquias Únicas"/"Arsenal · Forja · Subastas" en Guardianes/Códice: ruido visual, 9 px, y se filtra tras Opciones en móvil. `js/ui/` (inventario/hub).
9. Joystick táctil visible en PC sin touch. `js/ui/touch-controls*`/`css`.
10. Texto 9-10 px en Tienda Objetos/Skins y Modos (descripciones, "0/4 piezas"). `css/` tienda.
11. Dos CTAs competidores en el título ("Tocá para continuar" vs "JUGAR AHORA"). `js/ui/title*`.
12. Pase y Brasas sin sesión: sin vista previa de recompensas reales ni de qué se gana; Horda Infinita bloqueada sin preview. `js/ui/battlepass-ui.js`, `js/ui/shop-ui.js`.
