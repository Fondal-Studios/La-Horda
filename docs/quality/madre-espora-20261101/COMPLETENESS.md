# Madre Espora — route completeness and rollout gate

Current publication remains draft PR260, not merged or deployed. This draft candidate now enables the complete rework on ordinary URLs, with lazy Micelial entry loading; its fresh rollout CI is pending. Latest fully passing revision: **5f77cb01** (run 41381017915, artifact 13113509568); full candidate and full baseline both pass. The continuous, HP-assisted encounter passes at desktop and mobile viewport sizes with actual allied/enemy AI, all body/action routes observed, no legacy body fallback, and exactly one victory/reward. Independent continuous visual review has scoped GO. Exact default/lazy rollout validation remains pending.

| Authoritative route | High-detail selection | Evidence / remaining gate |
|---|---|---|
| sleep / stir | Body hidden; existing environmental pod remains | Reveal real controller, no premature body |
| reveal1500–7000 | Cyan idle0/1/2, fixed body/root, existing ground clipping | Scoped architect GO a479b67b; reused articulation, not new awakening art |
| reveal7000–9000 → fight | Same idle clock/body | Exact boundary probes and actual controller; scoped GO |
| phase1 idle / stun | Cyan idle3 authored poses | Scoped GO; stun never drops to old body |
| phase1 claw / whip | Cyan anticipation/impact/recovery | Actual windup/damage callbacks, scoped GO |
| phase1 immediate spores | Cyan cast/recover | Actual5shot release unchanged, scoped GO |
| phase1→2 transition | Neutral→3unfurl poses→exact bloom key | Real3100ms controller incl darkness, scoped GO |
| phase2 idle / stun | Warm bloom idle3poses | Anchored idle epoch serialized, scoped GO |
| phase2 claw / whip | Warm anticipation/impact/recovery | Actual damage callbacks, scoped GO |
| phase2 immediate spores | Warm cast/recover | Actual6shot release unchanged, scoped GO |
| roots / summon phase1–3 | Phase-correct cast/recover | 32 actual-AI viewport cases PASS; independent warning-route scoped GO23d9ed90 |
| clouds / hallucinations phase2–3 | Warm cast/recover | Existing warnings/counts/delays authoritative; actual-AI cases PASS and scoped visual GO |
| temporary network-open all forms | Body/action + traced cavity + original foreground claws | Actual node cuts,7000ms damage expiry, all reviewed pose pixel invariants; scoped GO |
| temporary opening / closing | Two original bark plates,9cached stages |360/320ms cosmetic only; exact one16ms network-state boundary tested; scoped GO |
| phase3 opening | Warm body + bark articulation over existing2600ms | Actual controller, vulnerability unchanged, scoped GO |
| permanent phase3 during actions / rebuild | Warm current action + persistent core | Serialized/pause/rebuild checks, scoped GO; warning routes PASS and scoped visual GO |
| dying0–4700 /4700–6600 /6600+ | Three genuine wilt/buckle/grounded-remains poses | Actual kill/cleanup/controller, scoped death GO3a1b2c0c; honest held poses |
| dying8000–9000 / dead | Existing fade after structural collapse; then no body | Actual disappearance;10500ms victory/reward once/idempotence unchanged |
| missing new pose / invalid dimensions | Intact recovered atlas; if unavailable, original portrait | Explicit fallback tests; fallback is not accepted normal-state art |
| missing core source / unknown frame | Reject partial composite; intact legacy fallback and legacy cue | Allowlist, source-byte regression pins, alpha/occlusion/fallback tests |

## Cross-cutting gates

- Collision position/radius140, gameplay stats, damage windows, projectile/strike timing and reward timing are not altered by art rendering.
- Source-byte SHA pins are CI regressions, not runtime cryptographic authentication.
- Cache is a32MiB retained RGBA LRU, not an unbounded all-stage cache. Newart PNGs decode to~30.08MiB; compressed total~10.31MiB. GPU copies and transient canvases add overhead.
- Cold pre-ROI CI compositing median9.4–10ms, max16.3ms; warm<=.1ms. CI viewport dimensions do NOT certify physical-phone60fps. ROI144wholeRGBA byte equality passes; fresh median6.3–6.4ms, maximum18.4ms. No physical-phone frame-rate certification.
- Isolated motion tests use passive targets to prevent random ally Axiom time-stop from invalidating a prescribed attack window. A separate full-encounter smoke retains actual allied/enemyAI and legitimate CC; its HP assistance is explicitly logged, not a natural victory or balance certification.
- Production VFX, darkness, HUD and loot labels remain visible. Mobile art is small/texture-dense; loot can obscure fallen body. These limitations are not erased for favorable captures.
- Still pending: exact default/lazy candidate CI and final completeness review. No full-boss/main GO yet.

## Default-on draft candidate — fresh CI pending

After the continuous encounter gate, this draft enables all accepted body routes, but defer the ten new atlas requests until Micelial host or guest entry. Menu and non-Micelial startup must request none. `motherArtLegacy=1` explicitly restores legacy presentation for rollback. Existing per-slice query flags retain their explicit diagnostic semantics so isolated tests can still exercise missing/disabled routes. Missing image/readiness/geometry retains intact fallback; no partial unreviewed composite.

Selector logic: one query object; `defaultRework = !legacy && !anyExplicitSliceFlag`; each existing feature is enabled by `defaultRework` OR its existing explicit query flag, preserving prerequisite dependencies. Updated previous no-flag legacy assertions to use explicit rollback URLs; added ordinary-URL full encounter/fallback coverage. No controller/network protocol changes, no deployment or merge from this proposal. Architect reviews exact source diff and fresh CI before any release decision.


### Lazy loading and retained memory

The isolated candidate invokes an idempotent loader from the existing `micRenderReset` host/guest entry hook. Explicit diagnostic slice URLs retain eager loading. Failed requests retry only on a later entry, never per rendered frame. Pending or malformed assets retain the intact legacy fallback. Loaded atlases and the bounded compositor cache remain retained after leaving the arena; the approximately 30.08 MiB decoded atlas cost plus up to 32 MiB cache and browser/GPU overhead applies after visiting Micelial, not to every initial menu load. This is not a physical-device memory or frame-rate certification.
