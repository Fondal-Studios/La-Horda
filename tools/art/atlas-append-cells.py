#!/usr/bin/env python3
"""Amplia un atlas con filas nuevas SIN tocar los cuadros existentes (verifica byte a byte).
  python3 tools/art/atlas-append-cells.py --cell WxH --cols N <atlas_in.png> <atlas_out.png> <celda.png> [<celda.png> ...]   (--cell es WxH, p. ej. 192x160)
Las celdas nuevas se agregan a partir del primer cuadro libre tras la ultima fila (filas completas de N columnas). Imprime los indices."""
import argparse, sys
import numpy as np
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('atlas'); ap.add_argument('out'); ap.add_argument('--cell', required=True)
ap.add_argument('--cols', type=int, required=True); ap.add_argument('cells', nargs='+'); a = ap.parse_args()
W, H = map(int, a.cell.lower().split('x'))
src = Image.open(a.atlas).convert('RGBA'); sw, sh = src.size
if sw != W * a.cols or sh % H: sys.exit(f'atlas {sw}x{sh} no cuadra con celda {W}x{H} x {a.cols} col')
rows0 = sh // H; first = rows0 * a.cols; nrows = -(-len(a.cells) // a.cols)
out = Image.new('RGBA', (sw, sh + nrows * H), (0, 0, 0, 0)); out.paste(src, (0, 0))
for k, p in enumerate(a.cells):
    c = Image.open(p).convert('RGBA')
    if c.size[0] == W and c.size[1] > H:   # sheet-to-cells entrega celdas cuadradas: se recortan las filas de abajo si estan vacias
        assert not np.asarray(c)[H:, :, 3].any(), f'{p}: contenido bajo la fila {H}'; c = c.crop((0, 0, W, H))
    if c.size != (W, H): sys.exit(f'{p}: {c.size} != {(W, H)}')
    out.paste(c, ((k % a.cols) * W, sh + (k // a.cols) * H))
assert np.array_equal(np.asarray(out.crop((0, 0, sw, sh))), np.asarray(src)), 'cuadros viejos alterados'
out.save(a.out); print('indices nuevos:', list(range(first, first + len(a.cells))), 'tamano', out.size)
