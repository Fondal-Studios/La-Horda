#!/usr/bin/env python3
"""Genera specs/sfa_<tema>.json: borde unificado (modo overlay) para `nova` y `zone` de TODOS los temas de skill-fx-a (incluidos los de
guardianes con receta propia) en los 8 tamaños del motor. Las combinaciones que el tema no hornea se podan al capturar la línea base.
Uso: python3 tools/art/ability-art/gen-sfa-specs.py"""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
OV = {'fill': 0, 'ticks': 12, 'tick_len': 0.1, 'sparks': 0, 'flash': 0, 'glyph_on': 0, 'motif_on': 0, 'inner_ring': 0, 'rim': 2, 'deco': 0}   # borde unificado: solo el aro y sus marcas
# tema: (paleta o,d,a,b,c de js/champions/skill-fx-a/themes.js, motivo temático, glifo, guardianes que lo usan)
INV = json.loads((HERE.parents[2] / 'docs' / 'art-gate' / 'ability-art' / 'inventory.json').read_text())
SIZES = (64, 80, 96)   # buckets frecuentes (diámetro 66–230 u); 32/48/128/160/192 siguen con el arte del motor
SIZES = (32, 48, 64, 80, 96, 128, 160, 192)   # todos los buckets del motor (sfaBucket); nova y zone
for theme, info in INV['themes'].items():
    pal = [info['pal'][k] for k in ('o', 'd', 'a', 'b', 'c')]
    spec = {'guardian': f'sfa_{theme}', 'engine': 'sfa', 'title': f'Tema {theme} (skill-fx-a)', 'palette': pal, 'abilities': []}
    for art, kind, frames in (('nova', 'ring', 12), ('zone', 'idle', 8)):
        for s in SIZES:
            spec['abilities'].append({'id': f'{art}{s}', 'kind': kind, 'size': s, 'frames': frames, 'glyph': None, 'mode': 'overlay',
                                      'sfa': {'art': art, 'theme': theme, 'size': s}, 'baseline': f'{art}|{theme}|{s}', 'replaces': f'{art}|{theme}|{s}',
                                      'params': dict(OV)})
    (HERE / 'specs' / f'sfa_{theme}.json').write_text(json.dumps(spec, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(len(INV['themes']), 'fichas')
