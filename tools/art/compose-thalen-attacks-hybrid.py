#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ORIGINAL = ROOT / "art-source/entregas/thalen-codex-20261104/produccion-01/sources/attacks-12.png"
PROFILE = ROOT / "art-source/entregas/thalen-codex-20261104/correccion-01/sources/attacks-12.png"
OUTPUT = ROOT / "art-source/entregas/thalen-codex-20261104/correccion-02/sources/attacks-12.png"

original = Image.open(ORIGINAL).convert("RGB")
profile = Image.open(PROFILE).convert("RGB")
if original.size != profile.size:
    raise RuntimeError(f"source size mismatch: {original.size} != {profile.size}")

ys = [round(original.height * i / 3) for i in range(4)]
hybrid = original.copy()
hybrid.paste(profile.crop((0, ys[1], profile.width, ys[2])), (0, ys[1]))
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
hybrid.save(OUTPUT, optimize=False)
print(OUTPUT)
