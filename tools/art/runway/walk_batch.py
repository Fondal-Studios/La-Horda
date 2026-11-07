#!/usr/bin/env python3
"""Completa la caminata de enemigos ya instalados: genera una hoja de caminata (2x6, --walk) con la referencia del propio cuadro quieto instalado,
la agrega al spec como hoja extra y reinstala conservando hMul, sets extra y alias. Uso: walk_batch.py <arena> <tipo> <hMul> <targetH> <front|side> [fly] [--kind enemies|bosses|arenas] [--nostyle]"""
import json, os, re, subprocess, sys
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
a = [x for x in sys.argv[1:] if not x.startswith('--')]
arena, tipo, hmul, target, view = a[0], a[1], a[2], a[3], a[4]; fly = 'fly' in a[5:]
kind = sys.argv[sys.argv.index('--kind') + 1] if '--kind' in sys.argv else 'enemies'
js = open(os.path.join(ROOT, 'js/assets/enemy-runway-sheets.js')).read()
m = re.search(rf'^  {tipo}: \{{src:"([^"]+)", hMul:([\d.]+), meta:(\{{.*\}})\}},?$', js, re.M)
meta = json.loads(m.group(3)); src = os.path.join(ROOT, m.group(1))
im = Image.open(src).convert('RGBA'); i = meta['sets']['idle'][0]; w, h = meta['w'], meta['h']
design = f'/tmp/_walkdesign_{tipo}.png'; im.crop(((i % meta['cols']) * w, (i // meta['cols']) * h, (i % meta['cols'] + 1) * w, (i // meta['cols'] + 1) * h)).save(design)
cmd = [sys.executable, os.path.join(ROOT, 'tools/art/runway/gen_sheet.py'), arena, tipo, f'the same creature as in the reference ({tipo.replace("_", " ")})', design, '--walk', '--nostyle', '--view', view] + (['--mode', 'fly'] if fly else [])
r = subprocess.run(cmd, capture_output=True, text=True); print(r.stdout[-200:], r.stderr[-200:])
d = os.path.join(ROOT, 'art-source/runway-enemies', arena, tipo)
walks = sorted(f for f in os.listdir(d) if re.match(r'walk_v\d+\.png$', f))
if not walks: sys.exit('sin hoja de caminata')
sp = json.load(open(os.path.join(d, 'spec.json'))); sp['extra'] = [{'sheet': walks[-1], 'rows': 2, 'cols': 6, 'set': 'walk', 'count': 6, 'gap': 6}]
json.dump(sp, open(os.path.join(d, 'spec.json'), 'w'), indent=1)
r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools/art/runway/install.py'), arena, tipo, hmul, target, '--kind', kind], capture_output=True, text=True); print(r.stdout[-300:], r.stderr[-300:])
