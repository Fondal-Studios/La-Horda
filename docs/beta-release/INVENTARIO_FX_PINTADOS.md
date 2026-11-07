# Efectos de habilidades dibujados con arte PINTADO (no pixel art nativo) — 2026-11-06

Método (reproducible): `node tools/art-world/ability-assets.js <salida.json>` lanza las 3 habilidades y la definitiva de los 43 guardianes en el motor real y registra qué imágenes se dibujan; `python3 tools/art-world/ability-assets-report.py <salida.json>` marca las de >3000 colores o >15 % de alfa parcial (suavizado). Datos crudos: `evidence/habilidades/ability-assets.json`. 0 errores de página.

**Resultado: 27 usos en 8 guardianes** (cuerpos, arenas e interfaz excluidos). Pintado no significa feo (el Muro de Fuego del Mago se ve bien); la **Plaga del Nigromante** era el peor caso por tamaño y desenfoque y ya se rehízo en pixel art nativo (SFA, tema `necro`).

| Guardián | Habilidad | Imagen | Colores | Alfa parcial % | Tamaño |
|---|---|---|---|---|---|
| axiom | hab. 1 | `axiom/err404.webp` | 74908 | 3.5 | 1560×160 |
| axiom | hab. 2 | `axiom/overwrite.webp` | 67240 | 3.0 | 1625×140 |
| axiom | hab. 2 | `vendor/cadena-relampagos.webp` | 99664 | 3.9 | 1024×1024 |
| axiom | hab. 3 | `axiom/teleport_in.webp` | 33023 | 1.0 | 822×135 |
| axiom | hab. 3 | `axiom/teleport_out.webp` | 23874 | 1.3 | 720×135 |
| axiom | definitiva | `axiom/forcequit.webp` | 42265 | 5.2 | 1560×145 |
| cazadora | hab. 2 | `cazadora/trap-f1.webp` | 4279 | 0.0 | 76×104 |
| cazadora | hab. 2 | `cazadora/trap-f2.webp` | 5795 | 0.0 | 117×104 |
| cazadora | hab. 2 | `cazadora/trap-f3.webp` | 6535 | 0.0 | 110×104 |
| cazadora | hab. 2 | `cazadora/trap-f4.webp` | 8682 | 0.0 | 122×104 |
| cazadora | hab. 3 | `cazadora/rain-f1.webp` | 8101 | 0.0 | 159×152 |
| cazadora | hab. 3 | `cazadora/rain-f2.webp` | 9923 | 0.0 | 151×152 |
| cazadora | definitiva | `vendor/cadena-relampagos.webp` | 99664 | 3.9 | 1024×1024 |
| guerrero | hab. 1 | `guerrero/corte_sangrante.webp` | 17794 | 4.7 | 336×336 |
| guerrero | hab. 2 | `guerrero/triple_golpe.webp` | 21792 | 6.9 | 336×336 |
| guerrero | hab. 3 | `guerrero/trampa.webp` | 27492 | 13.8 | 336×336 |
| guerrero | definitiva | `guerrero/pestilencia.webp` | 27200 | 10.6 | 336×336 |
| mago | hab. 1 | `vendor/muro-fuego.webp` | 236609 | 9.2 | 1024×1024 |
| mago | hab. 3 | `vendor/cadena-relampagos.webp` | 99664 | 3.9 | 1024×1024 |
| mago | definitiva | `vendor/cadena-relampagos.webp` | 99664 | 3.9 | 1024×1024 |
| musashi | hab. 1 | `vendor/cadena-relampagos.webp` | 99664 | 3.9 | 1024×1024 |
| musashi | hab. 3 | `vendor/cadena-relampagos.webp` | 99664 | 3.9 | 1024×1024 |
| nigromante | hab. 1 | `vendor/cadena-relampagos.webp` | 99664 | 3.9 | 1024×1024 |
| soporte | hab. 3 | `abilities/holyShieldBubble_01.webp` | 2033 | 73.8 | 96×96 |
| soporte | hab. 3 | `abilities/holyShieldBubble_02.webp` | 2419 | 73.7 | 96×96 |
| soporte | hab. 3 | `abilities/holyShieldBubble_03.webp` | 1942 | 73.9 | 96×96 |
| soporte | hab. 3 | `abilities/holyShieldBubble_04.webp` | 2443 | 73.7 | 96×96 |

## Prioridad de conversión a SFA nativo (propuesta, sin hacer)
1. **Guerrero** (4 tiras de 336×336: corte, triple golpe, trampa, pestilencia; 11-28 % de alfa parcial en trampa/pestilencia) — ya revisadas a ojo: coherentes con el cuerpo nuevo; migrar solo si el director de arte las quiere nativas.
2. **Axiom** (err404, overwrite, teleport_in/out, forcequit: 24-75 mil colores) — se ven nativas en combate (probablemente se hornean a baja resolución); revisar.
3. **`vendor/cadena-relampagos`** (1024×1024, 99 mil colores) usada por Axiom, Sylva, Mago, Musashi y Nigromante: una sola imagen compartida; reemplazarla por un haz SFA cubre 5 guardianes de una vez.
4. **Sylva** (trap-f1..4, rain-f1..2): 4-10 mil colores, sin alfa parcial; correctas en escala.
5. **Mago** `vendor/muro-fuego` (236 mil colores): se ve bien en combate; baja prioridad.
6. **Soporte** burbuja (73 % alfa parcial): translúcida a propósito; correcta.
