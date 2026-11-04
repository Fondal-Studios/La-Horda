# Thalen Códice — corrección de escala 01

Estado: **EN_CORRECCION / NO_INTEGRAR**.

El roster gate del head `d8bf8afc3a09dc09b3893383e5410b39d0ef42d6` cargó las tres vistas reales del candidato y encontró un único grupo directo de fallos del componente: frente/perfil 56 px y espalda 55 px frente a la referencia de 59 px. Los pies coincidieron en -2 y no hubo fallos de presentación.

Se cambió únicamente `mago_codex.refH` de 100 a 94. La proyección basada en la medición real queda en 60/60/59 px; los deltas redondeados esperados son +1,69%, +1,69% y 0%, dentro de la tolerancia existente. No se modificaron píxeles, anclaje, hitbox, frames, skins, fallback, balance, mecánicas ni red.

Pruebas locales nuevas: sintaxis PASS, contrato de 21 mappings PASS, hash del atlas idéntico y proyección de escala PASS. Falta la confirmación del roster gate remoto del SHA exacto y todos los gates visuales/jugables ya documentados.
