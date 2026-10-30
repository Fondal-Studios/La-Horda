# CHECKPOINT — integración limpia de arenas Ruinas/Gélida

Estado: **VALIDADO_CANDIDATO / PENDIENTE CI**. Esta extracción parte de `main` `6edcd9bce3d2d3cc77578e6d13a394d05b9c5eb6` y contiene sólo Candidate03, fuentes, consumidor, receta y evidencia aprobada. El taller histórico permanece en PR #242 y no se importa.

El diff de runtime agrega carga por bioma y reemplazo visual con fallback. Geometría, colisiones, corrupción, combustible, temporizadores, daño, recompensas y mensajes de red permanecen en los módulos existentes. Se excluyeron expresamente la reparación histórica del arco de Bosque, cambios de blueprints y el cambio de luces `rich/reduced`.

Referencia exacta: `assets/ui/codex/champions/ilkan.png`, sólo sprites pequeños del lateral derecho. Siguiente: ejecutar pruebas específicas y todos los checks del head exacto; sólo entonces marcar listo y mergear con `expected_head_sha`.
