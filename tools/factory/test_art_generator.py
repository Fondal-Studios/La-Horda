import io, json, os, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import art_generator as g


class Resp(io.BytesIO):
    def __enter__(self): return self
    def __exit__(self, *a): pass


def fake_open(req, timeout=0):
    import base64
    return Resp(json.dumps({'data': [{'b64_json': base64.b64encode(b'\x89PNG-fake').decode()}]}).encode())


class T(unittest.TestCase):
    def setUp(self):
        for e in ('ART_GEN_API_KEY', 'OPENAI_API_KEY'): os.environ.pop(e, None)
        self.t = tempfile.TemporaryDirectory(); g.OUT = Path(self.t.name)
    def tearDown(self): self.t.cleanup()
    def test_no_key_blocks_and_spends_nothing(self):
        r = g.run('cazadora', 3, 'openai', 10, True, fake_open); self.assertIn('bloqueado', r['estado']); self.assertFalse(any(Path(self.t.name).iterdir()))
    def test_dry_run_by_default(self):
        os.environ['ART_GEN_API_KEY'] = 'k'; r = g.run('cazadora', 3, 'openai', 10, False, fake_open); self.assertIn('dry-run', r['estado']); self.assertFalse(any(Path(self.t.name).iterdir()))
    def test_budget_cap(self):
        os.environ['ART_GEN_API_KEY'] = 'k'; r = g.run('cazadora', 3, 'openai', 0.10, True, fake_open); self.assertIn('rechazado', r['estado'])
    def test_generates_candidates_not_installed_and_never_logs_key(self):
        os.environ['ART_GEN_API_KEY'] = 'sekret'; r = g.run('cazadora', 2, 'openai', 5, True, fake_open)
        self.assertEqual(len(r['archivos']), 2); led = (Path(self.t.name) / 'spend-ledger.json').read_text()
        self.assertIn('CANDIDATO_NO_APROBADO', led); self.assertNotIn('sekret', led)
        self.assertTrue(all(not a.startswith('assets/') for a in r['archivos']))


if __name__ == '__main__': unittest.main()
