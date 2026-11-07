#!/usr/bin/env python3
"""ATLAS DE REFERENCIA ARTISTICO (guardianes del Códice a una MISMA altura).
Recorta FRENTE / LADO / ESPALDA de cada hoja del Códice (assets/ui/codex/champions/<id>.png) con el mismo método que
tools/art-world/build-codex-trio.py, las lleva TODAS a la misma altura (REF_H px, vecino más cercano, pies sobre una línea común)
y las ordena en láminas por rol. Salida: docs/art/referencia/guardianes_*.png + guardianes.json. Determinista, sin IA.
Uso: python3 tools/art/build-reference-atlas.py [--h 128]"""
import sys, json, importlib.util
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('trio', ROOT / 'tools/art-world/build-codex-trio.py'); trio = importlib.util.module_from_spec(spec); spec.loader.exec_module(trio)
REF_H = int(sys.argv[sys.argv.index('--h') + 1]) if '--h' in sys.argv else 128
OUT = ROOT / 'docs/art/referencia'; OUT.mkdir(parents=True, exist_ok=True)
BG = (26, 20, 30); LINE = (92, 74, 60); TXT = (214, 196, 170)

def norm(im):
    im = im.crop(im.getbbox())
    w = max(1, round(im.width * REF_H / im.height))
    return im.resize((w, REF_H), Image.NEAREST)

def font(sz):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', '/usr/share/fonts/dejavu/DejaVuSansMono.ttf'):
        if Path(p).exists(): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()

def role_of():
    r = {}
    try:
        d = json.load(open(ROOT / 'docs/art/ATLAS_ARTE.json'))
        for k, v in d['champions'].items(): r[k] = v.get('status', '')
    except Exception: pass
    return r

ids = sorted(p.stem for p in (ROOT / 'assets/ui/codex/champions').glob('*.png'))
status = role_of(); rows = []; meta = {}
for gid in ids:
    try:
        v = trio.views(gid)
        if any(x.getbbox() is None for x in v): raise ValueError('vista vacía')
        rows.append((gid, [norm(x) for x in v]))
    except Exception as e:
        meta[gid] = {'error': str(e)}
PER = 8; F = font(14); FS = font(11)
sheets = []
for si in range(0, len(rows), PER):
    chunk = rows[si:si + PER]
    cw = max(sum(x.width for x in vs) + 2 * 20 + 80 for _, vs in chunk)
    rowh = REF_H + 54
    W = cw; H = rowh * len(chunk) + 20
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im)
    for i, (gid, vs) in enumerate(chunk):
        y0 = 10 + i * rowh; base = y0 + 18 + REF_H
        d.text((12, y0), f'{gid}  [{status.get(gid, "")}]', fill=TXT, font=F)
        x = 12
        for k, v in enumerate(vs):
            im.paste(v, (x, base - REF_H), v); x += v.width + 40
        d.line([(8, base), (W - 8, base)], fill=LINE)
        meta[gid] = {'views': [v.size for v in vs], 'refH': REF_H}
    n = f'guardianes_{si // PER + 1:02d}.png'; im.save(OUT / n); sheets.append(n)
json.dump({'refH': REF_H, 'sheets': sheets, 'guardians': meta, 'source': 'assets/ui/codex/champions/*.png (FRENTE/LADO/ESPALDA)'}, open(OUT / 'guardianes.json', 'w'), indent=1, ensure_ascii=False)
print('hojas', sheets, 'guardianes', len(rows), 'errores', [k for k, v in meta.items() if 'error' in v])
