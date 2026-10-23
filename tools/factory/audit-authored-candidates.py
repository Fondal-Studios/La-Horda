#!/usr/bin/env python3
"""Audit saved atlases without installing them or treating a technical screen as art approval."""
import argparse
from collections import Counter
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]


def validate_report(report, source_sha256, returncode):
    if report.get('sha256') != source_sha256:
        raise ValueError('Density report does not match the input hash')
    rows = report.get('rows', [])
    if len(rows) != 36 or [r.get('frame') for r in rows] != list(range(36)):
        raise ValueError('Density report must cover all 36 frames exactly once')
    for row in rows:
        issues = row.get('issues')
        if not isinstance(issues, list) or any(not isinstance(x, str) for x in issues):
            raise ValueError('Invalid per-frame issues')
        if not row.get('opaque') and 'FRAME_VACIO' not in issues:
            raise ValueError('An empty frame cannot pass')
    failed = [row['frame'] for row in rows if row['issues']]
    expected = 'FIX' if failed else 'TECHNICAL_SCREEN_PASS'
    if report.get('failedFrames') != failed or report.get('status') != expected:
        raise ValueError('Contradictory density report')
    if returncode != (1 if failed else 0):
        raise ValueError('Detector process failed or returned a contradictory exit code')
    return failed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, default=ROOT / 'docs/production/authored-candidates.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'docs/production/art-candidate-audit')
    args = parser.parse_args()
    candidates = json.loads(args.manifest.read_text())['candidates']
    if not candidates or len({c['block'] for c in candidates}) != len(candidates):
        raise ValueError('Expected uniquely identified candidate blocks')
    inputs = []
    staging = (ROOT / 'art-source/entregas').resolve()
    for candidate in candidates:
        source = (ROOT / candidate['source']).resolve()
        source.relative_to(staging)  # This tool only audits saved staging art.
        data = source.read_bytes()
        git_blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        if git_blob != candidate['gitBlobSha']:
            raise ValueError('Saved source changed: ' + candidate['source'])
        inputs.append((candidate, hashlib.sha256(data).hexdigest()))
    args.output.mkdir(parents=True, exist_ok=True)
    spec = importlib.util.spec_from_file_location('candidate_scanner', ROOT / 'tools/art/scan_sprites.py')
    scanner = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(scanner)
    results = []
    for candidate, source_hash in inputs:
        output = args.output / (candidate['block'] + '-native.json')
        output.unlink(missing_ok=True)  # A crashed detector cannot reuse a stale PASS.
        process = subprocess.run(['node', str(ROOT / 'tools/art/check-authored-density.js'),
                                  str(ROOT / candidate['source']), str(output), '1'],
                                 cwd=ROOT, text=True, capture_output=True)
        if not output.exists():
            raise ValueError('Detector did not produce evidence: ' + process.stderr)
        report = json.loads(output.read_text())
        failed = validate_report(report, source_hash, process.returncode)
        scan = scanner.analyze(str(ROOT / candidate['source']))
        result = {**candidate, 'sha256': source_hash,
                  'nativeStatus': report['status'], 'failedFrames': failed,
                  'nativeIssues': dict(sorted(Counter(issue for row in report['rows'] for issue in row['issues']).items())),
                  'scanner': scan, 'releaseApproved': False,
                  'pending': ['Visual identity, direction, proportions, animation and runtime gates']}
        results.append(result)
        print(json.dumps({k: result[k] for k in ['block', 'source', 'nativeStatus', 'failedFrames', 'nativeIssues', 'releaseApproved']}), flush=True)
    summary = {'schema': 1, 'status': 'DIAGNOSTIC_COMPLETE_NOT_RELEASE_APPROVAL',
               'commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
               'detectorSha256': hashlib.sha256((ROOT / 'tools/art/pixel-density.js').read_bytes()).hexdigest(),
               'nativeScale': 1, 'releaseApproved': False, 'candidates': results}
    (args.output / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2,
                                                       default=lambda v: v.item()) + '\n')
    print('Candidate evidence saved; no assets installed or approved.')


if __name__ == '__main__':
    main()
