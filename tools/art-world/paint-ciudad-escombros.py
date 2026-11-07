#!/usr/bin/env python3
"""Escombros de la Ciudad Maldita pintados a escala nativa (pintor determinista, 0 créditos): 3 montones (S/M/L) de bloques de piedra
violeta-gris con 3 tonos y contorno de 1 px, tablones quemados y brasas. Se dibujan x1 (sin ampliar) en cm-render.js.
Salida: assets/vfx/ciudad/escombros_s.png (44x26), escombros_m.png (60x34), escombros_l.png (80x44). Paleta tomada de tex_adoquin."""
import os, random
from PIL import Image, ImageDraw
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')) + '/'
OUT = (16, 11, 20)
STONE = [((88, 82, 104), (62, 57, 76), (40, 36, 52)), ((98, 88, 100), (70, 62, 76), (46, 40, 54)), ((78, 76, 96), (56, 54, 72), (36, 34, 48))]
WOOD = ((92, 58, 34), (62, 38, 24), (34, 20, 14))

def block(d, cx, cy, w, h, pal, rnd):
    # bloque irregular: polígono de 6 vértices, cara superior clara, lateral medio, base oscura
    pts = [(cx - w / 2 + rnd.uniform(0, 2), cy - h / 2 + rnd.uniform(0, 2)), (cx + w / 2 - rnd.uniform(0, 3), cy - h / 2 + rnd.uniform(0, 2)),
           (cx + w / 2 + rnd.uniform(-1, 1), cy + rnd.uniform(-1, 1)), (cx + w / 2 - rnd.uniform(0, 2), cy + h / 2),
           (cx - w / 2 + rnd.uniform(0, 3), cy + h / 2), (cx - w / 2 - rnd.uniform(0, 1), cy + rnd.uniform(-1, 1))]
    pts = [(round(x), round(y)) for x, y in pts]
    d.polygon(pts, fill=pal[1], outline=OUT)
    top = [pts[0], pts[1], (pts[1][0] - 1, round(cy - h * 0.1)), (pts[0][0] + 1, round(cy - h * 0.1))]
    d.polygon(top, fill=pal[0])
    d.line([pts[4], pts[3]], fill=pal[2], width=1)
    d.polygon(pts, outline=OUT)

def pile(w, h, seed):
    rnd = random.Random(seed)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for _ in range(max(1, w // 40)):  # tablones quemados detrás del montón
        x = rnd.randint(w // 6, w // 2); y = rnd.randint(h // 4, h // 2); L = rnd.randint(w // 3, w // 2)
        d.line([(x, y), (x + L, y - rnd.randint(2, 6))], fill=OUT, width=4)
        d.line([(x, y), (x + L, y - 4)], fill=WOOD[1], width=2)
        d.line([(x, y - 1), (x + L - 1, y - 5)], fill=WOOD[0], width=1)
    items = []
    for _ in range(max(8, w // 4)):
        fx = rnd.uniform(0.08, 0.92); top = 0.15 + 0.7 * abs(fx - 0.5) * 1.4   # perfil de montículo: más alto al centro
        items.append((fx, rnd.uniform(min(top, 0.8), 0.95)))
    items.sort(key=lambda t: t[1])
    for fx, fy in items:
        bw = rnd.randint(max(8, w // 8), max(11, w // 4)); bh = max(6, int(bw * rnd.uniform(0.55, 0.85)))
        block(d, round(fx * (w - bw) + bw / 2), round(fy * (h - bh) + bh / 2), bw, bh, STONE[rnd.randrange(3)], rnd)
    for _ in range(max(2, w // 14)):  # brasas
        x = rnd.randint(4, w - 5); y = rnd.randint(h // 3, h - 4)
        if im.getpixel((x, y))[3]: im.putpixel((x, y), (214, 108, 40, 255))
    return im

for name, (w, h, seed) in {'s': (44, 26, 11), 'm': (60, 34, 23), 'l': (80, 44, 37)}.items():
    pile(w, h, seed).save(R + 'assets/vfx/ciudad/escombros_%s.png' % name)
print('ok')
