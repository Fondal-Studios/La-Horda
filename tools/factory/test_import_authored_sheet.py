import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('authored', Path(__file__).with_name('import-authored-sheet.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ImportTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir=ROOT)
        self.addCleanup(self.tmp.cleanup)
        self.source = Path(self.tmp.name) / 'sheet.png'
        self.output = Path(self.tmp.name) / 'out'

    def source_manifest(self, count=36):
        image = Image.new('RGBA', (448, 1008))
        draw = ImageDraw.Draw(image)
        for i in range(count):
            x, y = i % 4 * 112 + 42, i // 4 * 112 + 20
            draw.rectangle((x, y, x + 28, y + 69), fill=(i + 1, 100, 80, 255))
        image.save(self.source)
        return {'source': str(self.source.relative_to(ROOT)), 'sourceSha256': hashlib.sha256(self.source.read_bytes()).hexdigest(), 'targetHeight': 70}

    def test_all_poses_and_binary_alpha(self):
        module.build(self.source_manifest(), self.output)
        image = Image.open(self.output / 'atlas.png')
        self.assertEqual(image.size, (448, 1008))
        self.assertEqual(set(image.getchannel('A').getdata()), {0, 255})
        for i in range(36):
            self.assertIn((i + 1, 100, 80, 255), image.crop((i % 4 * 112, i // 4 * 112, (i % 4 + 1) * 112, (i // 4 + 1) * 112)).getdata())

    def test_missing_pose_fails_without_output(self):
        with self.assertRaisesRegex(ValueError, '36 separated'):
            module.build(self.source_manifest(35), self.output)
        self.assertFalse(self.output.exists())

    def test_changed_source_fails(self):
        manifest = self.source_manifest()
        self.source.write_bytes(self.source.read_bytes() + b'changed')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            module.build(manifest, self.output)

    def test_source_edge_clipping_fails_without_output(self):
        manifest = self.source_manifest()
        image = Image.open(self.source)
        ImageDraw.Draw(image).rectangle((42, 0, 70, 20), fill=(1, 100, 80, 255))
        image.save(self.source)
        manifest['sourceSha256'] = hashlib.sha256(self.source.read_bytes()).hexdigest()
        with self.assertRaisesRegex(ValueError, 'canvas edge'):
            module.build(manifest, self.output)
        self.assertFalse(self.output.exists())

    def test_clipping_fails_without_output(self):
        manifest = self.source_manifest()
        manifest['targetHeight'] = 130
        with self.assertRaisesRegex(ValueError, 'clip'):
            module.build(manifest, self.output)
        self.assertFalse(self.output.exists())

    def test_explicit_nonuniform_rows(self):
        manifest = self.source_manifest()
        bounds = [0, 90, 180, 280, 380, 490, 610, 740, 870, 1008]
        image = Image.new('RGBA', (448, 1008))
        draw = ImageDraw.Draw(image)
        for i in range(36):
            x, y = i % 4 * 112 + 42, bounds[i // 4] + 10
            draw.rectangle((x, y, x + 28, y + 69), fill=(i + 1, 100, 80, 255))
        image.save(self.source)
        manifest.update(rowBounds=bounds, sourceSha256=hashlib.sha256(self.source.read_bytes()).hexdigest())
        self.assertEqual(module.build(manifest, self.output)['poses'], 36)

    def test_invalid_row_layout_rejected(self):
        manifest = self.source_manifest()
        manifest['rowBounds'] = [0, 112, 224, 224, 448, 560, 672, 784, 896, 1008]
        with self.assertRaisesRegex(ValueError, 'rowBounds'):
            module.build(manifest, self.output)


if __name__ == '__main__':
    unittest.main()
