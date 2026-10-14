# Campeones que faltan integrar — qué le falta a cada uno (14 octubre 2026)

Meta del dueño: **50 campeones**, todos distintos entre sí, con el mismo arte/diseño/gameplay y **2 skins como mínimo** cada uno.
Etiquetas: VERIFIED (ejecutado, salida real) · IMPLEMENTED (en el código, sin prueba suficiente) · PROPOSED · BLOCKED/PENDIENTE (requiere persona o arte).

## Cuenta
| | Campeones |
|---|---|
| En `main` hoy (PR #87 incluido) | 43 (38 anteriores + Solciju, Veyra, Brakk, Morveth, Aelith, arte original) |
| Candidatos listos para integrar (PR #90, rama `claude/siete-campeones`) | 3: **Ilsa, Vorn, Kora** → 46 |
| Pendientes de arte original (rama `claude/siete-pendientes`) | 4: **Ostrel, Nerith, Quillon, Grelk** → 50 |

## A) Ilsa, Vorn, Kora (listos salvo el recorte del PR #90)
Criterio aplicado (pedido del dueño: «que no sean iguales y estén dentro del concepto artístico»): se miró `docs/production/siete/compare-sheet.png`;
estos tres tienen cara/peinado/casco propios y el mismo lenguaje que el roster (chibi, contorno 1 px, 2–3 tonos, 4 direcciones).
- VERIFIED (rama `claude/siete-campeones`, tip 14d9783): duplicidad DISTINCT (máx. 0,24), check-entry-reference, entry-gate (96 simulaciones), ability-gate --strict, `tools/siete/functional.js` 225/225, talentos, pricing-sync, Roster Art Gate (157 apariencias), 2 skins cada uno.
- **Falta (en orden):** (1) **recortar el PR #90 a estos tres** (hoy trae los siete; el agente se cortó por límite de uso antes de hacerlo); (2) CI verde en GitHub; (3) fusionar; (4) segundo PR aparte que los suma a `knownChampions` (rama `claude/siete-campeones-known`, referencia v4; AGENTS.md prohíbe hacerlo en el mismo PR); (5) estado TESTING → RELEASED (quitar sus filas de `CHAMPION_TAXONOMY`) cuando el dueño apruebe el arte.
- **No cerrado:** Ilsa, Vorn y Kora quedan por debajo de la media de su rol en las simulaciones (el piloto automático no usa la parada de Ilsa ni el Impulso de Kora y Vorn): requiere playtest humano. Audio = síntesis sin escucha humana. Croma y Set sin arte propio. Manifiestos de fábrica INCOMPLETE. Prueba en teléfono real y multijugador (gate `lobby_code_skins` falla también en main).

## B) Ostrel, Nerith, Quillon, Grelk (BLOQUEADOS por arte; kits listos)
Kits, talentos, cartas, pruebas y 2 skins existen en `claude/siete-pendientes` (VERIFIED: gates de kit/balance/habilidades/duplicidad). **No se pueden fusionar** porque el arte se lee como repintado de otro campeón:
| Campeón | Rol y mecánica | Problema de arte | Qué hace falta (arte original) |
|---|---|---|---|
| **Ostrel**, Cazador de Estrellas | Mago · rayo sostenido que gira con el apuntado y gana Foco | cabeza y pelo blanco de Sira + cuerpo de Dáriel: se lee como Sira | personaje nuevo: otro peinado/color (no blanco), cabeza propia, bastón-telescopio, capa de constelaciones |
| **Nerith**, Bruja de la Ciénaga | Soporte · zonas persistentes (musgo + lodo = ciénaga madura) | misma cabeza de Sira (se parece a Ostrel y a Sira) | cabeza y silueta propias: sombrero/capucha de junco, piel/rasgos distintos, bastón de raíz |
| **Quillon**, Tahúr de la Última Mano | Mago · baraja de 4 palos en orden fijo | silueta y garras de Nahir con paleta nueva | silueta propia: chaleco, sombrero de tahúr, mano con abanico de cartas (sin garras) |
| **Grelk**, Cazador de Fosos | Asesino/tirador · trampas armables (máx. 6) | cabeza de Renko sobre cuerpo de Tibor: composición forzada | cuerpo y cabeza pensados juntos: cazador de pantano, botas altas, bolsa de trampas |
Entregables de arte por campeón (ver `docs/ART_COMMISSION_BRIEF.md` y el importador de los cinco originales, `produce-quality-five.py`): atlas base de 4 direcciones y 36 celdas, 2 skins, y apariencia de Set + croma si se quiere contrato COMPLETO. Con el arte entregado: instalarlo, pasar Roster Art Gate, estilo estricto, duplicidad y la comparación visual contra 3 campeones del rol, y recién ahí PR + `knownChampions`.

## C) Skins: 2 por campeón (objetivo del dueño)
- VERIFIED: Ilsa, Vorn, Kora (y los 4 pendientes) tienen 2 skins de autor en su rama.
- NO verificado: cuántos de los 43 campeones de `main` ya tienen 2 apariencias. El agente de skins no entregó informe (se cortó por límite de uso). **Falta** auditarlo con `node tools/art/roster_gate.js` / `tools/factory/audit-roster.js` y producir las que falten con la fábrica (cosmético puro: sin cambiar estadísticas).

## D) Otros pendientes del mismo frente
- Duplicidad: el detector marca **Solciju (0,519) y Veyra (0,527) como DUPLICATE** y varios REVIEW (Brakk, Aelith, Nano, Facu, Bront) en `main`. Está documentado en `DESIGN-REVIEW.md` de los cinco; el dueño los fusionó. Pendiente decisión: rediseñar sus kits o aceptar la adjudicación.
- Revisión visual humana de todo el arte nuevo; escucha humana del audio.
- Publicar el build en Fondal (hoy sirve B1-6; `main` está más nuevo) y reiniciar el relay: lo hace el dueño.
