#!/usr/bin/env python3
"""Art Factory 2.0 · Módulo A — inventario VERIFICABLE de imágenes bajo assets/.
Por archivo: categoría, dimensiones, transparencia, colores, sha256, referencias literales en js/css/html y estado.
Estados (sin inventar juicio visual): ROTO (no decodifica / vacío / 0 px), DUPLICADO (mismo hash en otra ruta),
HUERFANO (ni la ruta ni el nombre aparecen en el código), DINAMICA_PROBABLE (el nombre aparece pero no la ruta completa: se arma en tiempo de ejecución), REFERENCIADO (con referencia), y aparte FALTANTE
(ruta literal citada en código que no existe). 'APROBADO' solo si un gate existente lo respalda: aquí NINGUNO se
asigna automáticamente — el escáner no sustituye al evaluador visual. Uso: python3 tools/art-factory/scan.py [salida.json]"""
import hashlib, json, os, re, sys
from collections import Counter, defaultdict
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
EXT = ('.png', '.webp', '.gif', '.jpg', '.jpeg')
def category(p):
    q = p.split('/')
    if q[1] == 'sprites':
        s = q[2] if len(q) > 2 else ''
        if s == 'champions':
            return 'campeones/skins' if 'skins' in q else 'campeones/cuerpo'
        return 'sprites/' + s
    return q[1] if len(q) > 1 else 'otros'
files = []
for d, _, fs in os.walk(os.path.join(ROOT, 'assets')):
    for f in fs:
        if f.lower().endswith(EXT):
            files.append(os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/'))
files.sort()
# referencias literales en código
src = ''
for base in ('js', 'css', 'index.html', 'sw.js', 'manifest.webmanifest'):
    p = os.path.join(ROOT, base)
    if os.path.isfile(p): src += open(p, errors='ignore').read() + '\n'
    else:
        for d, _, fs in os.walk(p):
            for f in fs:
                if f.endswith(('.js', '.css', '.html')): src += open(os.path.join(d, f), errors='ignore').read() + '\n'
cited = set(re.findall(r'assets/[A-Za-z0-9_\-./]+\.(?:png|webp|gif|jpg|jpeg)', src))
rows, byhash = [], defaultdict(list)
for p in files:
    full = os.path.join(ROOT, p); r = {'path': p, 'cat': category(p), 'bytes': os.path.getsize(full)}
    try:
        h = hashlib.sha256(open(full, 'rb').read()).hexdigest(); r['sha'] = h; byhash[h].append(p)
        im = Image.open(full); im.load(); r['w'], r['h'] = im.size
        if im.mode in ('RGBA', 'LA', 'P'):
            a = im.convert('RGBA').getchannel('A'); ex = a.getextrema()
            r['alpha'] = 'vacio' if ex[1] == 0 else ('opaco' if ex[0] == 255 else 'transparencia')
            hist = a.histogram(); r['semi_alpha_px'] = sum(hist[1:255])
        else: r['alpha'] = 'opaco'
        r['colors'] = len(im.convert('RGBA').getcolors(1 << 16) or []) if r['w'] * r['h'] <= 4_000_000 else None
        r['status'] = 'ROTO' if (r['w'] == 0 or r['h'] == 0 or r['alpha'] == 'vacio') else None
    except Exception as e:
        r['status'] = 'ROTO'; r['error'] = str(e)[:80]
    r['cited'] = p in cited
    rows.append(r)
for r in rows:
    if r.get('sha') and len(byhash[r['sha']]) > 1 and not r['status']: r['status'] = 'DUPLICADO'
    if not r['status']:
        stem = os.path.splitext(os.path.basename(r['path']))[0]
        r['status'] = 'REFERENCIADO' if r['cited'] else ('DINAMICA_PROBABLE' if (len(stem) > 3 and stem in src) else 'HUERFANO')
missing = sorted(c for c in cited if not os.path.exists(os.path.join(ROOT, c)) and '${' not in c)
summ = {'total': len(rows), 'por_estado': Counter(r['status'] for r in rows), 'por_categoria': {}, 'faltantes_citados': len(missing),
        'campeones_con_semitransparencia': sum(1 for r in rows if r.get('semi_alpha_px', 0) > 0 and r['cat'].startswith('campeones')),
        'duplicados': sorted(v for v in byhash.values() if len(v) > 1)}
for c in sorted({r['cat'] for r in rows}):
    rs = [r for r in rows if r['cat'] == c]; summ['por_categoria'][c] = {'n': len(rs), **Counter(r['status'] for r in rs)}
out = {'schema': 'art-factory.inventory.v1', 'summary': summ, 'missing_cited': missing, 'rows': rows}
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs/art-factory/inventory.json'), 'w'), ensure_ascii=False, indent=1, default=dict)
print(json.dumps(summ, ensure_ascii=False, default=dict, indent=1))
