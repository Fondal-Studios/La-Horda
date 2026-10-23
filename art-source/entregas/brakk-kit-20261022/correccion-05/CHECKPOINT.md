# Brakk — firmas normales05, 23/10/2026

**EN_CORRECCION / NO_INTEGRAR**, PR197 borrador. Tres señales propias reemplazan la estrella de las normales: mampostería, torreta de clavos y vigas en X remachadas. Solo `js/skills/champion-signatures.js` cambia frente al cierre04. Eventos/key/slot, emisor,460ms, combate y UF conservados; otros449JS intactos. Cinco atlas/53cuadros del kit reexportados idénticos. Sin merge ni publicación.

Atlas nativo192x120:12celdas48x40 (3motivos×4separaciones de montaje), paleta limitada, alfa0/255. Tres tiras temporales12muestras cada una; se dibuja desde un único atlas en caché. Ancla normal82u para despejar nombres/HP; no modifica cuerpo/hitbox. Fuentes previas y candidatos conservados.

## Verificaciones

108controles de renderer/UF/otroscampeones/culling/reentrada/vida/pool/caché PASS;19kit,81funcionales y20relay real PASS. Las tres señales llegan al host y al invitado táctil. Paridad parent/candidato360frames:29232/29232 llamadas RNG y snapshot completo del arnés idéntico. No afirmación de aislamiento global de RNG.

144escenas6arenas×2apariencias(base/set4)×3normales×2densidades×2viewports.1584dibujos de firma por viewport.130/144 A/B/A se restauran byteidénticos;14fallos en Acuática,91/195píxeles sobre cuerpos/construcciones, causa exacta pendiente.144/144 estados de pool/objetos idénticos. Capturas salen1 y se conservan: no se declara matriz PASS ni Art Gate integral. Traces completas, índice de todos los PNG y raster representativo guardados.

Benchmark local final600muestras/32firmas: p95candidato0.1ms/parent0.2ms; máximos62.5/122.3ms. No certifica móvil sostenido/GC ni bake frío. El candidato sin caché y sus mediciones con carga concurrente se conservan; no son una comparación formal de velocidad.

Revisión asistida: siluetas ahora distintas y fuera de nombres/HP; en Infernal siguen discretas. Soportes B118 aún ocultos en contacto denso y refuerzo B119 dominado por anillos. Todo sigue FIX.

## Próximo paso exacto

1. Leer cierre y heads frescos; no repetir53cuadros ni PR200.
2. Usar recipe.json y `tools/vfx/capture-brakk-signatures.js`: investigar14restauraciones de Acuática manteniendo control estricto; no atribuirlas sin prueba al arte o al entorno.
3. Completar corrección agrupada de composición B118/B119 y contraste integral de firmas con skins/equipo; conservar fuente nativa actual como candidato. No cerrar B117/B118/B119 por estas señales.
4. Validar rendimiento móvil sostenido, CI exacto y Art Gate antes de separar/integrar componente. Mantener residuales Morveth B168 y Aelith B106/B107; inventario global incompleto.
