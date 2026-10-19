"""A failed or incomplete detector cannot be mistaken for approved art."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('candidate_audit', Path(__file__).with_name('audit-authored-candidates.py'))
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class CandidateAuditTests(unittest.TestCase):
    def report(self):
        return {'sha256': 'input', 'status': 'TECHNICAL_SCREEN_PASS', 'failedFrames': [],
                'rows': [{'frame': n, 'opaque': 1, 'issues': []} for n in range(36)]}

    def test_complete_native_pass_is_only_a_screen(self):
        self.assertEqual(audit.validate_report(self.report(), 'input', 0), [])

    def test_known_fix_is_preserved(self):
        report = self.report()
        report['rows'][11]['issues'] = ['ILUSTRACION']
        report.update(status='FIX', failedFrames=[11])
        self.assertEqual(audit.validate_report(report, 'input', 1), [11])

    def test_incomplete_duplicated_or_stale_reports_fail(self):
        for mutate in [lambda d: d['rows'].pop(), lambda d: d['rows'][4].update(frame=3),
                       lambda d: d.update(sha256='old')]:
            report = self.report()
            mutate(report)
            with self.assertRaises(ValueError):
                audit.validate_report(report, 'input', 0)

    def test_hidden_empty_frame_fails(self):
        report = self.report()
        report['rows'][0]['opaque'] = 0
        with self.assertRaises(ValueError):
            audit.validate_report(report, 'input', 0)

    def test_process_error_cannot_use_a_valid_report(self):
        with self.assertRaises(ValueError):
            audit.validate_report(self.report(), 'input', 1)

    def test_contradictory_failed_frames_fail(self):
        report = self.report()
        report.update(status='FIX', failedFrames=[8])
        with self.assertRaises(ValueError):
            audit.validate_report(report, 'input', 1)


if __name__ == '__main__':
    unittest.main()
