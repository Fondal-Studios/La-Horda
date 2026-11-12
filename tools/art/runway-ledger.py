#!/usr/bin/env python3
"""Registro único de TODO el trabajo hecho con Runway (para no repetir): renderiza docs/art-brief/runway-pack/REGISTRO_RUNWAY.md desde estado-runway.json.
Uso: python3 tools/art/runway-ledger.py            (escribe el .md)
     python3 tools/art/runway-ledger.py set <id> <estado> ["nota"]   (cambia el estado; la nota se agrega a por_que con la fecha) y regenera
     python3 tools/art/runway-ledger.py add <id> <categoria> <estado> "descripcion" [clave=valor ...]   (entrada nueva; claves: creditos, task_ids (coma), donde_esta (coma), por_que, siguiente_paso, valor, costo_estimado, fecha, verificacion)
     python3 tools/art/runway-ledger.py --check     (falla si el .md no está sincronizado o el JSON es inválido; lo corre test-runway-pack.py)
Regla: ANTES de generar algo con Runway se busca su id acá y en «NO REPETIR»; al terminar (o fallar) se anota con `set`/`add` el mismo día.
El «pendiente» de `node tools/art-world/runway-world.js list` NO es fiable (solo mira art-source/runway-world/ciudad/): manda este registro.
Estados: hecho_integrado / hecho_sin_integrar / rechazado / pendiente / bloqueado / sin_verificar."""
import datetime, json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); PK = os.path.join(ROOT, 'docs/art-brief/runway-pack')
J = os.path.join(PK, 'estado-runway.json'); M = os.path.join(PK, 'REGISTRO_RUNWAY.md')
ESTADOS = ['hecho_integrado', 'hecho_sin_integrar', 'rechazado', 'pendiente', 'bloqueado', 'sin_verificar']
CATS = ['lamina_campeon', 'prop_mundo', 'piso_arena', 'centro_arena', 'fachada', 'enemigo_hoja', 'jefe', 'campeon_cuerpo', 'campeon_video', 'retrato', 'otro']
SYM = {'hecho_integrado': '✔ integrado', 'hecho_sin_integrar': '◐ sin integrar', 'rechazado': '✘ rechazado', 'pendiente': '· pendiente', 'bloqueado': '⛔ bloqueado', 'sin_verificar': '? sin verificar'}
CAMPOS = ['id', 'categoria', 'descripcion', 'estado', 'ultima_fecha', 'task_ids', 'creditos', 'donde_esta', 'por_que', 'siguiente_paso', 'verificacion']
def esc(s): return str(s).replace('|', '\\|').replace('\n', ' ')
def short(t): return t[:8] if len(t) > 8 and '-' in t[:9] else t
def render(st):
    E = st['entradas']; L = ['# Registro único de trabajo con Runway (no repetir)\n',
        '> Generado por `tools/art/runway-ledger.py` desde `estado-runway.json` (fuente de verdad). **No se edita a mano este .md.** Antes de generar algo con Runway: buscar su id en las tablas y en «NO REPETIR»; al terminar, `python3 tools/art/runway-ledger.py set <id> <estado> "nota"` o `add`.\n',
        '> **`node tools/art-world/runway-world.js list` NO es fiable:** su «OK/pendiente» mira solo `art-source/runway-world/ciudad/<id>/master.png`, así que marca «pendiente» trabajos hechos de otras arenas (pisos, centros, fort_*). Los 17 trabajos de esa herramienta tienen master y recibo; manda este registro.\n',
        f"> Auditado el {st['auditado']} en la rama `{st['rama']}` contra el repo (archivos con `ls`, carga con `grep` en `js/`). Costo medido: 8 cr por imagen gen4_image 1024; hoja de enemigo 1280x720 observada a 5 cr; video gen4_turbo 2 s = 10 cr. Los créditos son los registrados por recibo/ART_CREDITS (hay gasto sin recibo: ver notas); el saldo de la cuenta es compartido.\n"]
    c = {s: sum(1 for e in E if e['estado'] == s) for s in ESTADOS}
    L.append('**Entradas: %d** · ' % len(E) + ' · '.join('%s %d' % (SYM[s], c[s]) for s in ESTADOS if c[s]) + ' · créditos registrados: %d\n' % sum(e.get('creditos') or 0 for e in E))
    for cat in CATS:
        es = [e for e in E if e['categoria'] == cat]
        if not es: continue
        L.append('## %s (%d)\n' % (cat, len(es))); L.append('| id | estado | fecha | cr | dónde está | nota |'); L.append('|---|---|---|---:|---|---|')
        for e in es:
            donde = '<br>'.join('`%s`' % p for p in e['donde_esta'][:3]) + (' …' if len(e['donde_esta']) > 3 else '')
            nota = e['por_que'] or e['verificacion']
            L.append('| `%s` | %s | %s | %s | %s | %s |' % (e['id'], SYM[e['estado']], e['ultima_fecha'] or '', e.get('creditos') or '', donde, esc(nota)))
        L.append('')
    L.append('## NO REPETIR (rechazados y su motivo)\n')
    for e in [e for e in E if e['estado'] == 'rechazado']:
        L.append('- ✘ **`%s`** (%s, %s, %s cr): %s%s' % (e['id'], e['categoria'], e['ultima_fecha'] or 's/f', e.get('creditos') or 0, e['por_que'], (' **Siguiente:** ' + e['siguiente_paso']) if e['siguiente_paso'] else ''))
    L.append('\nTambién medido (sin entrada propia): Runway ignora la pose pedida y cobra los `BAD_OUTPUT` (~8 cr c/u); los prompts largos con anatomía rara fallan sin `@pose`; un prompt con texto genera texto dentro de la imagen; los ciclos de caminata salen con cuadros casi idénticos. Un fallo seguido de otro igual = parar.\n')
    sv = [e for e in E if e['estado'] == 'sin_verificar' or 'sin_verificar' in (e['verificacion'] or '') or 'sin_verificar' in (e['por_que'] or '')]
    if sv:
        L.append('## Sin verificar (lo que NO se pudo comprobar)\n')
        for e in sv: L.append('- ? `%s`: %s' % (e['id'], esc(e['verificacion'] if 'sin_verificar' in (e['verificacion'] or '') else e['por_que'])))
        L.append('')
    L.append('## PRÓXIMOS TRABAJOS (ordenados por valor/costo; solo donde Runway ya funcionó)\n')
    L.append('Excluido a propósito: `campeon_cuerpo` por imágenes sueltas y animación de campeones/enemigos con hojas o video (medido: 0 aprobados). Valor 1-5; costo en créditos a 8 por imagen (reservar un 2.º intento si dice «reserva»).\n')
    P = [e for e in E if e['estado'] == 'pendiente' and 'costo_estimado' in e]
    P.sort(key=lambda e: -(e.get('valor', 0) / max(e['costo_estimado'], 4)))
    L.append('| # | id | categoría | valor | costo (cr) | por qué falta de verdad | siguiente paso |'); L.append('|---:|---|---|---:|---:|---|---|')
    for i, e in enumerate(P, 1): L.append('| %d | `%s` | %s | %s | %s | %s | %s |' % (i, e['id'], e['categoria'], e['valor'], e['costo_estimado'], esc(e['por_que']), esc(e['siguiente_paso'])))
    L.append('\n**Costo total de la lista: %d cr** (%d imágenes a 8 cr; sin reintentos).\n' % (sum(e['costo_estimado'] for e in P), sum(e['costo_estimado'] for e in P) // 8))
    return '\n'.join(L) + '\n'
def load():
    st = json.load(open(J, encoding='utf-8')); ids = [e['id'] for e in st['entradas']]
    assert len(ids) == len(set(ids)), 'ids duplicados en estado-runway.json'
    for e in st['entradas']:
        assert e['estado'] in ESTADOS and e['categoria'] in CATS, 'estado o categoría inválidos en ' + e['id']
        assert all(k in e for k in CAMPOS), 'faltan campos en ' + e['id']
    return st
def save(st): json.dump(st, open(J, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def main():
    a = sys.argv[1:]; st = load(); hoy = datetime.date.today().isoformat()
    if a[:1] == ['set']:
        assert len(a) >= 3 and a[2] in ESTADOS, 'uso: set <id> <estado> ["nota"]; estados: ' + ', '.join(ESTADOS)
        e = next((x for x in st['entradas'] if x['id'] == a[1]), None); assert e, 'id desconocido: ' + a[1]
        e['estado'] = a[2]; e['ultima_fecha'] = hoy
        if len(a) > 3: e['por_que'] = (e['por_que'] + ' [' + hoy + '] ' + a[3]).strip()
        save(st)
    elif a[:1] == ['add']:
        assert len(a) >= 5 and a[2] in CATS and a[3] in ESTADOS, 'uso: add <id> <categoria> <estado> "descripcion" [clave=valor ...]; categorías: ' + ', '.join(CATS)
        assert all(x['id'] != a[1] for x in st['entradas']), 'ya existe ' + a[1]
        e = dict(id=a[1], categoria=a[2], descripcion=a[4], estado=a[3], ultima_fecha=hoy, task_ids=[], creditos=0, donde_esta=[], por_que='', siguiente_paso='', verificacion='')
        for kv in a[5:]:
            k, v = kv.split('=', 1); k = {'fecha': 'ultima_fecha'}.get(k, k)
            assert k in CAMPOS + ['valor', 'costo_estimado'], 'clave inválida ' + k
            e[k] = [x for x in v.split(',') if x] if k in ('task_ids', 'donde_esta') else int(v) if k in ('creditos', 'valor', 'costo_estimado') else v
        for p in e['donde_esta']: assert os.path.exists(os.path.join(ROOT, p)), 'no existe ' + p
        if e['estado'] == 'pendiente' and 'costo_estimado' not in e: print('aviso: un pendiente sin costo_estimado no aparece en PRÓXIMOS TRABAJOS')
        st['entradas'].append(e); save(st)
    out = render(st)
    if a == ['--check']:
        ok = os.path.exists(M) and open(M, encoding='utf-8').read() == out
        print('registro Runway sincronizado (%d entradas)' % len(st['entradas']) if ok else 'REGISTRO RUNWAY DESINCRONIZADO: correr python3 tools/art/runway-ledger.py'); sys.exit(0 if ok else 1)
    open(M, 'w', encoding='utf-8').write(out); print('escrito', os.path.relpath(M, ROOT))
if __name__ == '__main__':
    try: main()
    except AssertionError as ex: print('ERROR:', ex); sys.exit(2)
