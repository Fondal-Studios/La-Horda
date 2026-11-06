#!/usr/bin/env python3
"""LA HORDA — LAZO DE ARTE DE HABILIDADES: PINTOR → EVALUADOR → (ARQUITECTO | instrucciones → PINTOR)

  python3 tools/art/ability-art/pipeline.py run specs/vesper.json [--baseline-dir DIR] [--no-integrate] [--rounds N]
  python3 tools/art/ability-art/pipeline.py check specs/vesper.json     # verifica lo ya integrado (sin tocar nada)

Por ronda: el Pintor pinta todas las habilidades pendientes con las perillas actuales → el Evaluador las puntúa (contra el
canon y contra el arte actual del juego, y entre sí para que cada habilidad del guardián se distinga) → las que pasan se
CONGELAN y van al Arquitecto; las que no, reciben instrucciones (JSON para el Pintor + prosa para un artista) y vuelven a
pintarse. Si una ronda no cambia ninguna perilla o se agotan las rondas, la habilidad queda ESCALADA: se documenta como
REDRAW REQUIRED (docs/ART_BIBLE.md §8) y NO se integra. Salidas en docs/art-gate/ability-art/.
"""
import argparse
import copy
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import architect  # noqa: E402
import canon  # noqa: E402
import evaluator  # noqa: E402
import painter  # noqa: E402


def load_baseline(dirp, ab, ramp):
    p = Path(dirp) / f"{ab['id']}.png"
    if not p.exists():
        return None
    im = np.array(Image.open(p).convert('RGBA'))
    h = im.shape[0]
    meta = json.loads((Path(dirp) / 'baseline.json').read_text())[ab['id']]
    n, w = meta['frames'], meta['w']
    frames = [im[:, i * w:(i + 1) * w] for i in range(n)]
    return frames


def compose(base, over):
    """Superpone los píxeles opacos de `over` sobre `base` (ambos RGBA, alfa 0/255)."""
    out = base.copy()
    m = over[..., 3] > 0
    out[m] = over[m]
    return out


def sheet_png(frames_rgba, path, scale=3):
    h, w = frames_rgba[0].shape[:2]
    bg = Image.new('RGBA', (w * len(frames_rgba), h), (58, 72, 52, 255))
    for i, f in enumerate(frames_rgba):
        bg.alpha_composite(Image.fromarray(f, 'RGBA'), (i * w, 0))
    bg = bg.resize((bg.width * scale, bg.height * scale), Image.NEAREST)
    bg.save(path)


def run(spec_path, baseline_dir=None, integrate=True, rounds=canon.MAX_ROUNDS, out=None, smoke=True, base_url='http://127.0.0.1:8750/'):
    spec = canon.load_json(spec_path)
    g = spec['guardian']
    ramp = canon.ramp_rgb(spec)
    out = Path(out or canon.OUT_DOCS / g)
    bdir = Path(baseline_dir or out / 'baseline')
    for old in out.glob('round-*'):   # nada de rondas de corridas anteriores: la evidencia es de ESTA corrida
        __import__('shutil').rmtree(old)
    work = copy.deepcopy(spec)
    abil = {a['id']: a for a in work['abilities']}
    # línea base: puntaje del arte actual (mismo evaluador, sin penalizar identidad contra hermanas)
    base, base_crit, base_met = {}, {}, {}
    for a in work['abilities']:
        fr = load_baseline(bdir, a, ramp) if bdir.exists() else None
        if fr:
            br = evaluator.evaluate(fr, a, canon.ramp_for(work, a))
            base[a['id']], base_crit[a['id']], base_met[a['id']] = br['score'], br['criteria'], br['metrics']
    state = {a['id']: {'status': 'PENDING', 'rounds': 0, 'history': []} for a in work['abilities']}
    frozen = {}
    log = []
    for rnd in range(1, rounds + 1):
        pending = [i for i, s in state.items() if s['status'] == 'PENDING']
        if not pending:
            break
        rdir = out / f'round-{rnd:02d}'
        rdir.mkdir(parents=True, exist_ok=True)
        painted = {i: painter.frames_for(g, abil[i]) for i in abil}
        rgba = {i: [canon.index_to_rgba(f, canon.ramp_for(work, abil[i])) for f in fr] for i, fr in painted.items()}
        overlay_only = {}
        for i, a in abil.items():   # modo overlay: el arte candidato es el arte ACTUAL con el borde unificado encima
            if a.get('mode') == 'overlay':
                bf = load_baseline(bdir, a, None)
                overlay_only[i] = rgba[i]
                rgba[i] = [compose(bf[k], rgba[i][k]) for k in range(len(rgba[i]))]
        sigs = {i: np.array(evaluator._signature(rgba[i][int(np.stack([f[..., 3] > 0 for f in rgba[i]]).sum((1, 2)).argmax())])) for i in abil}
        instr = []
        for i in pending:
            a = abil[i]
            others = {k: v for k, v in sigs.items() if k != i and abil[k]['kind'] == a['kind']}
            rep = evaluator.evaluate(rgba[i], a, canon.ramp_for(work, a), others or None, base.get(i), base_crit.get(i), base_met.get(i), overlay_only.get(i))
            rep = evaluator.verdict(rep, i in base)
            sheet_png(rgba[i], rdir / f'{i}.png')
            st = state[i]
            st['rounds'] = rnd
            st['history'].append({'round': rnd, 'score': rep['score'], 'status': rep['status'], 'improvement': rep.get('improvement'),
                                  'reasons': rep['reasons']})
            if rep['status'] == 'PASS':
                st['status'] = 'PASS'
                frozen[i] = {'status': 'PASS', 'score': rep['score'], 'baseline_total': base.get(i), 'improvement': rep.get('improvement'),
                             'frames': painted[i], 'criteria': rep['criteria']}
                log.append(f"ronda {rnd}: {i} PASS {rep['score']}" + (f" (arte actual {base[i]}, {rep['improvement']:+})" if i in base else ''))
                continue
            if rep.get('keep_current'):
                st['status'] = 'KEEP_CURRENT'
                log.append(f"ronda {rnd}: {i} CONSERVAR ACTUAL — el arte actual ya puntúa {base[i]} y el nuevo lo iguala ({rep['score']}): no se reemplaza")
                continue
            before = json.dumps(a.get('params'), sort_keys=True) + str(a.get('glyph'))
            changes = painter.apply_ops(a, rep['ops'])
            instr.append(painter.render_instructions(i, rep['ops'], changes))
            (rdir / f'{i}.report.json').write_text(json.dumps({k: v for k, v in rep.items() if k != 'signature'}, ensure_ascii=False, indent=1))
            log.append(f"ronda {rnd}: {i} FAIL {rep['score']} — {'; '.join(rep['reasons'][:2])}")
            if json.dumps(a.get('params'), sort_keys=True) + str(a.get('glyph')) == before:
                st['status'] = 'ESCALATED'
                log.append(f"  {i}: sin perillas que mover → ESCALADA (REDRAW REQUIRED)")
        (rdir / 'INSTRUCCIONES_PINTOR.md').write_text(f'# Ronda {rnd} — instrucciones del Evaluador al Pintor\n\n' + ('\n\n'.join(instr) or 'Sin pendientes.') + '\n', encoding='utf-8')
        canon.save_json(out / 'spec.work.json', work)
    for i, s in state.items():
        if s['status'] == 'PENDING':
            s['status'] = 'ESCALATED'
    summary = {'guardian': g, 'passed': [i for i, s in state.items() if s['status'] == 'PASS'],
               'escalated': [i for i, s in state.items() if s['status'] == 'ESCALATED'],
               'keep_current': [i for i, s in state.items() if s['status'] == 'KEEP_CURRENT'], 'state': state, 'baseline': base, 'log': log}
    # Arquitecto
    summary['integration'] = None
    if integrate and summary['passed']:
        ok, detail = architect.integrate(g, work, {i: frozen[i] for i in frozen}, smoke=smoke, base_url=base_url)
        summary['integration'] = {'ok': ok, 'detail': detail}
        log.append('arquitecto: ' + detail.splitlines()[0])
        if not ok:
            for i in summary['passed']:
                state[i]['status'] = 'INTEGRATION_FAILED'
            summary['passed'] = []
    canon.save_json(out / 'summary.json', summary)
    canon.save_json(spec_path.parent / f'{g}.painted.json' if False else out / 'spec.final.json', work)
    return summary


def check(spec_path):
    """Verificación reproducible (sin navegador): repinta la ficha final aprobada, la vuelve a evaluar contra el canon y
    comprueba que el módulo JS integrado coincide byte a byte con lo pintado. Falla si alguien editó a mano el módulo, cambió
    el Pintor/Canon sin repintar, o una habilidad integrada ya no pasa el canon."""
    spec = canon.load_json(spec_path)
    g = spec['guardian']
    final = canon.load_json(canon.OUT_DOCS / g / 'spec.final.json')
    ramp = canon.ramp_rgb(final)
    errors, results = [], {}
    sm = canon.load_json(canon.OUT_DOCS / g / 'summary.json')
    approved = {i for i, s in sm['state'].items() if s['status'] == 'PASS'}   # solo lo aprobado se integra y se verifica
    abil = {a['id']: a for a in final['abilities']}
    painted = {i: painter.frames_for(g, a) for i, a in abil.items() if i in approved}
    rgba = {i: [canon.index_to_rgba(f, canon.ramp_for(final, abil[i])) for f in fr] for i, fr in painted.items()}
    for i, a in abil.items():
        if i not in approved:
            continue
        sig = lambda k: np.array(evaluator._signature(rgba[k][int(np.stack([f[..., 3] > 0 for f in rgba[k]]).sum((1, 2)).argmax())]))
        others = {k: sig(k) for k in abil if k != i and k in approved and abil[k]['kind'] == a['kind']}
        rep = evaluator.evaluate(rgba[i], a, canon.ramp_for(final, a), others or None)
        rep = evaluator.verdict(rep, False)
        if a.get('mode') == 'overlay':   # una capa superpuesta se mide en técnica y borde; riqueza/cobertura/centro vienen del arte del motor
            tech = ('alpha', 'palette', 'hygiene', 'edge', 'contrast', 'motion')
            bad = [k for k in tech if rep['points'][k] < canon.MIN_CRITERION * evaluator.WEIGHTS[k]]
            rep['status'] = 'PASS' if not bad and not [h for h in rep['hard_fails'] if 'alfa' in h or 'paleta' in h or 'radio' in h] else 'FAIL'
            rep['reasons'] = [f'criterio bajo: {evaluator.LABEL[k]}' for k in bad] + rep['hard_fails']
        if rep['status'] != 'PASS':
            errors.append(f'{g}/{i}: ya no pasa el canon: ' + '; '.join(rep['reasons']))
        results[i] = {'status': 'PASS' if rep['status'] == 'PASS' else 'FAIL', 'score': rep['score'], 'frames': painted[i]}
    if final.get('engine') == 'sfa':   # una sola capa compartida: se verifica contra el módulo combinado
        mod = canon.ROOT / 'js' / 'champions' / 'vfx-unified' / 'sfa_overlay.js'
        want = architect.sfa_module_source(architect.sfa_collect(sorted((canon.HERE / 'specs').glob('sfa_*.json'))))
        if not mod.exists() or mod.read_text(encoding='utf-8') != want:
            errors.append('sfa_overlay.js no coincide con lo que pintan las fichas sfa_* finales: repintar con pipeline.py run-sfa (no editar a mano)')
        idx = (canon.ROOT / 'index.html').read_text(encoding='utf-8')
        for f in ('sfa-runtime.js', 'sfa_overlay.js'):
            if f'js/champions/vfx-unified/{f}' not in idx:
                errors.append(f'index.html no carga vfx-unified/{f}')
        return errors
    mod = canon.ROOT / 'js' / 'champions' / 'vfx-unified' / f'{g}.js'
    if not mod.exists():
        errors.append(f'falta {mod}')
    else:
        strip = lambda s: [l for l in s.splitlines() if l.strip().startswith(("abaReplace(", "abaSfaOverlay(", "'"))]
        want = strip(architect.module_source(g, final, results))
        got = strip(mod.read_text(encoding='utf-8'))
        if want != got:
            errors.append(f'{mod.name} no coincide con lo que pinta la ficha final: repintar con pipeline.py run (no editar a mano)')
    idx = (canon.ROOT / 'index.html').read_text(encoding='utf-8')
    for f in (('sfa-runtime.js' if final.get('engine') == 'sfa' else 'runtime.js'), f'{g}.js'):
        if f'js/champions/vfx-unified/{f}' not in idx:
            errors.append(f'index.html no carga vfx-unified/{f}')
    return errors


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd', required=True)
    r = sub.add_parser('run')
    r.add_argument('spec')
    r.add_argument('--baseline-dir')
    r.add_argument('--no-integrate', action='store_true')
    r.add_argument('--no-smoke', action='store_true')
    r.add_argument('--rounds', type=int, default=canon.MAX_ROUNDS)
    r.add_argument('--base-url', default='http://127.0.0.1:8750/')
    rs = sub.add_parser('run-sfa')
    rs.add_argument('--no-integrate', action='store_true')
    rs.add_argument('--no-smoke', action='store_true')
    rs.add_argument('--base-url', default='http://127.0.0.1:8750/')
    c = sub.add_parser('check')
    c.add_argument('spec')
    a = ap.parse_args()
    if a.cmd == 'run-sfa':
        specs = sorted((canon.HERE / 'specs').glob('sfa_*.json'))
        tot = {'pass': 0, 'esc': 0, 'keep': 0}
        for sp in specs:
            s = run(sp, None, False, canon.MAX_ROUNDS)
            tot['pass'] += len(s['passed']); tot['esc'] += len(s['escalated']); tot['keep'] += len(s['keep_current'])
            print(f"{sp.stem}: PASS {s['passed']} · ESCALADAS {s['escalated']} · CONSERVAR {s['keep_current']}")
        print('TOTAL', tot)
        if not a.no_integrate:
            ok, detail = architect.integrate_sfa(specs, smoke=not a.no_smoke, base_url=a.base_url)
            print('arquitecto:', detail.splitlines()[0] if detail else '')
            sys.exit(0 if ok else 1)
        sys.exit(0)
    if a.cmd == 'check':
        errs = check(Path(a.spec))
        print('\n'.join(errs) or 'CHECK OK: ' + a.spec)
        sys.exit(1 if errs else 0)
    s = run(Path(a.spec), a.baseline_dir, not a.no_integrate, a.rounds, smoke=not a.no_smoke, base_url=a.base_url)
    print('\n'.join(s['log']))
    print('PASS:', s['passed'], '· ESCALADAS:', s['escalated'], '· CONSERVAR ACTUAL:', s['keep_current'])
    sys.exit(0 if not s['escalated'] else 2)


if __name__ == '__main__':
    main()
