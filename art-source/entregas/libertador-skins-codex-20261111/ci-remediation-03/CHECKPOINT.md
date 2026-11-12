# Libertador skins Códice — remediación CI 03

Estado: **EN_CORRECCION / PENDING_CI / NO_INTEGRAR**.

El head `a68447ef63635b3cb2bdf49329ec1af1b189e106` pasó 14 workflows actuales, incluidos QA central, motion component, Art production evidence, renderer, economía y lanes. `Champion entry balance` se detuvo antes del roster gate porque el cambio deliberado de normalización alteró la huella de fuentes de `ATLAS_ARTE`.

Se recuperó el head remoto después del reciclado del scratch. Se actualizó únicamente la huella determinista del registro; el contenido runtime, recuentos, atlas, dimensiones y bytes permanecen iguales. `node tools/art/build-art-atlas.js --check` vuelve a pasar.

El fallo independiente `LAB.los_bots_resuelven_en_orden` de Integración se conserva y se reevalúa en el nuevo SHA; no se tocó la IA, las arenas ni sus gates.

Próximo paso: CI completo del nuevo head, incluyendo el roster gate que debe validar la corrección de escala. No mergear mientras el PR sea draft/FIX.
