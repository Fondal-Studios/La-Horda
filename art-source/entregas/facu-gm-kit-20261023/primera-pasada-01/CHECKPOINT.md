# Facu GM — primera pasada — 23/10/2026

Estado: GENERADO / EN_CORRECCION / NO_INTEGRAR. VALIDADO=false, INTEGRADO_MAIN=false, publicación no verificada. Taller borrador; no aprobación global del kit.

Base main `f62d181477adcb4607cc615411cc51bad769f681`. Recuperación `dc84f7dfab8de4f48263b846878718118c2e037a`, rama `art/facu-gm-kit-first-pass-20261023`. Último cierre remoto Eslabón PR206 leído; sin cierre perdido ni taller Facu concurrente entre17PR abiertos. PR204/91/200 ya integrados, no rehacerlos.

B135/B136/B137 y sólo A-PROP-sfa-as_current de B485: cinco atlas nativos,52 fases (49no vacías,3cierres transparentes;51RGBA distintos sumados por atlas, no52poses únicas). Corriente sinuosa/source, presión convergente, cresta de lanzamiento y espuma en trayectoria real. `as_foam` es subcapa B137, no nuevo ID inventado. Recetas conectadas al renderer sólo en esta rama. Preservados cuerpo, skin Soberano de la Fosa, básico wave/Quilla, iconos, firma y UF as_ocean/leviatanes. No cerrar B017/B247/B394/B413/B438/B637/B485 completos.

Auditoría: el antiguo sfaDash mide from/to iguales al cast de Cabalgar, emite dos bursts en origen y no beam; el movimiento se ejecuta después. Ahora espuma deriva de objetos as_foam reales replicados, con sus endpoints, dueños, radio26 y vida2000ms intactos. Corriente sigue objeto300u/r34/3500ms; presión conserva cue/radio/daño real. Sólo3runtime SFA cambian entre484JS;15referencias canónicas idénticas. engine/bind reutilizan extensiones optativas exactas de Eslabón/Dáriel, sin otros FIX.

## Verificaciones

-29 controles atlas/binary-alpha/bordes/caché/fallback PASS;5reexportaciones exactas.
-28 controles kit/lifecycle/dibujo de extremos reales PASS;225regresiones Ascensión PASS,0errores.
-360frames main/candidato,40680/40680 llamadas Math.random y estado RESUMIDO iguales; no snapshots completos ni aislamiento global.
-Relay real6PASS: hostSolciju/invitadoFacu táctil base. Draws currentbeam300/672, source9/28, pressure17/35, launch14/22, foam193/328; IDs/owners y objetos actuales coinciden. No certifica skin remota.
-8sceneHash precast iguales,6PNG UF idénticos horizontal/móvil. Comparación a mismos tiempos/escala; hojas reducidas y PNG nativos seleccionados. PREVIEW_CHECK separado, no timing del juego.

Intentos conservados: exportador con corchete extra falló antes del navegador; corregido arnés. Primer relay sin identidad fundador falló antes de partida con slot vacío; final usa cuenta efímera sólo loopback, política existente FOUNDERS_JSON por ID inmutable y DATA_DIR temporal/DATABASE_URL vacío. No cambios en cuentas reales, servidor ni permisos. Credenciales/token no guardados. Primer worktree origin/main ausente corregido usando SHA remoto explícito.

## Clasificación y siguiente paso

Art Gate FIX: B135 corriente fina/eléctrica y flechas/banda legadas dominantes; B136 espiral pequeña bajo cuerpos y anillo legado dominante; B137 franja blanca oculta espuma y falta cresta ligada al frente móvil. Beam conserva reloj global. Tres fallos con IDs/fuentes/hashes/capturas en cola40, conserva37históricas. Pendientes skins/equipo/seisarenas1:1, contraste compuesto, lifecycle de cresta, performance/warmup/culling/saturación y CI exacthead. No instalar ni mergear este taller.

Siguiente producción: auditar Farolero B138/B139/B140 en main y PR frescos, fuentes y consumidores reales de lantern/UF; no presumir ausencia por conteos. Avanzar primera pasada gruesa antes de volver a Facu/Eslabón/Dáriel/Brasa/Baltra/Bront/Brakk. Retomar con `git fetch origin art/facu-gm-kit-first-pass-20261023` y leer este cierre, REMOTE_CLOSURE.json y CORRECTION_BATCH.json. `recipe.json` contiene comandos exactos para reproducir; `NODE_PATH=... CHROMIUM_PATH=/tmp/chromium node tools/vfx/verify-facu_gm-kit.js` exporta las fuentes reales.

Inventario global incompleto. No nuevos merges ni publicación verificada en este bloque.

## Cierre remoto

PR207 borrador. Producción `b5932e678a1383e3185272d9f223a57c845feeb1`, árbol `6bbf769e2c72c6bc0636f6a5fd1b8a62ebde4a45`:111archivos cotejados contra Gitbloblocal/árbol y ref. Este commit de cierre añade REMOTE_CLOSURE y actualiza manifiesto/checkpoint; su SHA final se consulta en PR207. Preview21imágenes/5canvases pintados/0errores PASS, sólo diagnóstico95ms. CI del nuevo head debe consultarse fresco; ningún resultado de un padre aprueba el cierre. Main f62d181 permanece intacto.
