# Brasas: redefinicion (modelo B)

Las Brasas compran SOLO apariencia. Nunca poder.

- Las skins de set son PREMIUM: solo se compran con Brasas. Completar el set, un vale o un regalo NO las dan (`SET_SKINS_FROM_SETS = false`, `js/data/pricing.js`).
- Las piezas de set vuelven a oro / rotacion / drops (`PIECES_FOR_BRASAS = false`). El servidor rechaza `/api/wallet/buy-piece` (PIECES_OFF) y `gift.set` (GIFT_OFF).
- Los sets dan bono de estadisticas + efectos visuales (`js/systems/set-visuals.js`: particulas segun piezas, respeta "Reducir efectos").
- Llevar piezas de set ya no cambia la apariencia: se ve solo la skin/croma que el jugador elige.
- Grandfathering: `setSkinsPremiumMigrate` (una vez, `save.setSkinsPremiumV1`) conserva las skins de set ya reunidas o regaladas y las deja elegidas si se veian puestas. Las piezas compradas con Brasas se conservan.
- Los vales ya emitidos se canjean por cromas.
- Reversible: ambas banderas en `pricing.js`; no combinar `PIECES_FOR_BRASAS = true` con `SET_SKINS_FROM_SETS = true`.

Pruebas: `server/test-item-economy-compat.js` cubre las banderas (apagadas por defecto y rutas intactas al prenderlas).
