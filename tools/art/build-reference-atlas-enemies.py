#!/usr/bin/env python3
"""Lleva los recortes de enemigos (art-source/reference-atlas/enemies, tomados del juego real) a una MISMA altura y arma
docs/art/referencia/enemigos_*.png agrupados por arena y rango. Uso: python3 tools/art/build-reference-atlas-enemies.py [--h 128]"""
import sys, json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[2]
REF_H = int(sys.argv[sys.argv.index('--h') + 1]) if '--h' in sys.argv else 128
SRC = ROOT / 'art-source/reference-atlas/enemies'; OUT = ROOT / 'docs/art/referencia'; OUT.mkdir(parents=True, exist_ok=True)
idx = json.load(open(SRC / '_index.json'))
BG = (26, 20, 30); LINE = (92, 74, 60); TXT = (214, 196, 170)
def font(sz):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',):
        if Path(p).exists(): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
F = font(11); RANK = {'normal': 0, 'elite': 1, 'subjefe': 2, 'boss': 3, 'jefe': 3}
items = [m for m in idx if not m.get('err')]
miss = [m['t'] for m in idx if m.get('err')]
items.sort(key=lambda m: (m['arena'], RANK.get(m['rank'], 1), m['t']))
sheets = []; meta = {}
for arena in sorted({m['arena'] for m in items}):
    grp = [m for m in items if m['arena'] == arena]
    COLS = 8; CW = 118; RH = REF_H + 34
    rows = [grp[i:i + COLS] for i in range(0, len(grp), COLS)]
    im = Image.new('RGB', (COLS * CW + 16, RH * len(rows) + 34), BG); d = ImageDraw.Draw(im)
    d.text((10, 8), f'{arena.upper()}  —  misma altura {REF_H}px', fill=TXT, font=font(13))
    for r, row in enumerate(rows):
        base = 34 + r * RH + REF_H
        for c, m in enumerate(row):
            s = Image.open(SRC / (m['t'] + '.png')).convert('RGBA'); s = s.crop(s.getbbox())
            w = max(1, round(s.width * REF_H / s.height)); sc = REF_H / s.height
            if w > CW - 6: s = s.resize((CW - 6, max(1, round(s.height * (CW - 6) / s.width))), Image.NEAREST)
            else: s = s.resize((w, REF_H), Image.NEAREST)
            x = 8 + c * CW + (CW - s.width) // 2
            im.paste(s, (x, base - s.height), s)
            d.text((8 + c * CW + 2, base + 4), (m['t'] + ('*' if m['rank'] != 'normal' else ''))[:17], fill=TXT, font=F)
            meta[m['t']] = {'arena': arena, 'rank': m['rank'], 'srcSize': [m['w'], m['h']], 'scale': round(sc, 3)}
        d.line([(8, base), (im.width - 8, base)], fill=LINE)
    n = f'enemigos_{arena}.png'; im.save(OUT / n); sheets.append(n)
json.dump({'refH': REF_H, 'sheets': sheets, 'enemies': meta, 'sinRender': miss, 'nota': '* = élite, subjefe o jefe. Fuente: drawEnemyBody del juego real (idle de frente).'}, open(OUT / 'enemigos.json', 'w'), indent=1, ensure_ascii=False)
print('hojas', sheets, 'enemigos', len(items), 'sin render', miss)
