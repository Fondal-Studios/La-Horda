# Resumen ejecutivo — Beta Visual Impact (Ruinas Élficas · Sylva)

**Estado: NO APROBADO por el umbral del encargo (90/100).** Mejor puntaje independiente: **89,6/100** (ronda 6; main 79), cero
regresiones críticas. No se fusionó a `main`. No hay PR abierto (la herramienta de GitHub se desconectó en esta sesión).

## Qué se entrega
Slice jugable (abrir `index.html`; `?beta=0` = comportamiento de main): título con Sylva animada y **JUGAR AHORA** (1 toque),
feedback táctil de habilidades, impacto de combate (golpe/daño/muerte/definitiva/caída), Ruinas con luz, niebla, runas y
peligros legibles, botín con presentación propia por rareza. Detalle y límites de arquitectura: `VISUAL_IMPACT_SLICE.md`.

## Evidencia
| Qué | Resultado |
|---|---|
| Pruebas propias (`tools/beta/test-beta.js`) | 23/23 PASS (flag, 1 toque con perfil vacío y táctil, feedback, peligro, 7 rarezas, ulti, caída, camino clásico) |
| Aislamiento de partida (`test-rng-isolation.js`) | Mismos kills/vida/daño/botín/estado del RNG con `?beta=0` y `?beta=1` |
| Puertas existentes del repo | 9/9 PASS (t_juice, t_ground_loot, t_hit_react, touch-targets, a11y-prefs, text-overflow, first-minute-taps, hub-legibility, arena-briefing) y emoji-lint |
| Toques de título a primer control | main 3 (mejor caso; ≥7–9 con perfil nuevo) → rama **1** |
| Rendimiento (`perf.json`, 3 corridas A/B, headless por software) | `render()` +0,70 ms (+15 %) media, +12 % p95: bajo el umbral crítico de +25 %. Cuadros reales: ruidosos |
| Capturas/video | `captures/before-after/*.png`, `captures/video/main_vs_beta.mp4` |

## Evaluación independiente (a ciegas, A/B)
| Ronda | Rama | main | Críticas | Veredicto |
|---|---|---|---|---|
| 1 | 87 | 80 | 0 | FAIL (<90) |
| 2 | 87 | 74 | 0 | FAIL (<90) |
| 3 | 86 | 81 | 0 | FAIL (<90) |

| 4 | 89 | 78 | 0 | FAIL |
| 5 | 89 | 78 | 0 | FAIL |
| 6 | 89,6 | 79 | 0 | FAIL (0,4 bajo el umbral) |

La rama supera a main por 7–13 puntos, pero no llega a 90. Reparaciones aplicadas tras las rondas: nombres de botín
acotados a 4 (apilaban), caída del jugador más clara, glow de ulti y chispas reducidos, botón clásico con más contraste,
fundido de arranque limpio. Pendiente para llegar a 90 según los hallazgos: menor costo de partículas/efectos en escena
densa (rendimiento 82), jerarquía de la racha vs. contador, y volver a evaluar. Ronda 3: el evaluador marcó rendimiento 70 (p95 de cuadros reales 66,7 ms vs 33,3 en la captura con video; medición ruidosa, no es regresión crítica pero es el freno principal).

## Decisiones que necesitan a S0C / aprobación humana
No hay rastro de S0C ni de una UI Factory en el repo ni canal en esta sesión: se reutilizó `ui-kit.css`/`prefs.js`. Abiertas:
enganches por envoltura vs. puntos de extensión; botín de muestra de la demo (5.ª y 11.ª baja) vs. producción; pareja
Sylva+Ruinas para la partida rápida; telón del título hecho con el atlas de arena. Sin su visto bueno no se fusiona.

## Limitaciones honestas
Evidencia en Chromium headless con render por software, no en teléfonos reales; el evaluador es un modelo viendo capturas,
no jugadores; 1 campeón y 1 arena; multijugador no probado en vivo (la capa es local y no envía nada a la red).


## Ronda 6 y cierre
Tras la autorización para repararla, se aplicaron: anillo ancla del héroe, definitiva menos saturada, nombres de botín ≤3, rayado de peligro liviano, menos chispas/almas. Rendimiento re-medido en 5 corridas A/B: `render()` medio 5,8 ms (rama) vs 6,8 ms (main); sin regresión. Lo que sigue frenando los últimos 0,4: fracción de cuadros lentos en headless (22,7 % vs 20,8 %, ruido de software-render) y amontonamiento en el centro durante la definitiva. No se declara aprobado.

Art Factory 2.0 (S0D): PR independiente #253 (`claude/art-factory-2`).
