# Tres campeones nuevos — control de producción (estado TESTING)

Pool objetivo de 50: esta rama agrega **Ilsa, Vorn y Kora**. Los otros cuatro diseños del lote original (Ostrel, Grelk, Nerith, Quillon)
se respaldan en `claude/siete-pendientes` y vuelven cuando tengan arte propio (el visual review los leyó como repintados de un campeón existente).
**Ninguno está aprobado ni en `knownChampions`.** Etiquetas: VERIFIED (ejecutado, salida real) · IMPLEMENTED · BLOCKED/PENDIENTE.

| Campeón | Rol | Identidad (mecánica propia) |
|---|---|---|
| **Ilsa**, la Esgrimista de Réplica | Asesina | **Contraataque**: la postura desvía golpes (daño 0) y suma Réplicas que potencian estocada y giro |
| **Vorn**, el Cambiapiel | Tanque | **Dos formas** (Piedra/Tormenta) que cambian Zarpa e Instinto; Mudar es la bisagra |
| **Kora**, la Ariete | Tanque | **Impulso** por movimiento; la Arremetida arrastra y estrella comunes contra los vecinos; estampida guiada |

Duplicidad (`tools/factory/duplicity.js`): los tres DISTINCT (máx. 0,24), también frente a Solciju, Veyra, Brakk, Morveth y Aelith. No se tocó el detector.

## Dónde vive cada cosa
- Diseño: `js/champions/siete/catalog.js` (se fusiona con `ASCENSION` para reutilizar registro, talentos, Códice, voces y skins; categoría real STANDARD/TESTING en `js/data/champion-taxonomy.js`).
- Runtime: `common.js` (entidades con tope, limpieza, techo contra jefes, hooks) y `ilsa.js`, `vorn.js`, `kora.js`; registro complementario `register.js`; efectos `render.js`; audio sintetizado `audio.js`.
- Refuerzos (4 cartas + dúo por campeón): `js/data/boons-siete.js`. Arte: `tools/art/painter/specs/<id>.json`, `<id>_alt1`, `<id>_alt2`.
- Pruebas: `tools/siete/functional.js`; manifiestos: `tools/siete/manifests.js` → `docs/production/siete/*.json` (INCOMPLETE); hoja comparativa: `tools/siete/compare-sheet.js` → `compare-sheet.png`.

## Revisión de arte
Hoja `docs/production/siete/compare-sheet.png`: cada campeón y sus 2 skins junto a sus donantes y a tres campeones de su rol, con el mismo motor.
Mismo lenguaje del roster (chibi, contorno 1 px, sombreado 2-3 tonos, alfa binario, 4 direcciones; estilo y Roster Art Gate PASS). Son ensamblados de
donantes con paleta y accesorios de la forja (no arte original); las filas de muerte heredan rasgos del donante. **PENDIENTE de ojo humano.**

## BLOCKED / PENDIENTE
Revisión humana de arte y audio; croma y Set con arte propio; multijugador real y rendimiento en dispositivo; `knownChampions` (rama `claude/siete-campeones-known`, sin PR).
