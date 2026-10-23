# Baltra — primera pasada del kit normal, 23/10/2026

Estado: GENERADO → EN_CORRECCION / NO_INTEGRAR. VALIDADO=false; INTEGRADO_MAIN=false; publicación verificada=false.

Base main758aa2ffacaae6542d31776e4a66ea7847a73b1b. Rama art/baltra-kit-first-pass-20261023. Recuperación remota8c323740a2b4921dc6f999a7316c51cd40ddc7a4 antes de producción. No se detectó cierre perdido de Bront02/Brakk11. IDs B114/A-FX-baltra-h1, B115/A-FX-baltra-h2, B116/A-FX-baltra-h3 conservados.

Producción: cuatro atlas nativos,48 fases (45 no vacías; tres cierres transparentes intencionales), ondas de bronce, guardia frontal/placas votivas y badajo de barrido-retorno. Fuentes JavaScript y originales preservados. Conectados a rutas SFA reales en esta rama mediante custom bake y extras optativos; no instalados en main. No imagen generativa necesaria para recetas del sistema Canvas nativo existente. No cuerpo ni skins nuevos.

Auditoría: cuerpo, dos skins, cuatro iconos, básica bell y definitiva de campana colosal ya existen; B010/prop ex_toll y recursos originales conservados, no se contaron como ausentes. B431 básico conservado; no se declara bloque completo. SOURCE_REFERENCES registra rutas y hashes.

24 controles técnicos PASS (alpha binaria/bordes/celdas/caché/fallback);4 atlas reexportados byteidénticos.254 funcionales Expedición PASS.360frames main/candidato con SFA activo:32003/32003 llamadas RNG y estado resumido comparado idéntico; no snapshot completo ni aislamiento global. Ocho sceneHash iguales antes del cast, cuatro PNG UF idénticos (tira y nativo, dos viewports). Comparación horizontal844x390/móvil390x844, cinco tiempos por habilidad, antes/después.

Relay local real:4/4 controles,0pageerrors, anfitrión Solciju/invitado Baltra táctil con skin. Dibujo de wave13/39,guard46/105,clapper12/33 host/guest; owner/objetos/skin comprobados. Intentos fallidos conservados: HTTP rechazado; fixture con Baltra duplicado impedía inicio (netHostStartGame valida duplicados), corregido sólo arnés. Primer parity inválido por inyectar archivo viejo después del binding UF, conservado.

Revisión visual inicial: ondas y guardia demasiado finas/poco distintas entre aliados; cono/rayos blancos legados dominan badajo. Tres hallazgos con hashes en REVIEW y cola común27entradas, preservando24históricas. Falta Art Gate integral, skins/equipo/seisarenas/contraste compuesto, lifecycle guardia, performance móvil y CI exacthead. No integrar taller completo ni afirmar cobertura aprobada.

PR91: head0cab425359d7cdac534e69631cf04b493ad36992, pruebasPR verdes salvo safari-engine reintentado (cancelación durante dependencias), aún en curso al preparar este cierre. Livecheck publicado aparte falla en URL antigua; publicación no verificada. PR90/92 conflictos y once talleres previos con FIX siguen bloqueados. No merge nuevo confirmado al crear este checkpoint.

Siguiente: auditar Brasa (B012 y normales) contra main/PR/fuentes/consumidores y producir faltantes reales en bloque; no asumir que cuerpo/UF faltan. Baltra, Bront02 y Brakk11 quedan en lote posterior de corrección. Antes de integrar un componente: corregir, validar visual/renderer/online/arenas y CI exacthead; merge secuencial con expected_head_sha. No repetir primera pasada. Para reproducir Baltra: comandos exactos en recipe.json, empezando OUT=/tmp/baltra-reexport node tools/vfx/verify-baltra-kit.js. El inventario global sigue incompleto.
