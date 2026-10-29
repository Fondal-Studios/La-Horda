# Owned guardians and visual installation review

Base: c0a025016e0315b93870f2f4c86abb846619d30e.

The competitive lobby used the simplified simulator's entire roster, rather than the player's collection. The real-mode temporary save unlocked every champion and discarded selected cosmetics. This change lists owned/playable guardians (including guardians absent from the old simulator), defaults to the campaign selection, rejects unowned local/create/join requests, retains cosmetic selections in the isolated save, and retains validated guest cosmetic IDs in the normalized online record. Bots still use their eligible roster. The persistent save is restored on exit.

The Codex defaults to independent skins. Set variants no longer match the skin filter; set recolors are shown under SET rather than the independent chroma filter. This is a filter correction, not a completed redesign of equipment/appearance pages.

The Painter installer previously accepted numeric style metrics as sufficient permission to overwrite runtime artwork. It now also requires `out/<id>/visual-review.json`, tied to candidate, spec, Codex reference and evidence by SHA-256. It resolves donor metadata before touching runtime assets. This receipt records a review; it cannot judge images or prove a dishonest declaration true. Other installation paths and the separate PR232 engine are not certified by this change.

## Receipt

Required fields: `status: "PASS"`, nonempty `reviewer`, `specSha256`, `candidate: {path, sha256}`, `reference: {path, sha256}` under `assets/ui/codex`, a nonempty `evidence` array of `{path, sha256}`, and `checks` with `identity`, `animationContinuity`, `nativePixelStyle`, `inGameScale` all `PASS`. Paths are repository-relative. Changed files invalidate the receipt. Do not invent a review to unblock an install. Numeric checks remain required.

## Validation

- 9 review receipt unit tests; changed source/spec/reference/evidence, missing evidence, wrong candidate, unapproved status, incomplete checks and path escape rejected.
- Painter tests: 15 unittest cases, 26 forge checks and style-gate negative fixtures passed after installing OpenCV.
- 11 isolated ownership/cosmetic/save isolation assertions.
- Chromium at 844x390 and 667x375: owned selector, selected Axiom, blocked unowned start, ten-hero Cristales and eight-hero Coliseo, retained skin, exact save restoration, guest cosmetic record and skin filter passed.
- Existing lanes UI flow passed at both viewports (purchase, recall, horde cards, result and return). Its old all-roster assertion now checks owned guardians.
- Postgame gameplay/reward/restore assertions passed, but the full command failed its final no-console-errors assertion: the external rooms endpoint `https://fondalstudios.com/la-horda/red/api/rooms?build=B1-7-quality-five-originals` returned `net::ERR_EMPTY_RESPONSE`. Request-failure diagnostics identify the URL. This is not a full PASS or a validated online deployment.

These are desktop Chromium mobile viewports, not physical iPhone tests. Guest record testing is isolated in the browser, not a two-client relay session.

## Art candidate

`art-source/entregas/axiom-codex-20261029/candidate-01/` preserves a built-in image_gen source, prompt and hashes using Axiom's exact Codex. Twelve proposed walking poses; FIX_NOT_APPROVED. Hair and coat continuity and edge pixels need review/correction. No runtime image was replaced. Musashi/Sylva/Ilvar PR238 and Veyra/NanoGM drafts were not changed.

## Remaining requested work

Online equipment/talents are still normalized/discarded by the existing mode rules; only guardian selection and cosmetics are corrected here. Local postgame retains its existing capped profile and reward rules. Complete online profile integration needs host/guest stat, item and restore tests. No claim of full shared progression or deployed fix.

Full guardian/skin/enemy sprite unification, installation of Axiom, skin Codex pages with story and reference sprites, first-match tutorial, and the previously reported reward/import/load failures remain open. This PR is not a completion certificate for those tasks.

## Delivery state

Branch `fix/codex-install-and-owned-roster-20261029`. The owner explicitly authorized publication and merge on 2026-10-29. Updated against main, preserving the separately merged Musashi/Sylva/Ilvar art. Merge remains conditional on the candidate's checks; Axiom stays a source candidate only.
