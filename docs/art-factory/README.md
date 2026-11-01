# Art Factory 2.0 (S0D)

Extensión de `tools/factory` (no es una segunda fábrica): `tools/factory/art_factory.py` orquesta lo que ya existía
(`style_gate`, `roster_gate`, `pixel-density`, `repair-outline-gaps`, `import-authored-sheet`, el Pintor) y suma lo que faltaba.

| Módulo | Comando | Qué hace de verdad | Salida |
|---|---|---|---|
| Auditor | `audit` | 3.270 imágenes: tipo, tamaño, hash (duplicados), referencias en el código, rotas, incompatibles de densidad (reusa `docs/art-gate`), provisionales documentados, campeones y skins | `inventory.json`, `INVENTARIO.md`, `FALTANTES_PRIORIZADOS.md` |
| Director artístico | `director` | Rangos medidos de las hojas aprobadas (Master Reference = Tanque + 8 del roster): contorno, degradé, detalle, sombreado, contraste con el suelo de Ruinas; paleta top-24; reglas de luz/proporción/animación; páginas del Códice de referencia | `ART_DIRECTION_REFS.json` |
| Productor | `reconstruct` | Reparaciones **deterministas** (alfa duro, contorno, luz de borde) sobre **copias**; respalda el original por hash en `art-source/factory-originals/` | `candidates/`, `ledger.json` |
| Evaluador | `evaluate`, `batch` | Puntaje 0-100 (alfa 20, estilo 30, animación 20, legibilidad sobre el suelo de Ruinas 20, integridad 10) y defectos críticos. **Calibrado**: debe aprobar la referencia (Tanque) | `evaluation_batch.json` |
| Reconstrucción | `reconstruct` | Hasta 3 intentos con estrategias crecientes; al tercer fallo cambia de estrategia y **escala** al director (no compra ni simula arte) | `ledger.json` (`ESCALADO`) |
| Arquitecto de integración | `integrate` | Dimensiones, mismo conjunto de archivos, alfa, peso; marca «apto técnico». **No instala nunca**; la aprobación de S0C queda `PENDIENTE` | `ledger.json` |

Pruebas: `python3 -m unittest tools/factory/test_art_factory.py` (6: el evaluador aprueba la referencia, marca alfa roto como crítico,
la reparación conserva píxeles, el original no se toca y queda respaldado, 3 fallos escalan, la fábrica no instala).

## Resultado de esta corrida (2026-11-01)
* **Inventario:** 3.270 imágenes (vfx 1.362 · campeón 883 · arena 407 · enemigo 348 · jefe 190 · ui 79), 0 referencias rotas, 2 grupos de duplicados exactos, 0 ilegibles.
* **Evaluación por lote** (campeones, enemigos y jefes; 231 sets de cuadros): **209 aprueban, 22 no, 6 con defecto crítico** (`evaluation_batch.json`).
  Los 6 críticos son hojas heredadas de gran formato con bordes suaves (Libertador v2, cromas del Tanque), 1 cuadro de Musashi y 1 del Hechicero con la silueta tocando el borde: **requieren revisión humana**, no son reparables por filtro.
* **Slice Beta (Ruinas · Sylva):** Sylva 100/100, Dama del Bosque 99,5, Duende 92,5 → sin cambios necesarios. **Bestia del Bosque 72,5 → 3 intentos → ESCALADO.**
  Hallazgo probable de falso positivo: el motor ya agrega contorno de 1 px en ejecución (`packOutlined`, `enemy-sprites.js`) y los cuadros `walk1/walk5` tienen 15-16 px de margen inferior (fotogramas de salto del galope). Lo decide el director con una prueba en juego.
* **Aprobados e integrados: 0.** Ningún candidato cumple evaluador + arquitecto general (S0C no disponible). Ver `BLOQUEOS.md`.

## Entrega segura a S0C (rama de integración, sin instalación)

La rama `fix/art-factory-safe-integration` reúne S0E/S0C y S0D sin modificar sus ramas.
Su PR se dirige a `s0e/s0c-conditions`: primero se revisa este parche; luego S0E → S0C →
`beta/integracion`. No integrar S0D directamente a `main` como si ya tuviera la arquitectura.

`reconstruct` registra hashes por ruta del original y del candidato evaluado. `integrate`
exige conjuntos de PNG idénticos y no vacíos, dimensiones exactas, alfa, peso, hashes vigentes,
y repite la evaluación actual (≥90, sin críticos). Un ledger anterior sin hashes **no aprueba**:
se debe reconstruir y revisar de nuevo. Ninguna cadena de aprobación guardada en el ledger
constituye una firma: el resultado S0C siempre vuelve a `PENDIENTE`.

Desde un árbol limpio y una rama con commit, después de reconstruir/registrar el candidato:

```sh
python3 tools/factory/art_factory.py integrate ID
node tools/factory/art-handoff.js ID sprite_sheet > /tmp/ID-handoff.json
```

El segundo comando reejecuta el gate y produce un paquete de revisión con el SHA exacto,
la ruta de `reviews/` correspondiente y objetos **ArtAsset v1** validados con el contrato S0C.
`asset.path` es el destino propuesto en `assets/`, mientras `candidatePath` identifica los bytes
fuera del runtime. Hash y dimensiones describen esos bytes candidatos, no el asset instalado.
La procedencia `procedural` describe la reparación determinista. No se escribe en `assets/`.
Densidad se marca conservadoramente `fail` (pendiente de medición, no un fallo visual observado),
y estilo/emoji `not_run`: un score heurístico no inventa pases de otros gates.
`eligibleForInstallation` e `installed` permanecen **false**. Es un puente de entrega y revisión,
no un instalador ni una aprobación humana. No existe todavía un candidato aprobado para demostrar
un reemplazo visual en el motor; generador externo, evaluación visual/runtime y revisiones
independientes siguen pendientes.

Pruebas: `python3 -m pip install -r tools/factory/requirements-test.txt`,
`python3 -m unittest tools/factory/test_art_factory.py`, `node tools/factory/test-art-handoff.js`.
Ambas suites corren en CI; el puente también integra la batería central de Node.
