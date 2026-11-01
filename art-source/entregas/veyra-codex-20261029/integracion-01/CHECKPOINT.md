# Veyra Códice v1 — cierre de componente

Estado: **VALIDADO / PENDING_CI**. Componente: `A-BODY-veyra/codex-v1`.

Referencia exacta: `assets/ui/codex/champions/veyra.png` (`d89d8328…`). El atlas instalado (`c2e818a1…`) contiene 112 cuadros, cuatro direcciones reales y siete estados de cuatro fases. Base, equipo y croma usan el nuevo cuerpo; las apariencias authored `alt1` y `set` conservan sus atlas.

La revisión real cubre seis arenas, cinco apariencias, densidad con actores adyacentes, móvil/escritorio, H1/H2/H3/UF y relay anfitrión/invitada táctil. La matriz final conserva estado y RNG exactos en 120 pares y obtiene contacto mínimo 87.1065% con el umbral 80%/delta24 intacto. El roster completo pasa 141 apariencias sin fallos de escala, presentación ni carga. El atlas se reproduce byte por byte con la receta guardada.

PR233 y sus fuentes FIX quedan intactos. Este cierre no declara resuelto el kit VFX, el inventario global ni la publicación canónica.

Siguiente acción: auditar remoto fresco, separar este componente desde main, esperar todos los checks/workflows del head exacto, integrar con `expected_head_sha` y verificar ref/main/publicación por separado.
