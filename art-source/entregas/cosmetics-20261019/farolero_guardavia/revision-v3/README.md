# Guardavía de Medianoche: fuente v3, no integrada

Redibujo original36 poses con herramienta integrada; mismo guardavía anciano, gorra, abrigo azul, bufanda roja, bolso y farol ámbar. Fábrica reconoce36 siluetas. Detector nativo sin cambios: FIX8/9/10/11/14/20/21/22/23/35. No instalar ni cerrar la skin como entregada. V2 tenía9 fallos; esta versión tiene10, por lo que no reemplaza v2 como mejor candidata. No hay aprobación artística ni permiso de publicación.

Reproducir: python3 tools/factory/import-authored-sheet.py art-source/entregas/cosmetics-20261019/farolero_guardavia/revision-v3/import.json /tmp/farolero-v3-new
Luego: node tools/art/check-authored-density.js /tmp/farolero-v3-new/atlas.png /tmp/farolero-v3-native.json

La gorra y abrigo de espalda siguen teniendo sombreado demasiado suave. Siguiente: corregir espalda y caída de la mejor versión previa por cuadros, conservando los26/27 aprobados; no volver a generar la hoja completa ni suavizar el gate. Sin registro runtime, cambios de estadísticas ni datos de jugadores.
