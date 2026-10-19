"""Negative controls: invalid evidence cannot close production tasks or write an atlas."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]

class ProductionGuards(unittest.TestCase):
    def test_wrong_integration_hash_never_rewrites_inventory(self):
        paths = [ROOT / 'art-source/entregas/control_produccion.json', ROOT / 'art-source/entregas/bloques/plan_bloques.json']
        before = [hashlib.sha256(p.read_bytes()).digest() for p in paths]
        data = json.loads((ROOT / 'docs/production/art-integrations.json').read_text())
        data['integrations'][0]['atlasSha256'] = '0' * 64
        with tempfile.TemporaryDirectory() as folder:
            registry = Path(folder) / 'bad.json'; registry.write_text(json.dumps(data))
            result = subprocess.run(['python3', 'tools/factory/reconcile-art-production.py', '--registry', str(registry), '--write'], cwd=ROOT, capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(b'atlas hash mismatch', result.stderr)
        self.assertEqual(before, [hashlib.sha256(p.read_bytes()).digest() for p in paths])

    def test_wrong_replacement_hash_never_creates_atlas(self):
        data = json.loads((ROOT / 'art-source/entregas/bloques/B001_soporte/revision-frame11/assembly.json').read_text())
        data['replacementSha256'] = '0' * 64
        with tempfile.TemporaryDirectory() as folder:
            registry, output = Path(folder) / 'bad.json', Path(folder) / 'atlas.png'
            registry.write_text(json.dumps(data))
            result = subprocess.run(['python3', 'tools/factory/replace-authored-frame.py', str(registry), str(output)], cwd=ROOT, capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn(b'Source hash mismatch', result.stderr)
            self.assertFalse(output.exists())

if __name__ == '__main__':
    unittest.main()
