#!/usr/bin/env python3
"""Fail-closed orchestration of the unchanged icon checker, not a replacement gate."""
import argparse
import json
import pathlib
import re

BASELINE = '34ac2852154035b97e53c4807a0a20ee289a40b2'
HUD = 'HUD 844x390: 43 campeones, 301 íconos auditados; 946 pares de definitivas (incl. Coloso)'
# El roster crece: la cobertura del HUD NO es un número fijo. Se exige el formato exacto con cantidades positivas y coherentes
# (íconos = 7 por campeón; pares de definitivas = n·(n-1)/2 + n por el Coloso), no un recuento histórico.
HUD_RE = re.compile(r'HUD 844x390: ([1-9][0-9]*) campeones, ([1-9][0-9]*) íconos auditados; ([1-9][0-9]*) pares de definitivas \(incl\. Coloso\)')


def hud_ok(line):
    m = HUD_RE.fullmatch(line)
    n = int(m.group(1)) if m else 0
    return bool(m) and int(m.group(2)) == 7 * n and int(m.group(3)) == n * (n - 1) // 2 + n


PASS = 'PASS contrato de íconos: 16x16 nativos, <= 6 colores, alfa 0/255, contorno de 1 px, marco por categoría, definitivas distinguibles (<= 85 % iguales)'
SELF = {'good': 'PASS', 'wrongSize': 'tamaño nativo 32x32 (debe ser 16x16)', 'gradient': '256 colores (máximo 6)', 'semiAlpha': '20 píxeles con alfa distinto de 0/255', 'noFrame': 'marco skill incompleto en (3,0)', 'noOutline': 'sin contorno oscuro de 1 px'}
CHAMPIONS = set('tanque guerrero mago soporte segador axiom profeta musashi cazadora nigromante libertador ilkan ynara myla brasa eslabon morwen farolero iria vesper nahir baltra maura dariel orsa tibor zahra renko sira nano_gm facu_gm aurelia khepri velmira vhal bront oriel saelis solciju veyra brakk morveth aelith'.split())
KNOWN_FAILURES = {f'{key} btn-basic: se muestra a 42x42 px (debe ser múltiplo entero de 16)' for key in CHAMPIONS}
HARNESS = {'tools/art/check-skill-icons.js', 'tools/lib/serve.js', 'tools/lib/pw-tune.js', 'tools/lib/http-ready.js'}


def parse(log, node_status, tee_status):
    """Same grammar and completion rules for candidate and historical baseline."""
    result = {'state': 'EXECUTION_ERROR', 'exit': node_status, 'tee_exit': tee_status, 'failures': []}
    def invalid(reason):
        return dict(result, reason=reason)
    if type(node_status) is not int or node_status not in (0, 1) or type(tee_status) is not int or tee_status != 0:
        return invalid('invalid process or evidence writer status')
    lines = log.strip().splitlines()
    # The pinned unchanged checker emits exactly this ordered grammar. Unknown
    # lines, exceptions, truncated output or future format changes require review.
    if len(lines) < 6 or not re.fullmatch(r'\[arnés\] servidor propio: http://127\.0\.0\.1:\d+ \(raíz .+\)', lines[0]):
        return invalid('missing harness start')
    prefix = 'autoprueba del verificador: '
    try:
        if not lines[1].startswith(prefix) or json.loads(lines[1][len(prefix):]) != SELF:
            return invalid('checker self-test incomplete or failed')
    except (ValueError, TypeError):
        return invalid('malformed self-test')
    if not hud_ok(lines[2]) or not lines[3].startswith('definitivas más parecidas: ') or not lines[4].startswith('íconos de kit más parecidos: '):
        return invalid('missing, changed or incomplete coverage summary')
    result['hud_summary'] = lines[2]
    if lines[5] == PASS:
        if node_status != 0 or len(lines) != 6:
            return invalid('PASS contradicts status or trailing output')
        return dict(result, state='PASS')
    fail = re.fullmatch(r'FAIL \(([1-9][0-9]*)\)', lines[5])
    if not fail or node_status != 1:
        return invalid('missing or contradictory terminal result')
    count = int(fail.group(1))
    items = lines[6:]
    if count > 80 or len(items) != count or any(not x.startswith(' - ') for x in items):
        return invalid('failure list incomplete or truncated')
    failures = [x[3:] for x in items]
    if any(not x or re.search(r'errores de página:|Traceback|\b\w*Error\b|ENOENT|ENOMEM|SIG[A-Z]+', x) for x in failures):
        return invalid('execution error is not a contract baseline')
    return dict(result, state='CONTRACT_FAIL', failures=failures, failure_count=count)


def classify(candidate, baseline):
    result = {'candidate': candidate, 'baseline': baseline, 'classification': 'INCONCLUSIVE_EXECUTION_ERROR', 'exit': 1}
    c, b = candidate['state'], baseline['state']
    if 'EXECUTION_ERROR' in (c, b):
        return result
    if c == 'CONTRACT_FAIL':
        result['classification'] = ('SAME_BASELINE_FAILURES_NOT_A_PASS' if b == 'CONTRACT_FAIL' and sorted(candidate['failures']) == sorted(baseline['failures']) else 'CANDIDATE_CONTRACT_FAILURE')
        return result
    if c != 'PASS':
        return result
    if b == 'PASS':
        return dict(result, classification='BOTH_PASS', exit=0)
    # Only this documented, pinned historical defect is accepted as comparison
    # evidence. Preserve its FAIL state and every failure in the report.
    if b == 'CONTRACT_FAIL' and len(baseline['failures']) == 43 and set(baseline['failures']) == KNOWN_FAILURES:
        return dict(result, classification='CANDIDATE_PASS_KNOWN_BASELINE_CONTRACT_FAILURE', exit=0)
    return dict(result, classification='UNEXPECTED_BASELINE_REQUIRES_REVIEW')


def read_harness(path):
    rows = path.read_text().splitlines()
    parsed = {}
    for row in rows:
        match = re.fullmatch(r'([0-9a-f]{64})  (.+)', row)
        if not match or match[2] in parsed:
            raise ValueError('invalid or duplicate harness digest')
        parsed[match[2]] = match[1]
    if set(parsed) != HARNESS:
        raise ValueError('incomplete harness digest set')
    return parsed


def evaluate(root, expected_candidate):
    try:
        if not re.fullmatch(r'[0-9a-f]{40}', expected_candidate):
            raise ValueError('invalid expected candidate SHA')
        revisions = {label: (root / f'{label}-revision.txt').read_text().strip() for label in ('candidate', 'baseline')}
        if revisions != {'candidate': expected_candidate, 'baseline': BASELINE}:
            raise ValueError('revision mismatch')
        c_hash = read_harness(root / 'candidate-harness.sha256')
        if c_hash != read_harness(root / 'baseline-harness.sha256'):
            raise ValueError('checker/harness changed')
        parsed = {}
        for label in ('candidate', 'baseline'):
            statuses = []
            for suffix in ('exit', 'tee-exit'):
                raw = (root / f'{label}-{suffix}.txt').read_text().strip()
                if not re.fullmatch(r'[0-9]+', raw):
                    raise ValueError('malformed process status')
                statuses.append(int(raw))
            parsed[label] = dict(parse((root / f'{label}.log').read_text(), *statuses), sha=revisions[label])
        return dict(classify(parsed['candidate'], parsed['baseline']), harness=c_hash)
    except (OSError, UnicodeError, ValueError) as error:
        return {'classification': 'INCONCLUSIVE_EXECUTION_ERROR', 'exit': 1, 'reason': str(error)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('directory', type=pathlib.Path)
    parser.add_argument('--candidate-sha', required=True)
    args = parser.parse_args()
    result = evaluate(args.directory, args.candidate_sha)
    text = json.dumps(result, indent=2, ensure_ascii=False)
    print(text)
    # Output failure must fail the job too, not silently discard evidence.
    (args.directory / 'comparison.json').write_text(text + '\n')
    return result['exit']


if __name__ == '__main__':
    raise SystemExit(main())
