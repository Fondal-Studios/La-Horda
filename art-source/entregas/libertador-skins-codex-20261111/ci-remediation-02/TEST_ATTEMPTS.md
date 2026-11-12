# Intentos

- `Champion entry balance` run 988, job `entry-reference` 130887754643: **FAIL esperado y conservado**.
- El mismo job pasó `build-art-atlas --check`, contratos de arte, Pintor/forja, renderer, navegador, red y administración antes de fallar en el roster gate.
- Fallo exacto: `appearances=150`, `scaleFailures=5`, `presentationFailures=0`, `errors=0`.
- `QA regresion central` run 147: **SUCCESS**.
- Validación local de esta remediación: `node --check js/data/champion-art-normalize.js` y `git diff --check`: **PASS**.
- La validación visual/render del candidato queda pendiente del CI del nuevo SHA; no se hereda aprobación del head fallido.
