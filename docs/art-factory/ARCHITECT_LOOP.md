# Lazo productor ↔ arquitecto

1. **Productor** (generador/compositor) entrega un candidato: atlas + clips + referencia del Códice (figuras de «BASE PARA SPRITES»).
2. **Arquitecto** ejecuta `tools/factory/architect/review.py` → `feedback.json` con `failures[]` (qué check falla, clip, cuadros) y `repaint[]` (cuadro, región, instrucción concreta de repintado y qué conservar: `keep`).
3. El productor aplica **solo** las instrucciones `repaint` (repintar o añadir una capa sobre lo pintado) y vuelve al paso 2. Cada ronda conserva su `feedback.json` y hashes.
4. `PASA_AUTOMATICO` ≠ ACEPTAR: siempre falta la revisión visual independiente en el renderer real (`capture-walk.js`, misma cámara/semilla), con veredicto ACEPTAR / CORREGIR / RECHAZAR.

Checks actuales: línea de suelo, cuadros duplicados, alternancia de apoyos (frontal/espalda), recorte en borde, deriva de tamaño/centro, regresión de poses únicas vs. clip actual, paleta vs. referencia. Límite conocido: el chequeo de apoyos no mide la vista lateral.
Validación: reproduce los fallos que halló el revisor humano en `layered-feet-v1` (`art-source/pilot-sylva-layered-prototype/feedback-layered-v1.json`).

# Auditoría (2026-11-01)
`tools/factory/audit/`: `dump-packs.js` (packs reales del juego), `capture-ingame.js` (idle en el renderer), `fidelity.py` (señales automáticas), `pair-sheet.py` (pares Códice | juego). Resultados: `AUDIT_FIDELITY_20261101.json`.
**Las métricas automáticas son ruidosas** (p. ej. figuras mal recortadas, poses distintas); solo priorizan. Hallazgo visual del cuadro de reposo (idle 0) de 40 campeones: la mayoría está cerca del Códice; las divergencias claras son **ynara** (vestuario distinto, sin báculo), **myla** (rostro/estilo distinto), **profeta** (diseño distinto), **aurelia, saelis, maura, renko** (ruido/blur o rasgos distintos), **libertador y facu_gm** (a verificar: recorte del Códice incierto). **tanque, guerrero y mago** usan un cargador antiguo (atlas 1024×1536 / 1254×1254) y no se auditaron. NO auditado todavía: cuadros de animación (ataque, habilidades, golpe, muerte), skins, enemigos, jefes, arenas, objetos, HUD, móvil.
