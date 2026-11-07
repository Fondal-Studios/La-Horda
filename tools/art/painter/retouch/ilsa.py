"""Ilsa: retoque posterior (muerte propia, pelo sin ruido, idle de 4 cuadros, paleta <= 48)."""
import numpy as np
from lib import *

IDLE_BASE = {'down': 0, 'side': 4, 'up': 8}


def retouch(a):
    a = a.copy()
    for i in range(32):
        c = binarize(despeckle_alpha(cell(a, i), 4))
        put(a, i, despeckle_color(c))
    for i, c in zip(range(32, 36), fall_sequence(cell(a, 4), 4)):  # el original traía la fila del donante (capucha, pelo blanco)
        put(a, i, c)
    a = grow(a, 2)
    for k, d in enumerate(('down', 'side', 'up')):
        base = cell(a, IDLE_BASE[d])
        put(a, 36 + 2 * k, breathe(base, 'down'))
        put(a, 37 + 2 * k, breathe(base, 'up'))
    return quantize(a)
