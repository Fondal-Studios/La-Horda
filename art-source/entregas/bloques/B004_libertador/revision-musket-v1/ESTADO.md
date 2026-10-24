# B004 mosquete: FIX_NATIVE5, no instalar

Diagnóstico actual: run39319092312, job118288145415, proof head bda8d3b117bc32fb0734edfa77fcca91d74099f3; fuente/receta266a934370cc566378696d24291fe7e5c8bcec4e.
Resultados exactos y preview: preflight-v2/. Se conservan preflight-v1 y source-v1.json, sin reemplazar su historial de fallos.

- Native Gate: FIX, cuadros8/10/20/21/23. No se agregan excepciones ni se modifican umbrales.
- Style Gate: PASS; no sustituye el gate nativo.
- Fuente/masa: PASS para las ocho poses, desviación máxima2,82% y apoyo106. Este es un chequeo de fuente, no normalización/aprobación en juego.
-28 cuadros originales RGBA preservados exactamente.
- Continuidad del arma recuperada: mosquete/bayoneta, uniforme y capa. Pose13 frontal; conservar fuente de9/11/13, que pasan nativo/geometría.
- Contrato de animaciones: REJECT para reemplazo completo por plantilla36. El runtime vigente de61 cuadros exige mosquete/recarga/bayoneta/definitiva y montura separada.

Siguiente paso: redibujar a píxel nativo los cinco cuadros marcados con la escala y el diseño ya fijados. No regenerar9/11/13 ni aplicar filtros para ocultar pintura. Repetir native, Style, comparación de identidad/ciclo y contrato. Diseñar integración que conserve todos los clips especiales existentes; no renombrar IDs ni modificar progreso.

Estado: SOURCE_ONLY/FIX, no preferido para producción, no instalado, sin aprobación humana atribuida. El campeón jugable conserva atlas y habilidades actuales.
