#!/usr/bin/env python3
"""Recorta el cuadro N del atlas ACTUAL de un campeón o enemigo para usarlo como `@pose` en Runway (docs/art-brief/runway-pack/RECETA.md §3).
Lee tamaño de celda y columnas del REGISTRO real del atlas en el juego (no adivina 112×112: hay atlas de 192×128, 103×98, 52×52...):
  campeones -> línea `champPackLoadAtlas("<id>","<ruta>",{w,h,cols,...})` (js/champions/**, js/assets/**)
  enemigos  -> entrada `"<id>":{"src":"<ruta>","meta":{"w":..,"h":..,"cols":..}}` de los js/assets/*-meta.js
Cada cuadro se guarda DOS veces: fNN.png (celda nativa) y fNN_1024.png (ampliado con vecino más cercano en múltiplo entero y centrado sobre un lienzo
oscuro de 1024×1024): ESTA es la que se pasa como @pose, porque gen4_image trabaja a 1024 y una referencia de 52–112 px llega borrosa.
   python3 tools/art/pose-ref.py <id> <cuadro> [<cuadro> ...]     -> art-source/runway-pose-refs/<id>/
   python3 tools/art/pose-ref.py <id> --all                       -> todas las celdas de la rejilla
   python3 tools/art/pose-ref.py <id> --info                      -> ruta, celda y columnas sin escribir nada
   python3 tools/art/pose-ref.py <id> <cuadro> --cell 52x52       -> enemigo SIN registro de celda en js/assets/*-meta.js: busca assets/sprites/**/<id>/atlas.png y usa esa celda a mano
Si el id no tiene atlas registrado, termina con error (usar un donante: RECETA §7). Importable: find(id) -> (ruta, meta) | None."""
import json, os, re, sys, glob
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def find(cid):
    pat = re.compile(r'champPackLoadAtlas\(\s*"%s"\s*,\s*"([^"]+)"\s*,\s*(\{.*?\})\s*\)\s*;?\s*$' % re.escape(cid))
    best = None
    for f in glob.glob(os.path.join(ROOT, 'js/**/*.js'), recursive=True):
        for line in open(f, encoding='utf-8', errors='ignore'):
            if 'champPackLoadAtlas' not in line or ('"%s"' % cid) not in line: continue
            m = pat.search(line.strip())
            if not m: continue
            try: path, meta = m.group(1), json.loads(m.group(2))
            except ValueError: continue   # metadatos que no son JSON puro: no se adivinan
            if os.path.exists(os.path.join(ROOT, path)) and (best is None or '/skins/' in best[0]):
                best = (path, meta)
    if best: return best
    pe = re.compile(r'"%s"\s*:\s*\{\s*"src"\s*:\s*"([^"]+)"\s*,\s*"meta"\s*:\s*\{\s*"w"\s*:\s*(\d+)\s*,\s*"h"\s*:\s*(\d+)\s*,\s*"cols"\s*:\s*(\d+)' % re.escape(cid))
    for f in sorted(glob.glob(os.path.join(ROOT, 'js/assets/*.js'))):
        m = pe.search(open(f, encoding='utf-8', errors='ignore').read())
        if m and os.path.exists(os.path.join(ROOT, m.group(1))):
            return m.group(1), {'w': int(m.group(2)), 'h': int(m.group(3)), 'cols': int(m.group(4))}
    return None
def main():
    from PIL import Image
    a = sys.argv[1:]
    if len(a) < 2: print(__doc__); sys.exit(2)
    cid, frames = a[0], a[1:]
    cell = None
    if '--cell' in frames:
        k = frames.index('--cell'); cell = [int(x) for x in frames[k + 1].lower().split('x')]; frames = frames[:k] + frames[k + 2:]
    r = find(cid)
    if not r and cell:
        g = glob.glob(os.path.join(ROOT, 'assets/sprites/**/%s/atlas.png' % cid), recursive=True)
        if g:
            from PIL import Image as _I
            wi = _I.open(g[0]).width
            r = (os.path.relpath(g[0], ROOT).replace(os.sep, '/'), {'w': cell[0], 'h': cell[1], 'cols': wi // cell[0]})
    if not r: print('ERROR: %s no tiene atlas registrado (ver RECETA §7: donante / diseño nuevo)' % cid); sys.exit(1)
    path, meta = r
    im = Image.open(os.path.join(ROOT, path)).convert('RGBA'); w, h, cols = meta['w'], meta['h'], meta['cols']
    n = (im.width // w) * (im.height // h)
    if frames == ['--info']: print('%s: %s celda %dx%d, %d columnas, rejilla de %d celdas' % (cid, path, w, h, cols, n)); return
    idx = list(range(n)) if frames == ['--all'] else [int(x) for x in frames]
    out = os.path.join(ROOT, 'art-source/runway-pose-refs', cid); os.makedirs(out, exist_ok=True)
    k = max(1, 1024 // max(w, h))
    for i in idx:
        if not 0 <= i < n: print('ERROR: cuadro %d fuera de rango (0-%d)' % (i, n - 1)); sys.exit(1)
        c = im.crop(((i % cols) * w, (i // cols) * h, (i % cols) * w + w, (i // cols) * h + h)); c.save(os.path.join(out, 'f%02d.png' % i))
        big = c.resize((w * k, h * k), Image.NEAREST); canvas = Image.new('RGBA', (1024, 1024), (16, 16, 24, 255))
        canvas.alpha_composite(big, ((1024 - big.width) // 2, (1024 - big.height) // 2)); canvas.convert('RGB').save(os.path.join(out, 'f%02d_1024.png' % i))
    print('%s: %s celda %dx%d, %d columnas, rejilla de %d celdas -> %s (%d guardados, ampliados x%d)' % (cid, path, w, h, cols, n, os.path.relpath(out, ROOT), len(idx), k))
if __name__ == '__main__': main()
