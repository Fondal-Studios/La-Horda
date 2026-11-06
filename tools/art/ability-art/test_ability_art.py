"""Pruebas del circuito Pintor → Evaluador → Arquitecto (python3 -m unittest tools/art/ability-art/test_ability_art.py)."""
import copy
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import architect  # noqa: E402
import canon  # noqa: E402
import evaluator  # noqa: E402
import painter  # noqa: E402
import pipeline  # noqa: E402

PAL = ['#1a0f24', '#5b3770', '#aa75bd', '#e0b6f0', '#ffffff']
RAMP = canon.ramp_rgb(PAL)
RING = {'id': 't', 'kind': 'ring', 'radius': 150, 'frames': 10, 'glyph': 'stitch'}


def rgba(ab):
    return [canon.index_to_rgba(f, RAMP) for f in painter.frames_for('t', ab)]


class PainterTests(unittest.TestCase):
    def test_deterministic(self):
        a, b = painter.frames_for('t', RING), painter.frames_for('t', RING)
        self.assertTrue(all((x == y).all() for x, y in zip(a, b)))

    def test_only_ramp_tones_and_binary_alpha(self):
        for f in painter.frames_for('t', RING):
            self.assertTrue(set(np.unique(f)) <= set(range(6)))
        for f in rgba(RING):
            self.assertTrue(set(np.unique(f[..., 3])) <= {0, 255})

    def test_size_matches_engine_formula(self):
        self.assertEqual(painter.frames_for('t', RING)[0].shape, (canon.kvb_s(150),) * 2)
        self.assertEqual(canon.kvb_s(150), 68)

    def test_edge_reaches_real_radius(self):
        S = canon.kvb_s(150)
        f = painter.frames_for('t', RING)[5]
        ys, xs = np.nonzero(f)
        far = np.hypot(xs + .5 - S / 2, ys + .5 - S / 2).max()
        self.assertGreater(far, S / 2 - 1.6)

    def test_knobs_are_clamped(self):
        ab = copy.deepcopy(RING)
        painter.apply_ops(ab, [{'knob': 'fill', 'set': 9, 'why': ''}, {'knob': 'rim', 'add': -99, 'why': ''}, {'knob': 'nope', 'set': 1, 'why': ''}])
        self.assertLessEqual(ab['params']['fill'], canon.FILL_CAP)
        self.assertEqual(ab['params']['rim'], 1)


class EvaluatorTests(unittest.TestCase):
    def test_canary_semitransparent_alpha_rejected(self):
        fr = rgba(RING)
        for f in fr:
            f[..., 3][f[..., 3] > 0] = 140
        rep = evaluator.verdict(evaluator.evaluate(fr, RING, RAMP), False)
        self.assertEqual(rep['status'], 'FAIL')
        self.assertTrue(any('alfa' in r for r in rep['hard_fails']))

    def test_canary_off_palette_rejected(self):
        fr = rgba(RING)
        for f in fr:
            f[..., :3][f[..., 3] > 0] = (20, 220, 40)
        rep = evaluator.verdict(evaluator.evaluate(fr, RING, RAMP), False)
        self.assertEqual(rep['status'], 'FAIL')

    def test_canary_covering_disc_rejected(self):
        fr = rgba(RING)
        for f in fr:
            f[...] = 0
            S = f.shape[0]
            ys, xs = np.mgrid[0:S, 0:S]
            f[np.hypot(xs + .5 - S / 2, ys + .5 - S / 2) < S / 2 - 1] = (*RAMP[2], 255)
        rep = evaluator.verdict(evaluator.evaluate(fr, RING, RAMP), False)
        self.assertEqual(rep['status'], 'FAIL')
        self.assertTrue(rep['hard_fails'])

    def test_empty_art_rejected(self):
        fr = [np.zeros((68, 68, 4), np.uint8) for _ in range(10)]
        self.assertEqual(evaluator.verdict(evaluator.evaluate(fr, RING, RAMP), False)['status'], 'FAIL')

    def test_needs_improvement_over_baseline(self):
        fr = rgba(RING)
        rep = evaluator.evaluate(fr, RING, RAMP, None, baseline_total=100.0, baseline_criteria=None)
        rep = evaluator.verdict(rep, True)
        self.assertEqual(rep['status'], 'FAIL')
        self.assertTrue(any('mejora' in r for r in rep['reasons']))

    def test_failure_returns_actionable_ops(self):
        ab = dict(RING, params={'fill': 0.0, 'ticks': 4, 'rim': 1, 'sparks': 2})
        rep = evaluator.verdict(evaluator.evaluate(rgba(ab), ab, RAMP), False)
        if rep['status'] == 'FAIL':
            self.assertTrue(rep['ops'])
            for op in rep['ops']:
                self.assertIn(op['knob'], list(painter.KNOBS) + ['glyph'])
                self.assertTrue(op['why'])

    def test_distinct_abilities_flagged_when_identical(self):
        sig = evaluator._signature(rgba(RING)[4])
        rep = evaluator.evaluate(rgba(RING), RING, RAMP, {'other': sig})
        self.assertLess(rep['metrics']['min_sig_dist'], 0.05)
        self.assertTrue(any(o['knob'] == 'deco' for o in rep['ops']))


class LoopTests(unittest.TestCase):
    def test_loop_converges_or_escalates_and_never_integrates_failures(self):
        spec = {'guardian': 'unittest', 'palette': PAL, 'abilities': [
            dict(RING, id='a', params={'fill': 0.24, 'ticks': 16, 'rim': 4}),
            dict(RING, id='b', glyph='star', params={'deco': 2})]}
        with tempfile.TemporaryDirectory() as d:
            sp = Path(d) / 'u.json'
            canon.save_json(sp, spec)
            s = pipeline.run(sp, None, integrate=False, out=Path(d) / 'out')
            self.assertEqual(set(s['passed']) | set(s['escalated']), {'a', 'b'})
            self.assertTrue((Path(d) / 'out' / 'round-01' / 'INSTRUCCIONES_PINTOR.md').exists())
            for i in s['escalated']:
                self.assertNotEqual(s['state'][i]['status'], 'PASS')


class ArchitectTests(unittest.TestCase):
    def test_rle_roundtrip(self):
        f = painter.frames_for('t', RING)[4]
        s, out, p = architect.rle(f), [], 0
        flat = np.zeros(f.size, np.int8)
        i = 0
        while i < len(s):
            d = int(s[i]); i += 1
            j = s.index(';', i); n = int(s[i:j]); i = j + 1
            flat[p:p + n] = d; p += n
        self.assertTrue((flat.reshape(f.shape) == f).all())

    def test_module_contains_only_passed_abilities(self):
        spec = {'guardian': 'x', 'palette': PAL, 'abilities': [dict(RING, id='ok', replaces='ok_decal'), dict(RING, id='bad', replaces='bad_decal')]}
        fr = painter.frames_for('t', RING)
        src = architect.module_source('x', spec, {'ok': {'status': 'PASS', 'score': 90, 'frames': fr}, 'bad': {'status': 'FAIL', 'score': 10, 'frames': fr}})
        self.assertIn("'ok_decal'", src)
        self.assertNotIn('bad_decal', src)

    def test_integrated_vesper_is_reproducible(self):
        self.assertEqual(pipeline.check(Path(__file__).parent / 'specs' / 'vesper.json'), [])


if __name__ == '__main__':
    unittest.main()
