#!/usr/bin/env python3
"""Rebuild authored sources. Never regenerate rejected donor studies or approve release.
--require-complete additionally rejects a partial batch (fifteen source sheets required).
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
IDS = ['solciju', 'brakk', 'veyra', 'morveth', 'aelith']
OUT = ROOT / 'docs/production/quality-five/originals'
rows, missing = [], []
for champion in IDS:
    for key in [champion, champion + '_alt1', champion + '_set']:
        source = ROOT / 'art-source/quality-five-original' / (key + '.json')
        if not source.exists():
            missing.append(key)
            continue
        dest = OUT / key
        subprocess.run([sys.executable, str(ROOT / 'tools/factory/import-authored-sheet.py'), str(source), str(dest)], cwd=ROOT, check=True)
        subprocess.run([sys.executable, str(ROOT / 'tools/art/painter/style_gate.py'), str(dest / 'atlas.png')], cwd=ROOT, check=True)
        installed = ROOT / 'assets/sprites/champions' / champion
        if key != champion:
            installed = installed / 'skins' / ('quality_' + champion if key.endswith('_set') else key)
        if (installed / 'atlas.png').exists() and (installed / 'atlas.png').read_bytes() != (dest / 'atlas.png').read_bytes():
            raise SystemExit(key + ': installed atlas does not match authored source')
        rows.append({'id': key, 'atlasSha256': hashlib.sha256((dest / 'atlas.png').read_bytes()).hexdigest(), 'numericStyle': 'PASS'})
report = {'status': 'PARTIAL_NOT_RELEASE_APPROVAL' if missing else 'REBUILT_NOT_RELEASE_APPROVAL', 'candidates': rows, 'missing': missing}
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'production.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
if '--require-complete' in sys.argv and missing:
    sys.exit(1)
