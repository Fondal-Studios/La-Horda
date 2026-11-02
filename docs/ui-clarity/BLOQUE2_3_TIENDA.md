# Bloques 0, 2 y 3 — fallos heredados, ficha de apariencia y compra segura (2026-11-02)

Rama `ui/clarity-shop-20261102` (desde `integration/beta-20261101`). No se reconstruyó #258 (UI Factory) ni #261 (UI Clarity bloque 1). No se tocó `js/rendering/*`, `js/arenas/micelial/*`, `js/audio/`, sprites/atlas/`assets/visual-packages/`, `js/systems/cosmetic-catalog.js` ni Mercado Pago (apagado).

## B0 · Fallos heredados de main: causa confirmada (sin tocar umbrales ni excluir pruebas)
| Prueba | Causa observada | Corrección |
|---|---|---|
| `tools/art/check-skill-icons.js` (43) | `css/ui-factory/hud-layout.css` (#258) dibujaba el ícono del Ataque a `2.1em` = 42 px; el contrato exige múltiplos de 16 | `48px` (3 × 16). Pasa. |
| `tools/lanes/flow.js` | Dos causas: (1) #258 bajó `.ln-recall` a 44 px (el contrato de lanes pide ≥ 48); (2) con el panel de suministros abierto el botón VOLVER (apilado sobre el chip) quedaba **tapado** por el panel y no recibía toques (capturas `evidence/`) | `min-height:48px`; con el panel abierto VOLVER baja junto al chip. Pasa a 844×390 y 667×375. |
| `tools/alpha/public-onboarding.js` | (1) La prueba espera un servidor en `:8813` (arnés). (2) **Defecto real**: en apaisado bajo (740×360) el pie legal (enlaces de 44 px, #258) cubría 20 px de «Tocá para continuar» y le robaba los toques | El botón sube por encima del pie en ≤ 420 px de alto. Pasa 740/844/1366. |
| `tools/bible/arena-validator.js` (TimeoutError) | **No reproducido**: pasa aislado (10 arenas, 0 errores de página). Atribuible a carga del arnés; causa no demostrada | Sin cambios. |

## B2 · Inventario de la economía (verificado en el código)
* Moneda premium: **Brasas ✦**, en el servidor (`server/wallet.js`); el cliente muestra saldo y pide compras (`js/systems/premium.js`). Precios: `js/data/pricing.js` (skin de colección ✦ 800, diseño propio ✦ 1.200, croma ✦ 300; colecciones con 15 %/20 % de descuento calculado). Las apariencias **no se compran con oro** (`shopBuySkinGold` rechaza).
* Pagos con dinero real: **apagados** (`MP_ENABLED=0`, botones «Muy pronto»). Sin cobros reales en este trabajo. Para acreditar Brasas en pruebas se usa el webhook HMAC de prueba del repositorio, igual que `tools/collection/brasas-store.js`.
* Sin cajas sorpresa ni ventajas de poder.

## B2 · Defectos observados (con captura) y corrección
| # | Observado | Corrección |
|---|---|---|
| S1 | El texto de la pestaña Skins decía «se paga con Brasas **o con oro**»: falso (el oro no compra apariencias) | Copia corregida: solo Brasas |
| S2 | Botón «✦ 1.700» deshabilitado sin saldo: el motivo solo estaba en `title` (no existe en el móvil); sin faltante visible | Línea de texto: `Tenés ✦ X · te faltan ✦ Y` / `te quedarían ✦ Z`; «Iniciá sesión…» sin cuenta |
| S3 | Skins «Manifestación» (Lucifer, Glaciar…) sin precio, sin estado y sin explicar cómo conseguirlas | Etiqueta `🔒 BLOQUEADA · se gana completando el set «…»` |
| S4 | Estado disponible/adquirida/equipada solo implícito | Etiqueta de texto + marca de borde (no solo color): DISPONIBLE · ADQUIRIDA · EQUIPADA · BLOQUEADA · PENDIENTE |
| S5 | No se podía comparar base y variante | Botón «Ver base / Ver skin» sobre la misma vista previa animada (la que dibuja la partida) |
| S6 | Botones de la tarjeta de ~32 px | `min-height:44px` |

Misma fuente de datos: la etiqueta lee `premiumPrice`/`PREMIUM` (saldo del servidor) y `skinOwnedFull`/`skinIsActiveOn` (los mismos que inventario y partida). No hay catálogo nuevo.

## B3 · Compra y recuperación
Ya existía: confirmación, candado `PREMIUM.busy`, `ref` idempotente con reintento, `expectedPrice`, servidor autoritativo, reintegro si falla la entrega. Defectos observados y cambios:
* Doble clic sobre «✦ 800» **encolaba dos diálogos** (el segundo ofrecía comprar lo ya comprado) → un solo diálogo y una sola solicitud (`PREMIUM.confirming`). Probado: 1 POST.
* El resumen previo no mostraba saldo ni aclaraba que no se cobra dinero real → «Vas a comprar «X» por ✦ 800 · Tenés ✦ 1.100 · te quedarían ✦ 300 · … no cobra dinero». Botones **Comprar con Brasas / Volver**.
* Durante el proceso el botón dice «Procesando…» y queda bloqueado; el éxito (`purchase_completed`, toast) solo tras el 200 del servidor.
* **Respuesta perdida + recarga**: antes el reintento generaba otra `ref`. Ahora `horda_buy_pending` (`{sku, ref, at}`, 10 min, sin datos de pago) conserva la referencia; el servidor la trata como idempotente. **Defecto observado**: tras cobrar y perder la respuesta, el saldo baja de 800 y el botón quedaba **deshabilitado** («no te alcanzan») aunque la skin estaba pagada y entregada en la nube, y el cliente local no la tenía (el sincronizador de cuentas lo resuelve en su ciclo o con el aviso de conflicto, `js/net/account.js`, fuera de este alcance). Ahora aparece **«↻ Confirmar entrega»** (`⏳ PENDIENTE`): reenvía la misma `ref`, el servidor contesta `repeated` sin cobrar de nuevo y el cliente marca la apariencia. Probado: 2 intentos, misma `ref`, saldo 1400 → 600 (una sola vez), tras recargar y reintentar sigue 600.
* Límite: el servidor responde `repeated` sin el detalle de `cosmetics`; el cliente marca el `sku` confirmado por él. Un cambio del servidor para devolver el detalle sería más limpio (no se tocó `server/`).

## B3 · Medición (telemetría existente, sin servicios nuevos)
`telemetryEvent` (js/systems/telemetry.js) guarda un anillo **local** (300) y emite `horda-telemetry`; no sale del dispositivo salvo los eventos mapeados a AlphaServices. Se agregaron **eventos locales**: `shop_opened {tab}`, `purchase_started {sku, kind, price}`, `purchase_cancelled`, `purchase_submitted`, `purchase_completed`, `purchase_failed {code}`, `cosmetic_equipped {sku, champion}`. Sin importes de pago ni datos personales. **No hay emisión remota de estos eventos**: para comparar abandono por etapa hará falta que el servidor los incluya en su lista blanca (decisión del dueño). La ficha de producto «vista» no se instrumentó (necesitaría IntersectionObserver; no se duplicó eventos por re-render).
**No se afirma que mejore la conversión: no se midió.**

## Pruebas (técnicas, no evidencia de usabilidad)
* `tools/ui-clarity/test-shop-clarity.js` (nueva, 44 comprobaciones): saldo 0 → estado/precio/faltante en texto; copia sin «o con oro»; bloqueada explicada; cancelar no cobra; doble clic → 1 diálogo; compra lenta + doble confirmación → 1 POST, «Procesando…», sin éxito antes del 200; saldo del servidor 1100 → 300; estado tras comprar; comparar base/skin; equipar; respuesta perdida → mismo `ref`, 1 cobro, error visible; recarga y reintento sin doble cobro; botones ≥ 44 px; sin desborde a 844×390 y 667×375.
* Regresión: `brasas-store` (55), `shop-pricing-browser`, `t_skins_brasas`, `t_cromas`, `check-skill-icons`, `lanes/flow`, `public-onboarding`: pasan.

## Límites y pendientes (no se declaran resueltos)
* **1b Peligro / efectos reducidos**: no implementado. Requiere dibujo en canvas (`js/rendering/*`, fuera de mis archivos) y coordinación con #260 (Madre Espora). Encuentro de Madre Espora: no inspeccionado ni modificado.
* La orientación vertical no está admitida (el juego pide girar el dispositivo): no se auditó.
* Cromas sueltas (`shop-cromas.js`) y colecciones no recibieron la etiqueta de estado (solo skins de set); el diálogo de compra sí cubre croma y colección.
* Sin probar: pagos reales/sandbox, conexión lenta en dispositivo real, teclado/lector de pantalla, rendimiento y memoria de la tienda (no medidos), jugadores reales.
* Revisión independiente: **pendiente** (la debe hacer una persona/sesión distinta del implementador con las mismas escenas; capturas en `evidence/b2_*`).
* Tareas breves con jugadores: (1) «¿Cuánto cuesta y cuánto te falta?» (2) «Comprá y equipá» (3) «Se cortó la conexión: ¿qué hacés?». Sin resultados.
