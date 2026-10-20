#!/usr/bin/env python3
"""Repair small gaps in an existing dark outline, in staging only; never approve art.

This is not a dehalo filter: no original pixel is removed, recolored, rescaled or
moved. After visual diagnosis of exposed metal/trim, add the normalizer's dark
outline only in transparent four-neighbor gaps beside light boundary pixels.
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


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def repair(image):
    if image.mode != 'RGBA' or image.size != (448, 1008):
        raise ValueError('Expected canonical RGBA 36-frame atlas')
    original = np.array(image)
    if not np.isin(original[..., 3], [0, 255]).all():
        raise ValueError('Resolve semitransparency before repairing outline gaps')
    norm = module('outline_normalizer', 'tools/art/normalize_sprites.py')
    result = original.copy()
    records = []
    for frame in range(36):
        x, y = frame % 4 * 112, frame // 4 * 112
        cell = original[y:y+112, x:x+112]
        op = cell[..., 3] == 255
        if not op.any():
            raise ValueError(f'Empty frame {frame}')
        if op[0].any() or op[-1].any() or op[:, 0].any() or op[:, -1].any():
            raise ValueError(f'Clipped source frame {frame}')
        border = op & ~ndimage.binary_erosion(op, norm.N4, border_value=0)
        light = border & (norm.lum(cell[..., :3]) > 120) & (norm.sat(cell[..., :3]) < .22)
        if not light.any():
            continue
        if not norm.has_outline(cell):
            raise ValueError(f'Frame {frame} needs a complete outline review, not gap repair')
        # Bound the operation to small defects, never wrap an illustration in black.
        if int(light.sum()) > 8:
            raise ValueError(f'Too many exposed light pixels in frame {frame}')
        ring = ndimage.binary_dilation(light, norm.N4) & ~op
        if ring[0].any() or ring[-1].any() or ring[:, 0].any() or ring[:, -1].any():
            raise ValueError(f'Outline would reach frame boundary {frame}')
        rgb, ok = norm.neighbor_mean(cell[..., :3], op, ring)
        dark = (rgb.astype(float) * .22 + np.array([14, 9, 12]) * .78).astype(np.uint8)
        dst = result[y:y+112, x:x+112]
        dst[ok, :3] = dark[ok]
        dst[ok, 3] = 255
        records.append({'frame': frame, 'lightEdgePixels': int(light.sum()),
                        'addedOutlinePixels': int(ok.sum()),
                        'addedCoordinates': [[int(px), int(py)] for py, px in zip(*np.where(ok))]})
    # Prove preservation, including original transparent pixels outside additions.
    opaque = original[..., 3] == 255
    if not np.array_equal(result[opaque], original[opaque]):
        raise AssertionError('Original artwork changed')
    return Image.fromarray(result), records


def build(manifest, output):
    output = Path(output).resolve()
    if output.exists() or output == ROOT / 'assets' or ROOT / 'assets' in output.parents:
        raise ValueError('Use a new staging directory outside production assets')
    source = ROOT / manifest['source']
    if hashlib.sha256(source.read_bytes()).hexdigest() != manifest['sourceSha256']:
        raise ValueError('Source hash mismatch')
    image = Image.open(source)
    fixed, records = repair(image)
    scanner = module('outline_scanner', 'tools/art/scan_sprites.py')
    output.mkdir(parents=True)
    target = output / 'atlas.png'
    fixed.save(target)
    receipt = {'status': 'TECHNICAL_FIX_NOT_ART_APPROVAL', 'source': manifest['source'],
               'sourceSha256': manifest['sourceSha256'],
               'atlasSha256': hashlib.sha256(target.read_bytes()).hexdigest(),
               'originalOpaquePixelsPreserved': True, 'resized': False,
               'framesUnchanged': 36 - len(records), 'frames': records,
               'before': scanner.analyze(source), 'after': scanner.analyze(target)}
    (output / 'repair.json').write_text(json.dumps(receipt, indent=2, default=lambda x: x.item()) + '\n')
    return receipt


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: repair-outline-gaps.py manifest.json new-staging-directory')
    print(json.dumps(build(json.loads(Path(sys.argv[1]).read_text()), sys.argv[2]), default=lambda x: x.item()))
