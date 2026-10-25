# Economía de ítems V2: integración con main

Rama: `claude/item-economy-integracion` (PR #211 `feat/item-economy-v2` + `origin/main` al 25/10/2026).
Estado de la V2 antes de esta integración: `docs/economy/ITEM_ECONOMY_V2_STATUS.md`.

**Regla de la integración (decisión del dueño):** el sistema de ítems que manda es la V2. Lo anterior queda solo como modo **sin cuenta / sin servidor persistente / `HORDA_ITEM_ECONOMY=0`**, donde funciona exactamente como en main.

## 1. Cuándo actúa cada modo

| Situación | Inventario, oro, gemas | Botín | Inventario lleno |
|---|---|---|---|
| Cuenta con sesión + servidor con base persistente + V2 encendida (`economyActive()`) | Libro (ledger) del servidor; el guardado local es una proyección | Lo elige el servidor con el **mismo catálogo y reglas** que el cliente | No hay tope: el ledger guarda todo. Nada se recicla ni se pierde |
| Sin cuenta, offline, servidor sin base persistente, o `HORDA_ITEM_ECONOMY=0` | Guardado del cliente (como en main) | Cliente (`loot.js`, `ground-loot.js`) | Premios ganados al terminar: **Recompensas pendientes** (`reward-mailbox.js`). Recogidas del piso: reserva visible hasta 150 (`item.overflow`) o reciclado de duplicados idénticos, según Gestión de botín |

Resolución de los conflictos de merge:
- `js/systems/items.js` `addItemToInventory(champ, item, earnedReward)`: un premio ya ganado (`earnedReward`) con la bolsa llena va a `rewardOverflowPush` (buzón de main); una recogida nueva usa la reserva de la V2 (`overflow`, máx. 150). Con V2 activa el wrapper de `js/net/item-economy.js` corta antes (los objetos los crea el servidor).
- `js/ui/end-screens.js`: la nota de bolsa llena vuelve a ser la de main (Recompensas pendientes); con V2 `inventoryFull` llega en `false` y se muestra "Guardando recompensa en el servidor…" (`economyPending`).

## 2. Botín del servidor = catálogo del cliente (`server/item-economy-loot.js`)

El servidor ejecuta en un `vm` aislado los módulos reales (`js/data/{items,sets,loot,legendaries,mage-kit,champion-sets,portadores,mythic-sets-v2,item-identity,affixes,ground-loot,endless,arenas}.js` y `js/systems/{items,loot,rewards,affixes,mage-passives,ground-loot}.js`) con `Math.random` sustituido por `crypto.randomInt`. Así emite los mismos objetos:
- Kit de Magos (12 piezas, `roleOnly:"mago"`), legendarios de build (`BUILD_LEGENDARIES`), nombrados, míticos de receta, únicos de guardián y piezas de set; con afinidad por arena, mínimos de arena (`BUILD_LEGEND_MIN_ARENA`, `MAGE_KIT_MIN_ARENA`: en la arena 1 de campaña no caen; en Horda Infinita siempre), pesos de set por arena/guardián y protección (pity) **por cuenta** (`account.lootPity`, importada del guardado al migrar).
- `equip` rechaza piezas `roleOnly`/de otro guardián con la misma regla que `canEquipItem`.
- Cofre de victoria: `rollLoot` real (1 a 3 objetos, piso de rareza). Esto cambia el contrato de V2 ("1 objeto"): `test-item-economy-live.js` ahora acepta 1 a 3.
- Piso: el cliente declara solo el **rango de la fuente** (`normal…jefe`) y si es de build; el servidor aplica calificación/multiplicador/piso de `GROUND_LOOT_CFG`, con topes por rango (jefe 12, subjefe 24, nombrado 60) y el cupo por tiempo de V2 para el resto (un rango declarado de más baja a "normal").
- Primera victoria de campaña (Muy Raro para ranura vacía) y cofre final de la Horda Infinita (objetos por ronda 10/20/30 y gemas) ahora también los da el servidor.

**Diferencia que queda:** la dificultad Pesadilla/Infierno no viaja al servidor; el botín online se calcula como Normal (sin corrimiento de fila, ni nivel de objeto/ilvl extra). Calificación del cofre fija en A (el servidor no ve la puntuación real). Eventos Alfa (`AlphaServices.eventSet`/`bossDropSet`) no influyen en el botín del servidor.

## 3. Tabla de fuentes que escriben oro / gemas / objetos / desbloqueos

Estado: **Conectada** = pasa por una operación idempotente del servidor; **Reemplazada** = el valor local es solo vista previa y el asentado viene del servidor; **Bloqueada** = no hace nada con V2 activa (mensaje o redirección a Forja/Subastas); **Abierta** = sigue escribiendo local, con riesgo.

| Fuente (archivo) | Estado | Cómo |
|---|---|---|
| Botín de fin de partida (`loot.js` `grantEndOfRunLoot`) | Conectada | `run.finish`; premios con catálogo real |
| Botín del piso (`ground-loot.js` `groundLootDrop`) | Conectada | `run.loot {rank, build}` |
| Primera victoria de campaña (`loot.js` `firstWinLootDue`) | Conectada | servidor, una vez por cuenta (`account.firstWinLoot`, importado) |
| Cofre final / ítems de la Horda Infinita (`endless.js`) | Conectada | `run.finish` modo `endless` |
| Oro de combate: monedas, rescates (`cm-civilians.js`), bono de victoria 80, evento de red `gold` | Reemplazada | `grantGold` no hace nada con V2; el oro lo fija el recibo de partida (1200 + 40/min). **Cambio de balance de V2** |
| Gemas en partida (`endless.js`, `runGemReward`) | Reemplazada | materiales del recibo (`+3` victoria, `+1`/`+3` Horda Infinita ronda 8/10) |
| Oro y gemas de misiones, desafíos, logros, pase (`quests.js` `questsGrant`) | Conectada | `reward.claim` (cola persistente con `requestId`, topes por operación y 60.000 oro / 60 gemas por día UTC). Títulos/marcos/emblemas/XP siguen locales |
| Cofres de misión (`quests.js` `questsOpenChest`) | Conectada | `chest.open` (servidor tira con la calificación del cofre; máx. 20/día); el cofre local se consume solo si el servidor respondió |
| Regalo inicial de skin de set y vale (`starter-gift.js` `_giftSkin`) | Conectada | `gift.set` (máx. 2 por cuenta; si falla, vuelve como vale). Cromas/skins sueltas siguen en el guardado (cosméticas) |
| Regalo de set completo (skin por completar el set, `collectionRegister`) | Sin cambio | es cosmético y vive en el guardado; los conjuntos Míticos V2 los da el ledger |
| Pack de bienvenida (3 campeones, `wallet.js`) | Conectada | `welcomeReconcile` ya escribía el ledger (V2); sin cambios |
| Brasas → piezas de set (`wallet.js` `/api/wallet/buy-piece`) | Conectada | entrega por el ledger con el mismo `ref` (idempotente), reintegro si falla; ver sección 4 |
| Skins/cromas por Brasas | Sin cambio | guardado; `earnedOnly`/`requiresSet` de V2 se respetan; sin compras de skins con oro |
| Concesiones del Game Master: campeón, familia/categoría, oro/gemas, objeto/set (buzón), reinicio de inventario/oro | Conectada | `server/item-economy-compat.js` (con cuenta migrada escribe el ledger; si no, camino anterior) |
| Regalos de evento de campeones (`EVENT_REWARD` por la ruta de campeón) | Conectada | idem GM |
| Reinicio de talentos con oro (`talents.js`) | Conectada | `spend {talent.respec}`; se cobra primero |
| Campeones de Ascensión por logro (`ascension-unlocks.js`) | Conectada | `ascension.unlock` (categoría ASCENSION; el logro lo declara el cliente, como antes) |
| Compra de campeón con oro (`shop.js`) | Conectada | `champion.buy` (V2) |
| Tienda de equipo con oro (`shopBuy`, `shopBuyCatalog`), reroll de afijos, fabricar | Bloqueada | redirige a Forja/Subastas (V2) |
| Vender, descartar, fusionar, mejorar con gemas | Conectada | operaciones del ledger (V2) |
| Intercambio de sala (`net-trade.js`) | Bloqueada | `tradeBoundReason` → Subastas |
| Bonus de playtest v1 (+2000 oro, `menus.js`) | Bloqueada | no se otorga con V2; si se otorgó antes de migrar, se importó |
| Penalización de oro por perder (`progression.js`) | Sin efecto | el servidor no resta |
| Entrenamiento normalizado, laboratorio de pruebas, postgame (cambian `save.stash` temporalmente) | **Abierta (riesgo bajo)** | no se migraron; V2 ya los excluye de recompensas. Si una proyección llega en medio del intercambio de perfil, se restaura la del servidor |
| Inventarios que solo existen offline | **Abierta** | no se concilian (se guarda copia local); ver "Límites" |
| `/api/gm/user/repair` y la ficha del GM (oro/gemas del guardado) | **Abierta** | muestran/reparan el guardado, no el ledger |
| Dificultad Pesadilla/Infierno y eventos Alfa en el botín | **Abierta** | ver sección 2 |

## 4. Brasas → piezas (`PIECES_FOR_BRASAS`) — decisión pendiente del dueño

- `js/data/pricing.js` conserva `PIECES_FOR_BRASAS = true` (decisión del 21/10). La V2 original lo pasaba a `false` ("Brasas exclusivamente cosméticas", política del 23/10); **no se cambió por cuenta propia**. Apagarlo es cambiar esa única variable (más `server/test-wallet-pieces.js`, que ya prueba el caso apagado).
- Con V2 activa, `buy-piece` ya no escribe `save.stash`: entrega por el ledger (`compat.grantPurchasedPiece`, receipt `compat:buyp:<usuario>:<ref>`, uid determinístico), reintegra Brasas si falla y aparece en el Arsenal tras `economyReload()`. Los `PUT` de guardado no pueden pisarla.
- **Contradicción grave a decidir:** la V2 reclasifica los cinco conjuntos universales (Lucifer, Glaciar, Coloso, Tempestad, Alba) como **Míticos** (`mythic-sets-v2.js`), con estadísticas de rareza Mítico. Vender esas piezas por 200 Brasas daría poder muy superior al de main (donde eran Legendarias) a cambio de dinero. Decisión tomada para no romper nada: **la Tienda ya no lista esas cinco colecciones y `server/shop-pieces.json` se regeneró sin ellas** (22 piezas menos; el resto de los sets sigue a la venta por Brasas). Si el dueño quiere venderlas, hay que decidir antes su rareza/estadísticas.
- El crash que provocaba esa reclasificación en la pestaña "Set" de la Tienda (`shopPreviewItem` con entrada indefinida) quedó corregido en `js/ui/shop-ui.js`.

## 5. Activación y cómo apagarla

- Por omisión: V2 **encendida solo con almacenamiento persistente** (`DATABASE_URL`, o `DATA_DIR` + `DATA_PERSISTENT=1`). Sin eso (servidor gratuito de hoy) las rutas `/api/economy*` responden 503, el cliente no activa V2 y el ranking y todo lo demás siguen como antes. En esta integración se corrigió que `/api/leaderboard` y `/api/leaderboard/submit` ya no se pisaban sin base persistente (caen al ranking anterior, que además acepta claves mensuales `AAAA-MM` del cliente V2).
- `HORDA_ITEM_ECONOMY=0` la apaga siempre. **No deshace lo migrado:** el libro conserva el inventario; con V2 apagada el cliente vuelve a su guardado (que ya trae la última proyección). Antes de apagarla con cuentas migradas, respaldar cuentas + guardados + operaciones. El preflight (`tools/release/preflight.js`), `server/launch.env.example` y `docs/commercial/DESPLIEGUE_FONDAL.md` describen cada caso.
- Pagos: no se tocaron (`MP_ENABLED` sigue apagado). Tampoco Render ni credenciales.

## 6. Límites conocidos

1. El anfitrión simula el combate: V2 acota (tiempos, pulsos, topes) pero no prueba resultados. Misiones/logros siguen declarados por el cliente (ahora con topes y recibo).
2. Inventarios offline no se concilian; cofres/logros ganados offline se reclaman al volver (cola de `reward.claim`) pero el inventario offline no.
3. Dificultad Pesadilla/Infierno y calificación real no viajan al servidor.
4. La ficha del Game Master y `repair` leen el guardado.
5. Sin pruebas con dos humanos reales en cooperativo ni con PostgreSQL en esta rama (ver informe de pruebas).

## 7. Pruebas nuevas

- `server/test-item-economy-compat.js`: Brasas→pieza por ledger (idempotente, sin duplicar, un `PUT` no la borra, saldo insuficiente no entrega), botín (arena 1 sin Kit de Magos/build; infernal en Horda Infinita sí; `roleOnly` no se equipa fuera de magos), `reward.claim`, `chest.open`, `gift.set`, `spend`, `ascension.unlock`, GM (moneda, buzón de set, campeón) y reinicio del servidor. Verifica que el espejo `QUEST_CHESTS` coincide con `js/data/quests.js`.
- `tools/items/t_item_economy_compat.js`: navegador (desborde en ambos modos, fuente vieja conciliada).
