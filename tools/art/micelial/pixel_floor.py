#!/usr/bin/env python3
"""Suelo del Reino Micelial a píxel nativo canónico (docs/ART_BIBLE.md §14).
Problema: los mapas (1536×1024, ≈2,2 u/px) venían como pintura con ruido de JPG y detalle de 1 px (hebras, motas violetas y
cian sueltas, retículas amarillas) que se leía como ruido de alta frecuencia y artefactos sobre la tierra, y se dibujaban
suavizados (imageSmoothingEnabled = true). Esta herramienta, sin recursos de terceros, parte del mismo mapa del juego y:
  1. mediana 3×3 por canal (mata el ruido de JPG y las motas de 1 px),
  2. paleta propia de K colores por k-means sobre el mismo mapa (conserva el tono: agua teal, tierra, hongos),
  3. filtro de moda 3×3 sobre los índices (clústeres de ≥3 px: sin píxeles sueltos),
  4. limpieza de componentes diminutos (≤ MIN_CLUSTER px) que quedaron: se funden con el vecino mayoritario.
Salida: PNG con paleta (sin degradé ni JPG) que el juego dibuja con vecino más cercano.
Uso:  python3 tools/art/micelial/pixel_floor.py          (lee art-source/micelial/map/*.jpg, escribe assets/.../map/*.png)"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.cluster.vq import kmeans2, vq

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SRC = os.path.join(ROOT, 'art-source', 'micelial', 'map')
OUT = os.path.join(ROOT, 'assets', 'sprites', 'arenas', 'micelial', 'map')
K = 72
MIN_CLUSTER = 4


def clean(path, seed):
    a = np.asarray(Image.open(path).convert('RGB'))
    a = ndi.median_filter(a, size=(3, 3, 1))
    rng = np.random.default_rng(seed)
    flat = a.reshape(-1, 3).astype(np.float64)
    sample = flat[rng.choice(len(flat), 120000, replace=False)]
    cent, _ = kmeans2(sample, K, minit='++', seed=seed, iter=18)
    idx = np.empty(len(flat), np.int32)
    for i in range(0, len(flat), 200000):
        idx[i:i + 200000] = vq(flat[i:i + 200000], cent)[0]
    idx = idx.reshape(a.shape[:2])
    for _ in range(2):  # moda 3×3
        best = np.zeros(idx.shape, np.float32); new = idx.copy()
        for k in range(K):
            c = ndi.uniform_filter((idx == k).astype(np.float32), 3) * 9
            sel = c > best; best = np.where(sel, c, best); new = np.where(sel, k, new)
        idx = np.where(best >= 4.5, new, idx)
    # componentes pequeños -> vecino mayoritario
    for k in range(K):
        lab, n = ndi.label(idx == k)
        if n == 0: continue
        size = ndi.sum(np.ones_like(lab), lab, index=np.arange(1, n + 1))
        small = np.isin(lab, np.nonzero(size <= MIN_CLUSTER)[0] + 1)
        if small.any():
            nearest = ndi.distance_transform_edt(small, return_distances=False, return_indices=True)
            idx = np.where(small, idx[nearest[0], nearest[1]], idx)
    pal = np.clip(np.round(cent), 0, 255).astype(np.uint8)
    out = Image.fromarray(idx.astype(np.uint8), 'P')
    out.putpalette(pal.reshape(-1).tolist() + [0] * (768 - K * 3))
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    for i, n in enumerate(('map_initial', 'map_mature')):
        im = clean(os.path.join(SRC, n + '.jpg'), 11 + i)
        p = os.path.join(OUT, n + '.png'); im.save(p, optimize=True)
        print(n, os.path.getsize(p) // 1024, 'KB')


if __name__ == '__main__':
    main()
