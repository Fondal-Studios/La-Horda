# Aelith: recovered back-cast candidate

This is a narrow direction correction, not a full-hero art approval. Only the base appearance's `cast_up` changes from front-facing cells24–27 to back-facing36–39, using a new immutable atlas. All36 original cells and all other clips/skins remain unchanged. Frame39 is a copy of existing idle-up8, not new generated art.

## Recovery and cost

Four already-completed image tasks were retrieved with exact source SHA256 matches. No generation request or purchase was made during this recovery. Historical production cost:28credits; new cost:0. Sources and technical task provenance are included in `sources/`. No access identifiers, signed URLs or credentials are published.

The recovered atlas SHA256 is **b76f27906a1dacff0014848b630711fbb0022c4df476f284be6c94afb48bf5eb**, byte-identical to the previously inspected candidate. Deterministic chromakey cleanup, nearest-neighbor resize and foot anchoring are reproduced by `tools/art/aelith-recovery/reconstruct.py`. This key is palette-specific to Aelith, not a universal green-character cleanup.

## Safety and review

Reconstruction pins source PNG, full original registry and canonical Codex hashes from main54aa936fa254112044e29493179893dd0f8694d6 before writing. It refuses changed baseline pins, including under `python -O`. Run reconstruction on that original baseline, not the already-installed candidate; the fixture test reconstructs the baseline independently and checks the exact historical atlas hash. Manifest records baseline and proposed contract separately.

Independent review finds back orientation, held ring/glove/boots and three articulated action poses suitable for **scoped browser integration testing**. A modest head/cape styling seam remains when returning to original idle. This is explicitly not a seamless/polished full champion or skin release.

Current checks:4Python reconstruction tests,8native renderer tests,34existing factory/quality-five tests,7authored importer tests and Talent Gate passed locally. Native renderer captures execute actual finite-cast functions with pre/post idle and preserve non-up, ultimate and skin routing. Native Canvas is **not** browser coverage. The dedicated Chromium workflow loads actual index and captures normal/mip/glow/real skin routes; CI must complete on the exact published head. No main merge or deployment is performed by this package.
