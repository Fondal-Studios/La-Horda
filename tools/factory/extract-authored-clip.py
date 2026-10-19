#!/usr/bin/env python3
"""Extract an ordered clip without changing RGBA pixels. Extraction is not art approval."""
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image


def extract(manifest, output):
    cfg = json.loads(Path(manifest).read_text())
    source = Path(cfg['source'])
    if hashlib.sha256(source.read_bytes()).hexdigest() != cfg['sourceSha256']:
        raise ValueError('Source SHA-256 mismatch')
    image = Image.open(source).convert('RGBA')
    cell, frames = cfg['cell'], cfg['frames']
    if type(cell) is not int or cell <= 0 or image.width % cell or image.height % cell:
        raise ValueError('Invalid source grid')
    count = image.width // cell * (image.height // cell)
    if not frames or len(set(frames)) != len(frames) or any(type(n) is not int or not 0 <= n < count for n in frames):
        raise ValueError('Invalid or duplicate source frames')
    atlas = Image.new('RGBA', (cell * len(frames), cell))
    rows = []
    for index, frame in enumerate(frames):
        x, y = frame % (image.width // cell) * cell, frame // (image.width // cell) * cell
        crop = image.crop((x, y, x + cell, y + cell))
        if not crop.getchannel('A').getbbox():
            raise ValueError('Empty source frame')
        if set(crop.getchannel('A').getdata()) - {0, 255}:
            raise ValueError('Non-binary alpha')
        atlas.paste(crop, (index * cell, 0))
        rows.append({'sourceFrame': frame, 'outputFrame': index, 'rgbaSha256': hashlib.sha256(crop.tobytes()).hexdigest()})
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(output)
    return {'status': 'EXTRACTED_NOT_APPROVED', 'manifest': cfg, 'output': str(output),
            'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'frames': rows}


if __name__ == '__main__':
    result = extract(sys.argv[1], sys.argv[2])
    Path(sys.argv[3]).write_text(json.dumps(result, indent=2) + '\n')
