#!/usr/bin/env python3
"""Import 36 authored poses without installing or approving them.

Usage: python tools/factory/import-authored-sheet.py source.json output-directory
Uses the existing factory frame format and redraw foot-anchor detector.
"""
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('redraw_atlas', ROOT / 'tools/art/redraw/build_atlas.py')
redraw = importlib.util.module_from_spec(spec)
spec.loader.exec_module(redraw)


def build(manifest, output):
    source = ROOT / manifest['source']
    data = source.read_bytes()
    if hashlib.sha256(data).hexdigest() != manifest['sourceSha256']:
        raise ValueError('source hash mismatch')
    image = Image.open(source)
    if image.mode != 'RGBA':
        raise ValueError('source must have a real alpha channel')
    pixels = np.array(image)
    mask = pixels[:, :, 3] >= 128
    if mask.all():
        raise ValueError('source has no transparent background')
    if mask[0].any() or mask[-1].any() or mask[:, 0].any() or mask[:, -1].any():
        raise ValueError('source silhouette touches canvas edge; redraw clipped poses')
    labels, count = ndimage.label(mask, structure=np.ones((3, 3)))
    bodies = []
    for label, bounds in enumerate(ndimage.find_objects(labels), 1):
        if bounds is None:
            continue
        ys, xs = bounds
        if (labels[bounds] == label).sum() < image.width * image.height / 36 * .045:
            continue
        bodies.append((xs.start, ys.start, xs.stop, ys.stop, label))
    if len(bodies) != 36:
        raise ValueError(f'expected 36 separated silhouettes, found {len(bodies)}')
    bodies.sort(key=lambda b: (b[1] + b[3]) / 2)
    # Hand-authored sheets can have unequal row spacing. An explicit reviewed
    # layout preserves the same cell checks without widening their tolerances.
    row_bounds = manifest.get('rowBounds', [image.height * i / 9 for i in range(10)])
    if (len(row_bounds) != 10 or row_bounds[0] != 0 or row_bounds[-1] != image.height
            or any(b <= a for a, b in zip(row_bounds, row_bounds[1:]))):
        raise ValueError('rowBounds must partition the full source into nine positive rows')
    frames = []
    for row in range(9):
        group = sorted(bodies[row * 4:row * 4 + 4], key=lambda b: b[0])
        for col, box in enumerate(group):
            cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
            row_y = (cy - row_bounds[row]) / (row_bounds[row + 1] - row_bounds[row])
            if abs(cx / image.width * 4 - (col + .5)) > .45 or abs(row_y - .5) > .48:
                raise ValueError(f'pose {row * 4 + col}: outside its expected grid cell')
            # Bounding boxes can overlap another pose's thin weapon. Retain only
            # this connected silhouette, never pixels from a neighbouring pose.
            frame = np.array(image.crop(box[:4]))
            own = labels[box[1]:box[3], box[0]:box[2]] == box[4]
            frame[~own] = 0
            frames.append(Image.fromarray(frame))
    scale = manifest.get('targetHeight', 70) / np.median([f.height for f in frames[:12]])
    cell = manifest.get('cellSize', 112)
    if not isinstance(cell, int) or not 64 <= cell <= 256:
        raise ValueError('cellSize must be between 64 and 256')
    baseline = round(cell * 106 / 112)
    atlas = Image.new('RGBA', (cell * 4, cell * 9))
    for i, frame in enumerate(frames):
        frame = frame.resize((max(1, round(frame.width * scale)), max(1, round(frame.height * scale))), Image.Resampling.NEAREST)
        p = np.array(frame)
        p[:, :, 3] = np.where(p[:, :, 3] >= 128, 255, 0)
        p[p[:, :, 3] == 0] = 0
        foot = frame.height - 1 if i >= 32 or i in manifest.get('bottomAnchorFrames', []) else redraw.feet_row(p[:, :, 3] > 0)
        x, y = (cell - frame.width) // 2, baseline - foot
        if x < 1 or y < 1 or x + frame.width >= cell or y + frame.height > cell:
            raise ValueError(f'pose {i}: would clip at uniform scale')
        atlas.paste(Image.fromarray(p), ((i % 4) * cell + x, (i // 4) * cell + y))
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    # One shared palette for the whole animation prevents per-frame colour drift.
    colors = manifest.get('paletteColors')
    if colors is not None:
        if not isinstance(colors, int) or not 16 <= colors <= 256:
            raise ValueError('paletteColors must be between 16 and 256')
        alpha = atlas.getchannel('A')
        atlas = atlas.quantize(colors=colors, method=Image.Quantize.FASTOCTREE,
                               dither=Image.Dither.NONE).convert('RGBA')
        atlas.putalpha(alpha)
    atlas.save(output / 'atlas.png')
    atlas.crop((0, 0, cell, cell)).save(output / 'preview.png')
    report = {'status': 'IMPORTED_NOT_APPROVED', 'poses': 36, 'scale': float(scale),
              'sourceSha256': manifest['sourceSha256'],
              'atlasSha256': hashlib.sha256((output / 'atlas.png').read_bytes()).hexdigest()}
    (output / 'import-report.json').write_text(json.dumps(report, indent=2) + '\n')
    return report


if __name__ == '__main__':
    print(json.dumps(build(json.loads(Path(sys.argv[1]).read_text()), sys.argv[2])))
