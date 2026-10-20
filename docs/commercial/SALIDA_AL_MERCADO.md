# Cómo salir al mercado con La Horda

Para el dueño. Fecha de redacción: 20 de octubre de 2026.

**Cómo leer este documento.** Cada afirmación está marcada:
- **HECHO** = sale de un archivo o de una prueba de este repositorio (se cita dónde).
- **ESTIMACIÓN** = cálculo o rango razonable con supuestos a la vista; no es un dato.
- **SUPUESTO** = una hipótesis que hay que comprobar con jugadores reales.

**No hay ni un dato de jugadores reales en el repo** (HECHO: `docs/game-direction/AUDITORIA_2_CRECIMIENTO.md`; el informe de críticos lo repite). Todo número de audiencia o ingresos de abajo es ESTIMACIÓN o SUPUESTO. Lo legal no es asesoramiento jurídico: hay que validarlo con abogado y contador.

---

## 1. La recomendación en una página

**Salí con la web propia primero, cobrando con Mercado Pago, vendiendo solo apariencias (Brasas), en Argentina y el mundo hispano, con una alfa cerrada que se abre de a poco. Las tiendas de apps (App Store / Google Play) vienen después.**

Por qué (HECHOS del repo):
1. **El modelo de negocio ya es sano y no se toca**: Brasas solo compran apariencia; los campeones se compran con oro jugando; sin cajas sorpresa ni gacha; el precio se ve antes de pagar y lo decide el servidor (`docs/economy/PRECIOS.md`, `server/wallet.js`). Es la ventaja legal y de reputación del juego.
2. **El juego corre en el navegador** y ya hay una página pública (`https://fondalstudios.com/la-horda/jugar/`) y manifiesto PWA (`docs/commercial/LAUNCH.md`). Cobrar en la web **no paga comisión de tienda**.
3. **El cobro con Mercado Pago ya está programado y probado con un Mercado Pago falso** (webhook firmado, acreditación una sola vez, reembolso y contracargo que revierten). Falta TU cuenta y TUS credenciales: `docs/commercial/MERCADO_PAGO_PASO_A_PASO.md`.
4. **El informe de críticos** (`docs/critic/MONETIZACION_MANTENER_Y_SACAR.md`, en la rama `origin/claude/critica-monetizacion`) puntúa la comercialización de hoy en **3,5/10** y el potencial como F2P cosmético de nicho en **6,5/10**. El problema no es el catálogo (82 apariencias vendibles, 43 campeones): es **poder cobrar de forma segura, medir qué hace la gente y mostrar mejor lo que ya hay**.

La realidad que hay que aceptar (ESTIMACIÓN del propio informe): sin ballenas ni gacha, un ARPG casual de nicho rara vez sostiene un estudio por sí solo; sirve como **ingreso complementario**. Con 1.000 jugadores activos al mes el informe estima US$ 60 a 600 brutos por mes; con 10.000, US$ 600 a 6.000 (base ≈ 2.500). Son supuestos (1 a 4% de conversión, gasto de US$ 6 a 15 por pagador), no mediciones. **El techo lo pone la audiencia**, no el catálogo.

---

## 2. Qué debe estar listo ANTES de cobrar el primer peso

Orden de importancia. Mientras uno de estos falte, `MP_ENABLED` queda en `0`.

| # | Requisito | Estado hoy | Quién |
|---|---|---|---|
| 1 | **Base de datos que no se borre.** | HECHO: el servidor público reportó `store:file, persistent:false` (`LAUNCH.md`) y **la base gratuita de Postgres vence el 28/10/2026** (`INDEPENDENT_HOSTING.md`; reutilizarla no reinicia el vencimiento). El servidor **se niega a cobrar** sin almacenamiento persistente. | Vos: contratar Postgres de pago o un volumen respaldado, probar backup y restauración (`docs/ACCOUNTS_DEPLOY.md`) |
| 2 | **Cuenta de Mercado Pago y credenciales** | Falta | Vos |
| 3 | **Política de privacidad, Términos y Reembolsos publicados** | Hay **borradores** en `docs/legal/` (no son válidos hasta que un abogado los revise) | Vos + abogado |
| 4 | **Soporte**: un correo real y una persona que conteste | HECHO: falta ("Falta insertar un canal de soporte confirmado", `MARKETING.md`) | Vos |
| 5 | **Impuestos y facturación** | Falta | Contador |
| 6 | **Probar una compra real y su devolución** | Falta | Vos |
| 7 | **Cerrar la fuga del oro en skins de autor** | HECHO (informe de críticos): las skins también se compran con oro del guardado, que el jugador puede editar (`shopBuySkinGold`). Quien edite su guardado se lleva las 33 skins de autor gratis. No se tocó en esta rama. | Desarrollo (acción #2 del informe) |
| 8 | **Revisión de derechos** de arte, música y personajes | HECHO: pendiente de revisión humana (`LAUNCH.md`, `APP_STORE.md`) | Vos |
| 9 | **Moderación del chat** (lista de palabras, reportar, bloquear) | HECHO (informe): chat libre de 120 caracteres con lista vacía por defecto. Hay menores jugando. | Desarrollo |

Un detalle de producto que el informe marca y que **vos decidiste dejar como está**: los packs de lanzamiento (USD 2,99 por 1.200 Brasas y USD 5,99 por 2.800) dan mucho más valor por dólar que la escalera normal (100 a 130 Brasas por dólar). El informe lo ve como riesgo de percepción ("después todo parece caro"). Dejé los packs sin cambios y sin límite de una vez por cuenta (el repo solo tiene ese campo para el Pack de bienvenida). Si más adelante querés limitarlo, hay que programarlo.

Otro dato: **el pack de bienvenida** (USD 6,99, 3 campeones de regalo) no está en la oferta de lanzamiento (`PAYMENTS_PACK_IDS=brasas_inicio,brasas_coleccion`) porque abrir dos checkouts antes del primer pago podía cobrar dos veces y entregar una (HECHO: `LAUNCH.md`).

---

## 3. Calendario relativo (semana 0 a 12)

Las duraciones son ESTIMACIONES para una o dos personas; los plazos de abogados, contadores y Mercado Pago no los controlás vos.

| Semana | Qué se hace | Salida (cómo sabés que terminó) |
|---|---|---|
| **0** (antes del 28/10/2026) | Resolver la base de datos: Postgres pago o volumen. Backup + restauración probados. Crear la cuenta de vendedor en Mercado Pago y la aplicación. Escribir al abogado y al contador. | `api/health` dice `persistent:true`. Aplicación creada. |
| **1-2** | Sandbox completo (guía paso a paso, sección 7). Revisar y adaptar los borradores de `docs/legal/` con el abogado. Definir correo de soporte. | Lista de pruebas sandbox marcada; textos legales aprobados. |
| **2-3** | Alfa **cerrada**: 20 a 50 personas que conocés (SUPUESTO de tamaño), **sin cobrar**. Medir D1/D7, dónde abandonan, errores. | Informe propio de retención y problemas. |
| **3-4** | Producción en Mercado Pago, compra real chica + devolución. Corregir lo que falló en la alfa. Cerrar la fuga del oro y la moderación del chat. | Una compra real entregada y revertible. |
| **4-6** | Alfa **abierta con cobro**: link público en tus canales (sin gastar en anuncios). Vigilar cada compra. | Primeras compras reales; 10 compradores sin incidencias de entrega (criterio de `LAUNCH.md`). |
| **6-8** | Si las métricas pasan los umbrales (sección 6): demo gratuita en itch.io/GameJolt, trailer corto, primer contacto con creadores chicos. | Tráfico nuevo medible por fuente. |
| **8-10** | Telemetría de embudo (tienda abierta, checkout, pago), vitrina semanal y preview de skins. Ajustar precios según datos. | Embudo medible de punta a punta. |
| **10-12** | Decisión: seguir creciendo en web, invertir en anuncios, o preparar app para tiendas. | Decisión escrita con los números. |

No hay que forzar las 12 semanas: si en la semana 4 las métricas no pasan, **no sigas con el calendario**, arreglá el juego.

---

## 4. Mercado inicial

- **Primero Argentina** (SUPUESTO razonable): hablás el idioma, Mercado Pago es el medio natural, los textos legales son los que conocés y podés dar soporte en tu horario. HECHO: la tienda ya cobra en pesos y el juego está en español.
- **Después LatAm hispano** (Chile, México, Uruguay, Colombia...). Mercado Pago opera en varios países, pero **cada país tiene su propia aplicación, moneda, impuestos y reglas**: no asumas que la misma cuenta cobra en todos (verificar con Mercado Pago). El código hoy cobra en pesos argentinos (`currency_id: "ARS"`); otro país exige trabajo nuevo.
- **Riesgo de precio en Argentina** (ESTIMACIÓN del informe): una skin de autor a 1.200 Brasas cuesta bastante en pesos para el público local. El informe recomienda una prueba de precio en vez de decidir por intuición. **El dólar se mueve**: revisá `MP_ARS_PER_USD` seguido.
- Inglés y mercado global: no ahora. El informe sugiere hispanohablante primero.

## 5. Canales (ordenados por costo)

Todos son SUPUESTOS de efectividad; el repo no tiene datos. Probalos de a uno y mirá de dónde vienen los que juegan y los que pagan.

1. **Tu web (fondalstudios.com)**: tu base. Ficha corta, el link para jugar sin registrarse, trailer vertical de 15 s (guion en `docs/commercial/MARKETING.md`). Costo: tu tiempo.
2. **Demo gratuita en itch.io** (y quizá GameJolt): sirve para descubrimiento y para recibir comentarios. Es una página que lleva a tu juego; **no vendas allí Brasas** (cobrás en tu propio sitio). Revisá las reglas de cada plataforma sobre enlaces externos y pagos antes de publicar (verificar).
3. **Comunidades**: Discord y subreddits de ARPG, pixel art y juegos indie en español; TikTok / YouTube Shorts con clips reales (no con arte conceptual). Respetá las reglas de cada comunidad sobre autopromoción (muchas la limitan): participá antes de publicar.
4. **Creadores chicos**: streamers y youtubers pequeños de ARPG/indie en español. Dales acceso y skins gratis para que muestren el juego; que el contenido diga que es una colaboración si corresponde. No hay presupuesto de anuncios hasta tener métricas (ver `MARKETING.md`).
5. **Invitar amigos**: el multijugador cooperativo de 4 es tu mejor motor de boca en boca; el informe propone un link de invitación y regalos entre cuentas (no existen todavía).
6. **Anuncios pagos**: solo después de que D1/D7 y la conversión pasen los umbrales. Antes es tirar plata.

**Cold start** (HECHO: informe de críticos y `AUDITORIA_Y_ROADMAP.md`): con pocos jugadores conectados el juego se siente vacío; ya existe ⚡ JUGAR YA con bots con nombre, que ayuda. Organizá **horarios de juego** (ej. "sábados 21 h") para concentrar gente.

## 6. Qué medir y cuándo decidir

**Hoy el repo no mide el embudo**: hay telemetría opcional y anónima de eventos (`js/net/alpha-services.js`, con opción de apagarla) pero el informe indica que no se emiten eventos como `champion_selected` y que falta la medición de tienda/checkout. Las ventas sí se miden bien desde el libro del servidor (`purchase:` en el libro de Brasas), no desde la URL de retorno.

| Métrica | Qué es | Cómo se mide hoy | Umbral para decidir (SUPUESTO orientativo, ajustalo con tus datos) |
|---|---|---|---|
| **D1** | % que vuelve al día siguiente de su primera partida | Hay que armarla (fechas de login/cuenta) | < 15%: arreglá el onboarding antes de promocionar. 25% o más: bueno para un indie casual. |
| **D7** | % que vuelve a la semana | idem | < 5%: no escales. 8 a 10% o más: hay un juego que retiene. |
| **Conversión a pagador** | pagadores / jugadores activos del mes | Libro de Brasas (compras) / cuentas activas | < 1%: revisá oferta y precio. Alrededor de 2 a 3%: plausible. |
| **ARPPU** | ingreso por pagador | Libro de compras | Si es menor que lo que te cuesta cobrar (comisión + impuestos), la oferta no cierra. |
| **Tasa de reembolsos/contracargos** | devoluciones / pagos | Mercado Pago + libro | Cualquier racha seguida: apagá y revisá. |
| **Tiempo hasta la primera partida terminada** | fricción de entrada | Telemetría opcional | Si la mayoría no llega a terminar una partida, la tienda no importa todavía. |

Los umbrales son reglas generales de la industria F2P citadas de memoria como **SUPUESTOS** (no los tomo de ningún dato de este repo): úsalos para empezar a decidir y reemplazalos por lo que midas en tu alfa.

**Regla de decisión sugerida:** no gastes plata en publicidad hasta que D1 y D7 pasen su umbral y haya al menos una decena de compras reales sin incidencias.

## 7. Plan de alfa: cerrada, abierta, lanzamiento

1. **Cerrada (sin cobro).** Invitás a gente que aceptó participar. Objetivo: encontrar roturas y mirar D1. Todo el tráfico entra con tu enlace. Nada de dinero. Usá `MP_ENABLED=0`.
2. **Cerrada con cobro de prueba.** Quienes quieran, hacen una compra real chica (con sandbox primero). Objetivo: comprobar entrega y devolución reales.
3. **Abierta con cobro.** Cualquiera entra por link. Hasta 2 a 3 semanas de vigilancia manual de cada compra.
4. **Lanzamiento.** Cuando D1/D7, conversión y operación (soporte, devoluciones) pasen sus umbrales. Con demo en itch.io, trailer y contacto a creadores.
5. **Después:** app instalable (PWA) y, más adelante, tiendas (ver sección 10).

El juego se publica como **alfa** de Fondal Studios hasta que las métricas digan otra cosa: es honesto con el público y con las tiendas.

## 8. Costos de infraestructura (ESTIMACIÓN, sin cifras inventadas)

No hay precios en el repo y los planes cambian: **verificá los vigentes** antes de decidir. Lo que sí es un hecho del repo:
- La base de datos gratuita de Render vence el 28/10/2026 (`INDEPENDENT_HOSTING.md`). Los servicios gratis duermen por inactividad y comparten horas; **no son una promesa de 24/7** (mismo documento).
- El relay se probó en local con 50 conexiones sintéticas, 13 salas, 60 s, 0 errores (`LAUNCH.md`, `capacity-local.json`). No equivale a la capacidad del servidor público ni a la carga de cuentas.
- La página y el relay corren hoy en Fly.io (fondalstudios.com) y, de forma independiente, en Render (`INDEPENDENT_HOSTING.md`).

Qué componentes se pagan (los montos no están acá a propósito):
1. **Base de datos Postgres con respaldo** (el costo ineludible para cobrar).
2. **Servidor del relay y de las cuentas** (siempre encendido; el plan gratis duerme).
3. **Dominio** (ya tenés fondalstudios.com).
4. **Comisión de Mercado Pago** (por cobro) e **impuestos**: no son infraestructura pero hay que descontarlos de cada venta.
5. **Correo de soporte** (puede ser gratis si usás tu dominio con un proveedor).
6. **Tiendas** (si se publican): cuenta de desarrollador de Apple y de Google (cuotas) y comisión por cada compra digital (verificar el programa de pequeños desarrolladores vigente).

Regla práctica: calculá el costo mensual fijo real y comparalo con el ingreso neto de tu escenario *conservador* (informe: US$ 60 por mes con 1.000 jugadores). Si el fijo supera eso, el juego es un hobby con costo hasta que la audiencia crezca; decidilo conscientemente.

## 9. Riesgos

| Riesgo | Detalle | Qué hacer |
|---|---|---|
| **Legal** | Sin privacidad, términos y reembolsos publicados no hay cobro legítimo. Argentina tiene reglas de defensa del consumidor (Ley 24.240, derecho de arrepentimiento en compras a distancia) y de datos personales (Ley 25.326). Lo digital tiene matices. **Verificar con abogado.** | Plantillas en `docs/legal/` (borrador); abogado antes de cobrar. |
| **Contracargos** | Un contracargo con Brasas ya gastadas es pérdida. El servidor descuenta lo que queda y anota el faltante. | Documentación en `MERCADO_PAGO_PASO_A_PASO.md` sección 12. Empezá con packs chicos. |
| **Menores de edad** | Hay chicos que juegan, y pueden usar la tarjeta de un adulto. | Edad mínima y autorización de un adulto en los términos; sin ofertas dirigidas a menores ni compras de un toque (`PRECIOS.md` §1.6); soporte ágil para devoluciones por compras no autorizadas. Verificar con abogado. |
| **Fuga del oro** | Skins de autor compradas con oro editable. | Acción #2 del informe de críticos. |
| **Datos** | Cuentas y Brasas viven en la base. Perderla es perder saldos de gente que pagó. | Backup probado; no cobrar sin base persistente. |
| **Cold start** | Poca gente conectada. | Bots con nombre, horarios de juego, comunidad. |
| **Calidad percibida** | El informe marca audio sintetizado, resoluciones de arte mezcladas, subjefes con animaciones clonadas. | No lanzar los 4 atlas candidatos con defectos; no cobrar precio premium por arte con defectos. |
| **Derechos** | Arte, música y personajes sin registro de derechos. | Revisión humana antes de vender. |
| **Fraude / cuentas** | El guardado del cliente es editable; no se puede prometer antifraude completo. | No lo prometas en el marketing. |
| **Verificación de cuenta** | Hoy "cuenta verificada" = sesión + correo cargado, **sin** confirmación por mail. | Agregar un mail de confirmación antes de escalar. |
| **Disponibilidad** | Servicios gratis duermen. | Plan pago antes del lanzamiento. |
| **Tipo de cambio** | Precios fijados en USD, cobro en ARS. | Revisar `MP_ARS_PER_USD`; el servidor pide reconfirmar si cambia. |

## 10. Después de la web: tiendas

(HECHO: `docs/commercial/APP_STORE.md` y `LAUNCH.md`) La app de tiendas es **segunda etapa**. Apple y Google tienen reglas propias para compras digitales dentro de la app (generalmente exigen su sistema de pago y cobran comisión; verificar políticas vigentes), contenido de usuarios (el chat necesita moderación), privacidad y clasificación por edad. Las cuentas personales nuevas de Google pueden exigir un período de pruebas con testers (`LAUNCH.md`). No prometas fecha ni disponibilidad.

## 11. Qué NO hacer

1. **No vender poder**: campeones por Brasas, talentos, equipo, piezas de set, ventajas en Cristales/Coliseo (`PRECIOS.md` §5; informe).
2. **No cajas sorpresa / gacha**, ni siquiera cosméticas: riesgo regulatorio y de reputación.
3. **No vender oro por dinero real.**
4. **No temporizadores falsos, "últimas unidades" inventadas ni precios tachados inflados.**
5. **No prometer lo que no medís**: "50 jugadores en una sala", "antifraude", disponibilidad en tiendas, ingresos.
6. **No cobrar sobre una base que se va a borrar** (28/10/2026).
7. **No pegar credenciales** en chats, capturas o el repo.
8. **No gastar en anuncios** antes de que D1/D7 y las primeras compras reales pasen los umbrales.
9. **No lanzar skins nuevas** hasta saber qué se compra (informe).
10. **No copiar un "no hay reembolsos"** de otro sitio: en Argentina hay derechos del consumidor que no se pueden anular con un cartel. Consultá al abogado.
11. **No ofrecer la tienda antes de la primera victoria** del jugador (recomendación del informe).
12. **No apagar el webhook** mientras haya pagos pendientes.

## 12. Tu próxima semana (si querés una lista corta)

1. Resolver la base de datos antes del 28/10/2026.
2. Crear la aplicación en Mercado Pago y probar en sandbox con `docs/commercial/MERCADO_PAGO_PASO_A_PASO.md`.
3. Mandar `docs/legal/` a un abogado.
4. Definir el correo de soporte.
5. Armar la lista de las primeras 20 a 50 personas para la alfa cerrada.
