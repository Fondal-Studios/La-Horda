# Authorized painter trial — 2026-10-28

User authorized connecting the proposed external painter and a maximum USD 5 TOTAL trial, no subscription or automatic renewal. This is not USD 5 per champion. No BFL request or purchase has been made: actual pilot preflight returned BLOCKED_CREDENTIAL, spent_usd: 0.

Implemented: `bfl-klein-trial` provider, shared worker integration, direct standalone pilot, Codex + current sprite reference inputs, and unchanged animation frame semantics (including ultimate). The provider submits once, follows BFL's polling URL, downloads the image without forwarding credentials to storage, normalizes it and runs technical sheet checks. It does not approve aesthetic quality, repair arbitrary model layout mistakes, or automatically publish. An opaque/chroma-key result is rejected by the existing gate; background extraction and artistic qualification must be tested against actual output, not fabricated from a protocol fixture.

## Private worker configuration

Store `BFL_API_KEY` in the worker's secret environment, never in source or chat. Use a dedicated trial key/account with at most USD 5 prepaid credit and automatic recharge disabled; do not buy a larger minimum package without further approval. The local ledger is a conservative request budget, not a guarantee against provider billing/pricing changes or other callers using the same key.

```sh
# In the private worker environment (no key value shown):
FONDAL_BFL_TRIAL=approved-2026-10-28-usd5
FONDAL_BFL_LEDGER=/var/lib/fondal-art/bfl-trial-2026-10-28.json
FONDAL_ART_OUTPUT=/var/lib/fondal-art/jobs
FONDAL_ART_PROFILE=/opt/La-Horda/deploy/art-factory/bfl-trial.json
```

First pilot, without a running game relay:

```sh
node tools/fondal-art-engine/bfl-trial.js morveth
```

The persistent worker also supports this profile through the existing queue. Keep its original queue credentials configured. Do not activate recurring generation before actual quality qualification.

The one ledger must be shared by every worker and every champion in this trial. It reserves USD .25 per attempted request, up to USD 5 total (20 submissions), before any billable POST. This is a conservative reservation, not the billed price. Lost responses and failed requests retain their reservation; no automatic resubmission/refund. An exclusive lock prevents concurrent requests. Preserve the ledger, lock and request journal after crashes; inspect before unlocking. Never reset the ledger to restart the budget. Provider-reported unexpected cost halts subsequent submissions. Returned cost is recorded separately when supplied.

## Verification

`node --test tools/fondal-art-engine/*.test.js`: 37 tests PASS locally; includes budget exhaustion, duplicate and corrupt journal rejection, URL restrictions, no-key/no-network behavior, preservation of all five existing champion animation contracts, and an HTTP protocol fixture with actual PNG normalization and uncertain-submission handling. Fixture success is NOT evidence of model quality or live API compatibility.

Pilot preflight on 2026-10-28: Morveth -> BLOCKED_CREDENTIAL; no network request or spending. No model-generated candidate, sprite integration, or public release is claimed.

API references checked 2026-10-28:
- https://docs.bfl.ai/quick_start/generating_images
- https://docs.bfl.ai/llms.txt
- https://github.com/black-forest-labs/skills/blob/master/skills/bfl-api/SKILL.md
- https://bfl.ai/pricing?category=flux.2

The model remains pinned to flux-2-klein-4b. Two reference images, output 1024x2304; preserve the existing 4-column/9-row layout and animation order. A future provider/model change requires price and output qualification first.
