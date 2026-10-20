# Libertador v7 — reparación técnica de contorno

Se conservaron los 81.730 píxeles opacos originales y se añadieron 19 píxeles de contorno oscuro en ocho cuadros. Los otros 28 cuadros permanecen RGBA idénticos. No se recortó, recoloreó, movió ni escaló el dibujo. La fórmula del contorno procede del normalizador existente; la fábrica limita la reparación a huecos pequeños de un contorno ya presente. Las coordenadas y hashes están en `repair.json`.

Resultados ejecutados: densidad nativa 36/36 PASS; Style Gate estricto PASS; scanner halo 19→0, semialfa 0, fragmentos 0. Cuatro pruebas del reparador verifican preservación, idempotencia y rechazo de entradas inválidas/clipping/sobrescritura. No se cambian umbrales ni excepciones.

Reproducción desde la raíz:

```sh
python3 tools/factory/repair-outline-gaps.py art-source/entregas/bloques/B004_libertador/outline-repair.json /tmp/libertador-outline-reproduced
python3 -m unittest tools/factory/test_outline_gaps.py
node tools/art/check-authored-density.js /tmp/libertador-outline-reproduced/atlas.png /tmp/libertador-outline-native.json 1
python3 tools/art/painter/style_gate.py --strict /tmp/libertador-outline-reproduced/atlas.png
```

La fuente v6 queda intacta. Este checkpoint todavía no instala el atlas ni afirma un Art Gate completo: faltan continuidad a escala de juego y adaptación al contrato especializado de 61 cuadros/montura. No sustituir ese contrato por la plantilla de 36 cuadros. Main y publicación se verifican por separado.
