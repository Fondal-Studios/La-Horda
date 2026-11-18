#!/usr/bin/env python3
"""Instala en el juego los cuadros dibujados con Anakin (ver README.md de esta carpeta).
Fuente: art-source/anakin/<clave>/<estado>_<i>.png (pixel nativo, elegidos a ojo). Destinos: targets.json.
Uso:  python3 tools/art/anakin/install.py [clave ...]     (desde la raiz del repo; idempotente)
      python3 tools/art/anakin/install.py --check         (CI: falla si algo instalado no coincide con su fuente)
Escribe js/assets/anakin-meta.js (GENERADO) y un bloque propio en js/assets/asset-manifest.js.
Si se vuelve a correr un generador de atlas (hoja_bestias, pack_canon, build_micelial), correr este despues.
"""
import io, json, os, re, sys, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.chdir(ROOT)
T = json.load(open('tools/art/anakin/targets.json', encoding='utf-8'))
CHECK = '--check' in sys.argv
ONLY = [a for a in sys.argv[1:] if not a.startswith('--')]
BAD = []

def frames(key, estado):
    fs = sorted(glob.glob(f'art-source/anakin/{key}/{estado}_*.png'), key=lambda p: int(re.findall(r'_(\d+)\.png$', p)[0]))
    return [Image.open(f).convert('RGBA') for f in fs]

def save(img, path):
    """PNG + gemelo WebP sin perdida (mismos pixeles), como tools/art/webp_convert.py."""
    if CHECK:
        if not os.path.exists(path) or Image.open(path).convert('RGBA').tobytes() != img.tobytes(): BAD.append(path)
        w = path[:-4] + '.webp'
        if not os.path.exists(w) or Image.open(w).convert('RGBA').tobytes() != img.tobytes(): BAD.append(w)
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, optimize=True)
    b = io.BytesIO(); img.save(b, 'WEBP', lossless=True, quality=100, method=5, exact=True)
    assert Image.open(io.BytesIO(b.getvalue())).convert('RGBA').tobytes() == img.tobytes()
    open(path[:-4] + '.webp', 'wb').write(b.getvalue())

def strip(cells, scale=1):
    w, h = cells[0].size; s = Image.new('RGBA', (w * len(cells), h))
    for i, c in enumerate(cells): s.paste(c, (i * w, 0))
    return s.resize((s.width * scale, s.height * scale), Image.NEAREST) if scale != 1 else s

def set_meta(path, linea, setname, idx):
    src = open(path, encoding='utf-8').read(); out = []; done = False
    for ln in src.split('\n'):
        if not done and linea in ln and f'"{setname}":[' in ln:
            ln = re.sub(r'"%s":\[[0-9,]*\]' % setname, f'"{setname}":[' + ','.join(map(str, idx)) + ']', ln, count=1); done = True
        out.append(ln)
    if not done: raise SystemExit(f'no encontre {linea} / {setname} en {path}')
    new = '\n'.join(out)
    if CHECK:
        if new != src: BAD.append(f'{path} ({linea} {setname})')
    elif new != src: open(path, 'w', encoding='utf-8', newline='').write(new)

death_pack = {}; manifest = []
for key, t in T.items():
    if key.startswith('_') or (ONLY and key not in ONLY): continue
    tipo = t['tipo']
    if tipo == 'battlefield_death':
        fs = frames(key, 'death')
        if not fs: continue
        save(strip(fs, 2), f'assets/sprites/battlefield/death/{key}.png')
    elif tipo == 'death_pack':
        fs = frames(key, 'death')
        if not fs: continue
        save(strip(fs), t['out']); manifest.append(t['out'])
        death_pack[key] = {'src': t['out'], 'hMul': t['hMul'], 'meta': {'w': t['celda'][0], 'h': t['celda'][1], 'cols': len(fs),
                           'refH': t['refH'], 'anchor': t['anchor'], 'sets': {'death': list(range(len(fs)))}}}
    elif tipo == 'atlas_celdas':
        fs = frames(key, t['estado'])
        if not fs: continue
        w, h = t['celda']; cols = t['cols']; atlas = Image.open(t['atlas']).convert('RGBA')
        last = t['desde'] + len(fs) - 1; rows = last // cols + 1
        if atlas.height < rows * h:
            big = Image.new('RGBA', (atlas.width, rows * h)); big.paste(atlas, (0, 0)); atlas = big
        for i, f in enumerate(fs):
            n = t['desde'] + i; x, y = (n % cols) * w, (n // cols) * h
            atlas.paste(Image.new('RGBA', (w, h)), (x, y)); atlas.paste(f.crop((0, 0, w, h)), (x, y))
        save(atlas, t['atlas'])
        set_meta(t['meta'], t['linea'], t['set'], t.get('prefijo', []) + list(range(t['desde'], last + 1)))
    elif tipo == 'sueltos':
        fs = frames(t.get('fuente', key), t['estado'])
        for i, f in enumerate(fs):
            p = t['patron'].format(n=i if t.get('desde0') else i + 1); save(f, p); manifest.append(p)

if not ONLY:
    js = ['"use strict";', '/* GENERADO por tools/art/anakin/install.py (no editar a mano): cuadros dibujados con Anakin.',
          '   Va despues de bestias-meta.js y antes de boss-sheets.js (que arma DEATH_PACK). */',
          'Object.assign(DEATH_PACK_META, ' + json.dumps(death_pack, separators=(',', ':')) + ');', '']
    js = '\n'.join(js)
    if CHECK:
        if open('js/assets/anakin-meta.js', encoding='utf-8').read() != js: BAD.append('js/assets/anakin-meta.js')
    else: open('js/assets/anakin-meta.js', 'w', encoding='utf-8', newline='').write(js)
    mp = 'js/assets/asset-manifest.js'; m = open(mp, encoding='utf-8').read()
    S0, S1 = '  // >>> anakin (tools/art/anakin/install.py)\n', '  // <<< anakin\n'
    block = S0 + ''.join(f'  "{q}",\n' for q in sorted(manifest)) + S1
    m2 = (m[:m.index(S0)] + block + m[m.index(S1) + len(S1):]) if S0 in m else m.replace('const ASSET_MANIFEST = [\n', 'const ASSET_MANIFEST = [\n' + block, 1)
    if CHECK:
        if m2 != m: BAD.append(mp)
    elif m2 != m: open(mp, 'w', encoding='utf-8', newline='').write(m2)

if CHECK:
    print('FAIL anakin install --check:', *BAD, sep='\n  ') if BAD else print('PASS anakin install --check')
    sys.exit(1 if BAD else 0)
print('instalado', ONLY or 'todo')
