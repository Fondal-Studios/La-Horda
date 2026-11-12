#!/usr/bin/env python3
"""Referencia @codex LIMPIA para Runway: recorta de la lámina del Códice solo las vistas de sprite (frente/lado/espalda), sin título ni rótulos.
Por qué: con la lámina completa Runway copia el texto del título («ALDRIC», «FRENTE»…) dentro de la imagen y la rechaza el criterio §6 de RECETA.md.
Además la lámina completa pasa de 2,355 de ancho/alto (Runway la rechaza); el recorte se rellena con el color de fondo hasta ≤ 2,2.
Uso: python3 tools/art/codex-clean.py <id> [<id>...] | --all     -> art-source/runway-codex-clean/<id>.png
Mide la región sobre la rejilla de las láminas de 1774×887; si una lámina tiene otro tamaño, avisa y no la recorta (hay que revisarla a mano)."""
import os, sys, glob
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BOX = (770, 300, 1760, 632)
def clean(cid):
    src = os.path.join(ROOT, 'assets/ui/codex/champions', cid + '.png')
    if not os.path.exists(src): return None, 'no existe la lámina'
    im = Image.open(src).convert('RGB')
    if im.size != (1774, 887): return None, 'tamaño %dx%d: revisar a mano' % im.size
    c = im.crop(BOX); bg = im.getpixel((900, 250)); h = int(c.width / 2.2)
    n = Image.new('RGB', (c.width, h), bg); n.paste(c, (0, (h - c.height) // 2))
    out = os.path.join(ROOT, 'art-source/runway-codex-clean', cid + '.png'); os.makedirs(os.path.dirname(out), exist_ok=True); n.save(out)
    return out, 'ok'
if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(2)
    ids = sorted(os.path.basename(f)[:-4] for f in glob.glob(os.path.join(ROOT, 'assets/ui/codex/champions/*.png'))) if a == ['--all'] else a
    for i in ids:
        o, m = clean(i); print(i, m, os.path.relpath(o, ROOT) if o else '')
