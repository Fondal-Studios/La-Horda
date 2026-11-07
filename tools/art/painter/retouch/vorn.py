"""Vorn: retoque posterior (ataque y muerte propios: el ensamblado trajo el torso barbudo del donante; idle de 4 cuadros; paleta <= 48)."""
import numpy as np
from lib import *

IDLE_BASE = {'down': 0, 'side': 4, 'up': 8}


def _lean(c, ang, dy=0):
    b = bbox(c)
    n = transform(c, ang, 1.0, pivot=((b[2] + b[3]) / 2.0, float(b[1])), shift=(0, dy))
    return ensure_outline(n)


def retouch(a):
    a = a.copy()
    for i in range(32):
        put(a, i, binarize(despeckle_alpha(cell(a, i), 4)))
    # ataque: cuadros 12/13 (frente) y 16/17 (perfil) traían el torso del donante -> carga hacia atrás y agachada, del propio Vorn
    put(a, 12, _lean(cell(a, 0), 9))
    put(a, 13, breathe(cell(a, 15), 'down'))
    put(a, 16, _lean(cell(a, 4), 10))
    put(a, 17, breathe(cell(a, 19), 'down'))
    for i, c in zip(range(32, 36), fall_sequence(cell(a, 4), 4)):
        put(a, i, c)
    a = grow(a, 2)
    for k, d in enumerate(('down', 'side', 'up')):
        base = cell(a, IDLE_BASE[d])
        put(a, 36 + 2 * k, breathe(base, 'down'))
        put(a, 37 + 2 * k, breathe(base, 'up'))
    return quantize(a)
