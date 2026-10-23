# Bront — primera pasada de rediseño, 23/10/2026

Estado: GENERADO / EN_CORRECCION. Art Gate FIX, NO_INTEGRAR. VALIDADO: no. INTEGRADO_MAIN: no. Publicación en juego: no verificada.

Nano autorizó expresamente: «Si autorizo. Deben ser claramente diferentes identidades visuales». La pareja Bront/Baltra fue inferida por inspección; no se presenta como nombres confirmados por Nano. Baltra conserva su escafandra; Bront adopta fortaleza angular vacía, visor hundido, cristal suspendido y hombros almenados.

La receta instalada de Bront usa cuerpo Baltra y donante Baltra para bront_core. La nueva fuente usa image_gen con concepto anterior y roster canónico como referencias. No se instaló. Se preservan todos los archivos main758aa, Bront original, skins, IDs, mecánicas y talleres.

Entregables: concepto mostrado, fuente PNG original36poses, prompt, receta, extracción reproducible, atlas diagnóstico448x1008, preview, contacto36 y comparación nativa Baltra/Bront actual/candidato con siluetas. Mantiene B410 y sus IDs originales de calidad; no afirma que faltara el atlas main. Referencias y hashes en SOURCE_REFERENCES/manifest.

Verificación:36/36 celdas no vacías,36RGBA diferentes. Grilla fuente irregular: diez contactos con cortes uniformes, intento preservado; cortes por fila finales0contactos opacos. Cuatro métricas del Pintor pasan con tolerancia15% intacta. NO equivale a36poses aprobadas: atlas tiene122995píxeles de alfa parcial; casco pequeño, flotación/pecho vacío insuficientes, halo en26, continuidad/anclajes pendientes. Arte fuente reducido por nearest sólo diagnóstico, no pixel-art nativo certificado.

No se corrieron renderer/online/skins ni se declaran funcionales/RNG de otros ciclos como pruebas nuevas. main intacto. Cola histórica23 conservada y B410 añadido:24entradas.

Siguiente acción: leer AUTHORIZATION, REVIEW, VERIFICATION y source; corregir el lote de identidad y acabado de36poses (casco chibi angular40–45%, vacío/placas flotantes, alfa y pulso separado), conservar índices. Producir las dos skins coherentes después de fijar geometría. Verificar identidad por siluetas a escala real, animación/anclajes, renderer/móvil/arenas/equipo/multiplayer y Art Gate antes de instalar. No rehacer primera fuente a ciegas ni sustituir sprite parcial.

Reproducción: `PYTHONPATH=/tmp/la-horda-python-deps python art-source/entregas/bront-redesign-20261023/primera-pasada-01/extract.py`. Dependencias/versiones en recipe.json; la regeneración image_gen no es determinista, la extracción desde fuente preservada sí.

Brakk sigue PR197, cierre validacion-11 en9ca6215bd259a79fd8cef842874feb9c9ccc519c. No arrastrar su taller FIX a este PR. Su diagnóstico frío identifica costos repartidos; no hay optimización runtime ni aprobación móvil. Inventario global incompleto.

Cierre remoto: PR201 borrador; producción `cb339587b24412cfcaf45c2ab34c23c5af682074`.26archivos de producción cotejados por Git blob remoto. Reproducción determinista adicional: atlas/preview/contacto/comparación/verificación5/5hashes exactos. Cierre final incluye manifest actualizado y REMOTE_CLOSURE; consultar head fresco antes de continuar.
