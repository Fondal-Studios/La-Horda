#!/usr/bin/env python3
"""Decorados centrales de arena (Runway, vista cenital) -> decal de suelo en escala nativa. Uso: build-centro-arena.py infernal|acuatica|laberinto|fortaleza
Quita el croma por relleno desde los bordes (+ mayor componente), erosiona 1 px, aplasta en Y a la proporción oblicua del juego
(el rectángulo destino ya la tiene), reduce con BOX premultiplicado, cuantiza (<=56 tonos), alfa binario. Se dibuja x2 sobre el mismo
rectángulo del decal procedural (js/rendering/arena.js DECAL_PAINTED). Determinista, 0 créditos."""
import os, sys, numpy as np
from collections import deque
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')) + '/'
CFG = {'infernal': ('infernal/infernal_centro', 'assets/vfx/infernal/centro_pentagrama.png', (266, 190)),
       'acuatica': ('acuatica/acuatica_centro', 'assets/vfx/acuatica/centro_templo.png', (306, 207)),
       'laberinto': ('laberinto/laberinto_centro', 'assets/vfx/laberinto/centro_medallon.png', (357, 246)),
       'fortaleza': ('fortaleza/fort_rejilla_lava', 'assets/vfx/fortaleza/rejilla_lava.png', (72, 72))}
src, dst, (W, H) = CFG[sys.argv[1]]
a = np.asarray(Image.open(R + 'art-source/runway-world/%s/master.png' % src).convert('RGB')).astype(int); h, w, _ = a.shape
edge = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
bg = np.median(edge, axis=0)
near = np.abs(a - bg).sum(2) < 75
if sys.argv[1] in ('laberinto', 'fortaleza'): near |= (a[:, :, 1] > a[:, :, 0] + 35) & (a[:, :, 1] > a[:, :, 2] + 35)   # sombra verde del croma
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
m = ~seen
# mayor componente (4-conexo): descarta motas sueltas del fondo
lab = np.zeros((h, w), np.int32); best = (0, 0); n = 0
for y0 in range(h):
    for x0 in range(w):
        if m[y0, x0] and not lab[y0, x0]:
            n += 1; lab[y0, x0] = n; qq = deque([(y0, x0)]); c = 0
            while qq:
                cy, cx = qq.popleft(); c += 1
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not lab[ny, nx]: lab[ny, nx] = n; qq.append((ny, nx))
            if c > best[0]: best = (c, n)
m = lab == best[1]
pm = np.pad(m, 1); m = m & pm[:-2, 1:-1] & pm[2:, 1:-1] & pm[1:-1, :-2] & pm[1:-1, 2:]
ys, xs = np.where(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
mf = m[y0:y1, x0:x1].astype(np.float32); cf = a[y0:y1, x0:x1].astype(np.float32) * mf[..., None]
A = np.asarray(Image.fromarray(mf, 'F').resize((W, H), Image.BOX))
C = np.stack([np.asarray(Image.fromarray(cf[..., i], 'F').resize((W, H), Image.BOX)) for i in range(3)], -1)
C = np.clip(C / np.maximum(A[..., None], 1e-3), 0, 255).astype(np.uint8)
al = A >= 0.5
rgb = np.asarray(Image.fromarray(C).quantize(56, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB'))
Image.fromarray(np.dstack([rgb, np.where(al, 255, 0).astype(np.uint8)]), 'RGBA').save(R + dst)
print(dst, W, H)
