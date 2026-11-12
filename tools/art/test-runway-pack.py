#!/usr/bin/env python3
"""Cobertura del paquete de instrucciones de Runway (docs/art-brief/runway-pack/): cada bloque, item, campeón y enemigo tiene su descripción
y su instrucción, los prompts no tienen huecos sin llenar y los archivos commiteados coinciden con lo que genera build-runway-pack.py.
   python3 tools/art/test-runway-pack.py"""
import hashlib, json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PK = os.path.join(ROOT, 'docs/art-brief/runway-pack')
fails = []; n = 0
def ok(c, m):
    global n; n += 1
    if not c: fails.append(m); print('FALLA', m)
def tree_hash():
    h = hashlib.sha256()
    for d, _, fs in sorted(os.walk(PK)):
        for f in sorted(fs):
            if d.endswith('/data'): continue
            h.update(os.path.join(d, f).encode()); h.update(open(os.path.join(d, f), 'rb').read())
    return h.hexdigest()
before = tree_hash()
subprocess.run([sys.executable, os.path.join(ROOT, 'tools/art/build-runway-pack.py')], check=True, stdout=subprocess.DEVNULL)
ok(before == tree_hash(), 'los archivos commiteados NO coinciden con lo que genera build-runway-pack.py (volver a generar y commitear)')
blocks = json.load(open(os.path.join(ROOT, 'docs/production/asset-blocks.json')))['blocks']
pack = json.load(open(os.path.join(PK, 'bloques.json')))['bloques']
game = json.load(open(os.path.join(PK, 'data/game-data.json')))
ok(len(pack) == len(blocks) and [b['id'] for b in pack] == [b['id'] for b in blocks], 'bloques.json no cubre los %d bloques de la cola' % len(blocks))
ok(sum(len(b['items']) for b in pack) == sum(len(b['items']) for b in blocks), 'faltan items')
BAD = re.compile(r'\{[a-z_]+\}|\bNone\b|undefined|NaN|TODO:|FIXME')
for b in pack:
    ok(b['titulo'] and b['prioridad'] and b['estado'], 'bloque %s incompleto' % b['id'])
    for it in b['items']:
        ok(len(it.get('descripcion', '')) > 30, 'item %s sin descripción útil' % it['id'])
        ok(bool(it.get('metodo')), 'item %s sin método' % it['id'])
        ok(not BAD.search(it['descripcion']), 'item %s: descripción con hueco sin llenar: %s' % (it['id'], BAD.search(it['descripcion']) and BAD.search(it['descripcion']).group(0)))
        pr = it.get('prompt_runway')
        if 'runway' in it['metodo']:
            ok(bool(pr), 'item %s usa Runway pero no tiene prompt' % it['id'])
        for p in (pr if isinstance(pr, list) else [pr] if pr else []):
            ok(not BAD.search(p), 'item %s: prompt con hueco sin llenar' % it['id'])
            ok(len(p) > 60, 'item %s: prompt demasiado corto' % it['id'])
for cid, c in game['champions'].items():
    f = os.path.join(PK, 'campeones', cid + '.md')
    ok(os.path.exists(f), 'falta campeones/%s.md' % cid)
    if os.path.exists(f):
        t = open(f, encoding='utf-8').read()
        ok(len(re.findall(r'^### Cuadro \d+ ', t, re.M)) == 36, '%s: no tiene las 36 poses' % cid)
        ok(t.count('**Prompt Runway:**') == 37, '%s: faltan prompts (36 poses + golpe)' % cid)
        has = os.path.exists(os.path.join(ROOT, 'assets/ui/codex/champions/%s.png' % cid))
        ok((('assets/ui/codex/champions/%s.png' % cid) in t) if has else ('SIN LÁMINA DEL CÓDICE' in t and 'assets/ui/codex/champions/%s.png`) ' % cid not in t), '%s: la ficha no refleja si existe su lámina del Códice' % cid)
        ok('<LÁMINA' not in t and '<@pose' not in t, '%s: comando con marcador sin resolver' % cid)
        if not has:
            ok('Paso 0 (Runway crea la lámina' in t and 'runway-design.js %s codex1' % cid in t and 'art-source/runway-designs/%s/codex1/master.png' % cid in t, '%s: sin lámina pero sin instrucción para crearla' % cid)
        # toda ruta de imagen que la ficha manda usar como referencia existe (o es el recorte que genera pose-ref)
        t_sin_extracto = re.sub(r'### Identidad visual.*?(?=^## 2\.)', '', t, flags=re.S | re.M)   # el extracto literal del brief puede citar rutas históricas
        for pth in set(re.findall(r'(assets/[A-Za-z0-9_./-]+\.png)', t_sin_extracto)):
            ok(os.path.exists(os.path.join(ROOT, pth)) or pth.endswith('/%s.png' % cid) and not has, '%s: cita %s y no existe' % (cid, pth))
        ok(not BAD.search(t), '%s: hueco sin llenar' % cid)
for eid, e in game['enemies'].items():
    f = os.path.join(PK, 'enemigos', (e['arena'] or 'otras') + '.md')
    ok(os.path.exists(f) and ('(`%s`)' % eid) in open(f, encoding='utf-8').read(), 'enemigo %s no está en su archivo' % eid)
for eid, e in game['enemies'].items():
    arena = {'jinete_sin_cabeza': 'bosque'}.get(eid) or e['arena'] or 'otras'
    t = open(os.path.join(PK, 'enemigos', arena + '.md'), encoding='utf-8').read()
    sec = t.split('(`%s`)' % eid, 1)[1].split('\n## ', 1)[0]
    ok(all(k in sec for k in ('Paso 1', 'Paso 2', 'Paso 3', 'Paso 4', 'Paso 5')), 'enemigo %s: cadena incompleta' % eid)
    ok('gen_sheet.py %s %s ' % (arena, eid) in sec and 'install.py %s %s ' % (arena, eid) in sec and 'walk_batch.py %s %s ' % (arena, eid) in sec, 'enemigo %s: comandos sin su arena/id' % eid)
    if 'SIN ATLAS PROPIO' in sec:
        ok('runway-design.js %s d1 ' % eid in sec and 'Paso 0' in sec, 'enemigo %s: sin atlas pero sin Paso 0' % eid)
    else:
        ok('pose-ref.py %s 0' % eid in sec, 'enemigo %s: con atlas pero sin recorte de partida' % eid)
    ok(not re.search(r'<[A-Za-zÁÉ@][^>]*>', sec), 'enemigo %s: marcador sin resolver' % eid)
# la herramienta que crea lo que falta existe y su --dry-run funciona sin gastar ni llamar a la API
r = subprocess.run(['node', os.path.join(ROOT, 'tools/art-world/runway-design.js'), 'x_test', 'd1', 'prompt', '--dry-run'], capture_output=True, text=True)
ok(r.returncode == 0 and '"dryRun": true' in r.stdout and not os.path.exists(os.path.join(ROOT, 'art-source/runway-designs/x_test')), 'runway-design.js --dry-run no funciona o escribió/gastó')
r = subprocess.run(['node', os.path.join(ROOT, 'tools/art-world/runway-design.js')], capture_output=True, text=True); ok(r.returncode == 2, 'runway-design.js sin argumentos debe fallar con uso')
ok('Sin tope' in open(os.path.join(PK, 'COSTOS.md'), encoding='utf-8').read(), 'COSTOS.md no declara la decisión sin tope')
for f in ['README_PROMPT_MAESTRO.md', 'RECETA.md', 'POSES_CAMPEON.md', 'ENEMIGOS_GUIA.md', 'COSTOS.md']:
    ok(os.path.exists(os.path.join(PK, f)), 'falta ' + f)
# todo lo que la receta manda correr existe
for p in ['tools/art-world/runway-guardian.js', 'tools/art-world/runway-world.js', 'tools/art-world/runway-design.js', 'tools/art/runway/gen_sheet.py', 'tools/art/runway/install.py', 'tools/art/runway/walk_batch.py', 'tools/art/runway/build_sheet.py', 'tools/art/pose-ref.py', 'tools/art/scan_sprites.py', 'tools/art/painter/style_gate.py', 'tools/art/painter/install.py',
          'tools/art/roster_gate.js', 'tools/art/pixel-density.js', 'tools/art/enemy_coverage.js', 'tools/factory/import-authored-sheet.py', 'tools/art/webp_convert.py', 'tools/art/build-art-atlas.js',
          'docs/art-brief/plantillas/champion_atlas_448x1008_PLANTILLA.png', 'tools/art/painter/donors.json', 'docs/beta-release/ART_CREDITS.md']:
    ok(os.path.exists(os.path.join(ROOT, p)), 'la receta cita %s y no existe' % p)
print('FALLARON %d de %d' % (len(fails), n) if fails else 'test-runway-pack: %d comprobaciones OK' % n)
sys.exit(1 if fails else 0)
