# FINAL_APPROVAL — UI Factory (La Horda Beta)

Fecha: 2026-11-01 · Rama de trabajo: `feature/beta-ui-ux-factory` (commit `bad23a9c`, **evidencia cruda completa** de las 5 evaluaciones (~540 MB, incluida `evidence/eval1..eval5`), solo en esa rama; en `main` se conservan las capturas de línea base y de cada iteración) · Rama de integración: `integration/ui-ux-factory` (código + documentos + capturas curadas, sobre `main` en `fe8a1511`).

## Gate 1 — calidad (evaluador independiente)
| Iteración | Puntaje | Decisión |
|---|---|---|
| 1 | 73/100 | RECHAZADO |
| 2 | 83/100 | CORRECCIONES |
| 4 | 84/100 | CORRECCIONES (2 condiciones FAIL: prueba desactualizada, solape VOLVER/Curación) |
| 6 (final, UF-SIMPLE v1) | **85/100** | **APROBADO por el umbral de 85 fijado por el dueño; NO llega a 90** |

El umbral original del encargo era 90. El dueño del proyecto lo fijó en 85 durante la ejecución. Condiciones obligatorias: 6/6 PASS (dos con reserva: barra de «Comenzar» de la Sala cubre 16–29 px a scroll 0; en zurdo el minimapa rival cubre una habilidad —heredado de la base, `pointer-events:none`).

Mediciones del evaluador (headless, sin GPU): feedback de presión 240/240 botones (base 44/240), código→cuadro mediana 5,2 ms (meta < 50 ms); navegación hub→partida 3 toques (igual que la base); FPS 23,1 vs 24,8 (dentro del ruido); sin fugas en 66 s; elementos permanentes en pantalla a los 10 s: campaña 32→28, Cristales 58→53, Coliseo 50→46 (844×390).

## Gate 2 — arquitectura
- Contratos `UF-HUD v1`, `UF-MENU v1`, `UF-LAYOUT v1`, `UF-SIMPLE v1`: ver `INTEGRATION_CONTRACTS.md`. Aditivo: solo se editan `index.html` (+4 líneas) y `tools/ux/test-accessibility-prefs.js` (72→92 y 108→138 px, la prueba no se debilita).
- Probado sobre el `main` actual (con #251): `tools/ux` 8/8 rc=0, prueba del productor OK, `emoji-lint --strict` sin violaciones, `test-health-hud` y `test-critical-rewards` PASS. `tools/vfx/test-ult-forms.js` da timeout **también en `main` puro** (entorno), no se atribuye a este cambio.
- **No se obtuvo la aprobación formal del arquitecto general externo.** La integración a `main` se hace por **instrucción expresa del dueño del repositorio** («Mergea a main»), que reemplaza la regla del encargo de no mergear sin esa aprobación. El paquete UI sigue sin estar registrado en `docs/arquitectura-compartida/ownership.json` (PR #247 abierto): queda como seguimiento.

## Limitaciones declaradas
Evaluador = mismo modelo que el productor con contexto separado; sin hardware táctil real; Chromium headless sin GPU; online/invitado solo simulado; sin mando ni lector de pantalla; Revivir con estado forzado; Coliseo/Cristales solo ~12 s con bots; **retención D1/D7, finalización de tutorial y abandono NO se midieron** (no hay telemetría ni pruebas con usuarios).

## Seguimiento abierto (no bloquea)
D1 summary del hub/Cristales < 44 px con mouse (regla D5 fuera de su @media: pierde marcador ▸ y la selección crece 8 %); D2 el aviso OBJETIVO de 7 s no se re-arma en escritorio («¡derrotá al jefe!» queda oculto); D3 barra de la Sala; D4 minimapa rival sobre una habilidad en zurdo; pausa de escritorio 1280×800 con botones bajo el borde (heredado); decisión de diseño de perder «TU HORDA» y el botón SON.
