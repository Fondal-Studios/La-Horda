#!/usr/bin/env python3
"""Estatua central de la Ciudad Maldita: maestro Runway (art-source/runway-world/ciudad/ciudad_<job>/master.png)
-> quita el croma por relleno desde los bordes, recorta, reduce a escala nativa (BOX), cuantiza (<=48 tonos),
contorno 1 px y alfa binario. Salida: assets/vfx/ciudad/estatua_1.png (se dibuja x2). Determinista, 0 créditos."""
import os, sys, numpy as np
from collections import deque
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')) + '/'
# uso: build-ciudad-estatua.py [estatua|farol]  (farol: ciudad_farol -> assets/vfx/ciudad/farol_1.png, 44 px de alto, se dibuja x2)
JOB = sys.argv[1] if len(sys.argv) > 1 else 'estatua'
H = {'estatua': 104, 'farol': 44}[JOB]
OUTF = {'estatua': 'estatua_1.png', 'farol': 'farol_1.png'}[JOB]
im = Image.open(R + 'art-source/runway-world/ciudad/ciudad_%s/master.png' % JOB).convert('RGB')
a = np.asarray(im).astype(int); h, w, _ = a.shape
bg = np.median(np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)]), axis=0)
near = (np.abs(a - bg).sum(2) < 60) | ((a[:, :, 1] > a[:, :, 0] + 35) & (a[:, :, 1] > a[:, :, 2] + 35))   # croma y su sombra verde
seen = np.zeros((h, w), bool); q = deque()
for x in range(w):
    for y in (0, h - 1):
        if near[y, x]: q.append((y, x)); seen[y, x] = True
for y in range(h):
    for x in (0, w - 1):
        if near[y, x] and not seen[y, x]: q.append((y, x)); seen[y, x] = True
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not seen[ny, nx]: seen[ny, nx] = True; q.append((ny, nx))
alpha = np.where(seen, 0, 255).astype(np.uint8)
# erosiona 2 px el borde (halo verde mezclado con el croma) y promedia con color premultiplicado
m = alpha > 0
for _ in range(2):
    pm = np.pad(m, 1, constant_values=False); m = m & pm[:-2, 1:-1] & pm[2:, 1:-1] & pm[1:-1, :-2] & pm[1:-1, 2:]
ys, xs = np.where(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
s = H / (y1 - y0); nw = max(1, round((x1 - x0) * s))
mf = m[y0:y1, x0:x1].astype(np.float32); cf = a[y0:y1, x0:x1].astype(np.float32) * mf[..., None]
A = np.asarray(Image.fromarray(mf, 'F').resize((nw, H), Image.BOX))
C = np.stack([np.asarray(Image.fromarray(cf[..., i], 'F').resize((nw, H), Image.BOX)) for i in range(3)], -1)
C = np.clip(C / np.maximum(A[..., None], 1e-3), 0, 255).astype(np.uint8)
small = Image.fromarray(np.dstack([C, (A * 255).astype(np.uint8)]), 'RGBA')
al = np.asarray(small.getchannel('A')) >= 128
rgb = small.convert('RGB').quantize(48, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
arr = np.pad(np.asarray(rgb), ((1, 1), (1, 1), (0, 0))).copy(); al = np.pad(al, 1)
# contorno 1 px oscuro alrededor del alfa binario
pad = np.pad(al, 1); ring = ~al & (pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:])
arr[ring] = (18, 12, 22)
out = np.dstack([arr, np.where(al | ring, 255, 0).astype(np.uint8)])
Image.fromarray(out, 'RGBA').save(R + 'assets/vfx/ciudad/' + OUTF)
print(out.shape)
