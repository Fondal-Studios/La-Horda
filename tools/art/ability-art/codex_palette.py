#!/usr/bin/env python3
"""Paleta de referencia de cada guardián, leída de su lámina del Códice (assets/ui/codex/champions/<id>.png, 1774x887):
a la derecha de la lámina está «BASE PARA SPRITES» con 8 muestras de color. Esas 8 muestras son la referencia de color de todo el arte
del guardián; la rampa de 5 tonos de sus habilidades se deriva de ellas (derive_ramp) y el Evaluador mide la fidelidad (codex_fidelity).
Uso: python3 tools/art/ability-art/codex_palette.py            # escribe docs/art-gate/ability-art/codex-palettes.json"""
import colorsys
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import canon  # noqa: E402

CODEX = canon.ROOT / 'assets' / 'ui' / 'codex' / 'champions'
OUT = canon.OUT_DOCS / 'codex-palettes.json'
ROW_Y = (700, 756)       # franja de las muestras en la lámina de 1774x887
X0, X1 = 940, 1545


def swatches(path):
    """8 muestras en posiciones fijas de la plantilla de la lámina (x0=970, paso 70,7 px, ancho 52)."""
    im = np.array(Image.open(path).convert('RGB')).astype(int)
    cols = []
    for k in range(8):
        a = int(970 + k * 70.7)
        blk = im[708:748, a + 10:a + 42].reshape(-1, 3)
        cols.append('#%02x%02x%02x' % tuple(int(v) for v in np.median(blk, axis=0)))
    return cols


def hsv(hexc):
    r, g, b = canon.hex_rgb(hexc)
    return colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)


def mix(a, b, t):
    A, B = canon.hex_rgb(a), canon.hex_rgb(b)
    return '#%02x%02x%02x' % tuple(int(round(A[i] + (B[i] - A[i]) * t)) for i in range(3))


def derive_ramp(sw):
    """Rampa [contorno, sombra, base, luz, brillo]: el acento es la muestra más saturada (con luz levantada para que se lea sobre el suelo)."""
    by_l = sorted(sw, key=lambda c: canon.lum(canon.hex_rgb(c)))
    o = mix(by_l[0], '#000000', 0.2)
    colorful = [c for c in sw if canon.lum(canon.hex_rgb(c)) > 0.02] or sw
    acc = max(colorful, key=lambda c: hsv(c)[1] * (1 - 0.08 * sw.index(c)))   # las primeras muestras del códice son el color primario
    h, s, v = hsv(acc)
    r, g, b = colorsys.hsv_to_rgb(h, min(1.0, max(s, 0.35) * 1.05), max(v, 0.66))
    a = '#%02x%02x%02x' % (int(r * 255), int(g * 255), int(b * 255))
    lightest = by_l[-1]
    d = mix(a, o, 0.55)
    bl = mix(a, lightest, 0.5)
    c = mix(lightest, '#ffffff', 0.6)
    return [o, d, a, bl, c]


def hue_dist(h1, h2):
    d = abs(h1 - h2) % 1.0
    return min(d, 1 - d) * 360


def main():
    out = {}
    for f in sorted(CODEX.glob('*.png')):
        sw = swatches(f)
        out[f.stem] = {'swatches': sw, 'ramp': derive_ramp(sw) if len(sw) >= 4 else None}
        print(f.stem, len(sw), out[f.stem]['ramp'])
    canon.save_json(OUT, out)


if __name__ == '__main__':
    main()
