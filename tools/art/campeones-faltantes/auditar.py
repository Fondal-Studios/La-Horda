#!/usr/bin/env python3
"""LA HORDA - auditoria de assets de campeones (solo lectura sobre assets/ y js/; escribe SOLO en docs/art-brief/).

Lee docs/art-brief/manifiestos/atlas_catalogo.json (lo escribe volcar.js desde el juego real), mide los atlas PNG/WebP del repo
(cuadros repetidos, siluetas partidas, IoU skin-vs-base) y genera:
  docs/art-brief/manifiestos/campeones_faltantes.json   (legible por maquina)
  docs/art-brief/ASSETS_FALTANTES_CAMPEONES.md          (para el pintor)
Uso (desde la raiz del repo):  node tools/art/campeones-faltantes/volcar.js && python3 tools/art/campeones-faltantes/auditar.py
Requiere Pillow, numpy, scipy. No inventa nada: cada fila cita la medicion o el archivo que la origina.
"""
import json, hashlib, re, sys, datetime
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[3]
MANI = ROOT / 'docs/art-brief/manifiestos'
CAT = json.loads((MANI / 'atlas_catalogo.json').read_text(encoding='utf8'))
PACKS, CL = CAT['packs'], CAT['clases']
ENTREGA = 'art-source/entregas/2026-10_campeones-faltantes'
CANON_FMT = 'PNG RGBA 448x1008 (4 col x 9 filas, celda 112x112), alfa 0/255, pies fila 106, perfil a la derecha, reposo 62-72 px'
MOTOR_A = set('aelith aurelia axiom baltra brakk brasa bront cazadora dariel eslabon facu_gm farolero guerrero ilkan iria khepri libertador mago maura morveth morwen musashi'.split())
FILAS = {1: 'caminar abajo', 2: 'caminar perfil', 3: 'caminar arriba', 4: 'ataque abajo', 5: 'ataque perfil', 6: 'ataque arriba', 7: 'lanzar', 8: 'definitiva', 9: 'muerte'}
USO = {
    1: 'Animación de caminar cuando el campeon se mueve hacia la cámara (walk_down).',
    2: 'Animación de caminar de costado (walk_side; la izquierda se espeja).',
    3: 'Animación de caminar de espaldas (walk_up).',
    4: 'Ataque básico mirando hacia abajo/cámara (attack_down); también es el cuadro de "golpe recibido" (cuadro 12).',
    5: 'Ataque básico de perfil (attack_side); cuadro 16 = golpe recibido de perfil.',
    6: 'Ataque básico mirando hacia arriba (attack_up); cuadro 20 = golpe recibido de espaldas.',
    7: 'Pose de lanzar: se usa para las 3 habilidades y las 3 direcciones (cast_*), ~420 ms.',
    8: 'Pose de la definitiva (ultimate_*), ~650 ms; el motor solo la usa si el kit marca portCastState="ultimate".',
    9: 'Muerte de 4 cuadros que termina tendido (170 ms por cuadro) y queda al 55 % de alfa.',
}
PRIO_TXT = {'P0': 'bloquea jugar bien', 'P1': 'se nota', 'P2': 'pulido'}
N8 = np.ones((3, 3), bool)
_cache = {}


def analizar(key):
    """Metricas por cuadro usado: hash de silueta, componentes conexas >= 12 px, vacio."""
    if key in _cache:
        return _cache[key]
    p = PACKS[key]
    if not p.get('src') or p['src'].startswith('data:'):
        _cache[key] = None
        return None
    A = np.array(Image.open(ROOT / p['src']).convert('RGBA'))
    fw, fh, cols = p['fw'], p['fh'], p['cols']
    usados = sorted({(v if v >= 0 else ~v) for arr in p['sets_crudos'].values() for v in arr})
    out = {}
    for i in usados:
        cx, cy = (i % cols) * fw, (i // cols) * fh
        c = A[cy:cy + fh, cx:cx + fw]
        op = c[..., 3] > 127
        if c.shape[0] < fh or c.shape[1] < fw or not op.any():
            out[i] = {'blank': True, 'comp': 0, 'hash': 'blank'}
            continue
        lab, n = ndimage.label(op, structure=N8)
        sizes = ndimage.sum(op, lab, range(1, n + 1))
        out[i] = {'blank': False, 'comp': int((sizes >= 12).sum()),
                  'hash': hashlib.md5(np.packbits(op).tobytes() + c[..., :3][op].tobytes()).hexdigest()[:10]}
    _cache[key] = out
    return out


def hs(key, name):
    p, a = PACKS[key], analizar(key)
    arr = p['sets_crudos'].get(name)
    if not arr or not a:
        return None
    return tuple(a[(v if v >= 0 else ~v)]['hash'] for v in arr)


def tiene(p, base, d):
    s = p['sets_crudos']
    return (f'{base}_{d}' in s) or (d == 'side' and f'{base}_left' in s)


def es_canon(p):
    return p and p['fw'] == 112 and p['fh'] == 112 and p['cols'] == 4 and p['nw'] == 448 and p['nh'] == 1008


def iou_con_base(skin_key, base_key):
    a, b = PACKS[skin_key], PACKS[base_key]
    if not a.get('src') or not b.get('src') or a['src'].startswith('data:') or b['src'].startswith('data:'):
        return None
    if (a['nw'], a['nh'], a['fw'], a['fh']) != (b['nw'], b['nh'], b['fw'], b['fh']):
        return None
    X = np.array(Image.open(ROOT / a['src']).convert('RGBA'))
    Y = np.array(Image.open(ROOT / b['src']).convert('RGBA'))
    xa, ya = X[..., 3] > 127, Y[..., 3] > 127
    m = xa & ya
    cd = float(np.abs(X[..., :3].astype(int) - Y[..., :3].astype(int)).sum(-1)[m].mean()) if m.any() else 0.0
    return round(float((xa & ya).sum() / (xa | ya).sum()), 3), round(cd, 1)


# ---------------------------------------------------------------- referencias de otros campeones
CANON_BASE = [k for k in CL if k in PACKS and es_canon(PACKS[k])]


def fila_ok(k, f):
    """Fila canonica f de la base k: 4 cuadros no vacios, >= 3 distintos y (salvo muerte) una sola silueta."""
    a = analizar(k)
    idx = list(range((f - 1) * 4, (f - 1) * 4 + 4))
    if not a or any(i not in a for i in idx):
        # cuadros no usados por ningún set (p. ej. varios) -> medir directo
        return False
    hh = {a[i]['hash'] for i in idx}
    return all(not a[i]['blank'] for i in idx) and len(hh) >= 3 and (f == 9 or all(a[i]['comp'] == 1 for i in idx))


def elegir_ref(champ, filas, excluir=()):
    rol, rg = CL[champ]['rol'], CL[champ]['ranged']
    mejor = None
    for k in CANON_BASE:
        if k == champ or k in excluir:
            continue
        sc = sum(10 for f in filas if fila_ok(k, f))
        if sc == 0:
            continue
        sc += 6 if CL[k]['rol'] == rol else 0
        sc += 2 if CL[k]['ranged'] == rg else 0
        sc += 2 if abs((PACKS[k]['refH'] or 70) - 70) <= 3 else 0
        if mejor is None or sc > mejor[0]:
            mejor = (sc, k)
    if not mejor:
        return None
    k = mejor[1]
    return {'campeon': k, 'pack': k, 'archivo': PACKS[k]['src'], 'filas': list(filas),
            'motivo': f'{CL[k]["rol"]}, {"a distancia" if CL[k]["ranged"] else "cuerpo a cuerpo"}, reposo {PACKS[k]["refH"]} px; filas {",".join(map(str, filas))} sin cuadros repetidos ni siluetas partidas'}


def elegir_ref_skin(champ):
    """Skin canonica con silueta propia (IoU bajo contra su base): ejemplo de rediseño real."""
    cand = []
    for sk, p in PACKS.items():
        if not es_canon(p) or sk in CL or sk.startswith('croma_') is False and not sk.startswith(('skin_', )) and not sk.endswith(('_set', '_alt1', '_alt2')):
            continue
        base = next((c for c in sorted(CL, key=len, reverse=True) if sk == c + '_set' or sk.startswith('skin_quality_' + c) or sk.endswith('_' + c) or sk.startswith('croma_' + c + '_')), None)
        if not base or base == champ:
            continue
        r = iou_con_base(sk, base)
        if r and r[0] < 0.70:
            cand.append((0 if CL[base]['rol'] == CL[champ]['rol'] else 1, r[0], sk, base))
    if not cand:
        return None
    cand.sort()
    _, iou, sk, base = cand[0]
    return {'campeon': base, 'pack': sk, 'archivo': PACKS[sk]['src'], 'filas': [2, 5, 7, 9],
            'motivo': f'skin con silueta propia (IoU {iou} contra su base {base}): ejemplo de rediseño real, no de recolor'}


# ---------------------------------------------------------------- cuerpo base
def cuerpo_filas(c):
    """[(fila, clave, estado, prio, evidencia)] según lo que el motor encuentra de forma nativa."""
    out = []
    uso_ult = c in CAT['grupos']['portadores']
    if c in ('tanque', 'guerrero'):
        cl = CAT['dir_atlas'][c]
        ev = f'clips nativos: {", ".join(cl)} (js/rendering/champion-sprites.js:107-114; sin cast, golpe ni muerte)'
        out += [(7, 'lanzar', 'FALTA', 'P1', ev + '; hoy lanzar usa el ataque'), (9, 'muerte', 'FALTA', 'P0', ev + '; hoy cae a un sprite procedural/rotado'),
                (4, 'golpe', 'FALTA', 'P1', ev + '; hoy el golpe recibido usa el reposo')]
        return out
    if c == 'mago':
        cl = CAT['anim_atlas']['mago']
        ev = f'clips nativos: {", ".join(f"{k}({v})" for k, v in cl.items())}; una sola vista 3/4 para todas las direcciones (assets/sprites/champions/mago/atlas.png)'
        out += [(1, 'caminar_abajo', 'FALTA', 'P1', ev), (3, 'caminar_arriba', 'FALTA', 'P1', ev), (4, 'ataque_abajo', 'FALTA', 'P1', ev + '; no hay clip de ataque propio'),
                (5, 'ataque_perfil', 'FALTA', 'P1', ev), (6, 'ataque_arriba', 'FALTA', 'P1', ev)]
        return out
    p = PACKS.get(c)
    if not p or es_canon(p) and p['rows'] if False else False:
        return out
    if es_canon(p) or (p['fw'] == 96 and p['cols'] == 6):
        base_ok = True
    S = p['sets_crudos']
    src = p['src']
    ev0 = f'{src} ({p["nw"]}x{p["nh"]}, celda {p["fw"]}x{p["fh"]})'
    # caminar
    for f, d in ((1, 'down'), (2, 'side'), (3, 'up')):
        if not tiene(p, 'walk', d):
            out.append((f, 'caminar_' + {'down': 'abajo', 'side': 'perfil', 'up': 'arriba'}[d], 'FALTA', 'P0', f'sin set walk_{d} en {ev0}'))
    # ataque
    for f, d in ((4, 'down'), (5, 'side'), (6, 'up')):
        if not tiene(p, 'attack', d):
            out.append((f, 'ataque_' + {'down': 'abajo', 'side': 'perfil', 'up': 'arriba'}[d], 'FALTA', 'P1' if tiene(p, 'attack', 'side') else 'P0',
                        f'sin set attack_{d} en {ev0}; el motor cae a la pose de perfil'))
    # lanzar
    cast_any = [n for n in S if n.startswith('cast_')]
    if not cast_any:
        out.append((7, 'lanzar', 'FALTA', 'P1', f'sin set cast_* en {ev0}; lanzar usa el ataque'))
    else:
        iguales = all(hs(c, n) == hs(c, n.replace('cast', 'attack')) for n in cast_any if n.replace('cast', 'attack') in S)
        if iguales and any(n.replace('cast', 'attack') in S for n in cast_any):
            out.append((7, 'lanzar', 'PLACEHOLDER', 'P1', f'cast_* usa exactamente los mismos cuadros que attack_* ({", ".join(f"{n}={S[n]}" for n in cast_any[:1])}) en {ev0}'))
    # definitiva (solo si el kit la usa)
    if uso_ult:
        ult = [n for n in S if n.startswith('ultimate_')]
        if not ult:
            out.append((8, 'definitiva', 'FALTA', 'P1', f'sin set ultimate_* en {ev0}; el kit marca portCastState="ultimate"'))
        else:
            h_u, h_c = hs(c, ult[0]), hs(c, ult[0].replace('ultimate', 'cast'))
            h_a = hs(c, ult[0].replace('ultimate', 'attack'))
            if h_u and (h_u == h_c or h_u == h_a or set(h_u) <= set(h_c or ()) | set(h_a or ())):
                out.append((8, 'definitiva', 'PLACEHOLDER', 'P1', f'ultimate_* {S[ult[0]]} reutiliza exactamente dibujos de lanzar/ataque en {ev0}'))
            elif h_u and len(set(h_u)) < 4:
                out.append((8, 'definitiva', 'REVISAR', 'P2', f'ultimate_* tiene solo {len(set(h_u))} poses distintas ({S[ult[0]]}); la hoja canonica pide 4 cuadros en {ev0}'))
    # golpe
    hit = [n for n in S if n.startswith('hit_')]
    if not hit:
        out.append((4, 'golpe', 'FALTA', 'P1', f'sin set hit_* en {ev0}; el golpe recibido cae al reposo'))
    else:
        idle = {h for n in S if n.startswith('idle_') for h in (hs(c, n) or ())}
        hh = hs(c, hit[0]) or ()
        if hh and all(x in idle for x in hh):
            out.append((4, 'golpe', 'PLACEHOLDER', 'P1', f'hit_* ({S[hit[0]]}) es el mismo dibujo que el reposo en {ev0}'))
    # muerte
    dth = [n for n in S if n.startswith('death_')]
    if not dth:
        out.append((9, 'muerte', 'FALTA', 'P0', f'sin set death_* en {ev0}; cae a un sprite procedural/rotado'))
    else:
        hd = hs(c, dth[0]) or ()
        ha = set(hs(c, 'attack_down') or hs(c, 'attack_side') or ())
        if len(set(hd)) < 3 or (hd and all(x in ha for x in hd)):
            out.append((9, 'muerte', 'PLACEHOLDER', 'P0', f'death_* = {S[dth[0]]}: un solo cuadro, el mismo del ataque, en {ev0}'))
    return out


def calidad(c):
    """Defectos medidos en una hoja canonica: cuadros repetidos y siluetas partidas (P2)."""
    p = PACKS.get(c)
    if not p or not es_canon(p):
        return [], []
    a, S = analizar(c), p['sets_crudos']
    dup = []
    for n, arr in S.items():
        if n.startswith(('hit', 'idle')) or len(arr) < 4:
            continue
        h = [a[v if v >= 0 else ~v]['hash'] for v in arr]
        if len(set(h)) < len(h):
            dup.append(f'{n}: {len(set(h))} dibujos distintos en {len(arr)} cuadros {arr}')
    frag = sorted({i for i, m in a.items() if m['comp'] > 1})
    return dup, frag


# ---------------------------------------------------------------- construccion
def main():
    activos, campeones, problemas = [], {}, []
    ids = list(CL)
    asc = CAT['ascension_skins']
    prtd = set(CAT['grupos']['portadores'])
    # skins registradas por campeon
    skins_reg, skins_det = {}, {}
    for c in ids:
        regs = []
        for sid in CL[c]['skins_codex']:
            s = CAT['set_skins'].get(sid)
            regs.append(('set', sid, s['nombre'] if s else sid, 'Set'))
        for cid in CL[c]['cromas_ids']:
            m = CAT['cromas'].get(cid)
            if m:
                regs.append((m['tipo'] or 'croma', cid, m['nombre'], m['rareza']))
        skins_det[c] = regs
        skins_reg[c] = sum(1 for r in regs if r[0] in ('set', 'skin'))
    # IoU de cada skin autorada contra su base
    iou = {}
    for k in PACKS:
        for c in sorted(ids, key=len, reverse=True):
            if k != c and (k == c + '_set' or k.endswith('_alt1') and k.startswith(c + '_') or k.endswith('_alt2') and k.startswith(c + '_') or k.startswith('skin_quality_' + c) or k.startswith('croma_' + c + '_alt1') or k == 'croma_' + c + '_skin'):
                r = iou_con_base(k, c)
                if r:
                    iou[k] = {'base': c, 'iou': r[0], 'color': r[1]}
                break

    def nuevo(c, tipo, clave, asset, uso, prio, estado, celda, formato, archivo, final, ev, ref=None, extra=None):
        a = {'id': f'{c}.{tipo}.{clave}', 'campeon': c, 'tipo': tipo, 'asset': asset, 'uso': uso, 'prioridad': prio, 'estado': estado,
             'celda': celda, 'formato': formato, 'archivo_destino': archivo, 'ruta_final_integracion': final, 'evidencia': ev, 'referencia': ref}
        if extra:
            a.update(extra)
        activos.append(a)

    for c in ids:
        cl = CL[c]
        p = PACKS.get(c)
        fam = ('Canon 112 px (448x1008)' if es_canon(p) else
               'Portador 96 px (576x864, 6 col x 9 filas)' if p and p['fw'] == 96 and p['cols'] == 6 else
               'Atlas heredado' if p else 'Hoja heredada (DIR_ATLASES / anim atlas)')
        campeones[c] = {'nombre': cl['nombre'], 'rol': cl['rol'], 'categoria': cl['categoria'], 'ataque': 'distancia' if cl['ranged'] else 'cuerpo a cuerpo',
                        'pack_base': c if p else None, 'atlas_actual': p['src'] if p else f'assets/sprites/champions/{c}/atlas.png',
                        'celda_actual': [p['fw'], p['fh']] if p else None, 'familia_atlas': fam, 'usa_pose_definitiva': c in prtd,
                        'motor_fx': 'A (skill-fx-a)' if c in MOTOR_A else 'B (vfx-b)', 'habilidades': cl['habilidades'], 'definitiva': cl['definitiva']}
        # ---- cuerpo
        filas = cuerpo_filas(c)
        # por fila canonica: una entrada
        vistas = set()
        for f, clave, est, pr, ev in filas:
            if (f, clave) in vistas:
                continue
            vistas.add((f, clave))
            filas_ref = [f] if f != 4 or clave != 'golpe' else [4]
            ref = elegir_ref(c, filas_ref)
            cu = list(range((f - 1) * 4, (f - 1) * 4 + 4))
            nom = {'golpe': 'golpe recibido (primer cuadro de la fila de ataque abajo)'}.get(clave, FILAS[f])
            nuevo(c, 'cuerpo', clave, f'Fila {f} del atlas: {nom} (cuadros {cu[0]}-{cu[-1]})', USO[f] if clave != 'golpe' else 'Golpe recibido: 1 cuadro durante 160 ms (hit_*). Debe verse como un impacto (retroceso), no como el reposo.',
                  pr, est, '112x112 (4 cuadros)', CANON_FMT, f'{ENTREGA}/campeones/{c}/hoja_36poses.png',
                  f'assets/sprites/champions/{c}/atlas.png (o v2/atlas.png; lo fija Claude al integrar)', ev, ref,
                  {'fila': f, 'cuadros': cu, 'entregar_hoja_completa': True})
        dup, frag = calidad(c)
        if dup:
            nuevo(c, 'calidad', 'cuadros_repetidos', 'Corregir cuadros repetidos en animaciones de 4 cuadros', 'El ciclo se ve con tirones: dos cuadros del ciclo son idénticos.', 'P2', 'REVISAR',
                  '112x112', CANON_FMT, f'{ENTREGA}/campeones/{c}/hoja_36poses.png', f'assets/sprites/champions/{c}/atlas.png', '; '.join(dup) + f' ({p["src"]})', elegir_ref(c, [1, 2]))
        if len(frag) >= 1:
            nuevo(c, 'calidad', 'siluetas_partidas', f'Revisar {len(frag)} cuadros con silueta partida (> 1 pieza de >= 12 px)', 'La especificación exige una sola silueta conectada por pose; el importador cuenta componentes y rechazaría la hoja (expected 36 separated silhouettes). Puede ser intencional (chispas, halo): decidir caso por caso.', 'P2', 'REVISAR',
                  '112x112', CANON_FMT, f'{ENTREGA}/campeones/{c}/hoja_36poses.png', f'assets/sprites/champions/{c}/atlas.png',
                  f'cuadros con > 1 componente: {frag} en {p["src"]}', elegir_ref(c, [1, 4, 5]))
        if c == 'ilkan':
            nuevo(c, 'calidad', 'repintado_manual', 'Repintado manual del atlas procedural (revisión humana pendiente)', 'Todo el arte de Ilkan se generó por código (tools/art/ilkan/build.py); docs/ILKAN_REWORK.md "Pendientes" pide repintado manual antes de publicar. Atlas fuera de formato canonico (128x111, 8 col).',
                  'P1', 'REVISAR', '128x111 (atlas actual) o canon 112x112 si el dueño decide migrar', CANON_FMT, f'{ENTREGA}/campeones/ilkan/hoja_36poses.png', 'assets/sprites/champions/ilkan/v2/atlas.png',
                  'docs/ILKAN_REWORK.md secciones "Arte" y "Pendientes"; assets/sprites/champions/ilkan/v2/atlas.webp 1024x888', elegir_ref(c, [2, 5, 7, 9]), {'decide_dueno': True})
        # ---- skins
        reales = 0
        for sid, inf in iou.items():
            pass
        for alt in asc.get(c, []):
            r = iou.get(alt['pack'])
            if r and (r['iou'] >= 0.90):
                nuevo(c, 'skin', alt['id'], f'Rediseño de la skin "{alt["nombre"]}" ({alt["id"]}): hoy es un recolor del cuerpo base', 'Una skin cambia ropa/armadura/accesorios/silueta; una paleta distinta es un croma (Art Bible, AGENTS.md punto 6). Estado en el juego: GENERATED_PENDING_REVIEW y sin registrar en el Códice.',
                      'P1', 'RECOLOR', '112x112 (hoja completa de 36 poses)', CANON_FMT, f'{ENTREGA}/skins/{alt["id"]}/hoja_36poses.png', f'assets/sprites/champions/{c}/skins/{alt["id"]}/atlas.png',
                      f'IoU de silueta {r["iou"]} y diferencia media de color {r["color"]} contra la base ({PACKS[alt["pack"]]["src"]}); concepto pedido: "{alt["tema"]}"', elegir_ref_skin(c), {'concepto': alt['tema']})
            else:
                reales += 1
        reales_total = skins_reg[c] + reales
        falta_n = max(0, 2 - reales_total - sum(1 for alt in asc.get(c, []) if (iou.get(alt['pack']) or {}).get('iou', 0) >= 0.90))
        for i in range(falta_n):
            nuevo(c, 'skin', f'nueva_{i + 1}', f'Skin nueva #{i + 1} (concepto a definir con el dueño): el campeón tiene {reales_total} skins de diseño propio y el objetivo es 2',
                  'Objetivo "50 campeones con dos skins cada uno" (docs/production/roster-repair/README.md). Una skin es cosmética: no altera estadísticas.', 'P2', 'FALTA', '112x112 (hoja completa de 36 poses)', CANON_FMT,
                  f'{ENTREGA}/skins/{c}_skin_nueva_{i + 1}/hoja_36poses.png', f'assets/sprites/champions/{c}/skins/<id>/atlas.png (el id lo fija Claude)',
                  f'registradas: {[r[1] for r in skins_det[c]]}; alts pendientes: {[a["id"] for a in asc.get(c, [])]}', elegir_ref_skin(c), {'concepto': 'A DEFINIR POR EL DUEÑO'})
        campeones[c]['skins_registradas'] = [{'tipo': r[0], 'id': r[1], 'nombre': r[2]} for r in skins_det[c]]
        campeones[c]['skins_pendientes_ascension'] = [{'id': a['id'], 'nombre': a['nombre'], 'iou_vs_base': (iou.get(a['pack']) or {}).get('iou')} for a in asc.get(c, [])]
        # ---- transversales (bloqueados por falta de hook): FX e iconos
        nuevo(c, 'fx', 'habilidades', f'FX pintados de las habilidades ({", ".join(cl["habilidades"] + [cl["definitiva"] or ""])}) - motor {"A" if c in MOTOR_A else "B"}',
              'Hoy 100 % procedural; ningún PNG pintado puede reemplazarlos hasta construir H1/H2 (00_ESPECIFICACION_TECNICA.md 2.2.7 y 8).', 'P2', 'BLOQUEADO_SIN_HOOK', 'según tira (ver spec 2.2.2/2.2.4)',
              'PNG RGBA alfa 0/255, tira horizontal; ver 00_ESPECIFICACION_TECNICA.md 2.2', f'{ENTREGA}/fx/{c}/<habilidad>_<arte>_<S>x<n>f.png', 'js/assets/painted-fx-meta.js (a construir, H1)',
              'docs/vfx/HABILIDADES_VFX_MITAD_A.md' if c in MOTOR_A else 'docs/vfx/vfx-audit-b.md',
              {'campeon': 'aelith', 'pack': None, 'archivo': 'docs/art-brief/ejemplos/nova_time_80_PROCEDURAL_referencia.png', 'motivo': 'tira de nova horneada por el motor (referencia de formato y fases)'})
        nuevo(c, 'iconos', 'habilidades', f'5 iconos 16x16: básico, {", ".join(cl["habilidades"])}, {cl["definitiva"]}', 'HUD y panel de habilidades; hoy glifo procedural (js/ui/skill-pixel-glyphs.js).', 'P2', 'BLOQUEADO_SIN_HOOK', '16x16',
              'PNG RGBA 16x16, glifo en [1,14], 4-6 colores, alfa 0/255 (contrato del PR #119, aun no en main)', f'{ENTREGA}/iconos/{c}_basic.png, {c}_0.png, {c}_1.png, {c}_2.png, {c}_u.png',
              'assets/ui/skill-icons16/ (propuesta, H5)', 'js/ui/skill-pixel-glyphs.js (SKILL_PIXEL_MAP) y 00_ESPECIFICACION_TECNICA.md 2.6',
              {'campeon': None, 'pack': None, 'archivo': 'docs/art-brief/plantillas/icono_16x16_ampliado_x16_PLANTILLA.png', 'motivo': 'plantilla con marcos por categoria'})

    # ---- vesper_skin (croma con atlas de 32 poses: definitiva = lanzar)
    pv = PACKS.get('croma_vesper_skin')
    if pv and pv['nh'] == 896:
        nuevo('vesper', 'skin', 'croma_vesper_skin_definitiva', 'Fila 8 (definitiva) de la skin vesper_skin: el atlas mide 448x896 y la definitiva repite la fila de lanzar',
              'ultimate_* de esa skin apunta a los cuadros 24-27 (lanzar); la muerte esta en 28-31.', 'P1', 'PLACEHOLDER', '112x112 (4 cuadros)', CANON_FMT,
              f'{ENTREGA}/skins/vesper_skin/hoja_36poses.png', 'assets/sprites/champions/vesper/skins/vesper_skin/atlas.png', f'{pv["src"]} ({pv["nw"]}x{pv["nh"]}); sets ultimate_down={pv["sets_crudos"]["ultimate_down"]}, death_down={pv["sets_crudos"]["death_down"]}',
              elegir_ref('vesper', [8]))
    # ---- skins de campeones heredados con lagunas propias
    for sk in ('skin_sistema', 'skin_legion'):
        p = PACKS[sk]
        c = 'axiom' if sk == 'skin_sistema' else 'ilkan'
        if sk == 'skin_sistema' and not any(n.startswith('cast_') for n in p['sets_crudos']):
            nuevo(c, 'skin', 'sistema_lanzar', 'Skin "Sistema" (Axiom): pose de lanzar', 'El set skin_sistema no tiene cast_*: lanzar usa el ataque.', 'P1', 'FALTA', 'celda 69x64 (atlas actual) o canon 112x112', CANON_FMT,
                  f'{ENTREGA}/skins/sistema/hoja_36poses.png', 'assets/sprites/champions/axiom/skins/sistema/atlas.png', f'{p["src"]} sets: {sorted(p["sets_crudos"])}', elegir_ref(c, [7]))
        if sk == 'skin_legion' and not any(n.startswith('attack_down') for n in p['sets_crudos']):
            nuevo(c, 'skin', 'legion_ataque_abajo_arriba', 'Skin "Caravana de Medianoche" (Ilkan): ataque abajo y arriba', 'skin_legion solo trae attack_side; igual que el cuerpo base.', 'P1', 'FALTA', 'celda 128x111 (atlas actual) o canon 112x112', CANON_FMT,
                  f'{ENTREGA}/skins/legion/hoja_36poses.png', 'assets/sprites/champions/ilkan/skins/legion/atlas.png', f'{p["src"]} sets: {sorted(p["sets_crudos"])}', elegir_ref(c, [4, 6]))
    # ---- formas e invocaciones
    pc = PACKS['ilkan_colossus']
    nuevo('ilkan', 'forma', 'coloso_hit_muerte', 'Coloso de Arena (forma de la definitiva): golpe recibido y muerte/disolucion', 'El atlas del Coloso (colossus.webp 1184x544, celda 148x136) no tiene hit_* ni death_*; sets: ' + ', '.join(pc['sets_crudos']) + '. Hoy el golpe cae al reposo.', 'P1', 'FALTA',
          '148x136 (misma celda y 8 columnas del atlas actual)', 'PNG RGBA, alfa 0/255, misma grilla y pies que colossus.png', f'{ENTREGA}/formas/ilkan_coloso/atlas.png', 'assets/sprites/champions/ilkan/v2/colossus.png',
          f'{pc["src"]}; arte procedural pendiente de repintado humano (docs/ILKAN_REWORK.md)', {'campeon': 'nigromante', 'pack': None, 'archivo': 'assets/sprites/champions/nigromante/coloso/atlas.png', 'motivo': 'otra forma gigante (Encarnacion del Abismo, 12 poses de 448x384): referencia de escala y apoyo'})
    nuevo('ilkan', 'forma', 'coloso_idle_perfil_espalda', 'Coloso de Arena: reposo de perfil y de espalda', 'idle_down es el único reposo; de perfil/espalda se usa el de frente.', 'P2', 'FALTA', '148x136', 'igual que el atlas actual', f'{ENTREGA}/formas/ilkan_coloso/atlas.png',
          'assets/sprites/champions/ilkan/v2/colossus.png', f'{pc["src"]} idle_down={pc["sets_crudos"]["idle_down"]}', None)
    pm = PACKS['myla_berrinche']
    nuevo('myla', 'forma', 'berrinche_hit_muerte_def', 'Forma Berrinche de Myla: golpe recibido, muerte y definitiva', 'berrinche.png (384x288, 12 poses) no tiene hit_*, death_* ni ultimate_*.', 'P1', 'FALTA', '96x96 (atlas actual)', 'PNG RGBA 384x288 o hoja canonica', f'{ENTREGA}/formas/myla_berrinche/atlas.png',
          'assets/sprites/champions/myla/berrinche.png', f'{pm["src"]} sets: {", ".join(pm["sets_crudos"])}', elegir_ref('myla', [8, 9]) if False else None)
    nuevo('libertador', 'forma', 'caballo_hit_muerte', 'Libertador a caballo: golpe recibido y muerte montado', 'horse.png solo trae mount/charge/dismount/m_idle/m_atk/m_run.', 'P2', 'FALTA', '125x102 (atlas actual)', 'igual que el atlas actual', f'{ENTREGA}/formas/libertador_caballo/atlas.png',
          'assets/sprites/champions/libertador/v2/horse.png', f'{PACKS["libertador_horse"]["src"]} sets: {", ".join(PACKS["libertador_horse"]["sets_crudos"])}', None)
    nuevo('nigromante', 'forma', 'golem_fuego_hielo_ataque', 'Gólem de fuego y de hielo: ataque de más de 1 cuadro', 'En js/assets/nigro-golems-meta.js los gólems de fuego y hielo tienen atk=[4] (1 cuadro) y el de piedra atk=[12,13]; la muerte de piedra es su aparicion al reves (death=[16,15,14]).', 'P2', 'REVISAR', 'celdas del atlas actual (assets/sprites/champions/nigromante/golems/<elemento>/atlas.png)', 'igual que el atlas actual',
          f'{ENTREGA}/formas/nigromante_golem/<elemento>/atlas.png', 'assets/sprites/champions/nigromante/golems/<elemento>/atlas.png', 'js/assets/nigro-golems-meta.js; docs/ART_REPLACEMENT_QUEUE.md lista el gólem como pendiente (puede estar desactualizada)', None)
    nuevo('nigromante', 'forma', 'coloso_cast_hit_muerte', 'Encarnacion del Abismo (coloso de carne cosida): lanzar, golpe y muerte', 'coloso/atlas.png (1792x1152, celdas 448x384, 4 col x 3 filas) trae reposo, 2 pasos y 1 ataque por vista; no hay lanzar, golpe ni muerte (js/rendering/champion-sprites.js:491-503).', 'P2', 'FALTA',
          '448x384', 'igual que el atlas actual', f'{ENTREGA}/formas/nigromante_coloso/atlas.png', 'assets/sprites/champions/nigromante/coloso/atlas.png', 'docs/production/nigromante-coloso/README.md (Visual Gate PASS para lo existente)', None)
    nuevo('cazadora', 'forma', 'lobo_ciclo', 'Lobo espectral de la Cazadora: ciclo de carrera y mordida', 'El lobo son 4 imagenes sueltas (idle 90x43, run 79x58, bite 120x63, jump 112x61): la carrera es 1 solo cuadro.', 'P2', 'FALTA', 'libre (hoy imagenes sueltas)', 'PNG RGBA, alfa 0/255, pies alineados',
          f'{ENTREGA}/formas/cazadora_lobo/run_01..04.png', 'assets/sprites/champions/cazadora/wolf/', 'assets/sprites/champions/cazadora/wolf/*.png; docs LA_HORDA_ASSETS_FALTANTES.md ("Lobo Espectral: carrera 4")', None)
    # refs faltantes (None) -> buscar una por defecto para formas
    NIGRO = {'fw': 448, 'fh': 384, 'cols': 4, 'anchor': 0.979, 'escala': 0.5, 'tomas': [
        {'etiqueta': 'fila 1 · frente · cuadros 0-3 (reposo, paso, paso, ataque)', 'cuadros': [0, 1, 2, 3]},
        {'etiqueta': 'fila 2 · perfil · cuadros 4-7', 'cuadros': [4, 5, 6, 7]},
        {'etiqueta': 'fila 3 · espalda · cuadros 8-11', 'cuadros': [8, 9, 10, 11]}]}
    for a in activos:
        if a['tipo'] == 'forma' and not a['referencia']:
            a['referencia'] = {'campeon': 'nigromante', 'pack': None, 'archivo': 'assets/sprites/champions/nigromante/coloso/atlas.png', 'motivo': 'ejemplo de forma gigante con 3 vistas'}
        r = a['referencia']
        if a['tipo'] == 'forma' and r and not r.get('pack') and r.get('archivo', '').endswith('nigromante/coloso/atlas.png'):
            r['grilla'] = NIGRO
            r['motivo'] = 'otra forma gigante (Encarnacion del Abismo, 12 poses de 448x384): referencia de escala, apoyo y vistas'
    # Myla berrinche: referencia = su propio cuerpo canonico (pose de muerte de otra mago)
    for a in activos:
        if a['id'] == 'myla.forma.berrinche_hit_muerte_def':
            a['referencia'] = elegir_ref('myla', [9]) or a['referencia']
        if a['id'] == 'myla.forma.berrinche_hit_muerte_def' and a['referencia']:
            pass

    # ------------------------------------------------------------ salida JSON
    cuentas = {}
    for a in activos:
        cuentas.setdefault(a['prioridad'], {}).setdefault(a['tipo'], 0)
        cuentas[a['prioridad']][a['tipo']] += 1
    por_prio = {k: sum(v.values()) for k, v in sorted(cuentas.items())}
    salida = {'schema': 1, 'generado': datetime.date.today().isoformat(), 'base_repo': 'claude/spec-arte-tecnica (PR #124) sobre main',
              'entrega_dir': ENTREGA, 'prioridades': PRIO_TXT, 'conteo_por_prioridad': por_prio, 'conteo_por_prioridad_y_tipo': cuentas,
              'campeones': campeones, 'assets': activos,
              'estados': {'FALTA': 'no existe en el atlas (el motor cae a otra pose)', 'PLACEHOLDER': 'existe pero reutiliza el dibujo de otro estado', 'RECOLOR': 'skin que solo cambia la paleta',
                          'REVISAR': 'defecto medido que requiere decisión humana', 'BLOQUEADO_SIN_HOOK': 'el juego aun no puede cargar ese arte (espec. seccion 8)'}}
    (MANI / 'campeones_faltantes.json').write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding='utf8')
    (MANI / '_iou_skins.json').write_text(json.dumps(iou, indent=1), encoding='utf8')
    print('assets:', len(activos), por_prio)
    for pr, d in sorted(cuentas.items()):
        print(pr, d)


if __name__ == '__main__':
    main()
