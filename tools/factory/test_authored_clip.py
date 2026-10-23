import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from PIL import Image
spec = importlib.util.spec_from_file_location('clip', Path(__file__).with_name('extract-authored-clip.py'))
clip = importlib.util.module_from_spec(spec)
spec.loader.exec_module(clip)


class ClipTest(unittest.TestCase):
    def test_exact_pixels_and_rejections(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp); src = p/'source.png'; out = p/'out.png'; manifest = p/'source.json'
            im = Image.new('RGBA', (8, 4)); im.paste((30, 60, 90, 255), (1, 1, 3, 3)); im.paste((90, 50, 20, 255), (5, 1, 7, 3)); im.save(src)
            cfg = {'source': str(src), 'sourceSha256': hashlib.sha256(src.read_bytes()).hexdigest(), 'cell': 4, 'frames': [1, 0]}
            manifest.write_text(json.dumps(cfg)); report = clip.extract(manifest, out)
            self.assertEqual(report['status'], 'EXTRACTED_NOT_APPROVED')
            result = Image.open(out)
            self.assertEqual(result.crop((0, 0, 4, 4)).tobytes(), im.crop((4, 0, 8, 4)).tobytes())
            self.assertEqual(result.crop((4, 0, 8, 4)).tobytes(), im.crop((0, 0, 4, 4)).tobytes())
            for frames in ([2], [0, 0], [], [-1], [True]):
                with self.subTest(frames=frames):
                    cfg['frames'] = frames; manifest.write_text(json.dumps(cfg))
                    with self.assertRaises(ValueError): clip.extract(manifest, out)
            cfg['frames'] = [0]; cfg['sourceSha256'] = 'bad'; manifest.write_text(json.dumps(cfg))
            with self.assertRaisesRegex(ValueError, 'SHA-256'): clip.extract(manifest, out)


if __name__ == '__main__': unittest.main()
