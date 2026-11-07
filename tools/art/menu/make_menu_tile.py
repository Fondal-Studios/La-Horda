#!/usr/bin/env python3
"""Genera assets/ui/menu-stone-64.png: tile pixel 64x64 (sillería de piedra oscura con dither), repetible.
Determinista (semilla fija). Paleta: marrones de css/base.css, muy oscura para no restar legibilidad al texto.
Uso: python3 tools/art/menu/make_menu_tile.py"""
import os, random
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
PAL = {"d": (11, 7, 5), "m": (20, 13, 9), "l": (29, 19, 13), "h": (40, 26, 17), "j": (6, 4, 3)}  # fondo, base, luz, brillo, junta
rnd = random.Random(2031)
W = 64
img = [["m"] * W for _ in range(W)]
# bloques 32x16 en hiladas alternadas (junta de 1 px, luz arriba/izquierda, sombra abajo/derecha)
for row in range(4):
    off = 16 if row % 2 else 0
    y0 = row * 16
    for bx in range(-1, 3):
        x0 = bx * 32 + off
        for y in range(y0, y0 + 16):
            for x in range(x0, x0 + 32):
                xx = x % W
                if y == y0 or x == x0: c = "j"
                elif y == y0 + 1 or x == x0 + 1: c = "h" if rnd.random() < .5 else "l"
                elif y == y0 + 15 or x == x0 + 31: c = "d"
                else:
                    # dither: motas más claras / más oscuras, más densas hacia arriba del bloque
                    t = (y - y0) / 16.0
                    r = rnd.random()
                    c = "l" if r < .10 * (1 - t) + .02 else ("d" if r > .90 + .06 * (1 - t) else "m")
                    if (x + y) % 2 == 0 and t > .6 and r < .25: c = "d"   # dither ordenado en la base
                img[y][xx] = c
out = Image.new("RGB", (W, W))
for y in range(W):
    for x in range(W):
        out.putpixel((x, y), PAL[img[y][x]])
dst = os.path.join(ROOT, "assets/ui/menu-stone-64.png")
out.save(dst, optimize=True)
print("ok", dst)
# brasas: tile 128x128 transparente con unas pocas motas de 2x2 (se desplazan lento hacia arriba por CSS)
em = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
r2 = random.Random(77)
for i in range(9):
    x, y = r2.randrange(0, 126, 2), r2.randrange(0, 126, 2)
    col = [(255, 122, 46, 150), (255, 207, 92, 130), (198, 70, 30, 120)][i % 3]
    for dx in range(2):
        for dy in range(2):
            em.putpixel((x + dx, y + dy), col)
em.save(os.path.join(ROOT, "assets/ui/menu-embers-128.png"), optimize=True)
print("ok embers")
