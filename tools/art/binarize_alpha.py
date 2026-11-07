#!/usr/bin/env python3
"""Cuantiza el alfa a binario (0/255) — contrato de pixel art de Thalen (ART_BIBLE §14, `binaryAlpha: true`).
Los átlas heredados traen alfa continuo (interior 252/253 y halos de 1-7). Umbral: alfa >= 128 -> 255, el resto -> 0 (y RGB a 0).
No repinta ni cambia el tamaño: solo quita semitransparencias. Reescribe el .webp sin pérdida si existe al lado.
Uso: python3 tools/art/binarize_alpha.py [--dry] ruta.png [...]      (idempotente)"""
import sys, io, os
import numpy as np
from PIL import Image
dry = '--dry' in sys.argv
for p in [a for a in sys.argv[1:] if not a.startswith('--')]:
    im = Image.open(p).convert('RGBA'); a = np.array(im)
    al = a[..., 3]; semi = int(((al > 0) & (al < 255)).sum()); tot = int((al > 0).sum())
    if semi == 0: print('ya binario', p); continue
    keep = al >= 128
    b = a.copy(); b[..., 3] = np.where(keep, 255, 0).astype(np.uint8); b[~keep, :3] = 0
    lost = int(((al > 0) & ~keep).sum())
    print(f'{p}: semitransp {semi}/{tot} ({semi/max(tot,1):.1%}) -> binario; píxeles quitados {lost} ({lost/max(tot,1):.2%})')
    if dry: continue
    Image.fromarray(b, 'RGBA').save(p, optimize=True)
    w = p[:-4] + '.webp'
    if os.path.exists(w):
        Image.fromarray(b, 'RGBA').save(w, 'WEBP', lossless=True, quality=100, method=5, exact=True)
        assert np.array(Image.open(w).convert('RGBA')).tobytes() == b.tobytes(), 'webp distinto: ' + w
