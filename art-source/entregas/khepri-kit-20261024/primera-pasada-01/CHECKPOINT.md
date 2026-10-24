# Khepri — primera pasada parcial, 24/10/2026

EN_CORRECCION / NO_INTEGRAR. Dos tiras nativas candidatas: B155/A-FX-khepri-h2 placas80x72x12 y B156/A-FX-khepri-h3 élitros96x48x12.24fases,23no vacías,1cierre transparente;9/12RGBA distintos por atlas. Fuente de código nativo, receta, PNG y preview. Sin instalación: cero archivos runtime cambiados, no merge/publicación. No cierra B155/B156 completos.

Auditoría fresca desde main e3495de28b760425f26be9041b8b4fcbafcc9094, sin PR Khepri abierto. H1/B154 ya posee enjambre que sigue as_swarm: no regenerado. Cuerpo,2skins,iconos,recetas/básico/UF eclipse existentes preservados (26referencias). Tres casts reales: H1 crea as_swarm3700ms/go con destino150; H2 consume20→5escarabajos y escudo0→27.24; H3 desplaza x0→180. Sin errores. Sólo observación main, no prueba candidato ni paridad/multiplayer.

Primer intento falló por recortes; fuente/PNG/índice/log conservados. Segundo amplía margen y pasa alfa0/255/bordes0 en24cuadros. Revisión visual de tiras: placas parecen hojas sueltas; élitros parecen aletas/flecha. FIX y conexión real pendiente: no afirmar aprobado por controles técnicos. Preview100msdiagnóstico, no timing del juego. Falta revisión compuesta, estado/duración real del escudo y dash, skins/equipo/seisarenas, relay,performance y ArtGate. Cola51 preserva49.

SIGUIENTE: CIERRE del acumulado, no otra primera pasada para evitarlo. Candidato prioritario: Solciju PR195 copa/componente separable; auditar head/gates actuales y separar únicamente si puede aprobarse sin RNG/capas FIX. Bront sigue bloqueo de calidad; no repetir prompt03. Khepri queda en lote agrupado con fuentes/IDs: corregir siluetas y enganchar sólo a escudo/dash reales antes de integrar. PR216 y212 ya integrados, no remergear. Inventario global incompleto.
