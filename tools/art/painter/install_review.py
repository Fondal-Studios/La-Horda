"""Review receipts bind a visual decision to the exact candidate and Codex reference.
Numeric style metrics alone never authorize an installation.
"""
import hashlib
import json
from pathlib import Path


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def reviewed_file(root, entry, label):
    if not isinstance(entry, dict) or not isinstance(entry.get('path'), str):
        raise ValueError(f'{label}: missing path/hash')
    path = (root / entry['path']).resolve()
    if not path.is_relative_to(root.resolve()) or not path.is_file():
        raise ValueError(f'{label}: file must exist inside repository')
    if entry.get('sha256') != digest(path):
        raise ValueError(f'{label}: content changed after review')
    return path


def require_review(root, candidate, spec, receipt):
    root, candidate, receipt = Path(root), Path(candidate), Path(receipt)
    if not receipt.is_file():
        raise ValueError('missing visual-review.json; numeric style PASS is not visual approval')
    review = json.loads(receipt.read_text())
    if review.get('status') != 'PASS' or not str(review.get('reviewer') or '').strip():
        raise ValueError('visual review must be PASS with a named reviewer')
    if review.get('specSha256') != digest(Path(spec)):
        raise ValueError('spec changed after review')
    if reviewed_file(root, review.get('candidate'), 'candidate') != candidate.resolve():
        raise ValueError('review belongs to another atlas')
    reference = reviewed_file(root, review.get('reference'), 'Codex reference')
    if not reference.is_relative_to((root / 'assets/ui/codex').resolve()):
        raise ValueError('reference must be a Codex image')
    checks = review.get('checks') or {}
    for key in ('identity', 'animationContinuity', 'nativePixelStyle', 'inGameScale'):
        if checks.get(key) != 'PASS':
            raise ValueError(f'visual review missing {key}: PASS')
    evidence = review.get('evidence')
    if not isinstance(evidence, list) or not evidence:
        raise ValueError('visual evidence required')
    for entry in evidence:
        reviewed_file(root, entry, 'evidence')
    return review
