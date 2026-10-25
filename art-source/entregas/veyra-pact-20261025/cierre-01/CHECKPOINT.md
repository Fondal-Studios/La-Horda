# Veyra — cierre aislado del lanzamiento de Pacto

25/10/2026. Base main9c0ac434b2cb80ae16e7220371f59944ac3e9613. PR219 ya incorporó el taller; no se reabre PR196 ni se vuelve a integrar ese conjunto. Último cierre Libertador171f23c verificado, sin interrupción nueva.

VALIDADO / PASS_COMPONENT sólo A-FX-veyra-h3/launch-heart (B228). Corazón abierto con dos lóbulos y sutura;24x24x10, seis atlas de arena. Radio cosmético22/y-126, evento760ms original. Un runtime+13/-2; ninguna mecánica, cuerpo/skin, H1/H2/UF, aura persistente ni emisor cambia. El latido del suelo sigue EN_CORRECCION, no cerrar H3 ni kit.

Nuevos controles:14dueño/lifecycle y12follow sobre main;34raster/cache/renderer/pool/culling sobre candidato;23relay real final hostMorveth/invitadoVeyra táctil con dibujo del nuevo atlas.132funcionales PASS antes del último cambio sólo de radio/offset. Paridad actual360frames29969/29969 KVB on/off repetida dos veces; estado resumido igual, no snapshot completo ni aislamiento global.120escenas seis arenas×cinco apariencias×dos densidades×dos viewports:480restauraciones A/B/A y estados exactos, mínimo100%retención de cuerpos, umbral80%/delta24 intactos.18mediciones del gate existente con sólo veyra.pact PASS; no equivale a revisión del aura persistente. Cinco consumidores de apariencia observados con83dibujos cada uno en prueba móvil focalizada.

Primer conjunto75.51% y candidato anterior con fallos bajo80% conservados. Canary opaco falla como corresponde. Doce hojas nativas y capturas completas seleccionadas revisadas; índice completo de raster, no todos subidos. Performance aislado600renders×32eventos p95~0.1ms/max20.4ms local; no móvil físico/GC/frame completo.

CI exacthead pendiente; no merge/publicación todavía. Consultar REMOTE_CLOSURE posterior y PR. Publicación actual de Veyra difiere de main, documentada en PUBLICATION_PRE. No tocar infraestructura.

SIGUIENTE: seguir este cierre hasta CI aplicable verde, revisar diff/head frescos, listo→merge normal expected_head_sha y verificar PR/main/publicación. No abrir producción para evitar el cierre. Tras completar, alternar producción auditada del siguiente kit realmente faltante; la cola54 y los FIX de PR219 se conservan. Comandos en recipe.json.
