#!/usr/bin/env python3
"""Genera specs/sfa_<tema>.json: el decal `nova` del motor skill-fx-a (js/champions/skill-fx-a/engine.js) para los temas genéricos
que usan los guardianes SIN receta propia (aurelia, axiom, bront, cazadora, guerrero, ilkan, iria, khepri, mago, morwen, musashi).
El motor hornea por (tipo|tema|tamaño); se pinta cada tamaño frecuente y el resto de tamaños sigue con el arte del motor.
Uso: python3 tools/art/ability-art/gen-sfa-specs.py"""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
# tema: (paleta o,d,a,b,c de js/champions/skill-fx-a/themes.js, motivo temático, glifo, guardianes que lo usan)
THEMES = {
    'prism':   (['#3a2400', '#a86a12', '#f2c14e', '#ffe69a', '#fffbe8'], 'hex', 'diamond', 'aurelia'),
    'glitch':  (['#06161a', '#1f6e75', '#3ad6c4', '#9df5ea', '#ffffff'], 'circuit', 'cross', 'axiom'),
    'crystal': (['#101c26', '#44627a', '#8aa4b8', '#bfe8ff', '#ffffff'], 'hex', 'diamond', 'bront'),
    'hunt':    (['#12220c', '#2f5a24', '#5c9a4a', '#c8f0a8', '#f4ffe0'], 'pollen', 'drop', 'cazadora'),
    'blood':   (['#2a0808', '#7a1c1c', '#c4544a', '#f0a89a', '#fff0ec'], 'bolt', 'drop', 'guerrero'),
    'sand':    (['#2a1608', '#8a5a2a', '#d89a4a', '#f4d08a', '#fff6dc'], 'map', 'star', 'ilkan'),
    'thread':  (['#181830', '#4e50a0', '#8889c1', '#e3e0ff', '#ffffff'], 'thread', 'stitch', 'iria'),
    'scarab':  (['#0a1a12', '#1f6a50', '#3fae8a', '#c8f27a', '#f4ffd0'], 'rune', 'diamond', 'khepri'),
    'fire':    (['#2a0a04', '#b02a10', '#ff6a3d', '#ffc36a', '#fff4c8'], 'flame', 'flame', 'mago'),
    'frost':   (['#0c1c2c', '#3a78a8', '#7ad0ff', '#cff3ff', '#ffffff'], 'hex', 'star', 'mago'),
    'storm':   (['#20184a', '#6a58d8', '#ffe36a', '#fff6b0', '#ffffff'], 'bolt', 'bolt', 'mago'),
    'alchemy': (['#24101e', '#6e3a60', '#a46191', '#edd0a5', '#fff6e8'], 'pollen', 'drop', 'morwen'),
    'ink':     (['#080c14', '#2a4a68', '#5aa8d8', '#bfe4ff', '#ffffff'], 'serpent', 'needle', 'musashi'),
}
SIZES = (64, 80, 96)   # buckets frecuentes (diámetro 66–230 u); 32/48/128/160/192 siguen con el arte del motor
for theme, (pal, motif, glyph, who) in THEMES.items():
    spec = {'guardian': f'sfa_{theme}', 'engine': 'sfa', 'title': f'Tema {theme} (skill-fx-a) · {who}', 'palette': pal, 'abilities': []}
    for s in SIZES:
        spec['abilities'].append({'id': f'nova{s}', 'kind': 'ring', 'size': s, 'frames': 12, 'glyph': glyph, 'motif': motif,
                                  'sfa': {'art': 'nova', 'theme': theme, 'size': s}, 'baseline': f'nova|{theme}|{s}', 'replaces': f'nova|{theme}|{s}', 'params': {}})
    (HERE / 'specs' / f'sfa_{theme}.json').write_text(json.dumps(spec, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(len(THEMES), 'fichas')
