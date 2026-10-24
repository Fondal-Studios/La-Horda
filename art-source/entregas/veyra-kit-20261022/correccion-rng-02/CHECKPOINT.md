# Veyra — RNG compartido y seguimiento visual02

23/10/2026 UTC. PR196; head previocad319ecf7e4d8a41eda2e8c8f1ed95a16afddb7; recuperación467216ecc0d4513d19534d4f8667ecadc483f2dc. Main6334ff40b6514808ef0fe00b50bec15e19f10c25. Heads/checkpoints frescos de cinco kits y Aelith correccion-02 leídos; no otro trabajo concurrente detectado. Producción/cierre remoto identificados en REMOTE_CLOSURE.json.

## Cambio concreto

qualityFiveFx volvía a ejecutar las partículas solo con KVB desactivado. Primera divergencia reproducida dos veces: llamada7224, frame5, vfxBurst legado frente a aidAmbUpdate. Se conserva el emisor y presupuesto originales al sustituir el arte; se ocultan únicamente sprites/ondas genéricos, como el contrato SFA. No se rellenan llamadas de azar artificialmente ni se cambian semillas, daño, radios, duraciones o balance. Las partículas secundarias legadas vuelven a verse y viajar por el evento existente; el contraste compuesto debe revisarse.

Hallazgo adicional en Veyra: aura15px detrás del dueño en host. vfxUpdate corre antes del movimiento; el renderer usaba posición vieja. pixfx ahora resuelve dueño/offset al dibujar y antes de culling, omitiendo dueño recién muerto. Prueba contra parent reproduce10 fallos/12, candidato12/12PASS. Corrección compartida idéntica en PR195/196; preservar sus diferencias de hooks propias.

Solo hooks.js y pixfx.js cambian entre452 archivos runtime cotejados contra el head remoto previo. Recetas, fuentes, atlas (IDs y hashes en recipe.json), mecánicas y UF conservados. No arte nuevo, no duplicación de PR, no cambios de protocolo, cuentas, cobros, permisos o infraestructura.

## Evidencia

- Paridad repetida360frames: 29969/29969 llamadas, snapshots completos on/off iguales. Dos repeticiones frescas por modo; cada nuevo modo coincide exactamente con el recorrido genérico desactivado del parent. El modo activo viejo tenía el fallo: NO afirmar que todo snapshot activo anterior quedó igual. No certifica todas las semillas/arenas ni independencia total del RNG visual global.
-49 controles de emisor real/presupuesto/pool/culling/efectos reducidos/restauración y12 de renderer-follow PASS por rama. Fuentes de los controles y trazas comprimidas reproducibles incluidas.132 funcionales PASS por rama.
- Relay específico 21/21 PASS en esta rama. Veyra conserva dos ensayos fallidos antes de corregir seguimiento; otro falso fin provenía de esperar reloj real en vez de tiempo de simulación. Umbral8px y duración3000ms intactos. Consultar TEST_ATTEMPTS.
-8 sceneHash iniciales iguales horizontal/móvil por kit; contactos mismos tiempos/escenario/escala y capturas móviles390×844 a250ms. Las capturas completas UF NO son byteidénticas tras restaurar partículas/azar; las fuentes UF sí están intactas. No confundir diferencia de escena con generación de otro UF.

## Estado

EN_CORRECCION / NO_INTEGRAR. Defectos RNG y seguimiento corregidos técnicamente; no cierre integral de bloques ni VALIDADO. Mantener borrador. Comparación visual inicial conserva siluetas propias, pero partículas y anillos aliados siguen superpuestos: pendiente matriz skins/seis arenas1:1, contraste compuesto, warmup/performance/carga, saturación de partidas reales y Art Gate integral. Prueba de pool valida presupuesto/RNG, no rendimiento. CI del SHA final debe releerse. Ningún merge ni publicación verificada.

## Reanudar

Leer REMOTE_CLOSURE.json y heads frescos de PR195/196/199/198. Continuar Aelith B106 icono de arena lenta en objetivos realmente afectados1800ms, B107 y Morveth B168 lectura en contacto; luego gates integrales. Reconciliar las dos pequeñas extensiones compartidas sin arrastrar talleres FIX. Cola común22 entradas, conserva21 previas e historial. Inventario global incompleto. Comandos exactos en recipe.json; subir cierre antes del próximo bloque.
