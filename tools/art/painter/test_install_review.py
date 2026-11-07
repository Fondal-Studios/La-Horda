import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('install_review', Path(__file__).with_name('install_review.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class ReviewTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        for name in ('atlas.png', 'spec.json', 'assets/ui/codex/champions/hero.png', 'evidence.png'):
            p = self.root / name
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(name.encode())
        entry = lambda name: {'path': name, 'sha256': m.digest(self.root / name)}
        self.review = {'status':'PASS','reviewer':'visual reviewer','specSha256':m.digest(self.root/'spec.json'),
            'candidate':entry('atlas.png'),'reference':entry('assets/ui/codex/champions/hero.png'),
            'checks':dict.fromkeys(('identity','animationContinuity','nativePixelStyle','inGameScale'),'PASS'),
            'evidence':[entry('evidence.png')]}
    def run_review(self):
        receipt = self.root / 'visual-review.json'
        receipt.write_text(json.dumps(self.review))
        return m.require_review(self.root, self.root/'atlas.png', self.root/'spec.json', receipt)
    def test_complete(self):
        self.assertEqual(self.run_review()['status'], 'PASS')
    def test_no_receipt(self):
        with self.assertRaises(ValueError):
            m.require_review(self.root,self.root/'atlas.png',self.root/'spec.json',self.root/'missing.json')
    def test_changed_files(self):
        for name in ('atlas.png','spec.json','assets/ui/codex/champions/hero.png','evidence.png'):
            with self.subTest(name=name):
                p=self.root/name; original=p.read_bytes(); p.write_bytes(b'changed')
                with self.assertRaises(ValueError): self.run_review()
                p.write_bytes(original)
    def test_unapproved(self):
        for status in ('FIX','STRUCTURAL_PASS','REJECT',None):
            self.review['status']=status
            with self.assertRaises(ValueError): self.run_review()
    def test_incomplete_checks(self):
        for key in self.review['checks']:
            self.review['checks'][key]='PENDING'
            with self.assertRaises(ValueError): self.run_review()
            self.review['checks'][key]='PASS'
    def test_wrong_candidate(self):
        self.review['candidate']={'path':'evidence.png','sha256':m.digest(self.root/'evidence.png')}
        with self.assertRaises(ValueError): self.run_review()
    def test_no_evidence(self):
        self.review['evidence']=[]
        with self.assertRaises(ValueError): self.run_review()
    def test_non_codex_reference(self):
        self.review['reference']={'path':'evidence.png','sha256':m.digest(self.root/'evidence.png')}
        with self.assertRaises(ValueError): self.run_review()
    def test_escape(self):
        self.review['reference']['path']='../outside.png'
        with self.assertRaises(ValueError): self.run_review()

if __name__ == '__main__': unittest.main()
