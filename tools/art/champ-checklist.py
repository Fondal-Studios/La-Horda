#!/usr/bin/env python3
"""Checklist de TODOS los campeones (para no repetir trabajo): renderiza docs/art-brief/runway-pack/CHECKLIST_CAMPEONES.md con lo que el juego tiene/le falta por campeón (auditoría + atlas registrados) y lo probado con Runway (estado-campeones.json).
Uso: python3 tools/art/champ-checklist.py            (escribe el .md)
     python3 tools/art/champ-checklist.py set <id> <etapa> <estado> ["nota"]   (actualiza el JSON y regenera)
     python3 tools/art/champ-checklist.py descartado <id> "qué se probó y por qué no sirve"
     python3 tools/art/champ-checklist.py --check     (falla si el .md no está sincronizado; lo corre test-runway-pack.py)
Regla: ANTES de generar algo de un campeón se lee su fila; al terminar un paso se marca. Estados: pendiente/generado/aprobado/hecho/rechazado."""
import json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); PK = os.path.join(ROOT, 'docs/art-brief/runway-pack')
J = os.path.join(PK, 'estado-campeones.json'); M = os.path.join(PK, 'CHECKLIST_CAMPEONES.md')
SYM = {'pendiente': '·', 'generado': 'G', 'aprobado': 'A', 'hecho': '✔', 'rechazado': '✘'}   # estados válidos de las etapas de Runway
def audit():
    """Lo que el juego REALMENTE tiene/le falta por campeón, de la auditoría del repo (manifiestos/campeones_faltantes.json, 2026-10-18) + atlas registrados (pose-ref)."""
    m = json.load(open(os.path.join(ROOT, 'docs/art-brief/manifiestos/campeones_faltantes.json'), encoding='utf-8'))
    out = {}
    for r in m['assets']:
        if r['tipo'] in ('fx', 'iconos') or r['estado'] == 'BLOQUEADO_SIN_HOOK': continue
        out.setdefault(r['campeon'], []).append(r)
    return out
CANON = ['walk_down', 'walk_side', 'walk_up', 'attack_down', 'attack_side', 'attack_up', 'cast_down', 'ultimate_down', 'hit_down', 'death_down']
def estados(meta):
    """Estados del atlas ACTUAL según los `sets` de su registro: (faltan, repetidos). Sin `sets` declarados el atlas usa el layout estándar de 36 cuadros."""
    sets = (meta or {}).get('sets')
    if not sets: return None
    # cast/ultimate/hit/death se dibujan en UNA dirección y el motor las reutiliza: vale cualquier variante (_down/_side/_up)
    has = lambda e: e in sets if e.split('_')[0] in ('walk', 'attack') else any(k.startswith(e.split('_')[0] + '_') for k in sets)
    falta = [e for e in CANON if not has(e)]; rep = []
    for e in CANON:
        if e in sets:
            for o in CANON:
                if o != e and o in sets and sets[o] == sets[e] and CANON.index(o) < CANON.index(e): rep.append(f"{e}={o}"); break
    return falta, rep
def render(st):
    import importlib.util
    sp = importlib.util.spec_from_file_location('pose_ref', os.path.join(ROOT, 'tools/art/pose-ref.py')); pr = importlib.util.module_from_spec(sp); sp.loader.exec_module(pr)
    au = audit(); PRI = {'P0': 0, 'P1': 1, 'P2': 2}
    L = ['# Checklist de TODOS los campeones: qué tiene cada uno y qué le falta\n',
        '> Generado por `tools/art/champ-checklist.py` desde `manifiestos/campeones_faltantes.json` (auditoría del repo, 2026-10-18; mide el juego real), los atlas registrados en el juego y `estado-campeones.json` (lo probado con Runway). No se edita a mano este .md: se regenera.\n',
        '**Cómo leerlo.** `Lámina` = existe la lámina del Códice. `Atlas actual` = el atlas del cuerpo que el juego usa hoy (celda y columnas). `Estados que faltan o están repetidos` = se calcula de los `sets` del atlas que el juego usa HOY (un estado repetido es uno que reutiliza los mismos cuadros que otro, p. ej. lanzar = ataque). `Auditoría 18-oct` = lo que decía la auditoría vieja (prioridad entre paréntesis: P0 bloquea jugar bien, P1 se nota, P2 pulido); varias entradas ya se arreglaron. `Skins/formas` = recolores, placeholders o formas pendientes. `Runway` = lo que se probó y su resultado.\n',
        '**Antes de generar nada de un campeón, leer su fila y su sección de notas.** Resultado medido (muestra: Tanque, 2026-11-12): Runway por imagen suelta o por video NO superó al atlas actual; ver `REGISTRO_RUNWAY.md` («NO REPETIR»).\n']
    ids = list(st['campeones'].keys()); n_falta = sum(1 for c in ids if any(r['tipo'] == 'cuerpo' for r in au.get(c, [])))
    L.append(f"**Campeones: {len(ids)}.** Según la auditoría vieja (18-oct) {n_falta} tenían faltantes de cuerpo; **mirá la columna «del atlas ACTUAL»: es la que manda**.\n")
    L.append('| Campeón | Lámina | Atlas actual | Estados que faltan o están repetidos (del atlas ACTUAL) | Auditoría 18-oct (puede estar vieja) | Skins/formas | Runway |'); L.append('|---|---|---|---|---|---|---|')
    order = sorted(ids, key=lambda c: (min([PRI[r['prioridad']] for r in au.get(c, [])] or [9]), c))
    for c in order:
        v = st['campeones'][c]; rows = au.get(c, [])
        lam = 'sí' if os.path.exists(os.path.join(ROOT, 'assets/ui/codex/champions', c + '.png')) else '**NO**'
        r = pr.find(c); at = f"{r[1]['w']}×{r[1]['h']}, {r[1]['cols']} col" if r else '**sin atlas**'
        e = estados(r[1]) if r else None
        real = 'sin atlas' if not r else ('layout estándar de 36 (sin sets declarados: no se puede medir acá)' if e is None else ('completo' if not e[0] and not e[1] else '; '.join(([('faltan: ' + ', '.join(e[0]))] if e[0] else []) + ([('repetidos: ' + ', '.join(e[1]))] if e[1] else []))))
        cu = '; '.join(f"{x['id'].split('.')[-1]} ({x['prioridad']})" for x in rows if x['tipo'] == 'cuerpo') or '—'
        ca = f"{sum(1 for x in rows if x['tipo']=='calidad')} defecto(s)" if any(x['tipo'] == 'calidad' for x in rows) else '—'
        sk = ', '.join(f"{x['tipo']}:{x['estado'].lower()}" for x in rows if x['tipo'] in ('skin', 'forma')) or '—'
        ru = '; '.join(f"{k.replace('_',' ')}={val}" for k, val in v['etapas'].items()) or 'no probado'
        L.append(f"| **{c}** | {lam} | {at} | {real} | {cu} | {sk} | {ru} |")
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
