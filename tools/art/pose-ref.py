#!/usr/bin/env python3
"""Recorta el cuadro N del atlas ACTUAL de un campeón para usarlo como `@pose` en Runway (docs/art-brief/runway-pack/RECETA.md §3).
Lee tamaño de celda y columnas de la línea `champPackLoadAtlas("<id>","<ruta>",{...})` que registra el atlas en el juego (no adivina 112×112:
hay atlas de 192×128 y de otras medidas). Uso:
   python3 tools/art/pose-ref.py <campeon> <cuadro> [<cuadro> ...]        -> art-source/runway-pose-refs/<campeon>/fNN.png
   python3 tools/art/pose-ref.py <campeon> --all                          -> todos los cuadros del atlas
Si el campeón no tiene atlas registrado, termina con error (usar un donante: RECETA §7)."""
import json, os, re, sys, glob
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def find(cid):
    pat = re.compile(r'champPackLoadAtlas\(\s*"%s"\s*,\s*"([^"]+)"\s*,\s*(\{.*?\})\s*\)\s*;?\s*$' % re.escape(cid))
    best = None
    for f in glob.glob(os.path.join(ROOT, 'js/**/*.js'), recursive=True):
        for line in open(f, encoding='utf-8', errors='ignore'):
            if 'champPackLoadAtlas' not in line or ('"%s"' % cid) not in line: continue
            m = pat.search(line.strip())
            if not m: continue
            path, meta = m.group(1), json.loads(m.group(2))
            if os.path.exists(os.path.join(ROOT, path)) and (best is None or '/skins/' in best[0]):
                best = (path, meta)
    return best
def main():
    a = sys.argv[1:]
    if len(a) < 2: print(__doc__); sys.exit(2)
    cid, frames = a[0], a[1:]
    r = find(cid)
    if not r: print('ERROR: %s no tiene atlas registrado en champPackLoadAtlas (ver RECETA §7: donante)' % cid); sys.exit(1)
    path, meta = r
    im = Image.open(os.path.join(ROOT, path)).convert('RGBA'); w, h, cols = meta['w'], meta['h'], meta['cols']
    n = (im.width // w) * (im.height // h)
    idx = list(range(n)) if frames == ['--all'] else [int(x) for x in frames]
    out = os.path.join(ROOT, 'art-source/runway-pose-refs', cid); os.makedirs(out, exist_ok=True)
    for i in idx:
        if not 0 <= i < n: print('ERROR: cuadro %d fuera de rango (0-%d)' % (i, n - 1)); sys.exit(1)
        im.crop(((i % cols) * w, (i // cols) * h, (i % cols) * w + w, (i // cols) * h + h)).save(os.path.join(out, 'f%02d.png' % i))
    print('%s: %s celda %dx%d, %d columnas, %d cuadros -> %s (%d guardados)' % (cid, path, w, h, cols, n, os.path.relpath(out, ROOT), len(idx)))
main()
