#!/usr/bin/env python3
"""Checklist ÚNICO de TODO el arte del juego (qué está hecho, qué falta, qué sigue) para no repetir trabajo entre sesiones.
Renderiza docs/art-brief/CHECKLIST_ARTE.md leyendo las fuentes REALES del repo (ninguna cifra va copiada a mano):
  docs/art/ATLAS_ARTE.json                                  (campeones, skins, enemigos, jefes, archivos: lo que carga el motor)
  docs/art-brief/runway-pack/estado-campeones.json + CHECKLIST_CAMPEONES.md  (vía tools/art/champ-checklist.py)
  docs/art-brief/runway-pack/estado-runway.json             (mundo y todo lo hecho/probado con Runway)
  docs/production/asset-blocks.json                         (cola de producción por grupo)
  docs/art-brief/enemy-coverage.json                        (medición del motor: qué estado de cada criatura es arte real o relleno)
  docs/beta-release/STATUS.md, ART_CREDITS.md, docs/steam/DECLARACION_IA.md   (solo para comprobar que lo citado sigue escrito)
Uso: python3 tools/art/art-checklist.py                 (escribe el .md)
     python3 tools/art/art-checklist.py enemigos [<coverage.json>]   (regenera docs/art-brief/enemy-coverage.json: sin argumento corre
                                                       `node tools/art/enemy_coverage.js` —necesita navegador, ~2 min— y compacta su salida)
     python3 tools/art/art-checklist.py --check         (falla si el .md no está sincronizado; no usa navegador ni red; lo corre test-runway-pack.py)
Vocabulario de estados (único; si algo no se pudo comprobar es `sin_verificar` con el motivo):
  hecho · parcial · arte_viejo · falta · hecho_sin_integrar · rechazado · bloqueado · codigo_en_curso · sin_verificar
No se edita a mano el .md: se regenera. Si cambia ATLAS_ARTE.json o un registro, volver a correr este script."""
import collections, json, os, re, subprocess, sys, importlib.util

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
P = lambda *a: os.path.join(ROOT, *a)
OUT = P('docs/art-brief/CHECKLIST_ARTE.md')
COV = P('docs/art-brief/enemy-coverage.json')

# costos de referencia (créditos de Runway). gpt_image_2 y gen4_image: docs/art-brief/runway-pack/RECETA.md y estado-runway.json (_leyenda.costo)
HOJA_GPT = 20      # hoja de 4 poses con gpt_image_2 (~1 hoja por estado)
IMG_GEN4 = 8       # imagen gen4_image 1024: sirve para mundo/láminas, NO para poses de campeón
HOJA_ENEMIGO = 5   # hoja de enemigo 1280x720 (medido, estado-runway.json)

def load(*p):
    with open(P(*p), encoding='utf-8') as f: return json.load(f)
def text(*p):
    try:
        with open(P(*p), encoding='utf-8') as f: return f.read()
    except OSError: return ''
def mod(name, rel):
    sp = importlib.util.spec_from_file_location(name, P(rel)); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
def tabla(cab, filas):
    esc = lambda v: str(v).replace('|', '\\|').replace('\n', ' ')
    return '\n'.join(['| ' + ' | '.join(cab) + ' |', '|' + '|'.join('---' for _ in cab) + '|'] + ['| ' + ' | '.join(esc(c) for c in r) + ' |' for r in filas]) + '\n'
def cuenta(it):
    return collections.Counter(it)
def fmt(c, orden=None):
    ks = orden or sorted(c, key=lambda k: (-c[k], k))
    return ' · '.join('%s %d' % (k, c[k]) for k in ks if c.get(k)) or '—'
def existe(rel): return os.path.exists(P(rel))

# ---------------------------------------------------------------- vocabulario
ATLAS_A_ESTADO = {'CODEX_OK': 'hecho', 'FALTA_ANIMACION': 'parcial', 'ARTE_VIEJO': 'arte_viejo', 'HUERFANO': 'sin_verificar'}
RUNWAY_A_ESTADO = {'hecho_integrado': 'hecho', 'hecho_sin_integrar': 'hecho_sin_integrar', 'rechazado': 'rechazado', 'pendiente': 'falta', 'bloqueado': 'bloqueado', 'sin_verificar': 'sin_verificar'}
BLOQUE_A_ESTADO = {'INTEGRADO_MAIN': 'hecho', 'PENDIENTE': 'falta', 'EN_CORRECCION': 'parcial', 'BLOQUEADO_DECISION': 'bloqueado', 'SEGUIMIENTO': 'sin_verificar'}

# Campeones cuyo hueco NO es falta de arte sino despacho de dibujo en el código (verificado contra el motor y capturas;
# ver docs/beta-release/ART_CREDITS.md «Libertador: revision…» y «Nigromante e Ilkan: revision…»; un agente implementa el cambio, retrocompatible).
CODIGO = {
    'nigromante': ('Su definitiva YA tiene cuadros 32-35 propios, pero `nigromante.js` pone `nigroDemonForm` y el motor dibuja siempre la forma Demonio/Coloso encima (`drawNigromanteReal` no llega a ejecutarse).',
                   'js/champions/nigromante.js', 0, 'Nada: el arte ya existe (cuadros 32-35); basta con que el despacho lo muestre.'),
    'ilkan': ('El ataque se dibuja SIEMPRE con `attack_side` espejado (`drawIlkan`); `attack_down`/`attack_up` no se leen nunca. La definitiva es `invoke` (cuadros 58-61, propios) y luego el Coloso.',
              'js/champions/ilkan.js', 2 * HOJA_GPT, '2 hojas de 4 poses: ataque de frente y ataque de espaldas (%d c).' % (2 * HOJA_GPT)),
    'libertador': ('`ult_cast` se dibuja con `prog` fijo en 0 (un solo cuadro durante `castMs`) y el ataque usa el set `fire` de perfil en toda dirección; la muerte NO falta (`v2/death.png`).',
                   'js/champions/libertador.js', HOJA_GPT, '1 hoja de 4 poses: definitiva (%d c).' % HOJA_GPT),
}

# ---------------------------------------------------------------- datos de enemigos (JSON versionado)
def compactar_cobertura(src):
    d = json.load(open(src, encoding='utf-8'))
    atlas = load('docs/art/ATLAS_ARTE.json')
    res = [{'t': r['t'], 'arena': r['arena'], 'rank': r['rank'], 'name': r['name'], 'alias': r.get('alias'), 'src': r['src'],
            'walkFrames': r.get('walkFrames'), 'smooth': bool(r.get('smooth')), 'hRatio': r.get('hRatio')} for r in d['results']]
    res.sort(key=lambda r: r['t'])
    out = {'_leyenda': 'Salida compacta de `node tools/art/enemy_coverage.js` (la mide el motor con un navegador). Regenerar: `python3 tools/art/art-checklist.py enemigos`. '
                       'Etiquetas por estado: real = cuadro propio del atlas; real+espejo = el de la otra dirección dado vuelta; real+clon(x) = reutiliza el cuadro de otro estado (x); '
                       'real+sin-giro = no gira; formas/propio/escenario = lo dibuja el código o la arena.',
           'atlas_hash': atlas['sources']['hash'], 'tipos': len(res), 'results': res}
    with open(COV, 'w', encoding='utf-8') as f: json.dump(out, f, ensure_ascii=False, indent=1, sort_keys=True); f.write('\n')
    print('escrito', os.path.relpath(COV, ROOT), '(%d tipos)' % len(res))

def regenerar_cobertura(arg):
    if arg:
        compactar_cobertura(arg); return
    import tempfile
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(['node', P('tools/art/enemy_coverage.js'), td], check=True, cwd=ROOT)
        compactar_cobertura(os.path.join(td, 'coverage.json'))

def clase_estado(lbl):
    """R real propio · E espejo · C clon de otro estado · G sin giro · P lo dibuja el código · X lo dibuja la arena."""
    if lbl.startswith('real'):
        if '+clon' in lbl: return 'C'
        if '+espejo' in lbl: return 'E'
        if '+sin-giro' in lbl: return 'G'
        return 'R'
    if lbl.startswith('formas'): return 'C' if '+clon' in lbl else ('G' if 'sin-gir' in lbl else 'P')
    if lbl.startswith('propio'): return 'P'
    return 'X'

# ---------------------------------------------------------------- render
def render():
    A = load('docs/art/ATLAS_ARTE.json'); R = load('docs/art-brief/runway-pack/estado-runway.json'); B = load('docs/production/asset-blocks.json')
    ST = load('docs/art-brief/runway-pack/estado-campeones.json')
    cov = load('docs/art-brief/enemy-coverage.json') if os.path.exists(COV) else None
    cc = mod('champ_checklist', 'tools/art/champ-checklist.py'); pr = mod('pose_ref', 'tools/art/pose-ref.py')
    status_md = text('docs/beta-release/STATUS.md'); decl = text('docs/steam/DECLARACION_IA.md'); creditos = text('docs/beta-release/ART_CREDITS.md')
    ent = R['entradas']; byid = {e['id']: e for e in ent}
    champs = A['champions']; enem = A['enemies']
    L = []; add = L.append

    # ---- clasificación de campeones (cuerpo base)
    clasif = {}; filas_b = []
    laminas_faltan = sorted(e['id'].replace('lamina_', '') for e in ent if e['categoria'] == 'lamina_campeon' and e['estado'] == 'pendiente')
    for c, v in champs.items():
        r = pr.find(c); e = cc.estados(r[1]) if r else None
        gaps = v['gaps']; reg = None if e is None else (e[0], e[1])
        if c in CODIGO: k = 'codigo_en_curso'
        elif v['status'] == 'ARTE_VIEJO': k = 'arte_viejo'
        elif reg and (reg[0] or reg[1]): k = 'hueco_registro'
        elif gaps: k = 'parcial_idle'
        else: k = 'completo'
        clasif[c] = k
        mf = v['minFrames']
        medido = 'idle %d · walk %d · atk %d · cast %d · ult %d · hit %d · death %d' % tuple(mf[s] for s in ('idle', 'walk', 'attack', 'cast', 'ultimate', 'hit', 'death'))
        regtxt = 'sin sets declarados (layout estándar; solo vale lo medido)' if e is None else ('completo' if not (e[0] or e[1]) else '; '.join(([('faltan ' + ','.join(e[0]))] if e[0] else []) + ([('repetidos ' + ','.join(e[1]))] if e[1] else [])))
        filas_b.append((c, ATLAS_A_ESTADO[v['status']], {'completo': 'estados propios completos', 'parcial_idle': 'completo salvo idle de 1 cuadro', 'hueco_registro': 'hueco de registro (verificar contra el motor)',
                                                         'arte_viejo': 'cuerpo pre-Códice', 'codigo_en_curso': 'depende de código (en curso)'}[k], medido, regtxt))
    cb = cuenta(clasif.values())
    sk = [(c, s) for c, v in champs.items() for s in v['skins']]
    sk_kind = cuenta(s['kind'] for _, s in sk)
    sk_stat = cuenta(ATLAS_A_ESTADO[s['status']] for _, s in sk)
    bosses = {k: v for k, v in enem.items() if v['category'] == 'boss'}; norm = {k: v for k, v in enem.items() if v['category'] == 'enemy'}
    bz = {g['id']: g for g in B['groups']}
    bl_g = collections.defaultdict(collections.Counter)
    for b in B['blocks']: bl_g[b['group']][BLOQUE_A_ESTADO[b['state']]] += 1
    rcat = collections.defaultdict(collections.Counter)
    for e in ent: rcat[e['categoria']][RUNWAY_A_ESTADO[e['estado']]] += 1
    mundo_cats = ['piso_arena', 'centro_arena', 'fachada', 'prop_mundo']
    arena_files = [f for f in A['files'] if f['category'] == 'arenas']

    # ---- cobertura de enemigos
    cov_by = {}
    if cov:
        cov_by = {r['t']: r for r in cov['results']}
    sin_atk = []; sin_death = []
    for t, r in sorted(cov_by.items()):
        s = r['src']
        if clase_estado(s['attack']) not in ('R', 'X') : sin_atk.append(t)
        if clase_estado(s['death']) not in ('R', 'P', 'X'): sin_death.append(t)

    # ================= cabecera
    add('# Checklist de TODO el arte: qué está hecho, qué falta y qué sigue\n')
    add('> Generado por `tools/art/art-checklist.py` desde las fuentes reales del repo (lista al final de la sección A). **No se edita a mano: se regenera** (`python3 tools/art/art-checklist.py`; `--check` lo corre `tools/art/test-runway-pack.py`). Regla: ANTES de generar o pintar algo, buscarlo acá y en el registro de su categoría; al terminar, actualizar el registro (`runway-ledger.py`, `champ-checklist.py`, `build-art-atlas.js`) y regenerar este archivo.\n')
    add('**Vocabulario de estados (fijo):** `hecho` (integrado y medido) · `parcial` (existe pero un ciclo sale con 1 cuadro o falta un estado) · `arte_viejo` (el juego dibuja arte anterior al Códice) · `falta` (no existe) · `hecho_sin_integrar` (generado/aceptado, ningún código lo carga) · `rechazado` (probado y descartado: no repetir igual) · `bloqueado` (espera algo externo o una decisión) · `codigo_en_curso` (el hueco es del código, no del arte; hay un cambio en marcha) · `sin_verificar` (no se pudo comprobar: se dice el motivo).\n')
    add('**Aviso sobre «estados que faltan».** La columna «Estados que faltan o están repetidos» de `runway-pack/CHECKLIST_CAMPEONES.md` mide **solo los `sets` del registro del atlas**, no lo que el motor dibuja. Varios «faltantes» (Nigromante, Ilkan, Libertador) NO son falta de arte sino despacho de dibujo en el código: **no pedir arte que el motor no dibujaría**; primero se confirma con captura del motor (`tools/art/capture-champion-states.js`). Detalle en la sección B.\n')

    # ================= A
    add('## A) Resumen\n')
    filas = []
    filas.append(('Campeones (cuerpo base)', len(champs), fmt(cuenta(ATLAS_A_ESTADO[v['status']] for v in champs.values())), 'ATLAS_ARTE.json (medido en el motor)'))
    filas.append(('Skins, cromas y formas de Ascensión', len(sk), fmt(sk_stat), 'ATLAS_ARTE.json'))
    filas.append(('Jefes y subjefes', len(bosses), fmt(cuenta(ATLAS_A_ESTADO[v['status']] for v in bosses.values())), 'ATLAS_ARTE.json'))
    filas.append(('Enemigos (normales, subélites, élites)', len(norm), fmt(cuenta(ATLAS_A_ESTADO[v['status']] for v in norm.values())), 'ATLAS_ARTE.json + enemy-coverage.json'))
    mundo_e = [e for e in ent if e['categoria'] in mundo_cats]
    filas.append(('Mundo: pisos, centros, fachadas, props (trabajos Runway)', len(mundo_e), fmt(cuenta(RUNWAY_A_ESTADO[e['estado']] for e in mundo_e)), 'estado-runway.json'))
    filas.append(('Mundo: archivos de arenas cargados por el motor', len(arena_files), fmt(cuenta(ATLAS_A_ESTADO[f['status']].replace('sin_verificar', 'huerfano') for f in arena_files)), 'ATLAS_ARTE.json (files)'))
    filas.append(('Mundo: cola de producción (bloques 03-mundo)', bz['03-mundo']['blocks'], fmt(bl_g['03-mundo']), 'asset-blocks.json'))
    filas.append(('Efectos y habilidades (bloques 02-combate)', bz['02-combate']['blocks'], fmt(bl_g['02-combate']), 'asset-blocks.json (cola); lo integrado: sin_verificar'))
    filas.append(('Interfaz, HUD e íconos (bloques 04-interfaz)', bz['04-interfaz']['blocks'], fmt(bl_g['04-interfaz']), 'asset-blocks.json (cola); lo integrado: sin_verificar'))
    filas.append(('Cosméticos (bloques 05-cosmeticos)', bz['05-cosmeticos']['blocks'], fmt(bl_g['05-cosmeticos']), 'asset-blocks.json'))
    filas.append(('Láminas del Códice de campeones', len(champs), 'hecho %d · falta %d (%s)' % (len(champs) - len(laminas_faltan), len(laminas_faltan), ', '.join(laminas_faltan)), 'estado-runway.json + assets/ui/codex/champions'))
    add(tabla(['Categoría', 'Total', 'Estados', 'Fuente'], filas))
    add('**Campeones por clasificación de cuerpo (sección B):** ' + fmt(cb, ['completo', 'parcial_idle', 'hueco_registro', 'arte_viejo', 'codigo_en_curso']).replace('completo', 'estados propios completos').replace('parcial_idle', 'completo salvo idle 1 cuadro').replace('hueco_registro', 'hueco de registro').replace('codigo_en_curso', 'depende de código (en curso)') + '.\n')
    add('**Trabajo con Runway (todas las categorías):** %d entradas · %s · créditos registrados: %d.\n' % (len(ent), fmt(cuenta(RUNWAY_A_ESTADO[e['estado']] for e in ent)), sum(e.get('creditos') or 0 for e in ent)))
    sv_rows = [('Interfaz / HUD / íconos: qué está realmente integrado', 'No hay un auditor del motor para UI como el de ATLAS_ARTE (campeones/enemigos). `asset-blocks.json` mide la cola, no lo integrado; `estado-runway.json` solo registra 2 retratos/HUD. Hay que auditarlo antes de afirmar cobertura.'),
               ('Efectos (FX) y íconos de habilidades por campeón', '`manifiestos/campeones_faltantes.json` los marca `BLOQUEADO_SIN_HOOK` (la auditoría del 18-oct no encontró dónde engancharlos); sin auditoría posterior del motor.'),
               ('Idle de 1 cuadro (%d campeones)' % sum(1 for v in champs.values() if 'idle' in v['gaps']), 'ATLAS_ARTE lo mide como brecha, pero no se verificó si el motor ya anima el reposo por código (balanceo): no pedir hojas de idle sin esa comprobación.'),
               ('Aprobación de arte humana de lo instalado', 'Ningún archivo registra una aprobación humana; STATUS.md la declara «pendiente» (Ynara lanzar/definitiva, Cazadora y Musashi definitiva).'),
               ('Saldo de créditos de Runway actual', 'Solo hay la cifra escrita en STATUS.md (no se llamó a Runway); la cuenta es compartida y baja por consumo ajeno. Correr `node tools/art-world/runway-world.js status` (no gasta) antes de planificar.')]
    if cov is None: sv_rows.insert(0, ('Enemigos: cobertura por estado', 'Falta docs/art-brief/enemy-coverage.json: correr `python3 tools/art/art-checklist.py enemigos`.'))
    add('**Categorías o datos `sin_verificar` (y por qué):**\n')
    add(tabla(['Qué', 'Motivo'], sv_rows))
    add('**Fuentes leídas:** `docs/art/ATLAS_ARTE.json` (huella `%s`, %d archivos), `runway-pack/estado-campeones.json`, `runway-pack/estado-runway.json` (auditado %s), `docs/production/asset-blocks.json`, `docs/art-brief/enemy-coverage.json`%s, `docs/beta-release/STATUS.md`, `ART_CREDITS.md`, `docs/steam/DECLARACION_IA.md`.\n' % (A['sources']['hash'][:12], A['sources']['files'], R['auditado'], '' if not cov else ' (medido contra el atlas `%s`%s)' % (cov['atlas_hash'][:12], '' if cov['atlas_hash'] == A['sources']['hash'] else ' — **DESACTUALIZADO respecto de ATLAS_ARTE: regenerar con `python3 tools/art/art-checklist.py enemigos`**')))

    # ================= B
    add('## B) Campeones (cuerpo base)\n')
    add('Detalle por campeón (láminas, atlas actual, auditoría vieja, skins y lo probado con Runway): **[`runway-pack/CHECKLIST_CAMPEONES.md`](runway-pack/CHECKLIST_CAMPEONES.md)**; medición del motor: [`docs/art/ATLAS_ARTE.md`](../art/ATLAS_ARTE.md). Antes de generar algo de un campeón se lee su fila y sus «intentos descartados».\n')
    add('- Con todos los estados propios (medidos y en registro): **%d**. Completos salvo idle de 1 cuadro: **%d**. Huecos de registro a verificar: **%d**. Cuerpo pre-Códice: **%d**. Dependen de código (en curso): **%d**.' % (cb['completo'], cb['parcial_idle'], cb['hueco_registro'], cb['arte_viejo'], cb['codigo_en_curso']))
    add('- Láminas del Códice que faltan: %s (`estado-runway.json`: pendientes; sin lámina no hay referencia para el cuerpo).' % (', '.join(laminas_faltan) or 'ninguna'))
    add('- **Dependen de código, no de arte (`codigo_en_curso`):** otro agente implementa cambios de despacho retrocompatibles en `js/champions/{ilkan,libertador,nigromante}.js` y `js/rendering`. Hasta que aterricen, no se genera arte para ellos.\n')
    filas = []
    for c, (why, f, costo, habilita) in sorted(CODIGO.items()):
        filas.append((c, 'codigo_en_curso', why, f + (' (existe)' if existe(f) else ' (NO ENCONTRADO)'), habilita))
    add(tabla(['Campeón', 'Estado', 'Qué pasa de verdad (verificado contra el motor)', 'Archivo a cambiar', 'Arte nuevo que habilita después'], filas))
    add('Costo de las hojas = %d c por hoja de 4 poses (`gpt_image_2`). Fuente: `ART_CREDITS.md` «Libertador: revision…» y «Nigromante e Ilkan: revision…»%s.\n' % (HOJA_GPT, '' if 'Nigromante e Ilkan: revision' in creditos else ' — **ENCABEZADO NO ENCONTRADO**'))
    add('**Todos los campeones** (estado = ATLAS_ARTE; «medido» = cuadros distintos mínimos entre las 4 direcciones; «registro» = lo que dice el set del atlas, que **no** equivale a lo que el motor dibuja):\n')
    add(tabla(['Campeón', 'Estado', 'Clasificación', 'Medido en el motor', 'Registro (sets)'], filas_b))

    # ================= C
    add('## C) Skins, cromas y formas de Ascensión\n')
    add('Fuente: `ATLAS_ARTE.json` → `champions.<id>.skins`. `croma` = **recolor** del cuerpo base (el atlas lo declara así: mismo dibujo, otra paleta); `set` = apariencia con **atlas propio**; `asc` = forma de Ascensión (atlas propio). Totales: %s. Estados: %s.\n' % (fmt(sk_kind), fmt(sk_stat)))
    filas = []
    for k in ('set', 'asc', 'croma'):
        xs = [s for _, s in sk if s['kind'] == k]
        sc = lambda g: sum(1 for s in xs if g in s['gaps'] or s['minFrames'].get(g, 9) <= 1)
        filas.append((k, {'set': 'atlas propio', 'asc': 'atlas propio (forma)', 'croma': 'recolor'}[k], len(xs), fmt(cuenta(ATLAS_A_ESTADO[s['status']] for s in xs)),
                      sum(1 for s in xs if s['minFrames'].get('cast', 9) <= 1), sum(1 for s in xs if s['minFrames'].get('ultimate', 9) <= 1), sum(1 for s in xs if s['minFrames'].get('attack', 9) <= 1)))
    add(tabla(['Tipo', 'Origen del arte', 'Cantidad', 'Estados', 'Cast de 1 cuadro', 'Definitiva de 1 cuadro', 'Ataque de 1 cuadro'], filas))
    add('Por campeón (solo se listan las apariencias; entre paréntesis el estado; `!` = algún ciclo de lanzar/definitiva/ataque con 1 cuadro; el detalle de cuadros está en `ATLAS_ARTE.md`):\n')
    filas = []
    for c, v in champs.items():
        if not v['skins']: continue
        def one(s):
            bad = any(s['minFrames'].get(g, 9) <= 1 for g in ('attack', 'cast', 'ultimate'))
            return '%s (%s)%s' % (s['id'], ATLAS_A_ESTADO[s['status']], ' !' if bad else '')
        filas.append((c, ', '.join(one(s) for s in v['skins'] if s['kind'] == 'set') or '—', ', '.join(one(s) for s in v['skins'] if s['kind'] == 'asc') or '—', ', '.join(one(s) for s in v['skins'] if s['kind'] == 'croma') or '—'))
    add(tabla(['Campeón', 'Sets (arte propio)', 'Ascensión (forma)', 'Cromas (recolor)'], filas))
    nuevas = [r for r in load('docs/art-brief/manifiestos/campeones_faltantes.json')['assets'] if r['tipo'] in ('skin', 'forma')]
    add('Auditoría vieja (`manifiestos/campeones_faltantes.json`, 2026-10-18; puede estar desactualizada): skins/formas %s. Se cita solo como historial; manda el atlas medido.\n' % fmt(cuenta('%s %s' % (r['tipo'], r['estado'].lower()) for r in nuevas)))

    # ================= D
    add('## D) Jefes y subjefes\n')
    add('Fuente: `ATLAS_ARTE.json` (`category: boss`) y `enemy-coverage.json`. Cuadros distintos: idle / caminar / ataque / muerte. «Ataque» y «muerte» en la última columna = arte real propio (R), clon de otro estado (C) o lo dibuja el código/la arena (P/X).\n')
    filas = []
    for t, v in sorted(bosses.items(), key=lambda kv: (kv[1]['rank'], kv[0])):
        f = v.get('frames') or {}
        cvr = cov_by.get(t); at = clase_estado(cvr['src']['attack']) if cvr else '?'; de = clase_estado(cvr['src']['death']) if cvr else '?'
        filas.append((t, v['rank'], v['arena'], ATLAS_A_ESTADO[v['status']], f.get('idle', '—'), f.get('walk', '—'), f.get('attack', '—'), f.get('death', '—'), '%s / %s' % (at, de)))
    add(tabla(['Jefe', 'Rango', 'Arena', 'Estado', 'idle', 'walk', 'atk', 'death', 'ataque / muerte'], filas))
    jr = [e for e in ent if e['categoria'] == 'jefe']
    add('Intentos con Runway en jefes (`estado-runway.json`): %s. Rechazados (no repetir igual): %s.\n' % (fmt(cuenta(RUNWAY_A_ESTADO[e['estado']] for e in jr)), ', '.join('`%s`' % e['id'] for e in jr if e['estado'] == 'rechazado') or '—'))
    add('Resumen: %s. Con 1 cuadro de ataque o muerte (brecha real): %s.\n' % (fmt(cuenta(ATLAS_A_ESTADO[v['status']] for v in bosses.values())), ', '.join('`%s`' % t for t, v in sorted(bosses.items()) if (v.get('frames') or {}).get('attack', 9) <= 1 or (v.get('frames') or {}).get('death', 9) <= 1) or '—'))

    # ================= E
    add('## E) Enemigos (104 criaturas medidas en el motor: normales, subélites, élites, subjefes y jefes)\n'.replace('104', str(len(cov_by) or len(enem))))
    if not cov:
        add('`sin_verificar`: falta `docs/art-brief/enemy-coverage.json` (correr `python3 tools/art/art-checklist.py enemigos`).\n')
    else:
        add('Medición del motor (`tools/art/enemy_coverage.js`: arma la entidad con el código del juego y mira qué dibuja en cada estado). Código por estado: **R** arte real propio · **E** espejo del cuadro de la otra dirección (normal para caminar a la izquierda) · **C** clon (reutiliza el cuadro de otro estado) · **G** sin giro · **P** lo dibuja el código · **X** lo dibuja la arena. Columnas: `caminar` = der/izq/abajo/arriba; `ataque` = perfil + frente + espalda; `golpe` = perfil + frente; `muerte`. Que el ataque de frente/espalda sea C (clon del de perfil) es lo normal del motor; lo grave es que el ataque de **perfil** o la muerte sean clon de «caminar».\n')
        orden = ['normal', 'subelite', 'elite', 'subjefe', 'jefe']
        def code(r, ks): return ''.join(clase_estado(r['src'][k]) for k in ks)
        filas = []
        for t, r in sorted(cov_by.items(), key=lambda kv: (orden.index(kv[1]['rank']), kv[1]['arena'], kv[0])):
            s = r['src']; atl = enem.get(t)
            flag = []
            if t in sin_atk: flag.append('SIN ARTE PROPIO DE ATAQUE')
            if t in sin_death: flag.append('SIN ARTE PROPIO DE MUERTE')
            if r['smooth']: flag.append('escalado suavizado')
            filas.append((t, r['rank'], r['arena'], ATLAS_A_ESTADO[atl['status']] if atl else 'sin_verificar', code(r, ['idle']), code(r, ['walk_R', 'walk_L', 'walk_D', 'walk_U']), code(r, ['attack', 'attack_D', 'attack_U']), code(r, ['hit', 'hit_D']), code(r, ['death']), '; '.join(flag) or '—'))
        add(tabla(['Criatura', 'Rango', 'Arena', 'Estado atlas', 'idle', 'caminar', 'ataque', 'golpe', 'muerte', 'Alertas'], filas))
        nat = cuenta(clase_estado(r['src']['attack']) for r in cov_by.values()); nde = cuenta(clase_estado(r['src']['death']) for r in cov_by.values())
        add('**Resumen.** Ataque de perfil: %s. Muerte: %s.\n' % (fmt(nat), fmt(nde)))
        add('**Sin arte propio de ataque (clonan «caminar» o lo arma el código), %d:** %s.\n' % (len(sin_atk), ', '.join('`%s`' % t for t in sin_atk) or '—'))
        add('**Sin arte propio de muerte (clonan «caminar» o lo arma el código), %d:** %s.\n' % (len(sin_death), ', '.join('`%s`' % t for t in sin_death) or '—'))
        both = sorted(set(sin_atk) & set(sin_death))
        add('**Con ambos huecos (prioridad de hoja nueva), %d:** %s.\n' % (len(both), ', '.join('`%s`' % t for t in both) or '—'))
        en_r = [e for e in ent if e['categoria'] == 'enemigo_hoja']
        add('Intentos con Runway en hojas de enemigos (`estado-runway.json`): %s. Los rechazados (no repetir igual): %s.\n' % (fmt(cuenta(RUNWAY_A_ESTADO[e['estado']] for e in en_r)), ', '.join('`%s`' % e['id'] for e in en_r if e['estado'] == 'rechazado') or '—'))

    # ================= F
    add('## F) Mundo: pisos, centros, fachadas, props y arenas\n')
    add('Fuentes: `estado-runway.json` (lo hecho/probado, manda sobre `runway-world.js list`, que no es fiable), `ATLAS_ARTE.json` (archivos que carga el motor por arena) y `asset-blocks.json` (cola).\n')
    filas = [(c, sum(rcat[c].values()), fmt(rcat[c])) for c in mundo_cats + ['lamina_campeon', 'retrato']]
    add(tabla(['Categoría Runway', 'Entradas', 'Estados'], [f for f in filas if f[1]]))
    filas = [(e['id'], e['categoria'], RUNWAY_A_ESTADO[e['estado']], e.get('creditos') or '—', (e.get('siguiente_paso') or e.get('por_que') or '')[:150]) for e in ent if e['categoria'] in mundo_cats]
    add(tabla(['Id', 'Categoría', 'Estado', 'Créditos gastados', 'Siguiente paso / nota'], filas))
    por_arena = collections.defaultdict(collections.Counter)
    for f in arena_files: por_arena[f['file'].split('/')[3]][ATLAS_A_ESTADO[f['status']].replace('sin_verificar', 'huerfano')] += 1
    add('**Archivos de arte por arena que carga el motor** (`assets/sprites/arenas/<arena>/…`; atlas de criaturas/props de la arena):\n')
    add(tabla(['Arena', 'Archivos', 'Estados'], [(a, sum(c.values()), fmt(c)) for a, c in sorted(por_arena.items())]))
    bt = [f for f in A['files'] if f['category'] == 'battlefield']
    add('Battlefield (campo de batalla): %d archivos, %s.\n' % (len(bt), fmt(cuenta(ATLAS_A_ESTADO[f['status']] for f in bt))))
    add('**Cola de producción del mundo** (`asset-blocks.json`, grupo `03-mundo`): %d bloques (%s), %d tareas pendientes. La cola cuenta kits y puede solaparse con las entradas de arriba (\"Tasks are not individual PNGs\"). Bloque activo: `%s`; siguientes: %s.\n' % (bz['03-mundo']['blocks'], fmt(bl_g['03-mundo']), bz['03-mundo']['pendingTasks'], B['active'], ', '.join('`%s`' % x for x in B['next'])))
    add('Lista de faltantes del mundo para producción: [`ASSETS_FALTANTES_MUNDO.md`](ASSETS_FALTANTES_MUNDO.md)%s.\n' % ('' if existe('docs/art-brief/ASSETS_FALTANTES_MUNDO.md') else ' (**NO EXISTE**)'))

    # ================= G
    add('## G) Interfaz, HUD, íconos y FX\n')
    add('`sin_verificar` en cuanto a **qué está integrado en el juego**: no existe un auditor del motor para esta categoría (el equivalente de `build-art-atlas.js` cubre campeones, enemigos, jefes y arenas). Lo que sí consta en el repo:\n')
    ia = [e for e in ent if e['categoria'] in ('retrato', 'otro')]
    add(tabla(['Fuente', 'Dato verificable'], [
        ('`asset-blocks.json` grupo `04-interfaz`', '%d bloques (%s), %d tareas pendientes. `bloqueado` = BLOQUEADO_DECISION: espera una decisión, no arte.' % (bz['04-interfaz']['blocks'], fmt(bl_g['04-interfaz']), bz['04-interfaz']['pendingTasks'])),
        ('`asset-blocks.json` grupo `02-combate` (efectos y habilidades)', '%d bloques (%s), %d tareas pendientes.' % (bz['02-combate']['blocks'], fmt(bl_g['02-combate']), bz['02-combate']['pendingTasks'])),
        ('`manifiestos/campeones_faltantes.json` (2026-10-18)', 'fx: %d · íconos: %d, todos `BLOQUEADO_SIN_HOOK` (no había dónde engancharlos). Puede estar vieja.' % tuple(sum(1 for r in load('docs/art-brief/manifiestos/campeones_faltantes.json')['assets'] if r['tipo'] == t) for t in ('fx', 'iconos'))),
        ('Archivos de interfaz en `assets/ui/`', '%d íconos de habilidades (`assets/ui/skill-icons`), %d láminas del Códice de campeones (`assets/ui/codex/champions`). Existencia de archivos; no prueba que el motor los use todos.' % (len(os.listdir(P('assets/ui/skill-icons'))) if existe('assets/ui/skill-icons') else 0, len([x for x in os.listdir(P('assets/ui/codex/champions'))]) if existe('assets/ui/codex/champions') else 0)),
        ('`estado-runway.json` (retratos/otros)', '; '.join('`%s` %s' % (e['id'], RUNWAY_A_ESTADO[e['estado']]) for e in ia) or '—')]))
    add('Para saber qué UI está pintada de verdad hace falta una auditoría del motor (capturas por pantalla); hasta entonces no afirmar cobertura. Detalle por bloque: `docs/art-brief/runway-pack/bloques/04-interfaz.md` y `02-combate.md`.\n')

    # ================= H
    add('## H) Cómo se hace cada cosa\n')
    links = ['docs/art-brief/runway-pack/RECETA.md', 'docs/art-brief/runway-pack/REGISTRO_RUNWAY.md', 'docs/art-brief/runway-pack/COSTOS.md', 'docs/art-brief/runway-pack/ENEMIGOS_GUIA.md', 'docs/art-brief/runway-pack/POSES_CAMPEON.md',
             'docs/art-brief/runway-pack/CHECKLIST_CAMPEONES.md', 'docs/beta-release/STATUS.md', 'docs/beta-release/ART_CREDITS.md', 'docs/production/PAINTER.md', 'docs/steam/DECLARACION_IA.md', 'docs/art-brief/00_ESPECIFICACION_TECNICA.md']
    for l in links:
        if not existe(l): add('> **ENLACE ROTO:** `%s` no existe.\n' % l)
    add(tabla(['Tipo', 'Cómo se hace (método medido)', 'Dónde leer'], [
        ('Campeón (poses de un estado)', 'Hoja de 4 poses con `gpt_image_2` (%d c por hoja, ~1 hoja por estado) sobre verde croma, con la lámina limpia del Códice como referencia (`runway-design.js … --model gpt_image_2`) → `tools/art/sheet-to-cells.py` (croma → celdas a la escala del campeón) → `tools/art/atlas-append-cells.py` → registro/meta del campeón → capturas del motor antes/después → comprobaciones derivadas del atlas (lista en STATUS.md: `imageSize` de Crystal Wars, `visual-package build/check`, `build-art-atlas.js` + `--check`, `roster_gate.js`, `webp_convert.py --check`, `check-<campeón>-*`). **`gen4_image` (%d c) NO sirve para poses** y el video `gen4_turbo` tampoco superó al atlas actual.' % (HOJA_GPT, IMG_GEN4), '[RECETA.md](runway-pack/RECETA.md) §1/§4, [STATUS.md](../beta-release/STATUS.md), [CHECKLIST_CAMPEONES.md](runway-pack/CHECKLIST_CAMPEONES.md)'),
        ('Antes de pedir arte a un campeón', 'Comprobar con captura del motor que el estado se dibuja de verdad (no es despacho de código). Ver sección B.', '[ART_CREDITS.md](../beta-release/ART_CREDITS.md)'),
        ('Mundo (pisos, centros, fachadas, props)', '`tools/art-world/runway-world.js` (gen4_image, %d c por imagen) → croma/BOX/alfa binario con el pintor determinista (p. ej. `build-centro-arena.py`) → cargar en el código de la arena con respaldo. Resultados: 5 de 6 pisos aceptados; el piso de Abismo se rechazó (marco y diagonal): no repetir igual. `runway-world.js list` NO es fiable: manda el registro.' % IMG_GEN4, '[REGISTRO_RUNWAY.md](runway-pack/REGISTRO_RUNWAY.md), [RECETA.md](runway-pack/RECETA.md)'),
        ('Enemigos y jefes', 'Hoja 1280x720 con `gen_sheet.py <arena> <id>` (~%d c) → `install.py` → `walk_batch.py` → `scan_sprites.py`; sin atlas propio, «Paso 0» con `runway-design.js`. El pintor procedural para enemigos viejos se DESCARTÓ (ver ART_CREDITS). Medir antes y después con `node tools/art/enemy_coverage.js` y no repetir los intentos rechazados del registro.' % HOJA_ENEMIGO, '[ENEMIGOS_GUIA.md](runway-pack/ENEMIGOS_GUIA.md), [REGISTRO_RUNWAY.md](runway-pack/REGISTRO_RUNWAY.md), [PAINTER.md](../production/PAINTER.md)'),
        ('Skins y cromas', 'Cromas = recolor determinista del cuerpo base (0 créditos). Sets con arte propio = mismo flujo que un campeón. Las skins son cosméticas: no alteran estadísticas (AGENTS.md, regla 6).', '[RECETA.md](runway-pack/RECETA.md) §9, `docs/ART_BIBLE.md`'),
        ('Láminas del Códice', 'Existentes: hechas con ChatGPT (según el dueño; declarar en Steam). Las que faltan: `runway-design.js <id> codex1` (gen4_image, %d c, 1 intento + 1 de reserva).' % IMG_GEN4, '[REGISTRO_RUNWAY.md](runway-pack/REGISTRO_RUNWAY.md) (`lamina_*`), [DECLARACION_IA.md](../steam/DECLARACION_IA.md)'),
        ('Interfaz / HUD / íconos', 'Sin método medido ni auditor del motor (`sin_verificar`). Los bloques 04-interfaz llevan su descripción y prompt en el paquete.', '`runway-pack/bloques/04-interfaz.md`, [asset-blocks.json](../production/asset-blocks.json)'),
        ('Registrar y no repetir', 'Cada trabajo con Runway se anota el mismo día: `python3 tools/art/runway-ledger.py set|add …`; campeones: `champ-checklist.py set|descartado`; atlas: `node tools/art/build-art-atlas.js`; enemigos: `python3 tools/art/art-checklist.py enemigos`; luego regenerar este archivo.', '[REGISTRO_RUNWAY.md](runway-pack/REGISTRO_RUNWAY.md)'),
        ('Aprobación y declaración', 'Todo lo generado entra como candidato: la aprobación de arte es humana (`style_gate`/visual gate no la reemplazan). Lo generado con IA se declara en Steam.', '[DECLARACION_IA.md](../steam/DECLARACION_IA.md), `docs/production/PRODUCTION_BIBLES.md`')]))

    # ================= I
    add('## I) Próximos pasos (ordenados por valor / costo)\n')
    add('**Criterio:** `puntaje = valor × 10 / (costo + 10)`; el valor (1-5) es el de `estado-runway.json` cuando la entrada lo tiene y, si no, criterio del auditor (marcado `a`). **Costo en créditos de Runway**: `gpt_image_2` = %d c por hoja de 4 poses (~1 hoja por estado); `gen4_image` = %d c por imagen (no sirve para poses); hoja de enemigo = ~%d c. Los costos «est.» son estimaciones, no medidas. Clases: **arte (Runway)** · **arte sin créditos (pintor determinista/recolor)** · **requiere cambio de código (en curso)** · **requiere decisión/aprobación humana**.\n' % (HOJA_GPT, IMG_GEN4, HOJA_ENEMIGO))
    g = lambda i, k, d=0: (byid.get(i) or {}).get(k) or d
    viejos = sorted(c for c, k in clasif.items() if k == 'arte_viejo')
    jefes_faltan = sorted(t for t, v in bosses.items() if v['status'] == 'FALTA_ANIMACION')
    n_idle = sum(1 for v in champs.values() if 'idle' in v['gaps'])
    n_ui_dec = sum(1 for b in B['blocks'] if b['group'] == '04-interfaz' and b['state'] == 'BLOQUEADO_DECISION')
    n_huer = sum(1 for f in A['files'] if f['status'] == 'HUERFANO')
    suma = lambda ids, k='costo_estimado': sum(g(i, k) for i in ids)
    pend = lambda cat: [e['id'] for e in ent if e['categoria'] == cat and e['estado'] == 'pendiente']
    props = [i for i in pend('prop_mundo')]; fach = ['prox_fachadas_ciudad_t06']; bk = ['prox_piso_bosque', 'prox_centro_bosque', 'prox_piso_hielo', 'prox_centro_hielo']
    humana_ok = 'aprobación de arte humana pendiente' in status_md.lower() or 'aprobación de arte humana pendiente' in decl.lower()
    TERM = 'confirmar los términos' in decl.lower().replace('\n', ' ') or 'confirmar que los términos' in decl.lower()
    P_ = [  # (id, paso, clase, costo, valor, a?, nota)
        ('integrar-casa-a', 'Integrar la fachada `casa_a` (ya pagada y aceptada) con el pintor determinista: recorte croma, BOX a escala nativa, cargar en `cm-render.js` con respaldo.', 'arte sin créditos', 0, g('prox_integrar_casa_a', 'valor', 4), '', 'ya pagada (%s c); entrada `prox_integrar_casa_a`' % g('casa_a', 'creditos', '?')),
        ('integrar-tanque-lanzar', 'Integrar el lanzar del Tanque (candidato `gpt_image_2` aceptado, sin instalar): `sheet-to-cells.py` + `atlas-append-cells.py` + comprobaciones derivadas.', 'arte sin créditos', 0, 3, 'a', 'ya pagada (%s c); entrada `tanque_lanzar_gpt2`; queda aprobación humana' % g('tanque_lanzar_gpt2', 'creditos', '?')),
        ('nigromante-definitiva', 'Nigromante: que el despacho muestre su definitiva propia (cuadros 32-35). **No se genera arte.**', 'requiere cambio de código (en curso)', 0, 3, 'a', 'js/champions/nigromante.js; arte ya existe'),
        ('aprobar-arte-instalado', 'Revisión humana de lo instalado sin aprobar: Ynara (lanzar y definitiva), Cazadora (definitiva), Musashi (definitiva).%s' % ('' if humana_ok else ' [no se encontró el texto en STATUS/DECLARACION: sin_verificar]'), 'requiere decisión/aprobación humana', 0, 5, 'a', 'bloquea declarar «aprobado» lo ya integrado'),
        ('terminos-gpt-image-2', 'Confirmar que los términos de Runway para `gpt_image_2` permiten uso comercial y completar la declaración de IA de Steam.%s' % ('' if TERM else ' [texto no encontrado en DECLARACION_IA.md: sin_verificar]'), 'requiere decisión/aprobación humana', 0, 5, 'a', 'riesgo comercial/legal; sin esto no escalar su uso'),
        ('laminas-codex', 'Láminas del Códice que faltan (%s): referencia previa para sus cuerpos Códice.' % ', '.join(laminas_faltan), 'arte (Runway)', suma(['lamina_' + x for x in laminas_faltan]), max([g('lamina_' + x, 'valor') for x in laminas_faltan] or [3]), '', 'gen4_image, 1 intento cada una (+reserva); entradas `lamina_*`'),
        ('fachadas-ciudad', 'Fachadas de Ciudad Maldita (bloque P0 B062): pedir vista oblicua explícita (casa_b salió isométrica y se rechazó).', 'arte (Runway)', suma(fach), g('prox_fachadas_ciudad_t06', 'valor', 5), '', '`prox_fachadas_ciudad_t06`'),
        ('ilkan-ataques', 'Ilkan: 2 hojas de ataque (frente y espaldas) para cuando el despacho por dirección aterrice.', 'requiere cambio de código (en curso)', 2 * HOJA_GPT, 3, 'a', 'js/champions/ilkan.js; después arte (Runway)'),
        ('libertador-definitiva', 'Libertador: 1 hoja de definitiva (`ult_cast` animada) cuando `prog` deje de ser fijo; el ataque de frente exige además despacho por dirección del set `fire`.', 'requiere cambio de código (en curso)', HOJA_GPT, 3, 'a', 'js/champions/libertador.js; después arte (Runway)'),
        ('pisos-centros-bosque-hielo', 'Pisos y centros de Bosque y Hielo (JOBS ya definidos en `runway-world.js`); intento anterior BLOQUEADO por límite diario de tareas de la cuenta.', 'arte (Runway)', suma(bk), max(g(i, 'valor') for i in bk), '', 'entradas `prox_piso_*`/`prox_centro_*`'),
        ('props-arenas', 'Props pintados de Infernal, Hielo, Bosque y Laberinto (mismo método que estatua/farol, 2 de 2 aceptados).', 'arte (Runway)', suma(props), max(g(i, 'valor') for i in props), '', 'entradas `prox_props_*`'),
        ('hojas-fortaleza', 'Hojas de enemigos de Fortaleza (`gen_sheet.py`, 1 hoja por enemigo).', 'arte (Runway)', g('prox_hojas_fortaleza', 'costo_estimado'), g('prox_hojas_fortaleza', 'valor', 3), '', '`prox_hojas_fortaleza`'),
        ('enemigos-sin-ataque-muerte', 'Enemigos sin arte propio de ataque o muerte (lista en la sección E): una hoja por criatura (%d con algún hueco).' % len(set(sin_atk) | set(sin_death)), 'arte (Runway)', len(set(sin_atk) | set(sin_death)) * HOJA_ENEMIGO, 3, 'a', 'est. %d c por hoja; medir con enemy_coverage.js antes y después' % HOJA_ENEMIGO),
        ('jefes-falta-animacion', 'Jefes/subjefes con `FALTA_ANIMACION` (%d: %s).' % (len(jefes_faltan), ', '.join(jefes_faltan)), 'arte (Runway)', len(jefes_faltan) * HOJA_ENEMIGO, 3, 'a', 'est. %d c por hoja (`--kind bosses`)' % HOJA_ENEMIGO),
        ('piso-divina', 'Último piso procedural sin pintar (Divina).', 'arte (Runway)', g('prox_piso_divina', 'costo_estimado'), g('prox_piso_divina', 'valor', 2), '', '`prox_piso_divina`'),
        ('interfaz-decisiones', 'Resolver los %d bloques de interfaz en `BLOQUEADO_DECISION` (esperan decisión del dueño, no arte).' % n_ui_dec, 'requiere decisión/aprobación humana', 0, 3, 'a', 'asset-blocks.json grupo 04-interfaz'),
        ('skins-ynara-cast-ult', 'Skins de Ynara (%d apariencias) con lanzar y definitiva = ataque (STATUS.md%s): 1 hoja por estado y apariencia (2 estados).' % (len(champs['ynara']['skins']), '' if 'skins de Ynara' in status_md else '; texto NO encontrado: sin_verificar'), 'arte (Runway)', len(champs['ynara']['skins']) * 2 * HOJA_GPT, 2, 'a', 'est.: %d × 2 × %d c; los cromas son recolor (0 c) si se recolorea el cuerpo base ya hecho' % (len(champs['ynara']['skins']), HOJA_GPT)),
        ('huerfanos', 'Decidir qué hacer con %d archivos huérfanos (el juego ni los carga ni los referencia): archivar o borrar.' % n_huer, 'requiere decisión/aprobación humana', 0, 2, 'a', 'ATLAS_ARTE.json (HUERFANO)'),
        ('cuerpos-codex-viejos', 'Cuerpo Códice completo para campeones con arte viejo, sin Libertador (%d: %s).' % (len([c for c in viejos if c != 'libertador']), ', '.join(c for c in viejos if c != 'libertador')), 'arte (Runway)', len([c for c in viejos if c != 'libertador']) * 10 * HOJA_GPT, 4, 'a', 'est.: ~10 estados × %d c por campeón; necesita su lámina del Códice' % HOJA_GPT),
        ('idle-1-cuadro', 'Idle de 1 cuadro en %d campeones (brecha medida). Verificar primero si el motor ya anima el reposo por código.' % n_idle, 'arte (Runway)', n_idle * HOJA_GPT, 1, 'a', 'est.; `sin_verificar` si hace falta'),
    ]
    P_.sort(key=lambda x: (-(x[4] * 10 / (x[3] + 10)), x[0]))
    filas = []
    for i, (pid, paso, cl, cos, val, a, nota) in enumerate(P_, 1):
        filas.append((i if i <= 15 else '—', paso, cl, cos, '%d%s' % (val, ' a' if a else ''), '%.1f' % (val * 10 / (cos + 10)), nota))
    add(tabla(['#', 'Paso', 'Clase', 'Costo (c)', 'Valor', 'Puntaje', 'Fuente / nota'], filas))
    tot = collections.Counter();
    for x in P_[:15]: tot[x[2]] += x[3]
    add('**Costo de los 15 primeros por clase:** ' + ' · '.join('%s %d c' % (k, v) for k, v in sorted(tot.items())) + '. Los pasos 16 en adelante van marcados con «—». El saldo disponible no se verificó (ver A).\n')
    # ================= J
    add('## J) Decisiones abiertas del dueño\n')
    add(tabla(['Decisión', 'Qué se necesita', 'Dónde consta'], [
        ('Libertador: definitiva animada y ataque de frente', 'Aprobar/priorizar el cambio de código en `js/champions/libertador.js` (`ult_cast` con `prog` fijo en 0; ataque por set `fire`). Hay un agente implementándolo (retrocompatible); después se piden %d c de arte (1 hoja).' % HOJA_GPT, 'ART_CREDITS.md «Libertador: revision…», STATUS.md'),
        ('Ilkan y Nigromante: despacho de dibujo', 'Aprobar los cambios en `ilkan.js` (ataque por dirección) y `nigromante.js` (mostrar la definitiva propia antes de la forma Demonio). Ilkan después pide %d c (2 hojas); Nigromante 0.' % (2 * HOJA_GPT), 'ART_CREDITS.md «Nigromante e Ilkan: revision…»'),
        ('Aprobación de arte humana de lo instalado', 'Revisar y aprobar (o rechazar) lo instalado: Ynara lanzar y definitiva, Cazadora y Musashi definitiva; y el candidato del Tanque antes de integrarlo.', 'STATUS.md'),
        ('Términos comerciales de `gpt_image_2`', 'Confirmar que permiten uso comercial y completar la declaración de IA en Steamworks; las láminas del Códice existentes son de ChatGPT y también se declaran.', 'docs/steam/DECLARACION_IA.md'),
        ('Seguir gastando con Runway o cambiar el enfoque', 'Decidir presupuesto y tope (cuenta compartida; límite diario de tareas ya bloqueó un lote); alternativas sin probar: otros modelos de imagen o pintor determinista.', 'STATUS.md, runway-pack/COSTOS.md'),
        ('Bloques de interfaz en decisión', 'Resolver los %d bloques `BLOQUEADO_DECISION` del grupo 04-interfaz (y los de 01-cuerpos/05-cosmeticos en ese estado).' % n_ui_dec, 'asset-blocks.json'),
        ('Huérfanos', 'Archivar o borrar los %d archivos sin uso detectados por el atlas.' % n_huer, 'ATLAS_ARTE.json')]))
    return '\n'.join(L) + '\n'

def main():
    a = sys.argv[1:]
    if a[:1] == ['enemigos']:
        regenerar_cobertura(a[1] if len(a) > 1 else None); return
    out = render()
    if a == ['--check']:
        ok = os.path.exists(OUT) and open(OUT, encoding='utf-8').read() == out
        print('checklist de arte sincronizado' if ok else 'CHECKLIST_ARTE DESINCRONIZADO: correr python3 tools/art/art-checklist.py'); sys.exit(0 if ok else 1)
    with open(OUT, 'w', encoding='utf-8') as f: f.write(out)
    print('escrito', os.path.relpath(OUT, ROOT))
if __name__ == '__main__': main()
