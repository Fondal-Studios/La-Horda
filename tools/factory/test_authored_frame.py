"""Authored-frame geometry controls must preserve every unrequested pixel."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]


class AuthoredFrameTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.folder = Path(self.temp.name)
        self.atlas = self.folder / 'input.png'
        image = Image.new('RGBA', (448, 1008))
        for frame in range(36):
            image.paste((frame+1, 100, 80, 255), (frame%4*112+45, frame//4*112+87,
                                                frame%4*112+65, frame//4*112+107))
        image.save(self.atlas)
        self.replacement = self.folder / 'replacement.png'
        replacement = Image.new('RGBA', (60, 100))
        replacement.paste((10, 120, 90, 255), (20, 30, 40, 80))
        replacement.save(self.replacement)

    def run_case(self, target=None, tag='case'):
        manifest = {'atlas': str(self.atlas), 'replacement': str(self.replacement), 'frame': 11,
                    'atlasSha256': hashlib.sha256(self.atlas.read_bytes()).hexdigest(),
                    'replacementSha256': hashlib.sha256(self.replacement.read_bytes()).hexdigest()}
        if target is not None:
            manifest['targetHeight'] = target
        file, output = self.folder / (tag+'.json'), self.folder / (tag+'.png')
        file.write_text(json.dumps(manifest))
        result = subprocess.run(['python3', 'tools/factory/replace-authored-frame.py',
                                 str(file), str(output)], cwd=ROOT, capture_output=True)
        return result, output

    def assert_unchanged_others(self, output):
        with Image.open(self.atlas) as original, Image.open(output) as changed:
            for frame in range(36):
                if frame == 11:
                    continue
                x, y = frame%4*112, frame//4*112
                self.assertEqual(original.crop((x, y, x+112, y+112)).tobytes(),
                                 changed.crop((x, y, x+112, y+112)).tobytes())
            return changed.crop((336, 224, 448, 336)).getchannel('A').getbbox()

    def test_default_keeps_old_height_and35_frames(self):
        result, output = self.run_case()
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        box = self.assert_unchanged_others(output)
        self.assertEqual(box[3]-box[1], 20)
        self.assertEqual(box[3], 107)

    def test_authored_height_preserves_other35_frames_and_foot(self):
        result, output = self.run_case(30)
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        box = self.assert_unchanged_others(output)
        self.assertEqual(box[3]-box[1], 30)
        self.assertEqual(box[3], 107)

    def test_invalid_requests_never_create_outputs(self):
        for index, value in enumerate([True, 0, -1, 107, 1.5, '78']):
            with self.subTest(value=value):
                result, output = self.run_case(value, 'invalid'+str(index))
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(b'targetHeight', result.stderr)
                self.assertFalse(output.exists())

    def test_wide_replacement_cannot_clip(self):
        replacement = Image.new('RGBA', (60, 30))
        replacement.paste((20, 150, 90, 255), (2, 10, 58, 20))
        replacement.save(self.replacement)
        result, output = self.run_case(30, 'wide')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(b'would clip', result.stderr)
        self.assertFalse(output.exists())


if __name__ == '__main__':
    unittest.main()
