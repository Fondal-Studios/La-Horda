"""Negative controls: invalid evidence cannot close production tasks or write an atlas."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from PIL import Image

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

    def test_png_compression_is_irrelevant_but_changed_pixels_fail(self):
        folder = ROOT / 'art-source/entregas/2026-10_mundo/ui/iconos'
        png, receipt = folder / 'idolo.png', folder / 'entrega.json'
        original, original_receipt = png.read_bytes(), receipt.read_bytes()
        def update_receipt():
            data = json.loads(original_receipt)
            next(x for x in data['icons'] if x['id'] == 'idolo')['pngSha256'] = hashlib.sha256(png.read_bytes()).hexdigest()
            receipt.write_text(json.dumps(data))
        def verify():
            return subprocess.run(['node', 'tools/factory/export-runtime-icons.js'], cwd=ROOT, capture_output=True)
        try:
            with Image.open(png) as source:
                image = source.copy()
            image.save(png, compress_level=0)
            self.assertNotEqual(png.read_bytes(), original)
            update_receipt()
            result = verify()
            self.assertEqual(result.returncode, 0, result.stderr.decode())
            image.putpixel((0, 0), (255, 0, 0, 255))
            image.save(png, compress_level=0)
            update_receipt()
            result = verify()
            self.assertNotEqual(result.returncode, 0)
            self.assertIn(b'Export pixels differ', result.stderr)
        finally:
            png.write_bytes(original)
            receipt.write_bytes(original_receipt)


    def test_wrong_icon_mapping_never_rewrites_inventory(self):
        paths = [ROOT / 'art-source/entregas/control_produccion.json', ROOT / 'art-source/entregas/bloques/plan_bloques.json']
        before = [hashlib.sha256(p.read_bytes()).digest() for p in paths]
        data = json.loads((ROOT / 'docs/production/art-integrations.json').read_text())
        data['runtimeIconExports'][0]['items'][0]['item'] = 'E-PXI-inexistente'
        with tempfile.TemporaryDirectory() as folder:
            registry = Path(folder) / 'bad.json'
            registry.write_text(json.dumps(data))
            result = subprocess.run(['python3', 'tools/factory/reconcile-art-production.py',
                                     '--registry', str(registry), '--write'], cwd=ROOT, capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(b'icon task mapping', result.stderr)
        self.assertEqual(before, [hashlib.sha256(p.read_bytes()).digest() for p in paths])


    def test_merge_before_delivery_cannot_close_icon_tasks(self):
        paths = [ROOT / 'art-source/entregas/control_produccion.json', ROOT / 'art-source/entregas/bloques/plan_bloques.json']
        before = [hashlib.sha256(p.read_bytes()).digest() for p in paths]
        data = json.loads((ROOT / 'docs/production/art-integrations.json').read_text())
        data['runtimeIconExports'][0]['merge'] = 'af87450f036ebb701021145f83a79bb0b22bc408'
        with tempfile.TemporaryDirectory() as folder:
            registry = Path(folder) / 'bad-merge.json'
            registry.write_text(json.dumps(data))
            result = subprocess.run(['python3', 'tools/factory/reconcile-art-production.py',
                                     '--registry', str(registry), '--write'], cwd=ROOT, capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(b'icon PNG absent from referenced merge', result.stderr)
        self.assertEqual(before, [hashlib.sha256(p.read_bytes()).digest() for p in paths])

if __name__ == '__main__':
    unittest.main()
