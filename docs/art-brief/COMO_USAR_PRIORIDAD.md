# Cómo usar la prioridad de arte (procedimiento de la tarea programada)

Fuente de verdad: `docs/art-brief/prioridad-assets.json` (esquema en su `_leyenda`). Vista legible: `PRIORIDAD_ASSETS.md` (generada; no se edita a mano). Evidencia visual: `docs/art-brief/prioridad-capturas/`.

## Procedimiento (una tarea por ejecución)

1. `python3 tools/art/prioridad-assets.py --next` imprime la próxima tarea: primer ítem CRÍTICO `pendiente`, no `humano`, con dependencias listas; si no quedan críticos pasa a importantes y luego secundarios.
2. Saldo de Runway: `node tools/art-world/runway-world.js status`. **Si el saldo es < 250 no se gasta Runway**: usar `python3 tools/art/prioridad-assets.py --next --saldo <N>` (o `--gratis`), que solo ofrece ítems de 0 créditos (integraciones con pintor determinista, FX/íconos por código). Si no hay ninguno, terminar la ejecución sin gastar.
3. Antes de generar, leer la ficha completa (`--id <id>`), su `nota` y los intentos rechazados de `REGISTRO_RUNWAY.md` («NO REPETIR»). Seguir `runway-pack/RECETA.md` y el método del ítem.
4. **No regenerar** nada marcado `duplicado_de:<id>`, `hecho` o `instalado_sin_aprobar`: la sección «DUPLICADOS» del .md dice qué ya existe. Si dos filas piden el mismo arte, se hace una sola vez (la del ítem canónico).
5. Al terminar: registrar el gasto en `docs/beta-release/ART_CREDITS.md` (y `runway-ledger.py` / `champ-checklist.py` si aplica), marcar con `python3 tools/art/prioridad-assets.py --set <id> hecho` (o `instalado_sin_aprobar` si quedó instalado pero falta revisión humana; `--nota "texto"` opcional) y correr `python3 tools/art/test-runway-pack.py`.
6. Lo que necesita decisión o aprobación humana (`bloqueado_decision`, `instalado_sin_aprobar`, método `humano`) no lo toma la tarea: se deja anotado.
7. Si cambia `asset-blocks.json` (bloque nuevo), `--check` falla con «bloque … sin dueño»: correr `python3 tools/art/prioridad-seed.py --merge` y reclasificar el ítem nuevo.

Comandos: `--check` (sincronía y cobertura: 731 bloques / 1244 entradas, 95 filas de Runway, 104 criaturas, 46 campeones), `--id`, `--next`, `--set`.
