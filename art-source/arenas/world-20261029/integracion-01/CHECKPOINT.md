# CHECKPOINT — integración limpia de arenas Ruinas/Gélida

Estado: **PR ABIERTO / PENDIENTE CI**. La extracción parte de `main` `6edcd9bce3d2d3cc77578e6d13a394d05b9c5eb6`; la producción limpia está en `b672ac878490d647aeeaabc149deb8ee414d0a2e` y [PR #244](https://github.com/Fondal-Studios/La-Horda/pull/244). El taller histórico permanece en PR #242 y no se importa.

El diff de runtime agrega carga por bioma y reemplazo visual con fallback. Geometría, colisiones, corrupción, combustible, temporizadores, daño, recompensas y mensajes de red permanecen en los módulos existentes. Se excluyeron expresamente la reparación histórica del arco de Bosque, cambios de blueprints y el cambio de luces `rich/reduced`.

Referencia exacta: `assets/ui/codex/champions/ilkan.png`, sólo sprites pequeños del lateral derecho. Pruebas nuevas del alcance limpio: 12/12 PASS, 32/32 cuadros; escritorio y móvil revisados. La pasada 13/13 del taller es histórica y contiene una aserción de geometría excluida. Siguiente: verificar diff, head final y todos los checks aplicables; sólo entonces merge normal con `expected_head_sha`.
