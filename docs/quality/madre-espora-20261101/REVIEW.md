# Madre Espora: recover authored animation, not a moving portrait

## Scope and evidence

Baseline: main `34ac2852154035b97e53c4807a0a20ee289a40b2`.
The original `art-source/micelial/bosses.png` contains the large reference illustration AND actual poses for the mother. The derived `assets/sprites/arenas/micelial/madre_espora/atlas.png` already ships in main, but the boss renderer never uses it. It draws `mp_full` with scale/rotation and additive arm/cap overlays instead.

This change recovers the authored atlas; it does **not** generate new artwork, charge credits, change source pixels, or claim a new rig. Canonical metadata remains `assets/sprites/arenas/micelial/meta.json` (170×139 cells, 8 columns, 19 authored frames, foot anchor .9496).

## Runtime change

- Actual changing body poses for idle, reveal, attacks/casts, phase transition, bloom, open heart and death. No whole-image sway/scale in the atlas path.
- Ground anchor is fixed. Scale is fixed at 4 world units/source pixel, not independently normalized per pose. Camera uses a conservative, fixed all-pose envelope rather than pumping with each frame.
- Claw/whip anticipation holds until the existing windup ends; impact/recovery follows its existing 500ms tail. Spore shots use the ranged pose, not the baked root slash.
- Later-phase attacks retain their evolved forms. Bloom uses **two existing evolved poses**, not a newly drawn rich attack cycle: anticipation 17, impact 3, recovery 17. Heart actions use the existing opening/core poses. This is an explicit source-art limitation, not proof of complete new attack artwork.
- Vulnerability has a separate visible cue through actions. Phase-3 cosmetic heartbeat no longer overwrites a live attack/cast pack every tick.
- Death follows the existing 4700/6600/9000ms events; no permanently looping corpse.
- Source loading/error fallback retains the portrait. Normal path is only used when the exact 1360×417 sheet loads. Tests observe actual drawImage source rectangles to detect accidental fallback.
- No changes to HP, damage, collision radius, attacks, cooldowns, gameplay phase thresholds or network protocol. Existing snapshot serializer sends pack timers and bossWind data; callbacks stay excluded. Renderer writes no entity/encounter state.

## Validation status

- `node tools/art/micelial/test-mother-animation.cjs`: **26 PASS** (contract, phases, windup/impact/recovery, no phase3 overwrite, stable snapshots, fallback, death, bounds). This is not a visual release pass.
- JS syntax checks: PASS.
- `node tools/art/micelial/render-mother-evidence.cjs`: actual baseline/candidate Canvas methods rendered with controlled snapshots. This is **isolated renderer evidence**, not a complete browser encounter.
- Full browser locally: **BLOCKED_ENVIRONMENT**. Chromium fails `socket() ... Operation not permitted`; escalation fails container setup. No access restrictions bypassed.
- `.github/workflows/madre-espora-animation.yml` runs the full game at 1280×720, 844×390 and 390×844, exact frame-route checks, phase2/phase3 attack views, missing-sheet fallback, actual snapshot delta serialization, preserved gameplay values, and existing boss arena hook regressions. Pending remote results.
- Independent reviewer confirmed distinct canonical body/silhouette poses and planted base; requested correction of size/phase snaps and persistent heart cue. Those corrections are included. **Final mobile/arena visual approval remains pending CI evidence**.

## Known limitations / no approval claim

The authored sheet's neutral body is only ~96 source pixels tall and looks coarser than the large illustration at giant sizes. Fixed nearest-neighbor rendering does not invent detail. This tradeoff must be judged in the arena at native/mobile scale; a moving body does not automatically satisfy the user's full artistic quality bar. Do not merge on unit tests alone.

The colony attack includes a baked curved root stroke. Existing telegraphs/attack effects remain authoritative for range/direction. Full arena review must ensure the decorative stroke does not obscure or contradict those cues. Later-phase poses are reused deliberately to avoid reverting the evolved silhouette to the smaller colony form.

No paid generation, no claim of deployment, no broad factory merge, no automatic formal PR approval. Rollback is reverting this scoped runtime change; original source files remain untouched.

## Reproduce

```
node tools/art/micelial/test-mother-animation.cjs
npm install --no-save playwright
npx playwright install chromium
node tools/art/micelial/test-mother-browser.cjs
node tools/bosses/t_boss_arena_hooks.js
```

For the optional isolated renderer harness, install `@napi-rs/canvas` in the test environment and run `node tools/art/micelial/render-mother-evidence.cjs /tmp/mother-render`. Do not mistake its plain background captures for gameplay screenshots.
