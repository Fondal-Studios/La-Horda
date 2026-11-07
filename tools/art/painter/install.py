#!/usr/bin/env python3
"""Instala en el juego una hoja del pintor (tools/art/painter/out/<id>/atlas.png).

  python3 tools/art/painter/install.py <id> [<id> ...]

- La ficha (specs/<id>.json) dice dónde va: "install": {"champion": "aurelia", "pack": "aurelia"}
  (pack = id del atlas en el juego; para skins, "<campeón>_altN").
- Exige gate numérico y visual-review.json ligado por SHA-256 al atlas, ficha, Códice y evidencias.
  Un PASS numérico no aprueba identidad ni continuidad visual.
- Copia atlas y vista previa a assets/sprites/champions/<campeón>/[skins/<pack>/] y reescribe la línea de
  js/champions/ascension/art.js con el metadato del DONANTE de cuerpo (poses por fila y altura de referencia),
  porque las poses y la escala son las suyas.
- Registra lo hecho en docs/art-gate/painter-installs.json. Después hay que normalizar la escala con
  `node tools/art/roster_gate.js --write` y verificar con `node tools/art/roster_gate.js`.
"""
import json, re, sys, shutil, subprocess, datetime
from pathlib import Path
from PIL import Image
from install_review import require_review, digest

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
ART_JS = ROOT / 'js/champions/ascension/art.js'
EXP_ART_JS = ROOT / 'js/champions/expedition/art.js'


def donor_meta(donor_key):
    """Metadato (refH, sets...) con el que el juego carga la hoja del donante."""
    src = EXP_ART_JS.read_text()
    m = re.search(r'champPackLoadAtlas\("' + re.escape(donor_key) + r'","[^"]+",(\{.*?\})\);', src)
    if m:
        return json.loads(m.group(1))
    # skins de la Expedición vendidas como CROMA_SKINS: el metadato vive en authoredPacks.<campeón>.meta
    m = re.search(r'CROMA_SKINS\["' + re.escape(donor_key) + r'"\]=(\{.*\});\s*$', src, re.M)
    if m:
        d = json.loads(m.group(1))
        for pk in (d.get('authoredPacks') or {}).values():
            if pk.get('meta'):
                return pk['meta']
    raise SystemExit(f'sin metadato para el donante {donor_key} en {EXP_ART_JS}')


def install(pid):
    if not re.fullmatch(r'[a-z][a-z0-9_]*', pid):
        raise SystemExit('invalid painter spec id')
    spec_path = HERE / 'specs' / (pid + '.json')
    spec = json.loads(spec_path.read_text())
    inst = spec.get('install') or {}
    champ = inst.get('champion') or pid.split('_alt')[0]
    pack = inst.get('pack') or pid
    out = HERE / 'out' / pid / 'atlas.png'
    if not out.exists():
        raise SystemExit(f'{pid}: falta {out}; pintalo primero (painter.py paint)')
    g = subprocess.run([sys.executable, str(HERE / 'style_gate.py'), str(out)], capture_output=True, text=True)
    if g.returncode != 0:
        print(g.stdout.strip())
        raise SystemExit(f'{pid}: NO pasa el gate de estilo; no se instala')
    if not all(re.fullmatch(r'[a-z][a-z0-9_]*', value) for value in (champ, pack)):
        raise SystemExit('invalid champion/pack destination')
    receipt = out.parent / 'visual-review.json'
    try:
        review = require_review(ROOT, out, spec_path, receipt)
    except (ValueError, OSError) as exc:
        raise SystemExit(f'{pid}: no visual approval: {exc}')
    # Resolve metadata before writing any runtime asset.
    meta = donor_meta(spec['body'])
    dest = ROOT / 'assets/sprites/champions' / champ
    if pack != champ:
        dest = dest / 'skins' / pack
    dest.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(out, dest / 'atlas.png')
    a = Image.open(out).convert('RGBA')
    a.crop((0, 0, 112, 112)).save(dest / 'preview.png')
    meta['fix'] = meta.get('fix') or {'left': 'mirror'}
    rel = str((dest / 'atlas.png').relative_to(ROOT))
    line = 'champPackLoadAtlas("%s","%s",%s);' % (pack, rel, json.dumps(meta, separators=(',', ':')))
    src = ART_JS.read_text()
    pat = re.compile(r'champPackLoadAtlas\("' + re.escape(pack) + r'",[^\n]*\);')
    if pat.search(src):
        src = pat.sub(lambda _: line, src)
    else:
        src = src.rstrip('\n') + '\n' + line + '\n'
    ART_JS.write_text(src)
    log_path = ROOT / 'docs/art-gate/painter-installs.json'
    log = json.loads(log_path.read_text()) if log_path.exists() else {}
    log[pack] = {'champion': champ, 'spec': f'tools/art/painter/specs/{pid}.json', 'body': spec['body'], 'head': spec.get('head'),
                 'styleGate': 'PASS', 'visualReview': str(receipt.relative_to(ROOT)), 'reviewSha256': digest(receipt), 'atlasSha256': digest(out), 'date': datetime.date.today().isoformat()}
    log_path.write_text(json.dumps(log, indent=1, ensure_ascii=False) + '\n')
    print(f'instalado {pack} -> {rel} (metadato de {spec["body"]})')


if __name__ == '__main__':
    for pid in sys.argv[1:]:
        install(pid)
