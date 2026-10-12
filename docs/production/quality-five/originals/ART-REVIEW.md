# Solciju original — revisión del 12/10/2026

Revisor: Codex (revisión visual automatizada/asistida, no una firma humana).
Referencia: `../original-identities-concept.png`, recuperada del concepto aprobado por el owner.

Se inspeccionaron los dos sheets fuente y ambos atlas importados: bob negro, mechón blanco,
copa, barrica lateral y sacacorchos conservados en caminar, ataque, cast, definitiva y muerte.
La skin modifica el vestido escalonado, velo, rosas y accesorios; no es un recolor.
Las 36 poses están separadas. Frente, perfil derecho y espalda tienen caminata y ataque;
izquierda usa espejo. Cast/definitiva/muerte reutilizan el frente en otras direcciones,
como admite el formato actual; no se declara una animación distinta donde no existe.
Idle e hit reutilizan el primer frame de caminar/atacar, respectivamente.

El importador usa escala uniforme, nearest-neighbor, alfa binaria y el detector de pies
de `tools/art/redraw/build_atlas.py`. Se corrigió contaminación de armas vecinas en
bounds superpuestos: ahora sólo conserva la componente de la pose seleccionada.
SHA exactos y procedencia: `solciju/import-report.json`, `solciju_alt1/import-report.json`.

Gate numérico: ambos PASS, `style-results.txt`, tolerancias originales intactas.
Roster Art Gate: 126 apariencias, cero fallos de escala, presentación o página.
Normalización cambiada exclusivamente para las dos apariencias de Solciju.
Los nuevos atlas sustituyen únicamente el estudio Maura de Solciju en la rama de QA.
Las recetas anteriores quedan archivadas y no deben reinstalarse.

Resultado: PASS técnico y visual de estos dos atlas para la rama de pruebas.
No aprueba el lote de cinco, los otros ocho atlas, balance competitivo, teléfono físico,
ni despliegue. Las diferencias restantes de arte del lote siguen bloqueando su release.
