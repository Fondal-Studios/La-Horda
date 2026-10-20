import importlib.util
import tempfile
import unittest
from pathlib import Path
import numpy as np
from PIL import Image

P = Path(__file__).with_name('repair-outline-gaps.py')
spec = importlib.util.spec_from_file_location('repair_outline', P)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class OutlineGapsTest(unittest.TestCase):
    def sheet(self):
        data = np.zeros((1008, 448, 4), dtype=np.uint8)
        for n in range(36):
            x,y=n%4*112,n//4*112
            data[y+30:y+90,x+40:x+70] = [14,9,12,255]
            data[y+31:y+89,x+41:x+69] = [110,32,26,255]
        data[45,69] = [220,225,230,255]
        return Image.fromarray(data)

    def test_preserves_every_original_pixel_and_other_frames(self):
        source=self.sheet();a=np.array(source);fixed,records=m.repair(source);b=np.array(fixed)
        self.assertEqual([r['frame'] for r in records],[0])
        changed=np.any(a!=b,axis=-1)
        self.assertEqual(int(changed.sum()),1)
        self.assertTrue(np.array_equal(a[a[...,3]>0],b[a[...,3]>0]))
        self.assertEqual(b[45,70,3],255)
        self.assertLess(max(b[45,70,:3]),80)
        self.assertTrue(np.array_equal(a[112:],b[112:]))
        again,operations=m.repair(fixed)
        self.assertEqual(operations,[])
        self.assertEqual(fixed.tobytes(),again.tobytes())

    def test_rejects_semialpha_empty_missing_outline_and_large_defect(self):
        for kind in ['semi','empty','no_outline','large_defect']:
            a=np.array(self.sheet())
            if kind=='semi':a[40,40,3]=128
            elif kind=='empty':a[:112,:112]=0
            elif kind=='no_outline':a[30:90,40:70,:3]=220
            else:a[40:50,69,:3]=220
            with self.subTest(kind=kind),self.assertRaises(ValueError):m.repair(Image.fromarray(a))

    def test_rejects_clipping_and_invalid_source_hash(self):
        a=np.array(self.sheet());a[0,40]=[10,10,10,255]
        with self.assertRaises(ValueError):m.repair(Image.fromarray(a))
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'source.png';self.sheet().save(p)
            with self.assertRaisesRegex(ValueError,'hash mismatch'):
                m.build({'source':str(p),'sourceSha256':'bad'},Path(tmp)/'out')
            self.assertFalse((Path(tmp)/'out').exists())

    def test_rejects_overwrite_and_production_output(self):
        with tempfile.TemporaryDirectory() as tmp:
            for target in [Path(tmp),m.ROOT/'assets'/'new-outline']:
                with self.assertRaisesRegex(ValueError,'staging'):
                    m.build({},target)

if __name__=='__main__':unittest.main()
