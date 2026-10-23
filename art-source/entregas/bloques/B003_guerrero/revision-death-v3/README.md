# Guerrero: caída v3

Fuente original editada con image_gen a partir de revision-death-v2/source.png. Cuatro poses: tambaleo, rodilla, apoyo lateral, cuerpo tendido. Mantiene capucha gris, máscara negra, capa verde, correas marrones y dos dagas.

`python art-source/entregas/bloques/B003_guerrero/revision-death-v3/build.py` reproduce los cuatro cuadros con las herramientas de fábrica y comprueba que los otros32 permanecen idénticos. `native.json`: cuatro cuadros sin incidencias del detector canónico, sin excepciones ni umbrales cambiados. Scanner del clip: halo0, semialfa0, fragmentos0.

El atlas36 de montaje NO se instala. Su gate de familia sigue fallando en las caminatas antiguas: sombreado6.42, mínimo6.5. Esa medición analiza los primeros12 cuadros intactos, no las cuatro poses nuevas. Se conserva el fallo; no se declara aprobada la hoja completa. El componente requiere revisión visual propia y pruebas del renderer.

Solo death.png se usa como suplemento de la apariencia base. Runtime calibrado a refH79 después de comparar la altura con el original; la secuencia se comparte entre orientaciones. No son cuatro secuencias direccionales distintas.
