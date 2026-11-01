"""Pruebas de la Art Factory 2.0: python3 -m unittest tools/factory/test_art_factory.py"""
import json, shutil, sys, tempfile, unittest
from pathlib import Path
from unittest.mock import patch
from contextlib import redirect_stdout
import io
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
import art_factory as af


def sprite(semi=False, w=48, h=64, outline=True):
    a = np.zeros((h, w, 4), np.uint8)
    yy, xx = np.mgrid[0:h, 0:w]
    body = ((xx - w / 2) ** 2 / 16 ** 2 + (yy - h / 2) ** 2 / 26 ** 2) < 1
    rng = np.random.RandomState(3)
    a[body] = np.stack([rng.randint(60, 200, body.sum()), rng.randint(90, 220, body.sum()), rng.randint(40, 160, body.sum()), np.full(body.sum(), 255)], 1)
    if outline:
        pad = np.pad(body, 1); inner = pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]
        a[body & ~inner] = (18, 14, 22, 255)
    if semi:
        pad = np.pad(body, 1); edge = body & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
        a[..., 3][body & ~edge & (rng.rand(h, w) < .6)] = 140
    return a


def save_set(d, arrs):
    d.mkdir(parents=True, exist_ok=True)
    for i, a in enumerate(arrs): Image.fromarray(a, 'RGBA').save(d / f'idle{i+1}.png')


class T(unittest.TestCase):
    def test_master_reference_passes(self):
        af.refs(); r = af.evaluate_set(af.ROOT / 'assets/sprites/champions/tanque')
        self.assertTrue(r['pass'], r)   # el evaluador debe aprobar la referencia aprobada (calibración)

    def test_semialpha_sprite_is_critical(self):
        af.refs()
        with tempfile.TemporaryDirectory() as t:
            d = Path(t) / 's'; save_set(d, [sprite(semi=True), sprite(semi=True)])
            r = af.evaluate_set(d); self.assertGreaterEqual(r['critical'], 1); self.assertFalse(r['pass'])

    def test_harden_alpha_repairs_and_keeps_pixels(self):
        a = sprite(semi=True); b = af.harden_alpha(a)
        self.assertTrue(set(np.unique(b[..., 3])).issubset({0, 255}))
        self.assertEqual(int((a[..., 3] == 0).sum()), int((b[..., 3] == 0).sum()) - int(((a[..., 3] > 0) & (a[..., 3] < 128)).sum()))

    def test_reconstruct_never_touches_source_and_backs_up(self):
        af.refs()
        with tempfile.TemporaryDirectory() as t:
            global_out = af.OUT; global_orig = af.ORIG; af.OUT = Path(t) / 'out'; af.ORIG = Path(t) / 'orig'
            try:
                d = Path(t) / 'src'; save_set(d, [sprite(semi=True)] * 3)
                before = {p.name: p.read_bytes() for p in d.glob('*.png')}
                af.ROOT_BAK = af.ROOT
                e = af.reconstruct(d, 'unit')
                self.assertEqual(before, {p.name: p.read_bytes() for p in d.glob('*.png')})   # el original no cambia
                self.assertTrue(any(af.ORIG.glob('*.png')))                                    # y queda respaldado por hash
                self.assertLessEqual(len(e['attempts']), 3)
                self.assertIn(e['state'], ('candidato-aprobado-por-evaluador-automatico', 'ESCALADO', 'sin-cambios-necesarios'))
            finally: af.OUT = global_out; af.ORIG = global_orig

    def test_three_failures_escalate(self):
        af.refs()
        with tempfile.TemporaryDirectory() as t:
            go, gg = af.OUT, af.ORIG; af.OUT = Path(t) / 'out'; af.ORIG = Path(t) / 'orig'
            try:
                d = Path(t) / 'src'; base = sprite(h=80)   # pies inestables entre cuadros de reposo (±12 px): no se arregla con filtros de píxel
                save_set(d, [np.roll(base, 12 * k, axis=0) for k in range(3)])
                e = af.reconstruct(d, 'unfixable')
                self.assertEqual(len(e['attempts']), 3); self.assertEqual(e['state'], 'ESCALADO'); self.assertIn('escala', e['escalation'].lower())
            finally: af.OUT, af.ORIG = go, gg


class IntegrationGate(unittest.TestCase):
    """Real filesystem + hash checks; evaluator is controlled to isolate gate policy."""
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.out = self.root / 'out'; self.out.mkdir()
        self.src = self.root / 'source'; self.cand = self.root / 'candidate'
        save_set(self.src, [sprite()]); save_set(self.cand, [sprite()])
        for name, value in [('ROOT', self.root), ('OUT', self.out)]:
            p = patch.object(af, name, value); p.start(); self.addCleanup(p.stop)
        self.entry = {'source': 'source', 'best': 'candidate',
                      'state': 'candidato-aprobado-por-evaluador-automatico',
                      'source_hashes': af.png_hashes(self.src), 'candidate_hashes': af.png_hashes(self.cand),
                      'integracion': {'aprobacion_arquitecto_general_S0C': 'APROBADO'}}
        self.good = {'pass': True, 'score': 100, 'critical': 0, 'defects': []}

    def run_gate(self, evaluation=None):
        (self.out / 'ledger.json').write_text(json.dumps({'test': self.entry}))
        with patch.object(af, 'evaluate_set', return_value=self.good if evaluation is None else evaluation), redirect_stdout(io.StringIO()):
            result = af.integrate('test')
        self.assertFalse(result['instalado'])
        self.assertEqual(result['aprobacion_arquitecto_general_S0C'], 'PENDIENTE')
        return result

    def test_valid_candidate_is_technical_only(self):
        self.assertTrue(self.run_gate()['apto_tecnico'])

    def test_wrong_filename_and_dimensions_rejected(self):
        (self.cand / 'idle1.png').unlink()
        Image.new('RGBA', (1, 1), (1, 2, 3, 255)).save(self.cand / 'wrong.png')
        r = self.run_gate()
        self.assertFalse(r['apto_tecnico']); self.assertFalse(r['checks']['mismo_conjunto_de_archivos'])
        self.assertFalse(r['checks']['mismas_dimensiones'])

    def test_wrong_dimensions_same_filename_rejected(self):
        Image.new('RGBA', (1, 1), (1, 2, 3, 255)).save(self.cand / 'idle1.png')
        self.entry['candidate_hashes'] = af.png_hashes(self.cand)
        r = self.run_gate(); self.assertFalse(r['checks']['mismas_dimensiones']); self.assertFalse(r['apto_tecnico'])

    def test_candidate_mutation_rejected(self):
        a = sprite(); a[30, 20, 0] = 0; Image.fromarray(a).save(self.cand / 'idle1.png')
        r = self.run_gate(); self.assertFalse(r['checks']['hashes_candidato_vigentes']); self.assertFalse(r['apto_tecnico'])

    def test_source_mutation_rejected(self):
        a = sprite(); a[30, 20, 0] = 0; Image.fromarray(a).save(self.src / 'idle1.png')
        r = self.run_gate(); self.assertFalse(r['checks']['hashes_origen_vigentes']); self.assertFalse(r['apto_tecnico'])

    def test_missing_fingerprints_rejected(self):
        self.entry.pop('candidate_hashes'); self.assertFalse(self.run_gate()['apto_tecnico'])

    def test_missing_or_empty_candidate_rejected(self):
        (self.cand / 'idle1.png').unlink(); self.assertFalse(self.run_gate()['apto_tecnico'])
        self.cand.rmdir(); self.assertFalse(self.run_gate()['apto_tecnico'])

    def test_unreadable_png_rejected(self):
        (self.cand / 'idle1.png').write_bytes(b'not a png')
        self.assertFalse(self.run_gate()['apto_tecnico'])

    def test_missing_source_rejected(self):
        shutil.rmtree(self.src); self.assertFalse(self.run_gate()['apto_tecnico'])

    def test_current_low_score_critical_or_failed_evaluation_rejected(self):
        for change in ({'score': 89}, {'critical': 1}, {'pass': False}, {'critical': None}):
            with self.subTest(change=change):
                self.assertFalse(self.run_gate({**self.good, **change})['apto_tecnico'])

    def test_unapproved_state_rejected(self):
        self.entry['state'] = 'ESCALADO'; self.assertFalse(self.run_gate()['apto_tecnico'])

    def test_reconstruction_binds_fingerprints_and_invalidates_old_approval(self):
        (self.out / 'ledger.json').write_text(json.dumps({'test': self.entry}))
        bad = {**self.good, 'pass': False, 'score': 20}
        with patch.object(af, 'ORIG', self.root / 'backups'), patch.object(af, 'evaluate_set', side_effect=[bad, self.good]):
            self.entry['attempts'] = []
            (self.out / 'ledger.json').write_text(json.dumps({'test': self.entry}))
            result = af.reconstruct(self.src, 'test')
        self.assertEqual(result['source_hashes'], af.png_hashes(self.src))
        self.assertEqual(result['candidate_hashes'], af.png_hashes(self.root / result['best']))
        self.assertNotIn('integracion', result)
        self.entry = result
        self.assertTrue(self.run_gate()['apto_tecnico'])


class S0FMetricSemantics(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import subprocess
        cls.contract = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./tools/factory/s0f/contract').readContract('cazadora',{skin:'cazadora_escarcha'})))"], cwd=af.ROOT))

    def evaluate(self, image):
        with tempfile.TemporaryDirectory() as t:
            p = Path(t)
            (p / 'contract.json').write_text(json.dumps(self.contract))
            image.save(p / 'candidate.png')
            return af.evaluate_candidate(p / 'contract.json', p / 'candidate.png')

    def source(self):
        return Image.open(af.ROOT / self.contract['atlas']).convert('RGBA')

    def test_white_blue_contrast_is_reported_not_confused_with_smooth_shading(self):
        r = self.evaluate(self.source())
        self.assertTrue(r['checks']['estilo_en_rango_del_roster'])
        self.assertEqual(r['score'], 100)
        self.assertGreater(r['style_metrics']['shade_sd'], r['diagnostics'][0]['roster_range'][1])
        self.assertFalse(r['diagnostics'][0]['gating'])
        self.assertEqual(r['style_gating_metrics'], ['outline', 'soft', 'detail'])
        self.assertTrue(r['requires_human_art_review'])

    def test_rgb_blur_with_original_binary_alpha_still_fails_local_style(self):
        from PIL import ImageFilter
        original = self.source()
        blurred = original.filter(ImageFilter.GaussianBlur(2))
        blurred.putalpha(original.getchannel('A'))
        r = self.evaluate(blurred)
        self.assertTrue(r['checks']['alfa_binario'])
        self.assertFalse(r['checks']['estilo_en_rango_del_roster'])
        self.assertTrue(any(d['what'].startswith(('soft ', 'detail ')) for d in r['defects']))

    def test_smoothed_alpha_and_empty_frames_remain_rejected(self):
        from PIL import ImageFilter
        source = self.source()
        blurred = self.evaluate(source.filter(ImageFilter.GaussianBlur(2)))
        self.assertFalse(blurred['checks']['alfa_binario'])
        self.assertFalse(blurred['checks']['estilo_en_rango_del_roster'])
        self.assertGreater(blurred['critical'], 0)
        empty = self.evaluate(Image.new('RGBA', source.size))
        self.assertFalse(empty['checks']['sin_cuadros_vacios'])
        self.assertFalse(empty['checks']['estilo_en_rango_del_roster'])
        self.assertGreater(empty['critical'], 0)


class DirectionalReferenceV2(unittest.TestCase):
    def test_walk_down_front_identity_and_ordered_single_row_are_pixel_preserving(self):
        import subprocess
        c = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./tools/factory/s0f/contract').readContract('cazadora')))"], cwd=af.ROOT))
        self.assertEqual(c['referenceCrops']['walk_down'], [790, 280, 1080, 620])
        with tempfile.TemporaryDirectory() as t:
            p = Path(t); contract = p / 'contract.json'; contract.write_text(json.dumps(c))
            result = af.prepare_reference(contract, p / 'front.png', 'walk_down')
            front = Image.open(p / 'front.png').convert('RGBA')
            expected = Image.open(af.ROOT / c['codexPage']).convert('RGBA').crop((790, 280, 1080, 620))
            self.assertEqual(front.tobytes(), expected.tobytes()); self.assertEqual(result['preparation_version'], 'directional-v3')
            side = af.prepare_reference(contract, p / 'other.png', 'walk_side')
            self.assertEqual(side['crop'], c['referenceCrop'])
            frames = c['clips']['walk_down']['unique'][:4]
            af.refstrip(contract, json.dumps(frames), p / 'row.png', 'walk_down')
            cells = af.cells_of(af.load(af.ROOT / c['atlas']), c['cell']['w'], c['cell']['h'], c['cols'])
            cw, ch = c['cell']['w'], c['cell']['h']
            union = np.any(np.stack([cells[i][..., 3] > 0 for i in frames]), axis=0); ys, xs = np.where(union)
            x0, y0, x1, y1 = max(0, int(xs.min())-8), max(0, int(ys.min())-8), min(cw, int(xs.max())+9), min(ch, int(ys.max())+9)
            cells = [a[y0:y1, x0:x1] for a in cells]; cw, ch = x1-x0, y1-y0
            width = cw * len(frames); height = max(ch, width // 2)
            canvas = Image.new('RGBA', (width, height))
            for k, fi in enumerate(frames): canvas.paste(Image.fromarray(cells[fi], 'RGBA'), (k*cw, (height-ch)//2))
            scale = 3 if min(canvas.size)*3 >= 480 else 4
            expected_row = canvas.resize((width*scale, height*scale), Image.Resampling.NEAREST)
            actual = Image.open(p / 'row.png').convert('RGBA')
            self.assertEqual(actual.tobytes(), expected_row.tobytes())
            self.assertLessEqual(actual.width / actual.height, 2)


class CheckerboardRejection(unittest.TestCase):
    def test_baked_rgb_checkerboard_is_not_transparency_and_never_creates_parts(self):
        import subprocess
        from PIL import ImageDraw
        c = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./tools/factory/s0f/contract').readContract('cazadora')))"], cwd=af.ROOT))
        with tempfile.TemporaryDirectory() as t:
            p = Path(t); contract = p / 'contract.json'; contract.write_text(json.dumps(c))
            yy, xx = np.indices((240, 960)); gray = np.where(((xx//16)+(yy//16))%2, 165, 83).astype(np.uint8)
            im = Image.fromarray(np.repeat(gray[..., None], 3, axis=2), 'RGB'); draw = ImageDraw.Draw(im)
            for k in range(4): draw.rectangle((60+k*240,40,160+k*240,200), fill=(20,90,30))
            im.save(p / 'checker.png'); result = af.assemble(contract, p / 'checker.png', 'walk_down', '[0,1,2,3]', p / 'parts')
            self.assertFalse(result['ok']); self.assertIn('fondo no es plano', result['reason'])
            self.assertFalse((p / 'parts').exists())


if __name__ == '__main__': unittest.main()
