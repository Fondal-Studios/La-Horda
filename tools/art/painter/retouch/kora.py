"""Kora: retoque posterior del ensamblado (muerte propia, ataque sin banda translúcida, idle de 4 cuadros, paleta <= 48)."""
import numpy as np, colorsys
from lib import *

IDLE_BASE = {'down': 0, 'side': 4, 'up': 8}


STEEL = [(44, 49, 54), (72, 80, 90), (100, 110, 122)]


def _band_fix(c, box):
    """Antebrazo con mezcla verde/naranja del donante: se pinta como acero del guantelete en 3 tonos por valor."""
    y0, y1, x0, x1 = box
    from scipy import ndimage
    on = c[..., 3] > 0
    holes = ndimage.binary_closing(on, structure=np.ones((7, 11)), iterations=1) & ~on   # huecos internos: se ve el fondo a través del brazo
    holes[:y0] = holes[y1:] = False
    holes[:, :x0] = holes[:, x1:] = False
    c[holes] = (*STEEL[1], 255)
    sub = c[y0:y1, x0:x1]
    for y in range(sub.shape[0]):
        for x in range(sub.shape[1]):
            p = sub[y, x]
            if p[3] == 0:
                continue
            h, s, v = colorsys.rgb_to_hsv(*(p[:3] / 255.0))
            if v < 0.14 or (0.02 < h < 0.11 and 0.15 < s < 0.6 and v > 0.55):
                continue  # contorno / piel
            sub[y, x, :3] = STEEL[0 if v < 0.28 else (1 if v < 0.42 else 2)]
    return c


# cuadros de perfil con el antebrazo mezclado: (y0,y1,x0,x1) medidos sobre la hoja
BANDS = {5: (68, 86, 26, 70), 7: (68, 86, 26, 70), 16: (66, 84, 24, 76), 17: (66, 84, 30, 78), 18: (73, 84, 26, 68), 19: (70, 84, 38, 82)}


def retouch(a):
    a = a.copy()
    for i, box in BANDS.items():
        put(a, i, _band_fix(cell(a, i), box))
    for i in range(36):
        put(a, i, binarize(despeckle_alpha(cell(a, i), 4)))
    # muerte: el original traía filas del donante (pelo oscuro, antiparras); se arma con el dibujo propio de Kora
    for i, c in zip(range(32, 36), fall_sequence(cell(a, 4), 4)):
        put(a, i, c)
    # idle: respiración (2 cuadros nuevos por vista)
    a = grow(a, 2)
    for k, d in enumerate(('down', 'side', 'up')):
        base = cell(a, IDLE_BASE[d])
        put(a, 36 + 2 * k, breathe(base, 'down'))
        put(a, 37 + 2 * k, breathe(base, 'up'))
    return quantize(a)
