# Pipeline de generación real (Art Factory 3.0 / S0F)

Extiende `tools/factory` y el Fondal Art Engine; no hay fábrica paralela.

```
Códice (página + tira de poses actuales) → contrato real del motor → plan de pedidos (tiras ≤ 4 poses por clip) → proveedor (BFL / OpenAI, con tope y caché)
  → ensamblado por contrato (separa poses, escala uniforme a refH, ancla pies, alfa 0/255) → atlas candidato (el resto se HEREDA y se declara)
  → evaluador (10 comprobaciones) → vista previa a escala real → revisión humana → integración en ruta NUEVA → registro y revisión en el PR
```

## Comandos (CLI existente `tools/factory/cli.js`; los anteriores no cambian)
```bash
node tools/factory/cli.js generate champion cazadora --provider bfl,openai --dry-run   # plan y costo máximo, sin red ni gasto
node tools/factory/cli.js generate champion cazadora --provider bfl,openai --max-task-cents 25 --max-batch-cents 325 --max-day-cents 500
node tools/factory/cli.js generate skin cazadora <nombre_de_skin>
node tools/factory/cli.js generate animation cazadora walk_down
node tools/factory/cli.js validate cazadora      # GENERATED → VALIDATED solo si ≥ 90 y 0 críticos
node tools/factory/cli.js preview cazadora       # hoja ACTUAL vs CANDIDATO a escala real sobre el suelo de Ruinas
node tools/factory/cli.js approve cazadora --reviewer <nombre>   # aprobación humana (exige VALIDATED)
node tools/factory/cli.js integrate cazadora     # exige APPROVED; copia a assets/.../codex-v2/ (nunca sobrescribe)
node tools/factory/cli.js status cazadora
```
Variables: `BFL_API_KEY` y/o `ART_GEN_API_KEY`/`OPENAI_API_KEY` (secretos del entorno, nunca en el repo), `FONDAL_SPEND_LEDGER` (ruta absoluta del libro de gasto), `FONDAL_JOBS_ROOT` (por defecto `art-source/factory-jobs`), `FONDAL_OPENAI_IMAGE_MODEL`.

## Estados (no se confunden)
`PLANNED` (solo plan) · `GENERATED` (hay píxeles del proveedor; **no** implica calidad) · `VALIDATED` (evaluador automático ≥ 90, sin críticos) · `APPROVED` (humano, con hash del atlas) · `INTEGRATED` (copiado a ruta nueva; el registro lo hace el PR) · `BLOCKED` (con motivo: `BLOCKED_CREDENTIAL`, `BLOCKED_CREDIT`, `BLOCKED_CONTRACT`…). Código de salida 3 si queda BLOCKED.

## Contrato real, no «36 poses»
`tools/factory/s0f/contract.js` lee `champPackLoadAtlas("<id>", …)` del motor: celda, columnas, `refH`, anclaje y clips. Sylva: celdas 192×160, 4 columnas, 13 filas, **52** cuadros; Libertador tiene otro. Un campeón sin registro literal (p. ej. Tanque, con cuadros sueltos) queda `BLOCKED_CONTRACT`: la fábrica no asume nada.

## Control de gasto, caché, reintentos, concurrencia, fallback
* `SpendGuard` (`tools/fondal-art-engine/spend-guard.js`): topes **por tarea, por lote y por día**, reserva **antes** de cada POST facturable, sin reembolso de pedidos inciertos, una tarea no se reserva dos veces.
* Caché por hash de (proveedor, modelo, prompt, hashes de referencias, parámetros): repetir no gasta.
* Reintentos: solo ante **429** (significa «no procesado»); un POST con respuesta perdida o 5xx **no** se reenvía.
* Concurrencia: pool configurable (`--concurrency`, por defecto 2; BFL admite hasta 24).
* Fallback: `--provider bfl,openai` prueba el siguiente si el primero está BLOCKED; si todos lo están, el resultado es BLOCKED, nunca un éxito simulado.
* Registro: cada pedido deja `plan.json`, `estimate.json`, `state.json` (historia), `assembly.json`, `evaluation.json`, hashes y el libro de gasto (sin claves).

## Reparación localizada
Si una tira no se puede ensamblar (cantidad de poses incorrecta), solo **esa tira** queda en `failures` y se reintenta sola; no se reconstruye el atlas entero. Los cuadros no generados se heredan del atlas actual y la cobertura se informa.

## Evaluador (ampliación de `art_factory.py`: `evaluate-candidate`)
Dimensiones · alfa binario · siluetas cortadas · cuadros vacíos · estilo vs rangos del roster (contorno, degradé, detalle, sombreado) · paleta vs sprite actual (y vs página del Códice, informativa) · pies estables y altura constante por clip · escala vs sprite actual (regresión de proporciones) · consumidor registrado. **Limitaciones:** no juzga fidelidad al Códice ni calidad de animación; `requires_human_art_review` es siempre `true`. Calibrado: el atlas actual de Sylva obtiene 100/100.

## Pruebas
`node --test tools/fondal-art-engine/*.test.js tools/factory/s0f/*.test.js` (52 pruebas, incluye SpendGuard, proveedores con API simulada y el pipeline completo con un proveedor FIXTURE de pruebas que **no es IA y no se usa como evidencia**), `python3 -m unittest tools/factory/test_art_factory.py tools/factory/test_art_generator.py`.
