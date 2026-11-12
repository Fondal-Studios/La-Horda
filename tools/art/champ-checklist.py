#!/usr/bin/env python3
"""Checklist de campeones (para no repetir trabajo): renderiza docs/art-brief/runway-pack/CHECKLIST_CAMPEONES.md desde estado-campeones.json.
Uso: python3 tools/art/champ-checklist.py            (escribe el .md)
     python3 tools/art/champ-checklist.py set <id> <etapa> <estado> ["nota"]   (actualiza el JSON y regenera)
     python3 tools/art/champ-checklist.py descartado <id> "qué se probó y por qué no sirve"
     python3 tools/art/champ-checklist.py --check     (falla si el .md no está sincronizado; lo corre test-runway-pack.py)
Regla: ANTES de generar algo de un campeón se lee su fila; al terminar un paso se marca. Estados: pendiente/generado/aprobado/hecho/rechazado."""
import json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); PK = os.path.join(ROOT, 'docs/art-brief/runway-pack')
J = os.path.join(PK, 'estado-campeones.json'); M = os.path.join(PK, 'CHECKLIST_CAMPEONES.md')
SYM = {'pendiente': '·', 'generado': 'G', 'aprobado': 'A', 'hecho': '✔', 'rechazado': '✘'}
def render(st):
    et = st['_etapas']; L = ['# Checklist de campeones (Runway → atlas → motor)\n',
        '> Generado por `tools/art/champ-checklist.py` desde `estado-campeones.json` (fuente de verdad). **Leer la fila del campeón ANTES de generar nada; marcar al terminar cada paso.** No se edita a mano este .md.\n',
        '**Leyenda:** `·` pendiente · `G` generado sin aprobar · `A` aprobado a ojo · `✔` hecho y verificado · `✘` probado y descartado (no repetir igual).\n',
        '**Un campeón está «LISTO» solo si** `atlas_armado`, `gates`, `instalado_motor`, `captura_antes_despues` y `revision_independiente` están en `✔` (y `mergeado` cuando entra a main).\n',
        f"**Meta actual: 5 campeones listos** → prioridad: {', '.join('`%s`' % c for c in st['_prioridad_5'])}.\n"]
    done = [c for c, v in st['campeones'].items() if all(v['etapas'].get(e) == 'hecho' for e in ('atlas_armado', 'gates', 'instalado_motor', 'captura_antes_despues', 'revision_independiente'))]
    L.append(f"**Listos hoy: {len(done)} de 5** ({', '.join(done) or 'ninguno'}).\n")
    L.append('| Campeón | ' + ' | '.join(e.replace('clip_', 'c:').replace('_', ' ') for e in et) + ' |'); L.append('|---|' + '---|' * len(et))
    order = st['_prioridad_5'] + sorted(c for c in st['campeones'] if c not in st['_prioridad_5'])
    for c in order:
        v = st['campeones'][c]; L.append(f"| **{c}** | " + ' | '.join(SYM[v['etapas'].get(e, 'pendiente')] for e in et) + ' |')
    L.append('\n## Intentos descartados y notas (no repetir)\n')
    for c in order:
        v = st['campeones'][c]
        if v['intentos_descartados'] or v['notas']:
            L.append(f"### {c} — {v['nombre']}")
            for d in v['intentos_descartados']: L.append(f"- ✘ {d}")
            if v['notas']: L.append(f"- {v['notas']}")
            L.append('')
    return '\n'.join(L) + '\n'
def main():
    a = sys.argv[1:]; st = json.load(open(J, encoding='utf-8'))
    if a[:1] == ['set']:
        _, c, e, s = a[:4]; assert c in st['campeones'] and e in st['_etapas'] and s in SYM, 'id, etapa o estado inválido'
        st['campeones'][c]['etapas'][e] = s
        if len(a) > 4: st['campeones'][c]['notas'] = (st['campeones'][c]['notas'] + ' ' + a[4]).strip()
    elif a[:1] == ['descartado']:
        st['campeones'][a[1]]['intentos_descartados'].append(a[2])
    if a[:1] in (['set'], ['descartado']): json.dump(st, open(J, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    out = render(st)
    if a == ['--check']:
        ok = os.path.exists(M) and open(M, encoding='utf-8').read() == out
        print('checklist sincronizado' if ok else 'CHECKLIST DESINCRONIZADO: correr python3 tools/art/champ-checklist.py'); sys.exit(0 if ok else 1)
    open(M, 'w', encoding='utf-8').write(out); print('escrito', os.path.relpath(M, ROOT))
if __name__ == '__main__': main()
