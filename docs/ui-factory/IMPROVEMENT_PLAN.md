# IMPROVEMENT_PLAN — UI Factory (Módulo B)

Prioridad = impacto en cada partida × costo × riesgo de conflicto con otros agentes (ver INTEGRATION_CONTRACTS.md). Números de defecto = `BASELINE.md §4`.

| Prio | Defecto | Acción | Estado iteración 1 |
|---|---|---|---|
| P0 | #1 Ataque sin presión visible; #2 Ult sin respuesta en pointerdown; #8 rechazo solo al soltar | Adaptador `UF-HUD v1` (`js/ui-factory/hud-feedback.js` + `css/ui-factory/hud-feedback.css`) | **Implementado** |
| P0 | #3 Blancos < 44 px en menús | `css/ui-factory/menus-touch.css` (mín. 44 px, casillas pixel-art) | **Implementado** |
| P1 | #5 ARIA del HUD | `role`, `aria-label`, `aria-disabled` | Implementado (parcial: sin `tabindex`, ver riesgos) |
| P1 | #9 «sin energía» sutil | Anillo azul discontinuo al presionar | Implementado solo al presionar; estado estático sin cambios |
| P2 | #4 Carga: «Continuar» bloqueado ~5,2 s | Requiere tocar `js/main.js`/precarga (archivos ajenos) | **Diferido**: necesita contrato aprobado |
| P2 | #6 Pasos para repetir partida (3, a veces 4) | Requiere cambiar flujo Hub→Sala (`js/ui/hub.js`, ajeno) | **Diferido** a contrato UF-NAV v1 |
| P2 | #7 «Comenzar»/«Continuar» flotantes tapan contenido | Rediseño de pantallas Sala/Pausa | **Diferido** |
| P3 | #10 FPS, #11, #12, #13 | Sin cambio (no empeorar FPS: la fábrica no dibuja en canvas) | n/a |

## No se promete
Retención D1/D7, tasa de tutorial, abandono: **no medibles** sin telemetría y pruebas con usuarios. Esta fábrica solo reduce fricción medible (blancos, feedback) y registra las cifras reales.

## Criterios de aceptación globales
Los de `DESIGN_SYSTEM.md §2` + condiciones obligatorias del Gate 1 (cero solapes críticos, cero botones inoperantes, cero regresiones de gameplay, navegación no peor que la línea base: 3 toques / 1,77 s).
