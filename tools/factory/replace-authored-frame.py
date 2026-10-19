#!/usr/bin/env python3
"""Assemble one authored replacement, preserving the other35 frames byte-for-byte; no art approval."""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]


def main():
    manifest = json.loads(Path(sys.argv[1]).read_text())
    output = Path(sys.argv[2]).resolve()
    if ROOT / 'assets' in output.parents or output.exists():
        raise ValueError('Use a new staging file outside production assets')
    paths = [ROOT / manifest[k] for k in ['atlas', 'replacement']]
    for path, key in zip(paths, ['atlasSha256', 'replacementSha256']):
        if hashlib.sha256(path.read_bytes()).hexdigest() != manifest[key]:
            raise ValueError('Source hash mismatch: ' + str(path))
    original, replacement = [Image.open(p) for p in paths]
    if original.mode != 'RGBA' or original.size != (448, 1008) or replacement.mode != 'RGBA':
        raise ValueError('Expected RGBA inputs and canonical36-frame atlas')
    frame = manifest['frame']
    if not isinstance(frame, int) or not 0 <= frame < 36:
        raise ValueError('Frame must be0..35')
    data = np.array(replacement)
    mask = data[:, :, 3] >= 128
    if mask.all() or mask[0].any() or mask[-1].any() or mask[:, 0].any() or mask[:, -1].any():
        raise ValueError('Replacement needs transparent margins')
    _, count = ndimage.label(mask, np.ones((3, 3)))
    if count != 1:
        raise ValueError(f'Replacement must contain one connected silhouette, found{count}')
    data[:, :, 3] = np.where(mask, 255, 0)
    data[~mask] = 0
    body = Image.fromarray(data).crop(Image.fromarray(mask).getbbox())
    before = np.array(original)
    x, y = frame % 4 * 112, frame // 4 * 112
    old = before[y:y+112, x:x+112]
    yy = np.where(old[:, :, 3] > 127)[0]
    height = int(yy.max() - yy.min() + 1)
    width = round(body.width * height / body.height)
    if not 1 <= width <= 110 or height > 106:
        raise ValueError('Replacement would clip at the existing frame height')
    body = body.resize((width, height), Image.Resampling.NEAREST)
    cell = Image.new('RGBA', (112, 112))
    cell.paste(body, ((112-width)//2, 107-height))
    result = original.copy()
    result.paste(cell, (x, y))
    after = np.array(result)
    for i in range(36):
        if i != frame:
            xx, yy = i % 4 * 112, i // 4 * 112
            if not np.array_equal(before[yy:yy+112, xx:xx+112], after[yy:yy+112, xx:xx+112]):
                raise ValueError(f'Unrequested change in frame{i}')
    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output)
    report = {'status': 'ASSEMBLED_NOT_APPROVED', 'frame': frame, 'retainedFrames': 35,
              'height': height, 'width': width, 'resampling': 'NEAREST',
              'atlasSha256': hashlib.sha256(output.read_bytes()).hexdigest()}
    output.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
