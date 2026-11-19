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
