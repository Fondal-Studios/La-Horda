#!/usr/bin/env python3
"""Lleva un retrato de jefe de campo de batalla (assets/sprites/battlefield/<clave>.png, 4 cuadros de 448×384, casi
ilustración: ≈0,76 u/px, miles de tonos, bordes suaves) al píxel nativo canónico de docs/ART_BIBLE.md §14:
  1. reduce ×FACTOR (promedio por caja) → la grilla nativa del arte,
  2. paleta propia de K colores por k-means sobre los 4 cuadros (rampas por material: sin degradé suave),
  3. alfa 0/255, contorno oscuro de 1 px nativo alrededor de la silueta,
  4. amplía ×FACTOR por vecino más cercano al mismo tamaño de celda (el juego usa w/h/ref del meta: no cambian).
Sin recursos de terceros: parte del mismo arte del juego. El original se conserva en art-source/battlefield/.
Uso: python3 tools/art/battlefield_pixelize.py dragon_forja [factor=2] [colores=40]"""
import os, sys, shutil
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.cluster.vq import kmeans2, vq

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CELL_W, CELL_H, N = 448, 384, 4


def main():
    key = sys.argv[1]; F = int(sys.argv[2]) if len(sys.argv) > 2 else 2; K = int(sys.argv[3]) if len(sys.argv) > 3 else 40
    path = os.path.join(ROOT, 'assets', 'sprites', 'battlefield', key + '.png')
    keep = os.path.join(ROOT, 'art-source', 'battlefield', key + '.png')
    if not os.path.exists(keep):
        os.makedirs(os.path.dirname(keep), exist_ok=True); shutil.copy(path, keep)
    src = Image.open(keep).convert('RGBA')
    A = np.asarray(src).astype(np.float64)
    h, w = A.shape[:2]
    # promedio por caja ponderado por alfa
    a = A[..., 3:4] / 255.0
    pm = (A[..., :3] * a).reshape(h // F, F, w // F, F, 3).sum((1, 3)); am = a.reshape(h // F, F, w // F, F, 1).sum((1, 3))
    rgb = pm / np.maximum(am, 1e-6); alpha = (am[..., 0] / (F * F)) >= 0.5
    flat = rgb[alpha]
    rng = np.random.default_rng(5)
    cent, _ = kmeans2(flat[rng.choice(len(flat), min(80000, len(flat)), replace=False)], K, minit='++', seed=5, iter=20)
    idx = np.zeros(alpha.shape, np.int32); idx[alpha] = vq(flat, cent)[0]
    # moda 3×3 para quitar píxeles sueltos de color dentro de la silueta
    best = np.zeros(idx.shape, np.float32); new = idx.copy()
    for k in range(K):
        c = ndi.uniform_filter(((idx == k) & alpha).astype(np.float32), 3) * 9
        sel = c > best; best = np.where(sel, c, best); new = np.where(sel, k, new)
    idx = np.where(alpha & (best >= 4.5), new, idx)
    pal = np.clip(np.round(cent), 0, 255).astype(np.uint8)
    out = np.zeros(alpha.shape + (4,), np.uint8)
    out[alpha, :3] = pal[idx[alpha]]; out[alpha, 3] = 255
    # contorno de 1 px nativo (por cuadro, para no pasar de una celda a otra)
    dark = pal[np.argmin(pal.astype(int).sum(1))] // 2
    cw, ch = CELL_W // F, CELL_H // F
    for i in range(N):
        sl = (slice(0, alpha.shape[0]), slice(i * cw, (i + 1) * cw))
        m = alpha[sl]; ring = ndi.binary_dilation(m, structure=ndi.generate_binary_structure(2, 1)) & ~m
        o = out[sl]; o[ring, :3] = dark; o[ring, 3] = 255
    big = Image.fromarray(out, 'RGBA').resize((w, h), Image.NEAREST)
    big.save(path, optimize=True); big.save(path[:-4] + '.webp', lossless=True, quality=100, method=6)
    print(key, 'factor', F, 'colores', K, 'png', os.path.getsize(path) // 1024, 'KB')


if __name__ == '__main__':
    main()
