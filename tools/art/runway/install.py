#!/usr/bin/env python3
"""Construye (modo auto) e instala la hoja de un enemigo: atlas -> assets/sprites/<enemies|bosses>/<arena>/<tipo>/v2/atlas.png y registro en
js/assets/enemy-runway-sheets.js. Uso: python3 tools/art/runway/install.py <arena> <tipo> <hMul> [targetH] [--kind bosses] [--sheet sheet_vN.png]
targetH = alto nativo (px) del cuadro de referencia; por defecto 64. Si existe spec.json con 'frames' manual, se respeta (no se pisa)."""
import json, os, re, shutil, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
a = [x for i, x in enumerate(sys.argv[1:], 1) if not x.startswith('--') and sys.argv[i - 1] not in ('--alias', '--kind', '--sheet')]
arena, tipo, hmul = a[0], a[1], float(a[2]); target = int(a[3]) if len(a) > 3 else 64
kind = sys.argv[sys.argv.index('--kind') + 1] if '--kind' in sys.argv else 'enemies'
src = os.path.join(ROOT, 'art-source/runway-enemies', arena, tipo)
sheet = sys.argv[sys.argv.index('--sheet') + 1] if '--sheet' in sys.argv else sorted(f for f in os.listdir(src) if re.match(r'sheet_v\d+\.png$', f))[-1]
spec_p = os.path.join(src, 'spec.json')
spec = json.load(open(spec_p)) if os.path.exists(spec_p) else {}
if not spec.get('frames') and not spec.get('auto'):
    spec = {'sheet': sheet, 'rows': 3, 'cols': 6, 'auto': True, 'gap': 6, 'rowGap': 6, 'targetH': target, 'refFromIdle': 0, 'K': 32, 'out': 'out'}
    json.dump(spec, open(spec_p, 'w'), indent=1)
r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools/art/runway/build_sheet.py'), spec_p], capture_output=True, text=True)
sys.stderr.write(r.stderr[-600:])
if r.returncode: raise SystemExit('build fallo')
meta = json.load(open(os.path.join(src, spec.get('out', 'out'), 'meta.json')))
_js = os.path.join(ROOT, 'js/assets/enemy-runway-sheets.js'); _old = re.search(rf'^  {tipo}: .*"sets":(\{{.*?\}})\}}\}},?$', open(_js).read(), re.M)
if _old:   # conserva los sets extra que ya tenia la entrada (aliases de la IA): caminar/correr/volar -> caminata nueva, el resto -> ataque
    for k in json.loads(_old.group(1)):
        if k not in meta['sets']: meta['sets'][k] = list(meta['sets']['walk'] if re.search('walk|run|fly|charge|flap|swim', k) else meta['sets']['atk'])
if '--alias' in sys.argv:   # sets extra que pide la IA de la arena: nombre=set_existente (p.ej. leap=atk,run=walk,walk_down=walk)
    for kv in sys.argv[sys.argv.index('--alias') + 1].split(','):
        k, v = kv.split('=')
        if k not in meta['sets']: meta['sets'][k] = list(meta['sets'][v])
dst_rel = f'assets/sprites/{kind}/{arena}/{tipo}/v2/atlas.png'
os.makedirs(os.path.dirname(os.path.join(ROOT, dst_rel)), exist_ok=True)
shutil.copy(os.path.join(src, spec.get('out', 'out'), 'atlas.png'), os.path.join(ROOT, dst_rel))
js = os.path.join(ROOT, 'js/assets/enemy-runway-sheets.js'); s = open(js).read()
line = f'  {tipo}: {{src:"{dst_rel}", hMul:{hmul}, meta:{json.dumps(meta, separators=(",", ":"))}}},\n'
if re.search(rf'^  {tipo}: ', s, re.M): s = re.sub(rf'^  {tipo}: .*\n', line, s, flags=re.M)
else: s = s.replace('};\nfor(const k in ENEMY_RUNWAY_SHEETS)', line + '};\nfor(const k in ENEMY_RUNWAY_SHEETS)')
open(js, 'w').write(s); print('instalado', tipo, meta['sets'])
