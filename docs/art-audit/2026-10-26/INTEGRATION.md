# Integración del códice — 26 de octubre de 2026

## Entregado
- Hoja ilustrada de Ilkan en su ficha, con enlace para ampliar y dimensiones adaptables.
- Registro explícito CODEX_CHAMP_SHEETS: solo contiene archivos presentes; no solicita imágenes inexistentes.
- Las demos de movimiento, habilidades y apariencias siguen usando los sprites reales.
- Corregida la llamada drawImage de las panorámicas del libro: estaba dentro de un comentario, junto con restore(), por lo que ni pintaba la imagen ni equilibraba el estado del canvas.

## Verificación
- Sintaxis JavaScript de los dos archivos modificados: correcta.
- Render del registro: Ilkan muestra la hoja; un héroe sin hoja no genera imagen rota; el nombre se escapa.
- Dibujo de panorama con imagen simulada: una llamada drawImage, save/restore equilibrados.
- Panorama sin imagen: fallback correcto.
- No se ejecutaron pruebas visuales ni gameplay: el entorno de ejecución se desconectó.

## Pendiente real
La colección llegó a 32 conceptos generados de 43 héroes. Solo el blob de Ilkan había sido transferido a GitHub cuando se perdió el entorno. Las otras 31 hojas requieren recuperar los archivos de la sesión; no están publicadas por este commit.

Restan por generar: Axiom, Sylva, Kael, San Martín, Thalen, Musashi, Ilvar, Ismara, Segador, Elyra y Aldric. Corregir además la espalda de Brakk antes de publicar su hoja.

Las vistas de una hoja de concepto NO son atlas de animación listos para combate. No se reemplazaron sprites de gameplay. La producción pendiente necesita grilla, transparencia, direcciones, cuadros, pivotes y verificación visual contra ART_BIBLE.md.

Los inventarios históricos LA_HORDA_CODEX_MISSING_ASSETS.md y LA_HORDA_COMBAT_MISSING_ASSETS.md no son una lista verificada del estado actual: por ejemplo las panorámicas de Ciudad y Minas ya existen. Reconciliar referencias de código con los archivos actuales antes de producir reemplazos.
