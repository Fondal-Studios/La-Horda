#!/usr/bin/env python3
"""Hoja de comparación arte ACTUAL (arriba) vs NUEVO (abajo) de un guardián, sobre suelo neutro, cuadros del pico.
   Uso: python3 tools/art/ability-art/compare.py <guardian> [salida.png]   (usa spec.work.json: lo último que pintó el lazo)"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
import canon, painter, pipeline  # noqa: E402

g = sys.argv[1]
d = canon.OUT_DOCS / g
spec = canon.load_json(d / 'spec.work.json')
rows = []
for a in spec['abilities']:
    ramp = canon.ramp_for(spec, a)
    base = pipeline.load_baseline(d / 'baseline', a, ramp)
    new = [canon.index_to_rgba(f, ramp) for f in painter.frames_for(g, a)]
    if not base:
        continue
    for fr in (base, new):
        n = len(fr)
        sel = [int(n * k) for k in (0.1, 0.3, 0.45, 0.7)]
        h, w = fr[0].shape[:2]
        sc = 3 if max(h, w) <= 48 else 2 if max(h, w) <= 112 else 1
        if a['kind'] == 'beam':
            sc = 6
        tile = Image.new('RGBA', (w * 4 * (2 if a['kind'] == 'beam' else 1), h), (62, 78, 56, 255))
        for i, k in enumerate(sel):
            im = Image.fromarray(fr[k], 'RGBA')
            if a['kind'] == 'beam':
                tile.alpha_composite(im, (i * w * 2, 0)); tile.alpha_composite(im, (i * w * 2 + w, 0))
            else:
                tile.alpha_composite(im, (i * w, 0))
        rows.append(tile.resize((tile.width * sc, tile.height * sc), Image.NEAREST))
W = max(r.width for r in rows)
out = Image.new('RGB', (W, sum(r.height + (10 if i % 2 else 3) for i, r in enumerate(rows))), (16, 16, 20))
y = 0
for i, r in enumerate(rows):
    out.paste(r, (0, y)); y += r.height + (10 if i % 2 else 3)
dst = sys.argv[2] if len(sys.argv) > 2 else str(d / 'compare.png')
out.save(dst, optimize=True); print(dst, out.size)
