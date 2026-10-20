# Guardavía: corrección focalizada v4, no instalada

Se solicitó redibujar9 poses en grilla3×3: caminar espalda8/9/10/11, atacar espalda20/21/22/23 y caída35. Herramienta integrada con fuente v2 como referencia, identidad intacta y pedido explícito de2 tonos planos en gorra,3 en abrigo y bufanda, contorno oscuro, sin degradados/ruido/glow.

Resultado: ensamblaje parcial llega a21;22 toca borde derecho de su celda y se rechaza. La fuente contiene también halo ambiental. No aprobar la hoja completa. Entre los cuadros ensamblados, únicamente20 mejora el gate nativo. candidate-only20.png aplica SOLO20 sobre la v2 de36 cuadros mediante replace-authored-frame.py; conserva35 RGBA exactos. Detector:8 fallos (8/9/10/11/21/22/23/35), frente a9 de v2. No se cambiaron umbrales ni paleta. Fuente cruda y receta conservadas; no integrado en runtime, ni revisión final de escala/animación aprobada.

Próximo: corregir únicamente los8 fallos restantes manteniendo las fuentes anteriores. Evitar generar otro atlas completo. El archivo source.json identifica el recorte del cuadro20 y el manifiesto del baseline para reproducción.
