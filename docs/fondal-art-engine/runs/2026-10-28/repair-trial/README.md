# Prueba real de reparación — 28 de octubre de 2026

Ejecutada en la rama feature/fondal-art-engine, sin publicar al juego desplegado.

- 14 hojas PNG reales regeneradas con recetas locales (656 cuadros); 1 reutilizable y 13 rechazadas por contacto de píxeles con el borde. El proceso devuelve código 1 para impedir publicación del lote rechazado. No se rellenaron bordes artificialmente para ocultar el aviso.
- 0 assets nuevos corregidos o integrados en esta ejecución. La hoja reutilizable corresponde a la reparación anterior de angel_corrompido.
- 106 hojas de campeones/skins/fallback examinadas después de que Chromium decodificara las imágenes reales. 3 pasan los controles técnicos, 103 requieren revisión; ninguna falló al cargar. 99 hojas exceden el presupuesto de colores, 16 tienen alfa parcial y 9 tienen contacto con el borde (categorías solapadas). Estos avisos no son una calificación estética ni prueban por sí solos recortes visibles.
- 1.747 referencias literales: 0 archivos ausentes. 30 referencias dinámicas requieren pruebas específicas; el inventario no demuestra cobertura de todo el contenido deseado.
- 7.758 usos de cuadros en el renderizador: sin cuadros vacíos ni mutación de geometría. No mide FPS de una partida ni rendimiento en iPhone físico.
- 32 pruebas unitarias del motor pasan. Prueba HTTP de cola/proceso independiente: PASS, PNG real de 108.590 bytes, solicitudes duplicadas suprimidas y permisos comprobados.
- Se ejecutó la ruta de reparación de Aelith, Morveth, Brakk, Veyra y Solciju: los cinco trabajos devolvieron BLOCKED_MODEL. Se conserva la referencia del Códice y su hash, pero no hay modelo gráfico configurado para redibujarlos autónomamente. No son reparaciones completadas.

## Repetición

```sh
node tools/fondal-art-engine/audit.js /tmp/consumers.json
node tools/fondal-art-engine/quality-audit.js /tmp/quality.json
node tools/fondal-art-engine/runtime-check.js /tmp/runtime
node tools/fondal-art-engine/production.js generate tools/fondal-art-engine/recipes.json /tmp/NEW-production-directory
node --test tools/fondal-art-engine/*.test.js
node server/test-art-factory.js
```

Las herramientas con navegador requieren Playwright/Chromium (la configuración CI los instala). La nueva auditoría queda incorporada al workflow y conserva su informe como artifact. Sus avisos históricos son un backlog de revisión, no una autorización para sustituir assets ni un resultado visual aprobado.

Pendiente: cualificar el modelo y su ejecución persistente; corregir las recetas rechazadas preservando escala/anclaje y demostrar cada cambio en el renderizador; revisar animaciones exclusivas y estilo del Códice; ampliar auditoría a mapas/VFX/UI y a todos los enemigos; publicar solamente bloques que pasen las pruebas y verificar el juego desplegado.
