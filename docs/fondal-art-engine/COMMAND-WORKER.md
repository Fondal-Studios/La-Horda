# Persistent production commands

Implemented in this branch, not certified as deployed. No claim of a complete autonomous art factory.

The Game Master **Fábrica de arte** tab accepts ordinary text, including dictation from the phone keyboard. Native phone dictation is not a custom browser speech recognizer and has not been tested on physical iPhone hardware. A user with MANAGE_CHAMPIONS can submit a command once and close the page. Work lives in the existing transactional operations store (PostgreSQL when configured; otherwise the existing data directory). Durable hosting of that store remains a deployment requirement.

Examples:

- `Reparar los últimos campeones`: Aelith, Morveth, Brakk, Veyra, Solciju.
- `Reparar angel_corrompido`: execute the existing qualified native recipe.
- `Reparar todos los assets`: enqueue the registered Codex champions and native recipes, not every map/UI/VFX asset in the game.
- `Crear un campeón de hielo con armadura rota y lanza`: an art request, not automatic executable kit code, registration or balance approval.

An operator can also submit from a terminal:

```sh
node tools/fondal-art-engine/command.js "Reparar los últimos campeones"
```

`FONDAL_ART_API` is the accounts API base; `FONDAL_ART_OPERATOR_TOKEN` is an existing privileged account session, passed privately as an environment variable. Use `FONDAL_ART_REQUEST_ID` to retry an uncertain submission with the same idempotency key. Never paste session credentials into chat or commit them.

## Worker

Run on a separate production machine with this repository and Python requirements installed:

```sh
node tools/fondal-art-engine/worker.js
```

`--once` processes at most one job. Configure `FONDAL_ART_WORKER_TOKEN` privately and identically on relay and worker, with at least 32 characters. This token is distinct from player sessions. The worker requests a lease, invokes an existing local provider, writes source/atlas/delivery/receipt files under `FONDAL_ART_OUTPUT`, and reports a result. It does not call ChatGPT or an LLM API. A service template is in `deploy/art-factory/`; it is not installed or activated automatically. Long operations send heartbeats. A crashed generation is marked interrupted instead of blindly submitting it again. Persisted receipts and ComfyUI prompt IDs support investigation without losing the generated source.

Native recipes execute today. Free-description generation requires `FONDAL_ART_PROFILE`: a locally reviewed ComfyUI API workflow, metadata (`meta`), model/license provenance (`provenance`), and `provider: "comfyui-local"`. A CLIPTextEncode text input must contain `{{description}}`. Repairs additionally require `inputDirectory` and the ID of a `LoadImage` node in `referenceNode`; the Codex sheet is copied into the shared ComfyUI input directory. The workflow must actually condition on that input and produce the complete RGBA sprite atlas described by `meta`. Merely connecting LoadImage is not evidence of reference adherence.

There is NO qualified model/profile supplied yet. Installing ComfyUI alone does not meet this requirement. The adapter permits only local non-API nodes and has been protocol-tested, not qualified on real model output. Without a profile, these requests explicitly become BLOCKED_MODEL. Existing profiles that cannot produce alpha, layout, native pixel density and coherent animation must be corrected; validators never fabricate success.

## Evidence and limitations

`node server/test-art-factory.js` uses an isolated real account server, persistent file storage, an independent worker subprocess, the actual Python native generator and PNG validators. It proves privileged submission, rejection of ordinary-player/invalid-worker access, duplicate suppression, real 108590-byte PNG generation and REUSED detection against the approved angel atlas. A new-champion request correctly reports BLOCKED_MODEL. It does not prove novel generative art, public deployment or autonomous artistic approval.

Queue success never publishes into production. AWAITING_VISUAL_REVIEW requires hash-bound review and real runtime tests before existing promotion/release tooling may install it. No new champion mechanics are generated or bypassed. Automatic repair retries, novel-model qualification, all-asset coverage, delivery of artifacts from worker to deployment, and fully unattended publication remain unfinished.
