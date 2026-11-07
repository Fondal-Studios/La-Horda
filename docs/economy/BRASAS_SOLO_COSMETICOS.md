# Brasas ✦: solo cosméticos puros (regla del propietario, 2026-11-06)

**Cosmético puro (SE COMPRA con Brasas):** skins independientes, apariencias de campeón, cromas, alas y efectos visuales. No cambian estadísticas, daño, curación, control ni drops (docs/ART_BIBLE.md, skins cosméticas).
**Set y efecto de set (NO se compra con Brasas, nunca):** las piezas de set (equipo) y los bonos/efectos de set (`js/systems/champion-sets.js`, `set-effects.js`) se consiguen **jugando** (drops, cofres, forja con oro/recursos). Completar un set además **regala** su cosmético (skin de set, `earnedOnly`: precio 0, no se vende por Brasas).
**Moneda:** Brasas solo por compra real o por recompensas del pase de batalla; nunca como recompensa ordinaria; el oro es de progresión y no compra cosméticos de Brasas.

## Cómo está cargado
- `js/data/pricing.js`: `PIECES_FOR_BRASAS = false` (interruptor único; el servidor lee el mismo archivo en `server/wallet.js`, así cliente y servidor coinciden). Con `false`, `POST /api/wallet/buy-piece` responde `403 PIECES_OFF` y el cliente no muestra el botón.
- Textos de tienda/cuenta/legales dicen lo mismo (`premiumRuleText()` en `js/systems/premium.js`).
- Pruebas: `server/test-wallet-pieces.js` (por defecto apagado; el oro tampoco compra piezas; piezas de drop y regalo del set completo siguen funcionando), `server/test-wallet.js`, `server/test-item-economy-compat.js`, `tools/items/t_piezas_brasas.js`, `tools/collection/brasas-store.js` (56 comprobaciones), `tools/collection/t_shop_rotation.js`; workflow `.github/workflows/cosmetics-only.yml`.
- Origen: estos archivos provienen de los PR #261/#263 (UI Clarity + contrato «Brasas solo cosméticas»), con evidencia en `docs/beta-release/RESULTADOS_PR.md`. Al integrar esos PR no habrá conflicto de contenido en estos archivos (idénticos).
