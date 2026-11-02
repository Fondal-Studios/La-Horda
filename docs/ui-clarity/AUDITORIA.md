# Auditoría de interfaz en partida — rama `feature/ui-clarity-hud-shop` (2026-11-02)

**Alcance de este bloque:** HUD en combate y habilidades (bloque 1 de 3). Catálogo/detalle/equipamiento y compra/recuperación/medición quedan para los bloques 2 y 3 (ver `PLAN.md`); **no se tocó la tienda**.

## Estado de partida (inspección previa, no se reconstruyó nada)
`main` ya incluye la **UI Factory** (#258, commit `34ac2852`): feedback de presión/confirmación/rechazo de los botones (`UF-HUD v1`), objetivos táctiles ≥ 44 px en menús (`UF-MENU v1`) y ajustes de layout (`UF-LAYOUT v1`), con su línea base en `docs/ui-factory/BASELINE.md`. Esta rama **se apoya** en ese contrato (consume el evento `uf:reject`) y **no lo modifica**. Diferidos por la UI Factory que siguen abiertos: carga bloqueada ~5 s, pasos para repetir partida, botones flotantes en Sala/Pausa (otro contrato).

## Método
`tools/ui-clarity/audit.js` mide los rectángulos **reales** de 15 grupos de elementos del HUD en 5 dispositivos (844×390, 667×375, 932×430, 568×320, 1280×720) y 3 estados (normal, avisos+banner de botín, definitiva lista con poca energía) y lista los pares que se pisan. Capturas en `docs/ui-clarity/audit/`. Chromium headless sin GPU: **mide geometría, no rendimiento ni comprensión humana.**

## Observado (medido)
| # | Sev. | Hallazgo | Evidencia |
|---|---|---|---|
| O1 | Media | El chip de **objetivo** se superpone 641 px² con la **fila de aliados** (4 px) en los 4 móviles medidos, en todos los estados | `audit/before_overlaps.json` |
| O2 | Media | El **banner de rareza** de la capa Beta (#251, mío) pisa objetivo, vida y avisos en 568×320: 733 + 599 + 146 px² | idem |
| O3 | Alta | Una habilidad bloqueada solo **vibra/anilla** (UF-B5): no dice **por qué** (recarga, energía, nivel) ni cuánto falta. La Definitiva muestra un candado sin explicación | captura `ba_844x390.png` (antes) |
| O4 | Media | Una habilidad «lista salvo por energía» no se distingue de una disponible hasta pulsarla (el estado estático no cambia, lo dice `IMPROVEMENT_PLAN` de la UI Factory) | idem |
| O5 | Baja | Pulsar repetido sobre una habilidad bloqueada repite el rechazo (13 `uf:reject` en 12 toques) sin ninguna explicación acumulativa | prueba `spam` |

## Hipótesis (NO verificadas)
H1: jugadores nuevos abandonan habilidades por no entender el bloqueo. H2: el «amontonamiento» de números/efectos en combate denso reduce la lectura (lo señalaron evaluadores de la capa Beta, sin medición de jugadores). H3: la burbuja de motivo reduce pulsaciones repetidas. **Ninguna se afirma: requiere sesiones con jugadores** (`PLAN.md`, tareas breves).

## Fuera de alcance de este bloque (registrado)
* **Madre Espora** (cámara, núcleo expuesto, VFX): hay trabajo paralelo; no se editó. Contrato que se respeta: este bloque no dibuja en canvas ni toca `js/arenas/**` ni `js/rendering/**`.
* Zonas de daño vs. dibujo: no se tocó ninguna zona de daño.
* Diferenciación de peligro enemigo / aliado / curación por forma: pendiente (bloque 1b); la capa Beta ya dibuja los peligros de Ruinas con rayado + arco.
