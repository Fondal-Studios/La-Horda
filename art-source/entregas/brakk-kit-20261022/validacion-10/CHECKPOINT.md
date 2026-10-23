# Brakk — validación10 de cuadrilla (23/10/2026)

PR197 borrador; rama `art/brakk-kit-first-pass-20261022`. Parent `8d7a69fe654db111e1efcab7e20cb62472869c85`; recuperación `71dea059519d1496ef18a322ead9811c6a44ff65`. Producción pendiente de subida. Main `758aa2ffacaae6542d31776e4a66ea7847a73b1b` intacto; PR200 ya integrado. Cierre09 completo:88 entradas del manifiesto idénticas,18 checks del head09 exitosos. Sin cierre perdido ni nuevo merge/publicación.

## Resultado

**EN_CORRECCION / NO_INTEGRAR.** Validación técnica parcial; no Art Gate integral. 450JS runtime y cinco atlas/53cuadros conservados,0cuadros nuevos. Fuentes/receta/atlas originales referidos por SHA en SOURCE_REFERENCES.json; no duplicar producción.

Cuadrilla protegida probada con4receptores reales. 30controles locales PASS: selección por alcance/equipo/vida/fusión, duración, seguimiento, retiro por muerte/evento/reset y recasteo. Canary de dibujo omitido del receptor2 falla1/30 como se esperaba. Relay29/29 PASS +3esperas de estado; atlas de aura dibujado64veces por receptor en host y85 en invitado táctil. IDs y duración real3360ms por talentos intactos.

24escenas6arenas×base/set4×2viewports,4tiempos.48A/B/A misma pose/restauración/pool/objetos exactos. A/B es ablación sólo del dibujo SFA Brakk, conserva emisores y opacidad genérica real; no comparación de arte antiguo/nuevo. Hasta30.0885% de píxeles de máscara de aura comparten ubicación con otra aura (alfa>=64), diagnóstico geométrico sin umbral de aprobación.12hojas1:1 y selecciónPNGnativa incluidas; índice228PNG generados, no todos subidos ni aprobados. Revisión seleccionada Bosque/Infernal: motivos se confunden entre cuerpos/nombres/señales verdaderas de arena.

Rendimiento completo update+render:12casos×1200pasos(19.2s simulados/caso),32enemigos fixture/4héroes,cooldowns reales,2casts/caso y419cuadros/caso con4receptores.48controles de cobertura/pool/reset PASS. P95 con4receptores2.2–3.9ms; máximos iniciales Bosque165.9/161.5ms. Repetición Bosque con traza: máximos234.8/258.6ms en frame0. No atribuir a bake/GC sin perfil; NO rendimiento móvil aprobado, sin dispositivo físico/termal/GC. Pool máximo6/7 y reset0.

## Intentos y límites

Arnés online/captura intentó reasignar const sfaDrawOne; errores preservados, corregida sólo instrumentación en Canvas drawImage. Benchmark inicial error de sintaxis conservado. Primera traza contó Map con Object.keys y corrió junto a verificación: contador inválido/concurrencia declarados; final usa Map.size secuencial. TEST_ATTEMPTS.json mantiene todos. No nuevas81funcionales,CPU×6,RNG/combate ni gate aislado09; históricos no son nuevas corridas.

## Reanudación exacta

Leer cierre remoto/head fresco y recipe.json. Perfilar frame0 por componentes con benchmark-brakk-crew.js (update/render/atlas/cuerpo) sin cambiar runtime, conservando traza original. Proponer corrección agrupada de composición B118/B119 compatible con cuatro receptores: no ocultar señales mecánicas ajenas ni cambiar emisores/duración. Reutilizar captura de crew y relay para validar candidato; no repetir diagnóstico de capas09/relay07 ni producir otros53cuadros. Faltan equipo/skins independientes de aliados, Art Gate compuesto y rendimiento móvil sostenido. Mantener23entradas históricas y residuales MorvethB168/AelithB106/B107,firmas05,PR200,RNGSolciju/Veyra. Separar sólo componente aprobado; nunca mergear taller FIX. Inventario global incompleto.
