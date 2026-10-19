# Soporte v3: evidencia de renderer y revisión de arte

Los reportes runtime.json, roster.json y skins.json se obtuvieron del job118270033037, run39313830349, sobre el head31ee3348662a373b9debf8a58e853ddb0a0b806f de PR163. Los bytes coinciden con los reportes focales anteriores. La hoja runtime-contact.png proviene de ese mismo job.

- Runtime:570 comprobaciones, niveles1/39/40/60/90/99, selección efectiva de los36 cuadros y replay de snapshot real con reloj invitado distinto. Esta prueba no usa un relay público.
- Roster:139 apariencias, cero fallos de escala, presentación o JavaScript.
- Skins:base Soporte, Custodio y Baluarte, sin fallos.
- master-comparison.png:run39307007378, mismo atlas, metadatos y renderer; comparación contra Caballero al mismo zoom, fondo e iluminación y sin VFX. Revisión asistida por Codex, sin atribuir aprobación humana al owner.
- Preflight nativo y Style Gate:run39302849899,36/36 y PASS. Los resultados originales se conservan en art-source/entregas/bloques/B001_soporte/revision-frame11-v3/validated/.
- Cristales:la suite completa de PR163 prueba cuatro clientes, recortes reales, vistas y espejo, reconexión y revancha.
- validation.json registra el merge real y las ejecuciones completas. Ningún reporte aislado equivale a aprobación de lanzamiento.

Atlas:assets/sprites/champions/soporte/v3/atlas.png
Git blob:f7dcca7efeff2274556195e34a1722edb1cbd422
SHA256:6a4159258e35d515e405023dcb322526af6a437a3102ae097fa9c87e128fcc34

Integración en main y publicación son estados separados. No se verificó con estos reportes un despliegue canónico, una sesión NanoGM ni rendimiento en dispositivos físicos.
