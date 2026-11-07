#!/usr/bin/env python3
"""Imagen suave (JPG/ilustración/textura) -> píxel nativo canónico (docs/ART_BIBLE.md §14), sin recursos de terceros:
reduce xF por promedio de caja, paleta propia de K colores (k-means), moda 3x3 sobre los índices (sin píxeles sueltos), amplía xF por vecino más cercano
al mismo tamaño. Salida PNG con paleta corta (sin degradé ni JPG). --wrap: textura que repite (el filtro de moda cruza los bordes).
Uso: python3 tools/art/native_pixelize.py <entrada> <salida.png> [F=3] [K=48] [--wrap]"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.cluster.vq import kmeans2, vq
a = [x for x in sys.argv[1:] if not x.startswith('--')]
src, dst = a[0], a[1]; F = int(a[2]) if len(a) > 2 else 3; K = int(a[3]) if len(a) > 3 else 48; wrap = '--wrap' in sys.argv
im = Image.open(src).convert('RGBA'); w, h = im.size
W2, H2 = -(-w // F) * F, -(-h // F) * F
if (W2, H2) != (w, h):
    pad = Image.new('RGBA', (W2, H2)); pad.paste(im, (0, 0)); pad.paste(im.crop((w - 1, 0, w, h)).resize((W2 - w, h)) if W2 > w else im.crop((0, 0, 0, 0)), (w, 0)) if W2 > w else None
    im = pad if W2 == w else im.resize((W2, H2), Image.NEAREST)
A = np.asarray(im).astype(np.float64); h2, w2 = A.shape[:2]
al = A[..., 3:4] / 255.0
pm = (A[..., :3] * al).reshape(h2 // F, F, w2 // F, F, 3).sum((1, 3)); am = al.reshape(h2 // F, F, w2 // F, F, 1).sum((1, 3))
rgb = pm / np.maximum(am, 1e-6); opaque = (am[..., 0] / (F * F)) >= 0.5
flat = rgb[opaque]; rng = np.random.default_rng(5)
cent, _ = kmeans2(flat[rng.choice(len(flat), min(80000, len(flat)), replace=False)], K, minit='++', seed=5, iter=20)
idx = np.zeros(opaque.shape, np.int32); idx[opaque] = vq(flat, cent)[0]
mode = 'wrap' if wrap else 'nearest'
best = np.zeros(idx.shape, np.float32); new = idx.copy()
for k in range(K):
    c = ndi.uniform_filter(((idx == k) & opaque).astype(np.float32), 3, mode=mode) * 9
    sel = c > best; best = np.where(sel, c, best); new = np.where(sel, k, new)
idx = np.where(opaque & (best >= 4.5), new, idx)
pal = np.clip(np.round(cent), 0, 255).astype(np.uint8)
out = np.zeros(opaque.shape + (4,), np.uint8); out[opaque, :3] = pal[idx[opaque]]; out[opaque, 3] = 255
big = Image.fromarray(out, 'RGBA').resize((w2, h2), Image.NEAREST).crop((0, 0, w, h))
big.save(dst, optimize=True); print(dst, 'F', F, 'K', K, Image.open(dst).size)
