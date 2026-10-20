"""Rebuild nine corrected frames with the existing factory; never approve by filename."""
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
spec = json.loads((HERE / 'assembly.json').read_text())
out = Path(tempfile.mkdtemp(prefix='guardavia-v6-'))
for name, expected in spec['sources'].items():
    assert hashlib.sha256((HERE / name).read_bytes()).hexdigest() == expected, name
subprocess.run(['python3', 'tools/factory/import-authored-sheet.py', spec['baselineManifest'], str(out / 'base')], check=True)
base = out / 'base/atlas.png'
original = Image.open(base).convert('RGBA')
changed = set()
for entry in spec['replacements']:
    frame = entry['frame']
    assert frame not in changed
    changed.add(frame)
    pose = out / f'pose-{frame}.png'
    Image.open(HERE / entry['source']).crop(tuple(entry['rect'])).save(pose)
    manifest = {'atlas': str(base), 'atlasSha256': hashlib.sha256(base.read_bytes()).hexdigest(),
                'replacement': str(pose), 'replacementSha256': hashlib.sha256(pose.read_bytes()).hexdigest(),
                'frame': frame}
    if 'targetHeight' in entry:
        manifest['targetHeight'] = entry['targetHeight']
    path = out / f'assembly-{frame}.json'
    path.write_text(json.dumps(manifest))
    base = out / f'atlas-{frame}.png'
    subprocess.run(['python3', 'tools/factory/replace-authored-frame.py', str(path), str(base)], check=True)
rebuilt = Image.open(base).convert('RGBA')
assert rebuilt.tobytes() == Image.open(HERE / 'atlas.png').convert('RGBA').tobytes()
assert len(changed) == 9 and spec['retainedFrames'] == 27
for frame in set(range(36)) - changed:
    x, y = frame % 4 * 112, frame // 4 * 112
    box = (x, y, x + 112, y + 112)
    assert rebuilt.crop(box).tobytes() == original.crop(box).tobytes(), frame
runtime = Path('assets/sprites/champions/farolero/skins/farolero_guardavia/atlas.png')
assert rebuilt.tobytes() == Image.open(runtime).convert('RGBA').tobytes()
subprocess.run(['node', 'tools/art/check-authored-density.js', str(base), str(out / 'native.json')], check=True)
assert json.loads((out / 'native.json').read_text())['failedFrames'] == []
print('PASS: exact factory reconstruction, 27 retained frames, 36/36 native frames; runtime unchanged by verifier')
