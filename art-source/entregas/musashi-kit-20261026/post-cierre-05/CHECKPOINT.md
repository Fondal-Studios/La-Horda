# Musashi — cierre integrado PR227

26/10/2026. **INTEGRADO_MAIN / PASS_COMPONENT**, sólo A-FX-musashi-h3/thousand-cuts.

Head aprobado 514ca9b9ec475429965c27c6f389b26e2cbc710c; merge 9709434da727b0c504f021b023de3f0eabe4a93d a 2026-10-26T16:32:15Z; árbol f1bf056729aa3d9a124c086af35ca565c5fad546. 22 checks y 10 workflows exacthead SUCCESS, listo y merge normal con expected_head_sha. PR/ref/main/padres/árbol verificados. No remergear PR227.

Producción inmutable: cierre-05, 86 archivos cotejados Gitblob/árbol remoto. Este cierre posterior añade evidencia, sin runtime. Diff total PR: 361 rutas, sólo cuatro runtime. Los FIX históricos se conservan y se superseden únicamente para el componente nombrado; no cierra B172/B173/B174 ni el kit.

Pruebas actuales: 120 escenas compuestas/768 ABA (96 no Errante fuente idéntica + 24 Errante final con texturas listas), mínimo 85,976%, umbral 80%/delta24 intacto. Casts/relay reales 447,3/536,76; 80 bordes de cámara, 21 lifecycle, ocho grupos UF. Paridad 360 frames/15216 RNG y estado resumido igual, sin snapshot global. Cuatro reexportaciones idénticas. Renderer completo con limpieza: 1360 base + 1360 Errante; límites en REMOTE_CLOSURE. Fuentes e intentos fallidos preservados.

Mientras CI: ocho escenas adicionales con radio evolucionado real 536,76, 48 ABA, mínimo 94,752%, cero errores; dos hojas y dos fullframes revisados. Esto supersede la limitación de fullframe536,76 en REVIEW de producción, sin alterar el manifiesto inmutable.

Publicación GET 16:32 UTC: índice consume los cuatro JS, HTTP200, hashes distintos. NOT_CONFIRMED. Main no demuestra publicación; no se tocó infraestructura.

Siguiente: PRODUCCIÓN auditada Myla B175/B176/B177, leyendo main/PR frescos y NEXT_MYLA_* (21 referencias, inventario no exhaustivo). Tres casts y daño real: escudo agotado, burbuja KVB aún visible; anillo legacy ya condicionado por shield>0. No es arte nuevo ni gate. Preservar torre/puddle/cuerpo/skins/UF y muerte PR190; revisar propietario, red y lifecycle. Familia VFX muta estado/RNG al dibujar: no asumir ABA con pose sola.

Reproducción: ver REPRODUCE.md. Para comprobación evolucionada/auditoría siguiente usar los scripts añadidos en este post-cierre sobre runtime de producción. Inventario global incompleto, tarea activa.
