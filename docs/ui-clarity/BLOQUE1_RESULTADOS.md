# Bloque 1 — HUD y habilidades: resultados

## Qué cambió
1. **Motivo de bloqueo** (`js/ui-clarity/hud-reasons.js`, UC-HUD v1): una burbuja única, arriba a la derecha bajo Pausa (fuera del centro y de los controles), dice la habilidad y la causa: «Muro de Fuego: recarga 5 s», «Nova de Escarcha: faltan 33 de energía», «Cataclismo Elemental: se desbloquea en el nivel 5». Se calcula en el momento desde `player`; pulsar 12 veces no apila mensajes (1 burbuja, 1 evento `uc:reason`).
2. **Etiqueta persistente «FALTA n»** dentro del botón cuando solo falta energía: se entiende sin pulsar y sin depender del color.
3. **Contornos distintos por causa** (discontinuo = recarga, doble = energía, liso = bloqueada/carga) además del color.
4. **Layout:** corregida la superposición objetivo × fila de aliados (4 px en todos los móviles) y el banner de rareza de la capa Beta en 568×320.
5. Interruptor `?uc=0` / `localStorage.uc_off`; respeta `reduce-motion`; sin cambios de reglas, cooldowns, costos ni balance; no dibuja en canvas.

## Evidencia
| Qué | Resultado |
|---|---|
| `node tools/ui-clarity/test-hud-clarity.js` | 19/19 PASS (motivos, sin apilar, accesibilidad, 5 dispositivos × 3 estados sin superposición ni elementos fuera de pantalla, 568×320 y 667×375, interruptor, sin errores) |
| Auditoría de geometría (`audit/before_overlaps.json` → `after_overlaps.json`) | **18 pares superpuestos → 0** en 15 escenas |
| Puertas existentes | `tools/ui-factory/test-hud-feedback.js`, `test-touch-targets`, `test-accessibility-prefs`, `test-text-overflow`, `test-hub-legibility`, `test-first-minute-taps`, `t_juice`, `emoji-lint --strict`: PASS |
| Capturas antes/después | `evidence/ba_844x390.png`, `evidence/ba_568x320.png` |

## Revisor independiente (a ciegas, A/B; clave: A = antes, B = después)
Global 38 → **78** (claridad de estado 35 → 82, «se entiende por qué no se puede usar» 15 → 85, controles sin superposición 55 → 85, información secundaria fuera del centro 55 → 75, legibilidad 50 → 68). Sin regresiones atribuibles a la versión nueva.

**Límites y problemas abiertos que señaló (no resueltos en este bloque):**
* El tutorial inferior se corta en 568×320 («pulgar izqui…») — existente en main.
* El botón bloqueado conserva brillo/saturación de uno activo (falta atenuado/candado) y el aviso no se une visualmente al botón concreto (flecha o resalte) → bloque 1b.
* La cinta «FALTA n» llega al borde del botón en 844 px; evaluar versión más corta con ícono.
* El revisor es un modelo mirando capturas fijas (2 dispositivos): **no es evidencia de usabilidad con jugadores** ni de conversión. Tareas para jugadores en `PLAN.md`.
