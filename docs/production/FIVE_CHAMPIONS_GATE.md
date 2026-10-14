# Expansión de cinco campeones — control de producción

## Estado (12 de octubre de 2026)
Solciju (Enóloga), Brakk (Arquitecto), Veyra (Asesina), Morveth (Invocador) y Aelith (Cronomante) están **IMPLEMENTADOS y registrados en TESTING** (rama `claude/five-champions`): kit ejecutable, atlas del Pintor de cuatro direcciones con 36 celdas, una skin de autor cada uno (Viuda de Medianoche, Arquitecto Glacial, Verdugo Celestial, Micelio Abisal, Relojera del Vacío), Códice, selección, tienda (oro 2.500; skins 12.000 oro / 1.200 ✦) y catálogo de servidor. **No están aprobados**: estado TESTING = jugables sólo para cuentas con concesión, fuera de tienda pública, bots y modos competitivos. Pasarlos a RELEASED (quitar sus filas de `CHAMPION_TAXONOMY`) es una decisión del dueño. `knownChampions` NO se tocó (AGENTS.md: segundo paso, en otra PR, con versión de referencia y medias actualizadas).
Detalle de evidencia por campeón y por gate: `docs/production/quality-five/README.md` (sección «Integración en juego»).

## Autoridades
- `tools/factory/README.md`: ejecutar CLI y gates reales; NO basta un JSON válido.
- `docs/ART_BIBLE.md`, `docs/production/PRODUCTION_BIBLES.md`: arte 16 bits, silueta, atlas, animación 4 direcciones, preview y skin verdaderamente distinta de un croma.
- `BALANCE_CAMPEONES.md` y `docs/balance/champion-entry-reference.json`: números y simulaciones.
- `tools/factory/ability-gate-static.js`: auditoría diagnóstica de referencias a tipos de habilidad. Ejecutar `node tools/factory/ability-gate-static.js`.

## Contrato de admisión
Cada candidato: kit de tres habilidades más definitiva, pasiva con efecto implementado, AoE útil, árbol con tres ramas, compatibilidad con nivel 40, maestría, arte base y skin con atlas/previews verificables, códice, tienda, servidor, registro de assets, balance y pruebas móviles/multijugador. Ningún candidato entra al catálogo activo si falla un gate. Ejecutar `node tools/factory/cli.js gate all` sobre el commit candidato.

## Economía
La moneda premium actual **Brasas** usa el identificador interno `brasas` en billetera, precios, paquetes y tests. Propuesta de marca: **Éter** (✦), sujeta a revisión de lore y de marca. NO renombrar IDs, endpoints, registros contables ni SKUs sin migración de extremo a extremo. Mantener pagos reales desactivados hasta verificar proveedor, términos, impuestos, precios y conciliación. No vender talentos ni poder.

## Comunidad
Preparar Discord oficial, canal de bugs, encuesta de campeones, programa de testers y calendario de publicaciones; no publicar desde cuentas del estudio sin verificar acceso y contenido final. Mantener como servidor canónico el del estudio y conservar NanoGM con sus permisos; no redirigir cuentas ni desactivar instancias sin auditoría de despliegue.
