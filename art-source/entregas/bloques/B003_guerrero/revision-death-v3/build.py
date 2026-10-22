"""Reproduce the four authored poses through the existing factory; no art approval."""
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
recipe = json.loads((HERE / 'recipe.json').read_text())
source = HERE / recipe['source']
base = ROOT / recipe['baseline']
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(source) == recipe['sourceSha256']
assert sha(base) == recipe['baselineSha256']
original = Image.open(base).convert('RGBA')
image = Image.open(source)
with tempfile.TemporaryDirectory(prefix='guerrero-death-') as tmp:
    scratch = Path(tmp)
    for i, (frame, rect, height) in enumerate(zip(recipe['frames'], recipe['rects'], recipe['targetHeights'])):
        raw = scratch / f'pose-{i}.png'
        image.crop(rect).save(raw)
        cfg = scratch / f'pose-{i}.json'
        cfg.write_text(json.dumps({'atlas': str(base), 'atlasSha256': sha(base),
            'replacement': str(raw), 'replacementSha256': sha(raw),
            'frame': frame, 'targetHeight': height}))
        target = scratch / f'atlas-{i}.png'
        subprocess.run(['python3', 'tools/factory/replace-authored-frame.py', str(cfg), str(target)], cwd=ROOT, check=True)
        base = target
    final = Image.open(base).convert('RGBA')
    for i in range(32):
        x, y = i % 4 * 112, i // 4 * 112
        box = (x,y,x+112,y+112)
        assert original.crop(box).tobytes() == final.crop(box).tobytes()
    target = HERE / 'atlas.png'
    if target.exists():
        assert Image.open(target).tobytes() == final.tobytes()
    else:
        final.save(target)
    cfg = scratch / 'clip.json'
    cfg.write_text(json.dumps({'source': str(target), 'sourceSha256': sha(target), 'cell':112, 'frames':recipe['frames']}))
    subprocess.run(['python3', 'tools/factory/extract-authored-clip.py', str(cfg), str(scratch/'death.png'), str(scratch/'extraction.json')], cwd=ROOT, check=True)
    clip = HERE / 'death.png'
    if clip.exists():
        assert Image.open(clip).tobytes() == Image.open(scratch/'death.png').tobytes()
    else:
        clip.write_bytes((scratch/'death.png').read_bytes())
    print('PASS: exact four-frame factory assembly; 32 previous frames preserved. Art gate still required.')
