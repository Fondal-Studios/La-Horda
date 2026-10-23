#!/usr/bin/env python3
"""Arma las hojas "antes / después" de docs/vfx/compare/ a partir de las capturas de tools/vfx/audit-abilities.js
(docs/vfx/shots/antes y docs/vfx/shots/despues, ver ese script). Cada hoja: 5 filas (básico, habilidades 1-3, definitiva) y 4 columnas:
antes a los 200 ms y a los 450 ms, después a los 200 ms y a los 450 ms. Se guarda cuantizada (256 colores) para que pese poco.
Uso: python3 tools/vfx/make-compare.py [campeón ...]"""
import os, sys, json
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SH = os.path.join(ROOT, 'docs/vfx/shots')
OUT = os.path.join(ROOT, 'docs/vfx/compare')
CW, CH, LBL = 300, 210, 120   # celda y ancho de la columna de etiquetas de la hoja original
os.makedirs(OUT, exist_ok=True)
keys = sys.argv[1:] or sorted(f[:-4] for f in os.listdir(os.path.join(SH, 'despues')) if f.endswith('.png'))
for k in keys:
    a = Image.open(os.path.join(SH, 'antes', k + '.png')).convert('RGB')
    d = Image.open(os.path.join(SH, 'despues', k + '.png')).convert('RGB')
    W = LBL + CW * 4
    sheet = Image.new('RGB', (W, CH * 5 + 22), (17, 17, 17))
    dr = ImageDraw.Draw(sheet)
    for i, t in enumerate(['ANTES 200 ms', 'ANTES 450 ms', 'DESPUES 200 ms', 'DESPUES 450 ms']):
        dr.text((LBL + i * CW + 6, 5), t, fill=(255, 220, 120) if i >= 2 else (200, 200, 200))
    for row in range(5):
        sheet.paste(d.crop((0, row * CH, LBL, row * CH + CH)), (0, 22 + row * CH))
        for i, (src, col) in enumerate([(a, 1), (a, 2), (d, 1), (d, 2)]):
            sheet.paste(src.crop((LBL + col * CW, row * CH, LBL + col * CW + CW, row * CH + CH)), (LBL + i * CW, 22 + row * CH))
    sheet = sheet.resize((int(W * .8), int(sheet.height * .8)), Image.LANCZOS).quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    sheet.save(os.path.join(OUT, k + '.png'), optimize=True)
    print(k, os.path.getsize(os.path.join(OUT, k + '.png')) // 1024, 'KB')
