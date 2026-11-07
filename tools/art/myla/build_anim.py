#!/usr/bin/env python3
"""Myla: animación determinista sobre el atlas maestro aprobado (#259, art-source/myla/atlas-259-aprobado.png).
No pinta ni recolorea: (1) reduce la paleta a <=48 colores (cuantización sin dithering, sin alfa parcial);
(2) agrega 12 cuadros derivados por reubicación de píxeles: idle de respiración (1 px), anticipo de ataque (inclinación hacia atrás)
y seguimiento del golpe (inclinación hacia adelante) por dirección (abajo / lado / arriba). Los cuadros 0..11 originales no se mueven
(salvo la cuantización). Salida:
  assets/sprites/champions/myla/atlas.png               (384x576: 24 cuadros 96x96; 12..23 = cuadros nuevos)
  assets/sprites/champions/myla/cromas/myla_arandanos/atlas.png (misma grilla; rosa -> lila como en tools/art-world/build-myla-codex-extras.py)
  assets/sprites/champions/myla/skins/merienda_magica/atlas.png (24 cuadros originales + 12 derivados en las filas 6..8)
Uso: python3 tools/art/myla/build_anim.py"""
import os, colorsys, numpy as np
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')) + '/'
CELL = 96

def quantize(img, n=48):
    a = np.asarray(img.convert('RGBA')).copy(); op = a[:, :, 3] > 127
    rgb = a[:, :, :3].copy(); rgb[~op] = (30, 18, 22)           # fondo = color del contorno (no suma color nuevo)
    q = Image.fromarray(rgb, 'RGB').quantize(colors=n, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    out = np.asarray(q).copy(); alpha = np.where(op, 255, 0).astype(np.uint8)
    out = np.dstack([out, alpha]); out[~op, :3] = 0
    return Image.fromarray(out, 'RGBA')

def cell(img, r, c): return np.asarray(img.crop((c*CELL, r*CELL, c*CELL+CELL, r*CELL+CELL))).copy()

def bbox(a):
    ys, xs = np.where(a[:, :, 3] > 0); return xs.min(), xs.max(), ys.min(), ys.max()

def _cut(a, frac):
    x0, x1, y0, y1 = bbox(a); return y0, y0 + int(round(frac*(y1-y0)))

def breathe(a):
    """Respiración: tronco y cabeza bajan 1 px (las piernas quedan fijas)."""
    y0, yc = _cut(a, 0.62); n = a.copy()
    n[y0+1:yc+1] = a[y0:yc]; n[y0] = 0
    row = a[yc-1]; n[yc] = np.where((row[:, 3:4] > 0), row, a[yc])
    return n

def lean(a, dx, dy):
    """Inclinación del torso: desplazamiento horizontal creciente hacia arriba (dx px en la cabeza) y dy px vertical."""
    y0, yc = _cut(a, 0.62); n = a.copy(); top = a[y0:yc+1]
    n[y0:yc+1] = 0
    for i, y in enumerate(range(y0, yc+1)):
        s = int(round(dx*(yc-y)/max(1, yc-y0)))
        row = np.roll(top[i], s, axis=0)
        if s > 0: row[:s] = 0
        elif s < 0: row[s:] = 0
        yy = y + dy
        if 0 <= yy <= yc: n[yy] = np.where(row[:, 3:4] > 0, row, n[yy])
    n[yc] = np.where(n[yc][:, 3:4] > 0, n[yc], a[yc])   # sin hueco en la costura
    return n

def paste(atlas, a, r, c): atlas.alpha_composite(Image.fromarray(a, 'RGBA'), (c*CELL, r*CELL))

def extra_frames(img, row_base, row_dst):
    """Escribe en las filas row_dst..row_dst+2 los 3 cuadros derivados (col 0 idle2, 1 anticipo, 2 seguimiento) de cada dirección."""
    face = {0: 1, 1: 1, 2: 1}   # desplazamiento hacia el lado de la cuchara (derecha en pantalla) en las tres vistas
    for d in range(3):
        idle, atk = cell(img, row_base+d, 0), cell(img, row_base+d, 3)
        paste(img, breathe(idle), row_dst+d, 0)
        paste(img, lean(idle, -3 if d != 1 else -3, -1), row_dst+d, 1)
        paste(img, lean(atk, 2, 1), row_dst+d, 2)

def build_base():
    src = quantize(Image.open(R+'art-source/myla/atlas-259-aprobado.png'))
    out = Image.new('RGBA', (CELL*4, CELL*6), (0, 0, 0, 0)); out.alpha_composite(src, (0, 0))
    extra_frames(out, 0, 3)
    return out

def recolor_croma(img):
    a = np.asarray(img).astype(float)/255; o = a.copy()
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            r, g, b, al = a[y, x]
            if al < 0.1: continue
            h, s, v = colorsys.rgb_to_hsv(r, g, b); hd = h*360
            if s > 0.18 and (hd >= 300 or hd <= 12) and v > 0.45:
                h2 = (268+(hd-330 if hd >= 300 else hd+30)*0.25) % 360/360; r2, g2, b2 = colorsys.hsv_to_rgb(h2, min(1, s*0.95), v); o[y, x, :3] = (r2, g2, b2)
    return Image.fromarray((o*255).astype(np.uint8), 'RGBA')

def build_skin():
    src = Image.open(R+'art-source/myla/merienda-magica-atlas-original.png').convert('RGBA')
    out = Image.new('RGBA', (CELL*4, CELL*9), (0, 0, 0, 0)); out.alpha_composite(src, (0, 0))
    extra_frames(out, 0, 6)
    return out

if __name__ == '__main__':
    base = build_base(); base.save(R+'assets/sprites/champions/myla/atlas.png', optimize=True)
    recolor_croma(base).save(R+'assets/sprites/champions/myla/cromas/myla_arandanos/atlas.png', optimize=True)
    build_skin().save(R+'assets/sprites/champions/myla/skins/merienda_magica/atlas.png', optimize=True)
    print('ok')
