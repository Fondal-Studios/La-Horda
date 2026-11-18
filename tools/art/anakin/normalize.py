#!/usr/bin/env python3
"""Iguala la escala de las secuencias de Anakin a la del personaje vivo (Anakin tiende a agrandar el cuerpo).
Para cada clave de art-source/anakin: k = alto del cuerpo en el cuadro de referencia / alto en el primer cuadro del estado.
Se aplica la MISMA k a todos los cuadros del estado (vecino mas cercano), apoyados en la misma linea de pies y centro.
Uso: python3 tools/art/anakin/normalize.py [clave ...]   (correr una sola vez por eleccion, antes de install.py)
"""
import glob, os, re, sys
from PIL import Image
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.chdir(ROOT)

def bf(key, w=448, h=384):
    im = Image.open(f'assets/sprites/battlefield/{key}.png').convert('RGBA').crop((0, 0, w, h))
    return im.resize((w // 2, h // 2), Image.NEAREST)

def cell(path, w, h, i, cols):
    im = Image.open(path).convert('RGBA'); x, y = (i % cols) * w, (i // cols) * h
    return im.crop((x, y, x + w, y + h))

REF = {
    'lobo_artico': lambda: cell('assets/sprites/enemies/hielo/lobo_artico/atlas.png', 96, 105, 4, 4),
    'demonio_mayor': lambda: cell('assets/sprites/bosses/infernal/demonio_mayor/atlas.png', 119, 119, 4, 4),
    'sabueso': lambda: cell('assets/sprites/arenas/micelial/sabueso/atlas.png', 272, 171, 4, 8),
    'kraken_joven': lambda: Image.open('assets/sprites/bosses/acuatica/kraken_joven/idle_01.png').convert('RGBA'),
    'lev_tentaculo': lambda: Image.open('assets/sprites/bosses/acuatica/kraken_joven/tent_01.png').convert('RGBA'),
    'ab_tentaculo': lambda: Image.open('assets/vfx/abismo/tent_grande_0.png').convert('RGBA'),
    'raiz_absorcion': lambda: Image.open('assets/sprites/arenas/micelial/fx/root_curl.png').convert('RGBA'),
}

def bbox_h(im):
    a = np.array(im)[..., 3] > 0; ys = np.where(a.any(1))[0]; return (ys.max() - ys.min() + 1) if len(ys) else 0

def norm(key):
    ref = REF[key]() if key in REF else bf(key)
    a = np.array(ref)[..., 3] > 0; ys, xs = np.where(a); base, cx = ys.max(), (xs.min() + xs.max()) // 2
    for estado in ('death', 'attack'):
        fs = sorted(glob.glob(f'art-source/anakin/{key}/{estado}_*.png'), key=lambda p: int(re.findall(r'_(\d+)\.png$', p)[0]))
        if not fs: continue
        ims = [Image.open(f).convert('RGBA') for f in fs]
        k = bbox_h(ref) / max(1, bbox_h(ims[0]))
        k = max(0.6, min(1.15, k))
        if abs(k - 1) < 0.03: print(key, estado, 'ok (k=%.2f)' % k); continue
        for f, im in zip(fs, ims):
            W, H = im.size; body = im.crop(im.getbbox())
            body = body.resize((max(1, round(body.width * k)), max(1, round(body.height * k))), Image.NEAREST)
            out = Image.new('RGBA', (W, H)); x0 = min(max(0, cx - body.width // 2), max(0, W - body.width)); y0 = max(0, base - body.height + 1)
            out.paste(body, (x0, y0)); out.save(f)
        print(key, estado, 'k=%.2f' % k)

keys = sys.argv[1:] or sorted(os.listdir('art-source/anakin'))
for k in keys:
    if os.path.isdir(f'art-source/anakin/{k}'): norm(k)
