#!/usr/bin/env python3
"""Prepare a saved 4x9 atlas using existing technical repairs; never install or approve art."""
import argparse
import hashlib
import importlib.util
import json
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    source, output = (ROOT / args.source).resolve(), (ROOT / args.output).resolve()
    if ROOT / 'assets' in output.parents or output == ROOT / 'assets':
        raise ValueError('Preparation must stay outside production assets')
    if output.exists():
        raise ValueError('Output exists; retain the previous checkpoint and choose a new directory')
    output.relative_to(ROOT)  # Committed manifests must use repository-relative paths.
    image = Image.open(source)
    if image.mode != 'RGBA' or image.size != (448, 1008):
        raise ValueError('Expected saved RGBA atlas448x1008; no implicit conversion')
    norm = module('normalize_saved_grid', 'tools/art/normalize_sprites.py')
    importer = module('import_saved_grid', 'tools/factory/import-authored-sheet.py')
    scanner = module('scan_saved_grid', 'tools/art/scan_sprites.py')
    prepared, operations, heights = Image.new('RGBA', image.size), [], []
    # This is a technical FIX, not an attempt to turn illustration into pixel art.
    ops = ['binarize', 'fragments', 'outline']
    with tempfile.TemporaryDirectory(prefix='horda-grid-') as temp:
        for i in range(36):
            x, y = i % 4 * 112, i // 4 * 112
            cell = image.crop((x, y, x + 112, y + 112))
            file = Path(temp) / f'{i}.png'
            cell.save(file)
            fixed, report = norm.process(str(file), ops)
            box = fixed.getbbox()
            if not box:
                raise ValueError(f'Frame{i} is empty')
            body = fixed.crop(box)
            if body.width > 110 or body.height > 106:
                raise ValueError(f'Frame{i} would clip; do not silently shrink it')
            prepared.paste(body, (x + (112 - body.width) // 2, y + 107 - body.height))
            operations.append({'frame': i, **report})
            if i < 12:
                heights.append(body.height)
    folder = output / 'fuentes'
    folder.mkdir(parents=True)
    file = folder / 'hoja_preparada.png'
    prepared.save(file)
    manifest = {'source': str(file.relative_to(ROOT)),
                'sourceSha256': hashlib.sha256(file.read_bytes()).hexdigest(),
                'targetHeight': float(np.median(heights)), 'bottomAnchorFrames': list(range(36))}
    (folder / 'importacion.json').write_text(json.dumps(manifest, indent=2) + '\n')
    recipe = {'source': str(source.relative_to(ROOT)),
              'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
              'normalizer': 'tools/art/normalize_sprites.py:process', 'operations': ops,
              'frameOperations': operations, 'resized': False, 'newImagesGenerated': 0}
    (folder / 'normalizacion.json').write_text(json.dumps(recipe, indent=2) + '\n')
    receipt = importer.build(manifest, output / 'campeones')
    scan = scanner.analyze(str(output / 'campeones/atlas.png'))
    result = {'status': 'PREPARED_NOT_APPROVED', 'import': receipt, 'scanner': scan,
              'pending': ['visual review, pose direction, proportions, animation and runtime gates']}
    (output / 'preparation.json').write_text(json.dumps(result, indent=2, default=lambda x: x.item()) + '\n')
    print(json.dumps(result, default=lambda x: x.item()))


if __name__ == '__main__':
    main()
