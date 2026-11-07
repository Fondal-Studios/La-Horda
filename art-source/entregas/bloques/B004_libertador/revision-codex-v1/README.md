# Libertador — revisión Códice v1 (fuente de las guardas de bytes)
Atlas del Libertador con el diseño del Códice (`assets/ui/codex/champions/libertador.png`): joven castaño, casaca azul con charreteras doradas, capa roja, fusil con bayoneta.
Origen: poses generadas con Runway (`art-source/runway-guardians/libertador/`, task IDs en `docs/beta-release/ART_CREDITS.md`), reducidas a escala nativa y animadas por
`tools/art-world/build-libertador-atlas.py` (contorno oscuro de 1 px, paleta compartida de 48 colores, alfa binario). Estos archivos son la fuente exacta de
`assets/sprites/champions/libertador/v2/{atlas,death,horse}.png` y `v3/motion.png`; los flujos `libertador-death.yml` y `libertador-motion.yml` comparan bytes contra ellos.
Revisión independiente: ver `docs/beta-release/RESULTADOS_PR.md` (agente a23aa0136108b2a22 revisó el PR; el cambio de arte lo aprobó el propietario: «dejar en main los diseños que más respeten el Códice»).
