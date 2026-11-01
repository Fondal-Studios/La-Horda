#!/usr/bin/env python3
"""Genera las hojas de sprites de efectos de botones (pixel art, animación por fotogramas tipo GIF).
Salida: css/ui-factory/fx/press-spark.png (6 fotogramas) y confirm-burst.png (8). Cada fotograma 32x32 lógicos, escalado x2 sin suavizado.
Se tiñen por botón en CSS (filter hue-rotate), no hay un archivo por color. Reproducible: python3 tools/ui-factory/make-fx.py"""
import math, os
from PIL import Image
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'css', 'ui-factory', 'fx')
S = 32
def px(img, x, y, c):
    for dx in (0, 1):               # trazo de 2 px: legible a tamaño de botón
        for dy in (0, 1):
            if 0 <= x + dx < S and 0 <= y + dy < S: img.putpixel((x + dx, y + dy), c)
def frame_spark(i, n):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); t = i / (n - 1); r = 9 + t * 6
    a = int(255 * (1 - t) ** 0.8)
    for k in range(8):                       # 8 chispas que se alejan
        ang = k * math.pi / 4 + 0.2
        for d in (0, 1):
            x = int(S / 2 + math.cos(ang) * (r - d * 2)); y = int(S / 2 + math.sin(ang) * (r - d * 2))
            c = (255, 235, 110, a) if d == 0 else (255, 150, 30, int(a * .9))
            px(im, x, y, c); px(im, x + 1, y, c); px(im, x, y + 1, c)
    return im
def frame_burst(i, n):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); t = i / (n - 1); r = 8 + t * 8
    a = int(255 * (1 - t ** 3))
    for k in range(48):                      # anillo pixelado que se expande
        ang = k * math.pi * 2 / 48
        x = int(S / 2 + math.cos(ang) * r); y = int(S / 2 + math.sin(ang) * r)
        c = (255, 226, 80, a) if k % 2 == 0 else (255, 140, 20, a)
        px(im, x, y, c)
        if t < .6: px(im, x + (1 if math.cos(ang) > 0 else -1), y, (255, 160, 40, int(a * .6)))
    for k in range(12):                      # rayos largos
        ang = k * math.pi / 6
        for d in range(int(r * .55), int(r * 1.15)):
            x = int(S / 2 + math.cos(ang) * d); y = int(S / 2 + math.sin(ang) * d)
            px(im, x, y, (255, 200, 40, int(a * .9)))
    if i == 0:                               # destello central del primer fotograma
        for dx in range(-3, 4):
            for dy in range(-3, 4):
                if abs(dx) + abs(dy) <= 4: px(im, S // 2 + dx, S // 2 + dy, (255, 255, 255, 235))
    return im
def sheet(name, fn, n):
    sh = Image.new('RGBA', (S * n, S), (0, 0, 0, 0))
    for i in range(n): sh.paste(fn(i, n), (i * S, 0))
    sh = sh.resize((S * n * 2, S * 2), Image.NEAREST)
    os.makedirs(OUT, exist_ok=True); sh.save(os.path.join(OUT, name), optimize=True)
sheet('press-spark.png', frame_spark, 6)
sheet('confirm-burst.png', frame_burst, 8)
print('ok')
