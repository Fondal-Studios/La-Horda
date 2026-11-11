# Auditoría fresca — Libertador Códice

Estado: **AUDIT_ONLY / sin cambios de runtime ni assets instalados**.

Main auditado: `7a2ffd8c04161faf46963d4d9ee60c716047ed8a`.
Referencia exacta: `assets/ui/codex/champions/libertador.png`.

## Hallazgo

El cuerpo Códice sí está instalado. Los bytes de `v2/atlas.png` y `v2/horse.png` coinciden exactamente con `art-source/runway-guardians/libertador/atlas-candidato/`. La etiqueta documental `viejo` describe deuda de animación/cobertura; no demuestra ausencia del cuerpo Códice.

No hay PR abierto de Libertador. El retiro de PR277 en `69b8e13` fue seguido por la reinstalación con guardas en `9e0b208`; ambos commits y la reparación posterior `1fa7ccc` son ancestros del main auditado.

## Pendiente real

- completar estados de acción donde la base conserva animación procedural limitada;
- cerrar `libertador_escarcha` y `libertador_ancestral`, hoy con atlas autorales incompletos para ataque/conjuro/definitiva;
- preservar el pack completo Granadero y todas las fuentes históricas.

## Próximo paso

Reconciliar las dos skins existentes contra la plantilla exacta del Códice, sin regenerar el cuerpo base ni abrir un taller duplicado. Después: consumidor real, escritorio/móvil, apariencias, arenas, relay, Art Gate y CI del SHA exacto antes de integrar.
