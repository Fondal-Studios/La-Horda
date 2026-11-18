#!/usr/bin/env python3
"""Siembra (UNA vez, o con --merge) docs/art-brief/prioridad-assets.json a partir de las fuentes reales del repo.
Después el JSON es la fuente de verdad del checklist de prioridad: se edita con `tools/art/prioridad-assets.py --set <id> <estado>`
(o a mano para reordenar / reclasificar) y el .md se regenera. Este script solo existe para reproducir la clasificación inicial y para
incorporar bloques nuevos (`--merge` conserva prioridad/orden/estado/nota de los ítems que ya existen y solo agrega los que faltan).
Fuentes: docs/production/asset-blocks.json, docs/art/ATLAS_ARTE.json, docs/art-brief/enemy-coverage.json,
docs/art-brief/runway-pack/{estado-runway,estado-campeones}.json, docs/art-brief/CHECKLIST_ARTE.md (tabla B: lo medido en el motor).
Uso: python3 tools/art/prioridad-seed.py [--merge|--force] [--stdout]"""
import json, os, re, sys, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
P = lambda *a: os.path.join(ROOT, *a)
OUT = P('docs/art-brief/prioridad-assets.json')
def load(*p):
    with open(P(*p), encoding='utf-8') as f: return json.load(f)

BLK = load('docs/production/asset-blocks.json')
ATLAS = load('docs/art/ATLAS_ARTE.json')
COV = load('docs/art-brief/enemy-coverage.json')
RW = load('docs/art-brief/runway-pack/estado-runway.json')
EC = load('docs/art-brief/runway-pack/estado-campeones.json')
CHK = open(P('docs/art-brief/CHECKLIST_ARTE.md'), encoding='utf-8').read()

ARENAS = ['ciudad', 'fortaleza', 'bosque', 'micelial', 'hielo', 'acuatica', 'laberinto', 'abismo', 'minas', 'infernal']  # ARENA_ORDER del motor
AIDX = {a: i + 1 for i, a in enumerate(ARENAS)}
STARTERS = ['tanque', 'mago', 'soporte', 'cazadora']            # js/ui/starter-select.js STARTER_RECOMMENDED
TOP5 = EC['_prioridad_5']                                         # tanque, guerrero, libertador, myla, ynara
CODIGO = {'nigromante', 'ilkan', 'libertador'}                    # CHECKLIST_ARTE §B: el hueco es de despacho de código (en curso)
RANKS = {'critico': 0, 'importante': 1, 'secundario': 2}
HOJA_GPT, IMG_GEN4, HOJA_ENEMIGO = 20, 8, 5

CAP = 'docs/art-brief/prioridad-capturas/'
items = {}; claimed = {}        # id -> item ; bloque -> item id (dueño)
def slug(s, n=34):
    s = re.sub(r'[^a-z0-9]+', '-', s.lower().replace('ñ', 'n').replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u').replace('ü', 'u')).strip('-')
    return s[:n].strip('-')
def add(id, cat, desc, prio, estado, metodo, costo, bloques=(), runway=(), docs=(), deps=(), evid='no medido', nota='', key=(9, 0), compartidos=(), dup_de=None):
    assert id not in items, id
    refs = {'bloques': list(bloques)}
    if compartidos: refs['bloques_compartidos'] = list(compartidos)
    if runway: refs['runway'] = list(runway)
    if docs: refs['docs'] = list(docs)
    it = {'id': id, 'categoria': cat, 'descripcion': desc.strip()[:240], 'prioridad': prio, 'orden': 0,
          'estado': ('duplicado_de:' + dup_de) if dup_de else estado, 'metodo': metodo, 'costo_creditos': costo,
          'refs': refs, 'dependencias': list(deps), 'evidencia': evid}
    if nota: it['nota'] = nota
    it['_k'] = key
    items[id] = it
    for b in bloques:
        assert b not in claimed, (b, id, claimed.get(b)); claimed[b] = id
    return it

B = {b['id']: b for b in BLK['blocks']}
RWE = {e['id']: e for e in RW['entradas']}
rw_used = set()
def rw(*ids):
    for i in ids: assert i in RWE, i; rw_used.add(i)
    return list(ids)
def bstate(b): return {'INTEGRADO_MAIN': 'hecho', 'BLOQUEADO_DECISION': 'bloqueado_decision', 'EN_CORRECCION': 'en_curso', 'SEGUIMIENTO': 'pendiente'}.get(b['state'], 'pendiente')

# ---------------------------------------------------------------- lo medido en el motor (CHECKLIST_ARTE.md §B)
MED = {}
for m in re.finditer(r'^\| (\w+) \| (hecho|parcial|arte_viejo) \| ([^|]+) \| (idle [^|]+) \|', CHK, re.M):
    MED[m.group(1)] = {'estado_atlas': m.group(2), 'clasif': m.group(3).strip(), 'medido': m.group(4).strip()}
CHAMPS = list(EC['campeones'].keys()); assert len(CHAMPS) == 46 and set(MED) == set(CHAMPS), (len(CHAMPS), set(CHAMPS) ^ set(MED))

# ================================================================= 1) CAMPEONES (46) + sus bloques de cuerpo
cuerpo_blocks = collections.defaultdict(list)
for b in BLK['blocks']:
    if b['group'] == '01-cuerpos' and not b['items'][0].split('.')[1] == 'forma':
        cuerpo_blocks[b['items'][0].split('.')[0]].append(b['id'])
RW_CH = {c: [e['id'] for e in RW['entradas'] if e['categoria'] in ('campeon_cuerpo', 'campeon_video') and (e['id'].startswith(c + '_'))] for c in CHAMPS}
for i, c in enumerate(CHAMPS):
    m = MED[c]; bl = cuerpo_blocks.get(c, []); pend = [x for x in bl if B[x]['state'] != 'INTEGRADO_MAIN']
    uno = [s for s in ('idle', 'hit') if re.search(r'\b%s 1\b' % s, m['medido'])]
    viejo = m['estado_atlas'] == 'arte_viejo'; completo = m['clasif'] == 'estados propios completos' and not pend
    if c in CODIGO: est, costo = 'en_curso', {'ilkan': 40, 'libertador': 20, 'nigromante': 0}[c]
    elif completo: est, costo = 'hecho', 0
    else: est, costo = 'pendiente', (200 if viejo else HOJA_GPT * max(1, len(uno)))
    if viejo and c in ('ilsa', 'kora', 'vorn'): deps = ['lamina-' + c]
    else: deps = []
    prio = 'importante' if (c in STARTERS or c in TOP5 or viejo) else 'secundario'
    falt = []
    if viejo: falt.append('cuerpo pre-Códice (estilo anterior al Códice)')
    if uno: falt.append('%s de 1 cuadro' % ' y '.join(uno))
    if c in CODIGO: falt.append('despacho de dibujo en js/champions/%s.js (el arte no es el hueco)' % c)
    if pend: falt.append('bloques abiertos ' + ', '.join(pend) + ' (auditoría 18-oct: puede estar vieja; medir con capture-champion-states.js antes de gastar)')
    desc = 'Campeón %s (%s): %s' % (c, EC['campeones'][c]['nombre'], '; '.join(falt) if falt else 'todos los estados propios (sin faltantes medidos)')
    evid = 'ATLAS_ARTE: %s; medido en el motor: %s' % (m['estado_atlas'], m['medido'])
    if c in STARTERS: evid += '; guardián recomendado al empezar (starter-select.js)'
    elif c in TOP5: evid += '; en la lista de prioridad de estado-campeones.json (_prioridad_5)'
    add('campeon-' + c, 'campeon', desc, prio, est, 'gpt_image_2_codice_limpio' if est != 'hecho' else 'gpt_image_2_codice_limpio', costo,
        bloques=bl, runway=rw(*RW_CH[c]) if RW_CH[c] else (), docs=['docs/art-brief/runway-pack/CHECKLIST_CAMPEONES.md', 'docs/art-brief/runway-pack/campeones/%s.md' % c],
        deps=deps, evid=evid, key=(0 if c in STARTERS else 1 if c in TOP5 else 2 if viejo else 3, i),
        nota=('No pedir arte que el motor no dibujaría: es despacho de código (CHECKLIST_ARTE §B).' if c in CODIGO else ''))

# formas (6 bloques 01-cuerpos 'forma')
for b in BLK['blocks']:
    if b['group'] == '01-cuerpos' and b['items'][0].split('.')[1] == 'forma':
        ch = b['items'][0].split('.')[0]
        add('forma-%s-%s' % (b['id'].lower(), slug(b['title'], 24)), 'campeon', b['title'], 'secundario', bstate(b), 'gpt_image_2_codice_limpio', HOJA_GPT,
            bloques=[b['id']], docs=['docs/art-brief/runway-pack/bloques/01-cuerpos.md'], evid='asset-blocks.json %s %s (forma de %s, no del cuerpo base)' % (b['id'], b['state'], ch), key=(5, int(b['id'][1:])))

# runway: poses gpt2 ya instaladas o candidatas
def gpt2(rid, cat, desc, prio, estado, key, nota, deps=()):
    e = RWE[rid]
    add('campeon-poses-' + rid, cat, desc, prio, estado, 'humano' if estado == 'instalado_sin_aprobar' else 'pintor_determinista', 0,
        runway=rw(rid), docs=['docs/beta-release/ART_CREDITS.md', 'docs/art-brief/runway-pack/REGISTRO_RUNWAY.md'], deps=deps,
        evid='estado-runway.json %s = %s (%s cr ya gastados)' % (rid, e['estado'], e.get('creditos')), nota=nota, key=key)
gpt2('tanque_lanzar_gpt2', 'campeon', 'Tanque (Aldric): integrar la hoja de 4 poses de LANZAR ya generada y aceptada con gpt_image_2 (sheet-to-cells.py + atlas-append-cells.py + comprobaciones derivadas).',
     'critico', 'pendiente', (0, 0), 'Ya pagada (20 cr): NO regenerar. Falta integrarla (0 créditos) y la aprobación humana. Tanque es el guardián #1 recomendado al empezar.')
gpt2('cazadora_ult_poses_gpt2', 'campeon', 'Cazadora (Sylva): definitiva (Cacería Salvaje) con 4 poses gpt_image_2, instalada en el motor sin aprobación humana.', 'critico', 'instalado_sin_aprobar', (0, 9), 'Revisión humana (el pintor no puede aprobarla).')
for rid, nm in (('ynara_cast_poses_gpt2', 'Ynara: LANZAR'), ('ynara_ult_poses_gpt2', 'Ynara: DEFINITIVA'), ('musashi_ult_poses_gpt2', 'Musashi: DEFINITIVA (Último Duelo)'),
                ('ilkan_ataque_frente_gpt2', 'Ilkan: ATAQUE DE FRENTE'), ('ilkan_ataque_espalda_gpt2', 'Ilkan: ATAQUE DE ESPALDAS')):
    gpt2(rid, 'campeon', nm + ' con 4 poses gpt_image_2, instalado sin aprobación humana.', 'importante', 'instalado_sin_aprobar', (1, 40), 'Revisión humana de arte (AGENTS.md: ningún gate la reemplaza).')
gpt2('libertador_ult_poses_gpt2', 'campeon', 'Libertador: hoja de 4 poses de la DEFINITIVA (ult_cast) generada y aceptada, no instalada.', 'importante', 'en_curso', (1, 41),
     'No se instala hasta que js/champions/libertador.js deje de fijar prog=0 (agente de código en curso). No regenerar.')
# laminas del Códice
for c in ('ilsa', 'kora', 'vorn'):
    add('lamina-' + c, 'campeon', 'Lámina del Códice de %s (falta; sin ella no hay referencia para su cuerpo Códice).' % c, 'importante', 'pendiente', 'gen4_image', IMG_GEN4,
        runway=rw('lamina_' + c), docs=['docs/art-brief/runway-pack/REGISTRO_RUNWAY.md'], evid='estado-runway.json lamina_%s = pendiente; assets/ui/codex/champions/%s.png no existe' % (c, c), key=(2, 100 + CHAMPS.index(c)))
add('lamina-codex-existentes', 'campeon', 'Las 43 láminas del Códice existentes (PNG+WEBP).', 'secundario', 'hecho', 'humano', 0, runway=rw('laminas_codex_existentes'), evid='assets/ui/codex/champions (43 láminas)', key=(9, 0))

# ================================================================= 2) FX por campeón, íconos por campeón, seguimiento (duplicado)
fx_by = collections.defaultdict(list); ic_by = collections.defaultdict(list)
for b in BLK['blocks']:
    if b['items'][0].startswith('A-FX-'): fx_by[b['title'].split(' · ')[0]].append(b)
    elif b['items'][0].startswith('B-ICON-'): ic_by[b['items'][0].split('-')[2]].append(b)
def champ_prio(c): return 'importante' if (c in STARTERS or c in TOP5) else 'secundario'
def champ_key(c): return CHAMPS.index(c) if c in CHAMPS else 60
for c, bs in sorted(fx_by.items(), key=lambda kv: champ_key(kv[0])):
    ult = [b['id'] for b in bs if b['priority'] == 'P0']
    add('fx-' + c, 'efecto', 'Efectos de habilidad de %s (%d bloques: básico, habilidades, definitiva, pasiva). Hoy 100%% procedurales (funcionan).' % (c, len(bs)), champ_prio(c), 'pendiente', 'pintor_determinista', 0,
        bloques=[b['id'] for b in bs], docs=['docs/art-brief/runway-pack/bloques/02-combate.md', 'docs/beta-release/INVENTARIO_FX_PINTADOS.md'],
        evid='asset-blocks.json %s…%s (%d P0 = definitiva); en captura de partida los efectos procedurales se leen (prioridad-capturas/run_*.png); qué FX son pintados: INVENTARIO_FX_PINTADOS.md' % (bs[0]['id'], bs[-1]['id'], len(ult)),
        key=(1 if c in STARTERS else 2 if c in TOP5 else 4, champ_key(c)), nota='Código/pintor determinista: NO gasta Runway (README_PROMPT_MAESTRO §3.5).')
for c, bs in sorted(ic_by.items(), key=lambda kv: champ_key(kv[0])):
    st = {bstate(b) for b in bs}
    add('iconos-' + c, 'icono', 'Íconos 16×16 del kit %s (habilidades 1-3, definitiva; %d bloque). Hoy motivo ASCII 12×12: legible en el HUD.' % (c, len(bs)), 'importante' if c in STARTERS else 'secundario',
        'bloqueado_decision' if 'bloqueado_decision' in st else 'pendiente', 'pintor_determinista', 0, bloques=[b['id'] for b in bs],
        docs=['docs/art-brief/runway-pack/bloques/04-interfaz.md'], evid='asset-blocks.json %s BLOQUEADO_DECISION; HUD de partida muestra los íconos actuales legibles (prioridad-capturas/hud_*.png)' % bs[0]['id'], key=(1 if c in STARTERS else 4, champ_key(c)),
        nota='Runway no sirve a 16×16: pintor de íconos. Espera la decisión del dueño (bloques 04-interfaz BLOQUEADO_DECISION).')
for b in BLK['blocks']:
    if b['group'] == '06-seguimiento':
        k = b['items'][0].split('.'); c, kind = k[0], k[1]
        tgt = ('fx-' if kind == 'fx' else 'iconos-') + c
        assert tgt in items, (b['id'], tgt)
        add('dup-%s-%s' % (b['id'].lower(), kind), 'efecto' if kind == 'fx' else 'icono', b['title'], items[tgt]['prioridad'], '', 'pintor_determinista', 0, bloques=[b['id']], dup_de=tgt,
            evid='asset-blocks.json: agregado de seguimiento del kit (%s); «no dibujar dos veces» (06-seguimiento)' % c, nota='Es el MISMO arte que %s: no dibujar dos veces.' % tgt, key=(8, int(b['id'][1:])))

# proyectiles y objetos persistentes (por bloque)
for b in BLK['blocks']:
    f = b['items'][0]
    if f.startswith('A-PROJ'):
        add('proy-%s-%s' % (b['id'].lower(), slug(f.split('-', 2)[2], 16)), 'efecto', b['title'], 'importante' if b['priority'] == 'P1' and b['id'] in ('B277', 'B279') else 'secundario', 'pendiente', 'pintor_determinista', 0,
            bloques=[b['id']], evid='asset-blocks.json %s %s' % (b['id'], b['priority']), key=(2 if b['priority'] == 'P1' else 5, int(b['id'][1:])))
    elif f.startswith('A-PROP'):
        add('objeto-%s-%s' % (b['id'].lower(), slug(f.split('-')[-1], 14)), 'efecto', b['title'], 'secundario', 'pendiente', 'pintor_determinista', 0, bloques=[b['id']], evid='asset-blocks.json %s %s' % (b['id'], b['priority']), key=(6, int(b['id'][1:])))

# ================================================================= 3) ENEMIGOS Y JEFES (104 medidos) + sus bloques C-ENEMY
EN = ATLAS['enemies']; R = {r['t']: r for r in COV['results']}
assert len(R) == 104
def gaps(t):
    s = R[t]['src']; g = []
    for k in ('attack', 'death'):
        v = s.get(k, '')
        if (not v.startswith('real')) or 'clon' in v: g.append(k)
    if EN[t].get('kind') != 'real': g.append('sin atlas propio (dibujado por formas)')
    return g
enemy_blocks = collections.defaultdict(list)
for b in BLK['blocks']:
    es = [i[len('C-ENEMY-'):] for i in b['items'] if i.startswith('C-ENEMY-')]
    if es: enemy_blocks[b['id']] = es
owner_of_block = {}
for bid, es in enemy_blocks.items():
    pend = [t for t in es if t not in R or gaps(t)]
    owner_of_block[bid] = pend[0] if pend else None
rw_enemy = {}
for e in RW['entradas']:
    if e['categoria'] in ('enemigo_hoja', 'jefe'): rw_enemy[e['id'][5:] if e['id'].startswith('hoja_') else e['id']] = e['id']
rw_enemy['leviatan_imagenes_15'] = 'leviatan_imagenes_15'
def eprio(t, g):
    r = R[t]; a = AIDX.get(r['arena'], 11); jefe = r['rank'] in ('jefe', 'subjefe')
    if not g: return 'critico' if a <= 2 else 'importante' if a <= 7 else 'secundario'
    if a <= 2: return 'critico'
    if a <= 7: return 'importante'
    return 'secundario'
for t, r in sorted(R.items(), key=lambda kv: (AIDX.get(kv[1]['arena'], 11), ['normal', 'subelite', 'elite', 'subjefe', 'jefe'].index(kv[1]['rank']), kv[0])):
    g = gaps(t); a = AIDX.get(r['arena'], 11)
    rws = [rw_enemy[x] for x in (t, 'leviatan_imagenes_15' if t == 'leviatan' else None) if x and x in rw_enemy]
    rws = [x for x in rws if x in RWE]
    bl = [bid for bid, o in owner_of_block.items() if o == t]
    cred = sum((RWE[x].get('creditos') or 0) for x in rws)
    rech = [x for x in rws if RWE[x]['estado'] == 'rechazado']
    nota = []
    if cred > HOJA_ENEMIGO: nota.append('Ya se pagaron %d cr en hojas de esta criatura: no regenerar sin causa registrada.' % cred)
    if rech: nota.append('Intento Runway rechazado (%s): NO repetir igual; leer REGISTRO_RUNWAY «NO REPETIR».' % ', '.join(rech))
    sv = R[t]['src']
    ev = 'enemy-coverage.json: attack=%s, death=%s, hit=%s; ATLAS_ARTE=%s; arena %d/10 (%s); altura %.2f× el campeón típico' % (sv.get('attack'), sv.get('death'), sv.get('hit'), EN[t]['status'], a, r['arena'], r['hRatio'])
    cat = 'jefe' if r['rank'] in ('jefe', 'subjefe') else 'enemigo'
    desc = '%s (%s, %s, arena %s)' % (r['name'], t, r['rank'], r['arena']) + ('' if not g else ': falta arte propio de ' + ' y '.join(g))
    kind_shapes = EN[t].get('kind') != 'real'
    add('enemigo-' + t, cat, desc, eprio(t, g), 'pendiente' if g else 'hecho', 'gen4_image' if g else 'gen4_image', (13 if kind_shapes else HOJA_ENEMIGO) if g else 0, bloques=bl,
        runway=rw(*rws) if rws else (), docs=['docs/art-brief/runway-pack/enemigos/%s.md' % r['arena'], 'docs/art-brief/runway-pack/ENEMIGOS_GUIA.md'], evid=ev, nota=' '.join(nota),
        key=(a, ['normal', 'subelite', 'elite', 'subjefe', 'jefe'].index(r['rank']) if not g else 0, 0 if g else 1, t))
# bloques C-ENEMY redundantes (el enemigo ya tiene arte propio medido): duplicado explícito
for bid, o in owner_of_block.items():
    if o is None:
        es = enemy_blocks[bid]; t = es[0]
        add('dup-%s-%s' % (bid.lower(), slug(t, 20)), 'jefe' if R.get(t, {}).get('rank') in ('jefe', 'subjefe') else 'enemigo', B[bid]['title'], items['enemigo-' + t]['prioridad'], '', 'gen4_image', 0, bloques=[bid], dup_de='enemigo-' + t,
            evid='ATLAS_ARTE: %s CODEX_OK y enemy-coverage con ataque/muerte propios (%s)' % (t, ', '.join(es)),
            nota='El bloque sigue «PENDIENTE» en asset-blocks.json pero la criatura YA tiene hoja propia instalada: no regenerar.', key=(8, int(bid[1:])))
    else:
        extra = [e for e in enemy_blocks[bid] if e != o]
        if extra: items['enemigo-' + o]['refs'].setdefault('bloques_compartidos', []).extend(extra)

# ================================================================= 4) MUNDO desde Runway (pisos/centros/fachadas/props/láminas/otros)
ARENA_RW = {'casa_a': 'ciudad', 'casa_b': 'ciudad', 'tex_techo_pizarra': 'ciudad', 'tex_techo_roja': 'ciudad', 'tex_pared_madera_piedra': 'ciudad', 'ciudad_estatua': 'ciudad', 'ciudad_farol': 'ciudad',
            'fort_planchas_hierro': 'fortaleza', 'fort_adoquin_patio': 'fortaleza', 'fort_rejilla_lava': 'fortaleza', 'laberinto_piso': 'laberinto', 'laberinto_centro': 'laberinto',
            'infernal_piso': 'infernal', 'infernal_centro': 'infernal', 'acuatica_piso': 'acuatica', 'acuatica_centro': 'acuatica', 'abismo_piso': 'abismo'}
for rid, a in ARENA_RW.items():
    e = RWE[rid]
    if rid == 'casa_a':
        add('arena-ciudad-casa_a-integrar', 'arena', 'Ciudad Maldita: integrar la fachada casa_a (ya generada y aceptada): recorte croma, caja a escala nativa y carga en cm-render.js con respaldo.', 'critico', 'pendiente', 'pintor_determinista', 0,
            runway=rw('casa_a', 'prox_integrar_casa_a'), docs=['docs/art-brief/CHECKLIST_ARTE.md'], evid='estado-runway.json casa_a = hecho_sin_integrar (8 cr gastados); ningún js/ la carga; arena 1 del recorrido', key=(0, 1),
            nota='Ya pagada: NO regenerar. Seguir el patrón de tools/art-world/build-ciudad-estatua.py.')
        continue
    if rid == 'casa_b':
        add('arena-ciudad-casa_b-rechazada', 'arena', 'Ciudad Maldita: cabaña casa_b (rechazada: salió isométrica).', 'secundario', 'bloqueado_decision', 'gen4_image', IMG_GEN4, runway=rw('casa_b'), evid='estado-runway.json casa_b = rechazado',
            nota='NO repetir con el mismo prompt. Si hace falta otra casa: «front-on oblique view, no isometric» con casa_a como @ref.', key=(9, 1)); continue
    est = {'hecho_integrado': 'hecho', 'hecho_sin_integrar': 'pendiente', 'rechazado': 'hecho'}[e['estado']]
    ai = AIDX[a]
    add('arena-' + rid, 'arena', e['descripcion'], 'critico' if ai <= 2 else 'importante' if ai <= 7 else 'secundario', est, 'gen4_image', 0, runway=rw(rid), docs=['docs/art-brief/runway-pack/REGISTRO_RUNWAY.md'],
        evid='estado-runway.json %s = %s (%s cr); arena %d/10' % (rid, e['estado'], e.get('creditos'), ai), key=(ai, 5, rid),
        nota=('Rechazado: no hay faltante real (el Abismo ya tiene piso); no repetir el prompt.' if e['estado'] == 'rechazado' else ''))
for rid in ('regla_campeon_cuerpo_imagenes_sueltas', 'regla_animacion_hojas_enemigos'):
    add('otro-' + rid, 'otro', RWE[rid]['descripcion'], 'secundario', 'hecho', 'humano', 0, runway=rw(rid), evid='estado-runway.json: regla medida (rechazado); sirve para NO repetir', key=(9, 5))
add('otro-hud-marcos-arcano', 'ui', RWE['hud_marcos_arcano']['descripcion'], 'secundario', 'hecho', 'gen4_image', 0, runway=rw('hud_marcos_arcano'), evid='estado-runway.json hecho_integrado (30 cr)', key=(9, 6))
add('otro-referencias-codex-limpias', 'otro', RWE['referencias_codex_limpias']['descripcion'], 'secundario', 'hecho', 'pintor_determinista', 0, runway=rw('referencias_codex_limpias'), evid='estado-runway.json hecho_sin_integrar (son insumos de referencia, no arte del juego)', key=(9, 7))
add('otro-saldo-runway', 'otro', 'Saldo de créditos de Runway (cuenta compartida): comprobar con `node tools/art-world/runway-world.js status`; regla de la rutina: no gastar con saldo < 250.', 'secundario', 'bloqueado_decision', 'humano', 0, runway=rw('saldo_runway'),
    evid='estado-runway.json saldo_runway = bloqueado; saldo no verificado en esta sesión (no medido)', key=(9, 8))

# ================================================================= 5) RESTO DE BLOQUES (mundo, UI, cosméticos): una ficha por bloque con regla de prioridad
MEC_ARENA = {'A-02': 'laberinto', 'A-05': 'infernal', 'A-06': 'acuatica', 'A-07': 'hielo', 'A-08': 'micelial', 'A-09': 'ciudad', 'A-11': 'hielo', 'A-12': 'laberinto', 'A-13': 'acuatica', 'A-14': 'bosque', 'A-15': 'infernal', 'A-16': None}
def arena_of(b):
    t = b['title']; f = b['items'][0]
    m = re.search(r'\b(A-\d\d)\b', t)
    if f.startswith('D-MEC') and m: return MEC_ARENA.get(m.group(1))
    if re.search(r'\bCM-|ciudad', t): return 'ciudad'
    if re.search(r'\bMN-|Minas|minas', t): return 'minas'
    if re.search(r'\bAB-|abismo|Abismo', t): return 'abismo'
    for a in ('infernal', 'hielo', 'bosque', 'laberinto', 'acuatica', 'divina', 'fortaleza', 'micelial'):
        if re.search(a, t): return a
    return None
def wprio(b, a):
    p = b['priority']; ai = AIDX.get(a, 99 if a else 0)
    if a is None: return 'importante' if p in ('P0', 'P1') else 'secundario'
    if ai == 1: return {'P0': 'critico', 'P1': 'importante', 'P2': 'secundario'}[p]
    if ai <= 7: return 'importante' if p in ('P0', 'P1') else 'secundario'
    return 'secundario'
DUP_RUNWAY = {  # fila prox_* de estado-runway que repite un bloque: (item canónico por bloque, nota)
    'prox_fachadas_ciudad_t06': 'B062', 'prox_props_infernal': 'B314', 'prox_props_hielo': 'B315', 'prox_props_bosque': 'B317', 'prox_props_laberinto': 'B318',
    'prox_piso_bosque': 'B320', 'prox_piso_hielo': 'B320', 'prox_piso_divina': 'B547', 'prox_centro_bosque': 'B540', 'prox_centro_hielo': 'B540'}
BF_FILES = {f['file'].split('battlefield/')[-1][:-4] for f in ATLAS['files'] if '/battlefield/' in f['file'] and f.get('loaded')}
PORT_OK = {a: os.path.exists(P('assets/ui/codex/arenas/%s.png' % a)) for a in ARENAS + ['divina', 'coliseo', 'convergencia']}
pending_dups = []
ID_RENAME = {'B062': 'arena-ciudad-edificios-t06', 'B060': 'arena-ciudad-civiles-c01-c02', 'B061': 'arena-ciudad-techos-t03-t04', 'B063': 'arena-ciudad-ovacion-final', 'B368': 'efecto-ciudad-cometa-gran-numero'}
for b in BLK['blocks']:
    bid = b['id']
    if bid in claimed: continue
    f = b['items'][0]; t = b['title']; n = int(bid[1:])
    if f.startswith('C-BF'):
        name = f.split('C-BF-', 1)[1]
        if name in BF_FILES:
            pending_dups.append((bid, 'arte-battlefield-retratos', b, 'assets/sprites/battlefield/%s.png existe y el motor lo carga (ATLAS_ARTE.files)' % name, 'El retrato/hoja ya existe en assets/sprites/battlefield: no regenerar.'))
            continue
    if f.startswith('D-PORTADA'):
        a = f.split('D-PORTADA-', 1)[1]
        if PORT_OK.get(a):
            pending_dups.append((bid, 'arte-portadas-arena', b, 'assets/ui/codex/arenas/%s.png existe (1440×630); el bloque pide 960×420 píxel nativo: calidad/estilo NO medido' % a, 'La portada ya existe; rehacerla a píxel nativo es una decisión del dueño (abrir ítem nuevo), no una falta.'))
            continue
    if bid == 'B068':
        pending_dups.append((bid, 'B067', b, 'RO-01 (insignias de rol) figura también en B067', 'RO-01 ya está en B067: no dibujar dos veces.')); continue
    a = arena_of(b); prio = wprio(b, a)
    g = b['group']; cat = 'arena'; met = 'gen4_image'; costo = None; nota = ''
    if f.startswith('C-ITEM'): cat, prio, met = 'otro', ('importante' if b['priority'] == 'P0' else 'secundario'), 'pintor_determinista'; costo = 0
    elif f.startswith(('C-PROC', 'C-SET-aura')): cat, prio, met, costo = 'efecto', 'secundario', 'pintor_determinista', 0
    elif f.startswith('C-CODEX'): cat, prio, met = 'ui', 'secundario', 'gen4_image'
    elif f.startswith('C-FORMA'): cat, prio, met = 'jefe', 'secundario', 'gen4_image'
    elif f.startswith('C-BF'): cat, prio, met = 'jefe', 'secundario', 'gen4_image'
    elif g == '04-interfaz': cat, met = 'ui', 'pintor_determinista'; costo = 0; prio = 'importante' if (b['priority'] in ('P0',) or f.startswith('E-UI-COMBATE')) else prio
    elif g == '05-cosmeticos': cat, prio, met = 'skin', 'secundario', 'gpt_image_2_codice_limpio'
    elif f.startswith('D-PROP-inlay') or f.startswith('D-SUELO'): met = 'gen4_image'
    if f.startswith('D-MEC') or f.startswith('D-COMBATE') or f.startswith('D-ABISMO-FX') or f.startswith('D-ABISMO-PR') or f.startswith('D-MINAS'): met, costo = 'pintor_determinista', 0
    if f.startswith('D-CIUDAD-CM') and re.search(r'CM-V|CM-P0[23]', t): met, costo = 'pintor_determinista', 0
    if f.startswith('D-PROP') or f.startswith('D-SUELO'):
        costo = IMG_GEN4 * max(1, len([i for i in b['items']]))
    elif costo is None and met == 'gen4_image': costo = IMG_GEN4 * len(b['items'])
    if g == '05-cosmeticos': costo = None
    if bid == 'B061': nota = 'T01/T02 YA existen (tex_techo_pizarra, tex_techo_roja, tex_pared_madera_piedra: ver arena-tex_*): solo faltan T03 (techo dañado/en llamas) y T04 (ruinas). No regenerar T01/T02.'; costo = 2 * IMG_GEN4
    if bid == 'B060': met, costo = 'gpt_image_2_codice_limpio', 2 * HOJA_GPT
    if bid == 'B062': nota = 'La fila prox_fachadas_ciudad_t06 de estado-runway repite este bloque (ver su duplicado). casa_b se rechazó por isométrica: pedir vista oblicua, casa_a como @ref.'; costo = 4 * IMG_GEN4
    if bid == 'B067': nota = 'Incluye RO-01 (insignias de rol): B068 lo repite.'
    if bid in ('B540', 'B541', 'B542'): nota = 'Ya instalados y NO repetir: infPentagram (infernal_centro), minoChamber (laberinto_centro), sunkTemple (acuatica_centro). Las filas prox_centro_* de estado-runway repiten ritualCircle/frozenLake.'
    if bid == 'B547': nota = 'Suelo divina (prox_piso_divina lo repite). tex_carne/tex_tentaculo del Abismo: PALETA_EXCESIVA.'
    if bid == 'B320': nota = 'bosque y hielo: pendientes (prox_piso_bosque/prox_piso_hielo lo repiten). laberinto e infernal YA tienen piso pintado (laberinto_piso, infernal_piso): no regenerar.'
    ev = 'asset-blocks.json %s %s %s' % (bid, b['priority'], b['state']) + ('; arena %s (%d/10 del recorrido)' % (a, AIDX[a]) if a in AIDX else ('; arena %s' % a if a else '; transversal (todas las partidas)'))
    nm = slug(re.sub(r'^[A-Z]{1,2}-\w+\s+', '', t.split(' / ')[0]), 26)
    add(ID_RENAME.get(bid, '%s-%s' % (bid.lower(), nm)), cat, t, prio, bstate(b), met, costo, bloques=[bid], docs=['docs/art-brief/runway-pack/bloques/%s.md' % g], evid=ev, nota=nota,
        key=(AIDX.get(a, 0) if a else 0, int(bid[1:])))
# item destino de duplicados de arte existente
add('arte-battlefield-retratos', 'jefe', 'Retratos/hojas de campo de batalla (32 archivos en assets/sprites/battlefield, todos cargados por el motor).', 'secundario', 'hecho', 'humano', 0, docs=['docs/art/ATLAS_ARTE.md'], evid='ATLAS_ARTE.files: battlefield 32/32 hecho', key=(9, 10))
add('arte-portadas-arena', 'arena', 'Portadas de arena existentes (assets/ui/codex/arenas/*.png, 11 arenas, 1440×630).', 'secundario', 'hecho', 'humano', 0, docs=['docs/art/ATLAS_ARTE.md'], evid='11 PNG presentes; densidad/estilo no medidos', key=(9, 11))
for bid, tgt, b, ev, nota in pending_dups:
    if tgt in claimed: tgt = claimed[tgt]
    add('dup-%s-%s' % (bid.lower(), slug(b['title'], 22)), 'ui' if 'portada' in tgt else 'jefe', b['title'], items[tgt]['prioridad'], '', 'humano', 0, bloques=[bid], dup_de=tgt, evid=ev, nota=nota, key=(8, int(bid[1:])))
# filas prox_* de estado-runway que repiten un bloque
for rid, bid in DUP_RUNWAY.items():
    tgt = claimed[bid]; e = RWE[rid]
    add('dup-runway-' + rid, 'arena', e['descripcion'], items[tgt]['prioridad'], '', 'gen4_image', 0, runway=rw(rid), dup_de=tgt, evid='estado-runway.json %s repite %s de asset-blocks.json' % (rid, bid),
        nota='Mismo trabajo que %s: se hace UNA vez (el ítem canónico lleva el costo).' % tgt, key=(8, 100))
    if tgt in items and items[tgt]['costo_creditos'] is not None: pass
# prox_hojas_fortaleza: obsoleta (las tres criaturas ya tienen hoja medida)
add('dup-runway-prox_hojas_fortaleza', 'enemigo', RWE['prox_hojas_fortaleza']['descripcion'], 'critico', '', 'gen4_image', 0, runway=rw('prox_hojas_fortaleza'), dup_de='enemigo-carcelero',
    evid='ATLAS_ARTE: carcelero, dragon_bronce y prisionero = CODEX_OK con ataque/muerte reales (la fila dice «la arena no tiene ninguna hoja Runway»: obsoleta)', nota='Obsoleta: las tres criaturas ya tienen arte propio instalado; no gastar 24 cr.', key=(8, 101))
rw('prox_bosque_piso_turbo')
add('arte-piso-bosque-turbo-rechazado', 'arena', RWE['prox_bosque_piso_turbo']['descripcion'], 'secundario', 'hecho', 'gen4_image', 0, runway=['prox_bosque_piso_turbo'], dup_de=None,
    evid='estado-runway.json rechazado (2 cr)', nota='Rechazado: NO repetir. El piso de Bosque se hace por b320-suelo-bosque (gen4_image con referencia solo-textura).', key=(9, 12))
# skins: ATLAS (104) y cromas
sk = collections.Counter()
for c, v in ATLAS['champions'].items():
    for s in v.get('skins', []): sk[(s['kind'], s['status'])] += 1
tot = sum(sk.values())
add('skins-cromas-recolor', 'skin', 'Cromas de catálogo (recolor determinista del cuerpo base): %d.' % sum(v for (k, s), v in sk.items() if k == 'croma'), 'secundario', 'hecho', 'pintor_determinista', 0, evid='ATLAS_ARTE skins: ' + ', '.join('%s/%s %d' % (k, s, v) for (k, s), v in sorted(sk.items())), key=(9, 20), nota='Los cromas son recolor (0 cr): no se piden a Runway.')
add('skins-estados-parcial', 'skin', 'Skins de set y formas de Ascensión con estados repetidos (ataque/lanzar = mismo cuadro): %d de %d skins medidas en FALTA_ANIMACION/ARTE_VIEJO.' % (sum(v for (k, s), v in sk.items() if s != 'CODEX_OK'), tot), 'secundario', 'pendiente', 'gpt_image_2_codice_limpio', None,
    evid='ATLAS_ARTE skins: ' + ', '.join('%s/%s %d' % (k, s, v) for (k, s), v in sorted(sk.items())), key=(9, 21))


# ================================================================= observaciones de la evaluación del motor (capturas 2026-11-14, 1280x720)
def obs(id, cat, desc, prio, estado, evid, key, nota=''):
    add(id, cat, desc, prio, estado, 'humano' if estado != 'hecho' else 'humano', 0, evid=evid, nota=nota, key=key)
obs('ui-titulo', 'ui', 'Pantalla de título (logo, escena de guardianes y jefe, botón JUGAR AHORA).', 'critico', 'hecho', 'captura ' + CAP + '01_titulo.webp: arte coherente, sin placeholders', (0, 90))
obs('ui-hud-combate', 'ui', 'HUD de partida (vida/energía, botones de habilidad con ícono, definitiva, minimapa, tarjetas de aliados).', 'critico', 'hecho', 'capturas ' + CAP + 'run_ciudad.webp, run_bosque.webp: se lee bien; íconos de habilidad legibles', (0, 91))
obs('ui-arenas-seleccion', 'ui', 'Pantalla de selección de campaña con miniaturas de arena.', 'critico', 'hecho', 'captura ' + CAP + '04_arenas.webp: miniaturas presentes en las 6 arenas visibles', (0, 92))
obs('ui-tienda', 'ui', 'Tienda (destacados, skins, ofertas del día).', 'importante', 'hecho', 'captura ' + CAP + '05_tienda.webp: íconos de objeto y arte de skin presentes; pestañas Guardianes/Objetos/Skins/Brasas no capturadas (no medido)', (1, 90))
obs('ui-starter-retratos', 'ui', 'Selección del primer guardián: tarjetas con el sprite sobre cuadrado plano y la mitad superior de la pantalla vacía; existen láminas del Códice (assets/ui/codex/champions) que podrían usarse.', 'importante', 'pendiente', 'captura ' + CAP + '03_starter.webp (primera pantalla tras JUGAR AHORA); es de layout/código más que de arte', (1, 91), 'Decisión de producto: usar la lámina del Códice como retrato (cambio de código, 0 cr).')
obs('ui-hub-fondo', 'ui', 'Hub: fondo de degradé liso y módulos con íconos pequeños; sin ilustración de ambiente.', 'importante', 'pendiente', 'captura ' + CAP + '02_hub.webp; funcional y limpio, pero es la pantalla más vista y la menos ilustrada', (1, 92))
obs('arena-micelial-fondo-suavizado', 'arena', 'Reino Fúngico (arena 4): el fondo se ve suavizado/borroso frente al resto de arenas en píxel nativo.', 'importante', 'pendiente', 'captura ' + CAP + 'montaje_arenas_2.webp (arriba izquierda); densidad NO medida: medir con tools/art/arena_lineup.js antes de rehacer', (1, 93))
obs('arena-fortaleza-lectura-enemigos', 'arena', 'Fábrica Sin Fin (arena 2): enemigos oscuros sobre suelo oscuro, lectura de combate floja.', 'importante', 'pendiente', 'captura ' + CAP + 'run_fortaleza.webp; impresión de una sola captura de 9 s: no medido (contraste)', (1, 94))
obs('ui-tanque-lanzar-igual-definitiva', 'campeon', 'Tanque: las filas de LANZAR y DEFINITIVA del motor muestran los mismos 4 cuadros (pose de escudo); el candidato gpt_image_2 de lanzar ya existe.', 'critico', 'hecho', 'captura del motor ' + CAP + 'estados_tanque.webp (tools/art/capture-champion-states.js tanque): filas 7 y 8 idénticas; resuelve campeon-poses-tanque_lanzar_gpt2', (0, 95), 'Solo evidencia: el trabajo es campeon-poses-tanque_lanzar_gpt2.')

# ================================================================= asignar orden (estable) y escribir
unc = [b for b in B if b not in claimed]; assert not unc, unc[:5]
CRIT_ORDER = ['campeon-poses-tanque_lanzar_gpt2', 'arena-ciudad-casa_a-integrar', 'enemigo-cm_cometa', 'enemigo-cm_presentador', 'enemigo-cm_dama', 'enemigo-cm_maestro', 'enemigo-cm_tramoyista',
              claimed['B062'], claimed['B060'], claimed['B368'], claimed['B061'], 'enemigo-dragon_forja', 'campeon-poses-cazadora_ult_poses_gpt2']
FORCED = {i: (0, '%06d' % n) for n, i in enumerate(CRIT_ORDER)}
for i in CRIT_ORDER: items[i]['prioridad'] = 'critico'
by = {p: [] for p in RANKS}
for it in items.values(): by[it['prioridad']].append(it)
for p, lst in by.items():
    lst.sort(key=lambda x: (x['estado'].startswith('duplicado'), x['estado'] == 'hecho', FORCED.get(x['id'], (1,)) + tuple('%06d' % v if isinstance(v, int) else str(v) for v in x['_k']), x['id']))
    for i, it in enumerate(lst, 1): it['orden'] = i
out_items = []
for p in RANKS:
    for it in by[p]: it.pop('_k'); out_items.append(it)
doc = {
    '_leyenda': {
        'archivo': 'Fuente de verdad del checklist de prioridad. Se edita con `python3 tools/art/prioridad-assets.py --set <id> <estado>` (o a mano para reordenar); el .md se regenera con `python3 tools/art/prioridad-assets.py`. Guía: docs/art-brief/COMO_USAR_PRIORIDAD.md.',
        'campos': {'id': 'estable, minúsculas; no se renombra', 'categoria': 'campeon | enemigo | jefe | arena | ui | efecto | icono | skin | otro', 'descripcion': 'qué es',
                   'prioridad': 'critico | importante | secundario (criterios en _criterios)', 'orden': 'entero único DENTRO de su prioridad (1 = primero)',
                   'estado': 'hecho | instalado_sin_aprobar | pendiente | en_curso | bloqueado_decision | duplicado_de:<id>', 'metodo': 'gpt_image_2_codice_limpio | gen4_image | pintor_determinista | humano',
                   'costo_creditos': 'créditos de Runway estimados para terminarlo (0 = sin gasto; null = no estimado). Referencias: hoja de 4 poses gpt_image_2 = 20, imagen gen4_image = 8, hoja de enemigo = 5 (RECETA.md / estado-runway.json)',
                   'refs': 'bloques (dueños en asset-blocks.json; cada bloque tiene exactamente UN dueño), bloques_compartidos (también los cubre), runway (ids de estado-runway.json), docs',
                   'dependencias': 'ids que deben estar hecho/instalado_sin_aprobar antes', 'evidencia': 'captura / medición / conteo; «no medido» si no se pudo medir', 'nota': 'opcional: qué NO regenerar, riesgos'},
        'estados': {'hecho': 'integrado y medido (no repetir)', 'instalado_sin_aprobar': 'instalado en el motor; falta aprobación humana de arte', 'pendiente': 'falta; el pintor puede tomarlo',
                    'en_curso': 'alguien (p. ej. un agente de código) lo está haciendo: no tomarlo', 'bloqueado_decision': 'espera una decisión del dueño', 'duplicado_de:<id>': 'mismo arte que <id> o ya existe: NO regenerar'},
        'metodos': {'gpt_image_2_codice_limpio': 'Runway gpt_image_2, hoja de 4 poses sobre croma verde, lámina del Códice limpia como @codex (RECETA.md)', 'gen4_image': 'Runway gen4_image (8 cr; mundo, láminas, hojas de enemigo)',
                    'pintor_determinista': 'código / pintor determinista de tools/art*: 0 créditos', 'humano': 'requiere decisión, aprobación o cambio de código del equipo'},
        '_criterios': {
            'critico': 'Lo que el jugador nuevo ve en los primeros 10 minutos o en todas las partidas Y hoy está como placeholder visible, falta, está cortado o tiene el estilo equivocado: arena 01-02 (Ciudad, Fábrica) y su tutorial, guardián #1 recomendado, enemigos/jefes de esas arenas con estados propios faltantes.',
            'importante': 'Se ve en la mayor parte del juego y tiene sustituto aceptable (efectos procedurales, íconos ASCII legibles, arenas 03-07, resto de campeones y definitivas, jefes intermedios, tienda/colecciones, HUD transversal).',
            'secundario': 'Cosmético, profundidad o contenido tardío: skins, cromas, props decorativos, arenas 08-10 (Abismo, Minas, Infernal), cofres/íconos de objetos de rarezas altas, Libro/Códice, modos secundarios.'},
        'orden_de_arenas': ARENAS, 'guardianes_recomendados': STARTERS, 'prioridad_estado_campeones': TOP5,
        'fuentes': ['docs/production/asset-blocks.json', 'docs/art/ATLAS_ARTE.json', 'docs/art-brief/enemy-coverage.json', 'docs/art-brief/runway-pack/estado-runway.json', 'docs/art-brief/runway-pack/estado-campeones.json', 'docs/art-brief/CHECKLIST_ARTE.md'],
        'capturas': CAP, 'entregas_sin_equivalencia': BLK.get('unmappedMergedDeliveries', [])},
    'items': out_items}
if '--stdout' in sys.argv: print(json.dumps(doc, ensure_ascii=False, indent=1)[:3000]); sys.exit(0)
if os.path.exists(OUT) and '--force' not in sys.argv and '--merge' not in sys.argv:
    sys.exit('Ya existe %s: usá --merge (conserva lo editado) o --force (rehace todo).' % OUT)
if '--merge' in sys.argv and os.path.exists(OUT):
    old = {i['id']: i for i in load('docs/art-brief/prioridad-assets.json')['items']}
    for it in out_items:
        o = old.get(it['id'])
        if o:
            for k in ('prioridad', 'orden', 'estado', 'nota', 'metodo', 'costo_creditos'): 
                if k in o: it[k] = o[k]
    seen = {i['id'] for i in out_items}; out_items += [o for o in old.values() if o['id'] not in seen]
    doc['items'] = out_items
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(doc, f, ensure_ascii=False, indent=1); f.write('\n')
cnt = collections.Counter(i['prioridad'] for i in out_items if not i['estado'].startswith('duplicado'))
print('items', len(out_items), dict(cnt), 'duplicados', sum(1 for i in out_items if i['estado'].startswith('duplicado')), 'bloques cubiertos', len(claimed), '/', len(B), 'runway usados', len(rw_used), '/', len(RWE))
