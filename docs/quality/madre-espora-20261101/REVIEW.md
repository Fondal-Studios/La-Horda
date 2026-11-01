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

- `node tools/art/micelial/test-mother-animation.cjs`: **28 PASS** (contract, phases, windup/impact/recovery, no phase3 overwrite, stable snapshots, fallback, death, bounds). This is not a visual release pass.
- JS syntax checks: PASS.
- `node tools/art/micelial/render-mother-evidence.cjs`: actual baseline/candidate Canvas methods rendered with controlled snapshots. This is **isolated renderer evidence**, not a complete browser encounter.
- Full browser locally: **BLOCKED_ENVIRONMENT**. Chromium fails `socket() ... Operation not permitted`; escalation fails container setup. No access restrictions bypassed.
- `.github/workflows/madre-espora-animation.yml` runs the full game at 1280×720, 844×390 and 390×844, exact frame-route checks, phase2/phase3 attack views, missing-sheet fallback, actual snapshot delta serialization, preserved gameplay values, and existing boss arena hook regressions. Remote browser suite: 60 PASS. Existing general non-boss camera regression: PASS. Existing boss hooks: PASS.
- Independent reviewer confirmed distinct canonical body/silhouette poses and planted base; requested correction of size/phase snaps and persistent heart cue. Those corrections are included. **Visual release is NOT approved**: the recovered low-resolution source has a dark rectangular bloom matte and noticeably less detail than the portrait. The high-detail idle pilot is separate and opt-in, not an approved replacement.

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

## Actual camera and baseline findings

At `057741d1`, CI run 41359590617 passed 28 unit checks, 60 browser checks and the existing general camera/viewport suite. The Micelial-only zoom hook frames the fixed all-pose boss envelope plus the player between reserved HUD margins; the normal zoom is restored on death, arena exit and spectator mode. World positions/hitboxes stay unchanged and mouse screen/world inversion is tested through the zoom transition. Landscape 844×390 heart top moved from −61.8px to +113px below the HUD. The zoom-out makes the player smaller: this remains a visual/gameplay readability tradeoff, not a UX approval. Lateral/distant positions outside the supported framing envelope are not claimed to fit.

The existing fungal lifecycle suite fails `MADRE.fase3_corazon_expuesto_y_vulnerable` and `SAVE.guardado_viejo_conserva_el_hielo_y_abre_el_reino`. CI re-runs with the unchanged main `34ac2852` production renderer/AI files and reproduces both failures. These are baseline failures, not silently waived tests; the workflow stays red. Baseline additionally showed a variable shaman-aura failure.

Portrait 390×844 captures display the game's rotation gate. Underlying renderer assertions do not constitute visual gameplay approval in portrait mode.

## High-detail idle pilot (opt-in only)

The user authorized using the original sheet and portrait in OpenAI image generation and programmatic alpha correction. The first output was rejected by the image tool; a fully opaque bark-armored safe revision generated three poses. A second layout revision removed clipped canopy and large height changes. The result changes torso coverage and some fine design details, so canonical identity still needs judgment.

`assets/sprites/arenas/micelial/mother/pilot_idle.png` contains three 432×496 frames, root baseline472, loop0/1/2/1. Generated source SHA256 and preparation record are in adjacent JSON. Preparation used a uniform0.6 scale, fixed ground anchor and removal only of isolated alpha components under12pixels; no global luminance threshold or erosion of opaque silhouettes. Original generated source remains retained in the working evidence folder.

Only `?motherArtPilot=1` enables this **UNAPPROVED** idle experiment. All other states still use the recovered old sheet. Do not treat this mixture as a finished boss or merge it based on idle alone. `test-mother-pilot.cjs` compares original portrait, recovered old idle and high-detail pilot under the same actual arena camera, records the three-source-frame loop, and preserves the real renderer rather than using a standalone preview. No Runway credits or purchases were made; the image tool did not expose a per-image cost.
