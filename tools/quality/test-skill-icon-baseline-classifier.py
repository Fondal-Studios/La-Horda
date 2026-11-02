#!/usr/bin/env python3
import importlib.util
import json
import pathlib
import tempfile
import subprocess
import unittest

spec = importlib.util.spec_from_file_location('classifier', pathlib.Path(__file__).with_name('classify-skill-icon-baseline.py'))
C = importlib.util.module_from_spec(spec)
spec.loader.exec_module(C)
SHA = '51526a1af155787ec79dd3d9fd0b39bbd4a02361'
PREFIX = '\n'.join(['[arnés] servidor propio: http://127.0.0.1:1234 (raíz /repo)', 'autoprueba del verificador: ' + json.dumps(C.SELF, ensure_ascii=False), C.HUD, 'definitivas más parecidas: frozen fixture', 'íconos de kit más parecidos: frozen fixture']) + '\n'
PASS = PREFIX + C.PASS + '\n'
FAIL = PREFIX + 'FAIL (43)\n' + ''.join(' - ' + x + '\n' for x in sorted(C.KNOWN_FAILURES))
ONE = PREFIX + 'FAIL (1)\n - tanque btn-basic: marco basic incompleto en (0,0)\n'


class ClassifierTests(unittest.TestCase):
    def result(self, c=PASS, cs=0, b=FAIL, bs=1, ct=0, bt=0):
        return C.classify(C.parse(c, cs, ct), C.parse(b, bs, bt))

    def test_known_baseline_does_not_need_to_be_fixed_retroactively(self):
        r = self.result()
        self.assertEqual(r['exit'], 0)
        self.assertEqual(r['baseline']['state'], 'CONTRACT_FAIL')
        self.assertEqual(len(r['baseline']['failures']), 43)
        self.assertEqual(r['candidate']['state'], 'PASS')

    def test_both_pass(self):
        self.assertEqual(self.result(b=PASS, bs=0)['classification'], 'BOTH_PASS')

    def test_candidate_failure_never_passes(self):
        for c, b, bs in [(FAIL, FAIL, 1), (ONE, FAIL, 1), (FAIL, ONE, 1), (ONE, PASS, 0)]:
            with self.subTest(c=c, b=b):
                self.assertEqual(self.result(c=c, cs=1, b=b, bs=bs)['exit'], 1)

    def test_unknown_baseline_is_not_whitelisted(self):
        self.assertEqual(self.result(b=ONE)['classification'], 'UNEXPECTED_BASELINE_REQUIRES_REVIEW')
        wrong_roster = FAIL.replace('tanque btn-basic:', 'unknown_champion btn-basic:')
        self.assertEqual(self.result(b=wrong_roster)['exit'], 1)
        duplicate = FAIL.replace('tanque btn-basic:', 'mago btn-basic:')
        self.assertEqual(self.result(b=duplicate)['exit'], 1)

    def test_invalid_logs_symmetric(self):
        cases = [
            ('', 0), (PREFIX, 0), (PASS, 1), (FAIL, 0),
            (PASS + 'Error: late crash\n', 0), (PREFIX + 'Error: browser failed\n', 1),
            (PASS.replace(C.HUD, ''), 0), (PASS.replace(C.HUD, C.HUD+'\n'+C.HUD), 0),
            (PASS.replace('43 campeones', '42 campeones'), 0),
            (PASS.replace('301 íconos', '300 íconos'), 0),
            (PASS.replace('946 pares', '945 pares'), 0),
            (PASS.replace('"good": "PASS"', '"good": "FAIL"'), 0),
            (PASS.replace(C.SELF['wrongSize'], ''), 0),
            (PASS.replace('autoprueba del verificador: {', 'autoprueba del verificador: invalid{'), 0),
            (PASS + 'FAIL (1)\n - error\n', 0),
            (FAIL.replace('FAIL (43)', 'FAIL (42)'), 1),
            (FAIL + ' ... y 1 más\n', 1),
            (FAIL.replace('FAIL (43)', 'FAIL (81)'), 1),
            (ONE.replace('tanque btn-basic: marco basic incompleto en (0,0)', 'errores de página: ReferenceError'), 1),
            (ONE.replace('tanque btn-basic: marco basic incompleto en (0,0)', 'Traceback'), 1),
            (PASS + '\nFAIL (0)\n', 0),
        ]
        for log, status in cases:
            with self.subTest(log=log, status=status):
                self.assertEqual(C.parse(log, status, 0)['state'], 'EXECUTION_ERROR')
                self.assertEqual(self.result(c=log, cs=status)['exit'], 1)
                self.assertEqual(self.result(b=log, bs=status)['exit'], 1)

    def test_status_and_tee_errors_fail_closed(self):
        for status in (None, '0', True, 2, 124, 137, -9):
            with self.subTest(status=status):
                self.assertEqual(self.result(cs=status)['exit'], 1)
                self.assertEqual(self.result(bs=status)['exit'], 1)
        for status in (None, '0', True, 1, 124):
            with self.subTest(tee=status):
                self.assertEqual(self.result(ct=status)['exit'], 1)
                self.assertEqual(self.result(bt=status)['exit'], 1)

    def test_real_pipeline_status_capture(self):
        script = 'set -o pipefail; set +e; (exit 7) | tee /dev/null; S=("${PIPESTATUS[@]}"); printf "%s %s" "${S[0]}" "${S[1]}"'
        p = subprocess.run(['bash', '-c', script], text=True, capture_output=True)
        self.assertEqual(p.stdout, '7 0')
        with tempfile.TemporaryDirectory() as tmp:
            script = 'set -o pipefail; set +e; printf x | tee "$1" >/dev/null; S=("${PIPESTATUS[@]}"); printf "%s %s" "${S[0]}" "${S[1]}"'
            p = subprocess.run(['bash', '-c', script, 'capture-test', tmp], text=True, capture_output=True)
            self.assertEqual(p.stdout, '0 1')

    def fixture(self, root):
        harness = ''.join('a'*64+'  '+p+'\n' for p in sorted(C.HARNESS))
        for label, log, status, sha in [('candidate', PASS, 0, SHA), ('baseline', FAIL, 1, C.BASELINE)]:
            for suffix, value in [('revision.txt', sha), ('exit.txt', str(status)), ('tee-exit.txt', '0'), ('harness.sha256', harness)]:
                (root / f'{label}-{suffix}').write_text(value)
            (root / f'{label}.log').write_text(log)

    def test_evidence_io_identity_and_harness(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            self.fixture(root)
            self.assertEqual(C.evaluate(root, SHA)['exit'], 0)
            self.assertEqual(C.evaluate(root, 'bad-sha')['exit'], 1)
            self.assertEqual(C.evaluate(root, 'f'*40)['exit'], 1)
            for filename, content in [('baseline-revision.txt', 'f'*40), ('candidate-revision.txt', 'f'*40), ('baseline-harness.sha256', 'bad'), ('candidate-harness.sha256', ''), ('candidate-exit.txt', '0 junk'), ('baseline-tee-exit.txt', '1')]:
                self.fixture(root)
                (root/filename).write_text(content)
                with self.subTest(file=filename):
                    self.assertEqual(C.evaluate(root, SHA)['exit'], 1)
            self.fixture(root)
            (root/'candidate.log').unlink()
            self.assertEqual(C.evaluate(root, SHA)['exit'], 1)
            self.fixture(root)
            (root/'baseline-harness.sha256').write_text((root/'baseline-harness.sha256').read_text().replace('a'*64, 'b'*64, 1))
            self.assertEqual(C.evaluate(root, SHA)['exit'], 1)


if __name__ == '__main__':
    unittest.main()
