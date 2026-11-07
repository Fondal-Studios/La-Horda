#!/usr/bin/env python3
"""Arma una hoja por guardián con las capturas de tools/art-world/ability-gallery.js.
  python3 tools/art-world/ability-sheets.py <carpeta_con_capturas> [guardián ...]   -> <carpeta>/<guardián>_hoja.png"""
import glob, os, sys
from PIL import Image, ImageDraw
d = sys.argv[1]; champs = sys.argv[2:] or sorted({os.path.basename(f).split('_')[0] if not os.path.basename(f).startswith(('facu_', 'nano_')) else '_'.join(os.path.basename(f).split('_')[:2]) for f in glob.glob(d + '/*_0_10.png')})
for k in champs:
    if not os.path.exists(f'{d}/{k}_ult_35.png'): continue
    W = Image.new('RGB', (2 * 580, 4 * 320), (18, 18, 22)); dr = ImageDraw.Draw(W)
    for r, slot in enumerate([0, 1, 2, 'ult']):
        for c, t in enumerate([10, 35]): W.paste(Image.open(f'{d}/{k}_{slot}_{t}.png').convert('RGB'), (c * 580, r * 320 + 18))
        dr.text((4, r * 320 + 3), f'{k} · {"definitiva" if slot == "ult" else "habilidad " + str(slot + 1)} · 160 ms | 560 ms', fill=(230, 200, 120))
    W.save(f'{d}/{k}_hoja.png'); print(k, 'ok')
