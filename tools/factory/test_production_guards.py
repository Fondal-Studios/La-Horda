"""Negative controls: invalid evidence cannot close production tasks or write an atlas."""
import importlib.util
from unittest import mock
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

    def test_current_and_historical_icon_receipts_are_verified_independently(self):
        # PR #181 adds other renderer definitions; the delivered icons stay exact.
        result = subprocess.run(['python3', 'tools/factory/reconcile-art-production.py'],
                                cwd=ROOT, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        self.assertFalse(json.loads(result.stdout)['needsReconciliation'])

    def test_corrupt_historical_icon_evidence_is_rejected(self):
        spec = importlib.util.spec_from_file_location('reconcile', ROOT / 'tools/factory/reconcile-art-production.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        entry = json.loads((ROOT / 'docs/production/art-integrations.json').read_text())['runtimeIconExports'][0]
        receipt = json.loads((ROOT / entry['receipt']).read_text())
        run = subprocess.run
        for path, expected in [(receipt['source'], 'icon renderer does not match referenced merge'),
                               (entry['receipt'], 'icon receipt exports do not match referenced merge')]:
            with self.subTest(path=path):
                def corrupt(args, **kwargs):
                    result = run(args, **kwargs)
                    if args == ['git', 'show', entry['merge'] + ':' + path]:
                        if path == receipt['source']:
                            result.stdout += b'// modified historical renderer'
                        else:
                            data = json.loads(result.stdout)
                            data['icons'][0]['rgbaSha256'] = '0' * 64
                            result.stdout = json.dumps(data).encode()
                    return result
                with mock.patch.object(module.subprocess, 'run', side_effect=corrupt):
                    with self.assertRaisesRegex(ValueError, expected):
                        module.verify_runtime_icons(entry)

if __name__ == '__main__':
    unittest.main()
