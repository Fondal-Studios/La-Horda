# Registro acumulativo de producción de combate

La fuente de avance es [manifest.json](manifest.json); cada entrega agrega un registro en [deliveries.jsonl](deliveries.jsonl). No reemplazar este historial en entregas posteriores.

| Entrega | Entidad | Archivos assets nuevos | Reemplazados | Cuadros nuevos únicos | Clips base pendientes antes → después |
|---|---|---:|---:|---:|---|
| 2026-10-28 · códice v2 | Nano GM | 3 (PNG + WebP + metadatos) | 0 | 112 | 28 → 0 |

Una imagen PNG y su WebP son dos archivos del mismo arte. JSON de metadatos se desglosa del arte. Fuentes de imagegen, láminas de códice, capturas de pruebas, espejos y duplicados no se suman como nuevos cuadros de combate.

Base de Nano GM terminada; revisión integral de su skin, transformaciones y efectos pendiente. Las otras 42 bases de héroes y los 104 tipos de enemigos siguen pendientes de aprobación artística bajo este programa: eso no significa que carezcan de arte. No se pasa a Ilkan/Renko hasta resolver o documentar los pendientes de Nano GM.

El [inventario](../art-audit/combat-inventory/README.md) sigue abierto. Faltantes globales antes/después: **desconocidos**, nunca cero. Su evidencia de referencia corresponde al commit auditado; esta entrega añade los archivos listados en el manifiesto de producción sin falsificar la captura histórica.
