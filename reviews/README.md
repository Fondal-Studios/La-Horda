# Registros de revisión independiente

Un archivo por rama de agente: `reviews/<rama con / reemplazada por __>.json` (p. ej. `reviews/claude__s1-economia-topes.json`).
Los escriben **revisores** (QA, arquitecto, integrador, director) desde ramas `review/…`; **ningún agente A/B/C/D puede tocar esta carpeta** (lo hace cumplir `tools/agents/check-diff.js` y la propiedad de archivos).

Formato, etapas y reglas: `docs/arquitectura-compartida/REVISION_INDEPENDIENTE.md`. Verificador: `node tools/review/check.js`.
Plantilla: `reviews/TEMPLATE.json`. Un registro deja de valer apenas la rama recibe un commit nuevo (la evidencia debe citar el SHA exacto).
