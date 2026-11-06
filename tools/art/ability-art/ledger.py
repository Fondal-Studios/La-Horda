#!/usr/bin/env python3
"""Regenera docs/art-gate/ability-art/LEDGER.md desde los summary.json de cada guardián. Uso: python3 tools/art/ability-art/ledger.py"""
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import canon

L = ['# Registro del circuito de arte de habilidades', '',
     f'Generado por `tools/art/ability-art/ledger.py` desde `docs/art-gate/ability-art/<guardián>/summary.json`. Umbrales: puntaje ≥ {canon.PASS_SCORE}; '
     f'mejora ≥ +{canon.MIN_IMPROVEMENT} sobre el arte actual (con techo: nunca más de la mitad del margen hasta 100); sin regresión de riqueza, presencia ni silueta.', '']
tot = ok = 0
for sp in sorted(canon.OUT_DOCS.glob('*/summary.json')):
    s = json.loads(sp.read_text())
    L += [f"## {s['guardian']}", '', '| habilidad | arte actual | arte nuevo | mejora | rondas | estado |', '|---|---|---|---|---|---|']
    for i, st in s['state'].items():
        h = st['history'][-1]
        b = s['baseline'].get(i)
        imp = h.get('improvement')
        L.append(f"| {i} | {b} | {h['score']} | {'' if imp is None else f'{imp:+}'} | {st['rounds']} | {st['status']} |")
        tot += 1
        ok += st['status'] == 'PASS'
    integ = s.get('integration')
    L += ['', 'Integración: ' + (integ['detail'].splitlines()[-1] if integ else 'no corrida'), '']
L += [f'**Total: {ok}/{tot} piezas aprobadas por el Evaluador.**', '',
      'Capturas antes/después en el motor real: `docs/art-gate/ability-art/<guardián>/ingame/` (arena bosque). Hoja de comparación: `<guardián>/compare.png`.', '',
      'Estos puntajes los produce el Evaluador (contrato técnico, legibilidad, presencia y silueta frente al arte actual); **no son una aprobación de arte**. '
      'Limitación conocida: el Pintor usa familias de marcas genéricas, así que el arte nuevo es más nítido y unificado pero pierde parte del detalle temático '
      'del anterior (panal y polen de Tibor, circuitos de Orsa). La revisión humana de `docs/ART_BIBLE.md` §8 sigue pendiente.']
(canon.OUT_DOCS / 'LEDGER.md').write_text('\n'.join(L) + '\n', encoding='utf-8')
print('\n'.join(L[-8:]))
