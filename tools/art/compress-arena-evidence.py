"""Lossless storage for the screenshots produced by the arena audit/test tools."""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[2] / 'docs/art-gate/arena-world-20261029'
for p in root.glob('*.png'):
    Image.open(p).save(p.with_suffix('.webp'), lossless=True, method=6)
    p.unlink()
