# B005 Myla — siguiente componente: lanzamiento

Checkpoint22/10/2026, continuación de PR190/head664a568bad536aafe585c33d6b04fe924d74afc7. Rama `art/myla-cast-back-20261022`. El commit que contiene este archivo identifica esta corrección; recuperar desde remoto si falta el entorno local.

Se produjo con image_gen integrado una fuente de tres poses de espalda que corrige el cambio de mano. La cuchara queda a izquierda de pantalla y el lazo a derecha. `PROMPT.md` conserva el prompt exacto; referencias: `revision-01/source-cast-death.png` y atlas original. Se preservan ambos originales y la caída aprobada.

`build.py` extrae tres siluetas, escala uniforme NEAREST/alfa binaria y reemplaza solo9/10/11 en una COPIA del cast original. Verifica nueve celdas RGBA idénticas y hashes de fuentes. No instala en assets ni cambia renderer. Salidas: `cast.png`, `preview-back.png`, `extraction.json`, `native-cast.json`; receta con hashes en `recipe.json`.

**EN_CORRECCION / FIX_NO_INTEGRAR:** continuidad de mano corregida; detector11/12 PASS. Los dos cuadros nuevos9/10 pasan;11 falla ILUSTRACION (suave0.429, ruido75). Escáner:alfa semitransparente0, fragmentos0, un píxel sospechoso de halo en la hoja compuesta. El pase numérico no aprueba estilo/animación en juego. No rebajar umbrales ni instalar por mera existencia de PNG.

Reanudar: `python art-source/entregas/bloques/B005_myla/revision-cast-back-02/build.py && node art-source/entregas/bloques/B005_myla/revision-cast-back-02/check-native.js` reproduce el fallo intencionadamente. Corregir SOLO11 con image_gen manteniendo mano y lazo; conservar0–10 exactos. Después validar12/12, revisar escala/continuidad con renderer y probar skins, Berrinche y snapshots. Golpe continúa en revision-01; no se aprueba por este avance. B005 completo sigue abierto.

Consultar PR190 para el resultado real de integración de muerte. Esta rama no declara nuevo merge ni despliegue público. Aelith PR191 permanece FIX_NO_INTEGRAR y Libertador PR166 sigue taller.
