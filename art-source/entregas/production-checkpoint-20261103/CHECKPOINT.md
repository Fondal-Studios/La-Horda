# La Horda — checkpoint de producción de arte (2026-11-03)

## Estado remoto verificado

- `main` está en `54aa936fa254112044e29493179893dd0f8694d6` (commit firmado/verificado del 2026-11-02).
- PR #244 (`9d6ad0a63029a29a0af3655e42793f692f22cf9a`) está mergeado y es ancestro de `main`: Ruinas/Bosque y Gélida/Hielo, 32 cuadros, consumidor real y fallback. Evidencia histórica: 12/12 controles limpios, 32/32 cuadros no vacíos, revisión antes/después escritorio+móvil y handlers anfitrión→invitado; no se afirmó relay WebSocket vivo.
- PR #245 (`e194910bddf5d976778e1e8e949e3d440d71fc2d`) está mergeado y es ancestro de `main`: Axiom base + Sistema + Código Ámbar, 36 cuadros por apariencia, 3/3 apariencias revisadas, 40 capturas en seis arenas y escritorio/móvil, 63 celdas de siete estados y tres direcciones. El contrato de red pasó; no se afirmó partida de dos clientes ni publicación canónica.
- La comparación de commits confirma que `main` está 15 commits delante de #244 y 13 delante de #245, con `behind_by=0` en ambos casos.
- PR #239 sigue abierto: sus 12 poses Axiom son `FIX_NOT_APPROVED`; no están instaladas ni conectadas al renderer.
- PR #194 está mergeado, pero contiene fuentes candidatas de cinco habilidades de Axiom, todas `EN_CORRECCION/FIX_NO_INTEGRAR`; no constituye un kit de habilidades integrado. `docs/production/CORRECTION_BATCH.json` mantiene B430/B111/B112/B113/B009 abiertos.
- PR #231 queda preservado; no se modificó.

## Continuidad de prioridades

La prioridad de Nano del 29/10 era: arenas Ruinas/Bosque y Gélida/Hielo → Axiom y todas sus apariencias → campeones/guardianes pendientes. Los dos primeros frentes ya están integrados en `main`. El siguiente héroe de la secuencia previa es **Thalen, el Tejedor Elemental**, con atención especial a la vista de espalda y a mantener la identidad del Códice en las animaciones.

No se encontró rama remota `art/ismara-codex-20261029`, ni ramas/PR de Thalen en las búsquedas de este pase. Los directorios locales `/workspace/scratch/a7400531ffc7/arena-recovery` y `/workspace/scratch/a7400531ffc7/la-horda` no existen en el entorno actual. Se conserva la instrucción previa del dueño: **no subir Ismara; continuar con el siguiente héroe**. No se asumió que el candidato local de Ismara persistiera ni se lo reconstruyó sobre una suposición.

## Thalen — intento de esta pasada

Referencias remotas existentes: `assets/ui/codex/champions/mago.png` y `assets/sprites/champions/mago/atlas.png`. Brief: `docs/art-brief/campeones/mago.md`. La inspección de código encontró `BACK_HEAD.mago = "h"` y `FACE_LETTERS.mago = []` en `js/rendering/pixel-sprites.js`; no se cambió porque todavía falta comparar visualmente el Códice y el atlas real a escala de juego.

Se generó una hoja exploratoria de 12 poses de espalda. **RECHAZADA / GENERATED_NOT_APPROVED**: archivo generado `a_clean_transparent_background_sprite_sheet_in_a_p.png`, SHA-256 `4bbf2ecff85d20ca8217fad237348ff9cb6f96f5597ed077282581709dfb7990`, 1448×1086 RGBA. Conteo alfa: 870878 píxeles alfa 0, 585 alfa 255 y 701065 semitransparentes. Falla el contrato binario 0/255 y no constituye el atlas 36 poses/112×112. No se instaló, no reemplazó originales y no se usó ningún filtro para ocultar el fallo. La fuente generada permanece como adjunto de esta conversación; no se incorpora al set visual del repositorio.

## Inventario y limitaciones documentales

- `art-source/entregas/control_produccion.json` es una instantánea del 2026-10-19: 1244 entradas, 27 resueltas y 1209 pendientes; no refleja los merges #244/#245.
- `docs/production/ASSET_BLOCKS.md` conserva 1217 tareas abiertas y un orden B002/B003/B004/B005 anterior a la prioridad actual. No se reescribió su historia ni se restaron tareas por mera existencia de PNG.
- `docs/production/CORRECTION_BATCH.json` está fechado 2026-10-29 y mantiene las cinco fuentes FX de Axiom en corrección.
- `art-source/entregas/bloques/plan_bloques.json` existe en el árbol remoto, pero el conector devolvió contenido vacío tanto en lectura completa como por rangos de líneas; queda pendiente recuperar esa fuente por un canal que entregue el contenido real. No se infirió su contenido.

## Trabajo concurrente que se preserva

- PR #241 sigue abierto, 60 archivos, base antigua `6edcd9b...`, con recuperación de Aldric/Kael/Aelith/Morveth. No se fusionó ni se retargeteó; requiere cotejo con `main` actual.
- PR #267 sigue en borrador para una corrección acotada de Aelith. Su propio informe declara 8 workflows PASS y 2 FAIL; no se fusionó.
- PR #266 es una evaluación de UI separada y sigue en borrador. No se tocó.
- No se modificaron balance, mecánicas, cuentas, cobros, red ni infraestructura.

## Próximo paso

1. Recuperar y comparar visualmente el PNG exacto del Códice de Thalen y el atlas actual, ambos a tamaño nativo y a escala real de gameplay.
2. Corregir únicamente las poses traseras defectuosas (o producir el conjunto trasero completo si el diagnóstico lo exige), preservando el atlas original hasta aprobar el reemplazo.
3. Exigir celdas 112×112, línea de pies 106, contorno oscuro de 1 px, 2–3 tonos por material, alfa exclusivamente 0/255 y silueta conectada.
4. Guardar fuente, prompt, receta reproducible, atlas, manifiesto SHA-256, consumidor real y capturas antes/después; luego ejecutar gates nativos/estilo/escala, matriz de apariencias, escritorio+móvil, pruebas de renderer y cooperativo según alcance, y CI del head exacto.
5. No declarar Thalen terminado por este checkpoint. No avanzar a skins hasta cerrar su kit base de sprites/animaciones.
