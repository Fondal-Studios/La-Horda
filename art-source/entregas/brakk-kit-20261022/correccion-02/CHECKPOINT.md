# Brakk — corrección agrupada de soportes02

22/10/2026. PR197, rama art/brakk-kit-first-pass-20261022. Base main6334ff40b6514808ef0fe00b50bec15e19f10c25; head previo9b0d27051e37e367a3e967104b63c2b7f2cf51b6. Commit de producción y verificación remota en REMOTE_CLOSURE.json. Conserva correccion-01 y temporizador propio del montaje B117.

## Cambio real B118

Las cuatro flechas de despliegue pasan a brazos articulados con rodillas remachadas y pies planos. Solo cambia pintor deploy de c/brakk.js; IDs, duración620ms, radios, torreta, disparo, otros cuatro atlas y definitiva UF conservados. Doce cuadros revisados, cinco atlas53cuadros reexportados. Fuente anterior preservada en source-before.js y commit padre. Recetas nativas SFA, no generación raster simulada.

Intento01 con brazos de tres píxeles falló legibilidad: enemigo79% en radio90,18filas fallidas por viewport. Se conservan código, atlas, hashes y ambos reportes en attempt-01. Brazo de dos píxeles con luz de uno corrigió el fallo sin tocar umbral80% ni mecánica; pies y rodillas intactos.

## Evidencia final

- Gate específico de burst, seis arenas, variantes normal/~h/~p y radios45/90/220, fases64/320/610ms:162filas/486colocaciones por viewport. Horizontal y móvil PASS, mínimo82%, mismos umbrales80% decal/40% full/35% fill. El contador0recetas del arnés refiere KVB; lista SFA explícita tiene9configuraciones, no cobertura vacía.
-19 comprobaciones kit y20 fase real B117 PASS; cuatro atlas no deploy idénticos por hash. Paridad combate/SFA on-off29232/29232 PASS.
-14 relay real host/invitado táctil PASS.81 funcionales Brakk PASS;132 Solciju/Veyra funcionales de regresión PASS (no sustituyen pruebas Brakk). Ejecutados nuevamente sobre fuente final.
-4sceneHash previos iguales y UF byteidéntica horizontal/móvil. Revisión atlas y captura móvil1:1 en330ms: pies planos distinguibles, centro abierto; no lectura de puntas de flecha. Capturas finales regeneradas tras afinar brazo.

## Estado y siguiente paso

GENERADO: despliegue revisado. EN_CORRECCION / NO_INTEGRAR: sigue borrador; faltan skins equipadas, matriz visual1:1 integral, otras vigas/aura, warmup/performance/saturación/reentrada y CI exacto. Revisión local favorable no aprueba kit completo. Ningún merge ni publicación verificada. Los cuerpos/props/UF no se regeneraron; engine/bind siguen exactamente el head previo.

Continuar lote Morveth B166/B167/B168 y Aelith B106/B107. Cola común21entradas conserva diagnósticos originales, correcciones de fase previas y el RNG heredado de Veyra y Solciju. No repetir primeras pasadas; no incorporar talleres completos al separar componentes aprobados.

Reanudar: `MOBILE=1 node tools/vfx/test-brakk-deploy-legible.js`; `OUT=art-source/entregas/brakk-kit-20261022/correccion-02 node tools/vfx/verify-brakk-kit.js`; luego matriz pendiente. recipe.json contiene exportación y captura. Consultar checkpoint remoto fresco; inventario global aún incompleto.
