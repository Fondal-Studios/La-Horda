#!/usr/bin/env python3
"""Retoque de atlas instalados que no salen del Pintor (aurelia, ynara, mago/codex-v1).

Parte de la hoja de origen guardada en art-source/retouch-base/<id>.png (sin retocar) y escribe el atlas instalado,
de modo que repetirlo da siempre el mismo resultado:  python3 tools/art/painter/retouch/installed.py aurelia ynara mago
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import *

ROOT = Path(__file__).resolve().parents[4]
BASE = ROOT / 'art-source/retouch-base'
DEST = {'aurelia': 'assets/sprites/champions/aurelia/atlas.png', 'ynara': 'assets/sprites/champions/ynara/atlas.png',
        'mago': 'assets/sprites/champions/mago/codex-v1/atlas.png'}
IDLE_BASE = {'down': 0, 'side': 4, 'up': 8}


def add_idle(a, cs, cols=4):
    n0 = (a.shape[0] // cs) * cols
    a = grow(a, 2, cs, cols)
    for k, d in enumerate(('down', 'side', 'up')):
        base = cell(a, IDLE_BASE[d], cs, cols)
        put(a, n0 + 2 * k, breathe(base, 'down'), cs, cols)
        put(a, n0 + 2 * k + 1, breathe(base, 'up'), cs, cols)
    return a, n0


def aurelia(a):
    for i in range(32):
        put(a, i, binarize(despeckle_alpha(cell(a, i), 4)))
    # la muerte original terminaba en dos cuadros casi invisibles: se conservan golpe (32) y rodillas (33) y el
    # desplome (34, 35) sale del cuadro 33 girado, apoyado en el suelo
    k33 = cell(a, 33)
    f = fall_sequence(k33, 4)
    put(a, 34, f[2])
    put(a, 35, f[3])
    a, n0 = add_idle(a, 112)
    return quantize(a), n0


def ynara(a):
    cs = 96
    for i in range(24):
        put(a, i, binarize(despeckle_alpha(cell(a, i, cs), 4), 128), cs)
    # muerte: 3 cuadros solapados en bloque -> caída de 4 cuadros desde el perfil de Ynara (cuadros 24..27)
    for i, c in zip(range(24, 28), fall_sequence(cell(a, 4, cs), 4, cs)):
        put(a, i, c, cs)
    a, n0 = add_idle(a, cs)
    return quantize(a), n0


def _fit(c, top=6, feet=105):
    """Cuadro a otra escala que el resto: se lleva a la altura del roster (vecino más cercano) y se apoya en los pies."""
    b = bbox(c)
    s = (feet - top) / float(b[1] - b[0])
    cx = (b[2] + b[3]) / 2.0
    t = transform(c, 0, s, pivot=(cx, float(b[1])))
    return ensure_outline(ground(t, feet, cx=cx))


def _main_bottom(c):
    from scipy import ndimage
    on = c[..., 3] > 0
    lab, n = ndimage.label(on, structure=np.ones((3, 3)))
    sz = ndimage.sum(on, lab, range(1, n + 1))
    k = int(np.argmax(sz)) + 1
    ys = np.where((lab == k).any(1))[0]
    return lab, n, k, int(ys.max())


def mago(a):
    feet = 105
    for i in range(32):
        c = cell(a, i)
        if i in (17, 18, 19, 26):   # polvo suelto bajo los pies y cuerpo apoyado 11-21 px más arriba que el resto
            lab, n, k, bot = _main_bottom(c)
            for m in range(1, n + 1):
                ys, xs = np.where(lab == m)
                if m != k and ys.min() > bot - 2 and len(ys) < 400:
                    c[lab == m] = 0
            if bot < feet - 2:
                c = ground(c, feet)
        if i in (12, 13, 15, 16, 19, 20, 21, 23):
            c = despeckle_alpha(c, 6)
        put(a, i, binarize(c))
    put(a, 13, _fit(cell(a, 13)))   # ataque de frente con el cuerpo más chico que el resto
    a, n0 = add_idle(a, 112)
    return quantize(a, 47), n0


FN = {'aurelia': aurelia, 'ynara': ynara, 'mago': mago}

if __name__ == '__main__':
    for n in sys.argv[1:]:
        a = np.array(Image.open(BASE / (n + '.png')).convert('RGBA'))
        out, n0 = FN[n](a)
        Image.fromarray(out).save(ROOT / DEST[n])
        print(n, out.shape, 'colores', ncolors(out), 'primer cuadro de idle', n0)
