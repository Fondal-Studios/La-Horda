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

## Immediate ranged / spore cast follow-on

Two release/recovery poses per accepted phase. Prompt: exact identity from neutral reference, arms open outward/upward with spread claw fingers as immediate release, then lower toward neutral; fixed face/canopy/root center and scale. No anticipation because code emits spores instantly. No painted projectile/cloud/beam/circle/trail; gameplay owns VFX. Transparent separated cells with generous margins, same opaque bark-armored nonsexual tree creature and painterly style.
Phase2 source `exec-e2f6ffa3-f841-46f3-be8a-5631593ff501.png`, shared329/494 scale. Initial phase1 source `exec-0412cd6b-2de2-49ea-bc88-c8e0faa67d23.png` rejected for29% root widening; NOT installed. Targeted edit prompt: replace ONLY lower trunk/root fan with accepted narrow phase1 geometry (384root width/329face-root), retaining cast arms and cyan canopy, no whole-frame squeeze. Corrected source `exec-3cf25e0d-5da0-4c54-b1fe-b3887713d6c6.png`, shared329/580 scale. Residual7–8% rootwidth delta and slimmer trunk require native seam review.
Both source gates passed for runtime pilot, not final approval. Spore release frame0 at actual emission, recovery frame1 after260ms, no new windup. Existing roots/summon/cloud warnings keep original1150+70i/700/900ms event delays. Routing tests do not substitute for full spell visual review.

## Heart OPEN keypose gate

Single source `exec-f099ebc7-0609-4ad9-b402-4b332ff21c97.png`. References: accepted high-detail bloom source and original canonical open-core sprites. Prompt: change only central wooden trunk; bark plates part as dark branch ribs exposing a large luminous magenta fungal energy seed in a dark lower-middle cavity, readable vulnerable phase, no anatomical organ/gore/nudity. Preserve face, canopy, arms, root fan, camera and scale. No new projectiles or spell indicators. Transparent margins.
Independent source GO: apparent topedge pixels are alpha<=8, opaque artwork not clipped. Extraction pads656×560 with root528 and common329/742 scale by face-to-root. Visible seed center169.4above root; cosmetic vulnerability cue follows it without changing collision. Static keypose review query additionallyrequires `motherHeartKey=1`; not a complete heart animation.


## Cached core layer runtime pilot (2026-11-02 01:35 UTC)

No new image generation. Reuses approved heart-key cavity pixels through a traced polygon; exact foreground claw masks restore original pixels, source alpha restored once during cache preparation. Each supported atlas/frame is allowlisted, geometry immutable, source SHA-256 pinned by regression test. Cache depends on base/heart image identity, binding and revision. Unknown poses fall back intact rather than accepting an unreviewed generic patch. Body selection remains cyan in phase1, warm in phase2/3; temporary node-cut exposure closes after authoritative expiry/rebuild, permanent heart remains open. Gameplay data is not mutated.

Opt-in `motherCoreLayer=1` requires existing pilot flags. Source/composite sheets independently accepted for runtime test, not final readability. Pale/dark screen-stable rim intentionally overrides inherited opacity; real fog/fade and production-VFX captures must be reviewed. This static replacement is NOT an opening animation. New browser test covers actual node cuts, 7s expiry, 5.5s rebuild, pause/net serialization, all16 source frame pixel invariants and actual exposed whip/spore timing. Local34 unit tests pass; browser pending CI.

## Bark opening/closing and seed cue (2026-11-02 01:50 UTC)

Core replacement runtime scoped GO on e3c2e88b; CI fully green and full candidate/baseline BOTH_PASS. Cached protected-source RGB restoration fixed translucent claw contamination without relaxing pixel assertions. Remaining mobile torso washout traced to legacy network glow centered above actual seed.

Next authorized no-generation prototype: two traced original bark half-plates translate and rotate outward within cavity footprint, under foreground masks, nine cached stages. Stage0 exact closed source; stage8 exact accepted open cavity. Fixed whole-body/root scale. Temporary opening uses7000−_expT over360ms, closing rebuild N.t over320ms; permanent phase3 transition uses its existing2600ms timer. Damage vulnerability and cue remain immediate, independent of cosmetic progress. No new controller fields or network changes.

Network glow now uses the exact shared successful-composite seed anchor and restrained radius28–36/alpha.12–.20; original legacy/default/missing-art glow preserved. Pulse uses game elapsed time for pause consistency. This is production opt-in cue correction, not test-only effect hiding. Browser fixtures reset previous encounter transient effects BEFORE new nodes/cuts; new actual exposure effects remain on. Source-stage and actual-runtime motion review required.

Architect source-stage GO required bounded memory before runtime: cache now uses a32MiB RGBA byte-budget LRU, not144 indefinitely retained canvases (~170MiB). Stages prepare lazily on demand; no synchronous gameplay prewarming. Browser evidence must report cold preparation duration and verify byte accounting/eviction, not infer mobile performance from source review. Temporary Canvas/readback allocations are outside retained-cache budget and remain a profiling concern.

## Bounded death strip (2026-11-02 02:18 UTC)

Built-in imagegen output `exec-c8ed1d0a-43a8-446a-b610-f73f53c6d661.png`, SHA256 `3f61581c856d4d2b40c18a30be0d97817c7cbc98cc615ae55b2af53b7c99175c`,2172×724RGBA. References: exact accepted high-detail heart key `exec-f099ebc7...png` (identity/style) and original atlas death18/6/7 (action only). No Runwaycredits/purchases; tool unit cost unexposed.

Prompt: identity-preserve game animation asset, one horizontal3equal-cell transparentstrip. Exact Madre Espora warm orange/pink gilled canopy, face/branch crown, woody trunk/mushrooms. Same camera/worldscale, fixedrootcenter/baseline,8%clear margins/gutters, no labels. Pose1 earlywilting defeat, droopedshoulders, uncurledclaws, modestbow, dimmagicalseed. Pose2 genuine uppertrunk buckle forward/sideways, foldedarms, slumpedcanopy, SAMEheadsize/materials/basalroots; not wholeimagesquash. Pose3 groundedcollapsedheap of samebentbranches/foldedcanopy/rootfan, tinyresidualseed, no standingbody/explosion/cloud/bakedparticles. Preserve rootedfootprint andnaturalarticulatedheightloss. Sharpdetail, no blurry/pixelart/newaccessories. Magicalplantbark/mushrooms, no blood/gore/humananatomy; seed is fantasy light not organ.

Source independently GO; actual components separated at gutters708–717/1439–1448, not naïve724px cells. Extraction isolates connected source silhouette with2px alphaedge support (no globalopaque recolor); sharedscale329/430, rootcenter360/1078/1803 andbaseline702/701/700 → fixed656×560 cells,anchor528. Source/normalizedAB saved `/tmp/mother-death-prepared`. Red/magenta edge speckles require native arena review.

Explicit `motherDeathPilot=1` additionally required. Three honest authored poses0–4700,4700–6600,6600+; existingfade8000–9000 only after real structuralcollapse. Deadstate drawsnone. No gameplay/reward/collision/controller edits.37localunit tests; actualkill→cleanup→milestones→victoryonce browser evidence pending.

## Ground reveal route (2026-11-02 02:36 UTC)

Death3a1b2c0c scoped runtimeGO; fullCI/BOTH_PASS run41377608170 artifact13112092920. Actual3heldposes, not continuous smoothcollapse; nativecamera/edges clean. Lootlabels/darkness partly obscuremobile remains, retained as actualproductioneffects. Startup stale banners corrected in nextfixture, not suppresseddeathtext.

Next no-generation route reuses accepted cyan idle0/1/2 during authoritative ground emergence1500–7000ms. Fixedworldbody/root, clipping fromground; actual armarticulation not wholeportraitbounce or scaling. From7000 normalidleclock ensures seamless9000fight entry. Existing sleep/stir hidden, invulnerability and allcontroller events unchanged. Explicit `motherRevealPilot=1` in addition to corepilot flags; default/missingasset fallback intact.38unitPASS; actualreveal runtime/architect gate pending.
