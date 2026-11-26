#!/usr/bin/env python3
"""Pack the new chroma-key source; retain all 36 approved cells byte-for-byte."""
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DELIVERY = ROOT / 'art-source/entregas/guerrero-codex-20261125/integracion-direccional-06'
BASE = ROOT / 'assets/sprites/champions/guerrero/codex-v1/atlas.png'
OUT = ROOT / 'assets/sprites/champions/guerrero/codex-v2/atlas.png'

def build():
    source = Image.open(DELIVERY / 'source-green.png').convert('RGB')
    base = Image.open(BASE).convert('RGBA')
    assert base.size == (576, 1296)
    frames, records = [], []
    for row in range(2):
        row_frames = []
        for col in range(4):
            box = (round(col*source.width/4), round(row*source.height/2),
                   round((col+1)*source.width/4), round((row+1)*source.height/2))
            rgb = np.array(source.crop(box))
            r, g, b = (rgb[:, :, i].astype(int) for i in range(3))
            # Same chroma-key convention as pack-thalen-codex.py. Source is opaque;
            # this removes only its deliberately green backdrop, never thresholds alpha.
            bg = (g > 82) & (g > r+26) & (g > b+26)
            rgba = np.dstack((rgb, np.where(bg, 0, 255).astype('uint8')))
            rgba[bg] = 0
            raw = Image.fromarray(rgba)
            bounds = raw.getbbox()
            assert bounds and min(bounds[:2]) > 0
            assert bounds[2] < raw.width and bounds[3] < raw.height
            row_frames.append(raw.crop(bounds))
        # ONE scale for the entire fall, so the prone body is never enlarged.
        # Match the 71px standing body used by the existing gameplay metadata.
        scale = 71 / row_frames[0].height
        for col, raw in enumerate(row_frames):
            size = (round(raw.width*scale), round(raw.height*scale))
            assert max(size) < 136
            frame = raw.resize(size, Image.Resampling.NEAREST)
            cell = Image.new('RGBA', (144, 144))
            cell.paste(frame, ((144-frame.width)//2, 136-frame.height))
            frames.append(cell)
            records.append({'frame':36+row*4+col,'direction':['side','up'][row],
                            'phase':col,'sourceSize':list(raw.size),'scale':scale,
                            'bbox':list(cell.getbbox()),'opaque':int((np.array(cell)[:,:,3]==255).sum())})
    atlas = Image.new('RGBA', (576, 1584))
    atlas.paste(base, (0, 0))
    for i, frame in enumerate(frames):
        atlas.paste(frame, ((i%4)*144, 1296+(i//4)*144))
    assert atlas.crop((0,0,576,1296)).tobytes() == base.tobytes()
    assert set(atlas.getchannel('A').getdata()) <= {0,255}
    assert all(r['opaque'] > 150 for r in records)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(OUT)
    preview = Image.new('RGBA', (576,432), '#202431')
    # First row: existing side/up references and historic death, at real atlas scale.
    for col, idx in enumerate([4,8,34,35]):
        preview.alpha_composite(base.crop(((idx%4)*144,(idx//4)*144,(idx%4+1)*144,(idx//4+1)*144)),(col*144,0))
    preview.alpha_composite(atlas.crop((0,1296,576,1584)), (0,144))
    preview.save(DELIVERY/'comparison.png')
    report = {'sourceSha256':hashlib.sha256((DELIVERY/'source-green.png').read_bytes()).hexdigest(),
              'atlasSha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),
              'preservedCells':36,'newCells':8,'binaryAlpha':True,'frames':records}
    (DELIVERY/'TECHNICAL.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))

if __name__ == '__main__':
    build()
