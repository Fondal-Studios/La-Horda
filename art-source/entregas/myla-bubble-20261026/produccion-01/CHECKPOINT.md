# Myla — producción auditada de vínculo de burbuja

Base main9709434da727b0c504f021b023de3f0eabe4a93d. A-FX-myla-h3/bubble-state, parte de B177. EN_CORRECCION / NO_INTEGRAR; no cierre de B175/B176/B177 ni kit.

Un runtime local, 11 líneas añadidas/1 cambiada: reutiliza todas las fases existentes y lee escudo actual al dibujar; WeakMap mantiene una sola burbuja visible por dueño al recastear. No mecánicas/engine/arte instalado nuevos.

Nuevo: baseline main real useSkill+damageHero confirma shield0/draw1; candidato draw0. Diez checks finales de estado/dibujo, daño mismo frame, atraso de estado (probe), muerte, recast, textura y TTL PASS. Snapshot probes no son relay. Dos capturas móviles revisadas sólo diagnóstico, distintas escenas/aliados: NO ABA visual. Nodecheck/diffcheck PASS. Error TDZ del arnés preservado.

Pendientes: CIERRE de este componente: relay real/orden snapshots/owner y cambio de clase; semántica de escudo compartido, matriz seis arenas/todaslooks/desktop+móvil/contraste/secuencias; paridad/performance/ArtGate y CI SHA exacto. No abrir otro kit para evitar cierre. Fuentes intactas Musashi ya integradas, no remergear227. Publicación no consultada en este bloque.
