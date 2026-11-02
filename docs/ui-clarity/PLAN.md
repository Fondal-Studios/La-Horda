# Plan por bloques (cada uno acotado y reversible)

| Bloque | Contenido | Estado |
|---|---|---|
| **1 · HUD y habilidades** | Motivo de bloqueo (burbuja única), etiqueta «FALTA n», fix de superposiciones objetivo×aliados y banner Beta en pantallas bajas, pruebas y auditoría de geometría | **Hecho en esta rama** |
| 1b · Peligro | Peligro enemigo vs. efecto aliado vs. curación vs. interactuable por forma + contorno (sin cambiar zonas de daño); modo «efectos reducidos» que conserve las señales de peligro | Pendiente. Coordinar con la rama de Madre Espora |
| 2 · Tienda | Inventariar economía/monedas/compras reales; categorías; ficha de artículo (vista previa fiel, contenido exacto, precio y saldo, estado: disponible/adquirido/equipado/bloqueado); misma fuente de datos para tienda, inventario y apariencia | Pendiente |
| 3 · Compra y medición | Resumen previo, procesamiento sin duplicados, éxito solo con entrega confirmada; telemetría mínima existente; tareas breves con jugadores | Pendiente |

**Reglas que se mantienen:** sin ventajas pagas, sin descuentos ni escasez inventados, sin conectar pagos reales ni crear monedas; no se declara mejora de conversión sin medirla.

## Tareas breves para validar comprensión con jugadores (a ejecutar por el equipo; no hay resultados todavía)
1. «En esta pantalla, ¿por qué no podés usar la habilidad marcada?» (5 jugadores, antes/después, tiempo y respuesta).
2. «Usá la definitiva» con el botón bloqueado por nivel y luego por carga: ¿qué hace el jugador y cuánto tarda en entender?
3. Contar pulsaciones repetidas sobre un botón bloqueado en 10 s con y sin burbuja (`?uc=0`).
