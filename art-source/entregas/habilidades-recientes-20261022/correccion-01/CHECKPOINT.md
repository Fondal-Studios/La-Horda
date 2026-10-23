# Solciju — corrección agrupada de siluetas01

22/10/2026. PR195, rama art/recent-abilities-solciju-20261022. Base main6334ff40b6514808ef0fe00b50bec15e19f10c25; fuente previa7b89de24bdea58d5e5e321e18957d3b0c5715f05. Recuperación inicial b46dc52332389a40540393872ea76d4410eb0263. Commit de producción y verificación remota en REMOTE_CLOSURE.json. Cierre remoto anterior comprobado; no se detectó trabajo concurrente ni interrupción sin cierre.

## Cambios reales

B208/B209: derrames asimétricos de ocho segmentos curvos y gotas irregulares sustituyen estrellas de cinco puntas. B210: copa conserva contorno y tiene interior transparente/tramado. Fallback B490/B491 conserva burbujas y geometría líquida. Cuatro recetas44cuadros reexportadas, alfa0/255, mismos IDs. Gran Reserva activa usa UF existente, idéntica: so_pool_idle es fallback; no declarar definitiva nueva ni cerrar bloques enteros.

Solo runtime solciju.js y dos líneas en pixfx.js: registro tardío netHookEvents ya probado en PR196/199. hooks.js de primera pasada intacto. No cambios de balance, combate, props, cuerpo, cuentas, permisos o infraestructura. Arte nativo KVB reproducible; no se simula producción con imagegen.

## Evidencia

- Gate estricto seis arenas: siete incumplimientos anteriores reproducidos. Fill36→24%, copa mínima78→82%, tintes bosque/infernal diferentes.72 filas de fase/216 colocaciones de enemigo, sin bajar80/40/35. Legibility-before/after conserva ambos resultados.
- Exportador: cuatro recetas44cuadros, replay y pools128/64 PASS. Engine148recetas/3792sprites, cero Math.random cosmético y alfa intermedio; intento inicial sin servidor conservado, ejecución con servidor raíz propio PASS.
-132 funcionales,15 relay específico y23 online general PASS. Verifica carga, eventos en anfitrión/invitado táctil, expiración real de barrica y atlas exactos.
-10 sceneHash previos iguales; UF idéntica horizontal/móvil. Capturas antes/después de habilidades, fallback y seis capturas móviles1:1 seleccionadas; herramientas reproducen todas.
- Paridad KVB.off **FAIL heredado**:31834/26414 RNG y enemigos diferentes tanto en versión anterior como nueva. Snapshots completos antes/después con KVB activo son idénticos, también ambos desactivados. Esto NO equivale a paridad on/off. Registrado nuevo hallazgo en cola21entradas; no atribuirlo a este dibujo ni ocultarlo.

## Estado y continuación

GENERADO: cuatro atlas candidatos. EN_CORRECCION / NO_INTEGRAR: kit completo por RNG heredado y gates pendientes. Ningún componente VALIDADO/INTEGRADO_MAIN; publicación NO_VERIFICADA. Revisión visual inicial favorable de manchas/copa en escena móvil; faltan skins equipadas, matriz visual1:1 seis arenas, contraste de superposiciones completo, warmup/performance/reentrada y CI del head final. CI exitoso no sustituye Art Gate.

Siguiente lote: Morveth B166 disipación/B167 capas blancas/B168 micelio; Aelith B106 fractura/B107 estela. Brakk soportes corregidos en PR197 correccion-02. Investigar RNG compartido Solciju/Veyra antes de integrar. Leer heads/checkpoints frescos; no repetir primeras pasadas. Inventario global incompleto.

Reanudar: `ONLY=solciju PARITY_OUT=/tmp/solciju-parity.json node tools/vfx/parity-solciju-visual.js`; fuente anterior en source-before.js o git show7b89...; recipe.json contiene exportación/capturas. Publicar cierre remoto antes de otro bloque.
