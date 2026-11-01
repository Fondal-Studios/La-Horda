import importlib.util
from pathlib import Path
import tempfile
import unittest
from PIL import Image

spec = importlib.util.spec_from_file_location('pose_guide', Path(__file__).with_name('pose-guide.py'))
guide = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guide)

class PoseGuideTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def test_exact_opposite_leg_pose_and_margins(self):
        result = guide.make_guide(3, self.root/'phase3.png')
        left, right = result['legs']['left'], result['legs']['right']
        self.assertLess(left['knee'][1], right['knee'][1]-80)
        self.assertLess(left['toe'][1], right['toe'][1]-100)
        self.assertLess(left['knee'][0], 300)
        self.assertGreater(right['knee'][0], 300)
        for phase in range(4):
            r = guide.make_guide(phase, self.root/f'phase{phase}.png')
            x1,y1,x2,y2 = r['subjectBounds']
            self.assertGreaterEqual(x1, .2*r['width']);self.assertGreaterEqual(y1, .2*r['height'])
            self.assertLessEqual(x2, .8*r['width']);self.assertLessEqual(y2, .8*r['height'])
            self.assertEqual(r['fixedUpperBody'], result['fixedUpperBody'])

    def test_bytes_reproducible_and_upper_body_never_mirrored(self):
        a=guide.make_guide(3,self.root/'a.png');b=guide.make_guide(3,self.root/'b.png')
        self.assertEqual(a['sha256'],b['sha256'])
        images=[]
        for phase in range(4):
            guide.make_guide(phase,self.root/f'p{phase}.png')
            images.append(Image.open(self.root/f'p{phase}.png').crop((200,140,400,320)).tobytes())
        self.assertTrue(all(x==images[0] for x in images))
        p1=guide.PHASES[1];self.assertLess(p1['right']['toe'][1],p1['left']['toe'][1])
        p0,p2=guide.PHASES[0],guide.PHASES[2]
        self.assertGreater(p0['left']['toe'][1],p0['right']['toe'][1])
        self.assertGreater(p2['right']['toe'][1],p2['left']['toe'][1])

    def test_invalid_phase_fails(self):
        for phase in [-1,4,1.5,True]:
            with self.assertRaises(ValueError):guide.make_guide(phase,self.root/'bad.png')

if __name__=='__main__':unittest.main()
