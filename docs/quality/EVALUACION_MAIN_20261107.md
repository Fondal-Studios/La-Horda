# Evaluación de `main` — 2026-11-07 — **72/100 antes de los arreglos · 78/100 después, aprobado con reservas**

Puntuación del implementador (juicio sobre datos medidos; **no** es el scorecard del repo). Base: `qa.js --fast` sobre la integración resuelta (134 pruebas: 128 PASS, 5 FAIL, 1 FLAKY), ejecución de las 4 pruebas rojas contra `main` previo, y la auditoría de arte (`docs/art-gate/AUDITORIA_COHERENCIA_20261107.md`).

| Área | Nota | Evidencia |
|---|---|---|
| Arranque, guardados, móvil, multijugador simulado | 90 | inicio 8/8, guardados 7/7, móvil 7/7, simulado 6/6 |
| Economía y tienda | 82 | 19/20 (el rojo era el filtro SKINS del Códice) |
| Campeones y habilidades | 78 | 41/42 (herreros de Ilsa, Vorn y Kora faltaban; `sismo` flaky) |
| Rendimiento | 75 | p50 6,3 ms · p95 17 ms · pico 243 ms, sin GPU (no es FPS real) |
| Coherencia artística | 62 | guardianes coherentes con Thalen; pendientes jefes de campo, Micelial, 6 enemigos nuevos |
| Proceso y gobernanza | 55 | sin revisión independiente registrada; merges por API |

## Pruebas rojas y qué se hizo (rama `fix/main-red-tests-20261107`)
| Prueba | Causa | Acción |
|---|---|---|
| `t_camp` | `CAMP_SMITH_HERO` sin Ilsa, Vorn, Kora | 3 líneas del herrero en su voz |
| `t_champs_se` E11 | `damageEnemy` tira crítico al azar por enemigo; un crítico en el lejano invertía cerca/lejos | la prueba fija `Math.random` durante el sismo (no cambia la aserción) |
| `t_champs_se` E17 / TEAM.boss | intermitentes **bajo carga** (pasan en 8/9 corridas aisladas) | **no corregidas**: quedan como intermitentes |
| `browser-collection` | `codex.js` reintrodujo (revert de #239) que SKINS incluya los sets; el dueño lo separó el 2026-11-07 | se quita esa cláusula |
| `test-libro-unico` | la ayuda de la arena pasó a `#pause-help-arena` en la nueva Pausa; la prueba leía `#tactical-panel` | la prueba lee la Pausa completa (el contenido está) |
| clasificación QA | `madre-espora-animation.yml`: `continue-on-error` sin declarar y `trap … \|\| true` | se declara en `tolerated` con su motivo y se quita el `\|\| true` |

## Revisión independiente (estado)
**No registrada.** Pendientes, por personas/identidades distintas del implementador: QA, arquitectura, staging (rama `beta/…`) y aprobación de un director de `reviews/DIRECTORES.json`. Este documento es insumo para esa revisión, no la sustituye. No se creó ningún `reviews/*.json`.

## Sin evaluar
Dispositivos reales, relay multijugador real, pagos reales, CI de GitHub sobre el `main` fusionado. Seis pruebas pasan sin imprimir aserciones (falsos verdes posibles): `functional.js`, `required-files.js`, `check-presentation-browser.js`, `shop-pricing-browser.js`, `pricing-sync.js`, `welcome-picks.js`.

## Resultado tras los arreglos (`qa.js --fast`, rama `fix/main-red-tests-20261107`)
133 pruebas: **132 PASS, 1 FLAKY, 0 FAIL**; `art-factory-python`, `clasificacion`, `server` y `pixel-density` en PASS. La intermitente es `t_champs_se` (esta vez E19.agotamiento; pasó al reintentar): sigue siendo sensible a la carga. Las áreas de Campeones y Proceso suben (+6 y +8 en mi juicio); arte, rendimiento y revisión independiente no cambian.
