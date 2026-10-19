# Tienda: modo demo y modo live (rotación diaria)

Decisión del dueño: hoy la Tienda vende **todos** los sets completos (4 piezas ≈ 4.800 de oro) porque es una página de muestra. A futuro, las piezas de set y los legendarios deben costar **mucho más** y estar a la venta **solo algunos por día**, para que dar una vuelta a la Tienda valga la pena todos los días. Este documento explica el mecanismo ya construido, que **no cambia nada mientras no se active**.

> Depende de la rama `claude/accesibilidad-cuentas-tienda` (PR #127): usa la fila «Lo que podés comprar ya / Tu próxima meta» que esa rama agregó arriba de la vitrina.

## 1. Cómo cambiar de modo

Una sola línea, en `js/data/pricing.js`:

```js
var SHOP_MODE = "demo";   // "demo" | "live"
```

| | `"demo"` (por defecto) | `"live"` |
|---|---|---|
| Catálogo | Completo, comprable siempre | Piezas de set y legendarios con nombre: solo los de hoy |
| Precio de una pieza de set | 1.200 | **7.200** (×6) |
| Precio de un legendario con nombre | 4.000 | **16.000** (×4) |
| «Comprar las que faltan» del set | Funciona (4.800) | **Desactivado** (`shopBuySetBundle` devuelve error) |
| Guardianes, objetos de guardián, equipo Básico, skins, cromas | Igual | **Igual** (siempre disponibles, mismos precios) |
| Día de la Tienda | Fecha local | Fecha **UTC** (todo se renueva a la vez, a las 00:00 UTC) |
| Ofertas del día (descuentos) | Como siempre | Como siempre, pero **sin legendarios con nombre** (un descuento los sacaría de la rotación) |
| Vitrina | Como siempre | Suma la fila **A LA VENTA HOY** con temporizador |

Los números de la escala y de la rotación están en `SHOP_LIVE` (mismo archivo): `priceScale` (`set`, `legendario`) y `rotation` (`piecesPerDay`, `windowDays`, `seed`). Los guardados existentes y sus compras no se tocan en ningún modo: lo que ya tenés sigue siendo tuyo y no se reembolsa ni se cobra nada al cambiar.

Las **Brasas ✦ siguen siendo solo apariencia**: no se tocó `js/systems/premium.js`, `server/premium-packs.json`, `js/net/*` ni `server/*`. Las skins (9.000 de oro o ✦ 800) tampoco cambian: son cosméticas y no entregan piezas.

## 2. Escala de precios y tiempo para comprar

Datos de entrada (no los medí yo; son los de la crítica y de los informes del repo):

- Una victoria en la Infernal rinde **≈ 5.200** de oro (cifra de la crítica; la franja de 5.000 a 7.000 que pidió el dueño para Pesadilla se prueba también). *No hay una medición propia en esta rama.*
- Jugador «crucero»: **≈ 835** de oro por partida, medido en `docs/alfa/q4_economia.md` §4 (4 partidas por día). «Casual» = 1 partida por día con ese mismo oro: es un escenario supuesto, no medido.
- Duración de una partida: **≈ 7 min** (supuesto: `LA_HORDA_PROGRESSION_ECONOMY_REPORT.md` dice ≈ 45 min para 6-7 partidas). Solo se usa para pasar a horas.

| Qué | Demo | Live | Victorias Infernal (5.200 / 7.000) | Partidas crucero (835) | Horas jugando crucero | Días casual |
|---|---|---|---|---|---|---|
| Pieza de set | 1.200 | **7.200** | 1,4 / 1,0 | 8,6 | ≈ 1,0 h | 8,6 |
| Set de 4 piezas | 4.800 | **28.800** | 5,5 / 4,1 | 34,5 | ≈ 4,0 h | 34,5 |
| Legendario con nombre | 4.000 | **16.000** | 3,1 / 2,3 | 19,2 | ≈ 2,2 h | 19,2 |
| Guardián (sin cambios) | 2.500 | 2.500 | 0,5 / 0,4 | 3,0 | ≈ 0,35 h | 3,0 |
| Todo el catálogo rotativo (210 piezas de set + 24 legendarios) | 348.000 | **1.896.000** | 365 / 271 | 2.271 | ≈ 265 h | — |

**Por qué ×6 en las piezas de set (y no ×3-×4):** el umbral de la crítica es que *una victoria Infernal no llegue al 25 % del precio de un set*. Con ×4 el set cuesta 19.200 y una victoria de 5.200 ya es el 27 %. Con ×6 el set cuesta **28.800**: una victoria de 5.200 es el **18,1 %** y una de 7.000 es el **24,3 %** (justo por debajo). Es el escalón entero más chico que cumple el umbral en toda la franja. En el demo, 5.200 de oro pagaba más que un set entero (4.800).

**Por qué ×4 en legendarios:** son una sola pieza (no un set), también ingredientes de Míticos, y tienen que seguir costando más que una pieza de set (16.000 contra 7.200; antes 4.000 contra 1.200).

**Lo que el precio solo no resuelve (honesto):** quien juega la Infernal al máximo junta 28.800 en ≈ 40 min. Por eso la barrera real es la **rotación** (cada pieza sale una vez cada 33 a 45 días, ver §3) y el **tope diario de oferta** (6 piezas: aunque sobre oro, no se puede comprar más de lo que hoy se vende). Si el dueño quiere un sumidero más pesado para el jugador de élite, la palanca es subir `priceScale`; el informe de progresión ya marcaba esa pregunta («otro sumidero de oro a largo plazo», marcada `HUMAN TEST REQUIRED`) y sigue abierta.

El jugador nuevo no queda sin metas: guardianes (2.500), objetos de guardián (1.800), equipo Básico (150 a 3.200), skins y cromas siguen siempre a la venta, y la fila «Tu próxima meta» sigue mostrando lo más barato que da poder (con 0 de oro: Básico Común, 150).

## 3. Cómo rota

`js/systems/shop.js`, bloque «ROTACIÓN DIARIA». Es una **función pura** del número de día UTC (`floor(ms / 86.400.000)`) y de la lista de piezas; no usa `Math.random`, el reloj local ni el guardado.

1. **Pool:** las 210 piezas de set + los 24 legendarios con nombre = 234 (Míticos, Únicos y los que cambian la build ya no estaban en el catálogo).
2. **Orden fijo A:** las piezas de set se reparten «de a una por set» (ronda sobre 52 sets) y los legendarios se intercalan parejo. Así un día trae sets distintos y a lo sumo un legendario.
3. **Ciclo:** `L = ceil(234 / 6) = 39` días. La pieza `i` de A tiene su «día de origen» `floor(i / 6)`.
4. **Ventanas:** el ciclo se parte en semanas (`windowDays = 7`). En cada ciclo se **baraja el orden de los días solo dentro de cada ventana** (semilla = ciclo + ventana). Todas las piezas salen exactamente una vez por ciclo.
5. **Garantía de reaparición:** la separación entre dos apariciones de la misma pieza es siempre `L + (desplazamiento dentro de su ventana)`, o sea entre `L - 6 = 33` y `L + 6 = 45` días. Esa cota (`shopRotationInfo().maxGapDays`) se calcula, se muestra en la Tienda («cada pieza vuelve a salir al menos cada 45 días») y la prueba la verifica sobre 12 ciclos. Medido además: dos piezas cualesquiera de un mismo set nunca están más de 20 días separadas.
6. **Se ve cuándo vuelve:** en *Objetos*, cada pieza que hoy no está dice «No está hoy · vuelve en N días» (se calcula del mismo calendario).

Si cambia la cantidad de piezas del catálogo (un set nuevo) o la configuración, el calendario se recalcula y la garantía rige desde ese día. Cambiar `seed` baraja todo (solo para un relanzamiento).

**Qué ve cada jugador:** todos ven **las mismas 6 piezas** el mismo día UTC, igual al recargar, en cualquier dispositivo y sin depender del guardado. Solo cambia lo que cada uno ya tiene («Tenés N») y cuánto oro le falta. Decidí **no** usar semilla por cuenta: (a) el guardado es local y editable, así que una semilla propia se podría tirar de nuevo borrando datos; (b) un calendario común permite que la gente comente «hoy salió tal pieza»; (c) es verificable. El horario es 00:00 UTC (21:00 en Argentina); la Tienda muestra la hora en el reloj de cada uno.

**Texto sin presión:** «Se renueva en 5 h 12 min» + una nota que dice que el precio no cambia, que no hay cantidad limitada y cuándo vuelve cada pieza. No hay «última oportunidad», cuentas regresivas rojas, ni descuentos ligados a la rotación.

## 4. Qué se probó

`node tools/collection/t_shop_rotation.js` (Chromium 844×390, servidor propio en puerto libre): 38 comprobaciones.

- **Demo:** modo por defecto; precios 1.200 / 4.000 / 4.800; el catálogo coincide clave por clave con `docs/production/shop-catalog.json`; el paquete de set funciona; el día es la fecha local.
- **Live:** determinismo (dos cargas separadas) y cambio al día siguiente; 6 piezas por día, sin repetidas, un legendario como máximo y ≥ 5 sets distintos; en 12 ciclos toda pieza sale y la separación queda en 33-45 días; «vuelve en N días» coincide con el calendario; precios = escala (7.200 / 16.000) y todo lo demás sin cambios; una pieza que no está hoy **no se compra ni con 10.000.000 de oro**; el paquete de set (con y sin descuento) devuelve error sin cobrar ni entregar; la skin sigue sin entregar piezas; `shopBuy` legado cerrado; guardianes, Básicos y objetos de guardián siempre se compran; ninguna oferta con descuento trae legendarios con nombre en 30 días; 312 min a las 18:48 UTC; cambiar de modo no toca oro ni inventario; **una victoria de 5.200 y una de 7.000 no llegan al 25 % del precio de un set (18,1 % y 24,3 %)**.
- **UI live:** 6 tarjetas «A LA VENTA HOY», «Se renueva en 5 h 12 min», fila «Tu próxima meta», compra tocando una tarjeta (precio exacto), Sets sin «comprar las que faltan», Legendarios con estado, Básicos sin etiqueta, la vitrina cambia pasada la medianoche UTC, vuelta a demo sin rastro.

También corren sin cambios: `shop-pricing-browser.js`, `pricing-sync.js` (482 comprobaciones: cliente y servidor siguen cotizando igual), `tools/items/t_starter_gift.js`, `tools/ux/test-touch-targets.js` y `tools/ux/test-accessibility-prefs.js`. `tools/ux/test-text-overflow.js` informa un desborde (`shop-hero-title`, 667×375, «Costurera de Espantapájaros») que **ya existe en la rama base** (verificado sobre una copia de la base).

Capturas (844×390 y 667×375, con el reloj fijado a las 18:48 UTC): `docs/ux/tienda-rotacion/` (`demo-*`, `live-*`).

## 5. Riesgos y límites

- **El oro es del cliente.** El guardado es editable; no hay servidor autoritativo para la Tienda de objetos. La rotación y el bloqueo «no está hoy» son **solo de presentación**: quien edite el guardado, el reloj del dispositivo o el código puede saltearla. El día se toma del reloj del dispositivo: cambiarlo muestra otra vitrina. Para que valga de verdad hay que mover la compra de piezas al servidor (cotización y entrega por día UTC, como ya hace `server/wallet.js` con las Brasas). No se hizo aquí a pedido (no tocar `server/*`).
- **Inventario previo:** quien ya compró sets en el demo los conserva; en live las piezas que le falten cuestan lo nuevo.
- **Frustración:** una pieza concreta tarda hasta 45 días en volver. Se mitiga mostrando cuándo vuelve y con las otras rutas siempre abiertas (skins por oro, piezas por botín, Básicos). Si se quiere una espera menor: subir `piecesPerDay` (a 10 la cota baja a 30 días) o achicar el pool.
- **Escala sin datos propios:** las cifras de oro por victoria son las de la crítica; hace falta medirlas con una sesión real de Pesadilla/Infierno antes de activar `live`.
- **Compras de a una:** completar un set (y recibir su apariencia gratis por colección) exige que salgan sus 4 piezas (entre 1 y varias semanas); la skin por oro (9.000) o Brasas sigue siendo la vía directa para el aspecto.
- **No cubierto:** regalo inicial, buzón de administración y botín siguen entregando piezas sin pasar por la rotación (a propósito). El modo `live` no está activado en ningún despliegue: la rama deja `demo`.
