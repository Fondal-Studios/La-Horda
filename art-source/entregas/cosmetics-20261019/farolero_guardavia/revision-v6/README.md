# Farolero — Guardavía de Medianoche, revisión 6

Skin original para el campeón existente. Gorra ferroviaria azul, abrigo, bufanda roja, correajes, bolso y farol de señales; no modifica estadísticas ni habilidades. Esta entrega no certifica publicación en la web.

## Procedencia y montaje

La base es la revisión 2 rechazada, conservada en `fuentes/rejected-v2-importacion.json`. Se conserva exactamente el RGBA de 27 cuadros. Las correcciones se limitan a 8–11 (espaldas), 20–23 (ataque trasero) y 35 (muerte). `assembly.json` fija fuentes, hashes y recortes. `reproduce.py` utiliza exclusivamente el importador y reemplazador existentes de `tools/factory/`, comprueba igualdad exacta del resultado y los 27 cuadros preservados, y exige el control nativo de 36/36.

El cuadro 20 procede del ensayo v4, las cuatro espaldas de un nuevo strip y los tres ataques restantes y la muerte de otra fuente. Los recortes de esta última siguen la separación real entre figuras: partirla en mitades cortaba el ataque lateral. La muerte final usa una altura explícita de 26 px y ancho de 88 px, cercana a los 86 px del cuadro anterior; conservar su altura de pie habría recortado el cuerpo horizontal. No se alteraron los límites de la fábrica ni los gates.

## Evidencia

- `native.json`: 36/36 cuadros sin excepciones. `scan.json`: análisis de alfa, fragmentos y halo.
- Style Gate estricto aprobado frente a la familia existente.
- `roster.log`: 141 apariencias, cero fallos de escala/presentación y cero errores.
- `skins.log`: 6.441 comprobaciones, cero fallos/errores.
- `gm.log`: 127 comprobaciones; solo se amplía la expectativa del catálogo, sin cambiar permisos ni servidor.
- `pricing.log`: precios y transacciones del catálogo actualizado. El primer intento detectó correctamente el catálogo anterior; se regeneró con la herramienta existente y se volvió a validar.
- `../runtime/farolero_guardavia-checks.json`: compra, equipamiento, progreso, guardado, animaciones, densidad a escala real y estadísticas idénticas.
- `../runtime/farolero_guardavia-comparison.png`: captura del renderizador real, con Tanque de referencia y Farolero original/nuevo en cuatro vistas.

Las animaciones siguen el contrato authored existente: izquierda espejada; cast, definitiva y muerte comparten secuencia frontal por dirección. No se atribuye una aprobación visual al owner. La integración y publicación se comprueban separadamente de estos archivos.
