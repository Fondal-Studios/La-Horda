#!/usr/bin/env python3
"""LA HORDA — EVALUADOR DE INTERFAZ (tools/ui-rework/evaluate.py)

Puntúa 0–100 un recorrido de la UI hecho por crawl.js (uno o varios viewports) y devuelve instrucciones para el Arquitecto.
Criterios (peso):
  clics 30   JUGAR, CÓDICE y TIENDA a ≤ 2 clics desde el título (10 c/u; 3 clics = mitad; 4 o no alcanzado = 0). Contar secciones dentro.
  foco 20    pocos elementos accionables por pantalla: título ≤ 4, hub ≤ 9, demás ≤ 14.
  blancos 15 ≥ 90 % de los accionables con el lado menor ≥ 44 px (UX_BIBLE: botones táctiles).
  desborde 10 ningún texto se sale de su marco.
  jerarquía 10 en título y hub hay UNA acción dominante (≥ 1,5× el área de la segunda).
  retro 10   ≤ 2 familias tipográficas, esquinas casi rectas (≤ 6 px), ≤ 8 fondos distintos, ningún emoji de color (docs/ART_BIBLE.md §15).
  salida 5   toda pantalla que no es raíz tiene un control visible de volver/cerrar.
PASS = puntaje ≥ 85, las tres metas de clics cumplidas y 0 desbordes. La revisión humana de arte/UX sigue siendo necesaria.
Uso: python3 tools/ui-rework/evaluate.py crawl-844.json [crawl-667.json …] [--json salida.json] [--strict]
"""
import json
import re
import sys
from pathlib import Path

W = {'clics': 30, 'foco': 20, 'blancos': 15, 'desborde': 10, 'jerarquia': 10, 'retro': 10, 'salida': 5}
LIMIT = {'title': 4, 'mainmenu': 9}
DEFAULT_LIMIT = 14
GOAL_NAMES = {'JUGAR': 'jugar', 'CODICE': 'ver el Códice', 'TIENDA': 'entrar a la Tienda'}
ROOT_STATES = {'title', 'mainmenu'}
# alcance del rework (pedido): inicio → menú principal → modos/multijugador → sala. Códice, Tienda, Desafíos… se miden solo en clics.
SCOPE = {'title', 'mainmenu', 'modeselect', 'prep', 'crystalwars'}
BACK = re.compile(r'volver|atr[aá]s|cerrar|men[uú]|‹|←|✕|×|\bx\b|salir|back|close', re.I)
PIXEL_FONTS = ('press start', 'vt323', 'pixel')


def evaluate(crawl):
    issues, ops = [], []
    pts = {k: 0.0 for k in W}
    # ---- clics
    goals = crawl.get('goals', {})
    for g, label in GOAL_NAMES.items():
        c = goals.get(g, {}).get('clicks')
        if c is None:
            issues.append(f'{label}: no se alcanza en {crawl.get("depth", "≤3")} clics')
            ops.append({'act': 'shortcut', 'goal': g, 'why': f'poner {label} a la vista en el título/hub (1 clic desde el hub)'})
            continue
        v = 1.0 if c <= 2 else 0.5 if c == 3 else 0.0
        pts['clics'] += W['clics'] / 3 * v
        if c > 2:
            issues.append(f'{label}: {c} clics (máximo 2)')
            ops.append({'act': 'shortcut', 'goal': g, 'why': f'{label} tarda {c} clics: exponerlo como botón directo'})
    # ---- por pantalla
    screens = {k: v for k, v in crawl.get('screens', {}).items() if k in SCOPE}
    foco, blancos_ok, blancos_n, over = [], 0, 0, 0
    fam, bgs, radii, emoji = set(), set(), [], 0
    for sk, s in screens.items():
        if sk == 'playing':
            continue
        els = s['els']
        lim = LIMIT.get(sk, DEFAULT_LIMIT)
        n = len(els)
        foco.append(1.0 if n <= lim else max(0.0, 1 - (n - lim) / (lim * 1.2)))
        if n > lim:
            issues.append(f'{sk}: {n} elementos accionables (límite {lim})')
            ops.append({'act': 'collapse', 'screen': sk, 'limit': lim, 'why': f'{sk} muestra {n} acciones: agrupar las secundarias en un panel'})
        for e in els:
            blancos_n += 1
            if min(e['w'], e['h']) >= 44:
                blancos_ok += 1
            else:
                issues.append(f"{sk}: «{(e['label'] or e['id'])[:22]}» mide {e['w']}×{e['h']} (< 44)")
            if e.get('overflow'):
                over += 1
                issues.append(f"{sk}: «{(e['label'] or e['id'])[:22]}» desborda su marco")
            fam.add(e['font'].lower())
            bgs.add(e['bg'])
            radii.append(e['br'])
        emoji += s.get('emoji', 0)
    pts['foco'] = W['foco'] * (sum(foco) / len(foco) if foco else 0)
    ratio = blancos_ok / blancos_n if blancos_n else 0
    pts['blancos'] = W['blancos'] * min(1.0, ratio / 0.9)
    if ratio < 0.9:
        ops.append({'act': 'targets', 'why': f'solo {ratio:.0%} de los botones llega a 44 px: ampliar el área táctil (padding / min-height)'})
    pts['desborde'] = W['desborde'] if over == 0 else 0.0
    # ---- jerarquía
    hj = []
    for sk in ('title', 'mainmenu'):
        s = screens.get(sk)
        if not s:
            continue
        areas = sorted((e['w'] * e['h'] for e in s['els']), reverse=True)
        ok = len(areas) >= 2 and areas[0] >= 1.5 * areas[1]
        hj.append(1.0 if ok else 0.4)
        if not ok:
            issues.append(f'{sk}: no hay una acción dominante (la mayor no supera 1,5× a la segunda)')
            ops.append({'act': 'primary', 'screen': sk, 'why': f'{sk}: una sola acción principal grande (JUGAR) y el resto subordinado'})
    pts['jerarquia'] = W['jerarquia'] * (sum(hj) / len(hj) if hj else 0)
    # ---- retro
    pixel = {f for f in fam if any(p in f for p in PIXEL_FONTS)}
    r = 0.0
    r += 0.3 if len(fam) <= 2 else 0.3 * max(0.0, 1 - (len(fam) - 2) / 3)
    r += 0.3 if radii and max(radii) <= 6 else 0.1
    r += 0.2 if len(bgs) <= 8 else 0.2 * max(0.0, 1 - (len(bgs) - 8) / 8)
    r += 0.2 if emoji == 0 else 0.0
    pts['retro'] = W['retro'] * r
    if len(fam) > 2:
        issues.append(f'{len(fam)} familias tipográficas en botones: {sorted(fam)[:4]}')
        ops.append({'act': 'type', 'why': 'unificar a Press Start 2P (títulos/botones) + VT323 (texto)'})
    if radii and max(radii) > 6:
        ops.append({'act': 'corners', 'why': 'esquinas rectas (≤ 6 px): lenguaje de píxel'})
    if len(bgs) > 8:
        ops.append({'act': 'palette', 'why': f'{len(bgs)} fondos distintos en botones: reducir a la paleta de tokens'})
    # ---- salida
    sal = []
    for sk, s in screens.items():
        if sk in ROOT_STATES or sk == 'playing':
            continue
        has = any(BACK.search((e['label'] or '') + ' ' + (e['id'] or '')) for e in s['els'])
        sal.append(1.0 if has else 0.0)
        if not has:
            issues.append(f'{sk}: sin control visible de volver/cerrar')
            ops.append({'act': 'back', 'screen': sk, 'why': f'{sk}: agregar «‹ Volver» fijo arriba a la izquierda'})
    pts['salida'] = W['salida'] * (sum(sal) / len(sal) if sal else 1.0)
    total = round(sum(pts.values()), 1)
    clicks_ok = all(goals.get(g, {}).get('clicks', 99) <= 2 for g in GOAL_NAMES)
    status = 'PASS' if total >= 85 and clicks_ok and over == 0 else 'FAIL'
    return {'score': total, 'status': status, 'points': {k: round(v, 1) for k, v in pts.items()}, 'weights': W, 'issues': issues, 'ops': ops,
            'goals': {g: goals.get(g, {}).get('clicks') for g in GOAL_NAMES}, 'screens': {k: len(v['els']) for k, v in screens.items()}}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    out = None
    if '--json' in sys.argv:
        out = sys.argv[sys.argv.index('--json') + 1]
        args = [a for a in args if a != out]
    reports = {}
    for a in args:
        reports[Path(a).stem] = evaluate(json.loads(Path(a).read_text(encoding='utf-8')))
    for name, r in reports.items():
        print(f"{name}: {r['status']} {r['score']}  clics={r['goals']}  pantallas={r['screens']}")
        for k, v in r['points'].items():
            print(f"   {k:<10} {v}/{W[k]}")
        for i in r['issues'][:14]:
            print('   ·', i)
    if out:
        Path(out).write_text(json.dumps(reports, ensure_ascii=False, indent=1), encoding='utf-8')
    worst = min((r['score'] for r in reports.values()), default=0)
    sys.exit(0 if all(r['status'] == 'PASS' for r in reports.values()) else (1 if '--strict' in sys.argv else 0))


if __name__ == '__main__':
    main()
