# Libertador v6: nativo 36/36, todavía solo taller

La recuperación23 de v5 y el apuntado20 de v6 completan el control nativo sin excepciones: 36/36. Style Gate estricto de familia también pasa. Se conserva el retroceso21 de v4 y el RGBA exacto de los otros33 cuadros del candidato original v2. `reproduce.py` comprueba fuentes, montaje mediante la fábrica, igualdad exacta y el resultado nativo.

**No aprobado para instalar.** `scan.json` informa19 píxeles sospechosos de halo (umbral existente15), alfa semitransparente0 y fragmentos0. El candidato v2 ya tenía22; no se reduce el umbral ni se declara un Art Gate completo. El ensayo del limpiador existente `tools/art/scan_sprites.py:clean` eliminó58 píxeles sin cambiar los restantes y mantuvo19 avisos. Se conserva como `rejected-clean-*`, pero no se selecciona: no resolvió el defecto. Hace falta inspección/corrección focalizada del borde.

Se conserva la fuente v5 de dos poses; su pose20 rechazada no forma parte del resultado final. `rejected-v5-native.json` documenta ese intento. Las fuentes nuevas provienen de la herramienta integrada de imágenes; prompts y recortes se guardan junto a ellas.

Además del borde, siguen pendientes continuidad de animación y contrato especializado61: mosquete, recarga, bayoneta, Cabral, mando, definitiva y caballo. No reemplazar ese runtime por esta plantilla36. No se modificaron `assets`, clases, kits ni guardados; no se atribuye aprobación al owner ni publicación pública.

Próximo paso: revisar las19 detecciones de borde conservando metal y ribetes legítimos; después adaptar al contrato especializado y probar dentro del juego. No volver a generar los cuadros ya aprobados por una interrupción.
