# Mercado Pago, paso a paso (para el dueño, sin saber programar)

Esta guía te lleva de "cero" a "la tienda de La Horda cobra con Mercado Pago". El código ya está listo y **viene apagado**: no se cobra nada hasta que vos cargues TUS credenciales en el servidor y prendas el interruptor.

> **Reglas de oro**
> 1. Las credenciales (Access Token, Clave secreta, etc.) **no se pegan en el repo, ni en un chat, ni en una captura**. Solo en el panel del servidor de Fondal (variables de entorno).
> 2. Primero **todo en modo prueba (sandbox)**. Recién cuando todo anda, se pasa a producción.
> 3. Hay un botón de emergencia: `MP_ENABLED=0` apaga la tienda al instante (ver sección 11).

**Qué dice esta guía y qué no.** Lo que se refiere a *nuestro* código está comprobado en este repositorio (con tests y un ensayo local con un Mercado Pago falso). Lo que se refiere a *las pantallas de Mercado Pago* está escrito de memoria de cómo suelen verse: **Mercado Pago cambia sus menús y nombres seguido**. Si una pantalla no coincide, buscá la opción equivalente en https://www.mercadopago.com.ar/developers y en su documentación de Checkout Pro. Todo lo marcado **(verificar)** hay que confirmarlo en pantalla antes de seguir.

---

## 0. Cómo funciona (en 6 líneas)

1. El jugador toca **Comprar** en la tienda de Brasas. El juego le avisa al **servidor** qué pack quiere. El precio **lo decide el servidor**, nunca el celular del jugador.
2. El servidor le pide a Mercado Pago un "link de pago" (una *preferencia* de Checkout Pro) y se lo manda al jugador.
3. El jugador paga en la página de Mercado Pago (tarjeta, dinero en cuenta, etc.).
4. Mercado Pago le avisa al servidor con un **webhook** (un aviso automático) a la dirección `.../api/payments/webhook`.
5. El servidor **no confía en el aviso**: verifica la firma, le pregunta a Mercado Pago "¿este pago existe y está aprobado?", comprueba que sea tu cuenta, el monto y el pack, y recién ahí acredita las Brasas, **una sola vez** aunque el aviso llegue repetido.
6. Si después hay un reembolso o contracargo, el aviso llega de nuevo y el servidor **descuenta esas Brasas** (queda anotado en el libro de la cuenta).

La página a la que vuelve el jugador después de pagar **no acredita nada**: acredita solo el webhook.

---

## 1. Antes de empezar: qué necesitás tener

- [ ] Una cuenta de Mercado Pago **de vendedor** (de la persona o empresa que va a cobrar), con identidad validada. Los cobros van a *esa* cuenta.
- [ ] Acceso al panel del servidor donde corre el juego en fondalstudios.com (para cargar variables de entorno y reiniciar).
- [ ] **Base de datos que no se borre.** Sin esto el servidor **se niega a cobrar** (a propósito). Ver `docs/commercial/SALIDA_AL_MERCADO.md`, sección "Antes de cobrar", y `docs/ACCOUNTS_DEPLOY.md`.
- [ ] Un correo de soporte y los textos legales publicados (`docs/legal/`, son borradores: revisalos con un abogado).
- [ ] Decidir una **cotización**: el juego fija los precios en dólares y Mercado Pago cobra en pesos. Vos elegís cuántos pesos vale cada dólar (`MP_ARS_PER_USD`) y la revisás cada tanto.

Los packs y precios **quedan como están** (decisión tuya): `server/premium-packs.json`. En la oferta de lanzamiento se venden "Primer diseño" (USD 2,99) y "Tu colección" (USD 5,99).

---

## 2. Crear la aplicación en Mercado Pago Developers

1. Entrá a **https://www.mercadopago.com.ar/developers** con la cuenta vendedora.
2. Arriba a la derecha: **Tus integraciones** (verificar el nombre). Tocá **Crear aplicación**.
3. Completá:
   - **Nombre de la aplicación**: `La Horda`.
   - **Producto / solución**: elegí **Checkout Pro** ("pagos online", "redirige al comprador a Mercado Pago") (verificar).
   - **¿Usás una plataforma de e-commerce?** No.
   - Aceptá los términos y tocá **Crear aplicación**.
4. Vas a ver la aplicación con un **número de aplicación** y el menú: *Credenciales de prueba*, *Credenciales de producción*, *Webhooks*, *Cuentas de prueba*, etc. (verificar nombres).

## 3. Crear usuarios de prueba (para probar sin plata real)

Mercado Pago no deja pagar con la misma cuenta que vende. Para probar necesitás **dos usuarios de prueba**: un *vendedor de prueba* y un *comprador de prueba*.

1. En el panel de la aplicación: **Cuentas de prueba** (verificar) → **Crear cuenta de prueba**.
2. Creá una de tipo **Vendedor** (país Argentina) y otra de tipo **Comprador**. Anotá usuario y contraseña de cada una (en un lugar privado; son de mentira pero igual no las compartas).
3. Importante: las credenciales de prueba pertenecen al **vendedor de prueba**. Cuando uses sandbox, el "ID de vendedor" (Collector ID) que cargues es el del *vendedor de prueba*, no el de tu cuenta real.

## 4. Copiar las credenciales de PRUEBA

En la aplicación → **Credenciales de prueba** (verificar):

| Mercado Pago lo llama | Se carga en el servidor como | Para qué |
|---|---|---|
| **Access Token** de prueba | `MP_ACCESS_TOKEN` | Crear pagos y consultarlos. **Secreto.** |
| **Public Key** de prueba | `MP_PUBLIC_KEY` | Hoy el código no la usa (Checkout Pro redirige). Guardala por si más adelante se usa. |
| **Número de usuario / ID del vendedor** | `MP_COLLECTOR_ID` | El servidor rechaza pagos que no sean de esta cuenta. Solo dígitos. |

Y vas a generar tú dos secretos más:

| Variable | Qué poner |
|---|---|
| `PAYMENTS_ORDER_SECRET` | Una clave larga inventada por vos: en una terminal, `openssl rand -hex 32`. Sirve para firmar cada pedido. **No la cambies** mientras haya pagos pendientes. |
| `MP_WEBHOOK_SECRET` | La **Clave secreta** que te da Mercado Pago al configurar el webhook (paso 6). |

## 5. Cargar las variables en el servidor de Fondal

Se cargan en el **panel del servidor** (o el archivo `.env` del servidor, que **no** está en el repo). La lista completa y comentada está en `server/launch.env.example` (es una plantilla, sin valores reales).

Para **probar** (sandbox):

```
MP_ENABLED=0                  <- todavía apagado
PAYMENTS_PROVIDER=mercadopago
MP_MODE=sandbox
MP_ACCESS_TOKEN=(token de PRUEBA)
MP_PUBLIC_KEY=(public key de PRUEBA)
MP_COLLECTOR_ID=(id del vendedor de PRUEBA)
MP_WEBHOOK_SECRET=(clave secreta del webhook, paso 6)
PAYMENTS_ORDER_SECRET=(la que generaste)
MP_ARS_PER_USD=1200           <- tu cotización
PAYMENTS_NOTIFY_URL=https://fondalstudios.com/la-horda/red/api/payments/webhook
PAYMENTS_SUCCESS_URL=https://fondalstudios.com/la-horda/jugar/
PAYMENTS_PACK_IDS=brasas_inicio,brasas_coleccion
DATABASE_URL=(la base persistente)    <- o DATA_DIR + DATA_PERSISTENT=1 con un volumen verificado
```

Reiniciá el servidor. Después, **en el servidor**, corré:

```
node tools/release/mp-readiness.js
```

Te dice, con `[ok]` / `[FALTA]`, qué falta cargar (sin mostrar nunca los valores secretos) y hace un ensayo con un Mercado Pago de mentira. Repetilo hasta que no diga `[FALTA]`.

## 6. Configurar el webhook

1. En la aplicación → **Webhooks** (verificar) → **Configurar notificaciones**.
2. **URL para modo de pruebas**: `https://fondalstudios.com/la-horda/red/api/payments/webhook`. (La misma que pusiste en `PAYMENTS_NOTIFY_URL`.)
3. **Eventos**: tildá **Pagos** (`payment`). Si hay una opción de **Contracargos / Reclamos**, tildala también (el servidor igual se entera por el cambio de estado del pago, pero así te llega el aviso).
4. Guardá. Mercado Pago muestra una **Clave secreta** (una cadena larga). Copiala y cargala en el servidor como `MP_WEBHOOK_SECRET`. Reiniciá.
5. Repetí lo mismo cuando pases a producción (la URL de producción se carga por separado y la clave secreta puede ser distinta).

Qué comprobar con quien administra el servidor: que el proxy de fondalstudios.com **deje pasar** la query (`?data.id=...`) y las cabeceras `x-signature` y `x-request-id` hacia el servidor del juego. Si las filtra, todos los avisos se rechazan.

## 7. Probar en sandbox (nada de plata real)

1. Prendé el interruptor **solo para probar**: `MP_ENABLED=1` (con `MP_MODE=sandbox`). Reiniciá.
2. En una ventana de incógnito entrá al juego con una cuenta que **tenga un correo cargado** (el servidor lo exige para comprar) → Tienda → Brasas. Tiene que aparecer el botón **Comprar** (si dice "Muy pronto", mirá `mp-readiness.js`).
3. Tocá **Comprar** → **Ir a pagar**. Se abre Mercado Pago.
4. Pagá **con el comprador de prueba** (iniciá sesión con sus datos). Para tarjeta de prueba, Mercado Pago publica una lista (verificar en https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards): suele haber una Visa y una Mastercard de prueba, y el **nombre del titular** decide el resultado: `APRO` = aprobado, `OTHE` = rechazado, `CONT` = pendiente, `FUND` = fondos insuficientes (verificar). Documento de prueba que piden: el que indique esa misma página.
5. Volvé al juego. Esperá unos segundos y abrí la tienda: las Brasas tienen que estar y en el historial de la cuenta tiene que aparecer la compra.
6. Probá, uno por uno, y anotá el resultado:
   - [ ] Pago aprobado → Brasas acreditadas **una sola vez**.
   - [ ] Pago pendiente → no acredita; cuando pasa a aprobado, acredita.
   - [ ] Pago rechazado → no acredita.
   - [ ] Cerrar la ventana de pago sin pagar → no pasa nada.
   - [ ] Reintento del aviso (en el panel de Webhooks hay una opción de **simular/reenviar notificación**) → no acredita dos veces.
   - [ ] **Devolución** del pago de prueba (desde la actividad del vendedor de prueba, **Devolver**) → las Brasas se descuentan.
7. Si algo no anda, mirá el log del servidor: las líneas `WALLET_PURCHASE`, `PAYMENT_STATUS_REVIEW`, `WALLET_REVERSAL` cuentan qué pasó (sin datos de tarjeta; solo número de cuenta del juego e ID de pago).

## 8. Pasar a producción

Mercado Pago te pide "activar" la cuenta para cobrar de verdad (verificar el proceso actual):

1. En la aplicación → **Credenciales de producción** (verificar). Si dice que falta información, completá los **datos del negocio** (rubro, sitio web `fondalstudios.com`, etc.) y lo que te pidan para activar. A veces aparece una evaluación de calidad de la integración (en su documentación se llama *homologación* / *calidad de la integración*); si te la piden, seguí lo que indique.
2. Copiá el **Access Token de producción**, la **Public Key de producción** y tu **ID de usuario real**.
3. En **Webhooks**, configurá la **URL de producción** (la misma dirección) y copiá la **Clave secreta de producción**.
4. En el servidor cambiá: `MP_MODE=live`, `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_COLLECTOR_ID`, `MP_WEBHOOK_SECRET` (los de producción). `MP_ENABLED` sigue en `0` hasta terminar el checklist de la sección 10. Reiniciá.
5. Corré `node tools/release/mp-readiness.js --strict`. Tiene que decir que está todo completo.
6. **Compra real chica**: prendé `MP_ENABLED=1`, comprá vos mismo el pack más barato con tu propia tarjeta, comprobá que llegan las Brasas, y **devolvé** esa compra desde Mercado Pago para comprobar que se descuentan.

## 9. Comisiones y plata (decirlo con cautela)

- Mercado Pago **cobra una comisión por cada cobro**, y suele haber además costos de financiación (cuotas) y un **plazo de acreditación** (cuándo te queda disponible el dinero) que depende del medio de pago y de lo que elijas en tu cuenta. No fijo porcentajes acá porque **cambian**: confirmá los vigentes en https://www.mercadopago.com.ar/costs-section (verificar) o en la sección "Costos" de tu cuenta.
- A eso se suman **impuestos** (IVA, Ingresos Brutos, Ganancias, retenciones/percepciones). Hablá con un contador **antes** de cobrar: si vendés como persona física o empresa, cómo facturar, etc.
- Mercado Pago cobra en **pesos**. Si el dólar se mueve, tu precio en dólares real cambia: por eso `MP_ARS_PER_USD` es tuya y se actualiza a mano. El jugador siempre ve el importe en pesos antes de pagar, y si cambia el precio entre que miró y que confirmó, el servidor le pide confirmar de nuevo.

## 10. Checklist final: "antes de prender el interruptor"

Marcá todo. Si algo queda sin marcar, `MP_ENABLED` se queda en `0`.

- [ ] La base de datos es **persistente** y probaste un **backup y una restauración** (`https://fondalstudios.com/la-horda/red/api/health` dice `"persistent":true`). Si usás la base gratis de Render, **vence el 28/10/2026** (según `docs/commercial/INDEPENDENT_HOSTING.md`): no cobres sobre una base que se va a borrar.
- [ ] `node tools/release/mp-readiness.js --strict` sin `[FALTA]`, y el ensayo local en `ok`.
- [ ] Probaste en sandbox: aprobado, pendiente, rechazado, aviso repetido y devolución (sección 7).
- [ ] Credenciales de **producción** cargadas y `MP_MODE=live`; no quedó `MP_API_BASE` en el servidor.
- [ ] Hiciste una compra real chica y su devolución, y los dos movimientos aparecen en el libro de la cuenta.
- [ ] Política de privacidad, términos y política de reembolsos **publicados** (partí de `docs/legal/`, revisados por un abogado) y enlazados desde el juego.
- [ ] Correo de soporte activo y probado (hay que reemplazar el marcador en los textos de `docs/commercial/MARKETING.md`).
- [ ] Contador consultado (facturación e impuestos).
- [ ] Tenés a mano cómo **apagar** (sección 11) y quién lo hace.
- [ ] Hay un responsable que va a mirar **cada compra** de la primera semana.

Recién ahí: `MP_ENABLED=1` y reiniciar.

## 11. Apagado de emergencia

Si pasa algo raro (cobros duplicados, avisos sospechosos, un error de precio, el dólar se disparó):

1. En el panel del servidor poné **`MP_ENABLED=0`** y reiniciá.
2. Efecto inmediato: la tienda muestra **"Muy pronto"** y nadie puede iniciar un pago nuevo.
3. Lo que **ya se pagó** sigue funcionando: los avisos de Mercado Pago pendientes se siguen procesando. **No** borres el webhook mientras haya pagos pendientes.
4. Si es por la cotización, no hace falta apagar: cambiá `MP_ARS_PER_USD` y reiniciá (los pagos ya iniciados conservan el monto con el que se crearon).

## 12. Ver pagos, devoluciones y contracargos

**Ver pagos.** En Mercado Pago: **Actividad / Tus cobros** (verificar). Cada pago tiene un número (ese número es el ID que aparece en el juego como `mp<número>` en el historial de la cuenta del jugador).

**Un jugador dice "pagué y no tengo las Brasas".** Pedile su usuario del juego y el número de operación. Buscá el pago en Mercado Pago: si está **aprobado**, mirá el historial de la cuenta en el panel de administración del juego; si el pago está aprobado y no aparece, revisá `mp-readiness.js`, el log y que el webhook esté llegando (panel de Webhooks de Mercado Pago muestra los intentos y respuestas). Si está **pendiente**, es normal que todavía no haya Brasas.

**Devolver una compra.** En Mercado Pago, abrí el cobro y tocá **Devolver** (devolución total). Mercado Pago avisa por webhook y el servidor descuenta las Brasas **de ese pago** una sola vez. Casos:
- Si el jugador **ya gastó** parte de las Brasas, se descuenta lo que le queda (nunca queda saldo negativo) y la diferencia queda anotada en el libro como `reversal_shortfall:<cantidad>`. Es tu decisión qué hacer (ver Game Master, abajo).
- Las skins ya compradas **no se quitan solas**. Si querés quitarlas, es una acción manual y auditada.
- Una **devolución parcial** no se procesa sola: el servidor la anota en el log (`PAYMENT_STATUS_REVIEW`, estado `partial_refund`) para que la revises. (Desde el código no se ofrecen devoluciones parciales.)
- El Pack de bienvenida entrega además 3 campeones de regalo: si lo devuelven, los campeones ya elegidos **no se revocan solos**; resolvelo a mano.

**Ajustes manuales.** El panel de administración del juego (Game Master, permiso `MODIFY_CURRENCY`) acredita o corrige saldos y queda en el libro y en la auditoría.

**Contracargo** (el titular de la tarjeta desconoce el pago ante su banco):
1. Mercado Pago te avisa (correo y panel; **verificar** en **Reclamos / Contracargos**) y tiene **plazos** para responder.
2. El pago pasa a estado `charged_back` y el servidor descuenta las Brasas igual que en un reembolso.
3. Subí la evidencia que te pidan: comprobante de entrega (el historial de la cuenta con la fecha en que se acreditaron las Brasas), usuario, correo, y la política de reembolsos publicada.
4. Si **ganás** el contracargo, Mercado Pago te devuelve el dinero pero el servidor **no re-acredita solo** las Brasas: devolvéselas a la cuenta desde el panel de administración.
5. Muchos contracargos seguidos de un mismo origen: apagá la tienda (sección 11) y revisá.

## 13. Seguridad: qué hace el servidor y qué NO hay que tocar

Comprobado con tests (`server/test-payments-mp.js` y `tools/release/mp-flow-test.js`):

- El precio lo decide el servidor; si el jugador "ve" otro precio, el servidor pide reconfirmar.
- Cada pedido lleva una `external_reference` firmada con cuenta, pack, monto y Brasas.
- El webhook sin firma válida (`x-signature`) se descarta **antes** de consultar a Mercado Pago.
- Se consulta el pago a la API de Mercado Pago con el token del servidor; se verifica vendedor, modo (prueba/real), moneda, monto exacto y pack.
- Idempotencia: un mismo pago se acredita una vez. Reembolso/contracargo se revierte una vez.
- Tope de intentos de pago por cuenta (8 cada 10 minutos) y tope de consultas a Mercado Pago por minuto.
- Para comprar, la cuenta tiene que tener sesión **y un correo cargado**. **Ojo:** el juego hoy **no verifica** que el correo sea del jugador (no manda un mail de confirmación). Es una exigencia mínima, no una verificación.
- Sin base de datos persistente, el servidor **no cobra**.

No pongas credenciales en el repo ni en los chats. Si una se filtró, **regenerala** en Mercado Pago (Credenciales → renovar) y actualizá el servidor.

## 14. Lo que NO se pudo verificar sin tus credenciales

Hasta que lo pruebes vos en sandbox y en producción, **no está comprobado**:
- Que la aplicación y las credenciales de tu cuenta funcionan con este código (el ensayo usa un Mercado Pago falso).
- Que el formato real de los avisos y de la firma coincide al 100% con lo que espera el servidor (el código sigue la documentación publicada, pero solo una prueba real lo confirma).
- Que el proxy de fondalstudios.com deja pasar los avisos.
- Comisiones, plazos y si tu cuenta necesita pasos extra de activación.
- Que una devolución real y un contracargo real llegan como el servidor espera.
- Cómo se ve el pago en el celular del jugador (apertura de la app de Mercado Pago, vuelta al juego).
- La base de datos de Postgres con el reverso (`server/test-postgres.js` necesita una base de prueba local).
