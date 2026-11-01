# Arquitectura S0F

```
Códice ─┐
        ├─► tools/factory/s0f/contract.js  (contrato real por campeón, lee js/assets/*.js)
Motor ──┘            │
                     ▼
        tools/factory/s0f/s0f.js  (plan → pedidos → ensamblado → atlas → validate → preview → approve → integrate)
                     │ usa
        ┌────────────┼───────────────────────────────┐
        ▼            ▼                               ▼
 fondal-art-engine/  fondal-art-engine/        tools/factory/art_factory.py
 providers-s0f.js    spend-guard.js            assemble · build-atlas · evaluate-candidate · preview · refstrip
 (BFL FLUX.2, OpenAI) (topes, caché, libro)    (+ auditor/director/evaluador/reconstrucción de Art Factory 2.0 y el endurecimiento de #255)
        │
        └─ providers.js / bfl-provider.js (ensayo US$ 5 del PR #232): intactos
```
* **Una sola fábrica.** CLI: `tools/factory/cli.js`; motor de producción nativo y worker: Fondal Art Engine; evaluación: `art_factory.py`.
* **Fuera del camino de ejecución del juego.** Todo es herramienta de desarrollo (Node/Python); el cliente no carga nada nuevo → costo de render/memoria/carga del juego: **0**.
* **Datos** en `art-source/factory-jobs/<id>/<corrida>/` (no se versionan por defecto salvo el piloto). Los originales siguen intactos; la integración usa ruta nueva `codex-v2/`.
* **Seguridad:** claves solo por entorno; el libro de gasto no guarda claves (probado); la descarga de imágenes no envía la clave; URLs de sondeo restringidas a `api*.bfl.ai`.
* **No tocado:** `server/relay.js`, protocolo de red, `contracts/v1/**`, formato de guardado, `index.html` (en esta rama; la capa Beta ya fusionada sí lo editó: ver auditoría P1-3).
