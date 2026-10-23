# Brakk: composición del indicador de armadura 08 — 23/10/2026

Estado **EN_CORRECCION / NO_INTEGRAR**. PR197 continúa borrador. No merge ni publicación verificada.

Parent `b31fa4535a0970e535c05eed8678db7e82876d55`; recuperación `f7c5387325babb07db98bb265bd25f6570732439`. Main `758aa2ffacaae6542d31776e4a66ea7847a73b1b`, PR200 ya integrado. Cierre07 recuperado íntegro; ningún cierre perdido detectado. Parent18checks y5workflows de PR exitosos consultados; no equivalen al CI del candidato final.

## Cambio efectivo

B119: el anillo genérico de armadura cede al aura propia según su fase real. Solo ocurre si hay un evento `brakk_repair` del receptor exacto, activo y con atlas listo en la arena vigente. En carga fría, evento ausente/expulsado, reset, SFA_OFF, fin o error del perfil, queda el indicador genérico. Anticipación/disipación cruzan las opacidades. Ningún buff, emisor, azar, radio, daño, duración o protocolo cambia. Solo dos JS runtime: `kit-shared.js` y `skill-fx-a/c/brakk.js`. Engine/bind/firmas05/UF intactos.

Cinco atlas,53cuadros reexportados con RGBA idéntico a06; PNG bytes diferentes, ambos hashes registrados. Cero cuadros nuevos. Fuentes antes/candidato y receta reproducible incluidos. B118 sin cambios;8comparaciones de control al mismo cuadro idénticas.

## Evidencia nueva

-33componentes PASS: renderer real, fase, fallback, arena/caché, destinatario, limpieza, muerte, saturación/reset y efectos reducidos. Canary que fuerza ocultación total falla19controles, exit1 conservado.
-19kit y81funcionales PASS. Paridad parent/candidato360frames:29232/29232 Math.random y snapshot mecánico idéntico; no certifica aislamiento global de todo RNG visual.
-24relay real PASS y3esperas acotadas: cruce de opacidad observado51veces en host y77en invitado táctil, solo en receptor Brakk fi1. No nueva prueba de CPU×6.
-120escenas:6arenas×5apariencias(base/equipo/skin glacial/croma/set4)×2densidades×2viewports, tiempos80/330/610/1600ms.240A/B/A exactos y estados pool/objetos idénticos. Cambio localizado132–135píxeles.248controles de paquete PASS. No Art Gate compuesto.
-12hojas comparativas1:1 y selección de PNG nativos subidos; JSON de las120escenas completo. Índice con hashes de1157PNG generados, no todos publicados. Reproducir con recipe.json.
-Perfil:600lotes de40consultas con2entradas de pool; p95local0.1ms,máximo0.5ms. No benchmark de cuadro completo, móvil físico, carga sostenida o GC.

## Revisión y pendientes

Bosque/Hielo/Infernal móvil revisados inicialmente: desaparece el anillo celeste duplicado, pero el cambio es pequeño; cuerpos de aliados, anillos de arena/set y otros efectos dominan parte del contacto. No aprobar B119 ni taller completo. B118 mantiene el defecto de soportes en horda densa. No se regeneraron53cuadros ni firmas05. Historial23entradas intacto, incluida evidencia06 de2B117 no reproducidos07. MorvethB168 y AelithB106/B107 siguen pendientes; RNG Solciju/Veyra ya corregido.

## Reanudar

Consultar head remoto y REMOTE_CLOSURE.json. **Siguiente: B118 composición densa**, instrumentar orden real de capas después de SFA con A/B/A de pose idéntica antes de alterar soportes; no repetir diagnósticos07, firmas05, primera pasada ni PR200. Usar `tools/vfx/capture-brakk-composition.js` con receta06/pose corregida y `tools/vfx/brakk-armor-online.js` para regresión. Para B119 usar `tools/vfx/capture-brakk-armor.js` y recipe08, conservando fuentes. Falta composición integral, crew/múltiples receptores, rendimiento móvil sostenido y CI exacto antes de separar componente aprobado. Inventario global incompleto.

Producción remota verificada: 2d48b73bf932b9883a809a536b66b86eb1369ad6. 67 archivos cotejados por Git blob. Consultar REMOTE_CLOSURE.json para cierre. CI del SHA final debe consultarse de nuevo; borrador NO_INTEGRAR.
