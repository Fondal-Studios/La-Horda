# Brasa · primera pasada · 23/10/2026

Estado: GENERADO / EN_CORRECCION / NO_INTEGRAR. No VALIDADO, no INTEGRADO_MAIN, publicación no verificada.
Rama: `art/brasa-kit-first-pass-20261023`. Recuperación remota: `1b127e216d0bed57f661328317aa1d9a4c5a57cb`. Base de producción/pruebas: `758aa2ffacaae6542d31776e4a66ea7847a73b1b`.

## Producción e instalación de taller
B120/B121/B122: montaje mecánico (burst/nova), purga de tres bocanadas, desmontaje (burst/aura). B484: sólo A-PROP-sfa-steam, vapor de maestría/set reales; otros tres objetos de ese bloque intactos.
Seis atlas nativos, 72 fases: 68 no vacías y cuatro cierres transparentes intencionales. PNG de exportación usan buckets reales del motor; versiones diagnósticas128px previas conservadas en attempt-01. Fuentes reproducibles SFA en sources/brasa.js y ruta runtime js/champions/skill-fx-a/c/brasa.js; extensión opcional de bake y extras reconciliada del taller Baltra. No se importó arte Baltra. Los PNG son exportaciones de las recetas cargadas por el renderer, no sustituciones del cuerpo.

483 JS runtime comparados con la base: sólo engine.js, bind.js y c/brasa.js cambiados. 23 referencias de cuerpo/skins/canon/render/signature/UF byteidénticas. Básico nut/pressure, torreta, firma gear y sirena UF ya existen; B012/B433/cuerpo no se declaran completos por este lote.

## Validación realizada y límites
- 34 controles de atlas/cache/fallback PASS; seis reexportaciones exactas.
- 25 controles del kit PASS: construcción/cap, daño/cone, buff con y sin torreta, dueño/duración real, vapor de maestría y set, expiración/muerte/reset, básico.
- 254 regresiones Expedición PASS, como regresión compartida; no sustituyen las pruebas específicas de Portadores.
- Combate/RNG main frente candidato SFA activo:360frames,29521/29521llamadas y estado RESUMIDO idéntico. No snapshot completo ni aislamiento global.
- 10 sceneHash antes del cast idénticos:5acciones(base3+UF+purga maestría)×2viewports. UF seisPNG idénticos (tira/256/512ms por viewport). Vapor maestría real presente a80/256/512/1104ms, retirado a2000ms.
- Relay real host Solciju/invitado Brasa táctil con set4:5/6 controles PASS, uno FAIL preservado. Ambos ven turret/steam con mismo id/dueño y dibujan atlas nuevos. Host mount33/purge15/dismantle62/vent45; invitado66/33/96/68. Vent host~p/invitado base: no declarar relay integral PASS.
- Preview:26imágenes/6canvases/0errores. Es diagnóstico, no prueba del renderer; capturas del juego y relay separados.
- No nuevo gate de contraste estricto seis arenas, no performance sostenida/GC/dispositivo físico. Art Gate integral pendiente. CI exacthead debe consultarse; verde no eliminará estos FIX.

## Fallos y cola
Cola común31entradas preserva27previas. B120 herrajes pequeños/poco reconocibles; B121 rayos legados dominan bocanadas; B122 llaves/marcas finas bajo cuerpos/anillos; B484 variante discrepante host/invitado. REVIEW.json conserva IDs, fuente/atlas hashes, fase, diagnóstico y evidencia.
Intentos guardados: simulate.js antiguo abortó por undefined.pieces antes de terminar, sin causa raíz demostrada; primer relay4/5 y segundo5/6 mantienen el mismo fallo exacto de variante. El control añadido por familia demuestra que el atlas existe, no rebaja el control de variante. Export128px anterior guardado antes de exportar bucket96px real; runtime sin cambios por ese ajuste.

## Merge independiente confirmado
PR91 (guía Cómo se juega) INTEGRADO_MAIN con head0cab425359d7cdac534e69631cf04b493ad36992 y merge817610a78595e894995cec8032dd64149dbfe925. Diff6archivos revisado;7workflows pull_request + CodeQL + emoji-lint push SUCCESS; Safari intento3/job120638214053 PASS. Merge normal con expected_head_sha y main/API verificados. Livecheck publicado sigue fallando en sitio antiguo; publicación NO verificada. Los tests de Brasa corrieron en base758aa, no se presentan como prueba del nuevo UI.

## Reanudar
Leer HEAD fresco, este cierre, manifest/REMOTE_CLOSURE, REVIEW/TEST_ATTEMPTS, CORRECTION_BATCH y PR abiertos. No repetir Brasa/Baltra/Bront/Brakk primeras pasadas. Siguiente candidato: Cazadora B126/B127/B128, auditar consumidores/fuentes existentes antes de producir; UF B014 y básico/cuerpo no son ausentes por conteo documental. El taller Bront mantiene su rediseño separado.
Comandos exactos en recipe.json. Reproducción mínima: `CHROMIUM_PATH=/ruta/chromium node tools/vfx/verify-brasa-kit.js`; kit `node tools/portadores/brasa-firstpass-check.js`; relay `node tools/portadores/brasa-firstpass-online.js` actualmente debe devolver exit1 por variante. No mergear este borrador; aislar únicamente componentes aprobados tras Art Gate y CI con expected_head_sha.
Inventario global incompleto. Guardar cierre remoto del siguiente bloque antes de abrir otro.

## Cierre remoto
PR203 borrador. Producción7db617decd8bdfc9ae0737d1485a4067bf3fa39f;100archivos de producción cotejados con árbol remoto y hashes Git locales. REMOTE_CLOSURE.json registra verificación y pendientes. El commit de cierre contiene este documento y manifiesto actualizado; consultar HEAD fresco, no asumir el SHA de producción como último cierre.
