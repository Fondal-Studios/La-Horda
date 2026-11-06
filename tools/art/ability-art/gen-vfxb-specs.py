#!/usr/bin/env python3
"""Genera specs/<guardián>.json de los guardianes restantes de vfx-b a partir de docs/art-gate/ability-art/inventory.json (inventory.js).
Radio de pintura: el literal que usa la receta; si la receta lo toma del lanzamiento (probado con 60/140/220) se pinta a 140.
Paleta del motor (solo para puntuar el arte actual) = primera rampa de 5 colores del archivo vfx-b del guardián; el arte nuevo usa el Códice.
Uso: python3 tools/art/ability-art/gen-vfxb-specs.py"""
import json
import re
from collections import Counter
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
INV = json.loads((ROOT / 'docs' / 'art-gate' / 'ability-art' / 'inventory.json').read_text())
# prefijo: (guardián, motivo, glifo)
MAP = {'so': ('solciju', 'pollen', 'drop'), 'vy': ('veyra', 'bolt', 'cross'), 'ng': ('nano_gm', 'circuit', 'cross'), 'vl': ('velmira', 'rune', 'eye'),
       'al': ('tanque', 'hex', 'diamond'), 'el': ('soporte', 'rune', 'star'), 'sg': ('segador', 'bolt', 'drop'), 'pf': ('profeta', 'serpent', 'eye'),
       'yn': ('ynara', 'pollen', 'drop'), 'my': ('myla', 'pollen', 'drop'), 'ni': ('nigromante', 'rune', 'eye')}
DONE = set()
for g in ['vesper', 'zahra', 'orsa', 'sira', 'tibor', 'renko', 'nahir', 'oriel', 'saelis', 'vhal']:
    for a in json.loads((HERE / 'specs' / f'{g}.json').read_text())['abilities']:
        DONE.add(a.get('baseline') or a.get('baseline_beam'))


def engine_palette(g):
    src = (ROOT / 'js' / 'champions' / 'vfx-b' / f'{g}.js').read_text(encoding='utf-8')
    m = re.search(r"\[\s*'(#[0-9a-fA-F]{6})'\s*,\s*'(#[0-9a-fA-F]{6})'\s*,\s*'(#[0-9a-fA-F]{6})'\s*,\s*'(#[0-9a-fA-F]{6})'\s*,\s*'(#[0-9a-fA-F]{6})'\s*\]", src)
    return list(m.groups()) if m else ['#101010', '#404040', '#808080', '#c0c0c0', '#ffffff']


def radius(Rs):
    if not Rs:
        return 120
    c = Counter(Rs)
    if {140, 60, 220} <= set(c):
        return 140
    return max(24, min(300, c.most_common(1)[0][0]))


specs = {}
for name, d in INV['decals'].items():
    pre = name.split('_')[0]
    if pre not in MAP or name in DONE:
        continue
    g, motif, glyph = MAP[pre]
    s = specs.setdefault(g, {'guardian': g, 'codex': g, 'title': g, 'palette': engine_palette(g), 'abilities': []})
    idle = name.endswith('_idle')
    kind = 'idle' if idle else 'sector' if d['sector'] else 'ring'
    ab = {'id': name.split('_', 1)[1], 'kind': kind, 'radius': radius(d['R']), 'frames': d['N'], 'glyph': glyph, 'baseline': name, 'replaces': name,
          'params': {}, 'motif': motif}
    if kind == 'sector':
        ab['half'] = 0.85
    s['abilities'].append(ab)
for name, d in INV['beams'].items():
    pre = name.split('_')[0]
    if pre not in MAP or name in DONE:
        continue
    g = MAP[pre][0]
    s = specs.setdefault(g, {'guardian': g, 'codex': g, 'title': g, 'palette': engine_palette(g), 'abilities': []})
    s['abilities'].append({'id': name.split('_', 1)[1], 'kind': 'beam', 'tile': [d['tileW'], d['H']], 'frames': d['N'], 'baseline_beam': name, 'replaces': name, 'params': {}})
for g, s in specs.items():
    (HERE / 'specs' / f'{g}.json').write_text(json.dumps(s, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(g, len(s['abilities']), 'piezas')
