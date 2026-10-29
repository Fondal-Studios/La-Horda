# Art integration gate — 2026-10-28

The codex is the canonical visual reference. A generated sheet is NOT a shipped sprite.

## Mandatory gates
1. Inventory every source, atlas, hash, hero/skin, animation, direction, and target mode.
2. Verify quality against `assets/ui/codex/champions/<hero>.png`; reject clipped, mirrored, duplicated, inconsistent or low-quality frames.
3. Confirm the production renderer actually selects the approved atlas, including base, skins, combat, death, and competitive modes. Merely adding an asset to `asset-manifest.js` does not wire the renderer.
4. Run runtime image-load, animation, combat, and regression checks. Record actual commands and results.
5. Merge only approved changes to main; verify deployed commit and actual browser rendering. Never mark deployed from a local pass.
6. Preserve old source files until replacement is confirmed in deployed gameplay; then archive/remove only after reference audit and rollback snapshot.

## Required delivery ledger
Each hero delivery records: hero, codex reference, source paths, selected runtime paths, created/replaced files, unique frames (no WebP double count), approved/rejected frames, tests, commit SHA, branch, PR, merge SHA, deployed SHA, screenshot evidence, and outstanding defects.

## Current baseline
- Nano GM codex-v2: base atlas documented integrated; deployment not verified here; alternative skin and VFX audit pending.
- Veyra: 56 generated VFX frames in six atlas; correction/no-integrate gate remains until its defects and skin matrix are resolved.
- 42 remaining base heroes and 104 enemies: no completed rework recorded in `docs/art-production/manifest.json`.
- Global missing count unknown; do not report zero.

## Immediate execution order
1. Trace active deployed SHA and asset URLs against main; diagnose stale build/cache versus unmerged branches versus unreferenced assets.
2. Audit all generated art on branches/PRs; group by hero and quality, never merge blindly.
3. Wire approved existing assets to runtime; preserve codex-quality art and skins.
4. Validate each hero in a real game before removing legacy fallback.
5. Publish evidence and update ledger after each merge.

No asset deletion or claim of public deployment without verification.
