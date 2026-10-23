# Brakk — validación 03, 23/10/2026

Estado: **EN_CORRECCION / NO_INTEGRAR**. PR197 permanece borrador. Cero cuadros nuevos; cinco atlas/53 cuadros reexportados idénticos. No merge, main ni publicación. Inventario global incompleto.

## Fallo CI y corrección concreta

Head anterior `d411b331324095b61def28454cf04feb3ac6e441`, merge de prueba `8670ba9e2fa0a89b07fa171cf853251423296e93`. El único FAIL del job [Objetos, economía y tienda A](https://github.com/Fondal-Studios/La-Horda/actions/runs/39877153827/job/120165818911) era `VOZ.fase_emitida`: no había frase todavía; la siguiente comprobación la encontró.

El test original pasó local37/37. La reproducción40 semillas obtuvo dos fallos (10/34): stun224/240ms, fase0 al exigir la voz tras144ms. Tras32/33 pasos adicionales de16ms, desaparece el aturdimiento, el director entra en fase1 y la frase real llega a la cola. La traza de CI no guardó stun; esta reproducción demuestra una causa del mismo fallo, no la semilla exacta del job.

`tools/items/t_story.js` ahora espera la transición real de fase con una espera adicional acotada de3000ms (la espera posterior de visualización conserva3000ms), manteniendo bloqueado el despacho hasta inspeccionar la emisión. Conserva las aserciones de emisión y visualización.37/37PASS. Control negativo con storyBossPhase suprimido falla en emisión. No se tocó historia, combate ni renderer.

## Evidencia B118

60 escenas reales:6 arenas ×5 apariencias(base,4 piezas genéricas,skin glacial+carga,croma+carga,set4 piezas) ×2 viewports(390×844/844×390),80/330/610ms.12 hojas de contacto a escala1:1 en `matrix/`; JSON completos y capturas nativas seleccionadas. El consumidor real `artMipDraw` recibe el atlas equipado39 veces/escena; el atlas SFA corregido se dibuja38 veces/escena. Total2340/2280. No basta consultar nombres de skins.

19kit y20fase PASS;11checks de saturación40/16, expiración, rechazo fuera de vista, nueva entrada, reset y caché PASS. Benchmark local600renders: p50=1.4ms,p95=2.3ms,max10.6ms; bake frío0.7ms,500consultas calientes p95=0 con resolución del reloj,max0.1ms;3eventos retenidos/reset0,caché1. No certifica dispositivo físico, GC ni temperatura.

450JS runtime cotejados contra parent:0 cambios. Atlas/fuentes/IDs,props y UF intactos. No nuevos ensayos multijugador: referencia14relay de correccion-02, sin afirmar una repetición. No declarar nueva paridad RNG a partir de resultados antiguos.

## Revisión y pendientes

La muestra visual confirma la skin/set y los soportes articulados, pero la horda densa oculta gran parte de la silueta a330ms. Diamante/anillos genéricos y destellos del equipo dominan. B118 sigue FIX: gate aislado previo82% no certifica lectura compuesta. Falta revisión integral de toda la matriz, B117/B119 con equipo, contraste compuesto, rendimiento móvil sostenido y CI del nuevo SHA. Cola común22 entradas e historial conservados.

Intentos conservados en TEST_ATTEMPTS: sufijo~h omitido en aserción; fixture Minas entraba en descenso por runLevel para una habilidad no definitiva; observador inicial ignoraba mipmaps; prueba de pool inicial avanzaba vfxUpdate en menú aunque SFA envejece durante renderer. Todos corregidos solo en arneses, resultados iniciales guardados; no se rebajó umbral.

## Reanudar

1. Leer REMOTE_CLOSURE.json, REVIEW.json y heads frescos PR195–199/main. Si falta cierre, recuperar RECOVERY.json y commit remoto antes de editar.
2. Ejecutar `OUT=art-source/entregas/brakk-kit-20261022/validacion-03/mobile MOBILE=1 node tools/vfx/capture-brakk-integral.js` con NODE_PATH/CHROMIUM_PATH de recipe.json.
3. Continuar gates por componente: comparar contacto denso/escaso y capas legadas de B118; completar B117/B119. Agrupar cualquier corrección de composición, no retocar un cuadro repetidamente.
4. La corrección test-only de t_story se puede separar desde main junto a su prueba si los checks exactos pasan. No importar el taller entero. Revisar checks del SHA exacto, no reutilizar verde del parent.
5. Conservar residuales Morveth B168 y Aelith B106/B107. RNG Solciju/Veyra ya corregido; no reinvestigar sin evidencia. Guardar cierre remoto antes del próximo componente.

## Cierre remoto

Producción: `49af00d3b9b02d639945bc03f1bc676970b2678c`, 63 archivos cotejados por Git blob remoto. Corrección test-only aislada desde main en [PR200](https://github.com/Fondal-Studios/La-Horda/pull/200), head `ae3d384a2117323d7154b30760ad621106dec0c6`, un archivo (+9/-7). Checkout limpio de main con ese único cambio:37PASS (`story-main-fixed.log`). PR200 listo para revisión, no borrador; CI exacto pendiente, no merge. Verificar sus checks/workflows antes de integrar con expected_head_sha; puede cerrarse independientemente del arte FIX de PR197.

Main observado `6334ff40b6514808ef0fe00b50bec15e19f10c25`. REMOTE_CLOSURE.json registra pruebas/archivos verificables. Los cierres se cotejan tras el commit final; no se simula un hash autorreferente.
