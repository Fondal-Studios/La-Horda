# Intentos y pruebas

1. Head `089063...`: diez workflows actuales PASS; `Champion entry balance` FAIL.
2. Fallo propio reproducido: `ATLAS_ARTE.json` desactualizado para cuatro imágenes de Libertador y huella de registros.
3. Primer intento local de regeneración: Chromium de Playwright ausente; no produjo archivos.
4. Segundo intento con `/usr/bin/chromium`: el sandbox local impidió el socket del proceso; no produjo archivos.
5. Remediación determinista: registro actualizado desde hashes, dimensiones, metadatos y gates runtime ya preservados; `node tools/art/build-art-atlas.js --check` PASS.
6. Contrato estático actual: PASS. `node --check` y `git diff --check`: PASS.
7. Rama reconciliada con `main` fresco como segundo padre; sin conflicto en las cuatro rutas de remediación.

No se reejecutaron los gates gráficos históricos porque los píxeles de atlas, previews y caballos no cambiaron. El cambio idle reutiliza poses existentes y queda sujeto al CI del nuevo SHA.
