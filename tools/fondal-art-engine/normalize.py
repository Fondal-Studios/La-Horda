#!/usr/bin/env python3
"""Lossless format normalization only; never invent alpha, scale, or missing poses."""
import argparse
from pathlib import Path
from PIL import Image
Image.MAX_IMAGE_PIXELS = 16777216
p = argparse.ArgumentParser()
p.add_argument('source', type=Path)
p.add_argument('dest', type=Path)
a = p.parse_args()
with Image.open(a.source) as im:
    im.verify()
with Image.open(a.source) as im:
    if im.width * im.height > Image.MAX_IMAGE_PIXELS:
        raise ValueError('Image pixel budget exceeded')
    rgba = im.convert('RGBA')
    rgba.save(a.dest, optimize=True)
    rgba.save(a.dest.with_suffix('.webp'), lossless=True, quality=100, method=6)
with Image.open(a.dest.with_suffix('.webp')) as im:
    # Lossless WebP may discard RGB under alpha 0; visible pixels must be identical.
    from PIL import ImageChops
    diff = ImageChops.difference(rgba, im.convert('RGBA'))
    assert not diff.getchannel('A').getbbox()
    assert not ImageChops.multiply(diff.convert('RGB'), rgba.getchannel('A').convert('RGB')).getbbox()
