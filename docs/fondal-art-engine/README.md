# Fondal Art Engine — plan de integración (fase 0)

Estado: arquitectura inicial; no se generan ni instalan assets automáticamente todavía.

## Objetivo
Motor permanente y reutilizable para inventariar, generar, animar, validar e integrar arte de campeones, skins, enemigos, jefes, invocaciones, mapas, props, VFX y UI. Mantener la compatibilidad con las futuras incorporaciones.

## Fuentes existentes que deben conservarse
- `docs/ART_BIBLE.md` y `LA_HORDA_SPRITE_CANON.md`: canon visual; no mezclar representaciones de una entidad.
- `docs/art-brief/00_ESPECIFICACION_TECNICA.md`: contrato de atlas, alfa, escala y animación.
- `docs/art-brief/manifiestos/mundo_faltantes.json`: inventario histórico de 1061 registros, no equivale a 1061 faltantes actuales.
- `docs/art-brief/ASSETS_FALTANTES_CAMPEONES.md`, `LA_HORDA_ASSETS_FALTANTES.md`, `LA_HORDA_MISSING_ASSETS.md`.
- `tools/art/missing_list.py`, `tools/factory/check-animation-contract.js` y validadores art-gate existentes.

## Flujo propuesto
1. **Descubrimiento:** recorrer registros, cargadores y archivos reales; emitir manifiesto versionado con `id`, tipo, origen, ruta, estado, prioridad, canon, licencia y dependencias.
2. **Reconciliación:** clasificar `APPROVED`, `PARTIAL`, `MISSING`, `REJECTED`, `UNVERIFIED`; no asumir que los documentos históricos reflejan `main` actual.
3. **Planificación:** preparar trabajos reproducibles por entidad; reutilizar primero; para personajes generar una hoja completa coherente, nunca mezclar fotogramas.
4. **Proveedor intercambiable:** interfaz `generate(job, referenceAssets, options)` con adaptadores futuros para PixelLab u otros motores; sin claves en Git.
5. **Procesamiento:** normalizar transparencia, dimensiones, anclajes, spritesheets, metadatos y referencias sin alterar mecánicas.
6. **Validación:** contrato de animación, art-gate, consistencia visual, licencias, rutas, pruebas de carga y capturas en varias arenas.
7. **Entrega:** resultados en rama/PR, informe de costos y evidencias; aprobación humana antes de publicar.

## Primer incremento implementable
- Crear escáner de solo lectura con salida JSON y reporte Markdown.
- Comparar manifiestos históricos con assets y consumidores actuales.
- Añadir pruebas de esquema y detección de rutas ausentes.
- Incorporar modo `dry-run` por defecto y presupuestos por lote.
- Probar un campeón, un enemigo y un mapa antes de cualquier generación masiva.

## Restricciones
No modificar `main` ni desplegar automáticamente. No sobrescribir assets canónicos. No introducir dependencias pagas ni claves sin aprobación. Mantener originalidad comercial de los diseños.
