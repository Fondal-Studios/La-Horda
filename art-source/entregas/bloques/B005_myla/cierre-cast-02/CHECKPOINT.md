# B005 Myla — cierre cast 02

Estado: **EN_CORRECCION / FIX / NO_INTEGRAR**.

- Base fresca auditada: `main` `2e51ebdb13a101a574a43089809a0c10c788a6fb`.
- Head remoto previo preservado: `97bda1b5d23e7757e6d8dbe82cd86592c2535f2d` (PR #297, draft).
- Rama reconciliada localmente con `main`; no se revirtió trabajo concurrente de PR #299.
- Corrección: el suplemento `myla_cast` sólo entra con `attackAnim > 0`; evita resolver el estado `idle` inexistente cuando la marca de lanzamiento queda activa al terminar el ciclo.
- Inventarios actualizados: `ATLAS_ARTE`, `ATLAS_VIGENTE` y `visual-packages/manifest.v1.json`.
- Nuevo: contrato determinista 8/8 PASS, visual-package 6/6 PASS, atlas estático PASS, sintaxis y diff-check PASS.
- Histórico: el head anterior tuvo 12 checks SUCCESS y 3 FAIL; dos eran inventarios desactualizados y uno fue `DIFF myla ERROR Cannot read properties of null (reading 'arr')`.
- Bloqueo actual: Chromium local aborta por `socket() failed: Operation not permitted`; faltan capturas gameplay reales móvil/escritorio y confirmación del workflow exact-head nuevo.
- No merge ni publicación. El atlas sigue clasificado `ARTE_VIEJO` porque este cierre sólo reemplaza el lanzamiento base, no el cuerpo completo de Myla.

Siguiente acción: subir este cierre, observar todos los checks del SHA exacto y mantener draft/FIX hasta contar con capturas reales y Art Gate visual.
