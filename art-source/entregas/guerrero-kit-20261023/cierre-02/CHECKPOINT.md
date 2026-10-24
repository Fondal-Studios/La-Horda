# Guerrero: cierre del consumidor de trampa armada

Estado: **VALIDADO / PASS_COMPONENT** para `A-FX-guerrero-h3 / armada`, cuadro7. **INTEGRADO_MAIN: no; publicación: no verificada** al crear este commit. PR212 contiene el SHA vigente, el resultado de CI y el cierre remoto posterior.

Base reconciliada: main `3d25a89ef1765443c464ac25c59018ad7a6a5c8b`; anterior PR212 `e692d37f62c9f4fd05ab04fc18540d2ebbacd8c4`. Diff runtime real: sólo11líneas en `js/champions/asesino.js`. Todos los assets originales y muerte PR187 idénticos. Cero arte nuevo.

20controles de dibujo/carga/fallback,11ciclo real,4relay anfitrión/invitado táctil PASS.360frames main/candidato:26024/26024RNG y estado mecánico resumido idéntico; no snapshot global.72escenas a400ms y72 a1600ms:288restauraciones y estados exactos. Seisarenas,base/equipo/Nocturno,escritorio1280x720/táctil667x375,escaso/denso. Máscaraenemigo100% retenida, umbral80%/delta24; controlnegativo0% en4muestras falla como debe. Sietehojas1:1 revisadas:PASS sólo marcador persistente. Detalles y límites en REVIEW.json.

Performance local600lotes×32dibujos con atlas cargado:p95≈0.2ms,max23.5ms;19201dibujos sin RNG ni mutación de trampa. No framecompleto ni teléfono físico. Preparación280ms,radio65u/afuera66u,activación,expiración y nuevoinicio probados. Dense es composición congelada: un enemigo real dentro activa la trampa.

Intentos fallidos y correcciones del arnés conservados en TEST_ATTEMPTS.json. Primer render frío no daba A/B/A exacto; matrices finales preparan caches antes de medir y no certifican ese renderfrío.

Próximo: consultar PR212 fresco, diff real y checks/workflows del SHAexacto. Sólo con todo aplicable verde: marcar listo y merge normal con expected_head_sha; verificar PR/main y publicación por separado. No reabrir otra primera pasada antes de intentar cerrar esto. Tras cierre, producción IriaB151/B152/B153 y luego otro cierre, alternando según orden directo de Nano. No considerar B143 ni inventario global completos. Bront y restantes talleres siguen preservados.

## Cierre remoto confirmado — 24/10/2026

**INTEGRADO_MAIN** sólo `A-FX-guerrero-h3 / armada / cuadro7`. PR212 dejó de ser borrador y se mergeó normalmente el 2026-10-24T03:58:42Z, con expected_head_sha `80f46178efdaa63f79922d0d5bdfd165083dbe8e`. Resultado/main verificado: `51c9d4584d45e8c19c4d237a64e8033a6b845bb1`. Los 19 checks y los 8 workflows aplicables del head exacto terminaron SUCCESS; evidencias en CI_FINAL.json y PR212_MERGE.json. Cero atlas nuevos; 11 líneas runtime.

**Publicación: NOT_CONFIRMED.** GET posterior al merge, 03:58:55 UTC: PNG/WebP de trampa exactos, pero asesino.js conserva el consumidor anterior (también anterior a PR204). PUBLICATION.json guarda bytes/hashes/URL. Falta conexión de despliegue al hosting canónico documentada; no se modificó infraestructura. Este desfase no bloquea el trabajo en el repositorio.

Siguiente bloque **PRODUCCIÓN Iria B151/B152/B153**, después **CIERRE** de un taller acumulado. NEXT_IRIA_AUDIT.json guarda observación real de ocho casos con cero errores, anclas 0/1/2/3, tensión y corte; no es arte nuevo ni aprobación visual. Preservar cuerpo/skins/UF existentes. Bront mantiene prioridad de cierre del conjunto completo y sus fuentes, sin reemplazo parcial. Cola histórica 46 intacta; el estado VALIDADO de Guerrero en el snapshot previo queda supersedido sólo para este componente por REMOTE_CLOSURE.json. B143 y el inventario global no están cerrados.
