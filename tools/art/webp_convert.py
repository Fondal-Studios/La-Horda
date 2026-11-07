#!/usr/bin/env python3
"""Genera una copia WebP SIN PÉRDIDA (mismos píxeles, alfa exacto) de cada PNG del manifiesto de
precarga y escribe js/assets/asset-webp.js con la lista de las que conviene usar (>= 5 % más
livianas). El juego pide el .webp si está en la lista (js/assets/lazy-images.js) y vuelve al .png si
el navegador no lo puede leer. Los PNG originales NO se tocan (siguen siendo la fuente).
Uso:  python3 tools/art/webp_convert.py      (desde la raíz del repo; se puede volver a correr)
"""
import io, json, os, re, sys
from multiprocessing import Pool
from PIL import Image

CHECK = '--check' in sys.argv   # solo verifica (CI): falla si algún .webp no coincide con su PNG
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
src = open('js/assets/asset-manifest.js', encoding='utf-8').read()
paths = [p for p in re.findall(r'"(assets/[^"]+\.png)"', src)]

def conv(p):
    try:
        out = p[:-4] + '.webp'
        png = os.path.getsize(p)
        stale = False
        if os.path.exists(out):
            # NO se confía en la fecha: tras un checkout/pull el .webp puede tener fecha más nueva y ser de un diseño ANTERIOR
            # (pasó con San Martín: los navegadores reales cargaban el .webp viejo). Se comparan los PÍXELES.
            try:
                a = Image.open(p).convert('RGBA'); b2 = Image.open(out).convert('RGBA')
                stale = (a.size != b2.size) or a.tobytes() != b2.tobytes()
            except Exception:
                stale = True
        if CHECK and stale:
            return (p, png, 0, 'STALE')
        if os.path.exists(out) and not stale:
            data = None; size = os.path.getsize(out)
        else:
            im = Image.open(p); im.load()
            rgba = im.convert('RGBA')
            b = io.BytesIO(); rgba.save(b, 'WEBP', lossless=True, quality=100, method=5, exact=True)
            data = b.getvalue(); size = len(data)
            back = Image.open(io.BytesIO(data)).convert('RGBA')
            if back.tobytes() != rgba.tobytes():
                return (p, png, size, 'MISMATCH')
        if size > png * 0.95:
            if os.path.exists(out): os.remove(out)   # un .webp que no conviene (o quedó viejo) no puede quedar junto al PNG
            return (p, png, size, 'skip')
        if data is not None:
            open(out, 'wb').write(data)
        return (p, png, size, 'ok')
    except Exception as e:
        return (p, 0, 0, 'ERR ' + str(e))

if __name__ == '__main__':
    with Pool(4) as pool:
        res = pool.map(conv, paths, chunksize=4)
    if CHECK:
        stale = [r[0] for r in res if r[3] == 'STALE']
        print(f'webp desactualizados: {len(stale)}')
        for x in stale[:40]: print('  ', x)
        sys.exit(1 if stale else 0)
    ok = sorted(r[0] for r in res if r[3] == 'ok')
    bad = [r for r in res if r[3] not in ('ok', 'skip')]
    tot_png = sum(r[1] for r in res); tot_new = sum(r[2] if r[3] == 'ok' else r[1] for r in res)
    with open('js/assets/asset-webp.js', 'w', encoding='utf-8') as f:
        f.write('"use strict";\n/* GENERADO por tools/art/webp_convert.py — no editar a mano.\n'
                '   PNG del juego que tienen una copia .webp sin pérdida (mismos píxeles) más liviana. */\n')
        f.write('const ASSET_WEBP = new Set(' + json.dumps(ok, indent=0) + ');\n')
    print(f'png {tot_png/1048576:.1f} MB -> {tot_new/1048576:.1f} MB · webp {len(ok)}/{len(paths)} · problemas {len(bad)}')
    for r in bad[:20]: print('  ', r)
