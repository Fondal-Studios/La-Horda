# Checkpoint — 2026-10-22 — Myla caída

Rama `art/myla-production-20261022`, PR190. Base de esta continuación: `2ddae6e70a2293134ffda3c1f5570a2db5499817`, main observado `80683b03de58286398ef47de828c39196542c14d`. El commit que contiene este archivo identifica la entrega; no inferir persistencia local.

## Avance concreto

- Cuatro cuadros de caída existentes copiados exactamente a `assets/sprites/champions/myla/v2/death.png`.
- Carga `myla_death` en `js/assets/portadores-meta.js`; selección exclusivamente para apariencia base en `drawChampPackDeath`.
- Maestro original y Berrinche sin cambios. Lanzamiento y golpe conservados como fuentes; no instalados.
- `tools/art/check-myla-death.js`: prueba renderer real, cuatro vistas/seis niveles, hold final, fallback, reaparición, snapshots decodificados de invitado, skins, escala del maestro y Berrinche; produce `docs/art-gate/myla-death/runtime.json` y `runtime-comparison.png`.
- `.github/workflows/myla-death.yml`: reproducción, detector canónico, escáner, renderer, regresiones Guerrero/Tanque/Libertador y roster. Permisos de solo lectura.

## Evidencia local

`python art-source/entregas/bloques/B005_myla/revision-01/build.py` reproduce los PNG. `node art-source/entregas/bloques/B005_myla/revision-01/check-native.js`:28/28 PASS numérico, incluida caída4/4. Caída: semi0, halo0, fragmentos0. `node --check` pasa en los dos módulos cambiados y prueba nueva.

La descarga de Chromium y del headless shell falla con ZIP truncado en este entorno. No se presenta el detector numérico como aprobación del renderer. Gate visual a escala de juego PENDIENTE. PR sigue borrador. Estado del componente EN_CORRECCION; no VALIDADO ni INTEGRADO_MAIN, publicación sin verificar.

## Reanudar exactamente

1. Leer head actual de PR190; comprobar que incluye este checkpoint y no hay trabajo ajeno nuevo. No regenerar las fuentes.
2. Consultar workflow `Myla death component gate` del SHA actual. Descargar `myla-death-component` y revisar `myla-death/runtime.json`, `native.json`, `runtime-comparison.png`.
3. Corregir cualquier fallo sin bajar umbrales. Si el workflow aún no corrió, ejecutar con Playwright/Chromium: `node tools/art/check-myla-death.js`; el workflow contiene los demás comandos de regresión.
4. Solo tras gate visual, pruebas y checks requeridos PASS: marcar listo, releer base/head/reviews y merge con expected_head_sha. Registrar muerte como componente, nunca cerrar B005 completo.
5. Después, reparar mano/varita en lanzamiento/golpe. PR191 conserva Aelith FIX_NO_INTEGRAR con defectos exactos; no duplicar esa producción. PR166 sigue taller; Guerrero muerte ya main por PR187.

## Validación recuperada de GitHub — cierre del ciclo

El bloqueo de navegador local fue resuelto para esta validación mediante CI39768883095 sobre b95d6f54f5573e77f8d390a73dd87e43bd804d70: Myla139 checks PASS; Guerrero133, Tanque135, Libertador127 PASS; roster141 sin fallos. Artefacto descargado y hash ZIP verificado; runtime-comparison y hoja del roster inspeccionados: Visual Gate PASS asistido por Codex. Evidencias persistidas en docs/art-gate/myla-death/. Se registra solo muerte como VALIDADO, no como INTEGRADO_MAIN anticipadamente. Lanzar/golpe siguen EN_CORRECCION.

La siguiente acción sustituye los pasos de validación pendientes anteriores: comprobar todos los checks/reviews del HEAD final, marcar listo y mergear con expected_head_sha si todo está correcto. Consultar el estado real de PR190 para saber si ya se mergeó; registrar merge real en el PR. Continuar después mano/varita en esta fuente sin duplicarla. Si hay un fallo nuevo de CI, mantener borrador y corregirlo.
