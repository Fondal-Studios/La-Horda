# Tienda de apariencias — auditoría y resultados (bloque 2)

## Economía real que existe (inventariada antes de tocar nada)
| Elemento | Hecho verificado en el código |
|---|---|
| Oro | Moneda del juego, vive en el guardado del cliente (editable). **No compra apariencias** (`PREMIUM_NO_GOLD_SKINS`, `shopBuySkinGold` inoperante). |
| Brasas ✦ | Moneda premium **validada por el servidor** (`/api/wallet`, `/api/wallet/buy` con referencia idempotente, verificación de precio, bloqueo `PREMIUM.busy`, reintento con la misma referencia). Compran apariencias (skins de colección, de autor, cromas) y colecciones; piezas de set solo si `PIECES_FOR_BRASAS`. |
| Paquetes de Brasas con dinero real | `premiumPaymentsOn()`: **el servidor dice si hay pasarela**; sin ella la Tienda muestra «Muy pronto», nunca una compra simulada. **No se conectó ni se tocó ningún proveedor de pago.** |
| Ahorro de colecciones | Calculado con los precios vigentes (`premiumCollection`: suma de sueltas vs. precio de colección). No hay descuentos fijos inventados ni contadores. |
| Vales de regalo | `_shopVoucherBtn`: otro camino de adquisición, sin costo. |
| Telemetría existente | Solo `skin` / `croma` al comprar (lista blanca del servidor `server/game-master.js` EVENTS). No hay eventos de apertura/vista/error. |

## Observado
| # | Sev. | Hallazgo |
|---|---|---|
| T1 | Alta | **Texto contradictorio sobre la moneda:** la pestaña Skins decía «Cada apariencia se paga con Brasas o con oro», pero el oro no las compra. Un jugador con oro creía poder pagar. |
| T2 | Alta | El botón de precio mostraba solo «✦ 800» (símbolo + número): la moneda dependía de un ícono. Las colecciones, «✦ 2.560». |
| T3 | Alta | Si no alcanzaba el saldo, el botón solo se **deshabilitaba**; el motivo estaba en un `title` (invisible en un celular). Sin sesión, tampoco había texto. |
| T4 | Media | La confirmación decía nombre y precio, pero no **para qué guardián**, qué tipo de apariencia, ni el saldo antes/después. |
| T5 | Media | En pantallas angostas (≤ 700 px) el **chip de Brasas desaparecía del encabezado** (`css/ui-kit.css:292` oculta todo chip que no sea oro): el dato que decide si se puede comprar no estaba. |
| T6 | Baja | No había forma de comparar la skin con la apariencia base en la vista previa. |

Lo que ya estaba bien y no se tocó: pestañas separadas (Destacados, Guardianes, Objetos, Skins, Brasas), vista previa animada real de la figura con la skin, estado «Desbloqueada/EQUIPADA/Comprada», botones separados de comprar y equipar, «Sets sin skin todavía (arte pendiente)» presentado como pendiente (no como disponible), cálculo de ahorro, flujo de compra autoritativo del servidor.

## Qué cambió (UC-SHOP v1: `js/ui-clarity/shop-clarity.js` + `css/ui-clarity/shop-clarity.css`)
* T1: corregida la frase en `js/ui/shop-ui.js` (único cambio en un archivo ajeno: 1 línea de texto).
* T2/T3: botón «✦ 800 Brasas» y, debajo, «Te faltan n Brasas · tenés m» / «Tenés m Brasas · te quedarían k» / «Entrá con tu cuenta para comprar con Brasas»; el botón sigue al saldo real (se bloquea/desbloquea sin redibujar). También en colecciones.
* T4: la confirmación agrega **Para**, **Tipo**, **Cambia: solo la apariencia**, **Tu saldo → después** (en colecciones, qué incluye y saldo).
* T5: el saldo de Brasas vuelve al encabezado en pantallas angostas.
* T6: «Ver original» / «Ver la skin» sobre la misma vista previa.
* Sugerencia no bloqueante: «Para tu guardián actual (Sylva): 1 apariencia sin comprar · Ver solo las de Sylva».
* Un solo diálogo de compra por artículo; eventos locales `uc:shop` {type,id} (open, view, buyStart, buyOk, buyError, cancel, compare) **sin datos de pago ni de cuenta**.

## Evidencia
| Qué | Resultado |
|---|---|
| `node tools/ui-clarity/test-shop-clarity.js` (servidor SIMULADO, flujo real del cliente) | 26 comprobaciones PASS: copia, precio/moneda, faltante visible, confirmación, cancelar sin pedidos, doble toque, respuesta lenta (no es tuya hasta la entrega, 1 solo cobro), error de servidor y corte de red (no se cobra, saldo intacto), recarga de página, ya comprado sin botón de compra, comparar, atrás/reabrir, sugerencia, `?uc=0` |
| Pruebas existentes de la economía de skins | `tools/items/t_skins_brasas.js`, `tools/collection/t_shop_rotation.js`, `t_starter_gift.js`, `test-touch-targets`, `test-text-overflow`, `emoji-lint`: PASS |
| Capturas antes/después | `evidence/tienda/ba_*.png` (844×390 y 568×320) |
| Revisor independiente (a ciegas) | 67 → **77** (confirmación 55 → 88, saldo/faltante 74 → 82, precio y moneda 66 → 80, sin presión 90 = 90) |

## Límites (explícitos)
* **No se probaron pagos reales ni el servidor real**: el servidor se simuló en la prueba; no hay pasarela conectada por esta rama.
* El revisor es un modelo mirando capturas fijas: **no mide comprensión de jugadores ni conversión**. Ninguna mejora de conversión se afirma. Medirla exige eventos en el servidor (propuesta abajo) y sesiones con jugadores.
* Señalado por el revisor y **pendiente**: en 568×320 el párrafo introductorio ocupa casi la mitad de la pantalla y las tarjetas quedan abajo; el faltante de las colecciones puede cortarse en el borde de la tarjeta; el botón «Cancelar» del diálogo tiene poco contraste; «solo apariencia» se repite 3 veces.
* No se vio en esta rama el efecto de los vales de regalo ni de la rotación diaria sobre estos textos.

## Propuesta de medición (requiere cambio de servidor, fuera de esta rama)
Agregar a la lista blanca `EVENTS` de `server/game-master.js` (propietario: paquete C, telemetría): `shop_open`, `shop_view`, `buy_start`, `buy_error`, `buy_cancel`, `equip`; y reenviar los `uc:shop` del cliente por `AlphaServices.emit` (ya filtra campos y respeta `horda_telemetry`). Con eso se podrá comparar abandono por etapa, errores y tiempo hasta equipar entre `?uc=0` y la versión nueva.

## Tareas breves para jugadores (sin resultados todavía)
1. «¿Cuánto cuesta esta skin, en qué moneda y para quién es?» (antes/después; tiempo y respuesta).
2. «Comprala» con saldo insuficiente: ¿entiende qué le falta y qué hacer?
3. «Mostrame cómo se ve sin la skin» (comparación).
