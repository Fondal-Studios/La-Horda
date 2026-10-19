import base64
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image

ROOT = Path.cwd()
FOLDER = ROOT / 'art-source/entregas/bloques/B001_soporte/revision-frame11-v3'
OUT = Path('/tmp/soporte-frame11-v3')
OUT.mkdir(parents=True, exist_ok=True)
spec = json.loads((FOLDER / 'source.json').read_text())

def git_sha(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()

atlas = (ROOT / spec['atlas']).read_bytes()
replacement = (ROOT / spec['replacement']).read_bytes()
assert git_sha(atlas) == spec['atlasGitBlobSha']
assert hashlib.sha256(atlas).hexdigest() == spec['atlasSha256']
assert git_sha(replacement) == spec['replacementGitBlobSha']
manifest = {'atlas': spec['atlas'], 'atlasSha256': spec['atlasSha256'],
            'replacement': spec['replacement'], 'replacementSha256': hashlib.sha256(replacement).hexdigest(),
            'frame': spec['frame']}
if 'targetHeight' in spec:
    manifest['targetHeight'] = spec['targetHeight']
(OUT / 'assembly.json').write_text(json.dumps(manifest, indent=2) + '\n')
process = subprocess.run(['python3', 'tools/factory/replace-authored-frame.py',
                          str(OUT / 'assembly.json'), str(OUT / 'atlas.png')],
                         text=True, capture_output=True)
summary = {'schema': 1, 'scope': 'CANDIDATE_DIAGNOSTIC_NOT_ART_APPROVAL',
           'commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
           'replacementSha256': manifest['replacementSha256'],
           'approvalClaimed': False, 'installed': False}
if process.returncode:
    summary.update(status='REJECTED_ASSEMBLY', error=process.stderr[-3000:])
else:
    receipt = json.loads((OUT / 'atlas.json').read_text())
    assert receipt['retainedFrames'] == 35
    result = subprocess.run(['node', 'tools/art/check-authored-density.js', str(OUT / 'atlas.png'),
                             str(OUT / 'native.json'), '1'], text=True, capture_output=True)
    report = json.loads((OUT / 'native.json').read_text())
    module_spec = importlib.util.spec_from_file_location('saved_candidate_audit', ROOT / 'tools/factory/audit-authored-candidates.py')
    validator = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(validator)
    failed = validator.validate_report(report, receipt['atlasSha256'], result.returncode)
    scanner_spec = importlib.util.spec_from_file_location('candidate_scan', ROOT / 'tools/art/scan_sprites.py')
    scanner = importlib.util.module_from_spec(scanner_spec)
    scanner_spec.loader.exec_module(scanner)
    scan = scanner.analyze(str(OUT / 'atlas.png'))
    (OUT / 'scan.json').write_text(json.dumps(scan, indent=2, default=lambda v: v.item()) + '\n')
    summary.update(status=report['status'], failedFrames=failed, assembly=receipt)

    # Same 22%-of-row-width body-mass heuristic as tools/art/roster_gate.js.
    # Source-pixel comparison only; it does not replace the renderer's Roster Gate.
    def body_metrics(path):
        image = Image.open(path).convert('RGBA')
        out = []
        for frame in range(8, 12):
            x, y = frame % 4 * 112, frame // 4 * 112
            mask = np.array(image.crop((x, y, x+112, y+112)))[:, :, 3] > 40
            rows = mask.sum(axis=1)
            full = np.flatnonzero(rows)
            body = np.flatnonzero(rows >= rows.max() * .22)
            out.append({'frame': frame, 'body': int(body[-1]-body[0]+1),
                        'full': int(full[-1]-full[0]+1), 'foot': int(full[-1]),
                        'opaque': int(mask.sum())})
        return out
    summary['sourceBodyComparison'] = {'reference': body_metrics(ROOT / spec['atlas']),
                                       'candidate': body_metrics(OUT / 'atlas.png')}
    reference_body = float(np.median([r['body'] for r in summary['sourceBodyComparison']['reference'][:3]]))
    candidate_body = summary['sourceBodyComparison']['candidate'][-1]
    summary['sourceBodyScreen'] = {'referenceMedian': reference_body,
                                  'candidateBody': candidate_body['body'],
                                  'relativeDeviation': candidate_body['body']/reference_body-1,
                                  'foot': candidate_body['foot'],
                                  'within4PercentAndFoot2Pixels': abs(candidate_body['body']/reference_body-1) <= .04 and abs(candidate_body['foot']-106) <= 2,
                                  'scope': 'Source-pixel mass only; full renderer and visual approval still required'}
    refs_spec = importlib.util.spec_from_file_location('candidate_refs', ROOT / 'tools/art/gen-referencias.py')
    refs = importlib.util.module_from_spec(refs_spec)
    refs_spec.loader.exec_module(refs)
    for name, source in [('reference.png', ROOT / spec['atlas']), ('contact.png', OUT / 'atlas.png')]:
        refs.render({'src': str(source), 'fw': 112, 'fh': 112, 'cols': 4, 'anchor': 106/112},
                    [{'etiqueta': 'Espalda: 8,9,10,11', 'cuadros': [8,9,10,11]}],
                    escala=3, titulo='B001 fuente: ' + name, pie='Comparacion sin VFX; no aprueba arte', max_por_linea=4).save(OUT / name)

assert hashlib.sha256((ROOT / spec['atlas']).read_bytes()).hexdigest() == spec['atlasSha256']
(OUT / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print('CANDIDATE_SUMMARY ' + json.dumps(summary), flush=True)
# Text transport of owned art only, to recover factory outputs when local execution is unavailable.
# A successful transport is never visual approval. No PNG is installed by this job.
exports = ['assembly.json', 'summary.json']
if (OUT / 'native.json').exists():
    exports += ['native.json', 'scan.json']
if summary['status'] == 'TECHNICAL_SCREEN_PASS':
    exports += ['atlas.png', 'atlas.json', 'reference.png', 'contact.png']
for name in exports:
    data = (OUT / name).read_bytes()
    encoded = base64.b64encode(data).decode()
    chunks = [encoded[n:n+4096] for n in range(0, len(encoded), 4096)]
    print('ASSET_EXPORT ' + json.dumps({'file': name, 'gitBlobSha': git_sha(data),
                                       'sha256': hashlib.sha256(data).hexdigest(), 'chunks': len(chunks)}), flush=True)
    for index, chunk in enumerate(chunks):
        print('ASSET_CHUNK ' + json.dumps({'file': name, 'index': index, 'data': chunk}), flush=True)
