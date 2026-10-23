# Brakk B118 — despliegue lateral09, 23/10/2026

Estado: **EN_CORRECCION / NO_INTEGRAR**. PR197 sigue borrador. No merge de arte ni publicación verificada. Inventario global incompleto.

Parent08 `59b8c38fe415a1de2fb958695a53706c55fce930`; main observado `758aa2ffacaae6542d31776e4a66ea7847a73b1b`; recuperación09 `d549f20b458c941546d822d9c9b82034f5dcd4a5`. Cierre08 íntegro; no pérdida de cierre detectada. Sus18checks exitosos corresponden al parent, no aprueban este candidato.

## Cambio y evidencia
Ocho escenas móviles parent08 (Bosque/Infernal,base/set,denso/escaso) prueban que el soporte se dibuja después de los cuerpos, dentro de drawPortadorTop. Capas posteriores conservan98.198–100% de su aporte inmediato medido con deltaRGB24. No es una medida de reconocimiento ni un diagnóstico global de todas las capas. A/B/A, pose, pool y objetos exactos8/8.

B118 abre patas lateralmente después de anticipación plegada; centro libre para torreta/cuerpo.12cuadros64x64,620ms,radio45,evento/paleta/emisores/azar/mecánicas intactos. Cuadros0/1 y11 idénticos;2..10 revisados. Cuatro atlas41cuadros restantes RGBA idénticos; comparar hashesPNG por separado. B11908,engine/bind,firmas05,UF originales intactos. Solo c/brakk.js cambia entre450JS runtime.

Intento01 falló22filas,min70.889%; fuente,atlas,gate y captura conservados. Candidato02 mantiene umbral80%/delta24:162filas/486colocaciones por viewport,min82%;972fondos y restauraciones exactos. Canary opaco falla33controles esperados. No se bajó umbral.

19kit,81funcionales,33regresión armadura,11pool/caché/culling/expiración PASS.26relay real PASS +3esperas de estado; despliegue dibujado21veces host/36invitado táctil. Primera regresión24PASS también conservada. Paridad360frames: snapshots y29232llamadas RNG idénticos parent/candidato. No nueva corrida CPU×6 ni aislamiento global RNG.

120escenas6arenas×5apariencias×2densidades×2viewports;120A/B/A exactos y pool/objetos iguales; todas120comparaciones muestran cambio. Por viewport2460dibujos de cuerpo equipado y2400del atlas despliegue. Captura nominal80/330/610ms, real80/336/624ms por pasos16ms.12hojas1:1,JSON completos,PNG nativos seleccionados e índice de todos los PNG generados; no todos los raster subidos. Matriz capturada no equivale a aprobación visual120escenas.

Benchmark local600renders:p50=1.1ms,p95=1.7ms,max8.1; bakefrío0.6ms/caliente500consultas p95=0(resolución reloj),max0.2;3eventos retenidos/caché1/reset0. No dispositivo físico/GC/temperatura ni comparación formal con mediciones anteriores.

## Revisión y continuación
Las patas laterales se separan inicialmente, pero torreta/cuerpos/señales de arena aún dominan contacto denso. Art Gate compuesto sigue pendiente; no ocultar señales mecánicas ajenas. Cola23entradas histórica preservada, añadida corrección a B118.

Siguiente: revisión integral por componentes B118/B119 con crew/múltiples receptores y contraste compuesto; usar `tools/vfx/capture-brakk-deploy09.js`, `tools/vfx/test-brakk-deploy-pose.js` y `tools/vfx/brakk-deploy09-online.js` (comandos en recipe.json). No repetir diagnóstico07/capas09, firmas05, primeras53, PR200 ni RNG Solciju/Veyra. Conservar residuales MorvethB168/AelithB106/B107; separar solo componente con ArtGate y CI exactos aprobados, jamás tallerFIX completo.

Producción `a7e4a4fb48ba25f6f39da121945aaa0f4d8a9492` subida y88archivos cotejados por Git blob remoto sin diferencias. Cierre documental en este commit; REMOTE_CLOSURE.json registra la verificación. Main sigue758aa2ffacaae6542d31776e4a66ea7847a73b1b. CI del SHA final debe consultarse en PR197; no se espera ni se interpreta como aprobación artística.
