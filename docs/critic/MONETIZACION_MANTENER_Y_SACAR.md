# La Horda: panel de críticos sobre monetización. Qué mantener, qué arreglar y qué sacar

Fecha del análisis: 20 de octubre de 2026. Base: `origin/main` (`53bcc6fa`). Análisis y redacción; no se tocó código del juego.

Pedido del dueño: «todo un departamento de críticos de videojuegos, y decime qué mantendrías del juego y qué sacarías a fines de monetizarlo lo máximo posible».

**Cómo leer este documento.** Todo número del juego sale de un archivo o de una corrida citada. Las estimaciones de ingresos son rangos con supuestos explícitos: **no hay ni un dato de jugadores reales en el repo** (`docs/game-direction/AUDITORIA_2_CRECIMIENTO.md` §0). Lo legal es una lectura de ingeniería y producto, **no es asesoramiento jurídico**: cada punto marcado «verificar» necesita abogado o contador local.

---

## (a) Resumen ejecutivo

1. **Hoy no se puede cobrar un peso.** Los pagos están apagados (`PAYMENTS_PROVIDER=` vacío, checkout devuelve «Muy pronto»), el servidor público declara `store:file, persistent:false`, y la base gratuita de Postgres **vence el 28/10/2026** (`docs/commercial/INDEPENDENT_HOSTING.md`). Primero infraestructura; después catálogo.
2. **El producto monetizable es sano y está bien pensado:** solo cosmético, sin cajas ni gacha, campeones solo por oro, precio siempre visible, servidor que decide (`docs/economy/PRECIOS.md`). Eso es una ventaja legal y de reputación; **no se toca**.
3. **El catálogo ya existe y es grande:** 43 campeones (41 en juego real + 2 Fundadores no vendibles), 82 apariencias vendibles en el catálogo del servidor (34 de set, 33 de autor, 15 cromas), 52 sets, 10 arenas de campaña + Divina, 104 tipos de enemigo, 28 jefes y subjefes, 5 modos (medido en este análisis, ver Anexo A).
4. **Fuga principal de ingresos, descubierta en el código:** todas las apariencias también se compran con oro (9.000 / 12.000) y el oro vive en el guardado del cliente, editable (`js/systems/premium.js` `shopBuySkinGold` resta `save.gold`). Quien edita su guardado se lleva las skins gratis. Hay que **sacar la vía de oro de las 33 skins de autor** y no prometer antifraude (`LAUNCH.md` ya lo advierte).
5. **El punto fuerte comercial es el arte de skins de autor** (54 poses, 4 direcciones, 139 apariencias pasan el Roster Art Gate) y la **identidad** de arenas/proyectiles (25 campeones con forma de disparo propia, 8 arenas con objetivo propio, todo PASS en el identity gate). Se vende lo que se ve.
6. **Lo más flojo comercialmente:** audio sintetizado, mezcla de resoluciones de arte, ~49 % de los estados de animación de enemigos son clones de otros, 2 enemigos (Tiburón Joven y Blanco) sin ningún cuadro, cold start (poca gente conectada) y cero telemetría de decisiones.
7. **Lo que NO se debe vender nunca:** poder (talentos, equipo, piezas de set, campeones por Brasas), cajas sorpresa/gacha, oro por dinero real, ventajas en Coliseo/Cristales, temporizadores falsos. Es lo que más puede costar una baja en tiendas o un reclamo de consumidor.
8. **Modelo recomendado:** web primero (cobro por Mercado Pago, sin comisión de tienda), cosméticos en tres escalones ya existentes, colecciones con descuento real, vitrina semanal, perfil (marcos/títulos), pase de temporada con pista paga **solo cosmética**, regalos entre cuentas, pack de bienvenida bien rotulado. Tiendas nativas después, con IAP.
9. **Ingresos, honestos:** con 10.000 jugadores activos al mes el rango razonable es **US$ 600 a 6.000 brutos por mes** (escenario base ≈ US$ 2.500); con 1.000 jugadores, US$ 60 a 600. El techo lo pone la audiencia, no el catálogo. Hoy la audiencia medida es cero.
10. **Veredicto:** comercializabilidad hoy **3,5 / 10**; potencial como F2P cosmético de nicho (hispanohablante, web + móvil) **6,5 / 10**. Se llega con 10 acciones; 4 necesitan humano (infraestructura, legal, Mercado Pago real, tiendas).

---

## (b) MANTENER / ARREGLAR ANTES DE VENDER / SACAR u OCULTAR, por área

| Área | Decisión | Evidencia | Motivo comercial |
|---|---|---|---|
| **Campeones** | **MANTENER** los 34 de base, Familia, Portadores, Expedición y quality-five, comprados con oro a 2.500 | `PRICING.gold.champion`; 25 campeones con proyectil propio (identity gate) | El roster con kit propio es el activo central. Dar campeones por oro mantiene la promesa «Brasas solo apariencia» y evita pay-to-win |
| | **ARREGLAR** balance de campeones fuera de ±50 % de la mediana de su rol: Libertador (51,5 s para matar, ×3,8), Nigromante (×1,52), Farolero (no mata en 60 s) | `docs/modes/POSTGAME.md` §3 | Un campeón que decepciona dentro del pack de bienvenida produce reembolso y mala reseña |
| | **ARREGLAR** los 7 de Ascensión: revisión humana de arte (generado, «probable REDRAW» según el reporte de Fundadores) y mostrar progreso hacia el desbloqueo | `docs/founders/REPORTE_FINAL.md` §5; Roadmap #5 | Son la meta aspiracional de retención (8.000 a 14.000 de oro); si el arte decepciona, la meta no motiva |
| | **OCULTAR** `nano_gm` y `facu_gm` de la tienda pública (`showcasePrice` 9999) | `champion-taxonomy.js` | Exhibe nombres del operador con un precio que no se cobra. Reservar como cosmético «Fundador» si se quiere vender estatus |
| **Skins** | **MANTENER** las 33 skins de autor a 1.200 ✦ como producto estrella | `skinCatalog()`: 33 `autor`; `docs/skins-audit/README.md` (13 recolores reemplazados por diseños, 1.881 comprobaciones PASS) | Silueta propia = valor percibido real. Ya hay 8 skins de set nuevas con 54 poses |
| | **ARREGLAR** vía de oro de las 33 skins de autor: pasar a Brasas-solo (o, más caro, validar en servidor) | `js/systems/premium.js` `shopBuySkinGold` resta `save.gold` del cliente; `LAUNCH.md`: «las apariencias siguen formando parte del guardado que aporta el cliente» | Cualquiera con DevTools se las lleva gratis. Cierra una fuga de ingresos de cero costo de arte |
| | **ARREGLAR** inversión de anclaje en packs de lanzamiento: 1.200 ✦ por US$ 2,99 (≈ 400 ✦/US$) vs. 100 a 130 ✦/US$ en la escalera | `premium-packs.json` | Quien compra a 2,99 y vuelve a ver la misma skin a ≈ US$ 9 a 12 siente suba de precio ×3 a ×4. Dejarlo como «primera compra» una vez por cuenta |
| | **MANTENER** las 34 skins de set (800 ✦) pero **solo atrás de `SHOP_MODE = "live"`** | `TIENDA_ROTACION.md`: en `demo` un set cuesta 4.800 y la skin se gana gratis al completarlo | En `demo` el atajo de 800 ✦ no vale nada. En `live` completar un set tarda ≈ 34 días (crucero) |
| | **MANTENER como impulso barato** los 15 cromas (300 ✦ ≈ US$ 2,30 a 3) pero sin promocionarlos como skins | Cosmetic Bible: «Croma ≠ skin» | Escalón de entrada. Se descuentan en colección |
| | **NO LANZAR** los 4 atlas candidatos (Soporte, Tanque, Guerrero, Libertador) | `art-assets-resume-20261019.md`: FIX en 1, 19, 36 y 7 cuadros | Arte con defectos cobrado al precio premium |
| **Modos** | **MANTENER** campaña, coop de sala, Horda Infinita y Guerra de Cristales | `CRYSTAL_WARS.md`: «MOBA con el motor real»; relay 50 conexiones OK | Es el bucle que da motivo para lucir skins |
| | **ARREGLAR** `POSTGAME_GATE = "open"` → `"campaign"` al salir de la alfa | `docs/modes/POSTGAME.md` §1 | Da endgame a la campaña y una razón para seguir jugando |
| | **OCULTAR** o rotular «contra bots» al Coliseo hasta tener online | `CRYSTAL_WARS.md` («Online: todavía no») | Prometer torneo y entregar bots genera reseñas negativas |
| | **NO VENDER** nada que afecte Cristales/Coliseo | `POSTGAME.md`: ventaja máxima de progreso ×2,1 de fuerza; PvP 0,7 | Cualquier poder pago en PvP vuelve el modo «pay-to-win» ante tiendas y comunidad |
| **Arenas, enemigos, jefes** | **MANTENER** las 10 arenas, 28 jefes con fases y guía «cómo sobrevivir» | identity gate (HIE/BOS/ACU/LAB PASS); `SCORECARD`: jefes 98, arenas 98 | Lo mejor del juego según la crítica (Jefes 7,5/10) |
| | **ARREGLAR** dibujar `tiburon_joven` y `tiburon_blanco` (0 cuadros) o retirarlos de la Acuática | `coverage.tsv`: 11 estados «vacío» cada uno | Enemigo invisible/placeholder en una arena de campaña |
| | **ARREGLAR** objetivo propio para Ciudad y Minas (las únicas 2 sin él) | `objetivos.md` | La primera arena es la que ve todo jugador nuevo |
| | **REHACER si hay presupuesto** subjefes y jefes con ≥ 60 % de cuadros clonados (Presentador, Minotauro, Leviatán, Titán, Cerbero) | `coverage.tsv`: 15 casos | Jefes = marketing y capturas; lo que aparece en trailer |
| **Progresión / loot / dificultad** | **MANTENER** loot en el piso, Pesadilla/Infierno coherentes, talentos desde nv. 5 | `COHERENCIA.md` §4, Crítica §6 | Es el motivo de retorno que sostiene la tienda cosmética |
| | **ARREGLAR** primer jefe como muro y XP desmedido | Crítica §6.4 #5 y #12 (el Presentador mató al autopiloto 3 de 3) | Abandono en la primera arena = D1 bajo |
| | **ARREGLAR** inflación de élites (30 a 42 por partida) | Crítica §6.4 #6 | Ruido visual que baja valor de lo «dorado» |
| **Tienda / economía** | **MANTENER** «Brasas solo apariencia», precios visibles, servidor decide, ref. idempotente, `expectedPrice` | `PRECIOS.md` §1; `server/test-wallet.js` | Diferenciador de confianza y requisito legal básico |
| | **ARREGLAR** `SHOP_MODE` a `live` solo cuando la compra de piezas sea del servidor | `TIENDA_ROTACION.md` §5: rotación «solo de presentación» | Sin servidor, la rotación se saltea editando el reloj |
| | **ARREGLAR** reembolsos/contracargos: hoy no revierte Brasas gastadas | `LAUNCH.md` secuencia #7 | Un contracargo con Brasas ya gastadas es pérdida directa |
| | **ARREGLAR** pack de bienvenida: abrir 2 checkouts antes del primer pago puede cobrar dos veces y entregar una | `LAUNCH.md` («No ofrecer inicialmente») | Cobro doble = reclamo/contracargo |
| | **SACAR** paquete de US$ 99,99 de la promoción inicial (mantener en el servidor) | `premium-packs.json` | Sin base de jugadores no hay ballenas; un precio así solo se ve como abusivo |
| | **NO CREAR** oro por dinero real, ni «completar campeón con Brasas» | `PRECIOS.md` §5 | Rompe la promesa y el pay-to-win |
| **Social / multi** | **MANTENER** salas de 4, bots con nombre, ⚡ JUGAR YA, chat de frases | `AUDITORIA_Y_ROADMAP.md` §6; `relay.js` | Cold start resuelto honestamente |
| | **ARREGLAR** chat libre de 120 caracteres con lista de palabras vacía por defecto (`CHAT_BLOCKLIST`) y sin reporte/bloqueo | `server/relay.js` ~74-79 | Requisito de tiendas para contenido de usuarios y de familias; riesgo con menores |
| | **ARREGLAR** que la skin de un Fundador invitado se vea para todos y, en general, **mostrar skins equipadas en el lobby y en el fin de partida** | `REPORTE_FINAL.md` §5 | El cosmético se vende por exhibición |
| | **AGREGAR** regalos entre cuentas y link de invitación | `AUDITORIA_Y_ROADMAP.md` #8 «propuesto» | Los regalos son el mayor canal orgánico de cosméticos |
| **Onboarding** | **MANTENER** título → guardián → prólogo → pelea (3 toques) y el Hechicero que enseña jugando | Crítica §6.1; carga 6,6 MB / 6,3 s | Retención D0 |
| | **ARREGLAR** 3 tests de tutorial en rojo y la carga sin gzip/brotli (JS 5,1 MB sin comprimir) | identity gate; `AUDITORIA_2_CRECIMIENTO.md` §1 | La mayor pérdida de conversión está antes de la primera pelea |
| | **ARREGLAR** telemetría de decisiones (campeón elegido, tienda abierta, checkout, abandono) | Roadmap #3 | Sin embudo no se puede optimizar precio ni oferta |
| | **ARREGLAR** economía de arranque: regalo de 10.000 de oro (4 campeones el primer día) | Crítica §6.4 #9 | El primer día se compra todo lo que después se vendería como atajo |
| **Arte / audio** | **MANTENER** pipeline de gates (Roster Art Gate, Cosmetic Bible) y 139 apariencias normalizadas | `roster-gate.json` | Evita el riesgo de «skin de menor calidad que el base» |
| | **ARREGLAR** audio (síntesis, 4/10) y resolución mixta (Ciudad, Abismo, Veda) | Crítica §6.4 #1 y #2 | Audio y arte inconsistente bajan el valor percibido; no se arregla con código |
| **UI** | **MANTENER** HUD en una sola familia pixel, Sala por pestañas, hub claro | Crítica §6.2 UI 7,0 | Base limpia para la tienda |
| | **ARREGLAR** emojis como íconos (parcialmente reemplazados en `docs/ux/emojis-pixel`), Georgia en fichas, texto sobre texto | Crítica §6.4 #10 | Una tienda con emojis parece provisoria |
| | **OCULTAR** herramientas de operador (Test Lab, panel de admin) fuera de roles | `REPORTE_FINAL.md` §2 | Evita fugas de contenido interno al público |

---

## (c) Modelo de monetización recomendado

### Principios (todos ya están en el repo, se mantienen)
1. Solo apariencia y comodidad; nunca poder. 2. Se compra exactamente lo que se ve. 3. Precio real a la vista, en la moneda de cobro (ARS visible). 4. Sin temporizadores falsos, sin tachado inflado. 5. El servidor decide.

### Qué se vende, con precios ya existentes y propuesta

| Producto | Precio hoy (repo) | Propuesta | Por qué |
|---|---|---|---|
| Croma | 300 ✦ | Mantener | Entrada barata |
| Skin de set | 800 ✦ (y 9.000 oro) | 800 ✦; **dejar oro** (se gana jugando) | Atajo de coleccionista; solo vale en `live` |
| Skin de autor | 1.200 ✦ (y 12.000 oro) | 1.200 ✦ **solo Brasas** | Producto estrella; cierra el bypass |
| Colección de un campeón | −15 % (2 piezas) / −20 % (3+) | Mantener; destacar en fin de partida | Aumenta ticket sin truco |
| Packs de Brasas | 4,99 a 99,99 | Ocultar 49,99/99,99 hasta tener datos; **probar un piso regional** | Ver nota de LatAm abajo |
| Primera compra | 2,99 (1.200 ✦) y 5,99 (2.800 ✦), «solo lanzamiento» | **Una vez por cuenta**, rotulado «primera compra» | Evita la percepción de suba ×3 |
| Pack de bienvenida | 6,99: 500 + 200 ✦ y 3 campeones | Mantener tras arreglar idempotencia; rotular «atajo de unas 9 partidas» | Alto valor percibido; honestidad en el texto |
| **Perfil (nuevo escalón)**: marcos, títulos, emblemas | no se venden hoy | **150 a 300 ✦** | Ya existen para Cristales y Coliseo (`POSTGAME.md` §4) y no necesitan arte nuevo |
| **Pase de temporada paga (nueva pista)** | Pase gratuito de 30 niveles | **500 ✦ (≈ US$ 4,99)**, pista cosmética paralela; la gratuita no se toca | Mayor ARPU predecible; cobrable con el saldo de Brasas que ya existe |
| **Regalo de apariencia** | no existe | Comprar una skin para otra cuenta | Canal viral; requiere revisión legal |
| **Edición Fundador (opcional)** | los campeones no se venden | Título/marco permanente «Fundador de la Horda» | Cosmético, sin vencimiento |

### Rotación de tienda y anclaje (sin trampas)
- **Vitrina semanal**: 3 apariencias destacadas con descuento real del 15 al 20 % sobre el precio de lista, que **vuelven siempre** (se muestra «vuelve en N días», igual que ya hace la tienda de objetos).
- **Anclaje honesto**: el pack grande muestra mejor tarifa por ✦ (130 vs 100); la colección muestra el ahorro exacto. Nada de «precio original» inventado.
- **Preview en el fin de partida** de las skins del campeón que se jugó (ya existe el botón «Ver apariencias de <guardián>»); mostrar la skin en el combate antes de pagar.
- **Nunca antes de la primera victoria.**

### Lo que NO se debe vender (poder o riesgo)
| No vender | Motivo |
|---|---|
| Campeones por Brasas, talentos, equipo, piezas de set por dinero | Pay-to-win; rompe promesa pública (`PRECIOS.md` §5) |
| Cajas sorpresa/gacha de cualquier tipo, ni siquiera cosméticas | Apple exige odds y restringe; Bélgica/Países Bajos las tratan como juego de azar; Brasil las limita para menores (verificar); riesgo reputacional |
| Oro por dinero real | El oro es del cliente y permite gastos en campeones: mezcla poder con dinero |
| «Completar campeón» con Brasas | Propuesta ya descartada en `PRECIOS.md` §5 |
| Cualquier ventaja en Cristales/Coliseo | El modo ya fue calibrado con tope de progresión |
| Contadores falsos o «última oportunidad» | Práctica engañosa; protección al consumidor |
| Ofertas dirigidas a menores / compras de un toque | `PRECIOS.md` §1.6 ya lo prohíbe; sostener en la UI |

### Estimación honesta de ingresos (brutos por mes, antes de comisiones e impuestos)

**Supuestos explícitos** (son hipótesis, no hechos del repo ni cifras de mercado):
- *Conservador*: 1 % de jugadores activos mensuales (MAU) paga, gasto medio por pagador US$ 6/mes.
- *Base*: 2,5 % paga, US$ 10/mes.
- *Optimista*: 4 % paga, US$ 15/mes.
- Pase premium: 3 % / 6 % / 10 % de los MAU lo compra una vez por temporada (≈ 90 días) a US$ 4,99, en parte solapado con el gasto anterior.

| MAU | Conservador | Base | Optimista | Pase premium (por temporada) |
|---|---|---|---|---|
| 1.000 | US$ 60 | US$ 250 | US$ 600 | US$ 150 a 500 |
| 10.000 | US$ 600 | **US$ 2.500** | US$ 6.000 | US$ 1.500 a 5.000 |
| 50.000 | US$ 3.000 | US$ 12.500 | US$ 30.000 | US$ 7.500 a 25.000 |

Qué hay que descontar y no está modelado: comisión de Mercado Pago (a confirmar con la cuenta real, varía por medio de pago y plazo de acreditación), 15 a 30 % de las tiendas si se publica nativo con IAP (verificar programa de pequeño desarrollador vigente), impuestos (IVA, IIBB, Ganancias: consultar contador), contracargos, y el tipo de cambio ARS/USD (el cobro es en pesos, `MP_ARS_PER_USD`).

**Lectura del director:**
- **Hoy los ingresos esperados son US$ 0**: pagos apagados, base de datos por vencer, MAU no medido.
- **La audiencia es el factor dominante**: pasar de 1.000 a 10.000 MAU multiplica ×10; pasar de conversión conservadora a optimista, ×10 también. El catálogo ya es suficiente para cualquiera de esos escenarios; más skins no cambian el resultado.
- **Riesgo regional**: un pago en pesos con US$ 12 por skin es caro para el mercado argentino. Recomiendo una **prueba A/B de precio** (por ejemplo 800 ✦ por la skin de autor) y medirla, en lugar de decidir por intuición. No hay dato en el repo sobre elasticidad.
- **Techo**: sin ballenas ni gacha, el mercado de cosméticos de un ARPG casual de nicho rara vez sostiene un estudio por sí solo; sirve como ingreso complementario y como colchón de sostenimiento. (Juicio del panel, no medición.)

---

## (d) Las 10 acciones de mayor impacto, por ROI y esfuerzo

Esfuerzo: S = horas, M = días, L = semanas. «Claude» = puede ejecutarlo en el repo; «Humano» = necesita cuenta, firma, arte o criterio fuera del repo.

| # | Acción | Impacto / ROI | Esfuerzo | Quién |
|---|---|---|---|---|
| 1 | **Persistencia real**: Postgres de pago o volumen respaldado antes del **28/10/2026**; probar backup y restauración | Condición previa de todo ingreso; si se pierde la base se pierden cuentas y Brasas | S (humano) | **Humano** (cuenta Render/Fly, costo). Claude puede preparar checklist y script de importación |
| 2 | **Cerrar el bypass del oro**: skins de autor solo con Brasas; revisar `shopBuySkinGold`, `premiumGoldPrice`, `pricing-sync.js` y textos de UI | Recupera ingreso de las 33 skins estrella a costo casi cero | S/M | **Claude** |
| 3 | **Páginas y flujos legales mínimos**: privacidad, términos, reembolsos y botón de arrepentimiento, contacto de soporte, edad mínima, eliminar cuenta | Sin esto no hay cobro legítimo ni tienda nativa | M | **Claude** redacta borrador y UI; **Humano/abogado** valida y aporta razón social/CUIT |
| 4 | **Mercado Pago real** (cuenta vendedora, token, webhook, compra y reembolso real) más **reversión automática de Brasas en reembolso/contracargo** y arreglo del doble checkout del pack de bienvenida | Habilita el primer peso; evita pérdidas | M | **Humano** (cuenta y credenciales); **Claude** (reconciliación, tests) |
| 5 | **Telemetría de embudo con consentimiento**: `champion_selected`, primera partida, tienda abierta, checkout, pago, entrega, D1/D7 | Sin datos no se optimiza nada; convierte este documento en medición | M | **Claude** (cliente y lista blanca del servidor) |
| 6 | **Curar lo que se muestra**: dibujar o retirar los 2 tiburones, objetivos en Ciudad y Minas, arreglar los 3 tests de tutorial, ocultar Fundadores en vitrina y Coliseo sin online, `POSTGAME_GATE="campaign"` | Mejora D1 y la imagen del primer contacto | M | **Claude** (código/UI); **Humano** (arte de tiburones) |
| 7 | **Vitrina y embudo de compra**: vitrina semanal, preview de skin en partida, ofertas tras primera victoria, colección en fin de partida | Es donde se convierte tráfico en ventas | M | **Claude** |
| 8 | **Perfil (marcos/títulos) y pase de temporada con pista cosmética paga** (precio en ✦) | Segundo y tercer producto sin arte nuevo; ingreso recurrente | M | **Claude**; **Humano** decide precio |
| 9 | **Regalos entre cuentas e invitación con link** | Canal viral de bajo costo | M/L | **Claude**; revisión legal humana (menores) |
| 10 | **Web instalable (PWA) y, después, tiendas nativas con IAP**; moderación de chat (lista, reporte, bloqueo) | Escala de audiencia; sin chat moderado las tiendas rechazan | L | **Humano** (cuentas Apple/Google, firma); **Claude** (moderación, empaquetado) |

Orden sugerido de ejecución real: 1 → 2 → 3 en paralelo con 4 → 5 → 6 → 7 → 8 → 9 → 10.

---

## (e) Panel de críticos, puntajes y veredicto

### 1. Marta Ibarra, crítica de diseño de juegos indie pixelados — **7,0 / 10**
> «La Horda es un arena ARPG táctil con ideas de verdad: arenas con regla propia, jefes con ventana de vulnerabilidad, refuerzos que cambian la habilidad al estilo Hades. El pecado indie clásico es el alcance: 43 campeones, 52 sets, 104 enemigos y cinco modos no caben en la atención de un estudio chico. Vendan menos cosas, mejor mostradas.»

Evidencia: 61 refuerzos que transforman habilidades (Crítica §6.2 fila 8), 8 arenas con objetivo propio (identity gate), crítica global 66/100.

### 2. Tomás Quiroga, analista de monetización F2P / live-ops — **4,5 / 10 hoy, 7,5 de potencial**
> «Diseño de tienda correcto y hasta virtuoso, ejecución cero. No hay pase pago, ni vitrina que rote cosméticos, ni regalos, ni primera compra: la tienda es un catálogo plano de 82 skins. Y dejaron una puerta abierta: todo se compra con oro editable. Yo vendería el campeón por Brasas, pondría pase premium con FOMO y un gacha de skins Ascensión.»

### 3. Lucía Ferreyra, analista de retención y onboarding — **6,0 / 10**
> «Pasaron de 8 pantallas a 3 toques hasta la primera pelea y la carga bajó de 17,1 MB a 6,6 MB. Bien. Pero no hay un solo dato de D1/D7/D30: ni `champion_selected` se emite (Auditoría y Roadmap #3). Con 1 humano conectado el juego se siente vacío. Y el tutorial tiene 3 tests rojos en el identity gate. La tienda no puede aparecer antes de la primera victoria.»

### 4. Ramiro Valdés, director de arte / pixel art — **6,5 / 10**
> «El valor percibido de una skin es su silueta. Las 33 de autor lo cumplen: ropa, arma y silueta distintas, 54 poses, nada de recolor. El resto no está parejo: Ciudad y Abismo en otra resolución, la vidente Veda ampliada y borrosa, tiburones sin arte, subjefes con 62 % de cuadros clonados, y los 7 de Ascensión son arte generado pendiente de revisión humana. Un precio premium exige arte premium.»

### 5. Camila Sosa, crítica de combate y progresión — **7,0 / 10**
> «El combate se sostiene: juice, retroceso por peso, élites con nombre, loot en el piso con haz por rareza, Pesadilla e Infierno con loot coherente (`COHERENCIA.md`). Pero 66/100 contra Diablo II no es 85: el audio es síntesis, los comunes tienen 1 afijo y el endgame no tiene ranking ni temporada. Eso importa para vender porque **sin un motivo para volver, nadie compra una skin para lucirla**.»

### 6. Diego Pereyra, especialista en multijugador y social — **6,0 / 10**
> «El relay aguantó 50 conexiones sintéticas, 13 salas, 60 s, 0 errores (`capacity-local.json`), y el invitado ve lo mismo que el anfitrión. Pero el cosmético se vende para ser visto, y hoy casi nadie lo ve: sin partidas públicas con gente, sin amigos, sin Coliseo online. La skin de un Fundador invitado solo la ve él (`REPORTE_FINAL` §5). Y el chat acepta texto libre de 120 caracteres con una lista de palabras vacía por defecto.»

### 7. Dra. Valeria Núñez, cumplimiento y ética comercial — **5,0 / 10** (diseño ético 8,5; preparación legal 2)
> «Lo mejor que hicieron fue prohibirse la caja sorpresa y el precio tachado inflado. Lo peor es todo lo que falta alrededor: no hay política de privacidad, términos, política de reembolso ni canal de soporte confirmado en el repo (`LAUNCH.md`: "falta insertar un canal de soporte"). Y se acepta dinero de menores sin verificación de edad. Eso, no el catálogo, es lo que cierra una tienda o genera un reclamo.»

### 8. Julián Ocampo, director de producto (síntesis y desempate)
> «Dos verdades a la vez: el diseño ya es el correcto y la ejecución comercial no existe. La plata del primer año no sale de agregar contenido; sale de (1) poder cobrar de forma segura, (2) saber qué hace la gente, (3) mostrar mejor lo que ya hay.»

**Puntajes por crítico:** Diseño indie 7,0 · Monetización 4,5 · Retención 6,0 · Arte 6,5 · Combate/progresión 7,0 · Multijugador/social 6,0 · Cumplimiento 5,0 · Producto (promedio ponderado por impacto comercial) **5,3**.

### Dónde discrepan y cómo resuelve el director

| Tema | Quién quiere qué | Resuelve el director |
|---|---|---|
| **Vender campeones por Brasas** | Quiroga: sí, es la mayor conversión. Núñez y la política del repo (`PRECIOS.md` §5): no, rompe «solo apariencia» | **No.** Se mantiene oro-solo. El pack de bienvenida (3 campeones) queda, pero rotulado como atajo y nunca como «solo apariencia» |
| **Oro como vía de compra de skins** | Quiroga: sacarla (canibaliza y se edita). Ferreyra: dejarla (confianza del jugador gratis) | **Sacarla para las 33 skins de autor.** Se deja para skins de set y cromas, que además se ganan jugando |
| **Pase de temporada con pista paga** | Quiroga: con FOMO y vencimiento. Núñez/Roadmap §4: sin FOMO | **Pista paga solo cosmética, que no vence** (se puede completar después). Sin cuenta regresiva roja |
| **Gacha / cajas de skins** | Quiroga: es el mayor ARPU | **Prohibido.** Núñez: Apple exige probabilidades, Bélgica/Países Bajos las restringen y Brasil las limita para menores (verificar). Además contradice la promesa pública |
| **Tienda temprana** | Quiroga: ofrecer pack de bienvenida en el título. Ferreyra: nunca antes de la primera victoria | **Ferreyra gana.** Primera oferta después de la primera victoria; el hub ya tiene el chip ✦ |
| **Vender Fundadores** | Quiroga: edición limitada de Fundador. Núñez: solo si es cosmético, permanente y sin vencimiento | **Opcional y cosmético**: título/marco «Fundador de la Horda», no los campeones `nano_gm`/`facu_gm` |
| **Anuncios recompensados** | Quiroga: ingreso extra | **No ahora.** Mala fit con audiencia joven, política de familias de tiendas y marca «sin presión» |
| **Más contenido vs. pulir** | Ibarra: menos y mejor. Quiroga: más skins | **Pulir y vender lo que pasa gate de arte.** No se lanzan skins nuevas hasta tener datos de qué se compra |

---

| Crítico / área | Puntaje hoy |
|---|---|
| Diseño de juegos indie | 7,0 |
| Monetización F2P / live-ops | 4,5 |
| Retención y onboarding | 6,0 |
| Arte / pixel art | 6,5 |
| Combate y progresión | 7,0 |
| Multijugador / social | 6,0 |
| Cumplimiento y ética comercial | 5,0 (diseño 8,5; preparación 2) |
| Producto (síntesis) | 5,3 |

- **Comercializabilidad hoy: 3,5 / 10.** El diseño y el catálogo están listos; la infraestructura de cobro, lo legal, la medición y la exhibición no.
- **Potencial: 6,5 / 10** como F2P cosmético de nicho en español (web primero), pasando a ≈ 7,5 con audiencia real, pase y regalos. No sube más sin audio profesional, arte unificado y endgame con ranking (Crítica §6.4).

---

## (f) Riesgos y límites del análisis

- **Sin datos de jugadores.** No hay MAU, conversión, retención ni elasticidad de precio. Los rangos de ingresos son hipótesis para planificar, no pronósticos.
- **Identity gate incompleto.** `identity-summary.md` no existe y `ability-gate --strict` seguía corriendo al cerrar este análisis; sus resultados no están incorporados.
- **No se recontaron a mano** los 104 enemigos ni las 52 sets en un navegador: los conteos salen de `enemy_coverage.js`, `shop-catalog.json` y `skinCatalog()`. «Clon» de animación no equivale a «sin identidad de diseño».
- **No se midieron** FPS en teléfonos físicos, audio de oído ni compras reales; todo es emulación y lectura de código (mismos límites que la Crítica §6.5).
- **Documentos desfasados:** `PRECIOS.md` habla de 62 skins (hoy 82); `roster-audit.json` todavía lista `eren` (ya es Ilkan); el reporte de Fundadores dice que los STANDARD son INTERNAL, la taxonomía los pone RELEASED. Se usó el código vigente cuando difería.
- **Lo legal es orientativo.** Las referencias a Ley 24.240 (consumidor, arrepentimiento), Ley 25.326 (datos personales), reglas de Apple/Google sobre compras digitales, probabilidades en cajas, edad (COPPA/GDPR-K) y normas de Brasil/UE sobre menores y moneda virtual **deben verificarse con abogado y contador locales**; las normas cambian y no se consultaron fuentes en línea para este documento.
- **El oro sigue siendo del cliente.** Aun cerrando la vía de oro para skins de autor, siguen siendo editables campeones por oro, equipo y set; no afecta ingresos (el oro no se vende) pero sí la sensación de progreso. Moverlo al servidor es un proyecto largo, no incluido en el top 10.
- **No se evaluó** el valor de la propiedad intelectual de nombres e historias (Libertador, Musashi) ni se hizo registro de derechos; `APP_STORE.md` lo deja pendiente de revisión humana.
## Anexo A. Inventario verificado e identity gate de la horda

| Área | Dato | Fuente / cómo se contó |
|---|---|---|
| Campeones | **43 IDs con precio** = 19 de base (12 clases + Myla/Ynara de Familia + 5 Portadores) + 10 Expedición + 5 «quality-five» + **7 Ascensión** + **2 Fundadores** (no se compran) | `docs/production/shop-catalog.json` (`championPrices`), `js/data/champion-taxonomy.js` |
| Skins vendibles | **82**: 34 de set (800 ✦), 33 de autor (1.200 ✦), 15 cromas (300 ✦), repartidas en 34 campeones | `require('server/wallet.js').skinCatalog()` ejecutado hoy. `docs/economy/PRECIOS.md` dice 62: está desactualizado |
| Valor del catálogo completo | 71.300 ✦ (≈ US$ 550 a 710 según el pack) | cuenta propia: 34×800 + 33×1.200 + 15×300 |
| Apariencias que pasan el gate de escala | **139**, 0 fallas de escala/presentación | `docs/art-gate/roster-gate.json` |
| Sets | **52** (30 base, 7 Ascensión, 10 Expedición, 5 quality); pool rotativo 210 piezas + 24 legendarios con nombre = 234; 267 claves de precio de objeto | `shop-catalog.json`; `docs/economy/TIENDA_ROTACION.md` |
| Arenas | **10** de campaña (Ciudad, Fábrica, Ruinas, Reino Fúngico, Gélida, Acuática, Laberinto, Abismo, Minas, Infernal) + **Divina** (postgame) + mapa de **Cristales** + **Coliseo** | `docs/arena-identity/README.md`, `js/data/arenas.js` |
| Dificultades | Normal / Pesadilla / Infierno, más Horda Infinita | `docs/economy/COHERENCIA.md`, `js/data/endless.js` |
| Enemigos | **104 tipos**: 32 normales, 21 subélite, 23 élite, 14 subjefe, 14 jefe | `tools/art/enemy_coverage.js` (corrida de hoy, `/tmp/enemy_coverage/coverage.tsv`) |
| Modos | Campaña (3 dificultades), Horda Infinita, coop de sala (hasta 4) y ⚡ JUGAR YA con bots, Guerra de Cristales (5v5 contra bots; 2v2 online), Coliseo (torneo de 8 contra bots; **sin online**) | `docs/modes/CRYSTAL_WARS.md`, `docs/game-direction/AUDITORIA_Y_ROADMAP.md` |
| Moneda | Oro (se gana, del cliente) y Brasas ✦ (servidor, solo apariencia) | `js/data/pricing.js`, `server/wallet.js` |
| Precios en oro | Campeón 2.500; Ascensión 8.000 a 14.000; skin set 9.000; skin autor 12.000; equipo 150 a 3.200; legendario 4.000 | `js/data/pricing.js` |
| Packs de Brasas (US$ sugerido) | 4,99 / 9,99 / 24,99 / 49,99 / 99,99; bienvenida 6,99 (500+200 ✦ y 3 campeones); lanzamiento 2,99 (1.200 ✦) y 5,99 (2.800 ✦) | `server/premium-packs.json` |
| Pase | **Pase de Temporada gratuito**, 30 niveles, ≈ 14.000 de XP, con títulos, marcos y cofres | `js/data/quests.js` |
| Tienda de objetos | `SHOP_MODE = "demo"` (todo comprable siempre); `live` rota 6 piezas por día y sube precios ×6 / ×4 | `js/data/pricing.js`, `TIENDA_ROTACION.md` |
| Calidad medida | Tarjeta de calidad 92/100 (auto-generada, 2026-10-04); crítica externa 66/100 contra Diablo II = 100 | `docs/quality/SCORECARD.md`, `docs/LA_HORDA_CRITIC_REVIEW.md` §6 |

**Identity gate de la horda** (corrida de hoy en `/tmp/idg/run1.txt` y `run2.txt`; `identity-summary.md` no existe; `ability-gate --strict` seguía corriendo y no se incorpora):

| Gate | Resultado |
|---|---|
| `t_identity.js` (Gélida, Ruinas, Acuática, Laberinto, interacción entre habilidades y arena) | todo PASS salvo **3 FAIL del tutorial** (`TUT.conceptos_de_combate…`, `TUT.empieza_con_moverse`, `TUT.moverse_atacar_habilidad_en_orden`): el texto del primer minuto no coincide con lo que el test espera. Es el primer minuto del jugador: se arregla antes de vender |
| `t_objectives.js` | **PASS**: 8 de 10 arenas tienen objetivo propio (recoger, escoltar, encender, cazar, defender, apagar). **Ciudad y Minas quedan sin objetivo propio** (`docs/arena-identity/objetivos.md`) |
| `t_identity_net.js` | PASS (el invitado ve lo mismo que el anfitrión) |
| `test-projectile-identity.js` | PASS: 25 campeones disparan con forma propia, 28 formas distintas píxel a píxel |
| `bot-identity.js` | PASS (compañeros con nombre propio) |
| `enemy_coverage.js` | 104 tipos. **2 sin ningún cuadro: `tiburon_joven` y `tiburon_blanco` (Acuática, 11 estados «vacío»)**. De 1.143 estados de animación, **557 (49 %) son clones** de otro estado, 450 son propios, 93 espejados, 22 vacíos. Promedio de clon por rango: normal 45 %, élite 43 %, jefe 54 %, **subjefe 62 %**. 15 jefes/subjefes con ≥ 60 % de estados clonados (Minotauro, Leviatán, Kraken joven, Presentador, Maestro de ceremonias, Dama, Tramoyista, Titán y Cerbero de las Minas, Morador y Carcelero del Abismo, Dragón de la Forja, Micelio, Jinete sin cabeza, Golem de cuerpos) |

Nota de método: «clon» significa reutilización de cuadros (por ejemplo, golpe = caminar), no necesariamente un enemigo genérico. Marca dónde el arte es más barato, no dónde falta identidad de diseño.

---

