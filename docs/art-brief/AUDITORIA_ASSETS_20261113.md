# Auditoría de assets cargados / no cargados / repetidos (2026-11-13 a 11-14)

Encargo del dueño: ver si quedaron assets en el juego que no sirven o que sirven pero no están conectados; clasificarlos,
avisar (el dueño decide qué se integra) y eliminar solo lo claramente basura. Hay mucho arte repetido.
Rama local `claude/la-horda-beta-audit-exec-mwv8x0`. Nada de esto se subió. Máquina: `docs/art-brief/candidatos-assets.json`.

## Resumen en una línea

El juego en sí está limpio: de los 3 401 archivos de `assets/`+`css/` que tiene versionados, el 99,8 % está pedido en ejecución,
citado por código o es el `.png` fuente de un `.webp` en uso. Lo pesado está en `art-source/` (1,5 GB) y `docs/` (828 MB),
que **no se descargan al jugar**, y casi todo eso está fijado por gates, recibos con hash o recetas. Lo único que cumplía la
regla dura de basura (duplicado byte a byte, sin cita por ruta ni por nombre, sin hash en manifiestos) fueron **53 capturas de
`docs/beta-release/` = 18,65 MB**, ya eliminadas (un commit, revertible). El «arte repetido» existe (124,7 MB de duplicados
exactos que quedan, 785 grupos) pero está fijado por gates/recibos: ver D.

## Método (qué se hizo de verdad)

1. **Inventario:** `git ls-files` de imágenes/audio/video/fuentes/PSD: **11 854 archivos, 2 508,4 MB**, con tamaño y sha256 de cada uno.
2. **Referencias estáticas:** índice de todos los archivos de texto versionados (7 574, 9,7 MB): para cada asset se buscó (a) su ruta
   completa o relativa, (b) su nombre de archivo, (c) su hash sha256 en manifiestos/recibos/inventarios (37 961 hashes distintos
   aparecen en texto), (d) carpetas ancestro citadas por herramientas/código, y (e) su clave (nombre sin extensión) en `js/`, `tools/`,
   `tests/`, `css/`. Se separó quién cita: runtime (`js/ css/ index.html sw.js …`), herramientas/tests/workflows, recibos de `art-source`, docs.
3. **Carga real (Chromium 1280x720, servidor propio, `tools/beta/lib.js` como base):** listener de `response` + hook de
   `drawImage`. Arranque a «Continuar» habilitado: **2 064 recursos**. Más **76 partidas cortas de ~7 s** (46 campeones × arena
   `bosque` + 30 combinaciones campeón × las 10 arenas, con autopiloto): total **2 128 recursos pedidos** (1 310 `.webp`, 235 `.png`,
   524 `.js`, 55 `.css`), de los cuales 1 544 son archivos versionados bajo `assets/`/`css/` (84,9 MB). 0 errores de consola, 3 × 404 (ver «Hallazgos»).
4. **Clasificación:** A en uso / B útil no conectado / C basura / D dudoso, con la regla dura del encargo (solo C con evidencia positiva).
5. Después de borrar: batería de comprobaciones y arranque comparado (más abajo).

## Conteos y MB por clase (sobre los 11 854 archivos; C ya eliminado)

| Clase | Archivos | MB | Qué incluye |
|---|---:|---:|---|
| **A1 en uso por el juego** | 3 401 | 279,3 | `assets/`+`css/`: pedidos en ejecución (1 495 «A_req» + audio), citados por ruta en código, `.png` fuente de un `.webp` pedido (1 310), carpetas con patrón dinámico (Códice `assets/ui/codex/champions/<clave>`: 92 MB que se piden al abrir el Códice). Audio (156 mp3, 5,7 MB): por `assets/audio/manifest.json`; **no medido en ejecución**. |
| **A2 fuente/evidencia fijada** | 2 993 | 1 273,5 | `art-source/` y `docs/` que un gate, test, receta, manifiesto/recibo con su sha256 o una herramienta (por ruta o por clave) usan. No están «en el juego» pero no son eliminables. Ojo: 2 176 están en A2 solo porque su hash figura en un recibo de entrega. |
| **B candidatos** | 8 (6 grupos) | 7,4 | Arte útil y no conectado: tabla abajo. |
| **C eliminado** | 53 | 18,65 | Capturas duplicadas exactas (lista abajo). |
| **D dudoso** | 5 399 | 929,6 | D1 `assets/` no pedido pero fijado por `ATLAS_ARTE` (6 archivos, 0,65 MB); D2 `docs/` capturas/evidencia sin cita fuerte (5 031, 715 MB); D3 `art-source/` citado solo por docs/recibos o por nada (362, 213,5 MB). |
| Total | 11 854 | 2 508,4 | (antes de eliminar) |

Peso de lo que descarga un jugador: solo `assets/`+`css/` (≈ 283 MB en el repo; 84,9 MB de ellos se pidieron en las pruebas, el resto es
`.png` fuente de los `.webp`, el Códice a demanda y audio).

## B — candidatos a integrar (NO se integró nada; decide el dueño)

Miniaturas en `docs/art-brief/auditoria-assets-miniaturas/` (360 px). «Esfuerzo» y «valor» son estimaciones mías, no medidas.

| ID | Qué es | Rutas | Miniatura | Valor | Esfuerzo | Riesgo | Qué falta | Recomendación |
|---|---|---|---|---|---|---|---|---|
| B01 | Tanque: grito/lanzar en 4 cuadros (gpt_image_2, `g1`, GENERATED_NOT_APPROVED) | `art-source/runway-designs/tanque/g1/master.png` + `receipt.json` | `b01_tanque_lanzar_g1.png` | medio | medio | medio: sin aprobar; la fila del registro tiene la nota vacía | aprobar a ojo, convertir con `tools/art/sheet-to-cells.py`, armar atlas, conectar clip en `js/champions/tanque.js`, gates | revisar; integrar o archivar |
| B02 | Tanque: caminatas desde video (ws1, wd3) + atlas candidato 448x1008 | `art-source/runway-video/tanque/candidate/atlas.png`, `ws1/clip.mp4`, `wd3/clip.mp4` | `b02_tanque_caminatas_atlas.png`, `…_preview.png` | medio-alto (caminatas del Tanque = pendiente conocido) | medio | medio: «cuadros muy parecidos»; el atlas no está instalado | revisión humana en reproducción, instalar, `check-tanque-*.js` | decidir junto con B01 |
| B03 | Ciudad: fachada completa `casa_a` (solo se integraron techo y pared) | `art-source/runway-world/ciudad/casa_a/master.png` + `receipt.json` | `b03_ciudad_casa_a.png` | medio (decorado) | medio | bajo-medio: sin aprobar | aprobar, recortar a escala de props, registrar en `arena-props.js`/`arena-world-art.js`, density gate | decidir; es decorado, riesgo bajo |
| B04 | Libertador: atlas candidato del Códice v1 (derivado por `build-libertador-codex.py`) | `art-source/runway-guardians/libertador/codex-v1-candidato/atlas.png`, `ref_frente/master.png` | `b04_libertador_codex_v1_atlas.png` | bajo-medio | medio | medio: el motor no lo carga; compite con el atlas v2 aprobado | decisión de arte | archivar o decidir aparte |
| B05 | Tanque: diseño f24 (solo diseño, sin poses) | `art-source/runway-guardians/tanque/f24_a5/master.png` | `b05_tanque_f24_a5.png` | bajo | alto | alto: no demuestra poses | regenerar poses | archivar |
| B06 | Ilkan: idle frontal de prueba | `art-source/runway-guardians/ilkan/intento1_idle_frente/master.png` | `b06_ilkan_idle_prueba.png` | nulo-bajo | – | – | – | archivar |

**Dato importante (corrección de lo que parecía B):** la definitiva de 4 cuadros del Libertador (`art-source/libertador-runway/atlas.png`) **ya está
instalada**: es byte a byte `assets/sprites/champions/libertador/v2/atlas.png` (sha 791cb61a…, commit 647a8b6b, re-aprobada el 2026-11-13).
`docs/art-brief/runway-pack/REGISTRO_RUNWAY.md` (fila `libertador_ult_poses_gpt2`) y `CHECKLIST_CAMPEONES.md:63` siguen diciendo «sin integrar / NO instalada»: están desactualizados.
No lo toqué (lo está trabajando otro agente en ese directorio); conviene sincronizarlo.

No hay en el repo skins, íconos ni efectos «huérfanos» listos: se revisó que las skins de `unique-skins`, `alpha-set-skins`, `skins_sets` y
`complete-skins` están registradas por clave en `js/assets/*-meta.js` o consumidas por `tools/art/*/build.py|extract.py`. Las entregas
(`art-source/entregas/*`) que no están integradas llevan estado explícito `FIX_NO_INTEGRAR` / `REVISION_NO_INTEGRAR` / `EN_CORRECCION`
(guerrero, libertador 24 poses, soporte, tanque rev.02, campeones-faltantes, Bront cierre-03 «no integrable», brakk-kit, veyra-kit,
habilidades-recientes, bloques B002): son trabajo rechazado o en corrección, no candidatos aprobables; van a D.

## C — eliminado (commit `2baa2837`, `git revert 2baa2837` lo deshace)

53 archivos de `docs/beta-release/` (`eval-captures/`, `eval2-captures/`, `eval3-captures/`, `menu-polish/`, `ui-beta/consejos/`,
`ux-arq-captures/`): **18,65 MB** (el peso en git es algo menor por la compresión). Evidencia por archivo:
(1) idéntico sha256 a otro archivo versionado que **se conserva** (38 grupos, cada grupo conserva ≥ 1; la lista «X == Y» está en el
mensaje del commit y en `candidatos-assets.json` → `deleted.items`); (2) `git grep -F` de su nombre en todo el texto versionado: 0 aciertos;
(3) ninguna ruta suya aparece en índices/manifiestos; su hash no figura en ningún recibo; (4) ningún test, gate ni workflow las lee por ruta
(solo las generan herramientas de captura que escriben en esas carpetas); (5) no son del juego: el arranque pide exactamente los mismos
2 072 recursos antes y después. Ejemplos: `eval-captures/mv-04-modos.png == menu-polish/C-antes-modos-mv.png`,
`menu-polish/A-before-pausa-844x390.png == menu-polish/C-antes-pausa-mv.png`.

Motivo de que sea tan poco: el criterio duro exige duplicado exacto o cero referencias; **casi todo está referenciado** por alguna de: ruta
en recibos/manifiestos (`art-source/entregas/*/entrega.json`…), hash en recibos, `docs/art/ATLAS_ARTE.json` / `docs/art-audit/*/inventory`,
gates con sha fijado, o una carpeta que un circuito lee entero.

## D — dudosos (no se eliminan)

Detalle por carpeta (178 entradas con archivos, MB y motivo) en `candidatos-assets.json` → `doubtful`. Los grandes:

| Grupo | MB | Duda |
|---|---:|---|
| `docs/beta-release/*` capturas (menu-polish 89,8; audit-art-enemigos 61; ui-beta 39,8; evidence 28,6; eval*-captures ~60; …) | ≈ 345 | Evidencia de auditorías/UX; ningún documento cita cada captura por ruta y el juego no las carga. Algunas las regenera una herramienta. Si se quiere liberar espacio, mover a un artefacto externo en vez de borrar. |
| `docs/art-gate/ability-art/**` (2 805 archivos) | 75,1 | Circuito Pintor→Evaluador→Arquitecto: `pipeline.py check` lee `baseline/` y `round-NN/` por carpeta (CI `ability-art.yml`). **33,0 MB son duplicados exactos** (p. ej. `nova*.png` idénticos entre 4 guardianes) pero borrarlos rompe el circuito. |
| `art-source/entregas/*-kit-*`, `*-codex-*` (≈ 900 MB en total) | ≈ 900 | Entregas con recibos y estado; **62,6 MB de duplicados exactos dentro de las mismas entregas** (`before/`, `after/`, `originals/`, `sources/`) fijados por hash/ruta en sus `SOURCE_REFERENCES.json`. |
| `art-source/unique-skins` | 35,9 | Fuente de las skins únicas ya integradas (se registran por clave). |
| `docs/ui-clarity/audit`, `docs/ui-factory/evidence`, `docs/art-brief/ejemplos`, `docs/production/art-unification` | ≈ 105 | Evidencia/ejemplos citados por carpeta desde docs y CSS/herramientas. |
| `art-source/runway-redraw/sprites/**/*.png.gen.png` | 14,7 | Salidas crudas de IA del Leviatán (costaron créditos), sin cita por ruta; son la única copia de lo generado. |
| `art-source/{ciudad,minas,abismo,portadores,complete-skins,fortaleza,guardian_elfico,battlefield}` | ≈ 70 | Láminas de origen de arenas/skins, citadas solo desde informes históricos `LA_HORDA_*.md`. |
| `art-source/captures/*` | 11,4 | Antes/después pedidos por el dueño (regla: no tocar). Hay copias idénticas `hielo_centro/hielo_piso` y `bosque_centro/bosque_piso` (1,3 MB). |
| `assets/` no pedidos (6) + 72 «HUÉRFANO» de `ATLAS_ARTE` no cargados (1,9 MB) | 2,6 | `micelial/mother/mp_body.png`, `mp_roots.png`, `soporte/v3/atlas.png` (fijado por workflows), `vfx/ciudad/cmRapImpact_3/4.png`, `vfx/minas/mnDarkZone_0.png`: nadie los pide en ejecución pero `docs/art/ATLAS_ARTE.json` y los inventarios los fijan (borrarlos rompe `build-art-atlas.js --check`). Lista completa en el JSON. Candidatos a limpiar **si el dueño regenera ATLAS_ARTE**. |
| `art-source/reference-atlas/enemies` (100 archivos, 0,9 MB; varios casi vacíos) | 0,9 | Salida regenerable de `build-reference-atlas-enemies.js` pero entrada de su `.py`. |
| `docs/art-recovery-aelith-20261102/native-contact.png` (87 KB) | 0,08 | Único archivo con cero referencias de todo el repo; una hoja de contacto de la recuperación de Aelith. No lo borré: hay un `native-capture.json` hermano y no hay duplicado que lo respalde. Candidato obvio si el dueño lo autoriza. |

Otros hallazgos: (1) `css/ui-factory/fx/hero/{ilsa,vorn,kora}.png` devuelven 404 al jugar con esos héroes: faltan sus atlas de marcos; `js/ui-factory/hud-feedback.js` lo tolera (marco genérico). Pre-existente, no causado por esta auditoría. (2) El archivo
no versionado `art-source/runway-codex-clean/` está en `.gitignore` (se regenera). (3) 524 `.log` y 126 `.gz` dentro de `art-source/entregas`: son texto/recibos, fuera de alcance de esta auditoría de imágenes.

## Comprobaciones después de eliminar (salidas reales)

| Comprobación | Resultado |
|---|---|
| `python3 tools/art/test-runway-pack.py` | `test-runway-pack: 9946 comprobaciones OK` |
| `node tools/visual-package/cli.js check` | `{"packages": 117, "candidates": 0, "errors": 0}` |
| `node tools/art/build-art-atlas.js --check` | `ATLAS_ARTE --check OK` (campeones CODEX_OK 12 / FALTA_ANIMACION 25 / ARTE_VIEJO 9; archivos CODEX_OK 871 / HUERFANO 104 / ARTE_VIEJO 30) |
| `python3 tools/art/webp_convert.py --check` | `webp desactualizados: 0` |
| `node tests/art-runtime-clips.test.js` | `{"status":"PASS", "lazy=0: 46 campeones OK", "lazy=1: 46 campeones OK"}` |
| `node tools/collection/check-collection.js` | `PASS collection: …32 previews/metadata, classification and cosmetic purity` |
| `node tools/art/roster_gate.js` (servidor local, puerto 8761) | `{"appearances":150,"scaleFailures":0,"presentationFailures":0,"errors":0}` (restauré `docs/art-gate/roster-sheet.png`, que el gate reescribe) |
| `node tools/quality/run-all.js --only qa-manifest-check` | «Nada que correr» (exit 2: no existe ese filtro); se corrió directo `node tools/quality/qa-manifest-check.js` → `OK: la clasificación coincide con la batería y con los workflows` |
| Arranque en Chromium antes vs después | mismo conjunto de recursos (2 072 = 2 072, `set ==`), 0 × 404, 0 errores de consola |

## Límites (lo no verificado)

- «Cargado» se midió con 77 corridas cortas (~7 s) del autopiloto; no se abrió el Códice, la tienda, ni se jugaron jefes/modos: los
  recursos de esas pantallas (p. ej. `assets/ui/codex/champions/*`, 92 MB) se clasificaron A por el patrón dinámico del código, no por haberlos visto cargar.
- El audio no se midió en ejecución (clasificado A por su manifiesto).
- «Cargado pero nunca dibujado»: el hook de `drawImage` vio 218 imágenes distintas dibujadas directamente, pero el motor pasa muchas
  por canvas intermedios, así que **no se puede afirmar** que un archivo pedido no se dibuje; no se usó para eliminar nada.
- «Útil / valor / esfuerzo» de B son estimaciones. La clasificación A2/D por referencias es heurística (rutas, nombres, hashes, claves); un
  archivo citado solo por clave dinámica construida en tiempo de ejecución podría haberse tomado por D.
- No se midió el ahorro real en `.git` (solo en árbol de trabajo). Multijugador y rendimiento no probados.
