# Recovery ledger — 28 Oct 2026

Baseline main: df7fe4b891c440a6fd31675a2c65434d77912628.

| Entity/work | Evidence | Main integration | Remaining check |
|---|---|---|---|
| Nano GM codex-v2 body | docs/art-production/manifest.json, 112 frames | In main baseline | Verify public deployment and actual browser body, alternative skin |
| Musashi thousand cuts | merged PR #227, commit 9709434 | In main history | Distinguish VFX from base body |
| Myla shield bubble | merged PR #229, commit 82720de | In main history | Visual test in current deployed game |
| Nahir echoes | merged PR #230, commit 468ee93 | In main history | Visual test in current deployed game |
| Maura ability FX | merged PR #223, commit fd10c68 | In main history | Visual test in current deployed game |
| Solciju toast | merged PR #218, commit 9b585d9 | In main history | Visual test in current deployed game |
| Guerrero trap | merged PR #212, commit 51c9d45 | In main history | Visual test in current deployed game |
| Ascension 8 champions / 14 skins | commit 3696f76 | Commit exists; verify active runtime | Generated art pending visual review; not necessarily codex quality |
| Veyra VFX 56 frames | PR #196 checkpoint | NO_INTEGRAR in checkpoint | Aura defect, skins and gate |
| Elyra 12 poses | PR #138, commit 3a0c68a | Candidate source in main history | Verify approved frames and active body |
| Libertador 24 poses | PR #139, commit 1c78e95 | Candidate source in main history | Defects documented; compare to current |
| Tanque 36 poses | PR #133, commit c4b63ed | Source retained; NO_INTEGRAR | Correct source before replacing master |
| Five Portadores | commit 241825c | In main history | Compare active atlas and codex |

## Important distinction
A merge commit in main does not prove that its image is selected by the renderer, and a preloader manifest entry does not prove a runtime body replacement.

## Next implementation gate
For each candidate, record its exact PNG/WebP, currently selected atlas and code path, visual side-by-side comparison, animation contract, and deployment SHA. Prefer the better artwork if it meets runtime requirements; do not insist on arbitrary approval labels. Keep older art as rollback until proven replaced.

No automatic bulk merge of NO_INTEGRAR candidates; preserve all generated source.
