# Comprobación de archivos publicados

`python3 tools/release/check-canonical-publication.py --output reporte.json`
consulta por defecto **https://fondalstudios.com/la-horda/jugar/**. Solo hace GET públicos,
sin sesiones, compras, salas o datos de cuenta. Compara bytes SHA-256 de seis archivos
críticos del candidato: HTML, metadata/renderer/Códice y los atlas Soporte v3/caída de Libertador.
Devuelve código1 ante archivos viejos, faltantes o inaccesibles. Una respuesta200 con HTML
de error tampoco pasa. TLS usa la verificación normal del sistema.

`CHECKED_FILES_MATCH` significa exclusivamente que esos seis archivos coinciden; no prueba
el juego completo ni reemplaza gates, pruebas multijugador o revisión de infraestructura.
Si el build transforma HTML/scripts, pasar `--root dist` con el build exacto que se quiere
servir. No cambiar el origen a un servidor alternativo para declarar publicada la versión canónica.
`checkoutRevision` identifica el checkout de la comprobación, no acredita por sí solo un despliegue.

Pruebas HTTP locales: `python3 -m unittest tools/release/test_canonical_publication.py`.
El job `canonical-art` del workflow existente **Live check** conserva los chequeos alternativos
y añade esta lectura explícita de Fondal, con informe descargable. No despliega ni migra datos.
