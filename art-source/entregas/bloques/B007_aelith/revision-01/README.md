# B007 — Aelith: La hora imposible

Fuente original de VFX encargada según docs/art-brief/campeones/aelith.md. Estado: GENERACION/REVISION; no instalada.

Contrato: dial violeta #5a4a8c, agujas ámbar #f0c070,13 horas, centro abierto, tres pulsos y fractura final. Hoja6 columnas×5 filas: anticipación6, bucle6, impacto12, disipación6. Destino técnico propuesto: celdas232×232, alfa0/255, pivote central; sin modificar daño/radio/cooldown.

Revisar antes de integración:13 marcas exactas, posición del pivote y radio constante, centro legible, continuidad de agujas y bucle. No usar los píxeles decorativos como límite de daño; conservar telegraph ligado al radio real.

Discrepancia encontrada: el brief dice pulsos0/1200/2400ms, pero aelithUpdateObject inicializa tick=life/3 y descuenta dt, por lo que ocurren al terminar cada intervalo. La animación debe seguir los eventos reales del motor, sin cambiar el gameplay para ajustarlo al brief.

Reanudar desde estas fuentes, no generar otra versión sin un defecto registrado. Falta gate visual, exportación, hook y pruebas del renderer. Este bloque no se considera terminado por existir una lámina.

## Revisión de primera fuente

30 celdas candidatas generadas y guardadas. **FIX_NO_INTEGRAR**: faltan las13 marcas exactas y algunos pulsos invaden celdas vecinas. No exportar un recorte como aprobado. La corrección de fuente es el próximo paso. Ver entrega.json.
