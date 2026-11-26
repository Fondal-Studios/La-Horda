# CHECKPOINT — Guerrero Códice corrección muerte 01

Estado: **FIX_NOT_APPROVED / NO_INTEGRAR**. Se ejecutaron dos correcciones agrupadas sobre la fuente remota original, usando como referencias obligatorias `assets/ui/codex/champions/guerrero.png` y `assets/sprites/champions/guerrero/codex-v1/atlas.png` SHA-256 `03b1f0c853f2ef49cc42654b05c4eac6c2e5f8ed66678a113230bc9860a8d77d`.

Ambos intentos conservan doce poses y una identidad preliminar coherente, pero fallan el requisito técnico: 547003 y 490658 píxeles con alfa parcial, respectivamente, y cero píxeles plenamente opacos. El velo borgoña/negro continúa. Cero cuadros aprobados, cero assets instalados y cero cambios runtime. No se aplicaron filtros ni umbrales para simular calidad.

El lanzamiento direccional permanece reconciliado con el fallback ya existente; no se reabre. Próximo paso: generación materialmente distinta con figuras aisladas desde el inicio, no otra extracción del mismo fondo. Luego extracción nativa, secuencia, Nocturno, móvil/escritorio y relay antes de integrar.
