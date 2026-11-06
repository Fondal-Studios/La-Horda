# Inventario de kits de arte de habilidades (art-source/entregas) — 2026-11-06

Fuente: `art-source/entregas/*kit*|*codex*|habilidades*`. **Hallazgo:** casi todos los checkpoints dicen `EN_CORRECCION / NO_INTEGRAR / INTEGRADO_MAIN=false`, pero los archivos de runtime que cada kit declara en su `RUNTIME_DIFF.json` (recetas `js/champions/skill-fx-a/…`) **ya están en `main`**, con último commit de la integración masiva #219 (24/10/2026). Los checkpoints están desactualizados respecto del código. Ejemplo verificado: el clip «trampa/armada» de Guerrero (checkpoint: no integrado) está en `js/rendering/effect-atlases.js` por #212.
El estado real de cada habilidad se juzga en el juego (galería `tools/art-world/ability-gallery.js`), no por el checkpoint.

| Kit | archivos | PNG | checkpoint (texto original) |
|---|---|---|---|
| aelith-normal-kit-20261022 | 329 | 167 | — |
| axiom-codex-20261030 | 47 | 19 | **VALIDADO_LOCAL / PENDIENTE_CI**. Componente: cuerpo completo de Axiom y sus dos apariencias runtim |
| baltra-kit-20261023 | 70 | 36 | EN_PRODUCCION / NO_INTEGRAR. Recetas nativas SFA, reconciliar únicamente callback bake ya utilizado  |
| brakk-kit-20261022 | 615 | 249 | EN_CORRECCION/NO_INTEGRAR. |
| brasa-kit-20261023 | 93 | 51 | — |
| cazadora-kit-20261023 | 101 | 60 | — |
| dariel-kit-20261023 | 95 | 53 | GENERADO / EN_CORRECCION / NO_INTEGRAR. No VALIDADO integral, no INTEGRADO_MAIN, publicación no veri |
| eslabon-kit-20261023 | 100 | 58 | GENERADO / EN_CORRECCION; FIX / NO_INTEGRAR. No VALIDADO integral, no INTEGRADO_MAIN, publicación no |
| facu-gm-kit-20261023 | 101 | 54 | GENERADO / EN_CORRECCION / NO_INTEGRAR. VALIDADO=false, INTEGRADO_MAIN=false, publicación no verific |
| farolero-kit-20261023 | 91 | 55 | **EN_CORRECCION / NO_INTEGRAR**. Producción GENERADO; VALIDADO no; INTEGRADO_MAIN no; publicación no |
| guardianes-codex-20261029 | 100 | 45 | — |
| guerrero-kit-20261023 | 133 | 79 | **VALIDADO / PASS_COMPONENT** para `A-FX-guerrero-h3 / armada`, cuadro7. **INTEGRADO_MAIN: no; publi |
| habilidades-recientes-20261022 | 188 | 109 | EN_CORRECCION, NO_INTEGRAR. |
| ilkan-codex-20261029 | 192 | 127 | — |
| ilkan-kit-20261024 | 95 | 54 | — |
| iria-kit-20261024 | 22 | 9 | — |
| khepri-kit-20261024 | 23 | 6 | — |
| libertador-kit-20261025 | 242 | 62 | — |
| mago-kit-20261025 | 126 | 51 | — |
| maura-kit-20261025 | 371 | 104 | **EN_CORRECCION / NO_INTEGRAR**, Art Gate **FIX**. PR223 sigue borrador. No merge/publicación. Base  |
| morveth-kit-20261022 | 186 | 91 | — |
| morwen-kit-20261025 | 73 | 30 | — |
| musashi-kit-20261026 | 340 | 99 | — |
| veyra-codex-20261029 | 53 | 27 | **VALIDADO / PENDING_CI**. Componente: `A-BODY-veyra/codex-v1`. |
| veyra-kit-20261022 | 156 | 80 | EN_CORRECCION/NO_INTEGRAR. |

## Revisión visual en el juego (galería con tiempo real)
- **Ilkan** (Lanza-Pendón, Piel de Duna, Grito de Caravana, Coloso): efectos coherentes con su identidad (ocre, dorado, turquesa). *Corrección:* en una primera versión de la galería vi una esfera blanca y un bloque de ruido; eran artefactos de la herramienta (el motor de efectos envejece con el reloj real y yo lo simulaba por cuadros). Retirado.
- **Guerrero, Mago, Tanque** (con sus cuerpos nuevos): sin defectos visibles de efectos en las hojas `evidence/habilidades/`.

## Limitaciones
Galería: 1 arena (Fábrica, fondo oscuro), 8 enemigos fijos, sin aliados, 2 instantes por habilidad; no sustituye una revisión con movimiento ni en las otras arenas, ni mide legibilidad con 100+ enemigos. Pendiente: correrla para los 43 guardianes y revisar cada hoja.
