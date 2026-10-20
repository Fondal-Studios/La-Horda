# Caballero: nueva secuencia de caída

Fuente original producida con image_gen integrada, usando el atlas maestro y la última fila del candidato B002 como referencias. Prompt completo en PROMPT.md. Cuatro poses: pierde fuerzas, se arrodilla, cae, queda tendido. Conserva pelo, tabardo/capa azul, cruz dorada, espada y escudo.

La primera división en cuatro columnas iguales fue rechazada por la fábrica: el tercer personaje invadía el margen de la segunda celda. No se instaló. `recipe.json` define los recortes de los cuatro componentes reales con margen transparente y una escala uniforme 68/462, redondeada a alturas68/57/39/26. Así el cuerpo no se agranda al acostarse. `reproduce.py` vuelve a ensamblar mediante tools/factory/replace-authored-frame.py y extract-authored-clip.py; verifica que los32 cuadros anteriores de la fuente quedan RGBA idénticos y reproduce exactamente el clip final.

El atlas36 se conserva solo como fuente de montaje. **No está aprobado ni instalado como reemplazo del maestro**: los cuadros ajenos a la caída mantienen sus problemas previos. El componente `death.png` pasa el detector nativo4/4; scan semialfa0, fragmentos0 y6 detecciones claras, debajo del umbral existente15. Las seis detecciones corresponden a puntas/reflejos del equipamiento, no a un fondo residual; revisión visual en el renderer guardada en docs/art-gate/tanque-death. Style Gate de familia PASS; no equivale a aprobar los otros32 cuadros.

No se cambian el atlas maestro ni las animaciones de combate, habilidades, skins o progreso. La caída usa una secuencia compartida para todas las orientaciones: no son cuatro secuencias direccionales distintas. Integración/runtime y límites en docs/art-gate/tanque-death/README.md.
