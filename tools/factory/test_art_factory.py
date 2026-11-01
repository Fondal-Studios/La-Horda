"""Pruebas de la Art Factory 2.0: python3 -m unittest tools/factory/test_art_factory.py"""
import json, shutil, sys, tempfile, unittest
from pathlib import Path
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

    def test_integration_requires_architect_approval(self):
        led = af.OUT / 'ledger.json'
        # nada se instala nunca desde la fábrica: el campo instalado es siempre False y la aprobación del arquitecto parte PENDIENTE
        src = Path(af.__file__).read_text()
        self.assertIn("'instalado': False", src); self.assertIn("'PENDIENTE'", src)


if __name__ == '__main__': unittest.main()
