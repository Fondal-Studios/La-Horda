#!/usr/bin/env python3
"""Checklist VIVO de prioridad de arte: renderiza docs/art-brief/PRIORIDAD_ASSETS.md desde docs/art-brief/prioridad-assets.json
(CRÍTICOS / IMPORTANTES / SECUNDARIOS con casillas, estado, método, costo y la «PRÓXIMA TAREA» automática).
Uso:
  python3 tools/art/prioridad-assets.py                      regenera PRIORIDAD_ASSETS.md
  python3 tools/art/prioridad-assets.py --check              falla si el .md no está sincronizado, si el JSON es inválido o si algún bloque de
                                                             asset-blocks.json / fila de estado-runway.json / criatura / campeón quedó sin ítem
  python3 tools/art/prioridad-assets.py --next [--saldo N]   imprime SOLO la próxima tarea (primer ítem crítico no terminado ni bloqueado; luego
                                                             importantes y secundarios). Con --saldo < 250 (o --gratis) solo ítems de 0 créditos.
  python3 tools/art/prioridad-assets.py --set <id> <estado> [--nota "texto"]   marca un ítem (hecho | instalado_sin_aprobar | pendiente | en_curso |
                                                             bloqueado_decision | duplicado_de:<id>) y regenera el .md
  python3 tools/art/prioridad-assets.py --id <id>            imprime la ficha completa de un ítem
Siembra inicial / bloques nuevos: tools/art/prioridad-seed.py (--merge). Guía: docs/art-brief/COMO_USAR_PRIORIDAD.md."""
import collections, json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
P = lambda *a: os.path.join(ROOT, *a)
JSON = P('docs/art-brief/prioridad-assets.json')
OUT = P('docs/art-brief/PRIORIDAD_ASSETS.md')
PRIOS = ['critico', 'importante', 'secundario']
TITULO = {'critico': 'CRÍTICOS', 'importante': 'IMPORTANTES', 'secundario': 'SECUNDARIOS'}
ESTADOS = ['hecho', 'instalado_sin_aprobar', 'pendiente', 'en_curso', 'bloqueado_decision']
CATS = ['campeon', 'enemigo', 'jefe', 'arena', 'ui', 'efecto', 'icono', 'skin', 'otro']
METODOS = ['gpt_image_2_codice_limpio', 'gen4_image', 'pintor_determinista', 'humano']
LISTOS = ('hecho', 'instalado_sin_aprobar')   # dependencia satisfecha
SALDO_MINIMO = 250                            # regla vigente de la rutina: no gastar Runway con saldo < 250

def load(*p):
    with open(P(*p), encoding='utf-8') as f: return json.load(f)
def est0(it): return it['estado'].split(':')[0]
def is_dup(it): return it['estado'].startswith('duplicado_de:')
def esc(s): return str(s).replace('|', '\\|').replace('\n', ' ')

def listos(items, it):
    return all(est0(by_id(items)[d]) in LISTOS for d in it.get('dependencias', []) if d in by_id(items))
_cache = {}
def by_id(items):
    k = id(items)
    if k not in _cache: _cache[k] = {i['id']: i for i in items}
    return _cache[k]

def candidatos(items, gratis=False):
    out = []
    for p in PRIOS:
        for it in sorted((i for i in items if i['prioridad'] == p), key=lambda i: i['orden']):
            if est0(it) != 'pendiente' or is_dup(it) or it['metodo'] == 'humano' or not listos(items, it): continue
            if gratis and it.get('costo_creditos') != 0: continue
            out.append(it)
    return out

def ficha(it, items):
    L = ['%s  [%s · prioridad %s · orden %d]' % (it['id'], it['categoria'], it['prioridad'], it['orden']), '  Qué: ' + it['descripcion'],
         '  Estado: %s · método: %s · costo estimado: %s' % (it['estado'], it['metodo'], '%s cr' % it['costo_creditos'] if it.get('costo_creditos') is not None else 'no estimado')]
    r = it.get('refs', {})
    if r.get('bloques'): L.append('  Bloques (asset-blocks.json): ' + ', '.join(r['bloques']))
    if r.get('bloques_compartidos'): L.append('  También cubre: ' + ', '.join(r['bloques_compartidos']))
    if r.get('runway'): L.append('  Registro Runway (estado-runway.json): ' + ', '.join(r['runway']))
    if r.get('docs'): L.append('  Docs: ' + ', '.join(r['docs']))
    if it.get('dependencias'): L.append('  Depende de: ' + ', '.join(it['dependencias']))
    L.append('  Evidencia: ' + it['evidencia'])
    if it.get('nota'): L.append('  Nota: ' + it['nota'])
    return '\n'.join(L)

def render(doc):
    items = doc['items']; I = by_id(items)
    act = [i for i in items if not is_dup(i)]; dups = [i for i in items if is_dup(i)]
    L = ['# Prioridad de arte: CRÍTICOS, IMPORTANTES y SECUNDARIOS (checklist vivo)', '',
         '> Generado por `tools/art/prioridad-assets.py` desde `docs/art-brief/prioridad-assets.json` (la fuente de verdad). **No se edita a mano este .md**: se marca con `python3 tools/art/prioridad-assets.py --set <id> <estado>` y se regenera. `--check` lo corre `tools/art/test-runway-pack.py`. Procedimiento de la tarea programada: [COMO_USAR_PRIORIDAD.md](COMO_USAR_PRIORIDAD.md). Complementa (no reemplaza) a [CHECKLIST_ARTE.md](CHECKLIST_ARTE.md) y a `docs/production/asset-blocks.json`.', '',
         '**Regla:** antes de dibujar o generar algo, buscalo acá: si está `hecho`, `instalado_sin_aprobar` o `duplicado_de:` NO se vuelve a generar. Se trabaja de arriba abajo: críticos, después importantes, después secundarios.', '']
    nxt = candidatos(items); gr = candidatos(items, True)
    L += ['## PRÓXIMA TAREA', '']
    if nxt:
        L += ['Primer ítem crítico no terminado ni bloqueado (`python3 tools/art/prioridad-assets.py --next`):', '', '```', ficha(nxt[0], items), '```', '']
        if gr and gr[0]['id'] != nxt[0]['id']: L += ['Próxima SIN gastar créditos (si el saldo de Runway es < %d: `--next --gratis`): **%s** (%s).' % (SALDO_MINIMO, gr[0]['id'], gr[0]['prioridad']), '']
        elif gr: L += ['Esta tarea no gasta créditos.', '']
    else: L += ['No queda ningún ítem pendiente y desbloqueado.', '']
    # resumen
    L += ['## Resumen', '', '| Prioridad | Ítems | hecho | instalado sin aprobar | pendiente | en curso | bloqueado (decisión) | créditos estimados pendientes |', '|---|---:|---:|---:|---:|---:|---:|---:|']
    tot = collections.Counter(); cred_all = 0
    for p in PRIOS:
        a = [i for i in act if i['prioridad'] == p]; c = collections.Counter(est0(i) for i in a)
        cred = sum(i.get('costo_creditos') or 0 for i in a if est0(i) in ('pendiente', 'en_curso', 'bloqueado_decision')); cred_all += cred; tot.update(c)
        L.append('| %s | %d | %d | %d | %d | %d | %d | %d |' % (TITULO[p], len(a), c['hecho'], c['instalado_sin_aprobar'], c['pendiente'], c['en_curso'], c['bloqueado_decision'], cred))
    L.append('| **Total** | **%d** | %d | %d | %d | %d | %d | %d |' % (len(act), tot['hecho'], tot['instalado_sin_aprobar'], tot['pendiente'], tot['en_curso'], tot['bloqueado_decision'], cred_all))
    L += ['', '**Duplicados (no regenerar): %d ítems** (sección final). Créditos: solo los ítems con `gen4_image` o `gpt_image_2_codice_limpio` gastan Runway; el resto es 0 (pintor determinista / humano). Los costos son estimaciones del repo (hoja de 4 poses gpt_image_2 = 20, imagen gen4_image = 8, hoja de enemigo = 5), no medidas.' % len(dups), '',
          '**Criterios** (detalle en el JSON, `_leyenda._criterios`):', '']
    for p in PRIOS: L.append('- **%s**: %s' % (TITULO[p], doc['_leyenda']['_criterios'][p]))
    L += ['', '**Estados:** ' + ' · '.join('`%s`' % e for e in ESTADOS) + ' · `duplicado_de:<id>`. **Métodos:** ' + ' · '.join('`%s`' % m for m in METODOS) + '.', '']
    for p in PRIOS:
        a = sorted((i for i in act if i['prioridad'] == p), key=lambda i: i['orden'])
        pend = [i for i in a if est0(i) != 'hecho']; hec = [i for i in a if est0(i) == 'hecho']
        L += ['## %s' % TITULO[p], '', '%d ítems abiertos y %d hechos. Orden = orden de trabajo.' % (len(pend), len(hec)), '']
        for i in pend:
            cr = '%s cr' % i['costo_creditos'] if i.get('costo_creditos') is not None else 'costo no estimado'
            L.append('- [ ] **%d. `%s`** · %s · `%s` · `%s` · %s%s' % (i['orden'], i['id'], i['categoria'], i['estado'], i['metodo'], cr, (' · depende de ' + ', '.join('`%s`' % d for d in i['dependencias'])) if i.get('dependencias') else ''))
            L.append('  - %s' % i['descripcion'])
            L.append('  - Evidencia: %s' % i['evidencia'])
            if i.get('nota'): L.append('  - Nota: %s' % i['nota'])
            r = i['refs']; rr = []
            if r.get('bloques'): rr.append('bloques ' + ', '.join(r['bloques']))
            if r.get('bloques_compartidos'): rr.append('también ' + ', '.join(r['bloques_compartidos']))
            if r.get('runway'): rr.append('runway ' + ', '.join(r['runway']))
            if rr: L.append('  - Refs: ' + ' · '.join(rr))
        if hec:
            L += ['', '<details><summary>Hechos (%d): no repetir</summary>' % len(hec), '']
            for i in hec: L.append('- [x] `%s` — %s' % (i['id'], esc(i['descripcion'])[:150] + (' — NOTA: ' + esc(i['nota'])[:160] if i.get('nota') else '')))
            L += ['', '</details>']
        L.append('')
    L += ['## DUPLICADOS (NO regenerar)', '', 'Arte que figura más de una vez en los documentos (el mismo asset en otro bloque o fila, o un agregado de seguimiento) o que ya existe en el juego. El ítem canónico es el que lleva el trabajo; estos no se dibujan.', '',
          '| id | duplicado de | bloques / runway | qué NO hay que regenerar |', '|---|---|---|---|']
    for i in sorted(dups, key=lambda i: (PRIOS.index(i['prioridad']), i['orden'])):
        r = i['refs']; ref = ', '.join((r.get('bloques') or []) + (r.get('runway') or []))
        L.append('| `%s` | `%s` | %s | %s |' % (i['id'], i['estado'].split(':', 1)[1], esc(ref), esc(i.get('nota') or i['descripcion'])[:170]))
    L.append('')
    return '\n'.join(L)

def validar(doc):
    errs = []; items = doc['items']; ids = [i['id'] for i in items]; I = {i['id']: i for i in items}
    for d in {x for x in ids if ids.count(x) > 1}: errs.append('id repetido: ' + d)
    ords = collections.defaultdict(list)
    for i in items:
        for k in ('id', 'categoria', 'descripcion', 'prioridad', 'orden', 'estado', 'metodo', 'costo_creditos', 'refs', 'dependencias', 'evidencia'):
            if k not in i: errs.append('%s: falta el campo %s' % (i.get('id'), k))
        if i['categoria'] not in CATS: errs.append('%s: categoría inválida %s' % (i['id'], i['categoria']))
        if i['prioridad'] not in PRIOS: errs.append('%s: prioridad inválida' % i['id'])
        if i['metodo'] not in METODOS: errs.append('%s: método inválido %s' % (i['id'], i['metodo']))
        if is_dup(i):
            t = i['estado'].split(':', 1)[1]
            if t not in I: errs.append('%s: duplicado_de apunta a un id inexistente (%s)' % (i['id'], t))
            elif is_dup(I[t]): errs.append('%s: duplicado de otro duplicado (%s)' % (i['id'], t))
        elif est0(i) not in ESTADOS: errs.append('%s: estado inválido %s' % (i['id'], i['estado']))
        for d in i.get('dependencias', []):
            if d not in I: errs.append('%s: dependencia inexistente %s' % (i['id'], d))
        if not is_dup(i): ords[i['prioridad']].append(i['orden'])
        if not str(i.get('evidencia', '')).strip(): errs.append('%s: evidencia vacía (usar «no medido»)' % i['id'])
    for p, o in ords.items():
        if len(set(o)) != len(o): errs.append('orden repetido dentro de %s' % p)
    return errs

def cobertura(doc):
    errs = []; items = doc['items']
    bl = load('docs/production/asset-blocks.json'); B = {b['id']: b for b in bl['blocks']}
    own = collections.Counter(b for i in items for b in i['refs'].get('bloques', []))
    for b in B:
        if own[b] != 1: errs.append('bloque %s: %d dueños (debe ser exactamente 1; si es nuevo correr tools/art/prioridad-seed.py --merge)' % (b, own[b]))
    for b in own:
        if b not in B: errs.append('bloque inexistente en asset-blocks.json: ' + b)
    rw = load('docs/art-brief/runway-pack/estado-runway.json')['entradas']; used = {r for i in items for r in i['refs'].get('runway', [])}
    for e in rw:
        if e['id'] not in used: errs.append('fila de estado-runway.json sin ítem: ' + e['id'])
    I = {i['id'] for i in items}
    for t in (r['t'] for r in load('docs/art-brief/enemy-coverage.json')['results']):
        if 'enemigo-' + t not in I: errs.append('criatura sin ítem: ' + t)
    for c in load('docs/art-brief/runway-pack/estado-campeones.json')['campeones']:
        if 'campeon-' + c not in I: errs.append('campeón sin ítem: ' + c)
    n_items = sum(len(b['items']) for b in B.values())
    return errs, len(B), n_items

def main(a):
    doc = load('docs/art-brief/prioridad-assets.json'); items = doc['items']
    if '--check' in a:
        errs = validar(doc); ce, nb, ni = cobertura(doc); errs += ce
        md = render(doc)
        cur = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
        if cur != md: errs.append('PRIORIDAD_ASSETS.md desincronizado: correr `python3 tools/art/prioridad-assets.py`')
        if errs:
            print('FALLA prioridad-assets (%d problemas):' % len(errs)); [print(' -', e) for e in errs[:40]]; sys.exit(1)
        act = [i for i in items if not is_dup(i)]
        rw = {e['id']: e['estado'] for e in load('docs/art-brief/runway-pack/estado-runway.json')['entradas']}
        for i in act:
            r1 = i['refs'].get('runway', [])
            if len(r1) == 1 and rw.get(r1[0]) == 'hecho_integrado' and est0(i) in ('pendiente', 'en_curso', 'bloqueado_decision'):
                print('AVISO deriva: %s está %s pero estado-runway.json %s = hecho_integrado (revisar con --set)' % (i['id'], est0(i), r1[0]))
        print('OK prioridad-assets: %d ítems (%d activos, %d duplicados) cubren %d bloques / %d entradas de asset-blocks.json; .md sincronizado' % (len(items), len(act), len(items) - len(act), nb, ni)); return
    if '--next' in a:
        try: saldo = int(a[a.index('--saldo') + 1]) if '--saldo' in a else None
        except (ValueError, IndexError): sys.exit('--saldo necesita un entero (créditos): --next --saldo 37')
        gratis = '--gratis' in a or (saldo is not None and saldo < SALDO_MINIMO)
        c = candidatos(items, gratis)
        if not c: print('SIN TAREA' + (' sin gasto de créditos' if gratis else '') + ': no hay ítems pendientes y desbloqueados.'); return
        print(ficha(c[0], items)); print('\nAl terminar: python3 tools/art/prioridad-assets.py --set %s hecho  (y registrar en docs/beta-release/ART_CREDITS.md)' % c[0]['id']); return
    if '--id' in a:
        I = {i['id']: i for i in items}; k = a[a.index('--id') + 1]
        if k not in I: sys.exit('id inexistente: ' + k)
        print(ficha(I[k], items)); return
    if '--set' in a:
        k, est = a[a.index('--set') + 1], a[a.index('--set') + 2]; I = {i['id']: i for i in items}
        if k not in I: sys.exit('id inexistente: ' + k)
        if not (est in ESTADOS or (est.startswith('duplicado_de:') and est.split(':', 1)[1] in I and est.split(':', 1)[1] != k)): sys.exit('estado inválido: %s (válidos: %s, duplicado_de:<id>)' % (est, ', '.join(ESTADOS)))
        if is_dup(I[k]) and not est.startswith('duplicado_de:') and '--forzar' not in a:
            sys.exit('%s es %s: marcarlo con otro estado lo reactivaría y duplicaría arte; si es a propósito, agregar --forzar' % (k, I[k]['estado']))
        I[k]['estado'] = est
        if '--nota' in a: I[k]['nota'] = a[a.index('--nota') + 1]
        errs = validar(doc)
        if errs: sys.exit('\n'.join(errs))
        with open(JSON, 'w', encoding='utf-8') as f: json.dump(doc, f, ensure_ascii=False, indent=1); f.write('\n')
        print('%s -> %s' % (k, est))
    with open(OUT, 'w', encoding='utf-8') as f: f.write(render(doc))
    print('escrito', os.path.relpath(OUT, ROOT))

if __name__ == '__main__': main(sys.argv[1:])
