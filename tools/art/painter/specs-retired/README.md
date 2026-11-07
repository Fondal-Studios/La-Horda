# Fichas retiradas del pintor
`aurelia.json` y `saelis.json` pintaban las hojas base de Aurelia y Saelis desde los donantes. Esas hojas se reemplazaron por el arte de #259 (más fiel al Códice, generado con Runway, no reproducible
desde donantes), así que dejan de estar en `specs/` (la prueba `test_forge.py --regress` exige que cada ficha reproduzca píxel a píxel la hoja instalada). Se conservan para historia y por si se
quiere volver al arte anterior (`git show origin/main:assets/sprites/champions/{aurelia,saelis}/atlas.png`).
