# B005 Myla — producción de componentes, revisión 01

28 poses nuevas generadas con image_gen usando el atlas base de Myla como referencia. 12 de lanzamiento (frente/perfil/espalda), 12 de reacción al golpe y 4 de caída. El Berrinche existente se conserva; no se reclama como arte nuevo.

Estado: EN_REVISION_NO_INTEGRAR. No modifica assets jugables, renderer ni progreso. Las hojas generadas son fuentes, no una aprobación automática. Se conservan el diseño rosa, moño, varita y proporciones infantiles. El owner expresó «Hermoso» sobre la primera hoja; esto no sustituye pruebas del renderer ni aprobación técnica.

Reproducir desde raíz: `python3 art-source/entregas/bloques/B005_myla/revision-01/build.py`.
La receta fija hashes, extracción de siluetas, escala uniforme por hoja, vecino más cercano, alfa binaria y ancla inferior106. No repinta, no modifica paleta y no instala un atlas genérico36 sobre el contrato actual96px. El output es suplemento112px y requiere metadatos propios.

Comprobado:28 siluetas, alfa binaria, cero fragmentos; scanner: lanzamiento1 píxel sospechoso, caída0, golpe0 (umbral del escáner15). Revisar continuidad de mano/varita en vistas de espalda, diferencias de escala entre dos fuentes y fluidez al tamaño real. La dirección final de caída es frontal compartida, no cuatro caídas distintas.

Gate numérico nativo:28/28 PASS con el detector canónico sin modificaciones. Ejecutar `node art-source/entregas/bloques/B005_myla/revision-01/check-native.js`. El navegador no pudo instalarse (descarga truncada); se decodificó RGBA binario con Pillow y se ejecutaron las mismas funciones/umbrales en Node. Esto no certifica renderer ni escala final.

Pendientes: revisión de animación y escala en renderer, integración de suplementos base conservando skins/Berrinche, regresiones y CI. No cerrar todo B005 ni marcar publicación.
