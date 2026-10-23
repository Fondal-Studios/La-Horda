# Brakk — validación04 y PR200 integrado, 23/10/2026

Arte B117/B118/B119: **EN_CORRECCION / NO_INTEGRAR**. PR197 borrador. Cinco atlas/53cuadros reexportados byteidénticos, cero cuadros nuevos.450JS runtime idénticos al parent260304. Fuentes, IDs, mecánicas y UF intactos. No se declara el inventario terminado ni publicación verificada.

## Merge independiente verificado

[PR200](https://github.com/Fondal-Studios/La-Horda/pull/200) integrado con expected_head_sha `ae3d384a2117323d7154b30760ad621106dec0c6`, tras revisar diff real (+9/-7 únicamente tools/items/t_story.js),12checks y4workflows exactos exitosos. Merge/main `758aa2ffacaae6542d31776e4a66ea7847a73b1b`, comprobados por lectura de PR y ref. MERGE_PR200.json conserva evidencia. El test esperaba la voz antes de que el jefe pudiera cambiar de fase por aturdimiento; ahora espera la fase real con3000ms adicionales acotados y conserva emisión/visualización. No gameplay ni arte. Su contenido ya es idéntico en PR197; el cierre de producción reconciliará esa ascendencia con main sin importar talleres ajenos.

## Evidencia nueva

360escenas reales:6arenas×5apariencias(base/equipo/alt1/croma/set4)×3habilidades×2densidades×2viewports. Cuatro tiempos80/330/610/1600ms. Carga/consumo real de atlas comprobados:18000dibujos de cuerpo y20730de atlas del kit por viewport.38checks de cobertura/consumidores/identidad/controles PASS y19kit PASS. No son38pruebas de gameplay ni aprobación estética.

Gate aislado B117/B119 (montaje, soldadura y refuerzo),3variantes×6arenas×3fases×3cruces:162filas/486colocaciones por viewport. Mínimo86.685%móvil/86.074%horizontal,80%y deltaRGB24 intactos. Canary opaco falla21comprobaciones como corresponde. No certifica contraste compuesto ni dispositivo físico. Sin nueva ejecución de multiplayer, combate/RNG o performance: no se reciclan resultados anteriores como nuevos.

La firma superior de Brakk es el fallback estrella para las tres normales.36comparaciones entre sesiones tuvieron solo19sceneHashiguales;17no son evidencia causal, raíz exacta no demostrada. Se reemplazó esa comparación por12A/B/A sobre el MISMO cuadro330ms: al desviar dibujo de firma a canvas diagnóstico y restaurarlo, PNG original idéntico12/12 y estado de pool/objetos idéntico12/12. Sin saltar emisores ni updates. Quitar la firma reduce distracción sobre el lanzador pero los cuerpos siguen ocultando soportes en la torreta. Revisión inicial: muro y soldadura se distinguen; refuerzo del cuerpo compite con anillos legados.

Capturas JSON completas e índice SHA256 de todos los PNG generados; selección de hojas1:1 y PNG nativos publicada. La matriz completa se regenera con recipe.json; no se afirma revisión visual de360escenas ni subida de todos los raster. TEST_ATTEMPTS conserva canary inicial inválido(array convertido a0), sesiones con fondos distintos y pérdida de respuesta de polling;38checks se evaluaron desde archivos completos.

## Reanudar exactamente

1. Leer REMOTE_CLOSURE.json, REVIEW.json, recipe.json y CORRECTION_BATCH.json, comprobar heads frescos. PR200 ya está mergeado: no rehacerlo.
2. `OUT=art-source/entregas/brakk-kit-20261022/validacion-04/signature-ab MOBILE=1 ARENAS=bosque,infernal,minas LOOKS=base,set SLOTS=1 AB_SIGNATURE=1 node tools/vfx/capture-brakk-components.js` (NODE_PATH/CHROMIUM_PATH en receta) reproduce diagnóstico sin tocar runtime.
3. Corregir composición en lote Brakk: firma normal propia conservando UF, soportes B118 y refuerzo B119 frente a capas legadas. No volver a generar53cuadros ni rebajar gates. Cualquier cambio de capa debe conservar emisores/azar/duración; validar renderer y relay según alcance.
4. Repetir comparación en mismo estado, contraste compuesto/skins/equipo/seisarenas, performance y revisión integral. Separar componente aprobado; no mergear PR197 completo con FIX.
5. Mantener residuales Morveth B168 y Aelith B106/B107 y22entradas históricas. Guardar siguiente cierre remoto antes de abrir otrokit.
