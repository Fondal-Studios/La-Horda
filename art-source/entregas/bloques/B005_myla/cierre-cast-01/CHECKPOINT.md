# B005 Myla — conexión de lanzamiento base, cierre-cast-01

Estado: **EN_CORRECCION / FIX_NO_INTEGRAR**. Base fresca `main` `a27c48b74344a090047deeaa77f2363243ef1d8c`; PR297 conservaba head remoto `8d1b9c1c71b95641f643c3efa068fa9aaa1d8f6d` y no se observó otro taller concurrente de Myla.

Se instaló en la rama del taller el candidato exacto `revision-cast-back-03/cast.png` como `assets/sprites/champions/myla/v2/cast.png` y se conectó como suplemento **sólo de la apariencia base** durante un lanzamiento real. `Merienda Mágica` y `Yogur de Arándanos` conservan sus atlas authored mediante `setSkinPackKey`; Berrinche mantiene prioridad. No cambian habilidades, balance, red, muerte PR190 ni Burbuja PR229.

Referencia obligatoria: `assets/ui/codex/champions/myla.png`. Fuente exacta: `art-source/entregas/bloques/B005_myla/revision-cast-back-03/cast.png`, SHA-256 `1069b0085e3bae9854357869aaae4ebd875074623ccd6d0af4bd061a15d41110`. El instalado coincide byte por byte.

Pruebas nuevas: sintaxis de los dos runtime PASS; contrato determinista de selección 7/7 PASS; 12/12 cuadros no vacíos, alfa binaria y sin semialfa; `git diff --check` PASS. Revisión real de la hoja nativa `contact-sheet.png`: dirección frontal/perfil/espalda, cuchara, silueta y continuidad favorables.

Bloqueo concreto: Chromium del ejecutor aborta antes de abrir la página con `process_singleton_posix.cc: socket() failed: Operation not permitted`. Por ello no hay capturas a escala de gameplay, matriz seis arenas/escritorio/móvil, relay ni Art Gate final de este cambio. El script reproducible `tools/art/check-myla-cast.js` queda guardado para ejecutar en un entorno con navegador habilitado.

No cerrar B005, no quitar FIX/NO_INTEGRAR y no mergear. Próximo paso: ejecutar el gate de navegador, revisar las capturas antes/después y skins, completar multiplayer/performance si el alcance lo exige y verificar todos los checks del SHA exacto.
