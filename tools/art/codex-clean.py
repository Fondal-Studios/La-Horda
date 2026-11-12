#!/usr/bin/env python3
"""Referencia @codex LIMPIA para Runway: recorta de la lámina del Códice solo las vistas de sprite (frente/lado/espalda), sin título ni rótulos.
Por qué: con la lámina completa Runway copia el texto del título («ALDRIC», «FRENTE»…) dentro de la imagen y la rechaza el criterio §6 de RECETA.md.
Además la lámina completa pasa de 2,355 de ancho/alto (Runway la rechaza); el recorte se rellena con el color de fondo hasta ≤ 2,2.
Uso: python3 tools/art/codex-clean.py <id> [<id>...] | --all     -> art-source/runway-codex-clean/<id>.png
Corta justo bajo la línea de tierra de los pies (la detecta por lámina; los rótulos quedan fuera); mide la región sobre la rejilla de las láminas de 1774×887; si una lámina tiene otro tamaño, avisa y no la recorta (hay que revisarla a mano)."""
import os, sys, glob
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BOX = (770, 300, 1760, 632)
def ground_row(im):
    """Última fila de la línea de tierra bajo los pies (3 tramos largos de color tierra). Los rótulos FRENTE/LADO/ESPALDA y la paleta van debajo,
    a una altura que cambia por lámina (606-650), así que se corta justo bajo esa línea."""
    import numpy as np
    a = np.array(im.crop((BOX[0], 0, BOX[2], im.height))).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    brown = (r > g) & (g > b) & ((r - b) > 25) & (r < 200)
    def runs(row):
        n = 0; c = 0
        for v in row:
            if v: c += 1
            else:
                if c >= 80: n += 1
                c = 0
        return n + (1 if c >= 80 else 0)
    last = None
    for y in range(540, 700):
        if runs(brown[y]) >= 3: last = y
        elif last is not None and y - last > 4: break
    return last
def clean(cid):
    src = os.path.join(ROOT, 'assets/ui/codex/champions', cid + '.png')
    if not os.path.exists(src): return None, 'no existe la lámina'
    im = Image.open(src).convert('RGB')
    if im.size != (1774, 887): return None, 'tamaño %dx%d: revisar a mano' % im.size
    y1 = ground_row(im)
    if y1 is None: return None, 'no se encontró la línea de tierra: revisar a mano'
    c = im.crop((BOX[0], BOX[1], BOX[2], y1 + 6)); bg = im.getpixel((900, 250)); h = int(c.width / 2.2)
    n = Image.new('RGB', (c.width, h), bg); n.paste(c, (0, (h - c.height) // 2))
    out = os.path.join(ROOT, 'art-source/runway-codex-clean', cid + '.png'); os.makedirs(os.path.dirname(out), exist_ok=True); n.save(out)
    return out, 'ok'
if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(2)
    ids = sorted(os.path.basename(f)[:-4] for f in glob.glob(os.path.join(ROOT, 'assets/ui/codex/champions/*.png'))) if a == ['--all'] else a
    for i in ids:
        o, m = clean(i); print(i, m, os.path.relpath(o, ROOT) if o else '')
