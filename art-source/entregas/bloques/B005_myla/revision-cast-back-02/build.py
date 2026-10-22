"""Extract three imagegen hand corrections; preserve the nine other cast cells exactly."""
from pathlib import Path
import hashlib
import importlib.util
import json
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
recipe = json.loads((HERE / 'recipe.json').read_text())
source = HERE / 'source.png'
base = HERE.parent / 'revision-01/cast.png'
assert hashlib.sha256(source.read_bytes()).hexdigest() == recipe['sourceSha256']
assert hashlib.sha256(base.read_bytes()).hexdigest() == recipe['baseCastSha256']
im = Image.open(source).convert('RGBA')
data = np.array(im)
labels, count = ndimage.label(data[:, :, 3] >= 128, np.ones((3, 3)))
assert count == 3, ('Unexpected silhouettes; do not discard fragments', count)
boxes = []
for label, (y, x) in enumerate(ndimage.find_objects(labels), 1):
    boxes.append((x.start, y.start, x.stop, y.stop, label))
boxes.sort()
atlas = Image.open(base).convert('RGBA')
ref = atlas.crop((8*112, 0, 9*112, 112)).getbbox()
# Third generated pose returns to upright, calibrated against unchanged back anticipation.
scale = (ref[3]-ref[1]) / (boxes[2][3]-boxes[2][1])
for frame, (x, y, right, bottom, label) in zip(recipe['replaceFrames'], boxes):
    crop = data[y:bottom, x:right].copy()
    own = labels[y:bottom, x:right] == label
    crop[~own] = 0
    crop[:, :, 3] = np.where(own, 255, 0)
    sprite = Image.fromarray(crop).resize((round((right-x)*scale), round((bottom-y)*scale)), Image.Resampling.NEAREST)
    assert sprite.width <= 110 and sprite.height <= 105
    cell = Image.new('RGBA', (112, 112))
    cell.paste(sprite, ((112-sprite.width)//2, 107-sprite.height))
    atlas.paste(cell, (frame*112, 0))
old = Image.open(base).convert('RGBA')
for frame in recipe['preserveFrames']:
    box = (frame*112, 0, (frame+1)*112, 112)
    assert atlas.crop(box).tobytes() == old.crop(box).tobytes()
output = HERE / 'cast.png'
if output.exists():
    assert Image.open(output).tobytes() == atlas.tobytes()
else:
    atlas.save(output)
atlas.crop((8*112, 0, 12*112, 112)).save(HERE / 'preview-back.png')
spec = importlib.util.spec_from_file_location('scanner', ROOT / 'tools/art/scan_sprites.py')
scanner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scanner)
report = {'state':'EXTRACTED_NOT_APPROVED', 'sourceRects':[list(b[:4]) for b in boxes],
          'uniformScale':scale, 'preservedCells':9, 'replacedCells':[9,10,11],
          'sha256':hashlib.sha256(output.read_bytes()).hexdigest(), 'scanner':scanner.analyze(str(output))}
(HERE / 'extraction.json').write_text(json.dumps(report, indent=2, default=lambda x:x.item())+'\n')
print(json.dumps(report, default=lambda x:x.item()))
