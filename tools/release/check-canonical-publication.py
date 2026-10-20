#!/usr/bin/env python3
"""Read-only byte checks against Fondal; matching selected files is not deployment certification."""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANONICAL = 'https://fondalstudios.com/la-horda/jugar/'
FILES = ('index.html', 'js/assets/champion-sprites.js', 'js/rendering/champion-sprites.js',
         'js/data/codex-content.js', 'assets/sprites/champions/soporte/v3/atlas.png',
         'assets/sprites/champions/libertador/v2/death.png')
MAX_BYTES = 8 * 1024 * 1024


def check(base, root, files=FILES, timeout=20):
    url = urllib.parse.urlsplit(base)
    if (url.username or url.password or url.query or url.fragment or not url.hostname
            or not (url.scheme == 'https' or (url.scheme == 'http' and url.hostname in ('localhost', '127.0.0.1', '::1')))):
        raise ValueError('Use a public HTTPS base URL without credentials/query; HTTP is only for local tests')
    base = base.rstrip('/') + '/'
    root = Path(root).resolve()
    expected = []
    for name in files:
        path = (root / name).resolve()
        if not path.is_relative_to(root) or not name or name.startswith('/') or not path.is_file():
            raise ValueError('Missing or invalid candidate file: ' + name)
        data = path.read_bytes()
        if not data or len(data) > MAX_BYTES:
            raise ValueError('Empty or oversized candidate file: ' + name)
        expected.append((name, hashlib.sha256(data).hexdigest()))
    def probe(entry):
        name, digest = entry
        row = {'path': name, 'expectedSha256': digest}
        request = urllib.request.Request(base + urllib.parse.quote(name, safe='/'), headers={
            'Cache-Control': 'no-cache', 'Accept-Encoding': 'identity', 'User-Agent': 'Fondal-publication-check/1'})
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                row.update(httpStatus=response.status, finalUrl=response.url)
                data = response.read(MAX_BYTES + 1)
                row['bytes'] = len(data)
                if url.scheme == 'https' and urllib.parse.urlsplit(response.url).scheme != 'https':
                    row['status'] = 'INSECURE_REDIRECT'
                elif response.status != 200:
                    row['status'] = 'HTTP_ERROR'
                elif len(data) > MAX_BYTES:
                    row['status'] = 'OVERSIZED_RESPONSE'
                else:
                    row['publicSha256'] = hashlib.sha256(data).hexdigest()
                    row['status'] = 'MATCH' if row['publicSha256'] == digest else 'DIFFERENT'
        except urllib.error.HTTPError as error:
            row.update(httpStatus=error.code, status='MISSING' if error.code == 404 else 'HTTP_ERROR')
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            row.update(status='UNREACHABLE', error=str(error.reason if isinstance(error, urllib.error.URLError) else error))
        return row
    if expected:
        with concurrent.futures.ThreadPoolExecutor(max_workers=min(4, len(expected))) as pool:
            rows = list(pool.map(probe, expected))
    else:
        rows = []
    return {'schema': 1, 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'baseUrl': base, 'scope': 'Selected file bytes only; not gameplay, accounts, ownership, live multiplayer or full release certification',
            'status': 'CHECKED_FILES_MATCH' if rows and all(r['status'] == 'MATCH' for r in rows) else 'NOT_CONFIRMED',
            'checks': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default=CANONICAL)
    parser.add_argument('--root', type=Path, default=ROOT, help='Expected served build; use dist if bundling changes HTML')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    result = check(args.base_url, args.root)
    revision = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT, capture_output=True, text=True)
    result['checkoutRevision'] = revision.stdout.strip() if revision.returncode == 0 else None
    result['candidateRoot'] = str(args.root.resolve())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'status': result['status'], 'files': len(result['checks']), 'output': str(args.output)}))
    return 0 if result['status'] == 'CHECKED_FILES_MATCH' else 1


if __name__ == '__main__':
    raise SystemExit(main())
