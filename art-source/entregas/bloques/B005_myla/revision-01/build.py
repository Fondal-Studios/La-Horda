"""Extract Myla authored supplements reproducibly; never install or approve art."""
from pathlib import Path
import hashlib
import importlib.util
import json
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
spec = importlib.util.spec_from_file_location('scanner', ROOT / 'tools/art/scan_sprites.py')
scanner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scanner)
recipe = json.loads((HERE / 'recipe.json').read_text())
reports = []
for sheet in recipe['sheets']:
    source = HERE / sheet['source']
    assert hashlib.sha256(source.read_bytes()).hexdigest() == sheet['sha256']
    image = Image.open(source).convert('RGBA')
    pixels = np.array(image)
    mask = pixels[:, :, 3] >= 128
    labels, count = ndimage.label(mask, np.ones((3, 3)))
    assert count == sheet['count'], (source.name, 'unexpected islands', count)
    bounds = []
    for label, region in enumerate(ndimage.find_objects(labels), 1):
        y, x = region
        bounds.append((x.start, y.start, x.stop, y.stop, label))
    bounds.sort(key=lambda b: (b[1] + b[3]) / 2)
    ordered = []
    for row in range(sheet['count'] // 4):
        group = sorted(bounds[row * 4:row * 4 + 4], key=lambda b: b[0])
        assert all(abs((b[0] + b[2]) / 2 / image.width * 4 - (col + .5)) < .45 for col, b in enumerate(group))
        ordered.extend(group)
    scale = sheet['uprightHeight'] / np.median([b[3] - b[1] for b in ordered[:4]])
    cells = []
    for b in ordered:
        x, y, right, bottom, label = b
        data = pixels[y:bottom, x:right].copy()
        own = labels[y:bottom, x:right] == label
        data[~own] = 0
        data[:, :, 3] = np.where(own, 255, 0)
        body = Image.fromarray(data).resize((round((right-x)*scale), round((bottom-y)*scale)), Image.Resampling.NEAREST)
        assert body.width <= 110 and body.height <= 105, 'Pose clips at uniform scale'
        cell = Image.new('RGBA', (112, 112))
        cell.paste(body, ((112-body.width)//2, 107-body.height))
        cells.append(cell)
    contact = Image.new('RGBA', (448, 112 * (len(cells)//4)))
    for i, cell in enumerate(cells):
        contact.paste(cell, ((i%4)*112, (i//4)*112))
    contact.save(HERE / sheet['contact'])
    for name, indices in sheet['clips'].items():
        clip = Image.new('RGBA', (112*len(indices), 112))
        for i, frame in enumerate(indices):
            clip.paste(cells[frame], (112*i, 0))
        output = HERE / (name + '.png')
        if output.exists():
            assert Image.open(output).tobytes() == clip.tobytes(), 'Reproduction changed'
        else:
            clip.save(output)
        reports.append({'clip': output.name, 'source':source.name, 'frames':indices,
            'sourceRects':[list(ordered[i][:4]) for i in indices], 'uniformScale':float(scale),
            'sha256':hashlib.sha256(output.read_bytes()).hexdigest(), 'scanner':scanner.analyze(str(output))})
(HERE / 'extraction.json').write_text(json.dumps({'status':'EXTRACTED_NOT_APPROVED','clips':reports}, indent=2, default=lambda x:x.item()) + '\n')
print(json.dumps(reports, default=lambda x:x.item()))
