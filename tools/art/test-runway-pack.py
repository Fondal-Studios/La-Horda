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
        ok(('assets/ui/codex/champions/%s.png' % cid) in t, '%s: no cita su lámina del Códice' % cid)
        ok(not BAD.search(t), '%s: hueco sin llenar' % cid)
for eid, e in game['enemies'].items():
    f = os.path.join(PK, 'enemigos', (e['arena'] or 'otras') + '.md')
    ok(os.path.exists(f) and ('(`%s`)' % eid) in open(f, encoding='utf-8').read(), 'enemigo %s no está en su archivo' % eid)
for f in ['README_PROMPT_MAESTRO.md', 'RECETA.md', 'POSES_CAMPEON.md', 'ENEMIGOS_GUIA.md', 'COSTOS.md']:
    ok(os.path.exists(os.path.join(PK, f)), 'falta ' + f)
# todo lo que la receta manda correr existe
for p in ['tools/art-world/runway-guardian.js', 'tools/art-world/runway-world.js', 'tools/art/pose-ref.py', 'tools/art/scan_sprites.py', 'tools/art/painter/style_gate.py', 'tools/art/painter/install.py',
          'tools/art/roster_gate.js', 'tools/art/pixel-density.js', 'tools/art/enemy_coverage.js', 'tools/factory/import-authored-sheet.py', 'tools/art/webp_convert.py', 'tools/art/build-art-atlas.js',
          'docs/art-brief/plantillas/champion_atlas_448x1008_PLANTILLA.png', 'tools/art/painter/donors.json', 'docs/beta-release/ART_CREDITS.md']:
    ok(os.path.exists(os.path.join(ROOT, p)), 'la receta cita %s y no existe' % p)
print('FALLARON %d de %d' % (len(fails), n) if fails else 'test-runway-pack: %d comprobaciones OK' % n)
sys.exit(1 if fails else 0)
