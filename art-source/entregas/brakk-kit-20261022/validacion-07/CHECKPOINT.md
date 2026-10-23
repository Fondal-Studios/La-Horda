# Brakk — validación 07: observación del relay y poses idénticas
Fecha: 23/10/2026. PR197 borrador. **EN_CORRECCION / NO_INTEGRAR**.
Parent: `47812843cdfb4e2002b9b373594ed0988ff2bc6a`.
Recuperación: `c9555cf10f1454d02cdbd2ff88501c7607c794c7`.
Main observado: `758aa2ffacaae6542d31776e4a66ea7847a73b1b`, PR200 ya integrado.

## Trabajo efectivo
- Corregido tools/vfx/brakk-composition-online.js: espera acotada30s a dos construcciones vivas del dueño invitado, primer intervalo real de torreta y evento de clavos recibido. Mantiene las22 comprobaciones y falla por timeout.
- Herramienta de diagnóstico de ciclo de vida conserva tiempos reales/simulados, HP, dueño, vida, intervalo y ráfagas restantes host/invitado.
- Nuevo diagnóstico de legibilidad restaura _an/_animCastKind entre tomas y exige A/B/A y fondo repetido byteidénticos. Umbral80% y delta24 intactos.
- 450JS runtime y assets sin cambios. Cero cuadros nuevos; fuentes, atlas53cuadros previos y firmas05/UF preservados. No se afirma producción de arte ni nueva paridad RNG.
- Checkout recuperado de GitHub y81 archivos del manifiesto06 cotejados por Git blob. No se detectó cierre perdido; REMOTE_CLOSURE06 estaba cerrado.

## Evidencia
- Relay original sin carga22/22PASS. Con hostCPU×6 reproduce20/22FAIL: torreta llega después de la observación; al cierre de traza sigue con5616ms devida, tick616 y6ráfagas. Solo480ms simulados avanzaron en4842ms reales. No era todavía el instante de disparo.
- Misma carga con espera de estados22/22PASS y3/3observaciones; primer intervalo necesitó4842ms adicionales. Test editado sin carga22/22PASS; atlas dibujado53veces host/77invitado táctil.
- Canary de emisor local host falla comprobación de clavos. El invitado aún recibe el evento a través del hook de red: no es un control de apagón de red.
- Esto demuestra la causa en la reproducción instrumentada; el intento06 carece de traza suficiente para atribuirle exactamente las mismas condiciones.
- Gate original horizontal162filasPASS esta vez; dos fallos06 NO reproducidos.
- Gate con pose idéntica162filas/486colocaciones por viewport:972restauraciones/fondos exactos, mínimo86.685% ambos. Canary de1píxel falla81colocaciones esperadas. Bosque/Hielo54filas adicionales y18PNG nativos conservados.
- El diagnóstico NO prueba la causa de los2fallosB117 históricos ni contraste compuesto. Se conservan abiertos.
- Parent remoto18checks y7workflows exitosos. Consultar CI del SHA final fresco; verde no aprueba arte FIX.

## Estado y próximo paso
**Sin merge de arte ni publicación verificada. Art Gate integral no aprobado.**
Quedan B118 soportes ocultos, B119 anillos/cuerpos, matriz completa de skins/equipo y rendimiento móvil sostenido. Cola23entradas preservada; MorvethB168 y AelithB106/B107 siguen pendientes.

Reanudar composición agrupada B118/B119 con `tools/vfx/capture-brakk-composition.js` y receta06, manteniendo pose idéntica; usar el relay corregido y `tools/vfx/diagnose-brakk-component-pose.js` para verificaciones. No repetir primeros53cuadros, firmas05, PR200 ni RNG Solciju/Veyra. Si reapareceB117, guardar estado exacto y PNG antes de atribuirlo al arte. Separar solo componentes aprobados; nunca integrar tallerFIX entero. Inventario global incompleto.

Fuentes y comandos: recipe.json. Intentos: TEST_ATTEMPTS.json. Diagnóstico: ROOT_CAUSE.json. Cierre: REMOTE_CLOSURE.json.
