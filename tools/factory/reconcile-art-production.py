#!/usr/bin/env python3
"""Reconcile explicitly proven integrations, never close tasks merely because a PNG exists."""
import argparse
import collections
import hashlib
import json
import re
import struct
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTROL = ROOT / 'art-source/entregas/control_produccion.json'
PLAN = ROOT / 'art-source/entregas/bloques/plan_bloques.json'


def read(path):
    return json.loads(Path(path).read_text())


def require(condition, message):
    if not condition:
        raise ValueError(message)


def verify(entry, metadata):
    skin, champ = entry['skin'], entry['champion']
    require(subprocess.run(['git', 'merge-base', '--is-ancestor', entry['merge'], 'HEAD'],
                           cwd=ROOT, capture_output=True).returncode == 0,
            f'{skin}: merge is not in checkout history')
    match = re.search(r'CROMA_SKINS\["' + re.escape(skin) + r'"\]=(\{[^\n]*\});', metadata)
    require(match, f'{skin}: runtime registration absent')
    meta = json.loads(match.group(1))
    require(meta['champ'] == champ and meta['appearanceType'] == 'skin', f'{skin}: wrong champion/type')
    runtime = ROOT / meta['authoredPacks'][champ]['src']
    delivery = ROOT / entry['delivery']
    expected = entry['atlasSha256']
    for path in [runtime, delivery / 'skin/atlas.png']:
        data = path.read_bytes()
        require(hashlib.sha256(data).hexdigest() == expected, f'{skin}: atlas hash mismatch: {path}')
        require(data[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II', data[16:24]) == (448, 1008),
                f'{skin}: wrong atlas dimensions')
    receipt = read(delivery / 'skin/import-report.json')
    require(receipt['poses'] == 36 and receipt['atlasSha256'] == expected, f'{skin}: import receipt mismatch')
    manifest = read(delivery / 'fuentes/importacion.json')
    require(hashlib.sha256((ROOT / manifest['source']).read_bytes()).hexdigest() == manifest['sourceSha256']
            == receipt['sourceSha256'], f'{skin}: source hash mismatch')
    for path in [delivery / entry['checks'], delivery / 'runtime/online.json']:
        report = read(path)
        require(report.get('checks') and all(c['ok'] is True for c in report['checks'])
                and not report.get('errors') and report.get('status', 'PASS') == 'PASS',
                f'{skin}: failed or absent runtime evidence: {path}')
    return {'pr': entry['pr'], 'commit_main': entry['merge'], 'skin': skin,
            'atlas': str(runtime.relative_to(ROOT)), 'sha256': expected,
            'evidencia': entry['delivery'], 'publicacion': 'PENDIENTE_VERIFICACION',
            'revision_visual': 'ASISTIDA_CODEX; no atribuida al dueño'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--registry', type=Path, default=ROOT / 'docs/production/art-integrations.json')
    args = parser.parse_args()
    control, plan = read(CONTROL), read(PLAN)
    metadata = (ROOT / 'js/assets/quality-five-skins-meta.js').read_text()
    entries = read(args.registry)['integrations']
    require(len({e['item'] for e in entries}) == len(entries), 'duplicate item mapping')
    evidence = [(e, verify(e, metadata)) for e in entries]  # Validate everything before changing anything.
    before_control, before_plan = json.dumps(control), json.dumps(plan)
    for entry, proof in evidence:
        items = [x for x in control['items'] if x['id'] == entry['item']]
        blocks = [x for x in plan['bloques'] if x['id'] == entry['block']]
        require(len(items) == len(blocks) == 1 and entry['item'] in blocks[0]['items'], 'ambiguous task mapping')
        item, block = items[0], blocks[0]
        item.update(estado='INTEGRADO_MAIN', version_reutilizable=entry['delivery'], integracion=proof)
        block.update(estado='INTEGRADO_MAIN', integracion='INTEGRADO_MAIN', evidencia_integracion=proof,
                     revision_visual=proof['revision_visual'], decisiones_pendientes=[])
        # Keep historical versions, reviews and destinations; this is integration evidence, not a new approval.
        for version in block.get('versiones_reutilizables', []):
            if version.get('pr') == entry['pr']:
                version.update(estado='INTEGRADO_MAIN', pendientes=['Publicación pendiente de verificar'])
        for version in control.get('versiones_guardadas', []):
            if version.get('pr') == entry['pr'] and version.get('lote') == 'B635_brasa_abisal':
                version.update(estado='INTEGRADO_MAIN', commit_main=entry['merge'],
                               pendientes=['Publicación pendiente de verificar'])
    if 'INTEGRADO_MAIN' not in plan['estados']:
        plan['estados'].append('INTEGRADO_MAIN')
    states = collections.Counter(x['estado'] for x in control['items'])
    control['totales']['por_estado'] = dict(sorted(states.items()))
    control['totales']['resueltos'] = sum(states[k] for k in ['INTEGRADO_MAIN', 'INTEGRADO_CLAUDE'])
    control['totales']['sin_integracion_documentada'] = len(control['items']) - control['totales']['resueltos']
    changed = before_control != json.dumps(control) or before_plan != json.dumps(plan)
    if args.write:
        for path, value in [(CONTROL, control), (PLAN, plan)]:
            path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'verified': [e['skin'] for e in entries], 'needsReconciliation': changed,
                      'written': args.write, 'inventoryTasks': len(control['items']),
                      'documentedIntegrations': control['totales']['resueltos'],
                      'activeBlockPreserved': control['bloque_activo']}, ensure_ascii=False))
    return 0 if args.write or not changed else 1


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (ValueError, KeyError, FileNotFoundError) as error:
        raise SystemExit(str(error))
