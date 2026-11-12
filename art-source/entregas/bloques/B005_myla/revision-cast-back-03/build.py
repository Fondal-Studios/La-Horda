"""Replace only Myla's rejected back-cast recovery cell; preserve cells 0-10 byte-exact."""
from pathlib import Path
import hashlib
import importlib.util
import json

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
recipe = json.loads((HERE / "recipe.json").read_text())
source = HERE / "source-frame11.png"
base = HERE.parent / "revision-cast-back-02/cast.png"

assert hashlib.sha256(source.read_bytes()).hexdigest() == recipe["sourceSha256"]
assert hashlib.sha256(base.read_bytes()).hexdigest() == recipe["baseCastSha256"]

rgba = np.array(Image.open(source).convert("RGBA"))
labels, count = ndimage.label(rgba[:, :, 3] >= 128, np.ones((3, 3)))
assert count == 1, ("Unexpected silhouette count", count)
y, x = ndimage.find_objects(labels)[0]
crop = rgba[y, x].copy()
own = labels[y, x] == 1
crop[~own] = 0
crop[:, :, 3] = np.where(own, 255, 0)

atlas = Image.open(base).convert("RGBA")
old = atlas.copy()
old_box = old.crop((11 * 112, 0, 12 * 112, 112)).getbbox()
assert old_box, "Historical frame 11 is empty"
target_h = old_box[3] - old_box[1]
scale = target_h / crop.shape[0]
sprite = Image.fromarray(crop).resize(
    (round(crop.shape[1] * scale), target_h), Image.Resampling.NEAREST
)
assert sprite.width <= 110 and sprite.height <= 105
cell = Image.new("RGBA", (112, 112))
cell.paste(sprite, ((112 - sprite.width) // 2, 107 - sprite.height))
atlas.paste(cell, (11 * 112, 0))

for frame in range(11):
    box = (frame * 112, 0, (frame + 1) * 112, 112)
    assert atlas.crop(box).tobytes() == old.crop(box).tobytes()

output = HERE / "cast.png"
atlas.save(output)
atlas.crop((8 * 112, 0, 12 * 112, 112)).save(HERE / "preview-back.png")

spec = importlib.util.spec_from_file_location("scanner", ROOT / "tools/art/scan_sprites.py")
scanner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scanner)
report = {
    "state": "EXTRACTED_NOT_APPROVED",
    "sourceRect": [x.start, y.start, x.stop, y.stop],
    "scale": scale,
    "preservedCells": list(range(11)),
    "replacedCells": [11],
    "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
    "scanner": scanner.analyze(str(output)),
}
(HERE / "extraction.json").write_text(json.dumps(report, indent=2, default=lambda v: v.item()) + "\n")
print(json.dumps(report, default=lambda v: v.item()))
