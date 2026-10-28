import importlib.util
from pathlib import Path
import sys
import unittest
import numpy as np
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/art/pixrig'))
from pixrig import Rig, Mat, Poly, ramp_from, _hashgrid

class OverscanTests(unittest.TestCase):
    def test_recovers_geometry_outside_cell_without_scaling(self):
        rig = Rig(12, 12, {'body': Mat(ramp_from('#123456', '#456789', '#789abc'))})
        rig.bone('root', at=(1, 6))
        rig.part('body', 'root', Poly([(-5, -2), (5, -2), (5, 2), (-5, 2)]), 'body', 0)
        old = np.array(rig.render({}))
        rig.padding = 8
        new = np.array(rig.render({}))
        self.assertEqual(new.shape, (28, 28, 4))
        self.assertGreater(np.count_nonzero(new[:, :, 3]), np.count_nonzero(old[:, :, 3]))
        self.assertTrue(np.all(new[8:20, 8:20, 3][old[:, :, 3] > 0] == 255))
        self.assertEqual(np.count_nonzero(new[[0, -1], :, 3]), 0)
        self.assertEqual(np.count_nonzero(new[:, [0, -1], 3]), 0)
    def test_dissolve_noise_keeps_original_coordinates(self):
        np.testing.assert_array_equal(_hashgrid(12, 12, 7), _hashgrid(28, 28, 7, offset=8)[8:20, 8:20])
    def test_invalid_padding_fails(self):
        rig = Rig(12, 12, {})
        rig.padding = -1
        with self.assertRaises(ValueError): rig.render({})

if __name__ == '__main__': unittest.main()
