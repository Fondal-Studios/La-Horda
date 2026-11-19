# REVIEW — B002 Tanque direccional 01

Estado: **EN_CORRECCION / FIX / NO_INTEGRAR**.

Referencia obligatoria: `assets/ui/codex/champions/tanque.png` (Aldric, frente/lado/espalda).

## Revisión visual efectiva

- La fila frontal de lanzamiento y muerte se conserva byte por byte.
- Las filas nuevas mantienen cabello castaño, bufanda/capa azul, armadura plata y oro, escudo azul con estrella y espada corta.
- Lado: escudo, cuerpo, espada y capa mantienen profundidad coherente durante el gesto y la caída.
- Espalda: la capa y el emblema siguen visibles; la caída termina tendida, no en reposo.
- Los 24 cuadros nuevos tienen alfa binaria, ancla de pies/suelo consistente y ningún recorte de borde.

La hoja de contacto es evidencia diagnóstica. Falta el gate del renderer real a escala de gameplay; por eso las fuentes no se declaran integradas.

## Corrección 02 — densidad canónica
El CI del head `79ed841b` validó las 12 celdas de muerte y detectó `ILUSTRACION` en lanzamiento lateral 1:2 y las cuatro celdas traseras de la fuente 01. Se conserva esa fuente como intento fallido. La fuente 02 se generó nuevamente desde `assets/ui/codex/champions/tanque.png` con clusters duros de 1 píxel y paleta limitada; queda GENERADA y pendiente del gate exacto. No se modificaron umbrales, mecánicas ni la fila frontal aprobada.

## Corrección 03 — reutilización nativa
La fuente 02 también falló el detector canónico en las mismas cinco celdas y queda preservada como intento rechazado. La auditoría de `hoja_36poses.png` confirmó que Aldric ya posee ataques laterales y traseros integrados en los cuadros 16–23. El candidato 03 reutiliza esos píxeles nativos sin escala ni filtros dentro de las celdas de lanzamiento; la fila frontal y muerte permanecen exactas. Estado: candidato pendiente de CI y revisión real, no integrado.

## Corrección 04 — fuente nativa Codex-v1
La auditoría separó `assets/sprites/champions/tanque/codex-v1/atlas.png` de la hoja histórica suavizada. Sus cuadros 16–23 conservan la identidad exacta del Códice y pasan individualmente el criterio canónico (suavidad 0–0,002; ruido 112–168). Se reutilizan sin escala ni edición dentro del atlas de lanzamiento. El candidato queda pendiente del workflow exacto y revisión real; no está integrado.
