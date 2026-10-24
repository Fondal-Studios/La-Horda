# Revisión de clasificación — 22/10/2026

Estado: EN_CORRECCION / NO_INTEGRAR. Se inspeccionaron comparison.png y mobile-comparison.png. Son contactos al50% del recorte360x260 del renderer real (viewport844x390 y390x844), misma cámara/semilla/tiempos250,750,1600,3050,3300,3800ms. Ocho sceneHash iniciales idénticos. La tira móvil usa marcha oscilante determinista para mantener al cuerpo dentro del recorte. No es una aprobación de legibilidad a escala1:1 ni de todas las skins/arenas.

- B105: cuenta atrás y aspecto original conservados; la corrección de cancelaciones/expiración se demuestra con41 controles específicos y relay real. Las muestras de la tira no capturan todos los cuadros del estallido. Revisión integral pendiente.
- B106: sin redibujo. Continúa línea demasiado fina y faltan apertura/cierre longitudinal y estado lento propio: permanece FIX.
- B107: fase relativa y deuda gris800ms ahora existen y se prueban con estados/eventos reales. Los snapshots retornan al cuerpo en220ms. En el contacto móvil estela y gris todavía se pierden entre cuerpo/anillos; clasificación FIX para grosor/contraste. No afirmar silueta aprobada por pasar timers.
- UF: imagen idéntica byte a byte en ambas comparaciones. PR191 preservado; esta corrección no aprueba su taller.

Pendientes: escala1:1 en seis arenas y skins, contraste específico aura/beam, warmup y rendimiento de snapshots, saturación/reentrada/culling con transiciones y gate integral. El PASS general de legibilidad de la primera pasada no cubre el nuevo gris.
