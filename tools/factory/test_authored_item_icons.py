"""Native icon export proof accepts compression changes and rejects changed pixels."""
import hashlib
import json
from pathlib import Path
import subprocess
import unittest
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]

class AuthoredItemIcons(unittest.TestCase):
    def test_recompression_passes_but_changed_pixels_fail_without_rewriting(self):
        folder = ROOT / 'art-source/entregas/quality-item-icons-20261020'
        png, receipt = folder / 'quality_brakk_arma.png', folder / 'receipt.json'
        original, original_receipt = png.read_bytes(), receipt.read_bytes()
        def stamp():
            data = json.loads(original_receipt)
            next(x for x in data['icons'] if x['id'] == 'quality_brakk_arma')['pngSha256'] = hashlib.sha256(png.read_bytes()).hexdigest()
            receipt.write_text(json.dumps(data))
        def verify():
            return subprocess.run(['node', 'tools/factory/export-authored-item-icons.js'], cwd=ROOT, capture_output=True)
        try:
            with Image.open(png) as source:
                image = source.copy()
            image.save(png, compress_level=0)
            self.assertNotEqual(original, png.read_bytes())
            stamp()
            result = verify()
            self.assertEqual(result.returncode, 0, result.stderr.decode())
            image.putpixel((7, 5), (255, 0, 255, 255))
            image.save(png, compress_level=0)
            stamp()
            before = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in folder.iterdir() if p.is_file()}
            result = verify()
            self.assertNotEqual(result.returncode, 0)
            self.assertIn(b'stored export RGBA quality_brakk_arma', result.stderr)
            self.assertEqual(before, {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in folder.iterdir() if p.is_file()})
        finally:
            png.write_bytes(original)
            receipt.write_bytes(original_receipt)

if __name__ == '__main__':
    unittest.main()
