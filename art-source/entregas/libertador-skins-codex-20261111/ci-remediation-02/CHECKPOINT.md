# Libertador skins Códice — remediación CI 02

Estado: **EN_CORRECCION / PENDING_CI / NO_INTEGRAR**.

El workflow `Champion entry balance` del head `fb9968f8708da67843113521744b7850152c7de0` validó atlas, contratos, lanes, Safari, relay y 89 pasos del job `entry-reference`, pero el roster gate detectó cinco vistas por debajo de la referencia corporal de 59 px. El fallo es artístico y reproducible; no se mergea.

Se recalcularon exclusivamente los factores de normalización de las dos apariencias autorales a partir de las mediciones reales del renderer. Los atlas, frames, caballos, mecánicas, red y demás apariencias permanecen byte a byte intactos.

Próximo paso: ejecutar todos los workflows del nuevo SHA exacto. Si `roster_gate` y el resto de gates pasan, revisar head/main frescos, retirar FIX y hacer merge normal con `expected_head_sha`.
