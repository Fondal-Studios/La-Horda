#!/usr/bin/env python3
"""Execute repository-authored rigs in staging. Never call build_one (it installs)."""
import argparse
import hashlib
import importlib
import json
import re
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
RIGS = ROOT / 'tools/art/pixrig'
sys.path.insert(0, str(RIGS))
from pixrig import atlas, preview
from build import body_height

# Explicit reviewed entry points; new recipes are added via code review.
RECIPES = {
    'mn_cerbero': 'mn_cerbero', 'mn_titan': 'mn_titan',
    'cm_dama': 'cm_dama', 'cm_maestro': 'cm_maestro',
    'cm_tramoyista': 'cm_tramoyista', 'cm_verdugo': 'cm_verdugo',
    'ab_carcelero': 'ab_carcelero', 'angel_corrompido': 'angel_corrompido',
    'golem_cuerpos': 'golem_cuerpos',
    'cm_presentador': 'cm_presentador', 'cm_presentador2': 'cm_presentador',
    'cm_presentador3': 'cm_presentador',
    'tiburon_joven': 'tiburones', 'tiburon_blanco': 'tiburones',
}

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--recipe', choices=sorted(RECIPES))
    p.add_argument('--out', type=Path)
    p.add_argument('--list', action='store_true')
    p.add_argument('--padding', type=int, default=0)
    a = p.parse_args()
    if a.list:
        print(json.dumps(sorted(RECIPES))); return
    if not a.recipe or not a.out: p.error('--recipe and --out required')
    dest = a.out.resolve()
    # Only a fresh directory; keep all generated candidates outside production.
    for protected in ['assets', 'js', 'art-source']:
        if dest == ROOT / protected or ROOT / protected in dest.parents:
            p.error('output must be staging, not production')
    if dest == ROOT or ROOT in [dest] or dest in ROOT.parents:
        p.error('unsafe output directory')
    dest.mkdir(parents=True, exist_ok=False)
    mod = importlib.import_module(RECIPES[a.recipe])
    if a.padding:
        if a.recipe != 'angel_corrompido' or not 1 <= a.padding <= 64:
            p.error('overscan currently qualified only for angel_corrompido, 1..64 px')
        mod.R.padding = a.padding
    if hasattr(mod, 'BUILDS'):
        frames, sets, info, target = dict(mod.BUILDS)[a.recipe]()
    else:
        frames, sets, info = mod.build()
        target = dict(mod.TARGET)
    sheet, w, h = atlas(frames)
    sheet.save(dest / 'atlas.png', optimize=True)
    sheet.save(dest / 'atlas.webp', lossless=True, quality=100, method=6)
    preview(frames, 2).save(dest / 'contact.png')
    ref_h = info.get('refH') or body_height(frames, sets[info.get('ref_set', 'idle')])
    meta = dict(w=w, h=h, cols=8, refH=ref_h, anchor=info['anchor'], sets=sets)
    if info.get('hMul'): meta['hMul'] = info['hMul']
    target.setdefault('meta_file', 'js/assets/pixrig-meta.js')
    target.setdefault('const', 'PIXRIG_ATLAS')
    target.setdefault('key', a.recipe)
    if a.padding:
        text = (ROOT / target['meta_file']).read_text()
        baseline = json.loads(re.search(r'const\s+' + target['const'] + r'\s*=\s*(\{.*?\});', text, re.S)[1])[target['key']]['meta']
        meta['refH'] = baseline['refH']
        meta['anchor'] = (baseline['anchor'] * baseline['h'] + a.padding) / h
    sources = {str(f.relative_to(ROOT)): hashlib.sha256(f.read_bytes()).hexdigest()
               for f in sorted(RIGS.glob('*.py'))}
    receipt = dict(provider='pixrig', recipe=a.recipe, frame_count=len(frames),
                   meta=meta, target=target, sources=sources,
                   provenance='repository-authored procedural rig; no external model or API',
                   api_cost_usd=0, overscan_padding=a.padding)
    (dest / 'provider.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(dict(recipe=a.recipe, frames=len(frames), path=str(dest))))

if __name__ == '__main__': main()
