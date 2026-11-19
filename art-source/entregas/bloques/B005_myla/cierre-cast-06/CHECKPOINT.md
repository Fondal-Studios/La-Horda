# B005 Myla — cierre visual 06

Estado: **EN_CORRECCION / FIX_NO_INTEGRAR**. Se probó una corrección local de composición: `my_bubble_idle` conserva alfa `.8` fuera del lanzamiento y baja a `.34` sólo mientras está activo el cast authored. No cambia escudo, duración, daño, balance, red ni selección de skins.

Referencia exacta: `assets/ui/codex/champions/myla.png`. Fuente preservada: `art-source/entregas/bloques/B005_myla/revision-cast-back-03/cast.png`, SHA-256 `1069b0085e3bae9854357869aaae4ebd875074623ccd6d0af4bd061a15d41110`.

El primer run `44339061607` emitió capturas pero quedó inválido: el runtime tenía secuencias literales `\n` y falló con `Invalid or unexpected token`. Se corrigió la sintaxis en `5c46a8ce54cde60fde1e32b72c74d8a0a4b0e35c`; `node --check` pasó. El run válido `44340677051`, artifact `14443699044`, completó 170/170 controles del renderer en escritorio/móvil, seis arenas, base/Merienda/Arándanos, sparse/dense, Berrinche y doce fases aisladas/compuestas; cero errores.

Revisión visual real: el cuerpo aislado sigue fiel al Códice, pero la burbuja y sus tres púas continúan cubriendo cabeza y torso en composición, especialmente en móvil. La reducción de alfa no resuelve la silueta. **No integrar ni publicar.**

El workflow de captura temporal se retira y `art-presentation.yml`/`codex.js` se restauran byte por byte. Próximo paso: rediseñar agrupadamente la geometría/capa negativa de `my_bubble_idle` durante el cast, conservando lectura de escudo y mecánicas, y repetir únicamente los gates afectados.
