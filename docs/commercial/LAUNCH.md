# La Horda — propuesta de salida comercial

Fecha: 16 de octubre de 2026, Argentina. Estado: PREPARACIÓN; cobros y publicación comercial NO activados.

## Decisión propuesta para Nano

Publicar una alpha web gratuita con compras opcionales de apariencias. Primero una tanda pequeña de compradores y soporte directo; ampliar después de comprobar pago, entrega y restauración. La app de las tiendas queda como segunda etapa. No prometer ingresos, fecha de aprobación de tiendas, 50 jugadores en una sala ni número de campeones sin pasar QA.

Oferta propuesta (no activada):

| Producto | Entrega | Precio de referencia propuesto | Utilidad |
|---|---|---|---|
| Primer diseño | 1.200 Brasas | USD 2,99, convertido a ARS con la cotización aprobada | Alcanza para una skin con diseño propio según el precio actual de 1.200 Brasas |
| Tu colección | 2.800 Brasas | USD 5,99, convertido a ARS con la cotización aprobada | Alcanza para dos skins de 1.200 Brasas; permite usar descuentos de colección disponibles |

Ambos se pueden comprar más de una vez. No incluyen campeones, estadísticas ni acceso prometido a contenido futuro. Los dos productos nuevos permanecen ocultos salvo que el operador configure `PAYMENTS_PACK_IDS=brasas_inicio,brasas_coleccion`. No ofrecer inicialmente el paquete de bienvenida de una sola compra: abrir dos checkouts antes del primer pago puede generar dos cobros y una sola entrega. Los paquetes grandes de USD 49,99/99,99 quedan fuera de esta propuesta inicial.

Estos precios son una hipótesis comercial para aprobar, no una estimación de ingresos ni un estudio de mercado. Revisar comisiones de la cuenta, impuestos y devoluciones antes de fijar el precio final. La UI muestra ARS y exige que el importe aceptado coincida con el del servidor.

## Hallazgos comprobados

- `main` configura `wss://fondalstudios.com/la-horda/red`. No apunta al relay de Render.
- El Render `la-horda-relay` usa la rama `claude/horda-latest-updates-gv4tlf`; cambiarlo no cambia el servidor que usan los jugadores.
- `https://fondalstudios.com/la-horda/jugar/` respondió HTTP 200; sus cabeceras indican Fly. No hay acceso administrativo verificado a ese despliegue en esta sesión.
- `/la-horda/red/api/health` devolvió `store:file`, `persistent:false`, `status:ready`. Es una declaración del software; no confirma por sí sola la presencia o ausencia física de un volumen. Hay que inspeccionar montaje y respaldo.
- Relay sintético local: 50 conexiones / 13 salas / 60 segundos / 20 Hz / payload de 16 KiB. 88.504 entregas esperadas y recibidas, 0 desconexiones, 0 errores. Ver `capacity-local.json`. No equivale a FPS del móvil, carga de cuentas ni capacidad garantizada del host público.
- Intento WebSocket público: HTTP 403 desde este entorno. No se pudo determinar aquí si proviene del proxy o del servicio. NO se declara prueba pública aprobada.
- Resuelto en la rama `claude/eren-original`: el personaje derivado de una IP ajena se reemplazó por **Ilkan**, un campeón original (nombre, identidad, silueta, paleta, arte procedural, lore, textos y VFX nuevos; mecánicas idénticas), con migración de guardados. Ver `docs/ILKAN_REWORK.md`. **Pendiente antes de vender:** revisión humana de arte y registro privado de derechos de ese arte; el resto del catálogo, música y audio requieren su propia verificación de derechos.
- Las apariencias siguen formando parte del guardado que aporta el cliente; no se debe publicitar protección antifraude completa. Revisar autoridad del servidor y recuperación de compras antes de escalar.

## Trabajo preparado en esta rama

1. Webhook de Mercado Pago exige firma HMAC, consulta la API oficial y valida ID, vendedor, modo de pruebas/producción, moneda e importe exacto.
2. Referencia de orden firmada por el servidor conserva cuenta, paquete, importe y Brasas cotizados; una variación posterior de cotización no invalida el pago anterior.
3. Catálogo y confirmación muestran el precio de cobro en ARS; si cambia, se exige nueva confirmación.
4. Checkout y acreditación se bloquean con almacenamiento que declara no ser persistente; el webhook devuelve un error reintentable.
5. Paquetes de lanzamiento opcionales y repetibles. Retirar un paquete de la oferta no impide acreditar un pago anterior.
6. Test de capacidad reproducible, plantilla de configuración, preflight sin secretos y material comercial.

No se habilitaron pagos, no se movieron cuentas, no se cambió producción y no se enviaron publicaciones a personas.

## Lo que tiene que aportar el dueño

| Dato o acceso | Dónde cargarlo | Para qué |
|---|---|---|
| Acceso al despliegue que atiende fondalstudios.com y su almacenamiento | Conexión del proveedor o sesión autorizada de administración | Inspeccionar volumen, hacer respaldo y desplegar esta versión |
| Cuenta vendedora de Mercado Pago verificada | Mercado Pago → Developers → Tus integraciones → Checkout Pro | Recibir los cobros |
| Access Token, secreto de Webhooks y ID del vendedor | Variables SECRETAS del backend: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_COLLECTOR_ID` | Autenticar cobros y notificaciones; no ponerlos en Git ni en el frontend |
| Secreto aleatorio de órdenes de al menos 32 caracteres | `PAYMENTS_ORDER_SECRET`, generado en el servidor y respaldado como secreto | Firmar referencias; no rotarlo mientras existan pagos pendientes sin un plan de compatibilidad |
| Precio final o cotización ARS aprobada | `MP_ARS_PER_USD` | Calcular el importe visible y cobrado |
| Nombre/razón social del vendedor, CUIT, contacto de soporte y datos de facturación | Textos legales y configuración del negocio | Identificar al responsable y gestionar comprobantes/reclamos |
| Confirmación de licencias de arte, música y personajes | Registro privado de derechos | Publicar solo contenido autorizado |

No hace falta que el dueño invente productos: los dos SKU ya están preparados. Las preferencias de Checkout Pro se crean desde el backend. Los datos fiscales y bancarios se cargan en el proveedor, no en este documento público.

## Secuencia para habilitar ventas

1. Identificar el servidor real. Respaldar cuentas, guardados, wallet, ledger y estado de administración; probar restauración en una instancia aislada. No sobrescribir el origen.
2. Verificar persistencia real y backup periódico. Si se migra a Postgres, preparar importación que preserve IDs, saldos y referencias; no basta con añadir DATABASE_URL porque arrancaría una base distinta.
3. Resolver contenido de terceros y revisar una primera partida completa en iPhone y escritorio, compra de una apariencia, equipamiento y reingreso.
4. Aprobar vendedor, soporte, términos, privacidad y procedimiento de reembolso con asesoramiento local cuando corresponda. No copiar una promesa de “sin reembolsos”. Preparar recuperación de cuenta con verificación de titularidad, sin pedir contraseña por chat.
5. Configurar entorno de prueba con `MP_LIVE_MODE=false`. Evento Webhook: Pagos. URL prevista `https://fondalstudios.com/la-horda/red/api/payments/webhook`; verificar que el proxy preserve query y cabeceras `x-signature` y `x-request-id`.
6. Prueba oficial: aprobado, pendiente→aprobado, rechazado, reintento, recarga, reinicio y reingreso. El retorno del navegador nunca se usa como comprobante.
7. Reembolso y contracargo: **actualización:** el servidor ya revierte las Brasas de un pago reembolsado en su totalidad o con contracargo (una sola vez, anotando en el libro lo que no se pudo recuperar si ya se gastó); la devolución parcial y las skins ya compradas siguen siendo manuales. Ver `docs/commercial/MERCADO_PAGO_PASO_A_PASO.md`. Texto original: el código no revertía automáticamente Brasas ya gastadas. Para el piloto, dejar un procedimiento operativo verificado: localizar el pago, revisar su ledger, procesar devolución en Mercado Pago y ajustar/bloquear mediante administración con auditoría; no abrir venta masiva hasta cerrar reconciliación automática y prueba de devolución. No interpretar un webhook ignorado como devolución resuelta.
8. Ejecutar `node tools/net-test/capacity.js` local y la prueba pública desde una red compatible, primero 2, luego 10 y finalmente 50 conexiones. Las salas son privadas y se eliminan al terminar. Para afirmar capacidad sostenida, añadir soak prolongado con snapshots reales, CPU/RAM, ancho de banda y tráfico de cuentas.
9. Desplegar commit aprobado en staging, guardar versión anterior y verificar URL del juego + API + WebSocket. Activar producción con secretos reales, `MP_LIVE_MODE=true` y shortlist; ejecutar preflight. Hacer una compra real pequeña autorizada y su reembolso con compradores de prueba válidos.
10. OK final del dueño sobre versión, oferta y gastos. Publicar la página/tienda y anuncios preparados. Vigilar cada compra del piloto. Si falla entrega, cerrar nuevos checkouts manteniendo recepción/reconciliación de pagos pendientes; no apagar el webhook sin un plan.

## Web ahora; tiendas después

Ya existe `manifest.webmanifest` con iconos y orientación horizontal. Esto no demuestra una publicación nativa ni funcionamiento offline. Validar “Añadir a inicio” en el iPhone antes de anunciarlo como instalable.

App Store: cuenta Apple Developer, compilación y firma, ficha, capturas, privacidad, revisión y compras digitales ajustadas a la región. Google Play: cuenta, firma/AAB, ficha, clasificación, privacidad y requisitos de prueba aplicables. Las cuentas personales nuevas pueden exigir 12 testers durante 14 días. No prometer disponibilidad mañana en esas tiendas.

Fuentes verificadas: https://developer.apple.com/app-store/review/guidelines/la/ ; https://support.google.com/googleplay/android-developer/answer/14151465 ; https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/payment-notifications

## Métricas y criterio de expansión

Contar visitas, inicio de partida, primera partida terminada, apertura de tienda, checkout, pago aprobado, entrega y reembolso. Medir ventas desde el ledger del backend, no desde el botón ni la URL de retorno. No se añadió un sistema analítico nuevo en esta rama. Para el primer piloto, revisar manualmente pagos y ledger; después instrumentar el embudo con consentimiento y retención de datos definidos.

La primera meta operativa es una compra real entregada y recuperable, luego diez compradores sin incidencias de entrega. Es un criterio de validación, no una previsión de ventas.
