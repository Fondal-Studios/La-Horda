# Ilkan — primera pasada B145/B146

Base `3d25a89ef1765443c464ac25c59018ad7a6a5c8b`. Cierre remoto Guerrero PR212 leído y verificado; sin cierre perdido. PR213 ya estaba integrado por otro trabajo.

**GENERADO: dos atlas nativos, 24 fases no vacías/distintas (12 por atlas). EN_CORRECCION / NO_INTEGRAR.** Placas separadas para Piel de Duna y pendones para Caravana, ligada a los temporizadores reales de caster y aliados. Dos fuentes runtime cambian (+71 líneas). Atlas PNG son exportaciones exactas del caché canvas; no se generaron cuerpos ni se duplicaron lanza/coloso/skin/UF existentes. B144 ya tiene lanza y pendón en uso; no cerrar todo B144/B145/B146 ni Ilkan por esta entrega.

18 controles técnicos PASS; 254 regresiones Expedición PASS. Comparación 360 frames: RNG 30070/30070 y estado mecánico RESUMIDO iguales; no snapshots completos ni aislamiento global. Ocho escenas precast idénticas; H1 y UF: 12 PNG idénticos en total. Dos atlas reexportados byte-idénticos.

Relay final horizontal táctil 8/8 PASS: dos casts reales, placas del dueño1 y pendones en caster1/receptor0 llegan a ambos clientes. Host/invitado placas154/185, pendones por receptor150/177. Dos timeouts previos conservados, raíz no demostrada; uno registra ausencia de timer aliado y dibujo aliado. Repetición vertical8/8 no evidencia visual: pantalla de rotación; conservada. No ocultar estos límites.

FIX: placas pequeñas/ornamentales y pendones dominados por cuerpos/nova/anillos en contacto denso. Sin aprobación Art Gate integral. Pendientes skins/equipo/seis arenas/contraste compuesto/performance/culling/reentrada y casos extremos de receptores. No se dibujan estos marcadores en coloso, que conserva originales. Sin merge, sin publicación verificada. Cola histórica44 se conserva y añade B145/B146.

Siguiente primera pasada: auditar Iria B151/B152/B153 en main/PR/fuentes/consumidores frescos. Coloso Ilkan B147..B150 ya emite grietas/pisadas/pilares/siluetas: conservar, no asumir faltantes por conteos; no aprobado globalmente. No repetir Ilkan mientras falten primeras pasadas. Para correcciones futuras usar recipe.json, completar Art Gate y CI exacthead antes de separar componente aprobado. Inventario global incompleto.
