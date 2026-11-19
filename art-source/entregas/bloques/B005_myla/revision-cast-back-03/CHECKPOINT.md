# B005 Myla — lanzamiento espalda cuadro 11, corrección03

Estado: **EN_CORRECCION / FIX_NO_INTEGRAR**. Base fresca `main` a27c48b74344a090047deeaa77f2363243ef1d8c. No hay PR abierto de Myla al auditar; PR291/293 son talleres ajenos a este componente.

Se consultó la referencia obligatoria `assets/ui/codex/champions/myla.png`, la pose registrada `assets/sprites/champions/myla/skins/myla_arandanos/atlas.png` y la fuente histórica `revision-cast-back-02/source.png`. ImageGen produjo una sola recuperación de lanzamiento vista de espalda. `build.py` parte del cast02 y reemplaza únicamente la celda11; las celdas0–10 quedan byte-exactas. No se instaló atlas ni se modificó consumidor/runtime.

Pruebas nuevas: build determinista PASS y detector canónico 12/12 PASS; alfa binaria, cero fragmentos y un halo sospechoso de hoja completa registrado por scanner. Revisión local de `preview-back.png`: dirección/continuidad/escala favorables. Esto no equivale a Art Gate: faltan capturas de gameplay real antes/después, base+Merienda Mágica+Arándanos, Berrinche, escritorio/móvil y CI del SHA exacto.

Pendiente inmediato: conectar en rama separada sólo si las capturas a escala de juego aprueban la secuencia y no regresan skins/Berrinche; después ejecutar gates aplicables. No cerrar B005 entero ni mergear este taller.
