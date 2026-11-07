#!/usr/bin/env python3
"""Cruza lo que dibuja cada habilidad (ability-assets.js) con la «pintura» de cada imagen: nº de colores y % de alfa parcial (suavizado).
Un PNG de efectos de pixel art nativo tiene pocos colores y alfa binario; el arte pintado tiene miles de colores y bordes suaves."""
import json, os, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')) + '/'
d = json.load(open(sys.argv[1])); cache = {}
def stats(rel):
    if rel in cache: return cache[rel]
    for cand in (rel, rel.replace('.webp', '.png')):
        p = R + cand
        if os.path.exists(p):
            im = Image.open(p).convert('RGBA'); n = len(im.getcolors(1 << 24) or [])
            a = im.getchannel('A'); px = im.width * im.height; semi = sum(1 for v in a.getdata() if 8 < v < 248) / max(1, px)
            cache[rel] = (n, round(semi * 100, 1), im.size); return cache[rel]
    cache[rel] = (None, None, None); return cache[rel]
rows = []
for k, slots in d['res'].items():
    for slot, imgs in slots.items():
        for rel in imgs:
            if rel.startswith(('assets/ui/', 'assets/sprites/', 'assets/fonts/', 'assets/icons/')): continue   # cuerpos, arenas e interfaz: no son efectos
            n, semi, size = stats(rel)
            if n is not None and (n > 3000 or semi > 15): rows.append((k, slot, rel, n, semi, size))
print(f'{len(rows)} usos de arte de EFECTO pintado (>3000 colores o >15 % de alfa parcial)')
for r in sorted(rows): print(r)
