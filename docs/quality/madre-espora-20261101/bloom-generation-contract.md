# Madre Espora: bounded bloom production contract

Status: opt-in pilot only. Do not enable by default or call this a complete boss.
Provider: OpenAI built-in imagegen; successful request IDs and unit prices are not exposed. No Runway credits or purchases.

## Reference roles and invariants

- Accepted phase1 idle frame0: `pilot_idle.png`, first432×496 cell, root472.
- Accepted evolved endpoint: `pilot_bloom_key.png`,656×560, root528.
- Same face-to-root distance329world pixels. Root center stays fixed. Root fan grows384→535world pixels during transformation; these peripheral roots are decorative, not additional hitboxes.
- Preserve face, opaque bark armor, branch crown, mushroom arrangement and sharp painterly material. Bloom must open the broad warm orange/pink radial-gill canopy, not merely repeat cyan phase1.
- Transparent alpha, isolated full silhouettes, no clipped claws/caps/roots or neighboring-cell contact. Never independently resize each frame to fake stable proportions.

## Transition generation prompt

Use case: identity-preserve game animation edit. Create ONE transparent sprite strip of exactly THREE intermediate transformation frames, left to right25%,50%,75% between the exact neutral reference and accepted evolved endpoint. Do not include endpoints. Preserve identical face, opaque bark-armored torso, branch crown, limb anatomy, and visual style. Nonsexual tree/fungus monster. Clustered closed cyan mushrooms progressively lift/open into the broad warm orange/pink radial-gill crown. Peripheral grounded roots gradually unfurl sideways. Core trunk, face position, central root contact and face-to-root distance stay fixed. Arms may brace subtly; no attack/projectile/VFX. Actual redraws, not scaling/crossfading a portrait. Three equally sized spacious cells, same camera/scale, transparent gutters and generous margins. No text, labels, grids, floor, background or cast shadow.

Output: `exec-7e3d43dd-2f21-4826-bcff-fc5d92c93519.png`.
Extraction: three distinct alpha components; common scale329/445; fixed656×560cells/root528. Final timing uses authoritative M.tr.t: initialneutral until16%, intermediate0 until38%, intermediate1 until64%, intermediate2 until85%, then exact endpoint through3100ms controller completion. One-way only.

## Evolved idle generation prompt

Use case: identity-preserve. Create TWO additional idle frames from the exact evolved keypose. Preserve entire design, broad warm radial-gill canopy, face, bark armor, branches, mushroom placement and planted root center. One transparent strip with two separately isolated complete figures at identical scale, eye height and root baseline. Left: forearms/claws flex inward, fingers articulate and gills subtly contract. Right: forearms relax outward, fingers uncurl and gills relax. Restrained breathing, not attack/transformation. Rootbase/trunk still; no global bob/scale/tilt or proportion redesign. Preserve reference for neutral→left→right→left loop. Fully opaque bark-armored nonsexual tree creature. Generous transparent margins, no adjacent silhouette contact, background, floor, text, new projectiles or particles.

Output: `exec-ab353cc7-336f-411e-84e9-4e25517d164f.png`.
Extraction: two distinct alpha components; common scale329/465. Idleframe0 is exact RGBA endpoint, not regenerated. Loop0,1,2,1 at420ms. Cosmetic M.bloomAt set once at phase completion and serialized by existing netSer; missing legacy epoch holdsframe0 deterministically.

## Required gates

1. Independent source/geometry review before installation: passed for this candidate, not release approval.
2. Actual health-triggered3100ms phase controller with production darkness/HUD, then idle loop, desktop1280×720 and mobile844×390. No forged animation clock or camera override for evolution.
3. Verify original collision/damage windows, state transitions, vulnerability, pause and serialized latejoin.
4. Judge root perimeter crawling, front-loaded expansion and canopy wobble at native game size. Add only a targeted earlypose if observed pop warrants it; never blindly regenerate batches.
5. Baseline regression comparison is separate. Red tests must remain red until diagnosed/fixed; visual approval does not waive them.
6. No bloom attack/heart/death batch until this bounded slice receives independent runtime verdict.

## Phase2 physical attack bounded follow-on

Source: `exec-5937dab6-4dd6-4bf3-9768-0f2541c75218.png`. Built-in imagegen with accepted bloom keypose as exact identity reference and accepted phase1 attack as ACTION ONLY, never its cyan canopy.
Prompt: Three transparent isolated complete poses: anticipation elbows/claws lift inward; impact bilateral claws extend forward/downward; recovery hands retract toward neutral. Genuine joint articulation, no whole-body transformation. Preserve exact warm evolved crown, face, opaque bark armor, root fan center, torso scale. Root contact and eyes fixed. No baked slash/projectile/trail/range indicator; those belong to gameplay. Same camera/scale in spacious equal cells with transparent margins, no clipping/contact/text/background.
Extraction uses a shared329/439 scale,656×560 cells and root528. Root fan~6% narrower than neutral; independent source gate permits native seam evaluation, not automatic release. Long physical attack holds anticipation while bossWind exists, impact at actual windup completion, recovery after190ms; existing500ms recovery is unchanged. Immediate sporecast and phase3 are excluded.
