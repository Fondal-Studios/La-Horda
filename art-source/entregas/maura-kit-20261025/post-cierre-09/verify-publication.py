import urllib.request, hashlib, json, datetime
from pathlib import Path

BASE = 'https://fondalstudios.com/la-horda/jugar/'
ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
paths = ['js/champions/skill-fx-a/c/maura.js', 'js/skills/champion-signatures.js']
def get(path):
    req = urllib.request.Request(BASE + path, headers={'Cache-Control': 'no-cache', 'User-Agent': 'LaHorda-art-publication-verification'})
    with urllib.request.urlopen(req, timeout=40) as response:
        body = response.read()
        return body, {'url': response.url, 'status': response.status, 'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest()}
index, index_meta = get('')
rows = []
for path in paths:
    body, row = get(path)
    expected = (ROOT / path).read_bytes()
    row.update(path=path, expectedSha256=hashlib.sha256(expected).hexdigest(), exactBytes=body == expected, indexConsumes=path in index.decode('utf-8'))
    rows.append(row)
result = {'index': index_meta, 'runtime': rows, 'publication': 'VERIFIED' if all(r['exactBytes'] and r['indexConsumes'] for r in rows) else 'NOT_CONFIRMED', 'note': 'Canonical hosting only. Repository integration is independent. No infrastructure changes.'}
(OUT / 'PUBLICATION.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
