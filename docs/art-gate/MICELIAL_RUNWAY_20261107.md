# Micelial: 3 enemigos regenerados con Runway (2026-11-07)

**Gasto:** 20 créditos de Runway (4 imágenes `gen4_image` × 5); saldo restante 2. La hoja del **Chamán** salió con texto dentro de la imagen y se **rechazó** (`art-source/runway-enemies/micelial/chaman/rejected_v1.png`): el Chamán sigue con el arte anterior.

**Qué cambió:** `assets/sprites/arenas/micelial/{sabueso,infectado,acechador}/atlas.png|webp` y sus entradas en `MIC_ATLAS_META` (`js/arenas/micelial/mic-arena.js`: `w/h/refH/anchor/sets/hMul 1,3`). Mismo tamaño en pantalla que antes; píxel nítido con contorno de 1 px y alfa binario (referencia de estilo: un cuadro de Thalen). Fuentes, especificaciones y recibos en `art-source/runway-enemies/micelial/`.

**Límites (decisión de arte pendiente):**
- Cambia el **diseño y la paleta**: el Sabueso es ahora un lobo con una seta en la cabeza (menos «hongo»); el Infectado pasa de magenta a un casco de hongo naranja; el Acechador es un bípedo con sombrero azul. Más coherente con Thalen en estilo, menos fiel a la paleta de la arena.
- Pocas poses distintas (Runway repitió cuadros): la caminata del Infectado y del Acechador usa la caminata procedural.
- `GENERATED_NOT_APPROVED`: sin revisión de arte humana. Las comprobaciones técnicas pasan (`tools/micelial/t_micelial.js`, `pixel-density --strict`).
- No se tocó Madre Espora ni `mother/*`.
- Revertir = restaurar los 3 atlas y las 3 líneas de `MIC_ATLAS_META` desde `git`.
