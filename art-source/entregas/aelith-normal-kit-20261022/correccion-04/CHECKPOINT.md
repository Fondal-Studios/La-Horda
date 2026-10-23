# Aelith B107 — contacto04

23/10/2026. PR199, rama art/aelith-normal-kit-first-pass-20261022. Parent ffd81f91920d2f809449c68b75b0840f83bf3fa6; recuperación c90353d851fabe9832c527c28536beaf698cbcfb. Main6334ff40b6514808ef0fe00b50bec15e19f10c25. Heads y cierres remotos consultados; sin concurrencia detectada. Producción y comprobación remota en REMOTE_CLOSURE.json.

## Cambio

B107 conserva tres snapshots reales del cuerpo equipado, relleno16/28/40%, muestreo60ms, deuda800ms y colapso220ms. Añade solo el borde posterior de la pose más antigua a la capa superior: rumbo según desplazamiento real, contorno1px y coordenadas enteras. El relleno sigue bajo cuerpos. Máscaras/bordes cacheados por snapshot; pasar a gris no relee píxeles. Muerte, SFA_OFF, culling y fin se resuelven nuevamente al dibujar.

Solo c/aelith.js cambia entre450JS runtime del parent. B106 y código previo a estelas idénticos; engine/bind, UF/PR191 y demás fuentes preservados. Cuatro atlas anteriores y slow-sand reexportados idénticos. Atlas diagnóstico de seis poses base/skin en ámbar/gris/borde;0 nuevos cuadros de cuerpo. No cambio de mecánicas, daño, velocidad, tiempos, balance ni protocolo.

## Evidencia

-51 controles de máscaras/carga de skin/culling/reentrada/muerte/reset/fase PASS;41 ciclo de vida,33 B106,27 kit y131 funcionales PASS.
-43 relay real PASS, incluye contorno dibujado durante movimiento en anfitrión e invitado táctil,43checks conservan B106/eco/deuda/UF. Resultado fallido42/43 anterior guardado: diferencia de representación decimal1800.0000000000002 frente a1800, con cinco objetivos correctos; tolerancia aritmética1e-6ms sin cambio de duración.
-SFA combate/RNG29884/29884 idéntico360frames. No afirmación de aislamiento global del azar.
-Gate de nueva capa superior:720colocaciones por viewport (6arenas×2apariencias×4direcciones×3fases×5cruces). Mínimo83.08%móvil/83.28%horizontal, umbral80% intacto. El intento de tres contornos completos falló174/180, mínimo58.23%; fuente/evidencias guardadas. Gate aislado no sustituye contraste compuesto integral.
-2sceneHash iguales antes del cast, seis tiempos por viewport. Optimización conserva14PNG de capturas finales idénticos. Capturas nativas390x844/844x390.
-Benchmark informativo100stamps: primer candidato p95=5.7ms; optimizado1.5ms vs parent1ms, recolor gris.4ms vs parent.7ms.300pasos retienen3shots y reset0. No aprobación de performance móvil ni GC global.

## Estado y siguiente acción

GENERADO / EN_CORRECCION / NO_INTEGRAR. No VALIDADO, no INTEGRADO_MAIN, publicación no verificada. Revisión inicial favorable para contorno posterior, pero B107 sigue pendiente de lectura de aura gris después de220ms, composición de horda/aliados/anillos, matriz integral de skins/arenas y performance móvil. PR199 conserva otros pendientes B106, no mergear taller aunque CI pase. TEST_ATTEMPTS guarda todos los intentos y correcciones de arnés.

SIGUIENTE: Morveth B168 contacto/contraste desde PR198 head20d65cf2c0b11e200aa785c64b6e1b16627810a0 (consultar fresco). Después gates integrales por componente, incluyendo B107 residual y B106 horda densa/PvP. No repetir primeras pasadas ni RNG Solciju/Veyra ya corregido. Reconciliar extensiones compartidas solo al separar componentes aprobados, sin importar FIX. Cola22entradas e historial preservados; inventario global incompleto. Reproducción exacta en recipe.json.
